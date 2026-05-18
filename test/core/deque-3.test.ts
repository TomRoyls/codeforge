import { describe, it, expect } from 'vitest';
import { Deque3 } from '../../src/core/deque-3/index.js';

describe('Deque3', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('should create an empty deque', () => {
      const deque = new Deque3<number>();
      expect(deque.size).toBe(0);
      expect(deque.isEmpty).toBe(true);
    });
  });

  // ─── pushBack ───
  describe('pushBack', () => {
    it('should add element to the back', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      expect(deque.size).toBe(1);
      expect(deque.isEmpty).toBe(false);
    });

    it('should maintain order when pushing multiple elements', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.toArray()).toEqual([1, 2, 3]);
    });

    it('should handle growth beyond initial capacity', () => {
      const deque = new Deque3<number>();
      for (let i = 0; i < 100; i++) {
        deque.pushBack(i);
      }
      expect(deque.size).toBe(100);
      expect(deque.peekFront()).toBe(0);
      expect(deque.peekBack()).toBe(99);
    });
  });

  // ─── pushFront ───
  describe('pushFront', () => {
    it('should add element to the front', () => {
      const deque = new Deque3<number>();
      deque.pushFront(1);
      expect(deque.size).toBe(1);
      expect(deque.peekFront()).toBe(1);
    });

    it('should prepend elements in reverse order', () => {
      const deque = new Deque3<number>();
      deque.pushFront(1);
      deque.pushFront(2);
      deque.pushFront(3);
      expect(deque.toArray()).toEqual([3, 2, 1]);
    });

    it('should handle growth beyond initial capacity', () => {
      const deque = new Deque3<number>();
      for (let i = 0; i < 100; i++) {
        deque.pushFront(i);
      }
      expect(deque.size).toBe(100);
      expect(deque.peekFront()).toBe(99);
      expect(deque.peekBack()).toBe(0);
    });
  });

  // ─── popFront ───
  describe('popFront', () => {
    it('should return undefined when empty', () => {
      const deque = new Deque3<number>();
      expect(deque.popFront()).toBeUndefined();
    });

    it('should remove and return the front element', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      expect(deque.popFront()).toBe(1);
      expect(deque.size).toBe(1);
    });

    it('should drain the deque completely', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.popFront()).toBe(1);
      expect(deque.popFront()).toBe(2);
      expect(deque.popFront()).toBe(3);
      expect(deque.popFront()).toBeUndefined();
      expect(deque.isEmpty).toBe(true);
    });
  });

  // ─── popBack ───
  describe('popBack', () => {
    it('should return undefined when empty', () => {
      const deque = new Deque3<number>();
      expect(deque.popBack()).toBeUndefined();
    });

    it('should remove and return the back element', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      expect(deque.popBack()).toBe(2);
      expect(deque.size).toBe(1);
    });

    it('should drain the deque from the back', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.popBack()).toBe(3);
      expect(deque.popBack()).toBe(2);
      expect(deque.popBack()).toBe(1);
      expect(deque.isEmpty).toBe(true);
    });
  });

  // ─── peekFront ───
  describe('peekFront', () => {
    it('should return undefined when empty', () => {
      const deque = new Deque3<number>();
      expect(deque.peekFront()).toBeUndefined();
    });

    it('should return the front element without removing it', () => {
      const deque = new Deque3<number>();
      deque.pushBack(42);
      expect(deque.peekFront()).toBe(42);
      expect(deque.size).toBe(1);
    });
  });

  // ─── peekBack ───
  describe('peekBack', () => {
    it('should return undefined when empty', () => {
      const deque = new Deque3<number>();
      expect(deque.peekBack()).toBeUndefined();
    });

    it('should return the back element without removing it', () => {
      const deque = new Deque3<number>();
      deque.pushBack(10);
      deque.pushBack(20);
      expect(deque.peekBack()).toBe(20);
      expect(deque.size).toBe(2);
    });
  });

  // ─── clear ───
  describe('clear', () => {
    it('should remove all elements', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.clear();
      expect(deque.isEmpty).toBe(true);
      expect(deque.size).toBe(0);
    });

    it('should allow adding elements after clear', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.clear();
      deque.pushBack(2);
      expect(deque.size).toBe(1);
      expect(deque.peekFront()).toBe(2);
    });
  });

  // ─── toArray ───
  describe('toArray', () => {
    it('should return empty array for empty deque', () => {
      const deque = new Deque3<number>();
      expect(deque.toArray()).toEqual([]);
    });

    it('should return elements in order', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.toArray()).toEqual([1, 2, 3]);
    });
  });

  // ─── forEach ───
  describe('forEach', () => {
    it('should iterate over all elements with correct indices', () => {
      const deque = new Deque3<number>();
      deque.pushBack(10);
      deque.pushBack(20);
      deque.pushBack(30);
      const results: { val: number; idx: number }[] = [];
      deque.forEach((val, idx) => results.push({ val, idx }));
      expect(results).toEqual([
        { val: 10, idx: 0 },
        { val: 20, idx: 1 },
        { val: 30, idx: 2 },
      ]);
    });

    it('should not call callback for empty deque', () => {
      const deque = new Deque3<number>();
      let called = false;
      deque.forEach(() => { called = true; });
      expect(called).toBe(false);
    });
  });

  // ─── get ───
  describe('get', () => {
    it('should return undefined for out-of-bounds index', () => {
      const deque = new Deque3<number>();
      expect(deque.get(-1)).toBeUndefined();
      expect(deque.get(0)).toBeUndefined();
      expect(deque.get(5)).toBeUndefined();
    });

    it('should return element at given index', () => {
      const deque = new Deque3<number>();
      deque.pushBack(10);
      deque.pushBack(20);
      deque.pushBack(30);
      expect(deque.get(0)).toBe(10);
      expect(deque.get(1)).toBe(20);
      expect(deque.get(2)).toBe(30);
    });
  });

  // ─── contains ───
  describe('contains', () => {
    it('should return false for empty deque', () => {
      const deque = new Deque3<number>();
      expect(deque.contains(1)).toBe(false);
    });

    it('should find existing elements', () => {
      const deque = new Deque3<number>();
      deque.pushBack(10);
      deque.pushBack(20);
      expect(deque.contains(10)).toBe(true);
      expect(deque.contains(20)).toBe(true);
    });

    it('should return false for missing elements', () => {
      const deque = new Deque3<number>();
      deque.pushBack(10);
      expect(deque.contains(99)).toBe(false);
    });
  });

  // ─── Mixed operations ───
  describe('mixed push and pop operations', () => {
    it('should handle interleaved front and back operations', () => {
      const deque = new Deque3<number>();
      deque.pushBack(2);
      deque.pushFront(1);
      deque.pushBack(3);
      expect(deque.toArray()).toEqual([1, 2, 3]);
      expect(deque.popFront()).toBe(1);
      expect(deque.popBack()).toBe(3);
      expect(deque.toArray()).toEqual([2]);
    });

    it('should work with string elements', () => {
      const deque = new Deque3<string>();
      deque.pushBack('a');
      deque.pushBack('b');
      deque.pushFront('c');
      expect(deque.toArray()).toEqual(['c', 'a', 'b']);
    });

    it('should handle single element push and pop cycles', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      expect(deque.popFront()).toBe(1);
      deque.pushBack(2);
      expect(deque.popBack()).toBe(2);
      expect(deque.isEmpty).toBe(true);
    });
  });

  // ─── Edge cases ───
  describe('edge cases', () => {
    it('should handle duplicate values', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.pushBack(1);
      deque.pushBack(1);
      expect(deque.toArray()).toEqual([1, 1, 1]);
      expect(deque.contains(1)).toBe(true);
    });

    it('should handle negative numbers', () => {
      const deque = new Deque3<number>();
      deque.pushBack(-5);
      deque.pushBack(-10);
      deque.pushBack(0);
      expect(deque.toArray()).toEqual([-5, -10, 0]);
    });

    it('should handle null and undefined values', () => {
      const deque = new Deque3<number | null | undefined>();
      deque.pushBack(null);
      deque.pushBack(undefined);
      expect(deque.size).toBe(2);
      expect(deque.get(0)).toBeNull();
      expect(deque.get(1)).toBeUndefined();
    });
  });
});
