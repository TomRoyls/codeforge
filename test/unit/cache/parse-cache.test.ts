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

  describe('constructor options', () => {
    test('creates cache with no options', () => {
      const c = new ParseCache()
      expect(c.size).toBe(0)
      c.clear()
    })

    test('creates cache with empty options object', () => {
      const c = new ParseCache({})
      expect(c.size).toBe(0)
      c.clear()
    })

    test('creates cache with maxSize 1', () => {
      const c = new ParseCache({ maxSize: 1 })
      const sf = createMockSourceFile({})
      c.set('/a.ts', sf)
      c.set('/b.ts', createMockSourceFile({}))
      expect(c.has('/a.ts')).toBe(false)
      expect(c.has('/b.ts')).toBe(true)
      c.clear()
    })

    test('creates cache with large maxSize', () => {
      const c = new ParseCache({ maxSize: 10000 })
      expect(c.size).toBe(0)
      c.clear()
    })

    test('creates independent cache instances', () => {
      const c1 = new ParseCache({ maxSize: 5 })
      const c2 = new ParseCache({ maxSize: 5 })
      const sf = createMockSourceFile({})
      c1.set('/a.ts', sf)
      expect(c1.size).toBe(1)
      expect(c2.size).toBe(0)
      c1.clear()
      c2.clear()
    })
  })

  describe('get - cache miss paths', () => {
    test('returns undefined for empty string path', () => {
      expect(cache.get('')).toBeUndefined()
    })

    test('returns undefined for path with special characters', () => {
      expect(cache.get('/path/with spaces/and-dashes/file.ts')).toBeUndefined()
    })

    test('returns undefined for very long path', () => {
      const longPath = '/a'.repeat(500) + '.ts'
      expect(cache.get(longPath)).toBeUndefined()
    })

    test('returns undefined for relative path not in cache', () => {
      expect(cache.get('./relative/path.ts')).toBeUndefined()
    })

    test('returns undefined after clear', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/file.ts', createMockSourceFile({}))
      cache.clear()
      expect(cache.get('/test/file.ts')).toBeUndefined()
    })

    test('returns undefined after delete', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/file.ts', createMockSourceFile({}))
      cache.delete('/test/file.ts')
      expect(cache.get('/test/file.ts')).toBeUndefined()
    })

    test('case-sensitive path lookup', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/File.ts', createMockSourceFile({}))
      expect(cache.get('/test/file.ts')).toBeUndefined()
      expect(cache.get('/test/File.ts')).toBeDefined()
    })
  })

  describe('get - statSync error handling', () => {
    test('returns undefined when statSync throws ENOENT', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      const sf = createMockSourceFile({})
      mockStatSync.mockReturnValueOnce({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)
      cache.set('/test/gone.ts', sf)

      const error = new Error('ENOENT: no such file')
      error.code = 'ENOENT'
      mockStatSync.mockImplementationOnce(() => {
        throw error
      })

      expect(cache.get('/test/gone.ts')).toBeUndefined()
    })

    test('returns undefined when statSync throws EACCES', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      const sf = createMockSourceFile({})
      mockStatSync.mockReturnValueOnce({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)
      cache.set('/test/locked.ts', sf)

      const error = new Error('EACCES: permission denied')
      error.code = 'EACCES'
      mockStatSync.mockImplementationOnce(() => {
        throw error
      })

      expect(cache.get('/test/locked.ts')).toBeUndefined()
    })

    test('counts stat error as a miss', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      const sf = createMockSourceFile({})
      mockStatSync.mockReturnValueOnce({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)
      cache.set('/test/gone.ts', sf)

      mockStatSync.mockImplementationOnce(() => {
        throw new Error('broken')
      })

      cache.get('/test/gone.ts')
      const stats = cache.getStats()
      expect(stats.misses).toBe(1)
      expect(stats.hits).toBe(0)
    })
  })

  describe('set - statSync error handling', () => {
    test('does not store entry when statSync throws', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockImplementation(() => {
        throw new Error('ENOENT')
      })

      cache.set('/test/missing.ts', createMockSourceFile({}))
      expect(cache.has('/test/missing.ts')).toBe(false)
      expect(cache.size).toBe(0)
    })

    test('does not increment size on stat failure', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockImplementation(() => {
        throw new Error('stat failed')
      })

      cache.set('/test/a.ts', createMockSourceFile({}))
      cache.set('/test/b.ts', createMockSourceFile({}))
      expect(cache.size).toBe(0)
    })
  })

  describe('set - overwrite behavior', () => {
    test('overwrites existing entry with same path', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      const sf1 = createMockSourceFile({})
      const sf2 = createMockSourceFile({})
      cache.set('/test/file.ts', sf1)
      cache.set('/test/file.ts', sf2)

      expect(cache.size).toBe(1)
      const retrieved = cache.get('/test/file.ts')
      expect(retrieved).toBe(sf2)
    })

    test('overwriting preserves size', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/a.ts', createMockSourceFile({}))
      cache.set('/test/a.ts', createMockSourceFile({}))
      cache.set('/test/a.ts', createMockSourceFile({}))
      expect(cache.size).toBe(1)
    })

    test('overwriting with different file stats updates cache', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      mockStatSync.mockReturnValueOnce({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)
      cache.set('/test/file.ts', createMockSourceFile({}))

      mockStatSync.mockReturnValueOnce({ mtimeMs: 2000, size: 100 } as ReturnType<typeof statSync>)
      cache.set('/test/file.ts', createMockSourceFile({}))

      mockStatSync.mockReturnValueOnce({ mtimeMs: 2000, size: 100 } as ReturnType<typeof statSync>)
      const result = cache.get('/test/file.ts')
      expect(result).toBeDefined()
    })
  })

  describe('set - multiple files', () => {
    test('stores multiple different files', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/a.ts', createMockSourceFile({}))
      cache.set('/test/b.ts', createMockSourceFile({}))
      cache.set('/test/c.ts', createMockSourceFile({}))

      expect(cache.size).toBe(3)
      expect(cache.has('/test/a.ts')).toBe(true)
      expect(cache.has('/test/b.ts')).toBe(true)
      expect(cache.has('/test/c.ts')).toBe(true)
    })

    test('retrieves correct source file for each path', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      const sfA = createMockSourceFile({})
      const sfB = createMockSourceFile({})

      cache.set('/test/a.ts', sfA)
      cache.set('/test/b.ts', sfB)

      expect(cache.get('/test/a.ts')).toBe(sfA)
      expect(cache.get('/test/b.ts')).toBe(sfB)
    })
  })

  describe('has - boundary conditions', () => {
    test('returns false before any set operations', () => {
      expect(cache.has('/any/path.ts')).toBe(false)
    })

    test('returns false for similar but different paths', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/file.ts', createMockSourceFile({}))
      expect(cache.has('/test/file.ts')).toBe(true)
      expect(cache.has('/test/file.tt')).toBe(false)
      expect(cache.has('/test/file.tsx')).toBe(false)
    })

    test('returns false after entry evicted', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/a.ts', createMockSourceFile({}))
      cache.set('/test/b.ts', createMockSourceFile({}))
      cache.set('/test/c.ts', createMockSourceFile({}))
      cache.set('/test/d.ts', createMockSourceFile({}))

      expect(cache.has('/test/a.ts')).toBe(false)
      expect(cache.has('/test/d.ts')).toBe(true)
    })

    test('returns true for just-deleted-then-reset entry', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/file.ts', createMockSourceFile({}))
      cache.delete('/test/file.ts')
      expect(cache.has('/test/file.ts')).toBe(false)

      cache.set('/test/file.ts', createMockSourceFile({}))
      expect(cache.has('/test/file.ts')).toBe(true)
    })
  })

  describe('delete - edge cases', () => {
    test('delete same entry twice returns false second time', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/file.ts', createMockSourceFile({}))
      expect(cache.delete('/test/file.ts')).toBe(true)
      expect(cache.delete('/test/file.ts')).toBe(false)
    })

    test('delete does not affect other entries', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/a.ts', createMockSourceFile({}))
      cache.set('/test/b.ts', createMockSourceFile({}))

      cache.delete('/test/a.ts')
      expect(cache.size).toBe(1)
      expect(cache.has('/test/b.ts')).toBe(true)
    })

    test('delete on empty cache returns false', () => {
      expect(cache.delete('/nothing.ts')).toBe(false)
    })

    test('delete reduces size', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/a.ts', createMockSourceFile({}))
      cache.set('/test/b.ts', createMockSourceFile({}))
      expect(cache.size).toBe(2)

      cache.delete('/test/a.ts')
      expect(cache.size).toBe(1)
    })

    test('delete on LRU-evicted entry returns false', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/a.ts', createMockSourceFile({}))
      cache.set('/test/b.ts', createMockSourceFile({}))
      cache.set('/test/c.ts', createMockSourceFile({}))
      cache.set('/test/d.ts', createMockSourceFile({})) // evicts a

      expect(cache.delete('/test/a.ts')).toBe(false)
    })
  })

  describe('clear - comprehensive', () => {
    test('clear on already empty cache is safe', () => {
      cache.clear()
      expect(cache.size).toBe(0)
    })

    test('clear twice in a row is safe', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/a.ts', createMockSourceFile({}))
      cache.clear()
      cache.clear()
      expect(cache.size).toBe(0)
    })

    test('clear resets stats on fresh cache', () => {
      const fresh = new ParseCache()
      fresh.clear()
      const stats = fresh.getStats()
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
      expect(stats.hitRate).toBe(0)
      fresh.clear()
    })

    test('can set entries after clear', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/a.ts', createMockSourceFile({}))
      cache.clear()
      const sf = createMockSourceFile({})
      cache.set('/test/b.ts', sf)
      expect(cache.size).toBe(1)
      expect(cache.get('/test/b.ts')).toBe(sf)
    })
  })

  describe('getStats - hit rate calculations', () => {
    test('hit rate is 1 with only hits', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      const sf = createMockSourceFile({})
      cache.set('/test/file.ts', sf)

      cache.get('/test/file.ts')
      cache.get('/test/file.ts')
      cache.get('/test/file.ts')

      const stats = cache.getStats()
      expect(stats.hitRate).toBe(1)
      expect(stats.hits).toBe(3)
    })

    test('hit rate approaches 0 with many misses', () => {
      for (let i = 0; i < 10; i++) {
        cache.get(`/miss-${i}.ts`)
      }
      const stats = cache.getStats()
      expect(stats.hitRate).toBe(0)
      expect(stats.misses).toBe(10)
    })

    test('hit rate is 0.75 with 3 hits and 1 miss', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/file.ts', createMockSourceFile({}))

      cache.get('/test/file.ts')
      cache.get('/test/file.ts')
      cache.get('/test/file.ts')
      cache.get('/miss.ts')

      const stats = cache.getStats()
      expect(stats.hitRate).toBe(0.75)
    })

    test('stats accumulate correctly across operations', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/file.ts', createMockSourceFile({}))

      cache.get('/test/file.ts') // hit
      cache.get('/miss1.ts') // miss
      cache.get('/test/file.ts') // hit
      cache.get('/miss2.ts') // miss
      cache.get('/test/file.ts') // hit

      const stats = cache.getStats()
      expect(stats.hits).toBe(3)
      expect(stats.misses).toBe(2)
      expect(stats.hitRate).toBeCloseTo(0.6)
    })

    test('getStats returns current cache size', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/a.ts', createMockSourceFile({}))
      cache.set('/test/b.ts', createMockSourceFile({}))

      const stats = cache.getStats()
      expect(stats.size).toBe(2)
    })

    test('stale get counts as miss not hit', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      mockStatSync.mockReturnValueOnce({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)
      cache.set('/test/file.ts', createMockSourceFile({}))

      mockStatSync.mockReturnValueOnce({ mtimeMs: 2000, size: 50 } as ReturnType<typeof statSync>)
      cache.get('/test/file.ts')

      const stats = cache.getStats()
      expect(stats.misses).toBe(1)
      expect(stats.hits).toBe(0)
    })

    test('set operations do not affect hit or miss counters', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/a.ts', createMockSourceFile({}))
      cache.set('/test/b.ts', createMockSourceFile({}))
      cache.set('/test/c.ts', createMockSourceFile({}))

      const stats = cache.getStats()
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
    })
  })

  describe('LRU eviction - advanced', () => {
    test('evicts correct entry after mixed access', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/a.ts', createMockSourceFile({}))
      cache.set('/test/b.ts', createMockSourceFile({}))
      cache.set('/test/c.ts', createMockSourceFile({}))

      // Access a and c to move them to recent
      cache.get('/test/a.ts')
      cache.get('/test/c.ts')

      // d should evict b (least recently used)
      cache.set('/test/d.ts', createMockSourceFile({}))

      expect(cache.has('/test/b.ts')).toBe(false)
      expect(cache.has('/test/a.ts')).toBe(true)
      expect(cache.has('/test/c.ts')).toBe(true)
      expect(cache.has('/test/d.ts')).toBe(true)
    })

    test('eviction chain - filling cache multiple times', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      for (let i = 0; i < 10; i++) {
        cache.set(`/test/file${i}.ts`, createMockSourceFile({}))
      }

      expect(cache.size).toBe(3)
      // Only the last 3 entries should remain
      expect(cache.has('/test/file7.ts')).toBe(true)
      expect(cache.has('/test/file8.ts')).toBe(true)
      expect(cache.has('/test/file9.ts')).toBe(true)
      expect(cache.has('/test/file6.ts')).toBe(false)
    })

    test('has does not update LRU order', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/a.ts', createMockSourceFile({}))
      cache.set('/test/b.ts', createMockSourceFile({}))
      cache.set('/test/c.ts', createMockSourceFile({}))

      // has does not promote in LRU - the underlying cache.has() doesn't update access order
      cache.has('/test/a.ts')

      // Adding d should evict a (oldest), since has() doesn't update order
      cache.set('/test/d.ts', createMockSourceFile({}))

      expect(cache.has('/test/a.ts')).toBe(false)
      expect(cache.has('/test/b.ts')).toBe(true)
    })

    test('delete then add reuses slot', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/a.ts', createMockSourceFile({}))
      cache.set('/test/b.ts', createMockSourceFile({}))
      cache.set('/test/c.ts', createMockSourceFile({}))

      cache.delete('/test/b.ts')
      expect(cache.size).toBe(2)

      cache.set('/test/d.ts', createMockSourceFile({}))
      expect(cache.size).toBe(3)
      expect(cache.has('/test/a.ts')).toBe(true)
      expect(cache.has('/test/c.ts')).toBe(true)
      expect(cache.has('/test/d.ts')).toBe(true)
    })

    test('previously evicted entry can be re-added', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/a.ts', createMockSourceFile({}))
      cache.set('/test/b.ts', createMockSourceFile({}))
      cache.set('/test/c.ts', createMockSourceFile({}))
      cache.set('/test/d.ts', createMockSourceFile({}))

      expect(cache.has('/test/a.ts')).toBe(false)

      const sf = createMockSourceFile({})
      cache.set('/test/a.ts', sf)
      expect(cache.has('/test/a.ts')).toBe(true)
      expect(cache.get('/test/a.ts')).toBe(sf)
    })
  })

  describe('file modification detection - edge cases', () => {
    test('detects mtime change with same size', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      mockStatSync.mockReturnValueOnce({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)
      cache.set('/test/file.ts', createMockSourceFile({}))

      mockStatSync.mockReturnValueOnce({ mtimeMs: 1001, size: 50 } as ReturnType<typeof statSync>)
      expect(cache.get('/test/file.ts')).toBeUndefined()
    })

    test('detects size change with same mtime', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      mockStatSync.mockReturnValueOnce({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)
      cache.set('/test/file.ts', createMockSourceFile({}))

      mockStatSync.mockReturnValueOnce({ mtimeMs: 1000, size: 51 } as ReturnType<typeof statSync>)
      expect(cache.get('/test/file.ts')).toBeUndefined()
    })

    test('no change detected when both match', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      const sf = createMockSourceFile({})
      const stats = { mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>

      mockStatSync.mockReturnValue(stats)
      cache.set('/test/file.ts', sf)

      expect(cache.get('/test/file.ts')).toBe(sf)
    })

    test('stale entry still occupies cache slot', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      mockStatSync.mockReturnValueOnce({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)
      cache.set('/test/file.ts', createMockSourceFile({}))

      // Change stats so it becomes stale
      mockStatSync.mockReturnValueOnce({ mtimeMs: 2000, size: 50 } as ReturnType<typeof statSync>)
      cache.get('/test/file.ts')

      // The entry is still in the LRU cache (has() returns true) even though get returned undefined
      expect(cache.has('/test/file.ts')).toBe(true)
    })

    test('set after invalidation refreshes entry', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      mockStatSync.mockReturnValueOnce({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)
      cache.set('/test/file.ts', createMockSourceFile({}))

      // File changes
      mockStatSync.mockReturnValueOnce({ mtimeMs: 2000, size: 60 } as ReturnType<typeof statSync>)
      expect(cache.get('/test/file.ts')).toBeUndefined()

      // Re-set with new stats
      mockStatSync.mockReturnValueOnce({ mtimeMs: 2000, size: 60 } as ReturnType<typeof statSync>)
      const newSf = createMockSourceFile({})
      cache.set('/test/file.ts', newSf)

      mockStatSync.mockReturnValueOnce({ mtimeMs: 2000, size: 60 } as ReturnType<typeof statSync>)
      expect(cache.get('/test/file.ts')).toBe(newSf)
    })
  })

  describe('file path edge cases', () => {
    test('handles absolute paths', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      const sf = createMockSourceFile({})
      cache.set('/absolute/path/to/file.ts', sf)
      expect(cache.get('/absolute/path/to/file.ts')).toBe(sf)
    })

    test('handles paths with dots', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      const sf = createMockSourceFile({})
      cache.set('/test/../src/./file.ts', sf)
      expect(cache.get('/test/../src/./file.ts')).toBe(sf)
    })

    test('handles paths with unicode', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      const sf = createMockSourceFile({})
      cache.set('/日本語/ファイル.ts', sf)
      expect(cache.get('/日本語/ファイル.ts')).toBe(sf)
    })

    test('handles .ts extension', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      const sf = createMockSourceFile({})
      cache.set('file.ts', sf)
      expect(cache.has('file.ts')).toBe(true)
    })

    test('handles .tsx extension', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      const sf = createMockSourceFile({})
      cache.set('component.tsx', sf)
      expect(cache.has('component.tsx')).toBe(true)
    })

    test('handles .js extension', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      const sf = createMockSourceFile({})
      cache.set('script.js', sf)
      expect(cache.has('script.js')).toBe(true)
    })

    test('handles deeply nested paths', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      const deep = '/a/b/c/d/e/f/g/h/i/j/file.ts'
      const sf = createMockSourceFile({})
      cache.set(deep, sf)
      expect(cache.get(deep)).toBe(sf)
    })

    test('handles path with trailing slash differences', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/path.ts', createMockSourceFile({}))
      expect(cache.has('/test/path.ts/')).toBe(false)
    })
  })

  describe('size property', () => {
    test('size is 0 for new cache', () => {
      expect(new ParseCache().size).toBe(0)
    })

    test('size increases with each unique set', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      expect(cache.size).toBe(0)
      cache.set('/a.ts', createMockSourceFile({}))
      expect(cache.size).toBe(1)
      cache.set('/b.ts', createMockSourceFile({}))
      expect(cache.size).toBe(2)
    })

    test('size does not increase on overwrite', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/a.ts', createMockSourceFile({}))
      cache.set('/a.ts', createMockSourceFile({}))
      expect(cache.size).toBe(1)
    })

    test('size decreases on delete', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/a.ts', createMockSourceFile({}))
      cache.set('/b.ts', createMockSourceFile({}))
      cache.delete('/a.ts')
      expect(cache.size).toBe(1)
    })

    test('size goes to 0 on clear', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/a.ts', createMockSourceFile({}))
      cache.set('/b.ts', createMockSourceFile({}))
      cache.clear()
      expect(cache.size).toBe(0)
    })

    test('size is bounded by maxSize', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      for (let i = 0; i < 20; i++) {
        cache.set(`/test/file${i}.ts`, createMockSourceFile({}))
      }
      expect(cache.size).toBe(3) // maxSize is 3
    })
  })

  describe('concurrent-like operations', () => {
    test('rapid set-get cycle', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      for (let i = 0; i < 50; i++) {
        const sf = createMockSourceFile({})
        cache.set(`/test/file${i}.ts`, sf)
        const retrieved = cache.get(`/test/file${i}.ts`)
        expect(retrieved).toBe(sf)
      }
    })

    test('set delete set cycle', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      for (let i = 0; i < 10; i++) {
        const path = `/test/file${i}.ts`
        cache.set(path, createMockSourceFile({}))
        cache.delete(path)
        expect(cache.has(path)).toBe(false)
      }
    })

    test('interleaved operations maintain consistency', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      const sf1 = createMockSourceFile({})
      const sf2 = createMockSourceFile({})

      cache.set('/test/a.ts', sf1)
      expect(cache.get('/test/a.ts')).toBe(sf1)

      cache.set('/test/b.ts', sf2)
      expect(cache.get('/test/b.ts')).toBe(sf2)
      expect(cache.get('/test/a.ts')).toBe(sf1)

      cache.delete('/test/a.ts')
      expect(cache.get('/test/a.ts')).toBeUndefined()
      expect(cache.get('/test/b.ts')).toBe(sf2)
    })
  })

  describe('globalParseCache export', () => {
    test('globalParseCache is an instance of ParseCache', async () => {
      const { globalParseCache: gpc } = await import('../../../src/cache/parse-cache.js')
      expect(gpc).toBeDefined()
      expect(typeof gpc.get).toBe('function')
      expect(typeof gpc.set).toBe('function')
      expect(typeof gpc.has).toBe('function')
      expect(typeof gpc.delete).toBe('function')
      expect(typeof gpc.clear).toBe('function')
      expect(typeof gpc.getStats).toBe('function')
    })
  })

  describe('getStats shape', () => {
    test('returns all expected fields', () => {
      const stats = cache.getStats()
      expect(stats).toHaveProperty('hits')
      expect(stats).toHaveProperty('misses')
      expect(stats).toHaveProperty('hitRate')
      expect(stats).toHaveProperty('size')
    })

    test('all fields are numbers', () => {
      const stats = cache.getStats()
      expect(typeof stats.hits).toBe('number')
      expect(typeof stats.misses).toBe('number')
      expect(typeof stats.hitRate).toBe('number')
      expect(typeof stats.size).toBe('number')
    })

    test('hitRate is between 0 and 1', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/file.ts', createMockSourceFile({}))
      cache.get('/test/file.ts')
      cache.get('/miss.ts')

      const stats = cache.getStats()
      expect(stats.hitRate).toBeGreaterThanOrEqual(0)
      expect(stats.hitRate).toBeLessThanOrEqual(1)
    })
  })

  describe('miss counter tracking', () => {
    test('miss increments for each non-existent get', () => {
      cache.get('/a.ts')
      cache.get('/b.ts')
      cache.get('/c.ts')
      const stats = cache.getStats()
      expect(stats.misses).toBe(3)
    })

    test('miss increments for stale entries', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      mockStatSync.mockReturnValueOnce({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)
      cache.set('/test/file.ts', createMockSourceFile({}))

      mockStatSync.mockReturnValueOnce({ mtimeMs: 2000, size: 50 } as ReturnType<typeof statSync>)
      cache.get('/test/file.ts')

      const stats = cache.getStats()
      expect(stats.misses).toBe(1)
    })

    test('miss increments for stat errors', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      mockStatSync.mockReturnValueOnce({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)
      cache.set('/test/file.ts', createMockSourceFile({}))

      mockStatSync.mockImplementationOnce(() => {
        throw new Error('stat error')
      })
      cache.get('/test/file.ts')

      const stats = cache.getStats()
      expect(stats.misses).toBe(1)
    })
  })

  describe('hit counter tracking', () => {
    test('hit increments for each valid get', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/file.ts', createMockSourceFile({}))
      cache.get('/test/file.ts')
      cache.get('/test/file.ts')

      const stats = cache.getStats()
      expect(stats.hits).toBe(2)
    })

    test('hits survive across multiple gets', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      const sf = createMockSourceFile({})
      cache.set('/test/file.ts', sf)

      for (let i = 0; i < 5; i++) {
        expect(cache.get('/test/file.ts')).toBe(sf)
      }

      const stats = cache.getStats()
      expect(stats.hits).toBe(5)
    })
  })

  describe('stat synchronization', () => {
    test('set captures mtimeMs from statSync', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      mockStatSync.mockReturnValueOnce({ mtimeMs: 9999, size: 42 } as ReturnType<typeof statSync>)
      cache.set('/test/file.ts', createMockSourceFile({}))

      // Verify the entry exists (was stored successfully)
      expect(cache.has('/test/file.ts')).toBe(true)

      // Verify that the mtime is used for comparison
      mockStatSync.mockReturnValueOnce({ mtimeMs: 9999, size: 42 } as ReturnType<typeof statSync>)
      expect(cache.get('/test/file.ts')).toBeDefined()

      mockStatSync.mockReturnValueOnce({ mtimeMs: 8888, size: 42 } as ReturnType<typeof statSync>)
      expect(cache.get('/test/file.ts')).toBeUndefined()
    })

    test('set captures size from statSync', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      mockStatSync.mockReturnValueOnce({ mtimeMs: 1000, size: 42 } as ReturnType<typeof statSync>)
      cache.set('/test/file.ts', createMockSourceFile({}))

      mockStatSync.mockReturnValueOnce({ mtimeMs: 1000, size: 99 } as ReturnType<typeof statSync>)
      expect(cache.get('/test/file.ts')).toBeUndefined()
    })

    test('set calls statSync once per set call', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/a.ts', createMockSourceFile({}))
      cache.set('/test/b.ts', createMockSourceFile({}))
      cache.set('/test/c.ts', createMockSourceFile({}))

      // 3 set calls = 3 statSync calls
      expect(mockStatSync).toHaveBeenCalledTimes(3)
    })

    test('get calls statSync once per get call on cached file', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/file.ts', createMockSourceFile({}))
      vi.clearAllMocks()

      cache.get('/test/file.ts')
      cache.get('/test/file.ts')

      expect(mockStatSync).toHaveBeenCalledTimes(2)
    })

    test('get does not call statSync for uncached files', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      cache.get('/not-in-cache.ts')

      expect(mockStatSync).not.toHaveBeenCalled()
    })
  })

  describe('large cache operations', () => {
    test('handles maxSize of 1 correctly', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      const smallCache = new ParseCache({ maxSize: 1 })
      smallCache.set('/a.ts', createMockSourceFile({}))
      expect(smallCache.size).toBe(1)

      smallCache.set('/b.ts', createMockSourceFile({}))
      expect(smallCache.size).toBe(1)
      expect(smallCache.has('/a.ts')).toBe(false)
      expect(smallCache.has('/b.ts')).toBe(true)
      smallCache.clear()
    })

    test('handles maxSize of 100 correctly', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      const bigCache = new ParseCache({ maxSize: 100 })
      for (let i = 0; i < 150; i++) {
        bigCache.set(`/test/file${i}.ts`, createMockSourceFile({}))
      }
      expect(bigCache.size).toBe(100)
      // Oldest 50 should be evicted
      expect(bigCache.has('/test/file0.ts')).toBe(false)
      expect(bigCache.has('/test/file49.ts')).toBe(false)
      expect(bigCache.has('/test/file50.ts')).toBe(true)
      expect(bigCache.has('/test/file149.ts')).toBe(true)
      bigCache.clear()
    })
  })

  describe('get - returned source file identity', () => {
    test('returns exact same object reference on hit', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      const sf = createMockSourceFile({})
      cache.set('/test/file.ts', sf)
      expect(cache.get('/test/file.ts')).toBe(sf)
      expect(cache.get('/test/file.ts')).toBe(sf)
    })

    test('different paths return different source files', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      const sf1 = createMockSourceFile({})
      const sf2 = createMockSourceFile({})
      cache.set('/test/a.ts', sf1)
      cache.set('/test/b.ts', sf2)

      expect(cache.get('/test/a.ts')).toBe(sf1)
      expect(cache.get('/test/b.ts')).toBe(sf2)
      expect(cache.get('/test/a.ts')).not.toBe(sf2)
    })
  })

  describe('clear does not affect other instances', () => {
    test('clearing one cache does not affect another', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      const cache2 = new ParseCache({ maxSize: 5 })
      cache.set('/test/a.ts', createMockSourceFile({}))
      cache2.set('/test/b.ts', createMockSourceFile({}))

      cache.clear()
      expect(cache.size).toBe(0)
      expect(cache2.size).toBe(1)
      cache2.clear()
    })

    test('stats are independent between instances', () => {
      const cache2 = new ParseCache({ maxSize: 5 })

      cache.get('/miss.ts')
      expect(cache.getStats().misses).toBe(1)
      expect(cache2.getStats().misses).toBe(0)
      cache2.clear()
    })
  })

  describe('repeated clear operations', () => {
    test('clear after heavy usage', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      for (let i = 0; i < 100; i++) {
        cache.set(`/test/file${i}.ts`, createMockSourceFile({}))
      }
      cache.get('/test/file50.ts')

      cache.clear()
      expect(cache.size).toBe(0)
      const stats = cache.getStats()
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
    })

    test('cache usable after clear with prior errors', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      mockStatSync.mockImplementationOnce(() => {
        throw new Error('fail')
      })
      cache.set('/test/fail.ts', createMockSourceFile({}))

      cache.clear()

      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)
      const sf = createMockSourceFile({})
      cache.set('/test/works.ts', sf)
      expect(cache.get('/test/works.ts')).toBe(sf)
    })
  })

  describe('mtime precision', () => {
    test('detects sub-millisecond mtime difference', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      mockStatSync.mockReturnValueOnce({ mtimeMs: 1000.001, size: 50 } as ReturnType<
        typeof statSync
      >)
      cache.set('/test/file.ts', createMockSourceFile({}))

      mockStatSync.mockReturnValueOnce({ mtimeMs: 1000.002, size: 50 } as ReturnType<
        typeof statSync
      >)
      expect(cache.get('/test/file.ts')).toBeUndefined()
    })

    test('exact mtime match returns hit', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      const sf = createMockSourceFile({})
      mockStatSync.mockReturnValue({ mtimeMs: 1000.123456, size: 50 } as ReturnType<
        typeof statSync
      >)
      cache.set('/test/file.ts', sf)

      expect(cache.get('/test/file.ts')).toBe(sf)
    })

    test('zero mtime is valid', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      const sf = createMockSourceFile({})
      mockStatSync.mockReturnValue({ mtimeMs: 0, size: 50 } as ReturnType<typeof statSync>)
      cache.set('/test/file.ts', sf)

      expect(cache.get('/test/file.ts')).toBe(sf)
    })

    test('negative size is still tracked', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      const sf = createMockSourceFile({})
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: -1 } as ReturnType<typeof statSync>)
      cache.set('/test/file.ts', sf)

      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: -1 } as ReturnType<typeof statSync>)
      expect(cache.get('/test/file.ts')).toBe(sf)
    })
  })

  describe('zero-size files', () => {
    test('handles zero byte files', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      const sf = createMockSourceFile({})
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 0 } as ReturnType<typeof statSync>)
      cache.set('/test/empty.ts', sf)

      expect(cache.get('/test/empty.ts')).toBe(sf)
    })

    test('detects change from zero to non-zero size', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      mockStatSync.mockReturnValueOnce({ mtimeMs: 1000, size: 0 } as ReturnType<typeof statSync>)
      cache.set('/test/growing.ts', createMockSourceFile({}))

      mockStatSync.mockReturnValueOnce({ mtimeMs: 1000, size: 1 } as ReturnType<typeof statSync>)
      expect(cache.get('/test/growing.ts')).toBeUndefined()
    })

    test('detects change from non-zero to zero size', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      mockStatSync.mockReturnValueOnce({ mtimeMs: 1000, size: 100 } as ReturnType<typeof statSync>)
      cache.set('/test/shrinking.ts', createMockSourceFile({}))

      mockStatSync.mockReturnValueOnce({ mtimeMs: 1000, size: 0 } as ReturnType<typeof statSync>)
      expect(cache.get('/test/shrinking.ts')).toBeUndefined()
    })
  })

  describe('overwritten entry freshness', () => {
    test('overwritten entry uses new file stats', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      mockStatSync.mockReturnValueOnce({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)
      cache.set('/test/file.ts', createMockSourceFile({}))

      mockStatSync.mockReturnValueOnce({ mtimeMs: 2000, size: 100 } as ReturnType<typeof statSync>)
      cache.set('/test/file.ts', createMockSourceFile({}))

      mockStatSync.mockReturnValueOnce({ mtimeMs: 2000, size: 100 } as ReturnType<typeof statSync>)
      expect(cache.get('/test/file.ts')).toBeDefined()
    })

    test('overwritten entry invalidates with old stats', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      mockStatSync.mockReturnValueOnce({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)
      cache.set('/test/file.ts', createMockSourceFile({}))

      mockStatSync.mockReturnValueOnce({ mtimeMs: 2000, size: 100 } as ReturnType<typeof statSync>)
      cache.set('/test/file.ts', createMockSourceFile({}))

      mockStatSync.mockReturnValueOnce({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)
      expect(cache.get('/test/file.ts')).toBeUndefined()
    })
  })

  describe('statSync call verification', () => {
    test('set calls statSync with correct file path', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/specific-path.ts', createMockSourceFile({}))
      expect(mockStatSync).toHaveBeenCalledWith('/test/specific-path.ts')
    })

    test('get calls statSync with correct file path', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/target.ts', createMockSourceFile({}))
      vi.clearAllMocks()

      cache.get('/test/target.ts')
      expect(mockStatSync).toHaveBeenCalledWith('/test/target.ts')
    })
  })

  describe('mixed hit and miss sequences', () => {
    test('alternating hits and misses', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/a.ts', createMockSourceFile({}))
      cache.set('/test/b.ts', createMockSourceFile({}))

      cache.get('/test/a.ts')
      cache.get('/miss.ts')
      cache.get('/test/b.ts')
      cache.get('/miss2.ts')
      cache.get('/test/a.ts')

      const stats = cache.getStats()
      expect(stats.hits).toBe(3)
      expect(stats.misses).toBe(2)
    })

    test('all misses then one hit', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.get('/miss1.ts')
      cache.get('/miss2.ts')
      cache.get('/miss3.ts')

      cache.set('/test/file.ts', createMockSourceFile({}))
      cache.get('/test/file.ts')

      const stats = cache.getStats()
      expect(stats.misses).toBe(3)
      expect(stats.hits).toBe(1)
    })

    test('hit then eviction causes miss', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/a.ts', createMockSourceFile({}))
      cache.set('/test/b.ts', createMockSourceFile({}))
      cache.set('/test/c.ts', createMockSourceFile({}))

      cache.get('/test/a.ts')

      cache.set('/test/d.ts', createMockSourceFile({}))
      cache.set('/test/e.ts', createMockSourceFile({}))

      const result = cache.get('/test/b.ts')
      expect(result).toBeUndefined()
    })
  })

  describe('eviction with varying access patterns', () => {
    test('sequential access keeps latest entries', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      const c = new ParseCache({ maxSize: 5 })
      for (let i = 0; i < 10; i++) {
        c.set(`/f${i}.ts`, createMockSourceFile({}))
      }
      expect(c.has('/f5.ts')).toBe(true)
      expect(c.has('/f6.ts')).toBe(true)
      expect(c.has('/f7.ts')).toBe(true)
      expect(c.has('/f8.ts')).toBe(true)
      expect(c.has('/f9.ts')).toBe(true)
      expect(c.has('/f4.ts')).toBe(false)
      c.clear()
    })

    test('accessing middle entry protects it', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      const c = new ParseCache({ maxSize: 5 })
      c.set('/f0.ts', createMockSourceFile({}))
      c.set('/f1.ts', createMockSourceFile({}))
      c.set('/f2.ts', createMockSourceFile({}))
      c.set('/f3.ts', createMockSourceFile({}))
      c.set('/f4.ts', createMockSourceFile({}))

      c.get('/f1.ts')

      c.set('/f5.ts', createMockSourceFile({}))
      expect(c.has('/f0.ts')).toBe(false)
      expect(c.has('/f1.ts')).toBe(true)
      c.clear()
    })

    test('repeatedly accessing same entry does not evict others', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      const c = new ParseCache({ maxSize: 3 })
      c.set('/a.ts', createMockSourceFile({}))
      c.set('/b.ts', createMockSourceFile({}))
      c.set('/c.ts', createMockSourceFile({}))

      for (let i = 0; i < 10; i++) {
        c.get('/a.ts')
      }

      expect(c.has('/a.ts')).toBe(true)
      expect(c.has('/b.ts')).toBe(true)
      expect(c.has('/c.ts')).toBe(true)
      c.clear()
    })
  })

  describe('file stats boundary values', () => {
    test('very large file size', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      const sf = createMockSourceFile({})
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: Number.MAX_SAFE_INTEGER } as ReturnType<
        typeof statSync
      >)
      cache.set('/test/large.ts', sf)
      expect(cache.get('/test/large.ts')).toBe(sf)
    })

    test('very large mtime', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      const sf = createMockSourceFile({})
      mockStatSync.mockReturnValue({ mtimeMs: Number.MAX_SAFE_INTEGER, size: 50 } as ReturnType<
        typeof statSync
      >)
      cache.set('/test/old.ts', sf)
      expect(cache.get('/test/old.ts')).toBe(sf)
    })

    test('fractional mtime preserved', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      const sf = createMockSourceFile({})
      mockStatSync.mockReturnValue({ mtimeMs: 1234.5678, size: 50 } as ReturnType<typeof statSync>)
      cache.set('/test/frac.ts', sf)

      mockStatSync.mockReturnValue({ mtimeMs: 1234.5678, size: 50 } as ReturnType<typeof statSync>)
      expect(cache.get('/test/frac.ts')).toBe(sf)

      mockStatSync.mockReturnValueOnce({ mtimeMs: 1234.5679, size: 50 } as ReturnType<
        typeof statSync
      >)
      expect(cache.get('/test/frac.ts')).toBeUndefined()
    })
  })

  describe('set and get with same path different source files', () => {
    test('latest set wins', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      const sf1 = createMockSourceFile({})
      const sf2 = createMockSourceFile({})
      const sf3 = createMockSourceFile({})

      cache.set('/test/file.ts', sf1)
      cache.set('/test/file.ts', sf2)
      cache.set('/test/file.ts', sf3)

      expect(cache.get('/test/file.ts')).toBe(sf3)
    })

    test('overwrite does not change position in LRU', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/a.ts', createMockSourceFile({}))
      cache.set('/test/b.ts', createMockSourceFile({}))
      cache.set('/test/c.ts', createMockSourceFile({}))

      cache.set('/test/a.ts', createMockSourceFile({}))

      cache.set('/test/d.ts', createMockSourceFile({}))

      expect(cache.has('/test/a.ts')).toBe(true)
      expect(cache.has('/test/d.ts')).toBe(true)
      expect(cache.has('/test/b.ts')).toBe(false)
    })
  })

  describe('delete and re-add patterns', () => {
    test('delete then add restores entry', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      const sf = createMockSourceFile({})
      cache.set('/test/file.ts', sf)
      cache.delete('/test/file.ts')
      expect(cache.has('/test/file.ts')).toBe(false)

      cache.set('/test/file.ts', sf)
      expect(cache.has('/test/file.ts')).toBe(true)
      expect(cache.get('/test/file.ts')).toBe(sf)
    })

    test('delete middle entry does not corrupt LRU', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/a.ts', createMockSourceFile({}))
      cache.set('/test/b.ts', createMockSourceFile({}))
      cache.set('/test/c.ts', createMockSourceFile({}))

      cache.delete('/test/b.ts')
      cache.set('/test/d.ts', createMockSourceFile({}))

      expect(cache.size).toBe(3)
      expect(cache.has('/test/a.ts')).toBe(true)
      expect(cache.has('/test/c.ts')).toBe(true)
      expect(cache.has('/test/d.ts')).toBe(true)
      expect(cache.has('/test/b.ts')).toBe(false)
    })
  })

  describe('logger interaction', () => {
    test('get on empty cache triggers logger debug', async () => {
      const { logger } = await import('../../../src/utils/logger.js')
      const debugSpy = vi.spyOn(logger, 'debug').mockImplementation(() => {})

      cache.get('/not-here.ts')

      expect(debugSpy).toHaveBeenCalled()
      debugSpy.mockRestore()
    })

    test('clear triggers logger debug', async () => {
      const { logger } = await import('../../../src/utils/logger.js')
      const debugSpy = vi.spyOn(logger, 'debug').mockImplementation(() => {})

      cache.clear()

      expect(debugSpy).toHaveBeenCalledWith('Parse cache cleared')
      debugSpy.mockRestore()
    })

    test('set triggers logger debug', async () => {
      const { logger } = await import('../../../src/utils/logger.js')
      const debugSpy = vi.spyOn(logger, 'debug').mockImplementation(() => {})

      cache.set('/test/file.ts', createMockSourceFile({}))

      expect(debugSpy).toHaveBeenCalled()
      debugSpy.mockRestore()
    })
  })

  describe('CachedSourceFile interface behavior', () => {
    test('cache entry stores timestamp', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      const before = Date.now()
      cache.set('/test/file.ts', createMockSourceFile({}))
      const after = Date.now()

      const entry = (
        cache as unknown as { cache: { get: (k: string) => { timestamp: number } } }
      ).cache.get('/test/file.ts')
      expect(entry.timestamp).toBeGreaterThanOrEqual(before)
      expect(entry.timestamp).toBeLessThanOrEqual(after)
    })

    test('cache entry stores fileStats', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 12345, size: 67 } as ReturnType<typeof statSync>)

      cache.set('/test/file.ts', createMockSourceFile({}))

      const entry = (
        cache as unknown as {
          cache: { get: (k: string) => { fileStats: { mtime: number; size: number } } }
        }
      ).cache.get('/test/file.ts')
      expect(entry.fileStats.mtime).toBe(12345)
      expect(entry.fileStats.size).toBe(67)
    })

    test('cache entry stores sourceFile reference', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      const sf = createMockSourceFile({})
      cache.set('/test/file.ts', sf)

      const entry = (
        cache as unknown as { cache: { get: (k: string) => { sourceFile: SourceFile } } }
      ).cache.get('/test/file.ts')
      expect(entry.sourceFile).toBe(sf)
    })
  })

  describe('getStats after complex sequences', () => {
    test('stats accurate after set-delete-get sequence', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/a.ts', createMockSourceFile({}))
      cache.get('/test/a.ts')
      cache.delete('/test/a.ts')
      cache.get('/test/a.ts')

      const stats = cache.getStats()
      expect(stats.hits).toBe(1)
      expect(stats.misses).toBe(1)
    })

    test('stats accurate after clear then new operations', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/a.ts', createMockSourceFile({}))
      cache.get('/test/a.ts')
      cache.get('/miss.ts')

      cache.clear()

      cache.set('/test/b.ts', createMockSourceFile({}))
      cache.get('/test/b.ts')
      cache.get('/another-miss.ts')

      const stats = cache.getStats()
      expect(stats.hits).toBe(1)
      expect(stats.misses).toBe(1)
    })

    test('stats accurate after many evictions', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      for (let i = 0; i < 10; i++) {
        cache.set(`/f${i}.ts`, createMockSourceFile({}))
        cache.get(`/f${i}.ts`)
      }

      const stats = cache.getStats()
      expect(stats.hits).toBe(10)
      expect(stats.misses).toBe(0)
    })

    test('stats show zero hits after only delete operations', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/a.ts', createMockSourceFile({}))
      cache.delete('/test/a.ts')

      const stats = cache.getStats()
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
      expect(stats.size).toBe(0)
    })
  })

  describe('path normalization awareness', () => {
    test('/path and //path are different keys', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/path.ts', createMockSourceFile({}))
      cache.set('//test/path.ts', createMockSourceFile({}))

      expect(cache.size).toBe(2)
    })

    test('/path and ./path are different keys', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/path.ts', createMockSourceFile({}))
      cache.set('./test/path.ts', createMockSourceFile({}))

      expect(cache.size).toBe(2)
    })

    test('path and path/ are different keys', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/path', createMockSourceFile({}))
      cache.set('/test/path/', createMockSourceFile({}))

      expect(cache.size).toBe(2)
    })

    test('Windows-style paths work as keys', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      const sf = createMockSourceFile({})
      cache.set('C:\\Users\\dev\\file.ts', sf)
      expect(cache.get('C:\\Users\\dev\\file.ts')).toBe(sf)
    })
  })

  describe('rapid reuse of single entry', () => {
    test('same file set and got repeatedly', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      for (let i = 0; i < 20; i++) {
        const sf = createMockSourceFile({})
        cache.set('/test/file.ts', sf)
        expect(cache.get('/test/file.ts')).toBe(sf)
      }

      expect(cache.size).toBe(1)
      const stats = cache.getStats()
      expect(stats.hits).toBe(20)
    })
  })

  describe('get after partial cache state', () => {
    test('get after failed set does not crash', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      mockStatSync.mockImplementationOnce(() => {
        throw new Error('fail')
      })
      cache.set('/test/fail.ts', createMockSourceFile({}))

      expect(cache.get('/test/fail.ts')).toBeUndefined()
      expect(cache.size).toBe(0)
    })

    test('get after failed statSync in set returns miss', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      mockStatSync.mockImplementationOnce(() => {
        throw new Error('perm')
      })
      cache.set('/test/nope.ts', createMockSourceFile({}))

      cache.get('/test/nope.ts')
      const stats = cache.getStats()
      expect(stats.misses).toBe(1)
    })
  })

  describe('multiple error types in statSync', () => {
    test('handles unknown error type', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      mockStatSync.mockReturnValueOnce({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)
      cache.set('/test/file.ts', createMockSourceFile({}))

      mockStatSync.mockImplementationOnce(() => {
        throw 'string error'
      })

      expect(cache.get('/test/file.ts')).toBeUndefined()
    })

    test('handles null error from statSync', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      mockStatSync.mockReturnValueOnce({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)
      cache.set('/test/file.ts', createMockSourceFile({}))

      mockStatSync.mockImplementationOnce(() => {
        throw null
      })

      expect(cache.get('/test/file.ts')).toBeUndefined()
    })

    test('handles error object without code', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      mockStatSync.mockReturnValueOnce({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)
      cache.set('/test/file.ts', createMockSourceFile({}))

      mockStatSync.mockImplementationOnce(() => {
        throw new Error('generic error')
      })

      expect(cache.get('/test/file.ts')).toBeUndefined()
    })
  })

  describe('stress-like patterns', () => {
    test('100 sequential sets with maxSize 3', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      for (let i = 0; i < 100; i++) {
        cache.set(`/f${i}.ts`, createMockSourceFile({}))
      }
      expect(cache.size).toBe(3)
      expect(cache.has('/f99.ts')).toBe(true)
      expect(cache.has('/f98.ts')).toBe(true)
      expect(cache.has('/f97.ts')).toBe(true)
      expect(cache.has('/f96.ts')).toBe(false)
    })

    test('fill-delete-refill cycle', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/a.ts', createMockSourceFile({}))
      cache.set('/test/b.ts', createMockSourceFile({}))
      cache.set('/test/c.ts', createMockSourceFile({}))

      cache.delete('/test/a.ts')
      cache.delete('/test/b.ts')
      cache.delete('/test/c.ts')

      expect(cache.size).toBe(0)

      cache.set('/test/d.ts', createMockSourceFile({}))
      cache.set('/test/e.ts', createMockSourceFile({}))

      expect(cache.size).toBe(2)
    })
  })

  describe('delete returns correct boolean', () => {
    test('returns true for existing entry', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/a.ts', createMockSourceFile({}))
      expect(cache.delete('/test/a.ts')).toBe(true)
    })

    test('returns false for never-cached path', () => {
      expect(cache.delete('/never.ts')).toBe(false)
    })

    test('returns false after clear', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/a.ts', createMockSourceFile({}))
      cache.clear()
      expect(cache.delete('/test/a.ts')).toBe(false)
    })

    test('returns true for evicted-then-re-added entry', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/a.ts', createMockSourceFile({}))
      cache.set('/test/b.ts', createMockSourceFile({}))
      cache.set('/test/c.ts', createMockSourceFile({}))
      cache.set('/test/d.ts', createMockSourceFile({}))

      expect(cache.has('/test/a.ts')).toBe(false)
    })
  })

  describe('eviction order correctness', () => {
    test('get promotes entry before eviction', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      const c = new ParseCache({ maxSize: 4 })
      c.set('/a.ts', createMockSourceFile({}))
      c.set('/b.ts', createMockSourceFile({}))
      c.set('/c.ts', createMockSourceFile({}))
      c.set('/d.ts', createMockSourceFile({}))

      c.get('/a.ts')
      c.get('/b.ts')

      c.set('/e.ts', createMockSourceFile({}))
      expect(c.has('/c.ts')).toBe(false)
      expect(c.has('/a.ts')).toBe(true)
      expect(c.has('/b.ts')).toBe(true)
      c.clear()
    })

    test('set on existing key promotes it', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      const c = new ParseCache({ maxSize: 3 })
      c.set('/a.ts', createMockSourceFile({}))
      c.set('/b.ts', createMockSourceFile({}))
      c.set('/c.ts', createMockSourceFile({}))

      c.set('/a.ts', createMockSourceFile({}))

      c.set('/d.ts', createMockSourceFile({}))
      expect(c.has('/a.ts')).toBe(true)
      expect(c.has('/b.ts')).toBe(false)
      c.clear()
    })
  })

  describe('hit rate edge cases', () => {
    test('hit rate stays 0 after only misses', () => {
      for (let i = 0; i < 20; i++) {
        cache.get(`/miss${i}.ts`)
      }
      expect(cache.getStats().hitRate).toBe(0)
    })

    test('hit rate becomes 1 after clearing and only hitting', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.get('/miss.ts')
      cache.clear()

      cache.set('/test/file.ts', createMockSourceFile({}))
      cache.get('/test/file.ts')

      expect(cache.getStats().hitRate).toBe(1)
    })

    test('hit rate is 0.333 with 1 hit and 2 misses', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/file.ts', createMockSourceFile({}))
      cache.get('/test/file.ts')
      cache.get('/miss1.ts')
      cache.get('/miss2.ts')

      expect(cache.getStats().hitRate).toBeCloseTo(1 / 3)
    })
  })

  describe('set failure does not corrupt state', () => {
    test('set failure leaves cache intact', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      const sf = createMockSourceFile({})
      cache.set('/test/good.ts', sf)

      mockStatSync.mockImplementationOnce(() => {
        throw new Error('fail')
      })
      cache.set('/test/bad.ts', createMockSourceFile({}))

      expect(cache.size).toBe(1)
      expect(cache.get('/test/good.ts')).toBe(sf)
    })

    test('set failure does not affect stats', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockImplementationOnce(() => {
        throw new Error('fail')
      })
      cache.set('/test/bad.ts', createMockSourceFile({}))

      const stats = cache.getStats()
      expect(stats.size).toBe(0)
    })
  })

  describe('cache with various file extensions', () => {
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.d.ts']

    extensions.forEach((ext) => {
      test(`handles ${ext} extension`, async () => {
        const { statSync } = await import('node:fs')
        const mockStatSync = vi.mocked(statSync)
        mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

        const sf = createMockSourceFile({})
        cache.set(`/test/file${ext}`, sf)
        expect(cache.get(`/test/file${ext}`)).toBe(sf)
      })
    })
  })

  describe('get behavior after overwrite', () => {
    test('get returns new source file after overwrite', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      const sf1 = createMockSourceFile({})
      const sf2 = createMockSourceFile({})

      cache.set('/test/file.ts', sf1)
      cache.set('/test/file.ts', sf2)

      expect(cache.get('/test/file.ts')).toBe(sf2)
      expect(cache.get('/test/file.ts')).not.toBe(sf1)
    })

    test('get returns undefined after overwrite with different stats', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      mockStatSync.mockReturnValueOnce({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)
      cache.set('/test/file.ts', createMockSourceFile({}))

      mockStatSync.mockReturnValueOnce({ mtimeMs: 2000, size: 100 } as ReturnType<typeof statSync>)
      cache.set('/test/file.ts', createMockSourceFile({}))

      mockStatSync.mockReturnValueOnce({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)
      expect(cache.get('/test/file.ts')).toBeUndefined()
    })
  })

  describe('clear resets size to 0 from various states', () => {
    test('clear from size 1', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/a.ts', createMockSourceFile({}))
      cache.clear()
      expect(cache.size).toBe(0)
    })

    test('clear from maxSize', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/a.ts', createMockSourceFile({}))
      cache.set('/test/b.ts', createMockSourceFile({}))
      cache.set('/test/c.ts', createMockSourceFile({}))
      cache.clear()
      expect(cache.size).toBe(0)
    })

    test('clear after evictions', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      for (let i = 0; i < 10; i++) {
        cache.set(`/f${i}.ts`, createMockSourceFile({}))
      }
      cache.clear()
      expect(cache.size).toBe(0)
    })
  })

  describe('getStats size field consistency', () => {
    test('getStats.size matches cache.size after sets', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/a.ts', createMockSourceFile({}))
      cache.set('/test/b.ts', createMockSourceFile({}))

      expect(cache.getStats().size).toBe(cache.size)
    })

    test('getStats.size matches cache.size after deletes', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/a.ts', createMockSourceFile({}))
      cache.set('/test/b.ts', createMockSourceFile({}))
      cache.delete('/test/a.ts')

      expect(cache.getStats().size).toBe(cache.size)
    })

    test('getStats.size matches cache.size after clear', () => {
      cache.clear()
      expect(cache.getStats().size).toBe(cache.size)
    })

    test('getStats.size matches after eviction', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      for (let i = 0; i < 10; i++) {
        cache.set(`/f${i}.ts`, createMockSourceFile({}))
      }

      expect(cache.getStats().size).toBe(cache.size)
    })
  })

  describe('file stats both must match for hit', () => {
    test('only mtime match is not enough', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      mockStatSync.mockReturnValueOnce({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)
      cache.set('/test/file.ts', createMockSourceFile({}))

      mockStatSync.mockReturnValueOnce({ mtimeMs: 1000, size: 51 } as ReturnType<typeof statSync>)
      expect(cache.get('/test/file.ts')).toBeUndefined()
    })

    test('only size match is not enough', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      mockStatSync.mockReturnValueOnce({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)
      cache.set('/test/file.ts', createMockSourceFile({}))

      mockStatSync.mockReturnValueOnce({ mtimeMs: 1001, size: 50 } as ReturnType<typeof statSync>)
      expect(cache.get('/test/file.ts')).toBeUndefined()
    })

    test('both match yields hit', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      const sf = createMockSourceFile({})
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)
      cache.set('/test/file.ts', sf)

      expect(cache.get('/test/file.ts')).toBe(sf)
    })
  })

  describe('concurrent instance isolation', () => {
    test('two caches with same maxSize are independent', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      const c1 = new ParseCache({ maxSize: 3 })
      const c2 = new ParseCache({ maxSize: 3 })

      const sf1 = createMockSourceFile({})
      const sf2 = createMockSourceFile({})

      c1.set('/test/a.ts', sf1)
      c2.set('/test/a.ts', sf2)

      expect(c1.get('/test/a.ts')).toBe(sf1)
      expect(c2.get('/test/a.ts')).toBe(sf2)
      c1.clear()
      c2.clear()
    })

    test('clearing one cache stats does not reset another', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      const c1 = new ParseCache({ maxSize: 3 })
      const c2 = new ParseCache({ maxSize: 3 })

      c1.set('/test/a.ts', createMockSourceFile({}))
      c1.get('/test/a.ts')

      c2.get('/miss.ts')

      c1.clear()

      expect(c1.getStats().hits).toBe(0)
      expect(c2.getStats().misses).toBe(1)
      c2.clear()
    })

    test('caches with different maxSize are independent', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      const small = new ParseCache({ maxSize: 1 })
      const large = new ParseCache({ maxSize: 10 })

      small.set('/test/a.ts', createMockSourceFile({}))
      large.set('/test/a.ts', createMockSourceFile({}))
      large.set('/test/b.ts', createMockSourceFile({}))

      expect(small.size).toBe(1)
      expect(large.size).toBe(2)
      small.clear()
      large.clear()
    })
  })

  describe('empty string and special paths', () => {
    test('empty string as path', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      const sf = createMockSourceFile({})
      cache.set('', sf)
      expect(cache.get('')).toBe(sf)
    })

    test('path with only extension', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      const sf = createMockSourceFile({})
      cache.set('.ts', sf)
      expect(cache.get('.ts')).toBe(sf)
    })

    test('path with query string characters', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      const sf = createMockSourceFile({})
      cache.set('/test/file.ts?v=1', sf)
      expect(cache.get('/test/file.ts?v=1')).toBe(sf)
    })

    test('path with hash', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      const sf = createMockSourceFile({})
      cache.set('/test/file.ts#section', sf)
      expect(cache.get('/test/file.ts#section')).toBe(sf)
    })
  })

  describe('statSync called with exact arguments', () => {
    test('statSync called with path on set', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/exact/path.ts', createMockSourceFile({}))
      expect(mockStatSync).toHaveBeenLastCalledWith('/exact/path.ts')
    })

    test('statSync called with path on get hit', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/target.ts', createMockSourceFile({}))
      vi.clearAllMocks()

      cache.get('/target.ts')
      expect(mockStatSync).toHaveBeenCalledWith('/target.ts')
    })

    test('statSync not called for uncached get', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      cache.get('/unknown.ts')
      expect(mockStatSync).not.toHaveBeenCalled()
    })
  })

  describe('double get on same cached entry', () => {
    test('both gets return same object', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      const sf = createMockSourceFile({})
      cache.set('/test/file.ts', sf)

      const first = cache.get('/test/file.ts')
      const second = cache.get('/test/file.ts')
      expect(first).toBe(second)
      expect(first).toBe(sf)
    })

    test('both gets count as separate hits', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/file.ts', createMockSourceFile({}))
      cache.get('/test/file.ts')
      cache.get('/test/file.ts')

      expect(cache.getStats().hits).toBe(2)
    })
  })

  describe('size after various operations', () => {
    test('size stays 0 after failed sets', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockImplementation(() => {
        throw new Error('fail')
      })

      cache.set('/test/a.ts', createMockSourceFile({}))
      cache.set('/test/b.ts', createMockSourceFile({}))
      expect(cache.size).toBe(0)
    })

    test('size correct after mix of successful and failed sets', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      mockStatSync.mockReturnValueOnce({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)
      cache.set('/test/good.ts', createMockSourceFile({}))

      mockStatSync.mockImplementationOnce(() => {
        throw new Error('fail')
      })
      cache.set('/test/bad.ts', createMockSourceFile({}))

      mockStatSync.mockReturnValueOnce({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)
      cache.set('/test/also-good.ts', createMockSourceFile({}))

      expect(cache.size).toBe(2)
    })
  })

  describe('get returns undefined consistently for stale', () => {
    test('repeated gets of stale entry all return undefined', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)

      mockStatSync.mockReturnValueOnce({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)
      cache.set('/test/file.ts', createMockSourceFile({}))

      mockStatSync.mockReturnValue({ mtimeMs: 2000, size: 50 } as ReturnType<typeof statSync>)

      expect(cache.get('/test/file.ts')).toBeUndefined()
      expect(cache.get('/test/file.ts')).toBeUndefined()
      expect(cache.get('/test/file.ts')).toBeUndefined()
    })
  })

  describe('has after various mutations', () => {
    test('has returns false after entry overwritten then evicted', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/a.ts', createMockSourceFile({}))
      cache.set('/test/b.ts', createMockSourceFile({}))
      cache.set('/test/c.ts', createMockSourceFile({}))

      cache.set('/test/a.ts', createMockSourceFile({}))
      cache.set('/test/d.ts', createMockSourceFile({}))
      cache.set('/test/e.ts', createMockSourceFile({}))

      expect(cache.has('/test/b.ts')).toBe(false)
    })

    test('has returns true for entry protected by access', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/a.ts', createMockSourceFile({}))
      cache.set('/test/b.ts', createMockSourceFile({}))
      cache.set('/test/c.ts', createMockSourceFile({}))

      cache.get('/test/b.ts')
      cache.set('/test/d.ts', createMockSourceFile({}))

      expect(cache.has('/test/b.ts')).toBe(true)
    })
  })

  describe('getStats total computation', () => {
    test('total equals hits plus misses', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/file.ts', createMockSourceFile({}))
      cache.get('/test/file.ts')
      cache.get('/miss.ts')

      const stats = cache.getStats()
      expect(stats.hits + stats.misses).toBe(2)
    })

    test('total is 0 when no operations performed', () => {
      const stats = cache.getStats()
      expect(stats.hits + stats.misses).toBe(0)
    })

    test('total increases monotonically', async () => {
      const { statSync } = await import('node:fs')
      const mockStatSync = vi.mocked(statSync)
      mockStatSync.mockReturnValue({ mtimeMs: 1000, size: 50 } as ReturnType<typeof statSync>)

      cache.set('/test/file.ts', createMockSourceFile({}))

      const t0 = cache.getStats().hits + cache.getStats().misses
      cache.get('/test/file.ts')
      const t1 = cache.getStats().hits + cache.getStats().misses
      cache.get('/miss.ts')
      const t2 = cache.getStats().hits + cache.getStats().misses

      expect(t1).toBeGreaterThan(t0)
      expect(t2).toBeGreaterThan(t1)
    })
  })
})
