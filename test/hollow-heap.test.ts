import { describe, it, expect } from 'vitest';
import { HollowHeap } from '../src/core/hollow-heap/index.js';

describe('HollowHeap', () => {
  describe('constructor', () => {
    it('should create empty heap', () => {
      const heap = new HollowHeap<number>();
      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should accept custom comparator', () => {
      const heap = new HollowHeap<number>({ comparator: (a, b) => b - a });
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      expect(heap.peek()).toBe(3);
    });

    it('should use default comparator for numbers', () => {
      const heap = new HollowHeap<number>();
      heap.insert(3);
      heap.insert(1);
      heap.insert(2);
      expect(heap.peek()).toBe(1);
    });

    it('should work with strings using default comparator', () => {
      const heap = new HollowHeap<string>();
      heap.insert('zebra');
      heap.insert('apple');
      heap.insert('banana');
      expect(heap.peek()).toBe('apple');
    });
  });

  describe('insert', () => {
    it('should insert single element', () => {
      const heap = new HollowHeap<number>();
      const node = heap.insert(5);
      expect(heap.size).toBe(1);
      expect(heap.isEmpty()).toBe(false);
      expect(node.value).toBe(5);
    });

    it('should insert multiple elements', () => {
      const heap = new HollowHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.size).toBe(3);
    });

    it('should maintain min on insert', () => {
      const heap = new HollowHeap<number>();
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
      const heap = new HollowHeap<number>();
      heap.insert(-5);
      heap.insert(-10);
      heap.insert(3);
      expect(heap.peek()).toBe(-10);
    });

    it('should handle zero', () => {
      const heap = new HollowHeap<number>();
      heap.insert(0);
      expect(heap.peek()).toBe(0);
    });

    it('should handle duplicate values', () => {
      const heap = new HollowHeap<number>();
      heap.insert(5);
      heap.insert(5);
      heap.insert(5);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(5);
    });

    it('should handle floating point values', () => {
      const heap = new HollowHeap<number>();
      heap.insert(3.14);
      heap.insert(2.71);
      expect(heap.peek()).toBeCloseTo(2.71);
    });

    it('should return node with correct properties', () => {
      const heap = new HollowHeap<number>();
      const node = heap.insert(5);
      expect(node.value).toBe(5);
      expect(node.rank).toBe(0);
      expect(node.children).toEqual([]);
      expect(node.next).toBe(null);
      expect(node.isHollow).toBe(false);
    });
  });

  describe('extractMin', () => {
    it('should return undefined on empty heap', () => {
      const heap = new HollowHeap<number>();
      expect(heap.extractMin()).toBe(undefined);
    });

    it('should extract single element', () => {
      const heap = new HollowHeap<number>();
      heap.insert(10);
      const result = heap.extractMin();
      expect(result).toBe(10);
      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should extract min from two elements', () => {
      const heap = new HollowHeap<number>();
      heap.insert(5);
      heap.insert(3);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(5);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should extract in sorted order', () => {
      const heap = new HollowHeap<number>();
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
      const heap = new HollowHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.extractMin();
      expect(heap.size).toBe(2);
      heap.extractMin();
      expect(heap.size).toBe(1);
    });

    it('should handle extract after many inserts', () => {
      const heap = new HollowHeap<number>();
      for (let i = 50; i >= 1; i--) {
        heap.insert(i);
      }
      for (let i = 1; i <= 50; i++) {
        expect(heap.extractMin()).toBe(i);
      }
      expect(heap.isEmpty()).toBe(true);
    });

    it('should handle alternating insert and extract', () => {
      const heap = new HollowHeap<number>();
      heap.insert(5);
      heap.insert(3);
      expect(heap.extractMin()).toBe(3);
      heap.insert(1);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(5);
    });

    it('should handle duplicate values extraction', () => {
      const heap = new HollowHeap<number>();
      heap.insert(1);
      heap.insert(1);
      heap.insert(1);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(1);
    });
  });

  describe('peek', () => {
    it('should return undefined on empty heap', () => {
      const heap = new HollowHeap<number>();
      expect(heap.peek()).toBe(undefined);
    });

    it('should return min without removing', () => {
      const heap = new HollowHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.peek()).toBe(3);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(3);
    });

    it('should update after insert', () => {
      const heap = new HollowHeap<number>();
      heap.insert(10);
      expect(heap.peek()).toBe(10);
      heap.insert(5);
      expect(heap.peek()).toBe(5);
    });

    it('should update after extractMin', () => {
      const heap = new HollowHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      expect(heap.peek()).toBe(1);
      heap.extractMin();
      expect(heap.peek()).toBe(2);
    });
  });

  describe('meld', () => {
    it('should merge two non-empty heaps', () => {
      const heap1 = new HollowHeap<number>();
      const heap2 = new HollowHeap<number>();
      heap1.insert(5);
      heap1.insert(10);
      heap2.insert(3);
      heap2.insert(7);
      heap1.meld(heap2);
      expect(heap1.size).toBe(4);
      expect(heap1.peek()).toBe(3);
      expect(heap2.isEmpty()).toBe(true);
      expect(heap2.size).toBe(0);
    });

    it('should merge empty with non-empty', () => {
      const heap1 = new HollowHeap<number>();
      const heap2 = new HollowHeap<number>();
      heap2.insert(1);
      heap1.meld(heap2);
      expect(heap1.size).toBe(1);
      expect(heap1.peek()).toBe(1);
      expect(heap2.isEmpty()).toBe(true);
    });

    it('should merge non-empty with empty', () => {
      const heap1 = new HollowHeap<number>();
      const heap2 = new HollowHeap<number>();
      heap1.insert(1);
      heap1.meld(heap2);
      expect(heap1.size).toBe(1);
      expect(heap2.isEmpty()).toBe(true);
    });

    it('should merge two empty heaps', () => {
      const heap1 = new HollowHeap<number>();
      const heap2 = new HollowHeap<number>();
      heap1.meld(heap2);
      expect(heap1.size).toBe(0);
      expect(heap1.isEmpty()).toBe(true);
    });

    it('should extract in order after meld', () => {
      const heap1 = new HollowHeap<number>();
      const heap2 = new HollowHeap<number>();
      heap1.insert(5);
      heap1.insert(1);
      heap2.insert(3);
      heap2.insert(2);
      heap2.insert(4);
      heap1.meld(heap2);
      expect(heap1.extractMin()).toBe(1);
      expect(heap1.extractMin()).toBe(2);
      expect(heap1.extractMin()).toBe(3);
      expect(heap1.extractMin()).toBe(4);
      expect(heap1.extractMin()).toBe(5);
    });

    it('should clear other heap after meld', () => {
      const heap1 = new HollowHeap<number>();
      const heap2 = new HollowHeap<number>();
      heap1.insert(1);
      heap2.insert(2);
      heap1.meld(heap2);
      expect(heap2.size).toBe(0);
      expect(heap2.isEmpty()).toBe(true);
    });
  });

  describe('decreaseKey', () => {
    it('should decrease key of node', () => {
      const heap = new HollowHeap<number>();
      const node = heap.insert(5);
      heap.insert(3);
      heap.decreaseKey(node, 1);
      expect(heap.peek()).toBe(1);
    });

    it('should throw if new value is greater', () => {
      const heap = new HollowHeap<number>();
      const node = heap.insert(3);
      expect(() => heap.decreaseKey(node, 10)).toThrow('New value must be less than or equal to current value');
    });

    it('should allow same value', () => {
      const heap = new HollowHeap<number>();
      const node = heap.insert(5);
      heap.decreaseKey(node, 5);
      expect(heap.peek()).toBe(5);
    });

    it('should update min after decrease', () => {
      const heap = new HollowHeap<number>();
      const node = heap.insert(10);
      heap.insert(20);
      heap.decreaseKey(node, 5);
      expect(heap.peek()).toBe(5);
    });

    it('should handle multiple decreases', () => {
      const heap = new HollowHeap<number>();
      const node = heap.insert(100);
      heap.decreaseKey(node, 50);
      expect(heap.peek()).toBe(50);
      heap.decreaseKey(node, 25);
      expect(heap.peek()).toBe(25);
      heap.decreaseKey(node, 5);
      expect(heap.peek()).toBe(5);
    });

    it('should throw if node is hollow', () => {
      const heap = new HollowHeap<number>();
      const node = heap.insert(5);
      heap.insert(10);
      heap.decreaseKey(node, 1);
      heap.extractMin();
      expect(() => heap.decreaseKey(node, 0)).toThrow('Node has already been deleted');
    });
  });

  describe('delete', () => {
    it('should delete node from heap', () => {
      const heap = new HollowHeap<number>();
      const node1 = heap.insert(5);
      const node2 = heap.insert(10);
      const node3 = heap.insert(15);
      heap.delete(node2);
      expect(heap.size).toBe(2);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(15);
    });

    it('should delete min node', () => {
      const heap = new HollowHeap<number>();
      const node1 = heap.insert(5);
      heap.insert(10);
      heap.insert(15);
      heap.delete(node1);
      expect(heap.peek()).toBe(10);
    });

    it('should delete last node', () => {
      const heap = new HollowHeap<number>();
      heap.insert(5);
      heap.insert(10);
      const node3 = heap.insert(15);
      heap.delete(node3);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(10);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should handle delete on single node', () => {
      const heap = new HollowHeap<number>();
      const node = heap.insert(5);
      heap.delete(node);
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size).toBe(0);
    });

    it('should delete multiple nodes', () => {
      const heap = new HollowHeap<number>();
      const node1 = heap.insert(10);
      const node2 = heap.insert(20);
      const node3 = heap.insert(30);
      heap.delete(node2);
      heap.delete(node1);
      expect(heap.extractMin()).toBe(30);
    });

    it('should not throw on deleting already hollow node', () => {
      const heap = new HollowHeap<number>();
      const node = heap.insert(5);
      heap.insert(10);
      heap.delete(node);
      heap.delete(node);
      expect(heap.size).toBe(1);
    });

    it('should trigger cleanup when deleting min root', () => {
      const heap = new HollowHeap<number>();
      const node1 = heap.insert(5);
      const node2 = heap.insert(10);
      const node3 = heap.insert(15);
      heap.insert(20);
      heap.insert(1);
      heap.delete(node3);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(10);
      expect(heap.extractMin()).toBe(20);
    });
  });

  describe('size getter', () => {
    it('should return 0 on empty heap', () => {
      const heap = new HollowHeap<number>();
      expect(heap.size).toBe(0);
    });

    it('should return 1 after single insert', () => {
      const heap = new HollowHeap<number>();
      heap.insert(1);
      expect(heap.size).toBe(1);
    });

    it('should return correct size after multiple inserts', () => {
      const heap = new HollowHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      expect(heap.size).toBe(3);
    });

    it('should decrease after extractMin', () => {
      const heap = new HollowHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.extractMin();
      expect(heap.size).toBe(1);
    });

    it('should return 0 after clear', () => {
      const heap = new HollowHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.clear();
      expect(heap.size).toBe(0);
    });
  });

  describe('isEmpty', () => {
    it('should return true on new heap', () => {
      const heap = new HollowHeap<number>();
      expect(heap.isEmpty()).toBe(true);
    });

    it('should return false after insert', () => {
      const heap = new HollowHeap<number>();
      heap.insert(1);
      expect(heap.isEmpty()).toBe(false);
    });

    it('should return true after all elements extracted', () => {
      const heap = new HollowHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.extractMin();
      heap.extractMin();
      expect(heap.isEmpty()).toBe(true);
    });

    it('should return true after clear', () => {
      const heap = new HollowHeap<number>();
      heap.insert(1);
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('should empty non-empty heap', () => {
      const heap = new HollowHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.clear();
      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should clear heap with one element', () => {
      const heap = new HollowHeap<number>();
      heap.insert(1);
      heap.clear();
      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should allow reuse after clear', () => {
      const heap = new HollowHeap<number>();
      heap.insert(1);
      heap.clear();
      heap.insert(5);
      expect(heap.size).toBe(1);
      expect(heap.peek()).toBe(5);
    });

    it('should handle clear on already empty heap', () => {
      const heap = new HollowHeap<number>();
      heap.clear();
      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty heap', () => {
      const heap = new HollowHeap<number>();
      expect(heap.toArray()).toEqual([]);
    });

    it('should return all elements', () => {
      const heap = new HollowHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      const arr = heap.toArray();
      expect(arr.length).toBe(3);
    });

    it('should contain all inserted values', () => {
      const heap = new HollowHeap<number>();
      heap.insert(10);
      heap.insert(20);
      heap.insert(30);
      const arr = heap.toArray();
      expect(arr).toContain(10);
      expect(arr).toContain(20);
      expect(arr).toContain(30);
    });

    it('should return correct count after operations', () => {
      const heap = new HollowHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.extractMin();
      expect(heap.toArray().length).toBe(2);
    });

    it('should return sorted array', () => {
      const heap = new HollowHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      heap.insert(4);
      const arr = heap.toArray();
      expect(arr).toEqual([1, 3, 4, 5, 7]);
    });

    it('should handle duplicate values', () => {
      const heap = new HollowHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(5);
      heap.insert(3);
      const arr = heap.toArray();
      expect(arr).toEqual([3, 3, 5, 5]);
    });

    it('should not modify original heap', () => {
      const heap = new HollowHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      const sizeBefore = heap.size;
      const peekBefore = heap.peek();
      heap.toArray();
      expect(heap.size).toBe(sizeBefore);
      expect(heap.peek()).toBe(peekBefore);
    });
  });

  describe('forEach', () => {
    it('should iterate over empty heap', () => {
      const heap = new HollowHeap<number>();
      let count = 0;
      heap.forEach(() => count++);
      expect(count).toBe(0);
    });

    it('should iterate over all elements', () => {
      const heap = new HollowHeap<number>();
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
      const heap = new HollowHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.forEach(() => {});
      expect(heap.size).toBe(3);
    });

    it('should iterate in sorted order', () => {
      const heap = new HollowHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      const values: number[] = [];
      heap.forEach((v) => values.push(v));
      expect(values).toEqual([1, 3, 5, 7]);
    });
  });

  describe('edge cases', () => {
    it('should handle string values', () => {
      const heap = new HollowHeap<string>();
      heap.insert('banana');
      heap.insert('apple');
      heap.insert('cherry');
      expect(heap.extractMin()).toBe('apple');
      expect(heap.extractMin()).toBe('banana');
      expect(heap.extractMin()).toBe('cherry');
    });

    it('should handle object values with comparator', () => {
      const heap = new HollowHeap<{ id: number }>({
        comparator: (a, b) => a.id - b.id,
      });
      heap.insert({ id: 3 });
      heap.insert({ id: 1 });
      heap.insert({ id: 2 });
      expect(heap.extractMin()!.id).toBe(1);
      expect(heap.extractMin()!.id).toBe(2);
      expect(heap.extractMin()!.id).toBe(3);
    });

    it('should handle negative values extraction', () => {
      const heap = new HollowHeap<number>();
      heap.insert(-3);
      heap.insert(-1);
      heap.insert(-5);
      expect(heap.extractMin()).toBe(-5);
      expect(heap.extractMin()).toBe(-3);
      expect(heap.extractMin()).toBe(-1);
    });

    it('should handle large range of values', () => {
      const heap = new HollowHeap<number>();
      heap.insert(-100);
      heap.insert(0);
      heap.insert(100);
      expect(heap.extractMin()).toBe(-100);
      expect(heap.extractMin()).toBe(0);
      expect(heap.extractMin()).toBe(100);
    });

    it('should handle interleaved operations', () => {
      const heap = new HollowHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.extractMin();
      heap.insert(1);
      heap.insert(7);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(7);
    });
  });

  describe('stress tests', () => {
    it('should handle 1000 elements', () => {
      const heap = new HollowHeap<number>();
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
      const heap = new HollowHeap<number>();
      const values: number[] = [];
      for (let i = 0; i < 1000; i++) {
        const v = Math.floor(Math.random() * 10000);
        values.push(v);
        heap.insert(v);
      }
      values.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
      for (let i = 0; i < 1000; i++) {
        expect(heap.extractMin()).toBe(values[i]);
      }
    });

    it('should handle complex operations with decreaseKey and delete', () => {
      const heap = new HollowHeap<number>();
      const nodes = [];
      for (let i = 0; i < 100; i++) {
        nodes.push(heap.insert(Math.random() * 1000));
      }
      
      heap.decreaseKey(nodes[10], 0);
      heap.delete(nodes[20]);
      heap.decreaseKey(nodes[30], 1);
      heap.delete(nodes[40]);
      
      expect(heap.size).toBe(98);
      
      const extracted: number[] = [];
      while (!heap.isEmpty()) {
        extracted.push(heap.extractMin()!);
      }
      
      for (let i = 1; i < extracted.length; i++) {
        expect(extracted[i] >= extracted[i - 1]).toBe(true);
      }
    });
  });
});
