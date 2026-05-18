import { describe, it, expect } from 'vitest'
import { CountingSort4 } from '../../src/core/counting-sort-4/index.js'

describe('CountingSort4', () => {
  // ─── Constructor ───

  describe('constructor', () => {
    it('creates instance with empty array', () => {
      const cs = new CountingSort4([])
      expect(cs.toArray()).toEqual([])
      expect(cs.getMin()).toBeUndefined()
      expect(cs.getMax()).toBeUndefined()
    })

    it('creates instance with array', () => {
      const cs = new CountingSort4([3, 1, 2])
      expect(cs.toArray()).toEqual([3, 1, 2])
    })

    it('creates instance with maxValue', () => {
      const cs = new CountingSort4([1, 2, 3], 10)
      expect(cs.toArray()).toEqual([1, 2, 3])
    })

    it('defensive copies input array', () => {
      const input = [1, 2, 3]
      const cs = new CountingSort4(input)
      input.push(4)
      expect(cs.toArray()).toEqual([1, 2, 3])
    })
  })

  // ─── sort ───

  describe('sort', () => {
    it('sorts empty array', () => {
      const cs = new CountingSort4([])
      expect(cs.sort([])).toEqual([])
    })

    it('sorts single element', () => {
      const cs = new CountingSort4([5])
      expect(cs.sort([5])).toEqual([5])
    })

    it('sorts ascending', () => {
      const cs = new CountingSort4([1])
      expect(cs.sort([5, 3, 1, 4, 2])).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts already sorted', () => {
      const cs = new CountingSort4([1])
      expect(cs.sort([1, 2, 3])).toEqual([1, 2, 3])
    })

    it('sorts with duplicates', () => {
      const cs = new CountingSort4([1])
      expect(cs.sort([3, 1, 2, 1, 3])).toEqual([1, 1, 2, 3, 3])
    })

    it('sorts negative numbers', () => {
      const cs = new CountingSort4([1])
      expect(cs.sort([-3, -1, 0, 2, -2])).toEqual([-3, -2, -1, 0, 2])
    })

    it('sorts all same elements', () => {
      const cs = new CountingSort4([1])
      expect(cs.sort([7, 7, 7])).toEqual([7, 7, 7])
    })
  })

  // ─── sortDescending ───

  describe('sortDescending', () => {
    it('sorts descending empty', () => {
      const cs = new CountingSort4([])
      expect(cs.sortDescending([])).toEqual([])
    })

    it('sorts descending', () => {
      const cs = new CountingSort4([1])
      expect(cs.sortDescending([1, 3, 2, 5, 4])).toEqual([5, 4, 3, 2, 1])
    })

    it('sorts descending with duplicates', () => {
      const cs = new CountingSort4([1])
      expect(cs.sortDescending([1, 3, 1, 2])).toEqual([3, 2, 1, 1])
    })

    it('sorts descending negative numbers', () => {
      const cs = new CountingSort4([1])
      expect(cs.sortDescending([-2, 1, -1, 0])).toEqual([1, 0, -1, -2])
    })
  })

  // ─── isSorted ───

  describe('isSorted', () => {
    it('returns true for empty array', () => {
      const cs = new CountingSort4([])
      expect(cs.isSorted([])).toBe(true)
    })

    it('returns true for single element', () => {
      const cs = new CountingSort4([1])
      expect(cs.isSorted([5])).toBe(true)
    })

    it('returns true for sorted array', () => {
      const cs = new CountingSort4([1])
      expect(cs.isSorted([1, 2, 3])).toBe(true)
    })

    it('returns false for unsorted array', () => {
      const cs = new CountingSort4([1])
      expect(cs.isSorted([3, 1, 2])).toBe(false)
    })
  })

  // ─── static sortByKey ───

  describe('static sortByKey', () => {
    it('sorts objects by numeric key', () => {
      const items = [{ v: 3 }, { v: 1 }, { v: 2 }]
      const result = CountingSort4.sortByKey(items, (item) => item.v)
      expect(result.map((r) => r.v)).toEqual([1, 2, 3])
    })

    it('returns empty for empty array', () => {
      expect(CountingSort4.sortByKey([], (x: number) => x)).toEqual([])
    })

    it('preserves objects with same key', () => {
      const items = [{ v: 1, n: 'a' }, { v: 1, n: 'b' }, { v: 2, n: 'c' }]
      const result = CountingSort4.sortByKey(items, (item) => item.v)
      expect(result.length).toBe(3)
      expect(result[0]!.v).toBe(1)
      expect(result[2]!.v).toBe(2)
    })

    it('sorts single element', () => {
      const items = [{ v: 5 }]
      const result = CountingSort4.sortByKey(items, (item) => item.v)
      expect(result).toEqual([{ v: 5 }])
    })
  })

  // ─── static countFrequency ───

  describe('static countFrequency', () => {
    it('counts frequency of value', () => {
      expect(CountingSort4.countFrequency([1, 2, 2, 3, 3, 3], 3)).toBe(3)
    })

    it('returns 0 for absent value', () => {
      expect(CountingSort4.countFrequency([1, 2, 3], 5)).toBe(0)
    })

    it('returns 0 for empty array', () => {
      expect(CountingSort4.countFrequency([], 1)).toBe(0)
    })

    it('counts single occurrence', () => {
      expect(CountingSort4.countFrequency([1, 2, 3], 2)).toBe(1)
    })
  })

  // ─── static getMin / getMax ───

  describe('static getMin and getMax', () => {
    it('getMin returns undefined for empty', () => {
      expect(CountingSort4.getMin([])).toBeUndefined()
    })

    it('getMax returns undefined for empty', () => {
      expect(CountingSort4.getMax([])).toBeUndefined()
    })

    it('getMin returns minimum', () => {
      expect(CountingSort4.getMin([5, 1, 3])).toBe(1)
    })

    it('getMax returns maximum', () => {
      expect(CountingSort4.getMax([5, 1, 3])).toBe(5)
    })

    it('handles negatives', () => {
      expect(CountingSort4.getMin([-5, -1, -3])).toBe(-5)
      expect(CountingSort4.getMax([-5, -1, -3])).toBe(-1)
    })
  })

  // ─── static stableCountSort ───

  describe('static stableCountSort', () => {
    it('sorts stably', () => {
      expect(CountingSort4.stableCountSort([3, 1, 2])).toEqual([1, 2, 3])
    })

    it('returns empty for empty array', () => {
      expect(CountingSort4.stableCountSort([])).toEqual([])
    })

    it('handles duplicates', () => {
      expect(CountingSort4.stableCountSort([2, 1, 2, 1])).toEqual([1, 1, 2, 2])
    })

    it('handles negatives', () => {
      expect(CountingSort4.stableCountSort([-1, 2, 0, -2])).toEqual([-2, -1, 0, 2])
    })

    it('preserves stability for same values', () => {
      const input = [2, 1, 2]
      const result = CountingSort4.stableCountSort(input)
      expect(result).toEqual([1, 2, 2])
    })
  })

  // ─── static countDistinct ───

  describe('static countDistinct', () => {
    it('counts distinct values', () => {
      expect(CountingSort4.countDistinct([1, 2, 2, 3, 3, 3])).toBe(3)
    })

    it('returns 0 for empty', () => {
      expect(CountingSort4.countDistinct([])).toBe(0)
    })

    it('returns 1 for all same', () => {
      expect(CountingSort4.countDistinct([5, 5, 5])).toBe(1)
    })

    it('returns length for all unique', () => {
      expect(CountingSort4.countDistinct([1, 2, 3, 4])).toBe(4)
    })
  })

  // ─── static histogram ───

  describe('static histogram', () => {
    it('creates histogram', () => {
      const hist = CountingSort4.histogram([1, 2, 2, 3, 3, 3])
      expect(hist.get(1)).toBe(1)
      expect(hist.get(2)).toBe(2)
      expect(hist.get(3)).toBe(3)
    })

    it('returns empty map for empty array', () => {
      const hist = CountingSort4.histogram([])
      expect(hist.size).toBe(0)
    })

    it('handles single element', () => {
      const hist = CountingSort4.histogram([7])
      expect(hist.get(7)).toBe(1)
    })
  })

  // ─── instance getters ───

  describe('instance getters', () => {
    it('getCounts returns count array', () => {
      const cs = new CountingSort4([1, 2, 3])
      const counts = cs.getCounts()
      expect(counts.length).toBeGreaterThan(0)
    })

    it('getCounts returns copy', () => {
      const cs = new CountingSort4([1, 2])
      const counts = cs.getCounts()
      counts[0] = 999
      expect(cs.getCounts()[0]).not.toBe(999)
    })

    it('getMin returns constructor min', () => {
      const cs = new CountingSort4([5, 1, 3])
      expect(cs.getMin()).toBe(1)
    })

    it('getMax returns constructor max', () => {
      const cs = new CountingSort4([5, 1, 3])
      expect(cs.getMax()).toBe(5)
    })

    it('getMin returns undefined for empty', () => {
      const cs = new CountingSort4([])
      expect(cs.getMin()).toBeUndefined()
    })

    it('getMax returns undefined for empty', () => {
      const cs = new CountingSort4([])
      expect(cs.getMax()).toBeUndefined()
    })

    it('getRange returns correct range', () => {
      const cs = new CountingSort4([1, 3, 5])
      expect(cs.getRange()).toBe(5)
    })

    it('toArray returns copy', () => {
      const cs = new CountingSort4([1, 2, 3])
      const arr = cs.toArray()
      arr.push(4)
      expect(cs.toArray().length).toBe(3)
    })

    it('getTimeComplexity returns expected format', () => {
      const cs = new CountingSort4([1, 2, 3])
      expect(cs.getTimeComplexity()).toContain('O(n + k)')
    })

    it('getSpaceComplexity returns expected format', () => {
      const cs = new CountingSort4([1, 2, 3])
      expect(cs.getSpaceComplexity()).toContain('O(k)')
    })
  })
})
