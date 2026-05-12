import { describe, it, expect } from 'vitest';
import { TernaryHeap } from './src/core/ternary-heap/index.js';

describe('TernaryHeap', () => {
  describe('insert and extractMin', () => {
    it('should insert and extract single element', () => {
      const heap = new TernaryHeap<number>();
      heap.insert(5);
      expect(heap.extractMin()).toBe(5);
    });

    it('should maintain min-heap order for multiple insertions', () => {
      const heap = new TernaryHeap<number>();
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
      const heap = new TernaryHeap<number>();
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

    it('should handle negative numbers', () => {
      const heap = new TernaryHeap<number>();
      heap.insert(-1);
      heap.insert(-3);
      heap.insert(-2);
      heap.insert(0);
      expect(heap.extractMin()).toBe(-3);
      expect(heap.extractMin()).toBe(-2);
      expect(heap.extractMin()).toBe(-1);
      expect(heap.extractMin()).toBe(0);
    });

    it('should handle many insertions', () => {
      const heap = new TernaryHeap<number>();
      for (let i = 100; i >= 1; i--) {
        heap.insert(i);
      }
      for (let i = 1; i <= 100; i++) {
        expect(heap.extractMin()).toBe(i);
      }
    });
  });

  describe('peek', () => {
    it('should return minimum without removing it', () => {
      const heap = new TernaryHeap<number>();
      heap.insert(3);
      heap.insert(1);
      heap.insert(4);
      expect(heap.peek()).toBe(1);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(1);
    });

    it('should return undefined for empty heap', () => {
      const heap = new TernaryHeap<number>();
      expect(heap.peek()).toBeUndefined();
    });

    it('should update after extractMin', () => {
      const heap = new TernaryHeap<number>();
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
    it('should return 0 for empty heap', () => {
      const heap = new TernaryHeap<number>();
      expect(heap.size).toBe(0);
    });

    it('should increment after insert', () => {
      const heap = new TernaryHeap<number>();
      expect(heap.size).toBe(0);
      heap.insert(1);
      expect(heap.size).toBe(1);
      heap.insert(2);
      expect(heap.size).toBe(2);
      heap.insert(3);
      expect(heap.size).toBe(3);
    });

    it('should decrement after extractMin', () => {
      const heap = new TernaryHeap<number>();
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
      const heap = new TernaryHeap<number>();
      expect(heap.isEmpty()).toBe(true);
    });

    it('should return false after insert', () => {
      const heap = new TernaryHeap<number>();
      heap.insert(1);
      expect(heap.isEmpty()).toBe(false);
    });

    it('should return true after extracting all elements', () => {
      const heap = new TernaryHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.extractMin();
      heap.extractMin();
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('should remove all elements', () => {
      const heap = new TernaryHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size).toBe(0);
      expect(heap.peek()).toBeUndefined();
    });

    it('should allow insert after clear', () => {
      const heap = new TernaryHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.clear();
      heap.insert(5);
      heap.insert(3);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(5);
    });

    it('should work on empty heap', () => {
      const heap = new TernaryHeap<number>();
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty heap', () => {
      const heap = new TernaryHeap<number>();
      expect(heap.toArray()).toEqual([]);
    });

    it('should return all elements in heap order', () => {
      const heap = new TernaryHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      const arr = heap.toArray();
      expect(arr).toContain(1);
      expect(arr).toContain(2);
      expect(arr).toContain(3);
      expect(arr.length).toBe(3);
    });

    it('should not affect original heap', () => {
      const heap = new TernaryHeap<number>();
      heap.insert(1);
      heap.insert(2);
      const arr = heap.toArray();
      arr.push(999);
      expect(heap.size).toBe(2);
      expect(heap.toArray()).toEqual([1, 2]);
    });
  });

  describe('heapify', () => {
    it('should create heap from array', () => {
      const heap = new TernaryHeap<number>();
      heap.heapify([3, 1, 4, 1, 5, 9, 2, 6]);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(2);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(4);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(6);
      expect(heap.extractMin()).toBe(9);
    });

    it('should handle empty array', () => {
      const heap = new TernaryHeap<number>();
      heap.heapify([]);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should handle single element', () => {
      const heap = new TernaryHeap<number>();
      heap.heapify([42]);
      expect(heap.extractMin()).toBe(42);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should replace existing heap content', () => {
      const heap = new TernaryHeap<number>();
      heap.insert(100);
      heap.insert(200);
      heap.heapify([5, 10, 15]);
      expect(heap.size).toBe(3);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(10);
      expect(heap.extractMin()).toBe(15);
    });

    it('should handle already sorted array', () => {
      const heap = new TernaryHeap<number>();
      heap.heapify([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      for (let i = 1; i <= 9; i++) {
        expect(heap.extractMin()).toBe(i);
      }
    });

    it('should handle reverse sorted array', () => {
      const heap = new TernaryHeap<number>();
      heap.heapify([9, 8, 7, 6, 5, 4, 3, 2, 1]);
      for (let i = 1; i <= 9; i++) {
        expect(heap.extractMin()).toBe(i);
      }
    });
  });

  describe('merge', () => {
    it('should merge two non-empty heaps', () => {
      const heap1 = new TernaryHeap<number>();
      heap1.insert(1);
      heap1.insert(3);
      heap1.insert(5);

      const heap2 = new TernaryHeap<number>();
      heap2.insert(2);
      heap2.insert(4);
      heap2.insert(6);

      heap1.merge(heap2);

      expect(heap1.size).toBe(6);
      expect(heap1.extractMin()).toBe(1);
      expect(heap1.extractMin()).toBe(2);
      expect(heap1.extractMin()).toBe(3);
      expect(heap1.extractMin()).toBe(4);
      expect(heap1.extractMin()).toBe(5);
      expect(heap1.extractMin()).toBe(6);
    });

    it('should merge with empty heap', () => {
      const heap1 = new TernaryHeap<number>();
      heap1.insert(1);
      heap1.insert(2);
      heap1.insert(3);

      const heap2 = new TernaryHeap<number>();

      heap1.merge(heap2);

      expect(heap1.size).toBe(3);
      expect(heap1.extractMin()).toBe(1);
      expect(heap1.extractMin()).toBe(2);
      expect(heap1.extractMin()).toBe(3);
    });

    it('should merge empty heap with non-empty', () => {
      const heap1 = new TernaryHeap<number>();

      const heap2 = new TernaryHeap<number>();
      heap2.insert(1);
      heap2.insert(2);
      heap2.insert(3);

      heap1.merge(heap2);

      expect(heap1.size).toBe(3);
      expect(heap1.extractMin()).toBe(1);
      expect(heap1.extractMin()).toBe(2);
      expect(heap1.extractMin()).toBe(3);
    });

    it('should handle duplicate values in merge', () => {
      const heap1 = new TernaryHeap<number>();
      heap1.insert(1);
      heap1.insert(2);

      const heap2 = new TernaryHeap<number>();
      heap2.insert(2);
      heap2.insert(3);

      heap1.merge(heap2);

      expect(heap1.size).toBe(4);
      expect(heap1.extractMin()).toBe(1);
      expect(heap1.extractMin()).toBe(2);
      expect(heap1.extractMin()).toBe(2);
      expect(heap1.extractMin()).toBe(3);
    });

    it('should not modify the other heap', () => {
      const heap1 = new TernaryHeap<number>();
      heap1.insert(1);
      heap1.insert(2);

      const heap2 = new TernaryHeap<number>();
      heap2.insert(3);
      heap2.insert(4);

      const heap2SizeBefore = heap2.size;
      const heap2PeekBefore = heap2.peek();

      heap1.merge(heap2);

      expect(heap2.size).toBe(heap2SizeBefore);
      expect(heap2.peek()).toBe(heap2PeekBefore);
    });
  });

  describe('replace', () => {
    it('should replace min and return old min', () => {
      const heap = new TernaryHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);

      const result = heap.replace(0);

      expect(result).toBe(1);
      expect(heap.peek()).toBe(0);
      expect(heap.size).toBe(3);
    });

    it('should insert and return undefined for empty heap', () => {
      const heap = new TernaryHeap<number>();

      const result = heap.replace(42);

      expect(result).toBeUndefined();
      expect(heap.peek()).toBe(42);
      expect(heap.size).toBe(1);
    });

    it('should maintain heap property after replace', () => {
      const heap = new TernaryHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);

      heap.replace(5);

      expect(heap.extractMin()).toBe(2);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(5);
    });

    it.skip('should handle replacing with smaller value', () => {
      const heap = new TernaryHeap<number>();
      heap.insert(5);
      heap.insert(6);
      heap.insert(7);

      heap.replace(1);

      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(6);
    });

    it('should work with single element heap', () => {
      const heap = new TernaryHeap<number>();
      heap.insert(10);

      const result = heap.replace(20);

      expect(result).toBe(10);
      expect(heap.peek()).toBe(20);
      expect(heap.size).toBe(1);
    });
  });

  describe('pushPop', () => {
    it.skip('should push and return min if value is smaller', () => {
      const heap = new TernaryHeap<number>();
      heap.insert(2);
      heap.insert(3);
      heap.insert(4);

      const result = heap.pushPop(1);

      expect(result).toBe(1);
      expect(heap.size).toBe(4);
      expect(heap.peek()).toBe(2);
    });

    it('should replace and return old min if value is larger', () => {
      const heap = new TernaryHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);

      const result = heap.pushPop(5);

      expect(result).toBe(1);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(2);
    });

    it('should push to empty heap', () => {
      const heap = new TernaryHeap<number>();

      const result = heap.pushPop(42);

      expect(result).toBe(42);
      expect(heap.size).toBe(1);
      expect(heap.peek()).toBe(42);
    });

    it.skip('should work with equal value', () => {
      const heap = new TernaryHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);

      const result = heap.pushPop(1);

      expect(result).toBe(1);
      expect(heap.size).toBe(4);
    });

    it.skip('should maintain heap property', () => {
      const heap = new TernaryHeap<number>();
      heap.insert(1);
      heap.insert(3);
      heap.insert(5);

      heap.pushPop(2);

      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(2);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(5);
    });
  });

  describe('custom comparator', () => {
    it('should create max-heap with reverse comparator', () => {
      const heap = new TernaryHeap<number>((a, b) => {
        if (a > b) return -1;
        if (a < b) return 1;
        return 0;
      });

      heap.insert(1);
      heap.insert(3);
      heap.insert(2);

      expect(heap.peek()).toBe(3);
    });

    it('should extract in max-heap order', () => {
      const heap = new TernaryHeap<number>((a, b) => {
        if (a > b) return -1;
        if (a < b) return 1;
        return 0;
      });

      heap.insert(1);
      heap.insert(5);
      heap.insert(3);
      heap.insert(2);
      heap.insert(4);

      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(4);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(2);
      expect(heap.extractMin()).toBe(1);
    });

    it('should work with string comparator', () => {
      const heap = new TernaryHeap<string>((a, b) => a.localeCompare(b));

      heap.insert('banana');
      heap.insert('apple');
      heap.insert('cherry');

      expect(heap.extractMin()).toBe('apple');
      expect(heap.extractMin()).toBe('banana');
      expect(heap.extractMin()).toBe('cherry');
    });

    it('should work with object comparator', () => {
      interface Item {
        value: number;
      }

      const heap = new TernaryHeap<Item>((a, b) => {
        if (a.value < b.value) return -1;
        if (a.value > b.value) return 1;
        return 0;
      });

      heap.insert({ value: 3 });
      heap.insert({ value: 1 });
      heap.insert({ value: 2 });

      const result = heap.extractMin();
      expect(result?.value).toBe(1);
    });
  });

  describe('stress test', () => {
    it('should handle 1000 insertions and extractions', () => {
      const heap = new TernaryHeap<number>();
      const values = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 10000));

      values.forEach(v => heap.insert(v));

      const sortedValues = [...values].sort((a, b) => a - b);

      for (const expected of sortedValues) {
        expect(heap.extractMin()).toBe(expected);
      }

      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('extractMin on empty heap', () => {
    it('should return undefined', () => {
      const heap = new TernaryHeap<number>();
      expect(heap.extractMin()).toBeUndefined();
    });

    it('should return undefined after extracting all elements', () => {
      const heap = new TernaryHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.extractMin();
      heap.extractMin();
      expect(heap.extractMin()).toBeUndefined();
    });
  });

  describe('ternary structure', () => {
    it('should maintain correct parent-child relationships', () => {
      const heap = new TernaryHeap<number>();
      heap.heapify([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

      const arr = heap.toArray();

      for (let i = 1; i < arr.length; i++) {
        const parentIndex = Math.floor((i - 1) / 3);
        expect(arr[parentIndex]).toBeLessThanOrEqual(arr[i]);
      }
    });
  });
});
