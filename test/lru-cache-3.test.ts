import { describe, it, expect } from 'vitest';
import { LRUCache3 } from './src/core/lru-cache-3/index.js';

describe('LRUCache3', () => {
  describe('constructor', () => {
    it('should create cache with positive capacity', () => {
      const cache = new LRUCache3<number, number>(5);
      expect(cache.size).toBe(0);
      expect(cache.capacity).toBe(5);
      expect(cache.isEmpty()).toBe(true);
    });

    it('should throw error for zero capacity', () => {
      expect(() => new LRUCache3<number, number>(0)).toThrow('Capacity must be positive');
    });

    it('should throw error for negative capacity', () => {
      expect(() => new LRUCache3<number, number>(-1)).toThrow('Capacity must be positive');
    });
  });

  describe('put and get', () => {
    it('should put and get values', () => {
      const cache = new LRUCache3<number, number>(3);
      cache.put(1, 10);
      cache.put(2, 20);
      expect(cache.get(1)).toBe(10);
      expect(cache.get(2)).toBe(20);
    });

    it('should return undefined for non-existent key', () => {
      const cache = new LRUCache3<number, number>(3);
      expect(cache.get(1)).toBe(undefined);
    });

    it('should update existing key', () => {
      const cache = new LRUCache3<number, number>(3);
      cache.put(1, 10);
      cache.put(1, 20);
      expect(cache.get(1)).toBe(20);
      expect(cache.size).toBe(1);
    });

    it('should update recency on get', () => {
      const cache = new LRUCache3<number, number>(3);
      cache.put(1, 10);
      cache.put(2, 20);
      cache.put(3, 30);
      cache.get(1);
      cache.put(4, 40);
      expect(cache.has(1)).toBe(true);
      expect(cache.has(2)).toBe(false);
    });
  });

  describe('LRU eviction', () => {
    it('should evict least recently used item when at capacity', () => {
      const cache = new LRUCache3<number, number>(2);
      cache.put(1, 10);
      cache.put(2, 20);
      cache.put(3, 30);
      expect(cache.has(1)).toBe(false);
      expect(cache.has(2)).toBe(true);
      expect(cache.has(3)).toBe(true);
    });

    it('should evict multiple items sequentially', () => {
      const cache = new LRUCache3<number, number>(2);
      cache.put(1, 10);
      cache.put(2, 20);
      cache.put(3, 30);
      cache.put(4, 40);
      expect(cache.has(1)).toBe(false);
      expect(cache.has(2)).toBe(false);
      expect(cache.has(3)).toBe(true);
      expect(cache.has(4)).toBe(true);
    });

    it('should maintain correct recency order', () => {
      const cache = new LRUCache3<number, number>(3);
      cache.put(1, 10);
      cache.put(2, 20);
      cache.put(3, 30);
      cache.get(1);
      cache.put(4, 40);
      expect(cache.has(2)).toBe(false);
      expect(cache.has(1)).toBe(true);
      expect(cache.has(3)).toBe(true);
      expect(cache.has(4)).toBe(true);
    });
  });

  describe('delete', () => {
    it('should delete existing key and return true', () => {
      const cache = new LRUCache3<number, number>(3);
      cache.put(1, 10);
      expect(cache.delete(1)).toBe(true);
      expect(cache.has(1)).toBe(false);
      expect(cache.size).toBe(0);
    });

    it('should return false for non-existent key', () => {
      const cache = new LRUCache3<number, number>(3);
      expect(cache.delete(1)).toBe(false);
    });

    it('should delete head', () => {
      const cache = new LRUCache3<number, number>(3);
      cache.put(1, 10);
      cache.put(2, 20);
      cache.put(3, 30);
      cache.delete(1);
      expect(cache.has(1)).toBe(false);
      expect(cache.size).toBe(2);
    });

    it('should delete tail', () => {
      const cache = new LRUCache3<number, number>(3);
      cache.put(1, 10);
      cache.put(2, 20);
      cache.put(3, 30);
      cache.delete(3);
      expect(cache.has(3)).toBe(false);
      expect(cache.size).toBe(2);
    });

    it('should delete middle item', () => {
      const cache = new LRUCache3<number, number>(3);
      cache.put(1, 10);
      cache.put(2, 20);
      cache.put(3, 30);
      cache.delete(2);
      expect(cache.has(2)).toBe(false);
      expect(cache.size).toBe(2);
    });
  });

  describe('has', () => {
    it('should return true for existing key', () => {
      const cache = new LRUCache3<number, number>(3);
      cache.put(1, 10);
      expect(cache.has(1)).toBe(true);
    });

    it('should return false for non-existent key', () => {
      const cache = new LRUCache3<number, number>(3);
      expect(cache.has(1)).toBe(false);
    });
  });

  describe('size', () => {
    it('should return 0 for empty cache', () => {
      const cache = new LRUCache3<number, number>(3);
      expect(cache.size).toBe(0);
    });

    it('should return correct size after puts', () => {
      const cache = new LRUCache3<number, number>(3);
      cache.put(1, 10);
      cache.put(2, 20);
      expect(cache.size).toBe(2);
    });

    it('should return correct size after deletes', () => {
      const cache = new LRUCache3<number, number>(3);
      cache.put(1, 10);
      cache.put(2, 20);
      cache.delete(1);
      expect(cache.size).toBe(1);
    });

    it('should return correct size after eviction', () => {
      const cache = new LRUCache3<number, number>(2);
      cache.put(1, 10);
      cache.put(2, 20);
      cache.put(3, 30);
      expect(cache.size).toBe(2);
    });
  });

  describe('capacity', () => {
    it('should return initial capacity', () => {
      const cache = new LRUCache3<number, number>(5);
      expect(cache.capacity).toBe(5);
    });

    it('should return updated capacity after resize', () => {
      const cache = new LRUCache3<number, number>(5);
      cache.resize(10);
      expect(cache.capacity).toBe(10);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty cache', () => {
      const cache = new LRUCache3<number, number>(3);
      expect(cache.isEmpty()).toBe(true);
    });

    it('should return false for non-empty cache', () => {
      const cache = new LRUCache3<number, number>(3);
      cache.put(1, 10);
      expect(cache.isEmpty()).toBe(false);
    });

    it('should return true after clearing all items', () => {
      const cache = new LRUCache3<number, number>(3);
      cache.put(1, 10);
      cache.clear();
      expect(cache.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear all items', () => {
      const cache = new LRUCache3<number, number>(3);
      cache.put(1, 10);
      cache.put(2, 20);
      cache.put(3, 30);
      cache.clear();
      expect(cache.size).toBe(0);
      expect(cache.isEmpty()).toBe(true);
      expect(cache.has(1)).toBe(false);
      expect(cache.has(2)).toBe(false);
      expect(cache.has(3)).toBe(false);
    });

    it('should allow operations after clear', () => {
      const cache = new LRUCache3<number, number>(3);
      cache.put(1, 10);
      cache.clear();
      cache.put(2, 20);
      expect(cache.get(2)).toBe(20);
      expect(cache.size).toBe(1);
    });
  });

  describe('forEach', () => {
    it('should iterate over all items in MRU order', () => {
      const cache = new LRUCache3<number, number>(3);
      cache.put(1, 10);
      cache.put(2, 20);
      cache.put(3, 30);
      const result: number[] = [];
      cache.forEach((value) => result.push(value));
      expect(result).toEqual([30, 20, 10]);
    });

    it('should iterate with key and value', () => {
      const cache = new LRUCache3<number, number>(3);
      cache.put(1, 10);
      cache.put(2, 20);
      const keys: number[] = [];
      const values: number[] = [];
      cache.forEach((value, key) => {
        keys.push(key);
        values.push(value);
      });
      expect(keys).toEqual([2, 1]);
      expect(values).toEqual([20, 10]);
    });

    it('should not iterate over empty cache', () => {
      const cache = new LRUCache3<number, number>(3);
      let count = 0;
      cache.forEach(() => count++);
      expect(count).toBe(0);
    });
  });

  describe('keys', () => {
    it('should return keys in MRU order', () => {
      const cache = new LRUCache3<number, number>(3);
      cache.put(1, 10);
      cache.put(2, 20);
      cache.put(3, 30);
      expect(cache.keys()).toEqual([3, 2, 1]);
    });

    it('should return empty array for empty cache', () => {
      const cache = new LRUCache3<number, number>(3);
      expect(cache.keys()).toEqual([]);
    });

    it('should reflect eviction', () => {
      const cache = new LRUCache3<number, number>(2);
      cache.put(1, 10);
      cache.put(2, 20);
      cache.put(3, 30);
      expect(cache.keys()).toEqual([3, 2]);
    });
  });

  describe('values', () => {
    it('should return values in MRU order', () => {
      const cache = new LRUCache3<number, number>(3);
      cache.put(1, 10);
      cache.put(2, 20);
      cache.put(3, 30);
      expect(cache.values()).toEqual([30, 20, 10]);
    });

    it('should return empty array for empty cache', () => {
      const cache = new LRUCache3<number, number>(3);
      expect(cache.values()).toEqual([]);
    });
  });

  describe('entries', () => {
    it('should return entries in MRU order', () => {
      const cache = new LRUCache3<number, number>(3);
      cache.put(1, 10);
      cache.put(2, 20);
      cache.put(3, 30);
      expect(cache.entries()).toEqual([[3, 30], [2, 20], [1, 10]]);
    });

    it('should return empty array for empty cache', () => {
      const cache = new LRUCache3<number, number>(3);
      expect(cache.entries()).toEqual([]);
    });
  });

  describe('peekLeastRecentlyUsed', () => {
    it('should return LRU item', () => {
      const cache = new LRUCache3<number, number>(3);
      cache.put(1, 10);
      cache.put(2, 20);
      cache.put(3, 30);
      expect(cache.peekLeastRecentlyUsed()).toEqual([1, 10]);
    });

    it('should return undefined for empty cache', () => {
      const cache = new LRUCache3<number, number>(3);
      expect(cache.peekLeastRecentlyUsed()).toBe(undefined);
    });

    it('should update after eviction', () => {
      const cache = new LRUCache3<number, number>(2);
      cache.put(1, 10);
      cache.put(2, 20);
      cache.put(3, 30);
      expect(cache.peekLeastRecentlyUsed()).toEqual([2, 20]);
    });

    it('should not affect recency', () => {
      const cache = new LRUCache3<number, number>(3);
      cache.put(1, 10);
      cache.put(2, 20);
      cache.put(3, 30);
      cache.peekLeastRecentlyUsed();
      cache.put(4, 40);
      expect(cache.has(1)).toBe(false);
    });
  });

  describe('peekMostRecentlyUsed', () => {
    it('should return MRU item', () => {
      const cache = new LRUCache3<number, number>(3);
      cache.put(1, 10);
      cache.put(2, 20);
      expect(cache.peekMostRecentlyUsed()).toEqual([2, 20]);
    });

    it('should return undefined for empty cache', () => {
      const cache = new LRUCache3<number, number>(3);
      expect(cache.peekMostRecentlyUsed()).toBe(undefined);
    });

    it('should not affect recency', () => {
      const cache = new LRUCache3<number, number>(3);
      cache.put(1, 10);
      cache.put(2, 20);
      cache.peekMostRecentlyUsed();
      cache.put(3, 30);
      expect(cache.has(1)).toBe(true);
    });
  });

  describe('resize', () => {
    it('should increase capacity without evicting', () => {
      const cache = new LRUCache3<number, number>(2);
      cache.put(1, 10);
      cache.put(2, 20);
      cache.resize(5);
      expect(cache.capacity).toBe(5);
      expect(cache.size).toBe(2);
      expect(cache.has(1)).toBe(true);
      expect(cache.has(2)).toBe(true);
    });

    it('should decrease capacity by evicting', () => {
      const cache = new LRUCache3<number, number>(3);
      cache.put(1, 10);
      cache.put(2, 20);
      cache.put(3, 30);
      cache.resize(2);
      expect(cache.capacity).toBe(2);
      expect(cache.size).toBe(2);
      expect(cache.has(1)).toBe(false);
      expect(cache.has(2)).toBe(true);
      expect(cache.has(3)).toBe(true);
    });

    it('should throw error for zero capacity', () => {
      const cache = new LRUCache3<number, number>(3);
      expect(() => cache.resize(0)).toThrow('Capacity must be positive');
    });

    it('should throw error for negative capacity', () => {
      const cache = new LRUCache3<number, number>(3);
      expect(() => cache.resize(-1)).toThrow('Capacity must be positive');
    });

    it('should resize to 1', () => {
      const cache = new LRUCache3<number, number>(3);
      cache.put(1, 10);
      cache.put(2, 20);
      cache.put(3, 30);
      cache.resize(1);
      expect(cache.size).toBe(1);
      expect(cache.has(1)).toBe(false);
      expect(cache.has(2)).toBe(false);
      expect(cache.has(3)).toBe(true);
    });

    it('should resize to current size', () => {
      const cache = new LRUCache3<number, number>(3);
      cache.put(1, 10);
      cache.put(2, 20);
      cache.resize(2);
      expect(cache.size).toBe(2);
    });
  });

  describe('capacity 1 edge case', () => {
    it('should work with capacity 1', () => {
      const cache = new LRUCache3<number, number>(1);
      cache.put(1, 10);
      expect(cache.get(1)).toBe(10);
      cache.put(2, 20);
      expect(cache.has(1)).toBe(false);
      expect(cache.get(2)).toBe(20);
    });

    it('should only keep most recent item with capacity 1', () => {
      const cache = new LRUCache3<number, number>(1);
      cache.put(1, 10);
      cache.put(2, 20);
      cache.put(3, 30);
      expect(cache.get(3)).toBe(30);
      expect(cache.has(1)).toBe(false);
      expect(cache.has(2)).toBe(false);
    });
  });

  describe('empty cache', () => {
    it('should handle operations on empty cache', () => {
      const cache = new LRUCache3<number, number>(3);
      expect(cache.get(1)).toBe(undefined);
      expect(cache.has(1)).toBe(false);
      expect(cache.delete(1)).toBe(false);
      expect(cache.size).toBe(0);
      expect(cache.isEmpty()).toBe(true);
      expect(cache.keys()).toEqual([]);
      expect(cache.values()).toEqual([]);
      expect(cache.entries()).toEqual([]);
      expect(cache.peekLeastRecentlyUsed()).toBe(undefined);
      expect(cache.peekMostRecentlyUsed()).toBe(undefined);
    });
  });

  describe('large cache', () => {
    it('should handle large number of items', () => {
      const cache = new LRUCache3<number, number>(1000);
      for (let i = 0; i < 1000; i++) {
        cache.put(i, i * 10);
      }
      expect(cache.size).toBe(1000);
      expect(cache.get(0)).toBe(0);
      expect(cache.get(999)).toBe(9990);
    });

    it('should evict correctly with large cache', () => {
      const cache = new LRUCache3<number, number>(100);
      for (let i = 0; i < 100; i++) {
        cache.put(i, i * 10);
      }
      cache.put(100, 1000);
      expect(cache.size).toBe(100);
      expect(cache.has(0)).toBe(false);
      expect(cache.has(1)).toBe(true);
      expect(cache.has(100)).toBe(true);
    });
  });

  describe('string keys', () => {
    it('should work with string keys', () => {
      const cache = new LRUCache3<string, number>(3);
      cache.put('a', 10);
      cache.put('b', 20);
      expect(cache.get('a')).toBe(10);
      expect(cache.get('b')).toBe(20);
    });

    it('should evict with string keys', () => {
      const cache = new LRUCache3<string, number>(2);
      cache.put('a', 10);
      cache.put('b', 20);
      cache.put('c', 30);
      expect(cache.has('a')).toBe(false);
      expect(cache.has('b')).toBe(true);
      expect(cache.has('c')).toBe(true);
    });
  });

  describe('complex values', () => {
    it('should work with object values', () => {
      const cache = new LRUCache3<number, { x: number; y: number }>(3);
      const obj1 = { x: 1, y: 2 };
      const obj2 = { x: 3, y: 4 };
      cache.put(1, obj1);
      cache.put(2, obj2);
      expect(cache.get(1)).toBe(obj1);
      expect(cache.get(2)).toBe(obj2);
    });

    it('should work with array values', () => {
      const cache = new LRUCache3<number, number[]>(3);
      const arr1 = [1, 2, 3];
      const arr2 = [4, 5, 6];
      cache.put(1, arr1);
      cache.put(2, arr2);
      expect(cache.get(1)).toBe(arr1);
      expect(cache.get(2)).toBe(arr2);
    });
  });

  describe('mixed operations', () => {
    it('should handle mixed put, get, delete operations', () => {
      const cache = new LRUCache3<number, number>(3);
      cache.put(1, 10);
      cache.put(2, 20);
      cache.put(3, 30);
      cache.get(1);
      cache.delete(2);
      cache.put(4, 40);
      expect(cache.has(1)).toBe(true);
      expect(cache.has(2)).toBe(false);
      expect(cache.has(3)).toBe(true);
      expect(cache.has(4)).toBe(true);
      expect(cache.size).toBe(3);
    });

    it('should handle resize after operations', () => {
      const cache = new LRUCache3<number, number>(3);
      cache.put(1, 10);
      cache.put(2, 20);
      cache.resize(5);
      cache.put(3, 30);
      cache.put(4, 40);
      cache.resize(2);
      expect(cache.has(1)).toBe(false);
      expect(cache.has(2)).toBe(false);
      expect(cache.has(3)).toBe(true);
      expect(cache.has(4)).toBe(true);
    });
  });
});
