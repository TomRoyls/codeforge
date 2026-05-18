import { describe, it, expect } from 'vitest';
import { SplayMap2 } from '../../src/core/splay-map-2/index.js';

describe('SplayMap2', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('should create an empty map with default comparator', () => {
      const m = new SplayMap2<number, string>();
      expect(m.size).toBe(0);
      expect(m.isEmpty()).toBe(true);
    });

    it('should accept a custom comparator', () => {
      const reverseCmp = (a: number, b: number) => b - a;
      const m = new SplayMap2<number, string>(reverseCmp);
      m.set(1, 'a');
      m.set(2, 'b');
      m.set(3, 'c');
      expect(m.keys()).toEqual([3, 2, 1]);
    });
  });

  // ─── set/get ───
  describe('set/get', () => {
    it('should set and get a single entry', () => {
      const m = new SplayMap2<number, string>();
      m.set(1, 'a');
      expect(m.get(1)).toBe('a');
      expect(m.size).toBe(1);
    });

    it('should overwrite existing key', () => {
      const m = new SplayMap2<number, string>();
      m.set(1, 'a');
      m.set(1, 'b');
      expect(m.get(1)).toBe('b');
      expect(m.size).toBe(1);
    });

    it('should handle multiple entries', () => {
      const m = new SplayMap2<number, string>();
      m.set(3, 'c');
      m.set(1, 'a');
      m.set(2, 'b');
      expect(m.get(1)).toBe('a');
      expect(m.get(2)).toBe('b');
      expect(m.get(3)).toBe('c');
      expect(m.size).toBe(3);
    });

    it('should return undefined for missing key', () => {
      const m = new SplayMap2<number, string>();
      m.set(1, 'a');
      expect(m.get(99)).toBeUndefined();
    });

    it('should return undefined on empty map', () => {
      const m = new SplayMap2<number, string>();
      expect(m.get(1)).toBeUndefined();
    });

    it('should handle string keys', () => {
      const m = new SplayMap2<string, number>();
      m.set('cherry', 3);
      m.set('apple', 1);
      m.set('banana', 2);
      expect(m.get('apple')).toBe(1);
      expect(m.get('banana')).toBe(2);
      expect(m.get('cherry')).toBe(3);
    });

    it('should handle negative keys', () => {
      const m = new SplayMap2<number, string>();
      m.set(-5, 'neg');
      m.set(0, 'zero');
      m.set(5, 'pos');
      expect(m.get(-5)).toBe('neg');
      expect(m.get(0)).toBe('zero');
      expect(m.get(5)).toBe('pos');
    });
  });

  // ─── has ───
  describe('has', () => {
    it('should return true for existing key', () => {
      const m = new SplayMap2<number, string>();
      m.set(1, 'a');
      m.set(2, 'b');
      expect(m.has(1)).toBe(true);
      expect(m.has(2)).toBe(true);
    });

    it('should return false for missing key', () => {
      const m = new SplayMap2<number, string>();
      m.set(1, 'a');
      expect(m.has(99)).toBe(false);
    });

    it('should return false on empty map', () => {
      const m = new SplayMap2<number, string>();
      expect(m.has(1)).toBe(false);
    });
  });

  // ─── delete ───
  describe('delete', () => {
    it('should delete a key', () => {
      const m = new SplayMap2<number, string>();
      m.set(1, 'a');
      expect(m.delete(1)).toBe(true);
      expect(m.size).toBe(0);
      expect(m.has(1)).toBe(false);
    });

    it('should return false for missing key', () => {
      const m = new SplayMap2<number, string>();
      expect(m.delete(99)).toBe(false);
    });

    it('should delete from middle of map', () => {
      const m = new SplayMap2<number, string>();
      m.set(1, 'a');
      m.set(2, 'b');
      m.set(3, 'c');
      expect(m.delete(2)).toBe(true);
      expect(m.size).toBe(2);
      expect(m.keys()).toEqual([1, 3]);
    });

    it('should handle deleting all entries', () => {
      const m = new SplayMap2<number, string>();
      m.set(1, 'a');
      m.set(2, 'b');
      m.set(3, 'c');
      expect(m.delete(1)).toBe(true);
      expect(m.delete(2)).toBe(true);
      expect(m.delete(3)).toBe(true);
      expect(m.size).toBe(0);
      expect(m.isEmpty()).toBe(true);
    });
  });

  // ─── min/max ───
  describe('min/max', () => {
    it('should return min key', () => {
      const m = new SplayMap2<number, string>();
      m.set(5, 'e');
      m.set(3, 'c');
      m.set(7, 'g');
      expect(m.min()).toBe(3);
    });

    it('should return max key', () => {
      const m = new SplayMap2<number, string>();
      m.set(5, 'e');
      m.set(3, 'c');
      m.set(7, 'g');
      expect(m.max()).toBe(7);
    });

    it('should return undefined for empty map', () => {
      const m = new SplayMap2<number, string>();
      expect(m.min()).toBeUndefined();
      expect(m.max()).toBeUndefined();
    });
  });

  // ─── keys/values/entries ───
  describe('keys/values/entries', () => {
    it('should return keys in sorted order', () => {
      const m = new SplayMap2<number, string>();
      m.set(3, 'c');
      m.set(1, 'a');
      m.set(2, 'b');
      expect(m.keys()).toEqual([1, 2, 3]);
    });

    it('should return values in key order', () => {
      const m = new SplayMap2<number, string>();
      m.set(3, 'c');
      m.set(1, 'a');
      m.set(2, 'b');
      expect(m.values()).toEqual(['a', 'b', 'c']);
    });

    it('should return entries in key order', () => {
      const m = new SplayMap2<number, string>();
      m.set(3, 'c');
      m.set(1, 'a');
      m.set(2, 'b');
      expect(m.entries()).toEqual([[1, 'a'], [2, 'b'], [3, 'c']]);
    });

    it('should return empty arrays for empty map', () => {
      const m = new SplayMap2<number, string>();
      expect(m.keys()).toEqual([]);
      expect(m.values()).toEqual([]);
      expect(m.entries()).toEqual([]);
    });
  });

  // ─── clear ───
  describe('clear', () => {
    it('should clear all entries', () => {
      const m = new SplayMap2<number, string>();
      m.set(1, 'a');
      m.set(2, 'b');
      m.clear();
      expect(m.size).toBe(0);
      expect(m.isEmpty()).toBe(true);
      expect(m.get(1)).toBeUndefined();
    });
  });

  // ─── Stress ───
  describe('stress', () => {
    it('should handle 50 random operations', () => {
      const m = new SplayMap2<number, string>();
      const reference = new Map<number, string>();
      const rng = (seed: number) => () => {
        seed = (seed * 1664525 + 1013904223) & 0x7fffffff;
        return seed;
      };
      const rand = rng(42);

      for (let i = 0; i < 50; i++) {
        const op = rand() % 3;
        const key = rand() % 20;
        if (op === 0) {
          const val = `v${key}`;
          m.set(key, val);
          reference.set(key, val);
        } else if (op === 1) {
          expect(m.has(key)).toBe(reference.has(key));
        } else {
          const mResult = m.delete(key);
          const rResult = reference.delete(key);
          expect(mResult).toBe(rResult);
        }
      }
      expect(m.size).toBe(reference.size);
    });
  });
});
