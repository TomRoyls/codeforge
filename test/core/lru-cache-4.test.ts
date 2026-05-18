import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LRUCache4 } from '../../src/core/lru-cache-4/index.js'

describe('LRUCache4', () => {
  describe('constructor', () => {
    it('creates cache with specified capacity', () => {
      const cache = new LRUCache4<string, number>(10)
      expect(cache.capacity).toBe(10)
      expect(cache.size).toBe(0)
    })

    it('creates cache with capacity 1', () => {
      const cache = new LRUCache4<string, number>(1)
      expect(cache.capacity).toBe(1)
    })

    it('throws for capacity 0', () => {
      expect(() => new LRUCache4<string, number>(0)).toThrow('Capacity must be positive')
    })

    it('throws for negative capacity', () => {
      expect(() => new LRUCache4<string, number>(-5)).toThrow('Capacity must be positive')
    })

    it('accepts optional ttl parameter', () => {
      const cache = new LRUCache4<string, number>(10, 1000)
      expect(cache.capacity).toBe(10)
    })
  })

  // ─── set and get ───

  describe('set and get', () => {
    let cache: LRUCache4<string, number>

    beforeEach(() => {
      cache = new LRUCache4<string, number>(3)
    })

    it('stores and retrieves values', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      expect(cache.get('a')).toBe(1)
      expect(cache.get('b')).toBe(2)
    })

    it('returns undefined for missing key', () => {
      expect(cache.get('missing')).toBeUndefined()
    })

    it('updates existing key value', () => {
      cache.set('a', 1)
      cache.set('a', 99)
      expect(cache.get('a')).toBe(99)
    })

    it('does not increase size when updating existing key', () => {
      cache.set('a', 1)
      cache.set('a', 2)
      expect(cache.size).toBe(1)
    })

    it('evicts LRU entry when at capacity', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4)
      expect(cache.get('a')).toBeUndefined()
      expect(cache.get('b')).toBe(2)
      expect(cache.get('c')).toBe(3)
      expect(cache.get('d')).toBe(4)
    })

    it('get promotes entry to most recently used', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.get('a')
      cache.set('d', 4)
      expect(cache.get('a')).toBe(1)
      expect(cache.get('b')).toBeUndefined()
    })

    it('set on existing key promotes to most recently used', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('a', 10)
      cache.set('d', 4)
      expect(cache.get('a')).toBe(10)
      expect(cache.get('b')).toBeUndefined()
      expect(cache.get('c')).toBe(3)
      expect(cache.get('d')).toBe(4)
    })
  })

  // ─── delete ───

  describe('delete', () => {
    it('removes existing key and returns true', () => {
      const cache = new LRUCache4<string, number>(5)
      cache.set('a', 1)
      expect(cache.delete('a')).toBe(true)
      expect(cache.get('a')).toBeUndefined()
    })

    it('returns false for missing key', () => {
      const cache = new LRUCache4<string, number>(5)
      expect(cache.delete('missing')).toBe(false)
    })

    it('decreases size after removal', () => {
      const cache = new LRUCache4<string, number>(5)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.delete('a')
      expect(cache.size).toBe(1)
    })
  })

  // ─── has ───

  describe('has', () => {
    it('returns true for existing key', () => {
      const cache = new LRUCache4<string, number>(5)
      cache.set('a', 1)
      expect(cache.has('a')).toBe(true)
    })

    it('returns false for missing key', () => {
      const cache = new LRUCache4<string, number>(5)
      expect(cache.has('missing')).toBe(false)
    })

    it('returns false after key is deleted', () => {
      const cache = new LRUCache4<string, number>(5)
      cache.set('a', 1)
      cache.delete('a')
      expect(cache.has('a')).toBe(false)
    })
  })

  // ─── peek ───

  describe('peek', () => {
    it('returns value without promoting', () => {
      const cache = new LRUCache4<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.peek('a')
      cache.set('d', 4)
      expect(cache.get('a')).toBeUndefined()
    })

    it('returns undefined for missing key', () => {
      const cache = new LRUCache4<string, number>(5)
      expect(cache.peek('missing')).toBeUndefined()
    })
  })

  // ─── keys, values, entries ───

  describe('keys, values, entries', () => {
    it('keys returns keys in LRU order (most recent first)', () => {
      const cache = new LRUCache4<string, number>(5)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.keys()).toEqual(['c', 'b', 'a'])
    })

    it('values returns values in LRU order', () => {
      const cache = new LRUCache4<string, number>(5)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.values()).toEqual([3, 2, 1])
    })

    it('entries returns entries in LRU order', () => {
      const cache = new LRUCache4<string, number>(5)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.entries()).toEqual([['c', 3], ['b', 2], ['a', 1]])
    })

    it('returns empty arrays for empty cache', () => {
      const cache = new LRUCache4<string, number>(5)
      expect(cache.keys()).toEqual([])
      expect(cache.values()).toEqual([])
      expect(cache.entries()).toEqual([])
    })
  })

  // ─── forEach ───

  describe('forEach', () => {
    it('iterates over all entries in LRU order', () => {
      const cache = new LRUCache4<string, number>(5)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      const result: [string, number][] = []
      cache.forEach((value, key) => result.push([key, value]))
      expect(result).toEqual([['c', 3], ['b', 2], ['a', 1]])
    })

    it('does not iterate on empty cache', () => {
      const cache = new LRUCache4<string, number>(5)
      let count = 0
      cache.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  // ─── clear ───

  describe('clear', () => {
    it('removes all entries', () => {
      const cache = new LRUCache4<string, number>(5)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.clear()
      expect(cache.size).toBe(0)
      expect(cache.get('a')).toBeUndefined()
    })
  })

  // ─── resize ───

  describe('resize', () => {
    it('changes the capacity', () => {
      const cache = new LRUCache4<string, number>(5)
      cache.resize(10)
      expect(cache.capacity).toBe(10)
    })

    it('evicts entries if new capacity is smaller', () => {
      const cache = new LRUCache4<string, number>(5)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4)
      cache.set('e', 5)
      cache.resize(2)
      expect(cache.size).toBe(2)
      expect(cache.capacity).toBe(2)
    })

    it('throws for capacity 0', () => {
      const cache = new LRUCache4<string, number>(5)
      expect(() => cache.resize(0)).toThrow('Capacity must be positive')
    })

    it('throws for negative capacity', () => {
      const cache = new LRUCache4<string, number>(5)
      expect(() => cache.resize(-1)).toThrow('Capacity must be positive')
    })
  })

  // ─── getTimeComplexity ───

  describe('getTimeComplexity', () => {
    it('returns complexity for known operations', () => {
      const cache = new LRUCache4<string, number>(5)
      expect(cache.getTimeComplexity('get')).toBe('O(1) average')
      expect(cache.getTimeComplexity('set')).toBe('O(1) average')
      expect(cache.getTimeComplexity('clear')).toBe('O(1)')
    })

    it('returns unknown for unknown operation', () => {
      const cache = new LRUCache4<string, number>(5)
      expect(cache.getTimeComplexity('unknown')).toBe('Unknown operation')
    })
  })

  // ─── size property ───

  describe('size property', () => {
    it('returns current number of entries', () => {
      const cache = new LRUCache4<string, number>(5)
      expect(cache.size).toBe(0)
      cache.set('a', 1)
      expect(cache.size).toBe(1)
      cache.set('b', 2)
      expect(cache.size).toBe(2)
    })

    it('does not exceed capacity', () => {
      const cache = new LRUCache4<string, number>(2)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.size).toBe(2)
    })
  })

  // ─── TTL ───

  describe('TTL expiration', () => {
    it('expired entries return undefined on get', () => {
      vi.useFakeTimers()
      const cache = new LRUCache4<string, number>(5, 100)
      cache.set('a', 1)
      vi.advanceTimersByTime(101)
      expect(cache.get('a')).toBeUndefined()
      vi.useRealTimers()
    })

    it('has returns false for expired entries', () => {
      vi.useFakeTimers()
      const cache = new LRUCache4<string, number>(5, 100)
      cache.set('a', 1)
      vi.advanceTimersByTime(101)
      expect(cache.has('a')).toBe(false)
      vi.useRealTimers()
    })

    it('peek returns undefined for expired entries', () => {
      vi.useFakeTimers()
      const cache = new LRUCache4<string, number>(5, 100)
      cache.set('a', 1)
      vi.advanceTimersByTime(101)
      expect(cache.peek('a')).toBeUndefined()
      vi.useRealTimers()
    })

    it('non-expired entries are still accessible', () => {
      vi.useFakeTimers()
      const cache = new LRUCache4<string, number>(5, 1000)
      cache.set('a', 1)
      vi.advanceTimersByTime(500)
      expect(cache.get('a')).toBe(1)
      vi.useRealTimers()
    })
  })

  // ─── edge cases ───

  describe('edge cases', () => {
    it('works with number keys', () => {
      const cache = new LRUCache4<number, string>(5)
      cache.set(1, 'one')
      cache.set(2, 'two')
      expect(cache.get(1)).toBe('one')
    })

    it('works with object values', () => {
      const cache = new LRUCache4<string, { x: number }>(5)
      cache.set('a', { x: 1 })
      expect(cache.get('a')).toEqual({ x: 1 })
    })

    it('capacity 1 evicts after one entry', () => {
      const cache = new LRUCache4<string, number>(1)
      cache.set('a', 1)
      cache.set('b', 2)
      expect(cache.get('a')).toBeUndefined()
      expect(cache.get('b')).toBe(2)
      expect(cache.size).toBe(1)
    })

    it('duplicate set does not cause eviction', () => {
      const cache = new LRUCache4<string, number>(2)
      cache.set('a', 1)
      cache.set('a', 1)
      cache.set('b', 2)
      expect(cache.size).toBe(2)
      expect(cache.get('a')).toBe(1)
      expect(cache.get('b')).toBe(2)
    })
  })
})
