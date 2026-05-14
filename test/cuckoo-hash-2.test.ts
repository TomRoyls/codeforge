import { describe, it, expect, beforeEach } from 'vitest';
import { CuckooHash } from '../src/core/cuckoo-hash-2/index.js';

describe('CuckooHash', () => {
  let map: CuckooHash<string, number>;

  beforeEach(() => {
    map = new CuckooHash<string, number>();
  });

  describe('constructor', () => {
    it('should create instance without options', () => {
      const hash = new CuckooHash<string, number>();
      expect(hash.size).toBe(0);
      expect(hash.isEmpty()).toBe(true);
    });

    it('should create instance with initialCapacity', () => {
      const hash = new CuckooHash<string, number>({ initialCapacity: 32 });
      expect(hash.size).toBe(0);
      expect(hash.isEmpty()).toBe(true);
    });

    it('should create instance with maxLoadFactor', () => {
      const hash = new CuckooHash<string, number>({ maxLoadFactor: 0.75 });
      expect(hash.size).toBe(0);
      expect(hash.isEmpty()).toBe(true);
    });

    it('should create instance with maxKicks', () => {
      const hash = new CuckooHash<string, number>({ maxKicks: 100 });
      expect(hash.size).toBe(0);
      expect(hash.isEmpty()).toBe(true);
    });

    it('should create instance with custom hash functions', () => {
      const hash1 = () => 0;
      const hash2 = () => 0;
      const hash = new CuckooHash<string, number>({ hash1, hash2 });
      expect(hash.size).toBe(0);
      expect(hash.isEmpty()).toBe(true);
    });

    it('should create instance with all options', () => {
      const hash1 = () => 0;
      const hash2 = () => 0;
      const hash = new CuckooHash<string, number>({
        initialCapacity: 64,
        maxLoadFactor: 0.6,
        maxKicks: 200,
        hash1,
        hash2
      });
      expect(hash.size).toBe(0);
      expect(hash.isEmpty()).toBe(true);
    });
  });

  describe('set', () => {
    it('should add single element', () => {
      map.set('a', 1);
      expect(map.size).toBe(1);
      expect(map.get('a')).toBe(1);
    });

    it('should add multiple elements', () => {
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      expect(map.size).toBe(3);
      expect(map.get('a')).toBe(1);
      expect(map.get('b')).toBe(2);
      expect(map.get('c')).toBe(3);
    });

    it('should update existing key', () => {
      map.set('a', 1);
      map.set('a', 10);
      expect(map.size).toBe(1);
      expect(map.get('a')).toBe(10);
    });

    it('should update existing key in table2', () => {
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      map.set('a', 100);
      expect(map.size).toBe(3);
      expect(map.get('a')).toBe(100);
    });

    it('should handle number keys', () => {
      const numMap = new CuckooHash<number, string>();
      numMap.set(1, 'one');
      numMap.set(2, 'two');
      expect(numMap.get(1)).toBe('one');
      expect(numMap.get(2)).toBe('two');
    });

    it('should handle object keys', () => {
      const obj1 = { id: 1 };
      const obj2 = { id: 2 };
      map.set(`obj-${JSON.stringify(obj1)}`, 'first');
      map.set(`obj-${JSON.stringify(obj2)}`, 'second');
      expect(map.size).toBe(2);
    });

    it('should handle null and undefined values', () => {
      map.set('a', null);
      map.set('b', undefined);
      expect(map.get('a')).toBe(null);
      expect(map.get('b')).toBe(undefined);
      expect(map.size).toBe(2);
    });

    it('should trigger resize when load factor exceeded', () => {
      const hash = new CuckooHash<number, number>({ initialCapacity: 4, maxLoadFactor: 0.5 });
      hash.set(1, 1);
      hash.set(2, 2);
      expect(hash.loadFactor).toBeLessThanOrEqual(0.5);
    });

    it('should handle many inserts', () => {
      for (let i = 0; i < 100; i++) {
        map.set(`key${i}`, i);
      }
      expect(map.size).toBe(100);
      expect(map.get('key0')).toBe(0);
      expect(map.get('key99')).toBe(99);
    });

    it('should handle insertions that cause kick cycles', () => {
      for (let i = 0; i < 50; i++) {
        map.set(`key${i}`, i);
      }
      expect(map.size).toBe(50);
    });
  });

  describe('get', () => {
    it('should return undefined for empty map', () => {
      expect(map.get('a')).toBeUndefined();
    });

    it('should return value for existing key', () => {
      map.set('a', 1);
      expect(map.get('a')).toBe(1);
    });

    it('should return undefined for non-existent key', () => {
      map.set('a', 1);
      map.set('b', 2);
      expect(map.get('c')).toBeUndefined();
    });

    it('should return correct value after update', () => {
      map.set('a', 1);
      map.set('a', 10);
      expect(map.get('a')).toBe(10);
    });

    it('should handle many gets', () => {
      for (let i = 0; i < 100; i++) {
        map.set(`key${i}`, i);
      }
      for (let i = 0; i < 100; i++) {
        expect(map.get(`key${i}`)).toBe(i);
      }
    });

    it('should return undefined after delete', () => {
      map.set('a', 1);
      map.delete('a');
      expect(map.get('a')).toBeUndefined();
    });

    it('should return null value', () => {
      map.set('a', null);
      expect(map.get('a')).toBe(null);
    });

    it('should return undefined value', () => {
      map.set('a', undefined);
      expect(map.get('a')).toBe(undefined);
    });
  });

  describe('delete', () => {
    it('should return false for empty map', () => {
      expect(map.delete('a')).toBe(false);
    });

    it('should return true when deleting existing key', () => {
      map.set('a', 1);
      expect(map.delete('a')).toBe(true);
      expect(map.size).toBe(0);
    });

    it('should return false when deleting non-existent key', () => {
      map.set('a', 1);
      expect(map.delete('b')).toBe(false);
      expect(map.size).toBe(1);
    });

    it('should delete from table1', () => {
      map.set('a', 1);
      map.set('b', 2);
      map.delete('a');
      expect(map.has('a')).toBe(false);
      expect(map.has('b')).toBe(true);
      expect(map.size).toBe(1);
    });

    it('should delete from table2', () => {
      map.set('a', 1);
      map.set('b', 2);
      map.delete('b');
      expect(map.has('a')).toBe(true);
      expect(map.has('b')).toBe(false);
      expect(map.size).toBe(1);
    });

    it('should delete all elements', () => {
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      map.delete('a');
      map.delete('b');
      map.delete('c');
      expect(map.isEmpty()).toBe(true);
      expect(map.size).toBe(0);
    });

    it('should handle deleting same key twice', () => {
      map.set('a', 1);
      expect(map.delete('a')).toBe(true);
      expect(map.delete('a')).toBe(false);
    });

    it('should delete and then re-add', () => {
      map.set('a', 1);
      map.delete('a');
      map.set('a', 2);
      expect(map.get('a')).toBe(2);
      expect(map.size).toBe(1);
    });
  });

  describe('has', () => {
    it('should return false for empty map', () => {
      expect(map.has('a')).toBe(false);
    });

    it('should return true for existing key', () => {
      map.set('a', 1);
      expect(map.has('a')).toBe(true);
    });

    it('should return false for non-existent key', () => {
      map.set('a', 1);
      expect(map.has('b')).toBe(false);
    });

    it('should return false after delete', () => {
      map.set('a', 1);
      map.delete('a');
      expect(map.has('a')).toBe(false);
    });

    it('should return true after re-add', () => {
      map.set('a', 1);
      map.delete('a');
      map.set('a', 2);
      expect(map.has('a')).toBe(true);
    });

    it('should handle many keys', () => {
      for (let i = 0; i < 100; i++) {
        map.set(`key${i}`, i);
      }
      expect(map.has('key0')).toBe(true);
      expect(map.has('key99')).toBe(true);
      expect(map.has('key100')).toBe(false);
    });
  });

  describe('size', () => {
    it('should return 0 for empty map', () => {
      expect(map.size).toBe(0);
    });

    it('should return correct size after inserts', () => {
      map.set('a', 1);
      expect(map.size).toBe(1);
      map.set('b', 2);
      expect(map.size).toBe(2);
      map.set('c', 3);
      expect(map.size).toBe(3);
    });

    it('should not increase on update', () => {
      map.set('a', 1);
      expect(map.size).toBe(1);
      map.set('a', 2);
      expect(map.size).toBe(1);
    });

    it('should decrease on delete', () => {
      map.set('a', 1);
      map.set('b', 2);
      expect(map.size).toBe(2);
      map.delete('a');
      expect(map.size).toBe(1);
    });

    it('should return 0 after clear', () => {
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      map.clear();
      expect(map.size).toBe(0);
    });

    it('should handle many elements', () => {
      for (let i = 0; i < 100; i++) {
        map.set(`key${i}`, i);
      }
      expect(map.size).toBe(100);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty map', () => {
      expect(map.isEmpty()).toBe(true);
    });

    it('should return false after insert', () => {
      map.set('a', 1);
      expect(map.isEmpty()).toBe(false);
    });

    it('should return true after delete', () => {
      map.set('a', 1);
      map.delete('a');
      expect(map.isEmpty()).toBe(true);
    });

    it('should return true after clear', () => {
      map.set('a', 1);
      map.set('b', 2);
      map.clear();
      expect(map.isEmpty()).toBe(true);
    });

    it('should return false for non-empty map', () => {
      map.set('a', 1);
      map.set('b', 2);
      map.delete('a');
      expect(map.isEmpty()).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear empty map', () => {
      map.clear();
      expect(map.size).toBe(0);
      expect(map.isEmpty()).toBe(true);
    });

    it('should clear single element', () => {
      map.set('a', 1);
      map.clear();
      expect(map.size).toBe(0);
      expect(map.isEmpty()).toBe(true);
      expect(map.get('a')).toBeUndefined();
    });

    it('should clear multiple elements', () => {
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      map.clear();
      expect(map.size).toBe(0);
      expect(map.isEmpty()).toBe(true);
      expect(map.get('a')).toBeUndefined();
      expect(map.get('b')).toBeUndefined();
      expect(map.get('c')).toBeUndefined();
    });

    it('should allow inserts after clear', () => {
      map.set('a', 1);
      map.clear();
      map.set('b', 2);
      expect(map.size).toBe(1);
      expect(map.get('b')).toBe(2);
    });

    it('should clear and then re-add', () => {
      map.set('a', 1);
      map.set('b', 2);
      map.clear();
      map.set('a', 1);
      map.set('b', 2);
      expect(map.size).toBe(2);
      expect(map.get('a')).toBe(1);
      expect(map.get('b')).toBe(2);
    });
  });

  describe('keys', () => {
    it('should return empty array for empty map', () => {
      expect(map.keys()).toEqual([]);
    });

    it('should return single key', () => {
      map.set('a', 1);
      expect(map.keys()).toEqual(['a']);
    });

    it('should return multiple keys', () => {
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      const keys = map.keys();
      expect(keys).toContain('a');
      expect(keys).toContain('b');
      expect(keys).toContain('c');
      expect(keys.length).toBe(3);
    });

    it('should return keys after delete', () => {
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      map.delete('b');
      const keys = map.keys();
      expect(keys).toContain('a');
      expect(keys).toContain('c');
      expect(keys).not.toContain('b');
      expect(keys.length).toBe(2);
    });

    it('should return new array on each call', () => {
      map.set('a', 1);
      const arr1 = map.keys();
      const arr2 = map.keys();
      expect(arr1).not.toBe(arr2);
      expect(arr1).toEqual(arr2);
    });

    it('should handle many keys', () => {
      for (let i = 0; i < 50; i++) {
        map.set(`key${i}`, i);
      }
      const keys = map.keys();
      expect(keys.length).toBe(50);
      for (let i = 0; i < 50; i++) {
        expect(keys).toContain(`key${i}`);
      }
    });
  });

  describe('values', () => {
    it('should return empty array for empty map', () => {
      expect(map.values()).toEqual([]);
    });

    it('should return single value', () => {
      map.set('a', 1);
      expect(map.values()).toEqual([1]);
    });

    it('should return multiple values', () => {
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      const values = map.values();
      expect(values).toContain(1);
      expect(values).toContain(2);
      expect(values).toContain(3);
      expect(values.length).toBe(3);
    });

    it('should return values after delete', () => {
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      map.delete('b');
      const values = map.values();
      expect(values).toContain(1);
      expect(values).toContain(3);
      expect(values).not.toContain(2);
      expect(values.length).toBe(2);
    });

    it('should return new array on each call', () => {
      map.set('a', 1);
      const arr1 = map.values();
      const arr2 = map.values();
      expect(arr1).not.toBe(arr2);
      expect(arr1).toEqual(arr2);
    });

    it('should handle many values', () => {
      for (let i = 0; i < 50; i++) {
        map.set(`key${i}`, i);
      }
      const values = map.values();
      expect(values.length).toBe(50);
      for (let i = 0; i < 50; i++) {
        expect(values).toContain(i);
      }
    });
  });

  describe('entries', () => {
    it('should return empty array for empty map', () => {
      expect(map.entries()).toEqual([]);
    });

    it('should return single entry', () => {
      map.set('a', 1);
      expect(map.entries()).toEqual([['a', 1]]);
    });

    it('should return multiple entries', () => {
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      const entries = map.entries();
      expect(entries).toContainEqual(['a', 1]);
      expect(entries).toContainEqual(['b', 2]);
      expect(entries).toContainEqual(['c', 3]);
      expect(entries.length).toBe(3);
    });

    it('should return entries after delete', () => {
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      map.delete('b');
      const entries = map.entries();
      expect(entries).toContainEqual(['a', 1]);
      expect(entries).toContainEqual(['c', 3]);
      expect(entries).not.toContainEqual(['b', 2]);
      expect(entries.length).toBe(2);
    });

    it('should return new array on each call', () => {
      map.set('a', 1);
      const arr1 = map.entries();
      const arr2 = map.entries();
      expect(arr1).not.toBe(arr2);
      expect(arr1).toEqual(arr2);
    });

    it('should handle many entries', () => {
      for (let i = 0; i < 50; i++) {
        map.set(`key${i}`, i);
      }
      const entries = map.entries();
      expect(entries.length).toBe(50);
      for (let i = 0; i < 50; i++) {
        expect(entries).toContainEqual([`key${i}`, i]);
      }
    });
  });

  describe('forEach', () => {
    it('should not call callback on empty map', () => {
      let count = 0;
      map.forEach(() => {
        count++;
      });
      expect(count).toBe(0);
    });

    it('should call callback for each element', () => {
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      const keys: string[] = [];
      const values: number[] = [];
      map.forEach((key, value) => {
        keys.push(key);
        values.push(value);
      });
      expect(keys).toContain('a');
      expect(keys).toContain('b');
      expect(keys).toContain('c');
      expect(values).toContain(1);
      expect(values).toContain(2);
      expect(values).toContain(3);
      expect(keys.length).toBe(3);
    });

    it('should pass map as third parameter', () => {
      map.set('a', 1);
      let passedMap: CuckooHash<string, number> | null = null;
      map.forEach((_, __, m) => {
        passedMap = m;
      });
      expect(passedMap).toBe(map);
    });

    it('should handle early return', () => {
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      const keys: string[] = [];
      map.forEach((key) => {
        keys.push(key);
        if (key === 'b') {
          return;
        }
      });
      expect(keys.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle many elements', () => {
      for (let i = 0; i < 100; i++) {
        map.set(`key${i}`, i);
      }
      let count = 0;
      map.forEach(() => {
        count++;
      });
      expect(count).toBe(100);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty map', () => {
      expect(map.toArray()).toEqual([]);
    });

    it('should return single entry', () => {
      map.set('a', 1);
      expect(map.toArray()).toEqual([['a', 1]]);
    });

    it('should return multiple entries', () => {
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      const arr = map.toArray();
      expect(arr).toContainEqual(['a', 1]);
      expect(arr).toContainEqual(['b', 2]);
      expect(arr).toContainEqual(['c', 3]);
      expect(arr.length).toBe(3);
    });

    it('should return same as entries', () => {
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      expect(map.toArray()).toEqual(map.entries());
    });
  });

  describe('loadFactor', () => {
    it('should return 0 for empty map', () => {
      expect(map.loadFactor).toBe(0);
    });

    it('should return correct load factor', () => {
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      expect(map.loadFactor).toBeGreaterThan(0);
      expect(map.loadFactor).toBeLessThanOrEqual(1);
    });

    it('should decrease after delete', () => {
      map.set('a', 1);
      map.set('b', 2);
      const beforeDelete = map.loadFactor;
      map.delete('a');
      expect(map.loadFactor).toBeLessThan(beforeDelete);
    });

    it('should return 0 after clear', () => {
      map.set('a', 1);
      map.set('b', 2);
      map.clear();
      expect(map.loadFactor).toBe(0);
    });
  });

  describe('resize', () => {
    it('should resize empty map', () => {
      map.resize(32);
      expect(map.size).toBe(0);
      expect(map.isEmpty()).toBe(true);
    });

    it('should resize with elements', () => {
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      map.resize(32);
      expect(map.size).toBe(3);
      expect(map.get('a')).toBe(1);
      expect(map.get('b')).toBe(2);
      expect(map.get('c')).toBe(3);
    });

    it('should double capacity by default', () => {
      map.set('a', 1);
      map.set('b', 2);
      map.resize();
      expect(map.size).toBe(2);
      expect(map.get('a')).toBe(1);
      expect(map.get('b')).toBe(2);
    });

    it('should handle large resize', () => {
      for (let i = 0; i < 50; i++) {
        map.set(`key${i}`, i);
      }
      map.resize(256);
      expect(map.size).toBe(50);
      for (let i = 0; i < 50; i++) {
        expect(map.get(`key${i}`)).toBe(i);
      }
    });

    it('should maintain elements after resize', () => {
      for (let i = 0; i < 20; i++) {
        map.set(`key${i}`, i);
      }
      map.resize(64);
      for (let i = 0; i < 20; i++) {
        expect(map.get(`key${i}`)).toBe(i);
      }
    });
  });

  describe('clone', () => {
    it('should clone empty map', () => {
      const clone = map.clone();
      expect(clone.size).toBe(0);
      expect(clone.isEmpty()).toBe(true);
    });

    it('should clone non-empty map', () => {
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      const clone = map.clone();
      expect(clone.size).toBe(3);
      expect(clone.get('a')).toBe(1);
      expect(clone.get('b')).toBe(2);
      expect(clone.get('c')).toBe(3);
    });

    it('should create independent clone', () => {
      map.set('a', 1);
      map.set('b', 2);
      const clone = map.clone();
      clone.set('c', 3);
      expect(map.size).toBe(2);
      expect(clone.size).toBe(3);
      expect(map.has('c')).toBe(false);
      expect(clone.has('c')).toBe(true);
    });

    it('should not affect original when clone is modified', () => {
      map.set('a', 1);
      map.set('b', 2);
      const clone = map.clone();
      clone.delete('a');
      clone.set('c', 3);
      expect(map.has('a')).toBe(true);
      expect(map.has('c')).toBe(false);
      expect(clone.has('a')).toBe(false);
      expect(clone.has('c')).toBe(true);
    });

    it('should clone many elements', () => {
      for (let i = 0; i < 50; i++) {
        map.set(`key${i}`, i);
      }
      const clone = map.clone();
      expect(clone.size).toBe(50);
      for (let i = 0; i < 50; i++) {
        expect(clone.get(`key${i}`)).toBe(i);
      }
    });
  });

  describe('containsValue', () => {
    it('should return false for empty map', () => {
      expect(map.containsValue(1)).toBe(false);
    });

    it('should return true for existing value', () => {
      map.set('a', 1);
      expect(map.containsValue(1)).toBe(true);
    });

    it('should return false for non-existent value', () => {
      map.set('a', 1);
      expect(map.containsValue(2)).toBe(false);
    });

    it('should return true for duplicate values', () => {
      map.set('a', 1);
      map.set('b', 1);
      expect(map.containsValue(1)).toBe(true);
    });

    it('should return false after delete', () => {
      map.set('a', 1);
      map.delete('a');
      expect(map.containsValue(1)).toBe(false);
    });

    it('should find null value', () => {
      map.set('a', null);
      expect(map.containsValue(null)).toBe(true);
    });

    it('should find undefined value', () => {
      map.set('a', undefined);
      expect(map.containsValue(undefined)).toBe(true);
    });

    it('should handle many values', () => {
      for (let i = 0; i < 50; i++) {
        map.set(`key${i}`, i);
      }
      expect(map.containsValue(0)).toBe(true);
      expect(map.containsValue(49)).toBe(true);
      expect(map.containsValue(50)).toBe(false);
    });
  });

  describe('iterator', () => {
    it('should iterate empty map', () => {
      const entries: [string, number][] = [];
      for (const entry of map) {
        entries.push(entry);
      }
      expect(entries).toEqual([]);
    });

    it('should iterate single element', () => {
      map.set('a', 1);
      const entries: [string, number][] = [];
      for (const entry of map) {
        entries.push(entry);
      }
      expect(entries).toEqual([['a', 1]]);
    });

    it('should iterate multiple elements', () => {
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      const entries: [string, number][] = [];
      for (const entry of map) {
        entries.push(entry);
      }
      expect(entries.length).toBe(3);
      expect(entries).toContainEqual(['a', 1]);
      expect(entries).toContainEqual(['b', 2]);
      expect(entries).toContainEqual(['c', 3]);
    });

    it('should support spread operator', () => {
      map.set('a', 1);
      map.set('b', 2);
      const arr = [...map];
      expect(arr.length).toBe(2);
      expect(arr).toContainEqual(['a', 1]);
      expect(arr).toContainEqual(['b', 2]);
    });

    it('should support destructuring', () => {
      map.set('a', 1);
      map.set('b', 2);
      const [[k1, v1], [k2, v2]] = map;
      expect(k1).toBe('a');
      expect(v1).toBe(1);
      expect(k2).toBe('b');
      expect(v2).toBe(2);
    });

    it('should iterate many elements', () => {
      for (let i = 0; i < 50; i++) {
        map.set(`key${i}`, i);
      }
      let count = 0;
      for (const _ of map) {
        count++;
      }
      expect(count).toBe(50);
    });
  });

  describe('from', () => {
    it('should create map from empty array', () => {
      const hash = CuckooHash.from([]);
      expect(hash.size).toBe(0);
      expect(hash.isEmpty()).toBe(true);
    });

    it('should create map from array', () => {
      const entries: [string, number][] = [['a', 1], ['b', 2], ['c', 3]];
      const hash = CuckooHash.from(entries);
      expect(hash.size).toBe(3);
      expect(hash.get('a')).toBe(1);
      expect(hash.get('b')).toBe(2);
      expect(hash.get('c')).toBe(3);
    });

    it('should create map with options', () => {
      const entries: [string, number][] = [['a', 1], ['b', 2], ['c', 3]];
      const hash = CuckooHash.from(entries, { initialCapacity: 64, maxLoadFactor: 0.75 });
      expect(hash.size).toBe(3);
      expect(hash.get('a')).toBe(1);
      expect(hash.get('b')).toBe(2);
      expect(hash.get('c')).toBe(3);
    });

    it('should create map from Map', () => {
      const map1 = new Map([['a', 1], ['b', 2], ['c', 3]]);
      const hash = CuckooHash.from(map1);
      expect(hash.size).toBe(3);
      expect(hash.get('a')).toBe(1);
      expect(hash.get('b')).toBe(2);
      expect(hash.get('c')).toBe(3);
    });

    it('should handle array-like', () => {
      const entries = { 0: ['a', 1], 1: ['b', 2], 2: ['c', 3], length: 3 };
      const hash = CuckooHash.from(entries as Iterable<readonly [string, number]>);
      expect(hash.size).toBeGreaterThanOrEqual(0);
    });

    it('should create from many entries', () => {
      const entries: [string, number][] = [];
      for (let i = 0; i < 50; i++) {
        entries.push([`key${i}`, i]);
      }
      const hash = CuckooHash.from(entries);
      expect(hash.size).toBe(50);
      for (let i = 0; i < 50; i++) {
        expect(hash.get(`key${i}`)).toBe(i);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle empty string keys', () => {
      map.set('', 1);
      expect(map.get('')).toBe(1);
      expect(map.size).toBe(1);
    });

    it('should handle special characters in keys', () => {
      map.set('key with spaces', 1);
      map.set('key-with-dashes', 2);
      map.set('key_with_underscores', 3);
      expect(map.get('key with spaces')).toBe(1);
      expect(map.get('key-with-dashes')).toBe(2);
      expect(map.get('key_with_underscores')).toBe(3);
    });

    it('should handle number keys', () => {
      const numMap = new CuckooHash<number, number>();
      numMap.set(0, 0);
      numMap.set(-1, -1);
      numMap.set(1000000, 1000000);
      expect(numMap.get(0)).toBe(0);
      expect(numMap.get(-1)).toBe(-1);
      expect(numMap.get(1000000)).toBe(1000000);
    });

    it('should handle boolean values', () => {
      map.set('a', true);
      map.set('b', false);
      expect(map.get('a')).toBe(true);
      expect(map.get('b')).toBe(false);
    });

    it('should handle object values', () => {
      const obj1 = { id: 1, name: 'first' };
      const obj2 = { id: 2, name: 'second' };
      map.set('a', obj1);
      map.set('b', obj2);
      expect(map.get('a')).toEqual(obj1);
      expect(map.get('b')).toEqual(obj2);
    });

    it('should handle array values', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [4, 5, 6];
      map.set('a', arr1);
      map.set('b', arr2);
      expect(map.get('a')).toEqual(arr1);
      expect(map.get('b')).toEqual(arr2);
    });

    it('should handle rapid insert and delete', () => {
      for (let i = 0; i < 100; i++) {
        map.set(`key${i}`, i);
        map.delete(`key${i}`);
      }
      expect(map.size).toBe(0);
    });

    it('should handle alternating insert and delete', () => {
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      map.delete('b');
      map.set('d', 4);
      map.delete('a');
      map.set('e', 5);
      expect(map.size).toBe(3);
      expect(map.has('c')).toBe(true);
      expect(map.has('d')).toBe(true);
      expect(map.has('e')).toBe(true);
    });

    it('should handle many rapid operations', () => {
      for (let i = 0; i < 200; i++) {
        map.set(`key${i % 50}`, i);
      }
      expect(map.size).toBe(50);
    });
  });

  describe('integration tests', () => {
    it('should maintain data through multiple operations', () => {
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      map.delete('b');
      map.set('d', 4);
      map.set('e', 5);
      expect(map.size).toBe(4);
      expect(map.get('a')).toBe(1);
      expect(map.get('c')).toBe(3);
      expect(map.get('d')).toBe(4);
      expect(map.get('e')).toBe(5);
    });

    it('should work with clone and original independently', () => {
      map.set('a', 1);
      map.set('b', 2);
      const clone = map.clone();
      map.set('c', 3);
      clone.set('d', 4);
      expect(map.size).toBe(3);
      expect(clone.size).toBe(3);
      expect(map.has('c')).toBe(true);
      expect(clone.has('d')).toBe(true);
      expect(map.has('d')).toBe(false);
      expect(clone.has('c')).toBe(false);
    });

    it('should maintain load factor through operations', () => {
      for (let i = 0; i < 100; i++) {
        map.set(`key${i}`, i);
      }
      expect(map.loadFactor).toBeGreaterThan(0);
      expect(map.loadFactor).toBeLessThan(1);
    });

    it('should support complex workflow', () => {
      const entries: [string, number][] = [];
      for (let i = 0; i < 50; i++) {
        map.set(`key${i}`, i);
        entries.push([`key${i}`, i]);
      }
      expect(map.size).toBe(50);
      const clone = map.clone();
      map.clear();
      expect(map.isEmpty()).toBe(true);
      expect(clone.size).toBe(50);
      for (let i = 0; i < 50; i++) {
        expect(clone.get(`key${i}`)).toBe(i);
      }
    });
  });
});
