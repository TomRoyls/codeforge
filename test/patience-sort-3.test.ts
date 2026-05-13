import { describe, it, expect } from 'vitest'
import { PatienceSort3 } from '../src/core/patience-sort-3/index.js'

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

describe('PatienceSort3', () => {
  describe('sort', () => {
    it('should return empty array for empty input', () => {
      const sorter = new PatienceSort3<number>()
      expect(sorter.sort([])).toEqual([])
    })

    it('should return single element for single element input', () => {
      const sorter = new PatienceSort3<number>()
      expect(sorter.sort([42])).toEqual([42])
    })

    it('should sort two elements', () => {
      const sorter = new PatienceSort3<number>()
      expect(sorter.sort([2, 1])).toEqual([1, 2])
    })

    it('should sort already sorted array', () => {
      const sorter = new PatienceSort3<number>()
      expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
    })

    it('should sort reverse sorted array', () => {
      const sorter = new PatienceSort3<number>()
      expect(sorter.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
    })

    it('should sort random array', () => {
      const sorter = new PatienceSort3<number>()
      expect(sorter.sort([3, 1, 4, 1, 5, 9, 2, 6])).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
    })

    it('should handle duplicates', () => {
      const sorter = new PatienceSort3<number>()
      expect(sorter.sort([3, 3, 3, 1, 1, 2, 2])).toEqual([1, 1, 2, 2, 3, 3, 3])
    })

    it('should handle negative numbers', () => {
      const sorter = new PatienceSort3<number>()
      expect(sorter.sort([-5, 3, -1, 0, 2])).toEqual([-5, -1, 0, 2, 3])
    })

    it('should not modify original array', () => {
      const sorter = new PatienceSort3<number>()
      const original = [3, 1, 2]
      const sorted = sorter.sort(original)
      expect(original).toEqual([3, 1, 2])
      expect(sorted).toEqual([1, 2, 3])
    })

    it('should work with custom comparator', () => {
      const sorter = new PatienceSort3<number>((a, b) => b - a)
      expect(sorter.sort([3, 1, 4, 1, 5])).toEqual([5, 4, 3, 1, 1])
    })

    it('should sort large array (10000 elements)', () => {
      const sorter = new PatienceSort3<number>()
      const arr = shuffledRange(10000)
      const result = sorter.sort(arr)
      expect(result).toHaveLength(10000)
      expect(sorter.isSorted(result)).toBe(true)
    })

    it('should handle array of all identical elements', () => {
      const sorter = new PatienceSort3<number>()
      expect(sorter.sort([5, 5, 5, 5, 5])).toEqual([5, 5, 5, 5, 5])
    })

    it('should sort floating point numbers', () => {
      const sorter = new PatienceSort3<number>()
      expect(sorter.sort([3.14, 1.41, 2.72, 0.58])).toEqual([0.58, 1.41, 2.72, 3.14])
    })

    it('should handle array with one element out of order at start', () => {
      const sorter = new PatienceSort3<number>()
      expect(sorter.sort([5, 1, 2, 3, 4])).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle array with one element out of order at end', () => {
      const sorter = new PatienceSort3<number>()
      expect(sorter.sort([2, 3, 4, 5, 1])).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle array of zeros', () => {
      const sorter = new PatienceSort3<number>()
      expect(sorter.sort([0, 0, 0, 0])).toEqual([0, 0, 0, 0])
    })

    it('should create optimal number of piles for sorted input', () => {
      const sorter = new PatienceSort3<number>()
      sorter.sort([1, 2, 3, 4, 5])
      const piles = sorter.getPiles()
      expect(piles).toHaveLength(5)
    })

    it('should create single pile for reverse sorted input', () => {
      const sorter = new PatienceSort3<number>()
      sorter.sort([5, 4, 3, 2, 1])
      const piles = sorter.getPiles()
      expect(piles).toHaveLength(1)
    })
  })

  describe('sortDescending', () => {
    it('should return empty array for empty input', () => {
      const sorter = new PatienceSort3<number>()
      expect(sorter.sortDescending([])).toEqual([])
    })

    it('should return single element for single element input', () => {
      const sorter = new PatienceSort3<number>()
      expect(sorter.sortDescending([42])).toEqual([42])
    })

    it('should sort array in descending order', () => {
      const sorter = new PatienceSort3<number>()
      expect(sorter.sortDescending([1, 2, 3, 4, 5])).toEqual([5, 4, 3, 2, 1])
    })

    it('should sort reverse sorted array (ascending)', () => {
      const sorter = new PatienceSort3<number>()
      expect(sorter.sortDescending([5, 4, 3, 2, 1])).toEqual([5, 4, 3, 2, 1])
    })

    it('should handle duplicates in descending order', () => {
      const sorter = new PatienceSort3<number>()
      expect(sorter.sortDescending([1, 1, 2, 2, 3, 3])).toEqual([3, 3, 2, 2, 1, 1])
    })

    it('should handle negative numbers in descending order', () => {
      const sorter = new PatienceSort3<number>()
      expect(sorter.sortDescending([-5, -1, 0, 2, 3])).toEqual([3, 2, 0, -1, -5])
    })

    it('should not modify original array', () => {
      const sorter = new PatienceSort3<number>()
      const original = [1, 2, 3]
      const sorted = sorter.sortDescending(original)
      expect(original).toEqual([1, 2, 3])
      expect(sorted).toEqual([3, 2, 1])
    })

    it('should work with custom comparator', () => {
      const sorter = new PatienceSort3<number>((a, b) => b - a)
      expect(sorter.sortDescending([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('isSorted', () => {
    it('should return true for empty array', () => {
      const sorter = new PatienceSort3<number>()
      expect(sorter.isSorted([])).toBe(true)
    })

    it('should return true for single element', () => {
      const sorter = new PatienceSort3<number>()
      expect(sorter.isSorted([1])).toBe(true)
    })

    it('should return true for sorted array', () => {
      const sorter = new PatienceSort3<number>()
      expect(sorter.isSorted([1, 2, 3, 4, 5])).toBe(true)
    })

    it('should return false for unsorted array', () => {
      const sorter = new PatienceSort3<number>()
      expect(sorter.isSorted([3, 1, 2])).toBe(false)
    })

    it('should return true for equal elements', () => {
      const sorter = new PatienceSort3<number>()
      expect(sorter.isSorted([5, 5, 5])).toBe(true)
    })

    it('should return false for reverse sorted with default comparator', () => {
      const sorter = new PatienceSort3<number>()
      expect(sorter.isSorted([5, 4, 3, 2, 1])).toBe(false)
    })

    it('should return true for reverse sorted with custom comparator', () => {
      const sorter = new PatienceSort3<number>((a, b) => b - a)
      expect(sorter.isSorted([5, 4, 3, 2, 1])).toBe(true)
    })

    it('should return false when last two are out of order', () => {
      const sorter = new PatienceSort3<number>()
      expect(sorter.isSorted([1, 2, 3, 5, 4])).toBe(false)
    })

    it('should return false when first two are out of order', () => {
      const sorter = new PatienceSort3<number>()
      expect(sorter.isSorted([2, 1, 3, 4, 5])).toBe(false)
    })

    it('should return true for equal adjacent elements', () => {
      const sorter = new PatienceSort3<number>()
      expect(sorter.isSorted([1, 1, 2, 2, 3])).toBe(true)
    })
  })

  describe('getPiles', () => {
    it('should return empty array for no sort operation', () => {
      const sorter = new PatienceSort3<number>()
      expect(sorter.getPiles()).toEqual([])
    })

    it('should return piles after sort operation', () => {
      const sorter = new PatienceSort3<number>()
      sorter.sort([3, 1, 4, 1, 5])
      const piles = sorter.getPiles()
      expect(piles.length).toBeGreaterThan(0)
      expect(piles.every((pile) => pile.length > 0)).toBe(true)
    })

    it('should not allow mutation of internal piles', () => {
      const sorter = new PatienceSort3<number>()
      sorter.sort([1, 2, 3])
      const piles = sorter.getPiles()
      piles[0]!.push(999)
      const piles2 = sorter.getPiles()
      expect(piles2[0]!.length).toBe(1)
    })

    it('should return piles for sorted input', () => {
      const sorter = new PatienceSort3<number>()
      sorter.sort([1, 2, 3, 4, 5])
      const piles = sorter.getPiles()
      expect(piles.length).toBe(5)
      expect(piles[0]).toEqual([1])
      expect(piles[1]).toEqual([2])
      expect(piles[2]).toEqual([3])
      expect(piles[3]).toEqual([4])
      expect(piles[4]).toEqual([5])
    })

    it('should return single pile for reverse sorted', () => {
      const sorter = new PatienceSort3<number>()
      sorter.sort([5, 4, 3, 2, 1])
      const piles = sorter.getPiles()
      expect(piles.length).toBe(1)
      expect(piles[0]).toEqual([5, 4, 3, 2, 1])
    })
  })

  describe('getLongestIncreasingSubsequence', () => {
    it('should return empty array for empty input', () => {
      const sorter = new PatienceSort3<number>()
      expect(sorter.getLongestIncreasingSubsequence([])).toEqual([])
    })

    it('should return single element for single element input', () => {
      const sorter = new PatienceSort3<number>()
      expect(sorter.getLongestIncreasingSubsequence([42])).toEqual([42])
    })

    it('should return entire array for sorted input', () => {
      const sorter = new PatienceSort3<number>()
      expect(sorter.getLongestIncreasingSubsequence([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
    })

    it('should find LIS for simple unsorted array', () => {
      const sorter = new PatienceSort3<number>()
      const lis = sorter.getLongestIncreasingSubsequence([3, 1, 4, 2, 5])
      expect(lis.length).toBe(3)
      expect(lis).toContain(1)
      expect(lis).toContain(4)
      expect(lis).toContain(5)
    })

    it('should find LIS for array with all equal elements', () => {
      const sorter = new PatienceSort3<number>()
      expect(sorter.getLongestIncreasingSubsequence([5, 5, 5, 5])).toEqual([5, 5, 5, 5])
    })

    it('should find LIS for reverse sorted array', () => {
      const sorter = new PatienceSort3<number>()
      const lis = sorter.getLongestIncreasingSubsequence([5, 4, 3, 2, 1])
      expect(lis.length).toBe(1)
      expect(lis[0]).toBeGreaterThanOrEqual(1)
      expect(lis[0]).toBeLessThanOrEqual(5)
    })

    it('should handle negative numbers in LIS', () => {
      const sorter = new PatienceSort3<number>()
      const lis = sorter.getLongestIncreasingSubsequence([-5, -1, 0, 2, 3])
      expect(lis).toEqual([-5, -1, 0, 2, 3])
    })

    it('should find LIS with duplicates', () => {
      const sorter = new PatienceSort3<number>()
      const lis = sorter.getLongestIncreasingSubsequence([3, 3, 1, 1, 2, 2])
      expect(lis.length).toBeGreaterThanOrEqual(2)
    })

    it('should not modify original array', () => {
      const sorter = new PatienceSort3<number>()
      const arr = [3, 1, 4, 2, 5]
      const original = [...arr]
      sorter.getLongestIncreasingSubsequence(arr)
      expect(arr).toEqual(original)
    })

    it('should work with custom comparator', () => {
      const sorter = new PatienceSort3<number>((a, b) => b - a)
      const lis = sorter.getLongestIncreasingSubsequence([1, 2, 3, 4, 5])
      expect(lis.length).toBe(1)
    })

    it('should handle large array', () => {
      const sorter = new PatienceSort3<number>()
      const arr = shuffledRange(100)
      const lis = sorter.getLongestIncreasingSubsequence(arr)
      expect(lis.length).toBeGreaterThan(0)
      expect(lis.length).toBeLessThanOrEqual(arr.length)
    })
  })

  describe('getTimeComplexity', () => {
    it('should return correct time complexity', () => {
      const sorter = new PatienceSort3<number>()
      expect(sorter.getTimeComplexity()).toBe('O(n log n)')
    })

    it('should return same time complexity for custom comparator', () => {
      const sorter = new PatienceSort3<number>((a, b) => b - a)
      expect(sorter.getTimeComplexity()).toBe('O(n log n)')
    })
  })

  describe('getSpaceComplexity', () => {
    it('should return correct space complexity', () => {
      const sorter = new PatienceSort3<number>()
      expect(sorter.getSpaceComplexity()).toBe('O(n)')
    })

    it('should return same space complexity for custom comparator', () => {
      const sorter = new PatienceSort3<number>((a, b) => b - a)
      expect(sorter.getSpaceComplexity()).toBe('O(n)')
    })
  })

  describe('integration tests', () => {
    it('sort result should pass isSorted', () => {
      const sorter = new PatienceSort3<number>()
      const arr = shuffledRange(200)
      const sorted = sorter.sort(arr)
      expect(sorter.isSorted(sorted)).toBe(true)
    })

    it('sortDescending should be reverse of sort', () => {
      const sorter = new PatienceSort3<number>()
      const arr = [3, 1, 4, 1, 5, 9, 2, 6]
      const ascending = sorter.sort(arr)
      const descending = sorter.sortDescending(arr)
      expect(descending).toEqual([...ascending].reverse())
    })

    it('getPiles should contain all elements', () => {
      const sorter = new PatienceSort3<number>()
      const arr = [3, 1, 4, 1, 5, 9, 2, 6]
      sorter.sort(arr)
      const piles = sorter.getPiles()
      const allElements = piles.flat()
      expect(allElements).toHaveLength(arr.length)
      expect(allElements.sort()).toEqual(arr.sort())
    })

    it('LIS length should be <= array length', () => {
      const sorter = new PatienceSort3<number>()
      const arr = shuffledRange(50)
      const lis = sorter.getLongestIncreasingSubsequence(arr)
      expect(lis.length).toBeLessThanOrEqual(arr.length)
    })

    it('sorted array should have LIS equal to itself', () => {
      const sorter = new PatienceSort3<number>()
      const arr = [1, 2, 3, 4, 5]
      const lis = sorter.getLongestIncreasingSubsequence(arr)
      expect(lis).toEqual(arr)
    })

    it('should handle array with MIN/MAX safe integers', () => {
      const sorter = new PatienceSort3<number>()
      const arr = [Number.MAX_SAFE_INTEGER, 0, Number.MIN_SAFE_INTEGER, 1]
      const result = sorter.sort(arr)
      expect(result).toEqual([Number.MIN_SAFE_INTEGER, 0, 1, Number.MAX_SAFE_INTEGER])
    })

    it('should handle booleans', () => {
      const sorter = new PatienceSort3<boolean>()
      const arr = [true, false, true, false]
      const result = sorter.sort(arr)
      expect(result).toEqual([false, false, true, true])
    })

    it('should sort strings correctly', () => {
      const sorter = new PatienceSort3<string>()
      const arr = ['banana', 'apple', 'cherry']
      const result = sorter.sort(arr)
      expect(result).toEqual(['apple', 'banana', 'cherry'])
    })

    it('LIS should be increasing', () => {
      const sorter = new PatienceSort3<number>()
      const arr = shuffledRange(100)
      const lis = sorter.getLongestIncreasingSubsequence(arr)
      for (let i = 1; i < lis.length; i++) {
        expect(lis[i]!).toBeGreaterThan(lis[i - 1]!)
      }
    })

    it('piles should be in sorted order by top elements', () => {
      const sorter = new PatienceSort3<number>()
      sorter.sort([5, 2, 8, 1, 9, 3])
      const piles = sorter.getPiles()
      for (let i = 1; i < piles.length; i++) {
        const prevTop = piles[i - 1]![piles[i - 1]!.length - 1]!
        const currTop = piles[i]![piles[i]!.length - 1]!
        expect(currTop).toBeGreaterThan(prevTop)
      }
    })
  })
})
