import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import * as os from 'node:os'
import { CachedFileReader } from '../../src/core/file-reader/cached-file-reader.js'

let tmpDir: string

async function createTmpFile(name: string, content: string): Promise<string> {
  const filePath = path.join(tmpDir, name)
  await fs.writeFile(filePath, content, 'utf-8')
  return filePath
}

describe('CachedFileReader', () => {
  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cfr-test-'))
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true })
  })

  describe('readFile', () => {
    it('reads a file from disk', async () => {
      const reader = new CachedFileReader()
      const filePath = await createTmpFile('a.txt', 'hello world')
      const content = await reader.readFile(filePath)
      expect(content).toBe('hello world')
    })

    it('returns cached content on second read', async () => {
      const reader = new CachedFileReader()
      const filePath = await createTmpFile('b.txt', 'cached content')
      const first = await reader.readFile(filePath)
      const second = await reader.readFile(filePath)
      expect(first).toBe('cached content')
      expect(second).toBe('cached content')
    })

    it('handles non-existent file by throwing', async () => {
      const reader = new CachedFileReader()
      await expect(reader.readFile('/nonexistent/file.txt')).rejects.toThrow()
    })

    it('updates hit count on cache hit', async () => {
      const reader = new CachedFileReader()
      const filePath = await createTmpFile('hits.txt', 'data')
      await reader.readFile(filePath)
      await reader.readFile(filePath)
      const cached = reader.getCachedFile(filePath)
      expect(cached?.hitCount).toBe(1)
    })

    it('updates stats on reads', async () => {
      const reader = new CachedFileReader({ stats: true })
      const filePath = await createTmpFile('stats.txt', 'stats data')
      await reader.readFile(filePath)
      const stats = reader.getStats()
      expect(stats.totalReads).toBe(1)
      expect(stats.cacheMisses).toBe(1)
    })

    it('tracks totalBytesRead', async () => {
      const reader = new CachedFileReader({ stats: true })
      const filePath = await createTmpFile('bytes.txt', '12345')
      await reader.readFile(filePath)
      const stats = reader.getStats()
      expect(stats.totalBytesRead).toBe(5)
    })

    it('detects file modification and re-reads', async () => {
      const reader = new CachedFileReader()
      const filePath = await createTmpFile('mod.txt', 'original')
      await reader.readFile(filePath)
      await fs.writeFile(filePath, 'updated', 'utf-8')
      const content = await reader.readFile(filePath)
      expect(content).toBe('updated')
    })

    it('normalizes paths', async () => {
      const reader = new CachedFileReader()
      const filePath = await createTmpFile('norm.txt', 'normalized')
      const resolved = path.resolve(filePath)
      await reader.readFile(filePath)
      const content = await reader.readFile(resolved)
      expect(content).toBe('normalized')
    })

    it('reads empty file', async () => {
      const reader = new CachedFileReader()
      const filePath = await createTmpFile('empty.txt', '')
      const content = await reader.readFile(filePath)
      expect(content).toBe('')
    })
  })

  describe('readFiles', () => {
    it('reads multiple files in parallel', async () => {
      const reader = new CachedFileReader()
      const f1 = await createTmpFile('m1.txt', 'one')
      const f2 = await createTmpFile('m2.txt', 'two')
      const f3 = await createTmpFile('m3.txt', 'three')
      const results = await reader.readFiles([f1, f2, f3])
      expect(results.get(f1)).toBe('one')
      expect(results.get(f2)).toBe('two')
      expect(results.get(f3)).toBe('three')
    })

    it('handles single file', async () => {
      const reader = new CachedFileReader()
      const f1 = await createTmpFile('single.txt', 'solo')
      const results = await reader.readFiles([f1])
      expect(results.get(f1)).toBe('solo')
    })

    it('handles empty array', async () => {
      const reader = new CachedFileReader()
      const results = await reader.readFiles([])
      expect(results.size).toBe(0)
    })
  })

  describe('isCached', () => {
    it('returns true for cached file', async () => {
      const reader = new CachedFileReader()
      const filePath = await createTmpFile('cached.txt', 'yes')
      await reader.readFile(filePath)
      expect(reader.isCached(filePath)).toBe(true)
    })

    it('returns false for uncached file', () => {
      const reader = new CachedFileReader()
      expect(reader.isCached('/no/such/file.txt')).toBe(false)
    })

    it('returns false after invalidation', async () => {
      const reader = new CachedFileReader()
      const filePath = await createTmpFile('inv.txt', 'temp')
      await reader.readFile(filePath)
      reader.invalidate(filePath)
      expect(reader.isCached(filePath)).toBe(false)
    })
  })

  describe('getCachedFile', () => {
    it('returns cached info for cached file', async () => {
      const reader = new CachedFileReader()
      const filePath = await createTmpFile('info.txt', 'info data')
      await reader.readFile(filePath)
      const cached = reader.getCachedFile(filePath)
      expect(cached).not.toBeNull()
      expect(cached!.content).toBe('info data')
      expect(cached!.size).toBe(9)
      expect(cached!.hitCount).toBe(0)
      expect(typeof cached!.lastModified).toBe('number')
      expect(typeof cached!.readAt).toBe('number')
    })

    it('returns null for uncached file', () => {
      const reader = new CachedFileReader()
      expect(reader.getCachedFile('/no/file')).toBeNull()
    })
  })

  describe('invalidate', () => {
    it('removes a file from cache', async () => {
      const reader = new CachedFileReader()
      const filePath = await createTmpFile('rm.txt', 'remove me')
      await reader.readFile(filePath)
      const result = reader.invalidate(filePath)
      expect(result).toBe(true)
      expect(reader.isCached(filePath)).toBe(false)
    })

    it('returns false for non-cached file', () => {
      const reader = new CachedFileReader()
      expect(reader.invalidate('/no/file')).toBe(false)
    })
  })

  describe('invalidatePattern', () => {
    it('removes matching files with glob pattern', async () => {
      const reader = new CachedFileReader()
      const f1 = await createTmpFile('a.log', 'log1')
      const f2 = await createTmpFile('b.log', 'log2')
      const f3 = await createTmpFile('c.txt', 'txt')
      await reader.readFiles([f1, f2, f3])
      const removed = reader.invalidatePattern('*.log')
      expect(removed).toBe(2)
      expect(reader.isCached(f1)).toBe(false)
      expect(reader.isCached(f2)).toBe(false)
      expect(reader.isCached(f3)).toBe(true)
    })

    it('handles globstar pattern', async () => {
      const reader = new CachedFileReader()
      const f1 = await createTmpFile('x.ts', 'ts1')
      const f2 = await createTmpFile('y.js', 'js')
      await reader.readFiles([f1, f2])
      const removed = reader.invalidatePattern('**' + path.sep + '*.ts')
      expect(removed).toBeGreaterThanOrEqual(1)
    })

    it('removes zero files when no match', async () => {
      const reader = new CachedFileReader()
      const f1 = await createTmpFile('nomatch.txt', 'data')
      await reader.readFile(f1)
      const removed = reader.invalidatePattern('*.xyz')
      expect(removed).toBe(0)
      expect(reader.isCached(f1)).toBe(true)
    })

    it('removes all with wildcard', async () => {
      const reader = new CachedFileReader()
      const f1 = await createTmpFile('w1.txt', 'a')
      const f2 = await createTmpFile('w2.txt', 'b')
      await reader.readFiles([f1, f2])
      const removed = reader.invalidatePattern('*')
      expect(removed).toBe(2)
    })
  })

  describe('preload', () => {
    it('loads files into cache', async () => {
      const reader = new CachedFileReader()
      const f1 = await createTmpFile('p1.txt', 'preload1')
      const f2 = await createTmpFile('p2.txt', 'preload2')
      await reader.preload([f1, f2])
      expect(reader.isCached(f1)).toBe(true)
      expect(reader.isCached(f2)).toBe(true)
    })

    it('handles empty array', async () => {
      const reader = new CachedFileReader()
      await expect(reader.preload([])).resolves.toBeUndefined()
    })
  })

  describe('getStats', () => {
    it('returns correct statistics', async () => {
      const reader = new CachedFileReader({ stats: true })
      const filePath = await createTmpFile('stat.txt', 'stat')
      await reader.readFile(filePath)
      const stats = reader.getStats()
      expect(stats.totalReads).toBe(1)
      expect(stats.cacheMisses).toBe(1)
      expect(stats.cachedFiles).toBe(1)
    })

    it('calculates correct hit rate', async () => {
      const reader = new CachedFileReader({ stats: true })
      const filePath = await createTmpFile('rate.txt', 'rate')
      await reader.readFile(filePath)
      await reader.readFile(filePath)
      await reader.readFile(filePath)
      const stats = reader.getStats()
      expect(stats.hitRate).toBeCloseTo(2 / 3)
    })

    it('tracks evictions', async () => {
      const reader = new CachedFileReader({ maxCacheSize: 2, stats: true })
      const f1 = await createTmpFile('ev1.txt', 'a')
      const f2 = await createTmpFile('ev2.txt', 'b')
      const f3 = await createTmpFile('ev3.txt', 'c')
      await reader.readFile(f1)
      await reader.readFile(f2)
      await reader.readFile(f3)
      const stats = reader.getStats()
      expect(stats.evictions).toBeGreaterThanOrEqual(1)
    })

    it('tracks cacheMemoryUsage', async () => {
      const reader = new CachedFileReader({ stats: true })
      const filePath = await createTmpFile('mem.txt', '12345')
      await reader.readFile(filePath)
      const stats = reader.getStats()
      expect(stats.cacheMemoryUsage).toBe(5)
    })

    it('stats disabled returns zeroes', async () => {
      const reader = new CachedFileReader({ stats: false })
      const filePath = await createTmpFile('nostats.txt', 'x')
      await reader.readFile(filePath)
      const stats = reader.getStats()
      expect(stats.totalReads).toBe(0)
      expect(stats.cacheHits).toBe(0)
    })
  })

  describe('getCachedPaths', () => {
    it('returns all cached file paths', async () => {
      const reader = new CachedFileReader()
      const f1 = await createTmpFile('cp1.txt', 'a')
      const f2 = await createTmpFile('cp2.txt', 'b')
      await reader.readFiles([f1, f2])
      const paths = reader.getCachedPaths()
      expect(paths).toHaveLength(2)
      expect(paths).toContain(path.resolve(f1))
      expect(paths).toContain(path.resolve(f2))
    })

    it('returns empty array when cache is empty', () => {
      const reader = new CachedFileReader()
      expect(reader.getCachedPaths()).toEqual([])
    })
  })

  describe('clear', () => {
    it('empties the cache', async () => {
      const reader = new CachedFileReader()
      const filePath = await createTmpFile('clr.txt', 'clear')
      await reader.readFile(filePath)
      expect(reader.getCacheSize()).toBe(1)
      reader.clear()
      expect(reader.getCacheSize()).toBe(0)
      expect(reader.isCached(filePath)).toBe(false)
    })
  })

  describe('getCacheSize', () => {
    it('returns 0 for empty cache', () => {
      const reader = new CachedFileReader()
      expect(reader.getCacheSize()).toBe(0)
    })

    it('returns correct count after reads', async () => {
      const reader = new CachedFileReader()
      const f1 = await createTmpFile('sz1.txt', 'a')
      const f2 = await createTmpFile('sz2.txt', 'b')
      await reader.readFile(f1)
      expect(reader.getCacheSize()).toBe(1)
      await reader.readFile(f2)
      expect(reader.getCacheSize()).toBe(2)
    })
  })

  describe('LRU eviction', () => {
    it('evicts oldest entries when cache is full', async () => {
      const reader = new CachedFileReader({ maxCacheSize: 2 })
      const f1 = await createTmpFile('lru1.txt', 'first')
      const f2 = await createTmpFile('lru2.txt', 'second')
      const f3 = await createTmpFile('lru3.txt', 'third')
      await reader.readFile(f1)
      await reader.readFile(f2)
      await reader.readFile(f3)
      expect(reader.isCached(f1)).toBe(false)
      expect(reader.isCached(f2)).toBe(true)
      expect(reader.isCached(f3)).toBe(true)
    })

    it('evicts based on readAt not insertion order', async () => {
      const reader = new CachedFileReader({ maxCacheSize: 2 })
      const f1 = await createTmpFile('order1.txt', 'a')
      const f2 = await createTmpFile('order2.txt', 'b')
      const f3 = await createTmpFile('order3.txt', 'c')
      await reader.readFile(f1)
      await new Promise((r) => setTimeout(r, 2))
      await reader.readFile(f2)
      await new Promise((r) => setTimeout(r, 2))
      await reader.readFile(f1)
      await new Promise((r) => setTimeout(r, 2))
      await reader.readFile(f3)
      expect(reader.isCached(f1)).toBe(true)
      expect(reader.isCached(f2)).toBe(false)
      expect(reader.isCached(f3)).toBe(true)
    })

    it('reports evictions in stats', async () => {
      const reader = new CachedFileReader({ maxCacheSize: 1, stats: true })
      const f1 = await createTmpFile('evstat1.txt', 'a')
      const f2 = await createTmpFile('evstat2.txt', 'b')
      await reader.readFile(f1)
      await reader.readFile(f2)
      const stats = reader.getStats()
      expect(stats.evictions).toBeGreaterThanOrEqual(1)
    })
  })

  describe('large files', () => {
    it('does not cache files exceeding maxFileSize', async () => {
      const reader = new CachedFileReader({ maxFileSize: 10 })
      const filePath = await createTmpFile('big.txt', 'x'.repeat(100))
      await reader.readFile(filePath)
      expect(reader.isCached(filePath)).toBe(false)
    })

    it('still returns content for large files', async () => {
      const reader = new CachedFileReader({ maxFileSize: 10 })
      const bigContent = 'y'.repeat(100)
      const filePath = await createTmpFile('bigret.txt', bigContent)
      const content = await reader.readFile(filePath)
      expect(content).toBe(bigContent)
    })
  })

  describe('concurrent reads', () => {
    it('handles concurrent reads of same file', async () => {
      const reader = new CachedFileReader()
      const filePath = await createTmpFile('conc.txt', 'concurrent')
      const results = await Promise.all([
        reader.readFile(filePath),
        reader.readFile(filePath),
        reader.readFile(filePath),
      ])
      expect(results).toEqual(['concurrent', 'concurrent', 'concurrent'])
    })

    it('handles concurrent reads of different files', async () => {
      const reader = new CachedFileReader()
      const files = await Promise.all([
        createTmpFile('ca.txt', 'aa'),
        createTmpFile('cb.txt', 'bb'),
        createTmpFile('cc.txt', 'cc'),
      ])
      const results = await reader.readFiles(files)
      expect(results.size).toBe(3)
      for (const f of files) {
        expect(results.has(f)).toBe(true)
      }
    })
  })

  describe('options', () => {
    it('uses default options when none provided', () => {
      const reader = new CachedFileReader()
      expect(reader.getCacheSize()).toBe(0)
    })

    it('respects maxCacheSize of 0', async () => {
      const reader = new CachedFileReader({ maxCacheSize: 0 })
      const filePath = await createTmpFile('zero.txt', 'data')
      const content = await reader.readFile(filePath)
      expect(content).toBe('data')
      expect(reader.getCacheSize()).toBe(0)
    })

    it('uses custom encoding', async () => {
      const reader = new CachedFileReader({ encoding: 'utf-8' })
      const filePath = await createTmpFile('enc.txt', 'encöding')
      const content = await reader.readFile(filePath)
      expect(content).toBe('encöding')
    })
  })

  describe('getStats snapshot', () => {
    it('returns a copy not a reference', async () => {
      const reader = new CachedFileReader({ stats: true })
      const filePath = await createTmpFile('snap.txt', 'snap')
      await reader.readFile(filePath)
      const stats1 = reader.getStats()
      const stats2 = reader.getStats()
      stats1.totalReads = 999
      expect(stats2.totalReads).not.toBe(999)
    })
  })
})
