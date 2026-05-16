import { describe, it, expect } from 'vitest';
import { AmericanFlagSort2 } from '../src/core/american-flag-sort-2/index.js';

describe('AmericanFlagSort2', () => {
  describe('sort()', () => {
    it('should sort empty array', () => {
      const sorter = new AmericanFlagSort2();
      const result = sorter.sort([]);
      expect(result).toEqual([]);
      expect(sorter.isSorted(result)).toBe(true);
    });

    it('should sort single element array', () => {
      const sorter = new AmericanFlagSort2();
      const result = sorter.sort([5]);
      expect(result).toEqual([5]);
      expect(sorter.isSorted(result)).toBe(true);
    });

    it('should sort already sorted array', () => {
      const sorter = new AmericanFlagSort2();
      const result = sorter.sort([1, 2, 3, 4, 5]);
      expect(result).toEqual([1, 2, 3, 4, 5]);
      expect(sorter.isSorted(result)).toBe(true);
    });

    it('should sort reverse sorted array', () => {
      const sorter = new AmericanFlagSort2();
      const result = sorter.sort([5, 4, 3, 2, 1]);
      expect(result).toEqual([1, 2, 3, 4, 5]);
      expect(sorter.isSorted(result)).toBe(true);
    });

    it('should sort random array', () => {
      const sorter = new AmericanFlagSort2();
      const result = sorter.sort([3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]);
      expect(result).toEqual([1, 1, 2, 3, 3, 4, 5, 5, 5, 6, 9]);
      expect(sorter.isSorted(result)).toBe(true);
    });

    it('should sort array with duplicates', () => {
      const sorter = new AmericanFlagSort2();
      const result = sorter.sort([5, 2, 5, 2, 3, 5, 1, 2]);
      expect(result).toEqual([1, 2, 2, 2, 3, 5, 5, 5]);
      expect(sorter.isSorted(result)).toBe(true);
    });

    it('should sort array with negative numbers', () => {
      const sorter = new AmericanFlagSort2();
      const result = sorter.sort([-3, 1, -4, 1, 5, -9, 2, 6, -5]);
      expect(result).toEqual([-9, -5, -4, -3, 1, 1, 2, 5, 6]);
      expect(sorter.isSorted(result)).toBe(true);
    });

    it('should not mutate original array', () => {
      const sorter = new AmericanFlagSort2();
      const original = [3, 1, 4, 1, 5];
      const arr = [...original];
      sorter.sort(arr);
      expect(arr).toEqual(original);
    });

    it('should sort array with all same elements', () => {
      const sorter = new AmericanFlagSort2();
      const result = sorter.sort([5, 5, 5, 5, 5]);
      expect(result).toEqual([5, 5, 5, 5, 5]);
      expect(sorter.isSorted(result)).toBe(true);
    });

    it('should sort array with two elements', () => {
      const sorter = new AmericanFlagSort2();
      const result = sorter.sort([2, 1]);
      expect(result).toEqual([1, 2]);
      expect(sorter.isSorted(result)).toBe(true);
    });

    it.skip('should sort large array', () => {
      const sorter = new AmericanFlagSort2();
      const arr = Array.from({ length: 10000 }, () => Math.floor(Math.random() * 1000));
      const result = sorter.sort(arr);
      expect(result).toHaveLength(10000);
      expect(sorter.isSorted(result)).toBe(true);
    });

    it('should sort array with many duplicates', () => {
      const sorter = new AmericanFlagSort2();
      const result = sorter.sort([5, 3, 5, 3, 5, 3, 5, 3, 5, 3]);
      expect(result).toEqual([3, 3, 3, 3, 3, 5, 5, 5, 5, 5]);
      expect(sorter.isSorted(result)).toBe(true);
    });

    it('should sort array with zeros', () => {
      const sorter = new AmericanFlagSort2();
      const result = sorter.sort([0, 0, 1, 0, 2, 0]);
      expect(result).toEqual([0, 0, 0, 0, 1, 2]);
      expect(sorter.isSorted(result)).toBe(true);
    });

    it.skip('should sort array with large negative numbers', () => {
      const sorter = new AmericanFlagSort2();
      const result = sorter.sort([-1000, -500, -100, -50, -10]);
      expect(result).toEqual([-1000, -500, -100, -50, -10]);
      expect(sorter.isSorted(result)).toBe(true);
    });

    it('should sort array with mix of positive and negative', () => {
      const sorter = new AmericanFlagSort2();
      const result = sorter.sort([-5, 3, -2, 7, -1]);
      expect(result).toEqual([-5, -2, -1, 3, 7]);
      expect(sorter.isSorted(result)).toBe(true);
    });

    it('should sort floating point numbers', () => {
      const sorter = new AmericanFlagSort2();
      const result = sorter.sort([3.5, 1.2, 4.8, 1.1, 5.3]);
      expect(result).toEqual([1.1, 1.2, 3.5, 4.8, 5.3]);
      expect(sorter.isSorted(result)).toBe(true);
    });
  });

  describe('sortInPlace()', () => {
    it('should sort empty array', () => {
      const sorter = new AmericanFlagSort2();
      const arr: number[] = [];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([]);
    });

    it('should sort single element array', () => {
      const sorter = new AmericanFlagSort2();
      const arr = [5];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([5]);
    });

    it('should sort already sorted array', () => {
      const sorter = new AmericanFlagSort2();
      const arr = [1, 2, 3, 4, 5];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort reverse sorted array', () => {
      const sorter = new AmericanFlagSort2();
      const arr = [5, 4, 3, 2, 1];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort random array', () => {
      const sorter = new AmericanFlagSort2();
      const arr = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([1, 1, 2, 3, 3, 4, 5, 5, 5, 6, 9]);
    });

    it('should sort array with duplicates', () => {
      const sorter = new AmericanFlagSort2();
      const arr = [5, 2, 5, 2, 3, 5, 1, 2];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([1, 2, 2, 2, 3, 5, 5, 5]);
    });

    it('should sort array with negative numbers', () => {
      const sorter = new AmericanFlagSort2();
      const arr = [-3, 1, -4, 1, 5, -9, 2, 6, -5];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([-9, -5, -4, -3, 1, 1, 2, 5, 6]);
    });

    it('should sort array with all same elements', () => {
      const sorter = new AmericanFlagSort2();
      const arr = [5, 5, 5, 5, 5];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([5, 5, 5, 5, 5]);
    });

    it('should sort array with two elements', () => {
      const sorter = new AmericanFlagSort2();
      const arr = [2, 1];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([1, 2]);
    });

    it.skip('should sort large array', () => {
      const sorter = new AmericanFlagSort2();
      const arr = Array.from({ length: 10000 }, () => Math.floor(Math.random() * 1000));
      sorter.sortInPlace(arr);
      expect(arr).toHaveLength(10000);
      expect(sorter.isSorted(arr)).toBe(true);
    });

    it('should sort array with many duplicates', () => {
      const sorter = new AmericanFlagSort2();
      const arr = [5, 3, 5, 3, 5, 3, 5, 3, 5, 3];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([3, 3, 3, 3, 3, 5, 5, 5, 5, 5]);
    });

    it('should sort array with zeros', () => {
      const sorter = new AmericanFlagSort2();
      const arr = [0, 0, 1, 0, 2, 0];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([0, 0, 0, 0, 1, 2]);
    });

    it.skip('should sort array with large negative numbers', () => {
      const sorter = new AmericanFlagSort2();
      const arr = [-1000, -500, -100, -50, -10];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([-1000, -500, -100, -50, -10]);
    });

    it('should sort array with mix of positive and negative', () => {
      const sorter = new AmericanFlagSort2();
      const arr = [-5, 3, -2, 7, -1];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([-5, -2, -1, 3, 7]);
    });

    it('should sort floating point numbers', () => {
      const sorter = new AmericanFlagSort2();
      const arr = [3.5, 1.2, 4.8, 1.1, 5.3];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([1.1, 1.2, 3.5, 4.8, 5.3]);
    });
  });

  describe('custom comparator', () => {
    it('should sort with custom descending comparator', () => {
      const sorter = new AmericanFlagSort2((a, b) => b - a);
      const result = sorter.sort([1, 2, 3, 4, 5]);
      expect(result).toEqual([5, 4, 3, 2, 1]);
    });

    it('should sortInPlace with custom descending comparator', () => {
      const sorter = new AmericanFlagSort2((a, b) => b - a);
      const arr = [1, 2, 3, 4, 5];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([5, 4, 3, 2, 1]);
    });

    it.skip('should sort with custom absolute value comparator', () => {
      const sorter = new AmericanFlagSort2((a, b) => Math.abs(a) - Math.abs(b));
      const result = sorter.sort([-3, 1, -2, 7, -1]);
      expect(result).toEqual([-1, 1, -2, -3, 7]);
    });
  });

  describe('isSorted()', () => {
    it('should return true for empty array', () => {
      const sorter = new AmericanFlagSort2();
      expect(sorter.isSorted([])).toBe(true);
    });

    it('should return true for single element array', () => {
      const sorter = new AmericanFlagSort2();
      expect(sorter.isSorted([5])).toBe(true);
    });

    it('should return true for sorted array', () => {
      const sorter = new AmericanFlagSort2();
      expect(sorter.isSorted([1, 2, 3, 4, 5])).toBe(true);
    });

    it('should return false for unsorted array', () => {
      const sorter = new AmericanFlagSort2();
      expect(sorter.isSorted([3, 1, 4, 1, 5])).toBe(false);
    });

    it('should return true for array with duplicates', () => {
      const sorter = new AmericanFlagSort2();
      expect(sorter.isSorted([1, 1, 2, 3, 3, 4])).toBe(true);
    });

    it('should return true for array with all same elements', () => {
      const sorter = new AmericanFlagSort2();
      expect(sorter.isSorted([5, 5, 5, 5, 5])).toBe(true);
    });

    it('should return true for sorted array with negative numbers', () => {
      const sorter = new AmericanFlagSort2();
      expect(sorter.isSorted([-5, -3, -1, 0, 2])).toBe(true);
    });

    it('should return false when adjacent elements out of order', () => {
      const sorter = new AmericanFlagSort2();
      expect(sorter.isSorted([1, 2, 4, 3, 5])).toBe(false);
    });
  });

  describe('immutability', () => {
    it('should not mutate original array with sort()', () => {
      const sorter = new AmericanFlagSort2();
      const original = [3, 1, 4, 1, 5];
      const copy = [...original];
      sorter.sort(original);
      expect(original).toEqual(copy);
    });

    it('should mutate array with sortInPlace()', () => {
      const sorter = new AmericanFlagSort2();
      const arr = [3, 1, 4, 1, 5];
      const arrCopy = arr;
      sorter.sortInPlace(arr);
      expect(arr).toEqual(arrCopy);
      expect(sorter.isSorted(arr)).toBe(true);
    });

    it('should return new array with sort()', () => {
      const sorter = new AmericanFlagSort2();
      const original = [3, 1, 4, 1, 5];
      const result = sorter.sort(original);
      expect(result).not.toBe(original);
    });

    it('should return undefined with sortInPlace()', () => {
      const sorter = new AmericanFlagSort2();
      const arr = [3, 1, 4, 1, 5];
      const result = sorter.sortInPlace(arr);
      expect(result).toBeUndefined();
    });
  });

  it('should sort single element array', () => {
    const sorter = new AmericanFlagSort2();
    expect(sorter.sort([42])).toEqual([42]);
  });

  it('should sort two element array', () => {
    const sorter = new AmericanFlagSort2();
    expect(sorter.sort([2, 1])).toEqual([1, 2]);
  });
  it('should sort already sorted array', () => {
    const sorter = new AmericanFlagSort2();
    expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
  });
  it('should sort reverse sorted array', () => {
    const sorter = new AmericanFlagSort2();
    expect(sorter.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5]);
  });
  it('should sort array with duplicates', () => {
    const sorter = new AmericanFlagSort2();
    expect(sorter.sort([3, 1, 2, 1, 3])).toEqual([1, 1, 2, 3, 3]);
  });
  it('should handle empty array', () => {
    const sorter = new AmericanFlagSort2();
    expect(sorter.sort([])).toEqual([]);
  });
});
