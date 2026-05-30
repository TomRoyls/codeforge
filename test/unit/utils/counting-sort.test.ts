import { describe, it, expect } from 'vitest'
import { CountingSort } from '../../../src/utils/counting-sort.js'

describe('CountingSort', () => {
  describe('sort', () => {
    it('sorts empty array', () => {
      expect(CountingSort.sort([])).toEqual([])
    })

    it('sorts single element', () => {
      expect(CountingSort.sort([5])).toEqual([5])
    })

    it('sorts two elements', () => {
      expect(CountingSort.sort([3, 1])).toEqual([1, 3])
    })

    it('sorts already sorted', () => {
      expect(CountingSort.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts reverse sorted', () => {
      expect(CountingSort.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts with duplicates', () => {
      expect(CountingSort.sort([3, 1, 2, 1, 3, 2])).toEqual([1, 1, 2, 2, 3, 3])
    })

    it('sorts with negative numbers', () => {
      expect(CountingSort.sort([-2, -5, -1, -3])).toEqual([-5, -3, -2, -1])
    })

    it('sorts mixed positive and negative', () => {
      expect(CountingSort.sort([3, -1, 0, -2, 2])).toEqual([-2, -1, 0, 2, 3])
    })

    it('sorts all same elements', () => {
      expect(CountingSort.sort([7, 7, 7, 7])).toEqual([7, 7, 7, 7])
    })

    it('does not modify original', () => {
      const arr = [3, 1, 2]
      const sorted = CountingSort.sort(arr)
      expect(arr).toEqual([3, 1, 2])
      expect(sorted).toEqual([1, 2, 3])
    })

    it('uses provided min/max', () => {
      const result = CountingSort.sort([3, 1, 2], { min: 0, max: 5 })
      expect(result).toEqual([1, 2, 3])
    })

    it('handles large range fallback', () => {
      const arr = [1, 1_000_001, 2]
      const result = CountingSort.sort(arr)
      expect(result).toEqual([1, 2, 1_000_001])
    })
  })

  describe('sortBy', () => {
    it('sorts objects by key', () => {
      const items = [{ v: 3 }, { v: 1 }, { v: 2 }]
      const result = CountingSort.sortBy(items, (x) => x.v)
      expect(result.map((x) => x.v)).toEqual([1, 2, 3])
    })

    it('sorts objects with duplicate keys', () => {
      const items = [{ v: 2, id: 'a' }, { v: 1, id: 'b' }, { v: 2, id: 'c' }]
      const result = CountingSort.sortBy(items, (x) => x.v)
      expect(result[0]!.id).toBe('b')
    })

    it('does not modify original', () => {
      const items = [{ v: 3 }, { v: 1 }]
      CountingSort.sortBy(items, (x) => x.v)
      expect(items[0]!.v).toBe(3)
    })

    it('handles empty array', () => {
      expect(CountingSort.sortBy([], (x: number) => x)).toEqual([])
    })

    it('handles single element', () => {
      expect(CountingSort.sortBy([{ a: 1 }], (x) => x.a)).toEqual([{ a: 1 }])
    })
  })

  describe('sortInPlace', () => {
    it('sorts in place', () => {
      const arr = [3, 1, 2]
      const result = CountingSort.sortInPlace(arr)
      expect(result).toBe(arr)
      expect(arr).toEqual([1, 2, 3])
    })

    it('handles empty', () => {
      const arr: number[] = []
      expect(CountingSort.sortInPlace(arr)).toEqual([])
    })

    it('handles single element', () => {
      const arr = [42]
      expect(CountingSort.sortInPlace(arr)).toEqual([42])
    })
  })

  describe('countFrequencies', () => {
    it('counts frequencies', () => {
      const freq = CountingSort.countFrequencies([1, 2, 2, 3, 3, 3])
      expect(freq.get(1)).toBe(1)
      expect(freq.get(2)).toBe(2)
      expect(freq.get(3)).toBe(3)
    })

    it('handles empty', () => {
      expect(CountingSort.countFrequencies([]).size).toBe(0)
    })

    it('handles negative numbers', () => {
      const freq = CountingSort.countFrequencies([-1, -1, 0, 1])
      expect(freq.get(-1)).toBe(2)
      expect(freq.get(0)).toBe(1)
      expect(freq.get(1)).toBe(1)
    })

    it('returns Map', () => {
      const freq = CountingSort.countFrequencies([5])
      expect(freq).toBeInstanceOf(Map)
      expect(freq.size).toBe(1)
    })
  })
})
