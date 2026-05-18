import { describe, it, expect, beforeEach } from 'vitest'
import { IntervalSet2 } from '../../src/core/interval-set-2/index.js'

describe('IntervalSet2', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('creates empty set', () => {
      const set = new IntervalSet2()
      expect(set.size()).toBe(0)
      expect(set.intervals()).toEqual([])
    })
  })

  // ─── add ───
  describe('add', () => {
    it('adds a single interval', () => {
      const set = new IntervalSet2()
      set.add(1, 5)
      expect(set.intervals()).toEqual([[1, 5]])
      expect(set.size()).toBe(1)
    })

    it('adds non-overlapping intervals', () => {
      const set = new IntervalSet2()
      set.add(1, 3)
      set.add(7, 9)
      expect(set.intervals()).toEqual([[1, 3], [7, 9]])
    })

    it('merges overlapping intervals', () => {
      const set = new IntervalSet2()
      set.add(1, 5)
      set.add(4, 8)
      expect(set.intervals()).toEqual([[1, 8]])
    })

    it('merges adjacent intervals', () => {
      const set = new IntervalSet2()
      set.add(1, 3)
      set.add(4, 6)
      expect(set.intervals()).toEqual([[1, 6]])
    })

    it('merges interval that contains another', () => {
      const set = new IntervalSet2()
      set.add(2, 4)
      set.add(1, 8)
      expect(set.intervals()).toEqual([[1, 8]])
    })

    it('swaps start and end when start > end', () => {
      const set = new IntervalSet2()
      set.add(5, 1)
      expect(set.intervals()).toEqual([[1, 5]])
    })

    it('merges multiple intervals into one', () => {
      const set = new IntervalSet2()
      set.add(1, 3)
      set.add(5, 7)
      set.add(2, 6)
      expect(set.intervals()).toEqual([[1, 7]])
    })

    it('handles single point interval', () => {
      const set = new IntervalSet2()
      set.add(5, 5)
      expect(set.intervals()).toEqual([[5, 5]])
    })
  })

  // ─── remove ───
  describe('remove', () => {
    it('removes an entire interval', () => {
      const set = new IntervalSet2()
      set.add(1, 10)
      set.remove(1, 10)
      expect(set.intervals()).toEqual([])
    })

    it('removes middle portion splitting interval', () => {
      const set = new IntervalSet2()
      set.add(1, 10)
      set.remove(4, 6)
      expect(set.intervals()).toEqual([[1, 3], [7, 10]])
    })

    it('removes from beginning', () => {
      const set = new IntervalSet2()
      set.add(1, 10)
      set.remove(1, 4)
      expect(set.intervals()).toEqual([[5, 10]])
    })

    it('removes from end', () => {
      const set = new IntervalSet2()
      set.add(1, 10)
      set.remove(7, 10)
      expect(set.intervals()).toEqual([[1, 6]])
    })

    it('removes non-overlapping range does nothing', () => {
      const set = new IntervalSet2()
      set.add(1, 5)
      set.remove(10, 15)
      expect(set.intervals()).toEqual([[1, 5]])
    })

    it('swaps start and end when start > end', () => {
      const set = new IntervalSet2()
      set.add(1, 10)
      set.remove(6, 3)
      expect(set.intervals()).toEqual([[1, 2], [7, 10]])
    })
  })

  // ─── has ───
  describe('has', () => {
    it('returns true for exact interval', () => {
      const set = new IntervalSet2()
      set.add(1, 5)
      expect(set.has(1, 5)).toBe(true)
    })

    it('returns false for partial match', () => {
      const set = new IntervalSet2()
      set.add(1, 5)
      expect(set.has(1, 3)).toBe(false)
    })

    it('returns false for missing interval', () => {
      const set = new IntervalSet2()
      expect(set.has(1, 5)).toBe(false)
    })
  })

  // ─── contains ───
  describe('contains', () => {
    it('returns true for point inside interval', () => {
      const set = new IntervalSet2()
      set.add(1, 5)
      expect(set.contains(3)).toBe(true)
    })

    it('returns true for point at interval boundary', () => {
      const set = new IntervalSet2()
      set.add(1, 5)
      expect(set.contains(1)).toBe(true)
      expect(set.contains(5)).toBe(true)
    })

    it('returns false for point outside intervals', () => {
      const set = new IntervalSet2()
      set.add(1, 5)
      expect(set.contains(0)).toBe(false)
      expect(set.contains(6)).toBe(false)
    })

    it('returns false on empty set', () => {
      const set = new IntervalSet2()
      expect(set.contains(1)).toBe(false)
    })
  })

  // ─── overlaps ───
  describe('overlaps', () => {
    it('returns true for overlapping range', () => {
      const set = new IntervalSet2()
      set.add(3, 7)
      expect(set.overlaps(5, 10)).toBe(true)
    })

    it('returns true for contained range', () => {
      const set = new IntervalSet2()
      set.add(1, 10)
      expect(set.overlaps(3, 5)).toBe(true)
    })

    it('returns false for non-overlapping range', () => {
      const set = new IntervalSet2()
      set.add(1, 5)
      expect(set.overlaps(6, 10)).toBe(false)
    })

    it('returns true for adjacent range (boundary overlap)', () => {
      const set = new IntervalSet2()
      set.add(1, 5)
      expect(set.overlaps(5, 10)).toBe(true)
    })
  })

  // ─── union ───
  describe('union', () => {
    it('returns union of two disjoint sets', () => {
      const a = new IntervalSet2()
      a.add(1, 3)
      const b = new IntervalSet2()
      b.add(7, 9)
      const result = a.union(b)
      expect(result.intervals()).toEqual([[1, 3], [7, 9]])
    })

    it('returns merged union for overlapping sets', () => {
      const a = new IntervalSet2()
      a.add(1, 5)
      const b = new IntervalSet2()
      b.add(4, 8)
      const result = a.union(b)
      expect(result.intervals()).toEqual([[1, 8]])
    })

    it('does not mutate original sets', () => {
      const a = new IntervalSet2()
      a.add(1, 3)
      const b = new IntervalSet2()
      b.add(5, 7)
      a.union(b)
      expect(a.intervals()).toEqual([[1, 3]])
      expect(b.intervals()).toEqual([[5, 7]])
    })
  })

  // ─── totalLength ───
  describe('totalLength', () => {
    it('returns 0 for empty set', () => {
      const set = new IntervalSet2()
      expect(set.totalLength()).toBe(0)
    })

    it('returns length of single interval', () => {
      const set = new IntervalSet2()
      set.add(1, 5)
      expect(set.totalLength()).toBe(5)
    })

    it('sums lengths of multiple intervals', () => {
      const set = new IntervalSet2()
      set.add(1, 3)
      set.add(10, 14)
      expect(set.totalLength()).toBe(3 + 5)
    })

    it('single point interval has length 1', () => {
      const set = new IntervalSet2()
      set.add(5, 5)
      expect(set.totalLength()).toBe(1)
    })
  })

  // ─── clear ───
  describe('clear', () => {
    it('removes all intervals', () => {
      const set = new IntervalSet2()
      set.add(1, 10)
      set.clear()
      expect(set.size()).toBe(0)
      expect(set.intervals()).toEqual([])
    })
  })
})
