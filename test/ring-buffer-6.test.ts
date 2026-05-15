import { describe, it, expect } from 'vitest';
import { RingBuffer6 } from '../src/core/ring-buffer-6/index.js';

describe('RingBuffer6', () => {
  describe('push and pop', () => {
    it('should push and pop items correctly', () => {
      const buffer = new RingBuffer6<number>();
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);

      expect(buffer.pop()).toBe(3);
      expect(buffer.pop()).toBe(2);
      expect(buffer.pop()).toBe(1);
      expect(buffer.pop()).toBeUndefined();
    });

    it('should handle strings', () => {
      const buffer = new RingBuffer6<string>();
      buffer.push('a');
      buffer.push('b');

      expect(buffer.pop()).toBe('b');
      expect(buffer.pop()).toBe('a');
    });
  });

  describe('shift and unshift', () => {
    it('should shift and unshift items correctly', () => {
      const buffer = new RingBuffer6<number>();
      buffer.unshift(1);
      buffer.unshift(2);
      buffer.unshift(3);

      expect(buffer.shift()).toBe(3);
      expect(buffer.shift()).toBe(2);
      expect(buffer.shift()).toBe(1);
      expect(buffer.shift()).toBeUndefined();
    });

    it('should combine with push and shift', () => {
      const buffer = new RingBuffer6<number>();
      buffer.push(1);
      buffer.push(2);
      buffer.unshift(3);

      expect(buffer.shift()).toBe(3);
      expect(buffer.shift()).toBe(1);
      expect(buffer.shift()).toBe(2);
    });
  });

  describe('get and set', () => {
    it('should get items by index', () => {
      const buffer = new RingBuffer6<number>();
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);

      expect(buffer.get(0)).toBe(1);
      expect(buffer.get(1)).toBe(2);
      expect(buffer.get(2)).toBe(3);
    });

    it('should return undefined for out of bounds index', () => {
      const buffer = new RingBuffer6<number>();
      buffer.push(1);
      buffer.push(2);

      expect(buffer.get(-1)).toBeUndefined();
      expect(buffer.get(2)).toBeUndefined();
      expect(buffer.get(10)).toBeUndefined();
    });

    it('should set items by index', () => {
      const buffer = new RingBuffer6<number>();
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);

      buffer.set(1, 99);
      expect(buffer.get(0)).toBe(1);
      expect(buffer.get(1)).toBe(99);
      expect(buffer.get(2)).toBe(3);
    });

    it('should not set for out of bounds index', () => {
      const buffer = new RingBuffer6<number>();
      buffer.push(1);
      buffer.push(2);

      buffer.set(-1, 99);
      buffer.set(2, 99);
      expect(buffer.get(0)).toBe(1);
      expect(buffer.get(1)).toBe(2);
    });
  });

  describe('auto-resize', () => {
    it('should double capacity when full', () => {
      const buffer = new RingBuffer6<number>(2);
      expect(buffer.capacity).toBe(2);

      buffer.push(1);
      buffer.push(2);
      expect(buffer.capacity).toBe(2);

      buffer.push(3);
      expect(buffer.capacity).toBe(4);
    });

    it('should resize correctly with unshift', () => {
      const buffer = new RingBuffer6<number>(2);
      buffer.unshift(1);
      buffer.unshift(2);
      expect(buffer.capacity).toBe(2);

      buffer.unshift(3);
      expect(buffer.capacity).toBe(4);
    });

    it('should preserve data after resize', () => {
      const buffer = new RingBuffer6<number>(4);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.push(4);

      buffer.push(5);

      expect(buffer.size).toBe(5);
      expect(buffer.get(0)).toBe(1);
      expect(buffer.get(1)).toBe(2);
      expect(buffer.get(2)).toBe(3);
      expect(buffer.get(3)).toBe(4);
      expect(buffer.get(4)).toBe(5);
    });

    it('should resize correctly after pop operations', () => {
      const buffer = new RingBuffer6<number>(4);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.push(4);

      buffer.pop();
      buffer.pop();

      buffer.push(5);
      buffer.push(6);
      buffer.push(7);

      expect(buffer.capacity).toBe(8);
      expect(buffer.size).toBe(5);
      expect(buffer.get(0)).toBe(1);
      expect(buffer.get(1)).toBe(2);
      expect(buffer.get(2)).toBe(5);
      expect(buffer.get(3)).toBe(6);
      expect(buffer.get(4)).toBe(7);
    });
  });

  describe('isEmpty and isFull', () => {
    it('should be empty when created', () => {
      const buffer = new RingBuffer6<number>();
      expect(buffer.isEmpty()).toBe(true);
      expect(buffer.isFull()).toBe(false);
    });

    it('should be full when capacity is reached', () => {
      const buffer = new RingBuffer6<number>(2);
      buffer.push(1);
      buffer.push(2);

      expect(buffer.isEmpty()).toBe(false);
      expect(buffer.isFull()).toBe(true);
    });

    it('should update after pop', () => {
      const buffer = new RingBuffer6<number>(2);
      buffer.push(1);
      buffer.push(2);
      buffer.pop();

      expect(buffer.isEmpty()).toBe(false);
      expect(buffer.isFull()).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all items', () => {
      const buffer = new RingBuffer6<number>();
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);

      buffer.clear();

      expect(buffer.size).toBe(0);
      expect(buffer.isEmpty()).toBe(true);
      expect(buffer.pop()).toBeUndefined();
      expect(buffer.shift()).toBeUndefined();
    });
  });

  describe('toArray', () => {
    it('should convert to array', () => {
      const buffer = new RingBuffer6<number>();
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);

      const arr = buffer.toArray();

      expect(arr).toEqual([1, 2, 3]);
    });

    it('should work with mixed operations', () => {
      const buffer = new RingBuffer6<number>();
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.shift();

      const arr = buffer.toArray();

      expect(arr).toEqual([2, 3]);
    });

    it('should return empty array when empty', () => {
      const buffer = new RingBuffer6<number>();

      const arr = buffer.toArray();

      expect(arr).toEqual([]);
    });
  });

  describe('forEach', () => {
    it('should iterate over all items', () => {
      const buffer = new RingBuffer6<number>();
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);

      const items: number[] = [];
      const indices: number[] = [];
      buffer.forEach((item, index) => {
        items.push(item);
        indices.push(index);
      });

      expect(items).toEqual([1, 2, 3]);
      expect(indices).toEqual([0, 1, 2]);
    });

    it('should work after shift operations', () => {
      const buffer = new RingBuffer6<number>();
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      buffer.shift();

      const items: number[] = [];
      buffer.forEach((item) => {
        items.push(item);
      });

      expect(items).toEqual([2, 3]);
    });
  });

  describe('size and capacity getters', () => {
    it('should report correct size', () => {
      const buffer = new RingBuffer6<number>();
      expect(buffer.size).toBe(0);

      buffer.push(1);
      expect(buffer.size).toBe(1);

      buffer.push(2);
      buffer.push(3);
      expect(buffer.size).toBe(3);

      buffer.pop();
      expect(buffer.size).toBe(2);
    });

    it('should report correct capacity', () => {
      const buffer = new RingBuffer6<number>(10);
      expect(buffer.capacity).toBe(10);

      for (let i = 0; i < 10; i++) {
        buffer.push(i);
      }

      buffer.push(10);
      expect(buffer.capacity).toBe(20);
    });
  });

  describe('FIFO order', () => {
    it('should maintain FIFO order with push and shift', () => {
      const buffer = new RingBuffer6<number>();
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);

      expect(buffer.shift()).toBe(1);
      expect(buffer.shift()).toBe(2);
      expect(buffer.shift()).toBe(3);
    });

    it('should maintain LIFO order with push and pop', () => {
      const buffer = new RingBuffer6<number>();
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);

      expect(buffer.pop()).toBe(3);
      expect(buffer.pop()).toBe(2);
      expect(buffer.pop()).toBe(1);
    });

    it('should maintain FIFO order with unshift and pop', () => {
      const buffer = new RingBuffer6<number>();
      buffer.unshift(1);
      buffer.unshift(2);
      buffer.unshift(3);

      expect(buffer.pop()).toBe(1);
      expect(buffer.pop()).toBe(2);
      expect(buffer.pop()).toBe(3);
    });

    it('should maintain LIFO order with unshift and shift', () => {
      const buffer = new RingBuffer6<number>();
      buffer.unshift(1);
      buffer.unshift(2);
      buffer.unshift(3);

      expect(buffer.shift()).toBe(3);
      expect(buffer.shift()).toBe(2);
      expect(buffer.shift()).toBe(1);
    });
  });

  describe('default capacity', () => {
    it('should use default capacity of 16', () => {
      const buffer = new RingBuffer6<number>();
      expect(buffer.capacity).toBe(16);
    });
  });

  describe('complex scenario', () => {
    it('should handle complex sequence of operations', () => {
      const buffer = new RingBuffer6<number>(4);
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      expect(buffer.size).toBe(3);

      buffer.shift();
      expect(buffer.size).toBe(2);

      buffer.unshift(4);
      buffer.push(5);
      expect(buffer.size).toBe(4);

      buffer.push(6);
      expect(buffer.size).toBe(5);
      expect(buffer.capacity).toBe(8);

      expect(buffer.toArray()).toEqual([4, 2, 3, 5, 6]);

      buffer.pop();
      buffer.pop();
      buffer.shift();

      expect(buffer.toArray()).toEqual([2, 3]);
      expect(buffer.size).toBe(2);
    });
  });

  describe('additional coverage', () => {
    it('should handle getAt', () => {
      const buffer = new RingBuffer6<number>(4);
      buffer.push(10);
      buffer.push(20);
      buffer.push(30);
      expect(buffer.toArray()).toEqual([10, 20, 30]);
    });

    it('should handle clear', () => {
      const buffer = new RingBuffer6<number>(4);
      buffer.push(1);
      buffer.push(2);
      buffer.clear();
      expect(buffer.size).toBe(0);
      expect(buffer.isEmpty()).toBe(true);
    });

    it('should handle isEmpty on fresh buffer', () => {
      const buffer = new RingBuffer6<number>();
      expect(buffer.isEmpty()).toBe(true);
    });

    it('should handle forEach iteration', () => {
      const buffer = new RingBuffer6<number>();
      buffer.push(1);
      buffer.push(2);
      buffer.push(3);
      const collected: number[] = [];
      buffer.forEach(item => collected.push(item));
      expect(collected).toEqual([1, 2, 3]);
    });
  });
});
