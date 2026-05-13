import { describe, it, expect } from 'vitest';
import { SleepSort2 } from '../src/core/sleep-sort-2/index.js';

describe('SleepSort2', () => {
  describe('sort()', () => {
    it('should handle empty array', () => {
      const sorter = new SleepSort2([]);
      expect(sorter.sort([])).toEqual([]);
    });

    it('should handle single element', () => {
      const sorter = new SleepSort2([]);
      expect(sorter.sort([42])).toEqual([42]);
    });

    it('should handle already sorted array', () => {
      const sorter = new SleepSort2([]);
      expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle reverse sorted array', () => {
      const sorter = new SleepSort2([]);
      expect(sorter.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle random array', () => {
      const sorter = new SleepSort2([]);
      expect(sorter.sort([3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5])).toEqual([1, 1, 2, 3, 3, 4, 5, 5, 5, 6, 9]);
    });

    it('should handle duplicates', () => {
      const sorter = new SleepSort2([]);
      expect(sorter.sort([2, 2, 2, 1, 1, 3, 3])).toEqual([1, 1, 2, 2, 2, 3, 3]);
    });

    it('should handle negative numbers', () => {
      const sorter = new SleepSort2([]);
      expect(sorter.sort([-1, -3, 2, 0, -2, 1])).toEqual([-3, -2, -1, 0, 1, 2]);
    });

    it('should handle all identical elements', () => {
      const sorter = new SleepSort2([]);
      expect(sorter.sort([5, 5, 5, 5, 5])).toEqual([5, 5, 5, 5, 5]);
    });
  });

  describe('sortDescending()', () => {
    it('should handle empty array', () => {
      const sorter = new SleepSort2([]);
      expect(sorter.sortDescending([])).toEqual([]);
    });

    it('should handle single element', () => {
      const sorter = new SleepSort2([]);
      expect(sorter.sortDescending([42])).toEqual([42]);
    });

    it('should sort in descending order', () => {
      const sorter = new SleepSort2([]);
      expect(sorter.sortDescending([1, 2, 3, 4, 5])).toEqual([5, 4, 3, 2, 1]);
    });

    it('should handle duplicates in descending order', () => {
      const sorter = new SleepSort2([]);
      expect(sorter.sortDescending([2, 2, 2, 1, 1, 3, 3])).toEqual([3, 3, 2, 2, 2, 1, 1]);
    });

    it('should handle negative numbers in descending order', () => {
      const sorter = new SleepSort2([]);
      expect(sorter.sortDescending([-1, -3, 2, 0, -2, 1])).toEqual([2, 1, 0, -1, -2, -3]);
    });

    it('should handle random array in descending order', () => {
      const sorter = new SleepSort2([]);
      expect(sorter.sortDescending([3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5])).toEqual([9, 6, 5, 5, 5, 4, 3, 3, 2, 1, 1]);
    });
  });

  describe('isSorted()', () => {
    it('should return true for empty array', () => {
      const sorter = new SleepSort2([]);
      expect(sorter.isSorted([])).toBe(true);
    });

    it('should return true for single element', () => {
      const sorter = new SleepSort2([]);
      expect(sorter.isSorted([42])).toBe(true);
    });

    it('should return true for sorted array', () => {
      const sorter = new SleepSort2([]);
      expect(sorter.isSorted([1, 2, 3, 4, 5])).toBe(true);
    });

    it('should return false for unsorted array', () => {
      const sorter = new SleepSort2([]);
      expect(sorter.isSorted([5, 4, 3, 2, 1])).toBe(false);
    });

    it('should return true for array with duplicates', () => {
      const sorter = new SleepSort2([]);
      expect(sorter.isSorted([1, 1, 2, 2, 3])).toBe(true);
    });
  });

  describe('getSleepTime() - static', () => {
    it('should return 0 for zero', () => {
      expect(SleepSort2.getSleepTime(0)).toBe(0);
    });

    it('should return value for positive number', () => {
      expect(SleepSort2.getSleepTime(5)).toBe(5);
    });

    it('should return 0 for negative number', () => {
      expect(SleepSort2.getSleepTime(-5)).toBe(0);
    });
  });

  describe('simulateSleepSort() - static', () => {
    it('should handle empty array', () => {
      expect(SleepSort2.simulateSleepSort([])).toEqual([]);
    });

    it('should handle single element', () => {
      expect(SleepSort2.simulateSleepSort([42])).toEqual([42]);
    });

    it('should sort by sleep time', () => {
      expect(SleepSort2.simulateSleepSort([3, 1, 4, 1, 5])).toEqual([1, 1, 3, 4, 5]);
    });

    it('should handle negative values', () => {
      expect(SleepSort2.simulateSleepSort([-1, -3, 2, 0, -2, 1])).toEqual([-3, -2, -1, 0, 1, 2]);
    });

    it('should handle duplicates', () => {
      expect(SleepSort2.simulateSleepSort([2, 2, 2, 1, 1, 3, 3])).toEqual([1, 1, 2, 2, 2, 3, 3]);
    });
  });

  describe('sortBySleepSchedule() - static', () => {
    it('should handle empty array', () => {
      expect(SleepSort2.sortBySleepSchedule([])).toEqual([]);
    });

    it('should sort by sleep schedule', () => {
      expect(SleepSort2.sortBySleepSchedule([3, 1, 4, 1, 5])).toEqual([1, 1, 3, 4, 5]);
    });

    it('should handle negative values', () => {
      expect(SleepSort2.sortBySleepSchedule([-1, -3, 2, 0, -2, 1])).toEqual([-3, -2, -1, 0, 1, 2]);
    });

    it('should handle duplicates', () => {
      expect(SleepSort2.sortBySleepSchedule([2, 2, 2, 1, 1, 3, 3])).toEqual([1, 1, 2, 2, 2, 3, 3]);
    });
  });

  describe('getWakeUpOrder() - static', () => {
    it('should handle empty array', () => {
      expect(SleepSort2.getWakeUpOrder([])).toEqual([]);
    });

    it('should return wake up order', () => {
      expect(SleepSort2.getWakeUpOrder([3, 1, 4, 1, 5])).toEqual([1, 1, 3, 4, 5]);
    });

    it('should handle negative values', () => {
      expect(SleepSort2.getWakeUpOrder([-1, -3, 2, 0, -2, 1])).toEqual([-3, -2, -1, 0, 1, 2]);
    });
  });

  describe('getBucketCount() - static', () => {
    it('should return 0 for empty array', () => {
      expect(SleepSort2.getBucketCount([])).toBe(0);
    });

    it('should count unique values', () => {
      expect(SleepSort2.getBucketCount([1, 2, 2, 3, 1, 4, 2])).toBe(4);
    });

    it('should return 1 for all identical elements', () => {
      expect(SleepSort2.getBucketCount([5, 5, 5, 5, 5])).toBe(1);
    });

    it('should count all distinct in array with no duplicates', () => {
      expect(SleepSort2.getBucketCount([1, 2, 3, 4, 5])).toBe(5);
    });
  });

  describe('getSleepDurations() - static', () => {
    it('should return empty array for empty input', () => {
      expect(SleepSort2.getSleepDurations([])).toEqual([]);
    });

    it('should return sleep durations for array', () => {
      expect(SleepSort2.getSleepDurations([1, 2, 3])).toEqual([1, 2, 3]);
    });

    it('should return 0 for negative values', () => {
      expect(SleepSort2.getSleepDurations([-1, -2, 3])).toEqual([0, 0, 3]);
    });
  });

  describe('getMaxSleepTime() - static', () => {
    it('should return 0 for empty array', () => {
      expect(SleepSort2.getMaxSleepTime([])).toBe(0);
    });

    it('should return maximum sleep time', () => {
      expect(SleepSort2.getMaxSleepTime([1, 5, 3, 2, 4])).toBe(5);
    });

    it('should handle negative numbers', () => {
      expect(SleepSort2.getMaxSleepTime([-5, -1, -3])).toBe(0);
    });
  });

  describe('getMinSleepTime() - static', () => {
    it('should return 0 for empty array', () => {
      expect(SleepSort2.getMinSleepTime([])).toBe(0);
    });

    it('should return minimum sleep time', () => {
      expect(SleepSort2.getMinSleepTime([5, 1, 3, 2, 4])).toBe(1);
    });

    it('should return 0 for all negative numbers', () => {
      expect(SleepSort2.getMinSleepTime([-5, -1, -3])).toBe(0);
    });
  });

  describe('getTotalSleepTime() - static', () => {
    it('should return 0 for empty array', () => {
      expect(SleepSort2.getTotalSleepTime([])).toBe(0);
    });

    it('should calculate total sleep time', () => {
      expect(SleepSort2.getTotalSleepTime([1, 2, 3])).toBe(6);
    });

    it('should handle negative values as 0', () => {
      expect(SleepSort2.getTotalSleepTime([-1, 2, 3])).toBe(5);
    });
  });

  describe('getAverageSleepTime() - static', () => {
    it('should return 0 for empty array', () => {
      expect(SleepSort2.getAverageSleepTime([])).toBe(0);
    });

    it('should calculate average sleep time', () => {
      expect(SleepSort2.getAverageSleepTime([1, 2, 3])).toBe(2);
    });

    it('should handle negative values', () => {
      expect(SleepSort2.getAverageSleepTime([-1, 2, 3])).toBeCloseTo(1.67, 2);
    });
  });

  describe('getBuckets()', () => {
    it('should return buckets for array', () => {
      const sorter = new SleepSort2([1, 2, 2, 3, 1]);
      const buckets = sorter.getBuckets();
      expect(buckets.get(1)).toEqual([1, 1]);
      expect(buckets.get(2)).toEqual([2, 2]);
      expect(buckets.get(3)).toEqual([3]);
    });

    it('should return empty map for empty input', () => {
      const sorter = new SleepSort2([]);
      expect(sorter.getBuckets().size).toBe(0);
    });
  });

  describe('getMin() - instance', () => {
    it('should return undefined for empty array', () => {
      const sorter = new SleepSort2([]);
      expect(sorter.getMin()).toBeUndefined();
    });

    it('should return correct minimum', () => {
      const sorter = new SleepSort2([5, 1, 3, 2, 4]);
      expect(sorter.getMin()).toBe(1);
    });

    it('should return negative minimum', () => {
      const sorter = new SleepSort2([-3, -1, -2]);
      expect(sorter.getMin()).toBe(-3);
    });
  });

  describe('getMax() - instance', () => {
    it('should return undefined for empty array', () => {
      const sorter = new SleepSort2([]);
      expect(sorter.getMax()).toBeUndefined();
    });

    it('should return correct maximum', () => {
      const sorter = new SleepSort2([1, 5, 3, 2, 4]);
      expect(sorter.getMax()).toBe(5);
    });
  });

  describe('getRange()', () => {
    it('should return 0 for empty array', () => {
      const sorter = new SleepSort2([]);
      expect(sorter.getRange()).toBe(0);
    });

    it('should return correct range', () => {
      const sorter = new SleepSort2([1, 5]);
      expect(sorter.getRange()).toBe(5);
    });

    it('should calculate range with negatives', () => {
      const sorter = new SleepSort2([-2, 2]);
      expect(sorter.getRange()).toBe(5);
    });
  });

  describe('toArray()', () => {
    it('should return copy of original array', () => {
      const original = [3, 1, 2];
      const sorter = new SleepSort2(original);
      const result = sorter.toArray();

      expect(result).toEqual(original);
      expect(result).not.toBe(original);
    });

    it('should return empty array for empty input', () => {
      const sorter = new SleepSort2([]);
      expect(sorter.toArray()).toEqual([]);
    });
  });

  describe('getTimeComplexity()', () => {
    it('should return correct complexity string', () => {
      const sorter = new SleepSort2([1, 2, 3, 4, 5]);
      expect(sorter.getTimeComplexity()).toBe('O(n + k) = O(5 + 5)');
    });

    it('should handle empty array', () => {
      const sorter = new SleepSort2([]);
      expect(sorter.getTimeComplexity()).toBe('O(n + k) = O(0 + 0)');
    });

    it('should handle large array', () => {
      const array = Array.from({ length: 100 }, (_, i) => i);
      const sorter = new SleepSort2(array);
      expect(sorter.getTimeComplexity()).toBe('O(n + k) = O(100 + 100)');
    });
  });

  describe('getSpaceComplexity()', () => {
    it('should return correct complexity string', () => {
      const sorter = new SleepSort2([1, 2, 3, 4, 5]);
      expect(sorter.getSpaceComplexity()).toBe('O(n) = O(5)');
    });

    it('should handle empty array', () => {
      const sorter = new SleepSort2([]);
      expect(sorter.getSpaceComplexity()).toBe('O(n) = O(0)');
    });

    it('should handle large array', () => {
      const array = Array.from({ length: 100 }, (_, i) => i);
      const sorter = new SleepSort2(array);
      expect(sorter.getSpaceComplexity()).toBe('O(n) = O(100)');
    });
  });
});
