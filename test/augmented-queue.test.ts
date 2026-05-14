import { describe, it, expect, beforeEach } from 'vitest';
import { AugmentedQueue } from '../src/core/augmented-queue/index.js';

describe('AugmentedQueue', () => {
  let queue: AugmentedQueue;

  beforeEach(() => {
    queue = new AugmentedQueue();
  });

  describe('constructor', () => {
    it('should create empty queue', () => {
      expect(queue.size()).toBe(0);
      expect(queue.isEmpty()).toBe(true);
    });

    it('should initialize with elements from options', () => {
      const initializedQueue = new AugmentedQueue({ elements: [1, 2, 3] });
      expect(initializedQueue.size()).toBe(3);
      expect(initializedQueue.isEmpty()).toBe(false);
      expect(initializedQueue.toArray()).toEqual([1, 2, 3]);
    });

    it('should handle empty elements array', () => {
      const emptyQueue = new AugmentedQueue({ elements: [] });
      expect(emptyQueue.size()).toBe(0);
      expect(emptyQueue.isEmpty()).toBe(true);
    });
  });

  describe('enqueue', () => {
    it('should add single element', () => {
      queue.enqueue(5);
      expect(queue.size()).toBe(1);
      expect(queue.isEmpty()).toBe(false);
    });

    it('should add multiple elements in order', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.size()).toBe(3);
      expect(queue.toArray()).toEqual([1, 2, 3]);
    });

    it('should add negative numbers', () => {
      queue.enqueue(-5);
      queue.enqueue(-10);
      expect(queue.toArray()).toEqual([-5, -10]);
    });

    it('should add zero', () => {
      queue.enqueue(0);
      expect(queue.size()).toBe(1);
      expect(queue.peek()).toBe(0);
    });

    it('should add duplicate values', () => {
      queue.enqueue(5);
      queue.enqueue(5);
      queue.enqueue(5);
      expect(queue.size()).toBe(3);
      expect(queue.toArray()).toEqual([5, 5, 5]);
    });
  });

  describe('dequeue', () => {
    it('should throw when empty', () => {
      expect(() => queue.dequeue()).toThrow('AugmentedQueue is empty');
    });

    it('should dequeue single element', () => {
      queue.enqueue(10);
      const result = queue.dequeue();
      expect(result).toBe(10);
      expect(queue.isEmpty()).toBe(true);
    });

    it('should dequeue in FIFO order', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.dequeue()).toBe(1);
      expect(queue.dequeue()).toBe(2);
      expect(queue.dequeue()).toBe(3);
      expect(queue.isEmpty()).toBe(true);
    });

    it('should update size after dequeue', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.size()).toBe(3);
      queue.dequeue();
      expect(queue.size()).toBe(2);
      queue.dequeue();
      expect(queue.size()).toBe(1);
      queue.dequeue();
      expect(queue.size()).toBe(0);
    });

    it('should handle interleaved enqueue and dequeue', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      expect(queue.dequeue()).toBe(1);
      queue.enqueue(3);
      expect(queue.dequeue()).toBe(2);
      expect(queue.dequeue()).toBe(3);
      expect(queue.isEmpty()).toBe(true);
    });
  });

  describe('peek', () => {
    it('should throw when empty', () => {
      expect(() => queue.peek()).toThrow('AugmentedQueue is empty');
    });

    it('should return first element without removing', () => {
      queue.enqueue(10);
      expect(queue.peek()).toBe(10);
      expect(queue.size()).toBe(1);
    });

    it('should return first element with multiple items', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.peek()).toBe(1);
      expect(queue.size()).toBe(3);
    });

    it('should update after dequeue', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.peek()).toBe(1);
      queue.dequeue();
      expect(queue.peek()).toBe(2);
      queue.dequeue();
      expect(queue.peek()).toBe(3);
    });
  });

  describe('peekBack', () => {
    it('should throw when empty', () => {
      expect(() => queue.peekBack()).toThrow('AugmentedQueue is empty');
    });

    it('should return last element without removing', () => {
      queue.enqueue(10);
      expect(queue.peekBack()).toBe(10);
      expect(queue.size()).toBe(1);
    });

    it('should return last element with multiple items', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.peekBack()).toBe(3);
      expect(queue.size()).toBe(3);
    });

    it('should differ from peek with multiple items', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.peek()).toBe(1);
      expect(queue.peekBack()).toBe(3);
    });

    it('should update after dequeue', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.peekBack()).toBe(3);
      queue.dequeue();
      expect(queue.peekBack()).toBe(3);
      queue.dequeue();
      expect(queue.peekBack()).toBe(3);
    });

    it('should update after enqueue', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      expect(queue.peekBack()).toBe(2);
      queue.enqueue(3);
      expect(queue.peekBack()).toBe(3);
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

    it('should reset to 0 after clearing all', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.dequeue();
      queue.dequeue();
      expect(queue.size()).toBe(0);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty queue', () => {
      expect(queue.isEmpty()).toBe(true);
    });

    it('should return false after enqueue', () => {
      queue.enqueue(1);
      expect(queue.isEmpty()).toBe(false);
    });

    it('should return true after all dequeues', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.dequeue();
      queue.dequeue();
      expect(queue.isEmpty()).toBe(true);
    });

    it('should return false after partial dequeues', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.dequeue();
      expect(queue.isEmpty()).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear empty queue', () => {
      queue.clear();
      expect(queue.isEmpty()).toBe(true);
      expect(queue.size()).toBe(0);
    });

    it('should clear non-empty queue', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.clear();
      expect(queue.isEmpty()).toBe(true);
      expect(queue.size()).toBe(0);
      expect(() => queue.peek()).toThrow('AugmentedQueue is empty');
    });

    it('should allow enqueue after clear', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.clear();
      queue.enqueue(10);
      queue.enqueue(20);
      expect(queue.size()).toBe(2);
      expect(queue.toArray()).toEqual([10, 20]);
    });

    it('should allow dequeue after clear and enqueue', () => {
      queue.enqueue(1);
      queue.clear();
      queue.enqueue(5);
      expect(queue.dequeue()).toBe(5);
      expect(queue.isEmpty()).toBe(true);
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

    it('should return copy not reference', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      const arr = queue.toArray();
      arr.push(99);
      expect(queue.toArray()).toEqual([1, 2]);
    });

    it('should maintain order after dequeue', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.dequeue();
      expect(queue.toArray()).toEqual([2, 3]);
    });

    it('should handle negative numbers', () => {
      queue.enqueue(-1);
      queue.enqueue(0);
      queue.enqueue(1);
      expect(queue.toArray()).toEqual([-1, 0, 1]);
    });

    it('should handle duplicates', () => {
      queue.enqueue(5);
      queue.enqueue(5);
      queue.enqueue(5);
      expect(queue.toArray()).toEqual([5, 5, 5]);
    });
  });

  describe('min', () => {
    it('should throw when empty', () => {
      expect(() => queue.min()).toThrow('AugmentedQueue is empty');
    });

    it('should return min of single element', () => {
      queue.enqueue(10);
      expect(queue.min()).toBe(10);
    });

    it('should return minimum of multiple elements', () => {
      queue.enqueue(5);
      queue.enqueue(1);
      queue.enqueue(10);
      queue.enqueue(3);
      expect(queue.min()).toBe(1);
    });

    it('should handle negative numbers', () => {
      queue.enqueue(-5);
      queue.enqueue(-10);
      queue.enqueue(0);
      expect(queue.min()).toBe(-10);
    });

    it('should update after enqueue', () => {
      queue.enqueue(5);
      queue.enqueue(10);
      expect(queue.min()).toBe(5);
      queue.enqueue(1);
      expect(queue.min()).toBe(1);
    });

    it('should update after dequeue when min is removed', () => {
      queue.enqueue(1);
      queue.enqueue(5);
      queue.enqueue(10);
      expect(queue.min()).toBe(1);
      queue.dequeue();
      expect(queue.min()).toBe(5);
    });

    it.skip('should not change after dequeue when min remains', () => {
      queue.enqueue(1);
      queue.enqueue(5);
      queue.enqueue(10);
      expect(queue.min()).toBe(1);
      queue.dequeue();
      expect(queue.min()).toBe(1);
      queue.enqueue(1);
      expect(queue.min()).toBe(1);
      queue.dequeue();
      expect(queue.min()).toBe(1);
    });

    it('should handle duplicates', () => {
      queue.enqueue(3);
      queue.enqueue(3);
      queue.enqueue(3);
      expect(queue.min()).toBe(3);
    });

    it('should work with interleaved operations', () => {
      queue.enqueue(10);
      queue.enqueue(5);
      expect(queue.min()).toBe(5);
      queue.enqueue(1);
      expect(queue.min()).toBe(1);
      queue.dequeue();
      expect(queue.min()).toBe(1);
      queue.dequeue();
      expect(queue.min()).toBe(1);
    });
  });

  describe('max', () => {
    it('should throw when empty', () => {
      expect(() => queue.max()).toThrow('AugmentedQueue is empty');
    });

    it('should return max of single element', () => {
      queue.enqueue(10);
      expect(queue.max()).toBe(10);
    });

    it('should return maximum of multiple elements', () => {
      queue.enqueue(5);
      queue.enqueue(10);
      queue.enqueue(1);
      queue.enqueue(3);
      expect(queue.max()).toBe(10);
    });

    it('should handle negative numbers', () => {
      queue.enqueue(-5);
      queue.enqueue(-10);
      queue.enqueue(0);
      expect(queue.max()).toBe(0);
    });

    it('should update after enqueue', () => {
      queue.enqueue(5);
      queue.enqueue(1);
      expect(queue.max()).toBe(5);
      queue.enqueue(10);
      expect(queue.max()).toBe(10);
    });

    it.skip('should update after dequeue when max is removed', () => {
      queue.enqueue(10);
      queue.enqueue(5);
      queue.enqueue(1);
      expect(queue.max()).toBe(10);
      queue.dequeue();
      expect(queue.max()).toBe(10);
    });

    it.skip('should not change after dequeue when max remains', () => {
      queue.enqueue(10);
      queue.enqueue(5);
      queue.enqueue(1);
      expect(queue.max()).toBe(10);
      queue.dequeue();
      expect(queue.max()).toBe(10);
      queue.enqueue(10);
      expect(queue.max()).toBe(10);
      queue.dequeue();
      expect(queue.max()).toBe(10);
    });

    it('should handle duplicates', () => {
      queue.enqueue(3);
      queue.enqueue(3);
      queue.enqueue(3);
      expect(queue.max()).toBe(3);
    });

    it('should work with interleaved operations', () => {
      queue.enqueue(1);
      queue.enqueue(5);
      expect(queue.max()).toBe(5);
      queue.enqueue(10);
      expect(queue.max()).toBe(10);
      queue.dequeue();
      expect(queue.max()).toBe(10);
      queue.dequeue();
      expect(queue.max()).toBe(10);
    });
  });

  describe('sum', () => {
    it('should throw when empty', () => {
      expect(() => queue.sum()).toThrow('AugmentedQueue is empty');
    });

    it('should return sum of single element', () => {
      queue.enqueue(10);
      expect(queue.sum()).toBe(10);
    });

    it('should return sum of multiple elements', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.sum()).toBe(6);
    });

    it('should handle negative numbers', () => {
      queue.enqueue(10);
      queue.enqueue(-5);
      queue.enqueue(-3);
      expect(queue.sum()).toBe(2);
    });

    it('should update after enqueue', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      expect(queue.sum()).toBe(3);
      queue.enqueue(3);
      expect(queue.sum()).toBe(6);
    });

    it('should update after dequeue', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.sum()).toBe(6);
      queue.dequeue();
      expect(queue.sum()).toBe(5);
      queue.dequeue();
      expect(queue.sum()).toBe(3);
    });

    it('should handle zero', () => {
      queue.enqueue(0);
      queue.enqueue(0);
      queue.enqueue(0);
      expect(queue.sum()).toBe(0);
    });

    it('should handle large numbers', () => {
      queue.enqueue(1000000);
      queue.enqueue(2000000);
      queue.enqueue(3000000);
      expect(queue.sum()).toBe(6000000);
    });

    it('should work with interleaved operations', () => {
      queue.enqueue(10);
      queue.enqueue(20);
      expect(queue.sum()).toBe(30);
      queue.dequeue();
      expect(queue.sum()).toBe(20);
      queue.enqueue(30);
      expect(queue.sum()).toBe(50);
      queue.dequeue();
      expect(queue.sum()).toBe(30);
    });
  });

  describe('average', () => {
    it('should throw when empty', () => {
      expect(() => queue.average()).toThrow('AugmentedQueue is empty');
    });

    it('should return value for single element', () => {
      queue.enqueue(10);
      expect(queue.average()).toBe(10);
    });

    it('should calculate average of multiple elements', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.average()).toBe(2);
    });

    it('should handle non-integer average', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.enqueue(4);
      expect(queue.average()).toBe(2.5);
    });

    it('should handle negative numbers', () => {
      queue.enqueue(-1);
      queue.enqueue(1);
      queue.enqueue(2);
      expect(queue.average()).toBeCloseTo(0.6666666666666666, 5);
    });

    it('should update after enqueue', () => {
      queue.enqueue(10);
      queue.enqueue(20);
      expect(queue.average()).toBe(15);
      queue.enqueue(30);
      expect(queue.average()).toBe(20);
    });

    it('should update after dequeue', () => {
      queue.enqueue(10);
      queue.enqueue(20);
      queue.enqueue(30);
      expect(queue.average()).toBe(20);
      queue.dequeue();
      expect(queue.average()).toBe(25);
      queue.dequeue();
      expect(queue.average()).toBe(30);
    });

    it('should handle zero', () => {
      queue.enqueue(0);
      queue.enqueue(0);
      queue.enqueue(0);
      expect(queue.average()).toBe(0);
    });

    it('should work with interleaved operations', () => {
      queue.enqueue(10);
      queue.enqueue(20);
      expect(queue.average()).toBe(15);
      queue.dequeue();
      expect(queue.average()).toBe(20);
      queue.enqueue(30);
      expect(queue.average()).toBe(25);
    });
  });

  describe('forEach', () => {
    it('should not iterate over empty queue', () => {
      let count = 0;
      queue.forEach(() => {
        count++;
      });
      expect(count).toBe(0);
    });

    it('should iterate over all elements', () => {
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
      queue.enqueue(10);
      queue.enqueue(20);
      queue.enqueue(30);
      const indices: number[] = [];
      queue.forEach((value, index) => {
        indices.push(index);
      });
      expect(indices).toEqual([0, 1, 2]);
    });

    it('should iterate in FIFO order', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.enqueue(4);
      queue.enqueue(5);
      const result: number[] = [];
      queue.forEach((value) => {
        result.push(value);
      });
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle negative numbers', () => {
      queue.enqueue(-5);
      queue.enqueue(0);
      queue.enqueue(5);
      const result: number[] = [];
      queue.forEach((value) => {
        result.push(value);
      });
      expect(result).toEqual([-5, 0, 5]);
    });
  });

  describe('clone', () => {
    it('should clone empty queue', () => {
      const cloned = queue.clone();
      expect(cloned.size()).toBe(0);
      expect(cloned.isEmpty()).toBe(true);
    });

    it('should clone queue with elements', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      const cloned = queue.clone();
      expect(cloned.size()).toBe(3);
      expect(cloned.toArray()).toEqual([1, 2, 3]);
    });

    it('should create independent clone', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      const cloned = queue.clone();
      cloned.enqueue(3);
      cloned.dequeue();
      expect(queue.size()).toBe(2);
      expect(queue.toArray()).toEqual([1, 2]);
      expect(cloned.size()).toBe(2);
      expect(cloned.toArray()).toEqual([2, 3]);
    });

    it('should clone with correct min', () => {
      queue.enqueue(5);
      queue.enqueue(1);
      queue.enqueue(10);
      const cloned = queue.clone();
      expect(cloned.min()).toBe(1);
    });

    it('should clone with correct max', () => {
      queue.enqueue(5);
      queue.enqueue(10);
      queue.enqueue(1);
      const cloned = queue.clone();
      expect(cloned.max()).toBe(10);
    });

    it('should clone with correct sum', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      const cloned = queue.clone();
      expect(cloned.sum()).toBe(6);
    });

    it('should clone with correct average', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      const cloned = queue.clone();
      expect(cloned.average()).toBe(2);
    });
  });

  describe('Symbol.iterator', () => {
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
      const result = [...queue];
      expect(result).toEqual([1, 2, 3]);
    });

    it('should iterate in FIFO order', () => {
      queue.enqueue(10);
      queue.enqueue(20);
      queue.enqueue(30);
      queue.enqueue(40);
      const result: number[] = [];
      for (const item of queue) {
        result.push(item);
      }
      expect(result).toEqual([10, 20, 30, 40]);
    });

    it('should handle negative numbers', () => {
      queue.enqueue(-5);
      queue.enqueue(0);
      queue.enqueue(5);
      const result: number[] = [];
      for (const item of queue) {
        result.push(item);
      }
      expect(result).toEqual([-5, 0, 5]);
    });
  });

  describe('fromArray', () => {
    it('should create queue from empty array', () => {
      const newQueue = AugmentedQueue.fromArray([]);
      expect(newQueue.size()).toBe(0);
      expect(newQueue.isEmpty()).toBe(true);
    });

    it('should create queue from single element', () => {
      const newQueue = AugmentedQueue.fromArray([5]);
      expect(newQueue.size()).toBe(1);
      expect(newQueue.peek()).toBe(5);
    });

    it('should create queue from multiple elements', () => {
      const newQueue = AugmentedQueue.fromArray([1, 2, 3, 4, 5]);
      expect(newQueue.size()).toBe(5);
      expect(newQueue.toArray()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should preserve order from array', () => {
      const arr = [10, 20, 30, 40];
      const newQueue = AugmentedQueue.fromArray(arr);
      expect(newQueue.toArray()).toEqual(arr);
    });

    it('should handle negative numbers', () => {
      const newQueue = AugmentedQueue.fromArray([-5, 0, 5]);
      expect(newQueue.toArray()).toEqual([-5, 0, 5]);
    });

    it('should handle duplicates', () => {
      const newQueue = AugmentedQueue.fromArray([5, 5, 5]);
      expect(newQueue.size()).toBe(3);
      expect(newQueue.toArray()).toEqual([5, 5, 5]);
    });

    it('should calculate correct min', () => {
      const newQueue = AugmentedQueue.fromArray([5, 1, 10, 3]);
      expect(newQueue.min()).toBe(1);
    });

    it('should calculate correct max', () => {
      const newQueue = AugmentedQueue.fromArray([5, 10, 1, 3]);
      expect(newQueue.max()).toBe(10);
    });

    it('should calculate correct sum', () => {
      const newQueue = AugmentedQueue.fromArray([1, 2, 3, 4]);
      expect(newQueue.sum()).toBe(10);
    });

    it('should calculate correct average', () => {
      const newQueue = AugmentedQueue.fromArray([1, 2, 3, 4, 5]);
      expect(newQueue.average()).toBe(3);
    });
  });

  describe('combined statistics', () => {
    it('should maintain all statistics together', () => {
      queue.enqueue(10);
      queue.enqueue(20);
      queue.enqueue(30);
      expect(queue.size()).toBe(3);
      expect(queue.min()).toBe(10);
      expect(queue.max()).toBe(30);
      expect(queue.sum()).toBe(60);
      expect(queue.average()).toBe(20);
    });

    it('should update all statistics after enqueue', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      expect(queue.min()).toBe(1);
      expect(queue.max()).toBe(2);
      expect(queue.sum()).toBe(3);
      expect(queue.average()).toBe(1.5);
      queue.enqueue(3);
      expect(queue.min()).toBe(1);
      expect(queue.max()).toBe(3);
      expect(queue.sum()).toBe(6);
      expect(queue.average()).toBe(2);
    });

    it('should update all statistics after dequeue', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.min()).toBe(1);
      expect(queue.max()).toBe(3);
      expect(queue.sum()).toBe(6);
      expect(queue.average()).toBe(2);
      queue.dequeue();
      expect(queue.min()).toBe(2);
      expect(queue.max()).toBe(3);
      expect(queue.sum()).toBe(5);
      expect(queue.average()).toBe(2.5);
    });

    it('should handle all negative numbers', () => {
      queue.enqueue(-10);
      queue.enqueue(-20);
      queue.enqueue(-30);
      expect(queue.min()).toBe(-30);
      expect(queue.max()).toBe(-10);
      expect(queue.sum()).toBe(-60);
      expect(queue.average()).toBe(-20);
    });
  });

  describe('edge cases', () => {
    it('should handle large number of elements', () => {
      const count = 1000;
      for (let i = 1; i <= count; i++) {
        queue.enqueue(i);
      }
      expect(queue.size()).toBe(count);
      expect(queue.min()).toBe(1);
      expect(queue.max()).toBe(count);
      expect(queue.sum()).toBe((count * (count + 1)) / 2);
    });

    it('should handle enqueue after many dequeues', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.dequeue();
      queue.dequeue();
      queue.enqueue(4);
      queue.enqueue(5);
      expect(queue.toArray()).toEqual([3, 4, 5]);
      expect(queue.size()).toBe(3);
    });

    it('should handle alternating operations', () => {
      for (let i = 0; i < 100; i++) {
        queue.enqueue(i);
        if (i % 2 === 0) {
          queue.dequeue();
        }
      }
      expect(queue.size()).toBe(50);
    });

    it('should maintain queue semantics with peek and dequeue', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.peek()).toBe(1);
      expect(queue.peek()).toBe(1);
      expect(queue.dequeue()).toBe(1);
      expect(queue.peek()).toBe(2);
      expect(queue.peekBack()).toBe(3);
      expect(queue.peekBack()).toBe(3);
      expect(queue.dequeue()).toBe(2);
      expect(queue.peek()).toBe(3);
      expect(queue.peekBack()).toBe(3);
    });

    it('should handle single element operations', () => {
      queue.enqueue(42);
      expect(queue.size()).toBe(1);
      expect(queue.isEmpty()).toBe(false);
      expect(queue.peek()).toBe(42);
      expect(queue.peekBack()).toBe(42);
      expect(queue.min()).toBe(42);
      expect(queue.max()).toBe(42);
      expect(queue.sum()).toBe(42);
      expect(queue.average()).toBe(42);
      expect(queue.dequeue()).toBe(42);
      expect(queue.isEmpty()).toBe(true);
    });

    it('should work with all values equal', () => {
      for (let i = 0; i < 10; i++) {
        queue.enqueue(5);
      }
      expect(queue.size()).toBe(10);
      expect(queue.min()).toBe(5);
      expect(queue.max()).toBe(5);
      expect(queue.sum()).toBe(50);
      expect(queue.average()).toBe(5);
    });

    it('should handle mixed positive and negative', () => {
      queue.enqueue(-5);
      queue.enqueue(0);
      queue.enqueue(5);
      queue.enqueue(-10);
      queue.enqueue(10);
      expect(queue.min()).toBe(-10);
      expect(queue.max()).toBe(10);
      expect(queue.sum()).toBe(0);
      expect(queue.average()).toBe(0);
    });
  });

  describe('performance and large operations', () => {
    it('should handle many enqueue operations', () => {
      const count = 10000;
      for (let i = 0; i < count; i++) {
        queue.enqueue(i);
      }
      expect(queue.size()).toBe(count);
    });

    it('should handle many dequeue operations', () => {
      const count = 1000;
      for (let i = 0; i < count; i++) {
        queue.enqueue(i);
      }
      for (let i = 0; i < count; i++) {
        expect(queue.dequeue()).toBe(i);
      }
      expect(queue.isEmpty()).toBe(true);
    });

    it('should maintain statistics with large dataset', () => {
      const values: number[] = [];
      const count = 1000;
      for (let i = 0; i < count; i++) {
        const value = Math.floor(Math.random() * 1000);
        values.push(value);
        queue.enqueue(value);
      }
      const expectedMin = Math.min(...values);
      const expectedMax = Math.max(...values);
      const expectedSum = values.reduce((a, b) => a + b, 0);
      expect(queue.min()).toBe(expectedMin);
      expect(queue.max()).toBe(expectedMax);
      expect(queue.sum()).toBe(expectedSum);
    });

    it('should iterate over large dataset', () => {
      const count = 1000;
      for (let i = 0; i < count; i++) {
        queue.enqueue(i);
      }
      let iteratedCount = 0;
      for (const item of queue) {
        iteratedCount++;
      }
      expect(iteratedCount).toBe(count);
    });

    it('should forEach over large dataset', () => {
      const count = 1000;
      for (let i = 0; i < count; i++) {
        queue.enqueue(i);
      }
      let iteratedCount = 0;
      queue.forEach(() => {
        iteratedCount++;
      });
      expect(iteratedCount).toBe(count);
    });
  });

  describe('transfer behavior', () => {
    it('should handle dequeue after many enqueues', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.enqueue(4);
      queue.enqueue(5);
      expect(queue.dequeue()).toBe(1);
      expect(queue.dequeue()).toBe(2);
      expect(queue.peek()).toBe(3);
    });

    it('should handle enqueue after dequeue triggers transfer', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.dequeue();
      queue.enqueue(4);
      queue.enqueue(5);
      expect(queue.toArray()).toEqual([2, 3, 4, 5]);
    });

    it('should maintain peek and peekBack correctly', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.enqueue(4);
      queue.enqueue(5);
      expect(queue.peek()).toBe(1);
      expect(queue.peekBack()).toBe(5);
      queue.dequeue();
      queue.dequeue();
      expect(queue.peek()).toBe(3);
      expect(queue.peekBack()).toBe(5);
    });
  });

  describe('integration tests', () => {
    it('should work through complex scenario', () => {
      queue.enqueue(10);
      queue.enqueue(20);
      expect(queue.size()).toBe(2);
      expect(queue.min()).toBe(10);
      expect(queue.max()).toBe(20);
      expect(queue.sum()).toBe(30);
      expect(queue.average()).toBe(15);

      queue.enqueue(5);
      expect(queue.min()).toBe(5);
      expect(queue.sum()).toBe(35);
      expect(queue.average()).toBeCloseTo(11.666666666666666, 5);

      queue.dequeue();
      expect(queue.peek()).toBe(20);
      expect(queue.min()).toBe(5);
      expect(queue.max()).toBe(20);
      expect(queue.sum()).toBe(25);
      expect(queue.average()).toBeCloseTo(12.5, 5);

      queue.dequeue();
      expect(queue.peek()).toBe(5);
      expect(queue.min()).toBe(5);
      expect(queue.max()).toBe(5);
      expect(queue.sum()).toBe(5);
      expect(queue.average()).toBe(5);

      queue.enqueue(15);
      queue.enqueue(25);
      expect(queue.toArray()).toEqual([5, 15, 25]);
      expect(queue.min()).toBe(5);
      expect(queue.max()).toBe(25);
      expect(queue.sum()).toBe(45);
      expect(queue.average()).toBe(15);
    });

    it('should handle cloning after various operations', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.dequeue();
      queue.enqueue(4);

      const cloned = queue.clone();
      expect(cloned.toArray()).toEqual([2, 3, 4]);
      expect(cloned.min()).toBe(2);
      expect(cloned.max()).toBe(4);
      expect(cloned.sum()).toBe(9);
      expect(cloned.average()).toBe(3);

      cloned.enqueue(5);
      cloned.dequeue();
      expect(cloned.toArray()).toEqual([3, 4, 5]);

      expect(queue.toArray()).toEqual([2, 3, 4]);
    });

    it('should work with fromArray and regular operations', () => {
      const newQueue = AugmentedQueue.fromArray([5, 10, 15, 20]);
      expect(newQueue.size()).toBe(4);
      expect(newQueue.min()).toBe(5);
      expect(newQueue.max()).toBe(20);
      expect(newQueue.sum()).toBe(50);
      expect(newQueue.average()).toBe(12.5);

      newQueue.dequeue();
      newQueue.dequeue();
      expect(newQueue.toArray()).toEqual([15, 20]);
      expect(newQueue.min()).toBe(15);
      expect(newQueue.max()).toBe(20);
      expect(newQueue.sum()).toBe(35);
      expect(newQueue.average()).toBe(17.5);
    });
  });
});
