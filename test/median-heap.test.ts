import { describe, it, expect } from 'vitest';
import { MedianHeap } from '../src/core/median-heap/index.js';

describe('MedianHeap', () => {
  describe('empty heap', () => {
    it('should create empty heap', () => {
      const heap = new MedianHeap<number>();
      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);
      expect(heap.toArray()).toEqual([]);
      expect(heap.contains(5)).toBe(false);
    });

    it('should throw error when calling median on empty heap', () => {
      const heap = new MedianHeap<number>();
      expect(() => heap.median()).toThrow('Heap is empty');
    });

    it('should throw error when calling min on empty heap', () => {
      const heap = new MedianHeap<number>();
      expect(() => heap.min()).toThrow('Heap is empty');
    });

    it('should throw error when calling max on empty heap', () => {
      const heap = new MedianHeap<number>();
      expect(() => heap.max()).toThrow('Heap is empty');
    });

    it('should throw error when calling lowerMedian on empty heap', () => {
      const heap = new MedianHeap<number>();
      expect(() => heap.lowerMedian()).toThrow('Heap is empty');
    });

    it('should throw error when calling upperMedian on empty heap', () => {
      const heap = new MedianHeap<number>();
      expect(() => heap.upperMedian()).toThrow('Heap is empty');
    });

    it('should return false for remove on empty heap', () => {
      const heap = new MedianHeap<number>();
      expect(heap.remove(5)).toBe(false);
      expect(heap.size).toBe(0);
    });

    it('should clear empty heap', () => {
      const heap = new MedianHeap<number>();
      heap.clear();
      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('insert', () => {
    it('should insert single element', () => {
      const heap = new MedianHeap<number>();
      heap.insert(5);
      expect(heap.size).toBe(1);
      expect(heap.isEmpty()).toBe(false);
      expect(heap.contains(5)).toBe(true);
    });

    it('should insert multiple elements', () => {
      const heap = new MedianHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      heap.insert(9);
      expect(heap.size).toBe(5);
      expect(heap.contains(5)).toBe(true);
      expect(heap.contains(3)).toBe(true);
      expect(heap.contains(7)).toBe(true);
      expect(heap.contains(1)).toBe(true);
      expect(heap.contains(9)).toBe(true);
    });

    it('should handle duplicate values', () => {
      const heap = new MedianHeap<number>();
      heap.insert(5);
      heap.insert(5);
      heap.insert(3);
      heap.insert(5);
      expect(heap.size).toBe(4);
      expect(heap.toArray()).toEqual([3, 5, 5, 5]);
    });

    it('should handle negative values', () => {
      const heap = new MedianHeap<number>();
      heap.insert(-5);
      heap.insert(-3);
      heap.insert(-7);
      expect(heap.size).toBe(3);
      expect(heap.toArray()).toEqual([-7, -5, -3]);
    });

    it('should handle large dataset', () => {
      const heap = new MedianHeap<number>();
      for (let i = 0; i < 1000; i++) {
        heap.insert(i);
      }
      expect(heap.size).toBe(1000);
      expect(heap.contains(0)).toBe(true);
      expect(heap.contains(999)).toBe(true);
    });
  });

  describe('median', () => {
    it('should return single element as median', () => {
      const heap = new MedianHeap<number>();
      heap.insert(5);
      expect(heap.median()).toBe(5);
    });

    it('should return average for even number of elements', () => {
      const heap = new MedianHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.insert(4);
      expect(heap.median()).toBe(2.5);
    });

    it('should return middle element for odd number of elements', () => {
      const heap = new MedianHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.insert(4);
      heap.insert(5);
      expect(heap.median()).toBe(3);
    });

    it('should update median after insert', () => {
      const heap = new MedianHeap<number>();
      heap.insert(1);
      expect(heap.median()).toBe(1);
      heap.insert(2);
      expect(heap.median()).toBe(1.5);
      heap.insert(3);
      expect(heap.median()).toBe(2);
      heap.insert(4);
      expect(heap.median()).toBe(2.5);
      heap.insert(5);
      expect(heap.median()).toBe(3);
    });

    it('should handle unsorted insertions', () => {
      const heap = new MedianHeap<number>();
      heap.insert(5);
      heap.insert(1);
      heap.insert(9);
      heap.insert(3);
      heap.insert(7);
      expect(heap.median()).toBe(5);
    });
  });

  describe('lowerMedian and upperMedian', () => {
    it('should return same value for single element', () => {
      const heap = new MedianHeap<number>();
      heap.insert(5);
      expect(heap.lowerMedian()).toBe(5);
      expect(heap.upperMedian()).toBe(5);
    });

    it('should return two different values for even count', () => {
      const heap = new MedianHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.insert(4);
      expect(heap.lowerMedian()).toBe(2);
      expect(heap.upperMedian()).toBe(3);
    });

    it('should return same value for odd count', () => {
      const heap = new MedianHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.insert(4);
      heap.insert(5);
      expect(heap.lowerMedian()).toBe(3);
      expect(heap.upperMedian()).toBe(3);
    });

    it('should handle unsorted insertions', () => {
      const heap = new MedianHeap<number>();
      heap.insert(5);
      heap.insert(1);
      heap.insert(9);
      heap.insert(3);
      heap.insert(7);
      expect(heap.lowerMedian()).toBe(5);
      expect(heap.upperMedian()).toBe(5);
    });
  });

  describe('min and max', () => {
    it('should return same value for single element', () => {
      const heap = new MedianHeap<number>();
      heap.insert(5);
      expect(heap.min()).toBe(5);
      expect(heap.max()).toBe(5);
    });

    it('should return correct min and max', () => {
      const heap = new MedianHeap<number>();
      heap.insert(5);
      heap.insert(1);
      heap.insert(9);
      heap.insert(3);
      heap.insert(7);
      expect(heap.min()).toBe(1);
      expect(heap.max()).toBe(9);
    });

    it('should handle negative values', () => {
      const heap = new MedianHeap<number>();
      heap.insert(-5);
      heap.insert(-1);
      heap.insert(-9);
      heap.insert(-3);
      heap.insert(-7);
      expect(heap.min()).toBe(-9);
      expect(heap.max()).toBe(-1);
    });

    it('should update after insert', () => {
      const heap = new MedianHeap<number>();
      heap.insert(5);
      expect(heap.min()).toBe(5);
      expect(heap.max()).toBe(5);
      heap.insert(1);
      expect(heap.min()).toBe(1);
      expect(heap.max()).toBe(5);
      heap.insert(9);
      expect(heap.min()).toBe(1);
      expect(heap.max()).toBe(9);
    });
  });

  describe('remove', () => {
    it('should remove single element', () => {
      const heap = new MedianHeap<number>();
      heap.insert(5);
      expect(heap.remove(5)).toBe(true);
      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);
      expect(heap.contains(5)).toBe(false);
    });

    it('should remove element from middle', () => {
      const heap = new MedianHeap<number>();
      heap.insert(1);
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(9);
      expect(heap.remove(5)).toBe(true);
      expect(heap.size).toBe(4);
      expect(heap.contains(5)).toBe(false);
      expect(heap.toArray()).toEqual([1, 3, 7, 9]);
    });

    it('should remove min element', () => {
      const heap = new MedianHeap<number>();
      heap.insert(1);
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(9);
      expect(heap.remove(1)).toBe(true);
      expect(heap.size).toBe(4);
      expect(heap.min()).toBe(3);
      expect(heap.toArray()).toEqual([3, 5, 7, 9]);
    });

    it('should remove max element', () => {
      const heap = new MedianHeap<number>();
      heap.insert(1);
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(9);
      expect(heap.remove(9)).toBe(true);
      expect(heap.size).toBe(4);
      expect(heap.max()).toBe(7);
      expect(heap.toArray()).toEqual([1, 3, 5, 7]);
    });

    it('should remove duplicate elements', () => {
      const heap = new MedianHeap<number>();
      heap.insert(5);
      heap.insert(5);
      heap.insert(3);
      heap.insert(5);
      expect(heap.remove(5)).toBe(true);
      expect(heap.size).toBe(3);
      expect(heap.remove(5)).toBe(true);
      expect(heap.size).toBe(2);
      expect(heap.remove(5)).toBe(true);
      expect(heap.size).toBe(1);
    });

    it('should return false for non-existent element', () => {
      const heap = new MedianHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.remove(1)).toBe(false);
      expect(heap.remove(10)).toBe(false);
      expect(heap.size).toBe(3);
    });

    it('should update median after remove', () => {
      const heap = new MedianHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.insert(4);
      heap.insert(5);
      expect(heap.median()).toBe(3);
      heap.remove(3);
      expect(heap.median()).toBe(3);
      heap.remove(1);
      expect(heap.median()).toBe(4);
    });
  });

  describe('size', () => {
    it('should track size correctly', () => {
      const heap = new MedianHeap<number>();
      expect(heap.size).toBe(0);
      heap.insert(1);
      expect(heap.size).toBe(1);
      heap.insert(2);
      heap.insert(3);
      expect(heap.size).toBe(3);
      heap.remove(2);
      expect(heap.size).toBe(2);
      heap.clear();
      expect(heap.size).toBe(0);
    });
  });

  describe('isEmpty', () => {
    it('should return correct empty status', () => {
      const heap = new MedianHeap<number>();
      expect(heap.isEmpty()).toBe(true);
      heap.insert(1);
      expect(heap.isEmpty()).toBe(false);
      heap.insert(2);
      expect(heap.isEmpty()).toBe(false);
      heap.remove(1);
      heap.remove(2);
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('should empty heap', () => {
      const heap = new MedianHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size).toBe(0);
      expect(heap.toArray()).toEqual([]);
      expect(() => heap.median()).toThrow('Heap is empty');
    });

    it('should be idempotent', () => {
      const heap = new MedianHeap<number>();
      heap.clear();
      heap.clear();
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('toArray', () => {
    it('should return sorted array', () => {
      const heap = new MedianHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      heap.insert(9);
      expect(heap.toArray()).toEqual([1, 3, 5, 7, 9]);
    });

    it('should return empty array for empty heap', () => {
      const heap = new MedianHeap<number>();
      expect(heap.toArray()).toEqual([]);
    });

    it('should return array for single element', () => {
      const heap = new MedianHeap<number>();
      heap.insert(5);
      expect(heap.toArray()).toEqual([5]);
    });
  });

  describe('clone', () => {
    it('should create independent copy', () => {
      const heap1 = new MedianHeap<number>();
      heap1.insert(5);
      heap1.insert(3);
      heap1.insert(7);
      const heap2 = heap1.clone();
      expect(heap2.toArray()).toEqual([3, 5, 7]);
      expect(heap2.size).toBe(3);
    });

    it('should not affect original when clone is modified', () => {
      const heap1 = new MedianHeap<number>();
      heap1.insert(5);
      heap1.insert(3);
      heap1.insert(7);
      const heap2 = heap1.clone();
      heap2.insert(9);
      heap2.remove(3);
      expect(heap1.toArray()).toEqual([3, 5, 7]);
      expect(heap2.toArray()).toEqual([5, 7, 9]);
    });

    it('should clone empty heap', () => {
      const heap1 = new MedianHeap<number>();
      const heap2 = heap1.clone();
      expect(heap2.isEmpty()).toBe(true);
      expect(heap2.size).toBe(0);
    });
  });

  describe('fromArray', () => {
    it('should create heap from array', () => {
      const heap = MedianHeap.fromArray([5, 3, 7, 1, 9]);
      expect(heap.size).toBe(5);
      expect(heap.toArray()).toEqual([1, 3, 5, 7, 9]);
      expect(heap.median()).toBe(5);
    });

    it('should create heap from empty array', () => {
      const heap = MedianHeap.fromArray([]);
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size).toBe(0);
    });

    it('should create heap from single element array', () => {
      const heap = MedianHeap.fromArray([5]);
      expect(heap.size).toBe(1);
      expect(heap.median()).toBe(5);
    });

    it('should handle duplicate values in array', () => {
      const heap = MedianHeap.fromArray([5, 5, 3, 5, 1]);
      expect(heap.size).toBe(5);
      expect(heap.toArray()).toEqual([1, 3, 5, 5, 5]);
    });

    it('should work with custom comparator', () => {
      const heap = MedianHeap.fromArray(
        [{ value: 5 }, { value: 3 }, { value: 7 }],
        { comparator: (a, b) => a.value - b.value }
      );
      expect(heap.size).toBe(3);
      expect(heap.min().value).toBe(3);
      expect(heap.max().value).toBe(7);
    });
  });

  describe('forEach', () => {
    it('should iterate over all elements', () => {
      const heap = new MedianHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      const result: number[] = [];
      heap.forEach(item => result.push(item));
      expect(result).toEqual([3, 5, 7]);
    });

    it('should provide correct index', () => {
      const heap = new MedianHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      const indices: number[] = [];
      heap.forEach((_, index) => indices.push(index));
      expect(indices).toEqual([0, 1, 2]);
    });

    it('should not iterate over empty heap', () => {
      const heap = new MedianHeap<number>();
      let count = 0;
      heap.forEach(() => count++);
      expect(count).toBe(0);
    });
  });

  describe('Symbol.iterator', () => {
    it('should support for...of loop', () => {
      const heap = new MedianHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      const result: number[] = [];
      for (const item of heap) {
        result.push(item);
      }
      expect(result).toEqual([3, 5, 7]);
    });

    it('should support spread operator', () => {
      const heap = new MedianHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      const result = [...heap];
      expect(result).toEqual([3, 5, 7]);
    });

    it('should support Array.from', () => {
      const heap = new MedianHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      const result = Array.from(heap);
      expect(result).toEqual([3, 5, 7]);
    });

    it('should not iterate over empty heap', () => {
      const heap = new MedianHeap<number>();
      const result = [...heap];
      expect(result).toEqual([]);
    });
  });

  describe('contains', () => {
    it('should return true for existing value', () => {
      const heap = new MedianHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.contains(5)).toBe(true);
      expect(heap.contains(3)).toBe(true);
      expect(heap.contains(7)).toBe(true);
    });

    it('should return false for non-existing value', () => {
      const heap = new MedianHeap<number>();
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.contains(1)).toBe(false);
      expect(heap.contains(10)).toBe(false);
    });

    it('should work with duplicates', () => {
      const heap = new MedianHeap<number>();
      heap.insert(5);
      heap.insert(5);
      heap.insert(3);
      expect(heap.contains(5)).toBe(true);
    });

    it('should return false for empty heap', () => {
      const heap = new MedianHeap<number>();
      expect(heap.contains(5)).toBe(false);
    });
  });

  describe('custom comparator', () => {
    it('should work with custom comparator for objects', () => {
      const heap = new MedianHeap<{ value: number }>({ comparator: (a, b) => a.value - b.value });
      heap.insert({ value: 5 });
      heap.insert({ value: 3 });
      heap.insert({ value: 7 });
      expect(heap.min().value).toBe(3);
      expect(heap.max().value).toBe(7);
      expect(heap.median().value).toBe(5);
    });

    it('should work with reverse comparator', () => {
      const heap = new MedianHeap<number>({ comparator: (a, b) => b - a });
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.min()).toBe(7);
      expect(heap.max()).toBe(3);
    });

    it('should work with custom comparator for strings', () => {
      const heap = new MedianHeap<string>({ comparator: (a, b) => a.localeCompare(b) });
      heap.insert('zebra');
      heap.insert('apple');
      heap.insert('banana');
      expect(heap.min()).toBe('apple');
      expect(heap.max()).toBe('zebra');
    });
  });

  describe('stress tests', () => {
    it('should handle large dataset', () => {
      const heap = new MedianHeap<number>();
      for (let i = 0; i < 1000; i++) {
        heap.insert(i);
      }
      expect(heap.size).toBe(1000);
      expect(heap.min()).toBe(0);
      expect(heap.max()).toBe(999);
      expect(heap.median()).toBe(499.5);
    });

    it('should handle many insertions and removals', () => {
      const heap = new MedianHeap<number>();
      for (let i = 0; i < 100; i++) {
        heap.insert(i);
      }
      for (let i = 0; i < 50; i++) {
        heap.remove(i);
      }
      expect(heap.size).toBe(50);
      expect(heap.min()).toBe(50);
      expect(heap.max()).toBe(99);
    });

    it('should handle random operations', () => {
      const heap = new MedianHeap<number>();
      const arr: number[] = [];
      for (let i = 0; i < 100; i++) {
        const value = Math.floor(Math.random() * 100);
        heap.insert(value);
        arr.push(value);
      }
      arr.sort((a, b) => a - b);
      expect(heap.size).toBe(100);
      expect(heap.min()).toBe(arr[0]);
      expect(heap.max()).toBe(arr[arr.length - 1]);
    });
  });

  describe('edge cases', () => {
    it('should handle very large numbers', () => {
      const heap = new MedianHeap<number>();
      heap.insert(Number.MAX_VALUE);
      heap.insert(0);
      heap.insert(Number.MIN_SAFE_INTEGER);
      expect(heap.min()).toBe(Number.MIN_SAFE_INTEGER);
      expect(heap.max()).toBe(Number.MAX_VALUE);
    });

    it('should handle floating point numbers', () => {
      const heap = new MedianHeap<number>();
      heap.insert(1.5);
      heap.insert(2.7);
      heap.insert(0.3);
      expect(heap.toArray()).toEqual([0.3, 1.5, 2.7]);
    });

    it('should handle mixed positive and negative', () => {
      const heap = new MedianHeap<number>();
      heap.insert(-5);
      heap.insert(0);
      heap.insert(5);
      expect(heap.toArray()).toEqual([-5, 0, 5]);
      expect(heap.median()).toBe(0);
    });
  });
});