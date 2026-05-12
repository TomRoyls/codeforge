import { describe, it, expect } from 'vitest';
import { GallopingSearch } from '../src/core/galloping-search/index.js';

describe('GallopingSearch', () => {
  describe('constructor', () => {
    it('should initialize with empty array', () => {
      const gs = new GallopingSearch<number>([]);
      expect(gs.contains(5)).toBe(false);
    });

    it('should initialize with single element', () => {
      const gs = new GallopingSearch<number>([5]);
      expect(gs.contains(5)).toBe(true);
      expect(gs.contains(10)).toBe(false);
    });

    it('should initialize with multiple sorted elements', () => {
      const gs = new GallopingSearch<number>([1, 3, 5, 7, 9]);
      expect(gs.contains(1)).toBe(true);
      expect(gs.contains(5)).toBe(true);
      expect(gs.contains(9)).toBe(true);
      expect(gs.contains(2)).toBe(false);
    });

    it('should use custom comparator for objects', () => {
      const arr = [{ id: 1 }, { id: 3 }, { id: 5 }];
      const gs = new GallopingSearch(arr, (a, b) => a.id - b.id);
      expect(gs.contains({ id: 3 })).toBe(true);
      expect(gs.contains({ id: 2 })).toBe(false);
    });
  });

  describe('search', () => {
    it('should return -1 for empty array', () => {
      const gs = new GallopingSearch<number>([]);
      expect(gs.search(5)).toBe(-1);
    });

    it('should find single element', () => {
      const gs = new GallopingSearch<number>([5]);
      expect(gs.search(5)).toBe(0);
    });

    it('should find first element', () => {
      const gs = new GallopingSearch<number>([1, 2, 3, 4, 5]);
      expect(gs.search(1)).toBe(0);
    });

    it('should find last element', () => {
      const gs = new GallopingSearch<number>([1, 2, 3, 4, 5]);
      expect(gs.search(5)).toBe(4);
    });

    it('should find middle element', () => {
      const gs = new GallopingSearch<number>([1, 2, 3, 4, 5]);
      expect(gs.search(3)).toBe(2);
    });

    it('should return -1 for non-existent element', () => {
      const gs = new GallopingSearch<number>([1, 2, 3, 4, 5]);
      expect(gs.search(10)).toBe(-1);
    });

    it('should return -1 for element less than min', () => {
      const gs = new GallopingSearch<number>([10, 20, 30, 40, 50]);
      expect(gs.search(5)).toBe(-1);
    });

    it('should return -1 for element greater than max', () => {
      const gs = new GallopingSearch<number>([10, 20, 30, 40, 50]);
      expect(gs.search(100)).toBe(-1);
    });

    it('should work with string values', () => {
      const gs = new GallopingSearch<string>(['apple', 'banana', 'cherry', 'date']);
      expect(gs.search('banana')).toBe(1);
      expect(gs.search('date')).toBe(3);
      expect(gs.search('grape')).toBe(-1);
    });

    it('should handle large sorted array', () => {
      const arr = Array.from({ length: 10000 }, (_, i) => i * 2);
      const gs = new GallopingSearch<number>(arr);
      expect(gs.search(0)).toBe(0);
      expect(gs.search(1000)).toBe(500);
      expect(gs.search(19998)).toBe(9999);
      expect(gs.search(19999)).toBe(-1);
    });
  });

  describe('searchRange', () => {
    it('should return [-1, -1] for empty array', () => {
      const gs = new GallopingSearch<number>([]);
      expect(gs.searchRange(5)).toEqual([-1, -1]);
    });

    it('should return [0, 0] for single element found', () => {
      const gs = new GallopingSearch<number>([5]);
      expect(gs.searchRange(5)).toEqual([0, 0]);
    });

    it('should return [-1, -1] for single element not found', () => {
      const gs = new GallopingSearch<number>([5]);
      expect(gs.searchRange(10)).toEqual([-1, -1]);
    });

    it('should return first and last occurrence of duplicates', () => {
      const gs = new GallopingSearch<number>([1, 2, 2, 2, 3, 4]);
      expect(gs.searchRange(2)).toEqual([1, 3]);
    });

    it('should handle single duplicate', () => {
      const gs = new GallopingSearch<number>([1, 2, 3, 4]);
      expect(gs.searchRange(2)).toEqual([1, 1]);
    });

    it('should return [-1, -1] for non-existent element', () => {
      const gs = new GallopingSearch<number>([1, 2, 3, 4, 5]);
      expect(gs.searchRange(10)).toEqual([-1, -1]);
    });

    it('should handle all duplicates', () => {
      const gs = new GallopingSearch<number>([5, 5, 5, 5, 5]);
      expect(gs.searchRange(5)).toEqual([0, 4]);
    });

    it('should find range at start of array', () => {
      const gs = new GallopingSearch<number>([1, 1, 1, 2, 3, 4]);
      expect(gs.searchRange(1)).toEqual([0, 2]);
    });

    it('should find range at end of array', () => {
      const gs = new GallopingSearch<number>([1, 2, 3, 4, 4, 4]);
      expect(gs.searchRange(4)).toEqual([3, 5]);
    });

    it('should handle large number of duplicates', () => {
      const arr = [...Array(100).fill(5), 6, ...Array(100).fill(5)];
      const gs = new GallopingSearch<number>(arr);
      expect(gs.searchRange(5)).toEqual([0, 99]);
    });
  });

  describe('insert', () => {
    it('should insert into empty array', () => {
      const gs = new GallopingSearch<number>([]);
      const index = gs.insert(5);
      expect(index).toBe(0);
      expect(gs.contains(5)).toBe(true);
    });

    it('should insert at beginning', () => {
      const gs = new GallopingSearch<number>([5, 10, 15]);
      const index = gs.insert(2);
      expect(index).toBe(0);
      expect(gs.contains(2)).toBe(true);
    });

    it('should insert at end', () => {
      const gs = new GallopingSearch<number>([5, 10, 15]);
      const index = gs.insert(20);
      expect(index).toBe(3);
      expect(gs.contains(20)).toBe(true);
    });

    it('should insert in middle', () => {
      const gs = new GallopingSearch<number>([5, 10, 15]);
      const index = gs.insert(12);
      expect(index).toBe(2);
      expect(gs.contains(12)).toBe(true);
    });

    it('should insert before existing', () => {
      const gs = new GallopingSearch<number>([5, 10, 15]);
      const index = gs.insert(7);
      expect(index).toBe(1);
      expect(gs.contains(7)).toBe(true);
    });

    it('should insert after existing', () => {
      const gs = new GallopingSearch<number>([5, 10, 15]);
      const index = gs.insert(12);
      expect(index).toBe(2);
      expect(gs.contains(12)).toBe(true);
    });

    it('should handle string values', () => {
      const gs = new GallopingSearch<string>(['apple', 'cherry']);
      const index = gs.insert('banana');
      expect(index).toBe(1);
      expect(gs.contains('banana')).toBe(true);
    });

    it('should insert duplicate', () => {
      const gs = new GallopingSearch<number>([5, 10, 15]);
      const index = gs.insert(10);
      expect(index).toBe(1);
      expect(gs.searchRange(10)).toEqual([1, 2]);
    });
  });

  describe('contains', () => {
    it('should return false for empty array', () => {
      const gs = new GallopingSearch<number>([]);
      expect(gs.contains(5)).toBe(false);
    });

    it('should return true for existing element', () => {
      const gs = new GallopingSearch<number>([1, 2, 3, 4, 5]);
      expect(gs.contains(3)).toBe(true);
    });

    it('should return false for non-existent element', () => {
      const gs = new GallopingSearch<number>([1, 2, 3, 4, 5]);
      expect(gs.contains(10)).toBe(false);
    });

    it('should work with strings', () => {
      const gs = new GallopingSearch<string>(['apple', 'banana', 'cherry']);
      expect(gs.contains('banana')).toBe(true);
      expect(gs.contains('date')).toBe(false);
    });
  });

  describe('indexOf', () => {
    it('should return -1 for empty array', () => {
      const gs = new GallopingSearch<number>([]);
      expect(gs.indexOf(5)).toBe(-1);
    });

    it('should return index of existing element', () => {
      const gs = new GallopingSearch<number>([10, 20, 30, 40, 50]);
      expect(gs.indexOf(30)).toBe(2);
    });

    it('should return -1 for non-existent element', () => {
      const gs = new GallopingSearch<number>([10, 20, 30, 40, 50]);
      expect(gs.indexOf(25)).toBe(-1);
    });

    it('should match search method', () => {
      const gs = new GallopingSearch<number>([1, 2, 3, 4, 5]);
      expect(gs.indexOf(3)).toBe(gs.search(3));
      expect(gs.indexOf(10)).toBe(gs.search(10));
    });
  });

  describe('getTimeComplexity', () => {
    it('should return correct time complexity string', () => {
      const gs = new GallopingSearch<number>([1, 2, 3]);
      const complexity = gs.getTimeComplexity();
      expect(complexity).toContain('O(log n)');
      expect(complexity).toContain('Exponential');
      expect(complexity).toContain('binary');
    });
  });

  describe('custom comparator', () => {
    it('should work with object custom comparator', () => {
      const arr = [
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 30 },
        { name: 'Charlie', age: 35 }
      ];
      const gs = new GallopingSearch(arr, (a, b) => a.age - b.age);
      expect(gs.contains({ name: 'Bob', age: 30 })).toBe(true);
      expect(gs.contains({ name: 'David', age: 40 })).toBe(false);
    });

    it('should work with descending order comparator', () => {
      const arr = [5, 4, 3, 2, 1];
      const gs = new GallopingSearch(arr, (a, b) => b - a);
      expect(gs.contains(5)).toBe(true);
      expect(gs.contains(1)).toBe(true);
      expect(gs.contains(3)).toBe(true);
    });

    it('should work with string length comparator', () => {
      const arr = ['a', 'ab', 'abc', 'abcd'];
      const gs = new GallopingSearch(arr, (a, b) => a.length - b.length);
      expect(gs.contains('abc')).toBe(true);
      expect(gs.contains('xyz')).toBe(true);
      expect(gs.contains('abcde')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle very large array', () => {
      const arr = Array.from({ length: 100000 }, (_, i) => i);
      const gs = new GallopingSearch<number>(arr);
      expect(gs.search(0)).toBe(0);
      expect(gs.search(50000)).toBe(50000);
      expect(gs.search(99999)).toBe(99999);
      expect(gs.search(100000)).toBe(-1);
    });

    it('should handle negative numbers', () => {
      const gs = new GallopingSearch<number>([-10, -5, 0, 5, 10]);
      expect(gs.search(-10)).toBe(0);
      expect(gs.search(0)).toBe(2);
      expect(gs.search(10)).toBe(4);
      expect(gs.search(-3)).toBe(-1);
    });

    it('should handle single element array with insert', () => {
      const gs = new GallopingSearch<number>([5]);
      const idx1 = gs.insert(3);
      const idx2 = gs.insert(7);
      expect(idx1).toBe(0);
      expect(idx2).toBe(2);
      expect(gs.search(3)).toBe(0);
      expect(gs.search(5)).toBe(1);
      expect(gs.search(7)).toBe(2);
    });

    it('should maintain sorted order after multiple inserts', () => {
      const gs = new GallopingSearch<number>([10, 30]);
      gs.insert(20);
      gs.insert(5);
      gs.insert(40);
      gs.insert(25);
      expect(gs.search(5)).toBe(0);
      expect(gs.search(10)).toBe(1);
      expect(gs.search(20)).toBe(2);
      expect(gs.search(25)).toBe(3);
      expect(gs.search(30)).toBe(4);
      expect(gs.search(40)).toBe(5);
    });
  });
});
