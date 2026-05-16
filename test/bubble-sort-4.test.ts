import { describe, it, expect } from 'vitest';
import { BubbleSort4 } from '../src/core/bubble-sort-4/index.js';

describe('BubbleSort4 - Basic Sorting', () => {
  it('should sort empty array', () => {
    const sorter = new BubbleSort4<number>();
    expect(sorter.sort([])).toEqual([]);
  });

  it('should sort single element array', () => {
    const sorter = new BubbleSort4<number>();
    expect(sorter.sort([1])).toEqual([1]);
  });

  it('should sort two elements in ascending order', () => {
    const sorter = new BubbleSort4<number>();
    expect(sorter.sort([2, 1])).toEqual([1, 2]);
  });

  it('should keep two elements already sorted', () => {
    const sorter = new BubbleSort4<number>();
    expect(sorter.sort([1, 2])).toEqual([1, 2]);
  });

  it('should sort three elements in ascending order', () => {
    const sorter = new BubbleSort4<number>();
    expect(sorter.sort([3, 2, 1])).toEqual([1, 2, 3]);
  });

  it('should sort array with duplicates', () => {
    const sorter = new BubbleSort4<number>();
    expect(sorter.sort([3, 1, 2, 1, 3])).toEqual([1, 1, 2, 3, 3]);
  });

  it('should sort larger array', () => {
    const sorter = new BubbleSort4<number>();
    expect(sorter.sort([5, 2, 8, 1, 9, 3, 7, 4, 6])).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('should sort array with negative numbers', () => {
    const sorter = new BubbleSort4<number>();
    expect(sorter.sort([-5, 3, -1, 0, 2])).toEqual([-5, -1, 0, 2, 3]);
  });

  it('should sort array with all same elements', () => {
    const sorter = new BubbleSort4<number>();
    expect(sorter.sort([5, 5, 5, 5, 5])).toEqual([5, 5, 5, 5, 5]);
  });

  it('should sort already sorted array', () => {
    const sorter = new BubbleSort4<number>();
    expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('BubbleSort4 - Descending Sort', () => {
  it('should sort empty array descending', () => {
    const sorter = new BubbleSort4<number>();
    expect(sorter.sortDescending([])).toEqual([]);
  });

  it('should sort single element descending', () => {
    const sorter = new BubbleSort4<number>();
    expect(sorter.sortDescending([1])).toEqual([1]);
  });

  it('should sort two elements in descending order', () => {
    const sorter = new BubbleSort4<number>();
    expect(sorter.sortDescending([1, 2])).toEqual([2, 1]);
  });

  it('should sort three elements in descending order', () => {
    const sorter = new BubbleSort4<number>();
    expect(sorter.sortDescending([1, 2, 3])).toEqual([3, 2, 1]);
  });

  it('should sort array with duplicates descending', () => {
    const sorter = new BubbleSort4<number>();
    expect(sorter.sortDescending([3, 1, 2, 1, 3])).toEqual([3, 3, 2, 1, 1]);
  });

  it('should sort array with negative numbers descending', () => {
    const sorter = new BubbleSort4<number>();
    expect(sorter.sortDescending([-5, 3, -1, 0, 2])).toEqual([3, 2, 0, -1, -5]);
  });
});

describe('BubbleSort4 - isSorted', () => {
  it('should return true for empty array', () => {
    const sorter = new BubbleSort4<number>();
    expect(sorter.isSorted([])).toBe(true);
  });

  it('should return true for single element', () => {
    const sorter = new BubbleSort4<number>();
    expect(sorter.isSorted([1])).toBe(true);
  });

  it('should return true for sorted array', () => {
    const sorter = new BubbleSort4<number>();
    expect(sorter.isSorted([1, 2, 3, 4, 5])).toBe(true);
  });

  it('should return false for unsorted array', () => {
    const sorter = new BubbleSort4<number>();
    expect(sorter.isSorted([1, 3, 2, 4, 5])).toBe(false);
  });

  it('should return true for array with duplicates in order', () => {
    const sorter = new BubbleSort4<number>();
    expect(sorter.isSorted([1, 1, 2, 2, 3])).toBe(true);
  });
});

describe('BubbleSort4 - Complexity Methods', () => {
  it('should return correct time complexity', () => {
    const sorter = new BubbleSort4<number>();
    expect(sorter.getTimeComplexity()).toBe('O(n²)');
  });

  it('should return correct space complexity', () => {
    const sorter = new BubbleSort4<number>();
    expect(sorter.getSpaceComplexity()).toBe('O(1)');
  });
});

describe('BubbleSort4 - getCocktailMode Methods', () => {
  it('should get pass count after sorting', () => {
    const sorter = new BubbleSort4<number>();
    sorter.sort([5, 2, 8, 1]);
    expect(sorter.getPassCount()).toBeGreaterThan(0);
  });

  it('should get last swap index after sorting', () => {
    const sorter = new BubbleSort4<number>();
    sorter.sort([3, 1, 2]);
    expect(sorter.getLastSwapIndex()).toBeGreaterThanOrEqual(0);
  });

  it('should return pass count for empty array', () => {
    const sorter = new BubbleSort4<number>();
    sorter.sort([]);
    expect(sorter.getPassCount()).toBe(0);
  });

  it('should return last swap index for empty array', () => {
    const sorter = new BubbleSort4<number>();
    sorter.sort([]);
    expect(sorter.getLastSwapIndex()).toBe(-1);
  });
});

describe('BubbleSort4 - Cocktail Sort Mode', () => {
  it('should sort with cocktail mode enabled', () => {
    const sorter = new BubbleSort4<number>(true);
    expect(sorter.sort([5, 1, 4, 2, 8])).toEqual([1, 2, 4, 5, 8]);
  });

  it('should sort descending with cocktail mode', () => {
    const sorter = new BubbleSort4<number>(true);
    expect(sorter.sortDescending([1, 2, 3, 4, 5])).toEqual([5, 4, 3, 2, 1]);
  });

  it('should track pass count in cocktail mode', () => {
    const sorter = new BubbleSort4<number>(true);
    sorter.sort([3, 1, 2]);
    expect(sorter.getPassCount()).toBeGreaterThan(0);
  });

  it('should track last swap index in cocktail mode', () => {
    const sorter = new BubbleSort4<number>(true);
    sorter.sort([3, 1, 2]);
    expect(sorter.getLastSwapIndex()).toBeGreaterThanOrEqual(0);
  });

  it('should handle sorted array in cocktail mode', () => {
    const sorter = new BubbleSort4<number>(true);
    expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
  });

  it('should handle array with all same elements in cocktail mode', () => {
    const sorter = new BubbleSort4<number>(true);
    expect(sorter.sort([5, 5, 5, 5])).toEqual([5, 5, 5, 5]);
  });
});

describe('BubbleSort4 - Type Safety', () => {
  it('should sort strings', () => {
    const sorter = new BubbleSort4<string>();
    expect(sorter.sort(['d', 'a', 'c', 'b'])).toEqual(['a', 'b', 'c', 'd']);
  });

  it('should sort strings descending', () => {
    const sorter = new BubbleSort4<string>();
    expect(sorter.sortDescending(['a', 'b', 'c', 'd'])).toEqual(['d', 'c', 'b', 'a']);
  });

  it('should check if strings are sorted', () => {
    const sorter = new BubbleSort4<string>();
    expect(sorter.isSorted(['a', 'b', 'c'])).toBe(true);
    expect(sorter.isSorted(['a', 'c', 'b'])).toBe(false);
  });
});

describe('BubbleSort4 - Edge Cases', () => {
  it('should handle large array', () => {
    const sorter = new BubbleSort4<number>();
    const arr = Array.from({ length: 100 }, (_, i) => 100 - i);
    const sorted = sorter.sort(arr);
    expect(sorted[0]).toBe(1);
    expect(sorted[99]).toBe(100);
  });

  it('should handle array with two identical elements', () => {
    const sorter = new BubbleSort4<number>();
    expect(sorter.sort([5, 5])).toEqual([5, 5]);
  });

  it('should preserve original array', () => {
    const sorter = new BubbleSort4<number>();
    const original = [3, 1, 2];
    const result = sorter.sort(original);
    expect(original).toEqual([3, 1, 2]);
    expect(result).toEqual([1, 2, 3]);
  });

  it('should handle minimum and maximum values', () => {
    const sorter = new BubbleSort4<number>();
    const arr = [Number.MAX_SAFE_INTEGER, 0, Number.MIN_SAFE_INTEGER];
    expect(sorter.sort(arr)).toEqual([Number.MIN_SAFE_INTEGER, 0, Number.MAX_SAFE_INTEGER]);
  });

  it('should handle getSpaceComplexity', () => {
    const sorter = new BubbleSort4<number>();
    expect(typeof sorter.getSpaceComplexity()).toBe('string');
  });

  it('should handle sortDescending', () => {
    const sorter = new BubbleSort4<number>();
    expect(sorter.sortDescending([3, 1, 4, 1, 5])).toEqual([5, 4, 3, 1, 1]);
  });
  it('should handle getTimeComplexity', () => {
    const sorter = new BubbleSort4<number>();
    expect(typeof sorter.getTimeComplexity()).toBe('string');
  });
  it('should handle getSpaceComplexity', () => {
    const sorter = new BubbleSort4<number>();
    expect(typeof sorter.getSpaceComplexity()).toBe('string');
  });
  it('should handle already sorted input', () => {
    const sorter = new BubbleSort4<number>();
    expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
  });
});
