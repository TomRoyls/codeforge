import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { createMockSourceFile } from '../../helpers/ast-helpers.js'
import { ParseCache } from '../../../src/cache/parse-cache.js'

vi.mock('node:fs', () => ({
  statSync: vi.fn(() => ({
    mtimeMs: Date.now(),
    size: 100,
  })),
}))

describe('ParseCache', () => {
  let cache: ParseCache

  beforeEach(() => {
    cache = new ParseCache({ maxSize: 3 })
    vi.clearAllMocks()
  })

  afterEach(() => {
    cache.clear()
  })

  describe('constructor', () => {
    test('creates cache with default max size', () => {
      const defaultCache = new ParseCache()
      expect(defaultCache.size).toBe(0)
    })

    test('creates cache with custom max size', () => {
      const customCache = new ParseCache({ maxSize: 10 })
      expect(customCache.size).toBe(0)
    })
  })

  describe('set and get', () => {
    test('stores and retrieves source file', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      const sourceFile = createMockSourceFile({})
      const filePath = '/test/file.ts'

      const fixedStats = {
        mtimeMs: 1234567890,
        size: 100,
      }

      mockStatSync.mockReturnValue(fixedStats as any)

      cache.set(filePath, sourceFile)

      const retrieved = cache.get(filePath)
      expect(retrieved).toBe(sourceFile)
    })

    test('returns undefined for non-existent file', () => {
      const retrieved = cache.get('/nonexistent.ts')
      expect(retrieved).toBeUndefined()
    })
  })

  describe('has', () => {
    test('returns true for cached file', async () => {
      const sourceFile = createMockSourceFile({})
      const filePath = '/test/file.ts'

      cache.set(filePath, sourceFile)

      expect(cache.has(filePath)).toBe(true)
    })

    test('returns false for non-cached file', () => {
      expect(cache.has('/nonexistent.ts')).toBe(false)
    })
  })

  describe('delete', () => {
    test('removes cached file', async () => {
      const sourceFile = createMockSourceFile({})
      const filePath = '/test/file.ts'

      cache.set(filePath, sourceFile)
      expect(cache.has(filePath)).toBe(true)

      const deleted = cache.delete(filePath)
      expect(deleted).toBe(true)
      expect(cache.has(filePath)).toBe(false)
    })

    test('returns false for non-cached file', () => {
      const deleted = cache.delete('/nonexistent.ts')
      expect(deleted).toBe(false)
    })
  })

  describe('clear', () => {
    test('removes all cached files', async () => {
      const sourceFile1 = createMockSourceFile({})
      const sourceFile2 = createMockSourceFile({})

      cache.set('/test/file1.ts', sourceFile1)
      cache.set('/test/file2.ts', sourceFile2)

      expect(cache.size).toBe(2)

      cache.clear()

      expect(cache.size).toBe(0)
      expect(cache.has('/test/file1.ts')).toBe(false)
      expect(cache.has('/test/file2.ts')).toBe(false)
    })

    test('resets hit/miss statistics', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      const sourceFile = createMockSourceFile({})
      const filePath = '/test/file.ts'

      const fixedStats = {
        mtimeMs: 1234567890,
        size: 100,
      }

      // Mock same stats for both set and get
      mockStatSync.mockReturnValue(fixedStats as any)

      cache.set(filePath, sourceFile)
      cache.get(filePath) // This should be a hit
      cache.get('/nonexistent.ts') // This should be a miss

      const statsBefore = cache.getStats()
      expect(statsBefore.hits).toBe(1)
      expect(statsBefore.misses).toBe(1)

      cache.clear()

      const statsAfter = cache.getStats()
      expect(statsAfter.hits).toBe(0)
      expect(statsAfter.misses).toBe(0)
    })
  })

  describe('size', () => {
    test('returns correct cache size', async () => {
      expect(cache.size).toBe(0)

      const sourceFile1 = createMockSourceFile({})
      const sourceFile2 = createMockSourceFile({})

      cache.set('/test/file1.ts', sourceFile1)
      expect(cache.size).toBe(1)

      cache.set('/test/file2.ts', sourceFile2)
      expect(cache.size).toBe(2)
    })
  })

  describe('getStats', () => {
    test('tracks cache hits', async () => {
      const sourceFile = createMockSourceFile({})
      cache.set('/test/file.ts', sourceFile)

      cache.get('/test/file.ts')
      cache.get('/test/file.ts')

      const stats = cache.getStats()
      expect(stats.hits).toBe(2)
      expect(stats.misses).toBe(0)
      expect(stats.hitRate).toBe(1)
      expect(stats.size).toBe(1)
    })

    test('tracks cache misses', () => {
      cache.get('/nonexistent1.ts')
      cache.get('/nonexistent2.ts')

      const stats = cache.getStats()
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(2)
      expect(stats.hitRate).toBe(0)
      expect(stats.size).toBe(0)
    })

    test('calculates correct hit rate', async () => {
      const sourceFile = createMockSourceFile({})
      cache.set('/test/file.ts', sourceFile)

      cache.get('/test/file.ts')
      cache.get('/nonexistent.ts')

      const stats = cache.getStats()
      expect(stats.hits).toBe(1)
      expect(stats.misses).toBe(1)
      expect(stats.hitRate).toBe(0.5)
    })

    test('returns zero hit rate when no operations', () => {
      const stats = cache.getStats()
      expect(stats.hitRate).toBe(0)
    })
  })

  describe('LRU eviction', () => {
    test('evicts least recently used entry when cache is full', async () => {
      const sourceFile1 = createMockSourceFile({})
      const sourceFile2 = createMockSourceFile({})
      const sourceFile3 = createMockSourceFile({})
      const sourceFile4 = createMockSourceFile({})

      cache.set('/test/file1.ts', sourceFile1)
      cache.set('/test/file2.ts', sourceFile2)
      cache.set('/test/file3.ts', sourceFile3)

      expect(cache.size).toBe(3)

      cache.set('/test/file4.ts', sourceFile4)

      expect(cache.size).toBe(3)
      expect(cache.has('/test/file1.ts')).toBe(false)
      expect(cache.has('/test/file4.ts')).toBe(true)
    })

    test('updates LRU order on access', async () => {
      const sourceFile1 = createMockSourceFile({})
      const sourceFile2 = createMockSourceFile({})
      const sourceFile3 = createMockSourceFile({})
      const sourceFile4 = createMockSourceFile({})

      cache.set('/test/file1.ts', sourceFile1)
      cache.set('/test/file2.ts', sourceFile2)
      cache.set('/test/file3.ts', sourceFile3)

      cache.get('/test/file1.ts')

      cache.set('/test/file4.ts', sourceFile4)

      expect(cache.size).toBe(3)
      expect(cache.has('/test/file1.ts')).toBe(true)
      expect(cache.has('/test/file2.ts')).toBe(false)
    })
  })

  describe('file modification detection', () => {
    test('invalidates cache when file size changes', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      const sourceFile = createMockSourceFile({})
      const filePath = '/test/file.ts'

      mockStatSync.mockReturnValueOnce({
        mtimeMs: Date.now(),
        size: 100,
      } as any)

      cache.set(filePath, sourceFile)

      mockStatSync.mockReturnValueOnce({
        mtimeMs: Date.now(),
        size: 999,
      } as any)

      const retrieved = cache.get(filePath)
      expect(retrieved).toBeUndefined()
    })

    test('invalidates cache when file mtime changes', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      const sourceFile = createMockSourceFile({})
      const filePath = '/test/file.ts'

      mockStatSync.mockReturnValueOnce({
        mtimeMs: Date.now(),
        size: 100,
      } as any)

      cache.set(filePath, sourceFile)

      mockStatSync.mockReturnValueOnce({
        mtimeMs: Date.now() + 10000,
        size: 100,
      } as any)

      const retrieved = cache.get(filePath)
      expect(retrieved).toBeUndefined()
    })

    test('keeps cache when file stats match', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      const sourceFile = createMockSourceFile({})
      const filePath = '/test/file.ts'

      const stats = {
        mtimeMs: Date.now(),
        size: 100,
      }

      mockStatSync.mockReturnValue(stats as any)

      cache.set(filePath, sourceFile)

      const retrieved = cache.get(filePath)
      expect(retrieved).toBe(sourceFile)
    })
  })
})
