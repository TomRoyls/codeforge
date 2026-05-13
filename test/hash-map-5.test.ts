import { describe, it, expect } from 'vitest';
import { HashMap5 } from '../src/core/hash-map-5/index.js';

describe('HashMap5', () => {
  describe('empty map', () => {
    it('should start empty', () => {
      const map = new HashMap5<string, number>();
      expect(map.isEmpty).toBe(true);
      expect(map.size).toBe(0);
    });

    it('should return undefined for missing keys', () => {
      const map = new HashMap5<string, number>();
      expect(map.get('missing')).toBe(undefined);
    });

    it('should has return false for missing keys', () => {
      const map = new HashMap5<string, number>();
      expect(map.has('missing')).toBe(false);
    });

    it('should delete return false for missing keys', () => {
      const map = new HashMap5<string, number>();
      expect(map.delete('missing')).toBe(false);
    });

    it('should return empty arrays for keys, values, entries', () => {
      const map = new HashMap5<string, number>();
      expect(map.keys()).toEqual([]);
      expect(map.values()).toEqual([]);
      expect(map.entries()).toEqual([]);
    });
  });

  describe('set and get', () => {
    it('should set and get values', () => {
      const map = new HashMap5<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      expect(map.get('a')).toBe(1);
      expect(map.get('b')).toBe(2);
    });

    it('should update existing keys', () => {
      const map = new HashMap5<string, number>();
      map.set('a', 1);
      map.set('a', 2);
      expect(map.get('a')).toBe(2);
      expect(map.size).toBe(1);
    });

    it('should handle multiple types', () => {
      const map = new HashMap5<any, any>();
      map.set('string', 'value');
      map.set(1, 'number key');
      map.set(true, 'boolean key');
      expect(map.get('string')).toBe('value');
      expect(map.get(1)).toBe('number key');
      expect(map.get(true)).toBe('boolean key');
    });
  });

  describe('has', () => {
    it('should return true for existing keys', () => {
      const map = new HashMap5<string, number>();
      map.set('a', 1);
      expect(map.has('a')).toBe(true);
    });

    it('should return false for missing keys', () => {
      const map = new HashMap5<string, number>();
      map.set('a', 1);
      expect(map.has('b')).toBe(false);
    });
  });

  describe('delete', () => {
    it('should remove existing keys', () => {
      const map = new HashMap5<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      expect(map.delete('a')).toBe(true);
      expect(map.has('a')).toBe(false);
      expect(map.size).toBe(1);
    });

    it('should return false for missing keys', () => {
      const map = new HashMap5<string, number>();
      expect(map.delete('missing')).toBe(false);
    });

    it('should not affect other keys', () => {
      const map = new HashMap5<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.delete('a');
      expect(map.get('b')).toBe(2);
    });
  });

  describe('size', () => {
    it('should track size correctly', () => {
      const map = new HashMap5<string, number>();
      expect(map.size).toBe(0);
      map.set('a', 1);
      expect(map.size).toBe(1);
      map.set('b', 2);
      expect(map.size).toBe(2);
      map.delete('a');
      expect(map.size).toBe(1);
      map.clear();
      expect(map.size).toBe(0);
    });
  });

  describe('isEmpty', () => {
    it('should return true when empty', () => {
      const map = new HashMap5<string, number>();
      expect(map.isEmpty).toBe(true);
    });

    it('should return false when not empty', () => {
      const map = new HashMap5<string, number>();
      map.set('a', 1);
      expect(map.isEmpty).toBe(false);
    });

    it('should return true after clear', () => {
      const map = new HashMap5<string, number>();
      map.set('a', 1);
      map.clear();
      expect(map.isEmpty).toBe(true);
    });
  });

  describe('keys', () => {
    it('should return all keys', () => {
      const map = new HashMap5<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      const keys = map.keys();
      expect(keys.length).toBe(3);
      expect(keys).toContain('a');
      expect(keys).toContain('b');
      expect(keys).toContain('c');
    });

    it('should return empty array when empty', () => {
      const map = new HashMap5<string, number>();
      expect(map.keys()).toEqual([]);
    });
  });

  describe('values', () => {
    it('should return all values', () => {
      const map = new HashMap5<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      const values = map.values();
      expect(values.length).toBe(3);
      expect(values).toContain(1);
      expect(values).toContain(2);
      expect(values).toContain(3);
    });

    it('should return empty array when empty', () => {
      const map = new HashMap5<string, number>();
      expect(map.values()).toEqual([]);
    });
  });

  describe('entries', () => {
    it('should return all entries', () => {
      const map = new HashMap5<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      const entries = map.entries();
      expect(entries.length).toBe(2);
      const entryA = entries.find((e) => e[0] === 'a');
      const entryB = entries.find((e) => e[0] === 'b');
      expect(entryA![1]).toBe(1);
      expect(entryB![1]).toBe(2);
    });

    it('should return empty array when empty', () => {
      const map = new HashMap5<string, number>();
      expect(map.entries()).toEqual([]);
    });
  });

  describe('forEach', () => {
    it('should iterate over all entries', () => {
      const map = new HashMap5<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);

      const visited: [number, string][] = [];
      map.forEach((value, key) => {
        visited.push([value, key]);
      });

      expect(visited.length).toBe(3);
      expect(visited.some((v) => v[0] === 1 && v[1] === 'a')).toBe(true);
      expect(visited.some((v) => v[0] === 2 && v[1] === 'b')).toBe(true);
      expect(visited.some((v) => v[0] === 3 && v[1] === 'c')).toBe(true);
    });

    it('should not iterate when empty', () => {
      const map = new HashMap5<string, number>();
      let called = false;
      map.forEach(() => {
        called = true;
      });
      expect(called).toBe(false);
    });
  });

  describe('filter', () => {
    it('should filter entries by predicate', () => {
      const map = new HashMap5<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      map.set('d', 4);

      const filtered = map.filter((value) => value % 2 === 0);
      expect(filtered.size).toBe(2);
      expect(filtered.get('a')).toBe(undefined);
      expect(filtered.get('b')).toBe(2);
      expect(filtered.get('c')).toBe(undefined);
      expect(filtered.get('d')).toBe(4);
    });

    it('should return empty map when no entries match', () => {
      const map = new HashMap5<string, number>();
      map.set('a', 1);
      map.set('b', 2);

      const filtered = map.filter((value) => value > 10);
      expect(filtered.isEmpty).toBe(true);
    });
  });

  describe('map', () => {
    it('should map values using mapper function', () => {
      const map = new HashMap5<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);

      const mapped = map.map((value) => value * 2);
      expect(mapped.size).toBe(3);
      expect(mapped.get('a')).toBe(2);
      expect(mapped.get('b')).toBe(4);
      expect(mapped.get('c')).toBe(6);
    });

    it('should map to different types', () => {
      const map = new HashMap5<string, number>();
      map.set('a', 1);
      map.set('b', 2);

      const mapped = map.map((value, key) => `${key}:${value}`);
      expect(mapped.size).toBe(2);
      expect(mapped.get('a')).toBe('a:1');
      expect(mapped.get('b')).toBe('b:2');
    });
  });

  describe('reduce', () => {
    it('should reduce entries to single value', () => {
      const map = new HashMap5<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);

      const sum = map.reduce((acc, value) => acc + value, 0);
      expect(sum).toBe(6);
    });

    it('should reduce with object accumulator', () => {
      const map = new HashMap5<string, number>();
      map.set('a', 1);
      map.set('b', 2);

      const result = map.reduce<{ sum: number; count: number }>(
        (acc, value) => ({ sum: acc.sum + value, count: acc.count + 1 }),
        { sum: 0, count: 0 }
      );
      expect(result.sum).toBe(3);
      expect(result.count).toBe(2);
    });

    it('should return initial value for empty map', () => {
      const map = new HashMap5<string, number>();
      const result = map.reduce((acc) => acc, 'initial');
      expect(result).toBe('initial');
    });
  });

  describe('merge', () => {
    it('should merge another map', () => {
      const map1 = new HashMap5<string, number>();
      map1.set('a', 1);
      map1.set('b', 2);

      const map2 = new HashMap5<string, number>();
      map2.set('c', 3);
      map2.set('d', 4);

      map1.merge(map2);
      expect(map1.size).toBe(4);
      expect(map1.get('a')).toBe(1);
      expect(map1.get('b')).toBe(2);
      expect(map1.get('c')).toBe(3);
      expect(map1.get('d')).toBe(4);
    });

    it('should override existing keys', () => {
      const map1 = new HashMap5<string, number>();
      map1.set('a', 1);
      map1.set('b', 2);

      const map2 = new HashMap5<string, number>();
      map2.set('b', 20);
      map2.set('c', 3);

      map1.merge(map2);
      expect(map1.size).toBe(3);
      expect(map1.get('a')).toBe(1);
      expect(map1.get('b')).toBe(20);
      expect(map1.get('c')).toBe(3);
    });

    it('should not affect source map', () => {
      const map1 = new HashMap5<string, number>();
      map1.set('a', 1);

      const map2 = new HashMap5<string, number>();
      map2.set('b', 2);
      map2.set('c', 3);

      map1.merge(map2);
      expect(map2.size).toBe(2);
      expect(map2.get('b')).toBe(2);
    });
  });

  describe('bulkSet', () => {
    it('should set multiple entries at once', () => {
      const map = new HashMap5<string, number>();
      map.bulkSet([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ]);

      expect(map.size).toBe(3);
      expect(map.get('a')).toBe(1);
      expect(map.get('b')).toBe(2);
      expect(map.get('c')).toBe(3);
    });

    it('should handle empty array', () => {
      const map = new HashMap5<string, number>();
      map.bulkSet([]);
      expect(map.isEmpty).toBe(true);
    });

    it('should update existing keys', () => {
      const map = new HashMap5<string, number>();
      map.set('a', 1);
      map.bulkSet([
        ['a', 10],
        ['b', 2],
      ]);

      expect(map.size).toBe(2);
      expect(map.get('a')).toBe(10);
      expect(map.get('b')).toBe(2);
    });
  });

  describe('clear', () => {
    it('should remove all entries', () => {
      const map = new HashMap5<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      map.clear();
      expect(map.isEmpty).toBe(true);
      expect(map.size).toBe(0);
      expect(map.get('a')).toBe(undefined);
      expect(map.get('b')).toBe(undefined);
      expect(map.get('c')).toBe(undefined);
    });

    it('should be idempotent', () => {
      const map = new HashMap5<string, number>();
      map.set('a', 1);
      map.clear();
      map.clear();
      expect(map.isEmpty).toBe(true);
    });
  });

  describe('getTimeComplexity', () => {
    it('should return time complexity string', () => {
      const map = new HashMap5<string, number>();
      expect(map.getTimeComplexity()).toBe('O(1) average case, O(n) worst case');
    });
  });

  describe('collision handling', () => {
    it('should handle hash collisions', () => {
      const map = new HashMap5<string, number>(4, 1.0);
      map.set('a', 1);
      map.set('e', 2);
      map.set('i', 3);
      map.set('m', 4);
      expect(map.get('a')).toBe(1);
      expect(map.get('e')).toBe(2);
      expect(map.get('i')).toBe(3);
      expect(map.get('m')).toBe(4);
    });

    it('should delete correctly with collisions', () => {
      const map = new HashMap5<string, number>(4, 1.0);
      map.set('a', 1);
      map.set('e', 2);
      map.set('i', 3);
      map.delete('e');
      expect(map.get('a')).toBe(1);
      expect(map.get('e')).toBe(undefined);
      expect(map.get('i')).toBe(3);
      expect(map.size).toBe(2);
    });
  });

  describe('automatic resizing', () => {
    it('should resize when load factor is exceeded', () => {
      const map = new HashMap5<string, number>(4, 0.5);
      expect(map.size).toBe(0);
      map.set('a', 1);
      map.set('b', 2);
      expect(map.size).toBe(2);
      map.set('c', 3);
      expect(map.size).toBe(3);
    });

    it('should preserve entries after automatic resize', () => {
      const map = new HashMap5<string, number>(4, 0.5);
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      expect(map.get('a')).toBe(1);
      expect(map.get('b')).toBe(2);
      expect(map.get('c')).toBe(3);
      expect(map.size).toBe(3);
    });
  });

  describe('custom capacity and load factor', () => {
    it('should use custom initial capacity', () => {
      const map = new HashMap5<string, number>(100, 0.75);
      expect(map.size).toBe(0);
    });

    it('should use custom load factor', () => {
      const map = new HashMap5<string, number>(16, 0.9);
      expect(map.isEmpty).toBe(true);
    });

    it('should resize based on custom load factor', () => {
      const map = new HashMap5<string, number>(10, 0.2);
      map.set('a', 1);
      map.set('b', 2);
      expect(map.size).toBe(2);
      map.set('c', 3);
      expect(map.size).toBe(3);
    });
  });

  describe('large datasets', () => {
    it('should handle 1000 entries', () => {
      const map = new HashMap5<number, number>();
      for (let i = 0; i < 1000; i++) {
        map.set(i, i * 2);
      }
      expect(map.size).toBe(1000);
      for (let i = 0; i < 1000; i++) {
        expect(map.get(i)).toBe(i * 2);
      }
    });

    it('should handle 10000 entries', () => {
      const map = new HashMap5<number, number>();
      for (let i = 0; i < 10000; i++) {
        map.set(i, i * 2);
      }
      expect(map.size).toBe(10000);
      for (let i = 0; i < 10000; i++) {
        expect(map.get(i)).toBe(i * 2);
      }
    });

    it('should handle large dataset operations efficiently', () => {
      const map = new HashMap5<number, number>();
      for (let i = 0; i < 5000; i++) {
        map.set(i, i);
      }

      for (let i = 0; i < 5000; i += 2) {
        map.delete(i);
      }

      expect(map.size).toBe(2500);
      for (let i = 1; i < 5000; i += 2) {
        expect(map.get(i)).toBe(i);
      }
      for (let i = 0; i < 5000; i += 2) {
        expect(map.get(i)).toBe(undefined);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle setting same key multiple times', () => {
      const map = new HashMap5<string, number>();
      map.set('a', 1);
      map.set('a', 2);
      map.set('a', 3);
      expect(map.get('a')).toBe(3);
      expect(map.size).toBe(1);
    });

    it('should handle undefined values', () => {
      const map = new HashMap5<string, number | undefined>();
      map.set('a', undefined);
      expect(map.has('a')).toBe(true);
      expect(map.get('a')).toBe(undefined);
    });

    it('should handle zero values', () => {
      const map = new HashMap5<string, number>();
      map.set('a', 0);
      expect(map.get('a')).toBe(0);
      expect(map.has('a')).toBe(true);
    });

    it('should handle negative numbers', () => {
      const map = new HashMap5<string, number>();
      map.set('a', -1);
      map.set('b', -100);
      expect(map.get('a')).toBe(-1);
      expect(map.get('b')).toBe(-100);
    });

    it('should handle string keys with special characters', () => {
      const map = new HashMap5<string, number>();
      map.set('key with spaces', 1);
      map.set('key-with-dashes', 2);
      map.set('key_with_underscores', 3);
      map.set('key.with.dots', 4);
      expect(map.get('key with spaces')).toBe(1);
      expect(map.get('key-with-dashes')).toBe(2);
      expect(map.get('key_with_underscores')).toBe(3);
      expect(map.get('key.with.dots')).toBe(4);
    });
  });

  describe('deletion and reinsertion', () => {
    it('should handle deletion and reinsertion at same slot', () => {
      const map = new HashMap5<string, number>(4, 1.0);
      map.set('a', 1);
      map.set('e', 2);
      map.set('i', 3);
      map.delete('e');
      expect(map.get('e')).toBe(undefined);
      map.set('e', 20);
      expect(map.get('e')).toBe(20);
      expect(map.size).toBe(3);
    });
  });

  describe('chaining operations', () => {
    it('should support chaining of filter and map', () => {
      const map = new HashMap5<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      map.set('d', 4);

      const result = map.filter((v) => v % 2 === 0).map((v) => v * 10);
      expect(result.get('a')).toBe(undefined);
      expect(result.get('b')).toBe(20);
      expect(result.get('c')).toBe(undefined);
      expect(result.get('d')).toBe(40);
    });

    it('should support chaining of map and filter', () => {
      const map = new HashMap5<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);

      const result = map.map((v) => v * 2).filter((v) => v > 3);
      expect(result.get('a')).toBe(undefined);
      expect(result.get('b')).toBe(4);
      expect(result.get('c')).toBe(6);
    });
  });
});
