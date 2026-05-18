import { describe, it, expect } from 'vitest'
import { SelectionSort4 } from '../../src/core/selection-sort-4/index.js'

describe('SelectionSort4', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('should create an instance with default comparator', () => {
      const sorter = new SelectionSort4([3, 1, 2])
      expect(sorter.getTimeComplexity()).toBe('O(n²)')
      expect(sorter.getSpaceComplexity()).toBe('O(n)')
    })

    it('should create an instance with custom comparator', () => {
      const sorter = new SelectionSort4(['c', 'a', 'b'], (a, b) => a.localeCompare(b))
      expect(sorter.sort()).toEqual(['a', 'b', 'c'])
    })

    it('should not mutate the input array', () => {
      const original = [3, 1, 2]
      const copy = [...original]
      new SelectionSort4(original)
      expect(original).toEqual(copy)
    })
  })

  // ─── sort ───
  describe('sort', () => {
    it('should sort an empty array', () => {
      const sorter = new SelectionSort4<number>([])
      expect(sorter.sort()).toEqual([])
    })

    it('should sort a single-element array', () => {
      const sorter = new SelectionSort4([42])
      expect(sorter.sort()).toEqual([42])
    })

    it('should sort an already sorted array', () => {
      const sorter = new SelectionSort4([1, 2, 3, 4, 5])
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5])
    })

    it('should sort a reverse-sorted array', () => {
      const sorter = new SelectionSort4([5, 4, 3, 2, 1])
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5])
    })

    it('should sort an unsorted array', () => {
      const sorter = new SelectionSort4([3, 1, 4, 1, 5, 9, 2, 6])
      expect(sorter.sort()).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
    })

    it('should handle negative numbers', () => {
      const sorter = new SelectionSort4([-3, -1, -4, -1, -5])
      expect(sorter.sort()).toEqual([-5, -4, -3, -1, -1])
    })

    it('should handle mixed positive and negative numbers', () => {
      const sorter = new SelectionSort4([3, -1, 0, -5, 2])
      expect(sorter.sort()).toEqual([-5, -1, 0, 2, 3])
    })

    it('should handle duplicates', () => {
      const sorter = new SelectionSort4([2, 2, 2, 1, 1])
      expect(sorter.sort()).toEqual([1, 1, 2, 2, 2])
    })

    it('should not mutate internal state on repeated sort calls', () => {
      const sorter = new SelectionSort4([3, 1, 2])
      const first = sorter.sort()
      const second = sorter.sort()
      expect(first).toEqual(second)
    })

    it('should sort a two-element array', () => {
      const sorter = new SelectionSort4([2, 1])
      expect(sorter.sort()).toEqual([1, 2])
    })
  })

  // ─── sortDescending ───
  describe('sortDescending', () => {
    it('should sort descending for empty array', () => {
      const sorter = new SelectionSort4<number>([])
      expect(sorter.sortDescending()).toEqual([])
    })

    it('should sort descending for single element', () => {
      const sorter = new SelectionSort4([42])
      expect(sorter.sortDescending()).toEqual([42])
    })

    it('should sort in descending order', () => {
      const sorter = new SelectionSort4([3, 1, 4, 1, 5])
      expect(sorter.sortDescending()).toEqual([5, 4, 3, 1, 1])
    })

    it('should sort descending with negatives', () => {
      const sorter = new SelectionSort4([-3, -1, 0, 2])
      expect(sorter.sortDescending()).toEqual([2, 0, -1, -3])
    })
  })

  // ─── partialSort ───
  describe('partialSort', () => {
    it('should return empty array for k <= 0', () => {
      const sorter = new SelectionSort4([3, 1, 2])
      expect(sorter.partialSort(0)).toEqual([])
      expect(sorter.partialSort(-1)).toEqual([])
    })

    it('should return full sort when k >= array length', () => {
      const sorter = new SelectionSort4([3, 1, 2])
      expect(sorter.partialSort(5)).toEqual([1, 2, 3])
      expect(sorter.partialSort(3)).toEqual([1, 2, 3])
    })

    it('should return the k smallest elements sorted', () => {
      const sorter = new SelectionSort4([5, 3, 8, 1, 2])
      expect(sorter.partialSort(2)).toEqual([1, 2])
      expect(sorter.partialSort(3)).toEqual([1, 2, 3])
    })

    it('should return single element for k=1', () => {
      const sorter = new SelectionSort4([5, 3, 8, 1, 2])
      expect(sorter.partialSort(1)).toEqual([1])
    })

    it('should handle duplicates in partial sort', () => {
      const sorter = new SelectionSort4([2, 1, 2, 1, 3])
      expect(sorter.partialSort(3)).toEqual([1, 1, 2])
    })

    it('should handle empty array', () => {
      const sorter = new SelectionSort4<number>([])
      expect(sorter.partialSort(3)).toEqual([])
    })

    it('should handle single-element array', () => {
      const sorter = new SelectionSort4([42])
      expect(sorter.partialSort(1)).toEqual([42])
    })
  })

  // ─── stableSelectionSort ───
  describe('stableSelectionSort', () => {
    it('should sort an empty array', () => {
      const sorter = new SelectionSort4<number>([])
      expect(sorter.stableSelectionSort()).toEqual([])
    })

    it('should sort a single element', () => {
      const sorter = new SelectionSort4([42])
      expect(sorter.stableSelectionSort()).toEqual([42])
    })

    it('should sort an unsorted array', () => {
      const sorter = new SelectionSort4([3, 1, 4, 1, 5])
      expect(sorter.stableSelectionSort()).toEqual([1, 1, 3, 4, 5])
    })

    it('should preserve stability for objects with custom comparator', () => {
      type Item = { key: number; label: string }
      const items: Item[] = [
        { key: 2, label: 'a' },
        { key: 1, label: 'b' },
        { key: 2, label: 'c' },
        { key: 1, label: 'd' },
      ]
      const sorter = new SelectionSort4<Item>(items, (a, b) => a.key - b.key)
      const sorted = sorter.stableSelectionSort()
      expect(sorted.map((i) => i.label)).toEqual(['b', 'd', 'a', 'c'])
    })

    it('should handle negative numbers', () => {
      const sorter = new SelectionSort4([-3, -1, -4, -1, -5])
      expect(sorter.stableSelectionSort()).toEqual([-5, -4, -3, -1, -1])
    })
  })

  // ─── findKthSmallest ───
  describe('findKthSmallest', () => {
    it('should return the 1st smallest element', () => {
      const sorter = new SelectionSort4([3, 1, 4, 1, 5])
      expect(sorter.findKthSmallest(1)).toBe(1)
    })

    it('should return the kth smallest element', () => {
      const sorter = new SelectionSort4([5, 3, 8, 1, 2])
      expect(sorter.findKthSmallest(3)).toBe(3)
      expect(sorter.findKthSmallest(5)).toBe(8)
    })

    it('should return undefined for k < 1', () => {
      const sorter = new SelectionSort4([1, 2, 3])
      expect(sorter.findKthSmallest(0)).toBeUndefined()
      expect(sorter.findKthSmallest(-1)).toBeUndefined()
    })

    it('should return undefined for k > array length', () => {
      const sorter = new SelectionSort4([1, 2, 3])
      expect(sorter.findKthSmallest(4)).toBeUndefined()
    })

    it('should return undefined for empty array', () => {
      const sorter = new SelectionSort4<number>([])
      expect(sorter.findKthSmallest(1)).toBeUndefined()
    })

    it('should handle single element', () => {
      const sorter = new SelectionSort4([42])
      expect(sorter.findKthSmallest(1)).toBe(42)
    })

    it('should handle duplicates', () => {
      const sorter = new SelectionSort4([2, 1, 2, 1, 3])
      expect(sorter.findKthSmallest(1)).toBe(1)
      expect(sorter.findKthSmallest(2)).toBe(1)
      expect(sorter.findKthSmallest(3)).toBe(2)
    })

    it('should handle negative numbers', () => {
      const sorter = new SelectionSort4([-3, -1, 0, 2])
      expect(sorter.findKthSmallest(1)).toBe(-3)
      expect(sorter.findKthSmallest(4)).toBe(2)
    })
  })

  // ─── findKthLargest ───
  describe('findKthLargest', () => {
    it('should return the 1st largest element', () => {
      const sorter = new SelectionSort4([3, 1, 4, 1, 5])
      expect(sorter.findKthLargest(1)).toBe(5)
    })

    it('should return the kth largest element', () => {
      const sorter = new SelectionSort4([5, 3, 8, 1, 2])
      expect(sorter.findKthLargest(2)).toBe(5)
      expect(sorter.findKthLargest(5)).toBe(1)
    })

    it('should return undefined for k < 1', () => {
      const sorter = new SelectionSort4([1, 2, 3])
      expect(sorter.findKthLargest(0)).toBeUndefined()
    })

    it('should return undefined for k > array length', () => {
      const sorter = new SelectionSort4([1, 2, 3])
      expect(sorter.findKthLargest(4)).toBeUndefined()
    })

    it('should return undefined for empty array', () => {
      const sorter = new SelectionSort4<number>([])
      expect(sorter.findKthLargest(1)).toBeUndefined()
    })

    it('should handle duplicates', () => {
      const sorter = new SelectionSort4([2, 1, 2, 1, 3])
      expect(sorter.findKthLargest(1)).toBe(3)
      expect(sorter.findKthLargest(2)).toBe(2)
    })

    it('should handle negative numbers', () => {
      const sorter = new SelectionSort4([-3, -1, 0, 2])
      expect(sorter.findKthLargest(1)).toBe(2)
      expect(sorter.findKthLargest(4)).toBe(-3)
    })
  })

  // ─── isSorted ───
  describe('isSorted', () => {
    it('should return true for empty array', () => {
      const sorter = new SelectionSort4<number>([])
      expect(sorter.isSorted()).toBe(true)
    })

    it('should return true for single element', () => {
      const sorter = new SelectionSort4([1])
      expect(sorter.isSorted()).toBe(true)
    })

    it('should return true for sorted array', () => {
      const sorter = new SelectionSort4([1, 2, 3, 4])
      expect(sorter.isSorted()).toBe(true)
    })

    it('should return true for array with duplicates in order', () => {
      const sorter = new SelectionSort4([1, 1, 2, 2, 3])
      expect(sorter.isSorted()).toBe(true)
    })

    it('should return false for unsorted array', () => {
      const sorter = new SelectionSort4([3, 1, 2])
      expect(sorter.isSorted()).toBe(false)
    })

    it('should return false for reverse-sorted array', () => {
      const sorter = new SelectionSort4([5, 4, 3])
      expect(sorter.isSorted()).toBe(false)
    })
  })

  // ─── getTimeComplexity ───
  describe('getTimeComplexity', () => {
    it('should return O(1) for empty array', () => {
      const sorter = new SelectionSort4<number>([])
      expect(sorter.getTimeComplexity()).toBe('O(1)')
    })

    it('should return O(1) for single element', () => {
      const sorter = new SelectionSort4([1])
      expect(sorter.getTimeComplexity()).toBe('O(1)')
    })

    it('should return O(n²) for larger arrays', () => {
      const sorter = new SelectionSort4([1, 2, 3])
      expect(sorter.getTimeComplexity()).toBe('O(n²)')
    })
  })

  // ─── getSpaceComplexity ───
  describe('getSpaceComplexity', () => {
    it('should return O(n)', () => {
      const sorter = new SelectionSort4([1, 2, 3])
      expect(sorter.getSpaceComplexity()).toBe('O(n)')
    })
  })
})
