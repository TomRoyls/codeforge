import { describe, it, expect } from 'vitest';
import { DWaveHeap } from '../../src/core/d-wave-heap-2/index.js';

describe('DWaveHeap', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('should create an empty heap with defaults', () => {
      const heap = new DWaveHeap<number>();
      expect(heap.size).toBe(0);
      expect(heap.isEmpty).toBe(true);
    });

    it('should accept custom d value', () => {
      const heap = new DWaveHeap<number>(3);
      expect(heap.isEmpty).toBe(true);
    });

    it('should accept a custom comparator', () => {
      const heap = new DWaveHeap<number>(2, (a, b) => b - a);
      expect(heap.isEmpty).toBe(true);
    });

    it('should clamp d to minimum of 2', () => {
      const heap = new DWaveHeap<number>(1);
      heap.insert(5);
      heap.insert(3);
      expect(heap.peekMin()).toBe(3);
    });
  });

  // ─── insert ───
  describe('insert', () => {
    it('should add a single element', () => {
      const heap = new DWaveHeap<number>();
      heap.insert(5);
      expect(heap.size).toBe(1);
      expect(heap.isEmpty).toBe(false);
    });

    it('should maintain min-heap property', () => {
      const heap = new DWaveHeap<number>();
      heap.insert(5);
      heap.insert(1);
      heap.insert(3);
      expect(heap.peekMin()).toBe(1);
    });

    it('should handle many insertions', () => {
      const heap = new DWaveHeap<number>();
      for (let i = 100; i >= 0; i--) {
        heap.insert(i);
      }
      expect(heap.size).toBe(101);
      expect(heap.peekMin()).toBe(0);
    });
  });

  // ─── extractMin ───
  describe('extractMin', () => {
    it('should return undefined when empty', () => {
      const heap = new DWaveHeap<number>();
      expect(heap.extractMin()).toBeUndefined();
    });

    it('should extract the minimum element', () => {
      const heap = new DWaveHeap<number>();
      heap.insert(5);
      heap.insert(1);
      heap.insert(3);
      expect(heap.extractMin()).toBe(1);
      expect(heap.size).toBe(2);
    });

    it('should extract all elements in ascending order', () => {
      const heap = new DWaveHeap<number>();
      heap.insert(3);
      heap.insert(1);
      heap.insert(4);
      heap.insert(1);
      heap.insert(5);
      heap.insert(9);
      const extracted: number[] = [];
      while (!heap.isEmpty) {
        extracted.push(heap.extractMin()!);
      }
      expect(extracted).toEqual([1, 1, 3, 4, 5, 9]);
    });
  });

  // ─── extractMax ───
  describe('extractMax', () => {
    it('should return undefined when empty', () => {
      const heap = new DWaveHeap<number>();
      expect(heap.extractMax()).toBeUndefined();
    });

    it('should extract the maximum element', () => {
      const heap = new DWaveHeap<number>();
      heap.insert(5);
      heap.insert(1);
      heap.insert(3);
      expect(heap.extractMax()).toBe(5);
      expect(heap.size).toBe(2);
    });
  });

  // ─── peekMin / peekMax ───
  describe('peekMin and peekMax', () => {
    it('should return undefined when empty', () => {
      const heap = new DWaveHeap<number>();
      expect(heap.peekMin()).toBeUndefined();
      expect(heap.peekMax()).toBeUndefined();
    });

    it('should return min and max without removing', () => {
      const heap = new DWaveHeap<number>();
      heap.insert(10);
      heap.insert(1);
      heap.insert(5);
      expect(heap.peekMin()).toBe(1);
      expect(heap.peekMax()).toBe(10);
      expect(heap.size).toBe(3);
    });
  });

  // ─── contains ───
  describe('contains', () => {
    it('should return false for empty heap', () => {
      const heap = new DWaveHeap<number>();
      expect(heap.contains(1)).toBe(false);
    });

    it('should find existing elements', () => {
      const heap = new DWaveHeap<number>();
      heap.insert(10);
      heap.insert(20);
      expect(heap.contains(10)).toBe(true);
      expect(heap.contains(20)).toBe(true);
      expect(heap.contains(99)).toBe(false);
    });
  });

  // ─── toArray ───
  describe('toArray', () => {
    it('should return a copy of the heap array', () => {
      const heap = new DWaveHeap<number>();
      heap.insert(1);
      heap.insert(2);
      const arr = heap.toArray();
      expect(arr.length).toBe(2);
      arr.push(99);
      expect(heap.size).toBe(2);
    });
  });

  // ─── clear ───
  describe('clear', () => {
    it('should remove all elements', () => {
      const heap = new DWaveHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.clear();
      expect(heap.isEmpty).toBe(true);
      expect(heap.size).toBe(0);
    });
  });

  // ─── heapify ───
  describe('heapify', () => {
    it('should build a valid heap from an array', () => {
      const heap = new DWaveHeap<number>();
      heap.heapify([3, 1, 4, 1, 5, 9, 2, 6]);
      expect(heap.peekMin()).toBe(1);
      expect(heap.size).toBe(8);
    });

    it('should handle empty array', () => {
      const heap = new DWaveHeap<number>();
      heap.heapify([]);
      expect(heap.isEmpty).toBe(true);
    });

    it('should handle single element', () => {
      const heap = new DWaveHeap<number>();
      heap.heapify([42]);
      expect(heap.peekMin()).toBe(42);
    });
  });

  // ─── merge ───
  describe('merge', () => {
    it('should merge two heaps', () => {
      const h1 = new DWaveHeap<number>();
      h1.insert(1);
      h1.insert(5);
      const h2 = new DWaveHeap<number>();
      h2.insert(3);
      h2.insert(9);
      const merged = h1.merge(h2);
      expect(merged.peekMin()).toBe(1);
      expect(merged.size).toBe(4);
    });

    it('should not modify the original heaps', () => {
      const h1 = new DWaveHeap<number>();
      h1.insert(1);
      const h2 = new DWaveHeap<number>();
      h2.insert(2);
      h1.merge(h2);
      expect(h1.size).toBe(1);
      expect(h2.size).toBe(1);
    });
  });

  // ─── delete ───
  describe('delete', () => {
    it('should remove an existing element', () => {
      const heap = new DWaveHeap<number>();
      heap.insert(10);
      heap.insert(20);
      heap.insert(30);
      expect(heap.delete(20)).toBe(true);
      expect(heap.size).toBe(2);
      expect(heap.contains(20)).toBe(false);
    });

    it('should return false for missing element', () => {
      const heap = new DWaveHeap<number>();
      heap.insert(10);
      expect(heap.delete(99)).toBe(false);
      expect(heap.size).toBe(1);
    });
  });

  // ─── Edge cases ───
  describe('edge cases', () => {
    it('should handle duplicate values', () => {
      const heap = new DWaveHeap<number>();
      heap.insert(5);
      heap.insert(5);
      heap.insert(5);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(5);
    });

    it('should handle negative numbers', () => {
      const heap = new DWaveHeap<number>();
      heap.insert(-5);
      heap.insert(-1);
      heap.insert(0);
      expect(heap.peekMin()).toBe(-5);
      expect(heap.peekMax()).toBe(0);
    });

    it('should work with string elements', () => {
      const heap = new DWaveHeap<string>();
      heap.insert('banana');
      heap.insert('apple');
      heap.insert('cherry');
      expect(heap.peekMin()).toBe('apple');
    });
  });
});
