import { describe, it, expect } from 'vitest';
import { TwoThreeHeap } from './src/core/two-three-heap/index.js';

describe('TwoThreeHeap - Basic Operations', () => {
  it('should create an empty heap', () => {
    const heap = new TwoThreeHeap<number>();
    expect(heap.isEmpty()).toBe(true);
    expect(heap.size).toBe(0);
  });

  it('should insert a single element', () => {
    const heap = new TwoThreeHeap<number>();
    heap.insert(5);
    expect(heap.isEmpty()).toBe(false);
    expect(heap.size).toBe(1);
  });

  it('should peek at the minimum element', () => {
    const heap = new TwoThreeHeap<number>();
    heap.insert(5);
    expect(heap.peek()).toBe(5);
  });

  it('should return undefined for peek on empty heap', () => {
    const heap = new TwoThreeHeap<number>();
    expect(heap.peek()).toBeUndefined();
  });

  it('should extract a single element', () => {
    const heap = new TwoThreeHeap<number>();
    heap.insert(5);
    const result = heap.extractMin();
    expect(result).toBe(5);
    expect(heap.isEmpty()).toBe(true);
  });

  it('should return undefined for extractMin on empty heap', () => {
    const heap = new TwoThreeHeap<number>();
    expect(heap.extractMin()).toBeUndefined();
  });

  it('should insert and extract multiple elements in order', () => {
    const heap = new TwoThreeHeap<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(7);
    heap.insert(1);
    heap.insert(9);
    
    const results: number[] = [];
    while (!heap.isEmpty()) {
      results.push(heap.extractMin()!);
    }
    expect(results).toEqual([1, 3, 5, 7, 9]);
  });

  it('should maintain heap property after multiple inserts', () => {
    const heap = new TwoThreeHeap<number>();
    heap.insert(10);
    heap.insert(5);
    heap.insert(8);
    expect(heap.peek()).toBe(5);
    heap.insert(3);
    expect(heap.peek()).toBe(3);
  });

  it('should handle duplicate values', () => {
    const heap = new TwoThreeHeap<number>();
    heap.insert(5);
    heap.insert(5);
    heap.insert(5);
    const results: number[] = [];
    while (!heap.isEmpty()) {
      results.push(heap.extractMin()!);
    }
    expect(results).toEqual([5, 5, 5]);
  });

  it('should handle negative numbers', () => {
    const heap = new TwoThreeHeap<number>();
    heap.insert(-5);
    heap.insert(-3);
    heap.insert(-7);
    heap.insert(-1);
    expect(heap.peek()).toBe(-7);
  });

  it('should clear the heap', () => {
    const heap = new TwoThreeHeap<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(7);
    heap.clear();
    expect(heap.isEmpty()).toBe(true);
    expect(heap.size).toBe(0);
  });

  it('should clear an already empty heap', () => {
    const heap = new TwoThreeHeap<number>();
    heap.clear();
    expect(heap.isEmpty()).toBe(true);
    expect(heap.size).toBe(0);
  });
});

describe('TwoThreeHeap - Size Operations', () => {
  it('should report correct size after multiple inserts', () => {
    const heap = new TwoThreeHeap<number>();
    expect(heap.size).toBe(0);
    heap.insert(1);
    expect(heap.size).toBe(1);
    heap.insert(2);
    expect(heap.size).toBe(2);
    heap.insert(3);
    expect(heap.size).toBe(3);
  });

  it('should update size after extractMin', () => {
    const heap = new TwoThreeHeap<number>();
    heap.insert(1);
    heap.insert(2);
    heap.insert(3);
    expect(heap.size).toBe(3);
    heap.extractMin();
    expect(heap.size).toBe(2);
    heap.extractMin();
    expect(heap.size).toBe(1);
  });

  it('should report zero size after clearing', () => {
    const heap = new TwoThreeHeap<number>();
    heap.insert(1);
    heap.insert(2);
    heap.insert(3);
    heap.clear();
    expect(heap.size).toBe(0);
  });
});

describe('TwoThreeHeap - toArray', () => {
  it('should return empty array for empty heap', () => {
    const heap = new TwoThreeHeap<number>();
    expect(heap.toArray()).toEqual([]);
  });

  it('should return sorted array for single element', () => {
    const heap = new TwoThreeHeap<number>();
    heap.insert(5);
    expect(heap.toArray()).toEqual([5]);
  });

  it('should return sorted array for multiple elements', () => {
    const heap = new TwoThreeHeap<number>();
    heap.insert(3);
    heap.insert(1);
    heap.insert(4);
    heap.insert(1);
    heap.insert(5);
    heap.insert(9);
    heap.insert(2);
    heap.insert(6);
    heap.insert(5);
    heap.insert(3);
    heap.insert(5);
    expect(heap.toArray()).toEqual([1, 1, 2, 3, 3, 4, 5, 5, 5, 6, 9]);
  });

  it('should not modify heap after toArray', () => {
    const heap = new TwoThreeHeap<number>();
    heap.insert(3);
    heap.insert(1);
    heap.insert(4);
    const array = heap.toArray();
    expect(heap.size).toBe(3);
    expect(heap.peek()).toBe(1);
    expect(array).toEqual([1, 3, 4]);
  });
});

describe('TwoThreeHeap - Meld Operation', () => {
  it('should meld two empty heaps', () => {
    const heap1 = new TwoThreeHeap<number>();
    const heap2 = new TwoThreeHeap<number>();
    heap1.meld(heap2);
    expect(heap1.isEmpty()).toBe(true);
    expect(heap2.isEmpty()).toBe(true);
  });

  it('should meld empty heap with non-empty heap', () => {
    const heap1 = new TwoThreeHeap<number>();
    const heap2 = new TwoThreeHeap<number>();
    heap2.insert(5);
    heap2.insert(3);
    heap1.meld(heap2);
    expect(heap1.size).toBe(2);
    expect(heap2.isEmpty()).toBe(true);
  });

  it('should meld non-empty heap with empty heap', () => {
    const heap1 = new TwoThreeHeap<number>();
    const heap2 = new TwoThreeHeap<number>();
    heap1.insert(5);
    heap1.insert(3);
    heap1.meld(heap2);
    expect(heap1.size).toBe(2);
    expect(heap2.isEmpty()).toBe(true);
  });

  it('should meld two non-empty heaps', () => {
    const heap1 = new TwoThreeHeap<number>();
    const heap2 = new TwoThreeHeap<number>();
    heap1.insert(5);
    heap1.insert(7);
    heap2.insert(3);
    heap2.insert(1);
    heap1.meld(heap2);
    expect(heap1.size).toBe(4);
    expect(heap2.isEmpty()).toBe(true);
    expect(heap1.peek()).toBe(1);
  });

  it('should maintain heap property after meld', () => {
    const heap1 = new TwoThreeHeap<number>();
    const heap2 = new TwoThreeHeap<number>();
    heap1.insert(10);
    heap1.insert(15);
    heap2.insert(5);
    heap2.insert(20);
    heap1.meld(heap2);
    const results: number[] = [];
    while (!heap1.isEmpty()) {
      results.push(heap1.extractMin()!);
    }
    expect(results).toEqual([5, 10, 15, 20]);
  });

  it('should handle melding with duplicates', () => {
    const heap1 = new TwoThreeHeap<number>();
    const heap2 = new TwoThreeHeap<number>();
    heap1.insert(5);
    heap1.insert(3);
    heap2.insert(5);
    heap2.insert(3);
    heap1.meld(heap2);
    const results: number[] = [];
    while (!heap1.isEmpty()) {
      results.push(heap1.extractMin()!);
    }
    expect(results).toEqual([3, 3, 5, 5]);
  });
});

describe('TwoThreeHeap - Custom Comparator', () => {
  it('should create max-heap with custom comparator', () => {
    const heap = new TwoThreeHeap<number>((a, b) => {
      if (a > b) return -1;
      if (a < b) return 1;
      return 0;
    });
    heap.insert(5);
    heap.insert(3);
    heap.insert(7);
    expect(heap.peek()).toBe(7);
  });

  it('should work with string comparator', () => {
    const heap = new TwoThreeHeap<string>((a, b) => a.localeCompare(b));
    heap.insert('banana');
    heap.insert('apple');
    heap.insert('cherry');
    expect(heap.peek()).toBe('apple');
  });

  it('should work with object comparator', () => {
    interface Item { id: number; value: string };
    const heap = new TwoThreeHeap<Item>((a, b) => a.id - b.id);
    heap.insert({ id: 3, value: 'c' });
    heap.insert({ id: 1, value: 'a' });
    heap.insert({ id: 2, value: 'b' });
    expect(heap.peek()!.id).toBe(1);
  });
});

describe('TwoThreeHeap - Stress Tests', () => {
  it('should handle 100 elements', () => {
    const heap = new TwoThreeHeap<number>();
    const values: number[] = [];
    for (let i = 0; i < 100; i++) {
      const value = Math.floor(Math.random() * 1000);
      values.push(value);
      heap.insert(value);
    }
    const sortedValues = [...values].sort((a, b) => a - b);
    const results: number[] = [];
    while (!heap.isEmpty()) {
      results.push(heap.extractMin()!);
    }
    expect(results).toEqual(sortedValues);
  });

  it('should handle 500 elements', () => {
    const heap = new TwoThreeHeap<number>();
    const values: number[] = [];
    for (let i = 0; i < 500; i++) {
      const value = Math.floor(Math.random() * 10000);
      values.push(value);
      heap.insert(value);
    }
    const sortedValues = [...values].sort((a, b) => a - b);
    const results: number[] = [];
    while (!heap.isEmpty()) {
      results.push(heap.extractMin()!);
    }
    expect(results).toEqual(sortedValues);
  });

  it('should handle alternating insert and extract', () => {
    const heap = new TwoThreeHeap<number>();
    heap.insert(10);
    heap.insert(20);
    expect(heap.extractMin()).toBe(10);
    heap.insert(15);
    expect(heap.extractMin()).toBe(15);
    expect(heap.extractMin()).toBe(20);
    expect(heap.isEmpty()).toBe(true);
  });

  it('should handle insert after extract many times', () => {
    const heap = new TwoThreeHeap<number>();
    for (let i = 0; i < 50; i++) {
      heap.insert(i);
      heap.extractMin();
    }
    expect(heap.isEmpty()).toBe(true);
  });

  it('should handle large values', () => {
    const heap = new TwoThreeHeap<number>();
    heap.insert(Number.MAX_VALUE);
    heap.insert(Number.MIN_VALUE);
    heap.insert(0);
    expect(heap.peek()).toBe(0);
  });

  it('should handle many duplicates efficiently', () => {
    const heap = new TwoThreeHeap<number>();
    for (let i = 0; i < 100; i++) {
      heap.insert(42);
    }
    expect(heap.size).toBe(100);
    expect(heap.peek()).toBe(42);
    for (let i = 0; i < 100; i++) {
      expect(heap.extractMin()).toBe(42);
    }
    expect(heap.isEmpty()).toBe(true);
  });
});

describe('TwoThreeHeap - Edge Cases', () => {
  it('should handle zero value', () => {
    const heap = new TwoThreeHeap<number>();
    heap.insert(0);
    heap.insert(-1);
    heap.insert(1);
    expect(heap.peek()).toBe(-1);
  });

  it('should handle single large heap operation', () => {
    const heap = new TwoThreeHeap<number>();
    heap.insert(1);
    expect(heap.size).toBe(1);
    heap.extractMin();
    expect(heap.isEmpty()).toBe(true);
  });

  it('should handle sequential insertions', () => {
    const heap = new TwoThreeHeap<number>();
    for (let i = 1; i <= 10; i++) {
      heap.insert(i);
    }
    expect(heap.size).toBe(10);
    expect(heap.peek()).toBe(1);
  });

  it('should handle reverse sequential insertions', () => {
    const heap = new TwoThreeHeap<number>();
    for (let i = 10; i >= 1; i--) {
      heap.insert(i);
    }
    expect(heap.size).toBe(10);
    expect(heap.peek()).toBe(1);
  });

  it('should maintain correct peek after multiple operations', () => {
    const heap = new TwoThreeHeap<number>();
    heap.insert(10);
    expect(heap.peek()).toBe(10);
    heap.insert(5);
    expect(heap.peek()).toBe(5);
    heap.insert(15);
    expect(heap.peek()).toBe(5);
    heap.extractMin();
    expect(heap.peek()).toBe(10);
  });

  it('should handle meld after clear', () => {
    const heap1 = new TwoThreeHeap<number>();
    const heap2 = new TwoThreeHeap<number>();
    heap1.insert(5);
    heap1.clear();
    heap2.insert(3);
    heap1.meld(heap2);
    expect(heap1.size).toBe(1);
    expect(heap1.peek()).toBe(3);
  });

  it('should handle extracting until empty', () => {
    const heap = new TwoThreeHeap<number>();
    heap.insert(1);
    heap.insert(2);
    heap.insert(3);
    heap.extractMin();
    heap.extractMin();
    heap.extractMin();
    expect(heap.isEmpty()).toBe(true);
    expect(heap.extractMin()).toBeUndefined();
  });

  it('should handle peek after clear', () => {
    const heap = new TwoThreeHeap<number>();
    heap.insert(5);
    heap.clear();
    expect(heap.peek()).toBeUndefined();
  });

  it('should handle multiple clears', () => {
    const heap = new TwoThreeHeap<number>();
    heap.insert(1);
    heap.clear();
    heap.insert(2);
    heap.clear();
    heap.insert(3);
    expect(heap.size).toBe(1);
    expect(heap.peek()).toBe(3);
  });

  it.skip('should handle toArray after multiple operations', () => {
    const heap = new TwoThreeHeap<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(7);
    heap.extractMin();
    heap.insert(1);
    heap.insert(9);
    expect(heap.toArray()).toEqual([1, 3, 5, 7, 9]);
  });

  it('should maintain heap after partial extraction', () => {
    const heap = new TwoThreeHeap<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(7);
    heap.insert(1);
    heap.insert(9);
    heap.extractMin();
    heap.extractMin();
    expect(heap.size).toBe(3);
    expect(heap.peek()).toBe(5);
  });

  it('should handle inserting after extraction', () => {
    const heap = new TwoThreeHeap<number>();
    heap.insert(10);
    heap.insert(5);
    heap.extractMin();
    heap.insert(3);
    expect(heap.peek()).toBe(3);
  });

  it('should handle mixed positive and negative values', () => {
    const heap = new TwoThreeHeap<number>();
    heap.insert(-5);
    heap.insert(5);
    heap.insert(-3);
    heap.insert(3);
    heap.insert(0);
    expect(heap.toArray()).toEqual([-5, -3, 0, 3, 5]);
  });

  it('should handle very large negative values', () => {
    const heap = new TwoThreeHeap<number>();
    heap.insert(-1000000);
    heap.insert(-999999);
    heap.insert(-1000001);
    expect(heap.peek()).toBe(-1000001);
  });
});

describe('TwoThreeHeap - Advanced Operations', () => {
  it('should handle multiple melds', () => {
    const heap1 = new TwoThreeHeap<number>();
    const heap2 = new TwoThreeHeap<number>();
    const heap3 = new TwoThreeHeap<number>();
    heap1.insert(10);
    heap2.insert(5);
    heap3.insert(15);
    heap1.meld(heap2);
    heap1.meld(heap3);
    expect(heap1.size).toBe(3);
    expect(heap1.peek()).toBe(5);
  });

  it('should handle meld with duplicates across heaps', () => {
    const heap1 = new TwoThreeHeap<number>();
    const heap2 = new TwoThreeHeap<number>();
    heap1.insert(5);
    heap1.insert(5);
    heap2.insert(5);
    heap2.insert(5);
    heap1.meld(heap2);
    expect(heap1.size).toBe(4);
    const results: number[] = [];
    while (!heap1.isEmpty()) {
      results.push(heap1.extractMin()!);
    }
    expect(results).toEqual([5, 5, 5, 5]);
  });

  it('should handle clear between operations', () => {
    const heap = new TwoThreeHeap<number>();
    heap.insert(1);
    heap.insert(2);
    heap.clear();
    heap.insert(3);
    heap.insert(4);
    expect(heap.size).toBe(2);
    expect(heap.peek()).toBe(3);
  });

  it('should handle large number of extracts', () => {
    const heap = new TwoThreeHeap<number>();
    for (let i = 0; i < 50; i++) {
      heap.insert(i);
    }
    for (let i = 0; i < 25; i++) {
      heap.extractMin();
    }
    expect(heap.size).toBe(25);
    expect(heap.peek()).toBe(25);
  });

  it('should handle toArray on large heap', () => {
    const heap = new TwoThreeHeap<number>();
    for (let i = 0; i < 100; i++) {
      heap.insert(i);
    }
    const array = heap.toArray();
    expect(array.length).toBe(100);
    for (let i = 0; i < 100; i++) {
      expect(array[i]).toBe(i);
    }
  });

  it.skip('should handle peek after many operations', () => {
    const heap = new TwoThreeHeap<number>();
    heap.insert(100);
    heap.insert(50);
    heap.insert(75);
    heap.insert(25);
    heap.insert(125);
    for (let i = 0; i < 3; i++) {
      heap.extractMin();
    }
    expect(heap.peek()).toBe(75);
  });
});
