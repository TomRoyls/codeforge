import { describe, it, expect } from 'vitest';
import { QuadHeap } from './src/core/quad-heap/index.js';

describe('QuadHeap', () => {
  describe('insert and extractMin', () => {
    it('should insert and extract a single element', () => {
      const heap = new QuadHeap<number>();
      heap.insert(5);
      expect(heap.size()).toBe(1);
      expect(heap.extractMin()).toBe(5);
      expect(heap.size()).toBe(0);
    });

    it('should insert multiple elements and extract in order', () => {
      const heap = new QuadHeap<number>();
      heap.insert(3);
      heap.insert(1);
      heap.insert(4);
      heap.insert(2);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(2);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(4);
    });

    it('should handle duplicate values', () => {
      const heap = new QuadHeap<number>();
      heap.insert(5);
      heap.insert(5);
      heap.insert(3);
      heap.insert(3);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(5);
    });

    it('should return null when extracting from empty heap', () => {
      const heap = new QuadHeap<number>();
      expect(heap.extractMin()).toBe(null);
    });

    it('should maintain min-heap property after many inserts', () => {
      const heap = new QuadHeap<number>();
      heap.insert(10);
      heap.insert(5);
      heap.insert(15);
      heap.insert(3);
      heap.insert(8);
      heap.insert(20);
      heap.insert(1);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(8);
      expect(heap.extractMin()).toBe(10);
      expect(heap.extractMin()).toBe(15);
      expect(heap.extractMin()).toBe(20);
    });

    it('should handle negative numbers', () => {
      const heap = new QuadHeap<number>();
      heap.insert(-5);
      heap.insert(10);
      heap.insert(-3);
      heap.insert(0);
      heap.insert(-10);
      expect(heap.extractMin()).toBe(-10);
      expect(heap.extractMin()).toBe(-5);
      expect(heap.extractMin()).toBe(-3);
      expect(heap.extractMin()).toBe(0);
      expect(heap.extractMin()).toBe(10);
    });

    it('should handle strings', () => {
      const heap = new QuadHeap<string>();
      heap.insert('banana');
      heap.insert('apple');
      heap.insert('cherry');
      heap.insert('date');
      expect(heap.extractMin()).toBe('apple');
      expect(heap.extractMin()).toBe('banana');
      expect(heap.extractMin()).toBe('cherry');
      expect(heap.extractMin()).toBe('date');
    });

    it('should handle mixed insertions and extractions', () => {
      const heap = new QuadHeap<number>();
      heap.insert(5);
      heap.insert(2);
      expect(heap.extractMin()).toBe(2);
      heap.insert(3);
      heap.insert(1);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(5);
    });
  });

  describe('peek', () => {
    it('should return the minimum element without removing it', () => {
      const heap = new QuadHeap<number>();
      heap.insert(5);
      heap.insert(2);
      heap.insert(8);
      expect(heap.peek()).toBe(2);
      expect(heap.size()).toBe(3);
    });

    it('should return null for empty heap', () => {
      const heap = new QuadHeap<number>();
      expect(heap.peek()).toBe(null);
    });

    it('should return same value after multiple peeks', () => {
      const heap = new QuadHeap<number>();
      heap.insert(3);
      heap.insert(1);
      heap.insert(4);
      expect(heap.peek()).toBe(1);
      expect(heap.peek()).toBe(1);
      expect(heap.peek()).toBe(1);
      expect(heap.extractMin()).toBe(1);
      expect(heap.peek()).toBe(3);
    });

    it('should return minimum after many inserts', () => {
      const heap = new QuadHeap<number>();
      for (let i = 100; i > 0; i--) {
        heap.insert(i);
      }
      expect(heap.peek()).toBe(1);
      expect(heap.extractMin()).toBe(1);
      expect(heap.peek()).toBe(2);
    });
  });

  describe('size', () => {
    it('should return 0 for empty heap', () => {
      const heap = new QuadHeap<number>();
      expect(heap.size()).toBe(0);
    });

    it('should return correct size after inserts', () => {
      const heap = new QuadHeap<number>();
      heap.insert(1);
      expect(heap.size()).toBe(1);
      heap.insert(2);
      expect(heap.size()).toBe(2);
      heap.insert(3);
      expect(heap.size()).toBe(3);
    });

    it('should update size after extraction', () => {
      const heap = new QuadHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      expect(heap.size()).toBe(3);
      heap.extractMin();
      expect(heap.size()).toBe(2);
      heap.extractMin();
      expect(heap.size()).toBe(1);
    });

    it('should track size correctly with many operations', () => {
      const heap = new QuadHeap<number>();
      for (let i = 0; i < 100; i++) {
        heap.insert(i);
      }
      expect(heap.size()).toBe(100);
      for (let i = 0; i < 50; i++) {
        heap.extractMin();
      }
      expect(heap.size()).toBe(50);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty heap', () => {
      const heap = new QuadHeap<number>();
      expect(heap.isEmpty()).toBe(true);
    });

    it('should return false after insert', () => {
      const heap = new QuadHeap<number>();
      heap.insert(1);
      expect(heap.isEmpty()).toBe(false);
    });

    it('should return true after extracting all elements', () => {
      const heap = new QuadHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      expect(heap.isEmpty()).toBe(false);
      heap.extractMin();
      heap.extractMin();
      heap.extractMin();
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear all elements', () => {
      const heap = new QuadHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size()).toBe(0);
      expect(heap.peek()).toBe(null);
    });

    it('should work on empty heap', () => {
      const heap = new QuadHeap<number>();
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
    });

    it('should allow reuse after clear', () => {
      const heap = new QuadHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.clear();
      heap.insert(1);
      heap.insert(2);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(2);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty heap', () => {
      const heap = new QuadHeap<number>();
      expect(heap.toArray()).toEqual([]);
    });

    it('should return all elements', () => {
      const heap = new QuadHeap<number>();
      heap.insert(3);
      heap.insert(1);
      heap.insert(4);
      heap.insert(2);
      const arr = heap.toArray();
      expect(arr.length).toBe(4);
      expect(arr).toContain(1);
      expect(arr).toContain(2);
      expect(arr).toContain(3);
      expect(arr).toContain(4);
    });

    it('should not modify heap when returning array', () => {
      const heap = new QuadHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      const arr = heap.toArray();
      arr.push(100);
      expect(heap.size()).toBe(3);
    });
  });

  describe('heapify', () => {
    it('should build heap from array', () => {
      const heap = new QuadHeap<number>();
      heap.heapify([5, 3, 7, 1, 4, 2, 6, 8]);
      expect(heap.size()).toBe(8);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(2);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(4);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(6);
      expect(heap.extractMin()).toBe(7);
      expect(heap.extractMin()).toBe(8);
    });

    it('should handle empty array', () => {
      const heap = new QuadHeap<number>();
      heap.heapify([]);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should handle single element', () => {
      const heap = new QuadHeap<number>();
      heap.heapify([42]);
      expect(heap.size()).toBe(1);
      expect(heap.peek()).toBe(42);
    });

    it('should handle many elements', () => {
      const heap = new QuadHeap<number>();
      const values = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
      heap.heapify(values);
      expect(heap.size()).toBe(10);
      for (let i = 1; i <= 10; i++) {
        expect(heap.extractMin()).toBe(i);
      }
    });

    it('should replace existing heap', () => {
      const heap = new QuadHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.heapify([5, 4, 3]);
      expect(heap.size()).toBe(3);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(4);
      expect(heap.extractMin()).toBe(5);
    });
  });

  describe('replace', () => {
    it('should replace minimum and return old minimum', () => {
      const heap = new QuadHeap<number>();
      heap.insert(3);
      heap.insert(1);
      heap.insert(4);
      heap.insert(2);
      const result = heap.replace(0);
      expect(result).toBe(1);
      expect(heap.peek()).toBe(0);
      expect(heap.size()).toBe(4);
    });

    it('should return null for empty heap', () => {
      const heap = new QuadHeap<number>();
      const result = heap.replace(5);
      expect(result).toBe(null);
    });

    it('should maintain heap property after replace', () => {
      const heap = new QuadHeap<number>();
      heap.heapify([5, 10, 15, 20, 25]);
      const result = heap.replace(3);
      expect(result).toBe(5);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(10);
      expect(heap.extractMin()).toBe(15);
    });

    it('should handle replacing with larger value', () => {
      const heap = new QuadHeap<number>();
      heap.heapify([1, 5, 10, 15]);
      const result = heap.replace(8);
      expect(result).toBe(1);
      expect(heap.extractMin()).toBe(5);
    });
  });

  describe('pushPop', () => {
    it('should push and pop efficiently', () => {
      const heap = new QuadHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      const result = heap.pushPop(2);
      expect(result).toBe(2);
      expect(heap.size()).toBe(3);
      expect(heap.peek()).toBe(3);
    });

    it('should push value that becomes new minimum', () => {
      const heap = new QuadHeap<number>();
      heap.heapify([10, 20, 30, 40]);
      const result = heap.pushPop(5);
      expect(result).toBe(5);
      expect(heap.peek()).toBe(10);
    });

    it('should return null for empty heap', () => {
      const heap = new QuadHeap<number>();
      const result = heap.pushPop(5);
      expect(result).toBe(null);
      expect(heap.size()).toBe(1);
      expect(heap.peek()).toBe(5);
    });

    it('should be more efficient than insert + extractMin', () => {
      const heap = new QuadHeap<number>();
      heap.heapify([10, 20, 30, 40, 50]);
      const result = heap.pushPop(35);
      expect(result).toBe(10);
      expect(heap.size()).toBe(5);
    });

    it('should handle duplicate values', () => {
      const heap = new QuadHeap<number>();
      heap.heapify([5, 5, 5]);
      const result = heap.pushPop(5);
      expect(result).toBe(5);
      expect(heap.size()).toBe(3);
    });
  });

  describe('custom comparator', () => {
    it('should work with max-heap comparator', () => {
      const heap = new QuadHeap<number>((a, b) => b - a);
      heap.insert(3);
      heap.insert(1);
      heap.insert(4);
      heap.insert(2);
      expect(heap.extractMin()).toBe(4);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(2);
      expect(heap.extractMin()).toBe(1);
    });

    it('should work with object comparator', () => {
      const heap = new QuadHeap<{ value: number }>((a, b) => a.value - b.value);
      heap.insert({ value: 3 });
      heap.insert({ value: 1 });
      heap.insert({ value: 4 });
      heap.insert({ value: 2 });
      expect(heap.extractMin()!.value).toBe(1);
      expect(heap.extractMin()!.value).toBe(2);
      expect(heap.extractMin()!.value).toBe(3);
      expect(heap.extractMin()!.value).toBe(4);
    });

    it('should work with string length comparator', () => {
      const heap = new QuadHeap<string>((a, b) => a.length - b.length);
      heap.insert('aaa');
      heap.insert('b');
      heap.insert('cc');
      heap.insert('dddd');
      expect(heap.extractMin()).toBe('b');
      expect(heap.extractMin()).toBe('cc');
      expect(heap.extractMin()).toBe('aaa');
      expect(heap.extractMin()).toBe('dddd');
    });
  });

  describe('stress test', () => {
    it('should handle 1000 elements', () => {
      const heap = new QuadHeap<number>();
      const values: number[] = [];
      for (let i = 0; i < 1000; i++) {
        values.push(i);
      }
      const shuffled = [...values].sort(() => Math.random() - 0.5);
      for (const val of shuffled) {
        heap.insert(val);
      }
      for (let i = 0; i < 1000; i++) {
        expect(heap.extractMin()).toBe(i);
      }
      expect(heap.isEmpty()).toBe(true);
    });

    it('should handle heapify with large array', () => {
      const heap = new QuadHeap<number>();
      const values: number[] = [];
      for (let i = 1000; i > 0; i--) {
        values.push(i);
      }
      heap.heapify(values);
      for (let i = 1; i <= 1000; i++) {
        expect(heap.extractMin()).toBe(i);
      }
      expect(heap.isEmpty()).toBe(true);
    });

    it('should maintain heap property through many operations', () => {
      const heap = new QuadHeap<number>();
      const sorted: number[] = [];
      for (let i = 0; i < 500; i++) {
        heap.insert(Math.floor(Math.random() * 1000));
      }
      while (!heap.isEmpty()) {
        sorted.push(heap.extractMin()!);
      }
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i]! >= sorted[i - 1]!).toBe(true);
      }
    });
  });

  describe('ordering correctness', () => {
    it('should extract in correct order for sequential inserts', () => {
      const heap = new QuadHeap<number>();
      for (let i = 100; i >= 1; i--) {
        heap.insert(i);
      }
      for (let i = 1; i <= 100; i++) {
        expect(heap.extractMin()).toBe(i);
      }
    });

    it('should extract in correct order for random inserts', () => {
      const heap = new QuadHeap<number>();
      const values = Array.from({ length: 50 }, (_, i) => i + 1);
      const shuffled = [...values].sort(() => Math.random() - 0.5);
      for (const val of shuffled) {
        heap.insert(val);
      }
      values.sort((a, b) => a - b);
      for (const val of values) {
        expect(heap.extractMin()).toBe(val);
      }
    });

    it('should handle edge case values', () => {
      const heap = new QuadHeap<number>();
      heap.insert(Number.MAX_SAFE_INTEGER);
      heap.insert(Number.MIN_SAFE_INTEGER);
      heap.insert(0);
      heap.insert(-0);
      heap.insert(Infinity);
      heap.insert(-Infinity);
      const results: number[] = [];
      while (!heap.isEmpty()) {
        results.push(heap.extractMin()!);
      }
      expect(results[0]).toBe(-Infinity);
      expect(results[1]).toBe(Number.MIN_SAFE_INTEGER);
      expect(results[2] === -0 || results[2] === 0).toBe(true);
      expect(results[3] === -0 || results[3] === 0).toBe(true);
      expect(results[4]).toBe(Number.MAX_SAFE_INTEGER);
      expect(results[5]).toBe(Infinity);
    });
  });
});
