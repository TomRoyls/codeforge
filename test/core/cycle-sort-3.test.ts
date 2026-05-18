import { describe, it, expect } from 'vitest'
import { CycleSort3 } from '../../src/core/cycle-sort-3/index.js'

describe('CycleSort3', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('creates instance with default comparator', () => {
      const cs = new CycleSort3([3, 1, 2])
      expect(cs).toBeInstanceOf(CycleSort3)
    })

    it('creates instance with custom comparator', () => {
      const cs = new CycleSort3([3, 1, 2], (a, b) => b - a)
      expect(cs).toBeInstanceOf(CycleSort3)
    })

    it('creates instance with empty array', () => {
      const cs = new CycleSort3<number>([])
      expect(cs).toBeInstanceOf(CycleSort3)
    })

    it('does not modify the original array', () => {
      const original = [3, 1, 2]
      new CycleSort3(original)
      expect(original).toEqual([3, 1, 2])
    })
  })

  // ─── sort ───
  describe('sort', () => {
    it('returns empty array for empty input', () => {
      const cs = new CycleSort3<number>([])
      expect(cs.sort()).toEqual([])
    })

    it('returns single element for single input', () => {
      const cs = new CycleSort3([42])
      expect(cs.sort()).toEqual([42])
    })

    it('returns sorted for already sorted array', () => {
      const cs = new CycleSort3([1, 2, 3, 4, 5])
      expect(cs.sort()).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts reverse sorted array', () => {
      const cs = new CycleSort3([5, 4, 3, 2, 1])
      expect(cs.sort()).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts random order array', () => {
      const cs = new CycleSort3([3, 1, 4, 1, 5, 9, 2, 6])
      expect(cs.sort()).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
    })

    it('sorts with negative numbers', () => {
      const cs = new CycleSort3([-1, -3, -2])
      expect(cs.sort()).toEqual([-3, -2, -1])
    })

    it('sorts with mixed positive and negative', () => {
      const cs = new CycleSort3([3, -1, 0, -5, 2])
      expect(cs.sort()).toEqual([-5, -1, 0, 2, 3])
    })

    it('sorts array with all equal elements', () => {
      const cs = new CycleSort3([5, 5, 5, 5])
      expect(cs.sort()).toEqual([5, 5, 5, 5])
    })

    it('sorts two elements', () => {
      const cs = new CycleSort3([2, 1])
      expect(cs.sort()).toEqual([1, 2])
    })

    it('sorts large array', () => {
      const arr = Array.from({ length: 100 }, (_, i) => 100 - i)
      const cs = new CycleSort3(arr)
      const result = cs.sort()
      for (let i = 1; i < result.length; i++) {
        expect(result[i]).toBeGreaterThanOrEqual(result[i - 1]!)
      }
    })

    it('sorts with string values', () => {
      const cs = new CycleSort3(['banana', 'apple', 'cherry'])
      expect(cs.sort()).toEqual(['apple', 'banana', 'cherry'])
    })
  })

  // ─── sortDescending ───
  describe('sortDescending', () => {
    it('returns empty array for empty input', () => {
      const cs = new CycleSort3<number>([])
      expect(cs.sortDescending()).toEqual([])
    })

    it('returns single element for single input', () => {
      const cs = new CycleSort3([42])
      expect(cs.sortDescending()).toEqual([42])
    })

    it('sorts ascending input to descending', () => {
      const cs = new CycleSort3([1, 2, 3])
      expect(cs.sortDescending()).toEqual([3, 2, 1])
    })

    it('sorts random array descending', () => {
      const cs = new CycleSort3([3, 1, 4, 1, 5])
      expect(cs.sortDescending()).toEqual([5, 4, 3, 1, 1])
    })

    it('sorts with negative numbers descending', () => {
      const cs = new CycleSort3([-1, -3, -2])
      expect(cs.sortDescending()).toEqual([-1, -2, -3])
    })
  })

  // ─── isSorted ───
  describe('isSorted', () => {
    it('returns true for empty array', () => {
      const cs = new CycleSort3<number>([])
      expect(cs.isSorted()).toBe(true)
    })

    it('returns true for single element', () => {
      const cs = new CycleSort3([1])
      expect(cs.isSorted()).toBe(true)
    })

    it('returns true for sorted array', () => {
      const cs = new CycleSort3([1, 2, 3, 4, 5])
      expect(cs.isSorted()).toBe(true)
    })

    it('returns false for unsorted array', () => {
      const cs = new CycleSort3([3, 1, 2])
      expect(cs.isSorted()).toBe(false)
    })

    it('returns true for equal elements', () => {
      const cs = new CycleSort3([5, 5, 5])
      expect(cs.isSorted()).toBe(true)
    })

    it('returns false for reverse sorted', () => {
      const cs = new CycleSort3([5, 4, 3, 2, 1])
      expect(cs.isSorted()).toBe(false)
    })
  })

  // ─── countWrites / getWriteCount ───
  describe('countWrites', () => {
    it('returns 0 writes for already sorted array', () => {
      const cs = new CycleSort3([1, 2, 3])
      const writes = cs.countWrites([1, 2, 3])
      expect(writes).toBe(0)
    })

    it('returns non-zero writes for unsorted array', () => {
      const cs = new CycleSort3([1])
      const writes = cs.countWrites([3, 1, 2])
      expect(writes).toBeGreaterThan(0)
    })

    it('returns 0 writes for single element', () => {
      const cs = new CycleSort3([1])
      const writes = cs.countWrites([42])
      expect(writes).toBe(0)
    })

    it('returns 0 writes for empty array', () => {
      const cs = new CycleSort3<number>([])
      const writes = cs.countWrites([])
      expect(writes).toBe(0)
    })
  })

  describe('getWriteCount', () => {
    it('returns 0 before sorting', () => {
      const cs = new CycleSort3([3, 1, 2])
      expect(cs.getWriteCount()).toBe(0)
    })

    it('returns non-zero after sorting', () => {
      const cs = new CycleSort3([3, 1, 2])
      cs.sort()
      expect(cs.getWriteCount()).toBeGreaterThan(0)
    })

    it('returns 0 for empty array sort', () => {
      const cs = new CycleSort3<number>([])
      cs.sort()
      expect(cs.getWriteCount()).toBe(0)
    })
  })

  // ─── Complexity ───
  describe('getTimeComplexity', () => {
    it('returns O(1) for empty array', () => {
      const cs = new CycleSort3<number>([])
      expect(cs.getTimeComplexity()).toBe('O(1)')
    })

    it('returns O(1) for single element', () => {
      const cs = new CycleSort3([1])
      expect(cs.getTimeComplexity()).toBe('O(1)')
    })

    it('returns O(n²) for multiple elements', () => {
      const cs = new CycleSort3([2, 1])
      expect(cs.getTimeComplexity()).toBe('O(n²)')
    })
  })

  describe('getSpaceComplexity', () => {
    it('returns O(1)', () => {
      const cs = new CycleSort3([2, 1])
      expect(cs.getSpaceComplexity()).toBe('O(1)')
    })

    it('returns O(1) for empty array', () => {
      const cs = new CycleSort3<number>([])
      expect(cs.getSpaceComplexity()).toBe('O(1)')
    })
  })
})
