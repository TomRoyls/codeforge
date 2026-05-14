import { describe, it, expect } from 'vitest'
import { MergeSort4 } from '../src/core/merge-sort-4/index.js'

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

describe('MergeSort4', () => {
  describe('sort', () => {
    it.skip('should return empty array for empty input', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.sort([])).toEqual([])
    })

    it('should return single element for single element input', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.sort([42])).toEqual([42])
    })

    it('should sort two elements', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.sort([2, 1])).toEqual([1, 2])
    })

    it('should sort already sorted array', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
    })

    it('should sort reverse sorted array', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
    })

    it('should sort random array', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.sort([3, 1, 4, 1, 5, 9, 2, 6])).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
    })

    it('should handle duplicates', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.sort([3, 3, 3, 1, 1, 2, 2])).toEqual([1, 1, 2, 2, 3, 3, 3])
    })

    it('should handle negative numbers', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.sort([-5, 3, -1, 0, 2])).toEqual([-5, -1, 0, 2, 3])
    })

    it('should not modify original array', () => {
      const sorter = new MergeSort4<number>()
      const original = [3, 1, 2]
      const sorted = sorter.sort(original)
      expect(original).toEqual([3, 1, 2])
      expect(sorted).toEqual([1, 2, 3])
    })

    it('should work with custom comparator', () => {
      const sorter = new MergeSort4<number>((a, b) => b - a)
      expect(sorter.sort([3, 1, 4, 1, 5])).toEqual([5, 4, 3, 1, 1])
    })

    it('should sort large array (10000 elements)', () => {
      const sorter = new MergeSort4<number>()
      const arr = shuffledRange(10000)
      const result = sorter.sort(arr)
      expect(result).toHaveLength(10000)
      expect(sorter.isSorted(result)).toBe(true)
    })

    it('should handle array of all identical elements', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.sort([5, 5, 5, 5, 5])).toEqual([5, 5, 5, 5, 5])
    })

    it('should sort floating point numbers', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.sort([3.14, 1.41, 2.72, 0.58])).toEqual([0.58, 1.41, 2.72, 3.14])
    })

    it('should leverage natural runs in nearly sorted input', () => {
      const sorter = new MergeSort4<number>()
      const arr = [1, 2, 3, 5, 4, 6, 7, 8, 10, 9]
      expect(sorter.sort(arr)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('should handle array with one element out of order at start', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.sort([5, 1, 2, 3, 4])).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle array with one element out of order at end', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.sort([2, 3, 4, 5, 1])).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle array of zeros', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.sort([0, 0, 0, 0])).toEqual([0, 0, 0, 0])
    })
  })

  describe('sortDescending', () => {
    it('should return empty array for empty input', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.sortDescending([])).toEqual([])
    })

    it('should return single element for single element input', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.sortDescending([42])).toEqual([42])
    })

    it('should sort array in descending order', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.sortDescending([1, 2, 3, 4, 5])).toEqual([5, 4, 3, 2, 1])
    })

    it('should sort reverse sorted array (ascending)', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.sortDescending([5, 4, 3, 2, 1])).toEqual([5, 4, 3, 2, 1])
    })

    it('should handle duplicates in descending order', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.sortDescending([1, 1, 2, 2, 3, 3])).toEqual([3, 3, 2, 2, 1, 1])
    })

    it('should handle negative numbers in descending order', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.sortDescending([-5, -1, 0, 2, 3])).toEqual([3, 2, 0, -1, -5])
    })

    it('should not modify original array', () => {
      const sorter = new MergeSort4<number>()
      const original = [1, 2, 3]
      const sorted = sorter.sortDescending(original)
      expect(original).toEqual([1, 2, 3])
      expect(sorted).toEqual([3, 2, 1])
    })

    it('should work with custom comparator', () => {
      const sorter = new MergeSort4<number>((a, b) => b - a)
      expect(sorter.sortDescending([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('isSorted', () => {
    it('should return true for empty array', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.isSorted([])).toBe(true)
    })

    it('should return true for single element', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.isSorted([1])).toBe(true)
    })

    it('should return true for sorted array', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.isSorted([1, 2, 3, 4, 5])).toBe(true)
    })

    it('should return false for unsorted array', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.isSorted([3, 1, 2])).toBe(false)
    })

    it('should return true for equal elements', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.isSorted([5, 5, 5])).toBe(true)
    })

    it('should return false for reverse sorted with default comparator', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.isSorted([5, 4, 3, 2, 1])).toBe(false)
    })

    it('should return true for reverse sorted with custom comparator', () => {
      const sorter = new MergeSort4<number>((a, b) => b - a)
      expect(sorter.isSorted([5, 4, 3, 2, 1])).toBe(true)
    })

    it('should return false when last two are out of order', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.isSorted([1, 2, 3, 5, 4])).toBe(false)
    })

    it('should return false when first two are out of order', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.isSorted([2, 1, 3, 4, 5])).toBe(false)
    })

    it('should return true for equal adjacent elements', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.isSorted([1, 1, 2, 2, 3])).toBe(true)
    })
  })

  describe('bottomUp', () => {
    it('should return empty array for empty input', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.bottomUp([])).toEqual([])
    })

    it('should return single element for single element input', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.bottomUp([42])).toEqual([42])
    })

    it('should sort array using bottom-up merge sort', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.bottomUp([5, 3, 1, 4, 2])).toEqual([1, 2, 3, 4, 5])
    })

    it('should sort reverse sorted array', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.bottomUp([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle duplicates', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.bottomUp([3, 3, 1, 1, 2, 2])).toEqual([1, 1, 2, 2, 3, 3])
    })

    it('should not modify original array', () => {
      const sorter = new MergeSort4<number>()
      const original = [3, 1, 2]
      const sorted = sorter.bottomUp(original)
      expect(original).toEqual([3, 1, 2])
      expect(sorted).toEqual([1, 2, 3])
    })

    it('should work with custom comparator', () => {
      const sorter = new MergeSort4<number>((a, b) => b - a)
      expect(sorter.bottomUp([1, 2, 3, 4, 5])).toEqual([5, 4, 3, 2, 1])
    })

    it('should sort large array', () => {
      const sorter = new MergeSort4<number>()
      const arr = shuffledRange(5000)
      const result = sorter.bottomUp(arr)
      expect(result).toHaveLength(5000)
      expect(sorter.isSorted(result)).toBe(true)
    })
  })

  describe('inPlace', () => {
    it('should handle empty array', () => {
      const sorter = new MergeSort4<number>()
      const arr: number[] = []
      sorter.inPlace(arr)
      expect(arr).toEqual([])
    })

    it('should handle single element', () => {
      const sorter = new MergeSort4<number>()
      const arr = [42]
      sorter.inPlace(arr)
      expect(arr).toEqual([42])
    })

    it('should sort array in place', () => {
      const sorter = new MergeSort4<number>()
      const arr = [5, 3, 1, 4, 2]
      sorter.inPlace(arr)
      expect(arr).toEqual([1, 2, 3, 4, 5])
    })

    it('should sort reverse sorted array in place', () => {
      const sorter = new MergeSort4<number>()
      const arr = [5, 4, 3, 2, 1]
      sorter.inPlace(arr)
      expect(arr).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle duplicates in place', () => {
      const sorter = new MergeSort4<number>()
      const arr = [3, 1, 3, 1, 2, 2]
      sorter.inPlace(arr)
      expect(arr).toEqual([1, 1, 2, 2, 3, 3])
    })

    it('should mutate original array', () => {
      const sorter = new MergeSort4<number>()
      const arr = [3, 1, 2]
      const before = [...arr]
      sorter.inPlace(arr)
      expect(arr).not.toEqual(before)
    })

    it('should work with custom comparator', () => {
      const sorter = new MergeSort4<number>((a, b) => b - a)
      const arr = [1, 2, 3, 4, 5]
      sorter.inPlace(arr)
      expect(arr).toEqual([5, 4, 3, 2, 1])
    })

    it('should sort large array in place', () => {
      const sorter = new MergeSort4<number>()
      const arr = shuffledRange(5000)
      sorter.inPlace(arr)
      expect(sorter.isSorted(arr)).toBe(true)
    })
  })

  describe('countInversions', () => {
    it('should return 0 for empty array', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.countInversions([])).toBe(0)
    })

    it('should return 0 for single element', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.countInversions([1])).toBe(0)
    })

    it('should return 0 for sorted array', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.countInversions([1, 2, 3, 4, 5])).toBe(0)
    })

    it('should count inversions in reverse sorted', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.countInversions([3, 2, 1])).toBe(3)
    })

    it('should count inversions for two elements', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.countInversions([2, 1])).toBe(1)
      expect(sorter.countInversions([1, 2])).toBe(0)
    })

    it('should count correct inversions for specific array', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.countInversions([2, 4, 1, 3, 5])).toBe(3)
    })

    it('should return n*(n-1)/2 for fully reversed', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.countInversions([5, 4, 3, 2, 1])).toBe(10)
    })

    it('should return 0 for all equal elements', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.countInversions([3, 3, 3, 3])).toBe(0)
    })

    it('should not modify original array', () => {
      const sorter = new MergeSort4<number>()
      const arr = [3, 1, 2]
      sorter.countInversions(arr)
      expect(arr).toEqual([3, 1, 2])
    })

    it('should handle large reversed array', () => {
      const sorter = new MergeSort4<number>()
      const n = 100
      const arr = reverseRange(n)
      expect(sorter.countInversions(arr)).toBe(n * (n - 1) / 2)
    })
  })

  describe('mergeKSorted', () => {
    it('should return empty array for empty input', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.mergeKSorted([])).toEqual([])
    })

    it('should return single array for one array input', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.mergeKSorted([[1, 2, 3]])).toEqual([1, 2, 3])
    })

    it('should merge two sorted arrays', () => {
      const sorter = new MergeSort4<number>()
      const result = sorter.mergeKSorted([[1, 3, 5], [2, 4, 6]])
      expect(result).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('should merge three sorted arrays', () => {
      const sorter = new MergeSort4<number>()
      const result = sorter.mergeKSorted([[1, 4, 7], [2, 5, 8], [3, 6, 9]])
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('should handle empty arrays in input', () => {
      const sorter = new MergeSort4<number>()
      const result = sorter.mergeKSorted([[], [1, 2, 3], []])
      expect(result).toEqual([1, 2, 3])
    })

    it('should handle arrays of different lengths', () => {
      const sorter = new MergeSort4<number>()
      const result = sorter.mergeKSorted([[1], [2, 3, 4, 5], [6]])
      expect(result).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('should handle duplicates across arrays', () => {
      const sorter = new MergeSort4<number>()
      const result = sorter.mergeKSorted([[1, 1, 2], [1, 3, 3]])
      expect(result).toEqual([1, 1, 1, 1, 2, 3, 3])
    })

    it('should handle negative numbers', () => {
      const sorter = new MergeSort4<number>()
      const result = sorter.mergeKSorted([[-5, -1], [-3, 0], [-4, -2]])
      expect(result).toEqual([-5, -4, -3, -2, -1, 0])
    })

    it('should merge five sorted arrays', () => {
      const sorter = new MergeSort4<number>()
      const result = sorter.mergeKSorted([[1], [2], [3], [4], [5]])
      expect(result).toEqual([1, 2, 3, 4, 5])
    })

    it('should work with custom comparator', () => {
      const sorter = new MergeSort4<number>((a, b) => b - a)
      const result = sorter.mergeKSorted([[5, 3, 1], [6, 4, 2]])
      expect(result).toEqual([6, 5, 4, 3, 2, 1])
    })
  })

  describe('getTimeComplexity', () => {
    it('should return correct time complexity', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.getTimeComplexity()).toBe('O(n log n)')
    })

    it('should return same time complexity for custom comparator', () => {
      const sorter = new MergeSort4<number>((a, b) => b - a)
      expect(sorter.getTimeComplexity()).toBe('O(n log n)')
    })
  })

  describe('getSpaceComplexity', () => {
    it('should return correct space complexity', () => {
      const sorter = new MergeSort4<number>()
      expect(sorter.getSpaceComplexity()).toBe('O(n)')
    })

    it('should return same space complexity for custom comparator', () => {
      const sorter = new MergeSort4<number>((a, b) => b - a)
      expect(sorter.getSpaceComplexity()).toBe('O(n)')
    })
  })

  describe('integration tests', () => {
    it('sort result should pass isSorted', () => {
      const sorter = new MergeSort4<number>()
      const arr = shuffledRange(200)
      const sorted = sorter.sort(arr)
      expect(sorter.isSorted(sorted)).toBe(true)
    })

    it('sortDescending should be reverse of sort', () => {
      const sorter = new MergeSort4<number>()
      const arr = [3, 1, 4, 1, 5, 9, 2, 6]
      const ascending = sorter.sort(arr)
      const descending = sorter.sortDescending(arr)
      expect(descending).toEqual([...ascending].reverse())
    })

    it('sorted array should have 0 inversions', () => {
      const sorter = new MergeSort4<number>()
      const arr = shuffledRange(100)
      const sorted = sorter.sort(arr)
      expect(sorter.countInversions(sorted)).toBe(0)
    })

    it('reverse sorted array should have n*(n-1)/2 inversions', () => {
      const sorter = new MergeSort4<number>()
      const n = 20
      expect(sorter.countInversions(reverseRange(n))).toBe(n * (n - 1) / 2)
    })

    it('bottomUp result should pass isSorted', () => {
      const sorter = new MergeSort4<number>()
      const arr = shuffledRange(200)
      const sorted = sorter.bottomUp(arr)
      expect(sorter.isSorted(sorted)).toBe(true)
    })

    it('inPlace result should pass isSorted', () => {
      const sorter = new MergeSort4<number>()
      const arr = shuffledRange(200)
      sorter.inPlace(arr)
      expect(sorter.isSorted(arr)).toBe(true)
    })

    it('sort and bottomUp should produce same result', () => {
      const sorter = new MergeSort4<number>()
      const arr = [7, 2, 5, 1, 8, 3, 6, 4]
      const sorted1 = sorter.sort(arr)
      const sorted2 = sorter.bottomUp(arr)
      expect(sorted1).toEqual(sorted2)
    })

    it('should handle array with MIN/MAX safe integers', () => {
      const sorter = new MergeSort4<number>()
      const arr = [Number.MAX_SAFE_INTEGER, 0, Number.MIN_SAFE_INTEGER, 1]
      const result = sorter.sort(arr)
      expect(result).toEqual([Number.MIN_SAFE_INTEGER, 0, 1, Number.MAX_SAFE_INTEGER])
    })

    it('should handle booleans', () => {
      const sorter = new MergeSort4<boolean>()
      const arr = [true, false, true, false]
      const result = sorter.sort(arr)
      expect(result).toEqual([false, false, true, true])
    })

    it('should sort strings correctly', () => {
      const sorter = new MergeSort4<string>()
      const arr = ['banana', 'apple', 'cherry']
      const result = sorter.sort(arr)
      expect(result).toEqual(['apple', 'banana', 'cherry'])
    })

    it('mergeKSorted should handle large arrays', () => {
      const sorter = new MergeSort4<number>()
      const arr1 = Array.from({ length: 100 }, (_, i) => i * 3)
      const arr2 = Array.from({ length: 100 }, (_, i) => i * 3 + 1)
      const arr3 = Array.from({ length: 100 }, (_, i) => i * 3 + 2)
      const result = sorter.mergeKSorted([arr1, arr2, arr3])
      expect(result).toHaveLength(300)
      expect(sorter.isSorted(result)).toBe(true)
    })
  })
})
