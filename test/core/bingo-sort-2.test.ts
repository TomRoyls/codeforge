import { describe, it, expect } from 'vitest'
import { BingoSort2 } from '../../src/core/bingo-sort-2/index.js'

// ─── Constructor ───

describe('BingoSort2', () => {
  describe('constructor', () => {
    it('creates a sorter with default comparator', () => {
      const sorter = new BingoSort2([3, 1, 2])
      expect(sorter.sort()).toEqual([1, 2, 3])
    })

    it('creates a sorter with custom comparator', () => {
      const sorter = new BingoSort2([3, 1, 2], (a, b) => b - a)
      expect(sorter.sort()).toEqual([3, 2, 1])
    })

    it('preserves original array (does not mutate)', () => {
      const original = [3, 1, 2]
      const sorter = new BingoSort2(original)
      sorter.sort()
      expect(original).toEqual([3, 1, 2])
    })

    it('handles empty array', () => {
      const sorter = new BingoSort2<number>([])
      expect(sorter.sort()).toEqual([])
    })

    it('handles single element', () => {
      const sorter = new BingoSort2([42])
      expect(sorter.sort()).toEqual([42])
    })
  })

  // ─── sort ───

  describe('sort', () => {
    it('sorts numbers ascending', () => {
      const sorter = new BingoSort2([5, 3, 8, 1, 9, 2])
      expect(sorter.sort()).toEqual([1, 2, 3, 5, 8, 9])
    })

    it('sorts already sorted array', () => {
      const sorter = new BingoSort2([1, 2, 3, 4, 5])
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts reverse sorted array', () => {
      const sorter = new BingoSort2([5, 4, 3, 2, 1])
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5])
    })

    it('handles duplicates', () => {
      const sorter = new BingoSort2([3, 1, 2, 1, 3, 2])
      expect(sorter.sort()).toEqual([1, 1, 2, 2, 3, 3])
    })

    it('handles negative numbers', () => {
      const sorter = new BingoSort2([-3, 5, -1, 0, 2])
      expect(sorter.sort()).toEqual([-3, -1, 0, 2, 5])
    })

    it('handles all identical elements', () => {
      const sorter = new BingoSort2([7, 7, 7, 7])
      expect(sorter.sort()).toEqual([7, 7, 7, 7])
    })

    it('sorts strings with default comparator', () => {
      const sorter = new BingoSort2(['cherry', 'apple', 'banana'])
      expect(sorter.sort()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('sorts with custom comparator (descending)', () => {
      const sorter = new BingoSort2([1, 5, 3, 2, 4], (a, b) => b - a)
      expect(sorter.sort()).toEqual([5, 4, 3, 2, 1])
    })

    it('returns a new array each time', () => {
      const sorter = new BingoSort2([3, 1, 2])
      const result1 = sorter.sort()
      const result2 = sorter.sort()
      expect(result1).toEqual(result2)
      expect(result1).not.toBe(result2)
    })

    it('handles two elements', () => {
      const sorter = new BingoSort2([2, 1])
      expect(sorter.sort()).toEqual([1, 2])
    })
  })

  // ─── sortDescending ───

  describe('sortDescending', () => {
    it('sorts numbers in descending order', () => {
      const sorter = new BingoSort2([3, 1, 4, 1, 5])
      expect(sorter.sortDescending()).toEqual([5, 4, 3, 1, 1])
    })

    it('handles empty array', () => {
      const sorter = new BingoSort2<number>([])
      expect(sorter.sortDescending()).toEqual([])
    })

    it('handles single element', () => {
      const sorter = new BingoSort2([42])
      expect(sorter.sortDescending()).toEqual([42])
    })
  })

  // ─── isSorted ───

  describe('isSorted', () => {
    it('returns true for already sorted array', () => {
      const sorter = new BingoSort2([1, 2, 3, 4, 5])
      expect(sorter.isSorted()).toBe(true)
    })

    it('returns false for unsorted array', () => {
      const sorter = new BingoSort2([3, 1, 2])
      expect(sorter.isSorted()).toBe(false)
    })

    it('returns true for empty array', () => {
      const sorter = new BingoSort2<number>([])
      expect(sorter.isSorted()).toBe(true)
    })

    it('returns true for single element', () => {
      const sorter = new BingoSort2([42])
      expect(sorter.isSorted()).toBe(true)
    })

    it('returns true for array with duplicates', () => {
      const sorter = new BingoSort2([1, 1, 2, 2, 3])
      expect(sorter.isSorted()).toBe(true)
    })

    it('checks against original array, not sorted result', () => {
      const sorter = new BingoSort2([3, 1, 2])
      expect(sorter.isSorted()).toBe(false)
      sorter.sort()
      expect(sorter.isSorted()).toBe(false)
    })
  })

  // ─── getPassCount / getComparisonCount ───

  describe('metrics', () => {
    it('getPassCount returns 0 before sorting', () => {
      const sorter = new BingoSort2([3, 1, 2])
      expect(sorter.getPassCount()).toBe(0)
    })

    it('getComparisonCount returns 0 before sorting', () => {
      const sorter = new BingoSort2([3, 1, 2])
      expect(sorter.getComparisonCount()).toBe(0)
    })

    it('getPassCount returns positive value after sorting', () => {
      const sorter = new BingoSort2([5, 3, 1, 4, 2])
      sorter.sort()
      expect(sorter.getPassCount()).toBeGreaterThan(0)
    })

    it('getComparisonCount returns positive value after sorting', () => {
      const sorter = new BingoSort2([5, 3, 1, 4, 2])
      sorter.sort()
      expect(sorter.getComparisonCount()).toBeGreaterThan(0)
    })
  })

  // ─── getTimeComplexity / getSpaceComplexity ───

  describe('complexity', () => {
    it('getTimeComplexity returns O(1) for empty array', () => {
      const sorter = new BingoSort2<number>([])
      expect(sorter.getTimeComplexity()).toBe('O(1)')
    })

    it('getTimeComplexity returns O(1) for single element', () => {
      const sorter = new BingoSort2([1])
      expect(sorter.getTimeComplexity()).toBe('O(1)')
    })

    it('getTimeComplexity returns O(n²) for larger arrays', () => {
      const sorter = new BingoSort2([3, 1, 2])
      expect(sorter.getTimeComplexity()).toBe('O(n²)')
    })

    it('getSpaceComplexity returns O(n)', () => {
      const sorter = new BingoSort2([3, 1, 2])
      expect(sorter.getSpaceComplexity()).toBe('O(n)')
    })
  })
})
