import { describe, test, expect } from 'vitest'
import { PancakeSort3 } from '../src/core/pancake-sort-3/index.js'

describe('PancakeSort3 - sort', () => {
  test('sorts empty array', () => {
    const sorter = new PancakeSort3<number>([])
    expect(sorter.sort()).toEqual([])
  })

  test('sorts single element array', () => {
    const sorter = new PancakeSort3([1])
    expect(sorter.sort()).toEqual([1])
  })

  test('sorts two element array', () => {
    const sorter = new PancakeSort3([2, 1])
    expect(sorter.sort()).toEqual([1, 2])
  })

  test('sorts already sorted array', () => {
    const sorter = new PancakeSort3([1, 2, 3, 4, 5])
    expect(sorter.sort()).toEqual([1, 2, 3, 4, 5])
  })

  test('sorts reverse sorted array', () => {
    const sorter = new PancakeSort3([5, 4, 3, 2, 1])
    expect(sorter.sort()).toEqual([1, 2, 3, 4, 5])
  })

  test('sorts random array', () => {
    const sorter = new PancakeSort3([3, 1, 4, 1, 5, 9, 2, 6, 5, 3])
    expect(sorter.sort()).toEqual([1, 1, 2, 3, 3, 4, 5, 5, 6, 9])
  })

  test('sorts array with duplicates', () => {
    const sorter = new PancakeSort3([3, 1, 2, 1, 3, 2])
    expect(sorter.sort()).toEqual([1, 1, 2, 2, 3, 3])
  })

  test('sorts array with negative numbers', () => {
    const sorter = new PancakeSort3([-3, -1, -4, -1, -5, -9])
    expect(sorter.sort()).toEqual([-9, -5, -4, -3, -1, -1])
  })

  test('sorts array with mixed positive and negative numbers', () => {
    const sorter = new PancakeSort3([3, -1, 4, -1, 5, -9])
    expect(sorter.sort()).toEqual([-9, -1, -1, 3, 4, 5])
  })

  test('sorts array with strings', () => {
    const sorter = new PancakeSort3(['banana', 'apple', 'cherry', 'date'])
    expect(sorter.sort()).toEqual(['apple', 'banana', 'cherry', 'date'])
  })

  test('sorts array with custom comparator', () => {
    const sorter = new PancakeSort3(
      [{ a: 3 }, { a: 1 }, { a: 2 }],
      (x, y) => x.a - y.a
    )
    const result = sorter.sort()
    expect(result.map(x => x.a)).toEqual([1, 2, 3])
  })

  test('sorts three element array', () => {
    const sorter = new PancakeSort3([3, 1, 2])
    expect(sorter.sort()).toEqual([1, 2, 3])
  })

  test('sorts array with all same elements', () => {
    const sorter = new PancakeSort3([5, 5, 5, 5, 5])
    expect(sorter.sort()).toEqual([5, 5, 5, 5, 5])
  })

  test('sorts array with zeros', () => {
    const sorter = new PancakeSort3([0, -1, 0, 1, -0])
    const result = sorter.sort()
    expect(result[0]).toBe(-1)
    expect(result[4]).toBe(1)
    expect(result.slice(1, 4).every(x => x === 0 || x === -0)).toBe(true)
  })
})

describe('PancakeSort3 - sortDescending', () => {
  test('sorts empty array descending', () => {
    const sorter = new PancakeSort3<number>([])
    expect(sorter.sortDescending()).toEqual([])
  })

  test('sorts single element array descending', () => {
    const sorter = new PancakeSort3([1])
    expect(sorter.sortDescending()).toEqual([1])
  })

  test('sorts array in descending order', () => {
    const sorter = new PancakeSort3([1, 2, 3, 4, 5])
    expect(sorter.sortDescending()).toEqual([5, 4, 3, 2, 1])
  })

  test('sorts already descending array', () => {
    const sorter = new PancakeSort3([5, 4, 3, 2, 1])
    expect(sorter.sortDescending()).toEqual([5, 4, 3, 2, 1])
  })

  test('sorts random array descending', () => {
    const sorter = new PancakeSort3([3, 1, 4, 1, 5, 9, 2, 6])
    expect(sorter.sortDescending()).toEqual([9, 6, 5, 4, 3, 2, 1, 1])
  })

  test('sortDescending with negative numbers', () => {
    const sorter = new PancakeSort3([-3, -1, -4, -1, -5, -9])
    expect(sorter.sortDescending()).toEqual([-1, -1, -3, -4, -5, -9])
  })
})

describe('PancakeSort3 - isSorted', () => {
  test('returns true for empty array', () => {
    const sorter = new PancakeSort3<number>([])
    expect(sorter.isSorted()).toBe(true)
  })

  test('returns true for single element array', () => {
    const sorter = new PancakeSort3([1])
    expect(sorter.isSorted()).toBe(true)
  })

  test('returns true for sorted array', () => {
    const sorter = new PancakeSort3([1, 2, 3, 4, 5])
    expect(sorter.isSorted()).toBe(true)
  })

  test('returns false for unsorted array', () => {
    const sorter = new PancakeSort3([3, 1, 4, 1, 5])
    expect(sorter.isSorted()).toBe(false)
  })

  test('returns false for reverse sorted array', () => {
    const sorter = new PancakeSort3([5, 4, 3, 2, 1])
    expect(sorter.isSorted()).toBe(false)
  })

  test('returns true for array with duplicates', () => {
    const sorter = new PancakeSort3([1, 1, 2, 2, 3, 3])
    expect(sorter.isSorted()).toBe(true)
  })
})

describe('PancakeSort3 - flip', () => {
  test('flips first two elements', () => {
    const sorter = new PancakeSort3<number>([])
    const arr = [1, 2, 3, 4, 5]
    sorter.flip(arr, 2)
    expect(arr).toEqual([2, 1, 3, 4, 5])
  })

  test('flips first three elements', () => {
    const sorter = new PancakeSort3<number>([])
    const arr = [1, 2, 3, 4, 5]
    sorter.flip(arr, 3)
    expect(arr).toEqual([3, 2, 1, 4, 5])
  })

  test('flips entire array', () => {
    const sorter = new PancakeSort3<number>([])
    const arr = [1, 2, 3, 4, 5]
    sorter.flip(arr, 5)
    expect(arr).toEqual([5, 4, 3, 2, 1])
  })

  test('flip of one element does nothing', () => {
    const sorter = new PancakeSort3<number>([])
    const arr = [1, 2, 3, 4, 5]
    sorter.flip(arr, 1)
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  test('flips string array', () => {
    const sorter = new PancakeSort3<string[]>([])
    const arr = ['a', 'b', 'c', 'd']
    sorter.flip(arr, 3)
    expect(arr).toEqual(['c', 'b', 'a', 'd'])
  })
})

describe('PancakeSort3 - getFlipCount', () => {
  test('returns zero for empty array after sort', () => {
    const sorter = new PancakeSort3<number>([])
    sorter.sort()
    expect(sorter.getFlipCount()).toBe(0)
  })

  test('returns zero for single element after sort', () => {
    const sorter = new PancakeSort3([1])
    sorter.sort()
    expect(sorter.getFlipCount()).toBe(0)
  })

  test('tracks flips during sort', () => {
    const sorter = new PancakeSort3([3, 2, 1])
    sorter.sort()
    expect(sorter.getFlipCount()).toBeGreaterThan(0)
  })

  test('resets flip count on new sort', () => {
    const sorter = new PancakeSort3([3, 2, 1])
    sorter.sort()
    const count1 = sorter.getFlipCount()
    sorter.sort()
    const count2 = sorter.getFlipCount()
    expect(count2).toBe(count1)
  })

  test('increases flip count on multiple flips', () => {
    const sorter = new PancakeSort3<number>([])
    const arr = [1, 2, 3, 4, 5]
    sorter.flip(arr, 3)
    const count1 = sorter.getFlipCount()
    sorter.flip(arr, 5)
    const count2 = sorter.getFlipCount()
    expect(count2).toBe(count1 + 1)
  })
})

describe('PancakeSort3 - getMinFlips', () => {
  test('returns zero for empty array', () => {
    const sorter = new PancakeSort3<number>([])
    expect(sorter.getMinFlips([])).toBe(0)
  })

  test('returns zero for single element array', () => {
    const sorter = new PancakeSort3([1])
    expect(sorter.getMinFlips([1])).toBe(0)
  })

  test('calculates flips for two element array', () => {
    const sorter = new PancakeSort3<number>([])
    const count = sorter.getMinFlips([2, 1])
    expect(count).toBe(1)
  })

  test('calculates flips for three element array', () => {
    const sorter = new PancakeSort3<number>([])
    const count = sorter.getMinFlips([3, 1, 2])
    expect(count).toBeGreaterThan(0)
  })

  test('calculates flips for already sorted array', () => {
    const sorter = new PancakeSort3<number>([])
    const count = sorter.getMinFlips([1, 2, 3, 4, 5])
    expect(count).toBe(0)
  })

  test('calculates flips for reverse sorted array', () => {
    const sorter = new PancakeSort3<number>([])
    const count = sorter.getMinFlips([5, 4, 3, 2, 1])
    expect(count).toBeGreaterThan(0)
  })

  test('calculates flips for array with duplicates', () => {
    const sorter = new PancakeSort3<number>([])
    const count = sorter.getMinFlips([3, 1, 2, 1, 3])
    expect(count).toBeGreaterThanOrEqual(0)
  })
})

describe('PancakeSort3 - getTimeComplexity', () => {
  test('returns O(1) for empty array', () => {
    const sorter = new PancakeSort3<number>([])
    expect(sorter.getTimeComplexity()).toBe('O(1)')
  })

  test('returns O(1) for single element array', () => {
    const sorter = new PancakeSort3([1])
    expect(sorter.getTimeComplexity()).toBe('O(1)')
  })

  test('returns O(n²) for larger arrays', () => {
    const sorter = new PancakeSort3([3, 1, 4, 1, 5])
    expect(sorter.getTimeComplexity()).toBe('O(n²)')
  })
})

describe('PancakeSort3 - getSpaceComplexity', () => {
  test('returns O(1)', () => {
    const sorter = new PancakeSort3([3, 1, 4, 1, 5])
    expect(sorter.getSpaceComplexity()).toBe('O(1)')
  })

  test('returns O(1) for empty array', () => {
    const sorter = new PancakeSort3<number>([])
    expect(sorter.getSpaceComplexity()).toBe('O(1)')
  })

  test('returns O(1) for single element array', () => {
    const sorter = new PancakeSort3([1])
    expect(sorter.getSpaceComplexity()).toBe('O(1)')
  })
})

describe('PancakeSort3 - edge cases', () => {
  test('does not modify original array', () => {
    const input = [3, 1, 4, 1, 5]
    const sorter = new PancakeSort3(input)
    sorter.sort()
    expect(input).toEqual([3, 1, 4, 1, 5])
  })

  test('handles large array', () => {
    const largeArray = Array.from({ length: 100 }, () => Math.floor(Math.random() * 100))
    const sorter = new PancakeSort3(largeArray)
    const sorted = sorter.sort()
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i]!).toBeLessThanOrEqual(sorted[i + 1]!)
    }
  })

  test('sortDescending does not modify original array', () => {
    const input = [1, 2, 3, 4, 5]
    const sorter = new PancakeSort3(input)
    sorter.sortDescending()
    expect(input).toEqual([1, 2, 3, 4, 5])
  })

  test('handles array with decimal numbers', () => {
    const sorter = new PancakeSort3([3.5, 1.2, 4.8, 1.9, 5.1])
    expect(sorter.sort()).toEqual([1.2, 1.9, 3.5, 4.8, 5.1])
  })

  test('handles mixed integer and decimal numbers', () => {
    const sorter = new PancakeSort3([3, 1.5, 4, 1.2, 5])
    expect(sorter.sort()).toEqual([1.2, 1.5, 3, 4, 5])
  })

  test('flip count is non-negative', () => {
    const sorter = new PancakeSort3([5, 4, 3, 2, 1])
    sorter.sort()
    expect(sorter.getFlipCount()).toBeGreaterThanOrEqual(0)
  })

  test('getMinFlips returns non-negative', () => {
    const sorter = new PancakeSort3<number>([])
    expect(sorter.getMinFlips([5, 4, 3, 2, 1])).toBeGreaterThanOrEqual(0)
  })
})
