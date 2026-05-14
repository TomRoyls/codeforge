import { describe, it, expect } from 'vitest';
import { CircularBuffer } from '../src/core/circular-buffer-2/index.js';

describe('CircularBuffer', () => {
  describe('constructor', () => {
    it('should create buffer with specified capacity', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      expect(buffer.capacity).toBe(5);
    });

    it('should use minimum capacity of 1', () => {
      const buffer = new CircularBuffer<number>({ capacity: 0 });
      expect(buffer.capacity).toBe(1);
    });

    it('should use minimum capacity of 1 for negative', () => {
      const buffer = new CircularBuffer<number>({ capacity: -5 });
      expect(buffer.capacity).toBe(1);
    });

    it('should be empty initially', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      expect(buffer.isEmpty()).toBe(true);
    });

    it('should not be full initially', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      expect(buffer.isFull()).toBe(false);
    });

    it('should have size 0 initially', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      expect(buffer.size).toBe(0);
    });

    it('should set overwrite to false by default', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      expect(() => {
        buffer.push(1);
        buffer.push(2);
        buffer.push(3);
        buffer.push(4);
      }).toThrow('CircularBuffer is full');
    });

    it('should set overwrite to true when specified', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3, overwrite: true });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.push(4);
      expect(buffer.size).toBe(3);
      expect(buffer.toArray()).toEqual([2, 3, 4]);
    });
  });

  describe('push', () => {
    it('should push single element', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      buffer.push(1);
      expect(buffer.size).toBe(1);
      expect(buffer.get(0)).toBe(1);
    });

    it('should push multiple elements', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.size).toBe(3);
      expect(buffer.toArray()).toEqual([1, 2, 3]);
    });

    it('should throw error when pushing to full buffer without overwrite', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(() => buffer.push(4)).toThrow('CircularBuffer is full');
    });

    it('should overwrite when buffer is full with overwrite enabled', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3, overwrite: true });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.push(4);
      expect(buffer.size).toBe(3);
      expect(buffer.toArray()).toEqual([2, 3, 4]);
    });

    it('should handle string values', () => {
      const buffer = new CircularBuffer<string>({ capacity: 3 });
      buffer.push('hello');
      buffer.push('world');
      expect(buffer.size).toBe(2);
      expect(buffer.get(0)).toBe('hello');
      expect(buffer.get(1)).toBe('world');
    });

    it('should handle object values', () => {
      const buffer = new CircularBuffer<{ id: number }>({ capacity: 3 });
      buffer.push({ id: 1 });
      buffer.push({ id: 2 });
      expect(buffer.get(0)).toEqual({ id: 1 });
      expect(buffer.get(1)).toEqual({ id: 2 });
    });

    it('should handle null values', () => {
      const buffer = new CircularBuffer<number | null>({ capacity: 3 });
      buffer.push(null);
      expect(buffer.get(0)).toBe(null);
    });

    it('should handle undefined values', () => {
      const buffer = new CircularBuffer<number | undefined>({ capacity: 3 });
      buffer.push(undefined);
      expect(buffer.get(0)).toBe(undefined);
    });
  });

  describe('pop', () => {
    it('should pop last element', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.pop()).toBe(3);
      expect(buffer.size).toBe(2);
    });

    it('should return undefined for empty buffer', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      expect(buffer.pop()).toBe(undefined);
    });

    it('should pop all elements in LIFO order', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.pop()).toBe(3);
      expect(buffer.pop()).toBe(2);
      expect(buffer.pop()).toBe(1);
      expect(buffer.isEmpty()).toBe(true);
    });

    it('should handle wrap-around', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.shift();
      buffer.shift();
      buffer.push(4);
      buffer.push(5);
      expect(buffer.pop()).toBe(5);
      expect(buffer.pop()).toBe(4);
      expect(buffer.pop()).toBe(3);
    });
  });

  describe('shift', () => {
    it('should shift first element', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.shift()).toBe(1);
      expect(buffer.size).toBe(2);
    });

    it('should return undefined for empty buffer', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      expect(buffer.shift()).toBe(undefined);
    });

    it('should shift all elements in FIFO order', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.shift()).toBe(1);
      expect(buffer.shift()).toBe(2);
      expect(buffer.shift()).toBe(3);
      expect(buffer.isEmpty()).toBe(true);
    });

    it('should handle wrap-around', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.shift();
      buffer.push(4);
      expect(buffer.shift()).toBe(2);
      expect(buffer.shift()).toBe(3);
      expect(buffer.shift()).toBe(4);
    });
  });

  describe('unshift', () => {
    it('should unshift element to front', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(2);
      buffer.push(3);
      buffer.unshift(1);
      expect(buffer.toArray()).toEqual([1, 2, 3]);
    });

    it('should unshift multiple elements', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(3);
      buffer.unshift(2);
      buffer.unshift(1);
      expect(buffer.toArray()).toEqual([1, 2, 3]);
    });

    it('should throw error when unshifting to full buffer without overwrite', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(() => buffer.unshift(0)).toThrow('CircularBuffer is full');
    });

    it('should overwrite when buffer is full with overwrite enabled', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3, overwrite: true });
      buffer.push(2);
      buffer.push(3);
      buffer.push(4);
      buffer.unshift(1);
      expect(buffer.size).toBe(3);
      expect(buffer.toArray()).toEqual([1, 2, 3]);
    });
  });

  describe('get', () => {
    it('should get element at index', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.get(0)).toBe(1);
      expect(buffer.get(1)).toBe(2);
      expect(buffer.get(2)).toBe(3);
    });

    it('should return undefined for out of bounds index', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      buffer.push(1);
      buffer.push(2);
      expect(buffer.get(2)).toBe(undefined);
      expect(buffer.get(3)).toBe(undefined);
    });

    it('should return undefined for negative index', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      buffer.push(1);
      expect(buffer.get(-1)).toBe(undefined);
    });

    it('should get element after wrap-around', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.shift();
      buffer.push(4);
      expect(buffer.get(0)).toBe(2);
      expect(buffer.get(1)).toBe(3);
      expect(buffer.get(2)).toBe(4);
    });

    it('should return undefined for empty buffer', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      expect(buffer.get(0)).toBe(undefined);
    });
  });

  describe('set', () => {
    it('should set element at index', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.set(1, 20)).toBe(2);
      expect(buffer.get(1)).toBe(20);
      expect(buffer.toArray()).toEqual([1, 20, 3]);
    });

    it('should return undefined for out of bounds index', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      buffer.push(1);
      buffer.push(2);
      expect(buffer.set(2, 10)).toBe(undefined);
      expect(buffer.set(3, 10)).toBe(undefined);
    });

    it('should return undefined for negative index', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      buffer.push(1);
      expect(buffer.set(-1, 10)).toBe(undefined);
    });

    it('should not affect buffer state when out of bounds', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      buffer.push(1);
      buffer.push(2);
      buffer.set(5, 10);
      expect(buffer.toArray()).toEqual([1, 2]);
    });
  });

  describe('peek', () => {
    it('should peek at first element', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.peek()).toBe(1);
      expect(buffer.size).toBe(3);
    });

    it('should return undefined for empty buffer', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      expect(buffer.peek()).toBe(undefined);
    });

    it('should not remove element', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      buffer.push(1);
      buffer.push(2);
      buffer.peek();
      expect(buffer.size).toBe(2);
      expect(buffer.peek()).toBe(1);
    });

    it('should peek after shift operations', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.shift();
      expect(buffer.peek()).toBe(2);
    });
  });

  describe('peekLast', () => {
    it('should peek at last element', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.peekLast()).toBe(3);
      expect(buffer.size).toBe(3);
    });

    it('should return undefined for empty buffer', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      expect(buffer.peekLast()).toBe(undefined);
    });

    it('should not remove element', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      buffer.push(1);
      buffer.push(2);
      buffer.peekLast();
      expect(buffer.size).toBe(2);
      expect(buffer.peekLast()).toBe(2);
    });

    it('should peek after pop operations', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.pop();
      expect(buffer.peekLast()).toBe(2);
    });
  });

  describe('clear', () => {
    it('should clear empty buffer', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      buffer.clear();
      expect(buffer.isEmpty()).toBe(true);
      expect(buffer.size).toBe(0);
    });

    it('should clear partially filled buffer', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.clear();
      expect(buffer.isEmpty()).toBe(true);
      expect(buffer.size).toBe(0);
      expect(buffer.peek()).toBe(undefined);
    });

    it('should clear full buffer', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.clear();
      expect(buffer.isEmpty()).toBe(true);
      expect(buffer.size).toBe(0);
      expect(buffer.isFull()).toBe(false);
    });

    it('should allow writing after clear', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      buffer.push(1);
      buffer.push(2);
      buffer.clear();
      buffer.push(3);
      buffer.push(4);
      expect(buffer.toArray()).toEqual([3, 4]);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty buffer', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      expect(buffer.toArray()).toEqual([]);
    });

    it('should return all elements in order', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.toArray()).toEqual([1, 2, 3]);
    });

    it('should not affect buffer', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      buffer.push(1);
      buffer.push(2);
      buffer.toArray();
      expect(buffer.size).toBe(2);
      expect(buffer.get(0)).toBe(1);
    });

    it('should return correct array after wrap-around', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.shift();
      buffer.push(4);
      expect(buffer.toArray()).toEqual([2, 3, 4]);
    });

    it('should return array with correct types', () => {
      const buffer = new CircularBuffer<string>({ capacity: 3 });
      buffer.push('a');
      buffer.push('b');
      const arr = buffer.toArray();
      expect(arr[0]).toBe('a');
      expect(arr[1]).toBe('b');
    });
  });

  describe('fromArray', () => {
    it('should load from empty array', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      buffer.fromArray([]);
      expect(buffer.isEmpty()).toBe(true);
    });

    it('should load elements from array', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.fromArray([1, 2, 3]);
      expect(buffer.toArray()).toEqual([1, 2, 3]);
    });

    it('should clear existing elements before loading', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.fromArray([3, 4, 5]);
      expect(buffer.toArray()).toEqual([3, 4, 5]);
    });

    it('should handle array larger than capacity with overwrite', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3, overwrite: true });
      buffer.fromArray([1, 2, 3, 4, 5]);
      expect(buffer.toArray()).toEqual([3, 4, 5]);
    });
  });

  describe('forEach', () => {
    it('should not iterate over empty buffer', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      let count = 0;
      buffer.forEach(() => {
        count++;
      });
      expect(count).toBe(0);
    });

    it('should iterate over all elements', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      const result: number[] = [];
      buffer.forEach((value) => {
        result.push(value);
      });
      expect(result).toEqual([1, 2, 3]);
    });

    it('should provide correct index', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      buffer.push(10);
      buffer.push(20);
      buffer.push(30);
      buffer.forEach((value, index) => {
        if (index === 0) expect(value).toBe(10);
        if (index === 1) expect(value).toBe(20);
        if (index === 2) expect(value).toBe(30);
      });
    });

    it('should iterate correctly after wrap-around', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.shift();
      buffer.push(4);
      const result: number[] = [];
      buffer.forEach((value) => {
        result.push(value);
      });
      expect(result).toEqual([2, 3, 4]);
    });
  });

  describe('map', () => {
    it('should map empty buffer', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      const result = buffer.map((x) => x * 2);
      expect(result.isEmpty()).toBe(true);
    });

    it('should map all elements', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      const result = buffer.map((x) => x * 2);
      expect(result.toArray()).toEqual([2, 4, 6]);
    });

    it('should provide correct index in map', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      buffer.push(10);
      buffer.push(20);
      buffer.push(30);
      const result = buffer.map((value, index) => value * index);
      expect(result.toArray()).toEqual([0, 20, 60]);
    });

    it('should preserve original buffer', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.map((x) => x * 2);
      expect(buffer.toArray()).toEqual([1, 2, 3]);
    });

    it('should handle type changes', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      const result = buffer.map((x) => x.toString());
      expect(result.toArray()).toEqual(['1', '2', '3']);
    });
  });

  describe('filter', () => {
    it('should filter empty buffer', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      const result = buffer.filter((x) => x > 5);
      expect(result.isEmpty()).toBe(true);
    });

    it('should filter elements', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.push(4);
      buffer.push(5);
      const result = buffer.filter((x) => x % 2 === 0);
      expect(result.toArray()).toEqual([2, 4]);
    });

    it('should provide correct index in filter', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      buffer.push(10);
      buffer.push(20);
      buffer.push(30);
      const result = buffer.filter((value, index) => index % 2 === 0);
      expect(result.toArray()).toEqual([10, 30]);
    });

    it('should preserve original buffer', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.filter((x) => x > 1);
      expect(buffer.toArray()).toEqual([1, 2, 3]);
    });

    it('should keep all elements when all pass filter', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      const result = buffer.filter(() => true);
      expect(result.toArray()).toEqual([1, 2, 3]);
    });
  });

  describe('write', () => {
    it('should write empty array', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      const written = buffer.write([]);
      expect(written).toBe(0);
      expect(buffer.size).toBe(0);
    });

    it('should write multiple elements', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      const written = buffer.write([1, 2, 3]);
      expect(written).toBe(3);
      expect(buffer.toArray()).toEqual([1, 2, 3]);
    });

    it('should stop when buffer is full without overwrite', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      buffer.push(1);
      const written = buffer.write([2, 3, 4, 5]);
      expect(written).toBe(2);
      expect(buffer.toArray()).toEqual([1, 2, 3]);
    });

    it('should overwrite when full with overwrite enabled', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3, overwrite: true });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      const written = buffer.write([4, 5, 6]);
      expect(written).toBe(3);
      expect(buffer.toArray()).toEqual([4, 5, 6]);
    });

    it('should write single element', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      const written = buffer.write([42]);
      expect(written).toBe(1);
      expect(buffer.get(0)).toBe(42);
    });
  });

  describe('read', () => {
    it('should read from empty buffer', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      const result = buffer.read(3);
      expect(result).toEqual([]);
    });

    it('should read specified count', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      const result = buffer.read(2);
      expect(result).toEqual([1, 2]);
      expect(buffer.size).toBe(1);
    });

    it('should read all elements when count exceeds size', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      const result = buffer.read(10);
      expect(result).toEqual([1, 2, 3]);
      expect(buffer.isEmpty()).toBe(true);
    });

    it('should read zero elements', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      const result = buffer.read(0);
      expect(result).toEqual([]);
      expect(buffer.size).toBe(2);
    });
  });

  describe('size', () => {
    it('should report correct size after writes', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      expect(buffer.size).toBe(0);
      buffer.push(1);
      expect(buffer.size).toBe(1);
      buffer.push(2);
      expect(buffer.size).toBe(2);
    });

    it('should report correct size after reads', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.shift();
      expect(buffer.size).toBe(2);
      buffer.shift();
      expect(buffer.size).toBe(1);
    });

    it('should report correct size after pops', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.pop();
      expect(buffer.size).toBe(2);
      buffer.pop();
      expect(buffer.size).toBe(1);
    });
  });

  describe('capacity', () => {
    it('should report constant capacity', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      expect(buffer.capacity).toBe(5);
      buffer.push(1);
      expect(buffer.capacity).toBe(5);
      buffer.shift();
      expect(buffer.capacity).toBe(5);
    });

    it('should use minimum of 1', () => {
      const buffer = new CircularBuffer<number>({ capacity: 0 });
      expect(buffer.capacity).toBe(1);
    });
  });

  describe('available', () => {
    it('should return size', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      expect(buffer.available).toBe(0);
      buffer.push(1);
      expect(buffer.available).toBe(1);
      buffer.push(2);
      expect(buffer.available).toBe(2);
    });

    it('should update after operations', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.available).toBe(3);
      buffer.shift();
      expect(buffer.available).toBe(2);
    });
  });

  describe('remaining', () => {
    it('should return available space', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      expect(buffer.remaining).toBe(5);
      buffer.push(1);
      expect(buffer.remaining).toBe(4);
      buffer.push(2);
      expect(buffer.remaining).toBe(3);
    });

    it('should update after operations', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.remaining).toBe(2);
      buffer.shift();
      expect(buffer.remaining).toBe(3);
    });

    it('should return 0 when full', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.remaining).toBe(0);
    });
  });

  describe('resize', () => {
    it('should not resize to same capacity', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.resize(5);
      expect(buffer.capacity).toBe(5);
      expect(buffer.toArray()).toEqual([1, 2]);
    });

    it('should increase capacity', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.resize(5);
      expect(buffer.capacity).toBe(5);
      expect(buffer.toArray()).toEqual([1, 2, 3]);
    });

    it('should decrease capacity', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.push(4);
      buffer.push(5);
      buffer.resize(3);
      expect(buffer.capacity).toBe(3);
      expect(buffer.toArray()).toEqual([1, 2, 3]);
    });

    it('should use minimum of 1', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.resize(0);
      expect(buffer.capacity).toBe(1);
      expect(buffer.toArray()).toEqual([1]);
    });

    it('should preserve order after resize', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      buffer.push(1);
      buffer.push(2);
      buffer.shift();
      buffer.push(3);
      buffer.resize(5);
      expect(buffer.toArray()).toEqual([2, 3]);
    });

    it('should handle resize with wrap-around', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.shift();
      buffer.shift();
      buffer.push(4);
      buffer.push(5);
      buffer.resize(5);
      expect(buffer.toArray()).toEqual([3, 4, 5]);
    });
  });

  describe('clone', () => {
    it('should clone empty buffer', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      const clone = buffer.clone();
      expect(clone.capacity).toBe(5);
      expect(clone.isEmpty()).toBe(true);
    });

    it('should clone with elements', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      const clone = buffer.clone();
      expect(clone.toArray()).toEqual([1, 2, 3]);
      expect(clone.capacity).toBe(5);
    });

    it('should create independent copy', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      const clone = buffer.clone();
      clone.push(3);
      expect(buffer.toArray()).toEqual([1, 2]);
      expect(clone.toArray()).toEqual([1, 2, 3]);
    });

    it('should preserve overwrite setting', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3, overwrite: true });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      const clone = buffer.clone();
      clone.push(4);
      expect(clone.toArray()).toEqual([2, 3, 4]);
    });
  });

  describe('equals', () => {
    it('should return true for equal buffers', () => {
      const buffer1 = new CircularBuffer<number>({ capacity: 5 });
      const buffer2 = new CircularBuffer<number>({ capacity: 5 });
      buffer1.push(1);
      buffer1.push(2);
      buffer2.push(1);
      buffer2.push(2);
      expect(buffer1.equals(buffer2)).toBe(true);
    });

    it('should return false for different sizes', () => {
      const buffer1 = new CircularBuffer<number>({ capacity: 5 });
      const buffer2 = new CircularBuffer<number>({ capacity: 5 });
      buffer1.push(1);
      buffer1.push(2);
      buffer2.push(1);
      expect(buffer1.equals(buffer2)).toBe(false);
    });

    it('should return false for different elements', () => {
      const buffer1 = new CircularBuffer<number>({ capacity: 5 });
      const buffer2 = new CircularBuffer<number>({ capacity: 5 });
      buffer1.push(1);
      buffer1.push(2);
      buffer2.push(1);
      buffer2.push(3);
      expect(buffer1.equals(buffer2)).toBe(false);
    });

    it('should return true for empty buffers', () => {
      const buffer1 = new CircularBuffer<number>({ capacity: 5 });
      const buffer2 = new CircularBuffer<number>({ capacity: 5 });
      expect(buffer1.equals(buffer2)).toBe(true);
    });
  });

  describe('contains', () => {
    it('should return true when element exists', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.contains(2)).toBe(true);
    });

    it('should return false when element does not exist', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.contains(5)).toBe(false);
    });

    it('should return false for empty buffer', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      expect(buffer.contains(1)).toBe(false);
    });

    it('should handle null values', () => {
      const buffer = new CircularBuffer<number | null>({ capacity: 3 });
      buffer.push(1);
      buffer.push(null);
      buffer.push(2);
      expect(buffer.contains(null)).toBe(true);
    });
  });

  describe('indexOf', () => {
    it('should return index of existing element', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.indexOf(2)).toBe(1);
    });

    it('should return -1 for non-existent element', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.indexOf(5)).toBe(-1);
    });

    it('should return -1 for empty buffer', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      expect(buffer.indexOf(1)).toBe(-1);
    });

    it('should return first occurrence', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.indexOf(2)).toBe(1);
    });

    it('should work with wrap-around', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.shift();
      buffer.push(4);
      expect(buffer.indexOf(3)).toBe(1);
      expect(buffer.indexOf(4)).toBe(2);
    });
  });

  describe('lastIndexOf', () => {
    it('should return last index of existing element', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.lastIndexOf(2)).toBe(2);
    });

    it('should return -1 for non-existent element', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.lastIndexOf(5)).toBe(-1);
    });

    it('should return -1 for empty buffer', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      expect(buffer.lastIndexOf(1)).toBe(-1);
    });

    it('should work with wrap-around', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.shift();
      buffer.push(4);
      expect(buffer.lastIndexOf(2)).toBe(0);
      expect(buffer.lastIndexOf(4)).toBe(2);
    });
  });

  describe('reverse', () => {
    it('should reverse empty buffer', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      const result = buffer.reverse();
      expect(result.toArray()).toEqual([]);
      expect(result === buffer).toBe(true);
    });

    it('should reverse elements', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.reverse();
      expect(buffer.toArray()).toEqual([3, 2, 1]);
    });

    it('should reverse even number of elements', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.push(4);
      buffer.reverse();
      expect(buffer.toArray()).toEqual([4, 3, 2, 1]);
    });

    it('should return same buffer instance', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      buffer.push(1);
      buffer.push(2);
      const result = buffer.reverse();
      expect(result === buffer).toBe(true);
    });

    it('should reverse after wrap-around', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.shift();
      buffer.shift();
      buffer.push(4);
      buffer.push(5);
      buffer.reverse();
      expect(buffer.toArray()).toEqual([5, 4, 3]);
    });
  });

  describe('rotate', () => {
    it('should not rotate empty buffer', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      buffer.rotate(1);
      expect(buffer.isEmpty()).toBe(true);
    });

    it('should not rotate single element buffer', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      buffer.push(1);
      buffer.rotate(5);
      expect(buffer.toArray()).toEqual([1]);
    });

    it('should rotate right by positive amount', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.push(4);
      buffer.push(5);
      buffer.rotate(2);
      expect(buffer.toArray()).toEqual([3, 4, 5, 1, 2]);
    });

    it('should rotate left by negative amount', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.push(4);
      buffer.push(5);
      buffer.rotate(-2);
      expect(buffer.toArray()).toEqual([4, 5, 1, 2, 3]);
    });

    it('should handle rotation larger than size', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.push(4);
      buffer.push(5);
      buffer.rotate(7);
      expect(buffer.toArray()).toEqual([3, 4, 5, 1, 2]);
    });

    it('should not rotate by 0', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.rotate(0);
      expect(buffer.toArray()).toEqual([1, 2, 3]);
    });

    it('should handle negative rotation larger than size', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.push(4);
      buffer.push(5);
      buffer.rotate(-7);
      expect(buffer.toArray()).toEqual([4, 5, 1, 2, 3]);
    });
  });

  describe('toString', () => {
    it('should format empty buffer', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      const str = buffer.toString();
      expect(str).toBe('CircularBuffer(0/3) []');
    });

    it('should format buffer with elements', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      const str = buffer.toString();
      expect(str).toBe('CircularBuffer(3/5) [1, 2, 3]');
    });

    it('should format buffer with strings', () => {
      const buffer = new CircularBuffer<string>({ capacity: 3 });
      buffer.push('a');
      buffer.push('b');
      const str = buffer.toString();
      expect(str).toBe('CircularBuffer(2/3) [a, b]');
    });

    it('should format full buffer', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      const str = buffer.toString();
      expect(str).toBe('CircularBuffer(3/3) [1, 2, 3]');
    });
  });

  describe('iterator', () => {
    it('should support for...of iteration', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      const result: number[] = [];
      for (const value of buffer) {
        result.push(value);
      }
      expect(result).toEqual([1, 2, 3]);
    });

    it('should iterate over empty buffer', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      const result = [...buffer];
      expect(result).toEqual([]);
    });

    it('should support spread operator', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      const result = [...buffer];
      expect(result).toEqual([1, 2, 3]);
    });

    it('should iterate correctly after wrap-around', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3 });
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
  });

  describe('static from', () => {
    it('should create buffer from array', () => {
      const buffer = CircularBuffer.from([1, 2, 3]);
      expect(buffer.toArray()).toEqual([1, 2, 3]);
      expect(buffer.capacity).toBe(3);
    });

    it('should use array length as capacity', () => {
      const buffer = CircularBuffer.from([1, 2, 3, 4, 5]);
      expect(buffer.capacity).toBe(5);
    });

    it('should use provided capacity when larger', () => {
      const buffer = CircularBuffer.from([1, 2, 3], { capacity: 10 });
      expect(buffer.capacity).toBe(10);
      expect(buffer.toArray()).toEqual([1, 2, 3]);
    });

    it('should use provided capacity when smaller with overwrite', () => {
      const buffer = CircularBuffer.from([1, 2, 3, 4, 5], { capacity: 3, overwrite: true });
      expect(buffer.capacity).toBe(5);
      expect(buffer.toArray()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should use overwrite option', () => {
      const buffer = CircularBuffer.from([1, 2, 3, 4], { capacity: 3, overwrite: true });
      expect(buffer.capacity).toBe(4);
      expect(buffer.toArray()).toEqual([1, 2, 3, 4]);
    });

    it('should handle empty array', () => {
      const buffer = CircularBuffer.from([]);
      expect(buffer.isEmpty()).toBe(true);
      expect(buffer.capacity).toBe(1);
    });

    it('should handle empty array with capacity', () => {
      const buffer = CircularBuffer.from([], { capacity: 5 });
      expect(buffer.isEmpty()).toBe(true);
      expect(buffer.capacity).toBe(5);
    });
  });

  describe('mixed operations', () => {
    it('should handle alternating push and shift', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.push(1);
      buffer.push(2);
      expect(buffer.shift()).toBe(1);
      buffer.push(3);
      buffer.push(4);
      expect(buffer.shift()).toBe(2);
      expect(buffer.toArray()).toEqual([3, 4]);
    });

    it('should handle alternating unshift and pop', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      buffer.unshift(2);
      buffer.unshift(1);
      expect(buffer.pop()).toBe(2);
      buffer.unshift(3);
      buffer.unshift(4);
      expect(buffer.pop()).toBe(1);
      expect(buffer.toArray()).toEqual([4, 3]);
    });

    it('should handle wrap-around with mixed operations', () => {
      const buffer = new CircularBuffer<number>({ capacity: 3, overwrite: true });
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.shift();
      buffer.push(4);
      buffer.unshift(0);
      expect(buffer.toArray()).toEqual([0, 2, 3]);
    });

    it('should maintain state after many operations', () => {
      const buffer = new CircularBuffer<number>({ capacity: 5 });
      for (let i = 0; i < 100; i++) {
        buffer.push(i);
        if (buffer.isFull()) {
          buffer.shift();
        }
      }
      expect(buffer.size).toBe(4);
    });
  });

  describe('edge cases', () => {
    it('should handle capacity 1', () => {
      const buffer = new CircularBuffer<number>({ capacity: 1 });
      buffer.push(1);
      expect(buffer.size).toBe(1);
      expect(buffer.isFull()).toBe(true);
      expect(buffer.pop()).toBe(1);
    });

    it('should handle rapid operations', () => {
      const buffer = new CircularBuffer<number>({ capacity: 10 });
      for (let i = 0; i < 1000; i++) {
        buffer.push(i);
        buffer.shift();
      }
      expect(buffer.isEmpty()).toBe(true);
    });

    it('should handle large capacity', () => {
      const buffer = new CircularBuffer<number>({ capacity: 1000 });
      for (let i = 0; i < 1000; i++) {
        buffer.push(i);
      }
      expect(buffer.size).toBe(1000);
      expect(buffer.isFull()).toBe(true);
    });

    it('should handle string values', () => {
      const buffer = new CircularBuffer<string>({ capacity: 3 });
      buffer.push('a');
      buffer.push('b');
      buffer.push('c');
      expect(buffer.toArray()).toEqual(['a', 'b', 'c']);
    });

    it('should handle object values', () => {
      const buffer = new CircularBuffer<{ id: number }>({ capacity: 3 });
      buffer.push({ id: 1 });
      buffer.push({ id: 2 });
      buffer.push({ id: 3 });
      expect(buffer.toArray()).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    });

    it('should handle null values', () => {
      const buffer = new CircularBuffer<number | null>({ capacity: 3 });
      buffer.push(null);
      buffer.push(1);
      buffer.push(null);
      expect(buffer.toArray()).toEqual([null, 1, null]);
    });

    it('should handle undefined values', () => {
      const buffer = new CircularBuffer<number | undefined>({ capacity: 3 });
      buffer.push(undefined);
      buffer.push(1);
      buffer.push(undefined);
      expect(buffer.toArray()).toEqual([undefined, 1, undefined]);
    });
  });
});
