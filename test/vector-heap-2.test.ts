import { describe, it, expect } from 'vitest';
import { VectorHeap2 } from '../src/core/vector-heap-2/index';

describe('VectorHeap2', () => {
  describe('constructor', () => {
    it('should create heap with default capacity', () => {
      const heap = new VectorHeap2();
      expect(heap.capacity).toBe(1024);
      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should create heap with custom capacity', () => {
      const heap = new VectorHeap2(256);
      expect(heap.capacity).toBe(256);
      expect(heap.size).toBe(0);
    });

    it('should create heap with capacity of 1', () => {
      const heap = new VectorHeap2(1);
      expect(heap.capacity).toBe(1);
    });
  });

  describe('push and pop', () => {
    it('should push and pop in min order', () => {
      const heap = new VectorHeap2();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      heap.push(1);
      expect(heap.pop()).toBe(1);
      expect(heap.pop()).toBe(3);
      expect(heap.pop()).toBe(5);
      expect(heap.pop()).toBe(7);
    });

    it('should return undefined when popping empty heap', () => {
      const heap = new VectorHeap2();
      expect(heap.pop()).toBeUndefined();
    });

    it('should maintain heap property after multiple operations', () => {
      const heap = new VectorHeap2();
      const values = [10, 5, 15, 2, 8, 20, 1, 12];
      values.forEach(v => heap.push(v));

      const result: number[] = [];
      while (!heap.isEmpty()) {
        result.push(heap.pop()!);
      }

      expect(result).toEqual([1, 2, 5, 8, 10, 12, 15, 20]);
    });

    it('should handle negative numbers', () => {
      const heap = new VectorHeap2();
      heap.push(-5);
      heap.push(3);
      heap.push(-2);
      heap.push(7);
      expect(heap.pop()).toBe(-5);
      expect(heap.pop()).toBe(-2);
      expect(heap.pop()).toBe(3);
      expect(heap.pop()).toBe(7);
    });

    it('should handle decimal numbers', () => {
      const heap = new VectorHeap2();
      heap.push(5.5);
      heap.push(3.3);
      heap.push(7.7);
      expect(heap.pop()).toBe(3.3);
      expect(heap.pop()).toBe(5.5);
      expect(heap.pop()).toBe(7.7);
    });
  });

  describe('peek', () => {
    it('should return minimum without removing', () => {
      const heap = new VectorHeap2();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      expect(heap.peek()).toBe(3);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(3);
    });

    it('should return undefined for empty heap', () => {
      const heap = new VectorHeap2();
      expect(heap.peek()).toBeUndefined();
    });

    it('should return the only element', () => {
      const heap = new VectorHeap2();
      heap.push(42);
      expect(heap.peek()).toBe(42);
      expect(heap.size).toBe(1);
    });
  });

  describe('size', () => {
    it('should return 0 for empty heap', () => {
      const heap = new VectorHeap2();
      expect(heap.size).toBe(0);
    });

    it('should track size correctly', () => {
      const heap = new VectorHeap2();
      expect(heap.size).toBe(0);
      heap.push(1);
      expect(heap.size).toBe(1);
      heap.push(2);
      heap.push(3);
      expect(heap.size).toBe(3);
      heap.pop();
      expect(heap.size).toBe(2);
    });

    it('should return size as getter', () => {
      const heap = new VectorHeap2();
      heap.push(1);
      heap.push(2);
      expect(heap.size).toBe(2);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty heap', () => {
      const heap = new VectorHeap2();
      expect(heap.isEmpty()).toBe(true);
    });

    it('should return false for non-empty heap', () => {
      const heap = new VectorHeap2();
      heap.push(1);
      expect(heap.isEmpty()).toBe(false);
    });

    it('should return true after clearing all elements', () => {
      const heap = new VectorHeap2();
      heap.push(1);
      heap.pop();
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('capacity', () => {
    it('should return initial capacity', () => {
      const heap = new VectorHeap2(100);
      expect(heap.capacity).toBe(100);
    });

    it('should return capacity as getter', () => {
      const heap = new VectorHeap2();
      expect(heap.capacity).toBe(1024);
    });
  });

  describe('reserve', () => {
    it('should not change capacity when reserving less than current', () => {
      const heap = new VectorHeap2(100);
      heap.reserve(50);
      expect(heap.capacity).toBe(100);
    });

    it('should increase capacity when reserving more', () => {
      const heap = new VectorHeap2(100);
      heap.reserve(200);
      expect(heap.capacity).toBe(200);
    });

    it('should preserve existing elements after reserve', () => {
      const heap = new VectorHeap2(10);
      heap.push(5);
      heap.push(3);
      heap.push(7);
      heap.reserve(100);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(3);
      expect(heap.pop()).toBe(3);
      expect(heap.pop()).toBe(5);
      expect(heap.pop()).toBe(7);
    });

    it('should handle exact capacity match', () => {
      const heap = new VectorHeap2(10);
      heap.reserve(10);
      expect(heap.capacity).toBe(10);
    });
  });

  describe('clear', () => {
    it('should empty heap', () => {
      const heap = new VectorHeap2();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
      expect(heap.size).toBe(0);
      expect(heap.peek()).toBeUndefined();
    });

    it('should not affect capacity', () => {
      const heap = new VectorHeap2(100);
      heap.push(5);
      heap.push(3);
      heap.clear();
      expect(heap.capacity).toBe(100);
    });

    it('should allow reuse after clear', () => {
      const heap = new VectorHeap2();
      heap.push(5);
      heap.push(3);
      heap.clear();
      heap.push(7);
      heap.push(1);
      expect(heap.pop()).toBe(1);
      expect(heap.pop()).toBe(7);
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('toArray', () => {
    it('should return all elements', () => {
      const heap = new VectorHeap2();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      const arr = heap.toArray();
      expect(arr.length).toBe(3);
      expect(arr).toContain(5);
      expect(arr).toContain(3);
      expect(arr).toContain(7);
    });

    it('should return empty array for empty heap', () => {
      const heap = new VectorHeap2();
      expect(heap.toArray()).toEqual([]);
    });

    it('should not modify internal heap', () => {
      const heap = new VectorHeap2();
      heap.push(5);
      heap.push(3);
      const arr = heap.toArray();
      arr.push(100);
      expect(heap.size).toBe(2);
      expect(heap.toArray()).not.toContain(100);
    });
  });

  describe('contains', () => {
    it('should return true for existing value', () => {
      const heap = new VectorHeap2();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      expect(heap.contains(5)).toBe(true);
      expect(heap.contains(3)).toBe(true);
      expect(heap.contains(7)).toBe(true);
    });

    it('should return false for non-existing value', () => {
      const heap = new VectorHeap2();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      expect(heap.contains(1)).toBe(false);
      expect(heap.contains(10)).toBe(false);
    });

    it('should return false for empty heap', () => {
      const heap = new VectorHeap2();
      expect(heap.contains(5)).toBe(false);
    });

    it('should handle duplicate values', () => {
      const heap = new VectorHeap2();
      heap.push(5);
      heap.push(3);
      heap.push(5);
      expect(heap.contains(5)).toBe(true);
    });
  });

  describe('remove', () => {
    it('should remove existing value', () => {
      const heap = new VectorHeap2();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      expect(heap.remove(3)).toBe(true);
      expect(heap.size).toBe(2);
      expect(heap.contains(3)).toBe(false);
      expect(heap.contains(5)).toBe(true);
      expect(heap.contains(7)).toBe(true);
    });

    it('should return false for non-existing value', () => {
      const heap = new VectorHeap2();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      expect(heap.remove(10)).toBe(false);
      expect(heap.size).toBe(3);
    });

    it('should remove root', () => {
      const heap = new VectorHeap2();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      expect(heap.remove(3)).toBe(true);
      expect(heap.peek()).toBe(5);
    });

    it('should handle duplicate values', () => {
      const heap = new VectorHeap2();
      heap.push(5);
      heap.push(3);
      heap.push(5);
      heap.push(7);
      expect(heap.remove(5)).toBe(true);
      expect(heap.size).toBe(3);
      expect(heap.contains(5)).toBe(true);
    });

    it('should maintain heap property after removal', () => {
      const heap = new VectorHeap2();
      heap.push(10);
      heap.push(5);
      heap.push(15);
      heap.push(2);
      heap.push(8);
      heap.push(20);
      heap.remove(5);

      const result: number[] = [];
      while (!heap.isEmpty()) {
        result.push(heap.pop()!);
      }

      expect(result).toEqual([2, 8, 10, 15, 20]);
    });
  });

  describe('update', () => {
    it('should update existing value to smaller value', () => {
      const heap = new VectorHeap2();
      heap.push(10);
      heap.push(5);
      heap.push(15);
      expect(heap.update(10, 3)).toBe(true);
      expect(heap.peek()).toBe(3);
      expect(heap.pop()).toBe(3);
      expect(heap.pop()).toBe(5);
      expect(heap.pop()).toBe(15);
    });

    it('should update existing value to larger value', () => {
      const heap = new VectorHeap2();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      expect(heap.update(5, 10)).toBe(true);
      expect(heap.pop()).toBe(3);
      expect(heap.pop()).toBe(7);
      expect(heap.pop()).toBe(10);
    });

    it('should return false for non-existing value', () => {
      const heap = new VectorHeap2();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      expect(heap.update(10, 20)).toBe(false);
      expect(heap.size).toBe(3);
    });

    it('should maintain heap property after update', () => {
      const heap = new VectorHeap2();
      heap.push(10);
      heap.push(5);
      heap.push(15);
      heap.push(2);
      heap.push(8);
      heap.push(20);

      heap.update(15, 1);

      expect(heap.peek()).toBe(1);

      const result: number[] = [];
      while (!heap.isEmpty()) {
        result.push(heap.pop()!);
      }

      expect(result).toEqual([1, 2, 5, 8, 10, 20]);
    });

    it('should handle updating root', () => {
      const heap = new VectorHeap2();
      heap.push(5);
      heap.push(10);
      heap.push(15);
      expect(heap.update(5, 2)).toBe(true);
      expect(heap.peek()).toBe(2);
    });
  });

  describe('sorted order extraction', () => {
    it('should extract elements in sorted order', () => {
      const heap = new VectorHeap2();
      const input = [5, 3, 7, 1, 9, 2, 8, 4, 6];
      input.forEach(v => heap.push(v));

      const result: number[] = [];
      while (!heap.isEmpty()) {
        result.push(heap.pop()!);
      }

      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should extract correctly after random insertion', () => {
      const heap = new VectorHeap2();
      const input = [42, 17, 91, 3, 58, 20, 85, 12, 36, 7];
      input.forEach(v => heap.push(v));

      const result: number[] = [];
      while (!heap.isEmpty()) {
        result.push(heap.pop()!);
      }

      expect(result).toEqual([3, 7, 12, 17, 20, 36, 42, 58, 85, 91]);
    });
  });

  describe('duplicate values', () => {
    it('should handle duplicate values', () => {
      const heap = new VectorHeap2();
      heap.push(5);
      heap.push(3);
      heap.push(5);
      heap.push(3);
      heap.push(7);
      heap.push(5);

      expect(heap.size).toBe(6);
      expect(heap.pop()).toBe(3);
      expect(heap.pop()).toBe(3);
      expect(heap.pop()).toBe(5);
      expect(heap.pop()).toBe(5);
      expect(heap.pop()).toBe(5);
      expect(heap.pop()).toBe(7);
    });

    it('should find all duplicate values with contains', () => {
      const heap = new VectorHeap2();
      heap.push(5);
      heap.push(3);
      heap.push(5);
      expect(heap.contains(5)).toBe(true);
    });

    it('should remove first occurrence of duplicate', () => {
      const heap = new VectorHeap2();
      heap.push(5);
      heap.push(3);
      heap.push(5);
      heap.push(7);
      expect(heap.remove(5)).toBe(true);
      expect(heap.size).toBe(3);
      expect(heap.contains(5)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty heap operations', () => {
      const heap = new VectorHeap2();
      expect(heap.peek()).toBeUndefined();
      expect(heap.pop()).toBeUndefined();
      expect(heap.isEmpty()).toBe(true);
      expect(heap.toArray()).toEqual([]);
      expect(heap.contains(5)).toBe(false);
      expect(heap.remove(5)).toBe(false);
      expect(heap.update(5, 10)).toBe(false);
    });

    it('should handle single element', () => {
      const heap = new VectorHeap2();
      heap.push(42);
      expect(heap.size).toBe(1);
      expect(heap.isEmpty()).toBe(false);
      expect(heap.peek()).toBe(42);
      expect(heap.pop()).toBe(42);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should automatically resize when beyond capacity', () => {
      const heap = new VectorHeap2(5);
      expect(heap.capacity).toBe(5);
      heap.push(1);
      heap.push(2);
      heap.push(3);
      heap.push(4);
      heap.push(5);
      expect(heap.capacity).toBe(5);
      heap.push(6);
      expect(heap.capacity).toBeGreaterThan(5);
      expect(heap.size).toBe(6);
      expect(heap.pop()).toBe(1);
    });

    it('should handle pushing after popping all elements', () => {
      const heap = new VectorHeap2();
      heap.push(5);
      heap.push(3);
      heap.pop();
      heap.pop();
      heap.push(7);
      heap.push(1);
      expect(heap.pop()).toBe(1);
      expect(heap.pop()).toBe(7);
    });

    it('should handle large number of elements', () => {
      const heap = new VectorHeap2();
      const count = 1000;
      for (let i = 0; i < count; i++) {
        heap.push(count - i);
      }

      for (let i = 1; i <= count; i++) {
        expect(heap.pop()).toBe(i);
      }
      expect(heap.isEmpty()).toBe(true);
    });

    it('should handle zero', () => {
      const heap = new VectorHeap2();
      heap.push(0);
      heap.push(5);
      heap.push(-5);
      expect(heap.pop()).toBe(-5);
      expect(heap.pop()).toBe(0);
      expect(heap.pop()).toBe(5);
    });
  });

  describe('mixed operations', () => {
    it('should handle interleaved push and pop', () => {
      const heap = new VectorHeap2();
      heap.push(5);
      expect(heap.pop()).toBe(5);
      heap.push(3);
      heap.push(7);
      expect(heap.pop()).toBe(3);
      expect(heap.pop()).toBe(7);
    });

    it('should handle remove and push combination', () => {
      const heap = new VectorHeap2();
      heap.push(5);
      heap.push(3);
      heap.push(7);
      heap.remove(3);
      heap.push(1);
      expect(heap.pop()).toBe(1);
      expect(heap.pop()).toBe(5);
      expect(heap.pop()).toBe(7);
    });

    it('should handle update and remove combination', () => {
      const heap = new VectorHeap2();
      heap.push(10);
      heap.push(5);
      heap.push(15);
      heap.update(10, 2);
      heap.remove(15);
      expect(heap.pop()).toBe(2);
      expect(heap.pop()).toBe(5);
    });
  });

  describe('Float64Array specific tests', () => {
    it('should use Float64Array for cache efficiency', () => {
      const heap = new VectorHeap2(10);
      heap.push(5);
      heap.push(3);
      expect(heap.toArray()).toEqual([3, 5]);
    });

    it('should handle double precision values', () => {
      const heap = new VectorHeap2();
      heap.push(1.7976931348623157e308);
      heap.push(5e-324);
      expect(heap.contains(1.7976931348623157e308)).toBe(true);
      expect(heap.contains(5e-324)).toBe(true);
    });

    it('should handle NaN', () => {
      const heap = new VectorHeap2();
      heap.push(5);
      heap.push(NaN);
      heap.push(3);
      expect(heap.contains(NaN)).toBe(true);
    });

    it('should handle Infinity', () => {
      const heap = new VectorHeap2();
      heap.push(5);
      heap.push(Infinity);
      heap.push(-Infinity);
      expect(heap.pop()).toBe(-Infinity);
      expect(heap.pop()).toBe(5);
      expect(heap.pop()).toBe(Infinity);
    });
  });
});
