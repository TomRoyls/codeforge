import { describe, it, expect } from 'vitest'
import { CountingSort } from '../../src/core/counting-sort-2/index.js'

describe('CountingSort', () => {
  // ─── Constructor ───

  describe('constructor', () => {
    it('creates instance with empty array', () => {
      const cs = new CountingSort([])
      expect(cs.toArray()).toEqual([])
    })

    it('creates instance with array of numbers', () => {
      const cs = new CountingSort([3, 1, 2])
      expect(cs.toArray()).toEqual([3, 1, 2])
    })

    it('creates instance with maxValue', () => {
      const cs = new CountingSort([1, 2, 3], 10)
      expect(cs.toArray()).toEqual([1, 2, 3])
    })

    it('creates instance with single element', () => {
      const cs = new CountingSort([5])
      expect(cs.toArray()).toEqual([5])
    })
  })

  // ─── sort ───

  describe('sort', () => {
    it('sorts an empty array', () => {
      const cs = new CountingSort([])
      expect(cs.sort()).toEqual([])
    })

    it('sorts a single element', () => {
      const cs = new CountingSort([42])
      expect(cs.sort()).toEqual([42])
    })

    it('sorts already sorted array', () => {
      const cs = new CountingSort([1, 2, 3, 4, 5])
      expect(cs.sort()).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts reverse sorted array', () => {
      const cs = new CountingSort([5, 4, 3, 2, 1])
      expect(cs.sort()).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts random array', () => {
      const cs = new CountingSort([3, 1, 4, 1, 5, 9, 2, 6])
      expect(cs.sort()).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
    })

    it('sorts array with duplicates', () => {
      const cs = new CountingSort([3, 3, 3, 1, 1, 2])
      expect(cs.sort()).toEqual([1, 1, 2, 3, 3, 3])
    })

    it('sorts array with negative numbers', () => {
      const cs = new CountingSort([-3, -1, -2, 0, 2, 1])
      expect(cs.sort()).toEqual([-3, -2, -1, 0, 1, 2])
    })

    it('sorts using provided maxValue', () => {
      const cs = new CountingSort([1, 3, 2], 10)
      expect(cs.sort()).toEqual([1, 2, 3])
    })

    it('sorts all same elements', () => {
      const cs = new CountingSort([5, 5, 5, 5])
      expect(cs.sort()).toEqual([5, 5, 5, 5])
    })

    it('sorts two elements', () => {
      const cs = new CountingSort([2, 1])
      expect(cs.sort()).toEqual([1, 2])
    })
  })

  // ─── isSorted ───

  describe('isSorted', () => {
    it('returns true for empty array', () => {
      const cs = new CountingSort([])
      expect(cs.isSorted()).toBe(true)
    })

    it('returns true for single element', () => {
      const cs = new CountingSort([1])
      expect(cs.isSorted()).toBe(true)
    })

    it('returns true for sorted array', () => {
      const cs = new CountingSort([1, 2, 3, 4])
      expect(cs.isSorted()).toBe(true)
    })

    it('returns false for unsorted array', () => {
      const cs = new CountingSort([3, 1, 2])
      expect(cs.isSorted()).toBe(false)
    })

    it('returns true for all equal elements', () => {
      const cs = new CountingSort([5, 5, 5])
      expect(cs.isSorted()).toBe(true)
    })

    it('checks original array not sorted result', () => {
      const cs = new CountingSort([5, 1, 3])
      expect(cs.isSorted()).toBe(false)
    })
  })

  // ─── getCounts ───

  describe('getCounts', () => {
    it('returns empty map for empty array', () => {
      const cs = new CountingSort([])
      expect(cs.getCounts().size).toBe(0)
    })

    it('returns correct counts', () => {
      const cs = new CountingSort([1, 2, 2, 3, 3, 3])
      const counts = cs.getCounts()
      expect(counts.get(1)).toBe(1)
      expect(counts.get(2)).toBe(2)
      expect(counts.get(3)).toBe(3)
    })

    it('returns a copy', () => {
      const cs = new CountingSort([1, 2, 2])
      const counts = cs.getCounts()
      counts.set(1, 999)
      expect(cs.getCounts().get(1)).toBe(1)
    })

    it('handles single element', () => {
      const cs = new CountingSort([7])
      const counts = cs.getCounts()
      expect(counts.get(7)).toBe(1)
      expect(counts.size).toBe(1)
    })
  })

  // ─── getMin / getMax ───

  describe('getMin and getMax', () => {
    it('returns undefined for empty array', () => {
      const cs = new CountingSort([])
      expect(cs.getMin()).toBeUndefined()
      expect(cs.getMax()).toBeUndefined()
    })

    it('returns same value for single element', () => {
      const cs = new CountingSort([42])
      expect(cs.getMin()).toBe(42)
      expect(cs.getMax()).toBe(42)
    })

    it('returns correct min and max', () => {
      const cs = new CountingSort([5, 1, 9, 3, 7])
      expect(cs.getMin()).toBe(1)
      expect(cs.getMax()).toBe(9)
    })

    it('handles negative values', () => {
      const cs = new CountingSort([-5, -1, -10, 0, 3])
      expect(cs.getMin()).toBe(-10)
      expect(cs.getMax()).toBe(3)
    })
  })

  // ─── toArray ───

  describe('toArray', () => {
    it('returns a copy of the array', () => {
      const original = [3, 1, 2]
      const cs = new CountingSort(original)
      const arr = cs.toArray()
      expect(arr).toEqual(original)
      expect(arr).not.toBe(original)
    })

    it('returns empty for empty input', () => {
      const cs = new CountingSort([])
      expect(cs.toArray()).toEqual([])
    })
  })

  // ─── getTimeComplexity ───

  describe('getTimeComplexity', () => {
    it('returns O(n + k) string', () => {
      const cs = new CountingSort([1, 2, 3])
      const result = cs.getTimeComplexity()
      expect(result).toContain('O(n + k)')
      expect(result).toContain('n=3')
    })

    it('reports correct n for empty array', () => {
      const cs = new CountingSort([])
      const result = cs.getTimeComplexity()
      expect(result).toContain('n=0')
    })

    it('uses maxValue when provided', () => {
      const cs = new CountingSort([1, 2], 100)
      const result = cs.getTimeComplexity()
      expect(result).toContain('O(n + k)')
    })
  })
})
