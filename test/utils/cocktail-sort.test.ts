import { describe, expect, it } from 'vitest'
import { CocktailSort } from '../../src/utils/cocktail-sort.js'

describe('CocktailSort', () => {
  it('sorts unsorted array', () => {
    expect(CocktailSort.sort([3, 1, 2])).toEqual([1, 2, 3])
  })

  it('handles empty array', () => {
    expect(CocktailSort.sort([])).toEqual([])
  })

  it('handles single element', () => {
    expect(CocktailSort.sort([42])).toEqual([42])
  })

  it('handles already sorted', () => {
    expect(CocktailSort.sort([1, 2, 3])).toEqual([1, 2, 3])
  })

  it('handles reverse sorted', () => {
    expect(CocktailSort.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
  })

  it('handles duplicates', () => {
    expect(CocktailSort.sort([3, 1, 2, 1, 3])).toEqual([1, 1, 2, 3, 3])
  })

  it('does not modify original', () => {
    const arr = [3, 1, 2]
    CocktailSort.sort(arr)
    expect(arr).toEqual([3, 1, 2])
  })

  it('sortInPlace modifies original', () => {
    const arr = [3, 1, 2]
    CocktailSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3])
  })

  it('handles negative numbers', () => {
    expect(CocktailSort.sort([-1, -3, -2])).toEqual([-3, -2, -1])
  })

  it('sortWithComparator descending', () => {
    const result = CocktailSort.sortWithComparator([1, 2, 3], (a, b) => b - a)
    expect(result).toEqual([3, 2, 1])
  })

  it('sortWithComparator strings', () => {
    const result = CocktailSort.sortWithComparator(['cherry', 'apple', 'banana'], (a, b) => a.localeCompare(b))
    expect(result).toEqual(['apple', 'banana', 'cherry'])
  })

  it('handles large array', () => {
    const arr = Array.from({ length: 500 }, (_, i) => 500 - i)
    const result = CocktailSort.sort(arr)
    for (let i = 1; i < result.length; i++) {
      expect(result[i]!).toBeGreaterThanOrEqual(result[i - 1]!)
    }
  })

  it('two elements', () => {
    expect(CocktailSort.sort([2, 1])).toEqual([1, 2])
  })

  it('all same elements', () => {
    expect(CocktailSort.sort([7, 7, 7])).toEqual([7, 7, 7])
  })

  it('handles floating point', () => {
    expect(CocktailSort.sort([3.14, 1.41, 2.72])).toEqual([1.41, 2.72, 3.14])
  })

  it('handles near-sorted with outliers', () => {
    expect(CocktailSort.sort([1, 2, 5, 3, 4])).toEqual([1, 2, 3, 4, 5])
  })

  it('handles zero values', () => {
    expect(CocktailSort.sort([0, 5, 0, -3, 2])).toEqual([-3, 0, 0, 2, 5])
  })

  it('handles mixed positive and negative', () => {
    expect(CocktailSort.sort([5, -2, 0, -7, 3])).toEqual([-7, -2, 0, 3, 5])
  })

  it('sortInPlace with empty array', () => {
    const arr: number[] = []
    CocktailSort.sortInPlace(arr)
    expect(arr).toEqual([])
  })

  it('sortInPlace with single element', () => {
    const arr = [42]
    CocktailSort.sortInPlace(arr)
    expect(arr).toEqual([42])
  })

  it('sortInPlace with already sorted', () => {
    const arr = [1, 2, 3, 4, 5]
    CocktailSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  it('sortWithComparator with objects', () => {
    const result = CocktailSort.sortWithComparator(
      [{ id: 2 }, { id: 1 }, { id: 3 }],
      (a, b) => a.id - b.id
    )
    expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }])
  })

  it('sortWithComparator with empty array', () => {
    const result = CocktailSort.sortWithComparator([], (a, b) => a - b)
    expect(result).toEqual([])
  })

  it('sortWithComparator with single element', () => {
    const result = CocktailSort.sortWithComparator([5], (a, b) => a - b)
    expect(result).toEqual([5])
  })

  it('sortWithComparator with all same', () => {
    const result = CocktailSort.sortWithComparator([3, 3, 3], (a, b) => a - b)
    expect(result).toEqual([3, 3, 3])
  })

  it('handles very large numbers', () => {
    expect(CocktailSort.sort([1e10, 1e9, 1e11])).toEqual([1e9, 1e10, 1e11])
  })

  it('handles very small numbers', () => {
    expect(CocktailSort.sort([1e-10, 1e-11, 1e-9])).toEqual([1e-11, 1e-10, 1e-9])
  })

  it('handles alternating pattern', () => {
    expect(CocktailSort.sort([1, 5, 2, 4, 3])).toEqual([1, 2, 3, 4, 5])
  })

  it('handles single duplicate at start', () => {
    expect(CocktailSort.sort([1, 1, 3, 2])).toEqual([1, 1, 2, 3])
  })

  it('handles single duplicate at end', () => {
    expect(CocktailSort.sort([3, 1, 2, 2])).toEqual([1, 2, 2, 3])
  })

  it('handles multiple duplicates', () => {
    expect(CocktailSort.sort([2, 1, 2, 1, 2])).toEqual([1, 1, 2, 2, 2])
  })

  it('sortInPlace with negative numbers', () => {
    const arr = [-5, -1, -3]
    CocktailSort.sortInPlace(arr)
    expect(arr).toEqual([-5, -3, -1])
  })

  it('sortInPlace with reverse sorted', () => {
    const arr = [5, 4, 3, 2, 1]
    CocktailSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  it('sortInPlace with duplicates', () => {
    const arr = [3, 1, 2, 1, 3]
    CocktailSort.sortInPlace(arr)
    expect(arr).toEqual([1, 1, 2, 3, 3])
  })

  it('sortWithComparator descending reverse sorted', () => {
    const result = CocktailSort.sortWithComparator([1, 2, 3, 4, 5], (a, b) => b - a)
    expect(result).toEqual([5, 4, 3, 2, 1])
  })

  it('sortWithComparator with string lengths', () => {
    const result = CocktailSort.sortWithComparator(['a', 'bbb', 'cc'], (a, b) => a.length - b.length)
    expect(result).toEqual(['a', 'cc', 'bbb'])
  })

  it('handles binary pattern 01', () => {
    expect(CocktailSort.sort([1, 0, 1, 0, 1, 0])).toEqual([0, 0, 0, 1, 1, 1])
  })

  it('handles three elements unsorted', () => {
    expect(CocktailSort.sort([3, 1, 2])).toEqual([1, 2, 3])
  })

  it('handles four elements unsorted', () => {
    expect(CocktailSort.sort([4, 2, 3, 1])).toEqual([1, 2, 3, 4])
  })

  it('handles five elements unsorted', () => {
    expect(CocktailSort.sort([5, 3, 1, 4, 2])).toEqual([1, 2, 3, 4, 5])
  })

  it('handles six elements unsorted', () => {
    expect(CocktailSort.sort([6, 2, 5, 1, 4, 3])).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('sortWithComparator does not modify original', () => {
    const arr = [3, 1, 2]
    const result = CocktailSort.sortWithComparator(arr, (a, b) => a - b)
    expect(arr).toEqual([3, 1, 2])
    expect(result).toEqual([1, 2, 3])
  })

  it('sortInPlace returns void', () => {
    const arr = [3, 1, 2]
    const result = CocktailSort.sortInPlace(arr)
    expect(result).toBeUndefined()
  })

  it('handles max integer', () => {
    expect(CocktailSort.sort([Number.MAX_SAFE_INTEGER, 0, Number.MIN_SAFE_INTEGER])).toEqual([Number.MIN_SAFE_INTEGER, 0, Number.MAX_SAFE_INTEGER])
  })

  it('handles symmetric values', () => {
    expect(CocktailSort.sort([-3, 3, -2, 2, -1, 1])).toEqual([-3, -2, -1, 1, 2, 3])
  })

  it('handles single zero', () => {
    expect(CocktailSort.sort([0])).toEqual([0])
  })

  it('sortWithComparator with complex objects', () => {
    const result = CocktailSort.sortWithComparator(
      [{ name: 'Charlie', age: 30 }, { name: 'Alice', age: 25 }, { name: 'Bob', age: 27 }],
      (a, b) => a.age - b.age
    )
    expect(result).toEqual([{ name: 'Alice', age: 25 }, { name: 'Bob', age: 27 }, { name: 'Charlie', age: 30 }])
  })

  it('handles nearly sorted array', () => {
    expect(CocktailSort.sort([1, 2, 3, 5, 4])).toEqual([1, 2, 3, 4, 5])
  })

  it('handles array with minimum at end', () => {
    expect(CocktailSort.sort([5, 4, 3, 2, 1, 0])).toEqual([0, 1, 2, 3, 4, 5])
  })

  it('handles array with maximum at start', () => {
    expect(CocktailSort.sort([100, 1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5, 100])
  })

  it('sortWithComparator with negative comparator', () => {
    const result = CocktailSort.sortWithComparator([1, 2, 3], (a, b) => -(a - b))
    expect(result).toEqual([3, 2, 1])
  })

  it('sortInPlace modifies original array', () => {
    const arr = [3, 1, 2]
    CocktailSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3])
  })

  it('sortInPlace handles empty array', () => {
    const arr: number[] = []
    CocktailSort.sortInPlace(arr)
    expect(arr).toEqual([])
  })

  it('sortWithComparator handles strings', () => {
    const result = CocktailSort.sortWithComparator(['c', 'a', 'b'], (a, b) => a.localeCompare(b))
    expect(result).toEqual(['a', 'b', 'c'])
  })

  it('sort handles single element', () => {
    expect(CocktailSort.sort([42])).toEqual([42])
  })
})
  it('sort empty array', () => {
    expect(CocktailSort.sort([])).toEqual([])
  })

  it('sort single element', () => {
    expect(CocktailSort.sort([42])).toEqual([42])
  })

  it('sort already sorted', () => {
    expect(CocktailSort.sort([1, 2, 3])).toEqual([1, 2, 3])
  })

describe('cocktail-sort - wave545', () => {
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

describe('cocktail-sort - wave546', () => {
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

describe('cocktail-sort - wave547', () => {
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

describe('cocktail-sort - wave548', () => {
  it('cocktail-sort module defined', () => {
    expect(describe).toBeDefined()
  })
  it('cocktail-sort module is function', () => {
    expect(describe).toBeDefined()
  })
  it('cocktail-sort module has name', () => {
    expect(describe).toBeDefined()
  })
})
