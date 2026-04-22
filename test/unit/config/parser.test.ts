import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'

import { parseConfigFile } from '../../../src/config/parser'
import { CLIError } from '../../../src/utils/errors'

describe('parseConfigFile', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'codeforge-config-'))
  })

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true })
    } catch {}
  })

  describe('JSON config files', () => {
    test('parses valid .codeforgerc.json', async () => {
      const configPath = path.join(tempDir, '.codeforgerc.json')
      await fs.writeFile(configPath, JSON.stringify({ files: ['src/**/*.ts'] }))

      const config = await parseConfigFile(configPath)

      expect(config.files).toEqual(['src/**/*.ts'])
    })

    test('parses .codeforgerc without extension', async () => {
      const configPath = path.join(tempDir, '.codeforgerc')
      await fs.writeFile(configPath, JSON.stringify({ ignore: ['dist/**'] }))

      const config = await parseConfigFile(configPath)

      expect(config.ignore).toEqual(['dist/**'])
    })

    test('parses codeforge.json', async () => {
      const configPath = path.join(tempDir, 'codeforge.json')
      await fs.writeFile(
        configPath,
        JSON.stringify({
          files: ['**/*.ts'],
          rules: { 'max-complexity': 'error' },
        }),
      )

      const config = await parseConfigFile(configPath)

      expect(config.files).toEqual(['**/*.ts'])
      expect(config.rules).toEqual({ 'max-complexity': 'error' })
    })

    test('throws CLIError for invalid JSON', async () => {
      const configPath = path.join(tempDir, '.codeforgerc.json')
      await fs.writeFile(configPath, '{ invalid json }')

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
      await expect(parseConfigFile(configPath)).rejects.toThrow('Invalid JSON')
    })

    test('throws CLIError for missing file', async () => {
      const configPath = path.join(tempDir, 'nonexistent.json')

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
      await expect(parseConfigFile(configPath)).rejects.toThrow('Config file not found')
    })

    test('parses empty JSON config', async () => {
      const configPath = path.join(tempDir, '.codeforgerc.json')
      await fs.writeFile(configPath, '{}')

      const config = await parseConfigFile(configPath)

      expect(config).toEqual({})
    })
  })

  describe('JavaScript config files', () => {
    test('parses codeforge.config.js with module.exports', async () => {
      const configPath = path.join(tempDir, 'codeforge.config.js')
      await fs.writeFile(
        configPath,
        `
        module.exports = {
          files: ['src/**/*.ts'],
          ignore: ['node_modules/**']
        };
      `,
      )

      const config = await parseConfigFile(configPath)

      expect(config.files).toEqual(['src/**/*.ts'])
      expect(config.ignore).toEqual(['node_modules/**'])
    })

    test('parses config with export default', async () => {
      const configPath = path.join(tempDir, 'codeforge.config.js')
      await fs.writeFile(
        configPath,
        `
        export default {
          files: ['**/*.js'],
          rules: { 'no-eval': 'error' }
        };
      `,
      )

      const config = await parseConfigFile(configPath)

      expect(config.files).toEqual(['**/*.js'])
      expect(config.rules).toEqual({ 'no-eval': 'error' })
    })

    test('throws CLIError for invalid JS config (non-object export)', async () => {
      const configPath = path.join(tempDir, 'invalid.config.js')
      await fs.writeFile(configPath, 'module.exports = "not an object";')

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
      await expect(parseConfigFile(configPath)).rejects.toThrow('Config must be an object')
    })

    test('throws CLIError for JS config exporting null', async () => {
      const configPath = path.join(tempDir, 'null.config.js')
      await fs.writeFile(configPath, 'module.exports = null;')

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
      await expect(parseConfigFile(configPath)).rejects.toThrow('Config exported null or undefined')
    })

    test('throws CLIError for JS config exporting array', async () => {
      const configPath = path.join(tempDir, 'array.config.js')
      await fs.writeFile(configPath, 'module.exports = ["item1", "item2"];')

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
      await expect(parseConfigFile(configPath)).rejects.toThrow('Config must be an object')
    })

    test('throws CLIError for JS config with syntax error', async () => {
      const configPath = path.join(tempDir, 'syntax-error.config.js')
      await fs.writeFile(configPath, 'module.exports = { invalid syntax };')

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
      await expect(parseConfigFile(configPath)).rejects.toThrow(
        'Failed to load JavaScript config file',
      )
    })
  })

  describe('error handling', () => {
    test('CLIError has helpful suggestions for missing file', async () => {
      const configPath = path.join(tempDir, 'missing.json')

      try {
        await parseConfigFile(configPath)
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(CLIError)
        const cliError = error as CLIError
        expect(cliError.suggestions.length).toBeGreaterThan(0)
        expect(cliError.code).toBe('E003')
      }
    })

    test('CLIError has helpful suggestions for invalid JSON', async () => {
      const configPath = path.join(tempDir, 'invalid.json')
      await fs.writeFile(configPath, '{ broken }')

      try {
        await parseConfigFile(configPath)
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(CLIError)
        const cliError = error as CLIError
        expect(cliError.suggestions.length).toBeGreaterThan(0)
      }
    })

    test('throws CLIError for config that is an array', async () => {
      const configPath = path.join(tempDir, 'array-config.json')
      await fs.writeFile(configPath, JSON.stringify(['item1', 'item2']))

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
      await expect(parseConfigFile(configPath)).rejects.toThrow('Config must be an object')
    })
  })

  describe('JSON config field combinations', () => {
    test('parses config with plugins field', async () => {
      const configPath = path.join(tempDir, '.codeforgerc.json')
      await fs.writeFile(configPath, JSON.stringify({ plugins: ['codeforge-plugin-custom'] }))

      const config = await parseConfigFile(configPath)

      expect(config.plugins).toEqual(['codeforge-plugin-custom'])
    })

    test('parses config with rules as severity-option arrays', async () => {
      const configPath = path.join(tempDir, '.codeforgerc.json')
      await fs.writeFile(
        configPath,
        JSON.stringify({
          rules: { 'max-params': ['error', { max: 5 }], 'no-eval': 'warn' },
        }),
      )

      const config = await parseConfigFile(configPath)

      expect(config.rules).toEqual({
        'max-params': ['error', { max: 5 }],
        'no-eval': 'warn',
      })
    })

    test('parses config with all fields combined', async () => {
      const configPath = path.join(tempDir, '.codeforgerc.json')
      await fs.writeFile(
        configPath,
        JSON.stringify({
          files: ['src/**/*.ts'],
          ignore: ['dist/**'],
          plugins: ['codeforge-plugin-foo'],
          rules: { 'no-eval': 'error' },
        }),
      )

      const config = await parseConfigFile(configPath)

      expect(config.files).toEqual(['src/**/*.ts'])
      expect(config.ignore).toEqual(['dist/**'])
      expect(config.plugins).toEqual(['codeforge-plugin-foo'])
      expect(config.rules).toEqual({ 'no-eval': 'error' })
    })

    test('parses config with only rules field', async () => {
      const configPath = path.join(tempDir, '.codeforgerc.json')
      await fs.writeFile(configPath, JSON.stringify({ rules: { 'prefer-const': 'warn' } }))

      const config = await parseConfigFile(configPath)

      expect(config.rules).toEqual({ 'prefer-const': 'warn' })
      expect(config.files).toBeUndefined()
      expect(config.ignore).toBeUndefined()
    })

    test('parses config with empty files array', async () => {
      const configPath = path.join(tempDir, '.codeforgerc.json')
      await fs.writeFile(configPath, JSON.stringify({ files: [] }))

      const config = await parseConfigFile(configPath)

      expect(config.files).toEqual([])
    })

    test('parses config with empty rules object', async () => {
      const configPath = path.join(tempDir, '.codeforgerc.json')
      await fs.writeFile(configPath, JSON.stringify({ rules: {} }))

      const config = await parseConfigFile(configPath)

      expect(config.rules).toEqual({})
    })
  })

  describe('JSON config edge cases', () => {
    test('parses pretty-printed JSON with whitespace', async () => {
      const configPath = path.join(tempDir, '.codeforgerc.json')
      const prettyJson = JSON.stringify({ files: ['src/**/*.ts'], ignore: ['dist/**'] }, null, 2)
      await fs.writeFile(configPath, prettyJson)

      const config = await parseConfigFile(configPath)

      expect(config.files).toEqual(['src/**/*.ts'])
      expect(config.ignore).toEqual(['dist/**'])
    })

    test('parses .codeforge.json extension', async () => {
      const configPath = path.join(tempDir, '.codeforge.json')
      await fs.writeFile(configPath, JSON.stringify({ files: ['**/*.js'] }))

      const config = await parseConfigFile(configPath)

      expect(config.files).toEqual(['**/*.js'])
    })

    test('throws CLIError for JSON null value', async () => {
      const configPath = path.join(tempDir, 'null-config.json')
      await fs.writeFile(configPath, 'null')

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
      await expect(parseConfigFile(configPath)).rejects.toThrow('Config exported null or undefined')
    })

    test('throws CLIError for JSON boolean value', async () => {
      const configPath = path.join(tempDir, 'bool-config.json')
      await fs.writeFile(configPath, 'true')

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
      await expect(parseConfigFile(configPath)).rejects.toThrow('Config must be an object')
    })

    test('throws CLIError for JSON string value', async () => {
      const configPath = path.join(tempDir, 'string-config.json')
      await fs.writeFile(configPath, '"just a string"')

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
      await expect(parseConfigFile(configPath)).rejects.toThrow('Config must be an object')
    })
  })

  describe('error details', () => {
    test('CLIError has E003 code for invalid JSON', async () => {
      const configPath = path.join(tempDir, 'bad.json')
      await fs.writeFile(configPath, '{ broken }')

      try {
        await parseConfigFile(configPath)
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(CLIError)
        expect((error as CLIError).code).toBe('E003')
      }
    })

    test('CLIError has E003 code for array config', async () => {
      const configPath = path.join(tempDir, 'arr.json')
      await fs.writeFile(configPath, JSON.stringify([1, 2, 3]))

      try {
        await parseConfigFile(configPath)
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(CLIError)
        expect((error as CLIError).code).toBe('E003')
      }
    })

    test('error message includes file path for missing file', async () => {
      const configPath = path.join(tempDir, 'gone.json')

      try {
        await parseConfigFile(configPath)
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(CLIError)
        expect((error as CLIError).message).toContain('gone.json')
      }
    })

    test('error message includes file path for invalid JSON', async () => {
      const configPath = path.join(tempDir, 'broken.json')
      await fs.writeFile(configPath, '{ not valid }')

      try {
        await parseConfigFile(configPath)
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(CLIError)
        expect((error as CLIError).message).toContain('broken.json')
      }
    })
  })

  describe('JS config patterns', () => {
    test('parses JS config with named config export', async () => {
      const configPath = path.join(tempDir, 'codeforge.config.js')
      await fs.writeFile(
        configPath,
        `
        export const config = {
          files: ['src/**/*.ts'],
          rules: { 'no-debugger': 'error' }
        };
      `,
      )

      const config = await parseConfigFile(configPath)

      expect(config.files).toEqual(['src/**/*.ts'])
      expect(config.rules).toEqual({ 'no-debugger': 'error' })
    })

    test('parses JS config with only named exports (fallback to module)', async () => {
      const configPath = path.join(tempDir, 'codeforge.config.js')
      await fs.writeFile(
        configPath,
        `
        export const files = ['**/*.ts'];
        export const ignore = ['coverage/**'];
      `,
      )

      const config = await parseConfigFile(configPath)

      expect(config.files).toEqual(['**/*.ts'])
      expect(config.ignore).toEqual(['coverage/**'])
    })
  })

  describe('sequential parsing', () => {
    test('multiple sequential parses return independent results', async () => {
      const configPath1 = path.join(tempDir, 'config-a.json')
      const configPath2 = path.join(tempDir, 'config-b.json')
      await fs.writeFile(configPath1, JSON.stringify({ files: ['src/**/*.ts'] }))
      await fs.writeFile(configPath2, JSON.stringify({ ignore: ['dist/**'] }))

      const config1 = await parseConfigFile(configPath1)
      const config2 = await parseConfigFile(configPath2)

      expect(config1.files).toEqual(['src/**/*.ts'])
      expect(config1.ignore).toBeUndefined()
      expect(config2.files).toBeUndefined()
      expect(config2.ignore).toEqual(['dist/**'])
    })
  })

  describe('JSON config with single fields', () => {
    test('parses config with only plugins field', async () => {
      const configPath = path.join(tempDir, '.codeforgerc.json')
      await fs.writeFile(configPath, JSON.stringify({ plugins: ['@scope/codeforge-plugin-foo'] }))

      const config = await parseConfigFile(configPath)

      expect(config.plugins).toEqual(['@scope/codeforge-plugin-foo'])
      expect(config.files).toBeUndefined()
      expect(config.ignore).toBeUndefined()
      expect(config.rules).toBeUndefined()
    })

    test('parses config with only ignore field', async () => {
      const configPath = path.join(tempDir, '.codeforgerc.json')
      await fs.writeFile(configPath, JSON.stringify({ ignore: ['dist/**', 'build/**'] }))

      const config = await parseConfigFile(configPath)

      expect(config.ignore).toEqual(['dist/**', 'build/**'])
      expect(config.files).toBeUndefined()
    })

    test('parses config with empty plugins array', async () => {
      const configPath = path.join(tempDir, '.codeforgerc.json')
      await fs.writeFile(configPath, JSON.stringify({ plugins: [] }))

      const config = await parseConfigFile(configPath)

      expect(config.plugins).toEqual([])
    })

    test('parses config with empty ignore array', async () => {
      const configPath = path.join(tempDir, '.codeforgerc.json')
      await fs.writeFile(configPath, JSON.stringify({ ignore: [] }))

      const config = await parseConfigFile(configPath)

      expect(config.ignore).toEqual([])
    })

    test('parses config with only files field', async () => {
      const configPath = path.join(tempDir, '.codeforgerc.json')
      await fs.writeFile(configPath, JSON.stringify({ files: ['lib/**/*.js'] }))

      const config = await parseConfigFile(configPath)

      expect(config.files).toEqual(['lib/**/*.js'])
      expect(config.ignore).toBeUndefined()
      expect(config.plugins).toBeUndefined()
    })
  })

  describe('JSON config with many entries', () => {
    test('parses config with many file patterns', async () => {
      const patterns = ['src/**/*.ts', 'lib/**/*.js', 'test/**/*.test.ts', 'bin/**/*.js']
      const configPath = path.join(tempDir, '.codeforgerc.json')
      await fs.writeFile(configPath, JSON.stringify({ files: patterns }))

      const config = await parseConfigFile(configPath)

      expect(config.files).toEqual(patterns)
    })

    test('parses config with many rules', async () => {
      const rules = {
        'no-eval': 'error',
        'prefer-const': 'warn',
        'max-params': ['error', { max: 5 }],
        'no-debugger': 'error',
        'no-console': 'warn',
      }
      const configPath = path.join(tempDir, '.codeforgerc.json')
      await fs.writeFile(configPath, JSON.stringify({ rules }))

      const config = await parseConfigFile(configPath)

      expect(config.rules).toEqual(rules)
    })

    test('parses config with many plugins', async () => {
      const plugins = ['codeforge-plugin-a', '@scope/codeforge-plugin-b', 'codeforge-plugin-c']
      const configPath = path.join(tempDir, '.codeforgerc.json')
      await fs.writeFile(configPath, JSON.stringify({ plugins }))

      const config = await parseConfigFile(configPath)

      expect(config.plugins).toEqual(plugins)
    })

    test('parses config with many ignore patterns', async () => {
      const ignore = ['node_modules/**', 'dist/**', 'coverage/**', '.git/**', '*.min.js']
      const configPath = path.join(tempDir, '.codeforgerc.json')
      await fs.writeFile(configPath, JSON.stringify({ ignore }))

      const config = await parseConfigFile(configPath)

      expect(config.ignore).toEqual(ignore)
    })
  })

  describe('JSON config format variations', () => {
    test('parses minified JSON config', async () => {
      const configPath = path.join(tempDir, '.codeforgerc.json')
      await fs.writeFile(configPath, '{"files":["**/*.ts"],"ignore":["dist/**"]}')

      const config = await parseConfigFile(configPath)

      expect(config.files).toEqual(['**/*.ts'])
      expect(config.ignore).toEqual(['dist/**'])
    })

    test('parses JSON with tab indentation', async () => {
      const configPath = path.join(tempDir, '.codeforgerc.json')
      const tabbedJson = '{\n\t"files": ["**/*.ts"],\n\t"ignore": ["dist/**"]\n}'
      await fs.writeFile(configPath, tabbedJson)

      const config = await parseConfigFile(configPath)

      expect(config.files).toEqual(['**/*.ts'])
      expect(config.ignore).toEqual(['dist/**'])
    })

    test('parses JSON with 4-space indentation', async () => {
      const configPath = path.join(tempDir, '.codeforgerc.json')
      const indentedJson = JSON.stringify({ files: ['**/*.ts'] }, null, 4)
      await fs.writeFile(configPath, indentedJson)

      const config = await parseConfigFile(configPath)

      expect(config.files).toEqual(['**/*.ts'])
    })

    test('parses JSON with deeply nested rule options', async () => {
      const configPath = path.join(tempDir, '.codeforgerc.json')
      await fs.writeFile(
        configPath,
        JSON.stringify({
          rules: {
            'max-complexity': ['error', { max: 10, threshold: 5 }],
            'no-eval': ['warn', { allowIndirect: false }],
          },
        }),
      )

      const config = await parseConfigFile(configPath)

      expect(config.rules).toEqual({
        'max-complexity': ['error', { max: 10, threshold: 5 }],
        'no-eval': ['warn', { allowIndirect: false }],
      })
    })
  })

  describe('JSON config special values', () => {
    test('parses config with unicode in file patterns', async () => {
      const configPath = path.join(tempDir, '.codeforgerc.json')
      await fs.writeFile(configPath, JSON.stringify({ files: ['src/**/*.ts'] }))

      const config = await parseConfigFile(configPath)

      expect(config.files).toEqual(['src/**/*.ts'])
    })

    test('parses config with special glob patterns', async () => {
      const configPath = path.join(tempDir, '.codeforgerc.json')
      await fs.writeFile(
        configPath,
        JSON.stringify({
          files: ['**/*.ts', 'src/**/test/*.js', '[abc]/**/*.ts'],
          ignore: ['!src/keep/**'],
        }),
      )

      const config = await parseConfigFile(configPath)

      expect(config.files).toEqual(['**/*.ts', 'src/**/test/*.js', '[abc]/**/*.ts'])
      expect(config.ignore).toEqual(['!src/keep/**'])
    })

    test('parses config with rules using error severity', async () => {
      const configPath = path.join(tempDir, '.codeforgerc.json')
      await fs.writeFile(configPath, JSON.stringify({ rules: { 'no-eval': 'error' } }))

      const config = await parseConfigFile(configPath)

      expect(config.rules).toEqual({ 'no-eval': 'error' })
    })

    test('parses config with rules using warn severity', async () => {
      const configPath = path.join(tempDir, '.codeforgerc.json')
      await fs.writeFile(configPath, JSON.stringify({ rules: { 'prefer-const': 'warn' } }))

      const config = await parseConfigFile(configPath)

      expect(config.rules).toEqual({ 'prefer-const': 'warn' })
    })

    test('parses config with rules using off severity', async () => {
      const configPath = path.join(tempDir, '.codeforgerc.json')
      await fs.writeFile(configPath, JSON.stringify({ rules: { 'no-console': 'off' } }))

      const config = await parseConfigFile(configPath)

      expect(config.rules).toEqual({ 'no-console': 'off' })
    })
  })

  describe('JSON invalid value types', () => {
    test('throws CLIError for JSON number value', async () => {
      const configPath = path.join(tempDir, 'number-config.json')
      await fs.writeFile(configPath, '42')

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
      await expect(parseConfigFile(configPath)).rejects.toThrow('Config must be an object')
    })

    test('throws CLIError for JSON zero value', async () => {
      const configPath = path.join(tempDir, 'zero-config.json')
      await fs.writeFile(configPath, '0')

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
      await expect(parseConfigFile(configPath)).rejects.toThrow('Config must be an object')
    })

    test('throws CLIError for JSON negative number value', async () => {
      const configPath = path.join(tempDir, 'negative-config.json')
      await fs.writeFile(configPath, '-1')

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
      await expect(parseConfigFile(configPath)).rejects.toThrow('Config must be an object')
    })

    test('throws CLIError for false boolean value', async () => {
      const configPath = path.join(tempDir, 'false-config.json')
      await fs.writeFile(configPath, 'false')

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
      await expect(parseConfigFile(configPath)).rejects.toThrow('Config must be an object')
    })

    test('throws CLIError for empty string value', async () => {
      const configPath = path.join(tempDir, 'emptystr-config.json')
      await fs.writeFile(configPath, '""')

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
      await expect(parseConfigFile(configPath)).rejects.toThrow('Config must be an object')
    })
  })

  describe('JSON error code validation', () => {
    test('CLIError has E003 code for null config', async () => {
      const configPath = path.join(tempDir, 'null.json')
      await fs.writeFile(configPath, 'null')

      try {
        await parseConfigFile(configPath)
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(CLIError)
        expect((error as CLIError).code).toBe('E003')
      }
    })

    test('CLIError has E003 code for boolean config', async () => {
      const configPath = path.join(tempDir, 'bool.json')
      await fs.writeFile(configPath, 'true')

      try {
        await parseConfigFile(configPath)
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(CLIError)
        expect((error as CLIError).code).toBe('E003')
      }
    })

    test('CLIError has E003 code for string config', async () => {
      const configPath = path.join(tempDir, 'str.json')
      await fs.writeFile(configPath, '"hello"')

      try {
        await parseConfigFile(configPath)
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(CLIError)
        expect((error as CLIError).code).toBe('E003')
      }
    })

    test('CLIError has E003 code for number config', async () => {
      const configPath = path.join(tempDir, 'num.json')
      await fs.writeFile(configPath, '99')

      try {
        await parseConfigFile(configPath)
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(CLIError)
        expect((error as CLIError).code).toBe('E003')
      }
    })
  })

  describe('error message content', () => {
    test('error message includes file path for null config', async () => {
      const configPath = path.join(tempDir, 'thenull.json')
      await fs.writeFile(configPath, 'null')

      try {
        await parseConfigFile(configPath)
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(CLIError)
        expect((error as CLIError).message).toContain('thenull.json')
      }
    })

    test('error message includes file path for boolean config', async () => {
      const configPath = path.join(tempDir, 'thebool.json')
      await fs.writeFile(configPath, 'true')

      try {
        await parseConfigFile(configPath)
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(CLIError)
        expect((error as CLIError).message).toContain('thebool.json')
      }
    })

    test('error message includes file path for array config', async () => {
      const configPath = path.join(tempDir, 'thearr.json')
      await fs.writeFile(configPath, '[1, 2, 3]')

      try {
        await parseConfigFile(configPath)
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(CLIError)
        expect((error as CLIError).message).toContain('thearr.json')
      }
    })

    test('error message reports array type for array config', async () => {
      const configPath = path.join(tempDir, 'typedarr.json')
      await fs.writeFile(configPath, '[1]')

      try {
        await parseConfigFile(configPath)
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(CLIError)
        expect((error as CLIError).message).toContain('array')
      }
    })

    test('error message reports boolean type for boolean config', async () => {
      const configPath = path.join(tempDir, 'typedbool.json')
      await fs.writeFile(configPath, 'true')

      try {
        await parseConfigFile(configPath)
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(CLIError)
        expect((error as CLIError).message).toContain('boolean')
      }
    })

    test('error message reports string type for string config', async () => {
      const configPath = path.join(tempDir, 'typedstr.json')
      await fs.writeFile(configPath, '"text"')

      try {
        await parseConfigFile(configPath)
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(CLIError)
        expect((error as CLIError).message).toContain('string')
      }
    })

    test('error message reports number type for number config', async () => {
      const configPath = path.join(tempDir, 'typednum.json')
      await fs.writeFile(configPath, '42')

      try {
        await parseConfigFile(configPath)
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(CLIError)
        expect((error as CLIError).message).toContain('number')
      }
    })
  })

  describe('CLIError suggestions', () => {
    test('missing file error has file-not-found suggestions', async () => {
      const configPath = path.join(tempDir, 'nofile.json')

      try {
        await parseConfigFile(configPath)
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(CLIError)
        const suggestions = (error as CLIError).suggestions
        expect(suggestions.some((s) => s.toLowerCase().includes('path'))).toBe(true)
      }
    })

    test('invalid JSON error has syntax suggestions', async () => {
      const configPath = path.join(tempDir, 'badsyntax.json')
      await fs.writeFile(configPath, '{ broken')

      try {
        await parseConfigFile(configPath)
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(CLIError)
        const suggestions = (error as CLIError).suggestions
        expect(suggestions.some((s) => s.toLowerCase().includes('json'))).toBe(true)
      }
    })

    test('null config error has export suggestions', async () => {
      const configPath = path.join(tempDir, 'nullval.json')
      await fs.writeFile(configPath, 'null')

      try {
        await parseConfigFile(configPath)
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(CLIError)
        const suggestions = (error as CLIError).suggestions
        expect(suggestions.some((s) => s.includes('export'))).toBe(true)
      }
    })

    test('array config error has object suggestions', async () => {
      const configPath = path.join(tempDir, 'arrval.json')
      await fs.writeFile(configPath, '[]')

      try {
        await parseConfigFile(configPath)
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(CLIError)
        const suggestions = (error as CLIError).suggestions
        expect(suggestions.some((s) => s.includes('object'))).toBe(true)
      }
    })
  })

  describe('JS config additional patterns', () => {
    test('parses JS config with empty object export', async () => {
      const configPath = path.join(tempDir, 'empty.config.js')
      await fs.writeFile(configPath, 'module.exports = {};')

      const config = await parseConfigFile(configPath)

      expect(config).toEqual({})
    })

    test('throws CLIError for JS config exporting undefined', async () => {
      const configPath = path.join(tempDir, 'undef.config.js')
      await fs.writeFile(configPath, 'module.exports = undefined;')

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
      await expect(parseConfigFile(configPath)).rejects.toThrow('Config exported null or undefined')
    })

    test('throws CLIError for JS config exporting a number', async () => {
      const configPath = path.join(tempDir, 'num.config.js')
      await fs.writeFile(configPath, 'module.exports = 42;')

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
      await expect(parseConfigFile(configPath)).rejects.toThrow('Config must be an object')
    })

    test('JS config syntax error includes file path', async () => {
      const configPath = path.join(tempDir, 'synerr.config.js')
      await fs.writeFile(configPath, 'module.exports = { invalid syntax };')

      try {
        await parseConfigFile(configPath)
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(CLIError)
        expect((error as CLIError).message).toContain('synerr.config.js')
      }
    })

    test('JS config null export has helpful suggestions', async () => {
      const configPath = path.join(tempDir, 'jsnull.config.js')
      await fs.writeFile(configPath, 'module.exports = null;')

      try {
        await parseConfigFile(configPath)
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(CLIError)
        const suggestions = (error as CLIError).suggestions
        expect(suggestions.length).toBeGreaterThan(0)
        expect(suggestions.some((s) => s.includes('export'))).toBe(true)
      }
    })

    test('parses JS config with only files field', async () => {
      const configPath = path.join(tempDir, 'files-only.config.js')
      await fs.writeFile(
        configPath,
        `
        module.exports = {
          files: ['src/**/*.ts']
        };
      `,
      )

      const config = await parseConfigFile(configPath)

      expect(config.files).toEqual(['src/**/*.ts'])
      expect(config.ignore).toBeUndefined()
      expect(config.rules).toBeUndefined()
    })

    test('parses JS config with only ignore field', async () => {
      const configPath = path.join(tempDir, 'ignore-only.config.js')
      await fs.writeFile(
        configPath,
        `
        module.exports = {
          ignore: ['node_modules/**', 'dist/**']
        };
      `,
      )

      const config = await parseConfigFile(configPath)

      expect(config.ignore).toEqual(['node_modules/**', 'dist/**'])
      expect(config.files).toBeUndefined()
    })

    test('parses JS config with all fields', async () => {
      const configPath = path.join(tempDir, 'full.config.js')
      await fs.writeFile(
        configPath,
        `
        module.exports = {
          files: ['src/**/*.ts'],
          ignore: ['dist/**'],
          plugins: ['codeforge-plugin-x'],
          rules: { 'no-eval': 'error' }
        };
      `,
      )

      const config = await parseConfigFile(configPath)

      expect(config.files).toEqual(['src/**/*.ts'])
      expect(config.ignore).toEqual(['dist/**'])
      expect(config.plugins).toEqual(['codeforge-plugin-x'])
      expect(config.rules).toEqual({ 'no-eval': 'error' })
    })
  })

  describe('JSON config additional edge cases', () => {
    test('throws CLIError for whitespace-only file content', async () => {
      const configPath = path.join(tempDir, 'whitespace.json')
      await fs.writeFile(configPath, '   \n\t  ')

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
      await expect(parseConfigFile(configPath)).rejects.toThrow('Invalid JSON')
    })

    test('throws CLIError for JSON with trailing content', async () => {
      const configPath = path.join(tempDir, 'trailing.json')
      await fs.writeFile(configPath, '{}extra')

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
    })

    test('parses config with escaped characters in string values', async () => {
      const configPath = path.join(tempDir, '.codeforgerc.json')
      await fs.writeFile(
        configPath,
        JSON.stringify({ files: ['src/**\\/nested\\/*.ts', 'path/with\\"quote'] }),
      )

      const config = await parseConfigFile(configPath)

      expect(config.files).toEqual(['src/**\\/nested\\/*.ts', 'path/with\\"quote'])
    })

    test('parses config with unknown extra fields', async () => {
      const configPath = path.join(tempDir, '.codeforgerc.json')
      await fs.writeFile(
        configPath,
        JSON.stringify({
          files: ['src/**/*.ts'],
          customField: 'custom-value',
          anotherUnknown: 42,
        }),
      )

      const config = await parseConfigFile(configPath)

      expect(config.files).toEqual(['src/**/*.ts'])
      expect((config as Record<string, unknown>).customField).toBe('custom-value')
      expect((config as Record<string, unknown>).anotherUnknown).toBe(42)
    })

    test('parses config with single-element files array', async () => {
      const configPath = path.join(tempDir, '.codeforgerc.json')
      await fs.writeFile(configPath, JSON.stringify({ files: ['**/*.ts'] }))

      const config = await parseConfigFile(configPath)

      expect(config.files).toEqual(['**/*.ts'])
      expect(config.files).toHaveLength(1)
    })

    test('parses config with single-element ignore array', async () => {
      const configPath = path.join(tempDir, '.codeforgerc.json')
      await fs.writeFile(configPath, JSON.stringify({ ignore: ['node_modules/**'] }))

      const config = await parseConfigFile(configPath)

      expect(config.ignore).toEqual(['node_modules/**'])
      expect(config.ignore).toHaveLength(1)
    })

    test('parses config with single-element plugins array', async () => {
      const configPath = path.join(tempDir, '.codeforgerc.json')
      await fs.writeFile(configPath, JSON.stringify({ plugins: ['codeforge-plugin-only'] }))

      const config = await parseConfigFile(configPath)

      expect(config.plugins).toEqual(['codeforge-plugin-only'])
      expect(config.plugins).toHaveLength(1)
    })

    test('parses config with single rule', async () => {
      const configPath = path.join(tempDir, '.codeforgerc.json')
      await fs.writeFile(configPath, JSON.stringify({ rules: { 'no-eval': 'error' } }))

      const config = await parseConfigFile(configPath)

      expect(Object.keys(config.rules ?? {})).toHaveLength(1)
    })
  })

  describe('JSON config with special characters in paths', () => {
    test('parses config from directory with spaces in name', async () => {
      const spacedDir = path.join(tempDir, 'my project')
      await fs.mkdir(spacedDir, { recursive: true })
      const configPath = path.join(spacedDir, '.codeforgerc.json')
      await fs.writeFile(configPath, JSON.stringify({ files: ['src/**/*.ts'] }))

      const config = await parseConfigFile(configPath)

      expect(config.files).toEqual(['src/**/*.ts'])
    })

    test('parses config with unicode characters in values', async () => {
      const configPath = path.join(tempDir, '.codeforgerc.json')
      await fs.writeFile(configPath, JSON.stringify({ files: ['源码/**/*.ts', 'src/**/*.ts'] }))

      const config = await parseConfigFile(configPath)

      expect(config.files).toEqual(['源码/**/*.ts', 'src/**/*.ts'])
    })
  })

  describe('JSON config nested rule structures', () => {
    test('parses config with mixed severity formats in rules', async () => {
      const configPath = path.join(tempDir, '.codeforgerc.json')
      await fs.writeFile(
        configPath,
        JSON.stringify({
          rules: {
            'no-eval': 'error',
            'prefer-const': ['warn', { destructuring: 'all' }],
            'no-console': 'off',
            'max-lines': ['error', { max: 300 }],
          },
        }),
      )

      const config = await parseConfigFile(configPath)

      expect(config.rules).toEqual({
        'no-eval': 'error',
        'prefer-const': ['warn', { destructuring: 'all' }],
        'no-console': 'off',
        'max-lines': ['error', { max: 300 }],
      })
    })

    test('parses config with rule using array with empty options', async () => {
      const configPath = path.join(tempDir, '.codeforgerc.json')
      await fs.writeFile(
        configPath,
        JSON.stringify({
          rules: { 'no-eval': ['error'] },
        }),
      )

      const config = await parseConfigFile(configPath)

      expect(config.rules).toEqual({ 'no-eval': ['error'] })
    })

    test('parses config with many combined fields and complex rules', async () => {
      const configPath = path.join(tempDir, '.codeforgerc.json')
      const fullConfig = {
        files: ['src/**/*.ts', 'lib/**/*.js'],
        ignore: ['dist/**', 'coverage/**'],
        plugins: ['codeforge-plugin-a', 'codeforge-plugin-b'],
        rules: {
          'no-eval': 'error',
          'prefer-const': 'warn',
          'max-params': ['error', { max: 5 }],
          'no-debugger': 'error',
        },
      }
      await fs.writeFile(configPath, JSON.stringify(fullConfig))

      const config = await parseConfigFile(configPath)

      expect(config.files).toEqual(fullConfig.files)
      expect(config.ignore).toEqual(fullConfig.ignore)
      expect(config.plugins).toEqual(fullConfig.plugins)
      expect(config.rules).toEqual(fullConfig.rules)
    })
  })

  describe('additional coverage gaps', () => {
    test('throws CLIError for JS config exporting a function', async () => {
      const configPath = path.join(tempDir, 'func.config.js')
      await fs.writeFile(configPath, 'module.exports = function() { return {}; };')

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
      await expect(parseConfigFile(configPath)).rejects.toThrow('Config must be an object')
    })

    test('throws CLIError for JS config with export default being a number', async () => {
      const configPath = path.join(tempDir, 'defaultnum.config.js')
      await fs.writeFile(configPath, 'export default 42;')

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
      await expect(parseConfigFile(configPath)).rejects.toThrow('Config must be an object')
    })

    test('concurrent parses of different JS config files return correct results', async () => {
      const configPath1 = path.join(tempDir, 'conca.config.js')
      const configPath2 = path.join(tempDir, 'concb.config.js')
      await fs.writeFile(configPath1, 'module.exports = { files: ["a/**/*.ts"] };')
      await fs.writeFile(configPath2, 'module.exports = { ignore: ["b/**"] };')

      const [config1, config2] = await Promise.all([
        parseConfigFile(configPath1),
        parseConfigFile(configPath2),
      ])

      expect(config1.files).toEqual(['a/**/*.ts'])
      expect(config2.ignore).toEqual(['b/**'])
    })

    test('JS config with both default and named config export uses default', async () => {
      const configPath = path.join(tempDir, 'priority.config.js')
      await fs.writeFile(
        configPath,
        `
        export default { files: ['default-path/**/*.ts'] };
        export const config = { files: ['named-path/**/*.ts'] };
      `,
      )

      const config = await parseConfigFile(configPath)

      expect(config.files).toEqual(['default-path/**/*.ts'])
    })

    test('throws CLIError for JSON with trailing comma', async () => {
      const configPath = path.join(tempDir, 'trailingcomma.json')
      await fs.writeFile(configPath, '{ "files": ["src/**/*.ts"], }')

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
      await expect(parseConfigFile(configPath)).rejects.toThrow('Invalid JSON')
    })

    test('JS config with config named export as string falls back to module object', async () => {
      const configPath = path.join(tempDir, 'configstr.config.js')
      await fs.writeFile(
        configPath,
        `
        export const config = "not an object";
        export const files = ['src/**/*.ts'];
        export const ignore = ['dist/**'];
      `,
      )

      const config = await parseConfigFile(configPath)

      expect(config.files).toEqual(['src/**/*.ts'])
      expect(config.ignore).toEqual(['dist/**'])
    })

    test('throws CLIError for non-JSON non-JS file extension treated as JSON', async () => {
      const configPath = path.join(tempDir, 'config.yaml')
      await fs.writeFile(configPath, 'files:\n  - src/**/*.ts')

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
      await expect(parseConfigFile(configPath)).rejects.toThrow('Invalid JSON')
    })
  })

  describe('concurrent and repeated parsing', () => {
    test('concurrent parses of different files return correct results', async () => {
      const configPath1 = path.join(tempDir, 'conc-a.json')
      const configPath2 = path.join(tempDir, 'conc-b.json')
      const configPath3 = path.join(tempDir, 'conc-c.json')
      await fs.writeFile(configPath1, JSON.stringify({ files: ['a/**/*.ts'] }))
      await fs.writeFile(configPath2, JSON.stringify({ ignore: ['b/**'] }))
      await fs.writeFile(configPath3, JSON.stringify({ plugins: ['plugin-c'] }))

      const [config1, config2, config3] = await Promise.all([
        parseConfigFile(configPath1),
        parseConfigFile(configPath2),
        parseConfigFile(configPath3),
      ])

      expect(config1.files).toEqual(['a/**/*.ts'])
      expect(config2.ignore).toEqual(['b/**'])
      expect(config3.plugins).toEqual(['plugin-c'])
    })

    test('parsing the same file twice returns consistent results', async () => {
      const configPath = path.join(tempDir, 'stable.json')
      await fs.writeFile(
        configPath,
        JSON.stringify({ files: ['src/**/*.ts'], rules: { 'no-eval': 'error' } }),
      )

      const config1 = await parseConfigFile(configPath)
      const config2 = await parseConfigFile(configPath)

      expect(config1).toEqual(config2)
    })

    test('sequential parses do not leak state between configs', async () => {
      const configPath1 = path.join(tempDir, 'no-leak-1.json')
      const configPath2 = path.join(tempDir, 'no-leak-2.json')
      await fs.writeFile(configPath1, JSON.stringify({ files: ['a.ts'], plugins: ['p1'] }))
      await fs.writeFile(configPath2, JSON.stringify({ ignore: ['b/**'] }))

      const config1 = await parseConfigFile(configPath1)
      const config2 = await parseConfigFile(configPath2)

      expect(config1.files).toEqual(['a.ts'])
      expect(config1.plugins).toEqual(['p1'])
      expect(config2.files).toBeUndefined()
      expect(config2.plugins).toBeUndefined()
      expect(config2.ignore).toEqual(['b/**'])
    })
  })

  describe('validateConfig edge cases', () => {
    test('should reject config that is an array', async () => {
      const configPath = path.join(tempDir, 'array-config.json')
      await fs.writeFile(configPath, JSON.stringify([{ files: ['*.ts'] }]))

      await expect(parseConfigFile(configPath)).rejects.toThrow('must be an object')
    })

    test('should reject config that is a string', async () => {
      const configPath = path.join(tempDir, 'string-config.json')
      await fs.writeFile(configPath, JSON.stringify('not a config'))

      await expect(parseConfigFile(configPath)).rejects.toThrow('must be an object')
    })

    test('should reject config that is a number', async () => {
      const configPath = path.join(tempDir, 'number-config.json')
      await fs.writeFile(configPath, JSON.stringify(42))

      await expect(parseConfigFile(configPath)).rejects.toThrow('must be an object')
    })

    test('should reject config that is a boolean', async () => {
      const configPath = path.join(tempDir, 'bool-config.json')
      await fs.writeFile(configPath, JSON.stringify(true))

      await expect(parseConfigFile(configPath)).rejects.toThrow('must be an object')
    })

    test('should accept config that is an empty object', async () => {
      const configPath = path.join(tempDir, 'empty-config.json')
      await fs.writeFile(configPath, JSON.stringify({}))

      const config = await parseConfigFile(configPath)
      expect(config).toEqual({})
    })

    test('should accept config with nested objects', async () => {
      const configPath = path.join(tempDir, 'nested-config.json')
      await fs.writeFile(
        configPath,
        JSON.stringify({
          rules: {
            'no-eval': { severity: 'error', options: { allowIndirect: true } },
          },
        }),
      )

      const config = await parseConfigFile(configPath)
      expect(config.rules['no-eval'].severity).toBe('error')
    })
  })

  describe('JSON parse error handling', () => {
    test('should throw for invalid JSON', async () => {
      const configPath = path.join(tempDir, 'bad-json.json')
      await fs.writeFile(configPath, 'not json at all')

      await expect(parseConfigFile(configPath)).rejects.toThrow()
    })

    test('should include file path in error message', async () => {
      const configPath = path.join(tempDir, 'err-path.json')
      await fs.writeFile(configPath, '{bad}')

      await expect(parseConfigFile(configPath)).rejects.toThrow(configPath)
    })

    test('should throw for trailing comma in JSON', async () => {
      const configPath = path.join(tempDir, 'trailing.json')
      await fs.writeFile(configPath, '{ "files": ["*.ts"], }')

      await expect(parseConfigFile(configPath)).rejects.toThrow()
    })
  })

  describe('parseConfigFile routing', () => {
    test('should route .json files to JSON parser', async () => {
      const configPath = path.join(tempDir, 'route.json')
      await fs.writeFile(configPath, JSON.stringify({ files: ['*.ts'] }))

      const config = await parseConfigFile(configPath)
      expect(config.files).toEqual(['*.ts'])
    })

    test('should route .js files to JS parser', async () => {
      const configPath = path.join(tempDir, 'route.js')
      await fs.writeFile(configPath, 'export default { files: ["*.ts"] }')

      const config = await parseConfigFile(configPath)
      expect(config.files).toEqual(['*.ts'])
    })

    test('should handle .json with valid structure', async () => {
      const configPath = path.join(tempDir, 'valid-structure.json')
      await fs.writeFile(configPath, '{\n  "files": ["*.ts"]\n}')

      const config = await parseConfigFile(configPath)
      expect(config.files).toEqual(['*.ts'])
    })
  })

  describe('JSON config BOM and encoding edge cases', () => {
    test('throws CLIError for JSON file with UTF-8 BOM', async () => {
      const configPath = path.join(tempDir, 'bom.json')
      const bom = Buffer.from([0xef, 0xbb, 0xbf])
      const content = Buffer.concat([bom, Buffer.from('{"files":["*.ts"]}')])
      await fs.writeFile(configPath, content)

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
      await expect(parseConfigFile(configPath)).rejects.toThrow('Invalid JSON')
    })

    test('parses JSON with CRLF line endings', async () => {
      const configPath = path.join(tempDir, 'crlf.json')
      await fs.writeFile(configPath, '{\r\n  "files": ["*.ts"]\r\n}')

      const config = await parseConfigFile(configPath)
      expect(config.files).toEqual(['*.ts'])
    })

    test('throws CLIError for file with only newline', async () => {
      const configPath = path.join(tempDir, 'newline-only.json')
      await fs.writeFile(configPath, '\n\n\n')

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
      await expect(parseConfigFile(configPath)).rejects.toThrow('Invalid JSON')
    })

    test('parses JSON with deeply nested objects', async () => {
      const configPath = path.join(tempDir, 'nested.json')
      const deepConfig = {
        rules: { rule1: { options: { nested: { deep: { value: 1 } } } } },
      }
      await fs.writeFile(configPath, JSON.stringify(deepConfig))

      const config = await parseConfigFile(configPath)
      const ruleOpts = (
        config.rules as Record<
          string,
          Record<string, Record<string, Record<string, Record<string, number>>>>
        >
      )['rule1']
      expect(ruleOpts.options.nested.deep.value).toBe(1)
    })

    test('parses JSON with many top-level fields', async () => {
      const configPath = path.join(tempDir, 'many-fields.json')
      const manyFields: Record<string, string> = {}
      for (let i = 0; i < 50; i++) {
        manyFields[`field_${i}`] = `value_${i}`
      }
      await fs.writeFile(configPath, JSON.stringify(manyFields))

      const config = await parseConfigFile(configPath)
      expect((config as Record<string, string>)['field_0']).toBe('value_0')
      expect((config as Record<string, string>)['field_49']).toBe('value_49')
    })

    test('parses JSON with emoji in string values', async () => {
      const configPath = path.join(tempDir, 'emoji.json')
      await fs.writeFile(
        configPath,
        JSON.stringify({ files: ['src/**/*.ts 🚀'], plugins: ['🎉-plugin'] }),
      )

      const config = await parseConfigFile(configPath)
      expect(config.files).toEqual(['src/**/*.ts 🚀'])
      expect(config.plugins).toEqual(['🎉-plugin'])
    })

    test('parses JSON with unicode escape sequences', async () => {
      const configPath = path.join(tempDir, 'unicode-esc.json')
      await fs.writeFile(configPath, '{"files":["src/\\u0064/**/*.ts"]}')

      const config = await parseConfigFile(configPath)
      expect(config.files).toEqual(['src/d/**/*.ts'])
    })
  })

  describe('JSON config structural variations', () => {
    test('parses config with null field values', async () => {
      const configPath = path.join(tempDir, 'null-fields.json')
      await fs.writeFile(configPath, JSON.stringify({ files: null, ignore: null }))

      const config = await parseConfigFile(configPath)
      expect(config.files).toBeNull()
      expect(config.ignore).toBeNull()
    })

    test('parses config with boolean field values', async () => {
      const configPath = path.join(tempDir, 'bool-fields.json')
      await fs.writeFile(configPath, JSON.stringify({ verbose: true, strict: false }))

      const config = await parseConfigFile(configPath)
      expect((config as Record<string, boolean>).verbose).toBe(true)
      expect((config as Record<string, boolean>).strict).toBe(false)
    })

    test('parses config with number field values', async () => {
      const configPath = path.join(tempDir, 'num-fields.json')
      await fs.writeFile(
        configPath,
        JSON.stringify({ maxWarnings: 10, concurrency: 4, threshold: 0.5 }),
      )

      const config = await parseConfigFile(configPath)
      expect((config as Record<string, number>).maxWarnings).toBe(10)
      expect((config as Record<string, number>).concurrency).toBe(4)
      expect((config as Record<string, number>).threshold).toBe(0.5)
    })

    test('parses config with nested array values', async () => {
      const configPath = path.join(tempDir, 'nested-arr.json')
      await fs.writeFile(
        configPath,
        JSON.stringify({
          files: ['a.ts', 'b.ts'],
          rules: { r: ['error', { exclude: ['c.ts', 'd.ts'] }] },
        }),
      )

      const config = await parseConfigFile(configPath)
      expect(config.files).toEqual(['a.ts', 'b.ts'])
      expect(config.rules).toEqual({ r: ['error', { exclude: ['c.ts', 'd.ts'] }] })
    })

    test('parses config with very long string values', async () => {
      const configPath = path.join(tempDir, 'long-str.json')
      const longPath = 'src/' + 'very_long_directory_name/'.repeat(50) + '*.ts'
      await fs.writeFile(configPath, JSON.stringify({ files: [longPath] }))

      const config = await parseConfigFile(configPath)
      expect(config.files).toEqual([longPath])
    })

    test('parses config with empty string in files array', async () => {
      const configPath = path.join(tempDir, 'empty-str.json')
      await fs.writeFile(configPath, JSON.stringify({ files: ['', 'src/**/*.ts'] }))

      const config = await parseConfigFile(configPath)
      expect(config.files).toEqual(['', 'src/**/*.ts'])
    })

    test('parses config with whitespace-only strings in values', async () => {
      const configPath = path.join(tempDir, 'ws-str.json')
      await fs.writeFile(configPath, JSON.stringify({ files: ['  ', '\t', 'src/**/*.ts'] }))

      const config = await parseConfigFile(configPath)
      expect(config.files).toEqual(['  ', '\t', 'src/**/*.ts'])
    })

    test('throws CLIError for JSON with consecutive commas', async () => {
      const configPath = path.join(tempDir, 'dblcomma.json')
      await fs.writeFile(configPath, '{ "files": ["*.ts"],, "ignore": [] }')

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
      await expect(parseConfigFile(configPath)).rejects.toThrow('Invalid JSON')
    })

    test('throws CLIError for JSON with missing value', async () => {
      const configPath = path.join(tempDir, 'noval.json')
      await fs.writeFile(configPath, '{ "files": }')

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
      await expect(parseConfigFile(configPath)).rejects.toThrow('Invalid JSON')
    })

    test('throws CLIError for JSON with single-quoted strings', async () => {
      const configPath = path.join(tempDir, 'singleq.json')
      await fs.writeFile(configPath, "{ 'files': ['*.ts'] }")

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
      await expect(parseConfigFile(configPath)).rejects.toThrow('Invalid JSON')
    })
  })

  describe('JS config export default edge cases', () => {
    test('throws CLIError for export default null', async () => {
      const configPath = path.join(tempDir, 'default-null.config.js')
      await fs.writeFile(configPath, 'export default null;')

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
      await expect(parseConfigFile(configPath)).rejects.toThrow('Config exported null or undefined')
    })

    test('throws CLIError for export default undefined', async () => {
      const configPath = path.join(tempDir, 'default-undef.config.js')
      await fs.writeFile(configPath, 'export default undefined;')

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
      await expect(parseConfigFile(configPath)).rejects.toThrow('Config exported null or undefined')
    })

    test('throws CLIError for export default string', async () => {
      const configPath = path.join(tempDir, 'default-str.config.js')
      await fs.writeFile(configPath, 'export default "just a string";')

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
      await expect(parseConfigFile(configPath)).rejects.toThrow('Config must be an object')
    })

    test('throws CLIError for export default array', async () => {
      const configPath = path.join(tempDir, 'default-arr.config.js')
      await fs.writeFile(configPath, 'export default ["item1", "item2"];')

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
      await expect(parseConfigFile(configPath)).rejects.toThrow('Config must be an object')
    })

    test('throws CLIError for export default boolean true', async () => {
      const configPath = path.join(tempDir, 'default-bool.config.js')
      await fs.writeFile(configPath, 'export default true;')

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
      await expect(parseConfigFile(configPath)).rejects.toThrow('Config must be an object')
    })

    test('throws CLIError for export default boolean false', async () => {
      const configPath = path.join(tempDir, 'default-false.config.js')
      await fs.writeFile(configPath, 'export default false;')

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
      await expect(parseConfigFile(configPath)).rejects.toThrow('Config must be an object')
    })

    test('parses JS config with export default object', async () => {
      const configPath = path.join(tempDir, 'default-obj.config.js')
      await fs.writeFile(configPath, `export default { files: ["src/**/*.ts"] };`)

      const config = await parseConfigFile(configPath)
      expect(config.files).toEqual(['src/**/*.ts'])
    })

    test('parses JS config with module.exports containing rules', async () => {
      const configPath = path.join(tempDir, 'mex-rules.config.js')
      await fs.writeFile(
        configPath,
        `module.exports = { rules: { "no-eval": "error", "prefer-const": "warn" } };`,
      )

      const config = await parseConfigFile(configPath)
      expect(config.rules).toEqual({ 'no-eval': 'error', 'prefer-const': 'warn' })
    })
  })

  describe('JS config error code and suggestions', () => {
    test('JS config null export has E003 error code', async () => {
      const configPath = path.join(tempDir, 'jsnull-code.config.js')
      await fs.writeFile(configPath, 'module.exports = null;')

      try {
        await parseConfigFile(configPath)
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(CLIError)
        expect((error as CLIError).code).toBe('E003')
      }
    })

    test('JS config non-object export has E003 error code', async () => {
      const configPath = path.join(tempDir, 'jsnonobj-code.config.js')
      await fs.writeFile(configPath, 'module.exports = "string";')

      try {
        await parseConfigFile(configPath)
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(CLIError)
        expect((error as CLIError).code).toBe('E003')
      }
    })

    test('JS config syntax error has E003 error code', async () => {
      const configPath = path.join(tempDir, 'jssyntax-code.config.js')
      await fs.writeFile(configPath, 'module.exports = { broken syntax };')

      try {
        await parseConfigFile(configPath)
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(CLIError)
        expect((error as CLIError).code).toBe('E003')
      }
    })

    test('JS config syntax error has helpful suggestions', async () => {
      const configPath = path.join(tempDir, 'jssyntax-sugg.config.js')
      await fs.writeFile(configPath, 'module.exports = { broken };')

      try {
        await parseConfigFile(configPath)
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(CLIError)
        const suggestions = (error as CLIError).suggestions
        expect(suggestions.length).toBeGreaterThan(0)
      }
    })

    test('JS config error message mentions JavaScript', async () => {
      const configPath = path.join(tempDir, 'js-mentions.config.js')
      await fs.writeFile(configPath, 'module.exports = 42;')

      try {
        await parseConfigFile(configPath)
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(CLIError)
        expect((error as CLIError).message).toContain('JavaScript')
      }
    })

    test('JS config error message includes file path for string export', async () => {
      const configPath = path.join(tempDir, 'jsstr-path.config.js')
      await fs.writeFile(configPath, 'module.exports = "bad";')

      try {
        await parseConfigFile(configPath)
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(CLIError)
        expect((error as CLIError).message).toContain('jsstr-path.config.js')
      }
    })

    test('JS config error message includes file path for array export', async () => {
      const configPath = path.join(tempDir, 'jsarr-path.config.js')
      await fs.writeFile(configPath, 'module.exports = [];')

      try {
        await parseConfigFile(configPath)
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(CLIError)
        expect((error as CLIError).message).toContain('jsarr-path.config.js')
      }
    })

    test('JS config with named config export that is an object', async () => {
      const configPath = path.join(tempDir, 'namedobj.config.js')
      await fs.writeFile(configPath, `export const config = { files: ["lib/**/*.js"] };`)

      const config = await parseConfigFile(configPath)
      expect(config.files).toEqual(['lib/**/*.js'])
    })
  })

  describe('file path edge cases', () => {
    test('parses config from absolute path', async () => {
      const configPath = path.join(tempDir, 'abs.json')
      await fs.writeFile(configPath, JSON.stringify({ files: ['*.ts'] }))
      const absPath = path.resolve(configPath)

      const config = await parseConfigFile(absPath)
      expect(config.files).toEqual(['*.ts'])
    })

    test('parses config from deeply nested directory', async () => {
      const deepDir = path.join(tempDir, 'a', 'b', 'c', 'd', 'e')
      await fs.mkdir(deepDir, { recursive: true })
      const configPath = path.join(deepDir, '.codeforgerc.json')
      await fs.writeFile(configPath, JSON.stringify({ files: ['deep/**/*.ts'] }))

      const config = await parseConfigFile(configPath)
      expect(config.files).toEqual(['deep/**/*.ts'])
    })

    test('parses config from path with dots in directory name', async () => {
      const dotDir = path.join(tempDir, 'my.project.config')
      await fs.mkdir(dotDir, { recursive: true })
      const configPath = path.join(dotDir, '.codeforgerc.json')
      await fs.writeFile(configPath, JSON.stringify({ files: ['*.ts'] }))

      const config = await parseConfigFile(configPath)
      expect(config.files).toEqual(['*.ts'])
    })

    test('throws CLIError for non-existent nested path', async () => {
      const configPath = path.join(tempDir, 'does', 'not', 'exist', 'config.json')

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
      await expect(parseConfigFile(configPath)).rejects.toThrow('Config file not found')
    })

    test('parses config with dots in filename', async () => {
      const configPath = path.join(tempDir, 'my.config.v2.json')
      await fs.writeFile(configPath, JSON.stringify({ files: ['*.ts'] }))

      const config = await parseConfigFile(configPath)
      expect(config.files).toEqual(['*.ts'])
    })

    test('parses no-extension file as JSON', async () => {
      const configPath = path.join(tempDir, 'configfile')
      await fs.writeFile(configPath, JSON.stringify({ files: ['extless/**/*.ts'] }))

      const config = await parseConfigFile(configPath)
      expect(config.files).toEqual(['extless/**/*.ts'])
    })

    test('throws CLIError for .cjs file extension treated as JSON', async () => {
      const configPath = path.join(tempDir, 'config.cjs')
      await fs.writeFile(configPath, 'module.exports = { files: ["*.ts"] };')

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
    })

    test('parses config from path with parentheses in directory', async () => {
      const parenDir = path.join(tempDir, 'project (copy)')
      await fs.mkdir(parenDir, { recursive: true })
      const configPath = path.join(parenDir, '.codeforgerc.json')
      await fs.writeFile(configPath, JSON.stringify({ files: ['*.ts'] }))

      const config = await parseConfigFile(configPath)
      expect(config.files).toEqual(['*.ts'])
    })
  })

  describe('concurrent and stress testing', () => {
    test('10+ concurrent parses return correct individual results', async () => {
      const paths: string[] = []
      for (let i = 0; i < 12; i++) {
        const p = path.join(tempDir, `stress-${i}.json`)
        await fs.writeFile(p, JSON.stringify({ files: [`pattern-${i}/**/*.ts`] }))
        paths.push(p)
      }

      const results = await Promise.all(paths.map((p) => parseConfigFile(p)))
      for (let i = 0; i < 12; i++) {
        expect(results[i].files).toEqual([`pattern-${i}/**/*.ts`])
      }
    })

    test('many sequential parses are consistent', async () => {
      const configPath = path.join(tempDir, 'seq-stable.json')
      await fs.writeFile(
        configPath,
        JSON.stringify({ files: ['seq/**/*.ts'], rules: { 'no-eval': 'error' } }),
      )

      for (let i = 0; i < 5; i++) {
        const config = await parseConfigFile(configPath)
        expect(config.files).toEqual(['seq/**/*.ts'])
        expect(config.rules).toEqual({ 'no-eval': 'error' })
      }
    })

    test('parse modify parse returns updated content', async () => {
      const configPath = path.join(tempDir, 'mod-parse.json')
      await fs.writeFile(configPath, JSON.stringify({ files: ['v1/**/*.ts'] }))

      const config1 = await parseConfigFile(configPath)
      expect(config1.files).toEqual(['v1/**/*.ts'])

      await fs.writeFile(configPath, JSON.stringify({ files: ['v2/**/*.ts'] }))

      const config2 = await parseConfigFile(configPath)
      expect(config2.files).toEqual(['v2/**/*.ts'])
    })

    test('mixed concurrent JSON and JS parses', async () => {
      const jsonPath = path.join(tempDir, 'mix.json')
      const jsPath = path.join(tempDir, 'mix.config.js')
      await fs.writeFile(jsonPath, JSON.stringify({ files: ['json/**/*.ts'] }))
      await fs.writeFile(jsPath, 'export default { files: ["js/**/*.ts"] };')

      const [jsonConfig, jsConfig] = await Promise.all([
        parseConfigFile(jsonPath),
        parseConfigFile(jsPath),
      ])

      expect(jsonConfig.files).toEqual(['json/**/*.ts'])
      expect(jsConfig.files).toEqual(['js/**/*.ts'])
    })

    test('concurrent parses of same file all succeed', async () => {
      const configPath = path.join(tempDir, 'same-conc.json')
      await fs.writeFile(configPath, JSON.stringify({ files: ['shared/**/*.ts'] }))

      const results = await Promise.all([
        parseConfigFile(configPath),
        parseConfigFile(configPath),
        parseConfigFile(configPath),
      ])

      for (const config of results) {
        expect(config.files).toEqual(['shared/**/*.ts'])
      }
    })
  })

  describe('JSON config with varied rule structures', () => {
    test('parses rules with all string severities', async () => {
      const configPath = path.join(tempDir, 'all-sev.json')
      await fs.writeFile(
        configPath,
        JSON.stringify({
          rules: {
            'no-eval': 'error',
            'prefer-const': 'warn',
            'no-console': 'off',
            'no-debug': 'error',
          },
        }),
      )

      const config = await parseConfigFile(configPath)
      expect(config.rules).toEqual({
        'no-eval': 'error',
        'prefer-const': 'warn',
        'no-console': 'off',
        'no-debug': 'error',
      })
    })

    test('parses rules with array format with complex options', async () => {
      const configPath = path.join(tempDir, 'complex-opts.json')
      await fs.writeFile(
        configPath,
        JSON.stringify({
          rules: {
            'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: false }],
          },
        }),
      )

      const config = await parseConfigFile(configPath)
      expect(config.rules).toEqual({
        'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: false }],
      })
    })

    test('parses rules with empty options object', async () => {
      const configPath = path.join(tempDir, 'empty-opts.json')
      await fs.writeFile(configPath, JSON.stringify({ rules: { 'no-eval': ['error', {}] } }))

      const config = await parseConfigFile(configPath)
      expect(config.rules).toEqual({ 'no-eval': ['error', {}] })
    })

    test('parses rules with numeric option values', async () => {
      const configPath = path.join(tempDir, 'num-opts.json')
      await fs.writeFile(
        configPath,
        JSON.stringify({
          rules: { 'max-params': ['error', { max: 5 }], 'max-depth': ['warn', { max: 4 }] },
        }),
      )

      const config = await parseConfigFile(configPath)
      expect(config.rules).toEqual({
        'max-params': ['error', { max: 5 }],
        'max-depth': ['warn', { max: 4 }],
      })
    })

    test('parses rules with boolean option values', async () => {
      const configPath = path.join(tempDir, 'bool-opts.json')
      await fs.writeFile(
        configPath,
        JSON.stringify({
          rules: {
            'no-eval': ['error', { allowIndirect: false }],
            'strict-mode': ['warn', { enable: true }],
          },
        }),
      )

      const config = await parseConfigFile(configPath)
      expect(config.rules).toEqual({
        'no-eval': ['error', { allowIndirect: false }],
        'strict-mode': ['warn', { enable: true }],
      })
    })

    test('parses rules with string option values', async () => {
      const configPath = path.join(tempDir, 'str-opts.json')
      await fs.writeFile(
        configPath,
        JSON.stringify({
          rules: { 'naming-convention': ['error', { pattern: '^[a-z][a-zA-Z0-9]*$' }] },
        }),
      )

      const config = await parseConfigFile(configPath)
      expect(config.rules).toEqual({
        'naming-convention': ['error', { pattern: '^[a-z][a-zA-Z0-9]*$' }],
      })
    })

    test('parses rules with many rules defined', async () => {
      const configPath = path.join(tempDir, 'many-rules.json')
      const rules: Record<string, string> = {}
      for (let i = 0; i < 20; i++) {
        rules[`rule-${i}`] = i % 2 === 0 ? 'error' : 'warn'
      }
      await fs.writeFile(configPath, JSON.stringify({ rules }))

      const config = await parseConfigFile(configPath)
      expect(config.rules).toEqual(rules)
      expect(Object.keys(config.rules ?? {})).toHaveLength(20)
    })

    test('parses rules with array having only severity no options', async () => {
      const configPath = path.join(tempDir, 'sev-only.json')
      await fs.writeFile(
        configPath,
        JSON.stringify({ rules: { 'no-eval': ['error'], 'prefer-const': ['warn'] } }),
      )

      const config = await parseConfigFile(configPath)
      expect(config.rules).toEqual({ 'no-eval': ['error'], 'prefer-const': ['warn'] })
    })
  })

  describe('non-.js non-.json file extensions', () => {
    test('parses .txt file with valid JSON content', async () => {
      const configPath = path.join(tempDir, 'config.txt')
      await fs.writeFile(configPath, JSON.stringify({ files: ['*.ts'] }))

      const config = await parseConfigFile(configPath)
      expect(config.files).toEqual(['*.ts'])
    })

    test('throws CLIError for .xml file', async () => {
      const configPath = path.join(tempDir, 'config.xml')
      await fs.writeFile(configPath, '<config><files>*.ts</files></config>')

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
      await expect(parseConfigFile(configPath)).rejects.toThrow('Invalid JSON')
    })

    test('throws CLIError for .json5 file with JSON5 syntax', async () => {
      const configPath = path.join(tempDir, 'config.json5')
      await fs.writeFile(configPath, '{ files: ["*.ts"], }')

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
    })

    test('parses .json5 file if it contains valid JSON', async () => {
      const configPath = path.join(tempDir, 'valid.json5')
      await fs.writeFile(configPath, JSON.stringify({ files: ['*.ts'] }))

      const config = await parseConfigFile(configPath)
      expect(config.files).toEqual(['*.ts'])
    })

    test('throws CLIError for .md file with YAML front matter', async () => {
      const configPath = path.join(tempDir, 'config.md')
      await fs.writeFile(configPath, '---\nfiles:\n  - "*.ts"\n---')

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
    })

    test('parses extensionless file with valid JSON', async () => {
      const configPath = path.join(tempDir, '.codeforgerc')
      await fs.writeFile(configPath, JSON.stringify({ files: ['extless/**/*.ts'] }))

      const config = await parseConfigFile(configPath)
      expect(config.files).toEqual(['extless/**/*.ts'])
    })
  })

  describe('return value type verification', () => {
    test('returned config is a plain object', async () => {
      const configPath = path.join(tempDir, 'plain.json')
      await fs.writeFile(configPath, JSON.stringify({ files: ['*.ts'] }))

      const config = await parseConfigFile(configPath)
      expect(typeof config).toBe('object')
      expect(config).not.toBeNull()
      expect(Array.isArray(config)).toBe(false)
    })

    test('returned config files field is an array when present', async () => {
      const configPath = path.join(tempDir, 'arrtype.json')
      await fs.writeFile(configPath, JSON.stringify({ files: ['*.ts'] }))

      const config = await parseConfigFile(configPath)
      expect(Array.isArray(config.files)).toBe(true)
    })

    test('returned config rules field is an object when present', async () => {
      const configPath = path.join(tempDir, 'ruleobj.json')
      await fs.writeFile(configPath, JSON.stringify({ rules: { 'no-eval': 'error' } }))

      const config = await parseConfigFile(configPath)
      expect(typeof config.rules).toBe('object')
      expect(Array.isArray(config.rules)).toBe(false)
    })

    test('returned config can be extended with new properties', async () => {
      const configPath = path.join(tempDir, 'extensible.json')
      await fs.writeFile(configPath, JSON.stringify({ files: ['*.ts'] }))

      const config = await parseConfigFile(configPath)
      const extended = { ...config, extraField: 'value' }
      expect(extended.files).toEqual(['*.ts'])
      expect((extended as Record<string, string>).extraField).toBe('value')
    })

    test('returned config fields are independent between parses', async () => {
      const configPath1 = path.join(tempDir, 'ind1.json')
      const configPath2 = path.join(tempDir, 'ind2.json')
      await fs.writeFile(configPath1, JSON.stringify({ files: ['a.ts'] }))
      await fs.writeFile(configPath2, JSON.stringify({ files: ['b.ts'] }))

      const config1 = await parseConfigFile(configPath1)
      const config2 = await parseConfigFile(configPath2)

      config1.files!.push('extra.ts')
      expect(config2.files).toEqual(['b.ts'])
    })

    test('returned config preserves all JSON value types in fields', async () => {
      const configPath = path.join(tempDir, 'valtypes.json')
      const fullConfig = {
        files: ['*.ts'],
        ignore: ['dist/**'],
        plugins: ['plugin-a'],
        rules: { 'no-eval': 'error' },
        customBool: true,
        customNum: 42,
        customNull: null,
      }
      await fs.writeFile(configPath, JSON.stringify(fullConfig))

      const config = await parseConfigFile(configPath)
      expect(config.files).toEqual(['*.ts'])
      expect(config.ignore).toEqual(['dist/**'])
      expect(config.plugins).toEqual(['plugin-a'])
      expect(config.rules).toEqual({ 'no-eval': 'error' })
      expect((config as Record<string, unknown>).customBool).toBe(true)
      expect((config as Record<string, unknown>).customNum).toBe(42)
      expect((config as Record<string, unknown>).customNull).toBeNull()
    })
  })

  describe('error message format validation', () => {
    test('missing file error message contains "not found"', async () => {
      const configPath = path.join(tempDir, 'miss-fmt.json')

      try {
        await parseConfigFile(configPath)
        expect.fail('Should have thrown')
      } catch (error) {
        expect((error as CLIError).message).toContain('not found')
      }
    })

    test('invalid JSON error message contains "Invalid JSON"', async () => {
      const configPath = path.join(tempDir, 'invjson-fmt.json')
      await fs.writeFile(configPath, '{bad}')

      try {
        await parseConfigFile(configPath)
        expect.fail('Should have thrown')
      } catch (error) {
        expect((error as CLIError).message).toContain('Invalid JSON')
      }
    })

    test('null config error message mentions null or undefined', async () => {
      const configPath = path.join(tempDir, 'null-fmt.json')
      await fs.writeFile(configPath, 'null')

      try {
        await parseConfigFile(configPath)
        expect.fail('Should have thrown')
      } catch (error) {
        expect((error as CLIError).message).toContain('null or undefined')
      }
    })

    test('array config error message mentions array type', async () => {
      const configPath = path.join(tempDir, 'arr-fmt.json')
      await fs.writeFile(configPath, '[1,2]')

      try {
        await parseConfigFile(configPath)
        expect.fail('Should have thrown')
      } catch (error) {
        expect((error as CLIError).message).toContain('array')
      }
    })

    test('JS config error message contains "JavaScript"', async () => {
      const configPath = path.join(tempDir, 'jsmsg.config.js')
      await fs.writeFile(configPath, 'module.exports = 42;')

      try {
        await parseConfigFile(configPath)
        expect.fail('Should have thrown')
      } catch (error) {
        expect((error as CLIError).message).toContain('JavaScript')
      }
    })

    test('all error codes for invalid JSON value types are E003', async () => {
      const cases = ['null', 'true', '"str"', '42', '[]']
      for (const content of cases) {
        const configPath = path.join(tempDir, `ecode-${content.replace(/[^a-z]/g, 'x')}.json`)
        await fs.writeFile(configPath, content)

        try {
          await parseConfigFile(configPath)
          expect.fail('Should have thrown')
        } catch (error) {
          expect((error as CLIError).code).toBe('E003')
        }
      }
    })

    test('suggestions for missing file include path-related help', async () => {
      const configPath = path.join(tempDir, 'sug-path.json')

      try {
        await parseConfigFile(configPath)
        expect.fail('Should have thrown')
      } catch (error) {
        const suggestions = (error as CLIError).suggestions
        expect(suggestions.length).toBeGreaterThanOrEqual(2)
      }
    })

    test('suggestions for invalid JSON include JSON syntax help', async () => {
      const configPath = path.join(tempDir, 'sug-json.json')
      await fs.writeFile(configPath, '{ bad }')

      try {
        await parseConfigFile(configPath)
        expect.fail('Should have thrown')
      } catch (error) {
        const suggestions = (error as CLIError).suggestions
        expect(
          suggestions.some(
            (s) => s.toLowerCase().includes('syntax') || s.toLowerCase().includes('json'),
          ),
        ).toBe(true)
      }
    })
  })

  describe('JSON config with trailing characters', () => {
    test('throws CLIError for JSON with text after valid object', async () => {
      const configPath = path.join(tempDir, 'trail-text.json')
      await fs.writeFile(configPath, '{"files":["*.ts"]} extra')

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
    })

    test('throws CLIError for JSON with second object after first', async () => {
      const configPath = path.join(tempDir, 'dbl-obj.json')
      await fs.writeFile(configPath, '{"files":["*.ts"]}{"files":["*.js"]}')

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
    })

    test('throws CLIError for JSON with number after object', async () => {
      const configPath = path.join(tempDir, 'obj-num.json')
      await fs.writeFile(configPath, '{"files":["*.ts"]}42')

      await expect(parseConfigFile(configPath)).rejects.toThrow(CLIError)
    })
  })

  describe('JS config with named exports only', () => {
    test('parses config from file with only named exports (no default, no config)', async () => {
      const configPath = path.join(tempDir, 'named-only.config.js')
      await fs.writeFile(
        configPath,
        `export const files = ["src/**/*.ts"];\nexport const ignore = ["dist/**"];`,
      )

      const config = await parseConfigFile(configPath)
      expect(config.files).toEqual(['src/**/*.ts'])
      expect(config.ignore).toEqual(['dist/**'])
    })

    test('parses config with export default taking priority over named config', async () => {
      const configPath = path.join(tempDir, 'priority2.config.js')
      await fs.writeFile(
        configPath,
        `export default { files: ["default/**/*.ts"] };\nexport const config = { files: ["named/**/*.ts"] };`,
      )

      const config = await parseConfigFile(configPath)
      expect(config.files).toEqual(['default/**/*.ts'])
    })

    test('parses config with named config export when no default', async () => {
      const configPath = path.join(tempDir, 'namedcfg.config.js')
      await fs.writeFile(
        configPath,
        `export const config = { files: ["named-cfg/**/*.ts"], rules: { "no-eval": "warn" } };`,
      )

      const config = await parseConfigFile(configPath)
      expect(config.files).toEqual(['named-cfg/**/*.ts'])
      expect(config.rules).toEqual({ 'no-eval': 'warn' })
    })
  })

  describe('CLIError toJSON serialization', () => {
    test('CLIError from missing file serializes correctly', async () => {
      const configPath = path.join(tempDir, 'serialize.json')

      try {
        await parseConfigFile(configPath)
        expect.fail('Should have thrown')
      } catch (error) {
        const cliError = error as CLIError
        const json = cliError.toJSON()
        expect(json.code).toBe('E003')
        expect(json.name).toBe('CLIError')
        expect(json.suggestions).toBeInstanceOf(Array)
        expect(typeof json.message).toBe('string')
      }
    })

    test('CLIError from invalid JSON serializes correctly', async () => {
      const configPath = path.join(tempDir, 'ser-bad.json')
      await fs.writeFile(configPath, '{ invalid }')

      try {
        await parseConfigFile(configPath)
        expect.fail('Should have thrown')
      } catch (error) {
        const cliError = error as CLIError
        const json = cliError.toJSON()
        expect(json.code).toBe('E003')
        expect(json.message).toContain('Invalid JSON')
      }
    })

    test('CLIError from JS config error serializes correctly', async () => {
      const configPath = path.join(tempDir, 'ser-js.config.js')
      await fs.writeFile(configPath, 'module.exports = null;')

      try {
        await parseConfigFile(configPath)
        expect.fail('Should have thrown')
      } catch (error) {
        const cliError = error as CLIError
        const json = cliError.toJSON()
        expect(json.code).toBe('E003')
        expect(json.name).toBe('CLIError')
      }
    })
  })

  describe('JSON config with duplicate keys', () => {
    test('last occurrence wins for duplicate keys in JSON', async () => {
      const configPath = path.join(tempDir, 'dup-keys.json')
      await fs.writeFile(configPath, '{"files":["first/**/*.ts"],"files":["second/**/*.ts"]}')

      const config = await parseConfigFile(configPath)
      expect(config.files).toEqual(['second/**/*.ts'])
    })
  })

  describe('JS config with various module patterns', () => {
    test('parses JS config with Object.freeze on export', async () => {
      const configPath = path.join(tempDir, 'frozen.config.js')
      await fs.writeFile(
        configPath,
        `module.exports = Object.freeze({ files: ["frozen/**/*.ts"] });`,
      )

      const config = await parseConfigFile(configPath)
      expect(config.files).toEqual(['frozen/**/*.ts'])
    })

    test('parses JS config with Object.assign merged export', async () => {
      const configPath = path.join(tempDir, 'merged.config.js')
      await fs.writeFile(
        configPath,
        `module.exports = Object.assign({}, { files: ["a/**/*.ts"] }, { ignore: ["b/**"] });`,
      )

      const config = await parseConfigFile(configPath)
      expect(config.files).toEqual(['a/**/*.ts'])
      expect(config.ignore).toEqual(['b/**'])
    })

    test('parses JS config with spread operator in export default', async () => {
      const configPath = path.join(tempDir, 'spread.config.js')
      await fs.writeFile(
        configPath,
        `const base = { files: ["base/**/*.ts"] };\nexport default { ...base, rules: { "no-eval": "error" } };`,
      )

      const config = await parseConfigFile(configPath)
      expect(config.files).toEqual(['base/**/*.ts'])
      expect(config.rules).toEqual({ 'no-eval': 'error' })
    })
  })

  describe('JSON config with special numeric values', () => {
    test('parses config with float number values', async () => {
      const configPath = path.join(tempDir, 'float.json')
      await fs.writeFile(configPath, JSON.stringify({ threshold: 0.5, ratio: 0.001 }))

      const config = await parseConfigFile(configPath)
      expect((config as Record<string, number>).threshold).toBe(0.5)
      expect((config as Record<string, number>).ratio).toBe(0.001)
    })

    test('parses config with negative number values', async () => {
      const configPath = path.join(tempDir, 'neg.json')
      await fs.writeFile(configPath, JSON.stringify({ offset: -1, margin: -100 }))

      const config = await parseConfigFile(configPath)
      expect((config as Record<string, number>).offset).toBe(-1)
      expect((config as Record<string, number>).margin).toBe(-100)
    })

    test('parses config with zero values', async () => {
      const configPath = path.join(tempDir, 'zero-val.json')
      await fs.writeFile(configPath, JSON.stringify({ count: 0, ratio: 0.0 }))

      const config = await parseConfigFile(configPath)
      expect((config as Record<string, number>).count).toBe(0)
      expect((config as Record<string, number>).ratio).toBe(0)
    })

    test('parses config with very large number', async () => {
      const configPath = path.join(tempDir, 'bignum.json')
      await fs.writeFile(configPath, JSON.stringify({ big: Number.MAX_SAFE_INTEGER }))

      const config = await parseConfigFile(configPath)
      expect((config as Record<string, number>).big).toBe(Number.MAX_SAFE_INTEGER)
    })
  })
})
