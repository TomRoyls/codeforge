import { describe, test, expect } from 'vitest'
import { BogoSort2 } from '../src/core/bogo-sort-2/index.js'

describe('BogoSort2 - sort', () => {
  test('sorts empty array', () => {
    const sorter = new BogoSort2<number>([])
    expect(sorter.sort()).toEqual([])
  })

  test('sorts single element array', () => {
    const sorter = new BogoSort2([1])
    expect(sorter.sort()).toEqual([1])
  })

  test('sorts two element array', () => {
    const sorter = new BogoSort2([2, 1])
    expect(sorter.sort()).toEqual([1, 2])
  })

  test('sorts three element array', () => {
    const sorter = new BogoSort2([3, 1, 2])
    const result = sorter.sort()
    expect(result).toEqual([1, 2, 3])
  })

  test('sorts already sorted array', () => {
    const sorter = new BogoSort2([1, 2, 3, 4, 5])
    expect(sorter.sort()).toEqual([1, 2, 3, 4, 5])
  })

  test('sorts reverse sorted array', () => {
    const sorter = new BogoSort2([5, 4, 3, 2, 1])
    const result = sorter.sort()
    expect(result).toEqual([1, 2, 3, 4, 5])
  })

  test('sorts array with duplicates', () => {
    const sorter = new BogoSort2([3, 1, 2, 1])
    const result = sorter.sort()
    expect(result).toEqual([1, 1, 2, 3])
  })

  test('sorts array with negative numbers', () => {
    const sorter = new BogoSort2([-3, -1, -4])
    const result = sorter.sort()
    expect(result).toEqual([-4, -3, -1])
  })

  test('sorts array with mixed positive and negative numbers', () => {
    const sorter = new BogoSort2([3, -1, 4])
    const result = sorter.sort()
    expect(result).toEqual([-1, 3, 4])
  })

  test('sorts array with strings', () => {
    const sorter = new BogoSort2(['banana', 'apple', 'cherry'])
    const result = sorter.sort()
    expect(result).toEqual(['apple', 'banana', 'cherry'])
  })

  test('sorts array with custom comparator', () => {
    const sorter = new BogoSort2(
      [{ a: 3 }, { a: 1 }, { a: 2 }],
      1000,
      (x, y) => x.a - y.a
    )
    const result = sorter.sort()
    expect(result.map(x => x.a)).toEqual([1, 2, 3])
  })
})

describe('BogoSort2 - sortDescending', () => {
  test('sorts empty array descending', () => {
    const sorter = new BogoSort2<number>([])
    expect(sorter.sortDescending()).toEqual([])
  })

  test('sorts single element array descending', () => {
    const sorter = new BogoSort2([1])
    expect(sorter.sortDescending()).toEqual([1])
  })

  test('sorts array in descending order', () => {
    const sorter = new BogoSort2([1, 2, 3])
    const result = sorter.sortDescending()
    expect(result).toEqual([3, 2, 1])
  })
})

describe('BogoSort2 - isSorted', () => {
  test('returns true for empty array', () => {
    const sorter = new BogoSort2<number>([])
    expect(sorter.isSorted([])).toBe(true)
  })

  test('returns true for single element array', () => {
    const sorter = new BogoSort2([1])
    expect(sorter.isSorted([1])).toBe(true)
  })

  test('returns true for sorted array', () => {
    const sorter = new BogoSort2([1, 2, 3])
    expect(sorter.isSorted([1, 2, 3])).toBe(true)
  })

  test('returns false for unsorted array', () => {
    const sorter = new BogoSort2([3, 1, 2])
    expect(sorter.isSorted([3, 1, 2])).toBe(false)
  })

  test('returns false for reverse sorted array', () => {
    const sorter = new BogoSort2([3, 2, 1])
    expect(sorter.isSorted([3, 2, 1])).toBe(false)
  })
})

describe('BogoSort2 - shuffle', () => {
  test('shuffles array without changing length', () => {
    const sorter = new BogoSort2([1, 2, 3])
    const arr = [1, 2, 3]
    sorter.shuffle(arr)
    expect(arr.length).toBe(3)
  })

  test('shuffles array without changing elements', () => {
    const sorter = new BogoSort2([1, 2, 3])
    const arr = [1, 2, 3]
    sorter.shuffle(arr)
    expect(arr).toContain(1)
    expect(arr).toContain(2)
    expect(arr).toContain(3)
  })
})

describe('BogoSort2 - getShuffleCount', () => {
  test('returns 0 for empty array', () => {
    const sorter = new BogoSort2<number>([])
    sorter.sort()
    expect(sorter.getShuffleCount()).toBe(0)
  })

  test('returns 0 for single element array', () => {
    const sorter = new BogoSort2([1])
    sorter.sort()
    expect(sorter.getShuffleCount()).toBe(0)
  })

  test('returns shuffle count for two elements', () => {
    const sorter = new BogoSort2([2, 1])
    sorter.sort()
    expect(sorter.getShuffleCount()).toBeGreaterThan(0)
  })

  test('returns shuffle count for sorted array', () => {
    const sorter = new BogoSort2([1, 2, 3])
    sorter.sort()
    expect(sorter.getShuffleCount()).toBe(0)
  })
})

describe('BogoSort2 - getMaxIterations', () => {
  test('returns default max iterations', () => {
    const sorter = new BogoSort2([1, 2, 3])
    expect(sorter.getMaxIterations()).toBe(1000)
  })

  test('returns custom max iterations', () => {
    const sorter = new BogoSort2([1, 2, 3], 100)
    expect(sorter.getMaxIterations()).toBe(100)
  })

  test('returns custom max iterations 50', () => {
    const sorter = new BogoSort2([1, 2, 3], 50)
    expect(sorter.getMaxIterations()).toBe(50)
  })
})

describe('BogoSort2 - getTimeComplexity', () => {
  test('returns O(1) for empty array', () => {
    const sorter = new BogoSort2<number>([])
    expect(sorter.getTimeComplexity()).toBe('O(1)')
  })

  test('returns O(1) for single element array', () => {
    const sorter = new BogoSort2([1])
    expect(sorter.getTimeComplexity()).toBe('O(1)')
  })

  test('returns O(n!) for larger arrays', () => {
    const sorter = new BogoSort2([1, 2, 3])
    expect(sorter.getTimeComplexity()).toBe('O(n!)')
  })
})

describe('BogoSort2 - getSpaceComplexity', () => {
  test('returns O(n)', () => {
    const sorter = new BogoSort2([1, 2, 3])
    expect(sorter.getSpaceComplexity()).toBe('O(n)')
  })

  test('returns O(n) for empty array', () => {
    const sorter = new BogoSort2<number>([])
    expect(sorter.getSpaceComplexity()).toBe('O(n)')
  })

  test('returns O(n) for single element array', () => {
    const sorter = new BogoSort2([1])
    expect(sorter.getSpaceComplexity()).toBe('O(n)')
  })
})

describe('BogoSort2 - edge cases', () => {
  test('does not modify original array', () => {
    const input = [3, 1, 2]
    const sorter = new BogoSort2(input)
    sorter.sort()
    expect(input).toEqual([3, 1, 2])
  })

  test('handles array with all same elements', () => {
    const sorter = new BogoSort2([5, 5, 5])
    expect(sorter.sort()).toEqual([5, 5, 5])
  })

  test('sortDescending does not modify original array', () => {
    const input = [1, 2, 3]
    const sorter = new BogoSort2(input)
    sorter.sortDescending()
    expect(input).toEqual([1, 2, 3])
  })

  test('respects max iterations limit', () => {
    const sorter = new BogoSort2([5, 4, 3, 2, 1], 10)
    sorter.sort()
    expect(sorter.getShuffleCount()).toBeLessThanOrEqual(10)
  })
})
