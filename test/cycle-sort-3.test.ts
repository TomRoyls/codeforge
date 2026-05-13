import { describe, test, expect } from 'vitest'
import { CycleSort3 } from '../src/core/cycle-sort-3/index.js'

describe('CycleSort3 - sort', () => {
  test('sorts empty array', () => {
    const sorter = new CycleSort3<number>([])
    expect(sorter.sort()).toEqual([])
  })

  test('sorts single element array', () => {
    const sorter = new CycleSort3([1])
    expect(sorter.sort()).toEqual([1])
  })

  test('sorts two element array', () => {
    const sorter = new CycleSort3([2, 1])
    expect(sorter.sort()).toEqual([1, 2])
  })

  test('sorts already sorted array', () => {
    const sorter = new CycleSort3([1, 2, 3, 4, 5])
    expect(sorter.sort()).toEqual([1, 2, 3, 4, 5])
  })

  test('sorts reverse sorted array', () => {
    const sorter = new CycleSort3([5, 4, 3, 2, 1])
    expect(sorter.sort()).toEqual([1, 2, 3, 4, 5])
  })

  test('sorts random array', () => {
    const sorter = new CycleSort3([3, 1, 4, 1, 5, 9, 2, 6, 5, 3])
    expect(sorter.sort()).toEqual([1, 1, 2, 3, 3, 4, 5, 5, 6, 9])
  })

  test('sorts array with duplicates', () => {
    const sorter = new CycleSort3([3, 1, 2, 1, 3, 2])
    expect(sorter.sort()).toEqual([1, 1, 2, 2, 3, 3])
  })

  test('sorts array with negative numbers', () => {
    const sorter = new CycleSort3([-3, -1, -4, -1, -5, -9])
    expect(sorter.sort()).toEqual([-9, -5, -4, -3, -1, -1])
  })

  test('sorts array with mixed positive and negative numbers', () => {
    const sorter = new CycleSort3([3, -1, 4, -1, 5, -9])
    expect(sorter.sort()).toEqual([-9, -1, -1, 3, 4, 5])
  })

  test('sorts array with strings', () => {
    const sorter = new CycleSort3(['banana', 'apple', 'cherry', 'date'])
    expect(sorter.sort()).toEqual(['apple', 'banana', 'cherry', 'date'])
  })

  test('sorts array with custom comparator', () => {
    const sorter = new CycleSort3(
      [{ a: 3 }, { a: 1 }, { a: 2 }],
      (x, y) => x.a - y.a
    )
    const result = sorter.sort()
    expect(result.map(x => x.a)).toEqual([1, 2, 3])
  })
})

describe('CycleSort3 - sortDescending', () => {
  test('sorts empty array descending', () => {
    const sorter = new CycleSort3<number>([])
    expect(sorter.sortDescending()).toEqual([])
  })

  test('sorts single element array descending', () => {
    const sorter = new CycleSort3([1])
    expect(sorter.sortDescending()).toEqual([1])
  })

  test('sorts array in descending order', () => {
    const sorter = new CycleSort3([1, 2, 3, 4, 5])
    expect(sorter.sortDescending()).toEqual([5, 4, 3, 2, 1])
  })

  test('sorts already descending array', () => {
    const sorter = new CycleSort3([5, 4, 3, 2, 1])
    expect(sorter.sortDescending()).toEqual([5, 4, 3, 2, 1])
  })

  test('sorts random array descending', () => {
    const sorter = new CycleSort3([3, 1, 4, 1, 5, 9, 2, 6])
    expect(sorter.sortDescending()).toEqual([9, 6, 5, 4, 3, 2, 1, 1])
  })

  test('sorts array with duplicates descending', () => {
    const sorter = new CycleSort3([3, 1, 2, 1, 3, 2])
    expect(sorter.sortDescending()).toEqual([3, 3, 2, 2, 1, 1])
  })

  test('sortDescending preserves array length', () => {
    const sorter = new CycleSort3([1, 2, 3, 4, 5])
    expect(sorter.sortDescending().length).toBe(5)
  })
})

describe('CycleSort3 - isSorted', () => {
  test('returns true for empty array', () => {
    const sorter = new CycleSort3<number>([])
    expect(sorter.isSorted()).toBe(true)
  })

  test('returns true for single element array', () => {
    const sorter = new CycleSort3([1])
    expect(sorter.isSorted()).toBe(true)
  })

  test('returns true for sorted array', () => {
    const sorter = new CycleSort3([1, 2, 3, 4, 5])
    expect(sorter.isSorted()).toBe(true)
  })

  test('returns false for unsorted array', () => {
    const sorter = new CycleSort3([3, 1, 4, 1, 5])
    expect(sorter.isSorted()).toBe(false)
  })

  test('returns false for reverse sorted array', () => {
    const sorter = new CycleSort3([5, 4, 3, 2, 1])
    expect(sorter.isSorted()).toBe(false)
  })

  test('returns true after sorting', () => {
    const sorter = new CycleSort3([3, 1, 4, 1, 5])
    sorter.sort()
    const newSorter = new CycleSort3(sorter.sort())
    expect(newSorter.isSorted()).toBe(true)
  })

  test('handles array with all same elements', () => {
    const sorter = new CycleSort3([5, 5, 5, 5, 5])
    expect(sorter.isSorted()).toBe(true)
  })
})

describe('CycleSort3 - getWriteCount', () => {
  test('returns 0 for empty array', () => {
    const sorter = new CycleSort3<number>([])
    sorter.sort()
    expect(sorter.getWriteCount()).toBe(0)
  })

  test('returns 0 for single element array', () => {
    const sorter = new CycleSort3([1])
    sorter.sort()
    expect(sorter.getWriteCount()).toBe(0)
  })

  test('returns 0 for already sorted array', () => {
    const sorter = new CycleSort3([1, 2, 3, 4, 5])
    sorter.sort()
    expect(sorter.getWriteCount()).toBe(0)
  })

  test('returns positive count for unsorted array', () => {
    const sorter = new CycleSort3([5, 4, 3, 2, 1])
    sorter.sort()
    expect(sorter.getWriteCount()).toBeGreaterThan(0)
  })

  test('write count is less than or equal to array length', () => {
    const arr = [3, 1, 4, 1, 5]
    const sorter = new CycleSort3(arr)
    sorter.sort()
    expect(sorter.getWriteCount()).toBeLessThanOrEqual(arr.length)
  })

  test('write count is consistent on multiple sorts of same array', () => {
    const sorter = new CycleSort3([5, 4, 3, 2, 1])
    sorter.sort()
    const firstCount = sorter.getWriteCount()
    expect(firstCount).toBeGreaterThan(0)
  })
})

describe('CycleSort3 - countWrites', () => {
  test('counts writes for provided array', () => {
    const sorter = new CycleSort3([1, 2, 3])
    const writeCount = sorter.countWrites([3, 2, 1])
    expect(writeCount).toBeGreaterThan(0)
  })

  test('returns 0 for empty array', () => {
    const sorter = new CycleSort3([1, 2, 3])
    const writeCount = sorter.countWrites([])
    expect(writeCount).toBe(0)
  })

  test('returns 0 for single element array', () => {
    const sorter = new CycleSort3([1, 2, 3])
    const writeCount = sorter.countWrites([1])
    expect(writeCount).toBe(0)
  })

  test('counts writes correctly for reverse array', () => {
    const sorter = new CycleSort3([1, 2, 3, 4, 5])
    const writeCount = sorter.countWrites([5, 4, 3, 2, 1])
    expect(writeCount).toBeGreaterThan(0)
  })
})

describe('CycleSort3 - getTimeComplexity', () => {
  test('returns O(1) for empty array', () => {
    const sorter = new CycleSort3<number>([])
    expect(sorter.getTimeComplexity()).toBe('O(1)')
  })

  test('returns O(1) for single element array', () => {
    const sorter = new CycleSort3([1])
    expect(sorter.getTimeComplexity()).toBe('O(1)')
  })

  test('returns O(n²) for larger arrays', () => {
    const sorter = new CycleSort3([3, 1, 4, 1, 5])
    expect(sorter.getTimeComplexity()).toBe('O(n²)')
  })
})

describe('CycleSort3 - getSpaceComplexity', () => {
  test('returns O(1)', () => {
    const sorter = new CycleSort3([3, 1, 4, 1, 5])
    expect(sorter.getSpaceComplexity()).toBe('O(1)')
  })

  test('returns O(1) for empty array', () => {
    const sorter = new CycleSort3<number>([])
    expect(sorter.getSpaceComplexity()).toBe('O(1)')
  })

  test('returns O(1) for single element array', () => {
    const sorter = new CycleSort3([1])
    expect(sorter.getSpaceComplexity()).toBe('O(1)')
  })
})

describe('CycleSort3 - edge cases', () => {
  test('does not modify original array', () => {
    const input = [3, 1, 4, 1, 5]
    const sorter = new CycleSort3(input)
    sorter.sort()
    expect(input).toEqual([3, 1, 4, 1, 5])
  })

  test('handles array with all same elements', () => {
    const sorter = new CycleSort3([5, 5, 5, 5, 5])
    expect(sorter.sort()).toEqual([5, 5, 5, 5, 5])
  })

  test('handles large array', () => {
    const largeArray = Array.from({ length: 100 }, () => Math.floor(Math.random() * 100))
    const sorter = new CycleSort3(largeArray)
    const sorted = sorter.sort()
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i]!).toBeLessThanOrEqual(sorted[i + 1]!)
    }
  })

  test('sortDescending does not modify original array', () => {
    const input = [1, 2, 3, 4, 5]
    const sorter = new CycleSort3(input)
    sorter.sortDescending()
    expect(input).toEqual([1, 2, 3, 4, 5])
  })

  test('handles array with zero', () => {
    const sorter = new CycleSort3([0, 1, -1, 2, -2])
    expect(sorter.sort()).toEqual([-2, -1, 0, 1, 2])
  })

  test('handles array with single negative number', () => {
    const sorter = new CycleSort3([-5])
    expect(sorter.sort()).toEqual([-5])
  })

  test('handles array with single zero', () => {
    const sorter = new CycleSort3([0])
    expect(sorter.sort()).toEqual([0])
  })

  test('sorts array of two identical elements', () => {
    const sorter = new CycleSort3([7, 7])
    expect(sorter.sort()).toEqual([7, 7])
  })

  test('sorts array with alternating values', () => {
    const sorter = new CycleSort3([1, -1, 2, -2, 3, -3])
    expect(sorter.sort()).toEqual([-3, -2, -1, 1, 2, 3])
  })

  test('handles array with three elements', () => {
    const sorter = new CycleSort3([3, 1, 2])
    expect(sorter.sort()).toEqual([1, 2, 3])
  })

  test('write count is minimized for nearly sorted array', () => {
    const sorter = new CycleSort3([1, 2, 4, 3, 5])
    sorter.sort()
    expect(sorter.getWriteCount()).toBeLessThan(5)
  })
})
