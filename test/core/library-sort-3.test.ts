import { describe, it, expect } from 'vitest'
import { LibrarySort3 } from '../../src/core/library-sort-3/index.js'

describe('LibrarySort3', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('creates instance with default comparator', () => {
      const ls = new LibrarySort3([3, 1, 2])
      expect(ls).toBeInstanceOf(LibrarySort3)
    })

    it('creates instance with custom comparator', () => {
      const ls = new LibrarySort3([3, 1, 2], (a, b) => b - a)
      expect(ls).toBeInstanceOf(LibrarySort3)
    })

    it('does not modify the original array', () => {
      const original = [3, 1, 2]
      new LibrarySort3(original)
      expect(original).toEqual([3, 1, 2])
    })
  })

  // ─── sort ───
  describe('sort', () => {
    it('returns empty array for empty input', () => {
      const ls = new LibrarySort3<number>([])
      expect(ls.sort()).toEqual([])
    })

    it('returns single element for single input', () => {
      const ls = new LibrarySort3([42])
      expect(ls.sort()).toEqual([42])
    })

    it('returns sorted for already sorted array', () => {
      const ls = new LibrarySort3([1, 2, 3, 4, 5])
      expect(ls.sort()).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts reverse sorted array', () => {
      const ls = new LibrarySort3([5, 4, 3, 2, 1])
      expect(ls.sort()).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts random order array', () => {
      const ls = new LibrarySort3([3, 1, 4, 1, 5, 9, 2, 6])
      expect(ls.sort()).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
    })

    it('sorts with negative numbers', () => {
      const ls = new LibrarySort3([-1, -3, -2])
      expect(ls.sort()).toEqual([-3, -2, -1])
    })

    it('sorts with mixed positive and negative', () => {
      const ls = new LibrarySort3([3, -1, 0, -5, 2])
      expect(ls.sort()).toEqual([-5, -1, 0, 2, 3])
    })

    it('sorts array with all equal elements', () => {
      const ls = new LibrarySort3([5, 5, 5, 5])
      expect(ls.sort()).toEqual([5, 5, 5, 5])
    })

    it('sorts two elements', () => {
      const ls = new LibrarySort3([2, 1])
      expect(ls.sort()).toEqual([1, 2])
    })

    it('sorts with custom comparator (descending)', () => {
      const ls = new LibrarySort3([1, 2, 3, 4, 5], (a, b) => b - a)
      expect(ls.sort()).toEqual([5, 4, 3, 2, 1])
    })

    it('sorts large array', () => {
      const arr = Array.from({ length: 100 }, (_, i) => 100 - i)
      const ls = new LibrarySort3(arr)
      const result = ls.sort()
      for (let i = 1; i < result.length; i++) {
        expect(result[i]).toBeGreaterThanOrEqual(result[i - 1]!)
      }
    })

    it('sorts with string values', () => {
      const ls = new LibrarySort3(['banana', 'apple', 'cherry'])
      expect(ls.sort()).toEqual(['apple', 'banana', 'cherry'])
    })
  })

  // ─── sortInPlace ───
  describe('sortInPlace', () => {
    it('sorts array in place', () => {
      const ls = new LibrarySort3([1])
      const arr = [3, 1, 2]
      ls.sortInPlace(arr)
      expect(arr).toEqual([1, 2, 3])
    })

    it('handles empty array', () => {
      const ls = new LibrarySort3<number>([])
      const arr: number[] = []
      ls.sortInPlace(arr)
      expect(arr).toEqual([])
    })

    it('handles single element', () => {
      const ls = new LibrarySort3([1])
      const arr = [42]
      ls.sortInPlace(arr)
      expect(arr).toEqual([42])
    })

    it('handles already sorted array', () => {
      const ls = new LibrarySort3([1])
      const arr = [1, 2, 3]
      ls.sortInPlace(arr)
      expect(arr).toEqual([1, 2, 3])
    })

    it('returns the same array reference', () => {
      const ls = new LibrarySort3([1])
      const arr = [3, 1, 2]
      const result = ls.sortInPlace(arr)
      expect(result).toBe(arr)
    })

    it('handles all equal elements', () => {
      const ls = new LibrarySort3([1])
      const arr = [7, 7, 7]
      ls.sortInPlace(arr)
      expect(arr).toEqual([7, 7, 7])
    })
  })
})
