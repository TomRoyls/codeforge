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
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      heap.insert(9);

      const first = heap.extractMin();
      expect(first).toBe(1);

      heap.insert(10);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(7);
      expect(heap.extractMin()).toBe(9);
      expect(heap.extractMin()).toBe(10);
    });

    it('should handle very large number', () => {
      heap.insert(Number.MAX_VALUE);
      heap.insert(Number.MIN_VALUE);
      expect(heap.peek()).toBe(Number.MIN_VALUE);
    });

    it('should handle very small number', () => {
      heap.insert(Number.MIN_VALUE);
      heap.insert(Number.MAX_VALUE);
      expect(heap.peek()).toBe(Number.MIN_VALUE);
    });

    it('should handle infinity', () => {
      heap.insert(Infinity);
      heap.insert(1);
      heap.insert(-Infinity);
      expect(heap.peek()).toBe(-Infinity);
    });

    it('should handle negative infinity', () => {
      heap.insert(-Infinity);
      heap.insert(0);
      heap.insert(Infinity);
      expect(heap.peek()).toBe(-Infinity);
    });

    it('should handle mixed positive and negative', () => {
      heap.insert(-10);
      heap.insert(10);
      heap.insert(-5);
      heap.insert(5);
      expect(heap.peek()).toBe(-10);
    });

    it('should extract all elements correctly', () => {
      const values = [5, 3, 7, 1, 9, 2, 8, 4, 6];
      values.forEach((v) => heap.insert(v));

      const extracted: number[] = [];
      while (!heap.isEmpty()) {
        extracted.push(heap.extractMin()!);
      }
      expect(extracted).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should maintain heap property after multiple inserts', () => {
      for (let i = 0; i < 100; i++) {
        heap.insert(Math.random() * 1000);
      }

      let prev = -Infinity;
      while (!heap.isEmpty()) {
        const current = heap.extractMin()!;
        expect(current).toBeGreaterThanOrEqual(prev);
        prev = current;
      }
    });

    it('should handle single element after operations', () => {
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.extractMin();
      heap.extractMin();
      expect(heap.size).toBe(1);
      expect(heap.peek()).toBe(3);
    });

    it('should handle clear and reinsert', () => {
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.clear();

      heap.insert(5);
      heap.insert(4);
      expect(heap.size).toBe(2);
      expect(heap.peek()).toBe(4);
    });

    it('should handle merge with different comparators', () => {
      const heap1 = new WeakHeap2<number>((a, b) => a - b);
      heap1.insert(5);
      heap1.insert(1);

      const heap2 = new WeakHeap2<number>((a, b) => a - b);
      heap2.insert(3);
      heap2.insert(2);

      heap1.merge(heap2);
      expect(heap1.size).toBe(4);
    });

    it('should handle decreaseKey with same value', () => {
      const node = heap.insert(5);
      heap.insert(3);

      heap.decreaseKey(node, 5);
      expect(heap.peek()).toBe(3);
    });

    it('should handle multiple decreaseKey on different nodes', () => {
      const node1 = heap.insert(10);
      const node2 = heap.insert(20);
      heap.insert(5);

      heap.decreaseKey(node1, 1);
      heap.decreaseKey(node2, 2);

      expect(heap.peek()).toBe(1);
      expect(heap.size).toBe(3);
    });

    it('should handle decreaseKey to very small value', () => {
      const node = heap.insert(100);
      heap.insert(50);
      heap.insert(75);

      heap.decreaseKey(node, -100);
      expect(heap.peek()).toBe(-100);
    });

    it('should handle merge with empty then non-empty', () => {
      heap.insert(1);
      heap.insert(2);

      const other = new WeakHeap2<number>();
      heap.merge(other);
      expect(heap.size).toBe(2);

      other.insert(3);
      heap.merge(other);
      expect(heap.size).toBe(3);
    });

    it('should handle toArray on large heap', () => {
      for (let i = 0; i < 100; i++) {
        heap.insert(i);
      }

      const arr = heap.toArray();
      expect(arr.length).toBe(100);
    });

    it('should handle forEach with side effects', () => {
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);

      let count = 0;
      heap.forEach(() => {
        count++;
      });
      expect(count).toBe(3);
    });

    it('should handle rapid insert extract cycles', () => {
      for (let i = 0; i < 50; i++) {
        heap.insert(i);
        expect(heap.extractMin()).toBe(i);
      }
      expect(heap.isEmpty()).toBe(true);
    });

    it('should handle decreasing key multiple times', () => {
      const node = heap.insert(50);
      heap.insert(30);
      heap.insert(40);

      heap.decreaseKey(node, 20);
      expect(heap.peek()).toBe(20);

      heap.decreaseKey(node, 10);
      expect(heap.peek()).toBe(10);

      heap.decreaseKey(node, 5);
      expect(heap.peek()).toBe(5);
    });

    it('should handle merge into non-empty heap multiple times', () => {
      heap.insert(1);

      for (let i = 0; i < 10; i++) {
        const other = new WeakHeap2<number>();
        other.insert(i);
        heap.merge(other);
      }

      expect(heap.size).toBe(11);
    });

    it('should handle string case sensitivity', () => {
      const stringHeap = new WeakHeap2<string>();
      stringHeap.insert('Zebra');
      stringHeap.insert('Apple');
      stringHeap.insert('apple');
      stringHeap.insert('Banana');

      expect(stringHeap.peek()).toBe('Apple');
    });

    it('should handle object with deep equality', () => {
      interface DeepObj { a: number; b: number; }
      const objHeap = new WeakHeap2<DeepObj>((x, y) => x.a - y.a);

      objHeap.insert({ a: 5, b: 10 });
      objHeap.insert({ a: 3, b: 6 });
      objHeap.insert({ a: 7, b: 14 });

      expect(objHeap.peek()!.a).toBe(3);
    });

    it('should handle merge with many elements', () => {
      for (let i = 0; i < 50; i++) {
        heap.insert(i);
      }

      const other = new WeakHeap2<number>();
      for (let i = 50; i < 100; i++) {
        other.insert(i);
      }

      heap.merge(other);
      expect(heap.size).toBe(100);

      let prev = -1;
      while (!heap.isEmpty()) {
        const current = heap.extractMin()!;
        expect(current).toBeGreaterThan(prev);
        prev = current;
      }
    });

    it('should handle extractMin on heap with one element', () => {
      heap.insert(42);
      expect(heap.extractMin()).toBe(42);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should handle clear on heap with one element', () => {
      heap.insert(42);
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
      expect(heap.peek()).toBe(undefined);
    });

    it('should handle clear on empty heap', () => {
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size).toBe(0);
    });

    it('should handle forEach on empty heap', () => {
      let called = false;
      heap.forEach(() => {
        called = true;
      });
      expect(called).toBe(false);
    });

    it('should handle toArray on empty heap', () => {
      expect(heap.toArray()).toEqual([]);
    });

    it('should handle peek on empty heap multiple times', () => {
      expect(heap.peek()).toBe(undefined);
      expect(heap.peek()).toBe(undefined);
      expect(heap.peek()).toBe(undefined);
    });

    it('should handle insert after clear', () => {
      heap.insert(1);
      heap.insert(2);
      heap.clear();
      heap.insert(3);
      heap.insert(4);

      expect(heap.size).toBe(2);
      expect(heap.peek()).toBe(3);
    });

    it('should handle decreaseKey on min element', () => {
      const node1 = heap.insert(5);
      const node2 = heap.insert(10);

      heap.decreaseKey(node1, 1);
      expect(heap.peek()).toBe(1);
    });

    it('should handle merge where other has smaller elements', () => {
      heap.insert(10);
      heap.insert(20);
      heap.insert(30);

      const other = new WeakHeap2<number>();
      other.insert(5);
      other.insert(15);

      heap.merge(other);
      expect(heap.peek()).toBe(5);
      expect(heap.size).toBe(5);
    });

    it('should handle merge where this has smaller elements', () => {
      heap.insert(1);
      heap.insert(3);
      heap.insert(5);

      const other = new WeakHeap2<number>();
      other.insert(10);
      other.insert(20);

      heap.merge(other);
      expect(heap.peek()).toBe(1);
      expect(heap.size).toBe(5);
    });

    it('should handle merge with equal elements', () => {
      heap.insert(5);
      heap.insert(5);
      heap.insert(5);

      const other = new WeakHeap2<number>();
      other.insert(5);
      other.insert(5);

      heap.merge(other);
      expect(heap.size).toBe(5);

      const result: number[] = [];
      while (!heap.isEmpty()) {
        result.push(heap.extractMin()!);
      }
      expect(result).toEqual([5, 5, 5, 5, 5]);
    });

    it('should handle decreasing insert sequence', () => {
      for (let i = 100; i > 0; i--) {
        heap.insert(i);
      }
      expect(heap.size).toBe(100);
    });

    it('should handle increasing insert sequence', () => {
      for (let i = 1; i <= 100; i++) {
        heap.insert(i);
      }
      expect(heap.size).toBe(100);
    });

    it('should handle alternating sequence', () => {
      for (let i = 1; i <= 50; i++) {
        heap.insert(i);
        heap.insert(-i);
      }
      expect(heap.size).toBe(100);
    });

    it('should handle repeated value insert', () => {
      for (let i = 0; i < 10; i++) {
        heap.insert(5);
      }
      expect(heap.size).toBe(10);
    });

    it('should handle size getter on empty heap', () => {
      expect(heap.size).toBe(0);
    });

    it('should handle size after single insert', () => {
      heap.insert(42);
      expect(heap.size).toBe(1);
    });

    it('should handle size after clear', () => {
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.clear();
      expect(heap.size).toBe(0);
    });

    it('should handle size after extract', () => {
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.extractMin();
      expect(heap.size).toBe(2);
    });
});
});
