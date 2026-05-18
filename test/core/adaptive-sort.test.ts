import { describe, it, expect } from 'vitest'
import { AdaptiveSort } from '../../src/core/adaptive-sort/index.js'

describe('AdaptiveSort', () => {

  // ─── Constructor ───

  describe('constructor', () => {
    it('should create a sorter with default comparator', () => {
      const sorter = new AdaptiveSort([3, 1, 2])
      expect(sorter.sort()).toEqual([1, 2, 3])
    })

    it('should accept a custom comparator', () => {
      const sorter = new AdaptiveSort([1, 2, 3], (a, b) => b - a)
      expect(sorter.sort()).toEqual([3, 2, 1])
    })

    it('should not mutate the original array', () => {
      const original = [3, 1, 2]
      const sorter = new AdaptiveSort(original)
      sorter.sort()
      expect(original).toEqual([3, 1, 2])
    })
  })

  // ─── Sort ───

  describe('sort', () => {
    it('should return empty array for empty input', () => {
      const sorter = new AdaptiveSort<number>([])
      expect(sorter.sort()).toEqual([])
    })

    it('should return single element unchanged', () => {
      const sorter = new AdaptiveSort([42])
      expect(sorter.sort()).toEqual([42])
    })

    it('should sort two elements', () => {
      const sorter = new AdaptiveSort([2, 1])
      expect(sorter.sort()).toEqual([1, 2])
    })

    it('should sort already sorted array', () => {
      const sorter = new AdaptiveSort([1, 2, 3, 4, 5])
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5])
    })

    it('should sort reverse sorted array', () => {
      const sorter = new AdaptiveSort([5, 4, 3, 2, 1])
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5])
    })

    it('should sort random order array', () => {
      const sorter = new AdaptiveSort([3, 1, 4, 1, 5, 9, 2, 6])
      expect(sorter.sort()).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
    })

    it('should handle duplicates', () => {
      const sorter = new AdaptiveSort([1, 1, 1, 1])
      expect(sorter.sort()).toEqual([1, 1, 1, 1])
    })

    it('should handle negative numbers', () => {
      const sorter = new AdaptiveSort([-3, -1, -4, -1, -5])
      expect(sorter.sort()).toEqual([-5, -4, -3, -1, -1])
    })

    it('should handle mixed positive and negative', () => {
      const sorter = new AdaptiveSort([-2, 0, 3, -1, 2])
      expect(sorter.sort()).toEqual([-2, -1, 0, 2, 3])
    })

    it('should sort a large random array', () => {
      const arr = Array.from({ length: 100 }, () => Math.floor(Math.random() * 1000))
      const sorter = new AdaptiveSort(arr)
      const result = sorter.sort()
      for (let i = 1; i < result.length; i++) {
        expect(result[i]!).toBeGreaterThanOrEqual(result[i - 1]!)
      }
    })

    it('should handle strings with custom comparator', () => {
      const sorter = new AdaptiveSort(['banana', 'apple', 'cherry'], (a, b) => a.localeCompare(b))
      expect(sorter.sort()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should return a new array each time', () => {
      const sorter = new AdaptiveSort([3, 1, 2])
      const result1 = sorter.sort()
      const result2 = sorter.sort()
      expect(result1).not.toBe(result2)
      expect(result1).toEqual(result2)
    })
  })

  // ─── IsSorted ───

  describe('isSorted', () => {
    it('should return true for empty array', () => {
      const sorter = new AdaptiveSort<number>([])
      expect(sorter.isSorted()).toBe(true)
    })

    it('should return true for single element', () => {
      const sorter = new AdaptiveSort([1])
      expect(sorter.isSorted()).toBe(true)
    })

    it('should return true for sorted array', () => {
      const sorter = new AdaptiveSort([1, 2, 3, 4, 5])
      expect(sorter.isSorted()).toBe(true)
    })

    it('should return false for unsorted array', () => {
      const sorter = new AdaptiveSort([3, 1, 2])
      expect(sorter.isSorted()).toBe(false)
    })

    it('should return true for array with equal elements', () => {
      const sorter = new AdaptiveSort([1, 1, 1])
      expect(sorter.isSorted()).toBe(true)
    })
  })

  // ─── GetTimeComplexity ───

  describe('getTimeComplexity', () => {
    it('should return O(n) for empty array', () => {
      const sorter = new AdaptiveSort<number>([])
      expect(sorter.getTimeComplexity()).toBe('O(n)')
    })

    it('should return O(n) for single element', () => {
      const sorter = new AdaptiveSort([1])
      expect(sorter.getTimeComplexity()).toBe('O(n)')
    })

    it('should return O(n) for nearly sorted array', () => {
      const sorter = new AdaptiveSort([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      expect(sorter.getTimeComplexity()).toBe('O(n)')
    })

    it('should return O(n) for nearly reverse sorted array', () => {
      const sorter = new AdaptiveSort([10, 9, 8, 7, 6, 5, 4, 3, 2, 1])
      expect(sorter.getTimeComplexity()).toBe('O(n)')
    })

    it('should return O(n log n) for random array', () => {
      const arr = Array.from({ length: 50 }, () => Math.floor(Math.random() * 100))
      const sorter = new AdaptiveSort(arr)
      const tc = sorter.getTimeComplexity()
      expect(tc).toContain('O(n')
    })
  })
})
