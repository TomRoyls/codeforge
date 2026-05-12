import { describe, it, expect } from 'vitest';
import { CircularBuffer3 } from './src/core/circular-buffer-3/index.js';

describe('CircularBuffer3', () => {
  describe('constructor', () => {
    it('should create buffer with specified capacity', () => {
      const buffer = new CircularBuffer3<number>(5);
      expect(buffer.capacity).toBe(5);
    });

    it('should be empty initially', () => {
      const buffer = new CircularBuffer3<number>(3);
      expect(buffer.isEmpty).toBe(true);
    });

    it('should not be full initially', () => {
      const buffer = new CircularBuffer3<number>(3);
      expect(buffer.isFull).toBe(false);
    });

    it('should have size 0 initially', () => {
      const buffer = new CircularBuffer3<number>(3);
      expect(buffer.size).toBe(0);
    });

    it('should throw error for capacity 0', () => {
      expect(() => new CircularBuffer3<number>(0)).toThrow('Capacity must be greater than 0');
    });

    it('should throw error for negative capacity', () => {
      expect(() => new CircularBuffer3<number>(-1)).toThrow('Capacity must be greater than 0');
    });
  });

  describe('write and read', () => {
    it('should write and read single element', () => {
      const buffer = new CircularBuffer3<number>(3);
      buffer.write(1);
      expect(buffer.read()).toBe(1);
    });

    it('should write and read multiple elements in order', () => {
      const buffer = new CircularBuffer3<number>(3);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      expect(buffer.read()).toBe(1);
      expect(buffer.read()).toBe(2);
      expect(buffer.read()).toBe(3);
    });

    it('should read undefined from empty buffer', () => {
      const buffer = new CircularBuffer3<number>(3);
      expect(buffer.read()).toBeUndefined();
    });

    it('should maintain order after multiple writes and reads', () => {
      const buffer = new CircularBuffer3<number>(5);
      buffer.write(1);
      buffer.write(2);
      buffer.read();
      buffer.write(3);
      buffer.write(4);
      expect(buffer.read()).toBe(2);
      expect(buffer.read()).toBe(3);
      expect(buffer.read()).toBe(4);
    });

    it('should handle string values', () => {
      const buffer = new CircularBuffer3<string>(3);
      buffer.write('hello');
      buffer.write('world');
      expect(buffer.read()).toBe('hello');
      expect(buffer.read()).toBe('world');
    });

    it('should handle object values', () => {
      const buffer = new CircularBuffer3<{ id: number }>(3);
      buffer.write({ id: 1 });
      buffer.write({ id: 2 });
      expect(buffer.read()).toEqual({ id: 1 });
      expect(buffer.read()).toEqual({ id: 2 });
    });

    it('should handle null values', () => {
      const buffer = new CircularBuffer3<number | null>(3);
      buffer.write(null);
      expect(buffer.read()).toBeNull();
    });

    it('should handle undefined values explicitly written', () => {
      const buffer = new CircularBuffer3<number | undefined>(3);
      buffer.write(undefined);
      expect(buffer.read()).toBeUndefined();
    });
  });

  describe('peek', () => {
    it('should peek at first element without removing it', () => {
      const buffer = new CircularBuffer3<number>(3);
      buffer.write(1);
      buffer.write(2);
      expect(buffer.peek()).toBe(1);
      expect(buffer.size).toBe(2);
    });

    it('should return undefined for empty buffer', () => {
      const buffer = new CircularBuffer3<number>(3);
      expect(buffer.peek()).toBeUndefined();
    });

    it('should allow multiple peeks without affecting buffer', () => {
      const buffer = new CircularBuffer3<number>(3);
      buffer.write(1);
      buffer.write(2);
      expect(buffer.peek()).toBe(1);
      expect(buffer.peek()).toBe(1);
      expect(buffer.peek()).toBe(1);
      expect(buffer.size).toBe(2);
    });

    it('should peek correctly after partial reads', () => {
      const buffer = new CircularBuffer3<number>(5);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      buffer.read();
      expect(buffer.peek()).toBe(2);
    });
  });

  describe('isFull and isEmpty', () => {
    it('should detect when buffer is full', () => {
      const buffer = new CircularBuffer3<number>(3);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      expect(buffer.isFull).toBe(true);
    });

    it('should detect when buffer is not full', () => {
      const buffer = new CircularBuffer3<number>(3);
      buffer.write(1);
      expect(buffer.isFull).toBe(false);
    });

    it('should detect when buffer is empty', () => {
      const buffer = new CircularBuffer3<number>(3);
      buffer.write(1);
      buffer.read();
      expect(buffer.isEmpty).toBe(true);
    });

    it('should detect when buffer is not empty', () => {
      const buffer = new CircularBuffer3<number>(3);
      buffer.write(1);
      expect(buffer.isEmpty).toBe(false);
    });

    it('should toggle empty status correctly', () => {
      const buffer = new CircularBuffer3<number>(3);
      expect(buffer.isEmpty).toBe(true);
      buffer.write(1);
      expect(buffer.isEmpty).toBe(false);
      buffer.read();
      expect(buffer.isEmpty).toBe(true);
    });

    it('should toggle full status correctly', () => {
      const buffer = new CircularBuffer3<number>(3);
      expect(buffer.isFull).toBe(false);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      expect(buffer.isFull).toBe(true);
      buffer.read();
      expect(buffer.isFull).toBe(false);
    });
  });

  describe('size and capacity', () => {
    it('should report correct size after writes', () => {
      const buffer = new CircularBuffer3<number>(5);
      expect(buffer.size).toBe(0);
      buffer.write(1);
      expect(buffer.size).toBe(1);
      buffer.write(2);
      expect(buffer.size).toBe(2);
      buffer.write(3);
      expect(buffer.size).toBe(3);
    });

    it('should report correct size after reads', () => {
      const buffer = new CircularBuffer3<number>(5);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      buffer.read();
      expect(buffer.size).toBe(2);
      buffer.read();
      expect(buffer.size).toBe(1);
    });

    it('should report constant capacity', () => {
      const buffer = new CircularBuffer3<number>(5);
      buffer.write(1);
      buffer.write(2);
      buffer.read();
      expect(buffer.capacity).toBe(5);
    });

    it('should limit size to capacity', () => {
      const buffer = new CircularBuffer3<number>(3);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      expect(buffer.size).toBe(3);
    });
  });

  describe('overwriting behavior', () => {
    it('should overwrite oldest when full', () => {
      const buffer = new CircularBuffer3<number>(3);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      buffer.write(4);
      expect(buffer.size).toBe(3);
      expect(buffer.read()).toBe(2);
      expect(buffer.read()).toBe(3);
      expect(buffer.read()).toBe(4);
    });

    it('should overwrite multiple elements', () => {
      const buffer = new CircularBuffer3<number>(3);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      buffer.write(4);
      buffer.write(5);
      buffer.write(6);
      expect(buffer.read()).toBe(4);
      expect(buffer.read()).toBe(5);
      expect(buffer.read()).toBe(6);
    });

    it('should handle overwriting with single element buffer', () => {
      const buffer = new CircularBuffer3<number>(1);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      expect(buffer.read()).toBe(3);
    });

    it('should maintain correct size after overwriting', () => {
      const buffer = new CircularBuffer3<number>(3);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      buffer.write(4);
      expect(buffer.size).toBe(3);
      expect(buffer.isFull).toBe(true);
    });
  });

  describe('wrap-around', () => {
    it('should handle wrap-around correctly', () => {
      const buffer = new CircularBuffer3<number>(5);
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

    it('should handle wrap-around with overwriting', () => {
      const buffer = new CircularBuffer3<number>(3);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      buffer.read();
      buffer.write(4);
      buffer.write(5);
      buffer.write(6);
      expect(buffer.read()).toBe(4);
      expect(buffer.read()).toBe(5);
      expect(buffer.read()).toBe(6);
      expect(buffer.read()).toBeUndefined();
    });
  });

  describe('clear', () => {
    it('should clear empty buffer', () => {
      const buffer = new CircularBuffer3<number>(3);
      buffer.clear();
      expect(buffer.isEmpty).toBe(true);
      expect(buffer.size).toBe(0);
    });

    it('should clear partially filled buffer', () => {
      const buffer = new CircularBuffer3<number>(5);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      buffer.clear();
      expect(buffer.isEmpty).toBe(true);
      expect(buffer.size).toBe(0);
      expect(buffer.read()).toBeUndefined();
    });

    it('should clear full buffer', () => {
      const buffer = new CircularBuffer3<number>(3);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      buffer.clear();
      expect(buffer.isEmpty).toBe(true);
      expect(buffer.size).toBe(0);
      expect(buffer.isFull).toBe(false);
    });

    it('should allow writing after clear', () => {
      const buffer = new CircularBuffer3<number>(3);
      buffer.write(1);
      buffer.write(2);
      buffer.clear();
      buffer.write(3);
      buffer.write(4);
      expect(buffer.read()).toBe(3);
      expect(buffer.read()).toBe(4);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty buffer', () => {
      const buffer = new CircularBuffer3<number>(3);
      expect(buffer.toArray()).toEqual([]);
    });

    it('should return all elements in order', () => {
      const buffer = new CircularBuffer3<number>(3);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      expect(buffer.toArray()).toEqual([1, 2, 3]);
    });

    it('should not affect buffer', () => {
      const buffer = new CircularBuffer3<number>(3);
      buffer.write(1);
      buffer.write(2);
      buffer.toArray();
      expect(buffer.size).toBe(2);
      expect(buffer.read()).toBe(1);
    });

    it('should return correct array after wrap-around', () => {
      const buffer = new CircularBuffer3<number>(5);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      buffer.write(4);
      buffer.write(5);
      buffer.read();
      buffer.read();
      buffer.write(6);
      buffer.write(7);
      expect(buffer.toArray()).toEqual([3, 4, 5, 6, 7]);
    });

    it('should return correct array after overwriting', () => {
      const buffer = new CircularBuffer3<number>(3);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      buffer.write(4);
      expect(buffer.toArray()).toEqual([2, 3, 4]);
    });
  });

  describe('forEach', () => {
    it('should not iterate over empty buffer', () => {
      const buffer = new CircularBuffer3<number>(3);
      let count = 0;
      buffer.forEach(() => {
        count++;
      });
      expect(count).toBe(0);
    });

    it('should iterate over all elements', () => {
      const buffer = new CircularBuffer3<number>(3);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      const result: number[] = [];
      buffer.forEach((value) => {
        result.push(value);
      });
      expect(result).toEqual([1, 2, 3]);
    });

    it('should provide correct index', () => {
      const buffer = new CircularBuffer3<number>(3);
      buffer.write(10);
      buffer.write(20);
      buffer.write(30);
      buffer.forEach((value, index) => {
        if (index === 0) expect(value).toBe(10);
        if (index === 1) expect(value).toBe(20);
        if (index === 2) expect(value).toBe(30);
      });
    });

    it('should not modify buffer during iteration', () => {
      const buffer = new CircularBuffer3<number>(3);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      buffer.forEach(() => {});
      expect(buffer.size).toBe(3);
    });

    it('should iterate correctly after wrap-around', () => {
      const buffer = new CircularBuffer3<number>(5);
      buffer.write(1);
      buffer.write(2);
      buffer.write(3);
      buffer.write(4);
      buffer.write(5);
      buffer.read();
      buffer.read();
      buffer.write(6);
      buffer.write(7);
      const result: number[] = [];
      buffer.forEach((value) => {
        result.push(value);
      });
      expect(result).toEqual([3, 4, 5, 6, 7]);
    });
  });

  describe('writeMany', () => {
    it('should write empty array', () => {
      const buffer = new CircularBuffer3<number>(3);
      buffer.writeMany([]);
      expect(buffer.size).toBe(0);
    });

    it('should write multiple elements', () => {
      const buffer = new CircularBuffer3<number>(5);
      buffer.writeMany([1, 2, 3]);
      expect(buffer.read()).toBe(1);
      expect(buffer.read()).toBe(2);
      expect(buffer.read()).toBe(3);
    });

    it('should overwrite when exceeding capacity', () => {
      const buffer = new CircularBuffer3<number>(3);
      buffer.writeMany([1, 2, 3, 4, 5]);
      expect(buffer.size).toBe(3);
      expect(buffer.read()).toBe(3);
      expect(buffer.read()).toBe(4);
      expect(buffer.read()).toBe(5);
    });

    it('should handle single element array', () => {
      const buffer = new CircularBuffer3<number>(3);
      buffer.writeMany([42]);
      expect(buffer.read()).toBe(42);
    });

    it('should work with partial buffer', () => {
      const buffer = new CircularBuffer3<number>(5);
      buffer.write(1);
      buffer.writeMany([2, 3, 4]);
      expect(buffer.size).toBe(4);
      expect(buffer.read()).toBe(1);
      expect(buffer.read()).toBe(2);
    });
  });

  describe('edge cases', () => {
    it('should handle capacity 1 with single write', () => {
      const buffer = new CircularBuffer3<number>(1);
      buffer.write(1);
      expect(buffer.size).toBe(1);
      expect(buffer.isFull).toBe(true);
      expect(buffer.read()).toBe(1);
    });

    it('should handle rapid write-read cycles', () => {
      const buffer = new CircularBuffer3<number>(100);
      for (let i = 0; i < 1000; i++) {
        buffer.write(i);
        buffer.read();
      }
      expect(buffer.isEmpty).toBe(true);
    });

    it('should maintain integrity after many operations', () => {
      const buffer = new CircularBuffer3<number>(10);
      for (let i = 0; i < 100; i++) {
        buffer.write(i);
        if (buffer.isFull) {
          buffer.read();
        }
      }
      const arr = buffer.toArray();
      expect(arr.length).toBe(9);
      expect(arr).toEqual([91, 92, 93, 94, 95, 96, 97, 98, 99]);
    });

    it('should handle large capacity', () => {
      const buffer = new CircularBuffer3<number>(1000);
      for (let i = 0; i < 1000; i++) {
        buffer.write(i);
      }
      expect(buffer.size).toBe(1000);
      expect(buffer.isFull).toBe(true);
    });
  });

  describe('type safety', () => {
    it('should work with generic type string', () => {
      const buffer = new CircularBuffer3<string>(3);
      buffer.write('a');
      buffer.write('b');
      expect(buffer.read()).toBe('a');
    });

    it('should work with generic type number', () => {
      const buffer = new CircularBuffer3<number>(3);
      buffer.write(1.5);
      buffer.write(2.7);
      expect(buffer.read()).toBe(1.5);
    });

    it('should work with complex generic type', () => {
      type Complex = { id: number; value: string };
      const buffer = new CircularBuffer3<Complex>(3);
      buffer.write({ id: 1, value: 'test' });
      expect(buffer.read()).toEqual({ id: 1, value: 'test' });
    });
  });
});
