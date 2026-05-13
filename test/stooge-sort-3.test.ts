import { describe, test, expect } from 'vitest'
import { StoogeSort3 } from '../src/core/stooge-sort-3/index.js'

describe('StoogeSort3 - sort', () => {
  test('sorts empty array', () => {
    const sorter = new StoogeSort3<number>([])
    expect(sorter.sort()).toEqual([])
  })

  test('sorts single element array', () => {
    const sorter = new StoogeSort3([1])
    expect(sorter.sort()).toEqual([1])
  })

  test('sorts two element array', () => {
    const sorter = new StoogeSort3([2, 1])
    expect(sorter.sort()).toEqual([1, 2])
  })

  test('sorts three element array', () => {
    const sorter = new StoogeSort3([3, 1, 2])
    expect(sorter.sort()).toEqual([1, 2, 3])
  })

  test('sorts already sorted array', () => {
    const sorter = new StoogeSort3([1, 2, 3, 4, 5])
    expect(sorter.sort()).toEqual([1, 2, 3, 4, 5])
  })

  test('sorts reverse sorted array', () => {
    const sorter = new StoogeSort3([5, 4, 3, 2, 1])
    expect(sorter.sort()).toEqual([1, 2, 3, 4, 5])
  })

  test('sorts random array', () => {
    const sorter = new StoogeSort3([3, 1, 4, 1, 5])
    expect(sorter.sort()).toEqual([1, 1, 3, 4, 5])
  })

  test('sorts array with duplicates', () => {
    const sorter = new StoogeSort3([3, 1, 2, 1, 3, 2])
    expect(sorter.sort()).toEqual([1, 1, 2, 2, 3, 3])
  })

  test('sorts array with negative numbers', () => {
    const sorter = new StoogeSort3([-3, -1, -4, -1, -5])
    expect(sorter.sort()).toEqual([-5, -4, -3, -1, -1])
  })

  test('sorts array with mixed positive and negative numbers', () => {
    const sorter = new StoogeSort3([3, -1, 4, -1, 5, -9])
    expect(sorter.sort()).toEqual([-9, -1, -1, 3, 4, 5])
  })

  test('sorts array with strings', () => {
    const sorter = new StoogeSort3(['banana', 'apple', 'cherry', 'date'])
    expect(sorter.sort()).toEqual(['apple', 'banana', 'cherry', 'date'])
  })

  test('sorts array with custom comparator', () => {
    const sorter = new StoogeSort3(
      [{ a: 3 }, { a: 1 }, { a: 2 }],
      (x, y) => x.a - y.a
    )
    const result = sorter.sort()
    expect(result.map(x => x.a)).toEqual([1, 2, 3])
  })
})

describe('StoogeSort3 - sortDescending', () => {
  test('sorts empty array descending', () => {
    const sorter = new StoogeSort3<number>([])
    expect(sorter.sortDescending()).toEqual([])
  })

  test('sorts single element array descending', () => {
    const sorter = new StoogeSort3([1])
    expect(sorter.sortDescending()).toEqual([1])
  })

  test('sorts array in descending order', () => {
    const sorter = new StoogeSort3([1, 2, 3, 4, 5])
    expect(sorter.sortDescending()).toEqual([5, 4, 3, 2, 1])
  })

  test('sorts already descending array', () => {
    const sorter = new StoogeSort3([5, 4, 3, 2, 1])
    expect(sorter.sortDescending()).toEqual([5, 4, 3, 2, 1])
  })

  test('sorts random array descending', () => {
    const sorter = new StoogeSort3([3, 1, 4, 1, 5])
    expect(sorter.sortDescending()).toEqual([5, 4, 3, 1, 1])
  })
})

describe('StoogeSort3 - isSorted', () => {
  test('returns true for empty array', () => {
    const sorter = new StoogeSort3<number>([])
    expect(sorter.isSorted()).toBe(true)
  })

  test('returns true for single element array', () => {
    const sorter = new StoogeSort3([1])
    expect(sorter.isSorted()).toBe(true)
  })

  test('returns true for sorted array', () => {
    const sorter = new StoogeSort3([1, 2, 3, 4, 5])
    expect(sorter.isSorted()).toBe(true)
  })

  test('returns false for unsorted array', () => {
    const sorter = new StoogeSort3([3, 1, 4, 1, 5])
    expect(sorter.isSorted()).toBe(false)
  })

  test('returns false for reverse sorted array', () => {
    const sorter = new StoogeSort3([5, 4, 3, 2, 1])
    expect(sorter.isSorted()).toBe(false)
  })
})

describe('StoogeSort3 - getComparisonCount', () => {
  test('returns 0 for empty array', () => {
    const sorter = new StoogeSort3<number>([])
    sorter.sort()
    expect(sorter.getComparisonCount()).toBe(0)
  })

  test('returns 0 for single element array', () => {
    const sorter = new StoogeSort3([1])
    sorter.sort()
    expect(sorter.getComparisonCount()).toBe(0)
  })

  test('returns comparison count for two elements', () => {
    const sorter = new StoogeSort3([2, 1])
    sorter.sort()
    expect(sorter.getComparisonCount()).toBeGreaterThan(0)
  })

  test('returns comparison count for sorted array', () => {
    const sorter = new StoogeSort3([1, 2, 3, 4, 5])
    sorter.sort()
    expect(sorter.getComparisonCount()).toBeGreaterThan(0)
  })

  test('returns comparison count for reverse sorted array', () => {
    const sorter = new StoogeSort3([5, 4, 3, 2, 1])
    sorter.sort()
    expect(sorter.getComparisonCount()).toBeGreaterThan(0)
  })
})

describe('StoogeSort3 - getRecursionCount', () => {
  test('returns 0 for empty array', () => {
    const sorter = new StoogeSort3<number>([])
    sorter.sort()
    expect(sorter.getRecursionCount()).toBe(0)
  })

  test('returns 0 for single element array', () => {
    const sorter = new StoogeSort3([1])
    sorter.sort()
    expect(sorter.getRecursionCount()).toBe(0)
  })

  test('returns recursion count for two elements', () => {
    const sorter = new StoogeSort3([2, 1])
    sorter.sort()
    expect(sorter.getRecursionCount()).toBeGreaterThan(0)
  })

  test('returns recursion count for three elements', () => {
    const sorter = new StoogeSort3([3, 2, 1])
    sorter.sort()
    expect(sorter.getRecursionCount()).toBeGreaterThan(0)
  })

  test('returns recursion count for larger array', () => {
    const sorter = new StoogeSort3([5, 4, 3, 2, 1])
    sorter.sort()
    expect(sorter.getRecursionCount()).toBeGreaterThan(0)
  })
})

describe('StoogeSort3 - getTimeComplexity', () => {
  test('returns O(1) for empty array', () => {
    const sorter = new StoogeSort3<number>([])
    expect(sorter.getTimeComplexity()).toBe('O(1)')
  })

  test('returns O(1) for single element array', () => {
    const sorter = new StoogeSort3([1])
    expect(sorter.getTimeComplexity()).toBe('O(1)')
  })

  test('returns O(n^2.7) for larger arrays', () => {
    const sorter = new StoogeSort3([3, 1, 4, 1, 5])
    expect(sorter.getTimeComplexity()).toBe('O(n^2.7)')
  })
})

describe('StoogeSort3 - getSpaceComplexity', () => {
  test('returns O(n)', () => {
    const sorter = new StoogeSort3([3, 1, 4, 1, 5])
    expect(sorter.getSpaceComplexity()).toBe('O(n)')
  })

  test('returns O(n) for empty array', () => {
    const sorter = new StoogeSort3<number>([])
    expect(sorter.getSpaceComplexity()).toBe('O(n)')
  })

  test('returns O(n) for single element array', () => {
    const sorter = new StoogeSort3([1])
    expect(sorter.getSpaceComplexity()).toBe('O(n)')
  })
})

describe('StoogeSort3 - edge cases', () => {
  test('does not modify original array', () => {
    const input = [3, 1, 4, 1, 5]
    const sorter = new StoogeSort3(input)
    sorter.sort()
    expect(input).toEqual([3, 1, 4, 1, 5])
  })

  test('handles array with all same elements', () => {
    const sorter = new StoogeSort3([5, 5, 5, 5, 5])
    expect(sorter.sort()).toEqual([5, 5, 5, 5, 5])
  })

  test('handles array with two elements', () => {
    const sorter = new StoogeSort3([2, 1])
    expect(sorter.sort()).toEqual([1, 2])
  })

  test('handles array with three elements', () => {
    const sorter = new StoogeSort3([3, 1, 2])
    expect(sorter.sort()).toEqual([1, 2, 3])
  })

  test('sortDescending does not modify original array', () => {
    const input = [1, 2, 3, 4, 5]
    const sorter = new StoogeSort3(input)
    sorter.sortDescending()
    expect(input).toEqual([1, 2, 3, 4, 5])
  })
})
