import { describe, it, expect } from 'vitest'
import { IntervalSet2 } from '../src/core/interval-set-2/index.js'

describe('IntervalSet2', () => {
  describe('empty set', () => {
    it('creates empty set', () => {
      const set = new IntervalSet2()
      expect(set.size()).toBe(0)
      expect(set.intervals()).toEqual([])
    })

    it('contains returns false for empty set', () => {
      const set = new IntervalSet2()
      expect(set.contains(5)).toBe(false)
    })

    it('has returns false for empty set', () => {
      const set = new IntervalSet2()
      expect(set.has(1, 3)).toBe(false)
    })

    it('overlaps returns false for empty set', () => {
      const set = new IntervalSet2()
      expect(set.overlaps(1, 3)).toBe(false)
    })

    it('totalLength returns 0 for empty set', () => {
      const set = new IntervalSet2()
      expect(set.totalLength()).toBe(0)
    })
  })

  describe('add single', () => {
    it('adds single interval', () => {
      const set = new IntervalSet2()
      set.add(1, 5)
      expect(set.size()).toBe(1)
      expect(set.intervals()).toEqual([[1, 5]])
    })

    it('handles reversed interval', () => {
      const set = new IntervalSet2()
      set.add(5, 1)
      expect(set.intervals()).toEqual([[1, 5]])
    })

    it('handles single point interval', () => {
      const set = new IntervalSet2()
      set.add(5, 5)
      expect(set.intervals()).toEqual([[5, 5]])
    })
  })

  describe('add overlapping', () => {
    it('merges overlapping intervals', () => {
      const set = new IntervalSet2()
      set.add(1, 5)
      set.add(3, 8)
      expect(set.size()).toBe(1)
      expect(set.intervals()).toEqual([[1, 8]])
    })

    it('merges when new interval covers existing', () => {
      const set = new IntervalSet2()
      set.add(3, 5)
      set.add(1, 8)
      expect(set.intervals()).toEqual([[1, 8]])
    })

    it('merges when existing interval covers new', () => {
      const set = new IntervalSet2()
      set.add(1, 8)
      set.add(3, 5)
      expect(set.intervals()).toEqual([[1, 8]])
    })
  })

  describe('add adjacent', () => {
    it('merges adjacent intervals', () => {
      const set = new IntervalSet2()
      set.add(1, 5)
      set.add(6, 10)
      expect(set.size()).toBe(1)
      expect(set.intervals()).toEqual([[1, 10]])
    })

    it('merges when adding before existing', () => {
      const set = new IntervalSet2()
      set.add(5, 10)
      set.add(1, 4)
      expect(set.intervals()).toEqual([[1, 10]])
    })
  })

  describe('add disjoint', () => {
    it('keeps disjoint intervals separate', () => {
      const set = new IntervalSet2()
      set.add(1, 3)
      set.add(7, 10)
      expect(set.size()).toBe(2)
      expect(set.intervals()).toEqual([[1, 3], [7, 10]])
    })

    it('inserts in correct position', () => {
      const set = new IntervalSet2()
      set.add(10, 15)
      set.add(1, 5)
      set.add(20, 25)
      expect(set.intervals()).toEqual([[1, 5], [10, 15], [20, 25]])
    })
  })

  describe('remove', () => {
    it('removes entire interval', () => {
      const set = new IntervalSet2()
      set.add(1, 5)
      set.remove(1, 5)
      expect(set.size()).toBe(0)
    })

    it('removes part of interval', () => {
      const set = new IntervalSet2()
      set.add(1, 10)
      set.remove(3, 7)
      expect(set.intervals()).toEqual([[1, 2], [8, 10]])
    })

    it('removes from start of interval', () => {
      const set = new IntervalSet2()
      set.add(1, 10)
      set.remove(1, 5)
      expect(set.intervals()).toEqual([[6, 10]])
    })

    it('removes from end of interval', () => {
      const set = new IntervalSet2()
      set.add(1, 10)
      set.remove(6, 10)
      expect(set.intervals()).toEqual([[1, 5]])
    })

    it('handles reversed remove', () => {
      const set = new IntervalSet2()
      set.add(1, 10)
      set.remove(7, 3)
      expect(set.intervals()).toEqual([[1, 2], [8, 10]])
    })

    it('removes from multiple intervals', () => {
      const set = new IntervalSet2()
      set.add(1, 5)
      set.add(10, 15)
      set.add(20, 25)
      set.remove(3, 12)
      expect(set.intervals()).toEqual([[1, 2], [13, 15], [20, 25]])
    })
  })

  describe('contains point', () => {
    it('returns true for point inside interval', () => {
      const set = new IntervalSet2()
      set.add(5, 10)
      expect(set.contains(7)).toBe(true)
    })

    it('returns true for interval endpoints', () => {
      const set = new IntervalSet2()
      set.add(5, 10)
      expect(set.contains(5)).toBe(true)
      expect(set.contains(10)).toBe(true)
    })

    it('returns false for point outside interval', () => {
      const set = new IntervalSet2()
      set.add(5, 10)
      expect(set.contains(4)).toBe(false)
      expect(set.contains(11)).toBe(false)
    })
  })

  describe('overlaps', () => {
    it('returns true for overlapping intervals', () => {
      const set = new IntervalSet2()
      set.add(1, 5)
      expect(set.overlaps(3, 8)).toBe(true)
    })

    it('returns true for touching intervals', () => {
      const set = new IntervalSet2()
      set.add(1, 5)
      expect(set.overlaps(5, 8)).toBe(true)
    })

    it('returns false for disjoint intervals', () => {
      const set = new IntervalSet2()
      set.add(1, 5)
      expect(set.overlaps(7, 10)).toBe(false)
    })

    it('returns true when query contains interval', () => {
      const set = new IntervalSet2()
      set.add(3, 7)
      expect(set.overlaps(1, 10)).toBe(true)
    })

    it('handles reversed query', () => {
      const set = new IntervalSet2()
      set.add(1, 5)
      expect(set.overlaps(8, 3)).toBe(true)
    })
  })

  describe('has exact', () => {
    it('returns true for exact match', () => {
      const set = new IntervalSet2()
      set.add(1, 5)
      expect(set.has(1, 5)).toBe(true)
    })

    it('returns false for different interval', () => {
      const set = new IntervalSet2()
      set.add(1, 5)
      expect(set.has(1, 6)).toBe(false)
      expect(set.has(2, 5)).toBe(false)
    })

    it('returns false for empty set', () => {
      const set = new IntervalSet2()
      expect(set.has(1, 5)).toBe(false)
    })

    it('handles reversed query', () => {
      const set = new IntervalSet2()
      set.add(1, 5)
      expect(set.has(5, 1)).toBe(true)
    })
  })

  describe('intervals sorted', () => {
    it('returns sorted intervals', () => {
      const set = new IntervalSet2()
      set.add(10, 15)
      set.add(1, 5)
      set.add(20, 25)
      expect(set.intervals()).toEqual([[1, 5], [10, 15], [20, 25]])
    })

    it('returns copy not reference', () => {
      const set = new IntervalSet2()
      set.add(1, 5)
      const intervals = set.intervals()
      intervals.push([10, 15])
      expect(set.intervals()).toEqual([[1, 5]])
    })
  })

  describe('size', () => {
    it('returns number of intervals', () => {
      const set = new IntervalSet2()
      expect(set.size()).toBe(0)
      set.add(1, 5)
      expect(set.size()).toBe(1)
      set.add(10, 15)
      expect(set.size()).toBe(2)
    })
  })

  describe('clear', () => {
    it('clears all intervals', () => {
      const set = new IntervalSet2()
      set.add(1, 5)
      set.add(10, 15)
      set.clear()
      expect(set.size()).toBe(0)
      expect(set.intervals()).toEqual([])
    })
  })

  describe('union', () => {
    it('unions two sets', () => {
      const set1 = new IntervalSet2()
      set1.add(1, 5)
      const set2 = new IntervalSet2()
      set2.add(3, 8)
      const result = set1.union(set2)
      expect(result.intervals()).toEqual([[1, 8]])
    })

    it('does not modify original sets', () => {
      const set1 = new IntervalSet2()
      set1.add(1, 5)
      const set2 = new IntervalSet2()
      set2.add(10, 15)
      set1.union(set2)
      expect(set1.intervals()).toEqual([[1, 5]])
      expect(set2.intervals()).toEqual([[10, 15]])
    })

    it('handles disjoint sets', () => {
      const set1 = new IntervalSet2()
      set1.add(1, 3)
      const set2 = new IntervalSet2()
      set2.add(10, 15)
      const result = set1.union(set2)
      expect(result.intervals()).toEqual([[1, 3], [10, 15]])
    })

    it('handles empty set', () => {
      const set1 = new IntervalSet2()
      set1.add(1, 5)
      const set2 = new IntervalSet2()
      const result = set1.union(set2)
      expect(result.intervals()).toEqual([[1, 5]])
    })
  })

  describe('totalLength', () => {
    it('calculates total length', () => {
      const set = new IntervalSet2()
      set.add(1, 5)
      expect(set.totalLength()).toBe(5)
      set.add(10, 15)
      expect(set.totalLength()).toBe(11)
    })

    it('handles single point', () => {
      const set = new IntervalSet2()
      set.add(5, 5)
      expect(set.totalLength()).toBe(1)
    })

    it('handles merged intervals', () => {
      const set = new IntervalSet2()
      set.add(1, 5)
      set.add(3, 8)
      expect(set.totalLength()).toBe(8)
    })
  })

  describe('complex sequences', () => {
    it('handles complex add-remove sequence', () => {
      const set = new IntervalSet2()
      set.add(1, 5)
      set.add(10, 15)
      set.remove(3, 7)
      set.add(20, 25)
      expect(set.intervals()).toEqual([[1, 2], [10, 15], [20, 25]])
    })

    it('handles multiple overlapping additions', () => {
      const set = new IntervalSet2()
      set.add(1, 3)
      set.add(5, 7)
      set.add(2, 6)
      expect(set.intervals()).toEqual([[1, 7]])
    })
  })

  describe('edge cases', () => {
    it('handles negative numbers', () => {
      const set = new IntervalSet2()
      set.add(-5, -1)
      set.add(1, 5)
      expect(set.intervals()).toEqual([[-5, -1], [1, 5]])
    })

    it('handles zero', () => {
      const set = new IntervalSet2()
      set.add(0, 5)
      expect(set.contains(0)).toBe(true)
    })

    it('handles large numbers', () => {
      const set = new IntervalSet2()
      set.add(1000000, 1000005)
      expect(set.intervals()).toEqual([[1000000, 1000005]])
    })

    it('handles same start and end', () => {
      const set = new IntervalSet2()
      set.add(5, 5)
      set.add(5, 5)
      expect(set.intervals()).toEqual([[5, 5]])
    })
  })
})
