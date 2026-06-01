import { describe, expect, it } from 'vitest'
import { GnomeSort } from '../../src/utils/gnome-sort.js'

describe('GnomeSort', () => {
  it('sorts unsorted array', () => {
    expect(GnomeSort.sort([3, 1, 2])).toEqual([1, 2, 3])
  })

  it('handles empty array', () => {
    expect(GnomeSort.sort([])).toEqual([])
  })

  it('handles single element', () => {
    expect(GnomeSort.sort([42])).toEqual([42])
  })

  it('handles already sorted', () => {
    expect(GnomeSort.sort([1, 2, 3])).toEqual([1, 2, 3])
  })

  it('handles reverse sorted', () => {
    expect(GnomeSort.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
  })

  it('handles duplicates', () => {
    expect(GnomeSort.sort([3, 1, 2, 1, 3])).toEqual([1, 1, 2, 3, 3])
  })

  it('does not modify original', () => {
    const arr = [3, 1, 2]
    GnomeSort.sort(arr)
    expect(arr).toEqual([3, 1, 2])
  })

  it('sortInPlace modifies original', () => {
    const arr = [3, 1, 2]
    GnomeSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3])
  })

  it('handles negative numbers', () => {
    expect(GnomeSort.sort([-1, -3, -2])).toEqual([-3, -2, -1])
  })

  it('sortWithComparator descending', () => {
    const result = GnomeSort.sortWithComparator([1, 2, 3], (a, b) => b - a)
    expect(result).toEqual([3, 2, 1])
  })

  it('sortWithComparator strings', () => {
    const result = GnomeSort.sortWithComparator(['banana', 'apple', 'cherry'], (a, b) => a.localeCompare(b))
    expect(result).toEqual(['apple', 'banana', 'cherry'])
  })

  it('handles two elements', () => {
    expect(GnomeSort.sort([2, 1])).toEqual([1, 2])
  })

  it('handles large array', () => {
    const arr = Array.from({ length: 200 }, (_, i) => 200 - i)
    const result = GnomeSort.sort(arr)
    for (let i = 1; i < result.length; i++) {
      expect(result[i]!).toBeGreaterThanOrEqual(result[i - 1]!)
    }
  })

  it('sortWithComparator with objects', () => {
    const items = [{ v: 3 }, { v: 1 }, { v: 2 }]
    const result = GnomeSort.sortWithComparator(items, (a, b) => a.v - b.v)
    expect(result.map(x => x.v)).toEqual([1, 2, 3])
  })

  it('all same elements', () => {
    expect(GnomeSort.sort([5, 5, 5])).toEqual([5, 5, 5])
  })

  it('handles empty array', () => {
    expect(GnomeSort.sort([])).toEqual([])
  })

  it('sorts already sorted array', () => {
    expect(GnomeSort.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
  })

  it('handles empty array', () => {
    expect(GnomeSort.sort([])).toEqual([])
  })
})
