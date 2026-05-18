import { describe, it, expect } from 'vitest'
import { BeapSet2 } from '../../src/core/beap-set-2/index.js'

// ─── Constructor ───

describe('BeapSet2', () => {
  describe('constructor', () => {
    it('creates an empty set by default', () => {
      const set = new BeapSet2<number>()
      expect(set.size).toBe(0)
      expect(set.isEmpty()).toBe(true)
    })

    it('accepts a custom comparator', () => {
      const set = new BeapSet2<number>((a, b) => b - a)
      set.add(1)
      set.add(5)
      set.add(3)
      expect(set.min()).toBe(5)
      expect(set.max()).toBe(1)
    })
  })

  // ─── Add ───

  describe('add', () => {
    it('adds a single element and returns true', () => {
      const set = new BeapSet2<number>()
      expect(set.add(5)).toBe(true)
      expect(set.size).toBe(1)
      expect(set.isEmpty()).toBe(false)
    })

    it('adds multiple elements', () => {
      const set = new BeapSet2<number>()
      set.add(5)
      set.add(3)
      set.add(7)
      set.add(1)
      set.add(4)
      expect(set.size).toBe(5)
    })

    it('returns false for duplicate values', () => {
      const set = new BeapSet2<number>()
      expect(set.add(3)).toBe(true)
      expect(set.add(3)).toBe(false)
      expect(set.size).toBe(1)
    })

    it('handles negative numbers', () => {
      const set = new BeapSet2<number>()
      set.add(-3)
      set.add(0)
      set.add(-1)
      set.add(2)
      expect(set.size).toBe(4)
      expect(set.min()).toBe(-3)
    })

    it('handles strings', () => {
      const set = new BeapSet2<string>()
      set.add('cherry')
      set.add('apple')
      set.add('banana')
      expect(set.size).toBe(3)
      expect(set.min()).toBe('apple')
    })
  })

  // ─── Has ───

  describe('has', () => {
    it('returns true for existing element', () => {
      const set = new BeapSet2<number>()
      set.add(5)
      expect(set.has(5)).toBe(true)
    })

    it('returns false for non-existent element', () => {
      const set = new BeapSet2<number>()
      set.add(5)
      expect(set.has(99)).toBe(false)
    })

    it('returns false on empty set', () => {
      const set = new BeapSet2<number>()
      expect(set.has(1)).toBe(false)
    })
  })

  // ─── Delete ───

  describe('delete', () => {
    it('deletes an existing element and returns true', () => {
      const set = new BeapSet2<number>()
      set.add(5)
      expect(set.delete(5)).toBe(true)
      expect(set.size).toBe(0)
      expect(set.isEmpty()).toBe(true)
    })

    it('returns false when deleting non-existent element', () => {
      const set = new BeapSet2<number>()
      set.add(1)
      expect(set.delete(99)).toBe(false)
      expect(set.size).toBe(1)
    })

    it('returns false when deleting from empty set', () => {
      const set = new BeapSet2<number>()
      expect(set.delete(1)).toBe(false)
    })

    it('maintains min property after deletions', () => {
      const set = new BeapSet2<number>()
      set.add(5)
      set.add(3)
      set.add(7)
      set.add(1)
      set.delete(1)
      expect(set.min()).toBe(3)
    })

    it('deletes all elements one by one', () => {
      const set = new BeapSet2<number>()
      const values = [5, 3, 7, 1, 4, 6, 9]
      for (const v of values) set.add(v)
      for (const v of values) {
        expect(set.delete(v)).toBe(true)
      }
      expect(set.isEmpty()).toBe(true)
    })
  })

  // ─── Min / Max ───

  describe('min', () => {
    it('returns undefined for empty set', () => {
      const set = new BeapSet2<number>()
      expect(set.min()).toBeUndefined()
    })

    it('returns the minimum value', () => {
      const set = new BeapSet2<number>()
      set.add(5)
      set.add(3)
      set.add(7)
      set.add(1)
      expect(set.min()).toBe(1)
    })
  })

  describe('max', () => {
    it('returns undefined for empty set', () => {
      const set = new BeapSet2<number>()
      expect(set.max()).toBeUndefined()
    })

    it('returns the maximum value', () => {
      const set = new BeapSet2<number>()
      set.add(5)
      set.add(3)
      set.add(7)
      set.add(1)
      expect(set.max()).toBe(7)
    })

    it('scans all elements to find max', () => {
      const set = new BeapSet2<number>()
      set.add(10)
      set.add(20)
      set.add(30)
      set.add(40)
      expect(set.max()).toBe(40)
    })
  })

  // ─── forEach ───

  describe('forEach', () => {
    it('does nothing on empty set', () => {
      const set = new BeapSet2<number>()
      const collected: number[] = []
      set.forEach((v) => collected.push(v))
      expect(collected).toEqual([])
    })

    it('iterates in sorted order', () => {
      const set = new BeapSet2<number>()
      set.add(5)
      set.add(3)
      set.add(7)
      set.add(1)
      const collected: number[] = []
      set.forEach((v) => collected.push(v))
      expect(collected).toEqual([1, 3, 5, 7])
    })
  })

  // ─── toArray ───

  describe('toArray', () => {
    it('returns empty array for empty set', () => {
      const set = new BeapSet2<number>()
      expect(set.toArray()).toEqual([])
    })

    it('returns sorted array', () => {
      const set = new BeapSet2<number>()
      set.add(5)
      set.add(3)
      set.add(7)
      set.add(1)
      set.add(9)
      expect(set.toArray()).toEqual([1, 3, 5, 7, 9])
    })

    it('handles single element', () => {
      const set = new BeapSet2<number>()
      set.add(42)
      expect(set.toArray()).toEqual([42])
    })
  })

  // ─── Size / isEmpty / clear ───

  describe('size', () => {
    it('tracks size correctly', () => {
      const set = new BeapSet2<number>()
      expect(set.size).toBe(0)
      set.add(1)
      expect(set.size).toBe(1)
      set.add(2)
      expect(set.size).toBe(2)
      set.delete(1)
      expect(set.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('returns true when empty', () => {
      const set = new BeapSet2<number>()
      expect(set.isEmpty()).toBe(true)
    })

    it('returns false when not empty', () => {
      const set = new BeapSet2<number>()
      set.add(1)
      expect(set.isEmpty()).toBe(false)
    })
  })

  describe('clear', () => {
    it('removes all elements', () => {
      const set = new BeapSet2<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      set.clear()
      expect(set.size).toBe(0)
      expect(set.isEmpty()).toBe(true)
      expect(set.min()).toBeUndefined()
      expect(set.max()).toBeUndefined()
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('handles many sequential inserts and deletes', () => {
      const set = new BeapSet2<number>()
      for (let i = 0; i < 50; i++) set.add(i)
      expect(set.size).toBe(50)
      for (let i = 0; i < 50; i++) set.delete(i)
      expect(set.isEmpty()).toBe(true)
    })

    it('handles single element add and delete', () => {
      const set = new BeapSet2<number>()
      set.add(42)
      expect(set.has(42)).toBe(true)
      expect(set.min()).toBe(42)
      expect(set.max()).toBe(42)
      set.delete(42)
      expect(set.has(42)).toBe(false)
      expect(set.min()).toBeUndefined()
      expect(set.max()).toBeUndefined()
    })

    it('correctly sorts with negative values', () => {
      const set = new BeapSet2<number>()
      set.add(-5)
      set.add(3)
      set.add(-1)
      set.add(0)
      set.add(-3)
      expect(set.toArray()).toEqual([-5, -3, -1, 0, 3])
    })

    it('prevents duplicate via has check on add', () => {
      const set = new BeapSet2<number>()
      set.add(5)
      expect(set.add(5)).toBe(false)
      set.delete(5)
      expect(set.add(5)).toBe(true)
    })
  })
})
