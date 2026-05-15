import { describe, it, expect } from 'vitest';
import { IntervalHeap3 } from '../src/core/interval-heap-3/index';

describe('IntervalHeap3', () => {
  it('should create empty heap', async () => {
    const heap = new IntervalHeap3<number>();
    expect(heap.isEmpty()).toBe(true);
    expect(heap.size).toBe(0);
  });

  it('should insert single element', async () => {
    const heap = new IntervalHeap3<number>();
    heap.insert(5);
    expect(heap.size).toBe(1);
    expect(heap.isEmpty()).toBe(false);
    expect(heap.getMin()).toBe(5);
    expect(heap.getMax()).toBe(5);
  });

  it('should insert multiple elements', async () => {
    const heap = new IntervalHeap3<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(8);
    heap.insert(1);
    expect(heap.size).toBe(4);
    expect(heap.getMin()).toBe(1);
    expect(heap.getMax()).toBe(8);
  });

  it('should get min without removing', async () => {
    const heap = new IntervalHeap3<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(8);
    expect(heap.getMin()).toBe(3);
    expect(heap.size).toBe(3);
  });

  it('should get max without removing', async () => {
    const heap = new IntervalHeap3<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(8);
    expect(heap.getMax()).toBe(8);
    expect(heap.size).toBe(3);
  });

  it('should extract min and maintain heap property', async () => {
    const heap = new IntervalHeap3<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(8);
    heap.insert(1);
    heap.insert(6);

    const min = heap.extractMin();
    expect(min).toBe(1);
    expect(heap.size).toBe(4);
    expect(heap.getMin()).toBe(3);
    expect(heap.getMax()).toBe(8);
  });

  it('should extract max and maintain heap property', async () => {
    const heap = new IntervalHeap3<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(8);
    heap.insert(1);
    heap.insert(6);

    const max = heap.extractMax();
    expect(max).toBe(8);
    expect(heap.size).toBe(4);
    expect(heap.getMin()).toBe(1);
    expect(heap.getMax()).toBe(6);
  });

  it('should handle extract min on empty heap', async () => {
    const heap = new IntervalHeap3<number>();
    expect(heap.extractMin()).toBeUndefined();
    expect(heap.size).toBe(0);
  });

  it('should handle extract max on empty heap', async () => {
    const heap = new IntervalHeap3<number>();
    expect(heap.extractMax()).toBeUndefined();
    expect(heap.size).toBe(0);
  });

  it('should handle get min on empty heap', async () => {
    const heap = new IntervalHeap3<number>();
    expect(heap.getMin()).toBeUndefined();
  });

  it('should handle get max on empty heap', async () => {
    const heap = new IntervalHeap3<number>();
    expect(heap.getMax()).toBeUndefined();
  });

  it('should clear all elements', async () => {
    const heap = new IntervalHeap3<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(8);
    heap.clear();
    expect(heap.isEmpty()).toBe(true);
    expect(heap.size).toBe(0);
  });

  it('should convert to array', async () => {
    const heap = new IntervalHeap3<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(8);
    heap.insert(1);

    const arr = heap.toArray();
    expect(arr.length).toBe(4);
    expect(arr).toContain(1);
    expect(arr).toContain(3);
    expect(arr).toContain(5);
    expect(arr).toContain(8);
  });

  it('should handle duplicate values', async () => {
    const heap = new IntervalHeap3<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(5);
    heap.insert(3);

    expect(heap.getMin()).toBe(3);
    expect(heap.getMax()).toBe(5);
    expect(heap.size).toBe(4);
  });

  it('should handle negative numbers', async () => {
    const heap = new IntervalHeap3<number>();
    heap.insert(-5);
    heap.insert(3);
    heap.insert(-8);
    heap.insert(1);

    expect(heap.getMin()).toBe(-8);
    expect(heap.getMax()).toBe(3);
  });

  it('should handle mixed operations', async () => {
    const heap = new IntervalHeap3<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(8);

    expect(heap.extractMin()).toBe(3);
    heap.insert(1);
    expect(heap.getMin()).toBe(1);
    expect(heap.extractMax()).toBe(8);
    expect(heap.getMax()).toBe(5);
  });

  it('should extract all elements in sorted order (min)', async () => {
    const heap = new IntervalHeap3<number>();
    const values = [5, 3, 8, 1, 6, 2, 7, 4];
    values.forEach(v => heap.insert(v));

    const sorted: number[] = [];
    while (!heap.isEmpty()) {
      sorted.push(heap.extractMin()!);
    }

    expect(sorted).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('should extract all elements in sorted order (max)', async () => {
    const heap = new IntervalHeap3<number>();
    const values = [5, 3, 8, 1, 6, 2, 7, 4];
    values.forEach(v => heap.insert(v));

    const sorted: number[] = [];
    while (!heap.isEmpty()) {
      sorted.push(heap.extractMax()!);
    }

    expect(sorted).toEqual([8, 7, 6, 5, 4, 3, 2, 1]);
  });

  it('should handle single element extract', async () => {
    const heap = new IntervalHeap3<number>();
    heap.insert(5);

    expect(heap.extractMin()).toBe(5);
    expect(heap.isEmpty()).toBe(true);
  });

  it('should work with custom comparator', async () => {
    const heap = new IntervalHeap3<string>((a, b) => a.localeCompare(b));
    heap.insert('banana');
    heap.insert('apple');
    heap.insert('cherry');

    expect(heap.getMin()).toBe('apple');
    expect(heap.getMax()).toBe('cherry');
  });

  it('should handle large dataset', async () => {
    const heap = new IntervalHeap3<number>();
    const size = 1000;

    for (let i = 0; i < size; i++) {
      heap.insert(Math.random() * size);
    }

    expect(heap.size).toBe(size);
    expect(heap.isEmpty()).toBe(false);

    const min = heap.extractMin();
    const max = heap.extractMax();

    const arr = heap.toArray();
    for (const v of arr) {
      expect(v).toBeGreaterThanOrEqual(min!);
      expect(v).toBeLessThanOrEqual(max!);
    }
  });

  it('should maintain min after multiple extractions', async () => {
    const heap = new IntervalHeap3<number>();
    const values = [10, 5, 15, 3, 20, 1];
    values.forEach(v => heap.insert(v));

    expect(heap.extractMin()).toBe(1);
    expect(heap.extractMin()).toBe(3);
    expect(heap.extractMin()).toBe(5);
    expect(heap.getMin()).toBe(10);
  });

  it('should maintain max after multiple extractions', async () => {
    const heap = new IntervalHeap3<number>();
    const values = [10, 5, 15, 3, 20, 1];
    values.forEach(v => heap.insert(v));

    expect(heap.extractMax()).toBe(20);
    expect(heap.extractMax()).toBe(15);
    expect(heap.extractMax()).toBe(10);
    expect(heap.getMax()).toBe(5);
  });

  it('should handle alternating min and max extractions', async () => {
    const heap = new IntervalHeap3<number>();
    const values = [5, 10, 3, 15, 1, 20];
    values.forEach(v => heap.insert(v));

    expect(heap.extractMin()).toBe(1);
    expect(heap.extractMax()).toBe(20);
    expect(heap.extractMin()).toBe(3);
    expect(heap.extractMax()).toBe(15);
    expect(heap.extractMin()).toBe(5);
    expect(heap.extractMax()).toBe(10);
  });

  it('should handle objects with comparator', async () => {
    interface Obj {
      id: number;
      value: number;
    }

    const heap = new IntervalHeap3<Obj>((a, b) => a.value - b.value);
    heap.insert({ id: 1, value: 10 });
    heap.insert({ id: 2, value: 5 });
    heap.insert({ id: 3, value: 15 });

    expect(heap.getMin()?.value).toBe(5);
    expect(heap.getMax()?.value).toBe(15);
  });

  it('should handle inserting after extraction', async () => {
    const heap = new IntervalHeap3<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(8);

    heap.extractMin();
    heap.insert(1);

    expect(heap.getMin()).toBe(1);
    expect(heap.size).toBe(3);
  });

  it('should handle size getter', async () => {
    const heap = new IntervalHeap3<number>();
    expect(heap.size).toBe(0);

    heap.insert(1);
    expect(heap.size).toBe(1);

    heap.insert(2);
    heap.insert(3);
    expect(heap.size).toBe(3);

    heap.extractMin();
    expect(heap.size).toBe(2);
  });

  it('should handle zero values', async () => {
    const heap = new IntervalHeap3<number>();
    heap.insert(0);
    heap.insert(-1);
    heap.insert(1);

    expect(heap.getMin()).toBe(-1);
    expect(heap.getMax()).toBe(1);
  });

  it('should handle very large numbers', async () => {
    const heap = new IntervalHeap3<number>();
    heap.insert(Number.MAX_SAFE_INTEGER);
    heap.insert(Number.MIN_SAFE_INTEGER);
    heap.insert(0);

    expect(heap.getMin()).toBe(Number.MIN_SAFE_INTEGER);
    expect(heap.getMax()).toBe(Number.MAX_SAFE_INTEGER);
  });

  it('should handle extractMax', async () => {
    const heap = new IntervalHeap3<number>();
    heap.insert(1);
    heap.insert(5);
    heap.insert(3);
    expect(heap.extractMax()).toBe(5);
    expect(heap.size).toBe(2);
  });

  it('should handle duplicate values', async () => {
    const heap = new IntervalHeap3<number>();
    heap.insert(3);
    heap.insert(3);
    heap.insert(3);
    expect(heap.getMin()).toBe(3);
    expect(heap.getMax()).toBe(3);
    expect(heap.size).toBe(3);
  });

  it('should handle isEmpty on fresh heap', async () => {
    const heap = new IntervalHeap3<number>();
    expect(heap.isEmpty()).toBe(true);
  });

  it('should handle toArray', async () => {
    const heap = new IntervalHeap3<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(8);
    const arr = heap.toArray();
    expect(arr).toHaveLength(3);
    expect(arr).toContain(5);
    expect(arr).toContain(3);
    expect(arr).toContain(8);
  });

  it('should handle clear', async () => {
    const heap = new IntervalHeap3<number>();
    heap.insert(5);
    heap.insert(3);
    heap.clear();
    expect(heap.size).toBe(0);
    expect(heap.isEmpty()).toBe(true);
  });

  it('should handle extractMax', async () => {
    const heap = new IntervalHeap3<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(8);
    expect(heap.extractMax()).toBe(8);
    expect(heap.size).toBe(2);
  });

  it('should handle size tracking', async () => {
    const heap = new IntervalHeap3<number>();
    expect(heap.size).toBe(0);
    heap.insert(1);
    heap.insert(2);
    heap.insert(3);
    expect(heap.size).toBe(3);
  });
});
