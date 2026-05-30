import { describe, expect, it } from 'vitest'
import { PancakeSort } from '../../src/utils/pancake-sort.js'

describe('PancakeSort', () => {
  it('sorts unsorted array', () => {
    expect(PancakeSort.sort([3, 1, 2])).toEqual([1, 2, 3])
  })

  it('handles empty array', () => {
    expect(PancakeSort.sort([])).toEqual([])
  })

  it('handles single element', () => {
    expect(PancakeSort.sort([42])).toEqual([42])
  })

  it('handles already sorted', () => {
    expect(PancakeSort.sort([1, 2, 3])).toEqual([1, 2, 3])
  })

  it('handles reverse sorted', () => {
    expect(PancakeSort.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
  })

  it('handles duplicates', () => {
    expect(PancakeSort.sort([3, 1, 2, 1, 3])).toEqual([1, 1, 2, 3, 3])
  })

  it('does not modify original', () => {
    const arr = [3, 1, 2]
    PancakeSort.sort(arr)
    expect(arr).toEqual([3, 1, 2])
  })

  it('sortWithFlips returns flip count', () => {
    const result = PancakeSort.sortWithFlips([3, 1, 2])
    expect(result.sorted).toEqual([1, 2, 3])
    expect(result.flips).toBeGreaterThan(0)
  })

  it('sortWithFlips no flips for sorted', () => {
    const result = PancakeSort.sortWithFlips([1, 2, 3])
    expect(result.flips).toBe(0)
  })

  it('isSorted detects sorted', () => {
    expect(PancakeSort.isSorted([1, 2, 3])).toBe(true)
    expect(PancakeSort.isSorted([3, 1, 2])).toBe(false)
  })

  it('isSorted handles empty and single', () => {
    expect(PancakeSort.isSorted([])).toBe(true)
    expect(PancakeSort.isSorted([1])).toBe(true)
  })

  it('flip reverses first k elements', () => {
    const arr = [1, 2, 3, 4, 5]
    PancakeSort.flip(arr, 3)
    expect(arr).toEqual([3, 2, 1, 4, 5])
  })

  it('handles negative numbers', () => {
    expect(PancakeSort.sort([-1, -3, -2])).toEqual([-3, -2, -1])
  })

  it('minFlips returns flip count', () => {
    expect(PancakeSort.minFlips([3, 1, 2])).toBeGreaterThanOrEqual(0)
  })

  it('handles two elements', () => {
    expect(PancakeSort.sort([2, 1])).toEqual([1, 2])
  })

  it('handles large array', () => {
    const arr = Array.from({ length: 50 }, (_, i) => 50 - i)
    const result = PancakeSort.sort(arr)
    for (let i = 1; i < result.length; i++) {
      expect(result[i]!).toBeGreaterThanOrEqual(result[i - 1]!)
    }
  })
})
