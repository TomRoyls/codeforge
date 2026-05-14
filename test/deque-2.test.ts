import { describe, it, expect, beforeEach } from 'vitest';
import { Deque2 } from '../src/core/deque-2/index.js';

describe('Deque2', () => {
  let deque: Deque2<number>;

  beforeEach(() => {
    deque = new Deque2<number>();
  });

  describe('constructor', () => {
    it('should create deque with default capacity 16', () => {
      expect(deque.capacity).toBe(16);
      expect(deque.size).toBe(0);
      expect(deque.isEmpty).toBe(true);
    });

    it('should create deque with specified capacity', () => {
      const customDeque = new Deque2<number>({ initialCapacity: 32 });
      expect(customDeque.capacity).toBe(32);
      expect(customDeque.size).toBe(0);
      expect(customDeque.isEmpty).toBe(true);
    });

    it('should use minimum capacity of 1', () => {
      const smallDeque = new Deque2<number>({ initialCapacity: 0 });
      expect(smallDeque.capacity).toBe(1);
      expect(smallDeque.size).toBe(0);
      expect(smallDeque.isEmpty).toBe(true);
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
      const smallDeque = new Deque2<number>({ initialCapacity: 2 });
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
      const smallDeque = new Deque2<number>({ initialCapacity: 2 });
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

  describe('push', () => {
    it('should alias for pushBack', () => {
      deque.push(1);
      deque.push(2);
      deque.push(3);
      expect(deque.toArray()).toEqual([1, 2, 3]);
    });
  });

  describe('pop', () => {
    it('should alias for popBack', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.pop()).toBe(3);
      expect(deque.toArray()).toEqual([1, 2]);
    });
  });

  describe('unshift', () => {
    it('should alias for pushFront', () => {
      deque.unshift(1);
      deque.unshift(2);
      deque.unshift(3);
      expect(deque.toArray()).toEqual([3, 2, 1]);
    });
  });

  describe('shift', () => {
    it('should alias for popFront', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.shift()).toBe(1);
      expect(deque.toArray()).toEqual([2, 3]);
    });
  });

  describe('peekFront', () => {
    it('should return front element', () => {
      deque.pushBack(10);
      deque.pushBack(20);
      deque.pushBack(30);
      expect(deque.peekFront()).toBe(10);
    });

    it('should return undefined for empty deque', () => {
      expect(deque.peekFront()).toBe(undefined);
    });

    it('should not modify deque', () => {
      deque.pushBack(10);
      deque.pushBack(20);
      deque.peekFront();
      expect(deque.size).toBe(2);
      expect(deque.toArray()).toEqual([10, 20]);
    });

    it('should update after popFront', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.peekFront()).toBe(1);
      deque.popFront();
      expect(deque.peekFront()).toBe(2);
      deque.popFront();
      expect(deque.peekFront()).toBe(3);
    });
  });

  describe('front', () => {
    it('should alias for peekFront', () => {
      deque.pushBack(10);
      deque.pushBack(20);
      expect(deque.front()).toBe(10);
    });

    it('should return undefined for empty deque', () => {
      expect(deque.front()).toBe(undefined);
    });
  });

  describe('peekBack', () => {
    it('should return back element', () => {
      deque.pushBack(10);
      deque.pushBack(20);
      deque.pushBack(30);
      expect(deque.peekBack()).toBe(30);
    });

    it('should return undefined for empty deque', () => {
      expect(deque.peekBack()).toBe(undefined);
    });

    it('should not modify deque', () => {
      deque.pushBack(10);
      deque.pushBack(20);
      deque.peekBack();
      expect(deque.size).toBe(2);
      expect(deque.toArray()).toEqual([10, 20]);
    });

    it('should update after popBack', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.peekBack()).toBe(3);
      deque.popBack();
      expect(deque.peekBack()).toBe(2);
      deque.popBack();
      expect(deque.peekBack()).toBe(1);
    });
  });

  describe('back', () => {
    it('should alias for peekBack', () => {
      deque.pushBack(10);
      deque.pushBack(20);
      expect(deque.back()).toBe(20);
    });

    it('should return undefined for empty deque', () => {
      expect(deque.back()).toBe(undefined);
    });
  });

  describe('get', () => {
    it('should get elements by index', () => {
      deque.pushBack(10);
      deque.pushBack(20);
      deque.pushBack(30);
      expect(deque.get(0)).toBe(10);
      expect(deque.get(1)).toBe(20);
      expect(deque.get(2)).toBe(30);
    });

    it('should work with pushFront', () => {
      deque.pushFront(30);
      deque.pushFront(20);
      deque.pushFront(10);
      expect(deque.get(0)).toBe(10);
      expect(deque.get(1)).toBe(20);
      expect(deque.get(2)).toBe(30);
    });

    it('should throw for out of bounds get', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      expect(() => deque.get(-1)).toThrow(RangeError);
      expect(() => deque.get(2)).toThrow(RangeError);
      expect(() => deque.get(100)).toThrow(RangeError);
    });

    it('should work after wraparound', () => {
      const smallDeque = new Deque2<number>({ initialCapacity: 3 });
      smallDeque.pushBack(1);
      smallDeque.pushBack(2);
      smallDeque.pushBack(3);
      smallDeque.popFront();
      smallDeque.popFront();
      smallDeque.pushBack(4);
      expect(smallDeque.get(0)).toBe(3);
      expect(smallDeque.get(1)).toBe(4);
    });
  });

  describe('set', () => {
    it('should set elements by index', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.set(1, 20);
      expect(deque.get(1)).toBe(20);
      expect(deque.toArray()).toEqual([1, 20, 3]);
    });

    it('should work with pushFront', () => {
      deque.pushFront(3);
      deque.pushFront(2);
      deque.pushFront(1);
      deque.set(1, 20);
      expect(deque.toArray()).toEqual([1, 20, 3]);
    });

    it('should throw for out of bounds set', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      expect(() => deque.set(-1, 10)).toThrow(RangeError);
      expect(() => deque.set(2, 10)).toThrow(RangeError);
      expect(() => deque.set(100, 10)).toThrow(RangeError);
    });

    it('should work after wraparound', () => {
      const smallDeque = new Deque2<number>({ initialCapacity: 3 });
      smallDeque.pushBack(1);
      smallDeque.pushBack(2);
      smallDeque.pushBack(3);
      smallDeque.popFront();
      smallDeque.popFront();
      smallDeque.pushBack(4);
      smallDeque.set(0, 30);
      expect(smallDeque.get(0)).toBe(30);
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
      const smallDeque = new Deque2<number>({ initialCapacity: 2 });
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
      expect(deque.peekFront()).toBe(undefined);
      expect(deque.peekBack()).toBe(undefined);
      expect(deque.toArray()).toEqual([]);
    });

    it('should not affect capacity', () => {
      const smallDeque = new Deque2<number>({ initialCapacity: 8 });
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

    it('should work with wraparound', () => {
      const smallDeque = new Deque2<number>({ initialCapacity: 3 });
      smallDeque.pushBack(1);
      smallDeque.pushBack(2);
      smallDeque.pushBack(3);
      smallDeque.popFront();
      smallDeque.popFront();
      smallDeque.pushBack(4);
      expect(smallDeque.toArray()).toEqual([3, 4]);
    });
  });

  describe('clone', () => {
    it('should create independent copy', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const copy = deque.clone();
      expect(copy.toArray()).toEqual([1, 2, 3]);
      expect(copy.size).toBe(3);
      expect(copy === deque).toBe(false);
    });

    it('should create copy with same capacity', () => {
      const smallDeque = new Deque2<number>({ initialCapacity: 4 });
      smallDeque.pushBack(1);
      smallDeque.pushBack(2);
      const copy = smallDeque.clone();
      expect(copy.capacity).toBe(4);
    });

    it('should not affect original', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      const copy = deque.clone();
      copy.pushBack(3);
      expect(deque.toArray()).toEqual([1, 2]);
      expect(copy.toArray()).toEqual([1, 2, 3]);
    });

    it('should clone empty deque', () => {
      const copy = deque.clone();
      expect(copy.size).toBe(0);
      expect(copy.isEmpty).toBe(true);
    });
  });

  describe('fromArray', () => {
    it('should create deque from array', () => {
      const arr = [1, 2, 3, 4, 5];
      const newDeque = Deque2.fromArray(arr);
      expect(newDeque.toArray()).toEqual(arr);
      expect(newDeque.size).toBe(5);
    });

    it('should use max of array length and 16 as capacity', () => {
      const smallArr = [1, 2, 3];
      const smallDeque = Deque2.fromArray(smallArr);
      expect(smallDeque.capacity).toBe(16);

      const largeArr = new Array(20).fill(0);
      const largeDeque = Deque2.fromArray(largeArr);
      expect(largeDeque.capacity).toBe(20);
    });

    it('should handle empty array', () => {
      const newDeque = Deque2.fromArray([]);
      expect(newDeque.size).toBe(0);
      expect(newDeque.isEmpty).toBe(true);
      expect(newDeque.toArray()).toEqual([]);
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

    it('should work with wraparound', () => {
      const smallDeque = new Deque2<number>({ initialCapacity: 3 });
      smallDeque.pushBack(1);
      smallDeque.pushBack(2);
      smallDeque.pushBack(3);
      smallDeque.popFront();
      smallDeque.pushBack(4);
      const result: number[] = [];
      smallDeque.forEach((value) => result.push(value));
      expect(result).toEqual([2, 3, 4]);
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

    it('should work with wraparound', () => {
      const smallDeque = new Deque2<number>({ initialCapacity: 3 });
      smallDeque.pushBack(1);
      smallDeque.pushBack(2);
      smallDeque.pushBack(3);
      smallDeque.popFront();
      smallDeque.pushBack(4);
      const result = [...smallDeque];
      expect(result).toEqual([2, 3, 4]);
    });
  });

  describe('indexOf', () => {
    it('should find element index', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.indexOf(2)).toBe(1);
    });

    it('should return -1 for non-existing element', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.indexOf(4)).toBe(-1);
    });

    it('should find first occurrence', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(1);
      expect(deque.indexOf(1)).toBe(0);
    });

    it('should return -1 for empty deque', () => {
      expect(deque.indexOf(1)).toBe(-1);
    });

    it('should work with strings', () => {
      const strDeque = new Deque2<string>();
      strDeque.pushBack('a');
      strDeque.pushBack('b');
      strDeque.pushBack('c');
      expect(strDeque.indexOf('b')).toBe(1);
      expect(strDeque.indexOf('d')).toBe(-1);
    });
  });

  describe('contains', () => {
    it('should return true for existing element', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.contains(2)).toBe(true);
    });

    it('should return false for non-existing element', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.contains(4)).toBe(false);
    });

    it('should return false for empty deque', () => {
      expect(deque.contains(1)).toBe(false);
    });

    it('should work with strings', () => {
      const strDeque = new Deque2<string>();
      strDeque.pushBack('a');
      strDeque.pushBack('b');
      expect(strDeque.contains('a')).toBe(true);
      expect(strDeque.contains('c')).toBe(false);
    });
  });

  describe('insertAt', () => {
    it('should insert at beginning', () => {
      deque.pushBack(2);
      deque.pushBack(3);
      deque.insertAt(0, 1);
      expect(deque.toArray()).toEqual([1, 2, 3]);
    });

    it('should insert at end', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.insertAt(2, 3);
      expect(deque.toArray()).toEqual([1, 2, 3]);
    });

    it('should insert in middle', () => {
      deque.pushBack(1);
      deque.pushBack(3);
      deque.insertAt(1, 2);
      expect(deque.toArray()).toEqual([1, 2, 3]);
    });

    it('should throw for out of bounds insert', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      expect(() => deque.insertAt(-1, 0)).toThrow(RangeError);
      expect(() => deque.insertAt(3, 0)).toThrow(RangeError);
      expect(() => deque.insertAt(100, 0)).toThrow(RangeError);
    });

    it('should grow when full', () => {
      const smallDeque = new Deque2<number>({ initialCapacity: 2 });
      smallDeque.pushBack(1);
      smallDeque.pushBack(2);
      expect(smallDeque.capacity).toBe(2);
      smallDeque.insertAt(1, 3);
      expect(smallDeque.capacity).toBe(4);
      expect(smallDeque.toArray()).toEqual([1, 3, 2]);
    });

    it('should work with wraparound', () => {
      const smallDeque = new Deque2<number>({ initialCapacity: 3 });
      smallDeque.pushBack(1);
      smallDeque.pushBack(2);
      smallDeque.pushBack(3);
      smallDeque.popFront();
      smallDeque.insertAt(1, 10);
      expect(smallDeque.toArray()).toEqual([2, 10, 3]);
    });
  });

  describe('removeAt', () => {
    it('should remove at beginning', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.removeAt(0);
      expect(result).toBe(1);
      expect(deque.toArray()).toEqual([2, 3]);
      expect(deque.size).toBe(2);
    });

    it('should remove at end', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.removeAt(2);
      expect(result).toBe(3);
      expect(deque.toArray()).toEqual([1, 2]);
      expect(deque.size).toBe(2);
    });

    it('should remove in middle', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.removeAt(1);
      expect(result).toBe(2);
      expect(deque.toArray()).toEqual([1, 3]);
      expect(deque.size).toBe(2);
    });

    it('should throw for out of bounds remove', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      expect(() => deque.removeAt(-1)).toThrow(RangeError);
      expect(() => deque.removeAt(2)).toThrow(RangeError);
      expect(() => deque.removeAt(100)).toThrow(RangeError);
    });

    it('should work with wraparound', () => {
      const smallDeque = new Deque2<number>({ initialCapacity: 3 });
      smallDeque.pushBack(1);
      smallDeque.pushBack(2);
      smallDeque.pushBack(3);
      smallDeque.popFront();
      const result = smallDeque.removeAt(0);
      expect(result).toBe(2);
      expect(smallDeque.toArray()).toEqual([3]);
    });
  });

  describe('rotate', () => {
    it('should rotate positive amount', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.pushBack(4);
      deque.pushBack(5);
      deque.rotate(2);
      expect(deque.toArray()).toEqual([3, 4, 5, 1, 2]);
    });

    it('should rotate negative amount', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.pushBack(4);
      deque.pushBack(5);
      deque.rotate(-2);
      expect(deque.toArray()).toEqual([4, 5, 1, 2, 3]);
    });

    it('should rotate by size', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.rotate(3);
      expect(deque.toArray()).toEqual([1, 2, 3]);
    });

    it('should handle rotation larger than size', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.rotate(7);
      expect(deque.toArray()).toEqual([2, 3, 1]);
    });

    it('should not change empty deque', () => {
      deque.rotate(5);
      expect(deque.toArray()).toEqual([]);
    });

    it('should not change single element', () => {
      deque.pushBack(1);
      deque.rotate(10);
      expect(deque.toArray()).toEqual([1]);
    });

    it('should rotate zero amount', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.rotate(0);
      expect(deque.toArray()).toEqual([1, 2, 3]);
    });
  });

  describe('reverse', () => {
    it('should reverse elements', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.pushBack(4);
      deque.pushBack(5);
      deque.reverse();
      expect(deque.toArray()).toEqual([5, 4, 3, 2, 1]);
    });

    it('should handle empty deque', () => {
      deque.reverse();
      expect(deque.toArray()).toEqual([]);
    });

    it('should handle single element', () => {
      deque.pushBack(1);
      deque.reverse();
      expect(deque.toArray()).toEqual([1]);
    });

    it('should handle even number of elements', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.pushBack(4);
      deque.reverse();
      expect(deque.toArray()).toEqual([4, 3, 2, 1]);
    });

    it('should work with wraparound', () => {
      const smallDeque = new Deque2<number>({ initialCapacity: 4 });
      smallDeque.pushBack(1);
      smallDeque.pushBack(2);
      smallDeque.pushBack(3);
      smallDeque.pushBack(4);
      smallDeque.popFront();
      smallDeque.popFront();
      smallDeque.pushBack(5);
      smallDeque.pushBack(6);
      expect(smallDeque.toArray()).toEqual([3, 4, 5, 6]);
      smallDeque.reverse();
      expect(smallDeque.toArray()).toEqual([6, 5, 4, 3]);
    });
  });

  describe('slice', () => {
    it('should slice with default parameters', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.pushBack(4);
      deque.pushBack(5);
      const result = deque.slice();
      expect(result.toArray()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should slice with start and end', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.pushBack(4);
      deque.pushBack(5);
      const result = deque.slice(1, 4);
      expect(result.toArray()).toEqual([2, 3, 4]);
    });

    it('should slice from start', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.pushBack(4);
      const result = deque.slice(2);
      expect(result.toArray()).toEqual([3, 4]);
    });

    it('should handle negative start', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.pushBack(4);
      deque.pushBack(5);
      const result = deque.slice(-3);
      expect(result.toArray()).toEqual([3, 4, 5]);
    });

    it('should handle negative end', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.pushBack(4);
      deque.pushBack(5);
      const result = deque.slice(0, -1);
      expect(result.toArray()).toEqual([1, 2, 3, 4]);
    });

    it('should handle empty slice', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.slice(5, 10);
      expect(result.toArray()).toEqual([]);
    });

    it('should create independent deque', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.slice(1, 2);
      result.pushBack(10);
      expect(deque.toArray()).toEqual([1, 2, 3]);
      expect(result.toArray()).toEqual([2, 10]);
    });

    it('should work with wraparound', () => {
      const smallDeque = new Deque2<number>({ initialCapacity: 3 });
      smallDeque.pushBack(1);
      smallDeque.pushBack(2);
      smallDeque.pushBack(3);
      smallDeque.popFront();
      smallDeque.pushBack(4);
      const result = smallDeque.slice(0, 2);
      expect(result.toArray()).toEqual([2, 3]);
    });
  });

  describe('concat', () => {
    it('should concatenate two deques', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      const other = new Deque2<number>();
      other.pushBack(3);
      other.pushBack(4);
      const result = deque.concat(other);
      expect(result.toArray()).toEqual([1, 2, 3, 4]);
      expect(result.size).toBe(4);
    });

    it('should concatenate with empty deque', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      const empty = new Deque2<number>();
      const result = deque.concat(empty);
      expect(result.toArray()).toEqual([1, 2]);
    });

    it('should create independent deque', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      const other = new Deque2<number>();
      other.pushBack(3);
      const result = deque.concat(other);
      result.pushBack(10);
      expect(deque.toArray()).toEqual([1, 2]);
      expect(other.toArray()).toEqual([3]);
      expect(result.toArray()).toEqual([1, 2, 3, 10]);
    });

    it('should use appropriate capacity', () => {
      const smallDeque = new Deque2<number>({ initialCapacity: 2 });
      smallDeque.pushBack(1);
      const other = new Deque2<number>();
      other.pushBack(2);
      const result = smallDeque.concat(other);
      expect(result.capacity).toBeGreaterThanOrEqual(2);
    });
  });

  describe('filter', () => {
    it('should filter with predicate', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.pushBack(4);
      deque.pushBack(5);
      const result = deque.filter((value) => value % 2 === 0);
      expect(result.toArray()).toEqual([2, 4]);
    });

    it('should filter with index', () => {
      deque.pushBack(10);
      deque.pushBack(20);
      deque.pushBack(30);
      const result = deque.filter((value, index) => index % 2 === 0);
      expect(result.toArray()).toEqual([10, 30]);
    });

    it('should return empty when no matches', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.filter((value) => value > 10);
      expect(result.toArray()).toEqual([]);
      expect(result.size).toBe(0);
    });

    it('should return all when all match', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.filter(() => true);
      expect(result.toArray()).toEqual([1, 2, 3]);
    });

    it('should create independent deque', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      const result = deque.filter(() => true);
      result.pushBack(10);
      expect(deque.toArray()).toEqual([1, 2]);
      expect(result.toArray()).toEqual([1, 2, 10]);
    });

    it('should work with wraparound', () => {
      const smallDeque = new Deque2<number>({ initialCapacity: 3 });
      smallDeque.pushBack(1);
      smallDeque.pushBack(2);
      smallDeque.pushBack(3);
      smallDeque.popFront();
      smallDeque.pushBack(4);
      const result = smallDeque.filter((value) => value % 2 === 0);
      expect(result.toArray()).toEqual([2, 4]);
    });
  });

  describe('map', () => {
    it('should map elements', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.map((value) => value * 2);
      expect(result.toArray()).toEqual([2, 4, 6]);
    });

    it('should map with index', () => {
      deque.pushBack(10);
      deque.pushBack(20);
      deque.pushBack(30);
      const result = deque.map((value, index) => value + index);
      expect(result.toArray()).toEqual([10, 21, 32]);
    });

    it('should map to different type', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.map((value) => String(value));
      expect(result.toArray()).toEqual(['1', '2', '3']);
    });

    it('should create independent deque', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      const result = deque.map((value) => value);
      result.pushBack(10);
      expect(deque.toArray()).toEqual([1, 2]);
      expect(result.toArray()).toEqual([1, 2, 10]);
    });

    it('should work with wraparound', () => {
      const smallDeque = new Deque2<number>({ initialCapacity: 3 });
      smallDeque.pushBack(1);
      smallDeque.pushBack(2);
      smallDeque.pushBack(3);
      smallDeque.popFront();
      smallDeque.pushBack(4);
      const result = smallDeque.map((value) => value * 10);
      expect(result.toArray()).toEqual([20, 30, 40]);
    });
  });

  describe('reduce', () => {
    it('should reduce elements', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.reduce((acc, value) => acc + value, 0);
      expect(result).toBe(6);
    });

    it('should reduce with index', () => {
      deque.pushBack(10);
      deque.pushBack(20);
      deque.pushBack(30);
      const result = deque.reduce((acc, value, index) => acc + value * index, 0);
      expect(result).toBe(80);
    });

    it('should reduce to different type', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.reduce((acc, value) => acc + String(value), '');
      expect(result).toBe('123');
    });

    it('should handle empty deque', () => {
      const result = deque.reduce((acc, value) => acc + value, 100);
      expect(result).toBe(100);
    });

    it('should work with wraparound', () => {
      const smallDeque = new Deque2<number>({ initialCapacity: 3 });
      smallDeque.pushBack(1);
      smallDeque.pushBack(2);
      smallDeque.pushBack(3);
      smallDeque.popFront();
      smallDeque.pushBack(4);
      const result = smallDeque.reduce((acc, value) => acc + value, 0);
      expect(result).toBe(9);
    });
  });

  describe('find', () => {
    it('should find matching element', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.find((value) => value % 2 === 0);
      expect(result).toBe(2);
    });

    it('should return undefined when no match', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.find((value) => value > 10);
      expect(result).toBe(undefined);
    });

    it('should find with index', () => {
      deque.pushBack(10);
      deque.pushBack(20);
      deque.pushBack(30);
      const result = deque.find((value, index) => index === 1);
      expect(result).toBe(20);
    });

    it('should return first match', () => {
      deque.pushBack(2);
      deque.pushBack(4);
      deque.pushBack(6);
      const result = deque.find((value) => value % 2 === 0);
      expect(result).toBe(2);
    });

    it('should work with wraparound', () => {
      const smallDeque = new Deque2<number>({ initialCapacity: 3 });
      smallDeque.pushBack(1);
      smallDeque.pushBack(2);
      smallDeque.pushBack(3);
      smallDeque.popFront();
      smallDeque.pushBack(4);
      const result = smallDeque.find((value) => value === 3);
      expect(result).toBe(3);
    });
  });

  describe('findIndex', () => {
    it('should find matching index', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.findIndex((value) => value % 2 === 0);
      expect(result).toBe(1);
    });

    it('should return -1 when no match', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.findIndex((value) => value > 10);
      expect(result).toBe(-1);
    });

    it('should find with index', () => {
      deque.pushBack(10);
      deque.pushBack(20);
      deque.pushBack(30);
      const result = deque.findIndex((value, index) => index === 1);
      expect(result).toBe(1);
    });

    it('should return first match', () => {
      deque.pushBack(2);
      deque.pushBack(4);
      deque.pushBack(6);
      const result = deque.findIndex((value) => value % 2 === 0);
      expect(result).toBe(0);
    });

    it('should work with wraparound', () => {
      const smallDeque = new Deque2<number>({ initialCapacity: 3 });
      smallDeque.pushBack(1);
      smallDeque.pushBack(2);
      smallDeque.pushBack(3);
      smallDeque.popFront();
      smallDeque.pushBack(4);
      const result = smallDeque.findIndex((value) => value === 3);
      expect(result).toBe(1);
    });
  });

  describe('every', () => {
    it('should return true when all match', () => {
      deque.pushBack(2);
      deque.pushBack(4);
      deque.pushBack(6);
      const result = deque.every((value) => value % 2 === 0);
      expect(result).toBe(true);
    });

    it('should return false when some do not match', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.every((value) => value % 2 === 0);
      expect(result).toBe(false);
    });

    it('should return true for empty deque', () => {
      const result = deque.every(() => false);
      expect(result).toBe(true);
    });

    it('should short-circuit', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const calls: number[] = [];
      deque.every((value) => {
        calls.push(value);
        return value < 2;
      });
      expect(calls).toEqual([1, 2]);
    });
  });

  describe('some', () => {
    it('should return true when some match', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.some((value) => value % 2 === 0);
      expect(result).toBe(true);
    });

    it('should return false when none match', () => {
      deque.pushBack(1);
      deque.pushBack(3);
      deque.pushBack(5);
      const result = deque.some((value) => value % 2 === 0);
      expect(result).toBe(false);
    });

    it('should return false for empty deque', () => {
      const result = deque.some(() => true);
      expect(result).toBe(false);
    });

    it('should short-circuit', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const calls: number[] = [];
      deque.some((value) => {
        calls.push(value);
        return value % 2 === 0;
      });
      expect(calls).toEqual([1, 2]);
    });
  });

  describe('join', () => {
    it('should join with default separator', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.join();
      expect(result).toBe('1,2,3');
    });

    it('should join with custom separator', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.join('-');
      expect(result).toBe('1-2-3');
    });

    it('should return empty string for empty deque', () => {
      const result = deque.join();
      expect(result).toBe('');
    });

    it('should join single element', () => {
      deque.pushBack(1);
      const result = deque.join('-');
      expect(result).toBe('1');
    });

    it('should work with strings', () => {
      const strDeque = new Deque2<string>();
      strDeque.pushBack('a');
      strDeque.pushBack('b');
      strDeque.pushBack('c');
      const result = strDeque.join('|');
      expect(result).toBe('a|b|c');
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
      const smallDeque = new Deque2<number>({ initialCapacity: 3 });
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
      const strDeque = new Deque2<string>();
      strDeque.pushBack('a');
      strDeque.pushBack('b');
      strDeque.pushBack('c');
      expect(strDeque.toArray()).toEqual(['a', 'b', 'c']);
      expect(strDeque.front()).toBe('a');
      expect(strDeque.back()).toBe('c');
    });

    it('should handle objects', () => {
      const objDeque = new Deque2<{ id: number }>();
      objDeque.pushBack({ id: 1 });
      objDeque.pushBack({ id: 2 });
      expect(objDeque.get(0)).toEqual({ id: 1 });
      expect(objDeque.get(1)).toEqual({ id: 2 });
    });

    it('should handle null and undefined values', () => {
      const mixedDeque = new Deque2<number | null | undefined>();
      mixedDeque.pushBack(1);
      mixedDeque.pushBack(null);
      mixedDeque.pushBack(undefined);
      mixedDeque.pushBack(2);
      expect(mixedDeque.toArray()).toEqual([1, null, undefined, 2]);
    });

    it('should handle many growth cycles', () => {
      const tinyDeque = new Deque2<number>({ initialCapacity: 1 });
      for (let i = 0; i < 100; i++) {
        tinyDeque.pushBack(i);
      }
      expect(tinyDeque.size).toBe(100);
      for (let i = 0; i < 100; i++) {
        expect(tinyDeque.get(i)).toBe(i);
      }
    });
  });
});
