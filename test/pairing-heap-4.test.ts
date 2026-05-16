import { describe, it, expect } from 'vitest';
import { PairingHeap4 } from '../src/core/pairing-heap-4/index.js';

describe('PairingHeap4', () => {
  describe('empty heap', () => {
    it('should return undefined from extractMin on empty heap', () => {
      const heap = new PairingHeap4<number>();
      expect(heap.extractMin()).toBeUndefined();
    });

    it('should return undefined from findMin on empty heap', () => {
      const heap = new PairingHeap4<number>();
      expect(heap.findMin()).toBeUndefined();
    });

    it('should have size 0 on empty heap', () => {
      const heap = new PairingHeap4<number>();
      expect(heap.size).toBe(0);
    });

    it('should return true from isEmpty on empty heap', () => {
      const heap = new PairingHeap4<number>();
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('insert', () => {
    it('should insert a single element', () => {
      const heap = new PairingHeap4<number>();
      heap.insert(5);
      expect(heap.size).toBe(1);
      expect(heap.isEmpty()).toBe(false);
    });

    it('should find min after single insert', () => {
      const heap = new PairingHeap4<number>();
      heap.insert(5);
      expect(heap.findMin()).toBe(5);
    });

    it('should extract min after single insert', () => {
      const heap = new PairingHeap4<number>();
      heap.insert(5);
      expect(heap.extractMin()).toBe(5);
      expect(heap.size).toBe(0);
    });

    it('should track size correctly with multiple inserts', () => {
      const heap = new PairingHeap4<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.size).toBe(3);
    });

    it('should find min after multiple inserts', () => {
      const heap = new PairingHeap4<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.findMin()).toBe(3);
    });

    it('should insert in any order and maintain min', () => {
      const heap = new PairingHeap4<number>();
      heap.insert(7);
      heap.insert(5);
      heap.insert(3);
      expect(heap.findMin()).toBe(3);
    });
  });

  describe('extractMin', () => {
    it('should extract min in order from sorted inserts', () => {
      const heap = new PairingHeap4<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(2);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBeUndefined();
    });

    it('should extract min in order from reverse sorted inserts', () => {
      const heap = new PairingHeap4<number>();
      heap.insert(3);
      heap.insert(2);
      heap.insert(1);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(2);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBeUndefined();
    });

    it('should extract min in order from random inserts', () => {
      const heap = new PairingHeap4<number>();
      heap.insert(5);
      heap.insert(1);
      heap.insert(3);
      heap.insert(4);
      heap.insert(2);
      const extracted: number[] = [];
      while (!heap.isEmpty()) {
        const val = heap.extractMin();
        if (val !== undefined) {
          extracted.push(val);
        }
      }
      expect(extracted).toEqual([1, 2, 3, 4, 5]);
    });

    it('should extract all elements returns sorted', () => {
      const heap = new PairingHeap4<number>();
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
      const extracted: number[] = [];
      while (!heap.isEmpty()) {
        const val = heap.extractMin();
        if (val !== undefined) {
          extracted.push(val);
        }
      }
      expect(extracted).toEqual([1, 1, 2, 3, 3, 4, 5, 5, 5, 6, 9]);
    });

    it('should handle many elements (1000+)', () => {
      const heap = new PairingHeap4<number>();
      const count = 1000;
      for (let i = 0; i < count; i++) {
        heap.insert(Math.floor(Math.random() * count));
      }
      let prev = -1;
      let extracted = 0;
      while (!heap.isEmpty()) {
        const val = heap.extractMin();
        if (val !== undefined) {
          expect(val).toBeGreaterThanOrEqual(prev);
          prev = val;
          extracted++;
        }
      }
      expect(extracted).toBe(count);
    });
  });

  describe('findMin', () => {
    it('should return min without removing', () => {
      const heap = new PairingHeap4<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.findMin()).toBe(3);
      expect(heap.size).toBe(3);
    });

    it('should update min after extracting', () => {
      const heap = new PairingHeap4<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.extractMin();
      expect(heap.findMin()).toBe(5);
    });

    it('should return undefined on empty heap', () => {
      const heap = new PairingHeap4<number>();
      expect(heap.findMin()).toBeUndefined();
    });
  });

  describe('size and isEmpty', () => {
    it('should track size correctly', () => {
      const heap = new PairingHeap4<number>();
      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);

      heap.insert(1);
      expect(heap.size).toBe(1);
      expect(heap.isEmpty()).toBe(false);

      heap.insert(2);
      heap.insert(3);
      expect(heap.size).toBe(3);

      heap.extractMin();
      expect(heap.size).toBe(2);
      expect(heap.isEmpty()).toBe(false);

      heap.extractMin();
      heap.extractMin();
      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear all elements', () => {
      const heap = new PairingHeap4<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.clear();
      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);
      expect(heap.findMin()).toBeUndefined();
      expect(heap.extractMin()).toBeUndefined();
    });

    it('should clear empty heap', () => {
      const heap = new PairingHeap4<number>();
      heap.clear();
      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty heap', () => {
      const heap = new PairingHeap4<number>();
      expect(heap.toArray()).toEqual([]);
    });

    it('should return sorted array from single element', () => {
      const heap = new PairingHeap4<number>();
      heap.insert(5);
      expect(heap.toArray()).toEqual([5]);
    });

    it('should return sorted array from multiple elements', () => {
      const heap = new PairingHeap4<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      heap.insert(9);
      heap.insert(2);
      expect(heap.toArray()).toEqual([1, 2, 3, 5, 7, 9]);
    });

    it('should not modify original heap', () => {
      const heap = new PairingHeap4<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.toArray();
      expect(heap.size).toBe(3);
      expect(heap.findMin()).toBe(3);
    });

    it('should handle duplicate values', () => {
      const heap = new PairingHeap4<number>();
      heap.insert(3);
      heap.insert(1);
      heap.insert(4);
      heap.insert(1);
      heap.insert(5);
      expect(heap.toArray()).toEqual([1, 1, 3, 4, 5]);
    });
  });

  describe('fromArray', () => {
    it('should create empty heap from empty array', () => {
      const heap = PairingHeap4.fromArray<number>([]);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should create heap from single element array', () => {
      const heap = PairingHeap4.fromArray<number>([5]);
      expect(heap.size).toBe(1);
      expect(heap.findMin()).toBe(5);
    });

    it('should create heap with correct min', () => {
      const heap = PairingHeap4.fromArray<number>([5, 3, 7, 1, 9, 2]);
      expect(heap.size).toBe(6);
      expect(heap.findMin()).toBe(1);
    });

    it('should extract sorted from created heap', () => {
      const heap = PairingHeap4.fromArray<number>([5, 3, 7, 1, 9, 2]);
      const extracted: number[] = [];
      while (!heap.isEmpty()) {
        const val = heap.extractMin();
        if (val !== undefined) {
          extracted.push(val);
        }
      }
      expect(extracted).toEqual([1, 2, 3, 5, 7, 9]);
    });

    it('should accept custom comparator', () => {
      const heap = PairingHeap4.fromArray<number>([5, 3, 7, 1, 9, 2], (a: number, b: number) => (a > b ? -1 : a < b ? 1 : 0));
      expect(heap.findMin()).toBe(9);
    });
  });

  describe('merge', () => {
    it('should merge empty heap into empty heap', () => {
      const heap1 = new PairingHeap4<number>();
      const heap2 = new PairingHeap4<number>();
      heap1.merge(heap2);
      expect(heap1.size).toBe(0);
      expect(heap1.isEmpty()).toBe(true);
      expect(heap2.isEmpty()).toBe(true);
    });

    it('should merge empty heap into non-empty heap', () => {
      const heap1 = new PairingHeap4<number>();
      const heap2 = new PairingHeap4<number>();
      heap1.insert(5);
      heap1.merge(heap2);
      expect(heap1.size).toBe(1);
      expect(heap1.findMin()).toBe(5);
      expect(heap2.isEmpty()).toBe(true);
    });

    it('should merge non-empty heap into empty heap', () => {
      const heap1 = new PairingHeap4<number>();
      const heap2 = new PairingHeap4<number>();
      heap2.insert(5);
      heap1.merge(heap2);
      expect(heap1.size).toBe(1);
      expect(heap1.findMin()).toBe(5);
      expect(heap2.isEmpty()).toBe(true);
    });

    it('should merge two non-empty heaps', () => {
      const heap1 = new PairingHeap4<number>();
      const heap2 = new PairingHeap4<number>();
      heap1.insert(5);
      heap1.insert(3);
      heap2.insert(7);
      heap2.insert(1);
      heap1.merge(heap2);
      expect(heap1.size).toBe(4);
      expect(heap1.findMin()).toBe(1);
      expect(heap2.isEmpty()).toBe(true);
    });

    it('should extract sorted from merged heap', () => {
      const heap1 = new PairingHeap4<number>();
      const heap2 = new PairingHeap4<number>();
      heap1.insert(5);
      heap1.insert(9);
      heap2.insert(7);
      heap2.insert(1);
      heap2.insert(3);
      heap1.merge(heap2);
      const extracted: number[] = [];
      while (!heap1.isEmpty()) {
        const val = heap1.extractMin();
        if (val !== undefined) {
          extracted.push(val);
        }
      }
      expect(extracted).toEqual([1, 3, 5, 7, 9]);
    });
  });

  describe('custom comparator (max-heap)', () => {
    it('should use max-heap comparator', () => {
      const heap = new PairingHeap4<number>((a: number, b: number) => (a > b ? -1 : a < b ? 1 : 0));
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.findMin()).toBe(7);
    });

    it('should extract in descending order', () => {
      const heap = new PairingHeap4<number>((a: number, b: number) => (a > b ? -1 : a < b ? 1 : 0));
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      expect(heap.extractMin()).toBe(7);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(1);
    });

    it('should work with fromArray', () => {
      const heap = PairingHeap4.fromArray<number>([5, 3, 7, 1, 9, 2], (a: number, b: number) => (a > b ? -1 : a < b ? 1 : 0));
      expect(heap.findMin()).toBe(9);
    });

    it('should merge max-heaps', () => {
      const heap1 = new PairingHeap4<number>((a: number, b: number) => (a > b ? -1 : a < b ? 1 : 0));
      const heap2 = new PairingHeap4<number>((a: number, b: number) => (a > b ? -1 : a < b ? 1 : 0));
      heap1.insert(5);
      heap1.insert(9);
      heap2.insert(7);
      heap2.insert(1);
      heap1.merge(heap2);
      expect(heap1.findMin()).toBe(9);
    });

    it('should handle delete', () => {
      const heap = new PairingHeap4<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.size).toBe(3);
      expect(heap.extractMin()).toBe(3);
      expect(heap.size).toBe(2);
    });
  });

  it('should handle clear', () => {
    const heap = new PairingHeap4<number>();
    heap.insert(5);
    heap.insert(3);
    heap.clear();
    expect(heap.isEmpty()).toBe(true);
  });
  it('should handle findMin', () => {
    const heap = new PairingHeap4<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(7);
    expect(heap.findMin()).toBe(3);
  });
  it('should handle merge into empty', () => {
    const heap1 = new PairingHeap4<number>();
    heap1.insert(5);
    const heap2 = new PairingHeap4<number>();
    heap2.insert(3);
    heap1.merge(heap2);
    expect(heap1.findMin()).toBe(3);
  });
});
