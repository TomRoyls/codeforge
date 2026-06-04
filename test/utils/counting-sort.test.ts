import { describe, it, expect } from 'vitest'
import { CountingSort } from '../../src/utils/counting-sort.js'

describe('CountingSort', () => {
  it('sorts empty array', () => {
    expect(CountingSort.sort([])).toEqual([])
  })

  it('sorts single element', () => {
    expect(CountingSort.sort([42])).toEqual([42])
  })

  it('sorts already sorted array', () => {
    expect(CountingSort.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
  })

  it('sorts reverse sorted array', () => {
    expect(CountingSort.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
  })

  it('sorts with duplicates', () => {
    expect(CountingSort.sort([3, 1, 2, 1, 3, 2])).toEqual([1, 1, 2, 2, 3, 3])
  })

  it('sorts with all same elements', () => {
    expect(CountingSort.sort([7, 7, 7, 7])).toEqual([7, 7, 7, 7])
  })

  it('handles negative numbers', () => {
    expect(CountingSort.sort([-2, -5, -1, -3])).toEqual([-5, -3, -2, -1])
  })

  it('handles mixed positive and negative', () => {
    expect(CountingSort.sort([3, -1, 0, -2, 2])).toEqual([-2, -1, 0, 2, 3])
  })

  it('sortBy with key function', () => {
    const items = [{ v: 3 }, { v: 1 }, { v: 2 }]
    const sorted = CountingSort.sortBy(items, (item) => item.v)
    expect(sorted.map((i) => i.v)).toEqual([1, 2, 3])
  })

  it('sortInPlace modifies original array', () => {
    const arr = [3, 1, 2]
    const result = CountingSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3])
    expect(result).toBe(arr)
  })

  it('countFrequencies returns correct counts', () => {
    const freq = CountingSort.countFrequencies([1, 2, 2, 3, 3, 3])
    expect(freq.get(1)).toBe(1)
    expect(freq.get(2)).toBe(2)
    expect(freq.get(3)).toBe(3)
    expect(freq.get(4)).toBeUndefined()
  })

  it('countFrequencies handles empty array', () => {
    const freq = CountingSort.countFrequencies([])
    expect(freq.size).toBe(0)
  })

  it('respects min/max options', () => {
    const result = CountingSort.sort([3, 1, 2], { min: 0, max: 5 })
    expect(result).toEqual([1, 2, 3])
  })

  it('does not modify original array', () => {
    const arr = [3, 1, 2]
    CountingSort.sort(arr)
    expect(arr).toEqual([3, 1, 2])
  })

  it('handles large range by falling back to native sort', () => {
    const arr = [1, 1000000, 2]
    expect(CountingSort.sort(arr)).toEqual([1, 2, 1000000])
  })

  it('handles already sorted input', () => {
    expect(CountingSort.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
  })

  it('handles reverse sorted input', () => {
    expect(CountingSort.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
  })

  it('handles single element', () => {
    expect(CountingSort.sort([42])).toEqual([42])
  })

  it('handles duplicates', () => {
    expect(CountingSort.sort([3, 1, 2, 1])).toEqual([1, 1, 2, 3])
  })

  it('handles empty array', () => {
    expect(CountingSort.sort([])).toEqual([])
  })

  it('sorts single element', () => {
    expect(CountingSort.sort([42])).toEqual([42])
  })

  it('sorts already sorted', () => {
    expect(CountingSort.sort([1, 2, 3])).toEqual([1, 2, 3])
  })

  it('handles single element', () => {
    expect(CountingSort.sort([42])).toEqual([42])
  })

  it('handles empty array', () => {
    expect(CountingSort.sort([])).toEqual([])
  })

  it('handles single element', () => {
    expect(CountingSort.sort([5])).toEqual([5])
  })
})
