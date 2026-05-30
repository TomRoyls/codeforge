import { describe, it, expect } from 'vitest'
import { ARCCache } from '../../../src/utils/arc-cache.js'

describe('ARCCache', () => {
  describe('construction', () => {
    it('creates cache with capacity', () => {
      const cache = new ARCCache<string, number>(5)
      expect(cache.size).toBe(0)
      expect(cache.Capacity).toBe(5)
    })

    it('throws for zero capacity', () => {
      expect(() => new ARCCache<string, number>(0)).toThrow(RangeError)
    })

    it('throws for negative capacity', () => {
      expect(() => new ARCCache<string, number>(-1)).toThrow(RangeError)
    })
  })

  describe('set and get', () => {
    it('stores and retrieves values', () => {
      const cache = new ARCCache<string, number>(5)
      cache.set('a', 1)
      expect(cache.get('a')).toBe(1)
    })

    it('returns undefined for missing keys', () => {
      const cache = new ARCCache<string, number>(5)
      expect(cache.get('missing')).toBeUndefined()
    })

    it('overwrites existing value', () => {
      const cache = new ARCCache<string, number>(5)
      cache.set('a', 1)
      cache.set('a', 2)
      expect(cache.get('a')).toBe(2)
    })
  })

  describe('eviction', () => {
    it('evicts when capacity exceeded', () => {
      const cache = new ARCCache<string, number>(2)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.size).toBeLessThanOrEqual(2)
    })

    it('promotes recently accessed items', () => {
      const cache = new ARCCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.get('a')
      cache.set('d', 4)
      expect(cache.has('a')).toBe(true)
    })

    it('handles sequential access pattern', () => {
      const cache = new ARCCache<number, number>(3)
      for (let i = 0; i < 10; i++) {
        cache.set(i, i * 10)
      }
      expect(cache.size).toBeLessThanOrEqual(3)
    })
  })

  describe('ARC adaptive behavior', () => {
    it('adapts to recent frequency pattern', () => {
      const cache = new ARCCache<string, number>(4)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4)
      cache.get('a')
      cache.get('a')
      cache.get('a')
      cache.set('e', 5)
      cache.set('f', 6)
      expect(cache.has('a')).toBe(true)
    })

    it('adapts to recency pattern', () => {
      const cache = new ARCCache<string, number>(4)
      for (let i = 0; i < 8; i++) {
        cache.set(`key${i}`, i)
      }
      expect(cache.size).toBeLessThanOrEqual(4)
    })

    it('recovers ghost entries', () => {
      const cache = new ARCCache<string, number>(2)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('a', 10)
      expect(cache.get('a')).toBe(10)
    })
  })

  describe('has', () => {
    it('returns true for existing key', () => {
      const cache = new ARCCache<string, number>(3)
      cache.set('a', 1)
      expect(cache.has('a')).toBe(true)
    })

    it('returns false for missing key', () => {
      const cache = new ARCCache<string, number>(3)
      expect(cache.has('a')).toBe(false)
    })
  })

  describe('delete', () => {
    it('deletes existing key', () => {
      const cache = new ARCCache<string, number>(3)
      cache.set('a', 1)
      expect(cache.delete('a')).toBe(true)
      expect(cache.has('a')).toBe(false)
    })

    it('returns false for missing key', () => {
      const cache = new ARCCache<string, number>(3)
      expect(cache.delete('a')).toBe(false)
    })
  })

  describe('clear', () => {
    it('clears all entries', () => {
      const cache = new ARCCache<string, number>(5)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.clear()
      expect(cache.size).toBe(0)
      expect(cache.has('a')).toBe(false)
    })
  })

  describe('peek', () => {
    it('returns value without promoting', () => {
      const cache = new ARCCache<string, number>(3)
      cache.set('a', 1)
      expect(cache.peek('a')).toBe(1)
    })

    it('returns undefined for missing', () => {
      const cache = new ARCCache<string, number>(3)
      expect(cache.peek('a')).toBeUndefined()
    })
  })

  describe('keys/values/entries', () => {
    it('returns keys', () => {
      const cache = new ARCCache<string, number>(5)
      cache.set('a', 1)
      cache.set('b', 2)
      const keys = cache.keys()
      expect(keys).toContain('a')
      expect(keys).toContain('b')
    })

    it('returns values', () => {
      const cache = new ARCCache<string, number>(5)
      cache.set('a', 1)
      cache.set('b', 2)
      const vals = cache.values()
      expect(vals).toContain(1)
      expect(vals).toContain(2)
    })

    it('returns entries', () => {
      const cache = new ARCCache<string, number>(5)
      cache.set('a', 1)
      cache.set('b', 2)
      const entries = cache.entries()
      expect(entries).toHaveLength(2)
    })
  })

  describe('forEach', () => {
    it('iterates all entries', () => {
      const cache = new ARCCache<string, number>(5)
      cache.set('a', 1)
      cache.set('b', 2)
      const result: Array<[string, number]> = []
      cache.forEach((v, k) => result.push([k, v]))
      expect(result).toHaveLength(2)
    })
  })

  describe('edge cases', () => {
    it('handles capacity 1', () => {
      const cache = new ARCCache<string, number>(1)
      cache.set('a', 1)
      cache.set('b', 2)
      expect(cache.size).toBeLessThanOrEqual(1)
    })

    it('handles many operations', () => {
      const cache = new ARCCache<number, number>(10)
      for (let i = 0; i < 100; i++) {
        cache.set(i, i * 10)
        if (i > 10) cache.get(i - 1)
      }
      expect(cache.size).toBeLessThanOrEqual(10)
    })

    it('handles get-set oscillation', () => {
      const cache = new ARCCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      for (let i = 0; i < 10; i++) {
        cache.get('a')
        cache.get('b')
        cache.get('c')
      }
      expect(cache.size).toBe(3)
    })
  })
})
