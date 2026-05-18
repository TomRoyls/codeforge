import { describe, it, expect } from 'vitest'
import { CocktailSort3 } from '../../src/core/cocktail-sort-3/index.js'

describe('CocktailSort3', () => {
  // ─── sort ───
  describe('sort', () => {
    it('returns empty array for empty input', () => {
      const cs = new CocktailSort3<number>()
      expect(cs.sort([])).toEqual([])
    })

    it('returns single element for single input', () => {
      const cs = new CocktailSort3<number>()
      expect(cs.sort([42])).toEqual([42])
    })

    it('returns already sorted array unchanged', () => {
      const cs = new CocktailSort3<number>()
      expect(cs.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts reverse sorted array', () => {
      const cs = new CocktailSort3<number>()
      expect(cs.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts random order array', () => {
      const cs = new CocktailSort3<number>()
      expect(cs.sort([3, 1, 4, 1, 5, 9, 2, 6])).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
    })

    it('handles duplicates', () => {
      const cs = new CocktailSort3<number>()
      expect(cs.sort([3, 3, 3, 1, 1, 2, 2])).toEqual([1, 1, 2, 2, 3, 3, 3])
    })

    it('handles negative numbers', () => {
      const cs = new CocktailSort3<number>()
      expect(cs.sort([-3, -1, -2, -5, -4])).toEqual([-5, -4, -3, -2, -1])
    })

    it('handles mixed positive and negative', () => {
      const cs = new CocktailSort3<number>()
      expect(cs.sort([3, -1, 0, -2, 2])).toEqual([-2, -1, 0, 2, 3])
    })

    it('handles all identical elements', () => {
      const cs = new CocktailSort3<number>()
      expect(cs.sort([5, 5, 5, 5])).toEqual([5, 5, 5, 5])
    })

    it('handles two elements', () => {
      const cs = new CocktailSort3<number>()
      expect(cs.sort([2, 1])).toEqual([1, 2])
    })

    it('does not modify original array', () => {
      const cs = new CocktailSort3<number>()
      const original = [3, 1, 2]
      const sorted = cs.sort(original)
      expect(original).toEqual([3, 1, 2])
      expect(sorted).toEqual([1, 2, 3])
    })

    it('sorts strings correctly', () => {
      const cs = new CocktailSort3<string>()
      expect(cs.sort(['banana', 'apple', 'cherry'])).toEqual(['apple', 'banana', 'cherry'])
    })
  })

  // ─── sortDescending ───
  describe('sortDescending', () => {
    it('returns empty array for empty input', () => {
      const cs = new CocktailSort3<number>()
      expect(cs.sortDescending([])).toEqual([])
    })

    it('returns single element for single input', () => {
      const cs = new CocktailSort3<number>()
      expect(cs.sortDescending([42])).toEqual([42])
    })

    it('sorts descending', () => {
      const cs = new CocktailSort3<number>()
      expect(cs.sortDescending([1, 2, 3, 4, 5])).toEqual([5, 4, 3, 2, 1])
    })

    it('sorts unsorted array descending', () => {
      const cs = new CocktailSort3<number>()
      expect(cs.sortDescending([3, 1, 4, 1, 5])).toEqual([5, 4, 3, 1, 1])
    })

    it('handles duplicates descending', () => {
      const cs = new CocktailSort3<number>()
      expect(cs.sortDescending([1, 1, 2, 2, 3])).toEqual([3, 2, 2, 1, 1])
    })

    it('handles negative numbers descending', () => {
      const cs = new CocktailSort3<number>()
      expect(cs.sortDescending([-3, -1, -2])).toEqual([-1, -2, -3])
    })

    it('does not modify original array', () => {
      const cs = new CocktailSort3<number>()
      const original = [3, 1, 2]
      cs.sortDescending(original)
      expect(original).toEqual([3, 1, 2])
    })
  })

  // ─── isSorted ───
  describe('isSorted', () => {
    it('returns true for empty array', () => {
      const cs = new CocktailSort3<number>()
      expect(cs.isSorted([])).toBe(true)
    })

    it('returns true for single element', () => {
      const cs = new CocktailSort3<number>()
      expect(cs.isSorted([1])).toBe(true)
    })

    it('returns true for sorted array', () => {
      const cs = new CocktailSort3<number>()
      expect(cs.isSorted([1, 2, 3, 4, 5])).toBe(true)
    })

    it('returns false for unsorted array', () => {
      const cs = new CocktailSort3<number>()
      expect(cs.isSorted([3, 1, 2])).toBe(false)
    })

    it('returns true for equal elements', () => {
      const cs = new CocktailSort3<number>()
      expect(cs.isSorted([5, 5, 5])).toBe(true)
    })

    it('returns false for reverse sorted', () => {
      const cs = new CocktailSort3<number>()
      expect(cs.isSorted([5, 4, 3, 2, 1])).toBe(false)
    })
  })

  // ─── Metrics ───
  describe('getSwapCount', () => {
    it('returns 0 before sorting', () => {
      const cs = new CocktailSort3<number>()
      expect(cs.getSwapCount()).toBe(0)
    })

    it('returns 0 after sorting empty array', () => {
      const cs = new CocktailSort3<number>()
      cs.sort([])
      expect(cs.getSwapCount()).toBe(0)
    })

    it('returns 0 for already sorted array', () => {
      const cs = new CocktailSort3<number>()
      cs.sort([1, 2, 3])
      expect(cs.getSwapCount()).toBe(0)
    })

    it('returns positive count for unsorted array', () => {
      const cs = new CocktailSort3<number>()
      cs.sort([5, 4, 3, 2, 1])
      expect(cs.getSwapCount()).toBeGreaterThan(0)
    })

    it('resets count on new sort call', () => {
      const cs = new CocktailSort3<number>()
      cs.sort([5, 4, 3, 2, 1])
      const first = cs.getSwapCount()
      cs.sort([1, 2, 3])
      expect(cs.getSwapCount()).toBe(0)
      expect(first).toBeGreaterThan(0)
    })
  })

  describe('getPassCount', () => {
    it('returns 0 before sorting', () => {
      const cs = new CocktailSort3<number>()
      expect(cs.getPassCount()).toBe(0)
    })

    it('returns 0 after sorting empty array', () => {
      const cs = new CocktailSort3<number>()
      cs.sort([])
      expect(cs.getPassCount()).toBe(0)
    })

    it('returns positive count for unsorted array', () => {
      const cs = new CocktailSort3<number>()
      cs.sort([5, 4, 3, 2, 1])
      expect(cs.getPassCount()).toBeGreaterThan(0)
    })

    it('resets count on new sort call', () => {
      const cs = new CocktailSort3<number>()
      cs.sort([5, 4, 3])
      cs.sort([])
      expect(cs.getPassCount()).toBe(0)
    })
  })

  // ─── Complexity ───
  describe('getTimeComplexity', () => {
    it('returns O(n²)', () => {
      const cs = new CocktailSort3<number>()
      expect(cs.getTimeComplexity()).toBe('O(n²)')
    })
  })

  describe('getSpaceComplexity', () => {
    it('returns O(1)', () => {
      const cs = new CocktailSort3<number>()
      expect(cs.getSpaceComplexity()).toBe('O(1)')
    })
  })
})
