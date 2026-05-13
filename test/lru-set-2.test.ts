import { describe, it, expect } from 'vitest';
import { LRUSet2 } from '../src/core/lru-set-2/index.js';

describe('LRUSet2', () => {
  describe('empty set', () => {
    it('should be empty initially', () => {
      const set = new LRUSet2<number>(5);
      expect(set.size).toBe(0);
      expect(set.has(1)).toBe(false);
    });

    it('should peek undefined when empty', () => {
      const set = new LRUSet2<number>(5);
      expect(set.peek()).toBeUndefined();
    });

    it('should pop undefined when empty', () => {
      const set = new LRUSet2<number>(5);
      expect(set.pop()).toBeUndefined();
    });

    it('should return empty array', () => {
      const set = new LRUSet2<number>(5);
      expect(set.toArray()).toEqual([]);
    });
  });

  describe('add and has', () => {
    it('should add items successfully', () => {
      const set = new LRUSet2<number>(5);
      expect(set.add(1)).toBe(true);
      expect(set.add(2)).toBe(true);
      expect(set.has(1)).toBe(true);
      expect(set.has(2)).toBe(true);
      expect(set.size).toBe(2);
    });

    it('should return false for duplicates', () => {
      const set = new LRUSet2<number>(5);
      expect(set.add(1)).toBe(true);
      expect(set.add(1)).toBe(false);
      expect(set.size).toBe(1);
    });

    it('should handle string items', () => {
      const set = new LRUSet2<string>(5);
      expect(set.add('a')).toBe(true);
      expect(set.add('b')).toBe(true);
      expect(set.has('a')).toBe(true);
      expect(set.has('b')).toBe(true);
    });

    it('should handle object items with same reference', () => {
      const set = new LRUSet2<object>(5);
      const obj = { key: 'value' };
      expect(set.add(obj)).toBe(true);
      expect(set.add(obj)).toBe(false);
      expect(set.size).toBe(1);
    });
  });

  describe('duplicates and touch behavior', () => {
    it('should move existing item to most recent on add', () => {
      const set = new LRUSet2<number>(3);
      set.add(1);
      set.add(2);
      set.add(3);
      set.add(1);
      expect(set.toArray()).toEqual([1, 3, 2]);
    });

    it('should handle multiple duplicates', () => {
      const set = new LRUSet2<number>(5);
      set.add(1);
      set.add(2);
      set.add(3);
      set.add(2);
      set.add(1);
      expect(set.toArray()).toEqual([1, 2, 3]);
    });
  });

  describe('capacity enforcement', () => {
    it('should enforce capacity', () => {
      const set = new LRUSet2<number>(3);
      expect(set.add(1)).toBe(true);
      expect(set.add(2)).toBe(true);
      expect(set.add(3)).toBe(true);
      expect(set.size).toBe(3);
    });

    it('should not exceed capacity', () => {
      const set = new LRUSet2<number>(3);
      set.add(1);
      set.add(2);
      set.add(3);
      set.add(4);
      expect(set.size).toBe(3);
    });

    it('should throw error for non-positive capacity', () => {
      expect(() => new LRUSet2<number>(0)).toThrow('Capacity must be positive');
      expect(() => new LRUSet2<number>(-1)).toThrow('Capacity must be positive');
    });

    it('should return false when adding duplicate at capacity', () => {
      const set = new LRUSet2<number>(3);
      set.add(1);
      set.add(2);
      set.add(3);
      expect(set.add(2)).toBe(false);
      expect(set.size).toBe(3);
    });
  });

  describe('eviction', () => {
    it('should evict least recently used when full', () => {
      const set = new LRUSet2<number>(3);
      set.add(1);
      set.add(2);
      set.add(3);
      set.add(4);
      expect(set.has(1)).toBe(false);
      expect(set.has(4)).toBe(true);
    });

    it('should evict correct item after multiple additions', () => {
      const set = new LRUSet2<number>(3);
      set.add(1);
      set.add(2);
      set.add(3);
      set.add(4);
      set.add(5);
      expect(set.has(1)).toBe(false);
      expect(set.has(2)).toBe(false);
      expect(set.has(3)).toBe(true);
      expect(set.has(4)).toBe(true);
      expect(set.has(5)).toBe(true);
    });

    it('should evict based on recency after touches', () => {
      const set = new LRUSet2<number>(3);
      set.add(1);
      set.add(2);
      set.add(3);
      set.touch(1);
      set.add(4);
      expect(set.has(1)).toBe(true);
      expect(set.has(2)).toBe(false);
      expect(set.has(3)).toBe(true);
      expect(set.has(4)).toBe(true);
    });
  });

  describe('touch', () => {
    it('should move item to most recent', () => {
      const set = new LRUSet2<number>(3);
      set.add(1);
      set.add(2);
      set.add(3);
      set.touch(1);
      expect(set.toArray()).toEqual([1, 3, 2]);
    });

    it('should return true when touching existing item', () => {
      const set = new LRUSet2<number>(3);
      set.add(1);
      expect(set.touch(1)).toBe(true);
    });

    it('should return false when touching non-existent item', () => {
      const set = new LRUSet2<number>(3);
      expect(set.touch(1)).toBe(false);
    });

    it('should handle multiple touches', () => {
      const set = new LRUSet2<number>(3);
      set.add(1);
      set.add(2);
      set.add(3);
      set.touch(1);
      set.touch(2);
      expect(set.toArray()).toEqual([2, 1, 3]);
    });

    it('should not change size when touching existing item', () => {
      const set = new LRUSet2<number>(3);
      set.add(1);
      set.add(2);
      set.touch(1);
      expect(set.size).toBe(2);
    });

    it('should not change size when touching non-existent item', () => {
      const set = new LRUSet2<number>(3);
      set.add(1);
      set.add(2);
      set.touch(3);
      expect(set.size).toBe(2);
    });
  });

  describe('peek', () => {
    it('should return least recent item', () => {
      const set = new LRUSet2<number>(5);
      set.add(1);
      set.add(2);
      set.add(3);
      expect(set.peek()).toBe(1);
    });

    it('should not remove the item', () => {
      const set = new LRUSet2<number>(5);
      set.add(1);
      set.add(2);
      set.add(3);
      const peeked = set.peek();
      expect(peeked).toBe(1);
      expect(set.size).toBe(3);
      expect(set.has(1)).toBe(true);
    });

    it('should update after evictions', () => {
      const set = new LRUSet2<number>(3);
      set.add(1);
      set.add(2);
      set.add(3);
      set.add(4);
      expect(set.peek()).toBe(2);
    });

    it('should return undefined when empty', () => {
      const set = new LRUSet2<number>(5);
      expect(set.peek()).toBeUndefined();
    });
  });

  describe('pop', () => {
    it('should remove and return least recent item', () => {
      const set = new LRUSet2<number>(5);
      set.add(1);
      set.add(2);
      set.add(3);
      const popped = set.pop();
      expect(popped).toBe(1);
      expect(set.size).toBe(2);
      expect(set.has(1)).toBe(false);
    });

    it('should return next item after multiple pops', () => {
      const set = new LRUSet2<number>(5);
      set.add(1);
      set.add(2);
      set.add(3);
      expect(set.pop()).toBe(1);
      expect(set.pop()).toBe(2);
      expect(set.pop()).toBe(3);
      expect(set.size).toBe(0);
    });

    it('should return undefined when empty', () => {
      const set = new LRUSet2<number>(5);
      expect(set.pop()).toBeUndefined();
    });

    it('should handle pop after capacity', () => {
      const set = new LRUSet2<number>(3);
      set.add(1);
      set.add(2);
      set.add(3);
      set.add(4);
      expect(set.pop()).toBe(2);
      expect(set.size).toBe(2);
    });
  });

  describe('delete', () => {
    it('should remove existing item', () => {
      const set = new LRUSet2<number>(5);
      set.add(1);
      set.add(2);
      set.add(3);
      expect(set.delete(2)).toBe(true);
      expect(set.size).toBe(2);
      expect(set.has(2)).toBe(false);
    });

    it('should return false for non-existent item', () => {
      const set = new LRUSet2<number>(5);
      set.add(1);
      expect(set.delete(2)).toBe(false);
      expect(set.size).toBe(1);
    });

    it('should not affect other items', () => {
      const set = new LRUSet2<number>(5);
      set.add(1);
      set.add(2);
      set.add(3);
      set.delete(2);
      expect(set.has(1)).toBe(true);
      expect(set.has(3)).toBe(true);
      expect(set.toArray()).toEqual([3, 1]);
    });

    it('should handle deleting middle item', () => {
      const set = new LRUSet2<number>(5);
      set.add(1);
      set.add(2);
      set.add(3);
      set.add(4);
      set.add(5);
      set.delete(3);
      expect(set.toArray()).toEqual([5, 4, 2, 1]);
    });
  });

  describe('size', () => {
    it('should reflect current size', () => {
      const set = new LRUSet2<number>(5);
      expect(set.size).toBe(0);
      set.add(1);
      expect(set.size).toBe(1);
      set.add(2);
      expect(set.size).toBe(2);
      set.add(3);
      expect(set.size).toBe(3);
    });

    it('should decrease after deletion', () => {
      const set = new LRUSet2<number>(5);
      set.add(1);
      set.add(2);
      set.add(3);
      set.delete(2);
      expect(set.size).toBe(2);
    });

    it('should not exceed capacity', () => {
      const set = new LRUSet2<number>(3);
      set.add(1);
      set.add(2);
      set.add(3);
      set.add(4);
      expect(set.size).toBe(3);
    });

    it('should be read-only', () => {
      const set = new LRUSet2<number>(5);
      expect(() => {
        (set as any).size = 10;
      }).toThrow();
    });
  });

  describe('capacity', () => {
    it('should return configured capacity', () => {
      const set = new LRUSet2<number>(10);
      expect(set.capacity).toBe(10);
    });

    it('should be read-only', () => {
      const set = new LRUSet2<number>(5);
      expect(() => {
        (set as any).capacity = 10;
      }).toThrow();
      expect(set.capacity).toBe(5);
    });
  });

  describe('clear', () => {
    it('should remove all items', () => {
      const set = new LRUSet2<number>(5);
      set.add(1);
      set.add(2);
      set.add(3);
      set.clear();
      expect(set.size).toBe(0);
      expect(set.has(1)).toBe(false);
      expect(set.has(2)).toBe(false);
      expect(set.has(3)).toBe(false);
    });

    it('should handle clearing empty set', () => {
      const set = new LRUSet2<number>(5);
      set.clear();
      expect(set.size).toBe(0);
    });

    it('should allow additions after clear', () => {
      const set = new LRUSet2<number>(5);
      set.add(1);
      set.add(2);
      set.clear();
      set.add(3);
      set.add(4);
      expect(set.size).toBe(2);
      expect(set.has(3)).toBe(true);
      expect(set.has(4)).toBe(true);
    });
  });

  describe('toArray order', () => {
    it('should return items from most to least recent', () => {
      const set = new LRUSet2<number>(5);
      set.add(1);
      set.add(2);
      set.add(3);
      expect(set.toArray()).toEqual([3, 2, 1]);
    });

    it('should update order after add', () => {
      const set = new LRUSet2<number>(5);
      set.add(1);
      set.add(2);
      set.add(3);
      set.add(4);
      expect(set.toArray()).toEqual([4, 3, 2, 1]);
    });

    it('should update order after touch', () => {
      const set = new LRUSet2<number>(5);
      set.add(1);
      set.add(2);
      set.add(3);
      set.touch(1);
      expect(set.toArray()).toEqual([1, 3, 2]);
    });

    it('should update order after deletion', () => {
      const set = new LRUSet2<number>(5);
      set.add(1);
      set.add(2);
      set.add(3);
      set.add(4);
      set.delete(2);
      expect(set.toArray()).toEqual([4, 3, 1]);
    });

    it('should handle single item', () => {
      const set = new LRUSet2<number>(5);
      set.add(1);
      expect(set.toArray()).toEqual([1]);
    });

    it('should return empty array for empty set', () => {
      const set = new LRUSet2<number>(5);
      expect(set.toArray()).toEqual([]);
    });
  });

  describe('large dataset', () => {
    it('should handle 1000 items', () => {
      const set = new LRUSet2<number>(1000);
      for (let i = 0; i < 1000; i++) {
        expect(set.add(i)).toBe(true);
      }
      expect(set.size).toBe(1000);
      expect(set.has(0)).toBe(true);
      expect(set.has(999)).toBe(true);
    });

    it('should evict correctly with 1000 items', () => {
      const set = new LRUSet2<number>(1000);
      for (let i = 0; i < 1000; i++) {
        set.add(i);
      }
      set.add(1000);
      expect(set.size).toBe(1000);
      expect(set.has(0)).toBe(false);
      expect(set.has(1000)).toBe(true);
    });

    it('should handle 2000 items with capacity 1000', () => {
      const set = new LRUSet2<number>(1000);
      for (let i = 0; i < 2000; i++) {
        set.add(i);
      }
      expect(set.size).toBe(1000);
      expect(set.has(0)).toBe(false);
      expect(set.has(999)).toBe(false);
      expect(set.has(1000)).toBe(true);
      expect(set.has(1999)).toBe(true);
    });

    it('should maintain performance with large dataset', () => {
      const set = new LRUSet2<number>(1000);
      const start = Date.now();
      for (let i = 0; i < 10000; i++) {
        set.add(i % 1000);
      }
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('edge cases', () => {
    it('should handle capacity of 1', () => {
      const set = new LRUSet2<number>(1);
      expect(set.add(1)).toBe(true);
      expect(set.add(2)).toBe(true);
      expect(set.size).toBe(1);
      expect(set.has(1)).toBe(false);
      expect(set.has(2)).toBe(true);
    });

    it('should handle string keys with touch', () => {
      const set = new LRUSet2<string>(5);
      set.add('a');
      set.add('b');
      set.add('c');
      set.touch('a');
      expect(set.toArray()).toEqual(['a', 'c', 'b']);
    });

    it('should work with zero-based indexing', () => {
      const set = new LRUSet2<number>(5);
      set.add(0);
      set.add(1);
      set.add(2);
      expect(set.has(0)).toBe(true);
      expect(set.toArray()).toEqual([2, 1, 0]);
    });
  });
});
