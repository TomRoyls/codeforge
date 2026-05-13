import { describe, it, expect } from 'vitest'
import { ShellSort4 } from '../src/core/shell-sort-4/index.js'

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

describe('ShellSort4', () => {
  describe('sort', () => {
    it('should return empty array for empty input', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.sort([])).toEqual([])
    })

    it('should return single element for single element input', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.sort([42])).toEqual([42])
    })

    it('should sort two elements', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.sort([2, 1])).toEqual([1, 2])
    })

    it('should sort already sorted array', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
    })

    it('should sort reverse sorted array', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
    })

    it('should sort random array', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.sort([3, 1, 4, 1, 5, 9, 2, 6])).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
    })

    it('should handle duplicates', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.sort([3, 3, 3, 1, 1, 2, 2])).toEqual([1, 1, 2, 2, 3, 3, 3])
    })

    it('should handle negative numbers', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.sort([-5, 3, -1, 0, 2])).toEqual([-5, -1, 0, 2, 3])
    })

    it('should not modify original array', () => {
      const sorter = new ShellSort4<number>()
      const original = [3, 1, 2]
      const sorted = sorter.sort(original)
      expect(original).toEqual([3, 1, 2])
      expect(sorted).toEqual([1, 2, 3])
    })

    it('should work with custom comparator', () => {
      const sorter = new ShellSort4<number>((a, b) => b - a)
      expect(sorter.sort([3, 1, 4, 1, 5])).toEqual([5, 4, 3, 1, 1])
    })

    it('should sort large array (10000 elements)', () => {
      const sorter = new ShellSort4<number>()
      const arr = shuffledRange(10000)
      const result = sorter.sort(arr)
      expect(result).toHaveLength(10000)
      expect(sorter.isSorted(result)).toBe(true)
    })

    it('should handle array of all identical elements', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.sort([5, 5, 5, 5, 5])).toEqual([5, 5, 5, 5, 5])
    })

    it('should sort floating point numbers', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.sort([3.14, 1.41, 2.72, 0.58])).toEqual([0.58, 1.41, 2.72, 3.14])
    })

    it('should handle array with one element out of order at start', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.sort([5, 1, 2, 3, 4])).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle array with one element out of order at end', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.sort([2, 3, 4, 5, 1])).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle array of zeros', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.sort([0, 0, 0, 0])).toEqual([0, 0, 0, 0])
    })
  })

  describe('sortDescending', () => {
    it('should return empty array for empty input', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.sortDescending([])).toEqual([])
    })

    it('should return single element for single element input', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.sortDescending([42])).toEqual([42])
    })

    it('should sort array in descending order', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.sortDescending([1, 2, 3, 4, 5])).toEqual([5, 4, 3, 2, 1])
    })

    it('should sort reverse sorted array (ascending)', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.sortDescending([5, 4, 3, 2, 1])).toEqual([5, 4, 3, 2, 1])
    })

    it('should handle duplicates in descending order', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.sortDescending([1, 1, 2, 2, 3, 3])).toEqual([3, 3, 2, 2, 1, 1])
    })

    it('should handle negative numbers in descending order', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.sortDescending([-5, -1, 0, 2, 3])).toEqual([3, 2, 0, -1, -5])
    })

    it('should not modify original array', () => {
      const sorter = new ShellSort4<number>()
      const original = [1, 2, 3]
      const sorted = sorter.sortDescending(original)
      expect(original).toEqual([1, 2, 3])
      expect(sorted).toEqual([3, 2, 1])
    })

    it('should work with custom comparator', () => {
      const sorter = new ShellSort4<number>((a, b) => b - a)
      expect(sorter.sortDescending([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('isSorted', () => {
    it('should return true for empty array', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.isSorted([])).toBe(true)
    })

    it('should return true for single element', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.isSorted([1])).toBe(true)
    })

    it('should return true for sorted array', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.isSorted([1, 2, 3, 4, 5])).toBe(true)
    })

    it('should return false for unsorted array', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.isSorted([3, 1, 2])).toBe(false)
    })

    it('should return true for equal elements', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.isSorted([5, 5, 5])).toBe(true)
    })

    it('should return false for reverse sorted with default comparator', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.isSorted([5, 4, 3, 2, 1])).toBe(false)
    })

    it('should return true for reverse sorted with custom comparator', () => {
      const sorter = new ShellSort4<number>((a, b) => b - a)
      expect(sorter.isSorted([5, 4, 3, 2, 1])).toBe(true)
    })

    it('should return false when last two are out of order', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.isSorted([1, 2, 3, 5, 4])).toBe(false)
    })

    it('should return false when first two are out of order', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.isSorted([2, 1, 3, 4, 5])).toBe(false)
    })

    it('should return true for equal adjacent elements', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.isSorted([1, 1, 2, 2, 3])).toBe(true)
    })
  })

  describe('sortWithGap', () => {
    it('should return empty array for empty input', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.sortWithGap([], [1, 2, 3])).toEqual([])
    })

    it('should return single element for single element input', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.sortWithGap([42], [1, 2, 3])).toEqual([42])
    })

    it('should sort with simple gap sequence', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.sortWithGap([5, 4, 3, 2, 1], [2, 1])).toEqual([1, 2, 3, 4, 5])
    })

    it('should sort with custom gap sequence', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.sortWithGap([5, 4, 3, 2, 1], [3, 1])).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle gaps larger than array', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.sortWithGap([3, 1, 2], [10, 5, 1])).toEqual([1, 2, 3])
    })

    it('should not modify original array', () => {
      const sorter = new ShellSort4<number>()
      const original = [3, 1, 2]
      const sorted = sorter.sortWithGap(original, [2, 1])
      expect(original).toEqual([3, 1, 2])
      expect(sorted).toEqual([1, 2, 3])
    })

    it('should work with custom comparator', () => {
      const sorter = new ShellSort4<number>((a, b) => b - a)
      expect(sorter.sortWithGap([1, 2, 3, 4, 5], [2, 1])).toEqual([5, 4, 3, 2, 1])
    })

    it('should handle single gap', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.sortWithGap([5, 4, 3, 2, 1], [1])).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('ciuraGaps', () => {
    it('should return Ciura gap sequence', () => {
      const sorter = new ShellSort4<number>()
      const gaps = sorter.ciuraGaps()
      expect(gaps).toHaveLength(9)
      expect(gaps[0]).toBe(1750)
      expect(gaps[gaps.length - 1]).toBe(1)
    })

    it('should be in descending order', () => {
      const sorter = new ShellSort4<number>()
      const gaps = sorter.ciuraGaps()
      for (let i = 0; i < gaps.length - 1; i++) {
        expect(gaps[i]).toBeGreaterThan(gaps[i + 1]!)
      }
    })

    it('should contain specific known gaps', () => {
      const sorter = new ShellSort4<number>()
      const gaps = sorter.ciuraGaps()
      expect(gaps).toContain(701)
      expect(gaps).toContain(301)
      expect(gaps).toContain(57)
      expect(gaps).toContain(23)
    })
  })

  describe('sedgewickGaps', () => {
    it('should return Sedgewick gap sequence', () => {
      const sorter = new ShellSort4<number>()
      const gaps = sorter.sedgewickGaps()
      expect(gaps.length).toBeGreaterThan(10)
      expect(gaps[gaps.length - 1]).toBe(1)
    })

    it('should be in descending order', () => {
      const sorter = new ShellSort4<number>()
      const gaps = sorter.sedgewickGaps()
      for (let i = 0; i < gaps.length - 1; i++) {
        expect(gaps[i]).toBeGreaterThan(gaps[i + 1]!)
      }
    })

    it('should start with 1', () => {
      const sorter = new ShellSort4<number>()
      const gaps = sorter.sedgewickGaps()
      expect(gaps[gaps.length - 1]).toBe(1)
    })

    it('should contain known Sedgewick gaps', () => {
      const sorter = new ShellSort4<number>()
      const gaps = sorter.sedgewickGaps()
      expect(gaps).toContain(5)
      expect(gaps).toContain(19)
      expect(gaps).toContain(41)
      expect(gaps).toContain(109)
    })
  })

  describe('knuthGaps', () => {
    it('should return Knuth gap sequence', () => {
      const sorter = new ShellSort4<number>()
      const gaps = sorter.knuthGaps()
      expect(gaps.length).toBeGreaterThan(10)
      expect(gaps[gaps.length - 1]).toBe(1)
    })

    it('should be in descending order', () => {
      const sorter = new ShellSort4<number>()
      const gaps = sorter.knuthGaps()
      for (let i = 0; i < gaps.length - 1; i++) {
        expect(gaps[i]).toBeGreaterThan(gaps[i + 1]!)
      }
    })

    it('should start with 1', () => {
      const sorter = new ShellSort4<number>()
      const gaps = sorter.knuthGaps()
      expect(gaps[gaps.length - 1]).toBe(1)
    })

    it('should follow (3^k - 1) / 2 pattern', () => {
      const sorter = new ShellSort4<number>()
      const gaps = sorter.knuthGaps()
      expect(gaps).toContain(1)
      expect(gaps).toContain(4)
      expect(gaps).toContain(13)
      expect(gaps).toContain(40)
    })
  })

  describe('getTimeComplexity', () => {
    it('should return correct time complexity', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.getTimeComplexity()).toBe('O(n^(4/3)) to O(n^(3/2))')
    })

    it('should return same time complexity for custom comparator', () => {
      const sorter = new ShellSort4<number>((a, b) => b - a)
      expect(sorter.getTimeComplexity()).toBe('O(n^(4/3)) to O(n^(3/2))')
    })
  })

  describe('getSpaceComplexity', () => {
    it('should return correct space complexity', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.getSpaceComplexity()).toBe('O(1)')
    })

    it('should return same space complexity for custom comparator', () => {
      const sorter = new ShellSort4<number>((a, b) => b - a)
      expect(sorter.getSpaceComplexity()).toBe('O(1)')
    })
  })

  describe('integration tests', () => {
    it('sort result should pass isSorted', () => {
      const sorter = new ShellSort4<number>()
      const arr = shuffledRange(200)
      const sorted = sorter.sort(arr)
      expect(sorter.isSorted(sorted)).toBe(true)
    })

    it('sortDescending should be reverse of sort', () => {
      const sorter = new ShellSort4<number>()
      const arr = [3, 1, 4, 1, 5, 9, 2, 6]
      const ascending = sorter.sort(arr)
      const descending = sorter.sortDescending(arr)
      expect(descending).toEqual([...ascending].reverse())
    })

    it('sortWithGap with Ciura gaps should sort correctly', () => {
      const sorter = new ShellSort4<number>()
      const arr = shuffledRange(100)
      const gaps = sorter.ciuraGaps()
      const sorted = sorter.sortWithGap(arr, gaps)
      expect(sorter.isSorted(sorted)).toBe(true)
    })

    it('sortWithGap with Sedgewick gaps should sort correctly', () => {
      const sorter = new ShellSort4<number>()
      const arr = shuffledRange(100)
      const gaps = sorter.sedgewickGaps()
      const sorted = sorter.sortWithGap(arr, gaps)
      expect(sorter.isSorted(sorted)).toBe(true)
    })

    it('sortWithGap with Knuth gaps should sort correctly', () => {
      const sorter = new ShellSort4<number>()
      const arr = shuffledRange(100)
      const gaps = sorter.knuthGaps()
      const sorted = sorter.sortWithGap(arr, gaps)
      expect(sorter.isSorted(sorted)).toBe(true)
    })

    it('should handle array with MIN/MAX safe integers', () => {
      const sorter = new ShellSort4<number>()
      const arr = [Number.MAX_SAFE_INTEGER, 0, Number.MIN_SAFE_INTEGER, 1]
      const result = sorter.sort(arr)
      expect(result).toEqual([Number.MIN_SAFE_INTEGER, 0, 1, Number.MAX_SAFE_INTEGER])
    })

    it('should handle booleans', () => {
      const sorter = new ShellSort4<boolean>()
      const arr = [true, false, true, false]
      const result = sorter.sort(arr)
      expect(result).toEqual([false, false, true, true])
    })

    it('should sort strings correctly', () => {
      const sorter = new ShellSort4<string>()
      const arr = ['banana', 'apple', 'cherry']
      const result = sorter.sort(arr)
      expect(result).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should sort objects with custom comparator', () => {
      interface Person {
        name: string
        age: number
      }
      const sorter = new ShellSort4<Person>((a, b) => a.age - b.age)
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
  })
})
