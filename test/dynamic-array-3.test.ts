import { describe, it, expect } from 'vitest';
import { DynamicArray3 } from '../src/core/dynamic-array-3/index.js';

describe('DynamicArray3', () => {
  describe('constructor', () => {
    it('should create array with default capacity 8', () => {
      const arr = new DynamicArray3<number>();
      expect(arr.capacity).toBe(8);
      expect(arr.length).toBe(0);
      expect(arr.isEmpty()).toBe(true);
    });

    it('should create array with specified capacity', () => {
      const arr = new DynamicArray3<number>(16);
      expect(arr.capacity).toBe(16);
      expect(arr.length).toBe(0);
      expect(arr.isEmpty()).toBe(true);
    });

    it('should create array with capacity 0', () => {
      const arr = new DynamicArray3<number>(0);
      expect(arr.capacity).toBe(0);
      expect(arr.length).toBe(0);
      expect(arr.isEmpty()).toBe(true);
    });
  });

  describe('push and pop', () => {
    it('should push elements and grow capacity', () => {
      const arr = new DynamicArray3<number>(4);
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.push(4);
      expect(arr.capacity).toBe(4);
      expect(arr.length).toBe(4);

      arr.push(5);
      expect(arr.capacity).toBe(8);
      expect(arr.length).toBe(5);
      expect(arr.get(4)).toBe(5);
    });

    it('should pop elements', () => {
      const arr = new DynamicArray3<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      expect(arr.pop()).toBe(3);
      expect(arr.length).toBe(2);
      expect(arr.pop()).toBe(2);
      expect(arr.length).toBe(1);
      expect(arr.pop()).toBe(1);
      expect(arr.length).toBe(0);
      expect(arr.isEmpty()).toBe(true);
    });

    it('should return undefined when popping from empty array', () => {
      const arr = new DynamicArray3<number>();
      expect(arr.pop()).toBeUndefined();
    });
  });

  describe('get and set', () => {
    it('should get elements by index', () => {
      const arr = new DynamicArray3<number>();
      arr.push(10);
      arr.push(20);
      arr.push(30);
      expect(arr.get(0)).toBe(10);
      expect(arr.get(1)).toBe(20);
      expect(arr.get(2)).toBe(30);
    });

    it('should return undefined for out of bounds get', () => {
      const arr = new DynamicArray3<number>();
      arr.push(1);
      arr.push(2);
      expect(arr.get(-1)).toBeUndefined();
      expect(arr.get(2)).toBeUndefined();
      expect(arr.get(100)).toBeUndefined();
    });

    it('should set elements by index', () => {
      const arr = new DynamicArray3<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      expect(arr.set(1, 20)).toBe(true);
      expect(arr.get(1)).toBe(20);
    });

    it('should return false for out of bounds set', () => {
      const arr = new DynamicArray3<number>();
      arr.push(1);
      expect(arr.set(-1, 10)).toBe(false);
      expect(arr.set(1, 10)).toBe(false);
      expect(arr.set(100, 10)).toBe(false);
    });
  });

  describe('insert and removeAt', () => {
    it('should insert elements at index', () => {
      const arr = new DynamicArray3<number>();
      arr.push(1);
      arr.push(3);
      arr.push(4);
      arr.insert(1, 2);
      expect(arr.length).toBe(4);
      expect(arr.get(0)).toBe(1);
      expect(arr.get(1)).toBe(2);
      expect(arr.get(2)).toBe(3);
      expect(arr.get(3)).toBe(4);
    });

    it('should insert at beginning', () => {
      const arr = new DynamicArray3<number>();
      arr.push(2);
      arr.push(3);
      arr.insert(0, 1);
      expect(arr.get(0)).toBe(1);
      expect(arr.get(1)).toBe(2);
      expect(arr.get(2)).toBe(3);
    });

    it('should insert at end', () => {
      const arr = new DynamicArray3<number>();
      arr.push(1);
      arr.push(2);
      arr.insert(2, 3);
      expect(arr.length).toBe(3);
      expect(arr.get(2)).toBe(3);
    });

    it('should not insert for out of bounds index', () => {
      const arr = new DynamicArray3<number>();
      arr.push(1);
      arr.push(2);
      arr.insert(-1, 0);
      arr.insert(3, 0);
      arr.insert(100, 0);
      expect(arr.length).toBe(2);
    });

    it('should remove elements by index', () => {
      const arr = new DynamicArray3<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.push(4);
      const removed = arr.removeAt(1);
      expect(removed).toBe(2);
      expect(arr.length).toBe(3);
      expect(arr.get(0)).toBe(1);
      expect(arr.get(1)).toBe(3);
      expect(arr.get(2)).toBe(4);
    });

    it('should return undefined for out of bounds removeAt', () => {
      const arr = new DynamicArray3<number>();
      arr.push(1);
      expect(arr.removeAt(-1)).toBeUndefined();
      expect(arr.removeAt(1)).toBeUndefined();
      expect(arr.removeAt(100)).toBeUndefined();
      expect(arr.length).toBe(1);
    });
  });

  describe('length and capacity', () => {
    it('should track length correctly', () => {
      const arr = new DynamicArray3<number>();
      expect(arr.length).toBe(0);
      arr.push(1);
      expect(arr.length).toBe(1);
      arr.push(2);
      expect(arr.length).toBe(2);
      arr.pop();
      expect(arr.length).toBe(1);
      arr.clear();
      expect(arr.length).toBe(0);
    });

    it('should track capacity correctly and grow', () => {
      const arr = new DynamicArray3<number>(2);
      expect(arr.capacity).toBe(2);
      arr.push(1);
      expect(arr.capacity).toBe(2);
      arr.push(2);
      expect(arr.capacity).toBe(2);
      arr.push(3);
      expect(arr.capacity).toBe(4);
      arr.push(4);
      arr.push(5);
      expect(arr.capacity).toBe(8);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty array', () => {
      const arr = new DynamicArray3<number>();
      expect(arr.isEmpty()).toBe(true);
    });

    it('should return false for non-empty array', () => {
      const arr = new DynamicArray3<number>();
      arr.push(1);
      expect(arr.isEmpty()).toBe(false);
    });

    it('should return true after clearing', () => {
      const arr = new DynamicArray3<number>();
      arr.push(1);
      arr.push(2);
      arr.clear();
      expect(arr.isEmpty()).toBe(true);
    });
  });

  describe('toArray', () => {
    it('should convert to regular array', () => {
      const arr = new DynamicArray3<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      const result = arr.toArray();
      expect(result).toEqual([1, 2, 3]);
      expect(result).toBeInstanceOf(Array);
    });

    it('should return empty array for empty dynamic array', () => {
      const arr = new DynamicArray3<number>();
      const result = arr.toArray();
      expect(result).toEqual([]);
    });
  });

  describe('clear', () => {
    it('should clear all elements', () => {
      const arr = new DynamicArray3<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.clear();
      expect(arr.length).toBe(0);
      expect(arr.isEmpty()).toBe(true);
      expect(arr.get(0)).toBeUndefined();
      expect(arr.toArray()).toEqual([]);
    });

    it('should not affect capacity', () => {
      const arr = new DynamicArray3<number>(8);
      arr.push(1);
      arr.push(2);
      const capacityBefore = arr.capacity;
      arr.clear();
      expect(arr.capacity).toBe(capacityBefore);
    });
  });

  describe('indexOf and contains', () => {
    it('should find index of element', () => {
      const arr = new DynamicArray3<number>();
      arr.push(10);
      arr.push(20);
      arr.push(30);
      expect(arr.indexOf(20)).toBe(1);
      expect(arr.indexOf(10)).toBe(0);
      expect(arr.indexOf(30)).toBe(2);
    });

    it('should return -1 for non-existent element', () => {
      const arr = new DynamicArray3<number>();
      arr.push(1);
      arr.push(2);
      expect(arr.indexOf(3)).toBe(-1);
      expect(arr.indexOf(0)).toBe(-1);
    });

    it('should return -1 for empty array', () => {
      const arr = new DynamicArray3<number>();
      expect(arr.indexOf(1)).toBe(-1);
    });

    it('should check if element exists', () => {
      const arr = new DynamicArray3<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      expect(arr.contains(2)).toBe(true);
      expect(arr.contains(4)).toBe(false);
    });

    it('should return false for empty array', () => {
      const arr = new DynamicArray3<number>();
      expect(arr.contains(1)).toBe(false);
    });
  });

  describe('forEach', () => {
    it('should iterate over all elements', () => {
      const arr = new DynamicArray3<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      const result: number[] = [];
      arr.forEach((value, index) => {
        result.push(value);
        expect(index).toBe(value - 1);
      });
      expect(result).toEqual([1, 2, 3]);
    });

    it('should not iterate over empty array', () => {
      const arr = new DynamicArray3<number>();
      let count = 0;
      arr.forEach(() => {
        count++;
      });
      expect(count).toBe(0);
    });
  });

  describe('map', () => {
    it('should map elements to new type', () => {
      const arr = new DynamicArray3<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      const result = arr.map((x) => x * 2);
      expect(result.toArray()).toEqual([2, 4, 6]);
      expect(result).toBeInstanceOf(DynamicArray3);
    });

    it('should preserve indices in map callback', () => {
      const arr = new DynamicArray3<number>();
      arr.push(10);
      arr.push(20);
      arr.push(30);
      const result = arr.map((value, index) => value + index);
      expect(result.toArray()).toEqual([10, 21, 32]);
    });

    it('should return empty array for map on empty array', () => {
      const arr = new DynamicArray3<number>();
      const result = arr.map((x) => x * 2);
      expect(result.toArray()).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('should map to different type', () => {
      const arr = new DynamicArray3<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      const result = arr.map((x) => x.toString());
      expect(result.toArray()).toEqual(['1', '2', '3']);
    });
  });

  describe('filter', () => {
    it('should filter elements', () => {
      const arr = new DynamicArray3<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.push(4);
      arr.push(5);
      const result = arr.filter((x) => x % 2 === 0);
      expect(result.toArray()).toEqual([2, 4]);
      expect(result).toBeInstanceOf(DynamicArray3);
    });

    it('should preserve indices in filter callback', () => {
      const arr = new DynamicArray3<number>();
      arr.push(10);
      arr.push(15);
      arr.push(20);
      arr.push(25);
      const result = arr.filter((value, index) => index % 2 === 0);
      expect(result.toArray()).toEqual([10, 20]);
    });

    it('should return empty array when no elements pass filter', () => {
      const arr = new DynamicArray3<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      const result = arr.filter((x) => x > 10);
      expect(result.toArray()).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('should filter empty array', () => {
      const arr = new DynamicArray3<number>();
      const result = arr.filter(() => true);
      expect(result.toArray()).toEqual([]);
    });
  });

  describe('resize', () => {
    it('should resize to larger capacity', () => {
      const arr = new DynamicArray3<number>(4);
      arr.push(1);
      arr.push(2);
      arr.resize(8);
      expect(arr.capacity).toBe(8);
      expect(arr.length).toBe(2);
      expect(arr.get(0)).toBe(1);
      expect(arr.get(1)).toBe(2);
    });

    it('should resize to smaller capacity that fits elements', () => {
      const arr = new DynamicArray3<number>(8);
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.resize(4);
      expect(arr.capacity).toBe(4);
      expect(arr.length).toBe(3);
      expect(arr.get(0)).toBe(1);
      expect(arr.get(1)).toBe(2);
      expect(arr.get(2)).toBe(3);
    });

    it('should resize to exact length when capacity is less than length', () => {
      const arr = new DynamicArray3<number>(8);
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.push(4);
      arr.push(5);
      arr.resize(2);
      expect(arr.capacity).toBe(5);
      expect(arr.length).toBe(5);
      expect(arr.toArray()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should resize empty array', () => {
      const arr = new DynamicArray3<number>(8);
      arr.resize(16);
      expect(arr.capacity).toBe(16);
      expect(arr.length).toBe(0);
    });
  });

  describe('geometric growth', () => {
    it('should double capacity when full', () => {
      const arr = new DynamicArray3<number>(4);
      expect(arr.capacity).toBe(4);
      for (let i = 0; i < 4; i++) {
        arr.push(i);
      }
      expect(arr.capacity).toBe(4);
      arr.push(4);
      expect(arr.capacity).toBe(8);
      for (let i = 5; i < 8; i++) {
        arr.push(i);
      }
      expect(arr.capacity).toBe(8);
      arr.push(8);
      expect(arr.capacity).toBe(16);
    });

    it('should preserve all elements during growth', () => {
      const arr = new DynamicArray3<number>(2);
      for (let i = 0; i < 10; i++) {
        arr.push(i);
      }
      expect(arr.length).toBe(10);
      expect(arr.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
  });

  describe('edge cases', () => {
    it('should handle empty array operations', () => {
      const arr = new DynamicArray3<number>();
      expect(arr.isEmpty()).toBe(true);
      expect(arr.length).toBe(0);
      expect(arr.get(0)).toBeUndefined();
      expect(arr.pop()).toBeUndefined();
      expect(arr.indexOf(1)).toBe(-1);
      expect(arr.contains(1)).toBe(false);
      expect(arr.toArray()).toEqual([]);
    });

    it('should handle out of bounds operations', () => {
      const arr = new DynamicArray3<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      expect(arr.get(-1)).toBeUndefined();
      expect(arr.get(3)).toBeUndefined();
      expect(arr.get(100)).toBeUndefined();
      expect(arr.set(-1, 10)).toBe(false);
      expect(arr.set(3, 10)).toBe(false);
      expect(arr.set(100, 10)).toBe(false);
      expect(arr.removeAt(-1)).toBeUndefined();
      expect(arr.removeAt(3)).toBeUndefined();
      expect(arr.removeAt(100)).toBeUndefined();
    });

    it('should handle zero capacity', () => {
      const arr = new DynamicArray3<number>(0);
      expect(arr.capacity).toBe(0);
      arr.push(1);
      expect(arr.capacity).toBeGreaterThan(0);
      expect(arr.get(0)).toBe(1);
    });

    it('should handle strings', () => {
      const arr = new DynamicArray3<string>();
      arr.push('a');
      arr.push('b');
      arr.push('c');
      expect(arr.toArray()).toEqual(['a', 'b', 'c']);
      expect(arr.contains('b')).toBe(true);
      expect(arr.indexOf('c')).toBe(2);
    });

    it('should handle objects', () => {
      const arr = new DynamicArray3<{ id: number }>();
      arr.push({ id: 1 });
      arr.push({ id: 2 });
      expect(arr.get(0)).toEqual({ id: 1 });
      expect(arr.contains({ id: 2 })).toBe(false);
      expect(arr.contains(arr.get(1)!)).toBe(true);
    });

    it('should handle mixed types with any', () => {
      const arr = new DynamicArray3<number | string>();
      arr.push(1);
      arr.push('a');
      arr.push(2);
      expect(arr.toArray()).toEqual([1, 'a', 2]);
    });
  });
});
