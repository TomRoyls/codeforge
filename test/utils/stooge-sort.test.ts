import { describe, expect, it } from 'vitest'
import { StoogeSort } from '../../src/utils/stooge-sort.js'

describe('StoogeSort', () => {
  it('sorts unsorted array', () => {
    expect(StoogeSort.sort([3, 1, 2])).toEqual([1, 2, 3])
  })

  it('handles empty array', () => {
    expect(StoogeSort.sort([])).toEqual([])
  })

  it('handles single element', () => {
    expect(StoogeSort.sort([42])).toEqual([42])
  })

  it('handles already sorted', () => {
    expect(StoogeSort.sort([1, 2, 3])).toEqual([1, 2, 3])
  })

  it('handles reverse sorted', () => {
    expect(StoogeSort.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
  })

  it('handles duplicates', () => {
    expect(StoogeSort.sort([3, 1, 2, 1, 3])).toEqual([1, 1, 2, 3, 3])
  })

  it('does not modify original', () => {
    const arr = [3, 1, 2]
    StoogeSort.sort(arr)
    expect(arr).toEqual([3, 1, 2])
  })

  it('handles negative numbers', () => {
    expect(StoogeSort.sort([-1, -3, -2])).toEqual([-3, -2, -1])
  })

  it('sortWithComparator descending', () => {
    const result = StoogeSort.sortWithComparator([1, 2, 3], (a, b) => b - a)
    expect(result).toEqual([3, 2, 1])
  })

  it('sortWithComparator objects', () => {
    const items = [{ v: 3 }, { v: 1 }, { v: 2 }]
    const result = StoogeSort.sortWithComparator(items, (a, b) => a.v - b.v)
    expect(result.map(x => x.v)).toEqual([1, 2, 3])
  })

  it('two elements', () => {
    expect(StoogeSort.sort([2, 1])).toEqual([1, 2])
  })

  it('all same elements', () => {
    expect(StoogeSort.sort([7, 7, 7])).toEqual([7, 7, 7])
  })

  it('handles moderate array', () => {
    const arr = Array.from({ length: 40 }, (_, i) => 40 - i)
    const result = StoogeSort.sort(arr)
    for (let i = 1; i < result.length; i++) {
      expect(result[i]!).toBeGreaterThanOrEqual(result[i - 1]!)
    }
  })

  it('handles floating point', () => {
    expect(StoogeSort.sort([3.14, 1.41, 2.72])).toEqual([1.41, 2.72, 3.14])
  })

  it('handles all same elements', () => {
    expect(StoogeSort.sort([5, 5, 5, 5])).toEqual([5, 5, 5, 5])
  })

  it('preserves stability for objects with comparator', () => {
    const items = [{ x: 1, y: 'a' }, { x: 1, y: 'b' }, { x: 2, y: 'c' }]
    const result = StoogeSort.sortWithComparator(items, (a, b) => a.x - b.x)
    expect(result.map(i => i.y)).toEqual(['a', 'b', 'c'])
  })

  it('handles empty array', () => {
    expect(StoogeSort.sort([])).toEqual([])
  })

  it('handles single element', () => {
    expect(StoogeSort.sort([42])).toEqual([42])
  })

  it('handles already sorted', () => {
    expect(StoogeSort.sort([1, 2, 3, 4])).toEqual([1, 2, 3, 4])
  })

  it('handles single element', () => {
    expect(StoogeSort.sort([42])).toEqual([42])
  })

  it('handles reverse sorted', () => {
    expect(StoogeSort.sort([3, 2, 1])).toEqual([1, 2, 3])
  })
})
