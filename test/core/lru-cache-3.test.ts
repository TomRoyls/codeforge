import { describe, it, expect } from 'vitest';
import { LRUCache3 } from '../../src/core/lru-cache-3/index.js';

describe('LRUCache3', () => {
  // ─── Constructor ───

  describe('constructor', () => {
    it('creates cache with given capacity', () => {
      const cache = new LRUCache3<string, number>(5);
      expect(cache.capacity).toBe(5);
      expect(cache.size).toBe(0);
      expect(cache.isEmpty()).toBe(true);
    });

    it('throws for zero capacity', () => {
      expect(() => new LRUCache3<string, number>(0)).toThrow('Capacity must be positive');
    });

    it('throws for negative capacity', () => {
      expect(() => new LRUCache3<string, number>(-1)).toThrow('Capacity must be positive');
    });

    it('accepts capacity of 1', () => {
      const cache = new LRUCache3<string, number>(1);
      expect(cache.capacity).toBe(1);
    });
  });

  // ─── put / get ───

  describe('put / get', () => {
    it('stores and retrieves a value', () => {
      const cache = new LRUCache3<string, number>(3);
      cache.put('a', 1);
      expect(cache.get('a')).toBe(1);
    });

    it('returns undefined for missing key', () => {
      const cache = new LRUCache3<string, number>(3);
      expect(cache.get('missing')).toBeUndefined();
    });

    it('overwrites existing key', () => {
      const cache = new LRUCache3<string, number>(3);
      cache.put('a', 1);
      cache.put('a', 2);
      expect(cache.get('a')).toBe(2);
      expect(cache.size).toBe(1);
    });

    it('evicts LRU when capacity exceeded', () => {
      const cache = new LRUCache3<string, number>(2);
      cache.put('a', 1);
      cache.put('b', 2);
      cache.put('c', 3);
      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBe(2);
      expect(cache.get('c')).toBe(3);
    });

    it('get updates recency', () => {
      const cache = new LRUCache3<string, number>(2);
      cache.put('a', 1);
      cache.put('b', 2);
      cache.get('a');
      cache.put('c', 3);
      expect(cache.get('a')).toBe(1);
      expect(cache.get('b')).toBeUndefined();
      expect(cache.get('c')).toBe(3);
    });

    it('put on existing key updates recency', () => {
      const cache = new LRUCache3<string, number>(2);
      cache.put('a', 1);
      cache.put('b', 2);
      cache.put('a', 10);
      cache.put('c', 3);
      expect(cache.get('a')).toBe(10);
      expect(cache.get('b')).toBeUndefined();
      expect(cache.get('c')).toBe(3);
    });
  });

  // ─── delete ───

  describe('delete', () => {
    it('removes existing key', () => {
      const cache = new LRUCache3<string, number>(3);
      cache.put('a', 1);
      expect(cache.delete('a')).toBe(true);
      expect(cache.get('a')).toBeUndefined();
      expect(cache.size).toBe(0);
    });

    it('returns false for non-existent key', () => {
      const cache = new LRUCache3<string, number>(3);
      expect(cache.delete('missing')).toBe(false);
    });

    it('returns false on empty cache', () => {
      const cache = new LRUCache3<string, number>(3);
      expect(cache.delete('a')).toBe(false);
    });

    it('deletion allows re-insertion', () => {
      const cache = new LRUCache3<string, number>(2);
      cache.put('a', 1);
      cache.put('b', 2);
      cache.delete('a');
      cache.put('c', 3);
      expect(cache.size).toBe(2);
      expect(cache.get('b')).toBe(2);
      expect(cache.get('c')).toBe(3);
    });
  });

  // ─── has ───

  describe('has', () => {
    it('returns true for existing key', () => {
      const cache = new LRUCache3<string, number>(3);
      cache.put('a', 1);
      expect(cache.has('a')).toBe(true);
    });

    it('returns false for missing key', () => {
      const cache = new LRUCache3<string, number>(3);
      expect(cache.has('a')).toBe(false);
    });

    it('returns false after deletion', () => {
      const cache = new LRUCache3<string, number>(3);
      cache.put('a', 1);
      cache.delete('a');
      expect(cache.has('a')).toBe(false);
    });
  });

  // ─── size / isEmpty ───

  describe('size / isEmpty', () => {
    it('tracks size correctly', () => {
      const cache = new LRUCache3<string, number>(5);
      expect(cache.size).toBe(0);
      expect(cache.isEmpty()).toBe(true);
      cache.put('a', 1);
      expect(cache.size).toBe(1);
      expect(cache.isEmpty()).toBe(false);
      cache.put('b', 2);
      expect(cache.size).toBe(2);
    });

    it('size does not exceed capacity', () => {
      const cache = new LRUCache3<string, number>(2);
      cache.put('a', 1);
      cache.put('b', 2);
      cache.put('c', 3);
      expect(cache.size).toBe(2);
    });
  });

  // ─── clear ───

  describe('clear', () => {
    it('clears all entries', () => {
      const cache = new LRUCache3<string, number>(5);
      cache.put('a', 1);
      cache.put('b', 2);
      cache.put('c', 3);
      cache.clear();
      expect(cache.isEmpty()).toBe(true);
      expect(cache.size).toBe(0);
    });

    it('allows reuse after clear', () => {
      const cache = new LRUCache3<string, number>(2);
      cache.put('a', 1);
      cache.clear();
      cache.put('b', 2);
      expect(cache.get('b')).toBe(2);
    });
  });

  // ─── forEach ───

  describe('forEach', () => {
    it('iterates in recency order (most recent first)', () => {
      const cache = new LRUCache3<string, number>(5);
      cache.put('a', 1);
      cache.put('b', 2);
      cache.put('c', 3);
      const collected: [string, number][] = [];
      cache.forEach((v, k) => collected.push([k, v]));
      expect(collected).toEqual([['c', 3], ['b', 2], ['a', 1]]);
    });

    it('does not iterate on empty cache', () => {
      const cache = new LRUCache3<string, number>(3);
      let count = 0;
      cache.forEach(() => count++);
      expect(count).toBe(0);
    });
  });

  // ─── keys / values / entries ───

  describe('keys / values / entries', () => {
    it('keys returns keys in recency order', () => {
      const cache = new LRUCache3<string, number>(3);
      cache.put('a', 1);
      cache.put('b', 2);
      cache.put('c', 3);
      expect(cache.keys()).toEqual(['c', 'b', 'a']);
    });

    it('values returns values in recency order', () => {
      const cache = new LRUCache3<string, number>(3);
      cache.put('a', 1);
      cache.put('b', 2);
      cache.put('c', 3);
      expect(cache.values()).toEqual([3, 2, 1]);
    });

    it('entries returns key-value pairs in recency order', () => {
      const cache = new LRUCache3<string, number>(3);
      cache.put('a', 1);
      cache.put('b', 2);
      cache.put('c', 3);
      expect(cache.entries()).toEqual([['c', 3], ['b', 2], ['a', 1]]);
    });

    it('returns empty arrays for empty cache', () => {
      const cache = new LRUCache3<string, number>(3);
      expect(cache.keys()).toEqual([]);
      expect(cache.values()).toEqual([]);
      expect(cache.entries()).toEqual([]);
    });
  });

  // ─── peekLeastRecentlyUsed / peekMostRecentlyUsed ───

  describe('peekLeastRecentlyUsed / peekMostRecentlyUsed', () => {
    it('returns undefined for empty cache', () => {
      const cache = new LRUCache3<string, number>(3);
      expect(cache.peekLeastRecentlyUsed()).toBeUndefined();
      expect(cache.peekMostRecentlyUsed()).toBeUndefined();
    });

    it('returns LRU and MRU entries', () => {
      const cache = new LRUCache3<string, number>(3);
      cache.put('a', 1);
      cache.put('b', 2);
      cache.put('c', 3);
      expect(cache.peekMostRecentlyUsed()).toEqual(['c', 3]);
      expect(cache.peekLeastRecentlyUsed()).toEqual(['a', 1]);
    });

    it('updates after get', () => {
      const cache = new LRUCache3<string, number>(3);
      cache.put('a', 1);
      cache.put('b', 2);
      cache.put('c', 3);
      cache.get('a');
      expect(cache.peekMostRecentlyUsed()).toEqual(['a', 1]);
      expect(cache.peekLeastRecentlyUsed()).toEqual(['b', 2]);
    });
  });

  // ─── resize ───

  describe('resize', () => {
    it('increases capacity', () => {
      const cache = new LRUCache3<string, number>(2);
      cache.put('a', 1);
      cache.put('b', 2);
      cache.resize(5);
      expect(cache.capacity).toBe(5);
      expect(cache.size).toBe(2);
    });

    it('decreases capacity evicting LRU entries', () => {
      const cache = new LRUCache3<string, number>(5);
      cache.put('a', 1);
      cache.put('b', 2);
      cache.put('c', 3);
      cache.resize(1);
      expect(cache.capacity).toBe(1);
      expect(cache.size).toBe(1);
      expect(cache.get('c')).toBe(3);
      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBeUndefined();
    });

    it('throws for zero capacity', () => {
      const cache = new LRUCache3<string, number>(3);
      expect(() => cache.resize(0)).toThrow('Capacity must be positive');
    });

    it('throws for negative capacity', () => {
      const cache = new LRUCache3<string, number>(3);
      expect(() => cache.resize(-5)).toThrow('Capacity must be positive');
    });
  });

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('handles capacity of 1', () => {
      const cache = new LRUCache3<string, number>(1);
      cache.put('a', 1);
      cache.put('b', 2);
      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBe(2);
    });

    it('handles number keys', () => {
      const cache = new LRUCache3<number, string>(3);
      cache.put(1, 'one');
      cache.put(2, 'two');
      expect(cache.get(1)).toBe('one');
    });

    it('handles null and undefined values', () => {
      const cache = new LRUCache3<string, number | null>(3);
      cache.put('a', null);
      expect(cache.get('a')).toBeNull();
    });

    it('handles rapid put/get cycles', () => {
      const cache = new LRUCache3<number, number>(3);
      for (let i = 0; i < 100; i++) {
        cache.put(i, i * 10);
      }
      expect(cache.size).toBe(3);
      expect(cache.get(99)).toBe(990);
    });
  });
});
