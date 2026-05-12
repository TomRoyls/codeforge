import { describe, it, expect } from 'vitest';
import { MergeSort2 } from './src/core/merge-sort-2/index.js';

describe('MergeSort2', () => {
  describe('sort', () => {
    it('should sort empty array', () => {
      const sorter = new MergeSort2();
      expect(sorter.sort([])).toEqual([]);
    });

    it('should sort single element array', () => {
      const sorter = new MergeSort2();
      expect(sorter.sort([5])).toEqual([5]);
    });

    it('should sort two element array', () => {
      const sorter = new MergeSort2();
      expect(sorter.sort([2, 1])).toEqual([1, 2]);
    });

    it('should sort already sorted array', () => {
      const sorter = new MergeSort2();
      expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort reverse sorted array', () => {
      const sorter = new MergeSort2();
      expect(sorter.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort array with duplicates', () => {
      const sorter = new MergeSort2();
      expect(sorter.sort([3, 1, 4, 1, 5, 9, 2, 6, 5])).toEqual([1, 1, 2, 3, 4, 5, 5, 6, 9]);
    });

    it('should sort array with negative numbers', () => {
      const sorter = new MergeSort2();
      expect(sorter.sort([-3, 1, -4, 1, 5, -9, 2, 6, -5])).toEqual([-9, -5, -4, -3, 1, 1, 2, 5, 6]);
    });

    it('should not mutate original array', () => {
      const sorter = new MergeSort2();
      const original = [3, 1, 4, 1, 5];
      sorter.sort(original);
      expect(original).toEqual([3, 1, 4, 1, 5]);
    });

    it('should sort large random array', () => {
      const sorter = new MergeSort2();
      const arr = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 1000));
      const result = sorter.sort(arr);
      expect(result).toHaveLength(1000);
      expect(sorter.isSorted(result)).toBe(true);
    });

    it('should sort with custom comparator (descending)', () => {
      const sorter = new MergeSort2((a, b) => b - a);
      expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([5, 4, 3, 2, 1]);
    });

    it('should sort array with all same elements', () => {
      const sorter = new MergeSort2();
      expect(sorter.sort([5, 5, 5, 5, 5])).toEqual([5, 5, 5, 5, 5]);
    });

    it('should sort array with two elements reversed', () => {
      const sorter = new MergeSort2();
      expect(sorter.sort([10, 1])).toEqual([1, 10]);
    });

    it('should sort array with three elements unsorted', () => {
      const sorter = new MergeSort2();
      expect(sorter.sort([3, 1, 2])).toEqual([1, 2, 3]);
    });

    it('should sort array with three elements sorted', () => {
      const sorter = new MergeSort2();
      expect(sorter.sort([1, 2, 3])).toEqual([1, 2, 3]);
    });

    it('should sort array with three elements reversed', () => {
      const sorter = new MergeSort2();
      expect(sorter.sort([3, 2, 1])).toEqual([1, 2, 3]);
    });

    it('should sort array with zeros', () => {
      const sorter = new MergeSort2();
      expect(sorter.sort([0, 0, 1, 0, 2, 0])).toEqual([0, 0, 0, 0, 1, 2]);
    });

    it('should sort array with large negative numbers', () => {
      const sorter = new MergeSort2();
      expect(sorter.sort([-1000, -500, -100, -50, -10])).toEqual([-1000, -500, -100, -50, -10]);
    });

    it('should sort array with mix of positive and negative', () => {
      const sorter = new MergeSort2();
      expect(sorter.sort([-5, 3, -2, 7, -1])).toEqual([-5, -2, -1, 3, 7]);
    });

    it('should sort array with one duplicate only', () => {
      const sorter = new MergeSort2();
      expect(sorter.sort([1, 2, 3, 2, 4])).toEqual([1, 2, 2, 3, 4]);
    });

    it('should sort array where min is at end', () => {
      const sorter = new MergeSort2();
      expect(sorter.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort array where max is at start', () => {
      const sorter = new MergeSort2();
      expect(sorter.sort([10, 1, 2, 3, 4])).toEqual([1, 2, 3, 4, 10]);
    });
  });

  describe('sortInPlace', () => {
    it('should sort empty array in place', () => {
      const sorter = new MergeSort2();
      const arr: number[] = [];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([]);
    });

    it('should sort single element array in place', () => {
      const sorter = new MergeSort2();
      const arr = [5];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([5]);
    });

    it('should sort array in place', () => {
      const sorter = new MergeSort2();
      const arr = [3, 1, 4, 1, 5];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([1, 1, 3, 4, 5]);
    });

    it('should mutate original array', () => {
      const sorter = new MergeSort2();
      const arr = [3, 1, 4, 1, 5];
      sorter.sortInPlace(arr);
      expect(arr).not.toEqual([3, 1, 4, 1, 5]);
    });

    it('should sort reverse sorted array in place', () => {
      const sorter = new MergeSort2();
      const arr = [5, 4, 3, 2, 1];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort array with duplicates in place', () => {
      const sorter = new MergeSort2();
      const arr = [3, 1, 4, 1, 5, 9, 2, 6, 5];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([1, 1, 2, 3, 4, 5, 5, 6, 9]);
    });

    it('should sort array with negative numbers in place', () => {
      const sorter = new MergeSort2();
      const arr = [-3, 1, -4, 1, 5, -9, 2, 6, -5];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([-9, -5, -4, -3, 1, 1, 2, 5, 6]);
    });

    it('should sort large array in place', () => {
      const sorter = new MergeSort2();
      const arr = Array.from({ length: 500 }, () => Math.floor(Math.random() * 500));
      sorter.sortInPlace(arr);
      expect(sorter.isSorted(arr)).toBe(true);
    });

    it('should work with custom comparator in place', () => {
      const sorter = new MergeSort2((a, b) => b - a);
      const arr = [1, 2, 3, 4, 5];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([5, 4, 3, 2, 1]);
    });

    it('should sort array with two elements in place', () => {
      const sorter = new MergeSort2();
      const arr = [2, 1];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([1, 2]);
    });

    it('should sort array with all same elements in place', () => {
      const sorter = new MergeSort2();
      const arr = [5, 5, 5, 5, 5];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([5, 5, 5, 5, 5]);
    });

    it('should sort array where first element is smallest in place', () => {
      const sorter = new MergeSort2();
      const arr = [1, 5, 4, 3, 2];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort array where last element is largest in place', () => {
      const sorter = new MergeSort2();
      const arr = [2, 1, 3, 4, 5];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('sortRange', () => {
    it('should sort sub-range of array', () => {
      const sorter = new MergeSort2();
      const arr = [5, 4, 3, 2, 1];
      const result = sorter.sortRange(arr, 1, 3);
      expect(result).toEqual([2, 3, 4]);
    });

    it('should not mutate original array when sorting range', () => {
      const sorter = new MergeSort2();
      const arr = [5, 4, 3, 2, 1];
      sorter.sortRange(arr, 1, 3);
      expect(arr).toEqual([5, 4, 3, 2, 1]);
    });

    it('should sort single element range', () => {
      const sorter = new MergeSort2();
      const arr = [5, 4, 3, 2, 1];
      const result = sorter.sortRange(arr, 2, 2);
      expect(result).toEqual([3]);
    });

    it('should sort full range', () => {
      const sorter = new MergeSort2();
      const arr = [5, 4, 3, 2, 1];
      const result = sorter.sortRange(arr, 0, 4);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort range starting at beginning', () => {
      const sorter = new MergeSort2();
      const arr = [3, 1, 2, 5, 4];
      const result = sorter.sortRange(arr, 0, 2);
      expect(result).toEqual([1, 2, 3]);
    });

    it('should sort range ending at end', () => {
      const sorter = new MergeSort2();
      const arr = [5, 4, 1, 3, 2];
      const result = sorter.sortRange(arr, 2, 4);
      expect(result).toEqual([1, 2, 3]);
    });

    it('should sort range with duplicates', () => {
      const sorter = new MergeSort2();
      const arr = [3, 1, 4, 1, 5];
      const result = sorter.sortRange(arr, 0, 3);
      expect(result).toEqual([1, 1, 3, 4]);
    });

    it('should sort range with negative numbers', () => {
      const sorter = new MergeSort2();
      const arr = [-3, 1, -4, 1, 5];
      const result = sorter.sortRange(arr, 0, 3);
      expect(result).toEqual([-4, -3, 1, 1]);
    });

    it('should sort range with two elements', () => {
      const sorter = new MergeSort2();
      const arr = [5, 4, 3, 2, 1];
      const result = sorter.sortRange(arr, 1, 2);
      expect(result).toEqual([3, 4]);
    });

    it('should work with custom comparator on range', () => {
      const sorter = new MergeSort2((a, b) => b - a);
      const arr = [1, 2, 3, 4, 5];
      const result = sorter.sortRange(arr, 1, 3);
      expect(result).toEqual([4, 3, 2]);
    });
  });

  describe('isSorted', () => {
    it('should return true for empty array', () => {
      const sorter = new MergeSort2();
      expect(sorter.isSorted([])).toBe(true);
    });

    it('should return true for single element array', () => {
      const sorter = new MergeSort2();
      expect(sorter.isSorted([5])).toBe(true);
    });

    it('should return true for sorted array', () => {
      const sorter = new MergeSort2();
      expect(sorter.isSorted([1, 2, 3, 4, 5])).toBe(true);
    });

    it('should return false for unsorted array', () => {
      const sorter = new MergeSort2();
      expect(sorter.isSorted([3, 1, 4, 1, 5])).toBe(false);
    });

    it('should return true for array with duplicates', () => {
      const sorter = new MergeSort2();
      expect(sorter.isSorted([1, 1, 2, 3, 3, 4])).toBe(true);
    });

    it('should return true for array with all same elements', () => {
      const sorter = new MergeSort2();
      expect(sorter.isSorted([5, 5, 5, 5, 5])).toBe(true);
    });

    it('should work with custom comparator', () => {
      const sorter = new MergeSort2((a, b) => b - a);
      expect(sorter.isSorted([5, 4, 3, 2, 1])).toBe(true);
    });

    it('should return false when adjacent elements out of order', () => {
      const sorter = new MergeSort2();
      expect(sorter.isSorted([1, 2, 4, 3, 5])).toBe(false);
    });

    it('should return true for array with two sorted elements', () => {
      const sorter = new MergeSort2();
      expect(sorter.isSorted([1, 2])).toBe(true);
    });

    it('should return false for array with two unsorted elements', () => {
      const sorter = new MergeSort2();
      expect(sorter.isSorted([2, 1])).toBe(false);
    });

    it('should return true for sorted array with negative numbers', () => {
      const sorter = new MergeSort2();
      expect(sorter.isSorted([-5, -3, -1, 0, 2])).toBe(true);
    });

    it('should increment comparison counter', () => {
      const sorter = new MergeSort2();
      sorter.isSorted([1, 2, 3, 4, 5]);
      expect(sorter.getComparisons()).toBeGreaterThan(0);
    });
  });

  describe('merge', () => {
    it('should merge two sorted arrays', () => {
      const sorter = new MergeSort2();
      expect(sorter.merge([1, 3, 5], [2, 4, 6])).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('should merge empty arrays', () => {
      const sorter = new MergeSort2();
      expect(sorter.merge([], [])).toEqual([]);
    });

    it('should merge empty with non-empty', () => {
      const sorter = new MergeSort2();
      expect(sorter.merge([], [1, 2, 3])).toEqual([1, 2, 3]);
    });

    it('should merge non-empty with empty', () => {
      const sorter = new MergeSort2();
      expect(sorter.merge([1, 2, 3], [])).toEqual([1, 2, 3]);
    });

    it('should merge arrays with duplicates', () => {
      const sorter = new MergeSort2();
      expect(sorter.merge([1, 1, 3], [1, 2, 2])).toEqual([1, 1, 1, 2, 2, 3]);
    });

    it('should merge arrays of different lengths', () => {
      const sorter = new MergeSort2();
      expect(sorter.merge([1, 2, 3, 4, 5], [6])).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('should work with custom comparator', () => {
      const sorter = new MergeSort2((a, b) => b - a);
      expect(sorter.merge([5, 3, 1], [6, 4, 2])).toEqual([6, 5, 4, 3, 2, 1]);
    });

    it('should merge single element arrays', () => {
      const sorter = new MergeSort2();
      expect(sorter.merge([1], [2])).toEqual([1, 2]);
    });

    it('should merge arrays with negative numbers', () => {
      const sorter = new MergeSort2();
      expect(sorter.merge([-5, -3, 0], [-4, -1, 2])).toEqual([-5, -4, -3, -1, 0, 2]);
    });

    it('should increment comparison counter', () => {
      const sorter = new MergeSort2();
      sorter.merge([1, 3, 5], [2, 4, 6]);
      expect(sorter.getComparisons()).toBeGreaterThan(0);
    });

    it('should not increment swap counter when merging sorted', () => {
      const sorter = new MergeSort2();
      sorter.merge([1, 2, 3], [4, 5, 6]);
      expect(sorter.getSwaps()).toBe(0);
    });

    it('should increment swap counter when unmerging', () => {
      const sorter = new MergeSort2();
      sorter.merge([4, 5, 6], [1, 2, 3]);
      expect(sorter.getSwaps()).toBeGreaterThan(0);
    });
  });

  describe('getComparisons', () => {
    it('should return 0 initially', () => {
      const sorter = new MergeSort2();
      expect(sorter.getComparisons()).toBe(0);
    });

    it('should count comparisons in sort', () => {
      const sorter = new MergeSort2();
      sorter.sort([3, 1, 4, 1, 5]);
      expect(sorter.getComparisons()).toBeGreaterThan(0);
    });

    it('should count comparisons in sortInPlace', () => {
      const sorter = new MergeSort2();
      sorter.sortInPlace([3, 1, 4, 1, 5]);
      expect(sorter.getComparisons()).toBeGreaterThan(0);
    });

    it('should count comparisons in merge', () => {
      const sorter = new MergeSort2();
      sorter.merge([1, 3, 5], [2, 4, 6]);
      expect(sorter.getComparisons()).toBeGreaterThan(0);
    });

    it('should count comparisons in isSorted', () => {
      const sorter = new MergeSort2();
      sorter.isSorted([1, 2, 3, 4, 5]);
      expect(sorter.getComparisons()).toBeGreaterThan(0);
    });

    it('should accumulate comparisons across multiple calls', () => {
      const sorter = new MergeSort2();
      sorter.sort([3, 1, 4]);
      const count1 = sorter.getComparisons();
      sorter.sort([5, 2, 1]);
      const count2 = sorter.getComparisons();
      expect(count2).toBeGreaterThan(count1);
    });
  });

  describe('getSwaps', () => {
    it('should return 0 initially', () => {
      const sorter = new MergeSort2();
      expect(sorter.getSwaps()).toBe(0);
    });

    it('should count swaps in merge', () => {
      const sorter = new MergeSort2();
      sorter.merge([4, 5, 6], [1, 2, 3]);
      expect(sorter.getSwaps()).toBeGreaterThan(0);
    });

    it('should not count swaps when no swaps needed', () => {
      const sorter = new MergeSort2();
      sorter.merge([1, 2, 3], [4, 5, 6]);
      expect(sorter.getSwaps()).toBe(0);
    });

    it('should accumulate swaps across multiple calls', () => {
      const sorter = new MergeSort2();
      sorter.merge([4, 5], [1, 2]);
      const count1 = sorter.getSwaps();
      sorter.merge([3, 6], [2, 1]);
      const count2 = sorter.getSwaps();
      expect(count2).toBeGreaterThan(count1);
    });
  });

  describe('resetCounters', () => {
    it('should reset comparisons to 0', () => {
      const sorter = new MergeSort2();
      sorter.sort([3, 1, 4, 1, 5]);
      expect(sorter.getComparisons()).toBeGreaterThan(0);
      sorter.resetCounters();
      expect(sorter.getComparisons()).toBe(0);
    });

    it('should reset swaps to 0', () => {
      const sorter = new MergeSort2();
      sorter.merge([4, 5, 6], [1, 2, 3]);
      expect(sorter.getSwaps()).toBeGreaterThan(0);
      sorter.resetCounters();
      expect(sorter.getSwaps()).toBe(0);
    });

    it('should reset both counters', () => {
      const sorter = new MergeSort2();
      sorter.sort([3, 1, 4, 1, 5]);
      sorter.merge([4, 5], [1, 2]);
      expect(sorter.getComparisons()).toBeGreaterThan(0);
      expect(sorter.getSwaps()).toBeGreaterThan(0);
      sorter.resetCounters();
      expect(sorter.getComparisons()).toBe(0);
      expect(sorter.getSwaps()).toBe(0);
    });

    it('should allow re-use of sorter after reset', () => {
      const sorter = new MergeSort2();
      sorter.sort([3, 1, 4, 1, 5]);
      sorter.resetCounters();
      sorter.sort([5, 2, 1]);
      expect(sorter.getComparisons()).toBeGreaterThan(0);
    });
  });

  describe('integration tests', () => {
    it('should sort very large array efficiently', () => {
      const sorter = new MergeSort2();
      const arr = Array.from({ length: 10000 }, () => Math.floor(Math.random() * 10000));
      const result = sorter.sort(arr);
      expect(result).toHaveLength(10000);
      expect(sorter.isSorted(result)).toBe(true);
    });

    it('should handle array with range of values', () => {
      const sorter = new MergeSort2();
      const arr = [-1000, -500, 0, 500, 1000];
      const result = sorter.sort(arr);
      expect(result).toEqual([-1000, -500, 0, 500, 1000]);
    });

    it('should track metrics correctly across multiple operations', () => {
      const sorter = new MergeSort2();
      sorter.sort([3, 1, 4]);
      const comps1 = sorter.getComparisons();
      sorter.merge([1, 3], [2, 4]);
      const comps2 = sorter.getComparisons();
      const swaps = sorter.getSwaps();
      expect(comps2).toBeGreaterThan(comps1);
      expect(swaps).toBeGreaterThanOrEqual(0);
    });
  });
});
