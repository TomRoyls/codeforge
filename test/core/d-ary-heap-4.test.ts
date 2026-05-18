import { describe, it, expect } from 'vitest';
import { DAryHeap4 } from '../../src/core/d-ary-heap-4/index.js';

describe('DAryHeap4', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('should create an empty heap with default comparator', () => {
      const heap = new DAryHeap4<number>();
      expect(heap.size).toBe(0);
      expect(heap.isEmpty).toBe(true);
    });

    it('should accept a custom comparator', () => {
      const heap = new DAryHeap4<number>((a, b) => a - b);
      expect(heap.size).toBe(0);
    });
  });

  // ─── insert ───
  describe('insert', () => {
    it('should add a single element', () => {
      const heap = new DAryHeap4<number>();
      heap.insert(5);
      expect(heap.size).toBe(1);
      expect(heap.isEmpty).toBe(false);
    });

    it('should maintain max-heap property', () => {
      const heap = new DAryHeap4<number>();
      heap.insert(1);
      heap.insert(5);
      heap.insert(3);
      expect(heap.peek()).toBe(5);
    });

    it('should handle many insertions', () => {
      const heap = new DAryHeap4<number>();
      for (let i = 0; i < 100; i++) {
        heap.insert(i);
      }
      expect(heap.size).toBe(100);
      expect(heap.peek()).toBe(99);
    });

    it('should handle negative numbers', () => {
      const heap = new DAryHeap4<number>();
      heap.insert(-5);
      heap.insert(-1);
      heap.insert(-10);
      expect(heap.peek()).toBe(-1);
    });
  });

  // ─── extract ───
  describe('extract', () => {
    it('should return undefined when empty', () => {
      const heap = new DAryHeap4<number>();
      expect(heap.extract()).toBeUndefined();
    });

    it('should extract the maximum element', () => {
      const heap = new DAryHeap4<number>();
      heap.insert(3);
      heap.insert(1);
      heap.insert(5);
      expect(heap.extract()).toBe(5);
      expect(heap.size).toBe(2);
    });

    it('should extract all elements in descending order', () => {
      const heap = new DAryHeap4<number>();
      heap.insert(3);
      heap.insert(1);
      heap.insert(4);
      heap.insert(1);
      heap.insert(5);
      heap.insert(9);
      heap.insert(2);
      heap.insert(6);

      const extracted: number[] = [];
      while (!heap.isEmpty) {
        extracted.push(heap.extract()!);
      }
      expect(extracted).toEqual([9, 6, 5, 4, 3, 2, 1, 1]);
    });
  });

  // ─── peek ───
  describe('peek', () => {
    it('should return undefined when empty', () => {
      const heap = new DAryHeap4<number>();
      expect(heap.peek()).toBeUndefined();
    });

    it('should return max without removing it', () => {
      const heap = new DAryHeap4<number>();
      heap.insert(42);
      expect(heap.peek()).toBe(42);
      expect(heap.size).toBe(1);
    });
  });

  // ─── heapify ───
  describe('heapify', () => {
    it('should build a valid heap from an array', () => {
      const heap = new DAryHeap4<number>();
      heap.heapify([3, 1, 4, 1, 5, 9, 2, 6]);
      expect(heap.peek()).toBe(9);
      expect(heap.size).toBe(8);
    });

    it('should handle empty array', () => {
      const heap = new DAryHeap4<number>();
      heap.heapify([]);
      expect(heap.isEmpty).toBe(true);
    });

    it('should handle single element array', () => {
      const heap = new DAryHeap4<number>();
      heap.heapify([42]);
      expect(heap.peek()).toBe(42);
    });
  });

  // ─── toArray ───
  describe('toArray', () => {
    it('should return a copy of the internal array', () => {
      const heap = new DAryHeap4<number>();
      heap.insert(1);
      heap.insert(2);
      const arr = heap.toArray();
      expect(arr.length).toBe(2);
      arr.push(99);
      expect(heap.size).toBe(2);
    });
  });

  // ─── contains ───
  describe('contains', () => {
    it('should return false for empty heap', () => {
      const heap = new DAryHeap4<number>();
      expect(heap.contains(1)).toBe(false);
    });

    it('should find existing elements', () => {
      const heap = new DAryHeap4<number>();
      heap.insert(10);
      heap.insert(20);
      expect(heap.contains(10)).toBe(true);
      expect(heap.contains(20)).toBe(true);
      expect(heap.contains(99)).toBe(false);
    });
  });

  // ─── merge ───
  describe('merge', () => {
    it('should merge two heaps', () => {
      const heap1 = new DAryHeap4<number>();
      heap1.insert(1);
      heap1.insert(5);
      const heap2 = new DAryHeap4<number>();
      heap2.insert(3);
      heap2.insert(9);
      const merged = heap1.merge(heap2);
      expect(merged.peek()).toBe(9);
      expect(merged.size).toBe(4);
    });

    it('should not modify the original heaps', () => {
      const heap1 = new DAryHeap4<number>();
      heap1.insert(1);
      const heap2 = new DAryHeap4<number>();
      heap2.insert(2);
      heap1.merge(heap2);
      expect(heap1.size).toBe(1);
      expect(heap2.size).toBe(1);
    });
  });

  // ─── clear ───
  describe('clear', () => {
    it('should remove all elements', () => {
      const heap = new DAryHeap4<number>();
      heap.insert(1);
      heap.insert(2);
      heap.clear();
      expect(heap.isEmpty).toBe(true);
      expect(heap.size).toBe(0);
    });
  });

  // ─── update ───
  describe('update', () => {
    it('should update an element at a given index', () => {
      const heap = new DAryHeap4<number>();
      heap.heapify([1, 2, 3, 4, 5]);
      heap.update(0, 10);
      expect(heap.peek()).toBe(10);
    });

    it('should handle out of bounds index gracefully', () => {
      const heap = new DAryHeap4<number>();
      heap.insert(1);
      expect(() => heap.update(-1, 5)).not.toThrow();
      expect(() => heap.update(99, 5)).not.toThrow();
    });
  });

  // ─── Edge cases ───
  describe('edge cases', () => {
    it('should handle duplicate values', () => {
      const heap = new DAryHeap4<number>();
      heap.insert(5);
      heap.insert(5);
      heap.insert(5);
      expect(heap.extract()).toBe(5);
      expect(heap.extract()).toBe(5);
      expect(heap.extract()).toBe(5);
    });

    it('should work with custom min-heap comparator', () => {
      const heap = new DAryHeap4<number>((a, b) => b - a);
      heap.insert(5);
      heap.insert(1);
      heap.insert(3);
      expect(heap.peek()).toBe(1);
      expect(heap.extract()).toBe(1);
      expect(heap.extract()).toBe(3);
    });

    it('should work with string elements', () => {
      const heap = new DAryHeap4<string>();
      heap.insert('banana');
      heap.insert('apple');
      heap.insert('cherry');
      expect(heap.peek()).toBe('cherry');
    });
  });
});
