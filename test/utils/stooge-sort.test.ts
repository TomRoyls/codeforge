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

  it('preserves stability for objects with comparator', () => {
    const items = [{ x: 1, y: 'a' }, { x: 1, y: 'b' }, { x: 2, y: 'c' }]
    const result = StoogeSort.sortWithComparator(items, (a, b) => a.x - b.x)
    expect(result.map(i => i.y)).toEqual(['a', 'b', 'c'])
  })

  it('sorts array of size 4', () => {
    expect(StoogeSort.sort([4, 3, 2, 1])).toEqual([1, 2, 3, 4])
  })

  it('sorts array of size 6', () => {
    expect(StoogeSort.sort([6, 5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('sorts array of size 7', () => {
    expect(StoogeSort.sort([7, 6, 5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('sorts array of size 9', () => {
    expect(StoogeSort.sort([9, 8, 7, 6, 5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('sorts array of size 11', () => {
    const arr = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
    expect(StoogeSort.sort(arr)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
  })

  it('handles very small values', () => {
    expect(StoogeSort.sort([0.001, 0.0001, 0.01])).toEqual([0.0001, 0.001, 0.01])
  })

  it('handles very large values', () => {
    expect(StoogeSort.sort([Number.MAX_SAFE_INTEGER, 0, -Number.MAX_SAFE_INTEGER]))
      .toEqual([-Number.MAX_SAFE_INTEGER, 0, Number.MAX_SAFE_INTEGER])
  })

  it('sorts alternating high low', () => {
    expect(StoogeSort.sort([10, 1, 9, 2, 8, 3])).toEqual([1, 2, 3, 8, 9, 10])
  })

  it('sortWithComparator handles empty array', () => {
    expect(StoogeSort.sortWithComparator([], (a, b) => a - b)).toEqual([])
  })

  it('sortWithComparator handles single element', () => {
    expect(StoogeSort.sortWithComparator([5], (a, b) => a - b)).toEqual([5])
  })

  it('sortWithComparator does not mutate original', () => {
    const original = [3, 1, 2]
    StoogeSort.sortWithComparator(original, (a, b) => a - b)
    expect(original).toEqual([3, 1, 2])
  })

  it('sortWithComparator handles duplicates', () => {
    expect(StoogeSort.sortWithComparator([3, 1, 2, 1], (a, b) => a - b)).toEqual([1, 1, 2, 3])
  })

  it('sortWithComparator with string comparison', () => {
    const arr = ['banana', 'apple', 'cherry']
    expect(StoogeSort.sortWithComparator(arr, (a, b) => a.localeCompare(b))).toEqual(['apple', 'banana', 'cherry'])
  })

  it('sortWithComparator sorts strings by length', () => {
    const arr = ['ccc', 'a', 'bb']
    expect(StoogeSort.sortWithComparator(arr, (a, b) => a.length - b.length)).toEqual(['a', 'bb', 'ccc'])
  })

  it('sorts with only negative numbers', () => {
    expect(StoogeSort.sort([-5, -3, -8, -1])).toEqual([-8, -5, -3, -1])
  })

  it('sorts with max and min values', () => {
    const arr = [Number.MAX_VALUE, -Number.MAX_VALUE, 0]
    const sorted = StoogeSort.sort(arr)
    expect(sorted[0]).toBe(-Number.MAX_VALUE)
    expect(sorted[2]).toBe(Number.MAX_VALUE)
  })

  it('sortWithComparator with boolean values', () => {
    const arr = [true, false, true, false]
    expect(StoogeSort.sortWithComparator(arr, (a, b) => Number(a) - Number(b)))
      .toEqual([false, false, true, true])
  })

  it('sortWithComparator sorts by absolute value', () => {
    const arr = [-5, 3, -1, 4]
    expect(StoogeSort.sortWithComparator(arr, (a, b) => Math.abs(a) - Math.abs(b))).toEqual([-1, 3, 4, -5])
  })

  it('sorts with mixed positive and negative', () => {
    expect(StoogeSort.sort([3, -1, 0, -2, 5])).toEqual([-2, -1, 0, 3, 5])
  })

  it('sorts with zeros', () => {
    expect(StoogeSort.sort([0, -1, 0, 1])).toEqual([-1, 0, 0, 1])
  })

  it('two elements already sorted', () => {
    expect(StoogeSort.sort([1, 2])).toEqual([1, 2])
  })

  it('sortWithComparator handles negative numbers', () => {
    expect(StoogeSort.sortWithComparator([-3, -1, -2], (a, b) => a - b)).toEqual([-3, -2, -1])
  })

  it('sortWithComparator handles reverse sorted', () => {
    expect(StoogeSort.sortWithComparator([5, 4, 3, 2, 1], (a, b) => a - b)).toEqual([1, 2, 3, 4, 5])
  })

  it('sortWithComparator handles already sorted', () => {
    expect(StoogeSort.sortWithComparator([1, 2, 3], (a, b) => a - b)).toEqual([1, 2, 3])
  })

  it('sortWithComparator handles all same elements', () => {
    expect(StoogeSort.sortWithComparator([5, 5, 5], (a, b) => a - b)).toEqual([5, 5, 5])
  })

  it('sortWithComparator handles two elements', () => {
    expect(StoogeSort.sortWithComparator([2, 1], (a, b) => a - b)).toEqual([1, 2])
  })

  it('sorts single negative number', () => {
    expect(StoogeSort.sort([-42])).toEqual([-42])
  })

  it('sorts one unique among many', () => {
    expect(StoogeSort.sort([1, 1, 1, 2, 1])).toEqual([1, 1, 1, 1, 2])
  })

  it('sorts with subnormal numbers', () => {
    const arr = [Number.MIN_VALUE, 0, -Number.MIN_VALUE]
    const sorted = StoogeSort.sort(arr)
    expect(sorted[0]).toBe(-Number.MIN_VALUE)
    expect(sorted[1]).toBe(0)
    expect(sorted[2]).toBe(Number.MIN_VALUE)
  })

  it('returns new array reference', () => {
    const arr = [3, 1, 2]
    const sorted = StoogeSort.sort(arr)
    expect(sorted).not.toBe(arr)
  })
})
