import { describe, it, expect, beforeEach } from 'vitest';
import { FusionHeap, DEFAULT_FUSION_HEAP_OPTIONS } from '../src/core/fusion-heap/fusion-heap.js';

describe('FusionHeap', () => {
  let heap: FusionHeap<number>;

  beforeEach(() => {
    heap = new FusionHeap<number>();
  });

  describe('constructor', () => {
    it('should create with default options', () => {
      const h = new FusionHeap<number>();
      expect(h.size).toBe(0);
      expect(h.isEmpty).toBe(true);
    });

    it('should create with custom comparator', () => {
      const h = new FusionHeap<number>({ comparator: (a, b) => b - a });
      h.insert(1);
      h.insert(3);
      h.insert(2);
      expect(h.findMin()).toBe(3);
    });
  });

  describe('insert', () => {
    it('should insert a single value', () => {
      heap.insert(5);
      expect(heap.size).toBe(1);
      expect(heap.isEmpty).toBe(false);
    });

    it('should insert multiple values', () => {
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.size).toBe(3);
    });

    it('should insert duplicate values', () => {
      heap.insert(5);
      heap.insert(5);
      heap.insert(5);
      expect(heap.size).toBe(3);
    });
  });

  describe('extractMin', () => {
    it('should return undefined for empty heap', () => {
      expect(heap.extractMin()).toBeUndefined();
    });

    it('should extract the minimum value', () => {
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.extractMin()).toBe(3);
      expect(heap.size).toBe(2);
    });

    it('should extract all values in sorted order', () => {
      const values = [5, 3, 7, 1, 9, 2, 8];
      for (const v of values) heap.insert(v);
      const sorted: number[] = [];
      while (!heap.isEmpty) sorted.push(heap.extractMin()!);
      expect(sorted).toEqual([1, 2, 3, 5, 7, 8, 9]);
    });

    it('should handle single element', () => {
      heap.insert(42);
      expect(heap.extractMin()).toBe(42);
      expect(heap.size).toBe(0);
      expect(heap.isEmpty).toBe(true);
    });

    it('should handle consolidation threshold', () => {
      for (let i = 0; i < 40; i++) heap.insert(i);
      expect(heap.size).toBe(40);
      expect(heap.extractMin()).toBe(0);
      expect(heap.size).toBe(39);
    });
  });

  describe('findMin', () => {
    it('should return undefined for empty heap', () => {
      expect(heap.findMin()).toBeUndefined();
    });

    it('should return minimum without removing', () => {
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.findMin()).toBe(3);
      expect(heap.size).toBe(3);
    });

    it('should find min after multiple inserts', () => {
      heap.insert(10);
      expect(heap.findMin()).toBe(10);
      heap.insert(5);
      expect(heap.findMin()).toBe(5);
      heap.insert(3);
      expect(heap.findMin()).toBe(3);
    });
  });

  describe('delete', () => {
    it('should delete an existing value', () => {
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      expect(heap.delete(5)).toBe(true);
      expect(heap.size).toBe(2);
      expect(heap.contains(5)).toBe(false);
    });

    it('should return false for non-existing value', () => {
      heap.insert(5);
      expect(heap.delete(3)).toBe(false);
      expect(heap.size).toBe(1);
    });

    it('should return false for empty heap', () => {
      expect(heap.delete(5)).toBe(false);
    });

    it('should handle deleting min', () => {
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      expect(heap.delete(1)).toBe(true);
      expect(heap.findMin()).toBe(2);
    });
  });

  describe('decreaseKey', () => {
    it('should decrease key in heap', () => {
      heap.insert(5);
      heap.insert(10);
      heap.insert(15);
      expect(heap.decreaseKey(10, 2)).toBe(true);
      expect(heap.findMin()).toBe(2);
    });

    it('should return false for non-existing value', () => {
      heap.insert(5);
      expect(heap.decreaseKey(10, 2)).toBe(false);
    });

    it('should return false for empty heap', () => {
      expect(heap.decreaseKey(5, 2)).toBe(false);
    });
  });

  describe('merge', () => {
    it('should merge two heaps', () => {
      const other = new FusionHeap<number>();
      heap.insert(1);
      heap.insert(3);
      other.insert(2);
      other.insert(4);
      heap.merge(other);
      expect(heap.size).toBe(4);
      const sorted: number[] = [];
      while (!heap.isEmpty) sorted.push(heap.extractMin()!);
      expect(sorted).toEqual([1, 2, 3, 4]);
    });

    it('should merge with empty heap', () => {
      const other = new FusionHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.merge(other);
      expect(heap.size).toBe(2);
    });

    it('should merge into empty heap', () => {
      const other = new FusionHeap<number>();
      other.insert(1);
      other.insert(2);
      heap.merge(other);
      expect(heap.size).toBe(2);
    });
  });

  describe('size and isEmpty', () => {
    it('should track size correctly', () => {
      expect(heap.size).toBe(0);
      heap.insert(1);
      expect(heap.size).toBe(1);
      heap.insert(2);
      expect(heap.size).toBe(2);
      heap.extractMin();
      expect(heap.size).toBe(1);
    });

    it('should track isEmpty correctly', () => {
      expect(heap.isEmpty).toBe(true);
      heap.insert(1);
      expect(heap.isEmpty).toBe(false);
      heap.extractMin();
      expect(heap.isEmpty).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear the heap', () => {
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.clear();
      expect(heap.size).toBe(0);
      expect(heap.isEmpty).toBe(true);
      expect(heap.findMin()).toBeUndefined();
    });
  });

  describe('contains', () => {
    it('should find existing value', () => {
      heap.insert(5);
      heap.insert(3);
      expect(heap.contains(5)).toBe(true);
      expect(heap.contains(3)).toBe(true);
    });

    it('should not find non-existing value', () => {
      heap.insert(5);
      expect(heap.contains(3)).toBe(false);
    });

    it('should return false for empty heap', () => {
      expect(heap.contains(5)).toBe(false);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty heap', () => {
      expect(heap.toArray()).toEqual([]);
    });

    it('should return all elements', () => {
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      const arr = heap.toArray();
      expect(arr.length).toBe(3);
      expect(arr).toContain(1);
      expect(arr).toContain(2);
      expect(arr).toContain(3);
    });
  });

  describe('forEach', () => {
    it('should iterate over all elements', () => {
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      const collected: number[] = [];
      heap.forEach((v) => collected.push(v));
      expect(collected.length).toBe(3);
    });

    it('should provide correct indices', () => {
      heap.insert(10);
      heap.insert(20);
      const indices: number[] = [];
      heap.forEach((_v, i) => indices.push(i));
      expect(indices).toEqual([0, 1]);
    });
  });

  describe('values', () => {
    it('should return sorted values', () => {
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      expect(heap.values()).toEqual([1, 3, 5, 7]);
    });

    it('should return empty array for empty heap', () => {
      expect(heap.values()).toEqual([]);
    });
  });

  describe('getStatistics', () => {
    it('should return initial statistics', () => {
      const stats = heap.getStatistics();
      expect(stats.inserts).toBe(0);
      expect(stats.extracts).toBe(0);
      expect(stats.decreaseKeys).toBe(0);
      expect(stats.deletes).toBe(0);
      expect(stats.merges).toBe(0);
      expect(stats.consolidations).toBe(0);
      expect(stats.maxSize).toBe(0);
    });

    it('should track inserts', () => {
      heap.insert(1);
      heap.insert(2);
      expect(heap.getStatistics().inserts).toBe(2);
      expect(heap.getStatistics().maxSize).toBe(2);
    });

    it('should track extracts', () => {
      heap.insert(1);
      heap.insert(2);
      heap.extractMin();
      expect(heap.getStatistics().extracts).toBe(1);
    });

    it('should track deletes', () => {
      heap.insert(1);
      heap.delete(1);
      expect(heap.getStatistics().deletes).toBe(1);
    });

    it('should track decreaseKeys', () => {
      heap.insert(5);
      heap.decreaseKey(5, 2);
      expect(heap.getStatistics().decreaseKeys).toBe(1);
    });

    it('should track merges', () => {
      const other = new FusionHeap<number>();
      other.insert(1);
      heap.insert(2);
      heap.merge(other);
      expect(heap.getStatistics().merges).toBe(1);
    });

    it('should track maxSize', () => {
      for (let i = 0; i < 10; i++) heap.insert(i);
      for (let i = 0; i < 5; i++) heap.extractMin();
      expect(heap.getStatistics().maxSize).toBe(10);
    });
  });

  describe('toJSON/fromJSON', () => {
    it('should serialize to JSON', () => {
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      const json = heap.toJSON();
      expect(json.size).toBe(3);
      expect(json.heap).toBeDefined();
      expect(json.buffer).toBeDefined();
    });

    it('should roundtrip via JSON', () => {
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      heap.insert(1);
      heap.insert(9);
      const json = heap.toJSON();
      const restored = FusionHeap.fromJSON(json);
      expect(restored.size).toBe(5);
      const sorted: number[] = [];
      while (!restored.isEmpty) sorted.push(restored.extractMin()!);
      expect(sorted).toEqual([1, 3, 5, 7, 9]);
    });

    it('should handle empty heap roundtrip', () => {
      const json = heap.toJSON();
      const restored = FusionHeap.fromJSON(json);
      expect(restored.size).toBe(0);
      expect(restored.isEmpty).toBe(true);
    });
  });

  describe('iterator', () => {
    it('should be iterable', () => {
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      const collected: number[] = [];
      for (const v of heap) collected.push(v);
      expect(collected.length).toBe(3);
    });
  });

  describe('DEFAULT_FUSION_HEAP_OPTIONS', () => {
    it('should be defined', () => {
      expect(DEFAULT_FUSION_HEAP_OPTIONS).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle negative numbers', () => {
      heap.insert(-5);
      heap.insert(-3);
      heap.insert(-7);
      expect(heap.extractMin()).toBe(-7);
      expect(heap.extractMin()).toBe(-5);
      expect(heap.extractMin()).toBe(-3);
    });

    it('should handle large dataset', () => {
      for (let i = 100; i >= 0; i--) heap.insert(i);
      expect(heap.size).toBe(101);
      expect(heap.extractMin()).toBe(0);
      expect(heap.extractMin()).toBe(1);
    });

    it('should handle mixed insert and extract', () => {
      heap.insert(5);
      heap.insert(3);
      expect(heap.extractMin()).toBe(3);
      heap.insert(1);
      heap.insert(7);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(7);
      expect(heap.isEmpty).toBe(true);
    });

    it('should handle clear then reuse', () => {
      heap.insert(1);
      heap.insert(2);
      heap.clear();
      expect(heap.size).toBe(0);
      heap.insert(10);
      expect(heap.size).toBe(1);
      expect(heap.findMin()).toBe(10);
    });
  });
});
