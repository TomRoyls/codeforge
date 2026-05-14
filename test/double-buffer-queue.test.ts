import { describe, it, expect, beforeEach } from 'vitest';
import { DoubleBufferQueue } from '../src/core/double-buffer-queue/index.js';

describe('DoubleBufferQueue', () => {
  let queue: DoubleBufferQueue<number>;

  beforeEach(() => {
    queue = new DoubleBufferQueue<number>();
  });

  describe('constructor', () => {
    it('should create queue with default infinite capacity', () => {
      expect(queue.size()).toBe(0);
      expect(queue.isEmpty()).toBe(true);
      expect(queue.isFull()).toBe(false);
    });

    it('should create queue with specified capacity', () => {
      const boundedQueue = new DoubleBufferQueue<number>({ capacity: 3 });
      expect(boundedQueue.size()).toBe(0);
      expect(boundedQueue.isEmpty()).toBe(true);
      expect(boundedQueue.isFull()).toBe(false);
    });

    it('should treat zero capacity as always full', () => {
      const zeroCapQueue = new DoubleBufferQueue<number>({ capacity: 0 });
      expect(zeroCapQueue.size()).toBe(0);
      expect(zeroCapQueue.isFull()).toBe(true);
      expect(() => zeroCapQueue.enqueue(1)).toThrow('Queue is full');
    });
  });

  describe('enqueue', () => {
    it('should enqueue values', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.size()).toBe(3);
      expect(queue.toArray()).toEqual([1, 2, 3]);
    });

    it('should throw when queue is full', () => {
      const boundedQueue = new DoubleBufferQueue<number>({ capacity: 2 });
      boundedQueue.enqueue(1);
      boundedQueue.enqueue(2);
      expect(() => boundedQueue.enqueue(3)).toThrow('Queue is full');
      expect(() => boundedQueue.enqueue(3)).toThrow(Error);
    });

    it('should allow enqueue after dequeue', () => {
      const boundedQueue = new DoubleBufferQueue<number>({ capacity: 2 });
      boundedQueue.enqueue(1);
      boundedQueue.enqueue(2);
      boundedQueue.dequeue();
      expect(() => boundedQueue.enqueue(3)).not.toThrow();
      expect(boundedQueue.size()).toBe(2);
    });

    it('should enqueue different types', () => {
      const strQueue = new DoubleBufferQueue<string>();
      strQueue.enqueue('a');
      strQueue.enqueue('b');
      expect(strQueue.toArray()).toEqual(['a', 'b']);

      const objQueue = new DoubleBufferQueue<{ id: number }>();
      objQueue.enqueue({ id: 1 });
      objQueue.enqueue({ id: 2 });
      expect(objQueue.toArray()).toEqual([{ id: 1 }, { id: 2 }]);
    });
  });

  describe('dequeue', () => {
    it('should dequeue values in FIFO order', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.dequeue()).toBe(1);
      expect(queue.dequeue()).toBe(2);
      expect(queue.dequeue()).toBe(3);
    });

    it('should return undefined for empty queue', () => {
      expect(queue.dequeue()).toBe(undefined);
    });

    it('should update size after dequeue', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.size()).toBe(3);
      queue.dequeue();
      expect(queue.size()).toBe(2);
      queue.dequeue();
      queue.dequeue();
      expect(queue.size()).toBe(0);
    });

    it('should return undefined after all elements dequeued', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.dequeue();
      queue.dequeue();
      expect(queue.dequeue()).toBe(undefined);
    });

    it('should handle enqueue-dequeue pattern', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      expect(queue.dequeue()).toBe(1);
      queue.enqueue(3);
      queue.enqueue(4);
      expect(queue.dequeue()).toBe(2);
      expect(queue.dequeue()).toBe(3);
      expect(queue.dequeue()).toBe(4);
    });
  });

  describe('peek', () => {
    it('should return front element without removing', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.peek()).toBe(1);
      expect(queue.size()).toBe(3);
    });

    it('should return undefined for empty queue', () => {
      expect(queue.peek()).toBe(undefined);
    });

    it('should return updated front after dequeue', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.peek()).toBe(1);
      queue.dequeue();
      expect(queue.peek()).toBe(2);
      queue.dequeue();
      expect(queue.peek()).toBe(3);
    });

    it('should not modify queue', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.peek();
      expect(queue.size()).toBe(2);
      expect(queue.toArray()).toEqual([1, 2]);
    });

    it('should peek after buffer swap', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.dequeue();
      queue.enqueue(3);
      queue.enqueue(4);
      expect(queue.peek()).toBe(2);
    });
  });

  describe('size', () => {
    it('should return 0 for empty queue', () => {
      expect(queue.size()).toBe(0);
    });

    it('should track size correctly', () => {
      expect(queue.size()).toBe(0);
      queue.enqueue(1);
      expect(queue.size()).toBe(1);
      queue.enqueue(2);
      expect(queue.size()).toBe(2);
      queue.enqueue(3);
      expect(queue.size()).toBe(3);
    });

    it('should decrease on dequeue', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.size()).toBe(3);
      queue.dequeue();
      expect(queue.size()).toBe(2);
      queue.dequeue();
      expect(queue.size()).toBe(1);
    });

    it('should return 0 after clear', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      expect(queue.size()).toBe(2);
      queue.clear();
      expect(queue.size()).toBe(0);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty queue', () => {
      expect(queue.isEmpty()).toBe(true);
    });

    it('should return false for non-empty queue', () => {
      queue.enqueue(1);
      expect(queue.isEmpty()).toBe(false);
    });

    it('should return true after all elements dequeued', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.dequeue();
      queue.dequeue();
      expect(queue.isEmpty()).toBe(true);
    });

    it('should return true after clear', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.clear();
      expect(queue.isEmpty()).toBe(true);
    });
  });

  describe('isFull', () => {
    it('should return false for unlimited capacity queue', () => {
      for (let i = 0; i < 100; i++) {
        queue.enqueue(i);
      }
      expect(queue.isFull()).toBe(false);
    });

    it('should return false when not at capacity', () => {
      const boundedQueue = new DoubleBufferQueue<number>({ capacity: 5 });
      boundedQueue.enqueue(1);
      boundedQueue.enqueue(2);
      expect(boundedQueue.isFull()).toBe(false);
    });

    it('should return true when at capacity', () => {
      const boundedQueue = new DoubleBufferQueue<number>({ capacity: 3 });
      boundedQueue.enqueue(1);
      boundedQueue.enqueue(2);
      boundedQueue.enqueue(3);
      expect(boundedQueue.isFull()).toBe(true);
    });

    it('should return false after dequeue', () => {
      const boundedQueue = new DoubleBufferQueue<number>({ capacity: 2 });
      boundedQueue.enqueue(1);
      boundedQueue.enqueue(2);
      expect(boundedQueue.isFull()).toBe(true);
      boundedQueue.dequeue();
      expect(boundedQueue.isFull()).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all elements', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.clear();
      expect(queue.size()).toBe(0);
      expect(queue.isEmpty()).toBe(true);
      expect(queue.peek()).toBe(undefined);
      expect(queue.back()).toBe(undefined);
      expect(queue.toArray()).toEqual([]);
    });

    it('should be idempotent', () => {
      queue.enqueue(1);
      queue.clear();
      queue.clear();
      expect(queue.size()).toBe(0);
      expect(queue.isEmpty()).toBe(true);
    });

    it('should allow reuse after clear', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.clear();
      queue.enqueue(10);
      queue.enqueue(20);
      expect(queue.toArray()).toEqual([10, 20]);
      expect(queue.size()).toBe(2);
    });
  });

  describe('toArray', () => {
    it('should convert queue to array', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.toArray()).toEqual([1, 2, 3]);
    });

    it('should return empty array for empty queue', () => {
      expect(queue.toArray()).toEqual([]);
    });

    it('should return array instance', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      const arr = queue.toArray();
      expect(Array.isArray(arr)).toBe(true);
    });

    it('should maintain order', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.dequeue();
      queue.enqueue(4);
      expect(queue.toArray()).toEqual([2, 3, 4]);
    });

    it('should work with different types', () => {
      const strQueue = new DoubleBufferQueue<string>();
      strQueue.enqueue('a');
      strQueue.enqueue('b');
      strQueue.enqueue('c');
      expect(strQueue.toArray()).toEqual(['a', 'b', 'c']);
    });
  });

  describe('forEach', () => {
    it('should iterate over all elements', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      const result: number[] = [];
      queue.forEach((value, index) => {
        result.push(value);
        expect(index).toBe(value - 1);
      });
      expect(result).toEqual([1, 2, 3]);
    });

    it('should not iterate over empty queue', () => {
      let count = 0;
      queue.forEach(() => {
        count++;
      });
      expect(count).toBe(0);
    });

    it('should maintain order', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.dequeue();
      queue.enqueue(4);
      const result: number[] = [];
      queue.forEach((value) => result.push(value));
      expect(result).toEqual([2, 3, 4]);
    });

    it('should work with strings', () => {
      const strQueue = new DoubleBufferQueue<string>();
      strQueue.enqueue('a');
      strQueue.enqueue('b');
      strQueue.enqueue('c');
      const result: string[] = [];
      strQueue.forEach((value) => result.push(value));
      expect(result).toEqual(['a', 'b', 'c']);
    });
  });

  describe('front', () => {
    it('should return front element', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.front()).toBe(1);
    });

    it('should return undefined for empty queue', () => {
      expect(queue.front()).toBe(undefined);
    });

    it('should not remove element', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      expect(queue.front()).toBe(1);
      expect(queue.size()).toBe(2);
    });

    it('should update after dequeue', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.front()).toBe(1);
      queue.dequeue();
      expect(queue.front()).toBe(2);
    });

    it('should work after buffer swap', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.dequeue();
      queue.enqueue(3);
      queue.enqueue(4);
      expect(queue.front()).toBe(2);
    });
  });

  describe('back', () => {
    it('should return back element from back buffer', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.back()).toBe(3);
    });

    it('should return undefined for empty queue', () => {
      expect(queue.back()).toBe(undefined);
    });

    it('should not remove element', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      expect(queue.back()).toBe(2);
      expect(queue.size()).toBe(2);
    });

    it('should return back element from front buffer when back buffer empty', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.dequeue();
      queue.dequeue();
      expect(queue.back()).toBe(3);
    });

    it('should update after enqueue', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      expect(queue.back()).toBe(2);
      queue.enqueue(3);
      expect(queue.back()).toBe(3);
    });
  });

  describe('mixed operations', () => {
    it('should handle enqueue-dequeue pattern', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      expect(queue.dequeue()).toBe(1);
      queue.enqueue(3);
      expect(queue.dequeue()).toBe(2);
      queue.enqueue(4);
      expect(queue.dequeue()).toBe(3);
      expect(queue.dequeue()).toBe(4);
    });

    it('should handle multiple enqueues and dequeues', () => {
      for (let i = 0; i < 100; i++) {
        queue.enqueue(i);
      }
      for (let i = 0; i < 50; i++) {
        expect(queue.dequeue()).toBe(i);
      }
      for (let i = 100; i < 150; i++) {
        queue.enqueue(i);
      }
      expect(queue.size()).toBe(100);
    });

    it('should maintain order through buffer swaps', () => {
      for (let i = 1; i <= 20; i++) {
        queue.enqueue(i);
      }
      for (let i = 1; i <= 10; i++) {
        expect(queue.dequeue()).toBe(i);
      }
      for (let i = 21; i <= 30; i++) {
        queue.enqueue(i);
      }
      const expected = [];
      for (let i = 11; i <= 30; i++) {
        expected.push(i);
      }
      expect(queue.toArray()).toEqual(expected);
    });
  });

  describe('edge cases', () => {
    it('should handle single element', () => {
      queue.enqueue(42);
      expect(queue.size()).toBe(1);
      expect(queue.front()).toBe(42);
      expect(queue.back()).toBe(42);
      expect(queue.peek()).toBe(42);
      expect(queue.dequeue()).toBe(42);
      expect(queue.isEmpty()).toBe(true);
    });

    it('should handle large number of operations', () => {
      for (let i = 0; i < 1000; i++) {
        queue.enqueue(i);
      }
      expect(queue.size()).toBe(1000);
      for (let i = 0; i < 1000; i++) {
        expect(queue.dequeue()).toBe(i);
      }
      expect(queue.isEmpty()).toBe(true);
    });

    it('should handle strings', () => {
      const strQueue = new DoubleBufferQueue<string>();
      strQueue.enqueue('a');
      strQueue.enqueue('b');
      strQueue.enqueue('c');
      expect(strQueue.toArray()).toEqual(['a', 'b', 'c']);
      expect(strQueue.front()).toBe('a');
      expect(strQueue.back()).toBe('c');
      expect(strQueue.dequeue()).toBe('a');
      expect(strQueue.peek()).toBe('b');
    });

    it('should handle objects', () => {
      const objQueue = new DoubleBufferQueue<{ id: number; name: string }>();
      objQueue.enqueue({ id: 1, name: 'one' });
      objQueue.enqueue({ id: 2, name: 'two' });
      expect(objQueue.front()).toEqual({ id: 1, name: 'one' });
      expect(objQueue.back()).toEqual({ id: 2, name: 'two' });
      expect(objQueue.dequeue()).toEqual({ id: 1, name: 'one' });
    });

    it('should handle null and undefined values', () => {
      const mixedQueue = new DoubleBufferQueue<number | null | undefined>();
      mixedQueue.enqueue(1);
      mixedQueue.enqueue(null);
      mixedQueue.enqueue(undefined);
      mixedQueue.enqueue(2);
      expect(mixedQueue.toArray()).toEqual([1, null, undefined, 2]);
      expect(mixedQueue.dequeue()).toBe(1);
      expect(mixedQueue.dequeue()).toBe(null);
      expect(mixedQueue.dequeue()).toBe(undefined);
    });
  });

  describe('bounded queue behavior', () => {
    it('should respect capacity limit', () => {
      const boundedQueue = new DoubleBufferQueue<number>({ capacity: 5 });
      boundedQueue.enqueue(1);
      boundedQueue.enqueue(2);
      boundedQueue.enqueue(3);
      boundedQueue.enqueue(4);
      boundedQueue.enqueue(5);
      expect(boundedQueue.isFull()).toBe(true);
      expect(() => boundedQueue.enqueue(6)).toThrow('Queue is full');
    });

    it('should allow enqueue after dequeue when full', () => {
      const boundedQueue = new DoubleBufferQueue<number>({ capacity: 3 });
      boundedQueue.enqueue(1);
      boundedQueue.enqueue(2);
      boundedQueue.enqueue(3);
      expect(boundedQueue.isFull()).toBe(true);
      boundedQueue.dequeue();
      expect(boundedQueue.isFull()).toBe(false);
      boundedQueue.enqueue(4);
      expect(boundedQueue.toArray()).toEqual([2, 3, 4]);
    });

    it('should maintain size within capacity', () => {
      const boundedQueue = new DoubleBufferQueue<number>({ capacity: 3 });
      boundedQueue.enqueue(1);
      boundedQueue.enqueue(2);
      boundedQueue.enqueue(3);
      expect(boundedQueue.isFull()).toBe(true);
      expect(boundedQueue.size()).toBe(3);
      boundedQueue.dequeue();
      expect(boundedQueue.isFull()).toBe(false);
      boundedQueue.enqueue(4);
      expect(boundedQueue.size()).toBe(3);
      expect(boundedQueue.isFull()).toBe(true);
    });
  });
});
