import { describe, it, expect } from 'vitest';
import { HashMap } from '../../src/core/hash-map-4/index.js';

describe('HashMap', () => {
  // ─── Constructor ───

  describe('constructor', () => {
    it('creates empty map with defaults', () => {
      const map = new HashMap<string, number>();
      expect(map.size()).toBe(0);
      expect(map.isEmpty()).toBe(true);
      expect(map.getCapacity()).toBe(16);
      expect(map.getLoadFactor()).toBe(0.75);
    });

    it('accepts custom capacity and load factor', () => {
      const map = new HashMap<string, number>(32, 0.5);
      expect(map.getCapacity()).toBe(32);
      expect(map.getLoadFactor()).toBe(0.5);
    });
  });

  // ─── set / get ───

  describe('set / get', () => {
    it('sets and gets a value', () => {
      const map = new HashMap<string, number>();
      map.set('a', 1);
      expect(map.get('a')).toBe(1);
    });

    it('returns undefined for missing key', () => {
      const map = new HashMap<string, number>();
      expect(map.get('missing')).toBeUndefined();
    });

    it('overwrites existing key', () => {
      const map = new HashMap<string, number>();
      map.set('k', 1);
      map.set('k', 2);
      expect(map.get('k')).toBe(2);
      expect(map.size()).toBe(1);
    });

    it('sets multiple entries', () => {
      const map = new HashMap<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      expect(map.get('a')).toBe(1);
      expect(map.get('b')).toBe(2);
      expect(map.get('c')).toBe(3);
      expect(map.size()).toBe(3);
    });

    it('handles numeric keys via string conversion', () => {
      const map = new HashMap<number, string>();
      map.set(1, 'one');
      map.set(2, 'two');
      expect(map.get(1)).toBe('one');
      expect(map.get(2)).toBe('two');
    });
  });

  // ─── has ───

  describe('has', () => {
    it('returns true for existing key', () => {
      const map = new HashMap<string, number>();
      map.set('x', 10);
      expect(map.has('x')).toBe(true);
    });

    it('returns false for missing key', () => {
      const map = new HashMap<string, number>();
      expect(map.has('x')).toBe(false);
    });
  });

  // ─── delete ───

  describe('delete', () => {
    it('deletes existing key and returns true', () => {
      const map = new HashMap<string, number>();
      map.set('a', 1);
      expect(map.delete('a')).toBe(true);
      expect(map.get('a')).toBeUndefined();
      expect(map.size()).toBe(0);
    });

    it('returns false for missing key', () => {
      const map = new HashMap<string, number>();
      expect(map.delete('missing')).toBe(false);
    });

    it('only deletes the specified key', () => {
      const map = new HashMap<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.delete('a');
      expect(map.get('a')).toBeUndefined();
      expect(map.get('b')).toBe(2);
      expect(map.size()).toBe(1);
    });
  });

  // ─── size / isEmpty ───

  describe('size / isEmpty', () => {
    it('tracks size through operations', () => {
      const map = new HashMap<string, number>();
      expect(map.isEmpty()).toBe(true);
      map.set('a', 1);
      expect(map.size()).toBe(1);
      expect(map.isEmpty()).toBe(false);
      map.set('b', 2);
      expect(map.size()).toBe(2);
      map.delete('a');
      expect(map.size()).toBe(1);
    });
  });

  // ─── clear ───

  describe('clear', () => {
    it('removes all entries', () => {
      const map = new HashMap<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.clear();
      expect(map.size()).toBe(0);
      expect(map.isEmpty()).toBe(true);
      expect(map.get('a')).toBeUndefined();
    });
  });

  // ─── keys / values / entries ───

  describe('keys / values / entries', () => {
    it('returns all keys', () => {
      const map = new HashMap<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      expect(map.keys().sort()).toEqual(['a', 'b']);
    });

    it('returns all values', () => {
      const map = new HashMap<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      expect(map.values().sort()).toEqual([1, 2]);
    });

    it('returns all entries', () => {
      const map = new HashMap<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      const entries = map.entries().sort((a, b) => a[0].localeCompare(b[0]));
      expect(entries).toEqual([['a', 1], ['b', 2]]);
    });

    it('returns empty for cleared map', () => {
      const map = new HashMap<string, number>();
      map.set('a', 1);
      map.clear();
      expect(map.keys()).toEqual([]);
      expect(map.values()).toEqual([]);
      expect(map.entries()).toEqual([]);
    });
  });

  // ─── forEach ───

  describe('forEach', () => {
    it('iterates all entries', () => {
      const map = new HashMap<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      const collected: [string, number][] = [];
      map.forEach((v, k) => collected.push([k, v]));
      expect(collected.sort((a, b) => a[0].localeCompare(b[0]))).toEqual([['a', 1], ['b', 2]]);
    });
  });

  // ─── resize ───

  describe('resize', () => {
    it('resizes and preserves entries', () => {
      const map = new HashMap<string, number>(4);
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      map.resize(32);
      expect(map.size()).toBe(3);
      expect(map.get('a')).toBe(1);
      expect(map.get('b')).toBe(2);
      expect(map.get('c')).toBe(3);
      expect(map.getCapacity()).toBe(32);
    });
  });

  // ─── Time Complexity ───

  describe('getTimeComplexity', () => {
    it('returns complexity string', () => {
      const map = new HashMap<string, number>();
      expect(map.getTimeComplexity()).toBe('O(1) average case, O(n) worst case');
    });
  });

  // ─── Auto Resize ───

  describe('auto resize', () => {
    it('auto-resizes when load factor exceeded', () => {
      const map = new HashMap<string, number>(4, 0.75);
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      expect(map.size()).toBe(3);
      expect(map.get('a')).toBe(1);
      expect(map.get('b')).toBe(2);
      expect(map.get('c')).toBe(3);
    });
  });

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('handles empty string key', () => {
      const map = new HashMap<string, number>();
      map.set('', 0);
      expect(map.get('')).toBe(0);
    });

    it('handles many entries', () => {
      const map = new HashMap<string, number>();
      for (let i = 0; i < 200; i++) {
        map.set(`key_${i}`, i);
      }
      expect(map.size()).toBe(200);
      for (let i = 0; i < 200; i++) {
        expect(map.get(`key_${i}`)).toBe(i);
      }
    });
  });
});
