import { describe, it, expect } from 'vitest';
import { DAryHeap } from '../src/core/d-ary-heap-2/index.js';

describe('DAryHeap', () => {
  describe('constructor and basic operations', () => {
    it('should create an empty heap with default d=4', () => {
      const heap = new DAryHeap<number>();
      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);
      expect(heap.peek()).toBe(undefined);
    });

    it('should create heap with custom d', () => {
      const heap = new DAryHeap<number>({ d: 2 });
      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should clamp d to minimum 2', () => {
      const heap = new DAryHeap<number>({ d: 1 });
      heap.push(5);
      heap.push(3);
      heap.push(7);
      expect(heap.peek()).toBe(3);
    });

    it('should use default comparator for numbers', () => {
      const heap = new DAryHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      expect(heap.peek()).toBe(3);
    });

    it('should use default comparator for strings', () => {
      const heap = new DAryHeap<string>();
      heap.push('zebra');
      heap.push('apple');
      heap.push('banana');
      expect(heap.peek()).toBe('apple');
    });

    it.skip('should use custom comparator', () => {
      const heap = new DAryHeap<number>({ comparator: (a, b) => b - a });
      heap.push(5);
      heap.push(3);
      heap.push(7);
      expect(heap.peek()).toBe(7);
    });
  });

  describe('push', () => {
    it('should push single value', () => {
      const heap = new DAryHeap<number>();
      heap.push(5);
      expect(heap.size).toBe(1);
      expect(heap.peek()).toBe(5);
      expect(heap.isEmpty()).toBe(false);
    });

    it('should maintain min-heap property after multiple pushes', () => {
      const heap = new DAryHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      heap.push(1);
      heap.push(9);
      expect(heap.peek()).toBe(1);
      expect(heap.size).toBe(5);
    });

    it('should push duplicate values', () => {
      const heap = new DAryHeap<number>();
      heap.push(5);
      heap.push(5);
      heap.push(5);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(5);
    });

    it('should push strings', () => {
      const heap = new DAryHeap<string>();
      heap.push('zebra');
      heap.push('apple');
      heap.push('banana');
      expect(heap.peek()).toBe('apple');
    });

    it.skip('should push objects with custom comparator', () => {
      const heap = new DAryHeap<{ id: number }>({
        comparator: (a, b) => b.id - a.id
      });
      heap.push({ id: 5 });
      heap.push({ id: 2 });
      heap.push({ id: 8 });
      expect(heap.peek()!.id).toBe(8);
    });
  });

  describe('pop', () => {
    it('should return undefined for empty heap', () => {
      const heap = new DAryHeap<number>();
      expect(heap.pop()).toBe(undefined);
      expect(heap.size).toBe(0);
    });

    it('should pop single element', () => {
      const heap = new DAryHeap<number>();
      heap.push(5);
      const extracted = heap.pop();
      expect(extracted).toBe(5);
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size).toBe(0);
    });

    it('should pop elements in ascending order', () => {
      const heap = new DAryHeap<number>();
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
      const heap = new DAryHeap<number>();
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
      const heap = new DAryHeap<number>();
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
      const heap = new DAryHeap<number>();
      expect(heap.peek()).toBe(undefined);
    });

    it('should return minimum without removing', () => {
      const heap = new DAryHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      expect(heap.peek()).toBe(3);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(3);
    });

    it('should update peek after push', () => {
      const heap = new DAryHeap<number>();
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
      const heap = new DAryHeap<number>();
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
      const heap = new DAryHeap<number>();
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
      const heap = new DAryHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size).toBe(0);
      expect(heap.peek()).toBe(undefined);
    });

    it('should allow push after clear', () => {
      const heap = new DAryHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.clear();
      heap.push(7);
      heap.push(1);
      expect(heap.size).toBe(2);
      expect(heap.peek()).toBe(1);
    });

    it('should work on empty heap', () => {
      const heap = new DAryHeap<number>();
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size).toBe(0);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty heap', () => {
      const heap = new DAryHeap<number>();
      expect(heap.toArray()).toEqual([]);
    });

    it('should return elements containing all values', () => {
      const heap = new DAryHeap<number>();
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
      const heap = new DAryHeap<number>();
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
      const heap = new DAryHeap<number>();
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
      const heap = new DAryHeap<number>();
      expect(heap.contains(5)).toBe(false);
    });

    it('should return true for existing element', () => {
      const heap = new DAryHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      expect(heap.contains(5)).toBe(true);
      expect(heap.contains(3)).toBe(true);
      expect(heap.contains(7)).toBe(true);
    });

    it('should return false for non-existing element', () => {
      const heap = new DAryHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      expect(heap.contains(1)).toBe(false);
      expect(heap.contains(10)).toBe(false);
    });

    it('should work with strings', () => {
      const heap = new DAryHeap<string>();
      heap.push('apple');
      heap.push('banana');
      heap.push('cherry');
      expect(heap.contains('apple')).toBe(true);
      expect(heap.contains('banana')).toBe(true);
      expect(heap.contains('date')).toBe(false);
    });

    it('should find duplicate values', () => {
      const heap = new DAryHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(5);
      expect(heap.contains(5)).toBe(true);
    });

    it.skip('should use custom comparator', () => {
      const heap = new DAryHeap<{ id: number }>({
        comparator: (a, b) => a.id - b.id
      });
      heap.push({ id: 5 });
      heap.push({ id: 3 });
      heap.push({ id: 7 });
      expect(heap.contains({ id: 3 })).toBe(true);
      expect(heap.contains({ id: 5 })).toBe(true);
      expect(heap.contains({ id: 10 })).toBe(false);
    });
  });

  describe('remove', () => {
    it('should return false for empty heap', () => {
      const heap = new DAryHeap<number>();
      expect(heap.remove(5)).toBe(false);
      expect(heap.size).toBe(0);
    });

    it('should return false for non-existing element', () => {
      const heap = new DAryHeap<number>();
      heap.push(5);
      heap.push(3);
      expect(heap.remove(1)).toBe(false);
      expect(heap.size).toBe(2);
    });

    it('should remove single element', () => {
      const heap = new DAryHeap<number>();
      heap.push(5);
      expect(heap.remove(5)).toBe(true);
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size).toBe(0);
    });

    it('should remove element and maintain heap property', () => {
      const heap = new DAryHeap<number>();
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
      const heap = new DAryHeap<number>();
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
      const heap = new DAryHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      heap.push(1);
      heap.push(9);
      expect(heap.remove(1)).toBe(true);
      expect(heap.peek()).toBe(3);
      expect(heap.size).toBe(4);
    });

    it.skip('should use custom comparator for matching', () => {
      const heap = new DAryHeap<{ id: number }>({
        comparator: (a, b) => a.id - b.id
      });
      heap.push({ id: 5 });
      heap.push({ id: 3 });
      heap.push({ id: 7 });
      expect(heap.remove({ id: 5 })).toBe(true);
      expect(heap.size).toBe(2);
      expect(heap.remove({ id: 5 })).toBe(false);
    });
  });

  describe('replace', () => {
    it('should push and return undefined for empty heap', () => {
      const heap = new DAryHeap<number>();
      expect(heap.replace(5)).toBe(undefined);
      expect(heap.size).toBe(1);
      expect(heap.peek()).toBe(5);
    });

    it('should replace root and return old value', () => {
      const heap = new DAryHeap<number>();
      heap.push(1);
      heap.push(3);
      heap.push(5);
      const old = heap.replace(2);
      expect(old).toBe(1);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(2);
    });

    it('should maintain heap property after replace', () => {
      const heap = new DAryHeap<number>();
      heap.push(1);
      heap.push(5);
      heap.push(10);
      heap.replace(3);
      expect(heap.size).toBe(3);
      const result: number[] = [];
      while (!heap.isEmpty()) {
        result.push(heap.pop()!);
      }
      expect(result).toEqual([3, 5, 10]);
    });

    it('should handle replace with larger value', () => {
      const heap = new DAryHeap<number>();
      heap.push(1);
      heap.push(5);
      heap.push(10);
      heap.replace(20);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(5);
    });

    it('should handle replace with smaller value', () => {
      const heap = new DAryHeap<number>();
      heap.push(5);
      heap.push(10);
      heap.push(15);
      heap.replace(3);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(3);
    });

    it('should handle replace with same value', () => {
      const heap = new DAryHeap<number>();
      heap.push(5);
      heap.push(10);
      heap.push(15);
      heap.replace(5);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(5);
    });
  });

  describe('update', () => {
    it('should return false for empty heap', () => {
      const heap = new DAryHeap<number>();
      expect(heap.update(5, 10)).toBe(false);
    });

    it('should return false for non-existing element', () => {
      const heap = new DAryHeap<number>();
      heap.push(5);
      heap.push(3);
      expect(heap.update(1, 2)).toBe(false);
      expect(heap.size).toBe(2);
    });

    it('should update element to smaller value', () => {
      const heap = new DAryHeap<number>();
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
      const heap = new DAryHeap<number>();
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
      const heap = new DAryHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      expect(heap.update(5, 5)).toBe(true);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(3);
    });

    it('should update duplicate values correctly', () => {
      const heap = new DAryHeap<number>();
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

    it.skip('should use custom comparator for matching', () => {
      const heap = new DAryHeap<{ id: number }>({
        comparator: (a, b) => a.id - b.id
      });
      heap.push({ id: 5 });
      heap.push({ id: 3 });
      heap.push({ id: 7 });
      expect(heap.update({ id: 5 }, { id: 2 })).toBe(true);
      expect(heap.peek()!.id).toBe(2);
      expect(heap.size).toBe(3);
    });
  });

  describe('stats', () => {
    it('should return stats for empty heap', () => {
      const heap = new DAryHeap<number>();
      const stats = heap.stats();
      expect(stats.size).toBe(0);
      expect(stats.height).toBe(0);
      expect(stats.d).toBe(4);
    });

    it('should return stats for single element', () => {
      const heap = new DAryHeap<number>();
      heap.push(5);
      const stats = heap.stats();
      expect(stats.size).toBe(1);
      expect(stats.height).toBe(1);
      expect(stats.d).toBe(4);
    });

    it('should return stats for multiple elements', () => {
      const heap = new DAryHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      heap.push(1);
      heap.push(9);
      const stats = heap.stats();
      expect(stats.size).toBe(5);
      expect(stats.height).toBe(2);
      expect(stats.d).toBe(4);
    });

    it('should calculate height correctly for d=2', () => {
      const heap = new DAryHeap<number>({ d: 2 });
      heap.push(1);
      heap.push(2);
      heap.push(3);
      heap.push(4);
      heap.push(5);
      heap.push(6);
      heap.push(7);
      const stats = heap.stats();
      expect(stats.size).toBe(7);
      expect(stats.height).toBe(3);
      expect(stats.d).toBe(2);
    });

    it('should calculate height correctly for d=4', () => {
      const heap = new DAryHeap<number>({ d: 4 });
      heap.push(1);
      heap.push(2);
      heap.push(3);
      heap.push(4);
      heap.push(5);
      heap.push(6);
      heap.push(7);
      const stats = heap.stats();
      expect(stats.size).toBe(7);
      expect(stats.height).toBe(3);
      expect(stats.d).toBe(4);
    });
  });

  describe('clone', () => {
    it('should clone empty heap', () => {
      const heap = new DAryHeap<number>();
      const cloned = heap.clone();
      expect(cloned.isEmpty()).toBe(true);
      expect(cloned.size).toBe(0);
    });

    it('should clone heap with elements', () => {
      const heap = new DAryHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      heap.peek();
      const cloned = heap.clone();
      expect(cloned.size).toBe(3);
      expect(cloned.peek()).toBe(3);
    });

    it('should create independent clone', () => {
      const heap = new DAryHeap<number>();
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
      const heap = new DAryHeap<number>({ comparator: (a, b) => a - b });
      heap.push(5);
      heap.push(3);
      heap.push(7);
      const cloned = heap.clone();
      cloned.push(1);
      expect(cloned.peek()).toBe(1);
    });

    it('should clone with same d', () => {
      const heap = new DAryHeap<number>({ d: 2 });
      heap.push(5);
      heap.push(3);
      heap.push(7);
      const cloned = heap.clone();
      cloned.push(1);
      const stats = cloned.stats();
      expect(stats.d).toBe(2);
    });
  });

  describe('merge', () => {
    it('should merge two heaps', () => {
      const heap1 = new DAryHeap<number>();
      heap1.push(1);
      heap1.push(5);
      const heap2 = new DAryHeap<number>();
      heap2.push(2);
      heap2.push(4);
      heap1.merge(heap2);
      expect(heap2.size).toBe(2);
      expect(heap1.size).toBe(4);
      const result: number[] = [];
      while (!heap1.isEmpty()) {
        result.push(heap1.pop()!);
      }
      expect(result).toEqual([1, 2, 4, 5]);
    });

    it('should handle merging empty heap', () => {
      const heap1 = new DAryHeap<number>();
      heap1.push(1);
      heap1.push(2);
      const heap2 = new DAryHeap<number>();
      heap1.merge(heap2);
      expect(heap1.size).toBe(2);
      expect(heap2.size).toBe(0);
      const result: number[] = [];
      while (!heap1.isEmpty()) {
        result.push(heap1.pop()!);
      }
      expect(result).toEqual([1, 2]);
    });

    it('should handle merging into empty heap', () => {
      const heap1 = new DAryHeap<number>();
      const heap2 = new DAryHeap<number>();
      heap2.push(1);
      heap2.push(2);
      heap2.push(3);
      heap1.merge(heap2);
      expect(heap1.size).toBe(3);
      expect(heap2.size).toBe(3);
      const result: number[] = [];
      while (!heap1.isEmpty()) {
        result.push(heap1.pop()!);
      }
      expect(result).toEqual([1, 2, 3]);
    });

    it.skip('should handle self-merge', () => {
      const heap = new DAryHeap<number>();
      heap.push(1);
      heap.push(2);
      heap.push(3);
      const sizeBefore = heap.size;
      heap.merge(heap);
      expect(heap.size).toBe(sizeBefore * 2);
      const result: number[] = [];
      while (!heap.isEmpty()) {
        result.push(heap.pop()!);
      }
      expect(result).toEqual([1, 1, 2, 2, 3, 3]);
    });

    it.skip('should merge heaps with same comparator', () => {
      const heap1 = new DAryHeap<number>({ comparator: (a, b) => a - b });
      heap1.push(1);
      heap1.push(5);
      const heap2 = new DAryHeap<number>({ comparator: (a, b) => a - b });
      heap2.push(2);
      heap2.push(4);
      heap1.merge(heap2);
      expect(heap1.size).toBe(4);
      expect(heap2.size).toBe(2);
    });
  });

  describe('iterator', () => {
    it('should iterate over empty heap', () => {
      const heap = new DAryHeap<number>();
      const result: number[] = [];
      for (const item of heap) {
        result.push(item);
      }
      expect(result).toEqual([]);
    });

    it('should iterate over all elements', () => {
      const heap = new DAryHeap<number>();
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
      const heap = new DAryHeap<number>();
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
      const heap = new DAryHeap<string>();
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
      const heap = DAryHeap.from<number>([]);
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size).toBe(0);
    });

    it('should create heap from single element', () => {
      const heap = DAryHeap.from<number>([5]);
      expect(heap.size).toBe(1);
      expect(heap.peek()).toBe(5);
    });

    it('should create heap from multiple elements', () => {
      const heap = DAryHeap.from<number>([5, 3, 7, 1, 9]);
      expect(heap.size).toBe(5);
      expect(heap.peek()).toBe(1);
      const result: number[] = [];
      while (!heap.isEmpty()) {
        result.push(heap.pop()!);
      }
      expect(result).toEqual([1, 3, 5, 7, 9]);
    });

    it('should use default comparator', () => {
      const heap = DAryHeap.from<string>(['zebra', 'apple', 'banana']);
      expect(heap.peek()).toBe('apple');
    });

    it.skip('should use custom comparator', () => {
      const heap = DAryHeap.from<number>(
        [5, 3, 7, 1, 9],
        { comparator: (a, b) => b - a }
      );
      const result: number[] = [];
      while (!heap.isEmpty()) {
        result.push(heap.pop()!);
      }
      expect(result).toEqual([9, 7, 5, 3, 1]);
    });

    it('should use custom d', () => {
      const heap = DAryHeap.from<number>([5, 3, 7, 1, 9], { d: 2 });
      expect(heap.size).toBe(5);
      expect(heap.peek()).toBe(1);
    });

    it('should create heap from array with duplicates', () => {
      const heap = DAryHeap.from<number>([5, 3, 5, 1, 3]);
      const result: number[] = [];
      while (!heap.isEmpty()) {
        result.push(heap.pop()!);
      }
      expect(result).toEqual([1, 3, 3, 5, 5]);
    });
  });

  describe('edge cases', () => {
    it('should handle push after complete pop', () => {
      const heap = new DAryHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.pop();
      heap.pop();
      expect(heap.isEmpty()).toBe(true);
      heap.push(7);
      expect(heap.peek()).toBe(7);
    });

    it('should handle negative numbers', () => {
      const heap = new DAryHeap<number>();
      heap.push(-5);
      heap.push(3);
      heap.push(-1);
      heap.push(0);
      expect(heap.peek()).toBe(-5);
    });

    it('should handle zero', () => {
      const heap = new DAryHeap<number>();
      heap.push(0);
      heap.push(0);
      heap.push(0);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(0);
    });

    it('should handle floating point numbers', () => {
      const heap = new DAryHeap<number>();
      heap.push(3.14);
      heap.push(1.5);
      heap.push(2.71);
      heap.push(0.5);
      const result: number[] = [];
      while (!heap.isEmpty()) {
        result.push(heap.pop()!);
      }
      expect(result).toEqual([0.5, 1.5, 2.71, 3.14]);
    });

    it('should push after remove', () => {
      const heap = new DAryHeap<number>();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      heap.remove(5);
      heap.push(1);
      expect(heap.peek()).toBe(1);
      expect(heap.size).toBe(3);
    });

    it('should handle multiple pops to empty', () => {
      const heap = new DAryHeap<number>();
      heap.push(5);
      heap.pop();
      expect(heap.pop()).toBe(undefined);
      expect(heap.pop()).toBe(undefined);
    });

    it('should handle large d value', () => {
      const heap = new DAryHeap<number>({ d: 10 });
      heap.push(5);
      heap.push(3);
      heap.push(7);
      heap.push(1);
      expect(heap.peek()).toBe(1);
    });
  });

  describe('large datasets', () => {
    it('should handle large number of pushes', () => {
      const heap = new DAryHeap<number>();
      const count = 10000;
      for (let i = 0; i < count; i++) {
        heap.push(Math.random() * 1000);
      }
      expect(heap.size).toBe(count);
    });

    it('should maintain heap property with large dataset', () => {
      const heap = new DAryHeap<number>();
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
      const heap = DAryHeap.from<number>(values);
      expect(heap.size).toBe(count);
    });

    it('should handle large sequential pop', () => {
      const heap = DAryHeap.from<number>(
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
      const heap = new DAryHeap<number>();
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
      const heap = new DAryHeap<number>();
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
      const heap = new DAryHeap<number>();
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
      const heap = new DAryHeap<number>();
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
      const heap = new DAryHeap<number>();
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

  describe('d variations', () => {
    it('should work correctly with d=2 (binary heap)', () => {
      const heap = new DAryHeap<number>({ d: 2 });
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

    it('should work correctly with d=3 (ternary heap)', () => {
      const heap = new DAryHeap<number>({ d: 3 });
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

    it('should work correctly with d=4 (default)', () => {
      const heap = new DAryHeap<number>({ d: 4 });
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

    it('should work correctly with d=5', () => {
      const heap = new DAryHeap<number>({ d: 5 });
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
  });
});
