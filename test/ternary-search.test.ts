import { describe, it, expect } from 'vitest';
import { TernarySearch } from '../src/core/ternary-search/index.js';

describe('TernarySearch', () => {
  describe('constructor', () => {
    it('should initialize with empty array', () => {
      const ts = new TernarySearch([]);
      expect(ts.contains(5)).toBe(false);
    });

    it('should initialize with single element', () => {
      const ts = new TernarySearch([5]);
      expect(ts.contains(5)).toBe(true);
      expect(ts.contains(10)).toBe(false);
    });

    it('should initialize with multiple sorted elements', () => {
      const ts = new TernarySearch([1, 3, 5, 7, 9]);
      expect(ts.contains(1)).toBe(true);
      expect(ts.contains(5)).toBe(true);
      expect(ts.contains(9)).toBe(true);
      expect(ts.contains(2)).toBe(false);
    });

    it('should create copy of input array', () => {
      const input = [1, 2, 3];
      const ts = new TernarySearch(input);
      input[0] = 999;
      expect(ts.contains(1)).toBe(true);
      expect(ts.contains(999)).toBe(false);
    });
  });

  describe('search', () => {
    it('should return -1 for empty array', () => {
      const ts = new TernarySearch([]);
      expect(ts.search(5)).toBe(-1);
    });

    it('should find single element', () => {
      const ts = new TernarySearch([5]);
      expect(ts.search(5)).toBe(0);
    });

    it('should find first element', () => {
      const ts = new TernarySearch([1, 2, 3, 4, 5]);
      expect(ts.search(1)).toBe(0);
    });

    it('should find last element', () => {
      const ts = new TernarySearch([1, 2, 3, 4, 5]);
      expect(ts.search(5)).toBe(4);
    });

    it('should find middle element', () => {
      const ts = new TernarySearch([1, 2, 3, 4, 5]);
      expect(ts.search(3)).toBe(2);
    });

    it('should return -1 when element not found', () => {
      const ts = new TernarySearch([1, 2, 3, 4, 5]);
      expect(ts.search(10)).toBe(-1);
    });

    it('should find element in large array', () => {
      const arr = Array.from({ length: 100 }, (_, i) => i + 1);
      const ts = new TernarySearch(arr);
      expect(ts.search(1)).toBe(0);
      expect(ts.search(50)).toBe(49);
      expect(ts.search(100)).toBe(99);
    });

    it('should find element at mid1', () => {
      const ts = new TernarySearch([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      expect(ts.search(4)).toBe(3);
    });

    it('should find element at mid2', () => {
      const ts = new TernarySearch([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      expect(ts.search(7)).toBe(6);
    });
  });

  describe('indexOf', () => {
    it('should behave same as search', () => {
      const ts = new TernarySearch([1, 2, 3, 4, 5]);
      expect(ts.indexOf(3)).toBe(2);
      expect(ts.indexOf(10)).toBe(-1);
    });

    it('should return index for found element', () => {
      const ts = new TernarySearch([10, 20, 30, 40, 50]);
      expect(ts.indexOf(30)).toBe(2);
    });

    it('should return -1 for not found', () => {
      const ts = new TernarySearch([10, 20, 30, 40, 50]);
      expect(ts.indexOf(25)).toBe(-1);
    });
  });

  describe('contains', () => {
    it('should return true for existing element', () => {
      const ts = new TernarySearch([1, 2, 3, 4, 5]);
      expect(ts.contains(3)).toBe(true);
    });

    it('should return false for non-existing element', () => {
      const ts = new TernarySearch([1, 2, 3, 4, 5]);
      expect(ts.contains(10)).toBe(false);
    });

    it('should return false for empty array', () => {
      const ts = new TernarySearch([]);
      expect(ts.contains(5)).toBe(false);
    });

    it('should return true for all elements in array', () => {
      const arr = [1, 2, 3, 4, 5];
      const ts = new TernarySearch(arr);
      for (const val of arr) {
        expect(ts.contains(val)).toBe(true);
      }
    });
  });

  describe('findMin', () => {
    it('should return minimum value', () => {
      const ts = new TernarySearch([1, 2, 3, 4, 5]);
      expect(ts.findMin()).toBe(1);
    });

    it('should return first element (minimum) of sorted array', () => {
      const ts = new TernarySearch([10, 20, 30, 40, 50]);
      expect(ts.findMin()).toBe(10);
    });

    it('should throw error for empty array', () => {
      const ts = new TernarySearch([]);
      expect(() => ts.findMin()).toThrow('Array is empty');
    });

    it('should handle negative numbers', () => {
      const ts = new TernarySearch([-10, -5, 0, 5, 10]);
      expect(ts.findMin()).toBe(-10);
    });

    it('should handle single element', () => {
      const ts = new TernarySearch([42]);
      expect(ts.findMin()).toBe(42);
    });
  });

  describe('findMax', () => {
    it('should return maximum value', () => {
      const ts = new TernarySearch([1, 2, 3, 4, 5]);
      expect(ts.findMax()).toBe(5);
    });

    it('should return last element (maximum) of sorted array', () => {
      const ts = new TernarySearch([10, 20, 30, 40, 50]);
      expect(ts.findMax()).toBe(50);
    });

    it('should throw error for empty array', () => {
      const ts = new TernarySearch([]);
      expect(() => ts.findMax()).toThrow('Array is empty');
    });

    it('should handle negative numbers', () => {
      const ts = new TernarySearch([-10, -5, 0, 5, 10]);
      expect(ts.findMax()).toBe(10);
    });

    it('should handle single element', () => {
      const ts = new TernarySearch([42]);
      expect(ts.findMax()).toBe(42);
    });
  });

  describe('closestTo', () => {
    it('should find closest element', () => {
      const ts = new TernarySearch([1, 2, 3, 4, 5]);
      expect(ts.closestTo(3)).toBe(3);
    });

    it('should return closest when target not in array', () => {
      const ts = new TernarySearch([1, 2, 4, 5]);
      expect(ts.closestTo(3)).toBe(2);
    });

    it('should return closest when below range', () => {
      const ts = new TernarySearch([10, 20, 30, 40, 50]);
      expect(ts.closestTo(5)).toBe(10);
    });

    it('should return closest when above range', () => {
      const ts = new TernarySearch([10, 20, 30, 40, 50]);
      expect(ts.closestTo(55)).toBe(50);
    });

    it('should throw error for empty array', () => {
      const ts = new TernarySearch([]);
      expect(() => ts.closestTo(5)).toThrow('Array is empty');
    });

    it('should handle tie by returning first closest', () => {
      const ts = new TernarySearch([1, 2, 4, 5]);
      expect(ts.closestTo(3)).toBe(2);
    });

    it('should work with negative numbers', () => {
      const ts = new TernarySearch([-10, -5, 0, 5, 10]);
      expect(ts.closestTo(-3)).toBe(-5);
    });

    it('should handle single element', () => {
      const ts = new TernarySearch([42]);
      expect(ts.closestTo(100)).toBe(42);
    });

    it('should handle large arrays', () => {
      const arr = Array.from({ length: 100 }, (_, i) => i * 10);
      const ts = new TernarySearch(arr);
      expect(ts.closestTo(123)).toBe(120);
      expect(ts.closestTo(125)).toBe(120);
      expect(ts.closestTo(127)).toBe(130);
    });
  });

  describe('rangeSearch', () => {
    it('should return elements in range', () => {
      const ts = new TernarySearch([1, 2, 3, 4, 5]);
      expect(ts.rangeSearch(2, 4)).toEqual([2, 3, 4]);
    });

    it('should return empty array when no elements in range', () => {
      const ts = new TernarySearch([1, 2, 3, 4, 5]);
      expect(ts.rangeSearch(10, 20)).toEqual([]);
    });

    it('should return empty array for empty array', () => {
      const ts = new TernarySearch([]);
      expect(ts.rangeSearch(1, 10)).toEqual([]);
    });

    it('should include boundary values', () => {
      const ts = new TernarySearch([1, 2, 3, 4, 5]);
      expect(ts.rangeSearch(1, 5)).toEqual([1, 2, 3, 4, 5]);
    });

    it('should return single element when only one in range', () => {
      const ts = new TernarySearch([1, 2, 3, 4, 5]);
      expect(ts.rangeSearch(3, 3)).toEqual([3]);
    });

    it('should handle negative numbers', () => {
      const ts = new TernarySearch([-5, 0, 5, 10, 15]);
      expect(ts.rangeSearch(-5, 5)).toEqual([-5, 0, 5]);
    });

    it('should handle large arrays', () => {
      const arr = Array.from({ length: 100 }, (_, i) => i + 1);
      const ts = new TernarySearch(arr);
      const result = ts.rangeSearch(25, 35);
      expect(result.length).toBe(11);
      expect(result[0]).toBe(25);
      expect(result[result.length - 1]).toBe(35);
    });

    it('should return all elements when range covers all', () => {
      const ts = new TernarySearch([1, 2, 3, 4, 5]);
      expect(ts.rangeSearch(0, 10)).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('getTimeComplexity', () => {
    it('should return O(log3 n)', () => {
      const ts = new TernarySearch([]);
      expect(ts.getTimeComplexity()).toBe('O(log3 n)');
    });

    it('should return same complexity for non-empty array', () => {
      const ts = new TernarySearch([1, 2, 3, 4, 5]);
      expect(ts.getTimeComplexity()).toBe('O(log3 n)');
    });
  });

  describe('duplicates handling', () => {
    it('should find first occurrence of duplicates', () => {
      const ts = new TernarySearch([1, 2, 2, 2, 3, 4]);
      const result = ts.search(2);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(3);
    });

    it('should find last element in duplicates', () => {
      const ts = new TernarySearch([1, 2, 2, 2, 3]);
      expect(ts.contains(2)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle two element array', () => {
      const ts = new TernarySearch([1, 10]);
      expect(ts.search(1)).toBe(0);
      expect(ts.search(10)).toBe(1);
      expect(ts.search(5)).toBe(-1);
    });

    it('should handle three element array', () => {
      const ts = new TernarySearch([1, 5, 10]);
      expect(ts.search(1)).toBe(0);
      expect(ts.search(5)).toBe(1);
      expect(ts.search(10)).toBe(2);
    });

    it('should handle four element array', () => {
      const ts = new TernarySearch([1, 2, 3, 4]);
      expect(ts.search(1)).toBe(0);
      expect(ts.search(2)).toBe(1);
      expect(ts.search(3)).toBe(2);
      expect(ts.search(4)).toBe(3);
    });

    it('should work with large sorted array', () => {
      const arr = Array.from({ length: 1000 }, (_, i) => i * 2);
      const ts = new TernarySearch(arr);
      expect(ts.search(0)).toBe(0);
      expect(ts.search(998)).toBe(499);
      expect(ts.search(1000)).toBe(500);
      expect(ts.search(1998)).toBe(999);
      expect(ts.search(2000)).toBe(-1);
    });
  });
});
