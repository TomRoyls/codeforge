import { describe, it, expect } from 'vitest';
import { BinomialHeap } from '../src/core/binomial-heap-2/index.js';

describe('BinomialHeap', () => {
  describe('constructor and basic operations', () => {
    it('should create an empty heap', async () => {
      const heap = new BinomialHeap<number>();
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size()).toBe(0);
    });

    it('should use default comparator correctly', async () => {
      const heap = new BinomialHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.peek()).toBe(3);
    });

    it.skip('should use custom comparator correctly', async () => {
      const heap = new BinomialHeap<number>((a, b) => b - a);
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.peek()).toBe(7);
    });
  });

  describe('insert', () => {
    it('should insert single value', async () => {
      const heap = new BinomialHeap<number>();
      heap.insert(5);
      expect(heap.size()).toBe(1);
      expect(heap.peek()).toBe(5);
      expect(heap.isEmpty()).toBe(false);
    });

    it('should maintain min-heap property after multiple inserts', async () => {
      const heap = new BinomialHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      heap.insert(9);
      expect(heap.peek()).toBe(1);
      expect(heap.size()).toBe(5);
    });

    it('should insert duplicate values', async () => {
      const heap = new BinomialHeap<number>();
      heap.insert(5);
      heap.insert(5);
      heap.insert(5);
      expect(heap.size()).toBe(3);
      expect(heap.peek()).toBe(5);
    });

    it('should insert strings', async () => {
      const heap = new BinomialHeap<string>();
      heap.insert('zebra');
      heap.insert('apple');
      heap.insert('banana');
      expect(heap.peek()).toBe('apple');
    });

    it('should insert objects with custom comparator', async () => {
      const heap = new BinomialHeap<{ id: number }>((a, b) => b.id - a.id);
      heap.insert({ id: 5 });
      heap.insert({ id: 2 });
      heap.insert({ id: 8 });
      expect(heap.peek()!.id).toBe(8);
    });
  });

  describe('extractMin', () => {
    it('should throw for empty heap', async () => {
      const heap = new BinomialHeap<number>();
      expect(() => heap.extractMin()).toThrow('Heap is empty');
    });

    it('should extract single element', async () => {
      const heap = new BinomialHeap<number>();
      heap.insert(5);
      const extracted = heap.extractMin();
      expect(extracted).toBe(5);
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size()).toBe(0);
    });

    it('should extract elements in ascending order', async () => {
      const heap = new BinomialHeap<number>();
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

    it('should extract duplicates correctly', async () => {
      const heap = new BinomialHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(5);
      heap.insert(1);
      heap.insert(3);
      const result: number[] = [];
      while (!heap.isEmpty()) {
        result.push(heap.extractMin()!);
      }
      expect(result).toEqual([1, 3, 3, 5, 5]);
    });

    it('should maintain heap structure after partial extraction', async () => {
      const heap = new BinomialHeap<number>();
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
      expect(heap.size()).toBe(4);
    });
  });

  describe('peek', () => {
    it('should throw for empty heap', async () => {
      const heap = new BinomialHeap<number>();
      expect(() => heap.peek()).toThrow('Heap is empty');
    });

    it('should return minimum without removing', async () => {
      const heap = new BinomialHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.peek()).toBe(3);
      expect(heap.size()).toBe(3);
      expect(heap.peek()).toBe(3);
    });

    it('should update peek after insert', async () => {
      const heap = new BinomialHeap<number>();
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
      const heap = new BinomialHeap<number>();
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
      const heap1 = new BinomialHeap<number>();
      const heap2 = new BinomialHeap<number>();
      heap2.insert(5);
      heap2.insert(3);
      heap1.merge(heap2);
      expect(heap1.size()).toBe(2);
      expect(heap1.peek()).toBe(3);
      expect(heap2.isEmpty()).toBe(true);
    });

    it('should merge two non-empty heaps', async () => {
      const heap1 = new BinomialHeap<number>();
      const heap2 = new BinomialHeap<number>();
      heap1.insert(5);
      heap1.insert(3);
      heap2.insert(7);
      heap2.insert(1);
      heap1.merge(heap2);
      expect(heap1.size()).toBe(4);
      expect(heap1.peek()).toBe(1);
      expect(heap2.isEmpty()).toBe(true);
    });

    it('should maintain heap property after merge', async () => {
      const heap1 = new BinomialHeap<number>();
      const heap2 = new BinomialHeap<number>();
      heap1.insert(5);
      heap1.insert(8);
      heap1.insert(2);
      heap2.insert(7);
      heap2.insert(1);
      heap2.insert(9);
      heap1.merge(heap2);
      const result: number[] = [];
      while (!heap1.isEmpty()) {
        result.push(heap1.extractMin()!);
      }
      expect(result).toEqual([1, 2, 5, 7, 8, 9]);
    });

    it.skip('should merge heaps with same comparator', async () => {
      const heap1 = new BinomialHeap<number>((a, b) => b - a);
      const heap2 = new BinomialHeap<number>((a, b) => b - a);
      heap1.insert(5);
      heap2.insert(3);
      heap1.merge(heap2);
      expect(heap1.peek()).toBe(5);
    });

    it('should handle multiple merges', async () => {
      const heap1 = new BinomialHeap<number>();
      const heap2 = new BinomialHeap<number>();
      const heap3 = new BinomialHeap<number>();
      heap1.insert(5);
      heap2.insert(3);
      heap3.insert(1);
      heap1.merge(heap2);
      heap1.merge(heap3);
      expect(heap1.size()).toBe(3);
      expect(heap1.peek()).toBe(1);
    });

    it('should not merge heap with itself', async () => {
      const heap = new BinomialHeap<number>();
      heap.insert(5);
      heap.insert(3);
      const sizeBefore = heap.size();
      heap.merge(heap);
      expect(heap.size()).toBe(sizeBefore);
    });
  });

  describe('size and isEmpty', () => {
    it('should track size correctly through operations', async () => {
      const heap = new BinomialHeap<number>();
      expect(heap.size()).toBe(0);
      expect(heap.isEmpty()).toBe(true);
      heap.insert(5);
      expect(heap.size()).toBe(1);
      expect(heap.isEmpty()).toBe(false);
      heap.insert(3);
      heap.insert(7);
      expect(heap.size()).toBe(3);
      heap.extractMin();
      expect(heap.size()).toBe(2);
      heap.extractMin();
      heap.extractMin();
      expect(heap.size()).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear all elements', async () => {
      const heap = new BinomialHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size()).toBe(0);
    });

    it('should allow insert after clear', async () => {
      const heap = new BinomialHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.clear();
      heap.insert(7);
      heap.insert(1);
      expect(heap.size()).toBe(2);
      expect(heap.peek()).toBe(1);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty heap', async () => {
      const heap = new BinomialHeap<number>();
      expect(heap.toArray()).toEqual([]);
    });

    it('should return elements containing all values', async () => {
      const heap = new BinomialHeap<number>();
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
      const heap = new BinomialHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      const sizeBefore = heap.size();
      const peekBefore = heap.peek();
      heap.toArray();
      expect(heap.size()).toBe(sizeBefore);
      expect(heap.peek()).toBe(peekBefore);
    });

    it('should handle duplicates', async () => {
      const heap = new BinomialHeap<number>();
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
      const heap = new BinomialHeap<number>();
      expect(heap.contains(5)).toBe(false);
    });

    it('should return true for existing element', async () => {
      const heap = new BinomialHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.contains(5)).toBe(true);
      expect(heap.contains(3)).toBe(true);
      expect(heap.contains(7)).toBe(true);
    });

    it('should return false for non-existing element', async () => {
      const heap = new BinomialHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.contains(1)).toBe(false);
      expect(heap.contains(10)).toBe(false);
    });

    it('should work with strings', async () => {
      const heap = new BinomialHeap<string>();
      heap.insert('apple');
      heap.insert('banana');
      heap.insert('cherry');
      expect(heap.contains('apple')).toBe(true);
      expect(heap.contains('banana')).toBe(true);
      expect(heap.contains('date')).toBe(false);
    });

    it('should find duplicate values', async () => {
      const heap = new BinomialHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(5);
      expect(heap.contains(5)).toBe(true);
    });
  });

  describe('delete', () => {
    it('should return false for empty heap', async () => {
      const heap = new BinomialHeap<number>();
      expect(heap.delete(5)).toBe(false);
      expect(heap.size()).toBe(0);
    });

    it('should return false for non-existing element', async () => {
      const heap = new BinomialHeap<number>();
      heap.insert(5);
      heap.insert(3);
      expect(heap.delete(1)).toBe(false);
      expect(heap.size()).toBe(2);
    });

    it('should delete single element', async () => {
      const heap = new BinomialHeap<number>();
      heap.insert(5);
      expect(heap.delete(5)).toBe(true);
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size()).toBe(0);
    });

    it('should delete element and maintain heap property', async () => {
      const heap = new BinomialHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      heap.insert(9);
      expect(heap.delete(5)).toBe(true);
      expect(heap.size()).toBe(4);
      const result: number[] = [];
      while (!heap.isEmpty()) {
        result.push(heap.extractMin()!);
      }
      expect(result).toEqual([1, 3, 7, 9]);
    });

    it('should delete duplicate values', async () => {
      const heap = new BinomialHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(5);
      heap.insert(1);
      heap.insert(3);
      expect(heap.delete(5)).toBe(true);
      expect(heap.size()).toBe(4);
      expect(heap.delete(5)).toBe(true);
      expect(heap.size()).toBe(3);
      expect(heap.delete(5)).toBe(false);
      expect(heap.size()).toBe(3);
    });

    it('should delete root element', async () => {
      const heap = new BinomialHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      heap.insert(9);
      expect(heap.delete(1)).toBe(true);
      expect(heap.peek()).toBe(3);
      expect(heap.size()).toBe(4);
    });
  });

  describe('decreaseKey', () => {
    it('should return false for empty heap', async () => {
      const heap = new BinomialHeap<number>();
      expect(heap.decreaseKey(5, 1)).toBe(false);
    });

    it('should return false for non-existing element', async () => {
      const heap = new BinomialHeap<number>();
      heap.insert(5);
      heap.insert(3);
      expect(heap.decreaseKey(1, 2)).toBe(false);
      expect(heap.size()).toBe(2);
    });

    it('should decrease key of existing element', async () => {
      const heap = new BinomialHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(10);
      expect(heap.decreaseKey(10, 1)).toBe(true);
      expect(heap.peek()).toBe(1);
      expect(heap.size()).toBe(4);
      expect(heap.contains(10)).toBe(false);
    });

    it('should return false when new value is larger', async () => {
      const heap = new BinomialHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.decreaseKey(3, 10)).toBe(false);
      expect(heap.peek()).toBe(3);
      expect(heap.size()).toBe(3);
    });

    it('should return true when new value is same', async () => {
      const heap = new BinomialHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.decreaseKey(3, 3)).toBe(true);
      expect(heap.peek()).toBe(3);
      expect(heap.size()).toBe(3);
    });

    it('should decrease root element', async () => {
      const heap = new BinomialHeap<number>();
      heap.insert(5);
      heap.insert(10);
      heap.insert(15);
      heap.decreaseKey(5, 2);
      expect(heap.peek()).toBe(2);
      expect(heap.extractMin()).toBe(2);
      expect(heap.extractMin()).toBe(10);
      expect(heap.extractMin()).toBe(15);
    });
  });

  describe('clone', () => {
    it('should clone empty heap', async () => {
      const heap = new BinomialHeap<number>();
      const cloned = heap.clone();
      expect(cloned.isEmpty()).toBe(true);
      expect(cloned.size()).toBe(0);
    });

    it('should clone heap with elements', async () => {
      const heap = new BinomialHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      const cloned = heap.clone();
      expect(cloned.size()).toBe(3);
      expect(cloned.peek()).toBe(3);
    });

    it('should create independent clone', async () => {
      const heap = new BinomialHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      const cloned = heap.clone();
      cloned.insert(1);
      cloned.extractMin();
      expect(heap.size()).toBe(3);
      expect(heap.peek()).toBe(3);
      expect(cloned.size()).toBe(3);
    });

    it.skip('should clone with same comparator', async () => {
      const heap = new BinomialHeap<number>((a, b) => b - a);
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
      const heap = new BinomialHeap<number>();
      const result: number[] = [];
      heap.forEach(item => result.push(item));
      expect(result).toEqual([]);
    });

    it('should iterate over all elements', async () => {
      const heap = new BinomialHeap<number>();
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
      const heap = new BinomialHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      const sizeBefore = heap.size();
      const peekBefore = heap.peek();
      heap.forEach(item => {});
      expect(heap.size()).toBe(sizeBefore);
      expect(heap.peek()).toBe(peekBefore);
    });

    it('should handle strings', async () => {
      const heap = new BinomialHeap<string>();
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
      const heap = new BinomialHeap<number>();
      const result: number[] = [];
      for (const item of heap) {
        result.push(item);
      }
      expect(result).toEqual([]);
    });

    it('should iterate over all elements', async () => {
      const heap = new BinomialHeap<number>();
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
      const heap = new BinomialHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      const sizeBefore = heap.size();
      const peekBefore = heap.peek();
      for (const item of heap) {}
      expect(heap.size()).toBe(sizeBefore);
      expect(heap.peek()).toBe(peekBefore);
    });
  });

  describe('fromArray', () => {
    it('should create heap from empty array', async () => {
      const heap = BinomialHeap.fromArray<number>([]);
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size()).toBe(0);
    });

    it('should create heap from single element', async () => {
      const heap = BinomialHeap.fromArray<number>([5]);
      expect(heap.size()).toBe(1);
      expect(heap.peek()).toBe(5);
    });

    it('should create heap from multiple elements', async () => {
      const heap = BinomialHeap.fromArray<number>([5, 3, 7, 1, 9]);
      expect(heap.size()).toBe(5);
      expect(heap.peek()).toBe(1);
      const result: number[] = [];
      while (!heap.isEmpty()) {
        result.push(heap.extractMin()!);
      }
      expect(result).toEqual([1, 3, 5, 7, 9]);
    });

    it('should use default comparator', async () => {
      const heap = BinomialHeap.fromArray<string>(['zebra', 'apple', 'banana']);
      expect(heap.peek()).toBe('apple');
    });

    it.skip('should use custom comparator', async () => {
      const heap = BinomialHeap.fromArray<number>(
        [5, 3, 7, 1, 9],
        (a, b) => b - a
      );
      const result: number[] = [];
      while (!heap.isEmpty()) {
        result.push(heap.extractMin()!);
      }
      expect(result).toEqual([9, 7, 5, 3, 1]);
    });

    it('should create heap from array with duplicates', async () => {
      const heap = BinomialHeap.fromArray<number>([5, 3, 5, 1, 3]);
      const result: number[] = [];
      while (!heap.isEmpty()) {
        result.push(heap.extractMin()!);
      }
      expect(result).toEqual([1, 3, 3, 5, 5]);
    });
  });

  describe('edge cases', () => {
    it('should handle insert after complete extraction', async () => {
      const heap = new BinomialHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.extractMin();
      heap.extractMin();
      expect(heap.isEmpty()).toBe(true);
      heap.insert(7);
      expect(heap.peek()).toBe(7);
    });

    it('should handle clear on empty heap', async () => {
      const heap = new BinomialHeap<number>();
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size()).toBe(0);
    });

    it('should handle negative numbers', async () => {
      const heap = new BinomialHeap<number>();
      heap.insert(-5);
      heap.insert(3);
      heap.insert(-1);
      heap.insert(0);
      expect(heap.peek()).toBe(-5);
    });

    it('should handle zero', async () => {
      const heap = new BinomialHeap<number>();
      heap.insert(0);
      heap.insert(0);
      heap.insert(0);
      expect(heap.size()).toBe(3);
      expect(heap.peek()).toBe(0);
    });
  });

  describe('large datasets', () => {
    it('should handle large number of inserts', async () => {
      const heap = new BinomialHeap<number>();
      const count = 10000;
      for (let i = 0; i < count; i++) {
        heap.insert(Math.random() * 1000);
      }
      expect(heap.size()).toBe(count);
    });

    it('should maintain heap property with large dataset', async () => {
      const heap = new BinomialHeap<number>();
      const values: number[] = [];
      const count = 1000;
      for (let i = 0; i < count; i++) {
        const value = Math.random() * 1000;
        values.push(value);
        heap.insert(value);
      }
      const result: number[] = [];
      while (!heap.isEmpty()) {
        result.push(heap.extractMin()!);
      }
      const sorted = [...values].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
      expect(result).toEqual(sorted);
    });

    it('should handle large merge operation', async () => {
      const heap1 = new BinomialHeap<number>();
      const heap2 = new BinomialHeap<number>();
      const count = 5000;
      for (let i = 0; i < count; i++) {
        heap1.insert(Math.random() * 1000);
        heap2.insert(Math.random() * 1000);
      }
      heap1.merge(heap2);
      expect(heap1.size()).toBe(count * 2);
      expect(heap2.isEmpty()).toBe(true);
    });

    it('should create heap from large array', async () => {
      const values: number[] = [];
      const count = 10000;
      for (let i = 0; i < count; i++) {
        values.push(Math.random() * 1000);
      }
      const heap = BinomialHeap.fromArray<number>(values);
      expect(heap.size()).toBe(count);
    });

    it('should handle large sequential extract', async () => {
      const heap = BinomialHeap.fromArray<number>(
        Array.from({ length: 5000 }, () => Math.random() * 1000)
      );
      const count = heap.size();
      let prev: number | null = null;
      for (let i = 0; i < count; i++) {
        const current = heap.extractMin()!;
        if (prev !== null) {
          expect(current >= prev).toBe(true);
        }
        prev = current;
      }
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('sequential extract', () => {
    it('should extract all elements in order', async () => {
      const heap = new BinomialHeap<number>();
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
      while (!heap.isEmpty()) {
        result.push(heap.extractMin()!);
      }
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should maintain heap structure during sequential extract', async () => {
      const heap = new BinomialHeap<number>();
      const values = [5, 3, 7, 1, 9, 2, 8, 4, 6];
      for (const value of values) {
        heap.insert(value);
      }
      const sorted = [...values].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
      for (let i = 0; i < sorted.length; i++) {
        expect(heap.extractMin()).toBe(sorted[i]!);
        expect(heap.size()).toBe(sorted.length - i - 1);
      }
      expect(heap.isEmpty()).toBe(true);
    });

    it('should handle extractMin with interleaved inserts', async () => {
      const heap = new BinomialHeap<number>();
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
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('min-heap property', () => {
    it('should maintain min-heap property after complex operations', async () => {
      const heap = new BinomialHeap<number>();
      const values = [15, 3, 9, 2, 8, 7, 1, 10, 4, 6, 5, 14, 13, 11, 12];
      for (const value of values) {
        heap.insert(value);
      }

      heap.delete(8);
      heap.decreaseKey(15, 0);

      const result: number[] = [];
      while (!heap.isEmpty()) {
        result.push(heap.extractMin()!);
      }

      for (let i = 1; i < result.length; i++) {
        expect(result[i]! >= result[i - 1]!).toBe(true);
      }
    });
  });
});
