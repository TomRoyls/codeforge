import { describe, it, expect } from 'vitest'
import { TimSort3 } from '../../src/core/tim-sort-3/index.js'

// ─── Constructor ───

describe('TimSort3 constructor', () => {
  it('creates a sorter with default comparator', () => {
    const sorter = new TimSort3<number>()
    expect(sorter.getTimeComplexity()).toBe('O(n log n)')
    expect(sorter.getSpaceComplexity()).toBe('O(n)')
  })

  it('creates a sorter with custom comparator', () => {
    const sorter = new TimSort3<{ v: number }>((a, b) => a.v - b.v)
    const result = sorter.sort([{ v: 3 }, { v: 1 }, { v: 2 }])
    expect(result.map(x => x.v)).toEqual([1, 2, 3])
  })
})

// ─── sort ───

describe('TimSort3 sort', () => {
  it('sorts an empty array', () => {
    const sorter = new TimSort3<number>()
    expect(sorter.sort([])).toEqual([])
  })

  it('sorts a single-element array', () => {
    const sorter = new TimSort3<number>()
    expect(sorter.sort([42])).toEqual([42])
  })

  it('sorts an already sorted array', () => {
    const sorter = new TimSort3<number>()
    expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
  })

  it('sorts a reverse-sorted array', () => {
    const sorter = new TimSort3<number>()
    expect(sorter.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
  })

  it('sorts a random unsorted array', () => {
    const sorter = new TimSort3<number>()
    expect(sorter.sort([3, 1, 4, 1, 5, 9, 2, 6])).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
  })

  it('sorts arrays with negative numbers', () => {
    const sorter = new TimSort3<number>()
    expect(sorter.sort([-3, -1, -4, -1, -5])).toEqual([-5, -4, -3, -1, -1])
  })

  it('sorts arrays with duplicates', () => {
    const sorter = new TimSort3<number>()
    expect(sorter.sort([2, 2, 1, 1, 3, 3])).toEqual([1, 1, 2, 2, 3, 3])
  })

  it('does not mutate the original array', () => {
    const sorter = new TimSort3<number>()
    const original = [3, 1, 2]
    const copy = [...original]
    sorter.sort(original)
    expect(original).toEqual(copy)
  })

  it('sorts strings lexicographically', () => {
    const sorter = new TimSort3<string>()
    expect(sorter.sort(['banana', 'apple', 'cherry'])).toEqual(['apple', 'banana', 'cherry'])
  })

  it('sorts a two-element array', () => {
    const sorter = new TimSort3<number>()
    expect(sorter.sort([2, 1])).toEqual([1, 2])
  })

  it('handles mixed positive and negative values', () => {
    const sorter = new TimSort3<number>()
    expect(sorter.sort([0, -1, 3, -5, 2])).toEqual([-5, -1, 0, 2, 3])
  })
})

// ─── sortDescending ───

describe('TimSort3 sortDescending', () => {
  it('sorts in descending order', () => {
    const sorter = new TimSort3<number>()
    expect(sorter.sortDescending([3, 1, 4, 1, 5, 9])).toEqual([9, 5, 4, 3, 1, 1])
  })

  it('handles empty array', () => {
    const sorter = new TimSort3<number>()
    expect(sorter.sortDescending([])).toEqual([])
  })

  it('handles single element', () => {
    const sorter = new TimSort3<number>()
    expect(sorter.sortDescending([7])).toEqual([7])
  })

  it('does not mutate the original array', () => {
    const sorter = new TimSort3<number>()
    const original = [1, 2, 3]
    const copy = [...original]
    sorter.sortDescending(original)
    expect(original).toEqual(copy)
  })

  it('sorts negatives in descending order', () => {
    const sorter = new TimSort3<number>()
    expect(sorter.sortDescending([-1, -5, -3])).toEqual([-1, -3, -5])
  })
})

// ─── sortRange ───

describe('TimSort3 sortRange', () => {
  it('sorts only the specified range', () => {
    const sorter = new TimSort3<number>()
    const result = sorter.sortRange([5, 3, 1, 4, 2], 1, 3)
    expect(result).toEqual([5, 1, 3, 4, 2])
  })

  it('handles range covering the whole array', () => {
    const sorter = new TimSort3<number>()
    const result = sorter.sortRange([3, 1, 2], 0, 2)
    expect(result).toEqual([1, 2, 3])
  })

  it('handles empty array', () => {
    const sorter = new TimSort3<number>()
    expect(sorter.sortRange([], 0, 1)).toEqual([])
  })

  it('handles single-element array', () => {
    const sorter = new TimSort3<number>()
    expect(sorter.sortRange([5], 0, 0)).toEqual([5])
  })

  it('does not mutate original array', () => {
    const sorter = new TimSort3<number>()
    const original = [5, 3, 1, 4, 2]
    const copy = [...original]
    sorter.sortRange(original, 1, 3)
    expect(original).toEqual(copy)
  })

  it('clamps out-of-bounds range', () => {
    const sorter = new TimSort3<number>()
    const result = sorter.sortRange([3, 1, 2], -10, 100)
    expect(result).toEqual([1, 2, 3])
  })

  it('returns copy unchanged when start >= end', () => {
    const sorter = new TimSort3<number>()
    const result = sorter.sortRange([3, 1, 2], 2, 1)
    expect(result).toEqual([3, 1, 2])
  })
})

// ─── stableSort ───

describe('TimSort3 stableSort', () => {
  it('preserves order of equal elements', () => {
    const sorter = new TimSort3<{ k: number; v: string }>((a, b) => a.k - b.k)
    const input = [
      { k: 1, v: 'a' },
      { k: 2, v: 'b' },
      { k: 1, v: 'c' },
      { k: 2, v: 'd' },
    ]
    const result = sorter.stableSort(input)
    expect(result.map(x => x.v)).toEqual(['a', 'c', 'b', 'd'])
  })

  it('handles empty array', () => {
    const sorter = new TimSort3<number>()
    expect(sorter.stableSort([])).toEqual([])
  })

  it('handles single element', () => {
    const sorter = new TimSort3<number>()
    expect(sorter.stableSort([1])).toEqual([1])
  })

  it('sorts all-distinct elements correctly', () => {
    const sorter = new TimSort3<number>()
    expect(sorter.stableSort([3, 1, 2])).toEqual([1, 2, 3])
  })

  it('does not mutate the original array', () => {
    const sorter = new TimSort3<number>()
    const original = [3, 1, 2]
    const copy = [...original]
    sorter.stableSort(original)
    expect(original).toEqual(copy)
  })
})

// ─── isSorted ───

describe('TimSort3 isSorted', () => {
  it('returns true for empty array', () => {
    const sorter = new TimSort3<number>()
    expect(sorter.isSorted([])).toBe(true)
  })

  it('returns true for single-element array', () => {
    const sorter = new TimSort3<number>()
    expect(sorter.isSorted([1])).toBe(true)
  })

  it('returns true for sorted array', () => {
    const sorter = new TimSort3<number>()
    expect(sorter.isSorted([1, 2, 3, 4, 5])).toBe(true)
  })

  it('returns true for array with duplicates', () => {
    const sorter = new TimSort3<number>()
    expect(sorter.isSorted([1, 1, 2, 2, 3])).toBe(true)
  })

  it('returns false for unsorted array', () => {
    const sorter = new TimSort3<number>()
    expect(sorter.isSorted([3, 1, 2])).toBe(false)
  })

  it('returns false for reverse-sorted array', () => {
    const sorter = new TimSort3<number>()
    expect(sorter.isSorted([5, 4, 3, 2, 1])).toBe(false)
  })
})

// ─── countRuns ───

describe('TimSort3 countRuns', () => {
  it('returns 0 for empty array', () => {
    const sorter = new TimSort3<number>()
    expect(sorter.countRuns([])).toBe(0)
  })

  it('returns 1 for single-element array', () => {
    const sorter = new TimSort3<number>()
    expect(sorter.countRuns([5])).toBe(1)
  })

  it('returns 1 for fully sorted array', () => {
    const sorter = new TimSort3<number>()
    expect(sorter.countRuns([1, 2, 3, 4, 5])).toBe(1)
  })

  it('returns 1 for reverse-sorted array', () => {
    const sorter = new TimSort3<number>()
    expect(sorter.countRuns([5, 4, 3, 2, 1])).toBe(1)
  })

  it('counts runs in alternating array', () => {
    const sorter = new TimSort3<number>()
    expect(sorter.countRuns([1, 3, 2, 4, 3])).toBe(3)
  })

  it('counts runs correctly for mixed ascending/descending', () => {
    const sorter = new TimSort3<number>()
    expect(sorter.countRuns([1, 2, 3, 1, 2])).toBe(2)
  })
})

// ─── getMinRun ───

describe('TimSort3 getMinRun', () => {
  it('returns appropriate minRun values', () => {
    const sorter = new TimSort3<number>()
    expect(sorter.getMinRun(32)).toBe(32)
    expect(sorter.getMinRun(1)).toBe(1)
    expect(sorter.getMinRun(100)).toBe(50)
    expect(sorter.getMinRun(64)).toBe(32)
    expect(sorter.getMinRun(1000)).toBe(63)
    expect(sorter.getMinRun(63)).toBe(63)
  })
})

// ─── Complexity ───

describe('TimSort3 complexity', () => {
  it('reports O(n log n) time complexity', () => {
    const sorter = new TimSort3<number>()
    expect(sorter.getTimeComplexity()).toBe('O(n log n)')
  })

  it('reports O(n) space complexity', () => {
    const sorter = new TimSort3<number>()
    expect(sorter.getSpaceComplexity()).toBe('O(n)')
  })
})
