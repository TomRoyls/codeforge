import { describe, it, expect } from 'vitest';
import { JellyHash2 } from '../src/core/jelly-hash-2/index.js';

describe('JellyHash2', () => {
  describe('set/get/has/delete', () => {
    it('should set and get values', () => {
      const map = new JellyHash2<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);

      expect(map.get('a')).toBe(1);
      expect(map.get('b')).toBe(2);
      expect(map.get('c')).toBe(3);
    });

    it('should return undefined for missing keys', () => {
      const map = new JellyHash2<string, number>();
      map.set('a', 1);

      expect(map.get('b')).toBeUndefined();
    });

    it('should update existing keys', () => {
      const map = new JellyHash2<string, number>();
      map.set('a', 1);
      map.set('a', 2);

      expect(map.get('a')).toBe(2);
      expect(map.size).toBe(1);
    });

    it('should check if key exists', () => {
      const map = new JellyHash2<string, number>();
      map.set('a', 1);

      expect(map.has('a')).toBe(true);
      expect(map.has('b')).toBe(false);
    });

    it('should delete keys', () => {
      const map = new JellyHash2<string, number>();
      map.set('a', 1);
      map.set('b', 2);

      expect(map.delete('a')).toBe(true);
      expect(map.has('a')).toBe(false);
      expect(map.size).toBe(1);
    });

    it('should return false when deleting non-existent key', () => {
      const map = new JellyHash2<string, number>();
      map.set('a', 1);

      expect(map.delete('b')).toBe(false);
      expect(map.size).toBe(1);
    });
  });

  describe('size', () => {
    it('should track size correctly', () => {
      const map = new JellyHash2<string, number>();
      expect(map.size).toBe(0);

      map.set('a', 1);
      expect(map.size).toBe(1);

      map.set('b', 2);
      expect(map.size).toBe(2);

      map.delete('a');
      expect(map.size).toBe(1);
    });
  });

  describe('capacity', () => {
    it('should have initial capacity', () => {
      const map = new JellyHash2<string, number>();
      expect(map.capacity).toBe(16);
    });

    it('should use custom initial capacity', () => {
      const map = new JellyHash2<string, number>({ initialCapacity: 32 });
      expect(map.capacity).toBe(32);
    });
  });

  describe('auto-resize', () => {
    it('should resize when load factor exceeded', () => {
      const map = new JellyHash2<number, number>({ initialCapacity: 4, loadFactor: 0.75 });

      for (let i = 0; i < 3; i++) {
        map.set(i, i);
      }

      expect(map.capacity).toBe(4);
      expect(map.size).toBe(3);

      map.set(3, 3);
      expect(map.capacity).toBe(8);
      expect(map.size).toBe(4);
    });

    it('should preserve values after resize', () => {
      const map = new JellyHash2<number, number>({ initialCapacity: 2, loadFactor: 0.75 });

      for (let i = 0; i < 4; i++) {
        map.set(i, i * 10);
      }

      expect(map.capacity).toBe(8);

      for (let i = 0; i < 4; i++) {
        expect(map.get(i)).toBe(i * 10);
      }
    });
  });

  describe('load factor', () => {
    it('should calculate load factor', () => {
      const map = new JellyHash2<string, number>({ initialCapacity: 10 });
      map.set('a', 1);
      map.set('b', 2);

      expect(map.loadFactor()).toBe(0.2);
    });

    it('should use custom load factor', () => {
      const map = new JellyHash2<number, number>({ initialCapacity: 4, loadFactor: 0.5 });

      map.set(0, 0);
      map.set(1, 1);

      expect(map.loadFactor()).toBe(0.5);
      expect(map.capacity).toBe(4);

      map.set(2, 2);
      expect(map.capacity).toBe(8);
    });
  });

  describe('collision handling', () => {
    it('should handle collisions with separate chaining', () => {
      const map = new JellyHash2<string, number>({ initialCapacity: 2 });

      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      map.set('d', 4);

      expect(map.size).toBe(4);
      expect(map.get('a')).toBe(1);
      expect(map.get('b')).toBe(2);
      expect(map.get('c')).toBe(3);
      expect(map.get('d')).toBe(4);
    });
  });

  describe('keys', () => {
    it('should return all keys', () => {
      const map = new JellyHash2<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);

      const keys = map.keys();
      expect(keys).toHaveLength(3);
      expect(keys).toContain('a');
      expect(keys).toContain('b');
      expect(keys).toContain('c');
    });

    it('should return empty array for empty map', () => {
      const map = new JellyHash2<string, number>();
      expect(map.keys()).toEqual([]);
    });
  });

  describe('values', () => {
    it('should return all values', () => {
      const map = new JellyHash2<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);

      const values = map.values();
      expect(values).toHaveLength(3);
      expect(values).toContain(1);
      expect(values).toContain(2);
      expect(values).toContain(3);
    });

    it('should return empty array for empty map', () => {
      const map = new JellyHash2<string, number>();
      expect(map.values()).toEqual([]);
    });
  });

  describe('entries', () => {
    it('should return all entries', () => {
      const map = new JellyHash2<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);

      const entries = map.entries();
      expect(entries).toHaveLength(3);

      const entryMap = new Map(entries);
      expect(entryMap.get('a')).toBe(1);
      expect(entryMap.get('b')).toBe(2);
      expect(entryMap.get('c')).toBe(3);
    });

    it('should return empty array for empty map', () => {
      const map = new JellyHash2<string, number>();
      expect(map.entries()).toEqual([]);
    });
  });

  describe('clear', () => {
    it('should clear all entries', () => {
      const map = new JellyHash2<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);

      map.clear();

      expect(map.size).toBe(0);
      expect(map.keys()).toEqual([]);
      expect(map.values()).toEqual([]);
    });

    it('should maintain capacity after clear', () => {
      const map = new JellyHash2<string, number>({ initialCapacity: 32 });
      map.set('a', 1);

      map.clear();

      expect(map.capacity).toBe(32);
    });
  });

  describe('custom hash function', () => {
    it('should use custom hash function', () => {
      const customHashFn = (key: string): number => {
        return key.length;
      };

      const map = new JellyHash2<string, number>({ initialCapacity: 4, hashFn: customHashFn });
      map.set('ab', 1);
      map.set('cd', 2);

      expect(map.get('ab')).toBe(1);
      expect(map.get('cd')).toBe(2);
    });
  });

  describe('edge cases', () => {
    it('should handle null and undefined keys', () => {
      const map = new JellyHash2<null | undefined, number>();
      map.set(null, 1);
      map.set(undefined, 2);

      expect(map.get(null)).toBe(1);
      expect(map.get(undefined)).toBe(2);
      expect(map.size).toBe(2);
    });

    it('should handle number keys', () => {
      const map = new JellyHash2<number, string>();
      map.set(1, 'one');
      map.set(2, 'two');
      map.set(3, 'three');

      expect(map.get(1)).toBe('one');
      expect(map.get(2)).toBe('two');
      expect(map.get(3)).toBe('three');
    });

    it('should handle object keys', () => {
      const map = new JellyHash2<object, number>();
      const key1 = { id: 1 };
      const key2 = { id: 2 };

      map.set(key1, 100);
      map.set(key2, 200);

      expect(map.get(key1)).toBe(100);
      expect(map.get(key2)).toBe(200);
    });

    it('should handle overwrite existing key', () => {
      const map = new JellyHash2<string, number>();
      map.set('key', 1);
      map.set('key', 2);
      expect(map.get('key')).toBe(2);
      expect(map.size).toBe(1);
    });

    it('should handle delete and get', () => {
      const map = new JellyHash2<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      expect(map.delete('a')).toBe(true);
      expect(map.get('a')).toBeUndefined();
      expect(map.size).toBe(1);
    });

    it('should handle has check', () => {
      const map = new JellyHash2<string, number>();
      map.set('x', 10);
      expect(map.has('x')).toBe(true);
      expect(map.has('y')).toBe(false);
    });

    it('should handle clear then re-add', () => {
      const map = new JellyHash2<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.clear();
      expect(map.size).toBe(0);
      map.set('c', 3);
      expect(map.get('c')).toBe(3);
      expect(map.size).toBe(1);
    });

    it('should handle delete then has', () => {
      const map = new JellyHash2<string, number>();
      map.set('x', 10);
      map.delete('x');
      expect(map.has('x')).toBe(false);
      expect(map.size).toBe(0);
    });
  });
});
