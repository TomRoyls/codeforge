import { describe, it, expect } from 'vitest';
import { EscapeSort } from '../src/core/escape-sort/index.js';

describe('EscapeSort', () => {
  describe('sort', () => {
    it('should sort an array of numbers in ascending order', () => {
      const arr = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5];
      const result = EscapeSort.sort(arr);
      expect(result).toEqual([1, 1, 2, 3, 3, 4, 5, 5, 5, 6, 9]);
    });

    it('should not mutate the original array', () => {
      const arr = [3, 1, 4, 1, 5];
      const arrCopy = [...arr];
      EscapeSort.sort(arr);
      expect(arr).toEqual(arrCopy);
    });

    it('should handle empty arrays', () => {
      const arr: number[] = [];
      const result = EscapeSort.sort(arr);
      expect(result).toEqual([]);
    });

    it('should handle single element arrays', () => {
      const arr = [42];
      const result = EscapeSort.sort(arr);
      expect(result).toEqual([42]);
    });

    it('should handle already sorted arrays', () => {
      const arr = [1, 2, 3, 4, 5];
      const result = EscapeSort.sort(arr);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle reverse sorted arrays', () => {
      const arr = [5, 4, 3, 2, 1];
      const result = EscapeSort.sort(arr);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle arrays with duplicates', () => {
      const arr = [2, 2, 2, 1, 1, 3, 3, 3];
      const result = EscapeSort.sort(arr);
      expect(result).toEqual([1, 1, 2, 2, 2, 3, 3, 3]);
    });

    it('should sort an array of strings', () => {
      const arr = ['banana', 'apple', 'cherry', 'date'];
      const result = EscapeSort.sort(arr);
      expect(result).toEqual(['apple', 'banana', 'cherry', 'date']);
    });

    it('should sort objects with a custom comparator', () => {
      interface Person {
        name: string;
        age: number;
      }
      const arr: Person[] = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
        { name: 'Charlie', age: 35 },
      ];
      const result = EscapeSort.sort(arr, (a, b) => a.age - b.age);
      expect(result).toEqual([
        { name: 'Bob', age: 25 },
        { name: 'Alice', age: 30 },
        { name: 'Charlie', age: 35 },
      ]);
    });

    it('should sort in descending order with a custom comparator', () => {
      const arr = [1, 2, 3, 4, 5];
      const result = EscapeSort.sort(arr, (a, b) => b - a);
      expect(result).toEqual([5, 4, 3, 2, 1]);
    });

    it('should maintain stability for equal elements', () => {
      interface Item {
        id: number;
        value: number;
      }
      const arr: Item[] = [
        { id: 1, value: 2 },
        { id: 2, value: 2 },
        { id: 3, value: 1 },
        { id: 4, value: 2 },
        { id: 5, value: 1 },
      ];
      const result = EscapeSort.sort(arr, (a, b) => a.value - b.value);
      // Stable sort should maintain relative order of equal elements
      expect(result).toEqual([
        { id: 3, value: 1 },
        { id: 5, value: 1 },
        { id: 1, value: 2 },
        { id: 2, value: 2 },
        { id: 4, value: 2 },
      ]);
    });

    it('should handle negative numbers', () => {
      const arr = [-3, -1, -4, -1, -5, -9];
      const result = EscapeSort.sort(arr);
      expect(result).toEqual([-9, -5, -4, -3, -1, -1]);
    });

    it('should handle mixed positive and negative numbers', () => {
      const arr = [3, -1, 4, -5, 2, -6];
      const result = EscapeSort.sort(arr);
      expect(result).toEqual([-6, -5, -1, 2, 3, 4]);
    });

    it('should handle floating point numbers', () => {
      const arr = [3.14, 1.59, 2.65, 1.41];
      const result = EscapeSort.sort(arr);
      expect(result).toEqual([1.41, 1.59, 2.65, 3.14]);
    });
  });

  describe('sortInPlace', () => {
    it('should sort an array of numbers in ascending order', () => {
      const arr = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5];
      const result = EscapeSort.sortInPlace(arr);
      expect(arr).toEqual([1, 1, 2, 3, 3, 4, 5, 5, 5, 6, 9]);
      expect(result).toBe(arr); // Should return the same array
    });

    it('should mutate the original array', () => {
      const arr = [3, 1, 4, 1, 5];
      const arrCopy = [...arr];
      EscapeSort.sortInPlace(arr);
      expect(arr).not.toEqual(arrCopy);
      expect(arr).toEqual([1, 1, 3, 4, 5]);
    });

    it('should handle empty arrays', () => {
      const arr: number[] = [];
      const result = EscapeSort.sortInPlace(arr);
      expect(arr).toEqual([]);
      expect(result).toBe(arr);
    });

    it('should handle single element arrays', () => {
      const arr = [42];
      const result = EscapeSort.sortInPlace(arr);
      expect(arr).toEqual([42]);
      expect(result).toBe(arr);
    });

    it('should handle already sorted arrays', () => {
      const arr = [1, 2, 3, 4, 5];
      const result = EscapeSort.sortInPlace(arr);
      expect(arr).toEqual([1, 2, 3, 4, 5]);
      expect(result).toBe(arr);
    });

    it('should handle reverse sorted arrays', () => {
      const arr = [5, 4, 3, 2, 1];
      const result = EscapeSort.sortInPlace(arr);
      expect(arr).toEqual([1, 2, 3, 4, 5]);
      expect(result).toBe(arr);
    });

    it('should handle arrays with duplicates', () => {
      const arr = [2, 2, 2, 1, 1, 3, 3, 3];
      const result = EscapeSort.sortInPlace(arr);
      expect(arr).toEqual([1, 1, 2, 2, 2, 3, 3, 3]);
      expect(result).toBe(arr);
    });

    it('should sort an array of strings', () => {
      const arr = ['banana', 'apple', 'cherry', 'date'];
      const result = EscapeSort.sortInPlace(arr);
      expect(arr).toEqual(['apple', 'banana', 'cherry', 'date']);
      expect(result).toBe(arr);
    });

    it('should sort objects with a custom comparator', () => {
      interface Person {
        name: string;
        age: number;
      }
      const arr: Person[] = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
        { name: 'Charlie', age: 35 },
      ];
      const result = EscapeSort.sortInPlace(arr, (a, b) => a.age - b.age);
      expect(arr).toEqual([
        { name: 'Bob', age: 25 },
        { name: 'Alice', age: 30 },
        { name: 'Charlie', age: 35 },
      ]);
      expect(result).toBe(arr);
    });

    it('should sort in descending order with a custom comparator', () => {
      const arr = [1, 2, 3, 4, 5];
      const result = EscapeSort.sortInPlace(arr, (a, b) => b - a);
      expect(arr).toEqual([5, 4, 3, 2, 1]);
      expect(result).toBe(arr);
    });

    it('should maintain stability for equal elements', () => {
      interface Item {
        id: number;
        value: number;
      }
      const arr: Item[] = [
        { id: 1, value: 2 },
        { id: 2, value: 2 },
        { id: 3, value: 1 },
        { id: 4, value: 2 },
        { id: 5, value: 1 },
      ];
      const result = EscapeSort.sortInPlace(arr, (a, b) => a.value - b.value);
      expect(arr).toEqual([
        { id: 3, value: 1 },
        { id: 5, value: 1 },
        { id: 1, value: 2 },
        { id: 2, value: 2 },
        { id: 4, value: 2 },
      ]);
      expect(result).toBe(arr);
    });

    it('should handle negative numbers', () => {
      const arr = [-3, -1, -4, -1, -5, -9];
      const result = EscapeSort.sortInPlace(arr);
      expect(arr).toEqual([-9, -5, -4, -3, -1, -1]);
      expect(result).toBe(arr);
    });

    it('should handle mixed positive and negative numbers', () => {
      const arr = [3, -1, 4, -5, 2, -6];
      const result = EscapeSort.sortInPlace(arr);
      expect(arr).toEqual([-6, -5, -1, 2, 3, 4]);
      expect(result).toBe(arr);
    });
  });

  describe('isSorted', () => {
    it('should return true for a sorted array of numbers', () => {
      const arr = [1, 2, 3, 4, 5];
      const result = EscapeSort.isSorted(arr);
      expect(result).toBe(true);
    });

    it('should return false for an unsorted array of numbers', () => {
      const arr = [3, 1, 4, 1, 5];
      const result = EscapeSort.isSorted(arr);
      expect(result).toBe(false);
    });

    it('should return true for an empty array', () => {
      const arr: number[] = [];
      const result = EscapeSort.isSorted(arr);
      expect(result).toBe(true);
    });

    it('should return true for a single element array', () => {
      const arr = [42];
      const result = EscapeSort.isSorted(arr);
      expect(result).toBe(true);
    });

    it('should return true for an array with duplicates', () => {
      const arr = [1, 1, 2, 2, 3];
      const result = EscapeSort.isSorted(arr);
      expect(result).toBe(true);
    });

    it('should return true for a reverse sorted array when using descending comparator', () => {
      const arr = [5, 4, 3, 2, 1];
      const result = EscapeSort.isSorted(arr, (a, b) => b - a);
      expect(result).toBe(true);
    });

    it('should return false for a reverse sorted array with default comparator', () => {
      const arr = [5, 4, 3, 2, 1];
      const result = EscapeSort.isSorted(arr);
      expect(result).toBe(false);
    });

    it('should work with strings', () => {
      const arr = ['apple', 'banana', 'cherry'];
      const result = EscapeSort.isSorted(arr);
      expect(result).toBe(true);
    });

    it('should return false for unsorted strings', () => {
      const arr = ['banana', 'apple', 'cherry'];
      const result = EscapeSort.isSorted(arr);
      expect(result).toBe(false);
    });

    it('should work with objects and custom comparator', () => {
      interface Person {
        name: string;
        age: number;
      }
      const arr: Person[] = [
        { name: 'Bob', age: 25 },
        { name: 'Alice', age: 30 },
        { name: 'Charlie', age: 35 },
      ];
      const result = EscapeSort.isSorted(arr, (a, b) => a.age - b.age);
      expect(result).toBe(true);
    });

    it('should return false for unsorted objects', () => {
      interface Person {
        name: string;
        age: number;
      }
      const arr: Person[] = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
        { name: 'Charlie', age: 35 },
      ];
      const result = EscapeSort.isSorted(arr, (a, b) => a.age - b.age);
      expect(result).toBe(false);
    });

    it('should return true for sorted negative numbers', () => {
      const arr = [-9, -5, -4, -3, -1];
      const result = EscapeSort.isSorted(arr);
      expect(result).toBe(true);
    });

    it('should return false for unsorted negative numbers', () => {
      const arr = [-3, -1, -4, -1, -5, -9];
      const result = EscapeSort.isSorted(arr);
      expect(result).toBe(false);
    });

    it('should return true for sorted floating point numbers', () => {
      const arr = [1.41, 1.59, 2.65, 3.14];
      const result = EscapeSort.isSorted(arr);
      expect(result).toBe(true);
    });

    it('should return false for unsorted floating point numbers', () => {
      const arr = [3.14, 1.59, 2.65, 1.41];
      const result = EscapeSort.isSorted(arr);
      expect(result).toBe(false);
    });
  });

  describe('integration tests', () => {
    it('should work end-to-end: isSorted, sort, isSorted', () => {
      const arr = [3, 1, 4, 1, 5];
      expect(EscapeSort.isSorted(arr)).toBe(false);
      const sorted = EscapeSort.sort(arr);
      expect(sorted).toEqual([1, 1, 3, 4, 5]);
      expect(EscapeSort.isSorted(sorted)).toBe(true);
    });

    it('should work end-to-end: isSorted, sortInPlace, isSorted', () => {
      const arr = [3, 1, 4, 1, 5];
      expect(EscapeSort.isSorted(arr)).toBe(false);
      EscapeSort.sortInPlace(arr);
      expect(arr).toEqual([1, 1, 3, 4, 5]);
      expect(EscapeSort.isSorted(arr)).toBe(true);
    });

    it('should maintain consistency between sort and sortInPlace', () => {
      const arr1 = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5];
      const arr2 = [...arr1];
      const result1 = EscapeSort.sort(arr1);
      const result2 = EscapeSort.sortInPlace(arr2);
      expect(result1).toEqual(result2);
      expect(arr1).toEqual([3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]); // arr1 unchanged
      expect(arr2).toEqual(result2); // arr2 mutated
    });
  });
});