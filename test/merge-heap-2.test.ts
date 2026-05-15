import { describe, it, expect } from 'vitest';
import { MergeHeap2 } from '../src/core/merge-heap-2/index.js';

describe('MergeHeap2', () => {
  describe('insert/extract/peek', () => {
    it('inserts and extracts in order', () => {
      const heap = new MergeHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);

      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(7);
      expect(heap.extractMin()).toBeUndefined();
    });

    it('peek returns min without removing', () => {
      const heap = new MergeHeap2<number>();
      heap.insert(5);
      heap.insert(3);

      expect(heap.peek()).toBe(3);
      expect(heap.extractMin()).toBe(3);
      expect(heap.peek()).toBe(5);
    });

    it('handles empty heap', () => {
      const heap = new MergeHeap2<number>();
      expect(heap.peek()).toBeUndefined();
      expect(heap.extractMin()).toBeUndefined();
    });
  });

  describe('FIFO for equal elements', () => {
    it('maintains insertion order for equal elements', () => {
      const heap = new MergeHeap2<{ value: number; order: number }>((a, b) => {
        if (a.value < b.value) return -1;
        if (a.value > b.value) return 1;
        return a.order - b.order;
      });

      heap.insert({ value: 1, order: 1 });
      heap.insert({ value: 1, order: 2 });
      heap.insert({ value: 2, order: 3 });
      heap.insert({ value: 1, order: 4 });

      expect(heap.extractMin()!.order).toBe(1);
      expect(heap.extractMin()!.order).toBe(2);
      expect(heap.extractMin()!.order).toBe(4);
      expect(heap.extractMin()!.order).toBe(3);
    });
  });

  describe('merge', () => {
    it('merges two heaps', () => {
      const heap1 = new MergeHeap2<number>();
      heap1.insert(5);
      heap1.insert(3);

      const heap2 = new MergeHeap2<number>();
      heap2.insert(7);
      heap2.insert(1);
      heap2.insert(4);

      heap1.merge(heap2);

      expect(heap1.size).toBe(5);
      expect(heap2.size).toBe(0);

      expect(heap1.extractMin()).toBe(1);
      expect(heap1.extractMin()).toBe(3);
      expect(heap1.extractMin()).toBe(4);
      expect(heap1.extractMin()).toBe(5);
      expect(heap1.extractMin()).toBe(7);
    });

    it('merges empty heap', () => {
      const heap1 = new MergeHeap2<number>();
      heap1.insert(3);
      heap1.insert(1);

      const heap2 = new MergeHeap2<number>();

      heap1.merge(heap2);

      expect(heap1.size).toBe(2);
      expect(heap2.size).toBe(0);
      expect(heap1.extractMin()).toBe(1);
      expect(heap1.extractMin()).toBe(3);
    });

    it('merges into empty heap', () => {
      const heap1 = new MergeHeap2<number>();

      const heap2 = new MergeHeap2<number>();
      heap2.insert(3);
      heap2.insert(1);

      heap1.merge(heap2);

      expect(heap1.size).toBe(2);
      expect(heap2.size).toBe(0);
      expect(heap1.extractMin()).toBe(1);
      expect(heap1.extractMin()).toBe(3);
    });
  });

  describe('size', () => {
    it('tracks size correctly', () => {
      const heap = new MergeHeap2<number>();
      expect(heap.size).toBe(0);

      heap.insert(1);
      expect(heap.size).toBe(1);

      heap.insert(2);
      heap.insert(3);
      expect(heap.size).toBe(3);

      heap.extractMin();
      expect(heap.size).toBe(2);

      heap.extractMin();
      heap.extractMin();
      expect(heap.size).toBe(0);
    });
  });

  describe('isEmpty', () => {
    it('checks emptiness correctly', () => {
      const heap = new MergeHeap2<number>();
      expect(heap.isEmpty()).toBe(true);

      heap.insert(1);
      expect(heap.isEmpty()).toBe(false);

      heap.extractMin();
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('clears the heap', () => {
      const heap = new MergeHeap2<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);

      heap.clear();

      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);
      expect(heap.peek()).toBeUndefined();
      expect(heap.extractMin()).toBeUndefined();
    });
  });

  describe('custom comparator', () => {
    it('works with max-heap comparator', () => {
      const heap = new MergeHeap2<number>((a, b) => b - a);
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);

      expect(heap.extractMin()).toBe(7);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(1);
    });

    it('works with string comparator', () => {
      const heap = new MergeHeap2<string>((a, b) => a.localeCompare(b));
      heap.insert('banana');
      heap.insert('apple');
      heap.insert('cherry');

      expect(heap.extractMin()).toBe('apple');
      expect(heap.extractMin()).toBe('banana');
      expect(heap.extractMin()).toBe('cherry');
    });

    it('works with custom object comparator', () => {
      const heap = new MergeHeap2<{ id: number; value: string }>((a, b) => a.id - b.id);
      heap.insert({ id: 3, value: 'c' });
      heap.insert({ id: 1, value: 'a' });
      heap.insert({ id: 2, value: 'b' });

      expect(heap.extractMin()!.value).toBe('a');
      expect(heap.extractMin()!.value).toBe('b');
      expect(heap.extractMin()!.value).toBe('c');
    });
  });

  describe('additional edge cases', () => {
    it('handles single element', () => {
      const heap = new MergeHeap2<number>();
      heap.insert(42);
      expect(heap.size).toBe(1);
      expect(heap.peek()).toBe(42);
      expect(heap.extractMin()).toBe(42);
      expect(heap.isEmpty()).toBe(true);
    });

    it('handles duplicate values', () => {
      const heap = new MergeHeap2<number>();
      heap.insert(5);
      heap.insert(5);
      heap.insert(5);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(5);
    });

    it('merge then extract maintains order', () => {
      const h1 = new MergeHeap2<number>();
      h1.insert(10);
      h1.insert(30);

      const h2 = new MergeHeap2<number>();
      h2.insert(20);
      h2.insert(40);

      h1.merge(h2);
      expect(h1.extractMin()).toBe(10);
      expect(h1.extractMin()).toBe(20);
      expect(h1.extractMin()).toBe(30);
      expect(h1.extractMin()).toBe(40);
    });

    it('clear then reuse', () => {
      const heap = new MergeHeap2<number>();
      heap.insert(1);
      heap.insert(2);
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
      heap.insert(10);
      heap.insert(5);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(10);
    });

    it('handles negative numbers', () => {
      const heap = new MergeHeap2<number>();
      heap.insert(-5);
      heap.insert(3);
      heap.insert(-10);
      heap.insert(0);
      expect(heap.extractMin()).toBe(-10);
      expect(heap.extractMin()).toBe(-5);
      expect(heap.extractMin()).toBe(0);
      expect(heap.extractMin()).toBe(3);
    });

    it('handles large number of elements', () => {
      const heap = new MergeHeap2<number>();
      for (let i = 100; i >= 0; i--) {
        heap.insert(i);
      }
      for (let i = 0; i <= 100; i++) {
        expect(heap.extractMin()).toBe(i);
      }
    });
  });
});
