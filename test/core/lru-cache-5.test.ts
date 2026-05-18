import { describe, it, expect, beforeEach } from 'vitest'
import { LRUCache5 } from '../../src/core/lru-cache-5/index.js'

describe('LRUCache5', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('creates cache with given capacity', () => {
      const cache = new LRUCache5<string, number>(10)
      expect(cache.capacityValue).toBe(10)
      expect(cache.size).toBe(0)
    })

    it('creates cache with capacity 1', () => {
      const cache = new LRUCache5<string, number>(1)
      expect(cache.capacityValue).toBe(1)
      expect(cache.size).toBe(0)
    })

    it('throws for zero capacity', () => {
      expect(() => new LRUCache5<string, number>(0)).toThrow('Capacity must be positive')
    })

    it('throws for negative capacity', () => {
      expect(() => new LRUCache5<string, number>(-5)).toThrow('Capacity must be positive')
    })
  })

  // ─── set / get ───
  describe('set and get', () => {
    let cache: LRUCache5<string, number>

    beforeEach(() => {
      cache = new LRUCache5<string, number>(3)
    })

    it('sets and gets a value', () => {
      cache.set('a', 1)
      expect(cache.get('a')).toBe(1)
    })

    it('returns undefined for missing key', () => {
      expect(cache.get('missing')).toBeUndefined()
    })

    it('overwrites existing key value', () => {
      cache.set('a', 1)
      cache.set('a', 99)
      expect(cache.get('a')).toBe(99)
      expect(cache.size).toBe(1)
    })

    it('get returns undefined after clear', () => {
      cache.set('a', 1)
      cache.clear()
      expect(cache.get('a')).toBeUndefined()
    })
  })

  // ─── Eviction ───
  describe('eviction', () => {
    it('evicts least recently used when at capacity', () => {
      const cache = new LRUCache5<string, number>(2)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.has('a')).toBe(false)
      expect(cache.has('b')).toBe(true)
      expect(cache.has('c')).toBe(true)
      expect(cache.size).toBe(2)
    })

    it('evicts in LRU order on repeated inserts', () => {
      const cache = new LRUCache5<string, number>(2)
      cache.set('a', 1)
      cache.set('b', 2)
      // accessing 'a' makes it most recently used
      cache.get('a')
      cache.set('c', 3)
      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(false)
      expect(cache.has('c')).toBe(true)
    })

    it('evicts correctly with capacity 1', () => {
      const cache = new LRUCache5<string, number>(1)
      cache.set('a', 1)
      cache.set('b', 2)
      expect(cache.has('a')).toBe(false)
      expect(cache.get('b')).toBe(2)
      expect(cache.size).toBe(1)
    })
  })

  // ─── has ───
  describe('has', () => {
    it('returns true for existing key', () => {
      const cache = new LRUCache5<string, number>(5)
      cache.set('x', 10)
      expect(cache.has('x')).toBe(true)
    })

    it('returns false for missing key', () => {
      const cache = new LRUCache5<string, number>(5)
      expect(cache.has('x')).toBe(false)
    })

    it('returns false after delete', () => {
      const cache = new LRUCache5<string, number>(5)
      cache.set('x', 10)
      cache.delete('x')
      expect(cache.has('x')).toBe(false)
    })
  })

  // ─── delete ───
  describe('delete', () => {
    it('deletes existing key and returns true', () => {
      const cache = new LRUCache5<string, number>(5)
      cache.set('a', 1)
      expect(cache.delete('a')).toBe(true)
      expect(cache.size).toBe(0)
    })

    it('returns false for missing key', () => {
      const cache = new LRUCache5<string, number>(5)
      expect(cache.delete('missing')).toBe(false)
    })

    it('delete in middle maintains list integrity', () => {
      const cache = new LRUCache5<string, number>(5)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.delete('b')
      expect(cache.keys()).toEqual(['c', 'a'])
      expect(cache.size).toBe(2)
    })
  })

  // ─── clear ───
  describe('clear', () => {
    it('clears all entries', () => {
      const cache = new LRUCache5<string, number>(5)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.clear()
      expect(cache.size).toBe(0)
      expect(cache.has('a')).toBe(false)
      expect(cache.has('b')).toBe(false)
    })

    it('allows reuse after clear', () => {
      const cache = new LRUCache5<string, number>(2)
      cache.set('a', 1)
      cache.clear()
      cache.set('b', 2)
      expect(cache.get('b')).toBe(2)
      expect(cache.size).toBe(1)
    })
  })

  // ─── Iteration order ───
  describe('keys / values / entries', () => {
    it('keys returns keys in MRU to LRU order', () => {
      const cache = new LRUCache5<string, number>(5)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.keys()).toEqual(['c', 'b', 'a'])
    })

    it('values returns values in MRU to LRU order', () => {
      const cache = new LRUCache5<string, number>(5)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.values()).toEqual([3, 2, 1])
    })

    it('entries returns key-value pairs in MRU to LRU order', () => {
      const cache = new LRUCache5<string, number>(5)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.entries()).toEqual([['c', 3], ['b', 2], ['a', 1]])
    })

    it('get updates access order', () => {
      const cache = new LRUCache5<string, number>(5)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.get('a')
      expect(cache.keys()).toEqual(['a', 'b'])
    })

    it('returns empty arrays when empty', () => {
      const cache = new LRUCache5<string, number>(5)
      expect(cache.keys()).toEqual([])
      expect(cache.values()).toEqual([])
      expect(cache.entries()).toEqual([])
    })
  })

  // ─── Edge cases ───
  describe('edge cases', () => {
    it('works with number keys', () => {
      const cache = new LRUCache5<number, string>(3)
      cache.set(1, 'one')
      cache.set(2, 'two')
      expect(cache.get(1)).toBe('one')
    })

    it('works with object values', () => {
      const cache = new LRUCache5<string, { id: number }>(3)
      cache.set('a', { id: 1 })
      expect(cache.get('a')!.id).toBe(1)
    })

    it('set then get reorders correctly', () => {
      const cache = new LRUCache5<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      // overwrite 'a' moves it to front
      cache.set('a', 10)
      expect(cache.keys()).toEqual(['a', 'c', 'b'])
    })

    it('large capacity works correctly', () => {
      const cache = new LRUCache5<number, number>(100)
      for (let i = 0; i < 100; i++) {
        cache.set(i, i * 10)
      }
      expect(cache.size).toBe(100)
      expect(cache.get(50)).toBe(500)
    })
  })
})
