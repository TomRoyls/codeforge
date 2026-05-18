import { describe, it, expect, beforeEach } from 'vitest'
import { Introsort3 } from '../../src/core/introsort-3/index.js'

describe('Introsort3', () => {
  let sorter: Introsort3

  beforeEach(() => {
    sorter = new Introsort3()
  })

  // ─── Constructor ───

  describe('constructor', () => {
    it('should create with default comparator', () => {
      const s = new Introsort3()
      expect(s.sort([3, 1, 2])).toEqual([1, 2, 3])
    })

    it('should accept a custom comparator for descending order', () => {
      const s = new Introsort3((a, b) => b - a)
      expect(s.sort([1, 2, 3])).toEqual([3, 2, 1])
    })
  })

  // ─── sort ───

  describe('sort', () => {
    it('should return empty array unchanged', () => {
      expect(sorter.sort([])).toEqual([])
    })

    it('should return single element unchanged', () => {
      expect(sorter.sort([42])).toEqual([42])
    })

    it('should sort two elements', () => {
      expect(sorter.sort([2, 1])).toEqual([1, 2])
    })

    it('should sort a small array', () => {
      expect(sorter.sort([5, 3, 8, 1, 2])).toEqual([1, 2, 3, 5, 8])
    })

    it('should sort an already sorted array', () => {
      expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
    })

    it('should sort a reverse sorted array', () => {
      expect(sorter.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle duplicates', () => {
      expect(sorter.sort([3, 1, 2, 3, 1])).toEqual([1, 1, 2, 3, 3])
    })

    it('should handle all same elements', () => {
      expect(sorter.sort([7, 7, 7, 7])).toEqual([7, 7, 7, 7])
    })

    it('should handle negative numbers', () => {
      expect(sorter.sort([-3, -1, -2, 0, 2])).toEqual([-3, -2, -1, 0, 2])
    })

    it('should not mutate the original array', () => {
      const arr = [3, 1, 2]
      const sorted = sorter.sort(arr)
      expect(arr).toEqual([3, 1, 2])
      expect(sorted).toEqual([1, 2, 3])
    })

    it('should sort a large array', () => {
      const arr = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 10000))
      const sorted = sorter.sort(arr)
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i]!).toBeLessThanOrEqual(sorted[i + 1]!)
      }
    })
  })

  // ─── sortDescending ───

  describe('sortDescending', () => {
    it('should sort in descending order', () => {
      expect(sorter.sortDescending([1, 3, 2])).toEqual([3, 2, 1])
    })

    it('should handle empty array', () => {
      expect(sorter.sortDescending([])).toEqual([])
    })

    it('should handle single element', () => {
      expect(sorter.sortDescending([5])).toEqual([5])
    })
  })

  // ─── getMaxDepth ───

  describe('getMaxDepth', () => {
    it('should return 0 for 0', () => {
      expect(sorter.getMaxDepth(0)).toBe(0)
    })

    it('should return 0 for 1', () => {
      expect(sorter.getMaxDepth(1)).toBe(0)
    })

    it('should return 2 * floor(log2(n)) for larger n', () => {
      expect(sorter.getMaxDepth(2)).toBe(2)
      expect(sorter.getMaxDepth(4)).toBe(4)
      expect(sorter.getMaxDepth(8)).toBe(6)
      expect(sorter.getMaxDepth(16)).toBe(8)
    })
  })

  // ─── sortWithMaxDepth ───

  describe('sortWithMaxDepth', () => {
    it('should sort with a custom max depth', () => {
      expect(sorter.sortWithMaxDepth([5, 3, 1, 4, 2], 4)).toEqual([1, 2, 3, 4, 5])
    })

    it('should fall back to heapsort when depth is 0', () => {
      expect(sorter.sortWithMaxDepth([5, 3, 1, 4, 2], 0)).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle empty array', () => {
      expect(sorter.sortWithMaxDepth([], 5)).toEqual([])
    })

    it('should handle single element', () => {
      expect(sorter.sortWithMaxDepth([1], 5)).toEqual([1])
    })
  })

  // ─── isSorted ───

  describe('isSorted', () => {
    it('should return true for empty array', () => {
      expect(sorter.isSorted([])).toBe(true)
    })

    it('should return true for single element', () => {
      expect(sorter.isSorted([1])).toBe(true)
    })

    it('should return true for sorted array', () => {
      expect(sorter.isSorted([1, 2, 3, 4])).toBe(true)
    })

    it('should return false for unsorted array', () => {
      expect(sorter.isSorted([3, 1, 2])).toBe(false)
    })

    it('should return true for equal elements', () => {
      expect(sorter.isSorted([1, 1, 1])).toBe(true)
    })
  })

  // ─── Counters ───

  describe('counters', () => {
    it('should track comparisons', () => {
      sorter.sort([3, 1, 2])
      expect(sorter.getComparisons()).toBeGreaterThan(0)
    })

    it('should track swaps', () => {
      sorter.sort([3, 1, 2])
      expect(sorter.getSwaps()).toBeGreaterThan(0)
    })

    it('should reset counters', () => {
      sorter.sort([3, 1, 2])
      sorter.resetCounters()
      expect(sorter.getComparisons()).toBe(0)
      expect(sorter.getSwaps()).toBe(0)
    })

    it('should have zero comparisons for empty array', () => {
      sorter.sort([])
      expect(sorter.getComparisons()).toBe(0)
    })

    it('should have zero comparisons for single element', () => {
      sorter.sort([1])
      expect(sorter.getComparisons()).toBe(0)
    })
  })

  // ─── Complexity info ───

  describe('complexity info', () => {
    it('should return time complexity string', () => {
      expect(sorter.getTimeComplexity()).toBe('O(n log n) average, O(n log n) worst, O(n log n) space')
    })

    it('should return space complexity string', () => {
      expect(sorter.getSpaceComplexity()).toBe('O(log n) recursion stack')
    })
  })
})
