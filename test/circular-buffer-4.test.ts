import { describe, it, expect } from 'vitest';
import { CircularBuffer4 } from '../src/core/circular-buffer-4/index.js';

describe('CircularBuffer4', () => {
  describe('constructor', () => {
    it('should create buffer with specified capacity', () => {
      const buffer = new CircularBuffer4<number>(5);
      expect(buffer.capacity).toBe(5);
    });

    it('should be empty initially', () => {
      const buffer = new CircularBuffer4<number>(3);
      expect(buffer.isEmpty).toBe(true);
    });

    it('should not be full initially', () => {
      const buffer = new CircularBuffer4<number>(3);
      expect(buffer.isFull).toBe(false);
    });

    it('should have size 0 initially', () => {
      const buffer = new CircularBuffer4<number>(3);
      expect(buffer.size).toBe(0);
    });

    it('should have available capacity initially', () => {
      const buffer = new CircularBuffer4<number>(5);
      expect(buffer.available).toBe(5);
    });

    it('should throw error for capacity 0', () => {
      expect(() => new CircularBuffer4<number>(0)).toThrow('Capacity must be greater than 0');
    });

    it('should throw error for negative capacity', () => {
      expect(() => new CircularBuffer4<number>(-1)).toThrow('Capacity must be greater than 0');
    });
  });

  describe('write and read', () => {
    it('should write and read single element', () => {
      const buffer = new CircularBuffer4<number>(3);
      buffer.write(1);
      expect(buffer.read()).toBe(1);
    });

    it('should write and read multiple elements in order', () => {
      const buffer = new CircularBuffer4<number>(3);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      expect(buffer.read()).toBe(1);
      expect(buffer.read()).toBe(2);
      expect(buffer.read()).toBe(3);
    });

    it('should read undefined from empty buffer', () => {
      const buffer = new CircularBuffer4<number>(3);
      expect(buffer.read()).toBeUndefined();
    });

    it('should handle string values', () => {
      const buffer = new CircularBuffer4<string>(3);
      buffer.write('hello');
      buffer.write('world');
      expect(buffer.read()).toBe('hello');
      expect(buffer.read()).toBe('world');
    });

    it('should handle object values', () => {
      const buffer = new CircularBuffer4<{ id: number }>(3);
      buffer.write({ id: 1 });
      buffer.write({ id: 2 });
      expect(buffer.read()).toEqual({ id: 1 });
      expect(buffer.read()).toEqual({ id: 2 });
    });
  });

  describe('peek', () => {
    it('should peek at first element without removing it', () => {
      const buffer = new CircularBuffer4<number>(3);
      buffer.write(1);
      buffer.write(2);
      expect(buffer.peek()).toBe(1);
      expect(buffer.size).toBe(2);
    });

    it('should return undefined for empty buffer', () => {
      const buffer = new CircularBuffer4<number>(3);
      expect(buffer.peek()).toBeUndefined();
    });

    it('should allow multiple peeks without affecting buffer', () => {
      const buffer = new CircularBuffer4<number>(3);
      buffer.write(1);
      buffer.write(2);
      expect(buffer.peek()).toBe(1);
      expect(buffer.peek()).toBe(1);
      expect(buffer.peek()).toBe(1);
      expect(buffer.size).toBe(2);
    });
  });

  describe('isFull and isEmpty', () => {
    it('should detect when buffer is full', () => {
      const buffer = new CircularBuffer4<number>(3);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      expect(buffer.isFull).toBe(true);
    });

    it('should detect when buffer is empty', () => {
      const buffer = new CircularBuffer4<number>(3);
      buffer.write(1);
      buffer.read();
      expect(buffer.isEmpty).toBe(true);
    });
  });

  describe('available getter', () => {
    it('should report correct available capacity', () => {
      const buffer = new CircularBuffer4<number>(5);
      expect(buffer.available).toBe(5);
      buffer.write(1);
      expect(buffer.available).toBe(4);
      buffer.write(2);
      expect(buffer.available).toBe(3);
      buffer.read();
      expect(buffer.available).toBe(4);
    });

    it('should be 0 when buffer is full', () => {
      const buffer = new CircularBuffer4<number>(3);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      expect(buffer.available).toBe(0);
    });

    it('should equal capacity when buffer is empty', () => {
      const buffer = new CircularBuffer4<number>(10);
      expect(buffer.available).toBe(10);
    });
  });

  describe('peekAt', () => {
    it('should peek at specific index', () => {
      const buffer = new CircularBuffer4<number>(5);
      buffer.write(10);
      buffer.write(20);
      buffer.write(30);
      expect(buffer.peekAt(0)).toBe(10);
      expect(buffer.peekAt(1)).toBe(20);
      expect(buffer.peekAt(2)).toBe(30);
    });

    it('should not modify buffer', () => {
      const buffer = new CircularBuffer4<number>(3);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      buffer.peekAt(1);
      expect(buffer.size).toBe(3);
      expect(buffer.peek()).toBe(1);
    });

    it('should return undefined for out of bounds index', () => {
      const buffer = new CircularBuffer4<number>(3);
      buffer.write(1);
      buffer.write(2);
      expect(buffer.peekAt(-1)).toBeUndefined();
      expect(buffer.peekAt(2)).toBeUndefined();
      expect(buffer.peekAt(10)).toBeUndefined();
    });

    it('should work correctly after wrap-around', () => {
      const buffer = new CircularBuffer4<number>(3);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      buffer.read();
      buffer.write(4);
      expect(buffer.peekAt(0)).toBe(2);
      expect(buffer.peekAt(1)).toBe(3);
      expect(buffer.peekAt(2)).toBe(4);
    });
  });

  describe('slice', () => {
    it('should return empty array for empty buffer', () => {
      const buffer = new CircularBuffer4<number>(3);
      expect(buffer.slice(0, 1)).toEqual([]);
    });

    it('should slice from start to end', () => {
      const buffer = new CircularBuffer4<number>(5);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      buffer.write(4);
      buffer.write(5);
      expect(buffer.slice(1, 3)).toEqual([2, 3]);
    });

    it('should slice from start to end without end parameter', () => {
      const buffer = new CircularBuffer4<number>(5);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      expect(buffer.slice(1)).toEqual([2, 3]);
    });

    it('should return empty array when start >= count', () => {
      const buffer = new CircularBuffer4<number>(3);
      buffer.write(1);
      buffer.write(2);
      expect(buffer.slice(3)).toEqual([]);
      expect(buffer.slice(5)).toEqual([]);
    });

    it('should return empty array when start >= end', () => {
      const buffer = new CircularBuffer4<number>(3);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      expect(buffer.slice(2, 2)).toEqual([]);
      expect(buffer.slice(2, 1)).toEqual([]);
    });

    it('should handle negative start', () => {
      const buffer = new CircularBuffer4<number>(3);
      buffer.write(1);
      buffer.write(2);
      expect(buffer.slice(-1, 1)).toEqual([]);
    });

    it('should not modify buffer', () => {
      const buffer = new CircularBuffer4<number>(3);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      buffer.slice(1, 2);
      expect(buffer.size).toBe(3);
      expect(buffer.toArray()).toEqual([1, 2, 3]);
    });

    it('should work correctly after wrap-around', () => {
      const buffer = new CircularBuffer4<number>(5);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      buffer.write(4);
      buffer.write(5);
      buffer.read();
      buffer.read();
      buffer.write(6);
      expect(buffer.slice(1, 4)).toEqual([4, 5, 6]);
    });
  });

  describe('overwrite', () => {
    it('should overwrite oldest when buffer is full', () => {
      const buffer = new CircularBuffer4<number>(3);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      buffer.overwrite(4);
      expect(buffer.size).toBe(3);
      expect(buffer.read()).toBe(2);
      expect(buffer.read()).toBe(3);
      expect(buffer.read()).toBe(4);
    });

    it('should write normally when buffer is not full', () => {
      const buffer = new CircularBuffer4<number>(5);
      buffer.write(1);
      buffer.write(2);
      buffer.overwrite(3);
      expect(buffer.size).toBe(3);
      expect(buffer.read()).toBe(1);
      expect(buffer.read()).toBe(2);
      expect(buffer.read()).toBe(3);
    });

    it('should overwrite multiple times', () => {
      const buffer = new CircularBuffer4<number>(3);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      buffer.overwrite(4);
      buffer.overwrite(5);
      buffer.overwrite(6);
      expect(buffer.read()).toBe(4);
      expect(buffer.read()).toBe(5);
      expect(buffer.read()).toBe(6);
    });
  });

  describe('filter', () => {
    it('should filter elements matching predicate', () => {
      const buffer = new CircularBuffer4<number>(5);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      buffer.write(4);
      buffer.write(5);
      const result = buffer.filter((x) => x % 2 === 0);
      expect(result).toEqual([2, 4]);
    });

    it('should return empty array when no elements match', () => {
      const buffer = new CircularBuffer4<number>(3);
      buffer.write(1);
      buffer.write(3);
      buffer.write(5);
      const result = buffer.filter((x) => x % 2 === 0);
      expect(result).toEqual([]);
    });

    it('should not modify buffer', () => {
      const buffer = new CircularBuffer4<number>(3);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      buffer.filter((x) => x > 1);
      expect(buffer.size).toBe(3);
      expect(buffer.toArray()).toEqual([1, 2, 3]);
    });

    it('should work with string types', () => {
      const buffer = new CircularBuffer4<string>(4);
      buffer.write('hello');
      buffer.write('world');
      buffer.write('foo');
      buffer.write('bar');
      const result = buffer.filter((s) => s.length > 4);
      expect(result).toEqual(['hello', 'world']);
    });
  });

  describe('map', () => {
    it('should map elements with callback', () => {
      const buffer = new CircularBuffer4<number>(3);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      const result = buffer.map((x) => x * 2);
      expect(result).toEqual([2, 4, 6]);
    });

    it('should not modify buffer', () => {
      const buffer = new CircularBuffer4<number>(3);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      buffer.map((x) => x * 2);
      expect(buffer.toArray()).toEqual([1, 2, 3]);
    });

    it('should change element type', () => {
      const buffer = new CircularBuffer4<number>(3);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      const result = buffer.map((x) => x.toString());
      expect(result).toEqual(['1', '2', '3']);
    });

    it('should provide correct index to callback', () => {
      const buffer = new CircularBuffer4<number>(3);
      buffer.write(10);
      buffer.write(20);
      buffer.write(30);
      const indices: number[] = [];
      buffer.map((_, index) => {
        indices.push(index);
        return _;
      });
      expect(indices).toEqual([0, 1, 2]);
    });
  });

  describe('reduce', () => {
    it('should reduce to sum', () => {
      const buffer = new CircularBuffer4<number>(4);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      buffer.write(4);
      const sum = buffer.reduce((acc, x) => acc + x, 0);
      expect(sum).toBe(10);
    });

    it('should reduce to product', () => {
      const buffer = new CircularBuffer4<number>(3);
      buffer.write(2);
      buffer.write(3);
      buffer.write(4);
      const product = buffer.reduce((acc, x) => acc * x, 1);
      expect(product).toBe(24);
    });

    it('should not modify buffer', () => {
      const buffer = new CircularBuffer4<number>(3);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      buffer.reduce((acc, x) => acc + x, 0);
      expect(buffer.toArray()).toEqual([1, 2, 3]);
    });

    it('should work with empty buffer', () => {
      const buffer = new CircularBuffer4<number>(3);
      const result = buffer.reduce((acc, x) => acc + x, 100);
      expect(result).toBe(100);
    });

    it('should provide correct index to callback', () => {
      const buffer = new CircularBuffer4<number>(3);
      buffer.write(10);
      buffer.write(20);
      buffer.write(30);
      const indices: number[] = [];
      buffer.reduce((acc, _, index) => {
        indices.push(index);
        return acc;
      }, 0);
      expect(indices).toEqual([0, 1, 2]);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty buffer', () => {
      const buffer = new CircularBuffer4<number>(3);
      expect(buffer.toArray()).toEqual([]);
    });

    it('should return all elements in order', () => {
      const buffer = new CircularBuffer4<number>(3);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      expect(buffer.toArray()).toEqual([1, 2, 3]);
    });

    it('should not affect buffer', () => {
      const buffer = new CircularBuffer4<number>(3);
      buffer.write(1);
      buffer.write(2);
      buffer.toArray();
      expect(buffer.size).toBe(2);
      expect(buffer.read()).toBe(1);
    });
  });

  describe('forEach', () => {
    it('should iterate over all elements', () => {
      const buffer = new CircularBuffer4<number>(3);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      const result: number[] = [];
      buffer.forEach((value) => {
        result.push(value);
      });
      expect(result).toEqual([1, 2, 3]);
    });

    it('should not modify buffer', () => {
      const buffer = new CircularBuffer4<number>(3);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      buffer.forEach(() => {});
      expect(buffer.size).toBe(3);
    });
  });

  describe('clear', () => {
    it('should clear buffer', () => {
      const buffer = new CircularBuffer4<number>(3);
      buffer.write(1);
      buffer.write(2);
      buffer.clear();
      expect(buffer.isEmpty).toBe(true);
      expect(buffer.size).toBe(0);
    });

    it('should clear empty buffer', () => {
      const buffer = new CircularBuffer4<number>(3);
      buffer.clear();
      expect(buffer.isEmpty).toBe(true);
      expect(buffer.size).toBe(0);
    });
  });

  describe('getTimeComplexity', () => {
    it('should return correct complexity for write', () => {
      const buffer = new CircularBuffer4<number>(3);
      expect(buffer.getTimeComplexity('write')).toBe('O(1)');
    });

    it('should return correct complexity for overwrite', () => {
      const buffer = new CircularBuffer4<number>(3);
      expect(buffer.getTimeComplexity('overwrite')).toBe('O(1)');
    });

    it('should return correct complexity for read', () => {
      const buffer = new CircularBuffer4<number>(3);
      expect(buffer.getTimeComplexity('read')).toBe('O(1)');
    });

    it('should return correct complexity for peek', () => {
      const buffer = new CircularBuffer4<number>(3);
      expect(buffer.getTimeComplexity('peek')).toBe('O(1)');
    });

    it('should return correct complexity for peekAt', () => {
      const buffer = new CircularBuffer4<number>(3);
      expect(buffer.getTimeComplexity('peekAt')).toBe('O(1)');
    });

    it('should return correct complexity for slice', () => {
      const buffer = new CircularBuffer4<number>(3);
      expect(buffer.getTimeComplexity('slice')).toBe('O(n)');
    });

    it('should return correct complexity for clear', () => {
      const buffer = new CircularBuffer4<number>(3);
      expect(buffer.getTimeComplexity('clear')).toBe('O(n)');
    });

    it('should return correct complexity for toArray', () => {
      const buffer = new CircularBuffer4<number>(3);
      expect(buffer.getTimeComplexity('toArray')).toBe('O(n)');
    });

    it('should return correct complexity for forEach', () => {
      const buffer = new CircularBuffer4<number>(3);
      expect(buffer.getTimeComplexity('forEach')).toBe('O(n)');
    });

    it('should return correct complexity for filter', () => {
      const buffer = new CircularBuffer4<number>(3);
      expect(buffer.getTimeComplexity('filter')).toBe('O(n)');
    });

    it('should return correct complexity for map', () => {
      const buffer = new CircularBuffer4<number>(3);
      expect(buffer.getTimeComplexity('map')).toBe('O(n)');
    });

    it('should return correct complexity for reduce', () => {
      const buffer = new CircularBuffer4<number>(3);
      expect(buffer.getTimeComplexity('reduce')).toBe('O(n)');
    });

    it('should return unknown for invalid operation', () => {
      const buffer = new CircularBuffer4<number>(3);
      expect(buffer.getTimeComplexity('invalid')).toBe('Unknown operation');
    });
  });

  describe('wrap-around', () => {
    it('should handle wrap-around correctly', () => {
      const buffer = new CircularBuffer4<number>(5);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      buffer.write(4);
      buffer.write(5);
      buffer.read();
      buffer.read();
      buffer.write(6);
      buffer.write(7);
      expect(buffer.read()).toBe(3);
      expect(buffer.read()).toBe(4);
      expect(buffer.read()).toBe(5);
      expect(buffer.read()).toBe(6);
      expect(buffer.read()).toBe(7);
    });
  });

  describe('overwriting behavior', () => {
    it('should overwrite oldest when full using write', () => {
      const buffer = new CircularBuffer4<number>(3);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      buffer.write(4);
      expect(buffer.size).toBe(3);
      expect(buffer.read()).toBe(2);
      expect(buffer.read()).toBe(3);
      expect(buffer.read()).toBe(4);
    });
  });
});
