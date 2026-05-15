import { describe, it, expect } from 'vitest';
import { BinaryHeap } from '../src/core/binary-heap-4/index';

describe('BinaryHeap', () => {
  describe('empty heap', () => {
    it('should return undefined from extract on empty heap', () => {
      const heap = new BinaryHeap<number>();
      expect(heap.extract()).toBeUndefined();
    });

    it('should return undefined from peek on empty heap', () => {
      const heap = new BinaryHeap<number>();
      expect(heap.peek()).toBeUndefined();
    });

    it('should return 0 for size on empty heap', () => {
      const heap = new BinaryHeap<number>();
      expect(heap.size()).toBe(0);
    });

    it('should return true for isEmpty on empty heap', () => {
      const heap = new BinaryHeap<number>();
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('insert and extract', () => {
    it('should insert and extract in max order', () => {
      const heap = new BinaryHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      expect(heap.extract()).toBe(7);
      expect(heap.extract()).toBe(5);
      expect(heap.extract()).toBe(3);
      expect(heap.extract()).toBe(1);
    });

    it('should handle single element', () => {
      const heap = new BinaryHeap<number>();
      heap.insert(42);
      expect(heap.extract()).toBe(42);
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('peek', () => {
    it('should return maximum without removing', () => {
      const heap = new BinaryHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.peek()).toBe(7);
      expect(heap.size()).toBe(3);
      expect(heap.peek()).toBe(7);
    });
  });

  describe('size', () => {
    it('should track size correctly', () => {
      const heap = new BinaryHeap<number>();
      expect(heap.size()).toBe(0);
      heap.insert(1);
      expect(heap.size()).toBe(1);
      heap.insert(2);
      heap.insert(3);
      expect(heap.size()).toBe(3);
      heap.extract();
      expect(heap.size()).toBe(2);
    });
  });

  describe('isEmpty', () => {
    it('should return correct empty status', () => {
      const heap = new BinaryHeap<number>();
      expect(heap.isEmpty()).toBe(true);
      heap.insert(1);
      expect(heap.isEmpty()).toBe(false);
      heap.extract();
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('heapify', () => {
    it('should build max heap from array', () => {
      const heap = new BinaryHeap<number>();
      heap.heapify([5, 3, 7, 1, 9, 2]);
      expect(heap.extract()).toBe(9);
      expect(heap.extract()).toBe(7);
      expect(heap.extract()).toBe(5);
      expect(heap.extract()).toBe(3);
      expect(heap.extract()).toBe(2);
      expect(heap.extract()).toBe(1);
    });

    it('should replace existing heap', () => {
      const heap = new BinaryHeap<number>();
      heap.insert(10);
      heap.insert(20);
      heap.heapify([5, 1, 3]);
      expect(heap.extract()).toBe(5);
      expect(heap.extract()).toBe(3);
      expect(heap.extract()).toBe(1);
    });
  });

  describe('toArray', () => {
    it('should return copy of internal array', () => {
      const heap = new BinaryHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      const arr = heap.toArray();
      expect(arr.length).toBe(3);
      expect(arr).toContain(5);
      expect(arr).toContain(3);
      expect(arr).toContain(7);
    });

    it('should return empty array for empty heap', () => {
      const heap = new BinaryHeap<number>();
      expect(heap.toArray()).toEqual([]);
    });
  });

  describe('contains', () => {
    it('should return true for existing value', () => {
      const heap = new BinaryHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.contains(5)).toBe(true);
      expect(heap.contains(3)).toBe(true);
      expect(heap.contains(7)).toBe(true);
    });

    it('should return false for non-existing value', () => {
      const heap = new BinaryHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.contains(1)).toBe(false);
      expect(heap.contains(10)).toBe(false);
    });
  });

  describe('merge', () => {
    it('should merge two heaps', () => {
      const heap1 = new BinaryHeap<number>();
      heap1.insert(1);
      heap1.insert(5);
      const heap2 = new BinaryHeap<number>();
      heap2.insert(2);
      heap2.insert(4);
      const merged = heap1.merge(heap2);
      expect(merged.extract()).toBe(5);
      expect(merged.extract()).toBe(4);
      expect(merged.extract()).toBe(2);
      expect(merged.extract()).toBe(1);
    });

    it('should create new heap without modifying originals', () => {
      const heap1 = new BinaryHeap<number>();
      heap1.insert(1);
      heap1.insert(5);
      const heap2 = new BinaryHeap<number>();
      heap2.insert(2);
      heap2.insert(4);
      const merged = heap1.merge(heap2);
      expect(heap1.size()).toBe(2);
      expect(heap2.size()).toBe(2);
      expect(merged.size()).toBe(4);
    });
  });

  describe('replace', () => {
    it('should replace root and return old value', () => {
      const heap = new BinaryHeap<number>();
      heap.insert(10);
      heap.insert(5);
      heap.insert(15);
      const oldMax = heap.replace(20);
      expect(oldMax).toBe(15);
      expect(heap.peek()).toBe(20);
      expect(heap.extract()).toBe(20);
      expect(heap.extract()).toBe(10);
    });

    it('should insert value if heap is empty', () => {
      const heap = new BinaryHeap<number>();
      const oldMax = heap.replace(42);
      expect(oldMax).toBeUndefined();
      expect(heap.peek()).toBe(42);
    });
  });

  describe('increaseKey', () => {
    it('should increase value at index', () => {
      const heap = new BinaryHeap<number>();
      heap.insert(5);
      heap.insert(10);
      heap.insert(15);
      heap.increaseKey(1, 20);
      expect(heap.extract()).toBe(20);
      expect(heap.extract()).toBe(15);
      expect(heap.extract()).toBe(10);
    });

    it('should do nothing if new value is smaller', () => {
      const heap = new BinaryHeap<number>();
      heap.insert(5);
      heap.insert(10);
      heap.insert(15);
      heap.increaseKey(1, 3);
      expect(heap.extract()).toBe(15);
      expect(heap.extract()).toBe(10);
      expect(heap.extract()).toBe(5);
    });

    it('should do nothing for invalid index', () => {
      const heap = new BinaryHeap<number>();
      heap.insert(5);
      heap.insert(10);
      heap.increaseKey(-1, 20);
      heap.increaseKey(10, 20);
      expect(heap.extract()).toBe(10);
      expect(heap.extract()).toBe(5);
    });
  });

  describe('delete', () => {
    it('should delete element at index', () => {
      const heap = new BinaryHeap<number>();
      heap.insert(15);
      heap.insert(10);
      heap.insert(5);
      heap.delete(1);
      expect(heap.toArray()).toContain(15);
      expect(heap.toArray()).toContain(5);
    });

    it('should delete root', () => {
      const heap = new BinaryHeap<number>();
      heap.insert(15);
      heap.insert(10);
      heap.insert(5);
      heap.delete(0);
      expect(heap.extract()).toBe(10);
      expect(heap.extract()).toBe(5);
    });

    it('should do nothing for invalid index', () => {
      const heap = new BinaryHeap<number>();
      heap.insert(10);
      heap.insert(5);
      heap.delete(-1);
      heap.delete(10);
      expect(heap.size()).toBe(2);
    });
  });

  describe('clear', () => {
    it('should empty heap', () => {
      const heap = new BinaryHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size()).toBe(0);
      expect(heap.peek()).toBeUndefined();
    });
  });

  describe('getTimeComplexity', () => {
    it('should return complexity string', () => {
      const heap = new BinaryHeap<number>();
      const complexity = heap.getTimeComplexity();
      expect(complexity).toContain('insert: O(log n)');
      expect(complexity).toContain('extract: O(log n)');
      expect(complexity).toContain('peek: O(1)');
    });
  });

  describe('custom comparator', () => {
    it('should use custom comparator', () => {
      const heap = new BinaryHeap<{ value: number }>((a, b) => a.value - b.value);
      heap.insert({ value: 5 });
      heap.insert({ value: 3 });
      heap.insert({ value: 7 });
      expect(heap.extract()!.value).toBe(7);
      expect(heap.extract()!.value).toBe(5);
      expect(heap.extract()!.value).toBe(3);
    });

    it('should support min heap with reversed comparator', () => {
      const heap = new BinaryHeap<number>((a, b) => b - a);
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.extract()).toBe(3);
      expect(heap.extract()).toBe(5);
      expect(heap.extract()).toBe(7);
    });
  });

  describe('duplicate values', () => {
    it('should handle duplicate values', () => {
      const heap = new BinaryHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(5);
      heap.insert(3);
      expect(heap.size()).toBe(4);
      expect(heap.extract()).toBe(5);
      expect(heap.extract()).toBe(5);
      expect(heap.extract()).toBe(3);
      expect(heap.extract()).toBe(3);
    });
  });

  describe('large datasets', () => {
    it('should handle large number of elements', () => {
      const heap = new BinaryHeap<number>();
      const values = Array.from({ length: 1000 }, (_, i) => i + 1);
      values.forEach(v => heap.insert(v));
      for (let i = 1000; i >= 1; i--) {
        expect(heap.extract()).toBe(i);
      }
    });
  });

  describe('string values', () => {
    it('should work with strings', () => {
      const heap = new BinaryHeap<string>();
      heap.insert('zebra');
      heap.insert('apple');
      heap.insert('banana');
      expect(heap.extract()).toBe('zebra');
      expect(heap.extract()).toBe('banana');
      expect(heap.extract()).toBe('apple');
    });
  });

  describe('contains()', () => {
    it('should check if value exists in heap', () => {
      const heap = new BinaryHeap<number>();
      heap.insert(10);
      heap.insert(20);
      heap.insert(30);
      expect(heap.contains(20)).toBe(true);
      expect(heap.contains(99)).toBe(false);
    });
  });

  describe('clear()', () => {
    it('should clear the heap', () => {
      const heap = new BinaryHeap<number>();
      heap.insert(10);
      heap.insert(20);
      heap.clear();
      expect(heap.size()).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should handle getTimeComplexity', () => {
      const heap = new BinaryHeap<number>();
      expect(typeof heap.getTimeComplexity()).toBe('string');
    });
  });
});
