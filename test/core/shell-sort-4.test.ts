import { describe, it, expect } from 'vitest'
import { ShellSort4 } from '../../src/core/shell-sort-4/index.js'

// ─── Constructor ───

describe('ShellSort4', () => {
  describe('constructor', () => {
    it('creates instance with default comparator', () => {
      const sorter = new ShellSort4<number>()
      const result = sorter.sort([3, 1, 2])
      expect(result).toEqual([1, 2, 3])
    })

    it('creates instance with custom comparator', () => {
      const sorter = new ShellSort4<{ age: number }>((a, b) => a.age - b.age)
      const result = sorter.sort([{ age: 30 }, { age: 10 }, { age: 20 }])
      expect(result).toEqual([{ age: 10 }, { age: 20 }, { age: 30 }])
    })
  })

  // ─── sort ───

  describe('sort', () => {
    it('sorts numbers in ascending order', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.sort([5, 3, 8, 1, 9, 2, 7, 4, 6])).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('sorts strings in ascending order', () => {
      const sorter = new ShellSort4<string>()
      expect(sorter.sort(['cherry', 'apple', 'banana'])).toEqual(['apple', 'banana', 'cherry'])
    })

    it('returns a new array and does not mutate the input', () => {
      const sorter = new ShellSort4<number>()
      const input = [3, 1, 2]
      const result = sorter.sort(input)
      expect(result).toEqual([1, 2, 3])
      expect(input).toEqual([3, 1, 2])
    })

    it('returns a copy for empty array', () => {
      const sorter = new ShellSort4<number>()
      const result = sorter.sort([])
      expect(result).toEqual([])
      expect(result).not.toBe([])
    })

    it('returns a copy for single element array', () => {
      const sorter = new ShellSort4<number>()
      const input = [42]
      const result = sorter.sort(input)
      expect(result).toEqual([42])
      expect(result).not.toBe(input)
    })

    it('handles already sorted input', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
    })

    it('handles reverse sorted input', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
    })

    it('handles duplicates', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.sort([3, 1, 2, 1, 3])).toEqual([1, 1, 2, 3, 3])
    })

    it('handles negative numbers', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.sort([-3, 0, -1, 2, -5])).toEqual([-5, -3, -1, 0, 2])
    })

    it('handles all identical elements', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.sort([7, 7, 7, 7])).toEqual([7, 7, 7, 7])
    })
  })

  // ─── sortDescending ───

  describe('sortDescending', () => {
    it('sorts numbers in descending order', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.sortDescending([1, 2, 3])).toEqual([3, 2, 1])
    })

    it('returns a copy for empty array', () => {
      const sorter = new ShellSort4<number>()
      const result = sorter.sortDescending([])
      expect(result).toEqual([])
      expect(result).not.toBe([])
    })

    it('returns a copy for single element array', () => {
      const sorter = new ShellSort4<number>()
      const result = sorter.sortDescending([42])
      expect(result).toEqual([42])
    })

    it('handles duplicates', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.sortDescending([1, 3, 2, 3, 1])).toEqual([3, 3, 2, 1, 1])
    })

    it('handles negative numbers', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.sortDescending([-3, 0, -1, 2])).toEqual([2, 0, -1, -3])
    })

    it('does not mutate original array', () => {
      const sorter = new ShellSort4<number>()
      const input = [3, 1, 2]
      sorter.sortDescending(input)
      expect(input).toEqual([3, 1, 2])
    })
  })

  // ─── isSorted ───

  describe('isSorted', () => {
    it('returns true for sorted array', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.isSorted([1, 2, 3, 4, 5])).toBe(true)
    })

    it('returns false for unsorted array', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.isSorted([3, 1, 2])).toBe(false)
    })

    it('returns true for empty array', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.isSorted([])).toBe(true)
    })

    it('returns true for single element array', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.isSorted([42])).toBe(true)
    })

    it('returns true for array with duplicates', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.isSorted([1, 2, 2, 3])).toBe(true)
    })

    it('returns false when equal elements are followed by smaller', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.isSorted([1, 3, 2])).toBe(false)
    })
  })

  // ─── sortWithGap ───

  describe('sortWithGap', () => {
    it('sorts with custom gap sequence', () => {
      const sorter = new ShellSort4<number>()
      const result = sorter.sortWithGap([5, 3, 1, 4, 2], [5, 3, 1])
      expect(result).toEqual([1, 2, 3, 4, 5])
    })

    it('reverses gap sequence internally', () => {
      const sorter = new ShellSort4<number>()
      const result1 = sorter.sortWithGap([5, 3, 1, 4, 2], [5, 3, 1])
      const result2 = sorter.sortWithGap([5, 3, 1, 4, 2], [1, 3, 5])
      expect(result1).toEqual(result2)
    })

    it('returns a copy for empty array', () => {
      const sorter = new ShellSort4<number>()
      const result = sorter.sortWithGap([], [1])
      expect(result).toEqual([])
      expect(result).not.toBe([])
    })

    it('returns a copy for single element', () => {
      const sorter = new ShellSort4<number>()
      const result = sorter.sortWithGap([42], [1])
      expect(result).toEqual([42])
    })

    it('handles single gap of 1', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.sortWithGap([3, 1, 2], [1])).toEqual([1, 2, 3])
    })

    it('does not mutate the input gap sequence', () => {
      const sorter = new ShellSort4<number>()
      const gaps = [5, 3, 1]
      const gapsCopy = [...gaps]
      sorter.sortWithGap([3, 1, 2], gaps)
      expect(gaps).toEqual(gapsCopy)
    })
  })

  // ─── Gap Sequences ───

  describe('gap sequences', () => {
    it('ciuraGaps returns the expected sequence', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.ciuraGaps()).toEqual([1750, 701, 301, 132, 57, 23, 10, 4, 1])
    })

    it('sedgewickGaps returns a sequence ending with 1', () => {
      const sorter = new ShellSort4<number>()
      const gaps = sorter.sedgewickGaps()
      expect(gaps[gaps.length - 1]).toBe(1)
      expect(gaps[0]).toBe(260609)
    })

    it('knuthGaps returns a sequence ending with 1', () => {
      const sorter = new ShellSort4<number>()
      const gaps = sorter.knuthGaps()
      expect(gaps[gaps.length - 1]).toBe(1)
    })

    it('knuthGaps returns descending order', () => {
      const sorter = new ShellSort4<number>()
      const gaps = sorter.knuthGaps()
      for (let i = 1; i < gaps.length; i++) {
        expect(gaps[i - 1]!).toBeGreaterThan(gaps[i]!)
      }
    })
  })

  // ─── Complexity ───

  describe('complexity', () => {
    it('getTimeComplexity returns expected string', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.getTimeComplexity()).toBe('O(n^(4/3)) to O(n^(3/2))')
    })

    it('getSpaceComplexity returns O(1)', () => {
      const sorter = new ShellSort4<number>()
      expect(sorter.getSpaceComplexity()).toBe('O(1)')
    })
  })
})
