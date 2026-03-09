import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import * as path from 'path'
import * as fs from 'fs/promises'
import * as os from 'os'
import { discoverConfig, findConfigPath } from '../../../src/config/discovery'
import { CLIError } from '../../../src/utils/errors'
import { CONFIG_FILE_NAMES } from '../../../src/config/types'

describe('config discovery', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'codeforge-test-'))
  })

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  describe('discoverConfig', () => {
    describe('finds config files', () => {
      test('finds .codeforgerc in current directory', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBe(configPath)
      })

      test('finds .codeforgerc.json in current directory', async () => {
        const configPath = path.join(tempDir, '.codeforgerc.json')
        await fs.writeFile(configPath, '{}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBe(configPath)
      })

      test('finds .codeforge.json in current directory', async () => {
        const configPath = path.join(tempDir, '.codeforge.json')
        await fs.writeFile(configPath, '{}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBe(configPath)
      })

      test('finds codeforge.config.js in current directory', async () => {
        const configPath = path.join(tempDir, 'codeforge.config.js')
        await fs.writeFile(configPath, 'module.exports = {}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBe(configPath)
      })

      test('returns first found config file (priority order)', async () => {
        // Create all config files - .codeforgerc should be found first
        await fs.writeFile(path.join(tempDir, '.codeforgerc'), '{}')
        await fs.writeFile(path.join(tempDir, '.codeforge.json'), '{}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBe(path.join(tempDir, '.codeforgerc'))
      })
    })

    describe('searches upward', () => {
      test('searches upward from subdirectory', async () => {
        // Create config in root
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        // Create subdirectory
        const subDir = path.join(tempDir, 'src', 'components')
        await fs.mkdir(subDir, { recursive: true })

        const result = await discoverConfig({ cwd: subDir })

        expect(result).toBe(configPath)
      })

      test('finds config in parent directory when not in current', async () => {
        const parentConfig = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(parentConfig, '{}')

        const childDir = path.join(tempDir, 'child')
        await fs.mkdir(childDir)

        const result = await discoverConfig({ cwd: childDir })

        expect(result).toBe(parentConfig)
      })

      test('finds nearest config when multiple exist', async () => {
        // Root config
        await fs.writeFile(path.join(tempDir, '.codeforgerc'), '{}')

        // Nested config (closer)
        const nestedDir = path.join(tempDir, 'packages', 'lib')
        await fs.mkdir(nestedDir, { recursive: true })
        const nestedConfig = path.join(nestedDir, '.codeforgerc.json')
        await fs.writeFile(nestedConfig, '{}')

        const deepDir = path.join(nestedDir, 'src')
        await fs.mkdir(deepDir)

        const result = await discoverConfig({ cwd: deepDir })

        expect(result).toBe(nestedConfig)
      })
    })

    describe('stops at boundaries', () => {
      test('stops at package.json (project root)', async () => {
        // Create package.json in parent
        const parentDir = path.join(tempDir, 'parent')
        await fs.mkdir(parentDir)
        await fs.writeFile(path.join(parentDir, 'package.json'), '{}')

        // Create config below package.json
        const childDir = path.join(parentDir, 'src')
        await fs.mkdir(childDir)
        const configPath = path.join(parentDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const result = await discoverConfig({ cwd: childDir })

        expect(result).toBe(configPath)
      })

      test('does not search beyond package.json', async () => {
        // Create config in grandparent (outside project root)
        const grandparentConfig = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(grandparentConfig, '{}')

        // Create package.json in parent (project root)
        const parentDir = path.join(tempDir, 'project')
        await fs.mkdir(parentDir)
        await fs.writeFile(path.join(parentDir, 'package.json'), '{}')

        // Search from child
        const childDir = path.join(parentDir, 'src')
        await fs.mkdir(childDir)

        const result = await discoverConfig({ cwd: childDir })

        // Should not find grandparent config
        expect(result).toBeNull()
      })

      test('stops at custom stopAt directory', async () => {
        const rootConfig = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(rootConfig, '{}')

        const stopDir = path.join(tempDir, 'workspace')
        await fs.mkdir(stopDir)

        const stopConfig = path.join(stopDir, '.codeforgerc.json')
        await fs.writeFile(stopConfig, '{}')

        const childDir = path.join(stopDir, 'project')
        await fs.mkdir(childDir)

        const result = await discoverConfig({ cwd: childDir, stopAt: stopDir })

        expect(result).toBe(stopConfig)
      })

      test('returns null when stopAt reached without finding config', async () => {
        const stopDir = path.join(tempDir, 'workspace')
        await fs.mkdir(stopDir)

        const childDir = path.join(stopDir, 'project')
        await fs.mkdir(childDir)

        const result = await discoverConfig({ cwd: childDir, stopAt: childDir })

        expect(result).toBeNull()
      })
    })

    describe('returns null when not found', () => {
      test('returns null when no config file exists', async () => {
        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBeNull()
      })

      test('returns null when only non-config files exist', async () => {
        await fs.writeFile(path.join(tempDir, 'readme.md'), '# Readme')
        await fs.writeFile(path.join(tempDir, 'index.ts'), 'export {}')

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBeNull()
      })
    })

    describe('edge cases', () => {
      test('handles deeply nested directory structure', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const deepDir = path.join(tempDir, 'a', 'b', 'c', 'd', 'e')
        await fs.mkdir(deepDir, { recursive: true })

        const result = await discoverConfig({ cwd: deepDir })

        expect(result).toBe(configPath)
      })

      test('handles directory with many files', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        for (let i = 0; i < 20; i++) {
          await fs.writeFile(path.join(tempDir, `file${i}.ts`), '')
        }

        const result = await discoverConfig({ cwd: tempDir })

        expect(result).toBe(configPath)
      })

      test('handles symlinks in path', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const realDir = path.join(tempDir, 'real')
        await fs.mkdir(realDir)

        const linkDir = path.join(tempDir, 'link')
        await fs.symlink(realDir, linkDir)

        const result = await discoverConfig({ cwd: linkDir })

        expect(result).toBe(configPath)
      })
    })
  })

  describe('findConfigPath', () => {
    describe('with explicit path', () => {
      test('returns absolute path for valid explicit path', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const result = await findConfigPath(configPath)

        expect(result).toBe(configPath)
      })

      test('resolves relative path to absolute', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const result = await findConfigPath('.codeforgerc', tempDir)

        expect(result).toBe(configPath)
      })

      test('throws CLIError.configError for non-existent explicit path', async () => {
        const nonExistent = path.join(tempDir, 'non-existent.json')

        await expect(findConfigPath(nonExistent)).rejects.toThrow(CLIError)
      })

      test('throws CLIError with code E003 for config error', async () => {
        const nonExistent = path.join(tempDir, 'missing.json')

        try {
          await findConfigPath(nonExistent)
          expect.fail('Should have thrown')
        } catch (error) {
          expect(error).toBeInstanceOf(CLIError)
          expect((error as CLIError).code).toBe('E003')
        }
      })

      test('error message includes the path', async () => {
        const nonExistent = path.join(tempDir, 'missing.json')

        try {
          await findConfigPath(nonExistent)
          expect.fail('Should have thrown')
        } catch (error) {
          expect((error as Error).message).toContain(nonExistent)
        }
      })

      test('throws error when explicit path is a directory', async () => {
        const dirPath = path.join(tempDir, 'subdir')
        await fs.mkdir(dirPath)

        try {
          await findConfigPath(dirPath)
          expect.fail('Should have thrown')
        } catch (error) {
          expect(error).toBeInstanceOf(CLIError)
          expect((error as Error).message).toContain('not a file')
        }
      })
    })

    describe('without explicit path (auto-discovery)', () => {
      test('auto-discovers config when no explicit path', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const result = await findConfigPath(undefined, tempDir)

        expect(result).toBe(configPath)
      })

      test('returns null when no config found and no explicit path', async () => {
        const result = await findConfigPath(undefined, tempDir)

        expect(result).toBeNull()
      })

      test('uses process.cwd() when cwd not provided', async () => {
        const configPath = path.join(tempDir, '.codeforgerc')
        await fs.writeFile(configPath, '{}')

        const originalCwd = process.cwd
        process.cwd = () => tempDir

        try {
          const result = await findConfigPath()
          expect(result).toBe(configPath)
        } finally {
          process.cwd = originalCwd
        }
      })
    })
  })

  describe('CONFIG_FILE_NAMES constant', () => {
    test('contains all expected config file names', () => {
      expect(CONFIG_FILE_NAMES).toContain('.codeforgerc')
      expect(CONFIG_FILE_NAMES).toContain('.codeforgerc.json')
      expect(CONFIG_FILE_NAMES).toContain('.codeforge.json')
      expect(CONFIG_FILE_NAMES).toContain('codeforge.config.js')
    })

    test('has correct priority order', () => {
      expect(CONFIG_FILE_NAMES[0]).toBe('.codeforgerc')
      expect(CONFIG_FILE_NAMES[1]).toBe('.codeforgerc.json')
      expect(CONFIG_FILE_NAMES[2]).toBe('.codeforge.json')
      expect(CONFIG_FILE_NAMES[3]).toBe('codeforge.config.js')
    })
  })
})
