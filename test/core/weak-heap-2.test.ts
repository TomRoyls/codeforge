import { describe, it, expect, beforeEach } from 'vitest';
import { WeakHeap2 } from '../../src/core/weak-heap-2/index.js';

describe('WeakHeap2', () => {
  let heap: WeakHeap2<number>;

  beforeEach(() => {
    heap = new WeakHeap2<number>();
  });

  describe('constructor', () => {
    it('should create empty heap', () => {
      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should use default comparator', () => {
      heap.insert(5);
      heap.insert(3);
      expect(heap.peek()).toBe(3);
    });

    it('should accept custom comparator', () => {
      const maxHeap = new WeakHeap2<number>((a, b) => b - a);
      maxHeap.insert(5);
      maxHeap.insert(3);
      expect(maxHeap.peek()).toBe(5);
    });

    it('should accept capacity option', () => {
      heap = new WeakHeap2<number>(undefined, { capacity: 10 });
      heap.insert(1);
      expect(heap.size).toBe(1);
    });
  });

  describe('insert', () => {
    it('should insert single element', () => {
      const node = heap.insert(5);
      expect(heap.size).toBe(1);
      expect(heap.peek()).toBe(5);
      expect(node.value).toBe(5);
    });

    it('should insert multiple elements', () => {
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(3);
    });

    it('should maintain min at root', () => {
      heap.insert(10);
      heap.insert(5);
      heap.insert(15);
      heap.insert(3);
      heap.insert(8);
      expect(heap.peek()).toBe(3);
    });

    it('should handle duplicate values', () => {
      heap.insert(5);
      heap.insert(5);
      heap.insert(5);
      expect(heap.size).toBe(3);
    });

    it('should handle negative numbers', () => {
      heap.insert(-5);
      heap.insert(3);
      heap.insert(-10);
      expect(heap.peek()).toBe(-10);
    });

    it('should handle zero', () => {
      heap.insert(0);
      heap.insert(5);
      expect(heap.peek()).toBe(0);
    });

    it('should handle large numbers', () => {
      heap.insert(Number.MAX_SAFE_INTEGER);
      heap.insert(Number.MIN_SAFE_INTEGER);
      expect(heap.peek()).toBe(Number.MIN_SAFE_INTEGER);
    });

    it('should return node with index', () => {
      const node1 = heap.insert(5);
      const node2 = heap.insert(3);
      expect(node1.index).toBe(0);
      expect(node2.index).toBe(1);
    });

    it('should assign unique id to each node', () => {
      const node1 = heap.insert(5);
      const node2 = heap.insert(3);
      const node3 = heap.insert(7);
      expect(node1.id).not.toBe(node2.id);
      expect(node2.id).not.toBe(node3.id);
      expect(node3.id).not.toBe(node1.id);
    });

    it('should handle strings with default comparator', () => {
      const stringHeap = new WeakHeap2<string>();
      stringHeap.insert('zebra');
      stringHeap.insert('apple');
      stringHeap.insert('banana');
      expect(stringHeap.peek()).toBe('apple');
    });

    it('should handle objects with custom comparator', () => {
      interface Obj { x: number; }
      const objHeap = new WeakHeap2<Obj>((a, b) => a.x - b.x);
      objHeap.insert({ x: 5 });
      objHeap.insert({ x: 3 });
      objHeap.insert({ x: 7 });
      expect(objHeap.peek()!.x).toBe(3);
    });

    it('should auto-resize when capacity exceeded', () => {
      heap = new WeakHeap2<number>(undefined, { capacity: 2 });
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(1);
    });
  });

  describe('extractMin', () => {
    it('should return undefined from empty heap', () => {
      expect(heap.extractMin()).toBe(undefined);
    });

    it('should extract single element', () => {
      heap.insert(5);
      const min = heap.extractMin();
      expect(min).toBe(5);
      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should extract elements in sorted order', () => {
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      heap.insert(9);

      const result: number[] = [];
      while (!heap.isEmpty()) {
        result.push(heap.extractMin()!);
      }
      expect(result).toEqual([1, 3, 5, 7, 9]);
    });

    it('should maintain heap property after extraction', () => {
      heap.insert(10);
      heap.insert(5);
      heap.insert(15);
      heap.insert(3);
      heap.insert(8);

      const first = heap.extractMin();
      expect(first).toBe(3);
      expect(heap.peek()).toBe(5);

      const second = heap.extractMin();
      expect(second).toBe(5);
      expect(heap.peek()).toBe(8);
    });

    it('should handle duplicates', () => {
      heap.insert(5);
      heap.insert(3);
      heap.insert(5);
      heap.insert(3);

      const result: number[] = [];
      while (!heap.isEmpty()) {
        result.push(heap.extractMin()!);
      }
      expect(result).toEqual([3, 3, 5, 5]);
    });

    it('should remove node from map', () => {
      const node = heap.insert(5);
      heap.extractMin();
      heap.insert(3);
      expect(heap.size).toBe(1);
    });
  });

  describe('peek', () => {
    it('should return undefined from empty heap', () => {
      expect(heap.peek()).toBe(undefined);
    });

    it('should return min without removing', () => {
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);

      expect(heap.peek()).toBe(3);
      expect(heap.size).toBe(3);
    });

    it('should return same value on multiple calls', () => {
      heap.insert(5);
      heap.insert(3);

      expect(heap.peek()).toBe(3);
      expect(heap.peek()).toBe(3);
      expect(heap.peek()).toBe(3);
    });
  });

  describe('decreaseKey', () => {
    it('should decrease value of node', () => {
      const node = heap.insert(10);
      heap.insert(5);
      heap.insert(15);

      heap.decreaseKey(node, 3);
      expect(heap.peek()).toBe(3);
    });

    it('should not increase value', () => {
      const node = heap.insert(5);
      heap.insert(3);

      heap.decreaseKey(node, 10);
      expect(heap.peek()).toBe(3);
    });

    it('should not change value if same', () => {
      const node = heap.insert(5);
      heap.insert(3);

      heap.decreaseKey(node, 5);
      expect(heap.size).toBe(2);
    });

    it('should handle negative values', () => {
      const node = heap.insert(5);
      heap.insert(3);

      heap.decreaseKey(node, -10);
      expect(heap.peek()).toBe(-10);
    });

    it('should work with objects', () => {
      interface Obj { x: number; }
      const objHeap = new WeakHeap2<Obj>((a, b) => a.x - b.x);
      const node = objHeap.insert({ x: 10 });
      objHeap.insert({ x: 5 });
      objHeap.insert({ x: 15 });

      objHeap.decreaseKey(node, { x: 3 });
      expect(objHeap.peek()!.x).toBe(3);
    });

    it('should work multiple times on same node', () => {
      const node = heap.insert(20);
      heap.insert(5);
      heap.insert(10);

      heap.decreaseKey(node, 15);
      heap.decreaseKey(node, 8);
      heap.decreaseKey(node, 2);
      expect(heap.peek()).toBe(2);
    });
  });

  describe('merge', () => {
    it('should merge with empty heap', () => {
      heap.insert(5);
      heap.insert(3);

      const other = new WeakHeap2<number>();
      heap.merge(other);

      expect(heap.size).toBe(2);
      expect(heap.peek()).toBe(3);
    });

    it('should merge empty heap with non-empty', () => {
      const other = new WeakHeap2<number>();
      other.insert(5);
      other.insert(3);

      heap.merge(other);

      expect(heap.size).toBe(2);
      expect(heap.peek()).toBe(3);
    });

    it('should merge two non-empty heaps', () => {
      heap.insert(5);
      heap.insert(10);

      const other = new WeakHeap2<number>();
      other.insert(3);
      other.insert(7);

      heap.merge(other);

      expect(heap.size).toBe(4);
      expect(heap.peek()).toBe(3);
    });

    it('should maintain min after merge', () => {
      heap.insert(15);
      heap.insert(20);

      const other = new WeakHeap2<number>();
      other.insert(5);
      other.insert(10);

      heap.merge(other);

      expect(heap.peek()).toBe(5);
    });

    it('should merge heaps with duplicate values', () => {
      heap.insert(5);
      heap.insert(10);

      const other = new WeakHeap2<number>();
      other.insert(5);
      other.insert(10);

      heap.merge(other);

      expect(heap.size).toBe(4);

      const result: number[] = [];
      while (!heap.isEmpty()) {
        result.push(heap.extractMin()!);
      }
      expect(result).toEqual([5, 5, 10, 10]);
    });

    it('should merge multiple times', () => {
      heap.insert(1);

      const other1 = new WeakHeap2<number>();
      other1.insert(2);

      const other2 = new WeakHeap2<number>();
      other2.insert(3);

      heap.merge(other1);
      heap.merge(other2);

      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(1);
    });

    it('should work with custom comparator', () => {
      const maxHeap1 = new WeakHeap2<number>((a, b) => b - a);
      maxHeap1.insert(5);

      const maxHeap2 = new WeakHeap2<number>((a, b) => b - a);
      maxHeap2.insert(10);

      maxHeap1.merge(maxHeap2);

      expect(maxHeap1.size).toBe(2);
      expect(maxHeap1.peek()).toBe(10);
    });
  });

  describe('size', () => {
    it('should return 0 for empty heap', () => {
      expect(heap.size).toBe(0);
    });

    it('should return correct size after inserts', () => {
      expect(heap.size).toBe(0);
      heap.insert(1);
      expect(heap.size).toBe(1);
      heap.insert(2);
      expect(heap.size).toBe(2);
      heap.insert(3);
      expect(heap.size).toBe(3);
    });

    it('should return correct size after extracts', () => {
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      expect(heap.size).toBe(3);

      heap.extractMin();
      expect(heap.size).toBe(2);

      heap.extractMin();
      expect(heap.size).toBe(1);
    });

    it('should return correct size after mix of operations', () => {
      heap.insert(1);
      heap.insert(2);
      heap.extractMin();
      heap.insert(3);
      heap.insert(4);
      heap.extractMin();
      expect(heap.size).toBe(2);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty heap', () => {
      expect(heap.isEmpty()).toBe(true);
    });

    it('should return false after insert', () => {
      heap.insert(1);
      expect(heap.isEmpty()).toBe(false);
    });

    it('should return true after extracting all', () => {
      heap.insert(1);
      heap.insert(2);
      heap.extractMin();
      heap.extractMin();
      expect(heap.isEmpty()).toBe(true);
    });

    it('should return false after insert and extract', () => {
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.extractMin();
      expect(heap.isEmpty()).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear empty heap', () => {
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size).toBe(0);
    });

    it('should clear non-empty heap', () => {
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);

      heap.clear();

      expect(heap.isEmpty()).toBe(true);
      expect(heap.size).toBe(0);
      expect(heap.peek()).toBe(undefined);
    });

    it('should allow inserts after clear', () => {
      heap.insert(1);
      heap.insert(2);
      heap.clear();

      heap.insert(3);
      heap.insert(4);

      expect(heap.size).toBe(2);
      expect(heap.peek()).toBe(3);
    });

    it('should handle multiple clears', () => {
      heap.insert(1);
      heap.clear();
      heap.clear();
      heap.clear();

      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty heap', () => {
      expect(heap.toArray()).toEqual([]);
    });

    it('should return array with all elements', () => {
      heap.insert(3);
      heap.insert(1);
      heap.insert(4);
      heap.insert(2);

      const arr = heap.toArray();
      expect(arr.length).toBe(4);
      expect(arr).toContain(1);
      expect(arr).toContain(2);
      expect(arr).toContain(3);
      expect(arr).toContain(4);
    });

    it('should not modify heap', () => {
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);

      const arr = heap.toArray();

      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(1);
    });

    it('should handle duplicate values', () => {
      heap.insert(5);
      heap.insert(3);
      heap.insert(5);
      heap.insert(3);

      const arr = heap.toArray();
      expect(arr.length).toBe(4);
      expect(arr.filter((x) => x === 5).length).toBe(2);
      expect(arr.filter((x) => x === 3).length).toBe(2);
    });
  });

  describe('forEach', () => {
    it('should not call callback on empty heap', () => {
      let calls = 0;
      heap.forEach(() => {
        calls++;
      });
      expect(calls).toBe(0);
    });

    it('should call callback for each element', () => {
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);

      const values: number[] = [];
      heap.forEach((value) => {
        values.push(value);
      });

      expect(values.length).toBe(3);
      expect(values).toContain(1);
      expect(values).toContain(2);
      expect(values).toContain(3);
    });

    it('should provide index to callback', () => {
      heap.insert(10);
      heap.insert(20);
      heap.insert(30);

      const indices: number[] = [];
      heap.forEach((_value: number, index: number) => {
        indices.push(index);
      });

      expect(indices).toContain(0);
      expect(indices).toContain(1);
      expect(indices).toContain(2);
    });

    it('should not modify heap during iteration', () => {
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);

      heap.forEach(() => {
        expect(heap.size).toBe(3);
      });
    });
  });

  describe('integration tests', () => {
    it('should handle large number of elements', () => {
      const count = 1000;
      for (let i = 0; i < count; i++) {
        heap.insert(Math.random() * 1000);
      }
      expect(heap.size).toBe(count);
    });

    it('should maintain heap property with many operations', () => {
      const values = [50, 30, 20, 40, 70, 60, 80, 10, 90, 5];
      values.forEach((v) => heap.insert(v));

      let prev = -Infinity;
      while (!heap.isEmpty()) {
        const current = heap.extractMin()!;
        expect(current).toBeGreaterThanOrEqual(prev);
        prev = current;
      }
    });

    it('should work with fibonacci sequence', () => {
      const fib = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55];
      fib.forEach((v) => heap.insert(v));

      const extracted: number[] = [];
      while (!heap.isEmpty()) {
        extracted.push(heap.extractMin()!);
      }
      expect(extracted).toEqual([1, 1, 2, 3, 5, 8, 13, 21, 34, 55]);
    });

    it('should handle alternating insert and extract', () => {
      heap.insert(5);
      expect(heap.extractMin()).toBe(5);

      heap.insert(3);
      heap.insert(7);
      expect(heap.extractMin()).toBe(3);

      heap.insert(1);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(7);
    });
  });
});
