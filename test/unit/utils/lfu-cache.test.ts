import { describe, it, expect } from 'vitest'
import { LFUCache } from '../../../src/utils/lfu-cache.js'

describe('LFUCache', () => {
  describe('construction', () => {
    it('creates cache with capacity', () => {
      const cache = new LFUCache<string, number>(5)
      expect(cache.size).toBe(0)
      expect(cache.Capacity).toBe(5)
    })

    it('throws for zero capacity', () => {
      expect(() => new LFUCache<string, number>(0)).toThrow(RangeError)
    })

    it('throws for negative capacity', () => {
      expect(() => new LFUCache<string, number>(-1)).toThrow(RangeError)
    })
  })

  describe('set and get', () => {
    it('stores and retrieves values', () => {
      const cache = new LFUCache<string, number>(3)
      cache.set('a', 1)
      expect(cache.get('a')).toBe(1)
    })

    it('returns undefined for missing keys', () => {
      const cache = new LFUCache<string, number>(3)
      expect(cache.get('missing')).toBeUndefined()
    })

    it('overwrites existing values', () => {
      const cache = new LFUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('a', 2)
      expect(cache.get('a')).toBe(2)
      expect(cache.size).toBe(1)
    })
  })

  describe('eviction', () => {
    it('evicts least frequently used when full', () => {
      const cache = new LFUCache<string, number>(2)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.get('a')
      cache.set('c', 3)
      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(false)
      expect(cache.has('c')).toBe(true)
    })

    it('evicts oldest among same frequency', () => {
      const cache = new LFUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4)
      expect(cache.has('a')).toBe(false)
      expect(cache.has('d')).toBe(true)
    })

    it('updates frequency on get, preventing eviction', () => {
      const cache = new LFUCache<string, number>(2)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.get('a')
      cache.get('b')
      cache.get('a')
      cache.set('c', 3)
      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(false)
    })

    it('handles capacity 1', () => {
      const cache = new LFUCache<string, number>(1)
      cache.set('a', 1)
      cache.set('b', 2)
      expect(cache.get('a')).toBeUndefined()
      expect(cache.get('b')).toBe(2)
    })
  })

  describe('has', () => {
    it('returns true for existing key', () => {
      const cache = new LFUCache<string, number>(3)
      cache.set('a', 1)
      expect(cache.has('a')).toBe(true)
    })

    it('returns false for missing key', () => {
      const cache = new LFUCache<string, number>(3)
      expect(cache.has('a')).toBe(false)
    })

    it('returns false after delete', () => {
      const cache = new LFUCache<string, number>(3)
      cache.set('a', 1)
      cache.delete('a')
      expect(cache.has('a')).toBe(false)
    })
  })

  describe('delete', () => {
    it('deletes existing key', () => {
      const cache = new LFUCache<string, number>(3)
      cache.set('a', 1)
      expect(cache.delete('a')).toBe(true)
      expect(cache.size).toBe(0)
    })

    it('returns false for missing key', () => {
      const cache = new LFUCache<string, number>(3)
      expect(cache.delete('a')).toBe(false)
    })

    it('allows re-adding deleted key', () => {
      const cache = new LFUCache<string, number>(2)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.delete('a')
      cache.set('c', 3)
      expect(cache.size).toBe(2)
      expect(cache.has('b')).toBe(true)
      expect(cache.has('c')).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears all entries', () => {
      const cache = new LFUCache<string, number>(5)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.clear()
      expect(cache.size).toBe(0)
      expect(cache.has('a')).toBe(false)
    })
  })

  describe('peek', () => {
    it('returns value without updating frequency', () => {
      const cache = new LFUCache<string, number>(2)
      cache.set('a', 1)
      cache.set('b', 2)
      expect(cache.peek('a')).toBe(1)
      cache.set('c', 3)
      expect(cache.has('a')).toBe(false)
    })

    it('returns undefined for missing key', () => {
      const cache = new LFUCache<string, number>(3)
      expect(cache.peek('missing')).toBeUndefined()
    })
  })

  describe('getFrequency', () => {
    it('returns frequency of accessed key', () => {
      const cache = new LFUCache<string, number>(3)
      cache.set('a', 1)
      expect(cache.getFrequency('a')).toBe(1)
      cache.get('a')
      expect(cache.getFrequency('a')).toBe(2)
      cache.get('a')
      expect(cache.getFrequency('a')).toBe(3)
    })

    it('returns 0 for missing key', () => {
      const cache = new LFUCache<string, number>(3)
      expect(cache.getFrequency('missing')).toBe(0)
    })
  })

  describe('keys/values/entries', () => {
    it('returns keys', () => {
      const cache = new LFUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      const keys = cache.keys()
      expect(keys).toContain('a')
      expect(keys).toContain('b')
      expect(keys).toHaveLength(2)
    })

    it('returns values', () => {
      const cache = new LFUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      const vals = cache.values()
      expect(vals).toContain(1)
      expect(vals).toContain(2)
    })

    it('returns entries', () => {
      const cache = new LFUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      const entries = cache.entries()
      expect(entries).toHaveLength(2)
    })
  })

  describe('forEach', () => {
    it('iterates all entries', () => {
      const cache = new LFUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      const result: Array<{ key: string; value: number; freq: number }> = []
      cache.forEach((value, key, freq) => result.push({ key, value, freq }))
      expect(result).toHaveLength(2)
      expect(result.every((r) => r.freq >= 1)).toBe(true)
    })
  })

  describe('toMap', () => {
    it('converts to Map', () => {
      const cache = new LFUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      const map = cache.toMap()
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('handles repeated access pattern', () => {
      const cache = new LFUCache<number, string>(3)
      cache.set(1, 'a')
      cache.set(2, 'b')
      cache.set(3, 'c')
      cache.get(1)
      cache.get(2)
      cache.get(1)
      cache.set(4, 'd')
      expect(cache.has(1)).toBe(true)
      expect(cache.has(2)).toBe(true)
      expect(cache.has(3)).toBe(false)
      expect(cache.has(4)).toBe(true)
    })

    it('handles update after eviction', () => {
      const cache = new LFUCache<string, number>(2)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('a', 10)
      expect(cache.get('a')).toBe(10)
    })

    it('handles many operations', () => {
      const cache = new LFUCache<number, number>(10)
      for (let i = 0; i < 100; i++) {
        cache.set(i, i * 10)
        if (i > 5) cache.get(i - 1)
      }
      expect(cache.size).toBe(10)
    })
  })
})
