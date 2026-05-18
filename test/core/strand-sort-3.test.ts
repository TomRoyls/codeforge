import { describe, expect, it } from 'vitest'
import { StrandSort3 } from '../../src/core/strand-sort-3/index.js'

// ─── Constructor ───

describe('StrandSort3 constructor', () => {
  it('creates a sorter with default comparator', () => {
    const sorter = new StrandSort3<number>()
    expect(sorter).toBeInstanceOf(StrandSort3)
  })

  it('creates a sorter with custom comparator', () => {
    const sorter = new StrandSort3<number>((a, b) => b - a)
    const result = sorter.sort([1, 2, 3])
    expect(result).toEqual([3, 2, 1])
  })
})

// ─── sort ───

describe('StrandSort3 sort', () => {
  it('returns empty array for empty input', () => {
    const sorter = new StrandSort3<number>()
    const result = sorter.sort([])
    expect(result).toEqual([])
    expect(result).not.toBe([])
  })

  it('returns copy of single-element array', () => {
    const sorter = new StrandSort3<number>()
    const result = sorter.sort([42])
    expect(result).toEqual([42])
    expect(result).not.toBe([42])
  })

  it('sorts already sorted array', () => {
    const sorter = new StrandSort3<number>()
    const result = sorter.sort([1, 2, 3, 4, 5])
    expect(result).toEqual([1, 2, 3, 4, 5])
  })

  it('sorts reverse-sorted array', () => {
    const sorter = new StrandSort3<number>()
    const result = sorter.sort([5, 4, 3, 2, 1])
    expect(result).toEqual([1, 2, 3, 4, 5])
  })

  it('sorts unsorted array', () => {
    const sorter = new StrandSort3<number>()
    const result = sorter.sort([3, 1, 4, 1, 5, 9, 2, 6])
    expect(result).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
  })

  it('handles duplicates', () => {
    const sorter = new StrandSort3<number>()
    const result = sorter.sort([3, 3, 3, 1, 1, 2])
    expect(result).toEqual([1, 1, 2, 3, 3, 3])
  })

  it('handles negative numbers', () => {
    const sorter = new StrandSort3<number>()
    const result = sorter.sort([-3, 5, -1, 0, 2, -7])
    expect(result).toEqual([-7, -3, -1, 0, 2, 5])
  })

  it('handles two elements', () => {
    const sorter = new StrandSort3<number>()
    expect(sorter.sort([2, 1])).toEqual([1, 2])
    expect(sorter.sort([1, 2])).toEqual([1, 2])
  })

  it('does not mutate the original array', () => {
    const sorter = new StrandSort3<number>()
    const original = [3, 1, 2]
    sorter.sort(original)
    expect(original).toEqual([3, 1, 2])
  })

  it('sorts strings with default comparator', () => {
    const sorter = new StrandSort3<string>()
    const result = sorter.sort(['banana', 'apple', 'cherry'])
    expect(result).toEqual(['apple', 'banana', 'cherry'])
  })
})

// ─── sortDescending ───

describe('StrandSort3 sortDescending', () => {
  it('returns empty array for empty input', () => {
    const sorter = new StrandSort3<number>()
    expect(sorter.sortDescending([])).toEqual([])
  })

  it('returns copy of single-element array', () => {
    const sorter = new StrandSort3<number>()
    expect(sorter.sortDescending([5])).toEqual([5])
  })

  it('sorts in descending order', () => {
    const sorter = new StrandSort3<number>()
    const result = sorter.sortDescending([1, 3, 2, 5, 4])
    expect(result).toEqual([5, 4, 3, 2, 1])
  })

  it('handles duplicates in descending sort', () => {
    const sorter = new StrandSort3<number>()
    const result = sorter.sortDescending([1, 3, 2, 3, 1])
    expect(result).toEqual([3, 3, 2, 1, 1])
  })

  it('handles negative numbers in descending sort', () => {
    const sorter = new StrandSort3<number>()
    const result = sorter.sortDescending([-3, 5, -1, 0])
    expect(result).toEqual([5, 0, -1, -3])
  })
})

// ─── isSorted ───

describe('StrandSort3 isSorted', () => {
  it('returns true for empty array', () => {
    const sorter = new StrandSort3<number>()
    expect(sorter.isSorted([])).toBe(true)
  })

  it('returns true for single-element array', () => {
    const sorter = new StrandSort3<number>()
    expect(sorter.isSorted([1])).toBe(true)
  })

  it('returns true for sorted array', () => {
    const sorter = new StrandSort3<number>()
    expect(sorter.isSorted([1, 2, 3, 4, 5])).toBe(true)
  })

  it('returns true for array with duplicates', () => {
    const sorter = new StrandSort3<number>()
    expect(sorter.isSorted([1, 1, 2, 2, 3])).toBe(true)
  })

  it('returns false for unsorted array', () => {
    const sorter = new StrandSort3<number>()
    expect(sorter.isSorted([3, 1, 2])).toBe(false)
  })
})

// ─── Strand and Merge Counts ───

describe('StrandSort3 strand and merge counts', () => {
  it('reports 0 strands and merges for empty array', () => {
    const sorter = new StrandSort3<number>()
    sorter.sort([])
    expect(sorter.getStrandCount()).toBe(0)
    expect(sorter.getMergeCount()).toBe(0)
  })

  it('reports 1 strand and 0 merges for single element', () => {
    const sorter = new StrandSort3<number>()
    sorter.sort([5])
    expect(sorter.getStrandCount()).toBe(1)
    expect(sorter.getMergeCount()).toBe(0)
  })

  it('reports 1 strand for already sorted input', () => {
    const sorter = new StrandSort3<number>()
    sorter.sort([1, 2, 3, 4, 5])
    expect(sorter.getStrandCount()).toBe(1)
    expect(sorter.getMergeCount()).toBe(0)
  })

  it('reports multiple strands for reverse-sorted input', () => {
    const sorter = new StrandSort3<number>()
    sorter.sort([5, 4, 3, 2, 1])
    expect(sorter.getStrandCount()).toBe(5)
    expect(sorter.getMergeCount()).toBe(4)
  })

  it('counts reset between sort calls', () => {
    const sorter = new StrandSort3<number>()
    sorter.sort([5, 4, 3])
    const firstStrands = sorter.getStrandCount()
    sorter.sort([1, 2, 3])
    expect(sorter.getStrandCount()).not.toBe(firstStrands)
    expect(sorter.getStrandCount()).toBe(1)
  })
})

// ─── Complexity Info ───

describe('StrandSort3 complexity info', () => {
  it('returns time complexity string', () => {
    const sorter = new StrandSort3<number>()
    expect(sorter.getTimeComplexity()).toBe('O(n²) worst, O(n) best')
  })

  it('returns space complexity string', () => {
    const sorter = new StrandSort3<number>()
    expect(sorter.getSpaceComplexity()).toBe('O(n)')
  })
})
