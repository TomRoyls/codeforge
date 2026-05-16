import { describe, it, expect } from 'vitest';
import { SpaghettiSort2 } from '../src/core/spaghetti-sort-2/index';

describe('SpaghettiSort2', () => {
  describe('sort()', () => {
    it('should handle empty array', () => {
      const sorter = new SpaghettiSort2([]);
      expect(sorter.sort([])).toEqual([]);
    });

    it('should handle single element', () => {
      const sorter = new SpaghettiSort2([]);
      expect(sorter.sort([42])).toEqual([42]);
    });

    it('should handle already sorted array', () => {
      const sorter = new SpaghettiSort2([]);
      expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle reverse sorted array', () => {
      const sorter = new SpaghettiSort2([]);
      expect(sorter.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle random array', () => {
      const sorter = new SpaghettiSort2([]);
      expect(sorter.sort([3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5])).toEqual([1, 1, 2, 3, 3, 4, 5, 5, 5, 6, 9]);
    });

    it('should handle duplicates', () => {
      const sorter = new SpaghettiSort2([]);
      expect(sorter.sort([2, 2, 2, 1, 1, 3, 3])).toEqual([1, 1, 2, 2, 2, 3, 3]);
    });

    it('should handle negative numbers', () => {
      const sorter = new SpaghettiSort2([]);
      expect(sorter.sort([-1, -3, 2, 0, -2, 1])).toEqual([-3, -2, -1, 0, 1, 2]);
    });

    it('should handle all identical elements', () => {
      const sorter = new SpaghettiSort2([]);
      expect(sorter.sort([5, 5, 5, 5, 5])).toEqual([5, 5, 5, 5, 5]);
    });

    it('should handle two elements', () => {
      const sorter = new SpaghettiSort2([]);
      expect(sorter.sort([2, 1])).toEqual([1, 2]);
    });

    it('should handle large array', () => {
      const sorter = new SpaghettiSort2([]);
      const input = Array.from({ length: 100 }, () => Math.floor(Math.random() * 1000));
      const result = sorter.sort(input);
      expect(result.length).toBe(100);
      expect(sorter.isSorted(result)).toBe(true);
    });
  });

  describe('sortDescending()', () => {
    it('should handle empty array', () => {
      const sorter = new SpaghettiSort2([]);
      expect(sorter.sortDescending([])).toEqual([]);
    });

    it('should handle single element', () => {
      const sorter = new SpaghettiSort2([]);
      expect(sorter.sortDescending([42])).toEqual([42]);
    });

    it('should sort in descending order', () => {
      const sorter = new SpaghettiSort2([]);
      expect(sorter.sortDescending([1, 2, 3, 4, 5])).toEqual([5, 4, 3, 2, 1]);
    });

    it('should handle duplicates in descending order', () => {
      const sorter = new SpaghettiSort2([]);
      expect(sorter.sortDescending([2, 2, 2, 1, 1, 3, 3])).toEqual([3, 3, 2, 2, 2, 1, 1]);
    });

    it('should handle negative numbers in descending order', () => {
      const sorter = new SpaghettiSort2([]);
      expect(sorter.sortDescending([-1, -3, 2, 0, -2, 1])).toEqual([2, 1, 0, -1, -2, -3]);
    });

    it('should handle random array in descending order', () => {
      const sorter = new SpaghettiSort2([]);
      expect(sorter.sortDescending([3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5])).toEqual([9, 6, 5, 5, 5, 4, 3, 3, 2, 1, 1]);
    });
  });

  describe('isSorted()', () => {
    it('should return true for empty array', () => {
      const sorter = new SpaghettiSort2([]);
      expect(sorter.isSorted([])).toBe(true);
    });

    it('should return true for single element', () => {
      const sorter = new SpaghettiSort2([]);
      expect(sorter.isSorted([42])).toBe(true);
    });

    it('should return true for sorted array', () => {
      const sorter = new SpaghettiSort2([]);
      expect(sorter.isSorted([1, 2, 3, 4, 5])).toBe(true);
    });

    it('should return false for unsorted array', () => {
      const sorter = new SpaghettiSort2([]);
      expect(sorter.isSorted([5, 4, 3, 2, 1])).toBe(false);
    });

    it('should return true for array with duplicates', () => {
      const sorter = new SpaghettiSort2([]);
      expect(sorter.isSorted([1, 1, 2, 2, 3])).toBe(true);
    });

    it('should return false for partially sorted array', () => {
      const sorter = new SpaghettiSort2([]);
      expect(sorter.isSorted([1, 2, 5, 3, 4])).toBe(false);
    });
  });

  describe('findMax() - static', () => {
    it('should return undefined for empty array', () => {
      expect(SpaghettiSort2.findMax([])).toBeUndefined();
    });

    it('should return correct maximum', () => {
      expect(SpaghettiSort2.findMax([5, 1, 3, 2, 4])).toBe(5);
    });

    it('should return negative maximum', () => {
      expect(SpaghettiSort2.findMax([-5, -1, -3])).toBe(-1);
    });

    it('should return single element', () => {
      expect(SpaghettiSort2.findMax([42])).toBe(42);
    });

    it('should handle array with all negative numbers', () => {
      expect(SpaghettiSort2.findMax([-10, -20, -5, -15])).toBe(-5);
    });
  });

  describe('findMin() - static', () => {
    it('should return undefined for empty array', () => {
      expect(SpaghettiSort2.findMin([])).toBeUndefined();
    });

    it('should return correct minimum', () => {
      expect(SpaghettiSort2.findMin([5, 1, 3, 2, 4])).toBe(1);
    });

    it('should return negative minimum', () => {
      expect(SpaghettiSort2.findMin([-3, -1, -2])).toBe(-3);
    });

    it('should return single element', () => {
      expect(SpaghettiSort2.findMin([42])).toBe(42);
    });

    it('should handle array with all negative numbers', () => {
      expect(SpaghettiSort2.findMin([-10, -20, -5, -15])).toBe(-20);
    });
  });

  describe('toArray()', () => {
    it('should return copy of original array', () => {
      const original = [3, 1, 2];
      const sorter = new SpaghettiSort2(original);
      const result = sorter.toArray();

      expect(result).toEqual(original);
      expect(result).not.toBe(original);
    });

    it('should return empty array for empty input', () => {
      const sorter = new SpaghettiSort2([]);
      expect(sorter.toArray()).toEqual([]);
    });
  });

  describe('getTimeComplexity()', () => {
    it('should return correct complexity string for small array', () => {
      const sorter = new SpaghettiSort2([1, 2, 3]);
      expect(sorter.getTimeComplexity()).toBe('O(n²) = O(3²)');
    });

    it('should return correct complexity string for empty array', () => {
      const sorter = new SpaghettiSort2([]);
      expect(sorter.getTimeComplexity()).toBe('O(n²) = O(0²)');
    });

    it('should return correct complexity string for large array', () => {
      const array = Array.from({ length: 10 }, (_, i) => i);
      const sorter = new SpaghettiSort2(array);
      expect(sorter.getTimeComplexity()).toBe('O(n²) = O(10²)');
    });
  });

  describe('getSpaceComplexity()', () => {
    it('should return correct complexity string for small array', () => {
      const sorter = new SpaghettiSort2([1, 2, 3]);
      expect(sorter.getSpaceComplexity()).toBe('O(n) = O(3)');
    });

    it('should return correct complexity string for empty array', () => {
      const sorter = new SpaghettiSort2([]);
      expect(sorter.getSpaceComplexity()).toBe('O(n) = O(0)');
    });

    it('should return correct complexity string for large array', () => {
      const array = Array.from({ length: 50 }, (_, i) => i);
      const sorter = new SpaghettiSort2(array);
      expect(sorter.getSpaceComplexity()).toBe('O(n) = O(50)');
    });
  });

  describe('integration tests', () => {
    it('should sort and verify result is sorted', () => {
      const sorter = new SpaghettiSort2([5, 3, 1, 4, 2]);
      const result = sorter.sort([5, 3, 1, 4, 2]);
      expect(result).toEqual([1, 2, 3, 4, 5]);
      expect(sorter.isSorted(result)).toBe(true);
    });

    it('should sort descending and verify result is sorted', () => {
      const sorter = new SpaghettiSort2([1, 2, 3, 4, 5]);
      const result = sorter.sortDescending([1, 2, 3, 4, 5]);
      expect(result).toEqual([5, 4, 3, 2, 1]);
      const ascending = sorter.sort(result);
      expect(ascending).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle mixed positive and negative numbers', () => {
      const sorter = new SpaghettiSort2([-5, 3, -1, 4, 0, -2]);
      const result = sorter.sort([-5, 3, -1, 4, 0, -2]);
      expect(result).toEqual([-5, -2, -1, 0, 3, 4]);
    });

    it('should handle zero in array', () => {
      const sorter = new SpaghettiSort2([0, 5, -1, 3]);
      const result = sorter.sort([0, 5, -1, 3]);
      expect(result).toEqual([-1, 0, 3, 5]);
    });

    it('should preserve array after sorting', () => {
      const input = [3, 1, 4, 1, 5];
      const sorter = new SpaghettiSort2(input);
      sorter.sort(input);
      expect(sorter.toArray()).toEqual([3, 1, 4, 1, 5]);
    });
    it('should handle single element', () => {
      const sorter = new SpaghettiSort2([42]);
      sorter.sort([42]);
      expect(sorter.toArray()).toEqual([42]);
    });
  });
});
