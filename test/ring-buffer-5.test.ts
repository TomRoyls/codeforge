import { describe, it, expect } from 'vitest';
import { RingBuffer5 } from '../src/core/ring-buffer-5/index.js';

describe('RingBuffer5', () => {
  describe('constructor', () => {
    it('should create buffer with given capacity', () => {
      const buffer = new RingBuffer5<number>(5);
      expect(buffer.capacity).toBe(5);
      expect(buffer.size).toBe(0);
      expect(buffer.isEmpty).toBe(true);
      expect(buffer.isFull).toBe(false);
    });

    it('should throw error for zero capacity', () => {
      expect(() => new RingBuffer5<number>(0)).toThrow('Capacity must be a positive integer');
    });

    it('should throw error for negative capacity', () => {
      expect(() => new RingBuffer5<number>(-1)).toThrow('Capacity must be a positive integer');
    });

    it('should throw error for non-integer capacity', () => {
      expect(() => new RingBuffer5<number>(3.5)).toThrow('Capacity must be a positive integer');
    });
  });

  describe('push and pop', () => {
    it('should push and pop values', () => {
      const buffer = new RingBuffer5<number>(3);
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
      const buffer = new RingBuffer5<number>(2);
      expect(buffer.push(1)).toBe(true);
      expect(buffer.push(2)).toBe(true);
      expect(buffer.push(3)).toBe(false);
      expect(buffer.size).toBe(2);
    });

    it('should return undefined when popping from empty buffer', () => {
      const buffer = new RingBuffer5<number>(3);
      expect(buffer.pop()).toBe(undefined);
    });

    it('should handle wrap-around with push/pop', () => {
      const buffer = new RingBuffer5<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.pop();
      buffer.push(4);
      expect(buffer.toArray()).toEqual([1, 2, 4]);
    });
  });

  describe('enqueue and dequeue', () => {
    it('should enqueue and dequeue values', () => {
      const buffer = new RingBuffer5<number>(3);
      expect(buffer.enqueue(1)).toBe(true);
      expect(buffer.enqueue(2)).toBe(true);
      expect(buffer.enqueue(3)).toBe(true);
      expect(buffer.size).toBe(3);
      expect(buffer.dequeue()).toBe(1);
      expect(buffer.dequeue()).toBe(2);
      expect(buffer.dequeue()).toBe(3);
      expect(buffer.isEmpty).toBe(true);
    });

    it('should return false when enqueuing to full buffer', () => {
      const buffer = new RingBuffer5<number>(2);
      expect(buffer.enqueue(1)).toBe(true);
      expect(buffer.enqueue(2)).toBe(true);
      expect(buffer.enqueue(3)).toBe(false);
      expect(buffer.size).toBe(2);
    });

    it('should return undefined when dequeuing from empty buffer', () => {
      const buffer = new RingBuffer5<number>(3);
      expect(buffer.dequeue()).toBe(undefined);
    });

    it('should handle wrap-around with enqueue/dequeue', () => {
      const buffer = new RingBuffer5<number>(3);
      buffer.enqueue(1);
      buffer.enqueue(2);
      buffer.enqueue(3);
      buffer.dequeue();
      buffer.enqueue(4);
      expect(buffer.toArray()).toEqual([2, 3, 4]);
    });
  });

  describe('peek', () => {
    it('should peek front value', () => {
      const buffer = new RingBuffer5<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.peek()).toBe(1);
    });

    it('should return undefined for empty buffer', () => {
      const buffer = new RingBuffer5<number>(3);
      expect(buffer.peek()).toBe(undefined);
    });

    it('should not modify buffer when peeking', () => {
      const buffer = new RingBuffer5<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.peek();
      expect(buffer.size).toBe(2);
    });

    it('should handle single element', () => {
      const buffer = new RingBuffer5<number>(3);
      buffer.push(5);
      expect(buffer.peek()).toBe(5);
    });

    it('should peek correct value after dequeues', () => {
      const buffer = new RingBuffer5<number>(4);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.push(4);
      buffer.dequeue();
      buffer.dequeue();
      expect(buffer.peek()).toBe(3);
    });
  });

  describe('peekAt', () => {
    it('should peek at specific index', () => {
      const buffer = new RingBuffer5<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.peekAt(0)).toBe(1);
      expect(buffer.peekAt(1)).toBe(2);
      expect(buffer.peekAt(2)).toBe(3);
    });

    it('should return undefined for invalid index', () => {
      const buffer = new RingBuffer5<number>(3);
      buffer.push(1);
      buffer.push(2);
      expect(buffer.peekAt(-1)).toBe(undefined);
      expect(buffer.peekAt(2)).toBe(undefined);
      expect(buffer.peekAt(10)).toBe(undefined);
    });

    it('should handle wrap-around', () => {
      const buffer = new RingBuffer5<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.dequeue();
      buffer.push(4);
      expect(buffer.peekAt(0)).toBe(2);
      expect(buffer.peekAt(1)).toBe(3);
      expect(buffer.peekAt(2)).toBe(4);
    });

    it('should return undefined for empty buffer', () => {
      const buffer = new RingBuffer5<number>(3);
      expect(buffer.peekAt(0)).toBe(undefined);
    });
  });

  describe('forEach', () => {
    it('should iterate over all elements', () => {
      const buffer = new RingBuffer5<number>(3);
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
      const buffer = new RingBuffer5<number>(3);
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
      const buffer = new RingBuffer5<number>(3);
      let called = false;
      buffer.forEach(() => {
        called = true;
      });
      expect(called).toBe(false);
    });

    it('should handle wrap-around', () => {
      const buffer = new RingBuffer5<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.dequeue();
      buffer.push(4);
      const result: number[] = [];
      buffer.forEach((value) => {
        result.push(value);
      });
      expect(result).toEqual([2, 3, 4]);
    });
  });

  describe('filter', () => {
    it('should filter elements by predicate', () => {
      const buffer = new RingBuffer5<number>(5);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.push(4);
      buffer.push(5);
      const evens = buffer.filter((value) => value % 2 === 0);
      expect(evens).toEqual([2, 4]);
    });

    it('should return empty array if no elements match', () => {
      const buffer = new RingBuffer5<number>(3);
      buffer.push(1);
      buffer.push(3);
      buffer.push(5);
      const evens = buffer.filter((value) => value % 2 === 0);
      expect(evens).toEqual([]);
    });

    it('should work with strings', () => {
      const buffer = new RingBuffer5<string>(3);
      buffer.push('hello');
      buffer.push('world');
      buffer.push('test');
      const long = buffer.filter((value) => value.length > 4);
      expect(long).toEqual(['hello', 'world']);
    });

    it('should handle wrap-around', () => {
      const buffer = new RingBuffer5<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.dequeue();
      buffer.push(4);
      const result = buffer.filter((value) => value > 2);
      expect(result).toEqual([3, 4]);
    });

    it('should return empty array for empty buffer', () => {
      const buffer = new RingBuffer5<number>(3);
      const result = buffer.filter(() => true);
      expect(result).toEqual([]);
    });
  });

  describe('map', () => {
    it('should map elements to new values', () => {
      const buffer = new RingBuffer5<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      const doubled = buffer.map((value) => value * 2);
      expect(doubled).toEqual([2, 4, 6]);
    });

    it('should change type', () => {
      const buffer = new RingBuffer5<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      const strings = buffer.map((value) => value.toString());
      expect(strings).toEqual(['1', '2', '3']);
    });

    it('should provide correct indices', () => {
      const buffer = new RingBuffer5<number>(3);
      buffer.push(10);
      buffer.push(20);
      buffer.push(30);
      const result = buffer.map((value, index) => value + index);
      expect(result).toEqual([10, 21, 32]);
    });

    it('should handle wrap-around', () => {
      const buffer = new RingBuffer5<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.dequeue();
      buffer.push(4);
      const result = buffer.map((value) => value * 10);
      expect(result).toEqual([20, 30, 40]);
    });

    it('should return empty array for empty buffer', () => {
      const buffer = new RingBuffer5<number>(3);
      const result = buffer.map((value) => value * 2);
      expect(result).toEqual([]);
    });
  });

  describe('reduce', () => {
    it('should reduce to single value', () => {
      const buffer = new RingBuffer5<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      const sum = buffer.reduce((acc, value) => acc + value, 0);
      expect(sum).toBe(6);
    });

    it('should work with objects', () => {
      const buffer = new RingBuffer5<{ x: number }>(2);
      buffer.push({ x: 1 });
      buffer.push({ x: 2 });
      const sum = buffer.reduce((acc, value) => acc + value.x, 0);
      expect(sum).toBe(3);
    });

    it('should provide correct indices', () => {
      const buffer = new RingBuffer5<number>(3);
      buffer.push(10);
      buffer.push(20);
      buffer.push(30);
      const result = buffer.reduce((acc, value, index) => acc + index, 0);
      expect(result).toBe(3);
    });

    it('should handle wrap-around', () => {
      const buffer = new RingBuffer5<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.dequeue();
      buffer.push(4);
      const sum = buffer.reduce((acc, value) => acc + value, 0);
      expect(sum).toBe(9);
    });

    it('should return initial value for empty buffer', () => {
      const buffer = new RingBuffer5<number>(3);
      const result = buffer.reduce((acc, value) => acc + value, 42);
      expect(result).toBe(42);
    });
  });

  describe('toArray', () => {
    it('should convert to array', () => {
      const buffer = new RingBuffer5<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.toArray()).toEqual([1, 2, 3]);
    });

    it('should return empty array for empty buffer', () => {
      const buffer = new RingBuffer5<number>(3);
      expect(buffer.toArray()).toEqual([]);
    });

    it('should handle wrap-around', () => {
      const buffer = new RingBuffer5<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.dequeue();
      buffer.push(4);
      expect(buffer.toArray()).toEqual([2, 3, 4]);
    });
  });

  describe('slice', () => {
    it('should return full array with no args', () => {
      const buffer = new RingBuffer5<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.slice()).toEqual([1, 2, 3]);
    });

    it('should return slice from start index', () => {
      const buffer = new RingBuffer5<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.slice(1)).toEqual([2, 3]);
    });

    it('should return slice from start to end index', () => {
      const buffer = new RingBuffer5<number>(4);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.push(4);
      expect(buffer.slice(1, 3)).toEqual([2, 3]);
    });

    it('should clamp negative start to 0', () => {
      const buffer = new RingBuffer5<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.slice(-1)).toEqual([1, 2, 3]);
    });

    it('should clamp end to size', () => {
      const buffer = new RingBuffer5<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.slice(0, 10)).toEqual([1, 2, 3]);
    });

    it('should handle wrap-around', () => {
      const buffer = new RingBuffer5<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.dequeue();
      buffer.push(4);
      expect(buffer.slice(0, 2)).toEqual([2, 3]);
    });

    it('should return empty array for empty slice', () => {
      const buffer = new RingBuffer5<number>(3);
      buffer.push(1);
      buffer.push(2);
      expect(buffer.slice(2, 2)).toEqual([]);
    });
  });

  describe('isEmpty and isFull', () => {
    it('should be empty initially', () => {
      const buffer = new RingBuffer5<number>(3);
      expect(buffer.isEmpty).toBe(true);
      expect(buffer.isFull).toBe(false);
    });

    it('should become full after adding capacity elements', () => {
      const buffer = new RingBuffer5<number>(2);
      buffer.push(1);
      buffer.push(2);
      expect(buffer.isEmpty).toBe(false);
      expect(buffer.isFull).toBe(true);
    });

    it('should become empty after removing all elements', () => {
      const buffer = new RingBuffer5<number>(2);
      buffer.push(1);
      buffer.push(2);
      buffer.pop();
      buffer.pop();
      expect(buffer.isEmpty).toBe(true);
      expect(buffer.isFull).toBe(false);
    });
  });

  describe('available', () => {
    it('should return capacity when empty', () => {
      const buffer = new RingBuffer5<number>(5);
      expect(buffer.available).toBe(5);
    });

    it('should return 0 when full', () => {
      const buffer = new RingBuffer5<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.available).toBe(0);
    });

    it('should return correct available space', () => {
      const buffer = new RingBuffer5<number>(5);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.available).toBe(2);
    });

    it('should update after operations', () => {
      const buffer = new RingBuffer5<number>(4);
      buffer.push(1);
      buffer.push(2);
      expect(buffer.available).toBe(2);
      buffer.dequeue();
      expect(buffer.available).toBe(3);
      buffer.push(3);
      buffer.push(4);
      expect(buffer.available).toBe(1);
    });
  });

  describe('size', () => {
    it('should return correct size', () => {
      const buffer = new RingBuffer5<number>(3);
      expect(buffer.size).toBe(0);
      buffer.push(1);
      expect(buffer.size).toBe(1);
      buffer.push(2);
      expect(buffer.size).toBe(2);
      buffer.pop();
      expect(buffer.size).toBe(1);
    });

    it('should never exceed capacity', () => {
      const buffer = new RingBuffer5<number>(2);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.size).toBe(2);
    });
  });

  describe('clear', () => {
    it('should clear all elements', () => {
      const buffer = new RingBuffer5<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.clear();
      expect(buffer.isEmpty).toBe(true);
      expect(buffer.size).toBe(0);
      expect(buffer.pop()).toBe(undefined);
    });

    it('should allow pushing after clear', () => {
      const buffer = new RingBuffer5<number>(2);
      buffer.push(1);
      buffer.push(2);
      buffer.clear();
      expect(buffer.push(3)).toBe(true);
      expect(buffer.push(4)).toBe(true);
      expect(buffer.size).toBe(2);
    });

    it('should clear after mixed operations', () => {
      const buffer = new RingBuffer5<number>(4);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.dequeue();
      buffer.push(4);
      buffer.clear();
      expect(buffer.isEmpty).toBe(true);
      expect(buffer.available).toBe(4);
    });
  });

  describe('getTimeComplexity', () => {
    it('should return O(1) for push', () => {
      const buffer = new RingBuffer5<number>(3);
      expect(buffer.getTimeComplexity('push')).toBe('O(1)');
    });

    it('should return O(1) for pop', () => {
      const buffer = new RingBuffer5<number>(3);
      expect(buffer.getTimeComplexity('pop')).toBe('O(1)');
    });

    it('should return O(1) for enqueue', () => {
      const buffer = new RingBuffer5<number>(3);
      expect(buffer.getTimeComplexity('enqueue')).toBe('O(1)');
    });

    it('should return O(1) for dequeue', () => {
      const buffer = new RingBuffer5<number>(3);
      expect(buffer.getTimeComplexity('dequeue')).toBe('O(1)');
    });

    it('should return O(1) for peek', () => {
      const buffer = new RingBuffer5<number>(3);
      expect(buffer.getTimeComplexity('peek')).toBe('O(1)');
    });

    it('should return O(1) for peekAt', () => {
      const buffer = new RingBuffer5<number>(3);
      expect(buffer.getTimeComplexity('peekAt')).toBe('O(1)');
    });

    it('should return O(n) for forEach', () => {
      const buffer = new RingBuffer5<number>(3);
      expect(buffer.getTimeComplexity('forEach')).toBe('O(n)');
    });

    it('should return O(n) for filter', () => {
      const buffer = new RingBuffer5<number>(3);
      expect(buffer.getTimeComplexity('filter')).toBe('O(n)');
    });

    it('should return O(n) for map', () => {
      const buffer = new RingBuffer5<number>(3);
      expect(buffer.getTimeComplexity('map')).toBe('O(n)');
    });

    it('should return O(n) for reduce', () => {
      const buffer = new RingBuffer5<number>(3);
      expect(buffer.getTimeComplexity('reduce')).toBe('O(n)');
    });

    it('should return O(n) for toArray', () => {
      const buffer = new RingBuffer5<number>(3);
      expect(buffer.getTimeComplexity('toArray')).toBe('O(n)');
    });

    it('should return complexity for slice', () => {
      const buffer = new RingBuffer5<number>(3);
      expect(buffer.getTimeComplexity('slice')).toBe('O(k) where k is slice size');
    });

    it('should return O(1) for isEmpty', () => {
      const buffer = new RingBuffer5<number>(3);
      expect(buffer.getTimeComplexity('isEmpty')).toBe('O(1)');
    });

    it('should return O(1) for isFull', () => {
      const buffer = new RingBuffer5<number>(3);
      expect(buffer.getTimeComplexity('isFull')).toBe('O(1)');
    });

    it('should return O(1) for size', () => {
      const buffer = new RingBuffer5<number>(3);
      expect(buffer.getTimeComplexity('size')).toBe('O(1)');
    });

    it('should return O(1) for available', () => {
      const buffer = new RingBuffer5<number>(3);
      expect(buffer.getTimeComplexity('available')).toBe('O(1)');
    });

    it('should return O(n) for clear', () => {
      const buffer = new RingBuffer5<number>(3);
      expect(buffer.getTimeComplexity('clear')).toBe('O(n)');
    });

    it('should return Unknown for unknown method', () => {
      const buffer = new RingBuffer5<number>(3);
      expect(buffer.getTimeComplexity('unknown')).toBe('Unknown');
    });
  });

  describe('mixed operations', () => {
    it('should handle push, dequeue, enqueue, pop sequence', () => {
      const buffer = new RingBuffer5<number>(5);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.dequeue()).toBe(1);
      buffer.enqueue(0);
      expect(buffer.pop()).toBe(0);
      expect(buffer.toArray()).toEqual([2, 3]);
    });

    it('should maintain consistency through multiple operations', () => {
      const buffer = new RingBuffer5<number>(4);
      buffer.push(1);
      buffer.push(2);
      buffer.dequeue();
      buffer.push(3);
      buffer.push(4);
      buffer.dequeue();
      buffer.enqueue(0);
      expect(buffer.toArray()).toEqual([3, 4, 0]);
      expect(buffer.size).toBe(3);
    });

    it('should handle complex wrap-around scenario', () => {
      const buffer = new RingBuffer5<number>(3);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.dequeue();
      buffer.push(4);
      buffer.dequeue();
      buffer.push(5);
      expect(buffer.toArray()).toEqual([3, 4, 5]);
      expect(buffer.peek()).toBe(3);
      expect(buffer.peekAt(1)).toBe(4);
    });
  });

  describe('edge cases', () => {
    it('should handle single element buffer', () => {
      const buffer = new RingBuffer5<number>(1);
      expect(buffer.push(5)).toBe(true);
      expect(buffer.isFull).toBe(true);
      expect(buffer.push(6)).toBe(false);
      expect(buffer.pop()).toBe(5);
      expect(buffer.isEmpty).toBe(true);
    });

    it('should handle string elements', () => {
      const buffer = new RingBuffer5<string>(3);
      buffer.push('hello');
      buffer.push('world');
      buffer.push('test');
      expect(buffer.toArray()).toEqual(['hello', 'world', 'test']);
    });

    it('should handle object elements', () => {
      const buffer = new RingBuffer5<{ id: number }>(2);
      buffer.push({ id: 1 });
      buffer.push({ id: 2 });
      expect(buffer.peek()).toEqual({ id: 1 });
    });

    it('should handle rapid push/dequeue cycles', () => {
      const buffer = new RingBuffer5<number>(3);
      buffer.push(1);
      buffer.dequeue();
      buffer.push(2);
      buffer.dequeue();
      buffer.push(3);
      buffer.dequeue();
      expect(buffer.isEmpty).toBe(true);
      expect(buffer.available).toBe(3);
    });
  });
});
