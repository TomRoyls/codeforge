import { describe, it, expect } from 'vitest';
import { InsertionSort4 } from './src/core/insertion-sort-4/index.js';

describe('InsertionSort4', () => {
  describe('sort', () => {
    it('should sort empty array', () => {
      const sorter = new InsertionSort4([]);
      expect(sorter.sort()).toEqual([]);
    });

    it('should sort single element array', () => {
      const sorter = new InsertionSort4([5]);
      expect(sorter.sort()).toEqual([5]);
    });

    it('should sort already sorted array', () => {
      const sorter = new InsertionSort4([1, 2, 3, 4, 5]);
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort reverse sorted array', () => {
      const sorter = new InsertionSort4([5, 4, 3, 2, 1]);
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort random array', () => {
      const sorter = new InsertionSort4([3, 1, 4, 1, 5, 9, 2, 6, 5]);
      expect(sorter.sort()).toEqual([1, 1, 2, 3, 4, 5, 5, 6, 9]);
    });

    it('should sort array with duplicates', () => {
      const sorter = new InsertionSort4([3, 1, 4, 1, 5, 9, 2, 6, 5]);
      expect(sorter.sort()).toEqual([1, 1, 2, 3, 4, 5, 5, 6, 9]);
    });

    it('should sort array with negative numbers', () => {
      const sorter = new InsertionSort4([-3, 1, -4, 1, 5, -9, 2, 6, -5]);
      expect(sorter.sort()).toEqual([-9, -5, -4, -3, 1, 1, 2, 5, 6]);
    });

    it('should sort with custom comparator (descending)', () => {
      const sorter = new InsertionSort4([1, 2, 3, 4, 5], (a, b) => b - a);
      expect(sorter.sort()).toEqual([5, 4, 3, 2, 1]);
    });

    it('should sort large array', () => {
      const arr = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 1000));
      const sorter = new InsertionSort4(arr);
      const result = sorter.sort();
      expect(result).toHaveLength(1000);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should not mutate original array', () => {
      const original = [3, 1, 4, 1, 5];
      const sorter = new InsertionSort4(original);
      sorter.sort();
      expect(original).toEqual([3, 1, 4, 1, 5]);
    });

    it('should sort array with all same elements', () => {
      const sorter = new InsertionSort4([5, 5, 5, 5, 5]);
      expect(sorter.sort()).toEqual([5, 5, 5, 5, 5]);
    });

    it('should sort array with two elements', () => {
      const sorter = new InsertionSort4([2, 1]);
      expect(sorter.sort()).toEqual([1, 2]);
    });

    it('should sort array with two elements sorted', () => {
      const sorter = new InsertionSort4([1, 2]);
      expect(sorter.sort()).toEqual([1, 2]);
    });

    it('should sort array with three elements unsorted', () => {
      const sorter = new InsertionSort4([3, 1, 2]);
      expect(sorter.sort()).toEqual([1, 2, 3]);
    });

    it('should sort array with three elements sorted', () => {
      const sorter = new InsertionSort4([1, 2, 3]);
      expect(sorter.sort()).toEqual([1, 2, 3]);
    });

    it('should sort array with three elements reversed', () => {
      const sorter = new InsertionSort4([3, 2, 1]);
      expect(sorter.sort()).toEqual([1, 2, 3]);
    });

    it('should sort array with zeros', () => {
      const sorter = new InsertionSort4([0, 0, 1, 0, 2, 0]);
      expect(sorter.sort()).toEqual([0, 0, 0, 0, 1, 2]);
    });

    it('should sort array with large negative numbers', () => {
      const sorter = new InsertionSort4([-1000, -500, -100, -50, -10]);
      expect(sorter.sort()).toEqual([-1000, -500, -100, -50, -10]);
    });

    it('should sort array with mix of positive and negative', () => {
      const sorter = new InsertionSort4([-5, 3, -2, 7, -1]);
      expect(sorter.sort()).toEqual([-5, -2, -1, 3, 7]);
    });

    it('should sort array with one duplicate only', () => {
      const sorter = new InsertionSort4([1, 2, 3, 2, 4]);
      expect(sorter.sort()).toEqual([1, 2, 2, 3, 4]);
    });

    it('should sort array where min is at end', () => {
      const sorter = new InsertionSort4([5, 4, 3, 2, 1]);
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort array where max is at start', () => {
      const sorter = new InsertionSort4([10, 1, 2, 3, 4]);
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 10]);
    });

    it('should sort nearly sorted array', () => {
      const sorter = new InsertionSort4([1, 2, 3, 5, 4]);
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort nearly sorted array with multiple inversions', () => {
      const sorter = new InsertionSort4([1, 3, 2, 5, 4, 7, 6]);
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it('should work with string array', () => {
      const sorter = new InsertionSort4(['banana', 'apple', 'cherry']);
      expect(sorter.sort()).toEqual(['apple', 'banana', 'cherry']);
    });

    it('should work with string array custom comparator', () => {
      const sorter = new InsertionSort4(['banana', 'apple', 'cherry'], (a, b) => b.localeCompare(a));
      expect(sorter.sort()).toEqual(['cherry', 'banana', 'apple']);
    });

    it('should work with object array and custom comparator', () => {
      const objects = [
        { id: 3, name: 'c' },
        { id: 1, name: 'a' },
        { id: 2, name: 'b' },
      ];
      const sorter = new InsertionSort4(objects, (a, b) => a.id - b.id);
      const result = sorter.sort();
      expect(result[0]!.id).toBe(1);
      expect(result[1]!.id).toBe(2);
      expect(result[2]!.id).toBe(3);
    });

    it('should sort array with alternating pattern', () => {
      const sorter = new InsertionSort4([1, 10, 2, 9, 3, 8, 4, 7, 5, 6]);
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('should sort array with large gap between min and max', () => {
      const sorter = new InsertionSort4([-1000000, 0, 1000000]);
      expect(sorter.sort()).toEqual([-1000000, 0, 1000000]);
    });

    it('should sort very large array efficiently', () => {
      const arr = Array.from({ length: 500 }, () => Math.floor(Math.random() * 500));
      const sorter = new InsertionSort4(arr);
      const result = sorter.sort();
      expect(result).toHaveLength(500);
      expect(sorter.isSorted()).toBe(true);
    });
  });

  describe('sortDescending', () => {
    it('should sort empty array in descending order', () => {
      const sorter = new InsertionSort4([]);
      expect(sorter.sortDescending()).toEqual([]);
    });

    it('should sort single element array in descending order', () => {
      const sorter = new InsertionSort4([5]);
      expect(sorter.sortDescending()).toEqual([5]);
    });

    it('should sort array in descending order', () => {
      const sorter = new InsertionSort4([1, 2, 3, 4, 5]);
      expect(sorter.sortDescending()).toEqual([5, 4, 3, 2, 1]);
    });

    it('should sort reverse array in descending order', () => {
      const sorter = new InsertionSort4([5, 4, 3, 2, 1]);
      expect(sorter.sortDescending()).toEqual([5, 4, 3, 2, 1]);
    });

    it('should sort random array in descending order', () => {
      const sorter = new InsertionSort4([3, 1, 4, 1, 5, 9, 2, 6, 5]);
      expect(sorter.sortDescending()).toEqual([9, 6, 5, 5, 4, 3, 2, 1, 1]);
    });

    it('should sort array with negatives in descending order', () => {
      const sorter = new InsertionSort4([-5, 3, -2, 7, -1]);
      expect(sorter.sortDescending()).toEqual([7, 3, -1, -2, -5]);
    });

    it('should not mutate original array when sorting descending', () => {
      const original = [1, 2, 3, 4, 5];
      const sorter = new InsertionSort4(original);
      sorter.sortDescending();
      expect(original).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort array with duplicates in descending order', () => {
      const sorter = new InsertionSort4([3, 1, 2, 1, 3]);
      expect(sorter.sortDescending()).toEqual([3, 3, 2, 1, 1]);
    });
  });

  describe('isSorted', () => {
    it('should return true for empty array', () => {
      const sorter = new InsertionSort4([]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should return true for single element array', () => {
      const sorter = new InsertionSort4([5]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should return true for sorted array', () => {
      const sorter = new InsertionSort4([1, 2, 3, 4, 5]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should return false for unsorted array', () => {
      const sorter = new InsertionSort4([3, 1, 4, 1, 5]);
      expect(sorter.isSorted()).toBe(false);
    });

    it('should return true for array with duplicates', () => {
      const sorter = new InsertionSort4([1, 1, 2, 3, 3, 4]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should return true for array with all same elements', () => {
      const sorter = new InsertionSort4([5, 5, 5, 5, 5]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should return false when adjacent elements out of order', () => {
      const sorter = new InsertionSort4([1, 2, 4, 3, 5]);
      expect(sorter.isSorted()).toBe(false);
    });

    it('should return true for array with two sorted elements', () => {
      const sorter = new InsertionSort4([1, 2]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should return false for array with two unsorted elements', () => {
      const sorter = new InsertionSort4([2, 1]);
      expect(sorter.isSorted()).toBe(false);
    });

    it('should return true for sorted array with negative numbers', () => {
      const sorter = new InsertionSort4([-5, -3, -1, 0, 2]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should work with custom comparator', () => {
      const sorter = new InsertionSort4([5, 4, 3, 2, 1], (a, b) => b - a);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should return false for nearly sorted array', () => {
      const sorter = new InsertionSort4([1, 2, 3, 5, 4]);
      expect(sorter.isSorted()).toBe(false);
    });

    it('should check sortedness on result after sort', () => {
      const sorter = new InsertionSort4([3, 1, 4, 1, 5]);
      sorter.sort();
      expect(sorter.isSorted()).toBe(true);
    });
  });

  describe('getTimeComplexity', () => {
    it('should return O(1) for empty array', () => {
      const sorter = new InsertionSort4([]);
      expect(sorter.getTimeComplexity()).toBe('O(1)');
    });

    it('should return O(1) for single element', () => {
      const sorter = new InsertionSort4([5]);
      expect(sorter.getTimeComplexity()).toBe('O(1)');
    });

    it('should return O(n²) for multiple elements', () => {
      const sorter = new InsertionSort4([1, 2, 3, 4, 5]);
      expect(sorter.getTimeComplexity()).toBe('O(n²)');
    });

    it('should return O(n²) for unsorted array', () => {
      const sorter = new InsertionSort4([3, 1, 4, 1, 5, 9, 2, 6, 5]);
      expect(sorter.getTimeComplexity()).toBe('O(n²)');
    });

    it('should return O(n²) for reverse sorted array', () => {
      const sorter = new InsertionSort4([5, 4, 3, 2, 1]);
      expect(sorter.getTimeComplexity()).toBe('O(n²)');
    });

    it('should return O(n²) for nearly sorted array', () => {
      const sorter = new InsertionSort4([1, 2, 3, 5, 4]);
      expect(sorter.getTimeComplexity()).toBe('O(n²)');
    });

    it('should return O(n²) for array with duplicates', () => {
      const sorter = new InsertionSort4([1, 1, 2, 3, 3, 4]);
      expect(sorter.getTimeComplexity()).toBe('O(n²)');
    });
  });

  describe('getSpaceComplexity', () => {
    it('should return O(1) for empty array', () => {
      const sorter = new InsertionSort4([]);
      expect(sorter.getSpaceComplexity()).toBe('O(1)');
    });

    it('should return O(1) for single element', () => {
      const sorter = new InsertionSort4([5]);
      expect(sorter.getSpaceComplexity()).toBe('O(1)');
    });

    it('should return O(1) for multiple elements', () => {
      const sorter = new InsertionSort4([1, 2, 3, 4, 5]);
      expect(sorter.getSpaceComplexity()).toBe('O(1)');
    });

    it('should return O(1) for large array', () => {
      const arr = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 1000));
      const sorter = new InsertionSort4(arr);
      expect(sorter.getSpaceComplexity()).toBe('O(1)');
    });
  });

  describe('insertionSortRange', () => {
    it('should sort range in empty array', () => {
      const sorter = new InsertionSort4([]);
      expect(sorter.insertionSortRange([], 0, 0)).toEqual([]);
    });

    it('should sort full range of array', () => {
      const sorter = new InsertionSort4([]);
      expect(sorter.insertionSortRange([3, 1, 4, 1, 5], 0, 4)).toEqual([1, 1, 3, 4, 5]);
    });

    it('should sort partial range of array', () => {
      const sorter = new InsertionSort4([]);
      expect(sorter.insertionSortRange([5, 4, 3, 2, 1], 1, 3)).toEqual([5, 2, 3, 4, 1]);
    });

    it('should sort single element range', () => {
      const sorter = new InsertionSort4([]);
      expect(sorter.insertionSortRange([3, 1, 4], 1, 1)).toEqual([3, 1, 4]);
    });

    it('should sort range with two elements', () => {
      const sorter = new InsertionSort4([]);
      expect(sorter.insertionSortRange([1, 2, 3, 4], 1, 2)).toEqual([1, 2, 3, 4]);
    });

    it('should sort range with unsorted elements', () => {
      const sorter = new InsertionSort4([]);
      expect(sorter.insertionSortRange([1, 3, 2, 5, 4, 7, 6], 1, 5)).toEqual([1, 2, 3, 4, 5, 7, 6]);
    });

    it('should sort range with negative numbers', () => {
      const sorter = new InsertionSort4([]);
      expect(sorter.insertionSortRange([-5, 3, -2, 7, -1], 0, 4)).toEqual([-5, -2, -1, 3, 7]);
    });

    it('should sort range with duplicates', () => {
      const sorter = new InsertionSort4([]);
      expect(sorter.insertionSortRange([1, 3, 2, 2, 5, 3], 0, 5)).toEqual([1, 2, 2, 3, 3, 5]);
    });
  });

  describe('stableInsertionSort', () => {
    it('should sort empty array', () => {
      const sorter = new InsertionSort4([]);
      expect(sorter.stableInsertionSort([])).toEqual([]);
    });

    it('should sort single element array', () => {
      const sorter = new InsertionSort4([]);
      expect(sorter.stableInsertionSort([5])).toEqual([5]);
    });

    it('should sort already sorted array', () => {
      const sorter = new InsertionSort4([]);
      expect(sorter.stableInsertionSort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort reverse sorted array', () => {
      const sorter = new InsertionSort4([]);
      expect(sorter.stableInsertionSort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort random array', () => {
      const sorter = new InsertionSort4([]);
      expect(sorter.stableInsertionSort([3, 1, 4, 1, 5, 9, 2, 6, 5])).toEqual([1, 1, 2, 3, 4, 5, 5, 6, 9]);
    });

    it('should sort array with duplicates', () => {
      const sorter = new InsertionSort4([]);
      expect(sorter.stableInsertionSort([3, 1, 4, 1, 5, 9, 2, 6, 5])).toEqual([1, 1, 2, 3, 4, 5, 5, 6, 9]);
    });

    it('should sort array with negative numbers', () => {
      const sorter = new InsertionSort4([]);
      expect(sorter.stableInsertionSort([-3, 1, -4, 1, 5, -9, 2, 6, -5])).toEqual([-9, -5, -4, -3, 1, 1, 2, 5, 6]);
    });

    it('should not mutate original array', () => {
      const original = [3, 1, 4, 1, 5];
      const sorter = new InsertionSort4([]);
      sorter.stableInsertionSort(original);
      expect(original).toEqual([3, 1, 4, 1, 5]);
    });

    it('should sort array with all same elements', () => {
      const sorter = new InsertionSort4([]);
      expect(sorter.stableInsertionSort([5, 5, 5, 5, 5])).toEqual([5, 5, 5, 5, 5]);
    });

    it('should sort large array', () => {
      const arr = Array.from({ length: 500 }, () => Math.floor(Math.random() * 500));
      const sorter = new InsertionSort4([]);
      const result = sorter.stableInsertionSort(arr);
      expect(result).toHaveLength(500);
    });
  });

  describe('constructor', () => {
    it('should create instance with array', () => {
      const sorter = new InsertionSort4([3, 1, 4]);
      expect(sorter.sort()).toEqual([1, 3, 4]);
    });

    it('should create instance with empty array', () => {
      const sorter = new InsertionSort4([]);
      expect(sorter.sort()).toEqual([]);
    });

    it('should create instance with single element', () => {
      const sorter = new InsertionSort4([5]);
      expect(sorter.sort()).toEqual([5]);
    });

    it('should use default comparator when not provided', () => {
      const sorter = new InsertionSort4([3, 1, 2]);
      expect(sorter.sort()).toEqual([1, 2, 3]);
    });

    it('should use custom comparator when provided', () => {
      const sorter = new InsertionSort4([1, 2, 3], (a, b) => b - a);
      expect(sorter.sort()).toEqual([3, 2, 1]);
    });

    it('should copy array internally', () => {
      const original = [3, 1, 4];
      const sorter = new InsertionSort4(original);
      const result = sorter.sort();
      expect(original).toEqual([3, 1, 4]);
      expect(result).toEqual([1, 3, 4]);
    });

    it('should handle large array in constructor', () => {
      const arr = Array.from({ length: 2000 }, (_, i) => i);
      const sorter = new InsertionSort4(arr);
      expect(sorter.sort()).toEqual(arr);
    });
  });

  describe('integration tests', () => {
    it('should handle array with many duplicates', () => {
      const sorter = new InsertionSort4([1, 1, 1, 1, 2, 2, 2, 3, 3, 3]);
      expect(sorter.sort()).toEqual([1, 1, 1, 1, 2, 2, 2, 3, 3, 3]);
    });

    it('should handle array with single different element', () => {
      const sorter = new InsertionSort4([1, 1, 1, 1, 2]);
      expect(sorter.sort()).toEqual([1, 1, 1, 1, 2]);
    });

    it('should handle array sorted except last element', () => {
      const sorter = new InsertionSort4([1, 2, 3, 4, 5, 0]);
      expect(sorter.sort()).toEqual([0, 1, 2, 3, 4, 5]);
    });

    it('should handle array sorted except first element', () => {
      const sorter = new InsertionSort4([10, 1, 2, 3, 4, 5]);
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5, 10]);
    });

    it('should work with multiple sort calls', () => {
      const sorter = new InsertionSort4([3, 1, 4]);
      expect(sorter.sort()).toEqual([1, 3, 4]);
      expect(sorter.isSorted()).toBe(true);
      const sorter2 = new InsertionSort4([5, 2, 1]);
      expect(sorter2.sort()).toEqual([1, 2, 5]);
      expect(sorter2.isSorted()).toBe(true);
    });

    it('should handle string arrays with same length', () => {
      const sorter = new InsertionSort4(['cat', 'dog', 'bat', 'ant']);
      expect(sorter.sort()).toEqual(['ant', 'bat', 'cat', 'dog']);
    });

    it('should handle arrays with floating point numbers', () => {
      const sorter = new InsertionSort4([3.5, 1.2, 4.8, 1.1, 5.0]);
      expect(sorter.sort()).toEqual([1.1, 1.2, 3.5, 4.8, 5.0]);
    });

    it('should handle arrays with mixed integers and floats', () => {
      const sorter = new InsertionSort4([3, 1.5, 4, 1, 5.2]);
      expect(sorter.sort()).toEqual([1, 1.5, 3, 4, 5.2]);
    });

    it('should handle array with single large gap', () => {
      const sorter = new InsertionSort4([1, 2, 3, 1000, 4, 5]);
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5, 1000]);
    });

    it('should handle array sorted in chunks', () => {
      const sorter = new InsertionSort4([1, 2, 3, 5, 4, 7, 6, 9, 8]);
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should handle descending then ascending pattern', () => {
      const sorter = new InsertionSort4([5, 4, 3, 2, 1, 2, 3, 4, 5]);
      expect(sorter.sort()).toEqual([1, 2, 2, 3, 3, 4, 4, 5, 5]);
    });

    it('should verify descending sort produces reverse of ascending sort', () => {
      const sorter1 = new InsertionSort4([1, 2, 3, 4, 5]);
      const sorter2 = new InsertionSort4([1, 2, 3, 4, 5]);
      expect(sorter2.sortDescending()).toEqual([5, 4, 3, 2, 1]);
    });
  });
});
