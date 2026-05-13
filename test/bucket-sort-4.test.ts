import { describe, it, expect } from 'vitest';
import { BucketSort4 } from '../src/core/bucket-sort-4/index.js';

describe('BucketSort4 - Basic Sorting', () => {
  it('should sort empty array', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.sort([])).toEqual([]);
  });

  it('should sort single element array', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.sort([1])).toEqual([1]);
  });

  it('should sort two elements in ascending order', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.sort([2, 1])).toEqual([1, 2]);
  });

  it('should keep two elements already sorted', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.sort([1, 2])).toEqual([1, 2]);
  });

  it('should sort three elements in ascending order', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.sort([3, 2, 1])).toEqual([1, 2, 3]);
  });

  it('should sort array with duplicates', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.sort([3, 1, 2, 1, 3])).toEqual([1, 1, 2, 3, 3]);
  });

  it('should sort larger array', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.sort([5, 2, 8, 1, 9, 3, 7, 4, 6])).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9,
    ]);
  });

  it('should sort array with negative numbers', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.sort([-5, 3, -1, 0, 2])).toEqual([-5, -1, 0, 2, 3]);
  });

  it('should sort array with all same elements', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.sort([5, 5, 5, 5, 5])).toEqual([5, 5, 5, 5, 5]);
  });

  it('should sort already sorted array', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
  });

  it('should sort array with decimal numbers', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.sort([3.5, 1.2, 2.8, 0.1, 4.9])).toEqual([
      0.1, 1.2, 2.8, 3.5, 4.9,
    ]);
  });

  it('should handle reverse sorted array', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('BucketSort4 - Descending Sort', () => {
  it('should sort empty array descending', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.sortDescending([])).toEqual([]);
  });

  it('should sort single element descending', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.sortDescending([1])).toEqual([1]);
  });

  it('should sort two elements in descending order', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.sortDescending([1, 2])).toEqual([2, 1]);
  });

  it('should sort three elements in descending order', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.sortDescending([1, 2, 3])).toEqual([3, 2, 1]);
  });

  it('should sort array with duplicates descending', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.sortDescending([3, 1, 2, 1, 3])).toEqual([
      3, 3, 2, 1, 1,
    ]);
  });

  it('should sort array with negative numbers descending', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.sortDescending([-5, 3, -1, 0, 2])).toEqual([
      3, 2, 0, -1, -5,
    ]);
  });

  it('should handle already sorted descending array', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.sortDescending([5, 4, 3, 2, 1])).toEqual([5, 4, 3, 2, 1]);
  });
});

describe('BucketSort4 - isSorted', () => {
  it('should return true for empty array', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.isSorted([])).toBe(true);
  });

  it('should return true for single element', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.isSorted([1])).toBe(true);
  });

  it('should return true for sorted array', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.isSorted([1, 2, 3, 4, 5])).toBe(true);
  });

  it('should return false for unsorted array', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.isSorted([1, 3, 2, 4, 5])).toBe(false);
  });

  it('should return true for array with duplicates in order', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.isSorted([1, 1, 2, 2, 3])).toBe(true);
  });

  it('should return false for reverse sorted array', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.isSorted([5, 4, 3, 2, 1])).toBe(false);
  });
});

describe('BucketSort4 - Complexity Methods', () => {
  it('should return correct time complexity', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.getTimeComplexity()).toBe('O(n + k)');
  });

  it('should return correct space complexity', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.getSpaceComplexity()).toBe('O(n + k)');
  });
});

describe('BucketSort4 - sortWithBucketCount', () => {
  it('should sort with 2 buckets', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.sortWithBucketCount([5, 1, 4, 2, 8], 2)).toEqual([
      1, 2, 4, 5, 8,
    ]);
  });

  it('should sort with 5 buckets', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.sortWithBucketCount([5, 1, 4, 2, 8], 5)).toEqual([
      1, 2, 4, 5, 8,
    ]);
  });

  it('should handle empty array with custom bucket count', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.sortWithBucketCount([], 5)).toEqual([]);
  });

  it('should handle single element with custom bucket count', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.sortWithBucketCount([5], 5)).toEqual([5]);
  });

  it('should handle more buckets than elements', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.sortWithBucketCount([3, 1, 2], 10)).toEqual([1, 2, 3]);
  });

  it('should handle 1 bucket', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.sortWithBucketCount([3, 1, 2], 1)).toEqual([1, 2, 3]);
  });
});

describe('BucketSort4 - sortRange', () => {
  it('should sort within specified range', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.sortRange([5, 1, 4, 2, 8], 0, 10)).toEqual([
      1, 2, 4, 5, 8,
    ]);
  });

  it('should handle range with negative min', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.sortRange([-5, -3, -4, -1, -2], -5, -1)).toEqual([
      -5, -4, -3, -2, -1,
    ]);
  });

  it('should handle large range', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.sortRange([500, 100, 300, 200, 400], 0, 1000)).toEqual([
      100, 200, 300, 400, 500,
    ]);
  });

  it('should handle zero range', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.sortRange([5, 5, 5, 5], 5, 5)).toEqual([5, 5, 5, 5]);
  });

  it('should handle empty array with range', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.sortRange([], 0, 10)).toEqual([]);
  });
});

describe('BucketSort4 - getBucketDistribution', () => {
  it('should return distribution for small array', () => {
    const sorter = new BucketSort4<number>();
    const distribution = sorter.getBucketDistribution([1, 3, 5, 7, 9]);
    expect(distribution.size).toBeGreaterThan(0);
  });

  it('should return empty map for empty array', () => {
    const sorter = new BucketSort4<number>();
    const distribution = sorter.getBucketDistribution([]);
    expect(distribution.size).toBe(0);
  });

  it('should handle single element', () => {
    const sorter = new BucketSort4<number>();
    const distribution = sorter.getBucketDistribution([5]);
    expect(distribution.size).toBeGreaterThan(0);
  });

  it('should handle all same elements', () => {
    const sorter = new BucketSort4<number>();
    const distribution = sorter.getBucketDistribution([5, 5, 5, 5]);
    expect(distribution.size).toBeGreaterThan(0);
  });

  it('should handle negative numbers', () => {
    const sorter = new BucketSort4<number>();
    const distribution = sorter.getBucketDistribution([-5, -3, -1, 0, 2]);
    expect(distribution.size).toBeGreaterThan(0);
  });

  it('should return correct total count', () => {
    const sorter = new BucketSort4<number>();
    const distribution = sorter.getBucketDistribution([1, 2, 3, 4, 5]);
    const totalCount = Array.from(distribution.values()).reduce((a, b) => a + b, 0);
    expect(totalCount).toBe(5);
  });
});

describe('BucketSort4 - stableBucketSort', () => {
  it('should sort stably with equal elements', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.stableBucketSort([3, 1, 3, 2, 1])).toEqual([1, 1, 2, 3, 3]);
  });

  it('should handle empty array', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.stableBucketSort([])).toEqual([]);
  });

  it('should handle single element', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.stableBucketSort([5])).toEqual([5]);
  });

  it('should handle already sorted array', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.stableBucketSort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
  });

  it('should handle reverse sorted array', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.stableBucketSort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5]);
  });

  it('should maintain stability with duplicates', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.stableBucketSort([2, 1, 2, 1, 2])).toEqual([1, 1, 2, 2, 2]);
  });
});

describe('BucketSort4 - parallelBucketSort', () => {
  it('should sort using parallel bucket sort', async () => {
    const sorter = new BucketSort4<number>();
    const result = await sorter.parallelBucketSort([5, 1, 4, 2, 8]);
    expect(result).toEqual([1, 2, 4, 5, 8]);
  });

  it('should handle empty array', async () => {
    const sorter = new BucketSort4<number>();
    const result = await sorter.parallelBucketSort([]);
    expect(result).toEqual([]);
  });

  it('should handle single element', async () => {
    const sorter = new BucketSort4<number>();
    const result = await sorter.parallelBucketSort([5]);
    expect(result).toEqual([5]);
  });

  it('should handle larger array', async () => {
    const sorter = new BucketSort4<number>();
    const result = await sorter.parallelBucketSort([9, 7, 5, 3, 1, 2, 4, 6, 8]);
    expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('should handle duplicates', async () => {
    const sorter = new BucketSort4<number>();
    const result = await sorter.parallelBucketSort([3, 1, 2, 1, 3]);
    expect(result).toEqual([1, 1, 2, 3, 3]);
  });
});

describe('BucketSort4 - Edge Cases', () => {
  it('should preserve original array', () => {
    const sorter = new BucketSort4<number>();
    const original = [3, 1, 2];
    const result = sorter.sort(original);
    expect(original).toEqual([3, 1, 2]);
    expect(result).toEqual([1, 2, 3]);
  });

  it('should handle large array', () => {
    const sorter = new BucketSort4<number>();
    const arr = Array.from({ length: 100 }, (_, i) => 100 - i);
    const sorted = sorter.sort(arr);
    expect(sorted[0]).toBe(1);
    expect(sorted[99]).toBe(100);
  });

  it('should handle minimum and maximum values', () => {
    const sorter = new BucketSort4<number>();
    const arr = [Number.MAX_SAFE_INTEGER, 0, Number.MIN_SAFE_INTEGER];
    expect(sorter.sort(arr)).toEqual([Number.MIN_SAFE_INTEGER, 0, Number.MAX_SAFE_INTEGER]);
  });

  it('should handle array with two identical elements', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.sort([5, 5])).toEqual([5, 5]);
  });

  it('should handle very small range', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.sort([1, 2, 3, 2, 1])).toEqual([1, 1, 2, 2, 3]);
  });

  it('should handle custom bucket size', () => {
    const sorter = new BucketSort4<number>(5);
    expect(sorter.sort([5, 1, 4, 2, 8])).toEqual([1, 2, 4, 5, 8]);
  });

  it('should handle large bucket size', () => {
    const sorter = new BucketSort4<number>(100);
    expect(sorter.sort([5, 1, 4, 2, 8])).toEqual([1, 2, 4, 5, 8]);
  });
});

describe('BucketSort4 - Type Safety', () => {
  it('should only work with numbers', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.sort([1.5, 2.3, 0.1])).toEqual([0.1, 1.5, 2.3]);
  });

  it('should handle integer arrays', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.sort([3, 1, 4, 1, 5, 9, 2, 6])).toEqual([
      1, 1, 2, 3, 4, 5, 6, 9,
    ]);
  });

  it('should handle mixed positive and negative', () => {
    const sorter = new BucketSort4<number>();
    expect(sorter.sort([5, -3, 0, -1, 4])).toEqual([-3, -1, 0, 4, 5]);
  });
});
