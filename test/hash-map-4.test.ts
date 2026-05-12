import { describe, it, expect } from 'vitest';
import { HashMap } from '../src/core/hash-map-4';

describe('HashMap', () => {
  describe('empty map', () => {
    it('should start empty', () => {
      const map = new HashMap<string, number>();
      expect(map.isEmpty()).toBe(true);
      expect(map.size()).toBe(0);
    });

    it('should return undefined for missing keys', () => {
      const map = new HashMap<string, number>();
      expect(map.get('missing')).toBe(undefined);
    });

    it('should has return false for missing keys', () => {
      const map = new HashMap<string, number>();
      expect(map.has('missing')).toBe(false);
    });

    it('should delete return false for missing keys', () => {
      const map = new HashMap<string, number>();
      expect(map.delete('missing')).toBe(false);
    });

    it('should return empty arrays for keys, values, entries', () => {
      const map = new HashMap<string, number>();
      expect(map.keys()).toEqual([]);
      expect(map.values()).toEqual([]);
      expect(map.entries()).toEqual([]);
    });
  });

  describe('set and get', () => {
    it('should set and get values', () => {
      const map = new HashMap<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      expect(map.get('a')).toBe(1);
      expect(map.get('b')).toBe(2);
    });

    it('should update existing keys', () => {
      const map = new HashMap<string, number>();
      map.set('a', 1);
      map.set('a', 2);
      expect(map.get('a')).toBe(2);
      expect(map.size()).toBe(1);
    });

    it('should handle multiple types', () => {
      const map = new HashMap<any, any>();
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
      const map = new HashMap<string, number>();
      map.set('a', 1);
      expect(map.has('a')).toBe(true);
    });

    it('should return false for missing keys', () => {
      const map = new HashMap<string, number>();
      map.set('a', 1);
      expect(map.has('b')).toBe(false);
    });
  });

  describe('delete', () => {
    it('should remove existing keys', () => {
      const map = new HashMap<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      expect(map.delete('a')).toBe(true);
      expect(map.has('a')).toBe(false);
      expect(map.size()).toBe(1);
    });

    it('should return false for missing keys', () => {
      const map = new HashMap<string, number>();
      expect(map.delete('missing')).toBe(false);
    });

    it('should not affect other keys', () => {
      const map = new HashMap<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.delete('a');
      expect(map.get('b')).toBe(2);
    });
  });

  describe('size', () => {
    it('should track size correctly', () => {
      const map = new HashMap<string, number>();
      expect(map.size()).toBe(0);
      map.set('a', 1);
      expect(map.size()).toBe(1);
      map.set('b', 2);
      expect(map.size()).toBe(2);
      map.delete('a');
      expect(map.size()).toBe(1);
      map.clear();
      expect(map.size()).toBe(0);
    });
  });

  describe('isEmpty', () => {
    it('should return true when empty', () => {
      const map = new HashMap<string, number>();
      expect(map.isEmpty()).toBe(true);
    });

    it('should return false when not empty', () => {
      const map = new HashMap<string, number>();
      map.set('a', 1);
      expect(map.isEmpty()).toBe(false);
    });

    it('should return true after clear', () => {
      const map = new HashMap<string, number>();
      map.set('a', 1);
      map.clear();
      expect(map.isEmpty()).toBe(true);
    });
  });

  describe('keys', () => {
    it('should return all keys', () => {
      const map = new HashMap<string, number>();
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
      const map = new HashMap<string, number>();
      expect(map.keys()).toEqual([]);
    });
  });

  describe('values', () => {
    it('should return all values', () => {
      const map = new HashMap<string, number>();
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
      const map = new HashMap<string, number>();
      expect(map.values()).toEqual([]);
    });
  });

  describe('entries', () => {
    it('should return all entries', () => {
      const map = new HashMap<string, number>();
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
      const map = new HashMap<string, number>();
      expect(map.entries()).toEqual([]);
    });
  });

  describe('forEach', () => {
    it('should iterate over all entries', () => {
      const map = new HashMap<string, number>();
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
      const map = new HashMap<string, number>();
      let called = false;
      map.forEach(() => {
        called = true;
      });
      expect(called).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all entries', () => {
      const map = new HashMap<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      map.clear();
      expect(map.isEmpty()).toBe(true);
      expect(map.size()).toBe(0);
      expect(map.get('a')).toBe(undefined);
      expect(map.get('b')).toBe(undefined);
      expect(map.get('c')).toBe(undefined);
    });

    it('should be idempotent', () => {
      const map = new HashMap<string, number>();
      map.set('a', 1);
      map.clear();
      map.clear();
      expect(map.isEmpty()).toBe(true);
    });
  });

  describe('resize', () => {
    it('should increase capacity', () => {
      const map = new HashMap<string, number>(4, 0.75);
      expect(map.getCapacity()).toBe(4);
      map.resize(10);
      expect(map.getCapacity()).toBe(10);
    });

    it('should preserve entries after resize', () => {
      const map = new HashMap<string, number>(4, 0.75);
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      map.resize(10);
      expect(map.get('a')).toBe(1);
      expect(map.get('b')).toBe(2);
      expect(map.get('c')).toBe(3);
      expect(map.size()).toBe(3);
    });
  });

  describe('getLoadFactor', () => {
    it('should return the load factor', () => {
      const map = new HashMap<string, number>(16, 0.5);
      expect(map.getLoadFactor()).toBe(0.5);
    });

    it('should return default load factor', () => {
      const map = new HashMap<string, number>();
      expect(map.getLoadFactor()).toBe(0.75);
    });
  });

  describe('getCapacity', () => {
    it('should return the capacity', () => {
      const map = new HashMap<string, number>(32, 0.75);
      expect(map.getCapacity()).toBe(32);
    });

    it('should return default capacity', () => {
      const map = new HashMap<string, number>();
      expect(map.getCapacity()).toBe(16);
    });
  });

  describe('getTimeComplexity', () => {
    it('should return time complexity string', () => {
      const map = new HashMap<string, number>();
      expect(map.getTimeComplexity()).toBe('O(1) average case, O(n) worst case');
    });
  });

  describe('collision handling', () => {
    it('should handle hash collisions', () => {
      const map = new HashMap<string, number>(4, 1.0);
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
      const map = new HashMap<string, number>(4, 1.0);
      map.set('a', 1);
      map.set('e', 2);
      map.set('i', 3);
      map.delete('e');
      expect(map.get('a')).toBe(1);
      expect(map.get('e')).toBe(undefined);
      expect(map.get('i')).toBe(3);
      expect(map.size()).toBe(2);
    });
  });

  describe('automatic resizing', () => {
    it('should resize when load factor is exceeded', () => {
      const map = new HashMap<string, number>(4, 0.5);
      expect(map.getCapacity()).toBe(4);
      map.set('a', 1);
      map.set('b', 2);
      expect(map.getCapacity()).toBe(4);
      map.set('c', 3);
      expect(map.getCapacity()).toBe(8);
    });

    it('should preserve entries after automatic resize', () => {
      const map = new HashMap<string, number>(4, 0.5);
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      expect(map.get('a')).toBe(1);
      expect(map.get('b')).toBe(2);
      expect(map.get('c')).toBe(3);
      expect(map.size()).toBe(3);
    });
  });

  describe('custom capacity and load factor', () => {
    it('should use custom initial capacity', () => {
      const map = new HashMap<string, number>(100, 0.75);
      expect(map.getCapacity()).toBe(100);
    });

    it('should use custom load factor', () => {
      const map = new HashMap<string, number>(16, 0.9);
      expect(map.getLoadFactor()).toBe(0.9);
    });

    it('should resize based on custom load factor', () => {
      const map = new HashMap<string, number>(10, 0.2);
      expect(map.getCapacity()).toBe(10);
      map.set('a', 1);
      expect(map.getCapacity()).toBe(10);
      map.set('b', 2);
      expect(map.getCapacity()).toBe(10);
      map.set('c', 3);
      expect(map.getCapacity()).toBe(20);
    });
  });

  describe('large datasets', () => {
    it('should handle 1000 entries', () => {
      const map = new HashMap<number, number>();
      for (let i = 0; i < 1000; i++) {
        map.set(i, i * 2);
      }
      expect(map.size()).toBe(1000);
      for (let i = 0; i < 1000; i++) {
        expect(map.get(i)).toBe(i * 2);
      }
    });

    it('should handle 10000 entries', () => {
      const map = new HashMap<number, number>();
      for (let i = 0; i < 10000; i++) {
        map.set(i, i * 2);
      }
      expect(map.size()).toBe(10000);
      for (let i = 0; i < 10000; i++) {
        expect(map.get(i)).toBe(i * 2);
      }
    });

    it('should handle large dataset operations efficiently', () => {
      const map = new HashMap<number, number>();
      for (let i = 0; i < 5000; i++) {
        map.set(i, i);
      }

      for (let i = 0; i < 5000; i += 2) {
        map.delete(i);
      }

      expect(map.size()).toBe(2500);
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
      const map = new HashMap<string, number>();
      map.set('a', 1);
      map.set('a', 2);
      map.set('a', 3);
      expect(map.get('a')).toBe(3);
      expect(map.size()).toBe(1);
    });

    it('should handle undefined values', () => {
      const map = new HashMap<string, number | undefined>();
      map.set('a', undefined);
      expect(map.has('a')).toBe(true);
      expect(map.get('a')).toBe(undefined);
    });

    it('should handle zero values', () => {
      const map = new HashMap<string, number>();
      map.set('a', 0);
      expect(map.get('a')).toBe(0);
      expect(map.has('a')).toBe(true);
    });

    it('should handle negative numbers', () => {
      const map = new HashMap<string, number>();
      map.set('a', -1);
      map.set('b', -100);
      expect(map.get('a')).toBe(-1);
      expect(map.get('b')).toBe(-100);
    });

    it('should handle string keys with special characters', () => {
      const map = new HashMap<string, number>();
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
});
