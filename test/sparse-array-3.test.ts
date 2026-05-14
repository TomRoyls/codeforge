import { describe, it, expect } from 'vitest';
import { SparseArray3 } from '../src/core/sparse-array-3/index.js';

describe('SparseArray3', () => {
  describe('constructor', () => {
    it('should create empty array with default length 0', () => {
      const arr = new SparseArray3<number>();
      expect(arr.length).toBe(0);
      expect(arr.filled()).toBe(0);
    });

    it('should create array with specified length', () => {
      const arr = new SparseArray3<number>(10);
      expect(arr.length).toBe(10);
      expect(arr.filled()).toBe(0);
    });

    it('should handle negative length by using 0', () => {
      const arr = new SparseArray3<number>(-5);
      expect(arr.length).toBe(0);
    });
  });

  describe('get and set', () => {
    it('should get and set values', () => {
      const arr = new SparseArray3<number>();
      arr.set(0, 10);
      arr.set(5, 50);
      expect(arr.get(0)).toBe(10);
      expect(arr.get(5)).toBe(50);
    });

    it('should return undefined for empty slots', () => {
      const arr = new SparseArray3<number>();
      arr.set(0, 10);
      expect(arr.get(1)).toBe(undefined);
      expect(arr.get(100)).toBe(undefined);
    });

    it('should return undefined for indices out of range', () => {
      const arr = new SparseArray3<number>(5);
      arr.set(0, 10);
      expect(arr.get(-1)).toBe(undefined);
      expect(arr.get(10)).toBe(undefined);
    });

    it('should expand length when setting beyond current length', () => {
      const arr = new SparseArray3<number>(5);
      arr.set(10, 100);
      expect(arr.length).toBe(11);
      expect(arr.get(10)).toBe(100);
    });

    it('should handle sparse access correctly', () => {
      const arr = new SparseArray3<number>();
      arr.set(0, 0);
      arr.set(1000, 1000);
      arr.set(10, 10);
      expect(arr.get(0)).toBe(0);
      expect(arr.get(10)).toBe(10);
      expect(arr.get(1000)).toBe(1000);
      expect(arr.get(500)).toBe(undefined);
    });

    it('should throw error when setting negative index', () => {
      const arr = new SparseArray3<number>();
      expect(() => arr.set(-1, 10)).toThrow(RangeError);
    });
  });

  describe('delete', () => {
    it('should delete existing values', () => {
      const arr = new SparseArray3<number>();
      arr.set(0, 10);
      arr.set(5, 50);
      expect(arr.delete(0)).toBe(true);
      expect(arr.get(0)).toBe(undefined);
      expect(arr.has(0)).toBe(false);
    });

    it('should return false when deleting non-existent values', () => {
      const arr = new SparseArray3<number>();
      arr.set(0, 10);
      expect(arr.delete(1)).toBe(false);
    });

    it('should return false for indices out of range', () => {
      const arr = new SparseArray3<number>(5);
      expect(arr.delete(-1)).toBe(false);
      expect(arr.delete(10)).toBe(false);
    });
  });

  describe('has', () => {
    it('should return true for filled slots', () => {
      const arr = new SparseArray3<number>();
      arr.set(0, 10);
      arr.set(5, 50);
      expect(arr.has(0)).toBe(true);
      expect(arr.has(5)).toBe(true);
    });

    it('should return false for empty slots', () => {
      const arr = new SparseArray3<number>();
      arr.set(0, 10);
      expect(arr.has(1)).toBe(false);
    });

    it('should return false for indices out of range', () => {
      const arr = new SparseArray3<number>(5);
      expect(arr.has(-1)).toBe(false);
      expect(arr.has(10)).toBe(false);
    });
  });

  describe('push', () => {
    it('should push values and return index', () => {
      const arr = new SparseArray3<number>();
      expect(arr.push(10)).toBe(0);
      expect(arr.push(20)).toBe(1);
      expect(arr.push(30)).toBe(2);
      expect(arr.length).toBe(3);
      expect(arr.get(0)).toBe(10);
      expect(arr.get(1)).toBe(20);
      expect(arr.get(2)).toBe(30);
    });

    it('should push after sparse setting', () => {
      const arr = new SparseArray3<number>();
      arr.set(10, 100);
      expect(arr.push(50)).toBe(11);
      expect(arr.length).toBe(12);
      expect(arr.get(10)).toBe(100);
      expect(arr.get(11)).toBe(50);
    });

    it('should handle empty string and zero', () => {
      const arr = new SparseArray3<string | number>();
      arr.push('');
      arr.push(0);
      expect(arr.get(0)).toBe('');
      expect(arr.get(1)).toBe(0);
      expect(arr.has(0)).toBe(true);
      expect(arr.has(1)).toBe(true);
    });
  });

  describe('pop', () => {
    it('should pop values from end', () => {
      const arr = new SparseArray3<number>();
      arr.push(10);
      arr.push(20);
      arr.push(30);
      expect(arr.pop()).toBe(30);
      expect(arr.pop()).toBe(20);
      expect(arr.pop()).toBe(10);
      expect(arr.pop()).toBe(undefined);
      expect(arr.length).toBe(0);
    });

    it('should skip empty slots when popping', () => {
      const arr = new SparseArray3<number>();
      arr.set(0, 10);
      arr.set(5, 50);
      expect(arr.pop()).toBe(50);
      expect(arr.length).toBe(5);
      expect(arr.pop()).toBe(10);
      expect(arr.length).toBe(0);
    });

    it('should return undefined for empty array', () => {
      const arr = new SparseArray3<number>();
      expect(arr.pop()).toBe(undefined);
    });

    it('should handle sparse gaps when popping', () => {
      const arr = new SparseArray3<number>();
      arr.set(0, 0);
      arr.set(100, 100);
      expect(arr.pop()).toBe(100);
      expect(arr.length).toBe(100);
      expect(arr.pop()).toBe(0);
      expect(arr.length).toBe(0);
    });
  });

  describe('length getter', () => {
    it('should return correct length', () => {
      const arr = new SparseArray3<number>(5);
      expect(arr.length).toBe(5);
      arr.push(10);
      expect(arr.length).toBe(6);
      arr.set(10, 100);
      expect(arr.length).toBe(11);
    });
  });

  describe('setLength', () => {
    it('should set length and truncate values', () => {
      const arr = new SparseArray3<number>();
      arr.push(10);
      arr.push(20);
      arr.push(30);
      arr.setLength(2);
      expect(arr.length).toBe(2);
      expect(arr.get(0)).toBe(10);
      expect(arr.get(1)).toBe(20);
      expect(arr.get(2)).toBe(undefined);
    });

    it('should increase length without affecting existing values', () => {
      const arr = new SparseArray3<number>();
      arr.set(0, 10);
      arr.setLength(10);
      expect(arr.length).toBe(10);
      expect(arr.get(0)).toBe(10);
    });

    it('should handle setting to 0', () => {
      const arr = new SparseArray3<number>();
      arr.push(10);
      arr.push(20);
      arr.setLength(0);
      expect(arr.length).toBe(0);
      expect(arr.filled()).toBe(0);
    });

    it('should truncate sparse values beyond new length', () => {
      const arr = new SparseArray3<number>();
      arr.set(0, 0);
      arr.set(5, 50);
      arr.set(10, 100);
      arr.setLength(6);
      expect(arr.length).toBe(6);
      expect(arr.get(0)).toBe(0);
      expect(arr.get(5)).toBe(50);
      expect(arr.get(10)).toBe(undefined);
      expect(arr.filled()).toBe(2);
    });

    it('should throw error for negative length', () => {
      const arr = new SparseArray3<number>();
      expect(() => arr.setLength(-5)).toThrow(RangeError);
    });
  });

  describe('filled', () => {
    it('should return count of filled slots', () => {
      const arr = new SparseArray3<number>();
      expect(arr.filled()).toBe(0);
      arr.push(10);
      arr.push(20);
      arr.set(5, 50);
      expect(arr.filled()).toBe(3);
    });

    it('should update correctly after delete', () => {
      const arr = new SparseArray3<number>();
      arr.push(10);
      arr.push(20);
      arr.push(30);
      arr.delete(1);
      expect(arr.filled()).toBe(2);
    });
  });

  describe('filledIndices', () => {
    it('should return sorted array of filled indices', () => {
      const arr = new SparseArray3<number>();
      arr.set(5, 50);
      arr.set(0, 0);
      arr.set(10, 100);
      expect(arr.filledIndices()).toEqual([0, 5, 10]);
    });

    it('should return empty array for no filled slots', () => {
      const arr = new SparseArray3<number>();
      expect(arr.filledIndices()).toEqual([]);
    });

    it('should handle large gaps', () => {
      const arr = new SparseArray3<number>();
      arr.set(0, 0);
      arr.set(1000, 1000);
      expect(arr.filledIndices()).toEqual([0, 1000]);
    });
  });

  describe('toArray', () => {
    it('should convert to dense array with undefined for empty slots', () => {
      const arr = new SparseArray3<number>();
      arr.set(0, 10);
      arr.set(2, 30);
      arr.set(5, 50);
      const result = arr.toArray();
      expect(result).toEqual([10, undefined, 30, undefined, undefined, 50]);
    });

    it('should handle empty array', () => {
      const arr = new SparseArray3<number>();
      expect(arr.toArray()).toEqual([]);
    });

    it('should respect length property', () => {
      const arr = new SparseArray3<number>();
      arr.set(0, 10);
      arr.set(5, 50);
      arr.setLength(3);
      expect(arr.toArray()).toEqual([10, undefined, undefined]);
    });
  });

  describe('compact', () => {
    it('should return array of only filled values', () => {
      const arr = new SparseArray3<number>();
      arr.set(0, 10);
      arr.set(2, 30);
      arr.set(5, 50);
      expect(arr.compact()).toEqual([10, 30, 50]);
    });

    it('should return empty array for no filled slots', () => {
      const arr = new SparseArray3<number>();
      expect(arr.compact()).toEqual([]);
    });

    it('should preserve order', () => {
      const arr = new SparseArray3<number>();
      arr.set(5, 50);
      arr.set(0, 0);
      arr.set(10, 100);
      expect(arr.compact()).toEqual([0, 50, 100]);
    });
  });

  describe('forEach', () => {
    it('should iterate over filled slots only', () => {
      const arr = new SparseArray3<number>();
      arr.set(0, 10);
      arr.set(2, 30);
      arr.set(5, 50);
      const indices: number[] = [];
      const values: number[] = [];
      arr.forEach((value, index) => {
        indices.push(index);
        values.push(value);
      });
      expect(indices).toContain(0);
      expect(indices).toContain(2);
      expect(indices).toContain(5);
      expect(values).toContain(10);
      expect(values).toContain(30);
      expect(values).toContain(50);
    });

    it('should handle empty array', () => {
      const arr = new SparseArray3<number>();
      let calls = 0;
      arr.forEach(() => calls++);
      expect(calls).toBe(0);
    });
  });

  describe('clear', () => {
    it('should clear all data and reset length', () => {
      const arr = new SparseArray3<number>();
      arr.push(10);
      arr.push(20);
      arr.set(5, 50);
      arr.clear();
      expect(arr.length).toBe(0);
      expect(arr.filled()).toBe(0);
      expect(arr.get(0)).toBe(undefined);
    });

    it('should handle clearing empty array', () => {
      const arr = new SparseArray3<number>();
      arr.clear();
      expect(arr.length).toBe(0);
      expect(arr.filled()).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle large gaps efficiently', () => {
      const arr = new SparseArray3<number>();
      arr.set(0, 0);
      arr.set(1000000, 1000000);
      expect(arr.filled()).toBe(2);
      expect(arr.length).toBe(1000001);
      expect(arr.get(0)).toBe(0);
      expect(arr.get(1000000)).toBe(1000000);
      expect(arr.get(500000)).toBe(undefined);
    });

    it('should handle string values', () => {
      const arr = new SparseArray3<string>();
      arr.set(0, 'hello');
      arr.set(5, 'world');
      expect(arr.get(0)).toBe('hello');
      expect(arr.get(5)).toBe('world');
      expect(arr.compact()).toEqual(['hello', 'world']);
    });

    it('should handle object values', () => {
      const arr = new SparseArray3<{ id: number }>();
      const obj1 = { id: 1 };
      const obj2 = { id: 2 };
      arr.set(0, obj1);
      arr.set(3, obj2);
      expect(arr.get(0)).toBe(obj1);
      expect(arr.get(3)).toBe(obj2);
    });

    it('should handle undefined values as explicit sets', () => {
      const arr = new SparseArray3<number | undefined>();
      arr.set(0, 10);
      arr.set(1, undefined);
      expect(arr.get(0)).toBe(10);
      expect(arr.get(1)).toBe(undefined);
      expect(arr.filled()).toBe(2);
      expect(arr.has(1)).toBe(true);
    });

    it('should handle alternating set and delete', () => {
      const arr = new SparseArray3<number>();
      arr.set(0, 10);
      arr.set(1, 20);
      arr.delete(0);
      arr.set(2, 30);
      expect(arr.filled()).toBe(2);
      expect(arr.has(1)).toBe(true);
      expect(arr.has(2)).toBe(true);
      expect(arr.compact()).toEqual([20, 30]);
    });
  });
});
