import { describe, it, expect } from 'vitest';
import { DHeap } from '../../src/core/d-heap/index.js';

describe('DHeap', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('should create a heap with default d=4', () => {
      const heap = new DHeap<number>();
      heap.insert(5);
      expect(heap.size).toBe(1);
      expect(heap.isEmpty()).toBe(false);
    });

    it('should create a heap with custom d', () => {
      const heap = new DHeap<number>(2);
      heap.insert(3);
      heap.insert(1);
      heap.insert(2);
      expect(heap.peek()).toBe(1);
    });

    it('should throw for d < 2', () => {
      expect(() => new DHeap<number>(1)).toThrow('Branching factor d must be at least 2');
    });

    it('should accept a custom comparator', () => {
      const heap = new DHeap<number>(3, (a, b) => b - a);
      heap.insert(1);
      heap.insert(3);
      heap.insert(2);
      expect(heap.peek()).toBe(3);
    });
  });

  // ─── insert ───
  describe('insert', () => {
    it('should insert a single element', () => {
      const heap = new DHeap<number>();
      heap.insert(10);
      expect(heap.size).toBe(1);
      expect(heap.peek()).toBe(10);
    });

    it('should maintain min-heap property', () => {
      const heap = new DHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(8);
      heap.insert(1);
      heap.insert(4);
      expect(heap.peek()).toBe(1);
    });

    it('should handle duplicate values', () => {
      const heap = new DHeap<number>();
      heap.insert(5);
      heap.insert(5);
      heap.insert(5);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(5);
    });

    it('should handle negative values', () => {
      const heap = new DHeap<number>();
      heap.insert(-3);
      heap.insert(0);
      heap.insert(-10);
      expect(heap.peek()).toBe(-10);
    });
  });

  // ─── extractMin ───
  describe('extractMin', () => {
    it('should return undefined when heap is empty', () => {
      const heap = new DHeap<number>();
      expect(heap.extractMin()).toBeUndefined();
    });

    it('should extract the minimum element', () => {
      const heap = new DHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.extractMin()).toBe(3);
      expect(heap.peek()).toBe(5);
    });

    it('should extract all elements in sorted order', () => {
      const heap = new DHeap<number>();
      const values = [5, 3, 8, 1, 4, 7, 2, 6];
      for (const v of values) heap.insert(v);
      const sorted: number[] = [];
      while (!heap.isEmpty()) {
        sorted.push(heap.extractMin()!);
      }
      expect(sorted).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });

    it('should handle extracting the last element', () => {
      const heap = new DHeap<number>();
      heap.insert(42);
      expect(heap.extractMin()).toBe(42);
      expect(heap.isEmpty()).toBe(true);
    });
  });

  // ─── peek ───
  describe('peek', () => {
    it('should return undefined for empty heap', () => {
      const heap = new DHeap<number>();
      expect(heap.peek()).toBeUndefined();
    });

    it('should return the minimum element without removing it', () => {
      const heap = new DHeap<number>();
      heap.insert(10);
      heap.insert(5);
      expect(heap.peek()).toBe(5);
      expect(heap.size).toBe(2);
    });
  });

  // ─── size ───
  describe('size', () => {
    it('should return 0 for empty heap', () => {
      const heap = new DHeap<number>();
      expect(heap.size).toBe(0);
    });

    it('should track size after insertions and extractions', () => {
      const heap = new DHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      expect(heap.size).toBe(3);
      heap.extractMin();
      expect(heap.size).toBe(2);
    });
  });

  // ─── isEmpty ───
  describe('isEmpty', () => {
    it('should return true for new heap', () => {
      const heap = new DHeap<number>();
      expect(heap.isEmpty()).toBe(true);
    });

    it('should return false after insertion', () => {
      const heap = new DHeap<number>();
      heap.insert(1);
      expect(heap.isEmpty()).toBe(false);
    });
  });

  // ─── clear ───
  describe('clear', () => {
    it('should remove all elements', () => {
      const heap = new DHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size).toBe(0);
    });
  });

  // ─── toArray ───
  describe('toArray', () => {
    it('should return empty array for empty heap', () => {
      const heap = new DHeap<number>();
      expect(heap.toArray()).toEqual([]);
    });

    it('should return a copy of the internal array', () => {
      const heap = new DHeap<number>();
      heap.insert(1);
      heap.insert(2);
      const arr = heap.toArray();
      expect(arr.length).toBe(2);
      arr.push(999);
      expect(heap.size).toBe(2);
    });
  });

  // ─── heapify ───
  describe('heapify', () => {
    it('should build a valid heap from an array', () => {
      const heap = new DHeap<number>();
      heap.heapify([5, 3, 8, 1, 4]);
      expect(heap.peek()).toBe(1);
    });

    it('should extract all elements in sorted order after heapify', () => {
      const heap = new DHeap<number>();
      heap.heapify([9, 2, 7, 1, 5, 3]);
      const sorted: number[] = [];
      while (!heap.isEmpty()) {
        sorted.push(heap.extractMin()!);
      }
      expect(sorted).toEqual([1, 2, 3, 5, 7, 9]);
    });

    it('should handle empty array', () => {
      const heap = new DHeap<number>();
      heap.heapify([]);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should handle single element array', () => {
      const heap = new DHeap<number>();
      heap.heapify([42]);
      expect(heap.peek()).toBe(42);
    });
  });

  // ─── update ───
  describe('update', () => {
    it('should update an element and re-heapify', () => {
      const heap = new DHeap<number>();
      heap.heapify([5, 3, 8]);
      heap.update(1, 1);
      expect(heap.peek()).toBe(1);
    });

    it('should throw for out of bounds index', () => {
      const heap = new DHeap<number>();
      heap.insert(1);
      expect(() => heap.update(5, 10)).toThrow('Index out of bounds');
      expect(() => heap.update(-1, 10)).toThrow('Index out of bounds');
    });

    it('should handle updating to a larger value', () => {
      const heap = new DHeap<number>();
      heap.heapify([1, 3, 5]);
      heap.update(0, 10);
      expect(heap.extractMin()).toBe(3);
    });
  });

  // ─── Edge Cases ───
  describe('edge cases', () => {
    it('should work with d=2 (binary heap)', () => {
      const heap = new DHeap<number>(2);
      for (let i = 10; i >= 1; i--) heap.insert(i);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(2);
    });

    it('should work with large d using insert', () => {
      const heap = new DHeap<number>(10);
      for (let i = 9; i >= 1; i--) heap.insert(i);
      expect(heap.extractMin()).toBe(1);
    });

    it('should work with large d using heapify on larger dataset', () => {
      const heap = new DHeap<number>(10);
      const values = Array.from({ length: 20 }, (_, i) => 20 - i);
      heap.heapify(values);
      expect(heap.extractMin()).toBe(1);
    });

    it('should work with string elements using default comparator', () => {
      const heap = new DHeap<string>();
      heap.insert('cherry');
      heap.insert('apple');
      heap.insert('banana');
      expect(heap.extractMin()).toBe('apple');
    });

    it('should handle single element', () => {
      const heap = new DHeap<number>();
      heap.insert(1);
      expect(heap.peek()).toBe(1);
      expect(heap.extractMin()).toBe(1);
      expect(heap.isEmpty()).toBe(true);
      expect(heap.extractMin()).toBeUndefined();
    });
  });
});
