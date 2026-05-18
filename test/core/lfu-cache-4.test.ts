import { describe, it, expect, beforeEach } from 'vitest'
import { LFUCache4 } from '../../src/core/lfu-cache-4/index.js'

describe('LFUCache4', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('creates cache with given capacity', () => {
      const cache = new LFUCache4<string, number>(5)
      expect(cache.size).toBe(0)
    })

    it('creates cache with capacity 1', () => {
      const cache = new LFUCache4<string, number>(1)
      expect(cache.size).toBe(0)
    })

    it('creates cache with capacity 0', () => {
      const cache = new LFUCache4<string, number>(0)
      expect(cache.size).toBe(0)
    })
  })

  // ─── set / get ───
  describe('set and get', () => {
    let cache: LFUCache4<string, number>

    beforeEach(() => {
      cache = new LFUCache4<string, number>(3)
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

    it('tracks size correctly after multiple sets', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.size).toBe(3)
    })
  })

  // ─── has ───
  describe('has', () => {
    let cache: LFUCache4<string, number>

    beforeEach(() => {
      cache = new LFUCache4<string, number>(3)
    })

    it('returns true for existing key', () => {
      cache.set('a', 1)
      expect(cache.has('a')).toBe(true)
    })

    it('returns false for missing key', () => {
      expect(cache.has('a')).toBe(false)
    })

    it('returns false after key is deleted', () => {
      cache.set('a', 1)
      cache.delete('a')
      expect(cache.has('a')).toBe(false)
    })
  })

  // ─── Eviction ───
  describe('eviction', () => {
    it('evicts least frequently used item when at capacity', () => {
      const cache = new LFUCache4<string, number>(2)
      cache.set('a', 1)
      cache.set('b', 2)
      // access 'a' to increase its frequency
      cache.get('a')
      // 'b' has freq 1, 'a' has freq 2; inserting 'c' should evict 'b'
      cache.set('c', 3)
      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(false)
      expect(cache.has('c')).toBe(true)
    })

    it('evicts LRU among items with same frequency', () => {
      const cache = new LFUCache4<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      // all have freq 1; accessing a and b makes c the LRU at freq 1
      cache.get('a')
      cache.get('b')
      cache.set('d', 4)
      expect(cache.has('c')).toBe(false)
      expect(cache.has('d')).toBe(true)
    })

    it('does not evict when capacity is not exceeded', () => {
      const cache = new LFUCache4<string, number>(5)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.size).toBe(3)
      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(true)
      expect(cache.has('c')).toBe(true)
    })
  })

  // ─── Capacity 0 ───
  describe('zero capacity', () => {
    it('set does nothing with capacity 0', () => {
      const cache = new LFUCache4<string, number>(0)
      cache.set('a', 1)
      expect(cache.size).toBe(0)
      expect(cache.get('a')).toBeUndefined()
    })
  })

  // ─── delete ───
  describe('delete', () => {
    let cache: LFUCache4<string, number>

    beforeEach(() => {
      cache = new LFUCache4<string, number>(5)
    })

    it('deletes existing key and returns true', () => {
      cache.set('a', 1)
      expect(cache.delete('a')).toBe(true)
      expect(cache.has('a')).toBe(false)
      expect(cache.size).toBe(0)
    })

    it('returns false for missing key', () => {
      expect(cache.delete('missing')).toBe(false)
    })

    it('deletes key that was at min frequency', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.get('a') // freq of 'a' becomes 2
      cache.delete('b') // b is at min freq
      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(false)
    })
  })

  // ─── clear ───
  describe('clear', () => {
    it('removes all entries', () => {
      const cache = new LFUCache4<string, number>(5)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.clear()
      expect(cache.size).toBe(0)
      expect(cache.has('a')).toBe(false)
      expect(cache.has('b')).toBe(false)
      expect(cache.has('c')).toBe(false)
    })

    it('allows reuse after clear', () => {
      const cache = new LFUCache4<string, number>(2)
      cache.set('a', 1)
      cache.clear()
      cache.set('b', 2)
      expect(cache.get('b')).toBe(2)
      expect(cache.size).toBe(1)
    })
  })

  // ─── size ───
  describe('size', () => {
    it('returns 0 for empty cache', () => {
      const cache = new LFUCache4<string, number>(5)
      expect(cache.size).toBe(0)
    })

    it('reflects current number of entries', () => {
      const cache = new LFUCache4<string, number>(5)
      cache.set('a', 1)
      cache.set('b', 2)
      expect(cache.size).toBe(2)
      cache.delete('a')
      expect(cache.size).toBe(1)
    })
  })

  // ─── Frequency behavior ───
  describe('frequency tracking', () => {
    it('get increases frequency of accessed item', () => {
      const cache = new LFUCache4<string, number>(2)
      cache.set('a', 1)
      cache.set('b', 2)
      // access 'a' multiple times to boost its frequency
      cache.get('a')
      cache.get('a')
      cache.get('a')
      // 'b' has freq 1, so inserting 'c' should evict 'b'
      cache.set('c', 3)
      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(false)
    })

    it('set on existing key increases frequency', () => {
      const cache = new LFUCache4<string, number>(2)
      cache.set('a', 1)
      cache.set('b', 2)
      // re-set 'a' to boost frequency
      cache.set('a', 10)
      // 'b' still has freq 1, inserting 'c' evicts 'b'
      cache.set('c', 3)
      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(false)
    })
  })

  // ─── Type generics ───
  describe('type generics', () => {
    it('works with number keys', () => {
      const cache = new LFUCache4<number, string>(3)
      cache.set(1, 'one')
      cache.set(2, 'two')
      expect(cache.get(1)).toBe('one')
      expect(cache.get(2)).toBe('two')
    })

    it('works with object values', () => {
      const cache = new LFUCache4<string, { name: string }>(3)
      cache.set('a', { name: 'Alice' })
      expect(cache.get('a')).toEqual({ name: 'Alice' })
    })
  })
})
