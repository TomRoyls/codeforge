import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { CodeForgeConfig } from '../../src/config/types.js'

import { ConfigCache } from '../../src/config/cache.js'

// ─── Mocks ───

const mockCacheStoreInstance = {
  get: vi.fn<() => Promise<unknown>>(),
  set: vi.fn<() => Promise<void>>(),
  clear: vi.fn<() => Promise<void>>(),
}

vi.mock('../../src/cache/index.js', () => ({
  CacheStore: vi.fn(function (this: unknown) { return mockCacheStoreInstance }),
  hashFile: vi.fn<() => Promise<string>>(),
}))

vi.mock('../../src/config/parser.js', () => ({
  parseConfigFile: vi.fn<() => Promise<CodeForgeConfig>>(),
}))

vi.mock('../../src/utils/logger.js', () => ({
  logger: { debug: vi.fn(), warn: vi.fn(), info: vi.fn(), error: vi.fn() },
}))

// ─── Helpers ───

function makeConfig(overrides: Partial<CodeForgeConfig> = {}): CodeForgeConfig {
  return { files: ['**/*.ts'], ...overrides }
}

// ─── clear ───

describe('ConfigCache', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('clear', () => {
    it('delegates to CacheStore.clear()', async () => {
      const configCache = new ConfigCache()
      mockCacheStoreInstance.clear.mockResolvedValueOnce(undefined)

      await configCache.clear()

      expect(mockCacheStoreInstance.clear).toHaveBeenCalledOnce()
    })
  })

  // ─── getConfig ───

  describe('getConfig', () => {
    it('parses and caches config on cache miss', async () => {
      const { hashFile } = await import('../../src/cache/index.js')
      const { parseConfigFile } = await import('../../src/config/parser.js')
      const filePath = '/project/.codeforgerc.json'
      const fileHash = 'abc123'
      const config = makeConfig()

      vi.mocked(hashFile).mockResolvedValueOnce(fileHash)
      mockCacheStoreInstance.get.mockResolvedValueOnce(null)
      vi.mocked(parseConfigFile).mockResolvedValueOnce(config)
      mockCacheStoreInstance.set.mockResolvedValueOnce(undefined)

      const result = await new ConfigCache().getConfig(filePath)

      expect(result).toEqual(config)
      expect(hashFile).toHaveBeenCalledWith(filePath)
      expect(parseConfigFile).toHaveBeenCalledWith(filePath)
    })

    it('stores parsed config with correct cache key format', async () => {
      const { hashFile } = await import('../../src/cache/index.js')
      const { parseConfigFile } = await import('../../src/config/parser.js')
      const filePath = '/project/.codeforgerc.json'
      const fileHash = 'deadbeef'
      const config = makeConfig()

      vi.mocked(hashFile).mockResolvedValueOnce(fileHash)
      mockCacheStoreInstance.get.mockResolvedValueOnce(null)
      vi.mocked(parseConfigFile).mockResolvedValueOnce(config)
      mockCacheStoreInstance.set.mockResolvedValueOnce(undefined)

      await new ConfigCache().getConfig(filePath)

      const expectedKey = `config:${filePath}:${fileHash}`
      expect(mockCacheStoreInstance.set).toHaveBeenCalledWith(expectedKey, config)
    })

    it('returns cached config on cache hit without parsing', async () => {
      const { hashFile } = await import('../../src/cache/index.js')
      const { parseConfigFile } = await import('../../src/config/parser.js')
      const filePath = '/project/.codeforgerc.json'
      const config = makeConfig({ files: ['**/*.js'] })

      vi.mocked(hashFile).mockResolvedValueOnce('hash1')
      mockCacheStoreInstance.get.mockResolvedValueOnce(config)

      const result = await new ConfigCache().getConfig(filePath)

      expect(result).toEqual(config)
      expect(parseConfigFile).not.toHaveBeenCalled()
      expect(mockCacheStoreInstance.set).not.toHaveBeenCalled()
    })

    it('returns cached config matching exact type', async () => {
      const { hashFile } = await import('../../src/cache/index.js')
      const config: CodeForgeConfig = {
        files: ['src/**/*.ts'],
        ignore: ['node_modules/**'],
        rules: { 'max-params': 'error' },
      }

      vi.mocked(hashFile).mockResolvedValueOnce('h1')
      mockCacheStoreInstance.get.mockResolvedValueOnce(config)

      const result = await new ConfigCache().getConfig('cfg.json')

      expect(result).toEqual(config)
      expect(result!.files).toEqual(['src/**/*.ts'])
      expect(result!.ignore).toEqual(['node_modules/**'])
      expect(result!.rules).toEqual({ 'max-params': 'error' })
    })

    it('falls back to parseConfigFile when hashFile throws', async () => {
      const { hashFile } = await import('../../src/cache/index.js')
      const { parseConfigFile } = await import('../../src/config/parser.js')
      const filePath = '/project/missing.json'
      const config = makeConfig()

      vi.mocked(hashFile).mockRejectedValueOnce(new Error('ENOENT'))
      vi.mocked(parseConfigFile).mockResolvedValueOnce(config)

      const result = await new ConfigCache().getConfig(filePath)

      expect(result).toEqual(config)
      expect(parseConfigFile).toHaveBeenCalledWith(filePath)
    })

    it('falls back to parseConfigFile when cache.get throws', async () => {
      const { hashFile } = await import('../../src/cache/index.js')
      const { parseConfigFile } = await import('../../src/config/parser.js')
      const filePath = '/project/.codeforgerc.json'
      const config = makeConfig()

      vi.mocked(hashFile).mockResolvedValueOnce('hash')
      mockCacheStoreInstance.get.mockRejectedValueOnce(new Error('disk error'))
      vi.mocked(parseConfigFile).mockResolvedValueOnce(config)

      const result = await new ConfigCache().getConfig(filePath)

      expect(result).toEqual(config)
      expect(parseConfigFile).toHaveBeenCalledWith(filePath)
    })

    it('does not cache when falling back due to error', async () => {
      const { hashFile } = await import('../../src/cache/index.js')
      const { parseConfigFile } = await import('../../src/config/parser.js')
      const filePath = '/project/.codeforgerc.json'
      const config = makeConfig()

      vi.mocked(hashFile).mockRejectedValueOnce(new Error('fail'))
      vi.mocked(parseConfigFile).mockResolvedValueOnce(config)

      await new ConfigCache().getConfig(filePath)

      expect(mockCacheStoreInstance.set).not.toHaveBeenCalled()
    })

    it('uses different cache keys for different file paths', async () => {
      const { hashFile } = await import('../../src/cache/index.js')
      const { parseConfigFile } = await import('../../src/config/parser.js')
      const config1 = makeConfig({ files: ['**/*.ts'] })
      const config2 = makeConfig({ files: ['**/*.js'] })

      vi.mocked(hashFile).mockResolvedValueOnce('samehash')
      mockCacheStoreInstance.get.mockResolvedValueOnce(null)
      vi.mocked(parseConfigFile).mockResolvedValueOnce(config1)
      mockCacheStoreInstance.set.mockResolvedValueOnce(undefined)

      await new ConfigCache().getConfig('/a/config.json')

      vi.mocked(hashFile).mockResolvedValueOnce('samehash')
      mockCacheStoreInstance.get.mockResolvedValueOnce(null)
      vi.mocked(parseConfigFile).mockResolvedValueOnce(config2)
      mockCacheStoreInstance.set.mockResolvedValueOnce(undefined)

      await new ConfigCache().getConfig('/b/config.json')

      expect(mockCacheStoreInstance.set).toHaveBeenCalledWith('config:/a/config.json:samehash', config1)
      expect(mockCacheStoreInstance.set).toHaveBeenCalledWith('config:/b/config.json:samehash', config2)
    })

    it('uses different cache keys for same path with different hashes', async () => {
      const { hashFile } = await import('../../src/cache/index.js')
      const { parseConfigFile } = await import('../../src/config/parser.js')
      const config1 = makeConfig()
      const config2 = makeConfig({ files: ['**/*.tsx'] })

      vi.mocked(hashFile).mockResolvedValueOnce('hash-v1')
      mockCacheStoreInstance.get.mockResolvedValueOnce(null)
      vi.mocked(parseConfigFile).mockResolvedValueOnce(config1)
      mockCacheStoreInstance.set.mockResolvedValueOnce(undefined)

      await new ConfigCache().getConfig('cfg.json')

      vi.mocked(hashFile).mockResolvedValueOnce('hash-v2')
      mockCacheStoreInstance.get.mockResolvedValueOnce(null)
      vi.mocked(parseConfigFile).mockResolvedValueOnce(config2)
      mockCacheStoreInstance.set.mockResolvedValueOnce(undefined)

      await new ConfigCache().getConfig('cfg.json')

      expect(mockCacheStoreInstance.set).toHaveBeenCalledWith('config:cfg.json:hash-v1', config1)
      expect(mockCacheStoreInstance.set).toHaveBeenCalledWith('config:cfg.json:hash-v2', config2)
    })
  })
})
