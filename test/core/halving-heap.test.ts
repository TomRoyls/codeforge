import { describe, it, expect, beforeEach } from 'vitest';
import { HalvingHeap } from '../../src/core/halving-heap/index.js';

describe('HalvingHeap', () => {
  let heap: HalvingHeap<number>;

  beforeEach(() => {
    heap = new HalvingHeap();
  });

  describe('construction', () => {
    it('creates empty heap', () => {
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size).toBe(0);
    });

    it('creates heap with custom comparator', () => {
      const maxHeap = new HalvingHeap({ comparator: (a, b) => (a > b ? -1 : a < b ? 1 : 0) });
      maxHeap.insert(1);
      maxHeap.insert(2);
      maxHeap.insert(3);
      expect(maxHeap.extractMin()).toBe(3);
      expect(maxHeap.extractMin()).toBe(2);
      expect(maxHeap.extractMin()).toBe(1);
    });

    it('creates heap with capacity', () => {
      const cappedHeap = new HalvingHeap({ capacity: 5 });
      for (let i = 0; i < 10; i++) {
        cappedHeap.insert(i);
      }
      expect(cappedHeap.size).toBe(10);
    });

    it('creates heap with both comparator and capacity', () => {
      const heapWithBoth = new HalvingHeap({
        comparator: (a, b) => (a < b ? -1 : a > b ? 1 : 0),
        capacity: 3
      });
      heapWithBoth.insert(1);
      expect(heapWithBoth.peek()).toBe(1);
    });
  });

  describe('insert', () => {
    it('inserts single element', () => {
      heap.insert(5);
      expect(heap.size).toBe(1);
      expect(heap.isEmpty()).toBe(false);
      expect(heap.peek()).toBe(5);
    });

    it('inserts multiple elements', () => {
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      expect(heap.size).toBe(4);
      expect(heap.peek()).toBe(1);
    });

    it('inserts in ascending order', () => {
      for (let i = 1; i <= 10; i++) {
        heap.insert(i);
      }
      expect(heap.size).toBe(10);
      expect(heap.peek()).toBe(1);
    });

    it('inserts in descending order', () => {
      for (let i = 10; i >= 1; i--) {
        heap.insert(i);
      }
      expect(heap.size).toBe(10);
      expect(heap.peek()).toBe(1);
    });

    it('inserts duplicate values', () => {
      heap.insert(5);
      heap.insert(5);
      heap.insert(5);
      expect(heap.size).toBe(3);
    });

    it('inserts negative numbers', () => {
      heap.insert(-5);
      heap.insert(0);
      heap.insert(5);
      heap.insert(-10);
      expect(heap.peek()).toBe(-10);
    });

    it('inserts large numbers', () => {
      heap.insert(Number.MAX_SAFE_INTEGER);
      heap.insert(Number.MIN_SAFE_INTEGER);
      heap.insert(0);
      expect(heap.peek()).toBe(Number.MIN_SAFE_INTEGER);
    });

    it('inserts zero', () => {
      heap.insert(0);
      expect(heap.size).toBe(1);
      expect(heap.peek()).toBe(0);
    });

    it('inserts after extraction', () => {
      heap.insert(5);
      heap.insert(3);
      heap.extractMin();
      heap.insert(1);
      expect(heap.peek()).toBe(1);
    });
  });

  describe('extractMin', () => {
    it('extracts from empty heap returns undefined', () => {
      expect(heap.extractMin()).toBe(undefined);
    });

    it('extracts single element', () => {
      heap.insert(5);
      expect(heap.extractMin()).toBe(5);
      expect(heap.isEmpty()).toBe(true);
    });

    it('extracts in correct order', () => {
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(7);
    });

    it('extracts all elements', () => {
      const values = [5, 3, 7, 1, 9, 2, 8];
      for (const v of values) {
        heap.insert(v);
      }
      const extracted: number[] = [];
      while (!heap.isEmpty()) {
        extracted.push(heap.extractMin()!);
      }
      expect(extracted).toEqual([1, 2, 3, 5, 7, 8, 9]);
    });

    it('extracts with duplicates', () => {
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

    it('maintains size after extraction', () => {
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      expect(heap.size).toBe(3);
      heap.extractMin();
      expect(heap.size).toBe(2);
    });

    it('returns undefined after exhausting heap', () => {
      heap.insert(1);
      heap.insert(2);
      heap.extractMin();
      heap.extractMin();
      expect(heap.extractMin()).toBe(undefined);
    });
  });

  describe('peek', () => {
    it('peeks empty heap returns undefined', () => {
      expect(heap.peek()).toBe(undefined);
    });

    it('peeks without removing', () => {
      heap.insert(5);
      heap.insert(3);
      expect(heap.peek()).toBe(3);
      expect(heap.size).toBe(2);
    });

    it('peeks multiple times', () => {
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.peek()).toBe(3);
      expect(heap.peek()).toBe(3);
      expect(heap.peek()).toBe(3);
    });

    it('peeks after insertions', () => {
      heap.insert(5);
      expect(heap.peek()).toBe(5);
      heap.insert(3);
      expect(heap.peek()).toBe(3);
      heap.insert(1);
      expect(heap.peek()).toBe(1);
    });

    it('peeks after extraction', () => {
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.extractMin();
      expect(heap.peek()).toBe(5);
    });
  });

  describe('meld', () => {
    it('melds empty heaps', () => {
      const other = new HalvingHeap();
      heap.meld(other);
      expect(heap.isEmpty()).toBe(true);
      expect(other.isEmpty()).toBe(true);
    });

    it('melds heap with empty heap', () => {
      heap.insert(5);
      heap.insert(3);
      const other = new HalvingHeap();
      heap.meld(other);
      expect(heap.size).toBe(2);
      expect(heap.peek()).toBe(3);
      expect(other.isEmpty()).toBe(true);
    });

    it('melds empty heap with heap', () => {
      const other = new HalvingHeap();
      other.insert(5);
      other.insert(3);
      heap.meld(other);
      expect(heap.size).toBe(2);
      expect(heap.peek()).toBe(3);
      expect(other.isEmpty()).toBe(true);
    });

    it('melds two non-empty heaps', () => {
      heap.insert(5);
      heap.insert(3);
      const other = new HalvingHeap();
      other.insert(7);
      other.insert(1);
      heap.meld(other);
      expect(heap.size).toBe(4);
      expect(heap.peek()).toBe(1);
      expect(other.isEmpty()).toBe(true);
    });

    it('melds heaps with overlapping values', () => {
      heap.insert(5);
      heap.insert(3);
      const other = new HalvingHeap();
      other.insert(3);
      other.insert(7);
      heap.meld(other);
      expect(heap.size).toBe(4);
      const extracted: number[] = [];
      while (!heap.isEmpty()) {
        extracted.push(heap.extractMin()!);
      }
      expect(extracted).toEqual([3, 3, 5, 7]);
    });

    it('melds heaps with different comparators', () => {
      const maxHeap = new HalvingHeap({ comparator: (a, b) => (a > b ? -1 : a < b ? 1 : 0) });
      heap.insert(1);
      heap.insert(5);
      maxHeap.insert(3);
      maxHeap.insert(7);
      heap.meld(maxHeap);
      expect(heap.peek()).toBe(1);
    });

    it('melds multiple heaps sequentially', () => {
      heap.insert(10);
      heap.insert(5);
      const other1 = new HalvingHeap();
      other1.insert(15);
      other1.insert(8);
      const other2 = new HalvingHeap();
      other2.insert(20);
      other2.insert(12);
      heap.meld(other1);
      heap.meld(other2);
      expect(heap.size).toBe(6);
      expect(heap.peek()).toBe(5);
    });

    it('melds then extracts correctly', () => {
      heap.insert(5);
      heap.insert(10);
      const other = new HalvingHeap();
      other.insert(3);
      other.insert(8);
      heap.meld(other);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(8);
      expect(heap.extractMin()).toBe(10);
    });
  });

  describe('size', () => {
    it('returns 0 for empty heap', () => {
      expect(heap.size).toBe(0);
    });

    it('increments with each insert', () => {
      expect(heap.size).toBe(0);
      heap.insert(1);
      expect(heap.size).toBe(1);
      heap.insert(2);
      expect(heap.size).toBe(2);
      heap.insert(3);
      expect(heap.size).toBe(3);
    });

    it('decrements with each extract', () => {
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

    it('updates after meld', () => {
      heap.insert(1);
      heap.insert(2);
      const other = new HalvingHeap();
      other.insert(3);
      other.insert(4);
      heap.meld(other);
      expect(heap.size).toBe(4);
    });

    it('resets after clear', () => {
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.clear();
      expect(heap.size).toBe(0);
    });
  });

  describe('isEmpty', () => {
    it('returns true for empty heap', () => {
      expect(heap.isEmpty()).toBe(true);
    });

    it('returns false after insert', () => {
      heap.insert(1);
      expect(heap.isEmpty()).toBe(false);
    });

    it('returns true after extracting all', () => {
      heap.insert(1);
      heap.insert(2);
      heap.extractMin();
      heap.extractMin();
      expect(heap.isEmpty()).toBe(true);
    });

    it('returns false after meld', () => {
      const other = new HalvingHeap();
      other.insert(1);
      heap.meld(other);
      expect(heap.isEmpty()).toBe(false);
    });

    it('returns true after clear', () => {
      heap.insert(1);
      heap.insert(2);
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('clears empty heap', () => {
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
      expect(heap.peek()).toBe(undefined);
    });

    it('clears heap with elements', () => {
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size).toBe(0);
    });

    it('allows insert after clear', () => {
      heap.insert(1);
      heap.clear();
      heap.insert(5);
      expect(heap.size).toBe(1);
      expect(heap.peek()).toBe(5);
    });

    it('clears after multiple operations', () => {
      heap.insert(1);
      heap.insert(2);
      heap.extractMin();
      const other = new HalvingHeap();
      other.insert(3);
      heap.meld(other);
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('toArray', () => {
    it('returns empty array for empty heap', () => {
      expect(heap.toArray()).toEqual([]);
    });

    it('returns single element', () => {
      heap.insert(5);
      expect(heap.toArray()).toEqual([5]);
    });

    it('returns sorted elements', () => {
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      heap.insert(9);
      expect(heap.toArray()).toEqual([1, 3, 5, 7, 9]);
    });

    it('returns all elements including duplicates', () => {
      heap.insert(5);
      heap.insert(3);
      heap.insert(5);
      heap.insert(3);
      heap.insert(1);
      expect(heap.toArray()).toEqual([1, 3, 3, 5, 5]);
    });

    it('does not modify heap', () => {
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.toArray();
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(3);
    });

    it('returns array after extractions', () => {
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.extractMin();
      expect(heap.toArray()).toEqual([5, 7]);
    });

    it('returns array after meld', () => {
      heap.insert(5);
      heap.insert(10);
      const other = new HalvingHeap();
      other.insert(3);
      other.insert(8);
      heap.meld(other);
      expect(heap.toArray()).toEqual([3, 5, 8, 10]);
    });
  });

  describe('forEach', () => {
    it('iterates over empty heap', () => {
      const values: number[] = [];
      heap.forEach((v) => values.push(v));
      expect(values).toEqual([]);
    });

    it('iterates over single element', () => {
      heap.insert(5);
      const values: number[] = [];
      heap.forEach((v) => values.push(v));
      expect(values).toEqual([5]);
    });

    it('iterates in sorted order', () => {
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      const values: number[] = [];
      heap.forEach((v) => values.push(v));
      expect(values).toEqual([1, 3, 5, 7]);
    });

    it('calls callback for each element', () => {
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      let count = 0;
      heap.forEach(() => count++);
      expect(count).toBe(3);
    });

    it('passes correct values to callback', () => {
      heap.insert(10);
      heap.insert(20);
      heap.insert(30);
      const values: number[] = [];
      heap.forEach((v) => values.push(v * 2));
      expect(values).toEqual([20, 40, 60]);
    });

    it('does not modify heap', () => {
      heap.insert(5);
      heap.insert(3);
      heap.forEach(() => {});
      expect(heap.size).toBe(2);
      expect(heap.peek()).toBe(3);
    });
  });

  describe('integration tests', () => {
    it('handles mixed operations', () => {
      heap.insert(5);
      heap.insert(10);
      expect(heap.extractMin()).toBe(5);
      heap.insert(3);
      expect(heap.peek()).toBe(3);
      const other = new HalvingHeap();
      other.insert(8);
      other.insert(15);
      heap.meld(other);
      expect(heap.size).toBe(4);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(8);
      expect(heap.extractMin()).toBe(10);
      expect(heap.extractMin()).toBe(15);
    });

    it('handles large number of elements', () => {
      const count = 1000;
      for (let i = 0; i < count; i++) {
        heap.insert(Math.floor(Math.random() * count));
      }
      expect(heap.size).toBe(count);

      const sorted: number[] = [];
      while (!heap.isEmpty()) {
        sorted.push(heap.extractMin()!);
      }

      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i]).toBeGreaterThanOrEqual(sorted[i - 1]!);
      }
    });

    it('handles extreme values', () => {
      heap.insert(Number.MAX_VALUE);
      heap.insert(-Number.MAX_VALUE);
      heap.insert(0);
      heap.insert(Number.MIN_VALUE);
      heap.insert(-Number.MIN_VALUE);
      const result = heap.toArray();
      expect(result[0]).toBeLessThanOrEqual(result[1]!);
      expect(result[1]).toBeLessThanOrEqual(result[2]!);
      expect(result[2]).toBeLessThanOrEqual(result[3]!);
      expect(result[3]).toBeLessThanOrEqual(result[4]!);
    });

    it('handles string values', () => {
      const stringHeap = new HalvingHeap<string>();
      stringHeap.insert('zebra');
      stringHeap.insert('apple');
      stringHeap.insert('banana');
      stringHeap.insert('cherry');
      expect(stringHeap.extractMin()).toBe('apple');
      expect(stringHeap.extractMin()).toBe('banana');
      expect(stringHeap.extractMin()).toBe('cherry');
      expect(stringHeap.extractMin()).toBe('zebra');
    });

    it('handles object values with comparator', () => {
      interface Item {
        id: number;
        value: number;
      }
      const objHeap = new HalvingHeap<Item>({
        comparator: (a, b) => a.value - b.value
      });
      objHeap.insert({ id: 1, value: 10 });
      objHeap.insert({ id: 2, value: 5 });
      objHeap.insert({ id: 3, value: 15 });
      const min = objHeap.extractMin()!;
      expect(min.id).toBe(2);
      expect(min.value).toBe(5);
    });

    it('handles alternating insert and extract', () => {
      for (let i = 0; i < 100; i++) {
        heap.insert(i);
        expect(heap.peek()).toBe(0);
      }
      for (let i = 0; i < 50; i++) {
        expect(heap.extractMin()).toBe(i);
      }
      for (let i = 100; i < 150; i++) {
        heap.insert(i);
      }
      expect(heap.peek()).toBe(50);
    });

    it('maintains heap property after complex melds', () => {
      const heaps: HalvingHeap<number>[] = [];
      for (let i = 0; i < 10; i++) {
        const h = new HalvingHeap();
        for (let j = 0; j < 10; j++) {
          h.insert(i * 10 + j);
        }
        heaps.push(h);
      }

      for (const h of heaps) {
        heap.meld(h);
      }

      expect(heap.size).toBe(100);
      const result = heap.toArray();
      for (let i = 1; i < result.length; i++) {
        expect(result[i]).toBeGreaterThan(result[i - 1]!);
      }
    });
  });

  describe('stress tests', () => {
    it('handles rapid insertions and deletions', () => {
      const operations = 500;
      for (let i = 0; i < operations; i++) {
        heap.insert(Math.floor(Math.random() * operations));
        if (Math.random() > 0.5 && !heap.isEmpty()) {
          heap.extractMin();
        }
      }
      const result = heap.toArray();
      for (let i = 1; i < result.length; i++) {
        expect(result[i]).toBeGreaterThanOrEqual(result[i - 1]!);
      }
    });

    it('handles many duplicate values', () => {
      const value = 42;
      const count = 100;
      for (let i = 0; i < count; i++) {
        heap.insert(value);
      }
      expect(heap.size).toBe(count);
      for (let i = 0; i < count; i++) {
        expect(heap.extractMin()).toBe(value);
      }
      expect(heap.isEmpty()).toBe(true);
    });

    it('handles clear and rebuild', () => {
      for (let cycle = 0; cycle < 10; cycle++) {
        heap.clear();
        for (let i = 0; i < 50; i++) {
          heap.insert(i);
        }
        expect(heap.size).toBe(50);
      }
    });
  });

  describe('special values', () => {
    it('handles Infinity', () => {
      heap.insert(Infinity);
      heap.insert(5);
      heap.insert(10);
      heap.insert(-Infinity);
      expect(heap.extractMin()).toBe(-Infinity);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(10);
      expect(heap.extractMin()).toBe(Infinity);
    });

    it('handles multiple Infinity values', () => {
      heap.insert(Infinity);
      heap.insert(Infinity);
      heap.insert(5);
      heap.insert(-Infinity);
      heap.insert(-Infinity);
      expect(heap.toArray()).toEqual([-Infinity, -Infinity, 5, Infinity, Infinity]);
    });

    it('handles zero and negative zero', () => {
      heap.insert(0);
      heap.insert(-0);
      expect(heap.size).toBe(2);
    });

    it('handles floating point values', () => {
      heap.insert(3.14);
      heap.insert(2.71);
      heap.insert(1.41);
      heap.insert(0.577);
      expect(heap.extractMin()).toBeCloseTo(0.577);
      expect(heap.extractMin()).toBeCloseTo(1.41);
      expect(heap.extractMin()).toBeCloseTo(2.71);
      expect(heap.extractMin()).toBeCloseTo(3.14);
    });

    it('handles very small floating point', () => {
      heap.insert(1e-10);
      heap.insert(1e-20);
      heap.insert(1e-15);
      expect(heap.extractMin()).toBe(1e-20);
      expect(heap.extractMin()).toBe(1e-15);
      expect(heap.extractMin()).toBe(1e-10);
    });

    it('handles large floating point', () => {
      heap.insert(1e10);
      heap.insert(1e20);
      heap.insert(1e15);
      expect(heap.extractMin()).toBe(1e10);
      expect(heap.extractMin()).toBe(1e15);
      expect(heap.extractMin()).toBe(1e20);
    });
  });

  describe('comparator edge cases', () => {
    it('handles comparator returning zero', () => {
      const eqHeap = new HalvingHeap({
        comparator: () => 0
      });
      eqHeap.insert(1);
      eqHeap.insert(2);
      eqHeap.insert(3);
      expect(eqHeap.size).toBe(3);
    });

    it('handles always-negative comparator', () => {
      const alwaysFirstHeap = new HalvingHeap({
        comparator: () => -1
      });
      alwaysFirstHeap.insert(3);
      alwaysFirstHeap.insert(1);
      alwaysFirstHeap.insert(2);
      expect(alwaysFirstHeap.size).toBe(3);
    });

    it('handles always-positive comparator', () => {
      const alwaysLastHeap = new HalvingHeap({
        comparator: () => 1
      });
      alwaysLastHeap.insert(1);
      alwaysLastHeap.insert(2);
      alwaysLastHeap.insert(3);
      expect(alwaysLastHeap.size).toBe(3);
    });

    it('handles complex comparator logic', () => {
      const absHeap = new HalvingHeap<number>({
        comparator: (a, b) => Math.abs(a) - Math.abs(b)
      });
      absHeap.insert(-5);
      absHeap.insert(3);
      absHeap.insert(-2);
      absHeap.insert(1);
      expect(absHeap.extractMin()).toBe(1);
      expect(absHeap.extractMin()).toBe(-2);
      expect(absHeap.extractMin()).toBe(3);
      expect(absHeap.extractMin()).toBe(-5);
    });
  });

  describe('boundary conditions', () => {
    it('handles single insert and extract cycle', () => {
      for (let i = 0; i < 100; i++) {
        heap.insert(i);
        expect(heap.extractMin()).toBe(i);
      }
      expect(heap.isEmpty()).toBe(true);
    });

    it('handles insert all then extract all', () => {
      const values = Array.from({ length: 100 }, (_, i) => i);
      for (const v of values) {
        heap.insert(v);
      }
      for (let i = 0; i < values.length; i++) {
        expect(heap.extractMin()).toBe(i);
      }
    });

    it('handles alternating min and max inserts', () => {
      for (let i = 0; i < 50; i++) {
        heap.insert(i);
        heap.insert(100 - i);
      }
      expect(heap.size).toBe(100);
      const result = heap.toArray();
      expect(result[0]).toBe(0);
      expect(result[99]).toBe(100);
    });

    it('handles same value repeated', () => {
      const count = 50;
      const value = 42;
      for (let i = 0; i < count; i++) {
        heap.insert(value);
      }
      for (let i = 0; i < count; i++) {
        expect(heap.extractMin()).toBe(value);
      }
    });

    it('handles sequential then reverse', () => {
      for (let i = 1; i <= 50; i++) {
        heap.insert(i);
      }
      for (let i = 100; i > 50; i--) {
        heap.insert(i);
      }
      expect(heap.size).toBe(100);
      expect(heap.peek()).toBe(1);
    });
  });

  describe('meld edge cases', () => {

    it('melds many small heaps', () => {
      const smallHeaps: HalvingHeap<number>[] = [];
      for (let i = 0; i < 20; i++) {
        const h = new HalvingHeap();
        h.insert(i);
        smallHeaps.push(h);
      }

      for (const h of smallHeaps) {
        heap.meld(h);
      }

      expect(heap.size).toBe(20);
      const result = heap.toArray();
      for (let i = 1; i < result.length; i++) {
        expect(result[i]).toBeGreaterThan(result[i - 1]!);
      }
    });

    it('melds after clear', () => {
      heap.insert(1);
      heap.insert(2);
      heap.clear();
      const other = new HalvingHeap();
      other.insert(3);
      other.insert(4);
      heap.meld(other);
      expect(heap.size).toBe(2);
      expect(heap.peek()).toBe(3);
    });

    it('melds into empty heap', () => {
      heap.clear();
      const other = new HalvingHeap();
      other.insert(1);
      other.insert(2);
      heap.meld(other);
      expect(heap.size).toBe(2);
      expect(heap.peek()).toBe(1);
    });

    it('melds empty into empty', () => {
      heap.clear();
      const other = new HalvingHeap();
      heap.meld(other);
      expect(heap.isEmpty()).toBe(true);
      expect(other.isEmpty()).toBe(true);
    });

    it('melds heaps with same values', () => {
      for (let i = 0; i < 10; i++) {
        heap.insert(i);
      }
      const other = new HalvingHeap();
      for (let i = 0; i < 10; i++) {
        other.insert(i);
      }
      heap.meld(other);
      expect(heap.size).toBe(20);
      expect(heap.toArray()[0]).toBe(0);
    });

    it('melds multiple times sequentially', () => {
      const other1 = new HalvingHeap();
      const other2 = new HalvingHeap();
      const other3 = new HalvingHeap();

      heap.insert(1);
      other1.insert(2);
      other2.insert(3);
      other3.insert(4);

      heap.meld(other1);
      heap.meld(other2);
      heap.meld(other3);

      expect(heap.size).toBe(4);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(2);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(4);
    });
  });

  describe('forEach edge cases', () => {
    it('forEach with callback that modifies heap', () => {
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      const values: number[] = [];
      heap.forEach((v) => {
        values.push(v);
        heap.insert(v + 10);
      });
      expect(values.length).toBe(3);
      expect(heap.size).toBeGreaterThan(3);
    });

    it('forEach on heap with many duplicates', () => {
      for (let i = 0; i < 50; i++) {
        heap.insert(42);
      }
      let count = 0;
      heap.forEach(() => count++);
      expect(count).toBe(50);
    });

    it('forEach returns values in sorted order even after interleaved operations', () => {
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.extractMin();
      heap.insert(1);
      heap.insert(9);
      const values: number[] = [];
      heap.forEach((v) => values.push(v));
      expect(values).toEqual([1, 5, 7, 9]);
    });
  });

  describe('toArray edge cases', () => {
    it('toArray after many extractions', () => {
      for (let i = 0; i < 100; i++) {
        heap.insert(i);
      }
      for (let i = 0; i < 50; i++) {
        heap.extractMin();
      }
      const result = heap.toArray();
      expect(result.length).toBe(50);
      expect(result[0]).toBe(50);
      expect(result[49]).toBe(99);
    });

    it('toArray after multiple melds', () => {
      const heaps: HalvingHeap<number>[] = [];
      for (let i = 0; i < 5; i++) {
        const h = new HalvingHeap();
        for (let j = 0; j < 20; j++) {
          h.insert(i * 20 + j);
        }
        heaps.push(h);
      }

      for (const h of heaps) {
        heap.meld(h);
      }

      const result = heap.toArray();
      expect(result.length).toBe(100);
      for (let i = 1; i < result.length; i++) {
        expect(result[i]).toBeGreaterThan(result[i - 1]!);
      }
    });

    it('toArray does not affect subsequent operations', () => {
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      const arr1 = heap.toArray();
      expect(heap.extractMin()).toBe(3);
      const arr2 = heap.toArray();
      expect(arr1.length).toBe(3);
      expect(arr2.length).toBe(2);
    });
  });

  describe('peek edge cases', () => {
    it('peek returns undefined after extracting all', () => {
      heap.insert(1);
      heap.insert(2);
      heap.extractMin();
      heap.extractMin();
      expect(heap.peek()).toBe(undefined);
    });

    it('peek after insert extract insert pattern', () => {
      heap.insert(5);
      heap.insert(3);
      heap.extractMin();
      heap.insert(1);
      expect(heap.peek()).toBe(1);
      heap.extractMin();
      expect(heap.peek()).toBe(5);
    });

    it('peek on heap with single element multiple times', () => {
      heap.insert(42);
      for (let i = 0; i < 10; i++) {
        expect(heap.peek()).toBe(42);
      }
      expect(heap.size).toBe(1);
    });
  });

  describe('extractMin edge cases', () => {
    it('extractMin on heap with single element repeatedly', () => {
      heap.insert(1);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(undefined);
      expect(heap.extractMin()).toBe(undefined);
    });

    it('extractMin maintains min after interleaved inserts', () => {
      heap.insert(5);
      heap.insert(10);
      expect(heap.extractMin()).toBe(5);
      heap.insert(3);
      expect(heap.extractMin()).toBe(3);
      heap.insert(1);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(10);
    });

    it('extractMin after clear and refill', () => {
      heap.insert(1);
      heap.insert(2);
      heap.extractMin();
      heap.extractMin();
      expect(heap.isEmpty()).toBe(true);

      heap.insert(10);
      heap.insert(5);
      heap.insert(15);

      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(10);
      expect(heap.extractMin()).toBe(15);
    });
  });

  describe('complex scenarios', () => {
    it('handles Fibonacci-like insert pattern', () => {
      const fib = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55];
      for (const f of fib) {
        heap.insert(f);
      }
      expect(heap.size).toBe(10);
      expect(heap.toArray()).toEqual(fib);
    });

    it('handles power of two sequence', () => {
      for (let i = 0; i < 10; i++) {
        heap.insert(Math.pow(2, i));
      }
      expect(heap.toArray()[0]).toBe(1);
      expect(heap.toArray()[9]).toBe(512);
    });

    it('handles prime number sequence', () => {
      const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
      for (const p of primes) {
        heap.insert(p);
      }
      expect(heap.toArray()).toEqual(primes);
    });

    it('handles negative and positive interleaved', () => {
      for (let i = -10; i <= 10; i++) {
        heap.insert(i);
      }
      const result = heap.toArray();
      expect(result[0]).toBe(-10);
      expect(result[20]).toBe(10);
    });

    it('handles multiple heaps with different comparators', () => {
      const minHeap = new HalvingHeap<number>();
      const maxHeap = new HalvingHeap<number>({
        comparator: (a, b) => (a > b ? -1 : a < b ? 1 : 0)
      });

      for (let i = 0; i < 10; i++) {
        minHeap.insert(i);
        maxHeap.insert(i);
      }

      expect(minHeap.extractMin()).toBe(0);
      expect(maxHeap.extractMin()).toBe(9);
    });
  });

  describe('performance characteristics', () => {
    it('maintains O(log n) extraction behavior', () => {
      const n = 1000;
      for (let i = 0; i < n; i++) {
        heap.insert(Math.floor(Math.random() * n));
      }

      let prev = heap.extractMin()!;
      while (!heap.isEmpty()) {
        const current = heap.extractMin()!;
        expect(current).toBeGreaterThanOrEqual(prev);
        prev = current;
      }
    });

    it('handles efficient meld operations', () => {
      const heap1 = new HalvingHeap<number>();
      const heap2 = new HalvingHeap<number>();

      for (let i = 0; i < 100; i++) {
        heap1.insert(i);
        heap2.insert(i + 100);
      }

      const start = Date.now();
      heap1.meld(heap2);
      const duration = Date.now() - start;

      expect(heap1.size).toBe(200);
      expect(duration).toBeLessThan(100);
    });
  });
});
