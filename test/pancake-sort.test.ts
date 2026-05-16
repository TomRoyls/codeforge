import { describe, it, expect } from 'vitest';
import { PancakeSort } from '../src/core/pancake-sort';

describe('PancakeSort', () => {
  describe('sort()', () => {
    it('should sort empty array', () => {
      const sorter = new PancakeSort<number>([]);
      const result = sorter.sort();
      expect(result).toEqual([]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should sort single element array', () => {
      const sorter = new PancakeSort<number>([5]);
      const result = sorter.sort();
      expect(result).toEqual([5]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should sort already sorted array', () => {
      const sorter = new PancakeSort<number>([1, 2, 3, 4, 5]);
      const result = sorter.sort();
      expect(result).toEqual([1, 2, 3, 4, 5]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should sort reverse sorted array', () => {
      const sorter = new PancakeSort<number>([5, 4, 3, 2, 1]);
      const result = sorter.sort();
      expect(result).toEqual([1, 2, 3, 4, 5]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should sort random array', () => {
      const sorter = new PancakeSort<number>([3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]);
      const result = sorter.sort();
      expect(result).toEqual([1, 1, 2, 3, 3, 4, 5, 5, 5, 6, 9]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should sort array with duplicates', () => {
      const sorter = new PancakeSort<number>([5, 2, 5, 2, 3, 5, 1, 2]);
      const result = sorter.sort();
      expect(result).toEqual([1, 2, 2, 2, 3, 5, 5, 5]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should sort array with custom comparator (descending)', () => {
      const sorter = new PancakeSort<number>([1, 2, 3, 4, 5], (a, b) => b - a);
      const result = sorter.sort();
      expect(result).toEqual([5, 4, 3, 2, 1]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should sort strings', () => {
      const sorter = new PancakeSort<string>(['banana', 'apple', 'cherry', 'date']);
      const result = sorter.sort();
      expect(result).toEqual(['apple', 'banana', 'cherry', 'date']);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should sort objects with custom comparator', () => {
      interface Person {
        name: string;
        age: number;
      }
      const sorter = new PancakeSort<Person>(
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
      const sorter = new PancakeSort<number>([2, 1]);
      const result = sorter.sort();
      expect(result).toEqual([1, 2]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should handle large array', () => {
      const arr = Array.from({ length: 100 }, () => Math.floor(Math.random() * 1000));
      const sorter = new PancakeSort<number>(arr);
      const result = sorter.sort();
      const sorted = [...arr].sort((a, b) => a - b);
      expect(result).toEqual(sorted);
      expect(sorter.isSorted()).toBe(true);
    });
  });

  describe('flip()', () => {
    it('should flip first k elements', () => {
      const sorter = new PancakeSort<number>([1, 2, 3, 4, 5]);
      sorter.flip(3);
      expect(sorter.toArray()).toEqual([3, 2, 1, 4, 5]);
    });

    it('should flip entire array', () => {
      const sorter = new PancakeSort<number>([1, 2, 3, 4, 5]);
      sorter.flip(5);
      expect(sorter.toArray()).toEqual([5, 4, 3, 2, 1]);
    });

    it('should not flip if k is 0 or 1', () => {
      const sorter = new PancakeSort<number>([1, 2, 3, 4, 5]);
      sorter.flip(0);
      expect(sorter.toArray()).toEqual([1, 2, 3, 4, 5]);
      expect(sorter.getFlipCount()).toBe(0);

      sorter.flip(1);
      expect(sorter.toArray()).toEqual([1, 2, 3, 4, 5]);
      expect(sorter.getFlipCount()).toBe(0);
    });

    it('should not flip if k exceeds array length', () => {
      const sorter = new PancakeSort<number>([1, 2, 3, 4, 5]);
      sorter.flip(10);
      expect(sorter.toArray()).toEqual([1, 2, 3, 4, 5]);
      expect(sorter.getFlipCount()).toBe(0);
    });
  });

  describe('getFlipCount()', () => {
    it('should return 0 for empty array', () => {
      const sorter = new PancakeSort<number>([]);
      sorter.sort();
      expect(sorter.getFlipCount()).toBe(0);
    });

    it('should return 0 for single element', () => {
      const sorter = new PancakeSort<number>([5]);
      sorter.sort();
      expect(sorter.getFlipCount()).toBe(0);
    });

    it('should track flip count for sorted array', () => {
      const sorter = new PancakeSort<number>([1, 2, 3, 4, 5]);
      sorter.sort();
      expect(sorter.getFlipCount()).toBe(0);
    });

    it('should track flip count for reverse sorted array', () => {
      const sorter = new PancakeSort<number>([5, 4, 3, 2, 1]);
      sorter.sort();
      expect(sorter.getFlipCount()).toBeGreaterThan(0);
    });

    it('should increment on each flip', () => {
      const sorter = new PancakeSort<number>([1, 2, 3, 4, 5]);
      sorter.flip(3);
      expect(sorter.getFlipCount()).toBe(1);
      sorter.flip(5);
      expect(sorter.getFlipCount()).toBe(2);
    });
  });

  describe('isSorted()', () => {
    it('should return true for empty array', () => {
      const sorter = new PancakeSort<number>([]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should return true for single element', () => {
      const sorter = new PancakeSort<number>([5]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should return true for sorted array', () => {
      const sorter = new PancakeSort<number>([1, 2, 3, 4, 5]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should return false for unsorted array', () => {
      const sorter = new PancakeSort<number>([3, 1, 4, 1, 5]);
      expect(sorter.isSorted()).toBe(false);
    });

    it('should return true after sorting', () => {
      const sorter = new PancakeSort<number>([5, 4, 3, 2, 1]);
      expect(sorter.isSorted()).toBe(false);
      sorter.sort();
      expect(sorter.isSorted()).toBe(true);
    });

    it('should work with custom comparator', () => {
      const sorter = new PancakeSort<number>([5, 4, 3, 2, 1], (a, b) => b - a);
      expect(sorter.isSorted()).toBe(true);
    });
  });

  describe('toArray()', () => {
    it('should return copy of array', () => {
      const arr = [1, 2, 3, 4, 5];
      const sorter = new PancakeSort<number>(arr);
      const result = sorter.toArray();
      expect(result).toEqual(arr);
      expect(result).not.toBe(arr);
    });

    it('should return empty array for empty input', () => {
      const sorter = new PancakeSort<number>([]);
      expect(sorter.toArray()).toEqual([]);
    });

    it('should reflect changes after flip', () => {
      const sorter = new PancakeSort<number>([1, 2, 3, 4, 5]);
      sorter.flip(3);
      expect(sorter.toArray()).toEqual([3, 2, 1, 4, 5]);
    });

    it('should return sorted array after sorting', () => {
      const sorter = new PancakeSort<number>([3, 1, 4, 1, 5]);
      sorter.sort();
      expect(sorter.toArray()).toEqual([1, 1, 3, 4, 5]);
    });
  });

  describe('getTimeComplexity()', () => {
    it('should return correct time complexity', () => {
      const sorter = new PancakeSort<number>([1, 2, 3]);
      expect(sorter.getTimeComplexity()).toBe('O(n²)');
    });
  });

  describe('getFlipCount()', () => {
    it('should track flip count during sort', () => {
      const sorter = new PancakeSort<number>([5, 3, 1, 4, 2]);
      sorter.sort();
      expect(sorter.getFlipCount()).toBeGreaterThan(0);
    });
  });

  describe('isSorted()', () => {
    it('should report sorted after sort', () => {
      const sorter = new PancakeSort<number>([5, 3, 1, 4, 2]);
      sorter.sort();
      expect(sorter.isSorted()).toBe(true);
    });

    it('should report unsorted before sort', () => {
      const sorter = new PancakeSort<number>([5, 3, 1]);
      expect(sorter.isSorted()).toBe(false);
    });

    it('should handle already sorted input', () => {
      const sorter = new PancakeSort<number>([1, 2, 3]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should handle empty array', () => {
      const sorter = new PancakeSort<number>([]);
      expect(sorter.isSorted()).toBe(true);
    });

    it('should handle sort and toArray', () => {
      const sorter = new PancakeSort<number>([3, 1, 2]);
      const result = sorter.sort();
      expect(result).toEqual([1, 2, 3]);
    });

    it('should handle flip', () => {
      const sorter = new PancakeSort<number>([3, 1, 2]);
      sorter.flip(2);
      expect(sorter.toArray()).toEqual([1, 3, 2]);
    });

    it('should handle getFlipCount', () => {
      const sorter = new PancakeSort<number>([3, 1, 2]);
      sorter.sort();
      expect(sorter.getFlipCount()).toBeGreaterThan(0);
    });

    it('should handle getTimeComplexity', () => {
      const sorter = new PancakeSort<number>([3, 1, 2]);
      expect(typeof sorter.getTimeComplexity()).toBe('string');
    });

  it('should handle isSorted on sorted array', () => {
    const sorter = new PancakeSort<number>([1, 2, 3]);
    expect(sorter.isSorted()).toBe(true);
  });

  it('should handle toArray after sort', () => {
    const sorter = new PancakeSort<number>([3, 1, 2]);
    sorter.sort();
    expect(sorter.toArray()).toEqual([1, 2, 3]);
  });

  it('should handle flip', () => {
    const sorter = new PancakeSort<number>([3, 1, 2]);
    sorter.flip(3);
    expect(sorter.toArray()).toEqual([2, 1, 3]);
  });
 });
});
