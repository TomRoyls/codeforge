import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import type { RuleViolation } from '../../src/ast/visitor.js'

import { createDefaultResultCache, ResultCache } from '../../src/cache/result-cache.js'

import { hashContent } from '../../src/cache/index.js'

// ─── Helpers ───

function makeViolation(filePath = '/src/file.ts', ruleId = 'test-rule'): RuleViolation {
  return {
    filePath,
    message: `Violation from ${ruleId}`,
    range: { end: { column: 10, line: 1 }, start: { column: 0, line: 1 } },
    ruleId,
    severity: 'error',
  }
}

let tmpDir: string

beforeEach(async () => {
  tmpDir = await mkdtemp(path.join(tmpdir(), 'result-cache-test-'))
})

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true })
})

// ─── Constructor ───

describe('ResultCache constructor', () => {
  it('uses defaults when no options provided', () => {
    const cache = new ResultCache()
    expect(cache.isEnabled()).toBe(true)
  })

  it('accepts custom options', () => {
    const cache = new ResultCache({
      cacheDir: tmpDir,
      enabled: false,
      ttl: 1000,
      version: '2.0.0',
    })
    expect(cache.isEnabled()).toBe(false)
  })

  it('can be created disabled', () => {
    const cache = new ResultCache({ enabled: false })
    expect(cache.isEnabled()).toBe(false)
  })
})

// ─── isEnabled / setEnabled ───

describe('ResultCache isEnabled / setEnabled', () => {
  it('toggles enabled state', () => {
    const cache = new ResultCache({ cacheDir: tmpDir })
    expect(cache.isEnabled()).toBe(true)
    cache.setEnabled(false)
    expect(cache.isEnabled()).toBe(false)
    cache.setEnabled(true)
    expect(cache.isEnabled()).toBe(true)
  })
})

// ─── set / get ───

describe('ResultCache set / get', () => {
  it('stores and retrieves violations', async () => {
    const cache = new ResultCache({ cacheDir: tmpDir })
    const violations = [makeViolation(), makeViolation('/src/file.ts', 'other-rule')]
    const fileHash = hashContent('file content')
    const configHash = hashContent('config')

    await cache.set('/src/file.ts', fileHash, configHash, violations)
    const result = await cache.get('/src/file.ts', fileHash, configHash)

    expect(result).toEqual(violations)
  })

  it('returns null when disabled', async () => {
    const cache = new ResultCache({ cacheDir: tmpDir, enabled: false })
    const fileHash = hashContent('content')
    const configHash = hashContent('config')

    await cache.set('/src/file.ts', fileHash, configHash, [makeViolation()])
    const result = await cache.get('/src/file.ts', fileHash, configHash)

    expect(result).toBeNull()
  })

  it('returns null on version mismatch', async () => {
    const cacheV1 = new ResultCache({ cacheDir: tmpDir, version: '1.0.0' })
    const cacheV2 = new ResultCache({ cacheDir: tmpDir, version: '2.0.0' })
    const fileHash = hashContent('content')
    const configHash = hashContent('config')

    await cacheV1.set('/src/file.ts', fileHash, configHash, [makeViolation()])
    const result = await cacheV2.get('/src/file.ts', fileHash, configHash)

    expect(result).toBeNull()
  })

  it('returns null on fileHash mismatch', async () => {
    const cache = new ResultCache({ cacheDir: tmpDir })
    const fileHash1 = hashContent('content v1')
    const fileHash2 = hashContent('content v2')
    const configHash = hashContent('config')

    await cache.set('/src/file.ts', fileHash1, configHash, [makeViolation()])
    const result = await cache.get('/src/file.ts', fileHash2, configHash)

    expect(result).toBeNull()
  })

  it('returns null on configHash mismatch', async () => {
    const cache = new ResultCache({ cacheDir: tmpDir })
    const fileHash = hashContent('content')
    const configHash1 = hashContent('config v1')
    const configHash2 = hashContent('config v2')

    await cache.set('/src/file.ts', fileHash, configHash1, [makeViolation()])
    const result = await cache.get('/src/file.ts', fileHash, configHash2)

    expect(result).toBeNull()
  })

  it('returns null when TTL has expired', async () => {
    const cache = new ResultCache({ cacheDir: tmpDir, ttl: 1 })
    const fileHash = hashContent('content')
    const configHash = hashContent('config')

    await cache.set('/src/file.ts', fileHash, configHash, [makeViolation()])

    // Wait for TTL to expire
    await new Promise((resolve) => setTimeout(resolve, 50))

    const result = await cache.get('/src/file.ts', fileHash, configHash)
    expect(result).toBeNull()
  })
})

// ─── has ───

describe('ResultCache has', () => {
  it('returns true for valid cached entry', async () => {
    const cache = new ResultCache({ cacheDir: tmpDir })
    const fileHash = hashContent('content')
    const configHash = hashContent('config')

    await cache.set('/src/file.ts', fileHash, configHash, [makeViolation()])
    expect(await cache.has('/src/file.ts', fileHash, configHash)).toBe(true)
  })

  it('returns false when disabled', async () => {
    const cache = new ResultCache({ cacheDir: tmpDir, enabled: false })
    expect(await cache.has('/src/file.ts', 'hash', 'config')).toBe(false)
  })

  it('returns false for missing entry', async () => {
    const cache = new ResultCache({ cacheDir: tmpDir })
    expect(await cache.has('/src/missing.ts', 'hash', 'config')).toBe(false)
  })

  it('returns false when expired', async () => {
    const cache = new ResultCache({ cacheDir: tmpDir, ttl: 1 })
    const fileHash = hashContent('content')
    const configHash = hashContent('config')

    await cache.set('/src/file.ts', fileHash, configHash, [makeViolation()])
    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(await cache.has('/src/file.ts', fileHash, configHash)).toBe(false)
  })
})

// ─── clear ───

describe('ResultCache clear', () => {
  it('clears entries and resets stats', async () => {
    const cache = new ResultCache({ cacheDir: tmpDir })
    const fileHash = hashContent('content')
    const configHash = hashContent('config')

    await cache.set('/src/file.ts', fileHash, configHash, [makeViolation()])
    await cache.get('/src/file.ts', fileHash, configHash)

    await cache.clear()

    const stats = await cache.getStats()
    expect(stats.hits).toBe(0)
    expect(stats.misses).toBe(0)
    expect(stats.entries).toBe(0)

    const result = await cache.get('/src/file.ts', fileHash, configHash)
    expect(result).toBeNull()
  })
})

// ─── getStats ───

describe('ResultCache getStats', () => {
  it('tracks hits and misses', async () => {
    const cache = new ResultCache({ cacheDir: tmpDir })
    const fileHash = hashContent('content')
    const configHash = hashContent('config')

    // Miss
    await cache.get('/src/file.ts', fileHash, configHash)
    let stats = await cache.getStats()
    expect(stats.misses).toBe(1)
    expect(stats.hits).toBe(0)
    expect(stats.hitRate).toBe(0)

    // Set and hit
    await cache.set('/src/file.ts', fileHash, configHash, [makeViolation()])
    await cache.get('/src/file.ts', fileHash, configHash)
    stats = await cache.getStats()
    expect(stats.hits).toBe(1)
    expect(stats.misses).toBe(1)
    expect(stats.hitRate).toBe(0.5)
  })
})

// ─── hashConfig ───

describe('ResultCache hashConfig', () => {
  it('produces deterministic hash', () => {
    const cache = new ResultCache({ cacheDir: tmpDir })
    const hash1 = cache.hashConfig(['rule-a', 'rule-b'])
    const hash2 = cache.hashConfig(['rule-a', 'rule-b'])
    expect(hash1).toBe(hash2)
  })

  it('sorts rules before hashing', () => {
    const cache = new ResultCache({ cacheDir: tmpDir })
    const hash1 = cache.hashConfig(['rule-b', 'rule-a'])
    const hash2 = cache.hashConfig(['rule-a', 'rule-b'])
    expect(hash1).toBe(hash2)
  })

  it('includes ruleConfig in hash', () => {
    const cache = new ResultCache({ cacheDir: tmpDir })
    const hash1 = cache.hashConfig(['rule-a'], { 'rule-a': { strict: true } })
    const hash2 = cache.hashConfig(['rule-a'], { 'rule-a': { strict: false } })
    expect(hash1).not.toBe(hash2)
  })
})

// ─── invalidateFile ───

describe('ResultCache invalidateFile', () => {
  it('removes entries for a specific file path', async () => {
    const cache = new ResultCache({ cacheDir: tmpDir })
    const fileHash = hashContent('content')
    const configHash = hashContent('config')

    await cache.set('/src/a.ts', fileHash, configHash, [makeViolation('/src/a.ts')])
    await cache.set('/src/b.ts', fileHash, configHash, [makeViolation('/src/b.ts')])

    const deleted = await cache.invalidateFile('/src/a.ts')
    expect(deleted).toBe(1)

    expect(await cache.get('/src/a.ts', fileHash, configHash)).toBeNull()
    expect(await cache.get('/src/b.ts', fileHash, configHash)).toBeDefined()
  })
})

// ─── invalidateFiles ───

describe('ResultCache invalidateFiles', () => {
  it('invalidates multiple files', async () => {
    const cache = new ResultCache({ cacheDir: tmpDir })
    const fileHash = hashContent('content')
    const configHash = hashContent('config')

    await cache.set('/src/a.ts', fileHash, configHash, [makeViolation('/src/a.ts')])
    await cache.set('/src/b.ts', fileHash, configHash, [makeViolation('/src/b.ts')])
    await cache.set('/src/c.ts', fileHash, configHash, [makeViolation('/src/c.ts')])

    const deleted = await cache.invalidateFiles(['/src/a.ts', '/src/b.ts'])
    expect(deleted).toBe(2)

    expect(await cache.get('/src/a.ts', fileHash, configHash)).toBeNull()
    expect(await cache.get('/src/b.ts', fileHash, configHash)).toBeNull()
    expect(await cache.get('/src/c.ts', fileHash, configHash)).toBeDefined()
  })

  it('returns 0 when disabled', async () => {
    const cache = new ResultCache({ cacheDir: tmpDir, enabled: false })
    const deleted = await cache.invalidateFiles(['/src/a.ts'])
    expect(deleted).toBe(0)
  })

  it('returns 0 for empty array', async () => {
    const cache = new ResultCache({ cacheDir: tmpDir })
    const deleted = await cache.invalidateFiles([])
    expect(deleted).toBe(0)
  })
})

// ─── invalidatePattern ───

describe('ResultCache invalidatePattern', () => {
  it('invalidates entries matching a prefix pattern', async () => {
    const cache = new ResultCache({ cacheDir: tmpDir })
    const fileHash = hashContent('content')
    const configHash = hashContent('config')

    await cache.set('/src/utils/a.ts', fileHash, configHash, [makeViolation('/src/utils/a.ts')])
    await cache.set('/src/utils/b.ts', fileHash, configHash, [makeViolation('/src/utils/b.ts')])
    await cache.set('/src/core/c.ts', fileHash, configHash, [makeViolation('/src/core/c.ts')])

    const deleted = await cache.invalidatePattern('/src/utils/*')
    expect(deleted).toBe(2)
  })

  it('returns 0 when disabled', async () => {
    const cache = new ResultCache({ cacheDir: tmpDir, enabled: false })
    const deleted = await cache.invalidatePattern('/src/*')
    expect(deleted).toBe(0)
  })
})

// ─── cleanup ───

describe('ResultCache cleanup', () => {
  it('removes expired entries', async () => {
    const cache = new ResultCache({ cacheDir: tmpDir, ttl: 1 })
    const fileHash = hashContent('content')
    const configHash = hashContent('config')

    await cache.set('/src/old.ts', fileHash, configHash, [makeViolation()])

    // Wait for TTL to expire
    await new Promise((resolve) => setTimeout(resolve, 50))

    const cleaned = await cache.cleanup()
    expect(cleaned).toBeGreaterThanOrEqual(1)
  })
})

// ─── createDefaultResultCache ───

describe('createDefaultResultCache', () => {
  it('creates a ResultCache instance', () => {
    const cache = createDefaultResultCache()
    expect(cache).toBeInstanceOf(ResultCache)
  })

  it('passes version to the cache', () => {
    const cache = createDefaultResultCache('3.0.0')
    expect(cache).toBeInstanceOf(ResultCache)
    expect(cache.isEnabled()).toBe(true)
  })
})
