import { describe, it, expect } from 'vitest';
import { ConcurrentQueue } from '../src/core/concurrent-queue-2/index.js';

describe('ConcurrentQueue', () => {
  describe('constructor', () => {
    it('should create queue without options', () => {
      const queue = new ConcurrentQueue<number>();
      expect(queue.size).toBe(0);
      expect(queue.isEmpty).toBe(true);
      expect(queue.capacity).toBe(undefined);
      expect(queue.isClosed).toBe(false);
    });

    it('should create queue with capacity', () => {
      const queue = new ConcurrentQueue<number>({ capacity: 5 });
      expect(queue.capacity).toBe(5);
      expect(queue.size).toBe(0);
    });

    it('should be open initially', () => {
      const queue = new ConcurrentQueue<number>();
      expect(queue.isClosed).toBe(false);
    });

    it('should not be full when capacity is undefined', () => {
      const queue = new ConcurrentQueue<number>();
      expect(queue.isFull).toBe(false);
      expect(queue.remainingCapacity).toBe(undefined);
    });

    it('should not be full when capacity is set but queue is empty', () => {
      const queue = new ConcurrentQueue<number>({ capacity: 3 });
      expect(queue.isFull).toBe(false);
      expect(queue.remainingCapacity).toBe(3);
    });

    it('should have zero remaining capacity when full', () => {
      const queue = new ConcurrentQueue<number>({ capacity: 2 });
      queue.enqueue(1);
      queue.enqueue(2);
      expect(queue.remainingCapacity).toBe(0);
    });
  });

  describe('enqueue', () => {
    it('should enqueue single element', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      expect(queue.size).toBe(1);
      expect(queue.isEmpty).toBe(false);
    });

    it('should enqueue multiple elements', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.size).toBe(3);
      expect(queue.toArray()).toEqual([1, 2, 3]);
    });

    it('should throw error when queue is closed', () => {
      const queue = new ConcurrentQueue<number>();
      queue.close();
      expect(() => queue.enqueue(1)).toThrow('Queue is closed');
    });

    it('should throw error when queue is full', () => {
      const queue = new ConcurrentQueue<number>({ capacity: 2 });
      queue.enqueue(1);
      queue.enqueue(2);
      expect(() => queue.enqueue(3)).toThrow('Queue is full');
    });

    it('should handle string values', () => {
      const queue = new ConcurrentQueue<string>();
      queue.enqueue('hello');
      queue.enqueue('world');
      expect(queue.size).toBe(2);
      expect(queue.toArray()).toEqual(['hello', 'world']);
    });

    it('should handle object values', () => {
      const queue = new ConcurrentQueue<{ id: number }>();
      queue.enqueue({ id: 1 });
      queue.enqueue({ id: 2 });
      expect(queue.size).toBe(2);
      expect(queue.toArray()).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it('should handle null values', () => {
      const queue = new ConcurrentQueue<number | null>();
      queue.enqueue(null);
      expect(queue.size).toBe(1);
      expect(queue.toArray()).toEqual([null]);
    });

    it('should handle undefined values', () => {
      const queue = new ConcurrentQueue<number | undefined>();
      queue.enqueue(undefined);
      expect(queue.size).toBe(1);
      expect(queue.toArray()).toEqual([undefined]);
    });

    it('should respect capacity limit', () => {
      const queue = new ConcurrentQueue<number>({ capacity: 3 });
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.size).toBe(3);
      expect(queue.isFull).toBe(true);
    });
  });

  describe('dequeue', () => {
    it('should dequeue single element', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      const result = queue.dequeue();
      expect(result).toBe(1);
      expect(queue.size).toBe(1);
    });

    it('should dequeue in FIFO order', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.dequeue()).toBe(1);
      expect(queue.dequeue()).toBe(2);
      expect(queue.dequeue()).toBe(3);
      expect(queue.isEmpty).toBe(true);
    });

    it('should throw error when queue is empty', () => {
      const queue = new ConcurrentQueue<number>();
      expect(() => queue.dequeue()).toThrow('Queue is empty');
    });

    it('should update remaining capacity after dequeue', () => {
      const queue = new ConcurrentQueue<number>({ capacity: 3 });
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.dequeue();
      expect(queue.remainingCapacity).toBe(1);
    });

    it('should handle string values', () => {
      const queue = new ConcurrentQueue<string>();
      queue.enqueue('first');
      queue.enqueue('second');
      expect(queue.dequeue()).toBe('first');
      expect(queue.dequeue()).toBe('second');
    });

    it('should handle object values', () => {
      const queue = new ConcurrentQueue<{ id: number }>();
      queue.enqueue({ id: 1 });
      queue.enqueue({ id: 2 });
      expect(queue.dequeue()).toEqual({ id: 1 });
      expect(queue.dequeue()).toEqual({ id: 2 });
    });

    it('should handle null values', () => {
      const queue = new ConcurrentQueue<number | null>();
      queue.enqueue(null);
      queue.enqueue(1);
      expect(queue.dequeue()).toBe(null);
      expect(queue.dequeue()).toBe(1);
    });
  });

  describe('peek', () => {
    it('should peek at first element without removing', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      const result = queue.peek();
      expect(result).toBe(1);
      expect(queue.size).toBe(3);
    });

    it('should return undefined for empty queue', () => {
      const queue = new ConcurrentQueue<number>();
      expect(queue.peek()).toBe(undefined);
    });

    it('should not remove element', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.peek();
      expect(queue.size).toBe(2);
      expect(queue.peek()).toBe(1);
    });

    it('should handle string values', () => {
      const queue = new ConcurrentQueue<string>();
      queue.enqueue('hello');
      queue.enqueue('world');
      expect(queue.peek()).toBe('hello');
    });

    it('should handle object values', () => {
      const queue = new ConcurrentQueue<{ id: number }>();
      queue.enqueue({ id: 1 });
      queue.enqueue({ id: 2 });
      expect(queue.peek()).toEqual({ id: 1 });
    });

    it('should handle null values', () => {
      const queue = new ConcurrentQueue<number | null>();
      queue.enqueue(null);
      queue.enqueue(1);
      expect(queue.peek()).toBe(null);
    });

    it('should return same element after multiple peeks', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.peek();
      expect(queue.peek()).toBe(1);
      expect(queue.peek()).toBe(1);
    });
  });

  describe('size', () => {
    it('should return 0 for empty queue', () => {
      const queue = new ConcurrentQueue<number>();
      expect(queue.size).toBe(0);
    });

    it('should track size after enqueues', () => {
      const queue = new ConcurrentQueue<number>();
      expect(queue.size).toBe(0);
      queue.enqueue(1);
      expect(queue.size).toBe(1);
      queue.enqueue(2);
      expect(queue.size).toBe(2);
      queue.enqueue(3);
      expect(queue.size).toBe(3);
    });

    it('should track size after dequeues', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.size).toBe(3);
      queue.dequeue();
      expect(queue.size).toBe(2);
      queue.dequeue();
      expect(queue.size).toBe(1);
      queue.dequeue();
      expect(queue.size).toBe(0);
    });

    it('should update correctly with mixed operations', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.dequeue();
      queue.enqueue(3);
      expect(queue.size).toBe(2);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty queue', () => {
      const queue = new ConcurrentQueue<number>();
      expect(queue.isEmpty).toBe(true);
    });

    it('should return false for non-empty queue', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      expect(queue.isEmpty).toBe(false);
    });

    it('should return true after draining all elements', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.dequeue();
      queue.dequeue();
      queue.dequeue();
      expect(queue.isEmpty).toBe(true);
    });

    it('should update correctly after operations', () => {
      const queue = new ConcurrentQueue<number>();
      expect(queue.isEmpty).toBe(true);
      queue.enqueue(1);
      expect(queue.isEmpty).toBe(false);
      queue.dequeue();
      expect(queue.isEmpty).toBe(true);
    });
  });

  describe('capacity', () => {
    it('should return undefined for unlimited queue', () => {
      const queue = new ConcurrentQueue<number>();
      expect(queue.capacity).toBe(undefined);
    });

    it('should return configured capacity', () => {
      const queue = new ConcurrentQueue<number>({ capacity: 5 });
      expect(queue.capacity).toBe(5);
    });

    it('should return same capacity after operations', () => {
      const queue = new ConcurrentQueue<number>({ capacity: 3 });
      queue.enqueue(1);
      queue.enqueue(2);
      queue.dequeue();
      expect(queue.capacity).toBe(3);
    });
  });

  describe('clear', () => {
    it('should clear empty queue', () => {
      const queue = new ConcurrentQueue<number>();
      queue.clear();
      expect(queue.size).toBe(0);
      expect(queue.isEmpty).toBe(true);
    });

    it('should clear partially filled queue', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.clear();
      expect(queue.size).toBe(0);
      expect(queue.isEmpty).toBe(true);
    });

    it('should clear full queue', () => {
      const queue = new ConcurrentQueue<number>({ capacity: 3 });
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.clear();
      expect(queue.size).toBe(0);
      expect(queue.isFull).toBe(false);
    });

    it('should allow enqueue after clear', () => {
      const queue = new ConcurrentQueue<number>({ capacity: 3 });
      queue.enqueue(1);
      queue.enqueue(2);
      queue.clear();
      queue.enqueue(3);
      queue.enqueue(4);
      expect(queue.toArray()).toEqual([3, 4]);
    });

    it('should reset remaining capacity after clear', () => {
      const queue = new ConcurrentQueue<number>({ capacity: 5 });
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.clear();
      expect(queue.remainingCapacity).toBe(5);
    });

    it('should handle string values', () => {
      const queue = new ConcurrentQueue<string>();
      queue.enqueue('a');
      queue.enqueue('b');
      queue.clear();
      expect(queue.size).toBe(0);
      expect(queue.toArray()).toEqual([]);
    });

    it('should handle object values', () => {
      const queue = new ConcurrentQueue<{ id: number }>();
      queue.enqueue({ id: 1 });
      queue.enqueue({ id: 2 });
      queue.clear();
      expect(queue.size).toBe(0);
      expect(queue.toArray()).toEqual([]);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty queue', () => {
      const queue = new ConcurrentQueue<number>();
      expect(queue.toArray()).toEqual([]);
    });

    it('should return all elements in FIFO order', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.toArray()).toEqual([1, 2, 3]);
    });

    it('should not affect queue', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      const arr = queue.toArray();
      expect(queue.size).toBe(2);
      expect(queue.peek()).toBe(1);
    });

    it('should return copy not reference', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      const arr = queue.toArray();
      arr.push(3);
      expect(queue.toArray()).toEqual([1, 2]);
    });

    it('should handle string values', () => {
      const queue = new ConcurrentQueue<string>();
      queue.enqueue('a');
      queue.enqueue('b');
      queue.enqueue('c');
      expect(queue.toArray()).toEqual(['a', 'b', 'c']);
    });

    it('should handle object values', () => {
      const queue = new ConcurrentQueue<{ id: number }>();
      queue.enqueue({ id: 1 });
      queue.enqueue({ id: 2 });
      expect(queue.toArray()).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it('should handle null values', () => {
      const queue = new ConcurrentQueue<number | null>();
      queue.enqueue(null);
      queue.enqueue(1);
      queue.enqueue(null);
      expect(queue.toArray()).toEqual([null, 1, null]);
    });
  });

  describe('forEach', () => {
    it('should not iterate over empty queue', () => {
      const queue = new ConcurrentQueue<number>();
      let count = 0;
      queue.forEach(() => {
        count++;
      });
      expect(count).toBe(0);
    });

    it('should iterate over all elements', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      const result: number[] = [];
      queue.forEach((value) => {
        result.push(value);
      });
      expect(result).toEqual([1, 2, 3]);
    });

    it('should provide correct index', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(10);
      queue.enqueue(20);
      queue.enqueue(30);
      queue.forEach((value, index) => {
        if (index === 0) expect(value).toBe(10);
        if (index === 1) expect(value).toBe(20);
        if (index === 2) expect(value).toBe(30);
      });
    });

    it('should iterate in FIFO order', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      const result: number[] = [];
      queue.forEach((value) => {
        result.push(value);
      });
      expect(result).toEqual([1, 2, 3]);
    });

    it('should handle string values', () => {
      const queue = new ConcurrentQueue<string>();
      queue.enqueue('a');
      queue.enqueue('b');
      queue.enqueue('c');
      const result: string[] = [];
      queue.forEach((value) => {
        result.push(value);
      });
      expect(result).toEqual(['a', 'b', 'c']);
    });

    it('should handle object values', () => {
      const queue = new ConcurrentQueue<{ id: number }>();
      queue.enqueue({ id: 1 });
      queue.enqueue({ id: 2 });
      const result: { id: number }[] = [];
      queue.forEach((value) => {
        result.push(value);
      });
      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it('should handle null values', () => {
      const queue = new ConcurrentQueue<number | null>();
      queue.enqueue(null);
      queue.enqueue(1);
      queue.enqueue(null);
      const result: (number | null)[] = [];
      queue.forEach((value) => {
        result.push(value);
      });
      expect(result).toEqual([null, 1, null]);
    });
  });

  describe('drain', () => {
    it('should drain all elements when count not specified', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      const result = queue.drain();
      expect(result).toEqual([1, 2, 3]);
      expect(queue.isEmpty).toBe(true);
    });

    it('should drain specified count', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.enqueue(4);
      queue.enqueue(5);
      const result = queue.drain(3);
      expect(result).toEqual([1, 2, 3]);
      expect(queue.size).toBe(2);
      expect(queue.toArray()).toEqual([4, 5]);
    });

    it('should drain all when count exceeds size', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      const result = queue.drain(10);
      expect(result).toEqual([1, 2, 3]);
      expect(queue.isEmpty).toBe(true);
    });

    it('should return empty array when queue is empty', () => {
      const queue = new ConcurrentQueue<number>();
      const result = queue.drain();
      expect(result).toEqual([]);
      expect(queue.isEmpty).toBe(true);
    });

    it('should return empty array when count is 0', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      const result = queue.drain(0);
      expect(result).toEqual([]);
      expect(queue.size).toBe(2);
    });

    it('should handle string values', () => {
      const queue = new ConcurrentQueue<string>();
      queue.enqueue('a');
      queue.enqueue('b');
      queue.enqueue('c');
      const result = queue.drain();
      expect(result).toEqual(['a', 'b', 'c']);
      expect(queue.isEmpty).toBe(true);
    });

    it('should handle object values', () => {
      const queue = new ConcurrentQueue<{ id: number }>();
      queue.enqueue({ id: 1 });
      queue.enqueue({ id: 2 });
      const result = queue.drain();
      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
      expect(queue.isEmpty).toBe(true);
    });

    it('should handle null values', () => {
      const queue = new ConcurrentQueue<number | null>();
      queue.enqueue(null);
      queue.enqueue(1);
      queue.enqueue(null);
      const result = queue.drain();
      expect(result).toEqual([null, 1, null]);
      expect(queue.isEmpty).toBe(true);
    });

    it('should update remaining capacity after drain', () => {
      const queue = new ConcurrentQueue<number>({ capacity: 5 });
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.drain();
      expect(queue.remainingCapacity).toBe(5);
    });

    it('should update remaining capacity after partial drain', () => {
      const queue = new ConcurrentQueue<number>({ capacity: 5 });
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.drain(2);
      expect(queue.remainingCapacity).toBe(4);
    });
  });

  describe('offer', () => {
    it('should return true when enqueue succeeds', () => {
      const queue = new ConcurrentQueue<number>();
      const result = queue.offer(1);
      expect(result).toBe(true);
      expect(queue.size).toBe(1);
    });

    it('should return false when queue is closed', () => {
      const queue = new ConcurrentQueue<number>();
      queue.close();
      const result = queue.offer(1);
      expect(result).toBe(false);
      expect(queue.size).toBe(0);
    });

    it('should return false when queue is full', () => {
      const queue = new ConcurrentQueue<number>({ capacity: 2 });
      queue.offer(1);
      queue.offer(2);
      const result = queue.offer(3);
      expect(result).toBe(false);
      expect(queue.size).toBe(2);
    });

    it('should add element when successful', () => {
      const queue = new ConcurrentQueue<number>();
      queue.offer(1);
      queue.offer(2);
      queue.offer(3);
      expect(queue.toArray()).toEqual([1, 2, 3]);
    });

    it('should handle string values', () => {
      const queue = new ConcurrentQueue<string>();
      const result = queue.offer('hello');
      expect(result).toBe(true);
      expect(queue.toArray()).toEqual(['hello']);
    });

    it('should handle object values', () => {
      const queue = new ConcurrentQueue<{ id: number }>();
      const result = queue.offer({ id: 1 });
      expect(result).toBe(true);
      expect(queue.toArray()).toEqual([{ id: 1 }]);
    });

    it('should handle null values', () => {
      const queue = new ConcurrentQueue<number | null>();
      const result = queue.offer(null);
      expect(result).toBe(true);
      expect(queue.toArray()).toEqual([null]);
    });

    it('should handle undefined values', () => {
      const queue = new ConcurrentQueue<number | undefined>();
      const result = queue.offer(undefined);
      expect(result).toBe(true);
      expect(queue.toArray()).toEqual([undefined]);
    });

    it('should not throw error when full', () => {
      const queue = new ConcurrentQueue<number>({ capacity: 2 });
      queue.offer(1);
      queue.offer(2);
      expect(() => queue.offer(3)).not.toThrow();
    });
  });

  describe('poll', () => {
    it('should remove and return first element', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      const result = queue.poll();
      expect(result).toBe(1);
      expect(queue.size).toBe(2);
      expect(queue.toArray()).toEqual([2, 3]);
    });

    it('should return undefined for empty queue', () => {
      const queue = new ConcurrentQueue<number>();
      const result = queue.poll();
      expect(result).toBe(undefined);
      expect(queue.size).toBe(0);
    });

    it('should not throw error for empty queue', () => {
      const queue = new ConcurrentQueue<number>();
      expect(() => queue.poll()).not.toThrow();
    });

    it('should handle string values', () => {
      const queue = new ConcurrentQueue<string>();
      queue.enqueue('first');
      queue.enqueue('second');
      const result = queue.poll();
      expect(result).toBe('first');
      expect(queue.toArray()).toEqual(['second']);
    });

    it('should handle object values', () => {
      const queue = new ConcurrentQueue<{ id: number }>();
      queue.enqueue({ id: 1 });
      queue.enqueue({ id: 2 });
      const result = queue.poll();
      expect(result).toEqual({ id: 1 });
      expect(queue.toArray()).toEqual([{ id: 2 }]);
    });

    it('should handle null values', () => {
      const queue = new ConcurrentQueue<number | null>();
      queue.enqueue(null);
      queue.enqueue(1);
      const result = queue.poll();
      expect(result).toBe(null);
      expect(queue.toArray()).toEqual([1]);
    });

    it('should update remaining capacity after poll', () => {
      const queue = new ConcurrentQueue<number>({ capacity: 3 });
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.poll();
      expect(queue.remainingCapacity).toBe(1);
    });

    it('should poll all elements sequentially', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.poll()).toBe(1);
      expect(queue.poll()).toBe(2);
      expect(queue.poll()).toBe(3);
      expect(queue.isEmpty).toBe(true);
    });
  });

  describe('put', () => {
    it('should resolve immediately when queue has space', async () => {
      const queue = new ConcurrentQueue<number>({ capacity: 3 });
      queue.enqueue(1);
      const promise = queue.put(2);
      await expect(promise).resolves.toBe(undefined);
      expect(queue.size).toBe(2);
    });

    it('should resolve immediately when capacity is undefined', async () => {
      const queue = new ConcurrentQueue<number>();
      const promise = queue.put(1);
      await expect(promise).resolves.toBe(undefined);
      expect(queue.size).toBe(1);
    });

    it('should reject when queue is closed', async () => {
      const queue = new ConcurrentQueue<number>();
      queue.close();
      const promise = queue.put(1);
      await expect(promise).rejects.toThrow('Queue is closed');
    });

    it('should wait when queue is full', async () => {
      const queue = new ConcurrentQueue<number>({ capacity: 2 });
      queue.enqueue(1);
      queue.enqueue(2);
      const promise = queue.put(3);
      let resolved = false;
      promise.then(() => {
        resolved = true;
      });
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(resolved).toBe(false);
      queue.dequeue();
      await expect(promise).resolves.toBe(undefined);
      expect(resolved).toBe(true);
    });

    it('should add element after waiting', async () => {
      const queue = new ConcurrentQueue<number>({ capacity: 2 });
      queue.enqueue(1);
      queue.enqueue(2);
      const promise = queue.put(3);
      queue.dequeue();
      await promise;
      expect(queue.size).toBe(2);
      expect(queue.toArray()).toEqual([2, 3]);
    });

    it('should handle string values', async () => {
      const queue = new ConcurrentQueue<string>();
      const promise = queue.put('hello');
      await promise;
      expect(queue.toArray()).toEqual(['hello']);
    });

    it('should handle object values', async () => {
      const queue = new ConcurrentQueue<{ id: number }>();
      const promise = queue.put({ id: 1 });
      await promise;
      expect(queue.toArray()).toEqual([{ id: 1 }]);
    });

    it('should handle null values', async () => {
      const queue = new ConcurrentQueue<number | null>();
      const promise = queue.put(null);
      await promise;
      expect(queue.toArray()).toEqual([null]);
    });

    it('should handle undefined values', async () => {
      const queue = new ConcurrentQueue<number | undefined>();
      const promise = queue.put(undefined);
      await promise;
      expect(queue.toArray()).toEqual([undefined]);
    });

    it('should handle multiple puts', async () => {
      const queue = new ConcurrentQueue<number>({ capacity: 3 });
      const promises = [queue.put(1), queue.put(2), queue.put(3)];
      await Promise.all(promises);
      expect(queue.toArray()).toEqual([1, 2, 3]);
    });

    it('should handle puts after drain', async () => {
      const queue = new ConcurrentQueue<number>({ capacity: 2 });
      queue.enqueue(1);
      queue.enqueue(2);
      const promise = queue.put(3);
      queue.drain(2);
      await promise;
      expect(queue.toArray()).toEqual([3]);
    });
  });

  describe('take', () => {
    it('should resolve immediately when queue has elements', async () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      const promise = queue.take();
      await expect(promise).resolves.toBe(1);
      expect(queue.size).toBe(0);
    });

    it('should wait when queue is empty', async () => {
      const queue = new ConcurrentQueue<number>();
      const promise = queue.take();
      let resolved = false;
      promise.then(() => {
        resolved = true;
      });
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(resolved).toBe(false);
      queue.enqueue(42);
      const result = await promise;
      expect(result).toBe(42);
      expect(resolved).toBe(true);
    });

    it('should resolve with element after waiting', async () => {
      const queue = new ConcurrentQueue<number>();
      const promise = queue.take();
      setTimeout(() => {
        queue.enqueue(100);
      }, 10);
      const result = await promise;
      expect(result).toBe(100);
    });

    it('should handle multiple takes', async () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      const promises = [queue.take(), queue.take(), queue.take()];
      const results = await Promise.all(promises);
      expect(results).toEqual([1, 2, 3]);
    });

    it('should handle string values', async () => {
      const queue = new ConcurrentQueue<string>();
      queue.enqueue('hello');
      const result = await queue.take();
      expect(result).toBe('hello');
    });

    it('should handle object values', async () => {
      const queue = new ConcurrentQueue<{ id: number }>();
      queue.enqueue({ id: 1 });
      const result = await queue.take();
      expect(result).toEqual({ id: 1 });
    });

    it('should handle null values', async () => {
      const queue = new ConcurrentQueue<number | null>();
      queue.enqueue(null);
      const result = await queue.take();
      expect(result).toBe(null);
    });

    it('should resolve with undefined when queue is closed and empty', async () => {
      const queue = new ConcurrentQueue<number>();
      const promise = queue.take();
      queue.close();
      const result = await promise;
      expect(result).toBe(undefined);
    });

    it('should resolve with existing element after close', async () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      const promise = queue.take();
      queue.close();
      const result = await promise;
      expect(result).toBe(1);
    });
  });

  describe('close', () => {
    it('should mark queue as closed', () => {
      const queue = new ConcurrentQueue<number>();
      queue.close();
      expect(queue.isClosed).toBe(true);
    });

    it('should prevent new enqueues', () => {
      const queue = new ConcurrentQueue<number>();
      queue.close();
      expect(() => queue.enqueue(1)).toThrow('Queue is closed');
    });

    it('should prevent new puts', async () => {
      const queue = new ConcurrentQueue<number>();
      queue.close();
      const promise = queue.put(1);
      await expect(promise).rejects.toThrow('Queue is closed');
    });

    it('should allow dequeuing existing elements', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.close();
      expect(queue.dequeue()).toBe(1);
      expect(queue.dequeue()).toBe(2);
      expect(queue.dequeue()).toBe(3);
    });

    it('should resolve waiting take with undefined', async () => {
      const queue = new ConcurrentQueue<number>();
      const promise = queue.take();
      queue.close();
      const result = await promise;
      expect(result).toBe(undefined);
    });

    it('should resolve multiple waiting takes', async () => {
      const queue = new ConcurrentQueue<number>();
      const promises = [queue.take(), queue.take(), queue.take()];
      queue.close();
      const results = await Promise.all(promises);
      expect(results).toEqual([undefined, undefined, undefined]);
    });

    it('should release waiting puts', async () => {
      const queue = new ConcurrentQueue<number>({ capacity: 1 });
      queue.enqueue(1);
      const promise = queue.put(2);
      let resolved = false;
      promise.then(() => {
        resolved = true;
      });
      queue.close();
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(resolved).toBe(true);
    });

    it('should be idempotent', () => {
      const queue = new ConcurrentQueue<number>();
      queue.close();
      queue.close();
      expect(queue.isClosed).toBe(true);
    });

    it('should work with empty queue', () => {
      const queue = new ConcurrentQueue<number>();
      queue.close();
      expect(queue.isClosed).toBe(true);
      expect(queue.isEmpty).toBe(true);
    });

    it('should work with full queue', () => {
      const queue = new ConcurrentQueue<number>({ capacity: 2 });
      queue.enqueue(1);
      queue.enqueue(2);
      queue.close();
      expect(queue.isClosed).toBe(true);
      expect(queue.isFull).toBe(true);
    });
  });

  describe('isClosed', () => {
    it('should return false for open queue', () => {
      const queue = new ConcurrentQueue<number>();
      expect(queue.isClosed).toBe(false);
    });

    it('should return true after close', () => {
      const queue = new ConcurrentQueue<number>();
      queue.close();
      expect(queue.isClosed).toBe(true);
    });

    it('should remain true after multiple closes', () => {
      const queue = new ConcurrentQueue<number>();
      queue.close();
      queue.close();
      expect(queue.isClosed).toBe(true);
    });
  });

  describe('isFull', () => {
    it('should return false when capacity is undefined', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.isFull).toBe(false);
    });

    it('should return false when queue is empty', () => {
      const queue = new ConcurrentQueue<number>({ capacity: 5 });
      expect(queue.isFull).toBe(false);
    });

    it('should return false when queue has space', () => {
      const queue = new ConcurrentQueue<number>({ capacity: 5 });
      queue.enqueue(1);
      queue.enqueue(2);
      expect(queue.isFull).toBe(false);
    });

    it('should return true when queue is full', () => {
      const queue = new ConcurrentQueue<number>({ capacity: 3 });
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.isFull).toBe(true);
    });

    it('should update after dequeue', () => {
      const queue = new ConcurrentQueue<number>({ capacity: 3 });
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.isFull).toBe(true);
      queue.dequeue();
      expect(queue.isFull).toBe(false);
    });

    it('should update after enqueue', () => {
      const queue = new ConcurrentQueue<number>({ capacity: 3 });
      queue.enqueue(1);
      queue.enqueue(2);
      expect(queue.isFull).toBe(false);
      queue.enqueue(3);
      expect(queue.isFull).toBe(true);
    });
  });

  describe('remainingCapacity', () => {
    it('should return undefined when capacity is undefined', () => {
      const queue = new ConcurrentQueue<number>();
      expect(queue.remainingCapacity).toBe(undefined);
    });

    it('should return capacity for empty queue', () => {
      const queue = new ConcurrentQueue<number>({ capacity: 5 });
      expect(queue.remainingCapacity).toBe(5);
    });

    it('should decrease after enqueue', () => {
      const queue = new ConcurrentQueue<number>({ capacity: 5 });
      expect(queue.remainingCapacity).toBe(5);
      queue.enqueue(1);
      expect(queue.remainingCapacity).toBe(4);
      queue.enqueue(2);
      expect(queue.remainingCapacity).toBe(3);
    });

    it('should increase after dequeue', () => {
      const queue = new ConcurrentQueue<number>({ capacity: 5 });
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.remainingCapacity).toBe(2);
      queue.dequeue();
      expect(queue.remainingCapacity).toBe(3);
      queue.dequeue();
      expect(queue.remainingCapacity).toBe(4);
    });

    it('should return 0 when full', () => {
      const queue = new ConcurrentQueue<number>({ capacity: 3 });
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.remainingCapacity).toBe(0);
    });

    it('should return capacity after clear', () => {
      const queue = new ConcurrentQueue<number>({ capacity: 5 });
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.remainingCapacity).toBe(2);
      queue.clear();
      expect(queue.remainingCapacity).toBe(5);
    });
  });

  describe('contains', () => {
    it('should return true when element exists', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.contains(2)).toBe(true);
    });

    it('should return false when element does not exist', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.contains(5)).toBe(false);
    });

    it('should return false for empty queue', () => {
      const queue = new ConcurrentQueue<number>();
      expect(queue.contains(1)).toBe(false);
    });

    it('should return true for first element', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.contains(1)).toBe(true);
    });

    it('should return true for last element', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.contains(3)).toBe(true);
    });

    it('should handle string values', () => {
      const queue = new ConcurrentQueue<string>();
      queue.enqueue('hello');
      queue.enqueue('world');
      expect(queue.contains('hello')).toBe(true);
      expect(queue.contains('foo')).toBe(false);
    });

    it('should handle object values', () => {
      const queue = new ConcurrentQueue<{ id: number }>();
      queue.enqueue({ id: 1 });
      queue.enqueue({ id: 2 });
      expect(queue.contains({ id: 1 })).toBe(false);
      expect(queue.contains({ id: 2 })).toBe(false);
    });

    it('should handle null values', () => {
      const queue = new ConcurrentQueue<number | null>();
      queue.enqueue(null);
      queue.enqueue(1);
      expect(queue.contains(null)).toBe(true);
    });

    it('should handle undefined values', () => {
      const queue = new ConcurrentQueue<number | undefined>();
      queue.enqueue(undefined);
      queue.enqueue(1);
      expect(queue.contains(undefined)).toBe(true);
    });

    it('should work after dequeue', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.dequeue();
      expect(queue.contains(1)).toBe(false);
      expect(queue.contains(2)).toBe(true);
    });
  });

  describe('remove', () => {
    it('should remove and return true for existing element', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      const result = queue.remove(2);
      expect(result).toBe(true);
      expect(queue.size).toBe(2);
      expect(queue.toArray()).toEqual([1, 3]);
    });

    it('should return false for non-existent element', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      const result = queue.remove(5);
      expect(result).toBe(false);
      expect(queue.size).toBe(3);
    });

    it('should return false for empty queue', () => {
      const queue = new ConcurrentQueue<number>();
      const result = queue.remove(1);
      expect(result).toBe(false);
      expect(queue.size).toBe(0);
    });

    it('should remove first element', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      const result = queue.remove(1);
      expect(result).toBe(true);
      expect(queue.toArray()).toEqual([2, 3]);
    });

    it('should remove last element', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      const result = queue.remove(3);
      expect(result).toBe(true);
      expect(queue.toArray()).toEqual([1, 2]);
    });

    it('should remove only first occurrence', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(2);
      queue.enqueue(3);
      const result = queue.remove(2);
      expect(result).toBe(true);
      expect(queue.size).toBe(3);
      expect(queue.toArray()).toEqual([1, 2, 3]);
    });

    it('should handle string values', () => {
      const queue = new ConcurrentQueue<string>();
      queue.enqueue('hello');
      queue.enqueue('world');
      const result = queue.remove('hello');
      expect(result).toBe(true);
      expect(queue.toArray()).toEqual(['world']);
    });

    it('should handle object values', () => {
      const queue = new ConcurrentQueue<{ id: number }>();
      const queueObj1 = { id: 1 };
      const queueObj2 = { id: 2 };
      queue.enqueue(queueObj1);
      queue.enqueue(queueObj2);
      const result = queue.remove(queueObj1);
      expect(result).toBe(true);
      expect(queue.toArray()).toEqual([{ id: 2 }]);
    });

    it('should handle null values', () => {
      const queue = new ConcurrentQueue<number | null>();
      queue.enqueue(null);
      queue.enqueue(1);
      const result = queue.remove(null);
      expect(result).toBe(true);
      expect(queue.toArray()).toEqual([1]);
    });

    it('should update remaining capacity after remove', () => {
      const queue = new ConcurrentQueue<number>({ capacity: 5 });
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.remove(2);
      expect(queue.remainingCapacity).toBe(3);
    });
  });

  describe('fromArray static', () => {
    it('should create queue from array', () => {
      const queue = ConcurrentQueue.fromArray([1, 2, 3]);
      expect(queue.size).toBe(3);
      expect(queue.toArray()).toEqual([1, 2, 3]);
    });

    it('should create empty queue from empty array', () => {
      const queue = ConcurrentQueue.fromArray([]);
      expect(queue.size).toBe(0);
      expect(queue.isEmpty).toBe(true);
    });

    it('should create queue with options', () => {
      const queue = ConcurrentQueue.fromArray([1, 2, 3], { capacity: 10 });
      expect(queue.capacity).toBe(10);
      expect(queue.size).toBe(3);
      expect(queue.toArray()).toEqual([1, 2, 3]);
    });

    it('should create queue without options', () => {
      const queue = ConcurrentQueue.fromArray([1, 2, 3]);
      expect(queue.capacity).toBe(undefined);
      expect(queue.size).toBe(3);
    });

    it('should handle string values', () => {
      const queue = ConcurrentQueue.fromArray(['a', 'b', 'c']);
      expect(queue.size).toBe(3);
      expect(queue.toArray()).toEqual(['a', 'b', 'c']);
    });

    it('should handle object values', () => {
      const queue = ConcurrentQueue.fromArray([{ id: 1 }, { id: 2 }]);
      expect(queue.size).toBe(2);
      expect(queue.toArray()).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it('should handle null values', () => {
      const queue = ConcurrentQueue.fromArray([null, 1, null]);
      expect(queue.size).toBe(3);
      expect(queue.toArray()).toEqual([null, 1, null]);
    });

    it('should throw error when capacity is exceeded', () => {
      expect(() => {
        ConcurrentQueue.fromArray([1, 2, 3, 4, 5], { capacity: 3 });
      }).toThrow('Queue is full');
    });

    it('should handle single element array', () => {
      const queue = ConcurrentQueue.fromArray([42]);
      expect(queue.size).toBe(1);
      expect(queue.toArray()).toEqual([42]);
    });
  });

  describe('complex scenarios', () => {
    it('should handle alternating enqueue and dequeue', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      expect(queue.dequeue()).toBe(1);
      queue.enqueue(3);
      queue.enqueue(4);
      expect(queue.dequeue()).toBe(2);
      expect(queue.toArray()).toEqual([3, 4]);
    });

    it('should maintain order with multiple operations', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.dequeue();
      queue.enqueue(4);
      expect(queue.toArray()).toEqual([2, 3, 4]);
    });

    it('should handle drain and enqueue', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.drain(2);
      queue.enqueue(4);
      queue.enqueue(5);
      expect(queue.toArray()).toEqual([3, 4, 5]);
    });

    it('should handle remove and contains together', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.contains(2)).toBe(true);
      queue.remove(2);
      expect(queue.contains(2)).toBe(false);
      expect(queue.toArray()).toEqual([1, 3]);
    });

    it('should handle forEach after operations', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.dequeue();
      queue.enqueue(3);
      const result: number[] = [];
      queue.forEach((value) => {
        result.push(value);
      });
      expect(result).toEqual([2, 3]);
    });

    it('should handle large number of elements', () => {
      const queue = new ConcurrentQueue<number>();
      for (let i = 0; i < 100; i++) {
        queue.enqueue(i);
      }
      expect(queue.size).toBe(100);
      expect(queue.peek()).toBe(0);
    });

    it('should handle capacity constrained operations', () => {
      const queue = new ConcurrentQueue<number>({ capacity: 3 });
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.offer(4)).toBe(false);
      queue.dequeue();
      expect(queue.offer(4)).toBe(true);
      expect(queue.toArray()).toEqual([2, 3, 4]);
    });
  });

  describe('edge cases', () => {
    it('should handle single element', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(42);
      expect(queue.size).toBe(1);
      expect(queue.peek()).toBe(42);
      expect(queue.contains(42)).toBe(true);
      expect(queue.remove(42)).toBe(true);
      expect(queue.isEmpty).toBe(true);
    });

    it('should handle capacity of 1', () => {
      const queue = new ConcurrentQueue<number>({ capacity: 1 });
      queue.enqueue(1);
      expect(queue.size).toBe(1);
      expect(queue.isFull).toBe(true);
      expect(queue.offer(2)).toBe(false);
      queue.dequeue();
      expect(queue.isEmpty).toBe(true);
    });

    it('should handle string values correctly', () => {
      const queue = new ConcurrentQueue<string>();
      queue.enqueue('hello');
      queue.enqueue('world');
      expect(queue.peek()).toBe('hello');
      expect(queue.dequeue()).toBe('hello');
      expect(queue.dequeue()).toBe('world');
    });

    it('should handle object values correctly', () => {
      const queue = new ConcurrentQueue<{ id: number }>();
      queue.enqueue({ id: 1 });
      queue.enqueue({ id: 2 });
      expect(queue.peek()).toEqual({ id: 1 });
      expect(queue.dequeue()).toEqual({ id: 1 });
      expect(queue.dequeue()).toEqual({ id: 2 });
    });

    it('should handle null values correctly', () => {
      const queue = new ConcurrentQueue<number | null>();
      queue.enqueue(null);
      queue.enqueue(1);
      expect(queue.contains(null)).toBe(true);
      expect(queue.remove(null)).toBe(true);
      expect(queue.toArray()).toEqual([1]);
    });

    it('should handle undefined values correctly', () => {
      const queue = new ConcurrentQueue<number | undefined>();
      queue.enqueue(undefined);
      queue.enqueue(1);
      expect(queue.contains(undefined)).toBe(true);
      expect(queue.remove(undefined)).toBe(true);
      expect(queue.toArray()).toEqual([1]);
    });

    it('should handle mix of null and values', () => {
      const queue = new ConcurrentQueue<number | null>();
      queue.enqueue(null);
      queue.enqueue(1);
      queue.enqueue(null);
      queue.enqueue(2);
      const result = queue.drain();
      expect(result).toEqual([null, 1, null, 2]);
    });

    it('should handle duplicate values', () => {
      const queue = new ConcurrentQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.size).toBe(4);
      expect(queue.contains(2)).toBe(true);
      expect(queue.remove(2)).toBe(true);
      expect(queue.size).toBe(3);
      expect(queue.contains(2)).toBe(true);
    });
  });
});
