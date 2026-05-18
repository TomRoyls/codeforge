import { describe, it, expect } from 'vitest'
import { QuickSort5 } from '../../src/core/quick-sort-5/index.js'

describe('QuickSort5', () => {
  describe('constructor', () => {
    it('creates instance with default comparator', () => {
      const qs = new QuickSort5()
      expect(qs.getComparisons()).toBe(0)
      expect(qs.getSwaps()).toBe(0)
    })

    it('creates instance with custom comparator (descending)', () => {
      const qs = new QuickSort5((a, b) => b - a)
      const result = qs.sort([1, 2, 3])
      expect(result).toEqual([3, 2, 1])
    })
  })

  // ─── sort ───

  describe('sort', () => {
    it('sorts empty array', () => {
      const qs = new QuickSort5()
      expect(qs.sort([])).toEqual([])
    })

    it('sorts single element', () => {
      const qs = new QuickSort5()
      expect(qs.sort([42])).toEqual([42])
    })

    it('sorts two elements', () => {
      const qs = new QuickSort5()
      expect(qs.sort([2, 1])).toEqual([1, 2])
    })

    it('sorts already sorted array', () => {
      const qs = new QuickSort5()
      expect(qs.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts reverse sorted array', () => {
      const qs = new QuickSort5()
      expect(qs.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts array with duplicates', () => {
      const qs = new QuickSort5()
      expect(qs.sort([3, 1, 2, 1, 3])).toEqual([1, 1, 2, 3, 3])
    })

    it('sorts array with negative numbers', () => {
      const qs = new QuickSort5()
      expect(qs.sort([-3, 1, -1, 2, 0])).toEqual([-3, -1, 0, 1, 2])
    })

    it('sorts large random array', () => {
      const qs = new QuickSort5()
      const arr = Array.from({ length: 100 }, () => Math.floor(Math.random() * 1000))
      const result = qs.sort(arr)
      for (let i = 1; i < result.length; i++) {
        expect(result[i]!).toBeGreaterThanOrEqual(result[i - 1]!)
      }
    })

    it('does not mutate the original array', () => {
      const qs = new QuickSort5()
      const original = [3, 1, 2]
      const copy = [...original]
      qs.sort(original)
      expect(original).toEqual(copy)
    })
  })

  // ─── sortDescending ───

  describe('sortDescending', () => {
    it('sorts empty array descending', () => {
      const qs = new QuickSort5()
      expect(qs.sortDescending([])).toEqual([])
    })

    it('sorts ascending array descending', () => {
      const qs = new QuickSort5()
      expect(qs.sortDescending([1, 2, 3, 4, 5])).toEqual([5, 4, 3, 2, 1])
    })

    it('sorts with duplicates descending', () => {
      const qs = new QuickSort5()
      expect(qs.sortDescending([1, 3, 2, 3, 1])).toEqual([3, 3, 2, 1, 1])
    })
  })

  // ─── isSorted ───

  describe('isSorted', () => {
    it('returns true for empty array', () => {
      const qs = new QuickSort5()
      expect(qs.isSorted([])).toBe(true)
    })

    it('returns true for single element', () => {
      const qs = new QuickSort5()
      expect(qs.isSorted([1])).toBe(true)
    })

    it('returns true for sorted array', () => {
      const qs = new QuickSort5()
      expect(qs.isSorted([1, 2, 3, 4])).toBe(true)
    })

    it('returns false for unsorted array', () => {
      const qs = new QuickSort5()
      expect(qs.isSorted([3, 1, 2])).toBe(false)
    })

    it('returns true for equal elements', () => {
      const qs = new QuickSort5()
      expect(qs.isSorted([1, 1, 1])).toBe(true)
    })
  })

  // ─── partialSort ───

  describe('partialSort', () => {
    it('returns all elements when k >= length', () => {
      const qs = new QuickSort5()
      const result = qs.partialSort([3, 1, 2], 5)
      expect(result).toEqual([1, 2, 3])
    })

    it('returns first k smallest elements sorted', () => {
      const qs = new QuickSort5()
      const result = qs.partialSort([5, 3, 1, 4, 2], 3)
      expect(result).toEqual([1, 2, 3])
    })

    it('handles k = 1', () => {
      const qs = new QuickSort5()
      const result = qs.partialSort([5, 3, 1, 4, 2], 1)
      expect(result).toEqual([1])
    })

    it('handles empty array', () => {
      const qs = new QuickSort5()
      expect(qs.partialSort([], 3)).toEqual([])
    })

    it('handles single element', () => {
      const qs = new QuickSort5()
      expect(qs.partialSort([42], 1)).toEqual([42])
    })
  })

  // ─── selectKth ───

  describe('selectKth', () => {
    it('returns undefined for k out of range (0)', () => {
      const qs = new QuickSort5()
      expect(qs.selectKth([1, 2, 3], 0)).toBeUndefined()
    })

    it('returns undefined for k out of range (too large)', () => {
      const qs = new QuickSort5()
      expect(qs.selectKth([1, 2, 3], 4)).toBeUndefined()
    })

    it('returns the smallest element for k=1', () => {
      const qs = new QuickSort5()
      expect(qs.selectKth([3, 1, 2], 1)).toBe(1)
    })

    it('returns the largest element for k=n', () => {
      const qs = new QuickSort5()
      expect(qs.selectKth([3, 1, 2], 3)).toBe(3)
    })

    it('returns the median for k=mid', () => {
      const qs = new QuickSort5()
      expect(qs.selectKth([5, 3, 1, 4, 2], 3)).toBe(3)
    })

    it('handles empty array', () => {
      const qs = new QuickSort5()
      expect(qs.selectKth([], 1)).toBeUndefined()
    })
  })

  // ─── counters ───

  describe('counters', () => {
    it('tracks comparisons after sort', () => {
      const qs = new QuickSort5()
      qs.sort([3, 1, 2])
      expect(qs.getComparisons()).toBeGreaterThan(0)
    })

    it('tracks swaps after sort', () => {
      const qs = new QuickSort5()
      qs.sort([3, 1, 2])
      expect(qs.getSwaps()).toBeGreaterThan(0)
    })

    it('resets counters', () => {
      const qs = new QuickSort5()
      qs.sort([3, 1, 2])
      qs.resetCounters()
      expect(qs.getComparisons()).toBe(0)
      expect(qs.getSwaps()).toBe(0)
    })
  })

  // ─── complexity info ───

  describe('complexity', () => {
    it('returns time complexity string', () => {
      const qs = new QuickSort5()
      expect(qs.getTimeComplexity()).toBe('O(n log n) average, O(n²) worst, O(n) space')
    })

    it('returns space complexity string', () => {
      const qs = new QuickSort5()
      expect(qs.getSpaceComplexity()).toBe('O(log n) recursion stack')
    })
  })
})
