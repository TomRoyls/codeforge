import { describe, it, expect } from 'vitest';
import { PairingHeap2 } from '../src/core/pairing-heap-2/index.js';

describe('PairingHeap2', () => {
  describe('constructor and basic operations', () => {
    it.skip('should create empty heap', () => {
      const heap = new PairingHeap2<number>();
      expect(heap.isEmpty).toBe(true);
      expect(heap.size).toBe(0);
    });

    it('should create heap with comparator', () => {
      const heap = new PairingHeap2<number>({ comparator: (a, b) => b - a });
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.peek()).toBe(7);
    });

    it('should use default comparator correctly', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.peek()).toBe(3);
    });

    it('should handle strings with default comparator', () => {
      const heap = new PairingHeap2<string>();
      heap.insert('zebra');
      heap.insert('apple');
      heap.insert('banana');
      expect(heap.peek()).toBe('apple');
    });

    it('should work with objects and custom comparator', () => {
      type Item = { priority: number; name: string };
      const heap = new PairingHeap2<Item>({ comparator: (a, b) => a.priority - b.priority });
      heap.insert({ priority: 5, name: 'five' });
      heap.insert({ priority: 2, name: 'two' });
      heap.insert({ priority: 8, name: 'eight' });
      expect(heap.peek()!.priority).toBe(2);
    });
  });

  describe('insert and push', () => {
    it('should insert single value', () => {
      const heap = new PairingHeap2<number>();
      const node = heap.insert(5);
      expect(heap.size).toBe(1);
      expect(heap.peek()).toBe(5);
      expect(node.value).toBe(5);
      expect(heap.isEmpty).toBe(false);
    });

    it('should push alias for insert', () => {
      const heap = new PairingHeap2<number>();
      const node = heap.push(5);
      expect(heap.size).toBe(1);
      expect(node.value).toBe(5);
    });

    it('should maintain min-heap after multiple inserts', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      heap.insert(9);
      expect(heap.peek()).toBe(1);
      expect(heap.size).toBe(5);
    });

    it('should insert duplicate values', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      heap.insert(5);
      heap.insert(5);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(5);
    });

    it('should return handle with correct structure', () => {
      const heap = new PairingHeap2<number>();
      const node = heap.insert(42);
      expect(node.value).toBe(42);
      expect(node.child).toBe(null);
      expect(node.sibling).toBe(null);
      expect(node.prev).toBe(null);
    });

    it('should handle negative numbers', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(-5);
      heap.insert(-3);
      heap.insert(-1);
      expect(heap.peek()).toBe(-5);
    });

    it('should handle zero', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(0);
      heap.insert(0);
      heap.insert(0);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(0);
    });
  });

  describe('pop', () => {
    it('should throw for empty heap', () => {
      const heap = new PairingHeap2<number>();
      expect(() => heap.pop()).toThrow('pop called on empty heap');
    });

    it('should pop single element', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      const popped = heap.pop();
      expect(popped).toBe(5);
      expect(heap.isEmpty).toBe(true);
      expect(heap.size).toBe(0);
    });

    it('should pop elements in ascending order', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      heap.insert(9);
      const result: number[] = [];
      while (!heap.isEmpty) {
        result.push(heap.pop());
      }
      expect(result).toEqual([1, 3, 5, 7, 9]);
    });

    it('should pop duplicates correctly', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(5);
      heap.insert(1);
      heap.insert(3);
      const result: number[] = [];
      while (!heap.isEmpty) {
        result.push(heap.pop());
      }
      expect(result).toEqual([1, 3, 3, 5, 5]);
    });

    it('should update size after pop', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.pop();
      expect(heap.size).toBe(2);
      heap.pop();
      expect(heap.size).toBe(1);
    });
  });

  describe('peek', () => {
    it('should throw for empty heap', () => {
      const heap = new PairingHeap2<number>();
      expect(() => heap.peek()).toThrow('peek called on empty heap');
    });

    it('should return minimum without removing', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.peek()).toBe(3);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(3);
    });

    it('should update peek after insert', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      expect(heap.peek()).toBe(5);
      heap.insert(3);
      expect(heap.peek()).toBe(3);
      heap.insert(7);
      expect(heap.peek()).toBe(3);
      heap.insert(1);
      expect(heap.peek()).toBe(1);
    });

    it('should update peek after pop', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      heap.insert(9);
      expect(heap.peek()).toBe(1);
      heap.pop();
      expect(heap.peek()).toBe(3);
      heap.pop();
      expect(heap.peek()).toBe(5);
    });

    it('should return same value on multiple peeks', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.peek()).toBe(3);
      expect(heap.peek()).toBe(3);
      expect(heap.peek()).toBe(3);
    });
  });

  describe('size and isEmpty', () => {
    it('should track size correctly through operations', () => {
      const heap = new PairingHeap2<number>();
      expect(heap.size).toBe(0);
      expect(heap.isEmpty).toBe(true);
      heap.insert(5);
      expect(heap.size).toBe(1);
      expect(heap.isEmpty).toBe(false);
      heap.insert(3);
      heap.insert(7);
      expect(heap.size).toBe(3);
      heap.pop();
      expect(heap.size).toBe(2);
      heap.pop();
      heap.pop();
      expect(heap.size).toBe(0);
      expect(heap.isEmpty).toBe(true);
    });

    it('should return 0 for empty heap', () => {
      const heap = new PairingHeap2<number>();
      expect(heap.size).toBe(0);
    });

    it('should return true for empty heap', () => {
      const heap = new PairingHeap2<number>();
      expect(heap.isEmpty).toBe(true);
    });

    it('should return false after insert', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(1);
      expect(heap.isEmpty).toBe(false);
    });

    it('should return true after extracting all', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.pop();
      heap.pop();
      heap.pop();
      expect(heap.isEmpty).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear all elements', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.clear();
      expect(heap.isEmpty).toBe(true);
      expect(heap.size).toBe(0);
    });

    it('should work on empty heap', () => {
      const heap = new PairingHeap2<number>();
      heap.clear();
      expect(heap.isEmpty).toBe(true);
      expect(heap.size).toBe(0);
    });

    it('should allow insert after clear', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.clear();
      heap.insert(7);
      heap.insert(1);
      expect(heap.size).toBe(2);
      expect(heap.peek()).toBe(1);
    });

    it('should allow pop after clear', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.clear();
      expect(() => heap.pop()).toThrow('pop called on empty heap');
    });

    it('should allow peek after clear', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.clear();
      expect(() => heap.peek()).toThrow('peek called on empty heap');
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty heap', () => {
      const heap = new PairingHeap2<number>();
      expect(heap.toArray()).toEqual([]);
    });

    it('should return elements sorted', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      heap.insert(9);
      const result = heap.toArray();
      expect(result).toEqual([1, 3, 5, 7, 9]);
    });

    it('should not modify original heap', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      const sizeBefore = heap.size;
      const peekBefore = heap.peek();
      heap.toArray();
      expect(heap.size).toBe(sizeBefore);
      expect(heap.peek()).toBe(peekBefore);
    });

    it('should handle duplicates', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(5);
      heap.insert(1);
      heap.insert(3);
      const result = heap.toArray();
      expect(result).toEqual([1, 3, 3, 5, 5]);
    });

    it('should handle single element', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(42);
      const result = heap.toArray();
      expect(result).toEqual([42]);
    });
  });

  describe('clone', () => {
    it('should clone empty heap', () => {
      const heap = new PairingHeap2<number>();
      const cloned = heap.clone();
      expect(cloned.isEmpty).toBe(true);
      expect(cloned.size).toBe(0);
    });

    it('should clone heap with elements', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      const cloned = heap.clone();
      expect(cloned.size).toBe(3);
      expect(cloned.peek()).toBe(3);
    });

    it('should create independent clone', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      const cloned = heap.clone();
      cloned.insert(1);
      cloned.pop();
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(3);
      expect(cloned.size).toBe(3);
    });

    it('should clone with custom comparator', () => {
      const heap = new PairingHeap2<number>({ comparator: (a, b) => b - a });
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      const cloned = heap.clone();
      cloned.insert(1);
      expect(cloned.peek()).toBe(7);
    });

    it.skip('should create independent node handles', () => {
      const heap = new PairingHeap2<number>();
      const node = heap.insert(10);
      const cloned = heap.clone();
      heap.pop();
      expect(cloned.contains(node)).toBe(true);
    });
  });

  describe('fromArray static', () => {
    it('should create heap from empty array', () => {
      const heap = PairingHeap2.fromArray<number>([]);
      expect(heap.isEmpty).toBe(true);
      expect(heap.size).toBe(0);
    });

    it('should create heap from single element', () => {
      const heap = PairingHeap2.fromArray<number>([5]);
      expect(heap.size).toBe(1);
      expect(heap.peek()).toBe(5);
    });

    it('should create heap from multiple elements', () => {
      const heap = PairingHeap2.fromArray<number>([5, 3, 7, 1, 9]);
      expect(heap.size).toBe(5);
      expect(heap.peek()).toBe(1);
      const result: number[] = [];
      while (!heap.isEmpty) {
        result.push(heap.pop());
      }
      expect(result).toEqual([1, 3, 5, 7, 9]);
    });

    it('should use default comparator', () => {
      const heap = PairingHeap2.fromArray<string>(['zebra', 'apple', 'banana']);
      expect(heap.peek()).toBe('apple');
    });

    it('should use custom comparator', () => {
      const heap = PairingHeap2.fromArray<number>(
        [5, 3, 7, 1, 9],
        { comparator: (a, b) => b - a }
      );
      expect(heap.peek()).toBe(9);
    });

    it('should create heap from array with duplicates', () => {
      const heap = PairingHeap2.fromArray<number>([5, 3, 5, 1, 3]);
      const result: number[] = [];
      while (!heap.isEmpty) {
        result.push(heap.pop());
      }
      expect(result).toEqual([1, 3, 3, 5, 5]);
    });

    it('should handle large array', () => {
      const values = Array.from({ length: 100 }, (_, i) => 100 - i);
      const heap = PairingHeap2.fromArray<number>(values);
      expect(heap.size).toBe(100);
      expect(heap.peek()).toBe(1);
    });
  });

  describe('merge', () => {
    it('should merge empty heap with non-empty heap', () => {
      const heap1 = new PairingHeap2<number>();
      const heap2 = new PairingHeap2<number>();
      heap2.insert(5);
      heap2.insert(3);
      heap1.merge(heap2);
      expect(heap1.size).toBe(2);
      expect(heap1.peek()).toBe(3);
      expect(heap2.isEmpty).toBe(true);
      expect(heap2.size).toBe(0);
    });

    it('should merge two non-empty heaps', () => {
      const heap1 = new PairingHeap2<number>();
      const heap2 = new PairingHeap2<number>();
      heap1.insert(5);
      heap1.insert(3);
      heap2.insert(7);
      heap2.insert(1);
      heap1.merge(heap2);
      expect(heap1.size).toBe(4);
      expect(heap1.peek()).toBe(1);
      expect(heap2.isEmpty).toBe(true);
      expect(heap2.size).toBe(0);
    });

    it('should maintain heap property after merge', () => {
      const heap1 = new PairingHeap2<number>();
      const heap2 = new PairingHeap2<number>();
      heap1.insert(5);
      heap1.insert(8);
      heap1.insert(2);
      heap2.insert(7);
      heap2.insert(1);
      heap2.insert(9);
      heap1.merge(heap2);
      const result: number[] = [];
      while (!heap1.isEmpty) {
        result.push(heap1.pop());
      }
      expect(result).toEqual([1, 2, 5, 7, 8, 9]);
    });

    it('should merge heaps with same comparator', () => {
      const heap1 = new PairingHeap2<number>({ comparator: (a, b) => b - a });
      const heap2 = new PairingHeap2<number>({ comparator: (a, b) => b - a });
      heap1.insert(5);
      heap2.insert(3);
      heap1.merge(heap2);
      expect(heap1.peek()).toBe(5);
    });

    it('should handle multiple merges', () => {
      const heap1 = new PairingHeap2<number>();
      const heap2 = new PairingHeap2<number>();
      const heap3 = new PairingHeap2<number>();
      heap1.insert(5);
      heap2.insert(3);
      heap3.insert(1);
      heap1.merge(heap2);
      heap1.merge(heap3);
      expect(heap1.size).toBe(3);
      expect(heap1.peek()).toBe(1);
    });

    it('should not merge heap with itself', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      const sizeBefore = heap.size;
      heap.merge(heap);
      expect(heap.size).toBe(sizeBefore);
    });

    it('should clear other heap after merge', () => {
      const heap1 = new PairingHeap2<number>();
      const heap2 = new PairingHeap2<number>();
      heap1.insert(5);
      heap2.insert(3);
      heap1.merge(heap2);
      expect(heap2.isEmpty).toBe(true);
      expect(heap2.size).toBe(0);
    });
  });

  describe('decreaseKey', () => {
    it('should decrease key of existing element', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      const node = heap.insert(10);
      heap.insert(7);
      heap.decreaseKey(node, 1);
      expect(heap.peek()).toBe(1);
      expect(heap.size).toBe(4);
    });

    it('should throw for empty heap', () => {
      const heap = new PairingHeap2<number>();
      const node = { value: 5, child: null, sibling: null, prev: null };
      expect(() => heap.decreaseKey(node, 1)).toThrow('Heap is empty');
    });

    it('should throw when new value is greater', () => {
      const heap = new PairingHeap2<number>();
      const node = heap.insert(5);
      expect(() => heap.decreaseKey(node, 10)).toThrow('New value is greater than current value');
    });

    it('should allow same value', () => {
      const heap = new PairingHeap2<number>();
      const node = heap.insert(5);
      heap.decreaseKey(node, 5);
      expect(node.value).toBe(5);
    });

    it('should handle decreasing root element', () => {
      const heap = new PairingHeap2<number>();
      const node = heap.insert(5);
      heap.insert(10);
      heap.insert(15);
      heap.decreaseKey(node, 2);
      expect(heap.peek()).toBe(2);
      expect(heap.pop()).toBe(2);
      expect(heap.pop()).toBe(10);
      expect(heap.pop()).toBe(15);
    });

    it('should update node value', () => {
      const heap = new PairingHeap2<number>();
      const node = heap.insert(10);
      heap.insert(5);
      heap.insert(15);
      heap.decreaseKey(node, 3);
      expect(node.value).toBe(3);
    });

    it('should maintain heap property', () => {
      const heap = new PairingHeap2<number>();
      const node1 = heap.insert(10);
      heap.insert(5);
      heap.insert(15);
      heap.decreaseKey(node1, 1);
      expect(heap.peek()).toBe(1);
      expect(heap.pop()).toBe(1);
      expect(heap.pop()).toBe(5);
      expect(heap.pop()).toBe(15);
    });

    it('should work with custom comparator', () => {
      const heap = new PairingHeap2<number>({ comparator: (a, b) => b - a });
      const node = heap.insert(5);
      heap.decreaseKey(node, 10);
      expect(heap.peek()).toBe(10);
    });
  });

  describe('decreaseKeyOrDefault', () => {
    it('should return true for successful decrease', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      const node = heap.insert(10);
      expect(heap.decreaseKeyOrDefault(node, 1)).toBe(true);
      expect(heap.peek()).toBe(1);
    });

    it('should return false for empty heap', () => {
      const heap = new PairingHeap2<number>();
      const node = { value: 5, child: null, sibling: null, prev: null };
      expect(heap.decreaseKeyOrDefault(node, 1)).toBe(false);
    });

    it('should return false for non-existing node', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      const node = { value: 999, child: null, sibling: null, prev: null };
      expect(heap.decreaseKeyOrDefault(node, 1)).toBe(false);
    });

    it('should return false when new value is greater', () => {
      const heap = new PairingHeap2<number>();
      const node = heap.insert(5);
      expect(heap.decreaseKeyOrDefault(node, 10)).toBe(false);
      expect(heap.peek()).toBe(5);
    });

    it('should return true when value is same', () => {
      const heap = new PairingHeap2<number>();
      const node = heap.insert(5);
      expect(heap.decreaseKeyOrDefault(node, 5)).toBe(true);
    });

    it('should return false for node from other heap', () => {
      const heap1 = new PairingHeap2<number>();
      const heap2 = new PairingHeap2<number>();
      const node = heap1.insert(5);
      heap2.insert(3);
      expect(heap2.decreaseKeyOrDefault(node, 1)).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete single element', () => {
      const heap = new PairingHeap2<number>();
      const node = heap.insert(5);
      heap.delete(node);
      expect(heap.isEmpty).toBe(true);
      expect(heap.size).toBe(0);
    });

    it('should delete element and maintain heap property', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      const node = heap.insert(7);
      heap.insert(1);
      heap.insert(9);
      heap.delete(node);
      expect(heap.size).toBe(4);
      const result: number[] = [];
      while (!heap.isEmpty) {
        result.push(heap.pop());
      }
      expect(result).toEqual([1, 3, 5, 9]);
    });

    it('should delete root element', () => {
      const heap = new PairingHeap2<number>();
      const node = heap.insert(1);
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.delete(node);
      expect(heap.peek()).toBe(3);
      expect(heap.size).toBe(3);
    });

    it('should handle delete on empty heap', () => {
      const heap = new PairingHeap2<number>();
      const node = { value: 5, child: null, sibling: null, prev: null };
      expect(() => heap.delete(node)).not.toThrow();
      expect(heap.isEmpty).toBe(true);
    });

    it('should handle delete of non-existing node', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      const node = { value: 999, child: null, sibling: null, prev: null };
      expect(() => heap.delete(node)).not.toThrow();
      expect(heap.size).toBe(0);
    });

    it('should handle duplicate values', () => {
      const heap = new PairingHeap2<number>();
      const node1 = heap.insert(5);
      const node2 = heap.insert(5);
      heap.insert(3);
      heap.delete(node1);
      expect(heap.size).toBe(2);
      expect(heap.pop()).toBe(3);
      expect(heap.pop()).toBe(5);
    });

    it('should reinsert children after delete', () => {
      const heap = new PairingHeap2<number>();
      const node = heap.insert(10);
      heap.insert(5);
      heap.insert(15);
      heap.insert(20);
      heap.delete(node);
      const result: number[] = [];
      while (!heap.isEmpty) {
        result.push(heap.pop());
      }
      expect(result).toEqual([5, 15, 20]);
    });

    it('should work with custom comparator', () => {
      type Item = { value: number };
      const heap = new PairingHeap2<Item>({ comparator: (a, b) => a.value - b.value });
      const node = heap.insert({ value: 10 });
      heap.insert({ value: 5 });
      heap.insert({ value: 15 });
      heap.delete(node);
      expect(heap.peek()!.value).toBe(5);
    });
  });

  describe('contains', () => {
    it('should return false for empty heap', () => {
      const heap = new PairingHeap2<number>();
      const node = { value: 5, child: null, sibling: null, prev: null };
      expect(heap.contains(node)).toBe(false);
    });

    it('should return true for existing node', () => {
      const heap = new PairingHeap2<number>();
      const node1 = heap.insert(5);
      const node2 = heap.insert(3);
      const node3 = heap.insert(7);
      expect(heap.contains(node1)).toBe(true);
      expect(heap.contains(node2)).toBe(true);
      expect(heap.contains(node3)).toBe(true);
    });

    it('should return false for non-existing node', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      const node = { value: 999, child: null, sibling: null, prev: null };
      expect(heap.contains(node)).toBe(false);
    });

    it('should return false after delete', () => {
      const heap = new PairingHeap2<number>();
      const node = heap.insert(5);
      heap.insert(3);
      heap.delete(node);
      expect(heap.contains(node)).toBe(false);
    });

    it('should return true for root node', () => {
      const heap = new PairingHeap2<number>();
      const node = heap.insert(5);
      heap.insert(10);
      heap.insert(15);
      expect(heap.contains(node)).toBe(true);
    });

    it('should return true after decreaseKey', () => {
      const heap = new PairingHeap2<number>();
      const node = heap.insert(10);
      heap.insert(5);
      heap.insert(15);
      heap.decreaseKey(node, 1);
      expect(heap.contains(node)).toBe(true);
    });
  });

  describe('update', () => {
    it('should decrease value', () => {
      const heap = new PairingHeap2<number>();
      const node = heap.insert(10);
      heap.insert(5);
      heap.insert(15);
      heap.update(node, 1);
      expect(heap.peek()).toBe(1);
      expect(node.value).toBe(1);
    });

    it('should increase value', () => {
      const heap = new PairingHeap2<number>();
      const node = heap.insert(5);
      heap.insert(10);
      heap.insert(1);
      heap.update(node, 7);
      expect(heap.peek()).toBe(1);
      expect(heap.pop()).toBe(1);
      expect(heap.pop()).toBe(7);
    });

    it('should handle same value', () => {
      const heap = new PairingHeap2<number>();
      const node = heap.insert(5);
      heap.update(node, 5);
      expect(node.value).toBe(5);
      expect(heap.peek()).toBe(5);
    });

    it('should handle update of root', () => {
      const heap = new PairingHeap2<number>();
      const node = heap.insert(1);
      heap.insert(10);
      heap.insert(5);
      heap.update(node, 7);
      expect(heap.peek()).toBe(5);
      expect(heap.pop()).toBe(5);
      expect(heap.pop()).toBe(7);
    });

    it('should return early for empty heap', () => {
      const heap = new PairingHeap2<number>();
      const node = { value: 5, child: null, sibling: null, prev: null };
      expect(() => heap.update(node, 10)).not.toThrow();
    });

    it('should maintain heap property', () => {
      const heap = new PairingHeap2<number>();
      const node1 = heap.insert(10);
      const node2 = heap.insert(5);
      const node3 = heap.insert(15);
      heap.update(node1, 2);
      heap.update(node3, 20);
      expect(heap.peek()).toBe(2);
      const result: number[] = [];
      while (!heap.isEmpty) {
        result.push(heap.pop());
      }
      expect(result).toEqual([2, 5, 20]);
    });

    it('should reinsert children on increase', () => {
      const heap = new PairingHeap2<number>();
      const node = heap.insert(10);
      heap.insert(5);
      heap.insert(15);
      heap.update(node, 20);
      const result: number[] = [];
      while (!heap.isEmpty) {
        result.push(heap.pop());
      }
      expect(result).toEqual([5, 15, 20]);
    });
  });

  describe('isValid', () => {
    it('should return true for empty heap', () => {
      const heap = new PairingHeap2<number>();
      expect(heap.isValid()).toBe(true);
    });

    it('should return true for single element', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      expect(heap.isValid()).toBe(true);
    });

    it('should return true for valid heap', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.insert(4);
      expect(heap.isValid()).toBe(true);
    });

    it('should return true after operations', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.pop();
      heap.insert(1);
      expect(heap.isValid()).toBe(true);
    });

    it('should return true after merge', () => {
      const heap1 = new PairingHeap2<number>();
      const heap2 = new PairingHeap2<number>();
      heap1.insert(1);
      heap1.insert(3);
      heap2.insert(2);
      heap2.insert(4);
      heap1.merge(heap2);
      expect(heap1.isValid()).toBe(true);
    });

    it('should return true after decreaseKey', () => {
      const heap = new PairingHeap2<number>();
      const node = heap.insert(10);
      heap.insert(5);
      heap.insert(15);
      heap.decreaseKey(node, 1);
      expect(heap.isValid()).toBe(true);
    });

    it('should return true after delete', () => {
      const heap = new PairingHeap2<number>();
      const node = heap.insert(10);
      heap.insert(5);
      heap.insert(15);
      heap.delete(node);
      expect(heap.isValid()).toBe(true);
    });

    it('should return true after update', () => {
      const heap = new PairingHeap2<number>();
      const node = heap.insert(10);
      heap.insert(5);
      heap.insert(15);
      heap.update(node, 20);
      expect(heap.isValid()).toBe(true);
    });

    it('should return true for large valid heap', () => {
      const heap = new PairingHeap2<number>();
      for (let i = 0; i < 100; i++) {
        heap.insert(i);
      }
      expect(heap.isValid()).toBe(true);
    });
  });

  describe('forEach', () => {
    it('should iterate over empty heap', () => {
      const heap = new PairingHeap2<number>();
      const result: number[] = [];
      heap.forEach(item => result.push(item));
      expect(result).toEqual([]);
    });

    it('should iterate over all elements', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      heap.insert(9);
      const result: number[] = [];
      heap.forEach(item => result.push(item));
      expect(result).toEqual([1, 3, 5, 7, 9]);
    });

    it('should pass correct indices', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(3);
      heap.insert(1);
      heap.insert(2);
      const indices: number[] = [];
      heap.forEach((value, index) => {
        indices.push(index);
      });
      expect(indices).toEqual([0, 1, 2]);
    });

    it('should not modify heap during iteration', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      const sizeBefore = heap.size;
      const peekBefore = heap.peek();
      heap.forEach(item => {});
      expect(heap.size).toBe(sizeBefore);
      expect(heap.peek()).toBe(peekBefore);
    });

    it('should handle single element', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      const result: number[] = [];
      heap.forEach(item => result.push(item));
      expect(result).toEqual([5]);
    });

    it('should handle duplicates', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(5);
      heap.insert(1);
      heap.insert(3);
      const result: number[] = [];
      heap.forEach(item => result.push(item));
      expect(result).toEqual([1, 3, 3, 5, 5]);
    });
  });

  describe('iterator', () => {
    it('should iterate over empty heap', () => {
      const heap = new PairingHeap2<number>();
      const result: number[] = [];
      for (const item of heap) {
        result.push(item);
      }
      expect(result).toEqual([]);
    });

    it('should iterate over all elements', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      heap.insert(9);
      const result: number[] = [];
      for (const item of heap) {
        result.push(item);
      }
      expect(result).toEqual([1, 3, 5, 7, 9]);
    });

    it('should not modify heap during iteration', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      const sizeBefore = heap.size;
      const peekBefore = heap.peek();
      for (const item of heap) {
      }
      expect(heap.size).toBe(sizeBefore);
      expect(heap.peek()).toBe(peekBefore);
    });

    it('should handle single element', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      const result: number[] = [];
      for (const item of heap) {
        result.push(item);
      }
      expect(result).toEqual([5]);
    });

    it('should allow multiple iterations', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(2);
      heap.insert(1);
      const result1: number[] = [];
      const result2: number[] = [];
      for (const value of heap) {
        result1.push(value);
      }
      for (const value of heap) {
        result2.push(value);
      }
      expect(result1).toEqual(result2);
    });

    it('should use Symbol.iterator', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(3);
      heap.insert(1);
      const result: number[] = [];
      const iterator = heap[Symbol.iterator]();
      let next = iterator.next();
      while (!next.done) {
        result.push(next.value);
        next = iterator.next();
      }
      expect(result).toEqual([1, 3]);
    });
  });

  describe('pushPop', () => {
    it('should return value for empty heap', () => {
      const heap = new PairingHeap2<number>();
      const result = heap.pushPop(5);
      expect(result).toBe(5);
      expect(heap.isEmpty).toBe(true);
    });

    it('should push and pop in one operation', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      const result = heap.pushPop(2);
      expect(result).toBe(2);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(3);
    });

    it('should push value larger than min', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(1);
      heap.insert(3);
      const result = heap.pushPop(5);
      expect(result).toBe(1);
      expect(heap.size).toBe(2);
      expect(heap.peek()).toBe(3);
    });

    it('should push new minimum', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      const result = heap.pushPop(1);
      expect(result).toBe(1);
      expect(heap.size).toBe(2);
      expect(heap.peek()).toBe(3);
    });

    it('should handle duplicates', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      heap.insert(5);
      const result = heap.pushPop(5);
      expect(result).toBe(5);
      expect(heap.size).toBe(2);
    });

    it('should maintain heap property', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(10);
      heap.insert(5);
      heap.insert(15);
      heap.pushPop(2);
      const result: number[] = [];
      while (!heap.isEmpty) {
        result.push(heap.pop());
      }
      expect(result).toEqual([5, 10, 15]);
    });
  });

  describe('replacePeek', () => {
    it('should throw for empty heap', () => {
      const heap = new PairingHeap2<number>();
      expect(() => heap.replacePeek(5)).toThrow('replacePeek called on empty heap');
    });

    it('should replace root value', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      const oldPeek = heap.replacePeek(2);
      expect(oldPeek).toBe(3);
      expect(heap.peek()).toBe(2);
    });

    it('should maintain heap when new value is smaller', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      const oldPeek = heap.replacePeek(1);
      expect(oldPeek).toBe(3);
      expect(heap.peek()).toBe(1);
      expect(heap.size).toBe(3);
    });

    it('should maintain heap when new value is larger', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(1);
      heap.insert(5);
      heap.insert(3);
      const oldPeek = heap.replacePeek(10);
      expect(oldPeek).toBe(1);
      expect(heap.size).toBe(3);
      const result: number[] = [];
      while (!heap.isEmpty) {
        result.push(heap.pop());
      }
      expect(result).toEqual([3, 5, 10]);
    });

    it('should handle same value', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      const oldPeek = heap.replacePeek(3);
      expect(oldPeek).toBe(3);
      expect(heap.peek()).toBe(3);
      expect(heap.size).toBe(2);
    });

    it('should not change size', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      const sizeBefore = heap.size;
      heap.replacePeek(2);
      expect(heap.size).toBe(sizeBefore);
    });
  });

  describe('edge cases', () => {
    it('should handle insert after complete extraction', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.pop();
      heap.pop();
      expect(heap.isEmpty).toBe(true);
      heap.insert(7);
      expect(heap.peek()).toBe(7);
    });

    it('should handle complex sequence', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.pop();
      heap.insert(1);
      heap.pop();
      heap.insert(7);
      heap.insert(2);
      heap.pop();
      expect(heap.peek()).toBe(5);
    });

    it('should handle negative and positive mix', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(-5);
      heap.insert(3);
      heap.insert(-1);
      heap.insert(0);
      heap.insert(-3);
      expect(heap.peek()).toBe(-5);
    });

    it('should handle large number of operations', () => {
      const heap = new PairingHeap2<number>();
      for (let i = 0; i < 100; i++) {
        heap.insert(Math.floor(Math.random() * 1000));
      }
      let prev: number | null = null;
      while (!heap.isEmpty) {
        const current = heap.pop();
        if (prev !== null) {
          expect(current >= prev).toBe(true);
        }
        prev = current;
      }
    });

    it('should handle clone with operations', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      const cloned = heap.clone();
      heap.pop();
      cloned.pop();
      expect(heap.size).toBe(2);
      expect(cloned.size).toBe(2);
      expect(heap.peek()).toBe(5);
      expect(cloned.peek()).toBe(5);
    });

    it('should handle multiple merges', () => {
      const heap1 = new PairingHeap2<number>();
      const heap2 = new PairingHeap2<number>();
      const heap3 = new PairingHeap2<number>();
      heap1.insert(1);
      heap2.insert(3);
      heap3.insert(2);
      heap1.merge(heap2);
      heap1.merge(heap3);
      expect(heap1.size).toBe(3);
      expect(heap1.peek()).toBe(1);
    });
  });

  describe('large datasets', () => {
    it('should handle 10000 insertions', () => {
      const heap = new PairingHeap2<number>();
      const count = 10000;
      for (let i = 0; i < count; i++) {
        heap.insert(Math.floor(Math.random() * 10000));
      }
      expect(heap.size).toBe(count);
      expect(heap.isValid()).toBe(true);
    });

    it('should maintain heap property with large dataset', () => {
      const heap = new PairingHeap2<number>();
      const values: number[] = [];
      const count = 1000;
      for (let i = 0; i < count; i++) {
        const value = Math.floor(Math.random() * 1000);
        values.push(value);
        heap.insert(value);
      }
      const result: number[] = [];
      while (!heap.isEmpty) {
        result.push(heap.pop());
      }
      const sorted = [...values].sort((a, b) => a - b);
      expect(result).toEqual(sorted);
    });

    it('should handle large merge', () => {
      const heap1 = new PairingHeap2<number>();
      const heap2 = new PairingHeap2<number>();
      const count = 5000;
      for (let i = 0; i < count; i++) {
        heap1.insert(Math.floor(Math.random() * 1000));
        heap2.insert(Math.floor(Math.random() * 1000));
      }
      heap1.merge(heap2);
      expect(heap1.size).toBe(count * 2);
      expect(heap2.isEmpty).toBe(true);
      expect(heap1.isValid()).toBe(true);
    });

    it('should handle large fromArray', () => {
      const values = Array.from({ length: 10000 }, () => Math.floor(Math.random() * 10000));
      const heap = PairingHeap2.fromArray<number>(values);
      expect(heap.size).toBe(10000);
      expect(heap.isValid()).toBe(true);
    });

    it('should handle large sequential operations', () => {
      const heap = new PairingHeap2<number>();
      for (let i = 0; i < 1000; i++) {
        heap.push(i);
      }
      for (let i = 0; i < 1000; i++) {
        expect(heap.pop()).toBe(i);
      }
      expect(heap.isEmpty).toBe(true);
    });

    it('should handle mixed large operations', () => {
      const heap = new PairingHeap2<number>();
      const nodes = [];
      for (let i = 0; i < 100; i++) {
        nodes.push(heap.insert(i * 10));
      }
      for (let i = 0; i < 50; i++) {
        heap.decreaseKey(nodes[i], i);
      }
      for (let i = 0; i < 25; i++) {
        heap.delete(nodes[i * 2]);
      }
      expect(heap.isValid()).toBe(true);
    });
  });

  describe('custom types', () => {
    it('should handle strings', () => {
      const heap = new PairingHeap2<string>();
      heap.insert('zebra');
      heap.insert('apple');
      heap.insert('banana');
      heap.insert('cherry');
      const result: string[] = [];
      while (!heap.isEmpty) {
        result.push(heap.pop());
      }
      expect(result).toEqual(['apple', 'banana', 'cherry', 'zebra']);
    });

    it('should handle objects', () => {
      type Item = { priority: number; data: string };
      const heap = new PairingHeap2<Item>({ comparator: (a, b) => a.priority - b.priority });
      heap.insert({ priority: 3, data: 'three' });
      heap.insert({ priority: 1, data: 'one' });
      heap.insert({ priority: 2, data: 'two' });
      expect(heap.peek()!.data).toBe('one');
    });

    it('should handle decreaseKey on objects', () => {
      type Item = { priority: number; data: string };
      const heap = new PairingHeap2<Item>({ comparator: (a, b) => a.priority - b.priority });
      const node = heap.insert({ priority: 10, data: 'ten' });
      heap.insert({ priority: 5, data: 'five' });
      heap.decreaseKey(node, { priority: 1, data: 'one' });
      expect(heap.peek()!.data).toBe('one');
      expect(node.value.data).toBe('one');
    });
  });

  describe('ordering correctness', () => {
    it('should extract all elements in order', () => {
      const heap = new PairingHeap2<number>();
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
        result.push(heap.pop());
      }
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should maintain order with interleaved operations', () => {
      const heap = new PairingHeap2<number>();
      heap.insert(5);
      heap.insert(3);
      expect(heap.pop()).toBe(3);
      heap.insert(1);
      expect(heap.pop()).toBe(1);
      heap.insert(7);
      heap.insert(2);
      expect(heap.pop()).toBe(2);
      expect(heap.pop()).toBe(5);
      expect(heap.pop()).toBe(7);
      expect(heap.isEmpty).toBe(true);
    });

    it('should handle reverse insertion order', () => {
      const heap = new PairingHeap2<number>();
      for (let i = 100; i >= 1; i--) {
        heap.insert(i);
      }
      for (let i = 1; i <= 100; i++) {
        expect(heap.pop()).toBe(i);
      }
      expect(heap.isEmpty).toBe(true);
    });
  });
});
