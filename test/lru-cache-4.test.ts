import { describe, it, expect, vi } from 'vitest';
import { LRUCache4 } from '../src/core/lru-cache-4/index.js';

describe('LRUCache4', () => {
  describe('constructor', () => {
    it('should create cache with positive capacity', () => {
      const cache = new LRUCache4<number, number>(5);
      expect(cache.size).toBe(0);
      expect(cache.capacity).toBe(5);
    });

    it('should throw error for zero capacity', () => {
      expect(() => new LRUCache4<number, number>(0)).toThrow('Capacity must be positive');
    });

    it('should throw error for negative capacity', () => {
      expect(() => new LRUCache4<number, number>(-1)).toThrow('Capacity must be positive');
    });

    it('should accept optional TTL parameter', () => {
      const cache = new LRUCache4<number, number>(5, 1000);
      expect(cache.capacity).toBe(5);
      expect(cache.size).toBe(0);
    });

    it('should work without TTL parameter', () => {
      const cache = new LRUCache4<number, number>(5);
      expect(cache.size).toBe(0);
      expect(cache.get(1)).toBe(undefined);
    });
  });

  describe('set and get', () => {
    it('should set and get values', () => {
      const cache = new LRUCache4<number, number>(3);
      cache.set(1, 10);
      cache.set(2, 20);
      expect(cache.get(1)).toBe(10);
      expect(cache.get(2)).toBe(20);
    });

    it('should return undefined for non-existent key', () => {
      const cache = new LRUCache4<number, number>(3);
      expect(cache.get(1)).toBe(undefined);
    });

    it('should update existing key', () => {
      const cache = new LRUCache4<number, number>(3);
      cache.set(1, 10);
      cache.set(1, 20);
      expect(cache.get(1)).toBe(20);
      expect(cache.size).toBe(1);
    });

    it('should update recency on get', () => {
      const cache = new LRUCache4<number, number>(3);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.set(3, 30);
      cache.get(1);
      cache.set(4, 40);
      expect(cache.has(1)).toBe(true);
      expect(cache.has(2)).toBe(false);
    });
  });

  describe('LRU eviction', () => {
    it('should evict least recently used item when at capacity', () => {
      const cache = new LRUCache4<number, number>(2);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.set(3, 30);
      expect(cache.has(1)).toBe(false);
      expect(cache.has(2)).toBe(true);
      expect(cache.has(3)).toBe(true);
    });

    it('should evict multiple items sequentially', () => {
      const cache = new LRUCache4<number, number>(2);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.set(3, 30);
      cache.set(4, 40);
      expect(cache.has(1)).toBe(false);
      expect(cache.has(2)).toBe(false);
      expect(cache.has(3)).toBe(true);
      expect(cache.has(4)).toBe(true);
    });

    it('should maintain correct recency order', () => {
      const cache = new LRUCache4<number, number>(3);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.set(3, 30);
      cache.get(1);
      cache.set(4, 40);
      expect(cache.has(2)).toBe(false);
      expect(cache.has(1)).toBe(true);
      expect(cache.has(3)).toBe(true);
      expect(cache.has(4)).toBe(true);
    });
  });

  describe('delete', () => {
    it('should delete existing key and return true', () => {
      const cache = new LRUCache4<number, number>(3);
      cache.set(1, 10);
      expect(cache.delete(1)).toBe(true);
      expect(cache.has(1)).toBe(false);
      expect(cache.size).toBe(0);
    });

    it('should return false for non-existent key', () => {
      const cache = new LRUCache4<number, number>(3);
      expect(cache.delete(1)).toBe(false);
    });

    it('should delete head', () => {
      const cache = new LRUCache4<number, number>(3);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.set(3, 30);
      cache.delete(1);
      expect(cache.has(1)).toBe(false);
      expect(cache.size).toBe(2);
    });

    it('should delete tail', () => {
      const cache = new LRUCache4<number, number>(3);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.set(3, 30);
      cache.delete(3);
      expect(cache.has(3)).toBe(false);
      expect(cache.size).toBe(2);
    });

    it('should delete middle item', () => {
      const cache = new LRUCache4<number, number>(3);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.set(3, 30);
      cache.delete(2);
      expect(cache.has(2)).toBe(false);
      expect(cache.size).toBe(2);
    });
  });

  describe('has', () => {
    it('should return true for existing key', () => {
      const cache = new LRUCache4<number, number>(3);
      cache.set(1, 10);
      expect(cache.has(1)).toBe(true);
    });

    it('should return false for non-existent key', () => {
      const cache = new LRUCache4<number, number>(3);
      expect(cache.has(1)).toBe(false);
    });

    it('should return false for expired key', () => {
      vi.useFakeTimers();
      const cache = new LRUCache4<number, number>(3, 100);
      cache.set(1, 10);
      vi.advanceTimersByTime(150);
      expect(cache.has(1)).toBe(false);
      vi.useRealTimers();
    });
  });

  describe('size', () => {
    it('should return 0 for empty cache', () => {
      const cache = new LRUCache4<number, number>(3);
      expect(cache.size).toBe(0);
    });

    it('should return correct size after sets', () => {
      const cache = new LRUCache4<number, number>(3);
      cache.set(1, 10);
      cache.set(2, 20);
      expect(cache.size).toBe(2);
    });

    it('should return correct size after deletes', () => {
      const cache = new LRUCache4<number, number>(3);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.delete(1);
      expect(cache.size).toBe(1);
    });

    it('should return correct size after eviction', () => {
      const cache = new LRUCache4<number, number>(2);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.set(3, 30);
      expect(cache.size).toBe(2);
    });

    it('should return size excluding expired items', () => {
      vi.useFakeTimers();
      const cache = new LRUCache4<number, number>(5, 100);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.set(3, 30);
      vi.advanceTimersByTime(150);
      expect(cache.size).toBe(0);
      vi.useRealTimers();
    });
  });

  describe('capacity', () => {
    it('should return initial capacity', () => {
      const cache = new LRUCache4<number, number>(5);
      expect(cache.capacity).toBe(5);
    });

    it('should return updated capacity after resize', () => {
      const cache = new LRUCache4<number, number>(5);
      cache.resize(10);
      expect(cache.capacity).toBe(10);
    });
  });

  describe('clear', () => {
    it('should clear all items', () => {
      const cache = new LRUCache4<number, number>(3);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.set(3, 30);
      cache.clear();
      expect(cache.size).toBe(0);
      expect(cache.has(1)).toBe(false);
      expect(cache.has(2)).toBe(false);
      expect(cache.has(3)).toBe(false);
    });

    it('should allow operations after clear', () => {
      const cache = new LRUCache4<number, number>(3);
      cache.set(1, 10);
      cache.clear();
      cache.set(2, 20);
      expect(cache.get(2)).toBe(20);
      expect(cache.size).toBe(1);
    });
  });

  describe('peek', () => {
    it('should return value without updating recency', () => {
      const cache = new LRUCache4<number, number>(3);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.set(3, 30);
      cache.peek(1);
      cache.set(4, 40);
      expect(cache.has(1)).toBe(false);
      expect(cache.has(2)).toBe(true);
      expect(cache.has(3)).toBe(true);
      expect(cache.has(4)).toBe(true);
    });

    it('should return undefined for non-existent key', () => {
      const cache = new LRUCache4<number, number>(3);
      expect(cache.peek(1)).toBe(undefined);
    });

    it('should return value for existing key', () => {
      const cache = new LRUCache4<number, number>(3);
      cache.set(1, 10);
      expect(cache.peek(1)).toBe(10);
    });

    it('should return undefined for expired key', () => {
      vi.useFakeTimers();
      const cache = new LRUCache4<number, number>(3, 100);
      cache.set(1, 10);
      vi.advanceTimersByTime(150);
      expect(cache.peek(1)).toBe(undefined);
      vi.useRealTimers();
    });
  });

  describe('forEach', () => {
    it('should iterate over all items in MRU order', () => {
      const cache = new LRUCache4<number, number>(3);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.set(3, 30);
      const result: number[] = [];
      cache.forEach((value) => result.push(value));
      expect(result).toEqual([30, 20, 10]);
    });

    it('should iterate with key and value', () => {
      const cache = new LRUCache4<number, number>(3);
      cache.set(1, 10);
      cache.set(2, 20);
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
      const cache = new LRUCache4<number, number>(3);
      let count = 0;
      cache.forEach(() => count++);
      expect(count).toBe(0);
    });
  });

  describe('keys', () => {
    it('should return keys in MRU order', () => {
      const cache = new LRUCache4<number, number>(3);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.set(3, 30);
      expect(cache.keys()).toEqual([3, 2, 1]);
    });

    it('should return empty array for empty cache', () => {
      const cache = new LRUCache4<number, number>(3);
      expect(cache.keys()).toEqual([]);
    });

    it('should reflect eviction', () => {
      const cache = new LRUCache4<number, number>(2);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.set(3, 30);
      expect(cache.keys()).toEqual([3, 2]);
    });

    it('should exclude expired keys', () => {
      vi.useFakeTimers();
      const cache = new LRUCache4<number, number>(5, 100);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.set(3, 30);
      vi.advanceTimersByTime(150);
      expect(cache.keys()).toEqual([]);
      vi.useRealTimers();
    });
  });

  describe('values', () => {
    it('should return values in MRU order', () => {
      const cache = new LRUCache4<number, number>(3);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.set(3, 30);
      expect(cache.values()).toEqual([30, 20, 10]);
    });

    it('should return empty array for empty cache', () => {
      const cache = new LRUCache4<number, number>(3);
      expect(cache.values()).toEqual([]);
    });

    it('should exclude expired values', () => {
      vi.useFakeTimers();
      const cache = new LRUCache4<number, number>(5, 100);
      cache.set(1, 10);
      cache.set(2, 20);
      vi.advanceTimersByTime(150);
      expect(cache.values()).toEqual([]);
      vi.useRealTimers();
    });
  });

  describe('entries', () => {
    it('should return entries in MRU order', () => {
      const cache = new LRUCache4<number, number>(3);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.set(3, 30);
      expect(cache.entries()).toEqual([[3, 30], [2, 20], [1, 10]]);
    });

    it('should return empty array for empty cache', () => {
      const cache = new LRUCache4<number, number>(3);
      expect(cache.entries()).toEqual([]);
    });

    it('should exclude expired entries', () => {
      vi.useFakeTimers();
      const cache = new LRUCache4<number, number>(5, 100);
      cache.set(1, 10);
      cache.set(2, 20);
      vi.advanceTimersByTime(150);
      expect(cache.entries()).toEqual([]);
      vi.useRealTimers();
    });
  });

  describe('resize', () => {
    it('should increase capacity without evicting', () => {
      const cache = new LRUCache4<number, number>(2);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.resize(5);
      expect(cache.capacity).toBe(5);
      expect(cache.size).toBe(2);
      expect(cache.has(1)).toBe(true);
      expect(cache.has(2)).toBe(true);
    });

    it('should decrease capacity by evicting', () => {
      const cache = new LRUCache4<number, number>(3);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.set(3, 30);
      cache.resize(2);
      expect(cache.capacity).toBe(2);
      expect(cache.size).toBe(2);
      expect(cache.has(1)).toBe(false);
      expect(cache.has(2)).toBe(true);
      expect(cache.has(3)).toBe(true);
    });

    it('should throw error for zero capacity', () => {
      const cache = new LRUCache4<number, number>(3);
      expect(() => cache.resize(0)).toThrow('Capacity must be positive');
    });

    it('should throw error for negative capacity', () => {
      const cache = new LRUCache4<number, number>(3);
      expect(() => cache.resize(-1)).toThrow('Capacity must be positive');
    });

    it('should resize to 1', () => {
      const cache = new LRUCache4<number, number>(3);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.set(3, 30);
      cache.resize(1);
      expect(cache.size).toBe(1);
      expect(cache.has(1)).toBe(false);
      expect(cache.has(2)).toBe(false);
      expect(cache.has(3)).toBe(true);
    });

    it('should resize to current size', () => {
      const cache = new LRUCache4<number, number>(3);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.resize(2);
      expect(cache.size).toBe(2);
    });
  });

  describe('getTimeComplexity', () => {
    it('should return O(1) for get', () => {
      const cache = new LRUCache4<number, number>(3);
      expect(cache.getTimeComplexity('get')).toBe('O(1) average');
    });

    it('should return O(1) for set', () => {
      const cache = new LRUCache4<number, number>(3);
      expect(cache.getTimeComplexity('set')).toBe('O(1) average');
    });

    it('should return O(1) for delete', () => {
      const cache = new LRUCache4<number, number>(3);
      expect(cache.getTimeComplexity('delete')).toBe('O(1)');
    });

    it('should return O(1) for has', () => {
      const cache = new LRUCache4<number, number>(3);
      expect(cache.getTimeComplexity('has')).toBe('O(1)');
    });

    it('should return O(1) for peek', () => {
      const cache = new LRUCache4<number, number>(3);
      expect(cache.getTimeComplexity('peek')).toBe('O(1)');
    });

    it('should return O(n) for keys', () => {
      const cache = new LRUCache4<number, number>(3);
      expect(cache.getTimeComplexity('keys')).toBe('O(n)');
    });

    it('should return O(n) for values', () => {
      const cache = new LRUCache4<number, number>(3);
      expect(cache.getTimeComplexity('values')).toBe('O(n)');
    });

    it('should return O(n) for entries', () => {
      const cache = new LRUCache4<number, number>(3);
      expect(cache.getTimeComplexity('entries')).toBe('O(n)');
    });

    it('should return O(n) for forEach', () => {
      const cache = new LRUCache4<number, number>(3);
      expect(cache.getTimeComplexity('forEach')).toBe('O(n)');
    });

    it('should return O(n) for size', () => {
      const cache = new LRUCache4<number, number>(3);
      expect(cache.getTimeComplexity('size')).toBe('O(n)');
    });

    it('should return O(1) for clear', () => {
      const cache = new LRUCache4<number, number>(3);
      expect(cache.getTimeComplexity('clear')).toBe('O(1)');
    });

    it('should return O(k) for resize', () => {
      const cache = new LRUCache4<number, number>(3);
      expect(cache.getTimeComplexity('resize')).toBe('O(k) where k = size - newCapacity');
    });

    it('should return Unknown for invalid operation', () => {
      const cache = new LRUCache4<number, number>(3);
      expect(cache.getTimeComplexity('invalid')).toBe('Unknown operation');
    });
  });

  describe('TTL functionality', () => {
    it('should expire items after TTL', () => {
      vi.useFakeTimers();
      const cache = new LRUCache4<number, number>(5, 100);
      cache.set(1, 10);
      expect(cache.has(1)).toBe(true);
      vi.advanceTimersByTime(150);
      expect(cache.has(1)).toBe(false);
      expect(cache.get(1)).toBe(undefined);
      vi.useRealTimers();
    });

    it('should allow access within TTL', () => {
      vi.useFakeTimers();
      const cache = new LRUCache4<number, number>(5, 100);
      cache.set(1, 10);
      vi.advanceTimersByTime(50);
      expect(cache.has(1)).toBe(true);
      expect(cache.get(1)).toBe(10);
      vi.useRealTimers();
    });

    it('should update timestamp on set', () => {
      vi.useFakeTimers();
      const cache = new LRUCache4<number, number>(5, 100);
      cache.set(1, 10);
      vi.advanceTimersByTime(80);
      cache.set(1, 20);
      vi.advanceTimersByTime(50);
      expect(cache.get(1)).toBe(20);
      vi.useRealTimers();
    });

    it('should update timestamp on get', () => {
      vi.useFakeTimers();
      const cache = new LRUCache4<number, number>(5, 100);
      cache.set(1, 10);
      vi.advanceTimersByTime(80);
      cache.get(1);
      vi.advanceTimersByTime(50);
      expect(cache.has(1)).toBe(true);
      vi.useRealTimers();
    });

    it('should work without TTL (null)', () => {
      const cache = new LRUCache4<number, number>(5);
      cache.set(1, 10);
      vi.useFakeTimers();
      vi.advanceTimersByTime(100000);
      expect(cache.has(1)).toBe(true);
      expect(cache.get(1)).toBe(10);
      vi.useRealTimers();
    });

    it('should evict expired items when accessing keys', () => {
      vi.useFakeTimers();
      const cache = new LRUCache4<number, number>(5, 100);
      cache.set(1, 10);
      cache.set(2, 20);
      vi.advanceTimersByTime(150);
      expect(cache.keys()).toEqual([]);
      vi.useRealTimers();
    });

    it('should evict expired items when accessing values', () => {
      vi.useFakeTimers();
      const cache = new LRUCache4<number, number>(5, 100);
      cache.set(1, 10);
      cache.set(2, 20);
      vi.advanceTimersByTime(150);
      expect(cache.values()).toEqual([]);
      vi.useRealTimers();
    });

    it('should evict expired items when accessing entries', () => {
      vi.useFakeTimers();
      const cache = new LRUCache4<number, number>(5, 100);
      cache.set(1, 10);
      cache.set(2, 20);
      vi.advanceTimersByTime(150);
      expect(cache.entries()).toEqual([]);
      vi.useRealTimers();
    });

    it('should evict expired items during forEach', () => {
      vi.useFakeTimers();
      const cache = new LRUCache4<number, number>(5, 100);
      cache.set(1, 10);
      cache.set(2, 20);
      vi.advanceTimersByTime(150);
      const keys: number[] = [];
      cache.forEach((_, key) => keys.push(key));
      expect(keys).toEqual([]);
      vi.useRealTimers();
    });
  });

  describe('capacity 1 edge case', () => {
    it('should work with capacity 1', () => {
      const cache = new LRUCache4<number, number>(1);
      cache.set(1, 10);
      expect(cache.get(1)).toBe(10);
      cache.set(2, 20);
      expect(cache.has(1)).toBe(false);
      expect(cache.get(2)).toBe(20);
    });

    it('should only keep most recent item with capacity 1', () => {
      const cache = new LRUCache4<number, number>(1);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.set(3, 30);
      expect(cache.get(3)).toBe(30);
      expect(cache.has(1)).toBe(false);
      expect(cache.has(2)).toBe(false);
    });

    it('should work with capacity 1 and TTL', () => {
      vi.useFakeTimers();
      const cache = new LRUCache4<number, number>(1, 100);
      cache.set(1, 10);
      vi.advanceTimersByTime(150);
      expect(cache.has(1)).toBe(false);
      cache.set(2, 20);
      expect(cache.get(2)).toBe(20);
      vi.useRealTimers();
    });
  });

  describe('empty cache', () => {
    it('should handle operations on empty cache', () => {
      const cache = new LRUCache4<number, number>(3);
      expect(cache.get(1)).toBe(undefined);
      expect(cache.peek(1)).toBe(undefined);
      expect(cache.has(1)).toBe(false);
      expect(cache.delete(1)).toBe(false);
      expect(cache.size).toBe(0);
      expect(cache.keys()).toEqual([]);
      expect(cache.values()).toEqual([]);
      expect(cache.entries()).toEqual([]);
    });

    it('should handle forEach on empty cache', () => {
      const cache = new LRUCache4<number, number>(3);
      let count = 0;
      cache.forEach(() => count++);
      expect(count).toBe(0);
    });
  });

  describe('string keys', () => {
    it('should work with string keys', () => {
      const cache = new LRUCache4<string, number>(3);
      cache.set('a', 10);
      cache.set('b', 20);
      expect(cache.get('a')).toBe(10);
      expect(cache.get('b')).toBe(20);
    });

    it('should evict with string keys', () => {
      const cache = new LRUCache4<string, number>(2);
      cache.set('a', 10);
      cache.set('b', 20);
      cache.set('c', 30);
      expect(cache.has('a')).toBe(false);
      expect(cache.has('b')).toBe(true);
      expect(cache.has('c')).toBe(true);
    });
  });

  describe('complex values', () => {
    it('should work with object values', () => {
      const cache = new LRUCache4<number, { x: number; y: number }>(3);
      const obj1 = { x: 1, y: 2 };
      const obj2 = { x: 3, y: 4 };
      cache.set(1, obj1);
      cache.set(2, obj2);
      expect(cache.get(1)).toBe(obj1);
      expect(cache.get(2)).toBe(obj2);
    });

    it('should work with array values', () => {
      const cache = new LRUCache4<number, number[]>(3);
      const arr1 = [1, 2, 3];
      const arr2 = [4, 5, 6];
      cache.set(1, arr1);
      cache.set(2, arr2);
      expect(cache.get(1)).toBe(arr1);
      expect(cache.get(2)).toBe(arr2);
    });
  });

  describe('mixed operations', () => {
    it('should handle mixed set, get, delete operations', () => {
      const cache = new LRUCache4<number, number>(3);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.set(3, 30);
      cache.get(1);
      cache.delete(2);
      cache.set(4, 40);
      expect(cache.has(1)).toBe(true);
      expect(cache.has(2)).toBe(false);
      expect(cache.has(3)).toBe(true);
      expect(cache.has(4)).toBe(true);
      expect(cache.size).toBe(3);
    });

    it('should handle resize after operations', () => {
      const cache = new LRUCache4<number, number>(3);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.resize(5);
      cache.set(3, 30);
      cache.set(4, 40);
      cache.resize(2);
      expect(cache.has(1)).toBe(false);
      expect(cache.has(2)).toBe(false);
      expect(cache.has(3)).toBe(true);
      expect(cache.has(4)).toBe(true);
    });
  });
});
