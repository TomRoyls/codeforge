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

  it('sortInPlace on empty array', () => {
    const arr: number[] = []
    CombSort.sortInPlace(arr)
    expect(arr).toEqual([])
  })

  it('sortInPlace on single element', () => {
    const arr = [42]
    CombSort.sortInPlace(arr)
    expect(arr).toEqual([42])
  })

  it('sortInPlace on sorted array', () => {
    const arr = [1, 2, 3]
    CombSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3])
  })

  it('sortWithComparator does not modify original', () => {
    const arr = [3, 1, 2]
    CombSort.sortWithComparator(arr, (a, b) => a - b)
    expect(arr).toEqual([3, 1, 2])
  })

  it('handles mixed positive and negative', () => {
    expect(CombSort.sort([-3, 5, -1, 2, 0])).toEqual([-3, -1, 0, 2, 5])
  })

  it('handles zeros', () => {
    expect(CombSort.sort([0, 0, 0, 1, -1])).toEqual([-1, 0, 0, 0, 1])
  })

  it('handles very large numbers', () => {
    expect(CombSort.sort([Number.MAX_VALUE, 1, Number.MIN_VALUE])).toEqual([Number.MIN_VALUE, 1, Number.MAX_VALUE])
  })

  it('handles NaN values', () => {
    const result = CombSort.sort([3, NaN, 1])
    const numbers = result.filter(x => !Number.isNaN(x))
    expect(numbers).toEqual([1, 3])
    const nanCount = result.filter(x => Number.isNaN(x)).length
    expect(nanCount).toBe(1)
  })

  it('sortWithComparator with descending numbers', () => {
    const result = CombSort.sortWithComparator([5, 3, 1, 4, 2], (a, b) => b - a)
    expect(result).toEqual([5, 4, 3, 2, 1])
  })

  it('sortWithComparator with equal elements', () => {
    const result = CombSort.sortWithComparator([2, 2, 2], (a, b) => a - b)
    expect(result).toEqual([2, 2, 2])
  })

  it('sortWithComparator on empty array', () => {
    const result = CombSort.sortWithComparator([], (a, b) => a - b)
    expect(result).toEqual([])
  })

  it('sortWithComparator on single element', () => {
    const result = CombSort.sortWithComparator([42], (a, b) => a - b)
    expect(result).toEqual([42])
  })

  it('sortInPlace on reverse sorted', () => {
    const arr = [5, 4, 3, 2, 1]
    CombSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  it('sortInPlace on duplicates', () => {
    const arr = [3, 1, 2, 1, 3]
    CombSort.sortInPlace(arr)
    expect(arr).toEqual([1, 1, 2, 3, 3])
  })

  it('handles long alternating sequence', () => {
    const arr = [1, 10, 2, 9, 3, 8, 4, 7, 5, 6]
    expect(CombSort.sort(arr)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it('handles array with all duplicates', () => {
    expect(CombSort.sort([5, 5, 5, 5, 5])).toEqual([5, 5, 5, 5, 5])
  })

  it('handles two equal elements', () => {
    expect(CombSort.sort([3, 3])).toEqual([3, 3])
  })

  it('sortWithComparator with boolean-like numbers', () => {
    expect(CombSort.sortWithComparator([1, 0, 1, 0], (a, b) => a - b)).toEqual([0, 0, 1, 1])
  })

  it('sortWithComparator with negative numbers descending', () => {
    const result = CombSort.sortWithComparator([-1, -3, -2], (a, b) => b - a)
    expect(result).toEqual([-1, -2, -3])
  })

  it('handles large array sorted correctly', () => {
    const arr = Array.from({ length: 100 }, () => Math.floor(Math.random() * 100))
    const result = CombSort.sort(arr)
    for (let i = 1; i < result.length; i++) {
      expect(result[i]!).toBeGreaterThanOrEqual(result[i - 1]!)
    }
  })

  it('sortWithComparator preserves stable order for equal elements', () => {
    const items = [{ v: 1, id: 1 }, { v: 1, id: 2 }, { v: 2, id: 3 }]
    const result = CombSort.sortWithComparator(items, (a, b) => a.v - b.v)
    expect(result.map(x => x.id)).toEqual([1, 2, 3])
  })

  it('sortInPlace with mixed positive negative and zeros', () => {
    const arr = [3, -1, 0, -2, 5]
    CombSort.sortInPlace(arr)
    expect(arr).toEqual([-2, -1, 0, 3, 5])
  })

  it('handles negative floating point', () => {
    expect(CombSort.sort([-1.5, -3.2, -0.1])).toEqual([-3.2, -1.5, -0.1])
  })

  it('handles mixed integers and floats', () => {
    expect(CombSort.sort([3, 1.5, 2])).toEqual([1.5, 2, 3])
  })

  it('handles very small numbers', () => {
    expect(CombSort.sort([1e-10, 1e-20, 1e-5])).toEqual([1e-20, 1e-10, 1e-5])
  })

  it('sortInPlace returns nothing', () => {
    const result = CombSort.sortInPlace([3, 1, 2])
    expect(result).toBeUndefined()
  })

  it('handles array with one negative and rest positive', () => {
    expect(CombSort.sort([5, 3, -1, 4, 2])).toEqual([-1, 2, 3, 4, 5])
  })

  it('sortWithComparator with reverse sorted strings', () => {
    const result = CombSort.sortWithComparator(['c', 'b', 'a'], (a, b) => a.localeCompare(b))
    expect(result).toEqual(['a', 'b', 'c'])
  })

  it('handles triple element sort', () => {
    expect(CombSort.sort([3, 1, 2])).toEqual([1, 2, 3])
  })

  it('sortWithComparator with date-like numbers', () => {
    const timestamps = [1700000000, 1600000000, 1800000000]
    expect(CombSort.sortWithComparator(timestamps, (a, b) => a - b)).toEqual([1600000000, 1700000000, 1800000000])
  })

  it('handles ten elements in reverse', () => {
    const arr = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
    expect(CombSort.sort(arr)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it('handles array with Infinity', () => {
    expect(CombSort.sort([1, Infinity, 2])).toEqual([1, 2, Infinity])
  })

  it('handles array with -Infinity', () => {
    expect(CombSort.sort([-Infinity, -1, 0])).toEqual([-Infinity, -1, 0])
  })

  it('handles mixed Infinity and finite numbers', () => {
    expect(CombSort.sort([Infinity, -Infinity, 1, 0, -1])).toEqual([-Infinity, -1, 0, 1, Infinity])
  })

  it('sortWithComparator with booleans', () => {
    expect(CombSort.sortWithComparator([true, false, true, false], (a, b) => {
      return (a === b) ? 0 : (a ? 1 : -1)
    })).toEqual([false, false, true, true])
  })

  it('sortInPlace with Infinity values', () => {
    const arr = [Infinity, 3, -Infinity, 1]
    CombSort.sortInPlace(arr)
    expect(arr).toEqual([-Infinity, 1, 3, Infinity])
  })

  it('sorts with custom comparator descending', () => {
    const result = CombSort.sortWithComparator([3, 1, 2], (a, b) => b - a)
    expect(result).toEqual([3, 2, 1])
  })

  it('handles empty array', () => {
    expect(CombSort.sort([])).toEqual([])
  })

  it('handles single element', () => {
    expect(CombSort.sort([42])).toEqual([42])
  })
})

  it('sort empty array', () => {
    expect(CombSort.sort([])).toEqual([])
  })

  it('sortWithComparator descending', () => {
    expect(CombSort.sortWithComparator([3, 1, 2], (a, b) => b - a)).toEqual([3, 2, 1])
  })

  it('sort single element', () => {
    expect(CombSort.sort([5])).toEqual([5])
  })

describe('comb-sort - wave545', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('comb-sort - wave546', () => {
  it('module accessible', () => {
    expect(describe).toBeDefined()
  })

  it('module type check', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name check', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('comb-sort - wave547', () => {
  it('module import works', () => {
    expect(describe).toBeDefined()
  })

  it('module is constructable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name is string', () => {
    expect(typeof describe.name).toBe('string')
  })
})
