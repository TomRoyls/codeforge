import { describe, it, expect } from 'vitest'
import { BucketSort4 } from '../../src/core/bucket-sort-4/index.js'

describe('BucketSort4', () => {

  // ─── Constructor ───

  describe('constructor', () => {
    it('should create with default bucket size', () => {
      const sorter = new BucketSort4()
      expect(sorter.sort([3, 1, 2])).toEqual([1, 2, 3])
    })

    it('should create with custom bucket size', () => {
      const sorter = new BucketSort4(5)
      expect(sorter.sort([3, 1, 2])).toEqual([1, 2, 3])
    })
  })

  // ─── Sort ───

  describe('sort', () => {
    it('should return empty array for empty input', () => {
      const sorter = new BucketSort4()
      expect(sorter.sort([])).toEqual([])
    })

    it('should return single element unchanged', () => {
      const sorter = new BucketSort4()
      expect(sorter.sort([42])).toEqual([42])
    })

    it('should sort two elements', () => {
      const sorter = new BucketSort4()
      expect(sorter.sort([2, 1])).toEqual([1, 2])
    })

    it('should sort already sorted array', () => {
      const sorter = new BucketSort4()
      expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
    })

    it('should sort reverse sorted array', () => {
      const sorter = new BucketSort4()
      expect(sorter.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
    })

    it('should sort random order array', () => {
      const sorter = new BucketSort4()
      expect(sorter.sort([3, 1, 4, 1, 5, 9, 2, 6])).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
    })

    it('should handle duplicates', () => {
      const sorter = new BucketSort4()
      expect(sorter.sort([3, 3, 1, 1, 2, 2])).toEqual([1, 1, 2, 2, 3, 3])
    })

    it('should handle negative values', () => {
      const sorter = new BucketSort4()
      expect(sorter.sort([-3, -1, -2])).toEqual([-3, -2, -1])
    })

    it('should handle mixed positive and negative', () => {
      const sorter = new BucketSort4()
      expect(sorter.sort([-1, 3, -2, 1, 0])).toEqual([-2, -1, 0, 1, 3])
    })

    it('should not mutate the original array', () => {
      const original = [3, 1, 2]
      const sorter = new BucketSort4()
      sorter.sort(original)
      expect(original).toEqual([3, 1, 2])
    })

    it('should handle all same values', () => {
      const sorter = new BucketSort4()
      expect(sorter.sort([5, 5, 5, 5])).toEqual([5, 5, 5, 5])
    })

    it('should handle large range', () => {
      const sorter = new BucketSort4(10)
      expect(sorter.sort([1, 1000, 500, 250])).toEqual([1, 250, 500, 1000])
    })
  })

  // ─── SortDescending ───

  describe('sortDescending', () => {
    it('should sort in descending order', () => {
      const sorter = new BucketSort4()
      expect(sorter.sortDescending([1, 3, 2])).toEqual([3, 2, 1])
    })

    it('should handle empty array', () => {
      const sorter = new BucketSort4()
      expect(sorter.sortDescending([])).toEqual([])
    })

    it('should handle single element', () => {
      const sorter = new BucketSort4()
      expect(sorter.sortDescending([5])).toEqual([5])
    })
  })

  // ─── IsSorted ───

  describe('isSorted', () => {
    it('should return true for sorted array', () => {
      const sorter = new BucketSort4()
      expect(sorter.isSorted([1, 2, 3])).toBe(true)
    })

    it('should return false for unsorted array', () => {
      const sorter = new BucketSort4()
      expect(sorter.isSorted([3, 1, 2])).toBe(false)
    })

    it('should return true for empty array', () => {
      const sorter = new BucketSort4()
      expect(sorter.isSorted([])).toBe(true)
    })

    it('should return true for single element', () => {
      const sorter = new BucketSort4()
      expect(sorter.isSorted([1])).toBe(true)
    })
  })

  // ─── SortWithBucketCount ───

  describe('sortWithBucketCount', () => {
    it('should sort with specified bucket count', () => {
      const sorter = new BucketSort4()
      expect(sorter.sortWithBucketCount([3, 1, 4, 1, 5], 3)).toEqual([1, 1, 3, 4, 5])
    })

    it('should handle empty array', () => {
      const sorter = new BucketSort4()
      expect(sorter.sortWithBucketCount([], 5)).toEqual([])
    })

    it('should handle single element', () => {
      const sorter = new BucketSort4()
      expect(sorter.sortWithBucketCount([42], 2)).toEqual([42])
    })
  })

  // ─── SortRange ───

  describe('sortRange', () => {
    it('should sort within given range', () => {
      const sorter = new BucketSort4()
      expect(sorter.sortRange([3, 1, 2], 0, 4)).toEqual([1, 2, 3])
    })

    it('should handle empty array', () => {
      const sorter = new BucketSort4()
      expect(sorter.sortRange([], 0, 10)).toEqual([])
    })

    it('should handle range with no spread', () => {
      const sorter = new BucketSort4()
      expect(sorter.sortRange([5, 5, 5], 5, 5)).toEqual([5, 5, 5])
    })
  })

  // ─── ParallelBucketSort ───

  describe('parallelBucketSort', () => {
    it('should sort correctly', async () => {
      const sorter = new BucketSort4()
      const result = await sorter.parallelBucketSort([3, 1, 4, 1, 5, 9, 2, 6])
      expect(result).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
    })

    it('should handle empty array', async () => {
      const sorter = new BucketSort4()
      const result = await sorter.parallelBucketSort([])
      expect(result).toEqual([])
    })

    it('should handle single element', async () => {
      const sorter = new BucketSort4()
      const result = await sorter.parallelBucketSort([7])
      expect(result).toEqual([7])
    })

    it('should handle negative values', async () => {
      const sorter = new BucketSort4()
      const result = await sorter.parallelBucketSort([-3, -1, -2])
      expect(result).toEqual([-3, -2, -1])
    })
  })

  // ─── GetBucketDistribution ───

  describe('getBucketDistribution', () => {
    it('should return distribution for uniform data', () => {
      const sorter = new BucketSort4(10)
      const dist = sorter.getBucketDistribution([1, 2, 3, 4, 5])
      let total = 0
      for (const count of dist.values()) total += count
      expect(total).toBe(5)
    })

    it('should return empty map for empty array', () => {
      const sorter = new BucketSort4()
      expect(sorter.getBucketDistribution([])).toEqual(new Map())
    })
  })

  // ─── StableBucketSort ───

  describe('stableBucketSort', () => {
    it('should sort correctly', () => {
      const sorter = new BucketSort4()
      expect(sorter.stableBucketSort([3, 1, 2])).toEqual([1, 2, 3])
    })

    it('should handle empty array', () => {
      const sorter = new BucketSort4()
      expect(sorter.stableBucketSort([])).toEqual([])
    })

    it('should handle duplicates', () => {
      const sorter = new BucketSort4()
      expect(sorter.stableBucketSort([3, 1, 1, 2])).toEqual([1, 1, 2, 3])
    })

    it('should handle all same values', () => {
      const sorter = new BucketSort4()
      expect(sorter.stableBucketSort([5, 5, 5])).toEqual([5, 5, 5])
    })
  })

  // ─── Complexity Methods ───

  describe('complexity methods', () => {
    it('should return time complexity', () => {
      const sorter = new BucketSort4()
      expect(sorter.getTimeComplexity()).toBe('O(n + k)')
    })

    it('should return space complexity', () => {
      const sorter = new BucketSort4()
      expect(sorter.getSpaceComplexity()).toBe('O(n + k)')
    })
  })
})
