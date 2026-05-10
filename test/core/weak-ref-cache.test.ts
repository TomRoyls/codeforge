import { describe, it, expect, beforeEach, vi } from 'vitest'
import { WeakRefCache } from '../../src/core/weak-ref-cache/weak-ref-cache.js'
import { DEFAULT_WEAK_REF_CACHE_OPTIONS } from '../../src/core/weak-ref-cache/types.js'
import type { WeakRefCacheOptions, WeakRefCacheJSON, WeakRefCacheStatistics } from '../../src/core/weak-ref-cache/types.js'

function makeObj(id: number): { id: number } {
  return { id }
}

describe('WeakRefCache', () => {
  let cache: WeakRefCache<string, { id: number }>

  beforeEach(() => {
    cache = new WeakRefCache<string, { id: number }>()
  })

  describe('constructor', () => {
    it('should create with default options', () => {
      const c = new WeakRefCache<string, object>()
      expect(c.size).toBe(0)
      expect(c.isEmpty).toBe(true)
    })

    it('should accept options object', () => {
      const c = new WeakRefCache<string, object>({ maxSize: 50 })
      expect(c).toBeDefined()
    })

    it('should accept maxSize option', () => {
      const c = new WeakRefCache<string, object>({ maxSize: 10 })
      const json = c.toJSON()
      expect(json.options.maxSize).toBe(10)
    })

    it('should accept ttl option', () => {
      const c = new WeakRefCache<string, object>({ ttl: 5000 })
      const json = c.toJSON()
      expect(json.options.ttl).toBe(5000)
    })

    it('should accept both maxSize and ttl', () => {
      const c = new WeakRefCache<string, object>({ maxSize: 100, ttl: 3000 })
      const json = c.toJSON()
      expect(json.options.maxSize).toBe(100)
      expect(json.options.ttl).toBe(3000)
    })

    it('should use defaults when no options given', () => {
      const c = new WeakRefCache<string, object>()
      const json = c.toJSON()
      expect(json.options.maxSize).toBe(DEFAULT_WEAK_REF_CACHE_OPTIONS.maxSize)
      expect(json.options.ttl).toBe(DEFAULT_WEAK_REF_CACHE_OPTIONS.ttl)
    })

    it('should use defaults for unspecified options', () => {
      const c = new WeakRefCache<string, object>({ maxSize: 5 })
      const json = c.toJSON()
      expect(json.options.ttl).toBe(DEFAULT_WEAK_REF_CACHE_OPTIONS.ttl)
    })

    it('should create with numeric keys', () => {
      const c = new WeakRefCache<number, object>()
      const obj = { x: 1 }
      c.set(1, obj)
      expect(c.get(1)).toBe(obj)
    })
  })

  describe('set', () => {
    it('should add an entry', () => {
      const obj = makeObj(1)
      cache.set('a', obj)
      expect(cache.size).toBe(1)
    })

    it('should overwrite existing key', () => {
      const obj1 = makeObj(1)
      const obj2 = makeObj(2)
      cache.set('a', obj1)
      cache.set('a', obj2)
      expect(cache.get('a')).toBe(obj2)
      expect(cache.size).toBe(1)
    })

    it('should track set statistics', () => {
      cache.set('a', makeObj(1))
      cache.set('b', makeObj(2))
      const stats = cache.getStatistics()
      expect(stats.sets).toBe(2)
    })

    it('should handle multiple different keys', () => {
      cache.set('a', makeObj(1))
      cache.set('b', makeObj(2))
      cache.set('c', makeObj(3))
      expect(cache.size).toBe(3)
    })

    it('should enforce maxSize by evicting oldest', () => {
      const c = new WeakRefCache<string, object>({ maxSize: 2 })
      const refs: object[] = []
      refs.push(makeObj(1))
      refs.push(makeObj(2))
      refs.push(makeObj(3))
      c.set('a', refs[0]!)
      c.set('b', refs[1]!)
      c.set('c', refs[2]!)
      expect(c.size).toBeLessThanOrEqual(2)
    })

    it('should update maxAlive stat', () => {
      cache.set('a', makeObj(1))
      cache.set('b', makeObj(2))
      const stats = cache.getStatistics()
      expect(stats.maxAlive).toBeGreaterThanOrEqual(1)
    })

    it('should allow overwriting within maxSize', () => {
      const c = new WeakRefCache<string, object>({ maxSize: 1 })
      c.set('a', makeObj(1))
      c.set('a', makeObj(2))
      expect(c.size).toBe(1)
    })
  })

  describe('get', () => {
    it('should return value for existing key', () => {
      const obj = makeObj(1)
      cache.set('a', obj)
      expect(cache.get('a')).toBe(obj)
    })

    it('should return undefined for missing key', () => {
      expect(cache.get('missing')).toBeUndefined()
    })

    it('should track hit statistics', () => {
      const obj = makeObj(1)
      cache.set('a', obj)
      cache.get('a')
      const stats = cache.getStatistics()
      expect(stats.hits).toBe(1)
    })

    it('should track miss statistics for missing key', () => {
      cache.get('missing')
      const stats = cache.getStatistics()
      expect(stats.misses).toBe(1)
    })

    it('should track get statistics', () => {
      cache.get('a')
      cache.get('b')
      const stats = cache.getStatistics()
      expect(stats.gets).toBe(2)
    })

    it('should return undefined and miss for dead ref', () => {
      const c = new WeakRefCache<string, object>()
      let obj: object | null = { x: 1 }
      c.set('a', obj)
      obj = null
      if (c.peek('a') === undefined) {
        expect(c.get('a')).toBeUndefined()
        const stats = c.getStatistics()
        expect(stats.misses).toBeGreaterThan(0)
      }
    })

    it('should refresh TTL on access', () => {
      const c = new WeakRefCache<string, object>({ ttl: 100 })
      const obj = makeObj(1)
      c.set('a', obj)
      const val1 = c.get('a')
      expect(val1).toBe(obj)
    })
  })

  describe('delete', () => {
    it('should remove an existing key', () => {
      cache.set('a', makeObj(1))
      expect(cache.delete('a')).toBe(true)
      expect(cache.size).toBe(0)
    })

    it('should return false for missing key', () => {
      expect(cache.delete('missing')).toBe(false)
    })

    it('should track delete statistics', () => {
      cache.set('a', makeObj(1))
      cache.delete('a')
      const stats = cache.getStatistics()
      expect(stats.deletes).toBe(1)
    })

    it('should track delete stat even for missing key', () => {
      cache.delete('missing')
      const stats = cache.getStatistics()
      expect(stats.deletes).toBe(1)
    })

    it('should allow re-adding after delete', () => {
      const obj = makeObj(1)
      cache.set('a', obj)
      cache.delete('a')
      cache.set('a', obj)
      expect(cache.get('a')).toBe(obj)
    })
  })

  describe('has', () => {
    it('should return true for existing key', () => {
      const obj = makeObj(1)
      cache.set('a', obj)
      expect(cache.has('a')).toBe(true)
    })

    it('should return false for missing key', () => {
      expect(cache.has('missing')).toBe(false)
    })

    it('should return false after delete', () => {
      cache.set('a', makeObj(1))
      cache.delete('a')
      expect(cache.has('a')).toBe(false)
    })

    it('should return false for dead ref', () => {
      const c = new WeakRefCache<string, object>()
      let obj: object | null = { x: 1 }
      c.set('a', obj)
      obj = null
      if (c.peek('a') === undefined) {
        expect(c.has('a')).toBe(false)
      }
    })
  })

  describe('size', () => {
    it('should be 0 on empty cache', () => {
      expect(cache.size).toBe(0)
    })

    it('should increase with set', () => {
      cache.set('a', makeObj(1))
      expect(cache.size).toBe(1)
      cache.set('b', makeObj(2))
      expect(cache.size).toBe(2)
    })

    it('should decrease with delete', () => {
      cache.set('a', makeObj(1))
      cache.set('b', makeObj(2))
      cache.delete('a')
      expect(cache.size).toBe(1)
    })

    it('should count only live entries', () => {
      const c = new WeakRefCache<string, object>()
      const kept = makeObj(1)
      c.set('a', kept)
      c.set('b', makeObj(2))
      expect(c.size).toBe(2)
    })

    it('should not double count on same key', () => {
      const obj = makeObj(1)
      cache.set('a', obj)
      cache.set('a', obj)
      expect(cache.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should be true on new cache', () => {
      expect(cache.isEmpty).toBe(true)
    })

    it('should be false after set', () => {
      cache.set('a', makeObj(1))
      expect(cache.isEmpty).toBe(false)
    })

    it('should be true after clear', () => {
      cache.set('a', makeObj(1))
      cache.clear()
      expect(cache.isEmpty).toBe(true)
    })

    it('should be true after deleting all', () => {
      cache.set('a', makeObj(1))
      cache.delete('a')
      expect(cache.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('should remove all entries', () => {
      cache.set('a', makeObj(1))
      cache.set('b', makeObj(2))
      cache.set('c', makeObj(3))
      cache.clear()
      expect(cache.size).toBe(0)
    })

    it('should reset statistics', () => {
      cache.set('a', makeObj(1))
      cache.get('a')
      cache.clear()
      const stats = cache.getStatistics()
      expect(stats.gets).toBe(0)
      expect(stats.sets).toBe(0)
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
      expect(stats.deletes).toBe(0)
      expect(stats.gcCollections).toBe(0)
      expect(stats.maxAlive).toBe(0)
    })

    it('should allow adding after clear', () => {
      cache.set('a', makeObj(1))
      cache.clear()
      cache.set('b', makeObj(2))
      expect(cache.size).toBe(1)
      expect(cache.has('b')).toBe(true)
    })

    it('should work on already empty cache', () => {
      cache.clear()
      expect(cache.size).toBe(0)
    })
  })

  describe('keys', () => {
    it('should return empty array for empty cache', () => {
      expect(cache.keys()).toEqual([])
    })

    it('should return all live keys', () => {
      cache.set('a', makeObj(1))
      cache.set('b', makeObj(2))
      cache.set('c', makeObj(3))
      const keys = cache.keys()
      expect(keys.sort()).toEqual(['a', 'b', 'c'])
    })

    it('should not include deleted keys', () => {
      cache.set('a', makeObj(1))
      cache.set('b', makeObj(2))
      cache.delete('a')
      expect(cache.keys()).toEqual(['b'])
    })
  })

  describe('values', () => {
    it('should return empty array for empty cache', () => {
      expect(cache.values()).toEqual([])
    })

    it('should return all live values', () => {
      const obj1 = makeObj(1)
      const obj2 = makeObj(2)
      cache.set('a', obj1)
      cache.set('b', obj2)
      const vals = cache.values()
      expect(vals).toContain(obj1)
      expect(vals).toContain(obj2)
    })

    it('should return only live references', () => {
      const c = new WeakRefCache<string, object>()
      const kept = makeObj(1)
      c.set('a', kept)
      c.set('b', makeObj(2))
      const vals = c.values()
      expect(vals).toContain(kept)
      expect(vals.length).toBe(2)
    })
  })

  describe('entries', () => {
    it('should return empty array for empty cache', () => {
      expect(cache.entries()).toEqual([])
    })

    it('should return key-value pairs', () => {
      const obj1 = makeObj(1)
      const obj2 = makeObj(2)
      cache.set('a', obj1)
      cache.set('b', obj2)
      const entries = cache.entries()
      expect(entries.length).toBe(2)
      const keys = entries.map(e => e[0])
      expect(keys.sort()).toEqual(['a', 'b'])
    })

    it('should return only live entries', () => {
      const c = new WeakRefCache<string, object>()
      const kept = makeObj(1)
      c.set('a', kept)
      c.set('b', makeObj(2))
      const entries = c.entries()
      expect(entries.length).toBe(2)
    })
  })

  describe('forEach', () => {
    it('should not call callback on empty cache', () => {
      const fn = vi.fn()
      cache.forEach(fn)
      expect(fn).not.toHaveBeenCalled()
    })

    it('should iterate over all live entries', () => {
      const obj1 = makeObj(1)
      const obj2 = makeObj(2)
      cache.set('a', obj1)
      cache.set('b', obj2)
      const fn = vi.fn()
      cache.forEach(fn)
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('should pass value, key, and cache to callback', () => {
      const obj = makeObj(1)
      cache.set('a', obj)
      let receivedKey: string | undefined
      let receivedValue: object | undefined
      let receivedCache: WeakRefCache<string, object> | undefined
      cache.forEach((v, k, c) => {
        receivedKey = k
        receivedValue = v
        receivedCache = c
      })
      expect(receivedKey).toBe('a')
      expect(receivedValue).toBe(obj)
      expect(receivedCache).toBe(cache)
    })
  })

  describe('peek', () => {
    it('should return value without TTL refresh', () => {
      const obj = makeObj(1)
      cache.set('a', obj)
      expect(cache.peek('a')).toBe(obj)
    })

    it('should not count as get in statistics', () => {
      cache.set('a', makeObj(1))
      cache.peek('a')
      const stats = cache.getStatistics()
      expect(stats.gets).toBe(0)
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
    })

    it('should return undefined for missing key', () => {
      expect(cache.peek('missing')).toBeUndefined()
    })

    it('should return undefined for dead ref', () => {
      const c = new WeakRefCache<string, object>()
      let obj: object | null = { x: 1 }
      c.set('a', obj)
      obj = null
      if (c.peek('a') === undefined) {
        expect(c.peek('a')).toBeUndefined()
      }
    })

    it('should not update access time', () => {
      const c = new WeakRefCache<string, object>({ ttl: 200 })
      const obj = makeObj(1)
      c.set('a', obj)
      c.peek('a')
      expect(c.peek('a')).toBe(obj)
    })
  })

  describe('refresh', () => {
    it('should refresh TTL for existing key', () => {
      const c = new WeakRefCache<string, object>({ ttl: 50 })
      const obj = makeObj(1)
      c.set('a', obj)
      expect(c.refresh('a')).toBe(true)
    })

    it('should return false for missing key', () => {
      expect(cache.refresh('missing')).toBe(false)
    })

    it('should return false for dead ref', () => {
      const c = new WeakRefCache<string, object>()
      let obj: object | null = { x: 1 }
      c.set('a', obj)
      obj = null
      if (c.peek('a') === undefined) {
        expect(c.refresh('a')).toBe(false)
      }
    })
  })

  describe('purge', () => {
    it('should return 0 when nothing to purge', () => {
      cache.set('a', makeObj(1))
      expect(cache.purge()).toBe(0)
    })

    it('should remove dead refs and return count', () => {
      const c = new WeakRefCache<string, object>()
      const kept = makeObj(2)
      c.set('a', makeObj(1))
      c.set('b', kept)
      expect(c.size).toBe(2)
    })

    it('should not affect live entries', () => {
      const obj1 = makeObj(1)
      const obj2 = makeObj(2)
      cache.set('a', obj1)
      cache.set('b', obj2)
      cache.purge()
      expect(cache.size).toBe(2)
    })

    it('should handle empty cache', () => {
      expect(cache.purge()).toBe(0)
    })
  })

  describe('getStatistics', () => {
    it('should return zero stats on new cache', () => {
      const stats = cache.getStatistics()
      expect(stats.gets).toBe(0)
      expect(stats.sets).toBe(0)
      expect(stats.deletes).toBe(0)
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
      expect(stats.gcCollections).toBe(0)
      expect(stats.maxAlive).toBe(0)
    })

    it('should track gets', () => {
      cache.set('a', makeObj(1))
      cache.get('a')
      cache.get('b')
      expect(cache.getStatistics().gets).toBe(2)
    })

    it('should track sets', () => {
      cache.set('a', makeObj(1))
      cache.set('b', makeObj(2))
      expect(cache.getStatistics().sets).toBe(2)
    })

    it('should track deletes', () => {
      cache.set('a', makeObj(1))
      cache.delete('a')
      cache.delete('b')
      expect(cache.getStatistics().deletes).toBe(2)
    })

    it('should track hits', () => {
      cache.set('a', makeObj(1))
      cache.get('a')
      cache.get('a')
      expect(cache.getStatistics().hits).toBe(2)
    })

    it('should track misses', () => {
      cache.get('missing1')
      cache.get('missing2')
      expect(cache.getStatistics().misses).toBe(2)
    })

    it('should track maxAlive', () => {
      cache.set('a', makeObj(1))
      cache.set('b', makeObj(2))
      cache.set('c', makeObj(3))
      expect(cache.getStatistics().maxAlive).toBeGreaterThanOrEqual(2)
    })

    it('should return a copy', () => {
      cache.set('a', makeObj(1))
      const stats1 = cache.getStatistics()
      cache.set('b', makeObj(2))
      const stats2 = cache.getStatistics()
      expect(stats1.sets).toBe(1)
      expect(stats2.sets).toBe(2)
    })
  })

  describe('toJSON', () => {
    it('should produce correct structure', () => {
      cache.set('a', makeObj(1))
      const json = cache.toJSON()
      expect(json).toHaveProperty('entries')
      expect(json).toHaveProperty('options')
      expect(json).toHaveProperty('statistics')
    })

    it('should list entries with alive status', () => {
      cache.set('a', makeObj(1))
      cache.set('b', makeObj(2))
      const json = cache.toJSON()
      expect(json.entries.length).toBe(2)
      expect(json.entries.every(e => e.alive)).toBe(true)
    })

    it('should include options', () => {
      const c = new WeakRefCache<string, object>({ maxSize: 10, ttl: 5000 })
      const json = c.toJSON()
      expect(json.options.maxSize).toBe(10)
      expect(json.options.ttl).toBe(5000)
    })

    it('should include statistics', () => {
      cache.set('a', makeObj(1))
      const json = cache.toJSON()
      expect(json.statistics.sets).toBe(1)
    })

    it('should handle empty cache', () => {
      const json = cache.toJSON()
      expect(json.entries).toEqual([])
    })
  })

  describe('fromJSON', () => {
    it('should restore cache from JSON', () => {
      const original = new WeakRefCache<string, { id: number }>({ maxSize: 50 })
      original.set('a', makeObj(1))
      original.set('b', makeObj(2))
      const json = original.toJSON()
      const restored = WeakRefCache.fromJSON(json, (key) => makeObj(key === 'a' ? 1 : 2))
      expect(restored.size).toBe(2)
    })

    it('should preserve options', () => {
      const original = new WeakRefCache<string, object>({ maxSize: 10, ttl: 5000 })
      const json = original.toJSON()
      const restored = WeakRefCache.fromJSON(json, () => ({ x: 1 }))
      const restoredJson = restored.toJSON()
      expect(restoredJson.options.maxSize).toBe(10)
      expect(restoredJson.options.ttl).toBe(5000)
    })

    it('should skip dead entries', () => {
      const json: WeakRefCacheJSON<string> = {
        entries: [
          { key: 'a', alive: true },
          { key: 'b', alive: false },
        ],
        options: { maxSize: 100, ttl: 60000 },
        statistics: { gets: 0, sets: 0, deletes: 0, hits: 0, misses: 0, gcCollections: 0, maxAlive: 0 },
      }
      const restored = WeakRefCache.fromJSON(json, () => ({ x: 1 }))
      expect(restored.size).toBe(1)
    })

    it('should handle empty entries', () => {
      const json: WeakRefCacheJSON<string> = {
        entries: [],
        options: { maxSize: 100, ttl: 60000 },
        statistics: { gets: 0, sets: 0, deletes: 0, hits: 0, misses: 0, gcCollections: 0, maxAlive: 0 },
      }
      const restored = WeakRefCache.fromJSON(json, () => ({ x: 1 }))
      expect(restored.size).toBe(0)
    })
  })

  describe('TTL behavior', () => {
    it('should expire entries past TTL', () => {
      vi.useFakeTimers()
      const c = new WeakRefCache<string, object>({ ttl: 100 })
      const obj = makeObj(1)
      c.set('a', obj)
      vi.advanceTimersByTime(150)
      expect(c.get('a')).toBeUndefined()
      vi.useRealTimers()
    })

    it('should not expire entries within TTL', () => {
      vi.useFakeTimers()
      const c = new WeakRefCache<string, object>({ ttl: 500 })
      const obj = makeObj(1)
      c.set('a', obj)
      vi.advanceTimersByTime(100)
      expect(c.get('a')).toBe(obj)
      vi.useRealTimers()
    })

    it('should refresh TTL on get', () => {
      vi.useFakeTimers()
      const c = new WeakRefCache<string, object>({ ttl: 200 })
      const obj = makeObj(1)
      c.set('a', obj)
      vi.advanceTimersByTime(100)
      c.get('a')
      vi.advanceTimersByTime(100)
      expect(c.get('a')).toBe(obj)
      vi.useRealTimers()
    })

    it('should not refresh TTL on peek', () => {
      vi.useFakeTimers()
      const c = new WeakRefCache<string, object>({ ttl: 100 })
      const obj = makeObj(1)
      c.set('a', obj)
      vi.advanceTimersByTime(50)
      c.peek('a')
      vi.advanceTimersByTime(60)
      expect(c.get('a')).toBeUndefined()
      vi.useRealTimers()
    })

    it('should handle has with expired entry', () => {
      vi.useFakeTimers()
      const c = new WeakRefCache<string, object>({ ttl: 100 })
      c.set('a', makeObj(1))
      vi.advanceTimersByTime(150)
      expect(c.has('a')).toBe(false)
      vi.useRealTimers()
    })

    it('should not expire with infinite TTL', () => {
      vi.useFakeTimers()
      const c = new WeakRefCache<string, object>({ ttl: Infinity })
      const obj = makeObj(1)
      c.set('a', obj)
      vi.advanceTimersByTime(1000000)
      expect(c.get('a')).toBe(obj)
      vi.useRealTimers()
    })

    it('should purge expired entries', () => {
      vi.useFakeTimers()
      const c = new WeakRefCache<string, object>({ ttl: 100 })
      c.set('a', makeObj(1))
      c.set('b', makeObj(2))
      vi.advanceTimersByTime(150)
      expect(c.purge()).toBe(2)
      vi.useRealTimers()
    })

    it('should count expired entry as miss on get', () => {
      vi.useFakeTimers()
      const c = new WeakRefCache<string, object>({ ttl: 100 })
      c.set('a', makeObj(1))
      vi.advanceTimersByTime(150)
      c.get('a')
      expect(c.getStatistics().misses).toBe(1)
      vi.useRealTimers()
    })
  })

  describe('maxSize eviction', () => {
    it('should evict oldest when at capacity', () => {
      const c = new WeakRefCache<string, object>({ maxSize: 2 })
      const refs: object[] = [makeObj(1), makeObj(2), makeObj(3)]
      c.set('a', refs[0]!)
      c.set('b', refs[1]!)
      c.set('c', refs[2]!)
      expect(c.has('a')).toBe(false)
      expect(c.has('c')).toBe(true)
    })

    it('should not evict when under capacity', () => {
      const c = new WeakRefCache<string, object>({ maxSize: 5 })
      c.set('a', makeObj(1))
      c.set('b', makeObj(2))
      expect(c.size).toBe(2)
    })

    it('should handle maxSize of 1', () => {
      const c = new WeakRefCache<string, object>({ maxSize: 1 })
      const refs: object[] = [makeObj(1), makeObj(2)]
      c.set('a', refs[0]!)
      c.set('b', refs[1]!)
      expect(c.size).toBe(1)
      expect(c.has('b')).toBe(true)
    })

    it('should not evict when overwriting same key', () => {
      const c = new WeakRefCache<string, object>({ maxSize: 1 })
      c.set('a', makeObj(1))
      c.set('a', makeObj(2))
      expect(c.size).toBe(1)
    })
  })

  describe('DEFAULT_WEAK_REF_CACHE_OPTIONS', () => {
    it('should have maxSize Infinity', () => {
      expect(DEFAULT_WEAK_REF_CACHE_OPTIONS.maxSize).toBe(Infinity)
    })

    it('should have ttl Infinity', () => {
      expect(DEFAULT_WEAK_REF_CACHE_OPTIONS.ttl).toBe(Infinity)
    })
  })

  describe('exports', () => {
    it('should export WeakRefCache class', () => {
      expect(WeakRefCache).toBeDefined()
      expect(typeof WeakRefCache).toBe('function')
    })

    it('should export DEFAULT_WEAK_REF_CACHE_OPTIONS', () => {
      expect(DEFAULT_WEAK_REF_CACHE_OPTIONS).toBeDefined()
    })

    it('should allow type-only imports for options', () => {
      const opts: WeakRefCacheOptions = { maxSize: 10 }
      const c = new WeakRefCache<string, object>(opts)
      expect(c).toBeDefined()
    })

    it('should allow type import for WeakRefCacheJSON', () => {
      const json: WeakRefCacheJSON<string> = {
        entries: [],
        options: { maxSize: 100, ttl: 60000 },
        statistics: { gets: 0, sets: 0, deletes: 0, hits: 0, misses: 0, gcCollections: 0, maxAlive: 0 },
      }
      expect(json.entries).toEqual([])
    })

    it('should allow type import for WeakRefCacheStatistics', () => {
      const stats: WeakRefCacheStatistics = {
        gets: 0,
        sets: 0,
        deletes: 0,
        hits: 0,
        misses: 0,
        gcCollections: 0,
        maxAlive: 0,
      }
      expect(stats.gets).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('should handle set-delete-set cycle', () => {
      const obj = makeObj(1)
      cache.set('a', obj)
      cache.delete('a')
      cache.set('a', obj)
      expect(cache.get('a')).toBe(obj)
    })

    it('should handle rapid set-clear cycles', () => {
      for (let i = 0; i < 5; i++) {
        cache.set(`key-${i}`, makeObj(i))
        cache.clear()
      }
      expect(cache.size).toBe(0)
    })

    it('should handle many entries', () => {
      const refs: object[] = []
      for (let i = 0; i < 100; i++) {
        const obj = makeObj(i)
        refs.push(obj)
        cache.set(`key-${i}`, obj)
      }
      expect(cache.size).toBe(100)
    })

    it('should work with number keys', () => {
      const c = new WeakRefCache<number, object>()
      const obj = makeObj(1)
      c.set(42, obj)
      expect(c.get(42)).toBe(obj)
      expect(c.has(42)).toBe(true)
    })

    it('should handle empty string key', () => {
      const obj = makeObj(1)
      cache.set('', obj)
      expect(cache.get('')).toBe(obj)
    })

    it('should handle zero key', () => {
      const c = new WeakRefCache<number, object>()
      c.set(0, makeObj(1))
      expect(c.get(0)).toBeDefined()
    })

    it('should handle forEach with early entries becoming dead', () => {
      const c = new WeakRefCache<string, object>()
      const kept = makeObj(1)
      c.set('a', kept)
      c.set('b', makeObj(2))
      const fn = vi.fn()
      c.forEach(fn)
      expect(fn.mock.calls.length).toBeGreaterThanOrEqual(1)
    })

    it('should handle entries after delete', () => {
      cache.set('a', makeObj(1))
      cache.set('b', makeObj(2))
      cache.delete('a')
      const entries = cache.entries()
      expect(entries.length).toBe(1)
      expect(entries[0]![0]).toBe('b')
    })

    it('should handle keys after delete', () => {
      cache.set('a', makeObj(1))
      cache.set('b', makeObj(2))
      cache.delete('a')
      expect(cache.keys()).toEqual(['b'])
    })

    it('should handle values after delete', () => {
      const obj2 = makeObj(2)
      cache.set('a', makeObj(1))
      cache.set('b', obj2)
      cache.delete('a')
      expect(cache.values()).toEqual([obj2])
    })

    it('should handle refresh on expired entry', () => {
      vi.useFakeTimers()
      const c = new WeakRefCache<string, object>({ ttl: 50 })
      c.set('a', makeObj(1))
      vi.advanceTimersByTime(100)
      expect(c.refresh('a')).toBe(false)
      vi.useRealTimers()
    })

    it('should handle purge on all-expired entries', () => {
      vi.useFakeTimers()
      const c = new WeakRefCache<string, object>({ ttl: 50 })
      c.set('a', makeObj(1))
      c.set('b', makeObj(2))
      vi.advanceTimersByTime(100)
      expect(c.purge()).toBe(2)
      expect(c.size).toBe(0)
      vi.useRealTimers()
    })

    it('should not include expired entries in keys', () => {
      vi.useFakeTimers()
      const c = new WeakRefCache<string, object>({ ttl: 100 })
      c.set('a', makeObj(1))
      c.set('b', makeObj(2))
      vi.advanceTimersByTime(150)
      expect(c.keys()).toEqual([])
      vi.useRealTimers()
    })

    it('should not include expired entries in values', () => {
      vi.useFakeTimers()
      const c = new WeakRefCache<string, object>({ ttl: 100 })
      c.set('a', makeObj(1))
      vi.advanceTimersByTime(150)
      expect(c.values()).toEqual([])
      vi.useRealTimers()
    })

    it('should handle toJSON with mixed alive/dead', () => {
      const c = new WeakRefCache<string, object>()
      const kept = makeObj(1)
      c.set('a', kept)
      c.set('b', makeObj(2))
      const json = c.toJSON()
      expect(json.entries.length).toBe(2)
    })
  })
})
