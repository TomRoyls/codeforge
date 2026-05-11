import { describe, it, expect } from 'vitest'
import { CountingSort } from '../../src/core/counting-sort/index.js'
import type { CountingSortOptions, DistributionEntry } from '../../src/core/counting-sort/index.js'

describe('CountingSort', () => {
  describe('constructor', () => {
    it('creates instance with no options', () => {
      const cs = new CountingSort()
      expect(cs.uniqueCount).toBe(0)
      expect(cs.totalElements).toBe(0)
      expect(cs.min).toBeUndefined()
      expect(cs.max).toBeUndefined()
      expect(cs.range).toBe(0)
    })

    it('creates instance with min option', () => {
      const cs = new CountingSort({ min: 0 })
      expect(cs.uniqueCount).toBe(0)
    })

    it('creates instance with max option', () => {
      const cs = new CountingSort({ max: 100 })
      expect(cs.uniqueCount).toBe(0)
    })

    it('creates instance with both min and max', () => {
      const cs = new CountingSort({ min: -10, max: 10 })
      expect(cs.uniqueCount).toBe(0)
    })

    it('creates independent instances', () => {
      const cs1 = new CountingSort()
      const cs2 = new CountingSort()
      cs1.sort([1, 2, 3])
      expect(cs2.uniqueCount).toBe(0)
    })
  })

  describe('sort', () => {
    it('returns empty array for empty input', () => {
      const cs = new CountingSort()
      expect(cs.sort([])).toEqual([])
    })

    it('returns single element for single input', () => {
      const cs = new CountingSort()
      expect(cs.sort([42])).toEqual([42])
    })

    it('sorts two elements', () => {
      const cs = new CountingSort()
      expect(cs.sort([2, 1])).toEqual([1, 2])
    })

    it('sorts already sorted array', () => {
      const cs = new CountingSort()
      expect(cs.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts reverse sorted array', () => {
      const cs = new CountingSort()
      expect(cs.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts random array', () => {
      const cs = new CountingSort()
      expect(cs.sort([3, 1, 4, 1, 5, 9, 2, 6])).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
    })

    it('handles duplicates', () => {
      const cs = new CountingSort()
      expect(cs.sort([3, 3, 3, 1, 1, 2, 2])).toEqual([1, 1, 2, 2, 3, 3, 3])
    })

    it('handles all identical elements', () => {
      const cs = new CountingSort()
      expect(cs.sort([5, 5, 5, 5, 5])).toEqual([5, 5, 5, 5, 5])
    })

    it('does not modify original array', () => {
      const cs = new CountingSort()
      const original = [3, 1, 2]
      const sorted = cs.sort(original)
      expect(original).toEqual([3, 1, 2])
      expect(sorted).toEqual([1, 2, 3])
    })

    it('handles zeros', () => {
      const cs = new CountingSort()
      expect(cs.sort([0, 0, 0, 0])).toEqual([0, 0, 0, 0])
    })

    it('handles single zero', () => {
      const cs = new CountingSort()
      expect(cs.sort([0])).toEqual([0])
    })

    it('sorts array with small range', () => {
      const cs = new CountingSort()
      expect(cs.sort([2, 0, 1, 2, 0, 1])).toEqual([0, 0, 1, 1, 2, 2])
    })

    it('handles negative integers', () => {
      const cs = new CountingSort()
      expect(cs.sort([-3, -1, -2, -5, -4])).toEqual([-5, -4, -3, -2, -1])
    })

    it('handles mixed positive and negative', () => {
      const cs = new CountingSort()
      expect(cs.sort([3, -1, 0, -2, 2])).toEqual([-2, -1, 0, 2, 3])
    })

    it('handles array of size 2 already sorted', () => {
      const cs = new CountingSort()
      expect(cs.sort([1, 2])).toEqual([1, 2])
    })

    it('handles array with one element out of order at start', () => {
      const cs = new CountingSort()
      expect(cs.sort([5, 1, 2, 3, 4])).toEqual([1, 2, 3, 4, 5])
    })

    it('handles array with one element out of order at end', () => {
      const cs = new CountingSort()
      expect(cs.sort([2, 3, 4, 5, 1])).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts large array', () => {
      const cs = new CountingSort()
      const arr = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 100))
      const sorted = cs.sort(arr)
      expect(sorted).toHaveLength(1000)
      expect(CountingSort.isSorted(sorted)).toBe(true)
    })

    it('handles values starting from non-zero min', () => {
      const cs = new CountingSort()
      expect(cs.sort([10, 12, 11, 10])).toEqual([10, 10, 11, 12])
    })

    it('handles array where all elements are the same except one', () => {
      const cs = new CountingSort()
      expect(cs.sort([5, 5, 3, 5, 5])).toEqual([3, 5, 5, 5, 5])
    })

    it('handles array of size 3', () => {
      const cs = new CountingSort()
      expect(cs.sort([3, 1, 2])).toEqual([1, 2, 3])
    })

    it('handles array of size 4', () => {
      const cs = new CountingSort()
      expect(cs.sort([4, 2, 3, 1])).toEqual([1, 2, 3, 4])
    })

    it('handles binary values 0 and 1', () => {
      const cs = new CountingSort()
      expect(cs.sort([1, 0, 1, 0, 0, 1])).toEqual([0, 0, 0, 1, 1, 1])
    })

    it('preserves all elements after sort', () => {
      const cs = new CountingSort()
      const arr = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]
      const sorted = cs.sort(arr)
      expect(sorted).toHaveLength(arr.length)
      const counts = new Map<number, number>()
      for (const v of arr) counts.set(v, (counts.get(v) ?? 0) + 1)
      for (const v of sorted) counts.set(v, (counts.get(v) ?? 0) - 1)
      for (const c of counts.values()) expect(c).toBe(0)
    })
  })

  describe('sortDescending', () => {
    it('returns empty array for empty input', () => {
      const cs = new CountingSort()
      expect(cs.sortDescending([])).toEqual([])
    })

    it('returns single element for single input', () => {
      const cs = new CountingSort()
      expect(cs.sortDescending([42])).toEqual([42])
    })

    it('sorts two elements descending', () => {
      const cs = new CountingSort()
      expect(cs.sortDescending([1, 2])).toEqual([2, 1])
    })

    it('sorts descending', () => {
      const cs = new CountingSort()
      expect(cs.sortDescending([1, 2, 3, 4, 5])).toEqual([5, 4, 3, 2, 1])
    })

    it('sorts ascending array descending', () => {
      const cs = new CountingSort()
      expect(cs.sortDescending([5, 4, 3, 2, 1])).toEqual([5, 4, 3, 2, 1])
    })

    it('handles duplicates descending', () => {
      const cs = new CountingSort()
      expect(cs.sortDescending([1, 1, 2, 2, 3, 3, 3])).toEqual([3, 3, 3, 2, 2, 1, 1])
    })

    it('handles all identical elements descending', () => {
      const cs = new CountingSort()
      expect(cs.sortDescending([5, 5, 5, 5])).toEqual([5, 5, 5, 5])
    })

    it('does not modify original array', () => {
      const cs = new CountingSort()
      const original = [3, 1, 2]
      cs.sortDescending(original)
      expect(original).toEqual([3, 1, 2])
    })

    it('handles negative integers descending', () => {
      const cs = new CountingSort()
      expect(cs.sortDescending([-3, -1, -2, -5, -4])).toEqual([-1, -2, -3, -4, -5])
    })

    it('handles mixed positive and negative descending', () => {
      const cs = new CountingSort()
      expect(cs.sortDescending([3, -1, 0, -2, 2])).toEqual([3, 2, 0, -1, -2])
    })

    it('handles zeros descending', () => {
      const cs = new CountingSort()
      expect(cs.sortDescending([0, 0, 0])).toEqual([0, 0, 0])
    })

    it('sorts large array descending', () => {
      const cs = new CountingSort()
      const arr = Array.from({ length: 500 }, () => Math.floor(Math.random() * 50))
      const sorted = cs.sortDescending(arr)
      expect(sorted).toHaveLength(500)
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i]! <= sorted[i - 1]!).toBe(true)
      }
    })

    it('handles single zero descending', () => {
      const cs = new CountingSort()
      expect(cs.sortDescending([0])).toEqual([0])
    })

    it('handles array of size 3 descending', () => {
      const cs = new CountingSort()
      expect(cs.sortDescending([1, 3, 2])).toEqual([3, 2, 1])
    })
  })

  describe('sortInRange', () => {
    it('returns empty array for empty input', () => {
      const cs = new CountingSort()
      expect(cs.sortInRange([], 0, 10)).toEqual([])
    })

    it('returns single element for single input', () => {
      const cs = new CountingSort()
      expect(cs.sortInRange([5], 0, 10)).toEqual([5])
    })

    it('sorts within specified range', () => {
      const cs = new CountingSort()
      expect(cs.sortInRange([3, 1, 4, 1, 5], 0, 5)).toEqual([1, 1, 3, 4, 5])
    })

    it('sorts with explicit min and max', () => {
      const cs = new CountingSort()
      expect(cs.sortInRange([5, 3, 1], 1, 5)).toEqual([1, 3, 5])
    })

    it('handles range larger than actual values', () => {
      const cs = new CountingSort()
      expect(cs.sortInRange([2, 1, 3], 0, 10)).toEqual([1, 2, 3])
    })

    it('handles negative range', () => {
      const cs = new CountingSort()
      expect(cs.sortInRange([2, -1, 0], -5, 5)).toEqual([-1, 0, 2])
    })

    it('handles range from 0 to max', () => {
      const cs = new CountingSort()
      expect(cs.sortInRange([3, 0, 2, 1], 0, 3)).toEqual([0, 1, 2, 3])
    })

    it('handles duplicates with range', () => {
      const cs = new CountingSort()
      expect(cs.sortInRange([3, 1, 3, 1, 2], 0, 3)).toEqual([1, 1, 2, 3, 3])
    })

    it('does not modify original array', () => {
      const cs = new CountingSort()
      const original = [3, 1, 2]
      cs.sortInRange(original, 0, 5)
      expect(original).toEqual([3, 1, 2])
    })

    it('handles negative-only range', () => {
      const cs = new CountingSort()
      expect(cs.sortInRange([-3, -1, -2], -5, 0)).toEqual([-3, -2, -1])
    })

    it('handles single value range', () => {
      const cs = new CountingSort()
      expect(cs.sortInRange([5, 5, 5], 5, 5)).toEqual([5, 5, 5])
    })

    it('handles wide range with few values', () => {
      const cs = new CountingSort()
      expect(cs.sortInRange([100, -100, 0], -200, 200)).toEqual([-100, 0, 100])
    })
  })

  describe('sortStable', () => {
    it('returns empty array for empty input', () => {
      const cs = new CountingSort()
      expect(cs.sortStable([])).toEqual([])
    })

    it('returns single element for single input', () => {
      const cs = new CountingSort()
      expect(cs.sortStable([42])).toEqual([42])
    })

    it('sorts correctly', () => {
      const cs = new CountingSort()
      expect(cs.sortStable([3, 1, 4, 1, 5])).toEqual([1, 1, 3, 4, 5])
    })

    it('does not modify original array', () => {
      const cs = new CountingSort()
      const original = [3, 1, 2]
      cs.sortStable(original)
      expect(original).toEqual([3, 1, 2])
    })

    it('produces same result as sort for simple numbers', () => {
      const cs = new CountingSort()
      const arr = [5, 3, 1, 4, 2]
      expect(cs.sortStable(arr)).toEqual(cs.sort(arr))
    })

    it('handles negative integers', () => {
      const cs = new CountingSort()
      expect(cs.sortStable([-3, -1, -2, -5])).toEqual([-5, -3, -2, -1])
    })

    it('handles all identical elements', () => {
      const cs = new CountingSort()
      expect(cs.sortStable([5, 5, 5, 5])).toEqual([5, 5, 5, 5])
    })

    it('handles zeros', () => {
      const cs = new CountingSort()
      expect(cs.sortStable([0, 0, 0])).toEqual([0, 0, 0])
    })

    it('sorts large array', () => {
      const cs = new CountingSort()
      const arr = Array.from({ length: 500 }, () => Math.floor(Math.random() * 50))
      const sorted = cs.sortStable(arr)
      expect(CountingSort.isSorted(sorted)).toBe(true)
    })

    it('handles reverse sorted input', () => {
      const cs = new CountingSort()
      expect(cs.sortStable([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
    })

    it('handles array of size 3', () => {
      const cs = new CountingSort()
      expect(cs.sortStable([3, 1, 2])).toEqual([1, 2, 3])
    })

    it('handles array of size 2', () => {
      const cs = new CountingSort()
      expect(cs.sortStable([2, 1])).toEqual([1, 2])
    })
  })

  describe('getCount', () => {
    it('returns 0 before processing', () => {
      const cs = new CountingSort()
      expect(cs.getCount(5)).toBe(0)
    })

    it('returns count after sorting', () => {
      const cs = new CountingSort()
      cs.sort([1, 2, 2, 3, 3, 3])
      expect(cs.getCount(1)).toBe(1)
      expect(cs.getCount(2)).toBe(2)
      expect(cs.getCount(3)).toBe(3)
    })

    it('returns 0 for value not in array', () => {
      const cs = new CountingSort()
      cs.sort([1, 2, 3])
      expect(cs.getCount(4)).toBe(0)
    })

    it('returns 0 for value outside range', () => {
      const cs = new CountingSort()
      cs.sort([1, 2, 3])
      expect(cs.getCount(100)).toBe(0)
      expect(cs.getCount(-1)).toBe(0)
    })

    it('returns count after sortDescending', () => {
      const cs = new CountingSort()
      cs.sortDescending([1, 2, 2, 3])
      expect(cs.getCount(2)).toBe(2)
    })

    it('returns count after sortInRange', () => {
      const cs = new CountingSort()
      cs.sortInRange([1, 2, 2, 3, 3, 3], 0, 5)
      expect(cs.getCount(3)).toBe(3)
    })

    it('returns count after sortStable', () => {
      const cs = new CountingSort()
      cs.sortStable([1, 1, 2])
      expect(cs.getCount(1)).toBe(2)
      expect(cs.getCount(2)).toBe(1)
    })

    it('handles single element', () => {
      const cs = new CountingSort()
      cs.sort([5])
      expect(cs.getCount(5)).toBe(1)
    })

    it('handles all same elements', () => {
      const cs = new CountingSort()
      cs.sort([7, 7, 7, 7])
      expect(cs.getCount(7)).toBe(4)
    })

    it('handles zeros', () => {
      const cs = new CountingSort()
      cs.sort([0, 0, 0])
      expect(cs.getCount(0)).toBe(3)
    })

    it('handles negative values', () => {
      const cs = new CountingSort()
      cs.sort([-1, -2, -2, -3])
      expect(cs.getCount(-2)).toBe(2)
      expect(cs.getCount(-1)).toBe(1)
    })
  })

  describe('getDistribution', () => {
    it('returns empty array before processing', () => {
      const cs = new CountingSort()
      expect(cs.getDistribution()).toEqual([])
    })

    it('returns distribution after sorting', () => {
      const cs = new CountingSort()
      cs.sort([1, 2, 2, 3, 3, 3])
      const dist = cs.getDistribution()
      expect(dist).toEqual([
        { value: 1, count: 1 },
        { value: 2, count: 2 },
        { value: 3, count: 3 },
      ])
    })

    it('returns distribution for single element', () => {
      const cs = new CountingSort()
      cs.sort([5])
      expect(cs.getDistribution()).toEqual([{ value: 5, count: 1 }])
    })

    it('returns distribution for all same elements', () => {
      const cs = new CountingSort()
      cs.sort([3, 3, 3])
      expect(cs.getDistribution()).toEqual([{ value: 3, count: 3 }])
    })

    it('returns sorted distribution', () => {
      const cs = new CountingSort()
      cs.sort([3, 1, 2])
      const dist = cs.getDistribution()
      expect(dist.map(d => d.value)).toEqual([1, 2, 3])
    })

    it('handles negative values in distribution', () => {
      const cs = new CountingSort()
      cs.sort([-2, -1, -1, 0])
      const dist = cs.getDistribution()
      expect(dist).toEqual([
        { value: -2, count: 1 },
        { value: -1, count: 2 },
        { value: 0, count: 1 },
      ])
    })

    it('returns correct distribution after sortDescending', () => {
      const cs = new CountingSort()
      cs.sortDescending([1, 1, 2, 3])
      const dist = cs.getDistribution()
      expect(dist).toEqual([
        { value: 1, count: 2 },
        { value: 2, count: 1 },
        { value: 3, count: 1 },
      ])
    })

    it('excludes zero-count values', () => {
      const cs = new CountingSort()
      cs.sortInRange([1, 3], 0, 5)
      const dist = cs.getDistribution()
      expect(dist).toEqual([
        { value: 1, count: 1 },
        { value: 3, count: 1 },
      ])
    })

    it('counts sum equals total elements', () => {
      const cs = new CountingSort()
      cs.sort([1, 2, 2, 3, 3, 3])
      const dist = cs.getDistribution()
      const sum = dist.reduce((acc, d) => acc + d.count, 0)
      expect(sum).toBe(6)
    })

    it('handles large unique set', () => {
      const cs = new CountingSort()
      const arr = Array.from({ length: 100 }, (_, i) => i)
      cs.sort(arr)
      const dist = cs.getDistribution()
      expect(dist).toHaveLength(100)
      expect(dist[0]!).toEqual({ value: 0, count: 1 })
      expect(dist[99]!).toEqual({ value: 99, count: 1 })
    })
  })

  describe('min', () => {
    it('returns undefined before processing', () => {
      const cs = new CountingSort()
      expect(cs.min).toBeUndefined()
    })

    it('returns minimum after sorting', () => {
      const cs = new CountingSort()
      cs.sort([3, 1, 2])
      expect(cs.min).toBe(1)
    })

    it('returns minimum for negative values', () => {
      const cs = new CountingSort()
      cs.sort([-5, -1, -3])
      expect(cs.min).toBe(-5)
    })

    it('returns minimum for single element', () => {
      const cs = new CountingSort()
      cs.sort([42])
      expect(cs.min).toBe(42)
    })

    it('uses configured min if smaller', () => {
      const cs = new CountingSort({ min: -10 })
      cs.sort([1, 2, 3])
      expect(cs.min).toBe(-10)
    })
  })

  describe('max', () => {
    it('returns undefined before processing', () => {
      const cs = new CountingSort()
      expect(cs.max).toBeUndefined()
    })

    it('returns maximum after sorting', () => {
      const cs = new CountingSort()
      cs.sort([3, 1, 2])
      expect(cs.max).toBe(3)
    })

    it('returns maximum for negative values', () => {
      const cs = new CountingSort()
      cs.sort([-5, -1, -3])
      expect(cs.max).toBe(-1)
    })

    it('returns maximum for single element', () => {
      const cs = new CountingSort()
      cs.sort([42])
      expect(cs.max).toBe(42)
    })

    it('uses configured max if larger', () => {
      const cs = new CountingSort({ max: 100 })
      cs.sort([1, 2, 3])
      expect(cs.max).toBe(100)
    })
  })

  describe('range', () => {
    it('returns 0 before processing', () => {
      const cs = new CountingSort()
      expect(cs.range).toBe(0)
    })

    it('returns correct range after sorting', () => {
      const cs = new CountingSort()
      cs.sort([1, 2, 3, 4, 5])
      expect(cs.range).toBe(4)
    })

    it('returns 0 for single element', () => {
      const cs = new CountingSort()
      cs.sort([5])
      expect(cs.range).toBe(0)
    })

    it('returns correct range for negative values', () => {
      const cs = new CountingSort()
      cs.sort([-5, 0, 5])
      expect(cs.range).toBe(10)
    })

    it('returns correct range with configured bounds', () => {
      const cs = new CountingSort({ min: -10, max: 10 })
      cs.sort([1, 2, 3])
      expect(cs.range).toBe(20)
    })
  })

  describe('uniqueCount', () => {
    it('returns 0 before processing', () => {
      const cs = new CountingSort()
      expect(cs.uniqueCount).toBe(0)
    })

    it('returns correct unique count', () => {
      const cs = new CountingSort()
      cs.sort([1, 2, 2, 3, 3, 3])
      expect(cs.uniqueCount).toBe(3)
    })

    it('returns 1 for all same elements', () => {
      const cs = new CountingSort()
      cs.sort([5, 5, 5])
      expect(cs.uniqueCount).toBe(1)
    })

    it('returns 0 for empty array', () => {
      const cs = new CountingSort()
      cs.sort([])
      expect(cs.uniqueCount).toBe(0)
    })

    it('returns 1 for single element', () => {
      const cs = new CountingSort()
      cs.sort([42])
      expect(cs.uniqueCount).toBe(1)
    })

    it('counts negative values as unique', () => {
      const cs = new CountingSort()
      cs.sort([-1, 0, 1])
      expect(cs.uniqueCount).toBe(3)
    })
  })

  describe('totalElements', () => {
    it('returns 0 before processing', () => {
      const cs = new CountingSort()
      expect(cs.totalElements).toBe(0)
    })

    it('returns array length after sorting', () => {
      const cs = new CountingSort()
      cs.sort([1, 2, 3])
      expect(cs.totalElements).toBe(3)
    })

    it('returns 0 for empty array', () => {
      const cs = new CountingSort()
      cs.sort([])
      expect(cs.totalElements).toBe(0)
    })

    it('returns correct count with duplicates', () => {
      const cs = new CountingSort()
      cs.sort([1, 1, 1, 1])
      expect(cs.totalElements).toBe(4)
    })
  })

  describe('isSorted (static)', () => {
    it('returns true for empty array', () => {
      expect(CountingSort.isSorted([])).toBe(true)
    })

    it('returns true for single element', () => {
      expect(CountingSort.isSorted([1])).toBe(true)
    })

    it('returns true for sorted array', () => {
      expect(CountingSort.isSorted([1, 2, 3, 4, 5])).toBe(true)
    })

    it('returns false for unsorted array', () => {
      expect(CountingSort.isSorted([3, 1, 2])).toBe(false)
    })

    it('returns true for equal elements', () => {
      expect(CountingSort.isSorted([5, 5, 5])).toBe(true)
    })

    it('returns false for reverse sorted', () => {
      expect(CountingSort.isSorted([5, 4, 3, 2, 1])).toBe(false)
    })

    it('returns false when last two are out of order', () => {
      expect(CountingSort.isSorted([1, 2, 3, 5, 4])).toBe(false)
    })

    it('returns false when first two are out of order', () => {
      expect(CountingSort.isSorted([2, 1, 3, 4, 5])).toBe(false)
    })

    it('handles two sorted elements', () => {
      expect(CountingSort.isSorted([1, 2])).toBe(true)
    })

    it('handles two unsorted elements', () => {
      expect(CountingSort.isSorted([2, 1])).toBe(false)
    })

    it('returns true for equal adjacent elements', () => {
      expect(CountingSort.isSorted([1, 1, 2, 2, 3])).toBe(true)
    })

    it('handles zeros', () => {
      expect(CountingSort.isSorted([0, 0, 0])).toBe(true)
    })

    it('handles negative values sorted', () => {
      expect(CountingSort.isSorted([-5, -3, -1, 0, 2])).toBe(true)
    })

    it('handles negative values unsorted', () => {
      expect(CountingSort.isSorted([0, -1, 2])).toBe(false)
    })
  })

  describe('merge (static)', () => {
    it('merges two empty arrays', () => {
      expect(CountingSort.merge([], [])).toEqual([])
    })

    it('merges empty with non-empty', () => {
      expect(CountingSort.merge([], [1, 2, 3])).toEqual([1, 2, 3])
    })

    it('merges non-empty with empty', () => {
      expect(CountingSort.merge([1, 2, 3], [])).toEqual([1, 2, 3])
    })

    it('merges two sorted arrays', () => {
      expect(CountingSort.merge([1, 3, 5], [2, 4, 6])).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('merges non-overlapping arrays', () => {
      expect(CountingSort.merge([1, 2, 3], [4, 5, 6])).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('merges overlapping arrays', () => {
      expect(CountingSort.merge([1, 2, 4], [2, 3, 5])).toEqual([1, 2, 2, 3, 4, 5])
    })

    it('merges arrays with duplicates', () => {
      expect(CountingSort.merge([1, 1, 2], [1, 2, 2])).toEqual([1, 1, 1, 2, 2, 2])
    })

    it('merges single element arrays', () => {
      expect(CountingSort.merge([1], [2])).toEqual([1, 2])
      expect(CountingSort.merge([2], [1])).toEqual([1, 2])
    })

    it('merges arrays of different sizes', () => {
      expect(CountingSort.merge([1, 5], [2, 3, 4])).toEqual([1, 2, 3, 4, 5])
    })

    it('does not modify original arrays', () => {
      const a = [1, 3]
      const b = [2, 4]
      CountingSort.merge(a, b)
      expect(a).toEqual([1, 3])
      expect(b).toEqual([2, 4])
    })

    it('merges negative value arrays', () => {
      expect(CountingSort.merge([-3, -1], [-2, 0])).toEqual([-3, -2, -1, 0])
    })

    it('merges large sorted arrays', () => {
      const a = Array.from({ length: 500 }, (_, i) => i * 2)
      const b = Array.from({ length: 500 }, (_, i) => i * 2 + 1)
      const merged = CountingSort.merge(a, b)
      expect(merged).toHaveLength(1000)
      expect(CountingSort.isSorted(merged)).toBe(true)
    })

    it('merges identical arrays', () => {
      expect(CountingSort.merge([1, 2, 3], [1, 2, 3])).toEqual([1, 1, 2, 2, 3, 3])
    })

    it('merges single element with larger array', () => {
      expect(CountingSort.merge([5], [1, 2, 3, 4])).toEqual([1, 2, 3, 4, 5])
      expect(CountingSort.merge([1], [2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('from (static factory)', () => {
    it('creates instance from array', () => {
      const cs = CountingSort.from([3, 1, 2])
      expect(cs.min).toBe(1)
      expect(cs.max).toBe(3)
      expect(cs.uniqueCount).toBe(3)
    })

    it('creates instance from empty array', () => {
      const cs = CountingSort.from([])
      expect(cs.uniqueCount).toBe(0)
    })

    it('creates instance with options', () => {
      const cs = CountingSort.from([1, 2, 3], { min: 0, max: 10 })
      expect(cs.min).toBe(0)
      expect(cs.max).toBe(10)
    })

    it('created instance can query counts', () => {
      const cs = CountingSort.from([1, 2, 2, 3])
      expect(cs.getCount(2)).toBe(2)
    })

    it('created instance can get distribution', () => {
      const cs = CountingSort.from([1, 1, 2])
      expect(cs.getDistribution()).toEqual([
        { value: 1, count: 2 },
        { value: 2, count: 1 },
      ])
    })
  })

  describe('options', () => {
    it('configured min extends range', () => {
      const cs = new CountingSort({ min: 0 })
      cs.sort([5, 10])
      expect(cs.min).toBe(0)
    })

    it('configured max extends range', () => {
      const cs = new CountingSort({ max: 100 })
      cs.sort([5, 10])
      expect(cs.max).toBe(100)
    })

    it('configured min and max both extend range', () => {
      const cs = new CountingSort({ min: -50, max: 50 })
      cs.sort([1, 2, 3])
      expect(cs.min).toBe(-50)
      expect(cs.max).toBe(50)
      expect(cs.range).toBe(100)
    })

    it('options do not override actual data min if data is smaller', () => {
      const cs = new CountingSort({ min: 0 })
      cs.sort([-5, 0, 5])
      expect(cs.min).toBe(-5)
    })

    it('options do not override actual data max if data is larger', () => {
      const cs = new CountingSort({ max: 10 })
      cs.sort([5, 15, 20])
      expect(cs.max).toBe(20)
    })

    it('getCount returns 0 for values in option range but not in data', () => {
      const cs = new CountingSort({ min: 0, max: 10 })
      cs.sort([5])
      expect(cs.getCount(0)).toBe(0)
      expect(cs.getCount(10)).toBe(0)
      expect(cs.getCount(5)).toBe(1)
    })
  })

  describe('multiple operations on same instance', () => {
    it('state updates after each sort call', () => {
      const cs = new CountingSort()
      cs.sort([1, 2, 3])
      expect(cs.uniqueCount).toBe(3)
      cs.sort([5, 5, 5])
      expect(cs.uniqueCount).toBe(1)
      expect(cs.getCount(5)).toBe(3)
    })

    it('state updates after sortDescending', () => {
      const cs = new CountingSort()
      cs.sort([1, 2, 3])
      expect(cs.max).toBe(3)
      cs.sortDescending([10, 20])
      expect(cs.max).toBe(20)
    })

    it('state updates after sortInRange', () => {
      const cs = new CountingSort()
      cs.sort([1, 2, 3])
      expect(cs.min).toBe(1)
      cs.sortInRange([10, 20], 0, 100)
      expect(cs.min).toBe(0)
      expect(cs.max).toBe(100)
    })

    it('sort results are independent', () => {
      const cs = new CountingSort()
      const r1 = cs.sort([3, 1, 2])
      const r2 = cs.sortDescending([3, 1, 2])
      expect(r1).toEqual([1, 2, 3])
      expect(r2).toEqual([3, 2, 1])
    })
  })

  describe('type exports', () => {
    it('CountingSortOptions type works', () => {
      const opts: CountingSortOptions = { min: 0, max: 10 }
      const cs = new CountingSort(opts)
      expect(cs).toBeInstanceOf(CountingSort)
    })

    it('CountingSortOptions partial type works', () => {
      const opts1: CountingSortOptions = { min: 0 }
      const opts2: CountingSortOptions = { max: 10 }
      const opts3: CountingSortOptions = {}
      expect(new CountingSort(opts1)).toBeInstanceOf(CountingSort)
      expect(new CountingSort(opts2)).toBeInstanceOf(CountingSort)
      expect(new CountingSort(opts3)).toBeInstanceOf(CountingSort)
    })

    it('DistributionEntry type works', () => {
      const entry: DistributionEntry = { value: 5, count: 3 }
      expect(entry.value).toBe(5)
      expect(entry.count).toBe(3)
    })
  })

  describe('stress tests', () => {
    it('sorts 10000 random elements', () => {
      const cs = new CountingSort()
      const arr = Array.from({ length: 10000 }, () => Math.floor(Math.random() * 100))
      const sorted = cs.sort(arr)
      expect(sorted).toHaveLength(10000)
      expect(CountingSort.isSorted(sorted)).toBe(true)
    })

    it('sorts 5000 elements descending', () => {
      const cs = new CountingSort()
      const arr = Array.from({ length: 5000 }, () => Math.floor(Math.random() * 50))
      const sorted = cs.sortDescending(arr)
      expect(sorted).toHaveLength(5000)
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i]! <= sorted[i - 1]!).toBe(true)
      }
    })

    it('sortStable 1000 elements', () => {
      const cs = new CountingSort()
      const arr = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 20))
      const sorted = cs.sortStable(arr)
      expect(CountingSort.isSorted(sorted)).toBe(true)
    })

    it('isSorted validates 10000 sorted elements', () => {
      const sorted = Array.from({ length: 10000 }, (_, i) => i)
      expect(CountingSort.isSorted(sorted)).toBe(true)
    })

    it('isSorted detects unsorted in 10000 elements', () => {
      const arr = Array.from({ length: 10000 }, (_, i) => i)
      arr[0] = 99999
      expect(CountingSort.isSorted(arr)).toBe(false)
    })

    it('getDistribution handles 100 unique values', () => {
      const cs = new CountingSort()
      const arr = Array.from({ length: 10000 }, (_, i) => i % 100)
      cs.sort(arr)
      expect(cs.uniqueCount).toBe(100)
      const dist = cs.getDistribution()
      expect(dist).toHaveLength(100)
      for (const d of dist) {
        expect(d.count).toBe(100)
      }
    })

    it('merge handles large arrays', () => {
      const a = Array.from({ length: 5000 }, (_, i) => i * 2)
      const b = Array.from({ length: 5000 }, (_, i) => i * 2 + 1)
      const merged = CountingSort.merge(a, b)
      expect(merged).toHaveLength(10000)
      expect(CountingSort.isSorted(merged)).toBe(true)
    })

    it('handles reverse sorted 1000 elements', () => {
      const cs = new CountingSort()
      const arr = Array.from({ length: 1000 }, (_, i) => 999 - i)
      const sorted = cs.sort(arr)
      expect(sorted[0]).toBe(0)
      expect(sorted[999]).toBe(999)
      expect(CountingSort.isSorted(sorted)).toBe(true)
    })

    it('handles all zeros array', () => {
      const cs = new CountingSort()
      const arr = new Array(1000).fill(0) as number[]
      const sorted = cs.sort(arr)
      expect(sorted.every(x => x === 0)).toBe(true)
      expect(sorted).toHaveLength(1000)
    })

    it('handles array with very negative values', () => {
      const cs = new CountingSort()
      const arr = [-1000000, -999999, -1000000, -999998]
      const sorted = cs.sort(arr)
      expect(sorted).toEqual([-1000000, -1000000, -999999, -999998])
    })
  })

  describe('integration', () => {
    it('sort result passes isSorted', () => {
      const cs = new CountingSort()
      const arr = Array.from({ length: 200 }, () => Math.floor(Math.random() * 50))
      const sorted = cs.sort(arr)
      expect(CountingSort.isSorted(sorted)).toBe(true)
    })

    it('sort result preserves counts', () => {
      const cs = new CountingSort()
      const arr = [3, 1, 2, 1, 3]
      const sorted = cs.sort(arr)
      const dist = cs.getDistribution()
      const totalCount = dist.reduce((s, d) => s + d.count, 0)
      expect(totalCount).toBe(5)
      expect(sorted).toHaveLength(5)
    })

    it('merge then isSorted', () => {
      const cs = new CountingSort()
      const s1 = cs.sort([1, 3, 5, 7])
      const cs2 = new CountingSort()
      const s2 = cs2.sort([2, 4, 6, 8])
      const merged = CountingSort.merge(s1, s2)
      expect(CountingSort.isSorted(merged)).toBe(true)
    })

    it('all sort methods produce consistent statistics', () => {
      const arr = [3, 1, 4, 1, 5, 9, 2, 6]
      const cs1 = new CountingSort()
      cs1.sort(arr)
      const cs2 = new CountingSort()
      cs2.sortDescending(arr)
      expect(cs1.uniqueCount).toBe(cs2.uniqueCount)
      expect(cs1.totalElements).toBe(cs2.totalElements)
      expect(cs1.getDistribution()).toEqual(cs2.getDistribution())
    })

    it('sortInRange statistics match data', () => {
      const cs = new CountingSort()
      cs.sortInRange([1, 2, 3], 0, 5)
      expect(cs.getCount(1)).toBe(1)
      expect(cs.getCount(2)).toBe(1)
      expect(cs.getCount(3)).toBe(1)
      expect(cs.getCount(0)).toBe(0)
      expect(cs.getCount(4)).toBe(0)
      expect(cs.getCount(5)).toBe(0)
    })

    it('empty sort followed by non-empty sort updates state', () => {
      const cs = new CountingSort()
      cs.sort([])
      expect(cs.uniqueCount).toBe(0)
      cs.sort([1, 2, 3])
      expect(cs.uniqueCount).toBe(3)
      expect(cs.min).toBe(1)
      expect(cs.max).toBe(3)
    })

    it('from factory and manual sort produce same state', () => {
      const arr = [3, 1, 2, 1, 3]
      const cs1 = CountingSort.from(arr)
      const cs2 = new CountingSort()
      cs2.sort(arr)
      expect(cs1.uniqueCount).toBe(cs2.uniqueCount)
      expect(cs1.totalElements).toBe(cs2.totalElements)
      expect(cs1.getDistribution()).toEqual(cs2.getDistribution())
    })
  })
})
