import { describe, it, expect, beforeEach } from 'vitest';
import { PairingArray } from '../src/core/pairing-array/index.js';

describe('PairingArray', () => {
  let pa: PairingArray<number, string>;

  beforeEach(() => {
    pa = new PairingArray<number, string>();
  });

  describe('constructor', () => {
    it('should create empty pairing array', () => {
      expect(pa.size()).toBe(0);
      expect(pa.isEmpty()).toBe(true);
    });

    it('should create from initial entries', () => {
      const entries = [
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ] as [number, string][];
      const newPa = new PairingArray<number, string>(entries);
      expect(newPa.size()).toBe(3);
      expect(newPa.get(1)).toBe('a');
      expect(newPa.get(2)).toBe('b');
      expect(newPa.get(3)).toBe('c');
    });

    it('should create from empty initial entries', () => {
      const newPa = new PairingArray<number, string>([]);
      expect(newPa.size()).toBe(0);
      expect(newPa.isEmpty()).toBe(true);
    });
  });

  describe('set', () => {
    it('should add new key-value pair', () => {
      pa.set(1, 'a');
      expect(pa.size()).toBe(1);
      expect(pa.get(1)).toBe('a');
    });

    it('should update existing key', () => {
      pa.set(1, 'a');
      pa.set(1, 'updated');
      expect(pa.size()).toBe(1);
      expect(pa.get(1)).toBe('updated');
    });

    it('should maintain insertion order', () => {
      pa.set(3, 'c');
      pa.set(1, 'a');
      pa.set(2, 'b');
      expect(pa.toArray()).toEqual(['c', 'a', 'b']);
    });

    it('should handle string keys', () => {
      const strPa = new PairingArray<string, number>();
      strPa.set('a', 1);
      strPa.set('b', 2);
      expect(strPa.get('a')).toBe(1);
      expect(strPa.get('b')).toBe(2);
    });
  });

  describe('get', () => {
    it('should return value for existing key', () => {
      pa.set(1, 'a');
      expect(pa.get(1)).toBe('a');
    });

    it('should return undefined for non-existent key', () => {
      expect(pa.get(1)).toBe(undefined);
    });

    it('should return undefined for empty pairing array', () => {
      expect(pa.get(1)).toBe(undefined);
    });

    it('should work after multiple operations', () => {
      pa.set(1, 'a');
      pa.set(2, 'b');
      pa.set(3, 'c');
      pa.delete(2);
      expect(pa.get(1)).toBe('a');
      expect(pa.get(2)).toBe(undefined);
      expect(pa.get(3)).toBe('c');
    });
  });

  describe('getAt', () => {
    beforeEach(() => {
      pa.set(1, 'a');
      pa.set(2, 'b');
      pa.set(3, 'c');
    });

    it('should return value at index', () => {
      expect(pa.getAt(0)).toBe('a');
      expect(pa.getAt(1)).toBe('b');
      expect(pa.getAt(2)).toBe('c');
    });

    it('should throw for negative index', () => {
      expect(() => pa.getAt(-1)).toThrow(RangeError);
    });

    it('should throw for index out of bounds', () => {
      expect(() => pa.getAt(3)).toThrow(RangeError);
      expect(() => pa.getAt(100)).toThrow(RangeError);
    });

    it('should maintain correct values after deletions', () => {
      pa.deleteAt(1);
      expect(pa.getAt(0)).toBe('a');
      expect(pa.getAt(1)).toBe('c');
    });
  });

  describe('getKeyAt', () => {
    beforeEach(() => {
      pa.set(1, 'a');
      pa.set(2, 'b');
      pa.set(3, 'c');
    });

    it('should return key at index', () => {
      expect(pa.getKeyAt(0)).toBe(1);
      expect(pa.getKeyAt(1)).toBe(2);
      expect(pa.getKeyAt(2)).toBe(3);
    });

    it('should throw for negative index', () => {
      expect(() => pa.getKeyAt(-1)).toThrow(RangeError);
    });

    it('should throw for index out of bounds', () => {
      expect(() => pa.getKeyAt(3)).toThrow(RangeError);
      expect(() => pa.getKeyAt(100)).toThrow(RangeError);
    });

    it('should maintain correct keys after deletions', () => {
      pa.deleteAt(1);
      expect(pa.getKeyAt(0)).toBe(1);
      expect(pa.getKeyAt(1)).toBe(3);
    });
  });

  describe('has', () => {
    it('should return true for existing key', () => {
      pa.set(1, 'a');
      expect(pa.has(1)).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(pa.has(1)).toBe(false);
    });

    it('should return false for empty pairing array', () => {
      expect(pa.has(1)).toBe(false);
    });

    it('should return false after deletion', () => {
      pa.set(1, 'a');
      pa.delete(1);
      expect(pa.has(1)).toBe(false);
    });

    it('should work with string keys', () => {
      const strPa = new PairingArray<string, number>();
      strPa.set('a', 1);
      expect(strPa.has('a')).toBe(true);
      expect(strPa.has('b')).toBe(false);
    });
  });

  describe('delete', () => {
    it('should remove existing key', () => {
      pa.set(1, 'a');
      pa.set(2, 'b');
      const result = pa.delete(1);
      expect(result).toBe(true);
      expect(pa.size()).toBe(1);
      expect(pa.get(1)).toBe(undefined);
      expect(pa.get(2)).toBe('b');
    });

    it('should return false for non-existent key', () => {
      const result = pa.delete(1);
      expect(result).toBe(false);
      expect(pa.size()).toBe(0);
    });

    it('should handle multiple deletions', () => {
      pa.set(1, 'a');
      pa.set(2, 'b');
      pa.set(3, 'c');
      pa.delete(1);
      pa.delete(3);
      expect(pa.size()).toBe(1);
      expect(pa.get(2)).toBe('b');
    });

    it('should rebuild index correctly', () => {
      pa.set(1, 'a');
      pa.set(2, 'b');
      pa.set(3, 'c');
      pa.delete(2);
      expect(pa.get(1)).toBe('a');
      expect(pa.get(3)).toBe('c');
      expect(pa.indexOf(1)).toBe(0);
      expect(pa.indexOf(3)).toBe(1);
    });
  });

  describe('deleteAt', () => {
    beforeEach(() => {
      pa.set(1, 'a');
      pa.set(2, 'b');
      pa.set(3, 'c');
    });

    it('should remove at beginning', () => {
      const result = pa.deleteAt(0);
      expect(result).toBe(true);
      expect(pa.size()).toBe(2);
      expect(pa.get(1)).toBe(undefined);
      expect(pa.get(2)).toBe('b');
      expect(pa.get(3)).toBe('c');
    });

    it('should remove at end', () => {
      const result = pa.deleteAt(2);
      expect(result).toBe(true);
      expect(pa.size()).toBe(2);
      expect(pa.get(3)).toBe(undefined);
    });

    it('should remove in middle', () => {
      const result = pa.deleteAt(1);
      expect(result).toBe(true);
      expect(pa.size()).toBe(2);
      expect(pa.get(2)).toBe(undefined);
    });

    it('should return false for out of bounds', () => {
      expect(pa.deleteAt(3)).toBe(false);
      expect(pa.deleteAt(100)).toBe(false);
      expect(pa.size()).toBe(3);
    });

    it('should rebuild index correctly', () => {
      pa.deleteAt(1);
      expect(pa.indexOf(1)).toBe(0);
      expect(pa.indexOf(3)).toBe(1);
    });
  });

  describe('indexOf', () => {
    beforeEach(() => {
      pa.set(1, 'a');
      pa.set(2, 'b');
      pa.set(3, 'c');
    });

    it('should return index for existing key', () => {
      expect(pa.indexOf(1)).toBe(0);
      expect(pa.indexOf(2)).toBe(1);
      expect(pa.indexOf(3)).toBe(2);
    });

    it('should return -1 for non-existent key', () => {
      expect(pa.indexOf(4)).toBe(-1);
      expect(pa.indexOf(100)).toBe(-1);
    });

    it('should return -1 for empty pairing array', () => {
      const emptyPa = new PairingArray<number, string>();
      expect(emptyPa.indexOf(1)).toBe(-1);
    });

    it('should work after deletions', () => {
      pa.deleteAt(1);
      expect(pa.indexOf(1)).toBe(0);
      expect(pa.indexOf(3)).toBe(1);
      expect(pa.indexOf(2)).toBe(-1);
    });
  });

  describe('size', () => {
    it('should return 0 for empty pairing array', () => {
      expect(pa.size()).toBe(0);
    });

    it('should track size correctly', () => {
      expect(pa.size()).toBe(0);
      pa.set(1, 'a');
      expect(pa.size()).toBe(1);
      pa.set(2, 'b');
      expect(pa.size()).toBe(2);
      pa.delete(1);
      expect(pa.size()).toBe(1);
    });

    it('should not change on update', () => {
      pa.set(1, 'a');
      expect(pa.size()).toBe(1);
      pa.set(1, 'updated');
      expect(pa.size()).toBe(1);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty pairing array', () => {
      expect(pa.isEmpty()).toBe(true);
    });

    it('should return false for non-empty pairing array', () => {
      pa.set(1, 'a');
      expect(pa.isEmpty()).toBe(false);
    });

    it('should return true after clearing', () => {
      pa.set(1, 'a');
      pa.set(2, 'b');
      pa.clear();
      expect(pa.isEmpty()).toBe(true);
    });

    it('should return true after all deletions', () => {
      pa.set(1, 'a');
      pa.set(2, 'b');
      pa.delete(1);
      pa.delete(2);
      expect(pa.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    beforeEach(() => {
      pa.set(1, 'a');
      pa.set(2, 'b');
      pa.set(3, 'c');
    });

    it('should remove all entries', () => {
      pa.clear();
      expect(pa.size()).toBe(0);
      expect(pa.isEmpty()).toBe(true);
      expect(pa.get(1)).toBe(undefined);
      expect(pa.get(2)).toBe(undefined);
      expect(pa.get(3)).toBe(undefined);
    });

    it('should allow reuse after clear', () => {
      pa.clear();
      pa.set(10, 'x');
      pa.set(20, 'y');
      expect(pa.size()).toBe(2);
      expect(pa.get(10)).toBe('x');
      expect(pa.get(20)).toBe('y');
    });

    it('should clear empty pairing array', () => {
      const emptyPa = new PairingArray<number, string>();
      emptyPa.clear();
      expect(emptyPa.size()).toBe(0);
      expect(emptyPa.isEmpty()).toBe(true);
    });
  });

  describe('keys', () => {
    it('should return array of keys', () => {
      pa.set(1, 'a');
      pa.set(2, 'b');
      pa.set(3, 'c');
      const keys = pa.keys();
      expect(keys).toEqual([1, 2, 3]);
    });

    it('should return empty array for empty pairing array', () => {
      expect(pa.keys()).toEqual([]);
    });

    it('should maintain insertion order', () => {
      pa.set(3, 'c');
      pa.set(1, 'a');
      pa.set(2, 'b');
      expect(pa.keys()).toEqual([3, 1, 2]);
    });

    it('should work after deletions', () => {
      pa.set(1, 'a');
      pa.set(2, 'b');
      pa.set(3, 'c');
      pa.deleteAt(1);
      expect(pa.keys()).toEqual([1, 3]);
    });
  });

  describe('values', () => {
    it('should return array of values', () => {
      pa.set(1, 'a');
      pa.set(2, 'b');
      pa.set(3, 'c');
      const values = pa.values();
      expect(values).toEqual(['a', 'b', 'c']);
    });

    it('should return empty array for empty pairing array', () => {
      expect(pa.values()).toEqual([]);
    });

    it('should maintain insertion order', () => {
      pa.set(3, 'c');
      pa.set(1, 'a');
      pa.set(2, 'b');
      expect(pa.values()).toEqual(['c', 'a', 'b']);
    });

    it('should work after deletions', () => {
      pa.set(1, 'a');
      pa.set(2, 'b');
      pa.set(3, 'c');
      pa.deleteAt(1);
      expect(pa.values()).toEqual(['a', 'c']);
    });
  });

  describe('entries', () => {
    it('should return array of entries', () => {
      pa.set(1, 'a');
      pa.set(2, 'b');
      pa.set(3, 'c');
      const entries = pa.entries();
      expect(entries).toEqual([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ]);
    });

    it('should return empty array for empty pairing array', () => {
      expect(pa.entries()).toEqual([]);
    });

    it('should maintain insertion order', () => {
      pa.set(3, 'c');
      pa.set(1, 'a');
      pa.set(2, 'b');
      expect(pa.entries()).toEqual([
        [3, 'c'],
        [1, 'a'],
        [2, 'b'],
      ]);
    });

    it('should work after deletions', () => {
      pa.set(1, 'a');
      pa.set(2, 'b');
      pa.set(3, 'c');
      pa.deleteAt(1);
      expect(pa.entries()).toEqual([
        [1, 'a'],
        [3, 'c'],
      ]);
    });
  });

  describe('forEach', () => {
    it('should iterate over all entries', () => {
      pa.set(1, 'a');
      pa.set(2, 'b');
      pa.set(3, 'c');
      const keys: number[] = [];
      const values: string[] = [];
      const indices: number[] = [];
      pa.forEach((value, key, index) => {
        keys.push(key);
        values.push(value);
        indices.push(index);
      });
      expect(keys).toEqual([1, 2, 3]);
      expect(values).toEqual(['a', 'b', 'c']);
      expect(indices).toEqual([0, 1, 2]);
    });

    it('should not iterate over empty pairing array', () => {
      let count = 0;
      pa.forEach(() => {
        count++;
      });
      expect(count).toBe(0);
    });

    it('should pass correct parameters', () => {
      pa.set(1, 'a');
      pa.set(2, 'b');
      const result: [number, string, number][] = [];
      pa.forEach((value, key, index) => {
        result.push([key, value, index]);
      });
      expect(result).toEqual([
        [1, 'a', 0],
        [2, 'b', 1],
      ]);
    });

    it('should work after deletions', () => {
      pa.set(1, 'a');
      pa.set(2, 'b');
      pa.set(3, 'c');
      pa.deleteAt(1);
      const keys: number[] = [];
      pa.forEach((value, key) => {
        keys.push(key);
      });
      expect(keys).toEqual([1, 3]);
    });
  });

  describe('iterator', () => {
    it('should support for...of iteration', () => {
      pa.set(1, 'a');
      pa.set(2, 'b');
      pa.set(3, 'c');
      const result: [number, string][] = [];
      for (const [key, value] of pa) {
        result.push([key, value]);
      }
      expect(result).toEqual([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ]);
    });

    it('should support spread operator', () => {
      pa.set(1, 'a');
      pa.set(2, 'b');
      const result = [...pa];
      expect(result).toEqual([
        [1, 'a'],
        [2, 'b'],
      ]);
    });

    it('should iterate over empty pairing array', () => {
      const result = [...pa];
      expect(result).toEqual([]);
    });

    it('should maintain insertion order', () => {
      pa.set(3, 'c');
      pa.set(1, 'a');
      pa.set(2, 'b');
      const result = [...pa];
      expect(result).toEqual([
        [3, 'c'],
        [1, 'a'],
        [2, 'b'],
      ]);
    });
  });

  describe('toArray', () => {
    it('should return array of values', () => {
      pa.set(1, 'a');
      pa.set(2, 'b');
      pa.set(3, 'c');
      const result = pa.toArray();
      expect(result).toEqual(['a', 'b', 'c']);
    });

    it('should return empty array for empty pairing array', () => {
      expect(pa.toArray()).toEqual([]);
    });

    it('should maintain insertion order', () => {
      pa.set(3, 'c');
      pa.set(1, 'a');
      pa.set(2, 'b');
      expect(pa.toArray()).toEqual(['c', 'a', 'b']);
    });
  });

  describe('map', () => {
    it('should map values', () => {
      pa.set(1, 'a');
      pa.set(2, 'b');
      pa.set(3, 'c');
      const result = pa.map((value) => value.toUpperCase());
      expect(result.toArray()).toEqual(['A', 'B', 'C']);
    });

    it('should pass key and index', () => {
      pa.set(1, 10);
      pa.set(2, 20);
      pa.set(3, 30);
      const result = pa.map((value, key, index) => value + key + index);
      expect(result.toArray()).toEqual([11, 23, 35]);
    });

    it('should map to different type', () => {
      const numPa = new PairingArray<number, number>();
      numPa.set(1, 10);
      numPa.set(2, 20);
      const result = numPa.map((value) => String(value));
      expect(result.toArray()).toEqual(['10', '20']);
    });

    it('should create independent pairing array', () => {
      pa.set(1, 'a');
      const result = pa.map((value) => value);
      result.set(2, 'b');
      expect(pa.size()).toBe(1);
      expect(result.size()).toBe(2);
    });

    it('should handle empty pairing array', () => {
      const result = pa.map((value) => value);
      expect(result.size()).toBe(0);
      expect(result.toArray()).toEqual([]);
    });
  });

  describe('filter', () => {
    beforeEach(() => {
      pa.set(1, 'a');
      pa.set(2, 'b');
      pa.set(3, 'c');
      pa.set(4, 'd');
    });

    it('should filter by predicate', () => {
      const result = pa.filter((value) => value === 'a' || value === 'c');
      expect(result.toArray()).toEqual(['a', 'c']);
    });

    it('should pass key and index', () => {
      const result = pa.filter((value, key, index) => key % 2 === 0);
      expect(result.toArray()).toEqual(['b', 'd']);
    });

    it('should return empty when no matches', () => {
      const result = pa.filter((value) => value === 'z');
      expect(result.size()).toBe(0);
      expect(result.toArray()).toEqual([]);
    });

    it('should return all when all match', () => {
      const result = pa.filter(() => true);
      expect(result.size()).toBe(4);
      expect(result.toArray()).toEqual(['a', 'b', 'c', 'd']);
    });

    it('should create independent pairing array', () => {
      const result = pa.filter(() => true);
      result.set(5, 'e');
      expect(pa.size()).toBe(4);
      expect(result.size()).toBe(5);
    });

    it('should handle empty pairing array', () => {
      const emptyPa = new PairingArray<number, string>();
      const result = emptyPa.filter(() => true);
      expect(result.size()).toBe(0);
    });
  });

  describe('find', () => {
    beforeEach(() => {
      pa.set(1, 'a');
      pa.set(2, 'b');
      pa.set(3, 'c');
    });

    it('should find matching value', () => {
      const result = pa.find((value) => value === 'b');
      expect(result).toBe('b');
    });

    it('should return undefined when no match', () => {
      const result = pa.find((value) => value === 'z');
      expect(result).toBe(undefined);
    });

    it('should pass key and index', () => {
      const result = pa.find((value, key, index) => key === 2 && index === 1);
      expect(result).toBe('b');
    });

    it('should return first match', () => {
      const result = pa.find((value) => value.length === 1);
      expect(result).toBe('a');
    });

    it('should return undefined for empty pairing array', () => {
      const emptyPa = new PairingArray<number, string>();
      const result = emptyPa.find(() => true);
      expect(result).toBe(undefined);
    });
  });

  describe('findKey', () => {
    beforeEach(() => {
      pa.set(1, 'a');
      pa.set(2, 'b');
      pa.set(3, 'c');
    });

    it('should find matching key', () => {
      const result = pa.findKey((value) => value === 'b');
      expect(result).toBe(2);
    });

    it('should return undefined when no match', () => {
      const result = pa.findKey((value) => value === 'z');
      expect(result).toBe(undefined);
    });

    it('should pass key and index', () => {
      const result = pa.findKey((value, key, index) => key === 2 && index === 1);
      expect(result).toBe(2);
    });

    it('should return first match', () => {
      const result = pa.findKey((value) => value.length === 1);
      expect(result).toBe(1);
    });

    it('should return undefined for empty pairing array', () => {
      const emptyPa = new PairingArray<number, string>();
      const result = emptyPa.findKey(() => true);
      expect(result).toBe(undefined);
    });
  });

  describe('every', () => {
    it('should return true when all match', () => {
      pa.set(1, 'a');
      pa.set(2, 'b');
      pa.set(3, 'c');
      const result = pa.every((value) => value.length === 1);
      expect(result).toBe(true);
    });

    it('should return false when some do not match', () => {
      pa.set(1, 'a');
      pa.set(2, 'bb');
      pa.set(3, 'c');
      const result = pa.every((value) => value.length === 1);
      expect(result).toBe(false);
    });

    it('should return true for empty pairing array', () => {
      const result = pa.every(() => false);
      expect(result).toBe(true);
    });

    it('should short-circuit', () => {
      pa.set(1, 'a');
      pa.set(2, 'bb');
      pa.set(3, 'c');
      const calls: string[] = [];
      pa.every((value) => {
        calls.push(value);
        return value.length === 1;
      });
      expect(calls).toEqual(['a', 'bb']);
    });

    it('should pass key and index', () => {
      pa.set(1, 'a');
      pa.set(2, 'b');
      const result = pa.every((value, key, index) => key === index + 1);
      expect(result).toBe(true);
    });
  });

  describe('some', () => {
    it('should return true when some match', () => {
      pa.set(1, 'a');
      pa.set(2, 'bb');
      pa.set(3, 'c');
      const result = pa.some((value) => value.length === 2);
      expect(result).toBe(true);
    });

    it('should return false when none match', () => {
      pa.set(1, 'a');
      pa.set(2, 'b');
      pa.set(3, 'c');
      const result = pa.some((value) => value.length === 10);
      expect(result).toBe(false);
    });

    it('should return false for empty pairing array', () => {
      const result = pa.some(() => true);
      expect(result).toBe(false);
    });

    it('should short-circuit', () => {
      pa.set(1, 'a');
      pa.set(2, 'bb');
      pa.set(3, 'c');
      const calls: string[] = [];
      pa.some((value) => {
        calls.push(value);
        return value.length === 2;
      });
      expect(calls).toEqual(['a', 'bb']);
    });

    it('should pass key and index', () => {
      pa.set(1, 'a');
      pa.set(2, 'b');
      pa.set(3, 'c');
      const result = pa.some((value, key, index) => key === 2 && index === 1);
      expect(result).toBe(true);
    });
  });

  describe('reduce', () => {
    beforeEach(() => {
      pa.set(1, 'a');
      pa.set(2, 'b');
      pa.set(3, 'c');
    });

    it('should reduce values', () => {
      const result = pa.reduce((acc, value) => acc + value, '');
      expect(result).toBe('abc');
    });

    it('should use initial value', () => {
      const result = pa.reduce((acc, value) => acc + value.length, 0);
      expect(result).toBe(3);
    });

    it('should pass key and index', () => {
      const result = pa.reduce((acc, value, key, index) => acc + key + index, 0);
      expect(result).toBe(9);
    });

    it('should work with numbers', () => {
      const numPa = new PairingArray<number, number>();
      numPa.set(1, 10);
      numPa.set(2, 20);
      numPa.set(3, 30);
      const result = numPa.reduce((acc, value) => acc + value, 0);
      expect(result).toBe(60);
    });

    it('should handle empty pairing array', () => {
      const emptyPa = new PairingArray<number, number>();
      const result = emptyPa.reduce((acc, value) => acc + value, 100);
      expect(result).toBe(100);
    });
  });

  describe('clone', () => {
    beforeEach(() => {
      pa.set(1, 'a');
      pa.set(2, 'b');
      pa.set(3, 'c');
    });

    it('should create independent copy', () => {
      const clone = pa.clone();
      expect(clone.size()).toBe(3);
      expect(clone.toArray()).toEqual(['a', 'b', 'c']);
      expect(clone.get(1)).toBe('a');
      expect(clone.get(2)).toBe('b');
      expect(clone.get(3)).toBe('c');
    });

    it('should not affect original', () => {
      const clone = pa.clone();
      clone.set(4, 'd');
      clone.delete(1);
      expect(pa.size()).toBe(3);
      expect(clone.size()).toBe(3);
      expect(pa.get(4)).toBe(undefined);
      expect(clone.get(4)).toBe('d');
      expect(pa.get(1)).toBe('a');
      expect(clone.get(1)).toBe(undefined);
    });

    it('should clone empty pairing array', () => {
      const emptyPa = new PairingArray<number, string>();
      const clone = emptyPa.clone();
      expect(clone.size()).toBe(0);
      expect(clone.isEmpty()).toBe(true);
    });

    it('should maintain order', () => {
      const testPa = new PairingArray<number, string>();
      testPa.set(3, 'c');
      testPa.set(1, 'a');
      testPa.set(2, 'b');
      const clone = testPa.clone();
      expect(clone.toArray()).toEqual(['c', 'a', 'b']);
    });
  });

  describe('fromArray static', () => {
    it('should create pairing array from array', () => {
      const entries = [
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ] as [number, string][];
      const newPa = PairingArray.fromArray(entries);
      expect(newPa.size()).toBe(3);
      expect(newPa.toArray()).toEqual(['a', 'b', 'c']);
    });

    it('should create empty pairing array from empty array', () => {
      const newPa = PairingArray.fromArray([]);
      expect(newPa.size()).toBe(0);
      expect(newPa.isEmpty()).toBe(true);
    });

    it('should handle duplicate keys', () => {
      const entries = [
        [1, 'a'],
        [1, 'updated'],
        [2, 'b'],
      ] as [number, string][];
      const newPa = PairingArray.fromArray(entries);
      expect(newPa.size()).toBe(2);
      expect(newPa.get(1)).toBe('updated');
    });

    it('should maintain insertion order', () => {
      const entries = [
        [3, 'c'],
        [1, 'a'],
        [2, 'b'],
      ] as [number, string][];
      const newPa = PairingArray.fromArray(entries);
      expect(newPa.toArray()).toEqual(['c', 'a', 'b']);
    });
  });

  describe('edge cases', () => {
    it('should handle single element', () => {
      pa.set(1, 'a');
      expect(pa.size()).toBe(1);
      expect(pa.isEmpty()).toBe(false);
      expect(pa.get(1)).toBe('a');
      expect(pa.getAt(0)).toBe('a');
      expect(pa.getKeyAt(0)).toBe(1);
    });

    it('should handle many operations', () => {
      for (let i = 0; i < 100; i++) {
        pa.set(i, `value${i}`);
      }
      expect(pa.size()).toBe(100);
      expect(pa.get(50)).toBe('value50');
      expect(pa.get(99)).toBe('value99');

      for (let i = 0; i < 50; i++) {
        pa.delete(i);
      }
      expect(pa.size()).toBe(50);
      expect(pa.get(50)).toBe('value50');
      expect(pa.get(99)).toBe('value99');
    });

    it('should handle string keys and values', () => {
      const strPa = new PairingArray<string, string>();
      strPa.set('a', 'valueA');
      strPa.set('b', 'valueB');
      strPa.set('c', 'valueC');
      expect(strPa.toArray()).toEqual(['valueA', 'valueB', 'valueC']);
      expect(strPa.get('a')).toBe('valueA');
      expect(strPa.get('b')).toBe('valueB');
    });

    it('should handle mixed operations', () => {
      pa.set(1, 'a');
      pa.set(2, 'b');
      pa.set(3, 'c');
      pa.delete(2);
      pa.set(4, 'd');
      expect(pa.toArray()).toEqual(['a', 'c', 'd']);
      expect(pa.indexOf(1)).toBe(0);
      expect(pa.indexOf(3)).toBe(1);
      expect(pa.indexOf(4)).toBe(2);
      expect(pa.getAt(0)).toBe('a');
      expect(pa.getAt(1)).toBe('c');
      expect(pa.getAt(2)).toBe('d');
    });

    it('should handle updating existing keys', () => {
      pa.set(1, 'a');
      pa.set(2, 'b');
      pa.set(1, 'updated');
      pa.set(3, 'c');
      expect(pa.size()).toBe(3);
      expect(pa.toArray()).toEqual(['updated', 'b', 'c']);
      expect(pa.indexOf(1)).toBe(0);
      expect(pa.getAt(0)).toBe('updated');
      expect(pa.getKeyAt(0)).toBe(1);
    });

    it('should handle updating at different positions', () => {
      pa.set(1, 'a');
      pa.set(2, 'b');
      pa.set(3, 'c');
      pa.set(2, 'updated');
      expect(pa.toArray()).toEqual(['a', 'updated', 'c']);
      expect(pa.get(2)).toBe('updated');
      expect(pa.indexOf(2)).toBe(1);
    });
  });
});
