import { describe, it, expect } from 'vitest';
import { RingBuffer3 } from './src/core/ring-buffer-3/index.js';

describe('RingBuffer3', () => {
  describe('constructor', () => {
    it('should create buffer with power-of-two capacity', () => {
      const buffer = new RingBuffer3<number>(5);
      expect(buffer.capacity).toBe(8);
    });

    it('should create buffer with exact power-of-two capacity', () => {
      const buffer = new RingBuffer3<number>(8);
      expect(buffer.capacity).toBe(8);
    });

    it('should create buffer with minimum capacity of 1', () => {
      const buffer = new RingBuffer3<number>(0);
      expect(buffer.capacity).toBe(1);
    });

    it('should create empty buffer', () => {
      const buffer = new RingBuffer3<number>(4);
      expect(buffer.isEmpty).toBe(true);
      expect(buffer.isFull).toBe(false);
      expect(buffer.size).toBe(0);
    });
  });

  describe('push', () => {
    it('should add element to back', () => {
      const buffer = new RingBuffer3<number>(4);
      expect(buffer.push(1)).toBe(true);
      expect(buffer.size).toBe(1);
      expect(buffer.peekFront()).toBe(1);
      expect(buffer.peekBack()).toBe(1);
    });

    it('should add multiple elements', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.size).toBe(3);
      expect(buffer.peekFront()).toBe(1);
      expect(buffer.peekBack()).toBe(3);
    });

    it('should return false when buffer is full', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.push(4);
      expect(buffer.push(5)).toBe(false);
      expect(buffer.size).toBe(4);
    });

    it('should handle wrap-around', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.push(4);
      buffer.shift();
      buffer.shift();
      buffer.push(5);
      buffer.push(6);
      expect(buffer.toArray()).toEqual([3, 4, 5, 6]);
    });
  });

  describe('pop', () => {
    it('should remove element from back', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.pop()).toBe(3);
      expect(buffer.size).toBe(2);
      expect(buffer.peekBack()).toBe(2);
    });

    it('should return undefined for empty buffer', () => {
      const buffer = new RingBuffer3<number>(4);
      expect(buffer.pop()).toBe(undefined);
    });

    it('should remove all elements', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.pop();
      buffer.pop();
      buffer.pop();
      expect(buffer.isEmpty).toBe(true);
    });

    it('should handle wrap-around', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.push(4);
      buffer.shift();
      buffer.push(5);
      expect(buffer.pop()).toBe(5);
      expect(buffer.toArray()).toEqual([2, 3, 4]);
    });
  });

  describe('shift', () => {
    it('should remove element from front', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.shift()).toBe(1);
      expect(buffer.size).toBe(2);
      expect(buffer.peekFront()).toBe(2);
    });

    it('should return undefined for empty buffer', () => {
      const buffer = new RingBuffer3<number>(4);
      expect(buffer.shift()).toBe(undefined);
    });

    it('should remove all elements', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.shift();
      buffer.shift();
      buffer.shift();
      expect(buffer.isEmpty).toBe(true);
    });

    it('should handle wrap-around', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.push(4);
      buffer.shift();
      buffer.shift();
      buffer.push(5);
      buffer.push(6);
      expect(buffer.shift()).toBe(3);
      expect(buffer.toArray()).toEqual([4, 5, 6]);
    });
  });

  describe('unshift', () => {
    it('should add element to front', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.unshift(1);
      expect(buffer.size).toBe(1);
      expect(buffer.peekFront()).toBe(1);
      expect(buffer.peekBack()).toBe(1);
    });

    it('should add multiple elements', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.unshift(3);
      buffer.unshift(2);
      buffer.unshift(1);
      expect(buffer.toArray()).toEqual([1, 2, 3]);
    });

    it('should return false when buffer is full', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.push(4);
      expect(buffer.unshift(0)).toBe(false);
      expect(buffer.size).toBe(4);
    });

    it('should handle wrap-around', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.shift();
      buffer.unshift(0);
      expect(buffer.toArray()).toEqual([0, 2, 3]);
    });
  });

  describe('peekFront', () => {
    it('should return front element', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(1);
      buffer.push(2);
      expect(buffer.peekFront()).toBe(1);
    });

    it('should return undefined for empty buffer', () => {
      const buffer = new RingBuffer3<number>(4);
      expect(buffer.peekFront()).toBe(undefined);
    });

    it('should not remove element', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(1);
      buffer.peekFront();
      expect(buffer.size).toBe(1);
      expect(buffer.peekFront()).toBe(1);
    });
  });

  describe('peekBack', () => {
    it('should return back element', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(1);
      buffer.push(2);
      expect(buffer.peekBack()).toBe(2);
    });

    it('should return undefined for empty buffer', () => {
      const buffer = new RingBuffer3<number>(4);
      expect(buffer.peekBack()).toBe(undefined);
    });

    it('should not remove element', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(1);
      buffer.push(2);
      buffer.peekBack();
      expect(buffer.size).toBe(2);
      expect(buffer.peekBack()).toBe(2);
    });
  });

  describe('isEmpty', () => {
    it('should be true for empty buffer', () => {
      const buffer = new RingBuffer3<number>(4);
      expect(buffer.isEmpty).toBe(true);
    });

    it('should be false for non-empty buffer', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(1);
      expect(buffer.isEmpty).toBe(false);
    });

    it('should become true after removing all elements', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(1);
      buffer.shift();
      expect(buffer.isEmpty).toBe(true);
    });
  });

  describe('isFull', () => {
    it('should be false for empty buffer', () => {
      const buffer = new RingBuffer3<number>(4);
      expect(buffer.isFull).toBe(false);
    });

    it('should be true when capacity is reached', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.push(4);
      expect(buffer.isFull).toBe(true);
    });

    it('should become false after removing element', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.push(4);
      buffer.shift();
      expect(buffer.isFull).toBe(false);
    });
  });

  describe('size', () => {
    it('should be 0 for empty buffer', () => {
      const buffer = new RingBuffer3<number>(4);
      expect(buffer.size).toBe(0);
    });

    it('should increase with push', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(1);
      buffer.push(2);
      expect(buffer.size).toBe(2);
    });

    it('should decrease with pop', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(1);
      buffer.push(2);
      buffer.pop();
      expect(buffer.size).toBe(1);
    });

    it('should decrease with shift', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(1);
      buffer.push(2);
      buffer.shift();
      expect(buffer.size).toBe(1);
    });

    it('should increase with unshift', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.unshift(1);
      buffer.unshift(2);
      expect(buffer.size).toBe(2);
    });
  });

  describe('capacity', () => {
    it('should return the power-of-two capacity', () => {
      const buffer = new RingBuffer3<number>(10);
      expect(buffer.capacity).toBe(16);
    });

    it('should remain constant', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(1);
      buffer.push(2);
      buffer.shift();
      expect(buffer.capacity).toBe(4);
    });
  });

  describe('clear', () => {
    it('should empty the buffer', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.clear();
      expect(buffer.isEmpty).toBe(true);
      expect(buffer.size).toBe(0);
    });

    it('should reset head and tail', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(1);
      buffer.push(2);
      buffer.shift();
      buffer.clear();
      buffer.push(5);
      expect(buffer.peekFront()).toBe(5);
      expect(buffer.peekBack()).toBe(5);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty buffer', () => {
      const buffer = new RingBuffer3<number>(4);
      expect(buffer.toArray()).toEqual([]);
    });

    it('should return all elements in order', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.toArray()).toEqual([1, 2, 3]);
    });

    it('should handle wrap-around', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.push(4);
      buffer.shift();
      buffer.shift();
      buffer.push(5);
      buffer.push(6);
      expect(buffer.toArray()).toEqual([3, 4, 5, 6]);
    });

    it('should not modify buffer', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(1);
      buffer.push(2);
      buffer.toArray();
      expect(buffer.size).toBe(2);
    });
  });

  describe('forEach', () => {
    it('should not call callback for empty buffer', () => {
      const buffer = new RingBuffer3<number>(4);
      let calls = 0;
      buffer.forEach(() => calls++);
      expect(calls).toBe(0);
    });

    it('should call callback for each element', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      const result: number[] = [];
      buffer.forEach((value) => result.push(value));
      expect(result).toEqual([1, 2, 3]);
    });

    it('should pass correct index', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(10);
      buffer.push(20);
      buffer.push(30);
      const indices: number[] = [];
      buffer.forEach((_, index) => indices.push(index));
      expect(indices).toEqual([0, 1, 2]);
    });

    it('should handle wrap-around', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.push(4);
      buffer.shift();
      buffer.shift();
      buffer.push(5);
      buffer.push(6);
      const result: number[] = [];
      buffer.forEach((value) => result.push(value));
      expect(result).toEqual([3, 4, 5, 6]);
    });
  });

  describe('get', () => {
    it('should return element at index', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.get(0)).toBe(1);
      expect(buffer.get(1)).toBe(2);
      expect(buffer.get(2)).toBe(3);
    });

    it('should return undefined for negative index', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(1);
      buffer.push(2);
      expect(buffer.get(-1)).toBe(undefined);
    });

    it('should return undefined for index >= size', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(1);
      buffer.push(2);
      expect(buffer.get(2)).toBe(undefined);
      expect(buffer.get(5)).toBe(undefined);
    });

    it('should return undefined for empty buffer', () => {
      const buffer = new RingBuffer3<number>(4);
      expect(buffer.get(0)).toBe(undefined);
    });

    it('should handle wrap-around', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.push(4);
      buffer.shift();
      buffer.shift();
      buffer.push(5);
      buffer.push(6);
      expect(buffer.get(0)).toBe(3);
      expect(buffer.get(1)).toBe(4);
      expect(buffer.get(2)).toBe(5);
      expect(buffer.get(3)).toBe(6);
    });
  });

  describe('single element operations', () => {
    it('should handle push and pop single element', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(42);
      expect(buffer.pop()).toBe(42);
      expect(buffer.isEmpty).toBe(true);
    });

    it('should handle push and shift single element', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(42);
      expect(buffer.shift()).toBe(42);
      expect(buffer.isEmpty).toBe(true);
    });

    it('should handle unshift and shift single element', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.unshift(42);
      expect(buffer.shift()).toBe(42);
      expect(buffer.isEmpty).toBe(true);
    });

    it('should handle unshift and pop single element', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.unshift(42);
      expect(buffer.pop()).toBe(42);
      expect(buffer.isEmpty).toBe(true);
    });
  });

  describe('full buffer operations', () => {
    it('should not allow push when full', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.push(4);
      expect(buffer.push(5)).toBe(false);
      expect(buffer.size).toBe(4);
    });

    it('should not allow unshift when full', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.push(4);
      expect(buffer.unshift(0)).toBe(false);
      expect(buffer.size).toBe(4);
    });

    it('should allow pop when full', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.push(4);
      expect(buffer.pop()).toBe(4);
      expect(buffer.size).toBe(3);
    });

    it('should allow shift when full', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.push(4);
      expect(buffer.shift()).toBe(1);
      expect(buffer.size).toBe(3);
    });
  });

  describe('mixed operations', () => {
    it('should handle alternating push and shift', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.push(1);
      buffer.push(2);
      expect(buffer.shift()).toBe(1);
      buffer.push(3);
      expect(buffer.shift()).toBe(2);
      buffer.push(4);
      expect(buffer.toArray()).toEqual([3, 4]);
    });

    it('should handle alternating unshift and pop', () => {
      const buffer = new RingBuffer3<number>(4);
      buffer.unshift(3);
      buffer.unshift(2);
      expect(buffer.pop()).toBe(3);
      buffer.unshift(1);
      expect(buffer.pop()).toBe(2);
      expect(buffer.toArray()).toEqual([1]);
    });

    it('should handle push and unshift together', () => {
      const buffer = new RingBuffer3<number>(8);
      buffer.push(2);
      buffer.unshift(1);
      buffer.push(3);
      buffer.unshift(0);
      expect(buffer.toArray()).toEqual([0, 1, 2, 3]);
    });
  });

  describe('type safety', () => {
    it('should work with strings', () => {
      const buffer = new RingBuffer3<string>(4);
      buffer.push('a');
      buffer.push('b');
      expect(buffer.peekFront()).toBe('a');
      expect(buffer.pop()).toBe('b');
    });

    it('should work with objects', () => {
      const buffer = new RingBuffer3<{ id: number }>(4);
      buffer.push({ id: 1 });
      buffer.push({ id: 2 });
      expect(buffer.get(0)).toEqual({ id: 1 });
    });

    it('should work with null', () => {
      const buffer = new RingBuffer3<number | null>(4);
      buffer.push(null);
      buffer.push(1);
      expect(buffer.get(0)).toBe(null);
      expect(buffer.get(1)).toBe(1);
    });

    it('should work with undefined', () => {
      const buffer = new RingBuffer3<number | undefined>(4);
      buffer.push(undefined);
      buffer.push(1);
      expect(buffer.get(0)).toBe(undefined);
      expect(buffer.get(1)).toBe(1);
    });
  });

  describe('power-of-two capacity', () => {
    it('should round up to next power of two', () => {
      expect(new RingBuffer3<number>(5).capacity).toBe(8);
      expect(new RingBuffer3<number>(6).capacity).toBe(8);
      expect(new RingBuffer3<number>(7).capacity).toBe(8);
      expect(new RingBuffer3<number>(9).capacity).toBe(16);
    });

    it('should use exact power of two', () => {
      expect(new RingBuffer3<number>(1).capacity).toBe(1);
      expect(new RingBuffer3<number>(2).capacity).toBe(2);
      expect(new RingBuffer3<number>(4).capacity).toBe(4);
      expect(new RingBuffer3<number>(8).capacity).toBe(8);
    });
  });
});
