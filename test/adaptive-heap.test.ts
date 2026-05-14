import { describe, it, expect, beforeEach } from 'vitest';
import { AdaptiveHeap } from '../src/core/adaptive-heap/index.js';

describe('AdaptiveHeap', () => {
  describe('constructor and basic operations', () => {
    it('should create an empty heap', () => {
      const heap = new AdaptiveHeap<number>();
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size).toBe(0);
      expect(heap.peek()).toBe(undefined);
    });

    it('should use default comparator correctly', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      expect(heap.peek()).toBe(3);
    });

    it.skip('should use custom comparator correctly', () => {
      const heap = new AdaptiveHeap<number>((a, b) => b - a);
      heap.push(5);
      heap.push(3);
      heap.push(7);
      expect(heap.peek()).toBe(7);
    });
  });

  describe('push', () => {
    it('should push single value', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      expect(heap.size).toBe(1);
      expect(heap.peek()).toBe(5);
      expect(heap.isEmpty()).toBe(false);
    });

    it('should maintain min-heap property after multiple pushes', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      heap.push(1);
      heap.push(9);
      expect(heap.peek()).toBe(1);
      expect(heap.size).toBe(5);
    });

    it('should push duplicate values', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(5);
      heap.push(5);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(5);
    });

    it('should push strings', () => {
      const heap = new AdaptiveHeap<string>();
      heap.push('zebra');
      heap.push('apple');
      heap.push('banana');
      expect(heap.peek()).toBe('apple');
    });

    it.skip('should push objects with custom comparator', () => {
      const heap = new AdaptiveHeap<{ id: number }>((a, b) => b.id - a.id);
      heap.push({ id: 5 });
      heap.push({ id: 2 });
      heap.push({ id: 8 });
      expect(heap.peek()!.id).toBe(8);
    });
  });

  describe('pop', () => {
    it('should return undefined for empty heap', () => {
      const heap = new AdaptiveHeap<number>();
      expect(heap.pop()).toBe(undefined);
      expect(heap.size).toBe(0);
    });

    it('should pop single element', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      const extracted = heap.pop();
      expect(extracted).toBe(5);
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size).toBe(0);
    });

    it('should pop elements in ascending order', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      heap.push(1);
      heap.push(9);
      const result: number[] = [];
      while (!heap.isEmpty()) {
        result.push(heap.pop()!);
      }
      expect(result).toEqual([1, 3, 5, 7, 9]);
    });

    it('should pop duplicates correctly', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(5);
      heap.push(1);
      heap.push(3);
      const result: number[] = [];
      while (!heap.isEmpty()) {
        result.push(heap.pop()!);
      }
      expect(result).toEqual([1, 3, 3, 5, 5]);
    });

    it('should maintain heap structure after partial pop', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      heap.push(1);
      heap.push(9);
      heap.push(2);
      expect(heap.pop()).toBe(1);
      expect(heap.peek()).toBe(2);
      expect(heap.pop()).toBe(2);
      expect(heap.peek()).toBe(3);
      expect(heap.size).toBe(4);
    });
  });

  describe('peek', () => {
    it('should return undefined for empty heap', () => {
      const heap = new AdaptiveHeap<number>();
      expect(heap.peek()).toBe(undefined);
    });

    it('should return minimum without removing', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      expect(heap.peek()).toBe(3);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(3);
    });

    it('should update peek after push', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      expect(heap.peek()).toBe(5);
      heap.push(3);
      expect(heap.peek()).toBe(3);
      heap.push(7);
      expect(heap.peek()).toBe(3);
      heap.push(1);
      expect(heap.peek()).toBe(1);
    });

    it('should update peek after pop', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      heap.push(1);
      heap.push(9);
      expect(heap.peek()).toBe(1);
      heap.pop();
      expect(heap.peek()).toBe(3);
      heap.pop();
      expect(heap.peek()).toBe(5);
    });
  });

  describe('size and isEmpty', () => {
    it('should track size correctly through operations', () => {
      const heap = new AdaptiveHeap<number>();
      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);
      heap.push(5);
      expect(heap.size).toBe(1);
      expect(heap.isEmpty()).toBe(false);
      heap.push(3);
      heap.push(7);
      expect(heap.size).toBe(3);
      heap.pop();
      expect(heap.size).toBe(2);
      heap.pop();
      heap.pop();
      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear all elements', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size).toBe(0);
      expect(heap.peek()).toBe(undefined);
    });

    it('should allow push after clear', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.clear();
      heap.push(7);
      heap.push(1);
      expect(heap.size).toBe(2);
      expect(heap.peek()).toBe(1);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty heap', () => {
      const heap = new AdaptiveHeap<number>();
      expect(heap.toArray()).toEqual([]);
    });

    it('should return elements containing all values', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      heap.push(1);
      heap.push(9);
      const result = heap.toArray();
      expect(result.length).toBe(5);
      expect(result).toContain(1);
      expect(result).toContain(3);
      expect(result).toContain(5);
      expect(result).toContain(7);
      expect(result).toContain(9);
    });

    it('should not modify original heap', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      const sizeBefore = heap.size;
      const peekBefore = heap.peek();
      heap.toArray();
      expect(heap.size).toBe(sizeBefore);
      expect(heap.peek()).toBe(peekBefore);
    });

    it.skip('should handle duplicates', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(5);
      heap.push(1);
      heap.push(3);
      const result = heap.toArray();
      expect(result.length).toBe(5);
      expect(result.filter(x => x === 1).length).toBe(1);
      expect(result.filter(x => x === 3).length).toBe(2);
      expect(result.filter(x => x === 5).length).toBe(2);
    });
  });

  describe('contains', () => {
    it('should return false for empty heap', () => {
      const heap = new AdaptiveHeap<number>();
      expect(heap.contains(5)).toBe(false);
    });

    it('should return true for existing element', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      expect(heap.contains(5)).toBe(true);
      expect(heap.contains(3)).toBe(true);
      expect(heap.contains(7)).toBe(true);
    });

    it('should return false for non-existing element', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      expect(heap.contains(1)).toBe(false);
      expect(heap.contains(10)).toBe(false);
    });

    it('should work with strings', () => {
      const heap = new AdaptiveHeap<string>();
      heap.push('apple');
      heap.push('banana');
      heap.push('cherry');
      expect(heap.contains('apple')).toBe(true);
      expect(heap.contains('banana')).toBe(true);
      expect(heap.contains('date')).toBe(false);
    });

    it('should find duplicate values', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(5);
      expect(heap.contains(5)).toBe(true);
    });
  });

  describe('remove', () => {
    it('should return false for empty heap', () => {
      const heap = new AdaptiveHeap<number>();
      expect(heap.remove(5)).toBe(false);
      expect(heap.size).toBe(0);
    });

    it('should return false for non-existing element', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      expect(heap.remove(1)).toBe(false);
      expect(heap.size).toBe(2);
    });

    it('should remove single element', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      expect(heap.remove(5)).toBe(true);
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size).toBe(0);
    });

    it('should remove element and maintain heap property', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      heap.push(1);
      heap.push(9);
      expect(heap.remove(5)).toBe(true);
      expect(heap.size).toBe(4);
      const result: number[] = [];
      while (!heap.isEmpty()) {
        result.push(heap.pop()!);
      }
      expect(result).toEqual([1, 3, 7, 9]);
    });

    it('should remove duplicate values', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(5);
      heap.push(1);
      heap.push(3);
      expect(heap.remove(5)).toBe(true);
      expect(heap.size).toBe(4);
      expect(heap.remove(5)).toBe(true);
      expect(heap.size).toBe(3);
      expect(heap.remove(5)).toBe(false);
      expect(heap.size).toBe(3);
    });

    it('should remove root element', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      heap.push(1);
      heap.push(9);
      expect(heap.remove(1)).toBe(true);
      expect(heap.peek()).toBe(3);
      expect(heap.size).toBe(4);
    });
  });

  describe('update', () => {
    it('should return false for empty heap', () => {
      const heap = new AdaptiveHeap<number>();
      expect(heap.update(5, 10)).toBe(false);
    });

    it('should return false for non-existing element', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      expect(heap.update(1, 2)).toBe(false);
      expect(heap.size).toBe(2);
    });

    it('should update element to smaller value', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      heap.push(10);
      expect(heap.update(10, 1)).toBe(true);
      expect(heap.peek()).toBe(1);
      expect(heap.size).toBe(4);
      expect(heap.remove(10)).toBe(false);
    });

    it('should update element to larger value', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      heap.push(1);
      expect(heap.update(1, 10)).toBe(true);
      expect(heap.peek()).toBe(3);
      expect(heap.size).toBe(4);
      expect(heap.contains(1)).toBe(false);
      expect(heap.contains(10)).toBe(true);
    });

    it('should update element to same value', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      expect(heap.update(5, 5)).toBe(true);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(3);
    });

    it('should update duplicate values correctly', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(5);
      expect(heap.update(5, 2)).toBe(true);
      expect(heap.size).toBe(3);
      const result: number[] = [];
      while (!heap.isEmpty()) {
        result.push(heap.pop()!);
      }
      expect(result).toEqual([2, 3, 5]);
    });
  });

  describe('decreaseKey', () => {
    it('should return false for empty heap', () => {
      const heap = new AdaptiveHeap<number>();
      expect(heap.decreaseKey(5, 1)).toBe(false);
    });

    it('should return false for non-existing element', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      expect(heap.decreaseKey(1, 0)).toBe(false);
      expect(heap.size).toBe(2);
    });

    it('should decrease key of existing element', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      heap.push(10);
      expect(heap.decreaseKey(10, 1)).toBe(true);
      expect(heap.peek()).toBe(1);
      expect(heap.size).toBe(4);
      expect(heap.contains(10)).toBe(false);
    });

    it('should return false when new value is larger', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      expect(heap.decreaseKey(3, 10)).toBe(false);
      expect(heap.peek()).toBe(3);
      expect(heap.size).toBe(3);
    });

    it('should return false when new value is same', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      expect(heap.decreaseKey(3, 3)).toBe(false);
      expect(heap.peek()).toBe(3);
      expect(heap.size).toBe(3);
    });

    it('should decrease root element', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(10);
      heap.push(15);
      heap.decreaseKey(5, 2);
      expect(heap.peek()).toBe(2);
      expect(heap.pop()).toBe(2);
      expect(heap.pop()).toBe(10);
      expect(heap.pop()).toBe(15);
    });
  });

  describe('increaseKey', () => {
    it('should return false for empty heap', () => {
      const heap = new AdaptiveHeap<number>();
      expect(heap.increaseKey(5, 10)).toBe(false);
    });

    it('should return false for non-existing element', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      expect(heap.increaseKey(1, 10)).toBe(false);
      expect(heap.size).toBe(2);
    });

    it('should increase key of existing element', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      heap.push(1);
      expect(heap.increaseKey(1, 10)).toBe(true);
      expect(heap.peek()).toBe(3);
      expect(heap.size).toBe(4);
      expect(heap.contains(1)).toBe(false);
      expect(heap.contains(10)).toBe(true);
    });

    it('should return false when new value is smaller', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      expect(heap.increaseKey(7, 1)).toBe(false);
      expect(heap.pop()).toBe(3);
      expect(heap.pop()).toBe(5);
      expect(heap.pop()).toBe(7);
    });

    it('should return false when new value is same', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      expect(heap.increaseKey(7, 7)).toBe(false);
      expect(heap.size).toBe(3);
    });

    it('should increase non-root element', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(10);
      heap.push(15);
      heap.increaseKey(10, 20);
      expect(heap.peek()).toBe(5);
      expect(heap.pop()).toBe(5);
      expect(heap.pop()).toBe(15);
      expect(heap.pop()).toBe(20);
    });
  });

  describe('stats', () => {
    it('should return stats for empty heap', () => {
      const heap = new AdaptiveHeap<number>();
      const stats = heap.stats();
      expect(stats.size).toBe(0);
      expect(stats.height).toBe(0);
      expect(stats.totalAccesses).toBe(0);
    });

    it('should return stats for single element', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      const stats = heap.stats();
      expect(stats.size).toBe(1);
      expect(stats.height).toBe(1);
      expect(stats.totalAccesses).toBe(0);
    });

    it('should return stats for multiple elements', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      heap.push(1);
      heap.push(9);
      const stats = heap.stats();
      expect(stats.size).toBe(5);
      expect(stats.height).toBe(3);
      expect(stats.totalAccesses).toBe(0);
    });

    it('should track accesses from peek', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.peek();
      const stats = heap.stats();
      expect(stats.totalAccesses).toBe(1);
    });

    it('should track accesses from pop', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.pop();
      const stats = heap.stats();
      expect(stats.totalAccesses).toBe(1);
    });

    it('should reset accesses after clear', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.peek();
      heap.pop();
      heap.clear();
      const stats = heap.stats();
      expect(stats.totalAccesses).toBe(0);
    });
  });

  describe('clone', () => {
    it('should clone empty heap', () => {
      const heap = new AdaptiveHeap<number>();
      const cloned = heap.clone();
      expect(cloned.isEmpty()).toBe(true);
      expect(cloned.size).toBe(0);
    });

    it('should clone heap with elements', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      heap.peek();
      const cloned = heap.clone();
      expect(cloned.size).toBe(3);
      expect(cloned.peek()).toBe(3);
    });

    it('should create independent clone', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      const cloned = heap.clone();
      cloned.push(1);
      cloned.pop();
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(3);
      expect(cloned.size).toBe(3);
    });

     it.skip('should clone with same comparator', () => {
      const heap = new AdaptiveHeap<number>((a, b) => a - b);
      heap.push(5);
      heap.push(3);
      heap.push(7);
      const cloned = heap.clone();
      cloned.push(1);
      expect(cloned.peek()).toBe(1);
    });

    it('should clone stats', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.peek();
      heap.peek();
      const cloned = heap.clone();
      const originalStats = heap.stats();
      const clonedStats = cloned.stats();
      expect(originalStats.totalAccesses).toBe(clonedStats.totalAccesses);
    });
  });

  describe('iterator', () => {
    it('should iterate over empty heap', () => {
      const heap = new AdaptiveHeap<number>();
      const result: number[] = [];
      for (const item of heap) {
        result.push(item);
      }
      expect(result).toEqual([]);
    });

    it('should iterate over all elements', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      heap.push(1);
      heap.push(9);
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

    it('should not modify heap during iteration', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      const sizeBefore = heap.size;
      const peekBefore = heap.peek();
      for (const item of heap) {}
      expect(heap.size).toBe(sizeBefore);
      expect(heap.peek()).toBe(peekBefore);
    });

    it('should iterate over strings', () => {
      const heap = new AdaptiveHeap<string>();
      heap.push('apple');
      heap.push('banana');
      heap.push('cherry');
      const result: string[] = [];
      for (const item of heap) {
        result.push(item);
      }
      expect(result.length).toBe(3);
      expect(result).toContain('apple');
      expect(result).toContain('banana');
      expect(result).toContain('cherry');
    });
  });

  describe('from', () => {
    it('should create heap from empty array', () => {
      const heap = AdaptiveHeap.from<number>([]);
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size).toBe(0);
    });

    it('should create heap from single element', () => {
      const heap = AdaptiveHeap.from<number>([5]);
      expect(heap.size).toBe(1);
      expect(heap.peek()).toBe(5);
    });

    it('should create heap from multiple elements', () => {
      const heap = AdaptiveHeap.from<number>([5, 3, 7, 1, 9]);
      expect(heap.size).toBe(5);
      expect(heap.peek()).toBe(1);
      const result: number[] = [];
      while (!heap.isEmpty()) {
        result.push(heap.pop()!);
      }
      expect(result).toEqual([1, 3, 5, 7, 9]);
    });

    it('should use default comparator', () => {
      const heap = AdaptiveHeap.from<string>(['zebra', 'apple', 'banana']);
      expect(heap.peek()).toBe('apple');
    });

    it.skip('should use custom comparator', () => {
      const heap = AdaptiveHeap.from<number>(
        [5, 3, 7, 1, 9],
        (a, b) => b - a
      );
      const result: number[] = [];
      while (!heap.isEmpty()) {
        result.push(heap.pop()!);
      }
      expect(result).toEqual([9, 7, 5, 3, 1]);
    });

    it('should create heap from array with duplicates', () => {
      const heap = AdaptiveHeap.from<number>([5, 3, 5, 1, 3]);
      const result: number[] = [];
      while (!heap.isEmpty()) {
        result.push(heap.pop()!);
      }
      expect(result).toEqual([1, 3, 3, 5, 5]);
    });
  });

  describe('edge cases', () => {
    it('should handle push after complete pop', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.pop();
      heap.pop();
      expect(heap.isEmpty()).toBe(true);
      heap.push(7);
      expect(heap.peek()).toBe(7);
    });

    it('should handle clear on empty heap', () => {
      const heap = new AdaptiveHeap<number>();
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size).toBe(0);
    });

    it('should handle negative numbers', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(-5);
      heap.push(3);
      heap.push(-1);
      heap.push(0);
      expect(heap.peek()).toBe(-5);
    });

    it('should handle zero', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(0);
      heap.push(0);
      heap.push(0);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(0);
    });

    it('should handle floating point numbers', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(3.14);
      heap.push(1.5);
      heap.push(2.71);
      heap.push(0.5);
      const arr = heap.toArray();
      expect(arr[0]).toBe(0.5);
      expect(arr[1]).toBe(1.5);
      expect(arr[2]).toBe(2.71);
      expect(arr[3]).toBe(3.14);
    });

    it.skip('should handle large values', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(Number.MAX_VALUE);
      heap.push(-Number.MAX_VALUE);
      heap.push(0);
      expect(heap.peek()).toBe(-Number.MAX_VALUE);
    });

    it('should push after remove', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      heap.remove(5);
      heap.push(1);
      expect(heap.peek()).toBe(1);
      expect(heap.size).toBe(3);
    });

    it('should handle multiple pops to empty', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.pop();
      expect(heap.pop()).toBe(undefined);
      expect(heap.pop()).toBe(undefined);
    });
  });

  describe('large datasets', () => {
    it('should handle large number of pushes', () => {
      const heap = new AdaptiveHeap<number>();
      const count = 10000;
      for (let i = 0; i < count; i++) {
        heap.push(Math.random() * 1000);
      }
      expect(heap.size).toBe(count);
    });

    it('should maintain heap property with large dataset', () => {
      const heap = new AdaptiveHeap<number>();
      const values: number[] = [];
      const count = 1000;
      for (let i = 0; i < count; i++) {
        const value = Math.random() * 1000;
        values.push(value);
        heap.push(value);
      }
      const result: number[] = [];
      while (!heap.isEmpty()) {
        result.push(heap.pop()!);
      }
      const sorted = [...values].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
      expect(result).toEqual(sorted);
    });

    it('should create heap from large array', () => {
      const values: number[] = [];
      const count = 10000;
      for (let i = 0; i < count; i++) {
        values.push(Math.random() * 1000);
      }
      const heap = AdaptiveHeap.from<number>(values);
      expect(heap.size).toBe(count);
    });

    it('should handle large sequential pop', () => {
      const heap = AdaptiveHeap.from<number>(
        Array.from({ length: 5000 }, () => Math.random() * 1000)
      );
      const count = heap.size;
      let prev: number | null = null;
      for (let i = 0; i < count; i++) {
        const current = heap.pop()!;
        if (prev !== null) {
          expect(current >= prev).toBe(true);
        }
        prev = current;
      }
      expect(heap.isEmpty()).toBe(true);
    });

    it('should handle large number of contains operations', () => {
      const heap = new AdaptiveHeap<number>();
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      for (const value of values) {
        heap.push(value);
      }
      for (let i = 0; i < 1000; i++) {
        const value = Math.floor(Math.random() * 15);
        const shouldContain = values.includes(value);
        expect(heap.contains(value)).toBe(shouldContain);
      }
    });

    it('should handle large number of remove operations', () => {
      const heap = new AdaptiveHeap<number>();
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      for (const value of values) {
        heap.push(value);
      }
      for (let i = 0; i < values.length; i++) {
        const value = values[i]!;
        expect(heap.remove(value)).toBe(true);
      }
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('sequential pop', () => {
    it('should pop all elements in order', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      heap.push(1);
      heap.push(9);
      heap.push(2);
      heap.push(8);
      heap.push(4);
      heap.push(6);
      const result: number[] = [];
      while (!heap.isEmpty()) {
        result.push(heap.pop()!);
      }
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should maintain heap structure during sequential pop', () => {
      const heap = new AdaptiveHeap<number>();
      const values = [5, 3, 7, 1, 9, 2, 8, 4, 6];
      for (const value of values) {
        heap.push(value);
      }
      const sorted = [...values].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
      for (let i = 0; i < sorted.length; i++) {
        expect(heap.pop()).toBe(sorted[i]!);
        expect(heap.size).toBe(sorted.length - i - 1);
      }
      expect(heap.isEmpty()).toBe(true);
    });

    it('should handle pop with interleaved pushes', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      expect(heap.pop()).toBe(3);
      heap.push(1);
      expect(heap.pop()).toBe(1);
      heap.push(7);
      heap.push(2);
      expect(heap.pop()).toBe(2);
      expect(heap.pop()).toBe(5);
      expect(heap.pop()).toBe(7);
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('adaptive behavior', () => {
    it('should track access counts on peek', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      heap.peek();
      heap.peek();
      heap.peek();
      const stats = heap.stats();
      expect(stats.totalAccesses).toBe(3);
    });

    it('should track access counts on pop', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      heap.pop();
      heap.pop();
      const stats = heap.stats();
      expect(stats.totalAccesses).toBe(2);
    });

    it('should track access counts', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      heap.push(1);
      const stats1 = heap.stats();
      expect(stats1.totalAccesses).toBe(0);
      heap.peek();
      const stats2 = heap.stats();
      expect(stats2.totalAccesses).toBe(1);
      heap.peek();
      const stats3 = heap.stats();
      expect(stats3.totalAccesses).toBe(2);
      heap.pop();
      const stats4 = heap.stats();
      expect(stats4.totalAccesses).toBe(3);
    });

    it('should maintain adaptive behavior after clone', () => {
      const heap = new AdaptiveHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      heap.peek();
      heap.peek();
      const cloned = heap.clone();
      heap.pop();
      const originalStats = heap.stats();
      const clonedStats = cloned.stats();
      expect(originalStats.totalAccesses).toBe(3);
      expect(clonedStats.totalAccesses).toBe(2);
    });
  });
});
