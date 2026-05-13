import { describe, test, expect } from 'vitest'
import { BingoSort2 } from '../src/core/bingo-sort-2/index.js'

describe('BingoSort2 - sort', () => {
  test('sorts empty array', () => {
    const sorter = new BingoSort2<number>([])
    expect(sorter.sort()).toEqual([])
  })

  test('sorts single element array', () => {
    const sorter = new BingoSort2([1])
    expect(sorter.sort()).toEqual([1])
  })

  test('sorts two element array', () => {
    const sorter = new BingoSort2([2, 1])
    expect(sorter.sort()).toEqual([1, 2])
  })

  test('sorts already sorted array', () => {
    const sorter = new BingoSort2([1, 2, 3, 4, 5])
    expect(sorter.sort()).toEqual([1, 2, 3, 4, 5])
  })

  test('sorts reverse sorted array', () => {
    const sorter = new BingoSort2([5, 4, 3, 2, 1])
    expect(sorter.sort()).toEqual([1, 2, 3, 4, 5])
  })

  test('sorts random array', () => {
    const sorter = new BingoSort2([3, 1, 4, 1, 5, 9, 2, 6, 5, 3])
    expect(sorter.sort()).toEqual([1, 1, 2, 3, 3, 4, 5, 5, 6, 9])
  })

  test('sorts array with duplicates', () => {
    const sorter = new BingoSort2([3, 1, 2, 1, 3, 2])
    expect(sorter.sort()).toEqual([1, 1, 2, 2, 3, 3])
  })

  test('sorts array with negative numbers', () => {
    const sorter = new BingoSort2([-3, -1, -4, -1, -5, -9])
    expect(sorter.sort()).toEqual([-9, -5, -4, -3, -1, -1])
  })

  test('sorts array with mixed positive and negative numbers', () => {
    const sorter = new BingoSort2([3, -1, 4, -1, 5, -9])
    expect(sorter.sort()).toEqual([-9, -1, -1, 3, 4, 5])
  })

  test('sorts array with strings', () => {
    const sorter = new BingoSort2(['banana', 'apple', 'cherry', 'date'])
    expect(sorter.sort()).toEqual(['apple', 'banana', 'cherry', 'date'])
  })

  test('sorts array with all same elements', () => {
    const sorter = new BingoSort2([5, 5, 5, 5, 5])
    expect(sorter.sort()).toEqual([5, 5, 5, 5, 5])
  })

  test('sorts array with custom comparator', () => {
    const sorter = new BingoSort2(
      [{ a: 3 }, { a: 1 }, { a: 2 }],
      (x, y) => x.a - y.a
    )
    const result = sorter.sort()
    expect(result.map(x => x.a)).toEqual([1, 2, 3])
  })
})

describe('BingoSort2 - sortDescending', () => {
  test('sorts empty array descending', () => {
    const sorter = new BingoSort2<number>([])
    expect(sorter.sortDescending()).toEqual([])
  })

  test('sorts single element array descending', () => {
    const sorter = new BingoSort2([1])
    expect(sorter.sortDescending()).toEqual([1])
  })

  test('sorts array in descending order', () => {
    const sorter = new BingoSort2([1, 2, 3, 4, 5])
    expect(sorter.sortDescending()).toEqual([5, 4, 3, 2, 1])
  })

  test('sorts already descending array', () => {
    const sorter = new BingoSort2([5, 4, 3, 2, 1])
    expect(sorter.sortDescending()).toEqual([5, 4, 3, 2, 1])
  })

  test('sorts random array descending', () => {
    const sorter = new BingoSort2([3, 1, 4, 1, 5, 9, 2, 6])
    expect(sorter.sortDescending()).toEqual([9, 6, 5, 4, 3, 2, 1, 1])
  })
})

describe('BingoSort2 - isSorted', () => {
  test('returns true for empty array', () => {
    const sorter = new BingoSort2<number>([])
    expect(sorter.isSorted()).toBe(true)
  })

  test('returns true for single element array', () => {
    const sorter = new BingoSort2([1])
    expect(sorter.isSorted()).toBe(true)
  })

  test('returns true for sorted array', () => {
    const sorter = new BingoSort2([1, 2, 3, 4, 5])
    expect(sorter.isSorted()).toBe(true)
  })

  test('returns false for unsorted array', () => {
    const sorter = new BingoSort2([3, 1, 4, 1, 5])
    expect(sorter.isSorted()).toBe(false)
  })

  test('returns false for reverse sorted array', () => {
    const sorter = new BingoSort2([5, 4, 3, 2, 1])
    expect(sorter.isSorted()).toBe(false)
  })
})

describe('BingoSort2 - getPassCount', () => {
  test('returns 0 for empty array', () => {
    const sorter = new BingoSort2<number>([])
    expect(sorter.getPassCount()).toBe(0)
  })

  test('returns 0 for single element array', () => {
    const sorter = new BingoSort2([1])
    expect(sorter.getPassCount()).toBe(0)
  })

  test('returns correct pass count after sort', () => {
    const sorter = new BingoSort2([3, 1, 4, 1, 5])
    sorter.sort()
    expect(sorter.getPassCount()).toBeGreaterThan(0)
  })

  test('increments pass count with each distinct minimum', () => {
    const sorter = new BingoSort2([2, 1, 2, 1, 3])
    sorter.sort()
    const passCount = sorter.getPassCount()
    expect(passCount).toBe(3)
  })
})

describe('BingoSort2 - getComparisonCount', () => {
  test('returns 0 for empty array', () => {
    const sorter = new BingoSort2<number>([])
    expect(sorter.getComparisonCount()).toBe(0)
  })

  test('returns 0 for single element array', () => {
    const sorter = new BingoSort2([1])
    expect(sorter.getComparisonCount()).toBe(0)
  })

  test('returns correct comparison count after sort', () => {
    const sorter = new BingoSort2([3, 1, 4, 1, 5])
    sorter.sort()
    expect(sorter.getComparisonCount()).toBeGreaterThan(0)
  })

  test('comparison count grows with array size', () => {
    const smallSorter = new BingoSort2([3, 1, 2])
    smallSorter.sort()
    const smallCount = smallSorter.getComparisonCount()

    const largeSorter = new BingoSort2([5, 3, 1, 4, 2, 6, 7, 8])
    largeSorter.sort()
    const largeCount = largeSorter.getComparisonCount()

    expect(largeCount).toBeGreaterThan(smallCount)
  })
})

describe('BingoSort2 - getTimeComplexity', () => {
  test('returns O(1) for empty array', () => {
    const sorter = new BingoSort2<number>([])
    expect(sorter.getTimeComplexity()).toBe('O(1)')
  })

  test('returns O(1) for single element array', () => {
    const sorter = new BingoSort2([1])
    expect(sorter.getTimeComplexity()).toBe('O(1)')
  })

  test('returns O(n²) for larger arrays', () => {
    const sorter = new BingoSort2([3, 1, 4, 1, 5])
    expect(sorter.getTimeComplexity()).toBe('O(n²)')
  })
})

describe('BingoSort2 - getSpaceComplexity', () => {
  test('returns O(n)', () => {
    const sorter = new BingoSort2([3, 1, 4, 1, 5])
    expect(sorter.getSpaceComplexity()).toBe('O(n)')
  })

  test('returns O(n) for empty array', () => {
    const sorter = new BingoSort2<number>([])
    expect(sorter.getSpaceComplexity()).toBe('O(n)')
  })

  test('returns O(n) for single element array', () => {
    const sorter = new BingoSort2([1])
    expect(sorter.getSpaceComplexity()).toBe('O(n)')
  })
})

describe('BingoSort2 - edge cases', () => {
  test('does not modify original array', () => {
    const input = [3, 1, 4, 1, 5]
    const sorter = new BingoSort2(input)
    sorter.sort()
    expect(input).toEqual([3, 1, 4, 1, 5])
  })

  test('handles array with all same elements', () => {
    const sorter = new BingoSort2([5, 5, 5, 5, 5])
    expect(sorter.sort()).toEqual([5, 5, 5, 5, 5])
  })

  test('handles large array', () => {
    const largeArray = Array.from({ length: 100 }, () => Math.floor(Math.random() * 100))
    const sorter = new BingoSort2(largeArray)
    const sorted = sorter.sort()
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i]!).toBeLessThanOrEqual(sorted[i + 1]!)
    }
  })

  test('sortDescending does not modify original array', () => {
    const input = [1, 2, 3, 4, 5]
    const sorter = new BingoSort2(input)
    sorter.sortDescending()
    expect(input).toEqual([1, 2, 3, 4, 5])
  })

  test('handles array with many duplicates efficiently', () => {
    const sorter = new BingoSort2([1, 1, 1, 1, 2, 2, 2, 3, 3])
    const result = sorter.sort()
    expect(result).toEqual([1, 1, 1, 1, 2, 2, 2, 3, 3])
  })

  test('handles array with zeros', () => {
    const sorter = new BingoSort2([0, -1, 1, 0, -0])
    const result = sorter.sort()
    expect(result[0]).toBe(-1)
    expect(result[result.length - 1]).toBe(1)
    expect(result.slice(1, result.length - 1).every(v => v === 0 || Object.is(v, -0))).toBe(true)
  })

  test('handles array with large numbers', () => {
    const sorter = new BingoSort2([1000000, 1, 999999, 0, -1])
    expect(sorter.sort()).toEqual([-1, 0, 1, 999999, 1000000])
  })

  test('handles array with floating point numbers', () => {
    const sorter = new BingoSort2([3.14, 1.41, 2.71, 0.5, 1.73])
    expect(sorter.sort()).toEqual([0.5, 1.41, 1.73, 2.71, 3.14])
  })

  test('handles array with mixed case strings', () => {
    const sorter = new BingoSort2(['Apple', 'banana', 'Cherry', 'date', 'Elderberry'])
    expect(sorter.sort()).toEqual(['Apple', 'Cherry', 'Elderberry', 'banana', 'date'])
  })
})
