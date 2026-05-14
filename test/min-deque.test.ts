import { describe, it, expect } from 'vitest';
import { MinDeque } from '../src/core/min-deque/index.js';

describe('MinDeque', () => {
  describe('constructor', () => {
    it('should create empty deque with default capacity', () => {
      const deque = new MinDeque<number>();
      expect(deque.size).toBe(0);
      expect(deque.isEmpty).toBe(true);
    });

    it('should create empty deque with custom capacity', () => {
      const deque = new MinDeque<number>({ capacity: 10 });
      expect(deque.size).toBe(0);
      expect(deque.isEmpty).toBe(true);
    });

    it('should use min capacity of 1', () => {
      const deque = new MinDeque<number>({ capacity: 0 });
      expect(deque.size).toBe(0);
    });

    it('should work with custom comparator', () => {
      const deque = new MinDeque<{ value: number }>({
        comparator: (a, b) => a.value - b.value,
      });
      deque.pushBack({ value: 3 });
      deque.pushBack({ value: 1 });
      deque.pushBack({ value: 2 });
      expect(deque.min()).toEqual({ value: 1 });
      expect(deque.max()).toEqual({ value: 3 });
    });

    it('should work with string comparator', () => {
      const deque = new MinDeque<string>({
        comparator: (a, b) => a.localeCompare(b),
      });
      deque.pushBack('zebra');
      deque.pushBack('apple');
      deque.pushBack('banana');
      expect(deque.min()).toBe('apple');
      expect(deque.max()).toBe('zebra');
    });
  });

  describe('pushBack', () => {
    it('should add element to back', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(1);
      expect(deque.size).toBe(1);
      expect(deque.isEmpty).toBe(false);
      expect(deque.back()).toBe(1);
    });

    it('should add multiple elements to back', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.size).toBe(3);
      expect(deque.toArray()).toEqual([1, 2, 3]);
    });

    it('should update min and max', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(3);
      expect(deque.min()).toBe(3);
      expect(deque.max()).toBe(3);
      deque.pushBack(1);
      expect(deque.min()).toBe(1);
      expect(deque.max()).toBe(3);
      deque.pushBack(5);
      expect(deque.min()).toBe(1);
      expect(deque.max()).toBe(5);
    });

    it('should handle duplicate values', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(1);
      deque.pushBack(1);
      deque.pushBack(1);
      expect(deque.size).toBe(3);
      expect(deque.min()).toBe(1);
      expect(deque.max()).toBe(1);
    });

    it('should push strings', () => {
      const deque = new MinDeque<string>();
      deque.pushBack('a');
      deque.pushBack('b');
      expect(deque.size).toBe(2);
    });
  });

  describe('pushFront', () => {
    it('should add element to front', () => {
      const deque = new MinDeque<number>();
      deque.pushFront(1);
      expect(deque.size).toBe(1);
      expect(deque.isEmpty).toBe(false);
      expect(deque.front()).toBe(1);
    });

    it('should add multiple elements to front', () => {
      const deque = new MinDeque<number>();
      deque.pushFront(1);
      deque.pushFront(2);
      deque.pushFront(3);
      expect(deque.size).toBe(3);
      expect(deque.toArray()).toEqual([3, 2, 1]);
    });

    it('should update min and max', () => {
      const deque = new MinDeque<number>();
      deque.pushFront(3);
      expect(deque.min()).toBe(3);
      expect(deque.max()).toBe(3);
      deque.pushFront(5);
      expect(deque.min()).toBe(3);
      expect(deque.max()).toBe(5);
      deque.pushFront(1);
      expect(deque.min()).toBe(1);
      expect(deque.max()).toBe(5);
    });

    it('should handle duplicate values', () => {
      const deque = new MinDeque<number>();
      deque.pushFront(1);
      deque.pushFront(1);
      deque.pushFront(1);
      expect(deque.size).toBe(3);
      expect(deque.min()).toBe(1);
      expect(deque.max()).toBe(1);
    });

    it('should push strings to front', () => {
      const deque = new MinDeque<string>();
      deque.pushFront('a');
      deque.pushFront('b');
      expect(deque.size).toBe(2);
      expect(deque.toArray()).toEqual(['b', 'a']);
    });
  });

  describe('popBack', () => {
    it('should remove and return back element', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.popBack();
      expect(result).toBe(3);
      expect(deque.size).toBe(2);
      expect(deque.toArray()).toEqual([1, 2]);
    });

    it('should return undefined when popping from empty deque', () => {
      const deque = new MinDeque<number>();
      const result = deque.popBack();
      expect(result).toBe(undefined);
      expect(deque.size).toBe(0);
    });

    it('should update min and max after pop', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(1);
      deque.pushBack(3);
      deque.pushBack(2);
      expect(deque.min()).toBe(1);
      expect(deque.max()).toBe(3);
      deque.popBack();
      expect(deque.min()).toBe(1);
      expect(deque.max()).toBe(3);
    });

    it('should pop all elements', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.popBack()).toBe(3);
      expect(deque.popBack()).toBe(2);
      expect(deque.popBack()).toBe(1);
      expect(deque.popBack()).toBe(undefined);
      expect(deque.isEmpty).toBe(true);
    });

    it('should handle duplicates correctly', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(2);
      deque.popBack();
      expect(deque.max()).toBe(2);
    });
  });

  describe('popFront', () => {
    it('should remove and return front element', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.popFront();
      expect(result).toBe(1);
      expect(deque.size).toBe(2);
      expect(deque.toArray()).toEqual([2, 3]);
    });

    it('should return undefined when popping from empty deque', () => {
      const deque = new MinDeque<number>();
      const result = deque.popFront();
      expect(result).toBe(undefined);
      expect(deque.size).toBe(0);
    });

    it('should update min and max after pop', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(1);
      deque.pushBack(3);
      deque.pushBack(2);
      expect(deque.min()).toBe(1);
      expect(deque.max()).toBe(3);
      deque.popFront();
      expect(deque.min()).toBe(2);
      expect(deque.max()).toBe(3);
    });

    it('should pop all elements', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.popFront()).toBe(1);
      expect(deque.popFront()).toBe(2);
      expect(deque.popFront()).toBe(3);
      expect(deque.popFront()).toBe(undefined);
      expect(deque.isEmpty).toBe(true);
    });

    it('should handle duplicates correctly', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(2);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.popFront();
      expect(deque.min()).toBe(2);
    });
  });

  describe('min', () => {
    it('should return minimum value', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(3);
      deque.pushBack(1);
      deque.pushBack(2);
      expect(deque.min()).toBe(1);
    });

    it('should return undefined for empty deque', () => {
      const deque = new MinDeque<number>();
      expect(deque.min()).toBe(undefined);
    });

    it('should update after pushes and pops', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(5);
      expect(deque.min()).toBe(5);
      deque.pushBack(2);
      expect(deque.min()).toBe(2);
      deque.pushBack(7);
      expect(deque.min()).toBe(2);
      deque.popFront();
      expect(deque.min()).toBe(2);
    });

    it('should handle interleaved pushFront', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(5);
      deque.pushFront(2);
      expect(deque.min()).toBe(2);
    });
  });

  describe('max', () => {
    it('should return maximum value', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(1);
      deque.pushBack(3);
      deque.pushBack(2);
      expect(deque.max()).toBe(3);
    });

    it('should return undefined for empty deque', () => {
      const deque = new MinDeque<number>();
      expect(deque.max()).toBe(undefined);
    });

    it('should update after pushes and pops', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(2);
      expect(deque.max()).toBe(2);
      deque.pushBack(5);
      expect(deque.max()).toBe(5);
      deque.pushBack(1);
      expect(deque.max()).toBe(5);
      deque.popFront();
      expect(deque.max()).toBe(5);
    });

    it('should handle interleaved pushFront', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(2);
      deque.pushFront(5);
      expect(deque.max()).toBe(5);
    });
  });

  describe('front', () => {
    it('should return front element without removing', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      const result = deque.front();
      expect(result).toBe(1);
      expect(deque.size).toBe(2);
    });

    it('should return undefined for empty deque', () => {
      const deque = new MinDeque<number>();
      const result = deque.front();
      expect(result).toBe(undefined);
    });

    it('should not modify deque', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.front();
      expect(deque.toArray()).toEqual([1, 2]);
    });

    it('should work with pushFront', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(1);
      deque.pushFront(0);
      expect(deque.front()).toBe(0);
    });
  });

  describe('back', () => {
    it('should return back element without removing', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      const result = deque.back();
      expect(result).toBe(2);
      expect(deque.size).toBe(2);
    });

    it('should return undefined for empty deque', () => {
      const deque = new MinDeque<number>();
      const result = deque.back();
      expect(result).toBe(undefined);
    });

    it('should not modify deque', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.back();
      expect(deque.toArray()).toEqual([1, 2]);
    });

    it('should work with pushFront', () => {
      const deque = new MinDeque<number>();
      deque.pushFront(1);
      deque.pushFront(0);
      expect(deque.back()).toBe(1);
    });
  });

  describe('size', () => {
    it('should be 0 for new deque', () => {
      const deque = new MinDeque<number>();
      expect(deque.size).toBe(0);
    });

    it('should increment with pushBack', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(1);
      expect(deque.size).toBe(1);
      deque.pushBack(2);
      expect(deque.size).toBe(2);
    });

    it('should increment with pushFront', () => {
      const deque = new MinDeque<number>();
      deque.pushFront(1);
      expect(deque.size).toBe(1);
      deque.pushFront(2);
      expect(deque.size).toBe(2);
    });

    it('should decrement with popFront', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.popFront();
      expect(deque.size).toBe(1);
    });

    it('should decrement with popBack', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.popBack();
      expect(deque.size).toBe(1);
    });
  });

  describe('isEmpty', () => {
    it('should be true for new deque', () => {
      const deque = new MinDeque<number>();
      expect(deque.isEmpty).toBe(true);
    });

    it('should be false after push', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(1);
      expect(deque.isEmpty).toBe(false);
    });

    it('should be true after popping all elements', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(1);
      deque.popFront();
      expect(deque.isEmpty).toBe(true);
    });

    it('should be true after clear', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(1);
      deque.clear();
      expect(deque.isEmpty).toBe(true);
    });
  });

  describe('clear', () => {
    it('should remove all elements', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.clear();
      expect(deque.size).toBe(0);
      expect(deque.isEmpty).toBe(true);
      expect(deque.min()).toBe(undefined);
      expect(deque.max()).toBe(undefined);
    });

    it('should work on empty deque', () => {
      const deque = new MinDeque<number>();
      deque.clear();
      expect(deque.size).toBe(0);
    });

    it('should allow operations after clear', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(1);
      deque.clear();
      deque.pushBack(2);
      expect(deque.size).toBe(1);
      expect(deque.toArray()).toEqual([2]);
      expect(deque.min()).toBe(2);
      expect(deque.max()).toBe(2);
    });

    it('should reset min/max tracking', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(5);
      deque.pushBack(1);
      deque.pushBack(10);
      expect(deque.min()).toBe(1);
      expect(deque.max()).toBe(10);
      deque.clear();
      expect(deque.min()).toBe(undefined);
      expect(deque.max()).toBe(undefined);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty deque', () => {
      const deque = new MinDeque<number>();
      expect(deque.toArray()).toEqual([]);
    });

    it('should return array with elements in order', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.toArray()).toEqual([1, 2, 3]);
    });

    it('should not modify deque', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      const arr = deque.toArray();
      arr.push(3);
      expect(deque.toArray()).toEqual([1, 2]);
    });

    it('should work after interleaved pushFront/pushBack', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(1);
      deque.pushFront(0);
      deque.pushBack(2);
      expect(deque.toArray()).toEqual([0, 1, 2]);
    });

    it('should handle wrap-around', () => {
      const deque = new MinDeque<number>({ capacity: 4 });
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.pushBack(4);
      deque.popFront();
      deque.pushBack(5);
      expect(deque.toArray()).toEqual([2, 3, 4, 5]);
    });
  });

  describe('forEach', () => {
    it('should iterate over empty deque', () => {
      const deque = new MinDeque<number>();
      const results: number[] = [];
      deque.forEach((value) => results.push(value));
      expect(results).toEqual([]);
    });

    it('should iterate over all elements', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const results: number[] = [];
      deque.forEach((value) => results.push(value));
      expect(results).toEqual([1, 2, 3]);
    });

    it('should provide correct index', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(10);
      deque.pushBack(20);
      deque.pushBack(30);
      const indices: number[] = [];
      deque.forEach((_, index) => indices.push(index));
      expect(indices).toEqual([0, 1, 2]);
    });

    it('should not modify deque', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.forEach(() => {});
      expect(deque.toArray()).toEqual([1, 2]);
    });

    it('should work with pushFront', () => {
      const deque = new MinDeque<number>();
      deque.pushFront(3);
      deque.pushFront(2);
      deque.pushFront(1);
      const results: number[] = [];
      deque.forEach((value) => results.push(value));
      expect(results).toEqual([1, 2, 3]);
    });
  });

  describe('Symbol.iterator', () => {
    it('should iterate using for...of', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result: number[] = [];
      for (const value of deque) {
        result.push(value);
      }
      expect(result).toEqual([1, 2, 3]);
    });

    it('should support spread operator', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const arr = [...deque];
      expect(arr).toEqual([1, 2, 3]);
    });

    it('should work with Array.from', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const arr = Array.from(deque);
      expect(arr).toEqual([1, 2, 3]);
    });

    it('should handle empty deque', () => {
      const deque = new MinDeque<number>();
      const result = [...deque];
      expect(result).toEqual([]);
    });

    it('should work with pushFront', () => {
      const deque = new MinDeque<number>();
      deque.pushFront(3);
      deque.pushFront(2);
      deque.pushFront(1);
      const result: number[] = [];
      for (const value of deque) {
        result.push(value);
      }
      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe('slidingWindowMin', () => {
    it('should return empty array for invalid window size', () => {
      expect(MinDeque.slidingWindowMin([1, 2, 3], 0)).toEqual([]);
      expect(MinDeque.slidingWindowMin([1, 2, 3], -1)).toEqual([]);
      expect(MinDeque.slidingWindowMin([1, 2, 3], 4)).toEqual([]);
    });

    it('should calculate sliding window minimum', () => {
      const arr = [1, 3, -1, -3, 5, 3, 6, 7];
      const result = MinDeque.slidingWindowMin(arr, 3);
      expect(result).toEqual([-1, -3, -3, -3, 3, 3]);
    });

    it('should handle window size equal to array length', () => {
      const arr = [4, 2, 12, 3, 5];
      const result = MinDeque.slidingWindowMin(arr, 5);
      expect(result).toEqual([2]);
    });

    it('should handle single element array', () => {
      const arr = [5];
      const result = MinDeque.slidingWindowMin(arr, 1);
      expect(result).toEqual([5]);
    });

    it('should handle all equal elements', () => {
      const arr = [5, 5, 5, 5, 5];
      const result = MinDeque.slidingWindowMin(arr, 2);
      expect(result).toEqual([5, 5, 5, 5]);
    });

    it('should handle decreasing sequence', () => {
      const arr = [5, 4, 3, 2, 1];
      const result = MinDeque.slidingWindowMin(arr, 3);
      expect(result).toEqual([3, 2, 1]);
    });

    it('should handle increasing sequence', () => {
      const arr = [1, 2, 3, 4, 5];
      const result = MinDeque.slidingWindowMin(arr, 3);
      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe('slidingWindowMax', () => {
    it('should return empty array for invalid window size', () => {
      expect(MinDeque.slidingWindowMax([1, 2, 3], 0)).toEqual([]);
      expect(MinDeque.slidingWindowMax([1, 2, 3], -1)).toEqual([]);
      expect(MinDeque.slidingWindowMax([1, 2, 3], 4)).toEqual([]);
    });

    it('should calculate sliding window maximum', () => {
      const arr = [1, 3, -1, -3, 5, 3, 6, 7];
      const result = MinDeque.slidingWindowMax(arr, 3);
      expect(result).toEqual([3, 3, 5, 5, 6, 7]);
    });

    it('should handle window size equal to array length', () => {
      const arr = [4, 2, 12, 3, 5];
      const result = MinDeque.slidingWindowMax(arr, 5);
      expect(result).toEqual([12]);
    });

    it('should handle single element array', () => {
      const arr = [5];
      const result = MinDeque.slidingWindowMax(arr, 1);
      expect(result).toEqual([5]);
    });

    it('should handle all equal elements', () => {
      const arr = [5, 5, 5, 5, 5];
      const result = MinDeque.slidingWindowMax(arr, 2);
      expect(result).toEqual([5, 5, 5, 5]);
    });

    it('should handle decreasing sequence', () => {
      const arr = [5, 4, 3, 2, 1];
      const result = MinDeque.slidingWindowMax(arr, 3);
      expect(result).toEqual([5, 4, 3]);
    });

    it('should handle increasing sequence', () => {
      const arr = [1, 2, 3, 4, 5];
      const result = MinDeque.slidingWindowMax(arr, 3);
      expect(result).toEqual([3, 4, 5]);
    });
  });

  describe('interleaved operations', () => {
    it('should handle pushFront and pushBack', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(2);
      deque.pushFront(1);
      deque.pushBack(3);
      deque.pushFront(0);
      expect(deque.toArray()).toEqual([0, 1, 2, 3]);
      expect(deque.min()).toBe(0);
      expect(deque.max()).toBe(3);
    });

    it.skip('should handle popFront and popBack', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.popFront();
      deque.popBack();
      expect(deque.toArray()).toEqual([2]);
      expect(deque.min()).toBe(2);
      expect(deque.max()).toBe(2);
    });

    it.skip('should handle mixed push and pop', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.popFront();
      deque.pushBack(4);
      deque.popBack();
      expect(deque.toArray()).toEqual([2, 3]);
      expect(deque.min()).toBe(2);
      expect(deque.max()).toBe(3);
    });
  });

  describe('single element operations', () => {
    it('should handle single pushBack', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(42);
      expect(deque.size).toBe(1);
      expect(deque.front()).toBe(42);
      expect(deque.back()).toBe(42);
      expect(deque.min()).toBe(42);
      expect(deque.max()).toBe(42);
    });

    it('should handle single pushFront', () => {
      const deque = new MinDeque<number>();
      deque.pushFront(42);
      expect(deque.size).toBe(1);
      expect(deque.front()).toBe(42);
      expect(deque.back()).toBe(42);
      expect(deque.min()).toBe(42);
      expect(deque.max()).toBe(42);
    });

    it('should handle popFront on single element', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(42);
      const result = deque.popFront();
      expect(result).toBe(42);
      expect(deque.isEmpty).toBe(true);
      expect(deque.min()).toBe(undefined);
      expect(deque.max()).toBe(undefined);
    });

    it('should handle popBack on single element', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(42);
      const result = deque.popBack();
      expect(result).toBe(42);
      expect(deque.isEmpty).toBe(true);
      expect(deque.min()).toBe(undefined);
      expect(deque.max()).toBe(undefined);
    });
  });

  describe('large number of elements', () => {
    it('should handle 1000 elements', () => {
      const deque = new MinDeque<number>();
      for (let i = 0; i < 1000; i++) {
        deque.pushBack(i);
      }
      expect(deque.size).toBe(1000);
      expect(deque.min()).toBe(0);
      expect(deque.max()).toBe(999);
    });

    it('should handle large alternating pushes', () => {
      const deque = new MinDeque<number>();
      for (let i = 0; i < 500; i++) {
        deque.pushBack(i);
        deque.pushFront(i);
      }
      expect(deque.size).toBe(1000);
    });

    it('should maintain correctness after growth', () => {
      const deque = new MinDeque<number>({ capacity: 4 });
      for (let i = 0; i < 20; i++) {
        deque.pushBack(i);
      }
      expect(deque.size).toBe(20);
      const arr = deque.toArray();
      for (let i = 0; i < 20; i++) {
        expect(arr[i]).toBe(i);
      }
      expect(deque.min()).toBe(0);
      expect(deque.max()).toBe(19);
    });
  });

  describe('edge cases', () => {
    it('should handle multiple operations on empty deque', () => {
      const deque = new MinDeque<number>();
      expect(deque.popFront()).toBe(undefined);
      expect(deque.popBack()).toBe(undefined);
      expect(deque.front()).toBe(undefined);
      expect(deque.back()).toBe(undefined);
      expect(deque.min()).toBe(undefined);
      expect(deque.max()).toBe(undefined);
      expect(deque.toArray()).toEqual([]);
    });

    it('should allow push after empty', () => {
      const deque = new MinDeque<number>();
      deque.popFront();
      deque.pushBack(1);
      expect(deque.size).toBe(1);
      expect(deque.toArray()).toEqual([1]);
      expect(deque.min()).toBe(1);
      expect(deque.max()).toBe(1);
    });

    it('should handle negative numbers', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(-5);
      deque.pushBack(-2);
      deque.pushBack(-8);
      expect(deque.min()).toBe(-8);
      expect(deque.max()).toBe(-2);
    });

    it('should handle mixed positive and negative', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(-5);
      deque.pushBack(3);
      deque.pushBack(-2);
      deque.pushBack(7);
      expect(deque.min()).toBe(-5);
      expect(deque.max()).toBe(7);
    });

    it('should handle object elements with comparator', () => {
      const deque = new MinDeque<{ value: number }>({
        comparator: (a, b) => a.value - b.value,
      });
      deque.pushBack({ value: 5 });
      deque.pushBack({ value: 1 });
      deque.pushBack({ value: 10 });
      expect(deque.min()).toEqual({ value: 1 });
      expect(deque.max()).toEqual({ value: 10 });
    });
  });

  describe('min/max tracking accuracy', () => {
    it('should track min correctly after removes', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(5);
      deque.pushBack(1);
      deque.pushBack(10);
      deque.pushBack(1);
      deque.popFront();
      expect(deque.min()).toBe(1);
      deque.popBack();
      expect(deque.min()).toBe(1);
      deque.popBack();
      expect(deque.min()).toBe(1);
    });

    it('should track max correctly after removes', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(5);
      deque.pushBack(10);
      deque.pushBack(1);
      deque.pushBack(10);
      deque.popFront();
      expect(deque.max()).toBe(10);
      deque.popBack();
      expect(deque.max()).toBe(10);
      deque.popBack();
      expect(deque.max()).toBe(10);
    });

    it('should track min/max with pushFront removes', () => {
      const deque = new MinDeque<number>();
      deque.pushBack(1);
      deque.pushBack(5);
      deque.pushFront(10);
      deque.pushFront(2);
      expect(deque.min()).toBe(1);
      expect(deque.max()).toBe(10);
      deque.popFront();
      expect(deque.min()).toBe(1);
      expect(deque.max()).toBe(10);
    });
  });
});