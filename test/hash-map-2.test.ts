import { describe, it, expect, beforeEach } from 'vitest';
import { HashMap2 } from '../src/core/hash-map-2/index.js';

describe('HashMap2', () => {
  let map: HashMap2<number, string>;

  beforeEach(() => {
    map = new HashMap2<number, string>();
  });

  describe('constructor', () => {
    it('should create map with default capacity 16', () => {
      const defaultMap = new HashMap2<number, string>();
      expect(defaultMap.capacity).toBe(16);
      expect(defaultMap.size).toBe(0);
      expect(defaultMap.isEmpty).toBe(true);
    });

    it('should create map with specified initial capacity', () => {
      const customMap = new HashMap2<number, string>({ initialCapacity: 32 });
      expect(customMap.capacity).toBe(32);
      expect(customMap.size).toBe(0);
    });

    it('should create map with custom load factor', () => {
      const customMap = new HashMap2<number, string>({ loadFactor: 0.5 });
      expect(customMap.size).toBe(0);
    });

    it('should create map with custom hash function', () => {
      const customMap = new HashMap2<number, string>({
        hash: (key) => key * 2,
      });
      customMap.set(1, 'a');
      expect(customMap.get(1)).toBe('a');
    });
  });

  describe('set', () => {
    it('should add key-value pairs', () => {
      map.set(1, 'a');
      map.set(2, 'b');
      map.set(3, 'c');
      expect(map.size).toBe(3);
      expect(map.get(1)).toBe('a');
      expect(map.get(2)).toBe('b');
      expect(map.get(3)).toBe('c');
    });

    it('should update existing key', () => {
      map.set(1, 'a');
      map.set(1, 'updated');
      expect(map.size).toBe(1);
      expect(map.get(1)).toBe('updated');
    });

    it('should return this for chaining', () => {
      const result = map.set(1, 'a').set(2, 'b');
      expect(result === map).toBe(true);
      expect(map.size).toBe(2);
    });

    it('should grow capacity when load factor exceeded', () => {
      const smallMap = new HashMap2<number, string>({ initialCapacity: 4, loadFactor: 0.75 });
      smallMap.set(1, 'a');
      smallMap.set(2, 'b');
      smallMap.set(3, 'c');
      expect(smallMap.capacity).toBeGreaterThanOrEqual(4);
    });

    it('should handle string keys', () => {
      const strMap = new HashMap2<string, number>();
      strMap.set('a', 1);
      strMap.set('b', 2);
      expect(strMap.get('a')).toBe(1);
      expect(strMap.get('b')).toBe(2);
    });

    it('should handle object keys with same content', () => {
      const objMap = new HashMap2<{ id: number }, string>();
      const obj1 = { id: 1 };
      const obj2 = { id: 1 };
      objMap.set(obj1, 'first');
      objMap.set(obj2, 'second');
      expect(objMap.size).toBe(2);
    });

    it('should handle NaN keys', () => {
      const nanMap = new HashMap2<number, string>();
      nanMap.set(NaN, 'nan1');
      nanMap.set(NaN, 'nan2');
      expect(nanMap.size).toBe(1);
      expect(nanMap.get(NaN)).toBe('nan2');
    });
  });

  describe('put', () => {
    it('should be alias for set', () => {
      map.put(1, 'a');
      expect(map.get(1)).toBe('a');
      expect(map.size).toBe(1);
    });

    it('should return this for chaining', () => {
      const result = map.put(1, 'a').put(2, 'b');
      expect(result === map).toBe(true);
      expect(map.size).toBe(2);
    });
  });

  describe('get', () => {
    it('should return value for existing key', () => {
      map.set(1, 'a');
      expect(map.get(1)).toBe('a');
    });

    it('should return undefined for non-existent key', () => {
      expect(map.get(1)).toBeUndefined();
    });

    it('should return undefined for empty map', () => {
      expect(map.get(1)).toBeUndefined();
    });

    it('should handle string keys', () => {
      const strMap = new HashMap2<string, number>();
      strMap.set('key', 42);
      expect(strMap.get('key')).toBe(42);
    });
  });

  describe('delete', () => {
    it('should remove existing key', () => {
      map.set(1, 'a');
      map.set(2, 'b');
      const result = map.delete(1);
      expect(result).toBe(true);
      expect(map.size).toBe(1);
      expect(map.get(1)).toBeUndefined();
      expect(map.get(2)).toBe('b');
    });

    it('should return false for non-existent key', () => {
      const result = map.delete(1);
      expect(result).toBe(false);
      expect(map.size).toBe(0);
    });

    it('should handle multiple deletes', () => {
      map.set(1, 'a');
      map.set(2, 'b');
      map.set(3, 'c');
      map.delete(1);
      map.delete(3);
      expect(map.size).toBe(1);
      expect(map.get(2)).toBe('b');
    });

    it('should work after rehash', () => {
      const smallMap = new HashMap2<number, string>({ initialCapacity: 2, loadFactor: 0.75 });
      smallMap.set(1, 'a');
      smallMap.set(2, 'b');
      smallMap.set(3, 'c');
      smallMap.delete(2);
      expect(smallMap.size).toBe(2);
      expect(smallMap.get(1)).toBe('a');
      expect(smallMap.get(3)).toBe('c');
    });
  });

  describe('has', () => {
    it('should return true for existing key', () => {
      map.set(1, 'a');
      expect(map.has(1)).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(map.has(1)).toBe(false);
    });

    it('should return false for empty map', () => {
      expect(map.has(1)).toBe(false);
    });

    it('should work after delete', () => {
      map.set(1, 'a');
      map.delete(1);
      expect(map.has(1)).toBe(false);
    });
  });

  describe('size', () => {
    it('should track number of entries', () => {
      expect(map.size).toBe(0);
      map.set(1, 'a');
      expect(map.size).toBe(1);
      map.set(2, 'b');
      expect(map.size).toBe(2);
      map.delete(1);
      expect(map.size).toBe(1);
    });

    it('should not increase on update', () => {
      map.set(1, 'a');
      map.set(1, 'b');
      expect(map.size).toBe(1);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty map', () => {
      expect(map.isEmpty).toBe(true);
    });

    it('should return false for non-empty map', () => {
      map.set(1, 'a');
      expect(map.isEmpty).toBe(false);
    });

    it('should return true after clearing', () => {
      map.set(1, 'a');
      map.set(2, 'b');
      map.clear();
      expect(map.isEmpty).toBe(true);
    });

    it('should return true after all deletes', () => {
      map.set(1, 'a');
      map.set(2, 'b');
      map.delete(1);
      map.delete(2);
      expect(map.isEmpty).toBe(true);
    });
  });

  describe('clear', () => {
    it('should remove all entries', () => {
      map.set(1, 'a');
      map.set(2, 'b');
      map.set(3, 'c');
      map.clear();
      expect(map.size).toBe(0);
      expect(map.isEmpty).toBe(true);
      expect(map.get(1)).toBeUndefined();
      expect(map.get(2)).toBeUndefined();
      expect(map.get(3)).toBeUndefined();
    });

    it('should not affect capacity', () => {
      const customMap = new HashMap2<number, string>({ initialCapacity: 32 });
      customMap.set(1, 'a');
      const capacityBefore = customMap.capacity;
      customMap.clear();
      expect(customMap.capacity).toBe(capacityBefore);
      expect(customMap.size).toBe(0);
    });

    it('should allow reuse after clear', () => {
      map.set(1, 'a');
      map.clear();
      map.set(2, 'b');
      map.set(3, 'c');
      expect(map.size).toBe(2);
      expect(map.get(2)).toBe('b');
      expect(map.get(3)).toBe('c');
    });
  });

  describe('toArray', () => {
    it('should convert to array of key-value pairs', () => {
      map.set(1, 'a');
      map.set(2, 'b');
      map.set(3, 'c');
      const result = map.toArray();
      expect(result.length).toBe(3);
      expect(result).toContainEqual([1, 'a']);
      expect(result).toContainEqual([2, 'b']);
      expect(result).toContainEqual([3, 'c']);
    });

    it('should return empty array for empty map', () => {
      expect(map.toArray()).toEqual([]);
    });

    it('should work with various key types', () => {
      const strMap = new HashMap2<string, number>();
      strMap.set('x', 1);
      strMap.set('y', 2);
      const result = strMap.toArray();
      expect(result.length).toBe(2);
    });
  });

  describe('clone', () => {
    it('should create independent copy', () => {
      map.set(1, 'a');
      map.set(2, 'b');
      const clone = map.clone();
      expect(clone.size).toBe(2);
      expect(clone.get(1)).toBe('a');
      expect(clone.get(2)).toBe('b');
    });

    it('should not affect original', () => {
      map.set(1, 'a');
      const clone = map.clone();
      clone.set(2, 'b');
      clone.delete(1);
      expect(map.size).toBe(1);
      expect(map.get(1)).toBe('a');
      expect(clone.size).toBe(1);
    });

    it('should clone empty map', () => {
      const clone = map.clone();
      expect(clone.size).toBe(0);
      expect(clone.isEmpty).toBe(true);
    });

    it('should preserve capacity and load factor', () => {
      const customMap = new HashMap2<number, string>({ initialCapacity: 32, loadFactor: 0.5 });
      customMap.set(1, 'a');
      const clone = customMap.clone();
      expect(clone.capacity).toBe(32);
      expect(clone.size).toBe(1);
    });
  });

  describe('fromArray static', () => {
    it('should create map from array entries', () => {
      const entries = [
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ] as [number, string][];
      const newMap = HashMap2.fromArray(entries);
      expect(newMap.size).toBe(3);
      expect(newMap.get(1)).toBe('a');
      expect(newMap.get(2)).toBe('b');
      expect(newMap.get(3)).toBe('c');
    });

    it('should use default capacity based on entries', () => {
      const entries = [
        [1, 'a'],
        [2, 'b'],
      ] as [number, string][];
      const newMap = HashMap2.fromArray(entries);
      expect(newMap.capacity).toBeGreaterThanOrEqual(16);
      expect(newMap.size).toBe(2);
    });

    it('should create empty map from empty array', () => {
      const newMap = HashMap2.fromArray([]);
      expect(newMap.size).toBe(0);
      expect(newMap.isEmpty).toBe(true);
    });

    it('should use custom options', () => {
      const entries = [
        [1, 'a'],
        [2, 'b'],
      ] as [number, string][];
      const newMap = HashMap2.fromArray(entries, { initialCapacity: 32, loadFactor: 0.5 });
      expect(newMap.capacity).toBe(32);
      expect(newMap.size).toBe(2);
    });
  });

  describe('forEach', () => {
    it('should iterate over all entries', () => {
      map.set(1, 'a');
      map.set(2, 'b');
      map.set(3, 'c');
      const keys: number[] = [];
      const values: string[] = [];
      map.forEach((value, key) => {
        keys.push(key);
        values.push(value);
      });
      expect(keys).toContain(1);
      expect(keys).toContain(2);
      expect(keys).toContain(3);
      expect(values).toContain('a');
      expect(values).toContain('b');
      expect(values).toContain('c');
    });

    it('should not iterate over empty map', () => {
      let count = 0;
      map.forEach(() => {
        count++;
      });
      expect(count).toBe(0);
    });

    it('should pass key and value in correct order', () => {
      map.set(1, 'a');
      map.set(2, 'b');
      const result: [number, string][] = [];
      map.forEach((value, key) => {
        result.push([key, value]);
      });
      expect(result.length).toBe(2);
    });
  });

  describe('iterator', () => {
    it('should support for...of iteration', () => {
      map.set(1, 'a');
      map.set(2, 'b');
      map.set(3, 'c');
      const result: [number, string][] = [];
      for (const [key, value] of map) {
        result.push([key, value]);
      }
      expect(result.length).toBe(3);
      expect(result).toContainEqual([1, 'a']);
      expect(result).toContainEqual([2, 'b']);
      expect(result).toContainEqual([3, 'c']);
    });

    it('should support spread operator', () => {
      map.set(1, 'a');
      map.set(2, 'b');
      const result = [...map];
      expect(result.length).toBe(2);
      expect(result).toContainEqual([1, 'a']);
      expect(result).toContainEqual([2, 'b']);
    });

    it('should iterate over empty map', () => {
      const result = [...map];
      expect(result).toEqual([]);
    });
  });

  describe('keys', () => {
    it('should return array of keys', () => {
      map.set(1, 'a');
      map.set(2, 'b');
      map.set(3, 'c');
      const keys = map.keys();
      expect(keys.length).toBe(3);
      expect(keys).toContain(1);
      expect(keys).toContain(2);
      expect(keys).toContain(3);
    });

    it('should return empty array for empty map', () => {
      expect(map.keys()).toEqual([]);
    });

    it('should work with string keys', () => {
      const strMap = new HashMap2<string, number>();
      strMap.set('a', 1);
      strMap.set('b', 2);
      const keys = strMap.keys();
      expect(keys.length).toBe(2);
      expect(keys).toContain('a');
      expect(keys).toContain('b');
    });
  });

  describe('values', () => {
    it('should return array of values', () => {
      map.set(1, 'a');
      map.set(2, 'b');
      map.set(3, 'c');
      const values = map.values();
      expect(values.length).toBe(3);
      expect(values).toContain('a');
      expect(values).toContain('b');
      expect(values).toContain('c');
    });

    it('should return empty array for empty map', () => {
      expect(map.values()).toEqual([]);
    });
  });

  describe('entries', () => {
    it('should return array of entries', () => {
      map.set(1, 'a');
      map.set(2, 'b');
      const entries = map.entries();
      expect(entries.length).toBe(2);
      expect(entries).toContainEqual([1, 'a']);
      expect(entries).toContainEqual([2, 'b']);
    });

    it('should return empty array for empty map', () => {
      expect(map.entries()).toEqual([]);
    });

    it('should match toArray', () => {
      map.set(1, 'a');
      map.set(2, 'b');
      expect(map.entries()).toEqual(map.toArray());
    });
  });

  describe('capacity', () => {
    it('should return current capacity', () => {
      const customMap = new HashMap2<number, string>({ initialCapacity: 32 });
      expect(customMap.capacity).toBe(32);
    });

    it('should update after growth', () => {
      const smallMap = new HashMap2<number, string>({ initialCapacity: 2, loadFactor: 0.75 });
      expect(smallMap.capacity).toBe(2);
      smallMap.set(1, 'a');
      smallMap.set(2, 'b');
      smallMap.set(3, 'c');
      expect(smallMap.capacity).toBeGreaterThanOrEqual(2);
    });
  });

  describe('loadFactor', () => {
    it('should calculate load factor correctly', () => {
      const customMap = new HashMap2<number, string>({ initialCapacity: 10 });
      customMap.set(1, 'a');
      customMap.set(2, 'b');
      customMap.set(3, 'c');
      expect(customMap.loadFactor).toBeCloseTo(0.3, 0.01);
    });

    it('should return 0 for empty map', () => {
      expect(map.loadFactor).toBe(0);
    });

    it('should return 0 for zero capacity', () => {
      const customMap = new HashMap2<number, string>({ initialCapacity: 0 });
      expect(customMap.loadFactor).toBe(0);
    });
  });

  describe('containsValue', () => {
    it('should return true when value exists', () => {
      map.set(1, 'a');
      map.set(2, 'b');
      expect(map.containsValue('a')).toBe(true);
      expect(map.containsValue('b')).toBe(true);
    });

    it('should return false when value does not exist', () => {
      map.set(1, 'a');
      expect(map.containsValue('b')).toBe(false);
    });

    it('should return false for empty map', () => {
      expect(map.containsValue('a')).toBe(false);
    });

    it('should handle duplicate values', () => {
      map.set(1, 'a');
      map.set(2, 'a');
      expect(map.containsValue('a')).toBe(true);
    });
  });

  describe('keySet', () => {
    it('should return unique keys', () => {
      map.set(1, 'a');
      map.set(2, 'b');
      const keys = map.keySet();
      expect(keys.length).toBe(2);
      expect(keys).toContain(1);
      expect(keys).toContain(2);
    });

    it('should return empty array for empty map', () => {
      expect(map.keySet()).toEqual([]);
    });

    it('should handle object keys', () => {
      const objMap = new HashMap2<{ id: number }, string>();
      objMap.set({ id: 1 }, 'a');
      objMap.set({ id: 2 }, 'b');
      const keys = objMap.keySet();
      expect(keys.length).toBe(2);
    });
  });

  describe('valueSet', () => {
    it('should return unique values', () => {
      map.set(1, 'a');
      map.set(2, 'b');
      map.set(3, 'a');
      const values = map.valueSet();
      expect(values.length).toBe(2);
      expect(values).toContain('a');
      expect(values).toContain('b');
    });

    it('should return empty array for empty map', () => {
      expect(map.valueSet()).toEqual([]);
    });
  });

  describe('merge', () => {
    it('should merge two maps', () => {
      map.set(1, 'a');
      const other = new HashMap2<number, string>();
      other.set(2, 'b');
      other.set(3, 'c');
      const result = map.merge(other);
      expect(result === map).toBe(true);
      expect(map.size).toBe(3);
      expect(map.get(1)).toBe('a');
      expect(map.get(2)).toBe('b');
      expect(map.get(3)).toBe('c');
    });

    it('should update existing keys', () => {
      map.set(1, 'a');
      const other = new HashMap2<number, string>();
      other.set(1, 'updated');
      other.set(2, 'b');
      map.merge(other);
      expect(map.size).toBe(2);
      expect(map.get(1)).toBe('updated');
      expect(map.get(2)).toBe('b');
    });

    it('should merge with empty map', () => {
      map.set(1, 'a');
      const other = new HashMap2<number, string>();
      map.merge(other);
      expect(map.size).toBe(1);
      expect(map.get(1)).toBe('a');
    });

    it('should handle empty source map', () => {
      const other = new HashMap2<number, string>();
      other.set(1, 'a');
      other.set(2, 'b');
      map.merge(other);
      expect(map.size).toBe(2);
    });
  });

  describe('filter', () => {
    it('should filter entries by predicate', () => {
      map.set(1, 'a');
      map.set(2, 'b');
      map.set(3, 'c');
      map.set(4, 'd');
      const filtered = map.filter((value, key) => key % 2 === 0);
      expect(filtered.size).toBe(2);
      expect(filtered.get(2)).toBe('b');
      expect(filtered.get(4)).toBe('d');
    });

    it('should return empty map when no matches', () => {
      map.set(1, 'a');
      map.set(2, 'b');
      const filtered = map.filter(() => false);
      expect(filtered.size).toBe(0);
      expect(filtered.isEmpty).toBe(true);
    });

    it('should return all entries when all match', () => {
      map.set(1, 'a');
      map.set(2, 'b');
      const filtered = map.filter(() => true);
      expect(filtered.size).toBe(2);
      expect(filtered.get(1)).toBe('a');
      expect(filtered.get(2)).toBe('b');
    });

    it('should create independent map', () => {
      map.set(1, 'a');
      const filtered = map.filter(() => true);
      filtered.set(2, 'b');
      expect(map.size).toBe(1);
      expect(filtered.size).toBe(2);
    });
  });

  describe('mapValues', () => {
    it('should map values to new type', () => {
      map.set(1, 'a');
      map.set(2, 'b');
      map.set(3, 'c');
      const mapped = map.mapValues((value, key) => value.toUpperCase());
      expect(mapped.size).toBe(3);
      expect(mapped.get(1)).toBe('A');
      expect(mapped.get(2)).toBe('B');
      expect(mapped.get(3)).toBe('C');
    });

    it('should map numbers to strings', () => {
      const numMap = new HashMap2<number, number>();
      numMap.set(1, 10);
      numMap.set(2, 20);
      const mapped = numMap.mapValues((value) => value * 2);
      expect(mapped.get(1)).toBe(20);
      expect(mapped.get(2)).toBe(40);
    });

    it('should create independent map', () => {
      map.set(1, 'a');
      const mapped = map.mapValues((v) => v);
      mapped.set(2, 'b');
      expect(map.size).toBe(1);
      expect(mapped.size).toBe(2);
    });

    it('should handle empty map', () => {
      const mapped = map.mapValues((v) => v);
      expect(mapped.size).toBe(0);
    });
  });

  describe('equals', () => {
    it('should return true for equal maps', () => {
      const map1 = new HashMap2<number, string>();
      const map2 = new HashMap2<number, string>();
      map1.set(1, 'a');
      map1.set(2, 'b');
      map2.set(1, 'a');
      map2.set(2, 'b');
      expect(map1.equals(map2)).toBe(true);
    });

    it('should return false for different sizes', () => {
      const map1 = new HashMap2<number, string>();
      const map2 = new HashMap2<number, string>();
      map1.set(1, 'a');
      map1.set(2, 'b');
      map2.set(1, 'a');
      expect(map1.equals(map2)).toBe(false);
    });

    it('should return false for different values', () => {
      const map1 = new HashMap2<number, string>();
      const map2 = new HashMap2<number, string>();
      map1.set(1, 'a');
      map1.set(2, 'b');
      map2.set(1, 'a');
      map2.set(2, 'c');
      expect(map1.equals(map2)).toBe(false);
    });

    it('should return true for empty maps', () => {
      const map1 = new HashMap2<number, string>();
      const map2 = new HashMap2<number, string>();
      expect(map1.equals(map2)).toBe(true);
    });

    it('should handle different key ordering', () => {
      const map1 = new HashMap2<number, string>();
      const map2 = new HashMap2<number, string>();
      map1.set(1, 'a');
      map1.set(2, 'b');
      map2.set(2, 'b');
      map2.set(1, 'a');
      expect(map1.equals(map2)).toBe(true);
    });
  });

  describe('resize', () => {
    it('should increase capacity', () => {
      const customMap = new HashMap2<number, string>({ initialCapacity: 4 });
      customMap.set(1, 'a');
      customMap.set(2, 'b');
      customMap.resize(16);
      expect(customMap.capacity).toBe(16);
      expect(customMap.size).toBe(2);
      expect(customMap.get(1)).toBe('a');
      expect(customMap.get(2)).toBe('b');
    });

    it('should decrease capacity to fit elements', () => {
      const customMap = new HashMap2<number, string>({ initialCapacity: 16 });
      customMap.set(1, 'a');
      customMap.set(2, 'b');
      customMap.resize(4);
      expect(customMap.capacity).toBe(4);
      expect(customMap.size).toBe(2);
      expect(customMap.get(1)).toBe('a');
      expect(customMap.get(2)).toBe('b');
    });

    it('should increase if capacity less than size', () => {
      const customMap = new HashMap2<number, string>({ initialCapacity: 8 });
      customMap.set(1, 'a');
      customMap.set(2, 'b');
      customMap.set(3, 'c');
      const sizeBefore = customMap.size;
      customMap.resize(2);
      expect(customMap.capacity).toBeGreaterThanOrEqual(sizeBefore * 2);
    });

    it('should handle empty map', () => {
      map.resize(32);
      expect(map.capacity).toBe(32);
      expect(map.size).toBe(0);
    });
  });

  describe('rehash', () => {
    it('should rehash to same capacity', () => {
      const customMap = new HashMap2<number, string>({ initialCapacity: 16 });
      customMap.set(1, 'a');
      customMap.set(2, 'b');
      customMap.set(3, 'c');
      customMap.rehash();
      expect(customMap.capacity).toBe(16);
      expect(customMap.size).toBe(3);
      expect(customMap.get(1)).toBe('a');
      expect(customMap.get(2)).toBe('b');
      expect(customMap.get(3)).toBe('c');
    });

    it('should work after deletes', () => {
      const customMap = new HashMap2<number, string>({ initialCapacity: 16 });
      customMap.set(1, 'a');
      customMap.set(2, 'b');
      customMap.set(3, 'c');
      customMap.delete(2);
      customMap.rehash();
      expect(customMap.size).toBe(2);
      expect(customMap.get(1)).toBe('a');
      expect(customMap.get(3)).toBe('c');
    });

    it('should handle empty map', () => {
      const customMap = new HashMap2<number, string>({ initialCapacity: 16 });
      customMap.rehash();
      expect(customMap.capacity).toBe(16);
      expect(customMap.size).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle many insertions', () => {
      for (let i = 0; i < 100; i++) {
        map.set(i, `value${i}`);
      }
      expect(map.size).toBe(100);
      expect(map.get(50)).toBe('value50');
      expect(map.get(99)).toBe('value99');
    });

    it('should handle many deletions', () => {
      for (let i = 0; i < 100; i++) {
        map.set(i, `value${i}`);
      }
      for (let i = 0; i < 100; i++) {
        expect(map.delete(i)).toBe(true);
      }
      expect(map.size).toBe(0);
      expect(map.isEmpty).toBe(true);
    });

    it('should handle mixed operations', () => {
      map.set(1, 'a');
      map.set(2, 'b');
      map.delete(1);
      map.set(3, 'c');
      map.set(2, 'updated');
      expect(map.size).toBe(2);
      expect(map.get(2)).toBe('updated');
      expect(map.get(3)).toBe('c');
    });

    it('should handle collisions', () => {
      const collisionMap = new HashMap2<number, string>({ initialCapacity: 4 });
      collisionMap.set(1, 'a');
      collisionMap.set(5, 'b');
      collisionMap.set(9, 'c');
      expect(collisionMap.size).toBe(3);
      expect(collisionMap.get(1)).toBe('a');
      expect(collisionMap.get(5)).toBe('b');
      expect(collisionMap.get(9)).toBe('c');
    });

    it('should handle string and number keys together', () => {
      const mixedMap = new HashMap2<string | number, string>();
      mixedMap.set(1, 'num1');
      mixedMap.set('a', 'str1');
      mixedMap.set(2, 'num2');
      mixedMap.set('b', 'str2');
      expect(mixedMap.size).toBe(4);
      expect(mixedMap.get(1)).toBe('num1');
      expect(mixedMap.get('a')).toBe('str1');
    });
  });
});
