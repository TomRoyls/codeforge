import { describe, it, expect } from 'vitest';
import { GallopingHeap, GallopingHeapNode } from '../src/core/galloping-heap/index.js';

describe('GallopingHeap', () => {
  describe('constructor', () => {
    it.skip('should create empty heap', () => {
      const heap = new GallopingHeap<number>();
      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should accept capacity option', () => {
      const heap = new GallopingHeap<number>({ capacity: 5 });
      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should accept zero capacity', () => {
      const heap = new GallopingHeap<number>({ capacity: 0 });
      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('insert', () => {
    it('should insert single element', () => {
      const heap = new GallopingHeap<number>();
      const node = heap.insert(5);
      expect(heap.size).toBe(1);
      expect(heap.isEmpty()).toBe(false);
      expect(node.value).toBe(5);
    });

    it('should insert multiple elements', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.size).toBe(3);
    });

    it('should maintain min on insert', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(5);
      expect(heap.peek()).toBe(5);
      heap.insert(3);
      expect(heap.peek()).toBe(3);
      heap.insert(7);
      expect(heap.peek()).toBe(3);
      heap.insert(1);
      expect(heap.peek()).toBe(1);
    });

    it('should handle negative values', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(-5);
      heap.insert(-10);
      heap.insert(3);
      expect(heap.peek()).toBe(-10);
    });

    it('should handle zero', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(0);
      expect(heap.peek()).toBe(0);
    });

    it('should handle duplicate values', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(5);
      heap.insert(5);
      heap.insert(5);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(5);
    });

    it('should return node with correct properties', () => {
      const heap = new GallopingHeap<number>();
      const node = heap.insert(5);
      expect(node.value).toBe(5);
      expect(node.children).toEqual([]);
    });

    it('should throw when at capacity', () => {
      const heap = new GallopingHeap<number>({ capacity: 2 });
      heap.insert(1);
      heap.insert(2);
      expect(() => heap.insert(3)).toThrow('Heap is at capacity');
    });

    it('should throw exactly at capacity', () => {
      const heap = new GallopingHeap<number>({ capacity: 1 });
      heap.insert(1);
      expect(() => heap.insert(2)).toThrow('Heap is at capacity');
    });

    it('should insert strings', () => {
      const heap = new GallopingHeap<string>();
      heap.insert('zebra');
      heap.insert('apple');
      heap.insert('banana');
      expect(heap.peek()).toBe('apple');
    });
  });

  describe('extractMin', () => {
    it('should return undefined for empty heap', () => {
      const heap = new GallopingHeap<number>();
      expect(heap.extractMin()).toBe(undefined);
    });

    it('should extract single element', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(10);
      const result = heap.extractMin();
      expect(result).toBe(10);
      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should extract min from two elements', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(5);
      heap.insert(3);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(5);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should extract in sorted order', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      heap.insert(4);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(4);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(7);
    });

    it('should update size after extraction', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.extractMin();
      expect(heap.size).toBe(2);
      heap.extractMin();
      expect(heap.size).toBe(1);
    });

    it('should handle extract after many inserts', () => {
      const heap = new GallopingHeap<number>();
      for (let i = 50; i >= 1; i--) {
        heap.insert(i);
      }
      for (let i = 1; i <= 50; i++) {
        expect(heap.extractMin()).toBe(i);
      }
      expect(heap.isEmpty()).toBe(true);
    });

    it('should handle alternating insert and extract', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(5);
      heap.insert(3);
      expect(heap.extractMin()).toBe(3);
      heap.insert(1);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(5);
    });

    it('should handle duplicate values extraction', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(1);
      heap.insert(1);
      heap.insert(1);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(1);
    });

    it('should return undefined on repeated empty extract', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(1);
      heap.extractMin();
      expect(heap.extractMin()).toBe(undefined);
      expect(heap.extractMin()).toBe(undefined);
    });
  });

  describe('peek', () => {
    it('should return undefined for empty heap', () => {
      const heap = new GallopingHeap<number>();
      expect(heap.peek()).toBe(undefined);
    });

    it('should return min without removing', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.peek()).toBe(3);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(3);
    });

    it('should update after insert', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(10);
      expect(heap.peek()).toBe(10);
      heap.insert(5);
      expect(heap.peek()).toBe(5);
    });

    it('should update after extractMin', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      expect(heap.peek()).toBe(1);
      heap.extractMin();
      expect(heap.peek()).toBe(2);
    });

    it('should return undefined on empty after clear', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.clear();
      expect(heap.peek()).toBe(undefined);
    });
  });

  describe('merge', () => {
    it('should merge empty heap with non-empty', () => {
      const heap1 = new GallopingHeap<number>();
      const heap2 = new GallopingHeap<number>();
      heap2.insert(1);
      heap1.merge(heap2);
      expect(heap1.size).toBe(1);
      expect(heap1.peek()).toBe(1);
    });

    it('should merge non-empty with empty', () => {
      const heap1 = new GallopingHeap<number>();
      const heap2 = new GallopingHeap<number>();
      heap1.insert(1);
      heap1.merge(heap2);
      expect(heap1.size).toBe(1);
    });

    it('should merge two empty heaps', () => {
      const heap1 = new GallopingHeap<number>();
      const heap2 = new GallopingHeap<number>();
      heap1.merge(heap2);
      expect(heap1.size).toBe(0);
      expect(heap1.isEmpty()).toBe(true);
    });

    it('should merge two non-empty heaps', () => {
      const heap1 = new GallopingHeap<number>();
      const heap2 = new GallopingHeap<number>();
      heap1.insert(5);
      heap1.insert(10);
      heap2.insert(3);
      heap2.insert(7);
      heap1.merge(heap2);
      expect(heap1.size).toBe(4);
      expect(heap1.peek()).toBe(3);
      expect(heap2.isEmpty()).toBe(true);
    });

    it.skip('should not merge with itself', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(1);
      heap.insert(2);
      const sizeBefore = heap.size;
      heap.merge(heap);
      expect(heap.size).toBe(sizeBefore);
    });

    it('should extract in order after merge', () => {
      const heap1 = new GallopingHeap<number>();
      const heap2 = new GallopingHeap<number>();
      heap1.insert(5);
      heap1.insert(1);
      heap2.insert(3);
      heap2.insert(2);
      heap2.insert(4);
      heap1.merge(heap2);
      expect(heap1.extractMin()).toBe(1);
      expect(heap1.extractMin()).toBe(2);
      expect(heap1.extractMin()).toBe(3);
      expect(heap1.extractMin()).toBe(4);
      expect(heap1.extractMin()).toBe(5);
    });

    it('should clear other heap after merge', () => {
      const heap1 = new GallopingHeap<number>();
      const heap2 = new GallopingHeap<number>();
      heap1.insert(1);
      heap2.insert(2);
      heap1.merge(heap2);
      expect(heap2.size).toBe(0);
      expect(heap2.isEmpty()).toBe(true);
    });

    it('should respect capacity after merge', () => {
      const heap1 = new GallopingHeap<number>({ capacity: 3 });
      const heap2 = new GallopingHeap<number>();
      heap1.insert(1);
      heap1.insert(2);
      heap2.insert(3);
      heap2.insert(4);
      heap1.merge(heap2);
      expect(heap1.size).toBe(3);
    });

    it('should merge with capacity heap', () => {
      const heap1 = new GallopingHeap<number>();
      const heap2 = new GallopingHeap<number>({ capacity: 5 });
      heap1.insert(1);
      heap1.insert(2);
      heap2.insert(3);
      heap2.insert(4);
      heap1.merge(heap2);
      expect(heap1.size).toBe(4);
      expect(heap1.peek()).toBe(1);
    });
  });

  describe('decreaseKey', () => {
    it('should throw on empty heap', () => {
      const heap = new GallopingHeap<number>();
      const node = heap.insert(5);
      heap.clear();
      expect(() => heap.decreaseKey(node, 1)).toThrow('Heap is empty');
    });

    it('should decrease key of node', () => {
      const heap = new GallopingHeap<number>();
      const node = heap.insert(5);
      heap.insert(3);
      heap.decreaseKey(node, 1);
      expect(heap.peek()).toBe(1);
    });

    it('should handle decrease to same value', () => {
      const heap = new GallopingHeap<number>();
      const node = heap.insert(5);
      heap.decreaseKey(node, 5);
      expect(heap.peek()).toBe(5);
    });

    it('should update min after decrease', () => {
      const heap = new GallopingHeap<number>();
      const node = heap.insert(10);
      heap.insert(20);
      heap.decreaseKey(node, 5);
      expect(heap.peek()).toBe(5);
    });

    it('should handle multiple decreases', () => {
      const heap = new GallopingHeap<number>();
      const node = heap.insert(100);
      heap.decreaseKey(node, 50);
      expect(heap.peek()).toBe(50);
      heap.decreaseKey(node, 25);
      expect(heap.peek()).toBe(25);
      heap.decreaseKey(node, 5);
      expect(heap.peek()).toBe(5);
    });

    it('should handle decrease of non-min node', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(1);
      const node = heap.insert(10);
      heap.insert(5);
      heap.decreaseKey(node, 3);
      expect(heap.peek()).toBe(1);
      expect(heap.extractMin()).toBe(1);
      expect(heap.peek()).toBe(3);
    });

    it('should throw on empty heap', () => {
      const heap = new GallopingHeap<number>();
      const node = heap.insert(5);
      heap.clear();
      expect(() => heap.decreaseKey(node, 1)).toThrow('Heap is empty');
    });

    it('should decrease key of node', () => {
      const heap = new GallopingHeap<number>();
      const node = heap.insert(5);
      heap.insert(3);
      heap.decreaseKey(node, 1);
      expect(heap.peek()).toBe(1);
    });

    it('should allow increase', () => {
      const heap = new GallopingHeap<number>();
      const node = heap.insert(5);
      heap.insert(10);
      heap.decreaseKey(node, 7);
      expect(heap.peek()).toBe(7);
    });

    it('should handle decrease after extract', () => {
      const heap = new GallopingHeap<number>();
      const node1 = heap.insert(10);
      const node2 = heap.insert(20);
      heap.insert(5);
      heap.extractMin();
      heap.decreaseKey(node2, 1);
      expect(heap.peek()).toBe(1);
    });

    it('should maintain heap size', () => {
      const heap = new GallopingHeap<number>();
      const node = heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      const sizeBefore = heap.size;
      heap.decreaseKey(node, 1);
      expect(heap.size).toBe(sizeBefore);
    });
  });

  describe('delete', () => {
    it('should do nothing on empty heap', () => {
      const heap = new GallopingHeap<number>();
      const node = heap.insert(5);
      heap.clear();
      expect(() => heap.delete(node)).not.toThrow();
      expect(heap.size).toBe(0);
    });

    it('should delete node from heap', () => {
      const heap = new GallopingHeap<number>();
      const node1 = heap.insert(5);
      const node2 = heap.insert(10);
      const node3 = heap.insert(15);
      heap.delete(node2);
      expect(heap.size).toBe(2);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(15);
    });

    it('should delete min node', () => {
      const heap = new GallopingHeap<number>();
      const node1 = heap.insert(5);
      heap.insert(10);
      heap.insert(15);
      heap.delete(node1);
      expect(heap.peek()).toBe(10);
    });

    it('should delete last node', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(5);
      heap.insert(10);
      const node3 = heap.insert(15);
      heap.delete(node3);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(10);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should handle delete on single node', () => {
      const heap = new GallopingHeap<number>();
      const node = heap.insert(5);
      heap.delete(node);
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size).toBe(0);
    });

    it('should delete multiple nodes', () => {
      const heap = new GallopingHeap<number>();
      const node1 = heap.insert(10);
      const node2 = heap.insert(20);
      const node3 = heap.insert(30);
      heap.delete(node2);
      heap.delete(node1);
      expect(heap.extractMin()).toBe(30);
    });

    it('should handle duplicate values', () => {
      const heap = new GallopingHeap<number>();
      const node1 = heap.insert(5);
      const node2 = heap.insert(5);
      const node3 = heap.insert(5);
      heap.delete(node2);
      expect(heap.size).toBe(2);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(5);
    });

    it('should handle delete of non-existent node', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(5);
      heap.insert(10);
      heap.insert(15);
      heap.delete(heap.insert(20));
      expect(heap.size).toBe(3);
    });

    it('should update heap property after delete', () => {
      const heap = new GallopingHeap<number>();
      const node1 = heap.insert(1);
      const node2 = heap.insert(10);
      const node3 = heap.insert(20);
      const node4 = heap.insert(30);
      const node5 = heap.insert(40);
      heap.delete(node3);
      heap.delete(node1);
      expect(heap.peek()).toBe(10);
      expect(heap.extractMin()).toBe(10);
      expect(heap.extractMin()).toBe(30);
      expect(heap.extractMin()).toBe(40);
    });
  });

  describe('size getter', () => {
    it('should return 0 on empty heap', () => {
      const heap = new GallopingHeap<number>();
      expect(heap.size).toBe(0);
    });

    it('should return 1 after single insert', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(1);
      expect(heap.size).toBe(1);
    });

    it('should return correct size after multiple inserts', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      expect(heap.size).toBe(3);
    });

    it('should decrease after extractMin', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.extractMin();
      expect(heap.size).toBe(2);
    });

    it('should return 0 after clear', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.clear();
      expect(heap.size).toBe(0);
    });

    it('should decrease after delete', () => {
      const heap = new GallopingHeap<number>();
      const node = heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.delete(node);
      expect(heap.size).toBe(2);
    });

    it('should update after merge', () => {
      const heap1 = new GallopingHeap<number>();
      const heap2 = new GallopingHeap<number>();
      heap1.insert(1);
      heap1.insert(2);
      heap2.insert(3);
      heap2.insert(4);
      heap1.merge(heap2);
      expect(heap1.size).toBe(4);
    });
  });

  describe('isEmpty', () => {
    it('should return true on new heap', () => {
      const heap = new GallopingHeap<number>();
      expect(heap.isEmpty()).toBe(true);
    });

    it('should return false after insert', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(1);
      expect(heap.isEmpty()).toBe(false);
    });

    it('should return true after all elements extracted', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.extractMin();
      heap.extractMin();
      expect(heap.isEmpty()).toBe(true);
    });

    it('should return true after clear', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(1);
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
    });

    it('should return false after delete of non-last element', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(1);
      const node = heap.insert(2);
      heap.insert(3);
      heap.delete(node);
      expect(heap.isEmpty()).toBe(false);
    });
  });

  describe('clear', () => {
    it('should empty non-empty heap', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.clear();
      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should clear heap with one element', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(1);
      heap.clear();
      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should allow reuse after clear', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(1);
      heap.clear();
      heap.insert(5);
      expect(heap.size).toBe(1);
      expect(heap.peek()).toBe(5);
    });

    it('should handle clear on already empty heap', () => {
      const heap = new GallopingHeap<number>();
      heap.clear();
      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should reset peek after clear', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.clear();
      expect(heap.peek()).toBe(undefined);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty heap', () => {
      const heap = new GallopingHeap<number>();
      expect(heap.toArray()).toEqual([]);
    });

    it('should return all elements', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      const arr = heap.toArray();
      expect(arr.length).toBe(3);
    });

    it('should contain all inserted values', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(10);
      heap.insert(20);
      heap.insert(30);
      const arr = heap.toArray();
      expect(arr).toContain(10);
      expect(arr).toContain(20);
      expect(arr).toContain(30);
    });

    it('should return correct count after operations', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.extractMin();
      expect(heap.toArray().length).toBe(2);
    });

    it('should not modify heap', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      const sizeBefore = heap.size;
      const peekBefore = heap.peek();
      heap.toArray();
      expect(heap.size).toBe(sizeBefore);
      expect(heap.peek()).toBe(peekBefore);
    });

    it('should handle duplicates', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(5);
      heap.insert(1);
      heap.insert(3);
      const arr = heap.toArray();
      expect(arr.length).toBe(5);
      expect(arr.filter(x => x === 1).length).toBe(1);
      expect(arr.filter(x => x === 3).length).toBe(2);
      expect(arr.filter(x => x === 5).length).toBe(2);
    });

    it('should handle strings', () => {
      const heap = new GallopingHeap<string>();
      heap.insert('banana');
      heap.insert('apple');
      heap.insert('cherry');
      const arr = heap.toArray();
      expect(arr.length).toBe(3);
      expect(arr).toContain('apple');
      expect(arr).toContain('banana');
      expect(arr).toContain('cherry');
    });
  });

  describe('forEach', () => {
    it('should iterate over empty heap', () => {
      const heap = new GallopingHeap<number>();
      let count = 0;
      heap.forEach(() => count++);
      expect(count).toBe(0);
    });

    it('should iterate over all elements', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      const values: number[] = [];
      heap.forEach((v) => values.push(v));
      expect(values.length).toBe(3);
      expect(values).toContain(1);
      expect(values).toContain(2);
      expect(values).toContain(3);
    });

    it('should not modify heap', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      const sizeBefore = heap.size;
      heap.forEach(() => {});
      expect(heap.size).toBe(sizeBefore);
    });

    it('should provide correct values', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      heap.insert(9);
      const values: number[] = [];
      heap.forEach((v) => values.push(v));
      expect(values.length).toBe(5);
      expect(values).toContain(5);
      expect(values).toContain(3);
      expect(values).toContain(7);
      expect(values).toContain(1);
      expect(values).toContain(9);
    });

    it('should handle strings', () => {
      const heap = new GallopingHeap<string>();
      heap.insert('apple');
      heap.insert('banana');
      heap.insert('cherry');
      const values: string[] = [];
      heap.forEach((v) => values.push(v));
      expect(values.length).toBe(3);
      expect(values).toContain('apple');
      expect(values).toContain('banana');
      expect(values).toContain('cherry');
    });
  });

  describe('edge cases', () => {
    it('should handle interleaved operations', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.extractMin();
      heap.insert(1);
      heap.insert(7);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(7);
    });

    it('should handle large range of values', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(-100);
      heap.insert(0);
      heap.insert(100);
      expect(heap.extractMin()).toBe(-100);
      expect(heap.extractMin()).toBe(0);
      expect(heap.extractMin()).toBe(100);
    });

    it('should handle negative values extraction', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(-3);
      heap.insert(-1);
      heap.insert(-5);
      expect(heap.extractMin()).toBe(-5);
      expect(heap.extractMin()).toBe(-3);
      expect(heap.extractMin()).toBe(-1);
    });

    it('should handle floating point values', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(3.14);
      heap.insert(2.71);
      heap.insert(1.41);
      expect(heap.peek()).toBeCloseTo(1.41, 2);
      expect(heap.extractMin()).toBeCloseTo(1.41, 2);
    });

    it('should handle mixed positive and negative', () => {
      const heap = new GallopingHeap<number>();
      heap.insert(-10);
      heap.insert(5);
      heap.insert(-3);
      heap.insert(8);
      heap.insert(0);
      expect(heap.peek()).toBe(-10);
    });
  });

  describe('complex operations', () => {
    it('should handle insert-delete-insert sequence', () => {
      const heap = new GallopingHeap<number>();
      const node1 = heap.insert(10);
      const node2 = heap.insert(20);
      const node3 = heap.insert(30);
      heap.delete(node2);
      heap.insert(5);
      heap.insert(15);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(10);
      expect(heap.extractMin()).toBe(15);
      expect(heap.extractMin()).toBe(30);
    });

    it('should handle decrease after multiple extracts', () => {
      const heap = new GallopingHeap<number>();
      const node1 = heap.insert(100);
      const node2 = heap.insert(200);
      const node3 = heap.insert(50);
      heap.insert(75);
      heap.extractMin();
      heap.extractMin();
      heap.decreaseKey(node2, 25);
      expect(heap.peek()).toBe(25);
    });

    it('should handle merge after operations', () => {
      const heap1 = new GallopingHeap<number>();
      const heap2 = new GallopingHeap<number>();
      heap1.insert(10);
      heap1.insert(5);
      heap1.extractMin();
      heap2.insert(3);
      heap2.insert(7);
      heap1.merge(heap2);
      expect(heap1.size).toBe(3);
      expect(heap1.peek()).toBe(3);
    });
  });

  describe('capacity behavior', () => {
    it('should prevent insert at capacity', () => {
      const heap = new GallopingHeap<number>({ capacity: 3 });
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      expect(() => heap.insert(4)).toThrow('Heap is at capacity');
    });

    it('should allow insert after extract at capacity', () => {
      const heap = new GallopingHeap<number>({ capacity: 2 });
      heap.insert(1);
      heap.insert(2);
      heap.extractMin();
      heap.insert(3);
      expect(heap.size).toBe(2);
      expect(heap.peek()).toBe(2);
    });

    it('should allow insert after delete at capacity', () => {
      const heap = new GallopingHeap<number>({ capacity: 3 });
      const node1 = heap.insert(1);
      const node2 = heap.insert(2);
      const node3 = heap.insert(3);
      heap.delete(node2);
      heap.insert(4);
      expect(heap.size).toBe(3);
    });

    it('should respect capacity on merge', () => {
      const heap1 = new GallopingHeap<number>({ capacity: 3 });
      const heap2 = new GallopingHeap<number>();
      heap1.insert(1);
      heap1.insert(2);
      heap2.insert(3);
      heap2.insert(4);
      heap2.insert(5);
      heap1.merge(heap2);
      expect(heap1.size).toBe(3);
    });
  });

  describe('stress tests', () => {
    it('should handle 1000 elements', () => {
      const heap = new GallopingHeap<number>();
      for (let i = 1000; i >= 1; i--) {
        heap.insert(i);
      }
      expect(heap.size).toBe(1000);
      for (let i = 1; i <= 1000; i++) {
        expect(heap.extractMin()).toBe(i);
      }
      expect(heap.isEmpty()).toBe(true);
    });

    it('should handle 1000 random elements', () => {
      const heap = new GallopingHeap<number>();
      const values: number[] = [];
      for (let i = 0; i < 1000; i++) {
        const v = Math.floor(Math.random() * 10000);
        values.push(v);
        heap.insert(v);
      }
      values.sort((a, b) => a - b);
      for (let i = 0; i < 1000; i++) {
        expect(heap.extractMin()).toBe(values[i]);
      }
    });

    it('should handle many alternating operations', () => {
      const heap = new GallopingHeap<number>();
      const count = 100;
      for (let i = 0; i < count; i++) {
        heap.insert(i);
      }
      for (let i = 0; i < count / 2; i++) {
        heap.extractMin();
        heap.insert(count + i);
      }
      expect(heap.size).toBe(count);
    });

    it('should handle large number of merges', () => {
      const heap1 = new GallopingHeap<number>();
      const heap2 = new GallopingHeap<number>();
      for (let i = 0; i < 500; i++) {
        heap1.insert(i);
        heap2.insert(i + 500);
      }
      heap1.merge(heap2);
      expect(heap1.size).toBe(1000);
      for (let i = 0; i < 1000; i++) {
        expect(heap1.extractMin()).toBe(i);
      }
    });
  });

  describe('GallopingHeapNode', () => {
    it('should have value property', () => {
      const heap = new GallopingHeap<number>();
      const node = heap.insert(42);
      expect(node.value).toBe(42);
    });

    it('should have children array', () => {
      const heap = new GallopingHeap<number>();
      const node = heap.insert(5);
      expect(Array.isArray(node.children)).toBe(true);
    });

    it('should start with empty children', () => {
      const heap = new GallopingHeap<number>();
      const node = heap.insert(5);
      expect(node.children.length).toBe(0);
    });
  });
});
