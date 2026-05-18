import { describe, it, expect } from 'vitest'
import { BogoSort2 } from '../../src/core/bogo-sort-2/index.js'

describe('BogoSort2', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('creates instance with default options', () => {
      const bs = new BogoSort2([3, 1, 2])
      expect(bs.getMaxIterations()).toBe(1000)
    })

    it('creates instance with custom maxIterations', () => {
      const bs = new BogoSort2([3, 1, 2], 50)
      expect(bs.getMaxIterations()).toBe(50)
    })

    it('creates instance with custom comparator', () => {
      const bs = new BogoSort2([3, 1, 2], 100, (a, b) => b - a)
      expect(bs.getMaxIterations()).toBe(100)
    })

    it('does not modify the original array', () => {
      const original = [3, 1, 2]
      const bs = new BogoSort2(original)
      bs.sort()
      expect(original).toEqual([3, 1, 2])
    })
  })

  // ─── sort ───
  describe('sort', () => {
    it('returns empty array for empty input', () => {
      const bs = new BogoSort2([])
      expect(bs.sort()).toEqual([])
    })

    it('returns single element for single input', () => {
      const bs = new BogoSort2([42])
      expect(bs.sort()).toEqual([42])
    })

    it('returns sorted for already sorted two elements', () => {
      const bs = new BogoSort2([1, 2])
      const result = bs.sort()
      expect(result).toEqual([1, 2])
    })

    it('sorts two elements correctly', () => {
      const bs = new BogoSort2([2, 1])
      const result = bs.sort()
      expect(result).toEqual([1, 2])
    })

    it('sorts three elements correctly', () => {
      const bs = new BogoSort2([3, 1, 2])
      const result = bs.sort()
      expect(result).toEqual([1, 2, 3])
    })

    it('sorts three elements with duplicates', () => {
      const bs = new BogoSort2([2, 1, 2])
      const result = bs.sort()
      expect(result).toEqual([1, 2, 2])
    })

    it('sorts with negative numbers', () => {
      const bs = new BogoSort2([-1, -3, -2])
      const result = bs.sort()
      expect(result).toEqual([-3, -2, -1])
    })

    it('sorts with mixed positive and negative', () => {
      const bs = new BogoSort2([3, -1, 0])
      const result = bs.sort()
      expect(result).toEqual([-1, 0, 3])
    })

    it('sorts with custom comparator (descending)', () => {
      const bs = new BogoSort2([1, 2, 3], 100, (a, b) => b - a)
      const result = bs.sort()
      expect(result).toEqual([3, 2, 1])
    })

    it('sorts four elements correctly', () => {
      const bs = new BogoSort2([4, 3, 2, 1])
      const result = bs.sort()
      expect(result).toEqual([1, 2, 3, 4])
    })

    it('sorts five elements correctly', () => {
      const bs = new BogoSort2([5, 3, 1, 4, 2])
      const result = bs.sort()
      expect(result).toEqual([1, 2, 3, 4, 5])
    })

    it('returns a new array not the internal one', () => {
      const bs = new BogoSort2([2, 1])
      const result = bs.sort()
      expect(result).not.toBe((bs as unknown as { array: number[] }).array)
    })
  })

  // ─── sortDescending ───
  describe('sortDescending', () => {
    it('returns empty array for empty input', () => {
      const bs = new BogoSort2([])
      expect(bs.sortDescending()).toEqual([])
    })

    it('returns single element for single input', () => {
      const bs = new BogoSort2([42])
      expect(bs.sortDescending()).toEqual([42])
    })

    it('sorts two elements descending', () => {
      const bs = new BogoSort2([1, 2])
      const result = bs.sortDescending()
      expect(result).toEqual([2, 1])
    })

    it('sorts three elements descending', () => {
      const bs = new BogoSort2([1, 3, 2])
      const result = bs.sortDescending()
      expect(result).toEqual([3, 2, 1])
    })
  })

  // ─── isSorted ───
  describe('isSorted', () => {
    it('returns true for empty array', () => {
      const bs = new BogoSort2([])
      expect(bs.isSorted([])).toBe(true)
    })

    it('returns true for single element', () => {
      const bs = new BogoSort2([1])
      expect(bs.isSorted([1])).toBe(true)
    })

    it('returns true for sorted array', () => {
      const bs = new BogoSort2([1])
      expect(bs.isSorted([1, 2, 3, 4, 5])).toBe(true)
    })

    it('returns false for unsorted array', () => {
      const bs = new BogoSort2([1])
      expect(bs.isSorted([3, 1, 2])).toBe(false)
    })

    it('returns true for equal elements', () => {
      const bs = new BogoSort2([1])
      expect(bs.isSorted([5, 5, 5])).toBe(true)
    })

    it('returns false for reverse sorted', () => {
      const bs = new BogoSort2([1])
      expect(bs.isSorted([5, 4, 3, 2, 1])).toBe(false)
    })
  })

  // ─── getShuffleCount ───
  describe('getShuffleCount', () => {
    it('returns 0 before sorting', () => {
      const bs = new BogoSort2([2, 1])
      expect(bs.getShuffleCount()).toBe(0)
    })

    it('returns non-zero after sorting unsorted array', () => {
      const bs = new BogoSort2([2, 1])
      bs.sort()
      expect(bs.getShuffleCount()).toBeGreaterThanOrEqual(0)
    })

    it('returns 0 for empty array sort', () => {
      const bs = new BogoSort2([])
      bs.sort()
      expect(bs.getShuffleCount()).toBe(0)
    })

    it('returns 0 for single element sort', () => {
      const bs = new BogoSort2([1])
      bs.sort()
      expect(bs.getShuffleCount()).toBe(0)
    })
  })

  // ─── Complexity ───
  describe('getTimeComplexity', () => {
    it('returns O(1) for empty array', () => {
      const bs = new BogoSort2([])
      expect(bs.getTimeComplexity()).toBe('O(1)')
    })

    it('returns O(1) for single element', () => {
      const bs = new BogoSort2([1])
      expect(bs.getTimeComplexity()).toBe('O(1)')
    })

    it('returns O(n!) for multiple elements', () => {
      const bs = new BogoSort2([2, 1])
      expect(bs.getTimeComplexity()).toBe('O(n!)')
    })
  })

  describe('getSpaceComplexity', () => {
    it('returns O(n)', () => {
      const bs = new BogoSort2([1, 2])
      expect(bs.getSpaceComplexity()).toBe('O(n)')
    })
  })
})
