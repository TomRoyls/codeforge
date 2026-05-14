import { describe, it, expect } from 'vitest'
import { HeapSort4, heapify } from '../src/core/heap-sort-4/index.js'

function shuffledRange(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = arr[i]!
    arr[i] = arr[j]!
    arr[j] = tmp
  }
  return arr
}

function reverseRange(n: number): number[] {
  return Array.from({ length: n }, (_, i) => n - 1 - i)
}

describe('HeapSort4', () => {
  describe('sort', () => {
    it('should return empty array for empty input', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.sort([])).toEqual([])
    })

    it('should return single element for single element input', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.sort([42])).toEqual([42])
    })

    it('should sort two elements', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.sort([2, 1])).toEqual([1, 2])
    })

    it('should sort already sorted array', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
    })

    it('should sort reverse sorted array', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
    })

    it('should sort random array', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.sort([3, 1, 4, 1, 5, 9, 2, 6])).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
    })

    it('should handle duplicates', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.sort([3, 3, 3, 1, 1, 2, 2])).toEqual([1, 1, 2, 2, 3, 3, 3])
    })

    it('should handle negative numbers', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.sort([-5, 3, -1, 0, 2])).toEqual([-5, -1, 0, 2, 3])
    })

    it('should not modify original array', () => {
      const sorter = new HeapSort4<number>()
      const original = [3, 1, 2]
      const sorted = sorter.sort(original)
      expect(original).toEqual([3, 1, 2])
      expect(sorted).toEqual([1, 2, 3])
    })

    it('should work with custom comparator', () => {
      const sorter = new HeapSort4<number>((a, b) => b - a)
      expect(sorter.sort([3, 1, 4, 1, 5])).toEqual([5, 4, 3, 1, 1])
    })

    it('should sort large array (10000 elements)', () => {
      const sorter = new HeapSort4<number>()
      const arr = shuffledRange(10000)
      const result = sorter.sort(arr)
      expect(result).toHaveLength(10000)
      expect(sorter.isSorted(result)).toBe(true)
    })

    it('should handle array of all identical elements', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.sort([5, 5, 5, 5, 5])).toEqual([5, 5, 5, 5, 5])
    })

    it('should sort floating point numbers', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.sort([3.14, 1.41, 2.72, 0.58])).toEqual([0.58, 1.41, 2.72, 3.14])
    })

    it('should handle array with one element out of order at start', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.sort([5, 1, 2, 3, 4])).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle array with one element out of order at end', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.sort([2, 3, 4, 5, 1])).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle array of zeros', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.sort([0, 0, 0, 0])).toEqual([0, 0, 0, 0])
    })
  })

  describe('sortDescending', () => {
    it('should return empty array for empty input', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.sortDescending([])).toEqual([])
    })

    it('should return single element for single element input', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.sortDescending([42])).toEqual([42])
    })

    it('should sort array in descending order', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.sortDescending([1, 2, 3, 4, 5])).toEqual([5, 4, 3, 2, 1])
    })

    it('should sort reverse sorted array (ascending)', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.sortDescending([5, 4, 3, 2, 1])).toEqual([5, 4, 3, 2, 1])
    })

    it('should handle duplicates in descending order', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.sortDescending([1, 1, 2, 2, 3, 3])).toEqual([3, 3, 2, 2, 1, 1])
    })

    it('should handle negative numbers in descending order', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.sortDescending([-5, -1, 0, 2, 3])).toEqual([3, 2, 0, -1, -5])
    })

    it('should not modify original array', () => {
      const sorter = new HeapSort4<number>()
      const original = [1, 2, 3]
      const sorted = sorter.sortDescending(original)
      expect(original).toEqual([1, 2, 3])
      expect(sorted).toEqual([3, 2, 1])
    })

    it('should work with custom comparator', () => {
      const sorter = new HeapSort4<number>((a, b) => b - a)
      expect(sorter.sortDescending([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('isSorted', () => {
    it('should return true for empty array', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.isSorted([])).toBe(true)
    })

    it('should return true for single element', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.isSorted([1])).toBe(true)
    })

    it('should return true for sorted array', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.isSorted([1, 2, 3, 4, 5])).toBe(true)
    })

    it('should return false for unsorted array', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.isSorted([3, 1, 2])).toBe(false)
    })

    it('should return true for equal elements', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.isSorted([5, 5, 5])).toBe(true)
    })

    it('should return false for reverse sorted with default comparator', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.isSorted([5, 4, 3, 2, 1])).toBe(false)
    })

    it('should return true for reverse sorted with custom comparator', () => {
      const sorter = new HeapSort4<number>((a, b) => b - a)
      expect(sorter.isSorted([5, 4, 3, 2, 1])).toBe(true)
    })

    it('should return false when last two are out of order', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.isSorted([1, 2, 3, 5, 4])).toBe(false)
    })

    it('should return false when first two are out of order', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.isSorted([2, 1, 3, 4, 5])).toBe(false)
    })

    it('should return true for equal adjacent elements', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.isSorted([1, 1, 2, 2, 3])).toBe(true)
    })
  })

  describe('partialSort', () => {
    it('should return full array when k equals length', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.partialSort([3, 1, 4, 2], 4)).toEqual([1, 2, 3, 4])
    })

    it('should return single smallest element', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.partialSort([5, 3, 1, 4, 2], 1)).toEqual([1])
    })

    it('should return two smallest elements sorted', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.partialSort([5, 3, 1, 4, 2], 2)).toEqual([1, 2])
    })

    it('should return k smallest elements sorted', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.partialSort([9, 5, 2, 7, 1, 8, 3, 6, 4], 4)).toEqual([1, 2, 3, 4])
    })

    it('should handle duplicates', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.partialSort([3, 1, 2, 1, 3, 2], 3)).toEqual([1, 1, 2])
    })

    it('should not modify original array', () => {
      const sorter = new HeapSort4<number>()
      const original = [5, 3, 1, 4, 2]
      const result = sorter.partialSort(original, 3)
      expect(original).toEqual([5, 3, 1, 4, 2])
      expect(result).toEqual([1, 2, 3])
    })

    it('should work with custom comparator', () => {
      const sorter = new HeapSort4<number>((a, b) => b - a)
      expect(sorter.partialSort([1, 5, 3, 4, 2], 3)).toEqual([5, 4, 3])
    })

    it('should handle large arrays', () => {
      const sorter = new HeapSort4<number>()
      const arr = shuffledRange(1000)
      const result = sorter.partialSort(arr, 100)
      expect(result).toHaveLength(100)
      expect(sorter.isSorted(result)).toBe(true)
    })
  })

  describe('kthSmallest', () => {
    it('should return first element when k=1', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.kthSmallest([5, 3, 1, 4, 2], 1)).toBe(1)
    })

    it('should return second element when k=2', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.kthSmallest([5, 3, 1, 4, 2], 2)).toBe(2)
    })

    it('should return median for odd length', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.kthSmallest([5, 3, 1, 4, 2], 3)).toBe(3)
    })

    it('should return largest element when k=length', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.kthSmallest([1, 2, 3, 4, 5], 5)).toBe(5)
    })

    it('should handle duplicates', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.kthSmallest([3, 1, 2, 1, 3, 2], 3)).toBe(2)
    })

    it('should throw for k=0', () => {
      const sorter = new HeapSort4<number>()
      expect(() => sorter.kthSmallest([1, 2, 3], 0)).toThrow('k must be between 1 and array length')
    })

    it('should throw for k > length', () => {
      const sorter = new HeapSort4<number>()
      expect(() => sorter.kthSmallest([1, 2, 3], 4)).toThrow('k must be between 1 and array length')
    })

    it('should not modify original array', () => {
      const sorter = new HeapSort4<number>()
      const original = [5, 3, 1, 4, 2]
      sorter.kthSmallest(original, 3)
      expect(original).toEqual([5, 3, 1, 4, 2])
    })

    it('should work with custom comparator', () => {
      const sorter = new HeapSort4<number>((a, b) => b - a)
      expect(sorter.kthSmallest([5, 1, 4, 2, 3], 2)).toBe(4)
    })

    it('should handle large arrays', () => {
      const sorter = new HeapSort4<number>()
      const arr = shuffledRange(1000)
      expect(sorter.kthSmallest(arr, 500)).toBe(499)
    })
  })

  describe('kthLargest', () => {
    it('should return first element when k=1', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.kthLargest([5, 3, 1, 4, 2], 1)).toBe(5)
    })

    it('should return second element when k=2', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.kthLargest([5, 3, 1, 4, 2], 2)).toBe(4)
    })

    it('should return median for odd length', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.kthLargest([5, 3, 1, 4, 2], 3)).toBe(3)
    })

    it('should return smallest element when k=length', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.kthLargest([1, 2, 3, 4, 5], 5)).toBe(1)
    })

    it('should handle duplicates', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.kthLargest([3, 1, 2, 1, 3, 2], 3)).toBe(2)
    })

    it('should throw for k=0', () => {
      const sorter = new HeapSort4<number>()
      expect(() => sorter.kthLargest([1, 2, 3], 0)).toThrow('k must be between 1 and array length')
    })

    it('should throw for k > length', () => {
      const sorter = new HeapSort4<number>()
      expect(() => sorter.kthLargest([1, 2, 3], 4)).toThrow('k must be between 1 and array length')
    })

    it('should not modify original array', () => {
      const sorter = new HeapSort4<number>()
      const original = [5, 3, 1, 4, 2]
      sorter.kthLargest(original, 3)
      expect(original).toEqual([5, 3, 1, 4, 2])
    })

    it('should work with custom comparator', () => {
      const sorter = new HeapSort4<number>((a, b) => b - a)
      expect(sorter.kthLargest([5, 1, 4, 2, 3], 2)).toBe(2)
    })

    it('should handle large arrays', () => {
      const sorter = new HeapSort4<number>()
      const arr = shuffledRange(1000)
      expect(sorter.kthLargest(arr, 500)).toBe(500)
    })
  })

  describe('isMaxHeap', () => {
    it('should return true for empty array', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.isMaxHeap([])).toBe(true)
    })

    it('should return true for single element', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.isMaxHeap([5])).toBe(true)
    })

    it('should return true for valid max heap', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.isMaxHeap([9, 8, 7, 5, 6, 3, 2])).toBe(true)
    })

    it('should return false for invalid max heap', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.isMaxHeap([1, 2, 3, 4, 5])).toBe(false)
    })

    it('should return true for heap with duplicates', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.isMaxHeap([5, 5, 5, 5, 5])).toBe(true)
    })

    it('should detect parent smaller than left child', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.isMaxHeap([1, 5, 3, 4, 2])).toBe(false)
    })

    it('should detect parent smaller than right child', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.isMaxHeap([1, 2, 5, 4, 3])).toBe(false)
    })

    it('should work with sorted array as heap', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.isMaxHeap([5, 4, 3, 2, 1])).toBe(true)
    })

    it('should work with custom comparator', () => {
      const sorter = new HeapSort4<number>((a, b) => b - a)
      expect(sorter.isMaxHeap([1, 2, 3, 4, 5])).toBe(true)
    })
  })

  describe('isMinHeap', () => {
    it('should return true for empty array', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.isMinHeap([])).toBe(true)
    })

    it('should return true for single element', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.isMinHeap([1])).toBe(true)
    })

    it('should return true for valid min heap', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.isMinHeap([1, 2, 3, 4, 5, 6, 7])).toBe(true)
    })

    it('should return false for invalid min heap', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.isMinHeap([5, 4, 3, 2, 1])).toBe(false)
    })

    it('should return true for heap with duplicates', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.isMinHeap([1, 1, 1, 1, 1])).toBe(true)
    })

    it('should detect parent larger than left child', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.isMinHeap([5, 1, 3, 2, 4])).toBe(false)
    })

    it('should detect parent larger than right child', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.isMinHeap([5, 2, 1, 3, 4])).toBe(false)
    })

    it.skip('should work with reverse sorted array as heap', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.isMinHeap([5, 4, 3, 2, 1])).toBe(true)
    })

    it('should work with custom comparator', () => {
      const sorter = new HeapSort4<number>((a, b) => b - a)
      expect(sorter.isMinHeap([5, 4, 3, 2, 1])).toBe(true)
    })
  })

  describe('heapify', () => {
    it('should return empty array for empty input', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.heapify([])).toEqual([])
    })

    it('should return single element for single element input', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.heapify([42])).toEqual([42])
    })

    it('should create valid max heap', () => {
      const sorter = new HeapSort4<number>()
      const result = sorter.heapify([1, 2, 3, 4, 5])
      expect(sorter.isMaxHeap(result)).toBe(true)
    })

    it('should create max heap from reverse sorted', () => {
      const sorter = new HeapSort4<number>()
      const result = sorter.heapify([5, 4, 3, 2, 1])
      expect(sorter.isMaxHeap(result)).toBe(true)
    })

    it('should create max heap from random array', () => {
      const sorter = new HeapSort4<number>()
      const result = sorter.heapify([3, 1, 4, 5, 2])
      expect(sorter.isMaxHeap(result)).toBe(true)
    })

    it('should not modify original array', () => {
      const sorter = new HeapSort4<number>()
      const original = [3, 1, 4, 5, 2]
      const result = sorter.heapify(original)
      expect(original).toEqual([3, 1, 4, 5, 2])
      expect(sorter.isMaxHeap(result)).toBe(true)
    })

    it('should work with custom comparator', () => {
      const sorter = new HeapSort4<number>((a, b) => b - a)
      const result = sorter.heapify([1, 2, 3, 4, 5])
      expect(sorter.isMaxHeap(result)).toBe(true)
    })
  })

  describe('exported heapify function', () => {
    it('should create valid max heap', () => {
      const result = heapify([1, 2, 3, 4, 5])
      const sorter = new HeapSort4<number>()
      expect(sorter.isMaxHeap(result)).toBe(true)
    })

    it('should create max heap from reverse sorted', () => {
      const result = heapify([5, 4, 3, 2, 1])
      const sorter = new HeapSort4<number>()
      expect(sorter.isMaxHeap(result)).toBe(true)
    })

    it('should not modify original array', () => {
      const original = [3, 1, 4, 5, 2]
      const result = heapify(original)
      expect(original).toEqual([3, 1, 4, 5, 2])
      const sorter = new HeapSort4<number>()
      expect(sorter.isMaxHeap(result)).toBe(true)
    })
  })

  describe('getTimeComplexity', () => {
    it('should return correct time complexity', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.getTimeComplexity()).toBe('O(n log n)')
    })

    it('should return same time complexity for custom comparator', () => {
      const sorter = new HeapSort4<number>((a, b) => b - a)
      expect(sorter.getTimeComplexity()).toBe('O(n log n)')
    })
  })

  describe('getSpaceComplexity', () => {
    it('should return correct space complexity', () => {
      const sorter = new HeapSort4<number>()
      expect(sorter.getSpaceComplexity()).toBe('O(1)')
    })

    it('should return same space complexity for custom comparator', () => {
      const sorter = new HeapSort4<number>((a, b) => b - a)
      expect(sorter.getSpaceComplexity()).toBe('O(1)')
    })
  })

  describe('integration tests', () => {
    it('sort result should pass isSorted', () => {
      const sorter = new HeapSort4<number>()
      const arr = shuffledRange(200)
      const sorted = sorter.sort(arr)
      expect(sorter.isSorted(sorted)).toBe(true)
    })

    it('sortDescending should be reverse of sort', () => {
      const sorter = new HeapSort4<number>()
      const arr = [3, 1, 4, 1, 5, 9, 2, 6]
      const ascending = sorter.sort(arr)
      const descending = sorter.sortDescending(arr)
      expect(descending).toEqual([...ascending].reverse())
    })

    it('heapify result should be valid max heap', () => {
      const sorter = new HeapSort4<number>()
      const arr = shuffledRange(100)
      const heap = sorter.heapify(arr)
      expect(sorter.isMaxHeap(heap)).toBe(true)
    })

    it('kthSmallest(k=1) should equal min element', () => {
      const sorter = new HeapSort4<number>()
      const arr = shuffledRange(100)
      const min = Math.min(...arr)
      expect(sorter.kthSmallest(arr, 1)).toBe(min)
    })

    it('kthLargest(k=1) should equal max element', () => {
      const sorter = new HeapSort4<number>()
      const arr = shuffledRange(100)
      const max = Math.max(...arr)
      expect(sorter.kthLargest(arr, 1)).toBe(max)
    })

    it('partialSort should return sorted first k elements', () => {
      const sorter = new HeapSort4<number>()
      const arr = shuffledRange(100)
      const k = 20
      const partial = sorter.partialSort(arr, k)
      expect(partial).toHaveLength(k)
      expect(sorter.isSorted(partial)).toBe(true)
    })

    it('sort and partialSort should agree on first k elements', () => {
      const sorter = new HeapSort4<number>()
      const arr = shuffledRange(50)
      const k = 10
      const full = sorter.sort(arr)
      const partial = sorter.partialSort(arr, k)
      expect(partial).toEqual(full.slice(0, k))
    })

    it('should handle array with MIN/MAX safe integers', () => {
      const sorter = new HeapSort4<number>()
      const arr = [Number.MAX_SAFE_INTEGER, 0, Number.MIN_SAFE_INTEGER, 1]
      const result = sorter.sort(arr)
      expect(result).toEqual([Number.MIN_SAFE_INTEGER, 0, 1, Number.MAX_SAFE_INTEGER])
    })

    it('should handle booleans', () => {
      const sorter = new HeapSort4<boolean>()
      const arr = [true, false, true, false]
      const result = sorter.sort(arr)
      expect(result).toEqual([false, false, true, true])
    })

    it('should sort strings correctly', () => {
      const sorter = new HeapSort4<string>()
      const arr = ['banana', 'apple', 'cherry']
      const result = sorter.sort(arr)
      expect(result).toEqual(['apple', 'banana', 'cherry'])
    })

    it.skip('sorted array should pass isMaxHeap', () => {
      const sorter = new HeapSort4<number>()
      const sorted = sorter.sort([1, 2, 3, 4, 5])
      expect(sorter.isMaxHeap(sorted)).toBe(true)
    })

    it.skip('reverse sorted array should not pass isMaxHeap', () => {
      const sorter = new HeapSort4<number>()
      const reverse = sorter.sortDescending([1, 2, 3, 4, 5])
      expect(sorter.isMaxHeap(reverse)).toBe(false)
    })
  })
})
