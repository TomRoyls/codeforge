import { describe, it, expect } from 'vitest'
import { PigeonholeSort3 } from '../../src/core/pigeonhole-sort-3/index.js'

describe('PigeonholeSort3', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('creates instance with non-empty array', () => {
      const ps = new PigeonholeSort3([3, 1, 2])
      expect(ps).toBeInstanceOf(PigeonholeSort3)
    })

    it('creates instance with empty array', () => {
      const ps = new PigeonholeSort3([])
      expect(ps).toBeInstanceOf(PigeonholeSort3)
    })

    it('does not modify the original array', () => {
      const original = [3, 1, 2]
      new PigeonholeSort3(original)
      expect(original).toEqual([3, 1, 2])
    })
  })

  // ─── sort ───
  describe('sort', () => {
    it('returns empty array for empty input', () => {
      const ps = new PigeonholeSort3([])
      expect(ps.sort()).toEqual([])
    })

    it('returns single element for single input', () => {
      const ps = new PigeonholeSort3([42])
      expect(ps.sort()).toEqual([42])
    })

    it('returns sorted for already sorted array', () => {
      const ps = new PigeonholeSort3([1, 2, 3, 4, 5])
      expect(ps.sort()).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts reverse sorted array', () => {
      const ps = new PigeonholeSort3([5, 4, 3, 2, 1])
      expect(ps.sort()).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts random order array', () => {
      const ps = new PigeonholeSort3([3, 1, 4, 1, 5, 9, 2, 6])
      expect(ps.sort()).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
    })

    it('sorts with negative numbers', () => {
      const ps = new PigeonholeSort3([-1, -3, -2])
      expect(ps.sort()).toEqual([-3, -2, -1])
    })

    it('sorts with mixed positive and negative', () => {
      const ps = new PigeonholeSort3([3, -1, 0, -5, 2])
      expect(ps.sort()).toEqual([-5, -1, 0, 2, 3])
    })

    it('sorts array with all equal elements', () => {
      const ps = new PigeonholeSort3([5, 5, 5, 5])
      expect(ps.sort()).toEqual([5, 5, 5, 5])
    })

    it('sorts two elements', () => {
      const ps = new PigeonholeSort3([2, 1])
      expect(ps.sort()).toEqual([1, 2])
    })

    it('sorts large array', () => {
      const arr = Array.from({ length: 100 }, (_, i) => 100 - i)
      const ps = new PigeonholeSort3(arr)
      const result = ps.sort()
      for (let i = 1; i < result.length; i++) {
        expect(result[i]).toBeGreaterThanOrEqual(result[i - 1]!)
      }
    })
  })

  // ─── sortDescending ───
  describe('sortDescending', () => {
    it('returns empty array for empty input', () => {
      const ps = new PigeonholeSort3([])
      expect(ps.sortDescending()).toEqual([])
    })

    it('returns single element for single input', () => {
      const ps = new PigeonholeSort3([42])
      expect(ps.sortDescending()).toEqual([42])
    })

    it('sorts ascending input to descending', () => {
      const ps = new PigeonholeSort3([1, 2, 3, 4, 5])
      expect(ps.sortDescending()).toEqual([5, 4, 3, 2, 1])
    })

    it('sorts random array descending', () => {
      const ps = new PigeonholeSort3([3, 1, 4, 1, 5])
      expect(ps.sortDescending()).toEqual([5, 4, 3, 1, 1])
    })

    it('sorts with negative numbers descending', () => {
      const ps = new PigeonholeSort3([-1, -3, -2])
      expect(ps.sortDescending()).toEqual([-1, -2, -3])
    })
  })

  // ─── isSorted ───
  describe('isSorted', () => {
    it('returns true for empty array', () => {
      const ps = new PigeonholeSort3([])
      expect(ps.isSorted()).toBe(true)
    })

    it('returns true for single element', () => {
      const ps = new PigeonholeSort3([1])
      expect(ps.isSorted()).toBe(true)
    })

    it('returns true for sorted array', () => {
      const ps = new PigeonholeSort3([1, 2, 3, 4, 5])
      expect(ps.isSorted()).toBe(true)
    })

    it('returns false for unsorted array', () => {
      const ps = new PigeonholeSort3([3, 1, 2])
      expect(ps.isSorted()).toBe(false)
    })

    it('returns true for equal elements', () => {
      const ps = new PigeonholeSort3([5, 5, 5])
      expect(ps.isSorted()).toBe(true)
    })

    it('returns false for reverse sorted', () => {
      const ps = new PigeonholeSort3([5, 4, 3, 2, 1])
      expect(ps.isSorted()).toBe(false)
    })
  })

  // ─── findRange ───
  describe('findRange', () => {
    it('returns 0 for empty array', () => {
      const ps = new PigeonholeSort3([])
      expect(ps.findRange()).toBe(0)
    })

    it('returns 1 for single element', () => {
      const ps = new PigeonholeSort3([5])
      expect(ps.findRange()).toBe(1)
    })

    it('returns correct range for [1, 5]', () => {
      const ps = new PigeonholeSort3([1, 5])
      expect(ps.findRange()).toBe(5)
    })

    it('returns correct range for consecutive numbers', () => {
      const ps = new PigeonholeSort3([1, 2, 3, 4, 5])
      expect(ps.findRange()).toBe(5)
    })

    it('returns correct range for negative numbers', () => {
      const ps = new PigeonholeSort3([-3, -1])
      expect(ps.findRange()).toBe(3)
    })

    it('returns 1 for all equal elements', () => {
      const ps = new PigeonholeSort3([7, 7, 7])
      expect(ps.findRange()).toBe(1)
    })
  })

  // ─── findMinMax ───
  describe('findMinMax', () => {
    it('returns zeros for empty array', () => {
      const ps = new PigeonholeSort3([])
      expect(ps.findMinMax()).toEqual({ min: 0, max: 0 })
    })

    it('returns correct min/max for single element', () => {
      const ps = new PigeonholeSort3([42])
      expect(ps.findMinMax()).toEqual({ min: 42, max: 42 })
    })

    it('returns correct min/max for multiple elements', () => {
      const ps = new PigeonholeSort3([3, 1, 4, 1, 5, 9])
      expect(ps.findMinMax()).toEqual({ min: 1, max: 9 })
    })

    it('handles negative numbers', () => {
      const ps = new PigeonholeSort3([-5, -1, -3])
      expect(ps.findMinMax()).toEqual({ min: -5, max: -1 })
    })
  })

  // ─── Complexity ───
  describe('getTimeComplexity', () => {
    it('returns correct format for empty array', () => {
      const ps = new PigeonholeSort3([])
      expect(ps.getTimeComplexity()).toBe('O(n + k) = O(0 + 0)')
    })

    it('returns correct format for non-empty array', () => {
      const ps = new PigeonholeSort3([1, 2, 3])
      expect(ps.getTimeComplexity()).toBe('O(n + k) = O(3 + 3)')
    })
  })

  describe('getSpaceComplexity', () => {
    it('returns correct format for empty array', () => {
      const ps = new PigeonholeSort3([])
      expect(ps.getSpaceComplexity()).toBe('O(n + k) = O(0 + 0)')
    })

    it('returns correct format for non-empty array', () => {
      const ps = new PigeonholeSort3([1, 2, 3])
      expect(ps.getSpaceComplexity()).toBe('O(n + k) = O(3 + 3)')
    })
  })
})
