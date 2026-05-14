import { describe, it, expect, beforeEach } from 'vitest';
import { CuckooHash3 } from '../src/core/cuckoo-hash-3/index.js';

describe('CuckooHash3', () => {
  let map: CuckooHash3<string, number>;

  beforeEach(() => {
    map = new CuckooHash3();
  });

  describe('empty', () => {
    it('should have size 0 when empty', () => {
      expect(map.size).toBe(0);
    });

    it('should return undefined for get when empty', () => {
      expect(map.get('key')).toBeUndefined();
    });

    it('should return false for has when empty', () => {
      expect(map.has('key')).toBe(false);
    });

    it('should return false for delete when empty', () => {
      expect(map.delete('key')).toBe(false);
    });

    it('should have load factor 0 when empty', () => {
      expect(map.loadFactor()).toBe(0);
    });
  });

  describe('set/get', () => {
    it('should set and get values', () => {
      map.set('a', 1);
      expect(map.get('a')).toBe(1);
    });

    it('should set and get multiple values', () => {
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      expect(map.get('a')).toBe(1);
      expect(map.get('b')).toBe(2);
      expect(map.get('c')).toBe(3);
    });

    it('should return true on successful set', () => {
      expect(map.set('a', 1)).toBe(true);
    });

    it('should handle numeric keys', () => {
      map.set(1, 'one');
      expect(map.get(1)).toBe('one');
    });

    it('should handle object keys', () => {
      const key1 = { id: 1 };
      const key2 = { id: 2 };
      map.set(key1 as any, 'value1');
      map.set(key2 as any, 'value2');
      expect(map.get(key1 as any)).toBe('value1');
      expect(map.get(key2 as any)).toBe('value2');
    });
  });

  describe('overwrite', () => {
    it('should overwrite existing value', () => {
      map.set('a', 1);
      map.set('a', 2);
      expect(map.get('a')).toBe(2);
    });

    it('should not increase size on overwrite', () => {
      map.set('a', 1);
      map.set('a', 2);
      expect(map.size).toBe(1);
    });

    it('should return true on overwrite', () => {
      map.set('a', 1);
      expect(map.set('a', 2)).toBe(true);
    });
  });

  describe('has', () => {
    it('should return true for existing key', () => {
      map.set('a', 1);
      expect(map.has('a')).toBe(true);
    });

    it('should return false for non-existent key', () => {
      map.set('a', 1);
      expect(map.has('b')).toBe(false);
    });

    it('should check for key existence', () => {
      map.set('a', 1);
      map.set('b', 2);
      expect(map.has('a')).toBe(true);
      expect(map.has('b')).toBe(true);
      expect(map.has('c')).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete existing key', () => {
      map.set('a', 1);
      expect(map.delete('a')).toBe(true);
      expect(map.get('a')).toBeUndefined();
    });

    it('should return false for non-existent key', () => {
      expect(map.delete('a')).toBe(false);
    });

    it('should decrease size on delete', () => {
      map.set('a', 1);
      map.set('b', 2);
      map.delete('a');
      expect(map.size).toBe(1);
    });

    it('should handle deleting from both tables', () => {
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      map.delete('a');
      map.delete('b');
      map.delete('c');
      expect(map.size).toBe(0);
      expect(map.has('a')).toBe(false);
      expect(map.has('b')).toBe(false);
      expect(map.has('c')).toBe(false);
    });
  });

  describe('size', () => {
    it('should track size correctly', () => {
      expect(map.size).toBe(0);
      map.set('a', 1);
      expect(map.size).toBe(1);
      map.set('b', 2);
      expect(map.size).toBe(2);
      map.set('c', 3);
      expect(map.size).toBe(3);
    });

    it('should decrease size on delete', () => {
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      map.delete('b');
      expect(map.size).toBe(2);
      map.delete('a');
      expect(map.size).toBe(1);
    });

    it('should not change size on overwrite', () => {
      map.set('a', 1);
      map.set('a', 2);
      expect(map.size).toBe(1);
    });
  });

  describe('clear', () => {
    it('should clear all entries', () => {
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      map.clear();
      expect(map.size).toBe(0);
      expect(map.get('a')).toBeUndefined();
      expect(map.get('b')).toBeUndefined();
      expect(map.get('c')).toBeUndefined();
    });

    it('should reset size to 0', () => {
      map.set('a', 1);
      map.set('b', 2);
      map.clear();
      expect(map.size).toBe(0);
    });

    it('should reset load factor to 0', () => {
      map.set('a', 1);
      map.set('b', 2);
      map.clear();
      expect(map.loadFactor()).toBe(0);
    });

    it('should be idempotent', () => {
      map.clear();
      map.clear();
      map.clear();
      expect(map.size).toBe(0);
    });
  });

  describe('loadFactor', () => {
    it('should calculate load factor correctly', () => {
      map.set('a', 1);
      map.set('b', 2);
      const expectedLoadFactor = 2 / 32;
      expect(map.loadFactor()).toBe(expectedLoadFactor);
    });

    it('should increase as entries are added', () => {
      const loadFactor1 = map.loadFactor();
      map.set('a', 1);
      const loadFactor2 = map.loadFactor();
      map.set('b', 2);
      const loadFactor3 = map.loadFactor();
      expect(loadFactor1).toBeLessThan(loadFactor2);
      expect(loadFactor2).toBeLessThan(loadFactor3);
    });

    it('should decrease as entries are deleted', () => {
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      const loadFactor1 = map.loadFactor();
      map.delete('a');
      const loadFactor2 = map.loadFactor();
      expect(loadFactor1).toBeGreaterThan(loadFactor2);
    });

    it('should be 0 when empty', () => {
      expect(map.loadFactor()).toBe(0);
    });
  });

  describe('collision handling', () => {
    it('should handle hash collisions', () => {
      map.set('a', 1);
      map.set('b', 2);
      expect(map.get('a')).toBe(1);
      expect(map.get('b')).toBe(2);
    });

    it('should handle multiple collisions', () => {
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      map.set('d', 4);
      map.set('e', 5);
      expect(map.size).toBe(5);
      expect(map.get('a')).toBe(1);
      expect(map.get('b')).toBe(2);
      expect(map.get('c')).toBe(3);
      expect(map.get('d')).toBe(4);
      expect(map.get('e')).toBe(5);
    });

    it('should handle cuckoo eviction', () => {
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      map.set('d', 4);
      expect(map.get('a')).toBe(1);
      expect(map.get('b')).toBe(2);
      expect(map.get('c')).toBe(3);
      expect(map.get('d')).toBe(4);
    });
  });

  describe('many insertions', () => {
    it('should handle many insertions', () => {
      for (let i = 0; i < 100; i++) {
        map.set(`key${i}`, i);
      }
      expect(map.size).toBe(100);
      for (let i = 0; i < 100; i++) {
        expect(map.get(`key${i}`)).toBe(i);
      }
    });

    it('should handle many insertions with numeric keys', () => {
      for (let i = 0; i < 50; i++) {
        map.set(i as any, i * 2);
      }
      expect(map.size).toBe(50);
      for (let i = 0; i < 50; i++) {
        expect(map.get(i as any)).toBe(i * 2);
      }
    });

    it('should maintain correct values after many insertions', () => {
      for (let i = 0; i < 200; i++) {
        map.set(`key${i}`, i * 10);
      }
      for (let i = 0; i < 200; i++) {
        expect(map.get(`key${i}`)).toBe(i * 10);
      }
    });
  });

  describe('auto-resize', () => {
    it('should auto-resize when needed', () => {
      for (let i = 0; i < 50; i++) {
        map.set(`key${i}`, i);
      }
      expect(map.size).toBe(50);
      for (let i = 0; i < 50; i++) {
        expect(map.get(`key${i}`)).toBe(i);
      }
    });

    it('should preserve values after resize', () => {
      for (let i = 0; i < 30; i++) {
        map.set(`key${i}`, i);
      }
      const valuesBeforeResize: number[] = [];
      for (let i = 0; i < 30; i++) {
        valuesBeforeResize.push(map.get(`key${i}`)!);
      }
      map.set(`key${30}`, 30);
      for (let i = 0; i < 31; i++) {
        expect(map.get(`key${i}`)).toBe(valuesBeforeResize[i] ?? 30);
      }
    });

    it('should handle multiple resizes', () => {
      for (let i = 0; i < 200; i++) {
        map.set(`key${i}`, i);
      }
      expect(map.size).toBe(200);
      for (let i = 0; i < 200; i++) {
        expect(map.get(`key${i}`)).toBe(i);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle empty string keys', () => {
      map.set('', 1);
      expect(map.get('')).toBe(1);
      expect(map.has('')).toBe(true);
    });

    it('should handle special characters in keys', () => {
      map.set('key!@#$%', 1);
      map.set('key<>?/', 2);
      expect(map.get('key!@#$%')).toBe(1);
      expect(map.get('key<>?/')).toBe(2);
    });

    it('should handle very long keys', () => {
      const longKey = 'a'.repeat(1000);
      map.set(longKey, 1);
      expect(map.get(longKey)).toBe(1);
    });

    it('should handle zero and negative numeric keys', () => {
      map.set(0 as any, 'zero');
      map.set(-1 as any, 'negative');
      expect(map.get(0 as any)).toBe('zero');
      expect(map.get(-1 as any)).toBe('negative');
    });

    it('should handle custom capacity', () => {
      const customMap = new CuckooHash3<string, number>(32);
      customMap.set('a', 1);
      customMap.set('b', 2);
      expect(customMap.get('a')).toBe(1);
      expect(customMap.get('b')).toBe(2);
    });

    it('should handle delete of recently added item', () => {
      map.set('a', 1);
      map.set('b', 2);
      map.delete('b');
      expect(map.get('b')).toBeUndefined();
      expect(map.get('a')).toBe(1);
    });

    it('should handle overwrite and delete cycle', () => {
      map.set('a', 1);
      map.set('a', 2);
      map.delete('a');
      expect(map.get('a')).toBeUndefined();
      map.set('a', 3);
      expect(map.get('a')).toBe(3);
    });

    it('should handle same value for different keys', () => {
      map.set('a', 1);
      map.set('b', 1);
      map.set('c', 1);
      expect(map.get('a')).toBe(1);
      expect(map.get('b')).toBe(1);
      expect(map.get('c')).toBe(1);
      expect(map.size).toBe(3);
    });
  });

  describe('constructor', () => {
    it('should use default capacity of 16', () => {
      const defaultMap = new CuckooHash3<string, number>();
      defaultMap.set('a', 1);
      defaultMap.set('b', 2);
      expect(defaultMap.get('a')).toBe(1);
      expect(defaultMap.get('b')).toBe(2);
    });

    it('should accept custom initial capacity', () => {
      const customMap = new CuckooHash3<string, number>(64);
      customMap.set('a', 1);
      expect(customMap.get('a')).toBe(1);
    });

    it('should create independent instances', () => {
      const map1 = new CuckooHash3<string, number>();
      const map2 = new CuckooHash3<string, number>();
      map1.set('a', 1);
      map2.set('a', 2);
      expect(map1.get('a')).toBe(1);
      expect(map2.get('a')).toBe(2);
    });
  });
});
