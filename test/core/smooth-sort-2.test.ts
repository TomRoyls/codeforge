import { describe, it, expect } from 'vitest'
import { SmoothSort2 } from '../../src/core/smooth-sort-2/index.js'

// ─── Constructor ───

describe('SmoothSort2 - Constructor', () => {
  it('should create instance with default comparator', () => {
    const sorter = new SmoothSort2()
    expect(sorter).toBeDefined()
  })

  it('should create instance with custom comparator', () => {
    const sorter = new SmoothSort2((a, b) => b - a)
    expect(sorter).toBeDefined()
  })

  it('should start with zero comparisons', () => {
    const sorter = new SmoothSort2()
    expect(sorter.getComparisons()).toBe(0)
  })

  it('should start with zero swaps', () => {
    const sorter = new SmoothSort2()
    expect(sorter.getSwaps()).toBe(0)
  })
})

// ─── sort ───

describe('SmoothSort2 - sort', () => {
  it('should sort an empty array', () => {
    const sorter = new SmoothSort2()
    expect(sorter.sort([])).toEqual([])
  })

  it('should sort a single element array', () => {
    const sorter = new SmoothSort2()
    expect(sorter.sort([5])).toEqual([5])
  })

  it('should sort an already sorted array', () => {
    const sorter = new SmoothSort2()
    expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
  })

  it('should sort a reverse sorted array', () => {
    const sorter = new SmoothSort2()
    expect(sorter.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
  })

  it('should sort with duplicate values', () => {
    const sorter = new SmoothSort2()
    expect(sorter.sort([3, 1, 2, 1, 3])).toEqual([1, 1, 2, 3, 3])
  })

  it('should sort with negative numbers', () => {
    const sorter = new SmoothSort2()
    expect(sorter.sort([-1, -5, 3, -2, 0])).toEqual([-5, -2, -1, 0, 3])
  })

  it('should not mutate the original array', () => {
    const sorter = new SmoothSort2()
    const original = [3, 1, 2]
    const result = sorter.sort(original)
    expect(result).toEqual([1, 2, 3])
    expect(original).toEqual([3, 1, 2])
  })

  it('should sort two elements', () => {
    const sorter = new SmoothSort2()
    expect(sorter.sort([2, 1])).toEqual([1, 2])
  })

  it('should sort with all identical elements', () => {
    const sorter = new SmoothSort2()
    expect(sorter.sort([4, 4, 4, 4])).toEqual([4, 4, 4, 4])
  })

  it('should sort with large array', () => {
    const sorter = new SmoothSort2()
    const arr = Array.from({ length: 50 }, (_, i) => 50 - i)
    const result = sorter.sort(arr)
    for (let i = 1; i < result.length; i++) {
      expect(result[i]).toBeGreaterThanOrEqual(result[i - 1]!)
    }
  })

  it('should sort with descending comparator', () => {
    const sorter = new SmoothSort2((a, b) => b - a)
    const result = sorter.sort([1, 3, 2, 5, 4])
    expect(result).toEqual([5, 4, 3, 2, 1])
  })

  it('should handle array with zeros', () => {
    const sorter = new SmoothSort2()
    expect(sorter.sort([0, -1, 0, 1, 0])).toEqual([-1, 0, 0, 0, 1])
  })
})

// ─── sortInPlace ───

describe('SmoothSort2 - sortInPlace', () => {
  it('should sort array in place', () => {
    const sorter = new SmoothSort2()
    const arr = [3, 1, 2]
    sorter.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3])
  })

  it('should handle empty array in place', () => {
    const sorter = new SmoothSort2()
    const arr: number[] = []
    sorter.sortInPlace(arr)
    expect(arr).toEqual([])
  })

  it('should handle single element in place', () => {
    const sorter = new SmoothSort2()
    const arr = [42]
    sorter.sortInPlace(arr)
    expect(arr).toEqual([42])
  })

  it('should sort reverse array in place', () => {
    const sorter = new SmoothSort2()
    const arr = [5, 4, 3, 2, 1]
    sorter.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })
})

// ─── isSorted ───

describe('SmoothSort2 - isSorted', () => {
  it('should return true for sorted array', () => {
    const sorter = new SmoothSort2()
    expect(sorter.isSorted([1, 2, 3, 4, 5])).toBe(true)
  })

  it('should return false for unsorted array', () => {
    const sorter = new SmoothSort2()
    expect(sorter.isSorted([3, 1, 2])).toBe(false)
  })

  it('should return true for empty array', () => {
    const sorter = new SmoothSort2()
    expect(sorter.isSorted([])).toBe(true)
  })

  it('should return true for single element array', () => {
    const sorter = new SmoothSort2()
    expect(sorter.isSorted([5])).toBe(true)
  })

  it('should return true for array with duplicates', () => {
    const sorter = new SmoothSort2()
    expect(sorter.isSorted([1, 1, 2, 2, 3])).toBe(true)
  })

  it('should return false for reverse sorted array', () => {
    const sorter = new SmoothSort2()
    expect(sorter.isSorted([5, 4, 3, 2, 1])).toBe(false)
  })
})

// ─── Counters ───

describe('SmoothSort2 - Counters', () => {
  it('should track comparisons during sort', () => {
    const sorter = new SmoothSort2()
    sorter.sort([3, 1, 2])
    expect(sorter.getComparisons()).toBeGreaterThan(0)
  })

  it('should track swaps during sort', () => {
    const sorter = new SmoothSort2()
    sorter.sort([3, 1, 2])
    expect(sorter.getSwaps()).toBeGreaterThan(0)
  })

  it('should have zero comparisons for empty array', () => {
    const sorter = new SmoothSort2()
    sorter.sort([])
    expect(sorter.getComparisons()).toBe(0)
  })

  it('should have zero comparisons for single element', () => {
    const sorter = new SmoothSort2()
    sorter.sort([1])
    expect(sorter.getComparisons()).toBe(0)
  })

  it('should reset counters', () => {
    const sorter = new SmoothSort2()
    sorter.sort([3, 1, 2])
    expect(sorter.getComparisons()).toBeGreaterThan(0)
    sorter.resetCounters()
    expect(sorter.getComparisons()).toBe(0)
    expect(sorter.getSwaps()).toBe(0)
  })

  it('should accumulate comparisons across multiple sorts', () => {
    const sorter = new SmoothSort2()
    sorter.sort([3, 1, 2])
    const first = sorter.getComparisons()
    sorter.sort([5, 4, 3])
    expect(sorter.getComparisons()).toBeGreaterThan(first)
  })

  it('should reset and count fresh after resetCounters', () => {
    const sorter = new SmoothSort2()
    sorter.sort([3, 1, 2])
    sorter.resetCounters()
    sorter.sort([2, 1])
    expect(sorter.getComparisons()).toBeGreaterThan(0)
  })
})
