import { describe, it, expect } from 'vitest';
import { KDHeap2 } from '../src/core/k-d-heap-2/index.js';

describe('KDHeap2', () => {
  describe('empty heap', () => {
    it('should return undefined for peek on empty heap', () => {
      const heap = new KDHeap2<number>();
      expect(heap.peek()).toBeUndefined();
    });

    it('should return undefined for extract on empty heap', () => {
      const heap = new KDHeap2<number>();
      expect(heap.extract()).toBeUndefined();
    });

    it('should return true for isEmpty on empty heap', () => {
      const heap = new KDHeap2<number>();
      expect(heap.isEmpty()).toBe(true);
    });

    it('should return 0 for size on empty heap', () => {
      const heap = new KDHeap2<number>();
      expect(heap.size()).toBe(0);
    });

    it('should return empty array for toArray on empty heap', () => {
      const heap = new KDHeap2<number>();
      expect(heap.toArray()).toEqual([]);
    });
  });

  describe('insert and extract', () => {
    it('should insert and extract single value', () => {
      const heap = new KDHeap2<number>();
      heap.insert(5);
      expect(heap.extract()).toBe(5);
    });

    it('should maintain min-heap property after multiple inserts', () => {
      const heap = new KDHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      expect(heap.peek()).toBe(1);
    });

    it('should extract values in sorted order (min-heap)', () => {
      const heap = new KDHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      heap.insert(9);
      heap.insert(2);
      const extracted: number[] = [];
      while (!heap.isEmpty()) {
        extracted.push(heap.extract()!);
      }
      expect(extracted).toEqual([1, 2, 3, 5, 7, 9]);
    });

    it('should handle duplicate values', () => {
      const heap = new KDHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(5);
      heap.insert(3);
      heap.insert(1);
      const extracted: number[] = [];
      while (!heap.isEmpty()) {
        extracted.push(heap.extract()!);
      }
      expect(extracted).toEqual([1, 3, 3, 5, 5]);
    });

    it('should handle negative numbers', () => {
      const heap = new KDHeap2<number>();
      heap.insert(-5);
      heap.insert(3);
      heap.insert(-1);
      heap.insert(0);
      const extracted: number[] = [];
      while (!heap.isEmpty()) {
        extracted.push(heap.extract()!);
      }
      expect(extracted).toEqual([-5, -1, 0, 3]);
    });
  });

  describe('peek', () => {
    it('should return minimum without removing', () => {
      const heap = new KDHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.peek()).toBe(3);
      expect(heap.size()).toBe(3);
    });

    it('should return undefined on empty heap', () => {
      const heap = new KDHeap2<number>();
      expect(heap.peek()).toBeUndefined();
    });

    it('should update after insert and extract', () => {
      const heap = new KDHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      expect(heap.peek()).toBe(3);
      heap.insert(1);
      expect(heap.peek()).toBe(1);
      heap.extract();
      expect(heap.peek()).toBe(3);
    });
  });

  describe('size', () => {
    it('should return 0 for new heap', () => {
      const heap = new KDHeap2<number>();
      expect(heap.size()).toBe(0);
    });

    it('should increment on insert', () => {
      const heap = new KDHeap2<number>();
      heap.insert(1);
      expect(heap.size()).toBe(1);
      heap.insert(2);
      expect(heap.size()).toBe(2);
      heap.insert(3);
      expect(heap.size()).toBe(3);
    });

    it('should decrement on extract', () => {
      const heap = new KDHeap2<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.extract();
      expect(heap.size()).toBe(2);
      heap.extract();
      expect(heap.size()).toBe(1);
    });

    it('should return 0 after clear', () => {
      const heap = new KDHeap2<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.clear();
      expect(heap.size()).toBe(0);
    });
  });

  describe('isEmpty', () => {
    it('should return true for new heap', () => {
      const heap = new KDHeap2<number>();
      expect(heap.isEmpty()).toBe(true);
    });

    it('should return false after insert', () => {
      const heap = new KDHeap2<number>();
      heap.insert(1);
      expect(heap.isEmpty()).toBe(false);
    });

    it('should return true after extracting all', () => {
      const heap = new KDHeap2<number>();
      heap.insert(1);
      heap.insert(2);
      heap.extract();
      heap.extract();
      expect(heap.isEmpty()).toBe(true);
    });

    it('should return true after clear', () => {
      const heap = new KDHeap2<number>();
      heap.insert(1);
      heap.insert(2);
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('should empty the heap', () => {
      const heap = new KDHeap2<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.clear();
      expect(heap.size()).toBe(0);
      expect(heap.isEmpty()).toBe(true);
      expect(heap.peek()).toBeUndefined();
      expect(heap.extract()).toBeUndefined();
    });

    it('should allow operations after clear', () => {
      const heap = new KDHeap2<number>();
      heap.insert(1);
      heap.insert(2);
      heap.clear();
      heap.insert(5);
      heap.insert(3);
      expect(heap.size()).toBe(2);
      expect(heap.extract()).toBe(3);
    });
  });

  describe('toArray', () => {
    it('should return copy of heap in level order', () => {
      const heap = new KDHeap2<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.insert(4);
      const arr = heap.toArray();
      expect(arr).toEqual(heap.toArray());
      expect(arr).toHaveLength(4);
    });

    it('should return empty array for empty heap', () => {
      const heap = new KDHeap2<number>();
      expect(heap.toArray()).toEqual([]);
    });

    it('should not be affected by modifications', () => {
      const heap = new KDHeap2<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      const arr = heap.toArray();
      heap.insert(4);
      expect(arr).toHaveLength(3);
      expect(heap.toArray()).toHaveLength(4);
    });
  });

  describe('heapify', () => {
    it('should build heap from array', () => {
      const heap = new KDHeap2<number>();
      heap.heapify([5, 3, 7, 1, 9, 2]);
      const extracted: number[] = [];
      while (!heap.isEmpty()) {
        extracted.push(heap.extract()!);
      }
      expect(extracted).toEqual([1, 2, 3, 5, 7, 9]);
    });

    it('should replace existing heap', () => {
      const heap = new KDHeap2<number>();
      heap.insert(10);
      heap.insert(20);
      heap.heapify([5, 3, 7]);
      expect(heap.size()).toBe(3);
      expect(heap.extract()).toBe(3);
    });

    it('should handle empty array', () => {
      const heap = new KDHeap2<number>();
      heap.heapify([]);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should handle single element', () => {
      const heap = new KDHeap2<number>();
      heap.heapify([42]);
      expect(heap.size()).toBe(1);
      expect(heap.peek()).toBe(42);
    });

    it('should handle duplicate values', () => {
      const heap = new KDHeap2<number>();
      heap.heapify([5, 3, 5, 3, 1, 3]);
      const extracted: number[] = [];
      while (!heap.isEmpty()) {
        extracted.push(heap.extract()!);
      }
      expect(extracted).toEqual([1, 3, 3, 3, 5, 5]);
    });
  });

  describe('min-heap property', () => {
    it('should always have minimum at root', () => {
      const heap = new KDHeap2<number>();
      const values = [10, 5, 15, 3, 8, 20, 1, 7, 12, 2];
      values.forEach(v => heap.insert(v));
      let prev = -Infinity;
      while (!heap.isEmpty()) {
        const current = heap.extract()!;
        expect(current).toBeGreaterThanOrEqual(prev);
        prev = current;
      }
    });

    it('should maintain property after heapify', () => {
      const heap = new KDHeap2<number>();
      heap.heapify([10, 5, 15, 3, 8, 20, 1, 7, 12, 2]);
      let prev = -Infinity;
      while (!heap.isEmpty()) {
        const current = heap.extract()!;
        expect(current).toBeGreaterThanOrEqual(prev);
        prev = current;
      }
    });
  });

  describe('custom comparator (max-heap)', () => {
    it('should work as max-heap with reversed comparator', () => {
      const heap = new KDHeap2<number>(4, (a, b) => b - a);
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      heap.insert(9);
      heap.insert(2);
      expect(heap.peek()).toBe(9);
      const extracted: number[] = [];
      while (!heap.isEmpty()) {
        extracted.push(heap.extract()!);
      }
      expect(extracted).toEqual([9, 7, 5, 3, 2, 1]);
    });

    it('should maintain max-heap property after heapify', () => {
      const heap = new KDHeap2<number>(4, (a, b) => b - a);
      heap.heapify([5, 3, 7, 1, 9, 2]);
      expect(heap.peek()).toBe(9);
      const extracted: number[] = [];
      while (!heap.isEmpty()) {
        extracted.push(heap.extract()!);
      }
      expect(extracted).toEqual([9, 7, 5, 3, 2, 1]);
    });
  });

  describe('different d values', () => {
    it('should work with d=2 (binary heap)', () => {
      const heap = new KDHeap2<number>(2);
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      heap.insert(9);
      heap.insert(2);
      const extracted: number[] = [];
      while (!heap.isEmpty()) {
        extracted.push(heap.extract()!);
      }
      expect(extracted).toEqual([1, 2, 3, 5, 7, 9]);
    });

    it('should work with d=3', () => {
      const heap = new KDHeap2<number>(3);
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      heap.insert(9);
      heap.insert(2);
      const extracted: number[] = [];
      while (!heap.isEmpty()) {
        extracted.push(heap.extract()!);
      }
      expect(extracted).toEqual([1, 2, 3, 5, 7, 9]);
    });

    it('should work with default d=4', () => {
      const heap = new KDHeap2<number>(4);
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      heap.insert(9);
      heap.insert(2);
      const extracted: number[] = [];
      while (!heap.isEmpty()) {
        extracted.push(heap.extract()!);
      }
      expect(extracted).toEqual([1, 2, 3, 5, 7, 9]);
    });

    it('should work with d=8', () => {
      const heap = new KDHeap2<number>(8);
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      heap.insert(9);
      heap.insert(2);
      const extracted: number[] = [];
      while (!heap.isEmpty()) {
        extracted.push(heap.extract()!);
      }
      expect(extracted).toEqual([1, 2, 3, 5, 7, 9]);
    });

    it('should throw error for d < 2', () => {
      expect(() => new KDHeap2<number>(1)).toThrow('d must be at least 2');
      expect(() => new KDHeap2<number>(0)).toThrow('d must be at least 2');
      expect(() => new KDHeap2<number>(-1)).toThrow('d must be at least 2');
    });
  });

  describe('large dataset', () => {
    it('should handle 1000 elements', () => {
      const heap = new KDHeap2<number>();
      const values: number[] = [];
      for (let i = 0; i < 1000; i++) {
        const value = Math.floor(Math.random() * 1000);
        values.push(value);
        heap.insert(value);
      }
      const extracted: number[] = [];
      while (!heap.isEmpty()) {
        extracted.push(heap.extract()!);
      }
      const sorted = [...values].sort((a, b) => a - b);
      expect(extracted).toEqual(sorted);
    });

    it('should heapify 1000 elements efficiently', () => {
      const heap = new KDHeap2<number>();
      const values: number[] = [];
      for (let i = 0; i < 1000; i++) {
        values.push(Math.floor(Math.random() * 1000));
      }
      heap.heapify(values);
      expect(heap.size()).toBe(1000);
      const extracted: number[] = [];
      while (!heap.isEmpty()) {
        extracted.push(heap.extract()!);
      }
      const sorted = [...values].sort((a, b) => a - b);
      expect(extracted).toEqual(sorted);
    });
  });

  describe('extract all returns sorted', () => {
    it('should extract all values in sorted order', () => {
      const heap = new KDHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      heap.insert(9);
      heap.insert(2);
      const extracted: number[] = [];
      while (!heap.isEmpty()) {
        extracted.push(heap.extract()!);
      }
      expect(extracted).toEqual([1, 2, 3, 5, 7, 9]);
    });

    it('should work with heapified values', () => {
      const heap = new KDHeap2<number>();
      heap.heapify([5, 3, 7, 1, 9, 2]);
      const extracted: number[] = [];
      while (!heap.isEmpty()) {
        extracted.push(heap.extract()!);
      }
      expect(extracted).toEqual([1, 2, 3, 5, 7, 9]);
    });
  });

  describe('generic type support', () => {
    it('should work with strings', () => {
      const heap = new KDHeap2<string>(4, (a, b) => a.localeCompare(b));
      heap.insert('zebra');
      heap.insert('apple');
      heap.insert('banana');
      heap.insert('cherry');
      const extracted: string[] = [];
      while (!heap.isEmpty()) {
        extracted.push(heap.extract()!);
      }
      expect(extracted).toEqual(['apple', 'banana', 'cherry', 'zebra']);
    });

    it('should work with objects', () => {
      interface Item {
        id: number;
        value: string;
      }
      const heap = new KDHeap2<Item>(4, (a, b) => a.id - b.id);
      heap.insert({ id: 3, value: 'c' });
      heap.insert({ id: 1, value: 'a' });
      heap.insert({ id: 2, value: 'b' });
      expect(heap.extract()!.id).toBe(1);
      expect(heap.extract()!.id).toBe(2);
      expect(heap.extract()!.id).toBe(3);
    });
    it('should handle peek on empty', () => {
      const heap = new KDHeap2<{ id: number }>([{ id: 1 }, { id: 2 }], 2, (a, b) => a.id - b.id);
      heap.extract();
      heap.extract();
      expect(heap.peek()).toBeUndefined();
    });
  });
  it('should handle heapify with single element', () => {
    const heap = new KDHeap2<number>();
    heap.heapify([42]);
    expect(heap.size()).toBe(1);
    expect(heap.peek()).toBe(42);
  });
});
