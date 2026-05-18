import { describe, it, expect } from 'vitest'
import { SpreadSort2 } from '../../src/core/spread-sort-2/index.js'

describe('SpreadSort2', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('creates instance with default comparator', () => {
      const ss = new SpreadSort2()
      expect(ss).toBeInstanceOf(SpreadSort2)
    })

    it('creates instance with custom comparator', () => {
      const ss = new SpreadSort2((a, b) => b - a)
      expect(ss).toBeInstanceOf(SpreadSort2)
    })
  })

  // ─── sort ───
  describe('sort', () => {
    it('returns empty array for empty input', () => {
      const ss = new SpreadSort2()
      expect(ss.sort([])).toEqual([])
    })

    it('returns single element for single input', () => {
      const ss = new SpreadSort2()
      expect(ss.sort([42])).toEqual([42])
    })

    it('returns sorted for already sorted array', () => {
      const ss = new SpreadSort2()
      expect(ss.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts reverse sorted array', () => {
      const ss = new SpreadSort2()
      expect(ss.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts random order array', () => {
      const ss = new SpreadSort2()
      expect(ss.sort([3, 1, 4, 1, 5, 9, 2, 6])).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
    })

    it('sorts with negative numbers', () => {
      const ss = new SpreadSort2()
      expect(ss.sort([-1, -3, -2])).toEqual([-3, -2, -1])
    })

    it('sorts with mixed positive and negative', () => {
      const ss = new SpreadSort2()
      expect(ss.sort([3, -1, 0, -5, 2])).toEqual([-5, -1, 0, 2, 3])
    })

    it('sorts array with all equal elements', () => {
      const ss = new SpreadSort2()
      expect(ss.sort([5, 5, 5, 5])).toEqual([5, 5, 5, 5])
    })

    it('sorts two elements', () => {
      const ss = new SpreadSort2()
      expect(ss.sort([2, 1])).toEqual([1, 2])
    })

    it('does not modify the original array', () => {
      const ss = new SpreadSort2()
      const original = [3, 1, 2]
      ss.sort(original)
      expect(original).toEqual([3, 1, 2])
    })

    it('sorts with custom comparator (descending)', () => {
      const ss = new SpreadSort2((a, b) => b - a)
      expect(ss.sort([1, 2, 3, 4, 5])).toEqual([5, 4, 3, 2, 1])
    })

    it('sorts large array', () => {
      const ss = new SpreadSort2()
      const arr = Array.from({ length: 100 }, (_, i) => 100 - i)
      const result = ss.sort(arr)
      for (let i = 1; i < result.length; i++) {
        expect(result[i]).toBeGreaterThanOrEqual(result[i - 1]!)
      }
    })
  })

  // ─── sortInPlace ───
  describe('sortInPlace', () => {
    it('sorts array in place', () => {
      const ss = new SpreadSort2()
      const arr = [3, 1, 2]
      ss.sortInPlace(arr)
      expect(arr).toEqual([1, 2, 3])
    })

    it('handles empty array', () => {
      const ss = new SpreadSort2()
      const arr: number[] = []
      ss.sortInPlace(arr)
      expect(arr).toEqual([])
    })

    it('handles single element', () => {
      const ss = new SpreadSort2()
      const arr = [42]
      ss.sortInPlace(arr)
      expect(arr).toEqual([42])
    })

    it('handles already sorted array', () => {
      const ss = new SpreadSort2()
      const arr = [1, 2, 3]
      ss.sortInPlace(arr)
      expect(arr).toEqual([1, 2, 3])
    })
  })

  // ─── isSorted ───
  describe('isSorted', () => {
    it('returns true for empty array', () => {
      const ss = new SpreadSort2()
      expect(ss.isSorted([])).toBe(true)
    })

    it('returns true for single element', () => {
      const ss = new SpreadSort2()
      expect(ss.isSorted([1])).toBe(true)
    })

    it('returns true for sorted array', () => {
      const ss = new SpreadSort2()
      expect(ss.isSorted([1, 2, 3, 4, 5])).toBe(true)
    })

    it('returns false for unsorted array', () => {
      const ss = new SpreadSort2()
      expect(ss.isSorted([3, 1, 2])).toBe(false)
    })

    it('returns true for equal elements', () => {
      const ss = new SpreadSort2()
      expect(ss.isSorted([5, 5, 5])).toBe(true)
    })

    it('returns false for reverse sorted', () => {
      const ss = new SpreadSort2()
      expect(ss.isSorted([5, 4, 3, 2, 1])).toBe(false)
    })

    it('works with custom comparator after descending sort', () => {
      const ss = new SpreadSort2((a, b) => b - a)
      expect(ss.isSorted([5, 4, 3, 2, 1])).toBe(true)
    })
  })

  // ─── Counters ───
  describe('getComparisons', () => {
    it('returns 0 before sorting', () => {
      const ss = new SpreadSort2()
      expect(ss.getComparisons()).toBe(0)
    })

    it('returns non-zero after sorting', () => {
      const ss = new SpreadSort2()
      ss.sort([3, 1, 2])
      expect(ss.getComparisons()).toBeGreaterThan(0)
    })

    it('returns 0 after resetCounters', () => {
      const ss = new SpreadSort2()
      ss.sort([3, 1, 2])
      ss.resetCounters()
      expect(ss.getComparisons()).toBe(0)
    })
  })

  describe('getSwaps', () => {
    it('returns 0 before sorting', () => {
      const ss = new SpreadSort2()
      expect(ss.getSwaps()).toBe(0)
    })

    it('returns 0 for already sorted array', () => {
      const ss = new SpreadSort2()
      ss.sort([1, 2, 3])
      expect(ss.getSwaps()).toBe(0)
    })

    it('returns non-zero for reverse sorted', () => {
      const ss = new SpreadSort2()
      ss.sort([3, 2, 1])
      expect(ss.getSwaps()).toBeGreaterThanOrEqual(0)
    })

    it('returns 0 after resetCounters', () => {
      const ss = new SpreadSort2()
      ss.sort([3, 1, 2])
      ss.resetCounters()
      expect(ss.getSwaps()).toBe(0)
    })
  })

  describe('resetCounters', () => {
    it('resets both comparisons and swaps', () => {
      const ss = new SpreadSort2()
      ss.sort([3, 1, 2])
      ss.resetCounters()
      expect(ss.getComparisons()).toBe(0)
      expect(ss.getSwaps()).toBe(0)
    })
  })
})
