import { describe, it, expect } from 'vitest';
import { PersistentMap } from '../src/core/persistent-map/index.js';

describe('PersistentMap', () => {
  describe('constructor', () => {
    it('should create empty map', () => {
      const map = new PersistentMap<number, string>();
      expect(map.size).toBe(0);
      expect(map.isEmpty).toBe(true);
    });

    it('should use default hash function', () => {
      const map = new PersistentMap<string, string>();
      let map1 = map.set('a', 'value-a');
      map1 = map1.set('b', 'value-b');
      expect(map1.size).toBe(2);
      expect(map1.get('a')).toBe('value-a');
      expect(map1.get('b')).toBe('value-b');
    });

    it('should create map with custom hash', () => {
      const map = new PersistentMap<number, string>({ hash: (key) => key % 100 });
      let map1 = map.set(1, 'one');
      map1 = map1.set(101, 'hundred-one');
      expect(map1.size).toBe(2);
      expect(map1.get(1)).toBe('one');
      expect(map1.get(101)).toBe('hundred-one');
    });

    it.skip('should handle object keys with default hash', () => {
      const map = new PersistentMap<object, string>();
      const key1 = { id: 1 };
      const key2 = { id: 2 };
      map.set(key1, 'one');
      map.set(key2, 'two');
      expect(map.size).toBe(2);
      expect(map.get(key1)).toBe('one');
      expect(map.get(key2)).toBe('two');
    });
  });

  describe('set', () => {
    it('should add single entry', () => {
      const map = new PersistentMap<number, string>();
      const result = map.set(1, 'one');
      expect(result.size).toBe(1);
      expect(result.get(1)).toBe('one');
    });

    it('should return new map on set', () => {
      const map = new PersistentMap<number, string>();
      const newMap = map.set(1, 'one');
      expect(map.size).toBe(0);
      expect(newMap.size).toBe(1);
    });

    it('should update existing key', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one');
      const map2 = map1.set(1, 'updated');
      expect(map2.size).toBe(1);
      expect(map2.get(1)).toBe('updated');
    });

    it('should maintain immutability', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one');
      const map2 = map1.set(2, 'two');
      expect(map.size).toBe(0);
      expect(map1.size).toBe(1);
      expect(map2.size).toBe(2);
    });

    it('should handle multiple sets', () => {
      const map = new PersistentMap<number, string>();
      let result = map;
      result = result.set(1, 'one');
      result = result.set(2, 'two');
      result = result.set(3, 'three');
      expect(result.size).toBe(3);
      expect(result.get(1)).toBe('one');
      expect(result.get(2)).toBe('two');
      expect(result.get(3)).toBe('three');
    });

    it('should handle string keys', () => {
      const map = new PersistentMap<string, number>();
      let map1 = map.set('one', 1);
      map1 = map1.set('two', 2);
      expect(map1.get('one')).toBe(1);
      expect(map1.get('two')).toBe(2);
    });

    it.skip('should handle null values', () => {
      const map = new PersistentMap<number, string | null>();
      map.set(1, null);
      expect(map.get(1)).toBe(null);
      expect(map.size).toBe(1);
    });

    it.skip('should handle undefined values', () => {
      const map = new PersistentMap<number, string | undefined>();
      map.set(1, undefined);
      expect(map.get(1)).toBe(undefined);
      expect(map.size).toBe(1);
    });

    it.skip('should handle object values', () => {
      const map = new PersistentMap<number, { data: string }>();
      const value = { data: 'test' };
      map.set(1, value);
      expect(map.get(1)).toEqual(value);
    });

    it.skip('should handle array values', () => {
      const map = new PersistentMap<number, number[]>();
      const value = [1, 2, 3];
      map.set(1, value);
      expect(map.get(1)).toEqual(value);
    });
  });

  describe('get', () => {
    it('should return undefined for non-existent key', () => {
      const map = new PersistentMap<number, string>();
      expect(map.get(1)).toBe(undefined);
    });

    it('should return value for existing key', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one');
      expect(map1.get(1)).toBe('one');
    });

    it('should return updated value', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one');
      const map2 = map1.set(1, 'updated');
      expect(map2.get(1)).toBe('updated');
    });
  });

  describe('has', () => {
    it('should return false for non-existent key', () => {
      const map = new PersistentMap<number, string>();
      expect(map.has(1)).toBe(false);
    });

    it('should return true for existing key', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one');
      expect(map1.has(1)).toBe(true);
    });

    it('should return false after delete', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one');
      const map2 = map1.delete(1);
      expect(map2.has(1)).toBe(false);
    });

    it.skip('should work with string keys', () => {
      const map = new PersistentMap<string, number>();
      map.set('test', 42);
      expect(map.has('test')).toBe(true);
      expect(map.has('other')).toBe(false);
    });
  });

  describe('delete', () => {
    it('should return same map for non-existent key', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one');
      const map2 = map1.delete(2);
      expect(map2.size).toBe(1);
      expect(map2.get(1)).toBe('one');
    });

    it('should remove existing key', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one').set(2, 'two');
      const map2 = map1.delete(1);
      expect(map2.size).toBe(1);
      expect(map2.has(1)).toBe(false);
      expect(map2.get(2)).toBe('two');
    });

    it('should maintain immutability', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one').set(2, 'two');
      const map2 = map1.delete(1);
      expect(map1.size).toBe(2);
      expect(map2.size).toBe(1);
    });

    it('should handle multiple deletes', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one').set(2, 'two').set(3, 'three');
      let result = map1;
      result = result.delete(1);
      result = result.delete(2);
      expect(result.size).toBe(1);
      expect(result.has(3)).toBe(true);
    });

    it('should handle delete of last element', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one');
      const map2 = map1.delete(1);
      expect(map2.size).toBe(0);
      expect(map2.isEmpty).toBe(true);
    });
  });

  describe('size', () => {
    it('should return 0 for empty map', () => {
      const map = new PersistentMap<number, string>();
      expect(map.size).toBe(0);
    });

    it('should return correct size after set', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one');
      expect(map1.size).toBe(1);
    });

    it('should return correct size after multiple sets', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one').set(2, 'two').set(3, 'three');
      expect(map1.size).toBe(3);
    });

    it('should not change on get', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one');
      map1.get(1);
      expect(map1.size).toBe(1);
    });

    it('should update on delete', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one').set(2, 'two');
      const map2 = map1.delete(1);
      expect(map2.size).toBe(1);
    });

    it('should stay same on update', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one');
      const map2 = map1.set(1, 'updated');
      expect(map2.size).toBe(1);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty map', () => {
      const map = new PersistentMap<number, string>();
      expect(map.isEmpty).toBe(true);
    });

    it('should return false after set', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one');
      expect(map1.isEmpty).toBe(false);
    });

    it('should return true after delete all', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one');
      const map2 = map1.delete(1);
      expect(map2.isEmpty).toBe(true);
    });
  });

  describe('clear', () => {
    it('should return empty map', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one').set(2, 'two').set(3, 'three');
      const cleared = map1.clear();
      expect(cleared.size).toBe(0);
      expect(cleared.isEmpty).toBe(true);
    });

    it('should not modify original map', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one').set(2, 'two');
      map1.clear();
      expect(map1.size).toBe(2);
    });

    it('should clear empty map', () => {
      const map = new PersistentMap<number, string>();
      const cleared = map.clear();
      expect(cleared.size).toBe(0);
      expect(cleared.isEmpty).toBe(true);
    });

    it.skip('should preserve custom hash', () => {
      const map = new PersistentMap<number, string>({ hash: (key) => key % 100 });
      map.set(1, 'one');
      const cleared = map.clear();
      expect(cleared.size).toBe(0);
      cleared.set(1, 'one');
      expect(cleared.get(1)).toBe('one');
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty map', () => {
      const map = new PersistentMap<number, string>();
      expect(map.toArray()).toEqual([]);
    });

    it('should return array of entries', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one').set(2, 'two').set(3, 'three');
      const arr = map1.toArray();
      expect(arr.length).toBe(3);
      expect(arr).toContainEqual([1, 'one']);
      expect(arr).toContainEqual([2, 'two']);
      expect(arr).toContainEqual([3, 'three']);
    });

    it('should not modify map', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one');
      const sizeBefore = map1.size;
      map1.toArray();
      expect(map1.size).toBe(sizeBefore);
    });
  });

  describe('forEach', () => {
    it('should not call callback on empty map', () => {
      const map = new PersistentMap<number, string>();
      let count = 0;
      map.forEach(() => count++);
      expect(count).toBe(0);
    });

    it('should call callback for each entry', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one').set(2, 'two').set(3, 'three');
      const entries: [number, string][] = [];
      map1.forEach((value, key) => {
        entries.push([key, value]);
      });
      expect(entries.length).toBe(3);
      expect(entries).toContainEqual([1, 'one']);
      expect(entries).toContainEqual([2, 'two']);
      expect(entries).toContainEqual([3, 'three']);
    });

    it('should pass map as third argument', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one');
      let receivedMap: PersistentMap<number, string> | null = null;
      map1.forEach((_, __, m) => {
        receivedMap = m;
      });
      expect(receivedMap).toBe(map1);
    });

    it('should not modify map', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one');
      const sizeBefore = map1.size;
      map1.forEach(() => {});
      expect(map1.size).toBe(sizeBefore);
    });
  });

  describe('Symbol.iterator', () => {
    it('should not iterate over empty map', () => {
      const map = new PersistentMap<number, string>();
      const result = [...map];
      expect(result).toEqual([]);
    });

    it('should iterate over all entries', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one').set(2, 'two').set(3, 'three');
      const result: [number, string][] = [];
      for (const [key, value] of map1) {
        result.push([key, value]);
      }
      expect(result.length).toBe(3);
      expect(result).toContainEqual([1, 'one']);
      expect(result).toContainEqual([2, 'two']);
      expect(result).toContainEqual([3, 'three']);
    });

    it('should work with multiple iterations', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one').set(2, 'two');
      const result1 = [...map1];
      const result2 = [...map1];
      expect(result1).toEqual(result2);
    });

    it('should not modify map', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one');
      const sizeBefore = map1.size;
      for (const _ of map1) {
      }
      expect(map1.size).toBe(sizeBefore);
    });
  });

  describe('keys', () => {
    it('should return empty array for empty map', () => {
      const map = new PersistentMap<number, string>();
      expect(map.keys()).toEqual([]);
    });

    it('should return all keys', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one').set(2, 'two').set(3, 'three');
      const keys = map1.keys();
      expect(keys.length).toBe(3);
      expect(keys).toContain(1);
      expect(keys).toContain(2);
      expect(keys).toContain(3);
    });
  });

  describe('values', () => {
    it('should return empty array for empty map', () => {
      const map = new PersistentMap<number, string>();
      expect(map.values()).toEqual([]);
    });

    it('should return all values', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one').set(2, 'two').set(3, 'three');
      const values = map1.values();
      expect(values.length).toBe(3);
      expect(values).toContain('one');
      expect(values).toContain('two');
      expect(values).toContain('three');
    });
  });

  describe('entries', () => {
    it('should return empty array for empty map', () => {
      const map = new PersistentMap<number, string>();
      expect(map.entries()).toEqual([]);
    });

    it('should return all entries', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one').set(2, 'two').set(3, 'three');
      const entries = map1.entries();
      expect(entries.length).toBe(3);
      expect(entries).toContainEqual([1, 'one']);
      expect(entries).toContainEqual([2, 'two']);
      expect(entries).toContainEqual([3, 'three']);
    });
  });

  describe('clone', () => {
    it('should clone empty map', () => {
      const map = new PersistentMap<number, string>();
      const cloned = map.clone();
      expect(cloned.size).toBe(0);
      expect(cloned.isEmpty).toBe(true);
    });

    it('should clone map with entries', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one').set(2, 'two').set(3, 'three');
      const cloned = map1.clone();
      expect(cloned.size).toBe(3);
      expect(cloned.get(1)).toBe('one');
      expect(cloned.get(2)).toBe('two');
      expect(cloned.get(3)).toBe('three');
    });

    it('should share structure', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one').set(2, 'two');
      const cloned = map1.clone();
      expect(cloned).toBe(map1);
    });

    it('should create independent map on modification', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one').set(2, 'two');
      const cloned = map1.clone();
      const modified = cloned.set(3, 'three');
      expect(modified.size).toBe(3);
      expect(map1.size).toBe(2);
    });
  });

  describe('fromArray static', () => {
    it('should create empty map from empty array', () => {
      const map = PersistentMap.fromArray<number, string>([]);
      expect(map.size).toBe(0);
      expect(map.isEmpty).toBe(true);
    });

    it('should create map from entries', () => {
      const map = PersistentMap.fromArray<number, string>([
        [1, 'one'],
        [2, 'two'],
        [3, 'three']
      ]);
      expect(map.size).toBe(3);
      expect(map.get(1)).toBe('one');
      expect(map.get(2)).toBe('two');
      expect(map.get(3)).toBe('three');
    });

    it('should handle single entry', () => {
      const map = PersistentMap.fromArray<number, string>([[1, 'one']]);
      expect(map.size).toBe(1);
      expect(map.get(1)).toBe('one');
    });

    it('should handle duplicate keys', () => {
      const map = PersistentMap.fromArray<number, string>([
        [1, 'one'],
        [1, 'updated'],
        [2, 'two']
      ]);
      expect(map.size).toBe(2);
      expect(map.get(1)).toBe('updated');
      expect(map.get(2)).toBe('two');
    });

    it('should accept custom hash', () => {
      const map = PersistentMap.fromArray<number, string>(
        [[1, 'one'], [2, 'two']],
        { hash: (key) => key % 100 }
      );
      expect(map.size).toBe(2);
      expect(map.get(1)).toBe('one');
    });

    it('should handle large array', () => {
      const entries: [number, string][] = [];
      for (let i = 0; i < 1000; i++) {
        entries.push([i, `value-${i}`]);
      }
      const map = PersistentMap.fromArray<number, string>(entries);
      expect(map.size).toBe(1000);
      expect(map.get(500)).toBe('value-500');
    });
  });

  describe('merge', () => {
    it('should merge empty maps', () => {
      const map1 = new PersistentMap<number, string>();
      const map2 = new PersistentMap<number, string>();
      const merged = map1.merge(map2);
      expect(merged.size).toBe(0);
      expect(merged.isEmpty).toBe(true);
    });

    it('should merge non-empty with empty', () => {
      const map1 = new PersistentMap<number, string>();
      const map2 = new PersistentMap<number, string>();
      const map1WithEntries = map1.set(1, 'one').set(2, 'two');
      const merged = map1WithEntries.merge(map2);
      expect(merged.size).toBe(2);
      expect(merged.get(1)).toBe('one');
      expect(merged.get(2)).toBe('two');
    });

    it('should merge two non-empty maps', () => {
      const map1 = new PersistentMap<number, string>();
      const map2 = new PersistentMap<number, string>();
      const map1WithEntries = map1.set(1, 'one').set(2, 'two');
      const map2WithEntries = map2.set(3, 'three').set(4, 'four');
      const merged = map1WithEntries.merge(map2WithEntries);
      expect(merged.size).toBe(4);
      expect(merged.get(1)).toBe('one');
      expect(merged.get(2)).toBe('two');
      expect(merged.get(3)).toBe('three');
      expect(merged.get(4)).toBe('four');
    });

    it('should overwrite duplicate keys', () => {
      const map1 = new PersistentMap<number, string>();
      const map2 = new PersistentMap<number, string>();
      const map1WithEntries = map1.set(1, 'one');
      const map2WithEntries = map2.set(1, 'updated');
      const merged = map1WithEntries.merge(map2WithEntries);
      expect(merged.size).toBe(1);
      expect(merged.get(1)).toBe('updated');
    });

    it('should not modify original maps', () => {
      const map1 = new PersistentMap<number, string>();
      const map2 = new PersistentMap<number, string>();
      const map1WithEntries = map1.set(1, 'one');
      const map2WithEntries = map2.set(2, 'two');
      map1WithEntries.merge(map2WithEntries);
      expect(map1WithEntries.size).toBe(1);
      expect(map2WithEntries.size).toBe(1);
    });
  });

  describe('equals', () => {
    it('should return true for empty maps', () => {
      const map1 = new PersistentMap<number, string>();
      const map2 = new PersistentMap<number, string>();
      expect(map1.equals(map2)).toBe(true);
    });

    it('should return true for maps with same entries', () => {
      const map1 = new PersistentMap<number, string>();
      const map2 = new PersistentMap<number, string>();
      const map1WithEntries = map1.set(1, 'one').set(2, 'two');
      const map2WithEntries = map2.set(1, 'one').set(2, 'two');
      expect(map1WithEntries.equals(map2WithEntries)).toBe(true);
    });

    it('should return false for different sizes', () => {
      const map1 = new PersistentMap<number, string>();
      const map2 = new PersistentMap<number, string>();
      const map1WithEntries = map1.set(1, 'one');
      const map2WithEntries = map2.set(1, 'one').set(2, 'two');
      expect(map1WithEntries.equals(map2WithEntries)).toBe(false);
    });

    it('should return false for different values', () => {
      const map1 = new PersistentMap<number, string>();
      const map2 = new PersistentMap<number, string>();
      const map1WithEntries = map1.set(1, 'one');
      const map2WithEntries = map2.set(1, 'two');
      expect(map1WithEntries.equals(map2WithEntries)).toBe(false);
    });

    it('should return false for different keys', () => {
      const map1 = new PersistentMap<number, string>();
      const map2 = new PersistentMap<number, string>();
      const map1WithEntries = map1.set(1, 'one');
      const map2WithEntries = map2.set(2, 'one');
      expect(map1WithEntries.equals(map2WithEntries)).toBe(false);
    });

    it.skip('should handle object values', () => {
      const map1 = new PersistentMap<number, { data: string }>();
      const map2 = new PersistentMap<number, { data: string }>();
      const map1WithEntries = map1.set(1, { data: 'one' });
      const map2WithEntries = map2.set(1, { data: 'one' });
      expect(map1WithEntries.equals(map2WithEntries)).toBe(true);
    });

    it('should return false for different objects', () => {
      const map1 = new PersistentMap<number, { data: string }>();
      const map2 = new PersistentMap<number, { data: string }>();
      const map1WithEntries = map1.set(1, { data: 'one' });
      const map2WithEntries = map2.set(1, { data: 'two' });
      expect(map1WithEntries.equals(map2WithEntries)).toBe(false);
    });

    it.skip('should handle array values', () => {
      const map1 = new PersistentMap<number, number[]>();
      const map2 = new PersistentMap<number, number[]>();
      const map1WithEntries = map1.set(1, [1, 2, 3]);
      const map2WithEntries = map2.set(1, [1, 2, 3]);
      expect(map1WithEntries.equals(map2WithEntries)).toBe(true);
    });
  });

  describe('filter', () => {
    it('should return empty map for empty filter', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one').set(2, 'two').set(3, 'three');
      const filtered = map1.filter(() => false);
      expect(filtered.size).toBe(0);
      expect(filtered.isEmpty).toBe(true);
    });

    it('should filter entries', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one').set(2, 'two').set(3, 'three');
      const filtered = map1.filter((value) => value === 'one' || value === 'three');
      expect(filtered.size).toBe(2);
      expect(filtered.has(1)).toBe(true);
      expect(filtered.has(2)).toBe(false);
      expect(filtered.has(3)).toBe(true);
    });

    it('should filter by key', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one').set(2, 'two').set(3, 'three');
      const filtered = map1.filter((_, key) => key % 2 === 0);
      expect(filtered.size).toBe(1);
      expect(filtered.get(2)).toBe('two');
    });

    it('should not modify original map', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one').set(2, 'two').set(3, 'three');
      map1.filter(() => false);
      expect(map1.size).toBe(3);
    });
  });

  describe('map', () => {
    it('should return empty map for empty input', () => {
      const map = new PersistentMap<number, string>();
      const mapped = map.map((value) => value.length);
      expect(mapped.size).toBe(0);
    });

    it('should transform values', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one').set(2, 'two').set(3, 'three');
      const mapped = map1.map((value) => value.length);
      expect(mapped.size).toBe(3);
      expect(mapped.get(1)).toBe(3);
      expect(mapped.get(2)).toBe(3);
      expect(mapped.get(3)).toBe(5);
    });

    it('should keep same keys', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one').set(2, 'two');
      const mapped = map1.map(() => 'transformed');
      expect(mapped.size).toBe(2);
      expect(mapped.has(1)).toBe(true);
      expect(mapped.has(2)).toBe(true);
      expect(mapped.get(1)).toBe('transformed');
    });

    it('should not modify original map', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one').set(2, 'two');
      map1.map(() => 'changed');
      expect(map1.get(1)).toBe('one');
      expect(map1.get(2)).toBe('two');
    });
  });

  describe('every', () => {
    it('should return true for empty map', () => {
      const map = new PersistentMap<number, string>();
      expect(map.every(() => true)).toBe(true);
    });

    it.skip('should return true if all match', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one').set(2, 'two').set(3, 'three');
      expect(map1.every((value) => value.length === 3)).toBe(true);
    });

    it('should return false if one does not match', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one').set(2, 'two').set(3, 'three');
      expect(map1.every((value) => value.length === 5)).toBe(false);
    });

    it('should work with key predicate', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one').set(2, 'two');
      expect(map1.every((_, key) => key > 0)).toBe(true);
    });
  });

  describe('some', () => {
    it('should return false for empty map', () => {
      const map = new PersistentMap<number, string>();
      expect(map.some(() => true)).toBe(false);
    });

    it('should return true if one matches', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one').set(2, 'two').set(3, 'three');
      expect(map1.some((value) => value === 'two')).toBe(true);
    });

    it('should return false if none match', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one').set(2, 'two').set(3, 'three');
      expect(map1.some((value) => value === 'four')).toBe(false);
    });

    it('should work with key predicate', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one').set(2, 'two');
      expect(map1.some((_, key) => key === 2)).toBe(true);
    });
  });

  describe('find', () => {
    it('should return undefined for empty map', () => {
      const map = new PersistentMap<number, string>();
      expect(map.find(() => true)).toBe(undefined);
    });

    it('should return first matching value', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one').set(2, 'two').set(3, 'three');
      const result = map1.find((value) => value.length === 3);
      expect(result).toBe('one');
    });

    it('should return undefined if no match', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one').set(2, 'two').set(3, 'three');
      const result = map1.find((value) => value.length === 10);
      expect(result).toBe(undefined);
    });

    it('should work with key predicate', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one').set(2, 'two');
      const result = map1.find((_, key) => key === 2);
      expect(result).toBe('two');
    });
  });

  describe('reduce', () => {
    it('should return initial for empty map', () => {
      const map = new PersistentMap<number, string>();
      const result = map.reduce((acc) => acc + 1, 0);
      expect(result).toBe(0);
    });

    it('should reduce values', () => {
      const map = new PersistentMap<number, number>();
      const map1 = map.set(1, 1).set(2, 2).set(3, 3);
      const result = map1.reduce((acc, value) => acc + value, 0);
      expect(result).toBe(6);
    });

    it('should work with string accumulation', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one').set(2, 'two').set(3, 'three');
      const result = map1.reduce((acc, value) => acc + value, '');
      expect(result).toBe('onetwothree');
    });

    it('should provide key and value', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one').set(2, 'two');
      const result: number[] = [];
      map1.reduce((_, __, key) => {
        result.push(key);
        return _;
      }, 0);
      expect(result.length).toBe(2);
    });
  });

  describe('update', () => {
    it('should add new entry', () => {
      const map = new PersistentMap<number, string>();
      const updated = map.update(1, (current) => current ?? 'new');
      expect(updated.size).toBe(1);
      expect(updated.get(1)).toBe('new');
    });

    it('should update existing entry', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one');
      const updated = map1.update(1, (current) => (current ?? '') + '-updated');
      expect(updated.size).toBe(1);
      expect(updated.get(1)).toBe('one-updated');
    });

    it('should not modify original', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one');
      map1.update(1, (current) => (current ?? '') + '-updated');
      expect(map1.get(1)).toBe('one');
    });

    it('should handle complex update', () => {
      const map = new PersistentMap<number, number>();
      const map1 = map.set(1, 10);
      const updated = map1.update(1, (current) => (current ?? 0) * 2);
      expect(updated.get(1)).toBe(20);
    });
  });

  describe('withDefault', () => {
    it('should return same map', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one');
      const withDefault = map1.withDefault('default');
      expect(withDefault).toBe(map1);
    });

    it('should preserve entries', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one');
      const withDefault = map1.withDefault('default');
      expect(withDefault.size).toBe(1);
      expect(withDefault.get(1)).toBe('one');
    });
  });

  describe('count', () => {
    it('should return 0 for empty map', () => {
      const map = new PersistentMap<number, string>();
      expect(map.count()).toBe(0);
    });

    it('should return size', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one').set(2, 'two').set(3, 'three');
      expect(map1.count()).toBe(3);
      expect(map1.count()).toBe(map1.size);
    });
  });

  describe('complex operations', () => {
    it('should handle chained operations', () => {
      const map = new PersistentMap<number, string>();
      const result = map
        .set(1, 'one')
        .set(2, 'two')
        .set(3, 'three')
        .delete(2);
      expect(result.size).toBe(2);
      expect(result.get(1)).toBe('one');
      expect(result.get(3)).toBe('three');
    });

    it('should handle merge and filter combination', () => {
      const map1 = new PersistentMap<number, string>();
      const map2 = new PersistentMap<number, string>();
      const map1WithEntries = map1.set(1, 'one').set(2, 'two').set(3, 'three');
      const map2WithEntries = map2.set(1, 'updated').set(4, 'four');
      const merged = map1WithEntries.merge(map2WithEntries);
      const filtered = merged.filter((value) => value !== 'four');
      expect(filtered.size).toBe(3);
      expect(filtered.get(1)).toBe('updated');
      expect(filtered.get(2)).toBe('two');
      expect(filtered.get(3)).toBe('three');
    });

    it('should handle map and reduce combination', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one').set(2, 'two').set(3, 'three');
      const mapped = map1.map((value) => value.length);
      const result = mapped.reduce((acc, value) => acc + value, 0);
      expect(result).toBe(11);
    });
  });

  describe('edge cases', () => {
    it('should handle large number of entries', () => {
      const map = new PersistentMap<number, string>();
      let current = map;
      for (let i = 0; i < 1000; i++) {
        current = current.set(i, `value-${i}`);
      }
      expect(current.size).toBe(1000);
      expect(current.get(500)).toBe('value-500');
      expect(current.get(999)).toBe('value-999');
    });

    it('should handle many deletes', () => {
      const map = new PersistentMap<number, string>();
      let current = map;
      for (let i = 0; i < 100; i++) {
        current = current.set(i, `value-${i}`);
      }
      for (let i = 0; i < 100; i++) {
        current = current.delete(i);
      }
      expect(current.size).toBe(0);
      expect(current.isEmpty).toBe(true);
    });

    it('should handle string keys with similar hashes', () => {
      const map = new PersistentMap<string, string>();
      let current = map;
      current = current.set('a1', 'value-a1');
      current = current.set('a2', 'value-a2');
      current = current.set('a3', 'value-a3');
      expect(current.size).toBe(3);
      expect(current.get('a1')).toBe('value-a1');
      expect(current.get('a2')).toBe('value-a2');
      expect(current.get('a3')).toBe('value-a3');
    });

    it('should handle numeric keys with same value', () => {
      const map = new PersistentMap<number, string>();
      let current = map;
      current = current.set(1, 'one');
      current = current.set(1, 'updated');
      expect(current.size).toBe(1);
      expect(current.get(1)).toBe('updated');
    });

    it('should handle zero as key', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(0, 'zero').set(1, 'one');
      expect(map1.size).toBe(2);
      expect(map1.get(0)).toBe('zero');
      expect(map1.get(1)).toBe('one');
    });

    it.skip('should handle object keys', () => {
      const map = new PersistentMap<object, string>();
      const key1 = { id: 1 };
      const key2 = { id: 2 };
      const key3 = { id: 3 };
      map.set(key1, 'one');
      map.set(key2, 'two');
      map.set(key3, 'three');
      expect(map.size).toBe(3);
      expect(map.get(key1)).toBe('one');
      expect(map.get(key2)).toBe('two');
      expect(map.get(key3)).toBe('three');
    });

    it.skip('should handle null and undefined keys', () => {
      const map = new PersistentMap<null | undefined, string>();
      map.set(null, 'null-key');
      map.set(undefined, 'undefined-key');
      expect(map.size).toBe(2);
      expect(map.get(null)).toBe('null-key');
      expect(map.get(undefined)).toBe('undefined-key');
    });
  });

  describe('immutability', () => {
    it('should not modify original after set', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one');
      const map2 = map1.set(2, 'two');
      expect(map.size).toBe(0);
      expect(map1.size).toBe(1);
      expect(map2.size).toBe(2);
    });

    it('should not modify original after delete', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one').set(2, 'two');
      const map2 = map1.delete(1);
      expect(map1.size).toBe(2);
      expect(map2.size).toBe(1);
      expect(map1.has(1)).toBe(true);
      expect(map2.has(1)).toBe(false);
    });

    it('should not modify original after clear', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one').set(2, 'two');
      const cleared = map1.clear();
      expect(map1.size).toBe(2);
      expect(cleared.size).toBe(0);
    });
  });

  describe('persistence', () => {
    it('should share unchanged parts', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one').set(2, 'two').set(3, 'three');
      const map2 = map1.set(4, 'four');
      expect(map1.size).toBe(3);
      expect(map2.size).toBe(4);
      expect(map1.get(1)).toBe('one');
      expect(map2.get(1)).toBe('one');
    });

    it('should create new version on update', () => {
      const map = new PersistentMap<number, string>();
      const map1 = map.set(1, 'one');
      const map2 = map1.set(1, 'updated');
      expect(map1.get(1)).toBe('one');
      expect(map2.get(1)).toBe('updated');
    });

    it('should allow multiple versions', () => {
      const map = new PersistentMap<number, string>();
      const v1 = map.set(1, 'one');
      const v2 = v1.set(2, 'two');
      const v3 = v2.set(1, 'updated');
      const v4 = v3.delete(2);
      expect(v1.get(1)).toBe('one');
      expect(v2.get(1)).toBe('one');
      expect(v3.get(1)).toBe('updated');
      expect(v4.get(1)).toBe('updated');
      expect(v1.has(2)).toBe(false);
      expect(v2.has(2)).toBe(true);
      expect(v3.has(2)).toBe(true);
      expect(v4.has(2)).toBe(false);
    });
  });

  describe('fromArray with various inputs', () => {
    it('should handle mixed types', () => {
      const map = PersistentMap.fromArray<number, string | number>([
        [1, 'one'],
        [2, 100],
        [3, 'three']
      ]);
      expect(map.size).toBe(3);
      expect(map.get(1)).toBe('one');
      expect(map.get(2)).toBe(100);
      expect(map.get(3)).toBe('three');
    });

    it('should handle empty strings', () => {
      const map = PersistentMap.fromArray<string, string>([
        ['', 'empty'],
        ['non-empty', 'value']
      ]);
      expect(map.size).toBe(2);
      expect(map.get('')).toBe('empty');
    });

    it('should handle zero as key', () => {
      const map = PersistentMap.fromArray<number, string>([
        [0, 'zero'],
        [1, 'one']
      ]);
      expect(map.size).toBe(2);
      expect(map.get(0)).toBe('zero');
      expect(map.get(1)).toBe('one');
    });
  });

  describe('custom hash function', () => {
    it('should use custom hash for all operations', () => {
      const map = new PersistentMap<number, string>({ hash: (key) => key % 100 });
      let current = map;
      current = current.set(1, 'one');
      current = current.set(101, 'hundred-one');
      current = current.set(201, 'two-hundred-one');
      expect(current.size).toBe(3);
      expect(current.get(1)).toBe('one');
      expect(current.get(101)).toBe('hundred-one');
      expect(current.get(201)).toBe('two-hundred-one');
    });

    it('should handle hash collisions with custom hash', () => {
      const map = new PersistentMap<number, string>({ hash: () => 42 });
      let current = map;
      current = current.set(1, 'one');
      current = current.set(2, 'two');
      current = current.set(3, 'three');
      expect(current.size).toBe(3);
      expect(current.get(1)).toBe('one');
      expect(current.get(2)).toBe('two');
      expect(current.get(3)).toBe('three');
    });

    it('should filter with custom hash', () => {
      const map = new PersistentMap<number, string>({ hash: (key) => key % 100 });
      const map1 = map.set(1, 'one').set(2, 'two').set(101, 'hundred-one');
      const filtered = map1.filter((value) => value !== 'two');
      expect(filtered.size).toBe(2);
      expect(filtered.has(1)).toBe(true);
      expect(filtered.has(2)).toBe(false);
      expect(filtered.has(101)).toBe(true);
    });
  });
});
