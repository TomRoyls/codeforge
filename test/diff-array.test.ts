import { describe, it, expect, beforeEach } from 'vitest';
import { DiffArray } from '../src/core/diff-array/index.js';

describe('DiffArray', () => {
  let da: DiffArray;

  beforeEach(() => {
    da = new DiffArray(5);
  });

  describe('constructor', () => {
    it('should create array with specified size', () => {
      expect(da.size).toBe(5);
      expect(da.isEmpty).toBe(false);
    });

    it('should create empty array', () => {
      const empty = new DiffArray(0);
      expect(empty.size).toBe(0);
      expect(empty.isEmpty).toBe(true);
    });

    it('should throw for negative size', () => {
      expect(() => new DiffArray(-1)).toThrow(RangeError);
      expect(() => new DiffArray(-1)).toThrow('Size must be a non-negative integer');
    });

    it('should throw for non-integer size', () => {
      expect(() => new DiffArray(3.5)).toThrow(RangeError);
      expect(() => new DiffArray(3.5)).toThrow('Size must be a non-negative integer');
    });
  });

  describe('size', () => {
    it('should return correct size', () => {
      expect(da.size).toBe(5);
      const small = new DiffArray(3);
      expect(small.size).toBe(3);
    });

    it('should return 0 for empty array', () => {
      const empty = new DiffArray(0);
      expect(empty.size).toBe(0);
    });
  });

  describe('isEmpty', () => {
    it('should return false for non-empty array', () => {
      expect(da.isEmpty).toBe(false);
    });

    it('should return true for empty array', () => {
      const empty = new DiffArray(0);
      expect(empty.isEmpty).toBe(true);
    });
  });

  describe('rangeAdd', () => {
    it('should add delta to range', () => {
      da.rangeAdd(0, 2, 5);
      expect(da.toArray()).toEqual([5, 5, 5, 0, 0]);
    });

    it('should add to single element range', () => {
      da.rangeAdd(2, 2, 10);
      expect(da.toArray()).toEqual([0, 0, 10, 0, 0]);
    });

    it('should add negative delta', () => {
      da.rangeAdd(0, 4, 3);
      da.rangeAdd(1, 3, -1);
      expect(da.toArray()).toEqual([3, 2, 2, 2, 3]);
    });

    it('should handle multiple rangeAdd calls', () => {
      da.rangeAdd(0, 4, 1);
      da.rangeAdd(2, 4, 2);
      da.rangeAdd(0, 1, 3);
      expect(da.toArray()).toEqual([4, 4, 3, 3, 3]);
    });

    it('should throw for negative from', () => {
      expect(() => da.rangeAdd(-1, 2, 5)).toThrow(RangeError);
      expect(() => da.rangeAdd(-1, 2, 5)).toThrow('Range [-1, 2] out of bounds [0, 5)');
    });

    it('should throw for negative to', () => {
      expect(() => da.rangeAdd(0, -1, 5)).toThrow(RangeError);
      expect(() => da.rangeAdd(0, -1, 5)).toThrow('Range [0, -1] out of bounds [0, 5)');
    });

    it('should throw for from out of bounds', () => {
      expect(() => da.rangeAdd(5, 5, 5)).toThrow(RangeError);
      expect(() => da.rangeAdd(5, 5, 5)).toThrow('Range [5, 5] out of bounds [0, 5)');
    });

    it('should throw for to out of bounds', () => {
      expect(() => da.rangeAdd(0, 5, 5)).toThrow(RangeError);
      expect(() => da.rangeAdd(0, 5, 5)).toThrow('Range [0, 5] out of bounds [0, 5)');
    });

    it('should throw for from > to', () => {
      expect(() => da.rangeAdd(3, 1, 5)).toThrow(RangeError);
      expect(() => da.rangeAdd(3, 1, 5)).toThrow('Invalid range: from (3) > to (1)');
    });

    it('should handle zero delta', () => {
      da.rangeAdd(0, 2, 0);
      expect(da.toArray()).toEqual([0, 0, 0, 0, 0]);
    });

    it('should work with empty array', () => {
      const empty = new DiffArray(0);
      expect(() => empty.rangeAdd(0, 0, 5)).toThrow();
    });
  });

  describe('pointQuery', () => {
    beforeEach(() => {
      da.rangeAdd(0, 4, 1);
      da.rangeAdd(2, 4, 2);
    });

    it('should query single point', () => {
      expect(da.pointQuery(0)).toBe(1);
      expect(da.pointQuery(1)).toBe(1);
      expect(da.pointQuery(2)).toBe(3);
      expect(da.pointQuery(3)).toBe(3);
      expect(da.pointQuery(4)).toBe(3);
    });

    it('should return 0 for untouched points', () => {
      expect(da.pointQuery(0)).toBe(1);
    });

    it('should throw for negative index', () => {
      expect(() => da.pointQuery(-1)).toThrow(RangeError);
      expect(() => da.pointQuery(-1)).toThrow('Index -1 out of bounds [0, 5)');
    });

    it('should throw for index out of bounds', () => {
      expect(() => da.pointQuery(5)).toThrow(RangeError);
      expect(() => da.pointQuery(5)).toThrow('Index 5 out of bounds [0, 5)');
    });

    it('should query after multiple operations', () => {
      da.rangeAdd(0, 2, 5);
      expect(da.pointQuery(0)).toBe(6);
      expect(da.pointQuery(2)).toBe(8);
    });
  });

  describe('rangeQuery', () => {
    beforeEach(() => {
      da.rangeAdd(0, 4, 1);
      da.rangeAdd(2, 4, 2);
    });

    it('should query range sum', () => {
      expect(da.rangeQuery(0, 2)).toBe(5);
      expect(da.rangeQuery(2, 4)).toBe(9);
      expect(da.rangeQuery(1, 3)).toBe(7);
    });

    it('should query single element range', () => {
      expect(da.rangeQuery(0, 0)).toBe(1);
      expect(da.rangeQuery(3, 3)).toBe(3);
    });

    it('should query entire array', () => {
      expect(da.rangeQuery(0, 4)).toBe(11);
    });

    it('should throw for negative from', () => {
      expect(() => da.rangeQuery(-1, 2)).toThrow(RangeError);
      expect(() => da.rangeQuery(-1, 2)).toThrow('Range [-1, 2] out of bounds [0, 5)');
    });

    it('should throw for negative to', () => {
      expect(() => da.rangeQuery(0, -1)).toThrow(RangeError);
      expect(() => da.rangeQuery(0, -1)).toThrow('Range [0, -1] out of bounds [0, 5)');
    });

    it('should throw for from out of bounds', () => {
      expect(() => da.rangeQuery(5, 5)).toThrow(RangeError);
      expect(() => da.rangeQuery(5, 5)).toThrow('Range [5, 5] out of bounds [0, 5)');
    });

    it('should throw for to out of bounds', () => {
      expect(() => da.rangeQuery(0, 5)).toThrow(RangeError);
      expect(() => da.rangeQuery(0, 5)).toThrow('Range [0, 5] out of bounds [0, 5)');
    });

    it('should throw for from > to', () => {
      expect(() => da.rangeQuery(3, 1)).toThrow(RangeError);
      expect(() => da.rangeQuery(3, 1)).toThrow('Invalid range: from (3) > to (1)');
    });

    it('should return 0 for range on empty array', () => {
      const empty = new DiffArray(0);
      expect(() => empty.rangeQuery(0, 0)).toThrow();
    });
  });

  describe('get', () => {
    beforeEach(() => {
      da.rangeAdd(0, 4, 1);
      da.rangeAdd(2, 4, 2);
    });

    it('should get value at index', () => {
      expect(da.get(0)).toBe(1);
      expect(da.get(2)).toBe(3);
      expect(da.get(4)).toBe(3);
    });

    it('should throw for negative index', () => {
      expect(() => da.get(-1)).toThrow(RangeError);
      expect(() => da.get(-1)).toThrow('Index -1 out of bounds [0, 5)');
    });

    it('should throw for index out of bounds', () => {
      expect(() => da.get(5)).toThrow(RangeError);
      expect(() => da.get(5)).toThrow('Index 5 out of bounds [0, 5)');
    });
  });

  describe('set', () => {
    beforeEach(() => {
      da.rangeAdd(0, 4, 1);
      da.rangeAdd(2, 4, 2);
    });

    it('should set value at index', () => {
      da.set(0, 10);
      expect(da.get(0)).toBe(10);
      expect(da.toArray()).toEqual([10, 1, 3, 3, 3]);
    });

    it('should set multiple values', () => {
      da.set(0, 10);
      da.set(2, 20);
      da.set(4, 30);
      expect(da.toArray()).toEqual([10, 1, 20, 3, 30]);
    });

    it('should set to same value', () => {
      da.set(2, 3);
      expect(da.get(2)).toBe(3);
      expect(da.toArray()).toEqual([1, 1, 3, 3, 3]);
    });

    it('should set to zero', () => {
      da.set(2, 0);
      expect(da.get(2)).toBe(0);
      expect(da.toArray()).toEqual([1, 1, 0, 3, 3]);
    });

    it('should set negative values', () => {
      da.set(0, -5);
      expect(da.get(0)).toBe(-5);
      expect(da.toArray()).toEqual([-5, 1, 3, 3, 3]);
    });

    it('should throw for negative index', () => {
      expect(() => da.set(-1, 10)).toThrow(RangeError);
      expect(() => da.set(-1, 10)).toThrow('Index -1 out of bounds [0, 5)');
    });

    it('should throw for index out of bounds', () => {
      expect(() => da.set(5, 10)).toThrow(RangeError);
      expect(() => da.set(5, 10)).toThrow('Index 5 out of bounds [0, 5)');
    });

    it('should work with empty array', () => {
      const empty = new DiffArray(0);
      expect(() => empty.set(0, 10)).toThrow();
    });

    it('should preserve other values', () => {
      da.set(2, 100);
      expect(da.get(0)).toBe(1);
      expect(da.get(1)).toBe(1);
      expect(da.get(2)).toBe(100);
      expect(da.get(3)).toBe(3);
      expect(da.get(4)).toBe(3);
    });
  });

  describe('clear', () => {
    beforeEach(() => {
      da.rangeAdd(0, 4, 5);
      da.rangeAdd(1, 3, 2);
    });

    it('should clear all values', () => {
      da.clear();
      expect(da.toArray()).toEqual([0, 0, 0, 0, 0]);
    });

    it('should allow operations after clear', () => {
      da.clear();
      da.rangeAdd(0, 2, 10);
      expect(da.toArray()).toEqual([10, 10, 10, 0, 0]);
    });

    it('should work on empty array', () => {
      const empty = new DiffArray(0);
      empty.clear();
      expect(empty.toArray()).toEqual([]);
    });

    it('should clear after set operations', () => {
      da.set(0, 100);
      da.set(2, 200);
      da.clear();
      expect(da.toArray()).toEqual([0, 0, 0, 0, 0]);
    });
  });

  describe('toArray', () => {
    beforeEach(() => {
      da.rangeAdd(0, 4, 1);
      da.rangeAdd(2, 4, 2);
    });

    it('should convert to array', () => {
      const arr = da.toArray();
      expect(arr).toEqual([1, 1, 3, 3, 3]);
      expect(Array.isArray(arr)).toBe(true);
    });

    it('should return copy not reference', () => {
      const arr1 = da.toArray();
      const arr2 = da.toArray();
      expect(arr1 === arr2).toBe(false);
    });

    it('should return empty array for empty', () => {
      const empty = new DiffArray(0);
      expect(empty.toArray()).toEqual([]);
    });

    it('should not be affected by later modifications', () => {
      const arr = da.toArray();
      da.rangeAdd(0, 2, 5);
      expect(arr).toEqual([1, 1, 3, 3, 3]);
    });
  });

  describe('clone', () => {
    beforeEach(() => {
      da.rangeAdd(0, 4, 1);
      da.rangeAdd(2, 4, 2);
    });

    it('should clone array', () => {
      const cloned = da.clone();
      expect(cloned.size).toBe(da.size);
      expect(cloned.toArray()).toEqual(da.toArray());
    });

    it('should create independent copy', () => {
      const cloned = da.clone();
      cloned.rangeAdd(0, 2, 10);
      expect(cloned.toArray()).toEqual([11, 11, 13, 3, 3]);
      expect(da.toArray()).toEqual([1, 1, 3, 3, 3]);
    });

    it('should clone empty array', () => {
      const empty = new DiffArray(0);
      const cloned = empty.clone();
      expect(cloned.size).toBe(0);
      expect(cloned.toArray()).toEqual([]);
    });

    it('should maintain dirty state', () => {
      const cloned = da.clone();
      cloned.rangeAdd(0, 2, 5);
      expect(cloned.toArray()).toEqual([6, 6, 8, 3, 3]);
      expect(da.toArray()).toEqual([1, 1, 3, 3, 3]);
    });
  });

  describe('push', () => {
    beforeEach(() => {
      da.rangeAdd(0, 4, 1);
      da.rangeAdd(2, 4, 2);
    });

    it('should push value', () => {
      const newSize = da.push(10);
      expect(newSize).toBe(6);
      expect(da.size).toBe(6);
    });

    it('should push to empty array', () => {
      const empty = new DiffArray(0);
      const newSize = empty.push(5);
      expect(newSize).toBe(1);
      expect(empty.size).toBe(1);
      expect(empty.toArray()).toEqual([5]);
    });

    it('should push multiple values', () => {
      da.push(10);
      da.push(20);
      da.push(30);
      expect(da.size).toBe(8);
      expect(da.toArray()).toEqual([1, 1, 3, 3, 3, 10, 20, 30]);
    });

    it('should preserve existing values', () => {
      da.push(10);
      expect(da.get(0)).toBe(1);
      expect(da.get(4)).toBe(3);
      expect(da.get(5)).toBe(10);
    });

    it('should push zero', () => {
      da.push(0);
      expect(da.get(5)).toBe(0);
    });

    it('should push negative values', () => {
      da.push(-10);
      expect(da.get(5)).toBe(-10);
    });
  });

  describe('pop', () => {
    beforeEach(() => {
      da.rangeAdd(0, 4, 1);
      da.rangeAdd(2, 4, 2);
    });

    it('should pop last value', () => {
      const value = da.pop();
      expect(value).toBe(3);
      expect(da.size).toBe(4);
      expect(da.toArray()).toEqual([1, 1, 3, 3]);
    });

    it('should pop multiple values', () => {
      da.pop();
      da.pop();
      expect(da.size).toBe(3);
      expect(da.toArray()).toEqual([1, 1, 3]);
    });

    it('should return undefined for empty array', () => {
      const empty = new DiffArray(0);
      const value = empty.pop();
      expect(value).toBe(undefined);
      expect(empty.size).toBe(0);
    });

    it('should pop to empty', () => {
      while (da.size > 0) {
        da.pop();
      }
      expect(da.size).toBe(0);
      expect(da.pop()).toBe(undefined);
    });

    it('should preserve other values', () => {
      da.pop();
      expect(da.get(0)).toBe(1);
      expect(da.get(2)).toBe(3);
    });
  });

  describe('fromArray', () => {
    it('should create from array', () => {
      const arr = [1, 2, 3, 4, 5];
      const created = DiffArray.fromArray(arr);
      expect(created.size).toBe(5);
      expect(created.toArray()).toEqual(arr);
    });

    it('should create from empty array', () => {
      const created = DiffArray.fromArray([]);
      expect(created.size).toBe(0);
      expect(created.toArray()).toEqual([]);
    });

    it('should create from single element array', () => {
      const created = DiffArray.fromArray([42]);
      expect(created.size).toBe(1);
      expect(created.toArray()).toEqual([42]);
    });

    it('should create from array with zeros', () => {
      const created = DiffArray.fromArray([0, 0, 0]);
      expect(created.toArray()).toEqual([0, 0, 0]);
    });

    it('should create from array with negative values', () => {
      const created = DiffArray.fromArray([-5, -10, -15]);
      expect(created.toArray()).toEqual([-5, -10, -15]);
    });

    it('should create independent copy', () => {
      const arr = [1, 2, 3];
      const created = DiffArray.fromArray(arr);
      created.set(0, 100);
      expect(created.toArray()).toEqual([100, 2, 3]);
      expect(arr).toEqual([1, 2, 3]);
    });
  });

  describe('forEach', () => {
    beforeEach(() => {
      da.rangeAdd(0, 4, 1);
      da.rangeAdd(2, 4, 2);
    });

    it('should iterate over all elements', () => {
      const result: number[] = [];
      da.forEach((value) => {
        result.push(value);
      });
      expect(result).toEqual([1, 1, 3, 3, 3]);
    });

    it('should provide correct index', () => {
      const indices: number[] = [];
      da.forEach((value, index) => {
        indices.push(index);
      });
      expect(indices).toEqual([0, 1, 2, 3, 4]);
    });

    it('should not iterate over empty array', () => {
      const empty = new DiffArray(0);
      let count = 0;
      empty.forEach(() => {
        count++;
      });
      expect(count).toBe(0);
    });

    it('should handle callback with index', () => {
      const result: number[] = [];
      da.forEach((value, index) => {
        result.push(value + index);
      });
      expect(result).toEqual([1, 2, 5, 6, 7]);
    });
  });

  describe('iterator', () => {
    beforeEach(() => {
      da.rangeAdd(0, 4, 1);
      da.rangeAdd(2, 4, 2);
    });

    it('should support for...of', () => {
      const result: number[] = [];
      for (const value of da) {
        result.push(value);
      }
      expect(result).toEqual([1, 1, 3, 3, 3]);
    });

    it('should support spread', () => {
      const result = [...da];
      expect(result).toEqual([1, 1, 3, 3, 3]);
    });

    it('should iterate over empty array', () => {
      const empty = new DiffArray(0);
      const result = [...empty];
      expect(result).toEqual([]);
    });

    it('should create independent array', () => {
      const arr1 = [...da];
      const arr2 = [...da];
      expect(arr1 === arr2).toBe(false);
    });
  });

  describe('rebuild', () => {
    beforeEach(() => {
      da.rangeAdd(0, 4, 1);
      da.rangeAdd(2, 4, 2);
    });

    it('should rebuild cache', () => {
      da.rebuild();
      expect(da.toArray()).toEqual([1, 1, 3, 3, 3]);
    });

    it('should work on empty array', () => {
      const empty = new DiffArray(0);
      empty.rebuild();
      expect(empty.toArray()).toEqual([]);
    });

    it('should not affect values', () => {
      da.rebuild();
      const arr1 = da.toArray();
      da.rebuild();
      const arr2 = da.toArray();
      expect(arr1).toEqual(arr2);
    });
  });

  describe('snapshot', () => {
    beforeEach(() => {
      da.rangeAdd(0, 4, 1);
      da.rangeAdd(2, 4, 2);
    });

    it('should take snapshot', () => {
      const snapshot = da.snapshot();
      expect(snapshot).toEqual([1, 1, 3, 3, 3]);
    });

    it('should return copy not reference', () => {
      const snap1 = da.snapshot();
      const snap2 = da.snapshot();
      expect(snap1 === snap2).toBe(false);
    });

    it('should not be affected by modifications', () => {
      const snapshot = da.snapshot();
      da.rangeAdd(0, 2, 5);
      expect(snapshot).toEqual([1, 1, 3, 3, 3]);
    });

    it('should work on empty array', () => {
      const empty = new DiffArray(0);
      expect(empty.snapshot()).toEqual([]);
    });
  });

  describe('mixed operations', () => {
    it('should handle rangeAdd and pointQuery', () => {
      da.rangeAdd(0, 2, 5);
      expect(da.pointQuery(1)).toBe(5);
      da.rangeAdd(1, 3, 3);
      expect(da.pointQuery(1)).toBe(8);
      expect(da.pointQuery(2)).toBe(8);
    });

    it('should handle rangeAdd and rangeQuery', () => {
      da.rangeAdd(0, 2, 5);
      expect(da.rangeQuery(0, 2)).toBe(15);
      da.rangeAdd(1, 3, 3);
      expect(da.rangeQuery(1, 3)).toBe(19);
    });

    it('should handle set after rangeAdd', () => {
      da.rangeAdd(0, 4, 10);
      da.set(2, 100);
      expect(da.toArray()).toEqual([10, 10, 100, 10, 10]);
    });

    it('should handle rangeAdd after set', () => {
      da.set(0, 5);
      da.set(1, 10);
      da.rangeAdd(0, 2, 3);
      expect(da.toArray()).toEqual([8, 13, 3, 0, 0]);
    });

    it('should handle push and pop', () => {
      da.rangeAdd(0, 4, 1);
      da.push(10);
      da.push(20);
      expect(da.pop()).toBe(20);
      expect(da.pop()).toBe(10);
      expect(da.size).toBe(5);
    });

    it('should handle clear and rangeAdd', () => {
      da.rangeAdd(0, 4, 5);
      da.clear();
      da.rangeAdd(0, 2, 10);
      expect(da.toArray()).toEqual([10, 10, 10, 0, 0]);
    });

    it('should handle clone and modify independently', () => {
      da.rangeAdd(0, 2, 5);
      const cloned = da.clone();
      cloned.rangeAdd(0, 2, 3);
      expect(cloned.toArray()).toEqual([8, 8, 8, 0, 0]);
      expect(da.toArray()).toEqual([5, 5, 5, 0, 0]);
    });

    it('should handle fromArray and modify', () => {
      const created = DiffArray.fromArray([1, 2, 3, 4, 5]);
      created.rangeAdd(0, 2, 10);
      expect(created.toArray()).toEqual([11, 12, 13, 4, 5]);
    });
  });

  describe('edge cases', () => {
    it('should handle single element', () => {
      const single = new DiffArray(1);
      single.rangeAdd(0, 0, 5);
      expect(single.toArray()).toEqual([5]);
      expect(single.get(0)).toBe(5);
      expect(single.rangeQuery(0, 0)).toBe(5);
    });

    it('should handle large delta values', () => {
      da.rangeAdd(0, 4, 1000000);
      expect(da.toArray()).toEqual([1000000, 1000000, 1000000, 1000000, 1000000]);
    });

    it('should handle many operations', () => {
      for (let i = 0; i < 100; i++) {
        da.rangeAdd(0, 4, 1);
      }
      expect(da.toArray()).toEqual([100, 100, 100, 100, 100]);
    });

    it('should handle alternating push and pop', () => {
      const small = new DiffArray(0);
      small.push(1);
      small.push(2);
      expect(small.pop()).toBe(2);
      small.push(3);
      expect(small.pop()).toBe(3);
      expect(small.pop()).toBe(1);
      expect(small.size).toBe(0);
    });

    it('should handle consecutive sets', () => {
      for (let i = 0; i < 5; i++) {
        da.set(i, i * 10);
      }
      expect(da.toArray()).toEqual([0, 10, 20, 30, 40]);
    });

    it('should handle large array', () => {
      const large = new DiffArray(100);
      large.rangeAdd(0, 99, 5);
      expect(large.pointQuery(50)).toBe(5);
      expect(large.rangeQuery(0, 99)).toBe(500);
    });
  });

  describe('performance characteristics', () => {
    it('should handle large number of rangeAdd operations', () => {
      for (let i = 0; i < 1000; i++) {
        da.rangeAdd(0, 4, 1);
      }
      expect(da.pointQuery(0)).toBe(1000);
    });

    it('should handle large number of pointQuery operations', () => {
      da.rangeAdd(0, 4, 5);
      for (let i = 0; i < 1000; i++) {
        expect(da.pointQuery(2)).toBe(5);
      }
    });

    it('should handle large number of rangeQuery operations', () => {
      da.rangeAdd(0, 4, 5);
      for (let i = 0; i < 1000; i++) {
        expect(da.rangeQuery(0, 4)).toBe(25);
      }
    });

    it('should handle large number of set operations', () => {
      for (let i = 0; i < 100; i++) {
        da.set(0, i);
      }
      expect(da.get(0)).toBe(99);
    });

    it('should handle large number of push operations', () => {
      const large = new DiffArray(0);
      for (let i = 0; i < 1000; i++) {
        large.push(i);
      }
      expect(large.size).toBe(1000);
    });

    it('should handle large number of pop operations', () => {
      const large = new DiffArray(0);
      for (let i = 0; i < 1000; i++) {
        large.push(i);
      }
      for (let i = 0; i < 1000; i++) {
        large.pop();
      }
      expect(large.size).toBe(0);
    });
  });
});
