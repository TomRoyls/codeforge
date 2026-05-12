import { describe, it, expect } from 'vitest';
import { PairHeap2 } from '../src/core/pair-heap-2/index.js';

describe('PairHeap2 - Basic Operations', () => {
  it('should create an empty heap', () => {
    const heap = new PairHeap2<number>();
    expect(heap.isEmpty()).toBe(true);
    expect(heap.size).toBe(0);
    expect(heap.peek()).toBe(null);
  });

  it('should insert a single element', () => {
    const heap = new PairHeap2<number>();
    heap.insert(5);
    expect(heap.isEmpty()).toBe(false);
    expect(heap.size).toBe(1);
    expect(heap.peek()).toBe(5);
  });

  it('should insert multiple elements', () => {
    const heap = new PairHeap2<number>();
    heap.insert(3);
    heap.insert(1);
    heap.insert(4);
    heap.insert(2);
    expect(heap.size).toBe(4);
    expect(heap.peek()).toBe(1);
  });

  it('should extract min from single element', () => {
    const heap = new PairHeap2<number>();
    heap.insert(5);
    const min = heap.extractMin();
    expect(min).toBe(5);
    expect(heap.isEmpty()).toBe(true);
  });

  it('should extract min in correct order', () => {
    const heap = new PairHeap2<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(1);
    heap.insert(4);
    heap.insert(2);

    expect(heap.extractMin()).toBe(1);
    expect(heap.extractMin()).toBe(2);
    expect(heap.extractMin()).toBe(3);
    expect(heap.extractMin()).toBe(4);
    expect(heap.extractMin()).toBe(5);
    expect(heap.isEmpty()).toBe(true);
  });

  it('should return null when extracting from empty heap', () => {
    const heap = new PairHeap2<number>();
    expect(heap.extractMin()).toBe(null);
  });

  it('should peek without removing', () => {
    const heap = new PairHeap2<number>();
    heap.insert(3);
    heap.insert(1);
    heap.insert(2);

    expect(heap.peek()).toBe(1);
    expect(heap.peek()).toBe(1);
    expect(heap.size).toBe(3);
  });

  it('should return null when peeking empty heap', () => {
    const heap = new PairHeap2<number>();
    expect(heap.peek()).toBe(null);
  });

  it('should maintain heap property after many operations', () => {
    const heap = new PairHeap2<number>();
    for (let i = 0; i < 100; i++) {
      heap.insert(Math.floor(Math.random() * 1000));
    }

    let prev = -1;
    while (!heap.isEmpty()) {
      const current = heap.extractMin()!;
      expect(current).toBeGreaterThanOrEqual(prev);
      prev = current;
    }
  });

  it('should handle duplicate values', () => {
    const heap = new PairHeap2<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(5);
    heap.insert(3);
    heap.insert(5);

    const values: number[] = [];
    while (!heap.isEmpty()) {
      values.push(heap.extractMin()!);
    }
    expect(values).toEqual([3, 3, 5, 5, 5]);
  });
});

describe('PairHeap2 - Merge Operations', () => {
  it('should merge two empty heaps', () => {
    const heap1 = new PairHeap2<number>();
    const heap2 = new PairHeap2<number>();

    heap1.merge(heap2);

    expect(heap1.isEmpty()).toBe(true);
    expect(heap2.isEmpty()).toBe(true);
  });

  it('should merge empty heap with non-empty heap', () => {
    const heap1 = new PairHeap2<number>();
    heap1.insert(1);
    heap1.insert(2);

    const heap2 = new PairHeap2<number>();

    heap1.merge(heap2);

    expect(heap1.size).toBe(2);
    expect(heap2.isEmpty()).toBe(true);
  });

  it('should merge non-empty heap with empty heap', () => {
    const heap1 = new PairHeap2<number>();
    const heap2 = new PairHeap2<number>();
    heap2.insert(1);
    heap2.insert(2);

    heap1.merge(heap2);

    expect(heap1.size).toBe(2);
    expect(heap2.isEmpty()).toBe(true);
  });

  it('should merge two non-empty heaps', () => {
    const heap1 = new PairHeap2<number>();
    heap1.insert(1);
    heap1.insert(3);

    const heap2 = new PairHeap2<number>();
    heap2.insert(2);
    heap2.insert(4);

    heap1.merge(heap2);

    expect(heap1.size).toBe(4);
    expect(heap1.extractMin()).toBe(1);
    expect(heap1.extractMin()).toBe(2);
    expect(heap1.extractMin()).toBe(3);
    expect(heap1.extractMin()).toBe(4);
    expect(heap2.isEmpty()).toBe(true);
  });

  it('should merge heaps with duplicate values', () => {
    const heap1 = new PairHeap2<number>();
    heap1.insert(1);
    heap1.insert(2);

    const heap2 = new PairHeap2<number>();
    heap2.insert(2);
    heap2.insert(3);

    heap1.merge(heap2);

    expect(heap1.size).toBe(4);
    const values: number[] = [];
    while (!heap1.isEmpty()) {
      values.push(heap1.extractMin()!);
    }
    expect(values).toEqual([1, 2, 2, 3]);
  });

  it('should merge multiple heaps in sequence', () => {
    const heap1 = new PairHeap2<number>();
    heap1.insert(1);
    heap1.insert(4);

    const heap2 = new PairHeap2<number>();
    heap2.insert(2);
    heap2.insert(5);

    const heap3 = new PairHeap2<number>();
    heap3.insert(3);
    heap3.insert(6);

    heap1.merge(heap2);
    heap1.merge(heap3);

    expect(heap1.size).toBe(6);
    expect(heap1.extractMin()).toBe(1);
    expect(heap1.extractMin()).toBe(2);
    expect(heap1.extractMin()).toBe(3);
    expect(heap1.extractMin()).toBe(4);
    expect(heap1.extractMin()).toBe(5);
    expect(heap1.extractMin()).toBe(6);
  });

  it('should merge heap into itself after operations', () => {
    const heap1 = new PairHeap2<number>();
    heap1.insert(1);
    heap1.insert(2);
    heap1.extractMin();

    const heap2 = new PairHeap2<number>();
    heap2.insert(3);
    heap2.insert(4);

    heap1.merge(heap2);

    expect(heap1.size).toBe(3);
    expect(heap1.extractMin()).toBe(2);
    expect(heap1.extractMin()).toBe(3);
    expect(heap1.extractMin()).toBe(4);
  });
});

describe('PairHeap2 - Custom Comparator', () => {
  it('should work with max-heap comparator', () => {
    const heap = new PairHeap2<number>((a, b) => {
      if (a > b) return -1;
      if (a < b) return 1;
      return 0;
    });

    heap.insert(1);
    heap.insert(3);
    heap.insert(2);

    expect(heap.peek()).toBe(3);
    expect(heap.extractMin()).toBe(3);
    expect(heap.extractMin()).toBe(2);
    expect(heap.extractMin()).toBe(1);
  });

  it('should work with string comparator', () => {
    const heap = new PairHeap2<string>((a, b) => a.localeCompare(b));

    heap.insert('banana');
    heap.insert('apple');
    heap.insert('cherry');

    expect(heap.peek()).toBe('apple');
    expect(heap.extractMin()).toBe('apple');
    expect(heap.extractMin()).toBe('banana');
    expect(heap.extractMin()).toBe('cherry');
  });

  it('should work with custom object comparator', () => {
    interface Item {
      priority: number;
      value: string;
    }

    const heap = new PairHeap2<Item>((a, b) => a.priority - b.priority);

    heap.insert({ priority: 3, value: 'third' });
    heap.insert({ priority: 1, value: 'first' });
    heap.insert({ priority: 2, value: 'second' });

    expect(heap.peek()!.value).toBe('first');
    expect(heap.extractMin()!.value).toBe('first');
    expect(heap.extractMin()!.value).toBe('second');
    expect(heap.extractMin()!.value).toBe('third');
  });
});

describe('PairHeap2 - Decrease Key', () => {
  it('should decrease key of root node', () => {
    const heap = new PairHeap2<number>();
    const node = heap.insert(5);
    heap.insert(3);
    heap.insert(4);

    heap.decreaseKey(node, 2);

    expect(heap.peek()).toBe(2);
    expect(heap.extractMin()).toBe(2);
    expect(heap.extractMin()).toBe(3);
    expect(heap.extractMin()).toBe(4);
  });

  it('should decrease key of non-root node', () => {
    const heap = new PairHeap2<number>();
    heap.insert(1);
    const node = heap.insert(5);
    heap.insert(2);

    heap.decreaseKey(node, 0);

    expect(heap.peek()).toBe(0);
    expect(heap.extractMin()).toBe(0);
    expect(heap.extractMin()).toBe(1);
    expect(heap.extractMin()).toBe(2);
  });

  it('should throw error when decreasing to larger value', () => {
    const heap = new PairHeap2<number>();
    const node = heap.insert(5);

    expect(() => heap.decreaseKey(node, 10)).toThrow('New value must be less than or equal to current value');
  });

  it('should allow decrease to same value', () => {
    const heap = new PairHeap2<number>();
    heap.insert(3);
    const node = heap.insert(5);
    heap.insert(4);

    heap.decreaseKey(node, 5);

    expect(heap.peek()).toBe(3);
  });

  it('should maintain heap property after multiple decreases', () => {
    const heap = new PairHeap2<number>();
    const node1 = heap.insert(10);
    const node2 = heap.insert(20);
    heap.insert(30);

    heap.decreaseKey(node1, 5);
    heap.decreaseKey(node2, 1);

    expect(heap.peek()).toBe(1);
    expect(heap.extractMin()).toBe(1);
    expect(heap.extractMin()).toBe(5);
    expect(heap.extractMin()).toBe(30);
  });
});

describe('PairHeap2 - Delete Node', () => {
  it('should delete root node', () => {
    const heap = new PairHeap2<number>();
    const root = heap.insert(1);
    heap.insert(3);
    heap.insert(5);

    heap.delete(root);

    expect(heap.size).toBe(2);
    expect(heap.extractMin()).toBe(3);
    expect(heap.extractMin()).toBe(5);
  });

  it('should delete non-root node', () => {
    const heap = new PairHeap2<number>();
    heap.insert(1);
    const node = heap.insert(5);
    heap.insert(3);

    heap.delete(node);

    expect(heap.size).toBe(2);
    expect(heap.extractMin()).toBe(1);
    expect(heap.extractMin()).toBe(3);
  });

  it('should delete node with children', () => {
    const heap = new PairHeap2<number>();
    const node = heap.insert(10);
    heap.insert(5);
    heap.insert(15);

    heap.delete(node);

    expect(heap.size).toBe(2);
    expect(heap.extractMin()).toBe(5);
    expect(heap.extractMin()).toBe(15);
  });

  it('should handle delete of only node', () => {
    const heap = new PairHeap2<number>();
    const node = heap.insert(5);

    heap.delete(node);

    expect(heap.isEmpty()).toBe(true);
  });

  it('should delete multiple nodes', () => {
    const heap = new PairHeap2<number>();
    const node1 = heap.insert(1);
    const node2 = heap.insert(2);
    const node3 = heap.insert(3);

    heap.delete(node2);
    heap.delete(node1);

    expect(heap.size).toBe(1);
    expect(heap.extractMin()).toBe(3);
  });
});

describe('PairHeap2 - Clear', () => {
  it('should clear empty heap', () => {
    const heap = new PairHeap2<number>();
    heap.clear();

    expect(heap.isEmpty()).toBe(true);
    expect(heap.size).toBe(0);
  });

  it('should clear non-empty heap', () => {
    const heap = new PairHeap2<number>();
    heap.insert(1);
    heap.insert(2);
    heap.insert(3);

    heap.clear();

    expect(heap.isEmpty()).toBe(true);
    expect(heap.size).toBe(0);
    expect(heap.peek()).toBe(null);
  });

  it('should allow operations after clear', () => {
    const heap = new PairHeap2<number>();
    heap.insert(1);
    heap.insert(2);

    heap.clear();
    heap.insert(5);
    heap.insert(3);

    expect(heap.size).toBe(2);
    expect(heap.peek()).toBe(3);
  });
});

describe('PairHeap2 - To Array', () => {
  it('should return empty array for empty heap', () => {
    const heap = new PairHeap2<number>();
    expect(heap.toArray()).toEqual([]);
  });

  it('should return sorted array from non-empty heap', () => {
    const heap = new PairHeap2<number>();
    heap.insert(3);
    heap.insert(1);
    heap.insert(4);
    heap.insert(2);

    expect(heap.toArray()).toEqual([1, 2, 3, 4]);
  });

  it('should not modify heap after toArray', () => {
    const heap = new PairHeap2<number>();
    heap.insert(3);
    heap.insert(1);
    heap.insert(2);

    heap.toArray();

    expect(heap.size).toBe(3);
    expect(heap.peek()).toBe(1);
  });

  it('should handle duplicate values in toArray', () => {
    const heap = new PairHeap2<number>();
    heap.insert(2);
    heap.insert(1);
    heap.insert(2);
    heap.insert(1);

    expect(heap.toArray()).toEqual([1, 1, 2, 2]);
  });
});

describe('PairHeap2 - Edge Cases', () => {
  it('should handle negative numbers', () => {
    const heap = new PairHeap2<number>();
    heap.insert(-5);
    heap.insert(-1);
    heap.insert(-3);

    expect(heap.peek()).toBe(-5);
    expect(heap.extractMin()).toBe(-5);
    expect(heap.extractMin()).toBe(-3);
    expect(heap.extractMin()).toBe(-1);
  });

  it('should handle mixed positive and negative numbers', () => {
    const heap = new PairHeap2<number>();
    heap.insert(-2);
    heap.insert(3);
    heap.insert(-1);
    heap.insert(2);

    expect(heap.extractMin()).toBe(-2);
    expect(heap.extractMin()).toBe(-1);
    expect(heap.extractMin()).toBe(2);
    expect(heap.extractMin()).toBe(3);
  });

  it('should handle very large numbers', () => {
    const heap = new PairHeap2<number>();
    heap.insert(Number.MAX_SAFE_INTEGER);
    heap.insert(Number.MIN_SAFE_INTEGER);
    heap.insert(0);

    expect(heap.peek()).toBe(Number.MIN_SAFE_INTEGER);
  });

  it('should handle zero', () => {
    const heap = new PairHeap2<number>();
    heap.insert(0);
    heap.insert(1);
    heap.insert(-1);

    expect(heap.extractMin()).toBe(-1);
    expect(heap.extractMin()).toBe(0);
    expect(heap.extractMin()).toBe(1);
  });

  it('should maintain size property correctly', () => {
    const heap = new PairHeap2<number>();
    expect(heap.size).toBe(0);

    heap.insert(1);
    expect(heap.size).toBe(1);

    heap.insert(2);
    expect(heap.size).toBe(2);

    heap.extractMin();
    expect(heap.size).toBe(1);

    heap.clear();
    expect(heap.size).toBe(0);
  });

  it('should handle insert after extract all', () => {
    const heap = new PairHeap2<number>();
    heap.insert(1);
    heap.insert(2);
    heap.insert(3);

    heap.extractMin();
    heap.extractMin();
    heap.extractMin();

    heap.insert(5);
    heap.insert(4);

    expect(heap.size).toBe(2);
    expect(heap.peek()).toBe(4);
  });

  it('should handle decreaseKey after extract', () => {
    const heap = new PairHeap2<number>();
    const node = heap.insert(5);
    heap.insert(3);

    heap.extractMin();
    heap.decreaseKey(node, 1);

    expect(heap.peek()).toBe(1);
  });
});

describe('PairHeap2 - Stress Tests', () => {
  it('should handle 1000 insertions', () => {
    const heap = new PairHeap2<number>();
    for (let i = 0; i < 1000; i++) {
      heap.insert(i);
    }

    expect(heap.size).toBe(1000);
    expect(heap.peek()).toBe(0);
  });

  it('should handle 1000 insertions and extractions', () => {
    const heap = new PairHeap2<number>();
    const values = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 1000));

    for (const v of values) {
      heap.insert(v);
    }

    let prev = -1;
    while (!heap.isEmpty()) {
      const current = heap.extractMin()!;
      expect(current).toBeGreaterThanOrEqual(prev);
      prev = current;
    }

    expect(heap.isEmpty()).toBe(true);
  });

  it('should handle interleaved insert and extract', () => {
    const heap = new PairHeap2<number>();
    heap.insert(5);
    heap.insert(3);

    expect(heap.extractMin()).toBe(3);

    heap.insert(4);
    heap.insert(2);

    expect(heap.extractMin()).toBe(2);
    expect(heap.extractMin()).toBe(4);
    expect(heap.extractMin()).toBe(5);
  });

  it('should handle reverse sorted insertions', () => {
    const heap = new PairHeap2<number>();
    heap.insert(10);
    heap.insert(9);
    heap.insert(8);
    heap.insert(7);
    heap.insert(6);

    expect(heap.extractMin()).toBe(6);
    expect(heap.extractMin()).toBe(7);
    expect(heap.extractMin()).toBe(8);
    expect(heap.extractMin()).toBe(9);
    expect(heap.extractMin()).toBe(10);
  });

  it('should handle already sorted insertions', () => {
    const heap = new PairHeap2<number>();
    heap.insert(1);
    heap.insert(2);
    heap.insert(3);
    heap.insert(4);
    heap.insert(5);

    expect(heap.extractMin()).toBe(1);
    expect(heap.extractMin()).toBe(2);
    expect(heap.extractMin()).toBe(3);
    expect(heap.extractMin()).toBe(4);
    expect(heap.extractMin()).toBe(5);
  });

  it('should handle equal values in various positions', () => {
    const heap = new PairHeap2<number>();
    const node1 = heap.insert(5);
    heap.insert(5);
    heap.insert(5);
    const node2 = heap.insert(5);
    heap.insert(5);

    heap.decreaseKey(node1, 3);
    heap.decreaseKey(node2, 4);

    expect(heap.extractMin()).toBe(3);
    expect(heap.extractMin()).toBe(4);
    expect(heap.extractMin()).toBe(5);
    expect(heap.extractMin()).toBe(5);
    expect(heap.extractMin()).toBe(5);
  });

  it('should handle merge then extract operations', () => {
    const heap1 = new PairHeap2<number>();
    for (let i = 0; i < 5; i++) {
      heap1.insert(i * 2);
    }

    const heap2 = new PairHeap2<number>();
    for (let i = 0; i < 5; i++) {
      heap2.insert(i * 2 + 1);
    }

    heap1.merge(heap2);

    expect(heap1.size).toBe(10);

    for (let i = 0; i < 10; i++) {
      expect(heap1.extractMin()).toBe(i);
    }
  });

  it('should handle size after delete operations', () => {
    const heap = new PairHeap2<number>();
    const node1 = heap.insert(3);
    const node2 = heap.insert(1);
    const node3 = heap.insert(2);

    expect(heap.size).toBe(3);

    heap.delete(node2);
    expect(heap.size).toBe(2);

    heap.delete(node1);
    expect(heap.size).toBe(1);

    heap.delete(node3);
    expect(heap.size).toBe(0);
  });

  it('should handle toArray on large heap', () => {
    const heap = new PairHeap2<number>();
    const values: number[] = [];

    for (let i = 0; i < 100; i++) {
      values.push(Math.floor(Math.random() * 100));
    }

    for (const v of values) {
      heap.insert(v);
    }

    const result = heap.toArray();

    expect(result.length).toBe(100);

    for (let i = 1; i < result.length; i++) {
      expect(result[i]).toBeGreaterThanOrEqual(result[i - 1]);
    }
  });

  it('should handle merge of empty with empty', () => {
    const heap1 = new PairHeap2<number>();
    const heap2 = new PairHeap2<number>();

    heap1.merge(heap2);

    expect(heap1.isEmpty()).toBe(true);
    expect(heap2.isEmpty()).toBe(true);
  });
});
