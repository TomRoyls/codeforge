import { describe, it, expect } from 'vitest'
import { CombSort3 } from '../../src/core/comb-sort-3/index.js'

describe('CombSort3', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('creates sorter with default compare', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.getSwapCount()).toBe(0)
    })

    it('creates sorter with custom compare', () => {
      const sorter = new CombSort3<string>((a, b) => a.length - b.length)
      expect(sorter.sort(['aaa', 'b', 'cc'])).toEqual(['b', 'cc', 'aaa'])
    })
  })

  // ─── sort() ───
  describe('sort', () => {
    it('sorts numbers in ascending order', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.sort([5, 2, 8, 1, 9])).toEqual([1, 2, 5, 8, 9])
    })

    it('returns new array without mutating original', () => {
      const sorter = new CombSort3<number>()
      const original = [3, 1, 2]
      const sorted = sorter.sort(original)
      expect(sorted).toEqual([1, 2, 3])
      expect(original).toEqual([3, 1, 2])
    })

    it('handles empty array', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.sort([])).toEqual([])
    })

    it('handles single element', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.sort([42])).toEqual([42])
    })

    it('handles already sorted array', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
    })

    it('handles reverse sorted array', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
    })

    it('handles duplicate values', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.sort([3, 1, 2, 1, 3])).toEqual([1, 1, 2, 3, 3])
    })

    it('handles negative numbers', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.sort([-3, 0, -1, 2, -2])).toEqual([-3, -2, -1, 0, 2])
    })

    it('handles two elements', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.sort([2, 1])).toEqual([1, 2])
      expect(sorter.sort([1, 2])).toEqual([1, 2])
    })

    it('sorts strings', () => {
      const sorter = new CombSort3<string>()
      expect(sorter.sort(['banana', 'apple', 'cherry'])).toEqual(['apple', 'banana', 'cherry'])
    })
  })

  // ─── sortDescending() ───
  describe('sortDescending', () => {
    it('sorts numbers in descending order', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.sortDescending([1, 5, 2, 8, 3])).toEqual([8, 5, 3, 2, 1])
    })

    it('returns new array', () => {
      const sorter = new CombSort3<number>()
      const original = [3, 1, 2]
      const sorted = sorter.sortDescending(original)
      expect(sorted).toEqual([3, 2, 1])
      expect(original).toEqual([3, 1, 2])
    })

    it('handles empty array', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.sortDescending([])).toEqual([])
    })

    it('handles single element', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.sortDescending([7])).toEqual([7])
    })

    it('handles duplicates', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.sortDescending([1, 3, 2, 3, 1])).toEqual([3, 3, 2, 1, 1])
    })
  })

  // ─── isSorted() ───
  describe('isSorted', () => {
    it('returns true for sorted array', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.isSorted([1, 2, 3, 4, 5])).toBe(true)
    })

    it('returns false for unsorted array', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.isSorted([3, 1, 2])).toBe(false)
    })

    it('returns true for empty array', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.isSorted([])).toBe(true)
    })

    it('returns true for single element', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.isSorted([42])).toBe(true)
    })

    it('returns true for array with duplicates in order', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.isSorted([1, 1, 2, 3, 3])).toBe(true)
    })

    it('returns false for equal adjacent elements in wrong context', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.isSorted([1, 3, 2, 3])).toBe(false)
    })
  })

  // ─── sortWithShrinkFactor() ───
  describe('sortWithShrinkFactor', () => {
    it('sorts with custom shrink factor', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.sortWithShrinkFactor([5, 2, 8, 1, 9], 1.5)).toEqual([1, 2, 5, 8, 9])
    })

    it('throws for shrink factor <= 1', () => {
      const sorter = new CombSort3<number>()
      expect(() => sorter.sortWithShrinkFactor([1, 2], 1)).toThrow('Shrink factor must be greater than 1')
      expect(() => sorter.sortWithShrinkFactor([1, 2], 0.5)).toThrow('Shrink factor must be greater than 1')
    })

    it('returns new array for empty and single-element', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.sortWithShrinkFactor([], 1.3)).toEqual([])
      expect(sorter.sortWithShrinkFactor([1], 1.3)).toEqual([1])
    })
  })

  // ─── getGapSequence() ───
  describe('getGapSequence', () => {
    it('returns array of decreasing gap values', () => {
      const sorter = new CombSort3<number>()
      const gaps = sorter.getGapSequence()
      expect(gaps.length).toBeGreaterThan(0)
      for (let i = 1; i < gaps.length; i++) {
        expect(gaps[i]).toBeLessThanOrEqual(gaps[i - 1]!)
      }
    })

    it('all gaps are >= 1', () => {
      const sorter = new CombSort3<number>()
      const gaps = sorter.getGapSequence()
      for (const gap of gaps) {
        expect(gap).toBeGreaterThanOrEqual(1)
      }
    })
  })

  // ─── getSwapCount() ───
  describe('getSwapCount', () => {
    it('returns 0 before sorting', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.getSwapCount()).toBe(0)
    })

    it('returns 0 for already sorted input', () => {
      const sorter = new CombSort3<number>()
      sorter.sort([1, 2, 3, 4, 5])
      expect(sorter.getSwapCount()).toBe(0)
    })

    it('returns positive count for unsorted input', () => {
      const sorter = new CombSort3<number>()
      sorter.sort([5, 4, 3, 2, 1])
      expect(sorter.getSwapCount()).toBeGreaterThan(0)
    })

    it('updates after each sort call', () => {
      const sorter = new CombSort3<number>()
      sorter.sort([3, 1, 2])
      const first = sorter.getSwapCount()
      sorter.sort([5, 4, 3, 2, 1])
      const second = sorter.getSwapCount()
      expect(second).toBeGreaterThan(0)
    })
  })

  // ─── getTimeComplexity() / getSpaceComplexity() ───
  describe('complexity', () => {
    it('returns time complexity string', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.getTimeComplexity()).toBe('O(n log n) average, O(n^2) worst case')
    })

    it('returns space complexity string', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.getSpaceComplexity()).toBe('O(1)')
    })
  })
})
