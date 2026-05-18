import { describe, it, expect } from 'vitest'
import { MergeSort2 } from '../../src/core/merge-sort-2/index.js'

describe('MergeSort2', () => {
  describe('constructor', () => {
    it('creates sorter with default comparator (ascending)', () => {
      const sorter = new MergeSort2()
      expect(sorter.sort([3, 1, 2])).toEqual([1, 2, 3])
    })

    it('creates sorter with custom comparator (descending)', () => {
      const sorter = new MergeSort2((a, b) => b - a)
      expect(sorter.sort([1, 2, 3])).toEqual([3, 2, 1])
    })
  })

  // ─── sort ───

  describe('sort', () => {
    it('sorts an unsorted array', () => {
      const sorter = new MergeSort2()
      expect(sorter.sort([5, 3, 8, 1, 9, 2])).toEqual([1, 2, 3, 5, 8, 9])
    })

    it('does not modify the original array', () => {
      const sorter = new MergeSort2()
      const arr = [3, 1, 2]
      const sorted = sorter.sort(arr)
      expect(arr).toEqual([3, 1, 2])
      expect(sorted).toEqual([1, 2, 3])
    })

    it('handles empty array', () => {
      const sorter = new MergeSort2()
      expect(sorter.sort([])).toEqual([])
    })

    it('handles single element', () => {
      const sorter = new MergeSort2()
      expect(sorter.sort([42])).toEqual([42])
    })

    it('handles already sorted array', () => {
      const sorter = new MergeSort2()
      expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
    })

    it('handles reverse sorted array', () => {
      const sorter = new MergeSort2()
      expect(sorter.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
    })

    it('handles duplicates', () => {
      const sorter = new MergeSort2()
      expect(sorter.sort([3, 1, 2, 1, 3])).toEqual([1, 1, 2, 3, 3])
    })

    it('handles negative values', () => {
      const sorter = new MergeSort2()
      expect(sorter.sort([-3, 1, -1, 2])).toEqual([-3, -1, 1, 2])
    })

    it('handles two elements', () => {
      const sorter = new MergeSort2()
      expect(sorter.sort([2, 1])).toEqual([1, 2])
    })
  })

  // ─── sortInPlace ───

  describe('sortInPlace', () => {
    it('sorts the array in place', () => {
      const sorter = new MergeSort2()
      const arr = [3, 1, 2]
      sorter.sortInPlace(arr)
      expect(arr).toEqual([1, 2, 3])
    })

    it('handles empty array', () => {
      const sorter = new MergeSort2()
      const arr: number[] = []
      sorter.sortInPlace(arr)
      expect(arr).toEqual([])
    })

    it('handles single element', () => {
      const sorter = new MergeSort2()
      const arr = [1]
      sorter.sortInPlace(arr)
      expect(arr).toEqual([1])
    })
  })

  // ─── sortRange ───

  describe('sortRange', () => {
    it('sorts a sub-range of the array', () => {
      const sorter = new MergeSort2()
      expect(sorter.sortRange([5, 3, 1, 4, 2], 1, 3)).toEqual([1, 3, 4])
    })

    it('returns empty for invalid range (start >= end)', () => {
      const sorter = new MergeSort2()
      expect(sorter.sortRange([1, 2, 3], 2, 1)).toEqual([])
    })

    it('sorts single element range', () => {
      const sorter = new MergeSort2()
      expect(sorter.sortRange([5, 3, 1], 1, 1)).toEqual([3])
    })
  })

  // ─── isSorted ───

  describe('isSorted', () => {
    it('returns true for sorted array', () => {
      const sorter = new MergeSort2()
      expect(sorter.isSorted([1, 2, 3, 4, 5])).toBe(true)
    })

    it('returns false for unsorted array', () => {
      const sorter = new MergeSort2()
      expect(sorter.isSorted([3, 1, 2])).toBe(false)
    })

    it('returns true for empty array', () => {
      const sorter = new MergeSort2()
      expect(sorter.isSorted([])).toBe(true)
    })

    it('returns true for single element', () => {
      const sorter = new MergeSort2()
      expect(sorter.isSorted([42])).toBe(true)
    })

    it('returns true for array with duplicates', () => {
      const sorter = new MergeSort2()
      expect(sorter.isSorted([1, 1, 2, 2, 3])).toBe(true)
    })
  })

  // ─── merge ───

  describe('merge', () => {
    it('merges two sorted arrays', () => {
      const sorter = new MergeSort2()
      expect(sorter.merge([1, 3, 5], [2, 4, 6])).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('merges with empty left array', () => {
      const sorter = new MergeSort2()
      expect(sorter.merge([], [1, 2, 3])).toEqual([1, 2, 3])
    })

    it('merges with empty right array', () => {
      const sorter = new MergeSort2()
      expect(sorter.merge([1, 2, 3], [])).toEqual([1, 2, 3])
    })

    it('merges two empty arrays', () => {
      const sorter = new MergeSort2()
      expect(sorter.merge([], [])).toEqual([])
    })

    it('merges single element arrays', () => {
      const sorter = new MergeSort2()
      expect(sorter.merge([2], [1])).toEqual([1, 2])
    })

    it('merges arrays with duplicates', () => {
      const sorter = new MergeSort2()
      expect(sorter.merge([1, 1, 3], [1, 2])).toEqual([1, 1, 1, 2, 3])
    })
  })

  // ─── counters ───

  describe('counters', () => {
    it('getComparisons returns comparison count', () => {
      const sorter = new MergeSort2()
      sorter.sort([3, 1, 2])
      expect(sorter.getComparisons()).toBeGreaterThan(0)
    })

    it('getSwaps returns swap count', () => {
      const sorter = new MergeSort2()
      sorter.merge([3, 5], [1, 2])
      expect(sorter.getSwaps()).toBeGreaterThanOrEqual(0)
    })

    it('resetCounters resets both counters', () => {
      const sorter = new MergeSort2()
      sorter.sort([3, 1, 2])
      sorter.resetCounters()
      expect(sorter.getComparisons()).toBe(0)
      expect(sorter.getSwaps()).toBe(0)
    })

    it('counters accumulate across operations', () => {
      const sorter = new MergeSort2()
      sorter.sort([3, 1])
      const firstCount = sorter.getComparisons()
      sorter.sort([5, 4])
      expect(sorter.getComparisons()).toBeGreaterThan(firstCount)
    })
  })

  // ─── edge cases ───

  describe('edge cases', () => {
    it('handles large array', () => {
      const sorter = new MergeSort2()
      const arr = Array.from({ length: 100 }, (_, i) => 100 - i)
      const sorted = sorter.sort(arr)
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i]!).toBeLessThanOrEqual(sorted[i + 1]!)
      }
    })

    it('handles all same elements', () => {
      const sorter = new MergeSort2()
      expect(sorter.sort([5, 5, 5, 5])).toEqual([5, 5, 5, 5])
    })

    it('custom comparator with sortInPlace', () => {
      const sorter = new MergeSort2((a, b) => b - a)
      const arr = [1, 3, 2]
      sorter.sortInPlace(arr)
      expect(arr).toEqual([3, 2, 1])
    })
  })
})
