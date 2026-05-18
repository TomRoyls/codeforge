import { describe, it, expect } from 'vitest';
import { HashMap5 } from '../../src/core/hash-map-5/index.js';

describe('HashMap5', () => {
  // ─── Constructor ───

  describe('constructor', () => {
    it('creates empty map with defaults', () => {
      const map = new HashMap5<string, number>();
      expect(map.size).toBe(0);
      expect(map.isEmpty).toBe(true);
    });

    it('accepts custom capacity and load factor', () => {
      const map = new HashMap5<string, number>(32, 0.5);
      expect(map.size).toBe(0);
    });
  });

  // ─── set / get ───

  describe('set / get', () => {
    it('sets and gets a value', () => {
      const map = new HashMap5<string, number>();
      map.set('a', 1);
      expect(map.get('a')).toBe(1);
    });

    it('returns undefined for missing key', () => {
      const map = new HashMap5<string, number>();
      expect(map.get('missing')).toBeUndefined();
    });

    it('overwrites existing key', () => {
      const map = new HashMap5<string, number>();
      map.set('k', 1);
      map.set('k', 2);
      expect(map.get('k')).toBe(2);
      expect(map.size).toBe(1);
    });

    it('sets multiple entries', () => {
      const map = new HashMap5<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      expect(map.size).toBe(3);
      expect(map.get('a')).toBe(1);
      expect(map.get('b')).toBe(2);
      expect(map.get('c')).toBe(3);
    });
  });

  // ─── has ───

  describe('has', () => {
    it('returns true for existing key', () => {
      const map = new HashMap5<string, number>();
      map.set('x', 10);
      expect(map.has('x')).toBe(true);
    });

    it('returns false for missing key', () => {
      const map = new HashMap5<string, number>();
      expect(map.has('x')).toBe(false);
    });

    it('returns false after delete', () => {
      const map = new HashMap5<string, number>();
      map.set('x', 10);
      map.delete('x');
      expect(map.has('x')).toBe(false);
    });
  });

  // ─── delete ───

  describe('delete', () => {
    it('deletes existing key and returns true', () => {
      const map = new HashMap5<string, number>();
      map.set('a', 1);
      expect(map.delete('a')).toBe(true);
      expect(map.get('a')).toBeUndefined();
      expect(map.size).toBe(0);
    });

    it('returns false for missing key', () => {
      const map = new HashMap5<string, number>();
      expect(map.delete('missing')).toBe(false);
    });

    it('only deletes the specified key', () => {
      const map = new HashMap5<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.delete('a');
      expect(map.get('a')).toBeUndefined();
      expect(map.get('b')).toBe(2);
      expect(map.size).toBe(1);
    });
  });

  // ─── size / isEmpty ───

  describe('size / isEmpty', () => {
    it('tracks size via getter', () => {
      const map = new HashMap5<string, number>();
      expect(map.isEmpty).toBe(true);
      map.set('a', 1);
      expect(map.size).toBe(1);
      expect(map.isEmpty).toBe(false);
    });
  });

  // ─── clear ───

  describe('clear', () => {
    it('removes all entries', () => {
      const map = new HashMap5<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.clear();
      expect(map.size).toBe(0);
      expect(map.isEmpty).toBe(true);
    });
  });

  // ─── keys / values / entries ───

  describe('keys / values / entries', () => {
    it('returns all keys', () => {
      const map = new HashMap5<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      expect(map.keys().sort()).toEqual(['a', 'b']);
    });

    it('returns all values', () => {
      const map = new HashMap5<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      expect(map.values().sort()).toEqual([1, 2]);
    });

    it('returns all entries', () => {
      const map = new HashMap5<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      const entries = map.entries().sort((a, b) => a[0].localeCompare(b[0]));
      expect(entries).toEqual([['a', 1], ['b', 2]]);
    });
  });

  // ─── forEach ───

  describe('forEach', () => {
    it('iterates all entries', () => {
      const map = new HashMap5<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      const collected: [string, number][] = [];
      map.forEach((v, k) => collected.push([k, v]));
      expect(collected.sort((a, b) => a[0].localeCompare(b[0]))).toEqual([['a', 1], ['b', 2]]);
    });
  });

  // ─── filter ───

  describe('filter', () => {
    it('filters entries by predicate', () => {
      const map = new HashMap5<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      const filtered = map.filter((v) => v > 1);
      expect(filtered.size).toBe(2);
      expect(filtered.get('a')).toBeUndefined();
      expect(filtered.get('b')).toBe(2);
      expect(filtered.get('c')).toBe(3);
    });

    it('returns empty when nothing matches', () => {
      const map = new HashMap5<string, number>();
      map.set('a', 1);
      const filtered = map.filter(() => false);
      expect(filtered.size).toBe(0);
    });
  });

  // ─── map ───

  describe('map', () => {
    it('maps values to new type', () => {
      const map = new HashMap5<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      const mapped = map.map((v) => v * 10);
      expect(mapped.get('a')).toBe(10);
      expect(mapped.get('b')).toBe(20);
      expect(mapped.size).toBe(2);
    });
  });

  // ─── reduce ───

  describe('reduce', () => {
    it('reduces to a sum', () => {
      const map = new HashMap5<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      const sum = map.reduce((acc, v) => acc + v, 0);
      expect(sum).toBe(6);
    });

    it('returns initial value for empty', () => {
      const map = new HashMap5<string, number>();
      expect(map.reduce((acc, v) => acc + v, 42)).toBe(42);
    });
  });

  // ─── merge ───

  describe('merge', () => {
    it('merges another map into this one', () => {
      const map1 = new HashMap5<string, number>();
      map1.set('a', 1);
      const map2 = new HashMap5<string, number>();
      map2.set('b', 2);
      map2.set('c', 3);
      map1.merge(map2);
      expect(map1.size).toBe(3);
      expect(map1.get('a')).toBe(1);
      expect(map1.get('b')).toBe(2);
      expect(map1.get('c')).toBe(3);
    });

    it('overwrites on key conflict', () => {
      const map1 = new HashMap5<string, number>();
      map1.set('a', 1);
      const map2 = new HashMap5<string, number>();
      map2.set('a', 99);
      map1.merge(map2);
      expect(map1.get('a')).toBe(99);
    });
  });

  // ─── bulkSet ───

  describe('bulkSet', () => {
    it('sets multiple entries at once', () => {
      const map = new HashMap5<string, number>();
      map.bulkSet([['a', 1], ['b', 2], ['c', 3]]);
      expect(map.size).toBe(3);
      expect(map.get('a')).toBe(1);
      expect(map.get('b')).toBe(2);
      expect(map.get('c')).toBe(3);
    });

    it('handles empty array', () => {
      const map = new HashMap5<string, number>();
      map.bulkSet([]);
      expect(map.size).toBe(0);
    });
  });

  // ─── getTimeComplexity ───

  describe('getTimeComplexity', () => {
    it('returns complexity string', () => {
      const map = new HashMap5<string, number>();
      expect(map.getTimeComplexity()).toBe('O(1) average case, O(n) worst case');
    });
  });

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('handles delete then set same key', () => {
      const map = new HashMap5<string, number>();
      map.set('a', 1);
      map.delete('a');
      map.set('a', 2);
      expect(map.get('a')).toBe(2);
      expect(map.size).toBe(1);
    });

    it('handles many entries', () => {
      const map = new HashMap5<string, number>();
      for (let i = 0; i < 200; i++) {
        map.set(`key_${i}`, i);
      }
      expect(map.size).toBe(200);
      for (let i = 0; i < 200; i++) {
        expect(map.get(`key_${i}`)).toBe(i);
      }
    });

    it('handles empty string key', () => {
      const map = new HashMap5<string, number>();
      map.set('', 0);
      expect(map.get('')).toBe(0);
    });
  });
});
