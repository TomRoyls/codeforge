import { describe, it, expect } from 'vitest';
import { DoubleEndedPQ2 } from '../../src/core/double-ended-pq-2/index.js';

describe('DoubleEndedPQ2', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('should create an empty PQ with default comparator', () => {
      const pq = new DoubleEndedPQ2<number>();
      expect(pq.size).toBe(0);
      expect(pq.isEmpty).toBe(true);
    });

    it('should accept a custom comparator', () => {
      const pq = new DoubleEndedPQ2<number>({ comparator: (a, b) => b - a });
      expect(pq.isEmpty).toBe(true);
    });
  });

  // ─── push ───
  describe('push', () => {
    it('should add a single element', () => {
      const pq = new DoubleEndedPQ2<number>();
      pq.push(5);
      expect(pq.size).toBe(1);
    });

    it('should maintain min at root and allow max access', () => {
      const pq = new DoubleEndedPQ2<number>();
      pq.push(5);
      pq.push(1);
      pq.push(10);
      expect(pq.peekMin()).toBe(1);
      expect(pq.peekMax()).toBe(10);
    });
  });

  // ─── popMin ───
  describe('popMin', () => {
    it('should throw when empty', () => {
      const pq = new DoubleEndedPQ2<number>();
      expect(() => pq.popMin()).toThrow('DoubleEndedPQ2 is empty');
    });

    it('should remove and return the minimum element', () => {
      const pq = new DoubleEndedPQ2<number>();
      pq.push(5);
      pq.push(1);
      pq.push(3);
      expect(pq.popMin()).toBe(1);
      expect(pq.size).toBe(2);
    });

    it('should extract all elements in ascending order via popMin', () => {
      const pq = new DoubleEndedPQ2<number>();
      pq.push(3);
      pq.push(1);
      pq.push(4);
      pq.push(1);
      pq.push(5);
      const results: number[] = [];
      while (!pq.isEmpty) {
        results.push(pq.popMin());
      }
      expect(results).toEqual([1, 1, 3, 4, 5]);
    });
  });

  // ─── popMax ───
  describe('popMax', () => {
    it('should throw when empty', () => {
      const pq = new DoubleEndedPQ2<number>();
      expect(() => pq.popMax()).toThrow('DoubleEndedPQ2 is empty');
    });

    it('should remove and return the maximum element', () => {
      const pq = new DoubleEndedPQ2<number>();
      pq.push(5);
      pq.push(1);
      pq.push(3);
      expect(pq.popMax()).toBe(5);
      expect(pq.size).toBe(2);
    });

    it('should extract all elements in descending order via popMax', () => {
      const pq = new DoubleEndedPQ2<number>();
      pq.push(3);
      pq.push(1);
      pq.push(4);
      pq.push(1);
      pq.push(5);
      const results: number[] = [];
      while (!pq.isEmpty) {
        results.push(pq.popMax());
      }
      expect(results).toEqual([5, 4, 3, 1, 1]);
    });
  });

  // ─── peekMin / peekMax ───
  describe('peekMin and peekMax', () => {
    it('should throw when empty', () => {
      const pq = new DoubleEndedPQ2<number>();
      expect(() => pq.peekMin()).toThrow('DoubleEndedPQ2 is empty');
      expect(() => pq.peekMax()).toThrow('DoubleEndedPQ2 is empty');
    });

    it('should return min and max without removing', () => {
      const pq = new DoubleEndedPQ2<number>();
      pq.push(10);
      pq.push(1);
      pq.push(5);
      expect(pq.peekMin()).toBe(1);
      expect(pq.peekMax()).toBe(10);
      expect(pq.size).toBe(3);
    });
  });

  // ─── clear ───
  describe('clear', () => {
    it('should remove all elements', () => {
      const pq = new DoubleEndedPQ2<number>();
      pq.push(1);
      pq.push(2);
      pq.clear();
      expect(pq.isEmpty).toBe(true);
      expect(pq.size).toBe(0);
    });
  });

  // ─── toArray ───
  describe('toArray', () => {
    it('should return a copy of the internal array', () => {
      const pq = new DoubleEndedPQ2<number>();
      pq.push(1);
      pq.push(2);
      const arr = pq.toArray();
      expect(arr.length).toBe(2);
      arr.push(99);
      expect(pq.size).toBe(2);
    });
  });

  // ─── toSortedArray ───
  describe('toSortedArray', () => {
    it('should return sorted elements', () => {
      const pq = new DoubleEndedPQ2<number>();
      pq.push(3);
      pq.push(1);
      pq.push(2);
      expect(pq.toSortedArray()).toEqual([1, 2, 3]);
    });
  });

  // ─── contains ───
  describe('contains', () => {
    it('should return false for empty PQ', () => {
      const pq = new DoubleEndedPQ2<number>();
      expect(pq.contains(1)).toBe(false);
    });

    it('should find existing elements', () => {
      const pq = new DoubleEndedPQ2<number>();
      pq.push(10);
      pq.push(20);
      expect(pq.contains(10)).toBe(true);
      expect(pq.contains(20)).toBe(true);
      expect(pq.contains(99)).toBe(false);
    });
  });

  // ─── remove ───
  describe('remove', () => {
    it('should remove an existing element', () => {
      const pq = new DoubleEndedPQ2<number>();
      pq.push(10);
      pq.push(20);
      pq.push(30);
      expect(pq.remove(20)).toBe(true);
      expect(pq.size).toBe(2);
      expect(pq.contains(20)).toBe(false);
    });

    it('should return false for missing element', () => {
      const pq = new DoubleEndedPQ2<number>();
      pq.push(10);
      expect(pq.remove(99)).toBe(false);
      expect(pq.size).toBe(1);
    });
  });

  // ─── clone ───
  describe('clone', () => {
    it('should create an independent copy', () => {
      const pq = new DoubleEndedPQ2<number>();
      pq.push(1);
      pq.push(2);
      const cloned = pq.clone();
      expect(cloned.size).toBe(2);
      cloned.popMin();
      expect(pq.size).toBe(2);
      expect(cloned.size).toBe(1);
    });
  });

  // ─── fromArray ───
  describe('fromArray', () => {
    it('should create a PQ from an array', () => {
      const pq = DoubleEndedPQ2.fromArray([3, 1, 4, 1, 5]);
      expect(pq.size).toBe(5);
      expect(pq.peekMin()).toBe(1);
      expect(pq.peekMax()).toBe(5);
    });

    it('should handle empty array', () => {
      const pq = DoubleEndedPQ2.fromArray([]);
      expect(pq.isEmpty).toBe(true);
    });
  });

  // ─── forEach ───
  describe('forEach', () => {
    it('should iterate over all elements', () => {
      const pq = new DoubleEndedPQ2<number>();
      pq.push(10);
      pq.push(20);
      const items: number[] = [];
      pq.forEach((item) => items.push(item));
      expect(items.length).toBe(2);
      expect(items).toContain(10);
      expect(items).toContain(20);
    });
  });

  // ─── Iterator ───
  describe('Symbol.iterator', () => {
    it('should be iterable', () => {
      const pq = new DoubleEndedPQ2<number>();
      pq.push(1);
      pq.push(2);
      const items = [...pq];
      expect(items.length).toBe(2);
    });
  });

  // ─── Edge cases ───
  describe('edge cases', () => {
    it('should handle duplicate values', () => {
      const pq = new DoubleEndedPQ2<number>();
      pq.push(5);
      pq.push(5);
      pq.push(5);
      expect(pq.peekMin()).toBe(5);
      expect(pq.peekMax()).toBe(5);
    });

    it('should handle negative numbers', () => {
      const pq = new DoubleEndedPQ2<number>();
      pq.push(-5);
      pq.push(-1);
      pq.push(0);
      expect(pq.peekMin()).toBe(-5);
      expect(pq.peekMax()).toBe(0);
    });

    it('should work with custom comparator for reverse order', () => {
      const pq = new DoubleEndedPQ2<string>({ comparator: (a, b) => b.localeCompare(a) });
      pq.push('banana');
      pq.push('apple');
      pq.push('cherry');
      expect(pq.peekMin()).toBe('cherry');
      expect(pq.peekMax()).toBe('apple');
    });
  });
});
