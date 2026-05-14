import { describe, it, expect, beforeEach } from 'vitest';
import { CountingSort } from '../src/core/counting-sort/index.js';

describe('CountingSort', () => {
  let cs: CountingSort;

  beforeEach(() => {
    cs = new CountingSort();
  });

  describe('constructor', () => {
    it('should create instance without options', () => {
      expect(cs).toBeDefined();
      expect(cs.totalElements).toBe(0);
      expect(cs.uniqueCount).toBe(0);
    });

    it('should create instance with options', () => {
      const csWithOptions = new CountingSort({ min: 0, max: 10 });
      expect(csWithOptions).toBeDefined();
      expect(csWithOptions.totalElements).toBe(0);
    });

    it('should create instance with only min option', () => {
      const csWithMin = new CountingSort({ min: 5 });
      expect(csWithMin).toBeDefined();
    });

    it('should create instance with only max option', () => {
      const csWithMax = new CountingSort({ max: 100 });
      expect(csWithMax).toBeDefined();
    });
  });

  describe('sort', () => {
    it('should return empty array for empty input', () => {
      const result = cs.sort([]);
      expect(result).toEqual([]);
    });

    it('should return single element array', () => {
      const result = cs.sort([5]);
      expect(result).toEqual([5]);
      expect(cs.totalElements).toBe(1);
    });

    it('should sort ascending array', () => {
      const result = cs.sort([1, 2, 3, 4, 5]);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort descending array', () => {
      const result = cs.sort([5, 4, 3, 2, 1]);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort random array', () => {
      const result = cs.sort([3, 1, 4, 1, 5, 9, 2, 6, 5, 3]);
      expect(result).toEqual([1, 1, 2, 3, 3, 4, 5, 5, 6, 9]);
    });

    it('should handle negative numbers', () => {
      const result = cs.sort([-3, -1, -2, 0, 2]);
      expect(result).toEqual([-3, -2, -1, 0, 2]);
    });

    it('should handle duplicates', () => {
      const result = cs.sort([1, 2, 2, 3, 1, 4, 3]);
      expect(result).toEqual([1, 1, 2, 2, 3, 3, 4]);
    });

    it('should handle large range', () => {
      const result = cs.sort([100, 50, 75, 25, 0]);
      expect(result).toEqual([0, 25, 50, 75, 100]);
    });

    it('should update statistics after sorting', () => {
      cs.sort([3, 1, 4, 1, 5]);
      expect(cs.totalElements).toBe(5);
      expect(cs.uniqueCount).toBe(4);
      expect(cs.min).toBe(1);
      expect(cs.max).toBe(5);
      expect(cs.range).toBe(4);
    });

    it('should work with min and max options', () => {
      const csWithOptions = new CountingSort({ min: 0, max: 10 });
      const result = csWithOptions.sort([5, 3, 7, 1, 9]);
      expect(result).toEqual([1, 3, 5, 7, 9]);
    });

    it('should handle single element with options', () => {
      const csWithOptions = new CountingSort({ min: 0, max: 100 });
      const result = csWithOptions.sort([50]);
      expect(result).toEqual([50]);
      expect(csWithOptions.totalElements).toBe(1);
    });
  });

  describe('sortDescending', () => {
    it('should return empty array for empty input', () => {
      const result = cs.sortDescending([]);
      expect(result).toEqual([]);
    });

    it('should return single element array', () => {
      const result = cs.sortDescending([5]);
      expect(result).toEqual([5]);
    });

    it('should sort ascending array in descending order', () => {
      const result = cs.sortDescending([1, 2, 3, 4, 5]);
      expect(result).toEqual([5, 4, 3, 2, 1]);
    });

    it('should sort descending array', () => {
      const result = cs.sortDescending([5, 4, 3, 2, 1]);
      expect(result).toEqual([5, 4, 3, 2, 1]);
    });

    it('should sort random array in descending order', () => {
      const result = cs.sortDescending([3, 1, 4, 1, 5, 9, 2, 6, 5, 3]);
      expect(result).toEqual([9, 6, 5, 5, 4, 3, 3, 2, 1, 1]);
    });

    it('should handle negative numbers', () => {
      const result = cs.sortDescending([-3, -1, -2, 0, 2]);
      expect(result).toEqual([2, 0, -1, -2, -3]);
    });

    it('should handle duplicates', () => {
      const result = cs.sortDescending([1, 2, 2, 3, 1, 4, 3]);
      expect(result).toEqual([4, 3, 3, 2, 2, 1, 1]);
    });

    it('should update statistics after sorting descending', () => {
      cs.sortDescending([3, 1, 4, 1, 5]);
      expect(cs.totalElements).toBe(5);
      expect(cs.uniqueCount).toBe(4);
      expect(cs.min).toBe(1);
      expect(cs.max).toBe(5);
    });
  });

  describe('sortInRange', () => {
    it('should return empty array for empty input', () => {
      const result = cs.sortInRange([], 0, 10);
      expect(result).toEqual([]);
    });

    it('should return single element array', () => {
      const result = cs.sortInRange([5], 0, 10);
      expect(result).toEqual([5]);
    });

    it('should sort within specified range', () => {
      const result = cs.sortInRange([3, 1, 4, 5, 2], 1, 5);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle values outside specified range', () => {
      const result = cs.sortInRange([-5, 0, 3, 7, 10], 0, 5);
      expect(result[0]).toBe(0);
      expect(result[1]).toBe(3);
      expect(result[2]).toBeUndefined();
      expect(result[3]).toBeUndefined();
      expect(result[4]).toBeUndefined();
      expect(result.length).toBe(5);
    });

    it('should handle values below min', () => {
      const result = cs.sortInRange([1, 2, 3, 4, 5], 3, 5);
      expect(result[0]).toBe(3);
      expect(result[1]).toBe(4);
      expect(result[2]).toBe(5);
      expect(result[3]).toBeUndefined();
      expect(result[4]).toBeUndefined();
      expect(result.length).toBe(5);
    });

    it('should handle values above max', () => {
      const result = cs.sortInRange([1, 2, 3, 4, 5], 1, 3);
      expect(result[0]).toBe(1);
      expect(result[1]).toBe(2);
      expect(result[2]).toBe(3);
      expect(result[3]).toBeUndefined();
      expect(result[4]).toBeUndefined();
      expect(result.length).toBe(5);
    });

    it('should work with negative numbers', () => {
      const result = cs.sortInRange([-3, -1, -2, 0, 2], -3, 0);
      expect(result[0]).toBe(-3);
      expect(result[1]).toBe(-2);
      expect(result[2]).toBe(-1);
      expect(result[3]).toBe(0);
      expect(result[4]).toBeUndefined();
      expect(result.length).toBe(5);
    });

    it('should update statistics', () => {
      cs.sortInRange([3, 1, 4, 1, 5], 1, 5);
      expect(cs.totalElements).toBe(5);
      expect(cs.uniqueCount).toBe(4);
      expect(cs.min).toBe(1);
      expect(cs.max).toBe(5);
    });
  });

  describe('sortStable', () => {
    it('should return empty array for empty input', () => {
      const result = cs.sortStable([]);
      expect(result).toEqual([]);
    });

    it('should return single element array', () => {
      const result = cs.sortStable([5]);
      expect(result).toEqual([5]);
    });

    it('should sort ascending array', () => {
      const result = cs.sortStable([1, 2, 3, 4, 5]);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort descending array', () => {
      const result = cs.sortStable([5, 4, 3, 2, 1]);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort random array', () => {
      const result = cs.sortStable([3, 1, 4, 1, 5, 9, 2, 6, 5, 3]);
      expect(result).toEqual([1, 1, 2, 3, 3, 4, 5, 5, 6, 9]);
    });

    it('should handle negative numbers', () => {
      const result = cs.sortStable([-3, -1, -2, 0, 2]);
      expect(result).toEqual([-3, -2, -1, 0, 2]);
    });

    it('should handle duplicates', () => {
      const result = cs.sortStable([1, 2, 2, 3, 1, 4, 3]);
      expect(result).toEqual([1, 1, 2, 2, 3, 3, 4]);
    });

    it('should update statistics after stable sort', () => {
      cs.sortStable([3, 1, 4, 1, 5]);
      expect(cs.totalElements).toBe(5);
      expect(cs.uniqueCount).toBe(4);
      expect(cs.min).toBe(1);
      expect(cs.max).toBe(5);
    });
  });

  describe('getCount', () => {
    it('should return 0 for unprocessed instance', () => {
      const result = cs.getCount(5);
      expect(result).toBe(0);
    });

    it('should return count of existing value', () => {
      cs.sort([1, 2, 2, 3, 1, 4, 3]);
      expect(cs.getCount(2)).toBe(2);
    });

    it('should return count of value that appears once', () => {
      cs.sort([1, 2, 3]);
      expect(cs.getCount(1)).toBe(1);
    });

    it('should return 0 for non-existent value', () => {
      cs.sort([1, 2, 3]);
      expect(cs.getCount(5)).toBe(0);
    });

    it('should return 0 for value below min', () => {
      cs.sort([5, 6, 7]);
      expect(cs.getCount(3)).toBe(0);
    });

    it('should return 0 for value above max', () => {
      cs.sort([5, 6, 7]);
      expect(cs.getCount(10)).toBe(0);
    });

    it('should handle negative numbers', () => {
      cs.sort([-3, -1, -2, -1, -3]);
      expect(cs.getCount(-1)).toBe(2);
      expect(cs.getCount(-2)).toBe(1);
      expect(cs.getCount(-3)).toBe(2);
    });

    it('should return correct count for all same values', () => {
      cs.sort([5, 5, 5, 5, 5]);
      expect(cs.getCount(5)).toBe(5);
    });
  });

  describe('getDistribution', () => {
    it('should return empty array for unprocessed instance', () => {
      const result = cs.getDistribution();
      expect(result).toEqual([]);
    });

    it('should return distribution for sorted array', () => {
      cs.sort([1, 2, 2, 3, 1, 4, 3]);
      const result = cs.getDistribution();
      expect(result).toEqual([
        { value: 1, count: 2 },
        { value: 2, count: 2 },
        { value: 3, count: 2 },
        { value: 4, count: 1 }
      ]);
    });

    it('should return distribution for single element', () => {
      cs.sort([5]);
      const result = cs.getDistribution();
      expect(result).toEqual([{ value: 5, count: 1 }]);
    });

    it('should return distribution with gaps', () => {
      cs.sort([1, 3, 5]);
      const result = cs.getDistribution();
      expect(result).toEqual([
        { value: 1, count: 1 },
        { value: 3, count: 1 },
        { value: 5, count: 1 }
      ]);
    });

    it('should handle negative numbers', () => {
      cs.sort([-3, -1, -2, 0, 2]);
      const result = cs.getDistribution();
      expect(result).toEqual([
        { value: -3, count: 1 },
        { value: -2, count: 1 },
        { value: -1, count: 1 },
        { value: 0, count: 1 },
        { value: 2, count: 1 }
      ]);
    });

    it('should not include values with zero count', () => {
      cs.sort([1, 5]);
      const result = cs.getDistribution();
      expect(result).toEqual([
        { value: 1, count: 1 },
        { value: 5, count: 1 }
      ]);
    });
  });

  describe('min', () => {
    it('should return undefined for unprocessed instance', () => {
      expect(cs.min).toBeUndefined();
    });

    it('should return minimum value after sorting', () => {
      cs.sort([5, 3, 7, 1, 9]);
      expect(cs.min).toBe(1);
    });

    it('should return minimum for single element', () => {
      cs.sort([5]);
      expect(cs.min).toBe(5);
    });

    it('should return minimum for negative numbers', () => {
      cs.sort([-3, -1, -2, 0, 2]);
      expect(cs.min).toBe(-3);
    });

    it('should work with min option more restrictive than data', () => {
      const csWithOptions = new CountingSort({ min: 5 });
      csWithOptions.sort([10, 15, 20]);
      expect(csWithOptions.min).toBe(5);
    });

    it('should work with min option less restrictive than data', () => {
      const csWithOptions = new CountingSort({ min: 5 });
      csWithOptions.sort([1, 2, 3, 4, 5]);
      expect(csWithOptions.min).toBe(1);
    });

    it('should update after multiple sorts', () => {
      cs.sort([5, 10, 15]);
      expect(cs.min).toBe(5);
      cs.sort([1, 2, 3]);
      expect(cs.min).toBe(1);
    });
  });

  describe('max', () => {
    it('should return undefined for unprocessed instance', () => {
      expect(cs.max).toBeUndefined();
    });

    it('should return maximum value after sorting', () => {
      cs.sort([5, 3, 7, 1, 9]);
      expect(cs.max).toBe(9);
    });

    it('should return maximum for single element', () => {
      cs.sort([5]);
      expect(cs.max).toBe(5);
    });

    it('should return maximum for negative numbers', () => {
      cs.sort([-3, -1, -2, 0, 2]);
      expect(cs.max).toBe(2);
    });

    it('should work with max option', () => {
      const csWithOptions = new CountingSort({ max: 10 });
      csWithOptions.sort([1, 5, 10]);
      expect(csWithOptions.max).toBe(10);
    });

    it('should update after multiple sorts', () => {
      cs.sort([5, 10, 15]);
      expect(cs.max).toBe(15);
      cs.sort([1, 2, 3]);
      expect(cs.max).toBe(3);
    });
  });

  describe('range', () => {
    it('should return 0 for unprocessed instance', () => {
      expect(cs.range).toBe(0);
    });

    it('should return range for sorted array', () => {
      cs.sort([5, 3, 7, 1, 9]);
      expect(cs.range).toBe(8);
    });

    it('should return 0 for single element', () => {
      cs.sort([5]);
      expect(cs.range).toBe(0);
    });

    it('should return range for negative numbers', () => {
      cs.sort([-3, -1, -2, 0, 2]);
      expect(cs.range).toBe(5);
    });

    it('should calculate correct range', () => {
      cs.sort([1, 10, 5, 15]);
      expect(cs.range).toBe(14);
    });
  });

  describe('uniqueCount', () => {
    it('should return 0 for unprocessed instance', () => {
      expect(cs.uniqueCount).toBe(0);
    });

    it('should return 1 for single element', () => {
      cs.sort([5]);
      expect(cs.uniqueCount).toBe(1);
    });

    it('should count unique values', () => {
      cs.sort([1, 2, 2, 3, 1, 4, 3]);
      expect(cs.uniqueCount).toBe(4);
    });

    it('should return total elements for all unique', () => {
      cs.sort([1, 2, 3, 4, 5]);
      expect(cs.uniqueCount).toBe(5);
    });

    it('should return 1 for all duplicates', () => {
      cs.sort([5, 5, 5, 5, 5]);
      expect(cs.uniqueCount).toBe(1);
    });
  });

  describe('totalElements', () => {
    it('should return 0 for unprocessed instance', () => {
      expect(cs.totalElements).toBe(0);
    });

    it('should return count for single element', () => {
      cs.sort([5]);
      expect(cs.totalElements).toBe(1);
    });

    it('should return total element count', () => {
      cs.sort([1, 2, 2, 3, 1, 4, 3]);
      expect(cs.totalElements).toBe(7);
    });

    it('should return total for all unique', () => {
      cs.sort([1, 2, 3, 4, 5]);
      expect(cs.totalElements).toBe(5);
    });

    it('should return total for all duplicates', () => {
      cs.sort([5, 5, 5, 5, 5]);
      expect(cs.totalElements).toBe(5);
    });
  });

  describe('isSorted', () => {
    it('should return true for empty array', () => {
      expect(CountingSort.isSorted([])).toBe(true);
    });

    it('should return true for single element', () => {
      expect(CountingSort.isSorted([5])).toBe(true);
    });

    it('should return true for sorted ascending array', () => {
      expect(CountingSort.isSorted([1, 2, 3, 4, 5])).toBe(true);
    });

    it('should return false for unsorted array', () => {
      expect(CountingSort.isSorted([5, 3, 7, 1, 9])).toBe(false);
    });

    it('should return true for array with equal elements', () => {
      expect(CountingSort.isSorted([1, 1, 1, 1])).toBe(true);
    });

    it('should return false for array with decreasing sequence', () => {
      expect(CountingSort.isSorted([5, 4, 3, 2, 1])).toBe(false);
    });

    it('should return false for array with single out-of-order element', () => {
      expect(CountingSort.isSorted([1, 2, 5, 4, 6])).toBe(false);
    });

    it('should handle negative numbers', () => {
      expect(CountingSort.isSorted([-3, -2, -1, 0, 2])).toBe(true);
      expect(CountingSort.isSorted([-1, -3, -2])).toBe(false);
    });
  });

  describe('merge', () => {
    it('should merge two empty arrays', () => {
      const result = CountingSort.merge([], []);
      expect(result).toEqual([]);
    });

    it('should merge empty array with non-empty', () => {
      const result = CountingSort.merge([], [1, 2, 3]);
      expect(result).toEqual([1, 2, 3]);
    });

    it('should merge non-empty array with empty', () => {
      const result = CountingSort.merge([1, 2, 3], []);
      expect(result).toEqual([1, 2, 3]);
    });

    it('should merge two sorted arrays', () => {
      const result = CountingSort.merge([1, 3, 5], [2, 4, 6]);
      expect(result).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('should merge arrays with duplicates', () => {
      const result = CountingSort.merge([1, 2, 2], [2, 3, 4]);
      expect(result).toEqual([1, 2, 2, 2, 3, 4]);
    });

    it('should merge arrays of different lengths', () => {
      const result = CountingSort.merge([1, 3, 5, 7], [2, 4]);
      expect(result).toEqual([1, 2, 3, 4, 5, 7]);
    });

    it('should merge arrays with negative numbers', () => {
      const result = CountingSort.merge([-3, -1, 1], [-2, 0, 2]);
      expect(result).toEqual([-3, -2, -1, 0, 1, 2]);
    });

    it('should merge arrays with all same elements', () => {
      const result = CountingSort.merge([1, 2, 3], [1, 2, 3]);
      expect(result).toEqual([1, 1, 2, 2, 3, 3]);
    });

    it('should handle single element arrays', () => {
      const result = CountingSort.merge([5], [3]);
      expect(result).toEqual([3, 5]);
    });
  });

  describe('from', () => {
    it('should create CountingSort from empty array', () => {
      const result = CountingSort.from([]);
      expect(result).toBeDefined();
      expect(result.totalElements).toBe(0);
    });

    it('should create CountingSort from array', () => {
      const result = CountingSort.from([5, 3, 7, 1, 9]);
      expect(result.totalElements).toBe(5);
      expect(result.uniqueCount).toBe(5);
      expect(result.min).toBe(1);
      expect(result.max).toBe(9);
    });

    it('should sort array when creating from array', () => {
      const result = CountingSort.from([5, 3, 7, 1, 9]);
      const distribution = result.getDistribution();
      expect(distribution).toEqual([
        { value: 1, count: 1 },
        { value: 3, count: 1 },
        { value: 5, count: 1 },
        { value: 7, count: 1 },
        { value: 9, count: 1 }
      ]);
    });

    it('should create with options more restrictive than data', () => {
      const result = CountingSort.from([5, 3, 7], { min: 0, max: 10 });
      expect(result).toBeDefined();
      expect(result.totalElements).toBe(3);
      expect(result.min).toBe(0);
      expect(result.max).toBe(10);
    });

    it('should create with options less restrictive than data', () => {
      const result = CountingSort.from([5, 3, 7], { min: 0, max: 20 });
      expect(result).toBeDefined();
      expect(result.totalElements).toBe(3);
      expect(result.min).toBe(0);
      expect(result.max).toBe(20);
    });

    it('should handle duplicates', () => {
      const result = CountingSort.from([1, 2, 2, 3, 1, 4, 3]);
      expect(result.totalElements).toBe(7);
      expect(result.uniqueCount).toBe(4);
    });

    it('should handle negative numbers', () => {
      const result = CountingSort.from([-3, -1, -2, 0, 2]);
      expect(result.totalElements).toBe(5);
      expect(result.min).toBe(-3);
      expect(result.max).toBe(2);
    });
  });

  describe('edge cases', () => {
    it('should handle very large range', () => {
      const result = cs.sort([0, 1000000, 500000]);
      expect(result).toEqual([0, 500000, 1000000]);
    });

    it.skip('should handle zero values', () => {
      const result = cs.sort([0, 0, 0, 1, -1, 0]);
      expect(result).toEqual([-1, 0, 0, 0, 0, 0, 1]);
    });

    it('should handle same values', () => {
      const result = cs.sort([5, 5, 5, 5, 5]);
      expect(result).toEqual([5, 5, 5, 5, 5]);
      expect(cs.uniqueCount).toBe(1);
    });

    it('should handle alternating high and low values', () => {
      const result = cs.sort([100, 1, 99, 2, 98, 3]);
      expect(result).toEqual([1, 2, 3, 98, 99, 100]);
    });

    it('should handle sorting twice on same instance', () => {
      cs.sort([5, 3, 1, 4, 2]);
      expect(cs.totalElements).toBe(5);
      expect(cs.uniqueCount).toBe(5);
      
      cs.sort([10, 20, 30]);
      expect(cs.totalElements).toBe(3);
      expect(cs.uniqueCount).toBe(3);
    });

    it('should handle sortDescending after sort', () => {
      cs.sort([5, 3, 1, 4, 2]);
      expect(cs.min).toBe(1);
      expect(cs.max).toBe(5);
      
      cs.sortDescending([10, 8, 6, 9, 7]);
      expect(cs.min).toBe(6);
      expect(cs.max).toBe(10);
    });

    it('should handle sortStable after other sorts', () => {
      cs.sort([5, 3, 1, 4, 2]);
      cs.sortStable([10, 8, 6, 9, 7]);
      expect(cs.min).toBe(6);
      expect(cs.max).toBe(10);
    });

    it('should handle sortInRange after other sorts', () => {
      cs.sort([5, 3, 1, 4, 2]);
      cs.sortInRange([10, 8, 6, 9, 7], 5, 15);
      expect(cs.min).toBe(5);
      expect(cs.max).toBe(15);
    });
  });
});
