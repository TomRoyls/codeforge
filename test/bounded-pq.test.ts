import { describe, it, expect, beforeEach } from 'vitest';
import { BoundedPriorityQueue } from '../src/core/bounded-pq/index.js';

describe('BoundedPriorityQueue', () => {
  let pq: BoundedPriorityQueue<number>;

  beforeEach(() => {
    pq = new BoundedPriorityQueue<number>(5);
  });

  describe('constructor', () => {
    it('should create empty queue', () => {
      const queue = new BoundedPriorityQueue<number>(3);
      expect(queue.size).toBe(0);
      expect(queue.isEmpty).toBe(true);
      expect(queue.isFull).toBe(false);
      expect(queue.capacity).toBe(3);
    });

    it('should throw on invalid capacity', () => {
      expect(() => new BoundedPriorityQueue<number>(0)).toThrow('capacity must be a positive integer');
      expect(() => new BoundedPriorityQueue<number>(-1)).toThrow('capacity must be a positive integer');
      expect(() => new BoundedPriorityQueue<number>(1.5)).toThrow('capacity must be a positive integer');
    });

    it('should accept custom comparator', () => {
      const queue = new BoundedPriorityQueue<number>(3, { comparator: (a, b) => b - a });
      queue.push(1);
      queue.push(2);
      queue.push(3);
      expect(queue.pop()).toBe(3);
    });
  });

  describe('push', () => {
    it('should return undefined when not full', () => {
      expect(pq.push(5)).toBeUndefined();
      expect(pq.push(3)).toBeUndefined();
      expect(pq.size).toBe(2);
    });

    it('should return evicted value when full', () => {
      pq.push(5);
      pq.push(10);
      pq.push(7);
      pq.push(3);
      pq.push(8);
      expect(pq.isFull).toBe(true);
      expect(pq.push(6)).toBe(3);
      expect(pq.size).toBe(5);
    });

    it('should return same value if not better than minimum', () => {
      pq.push(5);
      pq.push(3);
      pq.push(7);
      const result = pq.push(2);
      expect(result).toBeUndefined();
      expect(pq.size).toBe(4);
    });

    it('should maintain heap property', () => {
      pq.push(5);
      pq.push(3);
      pq.push(7);
      expect(pq.peek()).toBe(3);
      pq.push(1);
      expect(pq.peek()).toBe(1);
    });
  });

  describe('enqueue', () => {
    it('should alias to push', () => {
      expect(pq.enqueue(5)).toBeUndefined();
      expect(pq.enqueue(3)).toBeUndefined();
      expect(pq.size).toBe(2);
      expect(pq.peek()).toBe(3);
    });

    it('should return evicted value when full', () => {
      pq.enqueue(5);
      pq.enqueue(3);
      pq.enqueue(7);
      pq.enqueue(1);
      pq.enqueue(9);
      expect(pq.isFull).toBe(true);
      expect(pq.enqueue(2)).toBe(1);
      expect(pq.size).toBe(5);
    });
  });

  describe('pop', () => {
    it('should throw on empty queue', () => {
      expect(() => pq.pop()).toThrow('pop called on empty queue');
    });

    it('should return minimum element', () => {
      pq.push(5);
      pq.push(3);
      pq.push(7);
      expect(pq.pop()).toBe(3);
      expect(pq.size).toBe(2);
    });

    it('should maintain heap property after pop', () => {
      pq.push(5);
      pq.push(3);
      pq.push(7);
      pq.push(1);
      expect(pq.pop()).toBe(1);
      expect(pq.pop()).toBe(3);
      expect(pq.pop()).toBe(5);
      expect(pq.pop()).toBe(7);
    });

    it('should work with single element', () => {
      pq.push(5);
      expect(pq.pop()).toBe(5);
      expect(pq.isEmpty).toBe(true);
    });
  });

  describe('dequeue', () => {
    it('should alias to pop', () => {
      pq.push(5);
      pq.push(3);
      expect(pq.dequeue()).toBe(3);
      expect(pq.dequeue()).toBe(5);
      expect(pq.isEmpty).toBe(true);
    });

    it('should throw on empty queue', () => {
      expect(() => pq.dequeue()).toThrow('pop called on empty queue');
    });
  });

  describe('peek', () => {
    it('should throw on empty queue', () => {
      expect(() => pq.peek()).toThrow('peek called on empty queue');
    });

    it('should return minimum without removing', () => {
      pq.push(5);
      pq.push(3);
      pq.push(7);
      expect(pq.peek()).toBe(3);
      expect(pq.size).toBe(3);
      expect(pq.peek()).toBe(3);
    });

    it('should work with single element', () => {
      pq.push(5);
      expect(pq.peek()).toBe(5);
      expect(pq.size).toBe(1);
    });
  });

  describe('size', () => {
    it('should return 0 for empty queue', () => {
      expect(pq.size).toBe(0);
    });

    it('should track size correctly', () => {
      expect(pq.size).toBe(0);
      pq.push(1);
      expect(pq.size).toBe(1);
      pq.push(2);
      pq.push(3);
      expect(pq.size).toBe(3);
      pq.pop();
      expect(pq.size).toBe(2);
    });

    it('should not exceed capacity', () => {
      for (let i = 0; i < 10; i++) {
        pq.push(i);
      }
      expect(pq.size).toBe(5);
    });
  });

  describe('isEmpty', () => {
    it('should be true for empty queue', () => {
      expect(pq.isEmpty).toBe(true);
    });

    it('should be false after insertion', () => {
      pq.push(5);
      expect(pq.isEmpty).toBe(false);
    });

    it('should be true after clearing', () => {
      pq.push(5);
      pq.clear();
      expect(pq.isEmpty).toBe(true);
    });
  });

  describe('isFull', () => {
    it('should be false for empty queue', () => {
      expect(pq.isFull).toBe(false);
    });

    it('should become true when at capacity', () => {
      pq.push(1);
      pq.push(2);
      pq.push(3);
      pq.push(4);
      pq.push(5);
      expect(pq.isFull).toBe(true);
    });

    it('should be false after popping', () => {
      pq.push(1);
      pq.push(2);
      pq.push(3);
      pq.push(4);
      pq.push(5);
      expect(pq.isFull).toBe(true);
      pq.pop();
      expect(pq.isFull).toBe(false);
    });
  });

  describe('capacity', () => {
    it('should return capacity', () => {
      const queue = new BoundedPriorityQueue<number>(10);
      expect(queue.capacity).toBe(10);
    });

    it('should remain constant', () => {
      const capacity = pq.capacity;
      pq.push(1);
      pq.push(2);
      pq.pop();
      expect(pq.capacity).toBe(capacity);
    });
  });

  describe('clear', () => {
    it('should empty queue', () => {
      pq.push(5);
      pq.push(3);
      pq.push(7);
      pq.clear();
      expect(pq.isEmpty).toBe(true);
      expect(pq.size).toBe(0);
    });

    it('should work on empty queue', () => {
      pq.clear();
      expect(pq.isEmpty).toBe(true);
      expect(pq.size).toBe(0);
    });

    it('should reset isFull', () => {
      pq.push(1);
      pq.push(2);
      pq.push(3);
      pq.push(4);
      pq.push(5);
      expect(pq.isFull).toBe(true);
      pq.clear();
      expect(pq.isFull).toBe(false);
    });
  });

  describe('toArray', () => {
    it('should return sorted array', () => {
      pq.push(5);
      pq.push(3);
      pq.push(7);
      pq.push(1);
      expect(pq.toArray()).toEqual([1, 3, 5, 7]);
    });

    it('should return empty array for empty queue', () => {
      expect(pq.toArray()).toEqual([]);
    });

    it('should not modify internal state', () => {
      pq.push(5);
      pq.push(3);
      const arr = pq.toArray();
      arr.push(10);
      expect(pq.size).toBe(2);
      expect(pq.toArray()).toEqual([3, 5]);
    });

    it('should work with single element', () => {
      pq.push(5);
      expect(pq.toArray()).toEqual([5]);
    });

    it('should return all elements', () => {
      const values = [5, 3, 7, 1, 9];
      values.forEach(v => pq.push(v));
      expect(pq.toArray()).toEqual([1, 3, 5, 7, 9]);
    });
  });

  describe('contains', () => {
    it('should return true for existing value', () => {
      pq.push(5);
      pq.push(3);
      pq.push(7);
      expect(pq.contains(5)).toBe(true);
      expect(pq.contains(3)).toBe(true);
      expect(pq.contains(7)).toBe(true);
    });

    it('should return false for non-existing value', () => {
      pq.push(5);
      pq.push(3);
      pq.push(7);
      expect(pq.contains(1)).toBe(false);
      expect(pq.contains(10)).toBe(false);
    });

    it('should return false for empty queue', () => {
      expect(pq.contains(5)).toBe(false);
    });

    it('should work with duplicates', () => {
      pq.push(5);
      pq.push(5);
      expect(pq.contains(5)).toBe(true);
    });

    it('should use comparator for custom objects', () => {
      const queue = new BoundedPriorityQueue<{ value: number }>(5, {
        comparator: (a, b) => a.value - b.value
      });
      queue.push({ value: 5 });
      queue.push({ value: 3 });
      expect(queue.contains({ value: 5 })).toBe(true);
      expect(queue.contains({ value: 3 })).toBe(true);
    });
  });

  describe('merge', () => {
    it('should merge two queues', () => {
      pq.push(1);
      pq.push(5);
      const other = new BoundedPriorityQueue<number>(5);
      other.push(2);
      other.push(4);
      pq.merge(other);
      expect(other.isEmpty).toBe(true);
      expect(pq.size).toBe(4);
      expect(pq.toArray()).toEqual([1, 2, 4, 5]);
    });

    it('should respect capacity', () => {
      const queue1 = new BoundedPriorityQueue<number>(3);
      const queue2 = new BoundedPriorityQueue<number>(3);
      queue1.push(1);
      queue1.push(5);
      queue2.push(2);
      queue2.push(3);
      queue2.push(4);
      queue1.merge(queue2);
      expect(queue1.size).toBe(3);
      expect(queue1.toArray()).toEqual([3, 4, 5]);
    });

    it('should handle merging empty queue', () => {
      pq.push(1);
      pq.push(2);
      const other = new BoundedPriorityQueue<number>(5);
      pq.merge(other);
      expect(pq.size).toBe(2);
      expect(pq.toArray()).toEqual([1, 2]);
    });

    it('should handle merging into empty queue', () => {
      const other = new BoundedPriorityQueue<number>(5);
      other.push(1);
      other.push(2);
      other.push(3);
      pq.merge(other);
      expect(pq.size).toBe(3);
      expect(other.isEmpty).toBe(true);
    });

    it('should handle self-merge', () => {
      pq.push(1);
      pq.push(2);
      pq.push(3);
      const sizeBefore = pq.size;
      pq.merge(pq);
      expect(pq.size).toBe(sizeBefore);
      expect(pq.toArray()).toEqual([1, 2, 3]);
    });
  });

  describe('iterator', () => {
    it('should iterate in sorted order', () => {
      pq.push(5);
      pq.push(3);
      pq.push(7);
      pq.push(1);
      const result = [];
      for (const item of pq) {
        result.push(item);
      }
      expect(result).toEqual([1, 3, 5, 7]);
    });

    it('should iterate empty queue', () => {
      const result = [];
      for (const item of pq) {
        result.push(item);
      }
      expect(result).toEqual([]);
    });

    it('should iterate all elements', () => {
      const values = [5, 3, 7, 1, 9];
      values.forEach(v => pq.push(v));
      const result = [];
      for (const item of pq) {
        result.push(item);
      }
      expect(result).toEqual([1, 3, 5, 7, 9]);
    });

    it('should work with for...of', () => {
      pq.push(3);
      pq.push(1);
      pq.push(2);
      let count = 0;
      for (const item of pq) {
        expect(item).toBeDefined();
        count++;
      }
      expect(count).toBe(3);
    });

    it('should work with spread', () => {
      pq.push(3);
      pq.push(1);
      pq.push(2);
      const arr = [...pq];
      expect(arr).toEqual([1, 2, 3]);
    });
  });

  describe('string values', () => {
    it('should work with strings', () => {
      const queue = new BoundedPriorityQueue<string>(5);
      queue.push('zebra');
      queue.push('apple');
      queue.push('banana');
      expect(queue.peek()).toBe('apple');
      expect(queue.pop()).toBe('apple');
      expect(queue.pop()).toBe('banana');
      expect(queue.pop()).toBe('zebra');
    });
  });

  describe('custom comparator', () => {
    it('should work with reverse comparator', () => {
      const queue = new BoundedPriorityQueue<number>(5, { comparator: (a, b) => b - a });
      queue.push(5);
      queue.push(3);
      queue.push(7);
      expect(queue.peek()).toBe(7);
      expect(queue.pop()).toBe(7);
      expect(queue.pop()).toBe(5);
      expect(queue.pop()).toBe(3);
    });

    it('should work with custom object comparator', () => {
      interface Item {
        value: number;
        name: string;
      }
      const queue = new BoundedPriorityQueue<Item>(5, {
        comparator: (a, b) => a.value - b.value
      });
      queue.push({ value: 5, name: 'five' });
      queue.push({ value: 3, name: 'three' });
      queue.push({ value: 7, name: 'seven' });
      expect(queue.pop().value).toBe(3);
      expect(queue.pop().value).toBe(5);
      expect(queue.pop().value).toBe(7);
    });
  });

  describe('bounded behavior', () => {
    it('should only keep top capacity elements', () => {
      const queue = new BoundedPriorityQueue<number>(3);
      queue.push(10);
      queue.push(5);
      queue.push(15);
      queue.push(3);
      queue.push(20);
      expect(queue.size).toBe(3);
      expect(queue.toArray()).toEqual([10, 15, 20]);
    });

    it('should evict smallest when full', () => {
      const queue = new BoundedPriorityQueue<number>(3);
      queue.push(5);
      queue.push(10);
      queue.push(15);
      queue.push(20);
      expect(queue.size).toBe(3);
      expect(queue.contains(5)).toBe(false);
      expect(queue.contains(10)).toBe(true);
      expect(queue.contains(15)).toBe(true);
      expect(queue.contains(20)).toBe(true);
    });
  });

  describe('large datasets', () => {
    it('should handle large number of elements', () => {
      const queue = new BoundedPriorityQueue<number>(10);
      const values = Array.from({ length: 100 }, (_, i) => i);
      values.forEach(v => queue.push(v));
      expect(queue.size).toBe(10);
      expect(queue.toArray()).toEqual([90, 91, 92, 93, 94, 95, 96, 97, 98, 99]);
    });

    it('should maintain performance with capacity', () => {
      const queue = new BoundedPriorityQueue<number>(100);
      for (let i = 0; i < 1000; i++) {
        queue.push(i);
      }
      expect(queue.size).toBe(100);
      expect(queue.toArray()).toEqual(Array.from({ length: 100 }, (_, i) => i + 900));
    });
  });

  describe('edge cases', () => {
    it('should handle capacity of 1', () => {
      const queue = new BoundedPriorityQueue<number>(1);
      expect(queue.push(5)).toBeUndefined();
      expect(queue.push(3)).toBe(3);
      expect(queue.push(7)).toBe(5);
      expect(queue.size).toBe(1);
      expect(queue.pop()).toBe(7);
    });

    it.skip('should handle capacity of 1 with reverse comparator', () => {
      const queue = new BoundedPriorityQueue<number>(1, { comparator: (a, b) => b - a });
      expect(queue.push(5)).toBeUndefined();
      expect(queue.push(3)).toBe(3);
      expect(queue.push(7)).toBe(5);
      expect(queue.size).toBe(1);
      expect(queue.pop()).toBe(7);
    });

    it('should handle same value inserts', () => {
      pq.push(5);
      pq.push(5);
      pq.push(5);
      pq.push(5);
      pq.push(5);
      expect(pq.size).toBe(5);
      expect(pq.toArray()).toEqual([5, 5, 5, 5, 5]);
    });
  });
});
