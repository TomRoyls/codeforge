import { describe, it, expect } from 'vitest';
import { InterpolationSearch } from '../src/core/interpolation-search/index';

describe('InterpolationSearch', () => {
  describe('search', () => {
    it.skip('should return -1 for empty array', () => {
      const search = new InterpolationSearch([]);
      expect(search.search(5)).toBe(-1);
    });

    it('should find element in single element array', () => {
      const search = new InterpolationSearch([5]);
      expect(search.search(5)).toBe(0);
      expect(search.search(3)).toBe(-1);
    });

    it('should find first element', () => {
      const search = new InterpolationSearch([1, 2, 3, 4, 5]);
      expect(search.search(1)).toBe(0);
    });

    it('should find last element', () => {
      const search = new InterpolationSearch([1, 2, 3, 4, 5]);
      expect(search.search(5)).toBe(4);
    });

    it('should find middle element', () => {
      const search = new InterpolationSearch([1, 2, 3, 4, 5]);
      expect(search.search(3)).toBe(2);
    });

    it('should find element in uniform distribution', () => {
      const search = new InterpolationSearch([10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
      expect(search.search(10)).toBe(0);
      expect(search.search(50)).toBe(4);
      expect(search.search(100)).toBe(9);
      expect(search.search(70)).toBe(6);
    });

    it('should find element in non-uniform distribution', () => {
      const search = new InterpolationSearch([1, 2, 4, 8, 16, 32, 64, 128]);
      expect(search.search(1)).toBe(0);
      expect(search.search(8)).toBe(3);
      expect(search.search(64)).toBe(6);
      expect(search.search(128)).toBe(7);
    });

    it('should return -1 for element not found', () => {
      const search = new InterpolationSearch([1, 3, 5, 7, 9]);
      expect(search.search(2)).toBe(-1);
      expect(search.search(4)).toBe(-1);
      expect(search.search(10)).toBe(-1);
      expect(search.search(0)).toBe(-1);
    });

    it('should handle duplicates - return first occurrence', () => {
      const search = new InterpolationSearch([1, 2, 2, 2, 3, 4, 5]);
      expect(search.search(2)).toBe(1);
    });

    it('should handle large array', () => {
      const largeArray: number[] = [];
      for (let i = 0; i < 10000; i++) {
        largeArray.push(i * 2);
      }
      const search = new InterpolationSearch(largeArray);
      expect(search.search(0)).toBe(0);
      expect(search.search(10000)).toBe(5000);
      expect(search.search(19998)).toBe(9999);
      expect(search.search(12345)).toBe(-1);
    });

    it('should work with negative numbers', () => {
      const search = new InterpolationSearch([-10, -5, 0, 5, 10]);
      expect(search.search(-10)).toBe(0);
      expect(search.search(0)).toBe(2);
      expect(search.search(10)).toBe(4);
      expect(search.search(-3)).toBe(-1);
    });

    it('should work with decimal numbers', () => {
      const search = new InterpolationSearch([1.1, 2.2, 3.3, 4.4, 5.5]);
      expect(search.search(1.1)).toBe(0);
      expect(search.search(3.3)).toBe(2);
      expect(search.search(5.5)).toBe(4);
      expect(search.search(2.5)).toBe(-1);
    });
  });

  describe('indexOf', () => {
    it('should be alias for search', () => {
      const search = new InterpolationSearch([1, 2, 3, 4, 5]);
      expect(search.indexOf(3)).toBe(2);
      expect(search.indexOf(6)).toBe(-1);
    });
  });

  describe('contains', () => {
    it('should return true for existing element', () => {
      const search = new InterpolationSearch([1, 2, 3, 4, 5]);
      expect(search.contains(3)).toBe(true);
      expect(search.contains(1)).toBe(true);
      expect(search.contains(5)).toBe(true);
    });

    it('should return false for non-existing element', () => {
      const search = new InterpolationSearch([1, 2, 3, 4, 5]);
      expect(search.contains(6)).toBe(false);
      expect(search.contains(0)).toBe(false);
      expect(search.contains(2.5)).toBe(false);
    });
  });

  describe('closestTo', () => {
    it('should throw error for empty array', () => {
      const search = new InterpolationSearch([]);
      expect(() => search.closestTo(5)).toThrow('Array is empty');
    });

    it('should return exact match if exists', () => {
      const search = new InterpolationSearch([1, 3, 5, 7, 9]);
      expect(search.closestTo(5)).toBe(5);
      expect(search.closestTo(1)).toBe(1);
    });

    it('should return closest value when no exact match - lower', () => {
      const search = new InterpolationSearch([1, 3, 5, 7, 9]);
      expect(search.closestTo(2)).toBe(1);
      expect(search.closestTo(4)).toBe(3);
    });

    it('should return closest value when no exact match - higher', () => {
      const search = new InterpolationSearch([1, 3, 5, 7, 9]);
      expect(search.closestTo(8)).toBe(9);
      expect(search.closestTo(6)).toBe(5);
    });

    it('should handle tie by returning lower value', () => {
      const search = new InterpolationSearch([1, 3, 5, 7, 9]);
      expect(search.closestTo(4)).toBe(3);
      expect(search.closestTo(6)).toBe(5);
    });

    it('should work with negative numbers', () => {
      const search = new InterpolationSearch([-10, -5, 0, 5, 10]);
      expect(search.closestTo(-3)).toBe(-5);
      expect(search.closestTo(2)).toBe(0);
      expect(search.closestTo(8)).toBe(10);
    });

    it('should work with single element array', () => {
      const search = new InterpolationSearch([5]);
      expect(search.closestTo(3)).toBe(5);
      expect(search.closestTo(7)).toBe(5);
    });
  });

  describe('rangeSearch', () => {
    it('should return empty array for no matches', () => {
      const search = new InterpolationSearch([1, 3, 5, 7, 9]);
      expect(search.rangeSearch(10, 20)).toEqual([]);
      expect(search.rangeSearch(2, 2)).toEqual([]);
    });

    it('should return all elements within range', () => {
      const search = new InterpolationSearch([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      const result = search.rangeSearch(3, 7);
      expect(result).toEqual([3, 4, 5, 6, 7]);
    });

    it('should include boundary values', () => {
      const search = new InterpolationSearch([1, 3, 5, 7, 9]);
      const result = search.rangeSearch(3, 7);
      expect(result).toEqual([3, 5, 7]);
    });

    it('should handle range outside array bounds', () => {
      const search = new InterpolationSearch([1, 3, 5, 7, 9]);
      const result = search.rangeSearch(-10, 10);
      expect(result).toEqual([1, 3, 5, 7, 9]);
    });

    it('should work with empty array', () => {
      const search = new InterpolationSearch([]);
      expect(search.rangeSearch(1, 10)).toEqual([]);
    });

    it('should work with single element', () => {
      const search = new InterpolationSearch([5]);
      expect(search.rangeSearch(3, 7)).toEqual([5]);
      expect(search.rangeSearch(1, 3)).toEqual([]);
    });

    it('should work with negative numbers', () => {
      const search = new InterpolationSearch([-10, -5, 0, 5, 10]);
      const result = search.rangeSearch(-7, 3);
      expect(result).toEqual([-5, 0]);
    });
  });

  describe('insert', () => {
    it('should insert into empty array', () => {
      const search = new InterpolationSearch([]);
      const index = search.insert(5);
      expect(index).toBe(0);
      expect(search.contains(5)).toBe(true);
    });

    it('should insert at beginning', () => {
      const search = new InterpolationSearch([2, 3, 4]);
      const index = search.insert(1);
      expect(index).toBe(0);
      expect(search.indexOf(1)).toBe(0);
    });

    it('should insert at end', () => {
      const search = new InterpolationSearch([1, 2, 3]);
      const index = search.insert(4);
      expect(index).toBe(3);
      expect(search.indexOf(4)).toBe(3);
    });

    it('should insert in middle', () => {
      const search = new InterpolationSearch([1, 3, 5]);
      const index = search.insert(2);
      expect(index).toBe(1);
      expect(search.indexOf(2)).toBe(1);
    });

    it('should insert duplicate', () => {
      const search = new InterpolationSearch([1, 2, 3]);
      const index = search.insert(2);
      expect(index).toBe(1);
      expect(search.rangeSearch(2, 2).length).toBe(2);
    });

    it('should insert negative number', () => {
      const search = new InterpolationSearch([0, 1, 2]);
      const index = search.insert(-1);
      expect(index).toBe(0);
      expect(search.indexOf(-1)).toBe(0);
    });

    it('should insert decimal', () => {
      const search = new InterpolationSearch([1.0, 2.0, 3.0]);
      const index = search.insert(1.5);
      expect(index).toBe(1);
      expect(search.indexOf(1.5)).toBe(1);
    });

    it('should maintain sorted order after multiple inserts', () => {
      const search = new InterpolationSearch([]);
      search.insert(5);
      search.insert(2);
      search.insert(8);
      search.insert(1);
      search.insert(10);
      expect(search.indexOf(1)).toBe(0);
      expect(search.indexOf(2)).toBe(1);
      expect(search.indexOf(5)).toBe(2);
      expect(search.indexOf(8)).toBe(3);
      expect(search.indexOf(10)).toBe(4);
    });
  });

  describe('getTimeComplexity', () => {
    it('should return correct time complexity string', () => {
      const search = new InterpolationSearch([1, 2, 3]);
      expect(search.getTimeComplexity()).toBe('Average: O(log(log(n))), Worst: O(n))');
    });
  });
});
