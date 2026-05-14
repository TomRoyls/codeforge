import { describe, it, expect, beforeEach } from 'vitest';
import { Deque } from '../src/core/double-ended-queue-2/index.js';

describe('Deque', () => {
  let deque: Deque<number>;

  beforeEach(() => {
    deque = new Deque<number>();
  });

  describe('constructor', () => {
    it('should create deque with default capacity 16', () => {
      expect(deque.size).toBe(0);
      expect(deque.isEmpty()).toBe(true);
    });

    it('should create deque with specified capacity', () => {
      const customDeque = new Deque<number>({ capacity: 32 });
      expect(customDeque.size).toBe(0);
      expect(customDeque.isEmpty()).toBe(true);
    });

    it('should use minimum capacity of 1', () => {
      const smallDeque = new Deque<number>({ capacity: 0 });
      expect(smallDeque.size).toBe(0);
      expect(smallDeque.isEmpty()).toBe(true);
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
      const smallDeque = new Deque<number>({ capacity: 2 });
      smallDeque.pushBack(1);
      smallDeque.pushBack(2);
      smallDeque.pushBack(3);
      expect(smallDeque.toArray()).toEqual([1, 2, 3]);
    });

    it('should return undefined when popping from empty deque', () => {
      expect(deque.popFront()).toBe(undefined);
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
      const smallDeque = new Deque<number>({ capacity: 2 });
      smallDeque.pushFront(1);
      smallDeque.pushFront(2);
      smallDeque.pushFront(3);
      expect(smallDeque.toArray()).toEqual([3, 2, 1]);
    });

    it('should return undefined when popping from empty deque', () => {
      expect(deque.popBack()).toBe(undefined);
    });
  });

  describe('front', () => {
    it('should return front element', () => {
      deque.pushBack(10);
      deque.pushBack(20);
      deque.pushBack(30);
      expect(deque.front()).toBe(10);
    });

    it('should return undefined for empty deque', () => {
      expect(deque.front()).toBe(undefined);
    });

    it('should not modify deque', () => {
      deque.pushBack(10);
      deque.pushBack(20);
      deque.front();
      expect(deque.size).toBe(2);
      expect(deque.toArray()).toEqual([10, 20]);
    });

    it('should update after popFront', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.front()).toBe(1);
      deque.popFront();
      expect(deque.front()).toBe(2);
      deque.popFront();
      expect(deque.front()).toBe(3);
    });
  });

  describe('back', () => {
    it('should return back element', () => {
      deque.pushBack(10);
      deque.pushBack(20);
      deque.pushBack(30);
      expect(deque.back()).toBe(30);
    });

    it('should return undefined for empty deque', () => {
      expect(deque.back()).toBe(undefined);
    });

    it('should not modify deque', () => {
      deque.pushBack(10);
      deque.pushBack(20);
      deque.back();
      expect(deque.size).toBe(2);
      expect(deque.toArray()).toEqual([10, 20]);
    });

    it('should update after popBack', () => {
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

    it('should return undefined for out of bounds get', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      expect(deque.get(-1)).toBe(undefined);
      expect(deque.get(2)).toBe(undefined);
      expect(deque.get(100)).toBe(undefined);
    });
  });

  describe('set', () => {
    it('should set elements by index', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.set(1, 20)).toBe(2);
      expect(deque.get(1)).toBe(20);
      expect(deque.toArray()).toEqual([1, 20, 3]);
    });

    it('should work with pushFront', () => {
      deque.pushFront(3);
      deque.pushFront(2);
      deque.pushFront(1);
      expect(deque.set(1, 20)).toBe(2);
      expect(deque.toArray()).toEqual([1, 20, 3]);
    });

    it('should return undefined for out of bounds set', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      expect(deque.set(-1, 10)).toBe(undefined);
      expect(deque.set(2, 10)).toBe(undefined);
      expect(deque.set(100, 10)).toBe(undefined);
    });
  });

  describe('insert', () => {
    it('should insert at beginning', () => {
      deque.pushBack(2);
      deque.pushBack(3);
      deque.insert(0, 1);
      expect(deque.toArray()).toEqual([1, 2, 3]);
    });

    it('should insert at end', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.insert(2, 3);
      expect(deque.toArray()).toEqual([1, 2, 3]);
    });

    it('should insert in middle', () => {
      deque.pushBack(1);
      deque.pushBack(3);
      deque.insert(1, 2);
      expect(deque.toArray()).toEqual([1, 2, 3]);
    });

    it('should not insert for out of bounds', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.insert(-1, 0);
      deque.insert(3, 0);
      expect(deque.toArray()).toEqual([1, 2]);
    });

    it('should grow when full', () => {
      const smallDeque = new Deque<number>({ capacity: 2 });
      smallDeque.pushBack(1);
      smallDeque.pushBack(2);
      smallDeque.insert(1, 3);
      expect(smallDeque.toArray()).toEqual([1, 3, 2]);
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

    it('should return undefined for out of bounds remove', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      expect(deque.removeAt(-1)).toBe(undefined);
      expect(deque.removeAt(2)).toBe(undefined);
      expect(deque.removeAt(100)).toBe(undefined);
    });
  });

  describe('clear', () => {
    it('should clear all elements', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.clear();
      expect(deque.size).toBe(0);
      expect(deque.isEmpty()).toBe(true);
      expect(deque.front()).toBe(undefined);
      expect(deque.back()).toBe(undefined);
      expect(deque.toArray()).toEqual([]);
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

  describe('fromArray', () => {
    it('should load from array', () => {
      deque.fromArray([1, 2, 3, 4, 5]);
      expect(deque.toArray()).toEqual([1, 2, 3, 4, 5]);
      expect(deque.size).toBe(5);
    });

    it('should clear existing before loading', () => {
      deque.pushBack(10);
      deque.pushBack(20);
      deque.fromArray([1, 2, 3]);
      expect(deque.toArray()).toEqual([1, 2, 3]);
    });

    it('should handle empty array', () => {
      deque.fromArray([]);
      expect(deque.size).toBe(0);
      expect(deque.isEmpty()).toBe(true);
      expect(deque.toArray()).toEqual([]);
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
      const strDeque = new Deque<string>();
      strDeque.pushBack('a');
      strDeque.pushBack('b');
      strDeque.pushBack('c');
      expect(strDeque.indexOf('b')).toBe(1);
      expect(strDeque.indexOf('d')).toBe(-1);
    });
  });

  describe('includes', () => {
    it('should return true for existing element', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.includes(2)).toBe(true);
    });

    it('should return false for non-existing element', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.includes(4)).toBe(false);
    });

    it('should return false for empty deque', () => {
      expect(deque.includes(1)).toBe(false);
    });

    it('should work with strings', () => {
      const strDeque = new Deque<string>();
      strDeque.pushBack('a');
      strDeque.pushBack('b');
      expect(strDeque.includes('a')).toBe(true);
      expect(strDeque.includes('c')).toBe(false);
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
  });

  describe('concat', () => {
    it('should concatenate two deques', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      const other = new Deque<number>();
      other.pushBack(3);
      other.pushBack(4);
      const result = deque.concat(other);
      expect(result.toArray()).toEqual([1, 2, 3, 4]);
      expect(result.size).toBe(4);
    });

    it('should concatenate with empty deque', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      const empty = new Deque<number>();
      const result = deque.concat(empty);
      expect(result.toArray()).toEqual([1, 2]);
    });

    it('should create independent deque', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      const other = new Deque<number>();
      other.pushBack(3);
      const result = deque.concat(other);
      result.pushBack(10);
      expect(deque.toArray()).toEqual([1, 2]);
      expect(other.toArray()).toEqual([3]);
      expect(result.toArray()).toEqual([1, 2, 3, 10]);
    });
  });

  describe('reverse', () => {
    it('should reverse elements', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.pushBack(4);
      deque.pushBack(5);
      const result = deque.reverse();
      expect(result.toArray()).toEqual([5, 4, 3, 2, 1]);
      expect(result === deque).toBe(true);
    });

    it('should handle empty deque', () => {
      const result = deque.reverse();
      expect(result.toArray()).toEqual([]);
      expect(result === deque).toBe(true);
    });

    it('should handle single element', () => {
      deque.pushBack(1);
      const result = deque.reverse();
      expect(result.toArray()).toEqual([1]);
      expect(result === deque).toBe(true);
    });

    it('should handle even number of elements', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.pushBack(4);
      const result = deque.reverse();
      expect(result.toArray()).toEqual([4, 3, 2, 1]);
      expect(result === deque).toBe(true);
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

  describe('equals', () => {
    it('should return true for equal deques', () => {
      const deque1 = new Deque<number>();
      const deque2 = new Deque<number>();
      deque1.pushBack(1);
      deque1.pushBack(2);
      deque2.pushBack(1);
      deque2.pushBack(2);
      expect(deque1.equals(deque2)).toBe(true);
    });

    it('should return false for different sizes', () => {
      const deque1 = new Deque<number>();
      const deque2 = new Deque<number>();
      deque1.pushBack(1);
      deque1.pushBack(2);
      deque2.pushBack(1);
      expect(deque1.equals(deque2)).toBe(false);
    });

    it('should return false for different elements', () => {
      const deque1 = new Deque<number>();
      const deque2 = new Deque<number>();
      deque1.pushBack(1);
      deque1.pushBack(2);
      deque2.pushBack(1);
      deque2.pushBack(3);
      expect(deque1.equals(deque2)).toBe(false);
    });

    it('should return true for empty deques', () => {
      const deque1 = new Deque<number>();
      const deque2 = new Deque<number>();
      expect(deque1.equals(deque2)).toBe(true);
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

    it('should clone empty deque', () => {
      const copy = deque.clone();
      expect(copy.size).toBe(0);
      expect(copy.isEmpty()).toBe(true);
    });

    it('should not affect original', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      const copy = deque.clone();
      copy.pushBack(3);
      expect(deque.toArray()).toEqual([1, 2]);
      expect(copy.toArray()).toEqual([1, 2, 3]);
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

  describe('static from', () => {
    it('should create deque from array', () => {
      const arr = [1, 2, 3, 4, 5];
      const newDeque = Deque.from(arr);
      expect(newDeque.toArray()).toEqual(arr);
      expect(newDeque.size).toBe(5);
    });

    it('should handle empty array', () => {
      const newDeque = Deque.from([]);
      expect(newDeque.size).toBe(0);
      expect(newDeque.isEmpty()).toBe(true);
      expect(newDeque.toArray()).toEqual([]);
    });

    it('should use array length as capacity', () => {
      const arr = [1, 2, 3, 4, 5];
      const newDeque = Deque.from(arr, { capacity: 10 });
      expect(newDeque.toArray()).toEqual(arr);
      expect(newDeque.size).toBe(5);
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
      expect(deque.isEmpty()).toBe(true);
    });

    it('should return false for non-empty deque', () => {
      deque.pushBack(1);
      expect(deque.isEmpty()).toBe(false);
    });

    it('should return true after clearing', () => {
      deque.pushBack(1);
      deque.pushBack(2);
      deque.clear();
      expect(deque.isEmpty()).toBe(true);
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
  });

  describe('edge cases', () => {
    it('should handle single element', () => {
      deque.pushBack(42);
      expect(deque.size).toBe(1);
      expect(deque.front()).toBe(42);
      expect(deque.back()).toBe(42);
      expect(deque.get(0)).toBe(42);
      expect(deque.popFront()).toBe(42);
      expect(deque.isEmpty()).toBe(true);
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
      expect(deque.isEmpty()).toBe(true);
    });

    it('should handle strings', () => {
      const strDeque = new Deque<string>();
      strDeque.pushBack('a');
      strDeque.pushBack('b');
      strDeque.pushBack('c');
      expect(strDeque.toArray()).toEqual(['a', 'b', 'c']);
      expect(strDeque.front()).toBe('a');
      expect(strDeque.back()).toBe('c');
    });

    it('should handle objects', () => {
      const objDeque = new Deque<{ id: number }>();
      objDeque.pushBack({ id: 1 });
      objDeque.pushBack({ id: 2 });
      expect(objDeque.get(0)).toEqual({ id: 1 });
      expect(objDeque.get(1)).toEqual({ id: 2 });
    });

    it('should handle null and undefined values', () => {
      const mixedDeque = new Deque<number | null | undefined>();
      mixedDeque.pushBack(1);
      mixedDeque.pushBack(null);
      mixedDeque.pushBack(undefined);
      mixedDeque.pushBack(2);
      expect(mixedDeque.toArray()).toEqual([1, null, undefined, 2]);
    });

    it('should handle many growth cycles', () => {
      const tinyDeque = new Deque<number>({ capacity: 1 });
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
