import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import * as os from 'node:os'
import { CachedFileReader } from '../src/core/file-reader/index.js'
import { DEFAULT_FILE_READER_OPTIONS } from '../src/core/file-reader/index.js'
import type { FileReaderOptions, FileReaderStats, CachedFile } from '../src/core/file-reader/index.js'

// ─── DEFAULT_FILE_READER_OPTIONS ───

describe('DEFAULT_FILE_READER_OPTIONS', () => {
  it('has correct default values', () => {
    expect(DEFAULT_FILE_READER_OPTIONS.maxCacheSize).toBe(1000)
    expect(DEFAULT_FILE_READER_OPTIONS.maxFileSize).toBe(1024 * 1024)
    expect(DEFAULT_FILE_READER_OPTIONS.readAheadSize).toBe(64 * 1024)
    expect(DEFAULT_FILE_READER_OPTIONS.encoding).toBe('utf-8')
    expect(DEFAULT_FILE_READER_OPTIONS.stats).toBe(true)
  })
})

// ─── CachedFileReader - Construction ───

describe('CachedFileReader - Construction', () => {
  it('creates with default options', () => {
    const reader = new CachedFileReader()
    const stats = reader.getStats()
    expect(stats.totalReads).toBe(0)
    expect(stats.cacheHits).toBe(0)
    expect(stats.cacheMisses).toBe(0)
    expect(reader.getCacheSize()).toBe(0)
  })

  it('accepts partial options overriding defaults', () => {
    const reader = new CachedFileReader({ maxCacheSize: 5, stats: false })
    const stats = reader.getStats()
    expect(stats.totalReads).toBe(0)
  })
})

// ─── CachedFileReader - readFile ───

describe('CachedFileReader - readFile', () => {
  let tmpDir: string
  let reader: CachedFileReader

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'file-reader-test-'))
    reader = new CachedFileReader({ maxCacheSize: 10 })
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true })
  })

  it('reads a file and returns content', async () => {
    const filePath = path.join(tmpDir, 'test.txt')
    await fs.writeFile(filePath, 'hello world', 'utf-8')
    const content = await reader.readFile(filePath)
    expect(content).toBe('hello world')
  })

  it('caches file on first read', async () => {
    const filePath = path.join(tmpDir, 'cached.txt')
    await fs.writeFile(filePath, 'content', 'utf-8')
    await reader.readFile(filePath)
    expect(reader.isCached(filePath)).toBe(true)
    expect(reader.getCacheSize()).toBe(1)
  })

  it('returns cached content on subsequent reads', async () => {
    const filePath = path.join(tmpDir, 'repeat.txt')
    await fs.writeFile(filePath, 'original', 'utf-8')
    const first = await reader.readFile(filePath)
    const second = await reader.readFile(filePath)
    expect(first).toBe('original')
    expect(second).toBe('original')
    const stats = reader.getStats()
    expect(stats.cacheHits).toBe(1)
    expect(stats.totalReads).toBe(2)
  })

  it('tracks cache misses', async () => {
    const filePath = path.join(tmpDir, 'miss.txt')
    await fs.writeFile(filePath, 'data', 'utf-8')
    await reader.readFile(filePath)
    const stats = reader.getStats()
    expect(stats.cacheMisses).toBe(1)
  })

  it('invalidates cache when file is modified', async () => {
    const filePath = path.join(tmpDir, 'modified.txt')
    await fs.writeFile(filePath, 'v1', 'utf-8')
    const first = await reader.readFile(filePath)
    // Small delay to ensure mtime changes
    await new Promise((r) => setTimeout(r, 10))
    await fs.writeFile(filePath, 'v2', 'utf-8')
    const second = await reader.readFile(filePath)
    expect(first).toBe('v1')
    expect(second).toBe('v2')
  })
})

// ─── CachedFileReader - readFiles ───

describe('CachedFileReader - readFiles', () => {
  let tmpDir: string
  let reader: CachedFileReader

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'file-reader-test-'))
    reader = new CachedFileReader({ maxCacheSize: 10 })
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true })
  })

  it('reads multiple files and returns a map', async () => {
    const f1 = path.join(tmpDir, 'a.txt')
    const f2 = path.join(tmpDir, 'b.txt')
    await fs.writeFile(f1, 'alpha', 'utf-8')
    await fs.writeFile(f2, 'beta', 'utf-8')
    const map = await reader.readFiles([f1, f2])
    expect(map.get(f1)).toBe('alpha')
    expect(map.get(f2)).toBe('beta')
    expect(map.size).toBe(2)
  })

  it('handles empty array', async () => {
    const map = await reader.readFiles([])
    expect(map.size).toBe(0)
  })
})

// ─── CachedFileReader - Cache Management ───

describe('CachedFileReader - Cache Management', () => {
  let tmpDir: string
  let reader: CachedFileReader

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'file-reader-test-'))
    reader = new CachedFileReader({ maxCacheSize: 10 })
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true })
  })

  it('isCached returns false for uncached files', () => {
    expect(reader.isCached('/nonexistent')).toBe(false)
  })

  it('getCachedFile returns null for uncached paths', () => {
    expect(reader.getCachedFile('/nonexistent')).toBeNull()
  })

  it('getCachedFile returns entry after reading', async () => {
    const filePath = path.join(tmpDir, 'cached.txt')
    await fs.writeFile(filePath, 'data', 'utf-8')
    await reader.readFile(filePath)
    const cached = reader.getCachedFile(filePath)
    expect(cached).not.toBeNull()
    expect(cached!.content).toBe('data')
    expect(cached!.hitCount).toBe(0)
  })

  it('invalidate removes a cached entry', async () => {
    const filePath = path.join(tmpDir, 'inv.txt')
    await fs.writeFile(filePath, 'data', 'utf-8')
    await reader.readFile(filePath)
    expect(reader.invalidate(filePath)).toBe(true)
    expect(reader.isCached(filePath)).toBe(false)
  })

  it('invalidate returns false for non-cached file', () => {
    expect(reader.invalidate('/nonexistent')).toBe(false)
  })

  it('clear removes all entries', async () => {
    const f1 = path.join(tmpDir, 'c1.txt')
    const f2 = path.join(tmpDir, 'c2.txt')
    await fs.writeFile(f1, 'a', 'utf-8')
    await fs.writeFile(f2, 'b', 'utf-8')
    await reader.readFile(f1)
    await reader.readFile(f2)
    reader.clear()
    expect(reader.getCacheSize()).toBe(0)
    expect(reader.isCached(f1)).toBe(false)
  })

  it('getCachedPaths returns all cached paths', async () => {
    const f1 = path.join(tmpDir, 'p1.txt')
    const f2 = path.join(tmpDir, 'p2.txt')
    await fs.writeFile(f1, 'a', 'utf-8')
    await fs.writeFile(f2, 'b', 'utf-8')
    await reader.readFile(f1)
    await reader.readFile(f2)
    const paths = reader.getCachedPaths()
    expect(paths.length).toBe(2)
  })
})

// ─── CachedFileReader - Eviction ───

describe('CachedFileReader - Eviction', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'file-reader-test-'))
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true })
  })

  it('evicts old entries when cache is full', async () => {
    const reader = new CachedFileReader({ maxCacheSize: 2 })
    const files = []
    for (let i = 0; i < 3; i++) {
      const fp = path.join(tmpDir, `evict${i}.txt`)
      await fs.writeFile(fp, `content${i}`, 'utf-8')
      files.push(fp)
    }
    await reader.readFile(files[0]!)
    await reader.readFile(files[1]!)
    await reader.readFile(files[2]!)
    const stats = reader.getStats()
    expect(stats.evictions).toBeGreaterThan(0)
    expect(reader.getCacheSize()).toBeLessThanOrEqual(2)
  })
})

// ─── CachedFileReader - Stats ───

describe('CachedFileReader - Stats', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'file-reader-test-'))
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true })
  })

  it('computes hitRate correctly', async () => {
    const reader = new CachedFileReader({ maxCacheSize: 10 })
    const fp = path.join(tmpDir, 'rate.txt')
    await fs.writeFile(fp, 'data', 'utf-8')
    await reader.readFile(fp) // miss
    await reader.readFile(fp) // hit
    const stats = reader.getStats()
    expect(stats.hitRate).toBe(0.5)
    expect(stats.totalReads).toBe(2)
    expect(stats.cacheHits).toBe(1)
    expect(stats.cacheMisses).toBe(1)
  })

  it('tracks totalBytesRead', async () => {
    const reader = new CachedFileReader({ maxCacheSize: 10 })
    const fp = path.join(tmpDir, 'bytes.txt')
    await fs.writeFile(fp, 'hello', 'utf-8')
    await reader.readFile(fp)
    const stats = reader.getStats()
    expect(stats.totalBytesRead).toBe(5)
  })

  it('disables stats when option is false', async () => {
    const reader = new CachedFileReader({ stats: false, maxCacheSize: 10 })
    const fp = path.join(tmpDir, 'nostats.txt')
    await fs.writeFile(fp, 'data', 'utf-8')
    await reader.readFile(fp)
    const stats = reader.getStats()
    expect(stats.totalReads).toBe(0)
    expect(stats.cacheMisses).toBe(0)
  })
})

// ─── CachedFileReader - invalidatePattern ───

describe('CachedFileReader - invalidatePattern', () => {
  let tmpDir: string
  let reader: CachedFileReader

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'file-reader-test-'))
    reader = new CachedFileReader({ maxCacheSize: 10 })
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true })
  })

  it('invalidates files matching pattern', async () => {
    const f1 = path.join(tmpDir, 'match-a.txt')
    const f2 = path.join(tmpDir, 'match-b.txt')
    const f3 = path.join(tmpDir, 'other.txt')
    await fs.writeFile(f1, 'a', 'utf-8')
    await fs.writeFile(f2, 'b', 'utf-8')
    await fs.writeFile(f3, 'c', 'utf-8')
    await reader.readFile(f1)
    await reader.readFile(f2)
    await reader.readFile(f3)
    const count = reader.invalidatePattern('**match**')
    expect(count).toBe(2)
    expect(reader.isCached(f3)).toBe(true)
  })

  it('returns 0 when no files match', async () => {
    const count = reader.invalidatePattern('nonexistent')
    expect(count).toBe(0)
  })
})

// ─── CachedFileReader - preload ───

describe('CachedFileReader - preload', () => {
  let tmpDir: string
  let reader: CachedFileReader

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'file-reader-test-'))
    reader = new CachedFileReader({ maxCacheSize: 10 })
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true })
  })

  it('preloads files into cache', async () => {
    const f1 = path.join(tmpDir, 'pre1.txt')
    const f2 = path.join(tmpDir, 'pre2.txt')
    await fs.writeFile(f1, 'x', 'utf-8')
    await fs.writeFile(f2, 'y', 'utf-8')
    await reader.preload([f1, f2])
    expect(reader.isCached(f1)).toBe(true)
    expect(reader.isCached(f2)).toBe(true)
  })
})
