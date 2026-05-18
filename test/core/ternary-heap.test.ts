import { describe, it, expect } from 'vitest';
import { TernaryHeap } from '../../src/core/ternary-heap/index.js';

describe('TernaryHeap', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('should create an empty min-heap by default', () => {
      const h = new TernaryHeap<number>();
      expect(h.size).toBe(0);
      expect(h.isEmpty()).toBe(true);
    });

    it('should accept a custom comparator for max-heap', () => {
      const h = new TernaryHeap<number>((a, b) => b - a);
      h.insert(1);
      h.insert(3);
      h.insert(2);
      expect(h.peek()).toBe(3);
    });
  });

  // ─── insert/peek ───
  describe('insert/peek', () => {
    it('should insert and peek a single value', () => {
      const h = new TernaryHeap<number>();
      h.insert(5);
      expect(h.peek()).toBe(5);
      expect(h.size).toBe(1);
    });

    it('should maintain min-heap property', () => {
      const h = new TernaryHeap<number>();
      h.insert(5);
      h.insert(3);
      h.insert(7);
      h.insert(1);
      expect(h.peek()).toBe(1);
    });

    it('should return undefined for peek on empty heap', () => {
      const h = new TernaryHeap<number>();
      expect(h.peek()).toBeUndefined();
    });
  });

  // ─── extractMin ───
  describe('extractMin', () => {
    it('should extract minimum value', () => {
      const h = new TernaryHeap<number>();
      h.insert(5);
      h.insert(3);
      h.insert(7);
      expect(h.extractMin()).toBe(3);
      expect(h.extractMin()).toBe(5);
      expect(h.extractMin()).toBe(7);
    });

    it('should return undefined for empty heap', () => {
      const h = new TernaryHeap<number>();
      expect(h.extractMin()).toBeUndefined();
    });

    it('should handle single element', () => {
      const h = new TernaryHeap<number>();
      h.insert(42);
      expect(h.extractMin()).toBe(42);
      expect(h.size).toBe(0);
    });

    it('should extract all elements in sorted order', () => {
      const h = new TernaryHeap<number>();
      const values = [9, 3, 7, 1, 5, 2, 8, 4, 6];
      values.forEach(v => h.insert(v));
      const sorted: number[] = [];
      while (!h.isEmpty()) sorted.push(h.extractMin()!);
      expect(sorted).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
  });

  // ─── heapify ───
  describe('heapify', () => {
    it('should heapify an array', () => {
      const h = new TernaryHeap<number>();
      h.heapify([5, 3, 7, 1, 9]);
      expect(h.peek()).toBe(1);
      expect(h.size).toBe(5);
    });

    it('should heapify an empty array', () => {
      const h = new TernaryHeap<number>();
      h.heapify([]);
      expect(h.size).toBe(0);
    });
  });

  // ─── merge ───
  describe('merge', () => {
    it('should merge two heaps', () => {
      const h1 = new TernaryHeap<number>();
      h1.insert(1);
      h1.insert(5);
      const h2 = new TernaryHeap<number>();
      h2.insert(3);
      h2.insert(7);
      h1.merge(h2);
      expect(h1.size).toBe(4);
      expect(h1.extractMin()).toBe(1);
    });
  });

  // ─── replace ───
  describe('replace', () => {
    it('should replace root with new value', () => {
      const h = new TernaryHeap<number>();
      h.insert(1);
      h.insert(5);
      const old = h.replace(3);
      expect(old).toBe(1);
      expect(h.peek()).toBe(3);
    });

    it('should insert if heap is empty', () => {
      const h = new TernaryHeap<number>();
      const old = h.replace(5);
      expect(old).toBeUndefined();
      expect(h.peek()).toBe(5);
    });
  });

  // ─── pushPop ───
  describe('pushPop', () => {
    it('should push then pop', () => {
      const h = new TernaryHeap<number>();
      h.insert(3);
      const result = h.pushPop(1);
      expect(result).toBe(1);
    });

    it('should handle empty heap', () => {
      const h = new TernaryHeap<number>();
      const result = h.pushPop(5);
      expect(result).toBe(5);
    });
  });

  // ─── toArray ───
  describe('toArray', () => {
    it('should return a copy of the array', () => {
      const h = new TernaryHeap<number>();
      h.insert(3);
      h.insert(1);
      h.insert(2);
      const arr = h.toArray();
      expect(arr.length).toBe(3);
      expect(arr).not.toBe(h.toArray());
    });
  });

  // ─── clear ───
  describe('clear', () => {
    it('should clear all elements', () => {
      const h = new TernaryHeap<number>();
      h.insert(1);
      h.insert(2);
      h.clear();
      expect(h.size).toBe(0);
      expect(h.isEmpty()).toBe(true);
    });
  });

  // ─── Stress ───
  describe('stress', () => {
    it('should handle 100 insertions and extractions', () => {
      const h = new TernaryHeap<number>();
      for (let i = 100; i >= 1; i--) h.insert(i);
      expect(h.size).toBe(100);
      for (let i = 1; i <= 100; i++) {
        expect(h.extractMin()).toBe(i);
      }
      expect(h.isEmpty()).toBe(true);
    });
  });
});
