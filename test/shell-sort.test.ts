import { describe, it, expect } from 'vitest';
import { ShellSort } from '../src/core/shell-sort';

describe('ShellSort', () => {
  describe('sort()', () => {
    it('should sort empty array', () => {
      const sorter = new ShellSort<number>([]);
      const result = sorter.sort();
      expect(result).toEqual([]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should sort single element array', () => {
      const sorter = new ShellSort<number>([5]);
      const result = sorter.sort();
      expect(result).toEqual([5]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should sort already sorted array', () => {
      const sorter = new ShellSort<number>([1, 2, 3, 4, 5]);
      const result = sorter.sort();
      expect(result).toEqual([1, 2, 3, 4, 5]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should sort reverse sorted array', () => {
      const sorter = new ShellSort<number>([5, 4, 3, 2, 1]);
      const result = sorter.sort();
      expect(result).toEqual([1, 2, 3, 4, 5]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should sort random array', () => {
      const sorter = new ShellSort<number>([3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]);
      const result = sorter.sort();
      expect(result).toEqual([1, 1, 2, 3, 3, 4, 5, 5, 5, 6, 9]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should sort array with duplicates', () => {
      const sorter = new ShellSort<number>([5, 2, 5, 2, 3, 5, 1, 2]);
      const result = sorter.sort();
      expect(result).toEqual([1, 2, 2, 2, 3, 5, 5, 5]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should sort array with custom comparator (descending)', () => {
      const sorter = new ShellSort<number>([1, 2, 3, 4, 5], (a, b) => b - a);
      const result = sorter.sort();
      expect(result).toEqual([5, 4, 3, 2, 1]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should sort strings', () => {
      const sorter = new ShellSort<string>(['banana', 'apple', 'cherry', 'date']);
      const result = sorter.sort();
      expect(result).toEqual(['apple', 'banana', 'cherry', 'date']);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should sort objects with custom comparator', () => {
      interface Person {
        name: string;
        age: number;
      }
      const sorter = new ShellSort<Person>(
        [
          { name: 'Alice', age: 30 },
          { name: 'Bob', age: 25 },
          { name: 'Charlie', age: 35 }
        ],
        (a, b) => a.age - b.age
      );
      const result = sorter.sort();
      expect(result).toEqual([
        { name: 'Bob', age: 25 },
        { name: 'Alice', age: 30 },
        { name: 'Charlie', age: 35 }
      ]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should handle two elements', () => {
      const sorter = new ShellSort<number>([2, 1]);
      const result = sorter.sort();
      expect(result).toEqual([1, 2]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should handle large array', () => {
      const arr = Array.from({ length: 100 }, () => Math.floor(Math.random() * 1000));
      const sorter = new ShellSort<number>(arr);
      const result = sorter.sort();
      const sorted = [...arr].sort((a, b) => a - b);
      expect(result).toEqual(sorted);
      expect(sorter.isSorted()).toBe(true);
    });
  });

  describe('getComparisons()', () => {
    it('should return 0 for empty array', () => {
      const sorter = new ShellSort<number>([]);
      sorter.sort();
      expect(sorter.getComparisons()).toBe(0);
    });

    it('should return 0 for single element', () => {
      const sorter = new ShellSort<number>([5]);
      sorter.sort();
      expect(sorter.getComparisons()).toBe(0);
    });

    it('should track comparisons for sorted array', () => {
      const sorter = new ShellSort<number>([1, 2, 3, 4, 5]);
      sorter.sort();
      expect(sorter.getComparisons()).toBeGreaterThan(0);
    });

    it('should track comparisons for unsorted array', () => {
      const sorter = new ShellSort<number>([5, 4, 3, 2, 1]);
      sorter.sort();
      expect(sorter.getComparisons()).toBeGreaterThan(0);
    });

    it('should have more comparisons than swaps', () => {
      const sorter = new ShellSort<number>([5, 4, 3, 2, 1]);
      sorter.sort();
      expect(sorter.getComparisons()).toBeGreaterThanOrEqual(sorter.getSwaps());
    });
  });

  describe('getSwaps()', () => {
    it('should return 0 for empty array', () => {
      const sorter = new ShellSort<number>([]);
      sorter.sort();
      expect(sorter.getSwaps()).toBe(0);
    });

    it('should return 0 for single element', () => {
      const sorter = new ShellSort<number>([5]);
      sorter.sort();
      expect(sorter.getSwaps()).toBe(0);
    });

    it('should track swaps for sorted array', () => {
      const sorter = new ShellSort<number>([1, 2, 3, 4, 5]);
      sorter.sort();
      expect(sorter.getSwaps()).toBe(0);
    });

    it('should track swaps for unsorted array', () => {
      const sorter = new ShellSort<number>([5, 4, 3, 2, 1]);
      sorter.sort();
      expect(sorter.getSwaps()).toBeGreaterThan(0);
    });

    it('should increment on each swap', () => {
      const sorter = new ShellSort<number>([3, 2, 1]);
      const swapsBefore = sorter.getSwaps();
      sorter.sort();
      expect(sorter.getSwaps()).toBeGreaterThan(swapsBefore);
    });
  });

  describe('isSorted()', () => {
    it('should return true for empty array', () => {
      const sorter = new ShellSort<number>([]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should return true for single element', () => {
      const sorter = new ShellSort<number>([5]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should return true for sorted array', () => {
      const sorter = new ShellSort<number>([1, 2, 3, 4, 5]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should return false for unsorted array', () => {
      const sorter = new ShellSort<number>([3, 1, 4, 1, 5]);
      expect(sorter.isSorted()).toBe(false);
    });

    it('should return true after sorting', () => {
      const sorter = new ShellSort<number>([5, 4, 3, 2, 1]);
      expect(sorter.isSorted()).toBe(false);
      sorter.sort();
      expect(sorter.isSorted()).toBe(true);
    });

    it('should work with custom comparator', () => {
      const sorter = new ShellSort<number>([5, 4, 3, 2, 1], (a, b) => b - a);
      expect(sorter.isSorted()).toBe(true);
    });
  });

  describe('toArray()', () => {
    it('should return copy of array', () => {
      const arr = [1, 2, 3, 4, 5];
      const sorter = new ShellSort<number>(arr);
      const result = sorter.toArray();
      expect(result).toEqual(arr);
      expect(result).not.toBe(arr);
    });

    it('should return empty array for empty input', () => {
      const sorter = new ShellSort<number>([]);
      expect(sorter.toArray()).toEqual([]);
    });

    it('should return sorted array after sorting', () => {
      const sorter = new ShellSort<number>([3, 1, 4, 1, 5]);
      sorter.sort();
      expect(sorter.toArray()).toEqual([1, 1, 3, 4, 5]);
    });
  });

  describe('getTimeComplexity()', () => {
    it('should return correct time complexity', () => {
      const sorter = new ShellSort<number>([1, 2, 3]);
      expect(sorter.getTimeComplexity()).toBe('O(n^(3/2))');
    });
  });
});
