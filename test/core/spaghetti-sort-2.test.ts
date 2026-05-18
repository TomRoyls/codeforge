import { describe, it, expect } from 'vitest'
import { SpaghettiSort2 } from '../../src/core/spaghetti-sort-2/index.js'

describe('SpaghettiSort2', () => {
  describe('constructor', () => {
    it('should create instance with an array', () => {
      const sorter = new SpaghettiSort2([3, 1, 2])
      expect(sorter.toArray()).toEqual([3, 1, 2])
    })

    it('should create instance with empty array', () => {
      const sorter = new SpaghettiSort2([])
      expect(sorter.toArray()).toEqual([])
    })

    it('should not mutate the original array', () => {
      const original = [3, 1, 2]
      const sorter = new SpaghettiSort2(original)
      expect(original).toEqual([3, 1, 2])
      sorter.sort(original)
      expect(original).toEqual([3, 1, 2])
    })
  })

  // ─── Sort ───

  describe('sort', () => {
    it('should return empty array for empty input', () => {
      const sorter = new SpaghettiSort2([])
      expect(sorter.sort([])).toEqual([])
    })

    it('should return single element array', () => {
      const sorter = new SpaghettiSort2([42])
      expect(sorter.sort([42])).toEqual([42])
    })

    it('should sort already sorted array', () => {
      const sorter = new SpaghettiSort2([1, 2, 3])
      expect(sorter.sort([1, 2, 3])).toEqual([1, 2, 3])
    })

    it('should sort reverse sorted array', () => {
      const sorter = new SpaghettiSort2([3, 2, 1])
      expect(sorter.sort([3, 2, 1])).toEqual([1, 2, 3])
    })

    it('should sort unsorted array', () => {
      const sorter = new SpaghettiSort2([5, 3, 8, 1, 9, 2, 7])
      expect(sorter.sort([5, 3, 8, 1, 9, 2, 7])).toEqual([1, 2, 3, 5, 7, 8, 9])
    })

    it('should sort with duplicates', () => {
      const sorter = new SpaghettiSort2([3, 1, 3, 2, 1])
      expect(sorter.sort([3, 1, 3, 2, 1])).toEqual([1, 1, 2, 3, 3])
    })

    it('should sort negative numbers', () => {
      const sorter = new SpaghettiSort2([-3, 0, -7, 2])
      expect(sorter.sort([-3, 0, -7, 2])).toEqual([-7, -3, 0, 2])
    })

    it('should sort all same values', () => {
      const sorter = new SpaghettiSort2([5, 5, 5])
      expect(sorter.sort([5, 5, 5])).toEqual([5, 5, 5])
    })

    it('should sort two elements', () => {
      const sorter = new SpaghettiSort2([2, 1])
      expect(sorter.sort([2, 1])).toEqual([1, 2])
    })

    it('should handle array independent of constructor array', () => {
      const sorter = new SpaghettiSort2([1, 2, 3])
      expect(sorter.sort([9, 4, 6])).toEqual([4, 6, 9])
    })
  })

  // ─── SortDescending ───

  describe('sortDescending', () => {
    it('should return empty array for empty input', () => {
      const sorter = new SpaghettiSort2([])
      expect(sorter.sortDescending([])).toEqual([])
    })

    it('should return single element array', () => {
      const sorter = new SpaghettiSort2([42])
      expect(sorter.sortDescending([42])).toEqual([42])
    })

    it('should sort in descending order', () => {
      const sorter = new SpaghettiSort2([3, 1, 2])
      expect(sorter.sortDescending([3, 1, 2])).toEqual([3, 2, 1])
    })

    it('should sort ascending array to descending', () => {
      const sorter = new SpaghettiSort2([1, 2, 3])
      expect(sorter.sortDescending([1, 2, 3])).toEqual([3, 2, 1])
    })

    it('should handle duplicates in descending', () => {
      const sorter = new SpaghettiSort2([1, 3, 2, 3])
      expect(sorter.sortDescending([1, 3, 2, 3])).toEqual([3, 3, 2, 1])
    })

    it('should handle negatives in descending', () => {
      const sorter = new SpaghettiSort2([-3, 0, -7, 2])
      expect(sorter.sortDescending([-3, 0, -7, 2])).toEqual([2, 0, -3, -7])
    })
  })

  // ─── IsSorted ───

  describe('isSorted', () => {
    it('should return true for empty array', () => {
      const sorter = new SpaghettiSort2([])
      expect(sorter.isSorted([])).toBe(true)
    })

    it('should return true for single element array', () => {
      const sorter = new SpaghettiSort2([1])
      expect(sorter.isSorted([1])).toBe(true)
    })

    it('should return true for sorted array', () => {
      const sorter = new SpaghettiSort2([1, 2, 3])
      expect(sorter.isSorted([1, 2, 3])).toBe(true)
    })

    it('should return false for unsorted array', () => {
      const sorter = new SpaghettiSort2([3, 1, 2])
      expect(sorter.isSorted([3, 1, 2])).toBe(false)
    })

    it('should return true for array with duplicates', () => {
      const sorter = new SpaghettiSort2([1, 2, 2])
      expect(sorter.isSorted([1, 2, 2])).toBe(true)
    })

    it('should return false for array with decreasing duplicates', () => {
      const sorter = new SpaghettiSort2([2, 2, 1])
      expect(sorter.isSorted([2, 2, 1])).toBe(false)
    })
  })

  // ─── Static FindMax ───

  describe('static findMax', () => {
    it('should return undefined for empty array', () => {
      expect(SpaghettiSort2.findMax([])).toBeUndefined()
    })

    it('should return the only element', () => {
      expect(SpaghettiSort2.findMax([42])).toBe(42)
    })

    it('should return the maximum value', () => {
      expect(SpaghettiSort2.findMax([3, 7, 1, 9, 4])).toBe(9)
    })

    it('should handle negative numbers', () => {
      expect(SpaghettiSort2.findMax([-5, -1, -3])).toBe(-1)
    })

    it('should handle duplicates', () => {
      expect(SpaghettiSort2.findMax([5, 5, 5])).toBe(5)
    })
  })

  // ─── Static FindMin ───

  describe('static findMin', () => {
    it('should return undefined for empty array', () => {
      expect(SpaghettiSort2.findMin([])).toBeUndefined()
    })

    it('should return the only element', () => {
      expect(SpaghettiSort2.findMin([42])).toBe(42)
    })

    it('should return the minimum value', () => {
      expect(SpaghettiSort2.findMin([3, 7, 1, 9, 4])).toBe(1)
    })

    it('should handle negative numbers', () => {
      expect(SpaghettiSort2.findMin([-5, -1, -3])).toBe(-5)
    })

    it('should handle duplicates', () => {
      expect(SpaghettiSort2.findMin([5, 5, 5])).toBe(5)
    })
  })

  // ─── GetTimeComplexity ───

  describe('getTimeComplexity', () => {
    it('should return correct complexity for empty array', () => {
      const sorter = new SpaghettiSort2([])
      expect(sorter.getTimeComplexity()).toBe('O(n²) = O(0²)')
    })

    it('should return correct complexity for non-empty array', () => {
      const sorter = new SpaghettiSort2([1, 2, 3])
      expect(sorter.getTimeComplexity()).toBe('O(n²) = O(3²)')
    })
  })

  // ─── GetSpaceComplexity ───

  describe('getSpaceComplexity', () => {
    it('should return correct complexity for empty array', () => {
      const sorter = new SpaghettiSort2([])
      expect(sorter.getSpaceComplexity()).toBe('O(n) = O(0)')
    })

    it('should return correct complexity for non-empty array', () => {
      const sorter = new SpaghettiSort2([1, 2, 3, 4])
      expect(sorter.getSpaceComplexity()).toBe('O(n) = O(4)')
    })
  })

  // ─── ToArray ───

  describe('toArray', () => {
    it('should return a copy of the original array', () => {
      const sorter = new SpaghettiSort2([3, 1, 2])
      const arr = sorter.toArray()
      expect(arr).toEqual([3, 1, 2])
      arr[0] = 99
      expect(sorter.toArray()).toEqual([3, 1, 2])
    })

    it('should return empty array for empty constructor', () => {
      const sorter = new SpaghettiSort2([])
      expect(sorter.toArray()).toEqual([])
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('should sort large array', () => {
      const n = 100
      const input: number[] = []
      for (let i = n; i >= 1; i--) {
        input.push(i)
      }
      const sorter = new SpaghettiSort2(input)
      const result = sorter.sort([...input])
      for (let i = 0; i < n; i++) {
        expect(result[i]).toBe(i + 1)
      }
    })

    it('should handle array with negative and positive values', () => {
      const sorter = new SpaghettiSort2([3, -1, 0, -5, 7])
      expect(sorter.sort([3, -1, 0, -5, 7])).toEqual([-5, -1, 0, 3, 7])
    })

    it('should produce consistent results across multiple calls', () => {
      const sorter = new SpaghettiSort2([3, 1, 2])
      const arr = [3, 1, 2]
      const first = sorter.sort(arr)
      const second = sorter.sort(arr)
      expect(first).toEqual(second)
    })

    it('should confirm sorted output with isSorted', () => {
      const sorter = new SpaghettiSort2([5, 3, 8, 1])
      const sorted = sorter.sort([5, 3, 8, 1])
      expect(sorter.isSorted(sorted)).toBe(true)
    })
  })
})
