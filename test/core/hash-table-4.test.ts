import { describe, it, expect } from 'vitest';
import { HashTable4 } from '../../src/core/hash-table-4/index.js';

describe('HashTable4', () => {
  // ─── Constructor ───

  describe('constructor', () => {
    it('creates empty table with defaults', () => {
      const ht = new HashTable4<string, number>();
      expect(ht.size).toBe(0);
      expect(ht.isEmpty).toBe(true);
    });

    it('accepts custom capacity', () => {
      const ht = new HashTable4<string, number>(32);
      expect(ht.capacity).toBeGreaterThanOrEqual(32);
    });

    it('handles capacity of 1 gracefully', () => {
      const ht = new HashTable4<string, number>(1);
      expect(ht.capacity).toBeGreaterThanOrEqual(1);
    });
  });

  // ─── set / get ───

  describe('set / get', () => {
    it('sets and gets a value', () => {
      const ht = new HashTable4<string, number>();
      ht.set('a', 1);
      expect(ht.get('a')).toBe(1);
    });

    it('returns undefined for missing key', () => {
      const ht = new HashTable4<string, number>();
      expect(ht.get('missing')).toBeUndefined();
    });

    it('overwrites existing key', () => {
      const ht = new HashTable4<string, number>();
      ht.set('k', 1);
      ht.set('k', 2);
      expect(ht.get('k')).toBe(2);
      expect(ht.size).toBe(1);
    });

    it('sets multiple entries', () => {
      const ht = new HashTable4<string, number>();
      ht.set('a', 1);
      ht.set('b', 2);
      ht.set('c', 3);
      expect(ht.size).toBe(3);
      expect(ht.get('a')).toBe(1);
      expect(ht.get('b')).toBe(2);
      expect(ht.get('c')).toBe(3);
    });

    it('handles numeric keys', () => {
      const ht = new HashTable4<number, string>();
      ht.set(1, 'one');
      ht.set(2, 'two');
      expect(ht.get(1)).toBe('one');
      expect(ht.get(2)).toBe('two');
    });

    it('handles negative numeric keys', () => {
      const ht = new HashTable4<number, string>();
      ht.set(-1, 'neg');
      expect(ht.get(-1)).toBe('neg');
    });
  });

  // ─── has ───

  describe('has', () => {
    it('returns true for existing key', () => {
      const ht = new HashTable4<string, number>();
      ht.set('x', 10);
      expect(ht.has('x')).toBe(true);
    });

    it('returns false for missing key', () => {
      const ht = new HashTable4<string, number>();
      expect(ht.has('x')).toBe(false);
    });

    it('returns false after delete', () => {
      const ht = new HashTable4<string, number>();
      ht.set('x', 10);
      ht.delete('x');
      expect(ht.has('x')).toBe(false);
    });
  });

  // ─── delete ───

  describe('delete', () => {
    it('deletes existing key and returns true', () => {
      const ht = new HashTable4<string, number>();
      ht.set('a', 1);
      expect(ht.delete('a')).toBe(true);
      expect(ht.get('a')).toBeUndefined();
      expect(ht.size).toBe(0);
    });

    it('returns false for missing key', () => {
      const ht = new HashTable4<string, number>();
      expect(ht.delete('missing')).toBe(false);
    });

    it('only deletes the specified key', () => {
      const ht = new HashTable4<string, number>();
      ht.set('a', 1);
      ht.set('b', 2);
      ht.delete('a');
      expect(ht.has('a')).toBe(false);
      expect(ht.has('b')).toBe(true);
      expect(ht.size).toBe(1);
    });
  });

  // ─── size / isEmpty ───

  describe('size / isEmpty', () => {
    it('tracks size', () => {
      const ht = new HashTable4<string, number>();
      expect(ht.isEmpty).toBe(true);
      ht.set('a', 1);
      expect(ht.size).toBe(1);
      ht.set('b', 2);
      expect(ht.size).toBe(2);
      ht.delete('a');
      expect(ht.size).toBe(1);
    });
  });

  // ─── clear ───

  describe('clear', () => {
    it('removes all entries', () => {
      const ht = new HashTable4<string, number>();
      ht.set('a', 1);
      ht.set('b', 2);
      ht.clear();
      expect(ht.size).toBe(0);
      expect(ht.isEmpty).toBe(true);
    });
  });

  // ─── keys / values / entries ───

  describe('keys / values / entries', () => {
    it('returns all keys', () => {
      const ht = new HashTable4<string, number>();
      ht.set('a', 1);
      ht.set('b', 2);
      expect(ht.keys().sort()).toEqual(['a', 'b']);
    });

    it('returns all values', () => {
      const ht = new HashTable4<string, number>();
      ht.set('a', 1);
      ht.set('b', 2);
      expect(ht.values().sort()).toEqual([1, 2]);
    });

    it('returns all entries', () => {
      const ht = new HashTable4<string, number>();
      ht.set('a', 1);
      ht.set('b', 2);
      const entries = ht.entries().sort((a, b) => a[0].localeCompare(b[0]));
      expect(entries).toEqual([['a', 1], ['b', 2]]);
    });

    it('excludes deleted entries', () => {
      const ht = new HashTable4<string, number>();
      ht.set('a', 1);
      ht.set('b', 2);
      ht.delete('a');
      expect(ht.keys()).toEqual(['b']);
      expect(ht.values()).toEqual([2]);
    });
  });

  // ─── forEach ───

  describe('forEach', () => {
    it('iterates all entries', () => {
      const ht = new HashTable4<string, number>();
      ht.set('a', 1);
      ht.set('b', 2);
      const collected: [string, number][] = [];
      ht.forEach((v, k) => collected.push([k, v]));
      expect(collected.sort((a, b) => a[0].localeCompare(b[0]))).toEqual([['a', 1], ['b', 2]]);
    });
  });

  // ─── resize ───

  describe('resize', () => {
    it('resizes and preserves entries', () => {
      const ht = new HashTable4<string, number>();
      ht.set('a', 1);
      ht.set('b', 2);
      ht.set('c', 3);
      ht.resize(64);
      expect(ht.size).toBe(3);
      expect(ht.get('a')).toBe(1);
      expect(ht.get('b')).toBe(2);
      expect(ht.get('c')).toBe(3);
      expect(ht.capacity).toBeGreaterThanOrEqual(64);
    });
  });

  // ─── loadFactor / capacity ───

  describe('loadFactor / capacity', () => {
    it('returns current load factor', () => {
      const ht = new HashTable4<string, number>();
      expect(ht.loadFactor).toBe(0);
      ht.set('a', 1);
      expect(ht.loadFactor).toBeGreaterThan(0);
    });

    it('returns current capacity', () => {
      const ht = new HashTable4<string, number>();
      expect(ht.capacity).toBeGreaterThanOrEqual(16);
    });
  });

  // ─── getTimeComplexity ───

  describe('getTimeComplexity', () => {
    it('returns complexity string', () => {
      const ht = new HashTable4<string, number>();
      expect(ht.getTimeComplexity()).toBe('Average: O(1), Worst: O(n)');
    });
  });

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('handles empty string key', () => {
      const ht = new HashTable4<string, number>();
      ht.set('', 0);
      expect(ht.get('')).toBe(0);
    });

    it('handles set-delete-set cycle', () => {
      const ht = new HashTable4<string, number>();
      ht.set('a', 1);
      ht.delete('a');
      ht.set('a', 2);
      expect(ht.get('a')).toBe(2);
      expect(ht.size).toBe(1);
    });

    it('handles many entries', () => {
      const ht = new HashTable4<string, number>();
      for (let i = 0; i < 200; i++) {
        ht.set(`key_${i}`, i);
      }
      expect(ht.size).toBe(200);
      for (let i = 0; i < 200; i++) {
        expect(ht.get(`key_${i}`)).toBe(i);
      }
    });

    it('handles Infinity numeric key', () => {
      const ht = new HashTable4<number, string>();
      ht.set(Infinity, 'inf');
      expect(ht.get(Infinity)).toBe('inf');
    });

    it('handles object keys via toString', () => {
      const ht = new HashTable4<object, number>();
      const key = { toString: () => 'obj' };
      ht.set(key, 42);
      expect(ht.get(key)).toBe(42);
    });
  });
});
