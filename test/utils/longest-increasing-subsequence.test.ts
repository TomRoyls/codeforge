import { describe, expect, it } from 'vitest'
import { LongestIncreasingSubsequence } from '../../src/utils/longest-increasing-subsequence.js'

describe('LongestIncreasingSubsequence', () => {
  it('returns 0 for empty array', () => {
    expect(LongestIncreasingSubsequence.length([])).toBe(0)
  })

  it('returns 1 for single element', () => {
    expect(LongestIncreasingSubsequence.length([5])).toBe(1)
  })

  it('computes LIS length for classic example', () => {
    expect(LongestIncreasingSubsequence.length([10, 9, 2, 5, 3, 7, 101, 18])).toBe(4)
  })

  it('computes LIS for already sorted', () => {
    expect(LongestIncreasingSubsequence.length([1, 2, 3, 4, 5])).toBe(5)
  })

  it('computes LIS for reverse sorted', () => {
    expect(LongestIncreasingSubsequence.length([5, 4, 3, 2, 1])).toBe(1)
  })

  it('computes LIS for all same elements', () => {
    expect(LongestIncreasingSubsequence.length([3, 3, 3])).toBe(1)
  })

  it('finds actual LIS', () => {
    const lis = LongestIncreasingSubsequence.find([10, 9, 2, 5, 3, 7, 101, 18])
    expect(lis.length).toBe(4)
    for (let i = 1; i < lis.length; i++) {
      expect(lis[i]!).toBeGreaterThan(lis[i - 1]!)
    }
  })

  it('finds LIS for empty array', () => {
    expect(LongestIncreasingSubsequence.find([])).toEqual([])
  })

  it('finds LIS for single element', () => {
    expect(LongestIncreasingSubsequence.find([5])).toEqual([5])
  })

  it('finds LIS for sorted array', () => {
    expect(LongestIncreasingSubsequence.find([1, 2, 3])).toEqual([1, 2, 3])
  })

  it('lengthNonDecreasing allows equal elements', () => {
    expect(LongestIncreasingSubsequence.lengthNonDecreasing([1, 2, 2, 3])).toBe(4)
  })

  it('lengthNonDecreasing for empty', () => {
    expect(LongestIncreasingSubsequence.lengthNonDecreasing([])).toBe(0)
  })

  it('countLIS counts number of LIS', () => {
    expect(LongestIncreasingSubsequence.countLIS([1, 3, 5, 4, 7])).toBe(2)
  })

  it('countLIS for single element', () => {
    expect(LongestIncreasingSubsequence.countLIS([1])).toBe(1)
  })

  it('countLIS for empty', () => {
    expect(LongestIncreasingSubsequence.countLIS([])).toBe(0)
  })

  it('finds LIS with duplicates', () => {
    const lis = LongestIncreasingSubsequence.find([2, 2, 2, 3, 3])
    expect(lis.length).toBe(2)
  })

  it('handles strictly increasing', () => {
    const lis = LongestIncreasingSubsequence.find([1, 2, 3, 4, 5])
    expect(lis.length).toBe(5)
  })

  it('handles empty array', () => {
    expect(LongestIncreasingSubsequence.find([])).toEqual([])
  })

  it('handles single element', () => {
    expect(LongestIncreasingSubsequence.find([42])).toEqual([42])
  })

  it('handles already sorted', () => {
    expect(LongestIncreasingSubsequence.find([1, 2, 3])).toEqual([1, 2, 3])
  })

  it('handles single element', () => {
    expect(LongestIncreasingSubsequence.find([42])).toEqual([42])
  })

  it('handles empty array', () => {
    expect(LongestIncreasingSubsequence.find([])).toEqual([])
  })
})
