import { describe, it, expect } from 'vitest'
import { LRUSet2 } from '../../src/core/lru-set-2/index.js'

// ─── Constructor ───

describe('LRUSet2', () => {
  describe('constructor', () => {
    it('creates an empty set with given capacity', () => {
      const lru = new LRUSet2<string>(10)
      expect(lru.capacity).toBe(10)
      expect(lru.size).toBe(0)
    })

    it('throws if capacity is zero', () => {
      expect(() => new LRUSet2<number>(0)).toThrow('Capacity must be positive')
    })

    it('throws if capacity is negative', () => {
      expect(() => new LRUSet2<number>(-5)).toThrow('Capacity must be positive')
    })

    it('creates with capacity of 1', () => {
      const lru = new LRUSet2<number>(1)
      expect(lru.capacity).toBe(1)
    })
  })

  // ─── Add ───

  describe('add', () => {
    it('adds a new item and returns true', () => {
      const lru = new LRUSet2<string>(5)
      expect(lru.add('a')).toBe(true)
      expect(lru.size).toBe(1)
      expect(lru.has('a')).toBe(true)
    })

    it('returns false for existing item and refreshes it', () => {
      const lru = new LRUSet2<string>(3)
      lru.add('a')
      lru.add('b')
      lru.add('a')
      expect(lru.size).toBe(2)
      expect(lru.pop()).toBe('b')
    })

    it('evicts LRU item when at capacity', () => {
      const lru = new LRUSet2<string>(2)
      lru.add('a')
      lru.add('b')
      lru.add('c')
      expect(lru.size).toBe(2)
      expect(lru.has('a')).toBe(false)
      expect(lru.has('b')).toBe(true)
      expect(lru.has('c')).toBe(true)
    })

    it('evicts multiple items to stay at capacity', () => {
      const lru = new LRUSet2<number>(3)
      lru.add(1)
      lru.add(2)
      lru.add(3)
      lru.add(4)
      lru.add(5)
      expect(lru.size).toBe(3)
      expect(lru.has(1)).toBe(false)
      expect(lru.has(2)).toBe(false)
      expect(lru.has(3)).toBe(true)
      expect(lru.has(4)).toBe(true)
      expect(lru.has(5)).toBe(true)
    })
  })

  // ─── Has ───

  describe('has', () => {
    it('returns false for missing item', () => {
      const lru = new LRUSet2<number>(5)
      expect(lru.has(1)).toBe(false)
    })

    it('returns true for existing item', () => {
      const lru = new LRUSet2<number>(5)
      lru.add(42)
      expect(lru.has(42)).toBe(true)
    })

    it('returns false after eviction', () => {
      const lru = new LRUSet2<number>(1)
      lru.add(1)
      lru.add(2)
      expect(lru.has(1)).toBe(false)
    })
  })

  // ─── Delete ───

  describe('delete', () => {
    it('removes an existing item and returns true', () => {
      const lru = new LRUSet2<string>(5)
      lru.add('x')
      expect(lru.delete('x')).toBe(true)
      expect(lru.has('x')).toBe(false)
      expect(lru.size).toBe(0)
    })

    it('returns false for missing item', () => {
      const lru = new LRUSet2<string>(5)
      expect(lru.delete('missing')).toBe(false)
    })
  })

  // ─── Touch ───

  describe('touch', () => {
    it('refreshes existing item and returns true', () => {
      const lru = new LRUSet2<string>(3)
      lru.add('a')
      lru.add('b')
      lru.add('c')
      expect(lru.touch('a')).toBe(true)
      expect(lru.pop()).toBe('b')
    })

    it('returns false for missing item', () => {
      const lru = new LRUSet2<string>(5)
      expect(lru.touch('missing')).toBe(false)
    })
  })

  // ─── Peek ───

  describe('peek', () => {
    it('returns undefined for empty set', () => {
      const lru = new LRUSet2<number>(5)
      expect(lru.peek()).toBeUndefined()
    })

    it('returns the LRU (oldest) item', () => {
      const lru = new LRUSet2<string>(5)
      lru.add('first')
      lru.add('second')
      expect(lru.peek()).toBe('first')
    })

    it('does not remove the item', () => {
      const lru = new LRUSet2<string>(5)
      lru.add('a')
      lru.peek()
      expect(lru.size).toBe(1)
    })
  })

  // ─── Pop ───

  describe('pop', () => {
    it('returns undefined for empty set', () => {
      const lru = new LRUSet2<number>(5)
      expect(lru.pop()).toBeUndefined()
    })

    it('removes and returns the LRU item', () => {
      const lru = new LRUSet2<string>(5)
      lru.add('oldest')
      lru.add('newest')
      expect(lru.pop()).toBe('oldest')
      expect(lru.size).toBe(1)
      expect(lru.has('oldest')).toBe(false)
    })

    it('pops all items in LRU order', () => {
      const lru = new LRUSet2<number>(5)
      lru.add(1)
      lru.add(2)
      lru.add(3)
      expect(lru.pop()).toBe(1)
      expect(lru.pop()).toBe(2)
      expect(lru.pop()).toBe(3)
      expect(lru.pop()).toBeUndefined()
    })
  })

  // ─── Clear ───

  describe('clear', () => {
    it('clears all items', () => {
      const lru = new LRUSet2<number>(5)
      lru.add(1)
      lru.add(2)
      lru.clear()
      expect(lru.size).toBe(0)
      expect(lru.peek()).toBeUndefined()
    })

    it('set is reusable after clear', () => {
      const lru = new LRUSet2<number>(2)
      lru.add(1)
      lru.clear()
      lru.add(99)
      expect(lru.has(99)).toBe(true)
      expect(lru.size).toBe(1)
    })
  })

  // ─── toArray ───

  describe('toArray', () => {
    it('returns empty array for empty set', () => {
      const lru = new LRUSet2<number>(5)
      expect(lru.toArray()).toEqual([])
    })

    it('returns items from newest to oldest', () => {
      const lru = new LRUSet2<string>(5)
      lru.add('a')
      lru.add('b')
      lru.add('c')
      expect(lru.toArray()).toEqual(['c', 'b', 'a'])
    })

    it('reflects touch reorder', () => {
      const lru = new LRUSet2<string>(5)
      lru.add('a')
      lru.add('b')
      lru.add('c')
      lru.touch('a')
      expect(lru.toArray()).toEqual(['a', 'c', 'b'])
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('capacity 1 only holds one item', () => {
      const lru = new LRUSet2<number>(1)
      lru.add(1)
      lru.add(2)
      expect(lru.size).toBe(1)
      expect(lru.has(1)).toBe(false)
      expect(lru.has(2)).toBe(true)
    })

    it('works with object references', () => {
      const lru = new LRUSet2<object>(5)
      const obj = { id: 1 }
      lru.add(obj)
      expect(lru.has(obj)).toBe(true)
    })

    it('add-refresh prevents eviction of touched item', () => {
      const lru = new LRUSet2<string>(2)
      lru.add('a')
      lru.add('b')
      lru.add('a')
      lru.add('c')
      expect(lru.has('a')).toBe(true)
      expect(lru.has('b')).toBe(false)
      expect(lru.has('c')).toBe(true)
    })

    it('handles many add/evict cycles', () => {
      const lru = new LRUSet2<number>(5)
      for (let i = 0; i < 100; i++) {
        lru.add(i)
      }
      expect(lru.size).toBe(5)
      expect(lru.has(95)).toBe(true)
      expect(lru.has(99)).toBe(true)
      expect(lru.has(90)).toBe(false)
    })
  })
})
