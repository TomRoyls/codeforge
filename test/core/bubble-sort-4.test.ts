import { describe, it, expect } from 'vitest'
import { BubbleSort4 } from '../../src/core/bubble-sort-4/index.js'

describe('BubbleSort4', () => {
  // ─── sort (standard mode) ───
  describe('sort (standard mode)', () => {
    it('returns empty array for empty input', () => {
      const bs = new BubbleSort4<number>()
      expect(bs.sort([])).toEqual([])
    })

    it('returns single element for single input', () => {
      const bs = new BubbleSort4<number>()
      expect(bs.sort([42])).toEqual([42])
    })

    it('returns already sorted array unchanged', () => {
      const bs = new BubbleSort4<number>()
      expect(bs.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts reverse sorted array', () => {
      const bs = new BubbleSort4<number>()
      expect(bs.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts random order array', () => {
      const bs = new BubbleSort4<number>()
      expect(bs.sort([3, 1, 4, 1, 5, 9, 2, 6])).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
    })

    it('handles duplicates', () => {
      const bs = new BubbleSort4<number>()
      expect(bs.sort([3, 3, 3, 1, 1, 2, 2])).toEqual([1, 1, 2, 2, 3, 3, 3])
    })

    it('handles negative numbers', () => {
      const bs = new BubbleSort4<number>()
      expect(bs.sort([-3, -1, -2, -5, -4])).toEqual([-5, -4, -3, -2, -1])
    })

    it('handles mixed positive and negative', () => {
      const bs = new BubbleSort4<number>()
      expect(bs.sort([3, -1, 0, -2, 2])).toEqual([-2, -1, 0, 2, 3])
    })

    it('handles all identical elements', () => {
      const bs = new BubbleSort4<number>()
      expect(bs.sort([5, 5, 5, 5])).toEqual([5, 5, 5, 5])
    })

    it('handles two elements', () => {
      const bs = new BubbleSort4<number>()
      expect(bs.sort([2, 1])).toEqual([1, 2])
    })

    it('does not modify original array', () => {
      const bs = new BubbleSort4<number>()
      const original = [3, 1, 2]
      const sorted = bs.sort(original)
      expect(original).toEqual([3, 1, 2])
      expect(sorted).toEqual([1, 2, 3])
    })

    it('sorts strings correctly', () => {
      const bs = new BubbleSort4<string>()
      expect(bs.sort(['banana', 'apple', 'cherry'])).toEqual(['apple', 'banana', 'cherry'])
    })
  })

  // ─── sort (cocktail mode) ───
  describe('sort (cocktail mode)', () => {
    it('returns empty array for empty input', () => {
      const bs = new BubbleSort4<number>(true)
      expect(bs.sort([])).toEqual([])
    })

    it('returns single element for single input', () => {
      const bs = new BubbleSort4<number>(true)
      expect(bs.sort([42])).toEqual([42])
    })

    it('sorts reverse sorted array', () => {
      const bs = new BubbleSort4<number>(true)
      expect(bs.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts random order array', () => {
      const bs = new BubbleSort4<number>(true)
      expect(bs.sort([3, 1, 4, 1, 5, 9, 2, 6])).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
    })

    it('handles negative numbers', () => {
      const bs = new BubbleSort4<number>(true)
      expect(bs.sort([-3, -1, -2])).toEqual([-3, -2, -1])
    })

    it('handles all identical elements', () => {
      const bs = new BubbleSort4<number>(true)
      expect(bs.sort([5, 5, 5, 5])).toEqual([5, 5, 5, 5])
    })
  })

  // ─── sortDescending ───
  describe('sortDescending', () => {
    it('returns empty array for empty input', () => {
      const bs = new BubbleSort4<number>()
      expect(bs.sortDescending([])).toEqual([])
    })

    it('returns single element for single input', () => {
      const bs = new BubbleSort4<number>()
      expect(bs.sortDescending([42])).toEqual([42])
    })

    it('sorts descending in standard mode', () => {
      const bs = new BubbleSort4<number>()
      expect(bs.sortDescending([1, 2, 3, 4, 5])).toEqual([5, 4, 3, 2, 1])
    })

    it('sorts descending in cocktail mode', () => {
      const bs = new BubbleSort4<number>(true)
      expect(bs.sortDescending([1, 2, 3, 4, 5])).toEqual([5, 4, 3, 2, 1])
    })

    it('handles duplicates descending', () => {
      const bs = new BubbleSort4<number>()
      expect(bs.sortDescending([1, 1, 2, 2, 3])).toEqual([3, 2, 2, 1, 1])
    })

    it('handles negative numbers descending', () => {
      const bs = new BubbleSort4<number>()
      expect(bs.sortDescending([-3, -1, -2])).toEqual([-1, -2, -3])
    })

    it('does not modify original array', () => {
      const bs = new BubbleSort4<number>()
      const original = [3, 1, 2]
      bs.sortDescending(original)
      expect(original).toEqual([3, 1, 2])
    })
  })

  // ─── isSorted ───
  describe('isSorted', () => {
    it('returns true for empty array', () => {
      const bs = new BubbleSort4<number>()
      expect(bs.isSorted([])).toBe(true)
    })

    it('returns true for single element', () => {
      const bs = new BubbleSort4<number>()
      expect(bs.isSorted([1])).toBe(true)
    })

    it('returns true for sorted array', () => {
      const bs = new BubbleSort4<number>()
      expect(bs.isSorted([1, 2, 3, 4, 5])).toBe(true)
    })

    it('returns false for unsorted array', () => {
      const bs = new BubbleSort4<number>()
      expect(bs.isSorted([3, 1, 2])).toBe(false)
    })

    it('returns true for equal elements', () => {
      const bs = new BubbleSort4<number>()
      expect(bs.isSorted([5, 5, 5])).toBe(true)
    })
  })

  // ─── Metrics ───
  describe('getPassCount', () => {
    it('returns 0 before sorting', () => {
      const bs = new BubbleSort4<number>()
      expect(bs.getPassCount()).toBe(0)
    })

    it('returns 0 after sorting empty array', () => {
      const bs = new BubbleSort4<number>()
      bs.sort([])
      expect(bs.getPassCount()).toBe(0)
    })

    it('returns 1 for already sorted two-element array', () => {
      const bs = new BubbleSort4<number>()
      bs.sort([1, 2])
      expect(bs.getPassCount()).toBe(1)
    })

    it('returns positive count for unsorted array', () => {
      const bs = new BubbleSort4<number>()
      bs.sort([5, 4, 3, 2, 1])
      expect(bs.getPassCount()).toBeGreaterThan(0)
    })

    it('resets count on new sort call', () => {
      const bs = new BubbleSort4<number>()
      bs.sort([5, 4, 3])
      bs.sort([])
      expect(bs.getPassCount()).toBe(0)
    })
  })

  describe('getLastSwapIndex', () => {
    it('returns -1 before sorting', () => {
      const bs = new BubbleSort4<number>()
      expect(bs.getLastSwapIndex()).toBe(-1)
    })

    it('returns -1 after sorting empty array', () => {
      const bs = new BubbleSort4<number>()
      bs.sort([])
      expect(bs.getLastSwapIndex()).toBe(-1)
    })

    it('returns non-negative after sorting unsorted array', () => {
      const bs = new BubbleSort4<number>()
      bs.sort([5, 4, 3, 2, 1])
      expect(bs.getLastSwapIndex()).toBeGreaterThanOrEqual(0)
    })
  })

  // ─── Complexity ───
  describe('getTimeComplexity', () => {
    it('returns O(n²)', () => {
      const bs = new BubbleSort4<number>()
      expect(bs.getTimeComplexity()).toBe('O(n²)')
    })
  })

  describe('getSpaceComplexity', () => {
    it('returns O(1)', () => {
      const bs = new BubbleSort4<number>()
      expect(bs.getSpaceComplexity()).toBe('O(1)')
    })
  })
})
