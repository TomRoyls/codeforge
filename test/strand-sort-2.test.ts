import { describe, it, expect } from 'vitest'
import { StrandSort2 } from '../src/core/strand-sort-2/index.js'

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

describe('StrandSort2', () => {
  describe('sort', () => {
    it('should return empty array for empty input', () => {
      expect(StrandSort2.sort([])).toEqual([])
    })

    it('should return single element for single element input', () => {
      expect(StrandSort2.sort([42])).toEqual([42])
    })

    it('should sort two elements', () => {
      expect(StrandSort2.sort([2, 1])).toEqual([1, 2])
    })

    it('should sort already sorted array', () => {
      expect(StrandSort2.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
    })

    it('should sort reverse sorted array', () => {
      expect(StrandSort2.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
    })

    it('should sort random array', () => {
      expect(StrandSort2.sort([3, 1, 4, 1, 5, 9, 2, 6])).toEqual([
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
      expect(StrandSort2.sort([3, 3, 3, 1, 1, 2, 2])).toEqual([
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
      expect(StrandSort2.sort([-5, 3, -1, 0, 2])).toEqual([-5, -1, 0, 2, 3])
    })

    it('should not modify original array', () => {
      const original = [3, 1, 2]
      const sorted = StrandSort2.sort(original)
      expect(original).toEqual([3, 1, 2])
      expect(sorted).toEqual([1, 2, 3])
    })

    it('should sort medium array (500 elements)', () => {
      const arr = shuffledRange(500)
      const result = StrandSort2.sort(arr)
      expect(result).toHaveLength(500)
      expect(StrandSort2.isSorted(result)).toBe(true)
    })

    it('should handle array of all identical elements', () => {
      expect(StrandSort2.sort([5, 5, 5, 5, 5])).toEqual([5, 5, 5, 5, 5])
    })

    it('should sort floating point numbers', () => {
      expect(StrandSort2.sort([3.14, 1.41, 2.72, 0.58])).toEqual([
        0.58,
        1.41,
        2.72,
        3.14,
      ])
    })

    it('should handle nearly sorted input efficiently', () => {
      const arr = [1, 2, 3, 5, 4, 6, 7, 8, 10, 9]
      expect(StrandSort2.sort(arr)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('should handle array with one element out of order at start', () => {
      expect(StrandSort2.sort([5, 1, 2, 3, 4])).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle array with one element out of order at end', () => {
      expect(StrandSort2.sort([2, 3, 4, 5, 1])).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle array of zeros', () => {
      expect(StrandSort2.sort([0, 0, 0, 0])).toEqual([0, 0, 0, 0])
    })

    it('should sort array with alternating high and low values', () => {
      expect(StrandSort2.sort([10, 1, 9, 2, 8, 3, 7, 4, 6, 5])).toEqual([
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
      ])
    })

    it('should handle MIN and MAX safe integers', () => {
      const arr = [Number.MAX_SAFE_INTEGER, 0, Number.MIN_SAFE_INTEGER, 1]
      const result = StrandSort2.sort(arr)
      expect(result).toEqual([
        Number.MIN_SAFE_INTEGER,
        0,
        1,
        Number.MAX_SAFE_INTEGER,
      ])
    })
  })

  describe('sortDescending', () => {
    it('should return empty array for empty input', () => {
      expect(StrandSort2.sortDescending([])).toEqual([])
    })

    it('should return single element for single element input', () => {
      expect(StrandSort2.sortDescending([42])).toEqual([42])
    })

    it('should sort array in descending order', () => {
      expect(StrandSort2.sortDescending([1, 2, 3, 4, 5])).toEqual([5, 4, 3, 2, 1])
    })

    it('should sort reverse sorted array (ascending)', () => {
      expect(StrandSort2.sortDescending([5, 4, 3, 2, 1])).toEqual([5, 4, 3, 2, 1])
    })

    it('should handle duplicates in descending order', () => {
      expect(StrandSort2.sortDescending([1, 1, 2, 2, 3, 3])).toEqual([
        3,
        3,
        2,
        2,
        1,
        1,
      ])
    })

    it('should handle negative numbers in descending order', () => {
      expect(StrandSort2.sortDescending([-5, -1, 0, 2, 3])).toEqual([
        3,
        2,
        0,
        -1,
        -5,
      ])
    })

    it('should not modify original array', () => {
      const original = [1, 2, 3]
      const sorted = StrandSort2.sortDescending(original)
      expect(original).toEqual([1, 2, 3])
      expect(sorted).toEqual([3, 2, 1])
    })

    it('should sort floating point numbers in descending order', () => {
      expect(StrandSort2.sortDescending([3.14, 1.41, 2.72, 0.58])).toEqual([
        3.14,
        2.72,
        1.41,
        0.58,
      ])
    })

    it('should handle array with one element out of order at start', () => {
      expect(StrandSort2.sortDescending([1, 5, 4, 3, 2])).toEqual([5, 4, 3, 2, 1])
    })

    it('should handle array with one element out of order at end', () => {
      expect(StrandSort2.sortDescending([5, 4, 3, 2, 1])).toEqual([5, 4, 3, 2, 1])
    })

    it('should handle array of zeros', () => {
      expect(StrandSort2.sortDescending([0, 0, 0, 0])).toEqual([0, 0, 0, 0])
    })
  })

  describe('isSorted', () => {
    it('should return true for empty array', () => {
      expect(StrandSort2.isSorted([])).toBe(true)
    })

    it('should return true for single element', () => {
      expect(StrandSort2.isSorted([1])).toBe(true)
    })

    it('should return true for sorted array', () => {
      expect(StrandSort2.isSorted([1, 2, 3, 4, 5])).toBe(true)
    })

    it('should return false for unsorted array', () => {
      expect(StrandSort2.isSorted([3, 1, 2])).toBe(false)
    })

    it('should return true for equal elements', () => {
      expect(StrandSort2.isSorted([5, 5, 5])).toBe(true)
    })

    it('should return false for reverse sorted', () => {
      expect(StrandSort2.isSorted([5, 4, 3, 2, 1])).toBe(false)
    })

    it('should return false when last two are out of order', () => {
      expect(StrandSort2.isSorted([1, 2, 3, 5, 4])).toBe(false)
    })

    it('should return false when first two are out of order', () => {
      expect(StrandSort2.isSorted([2, 1, 3, 4, 5])).toBe(false)
    })

    it('should return true for equal adjacent elements', () => {
      expect(StrandSort2.isSorted([1, 1, 2, 2, 3])).toBe(true)
    })

    it('should return true for array with negative numbers sorted', () => {
      expect(StrandSort2.isSorted([-5, -1, 0, 2, 3])).toBe(true)
    })

    it('should return false for array with negative numbers unsorted', () => {
      expect(StrandSort2.isSorted([3, -5, -1, 0, 2])).toBe(false)
    })
  })

  describe('sortInstance', () => {
    it('should return empty array for empty input', () => {
      const sorter = new StrandSort2()
      expect(sorter.sortInstance([])).toEqual([])
    })

    it('should return single element for single element input', () => {
      const sorter = new StrandSort2()
      expect(sorter.sortInstance([42])).toEqual([42])
    })

    it('should sort two elements', () => {
      const sorter = new StrandSort2()
      expect(sorter.sortInstance([2, 1])).toEqual([1, 2])
    })

    it('should sort already sorted array', () => {
      const sorter = new StrandSort2()
      expect(sorter.sortInstance([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
    })

    it('should sort reverse sorted array', () => {
      const sorter = new StrandSort2()
      expect(sorter.sortInstance([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
    })

    it('should sort random array', () => {
      const sorter = new StrandSort2()
      expect(sorter.sortInstance([3, 1, 4, 1, 5, 9, 2, 6])).toEqual([
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
      const sorter = new StrandSort2()
      expect(sorter.sortInstance([3, 3, 3, 1, 1, 2, 2])).toEqual([
        1,
        1,
        2,
        2,
        3,
        3,
        3,
      ])
    })

    it('should not modify original array', () => {
      const sorter = new StrandSort2()
      const original = [3, 1, 2]
      const sorted = sorter.sortInstance(original)
      expect(original).toEqual([3, 1, 2])
      expect(sorted).toEqual([1, 2, 3])
    })

    it('should sort medium array (500 elements)', () => {
      const sorter = new StrandSort2()
      const arr = shuffledRange(500)
      const result = sorter.sortInstance(arr)
      expect(result).toHaveLength(500)
      expect(StrandSort2.isSorted(result)).toBe(true)
    })

    it('should handle array of all identical elements', () => {
      const sorter = new StrandSort2()
      expect(sorter.sortInstance([5, 5, 5, 5, 5])).toEqual([5, 5, 5, 5, 5])
    })

    it('should sort floating point numbers', () => {
      const sorter = new StrandSort2()
      expect(sorter.sortInstance([3.14, 1.41, 2.72, 0.58])).toEqual([
        0.58,
        1.41,
        2.72,
        3.14,
      ])
    })

    it('should handle negative numbers', () => {
      const sorter = new StrandSort2()
      expect(sorter.sortInstance([-5, 3, -1, 0, 2])).toEqual([-5, -1, 0, 2, 3])
    })

    it('should handle array of zeros', () => {
      const sorter = new StrandSort2()
      expect(sorter.sortInstance([0, 0, 0, 0])).toEqual([0, 0, 0, 0])
    })
  })

  describe('integration tests', () => {
    it('sort result should pass isSorted', () => {
      const arr = shuffledRange(100)
      const sorted = StrandSort2.sort(arr)
      expect(StrandSort2.isSorted(sorted)).toBe(true)
    })

    it('sortInstance result should pass isSorted', () => {
      const arr = shuffledRange(100)
      const sorter = new StrandSort2()
      const sorted = sorter.sortInstance(arr)
      expect(StrandSort2.isSorted(sorted)).toBe(true)
    })

    it('sortDescending should be reverse of sort', () => {
      const arr = [3, 1, 4, 1, 5, 9, 2, 6]
      const ascending = StrandSort2.sort(arr)
      const descending = StrandSort2.sortDescending(arr)
      expect(descending).toEqual([...ascending].reverse())
    })

    it('sorted array should be stable', () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const result = StrandSort2.sort(arr)
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('reverse sorted array should handle correctly', () => {
      const n = 10
      const arr = reverseRange(n)
      const result = StrandSort2.sort(arr)
      expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('should handle array with MIN/MAX safe integers', () => {
      const arr = [Number.MAX_SAFE_INTEGER, 0, Number.MIN_SAFE_INTEGER, 1]
      const result = StrandSort2.sort(arr)
      expect(result).toEqual([
        Number.MIN_SAFE_INTEGER,
        0,
        1,
        Number.MAX_SAFE_INTEGER,
      ])
    })

    it('should handle alternating pattern efficiently', () => {
      const arr = [1, 10, 2, 9, 3, 8, 4, 7, 5, 6]
      const result = StrandSort2.sort(arr)
      expect(StrandSort2.isSorted(result)).toBe(true)
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('should handle large random array', () => {
      const arr = shuffledRange(300)
      const result = StrandSort2.sort(arr)
      expect(result).toHaveLength(300)
      expect(StrandSort2.isSorted(result)).toBe(true)
    })

    it('sort and sortInstance should produce same result', () => {
      const arr = shuffledRange(50)
      const staticResult = StrandSort2.sort(arr)
      const sorter = new StrandSort2()
      const instanceResult = sorter.sortInstance([...arr])
      expect(staticResult).toEqual(instanceResult)
    })

    it('multiple calls should be independent', () => {
      const arr1 = [3, 1, 2]
      const arr2 = [6, 4, 5]
      const result1 = StrandSort2.sort(arr1)
      const result2 = StrandSort2.sort(arr2)
      expect(result1).toEqual([1, 2, 3])
      expect(result2).toEqual([4, 5, 6])
    })
  })

  describe('edge cases', () => {
    it('should handle array with single negative number', () => {
      expect(StrandSort2.sort([-42])).toEqual([-42])
    })

    it('should handle array with single zero', () => {
      expect(StrandSort2.sort([0])).toEqual([0])
    })

    it('should handle array with very large positive number', () => {
      const arr = [Number.MAX_SAFE_INTEGER, 0, 1]
      const result = StrandSort2.sort(arr)
      expect(result).toEqual([0, 1, Number.MAX_SAFE_INTEGER])
    })

    it('should handle array with very large negative number', () => {
      const arr = [Number.MIN_SAFE_INTEGER, 0, -1]
      const result = StrandSort2.sort(arr)
      expect(result).toEqual([Number.MIN_SAFE_INTEGER, -1, 0])
    })

    it('should handle array with all same negative numbers', () => {
      expect(StrandSort2.sort([-5, -5, -5, -5])).toEqual([-5, -5, -5, -5])
    })

    it('should handle array with alternating positive and negative', () => {
      expect(StrandSort2.sort([1, -1, 2, -2, 3, -3])).toEqual([-3, -2, -1, 1, 2, 3])
    })

    it('should handle array with duplicate boundaries', () => {
      expect(StrandSort2.sort([0, 0, 1, 1, -1, -1])).toEqual([-1, -1, 0, 0, 1, 1])
    })
  })
})
