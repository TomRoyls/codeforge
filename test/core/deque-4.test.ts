import { describe, it, expect } from 'vitest';
import { Deque4 } from '../../src/core/deque-4/index.js';

describe('Deque4', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('should create an empty deque', () => {
      const deque = new Deque4<number>();
      expect(deque.size).toBe(0);
      expect(deque.isEmpty).toBe(true);
    });
  });

  // ─── pushBack ───
  describe('pushBack', () => {
    it('should add element to the back', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      expect(deque.size).toBe(1);
      expect(deque.isEmpty).toBe(false);
    });

    it('should maintain order when pushing multiple elements', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.toArray()).toEqual([1, 2, 3]);
    });

    it('should handle growth beyond initial capacity', () => {
      const deque = new Deque4<number>();
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
      const deque = new Deque4<number>();
      deque.pushFront(1);
      expect(deque.size).toBe(1);
      expect(deque.peekFront()).toBe(1);
    });

    it('should prepend elements in reverse order', () => {
      const deque = new Deque4<number>();
      deque.pushFront(3);
      deque.pushFront(2);
      deque.pushFront(1);
      expect(deque.toArray()).toEqual([1, 2, 3]);
    });

    it('should handle growth via pushFront', () => {
      const deque = new Deque4<number>();
      for (let i = 0; i < 50; i++) {
        deque.pushFront(i);
      }
      expect(deque.size).toBe(50);
      expect(deque.peekFront()).toBe(49);
      expect(deque.peekBack()).toBe(0);
    });
  });

  // ─── popFront ───
  describe('popFront', () => {
    it('should return undefined when empty', () => {
      const deque = new Deque4<number>();
      expect(deque.popFront()).toBeUndefined();
    });

    it('should remove and return the front element', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      expect(deque.popFront()).toBe(1);
      expect(deque.toArray()).toEqual([2]);
    });

    it('should drain the deque completely', () => {
      const deque = new Deque4<number>();
      deque.pushBack(10);
      deque.pushBack(20);
      expect(deque.popFront()).toBe(10);
      expect(deque.popFront()).toBe(20);
      expect(deque.popFront()).toBeUndefined();
      expect(deque.isEmpty).toBe(true);
    });
  });

  // ─── popBack ───
  describe('popBack', () => {
    it('should return undefined when empty', () => {
      const deque = new Deque4<number>();
      expect(deque.popBack()).toBeUndefined();
    });

    it('should remove and return the back element', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      expect(deque.popBack()).toBe(2);
      expect(deque.toArray()).toEqual([1]);
    });

    it('should drain the deque from the back', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.popBack()).toBe(3);
      expect(deque.popBack()).toBe(2);
      expect(deque.popBack()).toBe(1);
      expect(deque.popBack()).toBeUndefined();
    });
  });

  // ─── peekFront ───
  describe('peekFront', () => {
    it('should return undefined when empty', () => {
      const deque = new Deque4<number>();
      expect(deque.peekFront()).toBeUndefined();
    });

    it('should return the front element without removing it', () => {
      const deque = new Deque4<number>();
      deque.pushBack(42);
      expect(deque.peekFront()).toBe(42);
      expect(deque.size).toBe(1);
    });
  });

  // ─── peekBack ───
  describe('peekBack', () => {
    it('should return undefined when empty', () => {
      const deque = new Deque4<number>();
      expect(deque.peekBack()).toBeUndefined();
    });

    it('should return the back element without removing it', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(99);
      expect(deque.peekBack()).toBe(99);
      expect(deque.size).toBe(2);
    });
  });

  // ─── clear ───
  describe('clear', () => {
    it('should clear all elements', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.clear();
      expect(deque.isEmpty).toBe(true);
      expect(deque.size).toBe(0);
      expect(deque.toArray()).toEqual([]);
    });
  });

  // ─── toArray ───
  describe('toArray', () => {
    it('should return empty array for empty deque', () => {
      const deque = new Deque4<number>();
      expect(deque.toArray()).toEqual([]);
    });

    it('should return elements in order after mixed operations', () => {
      const deque = new Deque4<number>();
      deque.pushFront(2);
      deque.pushBack(3);
      deque.pushFront(1);
      expect(deque.toArray()).toEqual([1, 2, 3]);
    });
  });

  // ─── forEach ───
  describe('forEach', () => {
    it('should iterate over all elements with correct indices', () => {
      const deque = new Deque4<number>();
      deque.pushBack(10);
      deque.pushBack(20);
      deque.pushBack(30);
      const results: [number, number][] = [];
      deque.forEach((v, i) => results.push([v, i]));
      expect(results).toEqual([[10, 0], [20, 1], [30, 2]]);
    });

    it('should not call callback on empty deque', () => {
      const deque = new Deque4<number>();
      let called = false;
      deque.forEach(() => { called = true; });
      expect(called).toBe(false);
    });
  });

  // ─── filter ───
  describe('filter', () => {
    it('should return a new deque with filtered elements', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.pushBack(4);
      const filtered = deque.filter(v => v % 2 === 0);
      expect(filtered.toArray()).toEqual([2, 4]);
    });

    it('should return empty deque when no elements match', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(3);
      const filtered = deque.filter(v => v % 2 === 0);
      expect(filtered.isEmpty).toBe(true);
    });

    it('should not modify the original deque', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.filter(v => v > 1);
      expect(deque.toArray()).toEqual([1, 2]);
    });
  });

  // ─── map ───
  describe('map', () => {
    it('should transform elements to a new deque', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const mapped = deque.map(v => v * 10);
      expect(mapped.toArray()).toEqual([10, 20, 30]);
    });

    it('should allow type transformation', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      const mapped = deque.map(v => `val:${v}`);
      expect(mapped.toArray()).toEqual(['val:1', 'val:2']);
    });
  });

  // ─── reduce ───
  describe('reduce', () => {
    it('should reduce elements to a single value', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.reduce((acc, v) => acc + v, 0)).toBe(6);
    });

    it('should return initial value for empty deque', () => {
      const deque = new Deque4<number>();
      expect(deque.reduce((acc, v) => acc + v, 42)).toBe(42);
    });
  });

  // ─── rotate ───
  describe('rotate', () => {
    it('should return empty deque when rotating empty deque', () => {
      const deque = new Deque4<number>();
      const rotated = deque.rotate(1);
      expect(rotated.isEmpty).toBe(true);
    });

    it('should rotate right by positive n', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.pushBack(4);
      const rotated = deque.rotate(1);
      expect(rotated.toArray()).toEqual([4, 1, 2, 3]);
    });

    it('should rotate left by negative n', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.pushBack(4);
      const rotated = deque.rotate(-1);
      expect(rotated.toArray()).toEqual([2, 3, 4, 1]);
    });

    it('should return copy when n is 0', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      const rotated = deque.rotate(0);
      expect(rotated.toArray()).toEqual([1, 2]);
    });

    it('should handle n larger than size', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const rotated = deque.rotate(5);
      expect(rotated.toArray()).toEqual([2, 3, 1]);
    });
  });

  // ─── slice ───
  describe('slice', () => {
    it('should return a slice of the deque', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.pushBack(4);
      expect(deque.slice(1, 3).toArray()).toEqual([2, 3]);
    });

    it('should slice to end when end is omitted', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.slice(1).toArray()).toEqual([2, 3]);
    });

    it('should handle negative indices', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.pushBack(4);
      expect(deque.slice(-2).toArray()).toEqual([3, 4]);
    });

    it('should return empty deque for out-of-range slice', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      expect(deque.slice(5, 10).toArray()).toEqual([]);
    });
  });

  // ─── getTimeComplexity ───
  describe('getTimeComplexity', () => {
    it('should return complexity for known operations', () => {
      const deque = new Deque4<number>();
      expect(deque.getTimeComplexity('pushFront')).toBe('O(1) amortized');
      expect(deque.getTimeComplexity('pushBack')).toBe('O(1) amortized');
      expect(deque.getTimeComplexity('popFront')).toBe('O(1)');
      expect(deque.getTimeComplexity('toArray')).toBe('O(n)');
    });

    it('should return unknown for unrecognized operations', () => {
      const deque = new Deque4<number>();
      expect(deque.getTimeComplexity('unknown')).toBe('Unknown operation');
    });
  });

  // ─── Edge Cases ───
  describe('edge cases', () => {
    it('should handle mixed push/pop operations', () => {
      const deque = new Deque4<number>();
      deque.pushFront(2);
      deque.pushBack(3);
      deque.pushFront(1);
      deque.pushBack(4);
      expect(deque.toArray()).toEqual([1, 2, 3, 4]);
      expect(deque.popFront()).toBe(1);
      expect(deque.popBack()).toBe(4);
      expect(deque.toArray()).toEqual([2, 3]);
    });

    it('should handle single element operations', () => {
      const deque = new Deque4<number>();
      deque.pushBack(42);
      expect(deque.peekFront()).toBe(42);
      expect(deque.peekBack()).toBe(42);
      expect(deque.popFront()).toBe(42);
      expect(deque.isEmpty).toBe(true);
    });

    it('should work with string elements', () => {
      const deque = new Deque4<string>();
      deque.pushBack('a');
      deque.pushBack('b');
      deque.pushFront('z');
      expect(deque.toArray()).toEqual(['z', 'a', 'b']);
    });

    it('should handle negative numbers', () => {
      const deque = new Deque4<number>();
      deque.pushBack(-1);
      deque.pushBack(-2);
      deque.pushBack(0);
      expect(deque.toArray()).toEqual([-1, -2, 0]);
    });

    it('should handle duplicates', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(1);
      expect(deque.toArray()).toEqual([1, 1, 2, 1]);
      expect(deque.size).toBe(4);
    });
  });
});
