import { describe, it, expect, beforeEach } from 'vitest';
import { IntervalHeap } from '../src/core/interval-heap-2/index.js';

describe('IntervalHeap', () => {
  let heap: IntervalHeap<number>;

  beforeEach(() => {
    heap = new IntervalHeap<number>();
  });

  describe('constructor', () => {
    it('should create empty heap', () => {
      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should use default comparator', () => {
      const defaultHeap = new IntervalHeap<number>();
      defaultHeap.push(5);
      defaultHeap.push(3);
      defaultHeap.push(7);
      expect(defaultHeap.peekMin()).toBe(3);
      expect(defaultHeap.peekMax()).toBe(7);
    });

    it('should use custom comparator', () => {
      const revHeap = new IntervalHeap<number>({ comparator: (a, b) => b - a });
      revHeap.push(1);
      revHeap.push(3);
      revHeap.push(2);
      expect(revHeap.peekMin()).toBe(3);
      expect(revHeap.peekMax()).toBe(1);
    });

    it('should use custom comparator for strings', () => {
      const strHeap = new IntervalHeap<string>({ comparator: (a, b) => a.localeCompare(b) });
      strHeap.push('banana');
      strHeap.push('apple');
      strHeap.push('cherry');
      expect(strHeap.peekMin()).toBe('apple');
      expect(strHeap.peekMax()).toBe('cherry');
    });
  });

  describe('size', () => {
    it('should return 0 for empty heap', () => {
      expect(heap.size).toBe(0);
    });

    it('should track size after pushes', () => {
      heap.push(1);
      expect(heap.size).toBe(1);
      heap.push(2);
      expect(heap.size).toBe(2);
      heap.push(3);
      expect(heap.size).toBe(3);
    });

    it('should track size after pops', () => {
      heap.push(1);
      heap.push(2);
      heap.push(3);
      heap.popMin();
      expect(heap.size).toBe(2);
      heap.popMax();
      expect(heap.size).toBe(1);
    });

    it('should track size after clear', () => {
      heap.push(1);
      heap.push(2);
      heap.push(3);
      heap.clear();
      expect(heap.size).toBe(0);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty heap', () => {
      expect(heap.isEmpty()).toBe(true);
    });

    it('should return false after push', () => {
      heap.push(1);
      expect(heap.isEmpty()).toBe(false);
    });

    it('should return true after clear', () => {
      heap.push(1);
      heap.push(2);
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
    });

    it('should return true after all elements popped', () => {
      heap.push(1);
      heap.push(2);
      heap.popMin();
      heap.popMin();
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('push', () => {
    it('should add single element', () => {
      heap.push(5);
      expect(heap.size).toBe(1);
      expect(heap.peekMin()).toBe(5);
      expect(heap.peekMax()).toBe(5);
    });

    it('should add multiple elements', () => {
      heap.push(3);
      heap.push(1);
      heap.push(2);
      heap.push(4);
      expect(heap.size).toBe(4);
      expect(heap.peekMin()).toBe(1);
      expect(heap.peekMax()).toBe(4);
    });

    it('should handle duplicate values', () => {
      heap.push(5);
      heap.push(5);
      heap.push(3);
      expect(heap.size).toBe(3);
      expect(heap.peekMin()).toBe(3);
      expect(heap.peekMax()).toBe(5);
    });

    it('should handle negative numbers', () => {
      heap.push(-3);
      heap.push(-1);
      heap.push(-2);
      expect(heap.peekMin()).toBe(-3);
      expect(heap.peekMax()).toBe(-1);
    });

    it('should handle many pushes', () => {
      for (let i = 0; i < 100; i++) {
        heap.push(i);
      }
      expect(heap.size).toBe(100);
      expect(heap.peekMin()).toBe(0);
      expect(heap.peekMax()).toBe(99);
    });
  });

  describe('peekMin', () => {
    it('should return undefined for empty heap', () => {
      expect(heap.peekMin()).toBeUndefined();
    });

    it('should return min element', () => {
      heap.push(5);
      heap.push(3);
      heap.push(7);
      expect(heap.peekMin()).toBe(3);
    });

    it('should return same as max with single element', () => {
      heap.push(5);
      expect(heap.peekMin()).toBe(5);
      expect(heap.peekMax()).toBe(5);
    });

    it('should not modify heap', () => {
      heap.push(1);
      heap.push(2);
      heap.push(3);
      const min1 = heap.peekMin();
      const min2 = heap.peekMin();
      const min3 = heap.peekMin();
      expect(min1).toBe(min2);
      expect(min2).toBe(min3);
      expect(min1).toBe(1);
    });
  });

  describe('peekMax', () => {
    it('should return undefined for empty heap', () => {
      expect(heap.peekMax()).toBeUndefined();
    });

    it('should return max element', () => {
      heap.push(5);
      heap.push(3);
      heap.push(7);
      expect(heap.peekMax()).toBe(7);
    });

    it('should return same as min with single element', () => {
      heap.push(5);
      expect(heap.peekMax()).toBe(5);
      expect(heap.peekMin()).toBe(5);
    });

    it('should not modify heap', () => {
      heap.push(1);
      heap.push(2);
      heap.push(3);
      const max1 = heap.peekMax();
      const max2 = heap.peekMax();
      const max3 = heap.peekMax();
      expect(max1).toBe(max2);
      expect(max2).toBe(max3);
      expect(max1).toBe(3);
    });
  });

  describe('popMin', () => {
    it('should return undefined for empty heap', () => {
      expect(heap.popMin()).toBeUndefined();
    });

    it('should remove and return min element', () => {
      heap.push(5);
      heap.push(3);
      heap.push(7);
      const min = heap.popMin();
      expect(min).toBe(3);
      expect(heap.size).toBe(2);
      expect(heap.peekMin()).toBe(5);
    });

    it('should handle single element', () => {
      heap.push(5);
      const min = heap.popMin();
      expect(min).toBe(5);
      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should maintain heap property after pop', () => {
      heap.push(1);
      heap.push(3);
      heap.push(2);
      heap.push(4);
      heap.popMin();
      expect(heap.peekMin()).toBe(2);
      expect(heap.peekMax()).toBe(4);
    });

    it('should pop elements in min order', () => {
      heap.push(5);
      heap.push(1);
      heap.push(3);
      heap.push(4);
      heap.push(2);
      const popped: number[] = [];
      while (heap.size > 0) {
        popped.push(heap.popMin()!);
      }
      expect(popped).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('popMax', () => {
    it('should return undefined for empty heap', () => {
      expect(heap.popMax()).toBeUndefined();
    });

    it('should remove and return max element', () => {
      heap.push(5);
      heap.push(3);
      heap.push(7);
      const max = heap.popMax();
      expect(max).toBe(7);
      expect(heap.size).toBe(2);
      expect(heap.peekMax()).toBe(5);
    });

    it('should handle single element', () => {
      heap.push(5);
      const max = heap.popMax();
      expect(max).toBe(5);
      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should maintain heap property after pop', () => {
      heap.push(1);
      heap.push(3);
      heap.push(2);
      heap.push(4);
      heap.popMax();
      expect(heap.peekMin()).toBe(1);
      expect(heap.peekMax()).toBe(3);
    });

    it('should pop elements in max order', () => {
      heap.push(5);
      heap.push(1);
      heap.push(3);
      heap.push(4);
      heap.push(2);
      const popped: number[] = [];
      while (heap.size > 0) {
        popped.push(heap.popMax()!);
      }
      expect(popped).toEqual([5, 4, 3, 2, 1]);
    });
  });

  describe('clear', () => {
    it('should clear all elements', () => {
      heap.push(1);
      heap.push(2);
      heap.push(3);
      heap.clear();
      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);
      expect(heap.peekMin()).toBeUndefined();
      expect(heap.peekMax()).toBeUndefined();
    });

    it('should allow pushes after clear', () => {
      heap.push(1);
      heap.push(2);
      heap.clear();
      heap.push(3);
      heap.push(4);
      expect(heap.size).toBe(2);
      expect(heap.peekMin()).toBe(3);
      expect(heap.peekMax()).toBe(4);
    });

    it('should handle clear on empty heap', () => {
      heap.clear();
      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should handle multiple clears', () => {
      heap.push(1);
      heap.clear();
      heap.push(2);
      heap.clear();
      heap.push(3);
      expect(heap.size).toBe(1);
      expect(heap.peekMin()).toBe(3);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty heap', () => {
      expect(heap.toArray()).toEqual([]);
    });

    it('should return array with all elements', () => {
      heap.push(1);
      heap.push(2);
      heap.push(3);
      const arr = heap.toArray();
      expect(arr.length).toBe(3);
      expect(arr).toContain(1);
      expect(arr).toContain(2);
      expect(arr).toContain(3);
    });

    it('should return independent array', () => {
      heap.push(1);
      heap.push(2);
      const arr1 = heap.toArray();
      const arr2 = heap.toArray();
      arr1.push(999);
      expect(arr1.length).toBe(3);
      expect(arr2.length).toBe(2);
    });

    it('should not reflect changes to heap', () => {
      heap.push(1);
      heap.push(2);
      const arr = heap.toArray();
      heap.push(3);
      expect(arr.length).toBe(2);
    });
  });

  describe('contains', () => {
    it('should return false for empty heap', () => {
      expect(heap.contains(5)).toBe(false);
    });

    it('should return true for existing value', () => {
      heap.push(1);
      heap.push(2);
      heap.push(3);
      expect(heap.contains(2)).toBe(true);
    });

    it('should return false for non-existent value', () => {
      heap.push(1);
      heap.push(2);
      heap.push(3);
      expect(heap.contains(5)).toBe(false);
    });

    it('should handle duplicate values', () => {
      heap.push(5);
      heap.push(5);
      expect(heap.contains(5)).toBe(true);
    });

    it('should work after pops', () => {
      heap.push(1);
      heap.push(2);
      heap.push(3);
      heap.popMin();
      expect(heap.contains(1)).toBe(false);
      expect(heap.contains(2)).toBe(true);
    });
  });

  describe('remove', () => {
    it('should return false for empty heap', () => {
      expect(heap.remove(5)).toBe(false);
    });

    it('should return false for non-existent value', () => {
      heap.push(1);
      heap.push(2);
      heap.push(3);
      expect(heap.remove(5)).toBe(false);
      expect(heap.size).toBe(3);
    });

    it('should return true and remove existing value', () => {
      heap.push(1);
      heap.push(2);
      heap.push(3);
      const result = heap.remove(2);
      expect(result).toBe(true);
      expect(heap.size).toBe(2);
      expect(heap.contains(2)).toBe(false);
    });

    it('should remove one instance of duplicate', () => {
      heap.push(5);
      heap.push(5);
      heap.push(3);
      heap.remove(5);
      expect(heap.size).toBe(2);
      expect(heap.contains(5)).toBe(true);
    });

    it('should maintain heap property after remove', () => {
      heap.push(1);
      heap.push(3);
      heap.push(2);
      heap.push(4);
      heap.remove(2);
      expect(heap.peekMin()).toBe(1);
      expect(heap.peekMax()).toBe(4);
    });

    it('should remove from middle of heap', () => {
      heap.push(5);
      heap.push(1);
      heap.push(10);
      heap.push(3);
      heap.push(7);
      heap.remove(5);
      expect(heap.size).toBe(4);
      expect(heap.contains(5)).toBe(false);
      expect(heap.contains(1)).toBe(true);
      expect(heap.contains(10)).toBe(true);
    });
  });

  describe('replace', () => {
    it('should return false for empty heap', () => {
      expect(heap.replace(5, 10)).toBe(false);
    });

    it('should return false for non-existent value', () => {
      heap.push(1);
      heap.push(2);
      heap.push(3);
      expect(heap.replace(5, 10)).toBe(false);
      expect(heap.size).toBe(3);
    });

    it('should return true and replace existing value', () => {
      heap.push(1);
      heap.push(2);
      heap.push(3);
      const result = heap.replace(2, 10);
      expect(result).toBe(true);
      expect(heap.size).toBe(3);
      expect(heap.contains(2)).toBe(false);
      expect(heap.contains(10)).toBe(true);
    });

    it('should maintain heap property after replace', () => {
      heap.push(1);
      heap.push(5);
      heap.push(3);
      heap.replace(5, 10);
      expect(heap.peekMin()).toBe(1);
      expect(heap.peekMax()).toBe(10);
    });

    it('should replace with smaller value', () => {
      heap.push(5);
      heap.push(3);
      heap.push(7);
      heap.replace(3, 1);
      expect(heap.peekMin()).toBe(1);
      expect(heap.peekMax()).toBe(7);
    });

    it('should replace with larger value', () => {
      heap.push(5);
      heap.push(3);
      heap.push(7);
      heap.replace(5, 10);
      expect(heap.peekMin()).toBe(3);
      expect(heap.peekMax()).toBe(10);
    });

    it('should replace with duplicate value', () => {
      heap.push(5);
      heap.push(3);
      heap.push(7);
      heap.replace(5, 3);
      expect(heap.size).toBe(3);
    });
  });

  describe('getStats', () => {
    it('should return stats for empty heap', () => {
      const stats = heap.getStats();
      expect(stats.size).toBe(0);
      expect(stats.nodeCount).toBe(0);
      expect(stats.hasSingleElement).toBe(false);
    });

    it('should return stats for single element', () => {
      heap.push(5);
      const stats = heap.getStats();
      expect(stats.size).toBe(1);
      expect(stats.nodeCount).toBe(1);
      expect(stats.hasSingleElement).toBe(true);
    });

    it('should return stats for even number of elements', () => {
      heap.push(1);
      heap.push(2);
      heap.push(3);
      heap.push(4);
      const stats = heap.getStats();
      expect(stats.size).toBe(4);
      expect(stats.nodeCount).toBe(2);
      expect(stats.hasSingleElement).toBe(false);
    });

    it('should return stats for odd number of elements', () => {
      heap.push(1);
      heap.push(2);
      heap.push(3);
      heap.push(4);
      heap.push(5);
      const stats = heap.getStats();
      expect(stats.size).toBe(5);
      expect(stats.nodeCount).toBe(3);
      expect(stats.hasSingleElement).toBe(true);
    });
  });

  describe('from static', () => {
    it('should create heap from array', () => {
      const newHeap = IntervalHeap.from([3, 1, 4, 2]);
      expect(newHeap.size).toBe(4);
      expect(newHeap.peekMin()).toBe(1);
      expect(newHeap.peekMax()).toBe(4);
    });

    it('should create empty heap from empty array', () => {
      const newHeap = IntervalHeap.from<number>([]);
      expect(newHeap.size).toBe(0);
      expect(newHeap.isEmpty()).toBe(true);
    });

    it('should use default comparator', () => {
      const newHeap = IntervalHeap.from([5, 3, 1, 4, 2]);
      expect(newHeap.peekMin()).toBe(1);
      expect(newHeap.peekMax()).toBe(5);
    });

    it('should use custom comparator', () => {
      const revHeap = IntervalHeap.from([1, 3, 2], { comparator: (a, b) => b - a });
      expect(revHeap.peekMin()).toBe(3);
      expect(revHeap.peekMax()).toBe(1);
    });

    it('should handle duplicate values', () => {
      const newHeap = IntervalHeap.from([5, 3, 5, 1, 3]);
      expect(newHeap.size).toBe(5);
      expect(newHeap.peekMin()).toBe(1);
      expect(newHeap.peekMax()).toBe(5);
    });

    it('should handle large arrays', () => {
      const arr: number[] = [];
      for (let i = 0; i < 100; i++) {
        arr.push(i);
      }
      const newHeap = IntervalHeap.from(arr);
      expect(newHeap.size).toBe(100);
      expect(newHeap.peekMin()).toBe(0);
      expect(newHeap.peekMax()).toBe(99);
    });
  });

  describe('mixed operations', () => {
    it('should handle alternating min and max pops', () => {
      heap.push(5);
      heap.push(1);
      heap.push(3);
      heap.push(4);
      heap.push(2);
      const results: number[] = [];
      results.push(heap.popMin()!);
      results.push(heap.popMax()!);
      results.push(heap.popMin()!);
      results.push(heap.popMax()!);
      results.push(heap.popMin()!);
      expect(results).toEqual([1, 5, 2, 4, 3]);
    });

    it('should handle pushes between pops', () => {
      heap.push(5);
      heap.push(1);
      heap.popMin();
      heap.push(3);
      heap.popMax();
      heap.push(2);
      expect(heap.peekMin()).toBe(2);
      expect(heap.peekMax()).toBe(3);
    });

    it('should handle removes between operations', () => {
      heap.push(5);
      heap.push(1);
      heap.push(3);
      heap.remove(5);
      heap.push(4);
      heap.popMin();
      expect(heap.peekMin()).toBe(3);
      expect(heap.peekMax()).toBe(4);
    });

    it('should handle replaces between operations', () => {
      heap.push(5);
      heap.push(1);
      heap.push(10);
      heap.replace(10, 3);
      heap.popMax();
      expect(heap.peekMax()).toBe(3);
    });
  });

  describe('edge cases', () => {
    it('should handle many random pushes', () => {
      const values: number[] = [];
      for (let i = 0; i < 1000; i++) {
        const val = Math.floor(Math.random() * 1000);
        heap.push(val);
        values.push(val);
      }
      expect(heap.size).toBe(1000);
      expect(heap.peekMin()).toBe(Math.min(...values));
      expect(heap.peekMax()).toBe(Math.max(...values));
    });

    it('should handle sequential pushes', () => {
      for (let i = 1; i <= 100; i++) {
        heap.push(i);
      }
      expect(heap.size).toBe(100);
      expect(heap.peekMin()).toBe(1);
      expect(heap.peekMax()).toBe(100);
    });

    it('should handle reverse sequential pushes', () => {
      for (let i = 100; i >= 1; i--) {
        heap.push(i);
      }
      expect(heap.size).toBe(100);
      expect(heap.peekMin()).toBe(1);
      expect(heap.peekMax()).toBe(100);
    });

    it('should handle alternating min and max values', () => {
      for (let i = 0; i < 50; i++) {
        heap.push(i);
        heap.push(99 - i);
      }
      expect(heap.size).toBe(100);
      expect(heap.peekMin()).toBe(0);
      expect(heap.peekMax()).toBe(99);
    });

    it('should handle pop all and rebuild', () => {
      heap.push(1);
      heap.push(2);
      heap.push(3);
      while (heap.size > 0) {
        heap.popMin();
      }
      expect(heap.isEmpty()).toBe(true);
      heap.push(4);
      heap.push(5);
      expect(heap.peekMin()).toBe(4);
      expect(heap.peekMax()).toBe(5);
    });
  });

  describe('string values', () => {
    let strHeap: IntervalHeap<string>;

    beforeEach(() => {
      strHeap = new IntervalHeap<string>();
    });

    it('should handle string values', () => {
      strHeap.push('banana');
      strHeap.push('apple');
      strHeap.push('cherry');
      expect(strHeap.peekMin()).toBe('apple');
      expect(strHeap.peekMax()).toBe('cherry');
    });

    it('should contain string values', () => {
      strHeap.push('apple');
      strHeap.push('banana');
      expect(strHeap.contains('apple')).toBe(true);
      expect(strHeap.contains('cherry')).toBe(false);
    });

    it('should remove string values', () => {
      strHeap.push('apple');
      strHeap.push('banana');
      const result = strHeap.remove('apple');
      expect(result).toBe(true);
      expect(strHeap.contains('apple')).toBe(false);
      expect(strHeap.contains('banana')).toBe(true);
    });

    it('should replace string values', () => {
      strHeap.push('apple');
      strHeap.push('banana');
      const result = strHeap.replace('apple', 'cherry');
      expect(result).toBe(true);
      expect(strHeap.contains('apple')).toBe(false);
      expect(strHeap.contains('cherry')).toBe(true);
    });

    it('should create from string array', () => {
      const newHeap = IntervalHeap.from(['banana', 'apple', 'cherry']);
      expect(newHeap.peekMin()).toBe('apple');
      expect(newHeap.peekMax()).toBe('cherry');
    });
  });

  describe('custom comparator', () => {
    it('should work with reverse comparator', () => {
      const revHeap = new IntervalHeap<number>({ comparator: (a, b) => b - a });
      revHeap.push(1);
      revHeap.push(3);
      revHeap.push(2);
      expect(revHeap.peekMin()).toBe(3);
      expect(revHeap.peekMax()).toBe(1);
    });

    it('should work with reverse comparator and pop operations', () => {
      const revHeap = new IntervalHeap<number>({ comparator: (a, b) => b - a });
      revHeap.push(1);
      revHeap.push(2);
      revHeap.push(3);
      expect(revHeap.popMin()).toBe(3);
      expect(revHeap.popMin()).toBe(2);
      expect(revHeap.popMin()).toBe(1);
    });

    it('should work with reverse comparator and from', () => {
      const revHeap = IntervalHeap.from([1, 2, 3], { comparator: (a, b) => b - a });
      expect(revHeap.peekMin()).toBe(3);
      expect(revHeap.peekMax()).toBe(1);
    });
  });

  describe('object values', () => {
    interface Item {
      priority: number;
      value: string;
    }

    let objHeap: IntervalHeap<Item>;

    beforeEach(() => {
      objHeap = new IntervalHeap<Item>({
        comparator: (a, b) => a.priority - b.priority,
      });
    });

    it('should handle object values', () => {
      objHeap.push({ priority: 2, value: 'b' });
      objHeap.push({ priority: 1, value: 'a' });
      objHeap.push({ priority: 3, value: 'c' });
      expect(objHeap.peekMin()!.priority).toBe(1);
      expect(objHeap.peekMax()!.priority).toBe(3);
    });

    it('should contain object values', () => {
      const item1 = { priority: 1, value: 'a' };
      const item2 = { priority: 2, value: 'b' };
      objHeap.push(item1);
      objHeap.push(item2);
      expect(objHeap.contains(item1)).toBe(true);
      expect(objHeap.contains(item2)).toBe(true);
    });

    it('should remove object values', () => {
      const item1 = { priority: 1, value: 'a' };
      const item2 = { priority: 2, value: 'b' };
      objHeap.push(item1);
      objHeap.push(item2);
      const result = objHeap.remove(item1);
      expect(result).toBe(true);
      expect(objHeap.contains(item1)).toBe(false);
      expect(objHeap.contains(item2)).toBe(true);
    });

    it('should replace object values', () => {
      const item1 = { priority: 1, value: 'a' };
      const item2 = { priority: 2, value: 'b' };
      objHeap.push(item1);
      objHeap.push(item2);
      const result = objHeap.replace(item1, { priority: 3, value: 'c' });
      expect(result).toBe(true);
      expect(objHeap.contains(item1)).toBe(false);
      expect(objHeap.peekMin()!.priority).toBe(2);
      expect(objHeap.peekMax()!.priority).toBe(3);
    });
  });
});
