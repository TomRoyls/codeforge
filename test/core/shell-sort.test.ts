import { describe, expect, it } from 'vitest'
import { ShellSort } from '../../src/core/shell-sort/index.js'

// ─── Constructor ───

describe('ShellSort', () => {
  describe('constructor', () => {
    it('creates a sorter from an array', () => {
      const sorter = new ShellSort([3, 1, 2])
      expect(sorter.toArray()).toEqual([3, 1, 2])
    })

    it('does not mutate the original array', () => {
      const original = [5, 3, 1]
      const sorter = new ShellSort(original)
      sorter.sort()
      expect(original).toEqual([5, 3, 1])
    })

    it('accepts a custom comparator', () => {
      const sorter = new ShellSort([1, 2, 3], (a, b) => b - a)
      const result = sorter.sort()
      expect(result).toEqual([3, 2, 1])
    })
  })

  // ─── sort ───

  describe('sort', () => {
    it('sorts an unsorted array', () => {
      const sorter = new ShellSort([5, 3, 8, 1, 2])
      expect(sorter.sort()).toEqual([1, 2, 3, 5, 8])
    })

    it('handles an empty array', () => {
      const sorter = new ShellSort<number>([])
      expect(sorter.sort()).toEqual([])
    })

    it('handles a single element', () => {
      const sorter = new ShellSort([42])
      expect(sorter.sort()).toEqual([42])
    })

    it('handles an already sorted array', () => {
      const sorter = new ShellSort([1, 2, 3, 4, 5])
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5])
    })

    it('handles a reverse sorted array', () => {
      const sorter = new ShellSort([5, 4, 3, 2, 1])
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5])
    })

    it('handles duplicates', () => {
      const sorter = new ShellSort([3, 1, 2, 1, 3])
      expect(sorter.sort()).toEqual([1, 1, 2, 3, 3])
    })

    it('handles negative numbers', () => {
      const sorter = new ShellSort([-3, -1, -2, 0, 2, 1])
      expect(sorter.sort()).toEqual([-3, -2, -1, 0, 1, 2])
    })

    it('sorts strings with default comparator', () => {
      const sorter = new ShellSort(['banana', 'apple', 'cherry'])
      expect(sorter.sort()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('sorts in descending order with custom comparator', () => {
      const sorter = new ShellSort([1, 5, 3, 2, 4], (a, b) => b - a)
      expect(sorter.sort()).toEqual([5, 4, 3, 2, 1])
    })

    it('handles a two-element array', () => {
      const sorter = new ShellSort([2, 1])
      expect(sorter.sort()).toEqual([1, 2])
    })

    it('handles all identical elements', () => {
      const sorter = new ShellSort([7, 7, 7, 7])
      expect(sorter.sort()).toEqual([7, 7, 7, 7])
    })
  })

  // ─── isSorted ───

  describe('isSorted', () => {
    it('returns false before sorting', () => {
      const sorter = new ShellSort([3, 1, 2])
      expect(sorter.isSorted()).toBe(false)
    })

    it('returns true after sorting', () => {
      const sorter = new ShellSort([3, 1, 2])
      sorter.sort()
      expect(sorter.isSorted()).toBe(true)
    })

    it('returns true for an already sorted array', () => {
      const sorter = new ShellSort([1, 2, 3])
      expect(sorter.isSorted()).toBe(true)
    })

    it('returns true for empty array', () => {
      const sorter = new ShellSort<number>([])
      expect(sorter.isSorted()).toBe(true)
    })

    it('returns true for single element', () => {
      const sorter = new ShellSort([1])
      expect(sorter.isSorted()).toBe(true)
    })
  })

  // ─── getComparisons ───

  describe('getComparisons', () => {
    it('returns 0 before sorting', () => {
      const sorter = new ShellSort([3, 1, 2])
      expect(sorter.getComparisons()).toBe(0)
    })

    it('returns a positive number after sorting', () => {
      const sorter = new ShellSort([5, 3, 1, 4, 2])
      sorter.sort()
      expect(sorter.getComparisons()).toBeGreaterThan(0)
    })

    it('returns 0 for empty array', () => {
      const sorter = new ShellSort<number>([])
      sorter.sort()
      expect(sorter.getComparisons()).toBe(0)
    })
  })

  // ─── getSwaps ───

  describe('getSwaps', () => {
    it('returns 0 before sorting', () => {
      const sorter = new ShellSort([3, 1, 2])
      expect(sorter.getSwaps()).toBe(0)
    })

    it('returns 0 for already sorted array', () => {
      const sorter = new ShellSort([1, 2, 3, 4])
      sorter.sort()
      expect(sorter.getSwaps()).toBe(0)
    })

    it('returns positive number for reverse sorted array', () => {
      const sorter = new ShellSort([4, 3, 2, 1])
      sorter.sort()
      expect(sorter.getSwaps()).toBeGreaterThan(0)
    })
  })

  // ─── toArray ───

  describe('toArray', () => {
    it('returns a copy before sorting', () => {
      const sorter = new ShellSort([3, 1, 2])
      expect(sorter.toArray()).toEqual([3, 1, 2])
    })

    it('returns sorted array after sort', () => {
      const sorter = new ShellSort([3, 1, 2])
      sorter.sort()
      expect(sorter.toArray()).toEqual([1, 2, 3])
    })

    it('returns a copy that does not affect internal state', () => {
      const sorter = new ShellSort([3, 1, 2])
      const arr = sorter.toArray()
      arr[0] = 999
      expect(sorter.toArray()[0]).toBe(3)
    })
  })

  // ─── getTimeComplexity ───

  describe('getTimeComplexity', () => {
    it('returns the expected complexity string', () => {
      const sorter = new ShellSort([1])
      expect(sorter.getTimeComplexity()).toBe('O(n^(3/2))')
    })
  })
})
