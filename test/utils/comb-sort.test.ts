import { describe, expect, it } from 'vitest'
import { CombSort } from '../../src/utils/comb-sort.js'

describe('CombSort', () => {
  it('sorts unsorted array', () => {
    expect(CombSort.sort([3, 1, 2])).toEqual([1, 2, 3])
  })

  it('handles empty array', () => {
    expect(CombSort.sort([])).toEqual([])
  })

  it('handles single element', () => {
    expect(CombSort.sort([42])).toEqual([42])
  })

  it('handles already sorted', () => {
    expect(CombSort.sort([1, 2, 3])).toEqual([1, 2, 3])
  })

  it('handles reverse sorted', () => {
    expect(CombSort.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
  })

  it('handles duplicates', () => {
    expect(CombSort.sort([3, 1, 2, 1, 3])).toEqual([1, 1, 2, 3, 3])
  })

  it('does not modify original', () => {
    const arr = [3, 1, 2]
    CombSort.sort(arr)
    expect(arr).toEqual([3, 1, 2])
  })

  it('sortInPlace modifies original', () => {
    const arr = [3, 1, 2]
    CombSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3])
  })

  it('handles negative numbers', () => {
    expect(CombSort.sort([-1, -3, -2])).toEqual([-3, -2, -1])
  })

  it('sortWithComparator descending', () => {
    const result = CombSort.sortWithComparator([1, 2, 3], (a, b) => b - a)
    expect(result).toEqual([3, 2, 1])
  })

  it('sortWithComparator strings', () => {
    const result = CombSort.sortWithComparator(['cherry', 'apple', 'banana'], (a, b) => a.localeCompare(b))
    expect(result).toEqual(['apple', 'banana', 'cherry'])
  })

  it('handles large array', () => {
    const arr = Array.from({ length: 500 }, (_, i) => 500 - i)
    const result = CombSort.sort(arr)
    for (let i = 1; i < result.length; i++) {
      expect(result[i]!).toBeGreaterThanOrEqual(result[i - 1]!)
    }
  })

  it('two elements', () => {
    expect(CombSort.sort([2, 1])).toEqual([1, 2])
  })

  it('all same elements', () => {
    expect(CombSort.sort([7, 7, 7])).toEqual([7, 7, 7])
  })

  it('sortWithComparator with objects', () => {
    const items = [{ v: 3 }, { v: 1 }, { v: 2 }]
    const result = CombSort.sortWithComparator(items, (a, b) => a.v - b.v)
    expect(result.map(x => x.v)).toEqual([1, 2, 3])
  })

  it('handles floating point', () => {
    expect(CombSort.sort([3.14, 1.41, 2.72])).toEqual([1.41, 2.72, 3.14])
  })

  it('handles single element', () => {
    expect(CombSort.sort([42])).toEqual([42])
  })

  it('handles already sorted', () => {
    expect(CombSort.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
  })

  it('handles single element', () => {
    expect(CombSort.sort([42])).toEqual([42])
  })

  it('handles already sorted', () => {
    expect(CombSort.sort([1, 2, 3])).toEqual([1, 2, 3])
  })

  it('handles reverse sorted', () => {
    expect(CombSort.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
  })

  it('handles already sorted', () => {
    expect(CombSort.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
  })
})
