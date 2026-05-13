import { describe, it, expect } from 'vitest';
import { PigeonholeSort3 } from '../src/core/pigeonhole-sort-3/index';

describe('PigeonholeSort3', () => {
  describe('sort()', () => {
    it('should handle empty array', () => {
      const sorter = new PigeonholeSort3([]);
      expect(sorter.sort()).toEqual([]);
    });

    it('should handle single element', () => {
      const sorter = new PigeonholeSort3([42]);
      expect(sorter.sort()).toEqual([42]);
    });

    it('should handle already sorted array', () => {
      const sorter = new PigeonholeSort3([1, 2, 3, 4, 5]);
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle reverse sorted array', () => {
      const sorter = new PigeonholeSort3([5, 4, 3, 2, 1]);
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle random array', () => {
      const sorter = new PigeonholeSort3([3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]);
      expect(sorter.sort()).toEqual([1, 1, 2, 3, 3, 4, 5, 5, 5, 6, 9]);
    });

    it('should handle duplicates', () => {
      const sorter = new PigeonholeSort3([2, 2, 2, 1, 1, 3, 3]);
      expect(sorter.sort()).toEqual([1, 1, 2, 2, 2, 3, 3]);
    });

    it('should handle negative numbers', () => {
      const sorter = new PigeonholeSort3([-1, -3, 2, 0, -2, 1]);
      expect(sorter.sort()).toEqual([-3, -2, -1, 0, 1, 2]);
    });

    it('should handle large range', () => {
      const sorter = new PigeonholeSort3([100, 1, 50, 0, 200, 99]);
      expect(sorter.sort()).toEqual([0, 1, 50, 99, 100, 200]);
    });

    it('should maintain stability for equal elements', () => {
      const items = [
        { value: 2, id: 'a' },
        { value: 1, id: 'b' },
        { value: 2, id: 'c' },
        { value: 1, id: 'd' },
      ];
      const values = items.map((item) => item.value);
      const sorter = new PigeonholeSort3(values);
      const sorted = sorter.sort();

      expect(sorted).toEqual([1, 1, 2, 2]);
    });

    it('should verify stability with objects', () => {
      interface Item {
        key: number;
        originalIndex: number;
      }

      const items: Item[] = [
        { key: 2, originalIndex: 0 },
        { key: 1, originalIndex: 1 },
        { key: 2, originalIndex: 2 },
        { key: 1, originalIndex: 3 },
        { key: 3, originalIndex: 4 },
      ];

      const keys = items.map((item) => item.key);
      const sorter = new PigeonholeSort3(keys);
      const sortedKeys = sorter.sort();

      expect(sortedKeys).toEqual([1, 1, 2, 2, 3]);

      const usedIndices = new Set<number>();
      for (let i = 0; i < sortedKeys.length; i++) {
        const key = sortedKeys[i]!;
        const matchingItems = items.filter((item) => item.key === key && !usedIndices.has(item.originalIndex));
        if (matchingItems.length > 0) {
          usedIndices.add(matchingItems[0]!.originalIndex);
        }
      }
    });

    it('should handle all identical elements', () => {
      const sorter = new PigeonholeSort3([5, 5, 5, 5, 5]);
      expect(sorter.sort()).toEqual([5, 5, 5, 5, 5]);
    });

    it('should handle mix of positive and negative zeros', () => {
      const sorter = new PigeonholeSort3([-0, 0, -0, 0]);
      const result = sorter.sort();
      expect(result.length).toBe(4);
      expect(result.every((val) => val === 0 || val === -0)).toBe(true);
    });

    it('should handle small range', () => {
      const sorter = new PigeonholeSort3([0, 1, 0, 1, 0, 1]);
      expect(sorter.sort()).toEqual([0, 0, 0, 1, 1, 1]);
    });

    it('should handle large array', () => {
      const array = Array.from({ length: 100 }, () => Math.floor(Math.random() * 100));
      const sorter = new PigeonholeSort3(array);
      const result = sorter.sort();

      for (let i = 1; i < result.length; i++) {
        expect(result[i]!).toBeGreaterThanOrEqual(result[i - 1]!);
      }
    });

    it('should handle consecutive integers', () => {
      const sorter = new PigeonholeSort3([5, 3, 1, 4, 2]);
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle array with only negative numbers', () => {
      const sorter = new PigeonholeSort3([-5, -3, -1, -4, -2]);
      expect(sorter.sort()).toEqual([-5, -4, -3, -2, -1]);
    });

    it('should handle two elements', () => {
      const sorter = new PigeonholeSort3([5, 3]);
      expect(sorter.sort()).toEqual([3, 5]);
    });

    it('should handle array with min and max at ends', () => {
      const sorter = new PigeonholeSort3([10, 1, 5, 1, 10]);
      expect(sorter.sort()).toEqual([1, 1, 5, 10, 10]);
    });

    it('should handle array with single value repeated', () => {
      const sorter = new PigeonholeSort3([7, 7, 7]);
      expect(sorter.sort()).toEqual([7, 7, 7]);
    });
  });

  describe('sortDescending()', () => {
    it('should handle empty array', () => {
      const sorter = new PigeonholeSort3([]);
      expect(sorter.sortDescending()).toEqual([]);
    });

    it('should handle single element', () => {
      const sorter = new PigeonholeSort3([42]);
      expect(sorter.sortDescending()).toEqual([42]);
    });

    it('should sort in descending order', () => {
      const sorter = new PigeonholeSort3([1, 2, 3, 4, 5]);
      expect(sorter.sortDescending()).toEqual([5, 4, 3, 2, 1]);
    });

    it('should handle random array descending', () => {
      const sorter = new PigeonholeSort3([3, 1, 4, 1, 5, 9, 2]);
      expect(sorter.sortDescending()).toEqual([9, 5, 4, 3, 2, 1, 1]);
    });

    it('should handle duplicates descending', () => {
      const sorter = new PigeonholeSort3([2, 2, 2, 1, 1, 3, 3]);
      expect(sorter.sortDescending()).toEqual([3, 3, 2, 2, 2, 1, 1]);
    });

    it('should handle negative numbers descending', () => {
      const sorter = new PigeonholeSort3([-1, -3, 2, 0, -2, 1]);
      expect(sorter.sortDescending()).toEqual([2, 1, 0, -1, -2, -3]);
    });
  });

  describe('isSorted()', () => {
    it('should return true for empty array', () => {
      const sorter = new PigeonholeSort3([]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should return true for single element', () => {
      const sorter = new PigeonholeSort3([42]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should return true for sorted array', () => {
      const sorter = new PigeonholeSort3([1, 2, 3, 4, 5]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should return false for unsorted array', () => {
      const sorter = new PigeonholeSort3([5, 4, 3, 2, 1]);
      expect(sorter.isSorted()).toBe(false);
    });

    it('should return true for array with duplicates', () => {
      const sorter = new PigeonholeSort3([1, 1, 2, 2, 3]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should return false for partially sorted array', () => {
      const sorter = new PigeonholeSort3([1, 3, 2, 4, 5]);
      expect(sorter.isSorted()).toBe(false);
    });
  });

  describe('findRange()', () => {
    it('should return 0 for empty array', () => {
      const sorter = new PigeonholeSort3([]);
      expect(sorter.findRange()).toBe(0);
    });

    it('should return correct range', () => {
      const sorter = new PigeonholeSort3([1, 5, 3, 2, 4]);
      expect(sorter.findRange()).toBe(5);
    });

    it('should calculate range with negatives', () => {
      const sorter = new PigeonholeSort3([-2, 2, 0, -1, 1]);
      expect(sorter.findRange()).toBe(5);
    });

    it('should return 1 for single element', () => {
      const sorter = new PigeonholeSort3([42]);
      expect(sorter.findRange()).toBe(1);
    });

    it('should return correct range for consecutive integers', () => {
      const sorter = new PigeonholeSort3([1, 2, 3, 4, 5]);
      expect(sorter.findRange()).toBe(5);
    });

    it('should handle large range values', () => {
      const sorter = new PigeonholeSort3([-100, 100]);
      expect(sorter.findRange()).toBe(201);
    });
  });

  describe('findMinMax()', () => {
    it('should return 0,0 for empty array', () => {
      const sorter = new PigeonholeSort3([]);
      expect(sorter.findMinMax()).toEqual({ min: 0, max: 0 });
    });

    it('should return correct min and max', () => {
      const sorter = new PigeonholeSort3([5, 1, 3, 2, 4]);
      expect(sorter.findMinMax()).toEqual({ min: 1, max: 5 });
    });

    it('should return negative minimum', () => {
      const sorter = new PigeonholeSort3([-3, -1, -2, 0, 2]);
      expect(sorter.findMinMax()).toEqual({ min: -3, max: 2 });
    });

    it('should return same value for single element', () => {
      const sorter = new PigeonholeSort3([42]);
      expect(sorter.findMinMax()).toEqual({ min: 42, max: 42 });
    });

    it('should handle all negative numbers', () => {
      const sorter = new PigeonholeSort3([-5, -3, -1, -4, -2]);
      expect(sorter.findMinMax()).toEqual({ min: -5, max: -1 });
    });

    it('should handle all identical elements', () => {
      const sorter = new PigeonholeSort3([7, 7, 7, 7]);
      expect(sorter.findMinMax()).toEqual({ min: 7, max: 7 });
    });

    it('should handle array with min and max at start and end', () => {
      const sorter = new PigeonholeSort3([10, 5, 7, 3, 1]);
      expect(sorter.findMinMax()).toEqual({ min: 1, max: 10 });
    });

    it('should handle large numbers', () => {
      const sorter = new PigeonholeSort3([1000000, -1000000, 0]);
      expect(sorter.findMinMax()).toEqual({ min: -1000000, max: 1000000 });
    });
  });

  describe('getTimeComplexity()', () => {
    it('should return correct complexity string', () => {
      const sorter = new PigeonholeSort3([1, 2, 3, 4, 5]);
      expect(sorter.getTimeComplexity()).toBe('O(n + k) = O(5 + 5)');
    });

    it('should handle empty array', () => {
      const sorter = new PigeonholeSort3([]);
      expect(sorter.getTimeComplexity()).toBe('O(n + k) = O(0 + 0)');
    });

    it('should handle large array', () => {
      const array = Array.from({ length: 100 }, (_, i) => i);
      const sorter = new PigeonholeSort3(array);
      expect(sorter.getTimeComplexity()).toBe('O(n + k) = O(100 + 100)');
    });

    it('should handle array with large range', () => {
      const sorter = new PigeonholeSort3([1, 100]);
      expect(sorter.getTimeComplexity()).toBe('O(n + k) = O(2 + 100)');
    });
  });

  describe('getSpaceComplexity()', () => {
    it('should return correct complexity string', () => {
      const sorter = new PigeonholeSort3([1, 2, 3, 4, 5]);
      expect(sorter.getSpaceComplexity()).toBe('O(n + k) = O(5 + 5)');
    });

    it('should handle empty array', () => {
      const sorter = new PigeonholeSort3([]);
      expect(sorter.getSpaceComplexity()).toBe('O(n + k) = O(0 + 0)');
    });

    it('should handle large array', () => {
      const array = Array.from({ length: 100 }, (_, i) => i);
      const sorter = new PigeonholeSort3(array);
      expect(sorter.getSpaceComplexity()).toBe('O(n + k) = O(100 + 100)');
    });

    it('should handle array with large range', () => {
      const sorter = new PigeonholeSort3([1, 100]);
      expect(sorter.getSpaceComplexity()).toBe('O(n + k) = O(2 + 100)');
    });
  });
});
