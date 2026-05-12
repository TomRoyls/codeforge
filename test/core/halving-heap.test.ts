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
});
