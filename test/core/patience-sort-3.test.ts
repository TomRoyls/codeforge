import { describe, it, expect } from 'vitest'
import { PatienceSort3 } from '../../src/core/patience-sort-3/index.js'

// ─── Constructor ───

describe('PatienceSort3 constructor', () => {
  it('creates instance with default comparator', () => {
    const sorter = new PatienceSort3<number>()
    expect(sorter).toBeInstanceOf(PatienceSort3)
  })

  it('creates instance with custom comparator', () => {
    const sorter = new PatienceSort3<string>((a, b) => a.localeCompare(b))
    expect(sorter).toBeInstanceOf(PatienceSort3)
  })

  it('creates instance with reverse comparator', () => {
    const sorter = new PatienceSort3<number>((a, b) => b - a)
    expect(sorter).toBeInstanceOf(PatienceSort3)
  })
})

// ─── sort ───

describe('PatienceSort3.sort', () => {
  it('sorts an empty array', () => {
    const sorter = new PatienceSort3<number>()
    expect(sorter.sort([])).toEqual([])
  })

  it('sorts a single element array', () => {
    const sorter = new PatienceSort3<number>()
    expect(sorter.sort([42])).toEqual([42])
  })

  it('sorts an already sorted array', () => {
    const sorter = new PatienceSort3<number>()
    expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
  })

  it('sorts a reverse sorted array', () => {
    const sorter = new PatienceSort3<number>()
    expect(sorter.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
  })

  it('sorts a shuffled array', () => {
    const sorter = new PatienceSort3<number>()
    const result = sorter.sort([3, 1, 4, 1, 5, 9, 2, 6])
    expect(result).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
  })

  it('sorts with duplicates', () => {
    const sorter = new PatienceSort3<number>()
    expect(sorter.sort([3, 3, 3, 1, 1, 2])).toEqual([1, 1, 2, 3, 3, 3])
  })

  it('sorts with negatives', () => {
    const sorter = new PatienceSort3<number>()
    expect(sorter.sort([-1, 3, -4, 0, 2])).toEqual([-4, -1, 0, 2, 3])
  })

  it('does not mutate the input array', () => {
    const sorter = new PatienceSort3<number>()
    const input = [3, 1, 2]
    const copy = [...input]
    sorter.sort(input)
    expect(input).toEqual(copy)
  })

  it('sorts strings with custom comparator', () => {
    const sorter = new PatienceSort3<string>((a, b) => a.localeCompare(b))
    expect(sorter.sort(['banana', 'apple', 'cherry'])).toEqual(['apple', 'banana', 'cherry'])
  })
})

// ─── sortDescending ───

describe('PatienceSort3.sortDescending', () => {
  it('sorts empty array', () => {
    const sorter = new PatienceSort3<number>()
    expect(sorter.sortDescending([])).toEqual([])
  })

  it('sorts single element', () => {
    const sorter = new PatienceSort3<number>()
    expect(sorter.sortDescending([5])).toEqual([5])
  })

  it('sorts in descending order', () => {
    const sorter = new PatienceSort3<number>()
    expect(sorter.sortDescending([1, 2, 3, 4, 5])).toEqual([5, 4, 3, 2, 1])
  })

  it('sorts with duplicates in descending order', () => {
    const sorter = new PatienceSort3<number>()
    expect(sorter.sortDescending([1, 3, 2, 3, 1])).toEqual([3, 3, 2, 1, 1])
  })

  it('sorts negatives in descending order', () => {
    const sorter = new PatienceSort3<number>()
    expect(sorter.sortDescending([-1, -5, 0, 3])).toEqual([3, 0, -1, -5])
  })

  it('does not mutate the input', () => {
    const sorter = new PatienceSort3<number>()
    const input = [1, 3, 2]
    const copy = [...input]
    sorter.sortDescending(input)
    expect(input).toEqual(copy)
  })
})

// ─── isSorted ───

describe('PatienceSort3.isSorted', () => {
  it('returns true for empty array', () => {
    const sorter = new PatienceSort3<number>()
    expect(sorter.isSorted([])).toBe(true)
  })

  it('returns true for single element', () => {
    const sorter = new PatienceSort3<number>()
    expect(sorter.isSorted([42])).toBe(true)
  })

  it('returns true for sorted array', () => {
    const sorter = new PatienceSort3<number>()
    expect(sorter.isSorted([1, 2, 3, 4, 5])).toBe(true)
  })

  it('returns true for sorted array with duplicates', () => {
    const sorter = new PatienceSort3<number>()
    expect(sorter.isSorted([1, 1, 2, 3, 3])).toBe(true)
  })

  it('returns false for unsorted array', () => {
    const sorter = new PatienceSort3<number>()
    expect(sorter.isSorted([3, 1, 2])).toBe(false)
  })

  it('returns false for reverse sorted array', () => {
    const sorter = new PatienceSort3<number>()
    expect(sorter.isSorted([5, 4, 3, 2, 1])).toBe(false)
  })
})

// ─── getPiles ───

describe('PatienceSort3.getPiles', () => {
  it('returns empty before sorting', () => {
    const sorter = new PatienceSort3<number>()
    expect(sorter.getPiles()).toEqual([])
  })

  it('returns piles after sorting', () => {
    const sorter = new PatienceSort3<number>()
    sorter.sort([3, 1, 4, 1, 5])
    const piles = sorter.getPiles()
    expect(piles.length).toBeGreaterThan(0)
  })

  it('returns defensive copies', () => {
    const sorter = new PatienceSort3<number>()
    sorter.sort([3, 1, 4])
    const piles1 = sorter.getPiles()
    const piles2 = sorter.getPiles()
    piles1[0]!.push(999)
    expect(piles2[0]).not.toContain(999)
  })
})

// ─── getLongestIncreasingSubsequence ───

describe('PatienceSort3.getLongestIncreasingSubsequence', () => {
  it('returns empty for empty input', () => {
    const sorter = new PatienceSort3<number>()
    expect(sorter.getLongestIncreasingSubsequence([])).toEqual([])
  })

  it('returns the element for single element', () => {
    const sorter = new PatienceSort3<number>()
    expect(sorter.getLongestIncreasingSubsequence([42])).toEqual([42])
  })

  it('returns the full array for already sorted input', () => {
    const sorter = new PatienceSort3<number>()
    expect(sorter.getLongestIncreasingSubsequence([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
  })

  it('finds LIS correctly', () => {
    const sorter = new PatienceSort3<number>()
    const lis = sorter.getLongestIncreasingSubsequence([3, 1, 4, 1, 5, 9, 2, 6])
    expect(lis).toEqual([1, 4, 5, 6])
  })

  it('finds LIS with all duplicates', () => {
    const sorter = new PatienceSort3<number>()
    const lis = sorter.getLongestIncreasingSubsequence([2, 2, 2, 2])
    expect(lis).toEqual([2])
  })

  it('finds LIS with negatives', () => {
    const sorter = new PatienceSort3<number>()
    const lis = sorter.getLongestIncreasingSubsequence([-3, -1, -4, -1, 5])
    expect(lis).toEqual([-4, -1, 5])
  })
})

// ─── Complexity ───

describe('PatienceSort3 complexity', () => {
  it('returns correct time complexity', () => {
    const sorter = new PatienceSort3<number>()
    expect(sorter.getTimeComplexity()).toBe('O(n log n)')
  })

  it('returns correct space complexity', () => {
    const sorter = new PatienceSort3<number>()
    expect(sorter.getSpaceComplexity()).toBe('O(n)')
  })
})
