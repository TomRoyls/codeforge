import { describe, it, expect } from 'vitest';
import { SplayTreeMap2 } from '../../src/core/splay-tree-map-2/index.js';

describe('SplayTreeMap2', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('should create an empty map', () => {
      const m = new SplayTreeMap2<number, string>();
      expect(m.size).toBe(0);
      expect(m.isEmpty()).toBe(true);
    });
  });

  // ─── set/get ───
  describe('set/get', () => {
    it('should set and get a single entry', () => {
      const m = new SplayTreeMap2<number, string>();
      m.set(1, 'a');
      expect(m.get(1)).toBe('a');
      expect(m.size).toBe(1);
    });

    it('should overwrite existing key', () => {
      const m = new SplayTreeMap2<number, string>();
      m.set(1, 'a');
      m.set(1, 'b');
      expect(m.get(1)).toBe('b');
      expect(m.size).toBe(1);
    });

    it('should handle multiple entries', () => {
      const m = new SplayTreeMap2<number, string>();
      m.set(3, 'c');
      m.set(1, 'a');
      m.set(2, 'b');
      expect(m.get(1)).toBe('a');
      expect(m.get(2)).toBe('b');
      expect(m.get(3)).toBe('c');
    });

    it('should return undefined for missing key', () => {
      const m = new SplayTreeMap2<number, string>();
      m.set(1, 'a');
      expect(m.get(99)).toBeUndefined();
    });

    it('should return undefined on empty map', () => {
      const m = new SplayTreeMap2<number, string>();
      expect(m.get(1)).toBeUndefined();
    });

    it('should handle string keys', () => {
      const m = new SplayTreeMap2<string, number>();
      m.set('cherry', 3);
      m.set('apple', 1);
      m.set('banana', 2);
      expect(m.get('apple')).toBe(1);
      expect(m.get('cherry')).toBe(3);
    });
  });

  // ─── has ───
  describe('has', () => {
    it('should return true for existing key', () => {
      const m = new SplayTreeMap2<number, string>();
      m.set(1, 'a');
      expect(m.has(1)).toBe(true);
    });

    it('should return false for missing key', () => {
      const m = new SplayTreeMap2<number, string>();
      m.set(1, 'a');
      expect(m.has(99)).toBe(false);
    });

    it('should return false on empty map', () => {
      const m = new SplayTreeMap2<number, string>();
      expect(m.has(1)).toBe(false);
    });
  });

  // ─── delete ───
  describe('delete', () => {
    it('should delete a key', () => {
      const m = new SplayTreeMap2<number, string>();
      m.set(1, 'a');
      expect(m.delete(1)).toBe(true);
      expect(m.size).toBe(0);
    });

    it('should return false for missing key', () => {
      const m = new SplayTreeMap2<number, string>();
      expect(m.delete(99)).toBe(false);
    });

    it('should delete from middle', () => {
      const m = new SplayTreeMap2<number, string>();
      m.set(1, 'a');
      m.set(2, 'b');
      m.set(3, 'c');
      expect(m.delete(2)).toBe(true);
      expect(m.size).toBe(2);
    });
  });

  // ─── min/max ───
  describe('min/max', () => {
    it('should return min key', () => {
      const m = new SplayTreeMap2<number, string>();
      m.set(5, 'e');
      m.set(3, 'c');
      m.set(7, 'g');
      expect(m.min()).toBe(3);
    });

    it('should return max key', () => {
      const m = new SplayTreeMap2<number, string>();
      m.set(5, 'e');
      m.set(3, 'c');
      m.set(7, 'g');
      expect(m.max()).toBe(7);
    });

    it('should return undefined for empty', () => {
      const m = new SplayTreeMap2<number, string>();
      expect(m.min()).toBeUndefined();
      expect(m.max()).toBeUndefined();
    });
  });

  // ─── keys/values ───
  describe('keys/values', () => {
    it('should return keys in order', () => {
      const m = new SplayTreeMap2<number, string>();
      m.set(3, 'c');
      m.set(1, 'a');
      m.set(2, 'b');
      expect(m.keys()).toEqual([1, 2, 3]);
    });

    it('should return values in key order', () => {
      const m = new SplayTreeMap2<number, string>();
      m.set(3, 'c');
      m.set(1, 'a');
      m.set(2, 'b');
      expect(m.values()).toEqual(['a', 'b', 'c']);
    });

    it('should return empty arrays for empty map', () => {
      const m = new SplayTreeMap2<number, string>();
      expect(m.keys()).toEqual([]);
      expect(m.values()).toEqual([]);
    });
  });

  // ─── clear ───
  describe('clear', () => {
    it('should clear all entries', () => {
      const m = new SplayTreeMap2<number, string>();
      m.set(1, 'a');
      m.set(2, 'b');
      m.clear();
      expect(m.size).toBe(0);
      expect(m.isEmpty()).toBe(true);
    });
  });
});
