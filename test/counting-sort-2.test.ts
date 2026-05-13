import { describe, it, expect } from 'vitest';
import { CountingSort } from '../src/core/counting-sort-2/index.js';

describe('CountingSort', () => {
  describe('constructor', () => {
    it('should accept empty array', () => {
      const sorter = new CountingSort([]);
      expect(sorter.toArray()).toEqual([]);
    });

    it('should accept single element array', () => {
      const sorter = new CountingSort([5]);
      expect(sorter.toArray()).toEqual([5]);
    });

    it('should accept multiple element array', () => {
      const sorter = new CountingSort([3, 1, 4, 1, 5]);
      expect(sorter.toArray()).toEqual([3, 1, 4, 1, 5]);
    });

    it('should accept array with negative numbers', () => {
      const sorter = new CountingSort([-3, 1, -4, 1, 5]);
      expect(sorter.toArray()).toEqual([-3, 1, -4, 1, 5]);
    });

    it('should accept maxValue parameter', () => {
      const sorter = new CountingSort([1, 2, 3], 10);
      expect(sorter.toArray()).toEqual([1, 2, 3]);
    });
  });

  describe('sort', () => {
    it('should sort empty array', () => {
      const sorter = new CountingSort([]);
      expect(sorter.sort()).toEqual([]);
    });

    it('should sort single element array', () => {
      const sorter = new CountingSort([5]);
      expect(sorter.sort()).toEqual([5]);
    });

    it('should sort already sorted array', () => {
      const sorter = new CountingSort([1, 2, 3, 4, 5]);
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort reverse sorted array', () => {
      const sorter = new CountingSort([5, 4, 3, 2, 1]);
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort random array', () => {
      const sorter = new CountingSort([3, 1, 4, 1, 5, 9, 2, 6, 5]);
      expect(sorter.sort()).toEqual([1, 1, 2, 3, 4, 5, 5, 6, 9]);
    });

    it('should sort array with duplicates', () => {
      const sorter = new CountingSort([3, 1, 4, 1, 5, 9, 2, 6, 5]);
      expect(sorter.sort()).toEqual([1, 1, 2, 3, 4, 5, 5, 6, 9]);
    });

    it('should sort array with negative numbers', () => {
      const sorter = new CountingSort([-3, 1, -4, 1, 5, -9, 2, 6, -5]);
      expect(sorter.sort()).toEqual([-9, -5, -4, -3, 1, 1, 2, 5, 6]);
    });

    it('should sort array with all same elements', () => {
      const sorter = new CountingSort([5, 5, 5, 5, 5]);
      expect(sorter.sort()).toEqual([5, 5, 5, 5, 5]);
    });

    it('should sort array with zeros', () => {
      const sorter = new CountingSort([0, 0, 1, 0, 2, 0]);
      expect(sorter.sort()).toEqual([0, 0, 0, 0, 1, 2]);
    });

    it('should sort large range array', () => {
      const sorter = new CountingSort([100, 200, 150, 50, 250]);
      expect(sorter.sort()).toEqual([50, 100, 150, 200, 250]);
    });

    it('should sort array with two elements', () => {
      const sorter = new CountingSort([2, 1]);
      expect(sorter.sort()).toEqual([1, 2]);
    });

    it('should sort array with three elements unsorted', () => {
      const sorter = new CountingSort([3, 1, 2]);
      expect(sorter.sort()).toEqual([1, 2, 3]);
    });

    it('should sort array with three elements sorted', () => {
      const sorter = new CountingSort([1, 2, 3]);
      expect(sorter.sort()).toEqual([1, 2, 3]);
    });

    it('should sort array with three elements reversed', () => {
      const sorter = new CountingSort([3, 2, 1]);
      expect(sorter.sort()).toEqual([1, 2, 3]);
    });

    it('should auto-detect max value', () => {
      const sorter = new CountingSort([5, 1, 3]);
      expect(sorter.sort()).toEqual([1, 3, 5]);
    });

    it('should use provided maxValue parameter', () => {
      const sorter = new CountingSort([1, 2, 3], 10);
      expect(sorter.sort()).toEqual([1, 2, 3]);
    });

    it('should sort array with large negative numbers', () => {
      const sorter = new CountingSort([-1000, -500, -100, -50, -10]);
      expect(sorter.sort()).toEqual([-1000, -500, -100, -50, -10]);
    });

    it('should sort array with mix of positive and negative', () => {
      const sorter = new CountingSort([-5, 3, -2, 7, -1]);
      expect(sorter.sort()).toEqual([-5, -2, -1, 3, 7]);
    });

    it('should sort array with one duplicate only', () => {
      const sorter = new CountingSort([1, 2, 3, 2, 4]);
      expect(sorter.sort()).toEqual([1, 2, 2, 3, 4]);
    });

    it('should sort array where min is at end', () => {
      const sorter = new CountingSort([5, 4, 3, 2, 1]);
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort array where max is at start', () => {
      const sorter = new CountingSort([10, 1, 2, 3, 4]);
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 10]);
    });

    it('should not mutate original array', () => {
      const sorter = new CountingSort([3, 1, 4, 1, 5]);
      const original = [3, 1, 4, 1, 5];
      sorter.sort();
      expect(sorter.toArray()).toEqual(original);
    });

    it('should handle array with single negative number', () => {
      const sorter = new CountingSort([-5]);
      expect(sorter.sort()).toEqual([-5]);
    });

    it('should handle array with two negative numbers', () => {
      const sorter = new CountingSort([-5, -3]);
      expect(sorter.sort()).toEqual([-5, -3]);
    });

    it('should handle array with single positive number', () => {
      const sorter = new CountingSort([5]);
      expect(sorter.sort()).toEqual([5]);
    });

    it('should handle array with two positive numbers', () => {
      const sorter = new CountingSort([3, 5]);
      expect(sorter.sort()).toEqual([3, 5]);
    });
  });

  describe('isSorted', () => {
    it('should return true for empty array', () => {
      const sorter = new CountingSort([]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should return true for single element array', () => {
      const sorter = new CountingSort([5]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should return true for sorted array', () => {
      const sorter = new CountingSort([1, 2, 3, 4, 5]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should return false for unsorted array', () => {
      const sorter = new CountingSort([3, 1, 4, 1, 5]);
      expect(sorter.isSorted()).toBe(false);
    });

    it('should return true for array with duplicates', () => {
      const sorter = new CountingSort([1, 1, 2, 3, 3, 4]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should return true for array with all same elements', () => {
      const sorter = new CountingSort([5, 5, 5, 5, 5]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should return true for sorted array with negative numbers', () => {
      const sorter = new CountingSort([-5, -3, -1, 0, 2]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should return false when adjacent elements out of order', () => {
      const sorter = new CountingSort([1, 2, 4, 3, 5]);
      expect(sorter.isSorted()).toBe(false);
    });

    it('should return true for array with two sorted elements', () => {
      const sorter = new CountingSort([1, 2]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should return false for array with two unsorted elements', () => {
      const sorter = new CountingSort([2, 1]);
      expect(sorter.isSorted()).toBe(false);
    });

    it('should check original array, not sorted result', () => {
      const sorter = new CountingSort([3, 1, 2]);
      expect(sorter.isSorted()).toBe(false);
    });
  });

  describe('getCounts', () => {
    it('should return empty map for empty array', () => {
      const sorter = new CountingSort([]);
      expect(sorter.getCounts().size).toBe(0);
    });

    it('should return counts for single element', () => {
      const sorter = new CountingSort([5]);
      const counts = sorter.getCounts();
      expect(counts.get(5)).toBe(1);
    });

    it('should return counts for multiple elements', () => {
      const sorter = new CountingSort([3, 1, 4, 1, 5]);
      const counts = sorter.getCounts();
      expect(counts.get(1)).toBe(2);
      expect(counts.get(3)).toBe(1);
      expect(counts.get(4)).toBe(1);
      expect(counts.get(5)).toBe(1);
    });

    it('should return counts for negative numbers', () => {
      const sorter = new CountingSort([-3, 1, -4, 1, 5]);
      const counts = sorter.getCounts();
      expect(counts.get(-4)).toBe(1);
      expect(counts.get(-3)).toBe(1);
      expect(counts.get(1)).toBe(2);
      expect(counts.get(5)).toBe(1);
    });

    it('should return copy of counts', () => {
      const sorter = new CountingSort([1, 2, 3]);
      const counts1 = sorter.getCounts();
      const counts2 = sorter.getCounts();
      expect(counts1).not.toBe(counts2);
      expect(counts1.get(1)).toBe(counts2.get(1));
    });
  });

  describe('getMin', () => {
    it('should return undefined for empty array', () => {
      const sorter = new CountingSort([]);
      expect(sorter.getMin()).toBeUndefined();
    });

    it('should return min for single element', () => {
      const sorter = new CountingSort([5]);
      expect(sorter.getMin()).toBe(5);
    });

    it('should return min for multiple elements', () => {
      const sorter = new CountingSort([3, 1, 4, 1, 5]);
      expect(sorter.getMin()).toBe(1);
    });

    it('should return min for negative numbers', () => {
      const sorter = new CountingSort([-3, 1, -4, 1, 5, -9]);
      expect(sorter.getMin()).toBe(-9);
    });

    it('should return min for all same elements', () => {
      const sorter = new CountingSort([5, 5, 5, 5]);
      expect(sorter.getMin()).toBe(5);
    });

    it('should return min for array with zeros', () => {
      const sorter = new CountingSort([0, 1, 2, 0]);
      expect(sorter.getMin()).toBe(0);
    });
  });

  describe('getMax', () => {
    it('should return undefined for empty array', () => {
      const sorter = new CountingSort([]);
      expect(sorter.getMax()).toBeUndefined();
    });

    it('should return max for single element', () => {
      const sorter = new CountingSort([5]);
      expect(sorter.getMax()).toBe(5);
    });

    it('should return max for multiple elements', () => {
      const sorter = new CountingSort([3, 1, 4, 1, 5]);
      expect(sorter.getMax()).toBe(5);
    });

    it('should return max for negative numbers', () => {
      const sorter = new CountingSort([-3, 1, -4, 1, 5]);
      expect(sorter.getMax()).toBe(5);
    });

    it('should return max for all same elements', () => {
      const sorter = new CountingSort([5, 5, 5, 5]);
      expect(sorter.getMax()).toBe(5);
    });

    it('should return max for array with negative numbers', () => {
      const sorter = new CountingSort([-9, -5, -4, -3]);
      expect(sorter.getMax()).toBe(-3);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty input', () => {
      const sorter = new CountingSort([]);
      expect(sorter.toArray()).toEqual([]);
    });

    it('should return copy for single element', () => {
      const sorter = new CountingSort([5]);
      const result = sorter.toArray();
      expect(result).toEqual([5]);
      expect(result).not.toBe(sorter.toArray());
    });

    it('should return copy for multiple elements', () => {
      const sorter = new CountingSort([3, 1, 4, 1, 5]);
      const result = sorter.toArray();
      expect(result).toEqual([3, 1, 4, 1, 5]);
      expect(result).not.toBe(sorter.toArray());
    });

    it('should not affect original when modifying returned array', () => {
      const sorter = new CountingSort([3, 1, 4, 1, 5]);
      const arr1 = sorter.toArray();
      arr1[0] = 999;
      const arr2 = sorter.toArray();
      expect(arr2[0]).toBe(3);
    });
  });

  describe('getTimeComplexity', () => {
    it('should return complexity for empty array', () => {
      const sorter = new CountingSort([]);
      const complexity = sorter.getTimeComplexity();
      expect(complexity).toContain('O(n + k)');
    });

    it('should return complexity for single element', () => {
      const sorter = new CountingSort([5]);
      const complexity = sorter.getTimeComplexity();
      expect(complexity).toContain('O(n + k)');
      expect(complexity).toContain('n=1');
    });

    it('should return complexity for multiple elements', () => {
      const sorter = new CountingSort([1, 2, 3, 4, 5]);
      const complexity = sorter.getTimeComplexity();
      expect(complexity).toContain('O(n + k)');
      expect(complexity).toContain('n=5');
      expect(complexity).toContain('k=');
    });

    it('should use provided maxValue in complexity', () => {
      const sorter = new CountingSort([1, 2, 3], 10);
      const complexity = sorter.getTimeComplexity();
      expect(complexity).toContain('O(n + k)');
      expect(complexity).toContain('k=10');
    });

    it('should auto-detect k when maxValue not provided', () => {
      const sorter = new CountingSort([1, 2, 3]);
      const complexity = sorter.getTimeComplexity();
      expect(complexity).toContain('O(n + k)');
      expect(complexity).toContain('k=');
    });
  });

  describe('integration tests', () => {
    it('should sort large random array', () => {
      const arr = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 1000));
      const sorter = new CountingSort(arr);
      const result = sorter.sort();
      expect(result).toHaveLength(1000);
      expect(result[0]).toBe(Math.min(...arr));
      expect(result[result.length - 1]).toBe(Math.max(...arr));
    });

    it('should handle array with wide range of values', () => {
      const arr = [0, 100, 200, 300, 400, 500];
      const sorter = new CountingSort(arr);
      const result = sorter.sort();
      expect(result).toEqual([0, 100, 200, 300, 400, 500]);
    });

    it('should work correctly with provided maxValue', () => {
      const arr = [5, 2, 8, 1, 9];
      const sorter = new CountingSort(arr, 10);
      const result = sorter.sort();
      expect(result).toEqual([1, 2, 5, 8, 9]);
    });

    it('should maintain count accuracy after sort', () => {
      const sorter = new CountingSort([3, 1, 4, 1, 5]);
      const originalCounts = sorter.getCounts();
      sorter.sort();
      const newCounts = sorter.getCounts();
      expect(originalCounts.get(1)).toBe(newCounts.get(1));
      expect(originalCounts.get(3)).toBe(newCounts.get(3));
      expect(originalCounts.get(4)).toBe(newCounts.get(4));
      expect(originalCounts.get(5)).toBe(newCounts.get(5));
    });

    it('should preserve min and max after sort', () => {
      const sorter = new CountingSort([3, 1, 4, 1, 5]);
      const originalMin = sorter.getMin();
      const originalMax = sorter.getMax();
      sorter.sort();
      expect(sorter.getMin()).toBe(originalMin);
      expect(sorter.getMax()).toBe(originalMax);
    });

    it('should sort array with negative and positive numbers correctly', () => {
      const arr = [-5, 3, -2, 7, -1, 0, 4];
      const sorter = new CountingSort(arr);
      const result = sorter.sort();
      expect(result).toEqual([-5, -2, -1, 0, 3, 4, 7]);
    });

    it('should handle repeated calls to sort', () => {
      const arr = [3, 1, 4, 1, 5];
      const sorter = new CountingSort(arr);
      const result1 = sorter.sort();
      const result2 = sorter.sort();
      expect(result1).toEqual(result2);
    });
  });
});
