import { describe, expect, it } from 'vitest'
import { bucketSort, bucketSortDescending } from '../../src/utils/bucket-sort.js'

describe('bucketSort', () => {
  it('sorts empty array', () => {
    expect(bucketSort([])).toEqual([])
  })

  it('sorts single element', () => {
    expect(bucketSort([5])).toEqual([5])
  })

  it('sorts already sorted', () => {
    expect(bucketSort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
  })

  it('sorts reverse sorted', () => {
    expect(bucketSort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
  })

  it('sorts with duplicates', () => {
    expect(bucketSort([3, 1, 2, 1, 3])).toEqual([1, 1, 2, 3, 3])
  })

  it('sorts uniform values', () => {
    expect(bucketSort([5, 5, 5])).toEqual([5, 5, 5])
  })

  it('handles negative numbers', () => {
    expect(bucketSort([-3, -1, -2, 0, 2, 1])).toEqual([-3, -2, -1, 0, 1, 2])
  })

  it('handles large range with custom bucket count', () => {
    const arr = [0.1, 0.5, 0.3, 0.9, 0.7]
    expect(bucketSort(arr, 5)).toEqual([0.1, 0.3, 0.5, 0.7, 0.9])
  })

  it('does not mutate original', () => {
    const arr = [3, 1, 2]
    const sorted = bucketSort(arr)
    expect(arr).toEqual([3, 1, 2])
    expect(sorted).toEqual([1, 2, 3])
  })
})

describe('bucketSortDescending', () => {
  it('sorts in descending order', () => {
    expect(bucketSortDescending([1, 3, 2])).toEqual([3, 2, 1])
  })

  it('handles empty', () => {
    expect(bucketSortDescending([])).toEqual([])
  })

  it('handles single element', () => {
    expect(bucketSortDescending([5])).toEqual([5])
  })
})

describe('bucketSort edge cases', () => {
  it('handles two elements', () => {
    expect(bucketSort([2, 1])).toEqual([1, 2])
  })

  it('handles negative only', () => {
    expect(bucketSort([-5, -1, -3])).toEqual([-5, -3, -1])
  })

  it('handles large array', () => {
    const arr = Array.from({ length: 1000 }, () => Math.random() * 100)
    const sorted = bucketSort(arr)
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i]!).toBeGreaterThanOrEqual(sorted[i - 1]!)
    }
  })

  it('handles array with single unique value', () => {
    expect(bucketSort([5, 5, 5, 5])).toEqual([5, 5, 5, 5])
  })

  it('handles two element reverse', () => {
    expect(bucketSort([10, 1])).toEqual([1, 10])
  })

  it('handles already sorted', () => {
    expect(bucketSort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
  })

  it('handles single element', () => {
    expect(bucketSort([42])).toEqual([42])
  })

  it('handles already sorted', () => {
    expect(bucketSort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
  })

  it('handles reverse sorted', () => {
    expect(bucketSort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
  })

  it('handles already sorted', () => {
    expect(bucketSort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
  })
})
