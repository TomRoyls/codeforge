import { describe, it, expect } from 'vitest'
import { MergeSort4, mergeTwoArrays } from '../../src/core/merge-sort-4/index.js'

describe('MergeSort4', () => {
  describe('constructor', () => {
    it('creates sorter with default comparator', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.sort([3, 1, 2])).toEqual([1, 2, 3])
    })

    it('creates sorter with custom comparator (descending)', () => {
      const sorter = new MergeSort4<number>((a, b) => b - a)
      expect(sorter.sort([1, 2, 3])).toEqual([3, 2, 1])
    })

    it('creates sorter for strings', () => {
      const sorter = new MergeSort4<string>()
      expect(sorter.sort(['c', 'a', 'b'])).toEqual(['a', 'b', 'c'])
    })
  })

  // ─── sort ───

  describe('sort', () => {
    it('sorts an unsorted array', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.sort([5, 3, 8, 1, 9, 2])).toEqual([1, 2, 3, 5, 8, 9])
    })

    it('does not modify the original array', () => {
      const sorter = new MergeSort4<number>()
      const arr = [3, 1, 2]
      sorter.sort(arr)
      expect(arr).toEqual([3, 1, 2])
    })

    it('handles empty array', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.sort([])).toEqual([])
    })

    it('handles single element', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.sort([42])).toEqual([42])
    })

    it('handles already sorted array', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.sort([1, 2, 3, 4])).toEqual([1, 2, 3, 4])
    })

    it('handles reverse sorted array', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.sort([4, 3, 2, 1])).toEqual([1, 2, 3, 4])
    })

    it('handles duplicates', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.sort([3, 1, 2, 1, 3])).toEqual([1, 1, 2, 3, 3])
    })

    it('handles negative values', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.sort([-3, 1, -1, 2])).toEqual([-3, -1, 1, 2])
    })
  })

  // ─── sortDescending ───

  describe('sortDescending', () => {
    it('sorts in descending order', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.sortDescending([1, 3, 2, 5, 4])).toEqual([5, 4, 3, 2, 1])
    })

    it('does not modify original', () => {
      const sorter = new MergeSort4<number>()
      const arr = [3, 1, 2]
      sorter.sortDescending(arr)
      expect(arr).toEqual([3, 1, 2])
    })

    it('handles empty array', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.sortDescending([])).toEqual([])
    })
  })

  // ─── isSorted ───

  describe('isSorted', () => {
    it('returns true for sorted array', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.isSorted([1, 2, 3, 4])).toBe(true)
    })

    it('returns false for unsorted array', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.isSorted([3, 1, 2])).toBe(false)
    })

    it('returns true for empty array', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.isSorted([])).toBe(true)
    })

    it('returns true for single element', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.isSorted([42])).toBe(true)
    })
  })

  // ─── bottomUp ───

  describe('bottomUp', () => {
    it('sorts using bottom-up merge sort', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.bottomUp([5, 3, 8, 1, 9, 2])).toEqual([1, 2, 3, 5, 8, 9])
    })

    it('does not modify original', () => {
      const sorter = new MergeSort4<number>()
      const arr = [3, 1, 2]
      sorter.bottomUp(arr)
      expect(arr).toEqual([3, 1, 2])
    })

    it('handles empty array', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.bottomUp([])).toEqual([])
    })

    it('handles single element', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.bottomUp([1])).toEqual([1])
    })

    it('handles duplicates', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.bottomUp([2, 1, 2, 1])).toEqual([1, 1, 2, 2])
    })
  })

  // ─── inPlace ───

  describe('inPlace', () => {
    it('sorts array in place', () => {
      const sorter = new MergeSort4<number>()
      const arr = [3, 1, 2]
      sorter.inPlace(arr)
      expect(arr).toEqual([1, 2, 3])
    })

    it('handles empty array', () => {
      const sorter = new MergeSort4<number>()
      const arr: number[] = []
      sorter.inPlace(arr)
      expect(arr).toEqual([])
    })

    it('handles single element', () => {
      const sorter = new MergeSort4<number>()
      const arr = [1]
      sorter.inPlace(arr)
      expect(arr).toEqual([1])
    })
  })

  // ─── countInversions ───

  describe('countInversions', () => {
    it('returns 0 for sorted array', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.countInversions([1, 2, 3, 4])).toBe(0)
    })

    it('counts inversions in reverse sorted', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.countInversions([4, 3, 2, 1])).toBe(6)
    })

    it('returns 0 for empty array', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.countInversions([])).toBe(0)
    })

    it('returns 0 for single element', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.countInversions([1])).toBe(0)
    })

    it('counts single inversion', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.countInversions([2, 1])).toBe(1)
    })

    it('does not modify original array', () => {
      const sorter = new MergeSort4<number>()
      const arr = [3, 1, 2]
      sorter.countInversions(arr)
      expect(arr).toEqual([3, 1, 2])
    })
  })

  // ─── mergeKSorted ───

  describe('mergeKSorted', () => {
    it('merges multiple sorted arrays', () => {
      const sorter = new MergeSort4<number>()
      const result = sorter.mergeKSorted([[1, 4, 7], [2, 5, 8], [3, 6, 9]])
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('returns empty for empty input', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.mergeKSorted([])).toEqual([])
    })

    it('returns copy of single array', () => {
      const sorter = new MergeSort4<number>()
      const arr = [1, 2, 3]
      const result = sorter.mergeKSorted([arr])
      expect(result).toEqual([1, 2, 3])
      expect(result).not.toBe(arr)
    })

    it('handles arrays of different lengths', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.mergeKSorted([[1, 5], [2, 3, 4], [6]])).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('handles empty arrays within the list', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.mergeKSorted([[], [1, 3], [], [2]])).toEqual([1, 2, 3])
    })
  })

  // ─── getTimeComplexity and getSpaceComplexity ───

  describe('complexity', () => {
    it('returns O(n log n) time complexity', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.getTimeComplexity()).toBe('O(n log n)')
    })

    it('returns O(n) space complexity', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.getSpaceComplexity()).toBe('O(n)')
    })
  })

  // ─── mergeTwoArrays ───

  describe('mergeTwoArrays', () => {
    it('merges two sorted arrays', () => {
      expect(mergeTwoArrays([1, 3, 5], [2, 4, 6], (a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('merges with empty left', () => {
      expect(mergeTwoArrays([], [1, 2], (a, b) => a - b)).toEqual([1, 2])
    })

    it('merges with empty right', () => {
      expect(mergeTwoArrays([1, 2], [], (a, b) => a - b)).toEqual([1, 2])
    })

    it('merges both empty', () => {
      expect(mergeTwoArrays([], [], (a, b) => a - b)).toEqual([])
    })
  })

  // ─── edge cases ───

  describe('edge cases', () => {
    it('handles large array', () => {
      const sorter = new MergeSort4<number>()
      const arr = Array.from({ length: 200 }, (_, i) => 200 - i)
      const sorted = sorter.sort(arr)
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i]!).toBeLessThanOrEqual(sorted[i + 1]!)
      }
    })

    it('handles all same elements', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.sort([5, 5, 5, 5])).toEqual([5, 5, 5, 5])
    })

    it('sorts strings', () => {
      const sorter = new MergeSort4<string>()
      expect(sorter.sort(['banana', 'apple', 'cherry'])).toEqual(['apple', 'banana', 'cherry'])
    })

    it('two-element array', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.sort([2, 1])).toEqual([1, 2])
    })
  })
})
