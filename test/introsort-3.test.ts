import { describe, it, expect } from 'vitest';
import { Introsort3 } from '../src/core/introsort-3/index.js';

describe('Introsort3', () => {
  describe('sort()', () => {
    it('should sort empty array', () => {
      const sorter = new Introsort3();
      const result = sorter.sort([]);
      expect(result).toEqual([]);
      expect(sorter.isSorted(result)).toBe(true);
    });

    it('should sort single element array', () => {
      const sorter = new Introsort3();
      const result = sorter.sort([5]);
      expect(result).toEqual([5]);
      expect(sorter.isSorted(result)).toBe(true);
    });

    it('should sort already sorted array', () => {
      const sorter = new Introsort3();
      const result = sorter.sort([1, 2, 3, 4, 5]);
      expect(result).toEqual([1, 2, 3, 4, 5]);
      expect(sorter.isSorted(result)).toBe(true);
    });

    it('should sort reverse sorted array', () => {
      const sorter = new Introsort3();
      const result = sorter.sort([5, 4, 3, 2, 1]);
      expect(result).toEqual([1, 2, 3, 4, 5]);
      expect(sorter.isSorted(result)).toBe(true);
    });

    it('should sort random array', () => {
      const sorter = new Introsort3();
      const result = sorter.sort([3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]);
      expect(result).toEqual([1, 1, 2, 3, 3, 4, 5, 5, 5, 6, 9]);
      expect(sorter.isSorted(result)).toBe(true);
    });

    it('should sort array with duplicates', () => {
      const sorter = new Introsort3();
      const result = sorter.sort([5, 2, 5, 2, 3, 5, 1, 2]);
      expect(result).toEqual([1, 2, 2, 2, 3, 5, 5, 5]);
      expect(sorter.isSorted(result)).toBe(true);
    });

    it('should sort array with negative numbers', () => {
      const sorter = new Introsort3();
      const result = sorter.sort([-3, 1, -4, 1, 5, -9, 2, 6, -5]);
      expect(result).toEqual([-9, -5, -4, -3, 1, 1, 2, 5, 6]);
      expect(sorter.isSorted(result)).toBe(true);
    });

    it('should not mutate original array', () => {
      const sorter = new Introsort3();
      const original = [3, 1, 4, 1, 5];
      const arr = [...original];
      sorter.sort(arr);
      expect(arr).toEqual(original);
    });

    it('should sort array with all same elements', () => {
      const sorter = new Introsort3();
      const result = sorter.sort([5, 5, 5, 5, 5]);
      expect(result).toEqual([5, 5, 5, 5, 5]);
      expect(sorter.isSorted(result)).toBe(true);
    });

    it('should sort array with two elements', () => {
      const sorter = new Introsort3();
      const result = sorter.sort([2, 1]);
      expect(result).toEqual([1, 2]);
      expect(sorter.isSorted(result)).toBe(true);
    });

    it('should sort large array', () => {
      const sorter = new Introsort3();
      const arr = Array.from({ length: 100 }, () => Math.floor(Math.random() * 1000));
      const result = sorter.sort(arr);
      expect(result).toHaveLength(100);
      expect(sorter.isSorted(result)).toBe(true);
    });

    it('should sort array with many duplicates (three-way partition)', () => {
      const sorter = new Introsort3();
      const result = sorter.sort([5, 3, 5, 3, 5, 3, 5, 3, 5, 3]);
      expect(result).toEqual([3, 3, 3, 3, 3, 5, 5, 5, 5, 5]);
      expect(sorter.isSorted(result)).toBe(true);
    });

    it('should sort array with zeros', () => {
      const sorter = new Introsort3();
      const result = sorter.sort([0, 0, 1, 0, 2, 0]);
      expect(result).toEqual([0, 0, 0, 0, 1, 2]);
      expect(sorter.isSorted(result)).toBe(true);
    });

    it('should sort array with large negative numbers', () => {
      const sorter = new Introsort3();
      const result = sorter.sort([-1000, -500, -100, -50, -10]);
      expect(result).toEqual([-1000, -500, -100, -50, -10]);
      expect(sorter.isSorted(result)).toBe(true);
    });

    it('should sort array with mix of positive and negative', () => {
      const sorter = new Introsort3();
      const result = sorter.sort([-5, 3, -2, 7, -1]);
      expect(result).toEqual([-5, -2, -1, 3, 7]);
      expect(sorter.isSorted(result)).toBe(true);
    });
  });

  describe('sortDescending()', () => {
    it('should sort in descending order', () => {
      const sorter = new Introsort3();
      const result = sorter.sortDescending([1, 2, 3, 4, 5]);
      expect(result).toEqual([5, 4, 3, 2, 1]);
    });

    it('should handle empty array', () => {
      const sorter = new Introsort3();
      const result = sorter.sortDescending([]);
      expect(result).toEqual([]);
    });

    it('should handle single element', () => {
      const sorter = new Introsort3();
      const result = sorter.sortDescending([5]);
      expect(result).toEqual([5]);
    });

    it('should sort reverse sorted array to ascending then reverse', () => {
      const sorter = new Introsort3();
      const result = sorter.sortDescending([5, 4, 3, 2, 1]);
      expect(result).toEqual([5, 4, 3, 2, 1]);
    });

    it('should sort random array descending', () => {
      const sorter = new Introsort3();
      const result = sorter.sortDescending([3, 1, 4, 1, 5]);
      expect(result).toEqual([5, 4, 3, 1, 1]);
    });

    it('should not mutate original array', () => {
      const sorter = new Introsort3();
      const original = [3, 1, 4, 1, 5];
      sorter.sortDescending(original);
      expect(original).toEqual([3, 1, 4, 1, 5]);
    });
  });

  describe('isSorted()', () => {
    it('should return true for empty array', () => {
      const sorter = new Introsort3();
      expect(sorter.isSorted([])).toBe(true);
    });

    it('should return true for single element array', () => {
      const sorter = new Introsort3();
      expect(sorter.isSorted([5])).toBe(true);
    });

    it('should return true for sorted array', () => {
      const sorter = new Introsort3();
      expect(sorter.isSorted([1, 2, 3, 4, 5])).toBe(true);
    });

    it('should return false for unsorted array', () => {
      const sorter = new Introsort3();
      expect(sorter.isSorted([3, 1, 4, 1, 5])).toBe(false);
    });

    it('should return true for array with duplicates', () => {
      const sorter = new Introsort3();
      expect(sorter.isSorted([1, 1, 2, 3, 3, 4])).toBe(true);
    });

    it('should return true for array with all same elements', () => {
      const sorter = new Introsort3();
      expect(sorter.isSorted([5, 5, 5, 5, 5])).toBe(true);
    });

    it('should return true for sorted array with negative numbers', () => {
      const sorter = new Introsort3();
      expect(sorter.isSorted([-5, -3, -1, 0, 2])).toBe(true);
    });

    it('should return false when adjacent elements out of order', () => {
      const sorter = new Introsort3();
      expect(sorter.isSorted([1, 2, 4, 3, 5])).toBe(false);
    });
  });

  describe('getMaxDepth()', () => {
    it('should return 0 for n=0', () => {
      const sorter = new Introsort3();
      expect(sorter.getMaxDepth(0)).toBe(0);
    });

    it('should return 0 for n=1', () => {
      const sorter = new Introsort3();
      expect(sorter.getMaxDepth(1)).toBe(0);
    });

    it('should return 2 for n=2', () => {
      const sorter = new Introsort3();
      expect(sorter.getMaxDepth(2)).toBe(2);
    });

    it('should return 4 for n=4', () => {
      const sorter = new Introsort3();
      expect(sorter.getMaxDepth(4)).toBe(4);
    });

    it('should return 6 for n=8', () => {
      const sorter = new Introsort3();
      expect(sorter.getMaxDepth(8)).toBe(6);
    });

    it('should return 8 for n=16', () => {
      const sorter = new Introsort3();
      expect(sorter.getMaxDepth(16)).toBe(8);
    });

    it('should return 20 for n=1024', () => {
      const sorter = new Introsort3();
      expect(sorter.getMaxDepth(1024)).toBe(20);
    });

    it('should return 40 for n=1048576', () => {
      const sorter = new Introsort3();
      expect(sorter.getMaxDepth(1048576)).toBe(40);
    });
  });

  describe('sortWithMaxDepth()', () => {
    it('should sort with custom max depth', () => {
      const sorter = new Introsort3();
      const arr = [5, 3, 1, 4, 2];
      const result = sorter.sortWithMaxDepth(arr, 10);
      expect(result).toEqual([1, 2, 3, 4, 5]);
      expect(sorter.isSorted(result)).toBe(true);
    });

    it('should handle empty array with max depth', () => {
      const sorter = new Introsort3();
      const result = sorter.sortWithMaxDepth([], 10);
      expect(result).toEqual([]);
    });

    it('should handle single element with max depth', () => {
      const sorter = new Introsort3();
      const result = sorter.sortWithMaxDepth([5], 10);
      expect(result).toEqual([5]);
    });

    it('should work with zero max depth (fallback to heapsort)', () => {
      const sorter = new Introsort3();
      const arr = [5, 3, 1, 4, 2];
      const result = sorter.sortWithMaxDepth(arr, 0);
      expect(result).toEqual([1, 2, 3, 4, 5]);
      expect(sorter.isSorted(result)).toBe(true);
    });

    it('should not mutate original array', () => {
      const sorter = new Introsort3();
      const original = [3, 1, 4, 1, 5];
      sorter.sortWithMaxDepth(original, 10);
      expect(original).toEqual([3, 1, 4, 1, 5]);
    });

    it('should sort large array with limited depth', () => {
      const sorter = new Introsort3();
      const arr = Array.from({ length: 100 }, () => Math.floor(Math.random() * 1000));
      const result = sorter.sortWithMaxDepth(arr, 5);
      expect(result).toHaveLength(100);
      expect(sorter.isSorted(result)).toBe(true);
    });

    it('should sort array with duplicates and limited depth', () => {
      const sorter = new Introsort3();
      const result = sorter.sortWithMaxDepth([5, 3, 5, 3, 5, 3], 5);
      expect(result).toEqual([3, 3, 3, 5, 5, 5]);
      expect(sorter.isSorted(result)).toBe(true);
    });

    it('should sort negative numbers with limited depth', () => {
      const sorter = new Introsort3();
      const result = sorter.sortWithMaxDepth([-5, 3, -2, 7, -1], 3);
      expect(result).toEqual([-5, -2, -1, 3, 7]);
      expect(sorter.isSorted(result)).toBe(true);
    });
  });

  describe('getComparisons()', () => {
    it('should return 0 initially', () => {
      const sorter = new Introsort3();
      expect(sorter.getComparisons()).toBe(0);
    });

    it('should count comparisons in sort', () => {
      const sorter = new Introsort3();
      sorter.sort([3, 1, 4, 1, 5]);
      expect(sorter.getComparisons()).toBeGreaterThan(0);
    });

    it('should accumulate comparisons across multiple calls', () => {
      const sorter = new Introsort3();
      sorter.sort([3, 1, 4]);
      const count1 = sorter.getComparisons();
      sorter.sort([5, 2, 1]);
      const count2 = sorter.getComparisons();
      expect(count2).toBeGreaterThan(count1);
    });
  });

  describe('getSwaps()', () => {
    it('should return 0 initially', () => {
      const sorter = new Introsort3();
      expect(sorter.getSwaps()).toBe(0);
    });

    it('should count swaps in sort', () => {
      const sorter = new Introsort3();
      sorter.sort([5, 4, 3, 2, 1]);
      expect(sorter.getSwaps()).toBeGreaterThan(0);
    });

    it('should accumulate swaps across multiple calls', () => {
      const sorter = new Introsort3();
      sorter.sort([5, 4, 3]);
      const count1 = sorter.getSwaps();
      sorter.sort([3, 2, 1]);
      const count2 = sorter.getSwaps();
      expect(count2).toBeGreaterThan(count1);
    });
  });

  describe('resetCounters()', () => {
    it('should reset comparisons to 0', () => {
      const sorter = new Introsort3();
      sorter.sort([3, 1, 4, 1, 5]);
      expect(sorter.getComparisons()).toBeGreaterThan(0);
      sorter.resetCounters();
      expect(sorter.getComparisons()).toBe(0);
    });

    it('should reset swaps to 0', () => {
      const sorter = new Introsort3();
      sorter.sort([5, 4, 3, 2, 1]);
      expect(sorter.getSwaps()).toBeGreaterThan(0);
      sorter.resetCounters();
      expect(sorter.getSwaps()).toBe(0);
    });

    it('should allow re-use of sorter after reset', () => {
      const sorter = new Introsort3();
      sorter.sort([3, 1, 4, 1, 5]);
      sorter.resetCounters();
      sorter.sort([5, 2, 1]);
      expect(sorter.getComparisons()).toBeGreaterThan(0);
      expect(sorter.getSwaps()).toBeGreaterThan(0);
    });
  });

  describe('getTimeComplexity()', () => {
    it('should return correct time complexity', () => {
      const sorter = new Introsort3();
      expect(sorter.getTimeComplexity()).toContain('O(n log n)');
    });

    it('should mention worst case', () => {
      const sorter = new Introsort3();
      expect(sorter.getTimeComplexity()).toContain('O(n log n) worst');
    });

    it('should mention space complexity', () => {
      const sorter = new Introsort3();
      expect(sorter.getTimeComplexity()).toContain('O(n log n) space');
    });
  });

  describe('getSpaceComplexity()', () => {
    it('should return correct space complexity', () => {
      const sorter = new Introsort3();
      expect(sorter.getSpaceComplexity()).toContain('O(log n)');
    });

    it('should mention recursion stack', () => {
      const sorter = new Introsort3();
      expect(sorter.getSpaceComplexity()).toContain('recursion stack');
    });
  });

  describe('integration tests', () => {
    it('should sort very large array efficiently', () => {
      const sorter = new Introsort3();
      const arr = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 1000));
      const result = sorter.sort(arr);
      expect(result).toHaveLength(1000);
      expect(sorter.isSorted(result)).toBe(true);
    });

    it('should handle array with all same elements efficiently (three-way partition)', () => {
      const sorter = new Introsort3();
      const arr = Array.from({ length: 100 }, () => 5);
      const result = sorter.sort(arr);
      expect(result).toHaveLength(100);
      expect(sorter.isSorted(result)).toBe(true);
    });

    it('should work correctly after multiple operations', () => {
      const sorter = new Introsort3();
      const arr1 = [3, 1, 4, 1, 5];
      const result1 = sorter.sort(arr1);
      expect(sorter.isSorted(result1)).toBe(true);

      const comps1 = sorter.getComparisons();
      const swaps1 = sorter.getSwaps();

      sorter.resetCounters();

      const arr2 = [5, 2, 8, 1, 9];
      const result2 = sorter.sort(arr2);
      expect(sorter.isSorted(result2)).toBe(true);

      const comps2 = sorter.getComparisons();
      const swaps2 = sorter.getSwaps();

      expect(comps1).toBeGreaterThan(0);
      expect(swaps1).toBeGreaterThan(0);
      expect(comps2).toBeGreaterThan(0);
      expect(swaps2).toBeGreaterThan(0);
    });

    it('should handle introSort with depth limit', () => {
      const sorter = new Introsort3();
      const arr = Array.from({ length: 100 }, () => Math.floor(Math.random() * 1000));
      const result = sorter.sort(arr);
      expect(result).toHaveLength(100);
      expect(sorter.isSorted(result)).toBe(true);
    });

    it('should work with custom comparator', () => {
      const sorter = new Introsort3((a: number, b: number) => b - a);
      const result = sorter.sort([1, 2, 3, 4, 5]);
      expect(result).toEqual([5, 4, 3, 2, 1]);
    });

    it('should handle mixed positive, negative, and zero values', () => {
      const sorter = new Introsort3();
      const result = sorter.sort([0, -5, 3, -2, 7, 0, -1, 4]);
      expect(result).toEqual([-5, -2, -1, 0, 0, 3, 4, 7]);
      expect(sorter.isSorted(result)).toBe(true);
    });

    it('should maintain stability with duplicates', () => {
      const sorter = new Introsort3();
      const arr = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5];
      const result = sorter.sort(arr);
      expect(result).toEqual([1, 1, 2, 3, 3, 4, 5, 5, 5, 6, 9]);
      expect(sorter.isSorted(result)).toBe(true);
    });
  });
});
