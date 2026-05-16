import { describe, it, expect } from 'vitest';
import { MinHeap } from '../src/core/min-heap-4/index';

describe('MinHeap', () => {
  describe('empty heap', () => {
    it('should return undefined from extractMin on empty heap', () => {
      const heap = new MinHeap<number>();
      expect(heap.extractMin()).toBeUndefined();
    });

    it('should return undefined from peek on empty heap', () => {
      const heap = new MinHeap<number>();
      expect(heap.peek()).toBeUndefined();
    });

    it('should return 0 for size on empty heap', () => {
      const heap = new MinHeap<number>();
      expect(heap.size()).toBe(0);
    });

    it('should return true for isEmpty on empty heap', () => {
      const heap = new MinHeap<number>();
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('insert and extractMin', () => {
    it('should insert and extract in order', () => {
      const heap = new MinHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(7);
    });

    it('should handle single element', () => {
      const heap = new MinHeap<number>();
      heap.insert(42);
      expect(heap.extractMin()).toBe(42);
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('peek', () => {
    it('should return minimum without removing', () => {
      const heap = new MinHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.peek()).toBe(3);
      expect(heap.size()).toBe(3);
      expect(heap.peek()).toBe(3);
    });
  });

  describe('size', () => {
    it('should track size correctly', () => {
      const heap = new MinHeap<number>();
      expect(heap.size()).toBe(0);
      heap.insert(1);
      expect(heap.size()).toBe(1);
      heap.insert(2);
      heap.insert(3);
      expect(heap.size()).toBe(3);
      heap.extractMin();
      expect(heap.size()).toBe(2);
    });
  });

  describe('isEmpty', () => {
    it('should return correct empty status', () => {
      const heap = new MinHeap<number>();
      expect(heap.isEmpty()).toBe(true);
      heap.insert(1);
      expect(heap.isEmpty()).toBe(false);
      heap.extractMin();
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('decreaseKey', () => {
    it('should decrease value at index', () => {
      const heap = new MinHeap<number>();
      heap.insert(10);
      heap.insert(20);
      heap.insert(15);
      heap.decreaseKey(1, 5);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(10);
      expect(heap.extractMin()).toBe(15);
    });

    it('should do nothing if new value is larger', () => {
      const heap = new MinHeap<number>();
      heap.insert(5);
      heap.insert(10);
      heap.insert(15);
      heap.decreaseKey(1, 20);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(10);
      expect(heap.extractMin()).toBe(15);
    });

    it('should do nothing for invalid index', () => {
      const heap = new MinHeap<number>();
      heap.insert(5);
      heap.insert(10);
      heap.decreaseKey(-1, 1);
      heap.decreaseKey(10, 1);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(10);
    });
  });

  describe('delete', () => {
    it('should delete element at index', () => {
      const heap = new MinHeap<number>();
      heap.insert(5);
      heap.insert(10);
      heap.insert(15);
      heap.delete(1);
      expect(heap.toArray()).toEqual([5, 15]);
    });

    it('should delete root', () => {
      const heap = new MinHeap<number>();
      heap.insert(5);
      heap.insert(10);
      heap.insert(15);
      heap.delete(0);
      expect(heap.extractMin()).toBe(10);
      expect(heap.extractMin()).toBe(15);
    });

    it('should do nothing for invalid index', () => {
      const heap = new MinHeap<number>();
      heap.insert(5);
      heap.insert(10);
      heap.delete(-1);
      heap.delete(10);
      expect(heap.size()).toBe(2);
    });
  });

  describe('heapify', () => {
    it('should build heap from array', () => {
      const heap = new MinHeap<number>();
      heap.heapify([5, 3, 7, 1, 9, 2]);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(2);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(7);
      expect(heap.extractMin()).toBe(9);
    });

    it('should replace existing heap', () => {
      const heap = new MinHeap<number>();
      heap.insert(10);
      heap.insert(20);
      heap.heapify([5, 1, 3]);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(5);
    });
  });

  describe('toArray', () => {
    it('should return copy of internal array', () => {
      const heap = new MinHeap<number>();
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
      const heap = new MinHeap<number>();
      expect(heap.toArray()).toEqual([]);
    });
  });

  describe('contains', () => {
    it('should return true for existing value', () => {
      const heap = new MinHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.contains(5)).toBe(true);
      expect(heap.contains(3)).toBe(true);
      expect(heap.contains(7)).toBe(true);
    });

    it('should return false for non-existing value', () => {
      const heap = new MinHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.contains(1)).toBe(false);
      expect(heap.contains(10)).toBe(false);
    });
  });

  describe('merge', () => {
    it('should merge two heaps', () => {
      const heap1 = new MinHeap<number>();
      heap1.insert(1);
      heap1.insert(5);
      const heap2 = new MinHeap<number>();
      heap2.insert(2);
      heap2.insert(4);
      const merged = heap1.merge(heap2);
      expect(merged.extractMin()).toBe(1);
      expect(merged.extractMin()).toBe(2);
      expect(merged.extractMin()).toBe(4);
      expect(merged.extractMin()).toBe(5);
    });

    it('should create new heap without modifying originals', () => {
      const heap1 = new MinHeap<number>();
      heap1.insert(1);
      heap1.insert(5);
      const heap2 = new MinHeap<number>();
      heap2.insert(2);
      heap2.insert(4);
      const merged = heap1.merge(heap2);
      expect(heap1.size()).toBe(2);
      expect(heap2.size()).toBe(2);
      expect(merged.size()).toBe(4);
    });
  });

  describe('clear', () => {
    it('should empty the heap', () => {
      const heap = new MinHeap<number>();
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
      const heap = new MinHeap<number>();
      const complexity = heap.getTimeComplexity();
      expect(complexity).toContain('insert: O(log n)');
      expect(complexity).toContain('extractMin: O(log n)');
      expect(complexity).toContain('peek: O(1)');
    });
  });

  describe('custom comparator', () => {
    it('should use custom comparator', () => {
      const heap = new MinHeap<{ value: number }>((a, b) => a.value - b.value);
      heap.insert({ value: 5 });
      heap.insert({ value: 3 });
      heap.insert({ value: 7 });
      expect(heap.extractMin()!.value).toBe(3);
      expect(heap.extractMin()!.value).toBe(5);
      expect(heap.extractMin()!.value).toBe(7);
    });

    it('should support max heap with reversed comparator', () => {
      const heap = new MinHeap<number>((a, b) => b - a);
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.extractMin()).toBe(7);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(3);
    });
  });

  describe('duplicate values', () => {
    it('should handle duplicate values', () => {
      const heap = new MinHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(5);
      heap.insert(3);
      expect(heap.size()).toBe(4);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(5);
    });
  });

  describe('large datasets', () => {
    it('should handle large number of elements', () => {
      const heap = new MinHeap<number>();
      const values = Array.from({ length: 1000 }, (_, i) => 1000 - i);
      values.forEach(v => heap.insert(v));
      for (let i = 1; i <= 1000; i++) {
        expect(heap.extractMin()).toBe(i);
      }
    });
  });

  describe('string values', () => {
    it('should work with strings', () => {
      const heap = new MinHeap<string>();
      heap.insert('zebra');
      heap.insert('apple');
      heap.insert('banana');
      expect(heap.extractMin()).toBe('apple');
      expect(heap.extractMin()).toBe('banana');
      expect(heap.extractMin()).toBe('zebra');
    });
  });

  describe('additional coverage', () => {
    it('should handle clear', () => {
      const heap = new MinHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.clear();
      expect(heap.size()).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should handle extractMin on empty heap', () => {
      const heap = new MinHeap<number>();
      expect(heap.extractMin()).toBeUndefined();
    });

    it('should handle peek', () => {
      const heap = new MinHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.peek()).toBe(3);
      expect(heap.size()).toBe(3);
    });

    it('should handle contains', () => {
      const heap = new MinHeap<number>();
      heap.insert(5);
      heap.insert(3);
      expect(heap.contains(3)).toBe(true);
      expect(heap.contains(99)).toBe(false);
    });

    it('should handle heapify', () => {
      const heap = new MinHeap<number>();
      heap.heapify([5, 3, 1, 4, 2]);
      expect(heap.peek()).toBe(1);
      expect(heap.size()).toBe(5);
    });

    it('should handle clear', () => {
      const heap = new MinHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.clear();
      expect(heap.size()).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should handle extractMin', () => {
      const heap = new MinHeap<number>();
      heap.insert(3);
      heap.insert(1);
      heap.insert(2);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(2);
    });

    it('should handle peek', () => {
      const heap = new MinHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.peek()).toBe(3);
      expect(heap.size()).toBe(3);
    });

    it('should handle toArray', () => {
      const heap = new MinHeap<number>();
      heap.insert(3);
      heap.insert(1);
      heap.insert(2);
      const arr = heap.toArray();
      expect(arr.length).toBe(3);
    });

    it('should handle contains', () => {
      const heap = new MinHeap<number>();
      heap.insert(3);
      heap.insert(1);
      expect(heap.contains(3)).toBe(true);
      expect(heap.contains(99)).toBe(false);
    });

    it('should handle merge', () => {
      const h1 = new MinHeap<number>();
      h1.insert(3);
      h1.insert(1);
      const h2 = new MinHeap<number>();
      h2.insert(2);
      h2.insert(5);
      const merged = h1.merge(h2);
      expect(merged.peek()).toBe(1);
      expect(merged.size()).toBe(4);
    });
  });

  it('should handle clear', () => {
    const heap = new MinHeap<number>();
    heap.insert(3);
    heap.insert(1);
    heap.insert(2);
    heap.clear();
    expect(heap.isEmpty()).toBe(true);
  });
  it('should handle merge', () => {
    const heap1 = new MinHeap<number>();
    heap1.insert(5);
    heap1.insert(3);
    const heap2 = new MinHeap<number>();
    heap2.insert(1);
    heap2.insert(7);
    const merged = heap1.merge(heap2);
    expect(merged.extractMin()).toBe(1);
    expect(merged.extractMin()).toBe(3);
  });
  it('should handle peek', () => {
    const heap = new MinHeap<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(7);
    expect(heap.peek()).toBe(3);
  });
  it('should handle clear', () => {
    const heap = new MinHeap<number>();
    heap.insert(5);
    heap.insert(3);
    heap.clear();
    expect(heap.size()).toBe(0);
  });
  it('should handle merge', () => {
    const h1 = new MinHeap<number>();
    h1.insert(1);
    h1.insert(3);
    const h2 = new MinHeap<number>();
    h2.insert(2);
    h2.insert(4);
    const merged = h1.merge(h2);
    expect(merged.size()).toBe(4);
    expect(merged.extractMin()).toBe(1);
  });
});
