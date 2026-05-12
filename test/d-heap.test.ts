import { describe, it, expect } from 'vitest';
import { DHeap } from './src/core/d-heap/index.js';

describe('DHeap basic operations', () => {
  it('should create empty heap with default d=4', () => {
    const heap = new DHeap<number>();
    expect(heap.size).toBe(0);
    expect(heap.isEmpty()).toBe(true);
  });

  it('should create heap with specified d', () => {
    const heap = new DHeap<number>(3);
    expect(heap.size).toBe(0);
    expect(heap.isEmpty()).toBe(true);
  });

  it('should throw error for d < 2', () => {
    expect(() => new DHeap<number>(1)).toThrow('Branching factor d must be at least 2');
    expect(() => new DHeap<number>(0)).toThrow('Branching factor d must be at least 2');
  });

  it('should insert single element', () => {
    const heap = new DHeap<number>(2);
    heap.insert(5);
    expect(heap.size).toBe(1);
    expect(heap.isEmpty()).toBe(false);
    expect(heap.peek()).toBe(5);
  });

  it('should insert and extract single element', () => {
    const heap = new DHeap<number>(2);
    heap.insert(5);
    const extracted = heap.extractMin();
    expect(extracted).toBe(5);
    expect(heap.size).toBe(0);
    expect(heap.isEmpty()).toBe(true);
  });

  it('should insert multiple elements and extract in order', () => {
    const heap = new DHeap<number>(2);
    heap.insert(5);
    heap.insert(3);
    heap.insert(8);
    heap.insert(1);
    heap.insert(6);
    expect(heap.extractMin()).toBe(1);
    expect(heap.extractMin()).toBe(3);
    expect(heap.extractMin()).toBe(5);
    expect(heap.extractMin()).toBe(6);
    expect(heap.extractMin()).toBe(8);
    expect(heap.extractMin()).toBe(undefined);
  });

  it('should peek without removing', () => {
    const heap = new DHeap<number>(2);
    heap.insert(5);
    heap.insert(3);
    heap.insert(8);
    expect(heap.peek()).toBe(3);
    expect(heap.size).toBe(3);
    expect(heap.peek()).toBe(3);
  });

  it('should return undefined for peek on empty heap', () => {
    const heap = new DHeap<number>(2);
    expect(heap.peek()).toBe(undefined);
  });

  it('should return undefined for extractMin on empty heap', () => {
    const heap = new DHeap<number>(2);
    expect(heap.extractMin()).toBe(undefined);
  });

  it('should clear the heap', () => {
    const heap = new DHeap<number>(2);
    heap.insert(5);
    heap.insert(3);
    heap.insert(8);
    heap.clear();
    expect(heap.size).toBe(0);
    expect(heap.isEmpty()).toBe(true);
    expect(heap.peek()).toBe(undefined);
  });

  it('should convert to array', () => {
    const heap = new DHeap<number>(2);
    heap.insert(5);
    heap.insert(3);
    heap.insert(8);
    heap.insert(1);
    const arr = heap.toArray();
    expect(arr).toHaveLength(4);
    expect(arr).toContain(1);
    expect(arr).toContain(3);
    expect(arr).toContain(5);
    expect(arr).toContain(8);
    expect(heap.size).toBe(4);
  });

  it('should return empty array when converting empty heap', () => {
    const heap = new DHeap<number>(2);
    const arr = heap.toArray();
    expect(arr).toHaveLength(0);
  });

  it('should handle duplicate values', () => {
    const heap = new DHeap<number>(2);
    heap.insert(5);
    heap.insert(5);
    heap.insert(3);
    heap.insert(3);
    heap.insert(8);
    expect(heap.extractMin()).toBe(3);
    expect(heap.extractMin()).toBe(3);
    expect(heap.extractMin()).toBe(5);
    expect(heap.extractMin()).toBe(5);
    expect(heap.extractMin()).toBe(8);
  });

  it('should handle negative numbers', () => {
    const heap = new DHeap<number>(2);
    heap.insert(-5);
    heap.insert(3);
    heap.insert(-8);
    heap.insert(1);
    heap.insert(-6);
    expect(heap.extractMin()).toBe(-8);
    expect(heap.extractMin()).toBe(-6);
    expect(heap.extractMin()).toBe(-5);
    expect(heap.extractMin()).toBe(1);
    expect(heap.extractMin()).toBe(3);
  });

  it('should handle zeros', () => {
    const heap = new DHeap<number>(2);
    heap.insert(5);
    heap.insert(0);
    heap.insert(-3);
    heap.insert(0);
    heap.insert(8);
    expect(heap.extractMin()).toBe(-3);
    expect(heap.extractMin()).toBe(0);
    expect(heap.extractMin()).toBe(0);
    expect(heap.extractMin()).toBe(5);
    expect(heap.extractMin()).toBe(8);
  });
});

describe('DHeap with different d values', () => {
  it('should work correctly with d=2 (binary heap)', () => {
    const heap = new DHeap<number>(2);
    heap.insert(5);
    heap.insert(3);
    heap.insert(8);
    heap.insert(1);
    heap.insert(6);
    expect(heap.extractMin()).toBe(1);
    expect(heap.extractMin()).toBe(3);
    expect(heap.extractMin()).toBe(5);
    expect(heap.extractMin()).toBe(6);
    expect(heap.extractMin()).toBe(8);
  });

  it('should work correctly with d=3', () => {
    const heap = new DHeap<number>(3);
    heap.insert(5);
    heap.insert(3);
    heap.insert(8);
    heap.insert(1);
    heap.insert(6);
    expect(heap.extractMin()).toBe(1);
    expect(heap.extractMin()).toBe(3);
    expect(heap.extractMin()).toBe(5);
    expect(heap.extractMin()).toBe(6);
    expect(heap.extractMin()).toBe(8);
  });

  it('should work correctly with d=4 (default)', () => {
    const heap = new DHeap<number>(4);
    heap.insert(5);
    heap.insert(3);
    heap.insert(8);
    heap.insert(1);
    heap.insert(6);
    expect(heap.extractMin()).toBe(1);
    expect(heap.extractMin()).toBe(3);
    expect(heap.extractMin()).toBe(5);
    expect(heap.extractMin()).toBe(6);
    expect(heap.extractMin()).toBe(8);
  });

  it('should work correctly with d=5', () => {
    const heap = new DHeap<number>(5);
    heap.insert(5);
    heap.insert(3);
    heap.insert(8);
    heap.insert(1);
    heap.insert(6);
    expect(heap.extractMin()).toBe(1);
    expect(heap.extractMin()).toBe(3);
    expect(heap.extractMin()).toBe(5);
    expect(heap.extractMin()).toBe(6);
    expect(heap.extractMin()).toBe(8);
  });

  it('should work correctly with d=8', () => {
    const heap = new DHeap<number>(8);
    heap.insert(5);
    heap.insert(3);
    heap.insert(8);
    heap.insert(1);
    heap.insert(6);
    expect(heap.extractMin()).toBe(1);
    expect(heap.extractMin()).toBe(3);
    expect(heap.extractMin()).toBe(5);
    expect(heap.extractMin()).toBe(6);
    expect(heap.extractMin()).toBe(8);
  });

  it('should handle many elements with d=2', () => {
    const heap = new DHeap<number>(2);
    const values = [9, 7, 5, 3, 1, 8, 6, 4, 2, 0];
    values.forEach(v => heap.insert(v));
    for (let i = 0; i < values.length; i++) {
      expect(heap.extractMin()).toBe(i);
    }
  });

  it('should handle many elements with d=3', () => {
    const heap = new DHeap<number>(3);
    const values = [9, 7, 5, 3, 1, 8, 6, 4, 2, 0];
    values.forEach(v => heap.insert(v));
    for (let i = 0; i < values.length; i++) {
      expect(heap.extractMin()).toBe(i);
    }
  });

  it('should handle many elements with d=4', () => {
    const heap = new DHeap<number>(4);
    const values = [9, 7, 5, 3, 1, 8, 6, 4, 2, 0];
    values.forEach(v => heap.insert(v));
    for (let i = 0; i < values.length; i++) {
      expect(heap.extractMin()).toBe(i);
    }
  });

  it('should handle many elements with d=5', () => {
    const heap = new DHeap<number>(5);
    const values = [9, 7, 5, 3, 1, 8, 6, 4, 2, 0];
    values.forEach(v => heap.insert(v));
    for (let i = 0; i < values.length; i++) {
      expect(heap.extractMin()).toBe(i);
    }
  });

  it('should handle many elements with d=8', () => {
    const heap = new DHeap<number>(8);
    const values = [9, 7, 5, 3, 1, 8, 6, 4, 2, 0];
    values.forEach(v => heap.insert(v));
    for (let i = 0; i < values.length; i++) {
      expect(heap.extractMin()).toBe(i);
    }
  });
});

describe('DHeap heapify operation', () => {
  it('should heapify empty array', () => {
    const heap = new DHeap<number>(2);
    heap.heapify([]);
    expect(heap.size).toBe(0);
    expect(heap.isEmpty()).toBe(true);
  });

  it('should heapify single element', () => {
    const heap = new DHeap<number>(2);
    heap.heapify([5]);
    expect(heap.size).toBe(1);
    expect(heap.peek()).toBe(5);
  });

  it('should heapify multiple elements', () => {
    const heap = new DHeap<number>(2);
    heap.heapify([5, 3, 8, 1, 6]);
    expect(heap.extractMin()).toBe(1);
    expect(heap.extractMin()).toBe(3);
    expect(heap.extractMin()).toBe(5);
    expect(heap.extractMin()).toBe(6);
    expect(heap.extractMin()).toBe(8);
  });

  it('should heapify with d=3', () => {
    const heap = new DHeap<number>(3);
    heap.heapify([5, 3, 8, 1, 6]);
    expect(heap.extractMin()).toBe(1);
    expect(heap.extractMin()).toBe(3);
    expect(heap.extractMin()).toBe(5);
    expect(heap.extractMin()).toBe(6);
    expect(heap.extractMin()).toBe(8);
  });

  it('should heapify with d=4', () => {
    const heap = new DHeap<number>(4);
    heap.heapify([5, 3, 8, 1, 6]);
    expect(heap.extractMin()).toBe(1);
    expect(heap.extractMin()).toBe(3);
    expect(heap.extractMin()).toBe(5);
    expect(heap.extractMin()).toBe(6);
    expect(heap.extractMin()).toBe(8);
  });

  it('should heapify many elements', () => {
    const heap = new DHeap<number>(2);
    const values = [9, 7, 5, 3, 1, 8, 6, 4, 2, 0];
    heap.heapify(values);
    for (let i = 0; i < values.length; i++) {
      expect(heap.extractMin()).toBe(i);
    }
  });

  it('should replace existing heap when heapifying', () => {
    const heap = new DHeap<number>(2);
    heap.insert(100);
    heap.insert(200);
    heap.heapify([5, 3, 8]);
    expect(heap.size).toBe(3);
    expect(heap.extractMin()).toBe(3);
    expect(heap.extractMin()).toBe(5);
    expect(heap.extractMin()).toBe(8);
  });
});

describe('DHeap update operation', () => {
  it('should throw error for invalid index', () => {
    const heap = new DHeap<number>(2);
    heap.insert(5);
    expect(() => heap.update(-1, 10)).toThrow('Index out of bounds');
    expect(() => heap.update(5, 10)).toThrow('Index out of bounds');
  });

  it('should update value to smaller value (bubble up)', () => {
    const heap = new DHeap<number>(2);
    heap.insert(5);
    heap.insert(10);
    heap.insert(15);
    heap.update(1, 3);
    expect(heap.peek()).toBe(3);
    expect(heap.extractMin()).toBe(3);
    expect(heap.extractMin()).toBe(5);
    expect(heap.extractMin()).toBe(15);
  });

  it('should update value to larger value (bubble down)', () => {
    const heap = new DHeap<number>(2);
    heap.insert(5);
    heap.insert(3);
    heap.insert(15);
    heap.update(0, 10);
    expect(heap.peek()).toBe(5);
    expect(heap.extractMin()).toBe(5);
    expect(heap.extractMin()).toBe(10);
    expect(heap.extractMin()).toBe(15);
  });

  it('should update to same value', () => {
    const heap = new DHeap<number>(2);
    heap.insert(5);
    heap.insert(3);
    heap.insert(8);
    heap.update(1, 5);
    expect(heap.extractMin()).toBe(3);
    expect(heap.extractMin()).toBe(5);
    expect(heap.extractMin()).toBe(8);
  });

  it('should update root element', () => {
    const heap = new DHeap<number>(2);
    heap.insert(5);
    heap.insert(3);
    heap.insert(8);
    heap.update(0, 1);
    expect(heap.peek()).toBe(1);
    expect(heap.extractMin()).toBe(1);
    expect(heap.extractMin()).toBe(5);
    expect(heap.extractMin()).toBe(8);
  });

  it('should update last element', () => {
    const heap = new DHeap<number>(2);
    heap.insert(5);
    heap.insert(3);
    heap.insert(8);
    heap.update(2, 1);
    expect(heap.extractMin()).toBe(1);
    expect(heap.extractMin()).toBe(3);
    expect(heap.extractMin()).toBe(5);
  });

  it('should update with different d values', () => {
    const heap = new DHeap<number>(4);
    heap.insert(5);
    heap.insert(10);
    heap.insert(15);
    heap.insert(20);
    heap.insert(25);
    heap.update(3, 2);
    expect(heap.peek()).toBe(2);
  });
});

describe('DHeap with custom comparator', () => {
  it('should work with string comparator', () => {
    const heap = new DHeap<string>(2, (a, b) => a.localeCompare(b));
    heap.insert('zebra');
    heap.insert('apple');
    heap.insert('banana');
    heap.insert('cherry');
    expect(heap.extractMin()).toBe('apple');
    expect(heap.extractMin()).toBe('banana');
    expect(heap.extractMin()).toBe('cherry');
    expect(heap.extractMin()).toBe('zebra');
  });

  it('should work with max heap comparator', () => {
    const heap = new DHeap<number>(2, (a, b) => b - a);
    heap.insert(5);
    heap.insert(3);
    heap.insert(8);
    heap.insert(1);
    heap.insert(6);
    expect(heap.extractMin()).toBe(8);
    expect(heap.extractMin()).toBe(6);
    expect(heap.extractMin()).toBe(5);
    expect(heap.extractMin()).toBe(3);
    expect(heap.extractMin()).toBe(1);
  });

  it('should work with object comparator', () => {
    interface Item {
      value: number;
      name: string;
    }
    const heap = new DHeap<Item>(2, (a, b) => a.value - b.value);
    heap.insert({ value: 5, name: 'five' });
    heap.insert({ value: 3, name: 'three' });
    heap.insert({ value: 8, name: 'eight' });
    expect(heap.extractMin()?.value).toBe(3);
    expect(heap.extractMin()?.value).toBe(5);
    expect(heap.extractMin()?.value).toBe(8);
  });
});

describe('DHeap stress tests', () => {
  it('should handle 100 elements with d=2', () => {
    const heap = new DHeap<number>(2);
    const values = Array.from({ length: 100 }, () => Math.floor(Math.random() * 1000));
    values.forEach(v => heap.insert(v));
    const sorted = [...values].sort((a, b) => a - b);
    for (const expected of sorted) {
      expect(heap.extractMin()).toBe(expected);
    }
  });

  it('should handle 100 elements with d=4', () => {
    const heap = new DHeap<number>(4);
    const values = Array.from({ length: 100 }, () => Math.floor(Math.random() * 1000));
    values.forEach(v => heap.insert(v));
    const sorted = [...values].sort((a, b) => a - b);
    for (const expected of sorted) {
      expect(heap.extractMin()).toBe(expected);
    }
  });

  it('should handle 100 elements with d=8', () => {
    const heap = new DHeap<number>(8);
    const values = Array.from({ length: 100 }, () => Math.floor(Math.random() * 1000));
    values.forEach(v => heap.insert(v));
    const sorted = [...values].sort((a, b) => a - b);
    for (const expected of sorted) {
      expect(heap.extractMin()).toBe(expected);
    }
  });

  it('should handle heapify with 100 elements', () => {
    const heap = new DHeap<number>(4);
    const values = Array.from({ length: 100 }, () => Math.floor(Math.random() * 1000));
    heap.heapify(values);
    const sorted = [...values].sort((a, b) => a - b);
    for (const expected of sorted) {
      expect(heap.extractMin()).toBe(expected);
    }
  });

  it('should maintain correct size after many operations', () => {
    const heap = new DHeap<number>(4);
    for (let i = 0; i < 50; i++) {
      heap.insert(i);
    }
    expect(heap.size).toBe(50);
    for (let i = 0; i < 25; i++) {
      heap.extractMin();
    }
    expect(heap.size).toBe(25);
    for (let i = 50; i < 75; i++) {
      heap.insert(i);
    }
    expect(heap.size).toBe(50);
  });

  it('should handle alternating insert and extract', () => {
    const heap = new DHeap<number>(4);
    heap.insert(10);
    heap.insert(5);
    expect(heap.extractMin()).toBe(5);
    heap.insert(3);
    expect(heap.extractMin()).toBe(3);
    heap.insert(8);
    expect(heap.extractMin()).toBe(8);
    expect(heap.extractMin()).toBe(10);
  });

  it('should handle large d value with few elements', () => {
    const heap = new DHeap<number>(100);
    heap.insert(5);
    heap.insert(3);
    heap.insert(8);
    heap.insert(1);
    heap.insert(6);
    expect(heap.extractMin()).toBe(1);
    expect(heap.extractMin()).toBe(3);
    expect(heap.extractMin()).toBe(5);
    expect(heap.extractMin()).toBe(6);
    expect(heap.extractMin()).toBe(8);
  });

  it('should handle sequential insertions', () => {
    const heap = new DHeap<number>(3);
    for (let i = 0; i < 10; i++) {
      heap.insert(i);
    }
    for (let i = 0; i < 10; i++) {
      expect(heap.extractMin()).toBe(i);
    }
  });

  it('should handle reverse sequential insertions', () => {
    const heap = new DHeap<number>(3);
    for (let i = 9; i >= 0; i--) {
      heap.insert(i);
    }
    for (let i = 0; i < 10; i++) {
      expect(heap.extractMin()).toBe(i);
    }
  });
});
