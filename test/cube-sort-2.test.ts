import { describe, it, expect } from 'vitest';
import { CubeSort2 } from '../src/core/cube-sort-2/index.js';

describe('CubeSort2', () => {
  describe('basic sorting', () => {
    it('should handle empty array', () => {
      const sorter = new CubeSort2();
      const result = sorter.sort([]);
      expect(result).toEqual([]);
    });

    it('should handle single element', () => {
      const sorter = new CubeSort2();
      const result = sorter.sort([42]);
      expect(result).toEqual([42]);
    });

    it('should handle two elements', () => {
      const sorter = new CubeSort2();
      const result = sorter.sort([2, 1]);
      expect(result).toEqual([1, 2]);
    });

    it('should sort already sorted array', () => {
      const sorter = new CubeSort2();
      const result = sorter.sort([1, 2, 3, 4, 5]);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort reverse sorted array', () => {
      const sorter = new CubeSort2();
      const result = sorter.sort([5, 4, 3, 2, 1]);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should sort random array', () => {
      const sorter = new CubeSort2();
      const result = sorter.sort([3, 1, 4, 1, 5, 9, 2, 6, 5, 3]);
      expect(result).toEqual([1, 1, 2, 3, 3, 4, 5, 5, 6, 9]);
    });
  });

  describe('special cases', () => {
    it('should handle duplicates', () => {
      const sorter = new CubeSort2();
      const result = sorter.sort([5, 3, 5, 3, 5, 3]);
      expect(result).toEqual([3, 3, 3, 5, 5, 5]);
    });

    it('should handle negative numbers', () => {
      const sorter = new CubeSort2();
      const result = sorter.sort([-3, -1, -4, -1, -5, -9, -2, -6]);
      expect(result).toEqual([-9, -6, -5, -4, -3, -2, -1, -1]);
    });

    it('should handle floating point numbers', () => {
      const sorter = new CubeSort2();
      const result = sorter.sort([3.14, 1.41, 2.71, 1.73, 0.577]);
      expect(result).toEqual([0.577, 1.41, 1.73, 2.71, 3.14]);
    });

    it('should handle mixed positive and negative numbers', () => {
      const sorter = new CubeSort2();
      const result = sorter.sort([-3, 5, -1, 4, -2, 0]);
      expect(result).toEqual([-3, -2, -1, 0, 4, 5]);
    });
  });

  describe('custom comparator', () => {
    it('should sort in descending order', () => {
      const sorter = new CubeSort2(undefined, (a, b) => {
        if (a < b) return 1;
        if (a > b) return -1;
        return 0;
      });
      const result = sorter.sort([1, 2, 3, 4, 5]);
      expect(result).toEqual([5, 4, 3, 2, 1]);
    });

    it('should sort strings with custom comparator', () => {
      const sorter = new CubeSort2(undefined, (a, b) => {
        return (a as string).localeCompare(b as string);
      });
      const result = sorter.sort(['zebra', 'apple', 'banana', 'cherry']);
      expect(result).toEqual(['apple', 'banana', 'cherry', 'zebra']);
    });

    it('should sort by string length', () => {
      const sorter = new CubeSort2(undefined, (a, b) => {
        const lenA = (a as string).length;
        const lenB = (b as string).length;
        if (lenA < lenB) return -1;
        if (lenA > lenB) return 1;
        return 0;
      });
      const result = sorter.sort(['aa', 'b', 'ccc', 'd', 'ee']);
      expect(result).toEqual(['b', 'd', 'aa', 'ee', 'ccc']);
    });
  });

  describe('sortInPlace', () => {
    it('should sort array in place and return void', () => {
      const sorter = new CubeSort2();
      const arr = [3, 1, 4, 1, 5];
      const result = sorter.sortInPlace(arr);
      expect(result).toBeUndefined();
      expect(arr).toEqual([1, 1, 3, 4, 5]);
    });

    it('should handle empty array in place', () => {
      const sorter = new CubeSort2();
      const arr: number[] = [];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([]);
    });

    it('should handle single element in place', () => {
      const sorter = new CubeSort2();
      const arr = [42];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([42]);
    });
  });

  describe('immutability', () => {
    it('should not modify original array when using sort', () => {
      const sorter = new CubeSort2();
      const original = [3, 1, 4, 1, 5];
      const result = sorter.sort(original);
      expect(original).toEqual([3, 1, 4, 1, 5]);
      expect(result).toEqual([1, 1, 3, 4, 5]);
    });

    it('should create new array reference', () => {
      const sorter = new CubeSort2();
      const original = [1, 2, 3];
      const result = sorter.sort(original);
      expect(result).not.toBe(original);
    });
  });

  describe('large arrays', () => {
    it('should sort large array (10000 elements)', () => {
      const sorter = new CubeSort2();
      const largeArray = Array.from({ length: 10000 }, () => Math.random());
      const result = sorter.sort(largeArray);

      for (let i = 1; i < result.length; i++) {
        expect(result[i]).toBeGreaterThanOrEqual(result[i - 1]);
      }
    });

    it('should handle large array with duplicates', () => {
      const sorter = new CubeSort2();
      const largeArray = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 100));
      const result = sorter.sort(largeArray);

      for (let i = 1; i < result.length; i++) {
        expect(result[i]).toBeGreaterThanOrEqual(result[i - 1]);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle array with all identical elements', () => {
      const sorter = new CubeSort2();
      const result = sorter.sort([5, 5, 5, 5, 5]);
      expect(result).toEqual([5, 5, 5, 5, 5]);
    });

    it('should handle array with two identical elements', () => {
      const sorter = new CubeSort2();
      const result = sorter.sort([7, 7]);
      expect(result).toEqual([7, 7]);
    });

    it('should handle very small cube size', () => {
      const sorter = new CubeSort2(2);
      const result = sorter.sort([5, 3, 1, 4, 2]);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle cube size larger than array', () => {
      const sorter = new CubeSort2(1000);
      const result = sorter.sort([3, 1, 4, 2]);
      expect(result).toEqual([1, 2, 3, 4]);
    });
  });

  describe('type safety', () => {
    it('should work with number arrays', () => {
      const sorter = new CubeSort2();
      const numbers = [5, 3, 8, 1, 2];
      const result = sorter.sort(numbers);
      expect(result).toEqual([1, 2, 3, 5, 8]);
    });

    it('should work with string arrays', () => {
      const sorter = new CubeSort2();
      const strings = ['dog', 'cat', 'bird', 'elephant'];
      const result = sorter.sort(strings);
      expect(result).toEqual(['bird', 'cat', 'dog', 'elephant']);
    });

    it('should work with object arrays using custom comparator', () => {
      interface Item {
        value: number;
      }
      const sorter = new CubeSort2(undefined, (a, b) => {
        return (a as Item).value - (b as Item).value;
      });
      const items: Item[] = [{ value: 3 }, { value: 1 }, { value: 2 }];
      const result = sorter.sort(items);
      expect(result).toEqual([{ value: 1 }, { value: 2 }, { value: 3 }]);
    });

    it('should handle empty array', () => {
      const sorter = new CubeSort2();
      expect(sorter.sort([])).toEqual([]);
    });

    it('should handle single element', () => {
      const sorter = new CubeSort2();
      expect(sorter.sort([42])).toEqual([42]);
    });

    it('should handle already sorted array', () => {
      const sorter = new CubeSort2();
      expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle reverse sorted array', () => {
      const sorter = new CubeSort2();
      expect(sorter.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle sortInPlace modifying array', () => {
      const sorter = new CubeSort2();
      const arr = [3, 1, 4, 1, 5];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([1, 1, 3, 4, 5]);
    });
  });

  describe('additional', () => {
    it('should handle empty array sort', () => {
      const sorter = new CubeSort2();
      expect(sorter.sort([])).toEqual([]);
    });

    it('should handle sortInPlace', () => {
      const sorter = new CubeSort2();
      const arr = [5, 3, 1, 4, 2];
      sorter.sortInPlace(arr);
      expect(arr).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle already sorted array', () => {
      const sorter = new CubeSort2();
      expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle empty array', () => {
      const sorter = new CubeSort2();
      expect(sorter.sort([])).toEqual([]);
    });

    it('should handle single element', () => {
      const sorter = new CubeSort2();
      expect(sorter.sort([42])).toEqual([42]);
    });
  });
});
