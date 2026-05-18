import { describe, it, expect } from 'vitest'
import { SleepSort2 } from '../../src/core/sleep-sort-2/index.js'

describe('SleepSort2', () => {
  describe('constructor', () => {
    it('should store a copy of the input array', () => {
      const arr = [3, 1, 2]
      const ss = new SleepSort2(arr)
      expect(ss.toArray()).toEqual([3, 1, 2])
      arr.push(99)
      expect(ss.toArray()).toEqual([3, 1, 2])
    })

    it('should handle empty array', () => {
      const ss = new SleepSort2([])
      expect(ss.toArray()).toEqual([])
      expect(ss.getMin()).toBeUndefined()
      expect(ss.getMax()).toBeUndefined()
      expect(ss.getRange()).toBe(0)
    })

    it('should compute min and max', () => {
      const ss = new SleepSort2([5, 1, 9, 3])
      expect(ss.getMin()).toBe(1)
      expect(ss.getMax()).toBe(9)
    })

    it('should compute min and max for single element', () => {
      const ss = new SleepSort2([7])
      expect(ss.getMin()).toBe(7)
      expect(ss.getMax()).toBe(7)
    })
  })

  // ─── sort ───

  describe('sort', () => {
    it('should sort ascending', () => {
      const ss = new SleepSort2([])
      expect(ss.sort([3, 1, 4, 1, 5])).toEqual([1, 1, 3, 4, 5])
    })

    it('should return empty for empty input', () => {
      const ss = new SleepSort2([])
      expect(ss.sort([])).toEqual([])
    })

    it('should return single element unchanged', () => {
      const ss = new SleepSort2([])
      expect(ss.sort([42])).toEqual([42])
    })

    it('should handle negative numbers', () => {
      const ss = new SleepSort2([])
      expect(ss.sort([3, -1, 0, -5, 2])).toEqual([-5, -1, 0, 2, 3])
    })

    it('should handle duplicates', () => {
      const ss = new SleepSort2([])
      expect(ss.sort([2, 2, 2])).toEqual([2, 2, 2])
    })

    it('should handle already sorted input', () => {
      const ss = new SleepSort2([])
      expect(ss.sort([1, 2, 3, 4])).toEqual([1, 2, 3, 4])
    })
  })

  // ─── sortDescending ───

  describe('sortDescending', () => {
    it('should sort descending', () => {
      const ss = new SleepSort2([])
      expect(ss.sortDescending([3, 1, 4, 1, 5])).toEqual([5, 4, 3, 1, 1])
    })

    it('should return empty for empty input', () => {
      const ss = new SleepSort2([])
      expect(ss.sortDescending([])).toEqual([])
    })

    it('should handle negative numbers descending', () => {
      const ss = new SleepSort2([])
      expect(ss.sortDescending([-5, -1, 0, 2])).toEqual([2, 0, -1, -5])
    })
  })

  // ─── isSorted ───

  describe('isSorted', () => {
    it('should return true for sorted array', () => {
      const ss = new SleepSort2([])
      expect(ss.isSorted([1, 2, 3, 4])).toBe(true)
    })

    it('should return false for unsorted array', () => {
      const ss = new SleepSort2([])
      expect(ss.isSorted([3, 1, 2])).toBe(false)
    })

    it('should return true for empty array', () => {
      const ss = new SleepSort2([])
      expect(ss.isSorted([])).toBe(true)
    })

    it('should return true for single element', () => {
      const ss = new SleepSort2([])
      expect(ss.isSorted([5])).toBe(true)
    })

    it('should return true for duplicates', () => {
      const ss = new SleepSort2([])
      expect(ss.isSorted([1, 1, 1])).toBe(true)
    })
  })

  // ─── static getSleepTime ───

  describe('static getSleepTime', () => {
    it('should return the value for positive numbers', () => {
      expect(SleepSort2.getSleepTime(5)).toBe(5)
    })

    it('should return 0 for zero', () => {
      expect(SleepSort2.getSleepTime(0)).toBe(0)
    })

    it('should return 0 for negative numbers', () => {
      expect(SleepSort2.getSleepTime(-10)).toBe(0)
    })
  })

  // ─── static simulateSleepSort ───

  describe('static simulateSleepSort', () => {
    it('should return sorted by sleep time', () => {
      expect(SleepSort2.simulateSleepSort([3, 1, 2])).toEqual([1, 2, 3])
    })

    it('should return empty for empty input', () => {
      expect(SleepSort2.simulateSleepSort([])).toEqual([])
    })

    it('should handle negatives (treated as 0 sleep time)', () => {
      const result = SleepSort2.simulateSleepSort([-2, 3, -1])
      expect(result[0]).toBe(-2)
      expect(result[1]).toBe(-1)
      expect(result[2]).toBe(3)
    })
  })

  // ─── static sortBySleepSchedule ───

  describe('static sortBySleepSchedule', () => {
    it('should sort by sleep time then by value', () => {
      expect(SleepSort2.sortBySleepSchedule([3, 1, 2])).toEqual([1, 2, 3])
    })

    it('should return empty for empty input', () => {
      expect(SleepSort2.sortBySleepSchedule([])).toEqual([])
    })

    it('should handle negatives alongside positives', () => {
      const result = SleepSort2.sortBySleepSchedule([5, -3, 0, -1])
      expect(result).toEqual([-3, -1, 0, 5])
    })
  })

  // ─── static getWakeUpOrder ───

  describe('static getWakeUpOrder', () => {
    it('should return elements in wake-up order', () => {
      expect(SleepSort2.getWakeUpOrder([5, 1, 3])).toEqual([1, 3, 5])
    })

    it('should return empty for empty input', () => {
      expect(SleepSort2.getWakeUpOrder([])).toEqual([])
    })
  })

  // ─── static getBucketCount ───

  describe('static getBucketCount', () => {
    it('should count unique values', () => {
      expect(SleepSort2.getBucketCount([1, 2, 2, 3, 3, 3])).toBe(3)
    })

    it('should return 0 for empty array', () => {
      expect(SleepSort2.getBucketCount([])).toBe(0)
    })
  })

  // ─── static getSleepDurations ───

  describe('static getSleepDurations', () => {
    it('should map values to sleep durations', () => {
      expect(SleepSort2.getSleepDurations([3, -1, 5])).toEqual([3, 0, 5])
    })

    it('should return empty for empty input', () => {
      expect(SleepSort2.getSleepDurations([])).toEqual([])
    })
  })

  // ─── static getMaxSleepTime / getMinSleepTime ───

  describe('static getMaxSleepTime / getMinSleepTime', () => {
    it('should return max sleep time', () => {
      expect(SleepSort2.getMaxSleepTime([1, 5, 3])).toBe(5)
    })

    it('should return 0 for empty array (max)', () => {
      expect(SleepSort2.getMaxSleepTime([])).toBe(0)
    })

    it('should return min sleep time', () => {
      expect(SleepSort2.getMinSleepTime([2, 5, 3])).toBe(2)
    })

    it('should return 0 for empty array (min)', () => {
      expect(SleepSort2.getMinSleepTime([])).toBe(0)
    })

    it('should return 0 as min when negatives are present', () => {
      expect(SleepSort2.getMinSleepTime([-5, 3])).toBe(0)
    })
  })

  // ─── static getTotalSleepTime / getAverageSleepTime ───

  describe('static getTotalSleepTime / getAverageSleepTime', () => {
    it('should compute total sleep time', () => {
      expect(SleepSort2.getTotalSleepTime([1, 2, 3])).toBe(6)
    })

    it('should return 0 total for empty array', () => {
      expect(SleepSort2.getTotalSleepTime([])).toBe(0)
    })

    it('should compute average sleep time', () => {
      expect(SleepSort2.getAverageSleepTime([2, 4, 6])).toBe(4)
    })

    it('should return 0 average for empty array', () => {
      expect(SleepSort2.getAverageSleepTime([])).toBe(0)
    })

    it('should handle negatives in total/average', () => {
      expect(SleepSort2.getTotalSleepTime([-2, 4])).toBe(4)
      expect(SleepSort2.getAverageSleepTime([-2, 4])).toBe(2)
    })
  })

  // ─── instance getters ───

  describe('instance getters', () => {
    it('getBuckets should return value buckets', () => {
      const ss = new SleepSort2([1, 2, 2, 3])
      const buckets = ss.getBuckets()
      expect(buckets.get(1)).toEqual([1])
      expect(buckets.get(2)).toEqual([2, 2])
      expect(buckets.get(3)).toEqual([3])
    })

    it('getRange should return max - min + 1', () => {
      const ss = new SleepSort2([2, 5, 8])
      expect(ss.getRange()).toBe(7)
    })

    it('toArray should return copy of original array', () => {
      const ss = new SleepSort2([3, 1, 2])
      const arr = ss.toArray()
      arr.push(99)
      expect(ss.toArray()).toEqual([3, 1, 2])
    })
  })

  // ─── complexity strings ───

  describe('complexity strings', () => {
    it('getTimeComplexity should include n and k', () => {
      const ss = new SleepSort2([1, 2, 3])
      expect(ss.getTimeComplexity()).toBe('O(n + k) = O(3 + 3)')
    })

    it('getSpaceComplexity should include n', () => {
      const ss = new SleepSort2([1, 2, 3])
      expect(ss.getSpaceComplexity()).toBe('O(n) = O(3)')
    })

    it('getTimeComplexity for empty array', () => {
      const ss = new SleepSort2([])
      expect(ss.getTimeComplexity()).toBe('O(n + k) = O(0 + 0)')
    })
  })
})
