import { describe, it, expect, beforeEach } from 'vitest';
import { CountedQueue } from '../src/core/counted-queue/index.js';

describe('CountedQueue', () => {
  let queue: CountedQueue<number>;

  beforeEach(() => {
    queue = new CountedQueue<number>();
  });

  describe('constructor', () => {
    it('should create queue with default capacity 16', () => {
      const q = new CountedQueue<number>();
      expect(q.size).toBe(0);
      expect(q.isEmpty()).toBe(true);
      expect(q.uniqueCount).toBe(0);
    });

    it('should create queue with specified capacity', () => {
      const q = new CountedQueue<number>({ initialCapacity: 32 });
      expect(q.size).toBe(0);
      expect(q.isEmpty()).toBe(true);
    });

    it('should throw RangeError for capacity less than 1', () => {
      expect(() => new CountedQueue<number>({ initialCapacity: 0 })).toThrow(RangeError);
      expect(() => new CountedQueue<number>({ initialCapacity: -1 })).toThrow(RangeError);
    });
  });

  describe('size', () => {
    it('should return 0 for empty queue', () => {
      expect(queue.size).toBe(0);
    });

    it('should track size after enqueue', () => {
      queue.enqueue(1);
      expect(queue.size).toBe(1);
      queue.enqueue(2);
      expect(queue.size).toBe(2);
      queue.enqueue(3);
      expect(queue.size).toBe(3);
    });

    it('should track size after dequeue', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.size).toBe(3);
      queue.dequeue();
      expect(queue.size).toBe(2);
      queue.dequeue();
      expect(queue.size).toBe(1);
    });

    it('should track size after clear', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      expect(queue.size).toBe(2);
      queue.clear();
      expect(queue.size).toBe(0);
    });

    it('should track size with duplicates', () => {
      queue.enqueue(1);
      queue.enqueue(1);
      queue.enqueue(1);
      expect(queue.size).toBe(3);
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

    it('should return true after dequeue all elements', () => {
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

  describe('enqueue', () => {
    it('should add element to queue', () => {
      queue.enqueue(1);
      expect(queue.size).toBe(1);
      expect(queue.peek()).toBe(1);
    });

    it('should maintain order with multiple enqueues', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.toArray()).toEqual([1, 2, 3]);
    });

    it('should grow capacity when full', () => {
      const q = new CountedQueue<number>({ initialCapacity: 2 });
      q.enqueue(1);
      q.enqueue(2);
      expect(q.size).toBe(2);
      q.enqueue(3);
      expect(q.size).toBe(3);
      expect(q.toArray()).toEqual([1, 2, 3]);
    });

    it('should handle duplicate elements', () => {
      queue.enqueue(1);
      queue.enqueue(1);
      queue.enqueue(1);
      expect(queue.size).toBe(3);
      expect(queue.frequency(1)).toBe(3);
    });
  });

  describe('dequeue', () => {
    it('should remove and return element from front', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.dequeue()).toBe(1);
      expect(queue.size).toBe(2);
      expect(queue.peek()).toBe(2);
    });

    it('should return undefined for empty queue', () => {
      expect(queue.dequeue()).toBe(undefined);
    });

    it('should maintain FIFO order', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.dequeue()).toBe(1);
      expect(queue.dequeue()).toBe(2);
      expect(queue.dequeue()).toBe(3);
      expect(queue.dequeue()).toBe(undefined);
    });

    it('should update frequency after dequeue', () => {
      queue.enqueue(1);
      queue.enqueue(1);
      queue.enqueue(2);
      expect(queue.frequency(1)).toBe(2);
      queue.dequeue();
      expect(queue.frequency(1)).toBe(1);
      queue.dequeue();
      expect(queue.frequency(1)).toBe(0);
      expect(queue.contains(1)).toBe(false);
    });
  });

  describe('peek', () => {
    it('should return front element', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      expect(queue.peek()).toBe(1);
    });

    it('should return undefined for empty queue', () => {
      expect(queue.peek()).toBe(undefined);
    });

    it('should not remove element', () => {
      queue.enqueue(1);
      expect(queue.peek()).toBe(1);
      expect(queue.size).toBe(1);
      expect(queue.peek()).toBe(1);
    });

    it('should update after dequeue', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.peek()).toBe(1);
      queue.dequeue();
      expect(queue.peek()).toBe(2);
    });
  });

  describe('peekBack', () => {
    it('should return back element', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.peekBack()).toBe(3);
    });

    it('should return undefined for empty queue', () => {
      expect(queue.peekBack()).toBe(undefined);
    });

    it('should not remove element', () => {
      queue.enqueue(1);
      expect(queue.peekBack()).toBe(1);
      expect(queue.size).toBe(1);
    });

    it('should update after enqueue', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      expect(queue.peekBack()).toBe(2);
      queue.enqueue(3);
      expect(queue.peekBack()).toBe(3);
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
      expect(queue.peek()).toBe(undefined);
      expect(queue.peekBack()).toBe(undefined);
    });

    it('should clear frequencies', () => {
      queue.enqueue(1);
      queue.enqueue(1);
      queue.enqueue(2);
      expect(queue.frequency(1)).toBe(2);
      expect(queue.frequency(2)).toBe(1);
      expect(queue.uniqueCount).toBe(2);
      queue.clear();
      expect(queue.frequency(1)).toBe(0);
      expect(queue.frequency(2)).toBe(0);
      expect(queue.uniqueCount).toBe(0);
    });

    it('should allow reuse after clear', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.clear();
      queue.enqueue(10);
      queue.enqueue(20);
      expect(queue.toArray()).toEqual([10, 20]);
      expect(queue.size).toBe(2);
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

    it('should maintain order', () => {
      queue.enqueue(10);
      queue.enqueue(20);
      queue.enqueue(30);
      expect(queue.toArray()).toEqual([10, 20, 30]);
    });

    it('should handle duplicates', () => {
      queue.enqueue(1);
      queue.enqueue(1);
      queue.enqueue(2);
      expect(queue.toArray()).toEqual([1, 1, 2]);
    });
  });

  describe('contains', () => {
    it('should return true for existing element', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.contains(2)).toBe(true);
    });

    it('should return false for non-existent element', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      expect(queue.contains(3)).toBe(false);
    });

    it('should return false for empty queue', () => {
      expect(queue.contains(1)).toBe(false);
    });

    it('should return true for duplicate elements', () => {
      queue.enqueue(1);
      queue.enqueue(1);
      queue.enqueue(2);
      expect(queue.contains(1)).toBe(true);
      expect(queue.contains(2)).toBe(true);
    });
  });

  describe('frequency', () => {
    it('should return 0 for non-existent element', () => {
      expect(queue.frequency(1)).toBe(0);
    });

    it('should return count for single occurrence', () => {
      queue.enqueue(1);
      expect(queue.frequency(1)).toBe(1);
    });

    it('should return count for multiple occurrences', () => {
      queue.enqueue(1);
      queue.enqueue(1);
      queue.enqueue(1);
      expect(queue.frequency(1)).toBe(3);
    });

    it('should track frequencies independently', () => {
      queue.enqueue(1);
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.frequency(1)).toBe(2);
      expect(queue.frequency(2)).toBe(2);
      expect(queue.frequency(3)).toBe(1);
    });

    it('should update after dequeue', () => {
      queue.enqueue(1);
      queue.enqueue(1);
      queue.enqueue(2);
      expect(queue.frequency(1)).toBe(2);
      queue.dequeue();
      expect(queue.frequency(1)).toBe(1);
      queue.dequeue();
      expect(queue.frequency(1)).toBe(0);
    });

    it('should reset after clear', () => {
      queue.enqueue(1);
      queue.enqueue(1);
      expect(queue.frequency(1)).toBe(2);
      queue.clear();
      expect(queue.frequency(1)).toBe(0);
    });
  });

  describe('uniqueCount', () => {
    it('should return 0 for empty queue', () => {
      expect(queue.uniqueCount).toBe(0);
    });

    it('should return 1 for single element', () => {
      queue.enqueue(1);
      expect(queue.uniqueCount).toBe(1);
    });

    it('should count unique elements', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.uniqueCount).toBe(3);
    });

    it('should not count duplicates', () => {
      queue.enqueue(1);
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.uniqueCount).toBe(3);
    });

    it('should update after dequeue', () => {
      queue.enqueue(1);
      queue.enqueue(1);
      queue.enqueue(2);
      expect(queue.uniqueCount).toBe(2);
      queue.dequeue();
      queue.dequeue();
      expect(queue.uniqueCount).toBe(1);
    });

    it('should update after clear', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      expect(queue.uniqueCount).toBe(2);
      queue.clear();
      expect(queue.uniqueCount).toBe(0);
    });
  });

  describe('mostFrequent', () => {
    it('should return empty array for empty queue', () => {
      expect(queue.mostFrequent()).toEqual([]);
    });

    it('should return single most frequent element', () => {
      queue.enqueue(1);
      queue.enqueue(1);
      queue.enqueue(2);
      const result = queue.mostFrequent();
      expect(result).toEqual([1]);
    });

    it('should return all most frequent elements', () => {
      queue.enqueue(1);
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(2);
      queue.enqueue(3);
      const result = queue.mostFrequent();
      expect(result.length).toBe(2);
      expect(result).toContain(1);
      expect(result).toContain(2);
    });

    it('should return all elements when frequencies are equal', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      const result = queue.mostFrequent();
      expect(result.length).toBe(3);
      expect(result).toContain(1);
      expect(result).toContain(2);
      expect(result).toContain(3);
    });

    it('should sort by appearance order', () => {
      queue.enqueue(2);
      queue.enqueue(2);
      queue.enqueue(1);
      queue.enqueue(1);
      queue.enqueue(3);
      const result = queue.mostFrequent();
      expect(result).toEqual([2, 1]);
    });
  });

  describe('leastFrequent', () => {
    it('should return empty array for empty queue', () => {
      expect(queue.leastFrequent()).toEqual([]);
    });

    it('should return single least frequent element', () => {
      queue.enqueue(1);
      queue.enqueue(1);
      queue.enqueue(2);
      const result = queue.leastFrequent();
      expect(result).toEqual([2]);
    });

    it('should return all least frequent elements', () => {
      queue.enqueue(1);
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(2);
      queue.enqueue(3);
      const result = queue.leastFrequent();
      expect(result.length).toBe(1);
      expect(result).toEqual([3]);
    });

    it('should return all elements when frequencies are equal', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      const result = queue.leastFrequent();
      expect(result.length).toBe(3);
      expect(result).toContain(1);
      expect(result).toContain(2);
      expect(result).toContain(3);
    });

    it('should sort by appearance order', () => {
      queue.enqueue(3);
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(1);
      queue.enqueue(2);
      const result = queue.leastFrequent();
      expect(result).toEqual([3]);
    });
  });

  describe('from', () => {
    it('should create queue from array', () => {
      const arr = [1, 2, 3, 4, 5];
      const q = CountedQueue.from(arr);
      expect(q.toArray()).toEqual(arr);
      expect(q.size).toBe(5);
    });

    it('should handle empty array', () => {
      const q = CountedQueue.from([]);
      expect(q.size).toBe(0);
      expect(q.isEmpty()).toBe(true);
      expect(q.toArray()).toEqual([]);
    });

    it('should handle array with duplicates', () => {
      const arr = [1, 1, 2, 2, 3];
      const q = CountedQueue.from(arr);
      expect(q.toArray()).toEqual(arr);
      expect(q.size).toBe(5);
      expect(q.frequency(1)).toBe(2);
      expect(q.frequency(2)).toBe(2);
      expect(q.frequency(3)).toBe(1);
    });

    it('should accept capacity option', () => {
      const arr = [1, 2, 3];
      const q = CountedQueue.from(arr, { initialCapacity: 32 });
      expect(q.toArray()).toEqual(arr);
      expect(q.size).toBe(3);
    });

    it('should handle large arrays', () => {
      const arr = Array.from({ length: 100 }, (_, i) => i);
      const q = CountedQueue.from(arr);
      expect(q.size).toBe(100);
      expect(q.toArray()).toEqual(arr);
    });
  });

  describe('mixed operations', () => {
    it('should handle enqueue and dequeue sequence', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.dequeue()).toBe(1);
      expect(queue.dequeue()).toBe(2);
      expect(queue.size).toBe(1);
      expect(queue.peek()).toBe(3);
    });

    it('should handle enqueue, dequeue, enqueue pattern', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      expect(queue.dequeue()).toBe(1);
      queue.enqueue(3);
      expect(queue.toArray()).toEqual([2, 3]);
    });

    it('should maintain frequency through mixed operations', () => {
      queue.enqueue(1);
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(2);
      queue.dequeue();
      queue.enqueue(1);
      expect(queue.frequency(1)).toBe(2);
      expect(queue.frequency(2)).toBe(2);
      expect(queue.uniqueCount).toBe(2);
    });
  });

  describe('edge cases', () => {
    it('should handle single element', () => {
      queue.enqueue(42);
      expect(queue.size).toBe(1);
      expect(queue.isEmpty()).toBe(false);
      expect(queue.peek()).toBe(42);
      expect(queue.peekBack()).toBe(42);
      expect(queue.dequeue()).toBe(42);
      expect(queue.isEmpty()).toBe(true);
    });

    it('should handle large number of operations', () => {
      for (let i = 0; i < 100; i++) {
        queue.enqueue(i);
      }
      expect(queue.size).toBe(100);
      expect(queue.toArray().length).toBe(100);

      for (let i = 0; i < 100; i++) {
        expect(queue.dequeue()).toBe(i);
      }
      expect(queue.isEmpty()).toBe(true);
    });

    it('should handle many duplicates', () => {
      for (let i = 0; i < 100; i++) {
        queue.enqueue(1);
      }
      expect(queue.size).toBe(100);
      expect(queue.frequency(1)).toBe(100);
      expect(queue.uniqueCount).toBe(1);
      expect(queue.mostFrequent()).toEqual([1]);
      expect(queue.leastFrequent()).toEqual([1]);
    });

    it('should handle strings', () => {
      const strQueue = new CountedQueue<string>();
      strQueue.enqueue('a');
      strQueue.enqueue('b');
      strQueue.enqueue('c');
      expect(strQueue.toArray()).toEqual(['a', 'b', 'c']);
      expect(strQueue.peek()).toBe('a');
      expect(strQueue.peekBack()).toBe('c');
    });

    it('should handle objects', () => {
      const objQueue = new CountedQueue<{ id: number }>();
      objQueue.enqueue({ id: 1 });
      objQueue.enqueue({ id: 2 });
      expect(objQueue.contains({ id: 1 })).toBe(false);
      expect(objQueue.size).toBe(2);
    });

    it('should handle wraparound with growth', () => {
      const q = new CountedQueue<number>({ initialCapacity: 2 });
      q.enqueue(1);
      q.enqueue(2);
      q.dequeue();
      q.enqueue(3);
      q.enqueue(4);
      expect(q.toArray()).toEqual([2, 3, 4]);
    });
  });

  describe('frequency tracking accuracy', () => {
    it('should track frequency correctly with interleaved operations', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(1);
      queue.dequeue();
      queue.enqueue(1);
      expect(queue.frequency(1)).toBe(2);
      expect(queue.frequency(2)).toBe(1);
    });

    it('should handle element frequency going to zero', () => {
      queue.enqueue(1);
      queue.enqueue(1);
      queue.enqueue(2);
      queue.dequeue();
      queue.dequeue();
      expect(queue.frequency(1)).toBe(0);
      expect(queue.contains(1)).toBe(false);
      expect(queue.uniqueCount).toBe(1);
    });

    it('should recalculate most frequent after operations', () => {
      queue.enqueue(1);
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.mostFrequent()).toEqual([1, 2]);
      queue.dequeue();
      expect(queue.mostFrequent()).toEqual([2]);
    });

    it('should recalculate least frequent after operations', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(2);
      expect(queue.leastFrequent()).toEqual([1]);
      queue.enqueue(3);
      expect(queue.leastFrequent()).toEqual([1, 3]);
    });
  });
});
