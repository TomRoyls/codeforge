import { describe, it, expect } from 'vitest'
import { GnomeSort3 } from '../../src/core/gnome-sort-3/index.js'

describe('GnomeSort3', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('creates instance with default comparator', () => {
      const gs = new GnomeSort3([3, 1, 2])
      expect(gs.sort()).toEqual([1, 2, 3])
    })

    it('creates instance with custom comparator', () => {
      const gs = new GnomeSort3([1, 2, 3], (a, b) => b - a)
      expect(gs.sort()).toEqual([3, 2, 1])
    })

    it('does not modify the original array', () => {
      const original = [3, 1, 2]
      new GnomeSort3(original)
      expect(original).toEqual([3, 1, 2])
    })
  })

  // ─── sort ───
  describe('sort', () => {
    it('returns empty array for empty input', () => {
      const gs = new GnomeSort3([])
      expect(gs.sort()).toEqual([])
    })

    it('returns single element for single input', () => {
      const gs = new GnomeSort3([42])
      expect(gs.sort()).toEqual([42])
    })

    it('returns already sorted array unchanged', () => {
      const gs = new GnomeSort3([1, 2, 3, 4, 5])
      expect(gs.sort()).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts reverse sorted array', () => {
      const gs = new GnomeSort3([5, 4, 3, 2, 1])
      expect(gs.sort()).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts random order array', () => {
      const gs = new GnomeSort3([3, 1, 4, 1, 5, 9, 2, 6])
      expect(gs.sort()).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
    })

    it('handles duplicates', () => {
      const gs = new GnomeSort3([3, 3, 3, 1, 1, 2, 2])
      expect(gs.sort()).toEqual([1, 1, 2, 2, 3, 3, 3])
    })

    it('handles negative numbers', () => {
      const gs = new GnomeSort3([-3, -1, -2, -5, -4])
      expect(gs.sort()).toEqual([-5, -4, -3, -2, -1])
    })

    it('handles mixed positive and negative', () => {
      const gs = new GnomeSort3([3, -1, 0, -2, 2])
      expect(gs.sort()).toEqual([-2, -1, 0, 2, 3])
    })

    it('handles all identical elements', () => {
      const gs = new GnomeSort3([5, 5, 5, 5])
      expect(gs.sort()).toEqual([5, 5, 5, 5])
    })

    it('handles two elements', () => {
      const gs = new GnomeSort3([2, 1])
      expect(gs.sort()).toEqual([1, 2])
    })

    it('handles three elements', () => {
      const gs = new GnomeSort3([3, 1, 2])
      expect(gs.sort()).toEqual([1, 2, 3])
    })

    it('sorts with custom comparator (descending)', () => {
      const gs = new GnomeSort3([1, 2, 3], (a, b) => b - a)
      expect(gs.sort()).toEqual([3, 2, 1])
    })

    it('returns a new array', () => {
      const gs = new GnomeSort3([2, 1])
      const result = gs.sort()
      expect(result).not.toBe((gs as unknown as { array: number[] }).array)
    })
  })

  // ─── sortDescending ───
  describe('sortDescending', () => {
    it('returns empty array for empty input', () => {
      const gs = new GnomeSort3([])
      expect(gs.sortDescending()).toEqual([])
    })

    it('returns single element for single input', () => {
      const gs = new GnomeSort3([42])
      expect(gs.sortDescending()).toEqual([42])
    })

    it('sorts descending', () => {
      const gs = new GnomeSort3([1, 2, 3, 4, 5])
      expect(gs.sortDescending()).toEqual([5, 4, 3, 2, 1])
    })

    it('sorts unsorted array descending', () => {
      const gs = new GnomeSort3([3, 1, 4, 1, 5])
      expect(gs.sortDescending()).toEqual([5, 4, 3, 1, 1])
    })

    it('handles duplicates descending', () => {
      const gs = new GnomeSort3([1, 1, 2, 2, 3])
      expect(gs.sortDescending()).toEqual([3, 2, 2, 1, 1])
    })

    it('handles negative numbers descending', () => {
      const gs = new GnomeSort3([-3, -1, -2])
      expect(gs.sortDescending()).toEqual([-1, -2, -3])
    })
  })

  // ─── isSorted ───
  describe('isSorted', () => {
    it('returns true for empty array', () => {
      const gs = new GnomeSort3([])
      expect(gs.isSorted()).toBe(true)
    })

    it('returns true for single element', () => {
      const gs = new GnomeSort3([1])
      expect(gs.isSorted()).toBe(true)
    })

    it('returns true for sorted array', () => {
      const gs = new GnomeSort3([1, 2, 3])
      expect(gs.isSorted()).toBe(true)
    })

    it('returns false for unsorted array', () => {
      const gs = new GnomeSort3([3, 1, 2])
      expect(gs.isSorted()).toBe(false)
    })

    it('returns true for equal elements', () => {
      const gs = new GnomeSort3([5, 5, 5])
      expect(gs.isSorted()).toBe(true)
    })
  })

  // ─── Metrics ───
  describe('getSwapCount', () => {
    it('returns 0 before sorting', () => {
      const gs = new GnomeSort3([3, 1, 2])
      expect(gs.getSwapCount()).toBe(0)
    })

    it('returns 0 after sorting empty array', () => {
      const gs = new GnomeSort3([])
      gs.sort()
      expect(gs.getSwapCount()).toBe(0)
    })

    it('returns 0 for already sorted array', () => {
      const gs = new GnomeSort3([1, 2, 3])
      gs.sort()
      expect(gs.getSwapCount()).toBe(0)
    })

    it('returns positive count for unsorted array', () => {
      const gs = new GnomeSort3([5, 4, 3, 2, 1])
      gs.sort()
      expect(gs.getSwapCount()).toBeGreaterThan(0)
    })

    it('resets count on new sort call', () => {
      const gs = new GnomeSort3([5, 4, 3])
      gs.sort()
      expect(gs.getSwapCount()).toBeGreaterThan(0)
      gs.sort()
      expect(gs.getSwapCount()).toBe(0)
    })
  })

  describe('getComparisonCount', () => {
    it('returns 0 before sorting', () => {
      const gs = new GnomeSort3([3, 1, 2])
      expect(gs.getComparisonCount()).toBe(0)
    })

    it('returns 0 after sorting empty array', () => {
      const gs = new GnomeSort3([])
      gs.sort()
      expect(gs.getComparisonCount()).toBe(0)
    })

    it('returns positive count after sorting', () => {
      const gs = new GnomeSort3([3, 1, 2])
      gs.sort()
      expect(gs.getComparisonCount()).toBeGreaterThan(0)
    })

    it('returns 0 for single element', () => {
      const gs = new GnomeSort3([1])
      gs.sort()
      expect(gs.getComparisonCount()).toBe(0)
    })

    it('resets count on new sort call', () => {
      const gs = new GnomeSort3([5, 4, 3])
      gs.sort()
      const firstCount = gs.getComparisonCount()
      gs.sort()
      expect(gs.getComparisonCount()).toBeLessThan(firstCount)
      expect(firstCount).toBeGreaterThan(0)
    })
  })

  // ─── Complexity ───
  describe('getTimeComplexity', () => {
    it('returns O(1) for empty array', () => {
      const gs = new GnomeSort3([])
      expect(gs.getTimeComplexity()).toBe('O(1)')
    })

    it('returns O(1) for single element', () => {
      const gs = new GnomeSort3([1])
      expect(gs.getTimeComplexity()).toBe('O(1)')
    })

    it('returns O(n²) for multiple elements', () => {
      const gs = new GnomeSort3([1, 2, 3])
      expect(gs.getTimeComplexity()).toBe('O(n²)')
    })
  })

  describe('getSpaceComplexity', () => {
    it('returns O(1)', () => {
      const gs = new GnomeSort3([1, 2, 3])
      expect(gs.getSpaceComplexity()).toBe('O(1)')
    })
  })
})
