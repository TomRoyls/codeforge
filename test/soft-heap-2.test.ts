import { describe, it, expect } from 'vitest';
import { SoftHeap2 } from './src/core/soft-heap-2/index.js';

describe('SoftHeap2', () => {
  describe('constructor', () => {
    it('should create empty heap with default comparator', () => {
      const heap = new SoftHeap2<number>();
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size).toBe(0);
    });

    it('should create empty heap with custom comparator', () => {
      const heap = new SoftHeap2<number>((a, b) => b - a);
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size).toBe(0);
    });

    it('should work with string comparator', () => {
      const heap = new SoftHeap2<string>((a, b) => a.localeCompare(b));
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('insert', () => {
    it('should insert single element', () => {
      const heap = new SoftHeap2<number>();
      heap.insert(5);
      expect(heap.size).toBe(1);
      expect(heap.peek()).toBe(5);
    });

    it('should insert multiple elements', () => {
      const heap = new SoftHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      expect(heap.size).toBe(4);
      expect(heap.peek()).toBe(1);
    });

    it('should insert duplicate elements', () => {
      const heap = new SoftHeap2<number>();
      heap.insert(5);
      heap.insert(5);
      heap.insert(5);
      expect(heap.size).toBe(3);
    });

    it('should insert negative numbers', () => {
      const heap = new SoftHeap2<number>();
      heap.insert(-5);
      heap.insert(-1);
      heap.insert(-10);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(-10);
    });

    it('should insert floating point numbers', () => {
      const heap = new SoftHeap2<number>();
      heap.insert(3.14);
      heap.insert(2.71);
      heap.insert(1.41);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(1.41);
    });

    it('should insert strings', () => {
      const heap = new SoftHeap2<string>((a, b) => a.localeCompare(b));
      heap.insert('zebra');
      heap.insert('apple');
      heap.insert('banana');
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe('apple');
    });
  });

  describe('extractMin', () => {
    it('should return undefined from empty heap', () => {
      const heap = new SoftHeap2<number>();
      expect(heap.extractMin()).toBeUndefined();
      expect(heap.size).toBe(0);
    });

    it('should extract single element', () => {
      const heap = new SoftHeap2<number>();
      heap.insert(5);
      const extracted = heap.extractMin();
      expect(extracted).toBe(5);
      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should extract elements in ascending order', () => {
      const heap = new SoftHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      heap.insert(9);

      const result: number[] = [];
      while (!heap.isEmpty()) {
        result.push(heap.extractMin()!);
      }
      expect(result).toEqual([1, 3, 5, 7, 9]);
    });

    it('should handle duplicate elements', () => {
      const heap = new SoftHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(5);
      heap.insert(3);

      const result: number[] = [];
      while (!heap.isEmpty()) {
        result.push(heap.extractMin()!);
      }
      expect(result).toEqual([3, 3, 5, 5]);
    });

    it('should handle negative numbers', () => {
      const heap = new SoftHeap2<number>();
      heap.insert(-5);
      heap.insert(-1);
      heap.insert(-10);
      heap.insert(-3);

      const result: number[] = [];
      while (!heap.isEmpty()) {
        result.push(heap.extractMin()!);
      }
      expect(result).toEqual([-10, -5, -3, -1]);
    });
  });

  describe('peek', () => {
    it('should return undefined from empty heap', () => {
      const heap = new SoftHeap2<number>();
      expect(heap.peek()).toBeUndefined();
    });

    it('should return minimum without removing', () => {
      const heap = new SoftHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);

      expect(heap.peek()).toBe(3);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(3);
    });

    it('should update after insert', () => {
      const heap = new SoftHeap2<number>();
      heap.insert(5);
      expect(heap.peek()).toBe(5);
      heap.insert(3);
      expect(heap.peek()).toBe(3);
      heap.insert(1);
      expect(heap.peek()).toBe(1);
    });

    it('should update after extract', () => {
      const heap = new SoftHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);

      heap.extractMin();
      expect(heap.peek()).toBe(5);
      heap.extractMin();
      expect(heap.peek()).toBe(7);
    });
  });

  describe('size', () => {
    it('should return 0 for empty heap', () => {
      const heap = new SoftHeap2<number>();
      expect(heap.size).toBe(0);
    });

    it('should track size correctly on insert', () => {
      const heap = new SoftHeap2<number>();
      expect(heap.size).toBe(0);
      heap.insert(1);
      expect(heap.size).toBe(1);
      heap.insert(2);
      expect(heap.size).toBe(2);
      heap.insert(3);
      expect(heap.size).toBe(3);
    });

    it('should track size correctly on extract', () => {
      const heap = new SoftHeap2<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      expect(heap.size).toBe(3);
      heap.extractMin();
      expect(heap.size).toBe(2);
      heap.extractMin();
      expect(heap.size).toBe(1);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty heap', () => {
      const heap = new SoftHeap2<number>();
      expect(heap.isEmpty()).toBe(true);
    });

    it('should return false after insert', () => {
      const heap = new SoftHeap2<number>();
      heap.insert(1);
      expect(heap.isEmpty()).toBe(false);
    });

    it('should return true after extracting all elements', () => {
      const heap = new SoftHeap2<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      expect(heap.isEmpty()).toBe(false);
      heap.extractMin();
      heap.extractMin();
      heap.extractMin();
      expect(heap.isEmpty()).toBe(true);
    });

    it('should return true after clear', () => {
      const heap = new SoftHeap2<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      expect(heap.isEmpty()).toBe(false);
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear empty heap', () => {
      const heap = new SoftHeap2<number>();
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size).toBe(0);
    });

    it('should clear non-empty heap', () => {
      const heap = new SoftHeap2<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size).toBe(0);
      expect(heap.peek()).toBeUndefined();
    });

    it('should allow operations after clear', () => {
      const heap = new SoftHeap2<number>();
      heap.insert(1);
      heap.insert(2);
      heap.clear();
      heap.insert(5);
      heap.insert(3);
      expect(heap.size).toBe(2);
      expect(heap.peek()).toBe(3);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty heap', () => {
      const heap = new SoftHeap2<number>();
      expect(heap.toArray()).toEqual([]);
    });

    it('should return sorted elements', () => {
      const heap = new SoftHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      heap.insert(9);
      expect(heap.toArray()).toEqual([1, 3, 5, 7, 9]);
    });

    it('should not modify heap', () => {
      const heap = new SoftHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);

      const arr1 = heap.toArray();
      const arr2 = heap.toArray();
      expect(arr1).toEqual(arr2);
      expect(heap.size).toBe(3);
    });

    it('should work with strings', () => {
      const heap = new SoftHeap2<string>((a, b) => a.localeCompare(b));
      heap.insert('zebra');
      heap.insert('apple');
      heap.insert('banana');
      expect(heap.toArray()).toEqual(['apple', 'banana', 'zebra']);
    });

    it('should work with duplicates', () => {
      const heap = new SoftHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(5);
      heap.insert(3);
      expect(heap.toArray()).toEqual([3, 3, 5, 5]);
    });
  });

  describe('delete', () => {
    it('should return false for non-existent element', () => {
      const heap = new SoftHeap2<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      expect(heap.delete(5)).toBe(false);
      expect(heap.size).toBe(3);
    });

    it('should delete root element', () => {
      const heap = new SoftHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      heap.insert(9);

      expect(heap.delete(1)).toBe(true);
      expect(heap.size).toBe(4);
      expect(heap.peek()).toBe(3);
    });

    it('should delete middle element', () => {
      const heap = new SoftHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      heap.insert(9);

      expect(heap.delete(5)).toBe(true);
      expect(heap.size).toBe(4);
      expect(heap.toArray()).toEqual([1, 3, 7, 9]);
    });

    it('should delete last element', () => {
      const heap = new SoftHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);

      expect(heap.delete(7)).toBe(true);
      expect(heap.size).toBe(2);
      expect(heap.toArray()).toEqual([3, 5]);
    });

    it('should delete duplicate elements', () => {
      const heap = new SoftHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(5);
      heap.insert(3);

      expect(heap.delete(5)).toBe(true);
      expect(heap.size).toBe(3);
      expect(heap.toArray()).toEqual([3, 3, 5]);
    });

    it('should delete only one instance', () => {
      const heap = new SoftHeap2<number>();
      heap.insert(5);
      heap.insert(5);
      heap.insert(5);

      heap.delete(5);
      expect(heap.size).toBe(2);
      heap.delete(5);
      expect(heap.size).toBe(1);
      heap.delete(5);
      expect(heap.size).toBe(0);
    });
  });

  describe('meld', () => {
    it('should meld two empty heaps', () => {
      const heap1 = new SoftHeap2<number>();
      const heap2 = new SoftHeap2<number>();
      heap1.meld(heap2);
      expect(heap1.size).toBe(0);
      expect(heap2.size).toBe(0);
    });

    it('should meld empty with non-empty', () => {
      const heap1 = new SoftHeap2<number>();
      const heap2 = new SoftHeap2<number>();
      heap2.insert(1);
      heap2.insert(2);
      heap2.insert(3);

      heap1.meld(heap2);
      expect(heap1.size).toBe(3);
      expect(heap1.toArray()).toEqual([1, 2, 3]);
      expect(heap2.size).toBe(3);
    });

    it('should meld non-empty with empty', () => {
      const heap1 = new SoftHeap2<number>();
      const heap2 = new SoftHeap2<number>();
      heap1.insert(1);
      heap1.insert(2);
      heap1.insert(3);

      heap1.meld(heap2);
      expect(heap1.size).toBe(3);
      expect(heap1.toArray()).toEqual([1, 2, 3]);
    });

    it('should meld two non-empty heaps', () => {
      const heap1 = new SoftHeap2<number>();
      const heap2 = new SoftHeap2<number>();
      heap1.insert(1);
      heap1.insert(3);
      heap1.insert(5);
      heap2.insert(2);
      heap2.insert(4);
      heap2.insert(6);

      heap1.meld(heap2);
      expect(heap1.size).toBe(6);
      expect(heap1.toArray()).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('should preserve heap property after meld', () => {
      const heap1 = new SoftHeap2<number>();
      const heap2 = new SoftHeap2<number>();
      heap1.insert(10);
      heap1.insert(20);
      heap2.insert(15);
      heap2.insert(5);

      heap1.meld(heap2);
      expect(heap1.extractMin()).toBe(5);
      expect(heap1.extractMin()).toBe(10);
      expect(heap1.extractMin()).toBe(15);
      expect(heap1.extractMin()).toBe(20);
    });

    it('should work with duplicates', () => {
      const heap1 = new SoftHeap2<number>();
      const heap2 = new SoftHeap2<number>();
      heap1.insert(1);
      heap1.insert(2);
      heap2.insert(1);
      heap2.insert(2);

      heap1.meld(heap2);
      expect(heap1.size).toBe(4);
      expect(heap1.toArray()).toEqual([1, 1, 2, 2]);
    });
  });

  describe('complex scenarios', () => {
    it('should handle mixed operations', () => {
      const heap = new SoftHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.extractMin()).toBe(3);
      heap.insert(1);
      heap.insert(9);
      expect(heap.extractMin()).toBe(1);
      expect(heap.delete(7));
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(9);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should handle large number of elements', () => {
      const heap = new SoftHeap2<number>();
      for (let i = 100; i >= 1; i--) {
        heap.insert(i);
      }
      expect(heap.size).toBe(100);
      expect(heap.peek()).toBe(1);

      for (let i = 1; i <= 100; i++) {
        expect(heap.extractMin()).toBe(i);
      }
      expect(heap.isEmpty()).toBe(true);
    });

    it('should maintain heap after many inserts and extracts', () => {
      const heap = new SoftHeap2<number>();
      for (let i = 0; i < 50; i++) {
        heap.insert(Math.random() * 1000);
      }
      expect(heap.size).toBe(50);

      for (let i = 0; i < 25; i++) {
        heap.extractMin();
      }
      expect(heap.size).toBe(25);

      for (let i = 0; i < 25; i++) {
        heap.insert(Math.random() * 1000);
      }
      expect(heap.size).toBe(50);
    });

    it('should work with max heap comparator', () => {
      const heap = new SoftHeap2<number>((a, b) => b - a);
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);

      expect(heap.peek()).toBe(7);
      expect(heap.extractMin()).toBe(7);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(1);
    });
  });

  describe('single element operations', () => {
    it('should work with single insert', () => {
      const heap = new SoftHeap2<number>();
      heap.insert(42);
      expect(heap.size).toBe(1);
      expect(heap.isEmpty()).toBe(false);
      expect(heap.peek()).toBe(42);
    });

    it('should work with single extract', () => {
      const heap = new SoftHeap2<number>();
      heap.insert(42);
      const result = heap.extractMin();
      expect(result).toBe(42);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should work with single delete', () => {
      const heap = new SoftHeap2<number>();
      heap.insert(42);
      expect(heap.delete(42)).toBe(true);
      expect(heap.isEmpty()).toBe(true);
      expect(heap.delete(42)).toBe(false);
    });

    it('should work with single toArray', () => {
      const heap = new SoftHeap2<number>();
      heap.insert(42);
      expect(heap.toArray()).toEqual([42]);
    });
  });
});
