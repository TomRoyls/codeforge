import { describe, expect, it } from 'vitest'
import { PancakeSort3 } from '../../src/core/pancake-sort-3/index.js'

// ─── Constructor ───

describe('PancakeSort3 constructor', () => {
  it('creates sorter with default comparator', () => {
    const sorter = new PancakeSort3([3, 1, 2])
    expect(sorter.isSorted()).toBe(false)
  })

  it('creates sorter with custom comparator (descending)', () => {
    const sorter = new PancakeSort3([1, 2, 3], (a, b) => b - a)
    expect(sorter.isSorted()).toBe(false)
  })

  it('does not mutate the input array', () => {
    const input = [3, 1, 2]
    new PancakeSort3(input)
    expect(input).toEqual([3, 1, 2])
  })
})

// ─── Sort ───

describe('PancakeSort3 sort', () => {
  it('sorts an unsorted array', () => {
    const sorter = new PancakeSort3([3, 1, 4, 1, 5, 9, 2, 6])
    expect(sorter.sort()).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
  })

  it('handles already sorted array', () => {
    const sorter = new PancakeSort3([1, 2, 3, 4, 5])
    expect(sorter.sort()).toEqual([1, 2, 3, 4, 5])
  })

  it('handles reverse sorted array', () => {
    const sorter = new PancakeSort3([5, 4, 3, 2, 1])
    expect(sorter.sort()).toEqual([1, 2, 3, 4, 5])
  })

  it('handles single element', () => {
    const sorter = new PancakeSort3([42])
    expect(sorter.sort()).toEqual([42])
  })

  it('handles empty array', () => {
    const sorter = new PancakeSort3([])
    expect(sorter.sort()).toEqual([])
  })

  it('handles duplicates', () => {
    const sorter = new PancakeSort3([3, 3, 3, 1, 1, 2])
    expect(sorter.sort()).toEqual([1, 1, 2, 3, 3, 3])
  })

  it('handles negative values', () => {
    const sorter = new PancakeSort3([3, -1, 4, -5, 2])
    expect(sorter.sort()).toEqual([-5, -1, 2, 3, 4])
  })

  it('handles two elements', () => {
    const sorter = new PancakeSort3([2, 1])
    expect(sorter.sort()).toEqual([1, 2])
  })
})

// ─── SortDescending ───

describe('PancakeSort3 sortDescending', () => {
  it('sorts in descending order', () => {
    const sorter = new PancakeSort3([3, 1, 4, 1, 5])
    expect(sorter.sortDescending()).toEqual([5, 4, 3, 1, 1])
  })

  it('handles empty array', () => {
    const sorter = new PancakeSort3([])
    expect(sorter.sortDescending()).toEqual([])
  })

  it('handles single element', () => {
    const sorter = new PancakeSort3([5])
    expect(sorter.sortDescending()).toEqual([5])
  })
})

// ─── IsSorted ───

describe('PancakeSort3 isSorted', () => {
  it('returns true for sorted array', () => {
    const sorter = new PancakeSort3([1, 2, 3, 4])
    expect(sorter.isSorted()).toBe(true)
  })

  it('returns false for unsorted array', () => {
    const sorter = new PancakeSort3([3, 1, 2])
    expect(sorter.isSorted()).toBe(false)
  })

  it('returns true for empty array', () => {
    const sorter = new PancakeSort3([])
    expect(sorter.isSorted()).toBe(true)
  })

  it('returns true for single element', () => {
    const sorter = new PancakeSort3([5])
    expect(sorter.isSorted()).toBe(true)
  })

  it('returns true for duplicate elements', () => {
    const sorter = new PancakeSort3([1, 1, 2, 2])
    expect(sorter.isSorted()).toBe(true)
  })
})

// ─── Flip ───

describe('PancakeSort3 flip', () => {
  it('reverses first k elements', () => {
    const sorter = new PancakeSort3([1, 2, 3, 4, 5])
    const arr = [1, 2, 3, 4, 5]
    sorter.flip(arr, 3)
    expect(arr).toEqual([3, 2, 1, 4, 5])
  })

  it('flips entire array', () => {
    const sorter = new PancakeSort3([1, 2, 3])
    const arr = [1, 2, 3]
    sorter.flip(arr, 3)
    expect(arr).toEqual([3, 2, 1])
  })

  it('flips single element (no change)', () => {
    const sorter = new PancakeSort3([1, 2, 3])
    const arr = [1, 2, 3]
    sorter.flip(arr, 1)
    expect(arr).toEqual([1, 2, 3])
  })

  it('increments flip count', () => {
    const sorter = new PancakeSort3([1, 2, 3])
    const arr = [1, 2, 3]
    sorter.flip(arr, 2)
    expect(sorter.getFlipCount()).toBe(1)
  })
})

// ─── GetFlipCount ───

describe('PancakeSort3 getFlipCount', () => {
  it('tracks flips during sort', () => {
    const sorter = new PancakeSort3([3, 2, 4, 1])
    sorter.sort()
    expect(sorter.getFlipCount()).toBeGreaterThan(0)
  })

  it('resets flip count on each sort call', () => {
    const sorter = new PancakeSort3([3, 1, 2])
    sorter.sort()
    const count1 = sorter.getFlipCount()
    sorter.sort()
    const count2 = sorter.getFlipCount()
    expect(count2).toBe(count1)
  })

  it('returns zero before sort', () => {
    const sorter = new PancakeSort3([3, 1, 2])
    expect(sorter.getFlipCount()).toBe(0)
  })
})

// ─── GetMinFlips ───

describe('PancakeSort3 getMinFlips', () => {
  it('returns zero for sorted array', () => {
    const sorter = new PancakeSort3([1, 2, 3])
    expect(sorter.getMinFlips([1, 2, 3])).toBe(0)
  })

  it('returns zero for empty array', () => {
    const sorter = new PancakeSort3([])
    expect(sorter.getMinFlips([])).toBe(0)
  })

  it('returns zero for single element', () => {
    const sorter = new PancakeSort3([1])
    expect(sorter.getMinFlips([1])).toBe(0)
  })

  it('counts flips for unsorted array', () => {
    const sorter = new PancakeSort3([3, 1, 2])
    const flips = sorter.getMinFlips([3, 1, 2])
    expect(flips).toBeGreaterThan(0)
  })

  it('does not mutate input array', () => {
    const sorter = new PancakeSort3([3, 1, 2])
    const input = [3, 1, 2]
    sorter.getMinFlips(input)
    expect(input).toEqual([3, 1, 2])
  })
})

// ─── Complexity ───

describe('PancakeSort3 complexity', () => {
  it('returns O(n²) time complexity for multi-element array', () => {
    const sorter = new PancakeSort3([1, 2, 3])
    expect(sorter.getTimeComplexity()).toBe('O(n²)')
  })

  it('returns O(1) time complexity for empty array', () => {
    const sorter = new PancakeSort3([])
    expect(sorter.getTimeComplexity()).toBe('O(1)')
  })

  it('returns O(1) time complexity for single element', () => {
    const sorter = new PancakeSort3([1])
    expect(sorter.getTimeComplexity()).toBe('O(1)')
  })

  it('returns O(1) space complexity', () => {
    const sorter = new PancakeSort3([1, 2, 3])
    expect(sorter.getSpaceComplexity()).toBe('O(1)')
  })
})

// ─── String values ───

describe('PancakeSort3 with strings', () => {
  it('sorts strings', () => {
    const sorter = new PancakeSort3(['banana', 'apple', 'cherry'])
    expect(sorter.sort()).toEqual(['apple', 'banana', 'cherry'])
  })
})
