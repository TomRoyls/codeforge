import { describe, it, expect } from 'vitest'
import { BlockSort2 } from '../../src/core/block-sort-2/index.js'

// ─── Constructor ───

describe('BlockSort2', () => {
  describe('constructor', () => {
    it('creates a sorter with default comparator', () => {
      const sorter = new BlockSort2()
      expect(sorter.isSorted([1, 2, 3])).toBe(true)
    })

    it('creates a sorter with custom comparator (descending)', () => {
      const sorter = new BlockSort2((a, b) => b - a)
      const result = sorter.sort([1, 3, 2])
      expect(result).toEqual([3, 2, 1])
    })
  })

  // ─── Sort ───

  describe('sort', () => {
    it('sorts an empty array', () => {
      const sorter = new BlockSort2()
      expect(sorter.sort([])).toEqual([])
    })

    it('sorts a single element', () => {
      const sorter = new BlockSort2()
      expect(sorter.sort([42])).toEqual([42])
    })

    it('sorts two elements', () => {
      const sorter = new BlockSort2()
      expect(sorter.sort([2, 1])).toEqual([1, 2])
    })

    it('sorts already sorted array', () => {
      const sorter = new BlockSort2()
      expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts reverse sorted array', () => {
      const sorter = new BlockSort2()
      expect(sorter.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts random order', () => {
      const sorter = new BlockSort2()
      expect(sorter.sort([5, 3, 8, 1, 9, 2, 7, 4, 6])).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('handles duplicates', () => {
      const sorter = new BlockSort2()
      expect(sorter.sort([3, 1, 2, 1, 3, 2])).toEqual([1, 1, 2, 2, 3, 3])
    })

    it('handles negative numbers', () => {
      const sorter = new BlockSort2()
      expect(sorter.sort([-3, 5, -1, 0, 2])).toEqual([-3, -1, 0, 2, 5])
    })

    it('handles all identical elements', () => {
      const sorter = new BlockSort2()
      expect(sorter.sort([7, 7, 7, 7])).toEqual([7, 7, 7, 7])
    })

    it('does not mutate the original array', () => {
      const sorter = new BlockSort2()
      const original = [3, 1, 2]
      const result = sorter.sort(original)
      expect(result).toEqual([1, 2, 3])
      expect(original).toEqual([3, 1, 2])
    })

    it('sorts large array', () => {
      const sorter = new BlockSort2()
      const arr = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 10000))
      const result = sorter.sort(arr)
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i]!).toBeLessThanOrEqual(result[i + 1]!)
      }
    })
  })

  // ─── SortInPlace ───

  describe('sortInPlace', () => {
    it('sorts array in place', () => {
      const sorter = new BlockSort2()
      const arr = [5, 3, 1, 4, 2]
      sorter.sortInPlace(arr)
      expect(arr).toEqual([1, 2, 3, 4, 5])
    })

    it('handles empty array', () => {
      const sorter = new BlockSort2()
      const arr: number[] = []
      sorter.sortInPlace(arr)
      expect(arr).toEqual([])
    })

    it('handles single element', () => {
      const sorter = new BlockSort2()
      const arr = [42]
      sorter.sortInPlace(arr)
      expect(arr).toEqual([42])
    })

    it('handles duplicates in place', () => {
      const sorter = new BlockSort2()
      const arr = [3, 1, 2, 1, 3]
      sorter.sortInPlace(arr)
      expect(arr).toEqual([1, 1, 2, 3, 3])
    })

    it('handles negative numbers in place', () => {
      const sorter = new BlockSort2()
      const arr = [-3, 5, -1, 0, 2]
      sorter.sortInPlace(arr)
      expect(arr).toEqual([-3, -1, 0, 2, 5])
    })

    it('large array in place', () => {
      const sorter = new BlockSort2()
      const arr = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 10000))
      sorter.sortInPlace(arr)
      for (let i = 0; i < arr.length - 1; i++) {
        expect(arr[i]!).toBeLessThanOrEqual(arr[i + 1]!)
      }
    })
  })

  // ─── IsSorted ───

  describe('isSorted', () => {
    it('returns true for sorted array', () => {
      const sorter = new BlockSort2()
      expect(sorter.isSorted([1, 2, 3, 4, 5])).toBe(true)
    })

    it('returns false for unsorted array', () => {
      const sorter = new BlockSort2()
      expect(sorter.isSorted([3, 1, 2])).toBe(false)
    })

    it('returns true for empty array', () => {
      const sorter = new BlockSort2()
      expect(sorter.isSorted([])).toBe(true)
    })

    it('returns true for single element', () => {
      const sorter = new BlockSort2()
      expect(sorter.isSorted([42])).toBe(true)
    })

    it('returns true for array with duplicates', () => {
      const sorter = new BlockSort2()
      expect(sorter.isSorted([1, 1, 2, 2, 3])).toBe(true)
    })

    it('returns false when last element is out of order', () => {
      const sorter = new BlockSort2()
      expect(sorter.isSorted([1, 2, 3, 0])).toBe(false)
    })

    it('works with custom comparator', () => {
      const sorter = new BlockSort2((a, b) => b - a)
      expect(sorter.isSorted([5, 4, 3, 2, 1])).toBe(true)
      expect(sorter.isSorted([1, 2, 3])).toBe(false)
    })
  })
})
