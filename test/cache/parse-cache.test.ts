import { statSync } from 'node:fs'
import type { Stats } from 'node:fs'
import type { SourceFile } from 'ts-morph'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ParseCache, globalParseCache } from '../../src/cache/parse-cache.js'

vi.mock('node:fs', () => ({
  statSync: vi.fn(),
}))

const mockStatSync = vi.mocked(statSync)

function makeStats(overrides: Partial<{ mtimeMs: number; size: number }> = {}): Stats {
  const stats = {
    mtimeMs: overrides.mtimeMs ?? 1000,
    size: overrides.size ?? 100,
  } as Stats
  return stats
}

function makeSourceFile(): SourceFile {
  return {} as SourceFile
}

// ─── Constructor ──────────────────────────────────────────
describe('ParseCache - constructor', () => {
  it('creates cache with default maxSize of 100', () => {
    const cache = new ParseCache()
    expect(cache.size).toBe(0)
  })

  it('creates cache with custom maxSize', () => {
    const cache = new ParseCache({ maxSize: 50 })
    expect(cache.size).toBe(0)
  })
})

// ─── set/get ──────────────────────────────────────────────
describe('ParseCache - set/get', () => {
  let cache: ParseCache

  beforeEach(() => {
    cache = new ParseCache({ maxSize: 10 })
    mockStatSync.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('round-trips a source file on matching file stats', () => {
    const sf = makeSourceFile()
    mockStatSync.mockReturnValue(makeStats({ mtimeMs: 5000, size: 200 }))

    cache.set('/path/to/file.ts', sf)

    mockStatSync.mockReturnValue(makeStats({ mtimeMs: 5000, size: 200 }))
    const result = cache.get('/path/to/file.ts')
    expect(result).toBe(sf)
  })

  it('returns undefined when mtime changes (cache miss)', () => {
    const sf = makeSourceFile()
    mockStatSync.mockReturnValue(makeStats({ mtimeMs: 5000, size: 200 }))
    cache.set('/path/to/file.ts', sf)

    mockStatSync.mockReturnValue(makeStats({ mtimeMs: 6000, size: 200 }))
    const result = cache.get('/path/to/file.ts')
    expect(result).toBeUndefined()
  })

  it('returns undefined when size changes (cache miss)', () => {
    const sf = makeSourceFile()
    mockStatSync.mockReturnValue(makeStats({ mtimeMs: 5000, size: 200 }))
    cache.set('/path/to/file.ts', sf)

    mockStatSync.mockReturnValue(makeStats({ mtimeMs: 5000, size: 999 }))
    const result = cache.get('/path/to/file.ts')
    expect(result).toBeUndefined()
  })

  it('returns undefined when statSync throws (cache miss)', () => {
    const sf = makeSourceFile()
    mockStatSync.mockReturnValue(makeStats({ mtimeMs: 5000, size: 200 }))
    cache.set('/path/to/file.ts', sf)

    mockStatSync.mockImplementation(() => {
      throw new Error('ENOENT')
    })
    const result = cache.get('/path/to/file.ts')
    expect(result).toBeUndefined()
  })

  it('returns undefined for never-set key', () => {
    const result = cache.get('/never/set.ts')
    expect(result).toBeUndefined()
  })

  it('does not store when statSync throws in set', () => {
    mockStatSync.mockImplementation(() => {
      throw new Error('ENOENT')
    })
    cache.set('/missing/file.ts', makeSourceFile())
    expect(cache.has('/missing/file.ts')).toBe(false)
  })
})

// ─── has ──────────────────────────────────────────────────
describe('ParseCache - has', () => {
  let cache: ParseCache

  beforeEach(() => {
    cache = new ParseCache({ maxSize: 10 })
    mockStatSync.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns true for a present entry', () => {
    mockStatSync.mockReturnValue(makeStats())
    cache.set('/present.ts', makeSourceFile())
    expect(cache.has('/present.ts')).toBe(true)
  })

  it('returns false for an absent entry', () => {
    expect(cache.has('/absent.ts')).toBe(false)
  })
})

// ─── delete ───────────────────────────────────────────────
describe('ParseCache - delete', () => {
  let cache: ParseCache

  beforeEach(() => {
    cache = new ParseCache({ maxSize: 10 })
    mockStatSync.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('removes an entry and returns true', () => {
    mockStatSync.mockReturnValue(makeStats())
    cache.set('/to-delete.ts', makeSourceFile())
    expect(cache.delete('/to-delete.ts')).toBe(true)
    expect(cache.has('/to-delete.ts')).toBe(false)
  })

  it('returns false for missing entry', () => {
    expect(cache.delete('/nope.ts')).toBe(false)
  })
})

// ─── clear ────────────────────────────────────────────────
describe('ParseCache - clear', () => {
  let cache: ParseCache

  beforeEach(() => {
    cache = new ParseCache({ maxSize: 10 })
    mockStatSync.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('empties cache and resets stats', () => {
    mockStatSync.mockReturnValue(makeStats())
    cache.set('/a.ts', makeSourceFile())
    cache.get('/a.ts')
    cache.clear()
    expect(cache.size).toBe(0)
    const stats = cache.getStats()
    expect(stats.hits).toBe(0)
    expect(stats.misses).toBe(0)
  })
})

// ─── getStats ─────────────────────────────────────────────
describe('ParseCache - getStats', () => {
  let cache: ParseCache

  beforeEach(() => {
    cache = new ParseCache({ maxSize: 10 })
    mockStatSync.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('tracks hits, misses, and hitRate', () => {
    mockStatSync.mockReturnValue(makeStats({ mtimeMs: 1000, size: 50 }))
    cache.set('/file.ts', makeSourceFile())

    mockStatSync.mockReturnValue(makeStats({ mtimeMs: 1000, size: 50 }))
    cache.get('/file.ts')

    cache.get('/missing.ts')

    const stats = cache.getStats()
    expect(stats.hits).toBe(1)
    expect(stats.misses).toBe(1)
    expect(stats.hitRate).toBeCloseTo(0.5)
    expect(stats.size).toBe(1)
  })

  it('reports zero hitRate when no accesses', () => {
    const stats = cache.getStats()
    expect(stats.hitRate).toBe(0)
    expect(stats.hits).toBe(0)
    expect(stats.misses).toBe(0)
  })
})

// ─── globalParseCache ─────────────────────────────────────
describe('globalParseCache', () => {
  it('is a ParseCache instance', () => {
    expect(globalParseCache).toBeInstanceOf(ParseCache)
  })
})
