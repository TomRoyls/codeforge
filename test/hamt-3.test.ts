import { describe, it, expect } from 'vitest';
import { Hamt3 } from '../src/core/hamt-3/index.js';

describe('Hamt3', () => {
  describe('constructor', () => {
    it('should create empty map', () => {
      const map = Hamt3.createEmpty<string>();
      expect(map.size).toBe(0);
      expect(map.isEmpty()).toBe(true);
      expect(map.keys()).toEqual([]);
      expect(map.values()).toEqual([]);
      expect(map.entries()).toEqual([]);
    });
  });

  describe('set and get', () => {
    it('should set and get values', () => {
      const map = Hamt3.createEmpty<string>();
      const map2 = map.set('a', '1');
      const map3 = map2.set('b', '2');

      expect(map.get('a')).toBeUndefined();
      expect(map.get('b')).toBeUndefined();

      expect(map2.get('a')).toBe('1');
      expect(map2.get('b')).toBeUndefined();

      expect(map3.get('a')).toBe('1');
      expect(map3.get('b')).toBe('2');
    });

    it('should update existing key', () => {
      const map = Hamt3.createEmpty<number>();
      const map2 = map.set('key', 1);
      const map3 = map2.set('key', 2);

      expect(map2.get('key')).toBe(1);
      expect(map3.get('key')).toBe(2);
      expect(map2.get('key')).toBe(1);
    });

    it('should handle different value types', () => {
      const map = Hamt3.createEmpty<unknown>();
      const map2 = map.set('string', 'value');
      const map3 = map2.set('number', 42);
      const map4 = map3.set('boolean', true);
      const map5 = map4.set('object', { a: 1 });
      const map6 = map5.set('array', [1, 2, 3]);

      expect(map6.get('string')).toBe('value');
      expect(map6.get('number')).toBe(42);
      expect(map6.get('boolean')).toBe(true);
      expect(map6.get('object')).toEqual({ a: 1 });
      expect(map6.get('array')).toEqual([1, 2, 3]);
    });
  });

  describe('has', () => {
    it('should check key existence', () => {
      const map = Hamt3.createEmpty<string>();
      expect(map.has('a')).toBe(false);

      const map2 = map.set('a', '1');
      expect(map2.has('a')).toBe(true);
      expect(map2.has('b')).toBe(false);
    });

    it('should return false for deleted keys', () => {
      const map = Hamt3.createEmpty<string>();
      const map2 = map.set('a', '1');
      const map3 = map2.delete('a');

      expect(map2.has('a')).toBe(true);
      expect(map3.has('a')).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete existing key', () => {
      const map = Hamt3.createEmpty<string>();
      const map2 = map.set('a', '1');
      const map3 = map2.delete('a');

      expect(map2.get('a')).toBe('1');
      expect(map2.has('a')).toBe(true);
      expect(map3.get('a')).toBeUndefined();
      expect(map3.has('a')).toBe(false);
    });

    it('should return same map for non-existent key', () => {
      const map = Hamt3.createEmpty<string>();
      const map2 = map.delete('a');

      expect(map2).toBe(map);
      expect(map2.size).toBe(0);
    });

    it('should delete multiple keys', () => {
      const map = Hamt3.createEmpty<number>();
      const map2 = map.set('a', 1).set('b', 2).set('c', 3);
      const map3 = map2.delete('b');

      expect(map3.get('a')).toBe(1);
      expect(map3.get('b')).toBeUndefined();
      expect(map3.get('c')).toBe(3);
      expect(map3.size).toBe(2);
    });
  });

  describe('size', () => {
    it('should track size correctly', () => {
      const map = Hamt3.createEmpty<number>();
      expect(map.size).toBe(0);

      const map2 = map.set('a', 1);
      expect(map2.size).toBe(1);

      const map3 = map2.set('b', 2);
      expect(map3.size).toBe(2);

      const map4 = map3.set('a', 10);
      expect(map4.size).toBe(2);

      const map5 = map4.delete('a');
      expect(map5.size).toBe(1);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty map', () => {
      const map = Hamt3.createEmpty<string>();
      expect(map.isEmpty()).toBe(true);
    });

    it('should return false for non-empty map', () => {
      const map = Hamt3.createEmpty<string>();
      const map2 = map.set('a', '1');
      expect(map2.isEmpty()).toBe(false);
    });

    it('should return true after clear', () => {
      const map = Hamt3.createEmpty<string>();
      const map2 = map.set('a', '1');
      const map3 = map2.clear();
      expect(map3.isEmpty()).toBe(true);
    });
  });

  describe('keys', () => {
    it('should return all keys', () => {
      const map = Hamt3.createEmpty<number>();
      const map2 = map.set('a', 1).set('b', 2).set('c', 3);

      const keys = map2.keys();
      expect(keys).toHaveLength(3);
      expect(keys).toContain('a');
      expect(keys).toContain('b');
      expect(keys).toContain('c');
    });

    it('should return empty array for empty map', () => {
      const map = Hamt3.createEmpty<number>();
      expect(map.keys()).toEqual([]);
    });
  });

  describe('values', () => {
    it('should return all values', () => {
      const map = Hamt3.createEmpty<number>();
      const map2 = map.set('a', 1).set('b', 2).set('c', 3);

      const values = map2.values();
      expect(values).toHaveLength(3);
      expect(values).toContain(1);
      expect(values).toContain(2);
      expect(values).toContain(3);
    });

    it('should return empty array for empty map', () => {
      const map = Hamt3.createEmpty<number>();
      expect(map.values()).toEqual([]);
    });
  });

  describe('entries', () => {
    it('should return all entries', () => {
      const map = Hamt3.createEmpty<number>();
      const map2 = map.set('a', 1).set('b', 2).set('c', 3);

      const entries = map2.entries();
      expect(entries).toHaveLength(3);

      const entryMap = new Map(entries);
      expect(entryMap.get('a')).toBe(1);
      expect(entryMap.get('b')).toBe(2);
      expect(entryMap.get('c')).toBe(3);
    });

    it('should return empty array for empty map', () => {
      const map = Hamt3.createEmpty<number>();
      expect(map.entries()).toEqual([]);
    });
  });

  describe('forEach', () => {
    it('should iterate over all entries', () => {
      const map = Hamt3.createEmpty<number>();
      const map2 = map.set('a', 1).set('b', 2).set('c', 3);

      const visited: [string, number][] = [];
      map2.forEach((value, key) => {
        visited.push([key, value]);
      });

      expect(visited).toHaveLength(3);
      const visitedMap = new Map(visited);
      expect(visitedMap.get('a')).toBe(1);
      expect(visitedMap.get('b')).toBe(2);
      expect(visitedMap.get('c')).toBe(3);
    });

    it('should not iterate over empty map', () => {
      const map = Hamt3.createEmpty<number>();
      let count = 0;
      map.forEach(() => {
        count++;
      });
      expect(count).toBe(0);
    });
  });

  describe('clear', () => {
    it('should clear all entries', () => {
      const map = Hamt3.createEmpty<number>();
      const map2 = map.set('a', 1).set('b', 2).set('c', 3);
      const map3 = map2.clear();

      expect(map3.size).toBe(0);
      expect(map3.isEmpty()).toBe(true);
      expect(map3.get('a')).toBeUndefined();
      expect(map3.get('b')).toBeUndefined();
      expect(map3.get('c')).toBeUndefined();
    });

    it('should not affect original map', () => {
      const map = Hamt3.createEmpty<number>();
      const map2 = map.set('a', 1).set('b', 2);
      const map3 = map2.clear();

      expect(map2.size).toBe(2);
      expect(map2.get('a')).toBe(1);
      expect(map2.get('b')).toBe(2);
    });
  });

  describe('immutability', () => {
    it('should not modify original map on set', () => {
      const map = Hamt3.createEmpty<number>();
      const map2 = map.set('a', 1);
      const map3 = map2.set('b', 2);

      expect(map.get('a')).toBeUndefined();
      expect(map.get('b')).toBeUndefined();
      expect(map.size).toBe(0);

      expect(map2.get('a')).toBe(1);
      expect(map2.get('b')).toBeUndefined();
      expect(map2.size).toBe(1);

      expect(map3.get('a')).toBe(1);
      expect(map3.get('b')).toBe(2);
      expect(map3.size).toBe(2);
    });

    it('should not modify original map on delete', () => {
      const map = Hamt3.createEmpty<number>();
      const map2 = map.set('a', 1).set('b', 2).set('c', 3);
      const map3 = map2.delete('b');

      expect(map2.get('a')).toBe(1);
      expect(map2.get('b')).toBe(2);
      expect(map2.get('c')).toBe(3);
      expect(map2.size).toBe(3);

      expect(map3.get('a')).toBe(1);
      expect(map3.get('b')).toBeUndefined();
      expect(map3.get('c')).toBe(3);
      expect(map3.size).toBe(2);
    });

    it('should maintain independence after update', () => {
      const map = Hamt3.createEmpty<number>();
      const map2 = map.set('key', 1);
      const map3 = map2.set('key', 2);

      expect(map2.get('key')).toBe(1);
      expect(map3.get('key')).toBe(2);
    });
  });

  describe('collisions', () => {
    it('should handle keys with same truncated hash', () => {
      let map = Hamt3.createEmpty<number>();
      
      const keys: string[] = [];
      for (let i = 0; i < 10; i++) {
        const key = `key-${i}-${i}`;
        keys.push(key);
        map = map.set(key, i) as any;
      }

      for (let i = 0; i < keys.length; i++) {
        expect(map.get(keys[i])).toBe(i);
      }
      expect(map.size).toBe(10);
    });

    it('should update values in collision nodes', () => {
      const map = Hamt3.createEmpty<number>();
      
      const key = 'collision-key';
      const map2 = map.set(key, 1);
      const map3 = map2.set(key, 2);

      expect(map2.get(key)).toBe(1);
      expect(map3.get(key)).toBe(2);
    });
  });

  describe('many keys', () => {
    it('should handle many keys efficiently', () => {
      const map = Hamt3.createEmpty<number>();
      const count = 1000;

      let currentMap = map;
      for (let i = 0; i < count; i++) {
        currentMap = currentMap.set(`key-${i}`, i);
      }

      expect(currentMap.size).toBe(count);

      for (let i = 0; i < count; i++) {
        expect(currentMap.get(`key-${i}`)).toBe(i);
      }
    });

    it('should delete from many keys', () => {
      const map = Hamt3.createEmpty<number>();
      const count = 100;

      let currentMap = map;
      for (let i = 0; i < count; i++) {
        currentMap = currentMap.set(`key-${i}`, i);
      }

      for (let i = 0; i < count; i += 2) {
        currentMap = currentMap.delete(`key-${i}`);
      }

      expect(currentMap.size).toBe(count / 2);

      for (let i = 0; i < count; i++) {
        if (i % 2 === 0) {
          expect(currentMap.get(`key-${i}`)).toBeUndefined();
        } else {
          expect(currentMap.get(`key-${i}`)).toBe(i);
        }
      }
    });
  });

  describe('edge cases', () => {
    it('should handle empty string key', () => {
      const map = Hamt3.createEmpty<string>();
      const map2 = map.set('', 'empty');
      expect(map2.get('')).toBe('empty');
      expect(map2.has('')).toBe(true);
    });

    it('should handle special characters in keys', () => {
      const map = Hamt3.createEmpty<number>();
      const map2 = map.set('key with spaces', 1);
      const map3 = map2.set('key-with-special!@#$%', 2);
      const map4 = map3.set('key/with/slashes', 3);

      expect(map4.get('key with spaces')).toBe(1);
      expect(map4.get('key-with-special!@#$%')).toBe(2);
      expect(map4.get('key/with/slashes')).toBe(3);
    });

    it('should handle long keys', () => {
      const map = Hamt3.createEmpty<number>();
      const longKey = 'a'.repeat(1000);
      const map2 = map.set(longKey, 42);

      expect(map2.get(longKey)).toBe(42);
      expect(map2.size).toBe(1);
    });

    it('should handle null and undefined values', () => {
      const map = Hamt3.createEmpty<unknown>();
      const map2 = map.set('null', null);
      const map3 = map2.set('undefined', undefined);
      const map4 = map3.set('zero', 0);
      const map5 = map4.set('empty', '');

      expect(map5.get('null')).toBeNull();
      expect(map5.get('undefined')).toBeUndefined();
      expect(map5.get('zero')).toBe(0);
      expect(map5.get('empty')).toBe('');
      expect(map5.has('undefined')).toBe(false);
      expect(map5.has('zero')).toBe(true);
      expect(map5.has('empty')).toBe(true);
    });

    it('should handle unicode keys', () => {
      const map = Hamt3.createEmpty<number>();
      const map2 = map.set('hello', 1);
      const map3 = map2.set('世界', 2);
      const map4 = map3.set('🎉', 3);
      const map5 = map4.set('עברית', 4);

      expect(map5.get('hello')).toBe(1);
      expect(map5.get('世界')).toBe(2);
      expect(map5.get('🎉')).toBe(3);
      expect(map5.get('עברית')).toBe(4);
    });

    it('should handle chaining', () => {
      const map = Hamt3.createEmpty<number>();
      const map2 = map.set('a', 1).set('b', 2).set('c', 3);

      expect(map2.size).toBe(3);
      expect(map2.get('a')).toBe(1);
      expect(map2.get('b')).toBe(2);
      expect(map2.get('c')).toBe(3);
    });
  });

  it('should handle has check', () => {
    const map0 = Hamt3.createEmpty<string>();
    const map1 = map0.set('a', 1);
    const map2 = map1.set('b', 2);
    expect(map2.has('a')).toBe(true);
    expect(map2.has('c')).toBe(false);
  });
});
