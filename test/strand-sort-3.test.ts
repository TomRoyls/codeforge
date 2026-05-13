import { describe, it, expect } from 'vitest'
import { StrandSort3 } from '../src/core/strand-sort-3/index.js'

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

describe('StrandSort3', () => {
  describe('sort', () => {
    it('should return empty array for empty input', () => {
      const sorter = new StrandSort3<number>()
      expect(sorter.sort([])).toEqual([])
    })

    it('should return single element for single element input', () => {
      const sorter = new StrandSort3<number>()
      expect(sorter.sort([42])).toEqual([42])
    })

    it('should sort two elements', () => {
      const sorter = new StrandSort3<number>()
      expect(sorter.sort([2, 1])).toEqual([1, 2])
    })

    it('should sort already sorted array', () => {
      const sorter = new StrandSort3<number>()
      expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
    })

    it('should sort reverse sorted array', () => {
      const sorter = new StrandSort3<number>()
      expect(sorter.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
    })

    it('should sort random array', () => {
      const sorter = new StrandSort3<number>()
      expect(sorter.sort([3, 1, 4, 1, 5, 9, 2, 6])).toEqual([
        1,
        1,
        2,
        3,
        4,
        5,
        6,
        9,
      ])
    })

    it('should handle duplicates', () => {
      const sorter = new StrandSort3<number>()
      expect(sorter.sort([3, 3, 3, 1, 1, 2, 2])).toEqual([
        1,
        1,
        2,
        2,
        3,
        3,
        3,
      ])
    })

    it('should handle negative numbers', () => {
      const sorter = new StrandSort3<number>()
      expect(sorter.sort([-5, 3, -1, 0, 2])).toEqual([-5, -1, 0, 2, 3])
    })

    it('should not modify original array', () => {
      const sorter = new StrandSort3<number>()
      const original = [3, 1, 2]
      const sorted = sorter.sort(original)
      expect(original).toEqual([3, 1, 2])
      expect(sorted).toEqual([1, 2, 3])
    })

    it('should work with custom comparator', () => {
      const sorter = new StrandSort3<number>((a, b) => b - a)
      expect(sorter.sort([3, 1, 4, 1, 5])).toEqual([5, 4, 3, 1, 1])
    })

    it('should sort medium array (500 elements)', () => {
      const sorter = new StrandSort3<number>()
      const arr = shuffledRange(500)
      const result = sorter.sort(arr)
      expect(result).toHaveLength(500)
      expect(sorter.isSorted(result)).toBe(true)
    })

    it('should handle array of all identical elements', () => {
      const sorter = new StrandSort3<number>()
      expect(sorter.sort([5, 5, 5, 5, 5])).toEqual([5, 5, 5, 5, 5])
    })

    it('should sort floating point numbers', () => {
      const sorter = new StrandSort3<number>()
      expect(sorter.sort([3.14, 1.41, 2.72, 0.58])).toEqual([
        0.58,
        1.41,
        2.72,
        3.14,
      ])
    })

    it('should handle nearly sorted input efficiently', () => {
      const sorter = new StrandSort3<number>()
      const arr = [1, 2, 3, 5, 4, 6, 7, 8, 10, 9]
      expect(sorter.sort(arr)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('should handle array with one element out of order at start', () => {
      const sorter = new StrandSort3<number>()
      expect(sorter.sort([5, 1, 2, 3, 4])).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle array with one element out of order at end', () => {
      const sorter = new StrandSort3<number>()
      expect(sorter.sort([2, 3, 4, 5, 1])).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle array of zeros', () => {
      const sorter = new StrandSort3<number>()
      expect(sorter.sort([0, 0, 0, 0])).toEqual([0, 0, 0, 0])
    })
  })

  describe('sortDescending', () => {
    it('should return empty array for empty input', () => {
      const sorter = new StrandSort3<number>()
      expect(sorter.sortDescending([])).toEqual([])
    })

    it('should return single element for single element input', () => {
      const sorter = new StrandSort3<number>()
      expect(sorter.sortDescending([42])).toEqual([42])
    })

    it('should sort array in descending order', () => {
      const sorter = new StrandSort3<number>()
      expect(sorter.sortDescending([1, 2, 3, 4, 5])).toEqual([5, 4, 3, 2, 1])
    })

    it('should sort reverse sorted array (ascending)', () => {
      const sorter = new StrandSort3<number>()
      expect(sorter.sortDescending([5, 4, 3, 2, 1])).toEqual([5, 4, 3, 2, 1])
    })

    it('should handle duplicates in descending order', () => {
      const sorter = new StrandSort3<number>()
      expect(sorter.sortDescending([1, 1, 2, 2, 3, 3])).toEqual([
        3,
        3,
        2,
        2,
        1,
        1,
      ])
    })

    it('should handle negative numbers in descending order', () => {
      const sorter = new StrandSort3<number>()
      expect(sorter.sortDescending([-5, -1, 0, 2, 3])).toEqual([
        3,
        2,
        0,
        -1,
        -5,
      ])
    })

    it('should not modify original array', () => {
      const sorter = new StrandSort3<number>()
      const original = [1, 2, 3]
      const sorted = sorter.sortDescending(original)
      expect(original).toEqual([1, 2, 3])
      expect(sorted).toEqual([3, 2, 1])
    })

    it('should work with custom comparator', () => {
      const sorter = new StrandSort3<number>((a, b) => b - a)
      expect(sorter.sortDescending([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('isSorted', () => {
    it('should return true for empty array', () => {
      const sorter = new StrandSort3<number>()
      expect(sorter.isSorted([])).toBe(true)
    })

    it('should return true for single element', () => {
      const sorter = new StrandSort3<number>()
      expect(sorter.isSorted([1])).toBe(true)
    })

    it('should return true for sorted array', () => {
      const sorter = new StrandSort3<number>()
      expect(sorter.isSorted([1, 2, 3, 4, 5])).toBe(true)
    })

    it('should return false for unsorted array', () => {
      const sorter = new StrandSort3<number>()
      expect(sorter.isSorted([3, 1, 2])).toBe(false)
    })

    it('should return true for equal elements', () => {
      const sorter = new StrandSort3<number>()
      expect(sorter.isSorted([5, 5, 5])).toBe(true)
    })

    it('should return false for reverse sorted with default comparator', () => {
      const sorter = new StrandSort3<number>()
      expect(sorter.isSorted([5, 4, 3, 2, 1])).toBe(false)
    })

    it('should return true for reverse sorted with custom comparator', () => {
      const sorter = new StrandSort3<number>((a, b) => b - a)
      expect(sorter.isSorted([5, 4, 3, 2, 1])).toBe(true)
    })

    it('should return false when last two are out of order', () => {
      const sorter = new StrandSort3<number>()
      expect(sorter.isSorted([1, 2, 3, 5, 4])).toBe(false)
    })

    it('should return false when first two are out of order', () => {
      const sorter = new StrandSort3<number>()
      expect(sorter.isSorted([2, 1, 3, 4, 5])).toBe(false)
    })

    it('should return true for equal adjacent elements', () => {
      const sorter = new StrandSort3<number>()
      expect(sorter.isSorted([1, 1, 2, 2, 3])).toBe(true)
    })
  })

  describe('getStrandCount', () => {
    it('should return 0 for empty array', () => {
      const sorter = new StrandSort3<number>()
      sorter.sort([])
      expect(sorter.getStrandCount()).toBe(0)
    })

    it('should return 1 for single element', () => {
      const sorter = new StrandSort3<number>()
      sorter.sort([42])
      expect(sorter.getStrandCount()).toBe(1)
    })

    it('should return 1 for already sorted array', () => {
      const sorter = new StrandSort3<number>()
      sorter.sort([1, 2, 3, 4, 5])
      expect(sorter.getStrandCount()).toBe(1)
    })

    it('should return n for reverse sorted array', () => {
      const sorter = new StrandSort3<number>()
      sorter.sort([5, 4, 3, 2, 1])
      expect(sorter.getStrandCount()).toBe(5)
    })

    it('should return appropriate count for random array', () => {
      const sorter = new StrandSort3<number>()
      sorter.sort([3, 1, 4, 1, 5])
      expect(sorter.getStrandCount()).toBeGreaterThan(0)
    })

    it('should reset count on new sort', () => {
      const sorter = new StrandSort3<number>()
      sorter.sort([5, 4, 3, 2, 1])
      sorter.sort([1, 2, 3, 4, 5])
      expect(sorter.getStrandCount()).toBe(1)
    })
  })

  describe('getMergeCount', () => {
    it('should return 0 for empty array', () => {
      const sorter = new StrandSort3<number>()
      sorter.sort([])
      expect(sorter.getMergeCount()).toBe(0)
    })

    it('should return 0 for single element', () => {
      const sorter = new StrandSort3<number>()
      sorter.sort([42])
      expect(sorter.getMergeCount()).toBe(0)
    })

    it('should return 0 for already sorted array', () => {
      const sorter = new StrandSort3<number>()
      sorter.sort([1, 2, 3, 4, 5])
      expect(sorter.getMergeCount()).toBe(0)
    })

    it('should return appropriate count for reverse sorted array', () => {
      const sorter = new StrandSort3<number>()
      sorter.sort([5, 4, 3, 2, 1])
      expect(sorter.getMergeCount()).toBe(4)
    })

    it('should return appropriate count for random array', () => {
      const sorter = new StrandSort3<number>()
      sorter.sort([3, 1, 4, 1, 5])
      expect(sorter.getMergeCount()).toBeGreaterThan(0)
    })

    it('should reset count on new sort', () => {
      const sorter = new StrandSort3<number>()
      sorter.sort([5, 4, 3, 2, 1])
      sorter.sort([1, 2, 3, 4, 5])
      expect(sorter.getMergeCount()).toBe(0)
    })
  })

  describe('getTimeComplexity', () => {
    it('should return correct time complexity', () => {
      const sorter = new StrandSort3<number>()
      expect(sorter.getTimeComplexity()).toBe('O(n²) worst, O(n) best')
    })

    it('should return same time complexity for custom comparator', () => {
      const sorter = new StrandSort3<number>((a, b) => b - a)
      expect(sorter.getTimeComplexity()).toBe('O(n²) worst, O(n) best')
    })
  })

  describe('getSpaceComplexity', () => {
    it('should return correct space complexity', () => {
      const sorter = new StrandSort3<number>()
      expect(sorter.getSpaceComplexity()).toBe('O(n)')
    })

    it('should return same space complexity for custom comparator', () => {
      const sorter = new StrandSort3<number>((a, b) => b - a)
      expect(sorter.getSpaceComplexity()).toBe('O(n)')
    })
  })

  describe('integration tests', () => {
    it('sort result should pass isSorted', () => {
      const sorter = new StrandSort3<number>()
      const arr = shuffledRange(100)
      const sorted = sorter.sort(arr)
      expect(sorter.isSorted(sorted)).toBe(true)
    })

    it('sortDescending should be reverse of sort', () => {
      const sorter = new StrandSort3<number>()
      const arr = [3, 1, 4, 1, 5, 9, 2, 6]
      const ascending = sorter.sort(arr)
      const descending = sorter.sortDescending(arr)
      expect(descending).toEqual([...ascending].reverse())
    })

    it('sorted array should have 0 merges', () => {
      const sorter = new StrandSort3<number>()
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      sorter.sort(arr)
      expect(sorter.getMergeCount()).toBe(0)
      expect(sorter.getStrandCount()).toBe(1)
    })

    it('reverse sorted array should have n-1 merges', () => {
      const sorter = new StrandSort3<number>()
      const n = 10
      const arr = reverseRange(n)
      sorter.sort(arr)
      expect(sorter.getMergeCount()).toBe(n - 1)
      expect(sorter.getStrandCount()).toBe(n)
    })

    it('should handle array with MIN/MAX safe integers', () => {
      const sorter = new StrandSort3<number>()
      const arr = [Number.MAX_SAFE_INTEGER, 0, Number.MIN_SAFE_INTEGER, 1]
      const result = sorter.sort(arr)
      expect(result).toEqual([
        Number.MIN_SAFE_INTEGER,
        0,
        1,
        Number.MAX_SAFE_INTEGER,
      ])
    })

    it('should handle booleans', () => {
      const sorter = new StrandSort3<boolean>()
      const arr = [true, false, true, false]
      const result = sorter.sort(arr)
      expect(result).toEqual([false, false, true, true])
    })

    it('should sort strings correctly', () => {
      const sorter = new StrandSort3<string>()
      const arr = ['banana', 'apple', 'cherry']
      const result = sorter.sort(arr)
      expect(result).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should handle alternating pattern efficiently', () => {
      const sorter = new StrandSort3<number>()
      const arr = [1, 10, 2, 9, 3, 8, 4, 7, 5, 6]
      const result = sorter.sort(arr)
      expect(sorter.isSorted(result)).toBe(true)
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('should handle large random array', () => {
      const sorter = new StrandSort3<number>()
      const arr = shuffledRange(300)
      const result = sorter.sort(arr)
      expect(result).toHaveLength(300)
      expect(sorter.isSorted(result)).toBe(true)
    })
  })
})
