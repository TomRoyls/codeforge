import { describe, it, expect } from 'vitest';
import { SkewHeap3 } from '../src/core/skew-heap-3/index';

describe('SkewHeap3', () => {
  it('should create empty heap', async () => {
    const heap = new SkewHeap3<number>();
    expect(heap.isEmpty()).toBe(true);
    expect(heap.size).toBe(0);
  });

  it('should insert single element', async () => {
    const heap = new SkewHeap3<number>();
    heap.insert(5);
    expect(heap.isEmpty()).toBe(false);
    expect(heap.size).toBe(1);
    expect(heap.peek()).toBe(5);
  });

  it('should insert multiple elements', async () => {
    const heap = new SkewHeap3<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(7);
    heap.insert(1);
    expect(heap.size).toBe(4);
    expect(heap.peek()).toBe(1);
  });

  it('should extract min from single element', async () => {
    const heap = new SkewHeap3<number>();
    heap.insert(5);
    const min = heap.extractMin();
    expect(min).toBe(5);
    expect(heap.isEmpty()).toBe(true);
  });

  it('should extract min in ascending order', async () => {
    const heap = new SkewHeap3<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(7);
    heap.insert(1);
    heap.insert(9);
    heap.insert(2);
    const extracted: number[] = [];
    while (!heap.isEmpty()) {
      extracted.push(heap.extractMin()!);
    }
    expect(extracted).toEqual([1, 2, 3, 5, 7, 9]);
  });

  it('should peek without removing', async () => {
    const heap = new SkewHeap3<number>();
    heap.insert(5);
    heap.insert(3);
    expect(heap.peek()).toBe(3);
    expect(heap.size).toBe(2);
    expect(heap.peek()).toBe(3);
  });

  it('should peek on empty heap', async () => {
    const heap = new SkewHeap3<number>();
    expect(heap.peek()).toBeUndefined();
  });

  it('should extract from empty heap', async () => {
    const heap = new SkewHeap3<number>();
    expect(heap.extractMin()).toBeUndefined();
  });

  it('should merge two non-empty heaps', async () => {
    const heap1 = new SkewHeap3<number>();
    heap1.insert(3);
    heap1.insert(7);
    heap1.insert(1);

    const heap2 = new SkewHeap3<number>();
    heap2.insert(5);
    heap2.insert(2);

    heap1.merge(heap2);

    expect(heap1.size).toBe(5);
    expect(heap2.isEmpty()).toBe(true);
    expect(heap1.extractMin()).toBe(1);
    expect(heap1.extractMin()).toBe(2);
    expect(heap1.extractMin()).toBe(3);
    expect(heap1.extractMin()).toBe(5);
    expect(heap1.extractMin()).toBe(7);
  });

  it('should merge empty heap into non-empty', async () => {
    const heap1 = new SkewHeap3<number>();
    heap1.insert(3);
    heap1.insert(1);

    const heap2 = new SkewHeap3<number>();

    heap1.merge(heap2);

    expect(heap1.size).toBe(2);
    expect(heap1.extractMin()).toBe(1);
    expect(heap1.extractMin()).toBe(3);
  });

  it('should merge non-empty heap into empty', async () => {
    const heap1 = new SkewHeap3<number>();

    const heap2 = new SkewHeap3<number>();
    heap2.insert(3);
    heap2.insert(1);

    heap1.merge(heap2);

    expect(heap1.size).toBe(2);
    expect(heap1.extractMin()).toBe(1);
    expect(heap1.extractMin()).toBe(3);
  });

  it('should merge two empty heaps', async () => {
    const heap1 = new SkewHeap3<number>();
    const heap2 = new SkewHeap3<number>();

    heap1.merge(heap2);

    expect(heap1.isEmpty()).toBe(true);
  });

  it('should clear heap', async () => {
    const heap = new SkewHeap3<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(7);

    heap.clear();

    expect(heap.isEmpty()).toBe(true);
    expect(heap.size).toBe(0);
    expect(heap.peek()).toBeUndefined();
  });

  it('should convert to array', async () => {
    const heap = new SkewHeap3<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(7);
    heap.insert(1);

    const arr = heap.toArray();
    expect(arr.length).toBe(4);
    expect(arr).toContain(1);
    expect(arr).toContain(3);
    expect(arr).toContain(5);
    expect(arr).toContain(7);
  });

  it('should create heap from array using static method', async () => {
    const heap = SkewHeap3.fromArray([5, 3, 7, 1, 9, 2]);
    expect(heap.size).toBe(6);
    expect(heap.peek()).toBe(1);
  });

  it('should create heap from array and extract in order', async () => {
    const heap = SkewHeap3.fromArray([5, 3, 7, 1, 9, 2]);
    const extracted: number[] = [];
    while (!heap.isEmpty()) {
      extracted.push(heap.extractMin()!);
    }
    expect(extracted).toEqual([1, 2, 3, 5, 7, 9]);
  });

  it('should create empty heap from empty array', async () => {
    const heap = SkewHeap3.fromArray<number>([]);
    expect(heap.isEmpty()).toBe(true);
    expect(heap.size).toBe(0);
  });

  it('should work with custom comparator for max heap', async () => {
    const heap = new SkewHeap3<number>((a, b) => (a > b ? -1 : a < b ? 1 : 0));
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

  it('should work with custom comparator and fromArray', async () => {
    const heap = SkewHeap3.fromArray([5, 3, 7, 1], (a, b) => (a > b ? -1 : a < b ? 1 : 0));
    expect(heap.extractMin()).toBe(7);
    expect(heap.extractMin()).toBe(5);
    expect(heap.extractMin()).toBe(3);
    expect(heap.extractMin()).toBe(1);
  });

  it('should work with strings', async () => {
    const heap = new SkewHeap3<string>();
    heap.insert('banana');
    heap.insert('apple');
    heap.insert('cherry');
    heap.insert('date');

    expect(heap.extractMin()).toBe('apple');
    expect(heap.extractMin()).toBe('banana');
    expect(heap.extractMin()).toBe('cherry');
    expect(heap.extractMin()).toBe('date');
  });

  it('should work with objects using custom comparator', async () => {
    interface Item {
      value: number;
    }

    const heap = new SkewHeap3<Item>((a, b) => {
      return a.value < b.value ? -1 : a.value > b.value ? 1 : 0;
    });

    heap.insert({ value: 5 });
    heap.insert({ value: 3 });
    heap.insert({ value: 7 });
    heap.insert({ value: 1 });

    expect(heap.extractMin()!.value).toBe(1);
    expect(heap.extractMin()!.value).toBe(3);
    expect(heap.extractMin()!.value).toBe(5);
    expect(heap.extractMin()!.value).toBe(7);
  });

  it('should handle duplicate values', async () => {
    const heap = new SkewHeap3<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(5);
    heap.insert(3);
    heap.insert(1);

    const extracted: number[] = [];
    while (!heap.isEmpty()) {
      extracted.push(heap.extractMin()!);
    }
    expect(extracted).toEqual([1, 3, 3, 5, 5]);
  });

  it('should handle large dataset', async () => {
    const values: number[] = [];
    for (let i = 0; i < 1000; i++) {
      values.push(Math.floor(Math.random() * 10000));
    }

    const heap = new SkewHeap3<number>();
    for (const v of values) {
      heap.insert(v);
    }

    expect(heap.size).toBe(1000);

    const extracted: number[] = [];
    while (!heap.isEmpty()) {
      extracted.push(heap.extractMin()!);
    }

    const sorted = [...values].sort((a, b) => a - b);
    expect(extracted).toEqual(sorted);
  });

  it('should handle large dataset with fromArray', async () => {
    const values: number[] = [];
    for (let i = 0; i < 1000; i++) {
      values.push(Math.floor(Math.random() * 10000));
    }

    const heap = SkewHeap3.fromArray(values);

    expect(heap.size).toBe(1000);

    const extracted: number[] = [];
    while (!heap.isEmpty()) {
      extracted.push(heap.extractMin()!);
    }

    const sorted = [...values].sort((a, b) => a - b);
    expect(extracted).toEqual(sorted);
  });

  it('should handle large merge operation', async () => {
    const heap1 = new SkewHeap3<number>();
    const heap2 = new SkewHeap3<number>();

    for (let i = 0; i < 500; i++) {
      heap1.insert(Math.floor(Math.random() * 10000));
    }

    for (let i = 0; i < 500; i++) {
      heap2.insert(Math.floor(Math.random() * 10000));
    }

    heap1.merge(heap2);

    expect(heap1.size).toBe(1000);
    expect(heap2.isEmpty()).toBe(true);
  });

  it('should maintain heap property after many operations', async () => {
    const heap = new SkewHeap3<number>();

    for (let i = 0; i < 100; i++) {
      heap.insert(Math.floor(Math.random() * 1000));
      if (i % 3 === 0 && !heap.isEmpty()) {
        heap.extractMin();
      }
    }

    const extracted: number[] = [];
    while (!heap.isEmpty()) {
      extracted.push(heap.extractMin()!);
    }

    for (let i = 1; i < extracted.length; i++) {
      expect(extracted[i]).toBeGreaterThanOrEqual(extracted[i - 1]);
    }
  });

  it('should handle negative numbers', async () => {
    const heap = new SkewHeap3<number>();
    heap.insert(-5);
    heap.insert(3);
    heap.insert(-7);
    heap.insert(1);
    heap.insert(-2);

    expect(heap.extractMin()).toBe(-7);
    expect(heap.extractMin()).toBe(-5);
    expect(heap.extractMin()).toBe(-2);
    expect(heap.extractMin()).toBe(1);
    expect(heap.extractMin()).toBe(3);
  });

  it('should handle floating point numbers', async () => {
    const heap = new SkewHeap3<number>();
    heap.insert(5.5);
    heap.insert(3.3);
    heap.insert(7.7);
    heap.insert(1.1);
    heap.insert(9.9);

    expect(heap.extractMin()).toBeCloseTo(1.1);
    expect(heap.extractMin()).toBeCloseTo(3.3);
    expect(heap.extractMin()).toBeCloseTo(5.5);
    expect(heap.extractMin()).toBeCloseTo(7.7);
    expect(heap.extractMin()).toBeCloseTo(9.9);
  });

  it('should handle sequential insert and extract', async () => {
    const heap = new SkewHeap3<number>();

    for (let i = 100; i >= 1; i--) {
      heap.insert(i);
    }

    for (let i = 1; i <= 100; i++) {
      expect(heap.extractMin()).toBe(i);
    }
  });

  it('should swap children property of skew heap', async () => {
    const heap = new SkewHeap3<number>();
    heap.insert(3);
    heap.insert(1);
    heap.insert(2);

    const arr = heap.toArray();
    expect(arr.length).toBe(3);

    const extracted: number[] = [];
    while (!heap.isEmpty()) {
      extracted.push(heap.extractMin()!);
    }

    expect(extracted).toEqual([1, 2, 3]);
  });

  it('should merge heaps of different sizes', async () => {
    const smallHeap = new SkewHeap3<number>();
    smallHeap.insert(5);
    smallHeap.insert(3);

    const largeHeap = new SkewHeap3<number>();
    for (let i = 0; i < 100; i++) {
      largeHeap.insert(Math.floor(Math.random() * 1000));
    }

    const largeSizeBefore = largeHeap.size;

    largeHeap.merge(smallHeap);

    expect(largeHeap.size).toBe(largeSizeBefore + 2);
    expect(smallHeap.isEmpty()).toBe(true);
  });

  it('should maintain correct size after all operations', async () => {
    const heap = new SkewHeap3<number>();

    expect(heap.size).toBe(0);

    heap.insert(1);
    expect(heap.size).toBe(1);

    heap.insert(2);
    expect(heap.size).toBe(2);

    heap.insert(3);
    expect(heap.size).toBe(3);

    heap.extractMin();
    expect(heap.size).toBe(2);

    heap.extractMin();
    expect(heap.size).toBe(1);

    heap.extractMin();
    expect(heap.size).toBe(0);
  });

  it('should handle clear and rebuild', async () => {
    const heap = new SkewHeap3<number>();

    heap.insert(5);
    heap.insert(3);
    heap.insert(7);

    heap.clear();

    heap.insert(1);
    heap.insert(2);
    heap.insert(3);

    expect(heap.size).toBe(3);
    expect(heap.extractMin()).toBe(1);
    expect(heap.extractMin()).toBe(2);
    expect(heap.extractMin()).toBe(3);
  });

  it('should work with single element heap operations', async () => {
    const heap = new SkewHeap3<number>();
    heap.insert(42);

    expect(heap.size).toBe(1);
    expect(heap.peek()).toBe(42);
    expect(heap.extractMin()).toBe(42);
    expect(heap.isEmpty()).toBe(true);
    expect(heap.peek()).toBeUndefined();
  });

  it('should handle merging then inserting', async () => {
    const heap1 = new SkewHeap3<number>();
    heap1.insert(3);
    heap1.insert(1);

    const heap2 = new SkewHeap3<number>();
    heap2.insert(5);

    heap1.merge(heap2);
    heap1.insert(2);

    expect(heap1.extractMin()).toBe(1);
    expect(heap1.extractMin()).toBe(2);
    expect(heap1.extractMin()).toBe(3);
    expect(heap1.extractMin()).toBe(5);
  });

  it('should handle isEmpty', () => {
    const heap = new SkewHeap3<number>();
    expect(heap.isEmpty()).toBe(true);
    heap.insert(1);
    expect(heap.isEmpty()).toBe(false);
  });

  it('should handle size', () => {
    const heap = new SkewHeap3<number>();
    expect(heap.size).toBe(0);
    heap.insert(1);
    heap.insert(2);
    heap.insert(3);
    expect(heap.size).toBe(3);
  });

  it('should handle peek', () => {
    const heap = new SkewHeap3<number>();
    heap.insert(5);
    heap.insert(3);
    expect(heap.peek()).toBe(3);
    expect(heap.size).toBe(2);
  });

  it('should handle isEmpty', () => {
    const heap = new SkewHeap3<number>();
    expect(heap.isEmpty()).toBe(true);
    heap.insert(5);
    expect(heap.isEmpty()).toBe(false);
  });

  it('should handle clear', () => {
    const heap = new SkewHeap3<number>();
    heap.insert(5);
    heap.insert(3);
    heap.clear();
    expect(heap.isEmpty()).toBe(true);
    expect(heap.size).toBe(0);
  });

  it('should handle merge', () => {
    const h1 = new SkewHeap3<number>();
    h1.insert(5);
    h1.insert(3);
    const h2 = new SkewHeap3<number>();
    h2.insert(1);
    h2.insert(7);
    h1.merge(h2);
    expect(h1.peek()).toBe(1);
    expect(h1.size).toBe(4);
  });

  it('should handle toArray', () => {
    const heap = new SkewHeap3<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(7);
    const arr = heap.toArray();
    expect(arr.length).toBe(3);
  });
  it('should handle merge', () => {
    const heap1 = new SkewHeap3<number>();
    heap1.insert(5);
    heap1.insert(3);
    const heap2 = new SkewHeap3<number>();
    heap2.insert(1);
    heap2.insert(7);
    heap1.merge(heap2);
    expect(heap1.extractMin()).toBe(1);
  });
  it('should handle toArray after multiple inserts', () => {
    const heap = new SkewHeap3<number>();
    heap.insert(10);
    heap.insert(5);
    heap.insert(15);
    heap.insert(3);
    expect(heap.toArray().length).toBe(4);
  });
  it('should handle extractMin in order', () => {
    const heap = new SkewHeap3<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(7);
    heap.insert(1);
    expect(heap.extractMin()).toBe(1);
    expect(heap.extractMin()).toBe(3);
    expect(heap.extractMin()).toBe(5);
    expect(heap.extractMin()).toBe(7);
  });
  it('should handle merge', () => {
    const h1 = new SkewHeap3<number>();
    h1.insert(1);
    h1.insert(5);
    const h2 = new SkewHeap3<number>();
    h2.insert(3);
    h2.insert(7);
    h1.merge(h2);
    expect(h1.toArray().length).toBe(4);
  });
  it('should handle extractMin after merge', () => {
    const h1 = new SkewHeap3<number>();
    h1.insert(5);
    h1.insert(1);
    const h2 = new SkewHeap3<number>();
    h2.insert(3);
    h1.merge(h2);
    expect(h1.extractMin()).toBe(1);
  });
});
