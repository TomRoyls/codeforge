import { describe, it, expect } from 'vitest'
import { InsertionSort4 } from '../../src/core/insertion-sort-4/index.js'

describe('InsertionSort4', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('should create an instance with default comparator', () => {
      const sorter = new InsertionSort4([3, 1, 2])
      expect(sorter.getTimeComplexity()).toBe('O(n²)')
      expect(sorter.getSpaceComplexity()).toBe('O(1)')
    })

    it('should create an instance with custom comparator', () => {
      const sorter = new InsertionSort4(['c', 'a', 'b'], (a, b) => a.localeCompare(b))
      expect(sorter.sort()).toEqual(['a', 'b', 'c'])
    })

    it('should not mutate the input array', () => {
      const original = [3, 1, 2]
      const copy = [...original]
      new InsertionSort4(original)
      expect(original).toEqual(copy)
    })
  })

  // ─── sort ───
  describe('sort', () => {
    it('should sort an empty array', () => {
      const sorter = new InsertionSort4<number>([])
      expect(sorter.sort()).toEqual([])
    })

    it('should sort a single-element array', () => {
      const sorter = new InsertionSort4([42])
      expect(sorter.sort()).toEqual([42])
    })

    it('should sort a sorted array', () => {
      const sorter = new InsertionSort4([1, 2, 3, 4, 5])
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5])
    })

    it('should sort a reverse-sorted array', () => {
      const sorter = new InsertionSort4([5, 4, 3, 2, 1])
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5])
    })

    it('should sort an unsorted array', () => {
      const sorter = new InsertionSort4([3, 1, 4, 1, 5, 9, 2, 6])
      expect(sorter.sort()).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
    })

    it('should handle negative numbers', () => {
      const sorter = new InsertionSort4([-3, -1, -4, -1, -5])
      expect(sorter.sort()).toEqual([-5, -4, -3, -1, -1])
    })

    it('should handle mixed positive and negative numbers', () => {
      const sorter = new InsertionSort4([3, -1, 0, -5, 2])
      expect(sorter.sort()).toEqual([-5, -1, 0, 2, 3])
    })

    it('should handle duplicates', () => {
      const sorter = new InsertionSort4([2, 2, 2, 1, 1])
      expect(sorter.sort()).toEqual([1, 1, 2, 2, 2])
    })

    it('should not mutate internal state on repeated sort calls', () => {
      const sorter = new InsertionSort4([3, 1, 2])
      const first = sorter.sort()
      const second = sorter.sort()
      expect(first).toEqual(second)
    })
  })

  // ─── sortDescending ───
  describe('sortDescending', () => {
    it('should sort descending for empty array', () => {
      const sorter = new InsertionSort4<number>([])
      expect(sorter.sortDescending()).toEqual([])
    })

    it('should sort descending for single element', () => {
      const sorter = new InsertionSort4([42])
      expect(sorter.sortDescending()).toEqual([42])
    })

    it('should sort in descending order', () => {
      const sorter = new InsertionSort4([3, 1, 4, 1, 5])
      expect(sorter.sortDescending()).toEqual([5, 4, 3, 1, 1])
    })

    it('should sort descending with negatives', () => {
      const sorter = new InsertionSort4([-3, -1, 0, 2])
      expect(sorter.sortDescending()).toEqual([2, 0, -1, -3])
    })
  })

  // ─── isSorted ───
  describe('isSorted', () => {
    it('should return true for empty array', () => {
      const sorter = new InsertionSort4<number>([])
      expect(sorter.isSorted()).toBe(true)
    })

    it('should return true for single element', () => {
      const sorter = new InsertionSort4([1])
      expect(sorter.isSorted()).toBe(true)
    })

    it('should return true for sorted array', () => {
      const sorter = new InsertionSort4([1, 2, 3, 4])
      expect(sorter.isSorted()).toBe(true)
    })

    it('should return false for unsorted array', () => {
      const sorter = new InsertionSort4([3, 1, 2])
      expect(sorter.isSorted()).toBe(false)
    })
  })

  // ─── getTimeComplexity ───
  describe('getTimeComplexity', () => {
    it('should return O(1) for empty array', () => {
      const sorter = new InsertionSort4<number>([])
      expect(sorter.getTimeComplexity()).toBe('O(1)')
    })

    it('should return O(1) for single element', () => {
      const sorter = new InsertionSort4([1])
      expect(sorter.getTimeComplexity()).toBe('O(1)')
    })

    it('should return O(n²) for larger arrays', () => {
      const sorter = new InsertionSort4([1, 2, 3])
      expect(sorter.getTimeComplexity()).toBe('O(n²)')
    })
  })

  // ─── getSpaceComplexity ───
  describe('getSpaceComplexity', () => {
    it('should return O(1)', () => {
      const sorter = new InsertionSort4([1, 2, 3])
      expect(sorter.getSpaceComplexity()).toBe('O(1)')
    })
  })

  // ─── shellInsertionSort ───
  describe('shellInsertionSort', () => {
    it('should sort the internal array using shell sort', () => {
      const sorter = new InsertionSort4([5, 3, 8, 1, 2])
      sorter.shellInsertionSort()
      expect(sorter.isSorted()).toBe(true)
    })

    it('should handle empty array', () => {
      const sorter = new InsertionSort4<number>([])
      sorter.shellInsertionSort()
      expect(sorter.isSorted()).toBe(true)
    })

    it('should handle single element', () => {
      const sorter = new InsertionSort4([42])
      sorter.shellInsertionSort()
      expect(sorter.isSorted()).toBe(true)
    })

    it('should handle already sorted array', () => {
      const sorter = new InsertionSort4([1, 2, 3, 4, 5])
      sorter.shellInsertionSort()
      expect(sorter.isSorted()).toBe(true)
    })
  })

  // ─── insertionSortRange ───
  describe('insertionSortRange', () => {
    it('should sort a subrange of the array', () => {
      const sorter = new InsertionSort4<number>([])
      const result = sorter.insertionSortRange([5, 3, 8, 1, 2], 1, 3)
      expect(result).toEqual([5, 1, 3, 8, 2])
      const sorted = sorter.insertionSortRange([5, 3, 8, 1, 2], 0, 4)
      expect(sorted).toEqual([1, 2, 3, 5, 8])
    })

    it('should not modify the input array', () => {
      const sorter = new InsertionSort4<number>([])
      const original = [5, 3, 8, 1, 2]
      const copy = [...original]
      sorter.insertionSortRange(original, 0, 4)
      expect(original).toEqual(copy)
    })

    it('should sort a single-element range', () => {
      const sorter = new InsertionSort4<number>([])
      const result = sorter.insertionSortRange([5, 3, 8], 1, 1)
      expect(result).toEqual([5, 3, 8])
    })
  })

  // ─── stableInsertionSort ───
  describe('stableInsertionSort', () => {
    it('should sort an external array', () => {
      const sorter = new InsertionSort4<number>([])
      expect(sorter.stableInsertionSort([5, 3, 8, 1, 2])).toEqual([1, 2, 3, 5, 8])
    })

    it('should handle empty array', () => {
      const sorter = new InsertionSort4<number>([])
      expect(sorter.stableInsertionSort([])).toEqual([])
    })

    it('should handle single element', () => {
      const sorter = new InsertionSort4<number>([])
      expect(sorter.stableInsertionSort([42])).toEqual([42])
    })

    it('should not modify the input array', () => {
      const sorter = new InsertionSort4<number>([])
      const original = [5, 3, 1]
      const copy = [...original]
      sorter.stableInsertionSort(original)
      expect(original).toEqual(copy)
    })

    it('should preserve stability with objects using custom comparator', () => {
      type Item = { key: number; value: string }
      const items: Item[] = [
        { key: 1, value: 'a' },
        { key: 2, value: 'b' },
        { key: 1, value: 'c' },
      ]
      const sorter = new InsertionSort4<Item>([], (a, b) => a.key - b.key)
      const sorted = sorter.stableInsertionSort(items)
      expect(sorted[0]!.value).toBe('a')
      expect(sorted[1]!.value).toBe('c')
      expect(sorted[2]!.value).toBe('b')
    })
  })
})
