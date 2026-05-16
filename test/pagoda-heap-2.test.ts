import { describe, it, expect } from 'vitest';
import { PagodaHeap2 } from '../src/core/pagoda-heap-2/index';

describe('PagodaHeap2', () => {
  describe('insert', () => {
    it('should insert single element', async () => {
      const heap = new PagodaHeap2<number>();
      heap.insert(5);
      expect(heap.size).toBe(1);
      expect(heap.peek()).toBe(5);
    });

    it('should insert multiple elements', async () => {
      const heap = new PagodaHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(3);
    });

    it('should insert duplicate elements', async () => {
      const heap = new PagodaHeap2<number>();
      heap.insert(5);
      heap.insert(5);
      heap.insert(5);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(5);
    });

    it('should insert negative numbers', async () => {
      const heap = new PagodaHeap2<number>();
      heap.insert(-5);
      heap.insert(3);
      heap.insert(-10);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(-10);
    });

    it('should work with custom comparator', async () => {
      const heap = new PagodaHeap2<number>((a, b) => (a > b ? -1 : a < b ? 1 : 0));
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(7);
    });
  });

  describe('extractMin', () => {
    it('should return undefined from empty heap', async () => {
      const heap = new PagodaHeap2<number>();
      expect(heap.extractMin()).toBeUndefined();
      expect(heap.size).toBe(0);
    });

    it('should extract single element', async () => {
      const heap = new PagodaHeap2<number>();
      heap.insert(5);
      const extracted = heap.extractMin();
      expect(extracted).toBe(5);
      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should extract elements in ascending order', async () => {
      const heap = new PagodaHeap2<number>();
      const values = [5, 3, 7, 1, 9, 2];
      for (const v of values) {
        heap.insert(v);
      }
      const extracted: number[] = [];
      while (!heap.isEmpty()) {
        extracted.push(heap.extractMin()!);
      }
      expect(extracted).toEqual([1, 2, 3, 5, 7, 9]);
    });

    it('should decrease size after extraction', async () => {
      const heap = new PagodaHeap2<number>();
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

  describe('peek', () => {
    it('should return undefined from empty heap', async () => {
      const heap = new PagodaHeap2<number>();
      expect(heap.peek()).toBeUndefined();
    });

    it('should return minimum without removing', async () => {
      const heap = new PagodaHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.peek()).toBe(3);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(3);
    });

    it('should return same value on multiple peeks', async () => {
      const heap = new PagodaHeap2<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      expect(heap.peek()).toBe(1);
      expect(heap.peek()).toBe(1);
      expect(heap.peek()).toBe(1);
    });
  });

  describe('merge', () => {
    it('should merge empty heap into non-empty heap', async () => {
      const heap1 = new PagodaHeap2<number>();
      heap1.insert(1);
      heap1.insert(3);
      const heap2 = new PagodaHeap2<number>();
      heap1.merge(heap2);
      expect(heap1.size).toBe(2);
      expect(heap1.peek()).toBe(1);
      expect(heap2.isEmpty()).toBe(true);
    });

    it('should merge non-empty heap into empty heap', async () => {
      const heap1 = new PagodaHeap2<number>();
      const heap2 = new PagodaHeap2<number>();
      heap2.insert(2);
      heap2.insert(4);
      heap1.merge(heap2);
      expect(heap1.size).toBe(2);
      expect(heap1.peek()).toBe(2);
      expect(heap2.isEmpty()).toBe(true);
    });

    it('should merge two non-empty heaps', async () => {
      const heap1 = new PagodaHeap2<number>();
      heap1.insert(1);
      heap1.insert(3);
      heap1.insert(5);
      const heap2 = new PagodaHeap2<number>();
      heap2.insert(2);
      heap2.insert(4);
      heap2.insert(6);
      heap1.merge(heap2);
      expect(heap1.size).toBe(6);
      expect(heap1.peek()).toBe(1);
      expect(heap2.isEmpty()).toBe(true);
      const extracted: number[] = [];
      while (!heap1.isEmpty()) {
        extracted.push(heap1.extractMin()!);
      }
      expect(extracted).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('should merge heap with itself', async () => {
      const heap = new PagodaHeap2<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      const sizeBefore = heap.size;
      heap.merge(heap);
      expect(heap.size).toBe(sizeBefore);
      expect(heap.peek()).toBe(1);
    });

    it('should handle duplicate values across heaps', async () => {
      const heap1 = new PagodaHeap2<number>();
      heap1.insert(1);
      heap1.insert(3);
      const heap2 = new PagodaHeap2<number>();
      heap2.insert(1);
      heap2.insert(3);
      heap1.merge(heap2);
      expect(heap1.size).toBe(4);
      const extracted: number[] = [];
      while (!heap1.isEmpty()) {
        extracted.push(heap1.extractMin()!);
      }
      expect(extracted).toEqual([1, 1, 3, 3]);
    });
  });

  describe('fromArray', () => {
    it('should create heap from array', async () => {
      const heap = PagodaHeap2.fromArray([5, 3, 7, 1, 9, 2]);
      expect(heap.size).toBe(6);
      expect(heap.peek()).toBe(1);
    });

    it('should create heap from empty array', async () => {
      const heap = PagodaHeap2.fromArray([]);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should create heap from single element array', async () => {
      const heap = PagodaHeap2.fromArray([42]);
      expect(heap.size).toBe(1);
      expect(heap.peek()).toBe(42);
    });

    it('should create heap with custom comparator', async () => {
      const heap = PagodaHeap2.fromArray([5, 3, 7], (a, b) => (a > b ? -1 : a < b ? 1 : 0));
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(7);
    });
  });

  describe('size', () => {
    it('should return 0 for empty heap', async () => {
      const heap = new PagodaHeap2<number>();
      expect(heap.size).toBe(0);
    });

    it('should return correct size after inserts', async () => {
      const heap = new PagodaHeap2<number>();
      expect(heap.size).toBe(0);
      heap.insert(1);
      expect(heap.size).toBe(1);
      heap.insert(2);
      expect(heap.size).toBe(2);
      heap.insert(3);
      expect(heap.size).toBe(3);
    });

    it('should return correct size after extracts', async () => {
      const heap = new PagodaHeap2<number>();
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
    it('should return true for empty heap', async () => {
      const heap = new PagodaHeap2<number>();
      expect(heap.isEmpty()).toBe(true);
    });

    it('should return false for non-empty heap', async () => {
      const heap = new PagodaHeap2<number>();
      heap.insert(1);
      expect(heap.isEmpty()).toBe(false);
    });

    it('should return true after clearing', async () => {
      const heap = new PagodaHeap2<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      expect(heap.isEmpty()).toBe(false);
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('should remove all elements', async () => {
      const heap = new PagodaHeap2<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size).toBe(0);
      expect(heap.peek()).toBeUndefined();
    });

    it('should work on empty heap', async () => {
      const heap = new PagodaHeap2<number>();
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size).toBe(0);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty heap', async () => {
      const heap = new PagodaHeap2<number>();
      expect(heap.toArray()).toEqual([]);
    });

    it('should return all elements', async () => {
      const heap = new PagodaHeap2<number>();
      heap.insert(3);
      heap.insert(1);
      heap.insert(2);
      const arr = heap.toArray();
      expect(arr.length).toBe(3);
      expect(arr).toContain(1);
      expect(arr).toContain(2);
      expect(arr).toContain(3);
    });

    it('should not modify heap', async () => {
      const heap = new PagodaHeap2<number>();
      heap.insert(1);
      heap.insert(2);
      const sizeBefore = heap.size;
      const arr = heap.toArray();
      expect(heap.size).toBe(sizeBefore);
      expect(heap.peek()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle large number of inserts', async () => {
      const heap = new PagodaHeap2<number>();
      const count = 1000;
      for (let i = 0; i < count; i++) {
        heap.insert(i);
      }
      expect(heap.size).toBe(count);
      expect(heap.peek()).toBe(0);
    });

    it('should handle large number of extracts', async () => {
      const heap = new PagodaHeap2<number>();
      const count = 1000;
      for (let i = 0; i < count; i++) {
        heap.insert(i);
      }
      const extracted: number[] = [];
      while (!heap.isEmpty()) {
        extracted.push(heap.extractMin()!);
      }
      expect(extracted.length).toBe(count);
      expect(extracted[0]).toBe(0);
      expect(extracted[count - 1]).toBe(count - 1);
    });

    it('should handle mixed insert and extract', async () => {
      const heap = new PagodaHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      expect(heap.extractMin()).toBe(3);
      heap.insert(1);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(5);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should work with strings', async () => {
      const heap = new PagodaHeap2<string>();
      heap.insert('banana');
      heap.insert('apple');
      heap.insert('cherry');
      expect(heap.extractMin()).toBe('apple');
      expect(heap.extractMin()).toBe('banana');
      expect(heap.extractMin()).toBe('cherry');
    });

    it('should work with objects and custom comparator', async () => {
      const heap = new PagodaHeap2<{ id: number }>((a, b) => a.id - b.id);
      heap.insert({ id: 3 });
      heap.insert({ id: 1 });
      heap.insert({ id: 2 });
      expect(heap.extractMin()!.id).toBe(1);
      expect(heap.extractMin()!.id).toBe(2);
      expect(heap.extractMin()!.id).toBe(3);
    });
  });

  describe('large datasets', () => {
    it('should handle 10000 elements', async () => {
      const heap = new PagodaHeap2<number>();
      const values = Array.from({ length: 10000 }, () => Math.floor(Math.random() * 100000));
      for (const v of values) {
        heap.insert(v);
      }
      const sorted = [...values].sort((a, b) => a - b);
      const extracted: number[] = [];
      while (!heap.isEmpty()) {
        extracted.push(heap.extractMin()!);
      }
      expect(extracted).toEqual(sorted);
    });

    it('should handle multiple merges', async () => {
      const heap1 = new PagodaHeap2<number>();
      const heap2 = new PagodaHeap2<number>();
      const heap3 = new PagodaHeap2<number>();
      for (let i = 0; i < 1000; i++) {
        heap1.insert(i * 3);
        heap2.insert(i * 3 + 1);
        heap3.insert(i * 3 + 2);
      }
      heap1.merge(heap2);
      heap1.merge(heap3);
      expect(heap1.size).toBe(3000);
      const extracted: number[] = [];
      while (!heap1.isEmpty()) {
        extracted.push(heap1.extractMin()!);
      }
      expect(extracted[0]).toBe(0);
      expect(extracted[2999]).toBe(2999);
    });
  });

  describe('merge empty heaps', () => {
    it('should merge empty into empty', async () => {
      const heap1 = new PagodaHeap2<number>();
      const heap2 = new PagodaHeap2<number>();
      heap1.merge(heap2);
      expect(heap1.isEmpty()).toBe(true);
      expect(heap2.isEmpty()).toBe(true);
    });

    it('should merge empty into non-empty', async () => {
      const heap1 = new PagodaHeap2<number>();
      heap1.insert(1);
      heap1.insert(2);
      const heap2 = new PagodaHeap2<number>();
      heap1.merge(heap2);
      expect(heap1.size).toBe(2);
      expect(heap2.isEmpty()).toBe(true);
    });

    it('should merge non-empty into empty', async () => {
      const heap1 = new PagodaHeap2<number>();
      const heap2 = new PagodaHeap2<number>();
      heap2.insert(1);
      heap2.insert(2);
      heap1.merge(heap2);
      expect(heap1.size).toBe(2);
      expect(heap2.isEmpty()).toBe(true);
    });

    it('should handle peek', () => {
      const heap = new PagodaHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.peek()).toBe(3);
    });

    it('should handle extractMin', () => {
      const heap = new PagodaHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(5);
    });

    it('should handle peek', () => {
      const heap = new PagodaHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      expect(heap.peek()).toBe(3);
    });
  });
});
