import { describe, it, expect } from 'vitest'
import { StrandSort2 } from '../../src/core/strand-sort-2/index.js'

describe('StrandSort2', () => {
  // ─── Static sort ───
  describe('sort (static)', () => {
    it('returns empty array for empty input', () => {
      expect(StrandSort2.sort([])).toEqual([])
    })

    it('returns single element for single input', () => {
      expect(StrandSort2.sort([42])).toEqual([42])
    })

    it('returns sorted for already sorted array', () => {
      expect(StrandSort2.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts reverse sorted array', () => {
      expect(StrandSort2.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts random order array', () => {
      expect(StrandSort2.sort([3, 1, 4, 1, 5, 9, 2, 6])).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
    })

    it('sorts with negative numbers', () => {
      expect(StrandSort2.sort([-1, -3, -2])).toEqual([-3, -2, -1])
    })

    it('sorts with mixed positive and negative', () => {
      expect(StrandSort2.sort([3, -1, 0, -5, 2])).toEqual([-5, -1, 0, 2, 3])
    })

    it('sorts array with all equal elements', () => {
      expect(StrandSort2.sort([5, 5, 5, 5])).toEqual([5, 5, 5, 5])
    })

    it('sorts two elements', () => {
      expect(StrandSort2.sort([2, 1])).toEqual([1, 2])
    })

    it('does not modify the original array', () => {
      const original = [3, 1, 2]
      StrandSort2.sort(original)
      expect(original).toEqual([3, 1, 2])
    })

    it('sorts large array', () => {
      const arr = Array.from({ length: 100 }, (_, i) => 100 - i)
      const result = StrandSort2.sort(arr)
      for (let i = 1; i < result.length; i++) {
        expect(result[i]).toBeGreaterThanOrEqual(result[i - 1]!)
      }
    })
  })

  // ─── Static sortDescending ───
  describe('sortDescending (static)', () => {
    it('returns empty array for empty input', () => {
      expect(StrandSort2.sortDescending([])).toEqual([])
    })

    it('returns single element for single input', () => {
      expect(StrandSort2.sortDescending([42])).toEqual([42])
    })

    it('sorts ascending input to descending', () => {
      expect(StrandSort2.sortDescending([1, 2, 3])).toEqual([3, 2, 1])
    })

    it('sorts random array descending', () => {
      expect(StrandSort2.sortDescending([3, 1, 4, 1, 5])).toEqual([5, 4, 3, 1, 1])
    })

    it('sorts with negative numbers descending', () => {
      expect(StrandSort2.sortDescending([-1, -3, -2])).toEqual([-1, -2, -3])
    })

    it('sorts two elements descending', () => {
      expect(StrandSort2.sortDescending([1, 2])).toEqual([2, 1])
    })
  })

  // ─── Static isSorted ───
  describe('isSorted (static)', () => {
    it('returns true for empty array', () => {
      expect(StrandSort2.isSorted([])).toBe(true)
    })

    it('returns true for single element', () => {
      expect(StrandSort2.isSorted([1])).toBe(true)
    })

    it('returns true for sorted array', () => {
      expect(StrandSort2.isSorted([1, 2, 3, 4, 5])).toBe(true)
    })

    it('returns false for unsorted array', () => {
      expect(StrandSort2.isSorted([3, 1, 2])).toBe(false)
    })

    it('returns true for equal elements', () => {
      expect(StrandSort2.isSorted([5, 5, 5])).toBe(true)
    })

    it('returns false for reverse sorted', () => {
      expect(StrandSort2.isSorted([5, 4, 3, 2, 1])).toBe(false)
    })

    it('returns true for two equal elements', () => {
      expect(StrandSort2.isSorted([7, 7])).toBe(true)
    })
  })

  // ─── Instance sortInstance ───
  describe('sortInstance', () => {
    it('sorts via instance method', () => {
      const ss = new StrandSort2()
      expect(ss.sortInstance([3, 1, 2])).toEqual([1, 2, 3])
    })

    it('returns empty array for empty input', () => {
      const ss = new StrandSort2()
      expect(ss.sortInstance([])).toEqual([])
    })

    it('returns single element for single input', () => {
      const ss = new StrandSort2()
      expect(ss.sortInstance([42])).toEqual([42])
    })
  })
})
