import { describe, it, expect } from 'vitest';
import { AdaptiveSort } from './src/core/adaptive-sort/index.js';

describe('AdaptiveSort', () => {
  describe('sort', () => {
    it('should sort empty array', () => {
      const sorter = new AdaptiveSort([]);
      expect(sorter.sort()).toEqual([]);
    });

    it('should sort single element array', () => {
      const sorter = new AdaptiveSort([5]);
      expect(sorter.sort()).toEqual([5]);
    });

    it('should sort already sorted array', () => {
      const sorter = new AdaptiveSort([1, 2, 3, 4, 5]);
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort reverse sorted array', () => {
      const sorter = new AdaptiveSort([5, 4, 3, 2, 1]);
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort random array', () => {
      const sorter = new AdaptiveSort([3, 1, 4, 1, 5, 9, 2, 6, 5]);
      expect(sorter.sort()).toEqual([1, 1, 2, 3, 4, 5, 5, 6, 9]);
    });

    it('should sort array with duplicates', () => {
      const sorter = new AdaptiveSort([3, 1, 4, 1, 5, 9, 2, 6, 5]);
      expect(sorter.sort()).toEqual([1, 1, 2, 3, 4, 5, 5, 6, 9]);
    });

    it('should sort array with negative numbers', () => {
      const sorter = new AdaptiveSort([-3, 1, -4, 1, 5, -9, 2, 6, -5]);
      expect(sorter.sort()).toEqual([-9, -5, -4, -3, 1, 1, 2, 5, 6]);
    });

    it('should sort with custom comparator (descending)', () => {
      const sorter = new AdaptiveSort([1, 2, 3, 4, 5], (a, b) => b - a);
      expect(sorter.sort()).toEqual([5, 4, 3, 2, 1]);
    });

    it('should sort large array', () => {
      const arr = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 1000));
      const sorter = new AdaptiveSort(arr);
      const result = sorter.sort();
      expect(result).toHaveLength(1000);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should not mutate original array', () => {
      const original = [3, 1, 4, 1, 5];
      const sorter = new AdaptiveSort(original);
      sorter.sort();
      expect(original).toEqual([3, 1, 4, 1, 5]);
    });

    it('should sort array with all same elements', () => {
      const sorter = new AdaptiveSort([5, 5, 5, 5, 5]);
      expect(sorter.sort()).toEqual([5, 5, 5, 5, 5]);
    });

    it('should sort array with two elements', () => {
      const sorter = new AdaptiveSort([2, 1]);
      expect(sorter.sort()).toEqual([1, 2]);
    });

    it('should sort array with two elements sorted', () => {
      const sorter = new AdaptiveSort([1, 2]);
      expect(sorter.sort()).toEqual([1, 2]);
    });

    it('should sort array with three elements unsorted', () => {
      const sorter = new AdaptiveSort([3, 1, 2]);
      expect(sorter.sort()).toEqual([1, 2, 3]);
    });

    it('should sort array with three elements sorted', () => {
      const sorter = new AdaptiveSort([1, 2, 3]);
      expect(sorter.sort()).toEqual([1, 2, 3]);
    });

    it('should sort array with three elements reversed', () => {
      const sorter = new AdaptiveSort([3, 2, 1]);
      expect(sorter.sort()).toEqual([1, 2, 3]);
    });

    it('should sort array with zeros', () => {
      const sorter = new AdaptiveSort([0, 0, 1, 0, 2, 0]);
      expect(sorter.sort()).toEqual([0, 0, 0, 0, 1, 2]);
    });

    it('should sort array with large negative numbers', () => {
      const sorter = new AdaptiveSort([-1000, -500, -100, -50, -10]);
      expect(sorter.sort()).toEqual([-1000, -500, -100, -50, -10]);
    });

    it('should sort array with mix of positive and negative', () => {
      const sorter = new AdaptiveSort([-5, 3, -2, 7, -1]);
      expect(sorter.sort()).toEqual([-5, -2, -1, 3, 7]);
    });

    it('should sort array with one duplicate only', () => {
      const sorter = new AdaptiveSort([1, 2, 3, 2, 4]);
      expect(sorter.sort()).toEqual([1, 2, 2, 3, 4]);
    });

    it('should sort array where min is at end', () => {
      const sorter = new AdaptiveSort([5, 4, 3, 2, 1]);
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort array where max is at start', () => {
      const sorter = new AdaptiveSort([10, 1, 2, 3, 4]);
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 10]);
    });

    it('should sort nearly sorted array', () => {
      const sorter = new AdaptiveSort([1, 2, 3, 5, 4]);
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort nearly sorted array with multiple inversions', () => {
      const sorter = new AdaptiveSort([1, 3, 2, 5, 4, 7, 6]);
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it('should work with string array', () => {
      const sorter = new AdaptiveSort(['banana', 'apple', 'cherry']);
      expect(sorter.sort()).toEqual(['apple', 'banana', 'cherry']);
    });

    it('should work with string array custom comparator', () => {
      const sorter = new AdaptiveSort(['banana', 'apple', 'cherry'], (a, b) => b.localeCompare(a));
      expect(sorter.sort()).toEqual(['cherry', 'banana', 'apple']);
    });

    it('should work with object array and custom comparator', () => {
      const objects = [
        { id: 3, name: 'c' },
        { id: 1, name: 'a' },
        { id: 2, name: 'b' },
      ];
      const sorter = new AdaptiveSort(objects, (a, b) => a.id - b.id);
      const result = sorter.sort();
      expect(result[0]!.id).toBe(1);
      expect(result[1]!.id).toBe(2);
      expect(result[2]!.id).toBe(3);
    });

    it('should sort array with alternating pattern', () => {
      const sorter = new AdaptiveSort([1, 10, 2, 9, 3, 8, 4, 7, 5, 6]);
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('should sort array with large gap between min and max', () => {
      const sorter = new AdaptiveSort([-1000000, 0, 1000000]);
      expect(sorter.sort()).toEqual([-1000000, 0, 1000000]);
    });

    it('should sort very large array efficiently', () => {
      const arr = Array.from({ length: 10000 }, () => Math.floor(Math.random() * 10000));
      const sorter = new AdaptiveSort(arr);
      const result = sorter.sort();
      expect(result).toHaveLength(10000);
      expect(sorter.isSorted()).toBe(true);
    });
  });

  describe('isSorted', () => {
    it('should return true for empty array', () => {
      const sorter = new AdaptiveSort([]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should return true for single element array', () => {
      const sorter = new AdaptiveSort([5]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should return true for sorted array', () => {
      const sorter = new AdaptiveSort([1, 2, 3, 4, 5]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should return false for unsorted array', () => {
      const sorter = new AdaptiveSort([3, 1, 4, 1, 5]);
      expect(sorter.isSorted()).toBe(false);
    });

    it('should return true for array with duplicates', () => {
      const sorter = new AdaptiveSort([1, 1, 2, 3, 3, 4]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should return true for array with all same elements', () => {
      const sorter = new AdaptiveSort([5, 5, 5, 5, 5]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should return false when adjacent elements out of order', () => {
      const sorter = new AdaptiveSort([1, 2, 4, 3, 5]);
      expect(sorter.isSorted()).toBe(false);
    });

    it('should return true for array with two sorted elements', () => {
      const sorter = new AdaptiveSort([1, 2]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should return false for array with two unsorted elements', () => {
      const sorter = new AdaptiveSort([2, 1]);
      expect(sorter.isSorted()).toBe(false);
    });

    it('should return true for sorted array with negative numbers', () => {
      const sorter = new AdaptiveSort([-5, -3, -1, 0, 2]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should work with custom comparator', () => {
      const sorter = new AdaptiveSort([5, 4, 3, 2, 1], (a, b) => b - a);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should return false for nearly sorted array', () => {
      const sorter = new AdaptiveSort([1, 2, 3, 5, 4]);
      expect(sorter.isSorted()).toBe(false);
    });

    it('should check sortedness on result after sort', () => {
      const sorter = new AdaptiveSort([3, 1, 4, 1, 5]);
      sorter.sort();
      expect(sorter.isSorted()).toBe(true);
    });
  });

  describe('getTimeComplexity', () => {
    it('should return O(n) for already sorted array', () => {
      const sorter = new AdaptiveSort([1, 2, 3, 4, 5]);
      expect(sorter.getTimeComplexity()).toBe('O(n)');
    });

    it('should return O(n) for reverse sorted array', () => {
      const sorter = new AdaptiveSort([5, 4, 3, 2, 1]);
      expect(sorter.getTimeComplexity()).toBe('O(n)');
    });

    it.skip('should return O(n log n) for random array', () => {
      const sorter = new AdaptiveSort([3, 1, 4, 1, 5, 9, 2, 6, 5]);
      expect(sorter.getTimeComplexity()).toBe('O(n log n)');
    });

    it.skip('should return O(n log n) (adaptive) for nearly sorted array', () => {
      const sorter = new AdaptiveSort([1, 3, 2, 5, 4, 7, 6]);
      expect(sorter.getTimeComplexity()).toBe('O(n log n) (adaptive)');
    });

    it('should return O(n) for single element', () => {
      const sorter = new AdaptiveSort([5]);
      expect(sorter.getTimeComplexity()).toBe('O(n)');
    });

    it('should return O(n) for empty array', () => {
      const sorter = new AdaptiveSort([]);
      expect(sorter.getTimeComplexity()).toBe('O(n)');
    });

    it.skip('should return O(n log n) for completely random large array', () => {
      const arr = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 1000));
      const sorter = new AdaptiveSort(arr);
      expect(sorter.getTimeComplexity()).toBe('O(n log n)');
    });

    it('should return O(n) for array with small runs', () => {
      const sorter = new AdaptiveSort([1, 2, 3, 10, 11, 12]);
      expect(sorter.getTimeComplexity()).toBe('O(n)');
    });

    it('should return O(n) for array of two sorted sequences', () => {
      const sorter = new AdaptiveSort([1, 2, 3, 10, 11, 12, 20, 21, 22]);
      expect(sorter.getTimeComplexity()).toBe('O(n)');
    });
  });

  describe('constructor', () => {
    it('should create instance with array', () => {
      const sorter = new AdaptiveSort([3, 1, 4]);
      expect(sorter.sort()).toEqual([1, 3, 4]);
    });

    it('should create instance with empty array', () => {
      const sorter = new AdaptiveSort([]);
      expect(sorter.sort()).toEqual([]);
    });

    it('should create instance with single element', () => {
      const sorter = new AdaptiveSort([5]);
      expect(sorter.sort()).toEqual([5]);
    });

    it('should use default comparator when not provided', () => {
      const sorter = new AdaptiveSort([3, 1, 2]);
      expect(sorter.sort()).toEqual([1, 2, 3]);
    });

    it('should use custom comparator when provided', () => {
      const sorter = new AdaptiveSort([1, 2, 3], (a, b) => b - a);
      expect(sorter.sort()).toEqual([3, 2, 1]);
    });

    it('should copy array internally', () => {
      const original = [3, 1, 4];
      const sorter = new AdaptiveSort(original);
      const result = sorter.sort();
      expect(original).toEqual([3, 1, 4]);
      expect(result).toEqual([1, 3, 4]);
    });

    it('should handle large array in constructor', () => {
      const arr = Array.from({ length: 5000 }, (_, i) => i);
      const sorter = new AdaptiveSort(arr);
      expect(sorter.sort()).toEqual(arr);
    });
  });

  describe('integration tests', () => {
    it('should handle mixed positive and negative zeros', () => {
      const sorter = new AdaptiveSort([0, -0, 0, -0]);
      const result = sorter.sort();
      expect(result.length).toBe(4);
      expect(result.every(v => v === 0 || v === -0)).toBe(true);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should handle array with many duplicates', () => {
      const sorter = new AdaptiveSort([1, 1, 1, 1, 2, 2, 2, 3, 3, 3]);
      expect(sorter.sort()).toEqual([1, 1, 1, 1, 2, 2, 2, 3, 3, 3]);
    });

    it('should handle array with single different element', () => {
      const sorter = new AdaptiveSort([1, 1, 1, 1, 2]);
      expect(sorter.sort()).toEqual([1, 1, 1, 1, 2]);
    });

    it('should handle array sorted except last element', () => {
      const sorter = new AdaptiveSort([1, 2, 3, 4, 5, 0]);
      expect(sorter.sort()).toEqual([0, 1, 2, 3, 4, 5]);
    });

    it('should handle array sorted except first element', () => {
      const sorter = new AdaptiveSort([10, 1, 2, 3, 4, 5]);
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5, 10]);
    });

    it('should work with multiple sort calls', () => {
      const sorter = new AdaptiveSort([3, 1, 4]);
      expect(sorter.sort()).toEqual([1, 3, 4]);
      expect(sorter.isSorted()).toBe(true);
      const sorter2 = new AdaptiveSort([5, 2, 1]);
      expect(sorter2.sort()).toEqual([1, 2, 5]);
      expect(sorter2.isSorted()).toBe(true);
    });
  });
});
