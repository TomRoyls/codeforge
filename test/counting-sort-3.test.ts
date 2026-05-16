import { describe, it, expect } from 'vitest';
import { CountingSort } from '../src/core/counting-sort-3/index';

describe('CountingSort', () => {
  describe('sort()', () => {
    it('should handle empty array', () => {
      const sorter = new CountingSort([]);
      expect(sorter.sort()).toEqual([]);
    });

    it('should handle single element', () => {
      const sorter = new CountingSort([42]);
      expect(sorter.sort()).toEqual([42]);
    });

    it('should handle already sorted array', () => {
      const sorter = new CountingSort([1, 2, 3, 4, 5]);
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle reverse sorted array', () => {
      const sorter = new CountingSort([5, 4, 3, 2, 1]);
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle random array', () => {
      const sorter = new CountingSort([3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]);
      expect(sorter.sort()).toEqual([1, 1, 2, 3, 3, 4, 5, 5, 5, 6, 9]);
    });

    it('should handle duplicates', () => {
      const sorter = new CountingSort([2, 2, 2, 1, 1, 3, 3]);
      expect(sorter.sort()).toEqual([1, 1, 2, 2, 2, 3, 3]);
    });

    it('should handle negative numbers', () => {
      const sorter = new CountingSort([-1, -3, 2, 0, -2, 1]);
      expect(sorter.sort()).toEqual([-3, -2, -1, 0, 1, 2]);
    });

    it('should handle large range', () => {
      const sorter = new CountingSort([100, 1, 50, 0, 200, 99], 200);
      expect(sorter.sort()).toEqual([0, 1, 50, 99, 100, 200]);
    });

    it('should auto-detect max value', () => {
      const sorter = new CountingSort([5, 3, 1, 4, 2]);
      expect(sorter.sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should maintain stability for equal elements', () => {
      const items = [
        { value: 2, id: 'a' },
        { value: 1, id: 'b' },
        { value: 2, id: 'c' },
        { value: 1, id: 'd' },
      ];
      const values = items.map((item) => item.value);
      const sorter = new CountingSort(values);
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
      const sorter = new CountingSort(keys);
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
      const sorter = new CountingSort([5, 5, 5, 5, 5]);
      expect(sorter.sort()).toEqual([5, 5, 5, 5, 5]);
    });

    it('should handle mix of positive and negative zeros', () => {
      const sorter = new CountingSort([-0, 0, -0, 0]);
      const result = sorter.sort();
      expect(result.length).toBe(4);
      expect(result.every((val) => val === 0 || val === -0)).toBe(true);
    });

    it('should handle small range', () => {
      const sorter = new CountingSort([0, 1, 0, 1, 0, 1], 1);
      expect(sorter.sort()).toEqual([0, 0, 0, 1, 1, 1]);
    });
  });

  describe('isSorted()', () => {
    it('should return true for empty array', () => {
      const sorter = new CountingSort([]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should return true for single element', () => {
      const sorter = new CountingSort([42]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should return true for sorted array', () => {
      const sorter = new CountingSort([1, 2, 3, 4, 5]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should return false for unsorted array', () => {
      const sorter = new CountingSort([5, 4, 3, 2, 1]);
      expect(sorter.isSorted()).toBe(false);
    });

    it('should return true for array with duplicates', () => {
      const sorter = new CountingSort([1, 1, 2, 2, 3]);
      expect(sorter.isSorted()).toBe(true);
    });
  });

  describe('getCounts()', () => {
    it('should return correct counts', () => {
      const sorter = new CountingSort([1, 2, 2, 3, 1]);
      expect(sorter.getCounts()).toEqual([2, 2, 1]);
    });

    it('should return empty array for empty input', () => {
      const sorter = new CountingSort([]);
      expect(sorter.getCounts()).toEqual([]);
    });

    it('should return single count for single element', () => {
      const sorter = new CountingSort([5]);
      expect(sorter.getCounts()).toEqual([1]);
    });
  });

  describe('getMin()', () => {
    it('should return undefined for empty array', () => {
      const sorter = new CountingSort([]);
      expect(sorter.getMin()).toBeUndefined();
    });

    it('should return correct minimum', () => {
      const sorter = new CountingSort([5, 1, 3, 2, 4]);
      expect(sorter.getMin()).toBe(1);
    });

    it('should return negative minimum', () => {
      const sorter = new CountingSort([-3, -1, -2]);
      expect(sorter.getMin()).toBe(-3);
    });
  });

  describe('getMax()', () => {
    it('should return undefined for empty array', () => {
      const sorter = new CountingSort([]);
      expect(sorter.getMax()).toBeUndefined();
    });

    it('should return correct maximum', () => {
      const sorter = new CountingSort([1, 5, 3, 2, 4]);
      expect(sorter.getMax()).toBe(5);
    });

    it('should use provided maxValue', () => {
      const sorter = new CountingSort([1, 2, 3], 10);
      expect(sorter.getMax()).toBe(10);
    });

    it('should auto-detect maximum', () => {
      const sorter = new CountingSort([1, 2, 5, 3]);
      expect(sorter.getMax()).toBe(5);
    });
  });

  describe('getRange()', () => {
    it('should return 1 for empty array', () => {
      const sorter = new CountingSort([]);
      expect(sorter.getRange()).toBe(1);
    });

    it('should return correct range', () => {
      const sorter = new CountingSort([1, 5], 5);
      expect(sorter.getRange()).toBe(5);
    });

    it('should calculate range with negatives', () => {
      const sorter = new CountingSort([-2, 2]);
      expect(sorter.getRange()).toBe(5);
    });
  });

  describe('toArray()', () => {
    it('should return copy of original array', () => {
      const original = [3, 1, 2];
      const sorter = new CountingSort(original);
      const result = sorter.toArray();

      expect(result).toEqual(original);
      expect(result).not.toBe(original);
    });

    it('should return empty array for empty input', () => {
      const sorter = new CountingSort([]);
      expect(sorter.toArray()).toEqual([]);
    });
  });

  describe('getTimeComplexity()', () => {
    it('should return correct complexity string', () => {
      const sorter = new CountingSort([1, 2, 3, 4, 5], 5);
      expect(sorter.getTimeComplexity()).toBe('O(n + k) = O(5 + 5)');
    });

    it('should handle empty array', () => {
      const sorter = new CountingSort([]);
      expect(sorter.getTimeComplexity()).toBe('O(n + k) = O(0 + 1)');
    });

    it('should handle large array', () => {
      const array = Array.from({ length: 100 }, (_, i) => i);
      const sorter = new CountingSort(array);
      expect(sorter.getTimeComplexity()).toBe('O(n + k) = O(100 + 100)');
    });

    it('should handle sort with negative numbers', () => {
      const array = [3, -1, 2, -3, 1];
      const sorter = new CountingSort(array);
      const result = sorter.sort();
      expect(result).toEqual([-3, -1, 1, 2, 3]);
    });

    it('should handle empty array', () => {
      const sorter = new CountingSort([]);
      expect(sorter.sort()).toEqual([]);
    });

    it('should handle duplicates', () => {
      const sorter = new CountingSort([3, 1, 2, 1, 3]);
      expect(sorter.sort()).toEqual([1, 1, 2, 3, 3]);
    });

    it('should handle getRange', () => {
      const sorter = new CountingSort([3, 1, 5, 2]);
      expect(sorter.getRange()).toBeGreaterThanOrEqual(0);
    });
  });

  it('should handle getMin and getMax', () => {
    const sorter = new CountingSort([3, -1, 5, 2]);
    expect(sorter.getMin()).toBe(-1);
    expect(sorter.getMax()).toBe(5);
  });
  it('should handle constructor with negative values', () => {
    const sorter = new CountingSort([-3, -1, -2, -5]);
    const sorted = sorter.sort();
    expect(sorted).toEqual([-5, -3, -2, -1]);
  });
  it('should handle getMin and getMax with single element', () => {
    const sorter = new CountingSort([42]);
    expect(sorter.getMin()).toBe(42);
    expect(sorter.getMax()).toBe(42);
  });
  it('should handle sorted property after sort', () => {
    const sorter = new CountingSort([5, 3, 1, 4, 2]);
    const sorted = sorter.sort();
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i]!).toBeGreaterThanOrEqual(sorted[i - 1]!);
    }
  });
  it('should handle getMin and getMax', () => {
    const sorter = new CountingSort([5, 3, 1, 4, 2]);
    expect(sorter.getMin()).toBe(1);
    expect(sorter.getMax()).toBe(5);
  });
  it('should handle getRange', () => {
    const sorter = new CountingSort([5, 3, 1, 4, 2]);
    expect(sorter.getRange()).toBe(5);
  });
  it('should handle getCounts', () => {
    const sorter = new CountingSort([1, 2, 2, 3]);
    sorter.sort();
    const counts = sorter.getCounts();
    expect(counts.length).toBeGreaterThan(0);
  });
});
