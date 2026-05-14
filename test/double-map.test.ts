import { describe, it, expect } from 'vitest';
import { DoubleMap } from '../src/core/double-map/index.js';

describe('DoubleMap', () => {
  describe('constructor', () => {
    it('creates empty map without options', () => {
      const map = new DoubleMap<number, number, string>();
      expect(map.size).toBe(0);
      expect(map.isEmpty).toBe(true);
    });

    it('creates map with default hash functions', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      map.set('a', 'b', 'c');
      expect(map.size).toBe(2);
    });

    it('creates map with custom key1 hash function', () => {
      const map = new DoubleMap<{ id: number }, number, string>({
        key1Hash: (k1) => `obj-${k1.id}`
      });
      map.set({ id: 1 }, 2, 'a');
      expect(map.getByKey1({ id: 1 })).toBe('a');
    });

    it('creates map with custom key2 hash function', () => {
      const map = new DoubleMap<number, { id: number }, string>({
        key2Hash: (k2) => `obj-${k2.id}`
      });
      map.set(1, { id: 2 }, 'a');
      expect(map.getByKey2({ id: 2 })).toBe('a');
    });

    it('creates map with both custom hash functions', () => {
      const map = new DoubleMap<{ id: number }, { id: number }, string>({
        key1Hash: (k1) => `k1-${k1.id}`,
        key2Hash: (k2) => `k2-${k2.id}`
      });
      map.set({ id: 1 }, { id: 2 }, 'a');
      expect(map.getByKey1({ id: 1 })).toBe('a');
      expect(map.getByKey2({ id: 2 })).toBe('a');
    });
  });

  describe('set', () => {
    it('sets single entry', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      expect(map.size).toBe(1);
      expect(map.getByKey1(1)).toBe('a');
      expect(map.getByKey2(2)).toBe('a');
    });

    it('sets multiple entries', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      map.set(3, 4, 'b');
      map.set(5, 6, 'c');
      expect(map.size).toBe(3);
      expect(map.getByKey1(1)).toBe('a');
      expect(map.getByKey1(3)).toBe('b');
      expect(map.getByKey1(5)).toBe('c');
    });

    it('replaces entry with same k1', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      map.set(1, 3, 'b');
      expect(map.size).toBe(1);
      expect(map.getByKey1(1)).toBe('b');
      expect(map.getByKey2(2)).toBeUndefined();
      expect(map.getByKey2(3)).toBe('b');
    });

    it('replaces entry with same k2', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      map.set(3, 2, 'b');
      expect(map.size).toBe(1);
      expect(map.getByKey1(1)).toBeUndefined();
      expect(map.getByKey1(3)).toBe('b');
      expect(map.getByKey2(2)).toBe('b');
    });

    it('updates existing entry with same keys', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      map.set(1, 2, 'b');
      expect(map.size).toBe(1);
      expect(map.getByKey1(1)).toBe('b');
      expect(map.getByKey2(2)).toBe('b');
    });

    it('handles string keys', () => {
      const map = new DoubleMap<string, string, number>();
      map.set('a', 'b', 1);
      map.set('c', 'd', 2);
      expect(map.size).toBe(2);
      expect(map.getByKey1('a')).toBe(1);
      expect(map.getByKey2('b')).toBe(1);
    });

    it('handles object keys with custom hash', () => {
      const map = new DoubleMap<{ id: number }, { id: number }, string>({
        key1Hash: (k1) => k1.id.toString(),
        key2Hash: (k2) => k2.id.toString()
      });
      map.set({ id: 1 }, { id: 2 }, 'a');
      map.set({ id: 3 }, { id: 4 }, 'b');
      expect(map.size).toBe(2);
    });
  });

  describe('getByKey1', () => {
    it('returns value for existing key', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      expect(map.getByKey1(1)).toBe('a');
    });

    it('returns undefined for non-existent key', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      expect(map.getByKey1(5)).toBeUndefined();
    });

    it('returns undefined for empty map', () => {
      const map = new DoubleMap<number, number, string>();
      expect(map.getByKey1(1)).toBeUndefined();
    });

    it('handles string keys', () => {
      const map = new DoubleMap<string, number, string>();
      map.set('a', 2, 'x');
      expect(map.getByKey1('a')).toBe('x');
    });

    it('works with custom hash function', () => {
      const map = new DoubleMap<{ id: number }, number, string>({
        key1Hash: (k1) => k1.id.toString()
      });
      map.set({ id: 1 }, 2, 'a');
      expect(map.getByKey1({ id: 1 })).toBe('a');
    });
  });

  describe('getByKey2', () => {
    it('returns value for existing key', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      expect(map.getByKey2(2)).toBe('a');
    });

    it('returns undefined for non-existent key', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      expect(map.getByKey2(5)).toBeUndefined();
    });

    it('returns undefined for empty map', () => {
      const map = new DoubleMap<number, number, string>();
      expect(map.getByKey2(1)).toBeUndefined();
    });

    it('handles string keys', () => {
      const map = new DoubleMap<number, string, string>();
      map.set(1, 'a', 'x');
      expect(map.getByKey2('a')).toBe('x');
    });

    it('works with custom hash function', () => {
      const map = new DoubleMap<number, { id: number }, string>({
        key2Hash: (k2) => k2.id.toString()
      });
      map.set(1, { id: 2 }, 'a');
      expect(map.getByKey2({ id: 2 })).toBe('a');
    });
  });

  describe('deleteByKey1', () => {
    it('deletes entry and returns true', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      map.set(3, 4, 'b');
      expect(map.deleteByKey1(1)).toBe(true);
      expect(map.size).toBe(1);
      expect(map.hasKey1(1)).toBe(false);
      expect(map.hasKey2(2)).toBe(false);
    });

    it('returns false for non-existent key', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      expect(map.deleteByKey1(5)).toBe(false);
      expect(map.size).toBe(1);
    });

    it('returns false for empty map', () => {
      const map = new DoubleMap<number, number, string>();
      expect(map.deleteByKey1(1)).toBe(false);
      expect(map.size).toBe(0);
    });

    it('deletes all entries', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      map.set(3, 4, 'b');
      map.set(5, 6, 'c');
      map.deleteByKey1(1);
      map.deleteByKey1(3);
      map.deleteByKey1(5);
      expect(map.size).toBe(0);
      expect(map.isEmpty).toBe(true);
    });

    it('works with custom hash function', () => {
      const map = new DoubleMap<{ id: number }, number, string>({
        key1Hash: (k1) => k1.id.toString()
      });
      map.set({ id: 1 }, 2, 'a');
      expect(map.deleteByKey1({ id: 1 })).toBe(true);
      expect(map.size).toBe(0);
    });
  });

  describe('deleteByKey2', () => {
    it('deletes entry and returns true', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      map.set(3, 4, 'b');
      expect(map.deleteByKey2(2)).toBe(true);
      expect(map.size).toBe(1);
      expect(map.hasKey1(1)).toBe(false);
      expect(map.hasKey2(2)).toBe(false);
    });

    it('returns false for non-existent key', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      expect(map.deleteByKey2(5)).toBe(false);
      expect(map.size).toBe(1);
    });

    it('returns false for empty map', () => {
      const map = new DoubleMap<number, number, string>();
      expect(map.deleteByKey2(1)).toBe(false);
      expect(map.size).toBe(0);
    });

    it('deletes all entries', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      map.set(3, 4, 'b');
      map.set(5, 6, 'c');
      map.deleteByKey2(2);
      map.deleteByKey2(4);
      map.deleteByKey2(6);
      expect(map.size).toBe(0);
      expect(map.isEmpty).toBe(true);
    });

    it('works with custom hash function', () => {
      const map = new DoubleMap<number, { id: number }, string>({
        key2Hash: (k2) => k2.id.toString()
      });
      map.set(1, { id: 2 }, 'a');
      expect(map.deleteByKey2({ id: 2 })).toBe(true);
      expect(map.size).toBe(0);
    });
  });

  describe('hasKey1', () => {
    it('returns true for existing key', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      expect(map.hasKey1(1)).toBe(true);
    });

    it('returns false for non-existent key', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      expect(map.hasKey1(5)).toBe(false);
    });

    it('returns false for empty map', () => {
      const map = new DoubleMap<number, number, string>();
      expect(map.hasKey1(1)).toBe(false);
    });

    it('works with custom hash function', () => {
      const map = new DoubleMap<{ id: number }, number, string>({
        key1Hash: (k1) => k1.id.toString()
      });
      map.set({ id: 1 }, 2, 'a');
      expect(map.hasKey1({ id: 1 })).toBe(true);
      expect(map.hasKey1({ id: 5 })).toBe(false);
    });
  });

  describe('hasKey2', () => {
    it('returns true for existing key', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      expect(map.hasKey2(2)).toBe(true);
    });

    it('returns false for non-existent key', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      expect(map.hasKey2(5)).toBe(false);
    });

    it('returns false for empty map', () => {
      const map = new DoubleMap<number, number, string>();
      expect(map.hasKey2(1)).toBe(false);
    });

    it('works with custom hash function', () => {
      const map = new DoubleMap<number, { id: number }, string>({
        key2Hash: (k2) => k2.id.toString()
      });
      map.set(1, { id: 2 }, 'a');
      expect(map.hasKey2({ id: 2 })).toBe(true);
      expect(map.hasKey2({ id: 5 })).toBe(false);
    });
  });

  describe('size', () => {
    it('returns 0 for empty map', () => {
      const map = new DoubleMap<number, number, string>();
      expect(map.size).toBe(0);
    });

    it('tracks size after adding entries', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      expect(map.size).toBe(1);
      map.set(3, 4, 'b');
      expect(map.size).toBe(2);
      map.set(5, 6, 'c');
      expect(map.size).toBe(3);
    });

    it('tracks size after replacing entries', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      map.set(3, 4, 'b');
      expect(map.size).toBe(2);
      map.set(1, 5, 'c');
      expect(map.size).toBe(2);
    });

    it('tracks size after deleting entries', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      map.set(3, 4, 'b');
      map.set(5, 6, 'c');
      expect(map.size).toBe(3);
      map.deleteByKey1(3);
      expect(map.size).toBe(2);
      map.deleteByKey2(2);
      expect(map.size).toBe(1);
    });

    it('returns 0 after clear', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      map.set(3, 4, 'b');
      expect(map.size).toBe(2);
      map.clear();
      expect(map.size).toBe(0);
    });
  });

  describe('isEmpty', () => {
    it('returns true for empty map', () => {
      const map = new DoubleMap<number, number, string>();
      expect(map.isEmpty).toBe(true);
    });

    it('returns false for non-empty map', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      expect(map.isEmpty).toBe(false);
    });

    it('returns true after clearing all entries', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      map.set(3, 4, 'b');
      map.deleteByKey1(1);
      map.deleteByKey1(3);
      expect(map.isEmpty).toBe(true);
    });

    it('returns true after clear', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      map.clear();
      expect(map.isEmpty).toBe(true);
    });
  });

  describe('clear', () => {
    it('clears empty map', () => {
      const map = new DoubleMap<number, number, string>();
      map.clear();
      expect(map.size).toBe(0);
      expect(map.isEmpty).toBe(true);
    });

    it('clears single entry', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      map.clear();
      expect(map.size).toBe(0);
      expect(map.isEmpty).toBe(true);
    });

    it('clears multiple entries', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      map.set(3, 4, 'b');
      map.set(5, 6, 'c');
      map.clear();
      expect(map.size).toBe(0);
      expect(map.isEmpty).toBe(true);
      expect(map.hasKey1(1)).toBe(false);
      expect(map.hasKey1(3)).toBe(false);
      expect(map.hasKey1(5)).toBe(false);
    });

    it('allows operations after clear', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      map.clear();
      map.set(10, 20, 'b');
      expect(map.size).toBe(1);
      expect(map.getByKey1(10)).toBe('b');
    });

    it('clears multiple times', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      map.clear();
      map.clear();
      map.clear();
      expect(map.size).toBe(0);
      expect(map.isEmpty).toBe(true);
    });
  });

  describe('toArray', () => {
    it('returns empty array for empty map', () => {
      const map = new DoubleMap<number, number, string>();
      expect(map.toArray()).toEqual([]);
    });

    it('returns single entry', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      const arr = map.toArray();
      expect(arr.length).toBe(1);
      expect(arr[0].k1).toBe(1);
      expect(arr[0].k2).toBe(2);
      expect(arr[0].v).toBe('a');
    });

    it('returns multiple entries', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      map.set(3, 4, 'b');
      map.set(5, 6, 'c');
      const arr = map.toArray();
      expect(arr.length).toBe(3);
      expect(arr.some((e) => e.k1 === 1 && e.k2 === 2 && e.v === 'a')).toBe(true);
      expect(arr.some((e) => e.k1 === 3 && e.k2 === 4 && e.v === 'b')).toBe(true);
      expect(arr.some((e) => e.k1 === 5 && e.k2 === 6 && e.v === 'c')).toBe(true);
    });

    it('returns independent array from internal state', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      const arr = map.toArray();
      arr[0].v = 'modified';
      expect(map.getByKey1(1)).toBe('a');
    });
  });

  describe('clone', () => {
    it('clones empty map', () => {
      const map = new DoubleMap<number, number, string>();
      const cloned = map.clone();
      expect(cloned.size).toBe(0);
      expect(cloned.isEmpty).toBe(true);
      expect(cloned).not.toBe(map);
    });

    it('clones non-empty map', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      map.set(3, 4, 'b');
      map.set(5, 6, 'c');
      const cloned = map.clone();
      expect(cloned.size).toBe(3);
      expect(cloned.getByKey1(1)).toBe('a');
      expect(cloned.getByKey1(3)).toBe('b');
      expect(cloned.getByKey1(5)).toBe('c');
    });

    it('creates independent clone', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      map.set(3, 4, 'b');
      const cloned = map.clone();
      cloned.set(7, 8, 'c');
      cloned.deleteByKey1(1);
      expect(map.size).toBe(2);
      expect(map.hasKey1(1)).toBe(true);
      expect(map.hasKey1(7)).toBe(false);
      expect(cloned.size).toBe(2);
      expect(cloned.hasKey1(1)).toBe(false);
      expect(cloned.hasKey1(7)).toBe(true);
    });

    it('preserves hash functions', () => {
      const customHash1 = (k1: { id: number }) => `k1-${k1.id}`;
      const customHash2 = (k2: { id: number }) => `k2-${k2.id}`;
      const map = new DoubleMap<{ id: number }, { id: number }, string>({
        key1Hash: customHash1,
        key2Hash: customHash2
      });
      map.set({ id: 1 }, { id: 2 }, 'a');
      const cloned = map.clone();
      cloned.set({ id: 3 }, { id: 4 }, 'b');
      expect(cloned.size).toBe(2);
    });
  });

  describe('fromArray', () => {
    it('creates map from array', () => {
      const map = DoubleMap.fromArray([
        { k1: 1, k2: 2, v: 'a' },
        { k1: 3, k2: 4, v: 'b' },
        { k1: 5, k2: 6, v: 'c' }
      ]);
      expect(map.size).toBe(3);
      expect(map.getByKey1(1)).toBe('a');
      expect(map.getByKey1(3)).toBe('b');
      expect(map.getByKey1(5)).toBe('c');
    });

    it('handles empty array', () => {
      const map = DoubleMap.fromArray([]);
      expect(map.size).toBe(0);
      expect(map.isEmpty).toBe(true);
    });

    it('replaces duplicate entries', () => {
      const map = DoubleMap.fromArray([
        { k1: 1, k2: 2, v: 'a' },
        { k1: 1, k2: 2, v: 'b' }
      ]);
      expect(map.size).toBe(1);
      expect(map.getByKey1(1)).toBe('b');
    });

    it('accepts custom options', () => {
      const customHash1 = (k1: { id: number }) => k1.id.toString();
      const customHash2 = (k2: { id: number }) => k2.id.toString();
      const map = DoubleMap.fromArray(
        [{ k1: { id: 1 }, k2: { id: 2 }, v: 'a' }],
        { key1Hash: customHash1, key2Hash: customHash2 }
      );
      expect(map.size).toBe(1);
      expect(map.getByKey1({ id: 1 })).toBe('a');
    });
  });

  describe('forEach', () => {
    it('does not iterate on empty map', () => {
      const map = new DoubleMap<number, number, string>();
      let called = false;
      map.forEach(() => {
        called = true;
      });
      expect(called).toBe(false);
    });

    it('iterates over single entry', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      const items: Array<{ k1: number; k2: number; v: string }> = [];
      map.forEach((k1, k2, v) => {
        items.push({ k1, k2, v });
      });
      expect(items).toEqual([{ k1: 1, k2: 2, v: 'a' }]);
    });

    it('iterates over multiple entries', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      map.set(3, 4, 'b');
      map.set(5, 6, 'c');
      const items: Array<{ k1: number; k2: number; v: string }> = [];
      map.forEach((k1, k2, v) => {
        items.push({ k1, k2, v });
      });
      expect(items.length).toBe(3);
      expect(items.some((e) => e.k1 === 1 && e.k2 === 2 && e.v === 'a')).toBe(true);
      expect(items.some((e) => e.k1 === 3 && e.k2 === 4 && e.v === 'b')).toBe(true);
      expect(items.some((e) => e.k1 === 5 && e.k2 === 6 && e.v === 'c')).toBe(true);
    });
  });

  describe('Symbol.iterator', () => {
    it('does not iterate over empty map', () => {
      const map = new DoubleMap<number, number, string>();
      const result: Array<{ k1: number; k2: number; v: string }> = [];
      for (const entry of map) {
        result.push(entry);
      }
      expect(result).toEqual([]);
    });

    it('iterates over single entry', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      const result: Array<{ k1: number; k2: number; v: string }> = [];
      for (const entry of map) {
        result.push(entry);
      }
      expect(result).toEqual([{ k1: 1, k2: 2, v: 'a' }]);
    });

    it('iterates over multiple entries', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      map.set(3, 4, 'b');
      map.set(5, 6, 'c');
      const result: Array<{ k1: number; k2: number; v: string }> = [];
      for (const entry of map) {
        result.push(entry);
      }
      expect(result.length).toBe(3);
    });

    it('supports spread operator', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      map.set(3, 4, 'b');
      const result = [...map];
      expect(result.length).toBe(2);
      expect(result.some((e) => e.k1 === 1 && e.k2 === 2 && e.v === 'a')).toBe(true);
      expect(result.some((e) => e.k1 === 3 && e.k2 === 4 && e.v === 'b')).toBe(true);
    });

    it('supports Array.from', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      map.set(3, 4, 'b');
      const result = Array.from(map);
      expect(result.length).toBe(2);
      expect(result.some((e) => e.k1 === 1 && e.k2 === 2 && e.v === 'a')).toBe(true);
      expect(result.some((e) => e.k1 === 3 && e.k2 === 4 && e.v === 'b')).toBe(true);
    });
  });

  describe('keys1', () => {
    it('returns empty array for empty map', () => {
      const map = new DoubleMap<number, number, string>();
      expect(map.keys1()).toEqual([]);
    });

    it('returns single key', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      expect(map.keys1()).toEqual([1]);
    });

    it('returns multiple keys', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      map.set(3, 4, 'b');
      map.set(5, 6, 'c');
      const keys = map.keys1();
      expect(keys.length).toBe(3);
      expect(keys).toContain(1);
      expect(keys).toContain(3);
      expect(keys).toContain(5);
    });
  });

  describe('keys2', () => {
    it('returns empty array for empty map', () => {
      const map = new DoubleMap<number, number, string>();
      expect(map.keys2()).toEqual([]);
    });

    it('returns single key', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      expect(map.keys2()).toEqual([2]);
    });

    it('returns multiple keys', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      map.set(3, 4, 'b');
      map.set(5, 6, 'c');
      const keys = map.keys2();
      expect(keys.length).toBe(3);
      expect(keys).toContain(2);
      expect(keys).toContain(4);
      expect(keys).toContain(6);
    });
  });

  describe('values', () => {
    it('returns empty array for empty map', () => {
      const map = new DoubleMap<number, number, string>();
      expect(map.values()).toEqual([]);
    });

    it('returns single value', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      expect(map.values()).toEqual(['a']);
    });

    it('returns multiple values', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      map.set(3, 4, 'b');
      map.set(5, 6, 'c');
      const values = map.values();
      expect(values.length).toBe(3);
      expect(values).toContain('a');
      expect(values).toContain('b');
      expect(values).toContain('c');
    });
  });

  describe('update', () => {
    it('updates value for existing entry and returns true', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      expect(map.update(1, 2, 'b')).toBe(true);
      expect(map.getByKey1(1)).toBe('b');
    });

    it('returns false for non-existent entry', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      expect(map.update(1, 5, 'b')).toBe(false);
      expect(map.getByKey1(1)).toBe('a');
      expect(map.size).toBe(1);
    });

    it('returns false for non-existent k1', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      expect(map.update(5, 2, 'b')).toBe(false);
      expect(map.size).toBe(1);
    });

    it('returns false when k1 exists but k2 does not match', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      expect(map.update(1, 5, 'b')).toBe(false);
      expect(map.getByKey1(1)).toBe('a');
    });

    it('does not create new entry', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      map.update(1, 2, 'b');
      expect(map.size).toBe(1);
    });
  });

  describe('getKey1ByValue', () => {
    it('returns k1 for existing value', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      map.set(3, 4, 'b');
      expect(map.getKey1ByValue('a')).toBe(1);
      expect(map.getKey1ByValue('b')).toBe(3);
    });

    it('returns undefined for non-existent value', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      expect(map.getKey1ByValue('b')).toBeUndefined();
    });

    it('returns undefined for empty map', () => {
      const map = new DoubleMap<number, number, string>();
      expect(map.getKey1ByValue('a')).toBeUndefined();
    });

    it('returns first matching k1', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      map.set(3, 4, 'a');
      const result = map.getKey1ByValue('a');
      expect(result === 1 || result === 3).toBe(true);
    });
  });

  describe('getKey2ByValue', () => {
    it('returns k2 for existing value', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      map.set(3, 4, 'b');
      expect(map.getKey2ByValue('a')).toBe(2);
      expect(map.getKey2ByValue('b')).toBe(4);
    });

    it('returns undefined for non-existent value', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      expect(map.getKey2ByValue('b')).toBeUndefined();
    });

    it('returns undefined for empty map', () => {
      const map = new DoubleMap<number, number, string>();
      expect(map.getKey2ByValue('a')).toBeUndefined();
    });

    it('returns first matching k2', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      map.set(3, 4, 'a');
      const result = map.getKey2ByValue('a');
      expect(result === 2 || result === 4).toBe(true);
    });
  });

  describe('getByEither', () => {
    it('returns value by k1', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      expect(map.getByEither(1)).toBe('a');
    });

    it('returns value by k2', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      expect(map.getByEither(2)).toBe('a');
    });

    it('returns undefined for non-existent key', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      expect(map.getByEither(5)).toBeUndefined();
    });

    it('returns undefined for empty map', () => {
      const map = new DoubleMap<number, number, string>();
      expect(map.getByEither(1)).toBeUndefined();
    });

    it('prefers k1 when both exist', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 1, 'a');
      expect(map.getByEither(1)).toBe('a');
    });
  });

  describe('hasValue', () => {
    it('returns true for existing value', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      map.set(3, 4, 'b');
      expect(map.hasValue('a')).toBe(true);
      expect(map.hasValue('b')).toBe(true);
    });

    it('returns false for non-existent value', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      expect(map.hasValue('b')).toBe(false);
    });

    it('returns false for empty map', () => {
      const map = new DoubleMap<number, number, string>();
      expect(map.hasValue('a')).toBe(false);
    });

    it('handles duplicate values', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      map.set(3, 4, 'a');
      expect(map.hasValue('a')).toBe(true);
    });
  });

  describe('entries', () => {
    it('returns empty array for empty map', () => {
      const map = new DoubleMap<number, number, string>();
      expect(map.entries()).toEqual([]);
    });

    it('returns single entry as tuple', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      const arr = map.entries();
      expect(arr.length).toBe(1);
      expect(arr[0]).toEqual([1, 2, 'a']);
    });

    it('returns multiple entries as tuples', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      map.set(3, 4, 'b');
      map.set(5, 6, 'c');
      const arr = map.entries();
      expect(arr.length).toBe(3);
      expect(arr.some((e) => e[0] === 1 && e[1] === 2 && e[2] === 'a')).toBe(true);
      expect(arr.some((e) => e[0] === 3 && e[1] === 4 && e[2] === 'b')).toBe(true);
      expect(arr.some((e) => e[0] === 5 && e[1] === 6 && e[2] === 'c')).toBe(true);
    });
  });

  describe('count', () => {
    it('returns 0 for empty map', () => {
      const map = new DoubleMap<number, number, string>();
      expect(map.count()).toBe(0);
    });

    it('returns count of entries', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      map.set(3, 4, 'b');
      map.set(5, 6, 'c');
      expect(map.count()).toBe(3);
    });

    it('matches size', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      map.set(3, 4, 'b');
      map.set(5, 6, 'c');
      expect(map.count()).toBe(map.size);
    });
  });

  describe('equals', () => {
    it('returns true for equal maps', () => {
      const map1 = new DoubleMap<number, number, string>();
      map1.set(1, 2, 'a');
      map1.set(3, 4, 'b');

      const map2 = new DoubleMap<number, number, string>();
      map2.set(1, 2, 'a');
      map2.set(3, 4, 'b');

      expect(map1.equals(map2)).toBe(true);
    });

    it('returns false for maps with different values', () => {
      const map1 = new DoubleMap<number, number, string>();
      map1.set(1, 2, 'a');
      map1.set(3, 4, 'b');

      const map2 = new DoubleMap<number, number, string>();
      map2.set(1, 2, 'a');
      map2.set(3, 4, 'c');

      expect(map1.equals(map2)).toBe(false);
    });

    it('returns false for maps with different sizes', () => {
      const map1 = new DoubleMap<number, number, string>();
      map1.set(1, 2, 'a');

      const map2 = new DoubleMap<number, number, string>();
      map2.set(1, 2, 'a');
      map2.set(3, 4, 'b');

      expect(map1.equals(map2)).toBe(false);
    });

    it('returns true for two empty maps', () => {
      const map1 = new DoubleMap<number, number, string>();
      const map2 = new DoubleMap<number, number, string>();

      expect(map1.equals(map2)).toBe(true);
    });

    it('returns true for same map', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      map.set(3, 4, 'b');

      expect(map.equals(map)).toBe(true);
    });

    it('does not modify either map', () => {
      const map1 = new DoubleMap<number, number, string>();
      map1.set(1, 2, 'a');

      const map2 = new DoubleMap<number, number, string>();
      map2.set(1, 2, 'a');

      map1.equals(map2);
      expect(map1.size).toBe(1);
      expect(map2.size).toBe(1);
    });

    it('uses custom value equals function', () => {
      const map1 = new DoubleMap<number, number, { value: string }>();
      map1.set(1, 2, { value: 'a' });

      const map2 = new DoubleMap<number, number, { value: string }>();
      map2.set(1, 2, { value: 'A' });

      expect(map1.equals(map2, (a, b) => a.value.toLowerCase() === b.value.toLowerCase())).toBe(true);
      expect(map1.equals(map2)).toBe(false);
    });
  });

  describe('integration', () => {
    it('handles complex workflow with multiple operations', () => {
      const map = DoubleMap.fromArray([
        { k1: 1, k2: 2, v: 'a' },
        { k1: 3, k2: 4, v: 'b' },
        { k1: 5, k2: 6, v: 'c' }
      ]);

      expect(map.size).toBe(3);
      expect(map.getByKey1(1)).toBe('a');
      expect(map.getByKey2(4)).toBe('b');
      expect(map.hasKey1(5)).toBe(true);
      expect(map.hasKey2(6)).toBe(true);

      map.update(1, 2, 'x');
      expect(map.getByKey1(1)).toBe('x');

      map.deleteByKey1(3);
      expect(map.size).toBe(2);
      expect(map.hasKey1(3)).toBe(false);

      const cloned = map.clone();
      expect(cloned.size).toBe(2);
      expect(cloned.equals(map)).toBe(true);

      const arr = map.toArray();
      expect(arr.length).toBe(2);
    });

    it('maintains consistency across operations', () => {
      const map = new DoubleMap<number, number, string>();

      map.set(1, 2, 'a');
      map.set(3, 4, 'b');

      expect(map.size).toBe(2);
      expect(map.count()).toBe(2);
      expect(map.isEmpty).toBe(false);

      map.clear();
      expect(map.size).toBe(0);
      expect(map.count()).toBe(0);
      expect(map.isEmpty).toBe(true);
    });

    it('works with iterator after modifications', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(1, 2, 'a');
      map.set(3, 4, 'b');

      const entries1 = [...map];
      map.set(5, 6, 'c');
      const entries2 = [...map];

      expect(entries1.length).toBe(2);
      expect(entries2.length).toBe(3);
    });
  });

  describe('edge cases', () => {
    it('handles number zero', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(0, 0, 'a');
      expect(map.getByKey1(0)).toBe('a');
      expect(map.getByKey2(0)).toBe('a');
    });

    it('handles negative numbers', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(-1, -2, 'a');
      map.set(-3, -4, 'b');
      expect(map.size).toBe(2);
      expect(map.getByKey1(-1)).toBe('a');
      expect(map.getByKey2(-4)).toBe('b');
    });

    it('handles special number values', () => {
      const map = new DoubleMap<number, number, string>();
      map.set(Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, 'a');
      expect(map.getByKey1(Number.MAX_SAFE_INTEGER)).toBe('a');
      expect(map.getByKey2(Number.MIN_SAFE_INTEGER)).toBe('a');
    });

    it('handles many operations', () => {
      const map = new DoubleMap<number, number, number>();
      for (let i = 0; i < 100; i++) {
        map.set(i, i + 100, i);
      }
      expect(map.size).toBe(100);
      for (let i = 0; i < 100; i++) {
        expect(map.getByKey1(i)).toBe(i);
      }
    });

    it('handles rapid set and delete', () => {
      const map = new DoubleMap<number, number, number>();
      for (let i = 0; i < 50; i++) {
        map.set(i, i + 50, i);
      }
      for (let i = 0; i < 25; i++) {
        map.deleteByKey1(i);
      }
      expect(map.size).toBe(25);
    });
  });
});
