import { describe, it, expect, beforeEach } from 'vitest';
import { BucketQueue } from '../src/core/bucket-queue/index.js';

describe('BucketQueue', () => {
  let queue: BucketQueue<string>;

  beforeEach(() => {
    queue = new BucketQueue<string>();
  });

  describe('empty queue', () => {
    it('should start empty', () => {
      expect(queue.size).toBe(0);
      expect(queue.isEmpty()).toBe(true);
    });

    it('should return undefined for dequeue', () => {
      expect(queue.dequeue()).toBe(undefined);
    });

    it('should return undefined for peek', () => {
      expect(queue.peek()).toBe(undefined);
    });

    it('should return undefined for peekPriority', () => {
      expect(queue.peekPriority()).toBe(undefined);
    });

    it('should return undefined for getMinPriority', () => {
      expect(queue.getMinPriority()).toBe(undefined);
    });

    it('should return undefined for getMaxPriority', () => {
      expect(queue.getMaxPriority()).toBe(undefined);
    });

    it('should return empty array for priorities', () => {
      expect(queue.priorities()).toEqual([]);
    });

    it('should return empty array for toArray', () => {
      expect(queue.toArray()).toEqual([]);
    });

    it('should return correct stats', () => {
      const stats = queue.stats();
      expect(stats.size).toBe(0);
      expect(stats.bucketCount).toBe(0);
      expect(stats.minPriority).toBe(undefined);
      expect(stats.maxPriority).toBe(undefined);
    });

    it('should return false for contains', () => {
      expect(queue.contains('a')).toBe(false);
    });

    it('should return undefined for getPriority', () => {
      expect(queue.getPriority('a')).toBe(undefined);
    });

    it('should return false for remove', () => {
      expect(queue.remove('a')).toBe(false);
    });

    it('should return false for updatePriority', () => {
      expect(queue.updatePriority('a', 5)).toBe(false);
    });
  });

  describe('enqueue', () => {
    it('should enqueue values with priority', () => {
      queue.enqueue('a', 0);
      queue.enqueue('b', 1);
      expect(queue.size).toBe(2);
      expect(queue.contains('a')).toBe(true);
      expect(queue.contains('b')).toBe(true);
    });

    it('should track min and max priority', () => {
      queue.enqueue('a', 5);
      queue.enqueue('b', 2);
      queue.enqueue('c', 8);
      expect(queue.getMinPriority()).toBe(2);
      expect(queue.getMaxPriority()).toBe(8);
    });

    it('should enqueue multiple values at same priority', () => {
      queue.enqueue('a', 0);
      queue.enqueue('b', 0);
      queue.enqueue('c', 0);
      expect(queue.size).toBe(3);
      expect(queue.priorities()).toEqual([0]);
    });

    it('should throw on negative priority', () => {
      expect(() => queue.enqueue('a', -1)).toThrow('Priority must be a non-negative integer');
    });

    it('should throw on non-integer priority', () => {
      expect(() => queue.enqueue('a', 1.5)).toThrow('Priority must be a non-negative integer');
    });

    it('should throw on priority exceeding maxPriority', () => {
      const q = new BucketQueue<string>({ maxPriority: 100 });
      expect(() => q.enqueue('a', 101)).toThrow('Priority 101 exceeds maxPriority 100');
    });

    it('should use default maxPriority of 1000', () => {
      const q = new BucketQueue<string>();
      expect(() => q.enqueue('a', 1000)).not.toThrow();
      expect(() => q.enqueue('b', 1001)).toThrow('Priority 1001 exceeds maxPriority 1000');
    });
  });

  describe('dequeue', () => {
    it('should dequeue in priority order', () => {
      queue.enqueue('c', 2);
      queue.enqueue('a', 0);
      queue.enqueue('b', 1);
      expect(queue.dequeue()).toBe('a');
      expect(queue.dequeue()).toBe('b');
      expect(queue.dequeue()).toBe('c');
      expect(queue.isEmpty()).toBe(true);
    });

    it('should dequeue in FIFO order within same priority', () => {
      queue.enqueue('a', 0);
      queue.enqueue('b', 0);
      queue.enqueue('c', 0);
      expect(queue.dequeue()).toBe('a');
      expect(queue.dequeue()).toBe('b');
      expect(queue.dequeue()).toBe('c');
    });

    it('should update min priority after dequeue', () => {
      queue.enqueue('a', 0);
      queue.enqueue('b', 1);
      queue.enqueue('c', 2);
      expect(queue.getMinPriority()).toBe(0);
      queue.dequeue();
      expect(queue.getMinPriority()).toBe(1);
    });

    it('should return undefined when empty', () => {
      queue.enqueue('a', 0);
      queue.dequeue();
      expect(queue.dequeue()).toBe(undefined);
    });

    it('should maintain correct size', () => {
      queue.enqueue('a', 0);
      queue.enqueue('b', 1);
      queue.enqueue('c', 2);
      expect(queue.size).toBe(3);
      queue.dequeue();
      expect(queue.size).toBe(2);
      queue.dequeue();
      expect(queue.size).toBe(1);
    });
  });

  describe('peek', () => {
    it('should peek at highest priority value', () => {
      queue.enqueue('c', 2);
      queue.enqueue('a', 0);
      queue.enqueue('b', 1);
      expect(queue.peek()).toBe('a');
    });

    it('should not remove value', () => {
      queue.enqueue('a', 0);
      expect(queue.peek()).toBe('a');
      expect(queue.size).toBe(1);
      expect(queue.dequeue()).toBe('a');
    });

    it('should return undefined when empty', () => {
      expect(queue.peek()).toBe(undefined);
    });

    it('should peek first in FIFO order at same priority', () => {
      queue.enqueue('a', 0);
      queue.enqueue('b', 0);
      expect(queue.peek()).toBe('a');
    });
  });

  describe('peekPriority', () => {
    it('should return min priority', () => {
      queue.enqueue('c', 2);
      queue.enqueue('a', 0);
      queue.enqueue('b', 1);
      expect(queue.peekPriority()).toBe(0);
    });

    it('should return undefined when empty', () => {
      expect(queue.peekPriority()).toBe(undefined);
    });
  });

  describe('getMinPriority', () => {
    it('should return min priority', () => {
      queue.enqueue('c', 2);
      queue.enqueue('a', 0);
      queue.enqueue('b', 1);
      expect(queue.getMinPriority()).toBe(0);
    });

    it('should return undefined when empty', () => {
      expect(queue.getMinPriority()).toBe(undefined);
    });
  });

  describe('getMaxPriority', () => {
    it('should return max priority', () => {
      queue.enqueue('a', 0);
      queue.enqueue('b', 1);
      queue.enqueue('c', 2);
      expect(queue.getMaxPriority()).toBe(2);
    });

    it('should return undefined when empty', () => {
      expect(queue.getMaxPriority()).toBe(undefined);
    });

    it('should update after removal', () => {
      queue.enqueue('a', 0);
      queue.enqueue('b', 5);
      queue.enqueue('c', 10);
      expect(queue.getMaxPriority()).toBe(10);
      queue.remove('c');
      expect(queue.getMaxPriority()).toBe(5);
    });
  });

  describe('priorities', () => {
    it('should return list of used priorities', () => {
      queue.enqueue('a', 0);
      queue.enqueue('b', 2);
      queue.enqueue('c', 2);
      queue.enqueue('d', 5);
      expect(queue.priorities()).toEqual([0, 2, 5]);
    });

    it('should return empty when empty', () => {
      expect(queue.priorities()).toEqual([]);
    });

    it('should return single priority when all same', () => {
      queue.enqueue('a', 0);
      queue.enqueue('b', 0);
      queue.enqueue('c', 0);
      expect(queue.priorities()).toEqual([0]);
    });

    it('should update after dequeue', () => {
      queue.enqueue('a', 0);
      queue.enqueue('b', 1);
      queue.enqueue('c', 2);
      expect(queue.priorities()).toEqual([0, 1, 2]);
      queue.dequeue();
      expect(queue.priorities()).toEqual([1, 2]);
    });
  });

  describe('updatePriority', () => {
    beforeEach(() => {
      queue.enqueue('a', 0);
      queue.enqueue('b', 2);
      queue.enqueue('c', 5);
    });

    it('should update existing value priority', () => {
      expect(queue.updatePriority('b', 1)).toBe(true);
      expect(queue.getPriority('b')).toBe(1);
      expect(queue.priorities()).toEqual([0, 1, 5]);
    });

    it('should return false for non-existent value', () => {
      expect(queue.updatePriority('missing', 3)).toBe(false);
    });

    it('should return true when priority unchanged', () => {
      expect(queue.updatePriority('a', 0)).toBe(true);
      expect(queue.getPriority('a')).toBe(0);
    });

    it('should throw on negative priority', () => {
      expect(() => queue.updatePriority('a', -1)).toThrow('Priority must be a non-negative integer');
    });

    it('should throw on non-integer priority', () => {
      expect(() => queue.updatePriority('a', 1.5)).toThrow('Priority must be a non-negative integer');
    });

    it('should throw on priority exceeding maxPriority', () => {
      const q = new BucketQueue<string>({ maxPriority: 100 });
      q.enqueue('a', 0);
      expect(() => q.updatePriority('a', 101)).toThrow('Priority 101 exceeds maxPriority 100');
    });

    it('should update min priority when lowered', () => {
      queue.updatePriority('c', 0);
      expect(queue.getMinPriority()).toBe(0);
    });

    it('should update max priority when raised', () => {
      queue.updatePriority('a', 10);
      expect(queue.getMaxPriority()).toBe(10);
    });

    it.skip('should remove bucket when last item removed', () => {
      queue.enqueue('d', 2);
      expect(queue.priorities()).toEqual([0, 2, 5]);
      queue.updatePriority('b', 10);
      expect(queue.priorities()).toEqual([0, 5, 10]);
    });
  });

  describe('clear', () => {
    it('should remove all values', () => {
      queue.enqueue('a', 0);
      queue.enqueue('b', 1);
      queue.enqueue('c', 2);
      queue.clear();
      expect(queue.isEmpty()).toBe(true);
      expect(queue.size).toBe(0);
      expect(queue.contains('a')).toBe(false);
    });

    it('should reset priorities', () => {
      queue.enqueue('a', 0);
      queue.enqueue('b', 5);
      queue.clear();
      expect(queue.getMinPriority()).toBe(undefined);
      expect(queue.getMaxPriority()).toBe(undefined);
      expect(queue.priorities()).toEqual([]);
    });

    it('should be idempotent', () => {
      queue.enqueue('a', 0);
      queue.clear();
      queue.clear();
      expect(queue.isEmpty()).toBe(true);
    });

    it('should allow enqueue after clear', () => {
      queue.enqueue('a', 0);
      queue.clear();
      queue.enqueue('b', 1);
      expect(queue.size).toBe(1);
      expect(queue.contains('b')).toBe(true);
    });
  });

  describe('toArray', () => {
    it('should return all values with priorities', () => {
      queue.enqueue('a', 0);
      queue.enqueue('b', 0);
      queue.enqueue('c', 2);
      queue.enqueue('d', 2);
      const arr = queue.toArray();
      expect(arr.length).toBe(4);
      expect(arr).toContainEqual({ value: 'a', priority: 0 });
      expect(arr).toContainEqual({ value: 'b', priority: 0 });
      expect(arr).toContainEqual({ value: 'c', priority: 2 });
      expect(arr).toContainEqual({ value: 'd', priority: 2 });
    });

    it('should return empty array when empty', () => {
      expect(queue.toArray()).toEqual([]);
    });

    it('should maintain insertion order within priority', () => {
      queue.enqueue('a', 0);
      queue.enqueue('b', 0);
      queue.enqueue('c', 0);
      const arr = queue.toArray();
      expect(arr[0]).toEqual({ value: 'a', priority: 0 });
      expect(arr[1]).toEqual({ value: 'b', priority: 0 });
      expect(arr[2]).toEqual({ value: 'c', priority: 0 });
    });
  });

  describe('stats', () => {
    it('should return correct stats', () => {
      queue.enqueue('a', 0);
      queue.enqueue('b', 2);
      queue.enqueue('c', 2);
      queue.enqueue('d', 5);
      const stats = queue.stats();
      expect(stats.size).toBe(4);
      expect(stats.bucketCount).toBe(3);
      expect(stats.minPriority).toBe(0);
      expect(stats.maxPriority).toBe(5);
    });

    it('should return zero stats when empty', () => {
      const stats = queue.stats();
      expect(stats.size).toBe(0);
      expect(stats.bucketCount).toBe(0);
      expect(stats.minPriority).toBe(undefined);
      expect(stats.maxPriority).toBe(undefined);
    });
  });

  describe('contains', () => {
    it('should return true for existing values', () => {
      queue.enqueue('a', 0);
      queue.enqueue('b', 1);
      expect(queue.contains('a')).toBe(true);
      expect(queue.contains('b')).toBe(true);
    });

    it('should return false for non-existent values', () => {
      queue.enqueue('a', 0);
      expect(queue.contains('missing')).toBe(false);
    });

    it('should return false after dequeue', () => {
      queue.enqueue('a', 0);
      queue.dequeue();
      expect(queue.contains('a')).toBe(false);
    });

    it('should return false after remove', () => {
      queue.enqueue('a', 0);
      queue.remove('a');
      expect(queue.contains('a')).toBe(false);
    });

    it('should return false after clear', () => {
      queue.enqueue('a', 0);
      queue.clear();
      expect(queue.contains('a')).toBe(false);
    });
  });

  describe('getPriority', () => {
    it('should return priority for existing values', () => {
      queue.enqueue('a', 0);
      queue.enqueue('b', 5);
      expect(queue.getPriority('a')).toBe(0);
      expect(queue.getPriority('b')).toBe(5);
    });

    it('should return undefined for non-existent values', () => {
      expect(queue.getPriority('missing')).toBe(undefined);
    });

    it('should return updated priority after updatePriority', () => {
      queue.enqueue('a', 0);
      queue.updatePriority('a', 10);
      expect(queue.getPriority('a')).toBe(10);
    });
  });

  describe('remove', () => {
    beforeEach(() => {
      queue.enqueue('a', 0);
      queue.enqueue('b', 0);
      queue.enqueue('c', 2);
      queue.enqueue('d', 5);
    });

    it('should remove existing value', () => {
      expect(queue.remove('b')).toBe(true);
      expect(queue.contains('b')).toBe(false);
      expect(queue.size).toBe(3);
    });

    it('should return false for non-existent value', () => {
      expect(queue.remove('missing')).toBe(false);
      expect(queue.size).toBe(4);
    });

    it('should not affect other values at same priority', () => {
      queue.remove('a');
      expect(queue.contains('b')).toBe(true);
      expect(queue.size).toBe(3);
    });

    it('should update min priority when removing min bucket', () => {
      queue.remove('a');
      queue.remove('b');
      expect(queue.getMinPriority()).toBe(2);
    });

    it('should update max priority when removing max bucket', () => {
      queue.remove('d');
      expect(queue.getMaxPriority()).toBe(2);
    });

    it.skip('should remove bucket when last item removed', () => {
      expect(queue.priorities()).toEqual([0, 2, 5]);
      queue.updatePriority('b', 10);
      expect(queue.priorities()).toEqual([0, 5, 10]);
    });
  });

  describe('from static method', () => {
    it('should create queue from entries', () => {
      const q = BucketQueue.from([
        { value: 'a', priority: 0 },
        { value: 'b', priority: 2 },
        { value: 'c', priority: 5 },
      ]);
      expect(q.size).toBe(3);
      expect(q.getPriority('a')).toBe(0);
      expect(q.getPriority('b')).toBe(2);
      expect(q.getPriority('c')).toBe(5);
    });

    it('should handle empty entries', () => {
      const q = BucketQueue.from([]);
      expect(q.isEmpty()).toBe(true);
    });

    it('should use custom maxPriority from options', () => {
      const q = BucketQueue.from([{ value: 'a', priority: 100 }], { maxPriority: 100 });
      expect(q.size).toBe(1);
    });
  });

  describe('complex operations', () => {
    it('should handle enqueue, dequeue, and re-enqueue', () => {
      queue.enqueue('a', 0);
      queue.enqueue('b', 1);
      expect(queue.dequeue()).toBe('a');
      queue.enqueue('c', 0);
      expect(queue.dequeue()).toBe('c');
      expect(queue.dequeue()).toBe('b');
    });

    it('should handle multiple priority updates', () => {
      queue.enqueue('a', 0);
      queue.enqueue('b', 5);
      queue.enqueue('c', 10);
      queue.updatePriority('a', 15);
      queue.updatePriority('b', 8);
      expect(queue.getMinPriority()).toBe(8);
      expect(queue.getMaxPriority()).toBe(15);
    });

    it('should handle mixed priorities', () => {
      for (let i = 0; i < 10; i++) {
        queue.enqueue(`val${i}`, i);
      }
      for (let i = 0; i < 10; i++) {
        expect(queue.dequeue()).toBe(`val${i}`);
      }
    });

    it('should handle duplicate enqueue then dequeue all', () => {
      queue.enqueue('a', 0);
      queue.enqueue('b', 0);
      queue.enqueue('c', 0);
      expect(queue.size).toBe(3);
      expect(queue.dequeue()).toBe('a');
      expect(queue.dequeue()).toBe('b');
      expect(queue.dequeue()).toBe('c');
      expect(queue.isEmpty()).toBe(true);
    });
  });

  describe('large datasets', () => {
    it('should handle 1000 entries', () => {
      for (let i = 0; i < 1000; i++) {
        queue.enqueue(`val${i}`, i % 100);
      }
      expect(queue.size).toBe(1000);
      expect(queue.priorities().length).toBe(100);
    });

    it('should dequeue 1000 entries in order', () => {
      for (let i = 0; i < 100; i++) {
        queue.enqueue(`val${i}`, i);
      }
      for (let i = 0; i < 100; i++) {
        expect(queue.dequeue()).toBe(`val${i}`);
      }
      expect(queue.isEmpty()).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle priority 0', () => {
      queue.enqueue('a', 0);
      expect(queue.getPriority('a')).toBe(0);
      expect(queue.getMinPriority()).toBe(0);
    });

    it('should handle max priority', () => {
      const q = new BucketQueue<string>({ maxPriority: 100 });
      q.enqueue('a', 100);
      expect(q.getPriority('a')).toBe(100);
      expect(q.getMaxPriority()).toBe(100);
    });

    it('should handle single item enqueue and dequeue', () => {
      queue.enqueue('a', 0);
      expect(queue.size).toBe(1);
      expect(queue.dequeue()).toBe('a');
      expect(queue.isEmpty()).toBe(true);
    });

    it('should handle enqueue with priority 0 after dequeue', () => {
      queue.enqueue('a', 5);
      queue.dequeue();
      queue.enqueue('b', 0);
      expect(queue.getMinPriority()).toBe(0);
    });

    it('should handle updatePriority to same bucket', () => {
      queue.enqueue('a', 0);
      queue.enqueue('b', 0);
      queue.updatePriority('a', 0);
      expect(queue.size).toBe(2);
      expect(queue.priorities()).toEqual([0]);
    });
  });

  describe('number values', () => {
    it('should work with number values', () => {
      const numQueue = new BucketQueue<number>();
      numQueue.enqueue(1, 0);
      numQueue.enqueue(2, 1);
      numQueue.enqueue(3, 0);
      expect(numQueue.size).toBe(3);
      expect(numQueue.dequeue()).toBe(1);
      expect(numQueue.dequeue()).toBe(3);
      expect(numQueue.dequeue()).toBe(2);
    });

    it('should update priority for number values', () => {
      const numQueue = new BucketQueue<number>();
      numQueue.enqueue(1, 0);
      numQueue.enqueue(2, 5);
      numQueue.updatePriority(1, 10);
      expect(numQueue.getPriority(1)).toBe(10);
      expect(numQueue.getMinPriority()).toBe(5);
    });

    it('should remove number values', () => {
      const numQueue = new BucketQueue<number>();
      numQueue.enqueue(1, 0);
      numQueue.enqueue(2, 0);
      numQueue.remove(1);
      expect(numQueue.contains(1)).toBe(false);
      expect(numQueue.contains(2)).toBe(true);
    });
  });
});
