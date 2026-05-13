import { describe, it, expect } from 'vitest';
import { CountingSort4 } from '../src/core/counting-sort-4/index';

describe('CountingSort4', () => {
  describe('sort()', () => {
    it('should handle empty array', () => {
      const sorter = new CountingSort4([]);
      expect(sorter.sort([])).toEqual([]);
    });

    it('should handle single element', () => {
      const sorter = new CountingSort4([]);
      expect(sorter.sort([42])).toEqual([42]);
    });

    it('should handle already sorted array', () => {
      const sorter = new CountingSort4([]);
      expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle reverse sorted array', () => {
      const sorter = new CountingSort4([]);
      expect(sorter.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle random array', () => {
      const sorter = new CountingSort4([]);
      expect(sorter.sort([3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5])).toEqual([1, 1, 2, 3, 3, 4, 5, 5, 5, 6, 9]);
    });

    it('should handle duplicates', () => {
      const sorter = new CountingSort4([]);
      expect(sorter.sort([2, 2, 2, 1, 1, 3, 3])).toEqual([1, 1, 2, 2, 2, 3, 3]);
    });

    it('should handle negative numbers', () => {
      const sorter = new CountingSort4([]);
      expect(sorter.sort([-1, -3, 2, 0, -2, 1])).toEqual([-3, -2, -1, 0, 1, 2]);
    });

    it('should handle all identical elements', () => {
      const sorter = new CountingSort4([]);
      expect(sorter.sort([5, 5, 5, 5, 5])).toEqual([5, 5, 5, 5, 5]);
    });
  });

  describe('sortDescending()', () => {
    it('should handle empty array', () => {
      const sorter = new CountingSort4([]);
      expect(sorter.sortDescending([])).toEqual([]);
    });

    it('should handle single element', () => {
      const sorter = new CountingSort4([]);
      expect(sorter.sortDescending([42])).toEqual([42]);
    });

    it('should sort in descending order', () => {
      const sorter = new CountingSort4([]);
      expect(sorter.sortDescending([1, 2, 3, 4, 5])).toEqual([5, 4, 3, 2, 1]);
    });

    it('should handle duplicates in descending order', () => {
      const sorter = new CountingSort4([]);
      expect(sorter.sortDescending([2, 2, 2, 1, 1, 3, 3])).toEqual([3, 3, 2, 2, 2, 1, 1]);
    });

    it('should handle negative numbers in descending order', () => {
      const sorter = new CountingSort4([]);
      expect(sorter.sortDescending([-1, -3, 2, 0, -2, 1])).toEqual([2, 1, 0, -1, -2, -3]);
    });

    it('should handle random array in descending order', () => {
      const sorter = new CountingSort4([]);
      expect(sorter.sortDescending([3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5])).toEqual([9, 6, 5, 5, 5, 4, 3, 3, 2, 1, 1]);
    });
  });

  describe('isSorted()', () => {
    it('should return true for empty array', () => {
      const sorter = new CountingSort4([]);
      expect(sorter.isSorted([])).toBe(true);
    });

    it('should return true for single element', () => {
      const sorter = new CountingSort4([]);
      expect(sorter.isSorted([42])).toBe(true);
    });

    it('should return true for sorted array', () => {
      const sorter = new CountingSort4([]);
      expect(sorter.isSorted([1, 2, 3, 4, 5])).toBe(true);
    });

    it('should return false for unsorted array', () => {
      const sorter = new CountingSort4([]);
      expect(sorter.isSorted([5, 4, 3, 2, 1])).toBe(false);
    });

    it('should return true for array with duplicates', () => {
      const sorter = new CountingSort4([]);
      expect(sorter.isSorted([1, 1, 2, 2, 3])).toBe(true);
    });
  });

  describe('sortByKey()', () => {
    it('should handle empty array', () => {
      expect(CountingSort4.sortByKey([], (item: number) => item)).toEqual([]);
    });

    it('should sort by key function', () => {
      const items = [
        { value: 2 },
        { value: 1 },
        { value: 3 },
      ];
      const sorted = CountingSort4.sortByKey(items, (item) => item.value);
      expect(sorted.map((item) => item.value)).toEqual([1, 2, 3]);
    });

    it('should maintain stability for equal keys', () => {
      const items = [
        { value: 2, id: 'a' },
        { value: 1, id: 'b' },
        { value: 2, id: 'c' },
        { value: 1, id: 'd' },
      ];
      const sorted = CountingSort4.sortByKey(items, (item) => item.value);
      expect(sorted[0]!.id).toBe('b');
      expect(sorted[1]!.id).toBe('d');
      expect(sorted[2]!.id).toBe('a');
      expect(sorted[3]!.id).toBe('c');
    });

    it('should handle negative key values', () => {
      const items = [
        { value: -1 },
        { value: -3 },
        { value: 2 },
        { value: 0 },
      ];
      const sorted = CountingSort4.sortByKey(items, (item) => item.value);
      expect(sorted.map((item) => item.value)).toEqual([-3, -1, 0, 2]);
    });

    it('should handle single element', () => {
      const items = [{ value: 42 }];
      const sorted = CountingSort4.sortByKey(items, (item) => item.value);
      expect(sorted.map((item) => item.value)).toEqual([42]);
    });
  });

  describe('countFrequency()', () => {
    it('should return 0 for empty array', () => {
      expect(CountingSort4.countFrequency([], 5)).toBe(0);
    });

    it('should count occurrences correctly', () => {
      expect(CountingSort4.countFrequency([1, 2, 2, 3, 2, 1], 2)).toBe(3);
    });

    it('should return 0 when value not present', () => {
      expect(CountingSort4.countFrequency([1, 2, 3, 4, 5], 6)).toBe(0);
    });

    it('should count single occurrence', () => {
      expect(CountingSort4.countFrequency([1, 2, 3, 4, 5], 3)).toBe(1);
    });

    it('should count all same values', () => {
      expect(CountingSort4.countFrequency([5, 5, 5, 5, 5], 5)).toBe(5);
    });

    it('should handle negative values', () => {
      expect(CountingSort4.countFrequency([-1, -2, -1, 0, -1], -1)).toBe(3);
    });
  });

  describe('getMin() - static', () => {
    it('should return undefined for empty array', () => {
      expect(CountingSort4.getMin([])).toBeUndefined();
    });

    it('should return correct minimum', () => {
      expect(CountingSort4.getMin([5, 1, 3, 2, 4])).toBe(1);
    });

    it('should return negative minimum', () => {
      expect(CountingSort4.getMin([-3, -1, -2])).toBe(-3);
    });

    it('should return single element', () => {
      expect(CountingSort4.getMin([42])).toBe(42);
    });
  });

  describe('getMax() - static', () => {
    it('should return undefined for empty array', () => {
      expect(CountingSort4.getMax([])).toBeUndefined();
    });

    it('should return correct maximum', () => {
      expect(CountingSort4.getMax([1, 5, 3, 2, 4])).toBe(5);
    });

    it('should handle negative numbers', () => {
      expect(CountingSort4.getMax([-5, -1, -3])).toBe(-1);
    });

    it('should return single element', () => {
      expect(CountingSort4.getMax([42])).toBe(42);
    });
  });

  describe('stableCountSort()', () => {
    it('should handle empty array', () => {
      expect(CountingSort4.stableCountSort([])).toEqual([]);
    });

    it('should handle single element', () => {
      expect(CountingSort4.stableCountSort([42])).toEqual([42]);
    });

    it('should sort correctly', () => {
      expect(CountingSort4.stableCountSort([3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5])).toEqual([1, 1, 2, 3, 3, 4, 5, 5, 5, 6, 9]);
    });

    it('should maintain stability for equal elements', () => {
      const items = [
        { key: 2, id: 'a' },
        { key: 1, id: 'b' },
        { key: 2, id: 'c' },
        { key: 1, id: 'd' },
      ];
      const keys = items.map((item) => item.key);
      const sortedKeys = CountingSort4.stableCountSort(keys);
      expect(sortedKeys).toEqual([1, 1, 2, 2]);
    });

    it('should handle negative numbers', () => {
      expect(CountingSort4.stableCountSort([-1, -3, 2, 0, -2, 1])).toEqual([-3, -2, -1, 0, 1, 2]);
    });
  });

  describe('countDistinct()', () => {
    it('should return 0 for empty array', () => {
      expect(CountingSort4.countDistinct([])).toBe(0);
    });

    it('should count distinct values correctly', () => {
      expect(CountingSort4.countDistinct([1, 2, 2, 3, 1, 4, 2])).toBe(4);
    });

    it('should return 1 for all identical elements', () => {
      expect(CountingSort4.countDistinct([5, 5, 5, 5, 5])).toBe(1);
    });

    it('should count all distinct in array with no duplicates', () => {
      expect(CountingSort4.countDistinct([1, 2, 3, 4, 5])).toBe(5);
    });

    it('should handle negative numbers', () => {
      expect(CountingSort4.countDistinct([-1, -2, -1, 0, -2, 1])).toBe(4);
    });

    it('should count single element', () => {
      expect(CountingSort4.countDistinct([42])).toBe(1);
    });
  });

  describe('histogram()', () => {
    it('should return empty map for empty array', () => {
      const result = CountingSort4.histogram([]);
      expect(result.size).toBe(0);
    });

    it('should create correct histogram', () => {
      const result = CountingSort4.histogram([1, 2, 2, 3, 1, 2]);
      expect(result.get(1)).toBe(2);
      expect(result.get(2)).toBe(3);
      expect(result.get(3)).toBe(1);
      expect(result.size).toBe(3);
    });

    it('should handle all identical elements', () => {
      const result = CountingSort4.histogram([5, 5, 5, 5, 5]);
      expect(result.get(5)).toBe(5);
      expect(result.size).toBe(1);
    });

    it('should handle negative numbers', () => {
      const result = CountingSort4.histogram([-1, -2, -1, 0, -2]);
      expect(result.get(-1)).toBe(2);
      expect(result.get(-2)).toBe(2);
      expect(result.get(0)).toBe(1);
      expect(result.size).toBe(3);
    });

    it('should handle single element', () => {
      const result = CountingSort4.histogram([42]);
      expect(result.get(42)).toBe(1);
      expect(result.size).toBe(1);
    });
  });

  describe('getCounts()', () => {
    it('should return correct counts', () => {
      const sorter = new CountingSort4([1, 2, 2, 3, 1]);
      expect(sorter.getCounts()).toEqual([2, 2, 1]);
    });

    it('should return empty array for empty input', () => {
      const sorter = new CountingSort4([]);
      expect(sorter.getCounts()).toEqual([]);
    });

    it('should return single count for single element', () => {
      const sorter = new CountingSort4([5]);
      expect(sorter.getCounts()).toEqual([1]);
    });
  });

  describe('getMin() - instance', () => {
    it('should return undefined for empty array', () => {
      const sorter = new CountingSort4([]);
      expect(sorter.getMin()).toBeUndefined();
    });

    it('should return correct minimum', () => {
      const sorter = new CountingSort4([5, 1, 3, 2, 4]);
      expect(sorter.getMin()).toBe(1);
    });

    it('should return negative minimum', () => {
      const sorter = new CountingSort4([-3, -1, -2]);
      expect(sorter.getMin()).toBe(-3);
    });
  });

  describe('getMax() - instance', () => {
    it('should return undefined for empty array', () => {
      const sorter = new CountingSort4([]);
      expect(sorter.getMax()).toBeUndefined();
    });

    it('should return correct maximum', () => {
      const sorter = new CountingSort4([1, 5, 3, 2, 4]);
      expect(sorter.getMax()).toBe(5);
    });

    it('should use provided maxValue', () => {
      const sorter = new CountingSort4([1, 2, 3], 10);
      expect(sorter.getMax()).toBe(10);
    });

    it('should auto-detect maximum', () => {
      const sorter = new CountingSort4([1, 2, 5, 3]);
      expect(sorter.getMax()).toBe(5);
    });
  });

  describe('getRange()', () => {
    it('should return 1 for empty array', () => {
      const sorter = new CountingSort4([]);
      expect(sorter.getRange()).toBe(1);
    });

    it('should return correct range', () => {
      const sorter = new CountingSort4([1, 5], 5);
      expect(sorter.getRange()).toBe(5);
    });

    it('should calculate range with negatives', () => {
      const sorter = new CountingSort4([-2, 2]);
      expect(sorter.getRange()).toBe(5);
    });
  });

  describe('toArray()', () => {
    it('should return copy of original array', () => {
      const original = [3, 1, 2];
      const sorter = new CountingSort4(original);
      const result = sorter.toArray();

      expect(result).toEqual(original);
      expect(result).not.toBe(original);
    });

    it('should return empty array for empty input', () => {
      const sorter = new CountingSort4([]);
      expect(sorter.toArray()).toEqual([]);
    });
  });

  describe('getTimeComplexity()', () => {
    it('should return correct complexity string', () => {
      const sorter = new CountingSort4([1, 2, 3, 4, 5], 5);
      expect(sorter.getTimeComplexity()).toBe('O(n + k) = O(5 + 5)');
    });

    it('should handle empty array', () => {
      const sorter = new CountingSort4([]);
      expect(sorter.getTimeComplexity()).toBe('O(n + k) = O(0 + 1)');
    });

    it('should handle large array', () => {
      const array = Array.from({ length: 100 }, (_, i) => i);
      const sorter = new CountingSort4(array);
      expect(sorter.getTimeComplexity()).toBe('O(n + k) = O(100 + 100)');
    });
  });

  describe('getSpaceComplexity()', () => {
    it('should return correct complexity string', () => {
      const sorter = new CountingSort4([1, 2, 3, 4, 5], 5);
      expect(sorter.getSpaceComplexity()).toBe('O(k) = O(5)');
    });

    it('should handle empty array', () => {
      const sorter = new CountingSort4([]);
      expect(sorter.getSpaceComplexity()).toBe('O(k) = O(1)');
    });

    it('should handle large range', () => {
      const sorter = new CountingSort4([0, 100], 100);
      expect(sorter.getSpaceComplexity()).toBe('O(k) = O(101)');
    });
  });
});
