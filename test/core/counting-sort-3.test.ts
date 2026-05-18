import { describe, it, expect } from 'vitest'
import { CountingSort } from '../../src/core/counting-sort-3/index.js'

// ─── Constructor ───

describe('CountingSort', () => {
  describe('constructor', () => {
    it('should accept an array of numbers', () => {
      const sorter = new CountingSort([3, 1, 2])
      expect(sorter.toArray()).toEqual([3, 1, 2])
    })

    it('should accept an empty array', () => {
      const sorter = new CountingSort([])
      expect(sorter.toArray()).toEqual([])
    })

    it('should accept maxValue parameter', () => {
      const sorter = new CountingSort([1, 2, 3], 10)
      expect(sorter.getMax()).toBe(10)
    })

    it('should not mutate the original array', () => {
      const original = [3, 1, 2]
      const sorter = new CountingSort(original)
      sorter.sort()
      expect(original).toEqual([3, 1, 2])
    })
  })

  // ─── sort ───

  describe('sort', () => {
    it('should sort an unsorted array', () => {
      const sorter = new CountingSort([3, 1, 4, 1, 5, 9, 2, 6])
      expect(sorter.sort()).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
    })

    it('should return empty array for empty input', () => {
      const sorter = new CountingSort([])
      expect(sorter.sort()).toEqual([])
    })

    it('should handle single element', () => {
      const sorter = new CountingSort([42])
      expect(sorter.sort()).toEqual([42])
    })

    it('should handle already sorted array', () => {
      const sorter = new CountingSort([1, 2, 3, 4, 5])
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle reverse sorted array', () => {
      const sorter = new CountingSort([5, 4, 3, 2, 1])
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle duplicates', () => {
      const sorter = new CountingSort([3, 3, 3, 1, 1, 2])
      expect(sorter.sort()).toEqual([1, 1, 2, 3, 3, 3])
    })

    it('should handle all same elements', () => {
      const sorter = new CountingSort([7, 7, 7])
      expect(sorter.sort()).toEqual([7, 7, 7])
    })

    it('should preserve stability of duplicate values', () => {
      const sorter = new CountingSort([2, 1, 2, 1])
      const result = sorter.sort()
      expect(result).toEqual([1, 1, 2, 2])
    })
  })

  // ─── isSorted ───

  describe('isSorted', () => {
    it('should return true for sorted array', () => {
      const sorter = new CountingSort([1, 2, 3])
      expect(sorter.isSorted()).toBe(true)
    })

    it('should return false for unsorted array', () => {
      const sorter = new CountingSort([3, 1, 2])
      expect(sorter.isSorted()).toBe(false)
    })

    it('should return true for empty array', () => {
      const sorter = new CountingSort([])
      expect(sorter.isSorted()).toBe(true)
    })

    it('should return true for single element', () => {
      const sorter = new CountingSort([5])
      expect(sorter.isSorted()).toBe(true)
    })
  })

  // ─── getCounts ───

  describe('getCounts', () => {
    it('should return frequency counts', () => {
      const sorter = new CountingSort([1, 2, 2, 3, 3, 3])
      expect(sorter.getCounts()).toEqual([1, 2, 3])
    })

    it('should return empty array for empty input', () => {
      const sorter = new CountingSort([])
      expect(sorter.getCounts()).toEqual([])
    })

    it('should handle single element', () => {
      const sorter = new CountingSort([5])
      expect(sorter.getCounts()).toEqual([1])
    })
  })

  // ─── getMin / getMax ───

  describe('getMin and getMax', () => {
    it('should return correct min and max', () => {
      const sorter = new CountingSort([3, 1, 7, 2])
      expect(sorter.getMin()).toBe(1)
      expect(sorter.getMax()).toBe(7)
    })

    it('should return undefined for empty array', () => {
      const sorter = new CountingSort([])
      expect(sorter.getMin()).toBeUndefined()
      expect(sorter.getMax()).toBeUndefined()
    })

    it('should return same value for single element', () => {
      const sorter = new CountingSort([5])
      expect(sorter.getMin()).toBe(5)
      expect(sorter.getMax()).toBe(5)
    })

    it('should use provided maxValue', () => {
      const sorter = new CountingSort([1, 2], 10)
      expect(sorter.getMax()).toBe(10)
    })
  })

  // ─── getRange ───

  describe('getRange', () => {
    it('should return correct range', () => {
      const sorter = new CountingSort([1, 5])
      expect(sorter.getRange()).toBe(5)
    })

    it('should return 1 for single element', () => {
      const sorter = new CountingSort([3])
      expect(sorter.getRange()).toBe(1)
    })

    it('should return 1 for empty array', () => {
      const sorter = new CountingSort([])
      expect(sorter.getRange()).toBe(1)
    })
  })

  // ─── toArray ───

  describe('toArray', () => {
    it('should return a copy of the original array', () => {
      const sorter = new CountingSort([3, 1, 2])
      const arr = sorter.toArray()
      expect(arr).toEqual([3, 1, 2])
      arr[0] = 99
      expect(sorter.toArray()[0]).toBe(3)
    })
  })

  // ─── getTimeComplexity ───

  describe('getTimeComplexity', () => {
    it('should return O(n + k) format', () => {
      const sorter = new CountingSort([1, 2, 3])
      const complexity = sorter.getTimeComplexity()
      expect(complexity).toContain('O(n + k)')
    })

    it('should include actual values', () => {
      const sorter = new CountingSort([1, 3])
      const complexity = sorter.getTimeComplexity()
      expect(complexity).toContain('2')
      expect(complexity).toContain('3')
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('should handle large range with few elements', () => {
      const sorter = new CountingSort([1, 100])
      expect(sorter.sort()).toEqual([1, 100])
    })

    it('should handle two elements', () => {
      const sorter = new CountingSort([2, 1])
      expect(sorter.sort()).toEqual([1, 2])
    })

    it('should handle identical min and max', () => {
      const sorter = new CountingSort([5, 5, 5, 5])
      expect(sorter.sort()).toEqual([5, 5, 5, 5])
      expect(sorter.getRange()).toBe(1)
    })
  })
})
