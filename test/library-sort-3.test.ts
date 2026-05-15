import { describe, it, expect } from 'vitest';
import { LibrarySort3 } from '../src/core/library-sort-3/index.js';

describe('LibrarySort3', () => {
  describe('sort', () => {
    it('should sort empty array', () => {
      const sorter = new LibrarySort3([]);
      expect(sorter.sort()).toEqual([]);
    });

    it('should sort single element array', () => {
      const sorter = new LibrarySort3([5]);
      expect(sorter.sort()).toEqual([5]);
    });

    it('should sort already sorted array', () => {
      const sorter = new LibrarySort3([1, 2, 3, 4, 5]);
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort reverse sorted array', () => {
      const sorter = new LibrarySort3([5, 4, 3, 2, 1]);
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort random array', () => {
      const sorter = new LibrarySort3([3, 1, 4, 1, 5, 9, 2, 6, 5]);
      expect(sorter.sort()).toEqual([1, 1, 2, 3, 4, 5, 5, 6, 9]);
    });

    it('should sort array with duplicates', () => {
      const sorter = new LibrarySort3([3, 1, 4, 1, 5, 9, 2, 6, 5]);
      expect(sorter.sort()).toEqual([1, 1, 2, 3, 4, 5, 5, 6, 9]);
    });

    it('should sort array with negative numbers', () => {
      const sorter = new LibrarySort3([-3, 1, -4, 1, 5, -9, 2, 6, -5]);
      expect(sorter.sort()).toEqual([-9, -5, -4, -3, 1, 1, 2, 5, 6]);
    });

    it('should sort with custom comparator (descending)', () => {
      const sorter = new LibrarySort3([1, 2, 3, 4, 5], (a, b) => b - a);
      expect(sorter.sort()).toEqual([5, 4, 3, 2, 1]);
    });

    it('should sort large array', () => {
      const arr = Array.from({ length: 10000 }, () => Math.floor(Math.random() * 10000));
      const sorter = new LibrarySort3(arr);
      const result = sorter.sort();
      expect(result).toHaveLength(10000);
      let sorted = true;
      for (let i = 0; i < result.length - 1; i++) {
        if (result[i]! > result[i + 1]!) {
          sorted = false;
          break;
        }
      }
      expect(sorted).toBe(true);
    });

    it('should not mutate original array', () => {
      const original = [3, 1, 4, 1, 5];
      const sorter = new LibrarySort3(original);
      sorter.sort();
      expect(original).toEqual([3, 1, 4, 1, 5]);
    });

    it('should sort array with two elements', () => {
      const sorter = new LibrarySort3([2, 1]);
      expect(sorter.sort()).toEqual([1, 2]);
    });

    it('should sort array with floating point numbers', () => {
      const sorter = new LibrarySort3([3.5, 1.2, 4.8, 1.1, 5.0]);
      expect(sorter.sort()).toEqual([1.1, 1.2, 3.5, 4.8, 5.0]);
    });

    it('should sort array with all same elements', () => {
      const sorter = new LibrarySort3([5, 5, 5, 5, 5]);
      expect(sorter.sort()).toEqual([5, 5, 5, 5, 5]);
    });

    it('should sort array with zeros', () => {
      const sorter = new LibrarySort3([0, 0, 1, 0, 2, 0]);
      expect(sorter.sort()).toEqual([0, 0, 0, 0, 1, 2]);
    });
  });

  describe('sortInPlace', () => {
    it('should sort empty array in place', () => {
      const arr: number[] = [];
      const sorter = new LibrarySort3([]);
      const result = sorter.sortInPlace(arr);
      expect(result).toEqual([]);
    });

    it('should sort single element array in place', () => {
      const arr = [5];
      const sorter = new LibrarySort3([]);
      const result = sorter.sortInPlace(arr);
      expect(result).toEqual([5]);
    });

    it('should sort already sorted array in place', () => {
      const arr = [1, 2, 3, 4, 5];
      const sorter = new LibrarySort3([]);
      const result = sorter.sortInPlace(arr);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort reverse sorted array in place', () => {
      const arr = [5, 4, 3, 2, 1];
      const sorter = new LibrarySort3([]);
      const result = sorter.sortInPlace(arr);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort random array in place', () => {
      const arr = [3, 1, 4, 1, 5, 9, 2, 6, 5];
      const sorter = new LibrarySort3([]);
      const result = sorter.sortInPlace(arr);
      expect(result).toEqual([1, 1, 2, 3, 4, 5, 5, 6, 9]);
    });

    it('should sort array with negative numbers in place', () => {
      const arr = [-3, 1, -4, 1, 5, -9, 2, 6, -5];
      const sorter = new LibrarySort3([]);
      const result = sorter.sortInPlace(arr);
      expect(result).toEqual([-9, -5, -4, -3, 1, 1, 2, 5, 6]);
    });

    it('should sort large array in place', () => {
      const arr = Array.from({ length: 10000 }, () => Math.floor(Math.random() * 10000));
      const sorter = new LibrarySort3([]);
      const result = sorter.sortInPlace(arr);
      expect(result).toHaveLength(10000);
      let sorted = true;
      for (let i = 0; i < result.length - 1; i++) {
        if (result[i]! > result[i + 1]!) {
          sorted = false;
          break;
        }
      }
      expect(sorted).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle array of all same elements', () => {
      const sorter = new LibrarySort3([7, 7, 7, 7, 7]);
      expect(sorter.sort()).toEqual([7, 7, 7, 7, 7]);
    });

    it('should handle two element sorted', () => {
      const sorter = new LibrarySort3([1, 2]);
      expect(sorter.sort()).toEqual([1, 2]);
    });

    it('should handle large negative numbers', () => {
      const sorter = new LibrarySort3([-1000000, -999999, -999998]);
      expect(sorter.sort()).toEqual([-1000000, -999999, -999998]);
    });

    it('should handle array with single negative', () => {
      const sorter = new LibrarySort3([-5]);
      expect(sorter.sort()).toEqual([-5]);
    });

    it('should handle custom comparator with objects', () => {
      const objs = [{ v: 3 }, { v: 1 }, { v: 2 }];
      const sorter = new LibrarySort3(objs, (a, b) => a.v - b.v);
      const result = sorter.sort();
      expect(result.map(o => o.v)).toEqual([1, 2, 3]);
    });

    it('should handle sortInPlace modifying array', () => {
      const arr = [5, 3, 1, 4, 2];
      const sorter = new LibrarySort3(arr);
      sorter.sortInPlace(arr);
      expect(arr).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle descending comparator', () => {
      const sorter = new LibrarySort3([1, 2, 3, 4, 5], (a, b) => b - a);
      expect(sorter.sort()).toEqual([5, 4, 3, 2, 1]);
    });

    it('should handle empty array sortInPlace', () => {
      const arr: number[] = [];
      const sorter = new LibrarySort3(arr);
      expect(sorter.sortInPlace(arr)).toEqual([]);
    });

    it('should handle already sorted array', () => {
      const sorter = new LibrarySort3([1, 2, 3, 4, 5]);
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle reverse sorted array', () => {
      const sorter = new LibrarySort3([5, 4, 3, 2, 1]);
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle single element', () => {
      const sorter = new LibrarySort3([42]);
      expect(sorter.sort()).toEqual([42]);
    });

    it('should handle already sorted', () => {
      const sorter = new LibrarySort3([1, 2, 3, 4, 5]);
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle empty array', () => {
      const sorter = new LibrarySort3([]);
      expect(sorter.sort()).toEqual([]);
    });

    it('should handle duplicate elements', () => {
      const sorter = new LibrarySort3([3, 1, 2, 1, 3]);
      expect(sorter.sort()).toEqual([1, 1, 2, 3, 3]);
    });

    it('should handle single element', () => {
      const sorter = new LibrarySort3([42]);
      expect(sorter.sort()).toEqual([42]);
    });

    it('should handle reverse sorted', () => {
      const sorter = new LibrarySort3([5, 4, 3, 2, 1]);
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5]);
    });
  });
});
