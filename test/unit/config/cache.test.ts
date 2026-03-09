import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'

import { ConfigCache } from '../../../src/config/cache'
import { hashContent } from '../../../src/cache/index'
import type { CodeForgeConfig } from '../../../src/config/types'

vi.mock('../../../src/config/parser', () => ({
  parseConfigFile: vi.fn(),
}))

import { parseConfigFile } from '../../../src/config/parser'

const mockParseConfigFile = vi.mocked(parseConfigFile)

describe('ConfigCache', () => {
  let tempDir: string
  let cacheDir: string
  let configCache: ConfigCache

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'config-cache-test-'))
    cacheDir = path.join(tempDir, 'cache')
    configCache = new ConfigCache(cacheDir)
    vi.clearAllMocks()
  })

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true })
    vi.restoreAllMocks()
  })

  describe('constructor', () => {
    test('creates instance with custom cache directory', () => {
      const cache = new ConfigCache('/custom/cache/path')
      expect(cache).toBeInstanceOf(ConfigCache)
    })

    test('creates instance with default cache directory', () => {
      const cache = new ConfigCache()
      expect(cache).toBeInstanceOf(ConfigCache)
    })
  })

  describe('getConfig', () => {
    test('caches parsed config on first call', async () => {
      const configPath = path.join(tempDir, 'test-config.json')
      const configContent = { files: ['src/**/*.ts'], ignore: ['dist/**'] }
      await fs.writeFile(configPath, JSON.stringify(configContent))

      mockParseConfigFile.mockResolvedValueOnce(configContent)

      const result = await configCache.getConfig(configPath)

      expect(result).toEqual(configContent)
      expect(mockParseConfigFile).toHaveBeenCalledTimes(1)
    })

    test('returns cached config on second call (cache hit)', async () => {
      const configPath = path.join(tempDir, 'cached-config.json')
      const configContent = { files: ['**/*.js'] }
      await fs.writeFile(configPath, JSON.stringify(configContent))

      mockParseConfigFile.mockResolvedValueOnce(configContent)

      await configCache.getConfig(configPath)
      vi.clearAllMocks()

      const result = await configCache.getConfig(configPath)

      expect(result).toEqual(configContent)
      expect(mockParseConfigFile).not.toHaveBeenCalled()
    })

    test('invalidates cache when file content changes', async () => {
      const configPath = path.join(tempDir, 'changing-config.json')
      const originalContent = { files: ['**/*.ts'] }
      const modifiedContent = {
        files: ['**/*.js'],
        rules: { 'no-eval': 'error' as const },
      }

      await fs.writeFile(configPath, JSON.stringify(originalContent))
      mockParseConfigFile.mockResolvedValueOnce(originalContent)

      await configCache.getConfig(configPath)
      vi.clearAllMocks()

      await fs.writeFile(configPath, JSON.stringify(modifiedContent))
      mockParseConfigFile.mockResolvedValueOnce(modifiedContent)

      const result = await configCache.getConfig(configPath)

      expect(result).toEqual(modifiedContent)
      expect(mockParseConfigFile).toHaveBeenCalledTimes(1)
    })

    test('uses different cache entries for different files', async () => {
      const configPath1 = path.join(tempDir, 'config1.json')
      const configPath2 = path.join(tempDir, 'config2.json')
      const content1 = { files: ['src/**/*.ts'] }
      const content2 = { files: ['lib/**/*.js'] }

      await fs.writeFile(configPath1, JSON.stringify(content1))
      await fs.writeFile(configPath2, JSON.stringify(content2))

      mockParseConfigFile.mockResolvedValueOnce(content1)
      mockParseConfigFile.mockResolvedValueOnce(content2)

      const result1 = await configCache.getConfig(configPath1)
      const result2 = await configCache.getConfig(configPath2)

      expect(result1).toEqual(content1)
      expect(result2).toEqual(content2)
      expect(mockParseConfigFile).toHaveBeenCalledTimes(2)
    })

    test('handles complex config objects', async () => {
      const configPath = path.join(tempDir, 'complex-config.json')
      const complexConfig: CodeForgeConfig = {
        files: ['src/**/*.ts', 'src/**/*.tsx'],
        ignore: ['node_modules/**', 'dist/**', 'coverage/**'],
        rules: {
          'max-complexity': ['error', { max: 10 }],
          'no-eval': 'error',
          'prefer-const': ['warning', { destructuring: 'all' }],
        },
      }
      await fs.writeFile(configPath, JSON.stringify(complexConfig))

      mockParseConfigFile.mockResolvedValueOnce(complexConfig)

      const result = await configCache.getConfig(configPath)

      expect(result).toEqual(complexConfig)
    })

    test('fallback to direct parsing when hashFile fails', async () => {
      const nonExistentPath = path.join(tempDir, 'nonexistent.json')
      const fallbackConfig = { files: ['**/*.ts'] }

      mockParseConfigFile.mockResolvedValueOnce(fallbackConfig)

      const result = await configCache.getConfig(nonExistentPath)

      expect(result).toEqual(fallbackConfig)
      expect(mockParseConfigFile).toHaveBeenCalled()
    })

    test('fallback on cache set failure', async () => {
      const configPath = path.join(tempDir, 'test-config.json')
      const configContent = { files: ['**/*.ts'] }
      await fs.writeFile(configPath, JSON.stringify(configContent))

      const readOnlyCacheDir = path.join(tempDir, 'readonly-cache')
      await fs.mkdir(readOnlyCacheDir, { recursive: true })
      await fs.chmod(readOnlyCacheDir, 0o444)

      const readOnlyCache = new ConfigCache(readOnlyCacheDir)
      mockParseConfigFile.mockResolvedValue(configContent)

      const result = await readOnlyCache.getConfig(configPath)

      expect(result).toEqual(configContent)
      expect(mockParseConfigFile).toHaveBeenCalled()

      await fs.chmod(readOnlyCacheDir, 0o755)
    })
  })

  describe('clear', () => {
    test('clears all cached entries', async () => {
      const configPath = path.join(tempDir, 'clear-test-config.json')
      const configContent = { files: ['**/*.ts'] }
      await fs.writeFile(configPath, JSON.stringify(configContent))

      mockParseConfigFile.mockResolvedValue(configContent)

      await configCache.getConfig(configPath)
      vi.clearAllMocks()

      await configCache.clear()

      const result = await configCache.getConfig(configPath)

      expect(mockParseConfigFile).toHaveBeenCalledTimes(1)
    })

    test('works on empty cache', async () => {
      await expect(configCache.clear()).resolves.not.toThrow()
    })

    test('allows adding entries after clear', async () => {
      const configPath = path.join(tempDir, 'post-clear-config.json')
      const configContent = { files: ['**/*.js'] }
      await fs.writeFile(configPath, JSON.stringify(configContent))

      mockParseConfigFile.mockResolvedValue(configContent)

      await configCache.clear()

      await configCache.getConfig(configPath)
      vi.clearAllMocks()

      await configCache.getConfig(configPath)

      expect(mockParseConfigFile).not.toHaveBeenCalled()
    })
  })

  describe('content-based invalidation', () => {
    test('generates different cache keys for different file hashes', async () => {
      const configPath = path.join(tempDir, 'hash-test-config.json')
      const content1 = { files: ['**/*.ts'] }
      const content2 = { files: ['**/*.js'] }

      await fs.writeFile(configPath, JSON.stringify(content1))
      const hash1 = hashContent(JSON.stringify(content1))

      await fs.writeFile(configPath, JSON.stringify(content2))
      const hash2 = hashContent(JSON.stringify(content2))

      expect(hash1).not.toBe(hash2)
    })

    test('cache hit when file content is unchanged', async () => {
      const configPath = path.join(tempDir, 'same-content-config.json')
      const configContent = { files: ['**/*.ts'] }
      await fs.writeFile(configPath, JSON.stringify(configContent))

      mockParseConfigFile.mockResolvedValue(configContent)

      await configCache.getConfig(configPath)
      vi.clearAllMocks()

      await fs.writeFile(configPath, JSON.stringify(configContent))

      const result = await configCache.getConfig(configPath)

      expect(result).toEqual(configContent)
      expect(mockParseConfigFile).not.toHaveBeenCalled()
    })

    test('cache miss when file content changes', async () => {
      const configPath = path.join(tempDir, 'changed-content-config.json')
      const originalContent = { files: ['**/*.ts'] }
      const newContent = { files: ['**/*.ts'], ignore: ['dist/**'] }

      await fs.writeFile(configPath, JSON.stringify(originalContent))
      mockParseConfigFile.mockResolvedValueOnce(originalContent)

      await configCache.getConfig(configPath)
      vi.clearAllMocks()

      await fs.writeFile(configPath, JSON.stringify(newContent))
      mockParseConfigFile.mockResolvedValueOnce(newContent)

      const result = await configCache.getConfig(configPath)

      expect(result).toEqual(newContent)
      expect(mockParseConfigFile).toHaveBeenCalledTimes(1)
    })
  })

  describe('error handling', () => {
    test('handles parseConfigFile errors gracefully', async () => {
      const configPath = path.join(tempDir, 'error-config.json')
      await fs.writeFile(configPath, '{}')

      const parseError = new Error('Parse error')
      mockParseConfigFile.mockRejectedValue(parseError)

      await expect(configCache.getConfig(configPath)).rejects.toThrow('Parse error')
    })

    test('continues to work after cache errors', async () => {
      const configPath = path.join(tempDir, 'recovery-config.json')
      const configContent = { files: ['**/*.ts'] }
      await fs.writeFile(configPath, JSON.stringify(configContent))

      mockParseConfigFile.mockRejectedValueOnce(new Error('First error'))
      mockParseConfigFile.mockResolvedValueOnce(configContent)

      try {
        await configCache.getConfig(configPath)
      } catch {
        // Expected error
      }

      vi.clearAllMocks()
      mockParseConfigFile.mockResolvedValueOnce(configContent)

      const result = await configCache.getConfig(configPath)

      expect(result).toEqual(configContent)
    })
  })

  describe('concurrent access', () => {
    test('handles concurrent requests for same config', async () => {
      const configPath = path.join(tempDir, 'concurrent-config.json')
      const configContent = { files: ['**/*.ts'] }
      await fs.writeFile(configPath, JSON.stringify(configContent))

      mockParseConfigFile.mockResolvedValue(configContent)

      const results = await Promise.all([
        configCache.getConfig(configPath),
        configCache.getConfig(configPath),
        configCache.getConfig(configPath),
      ])

      expect(results[0]).toEqual(configContent)
      expect(results[1]).toEqual(configContent)
      expect(results[2]).toEqual(configContent)
    })

    test('handles concurrent requests for different configs', async () => {
      const configPaths = await Promise.all(
        [1, 2, 3].map(async (i) => {
          const configPath = path.join(tempDir, `concurrent-${i}.json`)
          await fs.writeFile(configPath, JSON.stringify({ files: [`**/*.ts${i}`] }))
          return configPath
        }),
      )

      // Mock returns config based on which file is requested
      mockParseConfigFile.mockImplementation(async (filePath: string) => {
        const match = filePath.match(/concurrent-(\d)\.json$/)
        const num = match ? match[1] : '1'
        return { files: [`**/*.ts${num}`] }
      })

      const results = await Promise.all(configPaths.map((p) => configCache.getConfig(p)))

      // Verify all results are present (order may vary due to concurrency)
      expect(results).toHaveLength(3)
      expect(results.map((r) => r?.files?.[0]).sort()).toEqual(['**/*.ts1', '**/*.ts2', '**/*.ts3'])
    })
  })
})
