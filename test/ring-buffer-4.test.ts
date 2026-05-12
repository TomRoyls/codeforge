import { describe, it, expect } from 'vitest';
import { RingBuffer4 } from './src/core/ring-buffer-4/index.js';

describe('RingBuffer4', () => {
  describe('constructor', () => {
    it('should create buffer with given capacity', () => {
      const buffer = new RingBuffer4<number>(5);
      expect(buffer.capacity).toBe(5);
      expect(buffer.size).toBe(0);
      expect(buffer.isEmpty).toBe(true);
      expect(buffer.isFull).toBe(false);
    });

    it('should throw error for zero capacity', () => {
      expect(() => new RingBuffer4<number>(0)).toThrow('Capacity must be a positive integer');
    });

    it('should throw error for negative capacity', () => {
      expect(() => new RingBuffer4<number>(-1)).toThrow('Capacity must be a positive integer');
    });

    it('should throw error for non-integer capacity', () => {
      expect(() => new RingBuffer4<number>(3.5)).toThrow('Capacity must be a positive integer');
    });
  });

  describe('push and pop', () => {
    it('should push and pop values', () => {
      const buffer = new RingBuffer4<number>(3);
      expect(buffer.push(1)).toBe(true);
      expect(buffer.push(2)).toBe(true);
      expect(buffer.push(3)).toBe(true);
      expect(buffer.size).toBe(3);
      expect(buffer.pop()).toBe(3);
      expect(buffer.pop()).toBe(2);
      expect(buffer.pop()).toBe(1);
      expect(buffer.isEmpty).toBe(true);
    });

    it('should return false when pushing to full buffer', () => {
      const buffer = new RingBuffer4<number>(2);
      expect(buffer.push(1)).toBe(true);
      expect(buffer.push(2)).toBe(true);
      expect(buffer.push(3)).toBe(false);
      expect(buffer.size).toBe(2);
    });

    it('should return undefined when popping from empty buffer', () => {
      const buffer = new RingBuffer4<number>(3);
      expect(buffer.pop()).toBe(undefined);
    });

    it('should handle wrap-around with push/pop', () => {
      const buffer = new RingBuffer4<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.pop();
      buffer.push(4);
      expect(buffer.toArray()).toEqual([1, 2, 4]);
    });
  });

  describe('shift and unshift', () => {
    it('should shift and unshift values', () => {
      const buffer = new RingBuffer4<number>(3);
      expect(buffer.unshift(3)).toBe(true);
      expect(buffer.unshift(2)).toBe(true);
      expect(buffer.unshift(1)).toBe(true);
      expect(buffer.size).toBe(3);
      expect(buffer.shift()).toBe(1);
      expect(buffer.shift()).toBe(2);
      expect(buffer.shift()).toBe(3);
      expect(buffer.isEmpty).toBe(true);
    });

    it('should return false when unshifting to full buffer', () => {
      const buffer = new RingBuffer4<number>(2);
      expect(buffer.unshift(1)).toBe(true);
      expect(buffer.unshift(2)).toBe(true);
      expect(buffer.unshift(3)).toBe(false);
      expect(buffer.size).toBe(2);
    });

    it('should return undefined when shifting from empty buffer', () => {
      const buffer = new RingBuffer4<number>(3);
      expect(buffer.shift()).toBe(undefined);
    });

    it('should handle wrap-around with shift/unshift', () => {
      const buffer = new RingBuffer4<number>(3);
      buffer.unshift(1);
      buffer.unshift(2);
      buffer.unshift(3);
      buffer.shift();
      buffer.unshift(4);
      expect(buffer.toArray()).toEqual([4, 2, 1]);
    });
  });

  describe('peekFront and peekBack', () => {
    it('should peek front and back values', () => {
      const buffer = new RingBuffer4<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.peekFront()).toBe(1);
      expect(buffer.peekBack()).toBe(3);
    });

    it('should return undefined for empty buffer', () => {
      const buffer = new RingBuffer4<number>(3);
      expect(buffer.peekFront()).toBe(undefined);
      expect(buffer.peekBack()).toBe(undefined);
    });

    it('should not modify buffer when peeking', () => {
      const buffer = new RingBuffer4<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.peekFront();
      buffer.peekBack();
      expect(buffer.size).toBe(2);
    });

    it('should handle single element', () => {
      const buffer = new RingBuffer4<number>(3);
      buffer.push(5);
      expect(buffer.peekFront()).toBe(5);
      expect(buffer.peekBack()).toBe(5);
    });
  });

  describe('isEmpty and isFull', () => {
    it('should be empty initially', () => {
      const buffer = new RingBuffer4<number>(3);
      expect(buffer.isEmpty).toBe(true);
      expect(buffer.isFull).toBe(false);
    });

    it('should become full after adding capacity elements', () => {
      const buffer = new RingBuffer4<number>(2);
      buffer.push(1);
      buffer.push(2);
      expect(buffer.isEmpty).toBe(false);
      expect(buffer.isFull).toBe(true);
    });

    it('should become empty after removing all elements', () => {
      const buffer = new RingBuffer4<number>(2);
      buffer.push(1);
      buffer.push(2);
      buffer.pop();
      buffer.pop();
      expect(buffer.isEmpty).toBe(true);
      expect(buffer.isFull).toBe(false);
    });
  });

  describe('size', () => {
    it('should return correct size', () => {
      const buffer = new RingBuffer4<number>(3);
      expect(buffer.size).toBe(0);
      buffer.push(1);
      expect(buffer.size).toBe(1);
      buffer.push(2);
      expect(buffer.size).toBe(2);
      buffer.pop();
      expect(buffer.size).toBe(1);
    });

    it('should never exceed capacity', () => {
      const buffer = new RingBuffer4<number>(2);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.size).toBe(2);
    });
  });

  describe('clear', () => {
    it('should clear all elements', () => {
      const buffer = new RingBuffer4<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.clear();
      expect(buffer.isEmpty).toBe(true);
      expect(buffer.size).toBe(0);
      expect(buffer.pop()).toBe(undefined);
    });

    it('should allow pushing after clear', () => {
      const buffer = new RingBuffer4<number>(2);
      buffer.push(1);
      buffer.push(2);
      buffer.clear();
      expect(buffer.push(3)).toBe(true);
      expect(buffer.push(4)).toBe(true);
      expect(buffer.size).toBe(2);
    });
  });

  describe('toArray', () => {
    it('should convert to array', () => {
      const buffer = new RingBuffer4<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.toArray()).toEqual([1, 2, 3]);
    });

    it('should return empty array for empty buffer', () => {
      const buffer = new RingBuffer4<number>(3);
      expect(buffer.toArray()).toEqual([]);
    });

    it('should handle wrap-around', () => {
      const buffer = new RingBuffer4<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.shift();
      buffer.push(4);
      expect(buffer.toArray()).toEqual([2, 3, 4]);
    });
  });

  describe('forEach', () => {
    it('should iterate over all elements', () => {
      const buffer = new RingBuffer4<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      const result: number[] = [];
      buffer.forEach((value, index) => {
        result.push(value);
      });
      expect(result).toEqual([1, 2, 3]);
    });

    it('should provide correct indices', () => {
      const buffer = new RingBuffer4<number>(3);
      buffer.push(10);
      buffer.push(20);
      buffer.push(30);
      const indices: number[] = [];
      buffer.forEach((_, index) => {
        indices.push(index);
      });
      expect(indices).toEqual([0, 1, 2]);
    });

    it('should not execute for empty buffer', () => {
      const buffer = new RingBuffer4<number>(3);
      let called = false;
      buffer.forEach(() => {
        called = true;
      });
      expect(called).toBe(false);
    });
  });

  describe('get and set', () => {
    it('should get element at index', () => {
      const buffer = new RingBuffer4<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.get(0)).toBe(1);
      expect(buffer.get(1)).toBe(2);
      expect(buffer.get(2)).toBe(3);
    });

    it('should return undefined for invalid index', () => {
      const buffer = new RingBuffer4<number>(3);
      buffer.push(1);
      buffer.push(2);
      expect(buffer.get(-1)).toBe(undefined);
      expect(buffer.get(2)).toBe(undefined);
      expect(buffer.get(10)).toBe(undefined);
    });

    it('should set element at index', () => {
      const buffer = new RingBuffer4<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.set(1, 99)).toBe(true);
      expect(buffer.get(1)).toBe(99);
    });

    it('should return false for invalid set index', () => {
      const buffer = new RingBuffer4<number>(3);
      buffer.push(1);
      buffer.push(2);
      expect(buffer.set(-1, 99)).toBe(false);
      expect(buffer.set(2, 99)).toBe(false);
      expect(buffer.set(10, 99)).toBe(false);
    });

    it('should handle wrap-around with get/set', () => {
      const buffer = new RingBuffer4<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.shift();
      buffer.push(4);
      expect(buffer.get(0)).toBe(2);
      expect(buffer.get(1)).toBe(3);
      expect(buffer.get(2)).toBe(4);
    });
  });

  describe('iterator', () => {
    it('should iterate using for...of', () => {
      const buffer = new RingBuffer4<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      const result: number[] = [];
      for (const value of buffer) {
        result.push(value);
      }
      expect(result).toEqual([1, 2, 3]);
    });

    it('should support spread operator', () => {
      const buffer = new RingBuffer4<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      const arr = [...buffer];
      expect(arr).toEqual([1, 2, 3]);
    });

    it('should handle wrap-around', () => {
      const buffer = new RingBuffer4<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.shift();
      buffer.push(4);
      const result: number[] = [];
      for (const value of buffer) {
        result.push(value);
      }
      expect(result).toEqual([2, 3, 4]);
    });

    it('should work with Array.from', () => {
      const buffer = new RingBuffer4<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      const arr = Array.from(buffer);
      expect(arr).toEqual([1, 2, 3]);
    });

    it('should work with destructuring', () => {
      const buffer = new RingBuffer4<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      const [first, second, third] = buffer;
      expect(first).toBe(1);
      expect(second).toBe(2);
      expect(third).toBe(3);
    });
  });

  describe('entries', () => {
    it('should return index-value pairs', () => {
      const buffer = new RingBuffer4<number>(3);
      buffer.push(10);
      buffer.push(20);
      buffer.push(30);
      const result: [number, number][] = [];
      for (const [index, value] of buffer.entries()) {
        result.push([index, value]);
      }
      expect(result).toEqual([[0, 10], [1, 20], [2, 30]]);
    });

    it('should be empty for empty buffer', () => {
      const buffer = new RingBuffer4<number>(3);
      const result: [number, number][] = [];
      for (const entry of buffer.entries()) {
        result.push(entry);
      }
      expect(result).toEqual([]);
    });

    it('should handle wrap-around', () => {
      const buffer = new RingBuffer4<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.shift();
      buffer.push(4);
      const result: [number, number][] = [];
      for (const entry of buffer.entries()) {
        result.push(entry);
      }
      expect(result).toEqual([[0, 2], [1, 3], [2, 4]]);
    });
  });

  describe('slice', () => {
    it('should return full array with no args', () => {
      const buffer = new RingBuffer4<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.slice()).toEqual([1, 2, 3]);
    });

    it('should return slice from start index', () => {
      const buffer = new RingBuffer4<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.slice(1)).toEqual([2, 3]);
    });

    it('should return slice from start to end index', () => {
      const buffer = new RingBuffer4<number>(4);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.push(4);
      expect(buffer.slice(1, 3)).toEqual([2, 3]);
    });

    it('should clamp negative start to 0', () => {
      const buffer = new RingBuffer4<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.slice(-1)).toEqual([1, 2, 3]);
    });

    it('should clamp end to size', () => {
      const buffer = new RingBuffer4<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.slice(0, 10)).toEqual([1, 2, 3]);
    });

    it('should handle wrap-around', () => {
      const buffer = new RingBuffer4<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.shift();
      buffer.push(4);
      expect(buffer.slice(0, 2)).toEqual([2, 3]);
    });

    it('should return empty array for empty slice', () => {
      const buffer = new RingBuffer4<number>(3);
      buffer.push(1);
      buffer.push(2);
      expect(buffer.slice(2, 2)).toEqual([]);
    });
  });

  describe('indexOf', () => {
    it('should find index of value', () => {
      const buffer = new RingBuffer4<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.indexOf(2)).toBe(1);
    });

    it('should return -1 for value not found', () => {
      const buffer = new RingBuffer4<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.indexOf(99)).toBe(-1);
    });

    it('should find first occurrence', () => {
      const buffer = new RingBuffer4<number>(4);
      buffer.push(1);
      buffer.push(2);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.indexOf(2)).toBe(1);
    });

    it('should work with strings', () => {
      const buffer = new RingBuffer4<string>(3);
      buffer.push('a');
      buffer.push('b');
      buffer.push('c');
      expect(buffer.indexOf('b')).toBe(1);
    });

    it('should handle wrap-around', () => {
      const buffer = new RingBuffer4<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.shift();
      buffer.push(4);
      expect(buffer.indexOf(3)).toBe(1);
    });
  });

  describe('contains', () => {
    it('should return true if value exists', () => {
      const buffer = new RingBuffer4<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.contains(2)).toBe(true);
    });

    it('should return false if value does not exist', () => {
      const buffer = new RingBuffer4<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.contains(99)).toBe(false);
    });

    it('should work with strings', () => {
      const buffer = new RingBuffer4<string>(3);
      buffer.push('hello');
      buffer.push('world');
      expect(buffer.contains('world')).toBe(true);
      expect(buffer.contains('test')).toBe(false);
    });
  });

  describe('mixed operations', () => {
    it('should handle push, shift, unshift, pop sequence', () => {
      const buffer = new RingBuffer4<number>(5);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.shift()).toBe(1);
      buffer.unshift(0);
      expect(buffer.pop()).toBe(3);
      expect(buffer.toArray()).toEqual([0, 2]);
    });

    it('should maintain consistency through multiple operations', () => {
      const buffer = new RingBuffer4<number>(4);
      buffer.push(1);
      buffer.push(2);
      buffer.shift();
      buffer.push(3);
      buffer.push(4);
      buffer.shift();
      buffer.unshift(0);
      expect(buffer.toArray()).toEqual([0, 3, 4]);
      expect(buffer.size).toBe(3);
    });
  });

  describe('edge cases', () => {
    it('should handle single element buffer', () => {
      const buffer = new RingBuffer4<number>(1);
      expect(buffer.push(5)).toBe(true);
      expect(buffer.isFull).toBe(true);
      expect(buffer.push(6)).toBe(false);
      expect(buffer.pop()).toBe(5);
      expect(buffer.isEmpty).toBe(true);
    });

    it('should handle string elements', () => {
      const buffer = new RingBuffer4<string>(3);
      buffer.push('hello');
      buffer.push('world');
      buffer.push('test');
      expect(buffer.toArray()).toEqual(['hello', 'world', 'test']);
    });

    it('should handle object elements', () => {
      const buffer = new RingBuffer4<{ id: number }>(2);
      buffer.push({ id: 1 });
      buffer.push({ id: 2 });
      expect(buffer.get(0)).toEqual({ id: 1 });
    });
  });
});
