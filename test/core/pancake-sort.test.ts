import { describe, it, expect } from 'vitest'
import { PancakeSort } from '../../src/core/pancake-sort/index.js'

describe('PancakeSort', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('creates instance with default comparator', () => {
      const ps = new PancakeSort([3, 1, 2])
      expect(ps.toArray()).toEqual([3, 1, 2])
    })

    it('creates instance with custom comparator', () => {
      const ps = new PancakeSort([3, 1, 2], (a, b) => b - a)
      expect(ps.toArray()).toEqual([3, 1, 2])
    })

    it('does not modify the original array', () => {
      const original = [3, 1, 2]
      new PancakeSort(original)
      expect(original).toEqual([3, 1, 2])
    })
  })

  // ─── sort ───
  describe('sort', () => {
    it('returns empty array for empty input', () => {
      const ps = new PancakeSort([])
      expect(ps.sort()).toEqual([])
    })

    it('returns single element for single input', () => {
      const ps = new PancakeSort([42])
      expect(ps.sort()).toEqual([42])
    })

    it('returns already sorted array unchanged', () => {
      const ps = new PancakeSort([1, 2, 3, 4, 5])
      expect(ps.sort()).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts reverse sorted array', () => {
      const ps = new PancakeSort([5, 4, 3, 2, 1])
      expect(ps.sort()).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts random order array', () => {
      const ps = new PancakeSort([3, 1, 4, 1, 5, 9, 2, 6])
      expect(ps.sort()).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
    })

    it('handles duplicates', () => {
      const ps = new PancakeSort([3, 3, 3, 1, 1, 2, 2])
      expect(ps.sort()).toEqual([1, 1, 2, 2, 3, 3, 3])
    })

    it('handles negative numbers', () => {
      const ps = new PancakeSort([-3, -1, -2, -5, -4])
      expect(ps.sort()).toEqual([-5, -4, -3, -2, -1])
    })

    it('handles mixed positive and negative', () => {
      const ps = new PancakeSort([3, -1, 0, -2, 2])
      expect(ps.sort()).toEqual([-2, -1, 0, 2, 3])
    })

    it('handles all identical elements', () => {
      const ps = new PancakeSort([5, 5, 5, 5])
      expect(ps.sort()).toEqual([5, 5, 5, 5])
    })

    it('handles two elements', () => {
      const ps = new PancakeSort([2, 1])
      expect(ps.sort()).toEqual([1, 2])
    })

    it('sorts with custom comparator (descending)', () => {
      const ps = new PancakeSort([1, 2, 3, 4, 5], (a, b) => b - a)
      expect(ps.sort()).toEqual([5, 4, 3, 2, 1])
    })

    it('sorts large array correctly', () => {
      const arr = Array.from({ length: 100 }, (_, i) => 100 - i)
      const ps = new PancakeSort(arr)
      const result = ps.sort()
      expect(result).toEqual(Array.from({ length: 100 }, (_, i) => i + 1))
    })
  })

  // ─── isSorted ───
  describe('isSorted', () => {
    it('returns true for empty array', () => {
      const ps = new PancakeSort([])
      expect(ps.isSorted()).toBe(true)
    })

    it('returns true for single element', () => {
      const ps = new PancakeSort([1])
      expect(ps.isSorted()).toBe(true)
    })

    it('returns true for sorted array', () => {
      const ps = new PancakeSort([1, 2, 3, 4, 5])
      expect(ps.isSorted()).toBe(true)
    })

    it('returns false for unsorted array', () => {
      const ps = new PancakeSort([3, 1, 2])
      expect(ps.isSorted()).toBe(false)
    })

    it('returns true after sorting', () => {
      const ps = new PancakeSort([5, 3, 1, 4, 2])
      ps.sort()
      expect(ps.isSorted()).toBe(true)
    })
  })

  // ─── getFlipCount ───
  describe('getFlipCount', () => {
    it('returns 0 before sorting', () => {
      const ps = new PancakeSort([3, 1, 2])
      expect(ps.getFlipCount()).toBe(0)
    })

    it('returns 0 for empty array', () => {
      const ps = new PancakeSort([])
      ps.sort()
      expect(ps.getFlipCount()).toBe(0)
    })

    it('returns 0 for single element', () => {
      const ps = new PancakeSort([1])
      ps.sort()
      expect(ps.getFlipCount()).toBe(0)
    })

    it('returns 0 for already sorted array', () => {
      const ps = new PancakeSort([1, 2, 3])
      ps.sort()
      expect(ps.getFlipCount()).toBe(0)
    })

    it('returns positive count for unsorted array', () => {
      const ps = new PancakeSort([5, 4, 3, 2, 1])
      ps.sort()
      expect(ps.getFlipCount()).toBeGreaterThan(0)
    })
  })

  // ─── toArray ───
  describe('toArray', () => {
    it('returns a copy of the array', () => {
      const ps = new PancakeSort([3, 1, 2])
      const arr = ps.toArray()
      expect(arr).toEqual([3, 1, 2])
      expect(arr).not.toBe((ps as unknown as { arr: number[] }).arr)
    })
  })

  // ─── getTimeComplexity ───
  describe('getTimeComplexity', () => {
    it('returns O(n²)', () => {
      const ps = new PancakeSort([1, 2, 3])
      expect(ps.getTimeComplexity()).toBe('O(n²)')
    })
  })
})
