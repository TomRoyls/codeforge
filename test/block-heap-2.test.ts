import { describe, it, expect } from 'vitest';
import { BlockHeap2 } from '../src/core/block-heap-2/index.js';

describe('BlockHeap2', () => {
  describe('constructor', () => {
    it('should create heap with default block size', () => {
      const heap = new BlockHeap2();
      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should create heap with custom block size', () => {
      const heap = new BlockHeap2(8);
      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should throw error for invalid block size', () => {
      expect(() => new BlockHeap2(0)).toThrow();
      expect(() => new BlockHeap2(-1)).toThrow();
    });
  });

  describe('push and pop', () => {
    it('should push and pop single element', () => {
      const heap = new BlockHeap2();
      heap.push(5);
      expect(heap.pop()).toBe(5);
      expect(heap.pop()).toBeUndefined();
    });

    it('should maintain min-heap property', () => {
      const heap = new BlockHeap2();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      heap.push(1);
      expect(heap.peek()).toBe(1);
    });

    it('should pop elements in ascending order', () => {
      const heap = new BlockHeap2();
      const values = [5, 3, 7, 1, 4, 6, 2];
      values.forEach(v => heap.push(v));

      const result: number[] = [];
      while (!heap.isEmpty()) {
        result.push(heap.pop()!);
      }
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it('should handle duplicate values', () => {
      const heap = new BlockHeap2();
      heap.push(5);
      heap.push(3);
      heap.push(5);
      heap.push(3);

      const result: number[] = [];
      while (!heap.isEmpty()) {
        result.push(heap.pop()!);
      }
      expect(result).toEqual([3, 3, 5, 5]);
    });
  });

  describe('peek', () => {
    it('should return minimum element without removing it', () => {
      const heap = new BlockHeap2();
      heap.push(5);
      heap.push(3);
      heap.push(7);

      expect(heap.peek()).toBe(3);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(3);
    });

    it('should return undefined for empty heap', () => {
      const heap = new BlockHeap2();
      expect(heap.peek()).toBeUndefined();
    });
  });

  describe('size', () => {
    it('should return correct size after operations', () => {
      const heap = new BlockHeap2();
      expect(heap.size).toBe(0);

      heap.push(5);
      expect(heap.size).toBe(1);

      heap.push(3);
      heap.push(7);
      expect(heap.size).toBe(3);

      heap.pop();
      expect(heap.size).toBe(2);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty heap', () => {
      const heap = new BlockHeap2();
      expect(heap.isEmpty()).toBe(true);
    });

    it('should return false for non-empty heap', () => {
      const heap = new BlockHeap2();
      heap.push(5);
      expect(heap.isEmpty()).toBe(false);
    });

    it('should return true after clearing', () => {
      const heap = new BlockHeap2();
      heap.push(5);
      heap.push(3);
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('should remove all elements', () => {
      const heap = new BlockHeap2();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      heap.clear();

      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);
      expect(heap.peek()).toBeUndefined();
    });

    it('should be safe to clear empty heap', () => {
      const heap = new BlockHeap2();
      heap.clear();
      expect(heap.size).toBe(0);
    });
  });

  describe('toArray', () => {
    it('should return array of all elements', () => {
      const heap = new BlockHeap2();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      heap.push(1);

      const arr = heap.toArray();
      expect(arr).toHaveLength(4);
      expect(arr).toContain(1);
      expect(arr).toContain(3);
      expect(arr).toContain(5);
      expect(arr).toContain(7);
    });

    it('should return empty array for empty heap', () => {
      const heap = new BlockHeap2();
      expect(heap.toArray()).toEqual([]);
    });

    it('should not modify heap', () => {
      const heap = new BlockHeap2();
      heap.push(5);
      heap.push(3);
      const arr1 = heap.toArray();
      const arr2 = heap.toArray();

      expect(arr1).toEqual(arr2);
      expect(heap.size).toBe(2);
    });
  });

  describe('contains', () => {
    it('should return true for existing value', () => {
      const heap = new BlockHeap2();
      heap.push(5);
      heap.push(3);
      heap.push(7);

      expect(heap.contains(5)).toBe(true);
      expect(heap.contains(3)).toBe(true);
      expect(heap.contains(7)).toBe(true);
    });

    it('should return false for non-existing value', () => {
      const heap = new BlockHeap2();
      heap.push(5);
      heap.push(3);

      expect(heap.contains(7)).toBe(false);
      expect(heap.contains(0)).toBe(false);
    });

    it('should handle duplicate values', () => {
      const heap = new BlockHeap2();
      heap.push(5);
      heap.push(5);

      expect(heap.contains(5)).toBe(true);
    });
  });

  describe('remove', () => {
    it('should remove existing value', () => {
      const heap = new BlockHeap2();
      heap.push(5);
      heap.push(3);
      heap.push(7);

      expect(heap.remove(3)).toBe(true);
      expect(heap.size).toBe(2);
      expect(heap.contains(3)).toBe(false);
      expect(heap.peek()).toBe(5);
    });

    it('should return false for non-existing value', () => {
      const heap = new BlockHeap2();
      heap.push(5);
      heap.push(3);

      expect(heap.remove(7)).toBe(false);
      expect(heap.size).toBe(2);
    });

    it('should maintain heap property after removal', () => {
      const heap = new BlockHeap2();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      heap.push(1);
      heap.push(4);

      heap.remove(3);
      const result: number[] = [];
      while (!heap.isEmpty()) {
        result.push(heap.pop()!);
      }
      expect(result).toEqual([1, 4, 5, 7]);
    });

    it('should remove from single element heap', () => {
      const heap = new BlockHeap2();
      heap.push(5);

      expect(heap.remove(5)).toBe(true);
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('merge', () => {
    it('should merge two heaps', () => {
      const heap1 = new BlockHeap2();
      heap1.push(5);
      heap1.push(3);

      const heap2 = new BlockHeap2();
      heap2.push(7);
      heap2.push(1);

      heap1.merge(heap2);

      expect(heap1.size).toBe(4);
      const result: number[] = [];
      while (!heap1.isEmpty()) {
        result.push(heap1.pop()!);
      }
      expect(result).toEqual([1, 3, 5, 7]);
    });

    it('should merge with empty heap', () => {
      const heap1 = new BlockHeap2();
      heap1.push(5);
      heap1.push(3);

      const heap2 = new BlockHeap2();
      heap1.merge(heap2);

      expect(heap1.size).toBe(2);
      expect(heap1.pop()).toBe(3);
      expect(heap1.pop()).toBe(5);
    });

    it('should not modify source heap', () => {
      const heap1 = new BlockHeap2();
      heap1.push(5);

      const heap2 = new BlockHeap2();
      heap2.push(3);

      heap1.merge(heap2);

      expect(heap2.size).toBe(1);
      expect(heap2.peek()).toBe(3);
    });

    it('should handle duplicate values in merge', () => {
      const heap1 = new BlockHeap2();
      heap1.push(5);
      heap1.push(3);

      const heap2 = new BlockHeap2();
      heap2.push(5);
      heap2.push(3);

      heap1.merge(heap2);

      expect(heap1.size).toBe(4);
      const result: number[] = [];
      while (!heap1.isEmpty()) {
        result.push(heap1.pop()!);
      }
      expect(result).toEqual([3, 3, 5, 5]);
    });
  });

  describe('sorted extraction', () => {
    it('should extract all elements in sorted order', () => {
      const heap = new BlockHeap2();
      const values = [9, 4, 7, 1, 3, 6, 8, 2, 5];
      values.forEach(v => heap.push(v));

      const result: number[] = [];
      while (!heap.isEmpty()) {
        result.push(heap.pop()!);
      }
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
  });

  describe('edge cases', () => {
    it('should handle empty heap operations', () => {
      const heap = new BlockHeap2();

      expect(heap.pop()).toBeUndefined();
      expect(heap.peek()).toBeUndefined();
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size).toBe(0);
      expect(heap.toArray()).toEqual([]);
      expect(heap.contains(1)).toBe(false);
      expect(heap.remove(1)).toBe(false);
    });

    it('should handle single element', () => {
      const heap = new BlockHeap2();
      heap.push(42);

      expect(heap.size).toBe(1);
      expect(heap.isEmpty()).toBe(false);
      expect(heap.peek()).toBe(42);
      expect(heap.contains(42)).toBe(true);
      expect(heap.pop()).toBe(42);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should handle negative numbers', () => {
      const heap = new BlockHeap2();
      heap.push(-5);
      heap.push(-3);
      heap.push(-7);

      expect(heap.peek()).toBe(-7);
      expect(heap.pop()).toBe(-7);
      expect(heap.pop()).toBe(-5);
      expect(heap.pop()).toBe(-3);
    });

    it('should handle zero', () => {
      const heap = new BlockHeap2();
      heap.push(0);
      heap.push(5);
      heap.push(-5);

      expect(heap.peek()).toBe(-5);
      expect(heap.contains(0)).toBe(true);
    });
  });

  describe('different block sizes', () => {
    it('should work with block size 2', () => {
      const heap = new BlockHeap2(2);
      const values = [5, 3, 7, 1, 4, 6, 2];
      values.forEach(v => heap.push(v));

      const result: number[] = [];
      while (!heap.isEmpty()) {
        result.push(heap.pop()!);
      }
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it('should work with block size 8', () => {
      const heap = new BlockHeap2(8);
      const values = [5, 3, 7, 1, 4, 6, 2];
      values.forEach(v => heap.push(v));

      const result: number[] = [];
      while (!heap.isEmpty()) {
        result.push(heap.pop()!);
      }
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it('should work with large block size', () => {
      const heap = new BlockHeap2(100);
      for (let i = 0; i < 50; i++) {
        heap.push(Math.floor(Math.random() * 100));
      }

      expect(heap.size).toBe(50);

      let prev = -Infinity;
      while (!heap.isEmpty()) {
        const current = heap.pop()!;
        expect(current).toBeGreaterThanOrEqual(prev);
        prev = current;
      }
    });

    it('should handle peek', () => {
      const heap = new BlockHeap2(3);
      heap.push(5);
      heap.push(3);
      heap.push(8);
      expect(heap.peek()).toBe(3);
    });

    it('should handle size after operations', () => {
      const heap = new BlockHeap2<number>();
      heap.push(5);
      heap.push(3);
      heap.push(8);
      heap.pop();
      expect(heap.size).toBe(2);
    });

    it('should handle isEmpty', () => {
      const heap = new BlockHeap2<number>();
      expect(heap.isEmpty()).toBe(true);
      heap.push(5);
      expect(heap.isEmpty()).toBe(false);
    });

    it('should handle contains', () => {
      const heap = new BlockHeap2<number>();
      heap.push(5);
      heap.push(3);
      heap.push(8);
      expect(heap.contains(5)).toBe(true);
      expect(heap.contains(99)).toBe(false);
    });
  });

  it('should handle clear', () => {
    const heap = new BlockHeap2<number>();
    heap.push(5);
    heap.push(3);
    heap.push(8);
    heap.clear();
    expect(heap.size).toBe(0);
    expect(heap.isEmpty()).toBe(true);
  });

  it('should handle peek after push', () => {
    const heap = new BlockHeap2<number>();
    heap.push(10);
    heap.push(5);
    heap.push(20);
    expect(heap.peek()).toBe(5);
    heap.pop();
    expect(heap.peek()).toBe(10);
  });
  it('should handle merge', () => {
    const heap1 = new BlockHeap2();
    heap1.push(5);
    heap1.push(3);
    const heap2 = new BlockHeap2();
    heap2.push(1);
    heap1.merge(heap2);
    expect(heap1.pop()).toBe(1);
  });
  it('should handle clear', () => {
    const heap = new BlockHeap2();
    heap.push(5);
    heap.push(3);
    heap.clear();
    expect(heap.size).toBe(0);
  });
  it('should handle size after push', () => {
    const heap = new BlockHeap2();
    expect(heap.size).toBe(0);
    heap.push(5);
    heap.push(3);
    expect(heap.size).toBe(2);
  });
  it('should handle clear', () => {
    const heap = new BlockHeap2<number>();
    heap.push(5);
    heap.push(3);
    heap.clear();
    expect(heap.size).toBe(0);
  });
});
