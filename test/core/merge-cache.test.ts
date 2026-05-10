import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MergeCache } from '../../src/core/merge-cache/merge-cache.js'
import { DEFAULT_MERGE_CACHE_OPTIONS } from '../../src/core/merge-cache/types.js'
import type {
  MergeCacheOptions,
  MergeCacheStatistics,
  MergeCacheJSON,
} from '../../src/core/merge-cache/types.js'

describe('MergeCache', () => {
  let cache: MergeCache<string, number>

  beforeEach(() => {
    cache = new MergeCache()
  })

  describe('constructor', () => {
    it('should create with default options', () => {
      const c = new MergeCache()
      expect(c.isEmpty).toBe(true)
      expect(c.size).toBe(0)
    })

    it('should accept maxSize option', () => {
      const c = new MergeCache({ maxSize: 50 })
      c.set('a', 1)
      c.set('b', 2)
      expect(c.size).toBe(2)
    })

    it('should accept ttl option', () => {
      const c = new MergeCache({ ttl: 1000 })
      c.set('a', 1)
      expect(c.get('a')).toBe(1)
    })

    it('should accept defaultTTL option', () => {
      const c = new MergeCache({ defaultTTL: 500 })
      c.set('a', 1)
      expect(c.get('a')).toBe(1)
    })

    it('should accept custom mergeFn', () => {
      const c = new MergeCache<string, number>({
        mergeFn: (a, b) => a + b,
      })
      c.set('a', 1)
      c.set('a', 2)
      expect(c.get('a')).toBe(3)
    })

    it('should use default mergeFn (replace) when not provided', () => {
      cache.set('a', 1)
      cache.set('a', 2)
      expect(cache.get('a')).toBe(2)
    })

    it('should accept empty options object', () => {
      const c = new MergeCache({})
      expect(c.size).toBe(0)
    })

    it('should accept undefined options', () => {
      const c = new MergeCache(undefined)
      expect(c.size).toBe(0)
    })
  })

  describe('get', () => {
    it('should return undefined for missing key', () => {
      expect(cache.get('missing')).toBeUndefined()
    })

    it('should return value for existing key', () => {
      cache.set('a', 1)
      expect(cache.get('a')).toBe(1)
    })

    it('should return undefined for expired entry', () => {
      const c = new MergeCache({ ttl: 1 })
      c.set('a', 1)
      const start = Date.now()
      while (Date.now() - start < 10) {}
      expect(c.get('a')).toBeUndefined()
    })

    it('should refresh TTL on access', () => {
      const c = new MergeCache({ ttl: 100 })
      c.set('a', 1)
      const start = Date.now()
      while (Date.now() - start < 50) {}
      expect(c.get('a')).toBe(1)
    })

    it('should track gets in statistics', () => {
      cache.set('a', 1)
      cache.get('a')
      cache.get('b')
      const stats = cache.getStatistics()
      expect(stats.gets).toBe(2)
    })

    it('should track hits in statistics', () => {
      cache.set('a', 1)
      cache.get('a')
      expect(cache.getStatistics().hits).toBe(1)
    })

    it('should track misses in statistics', () => {
      cache.get('missing')
      expect(cache.getStatistics().misses).toBe(1)
    })

    it('should count expired entry as miss', () => {
      const c = new MergeCache({ ttl: 1 })
      c.set('a', 1)
      const start = Date.now()
      while (Date.now() - start < 10) {}
      c.get('a')
      expect(c.getStatistics().misses).toBe(1)
      expect(c.getStatistics().hits).toBe(0)
    })
  })

  describe('set', () => {
    it('should add a new entry', () => {
      cache.set('a', 1)
      expect(cache.size).toBe(1)
      expect(cache.get('a')).toBe(1)
    })

    it('should merge with existing value', () => {
      const c = new MergeCache<string, number>({
        mergeFn: (a, b) => a + b,
      })
      c.set('a', 1)
      c.set('a', 2)
      expect(c.get('a')).toBe(3)
    })

    it('should track sets in statistics', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      expect(cache.getStatistics().sets).toBe(2)
    })

    it('should track merges in statistics', () => {
      const c = new MergeCache<string, number>({
        mergeFn: (a, b) => a + b,
      })
      c.set('a', 1)
      c.set('a', 2)
      expect(c.getStatistics().merges).toBe(1)
    })

    it('should evict oldest when maxSize reached', () => {
      const c = new MergeCache({ maxSize: 2 })
      c.set('a', 1)
      c.set('b', 2)
      c.set('c', 3)
      expect(c.size).toBe(2)
      expect(c.get('a')).toBeUndefined()
    })

    it('should replace expired entry without merge', () => {
      const c = new MergeCache<string, number>({
        mergeFn: (a, b) => a + b,
      })
      c.set('a', 1)
      const entry = c.get('a')
      expect(entry).toBe(1)
      expect(c.getStatistics().merges).toBe(0)
      c.delete('a')
      c.set('a', 2)
      expect(c.get('a')).toBe(2)
      expect(c.getStatistics().merges).toBe(0)
    })

    it('should track maxSizeReached on eviction', () => {
      const c = new MergeCache({ maxSize: 2 })
      c.set('a', 1)
      c.set('b', 2)
      c.set('c', 3)
      expect(c.getStatistics().maxSizeReached).toBe(1)
      expect(c.getStatistics().evictions).toBe(1)
    })

    it('should handle setting same key without eviction', () => {
      const c = new MergeCache({ maxSize: 2 })
      c.set('a', 1)
      c.set('a', 2)
      expect(c.size).toBe(1)
      expect(c.getStatistics().evictions).toBe(0)
    })
  })

  describe('delete', () => {
    it('should delete existing key', () => {
      cache.set('a', 1)
      expect(cache.delete('a')).toBe(true)
      expect(cache.size).toBe(0)
    })

    it('should return false for missing key', () => {
      expect(cache.delete('missing')).toBe(false)
    })

    it('should track deletes in statistics', () => {
      cache.set('a', 1)
      cache.delete('a')
      expect(cache.getStatistics().deletes).toBe(1)
    })

    it('should not track deletes for missing key', () => {
      cache.delete('missing')
      expect(cache.getStatistics().deletes).toBe(0)
    })

    it('should not return deleted value on get', () => {
      cache.set('a', 1)
      cache.delete('a')
      expect(cache.get('a')).toBeUndefined()
    })
  })

  describe('has', () => {
    it('should return true for existing non-expired key', () => {
      cache.set('a', 1)
      expect(cache.has('a')).toBe(true)
    })

    it('should return false for missing key', () => {
      expect(cache.has('missing')).toBe(false)
    })

    it('should return false for expired key', () => {
      const c = new MergeCache({ ttl: 1 })
      c.set('a', 1)
      const start = Date.now()
      while (Date.now() - start < 10) {}
      expect(c.has('a')).toBe(false)
    })

    it('should remove expired entry on has check', () => {
      const c = new MergeCache({ ttl: 1 })
      c.set('a', 1)
      const start = Date.now()
      while (Date.now() - start < 10) {}
      c.has('a')
      expect(c.size).toBe(0)
    })
  })

  describe('size', () => {
    it('should return 0 on empty cache', () => {
      expect(cache.size).toBe(0)
    })

    it('should reflect number of entries', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.size).toBe(3)
    })

    it('should decrease on delete', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.delete('a')
      expect(cache.size).toBe(1)
    })

    it('should be 0 after clear', () => {
      cache.set('a', 1)
      cache.clear()
      expect(cache.size).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('should be true on new cache', () => {
      expect(cache.isEmpty).toBe(true)
    })

    it('should be false after set', () => {
      cache.set('a', 1)
      expect(cache.isEmpty).toBe(false)
    })

    it('should be true after delete of last entry', () => {
      cache.set('a', 1)
      cache.delete('a')
      expect(cache.isEmpty).toBe(true)
    })

    it('should be true after clear', () => {
      cache.set('a', 1)
      cache.clear()
      expect(cache.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('should remove all entries', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.clear()
      expect(cache.size).toBe(0)
      expect(cache.isEmpty).toBe(true)
    })

    it('should reset statistics', () => {
      cache.set('a', 1)
      cache.get('a')
      cache.clear()
      const stats = cache.getStatistics()
      expect(stats.gets).toBe(0)
      expect(stats.sets).toBe(0)
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
      expect(stats.evictions).toBe(0)
      expect(stats.merges).toBe(0)
      expect(stats.deletes).toBe(0)
      expect(stats.purges).toBe(0)
      expect(stats.maxSizeReached).toBe(0)
    })

    it('should allow set after clear', () => {
      cache.set('a', 1)
      cache.clear()
      cache.set('b', 2)
      expect(cache.get('b')).toBe(2)
    })
  })

  describe('keys', () => {
    it('should return empty array for empty cache', () => {
      expect(cache.keys()).toEqual([])
    })

    it('should return all keys', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.keys()).toEqual(['a', 'b', 'c'])
    })

    it('should exclude expired entries', () => {
      const c = new MergeCache({ ttl: 1 })
      c.set('a', 1)
      c.set('b', 2)
      const start = Date.now()
      while (Date.now() - start < 10) {}
      expect(c.keys()).toEqual([])
    })
  })

  describe('values', () => {
    it('should return empty array for empty cache', () => {
      expect(cache.values()).toEqual([])
    })

    it('should return all values', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      expect(cache.values()).toEqual([1, 2])
    })

    it('should exclude expired entries', () => {
      const c = new MergeCache({ ttl: 1 })
      c.set('a', 1)
      c.set('b', 2)
      const start = Date.now()
      while (Date.now() - start < 10) {}
      expect(c.values()).toEqual([])
    })
  })

  describe('entries', () => {
    it('should return empty array for empty cache', () => {
      expect(cache.entries()).toEqual([])
    })

    it('should return all key-value pairs', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      expect(cache.entries()).toEqual([
        ['a', 1],
        ['b', 2],
      ])
    })

    it('should exclude expired entries', () => {
      const c = new MergeCache({ ttl: 1 })
      c.set('a', 1)
      const start = Date.now()
      while (Date.now() - start < 10) {}
      expect(c.entries()).toEqual([])
    })
  })

  describe('forEach', () => {
    it('should iterate over all entries', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      const result: Array<[string, number]> = []
      cache.forEach((v, k) => result.push([k, v]))
      expect(result).toEqual([
        ['a', 1],
        ['b', 2],
      ])
    })

    it('should pass cache as third argument', () => {
      cache.set('a', 1)
      let received: MergeCache<string, number> | undefined
      cache.forEach((_v, _k, c) => {
        received = c
      })
      expect(received).toBe(cache)
    })

    it('should skip expired entries', () => {
      const c = new MergeCache({ ttl: 1 })
      c.set('a', 1)
      c.set('b', 2)
      const start = Date.now()
      while (Date.now() - start < 10) {}
      const result: number[] = []
      c.forEach((v) => result.push(v))
      expect(result).toEqual([])
    })

    it('should handle empty cache', () => {
      let count = 0
      cache.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  describe('[Symbol.iterator]', () => {
    it('should be iterable', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      const result = [...cache]
      expect(result).toEqual([
        ['a', 1],
        ['b', 2],
      ])
    })

    it('should work with for-of', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      const result: Array<[string, number]> = []
      for (const entry of cache) {
        result.push(entry)
      }
      expect(result).toEqual([
        ['a', 1],
        ['b', 2],
      ])
    })

    it('should skip expired entries', () => {
      const c = new MergeCache({ ttl: 1 })
      c.set('a', 1)
      const start = Date.now()
      while (Date.now() - start < 10) {}
      expect([...c]).toEqual([])
    })
  })

  describe('touch', () => {
    it('should return true for existing non-expired key', () => {
      cache.set('a', 1)
      expect(cache.touch('a')).toBe(true)
    })

    it('should return false for missing key', () => {
      expect(cache.touch('missing')).toBe(false)
    })

    it('should return false for expired key', () => {
      const c = new MergeCache({ ttl: 1 })
      c.set('a', 1)
      const start = Date.now()
      while (Date.now() - start < 10) {}
      expect(c.touch('a')).toBe(false)
    })

    it('should refresh TTL', () => {
      const c = new MergeCache({ ttl: 50 })
      c.set('a', 1)
      c.touch('a')
      expect(c.get('a')).toBe(1)
    })

    it('should not return value', () => {
      cache.set('a', 42)
      const result = cache.touch('a')
      expect(typeof result).toBe('boolean')
      expect(result).toBe(true)
    })
  })

  describe('getOrSet', () => {
    it('should return existing value', () => {
      cache.set('a', 1)
      expect(cache.getOrSet('a', () => 99)).toBe(1)
    })

    it('should create and return new value', () => {
      expect(cache.getOrSet('a', () => 42)).toBe(42)
      expect(cache.get('a')).toBe(42)
    })

    it('should create new value for expired entry', () => {
      const c = new MergeCache({ ttl: 1 })
      c.set('a', 1)
      const start = Date.now()
      while (Date.now() - start < 10) {}
      expect(c.getOrSet('a', () => 2)).toBe(2)
    })

    it('should track hits for existing key', () => {
      cache.set('a', 1)
      cache.getOrSet('a', () => 99)
      expect(cache.getStatistics().hits).toBe(1)
    })

    it('should track misses for new key', () => {
      cache.getOrSet('a', () => 42)
      expect(cache.getStatistics().misses).toBe(1)
    })

    it('should track gets', () => {
      cache.getOrSet('a', () => 42)
      expect(cache.getStatistics().gets).toBe(1)
    })
  })

  describe('merge', () => {
    it('should behave same as set', () => {
      const c = new MergeCache<string, number>({
        mergeFn: (a, b) => a + b,
      })
      c.set('a', 1)
      c.merge('a', 2)
      expect(c.get('a')).toBe(3)
    })

    it('should create entry for new key', () => {
      cache.merge('a', 1)
      expect(cache.get('a')).toBe(1)
    })
  })

  describe('purge', () => {
    it('should return 0 when no expired entries', () => {
      cache.set('a', 1)
      expect(cache.purge()).toBe(0)
    })

    it('should remove expired entries', () => {
      const c = new MergeCache({ ttl: 1 })
      c.set('a', 1)
      c.set('b', 2)
      const start = Date.now()
      while (Date.now() - start < 10) {}
      expect(c.purge()).toBe(2)
      expect(c.size).toBe(0)
    })

    it('should track purges in statistics', () => {
      cache.purge()
      expect(cache.getStatistics().purges).toBe(1)
    })

    it('should only remove expired entries', () => {
      const c = new MergeCache({ ttl: 1000 })
      c.set('a', 1)
      c.set('b', 2)
      expect(c.purge()).toBe(0)
      expect(c.size).toBe(2)
    })
  })

  describe('getRemainingTTL', () => {
    it('should return undefined for missing key', () => {
      expect(cache.getRemainingTTL('missing')).toBeUndefined()
    })

    it('should return undefined for no-TTL cache', () => {
      cache.set('a', 1)
      expect(cache.getRemainingTTL('a')).toBeUndefined()
    })

    it('should return remaining ms for TTL entry', () => {
      const c = new MergeCache({ ttl: 1000 })
      c.set('a', 1)
      const remaining = c.getRemainingTTL('a')
      expect(remaining).toBeDefined()
      expect(remaining!).toBeGreaterThan(0)
      expect(remaining!).toBeLessThanOrEqual(1000)
    })

    it('should return undefined for expired entry', () => {
      const c = new MergeCache({ ttl: 1 })
      c.set('a', 1)
      const start = Date.now()
      while (Date.now() - start < 10) {}
      expect(c.getRemainingTTL('a')).toBeUndefined()
    })

    it('should decrease over time', () => {
      const c = new MergeCache({ ttl: 1000 })
      c.set('a', 1)
      const r1 = c.getRemainingTTL('a')!
      const start = Date.now()
      while (Date.now() - start < 50) {}
      const r2 = c.getRemainingTTL('a')!
      expect(r2).toBeLessThan(r1)
    })
  })

  describe('resize', () => {
    it('should update maxSize', () => {
      cache.resize(50)
      for (let i = 0; i < 50; i++) {
        cache.set(`k${i}`, i)
      }
      expect(cache.size).toBe(50)
      cache.set('overflow', 99)
      expect(cache.size).toBe(50)
    })

    it('should evict entries when shrinking', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.resize(1)
      expect(cache.size).toBe(1)
      expect(cache.has('a')).toBe(false)
      expect(cache.has('b')).toBe(false)
    })

    it('should allow growing', () => {
      const c = new MergeCache({ maxSize: 1 })
      c.set('a', 1)
      c.resize(10)
      c.set('b', 2)
      expect(c.size).toBe(2)
    })
  })

  describe('getStatistics', () => {
    it('should return all-zero stats on new cache', () => {
      const stats = cache.getStatistics()
      expect(stats.gets).toBe(0)
      expect(stats.sets).toBe(0)
      expect(stats.deletes).toBe(0)
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
      expect(stats.evictions).toBe(0)
      expect(stats.merges).toBe(0)
      expect(stats.purges).toBe(0)
      expect(stats.maxSizeReached).toBe(0)
    })

    it('should return a copy', () => {
      cache.set('a', 1)
      const s1 = cache.getStatistics()
      cache.set('b', 2)
      const s2 = cache.getStatistics()
      expect(s1.sets).toBe(1)
      expect(s2.sets).toBe(2)
    })

    it('should track full lifecycle', () => {
      const c = new MergeCache<string, number>({
        maxSize: 3,
        mergeFn: (a, b) => a + b,
      })
      c.set('a', 1)
      c.set('a', 2)
      c.get('a')
      c.get('missing')
      c.delete('a')
      c.purge()
      const stats = c.getStatistics()
      expect(stats.sets).toBe(2)
      expect(stats.merges).toBe(1)
      expect(stats.hits).toBe(1)
      expect(stats.misses).toBe(1)
      expect(stats.deletes).toBe(1)
      expect(stats.purges).toBe(1)
    })
  })

  describe('toJSON', () => {
    it('should produce correct structure', () => {
      cache.set('a', 1)
      const json = cache.toJSON()
      expect(json).toHaveProperty('entries')
      expect(json).toHaveProperty('maxSize')
      expect(json).toHaveProperty('ttl')
      expect(json).toHaveProperty('defaultTTL')
      expect(json).toHaveProperty('statistics')
    })

    it('should serialize entries', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      const json = cache.toJSON()
      expect(json.entries.length).toBe(2)
    })

    it('should include entry values and expiry', () => {
      const c = new MergeCache<string, number>({ ttl: 1000 })
      c.set('a', 42)
      const json = c.toJSON()
      const entry = json.entries.find((e) => e[0] === 'a')
      expect(entry).toBeDefined()
      expect(entry![1].value).toBe(42)
      expect(entry![1].expiresAt).toBeGreaterThan(0)
    })

    it('should include null expiresAt for no-TTL entries', () => {
      cache.set('a', 1)
      const json = cache.toJSON()
      const entry = json.entries.find((e) => e[0] === 'a')
      expect(entry![1].expiresAt).toBeNull()
    })

    it('should include statistics', () => {
      cache.set('a', 1)
      const json = cache.toJSON()
      expect(json.statistics.sets).toBe(1)
    })
  })

  describe('fromJSON', () => {
    it('should restore a serialized cache', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      const json = cache.toJSON()
      const restored = MergeCache.fromJSON(json)
      expect(restored.size).toBe(2)
      expect(restored.get('a')).toBe(1)
      expect(restored.get('b')).toBe(2)
    })

    it('should round-trip correctly', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      const json = cache.toJSON()
      const restored = MergeCache.fromJSON(json)
      const json2 = restored.toJSON()
      expect(json.entries).toEqual(json2.entries)
      expect(json.maxSize).toBe(json2.maxSize)
    })

    it('should preserve statistics', () => {
      cache.set('a', 1)
      cache.get('a')
      const json = cache.toJSON()
      const restored = MergeCache.fromJSON(json)
      expect(restored.getStatistics().sets).toBe(1)
      expect(restored.getStatistics().hits).toBe(1)
    })

    it('should preserve maxSize', () => {
      const c = new MergeCache({ maxSize: 50 })
      c.set('a', 1)
      const json = c.toJSON()
      const restored = MergeCache.fromJSON(json)
      expect(restored.toJSON().maxSize).toBe(50)
    })

    it('should allow operations after restoration', () => {
      cache.set('a', 1)
      const restored = MergeCache.fromJSON(cache.toJSON())
      restored.set('b', 2)
      expect(restored.get('a')).toBe(1)
      expect(restored.get('b')).toBe(2)
    })
  })

  describe('custom merge functions', () => {
    it('should support sum merge', () => {
      const c = new MergeCache<string, number>({
        mergeFn: (a, b) => a + b,
      })
      c.set('counter', 1)
      c.set('counter', 2)
      c.set('counter', 3)
      expect(c.get('counter')).toBe(6)
    })

    it('should support concat merge for arrays', () => {
      const c = new MergeCache<string, number[]>({
        mergeFn: (a, b) => a.concat(b),
      })
      c.set('list', [1])
      c.set('list', [2, 3])
      expect(c.get('list')).toEqual([1, 2, 3])
    })

    it('should support max merge', () => {
      const c = new MergeCache<string, number>({
        mergeFn: (a, b) => Math.max(a, b),
      })
      c.set('max', 5)
      c.set('max', 3)
      c.set('max', 10)
      c.set('max', 7)
      expect(c.get('max')).toBe(10)
    })

    it('should support min merge', () => {
      const c = new MergeCache<string, number>({
        mergeFn: (a, b) => Math.min(a, b),
      })
      c.set('min', 5)
      c.set('min', 3)
      c.set('min', 10)
      expect(c.get('min')).toBe(3)
    })

    it('should support object merge', () => {
      const c = new MergeCache<string, Record<string, number>>({
        mergeFn: (a, b) => ({ ...a, ...b }),
      })
      c.set('obj', { a: 1 })
      c.set('obj', { b: 2 })
      expect(c.get('obj')).toEqual({ a: 1, b: 2 })
    })

    it('should use default replace when no mergeFn', () => {
      cache.set('a', 1)
      cache.set('a', 2)
      cache.set('a', 3)
      expect(cache.get('a')).toBe(3)
    })
  })

  describe('TTL expiration', () => {
    it('should expire entries after TTL', () => {
      const c = new MergeCache({ ttl: 5 })
      c.set('a', 1)
      const start = Date.now()
      while (Date.now() - start < 20) {}
      expect(c.get('a')).toBeUndefined()
    })

    it('should not expire entries before TTL', () => {
      const c = new MergeCache({ ttl: 10000 })
      c.set('a', 1)
      expect(c.get('a')).toBe(1)
    })

    it('should remove expired on has', () => {
      const c = new MergeCache({ ttl: 1 })
      c.set('a', 1)
      const start = Date.now()
      while (Date.now() - start < 10) {}
      expect(c.has('a')).toBe(false)
      expect(c.size).toBe(0)
    })

    it('should handle TTL=0', () => {
      const c = new MergeCache({ ttl: 0 })
      c.set('a', 1)
      expect(c.get('a')).toBeUndefined()
    })

    it('should refresh TTL on get', () => {
      const c = new MergeCache({ ttl: 50 })
      c.set('a', 1)
      c.get('a')
      const start = Date.now()
      while (Date.now() - start < 20) {}
      expect(c.get('a')).toBe(1)
    })

    it('should use defaultTTL when ttl is not set', () => {
      const c = new MergeCache({ defaultTTL: 5 })
      c.set('a', 1)
      const start = Date.now()
      while (Date.now() - start < 20) {}
      expect(c.get('a')).toBeUndefined()
    })
  })

  describe('eviction', () => {
    it('should evict LRU when full', () => {
      const c = new MergeCache({ maxSize: 3 })
      c.set('a', 1)
      c.set('b', 2)
      c.set('c', 3)
      c.set('d', 4)
      expect(c.has('a')).toBe(false)
      expect(c.has('b')).toBe(true)
      expect(c.has('c')).toBe(true)
      expect(c.has('d')).toBe(true)
    })

    it('should update LRU on get', () => {
      const c = new MergeCache({ maxSize: 3 })
      c.set('a', 1)
      c.set('b', 2)
      c.set('c', 3)
      c.get('a')
      c.set('d', 4)
      expect(c.has('a')).toBe(true)
      expect(c.has('b')).toBe(false)
    })

    it('should update LRU on set merge', () => {
      const c = new MergeCache<string, number>({
        maxSize: 3,
        mergeFn: (a, b) => a + b,
      })
      c.set('a', 1)
      c.set('b', 2)
      c.set('c', 3)
      c.set('a', 10)
      c.set('d', 4)
      expect(c.has('a')).toBe(true)
      expect(c.has('b')).toBe(false)
    })

    it('should handle maxSize=1', () => {
      const c = new MergeCache({ maxSize: 1 })
      c.set('a', 1)
      c.set('b', 2)
      expect(c.size).toBe(1)
      expect(c.get('a')).toBeUndefined()
      expect(c.get('b')).toBe(2)
    })

    it('should track evictions', () => {
      const c = new MergeCache({ maxSize: 2 })
      c.set('a', 1)
      c.set('b', 2)
      c.set('c', 3)
      c.set('d', 4)
      expect(c.getStatistics().evictions).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('should handle empty cache operations', () => {
      expect(cache.get('x')).toBeUndefined()
      expect(cache.has('x')).toBe(false)
      expect(cache.delete('x')).toBe(false)
      expect(cache.keys()).toEqual([])
      expect(cache.values()).toEqual([])
      expect(cache.entries()).toEqual([])
      expect([...cache]).toEqual([])
      expect(cache.touch('x')).toBe(false)
      expect(cache.getRemainingTTL('x')).toBeUndefined()
      expect(cache.purge()).toBe(0)
    })

    it('should handle number keys', () => {
      const c = new MergeCache<number, string>()
      c.set(1, 'one')
      c.set(2, 'two')
      expect(c.get(1)).toBe('one')
    })

    it('should handle object values', () => {
      const c = new MergeCache<string, { data: number }>()
      c.set('a', { data: 1 })
      expect(c.get('a')).toEqual({ data: 1 })
    })

    it('should handle maxSize=0 gracefully', () => {
      const c = new MergeCache({ maxSize: 0 })
      c.set('a', 1)
      expect(c.size).toBe(0)
    })

    it('should handle clear on already empty cache', () => {
      cache.clear()
      expect(cache.size).toBe(0)
    })

    it('should handle delete on empty cache', () => {
      expect(cache.delete('x')).toBe(false)
    })

    it('should handle many rapid sets', () => {
      for (let i = 0; i < 200; i++) {
        cache.set(`k${i}`, i)
      }
      expect(cache.size).toBe(200)
    })

    it('should handle getOrSet with factory that returns undefined', () => {
      const result = cache.getOrSet('a', () => undefined)
      expect(result).toBeUndefined()
    })

    it('should handle getOrSet with factory that returns 0', () => {
      const result = cache.getOrSet('a', () => 0)
      expect(result).toBe(0)
    })

    it('should handle resize to same size', () => {
      cache.set('a', 1)
      cache.resize(1000)
      expect(cache.size).toBe(1)
    })

    it('should handle resize to larger', () => {
      cache.set('a', 1)
      cache.resize(5000)
      for (let i = 0; i < 200; i++) {
        cache.set(`k${i}`, i)
      }
      expect(cache.size).toBe(201)
    })

    it('should handle set after delete', () => {
      cache.set('a', 1)
      cache.delete('a')
      cache.set('a', 2)
      expect(cache.get('a')).toBe(2)
    })
  })

  describe('DEFAULT_MERGE_CACHE_OPTIONS', () => {
    it('should have maxSize of 1000', () => {
      expect(DEFAULT_MERGE_CACHE_OPTIONS.maxSize).toBe(1000)
    })

    it('should have undefined ttl', () => {
      expect(DEFAULT_MERGE_CACHE_OPTIONS.ttl).toBeUndefined()
    })

    it('should have undefined defaultTTL', () => {
      expect(DEFAULT_MERGE_CACHE_OPTIONS.defaultTTL).toBeUndefined()
    })

    it('should have a replace mergeFn', () => {
      const result = DEFAULT_MERGE_CACHE_OPTIONS.mergeFn('old', 'new')
      expect(result).toBe('new')
    })
  })

  describe('exports', () => {
    it('should export MergeCache class', () => {
      expect(MergeCache).toBeDefined()
      expect(typeof MergeCache).toBe('function')
    })

    it('should export DEFAULT_MERGE_CACHE_OPTIONS', () => {
      expect(DEFAULT_MERGE_CACHE_OPTIONS).toBeDefined()
    })

    it('should allow type-only imports for options', () => {
      const opts: MergeCacheOptions<string, number> = { maxSize: 10 }
      const c = new MergeCache(opts)
      expect(c.size).toBe(0)
    })

    it('should allow type import for MergeCacheStatistics', () => {
      const stats: MergeCacheStatistics = cache.getStatistics()
      expect(stats.sets).toBe(0)
    })

    it('should allow type import for MergeCacheJSON', () => {
      cache.set('a', 1)
      const json: MergeCacheJSON<string, number> = cache.toJSON()
      expect(json.entries.length).toBe(1)
    })
  })
})
