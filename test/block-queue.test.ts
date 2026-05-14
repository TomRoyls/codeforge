import { describe, it, expect, beforeEach } from 'vitest';
import { BlockQueue } from '../src/core/block-queue/index.js';

describe('BlockQueue', () => {
  let queue: BlockQueue<number>;

  beforeEach(() => {
    queue = new BlockQueue<number>(3);
  });

  describe('constructor', () => {
    it('should create queue with given blockSize', () => {
      const q = new BlockQueue<number>(5);
      expect(q.size).toBe(0);
      expect(q.isEmpty()).toBe(true);
      expect(q.isFull()).toBe(false);
    });

    it('should create queue with capacity', () => {
      const q = new BlockQueue<number>(3, { capacity: 10 });
      expect(q.remainingCapacity()).toBe(10);
    });

    it('should throw RangeError for blockSize less than 1', () => {
      expect(() => new BlockQueue<number>(0)).toThrow('blockSize must be at least 1');
      expect(() => new BlockQueue<number>(-1)).toThrow('blockSize must be at least 1');
    });

    it('should throw RangeError for capacity less than 1', () => {
      expect(() => new BlockQueue<number>(3, { capacity: 0 })).toThrow('capacity must be at least 1');
      expect(() => new BlockQueue<number>(3, { capacity: -1 })).toThrow('capacity must be at least 1');
    });

    it('should allow undefined capacity', () => {
      const q = new BlockQueue<number>(3, { capacity: undefined });
      expect(q.remainingCapacity()).toBe(Infinity);
      expect(q.isFull()).toBe(false);
    });
  });

  describe('size', () => {
    it('should be 0 for new queue', () => {
      expect(queue.size).toBe(0);
    });

    it('should increase with enqueue', () => {
      queue.enqueue(1);
      expect(queue.size).toBe(1);
      queue.enqueue(2);
      expect(queue.size).toBe(2);
    });

    it('should decrease with dequeueBlock', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.dequeueBlock();
      expect(queue.size).toBe(0);
    });
  });

  describe('isEmpty', () => {
    it('should be true for new queue', () => {
      expect(queue.isEmpty()).toBe(true);
    });

    it('should be false after enqueue', () => {
      queue.enqueue(1);
      expect(queue.isEmpty()).toBe(false);
    });

    it('should be true after dequeue', () => {
      queue.enqueue(1);
      queue.dequeueBlock();
      expect(queue.isEmpty()).toBe(true);
    });

    it('should be true after clear', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.clear();
      expect(queue.isEmpty()).toBe(true);
    });
  });

  describe('isFull', () => {
    it('should be false when capacity is undefined', () => {
      const q = new BlockQueue<number>(3);
      q.enqueue(1);
      q.enqueue(2);
      q.enqueue(3);
      expect(q.isFull()).toBe(false);
    });

    it('should be false when under capacity', () => {
      const q = new BlockQueue<number>(3, { capacity: 5 });
      q.enqueue(1);
      q.enqueue(2);
      expect(q.isFull()).toBe(false);
    });

    it('should be true at capacity', () => {
      const q = new BlockQueue<number>(3, { capacity: 3 });
      q.enqueue(1);
      q.enqueue(2);
      q.enqueue(3);
      expect(q.isFull()).toBe(true);
    });

    it('should be false after dequeue', () => {
      const q = new BlockQueue<number>(3, { capacity: 3 });
      q.enqueue(1);
      q.enqueue(2);
      q.enqueue(3);
      q.dequeueBlock();
      expect(q.isFull()).toBe(false);
    });
  });

  describe('enqueue', () => {
    it('should add element to queue', () => {
      queue.enqueue(1);
      expect(queue.size).toBe(1);
      expect(queue.peek()).toBe(1);
    });

    it('should add multiple elements', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.size).toBe(3);
      expect(queue.toArray()).toEqual([1, 2, 3]);
    });

    it('should throw RangeError when at capacity', () => {
      const q = new BlockQueue<number>(3, { capacity: 2 });
      q.enqueue(1);
      q.enqueue(2);
      expect(() => q.enqueue(3)).toThrow('queue is full');
    });

    it('should allow unlimited enqueue when no capacity', () => {
      const q = new BlockQueue<number>(3);
      q.enqueue(1);
      q.enqueue(2);
      q.enqueue(3);
      q.enqueue(4);
      q.enqueue(5);
      expect(q.size).toBe(5);
    });
  });

  describe('dequeueBlock', () => {
    it('should return empty array when queue is empty', () => {
      expect(queue.dequeueBlock()).toEqual([]);
    });

    it('should dequeue up to blockSize elements', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      const result = queue.dequeueBlock();
      expect(result).toEqual([1, 2, 3]);
      expect(queue.size).toBe(0);
    });

    it('should dequeue remaining elements if less than blockSize', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      const result = queue.dequeueBlock();
      expect(result).toEqual([1, 2]);
      expect(queue.size).toBe(0);
    });

    it('should maintain order across multiple dequeues', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.enqueue(4);
      queue.enqueue(5);
      expect(queue.dequeueBlock()).toEqual([1, 2, 3]);
      expect(queue.dequeueBlock()).toEqual([4, 5]);
      expect(queue.dequeueBlock()).toEqual([]);
    });

    it('should dequeue partial block', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.enqueue(4);
      const result = queue.dequeueBlock();
      expect(result).toEqual([1, 2, 3]);
      expect(queue.size).toBe(1);
    });
  });

  describe('peek', () => {
    it('should return undefined for empty queue', () => {
      expect(queue.peek()).toBe(undefined);
    });

    it('should return first element without removing', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      expect(queue.peek()).toBe(1);
      expect(queue.size).toBe(2);
    });

    it('should return first element after partial dequeue', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.enqueue(4);
      queue.dequeueBlock();
      expect(queue.peek()).toBe(4);
    });
  });

  describe('peekBlock', () => {
    it('should return empty array for empty queue', () => {
      expect(queue.peekBlock()).toEqual([]);
    });

    it('should return up to blockSize elements without removing', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      const result = queue.peekBlock();
      expect(result).toEqual([1, 2, 3]);
      expect(queue.size).toBe(3);
    });

    it('should return remaining elements if less than blockSize', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      const result = queue.peekBlock();
      expect(result).toEqual([1, 2]);
      expect(queue.size).toBe(2);
    });

    it('should not modify queue', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.peekBlock();
      expect(queue.toArray()).toEqual([1, 2, 3]);
    });
  });

  describe('clear', () => {
    it('should remove all elements', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.clear();
      expect(queue.size).toBe(0);
      expect(queue.isEmpty()).toBe(true);
    });

    it('should work on empty queue', () => {
      queue.clear();
      expect(queue.size).toBe(0);
    });

    it('should allow operations after clear', () => {
      queue.enqueue(1);
      queue.clear();
      queue.enqueue(2);
      expect(queue.size).toBe(1);
      expect(queue.peek()).toBe(2);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty queue', () => {
      expect(queue.toArray()).toEqual([]);
    });

    it('should return all elements in order', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.toArray()).toEqual([1, 2, 3]);
    });

    it('should not modify queue', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      const arr = queue.toArray();
      arr.push(3);
      expect(queue.toArray()).toEqual([1, 2]);
    });
  });

  describe('blockCount', () => {
    it('should return 0 for empty queue', () => {
      expect(queue.blockCount()).toBe(0);
    });

    it('should return ceil(size / blockSize)', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      expect(queue.blockCount()).toBe(1);
      queue.enqueue(3);
      expect(queue.blockCount()).toBe(1);
      queue.enqueue(4);
      expect(queue.blockCount()).toBe(2);
    });

    it('should handle exact multiple of blockSize', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.blockCount()).toBe(1);
    });
  });

  describe('currentBlockSize', () => {
    it('should return 0 for empty queue', () => {
      expect(queue.currentBlockSize()).toBe(0);
    });

    it('should return full blockSize for complete block', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.currentBlockSize()).toBe(3);
    });

    it('should return remainder for partial block', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      expect(queue.currentBlockSize()).toBe(2);
    });

    it('should handle single element', () => {
      queue.enqueue(1);
      expect(queue.currentBlockSize()).toBe(1);
    });

    it('should handle multiple blocks', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.enqueue(4);
      queue.enqueue(5);
      expect(queue.currentBlockSize()).toBe(2);
    });
  });

  describe('remainingCapacity', () => {
    it('should return Infinity when no capacity set', () => {
      expect(queue.remainingCapacity()).toBe(Infinity);
    });

    it('should return capacity - size', () => {
      const q = new BlockQueue<number>(3, { capacity: 10 });
      expect(q.remainingCapacity()).toBe(10);
      q.enqueue(1);
      q.enqueue(2);
      expect(q.remainingCapacity()).toBe(8);
    });

    it('should return 0 when full', () => {
      const q = new BlockQueue<number>(3, { capacity: 3 });
      q.enqueue(1);
      q.enqueue(2);
      q.enqueue(3);
      expect(q.remainingCapacity()).toBe(0);
    });

    it('should not go negative', () => {
      const q = new BlockQueue<number>(3, { capacity: 2 });
      q.enqueue(1);
      q.enqueue(2);
      expect(q.remainingCapacity()).toBe(0);
    });
  });

  describe('iterator', () => {
    it('should iterate over empty queue', () => {
      const result: number[] = [];
      for (const item of queue) {
        result.push(item);
      }
      expect(result).toEqual([]);
    });

    it('should iterate over all elements', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      const result: number[] = [];
      for (const item of queue) {
        result.push(item);
      }
      expect(result).toEqual([1, 2, 3]);
    });

    it('should support spread operator', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      const arr = [...queue];
      expect(arr).toEqual([1, 2, 3]);
    });

    it('should work with Array.from', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      const arr = Array.from(queue);
      expect(arr).toEqual([1, 2, 3]);
    });

    it('should not modify queue', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      for (const _ of queue) {
        break;
      }
      expect(queue.toArray()).toEqual([1, 2]);
    });
  });

  describe('static from', () => {
    it('should create queue from array', () => {
      const q = BlockQueue.from([1, 2, 3], 3);
      expect(q.size).toBe(3);
      expect(q.toArray()).toEqual([1, 2, 3]);
    });

    it('should create queue with capacity', () => {
      const q = BlockQueue.from([1, 2, 3], 3, { capacity: 5 });
      expect(q.size).toBe(3);
      expect(q.remainingCapacity()).toBe(2);
    });

    it('should handle empty array', () => {
      const q = BlockQueue.from([], 3);
      expect(q.size).toBe(0);
      expect(q.isEmpty()).toBe(true);
    });

    it('should throw if array exceeds capacity', () => {
      expect(() => BlockQueue.from([1, 2, 3, 4, 5], 3, { capacity: 3 })).toThrow('queue is full');
    });

    it('should create queue for different types', () => {
      const q = BlockQueue.from(['a', 'b', 'c'], 2);
      expect(q.toArray()).toEqual(['a', 'b', 'c']);
    });
  });

  describe('block operations', () => {
    it('should handle multiple dequeueBlocks', () => {
      const q = new BlockQueue<number>(2);
      q.enqueue(1);
      q.enqueue(2);
      q.enqueue(3);
      q.enqueue(4);
      q.enqueue(5);
      expect(q.dequeueBlock()).toEqual([1, 2]);
      expect(q.dequeueBlock()).toEqual([3, 4]);
      expect(q.dequeueBlock()).toEqual([5]);
      expect(q.dequeueBlock()).toEqual([]);
    });

    it('should interleave enqueue and dequeueBlock', () => {
      const q = new BlockQueue<number>(2);
      q.enqueue(1);
      q.enqueue(2);
      q.dequeueBlock();
      q.enqueue(3);
      q.enqueue(4);
      expect(q.toArray()).toEqual([3, 4]);
      expect(q.dequeueBlock()).toEqual([3, 4]);
    });
  });

  describe('capacity edge cases', () => {
    it('should handle capacity equal to blockSize', () => {
      const q = new BlockQueue<number>(3, { capacity: 3 });
      q.enqueue(1);
      q.enqueue(2);
      q.enqueue(3);
      expect(q.isFull()).toBe(true);
      expect(() => q.enqueue(4)).toThrow('queue is full');
    });

    it('should handle capacity not divisible by blockSize', () => {
      const q = new BlockQueue<number>(3, { capacity: 10 });
      for (let i = 0; i < 10; i++) {
        q.enqueue(i);
      }
      expect(q.isFull()).toBe(true);
      expect(() => q.enqueue(10)).toThrow('queue is full');
    });
  });

  describe('large datasets', () => {
    it('should handle many elements', () => {
      const q = new BlockQueue<number>(100);
      for (let i = 0; i < 1000; i++) {
        q.enqueue(i);
      }
      expect(q.size).toBe(1000);
      expect(q.blockCount()).toBe(10);
    });

    it('should handle large blocks', () => {
      const q = new BlockQueue<number>(50);
      for (let i = 0; i < 100; i++) {
        q.enqueue(i);
      }
      const block = q.dequeueBlock();
      expect(block.length).toBe(50);
      expect(q.size).toBe(50);
    });
  });

  describe('type safety', () => {
    it('should work with strings', () => {
      const q = new BlockQueue<string>(2);
      q.enqueue('hello');
      q.enqueue('world');
      expect(q.toArray()).toEqual(['hello', 'world']);
    });

    it('should work with objects', () => {
      const q = new BlockQueue<{ id: number }>(2);
      q.enqueue({ id: 1 });
      q.enqueue({ id: 2 });
      expect(q.toArray()).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it('should work with mixed types via union', () => {
      const q = new BlockQueue<number | string>(2);
      q.enqueue(1);
      q.enqueue('hello');
      expect(q.toArray()).toEqual([1, 'hello']);
    });
  });

  describe('blockSize variants', () => {
    it('should handle blockSize of 1', () => {
      const q = new BlockQueue<number>(1);
      q.enqueue(1);
      q.enqueue(2);
      q.enqueue(3);
      expect(q.dequeueBlock()).toEqual([1]);
      expect(q.dequeueBlock()).toEqual([2]);
      expect(q.dequeueBlock()).toEqual([3]);
    });

    it('should handle large blockSize', () => {
      const q = new BlockQueue<number>(10);
      for (let i = 0; i < 25; i++) {
        q.enqueue(i);
      }
      expect(q.blockCount()).toBe(3);
      expect(q.currentBlockSize()).toBe(5);
    });
  });
});
