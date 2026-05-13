import { describe, it, expect } from 'vitest';
import { BlockSort2 } from './src/core/block-sort-2/index.js';

describe('BlockSort2', () => {
  describe('sort', () => {
    it('should sort empty array', () => {
      const sorter = new BlockSort2();
      expect(sorter.sort([])).toEqual([]);
    });

    it('should sort single element array', () => {
      const sorter = new BlockSort2();
      expect(sorter.sort([5])).toEqual([5]);
    });

    it('should sort two element array', () => {
      const sorter = new BlockSort2();
      expect(sorter.sort([2, 1])).toEqual([1, 2]);
    });

    it('should sort already sorted array', () => {
      const sorter = new BlockSort2();
      expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort reverse sorted array', () => {
      const sorter = new BlockSort2();
      expect(sorter.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort array with duplicates', () => {
      const sorter = new BlockSort2();
      expect(sorter.sort([3, 1, 4, 1, 5, 9, 2, 6, 5])).toEqual([1, 1, 2, 3, 4, 5, 5, 6, 9]);
    });

    it('should sort array with negative numbers', () => {
      const sorter = new BlockSort2();
      expect(sorter.sort([-3, 1, -4, 1, 5, -9, 2, 6, -5])).toEqual([-9, -5, -4, -3, 1, 1, 2, 5, 6]);
    });

    it('should not mutate original array', () => {
      const sorter = new BlockSort2();
      const original = [3, 1, 4, 1, 5];
      sorter.sort(original);
      expect(original).toEqual([3, 1, 4, 1, 5]);
    });

    it('should sort large random array', () => {
      const sorter = new BlockSort2();
      const arr = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 1000));
      const result = sorter.sort(arr);
      expect(result).toHaveLength(1000);
      expect(sorter.isSorted(result)).toBe(true);
    });

    it('should sort with custom comparator (descending)', () => {
      const sorter = new BlockSort2((a, b) => b - a);
      expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([5, 4, 3, 2, 1]);
    });

    it('should sort array with all same elements', () => {
      const sorter = new BlockSort2();
      expect(sorter.sort([5, 5, 5, 5, 5])).toEqual([5, 5, 5, 5, 5]);
    });

    it('should sort array with two elements reversed', () => {
      const sorter = new BlockSort2();
      expect(sorter.sort([10, 1])).toEqual([1, 10]);
    });

    it('should sort array with three elements unsorted', () => {
      const sorter = new BlockSort2();
      expect(sorter.sort([3, 1, 2])).toEqual([1, 2, 3]);
    });

    it('should sort array with three elements sorted', () => {
      const sorter = new BlockSort2();
      expect(sorter.sort([1, 2, 3])).toEqual([1, 2, 3]);
    });

    it('should sort array with three elements reversed', () => {
      const sorter = new BlockSort2();
      expect(sorter.sort([3, 2, 1])).toEqual([1, 2, 3]);
    });

    it('should sort array with zeros', () => {
      const sorter = new BlockSort2();
      expect(sorter.sort([0, 0, 1, 0, 2, 0])).toEqual([0, 0, 0, 0, 1, 2]);
    });

    it('should sort array with large negative numbers', () => {
      const sorter = new BlockSort2();
      expect(sorter.sort([-1000, -500, -100, -50, -10])).toEqual([-1000, -500, -100, -50, -10]);
    });

    it('should sort array with mix of positive and negative', () => {
      const sorter = new BlockSort2();
      expect(sorter.sort([-5, 3, -2, 7, -1])).toEqual([-5, -2, -1, 3, 7]);
    });

    it('should sort array with one duplicate only', () => {
      const sorter = new BlockSort2();
      expect(sorter.sort([1, 2, 3, 2, 4])).toEqual([1, 2, 2, 3, 4]);
    });

    it('should sort array where min is at end', () => {
      const sorter = new BlockSort2();
      expect(sorter.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort array where max is at start', () => {
      const sorter = new BlockSort2();
      expect(sorter.sort([10, 1, 2, 3, 4])).toEqual([1, 2, 3, 4, 10]);
    });
  });

  describe('sortInPlace', () => {
    it('should sort empty array in place', () => {
      const sorter = new BlockSort2();
      const arr: number[] = [];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([]);
    });

    it('should sort single element array in place', () => {
      const sorter = new BlockSort2();
      const arr = [5];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([5]);
    });

    it('should sort array in place', () => {
      const sorter = new BlockSort2();
      const arr = [3, 1, 4, 1, 5];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([1, 1, 3, 4, 5]);
    });

    it('should mutate original array', () => {
      const sorter = new BlockSort2();
      const arr = [3, 1, 4, 1, 5];
      sorter.sortInPlace(arr);
      expect(arr).not.toEqual([3, 1, 4, 1, 5]);
    });

    it('should sort reverse sorted array in place', () => {
      const sorter = new BlockSort2();
      const arr = [5, 4, 3, 2, 1];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort array with duplicates in place', () => {
      const sorter = new BlockSort2();
      const arr = [3, 1, 4, 1, 5, 9, 2, 6, 5];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([1, 1, 2, 3, 4, 5, 5, 6, 9]);
    });

    it('should sort array with negative numbers in place', () => {
      const sorter = new BlockSort2();
      const arr = [-3, 1, -4, 1, 5, -9, 2, 6, -5];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([-9, -5, -4, -3, 1, 1, 2, 5, 6]);
    });

    it('should sort large array in place', () => {
      const sorter = new BlockSort2();
      const arr = Array.from({ length: 500 }, () => Math.floor(Math.random() * 500));
      sorter.sortInPlace(arr);
      expect(sorter.isSorted(arr)).toBe(true);
    });

    it('should work with custom comparator in place', () => {
      const sorter = new BlockSort2((a, b) => b - a);
      const arr = [1, 2, 3, 4, 5];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([5, 4, 3, 2, 1]);
    });

    it('should sort array with two elements in place', () => {
      const sorter = new BlockSort2();
      const arr = [2, 1];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([1, 2]);
    });

    it('should sort array with all same elements in place', () => {
      const sorter = new BlockSort2();
      const arr = [5, 5, 5, 5, 5];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([5, 5, 5, 5, 5]);
    });

    it('should sort array where first element is smallest in place', () => {
      const sorter = new BlockSort2();
      const arr = [1, 5, 4, 3, 2];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort array where last element is largest in place', () => {
      const sorter = new BlockSort2();
      const arr = [2, 1, 3, 4, 5];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('isSorted', () => {
    it('should return true for empty array', () => {
      const sorter = new BlockSort2();
      expect(sorter.isSorted([])).toBe(true);
    });

    it('should return true for single element array', () => {
      const sorter = new BlockSort2();
      expect(sorter.isSorted([5])).toBe(true);
    });

    it('should return true for sorted array', () => {
      const sorter = new BlockSort2();
      expect(sorter.isSorted([1, 2, 3, 4, 5])).toBe(true);
    });

    it('should return false for unsorted array', () => {
      const sorter = new BlockSort2();
      expect(sorter.isSorted([3, 1, 4, 1, 5])).toBe(false);
    });

    it('should return true for array with duplicates', () => {
      const sorter = new BlockSort2();
      expect(sorter.isSorted([1, 1, 2, 3, 3, 4])).toBe(true);
    });

    it('should return true for array with all same elements', () => {
      const sorter = new BlockSort2();
      expect(sorter.isSorted([5, 5, 5, 5, 5])).toBe(true);
    });

    it('should work with custom comparator', () => {
      const sorter = new BlockSort2((a, b) => b - a);
      expect(sorter.isSorted([5, 4, 3, 2, 1])).toBe(true);
    });

    it('should return false when adjacent elements out of order', () => {
      const sorter = new BlockSort2();
      expect(sorter.isSorted([1, 2, 4, 3, 5])).toBe(false);
    });

    it('should return true for array with two sorted elements', () => {
      const sorter = new BlockSort2();
      expect(sorter.isSorted([1, 2])).toBe(true);
    });

    it('should return false for array with two unsorted elements', () => {
      const sorter = new BlockSort2();
      expect(sorter.isSorted([2, 1])).toBe(false);
    });

    it('should return true for sorted array with negative numbers', () => {
      const sorter = new BlockSort2();
      expect(sorter.isSorted([-5, -3, -1, 0, 2])).toBe(true);
    });
  });

  describe('large arrays', () => {
    it('should sort array of 10000 elements', () => {
      const sorter = new BlockSort2();
      const arr = Array.from({ length: 10000 }, () => Math.floor(Math.random() * 10000));
      const result = sorter.sort(arr);
      expect(result).toHaveLength(10000);
      expect(sorter.isSorted(result)).toBe(true);
    });

    it('should sort array of 10000 elements in place', () => {
      const sorter = new BlockSort2();
      const arr = Array.from({ length: 10000 }, () => Math.floor(Math.random() * 10000));
      sorter.sortInPlace(arr);
      expect(arr).toHaveLength(10000);
      expect(sorter.isSorted(arr)).toBe(true);
    });
  });

  describe('floating point numbers', () => {
    it('should sort array with floating point numbers', () => {
      const sorter = new BlockSort2();
      expect(sorter.sort([3.5, 1.2, 4.8, 1.9, 5.1])).toEqual([1.2, 1.9, 3.5, 4.8, 5.1]);
    });

    it('should sort array with negative floating point numbers', () => {
      const sorter = new BlockSort2();
      expect(sorter.sort([-3.5, 1.2, -4.8, 1.9, -5.1])).toEqual([-5.1, -4.8, -3.5, 1.2, 1.9]);
    });

    it('should sort array with mixed floating point numbers', () => {
      const sorter = new BlockSort2();
      const arr = [3.14, -1.41, 2.72, 0.5, -2.5];
      const result = sorter.sort(arr);
      expect(result).toEqual([-2.5, -1.41, 0.5, 2.72, 3.14]);
    });
  });
});
