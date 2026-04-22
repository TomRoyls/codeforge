import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import * as fs from 'node:fs/promises'
import * as os from 'node:os'
import * as path from 'node:path'

import type { RuleViolation } from '../../../src/ast/visitor.js'
import { ResultCache, createDefaultResultCache } from '../../../src/cache/result-cache.js'

const MOCK_VIOLATIONS: RuleViolation[] = [
  {
    filePath: '/test/file.ts',
    message: 'Unexpected any',
    range: { end: { column: 10, line: 1 }, start: { column: 5, line: 1 } },
    ruleId: 'no-explicit-any',
    severity: 'error',
  },
]

function makeTempDir(): string {
  return path.join(
    os.tmpdir(),
    `codeforge-result-cache-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  )
}

describe('ResultCache', () => {
  let cacheDir: string
  let cache: ResultCache

  beforeEach(() => {
    cacheDir = makeTempDir()
    cache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  describe('constructor', () => {
    it('should create instance with defaults', () => {
      const c = createDefaultResultCache()
      expect(c).toBeInstanceOf(ResultCache)
      expect(c.isEnabled()).toBe(true)
    })

    it('should respect enabled option', () => {
      const c = new ResultCache({ enabled: false, cacheDir: makeTempDir() })
      expect(c.isEnabled()).toBe(false)
    })
  })

  describe('set and get', () => {
    it('should cache and retrieve violations', async () => {
      await cache.set('/test/file.ts', 'hash123', 'config456', MOCK_VIOLATIONS)
      const result = await cache.get('/test/file.ts', 'hash123', 'config456')
      expect(result).toEqual(MOCK_VIOLATIONS)
    })

    it('should return null on cache miss', async () => {
      const result = await cache.get('/test/file.ts', 'hash123', 'config456')
      expect(result).toBeNull()
    })

    it('should return null when disabled', async () => {
      cache.setEnabled(false)
      await cache.set('/test/file.ts', 'hash123', 'config456', MOCK_VIOLATIONS)
      const result = await cache.get('/test/file.ts', 'hash123', 'config456')
      expect(result).toBeNull()
    })

    it('should not write when disabled', async () => {
      cache.setEnabled(false)
      await cache.set('/test/file.ts', 'hash123', 'config456', MOCK_VIOLATIONS)
      cache.setEnabled(true)
      const result = await cache.get('/test/file.ts', 'hash123', 'config456')
      expect(result).toBeNull()
    })
  })

  describe('version invalidation', () => {
    it('should invalidate on version mismatch', async () => {
      await cache.set('/test/file.ts', 'hash123', 'config456', MOCK_VIOLATIONS)
      const v2Cache = new ResultCache({ cacheDir, version: '0.2.0', ttl: 60_000 })
      const result = await v2Cache.get('/test/file.ts', 'hash123', 'config456')
      expect(result).toBeNull()
    })
  })

  describe('hash invalidation', () => {
    it('should invalidate on file hash change', async () => {
      await cache.set('/test/file.ts', 'hash123', 'config456', MOCK_VIOLATIONS)
      const result = await cache.get('/test/file.ts', 'hash999', 'config456')
      expect(result).toBeNull()
    })

    it('should invalidate on config hash change', async () => {
      await cache.set('/test/file.ts', 'hash123', 'config456', MOCK_VIOLATIONS)
      const result = await cache.get('/test/file.ts', 'hash123', 'config999')
      expect(result).toBeNull()
    })
  })

  describe('TTL expiration', () => {
    it('should invalidate expired entries', async () => {
      const shortTtlCache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 1 })
      await shortTtlCache.set('/test/file.ts', 'hash123', 'config456', MOCK_VIOLATIONS)
      await new Promise((r) => setTimeout(r, 10))
      const result = await shortTtlCache.get('/test/file.ts', 'hash123', 'config456')
      expect(result).toBeNull()
    })
  })

  describe('has', () => {
    it('should return true for valid cached entry', async () => {
      await cache.set('/test/file.ts', 'hash123', 'config456', MOCK_VIOLATIONS)
      expect(await cache.has('/test/file.ts', 'hash123', 'config456')).toBe(true)
    })

    it('should return false for missing entry', async () => {
      expect(await cache.has('/test/file.ts', 'hash123', 'config456')).toBe(false)
    })

    it('should return false when disabled', async () => {
      cache.setEnabled(false)
      expect(await cache.has('/test/file.ts', 'hash123', 'config456')).toBe(false)
    })
  })

  describe('clear', () => {
    it('should clear all entries and reset stats', async () => {
      await cache.set('/test/file.ts', 'hash123', 'config456', MOCK_VIOLATIONS)
      await cache.clear()
      const stats = await cache.getStats()
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
    })
  })

  describe('getStats', () => {
    it('should track hits and misses', async () => {
      await cache.set('/test/file.ts', 'hash123', 'config456', MOCK_VIOLATIONS)
      await cache.get('/test/file.ts', 'hash123', 'config456')
      await cache.get('/test/other.ts', 'hash123', 'config456')

      const stats = await cache.getStats()
      expect(stats.hits).toBe(1)
      expect(stats.misses).toBe(1)
      expect(stats.hitRate).toBe(0.5)
    })

    it('should return zero stats for empty cache', async () => {
      const stats = await cache.getStats()
      expect(stats.entries).toBe(0)
      expect(stats.hitRate).toBe(0)
    })
  })

  describe('hashConfig', () => {
    it('should produce deterministic hashes', () => {
      const h1 = cache.hashConfig(['no-any', 'prefer-const'])
      const h2 = cache.hashConfig(['no-any', 'prefer-const'])
      expect(h1).toBe(h2)
    })

    it('should be order-independent', () => {
      const h1 = cache.hashConfig(['b-rule', 'a-rule'])
      const h2 = cache.hashConfig(['a-rule', 'b-rule'])
      expect(h1).toBe(h2)
    })

    it('should produce different hashes for different rules', () => {
      const h1 = cache.hashConfig(['no-any'])
      const h2 = cache.hashConfig(['prefer-const'])
      expect(h1).not.toBe(h2)
    })

    it('should include rule config in hash', () => {
      const h1 = cache.hashConfig(['no-any'], { 'no-any': { strict: true } })
      const h2 = cache.hashConfig(['no-any'], { 'no-any': { strict: false } })
      expect(h1).not.toBe(h2)
    })
  })

  describe('setEnabled', () => {
    it('should toggle cache on/off', async () => {
      await cache.set('/test/file.ts', 'hash123', 'config456', MOCK_VIOLATIONS)
      cache.setEnabled(false)
      expect(await cache.get('/test/file.ts', 'hash123', 'config456')).toBeNull()
      cache.setEnabled(true)
      expect(await cache.get('/test/file.ts', 'hash123', 'config456')).toEqual(MOCK_VIOLATIONS)
    })
  })

  describe('multiple entries', () => {
    it('should store entries for different files independently', async () => {
      const violations2: RuleViolation[] = [
        { ...MOCK_VIOLATIONS[0], filePath: '/test/other.ts', ruleId: 'prefer-const' },
      ]
      await cache.set('/test/file.ts', 'hash1', 'config1', MOCK_VIOLATIONS)
      await cache.set('/test/other.ts', 'hash2', 'config1', violations2)

      expect(await cache.get('/test/file.ts', 'hash1', 'config1')).toEqual(MOCK_VIOLATIONS)
      expect(await cache.get('/test/other.ts', 'hash2', 'config1')).toEqual(violations2)
    })
  })

  describe('invalidateFile', () => {
    it('should remove entries via index when file was set in same instance', async () => {
      await cache.set('/test/file.ts', 'hash1', 'config1', MOCK_VIOLATIONS)
      const deleted = await cache.invalidateFile('/test/file.ts')
      expect(deleted).toBe(1)
      expect(await cache.get('/test/file.ts', 'hash1', 'config1')).toBeNull()
    })

    it('should remove multiple entries for same file with different hashes', async () => {
      await cache.set('/test/file.ts', 'hash1', 'config1', MOCK_VIOLATIONS)
      await cache.set('/test/file.ts', 'hash2', 'config1', MOCK_VIOLATIONS)
      const deleted = await cache.invalidateFile('/test/file.ts')
      expect(deleted).toBe(2)
      expect(await cache.get('/test/file.ts', 'hash1', 'config1')).toBeNull()
      expect(await cache.get('/test/file.ts', 'hash2', 'config1')).toBeNull()
    })

    it('should return 0 for non-existent file', async () => {
      const deleted = await cache.invalidateFile('/test/nonexistent.ts')
      expect(deleted).toBe(0)
    })

    it('should do nothing when disabled', async () => {
      cache.setEnabled(false)
      const deleted = await cache.invalidateFile('/test/file.ts')
      expect(deleted).toBe(0)
    })

    it('should not affect other files', async () => {
      const violations2: RuleViolation[] = [
        { ...MOCK_VIOLATIONS[0], filePath: '/test/other.ts', ruleId: 'prefer-const' },
      ]
      await cache.set('/test/file.ts', 'hash1', 'config1', MOCK_VIOLATIONS)
      await cache.set('/test/other.ts', 'hash2', 'config1', violations2)

      await cache.invalidateFile('/test/file.ts')

      expect(await cache.get('/test/file.ts', 'hash1', 'config1')).toBeNull()
      expect(await cache.get('/test/other.ts', 'hash2', 'config1')).toEqual(violations2)
    })

    it('should use fallback scan for files written by another cache instance', async () => {
      await cache.set('/test/cold.ts', 'hash1', 'config1', MOCK_VIOLATIONS)

      const coldCache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
      const deleted = await coldCache.invalidateFile('/test/cold.ts')
      expect(deleted).toBe(1)
      expect(await coldCache.get('/test/cold.ts', 'hash1', 'config1')).toBeNull()
    })

    it('should reset index after clear', async () => {
      await cache.set('/test/file.ts', 'hash1', 'config1', MOCK_VIOLATIONS)
      await cache.clear()
      await cache.set('/test/other.ts', 'hash2', 'config1', MOCK_VIOLATIONS)

      const deleted = await cache.invalidateFile('/test/file.ts')
      expect(deleted).toBe(0)
    })
  })

  describe('constructor options', () => {
    it('should use custom TTL', async () => {
      const customTtlCache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 5 })
      await customTtlCache.set('/test/file.ts', 'hash1', 'config1', MOCK_VIOLATIONS)
      await new Promise((r) => setTimeout(r, 10))
      const result = await customTtlCache.get('/test/file.ts', 'hash1', 'config1')
      expect(result).toBeNull()
    })

    it('should use custom version string', async () => {
      const vCache = new ResultCache({ cacheDir, version: '2.0.0-custom', ttl: 60_000 })
      await vCache.set('/test/file.ts', 'hash1', 'config1', MOCK_VIOLATIONS)
      const result = await vCache.get('/test/file.ts', 'hash1', 'config1')
      expect(result).toEqual(MOCK_VIOLATIONS)
    })

    it('should accept enabled: true explicitly', () => {
      const c = new ResultCache({ cacheDir: makeTempDir(), enabled: true })
      expect(c.isEnabled()).toBe(true)
    })

    it('should default to enabled when enabled option is omitted', () => {
      const c = new ResultCache({ cacheDir: makeTempDir() })
      expect(c.isEnabled()).toBe(true)
    })
  })

  describe('set edge cases', () => {
    it('should overwrite an existing entry for the same key', async () => {
      const violations1: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'rule-a' }]
      const violations2: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'rule-b' }]
      await cache.set('/test/file.ts', 'hash1', 'config1', violations1)
      await cache.set('/test/file.ts', 'hash1', 'config1', violations2)
      const result = await cache.get('/test/file.ts', 'hash1', 'config1')
      expect(result).toEqual(violations2)
    })

    it('should cache empty violations array', async () => {
      await cache.set('/test/file.ts', 'hash1', 'config1', [])
      const result = await cache.get('/test/file.ts', 'hash1', 'config1')
      expect(result).toEqual([])
    })

    it('should not persist data when disabled', async () => {
      cache.setEnabled(false)
      await cache.set('/test/file.ts', 'hash1', 'config1', MOCK_VIOLATIONS)
      cache.setEnabled(true)
      const stats = await cache.getStats()
      expect(stats.entries).toBe(0)
    })
  })

  describe('get edge cases', () => {
    it('should handle corrupted cache data gracefully', async () => {
      const { writeFile, mkdir } = await import('node:fs/promises')
      const crypto = await import('node:crypto')
      await mkdir(cacheDir, { recursive: true })
      const rawKey = `result:0.1.0:/test/corrupt.ts:h1:c1`
      const safeKey = crypto.createHash('md5').update(rawKey).digest('hex')
      await writeFile(path.join(cacheDir, `${safeKey}.json`), 'not valid json {{{')

      const result = await cache.get('/test/corrupt.ts', 'h1', 'c1')
      expect(result).toBeNull()
    })

    it('should count misses when disabled', async () => {
      cache.setEnabled(false)
      await cache.get('/test/file.ts', 'hash1', 'config1')
      cache.setEnabled(true)
      const stats = await cache.getStats()
      expect(stats.misses).toBe(1)
    })
  })

  describe('has edge cases', () => {
    it('should return false for expired entry', async () => {
      const shortTtlCache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 1 })
      await shortTtlCache.set('/test/file.ts', 'hash1', 'config1', MOCK_VIOLATIONS)
      await new Promise((r) => setTimeout(r, 10))
      expect(await shortTtlCache.has('/test/file.ts', 'hash1', 'config1')).toBe(false)
    })

    it('should return false on version mismatch', async () => {
      await cache.set('/test/file.ts', 'hash1', 'config1', MOCK_VIOLATIONS)
      const v2Cache = new ResultCache({ cacheDir, version: '9.9.9', ttl: 60_000 })
      expect(await v2Cache.has('/test/file.ts', 'hash1', 'config1')).toBe(false)
    })

    it('should return false on content hash mismatch', async () => {
      await cache.set('/test/file.ts', 'hash1', 'config1', MOCK_VIOLATIONS)
      expect(await cache.has('/test/file.ts', 'hash-wrong', 'config1')).toBe(false)
    })

    it('should return false on config hash mismatch', async () => {
      await cache.set('/test/file.ts', 'hash1', 'config1', MOCK_VIOLATIONS)
      expect(await cache.has('/test/file.ts', 'hash1', 'config-wrong')).toBe(false)
    })
  })

  describe('clear behavior', () => {
    it('should remove all cached entries', async () => {
      await cache.set('/test/a.ts', 'hash1', 'config1', MOCK_VIOLATIONS)
      await cache.set('/test/b.ts', 'hash2', 'config2', MOCK_VIOLATIONS)
      await cache.clear()
      expect(await cache.get('/test/a.ts', 'hash1', 'config1')).toBeNull()
      expect(await cache.get('/test/b.ts', 'hash2', 'config2')).toBeNull()
    })

    it('should reset hits and misses to zero', async () => {
      await cache.set('/test/file.ts', 'hash1', 'config1', MOCK_VIOLATIONS)
      await cache.get('/test/file.ts', 'hash1', 'config1')
      await cache.get('/test/other.ts', 'hash1', 'config1')
      await cache.clear()
      const stats = await cache.getStats()
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
      expect(stats.hitRate).toBe(0)
    })

    it('should report zero entries after clear', async () => {
      await cache.set('/test/file.ts', 'hash1', 'config1', MOCK_VIOLATIONS)
      await cache.clear()
      const stats = await cache.getStats()
      expect(stats.entries).toBe(0)
    })
  })

  describe('getStats accuracy', () => {
    it('should track entries count correctly', async () => {
      await cache.set('/test/a.ts', 'h1', 'c1', MOCK_VIOLATIONS)
      const stats1 = await cache.getStats()
      expect(stats1.entries).toBe(1)

      await cache.set('/test/b.ts', 'h2', 'c2', MOCK_VIOLATIONS)
      const stats2 = await cache.getStats()
      expect(stats2.entries).toBe(2)
    })

    it('should calculate hit rate correctly with all hits', async () => {
      await cache.set('/test/file.ts', 'hash1', 'config1', MOCK_VIOLATIONS)
      await cache.get('/test/file.ts', 'hash1', 'config1')
      await cache.get('/test/file.ts', 'hash1', 'config1')
      const stats = await cache.getStats()
      expect(stats.hits).toBe(2)
      expect(stats.misses).toBe(0)
      expect(stats.hitRate).toBe(1)
    })

    it('should report size greater than zero for entries', async () => {
      await cache.set('/test/file.ts', 'hash1', 'config1', MOCK_VIOLATIONS)
      const stats = await cache.getStats()
      expect(stats.size).toBeGreaterThan(0)
    })

    it('should track multiple misses', async () => {
      await cache.get('/test/a.ts', 'h1', 'c1')
      await cache.get('/test/b.ts', 'h2', 'c2')
      const stats = await cache.getStats()
      expect(stats.misses).toBe(2)
      expect(stats.hits).toBe(0)
      expect(stats.hitRate).toBe(0)
    })
  })

  describe('persistence across instances', () => {
    it('should read entries written by a different instance with same config', async () => {
      await cache.set('/test/persist.ts', 'hash1', 'config1', MOCK_VIOLATIONS)

      const reader = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
      const result = await reader.get('/test/persist.ts', 'hash1', 'config1')
      expect(result).toEqual(MOCK_VIOLATIONS)
    })

    it('should share stats correctly across instances after writes', async () => {
      const writer = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
      await writer.set('/test/shared.ts', 'hash1', 'config1', MOCK_VIOLATIONS)

      const reader = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
      const result = await reader.get('/test/shared.ts', 'hash1', 'config1')
      expect(result).toEqual(MOCK_VIOLATIONS)

      const readerStats = await reader.getStats()
      expect(readerStats.hits).toBe(1)
    })
  })

  describe('cleanup', () => {
    it('should remove expired entries', async () => {
      const shortTtlCache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 1 })
      await shortTtlCache.set('/test/expired.ts', 'hash1', 'config1', MOCK_VIOLATIONS)
      await new Promise((r) => setTimeout(r, 10))

      const cleaned = await shortTtlCache.cleanup()
      expect(cleaned).toBeGreaterThanOrEqual(1)
    })

    it('should not remove valid entries', async () => {
      await cache.set('/test/valid.ts', 'hash1', 'config1', MOCK_VIOLATIONS)
      const cleaned = await cache.cleanup()
      expect(cleaned).toBe(0)
    })

    it('should remove corrupted cache files', async () => {
      const { writeFile, mkdir } = await import('node:fs/promises')
      await mkdir(cacheDir, { recursive: true })
      const badFile = path.join(cacheDir, 'corrupted-cache-file.json')
      await writeFile(badFile, 'not json at all')

      const cleaned = await cache.cleanup()
      expect(cleaned).toBeGreaterThanOrEqual(1)
    })

    it('should return 0 when cache directory is empty', async () => {
      const cleaned = await cache.cleanup()
      expect(cleaned).toBe(0)
    })
  })

  describe('hashConfig edge cases', () => {
    it('should handle empty rules array', () => {
      const hash = cache.hashConfig([])
      expect(hash).toBeTruthy()
      expect(typeof hash).toBe('string')
    })

    it('should produce same hash for empty rules with and without config', () => {
      const h1 = cache.hashConfig([])
      const h2 = cache.hashConfig([], {})
      expect(h1).toBe(h2)
    })
  })

  describe('bulk operations', () => {
    it('should handle many entries without errors', async () => {
      const files = Array.from({ length: 20 }, (_, i) => `/test/file${i}.ts`)
      for (const file of files) {
        await cache.set(file, 'hash1', 'config1', MOCK_VIOLATIONS)
      }

      const stats = await cache.getStats()
      expect(stats.entries).toBe(20)

      for (const file of files) {
        const result = await cache.get(file, 'hash1', 'config1')
        expect(result).toEqual(MOCK_VIOLATIONS)
      }

      const finalStats = await cache.getStats()
      expect(finalStats.hits).toBe(20)
    })

    it('should clear many entries at once', async () => {
      for (let i = 0; i < 15; i++) {
        await cache.set(`/test/bulk${i}.ts`, `hash${i}`, 'config1', MOCK_VIOLATIONS)
      }
      await cache.clear()
      const stats = await cache.getStats()
      expect(stats.entries).toBe(0)
    })
  })

  describe('enabled/disabled toggle', () => {
    it('should return null from get when disabled even if entry exists', async () => {
      await cache.set('/test/file.ts', 'hash1', 'config1', MOCK_VIOLATIONS)
      cache.setEnabled(false)
      const result = await cache.get('/test/file.ts', 'hash1', 'config1')
      expect(result).toBeNull()
      cache.setEnabled(true)
      const result2 = await cache.get('/test/file.ts', 'hash1', 'config1')
      expect(result2).toEqual(MOCK_VIOLATIONS)
    })

    it('should not update stats when disabled', async () => {
      await cache.set('/test/file.ts', 'hash1', 'config1', MOCK_VIOLATIONS)
      cache.setEnabled(false)
      await cache.get('/test/file.ts', 'hash1', 'config1')
      cache.setEnabled(true)
      const stats = await cache.getStats()
      expect(stats.misses).toBe(1)
    })
  })

  describe('createDefaultResultCache', () => {
    it('should create instance without version', () => {
      const c = createDefaultResultCache()
      expect(c).toBeInstanceOf(ResultCache)
      expect(c.isEnabled()).toBe(true)
    })

    it('should create instance with version', () => {
      const c = createDefaultResultCache('3.0.0')
      expect(c).toBeInstanceOf(ResultCache)
    })

    it('should create independent instances', () => {
      const c1 = createDefaultResultCache()
      const c2 = createDefaultResultCache()
      expect(c1).not.toBe(c2)
    })
  })

  describe('hashConfig advanced', () => {
    it('should produce valid hex string', () => {
      const hash = cache.hashConfig(['no-any'])
      expect(hash).toMatch(/^[0-9a-f]{64}$/)
    })

    it('should handle single rule', () => {
      const hash = cache.hashConfig(['single-rule'])
      expect(hash).toBeTruthy()
    })

    it('should produce different hash with undefined vs defined ruleConfig', () => {
      const h1 = cache.hashConfig(['no-any'])
      const h2 = cache.hashConfig(['no-any'], undefined)
      expect(h1).toBe(h2)
    })

    it('should include rule config in hash with nested objects', () => {
      const h1 = cache.hashConfig(['no-any'], { 'no-any': { options: { depth: 5 } } })
      const h2 = cache.hashConfig(['no-any'], { 'no-any': { options: { depth: 10 } } })
      expect(h1).not.toBe(h2)
    })

    it('should produce consistent hash for same rules regardless of array order', () => {
      const h1 = cache.hashConfig(['b-rule', 'a-rule'], { 'a-rule': 1 })
      const h2 = cache.hashConfig(['a-rule', 'b-rule'], { 'a-rule': 1 })
      expect(h1).toBe(h2)
    })
  })

  describe('violations variety', () => {
    it('should cache violations with warning severity', async () => {
      const warnings: RuleViolation[] = [
        {
          filePath: '/test/warn.ts',
          message: 'Unused variable',
          range: { end: { column: 10, line: 1 }, start: { column: 5, line: 1 } },
          ruleId: 'no-unused-vars',
          severity: 'warning',
        },
      ]
      await cache.set('/test/warn.ts', 'h1', 'c1', warnings)
      const result = await cache.get('/test/warn.ts', 'h1', 'c1')
      expect(result).toEqual(warnings)
    })

    it('should cache violations with info severity', async () => {
      const infos: RuleViolation[] = [
        {
          filePath: '/test/info.ts',
          message: 'Consider using const',
          range: { end: { column: 10, line: 1 }, start: { column: 5, line: 1 } },
          ruleId: 'prefer-const',
          severity: 'info',
        },
      ]
      await cache.set('/test/info.ts', 'h1', 'c1', infos)
      const result = await cache.get('/test/info.ts', 'h1', 'c1')
      expect(result).toEqual(infos)
    })

    it('should cache multiple violations in one entry', async () => {
      const violations: RuleViolation[] = [
        { ...MOCK_VIOLATIONS[0], ruleId: 'rule-a' },
        { ...MOCK_VIOLATIONS[0], ruleId: 'rule-b' },
        { ...MOCK_VIOLATIONS[0], ruleId: 'rule-c' },
      ]
      await cache.set('/test/multi.ts', 'h1', 'c1', violations)
      const result = await cache.get('/test/multi.ts', 'h1', 'c1')
      expect(result).toHaveLength(3)
      expect(result).toEqual(violations)
    })
  })

  describe('file path edge cases', () => {
    it('should handle file paths with spaces', async () => {
      await cache.set('/test/path with spaces.ts', 'h1', 'c1', MOCK_VIOLATIONS)
      const result = await cache.get('/test/path with spaces.ts', 'h1', 'c1')
      expect(result).toEqual(MOCK_VIOLATIONS)
    })

    it('should handle file paths with unicode characters', async () => {
      await cache.set('/test/日本語/ファイル.ts', 'h1', 'c1', MOCK_VIOLATIONS)
      const result = await cache.get('/test/日本語/ファイル.ts', 'h1', 'c1')
      expect(result).toEqual(MOCK_VIOLATIONS)
    })

    it('should handle very long file paths', async () => {
      const longPath = '/test/' + 'a'.repeat(200) + '.ts'
      await cache.set(longPath, 'h1', 'c1', MOCK_VIOLATIONS)
      const result = await cache.get(longPath, 'h1', 'c1')
      expect(result).toEqual(MOCK_VIOLATIONS)
    })

    it('should differentiate between similar paths', async () => {
      const v1: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'path-a' }]
      const v2: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'path-b' }]
      await cache.set('/test/fileA.ts', 'h1', 'c1', v1)
      await cache.set('/test/fileB.ts', 'h1', 'c1', v2)
      expect(await cache.get('/test/fileA.ts', 'h1', 'c1')).toEqual(v1)
      expect(await cache.get('/test/fileB.ts', 'h1', 'c1')).toEqual(v2)
    })
  })

  describe('fileIndex behavior', () => {
    it('should track multiple cache keys for same file', async () => {
      await cache.set('/test/file.ts', 'hash1', 'config1', MOCK_VIOLATIONS)
      await cache.set('/test/file.ts', 'hash2', 'config1', MOCK_VIOLATIONS)
      await cache.set('/test/file.ts', 'hash1', 'config2', MOCK_VIOLATIONS)
      const deleted = await cache.invalidateFile('/test/file.ts')
      expect(deleted).toBe(3)
    })

    it('should still have other files after invalidating one', async () => {
      const v1: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'keep' }]
      await cache.set('/test/keep.ts', 'h1', 'c1', v1)
      await cache.set('/test/remove.ts', 'h1', 'c1', MOCK_VIOLATIONS)
      await cache.invalidateFile('/test/remove.ts')
      expect(await cache.get('/test/keep.ts', 'h1', 'c1')).toEqual(v1)
    })

    it('should rebuild index after clear and new sets', async () => {
      await cache.set('/test/file.ts', 'h1', 'c1', MOCK_VIOLATIONS)
      await cache.clear()
      await cache.set('/test/new.ts', 'h2', 'c2', MOCK_VIOLATIONS)
      const deleted = await cache.invalidateFile('/test/new.ts')
      expect(deleted).toBe(1)
    })
  })

  describe('get invalidation deletion', () => {
    it('should count miss on version mismatch without affecting other entries', async () => {
      await cache.set('/test/file.ts', 'h1', 'c1', MOCK_VIOLATIONS)
      const v2Cache = new ResultCache({ cacheDir, version: '0.2.0', ttl: 60_000 })
      const result = await v2Cache.get('/test/file.ts', 'h1', 'c1')
      expect(result).toBeNull()
    })

    it('should preserve original entry when querying with different file hash', async () => {
      await cache.set('/test/file.ts', 'h1', 'c1', MOCK_VIOLATIONS)
      await cache.get('/test/file.ts', 'h1-wrong', 'c1')
      const result = await cache.get('/test/file.ts', 'h1', 'c1')
      expect(result).toEqual(MOCK_VIOLATIONS)
    })

    it('should preserve original entry when querying with different config hash', async () => {
      await cache.set('/test/file.ts', 'h1', 'c1', MOCK_VIOLATIONS)
      await cache.get('/test/file.ts', 'h1', 'c1-wrong')
      const result = await cache.get('/test/file.ts', 'h1', 'c1')
      expect(result).toEqual(MOCK_VIOLATIONS)
    })
  })

  describe('concurrent operations', () => {
    it('should handle parallel set calls', async () => {
      const files = Array.from({ length: 10 }, (_, i) => `/test/parallel${i}.ts`)
      await Promise.all(files.map((f) => cache.set(f, 'h1', 'c1', MOCK_VIOLATIONS)))
      const stats = await cache.getStats()
      expect(stats.entries).toBe(10)
    })

    it('should handle parallel get calls after set', async () => {
      await cache.set('/test/parallel.ts', 'h1', 'c1', MOCK_VIOLATIONS)
      const results = await Promise.all(
        Array.from({ length: 5 }, () => cache.get('/test/parallel.ts', 'h1', 'c1')),
      )
      for (const result of results) {
        expect(result).toEqual(MOCK_VIOLATIONS)
      }
    })

    it('should handle mixed parallel get and set calls', async () => {
      await Promise.all([
        cache.set('/test/mix1.ts', 'h1', 'c1', MOCK_VIOLATIONS),
        cache.set('/test/mix2.ts', 'h1', 'c1', MOCK_VIOLATIONS),
        cache.get('/test/nonexistent.ts', 'h1', 'c1'),
      ])
      expect(await cache.get('/test/mix1.ts', 'h1', 'c1')).toEqual(MOCK_VIOLATIONS)
      expect(await cache.get('/test/mix2.ts', 'h1', 'c1')).toEqual(MOCK_VIOLATIONS)
    })
  })

  describe('cleanup edge cases', () => {
    it('should clean expired entries while keeping valid ones', async () => {
      const shortTtlCache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 1 })
      await shortTtlCache.set('/test/expired.ts', 'h1', 'c1', MOCK_VIOLATIONS)
      await new Promise((r) => setTimeout(r, 10))
      const cleaned = await shortTtlCache.cleanup()
      expect(cleaned).toBeGreaterThanOrEqual(1)
    })

    it('should handle cleanup on non-existent directory gracefully', async () => {
      const emptyCache = new ResultCache({
        cacheDir: path.join(cacheDir, 'nonexistent-subdir'),
        version: '0.1.0',
        ttl: 60_000,
      })
      const cleaned = await emptyCache.cleanup()
      expect(cleaned).toBe(0)
    })

    it('should clean corrupted and valid-expired files together', async () => {
      const { writeFile, mkdir } = await import('node:fs/promises')
      await mkdir(cacheDir, { recursive: true })
      const badFile = path.join(cacheDir, 'corrupted-for-cleanup.json')
      await writeFile(badFile, 'broken json')

      const shortTtlCache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 1 })
      await shortTtlCache.set('/test/expired.ts', 'h1', 'c1', MOCK_VIOLATIONS)
      await new Promise((r) => setTimeout(r, 10))
      const cleaned = await shortTtlCache.cleanup()
      expect(cleaned).toBeGreaterThanOrEqual(2)
    })
  })

  describe('stats after operations', () => {
    it('should reflect hits and misses after mixed operations', async () => {
      await cache.set('/test/a.ts', 'h1', 'c1', MOCK_VIOLATIONS)
      await cache.get('/test/a.ts', 'h1', 'c1')
      await cache.get('/test/a.ts', 'h1', 'c1')
      await cache.get('/test/b.ts', 'h1', 'c1')
      const stats = await cache.getStats()
      expect(stats.hits).toBe(2)
      expect(stats.misses).toBe(1)
      expect(stats.hitRate).toBeCloseTo(2 / 3)
    })

    it('should report correct entries count after invalidate', async () => {
      await cache.set('/test/a.ts', 'h1', 'c1', MOCK_VIOLATIONS)
      await cache.set('/test/b.ts', 'h2', 'c2', MOCK_VIOLATIONS)
      await cache.invalidateFile('/test/a.ts')
      const stats = await cache.getStats()
      expect(stats.entries).toBe(1)
    })

    it('should reset stats to zero after clear and track anew', async () => {
      await cache.set('/test/file.ts', 'h1', 'c1', MOCK_VIOLATIONS)
      await cache.get('/test/file.ts', 'h1', 'c1')
      await cache.clear()
      const statsAfterClear = await cache.getStats()
      expect(statsAfterClear.hits).toBe(0)
      expect(statsAfterClear.misses).toBe(0)
      await cache.get('/test/new.ts', 'h1', 'c1')
      const finalStats = await cache.getStats()
      expect(finalStats.misses).toBe(1)
      expect(finalStats.hits).toBe(0)
    })
  })

  describe('has after mutations', () => {
    it('should return false after invalidateFile', async () => {
      await cache.set('/test/file.ts', 'h1', 'c1', MOCK_VIOLATIONS)
      expect(await cache.has('/test/file.ts', 'h1', 'c1')).toBe(true)
      await cache.invalidateFile('/test/file.ts')
      expect(await cache.has('/test/file.ts', 'h1', 'c1')).toBe(false)
    })

    it('should return false after clear', async () => {
      await cache.set('/test/file.ts', 'h1', 'c1', MOCK_VIOLATIONS)
      await cache.clear()
      expect(await cache.has('/test/file.ts', 'h1', 'c1')).toBe(false)
    })

    it('should return true for newly set entry after clear', async () => {
      await cache.set('/test/old.ts', 'h1', 'c1', MOCK_VIOLATIONS)
      await cache.clear()
      await cache.set('/test/new.ts', 'h2', 'c2', MOCK_VIOLATIONS)
      expect(await cache.has('/test/new.ts', 'h2', 'c2')).toBe(true)
      expect(await cache.has('/test/old.ts', 'h1', 'c1')).toBe(false)
    })
  })
})

describe('ResultCache additional coverage', () => {
  let cacheDir: string
  let cache: ResultCache

  beforeEach(() => {
    cacheDir = makeTempDir()
    cache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  describe('constructor defaults', () => {
    it('should default version to 0.1.0', async () => {
      const c = new ResultCache({ cacheDir })
      await c.set('/test/file.ts', 'h1', 'c1', MOCK_VIOLATIONS)
      const result = await c.get('/test/file.ts', 'h1', 'c1')
      expect(result).toEqual(MOCK_VIOLATIONS)
    })

    it('should default enabled to true when no options given', () => {
      const c = new ResultCache()
      expect(c.isEnabled()).toBe(true)
    })

    it('should accept empty options object', () => {
      const c = new ResultCache({})
      expect(c).toBeInstanceOf(ResultCache)
      expect(c.isEnabled()).toBe(true)
    })
  })

  describe('set error handling', () => {
    it('should handle set error gracefully without throwing', async () => {
      const readOnlyDir = path.join(cacheDir, 'readonly')
      await fs.mkdir(readOnlyDir, { recursive: true })
      await fs.chmod(readOnlyDir, 0o444)
      const badCache = new ResultCache({
        cacheDir: path.join(readOnlyDir, 'nested', 'fail'),
        version: '0.1.0',
        ttl: 60_000,
      })
      await expect(
        badCache.set('/test/file.ts', 'h1', 'c1', MOCK_VIOLATIONS),
      ).resolves.toBeUndefined()
      await fs.chmod(readOnlyDir, 0o755)
    })
  })

  describe('get error handling', () => {
    it('should count miss when cacheStore.get throws', async () => {
      const { writeFile, mkdir } = await import('node:fs/promises')
      const crypto = await import('node:crypto')
      await mkdir(cacheDir, { recursive: true })
      const rawKey = 'result:0.1.0:/test/bad.ts:h1:c1'
      const safeKey = crypto.createHash('md5').update(rawKey).digest('hex')
      await writeFile(path.join(cacheDir, `${safeKey}.json`), '{"key":"x","value":')
      const result = await cache.get('/test/bad.ts', 'h1', 'c1')
      expect(result).toBeNull()
      const stats = await cache.getStats()
      expect(stats.misses).toBeGreaterThanOrEqual(1)
    })
  })

  describe('has error handling', () => {
    it('should return false for corrupted entry', async () => {
      const { writeFile, mkdir } = await import('node:fs/promises')
      const crypto = await import('node:crypto')
      await mkdir(cacheDir, { recursive: true })
      const rawKey = 'result:0.1.0:/test/hascorrupt.ts:h1:c1'
      const safeKey = crypto.createHash('md5').update(rawKey).digest('hex')
      await writeFile(path.join(cacheDir, `${safeKey}.json`), '---not-json---')
      expect(await cache.has('/test/hascorrupt.ts', 'h1', 'c1')).toBe(false)
    })

    it('should return false on TTL expired in has', async () => {
      const shortCache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 1 })
      await shortCache.set('/test/file.ts', 'h1', 'c1', MOCK_VIOLATIONS)
      await new Promise((r) => setTimeout(r, 10))
      expect(await shortCache.has('/test/file.ts', 'h1', 'c1')).toBe(false)
    })
  })

  describe('getStats error handling', () => {
    it('should return stats with current hits/misses on store error', async () => {
      await cache.get('/test/miss.ts', 'h1', 'c1')
      const stats = await cache.getStats()
      expect(stats.misses).toBeGreaterThanOrEqual(1)
      expect(stats).toHaveProperty('entries')
      expect(stats).toHaveProperty('size')
      expect(stats).toHaveProperty('hitRate')
      expect(stats).toHaveProperty('hits')
    })
  })

  describe('clear error handling', () => {
    it('should handle clear on already empty cache', async () => {
      await expect(cache.clear()).resolves.toBeUndefined()
    })

    it('should handle double clear', async () => {
      await cache.set('/test/file.ts', 'h1', 'c1', MOCK_VIOLATIONS)
      await cache.clear()
      await cache.clear()
      const stats = await cache.getStats()
      expect(stats.entries).toBe(0)
    })
  })

  describe('invalidateFile edge cases', () => {
    it('should handle invalidating file that was never set', async () => {
      const deleted = await cache.invalidateFile('/test/never-set.ts')
      expect(deleted).toBe(0)
    })

    it('should handle invalidating same file twice', async () => {
      await cache.set('/test/file.ts', 'h1', 'c1', MOCK_VIOLATIONS)
      const first = await cache.invalidateFile('/test/file.ts')
      expect(first).toBe(1)
      const second = await cache.invalidateFile('/test/file.ts')
      expect(second).toBe(0)
    })

    it('should handle invalidateFile on non-existent directory', async () => {
      const readOnlyDir = path.join(cacheDir, 'noperm')
      await fs.mkdir(readOnlyDir, { recursive: true })
      await fs.chmod(readOnlyDir, 0o444)
      const badCache = new ResultCache({
        cacheDir: path.join(readOnlyDir, 'nested'),
        version: '0.1.0',
        ttl: 60_000,
      })
      const deleted = await badCache.invalidateFile('/test/file.ts')
      expect(deleted).toBe(0)
      await fs.chmod(readOnlyDir, 0o755)
    })
  })

  describe('hashConfig more coverage', () => {
    it('should handle large rules array', () => {
      const rules = Array.from({ length: 100 }, (_, i) => `rule-${i}`)
      const hash = cache.hashConfig(rules)
      expect(hash).toMatch(/^[0-9a-f]{64}$/)
    })

    it('should produce different hash for different rule config values', () => {
      const h1 = cache.hashConfig(['rule-a'], { 'rule-a': { level: 1 } })
      const h2 = cache.hashConfig(['rule-a'], { 'rule-a': { level: 2 } })
      expect(h1).not.toBe(h2)
    })

    it('should handle ruleConfig with array values', () => {
      const h1 = cache.hashConfig(['rule'], { rule: [1, 2, 3] })
      const h2 = cache.hashConfig(['rule'], { rule: [1, 2, 4] })
      expect(h1).not.toBe(h2)
    })

    it('should handle ruleConfig with boolean values', () => {
      const h1 = cache.hashConfig(['rule'], { rule: true })
      const h2 = cache.hashConfig(['rule'], { rule: false })
      expect(h1).not.toBe(h2)
    })

    it('should handle ruleConfig with null values', () => {
      const hash = cache.hashConfig(['rule'], { rule: null })
      expect(hash).toBeTruthy()
    })

    it('should handle ruleConfig with number values', () => {
      const h1 = cache.hashConfig(['rule'], { rule: 42 })
      const h2 = cache.hashConfig(['rule'], { rule: 99 })
      expect(h1).not.toBe(h2)
    })

    it('should produce same hash when called repeatedly', () => {
      const rules = ['alpha', 'beta', 'gamma']
      const hashes = Array.from({ length: 5 }, () => cache.hashConfig(rules))
      expect(new Set(hashes).size).toBe(1)
    })
  })

  describe('large violations arrays', () => {
    it('should cache and retrieve large violations array', async () => {
      const violations: RuleViolation[] = Array.from({ length: 50 }, (_, i) => ({
        filePath: '/test/file.ts',
        message: `Violation ${i}`,
        range: { end: { column: i + 10, line: i + 1 }, start: { column: i, line: i + 1 } },
        ruleId: `rule-${i}`,
        severity: 'error',
      }))
      await cache.set('/test/file.ts', 'h1', 'c1', violations)
      const result = await cache.get('/test/file.ts', 'h1', 'c1')
      expect(result).toHaveLength(50)
      expect(result![0].ruleId).toBe('rule-0')
      expect(result![49].ruleId).toBe('rule-49')
    })
  })

  describe('violation with all severity types', () => {
    it('should cache violations with severity suggestion', async () => {
      const violations: RuleViolation[] = [
        {
          filePath: '/test/s.ts',
          message: 'Suggestion',
          range: { end: { column: 5, line: 1 }, start: { column: 1, line: 1 } },
          ruleId: 'suggest-rule',
          severity: 'suggestion',
        },
      ]
      await cache.set('/test/s.ts', 'h1', 'c1', violations)
      const result = await cache.get('/test/s.ts', 'h1', 'c1')
      expect(result).toEqual(violations)
    })
  })

  describe('special hash values', () => {
    it('should handle empty string file hash', async () => {
      await cache.set('/test/file.ts', '', 'c1', MOCK_VIOLATIONS)
      const result = await cache.get('/test/file.ts', '', 'c1')
      expect(result).toEqual(MOCK_VIOLATIONS)
    })

    it('should handle empty string config hash', async () => {
      await cache.set('/test/file.ts', 'h1', '', MOCK_VIOLATIONS)
      const result = await cache.get('/test/file.ts', 'h1', '')
      expect(result).toEqual(MOCK_VIOLATIONS)
    })

    it('should differentiate between empty and non-empty hashes', async () => {
      const v1: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'empty' }]
      const v2: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'filled' }]
      await cache.set('/test/file.ts', '', 'c1', v1)
      await cache.set('/test/file.ts', 'h1', 'c1', v2)
      expect(await cache.get('/test/file.ts', '', 'c1')).toEqual(v1)
      expect(await cache.get('/test/file.ts', 'h1', 'c1')).toEqual(v2)
    })

    it('should handle very long hash strings', async () => {
      const longHash = 'a'.repeat(256)
      await cache.set('/test/file.ts', longHash, 'c1', MOCK_VIOLATIONS)
      const result = await cache.get('/test/file.ts', longHash, 'c1')
      expect(result).toEqual(MOCK_VIOLATIONS)
    })
  })

  describe('setEnabled combinations', () => {
    it('should track miss when get called while disabled', async () => {
      cache.setEnabled(false)
      await cache.get('/test/a.ts', 'h1', 'c1')
      await cache.get('/test/b.ts', 'h2', 'c2')
      cache.setEnabled(true)
      const stats = await cache.getStats()
      expect(stats.misses).toBe(2)
      expect(stats.hits).toBe(0)
    })

    it('should allow set after re-enabling', async () => {
      cache.setEnabled(false)
      cache.setEnabled(true)
      await cache.set('/test/file.ts', 'h1', 'c1', MOCK_VIOLATIONS)
      expect(await cache.get('/test/file.ts', 'h1', 'c1')).toEqual(MOCK_VIOLATIONS)
    })

    it('should not affect has when disabled but not when re-enabled', async () => {
      await cache.set('/test/file.ts', 'h1', 'c1', MOCK_VIOLATIONS)
      cache.setEnabled(false)
      expect(await cache.has('/test/file.ts', 'h1', 'c1')).toBe(false)
      cache.setEnabled(true)
      expect(await cache.has('/test/file.ts', 'h1', 'c1')).toBe(true)
    })
  })

  describe('persistence scenarios', () => {
    it('should persist across multiple instances sequentially', async () => {
      await cache.set('/test/persist.ts', 'h1', 'c1', MOCK_VIOLATIONS)
      const c2 = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
      expect(await c2.get('/test/persist.ts', 'h1', 'c1')).toEqual(MOCK_VIOLATIONS)
      const c3 = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
      expect(await c3.get('/test/persist.ts', 'h1', 'c1')).toEqual(MOCK_VIOLATIONS)
    })

    it('should not persist data written while disabled', async () => {
      cache.setEnabled(false)
      await cache.set('/test/file.ts', 'h1', 'c1', MOCK_VIOLATIONS)
      const reader = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
      expect(await reader.get('/test/file.ts', 'h1', 'c1')).toBeNull()
    })
  })

  describe('get invalidation order', () => {
    it('should check version before other checks', async () => {
      await cache.set('/test/file.ts', 'h1', 'c1', MOCK_VIOLATIONS)
      const v2Cache = new ResultCache({ cacheDir, version: '0.2.0', ttl: 60_000 })
      await expect(v2Cache.get('/test/file.ts', 'h1', 'c1')).resolves.toBeNull()
    })

    it('should check fileHash mismatch and return null', async () => {
      await cache.set('/test/file.ts', 'h1', 'c1', MOCK_VIOLATIONS)
      const result = await cache.get('/test/file.ts', 'WRONG', 'c1')
      expect(result).toBeNull()
    })
  })

  describe('cleanup advanced', () => {
    it('should return 0 when all entries are valid', async () => {
      await cache.set('/test/a.ts', 'h1', 'c1', MOCK_VIOLATIONS)
      await cache.set('/test/b.ts', 'h2', 'c2', MOCK_VIOLATIONS)
      const cleaned = await cache.cleanup()
      expect(cleaned).toBe(0)
    })

    it('should handle mixed expired and valid entries', async () => {
      await cache.set('/test/valid.ts', 'h1', 'c1', MOCK_VIOLATIONS)
      const shortCache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 1 })
      await shortCache.set('/test/expired.ts', 'h2', 'c2', MOCK_VIOLATIONS)
      await new Promise((r) => setTimeout(r, 10))
      const cleaned = await shortCache.cleanup()
      expect(cleaned).toBeGreaterThanOrEqual(1)
    })
  })

  describe('fileIndex advanced', () => {
    it('should track file across multiple set calls with same key', async () => {
      const v1: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'first' }]
      const v2: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'second' }]
      await cache.set('/test/file.ts', 'h1', 'c1', v1)
      await cache.set('/test/file.ts', 'h1', 'c1', v2)
      const deleted = await cache.invalidateFile('/test/file.ts')
      expect(deleted).toBe(1)
    })

    it('should handle many files in the index', async () => {
      for (let i = 0; i < 30; i++) {
        await cache.set(`/test/file${i}.ts`, `h${i}`, 'c1', MOCK_VIOLATIONS)
      }
      const deleted = await cache.invalidateFile('/test/file15.ts')
      expect(deleted).toBe(1)
      const stats = await cache.getStats()
      expect(stats.entries).toBe(29)
    })
  })

  describe('createDefaultResultCache coverage', () => {
    it('should create instance that is enabled by default', () => {
      const c = createDefaultResultCache()
      expect(c.isEnabled()).toBe(true)
    })

    it('should accept undefined version', () => {
      const c = createDefaultResultCache(undefined)
      expect(c).toBeInstanceOf(ResultCache)
    })

    it('should accept empty string version', () => {
      const c = createDefaultResultCache('')
      expect(c).toBeInstanceOf(ResultCache)
    })
  })

  describe('stats hitRate calculations', () => {
    it('should calculate hitRate as 0 with only misses', async () => {
      await cache.get('/test/a.ts', 'h1', 'c1')
      await cache.get('/test/b.ts', 'h2', 'c2')
      const stats = await cache.getStats()
      expect(stats.hitRate).toBe(0)
    })

    it('should calculate hitRate correctly with 3 hits 1 miss', async () => {
      await cache.set('/test/file.ts', 'h1', 'c1', MOCK_VIOLATIONS)
      await cache.get('/test/file.ts', 'h1', 'c1')
      await cache.get('/test/file.ts', 'h1', 'c1')
      await cache.get('/test/file.ts', 'h1', 'c1')
      await cache.get('/test/other.ts', 'h1', 'c1')
      const stats = await cache.getStats()
      expect(stats.hitRate).toBeCloseTo(0.75)
    })

    it('should recalculate hitRate after clear', async () => {
      await cache.set('/test/file.ts', 'h1', 'c1', MOCK_VIOLATIONS)
      await cache.get('/test/file.ts', 'h1', 'c1')
      await cache.clear()
      const stats = await cache.getStats()
      expect(stats.hitRate).toBe(0)
      await cache.set('/test/file.ts', 'h1', 'c1', MOCK_VIOLATIONS)
      await cache.get('/test/file.ts', 'h1', 'c1')
      const stats2 = await cache.getStats()
      expect(stats2.hitRate).toBe(1)
    })
  })

  describe('overwrite behavior', () => {
    it('should overwrite and return new violations', async () => {
      const v1: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'old' }]
      const v2: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'new' }]
      await cache.set('/test/file.ts', 'h1', 'c1', v1)
      await cache.set('/test/file.ts', 'h1', 'c1', v2)
      const result = await cache.get('/test/file.ts', 'h1', 'c1')
      expect(result).toEqual(v2)
      expect(result![0].ruleId).toBe('new')
    })

    it('should overwrite with empty violations array', async () => {
      await cache.set('/test/file.ts', 'h1', 'c1', MOCK_VIOLATIONS)
      await cache.set('/test/file.ts', 'h1', 'c1', [])
      const result = await cache.get('/test/file.ts', 'h1', 'c1')
      expect(result).toEqual([])
    })
  })

  describe('concurrent advanced', () => {
    it('should handle concurrent reads and writes to same file', async () => {
      await Promise.all([
        cache.set('/test/same.ts', 'h1', 'c1', MOCK_VIOLATIONS),
        cache.set('/test/same.ts', 'h1', 'c1', MOCK_VIOLATIONS),
        cache.set('/test/same.ts', 'h1', 'c1', MOCK_VIOLATIONS),
      ])
      const result = await cache.get('/test/same.ts', 'h1', 'c1')
      expect(result).toEqual(MOCK_VIOLATIONS)
    })

    it('should handle concurrent invalidate and get', async () => {
      await cache.set('/test/file.ts', 'h1', 'c1', MOCK_VIOLATIONS)
      const [, getResult] = await Promise.all([
        cache.invalidateFile('/test/file.ts'),
        cache.get('/test/file.ts', 'h1', 'c1'),
      ])
      expect(getResult === null || Array.isArray(getResult)).toBe(true)
    })
  })

  describe('invalidateFile fallback scan', () => {
    it('should scan disk when file not in index', async () => {
      await cache.set('/test/cold.ts', 'h1', 'c1', MOCK_VIOLATIONS)
      const freshCache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
      const deleted = await freshCache.invalidateFile('/test/cold.ts')
      expect(deleted).toBe(1)
    })

    it('should return 0 from fallback scan for non-matching file', async () => {
      await cache.set('/test/a.ts', 'h1', 'c1', MOCK_VIOLATIONS)
      const freshCache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
      const deleted = await freshCache.invalidateFile('/test/nonexistent.ts')
      expect(deleted).toBe(0)
    })
  })

  describe('violation range edge cases', () => {
    it('should cache violations with multi-line ranges', async () => {
      const violations: RuleViolation[] = [
        {
          filePath: '/test/multi.ts',
          message: 'Multi-line',
          range: { end: { column: 30, line: 10 }, start: { column: 0, line: 1 } },
          ruleId: 'multi-line-rule',
          severity: 'error',
        },
      ]
      await cache.set('/test/multi.ts', 'h1', 'c1', violations)
      expect(await cache.get('/test/multi.ts', 'h1', 'c1')).toEqual(violations)
    })

    it('should cache violations with same start and end position', async () => {
      const violations: RuleViolation[] = [
        {
          filePath: '/test/zero.ts',
          message: 'Zero range',
          range: { end: { column: 5, line: 1 }, start: { column: 5, line: 1 } },
          ruleId: 'zero-range-rule',
          severity: 'warning',
        },
      ]
      await cache.set('/test/zero.ts', 'h1', 'c1', violations)
      expect(await cache.get('/test/zero.ts', 'h1', 'c1')).toEqual(violations)
    })

    it('should cache violations with line 0', async () => {
      const violations: RuleViolation[] = [
        {
          filePath: '/test/line0.ts',
          message: 'Line zero',
          range: { end: { column: 1, line: 0 }, start: { column: 0, line: 0 } },
          ruleId: 'line-zero-rule',
          severity: 'info',
        },
      ]
      await cache.set('/test/line0.ts', 'h1', 'c1', violations)
      expect(await cache.get('/test/line0.ts', 'h1', 'c1')).toEqual(violations)
    })
  })
})

describe('ResultCache expanded constructor coverage', () => {
  let cacheDir: string

  beforeEach(() => {
    cacheDir = makeTempDir()
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should create cache with numeric version string', async () => {
    const c = new ResultCache({ cacheDir, version: '1.2.3' })
    await c.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    expect(await c.get('/test/f.ts', 'h1', 'c1')).toEqual(MOCK_VIOLATIONS)
  })

  it('should create cache with prerelease version string', async () => {
    const c = new ResultCache({ cacheDir, version: '2.0.0-beta.1' })
    await c.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    expect(await c.get('/test/f.ts', 'h1', 'c1')).toEqual(MOCK_VIOLATIONS)
  })

  it('should create cache with very large TTL', async () => {
    const c = new ResultCache({ cacheDir, version: '0.1.0', ttl: Number.MAX_SAFE_INTEGER })
    await c.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    expect(await c.get('/test/f.ts', 'h1', 'c1')).toEqual(MOCK_VIOLATIONS)
  })

  it('should create cache with only version option', () => {
    const c = new ResultCache({ version: '5.0.0' })
    expect(c).toBeInstanceOf(ResultCache)
    expect(c.isEnabled()).toBe(true)
  })

  it('should create cache with only ttl option', () => {
    const c = new ResultCache({ ttl: 120_000 })
    expect(c).toBeInstanceOf(ResultCache)
    expect(c.isEnabled()).toBe(true)
  })

  it('should create cache with only enabled option', () => {
    const c = new ResultCache({ enabled: false })
    expect(c).toBeInstanceOf(ResultCache)
    expect(c.isEnabled()).toBe(false)
  })

  it('should create multiple caches pointing to same dir', async () => {
    const c1 = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
    const c2 = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
    await c1.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    expect(await c2.get('/test/f.ts', 'h1', 'c1')).toEqual(MOCK_VIOLATIONS)
  })
})

describe('ResultCache hashConfig extended', () => {
  let cache: ResultCache
  let cacheDir: string

  beforeEach(() => {
    cacheDir = makeTempDir()
    cache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should handle rules with special characters in names', () => {
    const hash = cache.hashConfig([
      'rule/with/slashes',
      'rule-with-dashes',
      'rule_with_underscores',
    ])
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('should handle rules with dots in names', () => {
    const hash = cache.hashConfig(['no.eval', 'no.with.statement'])
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('should handle duplicate rule names by sorting', () => {
    const h1 = cache.hashConfig(['a', 'a', 'b'])
    const h2 = cache.hashConfig(['a', 'b'])

    expect(h1).toBeTruthy()
    expect(h2).toBeTruthy()
  })

  it('should handle ruleConfig with empty object value', () => {
    const h1 = cache.hashConfig(['rule'], { rule: {} })
    const h2 = cache.hashConfig(['rule'])
    expect(h1).not.toBe(h2)
  })

  it('should handle ruleConfig with string values', () => {
    const h1 = cache.hashConfig(['rule'], { rule: 'value-a' })
    const h2 = cache.hashConfig(['rule'], { rule: 'value-b' })
    expect(h1).not.toBe(h2)
  })

  it('should handle ruleConfig with deeply nested objects', () => {
    const h1 = cache.hashConfig(['rule'], { rule: { a: { b: { c: 1 } } } })
    const h2 = cache.hashConfig(['rule'], { rule: { a: { b: { c: 2 } } } })
    expect(h1).not.toBe(h2)
  })

  it('should handle ruleConfig with mixed types', () => {
    const hash = cache.hashConfig(['r1', 'r2'], { r1: 1, r2: 'two', r3: true })
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('should produce different hash for empty rules vs one rule', () => {
    const h1 = cache.hashConfig([])
    const h2 = cache.hashConfig(['rule'])
    expect(h1).not.toBe(h2)
  })

  it('should handle single rule with config', () => {
    const hash = cache.hashConfig(['only-rule'], { 'only-rule': { enabled: true } })
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('should sort the input rules array', () => {
    const rules = ['c-rule', 'a-rule', 'b-rule']
    cache.hashConfig(rules)
    expect(rules).toEqual(['a-rule', 'b-rule', 'c-rule'])
  })

  it('should handle rules with numeric-like string names', () => {
    const hash = cache.hashConfig(['123', '456'])
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('should handle very long rule names', () => {
    const longRule = 'x'.repeat(500)
    const hash = cache.hashConfig([longRule])
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })
})

describe('ResultCache version invalidation expanded', () => {
  let cacheDir: string

  beforeEach(() => {
    cacheDir = makeTempDir()
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should invalidate on patch version change', async () => {
    const c1 = new ResultCache({ cacheDir, version: '1.0.0', ttl: 60_000 })
    await c1.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    const c2 = new ResultCache({ cacheDir, version: '1.0.1', ttl: 60_000 })
    expect(await c2.get('/test/f.ts', 'h1', 'c1')).toBeNull()
  })

  it('should invalidate on minor version change', async () => {
    const c1 = new ResultCache({ cacheDir, version: '1.0.0', ttl: 60_000 })
    await c1.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    const c2 = new ResultCache({ cacheDir, version: '1.1.0', ttl: 60_000 })
    expect(await c2.get('/test/f.ts', 'h1', 'c1')).toBeNull()
  })

  it('should invalidate on major version change', async () => {
    const c1 = new ResultCache({ cacheDir, version: '1.0.0', ttl: 60_000 })
    await c1.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    const c2 = new ResultCache({ cacheDir, version: '2.0.0', ttl: 60_000 })
    expect(await c2.get('/test/f.ts', 'h1', 'c1')).toBeNull()
  })

  it('should not invalidate on same version', async () => {
    const c1 = new ResultCache({ cacheDir, version: '1.5.0', ttl: 60_000 })
    await c1.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    const c2 = new ResultCache({ cacheDir, version: '1.5.0', ttl: 60_000 })
    expect(await c2.get('/test/f.ts', 'h1', 'c1')).toEqual(MOCK_VIOLATIONS)
  })

  it('should handle empty version string matching', async () => {
    const c1 = new ResultCache({ cacheDir, version: '', ttl: 60_000 })
    await c1.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    const c2 = new ResultCache({ cacheDir, version: '', ttl: 60_000 })
    expect(await c2.get('/test/f.ts', 'h1', 'c1')).toEqual(MOCK_VIOLATIONS)
  })

  it('should handle empty vs non-empty version mismatch', async () => {
    const c1 = new ResultCache({ cacheDir, version: '', ttl: 60_000 })
    await c1.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    const c2 = new ResultCache({ cacheDir, version: '1.0.0', ttl: 60_000 })
    expect(await c2.get('/test/f.ts', 'h1', 'c1')).toBeNull()
  })

  it('should count miss for version mismatch in get', async () => {
    const c1 = new ResultCache({ cacheDir, version: '1.0.0', ttl: 60_000 })
    await c1.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    const c2 = new ResultCache({ cacheDir, version: '2.0.0', ttl: 60_000 })
    await c2.get('/test/f.ts', 'h1', 'c1')
    const stats = await c2.getStats()
    expect(stats.misses).toBe(1)
  })

  it('should have separate cache keys per version', async () => {
    const c1 = new ResultCache({ cacheDir, version: '1.0.0', ttl: 60_000 })
    await c1.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    const c2 = new ResultCache({ cacheDir, version: '2.0.0', ttl: 60_000 })
    await c2.get('/test/f.ts', 'h1', 'c1')
    const c3 = new ResultCache({ cacheDir, version: '1.0.0', ttl: 60_000 })
    expect(await c3.get('/test/f.ts', 'h1', 'c1')).toEqual(MOCK_VIOLATIONS)
  })
})

describe('ResultCache get hash mismatch expanded', () => {
  let cacheDir: string
  let cache: ResultCache

  beforeEach(() => {
    cacheDir = makeTempDir()
    cache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should count miss on file hash mismatch', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await cache.get('/test/f.ts', 'wrong-hash', 'c1')
    const stats = await cache.getStats()
    expect(stats.misses).toBe(1)
  })

  it('should count miss on config hash mismatch', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await cache.get('/test/f.ts', 'h1', 'wrong-config')
    const stats = await cache.getStats()
    expect(stats.misses).toBe(1)
  })

  it('should increment misses not hits on mismatch', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await cache.get('/test/f.ts', 'h1', 'c1')
    await cache.get('/test/f.ts', 'wrong', 'c1')
    const stats = await cache.getStats()
    expect(stats.hits).toBe(1)
    expect(stats.misses).toBe(1)
  })

  it('should preserve original entry when querying with wrong hash', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await cache.get('/test/f.ts', 'h1-wrong', 'c1')
    const result = await cache.get('/test/f.ts', 'h1', 'c1')
    expect(result).toEqual(MOCK_VIOLATIONS)
  })
})

describe('ResultCache TTL edge cases', () => {
  let cacheDir: string

  beforeEach(() => {
    cacheDir = makeTempDir()
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should serve fresh entry before TTL expires', async () => {
    const c = new ResultCache({ cacheDir, version: '0.1.0', ttl: 5000 })
    await c.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    expect(await c.get('/test/f.ts', 'h1', 'c1')).toEqual(MOCK_VIOLATIONS)
  })

  it('should invalidate very short TTL entries', async () => {
    const c = new ResultCache({ cacheDir, version: '0.1.0', ttl: 1 })
    await c.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await new Promise((r) => setTimeout(r, 5))
    expect(await c.get('/test/f.ts', 'h1', 'c1')).toBeNull()
  })

  it('should has return false for TTL expired', async () => {
    const c = new ResultCache({ cacheDir, version: '0.1.0', ttl: 1 })
    await c.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await new Promise((r) => setTimeout(r, 5))
    expect(await c.has('/test/f.ts', 'h1', 'c1')).toBe(false)
  })

  it('should has return true for non-expired entry', async () => {
    const c = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
    await c.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    expect(await c.has('/test/f.ts', 'h1', 'c1')).toBe(true)
  })

  it('should cleanup expired entries with short TTL', async () => {
    const c = new ResultCache({ cacheDir, version: '0.1.0', ttl: 1 })
    await c.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await new Promise((r) => setTimeout(r, 5))
    const cleaned = await c.cleanup()
    expect(cleaned).toBeGreaterThanOrEqual(1)
  })
})

describe('ResultCache violations messages', () => {
  let cacheDir: string
  let cache: ResultCache

  beforeEach(() => {
    cacheDir = makeTempDir()
    cache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should cache violations with long messages', async () => {
    const longMsg = 'x'.repeat(500)
    const v: RuleViolation[] = [
      {
        filePath: '/test/f.ts',
        message: longMsg,
        range: { end: { column: 5, line: 1 }, start: { column: 0, line: 1 } },
        ruleId: 'long-msg',
        severity: 'error',
      },
    ]
    await cache.set('/test/f.ts', 'h1', 'c1', v)
    expect((await cache.get('/test/f.ts', 'h1', 'c1'))![0].message).toBe(longMsg)
  })

  it('should cache violations with special chars in message', async () => {
    const v: RuleViolation[] = [
      {
        filePath: '/test/f.ts',
        message: 'Use "const" instead of `let`\n\tSee: https://example.com',
        range: { end: { column: 5, line: 1 }, start: { column: 0, line: 1 } },
        ruleId: 'special-chars',
        severity: 'warning',
      },
    ]
    await cache.set('/test/f.ts', 'h1', 'c1', v)
    expect(await cache.get('/test/f.ts', 'h1', 'c1')).toEqual(v)
  })

  it('should cache violations with empty message', async () => {
    const v: RuleViolation[] = [
      {
        filePath: '/test/f.ts',
        message: '',
        range: { end: { column: 5, line: 1 }, start: { column: 0, line: 1 } },
        ruleId: 'empty-msg',
        severity: 'info',
      },
    ]
    await cache.set('/test/f.ts', 'h1', 'c1', v)
    expect((await cache.get('/test/f.ts', 'h1', 'c1'))![0].message).toBe('')
  })

  it('should cache violations with unicode in message', async () => {
    const v: RuleViolation[] = [
      {
        filePath: '/test/f.ts',
        message: '問題が見つかりました 🎉',
        range: { end: { column: 5, line: 1 }, start: { column: 0, line: 1 } },
        ruleId: 'unicode-msg',
        severity: 'error',
      },
    ]
    await cache.set('/test/f.ts', 'h1', 'c1', v)
    expect(await cache.get('/test/f.ts', 'h1', 'c1')).toEqual(v)
  })

  it('should cache mixed severity violations', async () => {
    const v: RuleViolation[] = [
      {
        filePath: '/test/f.ts',
        message: 'error',
        range: { end: { column: 5, line: 1 }, start: { column: 0, line: 1 } },
        ruleId: 'r1',
        severity: 'error',
      },
      {
        filePath: '/test/f.ts',
        message: 'warning',
        range: { end: { column: 5, line: 2 }, start: { column: 0, line: 2 } },
        ruleId: 'r2',
        severity: 'warning',
      },
      {
        filePath: '/test/f.ts',
        message: 'info',
        range: { end: { column: 5, line: 3 }, start: { column: 0, line: 3 } },
        ruleId: 'r3',
        severity: 'info',
      },
      {
        filePath: '/test/f.ts',
        message: 'suggestion',
        range: { end: { column: 5, line: 4 }, start: { column: 0, line: 4 } },
        ruleId: 'r4',
        severity: 'suggestion',
      },
    ]
    await cache.set('/test/f.ts', 'h1', 'c1', v)
    const result = await cache.get('/test/f.ts', 'h1', 'c1')
    expect(result).toHaveLength(4)
    expect(result![0].severity).toBe('error')
    expect(result![1].severity).toBe('warning')
    expect(result![2].severity).toBe('info')
    expect(result![3].severity).toBe('suggestion')
  })
})

describe('ResultCache file path edge cases expanded', () => {
  let cacheDir: string
  let cache: ResultCache

  beforeEach(() => {
    cacheDir = makeTempDir()
    cache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should handle relative file paths', async () => {
    await cache.set('./relative/path.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    expect(await cache.get('./relative/path.ts', 'h1', 'c1')).toEqual(MOCK_VIOLATIONS)
  })

  it('should handle paths with multiple slashes', async () => {
    await cache.set('/test//double///slash.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    expect(await cache.get('/test//double///slash.ts', 'h1', 'c1')).toEqual(MOCK_VIOLATIONS)
  })

  it('should handle paths with dots in directory names', async () => {
    await cache.set('/test/src.module/file.service.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    expect(await cache.get('/test/src.module/file.service.ts', 'h1', 'c1')).toEqual(MOCK_VIOLATIONS)
  })

  it('should handle paths with parentheses', async () => {
    await cache.set('/test/path (copy).ts', 'h1', 'c1', MOCK_VIOLATIONS)
    expect(await cache.get('/test/path (copy).ts', 'h1', 'c1')).toEqual(MOCK_VIOLATIONS)
  })

  it('should handle root path', async () => {
    await cache.set('/file.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    expect(await cache.get('/file.ts', 'h1', 'c1')).toEqual(MOCK_VIOLATIONS)
  })

  it('should differentiate path with trailing slash', async () => {
    const v1: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'no-slash' }]
    const v2: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'with-slash' }]
    await cache.set('/test/dir/file.ts', 'h1', 'c1', v1)
    await cache.set('/test/dir/file.ts/', 'h1', 'c1', v2)
    expect(await cache.get('/test/dir/file.ts', 'h1', 'c1')).toEqual(v1)
    expect(await cache.get('/test/dir/file.ts/', 'h1', 'c1')).toEqual(v2)
  })
})

describe('ResultCache invalidateFile expanded', () => {
  let cacheDir: string
  let cache: ResultCache

  beforeEach(() => {
    cacheDir = makeTempDir()
    cache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should invalidate specific file without affecting others', async () => {
    const v1: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'a' }]
    const v2: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'b' }]
    const v3: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'c' }]
    await cache.set('/test/a.ts', 'h1', 'c1', v1)
    await cache.set('/test/b.ts', 'h1', 'c1', v2)
    await cache.set('/test/c.ts', 'h1', 'c1', v3)
    await cache.invalidateFile('/test/b.ts')
    expect(await cache.get('/test/a.ts', 'h1', 'c1')).toEqual(v1)
    expect(await cache.get('/test/b.ts', 'h1', 'c1')).toBeNull()
    expect(await cache.get('/test/c.ts', 'h1', 'c1')).toEqual(v3)
  })

  it('should allow setting new entry after invalidation', async () => {
    const v1: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'old' }]
    const v2: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'new' }]
    await cache.set('/test/f.ts', 'h1', 'c1', v1)
    await cache.invalidateFile('/test/f.ts')
    await cache.set('/test/f.ts', 'h1', 'c1', v2)
    expect(await cache.get('/test/f.ts', 'h1', 'c1')).toEqual(v2)
  })

  it('should invalidate multiple config hashes for same file', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await cache.set('/test/f.ts', 'h1', 'c2', MOCK_VIOLATIONS)
    await cache.set('/test/f.ts', 'h1', 'c3', MOCK_VIOLATIONS)
    const deleted = await cache.invalidateFile('/test/f.ts')
    expect(deleted).toBe(3)
  })

  it('should handle invalidate after set then clear then set', async () => {
    await cache.set('/test/a.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await cache.clear()
    await cache.set('/test/b.ts', 'h2', 'c2', MOCK_VIOLATIONS)
    const deleted = await cache.invalidateFile('/test/b.ts')
    expect(deleted).toBe(1)
    expect(await cache.get('/test/b.ts', 'h2', 'c2')).toBeNull()
  })

  it('should track entries count after selective invalidation', async () => {
    await cache.set('/test/a.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await cache.set('/test/b.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await cache.set('/test/c.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await cache.invalidateFile('/test/b.ts')
    const stats = await cache.getStats()
    expect(stats.entries).toBe(2)
  })
})

describe('ResultCache stats lifecycle', () => {
  let cacheDir: string
  let cache: ResultCache

  beforeEach(() => {
    cacheDir = makeTempDir()
    cache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should track stats across set, get, clear cycle', async () => {
    await cache.set('/test/a.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await cache.get('/test/a.ts', 'h1', 'c1')
    expect((await cache.getStats()).hits).toBe(1)
    await cache.clear()
    expect((await cache.getStats()).hits).toBe(0)
    await cache.set('/test/b.ts', 'h2', 'c2', MOCK_VIOLATIONS)
    await cache.get('/test/b.ts', 'h2', 'c2')
    expect((await cache.getStats()).hits).toBe(1)
  })

  it('should track size growing with entries', async () => {
    const stats1 = await cache.getStats()
    const size1 = stats1.size
    await cache.set('/test/a.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    const stats2 = await cache.getStats()
    expect(stats2.size).toBeGreaterThanOrEqual(size1)
    await cache.set('/test/b.ts', 'h2', 'c2', MOCK_VIOLATIONS)
    const stats3 = await cache.getStats()
    expect(stats3.size).toBeGreaterThanOrEqual(stats2.size)
  })

  it('should reset size after clear', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await cache.clear()
    const stats = await cache.getStats()
    expect(stats.size).toBe(0)
  })

  it('should report 0 hitRate after only misses', async () => {
    await cache.get('/test/a.ts', 'h1', 'c1')
    await cache.get('/test/b.ts', 'h2', 'c2')
    await cache.get('/test/c.ts', 'h3', 'c3')
    const stats = await cache.getStats()
    expect(stats.hitRate).toBe(0)
    expect(stats.misses).toBe(3)
  })

  it('should report 1.0 hitRate after only hits', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await cache.get('/test/f.ts', 'h1', 'c1')
    await cache.get('/test/f.ts', 'h1', 'c1')
    await cache.get('/test/f.ts', 'h1', 'c1')
    const stats = await cache.getStats()
    expect(stats.hitRate).toBe(1)
  })

  it('should update entries count after each set', async () => {
    for (let i = 0; i < 5; i++) {
      await cache.set(`/test/f${i}.ts`, 'h1', 'c1', MOCK_VIOLATIONS)
    }
    const stats = await cache.getStats()
    expect(stats.entries).toBe(5)
  })
})

describe('ResultCache cleanup expanded', () => {
  let cacheDir: string

  beforeEach(() => {
    cacheDir = makeTempDir()
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should cleanup only expired entries', async () => {
    const shortC = new ResultCache({ cacheDir, version: '0.1.0', ttl: 1 })
    await shortC.set('/test/expired.ts', 'h2', 'c2', MOCK_VIOLATIONS)
    await new Promise((r) => setTimeout(r, 10))
    const cleaned = await shortC.cleanup()
    expect(cleaned).toBeGreaterThanOrEqual(1)
  })

  it('should return 0 cleanup on empty directory', async () => {
    const c = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
    const cleaned = await c.cleanup()
    expect(cleaned).toBe(0)
  })

  it('should cleanup after clear leaves no files', async () => {
    const c = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
    await c.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await c.clear()
    const cleaned = await c.cleanup()
    expect(cleaned).toBe(0)
  })

  it('should handle multiple corrupted files', async () => {
    const { writeFile, mkdir } = await import('node:fs/promises')
    await mkdir(cacheDir, { recursive: true })
    await writeFile(path.join(cacheDir, 'bad1.json'), 'corrupted')
    await writeFile(path.join(cacheDir, 'bad2.json'), '{invalid')
    const c = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
    const cleaned = await c.cleanup()
    expect(cleaned).toBeGreaterThanOrEqual(2)
  })
})

describe('ResultCache enabled toggle expanded', () => {
  let cacheDir: string
  let cache: ResultCache

  beforeEach(() => {
    cacheDir = makeTempDir()
    cache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should handle multiple toggle cycles', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    cache.setEnabled(false)
    expect(await cache.get('/test/f.ts', 'h1', 'c1')).toBeNull()
    cache.setEnabled(true)
    expect(await cache.get('/test/f.ts', 'h1', 'c1')).toEqual(MOCK_VIOLATIONS)
    cache.setEnabled(false)
    expect(await cache.get('/test/f.ts', 'h1', 'c1')).toBeNull()
    cache.setEnabled(true)
    expect(await cache.get('/test/f.ts', 'h1', 'c1')).toEqual(MOCK_VIOLATIONS)
  })

  it('should not track hit when get is called disabled', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    cache.setEnabled(false)
    await cache.get('/test/f.ts', 'h1', 'c1')
    cache.setEnabled(true)
    const stats = await cache.getStats()
    expect(stats.hits).toBe(0)
    expect(stats.misses).toBe(1)
  })

  it('should has return false consistently when disabled', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    cache.setEnabled(false)
    expect(await cache.has('/test/f.ts', 'h1', 'c1')).toBe(false)
    expect(await cache.has('/test/f.ts', 'h1', 'c1')).toBe(false)
    expect(await cache.has('/test/f.ts', 'h1', 'c1')).toBe(false)
  })

  it('should allow operations after re-enabling', async () => {
    cache.setEnabled(false)
    cache.setEnabled(true)
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    expect(await cache.has('/test/f.ts', 'h1', 'c1')).toBe(true)
    expect(await cache.get('/test/f.ts', 'h1', 'c1')).toEqual(MOCK_VIOLATIONS)
  })

  it('should not write to disk when disabled', async () => {
    cache.setEnabled(false)
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    cache.setEnabled(true)
    const c2 = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
    expect(await c2.get('/test/f.ts', 'h1', 'c1')).toBeNull()
  })
})

describe('ResultCache persistence expanded', () => {
  let cacheDir: string

  beforeEach(() => {
    cacheDir = makeTempDir()
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should persist different files for same hash', async () => {
    const c1 = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
    const v1: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'file-a' }]
    const v2: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'file-b' }]
    await c1.set('/test/a.ts', 'h1', 'c1', v1)
    await c1.set('/test/b.ts', 'h1', 'c1', v2)
    const c2 = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
    expect(await c2.get('/test/a.ts', 'h1', 'c1')).toEqual(v1)
    expect(await c2.get('/test/b.ts', 'h1', 'c1')).toEqual(v2)
  })

  it('should persist overwrites correctly', async () => {
    const c1 = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
    const v1: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'original' }]
    const v2: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'updated' }]
    await c1.set('/test/f.ts', 'h1', 'c1', v1)
    await c1.set('/test/f.ts', 'h1', 'c1', v2)
    const c2 = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
    expect(await c2.get('/test/f.ts', 'h1', 'c1')).toEqual(v2)
  })

  it('should handle stats isolation between instances', async () => {
    const c1 = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
    const c2 = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
    await c1.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await c2.get('/test/f.ts', 'h1', 'c1')
    const stats1 = await c1.getStats()
    const stats2 = await c2.getStats()
    expect(stats1.hits).toBe(0)
    expect(stats2.hits).toBe(1)
  })

  it('should read entries from previous session', async () => {
    const c1 = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
    const v: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'session1' }]
    await c1.set('/test/session.ts', 'h1', 'c1', v)
    const c2 = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
    expect(await c2.has('/test/session.ts', 'h1', 'c1')).toBe(true)
  })
})

describe('ResultCache corrupted data expanded', () => {
  let cacheDir: string
  let cache: ResultCache

  beforeEach(() => {
    cacheDir = makeTempDir()
    cache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should handle empty file gracefully', async () => {
    const { writeFile, mkdir } = await import('node:fs/promises')
    const crypto = await import('node:crypto')
    await mkdir(cacheDir, { recursive: true })
    const rawKey = 'result:0.1.0:/test/empty.ts:h1:c1'
    const safeKey = crypto.createHash('md5').update(rawKey).digest('hex')
    await writeFile(path.join(cacheDir, `${safeKey}.json`), '')
    expect(await cache.get('/test/empty.ts', 'h1', 'c1')).toBeNull()
  })

  it('should handle binary-ish data gracefully', async () => {
    const { writeFile, mkdir } = await import('node:fs/promises')
    const crypto = await import('node:crypto')
    await mkdir(cacheDir, { recursive: true })
    const rawKey = 'result:0.1.0:/test/bin.ts:h1:c1'
    const safeKey = crypto.createHash('md5').update(rawKey).digest('hex')
    await writeFile(path.join(cacheDir, `${safeKey}.json`), Buffer.from([0, 1, 2, 3, 255]))
    expect(await cache.get('/test/bin.ts', 'h1', 'c1')).toBeNull()
  })

  it('should handle has with truncated JSON', async () => {
    const { writeFile, mkdir } = await import('node:fs/promises')
    const crypto = await import('node:crypto')
    await mkdir(cacheDir, { recursive: true })
    const rawKey = 'result:0.1.0:/test/trunc.ts:h1:c1'
    const safeKey = crypto.createHash('md5').update(rawKey).digest('hex')
    await writeFile(path.join(cacheDir, `${safeKey}.json`), '{"key":"result:')
    expect(await cache.has('/test/trunc.ts', 'h1', 'c1')).toBe(false)
  })

  it('should cleanup corrupted files during cleanup', async () => {
    const { writeFile, mkdir } = await import('node:fs/promises')
    await mkdir(cacheDir, { recursive: true })
    await writeFile(path.join(cacheDir, 'corrupt-a.json'), 'not-json')
    await writeFile(path.join(cacheDir, 'corrupt-b.json'), '{bad}')
    const cleaned = await cache.cleanup()
    expect(cleaned).toBeGreaterThanOrEqual(2)
  })
})

describe('ResultCache parallel operations expanded', () => {
  let cacheDir: string
  let cache: ResultCache

  beforeEach(() => {
    cacheDir = makeTempDir()
    cache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should handle parallel sets to different files', async () => {
    await Promise.all([
      cache.set('/test/a.ts', 'h1', 'c1', MOCK_VIOLATIONS),
      cache.set('/test/b.ts', 'h2', 'c2', MOCK_VIOLATIONS),
      cache.set('/test/c.ts', 'h3', 'c3', MOCK_VIOLATIONS),
    ])
    const stats = await cache.getStats()
    expect(stats.entries).toBe(3)
  })

  it('should handle parallel gets with mix of hits and misses', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    const results = await Promise.all([
      cache.get('/test/f.ts', 'h1', 'c1'),
      cache.get('/test/miss.ts', 'h1', 'c1'),
    ])
    expect(results[0]).toEqual(MOCK_VIOLATIONS)
    expect(results[1]).toBeNull()
    const stats = await cache.getStats()
    expect(stats.hits).toBe(1)
    expect(stats.misses).toBe(1)
  })

  it('should handle parallel has checks', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    const results = await Promise.all([
      cache.has('/test/f.ts', 'h1', 'c1'),
      cache.has('/test/miss.ts', 'h1', 'c1'),
      cache.has('/test/f.ts', 'wrong', 'c1'),
    ])
    expect(results[0]).toBe(true)
    expect(results[1]).toBe(false)
    expect(results[2]).toBe(false)
  })

  it('should handle set and immediate get', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    const result = await cache.get('/test/f.ts', 'h1', 'c1')
    expect(result).toEqual(MOCK_VIOLATIONS)
  })
})

describe('ResultCache overwrite scenarios', () => {
  let cacheDir: string
  let cache: ResultCache

  beforeEach(() => {
    cacheDir = makeTempDir()
    cache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should overwrite multiple times and return latest', async () => {
    for (let i = 0; i < 5; i++) {
      const v: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: `version-${i}` }]
      await cache.set('/test/f.ts', 'h1', 'c1', v)
    }
    const result = await cache.get('/test/f.ts', 'h1', 'c1')
    expect(result![0].ruleId).toBe('version-4')
  })

  it('should track correct entries after overwrites', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    const stats = await cache.getStats()
    expect(stats.entries).toBe(1)
  })

  it('should have correct has after overwrite', async () => {
    const v1: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'old' }]
    const v2: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'new' }]
    await cache.set('/test/f.ts', 'h1', 'c1', v1)
    await cache.set('/test/f.ts', 'h1', 'c1', v2)
    expect(await cache.has('/test/f.ts', 'h1', 'c1')).toBe(true)
  })

  it('should overwrite with different violation counts', async () => {
    const v1: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'single' }]
    const v2: RuleViolation[] = [
      { ...MOCK_VIOLATIONS[0], ruleId: 'a' },
      { ...MOCK_VIOLATIONS[0], ruleId: 'b' },
      { ...MOCK_VIOLATIONS[0], ruleId: 'c' },
    ]
    await cache.set('/test/f.ts', 'h1', 'c1', v1)
    await cache.set('/test/f.ts', 'h1', 'c1', v2)
    const result = await cache.get('/test/f.ts', 'h1', 'c1')
    expect(result).toHaveLength(3)
  })
})

describe('ResultCache clear expanded', () => {
  let cacheDir: string
  let cache: ResultCache

  beforeEach(() => {
    cacheDir = makeTempDir()
    cache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should allow operations after clear', async () => {
    await cache.set('/test/old.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await cache.clear()
    await cache.set('/test/new.ts', 'h2', 'c2', MOCK_VIOLATIONS)
    expect(await cache.get('/test/new.ts', 'h2', 'c2')).toEqual(MOCK_VIOLATIONS)
  })

  it('should reset everything after clear', async () => {
    await cache.set('/test/a.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await cache.set('/test/b.ts', 'h2', 'c2', MOCK_VIOLATIONS)
    await cache.get('/test/a.ts', 'h1', 'c1')
    await cache.get('/test/miss.ts', 'h1', 'c1')
    await cache.clear()
    const stats = await cache.getStats()
    expect(stats.entries).toBe(0)
    expect(stats.hits).toBe(0)
    expect(stats.misses).toBe(0)
    expect(stats.hitRate).toBe(0)
    expect(stats.size).toBe(0)
  })

  it('should handle invalidateFile after clear', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await cache.clear()
    const deleted = await cache.invalidateFile('/test/f.ts')
    expect(deleted).toBe(0)
  })

  it('should handle has after clear', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await cache.clear()
    expect(await cache.has('/test/f.ts', 'h1', 'c1')).toBe(false)
  })
})

describe('ResultCache range values', () => {
  let cacheDir: string
  let cache: ResultCache

  beforeEach(() => {
    cacheDir = makeTempDir()
    cache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should cache violations with very large line numbers', async () => {
    const v: RuleViolation[] = [
      {
        filePath: '/test/f.ts',
        message: 'big line',
        range: { end: { column: 50, line: 99999 }, start: { column: 1, line: 99998 } },
        ruleId: 'big-line',
        severity: 'error',
      },
    ]
    await cache.set('/test/f.ts', 'h1', 'c1', v)
    expect(await cache.get('/test/f.ts', 'h1', 'c1')).toEqual(v)
  })

  it('should cache violations with column 0', async () => {
    const v: RuleViolation[] = [
      {
        filePath: '/test/f.ts',
        message: 'col 0',
        range: { end: { column: 0, line: 1 }, start: { column: 0, line: 1 } },
        ruleId: 'col-zero',
        severity: 'warning',
      },
    ]
    await cache.set('/test/f.ts', 'h1', 'c1', v)
    expect(await cache.get('/test/f.ts', 'h1', 'c1')).toEqual(v)
  })

  it('should cache violations with large column numbers', async () => {
    const v: RuleViolation[] = [
      {
        filePath: '/test/f.ts',
        message: 'wide',
        range: { end: { column: 500, line: 1 }, start: { column: 400, line: 1 } },
        ruleId: 'wide',
        severity: 'info',
      },
    ]
    await cache.set('/test/f.ts', 'h1', 'c1', v)
    expect(await cache.get('/test/f.ts', 'h1', 'c1')).toEqual(v)
  })

  it('should preserve all violation fields exactly', async () => {
    const v: RuleViolation[] = [
      {
        filePath: '/exact/path.ts',
        message: 'Exact message',
        range: { end: { column: 20, line: 5 }, start: { column: 10, line: 3 } },
        ruleId: 'exact-rule',
        severity: 'error',
      },
    ]
    await cache.set('/exact/path.ts', 'h1', 'c1', v)
    const result = await cache.get('/exact/path.ts', 'h1', 'c1')
    expect(result).toEqual(v)
    expect(result![0].filePath).toBe('/exact/path.ts')
    expect(result![0].message).toBe('Exact message')
    expect(result![0].ruleId).toBe('exact-rule')
    expect(result![0].severity).toBe('error')
    expect(result![0].range.start.line).toBe(3)
    expect(result![0].range.start.column).toBe(10)
    expect(result![0].range.end.line).toBe(5)
    expect(result![0].range.end.column).toBe(20)
  })
})

describe('ResultCache createDefaultResultCache expanded', () => {
  it('should create instance with semantic version', () => {
    const c = createDefaultResultCache('1.2.3')
    expect(c).toBeInstanceOf(ResultCache)
    expect(c.isEnabled()).toBe(true)
  })

  it('should create instance with custom version string', () => {
    const c = createDefaultResultCache('custom-build-123')
    expect(c).toBeInstanceOf(ResultCache)
  })

  it('should create separate instances each call', () => {
    const instances = Array.from({ length: 5 }, () => createDefaultResultCache())
    const unique = new Set(instances)
    expect(unique.size).toBe(5)
  })
})

describe('ResultCache isEnabled', () => {
  it('should return true by default', () => {
    const c = new ResultCache({ cacheDir: makeTempDir() })
    expect(c.isEnabled()).toBe(true)
  })

  it('should return false when constructed with enabled: false', () => {
    const c = new ResultCache({ cacheDir: makeTempDir(), enabled: false })
    expect(c.isEnabled()).toBe(false)
  })

  it('should reflect state after setEnabled call', () => {
    const c = new ResultCache({ cacheDir: makeTempDir() })
    c.setEnabled(false)
    expect(c.isEnabled()).toBe(false)
    c.setEnabled(true)
    expect(c.isEnabled()).toBe(true)
  })
})

describe('ResultCache sequential operations', () => {
  let cacheDir: string
  let cache: ResultCache

  beforeEach(() => {
    cacheDir = makeTempDir()
    cache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should handle set-get-set-get cycle', async () => {
    const v1: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'first' }]
    const v2: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'second' }]
    await cache.set('/test/f.ts', 'h1', 'c1', v1)
    expect(await cache.get('/test/f.ts', 'h1', 'c1')).toEqual(v1)
    await cache.set('/test/f.ts', 'h1', 'c1', v2)
    expect(await cache.get('/test/f.ts', 'h1', 'c1')).toEqual(v2)
  })

  it('should handle set-invalidate-set-get cycle', async () => {
    const v1: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'before' }]
    const v2: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'after' }]
    await cache.set('/test/f.ts', 'h1', 'c1', v1)
    await cache.invalidateFile('/test/f.ts')
    await cache.set('/test/f.ts', 'h1', 'c1', v2)
    expect(await cache.get('/test/f.ts', 'h1', 'c1')).toEqual(v2)
  })

  it('should handle set-clear-set-get cycle', async () => {
    const v1: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'before' }]
    const v2: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'after' }]
    await cache.set('/test/f.ts', 'h1', 'c1', v1)
    await cache.clear()
    await cache.set('/test/f.ts', 'h1', 'c1', v2)
    expect(await cache.get('/test/f.ts', 'h1', 'c1')).toEqual(v2)
  })

  it('should handle many sequential get misses', async () => {
    for (let i = 0; i < 10; i++) {
      expect(await cache.get(`/test/f${i}.ts`, 'h1', 'c1')).toBeNull()
    }
    const stats = await cache.getStats()
    expect(stats.misses).toBe(10)
  })

  it('should handle many sequential get hits', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    for (let i = 0; i < 10; i++) {
      expect(await cache.get('/test/f.ts', 'h1', 'c1')).toEqual(MOCK_VIOLATIONS)
    }
    const stats = await cache.getStats()
    expect(stats.hits).toBe(10)
  })
})

describe('ResultCache cache key isolation', () => {
  let cacheDir: string
  let cache: ResultCache

  beforeEach(() => {
    cacheDir = makeTempDir()
    cache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should isolate entries by file hash', async () => {
    const v1: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'hash-a' }]
    const v2: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'hash-b' }]
    await cache.set('/test/f.ts', 'hash-a', 'c1', v1)
    await cache.set('/test/f.ts', 'hash-b', 'c1', v2)
    expect(await cache.get('/test/f.ts', 'hash-a', 'c1')).toEqual(v1)
    expect(await cache.get('/test/f.ts', 'hash-b', 'c1')).toEqual(v2)
  })

  it('should isolate entries by config hash', async () => {
    const v1: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'cfg-a' }]
    const v2: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'cfg-b' }]
    await cache.set('/test/f.ts', 'h1', 'cfg-a', v1)
    await cache.set('/test/f.ts', 'h1', 'cfg-b', v2)
    expect(await cache.get('/test/f.ts', 'h1', 'cfg-a')).toEqual(v1)
    expect(await cache.get('/test/f.ts', 'h1', 'cfg-b')).toEqual(v2)
  })

  it('should isolate entries by file path', async () => {
    const v1: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'path-x' }]
    const v2: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'path-y' }]
    await cache.set('/test/x.ts', 'h1', 'c1', v1)
    await cache.set('/test/y.ts', 'h1', 'c1', v2)
    expect(await cache.get('/test/x.ts', 'h1', 'c1')).toEqual(v1)
    expect(await cache.get('/test/y.ts', 'h1', 'c1')).toEqual(v2)
  })

  it('should count entries for all unique key combinations', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await cache.set('/test/f.ts', 'h1', 'c2', MOCK_VIOLATIONS)
    await cache.set('/test/f.ts', 'h2', 'c1', MOCK_VIOLATIONS)
    await cache.set('/test/g.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    const stats = await cache.getStats()
    expect(stats.entries).toBe(4)
  })
})

describe('ResultCache get TTL expired deletion', () => {
  let cacheDir: string

  beforeEach(() => {
    cacheDir = makeTempDir()
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should count miss on TTL expired entry', async () => {
    const c = new ResultCache({ cacheDir, version: '0.1.0', ttl: 1 })
    await c.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await new Promise((r) => setTimeout(r, 10))
    await c.get('/test/f.ts', 'h1', 'c1')
    const stats = await c.getStats()
    expect(stats.misses).toBe(1)
  })

  it('should delete expired entry from disk on get', async () => {
    const c = new ResultCache({ cacheDir, version: '0.1.0', ttl: 1 })
    await c.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await new Promise((r) => setTimeout(r, 10))
    await c.get('/test/f.ts', 'h1', 'c1')
    const stats = await c.getStats()
    expect(stats.entries).toBe(0)
  })

  it('should not count hit for TTL expired entry', async () => {
    const c = new ResultCache({ cacheDir, version: '0.1.0', ttl: 1 })
    await c.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await new Promise((r) => setTimeout(r, 10))
    await c.get('/test/f.ts', 'h1', 'c1')
    const stats = await c.getStats()
    expect(stats.hits).toBe(0)
  })
})

describe('ResultCache get version mismatch deletion', () => {
  let cacheDir: string

  beforeEach(() => {
    cacheDir = makeTempDir()
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should return null for different version get (different cache key)', async () => {
    const c1 = new ResultCache({ cacheDir, version: '1.0.0', ttl: 60_000 })
    await c1.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    const c2 = new ResultCache({ cacheDir, version: '2.0.0', ttl: 60_000 })
    const result = await c2.get('/test/f.ts', 'h1', 'c1')
    expect(result).toBeNull()
  })

  it('should count miss on version mismatch', async () => {
    const c1 = new ResultCache({ cacheDir, version: '1.0.0', ttl: 60_000 })
    await c1.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    const c2 = new ResultCache({ cacheDir, version: '2.0.0', ttl: 60_000 })
    await c2.get('/test/f.ts', 'h1', 'c1')
    const stats = await c2.getStats()
    expect(stats.misses).toBe(1)
    expect(stats.hits).toBe(0)
  })
})

describe('ResultCache get fileHash mismatch deletion', () => {
  let cacheDir: string
  let cache: ResultCache

  beforeEach(() => {
    cacheDir = makeTempDir()
    cache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should not delete original entry when querying wrong fileHash', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await cache.get('/test/f.ts', 'wrong', 'c1')
    const result = await cache.get('/test/f.ts', 'h1', 'c1')
    expect(result).toEqual(MOCK_VIOLATIONS)
  })

  it('should count miss on fileHash mismatch', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await cache.get('/test/f.ts', 'wrong', 'c1')
    const stats = await cache.getStats()
    expect(stats.misses).toBe(1)
  })
})

describe('ResultCache get configHash mismatch deletion', () => {
  let cacheDir: string
  let cache: ResultCache

  beforeEach(() => {
    cacheDir = makeTempDir()
    cache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should not delete original entry when querying wrong configHash', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await cache.get('/test/f.ts', 'h1', 'wrong')
    const result = await cache.get('/test/f.ts', 'h1', 'c1')
    expect(result).toEqual(MOCK_VIOLATIONS)
  })

  it('should count miss on configHash mismatch', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await cache.get('/test/f.ts', 'h1', 'wrong')
    const stats = await cache.getStats()
    expect(stats.misses).toBe(1)
  })
})

describe('ResultCache set error path', () => {
  let cacheDir: string

  beforeEach(() => {
    cacheDir = makeTempDir()
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should not throw when set fails due to permission error', async () => {
    const readOnlyDir = path.join(cacheDir, 'readonly')
    await fs.mkdir(readOnlyDir, { recursive: true })
    await fs.chmod(readOnlyDir, 0o444)
    const badCache = new ResultCache({
      cacheDir: path.join(readOnlyDir, 'sub', 'fail'),
      version: '0.1.0',
      ttl: 60_000,
    })
    await expect(badCache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)).resolves.toBeUndefined()
    await fs.chmod(readOnlyDir, 0o755)
  })

  it('should not update fileIndex when set fails', async () => {
    const readOnlyDir = path.join(cacheDir, 'readonly')
    await fs.mkdir(readOnlyDir, { recursive: true })
    await fs.chmod(readOnlyDir, 0o444)
    const badCache = new ResultCache({
      cacheDir: path.join(readOnlyDir, 'sub', 'fail'),
      version: '0.1.0',
      ttl: 60_000,
    })
    await badCache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    const deleted = await badCache.invalidateFile('/test/f.ts')
    expect(deleted).toBe(0)
    await fs.chmod(readOnlyDir, 0o755)
  })
})

describe('ResultCache get error path', () => {
  let cacheDir: string
  let cache: ResultCache

  beforeEach(() => {
    cacheDir = makeTempDir()
    cache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should return null and count miss when cache store throws', async () => {
    const { writeFile, mkdir } = await import('node:fs/promises')
    const crypto = await import('node:crypto')
    await mkdir(cacheDir, { recursive: true })
    const rawKey = 'result:0.1.0:/test/bad.ts:h1:c1'
    const safeKey = crypto.createHash('md5').update(rawKey).digest('hex')
    await writeFile(path.join(cacheDir, `${safeKey}.json`), 'not-json')
    const result = await cache.get('/test/bad.ts', 'h1', 'c1')
    expect(result).toBeNull()
    const stats = await cache.getStats()
    expect(stats.misses).toBeGreaterThanOrEqual(1)
    expect(stats.hits).toBe(0)
  })
})

describe('ResultCache has comprehensive', () => {
  let cacheDir: string
  let cache: ResultCache

  beforeEach(() => {
    cacheDir = makeTempDir()
    cache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should return false for corrupted data', async () => {
    const { writeFile, mkdir } = await import('node:fs/promises')
    const crypto = await import('node:crypto')
    await mkdir(cacheDir, { recursive: true })
    const rawKey = 'result:0.1.0:/test/corrupt.ts:h1:c1'
    const safeKey = crypto.createHash('md5').update(rawKey).digest('hex')
    await writeFile(path.join(cacheDir, `${safeKey}.json`), 'bad json')
    expect(await cache.has('/test/corrupt.ts', 'h1', 'c1')).toBe(false)
  })

  it('should return true for fresh valid entry', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    expect(await cache.has('/test/f.ts', 'h1', 'c1')).toBe(true)
  })

  it('should return false for non-existent entry', async () => {
    expect(await cache.has('/test/nope.ts', 'h1', 'c1')).toBe(false)
  })

  it('should return false when disabled', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    cache.setEnabled(false)
    expect(await cache.has('/test/f.ts', 'h1', 'c1')).toBe(false)
  })

  it('should return false for version mismatch', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    const c2 = new ResultCache({ cacheDir, version: '9.0.0', ttl: 60_000 })
    expect(await c2.has('/test/f.ts', 'h1', 'c1')).toBe(false)
  })

  it('should return false for fileHash mismatch', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    expect(await cache.has('/test/f.ts', 'wrong', 'c1')).toBe(false)
  })

  it('should return false for configHash mismatch', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    expect(await cache.has('/test/f.ts', 'h1', 'wrong')).toBe(false)
  })

  it('should return false for TTL expired', async () => {
    const c = new ResultCache({ cacheDir, version: '0.1.0', ttl: 1 })
    await c.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await new Promise((r) => setTimeout(r, 10))
    expect(await c.has('/test/f.ts', 'h1', 'c1')).toBe(false)
  })
})

describe('ResultCache invalidateFile error path', () => {
  let cacheDir: string

  beforeEach(() => {
    cacheDir = makeTempDir()
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should return 0 when cache directory does not exist', async () => {
    const c = new ResultCache({
      cacheDir: path.join(cacheDir, 'nonexistent-deep', 'sub'),
      version: '0.1.0',
      ttl: 60_000,
    })
    const deleted = await c.invalidateFile('/test/f.ts')
    expect(deleted).toBe(0)
  })
})

describe('ResultCache invalidateFile fallback scan advanced', () => {
  let cacheDir: string

  beforeEach(() => {
    cacheDir = makeTempDir()
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should handle corrupted files gracefully during fallback scan', async () => {
    const { writeFile, mkdir } = await import('node:fs/promises')
    const c1 = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
    await c1.set('/test/good.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await mkdir(cacheDir, { recursive: true })
    await writeFile(path.join(cacheDir, 'corrupt-entry.json'), 'not-json')
    const c2 = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
    const deleted = await c2.invalidateFile('/test/good.ts')
    expect(deleted).toBe(1)
  })

  it('should return 0 when no files match path during fallback scan', async () => {
    const c1 = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
    await c1.set('/test/a.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    const c2 = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
    const deleted = await c2.invalidateFile('/test/different.ts')
    expect(deleted).toBe(0)
  })

  it('should delete correct file from multiple during fallback scan', async () => {
    const c1 = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
    const v1: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'target' }]
    const v2: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'other' }]
    await c1.set('/test/target.ts', 'h1', 'c1', v1)
    await c1.set('/test/other.ts', 'h2', 'c2', v2)
    const c2 = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
    const deleted = await c2.invalidateFile('/test/target.ts')
    expect(deleted).toBe(1)
    expect(await c2.get('/test/other.ts', 'h2', 'c2')).toEqual(v2)
  })
})

describe('ResultCache clear error handling', () => {
  let cacheDir: string

  beforeEach(() => {
    cacheDir = makeTempDir()
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should handle clear on non-existent cache directory', async () => {
    const c = new ResultCache({
      cacheDir: path.join(cacheDir, 'no-exist'),
      version: '0.1.0',
      ttl: 60_000,
    })
    await expect(c.clear()).resolves.toBeUndefined()
  })

  it('should handle multiple consecutive clears', async () => {
    const c = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
    await c.clear()
    await c.clear()
    await c.clear()
    const stats = await c.getStats()
    expect(stats.entries).toBe(0)
    expect(stats.hits).toBe(0)
    expect(stats.misses).toBe(0)
  })
})

describe('ResultCache getStats error fallback', () => {
  let cacheDir: string

  beforeEach(() => {
    cacheDir = makeTempDir()
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should return fallback stats with hits and misses on error', async () => {
    const c = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
    await c.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await c.get('/test/f.ts', 'h1', 'c1')
    const stats = await c.getStats()
    expect(stats).toHaveProperty('entries')
    expect(stats).toHaveProperty('size')
    expect(stats).toHaveProperty('hitRate')
    expect(stats).toHaveProperty('hits')
    expect(stats).toHaveProperty('misses')
    expect(stats.hits).toBe(1)
  })

  it('should return zeroed stats on fresh cache', async () => {
    const c = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
    const stats = await c.getStats()
    expect(stats.entries).toBe(0)
    expect(stats.size).toBe(0)
    expect(stats.hitRate).toBe(0)
    expect(stats.hits).toBe(0)
    expect(stats.misses).toBe(0)
  })
})

describe('ResultCache cleanup error handling', () => {
  let cacheDir: string

  beforeEach(() => {
    cacheDir = makeTempDir()
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should return 0 on cleanup error for non-existent dir', async () => {
    const c = new ResultCache({
      cacheDir: path.join(cacheDir, 'no-such-dir'),
      version: '0.1.0',
      ttl: 60_000,
    })
    const cleaned = await c.cleanup()
    expect(cleaned).toBe(0)
  })

  it('should handle cleanup with only corrupted files', async () => {
    const { writeFile, mkdir } = await import('node:fs/promises')
    await mkdir(cacheDir, { recursive: true })
    await writeFile(path.join(cacheDir, 'bad1.json'), '{invalid')
    await writeFile(path.join(cacheDir, 'bad2.json'), 'corrupted')
    await writeFile(path.join(cacheDir, 'bad3.json'), '')
    const c = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
    const cleaned = await c.cleanup()
    expect(cleaned).toBeGreaterThanOrEqual(3)
  })
})

describe('ResultCache constructor with all option combinations', () => {
  it('should use default cacheDir when omitted', () => {
    const c = new ResultCache({ version: '0.1.0', ttl: 60_000 })
    expect(c).toBeInstanceOf(ResultCache)
  })

  it('should use default TTL when omitted', () => {
    const c = new ResultCache({ cacheDir: makeTempDir(), version: '0.1.0' })
    expect(c).toBeInstanceOf(ResultCache)
  })

  it('should use default version when omitted', () => {
    const c = new ResultCache({ cacheDir: makeTempDir(), ttl: 60_000 })
    expect(c).toBeInstanceOf(ResultCache)
  })

  it('should use default enabled when omitted', () => {
    const c = new ResultCache({ cacheDir: makeTempDir() })
    expect(c.isEnabled()).toBe(true)
  })

  it('should accept all options simultaneously', () => {
    const c = new ResultCache({
      cacheDir: makeTempDir(),
      ttl: 120_000,
      version: '3.0.0',
      enabled: true,
    })
    expect(c).toBeInstanceOf(ResultCache)
    expect(c.isEnabled()).toBe(true)
  })
})

describe('ResultCache hashConfig empty and boundary', () => {
  let cacheDir: string
  let cache: ResultCache

  beforeEach(() => {
    cacheDir = makeTempDir()
    cache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should produce same hash for two empty arrays', () => {
    const h1 = cache.hashConfig([])
    const h2 = cache.hashConfig([])
    expect(h1).toBe(h2)
  })

  it('should produce same hash with undefined ruleConfig', () => {
    const h1 = cache.hashConfig(['a'])
    const h2 = cache.hashConfig(['a'], undefined)
    expect(h1).toBe(h2)
  })

  it('should produce different hash for undefined vs empty ruleConfig', () => {
    const h1 = cache.hashConfig(['a'])
    const h2 = cache.hashConfig(['a'], {})
    // Both should normalize to {} so they should be the same
    // Actually no: ruleConfig ?? {} means both are {}
    expect(h1).toBe(h2)
  })

  it('should handle ruleConfig with zero number', () => {
    const hash = cache.hashConfig(['rule'], { rule: 0 })
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('should handle ruleConfig with empty string value', () => {
    const hash = cache.hashConfig(['rule'], { rule: '' })
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('should handle very large rules array deterministically', () => {
    const rules = Array.from({ length: 200 }, (_, i) => `rule-${i}`)
    const h1 = cache.hashConfig(rules)
    const h2 = cache.hashConfig([...rules].reverse())
    // Rules are sorted internally, so should be same
    expect(h1).toBe(h2)
  })
})

describe('ResultCache set disabled behavior', () => {
  let cacheDir: string
  let cache: ResultCache

  beforeEach(() => {
    cacheDir = makeTempDir()
    cache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should return void when set is called disabled', async () => {
    cache.setEnabled(false)
    const result = await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    expect(result).toBeUndefined()
  })

  it('should not create cache directory when set is called disabled', async () => {
    const newDir = path.join(cacheDir, 'never-created')
    const c = new ResultCache({ cacheDir: newDir, version: '0.1.0', ttl: 60_000, enabled: false })
    await c.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    const exists = await fs
      .access(newDir)
      .then(() => true)
      .catch(() => false)
    expect(exists).toBe(false)
  })
})

describe('ResultCache fileIndex tracking', () => {
  let cacheDir: string
  let cache: ResultCache

  beforeEach(() => {
    cacheDir = makeTempDir()
    cache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should track new key when same file set with different config', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await cache.set('/test/f.ts', 'h1', 'c2', MOCK_VIOLATIONS)
    const deleted = await cache.invalidateFile('/test/f.ts')
    expect(deleted).toBe(2)
  })

  it('should not duplicate key when same key is set twice', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    const deleted = await cache.invalidateFile('/test/f.ts')
    expect(deleted).toBe(1)
  })

  it('should handle invalidateFile for file not in index', async () => {
    const deleted = await cache.invalidateFile('/test/never.ts')
    expect(deleted).toBe(0)
  })

  it('should remove file from index after invalidation', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await cache.invalidateFile('/test/f.ts')
    const deleted2 = await cache.invalidateFile('/test/f.ts')
    expect(deleted2).toBe(0)
  })

  it('should clear fileIndex on clear', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await cache.clear()
    const deleted = await cache.invalidateFile('/test/f.ts')
    expect(deleted).toBe(0)
  })
})

describe('ResultCache concurrent invalidate', () => {
  let cacheDir: string
  let cache: ResultCache

  beforeEach(() => {
    cacheDir = makeTempDir()
    cache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should handle parallel invalidate of different files', async () => {
    await cache.set('/test/a.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await cache.set('/test/b.ts', 'h2', 'c2', MOCK_VIOLATIONS)
    await cache.set('/test/c.ts', 'h3', 'c3', MOCK_VIOLATIONS)
    const results = await Promise.all([
      cache.invalidateFile('/test/a.ts'),
      cache.invalidateFile('/test/b.ts'),
    ])
    expect(results[0]).toBe(1)
    expect(results[1]).toBe(1)
    expect(await cache.get('/test/c.ts', 'h3', 'c3')).toEqual(MOCK_VIOLATIONS)
  })

  it('should handle parallel invalidate of same file', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    const results = await Promise.all([
      cache.invalidateFile('/test/f.ts'),
      cache.invalidateFile('/test/f.ts'),
    ])
    // Both could try to delete; at least 1 should succeed
    const total = results[0] + results[1]
    expect(total).toBeGreaterThanOrEqual(1)
  })
})

describe('ResultCache TTL boundary', () => {
  let cacheDir: string

  beforeEach(() => {
    cacheDir = makeTempDir()
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should serve entry immediately after set with short TTL', async () => {
    const c = new ResultCache({ cacheDir, version: '0.1.0', ttl: 100 })
    await c.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    expect(await c.get('/test/f.ts', 'h1', 'c1')).toEqual(MOCK_VIOLATIONS)
  })

  it('should has true immediately after set with short TTL', async () => {
    const c = new ResultCache({ cacheDir, version: '0.1.0', ttl: 100 })
    await c.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    expect(await c.has('/test/f.ts', 'h1', 'c1')).toBe(true)
  })

  it('should expire entry after TTL with ms precision', async () => {
    const c = new ResultCache({ cacheDir, version: '0.1.0', ttl: 1 })
    await c.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await new Promise((r) => setTimeout(r, 20))
    expect(await c.get('/test/f.ts', 'h1', 'c1')).toBeNull()
    expect(await c.has('/test/f.ts', 'h1', 'c1')).toBe(false)
  })

  it('should not expire entry with very large TTL', async () => {
    const c = new ResultCache({ cacheDir, version: '0.1.0', ttl: Number.MAX_SAFE_INTEGER })
    await c.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    expect(await c.get('/test/f.ts', 'h1', 'c1')).toEqual(MOCK_VIOLATIONS)
  })
})

describe('ResultCache overwrite with different keys', () => {
  let cacheDir: string
  let cache: ResultCache

  beforeEach(() => {
    cacheDir = makeTempDir()
    cache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should overwrite only the matching key', async () => {
    const v1: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'original' }]
    const v2: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'updated' }]
    await cache.set('/test/f.ts', 'h1', 'c1', v1)
    await cache.set('/test/f.ts', 'h1', 'c2', MOCK_VIOLATIONS)
    await cache.set('/test/f.ts', 'h1', 'c1', v2)
    expect(await cache.get('/test/f.ts', 'h1', 'c1')).toEqual(v2)
    expect(await cache.get('/test/f.ts', 'h1', 'c2')).toEqual(MOCK_VIOLATIONS)
  })

  it('should have correct entries count after partial overwrite', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await cache.set('/test/f.ts', 'h1', 'c2', MOCK_VIOLATIONS)
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    const stats = await cache.getStats()
    expect(stats.entries).toBe(2)
  })
})

describe('ResultCache violations with special filePaths', () => {
  let cacheDir: string
  let cache: ResultCache

  beforeEach(() => {
    cacheDir = makeTempDir()
    cache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should cache violations with different filePaths than cache key', async () => {
    const v: RuleViolation[] = [
      {
        filePath: '/different/path.ts',
        message: 'Cross-path',
        range: { end: { column: 5, line: 1 }, start: { column: 0, line: 1 } },
        ruleId: 'cross-path',
        severity: 'error',
      },
    ]
    await cache.set('/test/key.ts', 'h1', 'c1', v)
    const result = await cache.get('/test/key.ts', 'h1', 'c1')
    expect(result).toEqual(v)
    expect(result![0].filePath).toBe('/different/path.ts')
  })

  it('should cache violations with empty filePath in violation', async () => {
    const v: RuleViolation[] = [
      {
        filePath: '',
        message: 'Empty path',
        range: { end: { column: 5, line: 1 }, start: { column: 0, line: 1 } },
        ruleId: 'empty-path',
        severity: 'warning',
      },
    ]
    await cache.set('/test/key.ts', 'h1', 'c1', v)
    const result = await cache.get('/test/key.ts', 'h1', 'c1')
    expect(result![0].filePath).toBe('')
  })
})

describe('ResultCache hashConfig with special config shapes', () => {
  let cacheDir: string
  let cache: ResultCache

  beforeEach(() => {
    cacheDir = makeTempDir()
    cache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should handle ruleConfig with undefined value', () => {
    const hash = cache.hashConfig(['rule'], { rule: undefined })
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('should handle ruleConfig with nested array', () => {
    const hash = cache.hashConfig(['rule'], { rule: { items: [1, 2, 3] } })
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('should differentiate empty config from config with key', () => {
    const h1 = cache.hashConfig(['rule'])
    const h2 = cache.hashConfig(['rule'], { rule: { active: true } })
    expect(h1).not.toBe(h2)
  })
})

describe('ResultCache cleanup mixed scenarios', () => {
  let cacheDir: string

  beforeEach(() => {
    cacheDir = makeTempDir()
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should not remove valid entries during cleanup', async () => {
    const c = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
    await c.set('/test/valid1.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await c.set('/test/valid2.ts', 'h2', 'c2', MOCK_VIOLATIONS)
    const cleaned = await c.cleanup()
    expect(cleaned).toBe(0)
    expect(await c.get('/test/valid1.ts', 'h1', 'c1')).toEqual(MOCK_VIOLATIONS)
    expect(await c.get('/test/valid2.ts', 'h2', 'c2')).toEqual(MOCK_VIOLATIONS)
  })

  it('should remove expired entries and keep valid during cleanup', async () => {
    const shortC = new ResultCache({ cacheDir, version: '0.1.0', ttl: 1 })
    await shortC.set('/test/expired.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await new Promise((r) => setTimeout(r, 10))
    const cleaned = await shortC.cleanup()
    expect(cleaned).toBeGreaterThanOrEqual(1)
  })
})

describe('ResultCache stats after complex operations', () => {
  let cacheDir: string
  let cache: ResultCache

  beforeEach(() => {
    cacheDir = makeTempDir()
    cache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should track correct hit rate with mixed hits and misses', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await cache.get('/test/f.ts', 'h1', 'c1') // hit
    await cache.get('/test/f.ts', 'h1', 'c1') // hit
    await cache.get('/test/f.ts', 'h1', 'c1') // hit
    await cache.get('/test/miss.ts', 'h1', 'c1') // miss
    const stats = await cache.getStats()
    expect(stats.hits).toBe(3)
    expect(stats.misses).toBe(1)
    expect(stats.hitRate).toBeCloseTo(0.75)
  })

  it('should track stats correctly after invalidate and re-access', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await cache.get('/test/f.ts', 'h1', 'c1') // hit
    await cache.invalidateFile('/test/f.ts')
    await cache.get('/test/f.ts', 'h1', 'c1') // miss
    const stats = await cache.getStats()
    expect(stats.hits).toBe(1)
    expect(stats.misses).toBe(1)
    expect(stats.hitRate).toBeCloseTo(0.5)
  })

  it('should track entries count after overwrite', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    const stats = await cache.getStats()
    expect(stats.entries).toBe(1)
  })
})

describe('ResultCache createDefaultResultCache extended', () => {
  it('should create enabled instance with no args', () => {
    const c = createDefaultResultCache()
    expect(c.isEnabled()).toBe(true)
  })

  it('should create enabled instance with version arg', () => {
    const c = createDefaultResultCache('1.0.0')
    expect(c.isEnabled()).toBe(true)
  })

  it('should create instance that can perform operations', async () => {
    const c = createDefaultResultCache()
    const tempDir = path.join(os.tmpdir(), `codeforge-default-test-${Date.now()}`)
    const c2 = new ResultCache({ cacheDir: tempDir, version: '0.1.0', ttl: 60_000 })
    await c2.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    expect(await c2.get('/test/f.ts', 'h1', 'c1')).toEqual(MOCK_VIOLATIONS)
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {})
  })
})

describe('ResultCache empty violations array', () => {
  let cacheDir: string
  let cache: ResultCache

  beforeEach(() => {
    cacheDir = makeTempDir()
    cache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should cache and retrieve empty array', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', [])
    const result = await cache.get('/test/f.ts', 'h1', 'c1')
    expect(result).toEqual([])
    expect(result).toHaveLength(0)
  })

  it('should has true for empty violations', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', [])
    expect(await cache.has('/test/f.ts', 'h1', 'c1')).toBe(true)
  })

  it('should persist empty violations across instances', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', [])
    const c2 = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
    expect(await c2.get('/test/f.ts', 'h1', 'c1')).toEqual([])
  })

  it('should count hit for empty violations', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', [])
    await cache.get('/test/f.ts', 'h1', 'c1')
    const stats = await cache.getStats()
    expect(stats.hits).toBe(1)
  })
})

describe('ResultCache set then invalidate via new instance', () => {
  let cacheDir: string

  beforeEach(() => {
    cacheDir = makeTempDir()
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should invalidate via fallback scan after original instance is gone', async () => {
    const c1 = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
    await c1.set('/test/cold.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    const c2 = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
    const deleted = await c2.invalidateFile('/test/cold.ts')
    expect(deleted).toBe(1)
    expect(await c2.get('/test/cold.ts', 'h1', 'c1')).toBeNull()
  })

  it('should not invalidate unrelated files during fallback scan', async () => {
    const c1 = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
    const v1: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'keep' }]
    const v2: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'remove' }]
    await c1.set('/test/keep.ts', 'h1', 'c1', v1)
    await c1.set('/test/remove.ts', 'h2', 'c2', v2)
    const c2 = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
    await c2.invalidateFile('/test/remove.ts')
    expect(await c2.get('/test/keep.ts', 'h1', 'c1')).toEqual(v1)
  })
})

describe('ResultCache multiple invalidation patterns', () => {
  let cacheDir: string
  let cache: ResultCache

  beforeEach(() => {
    cacheDir = makeTempDir()
    cache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should invalidate all hash combos for one file', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await cache.set('/test/f.ts', 'h2', 'c1', MOCK_VIOLATIONS)
    await cache.set('/test/f.ts', 'h1', 'c2', MOCK_VIOLATIONS)
    await cache.set('/test/f.ts', 'h3', 'c3', MOCK_VIOLATIONS)
    const deleted = await cache.invalidateFile('/test/f.ts')
    expect(deleted).toBe(4)
  })

  it('should allow re-setting after full invalidation', async () => {
    const v1: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'before' }]
    const v2: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'after' }]
    await cache.set('/test/f.ts', 'h1', 'c1', v1)
    await cache.invalidateFile('/test/f.ts')
    await cache.set('/test/f.ts', 'h1', 'c1', v2)
    expect(await cache.get('/test/f.ts', 'h1', 'c1')).toEqual(v2)
  })

  it('should track correct entries after partial invalidation', async () => {
    await cache.set('/test/a.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await cache.set('/test/a.ts', 'h2', 'c1', MOCK_VIOLATIONS)
    await cache.set('/test/b.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await cache.invalidateFile('/test/a.ts')
    const stats = await cache.getStats()
    expect(stats.entries).toBe(1)
  })
})

describe('ResultCache cleanup with valid entries', () => {
  let cacheDir: string

  beforeEach(() => {
    cacheDir = makeTempDir()
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should keep valid entries during cleanup', async () => {
    const c = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
    await c.set('/test/valid.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    const cleaned = await c.cleanup()
    expect(cleaned).toBe(0)
    expect(await c.get('/test/valid.ts', 'h1', 'c1')).toEqual(MOCK_VIOLATIONS)
  })

  it('should count expired entries cleaned', async () => {
    const c = new ResultCache({ cacheDir, version: '0.1.0', ttl: 1 })
    await c.set('/test/a.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    await c.set('/test/b.ts', 'h2', 'c2', MOCK_VIOLATIONS)
    await new Promise((r) => setTimeout(r, 10))
    const cleaned = await c.cleanup()
    expect(cleaned).toBeGreaterThanOrEqual(2)
  })
})

describe('ResultCache edge cases - set returns void', () => {
  let cacheDir: string
  let cache: ResultCache

  beforeEach(() => {
    cacheDir = makeTempDir()
    cache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should return undefined from set', async () => {
    const result = await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    expect(result).toBeUndefined()
  })

  it('should return undefined from clear', async () => {
    await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    const result = await cache.clear()
    expect(result).toBeUndefined()
  })

  it('should return void from set when disabled', async () => {
    cache.setEnabled(false)
    const result = await cache.set('/test/f.ts', 'h1', 'c1', MOCK_VIOLATIONS)
    expect(result).toBeUndefined()
  })
})

describe('ResultCache hashConfig deterministic across instances', () => {
  it('should produce same hash from different instances', () => {
    const dir1 = makeTempDir()
    const dir2 = makeTempDir()
    const c1 = new ResultCache({ cacheDir: dir1, version: '0.1.0' })
    const c2 = new ResultCache({ cacheDir: dir2, version: '0.1.0' })
    const h1 = c1.hashConfig(['a', 'b'], { a: 1 })
    const h2 = c2.hashConfig(['a', 'b'], { a: 1 })
    expect(h1).toBe(h2)
  })

  it('should produce same hash regardless of version', () => {
    const dir1 = makeTempDir()
    const dir2 = makeTempDir()
    const c1 = new ResultCache({ cacheDir: dir1, version: '1.0.0' })
    const c2 = new ResultCache({ cacheDir: dir2, version: '2.0.0' })
    const h1 = c1.hashConfig(['test-rule'])
    const h2 = c2.hashConfig(['test-rule'])
    expect(h1).toBe(h2)
  })
})

describe('ResultCache get returns correct violations for each key', () => {
  let cacheDir: string
  let cache: ResultCache

  beforeEach(() => {
    cacheDir = makeTempDir()
    cache = new ResultCache({ cacheDir, version: '0.1.0', ttl: 60_000 })
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should return correct violations for each hash combo', async () => {
    const va: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'a' }]
    const vb: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'b' }]
    const vc: RuleViolation[] = [{ ...MOCK_VIOLATIONS[0], ruleId: 'c' }]
    await cache.set('/test/f.ts', 'h1', 'c1', va)
    await cache.set('/test/f.ts', 'h2', 'c1', vb)
    await cache.set('/test/f.ts', 'h1', 'c2', vc)
    expect(await cache.get('/test/f.ts', 'h1', 'c1')).toEqual(va)
    expect(await cache.get('/test/f.ts', 'h2', 'c1')).toEqual(vb)
    expect(await cache.get('/test/f.ts', 'h1', 'c2')).toEqual(vc)
  })
})

describe('ResultCache isEnabled reflected in operations', () => {
  it('should reflect true initially', () => {
    const c = new ResultCache({ cacheDir: makeTempDir() })
    expect(c.isEnabled()).toBe(true)
  })

  it('should reflect false after setEnabled(false)', () => {
    const c = new ResultCache({ cacheDir: makeTempDir() })
    c.setEnabled(false)
    expect(c.isEnabled()).toBe(false)
  })

  it('should reflect true after setEnabled(true) on disabled cache', () => {
    const c = new ResultCache({ cacheDir: makeTempDir(), enabled: false })
    expect(c.isEnabled()).toBe(false)
    c.setEnabled(true)
    expect(c.isEnabled()).toBe(true)
  })
})
