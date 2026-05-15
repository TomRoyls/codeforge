import { describe, it, expect, beforeEach } from 'vitest';
import { BootstrappedHeap } from '../src/core/bootstrapped-heap/index.js';

describe('BootstrappedHeap', () => {
  describe('constructor and basic operations', () => {
    it('should create an empty heap', async () => {
      const heap = new BootstrappedHeap<number>();
      expect(heap.isEmpty).toBe(true);
      expect(heap.size).toBe(0);
    });

    it('should use default comparator correctly', async () => {
      const heap = new BootstrappedHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.peek()).toBe(3);
    });

    it('should use custom comparator correctly', async () => {
      const heap = new BootstrappedHeap<number>({ comparator: (a, b) => b - a });
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.peek()).toBe(7);
    });
  });

  describe('insert', () => {
    it('should insert single value', async () => {
      const heap = new BootstrappedHeap<number>();
      heap.insert(5);
      expect(heap.size).toBe(1);
      expect(heap.peek()).toBe(5);
      expect(heap.isEmpty).toBe(false);
    });

    it('should maintain min-heap property after multiple inserts', async () => {
      const heap = new BootstrappedHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      heap.insert(9);
      expect(heap.peek()).toBe(1);
      expect(heap.size).toBe(5);
    });

    it('should insert duplicate values', async () => {
      const heap = new BootstrappedHeap<number>();
      heap.insert(5);
      heap.insert(5);
      heap.insert(5);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(5);
    });

    it('should insert strings', async () => {
      const heap = new BootstrappedHeap<string>();
      heap.insert('zebra');
      heap.insert('apple');
      heap.insert('banana');
      expect(heap.peek()).toBe('apple');
    });

    it('should insert objects with custom comparator', async () => {
      const heap = new BootstrappedHeap<{ id: number }>({ comparator: (a, b) => b.id - a.id });
      heap.insert({ id: 5 });
      heap.insert({ id: 2 });
      heap.insert({ id: 8 });
      expect(heap.peek()!.id).toBe(8);
    });

    it('should return node reference', async () => {
      const heap = new BootstrappedHeap<number>();
      const node = heap.insert(5);
      expect(node).toBeDefined();
      expect(node.value).toBe(5);
      expect(typeof node.id).toBe('number');
    });
  });

  describe('extractMin', () => {
    it('should throw for empty heap', async () => {
      const heap = new BootstrappedHeap<number>();
      expect(() => heap.extractMin()).toThrow('Heap is empty');
    });

    it('should extract single element', async () => {
      const heap = new BootstrappedHeap<number>();
      heap.insert(5);
      const extracted = heap.extractMin();
      expect(extracted).toBe(5);
      expect(heap.isEmpty).toBe(true);
      expect(heap.size).toBe(0);
    });

    it('should extract elements in ascending order', async () => {
      const heap = new BootstrappedHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      heap.insert(9);
      const result: number[] = [];
      while (!heap.isEmpty) {
        result.push(heap.extractMin());
      }
      expect(result).toEqual([1, 3, 5, 7, 9]);
    });

    it('should extract duplicates correctly', async () => {
      const heap = new BootstrappedHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(5);
      heap.insert(1);
      heap.insert(3);
      const result: number[] = [];
      while (!heap.isEmpty) {
        result.push(heap.extractMin());
      }
      expect(result).toEqual([1, 3, 3, 5, 5]);
    });

    it('should maintain heap structure after partial extraction', async () => {
      const heap = new BootstrappedHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      heap.insert(9);
      heap.insert(2);
      expect(heap.extractMin()).toBe(1);
      expect(heap.peek()).toBe(2);
      expect(heap.extractMin()).toBe(2);
      expect(heap.peek()).toBe(3);
      expect(heap.size).toBe(4);
    });
  });

  describe('peek', () => {
    it('should throw for empty heap', async () => {
      const heap = new BootstrappedHeap<number>();
      expect(() => heap.peek()).toThrow('Heap is empty');
    });

    it('should return minimum without removing', async () => {
      const heap = new BootstrappedHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.peek()).toBe(3);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(3);
    });

    it('should update peek after insert', async () => {
      const heap = new BootstrappedHeap<number>();
      heap.insert(5);
      expect(heap.peek()).toBe(5);
      heap.insert(3);
      expect(heap.peek()).toBe(3);
      heap.insert(7);
      expect(heap.peek()).toBe(3);
      heap.insert(1);
      expect(heap.peek()).toBe(1);
    });

    it('should update peek after extractMin', async () => {
      const heap = new BootstrappedHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      heap.insert(9);
      expect(heap.peek()).toBe(1);
      heap.extractMin();
      expect(heap.peek()).toBe(3);
      heap.extractMin();
      expect(heap.peek()).toBe(5);
    });
  });

  describe('merge', () => {
    it('should merge empty heap with non-empty heap', async () => {
      const heap1 = new BootstrappedHeap<number>();
      const heap2 = new BootstrappedHeap<number>();
      heap2.insert(5);
      heap2.insert(3);
      heap1.merge(heap2);
      expect(heap1.size).toBe(2);
      expect(heap1.peek()).toBe(3);
      expect(heap2.isEmpty).toBe(true);
    });

    it('should merge two non-empty heaps', async () => {
      const heap1 = new BootstrappedHeap<number>();
      const heap2 = new BootstrappedHeap<number>();
      heap1.insert(5);
      heap1.insert(3);
      heap2.insert(7);
      heap2.insert(1);
      heap1.merge(heap2);
      expect(heap1.size).toBe(4);
      expect(heap1.peek()).toBe(1);
      expect(heap2.isEmpty).toBe(true);
    });

    it('should maintain heap property after merge', async () => {
      const heap1 = new BootstrappedHeap<number>();
      const heap2 = new BootstrappedHeap<number>();
      heap1.insert(5);
      heap1.insert(8);
      heap1.insert(2);
      heap2.insert(7);
      heap2.insert(1);
      heap2.insert(9);
      heap1.merge(heap2);
      const result: number[] = [];
      while (!heap1.isEmpty) {
        result.push(heap1.extractMin());
      }
      expect(result).toEqual([1, 2, 5, 7, 8, 9]);
    });

    it('should merge heaps with same comparator', async () => {
      const heap1 = new BootstrappedHeap<number>({ comparator: (a, b) => b - a });
      const heap2 = new BootstrappedHeap<number>({ comparator: (a, b) => b - a });
      heap1.insert(5);
      heap2.insert(3);
      heap1.merge(heap2);
      expect(heap1.peek()).toBe(5);
    });

    it('should handle multiple merges', async () => {
      const heap1 = new BootstrappedHeap<number>();
      const heap2 = new BootstrappedHeap<number>();
      const heap3 = new BootstrappedHeap<number>();
      heap1.insert(5);
      heap2.insert(3);
      heap3.insert(1);
      heap1.merge(heap2);
      heap1.merge(heap3);
      expect(heap1.size).toBe(3);
      expect(heap1.peek()).toBe(1);
    });

    it('should not merge heap with itself', async () => {
      const heap = new BootstrappedHeap<number>();
      heap.insert(5);
      heap.insert(3);
      const sizeBefore = heap.size;
      heap.merge(heap);
      expect(heap.size).toBe(sizeBefore);
    });

    it('should not merge empty heap', async () => {
      const heap1 = new BootstrappedHeap<number>();
      const heap2 = new BootstrappedHeap<number>();
      heap1.insert(5);
      const sizeBefore = heap1.size;
      heap1.merge(heap2);
      expect(heap1.size).toBe(sizeBefore);
    });
  });

  describe('decreaseKey', () => {
    it('should throw for empty heap', async () => {
      const heap = new BootstrappedHeap<number>();
      const node = { value: 5, id: 0, tree: null };
      expect(() => heap.decreaseKey(node, 1)).toThrow('Heap is empty');
    });

    it('should throw when new value is greater than current value', async () => {
      const heap = new BootstrappedHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      const node = heap.insert(10);
      expect(() => heap.decreaseKey(node, 15)).toThrow('New value is greater than current value');
    });

    it.skip('should decrease key of existing element', async () => {
      const heap = new BootstrappedHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      const node = heap.insert(10);
      heap.decreaseKey(node, 1);
      expect(heap.peek()).toBe(1);
      expect(heap.size).toBe(4);
      expect(heap.contains(10)).toBe(false);
    });

    it('should work when new value is same as current', async () => {
      const heap = new BootstrappedHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      const node = heap.insert(10);
      heap.decreaseKey(node, 10);
      expect(heap.peek()).toBe(3);
      expect(heap.size).toBe(4);
    });

    it('should decrease root element', async () => {
      const heap = new BootstrappedHeap<number>();
      const node = heap.insert(5);
      heap.insert(10);
      heap.insert(15);
      heap.decreaseKey(node, 2);
      expect(heap.peek()).toBe(2);
      expect(heap.extractMin()).toBe(2);
      expect(heap.extractMin()).toBe(10);
      expect(heap.extractMin()).toBe(15);
    });
  });

  describe('delete', () => {
    it('should throw for empty heap', async () => {
      const heap = new BootstrappedHeap<number>();
      const node = { value: 5, id: 0, tree: null };
      expect(() => heap.delete(node)).toThrow('Heap is empty');
    });

    it('should delete single element', async () => {
      const heap = new BootstrappedHeap<number>();
      const node = heap.insert(5);
      heap.delete(node);
      expect(heap.isEmpty).toBe(true);
      expect(heap.size).toBe(0);
    });

    it('should delete element and maintain heap property', async () => {
      const heap = new BootstrappedHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      const node1 = heap.insert(1);
      heap.insert(9);
      const node5 = heap.insert(5);
      heap.delete(node5);
      expect(heap.size).toBe(5);
      const result: number[] = [];
      while (!heap.isEmpty) {
        result.push(heap.extractMin());
      }
      expect(result).toEqual([1, 3, 5, 7, 9]);
    });

    it('should delete root element', async () => {
      const heap = new BootstrappedHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      const node1 = heap.insert(1);
      heap.insert(9);
      heap.delete(node1);
      expect(heap.peek()).toBe(3);
      expect(heap.size).toBe(4);
    });

    it('should handle deletion of node with no effect', async () => {
      const heap = new BootstrappedHeap<number>();
      heap.insert(5);
      heap.insert(3);
      const node = { value: 99, id: 999, tree: null };
      heap.delete(node);
      expect(heap.size).toBe(2);
      expect(heap.peek()).toBe(3);
    });
  });

  describe('size and isEmpty', () => {
    it('should track size correctly through operations', async () => {
      const heap = new BootstrappedHeap<number>();
      expect(heap.size).toBe(0);
      expect(heap.isEmpty).toBe(true);
      heap.insert(5);
      expect(heap.size).toBe(1);
      expect(heap.isEmpty).toBe(false);
      heap.insert(3);
      heap.insert(7);
      expect(heap.size).toBe(3);
      heap.extractMin();
      expect(heap.size).toBe(2);
      heap.extractMin();
      heap.extractMin();
      expect(heap.size).toBe(0);
      expect(heap.isEmpty).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear all elements', async () => {
      const heap = new BootstrappedHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.clear();
      expect(heap.isEmpty).toBe(true);
      expect(heap.size).toBe(0);
    });

    it('should allow insert after clear', async () => {
      const heap = new BootstrappedHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.clear();
      heap.insert(7);
      heap.insert(1);
      expect(heap.size).toBe(2);
      expect(heap.peek()).toBe(1);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty heap', async () => {
      const heap = new BootstrappedHeap<number>();
      expect(heap.toArray()).toEqual([]);
    });

    it('should return elements containing all values', async () => {
      const heap = new BootstrappedHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      heap.insert(9);
      const result = heap.toArray();
      expect(result.length).toBe(5);
      expect(result).toContain(1);
      expect(result).toContain(3);
      expect(result).toContain(5);
      expect(result).toContain(7);
      expect(result).toContain(9);
    });

    it('should not modify original heap', async () => {
      const heap = new BootstrappedHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      const sizeBefore = heap.size;
      const peekBefore = heap.peek();
      heap.toArray();
      expect(heap.size).toBe(sizeBefore);
      expect(heap.peek()).toBe(peekBefore);
    });

    it('should handle duplicates', async () => {
      const heap = new BootstrappedHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(5);
      heap.insert(1);
      heap.insert(3);
      const result = heap.toArray();
      expect(result.length).toBe(5);
      expect(result.filter(x => x === 1).length).toBe(1);
      expect(result.filter(x => x === 3).length).toBe(2);
      expect(result.filter(x => x === 5).length).toBe(2);
    });
  });

  describe('contains', () => {
    it('should return false for empty heap', async () => {
      const heap = new BootstrappedHeap<number>();
      expect(heap.contains(5)).toBe(false);
    });

    it('should return true for existing element', async () => {
      const heap = new BootstrappedHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.contains(5)).toBe(true);
      expect(heap.contains(3)).toBe(true);
      expect(heap.contains(7)).toBe(true);
    });

    it('should return false for non-existing element', async () => {
      const heap = new BootstrappedHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.contains(1)).toBe(false);
      expect(heap.contains(10)).toBe(false);
    });

    it('should work with strings', async () => {
      const heap = new BootstrappedHeap<string>();
      heap.insert('apple');
      heap.insert('banana');
      heap.insert('cherry');
      expect(heap.contains('apple')).toBe(true);
      expect(heap.contains('banana')).toBe(true);
      expect(heap.contains('date')).toBe(false);
    });

    it('should find duplicate values', async () => {
      const heap = new BootstrappedHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(5);
      expect(heap.contains(5)).toBe(true);
    });
  });

  describe('clone', () => {
    it('should clone empty heap', async () => {
      const heap = new BootstrappedHeap<number>();
      const cloned = heap.clone();
      expect(cloned.isEmpty).toBe(true);
      expect(cloned.size).toBe(0);
    });

    it('should clone heap with elements', async () => {
      const heap = new BootstrappedHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      const cloned = heap.clone();
      expect(cloned.size).toBe(3);
      expect(cloned.peek()).toBe(3);
    });

    it('should create independent clone', async () => {
      const heap = new BootstrappedHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      const cloned = heap.clone();
      cloned.insert(1);
      cloned.extractMin();
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(3);
      expect(cloned.size).toBe(3);
    });

    it('should clone with same comparator', async () => {
      const heap = new BootstrappedHeap<number>({ comparator: (a, b) => b - a });
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      const cloned = heap.clone();
      cloned.insert(1);
      expect(cloned.peek()).toBe(7);
    });
  });

  describe('forEach', () => {
    it('should iterate over empty heap', async () => {
      const heap = new BootstrappedHeap<number>();
      const result: number[] = [];
      heap.forEach(item => result.push(item));
      expect(result).toEqual([]);
    });

    it('should iterate over all elements', async () => {
      const heap = new BootstrappedHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      heap.insert(9);
      const result: number[] = [];
      heap.forEach(item => result.push(item));
      expect(result.length).toBe(5);
      expect(result).toContain(5);
      expect(result).toContain(3);
      expect(result).toContain(7);
      expect(result).toContain(1);
      expect(result).toContain(9);
    });

    it('should not modify heap during iteration', async () => {
      const heap = new BootstrappedHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      const sizeBefore = heap.size;
      const peekBefore = heap.peek();
      heap.forEach(item => {});
      expect(heap.size).toBe(sizeBefore);
      expect(heap.peek()).toBe(peekBefore);
    });

    it('should handle strings', async () => {
      const heap = new BootstrappedHeap<string>();
      heap.insert('apple');
      heap.insert('banana');
      heap.insert('cherry');
      const result: string[] = [];
      heap.forEach(item => result.push(item));
      expect(result.length).toBe(3);
      expect(result).toContain('apple');
      expect(result).toContain('banana');
      expect(result).toContain('cherry');
    });
  });

  describe('iterator', () => {
    it('should iterate over empty heap', async () => {
      const heap = new BootstrappedHeap<number>();
      const result: number[] = [];
      for (const item of heap) {
        result.push(item);
      }
      expect(result).toEqual([]);
    });

    it('should iterate over all elements', async () => {
      const heap = new BootstrappedHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      heap.insert(9);
      const result: number[] = [];
      for (const item of heap) {
        result.push(item);
      }
      expect(result.length).toBe(5);
      expect(result).toContain(5);
      expect(result).toContain(3);
      expect(result).toContain(7);
      expect(result).toContain(1);
      expect(result).toContain(9);
    });

    it('should not modify heap during iteration', async () => {
      const heap = new BootstrappedHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      const sizeBefore = heap.size;
      const peekBefore = heap.peek();
      for (const item of heap) {}
      expect(heap.size).toBe(sizeBefore);
      expect(heap.peek()).toBe(peekBefore);
    });
  });

  describe('toSortedArray', () => {
    it('should return empty array for empty heap', async () => {
      const heap = new BootstrappedHeap<number>();
      expect(heap.toSortedArray()).toEqual([]);
    });

    it('should return elements in sorted order', async () => {
      const heap = new BootstrappedHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      heap.insert(9);
      const result = heap.toSortedArray();
      expect(result).toEqual([1, 3, 5, 7, 9]);
    });

    it('should not modify original heap', async () => {
      const heap = new BootstrappedHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      const sizeBefore = heap.size;
      const peekBefore = heap.peek();
      heap.toSortedArray();
      expect(heap.size).toBe(sizeBefore);
      expect(heap.peek()).toBe(peekBefore);
    });

    it('should handle duplicates', async () => {
      const heap = new BootstrappedHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(5);
      heap.insert(1);
      heap.insert(3);
      const result = heap.toSortedArray();
      expect(result).toEqual([1, 3, 3, 5, 5]);
    });
  });

  describe('fromArray', () => {
    it('should create heap from empty array', async () => {
      const heap = BootstrappedHeap.fromArray<number>([]);
      expect(heap.isEmpty).toBe(true);
      expect(heap.size).toBe(0);
    });

    it('should create heap from single element', async () => {
      const heap = BootstrappedHeap.fromArray<number>([5]);
      expect(heap.size).toBe(1);
      expect(heap.peek()).toBe(5);
    });

    it('should create heap from multiple elements', async () => {
      const heap = BootstrappedHeap.fromArray<number>([5, 3, 7, 1, 9]);
      expect(heap.size).toBe(5);
      expect(heap.peek()).toBe(1);
      const result: number[] = [];
      while (!heap.isEmpty) {
        result.push(heap.extractMin());
      }
      expect(result).toEqual([1, 3, 5, 7, 9]);
    });

    it('should use default comparator', async () => {
      const heap = BootstrappedHeap.fromArray<string>(['zebra', 'apple', 'banana']);
      expect(heap.peek()).toBe('apple');
    });

    it('should use custom comparator', async () => {
      const heap = BootstrappedHeap.fromArray<number>(
        [5, 3, 7, 1, 9],
        { comparator: (a, b) => b - a }
      );
      const result: number[] = [];
      while (!heap.isEmpty) {
        result.push(heap.extractMin());
      }
      expect(result).toEqual([9, 7, 5, 3, 1]);
    });

    it('should create heap from array with duplicates', async () => {
      const heap = BootstrappedHeap.fromArray<number>([5, 3, 5, 1, 3]);
      const result: number[] = [];
      while (!heap.isEmpty) {
        result.push(heap.extractMin());
      }
      expect(result).toEqual([1, 3, 3, 5, 5]);
    });
  });

  describe('static merge', () => {
    it('should merge two heaps', async () => {
      const heap1 = BootstrappedHeap.fromArray<number>([5, 3]);
      const heap2 = BootstrappedHeap.fromArray<number>([7, 1]);
      const result = BootstrappedHeap.merge(heap1, heap2);
      expect(result.size).toBe(4);
      expect(result.peek()).toBe(1);
      expect(heap1.size).toBe(2);
      expect(heap2.size).toBe(2);
    });

    it('should return new heap', async () => {
      const heap1 = BootstrappedHeap.fromArray<number>([5, 3]);
      const heap2 = BootstrappedHeap.fromArray<number>([7, 1]);
      const result = BootstrappedHeap.merge(heap1, heap2);
      result.insert(9);
      expect(heap1.size).toBe(2);
      expect(heap2.size).toBe(2);
      expect(result.size).toBe(5);
    });
  });

  describe('edge cases', () => {
    it('should handle insert after complete extraction', async () => {
      const heap = new BootstrappedHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.extractMin();
      heap.extractMin();
      expect(heap.isEmpty).toBe(true);
      heap.insert(7);
      expect(heap.peek()).toBe(7);
    });

    it('should handle clear on empty heap', async () => {
      const heap = new BootstrappedHeap<number>();
      heap.clear();
      expect(heap.isEmpty).toBe(true);
      expect(heap.size).toBe(0);
    });

    it('should handle negative numbers', async () => {
      const heap = new BootstrappedHeap<number>();
      heap.insert(-5);
      heap.insert(3);
      heap.insert(-1);
      heap.insert(0);
      expect(heap.peek()).toBe(-5);
    });

    it('should handle zero', async () => {
      const heap = new BootstrappedHeap<number>();
      heap.insert(0);
      heap.insert(0);
      heap.insert(0);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(0);
    });
  });

  describe('large datasets', () => {
    it('should handle large number of inserts', async () => {
      const heap = new BootstrappedHeap<number>();
      const count = 10000;
      for (let i = 0; i < count; i++) {
        heap.insert(Math.random() * 1000);
      }
      expect(heap.size).toBe(count);
    });

    it('should maintain heap property with large dataset', async () => {
      const heap = new BootstrappedHeap<number>();
      const values: number[] = [];
      const count = 1000;
      for (let i = 0; i < count; i++) {
        const value = Math.random() * 1000;
        values.push(value);
        heap.insert(value);
      }
      const result: number[] = [];
      while (!heap.isEmpty) {
        result.push(heap.extractMin());
      }
      const sorted = [...values].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
      expect(result).toEqual(sorted);
    });

    it('should handle large merge operation', async () => {
      const heap1 = new BootstrappedHeap<number>();
      const heap2 = new BootstrappedHeap<number>();
      const count = 5000;
      for (let i = 0; i < count; i++) {
        heap1.insert(Math.random() * 1000);
        heap2.insert(Math.random() * 1000);
      }
      heap1.merge(heap2);
      expect(heap1.size).toBe(count * 2);
      expect(heap2.isEmpty).toBe(true);
    });

    it('should create heap from large array', async () => {
      const values: number[] = [];
      const count = 10000;
      for (let i = 0; i < count; i++) {
        values.push(Math.random() * 1000);
      }
      const heap = BootstrappedHeap.fromArray<number>(values);
      expect(heap.size).toBe(count);
    });

    it('should handle large sequential extract', async () => {
      const heap = BootstrappedHeap.fromArray<number>(
        Array.from({ length: 5000 }, () => Math.random() * 1000)
      );
      const count = heap.size;
      let prev: number | null = null;
      for (let i = 0; i < count; i++) {
        const current = heap.extractMin();
        if (prev !== null) {
          expect(current >= prev).toBe(true);
        }
        prev = current;
      }
      expect(heap.isEmpty).toBe(true);
    });
  });

  describe('sequential extract', () => {
    it('should extract all elements in order', async () => {
      const heap = new BootstrappedHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      heap.insert(9);
      heap.insert(2);
      heap.insert(8);
      heap.insert(4);
      heap.insert(6);
      const result: number[] = [];
      while (!heap.isEmpty) {
        result.push(heap.extractMin());
      }
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should maintain heap structure during sequential extract', async () => {
      const heap = new BootstrappedHeap<number>();
      const values = [5, 3, 7, 1, 9, 2, 8, 4, 6];
      for (const value of values) {
        heap.insert(value);
      }
      const sorted = [...values].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
      for (let i = 0; i < sorted.length; i++) {
        expect(heap.extractMin()).toBe(sorted[i]);
        expect(heap.size).toBe(sorted.length - i - 1);
      }
      expect(heap.isEmpty).toBe(true);
    });

    it('should handle extractMin with interleaved inserts', async () => {
      const heap = new BootstrappedHeap<number>();
      heap.insert(5);
      heap.insert(3);
      expect(heap.extractMin()).toBe(3);
      heap.insert(1);
      expect(heap.extractMin()).toBe(1);
      heap.insert(7);
      heap.insert(2);
      expect(heap.extractMin()).toBe(2);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(7);
      expect(heap.isEmpty).toBe(true);
    });
  });

  describe('min-heap property', () => {
    it('should maintain min-heap property after complex operations', async () => {
      const heap = new BootstrappedHeap<number>();
      const values = [15, 3, 9, 2, 8, 7, 1, 10, 4, 6, 5, 14, 13, 11, 12];
      const nodes = [];
      for (const value of values) {
        nodes.push(heap.insert(value));
      }

      heap.delete(nodes[4]);

      const result: number[] = [];
      while (!heap.isEmpty) {
        result.push(heap.extractMin());
      }

      for (let i = 1; i < result.length; i++) {
        expect(result[i] >= result[i - 1]).toBe(true);
      }
    });
  });
});
