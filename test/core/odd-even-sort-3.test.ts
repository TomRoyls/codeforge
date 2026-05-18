import { describe, it, expect } from 'vitest'
import { OddEvenSort3 } from '../../src/core/odd-even-sort-3/index.js'

// ─── Constructor ───

describe('OddEvenSort3: constructor', () => {
  it('creates a sorter with zero initial state', () => {
    const sorter = new OddEvenSort3<number>()
    expect(sorter.getSwapCount()).toBe(0)
    expect(sorter.getPassCount()).toBe(0)
  })
})

// ─── sort ───

describe('OddEvenSort3: sort', () => {
  it('sorts an empty array', () => {
    const sorter = new OddEvenSort3<number>()
    expect(sorter.sort([])).toEqual([])
  })

  it('sorts a single-element array', () => {
    const sorter = new OddEvenSort3<number>()
    expect(sorter.sort([42])).toEqual([42])
  })

  it('sorts an already sorted array', () => {
    const sorter = new OddEvenSort3<number>()
    expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
  })

  it('sorts a reverse-sorted array', () => {
    const sorter = new OddEvenSort3<number>()
    expect(sorter.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
  })

  it('sorts a random unsorted array', () => {
    const sorter = new OddEvenSort3<number>()
    expect(sorter.sort([3, 1, 4, 1, 5, 9, 2, 6])).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
  })

  it('handles duplicates', () => {
    const sorter = new OddEvenSort3<number>()
    expect(sorter.sort([3, 3, 3, 1, 1, 2])).toEqual([1, 1, 2, 3, 3, 3])
  })

  it('handles negative numbers', () => {
    const sorter = new OddEvenSort3<number>()
    expect(sorter.sort([-3, -1, -4, -1, -5])).toEqual([-5, -4, -3, -1, -1])
  })

  it('handles a two-element array', () => {
    const sorter = new OddEvenSort3<number>()
    expect(sorter.sort([2, 1])).toEqual([1, 2])
    expect(sorter.sort([1, 2])).toEqual([1, 2])
  })

  it('does not mutate the original array', () => {
    const sorter = new OddEvenSort3<number>()
    const original = [3, 1, 2]
    const sorted = sorter.sort(original)
    expect(sorted).toEqual([1, 2, 3])
    expect(original).toEqual([3, 1, 2])
  })

  it('sorts strings by comparison', () => {
    const sorter = new OddEvenSort3<string>()
    expect(sorter.sort(['banana', 'apple', 'cherry'])).toEqual(['apple', 'banana', 'cherry'])
  })
})

// ─── sortDescending ───

describe('OddEvenSort3: sortDescending', () => {
  it('sorts descending for an empty array', () => {
    const sorter = new OddEvenSort3<number>()
    expect(sorter.sortDescending([])).toEqual([])
  })

  it('sorts descending for a single element', () => {
    const sorter = new OddEvenSort3<number>()
    expect(sorter.sortDescending([42])).toEqual([42])
  })

  it('sorts an array in descending order', () => {
    const sorter = new OddEvenSort3<number>()
    expect(sorter.sortDescending([1, 2, 3, 4, 5])).toEqual([5, 4, 3, 2, 1])
  })

  it('sorts descending with duplicates', () => {
    const sorter = new OddEvenSort3<number>()
    expect(sorter.sortDescending([1, 3, 2, 3, 1])).toEqual([3, 3, 2, 1, 1])
  })

  it('handles negative numbers in descending order', () => {
    const sorter = new OddEvenSort3<number>()
    expect(sorter.sortDescending([-1, -5, -3, -2])).toEqual([-1, -2, -3, -5])
  })

  it('does not mutate the original array', () => {
    const sorter = new OddEvenSort3<number>()
    const original = [1, 3, 2]
    const sorted = sorter.sortDescending(original)
    expect(sorted).toEqual([3, 2, 1])
    expect(original).toEqual([1, 3, 2])
  })
})

// ─── isSorted ───

describe('OddEvenSort3: isSorted', () => {
  it('returns true for empty array', () => {
    const sorter = new OddEvenSort3<number>()
    expect(sorter.isSorted([])).toBe(true)
  })

  it('returns true for single-element array', () => {
    const sorter = new OddEvenSort3<number>()
    expect(sorter.isSorted([1])).toBe(true)
  })

  it('returns true for sorted array', () => {
    const sorter = new OddEvenSort3<number>()
    expect(sorter.isSorted([1, 2, 3, 4])).toBe(true)
  })

  it('returns true for sorted array with duplicates', () => {
    const sorter = new OddEvenSort3<number>()
    expect(sorter.isSorted([1, 1, 2, 3])).toBe(true)
  })

  it('returns false for unsorted array', () => {
    const sorter = new OddEvenSort3<number>()
    expect(sorter.isSorted([3, 1, 2])).toBe(false)
  })
})

// ─── Complexity info ───

describe('OddEvenSort3: complexity info', () => {
  it('returns O(n²) time complexity', () => {
    const sorter = new OddEvenSort3<number>()
    expect(sorter.getTimeComplexity()).toBe('O(n²)')
  })

  it('returns O(1) space complexity', () => {
    const sorter = new OddEvenSort3<number>()
    expect(sorter.getSpaceComplexity()).toBe('O(1)')
  })
})

// ─── Swap and pass counts ───

describe('OddEvenSort3: counts', () => {
  it('reports zero swaps and one pass for sorted input', () => {
    const sorter = new OddEvenSort3<number>()
    sorter.sort([1, 2, 3])
    expect(sorter.getPassCount()).toBe(1)
    expect(sorter.getSwapCount()).toBe(0)
  })

  it('reports non-zero swaps for unsorted input', () => {
    const sorter = new OddEvenSort3<number>()
    sorter.sort([3, 2, 1])
    expect(sorter.getSwapCount()).toBeGreaterThan(0)
    expect(sorter.getPassCount()).toBeGreaterThan(0)
  })

  it('resets counts between sorts', () => {
    const sorter = new OddEvenSort3<number>()
    sorter.sort([3, 2, 1])
    sorter.sort([1, 2, 3])
    expect(sorter.getSwapCount()).toBe(0)
    expect(sorter.getPassCount()).toBe(1)
  })
})
