import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { TTLCache } from '../src/utils/ttl-cache.js'

describe('TTLCache', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('constructor', () => {
    it('creates cache with default TTL', () => {
      const cache = new TTLCache<string, number>({ defaultTTL: 1000 })
      expect(cache.size).toBe(0)
      expect(cache.isEmpty).toBe(true)
    })

    it('throws on zero TTL', () => {
      expect(() => new TTLCache({ defaultTTL: 0 })).toThrow(RangeError)
    })

    it('throws on negative TTL', () => {
      expect(() => new TTLCache({ defaultTTL: -1 })).toThrow(RangeError)
    })

    it('accepts maxSize option', () => {
      const cache = new TTLCache<string, number>({ defaultTTL: 1000, maxSize: 3 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4)
      expect(cache.size).toBe(3)
    })
  })

  describe('set and get', () => {
    it('stores and retrieves a value', () => {
      const cache = new TTLCache<string, number>({ defaultTTL: 1000 })
      cache.set('key', 42)
      expect(cache.get('key')).toBe(42)
    })

    it('returns undefined for missing key', () => {
      const cache = new TTLCache<string, number>({ defaultTTL: 1000 })
      expect(cache.get('missing')).toBeUndefined()
    })

    it('overwrites existing key', () => {
      const cache = new TTLCache<string, number>({ defaultTTL: 1000 })
      cache.set('key', 1)
      cache.set('key', 2)
      expect(cache.get('key')).toBe(2)
    })

    it('returns undefined after TTL expires', () => {
      const cache = new TTLCache<string, number>({ defaultTTL: 1000 })
      cache.set('key', 42)
      vi.advanceTimersByTime(1001)
      expect(cache.get('key')).toBeUndefined()
    })

    it('accepts custom TTL per entry', () => {
      const cache = new TTLCache<string, number>({ defaultTTL: 1000 })
      cache.set('short', 1, 500)
      cache.set('long', 2, 5000)
      vi.advanceTimersByTime(501)
      expect(cache.get('short')).toBeUndefined()
      expect(cache.get('long')).toBe(2)
    })

    it('throws on custom TTL of 0', () => {
      const cache = new TTLCache<string, number>({ defaultTTL: 1000 })
      expect(() => cache.set('key', 1, 0)).toThrow(RangeError)
    })
  })

  describe('has', () => {
    it('returns true for existing non-expired key', () => {
      const cache = new TTLCache<string, number>({ defaultTTL: 1000 })
      cache.set('key', 1)
      expect(cache.has('key')).toBe(true)
    })

    it('returns false for missing key', () => {
      const cache = new TTLCache<string, number>({ defaultTTL: 1000 })
      expect(cache.has('key')).toBe(false)
    })

    it('returns false for expired key', () => {
      const cache = new TTLCache<string, number>({ defaultTTL: 1000 })
      cache.set('key', 1)
      vi.advanceTimersByTime(1001)
      expect(cache.has('key')).toBe(false)
    })
  })

  describe('delete', () => {
    it('removes entry', () => {
      const cache = new TTLCache<string, number>({ defaultTTL: 1000 })
      cache.set('key', 1)
      expect(cache.delete('key')).toBe(true)
      expect(cache.get('key')).toBeUndefined()
    })

    it('returns false for missing key', () => {
      const cache = new TTLCache<string, number>({ defaultTTL: 1000 })
      expect(cache.delete('key')).toBe(false)
    })
  })

  describe('peek', () => {
    it('returns value without updating access order', () => {
      const cache = new TTLCache<string, number>({ defaultTTL: 1000, maxSize: 2 })
      cache.set('a', 1)
      cache.set('b', 2)
      expect(cache.peek('a')).toBe(1)
      cache.set('c', 3)
      expect(cache.has('a')).toBe(false)
      expect(cache.has('b')).toBe(true)
      expect(cache.has('c')).toBe(true)
    })

    it('returns undefined for expired', () => {
      const cache = new TTLCache<string, number>({ defaultTTL: 1000 })
      cache.set('key', 1)
      vi.advanceTimersByTime(1001)
      expect(cache.peek('key')).toBeUndefined()
    })
  })

  describe('getTTL', () => {
    it('returns remaining TTL', () => {
      const cache = new TTLCache<string, number>({ defaultTTL: 10000 })
      cache.set('key', 1)
      vi.advanceTimersByTime(3000)
      const remaining = cache.getTTL('key')
      expect(remaining).toBeGreaterThan(6000)
      expect(remaining).toBeLessThanOrEqual(7000)
    })

    it('returns -1 for missing key', () => {
      const cache = new TTLCache<string, number>({ defaultTTL: 1000 })
      expect(cache.getTTL('missing')).toBe(-1)
    })

    it('returns -1 for expired key and cleans up', () => {
      const cache = new TTLCache<string, number>({ defaultTTL: 1000 })
      cache.set('key', 1)
      vi.advanceTimersByTime(1001)
      expect(cache.getTTL('key')).toBe(-1)
      expect(cache.size).toBe(0)
    })
  })

  describe('touch', () => {
    it('refreshes TTL', () => {
      const cache = new TTLCache<string, number>({ defaultTTL: 1000 })
      cache.set('key', 1)
      vi.advanceTimersByTime(500)
      expect(cache.touch('key')).toBe(true)
      vi.advanceTimersByTime(500)
      expect(cache.get('key')).toBe(1)
    })

    it('returns false for missing key', () => {
      const cache = new TTLCache<string, number>({ defaultTTL: 1000 })
      expect(cache.touch('missing')).toBe(false)
    })

    it('returns false for expired key', () => {
      const cache = new TTLCache<string, number>({ defaultTTL: 1000 })
      cache.set('key', 1)
      vi.advanceTimersByTime(1001)
      expect(cache.touch('key')).toBe(false)
    })
  })

  describe('clear', () => {
    it('removes all entries', () => {
      const cache = new TTLCache<string, number>({ defaultTTL: 1000 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.clear()
      expect(cache.size).toBe(0)
      expect(cache.isEmpty).toBe(true)
    })
  })

  describe('purgeExpired', () => {
    it('removes expired entries', () => {
      const cache = new TTLCache<string, number>({ defaultTTL: 1000 })
      cache.set('a', 1, 500)
      cache.set('b', 2, 2000)
      vi.advanceTimersByTime(501)
      expect(cache.purgeExpired()).toBe(1)
      expect(cache.size).toBe(1)
      expect(cache.has('b')).toBe(true)
    })

    it('returns 0 when nothing expired', () => {
      const cache = new TTLCache<string, number>({ defaultTTL: 1000 })
      cache.set('a', 1)
      expect(cache.purgeExpired()).toBe(0)
    })
  })

  describe('keys and values', () => {
    it('returns all keys', () => {
      const cache = new TTLCache<string, number>({ defaultTTL: 1000 })
      cache.set('a', 1)
      cache.set('b', 2)
      expect(cache.keys()).toEqual(['a', 'b'])
    })

    it('returns non-expired values', () => {
      const cache = new TTLCache<string, number>({ defaultTTL: 1000 })
      cache.set('a', 1, 500)
      cache.set('b', 2, 2000)
      vi.advanceTimersByTime(501)
      expect(cache.values()).toEqual([2])
    })
  })

  describe('maxSize eviction', () => {
    it('evicts oldest when full', () => {
      const cache = new TTLCache<string, number>({ defaultTTL: 1000, maxSize: 2 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.size).toBe(2)
      expect(cache.has('a')).toBe(false)
      expect(cache.has('b')).toBe(true)
      expect(cache.has('c')).toBe(true)
    })

    it('get promotes entry preventing eviction', () => {
      const cache = new TTLCache<string, number>({ defaultTTL: 1000, maxSize: 2 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.get('a')
      cache.set('c', 3)
      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(false)
    })
  })

  describe('getStats', () => {
    it('tracks hits and misses', () => {
      const cache = new TTLCache<string, number>({ defaultTTL: 1000 })
      cache.set('key', 1)
      cache.get('key')
      cache.get('key')
      cache.get('missing')
      const stats = cache.getStats()
      expect(stats.hits).toBe(2)
      expect(stats.misses).toBe(1)
      expect(stats.size).toBe(1)
    })

    it('calculates hit rate', () => {
      const cache = new TTLCache<string, number>({ defaultTTL: 1000 })
      cache.set('key', 1)
      cache.get('key')
      cache.get('missing')
      const stats = cache.getStats()
      expect(stats.hitRate).toBe(0.5)
    })

    it('tracks evictions', () => {
      const cache = new TTLCache<string, number>({ defaultTTL: 1000, maxSize: 1 })
      cache.set('a', 1)
      cache.set('b', 2)
      expect(cache.getStats().evictions).toBeGreaterThanOrEqual(1)
    })

    it('returns 0 hitRate with no accesses', () => {
      const cache = new TTLCache<string, number>({ defaultTTL: 1000 })
      expect(cache.getStats().hitRate).toBe(0)
    })
  })
})
