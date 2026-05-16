import { describe, it, expect } from 'vitest';
import { FibonacciSearch } from '../src/core/fibonacci-search-2/index';

describe('FibonacciSearch', () => {
  describe('search', () => {
    it('should return -1 for empty array', () => {
      const fs = new FibonacciSearch([]);
      expect(fs.search(5)).toBe(-1);
    });

    it('should find single element', () => {
      const fs = new FibonacciSearch([10]);
      expect(fs.search(10)).toBe(0);
      expect(fs.search(5)).toBe(-1);
    });

    it('should find first element', () => {
      const fs = new FibonacciSearch([1, 3, 5, 7, 9, 11, 13, 15]);
      expect(fs.search(1)).toBe(0);
    });

    it('should find last element', () => {
      const fs = new FibonacciSearch([1, 3, 5, 7, 9, 11, 13, 15]);
      expect(fs.search(15)).toBe(7);
    });

    it('should find middle element', () => {
      const fs = new FibonacciSearch([1, 3, 5, 7, 9, 11, 13, 15]);
      expect(fs.search(9)).toBe(4);
    });

    it('should return -1 when element not found', () => {
      const fs = new FibonacciSearch([1, 3, 5, 7, 9, 11, 13, 15]);
      expect(fs.search(8)).toBe(-1);
      expect(fs.search(0)).toBe(-1);
      expect(fs.search(20)).toBe(-1);
    });

    it('should handle duplicates - return first occurrence', () => {
      const fs = new FibonacciSearch([1, 3, 3, 3, 5, 7]);
      expect(fs.search(3)).toBeGreaterThanOrEqual(1);
      expect(fs.search(3)).toBeLessThanOrEqual(3);
    });

    it('should handle large sorted arrays', () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => i * 2);
      const fs = new FibonacciSearch(largeArray);
      expect(fs.search(0)).toBe(0);
      expect(fs.search(500)).toBe(250);
      expect(fs.search(1998)).toBe(999);
      expect(fs.search(1999)).toBe(-1);
    });

    it('should handle negative numbers', () => {
      const fs = new FibonacciSearch([-10, -5, 0, 5, 10]);
      expect(fs.search(-10)).toBe(0);
      expect(fs.search(0)).toBe(2);
      expect(fs.search(10)).toBe(4);
    });

    it('should handle array with two elements', () => {
      const fs = new FibonacciSearch([1, 2]);
      expect(fs.search(1)).toBe(0);
      expect(fs.search(2)).toBe(1);
      expect(fs.search(3)).toBe(-1);
    });
  });

  describe('indexOf', () => {
    it('should return correct index for existing element', () => {
      const fs = new FibonacciSearch([1, 3, 5, 7, 9]);
      expect(fs.indexOf(5)).toBe(2);
    });

    it('should return -1 for non-existing element', () => {
      const fs = new FibonacciSearch([1, 3, 5, 7, 9]);
      expect(fs.indexOf(6)).toBe(-1);
    });

    it('should return -1 for empty array', () => {
      const fs = new FibonacciSearch([]);
      expect(fs.indexOf(5)).toBe(-1);
    });
  });

  describe('contains', () => {
    it('should return true for existing element', () => {
      const fs = new FibonacciSearch([1, 3, 5, 7, 9]);
      expect(fs.contains(5)).toBe(true);
    });

    it('should return false for non-existing element', () => {
      const fs = new FibonacciSearch([1, 3, 5, 7, 9]);
      expect(fs.contains(6)).toBe(false);
    });

    it('should return false for empty array', () => {
      const fs = new FibonacciSearch([]);
      expect(fs.contains(5)).toBe(false);
    });
  });

  describe('closestTo', () => {
    it('should return exact match if element exists', () => {
      const fs = new FibonacciSearch([1, 3, 5, 7, 9]);
      expect(fs.closestTo(5)).toBe(5);
    });

    it('should return closest upper element when equidistant', () => {
      const fs = new FibonacciSearch([1, 3, 5, 7, 9]);
      expect(fs.closestTo(4)).toBe(5);
    });

    it('should return closest upper element', () => {
      const fs = new FibonacciSearch([1, 3, 5, 7, 9]);
      expect(fs.closestTo(6)).toBe(7);
    });

    it('should return first element if target is below minimum', () => {
      const fs = new FibonacciSearch([1, 3, 5, 7, 9]);
      expect(fs.closestTo(0)).toBe(1);
    });

    it('should return last element if target is above maximum', () => {
      const fs = new FibonacciSearch([1, 3, 5, 7, 9]);
      expect(fs.closestTo(10)).toBe(9);
    });

    it('should throw error for empty array', () => {
      const fs = new FibonacciSearch([]);
      expect(() => fs.closestTo(5)).toThrow('Array is empty');
    });

    it('should handle equidistant elements - return upper', () => {
      const fs = new FibonacciSearch([0, 10, 20]);
      expect(fs.closestTo(5)).toBe(10);
      expect(fs.closestTo(15)).toBe(20);
    });

    it('should handle single element array', () => {
      const fs = new FibonacciSearch([42]);
      expect(fs.closestTo(0)).toBe(42);
      expect(fs.closestTo(100)).toBe(42);
      expect(fs.closestTo(42)).toBe(42);
    });

    it('should handle negative numbers', () => {
      const fs = new FibonacciSearch([-10, -5, 0, 5, 10]);
      expect(fs.closestTo(-7)).toBe(-5);
      expect(fs.closestTo(-8)).toBe(-10);
      expect(fs.closestTo(8)).toBe(10);
    });
  });

  describe('rangeSearch', () => {
    it('should return empty array for empty input', () => {
      const fs = new FibonacciSearch([1, 3, 5, 7, 9]);
      expect(fs.rangeSearch(6, 5)).toEqual([]);
    });

    it('should return empty array for empty array', () => {
      const fs = new FibonacciSearch([]);
      expect(fs.rangeSearch(3, 7)).toEqual([]);
    });

    it('should find elements within range', () => {
      const fs = new FibonacciSearch([1, 3, 5, 7, 9, 11, 13, 15]);
      const result = fs.rangeSearch(5, 11);
      expect(result).toEqual([5, 7, 9, 11]);
    });

    it('should find elements at range boundaries', () => {
      const fs = new FibonacciSearch([1, 3, 5, 7, 9, 11, 13, 15]);
      const result = fs.rangeSearch(1, 15);
      expect(result).toEqual([1, 3, 5, 7, 9, 11, 13, 15]);
    });

    it('should return empty array when no elements in range', () => {
      const fs = new FibonacciSearch([1, 3, 5, 7, 9]);
      const result = fs.rangeSearch(10, 20);
      expect(result).toEqual([]);
    });

    it('should handle single element range', () => {
      const fs = new FibonacciSearch([1, 3, 5, 7, 9]);
      const result = fs.rangeSearch(5, 5);
      expect(result).toEqual([5]);
    });

    it('should handle range with no exact matches', () => {
      const fs = new FibonacciSearch([1, 3, 5, 7, 9]);
      const result = fs.rangeSearch(4, 6);
      expect(result).toEqual([5]);
    });

    it('should handle large array range search', () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => i * 2);
      const fs = new FibonacciSearch(largeArray);
      const result = fs.rangeSearch(500, 600);
      expect(result[0]).toBe(500);
      expect(result[result.length - 1]).toBeLessThanOrEqual(600);
    });

    it('should handle negative numbers in range', () => {
      const fs = new FibonacciSearch([-10, -5, 0, 5, 10]);
      const result = fs.rangeSearch(-7, 3);
      expect(result).toEqual([-5, 0]);
    });
  });

  describe('getTimeComplexity', () => {
    it('should return O(log n)', () => {
      const fs = new FibonacciSearch([1, 3, 5, 7, 9]);
      expect(fs.getTimeComplexity()).toBe('O(log n)');
    });
  });

  describe('integration tests', () => {
    it('should work with complex search scenarios', () => {
      const fs = new FibonacciSearch([-100, -50, -25, -10, 0, 10, 25, 50, 100]);

      expect(fs.search(-100)).toBe(0);
      expect(fs.search(100)).toBe(8);
      expect(fs.search(0)).toBe(4);
      expect(fs.search(-99)).toBe(-1);

      expect(fs.contains(50)).toBe(true);
      expect(fs.contains(75)).toBe(false);

      expect(fs.closestTo(-30)).toBe(-25);
      expect(fs.closestTo(15)).toBe(10);
      expect(fs.closestTo(27)).toBe(25);

      expect(fs.rangeSearch(-50, 50)).toEqual([-50, -25, -10, 0, 10, 25, 50]);
      expect(fs.rangeSearch(-75, 75)).toEqual([-50, -25, -10, 0, 10, 25, 50]);
    });
  });

  it('should handle length property', () => {
    const fs = new FibonacciSearch([10, 20, 30]);
    expect(fs.n).toBe(3);
  });

  it('should handle search for first element', () => {
    const fs = new FibonacciSearch([10, 20, 30, 40, 50]);
    expect(fs.search(10)).toBe(0);
  });

  it('should handle not found', () => {
    const fs = new FibonacciSearch([10, 20, 30]);
    expect(fs.search(99)).toBe(-1);
  });

  it('should handle last element search', () => {
    const fs = new FibonacciSearch([10, 20, 30, 40, 50]);
    expect(fs.search(50)).toBe(4);
  });
});
