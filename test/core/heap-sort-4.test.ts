import { describe, it, expect } from 'vitest'
import { HeapSort4, heapify } from '../../src/core/heap-sort-4/index.js'

describe('HeapSort4', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('should create an instance with default comparator', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.getTimeComplexity()).toBe('O(n log n)')
      expect(sorter.getSpaceComplexity()).toBe('O(1)')
    })

    it('should accept a custom comparator', () => {
      const sorter = new HeapSort4<string>((a, b) => b.localeCompare(a))
      const result = sorter.sort(['a', 'c', 'b'])
      expect(result).toEqual(['c', 'b', 'a'])
    })
  })

  // ─── sort ───
  describe('sort', () => {
    it('should sort an empty array', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.sort([])).toEqual([])
    })

    it('should sort a single-element array', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.sort([42])).toEqual([42])
    })

    it('should sort a sorted array', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
    })

    it('should sort a reverse-sorted array', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
    })

    it('should sort an unsorted array', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.sort([3, 1, 4, 1, 5, 9, 2, 6])).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
    })

    it('should sort with negative numbers', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.sort([-3, -1, -4, -1, -5])).toEqual([-5, -4, -3, -1, -1])
    })

    it('should sort with mixed positive and negative numbers', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.sort([3, -1, 0, -5, 2])).toEqual([-5, -1, 0, 2, 3])
    })

    it('should handle duplicates', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.sort([2, 2, 2, 1, 1])).toEqual([1, 1, 2, 2, 2])
    })

    it('should not mutate the original array', () => {
      const sorter = new HeapSort4<number>()
      const original = [3, 1, 2]
      const copy = [...original]
      sorter.sort(original)
      expect(original).toEqual(copy)
    })

    it('should sort strings with default comparator', () => {
      const sorter = new HeapSort4<string>()
      expect(sorter.sort(['banana', 'apple', 'cherry'])).toEqual(['apple', 'banana', 'cherry'])
    })
  })

  // ─── sortDescending ───
  describe('sortDescending', () => {
    it('should sort descending for empty array', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.sortDescending([])).toEqual([])
    })

    it('should sort descending for single element', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.sortDescending([42])).toEqual([42])
    })

    it('should sort in descending order', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.sortDescending([3, 1, 4, 1, 5])).toEqual([5, 4, 3, 1, 1])
    })

    it('should sort descending with negatives', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.sortDescending([-3, -1, 0, 2])).toEqual([2, 0, -1, -3])
    })
  })

  // ─── isSorted ───
  describe('isSorted', () => {
    it('should return true for empty array', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.isSorted([])).toBe(true)
    })

    it('should return true for single-element array', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.isSorted([1])).toBe(true)
    })

    it('should return true for sorted array', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.isSorted([1, 2, 3, 4, 5])).toBe(true)
    })

    it('should return true for sorted array with duplicates', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.isSorted([1, 1, 2, 2, 3])).toBe(true)
    })

    it('should return false for unsorted array', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.isSorted([3, 1, 2])).toBe(false)
    })
  })

  // ─── partialSort ───
  describe('partialSort', () => {
    it('should return full sorted array when k >= length', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.partialSort([3, 1, 2], 5)).toEqual([1, 2, 3])
    })

    it('should return first k elements of sorted array', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.partialSort([5, 3, 1, 4, 2], 3)).toEqual([1, 2, 3])
    })

    it('should handle k = 0', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.partialSort([3, 1, 2], 0)).toEqual([])
    })

    it('should handle k = 1', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.partialSort([5, 3, 1, 4], 1)).toEqual([1])
    })

    it('should not mutate the original array', () => {
      const sorter = new HeapSort4<number>()
      const original = [3, 1, 2]
      const copy = [...original]
      sorter.partialSort(original, 2)
      expect(original).toEqual(copy)
    })
  })

  // ─── kthSmallest ───
  describe('kthSmallest', () => {
    it('should return the smallest element (k=1)', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.kthSmallest([3, 1, 4, 1, 5], 1)).toBe(1)
    })

    it('should return the largest element (k=length)', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.kthSmallest([3, 1, 4, 1, 5], 5)).toBe(5)
    })

    it('should return the median for k=3', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.kthSmallest([3, 1, 2], 2)).toBe(2)
    })

    it('should throw for k < 1', () => {
      const sorter = new HeapSort4<number>()
      expect(() => sorter.kthSmallest([1, 2, 3], 0)).toThrow('k must be between 1 and array length')
    })

    it('should throw for k > length', () => {
      const sorter = new HeapSort4<number>()
      expect(() => sorter.kthSmallest([1, 2, 3], 4)).toThrow('k must be between 1 and array length')
    })
  })

  // ─── kthLargest ───
  describe('kthLargest', () => {
    it('should return the largest element (k=1)', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.kthLargest([3, 1, 4, 1, 5], 1)).toBe(5)
    })

    it('should return the smallest element (k=length)', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.kthLargest([3, 1, 4, 1, 5], 5)).toBe(1)
    })

    it('should throw for k < 1', () => {
      const sorter = new HeapSort4<number>()
      expect(() => sorter.kthLargest([1, 2, 3], 0)).toThrow('k must be between 1 and array length')
    })

    it('should throw for k > length', () => {
      const sorter = new HeapSort4<number>()
      expect(() => sorter.kthLargest([1, 2, 3], 4)).toThrow('k must be between 1 and array length')
    })
  })

  // ─── isMaxHeap ───
  describe('isMaxHeap', () => {
    it('should return true for empty array', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.isMaxHeap([])).toBe(true)
    })

    it('should return true for single element', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.isMaxHeap([1])).toBe(true)
    })

    it('should return true for a valid max-heap', () => {
      const sorter = new HeapSort4<number>()
      // [10, 5, 8, 1, 3] is a valid max-heap
      expect(sorter.isMaxHeap([10, 5, 8, 1, 3])).toBe(true)
    })

    it('should return false for a non-max-heap', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.isMaxHeap([1, 5, 8])).toBe(false)
    })
  })

  // ─── isMinHeap ───
  describe('isMinHeap', () => {
    it('should return true for empty array', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.isMinHeap([])).toBe(true)
    })

    it('should return true for single element', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.isMinHeap([1])).toBe(true)
    })

    it('should return true for a valid min-heap', () => {
      const sorter = new HeapSort4<number>()
      // [1, 3, 5, 8, 10] is a valid min-heap
      expect(sorter.isMinHeap([1, 3, 5, 8, 10])).toBe(true)
    })

    it('should return false for a non-min-heap', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.isMinHeap([10, 5, 8])).toBe(false)
    })
  })

  // ─── heapify ───
  describe('heapify (instance method)', () => {
    it('should produce a valid max-heap', () => {
      const sorter = new HeapSort4<number>()
      const result = sorter.heapify([3, 1, 4, 1, 5, 9, 2, 6])
      expect(sorter.isMaxHeap(result)).toBe(true)
    })

    it('should contain all original elements', () => {
      const sorter = new HeapSort4<number>()
      const original = [3, 1, 4, 1, 5]
      const result = sorter.heapify(original)
      expect([...result].sort()).toEqual([...original].sort())
    })

    it('should not mutate the original array', () => {
      const sorter = new HeapSort4<number>()
      const original = [3, 1, 2]
      const copy = [...original]
      sorter.heapify(original)
      expect(original).toEqual(copy)
    })
  })

  // ─── heapify (standalone function) ───
  describe('heapify (standalone)', () => {
    it('should produce a valid max-heap', () => {
      const sorter = new HeapSort4<number>()
      const result = heapify([3, 1, 4, 1, 5, 9, 2, 6])
      expect(sorter.isMaxHeap(result)).toBe(true)
    })

    it('should handle empty array', () => {
      const result = heapify([])
      expect(result).toEqual([])
    })

    it('should handle single element', () => {
      const result = heapify([42])
      expect(result).toEqual([42])
    })
  })

  // ─── Complexity Methods ───
  describe('complexity methods', () => {
    it('getTimeComplexity should return O(n log n)', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.getTimeComplexity()).toBe('O(n log n)')
    })

    it('getSpaceComplexity should return O(1)', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.getSpaceComplexity()).toBe('O(1)')
    })
  })
})
