import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'

import { ConfigCache } from '../../../src/config/cache'
import {
  CacheStore,
  InvalidationManager,
  InvalidationStrategy,
  hashContent,
} from '../../../src/cache/index'
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

  describe('constructor - additional', () => {
    test('creates instance with empty string cache directory', () => {
      const cache = new ConfigCache('')
      expect(cache).toBeInstanceOf(ConfigCache)
    })

    test('creates instance with relative cache directory', () => {
      const cache = new ConfigCache('./relative-cache')
      expect(cache).toBeInstanceOf(ConfigCache)
    })

    test('creates instance with deeply nested path', () => {
      const cache = new ConfigCache('a/b/c/d/e/f/cache')
      expect(cache).toBeInstanceOf(ConfigCache)
    })

    test('creates instance with path containing dots', () => {
      const cache = new ConfigCache('./.cache/../.cache/config')
      expect(cache).toBeInstanceOf(ConfigCache)
    })

    test('creates instance with trailing slash', () => {
      const cache = new ConfigCache('/tmp/cache/')
      expect(cache).toBeInstanceOf(ConfigCache)
    })

    test('multiple instances with same directory do not conflict', async () => {
      const configPath = path.join(tempDir, 'shared-config.json')
      const configContent = { files: ['**/*.ts'] }
      await fs.writeFile(configPath, JSON.stringify(configContent))

      const cache1 = new ConfigCache(cacheDir)
      const cache2 = new ConfigCache(cacheDir)

      mockParseConfigFile.mockResolvedValue(configContent)

      await cache1.getConfig(configPath)
      vi.clearAllMocks()

      const result = await cache2.getConfig(configPath)
      expect(result).toEqual(configContent)
      expect(mockParseConfigFile).not.toHaveBeenCalled()
    })

    test('multiple instances with different directories are independent', async () => {
      const configPath = path.join(tempDir, 'independent-config.json')
      const configContent = { files: ['**/*.ts'] }
      await fs.writeFile(configPath, JSON.stringify(configContent))

      const dir1 = path.join(tempDir, 'independent1')
      const dir2 = path.join(tempDir, 'independent2')
      const cache1 = new ConfigCache(dir1)
      const cache2 = new ConfigCache(dir2)

      mockParseConfigFile.mockResolvedValue(configContent)

      await cache1.getConfig(configPath)
      vi.clearAllMocks()

      await cache2.getConfig(configPath)
      expect(mockParseConfigFile).toHaveBeenCalledTimes(1)
    })
  })

  describe('getConfig - cache key construction', () => {
    test('cache key includes file path component', async () => {
      const configPath = path.join(tempDir, 'key-path-test.json')
      const configContent = { files: ['**/*.ts'] }
      await fs.writeFile(configPath, JSON.stringify(configContent))
      mockParseConfigFile.mockResolvedValue(configContent)

      const result = await configCache.getConfig(configPath)
      expect(result).toEqual(configContent)
    })

    test('same file content with same path returns cached result', async () => {
      const configPath = path.join(tempDir, 'same-key-test.json')
      const configContent = { files: ['**/*.ts'] }
      await fs.writeFile(configPath, JSON.stringify(configContent))

      mockParseConfigFile.mockResolvedValue(configContent)

      await configCache.getConfig(configPath)
      vi.clearAllMocks()

      const result = await configCache.getConfig(configPath)
      expect(result).toEqual(configContent)
      expect(mockParseConfigFile).not.toHaveBeenCalled()
    })

    test('renaming file creates separate cache entry', async () => {
      const originalPath = path.join(tempDir, 'original.json')
      const renamedPath = path.join(tempDir, 'renamed.json')
      const content = { files: ['**/*.ts'] }

      await fs.writeFile(originalPath, JSON.stringify(content))
      mockParseConfigFile.mockResolvedValue(content)
      await configCache.getConfig(originalPath)

      await fs.rename(originalPath, renamedPath)
      vi.clearAllMocks()
      mockParseConfigFile.mockResolvedValue(content)

      const result = await configCache.getConfig(renamedPath)
      expect(result).toEqual(content)
      expect(mockParseConfigFile).toHaveBeenCalledTimes(1)
    })
  })

  describe('getConfig - minimal and edge-case configs', () => {
    test('handles empty config object', async () => {
      const configPath = path.join(tempDir, 'empty-config.json')
      await fs.writeFile(configPath, '{}')
      mockParseConfigFile.mockResolvedValueOnce({})
      const result = await configCache.getConfig(configPath)
      expect(result).toEqual({})
    })

    test('handles config with only files array', async () => {
      const configPath = path.join(tempDir, 'files-only.json')
      const config = { files: ['src/**/*.ts'] }
      await fs.writeFile(configPath, JSON.stringify(config))
      mockParseConfigFile.mockResolvedValueOnce(config)
      const result = await configCache.getConfig(configPath)
      expect(result).toEqual(config)
    })

    test('handles config with only ignore array', async () => {
      const configPath = path.join(tempDir, 'ignore-only.json')
      const config = { ignore: ['dist/**'] }
      await fs.writeFile(configPath, JSON.stringify(config))
      mockParseConfigFile.mockResolvedValueOnce(config)
      const result = await configCache.getConfig(configPath)
      expect(result).toEqual(config)
    })

    test('handles config with only plugins array', async () => {
      const configPath = path.join(tempDir, 'plugins-only.json')
      const config = { plugins: ['plugin-a'] }
      await fs.writeFile(configPath, JSON.stringify(config))
      mockParseConfigFile.mockResolvedValueOnce(config)
      const result = await configCache.getConfig(configPath)
      expect(result).toEqual(config)
    })

    test('handles config with only rules', async () => {
      const configPath = path.join(tempDir, 'rules-only.json')
      const config = { rules: { 'no-eval': 'error' } }
      await fs.writeFile(configPath, JSON.stringify(config))
      mockParseConfigFile.mockResolvedValueOnce(config)
      const result = await configCache.getConfig(configPath)
      expect(result).toEqual(config)
    })

    test('handles config with all fields populated', async () => {
      const configPath = path.join(tempDir, 'full-config.json')
      const config: CodeForgeConfig = {
        files: ['src/**/*.ts', 'src/**/*.tsx'],
        ignore: ['node_modules/**', 'dist/**'],
        plugins: ['@codeforge/plugin-example'],
        rules: {
          'no-eval': 'error',
          'max-params': ['warning', { max: 4 }],
        },
      }
      await fs.writeFile(configPath, JSON.stringify(config))
      mockParseConfigFile.mockResolvedValueOnce(config)
      const result = await configCache.getConfig(configPath)
      expect(result).toEqual(config)
    })

    test('handles config with empty files array', async () => {
      const configPath = path.join(tempDir, 'empty-files.json')
      const config = { files: [] }
      await fs.writeFile(configPath, JSON.stringify(config))
      mockParseConfigFile.mockResolvedValueOnce(config)
      const result = await configCache.getConfig(configPath)
      expect(result).toEqual(config)
    })

    test('handles config with empty ignore array', async () => {
      const configPath = path.join(tempDir, 'empty-ignore.json')
      const config = { ignore: [] }
      await fs.writeFile(configPath, JSON.stringify(config))
      mockParseConfigFile.mockResolvedValueOnce(config)
      const result = await configCache.getConfig(configPath)
      expect(result).toEqual(config)
    })

    test('handles config with single file pattern', async () => {
      const configPath = path.join(tempDir, 'single-file.json')
      const config = { files: ['index.ts'] }
      await fs.writeFile(configPath, JSON.stringify(config))
      mockParseConfigFile.mockResolvedValueOnce(config)
      const result = await configCache.getConfig(configPath)
      expect(result).toEqual(config)
    })

    test('handles config with many file patterns', async () => {
      const configPath = path.join(tempDir, 'many-files.json')
      const config = { files: Array.from({ length: 50 }, (_, i) => `src/${i}/**/*.ts`) }
      await fs.writeFile(configPath, JSON.stringify(config))
      mockParseConfigFile.mockResolvedValueOnce(config)
      const result = await configCache.getConfig(configPath)
      expect(result).toEqual(config)
    })

    test('handles config with nested rule options', async () => {
      const configPath = path.join(tempDir, 'nested-rules.json')
      const config = {
        rules: {
          'max-complexity': ['error', { max: 10, threshold: 5 }],
          'no-eval': 'warning',
          'prefer-const': ['error', { destructuring: 'all' }],
        },
      }
      await fs.writeFile(configPath, JSON.stringify(config))
      mockParseConfigFile.mockResolvedValueOnce(config)
      const result = await configCache.getConfig(configPath)
      expect(result).toEqual(config)
    })
  })

  describe('getConfig - serialization round-trip', () => {
    test('preserves string values through cache', async () => {
      const configPath = path.join(tempDir, 'string-values.json')
      const config = { files: ['**/*.ts'] }
      await fs.writeFile(configPath, JSON.stringify(config))
      mockParseConfigFile.mockResolvedValueOnce(config)
      const result = await configCache.getConfig(configPath)
      expect(result?.files).toEqual(['**/*.ts'])
    })

    test('preserves array order through cache', async () => {
      const configPath = path.join(tempDir, 'array-order.json')
      const config = { files: ['z.ts', 'a.ts', 'm.ts'] }
      await fs.writeFile(configPath, JSON.stringify(config))
      mockParseConfigFile.mockResolvedValueOnce(config)
      const result = await configCache.getConfig(configPath)
      expect(result?.files).toEqual(['z.ts', 'a.ts', 'm.ts'])
    })

    test('preserves rule severity strings through cache', async () => {
      const configPath = path.join(tempDir, 'severity-strings.json')
      const config = {
        rules: { 'no-eval': 'error', 'prefer-const': 'warning', 'no-console': 'off' },
      }
      await fs.writeFile(configPath, JSON.stringify(config))
      mockParseConfigFile.mockResolvedValueOnce(config)
      const result = await configCache.getConfig(configPath)
      expect(result?.rules).toEqual(config.rules)
    })

    test('preserves rule options arrays through cache', async () => {
      const configPath = path.join(tempDir, 'rule-options.json')
      const config = { rules: { 'max-params': ['error', { max: 5 }] } }
      await fs.writeFile(configPath, JSON.stringify(config))
      mockParseConfigFile.mockResolvedValueOnce(config)
      const result = await configCache.getConfig(configPath)
      expect(result?.rules?.['max-params']).toEqual(['error', { max: 5 }])
    })

    test('preserves empty arrays through cache', async () => {
      const configPath = path.join(tempDir, 'empty-arrays.json')
      const config = { files: [], ignore: [], plugins: [] }
      await fs.writeFile(configPath, JSON.stringify(config))
      mockParseConfigFile.mockResolvedValueOnce(config)
      const result = await configCache.getConfig(configPath)
      expect(result?.files).toEqual([])
      expect(result?.ignore).toEqual([])
      expect(result?.plugins).toEqual([])
    })

    test('caches null from parseConfigFile', async () => {
      const configPath = path.join(tempDir, 'null-parse-cache.json')
      await fs.writeFile(configPath, '{}')
      mockParseConfigFile.mockResolvedValueOnce(null)
      const result = await configCache.getConfig(configPath)
      expect(result).toBeNull()
    })

    test('cached data survives cache instance recreation', async () => {
      const configPath = path.join(tempDir, 'persist-round-trip.json')
      const config = { files: ['**/*.ts'], ignore: ['dist/**'] }
      await fs.writeFile(configPath, JSON.stringify(config))
      mockParseConfigFile.mockResolvedValueOnce(config)
      await configCache.getConfig(configPath)

      const newCache = new ConfigCache(cacheDir)
      const result = await newCache.getConfig(configPath)
      expect(result).toEqual(config)
    })
  })

  describe('getConfig - file content changes', () => {
    test('detects change from simple to complex config', async () => {
      const configPath = path.join(tempDir, 'evolving-config.json')
      const simple = { files: ['**/*.ts'] }
      const complex: CodeForgeConfig = {
        files: ['src/**/*.ts'],
        ignore: ['dist/**'],
        rules: { 'no-eval': 'error' },
      }

      await fs.writeFile(configPath, JSON.stringify(simple))
      mockParseConfigFile.mockResolvedValueOnce(simple)
      await configCache.getConfig(configPath)

      await fs.writeFile(configPath, JSON.stringify(complex))
      mockParseConfigFile.mockResolvedValueOnce(complex)
      const result = await configCache.getConfig(configPath)
      expect(result).toEqual(complex)
      expect(mockParseConfigFile).toHaveBeenCalledTimes(2)
    })

    test('detects change from complex to simple config', async () => {
      const configPath = path.join(tempDir, 'simplifying-config.json')
      const complex: CodeForgeConfig = {
        files: ['src/**/*.ts'],
        rules: { 'no-eval': 'error' },
      }
      const simple = { files: ['**/*.ts'] }

      await fs.writeFile(configPath, JSON.stringify(complex))
      mockParseConfigFile.mockResolvedValueOnce(complex)
      await configCache.getConfig(configPath)

      await fs.writeFile(configPath, JSON.stringify(simple))
      mockParseConfigFile.mockResolvedValueOnce(simple)
      const result = await configCache.getConfig(configPath)
      expect(result).toEqual(simple)
      expect(mockParseConfigFile).toHaveBeenCalledTimes(2)
    })

    test('detects change in ignore patterns', async () => {
      const configPath = path.join(tempDir, 'ignore-change.json')
      const v1 = { files: ['**/*.ts'], ignore: ['dist/**'] }
      const v2 = { files: ['**/*.ts'], ignore: ['dist/**', 'coverage/**'] }

      await fs.writeFile(configPath, JSON.stringify(v1))
      mockParseConfigFile.mockResolvedValueOnce(v1)
      await configCache.getConfig(configPath)

      await fs.writeFile(configPath, JSON.stringify(v2))
      mockParseConfigFile.mockResolvedValueOnce(v2)
      const result = await configCache.getConfig(configPath)
      expect(result).toEqual(v2)
      expect(mockParseConfigFile).toHaveBeenCalledTimes(2)
    })

    test('detects change in rule configuration', async () => {
      const configPath = path.join(tempDir, 'rule-change.json')
      const v1 = { rules: { 'no-eval': 'warning' } }
      const v2 = { rules: { 'no-eval': 'error' } }

      await fs.writeFile(configPath, JSON.stringify(v1))
      mockParseConfigFile.mockResolvedValueOnce(v1)
      await configCache.getConfig(configPath)

      await fs.writeFile(configPath, JSON.stringify(v2))
      mockParseConfigFile.mockResolvedValueOnce(v2)
      const result = await configCache.getConfig(configPath)
      expect(result).toEqual(v2)
      expect(mockParseConfigFile).toHaveBeenCalledTimes(2)
    })

    test('detects addition of new field', async () => {
      const configPath = path.join(tempDir, 'field-addition.json')
      const v1 = { files: ['**/*.ts'] }
      const v2 = { files: ['**/*.ts'], ignore: ['dist/**'] }

      await fs.writeFile(configPath, JSON.stringify(v1))
      mockParseConfigFile.mockResolvedValueOnce(v1)
      await configCache.getConfig(configPath)

      await fs.writeFile(configPath, JSON.stringify(v2))
      mockParseConfigFile.mockResolvedValueOnce(v2)
      const result = await configCache.getConfig(configPath)
      expect(result).toEqual(v2)
      expect(mockParseConfigFile).toHaveBeenCalledTimes(2)
    })

    test('detects removal of field', async () => {
      const configPath = path.join(tempDir, 'field-removal.json')
      const v1 = { files: ['**/*.ts'], ignore: ['dist/**'] }
      const v2 = { files: ['**/*.ts'] }

      await fs.writeFile(configPath, JSON.stringify(v1))
      mockParseConfigFile.mockResolvedValueOnce(v1)
      await configCache.getConfig(configPath)

      await fs.writeFile(configPath, JSON.stringify(v2))
      mockParseConfigFile.mockResolvedValueOnce(v2)
      const result = await configCache.getConfig(configPath)
      expect(result).toEqual(v2)
      expect(mockParseConfigFile).toHaveBeenCalledTimes(2)
    })

    test('does not invalidate when same content is rewritten', async () => {
      const configPath = path.join(tempDir, 'rewrite-same.json')
      const config = { files: ['**/*.ts'] }

      await fs.writeFile(configPath, JSON.stringify(config))
      mockParseConfigFile.mockResolvedValueOnce(config)
      const r1 = await configCache.getConfig(configPath)
      expect(r1).toEqual(config)
      expect(mockParseConfigFile).toHaveBeenCalledTimes(1)

      await fs.writeFile(configPath, JSON.stringify(config))
      const r2 = await configCache.getConfig(configPath)
      expect(r2).toEqual(config)
      expect(mockParseConfigFile).toHaveBeenCalledTimes(1)
    })

    test('detects change with whitespace differences in serialized form', async () => {
      const configPath = path.join(tempDir, 'whitespace-diff.json')
      const compact = JSON.stringify({ files: ['**/*.ts'] })
      const pretty = JSON.stringify({ files: ['**/*.ts'] }, null, 2)

      await fs.writeFile(configPath, compact)
      mockParseConfigFile.mockResolvedValueOnce({ files: ['**/*.ts'] })
      const r1 = await configCache.getConfig(configPath)
      expect(r1).toEqual({ files: ['**/*.ts'] })
      expect(mockParseConfigFile).toHaveBeenCalledTimes(1)

      await fs.writeFile(configPath, pretty)
      mockParseConfigFile.mockResolvedValueOnce({ files: ['**/*.ts'] })
      const r2 = await configCache.getConfig(configPath)
      expect(r2).toEqual({ files: ['**/*.ts'] })
      expect(mockParseConfigFile).toHaveBeenCalledTimes(2)
    })
  })

  describe('getConfig - path handling', () => {
    test('handles path with spaces in directory name', async () => {
      const spacedDir = path.join(tempDir, 'path with spaces')
      await fs.mkdir(spacedDir, { recursive: true })
      const configPath = path.join(spacedDir, 'config.json')
      const config = { files: ['**/*.ts'] }
      await fs.writeFile(configPath, JSON.stringify(config))
      mockParseConfigFile.mockResolvedValueOnce(config)
      const result = await configCache.getConfig(configPath)
      expect(result).toEqual(config)
    })

    test('handles path with parentheses', async () => {
      const parenDir = path.join(tempDir, 'project (copy)')
      await fs.mkdir(parenDir, { recursive: true })
      const configPath = path.join(parenDir, 'config.json')
      const config = { files: ['**/*.ts'] }
      await fs.writeFile(configPath, JSON.stringify(config))
      mockParseConfigFile.mockResolvedValueOnce(config)
      const result = await configCache.getConfig(configPath)
      expect(result).toEqual(config)
    })

    test('handles deeply nested directory path', async () => {
      const nestedDir = path.join(tempDir, 'a', 'b', 'c', 'd', 'e')
      await fs.mkdir(nestedDir, { recursive: true })
      const configPath = path.join(nestedDir, 'config.json')
      const config = { files: ['**/*.ts'] }
      await fs.writeFile(configPath, JSON.stringify(config))
      mockParseConfigFile.mockResolvedValueOnce(config)
      const result = await configCache.getConfig(configPath)
      expect(result).toEqual(config)
    })

    test('handles path with dots in filename', async () => {
      const configPath = path.join(tempDir, 'config.test.json')
      const config = { files: ['**/*.ts'] }
      await fs.writeFile(configPath, JSON.stringify(config))
      mockParseConfigFile.mockResolvedValueOnce(config)
      const result = await configCache.getConfig(configPath)
      expect(result).toEqual(config)
    })

    test('handles path with hyphens and underscores', async () => {
      const configPath = path.join(tempDir, 'my-config_file.json')
      const config = { files: ['**/*.ts'] }
      await fs.writeFile(configPath, JSON.stringify(config))
      mockParseConfigFile.mockResolvedValueOnce(config)
      const result = await configCache.getConfig(configPath)
      expect(result).toEqual(config)
    })
  })

  describe('getConfig - sequential operations', () => {
    test('calling getConfig 10 times on same file only parses once', async () => {
      const configPath = path.join(tempDir, 'sequential-config.json')
      const config = { files: ['**/*.ts'] }
      await fs.writeFile(configPath, JSON.stringify(config))
      mockParseConfigFile.mockResolvedValue(config)

      await configCache.getConfig(configPath)
      vi.clearAllMocks()

      for (let i = 0; i < 9; i++) {
        const result = await configCache.getConfig(configPath)
        expect(result).toEqual(config)
      }
      expect(mockParseConfigFile).not.toHaveBeenCalled()
    })

    test('alternating between two files caches both', async () => {
      const path1 = path.join(tempDir, 'alt1.json')
      const path2 = path.join(tempDir, 'alt2.json')
      const config1 = { files: ['**/*.ts'] }
      const config2 = { files: ['**/*.js'] }

      await fs.writeFile(path1, JSON.stringify(config1))
      await fs.writeFile(path2, JSON.stringify(config2))
      mockParseConfigFile.mockResolvedValueOnce(config1)
      mockParseConfigFile.mockResolvedValueOnce(config2)

      await configCache.getConfig(path1)
      await configCache.getConfig(path2)
      vi.clearAllMocks()

      const r1 = await configCache.getConfig(path1)
      const r2 = await configCache.getConfig(path2)
      expect(r1).toEqual(config1)
      expect(r2).toEqual(config2)
      expect(mockParseConfigFile).not.toHaveBeenCalled()
    })

    test('modifying file between calls triggers re-parse', async () => {
      const configPath = path.join(tempDir, 'modify-between.json')

      for (let i = 0; i < 3; i++) {
        const config = { files: [`**/*.v${i}`] }
        await fs.writeFile(configPath, JSON.stringify(config))
        mockParseConfigFile.mockResolvedValueOnce(config)
        const result = await configCache.getConfig(configPath)
        expect(result).toEqual(config)
        vi.clearAllMocks()
      }
    })
  })

  describe('clear - additional', () => {
    test('clear after caching multiple files', async () => {
      const paths = await Promise.all(
        [1, 2, 3, 4, 5].map(async (i) => {
          const p = path.join(tempDir, `multi-clear-${i}.json`)
          await fs.writeFile(p, JSON.stringify({ files: [`**/*.ts${i}`] }))
          return p
        }),
      )

      mockParseConfigFile.mockImplementation(async (fp: string) => {
        const num = fp.match(/multi-clear-(\d)/)?.[1]
        return { files: [`**/*.ts${num}`] }
      })

      await Promise.all(paths.map((p) => configCache.getConfig(p)))
      vi.clearAllMocks()

      await configCache.clear()

      mockParseConfigFile.mockImplementation(async (fp: string) => {
        const num = fp.match(/multi-clear-(\d)/)?.[1]
        return { files: [`**/*.ts${num}`] }
      })

      for (const p of paths) {
        await configCache.getConfig(p)
      }
      expect(mockParseConfigFile).toHaveBeenCalledTimes(5)
    })

    test('calling clear twice is safe', async () => {
      await configCache.clear()
      await configCache.clear()
    })

    test('clear then re-cache same file', async () => {
      const configPath = path.join(tempDir, 'recache-same.json')
      const config = { files: ['**/*.ts'] }
      await fs.writeFile(configPath, JSON.stringify(config))
      mockParseConfigFile.mockResolvedValue(config)

      await configCache.getConfig(configPath)
      await configCache.clear()
      vi.clearAllMocks()

      const result = await configCache.getConfig(configPath)
      expect(result).toEqual(config)
      expect(mockParseConfigFile).toHaveBeenCalledTimes(1)
    })

    test('clear does not affect new ConfigCache instance', async () => {
      const configPath = path.join(tempDir, 'instance-clear.json')
      const config = { files: ['**/*.ts'] }
      await fs.writeFile(configPath, JSON.stringify(config))
      mockParseConfigFile.mockResolvedValue(config)

      const otherDir = path.join(tempDir, 'other-cache')
      const otherCache = new ConfigCache(otherDir)

      await otherCache.getConfig(configPath)
      await configCache.clear()
      vi.clearAllMocks()

      const result = await otherCache.getConfig(configPath)
      expect(result).toEqual(config)
      expect(mockParseConfigFile).not.toHaveBeenCalled()
    })

    test('clear after failed getConfig does not throw', async () => {
      const configPath = path.join(tempDir, 'nonexistent-for-clear.json')
      mockParseConfigFile.mockRejectedValue(new Error('not found'))

      try {
        await configCache.getConfig(configPath)
      } catch {
        void 0
      }

      await expect(configCache.clear()).resolves.not.toThrow()
    })
  })

  describe('error handling - additional', () => {
    test('fallback works when hashFile throws ENOENT', async () => {
      const nonExistent = path.join(tempDir, 'does-not-exist.json')
      const config = { files: ['**/*.ts'] }
      mockParseConfigFile.mockResolvedValueOnce(config)

      const result = await configCache.getConfig(nonExistent)
      expect(result).toEqual(config)
    })

    test('fallback works when hashFile throws EACCES', async () => {
      const configPath = path.join(tempDir, 'no-permission.json')
      const config = { files: ['**/*.ts'] }
      await fs.writeFile(configPath, JSON.stringify(config))

      await fs.chmod(configPath, 0o000)
      mockParseConfigFile.mockResolvedValueOnce(config)

      const result = await configCache.getConfig(configPath)
      expect(result).toEqual(config)

      await fs.chmod(configPath, 0o644)
    })

    test('handles parseConfigFile throwing TypeError', async () => {
      const configPath = path.join(tempDir, 'type-error.json')
      await fs.writeFile(configPath, '{}')
      mockParseConfigFile.mockRejectedValue(new TypeError('Invalid type'))

      await expect(configCache.getConfig(configPath)).rejects.toThrow('Invalid type')
    })

    test('handles parseConfigFile throwing RangeError', async () => {
      const configPath = path.join(tempDir, 'range-error.json')
      await fs.writeFile(configPath, '{}')
      mockParseConfigFile.mockRejectedValue(new RangeError('Out of range'))

      await expect(configCache.getConfig(configPath)).rejects.toThrow('Out of range')
    })

    test('recovers after parseConfigFile throws', async () => {
      const configPath = path.join(tempDir, 'recovery-config.json')
      const configContent = { files: ['**/*.ts'] }
      await fs.writeFile(configPath, JSON.stringify(configContent))

      mockParseConfigFile.mockRejectedValue(new Error('transient'))

      await expect(configCache.getConfig(configPath)).rejects.toThrow('transient')

      vi.clearAllMocks()
      mockParseConfigFile.mockResolvedValueOnce(configContent)

      const result = await configCache.getConfig(configPath)

      expect(result).toEqual(configContent)
    })

    test('handles non-Error thrown from parseConfigFile', async () => {
      const configPath = path.join(tempDir, 'string-throw.json')
      await fs.writeFile(configPath, '{}')
      mockParseConfigFile.mockRejectedValue('string error' as unknown as Error)

      await expect(configCache.getConfig(configPath)).rejects.toBe('string error')
    })

    test('fallback when cache.set fails still returns config', async () => {
      const configPath = path.join(tempDir, 'set-fail.json')
      const config = { files: ['**/*.ts'] }
      await fs.writeFile(configPath, JSON.stringify(config))

      const brokenDir = path.join(tempDir, 'broken-cache')
      await fs.mkdir(brokenDir, { recursive: true })
      await fs.chmod(brokenDir, 0o000)

      const brokenCache = new ConfigCache(brokenDir)
      mockParseConfigFile.mockResolvedValue(config)

      const result = await brokenCache.getConfig(configPath)
      expect(result).toEqual(config)

      await fs.chmod(brokenDir, 0o755)
    })

    test('multiple sequential errors do not corrupt cache', async () => {
      const configPath = path.join(tempDir, 'multi-error.json')
      const config = { files: ['**/*.ts'] }
      await fs.writeFile(configPath, JSON.stringify(config))

      mockParseConfigFile.mockRejectedValue(new Error('error 1'))
      mockParseConfigFile.mockRejectedValue(new Error('error 2'))

      try {
        await configCache.getConfig(configPath)
      } catch {
        void 0
      }
      try {
        await configCache.getConfig(configPath)
      } catch {
        void 0
      }

      vi.clearAllMocks()
      mockParseConfigFile.mockResolvedValueOnce(config)

      const result = await configCache.getConfig(configPath)
      expect(result).toEqual(config)
    })
  })

  describe('concurrent access - additional', () => {
    test('handles 10 concurrent requests for same file', async () => {
      const configPath = path.join(tempDir, 'concurrent-10.json')
      const config = { files: ['**/*.ts'] }
      await fs.writeFile(configPath, JSON.stringify(config))
      mockParseConfigFile.mockResolvedValue(config)

      const results = await Promise.all(
        Array.from({ length: 10 }, () => configCache.getConfig(configPath)),
      )

      results.forEach((r) => expect(r).toEqual(config))
    })

    test('handles concurrent requests for 5 different files', async () => {
      const configs = await Promise.all(
        [1, 2, 3, 4, 5].map(async (i) => {
          const p = path.join(tempDir, `conc-diff-${i}.json`)
          await fs.writeFile(p, JSON.stringify({ files: [`**/*.ts${i}`] }))
          return { path: p, config: { files: [`**/*.ts${i}`] } }
        }),
      )

      mockParseConfigFile.mockImplementation(async (fp: string) => {
        const num = fp.match(/conc-diff-(\d)/)?.[1]
        return { files: [`**/*.ts${num}`] }
      })

      const results = await Promise.all(configs.map((c) => configCache.getConfig(c.path)))

      results.forEach((r, i) => {
        expect(r).toEqual(configs[i].config)
      })
    })

    test('handles concurrent getConfig and clear', async () => {
      const configPath = path.join(tempDir, 'conc-clear.json')
      const config = { files: ['**/*.ts'] }
      await fs.writeFile(configPath, JSON.stringify(config))
      mockParseConfigFile.mockResolvedValue(config)

      await configCache.getConfig(configPath)

      const [, result] = await Promise.all([configCache.clear(), configCache.getConfig(configPath)])

      expect(result).toEqual(config)
    })

    test('handles concurrent getConfig calls after content change', async () => {
      const configPath = path.join(tempDir, 'conc-change.json')
      const v1 = { files: ['**/*.ts'] }
      const v2 = { files: ['**/*.js'] }

      await fs.writeFile(configPath, JSON.stringify(v1))
      mockParseConfigFile.mockResolvedValueOnce(v1)
      await configCache.getConfig(configPath)

      await fs.writeFile(configPath, JSON.stringify(v2))
      vi.clearAllMocks()
      mockParseConfigFile.mockResolvedValue(v2)

      const results = await Promise.all([
        configCache.getConfig(configPath),
        configCache.getConfig(configPath),
      ])

      results.forEach((r) => expect(r).toEqual(v2))
    })
  })

  describe('CacheStore TTL behavior', () => {
    test('cache entry is valid within TTL', async () => {
      const configPath = path.join(tempDir, 'ttl-valid.json')
      const config = { files: ['**/*.ts'] }
      await fs.writeFile(configPath, JSON.stringify(config))
      mockParseConfigFile.mockResolvedValue(config)

      const result1 = await configCache.getConfig(configPath)
      expect(result1).toEqual(config)

      vi.clearAllMocks()
      const result2 = await configCache.getConfig(configPath)
      expect(result2).toEqual(config)
      expect(mockParseConfigFile).not.toHaveBeenCalled()
    })

    test('cache entry is served from disk after process restart simulation', async () => {
      const configPath = path.join(tempDir, 'persist-test.json')
      const config = { files: ['**/*.ts'] }
      await fs.writeFile(configPath, JSON.stringify(config))
      mockParseConfigFile.mockResolvedValue(config)

      await configCache.getConfig(configPath)

      const newCache = new ConfigCache(cacheDir)
      vi.clearAllMocks()

      const result = await newCache.getConfig(configPath)
      expect(result).toEqual(config)
      expect(mockParseConfigFile).not.toHaveBeenCalled()
    })

    test('expired TTL causes cache miss', async () => {
      const configPath = path.join(tempDir, 'ttl-expired.json')
      const config = { files: ['**/*.ts'] }
      await fs.writeFile(configPath, JSON.stringify(config))
      mockParseConfigFile.mockResolvedValue(config)

      await configCache.getConfig(configPath)

      const cacheFiles = await fs.readdir(cacheDir)
      if (cacheFiles.length > 0) {
        const cacheFilePath = path.join(cacheDir, cacheFiles[0])
        const raw = await fs.readFile(cacheFilePath, 'utf-8')
        const parsed = JSON.parse(raw)
        parsed.ttl = 1
        parsed.timestamp = Date.now() - 10000
        await fs.writeFile(cacheFilePath, JSON.stringify(parsed))
      }

      vi.clearAllMocks()
      mockParseConfigFile.mockResolvedValueOnce(config)

      const result = await configCache.getConfig(configPath)
      expect(result).toEqual(config)
      expect(mockParseConfigFile).toHaveBeenCalledTimes(1)
    })
  })

  describe('hashContent utility', () => {
    test('produces consistent hash for same input', () => {
      const h1 = hashContent('hello world')
      const h2 = hashContent('hello world')
      expect(h1).toBe(h2)
    })

    test('produces different hashes for different inputs', () => {
      const h1 = hashContent('hello')
      const h2 = hashContent('world')
      expect(h1).not.toBe(h2)
    })

    test('handles empty string', () => {
      const hash = hashContent('')
      expect(hash).toBeTruthy()
      expect(typeof hash).toBe('string')
    })

    test('produces 64 character hex string', () => {
      const hash = hashContent('test')
      expect(hash).toHaveLength(64)
      expect(hash).toMatch(/^[0-9a-f]+$/)
    })

    test('handles very long string', () => {
      const longContent = 'x'.repeat(100000)
      const hash = hashContent(longContent)
      expect(hash).toHaveLength(64)
    })

    test('handles special characters', () => {
      const hash = hashContent('hello\nworld\t\r\n!@#$%^&*()')
      expect(hash).toHaveLength(64)
    })

    test('handles unicode content', () => {
      const hash = hashContent('日本語テスト 🚀 ñ é ü')
      expect(hash).toHaveLength(64)
    })

    test('different whitespace produces different hash', () => {
      const h1 = hashContent('hello world')
      const h2 = hashContent('hello  world')
      expect(h1).not.toBe(h2)
    })

    test('single character produces valid hash', () => {
      const hash = hashContent('a')
      expect(hash).toHaveLength(64)
    })

    test('numeric string produces valid hash', () => {
      const hash = hashContent('12345')
      expect(hash).toHaveLength(64)
    })

    test('JSON string produces valid hash', () => {
      const hash = hashContent(JSON.stringify({ files: ['**/*.ts'] }))
      expect(hash).toHaveLength(64)
    })

    test('same JSON with different key order may produce same hash', () => {
      const obj = { files: ['**/*.ts'], ignore: ['dist/**'] }
      const h1 = hashContent(JSON.stringify(obj))
      const h2 = hashContent(JSON.stringify(obj))
      expect(h1).toBe(h2)
    })
  })

  describe('CacheStore direct operations', () => {
    test('set and get round-trip works', async () => {
      const store = new CacheStore(path.join(tempDir, 'store-test'))
      await store.set('key1', { value: 'test' })
      const result = await store.get<{ value: string }>('key1')
      expect(result).toEqual({ value: 'test' })
    })

    test('get returns null for non-existent key', async () => {
      const store = new CacheStore(path.join(tempDir, 'store-miss'))
      const result = await store.get('nonexistent')
      expect(result).toBeNull()
    })

    test('has returns true for existing key', async () => {
      const store = new CacheStore(path.join(tempDir, 'store-has'))
      await store.set('exists', 'value')
      const result = await store.has('exists')
      expect(result).toBe(true)
    })

    test('has returns false for non-existent key', async () => {
      const store = new CacheStore(path.join(tempDir, 'store-hasnot'))
      const result = await store.has('missing')
      expect(result).toBe(false)
    })

    test('delete removes an entry', async () => {
      const store = new CacheStore(path.join(tempDir, 'store-delete'))
      await store.set('to-delete', 'value')
      expect(await store.has('to-delete')).toBe(true)
      await store.delete('to-delete')
      expect(await store.has('to-delete')).toBe(false)
    })

    test('delete returns true for existing key', async () => {
      const store = new CacheStore(path.join(tempDir, 'store-del-true'))
      await store.set('del-me', 'value')
      const result = await store.delete('del-me')
      expect(result).toBe(true)
    })

    test('delete returns false for non-existent key', async () => {
      const store = new CacheStore(path.join(tempDir, 'store-del-false'))
      const result = await store.delete('ghost')
      expect(result).toBe(false)
    })

    test('clear removes all entries', async () => {
      const store = new CacheStore(path.join(tempDir, 'store-clear'))
      await store.set('a', 1)
      await store.set('b', 2)
      await store.set('c', 3)
      await store.clear()
      expect(await store.get('a')).toBeNull()
      expect(await store.get('b')).toBeNull()
      expect(await store.get('c')).toBeNull()
    })

    test('getStats returns correct entry count and size', async () => {
      const store = new CacheStore(path.join(tempDir, 'store-stats'))
      await store.set('stat1', { data: 'value1' })
      await store.set('stat2', { data: 'value2' })
      const stats = await store.getStats()
      expect(stats.entries).toBe(2)
      expect(stats.size).toBeGreaterThan(0)
    })

    test('getStats returns zeros for empty cache', async () => {
      const store = new CacheStore(path.join(tempDir, 'store-empty-stats'))
      const stats = await store.getStats()
      expect(stats.entries).toBe(0)
      expect(stats.size).toBe(0)
    })

    test('overwriting a key updates the value', async () => {
      const store = new CacheStore(path.join(tempDir, 'store-overwrite'))
      await store.set('key', 'v1')
      await store.set('key', 'v2')
      const result = await store.get('key')
      expect(result).toBe('v2')
    })

    test('stores complex nested objects', async () => {
      const store = new CacheStore(path.join(tempDir, 'store-complex'))
      const complex = {
        rules: {
          'max-complexity': ['error', { max: 10 }],
          nested: { deep: { value: [1, 2, 3] } },
        },
      }
      await store.set('complex', complex)
      const result = await store.get<typeof complex>('complex')
      expect(result).toEqual(complex)
    })

    test('stores null value', async () => {
      const store = new CacheStore(path.join(tempDir, 'store-null'))
      await store.set('null-key', null)
      const result = await store.get('null-key')
      expect(result).toBeNull()
    })

    test('stores boolean values', async () => {
      const store = new CacheStore(path.join(tempDir, 'store-bool'))
      await store.set('bool-true', true)
      await store.set('bool-false', false)
      expect(await store.get('bool-true')).toBe(true)
      expect(await store.get('bool-false')).toBe(false)
    })

    test('stores numeric values', async () => {
      const store = new CacheStore(path.join(tempDir, 'store-num'))
      await store.set('int', 42)
      await store.set('float', 3.14)
      await store.set('negative', -1)
      await store.set('zero', 0)
      expect(await store.get('int')).toBe(42)
      expect(await store.get('float')).toBe(3.14)
      expect(await store.get('negative')).toBe(-1)
      expect(await store.get('zero')).toBe(0)
    })

    test('stores array values', async () => {
      const store = new CacheStore(path.join(tempDir, 'store-array'))
      await store.set('arr', [1, 'two', true, null])
      const result = await store.get('arr')
      expect(result).toEqual([1, 'two', true, null])
    })

    test('handles keys with special characters', async () => {
      const store = new CacheStore(path.join(tempDir, 'store-special-keys'))
      await store.set('key:with:colons', 'value')
      await store.set('key/with/slashes', 'value')
      await store.set('key with spaces', 'value')
      expect(await store.get('key:with:colons')).toBe('value')
      expect(await store.get('key/with/slashes')).toBe('value')
      expect(await store.get('key with spaces')).toBe('value')
    })

    test('handles very long keys', async () => {
      const store = new CacheStore(path.join(tempDir, 'store-long-key'))
      const longKey = 'k'.repeat(1000)
      await store.set(longKey, 'value')
      expect(await store.get(longKey)).toBe('value')
    })

    test('TTL expiration returns null', async () => {
      const store = new CacheStore(path.join(tempDir, 'store-ttl'))
      await store.set('ttl-key', 'value', 1)
      await new Promise((r) => setTimeout(r, 50))
      const result = await store.get('ttl-key')
      expect(result).toBeNull()
    })

    test('TTL not expired returns value', async () => {
      const store = new CacheStore(path.join(tempDir, 'store-ttl-valid'))
      await store.set('ttl-key', 'value', 60000)
      const result = await store.get('ttl-key')
      expect(result).toBe('value')
    })

    test('corrupted cache file returns null', async () => {
      const store = new CacheStore(path.join(tempDir, 'store-corrupt'))
      const dir = path.join(tempDir, 'store-corrupt')
      await fs.mkdir(dir, { recursive: true })
      const crypto = await import('crypto')
      const safeKey = crypto.createHash('md5').update('corrupt-key').digest('hex')
      await fs.writeFile(path.join(dir, `${safeKey}.json`), 'not valid json{')
      const result = await store.get('corrupt-key')
      expect(result).toBeNull()
    })
  })

  describe('InvalidationManager', () => {
    test('shouldInvalidate returns false for unknown strategy', async () => {
      const store = new CacheStore(path.join(tempDir, 'inv-unknown'))
      const manager = new InvalidationManager(store, '1.0.0')
      const result = await manager.shouldInvalidate('key', 'unknown' as InvalidationStrategy)
      expect(result).toBe(false)
    })

    test('shouldInvalidate returns true for time-based with missing entry', async () => {
      const store = new CacheStore(path.join(tempDir, 'inv-time-miss'))
      const manager = new InvalidationManager(store, '1.0.0')
      const result = await manager.shouldInvalidate('missing', InvalidationStrategy.TimeBased)
      expect(result).toBe(true)
    })

    test('shouldInvalidate returns false for content-based', async () => {
      const store = new CacheStore(path.join(tempDir, 'inv-content'))
      const manager = new InvalidationManager(store, '1.0.0')
      const result = await manager.shouldInvalidate('key', InvalidationStrategy.ContentBased)
      expect(result).toBe(false)
    })

    test('shouldInvalidate returns false for version-based', async () => {
      const store = new CacheStore(path.join(tempDir, 'inv-version'))
      const manager = new InvalidationManager(store, '1.0.0')
      const result = await manager.shouldInvalidate('key', InvalidationStrategy.VersionBased)
      expect(result).toBe(false)
    })

    test('invalidateOnVersionChange detects change', () => {
      const store = new CacheStore(path.join(tempDir, 'inv-version-change'))
      const manager = new InvalidationManager(store, '1.0.0')
      expect(manager.invalidateOnVersionChange('2.0.0')).toBe(true)
    })

    test('invalidateOnVersionChange returns false for same version', () => {
      const store = new CacheStore(path.join(tempDir, 'inv-version-same'))
      const manager = new InvalidationManager(store, '1.0.0')
      expect(manager.invalidateOnVersionChange('1.0.0')).toBe(false)
    })

    test('invalidateOnContentChange detects file change', async () => {
      const store = new CacheStore(path.join(tempDir, 'inv-content-change'))
      const manager = new InvalidationManager(store, '1.0.0')
      const filePath = path.join(tempDir, 'inv-content-file.json')
      await fs.writeFile(filePath, 'original')
      const { hashFile: realHashFile } = await import('../../../src/cache/index')
      const hash = await realHashFile(filePath)
      await fs.writeFile(filePath, 'modified')
      const result = await manager.invalidateOnContentChange(filePath, hash)
      expect(result).toBe(true)
    })

    test('invalidateOnContentChange returns false for unchanged file', async () => {
      const store = new CacheStore(path.join(tempDir, 'inv-content-same'))
      const manager = new InvalidationManager(store, '1.0.0')
      const filePath = path.join(tempDir, 'inv-content-same-file.json')
      await fs.writeFile(filePath, 'unchanged')
      const { hashFile: realHashFile } = await import('../../../src/cache/index')
      const hash = await realHashFile(filePath)
      const result = await manager.invalidateOnContentChange(filePath, hash)
      expect(result).toBe(false)
    })

    test('time-based invalidation with expired entry', async () => {
      const store = new CacheStore(path.join(tempDir, 'inv-time-expired'))
      const manager = new InvalidationManager(store, '1.0.0')
      await store.set('timed', { timestamp: Date.now() - 10000, ttl: 1 })
      const result = await manager.shouldInvalidate('timed', InvalidationStrategy.TimeBased)
      expect(result).toBe(true)
    })

    test('time-based invalidation with valid entry', async () => {
      const store = new CacheStore(path.join(tempDir, 'inv-time-valid'))
      const manager = new InvalidationManager(store, '1.0.0')
      await store.set('timed', { timestamp: Date.now(), ttl: 60000 })
      const result = await manager.shouldInvalidate('timed', InvalidationStrategy.TimeBased)
      expect(result).toBe(false)
    })
  })

  describe('createDefaultCache', () => {
    test('creates CacheStore instance', async () => {
      const { createDefaultCache } = await import('../../../src/cache/index')
      const cache = createDefaultCache()
      expect(cache).toBeInstanceOf(CacheStore)
    })
  })

  describe('createDefaultInvalidationManager', () => {
    test('creates InvalidationManager instance', async () => {
      const { createDefaultInvalidationManager, CacheStore: CS } =
        await import('../../../src/cache/index')
      const manager = createDefaultInvalidationManager(
        new CS(path.join(tempDir, 'def-inv')),
        '1.0.0',
      )
      expect(manager).toBeInstanceOf(InvalidationManager)
    })
  })

  describe('InvalidationStrategy enum', () => {
    test('TimeBased has correct value', () => {
      expect(InvalidationStrategy.TimeBased).toBe('time-based')
    })

    test('ContentBased has correct value', () => {
      expect(InvalidationStrategy.ContentBased).toBe('content-based')
    })

    test('VersionBased has correct value', () => {
      expect(InvalidationStrategy.VersionBased).toBe('version-based')
    })
  })

  describe('hashFile function', () => {
    test('produces consistent hash for same file', async () => {
      const { hashFile: realHashFile } = await import('../../../src/cache/index')
      const filePath = path.join(tempDir, 'hashfile-consistent.txt')
      await fs.writeFile(filePath, 'consistent content')
      const h1 = await realHashFile(filePath)
      const h2 = await realHashFile(filePath)
      expect(h1).toBe(h2)
    })

    test('produces different hash for different content', async () => {
      const { hashFile: realHashFile } = await import('../../../src/cache/index')
      const filePath = path.join(tempDir, 'hashfile-diff.txt')
      await fs.writeFile(filePath, 'content a')
      const h1 = await realHashFile(filePath)
      await fs.writeFile(filePath, 'content b')
      const h2 = await realHashFile(filePath)
      expect(h1).not.toBe(h2)
    })

    test('produces 64 character hex string', async () => {
      const { hashFile: realHashFile } = await import('../../../src/cache/index')
      const filePath = path.join(tempDir, 'hashfile-format.txt')
      await fs.writeFile(filePath, 'format test')
      const hash = await realHashFile(filePath)
      expect(hash).toHaveLength(64)
      expect(hash).toMatch(/^[0-9a-f]+$/)
    })

    test('throws for non-existent file', async () => {
      const { hashFile: realHashFile } = await import('../../../src/cache/index')
      await expect(realHashFile('/nonexistent/file.txt')).rejects.toThrow()
    })

    test('handles empty file', async () => {
      const { hashFile: realHashFile } = await import('../../../src/cache/index')
      const filePath = path.join(tempDir, 'hashfile-empty.txt')
      await fs.writeFile(filePath, '')
      const hash = await realHashFile(filePath)
      expect(hash).toHaveLength(64)
    })

    test('handles large file', async () => {
      const { hashFile: realHashFile } = await import('../../../src/cache/index')
      const filePath = path.join(tempDir, 'hashfile-large.txt')
      await fs.writeFile(filePath, 'x'.repeat(100000))
      const hash = await realHashFile(filePath)
      expect(hash).toHaveLength(64)
    })

    test('handles binary content', async () => {
      const { hashFile: realHashFile } = await import('../../../src/cache/index')
      const filePath = path.join(tempDir, 'hashfile-binary.bin')
      await fs.writeFile(filePath, Buffer.from([0, 1, 2, 255, 254, 253]))
      const hash = await realHashFile(filePath)
      expect(hash).toHaveLength(64)
    })

    test('handles unicode content', async () => {
      const { hashFile: realHashFile } = await import('../../../src/cache/index')
      const filePath = path.join(tempDir, 'hashfile-unicode.txt')
      await fs.writeFile(filePath, '日本語 ñ é ü 🚀')
      const hash = await realHashFile(filePath)
      expect(hash).toHaveLength(64)
    })
  })

  describe('CONFIG_FILE_NAMES constant', () => {
    test('includes .codeforgerc', async () => {
      const { CONFIG_FILE_NAMES } = await import('../../../src/config/types')
      expect(CONFIG_FILE_NAMES).toContain('.codeforgerc')
    })

    test('includes .codeforgerc.json', async () => {
      const { CONFIG_FILE_NAMES } = await import('../../../src/config/types')
      expect(CONFIG_FILE_NAMES).toContain('.codeforgerc.json')
    })

    test('includes .codeforge.json', async () => {
      const { CONFIG_FILE_NAMES } = await import('../../../src/config/types')
      expect(CONFIG_FILE_NAMES).toContain('.codeforge.json')
    })

    test('includes codeforge.config.js', async () => {
      const { CONFIG_FILE_NAMES } = await import('../../../src/config/types')
      expect(CONFIG_FILE_NAMES).toContain('codeforge.config.js')
    })

    test('has exactly 4 entries', async () => {
      const { CONFIG_FILE_NAMES } = await import('../../../src/config/types')
      expect(CONFIG_FILE_NAMES).toHaveLength(4)
    })
  })

  describe('DEFAULT_CONFIG constant', () => {
    test('has files array', async () => {
      const { DEFAULT_CONFIG } = await import('../../../src/config/types')
      expect(DEFAULT_CONFIG.files).toBeDefined()
      expect(Array.isArray(DEFAULT_CONFIG.files)).toBe(true)
    })

    test('has ignore array', async () => {
      const { DEFAULT_CONFIG } = await import('../../../src/config/types')
      expect(DEFAULT_CONFIG.ignore).toBeDefined()
      expect(Array.isArray(DEFAULT_CONFIG.ignore)).toBe(true)
    })

    test('files includes TypeScript patterns', async () => {
      const { DEFAULT_CONFIG } = await import('../../../src/config/types')
      expect(DEFAULT_CONFIG.files).toContain('**/*.ts')
      expect(DEFAULT_CONFIG.files).toContain('**/*.tsx')
    })

    test('files includes JavaScript patterns', async () => {
      const { DEFAULT_CONFIG } = await import('../../../src/config/types')
      expect(DEFAULT_CONFIG.files).toContain('**/*.js')
      expect(DEFAULT_CONFIG.files).toContain('**/*.jsx')
    })

    test('ignore includes node_modules', async () => {
      const { DEFAULT_CONFIG } = await import('../../../src/config/types')
      expect(DEFAULT_CONFIG.ignore).toContain('node_modules/**')
    })

    test('ignore includes dist', async () => {
      const { DEFAULT_CONFIG } = await import('../../../src/config/types')
      expect(DEFAULT_CONFIG.ignore).toContain('dist/**')
    })

    test('ignore includes coverage', async () => {
      const { DEFAULT_CONFIG } = await import('../../../src/config/types')
      expect(DEFAULT_CONFIG.ignore).toContain('coverage/**')
    })
  })

  describe('getConfig - multiple file scenarios', () => {
    test('caches 10 different files independently', async () => {
      const configs = await Promise.all(
        Array.from({ length: 10 }, (_, i) =>
          fs
            .writeFile(
              path.join(tempDir, `multi-${i}.json`),
              JSON.stringify({ files: [`**/*.${i}`] }),
            )
            .then(() => path.join(tempDir, `multi-${i}.json`)),
        ),
      )

      mockParseConfigFile.mockImplementation(async (fp: string) => {
        const num = fp.match(/multi-(\d)/)?.[1]
        return { files: [`**/*.${num}`] }
      })

      await Promise.all(configs.map((p) => configCache.getConfig(p)))
      vi.clearAllMocks()

      for (let i = 0; i < 10; i++) {
        const result = await configCache.getConfig(configs[i])
        expect(result?.files?.[0]).toBe(`**/*.${i}`)
      }
      expect(mockParseConfigFile).not.toHaveBeenCalled()
    })

    test('modifying one file does not affect others', async () => {
      const path1 = path.join(tempDir, 'indep-1.json')
      const path2 = path.join(tempDir, 'indep-2.json')
      const config1 = { files: ['**/*.ts'] }
      const config2 = { files: ['**/*.js'] }

      await fs.writeFile(path1, JSON.stringify(config1))
      await fs.writeFile(path2, JSON.stringify(config2))
      mockParseConfigFile.mockResolvedValueOnce(config1)
      mockParseConfigFile.mockResolvedValueOnce(config2)

      await configCache.getConfig(path1)
      await configCache.getConfig(path2)

      const newConfig1 = { files: ['**/*.tsx'] }
      await fs.writeFile(path1, JSON.stringify(newConfig1))
      vi.clearAllMocks()
      mockParseConfigFile.mockResolvedValueOnce(newConfig1)

      await configCache.getConfig(path1)
      const result2 = await configCache.getConfig(path2)
      expect(result2).toEqual(config2)
      expect(mockParseConfigFile).toHaveBeenCalledTimes(1)
    })
  })

  describe('getConfig - boundary conditions', () => {
    test('handles config with empty string in files array', async () => {
      const configPath = path.join(tempDir, 'empty-string-files.json')
      const config = { files: [''] }
      await fs.writeFile(configPath, JSON.stringify(config))
      mockParseConfigFile.mockResolvedValueOnce(config)
      const result = await configCache.getConfig(configPath)
      expect(result).toEqual(config)
    })

    test('handles config with duplicate file patterns', async () => {
      const configPath = path.join(tempDir, 'dup-patterns.json')
      const config = { files: ['**/*.ts', '**/*.ts', '**/*.ts'] }
      await fs.writeFile(configPath, JSON.stringify(config))
      mockParseConfigFile.mockResolvedValueOnce(config)
      const result = await configCache.getConfig(configPath)
      expect(result).toEqual(config)
    })

    test('handles config with very long pattern string', async () => {
      const configPath = path.join(tempDir, 'long-pattern.json')
      const longPattern = 'src/' + 'subdir/'.repeat(100) + '**/*.ts'
      const config = { files: [longPattern] }
      await fs.writeFile(configPath, JSON.stringify(config))
      mockParseConfigFile.mockResolvedValueOnce(config)
      const result = await configCache.getConfig(configPath)
      expect(result).toEqual(config)
    })

    test('handles config with many ignore patterns', async () => {
      const configPath = path.join(tempDir, 'many-ignores.json')
      const config = { ignore: Array.from({ length: 100 }, (_, i) => `ignore${i}/**`) }
      await fs.writeFile(configPath, JSON.stringify(config))
      mockParseConfigFile.mockResolvedValueOnce(config)
      const result = await configCache.getConfig(configPath)
      expect(result).toEqual(config)
    })

    test('getConfig returns null when parseConfigFile returns null', async () => {
      const configPath = path.join(tempDir, 'null-parse.json')
      await fs.writeFile(configPath, '{}')
      mockParseConfigFile.mockResolvedValueOnce(null)
      const result = await configCache.getConfig(configPath)
      expect(result).toBeNull()
    })
  })

  describe('CacheStore clear and getStats interaction', () => {
    test('stats updates after clear', async () => {
      const store = new CacheStore(path.join(tempDir, 'stats-clear'))
      await store.set('a', 1)
      await store.set('b', 2)
      const before = await store.getStats()
      expect(before.entries).toBe(2)
      await store.clear()
      const after = await store.getStats()
      expect(after.entries).toBe(0)
      expect(after.size).toBe(0)
    })

    test('stats updates after individual deletes', async () => {
      const store = new CacheStore(path.join(tempDir, 'stats-delete'))
      await store.set('x', 1)
      await store.set('y', 2)
      await store.delete('x')
      const stats = await store.getStats()
      expect(stats.entries).toBe(1)
    })

    test('stats reflects overwritten entries', async () => {
      const store = new CacheStore(path.join(tempDir, 'stats-overwrite'))
      await store.set('key', 'short')
      const before = await store.getStats()
      await store.set('key', 'much longer value that takes more bytes')
      const after = await store.getStats()
      expect(after.entries).toBe(1)
      expect(after.size).toBeGreaterThan(before.size)
    })
  })

  describe('getConfig - cache miss triggers parseConfigFile', () => {
    test('calls parseConfigFile with correct file path', async () => {
      const configPath = path.join(tempDir, 'parse-arg-test.json')
      const config = { files: ['**/*.ts'] }
      await fs.writeFile(configPath, JSON.stringify(config))
      mockParseConfigFile.mockResolvedValueOnce(config)

      await configCache.getConfig(configPath)
      expect(mockParseConfigFile).toHaveBeenCalledWith(configPath)
    })

    test('returns parsed config on cache miss', async () => {
      const configPath = path.join(tempDir, 'miss-return.json')
      const config: CodeForgeConfig = { files: ['**/*.ts'], rules: { 'no-eval': 'error' } }
      await fs.writeFile(configPath, JSON.stringify(config))
      mockParseConfigFile.mockResolvedValueOnce(config)

      const result = await configCache.getConfig(configPath)
      expect(result).toEqual(config)
    })

    test('stores result in cache after parse', async () => {
      const configPath = path.join(tempDir, 'store-after-parse.json')
      const config = { files: ['**/*.ts'] }
      await fs.writeFile(configPath, JSON.stringify(config))
      mockParseConfigFile.mockResolvedValueOnce(config)

      await configCache.getConfig(configPath)
      const callCount = mockParseConfigFile.mock.calls.length

      const result = await configCache.getConfig(configPath)
      expect(result).toEqual(config)
      expect(mockParseConfigFile.mock.calls.length).toBe(callCount)
    })
  })

  describe('getConfig - fallback behavior', () => {
    test('falls back to parseConfigFile when hashFile fails', async () => {
      const missingFile = path.join(tempDir, 'nonexistent', 'missing.json')
      const config = { files: ['**/*.ts'] }
      mockParseConfigFile.mockResolvedValueOnce(config)

      const result = await configCache.getConfig(missingFile)
      expect(result).toEqual(config)
    })

    test('returns null when both cache and parse fail', async () => {
      const configPath = path.join(tempDir, 'double-fail.json')
      await fs.writeFile(configPath, '{}')
      mockParseConfigFile.mockResolvedValueOnce(null)

      const result = await configCache.getConfig(configPath)
      expect(result).toBeNull()
    })
  })

  describe('getConfig - rapid sequential modifications', () => {
    test('detects changes across rapid file modifications', async () => {
      const configPath = path.join(tempDir, 'rapid-change.json')
      mockParseConfigFile.mockResolvedValueOnce({ files: ['**/*.v0'] })
      await fs.writeFile(configPath, JSON.stringify({ files: ['**/*.v0'] }))
      const r0 = await configCache.getConfig(configPath)
      expect(r0).toEqual({ files: ['**/*.v0'] })

      for (let i = 1; i <= 3; i++) {
        const config = { files: [`**/*.v${i}`] }
        await fs.writeFile(configPath, JSON.stringify(config))
        mockParseConfigFile.mockResolvedValueOnce(config)
        const r = await configCache.getConfig(configPath)
        expect(r).toEqual(config)
      }
    })
  })

  describe('getConfig - concurrent with modifications', () => {
    test('concurrent reads after modification all get new content', async () => {
      const configPath = path.join(tempDir, 'conc-mod.json')
      const v1 = { files: ['**/*.v1'] }
      const v2 = { files: ['**/*.v2'] }

      await fs.writeFile(configPath, JSON.stringify(v1))
      mockParseConfigFile.mockResolvedValueOnce(v1)
      await configCache.getConfig(configPath)

      await fs.writeFile(configPath, JSON.stringify(v2))
      mockParseConfigFile.mockResolvedValue(v2)

      const results = await Promise.all([
        configCache.getConfig(configPath),
        configCache.getConfig(configPath),
      ])
      results.forEach((r) => expect(r).toEqual(v2))
    })
  })

  describe('CacheStore - edge cases', () => {
    test('stores empty string value', async () => {
      const store = new CacheStore(path.join(tempDir, 'edge-empty-str'))
      await store.set('empty', '')
      expect(await store.get('empty')).toBe('')
    })

    test('stores zero value', async () => {
      const store = new CacheStore(path.join(tempDir, 'edge-zero'))
      await store.set('zero', 0)
      expect(await store.get('zero')).toBe(0)
    })

    test('stores false value distinct from null', async () => {
      const store = new CacheStore(path.join(tempDir, 'edge-false'))
      await store.set('false-key', false)
      const result = await store.get('false-key')
      expect(result).toBe(false)
      expect(result).not.toBeNull()
    })

    test('stores deeply nested object', async () => {
      const store = new CacheStore(path.join(tempDir, 'edge-deep'))
      const deep = { a: { b: { c: { d: { e: 'deep' } } } } }
      await store.set('deep', deep)
      expect(await store.get('deep')).toEqual(deep)
    })

    test('stores array of objects', async () => {
      const store = new CacheStore(path.join(tempDir, 'edge-arr-obj'))
      const data = [
        { id: 1, name: 'a' },
        { id: 2, name: 'b' },
      ]
      await store.set('arr-obj', data)
      expect(await store.get('arr-obj')).toEqual(data)
    })

    test('get after delete returns null', async () => {
      const store = new CacheStore(path.join(tempDir, 'edge-get-del'))
      await store.set('temp', 'value')
      await store.delete('temp')
      expect(await store.get('temp')).toBeNull()
    })

    test('has after clear returns false', async () => {
      const store = new CacheStore(path.join(tempDir, 'edge-has-clear'))
      await store.set('a', 1)
      await store.set('b', 2)
      await store.clear()
      expect(await store.has('a')).toBe(false)
      expect(await store.has('b')).toBe(false)
    })

    test('clear on non-existent directory does not throw', async () => {
      const store = new CacheStore(path.join(tempDir, 'edge-clear-noop'))
      await expect(store.clear()).resolves.not.toThrow()
    })

    test('multiple overwrites keep latest value', async () => {
      const store = new CacheStore(path.join(tempDir, 'edge-multi-overwrite'))
      for (let i = 0; i < 10; i++) {
        await store.set('key', `v${i}`)
      }
      expect(await store.get('key')).toBe('v9')
    })

    test('independent keys do not interfere', async () => {
      const store = new CacheStore(path.join(tempDir, 'edge-independent'))
      await store.set('k1', 'v1')
      await store.set('k2', 'v2')
      await store.delete('k1')
      expect(await store.get('k2')).toBe('v2')
    })
  })

  describe('hashContent - deterministic behavior', () => {
    test('same input always produces same hash across calls', () => {
      for (let i = 0; i < 10; i++) {
        expect(hashContent('deterministic')).toBe(hashContent('deterministic'))
      }
    })

    test('different inputs produce different hashes', () => {
      const hashes = new Set<string>()
      for (let i = 0; i < 50; i++) {
        hashes.add(hashContent(`input-${i}`))
      }
      expect(hashes.size).toBe(50)
    })

    test('produces consistent hash for multi-line string', () => {
      const multiLine = 'line1\nline2\nline3'
      const h1 = hashContent(multiLine)
      const h2 = hashContent(multiLine)
      expect(h1).toBe(h2)
    })
  })

  describe('getConfig - clear between operations', () => {
    test('clear between two getConfigs forces re-parse', async () => {
      const configPath = path.join(tempDir, 'clear-between.json')
      const v1 = { files: ['**/*.v1'] }
      const v2 = { files: ['**/*.v2'] }

      await fs.writeFile(configPath, JSON.stringify(v1))
      mockParseConfigFile.mockResolvedValueOnce(v1)
      await configCache.getConfig(configPath)

      await configCache.clear()

      await fs.writeFile(configPath, JSON.stringify(v2))
      mockParseConfigFile.mockResolvedValueOnce(v2)
      const result = await configCache.getConfig(configPath)
      expect(result).toEqual(v2)
      expect(mockParseConfigFile).toHaveBeenCalledTimes(2)
    })

    test('clear then immediate getConfig works', async () => {
      const configPath = path.join(tempDir, 'clear-immediate.json')
      const config = { files: ['**/*.ts'] }
      await fs.writeFile(configPath, JSON.stringify(config))
      mockParseConfigFile.mockResolvedValueOnce(config)

      await configCache.clear()
      const result = await configCache.getConfig(configPath)
      expect(result).toEqual(config)
    })
  })

  describe('getConfig - special file content', () => {
    test('handles config with unicode in file patterns', async () => {
      const configPath = path.join(tempDir, 'unicode-config.json')
      const config = { files: ['src/日本語/**/*.ts'] }
      await fs.writeFile(configPath, JSON.stringify(config))
      mockParseConfigFile.mockResolvedValueOnce(config)
      const result = await configCache.getConfig(configPath)
      expect(result).toEqual(config)
    })

    test('handles config with emoji in ignore patterns', async () => {
      const configPath = path.join(tempDir, 'emoji-config.json')
      const config = { ignore: ['🚀/**'] }
      await fs.writeFile(configPath, JSON.stringify(config))
      mockParseConfigFile.mockResolvedValueOnce(config)
      const result = await configCache.getConfig(configPath)
      expect(result).toEqual(config)
    })

    test('handles config with regex-like patterns', async () => {
      const configPath = path.join(tempDir, 'regex-config.json')
      const config = { files: ['src/**/(*.spec|*.test).ts'] }
      await fs.writeFile(configPath, JSON.stringify(config))
      mockParseConfigFile.mockResolvedValueOnce(config)
      const result = await configCache.getConfig(configPath)
      expect(result).toEqual(config)
    })
  })

  describe('InvalidationManager - edge cases', () => {
    test('version change with empty string', () => {
      const store = new CacheStore(path.join(tempDir, 'inv-empty-ver'))
      const manager = new InvalidationManager(store, '')
      expect(manager.invalidateOnVersionChange('1.0.0')).toBe(true)
    })

    test('version change with same empty string', () => {
      const store = new CacheStore(path.join(tempDir, 'inv-same-empty'))
      const manager = new InvalidationManager(store, '')
      expect(manager.invalidateOnVersionChange('')).toBe(false)
    })

    test('version change with prerelease version', () => {
      const store = new CacheStore(path.join(tempDir, 'inv-prerelease'))
      const manager = new InvalidationManager(store, '1.0.0-alpha.1')
      expect(manager.invalidateOnVersionChange('1.0.0-alpha.2')).toBe(true)
    })

    test('content change with non-existent file rejects', async () => {
      const store = new CacheStore(path.join(tempDir, 'inv-nonexist'))
      const manager = new InvalidationManager(store, '1.0.0')
      await expect(
        manager.invalidateOnContentChange('/nonexistent/file.txt', 'hash'),
      ).rejects.toThrow()
    })
  })

  describe('CacheStore - TTL edge cases', () => {
    test('TTL of 0 is treated as no TTL (falsy check)', async () => {
      const store = new CacheStore(path.join(tempDir, 'ttl-zero'))
      await store.set('zero-ttl', 'value', 0)
      const result = await store.get('zero-ttl')
      expect(result).toBe('value')
    })

    test('large TTL value does not expire', async () => {
      const store = new CacheStore(path.join(tempDir, 'ttl-large'))
      await store.set('large-ttl', 'value', 365 * 24 * 60 * 60 * 1000)
      const result = await store.get('large-ttl')
      expect(result).toBe('value')
    })

    test('undefined TTL means no expiration', async () => {
      const store = new CacheStore(path.join(tempDir, 'ttl-undefined'))
      await store.set('no-ttl', 'value')
      const result = await store.get('no-ttl')
      expect(result).toBe('value')
    })
  })

  describe('getConfig - repeated clear cycles', () => {
    test('supports multiple cache-populate-clear cycles', async () => {
      const configPath = path.join(tempDir, 'cycle-config.json')

      for (let i = 0; i < 3; i++) {
        const config = { files: [`**/*.v${i}`] }
        await fs.writeFile(configPath, JSON.stringify(config))
        mockParseConfigFile.mockResolvedValueOnce(config)
        const result = await configCache.getConfig(configPath)
        expect(result).toEqual(config)
        await configCache.clear()
      }
      expect(mockParseConfigFile).toHaveBeenCalledTimes(3)
    })
  })

  describe('getConfig - mixed operations', () => {
    test('interleaved getConfig and clear calls', async () => {
      const path1 = path.join(tempDir, 'inter-1.json')
      const path2 = path.join(tempDir, 'inter-2.json')
      const c1 = { files: ['**/*.ts'] }
      const c2 = { files: ['**/*.js'] }

      await fs.writeFile(path1, JSON.stringify(c1))
      await fs.writeFile(path2, JSON.stringify(c2))

      mockParseConfigFile.mockResolvedValueOnce(c1)
      await configCache.getConfig(path1)

      mockParseConfigFile.mockResolvedValueOnce(c2)
      await configCache.getConfig(path2)

      await configCache.clear()

      mockParseConfigFile.mockResolvedValueOnce(c1)
      mockParseConfigFile.mockResolvedValueOnce(c2)
      await configCache.getConfig(path1)
      await configCache.getConfig(path2)

      expect(mockParseConfigFile).toHaveBeenCalledTimes(4)
    })
  })

  describe('CacheStore - key hashing', () => {
    test('keys with same prefix but different suffixes do not collide', async () => {
      const store = new CacheStore(path.join(tempDir, 'key-prefix'))
      await store.set('prefix:a', 'val-a')
      await store.set('prefix:b', 'val-b')
      expect(await store.get('prefix:a')).toBe('val-a')
      expect(await store.get('prefix:b')).toBe('val-b')
    })

    test('case-sensitive keys are distinct', async () => {
      const store = new CacheStore(path.join(tempDir, 'key-case'))
      await store.set('Key', 'upper')
      await store.set('key', 'lower')
      expect(await store.get('Key')).toBe('upper')
      expect(await store.get('key')).toBe('lower')
    })

    test('unicode keys work correctly', async () => {
      const store = new CacheStore(path.join(tempDir, 'key-unicode'))
      await store.set('日本語', 'japanese')
      expect(await store.get('日本語')).toBe('japanese')
    })

    test('emoji keys work correctly', async () => {
      const store = new CacheStore(path.join(tempDir, 'key-emoji'))
      await store.set('🔑', 'secret')
      expect(await store.get('🔑')).toBe('secret')
    })

    test('very long key-value pair works', async () => {
      const store = new CacheStore(path.join(tempDir, 'key-long-kv'))
      const longKey = 'k'.repeat(500)
      const longVal = 'v'.repeat(500)
      await store.set(longKey, longVal)
      expect(await store.get(longKey)).toBe(longVal)
    })
  })
})
