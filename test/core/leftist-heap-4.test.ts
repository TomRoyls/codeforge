import { describe, it, expect } from 'vitest';
import { LeftistHeap4 } from '../../src/core/leftist-heap-4/index.js';

describe('LeftistHeap4', () => {
  // ─── Constructor ───

  describe('constructor', () => {
    it('creates empty heap', () => {
      const heap = new LeftistHeap4<number>();
      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });

    it('accepts custom comparator', () => {
      const heap = new LeftistHeap4<number>((a, b) => b - a);
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      expect(heap.peek()).toBe(3);
    });
  });

  // ─── insert ───

  describe('insert', () => {
    it('inserts a single element', () => {
      const heap = new LeftistHeap4<number>();
      heap.insert(5);
      expect(heap.size).toBe(1);
      expect(heap.isEmpty()).toBe(false);
      expect(heap.peek()).toBe(5);
    });

    it('inserts multiple elements in any order', () => {
      const heap = new LeftistHeap4<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      expect(heap.size).toBe(4);
      expect(heap.peek()).toBe(1);
    });

    it('inserts duplicate values', () => {
      const heap = new LeftistHeap4<number>();
      heap.insert(5);
      heap.insert(5);
      heap.insert(5);
      expect(heap.size).toBe(3);
    });

    it('inserts negative numbers', () => {
      const heap = new LeftistHeap4<number>();
      heap.insert(-10);
      heap.insert(-5);
      heap.insert(-20);
      expect(heap.peek()).toBe(-20);
    });

    it('inserts zero', () => {
      const heap = new LeftistHeap4<number>();
      heap.insert(0);
      expect(heap.peek()).toBe(0);
    });

    it('maintains min-heap property after many inserts', () => {
      const heap = new LeftistHeap4<number>();
      for (let i = 10; i >= 1; i--) {
        heap.insert(i);
      }
      expect(heap.peek()).toBe(1);
      expect(heap.size).toBe(10);
    });
  });

  // ─── extractMin ───

  describe('extractMin', () => {
    it('returns undefined for empty heap', () => {
      const heap = new LeftistHeap4<number>();
      expect(heap.extractMin()).toBeUndefined();
    });

    it('extracts the minimum element', () => {
      const heap = new LeftistHeap4<number>();
      heap.insert(3);
      heap.insert(1);
      heap.insert(2);
      expect(heap.extractMin()).toBe(1);
    });

    it('extracts elements in sorted order', () => {
      const heap = new LeftistHeap4<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      heap.insert(4);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(4);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(7);
      expect(heap.extractMin()).toBeUndefined();
    });

    it('decreases size after extraction', () => {
      const heap = new LeftistHeap4<number>();
      heap.insert(1);
      heap.insert(2);
      expect(heap.size).toBe(2);
      heap.extractMin();
      expect(heap.size).toBe(1);
    });

    it('handles single element extract', () => {
      const heap = new LeftistHeap4<number>();
      heap.insert(42);
      expect(heap.extractMin()).toBe(42);
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size).toBe(0);
    });

    it('handles duplicates correctly', () => {
      const heap = new LeftistHeap4<number>();
      heap.insert(1);
      heap.insert(1);
      heap.insert(1);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBeUndefined();
    });

    it('handles negative values', () => {
      const heap = new LeftistHeap4<number>();
      heap.insert(-3);
      heap.insert(-1);
      heap.insert(-2);
      expect(heap.extractMin()).toBe(-3);
      expect(heap.extractMin()).toBe(-2);
      expect(heap.extractMin()).toBe(-1);
    });
  });

  // ─── peek ───

  describe('peek', () => {
    it('returns undefined for empty heap', () => {
      const heap = new LeftistHeap4<number>();
      expect(heap.peek()).toBeUndefined();
    });

    it('returns minimum without removing it', () => {
      const heap = new LeftistHeap4<number>();
      heap.insert(5);
      heap.insert(2);
      expect(heap.peek()).toBe(2);
      expect(heap.peek()).toBe(2);
      expect(heap.size).toBe(2);
    });
  });

  // ─── merge ───

  describe('merge', () => {
    it('merges two non-empty heaps', () => {
      const heap1 = new LeftistHeap4<number>();
      heap1.insert(1);
      heap1.insert(3);
      const heap2 = new LeftistHeap4<number>();
      heap2.insert(2);
      heap2.insert(4);

      heap1.merge(heap2);
      expect(heap1.size).toBe(4);
      expect(heap1.peek()).toBe(1);
      expect(heap2.size).toBe(0);
      expect(heap2.isEmpty()).toBe(true);
    });

    it('merges with empty heap', () => {
      const heap1 = new LeftistHeap4<number>();
      heap1.insert(1);
      const heap2 = new LeftistHeap4<number>();
      heap1.merge(heap2);
      expect(heap1.size).toBe(1);
      expect(heap1.peek()).toBe(1);
    });

    it('merge empty heap into non-empty', () => {
      const heap1 = new LeftistHeap4<number>();
      const heap2 = new LeftistHeap4<number>();
      heap2.insert(5);
      heap1.merge(heap2);
      expect(heap1.size).toBe(1);
      expect(heap1.peek()).toBe(5);
    });

    it('merged heap extracts in sorted order', () => {
      const heap1 = new LeftistHeap4<number>();
      heap1.insert(1);
      heap1.insert(4);
      const heap2 = new LeftistHeap4<number>();
      heap2.insert(2);
      heap2.insert(3);
      heap1.merge(heap2);
      expect(heap1.extractMin()).toBe(1);
      expect(heap1.extractMin()).toBe(2);
      expect(heap1.extractMin()).toBe(3);
      expect(heap1.extractMin()).toBe(4);
    });
  });

  // ─── clear ───

  describe('clear', () => {
    it('clears the heap', () => {
      const heap = new LeftistHeap4<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size).toBe(0);
      expect(heap.peek()).toBeUndefined();
    });

    it('clear on empty heap is no-op', () => {
      const heap = new LeftistHeap4<number>();
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
    });
  });

  // ─── toArray ───

  describe('toArray', () => {
    it('returns empty array for empty heap', () => {
      const heap = new LeftistHeap4<number>();
      expect(heap.toArray()).toEqual([]);
    });

    it('returns elements in sorted order', () => {
      const heap = new LeftistHeap4<number>();
      heap.insert(3);
      heap.insert(1);
      heap.insert(2);
      expect(heap.toArray()).toEqual([1, 2, 3]);
    });

    it('does not modify the heap', () => {
      const heap = new LeftistHeap4<number>();
      heap.insert(3);
      heap.insert(1);
      heap.toArray();
      expect(heap.size).toBe(2);
      expect(heap.peek()).toBe(1);
    });
  });

  // ─── fromArray ───

  describe('fromArray', () => {
    it('creates heap from empty array', () => {
      const heap = LeftistHeap4.fromArray<number>([]);
      expect(heap.isEmpty()).toBe(true);
    });

    it('creates heap from array of numbers', () => {
      const heap = LeftistHeap4.fromArray([5, 3, 1, 4, 2]);
      expect(heap.size).toBe(5);
      expect(heap.peek()).toBe(1);
    });

    it('creates heap with custom comparator', () => {
      const heap = LeftistHeap4.fromArray([1, 2, 3], (a, b) => b - a);
      expect(heap.peek()).toBe(3);
    });

    it('extracts in sorted order', () => {
      const heap = LeftistHeap4.fromArray([5, 3, 1, 4, 2]);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(2);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(4);
      expect(heap.extractMin()).toBe(5);
    });

    it('handles single element array', () => {
      const heap = LeftistHeap4.fromArray([42]);
      expect(heap.size).toBe(1);
      expect(heap.peek()).toBe(42);
    });
  });

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('handles string comparison with custom comparator', () => {
      const heap = new LeftistHeap4<string>();
      heap.insert('cherry');
      heap.insert('apple');
      heap.insert('banana');
      expect(heap.extractMin()).toBe('apple');
      expect(heap.extractMin()).toBe('banana');
      expect(heap.extractMin()).toBe('cherry');
    });

    it('handles large number of inserts and extracts', () => {
      const heap = new LeftistHeap4<number>();
      for (let i = 100; i >= 1; i--) {
        heap.insert(i);
      }
      for (let i = 1; i <= 100; i++) {
        expect(heap.extractMin()).toBe(i);
      }
      expect(heap.isEmpty()).toBe(true);
    });
  });
});
