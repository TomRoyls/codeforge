import { describe, it, expect } from 'vitest';
import { DynamicArray } from '../src/core/dynamic-array-2/index.js';

describe('DynamicArray', () => {
  describe('constructor', () => {
    it('should create array with default capacity 8', () => {
      const arr = new DynamicArray<number>();
      expect(arr.capacity).toBe(8);
      expect(arr.size).toBe(0);
      expect(arr.isEmpty()).toBe(true);
    });

    it('should create array with specified capacity', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 16 });
      expect(arr.capacity).toBe(16);
      expect(arr.size).toBe(0);
      expect(arr.isEmpty()).toBe(true);
    });

    it('should create array with capacity 0', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 0 });
      expect(arr.capacity).toBe(0);
      expect(arr.size).toBe(0);
      expect(arr.isEmpty()).toBe(true);
    });

    it('should create array with custom growth factor', () => {
      const arr = new DynamicArray<number>({ growthFactor: 3 });
      expect(arr.growthFactor).toBe(3);
    });

    it('should create array with geometric growth strategy', () => {
      const arr = new DynamicArray<number>({ growthStrategy: 'geometric' });
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.push(4);
      arr.push(5);
      arr.push(6);
      arr.push(7);
      arr.push(8);
      arr.push(9);
      expect(arr.capacity).toBe(16);
    });

    it('should create array with linear growth strategy', () => {
      const arr = new DynamicArray<number>({ growthStrategy: 'linear', growthFactor: 5 });
      expect(arr.capacity).toBe(8);
      for (let i = 0; i < 9; i++) {
        arr.push(i);
      }
      expect(arr.capacity).toBe(13);
    });

    it('should create array with fixed growth strategy', () => {
      const arr = new DynamicArray<number>({ growthStrategy: 'fixed', growthFactor: 4 });
      expect(arr.capacity).toBe(8);
      for (let i = 0; i < 9; i++) {
        arr.push(i);
      }
      expect(arr.capacity).toBe(12);
    });

    it('should create array with fibonacci growth strategy', () => {
      const arr = new DynamicArray<number>({ growthStrategy: 'fibonacci' });
      expect(arr.capacity).toBe(8);
      for (let i = 0; i < 9; i++) {
        arr.push(i);
      }
      expect(arr.capacity).toBe(10);
    });

    it('should create array with custom equality comparator', () => {
      const arr = new DynamicArray<{ id: number }>({
        equals: (a, b) => a.id === b.id,
      });
      const obj = { id: 1 };
      arr.push(obj);
      expect(arr.contains({ id: 1 })).toBe(true);
    });
  });

  describe('push and pop', () => {
    it('should push elements and grow capacity', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 4 });
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.push(4);
      expect(arr.capacity).toBe(4);
      expect(arr.size).toBe(4);

      arr.push(5);
      expect(arr.capacity).toBe(8);
      expect(arr.size).toBe(5);
      expect(arr.get(4)).toBe(5);
    });

    it('should pop elements', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      expect(arr.pop()).toBe(3);
      expect(arr.size).toBe(2);
      expect(arr.pop()).toBe(2);
      expect(arr.size).toBe(1);
      expect(arr.pop()).toBe(1);
      expect(arr.size).toBe(0);
      expect(arr.isEmpty()).toBe(true);
    });

    it('should return undefined when popping from empty array', () => {
      const arr = new DynamicArray<number>();
      expect(arr.pop()).toBeUndefined();
    });
  });

  describe('shift and unshift', () => {
    it('should shift first element', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      expect(arr.shift()).toBe(1);
      expect(arr.size).toBe(2);
      expect(arr.get(0)).toBe(2);
    });

    it('should return undefined when shifting from empty array', () => {
      const arr = new DynamicArray<number>();
      expect(arr.shift()).toBeUndefined();
    });

    it('should unshift element to front', () => {
      const arr = new DynamicArray<number>();
      arr.push(2);
      arr.push(3);
      arr.unshift(1);
      expect(arr.size).toBe(3);
      expect(arr.get(0)).toBe(1);
      expect(arr.get(1)).toBe(2);
      expect(arr.get(2)).toBe(3);
    });

    it('should grow capacity when unshifting to full array', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 4 });
      arr.push(2);
      arr.push(3);
      arr.push(4);
      arr.push(5);
      expect(arr.capacity).toBe(4);
      arr.unshift(1);
      expect(arr.capacity).toBe(8);
      expect(arr.size).toBe(5);
    });
  });

  describe('get and set', () => {
    it('should get elements by index', () => {
      const arr = new DynamicArray<number>();
      arr.push(10);
      arr.push(20);
      arr.push(30);
      expect(arr.get(0)).toBe(10);
      expect(arr.get(1)).toBe(20);
      expect(arr.get(2)).toBe(30);
    });

    it('should return undefined for out of bounds get', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      expect(arr.get(-1)).toBeUndefined();
      expect(arr.get(2)).toBeUndefined();
      expect(arr.get(100)).toBeUndefined();
    });

    it('should set elements by index', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.set(1, 20);
      expect(arr.get(1)).toBe(20);
    });

    it('should not set for out of bounds index', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.set(-1, 10);
      arr.set(2, 10);
      arr.set(100, 10);
      expect(arr.get(0)).toBe(1);
      expect(arr.get(1)).toBe(2);
    });
  });

  describe('insert and removeAt', () => {
    it('should insert elements at index', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(3);
      arr.push(4);
      arr.insert(1, 2);
      expect(arr.size).toBe(4);
      expect(arr.get(0)).toBe(1);
      expect(arr.get(1)).toBe(2);
      expect(arr.get(2)).toBe(3);
      expect(arr.get(3)).toBe(4);
    });

    it('should insert at beginning', () => {
      const arr = new DynamicArray<number>();
      arr.push(2);
      arr.push(3);
      arr.insert(0, 1);
      expect(arr.get(0)).toBe(1);
      expect(arr.get(1)).toBe(2);
      expect(arr.get(2)).toBe(3);
    });

    it('should insert at end', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.insert(2, 3);
      expect(arr.size).toBe(3);
      expect(arr.get(2)).toBe(3);
    });

    it('should not insert for out of bounds index', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.insert(-1, 0);
      arr.insert(3, 0);
      arr.insert(100, 0);
      expect(arr.size).toBe(2);
    });

    it('should grow capacity when inserting to full array', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 4 });
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.push(4);
      expect(arr.capacity).toBe(4);
      arr.insert(2, 5);
      expect(arr.capacity).toBe(8);
      expect(arr.size).toBe(5);
    });

    it('should remove elements by index', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.push(4);
      const removed = arr.removeAt(1);
      expect(removed).toBe(2);
      expect(arr.size).toBe(3);
      expect(arr.get(0)).toBe(1);
      expect(arr.get(1)).toBe(3);
      expect(arr.get(2)).toBe(4);
    });

    it('should return undefined for out of bounds removeAt', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      expect(arr.removeAt(-1)).toBeUndefined();
      expect(arr.removeAt(1)).toBeUndefined();
      expect(arr.removeAt(100)).toBeUndefined();
      expect(arr.size).toBe(1);
    });
  });

  describe('first and last', () => {
    it('should return first element', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      expect(arr.first).toBe(1);
    });

    it('should return undefined for first of empty array', () => {
      const arr = new DynamicArray<number>();
      expect(arr.first).toBeUndefined();
    });

    it('should return last element', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      expect(arr.last).toBe(3);
    });

    it('should return undefined for last of empty array', () => {
      const arr = new DynamicArray<number>();
      expect(arr.last).toBeUndefined();
    });
  });

  describe('size and capacity', () => {
    it('should track length correctly', () => {
      const arr = new DynamicArray<number>();
      expect(arr.size).toBe(0);
      arr.push(1);
      expect(arr.size).toBe(1);
      arr.push(2);
      expect(arr.size).toBe(2);
      arr.pop();
      expect(arr.size).toBe(1);
      arr.clear();
      expect(arr.size).toBe(0);
    });

    it('should track capacity correctly and grow', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 2 });
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

  describe('isEmpty and isFull', () => {
    it('should return true for empty array', () => {
      const arr = new DynamicArray<number>();
      expect(arr.isEmpty()).toBe(true);
    });

    it('should return false for non-empty array', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      expect(arr.isEmpty()).toBe(false);
    });

    it('should return true after clearing', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.clear();
      expect(arr.isEmpty()).toBe(true);
    });

    it('should return false when not full', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 5 });
      arr.push(1);
      arr.push(2);
      expect(arr.isFull()).toBe(false);
    });

    it('should return true when full', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 3 });
      arr.push(1);
      arr.push(2);
      arr.push(3);
      expect(arr.isFull()).toBe(true);
    });
  });

  describe('toArray', () => {
    it('should convert to regular array', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      const result = arr.toArray();
      expect(result).toEqual([1, 2, 3]);
      expect(result).toBeInstanceOf(Array);
    });

    it('should return empty array for empty dynamic array', () => {
      const arr = new DynamicArray<number>();
      const result = arr.toArray();
      expect(result).toEqual([]);
    });
  });

  describe('fromArray', () => {
    it('should load from array', () => {
      const arr = new DynamicArray<number>();
      arr.fromArray([1, 2, 3]);
      expect(arr.size).toBe(3);
      expect(arr.toArray()).toEqual([1, 2, 3]);
    });

    it('should clear existing elements before loading', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.fromArray([3, 4, 5]);
      expect(arr.toArray()).toEqual([3, 4, 5]);
    });

    it('should load from empty array', () => {
      const arr = new DynamicArray<number>();
      arr.fromArray([]);
      expect(arr.size).toBe(0);
    });
  });

  describe('clear', () => {
    it('should clear all elements', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.clear();
      expect(arr.size).toBe(0);
      expect(arr.isEmpty()).toBe(true);
      expect(arr.get(0)).toBeUndefined();
      expect(arr.toArray()).toEqual([]);
    });

    it('should not affect capacity', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 8 });
      arr.push(1);
      arr.push(2);
      const capacityBefore = arr.capacity;
      arr.clear();
      expect(arr.capacity).toBe(capacityBefore);
    });
  });

  describe('forEach', () => {
    it('should iterate over all elements', () => {
      const arr = new DynamicArray<number>();
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
      const arr = new DynamicArray<number>();
      let count = 0;
      arr.forEach(() => {
        count++;
      });
      expect(count).toBe(0);
    });
  });

  describe('map', () => {
    it('should map elements to new type', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      const result = arr.map((x) => x * 2);
      expect(result.toArray()).toEqual([2, 4, 6]);
    });

    it('should preserve indices in map callback', () => {
      const arr = new DynamicArray<number>();
      arr.push(10);
      arr.push(20);
      arr.push(30);
      const result = arr.map((value, index) => value + index);
      expect(result.toArray()).toEqual([10, 21, 32]);
    });

    it('should return empty array for map on empty array', () => {
      const arr = new DynamicArray<number>();
      const result = arr.map((x) => x * 2);
      expect(result.toArray()).toEqual([]);
      expect(result.size).toBe(0);
    });

    it('should map to different type', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      const result = arr.map((x) => x.toString());
      expect(result.toArray()).toEqual(['1', '2', '3']);
    });
  });

  describe('filter', () => {
    it('should filter elements', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.push(4);
      arr.push(5);
      const result = arr.filter((x) => x % 2 === 0);
      expect(result.toArray()).toEqual([2, 4]);
    });

    it('should preserve indices in filter callback', () => {
      const arr = new DynamicArray<number>();
      arr.push(10);
      arr.push(15);
      arr.push(20);
      arr.push(25);
      const result = arr.filter((value, index) => index % 2 === 0);
      expect(result.toArray()).toEqual([10, 20]);
    });

    it('should return empty array when no elements pass filter', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      const result = arr.filter((x) => x > 10);
      expect(result.toArray()).toEqual([]);
      expect(result.size).toBe(0);
    });

    it('should filter empty array', () => {
      const arr = new DynamicArray<number>();
      const result = arr.filter(() => true);
      expect(result.toArray()).toEqual([]);
    });
  });

  describe('reduce', () => {
    it('should reduce to single value', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      const result = arr.reduce((acc, val) => acc + val, 0);
      expect(result).toBe(6);
    });

    it('should use initial value', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      const result = arr.reduce((acc, val) => acc + val, 10);
      expect(result).toBe(16);
    });

    it('should return initial value for empty array', () => {
      const arr = new DynamicArray<number>();
      const result = arr.reduce((acc, val) => acc + val, 42);
      expect(result).toBe(42);
    });
  });

  describe('find', () => {
    it('should find element matching predicate', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.push(4);
      const result = arr.find((x) => x > 2);
      expect(result).toBe(3);
    });

    it('should return undefined when no element matches', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      const result = arr.find((x) => x > 10);
      expect(result).toBeUndefined();
    });

    it('should return undefined for empty array', () => {
      const arr = new DynamicArray<number>();
      const result = arr.find((x) => x === 1);
      expect(result).toBeUndefined();
    });
  });

  describe('findIndex', () => {
    it('should find index of element matching predicate', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.push(4);
      const result = arr.findIndex((x) => x > 2);
      expect(result).toBe(2);
    });

    it('should return -1 when no element matches', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      const result = arr.findIndex((x) => x > 10);
      expect(result).toBe(-1);
    });

    it('should return -1 for empty array', () => {
      const arr = new DynamicArray<number>();
      const result = arr.findIndex((x) => x === 1);
      expect(result).toBe(-1);
    });
  });

  describe('indexOf and includes', () => {
    it('should find index of element', () => {
      const arr = new DynamicArray<number>();
      arr.push(10);
      arr.push(20);
      arr.push(30);
      expect(arr.indexOf(20)).toBe(1);
      expect(arr.indexOf(10)).toBe(0);
      expect(arr.indexOf(30)).toBe(2);
    });

    it('should return -1 for non-existent element', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      expect(arr.indexOf(3)).toBe(-1);
      expect(arr.indexOf(0)).toBe(-1);
    });

    it('should return -1 for empty array', () => {
      const arr = new DynamicArray<number>();
      expect(arr.indexOf(1)).toBe(-1);
    });

    it('should check if element exists', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      expect(arr.includes(2)).toBe(true);
      expect(arr.includes(4)).toBe(false);
    });

    it('should return false for empty array', () => {
      const arr = new DynamicArray<number>();
      expect(arr.includes(1)).toBe(false);
    });

    it('should use custom equality comparator', () => {
      const arr = new DynamicArray<{ id: number }>({
        equals: (a, b) => a.id === b.id,
      });
      arr.push({ id: 1 });
      arr.push({ id: 2 });
      expect(arr.indexOf({ id: 2 })).toBe(1);
    });
  });

  describe('contains', () => {
    it('should return true when element exists', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      expect(arr.contains(2)).toBe(true);
    });

    it('should return false when element does not exist', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      expect(arr.contains(4)).toBe(false);
    });
  });

  describe('slice', () => {
    it('should slice with default parameters', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      const result = arr.slice();
      expect(result.toArray()).toEqual([1, 2, 3]);
    });

    it('should slice with start parameter', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.push(4);
      const result = arr.slice(1);
      expect(result.toArray()).toEqual([2, 3, 4]);
    });

    it('should slice with start and end parameters', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.push(4);
      const result = arr.slice(1, 3);
      expect(result.toArray()).toEqual([2, 3]);
    });

    it('should handle negative start', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      const result = arr.slice(-2);
      expect(result.toArray()).toEqual([2, 3]);
    });

    it('should handle negative end', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.push(4);
      const result = arr.slice(0, -1);
      expect(result.toArray()).toEqual([1, 2, 3]);
    });

    it('should handle start greater than end', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      const result = arr.slice(2, 1);
      expect(result.toArray()).toEqual([]);
    });

    it('should slice empty array', () => {
      const arr = new DynamicArray<number>();
      const result = arr.slice();
      expect(result.toArray()).toEqual([]);
    });
  });

  describe('concat', () => {
    it('should concatenate two arrays', () => {
      const arr1 = new DynamicArray<number>();
      const arr2 = new DynamicArray<number>();
      arr1.push(1);
      arr1.push(2);
      arr2.push(3);
      arr2.push(4);
      const result = arr1.concat(arr2);
      expect(result.toArray()).toEqual([1, 2, 3, 4]);
      expect(result.size).toBe(4);
    });

    it('should concatenate with empty array', () => {
      const arr1 = new DynamicArray<number>();
      const arr2 = new DynamicArray<number>();
      arr1.push(1);
      arr1.push(2);
      const result = arr1.concat(arr2);
      expect(result.toArray()).toEqual([1, 2]);
      expect(result.size).toBe(2);
    });

    it('should preserve original arrays', () => {
      const arr1 = new DynamicArray<number>();
      const arr2 = new DynamicArray<number>();
      arr1.push(1);
      arr2.push(2);
      arr1.concat(arr2);
      expect(arr1.toArray()).toEqual([1]);
      expect(arr2.toArray()).toEqual([2]);
    });
  });

  describe('splice', () => {
    it('should remove elements and insert new ones', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.push(4);
      arr.push(5);
      const removed = arr.splice(1, 2, 10, 20);
      expect(removed.toArray()).toEqual([2, 3]);
      expect(arr.toArray()).toEqual([1, 10, 20, 4, 5]);
    });

    it('should remove elements without inserting', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.push(4);
      const removed = arr.splice(1, 2);
      expect(removed.toArray()).toEqual([2, 3]);
      expect(arr.toArray()).toEqual([1, 4]);
    });

    it('should insert at end', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.splice(2, 0, 3);
      expect(arr.toArray()).toEqual([1, 2, 3]);
    });

    it('should handle negative start', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.push(4);
      arr.push(5);
      const removed = arr.splice(-2, 1);
      expect(removed.toArray()).toEqual([4]);
      expect(arr.toArray()).toEqual([1, 2, 3, 5]);
    });

    it('should handle deleteCount larger than size', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      const removed = arr.splice(1, 10);
      expect(removed.toArray()).toEqual([2, 3]);
      expect(arr.toArray()).toEqual([1]);
    });
  });

  describe('join', () => {
    it('should join with default separator', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      expect(arr.join()).toBe('1,2,3');
    });

    it('should join with custom separator', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      expect(arr.join('-')).toBe('1-2-3');
    });

    it('should return empty string for empty array', () => {
      const arr = new DynamicArray<number>();
      expect(arr.join()).toBe('');
      expect(arr.join('-')).toBe('');
    });

    it('should join strings', () => {
      const arr = new DynamicArray<string>();
      arr.push('a');
      arr.push('b');
      arr.push('c');
      expect(arr.join('')).toBe('abc');
    });
  });

  describe('toString', () => {
    it('should convert to string with default separator', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      expect(arr.toString()).toBe('1,2,3');
    });

    it('should return empty string for empty array', () => {
      const arr = new DynamicArray<number>();
      expect(arr.toString()).toBe('');
    });
  });

  describe('reverse', () => {
    it('should reverse elements', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.reverse();
      expect(arr.toArray()).toEqual([3, 2, 1]);
    });

    it('should reverse even number of elements', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.push(4);
      arr.reverse();
      expect(arr.toArray()).toEqual([4, 3, 2, 1]);
    });

    it('should handle empty array', () => {
      const arr = new DynamicArray<number>();
      arr.reverse();
      expect(arr.toArray()).toEqual([]);
    });

    it('should handle single element', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.reverse();
      expect(arr.toArray()).toEqual([1]);
    });
  });

  describe('sort', () => {
    it('should sort numbers ascending', () => {
      const arr = new DynamicArray<number>();
      arr.push(3);
      arr.push(1);
      arr.push(4);
      arr.push(2);
      arr.sort();
      expect(arr.toArray()).toEqual([1, 2, 3, 4]);
    });

    it('should sort with custom comparator', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.push(4);
      arr.sort((a, b) => b - a);
      expect(arr.toArray()).toEqual([4, 3, 2, 1]);
    });

    it('should handle empty array', () => {
      const arr = new DynamicArray<number>();
      arr.sort();
      expect(arr.toArray()).toEqual([]);
    });

    it('should handle single element', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.sort();
      expect(arr.toArray()).toEqual([1]);
    });

    it('should sort strings', () => {
      const arr = new DynamicArray<string>();
      arr.push('banana');
      arr.push('apple');
      arr.push('cherry');
      arr.sort();
      expect(arr.toArray()).toEqual(['apple', 'banana', 'cherry']);
    });
  });

  describe('clone', () => {
    it('should clone array with elements', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 8, growthFactor: 2 });
      arr.push(1);
      arr.push(2);
      arr.push(3);
      const clone = arr.clone();
      expect(clone.toArray()).toEqual([1, 2, 3]);
      expect(clone.capacity).toBe(8);
      expect(clone.growthFactor).toBe(2);
    });

    it('should create independent copy', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      const clone = arr.clone();
      clone.push(3);
      expect(arr.toArray()).toEqual([1, 2]);
      expect(clone.toArray()).toEqual([1, 2, 3]);
    });

    it('should clone empty array', () => {
      const arr = new DynamicArray<number>();
      const clone = arr.clone();
      expect(clone.toArray()).toEqual([]);
      expect(clone.size).toBe(0);
    });

    it('should preserve custom equality comparator', () => {
      const arr = new DynamicArray<{ id: number }>({
        equals: (a, b) => a.id === b.id,
      });
      arr.push({ id: 1 });
      const clone = arr.clone();
      expect(clone.contains({ id: 1 })).toBe(true);
    });
  });

  describe('equals', () => {
    it('should return true for equal arrays', () => {
      const arr1 = new DynamicArray<number>();
      const arr2 = new DynamicArray<number>();
      arr1.push(1);
      arr1.push(2);
      arr2.push(1);
      arr2.push(2);
      expect(arr1.equals(arr2)).toBe(true);
    });

    it('should return false for different sizes', () => {
      const arr1 = new DynamicArray<number>();
      const arr2 = new DynamicArray<number>();
      arr1.push(1);
      arr1.push(2);
      arr2.push(1);
      expect(arr1.equals(arr2)).toBe(false);
    });

    it('should return false for different elements', () => {
      const arr1 = new DynamicArray<number>();
      const arr2 = new DynamicArray<number>();
      arr1.push(1);
      arr1.push(2);
      arr2.push(1);
      arr2.push(3);
      expect(arr1.equals(arr2)).toBe(false);
    });

    it('should return true for empty arrays', () => {
      const arr1 = new DynamicArray<number>();
      const arr2 = new DynamicArray<number>();
      expect(arr1.equals(arr2)).toBe(true);
    });

    it('should use custom equality comparator', () => {
      const arr1 = new DynamicArray<{ id: number }>({
        equals: (a, b) => a.id === b.id,
      });
      const arr2 = new DynamicArray<{ id: number }>({
        equals: (a, b) => a.id === b.id,
      });
      arr1.push({ id: 1 });
      arr2.push({ id: 1 });
      expect(arr1.equals(arr2)).toBe(true);
    });
  });

  describe('resize', () => {
    it('should resize to larger capacity', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 4 });
      arr.push(1);
      arr.push(2);
      arr.resize(8);
      expect(arr.capacity).toBe(8);
      expect(arr.size).toBe(2);
      expect(arr.get(0)).toBe(1);
      expect(arr.get(1)).toBe(2);
    });

    it('should resize to smaller capacity that fits elements', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 8 });
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.resize(4);
      expect(arr.capacity).toBe(4);
      expect(arr.size).toBe(3);
      expect(arr.get(0)).toBe(1);
      expect(arr.get(1)).toBe(2);
      expect(arr.get(2)).toBe(3);
    });

    it('should truncate elements when capacity is less than size', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 8 });
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.push(4);
      arr.push(5);
      arr.resize(2);
      expect(arr.capacity).toBe(2);
      expect(arr.size).toBe(2);
      expect(arr.toArray()).toEqual([1, 2]);
    });

    it('should resize empty array', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 8 });
      arr.resize(16);
      expect(arr.capacity).toBe(16);
      expect(arr.size).toBe(0);
    });

    it('should not resize to negative capacity', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 8 });
      arr.push(1);
      arr.push(2);
      arr.resize(-5);
      expect(arr.capacity).toBe(8);
      expect(arr.size).toBe(2);
    });

    it('should resize to zero capacity', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 8 });
      arr.push(1);
      arr.push(2);
      arr.resize(0);
      expect(arr.capacity).toBe(0);
      expect(arr.size).toBe(0);
      expect(arr.toArray()).toEqual([]);
    });
  });

  describe('trimToSize', () => {
    it('should reduce capacity to match size', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 16 });
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.trimToSize();
      expect(arr.capacity).toBe(3);
      expect(arr.size).toBe(3);
      expect(arr.toArray()).toEqual([1, 2, 3]);
    });

    it('should not change capacity when already trimmed', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 5 });
      arr.push(1);
      arr.push(2);
      arr.trimToSize();
      expect(arr.capacity).toBe(2);
    });

    it('should handle empty array', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 8 });
      arr.trimToSize();
      expect(arr.capacity).toBe(0);
      expect(arr.size).toBe(0);
    });
  });

  describe('ensureCapacity', () => {
    it('should increase capacity when needed', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 4 });
      arr.push(1);
      arr.push(2);
      arr.ensureCapacity(10);
      expect(arr.capacity).toBe(10);
      expect(arr.size).toBe(2);
    });

    it('should not increase capacity when sufficient', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 8 });
      arr.push(1);
      arr.push(2);
      arr.ensureCapacity(5);
      expect(arr.capacity).toBe(8);
      expect(arr.size).toBe(2);
    });
  });

  describe('compact', () => {
    it('should reduce capacity to match size', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 16 });
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.compact();
      expect(arr.capacity).toBe(3);
      expect(arr.size).toBe(3);
    });
  });

  describe('growthFactor', () => {
    it('should return growth factor', () => {
      const arr = new DynamicArray<number>({ growthFactor: 3 });
      expect(arr.growthFactor).toBe(3);
    });

    it('should use default growth factor', () => {
      const arr = new DynamicArray<number>();
      expect(arr.growthFactor).toBe(2);
    });
  });

  describe('iterator', () => {
    it('should support for...of iteration', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      const result: number[] = [];
      for (const value of arr) {
        result.push(value);
      }
      expect(result).toEqual([1, 2, 3]);
    });

    it('should iterate over empty array', () => {
      const arr = new DynamicArray<number>();
      const result = [...arr];
      expect(result).toEqual([]);
    });

    it('should support spread operator', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      const result = [...arr];
      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe('static from', () => {
    it('should create from array', () => {
      const arr = DynamicArray.from([1, 2, 3]);
      expect(arr.toArray()).toEqual([1, 2, 3]);
    });

    it('should create from empty array', () => {
      const arr = DynamicArray.from([]);
      expect(arr.toArray()).toEqual([]);
      expect(arr.size).toBe(0);
    });

    it('should use custom options', () => {
      const arr = DynamicArray.from([1, 2, 3], { initialCapacity: 10, growthFactor: 3 });
      expect(arr.toArray()).toEqual([1, 2, 3]);
      expect(arr.capacity).toBe(10);
      expect(arr.growthFactor).toBe(3);
    });

    it('should create from set', () => {
      const set = new Set([1, 2, 3]);
      const arr = DynamicArray.from(set);
      expect(arr.toArray()).toEqual([1, 2, 3]);
    });
  });

  describe('static of', () => {
    it('should create from arguments', () => {
      const arr = DynamicArray.of(1, 2, 3);
      expect(arr.toArray()).toEqual([1, 2, 3]);
    });

    it('should create from single argument', () => {
      const arr = DynamicArray.of(1);
      expect(arr.toArray()).toEqual([1]);
    });

    it('should create from no arguments', () => {
      const arr = DynamicArray.of();
      expect(arr.toArray()).toEqual([]);
    });
  });

  describe('growth strategies', () => {
    describe('geometric', () => {
      it('should double capacity by default', () => {
        const arr = new DynamicArray<number>({ initialCapacity: 4, growthStrategy: 'geometric' });
        for (let i = 0; i < 5; i++) {
          arr.push(i);
        }
        expect(arr.capacity).toBe(8);
      });

      it('should use custom growth factor', () => {
        const arr = new DynamicArray<number>({ initialCapacity: 4, growthStrategy: 'geometric', growthFactor: 3 });
        for (let i = 0; i < 5; i++) {
          arr.push(i);
        }
        expect(arr.capacity).toBe(12);
      });
    });

    describe('linear', () => {
      it('should add fixed amount', () => {
        const arr = new DynamicArray<number>({ initialCapacity: 4, growthStrategy: 'linear', growthFactor: 5 });
        for (let i = 0; i < 5; i++) {
          arr.push(i);
        }
        expect(arr.capacity).toBe(9);
      });
    });

    describe('fixed', () => {
      it('should add fixed amount', () => {
        const arr = new DynamicArray<number>({ initialCapacity: 4, growthStrategy: 'fixed', growthFactor: 5 });
        for (let i = 0; i < 5; i++) {
          arr.push(i);
        }
        expect(arr.capacity).toBe(9);
      });
    });

    describe('fibonacci', () => {
      it('should grow by fibonacci sequence', () => {
        const arr = new DynamicArray<number>({ initialCapacity: 4, growthStrategy: 'fibonacci' });
        expect(arr.capacity).toBe(4);
        for (let i = 0; i < 5; i++) {
          arr.push(i);
        }
        expect(arr.capacity).toBe(6);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty array operations', () => {
      const arr = new DynamicArray<number>();
      expect(arr.isEmpty()).toBe(true);
      expect(arr.size).toBe(0);
      expect(arr.get(0)).toBeUndefined();
      expect(arr.pop()).toBeUndefined();
      expect(arr.shift()).toBeUndefined();
      expect(arr.indexOf(1)).toBe(-1);
      expect(arr.includes(1)).toBe(false);
      expect(arr.toArray()).toEqual([]);
    });

    it('should handle out of bounds operations', () => {
      const arr = new DynamicArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      expect(arr.get(-1)).toBeUndefined();
      expect(arr.get(3)).toBeUndefined();
      expect(arr.get(100)).toBeUndefined();
      arr.set(-1, 10);
      arr.set(3, 10);
      arr.set(100, 10);
      expect(arr.get(0)).toBe(1);
      expect(arr.removeAt(-1)).toBeUndefined();
      expect(arr.removeAt(3)).toBeUndefined();
      expect(arr.removeAt(100)).toBeUndefined();
    });

    it('should handle zero capacity', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 0 });
      expect(arr.capacity).toBe(0);
      arr.push(1);
      expect(arr.capacity).toBe(1);
      expect(arr.get(0)).toBe(1);
    });

    it('should handle strings', () => {
      const arr = new DynamicArray<string>();
      arr.push('a');
      arr.push('b');
      arr.push('c');
      expect(arr.toArray()).toEqual(['a', 'b', 'c']);
      expect(arr.includes('b')).toBe(true);
      expect(arr.indexOf('c')).toBe(2);
    });

    it('should handle objects', () => {
      const arr = new DynamicArray<{ id: number }>();
      arr.push({ id: 1 });
      arr.push({ id: 2 });
      expect(arr.get(0)).toEqual({ id: 1 });
      expect(arr.contains({ id: 2 })).toBe(false);
      const obj = arr.get(1);
      expect(arr.contains(obj!)).toBe(true);
    });

    it('should handle mixed types', () => {
      const arr = new DynamicArray<number | string>();
      arr.push(1);
      arr.push('a');
      arr.push(2);
      expect(arr.toArray()).toEqual([1, 'a', 2]);
    });

    it('should handle rapid operations', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 1000 });
      for (let i = 0; i < 1000; i++) {
        arr.push(i);
      }
      expect(arr.size).toBe(1000);
      expect(arr.get(999)).toBe(999);
    });

    it('should handle alternating push and pop', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 5 });
      arr.push(1);
      arr.push(2);
      expect(arr.pop()).toBe(2);
      arr.push(3);
      arr.push(4);
      expect(arr.pop()).toBe(4);
      expect(arr.toArray()).toEqual([1, 3]);
    });

    it('should handle alternating shift and unshift', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 5 });
      arr.push(1);
      arr.push(2);
      expect(arr.shift()).toBe(1);
      arr.unshift(0);
      expect(arr.shift()).toBe(0);
      expect(arr.toArray()).toEqual([2]);
    });

    it('should handle many insert and remove operations', () => {
      const arr = new DynamicArray<number>({ initialCapacity: 10 });
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.insert(1, 5);
      arr.insert(3, 7);
      expect(arr.toArray()).toEqual([1, 5, 2, 7, 3]);
      arr.removeAt(1);
      arr.removeAt(3);
      expect(arr.toArray()).toEqual([1, 2, 7]);
    });
  });
});
