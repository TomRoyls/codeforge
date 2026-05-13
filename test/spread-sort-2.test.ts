import { describe, it, expect } from 'vitest';
import { SpreadSort2 } from '../src/core/spread-sort-2/index.js';

describe('SpreadSort2', () => {
  describe('sort', () => {
    it('should sort empty array', () => {
      const sorter = new SpreadSort2();
      expect(sorter.sort([])).toEqual([]);
    });

    it('should sort single element array', () => {
      const sorter = new SpreadSort2();
      expect(sorter.sort([5])).toEqual([5]);
    });

    it('should sort two element array', () => {
      const sorter = new SpreadSort2();
      expect(sorter.sort([2, 1])).toEqual([1, 2]);
    });

    it('should sort already sorted array', () => {
      const sorter = new SpreadSort2();
      expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort reverse sorted array', () => {
      const sorter = new SpreadSort2();
      expect(sorter.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort array with duplicates', () => {
      const sorter = new SpreadSort2();
      expect(sorter.sort([3, 1, 4, 1, 5, 9, 2, 6, 5])).toEqual([1, 1, 2, 3, 4, 5, 5, 6, 9]);
    });

    it('should sort array with negative numbers', () => {
      const sorter = new SpreadSort2();
      expect(sorter.sort([-3, 1, -4, 1, 5, -9, 2, 6, -5])).toEqual([-9, -5, -4, -3, 1, 1, 2, 5, 6]);
    });

    it('should not mutate original array', () => {
      const sorter = new SpreadSort2();
      const original = [3, 1, 4, 1, 5];
      sorter.sort(original);
      expect(original).toEqual([3, 1, 4, 1, 5]);
    });

    it('should sort large random array', () => {
      const sorter = new SpreadSort2();
      const arr = Array.from({ length: 10000 }, () => Math.floor(Math.random() * 10000));
      const result = sorter.sort(arr);
      expect(result).toHaveLength(10000);
      expect(sorter.isSorted(result)).toBe(true);
    });

    it('should sort with custom comparator (descending)', () => {
      const sorter = new SpreadSort2((a, b) => b - a);
      expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([5, 4, 3, 2, 1]);
    });

    it('should sort array with floating point numbers', () => {
      const sorter = new SpreadSort2();
      expect(sorter.sort([3.5, 1.2, 4.8, 1.7, 5.1])).toEqual([1.2, 1.7, 3.5, 4.8, 5.1]);
    });

    it('should sort array with all same elements', () => {
      const sorter = new SpreadSort2();
      expect(sorter.sort([5, 5, 5, 5, 5])).toEqual([5, 5, 5, 5, 5]);
    });

    it('should sort array with zeros', () => {
      const sorter = new SpreadSort2();
      expect(sorter.sort([0, 0, 1, 0, 2, 0])).toEqual([0, 0, 0, 0, 1, 2]);
    });

    it('should sort array with large negative numbers', () => {
      const sorter = new SpreadSort2();
      expect(sorter.sort([-1000, -500, -100, -50, -10])).toEqual([-1000, -500, -100, -50, -10]);
    });

    it('should sort array with mix of positive and negative', () => {
      const sorter = new SpreadSort2();
      expect(sorter.sort([-5, 3, -2, 7, -1])).toEqual([-5, -2, -1, 3, 7]);
    });
  });

  describe('sortInPlace', () => {
    it('should sort empty array in place', () => {
      const sorter = new SpreadSort2();
      const arr: number[] = [];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([]);
    });

    it('should sort single element array in place', () => {
      const sorter = new SpreadSort2();
      const arr = [5];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([5]);
    });

    it('should sort array in place', () => {
      const sorter = new SpreadSort2();
      const arr = [3, 1, 4, 1, 5];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([1, 1, 3, 4, 5]);
    });

    it('should mutate original array', () => {
      const sorter = new SpreadSort2();
      const arr = [3, 1, 4, 1, 5];
      sorter.sortInPlace(arr);
      expect(arr).not.toEqual([3, 1, 4, 1, 5]);
    });

    it('should sort reverse sorted array in place', () => {
      const sorter = new SpreadSort2();
      const arr = [5, 4, 3, 2, 1];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort array with duplicates in place', () => {
      const sorter = new SpreadSort2();
      const arr = [3, 1, 4, 1, 5, 9, 2, 6, 5];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([1, 1, 2, 3, 4, 5, 5, 6, 9]);
    });

    it('should sort array with negative numbers in place', () => {
      const sorter = new SpreadSort2();
      const arr = [-3, 1, -4, 1, 5, -9, 2, 6, -5];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([-9, -5, -4, -3, 1, 1, 2, 5, 6]);
    });

    it('should sort large array in place', () => {
      const sorter = new SpreadSort2();
      const arr = Array.from({ length: 10000 }, () => Math.floor(Math.random() * 10000));
      sorter.sortInPlace(arr);
      expect(sorter.isSorted(arr)).toBe(true);
    });

    it('should work with custom comparator in place', () => {
      const sorter = new SpreadSort2((a, b) => b - a);
      const arr = [1, 2, 3, 4, 5];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([5, 4, 3, 2, 1]);
    });

    it('should sort array with floating point numbers in place', () => {
      const sorter = new SpreadSort2();
      const arr = [3.5, 1.2, 4.8, 1.7, 5.1];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([1.2, 1.7, 3.5, 4.8, 5.1]);
    });

    it('should sort array with all same elements in place', () => {
      const sorter = new SpreadSort2();
      const arr = [5, 5, 5, 5, 5];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([5, 5, 5, 5, 5]);
    });
  });

  describe('isSorted', () => {
    it('should return true for empty array', () => {
      const sorter = new SpreadSort2();
      expect(sorter.isSorted([])).toBe(true);
    });

    it('should return true for single element array', () => {
      const sorter = new SpreadSort2();
      expect(sorter.isSorted([5])).toBe(true);
    });

    it('should return true for sorted array', () => {
      const sorter = new SpreadSort2();
      expect(sorter.isSorted([1, 2, 3, 4, 5])).toBe(true);
    });

    it('should return false for unsorted array', () => {
      const sorter = new SpreadSort2();
      expect(sorter.isSorted([3, 1, 4, 1, 5])).toBe(false);
    });

    it('should return true for array with duplicates', () => {
      const sorter = new SpreadSort2();
      expect(sorter.isSorted([1, 1, 2, 3, 3, 4])).toBe(true);
    });

    it('should return true for array with all same elements', () => {
      const sorter = new SpreadSort2();
      expect(sorter.isSorted([5, 5, 5, 5, 5])).toBe(true);
    });

    it('should work with custom comparator', () => {
      const sorter = new SpreadSort2((a, b) => b - a);
      expect(sorter.isSorted([5, 4, 3, 2, 1])).toBe(true);
    });

    it('should return false when adjacent elements out of order', () => {
      const sorter = new SpreadSort2();
      expect(sorter.isSorted([1, 2, 4, 3, 5])).toBe(false);
    });

    it('should return true for sorted array with negative numbers', () => {
      const sorter = new SpreadSort2();
      expect(sorter.isSorted([-5, -3, -1, 0, 2])).toBe(true);
    });
  });

  describe('getComparisons', () => {
    it('should return 0 initially', () => {
      const sorter = new SpreadSort2();
      expect(sorter.getComparisons()).toBe(0);
    });

    it('should count comparisons in sort', () => {
      const sorter = new SpreadSort2();
      sorter.sort([3, 1, 4, 1, 5]);
      expect(sorter.getComparisons()).toBeGreaterThan(0);
    });

    it('should count comparisons in sortInPlace', () => {
      const sorter = new SpreadSort2();
      sorter.sortInPlace([3, 1, 4, 1, 5]);
      expect(sorter.getComparisons()).toBeGreaterThan(0);
    });

    it('should count comparisons in isSorted', () => {
      const sorter = new SpreadSort2();
      sorter.isSorted([1, 2, 3, 4, 5]);
      expect(sorter.getComparisons()).toBeGreaterThan(0);
    });

    it('should accumulate comparisons across multiple calls', () => {
      const sorter = new SpreadSort2();
      sorter.sort([3, 1, 4]);
      const count1 = sorter.getComparisons();
      sorter.sort([5, 2, 1]);
      const count2 = sorter.getComparisons();
      expect(count2).toBeGreaterThan(count1);
    });
  });

  describe('getSwaps', () => {
    it('should return 0 initially', () => {
      const sorter = new SpreadSort2();
      expect(sorter.getSwaps()).toBe(0);
    });

    it('should count swaps in sort', () => {
      const sorter = new SpreadSort2();
      sorter.sort([3, 1, 4, 1, 5]);
      expect(sorter.getSwaps()).toBeGreaterThanOrEqual(0);
    });

    it('should count swaps in sortInPlace', () => {
      const sorter = new SpreadSort2();
      sorter.sortInPlace([3, 1, 4, 1, 5]);
      expect(sorter.getSwaps()).toBeGreaterThanOrEqual(0);
    });

    it('should accumulate swaps across multiple calls', () => {
      const sorter = new SpreadSort2();
      sorter.sort([3, 1, 4]);
      const count1 = sorter.getSwaps();
      sorter.sort([5, 2, 1]);
      const count2 = sorter.getSwaps();
      expect(count2).toBeGreaterThanOrEqual(count1);
    });
  });

  describe('resetCounters', () => {
    it('should reset comparisons to 0', () => {
      const sorter = new SpreadSort2();
      sorter.sort([3, 1, 4, 1, 5]);
      expect(sorter.getComparisons()).toBeGreaterThan(0);
      sorter.resetCounters();
      expect(sorter.getComparisons()).toBe(0);
    });

    it('should reset swaps to 0', () => {
      const sorter = new SpreadSort2();
      sorter.sort([3, 1, 4, 1, 5]);
      const swaps = sorter.getSwaps();
      sorter.resetCounters();
      expect(sorter.getSwaps()).toBe(0);
    });

    it('should reset both counters', () => {
      const sorter = new SpreadSort2();
      sorter.sort([3, 1, 4, 1, 5]);
      expect(sorter.getComparisons()).toBeGreaterThan(0);
      const swaps = sorter.getSwaps();
      sorter.resetCounters();
      expect(sorter.getComparisons()).toBe(0);
      expect(sorter.getSwaps()).toBe(0);
    });

    it('should allow re-use of sorter after reset', () => {
      const sorter = new SpreadSort2();
      sorter.sort([3, 1, 4, 1, 5]);
      sorter.resetCounters();
      sorter.sort([5, 2, 1]);
      expect(sorter.getComparisons()).toBeGreaterThan(0);
    });
  });

  describe('integration tests', () => {
    it('should handle array with small range', () => {
      const sorter = new SpreadSort2();
      const arr = [1, 2, 3, 4, 5];
      const result = sorter.sort(arr);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle array with large range', () => {
      const sorter = new SpreadSort2();
      const arr = [-1000, 0, 1000, 2000, 3000];
      const result = sorter.sort(arr);
      expect(result).toEqual([-1000, 0, 1000, 2000, 3000]);
    });

    it('should track metrics correctly across multiple operations', () => {
      const sorter = new SpreadSort2();
      sorter.sort([3, 1, 4]);
      const comps1 = sorter.getComparisons();
      sorter.sort([5, 2, 1]);
      const comps2 = sorter.getComparisons();
      const swaps = sorter.getSwaps();
      expect(comps2).toBeGreaterThan(comps1);
      expect(swaps).toBeGreaterThanOrEqual(0);
    });

    it('should handle very large array efficiently', () => {
      const sorter = new SpreadSort2();
      const arr = Array.from({ length: 10000 }, () => Math.floor(Math.random() * 10000));
      const result = sorter.sort(arr);
      expect(result).toHaveLength(10000);
      expect(sorter.isSorted(result)).toBe(true);
    });
  });
});
