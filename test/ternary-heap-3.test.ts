import { describe, it, expect } from 'vitest';
import { TernaryHeap3 } from './src/core/ternary-heap-3/index.js';

describe('TernaryHeap3', () => {
  describe('insert', () => {
    it('should insert single element', async () => {
      const heap = new TernaryHeap3<number>();
      heap.insert(5);
      expect(heap.size).toBe(1);
      expect(heap.peek()).toBe(5);
    });

    it('should insert multiple elements', async () => {
      const heap = new TernaryHeap3<number>();
      heap.insert(3);
      heap.insert(1);
      heap.insert(4);
      heap.insert(2);
      expect(heap.size).toBe(4);
      expect(heap.peek()).toBe(1);
    });

    it('should handle duplicate values', async () => {
      const heap = new TernaryHeap3<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(5);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(3);
    });

    it('should handle negative numbers', async () => {
      const heap = new TernaryHeap3<number>();
      heap.insert(-1);
      heap.insert(-3);
      heap.insert(-2);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(-3);
    });

    it('should handle many insertions', async () => {
      const heap = new TernaryHeap3<number>();
      for (let i = 100; i >= 1; i--) {
        heap.insert(i);
      }
      expect(heap.size).toBe(100);
      expect(heap.peek()).toBe(1);
    });
  });

  describe('extractMin', () => {
    it('should return undefined for empty heap', async () => {
      const heap = new TernaryHeap3<number>();
      expect(heap.extractMin()).toBeUndefined();
    });

    it('should extract single element', async () => {
      const heap = new TernaryHeap3<number>();
      heap.insert(5);
      expect(heap.extractMin()).toBe(5);
      expect(heap.size).toBe(0);
      expect(heap.extractMin()).toBeUndefined();
    });

    it('should extract in min-heap order', async () => {
      const heap = new TernaryHeap3<number>();
      heap.insert(3);
      heap.insert(1);
      heap.insert(4);
      heap.insert(2);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(2);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(4);
    });

    it('should handle duplicate values', async () => {
      const heap = new TernaryHeap3<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(5);
      heap.insert(3);
      heap.insert(1);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(5);
    });

    it('should handle negative numbers', async () => {
      const heap = new TernaryHeap3<number>();
      heap.insert(-1);
      heap.insert(-3);
      heap.insert(-2);
      heap.insert(0);
      expect(heap.extractMin()).toBe(-3);
      expect(heap.extractMin()).toBe(-2);
      expect(heap.extractMin()).toBe(-1);
      expect(heap.extractMin()).toBe(0);
    });
  });

  describe('peek', () => {
    it('should return minimum without removing it', async () => {
      const heap = new TernaryHeap3<number>();
      heap.insert(3);
      heap.insert(1);
      heap.insert(4);
      expect(heap.peek()).toBe(1);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(1);
    });

    it('should return undefined for empty heap', async () => {
      const heap = new TernaryHeap3<number>();
      expect(heap.peek()).toBeUndefined();
    });

    it('should update after extractMin', async () => {
      const heap = new TernaryHeap3<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      expect(heap.peek()).toBe(1);
      heap.extractMin();
      expect(heap.peek()).toBe(2);
      heap.extractMin();
      expect(heap.peek()).toBe(3);
    });
  });

  describe('size', () => {
    it('should return 0 for empty heap', async () => {
      const heap = new TernaryHeap3<number>();
      expect(heap.size).toBe(0);
    });

    it('should increment after insert', async () => {
      const heap = new TernaryHeap3<number>();
      expect(heap.size).toBe(0);
      heap.insert(1);
      expect(heap.size).toBe(1);
      heap.insert(2);
      expect(heap.size).toBe(2);
      heap.insert(3);
      expect(heap.size).toBe(3);
    });

    it('should decrement after extractMin', async () => {
      const heap = new TernaryHeap3<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      expect(heap.size).toBe(3);
      heap.extractMin();
      expect(heap.size).toBe(2);
      heap.extractMin();
      expect(heap.size).toBe(1);
      heap.extractMin();
      expect(heap.size).toBe(0);
    });

    it('should be 0 after clear', async () => {
      const heap = new TernaryHeap3<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      expect(heap.size).toBe(3);
      heap.clear();
      expect(heap.size).toBe(0);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty heap', async () => {
      const heap = new TernaryHeap3<number>();
      expect(heap.isEmpty()).toBe(true);
    });

    it('should return false after insert', async () => {
      const heap = new TernaryHeap3<number>();
      heap.insert(1);
      expect(heap.isEmpty()).toBe(false);
    });

    it('should return true after extracting all elements', async () => {
      const heap = new TernaryHeap3<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.extractMin();
      heap.extractMin();
      heap.extractMin();
      expect(heap.isEmpty()).toBe(true);
    });

    it('should return true after clear', async () => {
      const heap = new TernaryHeap3<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      expect(heap.isEmpty()).toBe(false);
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear empty heap', async () => {
      const heap = new TernaryHeap3<number>();
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size).toBe(0);
      expect(heap.peek()).toBeUndefined();
    });

    it('should clear non-empty heap', async () => {
      const heap = new TernaryHeap3<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size).toBe(0);
      expect(heap.peek()).toBeUndefined();
    });

    it('should allow insert after clear', async () => {
      const heap = new TernaryHeap3<number>();
      heap.insert(1);
      heap.insert(2);
      heap.clear();
      heap.insert(3);
      heap.insert(4);
      expect(heap.isEmpty()).toBe(false);
      expect(heap.size).toBe(2);
      expect(heap.peek()).toBe(3);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty heap', async () => {
      const heap = new TernaryHeap3<number>();
      expect(heap.toArray()).toEqual([]);
    });

    it('should return all elements', async () => {
      const heap = new TernaryHeap3<number>();
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

    it('should not affect heap', async () => {
      const heap = new TernaryHeap3<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      const arr = heap.toArray();
      arr.push(100);
      expect(heap.size).toBe(3);
      expect(heap.toArray().length).toBe(3);
    });
  });

  describe('fromArray', () => {
    it('should create heap from empty array', async () => {
      const heap = TernaryHeap3.fromArray<number>([]);
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size).toBe(0);
    });

    it('should create heap from single element', async () => {
      const heap = TernaryHeap3.fromArray<number>([5]);
      expect(heap.size).toBe(1);
      expect(heap.peek()).toBe(5);
    });

    it('should create heap from multiple elements', async () => {
      const heap = TernaryHeap3.fromArray<number>([3, 1, 4, 2]);
      expect(heap.size).toBe(4);
      expect(heap.peek()).toBe(1);
    });

    it('should create heap from unsorted array', async () => {
      const heap = TernaryHeap3.fromArray<number>([5, 3, 8, 1, 9, 2, 7, 4, 6]);
      expect(heap.size).toBe(9);
      expect(heap.peek()).toBe(1);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(2);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(4);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(6);
      expect(heap.extractMin()).toBe(7);
      expect(heap.extractMin()).toBe(8);
      expect(heap.extractMin()).toBe(9);
    });

    it('should handle duplicate values', async () => {
      const heap = TernaryHeap3.fromArray<number>([5, 3, 5, 3, 1]);
      expect(heap.size).toBe(5);
      expect(heap.peek()).toBe(1);
    });

    it('should handle negative numbers', async () => {
      const heap = TernaryHeap3.fromArray<number>([-1, -3, -2, 0]);
      expect(heap.size).toBe(4);
      expect(heap.peek()).toBe(-3);
    });

    it('should use custom comparator', async () => {
      const heap = TernaryHeap3.fromArray<number>(
        [3, 1, 4, 2],
        (a, b) => (a > b ? -1 : a < b ? 1 : 0)
      );
      expect(heap.size).toBe(4);
      expect(heap.peek()).toBe(4);
    });
  });

  describe('edge cases', () => {
    it('should handle insert and extract of same element', async () => {
      const heap = new TernaryHeap3<number>();
      heap.insert(1);
      expect(heap.extractMin()).toBe(1);
      heap.insert(1);
      expect(heap.extractMin()).toBe(1);
    });

    it('should handle alternating insert and extract', async () => {
      const heap = new TernaryHeap3<number>();
      heap.insert(3);
      expect(heap.extractMin()).toBe(3);
      heap.insert(1);
      heap.insert(2);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(2);
    });

    it('should handle clear and rebuild', async () => {
      const heap = new TernaryHeap3<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.clear();
      heap.insert(4);
      heap.insert(5);
      heap.insert(6);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(4);
    });
  });

  describe('large datasets', () => {
    it('should handle 1000 elements', async () => {
      const heap = new TernaryHeap3<number>();
      const values: number[] = [];
      for (let i = 1000; i >= 1; i--) {
        values.push(i);
        heap.insert(i);
      }
      expect(heap.size).toBe(1000);
      for (let i = 1; i <= 1000; i++) {
        expect(heap.extractMin()).toBe(i);
      }
      expect(heap.isEmpty()).toBe(true);
    });

    it('should handle 10000 elements', async () => {
      const heap = new TernaryHeap3<number>();
      const values: number[] = [];
      for (let i = 10000; i >= 1; i--) {
        values.push(i);
        heap.insert(i);
      }
      expect(heap.size).toBe(10000);
      for (let i = 1; i <= 10000; i++) {
        expect(heap.extractMin()).toBe(i);
      }
      expect(heap.isEmpty()).toBe(true);
    });

    it('should handle large array with fromArray', async () => {
      const values: number[] = [];
      for (let i = 5000; i >= 1; i--) {
        values.push(i);
      }
      const heap = TernaryHeap3.fromArray<number>(values);
      expect(heap.size).toBe(5000);
      for (let i = 1; i <= 5000; i++) {
        expect(heap.extractMin()).toBe(i);
      }
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('sequential extract', () => {
    it('should extract all elements in sorted order', async () => {
      const heap = new TernaryHeap3<number>();
      const values = [5, 3, 8, 1, 9, 2, 7, 4, 6];
      values.forEach(v => heap.insert(v));
      const extracted: number[] = [];
      while (!heap.isEmpty()) {
        extracted.push(heap.extractMin()!);
      }
      expect(extracted).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should maintain heap property throughout extraction', async () => {
      const heap = new TernaryHeap3<number>();
      const values = [15, 10, 20, 5, 25, 3, 18, 12, 8];
      values.forEach(v => heap.insert(v));
      let prev = Number.MIN_SAFE_INTEGER;
      while (!heap.isEmpty()) {
        const min = heap.extractMin()!;
        expect(min).toBeGreaterThanOrEqual(prev);
        prev = min;
      }
    });
  });

  describe('heap property verification', () => {
    it('should maintain min-heap property for root', async () => {
      const heap = new TernaryHeap3<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(8);
      heap.insert(1);
      heap.insert(9);
      heap.insert(2);
      heap.insert(7);
      heap.insert(4);
      heap.insert(6);
      expect(heap.peek()).toBe(1);
    });

    it('should maintain heap property after many operations', async () => {
      const heap = new TernaryHeap3<number>();
      for (let i = 0; i < 100; i++) {
        heap.insert(Math.random() * 1000);
      }
      let prev = -Infinity;
      while (!heap.isEmpty()) {
        const current = heap.extractMin()!;
        expect(current).toBeGreaterThanOrEqual(prev);
        prev = current;
      }
    });

    it('should maintain heap property with fromArray', async () => {
      const values = [15, 10, 20, 5, 25, 3, 18, 12, 8];
      const heap = TernaryHeap3.fromArray<number>(values);
      expect(heap.peek()).toBe(3);
    });
  });

  describe('custom comparator', () => {
    it('should work with max-heap comparator', async () => {
      const heap = new TernaryHeap3<number>((a, b) => {
        if (a > b) return -1;
        if (a < b) return 1;
        return 0;
      });
      heap.insert(3);
      heap.insert(1);
      heap.insert(4);
      heap.insert(2);
      expect(heap.peek()).toBe(4);
      expect(heap.extractMin()).toBe(4);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(2);
      expect(heap.extractMin()).toBe(1);
    });

    it('should work with string comparator', async () => {
      const heap = new TernaryHeap3<string>();
      heap.insert('banana');
      heap.insert('apple');
      heap.insert('cherry');
      heap.insert('date');
      expect(heap.peek()).toBe('apple');
      expect(heap.extractMin()).toBe('apple');
      expect(heap.extractMin()).toBe('banana');
      expect(heap.extractMin()).toBe('cherry');
      expect(heap.extractMin()).toBe('date');
    });

    it('should work with object comparator', async () => {
      interface Item {
        value: number;
        name: string;
      }
      const heap = new TernaryHeap3<Item>((a, b) => {
        if (a.value < b.value) return -1;
        if (a.value > b.value) return 1;
        return 0;
      });
      heap.insert({ value: 3, name: 'three' });
      heap.insert({ value: 1, name: 'one' });
      heap.insert({ value: 4, name: 'four' });
      heap.insert({ value: 2, name: 'two' });
      expect(heap.peek()!.value).toBe(1);
      expect(heap.extractMin()!.name).toBe('one');
      expect(heap.extractMin()!.name).toBe('two');
      expect(heap.extractMin()!.name).toBe('three');
      expect(heap.extractMin()!.name).toBe('four');
    });

    it('should work with custom comparator in fromArray', async () => {
      const heap = TernaryHeap3.fromArray<number>(
        [3, 1, 4, 2],
        (a, b) => (a > b ? -1 : a < b ? 1 : 0)
      );
      expect(heap.peek()).toBe(4);
      expect(heap.extractMin()).toBe(4);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(2);
      expect(heap.extractMin()).toBe(1);
    });
  });
});
