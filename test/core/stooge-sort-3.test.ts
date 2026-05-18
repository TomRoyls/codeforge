import { describe, it, expect } from 'vitest'
import { StoogeSort3 } from '../../src/core/stooge-sort-3/index.js'

describe('StoogeSort3', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('creates instance with default comparator', () => {
      const ss = new StoogeSort3([3, 1, 2])
      expect(ss.getTimeComplexity()).toBe('O(n^2.7)')
    })

    it('creates instance with custom comparator', () => {
      const ss = new StoogeSort3([3, 1, 2], (a, b) => b - a)
      expect(ss.getTimeComplexity()).toBe('O(n^2.7)')
    })

    it('does not modify the original array', () => {
      const original = [3, 1, 2]
      new StoogeSort3(original)
      expect(original).toEqual([3, 1, 2])
    })
  })

  // ─── sort ───
  describe('sort', () => {
    it('returns empty array for empty input', () => {
      const ss = new StoogeSort3([])
      expect(ss.sort()).toEqual([])
    })

    it('returns single element for single input', () => {
      const ss = new StoogeSort3([42])
      expect(ss.sort()).toEqual([42])
    })

    it('returns already sorted array unchanged', () => {
      const ss = new StoogeSort3([1, 2, 3, 4, 5])
      expect(ss.sort()).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts reverse sorted array', () => {
      const ss = new StoogeSort3([5, 4, 3, 2, 1])
      expect(ss.sort()).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts random order array', () => {
      const ss = new StoogeSort3([3, 1, 4, 1, 5, 9, 2, 6])
      expect(ss.sort()).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
    })

    it('handles duplicates', () => {
      const ss = new StoogeSort3([3, 3, 3, 1, 1, 2, 2])
      expect(ss.sort()).toEqual([1, 1, 2, 2, 3, 3, 3])
    })

    it('handles negative numbers', () => {
      const ss = new StoogeSort3([-3, -1, -2, -5, -4])
      expect(ss.sort()).toEqual([-5, -4, -3, -2, -1])
    })

    it('handles mixed positive and negative', () => {
      const ss = new StoogeSort3([3, -1, 0, -2, 2])
      expect(ss.sort()).toEqual([-2, -1, 0, 2, 3])
    })

    it('handles all identical elements', () => {
      const ss = new StoogeSort3([5, 5, 5, 5])
      expect(ss.sort()).toEqual([5, 5, 5, 5])
    })

    it('handles two elements', () => {
      const ss = new StoogeSort3([2, 1])
      expect(ss.sort()).toEqual([1, 2])
    })

    it('handles three elements', () => {
      const ss = new StoogeSort3([3, 1, 2])
      expect(ss.sort()).toEqual([1, 2, 3])
    })

    it('sorts with custom comparator (descending)', () => {
      const ss = new StoogeSort3([1, 2, 3], (a, b) => b - a)
      expect(ss.sort()).toEqual([3, 2, 1])
    })

    it('returns a new array', () => {
      const ss = new StoogeSort3([2, 1])
      const result = ss.sort()
      expect(result).not.toBe((ss as unknown as { array: number[] }).array)
    })
  })

  // ─── sortDescending ───
  describe('sortDescending', () => {
    it('returns empty array for empty input', () => {
      const ss = new StoogeSort3([])
      expect(ss.sortDescending()).toEqual([])
    })

    it('returns single element for single input', () => {
      const ss = new StoogeSort3([42])
      expect(ss.sortDescending()).toEqual([42])
    })

    it('sorts descending', () => {
      const ss = new StoogeSort3([1, 2, 3, 4, 5])
      expect(ss.sortDescending()).toEqual([5, 4, 3, 2, 1])
    })

    it('sorts unsorted array descending', () => {
      const ss = new StoogeSort3([3, 1, 4, 1, 5])
      expect(ss.sortDescending()).toEqual([5, 4, 3, 1, 1])
    })
  })

  // ─── isSorted ───
  describe('isSorted', () => {
    it('returns true for empty array', () => {
      const ss = new StoogeSort3([])
      expect(ss.isSorted()).toBe(true)
    })

    it('returns true for single element', () => {
      const ss = new StoogeSort3([1])
      expect(ss.isSorted()).toBe(true)
    })

    it('returns true for sorted array', () => {
      const ss = new StoogeSort3([1, 2, 3])
      expect(ss.isSorted()).toBe(true)
    })

    it('returns false for unsorted array', () => {
      const ss = new StoogeSort3([3, 1, 2])
      expect(ss.isSorted()).toBe(false)
    })
  })

  // ─── Metrics ───
  describe('getComparisonCount', () => {
    it('returns 0 before sorting', () => {
      const ss = new StoogeSort3([3, 1, 2])
      expect(ss.getComparisonCount()).toBe(0)
    })

    it('returns positive count after sorting', () => {
      const ss = new StoogeSort3([3, 1, 2])
      ss.sort()
      expect(ss.getComparisonCount()).toBeGreaterThan(0)
    })

    it('returns 0 for empty array sort', () => {
      const ss = new StoogeSort3([])
      ss.sort()
      expect(ss.getComparisonCount()).toBe(0)
    })

    it('returns 0 for single element sort', () => {
      const ss = new StoogeSort3([1])
      ss.sort()
      expect(ss.getComparisonCount()).toBe(0)
    })
  })

  describe('getRecursionCount', () => {
    it('returns 0 before sorting', () => {
      const ss = new StoogeSort3([3, 1, 2])
      expect(ss.getRecursionCount()).toBe(0)
    })

    it('returns positive count after sorting', () => {
      const ss = new StoogeSort3([3, 1, 2])
      ss.sort()
      expect(ss.getRecursionCount()).toBeGreaterThan(0)
    })

    it('returns 0 for empty array sort', () => {
      const ss = new StoogeSort3([])
      ss.sort()
      expect(ss.getRecursionCount()).toBe(0)
    })
  })

  // ─── Complexity ───
  describe('getTimeComplexity', () => {
    it('returns O(1) for empty array', () => {
      const ss = new StoogeSort3([])
      expect(ss.getTimeComplexity()).toBe('O(1)')
    })

    it('returns O(1) for single element', () => {
      const ss = new StoogeSort3([1])
      expect(ss.getTimeComplexity()).toBe('O(1)')
    })

    it('returns O(n^2.7) for multiple elements', () => {
      const ss = new StoogeSort3([1, 2, 3])
      expect(ss.getTimeComplexity()).toBe('O(n^2.7)')
    })
  })

  describe('getSpaceComplexity', () => {
    it('returns O(n)', () => {
      const ss = new StoogeSort3([1, 2, 3])
      expect(ss.getSpaceComplexity()).toBe('O(n)')
    })
  })
})
