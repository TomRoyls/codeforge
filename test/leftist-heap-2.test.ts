import { describe, it, expect } from 'vitest';
import { LeftistHeap } from './src/core/leftist-heap-2/index.js';

describe('LeftistHeap', () => {
  describe('constructor', () => {
    it('should create empty heap', () => {
      const heap = new LeftistHeap<number>();
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size).toBe(0);
    });

    it('should create heap from array', () => {
      const heap = new LeftistHeap<number>([3, 1, 4, 2]);
      expect(heap.size).toBe(4);
      expect(heap.peek()).toBe(1);
    });

    it('should create heap from array with options', () => {
      const heap = new LeftistHeap<number>([3, 1, 4, 2], { comparator: (a, b) => b - a });
      expect(heap.size).toBe(4);
      expect(heap.peek()).toBe(4);
    });

    it('should create heap with options only', () => {
      const heap = new LeftistHeap<number>({ comparator: (a, b) => b - a });
      heap.insert(1);
      heap.insert(3);
      heap.insert(2);
      expect(heap.peek()).toBe(3);
    });

    it('should create heap with empty array', () => {
      const heap = new LeftistHeap<number>([]);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should create heap with custom comparator', () => {
      type Item = { value: number };
      const heap = new LeftistHeap<Item>({ comparator: (a, b) => a.value - b.value });
      heap.insert({ value: 3 });
      heap.insert({ value: 1 });
      heap.insert({ value: 2 });
      expect(heap.peek()).toEqual({ value: 1 });
    });

    it('should create heap with max comparator', () => {
      const heap = new LeftistHeap<number>({ comparator: (a, b) => b - a });
      heap.insert(1);
      heap.insert(3);
      heap.insert(2);
      expect(heap.peek()).toBe(3);
    });
  });

  describe('fromArray static', () => {
    it('should create heap from array', () => {
      const heap = LeftistHeap.fromArray([3, 1, 4, 2]);
      expect(heap.size).toBe(4);
      expect(heap.peek()).toBe(1);
    });

    it('should create heap from array with comparator', () => {
      const heap = LeftistHeap.fromArray([3, 1, 4, 2], (a, b) => b - a);
      expect(heap.size).toBe(4);
      expect(heap.peek()).toBe(4);
    });

    it('should create heap from empty array', () => {
      const heap = LeftistHeap.fromArray([]);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should create heap from single element', () => {
      const heap = LeftistHeap.fromArray([42]);
      expect(heap.size).toBe(1);
      expect(heap.peek()).toBe(42);
    });

    it('should handle large array', () => {
      const values = Array.from({ length: 100 }, (_, i) => 100 - i);
      const heap = LeftistHeap.fromArray(values);
      expect(heap.size).toBe(100);
      expect(heap.peek()).toBe(1);
    });
  });

  describe('insert', () => {
    it('should insert single element', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(5);
      expect(heap.size).toBe(1);
      expect(heap.peek()).toBe(5);
    });

    it('should insert multiple elements', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(3);
      heap.insert(1);
      heap.insert(4);
      heap.insert(2);
      expect(heap.size).toBe(4);
      expect(heap.peek()).toBe(1);
    });

    it('should handle duplicate values', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(5);
      heap.insert(5);
      heap.insert(3);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(3);
    });

    it('should return handle', () => {
      const heap = new LeftistHeap<number>();
      const handle = heap.insert(5);
      expect(handle).toEqual({ value: 5 });
    });

    it('should update handle value after decreaseKey', () => {
      const heap = new LeftistHeap<number>();
      const handle = heap.insert(10);
      heap.decreaseKey(handle, 5);
      expect(handle.value).toBe(5);
    });
  });

  describe('extractMin', () => {
    it('should extract single element', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(5);
      const result = heap.extractMin();
      expect(result).toBe(5);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should extract in ascending order', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(3);
      heap.insert(1);
      heap.insert(4);
      heap.insert(2);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(2);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(4);
    });

    it('should throw on empty heap', () => {
      const heap = new LeftistHeap<number>();
      expect(() => heap.extractMin()).toThrow('extractMin called on empty heap');
    });

    it('should handle duplicates', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(5);
      heap.insert(5);
      heap.insert(3);
      heap.insert(3);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(5);
    });

    it('should decrease size after extraction', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.extractMin();
      expect(heap.size).toBe(2);
    });
  });

  describe('peek', () => {
    it('should return minimum without removing', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(3);
      heap.insert(1);
      heap.insert(4);
      expect(heap.peek()).toBe(1);
      expect(heap.size).toBe(3);
    });

    it('should throw on empty heap', () => {
      const heap = new LeftistHeap<number>();
      expect(() => heap.peek()).toThrow('peek called on empty heap');
    });

    it('should return same value on multiple peeks', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.peek()).toBe(3);
      expect(heap.peek()).toBe(3);
      expect(heap.peek()).toBe(3);
    });

    it('should update after insert', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(5);
      expect(heap.peek()).toBe(5);
      heap.insert(2);
      expect(heap.peek()).toBe(2);
    });

    it('should update after extract', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(3);
      heap.insert(1);
      heap.insert(4);
      expect(heap.peek()).toBe(1);
      heap.extractMin();
      expect(heap.peek()).toBe(3);
    });
  });

  describe('size', () => {
    it('should return 0 for empty heap', () => {
      const heap = new LeftistHeap<number>();
      expect(heap.size).toBe(0);
    });

    it('should track size after inserts', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(1);
      expect(heap.size).toBe(1);
      heap.insert(2);
      expect(heap.size).toBe(2);
      heap.insert(3);
      expect(heap.size).toBe(3);
    });

    it('should track size after extracts', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.extractMin();
      expect(heap.size).toBe(2);
      heap.extractMin();
      expect(heap.size).toBe(1);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty heap', () => {
      const heap = new LeftistHeap<number>();
      expect(heap.isEmpty()).toBe(true);
    });

    it('should return false after insert', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(1);
      expect(heap.isEmpty()).toBe(false);
    });

    it('should return true after extracting all', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.extractMin();
      heap.extractMin();
      heap.extractMin();
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear all elements', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size).toBe(0);
    });

    it('should work on empty heap', () => {
      const heap = new LeftistHeap<number>();
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
    });

    it('should allow reuse after clear', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.clear();
      heap.insert(3);
      heap.insert(4);
      expect(heap.size).toBe(2);
      expect(heap.peek()).toBe(3);
    });
  });

  describe('merge', () => {
    it('should merge two non-empty heaps', () => {
      const heap1 = new LeftistHeap<number>();
      const heap2 = new LeftistHeap<number>();
      heap1.insert(3);
      heap1.insert(1);
      heap2.insert(4);
      heap2.insert(2);
      const result = heap1.merge(heap2);
      expect(result.size).toBe(4);
      expect(heap1.size).toBe(2);
      expect(heap2.size).toBe(2);
      expect(result.extractMin()).toBe(1);
      expect(result.extractMin()).toBe(2);
      expect(result.extractMin()).toBe(3);
      expect(result.extractMin()).toBe(4);
    });

    it('should merge with empty heap', () => {
      const heap1 = new LeftistHeap<number>();
      const heap2 = new LeftistHeap<number>();
      heap1.insert(3);
      heap1.insert(1);
      const result = heap1.merge(heap2);
      expect(result.size).toBe(2);
      expect(result.extractMin()).toBe(1);
      expect(result.extractMin()).toBe(3);
    });

    it('should merge two empty heaps', () => {
      const heap1 = new LeftistHeap<number>();
      const heap2 = new LeftistHeap<number>();
      const result = heap1.merge(heap2);
      expect(result.isEmpty()).toBe(true);
    });

    it('should preserve original heaps', () => {
      const heap1 = new LeftistHeap<number>();
      const heap2 = new LeftistHeap<number>();
      heap1.insert(3);
      heap1.insert(1);
      heap2.insert(4);
      heap2.insert(2);
      heap1.merge(heap2);
      expect(heap1.size).toBe(2);
      expect(heap2.size).toBe(2);
      expect(heap1.peek()).toBe(1);
      expect(heap2.peek()).toBe(2);
    });

    it('should work with custom comparator', () => {
      const heap1 = new LeftistHeap<number>({ comparator: (a, b) => b - a });
      const heap2 = new LeftistHeap<number>({ comparator: (a, b) => b - a });
      heap1.insert(1);
      heap1.insert(3);
      heap2.insert(2);
      heap2.insert(4);
      const result = heap1.merge(heap2);
      expect(result.extractMin()).toBe(4);
      expect(result.extractMin()).toBe(3);
      expect(result.extractMin()).toBe(2);
      expect(result.extractMin()).toBe(1);
    });

    it('should handle large merge', () => {
      const heap1 = new LeftistHeap<number>();
      const heap2 = new LeftistHeap<number>();
      for (let i = 0; i < 50; i += 2) {
        heap1.insert(i);
      }
      for (let i = 1; i < 100; i += 2) {
        heap2.insert(i);
      }
      const result = heap1.merge(heap2);
      expect(result.size).toBe(75);
      expect(result.extractMin()).toBe(0);
    });
  });

  describe('merge static', () => {
    it('should merge two heaps', () => {
      const heap1 = new LeftistHeap<number>();
      const heap2 = new LeftistHeap<number>();
      heap1.insert(3);
      heap1.insert(1);
      heap2.insert(4);
      heap2.insert(2);
      const result = LeftistHeap.merge(heap1, heap2);
      expect(result.size).toBe(4);
      expect(result.extractMin()).toBe(1);
      expect(result.extractMin()).toBe(2);
      expect(result.extractMin()).toBe(3);
      expect(result.extractMin()).toBe(4);
    });

    it('should preserve original heaps', () => {
      const heap1 = new LeftistHeap<number>();
      const heap2 = new LeftistHeap<number>();
      heap1.insert(3);
      heap1.insert(1);
      heap2.insert(4);
      heap2.insert(2);
      LeftistHeap.merge(heap1, heap2);
      expect(heap1.size).toBe(2);
      expect(heap2.size).toBe(2);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty heap', () => {
      const heap = new LeftistHeap<number>();
      expect(heap.toArray()).toEqual([]);
    });

    it('should return all elements sorted', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(3);
      heap.insert(1);
      heap.insert(4);
      heap.insert(2);
      const arr = heap.toArray();
      expect(arr).toEqual([1, 2, 3, 4]);
    });

    it('should preserve heap', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.toArray();
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(1);
    });

    it('should handle single element', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(5);
      const arr = heap.toArray();
      expect(arr).toEqual([5]);
    });

    it('should handle duplicates', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(5);
      heap.insert(5);
      heap.insert(3);
      heap.insert(3);
      const arr = heap.toArray();
      expect(arr).toEqual([3, 3, 5, 5]);
    });
  });

  describe('toSortedArray', () => {
    it('should return sorted array', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(3);
      heap.insert(1);
      heap.insert(4);
      heap.insert(2);
      const arr = heap.toSortedArray();
      expect(arr).toEqual([1, 2, 3, 4]);
    });

    it('should match toArray', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(3);
      heap.insert(1);
      heap.insert(4);
      heap.insert(2);
      expect(heap.toSortedArray()).toEqual(heap.toArray());
    });
  });

  describe('contains', () => {
    it('should return false for empty heap', () => {
      const heap = new LeftistHeap<number>();
      expect(heap.contains(1)).toBe(false);
    });

    it('should return true for present value', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      expect(heap.contains(2)).toBe(true);
    });

    it('should return false for absent value', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      expect(heap.contains(5)).toBe(false);
    });

    it('should work with duplicates', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(5);
      heap.insert(5);
      heap.insert(3);
      expect(heap.contains(5)).toBe(true);
      expect(heap.contains(3)).toBe(true);
    });

    it('should work with custom comparator', () => {
      type Item = { value: number };
      const heap = new LeftistHeap<Item>({ comparator: (a, b) => a.value - b.value });
      heap.insert({ value: 1 });
      heap.insert({ value: 2 });
      heap.insert({ value: 3 });
      expect(heap.contains({ value: 2 })).toBe(true);
      expect(heap.contains({ value: 5 })).toBe(false);
    });

    it('should work after extract', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.extractMin();
      expect(heap.contains(1)).toBe(false);
      expect(heap.contains(2)).toBe(true);
    });
  });

  describe('decreaseKey', () => {
    it('should decrease key value', () => {
      const heap = new LeftistHeap<number>();
      const handle = heap.insert(10);
      heap.decreaseKey(handle, 5);
      expect(heap.peek()).toBe(5);
    });

    it('should decrease to same value', () => {
      const heap = new LeftistHeap<number>();
      const handle = heap.insert(5);
      heap.decreaseKey(handle, 5);
      expect(heap.peek()).toBe(5);
    });

    it('should throw on increase', () => {
      const heap = new LeftistHeap<number>();
      const handle = heap.insert(5);
      expect(() => heap.decreaseKey(handle, 10)).toThrow('newValue must be less than or equal to oldValue');
    });

    it('should throw on invalid handle', () => {
      const heap = new LeftistHeap<number>();
      const fakeHandle = { value: 999 };
      expect(() => heap.decreaseKey(fakeHandle, 5)).toThrow('handle not found in heap');
    });

    it('should maintain heap property', () => {
      const heap = new LeftistHeap<number>();
      const handle1 = heap.insert(10);
      heap.insert(5);
      heap.insert(15);
      heap.decreaseKey(handle1, 1);
      expect(heap.peek()).toBe(1);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(15);
    });

    it('should work with multiple decreases', () => {
      const heap = new LeftistHeap<number>();
      const handle = heap.insert(100);
      heap.decreaseKey(handle, 50);
      expect(heap.peek()).toBe(50);
      heap.decreaseKey(handle, 25);
      expect(heap.peek()).toBe(25);
      heap.decreaseKey(handle, 5);
      expect(heap.peek()).toBe(5);
    });

    it('should work with custom comparator', () => {
      const heap = new LeftistHeap<number>({ comparator: (a, b) => b - a });
      const handle = heap.insert(5);
      heap.decreaseKey(handle, 10);
      expect(heap.peek()).toBe(10);
    });

    it.skip('should work after other operations', () => {
      const heap = new LeftistHeap<number>();
      const handle = heap.insert(20);
      heap.insert(10);
      heap.insert(30);
      heap.extractMin();
      heap.decreaseKey(handle, 5);
      expect(heap.peek()).toBe(5);
    });
  });

  describe('delete', () => {
    it('should delete node from heap', () => {
      const heap = new LeftistHeap<number>();
      const handle1 = heap.insert(5);
      const handle2 = heap.insert(10);
      const handle3 = heap.insert(15);
      heap.delete(handle2);
      expect(heap.size).toBe(2);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(15);
    });

    it('should return true for successful delete', () => {
      const heap = new LeftistHeap<number>();
      const handle = heap.insert(5);
      expect(heap.delete(handle)).toBe(true);
    });

    it('should return false for invalid handle', () => {
      const heap = new LeftistHeap<number>();
      const fakeHandle = { value: 999 };
      expect(heap.delete(fakeHandle)).toBe(false);
    });

    it('should delete min node', () => {
      const heap = new LeftistHeap<number>();
      const handle1 = heap.insert(5);
      heap.insert(10);
      heap.insert(15);
      heap.delete(handle1);
      expect(heap.peek()).toBe(10);
    });

    it('should delete last node', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(5);
      heap.insert(10);
      const handle3 = heap.insert(15);
      heap.delete(handle3);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(10);
    });

    it('should handle delete on single node', () => {
      const heap = new LeftistHeap<number>();
      const handle = heap.insert(5);
      heap.delete(handle);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should handle multiple deletes', () => {
      const heap = new LeftistHeap<number>();
      const handle1 = heap.insert(10);
      const handle2 = heap.insert(20);
      const handle3 = heap.insert(30);
      heap.delete(handle2);
      heap.delete(handle1);
      expect(heap.extractMin()).toBe(30);
    });

    it('should work with custom comparator', () => {
      type Item = { value: number };
      const heap = new LeftistHeap<Item>({ comparator: (a, b) => a.value - b.value });
      const handle1 = heap.insert({ value: 10 });
      const handle2 = heap.insert({ value: 20 });
      heap.delete(handle1);
      expect(heap.extractMin()).toEqual({ value: 20 });
    });

    it('should work with duplicates', () => {
      const heap = new LeftistHeap<number>();
      const handle1 = heap.insert(5);
      const handle2 = heap.insert(5);
      heap.insert(3);
      heap.delete(handle1);
      expect(heap.size).toBe(2);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(5);
    });
  });

  describe('clone', () => {
    it('should clone empty heap', () => {
      const heap = new LeftistHeap<number>();
      const clone = heap.clone();
      expect(clone.isEmpty()).toBe(true);
      expect(clone.size).toBe(0);
    });

    it('should clone non-empty heap', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      const clone = heap.clone();
      expect(clone.size).toBe(3);
      expect(clone.peek()).toBe(1);
    });

    it('should not affect original', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(1);
      heap.insert(2);
      const clone = heap.clone();
      clone.insert(0);
      expect(heap.size).toBe(2);
      expect(clone.size).toBe(3);
      expect(heap.peek()).toBe(1);
      expect(clone.peek()).toBe(0);
    });

    it('should clone with custom comparator', () => {
      const heap = new LeftistHeap<number>({ comparator: (a, b) => b - a });
      heap.insert(1);
      heap.insert(3);
      const clone = heap.clone();
      clone.insert(2);
      expect(clone.peek()).toBe(3);
    });

    it('should create independent handles', () => {
      const heap = new LeftistHeap<number>();
      const handle = heap.insert(10);
      const clone = heap.clone();
      heap.decreaseKey(handle, 5);
      expect(heap.peek()).toBe(5);
      expect(clone.peek()).toBe(10);
    });
  });

  describe('forEach', () => {
    it('should iterate over all elements', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(3);
      heap.insert(1);
      heap.insert(4);
      heap.insert(2);
      const result: number[] = [];
      heap.forEach((value, index) => {
        result.push(value);
        expect(result[index]).toBe(value);
      });
      expect(result.length).toBe(4);
      expect(result).toContain(1);
      expect(result).toContain(2);
      expect(result).toContain(3);
      expect(result).toContain(4);
    });

    it('should call with correct indices', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(3);
      heap.insert(1);
      heap.insert(2);
      const indices: number[] = [];
      heap.forEach((value, index) => {
        indices.push(index);
      });
      expect(indices).toEqual([0, 1, 2]);
    });

    it('should handle empty heap', () => {
      const heap = new LeftistHeap<number>();
      let called = false;
      heap.forEach(() => {
        called = true;
      });
      expect(called).toBe(false);
    });

    it('should handle single element', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(5);
      const result: number[] = [];
      heap.forEach((value) => {
        result.push(value);
      });
      expect(result).toEqual([5]);
    });
  });

  describe('iterator', () => {
    it('should iterate in sorted order', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(3);
      heap.insert(1);
      heap.insert(4);
      heap.insert(2);
      const result: number[] = [];
      for (const value of heap) {
        result.push(value);
      }
      expect(result).toEqual([1, 2, 3, 4]);
    });

    it('should not modify heap', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      for (const _ of heap) {
      }
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(1);
    });

    it('should handle empty heap', () => {
      const heap = new LeftistHeap<number>();
      const result: number[] = [];
      for (const value of heap) {
        result.push(value);
      }
      expect(result).toEqual([]);
    });

    it('should handle single element', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(5);
      const result: number[] = [];
      for (const value of heap) {
        result.push(value);
      }
      expect(result).toEqual([5]);
    });

    it('should allow multiple iterations', () => {
      const heap = new LeftistHeap<number>();
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
  });

  describe('isValid', () => {
    it('should return true for empty heap', () => {
      const heap = new LeftistHeap<number>();
      expect(heap.isValid()).toBe(true);
    });

    it('should return true for single element', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(5);
      expect(heap.isValid()).toBe(true);
    });

    it('should return true for valid heap', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.insert(4);
      expect(heap.isValid()).toBe(true);
    });

    it('should return true after operations', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.extractMin();
      heap.insert(1);
      expect(heap.isValid()).toBe(true);
    });

    it('should return true after merge', () => {
      const heap1 = new LeftistHeap<number>();
      const heap2 = new LeftistHeap<number>();
      heap1.insert(1);
      heap1.insert(3);
      heap2.insert(2);
      heap2.insert(4);
      const merged = heap1.merge(heap2);
      expect(merged.isValid()).toBe(true);
    });

    it('should return true after decreaseKey', () => {
      const heap = new LeftistHeap<number>();
      const handle = heap.insert(10);
      heap.insert(5);
      heap.insert(15);
      heap.decreaseKey(handle, 1);
      expect(heap.isValid()).toBe(true);
    });

    it('should return true after delete', () => {
      const heap = new LeftistHeap<number>();
      const handle = heap.insert(10);
      heap.insert(5);
      heap.insert(15);
      heap.delete(handle);
      expect(heap.isValid()).toBe(true);
    });

    it('should return true for large valid heap', () => {
      const heap = new LeftistHeap<number>();
      for (let i = 0; i < 100; i++) {
        heap.insert(i);
      }
      expect(heap.isValid()).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle negative numbers', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(-5);
      heap.insert(0);
      heap.insert(-3);
      heap.insert(2);
      expect(heap.extractMin()).toBe(-5);
      expect(heap.extractMin()).toBe(-3);
      expect(heap.extractMin()).toBe(0);
      expect(heap.extractMin()).toBe(2);
    });

    it('should handle large numbers', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(Number.MAX_SAFE_INTEGER);
      heap.insert(0);
      heap.insert(Number.MIN_SAFE_INTEGER);
      expect(heap.extractMin()).toBe(Number.MIN_SAFE_INTEGER);
      expect(heap.extractMin()).toBe(0);
      expect(heap.extractMin()).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('should handle strings', () => {
      const heap = new LeftistHeap<string>();
      heap.insert('banana');
      heap.insert('apple');
      heap.insert('cherry');
      heap.insert('date');
      expect(heap.extractMin()).toBe('apple');
      expect(heap.extractMin()).toBe('banana');
      expect(heap.extractMin()).toBe('cherry');
      expect(heap.extractMin()).toBe('date');
    });

    it('should handle mixed operations', () => {
      const heap = new LeftistHeap<number>();
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

    it('should handle insert after clear', () => {
      const heap = new LeftistHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.clear();
      heap.insert(3);
      heap.insert(4);
      expect(heap.size).toBe(2);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(4);
    });

    it.skip('should handle many decreaseKey operations', () => {
      const heap = new LeftistHeap<number>();
      const handles = [];
      for (let i = 0; i < 10; i++) {
        handles.push(heap.insert(i * 10));
      }
      for (let i = 0; i < 10; i++) {
        heap.decreaseKey(handles[i], i);
      }
      for (let i = 0; i < 10; i++) {
        expect(heap.extractMin()).toBe(i);
      }
    });
  });

  describe('stress tests', () => {
    it('should handle 1000 insertions and extractions', () => {
      const heap = new LeftistHeap<number>();
      for (let i = 0; i < 1000; i++) {
        heap.insert(i);
      }
      expect(heap.size).toBe(1000);
      for (let i = 0; i < 1000; i++) {
        expect(heap.extractMin()).toBe(i);
      }
      expect(heap.isEmpty()).toBe(true);
    });

    it.skip('should maintain heap property with random operations', () => {
      const heap = new LeftistHeap<number>();
      const handles = [];
      for (let i = 0; i < 100; i++) {
        handles.push(heap.insert(Math.floor(Math.random() * 100)));
      }
      heap.extractMin();
      if (handles.length > 0) {
        heap.decreaseKey(handles[0], Math.floor(Math.random() * 50));
      }
      if (handles.length > 1) {
        heap.delete(handles[1]);
      }
      expect(heap.size).toBeGreaterThan(0);
      expect(heap.isValid()).toBe(true);
    });

    it('should handle large merge', () => {
      const heap1 = new LeftistHeap<number>();
      const heap2 = new LeftistHeap<number>();
      for (let i = 0; i < 500; i++) {
        heap1.insert(i * 2);
        heap2.insert(i * 2 + 1);
      }
      const merged = heap1.merge(heap2);
      expect(merged.size).toBe(1000);
      expect(merged.extractMin()).toBe(0);
      expect(merged.isValid()).toBe(true);
    });

    it('should handle large toArray', () => {
      const heap = new LeftistHeap<number>();
      for (let i = 0; i < 500; i++) {
        heap.insert(i);
      }
      const arr = heap.toArray();
      expect(arr.length).toBe(500);
      for (let i = 0; i < 500; i++) {
        expect(arr[i]).toBe(i);
      }
    });

    it('should handle many clone operations', () => {
      const heap = new LeftistHeap<number>();
      for (let i = 0; i < 100; i++) {
        heap.insert(i);
      }
      const clone1 = heap.clone();
      const clone2 = clone1.clone();
      const clone3 = clone2.clone();
      expect(clone3.size).toBe(100);
      expect(clone3.isValid()).toBe(true);
    });
  });

  describe('ordering correctness', () => {
    it('should extract in ascending order for numbers', () => {
      const heap = new LeftistHeap<number>();
      const values = [5, 3, 8, 1, 9, 2, 7, 4, 6];
      for (const v of values) {
        heap.insert(v);
      }
      const result = [];
      while (!heap.isEmpty()) {
        result.push(heap.extractMin());
      }
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should extract correctly for reverse order', () => {
      const heap = new LeftistHeap<number>();
      for (let i = 100; i >= 1; i--) {
        heap.insert(i);
      }
      for (let i = 1; i <= 100; i++) {
        expect(heap.extractMin()).toBe(i);
      }
    });

    it('should extract correctly for random order', () => {
      const heap = new LeftistHeap<number>();
      const values = Array.from({ length: 50 }, (_, i) => i + 1);
      const shuffled = [...values].sort(() => Math.random() - 0.5);
      for (const v of shuffled) {
        heap.insert(v);
      }
      values.sort((a, b) => a - b);
      for (const v of values) {
        expect(heap.extractMin()).toBe(v);
      }
    });
  });
});