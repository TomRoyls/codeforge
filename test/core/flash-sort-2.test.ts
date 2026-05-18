import { describe, it, expect } from 'vitest'
import { FlashSort2 } from '../../src/core/flash-sort-2/index.js'

describe('FlashSort2', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('creates instance with default comparator', () => {
      const fs = new FlashSort2<number>()
      expect(fs).toBeInstanceOf(FlashSort2)
    })

    it('creates instance with custom comparator', () => {
      const fs = new FlashSort2<number>((a, b) => b - a)
      expect(fs).toBeInstanceOf(FlashSort2)
    })
  })

  // ─── sort ───
  describe('sort', () => {
    it('returns empty array for empty input', () => {
      const fs = new FlashSort2<number>()
      expect(fs.sort([])).toEqual([])
    })

    it('returns single element for single input', () => {
      const fs = new FlashSort2<number>()
      expect(fs.sort([42])).toEqual([42])
    })

    it('returns sorted for already sorted array', () => {
      const fs = new FlashSort2<number>()
      expect(fs.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts reverse sorted array', () => {
      const fs = new FlashSort2<number>()
      expect(fs.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts random order array', () => {
      const fs = new FlashSort2<number>()
      expect(fs.sort([3, 1, 4, 1, 5, 9, 2, 6])).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
    })

    it('sorts with negative numbers', () => {
      const fs = new FlashSort2<number>()
      expect(fs.sort([-1, -3, -2])).toEqual([-3, -2, -1])
    })

    it('sorts with mixed positive and negative', () => {
      const fs = new FlashSort2<number>()
      expect(fs.sort([3, -1, 0, -5, 2])).toEqual([-5, -1, 0, 2, 3])
    })

    it('sorts array with all equal elements', () => {
      const fs = new FlashSort2<number>()
      expect(fs.sort([5, 5, 5, 5])).toEqual([5, 5, 5, 5])
    })

    it('sorts two elements', () => {
      const fs = new FlashSort2<number>()
      expect(fs.sort([2, 1])).toEqual([1, 2])
    })

    it('does not modify the original array', () => {
      const fs = new FlashSort2<number>()
      const original = [3, 1, 2]
      fs.sort(original)
      expect(original).toEqual([3, 1, 2])
    })

    it('sorts with custom comparator (descending)', () => {
      const fs = new FlashSort2<number>((a, b) => b - a)
      const result = fs.sort([1, 2, 3, 4, 5])
      expect(result).toEqual([5, 4, 3, 2, 1])
    })

    it('sorts large array', () => {
      const fs = new FlashSort2<number>()
      const arr = Array.from({ length: 100 }, (_, i) => 100 - i)
      const result = fs.sort(arr)
      for (let i = 1; i < result.length; i++) {
        expect(result[i]).toBeGreaterThanOrEqual(result[i - 1]!)
      }
    })

    it('sorts with string values', () => {
      const fs = new FlashSort2<string>()
      expect(fs.sort(['banana', 'apple', 'cherry'])).toEqual(['apple', 'banana', 'cherry'])
    })
  })

  // ─── sortInPlace ───
  describe('sortInPlace', () => {
    it('sorts array in place', () => {
      const fs = new FlashSort2<number>()
      const arr = [3, 1, 2]
      fs.sortInPlace(arr)
      expect(arr).toEqual([1, 2, 3])
    })

    it('handles empty array', () => {
      const fs = new FlashSort2<number>()
      const arr: number[] = []
      fs.sortInPlace(arr)
      expect(arr).toEqual([])
    })

    it('handles single element', () => {
      const fs = new FlashSort2<number>()
      const arr = [42]
      fs.sortInPlace(arr)
      expect(arr).toEqual([42])
    })

    it('handles already sorted array', () => {
      const fs = new FlashSort2<number>()
      const arr = [1, 2, 3]
      fs.sortInPlace(arr)
      expect(arr).toEqual([1, 2, 3])
    })

    it('handles all equal elements', () => {
      const fs = new FlashSort2<number>()
      const arr = [7, 7, 7]
      fs.sortInPlace(arr)
      expect(arr).toEqual([7, 7, 7])
    })

    it('sorts large array in place', () => {
      const fs = new FlashSort2<number>()
      const arr = Array.from({ length: 50 }, (_, i) => 50 - i)
      fs.sortInPlace(arr)
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]).toBeGreaterThanOrEqual(arr[i - 1]!)
      }
    })
  })
})
