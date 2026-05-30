import { describe, it, expect } from 'vitest'
import { TimSort } from '../../../src/utils/tim-sort.js'

describe('TimSort', () => {
  describe('sort', () => {
    it('sorts empty array', () => {
      expect(TimSort.sort([])).toEqual([])
    })

    it('sorts single element', () => {
      expect(TimSort.sort([1])).toEqual([1])
    })

    it('sorts two elements', () => {
      expect(TimSort.sort([2, 1])).toEqual([1, 2])
    })

    it('sorts already sorted', () => {
      expect(TimSort.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts reverse sorted', () => {
      expect(TimSort.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts random order', () => {
      expect(TimSort.sort([3, 1, 4, 1, 5, 9, 2, 6])).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
    })

    it('sorts with duplicates', () => {
      expect(TimSort.sort([3, 3, 1, 1, 2, 2])).toEqual([1, 1, 2, 2, 3, 3])
    })

    it('sorts with custom comparator (descending)', () => {
      expect(TimSort.sort([1, 2, 3], (a, b) => b - a)).toEqual([3, 2, 1])
    })

    it('sorts with custom comparator (strings)', () => {
      const result = TimSort.sort(['banana', 'apple', 'cherry'], (a, b) => a.localeCompare(b))
      expect(result).toEqual(['apple', 'banana', 'cherry'])
    })

    it('does not mutate original array', () => {
      const original = [3, 1, 2]
      const sorted = TimSort.sort(original)
      expect(sorted).toEqual([1, 2, 3])
      expect(original).toEqual([3, 1, 2])
    })

    it('sorts large array', () => {
      const arr = Array.from({ length: 1000 }, () => Math.random())
      const sorted = TimSort.sort(arr)
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i]!).toBeGreaterThanOrEqual(sorted[i - 1]!)
      }
    })

    it('sorts array of objects by property', () => {
      const arr = [{ x: 3 }, { x: 1 }, { x: 2 }]
      const sorted = TimSort.sort(arr, (a, b) => a.x - b.x)
      expect(sorted.map((o) => o.x)).toEqual([1, 2, 3])
    })

    it('handles all same elements', () => {
      expect(TimSort.sort([5, 5, 5, 5])).toEqual([5, 5, 5, 5])
    })

    it('handles negative numbers', () => {
      expect(TimSort.sort([-3, -1, -2, 0, 2, 1])).toEqual([-3, -2, -1, 0, 1, 2])
    })
  })

  describe('isSorted', () => {
    it('returns true for sorted array', () => {
      expect(TimSort.isSorted([1, 2, 3, 4])).toBe(true)
    })

    it('returns false for unsorted array', () => {
      expect(TimSort.isSorted([3, 1, 2])).toBe(false)
    })

    it('returns true for empty array', () => {
      expect(TimSort.isSorted([])).toBe(true)
    })

    it('returns true for single element', () => {
      expect(TimSort.isSorted([1])).toBe(true)
    })

    it('uses custom comparator', () => {
      expect(TimSort.isSorted([3, 2, 1], (a, b) => b - a)).toBe(true)
    })
  })

  describe('stable', () => {
    it('maintains relative order of equal elements', () => {
      const arr = [
        { id: 1, val: 'b' },
        { id: 2, val: 'a' },
        { id: 3, val: 'b' },
        { id: 4, val: 'a' },
      ]
      const sorted = TimSort.stable(arr, (item) => item.val.charCodeAt(0))
      expect(sorted[0]!.id).toBe(2)
      expect(sorted[1]!.id).toBe(4)
      expect(sorted[2]!.id).toBe(1)
      expect(sorted[3]!.id).toBe(3)
    })
  })

  describe('performance characteristics', () => {
    it('handles array smaller than min merge', () => {
      const arr = [5, 3, 1, 4, 2]
      expect(TimSort.sort(arr)).toEqual([1, 2, 3, 4, 5])
    })

    it('handles array exactly min merge size', () => {
      const arr = Array.from({ length: 32 }, (_, i) => 32 - i)
      const sorted = TimSort.sort(arr)
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i]!).toBeGreaterThanOrEqual(sorted[i - 1]!)
      }
    })

    it('handles array larger than min merge', () => {
      const arr = Array.from({ length: 100 }, (_, i) => 100 - i)
      const sorted = TimSort.sort(arr)
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i]!).toBeGreaterThanOrEqual(sorted[i - 1]!)
      }
    })

    it('handles partially sorted arrays', () => {
      const arr = [1, 2, 3, 5, 4, 6, 7, 8, 10, 9]
      expect(TimSort.sort(arr)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })
  })
})
