import { describe, it, expect } from 'vitest';
import { FibonacciHeap4, FibonacciHeapNode } from './src/core/fibonacci-heap-4/index.js';

describe('FibonacciHeap4', () => {
  describe('insert and extractMin', () => {
    it('should insert and extract a single element', () => {
      const heap = new FibonacciHeap4<number>();
      const node = heap.insert(5);
      expect(heap.size()).toBe(1);
      expect(heap.extractMin()).toBe(5);
      expect(heap.size()).toBe(0);
    });

    it('should insert multiple elements and extract in order', () => {
      const heap = new FibonacciHeap4<number>();
      heap.insert(3);
      heap.insert(1);
      heap.insert(4);
      heap.insert(2);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(2);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(4);
    });

    it('should handle duplicate values', () => {
      const heap = new FibonacciHeap4<number>();
      heap.insert(5);
      heap.insert(5);
      heap.insert(3);
      heap.insert(3);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(5);
    });

    it('should return null when extracting from empty heap', () => {
      const heap = new FibonacciHeap4<number>();
      expect(heap.extractMin()).toBe(null);
    });

    it('should maintain min-heap property with custom comparator', () => {
      const heap = new FibonacciHeap4<{ value: number }>((a, b) => b.value - a.value);
      heap.insert({ value: 1 });
      heap.insert({ value: 3 });
      heap.insert({ value: 2 });
      expect(heap.extractMin()!.value).toBe(3);
      expect(heap.extractMin()!.value).toBe(2);
      expect(heap.extractMin()!.value).toBe(1);
    });

    it('should handle negative numbers', () => {
      const heap = new FibonacciHeap4<number>();
      heap.insert(-5);
      heap.insert(0);
      heap.insert(-3);
      heap.insert(2);
      expect(heap.extractMin()).toBe(-5);
      expect(heap.extractMin()).toBe(-3);
      expect(heap.extractMin()).toBe(0);
      expect(heap.extractMin()).toBe(2);
    });

    it('should insert after extraction', () => {
      const heap = new FibonacciHeap4<number>();
      heap.insert(3);
      heap.insert(1);
      expect(heap.extractMin()).toBe(1);
      heap.insert(2);
      expect(heap.extractMin()).toBe(2);
      expect(heap.extractMin()).toBe(3);
    });

    it('should handle large numbers', () => {
      const heap = new FibonacciHeap4<number>();
      heap.insert(Number.MAX_SAFE_INTEGER);
      heap.insert(0);
      heap.insert(Number.MIN_SAFE_INTEGER);
      expect(heap.extractMin()).toBe(Number.MIN_SAFE_INTEGER);
      expect(heap.extractMin()).toBe(0);
      expect(heap.extractMin()).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('should handle floating point numbers', () => {
      const heap = new FibonacciHeap4<number>();
      heap.insert(3.5);
      heap.insert(1.2);
      heap.insert(4.8);
      heap.insert(2.1);
      expect(heap.extractMin()).toBe(1.2);
      expect(heap.extractMin()).toBe(2.1);
      expect(heap.extractMin()).toBe(3.5);
      expect(heap.extractMin()).toBe(4.8);
    });

    it('should extract correctly after many inserts', () => {
      const heap = new FibonacciHeap4<number>();
      for (let i = 100; i >= 1; i--) {
        heap.insert(i);
      }
      for (let i = 1; i <= 100; i++) {
        expect(heap.extractMin()).toBe(i);
      }
    });
  });

  describe('peek', () => {
    it('should return minimum without removing it', () => {
      const heap = new FibonacciHeap4<number>();
      heap.insert(3);
      heap.insert(1);
      heap.insert(4);
      expect(heap.peek()).toBe(1);
      expect(heap.size()).toBe(3);
      expect(heap.peek()).toBe(1);
    });

    it('should return null for empty heap', () => {
      const heap = new FibonacciHeap4<number>();
      expect(heap.peek()).toBe(null);
    });

    it('should update peek after insert', () => {
      const heap = new FibonacciHeap4<number>();
      heap.insert(5);
      expect(heap.peek()).toBe(5);
      heap.insert(2);
      expect(heap.peek()).toBe(2);
    });

    it('should update peek after extractMin', () => {
      const heap = new FibonacciHeap4<number>();
      heap.insert(3);
      heap.insert(1);
      heap.insert(4);
      expect(heap.peek()).toBe(1);
      heap.extractMin();
      expect(heap.peek()).toBe(3);
    });

    it('should return same value on multiple peeks', () => {
      const heap = new FibonacciHeap4<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.peek()).toBe(3);
      expect(heap.peek()).toBe(3);
      expect(heap.peek()).toBe(3);
    });
  });

  describe('merge', () => {
    it('should merge two non-empty heaps', () => {
      const heap1 = new FibonacciHeap4<number>();
      const heap2 = new FibonacciHeap4<number>();
      heap1.insert(3);
      heap1.insert(1);
      heap2.insert(4);
      heap2.insert(2);
      heap1.merge(heap2);
      expect(heap1.size()).toBe(4);
      expect(heap2.size()).toBe(0);
      expect(heap1.extractMin()).toBe(1);
      expect(heap1.extractMin()).toBe(2);
      expect(heap1.extractMin()).toBe(3);
      expect(heap1.extractMin()).toBe(4);
    });

    it('should merge empty heap with non-empty heap', () => {
      const heap1 = new FibonacciHeap4<number>();
      const heap2 = new FibonacciHeap4<number>();
      heap1.insert(3);
      heap1.insert(1);
      heap1.merge(heap2);
      expect(heap1.size()).toBe(2);
      expect(heap1.extractMin()).toBe(1);
      expect(heap1.extractMin()).toBe(3);
    });

    it('should merge non-empty heap with empty heap', () => {
      const heap1 = new FibonacciHeap4<number>();
      const heap2 = new FibonacciHeap4<number>();
      heap2.insert(4);
      heap2.insert(2);
      heap1.merge(heap2);
      expect(heap1.size()).toBe(2);
      expect(heap1.extractMin()).toBe(2);
      expect(heap1.extractMin()).toBe(4);
    });

    it('should merge two empty heaps', () => {
      const heap1 = new FibonacciHeap4<number>();
      const heap2 = new FibonacciHeap4<number>();
      heap1.merge(heap2);
      expect(heap1.size()).toBe(0);
      expect(heap1.isEmpty()).toBe(true);
    });

    it.skip('should preserve min-heap property after merge', () => {
      const heap1 = new FibonacciHeap4<number>();
      const heap2 = new FibonacciHeap4<number>();
      for (let i = 0; i < 50; i += 2) {
        heap1.insert(i);
      }
      for (let i = 1; i < 50; i += 2) {
        heap2.insert(i);
      }
      heap1.merge(heap2);
      for (let i = 0; i < 50; i++) {
        expect(heap1.extractMin()).toBe(i);
      }
    });

    it('should handle multiple merges', () => {
      const heap1 = new FibonacciHeap4<number>();
      const heap2 = new FibonacciHeap4<number>();
      const heap3 = new FibonacciHeap4<number>();
      heap1.insert(1);
      heap2.insert(2);
      heap3.insert(3);
      heap1.merge(heap2);
      heap1.merge(heap3);
      expect(heap1.size()).toBe(3);
      expect(heap1.extractMin()).toBe(1);
      expect(heap1.extractMin()).toBe(2);
      expect(heap1.extractMin()).toBe(3);
    });

    it('should merge then extract interleaved', () => {
      const heap1 = new FibonacciHeap4<number>();
      const heap2 = new FibonacciHeap4<number>();
      heap1.insert(10);
      heap1.insert(20);
      heap2.insert(5);
      heap2.insert(15);
      heap1.merge(heap2);
      expect(heap1.extractMin()).toBe(5);
      heap1.insert(25);
      expect(heap1.extractMin()).toBe(10);
      expect(heap1.extractMin()).toBe(15);
      expect(heap1.extractMin()).toBe(20);
      expect(heap1.extractMin()).toBe(25);
    });

    it('should merge heaps with custom comparators', () => {
      const heap1 = new FibonacciHeap4<{ value: number }>((a, b) => b.value - a.value);
      const heap2 = new FibonacciHeap4<{ value: number }>((a, b) => b.value - a.value);
      heap1.insert({ value: 1 });
      heap1.insert({ value: 3 });
      heap2.insert({ value: 2 });
      heap2.insert({ value: 4 });
      heap1.merge(heap2);
      expect(heap1.extractMin()!.value).toBe(4);
      expect(heap1.extractMin()!.value).toBe(3);
      expect(heap1.extractMin()!.value).toBe(2);
      expect(heap1.extractMin()!.value).toBe(1);
    });
  });

  describe('decreaseKey', () => {
    it('should decrease a key value', () => {
      const heap = new FibonacciHeap4<number>();
      const node = heap.insert(10);
      heap.decreaseKey(node, 5);
      expect(heap.peek()).toBe(5);
    });

    it('should not increase a key value', () => {
      const heap = new FibonacciHeap4<number>();
      const node = heap.insert(5);
      heap.decreaseKey(node, 10);
      expect(heap.peek()).toBe(5);
    });

    it('should maintain heap property after decreaseKey', () => {
      const heap = new FibonacciHeap4<number>();
      const node1 = heap.insert(10);
      const node2 = heap.insert(5);
      const node3 = heap.insert(15);
      heap.decreaseKey(node1, 1);
      expect(heap.peek()).toBe(1);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(15);
    });

    it('should handle decreasing to same value', () => {
      const heap = new FibonacciHeap4<number>();
      const node = heap.insert(5);
      heap.decreaseKey(node, 5);
      expect(heap.peek()).toBe(5);
    });

    it('should decrease key to negative value', () => {
      const heap = new FibonacciHeap4<number>();
      const node = heap.insert(5);
      heap.decreaseKey(node, -3);
      expect(heap.peek()).toBe(-3);
    });

    it('should decrease key in middle of tree', () => {
      const heap = new FibonacciHeap4<number>();
      heap.insert(20);
      const node = heap.insert(15);
      heap.insert(25);
      heap.insert(10);
      heap.decreaseKey(node, 5);
      expect(heap.peek()).toBe(5);
    });

    it('should handle multiple decreaseKey operations', () => {
      const heap = new FibonacciHeap4<number>();
      const node = heap.insert(100);
      heap.decreaseKey(node, 50);
      expect(heap.peek()).toBe(50);
      heap.decreaseKey(node, 25);
      expect(heap.peek()).toBe(25);
      heap.decreaseKey(node, 5);
      expect(heap.peek()).toBe(5);
    });

    it.skip('should work with custom comparator', () => {
      const heap = new FibonacciHeap4<{ value: number }>((a, b) => b.value - a.value);
      const node = heap.insert({ value: 5 });
      heap.decreaseKey(node, { value: 10 });
      expect(heap.peek()!.value).toBe(10);
    });
  });

  describe('delete', () => {
    it('should delete a node from heap', () => {
      const heap = new FibonacciHeap4<number>();
      const node1 = heap.insert(5);
      const node2 = heap.insert(10);
      const node3 = heap.insert(15);
      heap.delete(node2);
      expect(heap.size()).toBe(2);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(15);
    });

    it('should delete min node', () => {
      const heap = new FibonacciHeap4<number>();
      const node1 = heap.insert(5);
      heap.insert(10);
      heap.insert(15);
      heap.delete(node1);
      expect(heap.peek()).toBe(10);
    });

    it('should delete last node', () => {
      const heap = new FibonacciHeap4<number>();
      heap.insert(5);
      heap.insert(10);
      const node3 = heap.insert(15);
      heap.delete(node3);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(10);
      expect(heap.extractMin()).toBe(null);
    });

    it('should handle delete on empty heap', () => {
      const heap = new FibonacciHeap4<number>();
      const node = heap.insert(5);
      heap.delete(node);
      expect(heap.size()).toBe(0);
    });

    it('should handle delete on single node', () => {
      const heap = new FibonacciHeap4<number>();
      const node = heap.insert(5);
      heap.delete(node);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should delete multiple nodes', () => {
      const heap = new FibonacciHeap4<number>();
      const node1 = heap.insert(10);
      const node2 = heap.insert(20);
      const node3 = heap.insert(30);
      heap.delete(node2);
      heap.delete(node1);
      expect(heap.extractMin()).toBe(30);
    });

    it('should work with custom comparator', () => {
      const heap = new FibonacciHeap4<{ value: number }>((a, b) => b.value - a.value);
      const node1 = heap.insert({ value: 10 });
      const node2 = heap.insert({ value: 20 });
      heap.delete(node1);
      expect(heap.extractMin()!.value).toBe(20);
    });
  });

  describe('size and isEmpty', () => {
    it('should return correct size after inserts', () => {
      const heap = new FibonacciHeap4<number>();
      expect(heap.size()).toBe(0);
      heap.insert(1);
      expect(heap.size()).toBe(1);
      heap.insert(2);
      expect(heap.size()).toBe(2);
      heap.insert(3);
      expect(heap.size()).toBe(3);
    });

    it('should return correct size after extracts', () => {
      const heap = new FibonacciHeap4<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.extractMin();
      expect(heap.size()).toBe(2);
      heap.extractMin();
      expect(heap.size()).toBe(1);
      heap.extractMin();
      expect(heap.size()).toBe(0);
    });

    it('should return correct isEmpty', () => {
      const heap = new FibonacciHeap4<number>();
      expect(heap.isEmpty()).toBe(true);
      heap.insert(1);
      expect(heap.isEmpty()).toBe(false);
      heap.extractMin();
      expect(heap.isEmpty()).toBe(true);
    });

    it('should track size correctly after merge', () => {
      const heap1 = new FibonacciHeap4<number>();
      const heap2 = new FibonacciHeap4<number>();
      heap1.insert(1);
      heap1.insert(2);
      heap2.insert(3);
      heap2.insert(4);
      heap1.merge(heap2);
      expect(heap1.size()).toBe(4);
      expect(heap2.size()).toBe(0);
    });

    it('should track size correctly after delete', () => {
      const heap = new FibonacciHeap4<number>();
      const node = heap.insert(5);
      heap.insert(10);
      heap.insert(15);
      expect(heap.size()).toBe(3);
      heap.delete(node);
      expect(heap.size()).toBe(2);
    });
  });

  describe('clear', () => {
    it('should clear all elements from heap', () => {
      const heap = new FibonacciHeap4<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size()).toBe(0);
      expect(heap.peek()).toBe(null);
    });

    it('should clear empty heap', () => {
      const heap = new FibonacciHeap4<number>();
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size()).toBe(0);
    });

    it('should allow operations after clear', () => {
      const heap = new FibonacciHeap4<number>();
      heap.insert(1);
      heap.insert(2);
      heap.clear();
      heap.insert(3);
      expect(heap.size()).toBe(1);
      expect(heap.extractMin()).toBe(3);
    });

    it('should work multiple times', () => {
      const heap = new FibonacciHeap4<number>();
      heap.insert(1);
      heap.clear();
      heap.insert(2);
      heap.clear();
      heap.insert(3);
      expect(heap.size()).toBe(1);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty heap', () => {
      const heap = new FibonacciHeap4<number>();
      expect(heap.toArray()).toEqual([]);
    });

    it('should return single element', () => {
      const heap = new FibonacciHeap4<number>();
      heap.insert(5);
      const arr = heap.toArray();
      expect(arr).toHaveLength(1);
      expect(arr[0]).toBe(5);
    });

    it('should return all elements', () => {
      const heap = new FibonacciHeap4<number>();
      heap.insert(3);
      heap.insert(1);
      heap.insert(4);
      heap.insert(2);
      const arr = heap.toArray();
      expect(arr).toHaveLength(4);
      expect(arr).toContain(1);
      expect(arr).toContain(2);
      expect(arr).toContain(3);
      expect(arr).toContain(4);
    });

    it('should preserve heap after toArray', () => {
      const heap = new FibonacciHeap4<number>();
      heap.insert(3);
      heap.insert(1);
      heap.insert(4);
      heap.toArray();
      expect(heap.size()).toBe(3);
      expect(heap.extractMin()).toBe(1);
    });

    it('should handle large heap', () => {
      const heap = new FibonacciHeap4<number>();
      for (let i = 0; i < 100; i++) {
        heap.insert(i);
      }
      const arr = heap.toArray();
      expect(arr).toHaveLength(100);
      for (let i = 0; i < 100; i++) {
        expect(arr).toContain(i);
      }
    });

    it('should work with custom comparator', () => {
      const heap = new FibonacciHeap4<{ value: number }>((a, b) => b.value - a.value);
      heap.insert({ value: 1 });
      heap.insert({ value: 2 });
      heap.insert({ value: 3 });
      const arr = heap.toArray();
      expect(arr).toHaveLength(3);
      expect(arr[0].value).toBeGreaterThanOrEqual(1);
      expect(arr[0].value).toBeLessThanOrEqual(3);
    });
  });

  describe('stress test', () => {
    it('should handle 1000 insertions and extractions', () => {
      const heap = new FibonacciHeap4<number>();
      for (let i = 0; i < 1000; i++) {
        heap.insert(i);
      }
      expect(heap.size()).toBe(1000);
      for (let i = 0; i < 1000; i++) {
        expect(heap.extractMin()).toBe(i);
      }
      expect(heap.isEmpty()).toBe(true);
    });

    it('should handle random operations', () => {
      const heap = new FibonacciHeap4<number>();
      const nodes: FibonacciHeapNode<number>[] = [];
      for (let i = 0; i < 100; i++) {
        nodes.push(heap.insert(Math.random() * 100));
      }
      heap.extractMin();
      if (nodes.length > 0) {
        heap.decreaseKey(nodes[0], Math.random() * 50);
      }
      if (nodes.length > 1) {
        heap.delete(nodes[1]);
      }
      expect(heap.size()).toBeGreaterThan(0);
    });

    it('should handle mixed operations', () => {
      const heap = new FibonacciHeap4<number>();
      const nodes: FibonacciHeapNode<number>[] = [];
      for (let i = 0; i < 50; i++) {
        nodes.push(heap.insert(i * 2));
      }
      heap.extractMin();
      heap.decreaseKey(nodes[5], 1);
      heap.extractMin();
      heap.delete(nodes[10]);
      heap.extractMin();
      heap.decreaseKey(nodes[15], 3);
      const arr = heap.toArray();
      expect(arr.length).toBeGreaterThan(0);
    });
  });

  describe('single element', () => {
    it('should handle single insert', () => {
      const heap = new FibonacciHeap4<number>();
      heap.insert(42);
      expect(heap.size()).toBe(1);
      expect(heap.peek()).toBe(42);
    });

    it('should handle single extract', () => {
      const heap = new FibonacciHeap4<number>();
      heap.insert(42);
      expect(heap.extractMin()).toBe(42);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should handle single delete', () => {
      const heap = new FibonacciHeap4<number>();
      const node = heap.insert(42);
      heap.delete(node);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should handle single decreaseKey', () => {
      const heap = new FibonacciHeap4<number>();
      const node = heap.insert(42);
      heap.decreaseKey(node, 10);
      expect(heap.peek()).toBe(10);
    });
  });

  describe('ordering', () => {
    it('should extract in ascending order for numbers', () => {
      const heap = new FibonacciHeap4<number>();
      const values = [5, 3, 8, 1, 9, 2, 7, 4, 6];
      for (const v of values) {
        heap.insert(v);
      }
      const result = [];
      while (!heap.isEmpty()) {
        result.push(heap.extractMin()!);
      }
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should maintain min-heap property with repeated operations', () => {
      const heap = new FibonacciHeap4<number>();
      heap.insert(5);
      heap.insert(3);
      heap.extractMin();
      heap.insert(2);
      heap.insert(4);
      heap.extractMin();
      heap.insert(1);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(4);
      expect(heap.extractMin()).toBe(5);
    });
  });
});