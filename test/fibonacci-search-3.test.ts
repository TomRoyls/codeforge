import { describe, it, expect } from 'vitest';
import { FibonacciSearch3 } from '../src/core/fibonacci-search-3/index.js';

describe('FibonacciSearch3', () => {
  describe('search', () => {
    it('should return -1 for empty array', () => {
      const searcher = new FibonacciSearch3<number>();
      expect(searcher.search([], 5)).toBe(-1);
    });

    it('should return index for single element array when found', () => {
      const searcher = new FibonacciSearch3<number>();
      expect(searcher.search([5], 5)).toBe(0);
    });

    it('should return -1 for single element array when not found', () => {
      const searcher = new FibonacciSearch3<number>();
      expect(searcher.search([5], 3)).toBe(-1);
    });

    it('should find element in middle of array', () => {
      const searcher = new FibonacciSearch3<number>();
      expect(searcher.search([1, 3, 5, 7, 9], 5)).toBe(2);
    });

    it('should find first element', () => {
      const searcher = new FibonacciSearch3<number>();
      expect(searcher.search([1, 3, 5, 7, 9], 1)).toBe(0);
    });

    it('should find last element', () => {
      const searcher = new FibonacciSearch3<number>();
      expect(searcher.search([1, 3, 5, 7, 9], 9)).toBe(4);
    });

    it('should return -1 when element not in array', () => {
      const searcher = new FibonacciSearch3<number>();
      expect(searcher.search([1, 3, 5, 7, 9], 4)).toBe(-1);
    });

    it('should work with negative numbers', () => {
      const searcher = new FibonacciSearch3<number>();
      expect(searcher.search([-10, -5, 0, 5, 10], -5)).toBe(1);
      expect(searcher.search([-10, -5, 0, 5, 10], 0)).toBe(2);
      expect(searcher.search([-10, -5, 0, 5, 10], 10)).toBe(4);
    });

    it('should work with large array', () => {
      const searcher = new FibonacciSearch3<number>();
      const largeArray = Array.from({ length: 10000 }, (_, i) => i);
      expect(searcher.search(largeArray, 5000)).toBe(5000);
      expect(searcher.search(largeArray, 9999)).toBe(9999);
      expect(searcher.search(largeArray, 0)).toBe(0);
      expect(searcher.search(largeArray, 10001)).toBe(-1);
    });

    it('should handle duplicates by returning any matching index', () => {
      const searcher = new FibonacciSearch3<number>();
      const result = searcher.search([1, 2, 2, 2, 3, 4], 2);
      expect([1, 2, 3]).toContain(result);
    });

    it('should work with strings using custom comparator', () => {
      const searcher = new FibonacciSearch3<string>((a, b) => a.localeCompare(b));
      expect(searcher.search(['apple', 'banana', 'cherry', 'date'], 'cherry')).toBe(2);
      expect(searcher.search(['apple', 'banana', 'cherry', 'date'], 'fig')).toBe(-1);
    });

    it('should work with single character strings', () => {
      const searcher = new FibonacciSearch3<string>((a, b) => a.localeCompare(b));
      expect(searcher.search(['a', 'b', 'c', 'd', 'e'], 'c')).toBe(2);
    });

    it('should handle array with two elements', () => {
      const searcher = new FibonacciSearch3<number>();
      expect(searcher.search([1, 2], 1)).toBe(0);
      expect(searcher.search([1, 2], 2)).toBe(1);
      expect(searcher.search([1, 2], 3)).toBe(-1);
    });

    it('should handle array with three elements', () => {
      const searcher = new FibonacciSearch3<number>();
      expect(searcher.search([1, 2, 3], 1)).toBe(0);
      expect(searcher.search([1, 2, 3], 2)).toBe(1);
      expect(searcher.search([1, 2, 3], 3)).toBe(2);
    });

    it('should work with fibonacci-sized array', () => {
      const searcher = new FibonacciSearch3<number>();
      const fibArray = [1, 2, 3, 5, 8, 13, 21, 34];
      expect(searcher.search(fibArray, 8)).toBe(4);
      expect(searcher.search(fibArray, 21)).toBe(6);
    });

    it('should handle zero in array', () => {
      const searcher = new FibonacciSearch3<number>();
      expect(searcher.search([-5, 0, 5], 0)).toBe(1);
    });
  });

  describe('searchFirst', () => {
    it('should return -1 for empty array', () => {
      const searcher = new FibonacciSearch3<number>();
      expect(searcher.searchFirst([], 5)).toBe(-1);
    });

    it('should return index for single element array when found', () => {
      const searcher = new FibonacciSearch3<number>();
      expect(searcher.searchFirst([5], 5)).toBe(0);
    });

    it('should return -1 for single element array when not found', () => {
      const searcher = new FibonacciSearch3<number>();
      expect(searcher.searchFirst([5], 3)).toBe(-1);
    });

    it('should return first occurrence of duplicate elements', () => {
      const searcher = new FibonacciSearch3<number>();
      expect(searcher.searchFirst([1, 2, 2, 2, 3], 2)).toBe(1);
    });

    it('should return first index when all elements are the same', () => {
      const searcher = new FibonacciSearch3<number>();
      expect(searcher.searchFirst([5, 5, 5, 5, 5], 5)).toBe(0);
    });

    it('should return -1 when element not in array with duplicates', () => {
      const searcher = new FibonacciSearch3<number>();
      expect(searcher.searchFirst([1, 2, 2, 2, 3], 4)).toBe(-1);
    });

    it('should work with strings and custom comparator', () => {
      const searcher = new FibonacciSearch3<string>((a, b) => a.localeCompare(b));
      expect(searcher.searchFirst(['a', 'b', 'b', 'b', 'c'], 'b')).toBe(1);
    });

    it('should work with large array containing duplicates', () => {
      const searcher = new FibonacciSearch3<number>();
      const largeArray = [...Array(5000).fill(1), ...Array(5000).fill(2)];
      expect(searcher.searchFirst(largeArray, 2)).toBe(5000);
      expect(searcher.searchFirst(largeArray, 1)).toBe(0);
    });

    it('should handle duplicates at the beginning', () => {
      const searcher = new FibonacciSearch3<number>();
      expect(searcher.searchFirst([1, 1, 1, 2, 3, 4], 1)).toBe(0);
    });

    it('should handle duplicates at the end', () => {
      const searcher = new FibonacciSearch3<number>();
      expect(searcher.searchFirst([1, 2, 3, 4, 4, 4], 4)).toBe(3);
    });

    it('should work with negative numbers and duplicates', () => {
      const searcher = new FibonacciSearch3<number>();
      expect(searcher.searchFirst([-3, -3, -2, -2, 0, 1], -2)).toBe(2);
    });
  });

  describe('searchLast', () => {
    it('should return -1 for empty array', () => {
      const searcher = new FibonacciSearch3<number>();
      expect(searcher.searchLast([], 5)).toBe(-1);
    });

    it('should return index for single element array when found', () => {
      const searcher = new FibonacciSearch3<number>();
      expect(searcher.searchLast([5], 5)).toBe(0);
    });

    it('should return -1 for single element array when not found', () => {
      const searcher = new FibonacciSearch3<number>();
      expect(searcher.searchLast([5], 3)).toBe(-1);
    });

    it('should return last occurrence of duplicate elements', () => {
      const searcher = new FibonacciSearch3<number>();
      expect(searcher.searchLast([1, 2, 2, 2, 3], 2)).toBe(3);
    });

    it('should return last index when all elements are the same', () => {
      const searcher = new FibonacciSearch3<number>();
      expect(searcher.searchLast([5, 5, 5, 5, 5], 5)).toBe(4);
    });

    it('should return -1 when element not in array with duplicates', () => {
      const searcher = new FibonacciSearch3<number>();
      expect(searcher.searchLast([1, 2, 2, 2, 3], 4)).toBe(-1);
    });

    it('should work with strings and custom comparator', () => {
      const searcher = new FibonacciSearch3<string>((a, b) => a.localeCompare(b));
      expect(searcher.searchLast(['a', 'b', 'b', 'b', 'c'], 'b')).toBe(3);
    });

    it('should work with large array containing duplicates', () => {
      const searcher = new FibonacciSearch3<number>();
      const largeArray = [...Array(5000).fill(1), ...Array(5000).fill(2)];
      expect(searcher.searchLast(largeArray, 2)).toBe(9999);
      expect(searcher.searchLast(largeArray, 1)).toBe(4999);
    });

    it('should handle duplicates at the beginning', () => {
      const searcher = new FibonacciSearch3<number>();
      expect(searcher.searchLast([1, 1, 1, 2, 3, 4], 1)).toBe(2);
    });

    it('should handle duplicates at the end', () => {
      const searcher = new FibonacciSearch3<number>();
      expect(searcher.searchLast([1, 2, 3, 4, 4, 4], 4)).toBe(5);
    });

    it('should work with negative numbers and duplicates', () => {
      const searcher = new FibonacciSearch3<number>();
      expect(searcher.searchLast([-3, -3, -2, -2, 0, 1], -2)).toBe(3);
    });
  });

  describe('searchRange', () => {
    it('should return [-1, -1] for empty array', () => {
      const searcher = new FibonacciSearch3<number>();
      expect(searcher.searchRange([], 5)).toEqual([-1, -1]);
    });

    it('should return [0, 0] for single element array when found', () => {
      const searcher = new FibonacciSearch3<number>();
      expect(searcher.searchRange([5], 5)).toEqual([0, 0]);
    });

    it('should return [-1, -1] for single element array when not found', () => {
      const searcher = new FibonacciSearch3<number>();
      expect(searcher.searchRange([5], 3)).toEqual([-1, -1]);
    });

    it('should return range for duplicate elements', () => {
      const searcher = new FibonacciSearch3<number>();
      expect(searcher.searchRange([1, 2, 2, 2, 3], 2)).toEqual([1, 3]);
    });

    it('should return [i, i] for single occurrence', () => {
      const searcher = new FibonacciSearch3<number>();
      expect(searcher.searchRange([1, 2, 3, 4, 5], 3)).toEqual([2, 2]);
    });

    it('should return [0, n-1] when all elements are the same', () => {
      const searcher = new FibonacciSearch3<number>();
      expect(searcher.searchRange([5, 5, 5, 5, 5], 5)).toEqual([0, 4]);
    });

    it('should return [-1, -1] when element not in array', () => {
      const searcher = new FibonacciSearch3<number>();
      expect(searcher.searchRange([1, 2, 3, 4, 5], 6)).toEqual([-1, -1]);
    });

    it('should work with strings and custom comparator', () => {
      const searcher = new FibonacciSearch3<string>((a, b) => a.localeCompare(b));
      expect(searcher.searchRange(['a', 'b', 'b', 'b', 'c'], 'b')).toEqual([1, 3]);
    });

    it('should work with large array containing duplicates', () => {
      const searcher = new FibonacciSearch3<number>();
      const largeArray = [...Array(5000).fill(1), ...Array(5000).fill(2)];
      expect(searcher.searchRange(largeArray, 2)).toEqual([5000, 9999]);
      expect(searcher.searchRange(largeArray, 1)).toEqual([0, 4999]);
    });

    it('should handle duplicates at the beginning', () => {
      const searcher = new FibonacciSearch3<number>();
      expect(searcher.searchRange([1, 1, 1, 2, 3, 4], 1)).toEqual([0, 2]);
    });

    it('should handle duplicates at the end', () => {
      const searcher = new FibonacciSearch3<number>();
      expect(searcher.searchRange([1, 2, 3, 4, 4, 4], 4)).toEqual([3, 5]);
    });

    it('should work with negative numbers and duplicates', () => {
      const searcher = new FibonacciSearch3<number>();
      expect(searcher.searchRange([-3, -3, -2, -2, 0, 1], -2)).toEqual([2, 3]);
    });

    it('should handle range at boundaries', () => {
      const searcher = new FibonacciSearch3<number>();
      expect(searcher.searchRange([1, 1, 2, 3, 4, 5], 1)).toEqual([0, 1]);
      expect(searcher.searchRange([1, 2, 3, 4, 5, 5, 5], 5)).toEqual([4, 6]);
    });
  });

  describe('custom comparator', () => {
    it('should work with descending order comparator', () => {
      const searcher = new FibonacciSearch3<number>((a, b) => b - a);
      expect(searcher.search([9, 7, 5, 3, 1], 5)).toBe(2);
    });

    it('should work with object comparator', () => {
      const searcher = new FibonacciSearch3<{ id: number }>((a, b) => a.id - b.id);
      const arr = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
      expect(searcher.search(arr, { id: 3 })).toBe(2);
    });

    it('should work with string length comparator', () => {
      const searcher = new FibonacciSearch3<string>((a, b) => a.length - b.length);
      expect(searcher.search(['a', 'ab', 'abc', 'abcd'], 'abc')).toBe(2);
    });
  });
});
