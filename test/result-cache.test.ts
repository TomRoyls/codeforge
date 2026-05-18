import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'

import type { RuleViolation } from '../src/ast/visitor.js'
import { hashContent } from '../src/cache/index.js'
import { ResultCache, createDefaultResultCache } from '../src/cache/result-cache.js'

import { describe, it, expect, beforeEach, afterEach } from 'vitest'

// ─── Helpers ──────────────────────────────────────────

const TEST_CACHE_DIR = path.join(process.cwd(), '.test-cache', 'results')

function createCache(options?: {
  cacheDir?: string
  enabled?: boolean
  ttl?: number
  version?: string
}): ResultCache {
  return new ResultCache({
    cacheDir: options?.cacheDir ?? TEST_CACHE_DIR,
    enabled: options?.enabled,
    ttl: options?.ttl,
    version: options?.version ?? 'test-1.0.0',
  })
}

function makeViolation(filePath: string, ruleId = 'test-rule'): RuleViolation {
  return {
    filePath,
    message: `Violation in ${filePath}`,
    range: { end: { column: 10, line: 1 }, start: { column: 0, line: 1 } },
    ruleId,
    severity: 'error',
  }
}

// ─── Constructor ──────────────────────────────────────

describe('ResultCache constructor', () => {
  beforeEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
  })

  it('creates instance with default options', () => {
    const cache = createCache()
    expect(cache).toBeInstanceOf(ResultCache)
    expect(cache.isEnabled()).toBe(true)
  })

  it('creates instance with disabled caching', () => {
    const cache = createCache({ enabled: false })
    expect(cache.isEnabled()).toBe(false)
  })

  it('creates instance with custom TTL', () => {
    const cache = createCache({ ttl: 60_000 })
    expect(cache.isEnabled()).toBe(true)
  })

  it('creates instance with custom version', () => {
    const cache = createCache({ version: '2.0.0' })
    expect(cache.isEnabled()).toBe(true)
  })
})

// ─── setEnabled ───────────────────────────────────────

describe('ResultCache setEnabled', () => {
  beforeEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
  })

  it('enables the cache', () => {
    const cache = createCache({ enabled: false })
    cache.setEnabled(true)
    expect(cache.isEnabled()).toBe(true)
  })

  it('disables the cache', () => {
    const cache = createCache()
    cache.setEnabled(false)
    expect(cache.isEnabled()).toBe(false)
  })

  it('toggles enabled state', () => {
    const cache = createCache()
    cache.setEnabled(false)
    expect(cache.isEnabled()).toBe(false)
    cache.setEnabled(true)
    expect(cache.isEnabled()).toBe(true)
  })
})

// ─── isEnabled ────────────────────────────────────────

describe('ResultCache isEnabled', () => {
  beforeEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
  })

  it('returns true by default', () => {
    expect(createCache().isEnabled()).toBe(true)
  })

  it('returns false when disabled', () => {
    expect(createCache({ enabled: false }).isEnabled()).toBe(false)
  })
})

// ─── set and get ──────────────────────────────────────

describe('ResultCache set and get', () => {
  let cache: ResultCache

  beforeEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
    cache = createCache()
  })

  afterEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
  })

  it('stores and retrieves violations', async () => {
    const violations = [makeViolation('/test/file.ts')]
    await cache.set('/test/file.ts', 'fileHash1', 'configHash1', violations)

    const result = await cache.get('/test/file.ts', 'fileHash1', 'configHash1')
    expect(result).not.toBeNull()
    expect(result!).toHaveLength(1)
    expect(result![0]!.filePath).toBe('/test/file.ts')
  })

  it('stores and retrieves multiple violations', async () => {
    const violations = [
      makeViolation('/test/file.ts', 'rule-a'),
      makeViolation('/test/file.ts', 'rule-b'),
      makeViolation('/test/file.ts', 'rule-c'),
    ]
    await cache.set('/test/file.ts', 'fh1', 'ch1', violations)

    const result = await cache.get('/test/file.ts', 'fh1', 'ch1')
    expect(result).toHaveLength(3)
  })

  it('returns null when no entry exists', async () => {
    const result = await cache.get('/test/file.ts', 'fh1', 'ch1')
    expect(result).toBeNull()
  })

  it('returns null when file hash does not match', async () => {
    await cache.set('/test/file.ts', 'fh1', 'ch1', [makeViolation('/test/file.ts')])
    const result = await cache.get('/test/file.ts', 'fh2', 'ch1')
    expect(result).toBeNull()
  })

  it('returns null when config hash does not match', async () => {
    await cache.set('/test/file.ts', 'fh1', 'ch1', [makeViolation('/test/file.ts')])
    const result = await cache.get('/test/file.ts', 'fh1', 'ch2')
    expect(result).toBeNull()
  })

  it('overwrites existing entry on re-set', async () => {
    const v1 = [makeViolation('/test/file.ts', 'rule-1')]
    const v2 = [makeViolation('/test/file.ts', 'rule-2'), makeViolation('/test/file.ts', 'rule-3')]

    await cache.set('/test/file.ts', 'fh1', 'ch1', v1)
    await cache.set('/test/file.ts', 'fh1', 'ch1', v2)

    const result = await cache.get('/test/file.ts', 'fh1', 'ch1')
    expect(result).toHaveLength(2)
  })

  it('does not store when disabled', async () => {
    cache.setEnabled(false)
    await cache.set('/test/file.ts', 'fh1', 'ch1', [makeViolation('/test/file.ts')])
    cache.setEnabled(true)

    const result = await cache.get('/test/file.ts', 'fh1', 'ch1')
    expect(result).toBeNull()
  })

  it('stores empty violations array', async () => {
    await cache.set('/test/file.ts', 'fh1', 'ch1', [])

    const result = await cache.get('/test/file.ts', 'fh1', 'ch1')
    expect(result).not.toBeNull()
    expect(result!).toHaveLength(0)
  })

  it('handles different file paths independently', async () => {
    await cache.set('/test/a.ts', 'fh-a', 'ch1', [makeViolation('/test/a.ts', 'rule-a')])
    await cache.set('/test/b.ts', 'fh-b', 'ch1', [makeViolation('/test/b.ts', 'rule-b')])

    const ra = await cache.get('/test/a.ts', 'fh-a', 'ch1')
    const rb = await cache.get('/test/b.ts', 'fh-b', 'ch1')

    expect(ra).toHaveLength(1)
    expect(rb).toHaveLength(1)
    expect(ra![0]!.ruleId).toBe('rule-a')
    expect(rb![0]!.ruleId).toBe('rule-b')
  })

  it('preserves violation with suggestion', async () => {
    const violation: RuleViolation = {
      filePath: '/test/file.ts',
      message: 'Use const',
      range: { end: { column: 5, line: 1 }, start: { column: 0, line: 1 } },
      ruleId: 'prefer-const',
      severity: 'warning',
      suggestion: 'Replace let with const',
    }

    await cache.set('/test/file.ts', 'fh1', 'ch1', [violation])
    const result = await cache.get('/test/file.ts', 'fh1', 'ch1')

    expect(result![0]!.suggestion).toBe('Replace let with const')
    expect(result![0]!.severity).toBe('warning')
  })
})

// ─── get - version mismatch ───────────────────────────

describe('ResultCache get - version mismatch', () => {
  beforeEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
  })

  afterEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
  })

  it('returns null on version mismatch', async () => {
    const cacheV1 = createCache({ version: 'v1' })
    await cacheV1.set('/test/file.ts', 'fh1', 'ch1', [makeViolation('/test/file.ts')])

    const cacheV2 = createCache({ version: 'v2' })
    const result = await cacheV2.get('/test/file.ts', 'fh1', 'ch1')
    expect(result).toBeNull()
  })

  it('returns entry when version matches', async () => {
    const cache = createCache({ version: 'v1' })
    await cache.set('/test/file.ts', 'fh1', 'ch1', [makeViolation('/test/file.ts')])

    const result = await cache.get('/test/file.ts', 'fh1', 'ch1')
    expect(result).not.toBeNull()
  })
})

// ─── get - TTL expiration ─────────────────────────────

describe('ResultCache get - TTL expiration', () => {
  beforeEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
  })

  afterEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
  })

  it('returns null for expired entries', async () => {
    const cache = createCache({ ttl: 1 })
    await cache.set('/test/file.ts', 'fh1', 'ch1', [makeViolation('/test/file.ts')])

    await new Promise((r) => setTimeout(r, 50))

    const result = await cache.get('/test/file.ts', 'fh1', 'ch1')
    expect(result).toBeNull()
  })

  it('returns entry when TTL has not expired', async () => {
    const cache = createCache({ ttl: 60_000 })
    await cache.set('/test/file.ts', 'fh1', 'ch1', [makeViolation('/test/file.ts')])

    const result = await cache.get('/test/file.ts', 'fh1', 'ch1')
    expect(result).not.toBeNull()
  })
})

// ─── get - disabled cache ─────────────────────────────

describe('ResultCache get - disabled', () => {
  beforeEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
  })

  it('returns null when disabled', async () => {
    const cache = createCache({ enabled: false })
    const result = await cache.get('/test/file.ts', 'fh1', 'ch1')
    expect(result).toBeNull()
  })

  it('increments misses when disabled', async () => {
    const cache = createCache({ enabled: false })
    await cache.get('/test/file.ts', 'fh1', 'ch1')
    const stats = await cache.getStats()
    expect(stats.misses).toBe(1)
  })
})

// ─── has ──────────────────────────────────────────────

describe('ResultCache has', () => {
  let cache: ResultCache

  beforeEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
    cache = createCache()
  })

  afterEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
  })

  it('returns false when entry does not exist', async () => {
    expect(await cache.has('/test/file.ts', 'fh1', 'ch1')).toBe(false)
  })

  it('returns true for valid cached entry', async () => {
    await cache.set('/test/file.ts', 'fh1', 'ch1', [makeViolation('/test/file.ts')])
    expect(await cache.has('/test/file.ts', 'fh1', 'ch1')).toBe(true)
  })

  it('returns false when disabled', async () => {
    cache.setEnabled(false)
    expect(await cache.has('/test/file.ts', 'fh1', 'ch1')).toBe(false)
  })

  it('returns false for version mismatch', async () => {
    const cacheV1 = createCache({ version: 'v1' })
    await cacheV1.set('/test/file.ts', 'fh1', 'ch1', [makeViolation('/test/file.ts')])

    const cacheV2 = createCache({ version: 'v2' })
    expect(await cacheV2.has('/test/file.ts', 'fh1', 'ch1')).toBe(false)
  })

  it('returns false for expired entries', async () => {
    const shortCache = createCache({ ttl: 1 })
    await shortCache.set('/test/file.ts', 'fh1', 'ch1', [makeViolation('/test/file.ts')])

    await new Promise((r) => setTimeout(r, 50))

    expect(await shortCache.has('/test/file.ts', 'fh1', 'ch1')).toBe(false)
  })

  it('returns false for wrong file hash', async () => {
    await cache.set('/test/file.ts', 'fh1', 'ch1', [makeViolation('/test/file.ts')])
    expect(await cache.has('/test/file.ts', 'fh2', 'ch1')).toBe(false)
  })

  it('returns false for wrong config hash', async () => {
    await cache.set('/test/file.ts', 'fh1', 'ch1', [makeViolation('/test/file.ts')])
    expect(await cache.has('/test/file.ts', 'fh1', 'ch2')).toBe(false)
  })
})

// ─── clear ────────────────────────────────────────────

describe('ResultCache clear', () => {
  let cache: ResultCache

  beforeEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
    cache = createCache()
  })

  afterEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
  })

  it('clears all cache entries', async () => {
    await cache.set('/test/file.ts', 'fh1', 'ch1', [makeViolation('/test/file.ts')])
    await cache.clear()

    const result = await cache.get('/test/file.ts', 'fh1', 'ch1')
    expect(result).toBeNull()
  })

  it('resets hit and miss counters', async () => {
    await cache.set('/test/file.ts', 'fh1', 'ch1', [makeViolation('/test/file.ts')])
    await cache.get('/test/file.ts', 'fh1', 'ch1')
    await cache.get('/test/file.ts', 'fh2', 'ch1')

    await cache.clear()

    const stats = await cache.getStats()
    expect(stats.hits).toBe(0)
    expect(stats.misses).toBe(0)
  })

  it('clears empty cache without error', async () => {
    await expect(cache.clear()).resolves.toBeUndefined()
  })

  it('allows reuse after clear', async () => {
    await cache.set('/test/file.ts', 'fh1', 'ch1', [makeViolation('/test/file.ts')])
    await cache.clear()

    await cache.set('/test/file2.ts', 'fh2', 'ch1', [makeViolation('/test/file2.ts')])
    const result = await cache.get('/test/file2.ts', 'fh2', 'ch1')
    expect(result).not.toBeNull()
  })
})

// ─── getStats ─────────────────────────────────────────

describe('ResultCache getStats', () => {
  let cache: ResultCache

  beforeEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
    cache = createCache()
  })

  afterEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
  })

  it('returns initial stats with zero values', async () => {
    const stats = await cache.getStats()
    expect(stats.entries).toBe(0)
    expect(stats.hits).toBe(0)
    expect(stats.misses).toBe(0)
    expect(stats.hitRate).toBe(0)
    expect(stats.size).toBe(0)
  })

  it('tracks hits correctly', async () => {
    await cache.set('/test/file.ts', 'fh1', 'ch1', [makeViolation('/test/file.ts')])
    await cache.get('/test/file.ts', 'fh1', 'ch1')

    const stats = await cache.getStats()
    expect(stats.hits).toBe(1)
  })

  it('tracks misses correctly', async () => {
    await cache.get('/test/file.ts', 'nonexistent', 'ch1')

    const stats = await cache.getStats()
    expect(stats.misses).toBe(1)
  })

  it('calculates hit rate correctly', async () => {
    await cache.set('/test/file.ts', 'fh1', 'ch1', [makeViolation('/test/file.ts')])

    await cache.get('/test/file.ts', 'fh1', 'ch1')
    await cache.get('/test/file.ts', 'fh2', 'ch1')

    const stats = await cache.getStats()
    expect(stats.hitRate).toBe(0.5)
  })

  it('calculates 100% hit rate with only hits', async () => {
    await cache.set('/test/file.ts', 'fh1', 'ch1', [makeViolation('/test/file.ts')])

    await cache.get('/test/file.ts', 'fh1', 'ch1')
    await cache.get('/test/file.ts', 'fh1', 'ch1')

    const stats = await cache.getStats()
    expect(stats.hitRate).toBe(1)
  })

  it('tracks entries count', async () => {
    await cache.set('/test/file.ts', 'fh1', 'ch1', [makeViolation('/test/file.ts')])

    const stats = await cache.getStats()
    expect(stats.entries).toBe(1)
  })

  it('tracks size in bytes', async () => {
    await cache.set('/test/file.ts', 'fh1', 'ch1', [makeViolation('/test/file.ts')])

    const stats = await cache.getStats()
    expect(stats.size).toBeGreaterThan(0)
  })
})

// ─── hashConfig ───────────────────────────────────────

describe('ResultCache hashConfig', () => {
  let cache: ResultCache

  beforeEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
    cache = createCache()
  })

  afterEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
  })

  it('generates consistent hash for same rules', () => {
    const hash1 = cache.hashConfig(['no-any', 'prefer-const'])
    const hash2 = cache.hashConfig(['no-any', 'prefer-const'])
    expect(hash1).toBe(hash2)
  })

  it('generates different hash for different rules', () => {
    const hash1 = cache.hashConfig(['no-any'])
    const hash2 = cache.hashConfig(['prefer-const'])
    expect(hash1).not.toBe(hash2)
  })

  it('is order-independent (sorts rules)', () => {
    const hash1 = cache.hashConfig(['no-any', 'prefer-const'])
    const hash2 = cache.hashConfig(['prefer-const', 'no-any'])
    expect(hash1).toBe(hash2)
  })

  it('generates different hash with ruleConfig', () => {
    const hash1 = cache.hashConfig(['no-any'])
    const hash2 = cache.hashConfig(['no-any'], { 'no-any': { strict: true } })
    expect(hash1).not.toBe(hash2)
  })

  it('generates consistent hash with same ruleConfig', () => {
    const config = { 'no-any': { strict: true } }
    const hash1 = cache.hashConfig(['no-any'], config)
    const hash2 = cache.hashConfig(['no-any'], config)
    expect(hash1).toBe(hash2)
  })

  it('handles empty rules array', () => {
    const hash = cache.hashConfig([])
    expect(typeof hash).toBe('string')
    expect(hash.length).toBeGreaterThan(0)
  })

  it('returns a SHA-256 length hex string', () => {
    const hash = cache.hashConfig(['test-rule'])
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('generates different hash for empty vs non-empty ruleConfig', () => {
    const hash1 = cache.hashConfig(['rule-a'], {})
    const hash2 = cache.hashConfig(['rule-a'], { 'rule-a': { severity: 'error' } })
    expect(hash1).not.toBe(hash2)
  })
})

// ─── cleanup ──────────────────────────────────────────

describe('ResultCache cleanup', () => {
  let cache: ResultCache

  beforeEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
    cache = createCache({ ttl: 1 })
  })

  afterEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
  })

  it('removes expired entries', async () => {
    await cache.set('/test/file.ts', 'fh1', 'ch1', [makeViolation('/test/file.ts')])

    await new Promise((r) => setTimeout(r, 50))

    const cleaned = await cache.cleanup()
    expect(cleaned).toBe(1)
  })

  it('returns 0 when no entries to clean', async () => {
    const cleaned = await cache.cleanup()
    expect(cleaned).toBe(0)
  })

  it('returns 0 when no entries are expired', async () => {
    const longCache = createCache({ ttl: 60_000 })
    await longCache.set('/test/file.ts', 'fh1', 'ch1', [makeViolation('/test/file.ts')])

    const cleaned = await longCache.cleanup()
    expect(cleaned).toBe(0)
  })

  it('handles invalid cache files gracefully', async () => {
    await mkdir(TEST_CACHE_DIR, { recursive: true })
    await writeFile(path.join(TEST_CACHE_DIR, 'invalid.json'), 'not valid json')

    const cleaned = await cache.cleanup()
    expect(cleaned).toBe(1)
  })

  it('handles empty cache directory', async () => {
    await mkdir(TEST_CACHE_DIR, { recursive: true })
    const cleaned = await cache.cleanup()
    expect(cleaned).toBe(0)
  })

  it('handles nonexistent cache directory', async () => {
    const noDirCache = createCache({
      cacheDir: path.join(TEST_CACHE_DIR, 'nonexistent'),
      ttl: 1,
    })
    const cleaned = await noDirCache.cleanup()
    expect(cleaned).toBe(0)
  })

  it('only removes expired entries, keeps valid ones', async () => {
    await mkdir(TEST_CACHE_DIR, { recursive: true })

    // Write an expired entry manually
    const expiredEntry = {
      configHash: 'ch1',
      fileHash: 'fh1',
      filePath: '/test/expired.ts',
      timestamp: Date.now() - 100_000,
      version: 'test-1.0.0',
      violations: [],
    }
    await writeFile(
      path.join(TEST_CACHE_DIR, 'expired.json'),
      JSON.stringify(expiredEntry),
    )

    const cleaned = await cache.cleanup()
    expect(cleaned).toBe(1)
  })
})

// ─── invalidateFile ───────────────────────────────────

describe('ResultCache invalidateFile', () => {
  let cache: ResultCache

  beforeEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
    cache = createCache()
  })

  afterEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
  })

  it('removes entries for a specific file', async () => {
    await cache.set('/test/file.ts', 'fh1', 'ch1', [makeViolation('/test/file.ts')])
    await cache.set('/test/other.ts', 'fh2', 'ch1', [makeViolation('/test/other.ts')])

    const deleted = await cache.invalidateFile('/test/file.ts')
    expect(deleted).toBe(1)

    // Verify the other file is still cached
    expect(await cache.has('/test/other.ts', 'fh2', 'ch1')).toBe(true)
  })

  it('returns 0 when no entries match', async () => {
    await cache.set('/test/file.ts', 'fh1', 'ch1', [makeViolation('/test/file.ts')])
    const deleted = await cache.invalidateFile('/test/nonexistent.ts')
    expect(deleted).toBe(0)
  })

  it('returns 0 when cache directory is empty', async () => {
    await mkdir(TEST_CACHE_DIR, { recursive: true })
    const deleted = await cache.invalidateFile('/test/file.ts')
    expect(deleted).toBe(0)
  })

  it('handles multiple entries for same file', async () => {
    await cache.set('/test/file.ts', 'fh1', 'ch1', [makeViolation('/test/file.ts')])
    await cache.set('/test/file.ts', 'fh2', 'ch1', [makeViolation('/test/file.ts')])

    const deleted = await cache.invalidateFile('/test/file.ts')
    expect(deleted).toBe(2)
  })

  it('handles invalid cache files gracefully', async () => {
    await mkdir(TEST_CACHE_DIR, { recursive: true })
    await writeFile(path.join(TEST_CACHE_DIR, 'bad.json'), 'invalid')

    const deleted = await cache.invalidateFile('/test/file.ts')
    expect(deleted).toBe(0)
  })
})

// ─── invalidateFiles ──────────────────────────────────

describe('ResultCache invalidateFiles', () => {
  let cache: ResultCache

  beforeEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
    cache = createCache()
  })

  afterEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
  })

  it('removes entries for multiple files', async () => {
    await cache.set('/test/a.ts', 'fh1', 'ch1', [makeViolation('/test/a.ts')])
    await cache.set('/test/b.ts', 'fh2', 'ch1', [makeViolation('/test/b.ts')])
    await cache.set('/test/c.ts', 'fh3', 'ch1', [makeViolation('/test/c.ts')])

    const deleted = await cache.invalidateFiles(['/test/a.ts', '/test/b.ts'])
    expect(deleted).toBe(2)
  })

  it('returns 0 for empty array', async () => {
    const deleted = await cache.invalidateFiles([])
    expect(deleted).toBe(0)
  })

  it('returns 0 when disabled', async () => {
    cache.setEnabled(false)
    const deleted = await cache.invalidateFiles(['/test/file.ts'])
    expect(deleted).toBe(0)
  })

  it('handles nonexistent files gracefully', async () => {
    await cache.set('/test/a.ts', 'fh1', 'ch1', [makeViolation('/test/a.ts')])
    const deleted = await cache.invalidateFiles(['/test/nonexistent.ts'])
    expect(deleted).toBe(0)
  })

  it('removes all matching entries', async () => {
    await cache.set('/test/a.ts', 'fh1', 'ch1', [makeViolation('/test/a.ts')])
    await cache.set('/test/a.ts', 'fh2', 'ch1', [makeViolation('/test/a.ts')])
    await cache.set('/test/b.ts', 'fh3', 'ch1', [makeViolation('/test/b.ts')])

    const deleted = await cache.invalidateFiles(['/test/a.ts'])
    expect(deleted).toBe(2)
    expect(await cache.has('/test/b.ts', 'fh3', 'ch1')).toBe(true)
  })
})

// ─── invalidatePattern ────────────────────────────────

describe('ResultCache invalidatePattern', () => {
  let cache: ResultCache

  beforeEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
    cache = createCache()
  })

  afterEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
  })

  it('removes entries matching a prefix pattern', async () => {
    await cache.set('/src/utils/a.ts', 'fh1', 'ch1', [makeViolation('/src/utils/a.ts')])
    await cache.set('/src/utils/b.ts', 'fh2', 'ch1', [makeViolation('/src/utils/b.ts')])
    await cache.set('/src/core/c.ts', 'fh3', 'ch1', [makeViolation('/src/core/c.ts')])

    const deleted = await cache.invalidatePattern('/src/utils/*')
    expect(deleted).toBe(2)
  })

  it('returns 0 when no entries match', async () => {
    await cache.set('/src/a.ts', 'fh1', 'ch1', [makeViolation('/src/a.ts')])
    const deleted = await cache.invalidatePattern('/test/*')
    expect(deleted).toBe(0)
  })

  it('returns 0 when disabled', async () => {
    cache.setEnabled(false)
    const deleted = await cache.invalidatePattern('/src/*')
    expect(deleted).toBe(0)
  })

  it('handles invalid cache files during pattern scan', async () => {
    await mkdir(TEST_CACHE_DIR, { recursive: true })
    await writeFile(path.join(TEST_CACHE_DIR, 'bad.json'), 'invalid')
    await cache.set('/src/a.ts', 'fh1', 'ch1', [makeViolation('/src/a.ts')])

    const deleted = await cache.invalidatePattern('/src/*')
    expect(deleted).toBe(1)
  })
})

// ─── createDefaultResultCache ─────────────────────────

describe('createDefaultResultCache', () => {
  it('creates a ResultCache instance', () => {
    const cache = createDefaultResultCache()
    expect(cache).toBeInstanceOf(ResultCache)
  })

  it('passes version to the cache', () => {
    const cache = createDefaultResultCache('2.0.0')
    expect(cache).toBeInstanceOf(ResultCache)
    expect(cache.isEnabled()).toBe(true)
  })
})

// ─── Edge cases ───────────────────────────────────────

describe('ResultCache edge cases', () => {
  let cache: ResultCache

  beforeEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
    cache = createCache()
  })

  afterEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
  })

  it('handles empty file path', async () => {
    await cache.set('', 'fh1', 'ch1', [makeViolation('')])
    const result = await cache.get('', 'fh1', 'ch1')
    expect(result).not.toBeNull()
  })

  it('handles empty hashes', async () => {
    await cache.set('/test/file.ts', '', '', [])
    const result = await cache.get('/test/file.ts', '', '')
    expect(result).not.toBeNull()
    expect(result!).toHaveLength(0)
  })

  it('handles unicode in file paths', async () => {
    const filePath = '/test/日本語/ファイル.ts'
    await cache.set(filePath, 'fh1', 'ch1', [makeViolation(filePath)])

    const result = await cache.get(filePath, 'fh1', 'ch1')
    expect(result).not.toBeNull()
  })

  it('handles large violation arrays', async () => {
    const violations = Array.from({ length: 100 }, (_, i) =>
      makeViolation('/test/file.ts', `rule-${i}`),
    )
    await cache.set('/test/file.ts', 'fh1', 'ch1', violations)

    const result = await cache.get('/test/file.ts', 'fh1', 'ch1')
    expect(result).toHaveLength(100)
  })

  it('handles violation with all severity levels', async () => {
    const violations: RuleViolation[] = [
      { filePath: '/test/file.ts', message: 'err', range: { end: { column: 1, line: 1 }, start: { column: 0, line: 1 } }, ruleId: 'r1', severity: 'error' },
      { filePath: '/test/file.ts', message: 'warn', range: { end: { column: 1, line: 1 }, start: { column: 0, line: 1 } }, ruleId: 'r2', severity: 'warning' },
      { filePath: '/test/file.ts', message: 'info', range: { end: { column: 1, line: 1 }, start: { column: 0, line: 1 } }, ruleId: 'r3', severity: 'info' },
    ]
    await cache.set('/test/file.ts', 'fh1', 'ch1', violations)

    const result = await cache.get('/test/file.ts', 'fh1', 'ch1')
    expect(result).toHaveLength(3)
    expect(result![0]!.severity).toBe('error')
    expect(result![1]!.severity).toBe('warning')
    expect(result![2]!.severity).toBe('info')
  })

  it('set is no-op when cache is disabled', async () => {
    cache.setEnabled(false)
    await cache.set('/test/file.ts', 'fh1', 'ch1', [makeViolation('/test/file.ts')])
  })

  it('tracks multiple misses', async () => {
    await cache.get('/a.ts', 'h1', 'c1')
    await cache.get('/b.ts', 'h2', 'c2')
    await cache.get('/c.ts', 'h3', 'c3')

    const stats = await cache.getStats()
    expect(stats.misses).toBe(3)
    expect(stats.hitRate).toBe(0)
  })

  it('handles special characters in hashes', async () => {
    const specialHash = 'abc/def:ghi+jkl=mno'
    await cache.set('/test/file.ts', specialHash, specialHash, [makeViolation('/test/file.ts')])

    const result = await cache.get('/test/file.ts', specialHash, specialHash)
    expect(result).not.toBeNull()
  })
})

// ─── Persistence ──────────────────────────────────────

describe('ResultCache persistence', () => {
  beforeEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
  })

  afterEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
  })

  it('persists data across cache instances', async () => {
    const cache1 = createCache()
    const violations = [makeViolation('/test/file.ts', 'persist-rule')]
    await cache1.set('/test/file.ts', 'fh1', 'ch1', violations)

    const cache2 = createCache()
    const result = await cache2.get('/test/file.ts', 'fh1', 'ch1')
    expect(result).not.toBeNull()
    expect(result![0]!.ruleId).toBe('persist-rule')
  })

  it('stores data as JSON files on disk', async () => {
    const cache = createCache()
    await cache.set('/test/file.ts', 'fh1', 'ch1', [makeViolation('/test/file.ts')])

    const files = await readdir(TEST_CACHE_DIR)
    expect(files.length).toBe(1)

    const content = await readFile(path.join(TEST_CACHE_DIR, files[0]!), 'utf8')
    const parsed = JSON.parse(content)
    expect(parsed.value.filePath).toBe('/test/file.ts')
    expect(parsed.value.violations).toHaveLength(1)
  })
})

// ─── Concurrent operations ────────────────────────────

describe('ResultCache concurrent operations', () => {
  let cache: ResultCache

  beforeEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
    cache = createCache()
  })

  afterEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
  })

  it('handles multiple concurrent sets', async () => {
    const operations = Array.from({ length: 10 }, (_, i) =>
      cache.set(`/test/file${i}.ts`, `fh${i}`, 'ch1', [makeViolation(`/test/file${i}.ts`)]),
    )

    await Promise.all(operations)

    const results = await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        cache.get(`/test/file${i}.ts`, `fh${i}`, 'ch1'),
      ),
    )

    for (const result of results) {
      expect(result).not.toBeNull()
    }
  })

  it('handles concurrent reads of same entry', async () => {
    await cache.set('/test/file.ts', 'fh1', 'ch1', [makeViolation('/test/file.ts')])

    const results = await Promise.all(
      Array.from({ length: 5 }, () => cache.get('/test/file.ts', 'fh1', 'ch1')),
    )

    for (const r of results) {
      expect(r).not.toBeNull()
    }
  })
})

// ─── hashConfig integration ───────────────────────────

describe('ResultCache hashConfig integration', () => {
  let cache: ResultCache

  beforeEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
    cache = createCache()
  })

  afterEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
  })

  it('uses hashConfig to generate configHash for set/get', async () => {
    const configHash = cache.hashConfig(['no-any', 'prefer-const'])
    const fileHash = hashContent('const x: any = 1')

    await cache.set('/test/file.ts', fileHash, configHash, [makeViolation('/test/file.ts')])

    const result = await cache.get('/test/file.ts', fileHash, configHash)
    expect(result).not.toBeNull()
  })

  it('cache miss when config changes', async () => {
    const configHash1 = cache.hashConfig(['no-any'])
    const configHash2 = cache.hashConfig(['no-any', 'prefer-const'])
    const fileHash = hashContent('const x = 1')

    await cache.set('/test/file.ts', fileHash, configHash1, [makeViolation('/test/file.ts')])

    const result = await cache.get('/test/file.ts', fileHash, configHash2)
    expect(result).toBeNull()
  })
})
