import { describe, expect, it } from 'vitest'
import { OddEvenSort } from '../../src/utils/odd-even-sort.js'

describe('OddEvenSort', () => {
  it('sorts unsorted array', () => {
    expect(OddEvenSort.sort([3, 1, 2])).toEqual([1, 2, 3])
  })

  it('handles empty array', () => {
    expect(OddEvenSort.sort([])).toEqual([])
  })

  it('handles single element', () => {
    expect(OddEvenSort.sort([42])).toEqual([42])
  })

  it('handles already sorted', () => {
    expect(OddEvenSort.sort([1, 2, 3])).toEqual([1, 2, 3])
  })

  it('handles reverse sorted', () => {
    expect(OddEvenSort.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
  })

  it('handles duplicates', () => {
    expect(OddEvenSort.sort([3, 1, 2, 1, 3])).toEqual([1, 1, 2, 3, 3])
  })

  it('does not modify original', () => {
    const arr = [3, 1, 2]
    OddEvenSort.sort(arr)
    expect(arr).toEqual([3, 1, 2])
  })

  it('sortInPlace modifies original', () => {
    const arr = [3, 1, 2]
    OddEvenSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3])
  })

  it('handles negative numbers', () => {
    expect(OddEvenSort.sort([-1, -3, -2])).toEqual([-3, -2, -1])
  })

  it('sortWithComparator descending', () => {
    const result = OddEvenSort.sortWithComparator([1, 2, 3], (a, b) => b - a)
    expect(result).toEqual([3, 2, 1])
  })

  it('sortWithComparator strings', () => {
    const result = OddEvenSort.sortWithComparator(['cherry', 'apple', 'banana'], (a, b) => a.localeCompare(b))
    expect(result).toEqual(['apple', 'banana', 'cherry'])
  })

  it('handles large array', () => {
    const arr = Array.from({ length: 500 }, (_, i) => 500 - i)
    const result = OddEvenSort.sort(arr)
    for (let i = 1; i < result.length; i++) {
      expect(result[i]!).toBeGreaterThanOrEqual(result[i - 1]!)
    }
  })

  it('two elements', () => {
    expect(OddEvenSort.sort([2, 1])).toEqual([1, 2])
  })

  it('all same elements', () => {
    expect(OddEvenSort.sort([7, 7, 7])).toEqual([7, 7, 7])
  })

  it('handles floating point', () => {
    expect(OddEvenSort.sort([3.14, 1.41, 2.72])).toEqual([1.41, 2.72, 3.14])
  })

  it('handles empty array', () => {
    expect(OddEvenSort.sort([])).toEqual([])
  })

  it('sorts already sorted', () => {
    expect(OddEvenSort.sort([1, 2, 3, 4])).toEqual([1, 2, 3, 4])
  })

  it('handles empty array', () => {
    expect(OddEvenSort.sort([])).toEqual([])
  })

  it('handles single element', () => {
    expect(OddEvenSort.sort([42])).toEqual([42])
  })

  it('handles already sorted', () => {
    expect(OddEvenSort.sort([1, 2, 3])).toEqual([1, 2, 3])
  })
})
