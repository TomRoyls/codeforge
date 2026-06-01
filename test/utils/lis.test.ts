import { describe, it, expect } from 'vitest'
import { LongestIncreasingSubsequence } from '../../src/utils/lis.js'

describe('LongestIncreasingSubsequence', () => {
  it('finds LIS length', () => {
    expect(LongestIncreasingSubsequence.length([10, 9, 2, 5, 3, 7, 101, 18])).toBe(4)
  })

  it('finds LIS subsequence', () => {
    const result = LongestIncreasingSubsequence.find([10, 9, 2, 5, 3, 7, 101, 18])
    expect(result.length).toBe(4)
    for (let i = 1; i < result.length; i++) {
      expect(result[i]!).toBeGreaterThan(result[i - 1]!)
    }
  })

  it('handles empty array', () => {
    expect(LongestIncreasingSubsequence.length([])).toBe(0)
    expect(LongestIncreasingSubsequence.find([])).toEqual([])
  })

  it('handles single element', () => {
    expect(LongestIncreasingSubsequence.length([5])).toBe(1)
    expect(LongestIncreasingSubsequence.find([5])).toEqual([5])
  })

  it('handles already sorted array', () => {
    expect(LongestIncreasingSubsequence.length([1, 2, 3, 4, 5])).toBe(5)
  })

  it('handles reverse sorted array', () => {
    expect(LongestIncreasingSubsequence.length([5, 4, 3, 2, 1])).toBe(1)
  })

  it('handles all same elements', () => {
    expect(LongestIncreasingSubsequence.length([3, 3, 3, 3])).toBe(1)
  })

  it('findIndices returns correct positions', () => {
    const indices = LongestIncreasingSubsequence.findIndices([1, 3, 2, 4])
    expect(indices.length).toBe(3)
    expect(indices[0]).toBe(0)
    for (let i = 1; i < indices.length; i++) {
      expect(indices[i]!).toBeGreaterThan(indices[i - 1]!)
    }
  })

  it('countLIS matches length', () => {
    const arr = [0, 8, 4, 12, 2, 10, 6, 14, 1, 9, 5, 13, 3, 11, 7, 15]
    expect(LongestIncreasingSubsequence.countLIS(arr)).toBe(LongestIncreasingSubsequence.length(arr))
  })

  it('handles two elements', () => {
    expect(LongestIncreasingSubsequence.length([1, 2])).toBe(2)
    expect(LongestIncreasingSubsequence.length([2, 1])).toBe(1)
  })

  it('handles negative numbers', () => {
    expect(LongestIncreasingSubsequence.length([-5, -3, -1, 0, 2])).toBe(5)
    expect(LongestIncreasingSubsequence.find([-5, -3, -1, 0, 2])).toEqual([-5, -3, -1, 0, 2])
  })

  it('handles mixed positive and negative', () => {
    const result = LongestIncreasingSubsequence.find([3, -1, 2, 0, 4])
    expect(result.length).toBe(3)
  })

  it('subsequence values are from original array', () => {
    const arr = [5, 2, 8, 6, 3, 6, 9, 7]
    const result = LongestIncreasingSubsequence.find(arr)
    for (const val of result) {
      expect(arr).toContain(val)
    }
  })

  it('handles duplicate values correctly', () => {
    const result = LongestIncreasingSubsequence.find([1, 2, 2, 3])
    expect(result.length).toBe(3)
  })

  it('findIndices returns increasing indices', () => {
    const arr = [10, 20, 10, 30, 20, 50]
    const indices = LongestIncreasingSubsequence.findIndices(arr)
    for (let i = 1; i < indices.length; i++) {
      expect(indices[i]!).toBeGreaterThan(indices[i - 1]!)
    }
  })

  it('handles large array efficiently', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i)
    expect(LongestIncreasingSubsequence.length(arr)).toBe(1000)
  })

  it('countLIS handles empty array', () => {
    expect(LongestIncreasingSubsequence.countLIS([])).toBe(0)
  })

  it('find for single element', () => {
    expect(LongestIncreasingSubsequence.find([42])).toEqual([42])
  })
})
