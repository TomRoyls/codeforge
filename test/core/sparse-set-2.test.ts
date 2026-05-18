import { describe, it, expect } from 'vitest'
import { SparseSet2 } from '../../src/core/sparse-set-2/index.js'

// ─── Constructor ───

describe('SparseSet2', () => {
  describe('constructor', () => {
    it('creates an empty set with given universe size', () => {
      const set = new SparseSet2(10)
      expect(set.size).toBe(0)
      expect(set.isEmpty()).toBe(true)
    })

    it('creates a set with universe size 0', () => {
      const set = new SparseSet2(0)
      expect(set.size).toBe(0)
      expect(set.isEmpty()).toBe(true)
    })

    it('throws for negative universe size', () => {
      expect(() => new SparseSet2(-1)).toThrow('Universe size must be non-negative')
    })
  })

  // ─── Add ───

  describe('add', () => {
    it('adds a single element', () => {
      const set = new SparseSet2(10)
      expect(set.add(5)).toBe(true)
      expect(set.size).toBe(1)
      expect(set.has(5)).toBe(true)
    })

    it('adds multiple elements', () => {
      const set = new SparseSet2(10)
      set.add(1)
      set.add(3)
      set.add(7)
      expect(set.size).toBe(3)
      expect(set.has(1)).toBe(true)
      expect(set.has(3)).toBe(true)
      expect(set.has(7)).toBe(true)
    })

    it('returns false for duplicate element', () => {
      const set = new SparseSet2(10)
      expect(set.add(5)).toBe(true)
      expect(set.add(5)).toBe(false)
      expect(set.size).toBe(1)
    })

    it('throws for value out of range (negative)', () => {
      const set = new SparseSet2(10)
      expect(() => set.add(-1)).toThrow()
    })

    it('throws for value out of range (>= universe)', () => {
      const set = new SparseSet2(10)
      expect(() => set.add(10)).toThrow()
    })

    it('adds value at boundary (0)', () => {
      const set = new SparseSet2(10)
      expect(set.add(0)).toBe(true)
      expect(set.has(0)).toBe(true)
    })

    it('adds value at boundary (universeSize - 1)', () => {
      const set = new SparseSet2(10)
      expect(set.add(9)).toBe(true)
      expect(set.has(9)).toBe(true)
    })
  })

  // ─── Remove ───

  describe('remove', () => {
    it('removes an existing element', () => {
      const set = new SparseSet2(10)
      set.add(5)
      expect(set.remove(5)).toBe(true)
      expect(set.size).toBe(0)
      expect(set.has(5)).toBe(false)
    })

    it('returns false for non-existing element', () => {
      const set = new SparseSet2(10)
      set.add(5)
      expect(set.remove(3)).toBe(false)
      expect(set.size).toBe(1)
    })

    it('returns false for value out of range', () => {
      const set = new SparseSet2(10)
      expect(set.remove(-1)).toBe(false)
      expect(set.remove(10)).toBe(false)
    })

    it('removes elements maintaining remaining elements', () => {
      const set = new SparseSet2(10)
      set.add(1)
      set.add(2)
      set.add(3)
      set.remove(2)
      expect(set.has(1)).toBe(true)
      expect(set.has(2)).toBe(false)
      expect(set.has(3)).toBe(true)
      expect(set.size).toBe(2)
    })

    it('add after remove works correctly', () => {
      const set = new SparseSet2(10)
      set.add(5)
      set.remove(5)
      expect(set.add(5)).toBe(true)
      expect(set.size).toBe(1)
    })
  })

  // ─── Has ───

  describe('has', () => {
    it('returns false for empty set', () => {
      const set = new SparseSet2(10)
      expect(set.has(5)).toBe(false)
    })

    it('returns false for value out of range', () => {
      const set = new SparseSet2(10)
      expect(set.has(-1)).toBe(false)
      expect(set.has(10)).toBe(false)
    })

    it('returns true for existing element', () => {
      const set = new SparseSet2(10)
      set.add(5)
      expect(set.has(5)).toBe(true)
    })

    it('returns false after removal', () => {
      const set = new SparseSet2(10)
      set.add(5)
      set.remove(5)
      expect(set.has(5)).toBe(false)
    })
  })

  // ─── Size and isEmpty ───

  describe('size and isEmpty', () => {
    it('tracks size correctly', () => {
      const set = new SparseSet2(10)
      expect(set.size).toBe(0)
      expect(set.isEmpty()).toBe(true)
      set.add(1)
      expect(set.size).toBe(1)
      set.add(2)
      expect(set.size).toBe(2)
      set.remove(1)
      expect(set.size).toBe(1)
      set.remove(2)
      expect(set.size).toBe(0)
      expect(set.isEmpty()).toBe(true)
    })
  })

  // ─── Clear ───

  describe('clear', () => {
    it('clears all elements', () => {
      const set = new SparseSet2(10)
      set.add(1)
      set.add(2)
      set.add(3)
      set.clear()
      expect(set.size).toBe(0)
      expect(set.isEmpty()).toBe(true)
      expect(set.has(1)).toBe(false)
      expect(set.has(2)).toBe(false)
      expect(set.has(3)).toBe(false)
    })

    it('allows adding after clear', () => {
      const set = new SparseSet2(10)
      set.add(1)
      set.clear()
      set.add(2)
      expect(set.size).toBe(1)
      expect(set.has(2)).toBe(true)
    })
  })

  // ─── ForEach ───

  describe('forEach', () => {
    it('does nothing on empty set', () => {
      const set = new SparseSet2(10)
      const items: number[] = []
      set.forEach(v => items.push(v))
      expect(items).toEqual([])
    })

    it('iterates all elements', () => {
      const set = new SparseSet2(10)
      set.add(3)
      set.add(1)
      set.add(7)
      const items: number[] = []
      set.forEach(v => items.push(v))
      expect(items.sort()).toEqual([1, 3, 7])
    })
  })

  // ─── ToArray ───

  describe('toArray', () => {
    it('returns empty array for empty set', () => {
      const set = new SparseSet2(10)
      expect(set.toArray()).toEqual([])
    })

    it('returns all elements', () => {
      const set = new SparseSet2(10)
      set.add(3)
      set.add(1)
      set.add(7)
      const arr = set.toArray()
      expect(arr.sort()).toEqual([1, 3, 7])
    })
  })

  // ─── Values ───

  describe('values', () => {
    it('returns same result as toArray', () => {
      const set = new SparseSet2(10)
      set.add(3)
      set.add(1)
      set.add(7)
      expect(set.values().sort()).toEqual(set.toArray().sort())
    })
  })

  // ─── Iterator ───

  describe('Symbol.iterator', () => {
    it('iterates over all elements', () => {
      const set = new SparseSet2(10)
      set.add(3)
      set.add(1)
      set.add(7)
      const items: number[] = []
      for (const v of set) items.push(v)
      expect(items.sort()).toEqual([1, 3, 7])
    })

    it('yields nothing for empty set', () => {
      const set = new SparseSet2(10)
      const items: number[] = []
      for (const v of set) items.push(v)
      expect(items).toEqual([])
    })
  })

  // ─── Min ───

  describe('min', () => {
    it('returns undefined for empty set', () => {
      const set = new SparseSet2(10)
      expect(set.min()).toBeUndefined()
    })

    it('returns the minimum element', () => {
      const set = new SparseSet2(10)
      set.add(5)
      set.add(2)
      set.add(8)
      expect(set.min()).toBe(2)
    })

    it('returns single element', () => {
      const set = new SparseSet2(100)
      set.add(42)
      expect(set.min()).toBe(42)
    })
  })

  // ─── Max ───

  describe('max', () => {
    it('returns undefined for empty set', () => {
      const set = new SparseSet2(10)
      expect(set.max()).toBeUndefined()
    })

    it('returns the maximum element', () => {
      const set = new SparseSet2(10)
      set.add(5)
      set.add(2)
      set.add(8)
      expect(set.max()).toBe(8)
    })

    it('returns single element', () => {
      const set = new SparseSet2(100)
      set.add(42)
      expect(set.max()).toBe(42)
    })
  })

  // ─── Union ───

  describe('union', () => {
    it('unions two non-overlapping sets', () => {
      const s1 = new SparseSet2(10)
      s1.add(1)
      s1.add(2)
      const s2 = new SparseSet2(10)
      s2.add(3)
      s2.add(4)
      const result = s1.union(s2)
      expect(result.size).toBe(4)
      expect(result.has(1)).toBe(true)
      expect(result.has(2)).toBe(true)
      expect(result.has(3)).toBe(true)
      expect(result.has(4)).toBe(true)
    })

    it('unions two overlapping sets (deduplication)', () => {
      const s1 = new SparseSet2(10)
      s1.add(1)
      s1.add(2)
      const s2 = new SparseSet2(10)
      s2.add(2)
      s2.add(3)
      const result = s1.union(s2)
      expect(result.size).toBe(3)
    })

    it('throws for different universe sizes', () => {
      const s1 = new SparseSet2(10)
      const s2 = new SparseSet2(20)
      expect(() => s1.union(s2)).toThrow('Cannot union sets with different universe sizes')
    })

    it('union with empty set returns copy', () => {
      const s1 = new SparseSet2(10)
      s1.add(1)
      s1.add(2)
      const s2 = new SparseSet2(10)
      const result = s1.union(s2)
      expect(result.size).toBe(2)
    })
  })

  // ─── Intersection ───

  describe('intersection', () => {
    it('intersects two overlapping sets', () => {
      const s1 = new SparseSet2(10)
      s1.add(1)
      s1.add(2)
      s1.add(3)
      const s2 = new SparseSet2(10)
      s2.add(2)
      s2.add(3)
      s2.add(4)
      const result = s1.intersection(s2)
      expect(result.size).toBe(2)
      expect(result.has(2)).toBe(true)
      expect(result.has(3)).toBe(true)
    })

    it('returns empty set for non-overlapping', () => {
      const s1 = new SparseSet2(10)
      s1.add(1)
      s1.add(2)
      const s2 = new SparseSet2(10)
      s2.add(3)
      s2.add(4)
      const result = s1.intersection(s2)
      expect(result.size).toBe(0)
    })

    it('throws for different universe sizes', () => {
      const s1 = new SparseSet2(10)
      const s2 = new SparseSet2(20)
      expect(() => s1.intersection(s2)).toThrow('Cannot intersect sets with different universe sizes')
    })

    it('intersection with empty set returns empty', () => {
      const s1 = new SparseSet2(10)
      s1.add(1)
      s1.add(2)
      const s2 = new SparseSet2(10)
      const result = s1.intersection(s2)
      expect(result.size).toBe(0)
    })
  })
})
