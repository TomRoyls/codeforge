import { describe, it, expect } from 'vitest'
import { RadixSort } from '../../../src/utils/radix-sort.js'

describe('RadixSort', () => {
  describe('sort', () => {
    it('sorts empty array', () => {
      expect(RadixSort.sort([])).toEqual([])
    })

    it('sorts single element', () => {
      expect(RadixSort.sort([42])).toEqual([42])
    })

    it('sorts positive integers', () => {
      expect(RadixSort.sort([5, 3, 1, 4, 2])).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts negative integers', () => {
      expect(RadixSort.sort([-3, -1, -2])).toEqual([-3, -2, -1])
    })

    it('sorts mixed positive and negative', () => {
      expect(RadixSort.sort([3, -1, 0, -2, 2, 1])).toEqual([-2, -1, 0, 1, 2, 3])
    })

    it('sorts with duplicates', () => {
      expect(RadixSort.sort([3, 1, 2, 1, 3])).toEqual([1, 1, 2, 3, 3])
    })

    it('sorts descending', () => {
      expect(RadixSort.sort([1, 2, 3], { ascending: false })).toEqual([3, 2, 1])
    })

    it('sorts large numbers', () => {
      expect(RadixSort.sort([1000000, -1000000, 0])).toEqual([-1000000, 0, 1000000])
    })

    it('does not modify original', () => {
      const arr = [3, 1, 2]
      RadixSort.sort(arr)
      expect(arr).toEqual([3, 1, 2])
    })

    it('handles many elements', () => {
      const arr = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 10000) - 5000)
      const sorted = RadixSort.sort(arr)
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i]!).toBeGreaterThanOrEqual(sorted[i - 1]!)
      }
    })

    it('handles all same values', () => {
      expect(RadixSort.sort([5, 5, 5, 5])).toEqual([5, 5, 5, 5])
    })
  })

  describe('sortUnsigned', () => {
    it('sorts unsigned integers', () => {
      expect(RadixSort.sortUnsigned([5, 3, 1, 4, 2])).toEqual([1, 2, 3, 4, 5])
    })

    it('handles empty', () => {
      expect(RadixSort.sortUnsigned([])).toEqual([])
    })

    it('handles large unsigned values', () => {
      expect(RadixSort.sortUnsigned([4000000000, 1, 2000000000])).toEqual([1, 2000000000, 4000000000])
    })
  })

  describe('sortBy', () => {
    it('sorts objects by key', () => {
      const items = [{ v: 3 }, { v: 1 }, { v: 2 }]
      const result = RadixSort.sortBy(items, (x) => x.v)
      expect(result.map((x) => x.v)).toEqual([1, 2, 3])
    })

    it('sorts objects descending', () => {
      const items = [{ v: 1 }, { v: 3 }, { v: 2 }]
      const result = RadixSort.sortBy(items, (x) => x.v, { ascending: false })
      expect(result.map((x) => x.v)).toEqual([3, 2, 1])
    })

    it('preserves objects with duplicate keys', () => {
      const items = [{ v: 2, id: 'a' }, { v: 1, id: 'b' }, { v: 2, id: 'c' }]
      const result = RadixSort.sortBy(items, (x) => x.v)
      expect(result[0]!.id).toBe('b')
      expect(result.length).toBe(3)
    })

    it('handles empty', () => {
      expect(RadixSort.sortBy([], (x: number) => x)).toEqual([])
    })

    it('does not modify original', () => {
      const items = [{ v: 3 }, { v: 1 }]
      RadixSort.sortBy(items, (x) => x.v)
      expect(items[0]!.v).toBe(3)
    })
  })

  describe('sortInPlace', () => {
    it('sorts in place', () => {
      const arr = [3, 1, 2]
      const result = RadixSort.sortInPlace(arr)
      expect(result).toBe(arr)
      expect(arr).toEqual([1, 2, 3])
    })

    it('sorts in place descending', () => {
      const arr = [1, 2, 3]
      RadixSort.sortInPlace(arr, { ascending: false })
      expect(arr).toEqual([3, 2, 1])
    })

    it('handles empty', () => {
      const arr: number[] = []
      expect(RadixSort.sortInPlace(arr)).toEqual([])
    })
  })
})
