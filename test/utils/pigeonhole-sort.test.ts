import { describe, expect, it } from 'vitest'
import { PigeonholeSort } from '../../src/utils/pigeonhole-sort.js'

describe('PigeonholeSort', () => {
  it('sorts unsorted array', () => {
    expect(PigeonholeSort.sort([3, 1, 2])).toEqual([1, 2, 3])
  })

  it('handles empty array', () => {
    expect(PigeonholeSort.sort([])).toEqual([])
  })

  it('handles single element', () => {
    expect(PigeonholeSort.sort([42])).toEqual([42])
  })

  it('handles already sorted', () => {
    expect(PigeonholeSort.sort([1, 2, 3])).toEqual([1, 2, 3])
  })

  it('handles reverse sorted', () => {
    expect(PigeonholeSort.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
  })

  it('handles duplicates', () => {
    expect(PigeonholeSort.sort([3, 1, 2, 1, 3])).toEqual([1, 1, 2, 3, 3])
  })

  it('does not modify original', () => {
    const arr = [3, 1, 2]
    PigeonholeSort.sort(arr)
    expect(arr).toEqual([3, 1, 2])
  })

  it('sortInPlace modifies original', () => {
    const arr = [3, 1, 2]
    PigeonholeSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3])
  })

  it('handles negative numbers', () => {
    expect(PigeonholeSort.sort([-1, -3, -2])).toEqual([-3, -2, -1])
  })

  it('handles mixed positive and negative', () => {
    expect(PigeonholeSort.sort([3, -1, 0, -2, 2])).toEqual([-2, -1, 0, 2, 3])
  })

  it('two elements', () => {
    expect(PigeonholeSort.sort([2, 1])).toEqual([1, 2])
  })

  it('all same elements', () => {
    expect(PigeonholeSort.sort([7, 7, 7])).toEqual([7, 7, 7])
  })

  it('handles large array', () => {
    const arr = Array.from({ length: 200 }, (_, i) => (i * 7 + 3) % 200)
    const result = PigeonholeSort.sort(arr)
    for (let i = 1; i < result.length; i++) {
      expect(result[i]!).toBeGreaterThanOrEqual(result[i - 1]!)
    }
  })

  it('is stable', () => {
    expect(PigeonholeSort.isStable()).toBe(true)
  })

  it('handles single distinct value range', () => {
    expect(PigeonholeSort.sort([5, 5, 5])).toEqual([5, 5, 5])
  })

  it('handles large range efficiently', () => {
    const arr = [0, 100, 50, 25, 75]
    expect(PigeonholeSort.sort(arr)).toEqual([0, 25, 50, 75, 100])
  })

  it('handles all same elements', () => {
    expect(PigeonholeSort.sort([5, 5, 5])).toEqual([5, 5, 5])
  })

  it('handles empty array', () => {
    expect(PigeonholeSort.sort([])).toEqual([])
  })

  it('handles single element', () => {
    expect(PigeonholeSort.sort([42])).toEqual([42])
  })

  it('handles already sorted', () => {
    expect(PigeonholeSort.sort([1, 2, 3])).toEqual([1, 2, 3])
  })

  it('handles reverse sorted', () => {
    expect(PigeonholeSort.sort([3, 2, 1])).toEqual([1, 2, 3])
  })

  it('handles single element', () => {
    expect(PigeonholeSort.sort([42])).toEqual([42])
  })

  it('handles empty array', () => {
    expect(PigeonholeSort.sort([])).toEqual([])
  })

  it('handles single element', () => {
    expect(PigeonholeSort.sort([42])).toEqual([42])
  })
})
