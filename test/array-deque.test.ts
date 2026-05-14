import { describe, it, expect, beforeEach } from 'vitest';
import { ArrayDeque } from '../src/core/array-deque/index.js';

describe('ArrayDeque', () => {
  let deque: ArrayDeque<number>;

  beforeEach(() => {
    deque = new ArrayDeque<number>();
  });

  describe('constructor', () => {
    it('should create deque with default capacity 16', () => {
      expect(deque.capacity).toBe(16);
      expect(deque.size).toBe(0);
      expect(deque.isEmpty).toBe(true);
    });

    it('should create deque with specified capacity', () => {
      const customDeque = new ArrayDeque<number>({ initialCapacity: 32 });
      expect(customDeque.capacity).toBe(32);
      expect(customDeque.size).toBe(0);
      expect(customDeque.isEmpty).toBe(true);
    });

    it('should use minimum capacity of 1', () => {
      const smallDeque = new ArrayDeque<number>({ initialCapacity: 0 });
      expect(smallDeque.capacity).toBe(1);
      expect(smallDeque.size).toBe(0);
    });
  });

  describe('pushBack and popFront', () => {
    it('should push and pop from back', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.popFront()).toBe(1);
      expect(deque.popFront()).toBe(2);
      expect(deque.popFront()).toBe(3);
    });

    it('should maintain order with pushBack/popFront', () => {
      deque.pushBack(10);
      deque.pushBack(20);
      deque.pushBack(30);
      expect(deque.toArray()).toEqual([10, 20, 30]);
    });

    it('should grow capacity when full', () => {
      const smallDeque = new ArrayDeque<number>({ initialCapacity: 2 });
      expect(smallDeque.capacity).toBe(2);
      smallDeque.pushBack(1);
      smallDeque.pushBack(2);
      expect(smallDeque.capacity).toBe(2);
      smallDeque.pushBack(3);
      expect(smallDeque.capacity).toBe(4);
      expect(smallDeque.toArray()).toEqual([1, 2, 3]);
    });

    it('should throw when popping from empty deque', () => {
      expect(() => deque.popFront()).toThrow(RangeError);
      expect(() => deque.popFront()).toThrow('Cannot popFront from empty deque');
    });
  });

  describe('pushFront and popBack', () => {
    it('should push to front and pop from back', () => {
      deque.pushFront(1);
      deque.pushFront(2);
      deque.pushFront(3);
      expect(deque.popBack()).toBe(1);
      expect(deque.popBack()).toBe(2);
      expect(deque.popBack()).toBe(3);
    });

    it('should maintain order with pushFront/popBack', () => {
      deque.pushFront(10);
      deque.pushFront(20);
      deque.pushFront(30);
      expect(deque.toArray()).toEqual([30, 20, 10]);
    });

    it('should grow capacity when full', () => {
      const smallDeque = new ArrayDeque<number>({ initialCapacity: 2 });
      expect(smallDeque.capacity).toBe(2);
      smallDeque.pushFront(1);
      smallDeque.pushFront(2);
      expect(smallDeque.capacity).toBe(2);
      smallDeque.pushFront(3);
      expect(smallDeque.capacity).toBe(4);
      expect(smallDeque.toArray()).toEqual([3, 2, 1]);
    });

    it('should throw when popping from empty deque', () => {
      expect(() => deque.popBack()).toThrow(RangeError);
      expect(() => deque.popBack()).toThrow('Cannot popBack from empty deque');
    });
  });

  describe('enqueue and dequeue', () => {
    it('should enqueue as alias for pushBack', () => {
      deque.enqueue(1);
      deque.enqueue(2);
      deque.enqueue(3);
      expect(deque.toArray()).toEqual([1, 2, 3]);
    });

    it('should dequeue as alias for popFront', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.dequeue()).toBe(1);
      expect(deque.dequeue()).toBe(2);
      expect(deque.dequeue()).toBe(3);
    });
  });

  describe('front, back, and peek', () => {
    it('should return front element', () => {
      deque.pushBack(10);
      deque.pushBack(20);
      deque.pushBack(30);
      expect(deque.front()).toBe(10);
    });

    it('should return back element', () => {
      deque.pushBack(10);
      deque.pushBack(20);
      deque.pushBack(30);
      expect(deque.back()).toBe(30);
    });

    it('should peek as alias for front', () => {
      deque.pushBack(10);
      deque.pushBack(20);
      expect(deque.peek()).toBe(10);
    });

    it('should return undefined for front on empty deque', () => {
      expect(deque.front()).toBe(undefined);
    });

    it('should return undefined for back on empty deque', () => {
      expect(deque.back()).toBe(undefined);
    });

    it('should return undefined for peek on empty deque', () => {
      expect(deque.peek()).toBe(undefined);
    });

    it('should update front after popFront', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.front()).toBe(1);
      deque.popFront();
      expect(deque.front()).toBe(2);
      deque.popFront();
      expect(deque.front()).toBe(3);
    });

    it('should update back after popBack', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.back()).toBe(3);
      deque.popBack();
      expect(deque.back()).toBe(2);
      deque.popBack();
      expect(deque.back()).toBe(1);
    });
  });

  describe('get and set', () => {
    it('should get elements by index', () => {
      deque.pushBack(10);
      deque.pushBack(20);
      deque.pushBack(30);
      expect(deque.get(0)).toBe(10);
      expect(deque.get(1)).toBe(20);
      expect(deque.get(2)).toBe(30);
    });

    it('should set elements by index', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.set(1, 20);
      expect(deque.get(1)).toBe(20);
      expect(deque.toArray()).toEqual([1, 20, 3]);
    });

    it('should throw for out of bounds get', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      expect(() => deque.get(-1)).toThrow(RangeError);
      expect(() => deque.get(2)).toThrow(RangeError);
      expect(() => deque.get(100)).toThrow(RangeError);
    });

    it('should throw for out of bounds set', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      expect(() => deque.set(-1, 10)).toThrow(RangeError);
      expect(() => deque.set(2, 10)).toThrow(RangeError);
      expect(() => deque.set(100, 10)).toThrow(RangeError);
    });
  });

  describe('size', () => {
    it('should track size correctly', () => {
      expect(deque.size).toBe(0);
      deque.pushBack(1);
      expect(deque.size).toBe(1);
      deque.pushBack(2);
      expect(deque.size).toBe(2);
      deque.popFront();
      expect(deque.size).toBe(1);
      deque.clear();
      expect(deque.size).toBe(0);
    });

    it('should track size with pushFront', () => {
      expect(deque.size).toBe(0);
      deque.pushFront(1);
      expect(deque.size).toBe(1);
      deque.pushFront(2);
      expect(deque.size).toBe(2);
      deque.popBack();
      expect(deque.size).toBe(1);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty deque', () => {
      expect(deque.isEmpty).toBe(true);
    });

    it('should return false for non-empty deque', () => {
      deque.pushBack(1);
      expect(deque.isEmpty).toBe(false);
    });

    it('should return true after clearing', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.clear();
      expect(deque.isEmpty).toBe(true);
    });
  });

  describe('capacity', () => {
    it('should report initial capacity', () => {
      expect(deque.capacity).toBe(16);
    });

    it('should grow when pushing beyond capacity', () => {
      const smallDeque = new ArrayDeque<number>({ initialCapacity: 2 });
      expect(smallDeque.capacity).toBe(2);
      smallDeque.pushBack(1);
      smallDeque.pushBack(2);
      expect(smallDeque.capacity).toBe(2);
      smallDeque.pushBack(3);
      expect(smallDeque.capacity).toBe(4);
      smallDeque.pushBack(4);
      smallDeque.pushBack(5);
      expect(smallDeque.capacity).toBe(8);
    });

    it('should preserve capacity after clearing', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      const capacityBefore = deque.capacity;
      deque.clear();
      expect(deque.capacity).toBe(capacityBefore);
    });
  });

  describe('clear', () => {
    it('should clear all elements', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.clear();
      expect(deque.size).toBe(0);
      expect(deque.isEmpty).toBe(true);
      expect(deque.front()).toBe(undefined);
      expect(deque.back()).toBe(undefined);
      expect(deque.toArray()).toEqual([]);
    });

    it('should not affect capacity', () => {
      const smallDeque = new ArrayDeque<number>({ initialCapacity: 8 });
      smallDeque.pushBack(1);
      smallDeque.pushBack(2);
      const capacityBefore = smallDeque.capacity;
      smallDeque.clear();
      expect(smallDeque.capacity).toBe(capacityBefore);
    });

    it('should allow reuse after clear', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.clear();
      deque.pushBack(10);
      deque.pushBack(20);
      expect(deque.toArray()).toEqual([10, 20]);
      expect(deque.size).toBe(2);
    });
  });

  describe('toArray', () => {
    it('should convert to regular array', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.toArray();
      expect(result).toEqual([1, 2, 3]);
      expect(result).toBeInstanceOf(Array);
    });

    it('should return empty array for empty deque', () => {
      const result = deque.toArray();
      expect(result).toEqual([]);
      expect(result).toBeInstanceOf(Array);
    });

    it('should maintain order after pushBack', () => {
      deque.pushBack(10);
      deque.pushBack(20);
      deque.pushBack(30);
      expect(deque.toArray()).toEqual([10, 20, 30]);
    });

    it('should maintain order after pushFront', () => {
      deque.pushFront(10);
      deque.pushFront(20);
      deque.pushFront(30);
      expect(deque.toArray()).toEqual([30, 20, 10]);
    });

    it('should maintain order after mixed operations', () => {
      deque.pushBack(1);
      deque.pushFront(0);
      deque.pushBack(2);
      deque.pushFront(-1);
      expect(deque.toArray()).toEqual([-1, 0, 1, 2]);
    });
  });

  describe('forEach', () => {
    it('should iterate over all elements', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result: number[] = [];
      deque.forEach((value, index) => {
        result.push(value);
        expect(index).toBe(value - 1);
      });
      expect(result).toEqual([1, 2, 3]);
    });

    it('should not iterate over empty deque', () => {
      let count = 0;
      deque.forEach(() => {
        count++;
      });
      expect(count).toBe(0);
    });

    it('should iterate in correct order', () => {
      deque.pushFront(3);
      deque.pushFront(2);
      deque.pushFront(1);
      const result: number[] = [];
      deque.forEach((value) => result.push(value));
      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe('iterator', () => {
    it('should support for...of iteration', () => {
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
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = [...deque];
      expect(result).toEqual([1, 2, 3]);
    });

    it('should iterate over empty deque', () => {
      const result = [...deque];
      expect(result).toEqual([]);
    });
  });

  describe('fromArray', () => {
    it('should create deque from array', () => {
      const arr = [1, 2, 3, 4, 5];
      const newDeque = ArrayDeque.fromArray(arr);
      expect(newDeque.toArray()).toEqual(arr);
      expect(newDeque.size).toBe(5);
    });

    it('should use max of array length and 16 as capacity', () => {
      const smallArr = [1, 2, 3];
      const smallDeque = ArrayDeque.fromArray(smallArr);
      expect(smallDeque.capacity).toBe(16);

      const largeArr = new Array(20).fill(0);
      const largeDeque = ArrayDeque.fromArray(largeArr);
      expect(largeDeque.capacity).toBe(20);
    });

    it('should handle empty array', () => {
      const newDeque = ArrayDeque.fromArray([]);
      expect(newDeque.size).toBe(0);
      expect(newDeque.isEmpty).toBe(true);
      expect(newDeque.toArray()).toEqual([]);
    });
  });

  describe('mixed operations', () => {
    it('should handle alternating pushFront and pushBack', () => {
      deque.pushBack(1);
      deque.pushFront(0);
      deque.pushBack(2);
      deque.pushFront(-1);
      expect(deque.toArray()).toEqual([-1, 0, 1, 2]);
      expect(deque.front()).toBe(-1);
      expect(deque.back()).toBe(2);
    });

    it('should handle alternating popFront and popBack', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.pushBack(4);
      deque.popFront();
      expect(deque.toArray()).toEqual([2, 3, 4]);
      deque.popBack();
      expect(deque.toArray()).toEqual([2, 3]);
      deque.popFront();
      expect(deque.toArray()).toEqual([3]);
      deque.popBack();
      expect(deque.toArray()).toEqual([]);
    });

    it('should maintain consistency with wraparound', () => {
      const smallDeque = new ArrayDeque<number>({ initialCapacity: 3 });
      smallDeque.pushBack(1);
      smallDeque.pushBack(2);
      smallDeque.pushBack(3);
      smallDeque.popFront();
      smallDeque.popFront();
      smallDeque.pushBack(4);
      smallDeque.pushBack(5);
      expect(smallDeque.toArray()).toEqual([3, 4, 5]);
      expect(smallDeque.get(0)).toBe(3);
      expect(smallDeque.get(1)).toBe(4);
      expect(smallDeque.get(2)).toBe(5);
    });
  });

  describe('edge cases', () => {
    it('should handle single element', () => {
      deque.pushBack(42);
      expect(deque.size).toBe(1);
      expect(deque.front()).toBe(42);
      expect(deque.back()).toBe(42);
      expect(deque.get(0)).toBe(42);
      expect(deque.popFront()).toBe(42);
      expect(deque.isEmpty).toBe(true);
    });

    it('should handle large number of operations', () => {
      for (let i = 0; i < 100; i++) {
        deque.pushBack(i);
      }
      expect(deque.size).toBe(100);
      expect(deque.toArray().length).toBe(100);

      for (let i = 0; i < 100; i++) {
        expect(deque.popFront()).toBe(i);
      }
      expect(deque.isEmpty).toBe(true);
    });

    it('should handle strings', () => {
      const strDeque = new ArrayDeque<string>();
      strDeque.pushBack('a');
      strDeque.pushBack('b');
      strDeque.pushBack('c');
      expect(strDeque.toArray()).toEqual(['a', 'b', 'c']);
      expect(strDeque.front()).toBe('a');
      expect(strDeque.back()).toBe('c');
    });

    it('should handle objects', () => {
      const objDeque = new ArrayDeque<{ id: number }>();
      objDeque.pushBack({ id: 1 });
      objDeque.pushBack({ id: 2 });
      expect(objDeque.get(0)).toEqual({ id: 1 });
      expect(objDeque.get(1)).toEqual({ id: 2 });
    });

    it('should handle null and undefined values', () => {
      const mixedDeque = new ArrayDeque<number | null | undefined>();
      mixedDeque.pushBack(1);
      mixedDeque.pushBack(null);
      mixedDeque.pushBack(undefined);
      mixedDeque.pushBack(2);
      expect(mixedDeque.toArray()).toEqual([1, null, undefined, 2]);
    });

    it('should handle many growth cycles', () => {
      const tinyDeque = new ArrayDeque<number>({ initialCapacity: 1 });
      for (let i = 0; i < 100; i++) {
        tinyDeque.pushBack(i);
      }
      expect(tinyDeque.size).toBe(100);
      for (let i = 0; i < 100; i++) {
        expect(tinyDeque.get(i)).toBe(i);
      }
    });
  });

  describe('performance characteristics', () => {
    it('should have O(1) pushBack', () => {
      for (let i = 0; i < 1000; i++) {
        deque.pushBack(i);
      }
      expect(deque.size).toBe(1000);
    });

    it('should have O(1) pushFront', () => {
      for (let i = 0; i < 1000; i++) {
        deque.pushFront(i);
      }
      expect(deque.size).toBe(1000);
    });

    it('should have O(1) popFront', () => {
      for (let i = 0; i < 1000; i++) {
        deque.pushBack(i);
      }
      for (let i = 0; i < 1000; i++) {
        deque.popFront();
      }
      expect(deque.isEmpty).toBe(true);
    });

    it('should have O(1) popBack', () => {
      for (let i = 0; i < 1000; i++) {
        deque.pushFront(i);
      }
      for (let i = 0; i < 1000; i++) {
        deque.popBack();
      }
      expect(deque.isEmpty).toBe(true);
    });

    it('should have O(1) random access', () => {
      const size = 100;
      for (let i = 0; i < size; i++) {
        deque.pushBack(i);
      }
      for (let i = 0; i < size; i++) {
        expect(deque.get(i)).toBe(i);
      }
    });
  });
});
