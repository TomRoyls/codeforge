import { describe, it, expect } from 'vitest'
import { LRUKCache } from '../src/utils/lru-k-cache.js'

describe('LRUKCache', () => {
  describe('constructor', () => {
    it('creates cache with valid options', () => {
      const cache = new LRUKCache<string, number>({ k: 2, capacity: 10 })
      expect(cache.size).toBe(0)
      expect(cache.kValue).toBe(2)
      expect(cache.capacityValue).toBe(10)
    })

    it('throws for capacity < 1', () => {
      expect(() => new LRUKCache({ k: 2, capacity: 0 })).toThrow(RangeError)
    })

    it('throws for k < 1', () => {
      expect(() => new LRUKCache({ k: 0, capacity: 10 })).toThrow(RangeError)
    })
  })

  describe('get and set', () => {
    it('stores and retrieves values', () => {
      const cache = new LRUKCache<string, number>({ k: 2, capacity: 10 })
      cache.set('a', 1)
      expect(cache.get('a')).toBe(1)
    })

    it('returns undefined for missing key', () => {
      const cache = new LRUKCache<string, number>({ k: 2, capacity: 10 })
      expect(cache.get('missing')).toBeUndefined()
    })

    it('overwrites existing key', () => {
      const cache = new LRUKCache<string, number>({ k: 2, capacity: 10 })
      cache.set('a', 1)
      cache.set('a', 2)
      expect(cache.get('a')).toBe(2)
      expect(cache.size).toBe(1)
    })
  })

  describe('has', () => {
    it('returns true for existing key', () => {
      const cache = new LRUKCache<string, number>({ k: 2, capacity: 10 })
      cache.set('a', 1)
      expect(cache.has('a')).toBe(true)
    })

    it('returns false for missing key', () => {
      expect(new LRUKCache<string, number>({ k: 2, capacity: 10 }).has('a')).toBe(false)
    })
  })

  describe('delete', () => {
    it('removes entry', () => {
      const cache = new LRUKCache<string, number>({ k: 2, capacity: 10 })
      cache.set('a', 1)
      expect(cache.delete('a')).toBe(true)
      expect(cache.has('a')).toBe(false)
      expect(cache.size).toBe(0)
    })

    it('returns false for missing key', () => {
      expect(new LRUKCache<string, number>({ k: 2, capacity: 10 }).delete('a')).toBe(false)
    })
  })

  describe('clear', () => {
    it('removes all entries', () => {
      const cache = new LRUKCache<string, number>({ k: 2, capacity: 10 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.clear()
      expect(cache.size).toBe(0)
    })
  })

  describe('eviction', () => {
    it('evicts when capacity exceeded', () => {
      const cache = new LRUKCache<string, number>({ k: 1, capacity: 2 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.size).toBe(2)
    })

    it('evicts least recently used item (LRU-1)', () => {
      const cache = new LRUKCache<string, number>({ k: 1, capacity: 2 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.get('a')
      cache.set('c', 3)
      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(false)
      expect(cache.has('c')).toBe(true)
    })

    it('LRU-2 requires 2 accesses before protection', () => {
      const cache = new LRUKCache<string, number>({ k: 2, capacity: 3 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.get('b')
      cache.get('c')
      cache.set('d', 4)
      expect(cache.has('a')).toBe(false)
      expect(cache.has('b')).toBe(true)
      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(true)
    })
  })

  describe('getAccessHistory', () => {
    it('returns empty for missing key', () => {
      const cache = new LRUKCache<string, number>({ k: 2, capacity: 10 })
      expect(cache.getAccessHistory('missing')).toEqual([])
    })

    it('tracks access history', () => {
      const cache = new LRUKCache<string, number>({ k: 3, capacity: 10 })
      cache.set('a', 1)
      cache.get('a')
      cache.get('a')
      const history = cache.getAccessHistory('a')
      expect(history.length).toBe(3)
    })

    it('limits history to k entries', () => {
      const cache = new LRUKCache<string, number>({ k: 2, capacity: 10 })
      cache.set('a', 1)
      cache.get('a')
      cache.get('a')
      cache.get('a')
      expect(cache.getAccessHistory('a').length).toBe(2)
    })
  })

  describe('stress test', () => {
    it('handles many operations', () => {
      const cache = new LRUKCache<number, number>({ k: 2, capacity: 100 })
      for (let i = 0; i < 200; i++) {
        cache.set(i, i * 10)
      }
      expect(cache.size).toBe(100)
      for (let i = 100; i < 200; i++) {
        expect(cache.get(i)).toBe(i * 10)
      }
    })
  })
})
