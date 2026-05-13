import { describe, it, expect } from 'vitest'
import { CombSort3 } from '../src/core/comb-sort-3/index.js'

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

describe('CombSort3', () => {
  describe('sort', () => {
    it('should return empty array for empty input', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.sort([])).toEqual([])
    })

    it('should return single element for single element input', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.sort([42])).toEqual([42])
    })

    it('should sort two elements', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.sort([2, 1])).toEqual([1, 2])
    })

    it('should sort already sorted array', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
    })

    it('should sort reverse sorted array', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
    })

    it('should sort random array', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.sort([3, 1, 4, 1, 5, 9, 2, 6])).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
    })

    it('should handle duplicates', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.sort([3, 3, 3, 1, 1, 2, 2])).toEqual([1, 1, 2, 2, 3, 3, 3])
    })

    it('should handle negative numbers', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.sort([-5, 3, -1, 0, 2])).toEqual([-5, -1, 0, 2, 3])
    })

    it('should not modify original array', () => {
      const sorter = new CombSort3<number>()
      const original = [3, 1, 2]
      const sorted = sorter.sort(original)
      expect(original).toEqual([3, 1, 2])
      expect(sorted).toEqual([1, 2, 3])
    })

    it('should work with custom comparator', () => {
      const sorter = new CombSort3<number>((a, b) => b - a)
      expect(sorter.sort([3, 1, 4, 1, 5])).toEqual([5, 4, 3, 1, 1])
    })

    it('should sort large array (10000 elements)', () => {
      const sorter = new CombSort3<number>()
      const arr = shuffledRange(10000)
      const result = sorter.sort(arr)
      expect(result).toHaveLength(10000)
      expect(sorter.isSorted(result)).toBe(true)
    })

    it('should handle array of all identical elements', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.sort([5, 5, 5, 5, 5])).toEqual([5, 5, 5, 5, 5])
    })

    it('should sort floating point numbers', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.sort([3.14, 1.41, 2.72, 0.58])).toEqual([0.58, 1.41, 2.72, 3.14])
    })

    it('should handle array with one element out of order at start', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.sort([5, 1, 2, 3, 4])).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle array with one element out of order at end', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.sort([2, 3, 4, 5, 1])).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle array of zeros', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.sort([0, 0, 0, 0])).toEqual([0, 0, 0, 0])
    })
  })

  describe('sortDescending', () => {
    it('should return empty array for empty input', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.sortDescending([])).toEqual([])
    })

    it('should return single element for single element input', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.sortDescending([42])).toEqual([42])
    })

    it('should sort array in descending order', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.sortDescending([1, 2, 3, 4, 5])).toEqual([5, 4, 3, 2, 1])
    })

    it('should sort reverse sorted array (ascending)', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.sortDescending([5, 4, 3, 2, 1])).toEqual([5, 4, 3, 2, 1])
    })

    it('should handle duplicates in descending order', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.sortDescending([1, 1, 2, 2, 3, 3])).toEqual([3, 3, 2, 2, 1, 1])
    })

    it('should handle negative numbers in descending order', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.sortDescending([-5, -1, 0, 2, 3])).toEqual([3, 2, 0, -1, -5])
    })

    it('should not modify original array', () => {
      const sorter = new CombSort3<number>()
      const original = [1, 2, 3]
      const sorted = sorter.sortDescending(original)
      expect(original).toEqual([1, 2, 3])
      expect(sorted).toEqual([3, 2, 1])
    })

    it('should work with custom comparator', () => {
      const sorter = new CombSort3<number>((a, b) => b - a)
      expect(sorter.sortDescending([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('isSorted', () => {
    it('should return true for empty array', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.isSorted([])).toBe(true)
    })

    it('should return true for single element', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.isSorted([1])).toBe(true)
    })

    it('should return true for sorted array', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.isSorted([1, 2, 3, 4, 5])).toBe(true)
    })

    it('should return false for unsorted array', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.isSorted([3, 1, 2])).toBe(false)
    })

    it('should return true for equal elements', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.isSorted([5, 5, 5])).toBe(true)
    })

    it('should return false for reverse sorted with default comparator', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.isSorted([5, 4, 3, 2, 1])).toBe(false)
    })

    it('should return true for reverse sorted with custom comparator', () => {
      const sorter = new CombSort3<number>((a, b) => b - a)
      expect(sorter.isSorted([5, 4, 3, 2, 1])).toBe(true)
    })

    it('should return false when last two are out of order', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.isSorted([1, 2, 3, 5, 4])).toBe(false)
    })

    it('should return false when first two are out of order', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.isSorted([2, 1, 3, 4, 5])).toBe(false)
    })

    it('should return true for equal adjacent elements', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.isSorted([1, 1, 2, 2, 3])).toBe(true)
    })
  })

  describe('sortWithShrinkFactor', () => {
    it('should return empty array for empty input', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.sortWithShrinkFactor([], 1.5)).toEqual([])
    })

    it('should return single element for single element input', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.sortWithShrinkFactor([42], 1.5)).toEqual([42])
    })

    it('should sort with shrink factor 1.5', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.sortWithShrinkFactor([5, 4, 3, 2, 1], 1.5)).toEqual([1, 2, 3, 4, 5])
    })

    it('should sort with shrink factor 2', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.sortWithShrinkFactor([5, 4, 3, 2, 1], 2)).toEqual([1, 2, 3, 4, 5])
    })

    it('should throw error for shrink factor <= 1', () => {
      const sorter = new CombSort3<number>()
      expect(() => sorter.sortWithShrinkFactor([3, 1, 2], 1)).toThrow('Shrink factor must be greater than 1')
    })

    it('should throw error for shrink factor < 1', () => {
      const sorter = new CombSort3<number>()
      expect(() => sorter.sortWithShrinkFactor([3, 1, 2], 0.5)).toThrow('Shrink factor must be greater than 1')
    })

    it('should not modify original array', () => {
      const sorter = new CombSort3<number>()
      const original = [3, 1, 2]
      const sorted = sorter.sortWithShrinkFactor(original, 1.5)
      expect(original).toEqual([3, 1, 2])
      expect(sorted).toEqual([1, 2, 3])
    })

    it('should work with custom comparator', () => {
      const sorter = new CombSort3<number>((a, b) => b - a)
      expect(sorter.sortWithShrinkFactor([1, 2, 3, 4, 5], 1.5)).toEqual([5, 4, 3, 2, 1])
    })

    it('should handle large shrink factor', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.sortWithShrinkFactor([5, 4, 3, 2, 1], 10)).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('getGapSequence', () => {
    it('should return gap sequence', () => {
      const sorter = new CombSort3<number>()
      const gaps = sorter.getGapSequence()
      expect(gaps.length).toBeGreaterThan(10)
      expect(gaps[gaps.length - 1]).toBe(1)
    })

    it('should be in descending order', () => {
      const sorter = new CombSort3<number>()
      const gaps = sorter.getGapSequence()
      for (let i = 0; i < gaps.length - 1; i++) {
        expect(gaps[i]).toBeGreaterThanOrEqual(gaps[i + 1]!)
      }
    })

    it('should end with 1', () => {
      const sorter = new CombSort3<number>()
      const gaps = sorter.getGapSequence()
      expect(gaps[gaps.length - 1]).toBe(1)
    })
  })

  describe('getSwapCount', () => {
    it('should return zero for empty array', () => {
      const sorter = new CombSort3<number>()
      sorter.sort([])
      expect(sorter.getSwapCount()).toBe(0)
    })

    it('should return zero for single element', () => {
      const sorter = new CombSort3<number>()
      sorter.sort([42])
      expect(sorter.getSwapCount()).toBe(0)
    })

    it('should return positive count for unsorted array', () => {
      const sorter = new CombSort3<number>()
      sorter.sort([5, 4, 3, 2, 1])
      expect(sorter.getSwapCount()).toBeGreaterThan(0)
    })

    it('should reset count on new sort', () => {
      const sorter = new CombSort3<number>()
      sorter.sort([5, 4, 3, 2, 1])
      const firstCount = sorter.getSwapCount()
      sorter.sort([1, 2, 3, 4, 5])
      const secondCount = sorter.getSwapCount()
      expect(secondCount).toBeLessThanOrEqual(firstCount)
    })
  })

  describe('getTimeComplexity', () => {
    it('should return correct time complexity', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.getTimeComplexity()).toBe('O(n log n) average, O(n^2) worst case')
    })

    it('should return same time complexity for custom comparator', () => {
      const sorter = new CombSort3<number>((a, b) => b - a)
      expect(sorter.getTimeComplexity()).toBe('O(n log n) average, O(n^2) worst case')
    })
  })

  describe('getSpaceComplexity', () => {
    it('should return correct space complexity', () => {
      const sorter = new CombSort3<number>()
      expect(sorter.getSpaceComplexity()).toBe('O(1)')
    })

    it('should return same space complexity for custom comparator', () => {
      const sorter = new CombSort3<number>((a, b) => b - a)
      expect(sorter.getSpaceComplexity()).toBe('O(1)')
    })
  })

  describe('integration tests', () => {
    it('sort result should pass isSorted', () => {
      const sorter = new CombSort3<number>()
      const arr = shuffledRange(200)
      const sorted = sorter.sort(arr)
      expect(sorter.isSorted(sorted)).toBe(true)
    })

    it('sortDescending should be reverse of sort', () => {
      const sorter = new CombSort3<number>()
      const arr = [3, 1, 4, 1, 5, 9, 2, 6]
      const ascending = sorter.sort(arr)
      const descending = sorter.sortDescending(arr)
      expect(descending).toEqual([...ascending].reverse())
    })

    it('sortWithShrinkFactor should produce correct result', () => {
      const sorter = new CombSort3<number>()
      const arr = shuffledRange(100)
      const sorted = sorter.sortWithShrinkFactor(arr, 1.5)
      expect(sorter.isSorted(sorted)).toBe(true)
    })

    it('should handle array with MIN/MAX safe integers', () => {
      const sorter = new CombSort3<number>()
      const arr = [Number.MAX_SAFE_INTEGER, 0, Number.MIN_SAFE_INTEGER, 1]
      const result = sorter.sort(arr)
      expect(result).toEqual([Number.MIN_SAFE_INTEGER, 0, 1, Number.MAX_SAFE_INTEGER])
    })

    it('should handle booleans', () => {
      const sorter = new CombSort3<boolean>()
      const arr = [true, false, true, false]
      const result = sorter.sort(arr)
      expect(result).toEqual([false, false, true, true])
    })

    it('should sort strings correctly', () => {
      const sorter = new CombSort3<string>()
      const arr = ['banana', 'apple', 'cherry']
      const result = sorter.sort(arr)
      expect(result).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should sort objects with custom comparator', () => {
      interface Person {
        name: string
        age: number
      }
      const sorter = new CombSort3<Person>((a, b) => a.age - b.age)
      const arr = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
        { name: 'Charlie', age: 35 }
      ]
      const result = sorter.sort(arr)
      expect(result).toEqual([
        { name: 'Bob', age: 25 },
        { name: 'Alice', age: 30 },
        { name: 'Charlie', age: 35 }
      ])
    })

    it('different shrink factors should produce same result', () => {
      const sorter = new CombSort3<number>()
      const arr = shuffledRange(50)
      const result1 = sorter.sortWithShrinkFactor([...arr], 1.3)
      const result2 = sorter.sortWithShrinkFactor([...arr], 1.5)
      const result3 = sorter.sortWithShrinkFactor([...arr], 2)
      expect(result1).toEqual(result2)
      expect(result2).toEqual(result3)
    })
  })
})
