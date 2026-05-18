import { describe, it, expect } from 'vitest';
import { EscapeSort } from '../../src/core/escape-sort/index.js';

describe('EscapeSort', () => {
  // ─── sort ───
  describe('sort', () => {
    it('should return empty array for empty input', () => {
      expect(EscapeSort.sort([])).toEqual([]);
    });

    it('should return single element for single-element input', () => {
      expect(EscapeSort.sort([42])).toEqual([42]);
    });

    it('should sort two elements', () => {
      expect(EscapeSort.sort([2, 1])).toEqual([1, 2]);
    });

    it('should sort already sorted array', () => {
      expect(EscapeSort.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort reverse-sorted array', () => {
      expect(EscapeSort.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort with duplicates', () => {
      expect(EscapeSort.sort([3, 1, 4, 1, 5, 9, 2, 6, 5])).toEqual([
        1, 1, 2, 3, 4, 5, 5, 6, 9,
      ]);
    });

    it('should not modify the original array', () => {
      const original = [3, 1, 2];
      const sorted = EscapeSort.sort(original);
      expect(sorted).toEqual([1, 2, 3]);
      expect(original).toEqual([3, 1, 2]);
    });

    it('should handle negative numbers', () => {
      expect(EscapeSort.sort([-5, -1, -3, 0, 2])).toEqual([-5, -3, -1, 0, 2]);
    });

    it('should handle all identical elements', () => {
      expect(EscapeSort.sort([7, 7, 7, 7])).toEqual([7, 7, 7, 7]);
    });
  });

  // ─── sort with custom comparator ───
  describe('sort with custom comparator', () => {
    it('should sort strings', () => {
      expect(EscapeSort.sort(['banana', 'apple', 'cherry'])).toEqual([
        'apple',
        'banana',
        'cherry',
      ]);
    });

    it('should sort in descending order with reverse comparator', () => {
      const result = EscapeSort.sort([1, 2, 3, 4, 5], (a, b) => b - a);
      expect(result).toEqual([5, 4, 3, 2, 1]);
    });

    it('should sort objects by property', () => {
      const items = [
        { name: 'c', value: 3 },
        { name: 'a', value: 1 },
        { name: 'b', value: 2 },
      ];
      const result = EscapeSort.sort(items, (a, b) => a.value - b.value);
      expect(result[0]!.name).toBe('a');
      expect(result[1]!.name).toBe('b');
      expect(result[2]!.name).toBe('c');
    });
  });

  // ─── sortInPlace ───
  describe('sortInPlace', () => {
    it('should sort the array in place', () => {
      const arr = [3, 1, 2];
      const result = EscapeSort.sortInPlace(arr);
      expect(arr).toEqual([1, 2, 3]);
      expect(result).toBe(arr);
    });

    it('should handle empty array', () => {
      const arr: number[] = [];
      expect(EscapeSort.sortInPlace(arr)).toEqual([]);
    });

    it('should handle single element', () => {
      const arr = [42];
      expect(EscapeSort.sortInPlace(arr)).toEqual([42]);
    });

    it('should handle array with duplicates', () => {
      const arr = [5, 3, 5, 1, 3];
      expect(EscapeSort.sortInPlace(arr)).toEqual([1, 3, 3, 5, 5]);
    });
  });

  // ─── isSorted ───
  describe('isSorted', () => {
    it('should return true for empty array', () => {
      expect(EscapeSort.isSorted([])).toBe(true);
    });

    it('should return true for single element', () => {
      expect(EscapeSort.isSorted([1])).toBe(true);
    });

    it('should return true for sorted array', () => {
      expect(EscapeSort.isSorted([1, 2, 3, 4, 5])).toBe(true);
    });

    it('should return false for unsorted array', () => {
      expect(EscapeSort.isSorted([3, 1, 2])).toBe(false);
    });

    it('should return true for array with duplicates in order', () => {
      expect(EscapeSort.isSorted([1, 1, 2, 2, 3])).toBe(true);
    });

    it('should work with custom comparator', () => {
      expect(EscapeSort.isSorted([5, 4, 3], (a, b) => b - a)).toBe(true);
      expect(EscapeSort.isSorted([3, 4, 5], (a, b) => b - a)).toBe(false);
    });
  });

  // ─── Integration ───
  describe('integration', () => {
    it('should sort and then pass isSorted check', () => {
      const arr = [9, 3, 7, 1, 5, 2, 8, 4, 6];
      const sorted = EscapeSort.sort(arr);
      expect(EscapeSort.isSorted(sorted)).toBe(true);
    });

    it('should handle large arrays', () => {
      const arr = Array.from({ length: 500 }, () => Math.floor(Math.random() * 1000));
      const sorted = EscapeSort.sort(arr);
      expect(EscapeSort.isSorted(sorted)).toBe(true);
      expect(sorted.length).toBe(500);
    });
  });
});
