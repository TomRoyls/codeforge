import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

import { parseConfigFile } from '../../../src/config/parser';
import { CLIError } from '../../../src/utils/errors';

describe('parseConfigFile', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'codeforge-config-'));
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {}
  });

  describe('JSON config files', () => {
    test('parses valid .codeforgerc.json', async () => {
      const configPath = path.join(tempDir, '.codeforgerc.json');
      await fs.writeFile(configPath, JSON.stringify({ files: ['src/**/*.ts'] }));

      const config = await parseConfigFile(configPath);

      expect(config.files).toEqual(['src/**/*.ts']);
    });

    test('parses .codeforgerc without extension', async () => {
      const configPath = path.join(tempDir, '.codeforgerc');
      await fs.writeFile(configPath, JSON.stringify({ ignore: ['dist/**'] }));

      const config = await parseConfigFile(configPath);

      expect(config.ignore).toEqual(['dist/**']);
    });

    test('parses codeforge.json', async () => {
      const configPath = path.join(tempDir, 'codeforge.json');
      await fs.writeFile(
        configPath,
        JSON.stringify({
          files: ['**/*.ts'],
          rules: { 'max-complexity': 'error' },
        })
      );

      const config = await parseConfigFile(configPath);

      expect(config.files).toEqual(['**/*.ts']);
      expect(config.rules).toEqual({ 'max-complexity': 'error' });
    });

    test('throws CLIError for invalid JSON', async () => {
      const configPath = path.join(tempDir, '.codeforgerc.json');
      await fs.writeFile(configPath, '{ invalid json }');

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError);
      await expect(parseConfigFile(configPath)).rejects.toThrow('Invalid JSON');
    });

    test('throws CLIError for missing file', async () => {
      const configPath = path.join(tempDir, 'nonexistent.json');

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError);
      await expect(parseConfigFile(configPath)).rejects.toThrow('Config file not found');
    });

    test('parses empty JSON config', async () => {
      const configPath = path.join(tempDir, '.codeforgerc.json');
      await fs.writeFile(configPath, '{}');

      const config = await parseConfigFile(configPath);

      expect(config).toEqual({});
    });
  });

  describe('JavaScript config files', () => {
    test('parses codeforge.config.js with module.exports', async () => {
      const configPath = path.join(tempDir, 'codeforge.config.js');
      await fs.writeFile(
        configPath,
        `
        module.exports = {
          files: ['src/**/*.ts'],
          ignore: ['node_modules/**']
        };
      `
      );

      const config = await parseConfigFile(configPath);

      expect(config.files).toEqual(['src/**/*.ts']);
      expect(config.ignore).toEqual(['node_modules/**']);
    });

    test('parses config with export default', async () => {
      const configPath = path.join(tempDir, 'codeforge.config.js');
      await fs.writeFile(
        configPath,
        `
        export default {
          files: ['**/*.js'],
          rules: { 'no-eval': 'error' }
        };
      `
      );

      const config = await parseConfigFile(configPath);

      expect(config.files).toEqual(['**/*.js']);
      expect(config.rules).toEqual({ 'no-eval': 'error' });
    });

    test('throws CLIError for invalid JS config (non-object export)', async () => {
      const configPath = path.join(tempDir, 'invalid.config.js');
      await fs.writeFile(configPath, 'module.exports = "not an object";');

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError);
      await expect(parseConfigFile(configPath)).rejects.toThrow('Config must be an object');
    });

    test('throws CLIError for JS config exporting null', async () => {
      const configPath = path.join(tempDir, 'null.config.js');
      await fs.writeFile(configPath, 'module.exports = null;');

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError);
      await expect(parseConfigFile(configPath)).rejects.toThrow('Config exported null or undefined');
    });

    test('throws CLIError for JS config exporting array', async () => {
      const configPath = path.join(tempDir, 'array.config.js');
      await fs.writeFile(configPath, 'module.exports = ["item1", "item2"];');

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError);
      await expect(parseConfigFile(configPath)).rejects.toThrow('Config must be an object');
    });

    test('throws CLIError for JS config with syntax error', async () => {
      const configPath = path.join(tempDir, 'syntax-error.config.js');
      await fs.writeFile(configPath, 'module.exports = { invalid syntax };');

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError);
      await expect(parseConfigFile(configPath)).rejects.toThrow('Failed to load JavaScript config file');
    });
  });

  describe('error handling', () => {
    test('CLIError has helpful suggestions for missing file', async () => {
      const configPath = path.join(tempDir, 'missing.json');

      try {
        await parseConfigFile(configPath);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(CLIError);
        const cliError = error as CLIError;
        expect(cliError.suggestions.length).toBeGreaterThan(0);
        expect(cliError.code).toBe('E003');
      }
    });

    test('CLIError has helpful suggestions for invalid JSON', async () => {
      const configPath = path.join(tempDir, 'invalid.json');
      await fs.writeFile(configPath, '{ broken }');

      try {
        await parseConfigFile(configPath);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(CLIError);
        const cliError = error as CLIError;
        expect(cliError.suggestions.length).toBeGreaterThan(0);
      }
    });
  });
});
