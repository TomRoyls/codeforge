import { describe, it, expect } from 'vitest';
import { OddEvenSort3 } from '../src/core/odd-even-sort-3/index.js';

describe('OddEvenSort3 - Basic Sorting', () => {
  it('should sort empty array', () => {
    const sorter = new OddEvenSort3<number>();
    expect(sorter.sort([])).toEqual([]);
  });

  it('should sort single element array', () => {
    const sorter = new OddEvenSort3<number>();
    expect(sorter.sort([1])).toEqual([1]);
  });

  it('should sort two elements in ascending order', () => {
    const sorter = new OddEvenSort3<number>();
    expect(sorter.sort([2, 1])).toEqual([1, 2]);
  });

  it('should keep two elements already sorted', () => {
    const sorter = new OddEvenSort3<number>();
    expect(sorter.sort([1, 2])).toEqual([1, 2]);
  });

  it('should sort three elements in ascending order', () => {
    const sorter = new OddEvenSort3<number>();
    expect(sorter.sort([3, 2, 1])).toEqual([1, 2, 3]);
  });

  it('should sort array with duplicates', () => {
    const sorter = new OddEvenSort3<number>();
    expect(sorter.sort([3, 1, 2, 1, 3])).toEqual([1, 1, 2, 3, 3]);
  });

  it('should sort larger array', () => {
    const sorter = new OddEvenSort3<number>();
    expect(sorter.sort([5, 2, 8, 1, 9, 3, 7, 4, 6])).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('should sort array with negative numbers', () => {
    const sorter = new OddEvenSort3<number>();
    expect(sorter.sort([-5, 3, -1, 0, 2])).toEqual([-5, -1, 0, 2, 3]);
  });

  it('should sort array with all same elements', () => {
    const sorter = new OddEvenSort3<number>();
    expect(sorter.sort([5, 5, 5, 5, 5])).toEqual([5, 5, 5, 5, 5]);
  });

  it('should sort already sorted array', () => {
    const sorter = new OddEvenSort3<number>();
    expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
  });

  it('should sort reverse sorted array', () => {
    const sorter = new OddEvenSort3<number>();
    expect(sorter.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('OddEvenSort3 - Descending Sort', () => {
  it('should sort empty array descending', () => {
    const sorter = new OddEvenSort3<number>();
    expect(sorter.sortDescending([])).toEqual([]);
  });

  it('should sort single element descending', () => {
    const sorter = new OddEvenSort3<number>();
    expect(sorter.sortDescending([1])).toEqual([1]);
  });

  it('should sort two elements in descending order', () => {
    const sorter = new OddEvenSort3<number>();
    expect(sorter.sortDescending([1, 2])).toEqual([2, 1]);
  });

  it('should sort three elements in descending order', () => {
    const sorter = new OddEvenSort3<number>();
    expect(sorter.sortDescending([1, 2, 3])).toEqual([3, 2, 1]);
  });

  it('should sort array with duplicates descending', () => {
    const sorter = new OddEvenSort3<number>();
    expect(sorter.sortDescending([3, 1, 2, 1, 3])).toEqual([3, 3, 2, 1, 1]);
  });

  it('should sort array with negative numbers descending', () => {
    const sorter = new OddEvenSort3<number>();
    expect(sorter.sortDescending([-5, 3, -1, 0, 2])).toEqual([3, 2, 0, -1, -5]);
  });
});

describe('OddEvenSort3 - isSorted', () => {
  it('should return true for empty array', () => {
    const sorter = new OddEvenSort3<number>();
    expect(sorter.isSorted([])).toBe(true);
  });

  it('should return true for single element', () => {
    const sorter = new OddEvenSort3<number>();
    expect(sorter.isSorted([1])).toBe(true);
  });

  it('should return true for sorted array', () => {
    const sorter = new OddEvenSort3<number>();
    expect(sorter.isSorted([1, 2, 3, 4, 5])).toBe(true);
  });

  it('should return false for unsorted array', () => {
    const sorter = new OddEvenSort3<number>();
    expect(sorter.isSorted([1, 3, 2, 4, 5])).toBe(false);
  });

  it('should return true for array with duplicates in order', () => {
    const sorter = new OddEvenSort3<number>();
    expect(sorter.isSorted([1, 1, 2, 2, 3])).toBe(true);
  });
});

describe('OddEvenSort3 - Complexity Methods', () => {
  it('should return correct time complexity', () => {
    const sorter = new OddEvenSort3<number>();
    expect(sorter.getTimeComplexity()).toBe('O(n²)');
  });

  it('should return correct space complexity', () => {
    const sorter = new OddEvenSort3<number>();
    expect(sorter.getSpaceComplexity()).toBe('O(1)');
  });
});

describe('OddEvenSort3 - Counter Methods', () => {
  it('should get swap count after sorting', () => {
    const sorter = new OddEvenSort3<number>();
    sorter.sort([5, 2, 8, 1]);
    expect(sorter.getSwapCount()).toBeGreaterThan(0);
  });

  it('should get pass count after sorting', () => {
    const sorter = new OddEvenSort3<number>();
    sorter.sort([5, 2, 8, 1]);
    expect(sorter.getPassCount()).toBeGreaterThan(0);
  });

  it('should return swap count for empty array', () => {
    const sorter = new OddEvenSort3<number>();
    sorter.sort([]);
    expect(sorter.getSwapCount()).toBe(0);
  });

  it('should return pass count for empty array', () => {
    const sorter = new OddEvenSort3<number>();
    sorter.sort([]);
    expect(sorter.getPassCount()).toBe(0);
  });

  it('should return pass count for single element', () => {
    const sorter = new OddEvenSort3<number>();
    sorter.sort([1]);
    expect(sorter.getPassCount()).toBe(0);
  });

  it('should return swap count for single element', () => {
    const sorter = new OddEvenSort3<number>();
    sorter.sort([1]);
    expect(sorter.getSwapCount()).toBe(0);
  });
});

describe('OddEvenSort3 - Type Safety', () => {
  it('should sort strings', () => {
    const sorter = new OddEvenSort3<string>();
    expect(sorter.sort(['d', 'a', 'c', 'b'])).toEqual(['a', 'b', 'c', 'd']);
  });

  it('should sort strings descending', () => {
    const sorter = new OddEvenSort3<string>();
    expect(sorter.sortDescending(['a', 'b', 'c', 'd'])).toEqual(['d', 'c', 'b', 'a']);
  });

  it('should check if strings are sorted', () => {
    const sorter = new OddEvenSort3<string>();
    expect(sorter.isSorted(['a', 'b', 'c'])).toBe(true);
    expect(sorter.isSorted(['a', 'c', 'b'])).toBe(false);
  });
});

describe('OddEvenSort3 - Edge Cases', () => {
  it('should handle large array', () => {
    const sorter = new OddEvenSort3<number>();
    const arr = Array.from({ length: 100 }, (_, i) => 100 - i);
    const sorted = sorter.sort(arr);
    expect(sorted[0]).toBe(1);
    expect(sorted[99]).toBe(100);
  });

  it('should handle array with two identical elements', () => {
    const sorter = new OddEvenSort3<number>();
    expect(sorter.sort([5, 5])).toEqual([5, 5]);
  });

  it('should preserve original array', () => {
    const sorter = new OddEvenSort3<number>();
    const original = [3, 1, 2];
    const result = sorter.sort(original);
    expect(original).toEqual([3, 1, 2]);
    expect(result).toEqual([1, 2, 3]);
  });

  it('should handle minimum and maximum values', () => {
    const sorter = new OddEvenSort3<number>();
    const arr = [Number.MAX_SAFE_INTEGER, 0, Number.MIN_SAFE_INTEGER];
    expect(sorter.sort(arr)).toEqual([Number.MIN_SAFE_INTEGER, 0, Number.MAX_SAFE_INTEGER]);
  });

  it('should handle isSorted check', () => {
    const sorter = new OddEvenSort3<number>();
    expect(sorter.isSorted([1, 2, 3])).toBe(true);
    expect(sorter.isSorted([3, 1, 2])).toBe(false);
  });

  it('should handle getTimeComplexity', () => {
    const sorter = new OddEvenSort3<number>();
    expect(typeof sorter.getTimeComplexity()).toBe('string');
  });

  it('should handle getSpaceComplexity', () => {
    const sorter = new OddEvenSort3<number>();
    expect(typeof sorter.getSpaceComplexity()).toBe('string');
  });

  it('should handle getSwapCount', () => {
    const sorter = new OddEvenSort3<number>();
    sorter.sort([3, 1, 2]);
    expect(sorter.getSwapCount()).toBeGreaterThanOrEqual(0);
  });

  it('should handle getPassCount', () => {
    const sorter = new OddEvenSort3<number>();
    sorter.sort([3, 1, 2]);
    expect(sorter.getPassCount()).toBeGreaterThanOrEqual(0);
  });
  it('should handle already sorted input', () => {
    const sorter = new OddEvenSort3<number>();
    expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
  });
  it('should handle sortDescending', () => {
    const sorter = new OddEvenSort3<number>();
    expect(sorter.sortDescending([3, 1, 2])).toEqual([3, 2, 1]);
  });
  it('should handle getPassCount', () => {
    const sorter = new OddEvenSort3<number>();
    sorter.sort([3, 1, 2]);
    expect(sorter.getPassCount()).toBeGreaterThan(0);
  });
  it('should handle sortDescending', () => {
    const sorter = new OddEvenSort3<number>();
    expect(sorter.sortDescending([1, 3, 2])).toEqual([3, 2, 1]);
  });
  it('should handle getTimeComplexity', () => {
    const sorter = new OddEvenSort3<number>();
    expect(typeof sorter.getTimeComplexity()).toBe('string');
  });
});
