import { describe, it, expect } from 'vitest';
import { HashArray2 } from '../src/core/hash-array-2/index.js';

describe('HashArray2', () => {
  describe('constructor', () => {
    it('should create with default size 16', () => {
      const map = new HashArray2<number>();
      expect(map.capacity).toBe(16);
      expect(map.size).toBe(0);
    });

    it('should create with custom size', () => {
      const map = new HashArray2<number>(8);
      expect(map.capacity).toBe(8);
      expect(map.size).toBe(0);
    });
  });

  describe('set and get', () => {
    it('should set and get values', () => {
      const map = new HashArray2<number>();
      expect(map.set('a', 1)).toBe(true);
      expect(map.get('a')).toBe(1);
      expect(map.set('b', 2)).toBe(true);
      expect(map.get('b')).toBe(2);
    });

    it('should overwrite existing key', () => {
      const map = new HashArray2<number>();
      map.set('a', 1);
      expect(map.set('a', 10)).toBe(true);
      expect(map.get('a')).toBe(10);
    });

    it('should return undefined for missing key', () => {
      const map = new HashArray2<number>();
      expect(map.get('missing')).toBeUndefined();
    });
  });

  describe('has', () => {
    it('should return true for existing keys', () => {
      const map = new HashArray2<number>();
      map.set('a', 1);
      map.set('b', 2);
      expect(map.has('a')).toBe(true);
      expect(map.has('b')).toBe(true);
    });

    it('should return false for missing keys', () => {
      const map = new HashArray2<number>();
      map.set('a', 1);
      expect(map.has('b')).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete existing key', () => {
      const map = new HashArray2<number>();
      map.set('a', 1);
      expect(map.delete('a')).toBe(true);
      expect(map.has('a')).toBe(false);
      expect(map.get('a')).toBeUndefined();
    });

    it('should return false for missing key', () => {
      const map = new HashArray2<number>();
      expect(map.delete('missing')).toBe(false);
    });

    it('should decrement size on delete', () => {
      const map = new HashArray2<number>();
      map.set('a', 1);
      map.set('b', 2);
      expect(map.size).toBe(2);
      map.delete('a');
      expect(map.size).toBe(1);
    });
  });

  describe('size', () => {
    it('should track used slots', () => {
      const map = new HashArray2<number>();
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
    it('should return array length', () => {
      const map = new HashArray2<number>(10);
      expect(map.capacity).toBe(10);
    });
  });

  describe('loadFactor', () => {
    it('should calculate load factor correctly', () => {
      const map = new HashArray2<number>(4);
      expect(map.loadFactor()).toBe(0);
      map.set('a', 1);
      expect(map.loadFactor()).toBe(0.25);
      map.set('b', 2);
      expect(map.loadFactor()).toBe(0.5);
      map.set('c', 3);
      expect(map.loadFactor()).toBe(0.75);
      map.set('d', 4);
      expect(map.loadFactor()).toBe(1);
    });
  });

  describe('keys', () => {
    it('should return all keys', () => {
      const map = new HashArray2<number>();
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
      const map = new HashArray2<number>();
      expect(map.keys()).toEqual([]);
    });
  });

  describe('values', () => {
    it('should return all values', () => {
      const map = new HashArray2<number>();
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
      const map = new HashArray2<number>();
      expect(map.values()).toEqual([]);
    });
  });

  describe('entries', () => {
    it('should return all entries', () => {
      const map = new HashArray2<number>();
      map.set('a', 1);
      map.set('b', 2);
      const entries = map.entries();
      expect(entries).toHaveLength(2);
      expect(entries).toContainEqual(['a', 1]);
      expect(entries).toContainEqual(['b', 2]);
    });

    it('should return empty array for empty map', () => {
      const map = new HashArray2<number>();
      expect(map.entries()).toEqual([]);
    });
  });

  describe('clear', () => {
    it('should clear all entries', () => {
      const map = new HashArray2<number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      expect(map.size).toBe(3);
      map.clear();
      expect(map.size).toBe(0);
      expect(map.get('a')).toBeUndefined();
      expect(map.get('b')).toBeUndefined();
      expect(map.get('c')).toBeUndefined();
    });

    it('should reset load factor to 0', () => {
      const map = new HashArray2<number>();
      map.set('a', 1);
      map.set('b', 2);
      expect(map.loadFactor()).toBeGreaterThan(0);
      map.clear();
      expect(map.loadFactor()).toBe(0);
    });
  });

  describe('collision handling (linear probing)', () => {
    it('should handle collisions with linear probing', () => {
      const map = new HashArray2<number>(4);
      map.set('a', 1);
      map.set('e', 5);
      expect(map.get('a')).toBe(1);
      expect(map.get('e')).toBe(5);
    });

    it('should probe multiple slots on collision', () => {
      const map = new HashArray2<number>(4);
      map.set('a', 1);
      map.set('e', 5);
      map.set('i', 9);
      expect(map.size).toBe(3);
      expect(map.get('a')).toBe(1);
      expect(map.get('e')).toBe(5);
      expect(map.get('i')).toBe(9);
    });
  });

  describe('edge cases', () => {
    it('should fail to insert when array is full with different keys', () => {
      const map = new HashArray2<number>(2);
      map.set('a', 1);
      map.set('b', 2);
      expect(map.set('c', 3)).toBe(false);
      expect(map.size).toBe(2);
    });

    it('should handle empty array operations', () => {
      const map = new HashArray2<number>();
      expect(map.has('any')).toBe(false);
      expect(map.delete('any')).toBe(false);
      expect(map.get('any')).toBeUndefined();
      expect(map.keys()).toEqual([]);
      expect(map.values()).toEqual([]);
      expect(map.entries()).toEqual([]);
      expect(map.loadFactor()).toBe(0);
    });

    it('should handle same key overwrite correctly', () => {
      const map = new HashArray2<number>(4);
      map.set('a', 1);
      map.set('e', 5);
      map.set('i', 9);
      expect(map.size).toBe(3);
      expect(map.set('a', 10)).toBe(true);
      expect(map.size).toBe(3);
      expect(map.get('a')).toBe(10);
      expect(map.get('e')).toBe(5);
      expect(map.get('i')).toBe(9);
    });

    it('should handle string keys with special characters', () => {
      const map = new HashArray2<string>();
      map.set('key with spaces', 'value1');
      map.set('key-with-dashes', 'value2');
      map.set('key_with_underscores', 'value3');
      expect(map.get('key with spaces')).toBe('value1');
      expect(map.get('key-with-dashes')).toBe('value2');
      expect(map.get('key_with_underscores')).toBe('value3');
    });

    it('should handle complex values', () => {
      const map = new HashArray2<{ name: string; age: number }>();
      map.set('person1', { name: 'Alice', age: 30 });
      map.set('person2', { name: 'Bob', age: 25 });
      expect(map.get('person1')).toEqual({ name: 'Alice', age: 30 });
      expect(map.get('person2')).toEqual({ name: 'Bob', age: 25 });
    });

    it('should handle delete and re-add', () => {
      const map = new HashArray2<number>();
      map.set('a', 1);
      map.delete('a');
      expect(map.has('a')).toBe(false);
      map.set('a', 2);
      expect(map.get('a')).toBe(2);
    });

    it('should handle has on missing key', () => {
      const map = new HashArray2<number>();
      expect(map.has('missing')).toBe(false);
    });

    it('should handle clear then set', () => {
      const map = new HashArray2<number>();
      map.set('a', 1);
      map.set('b', 2);
      map.clear();
      expect(map.size).toBe(0);
      map.set('c', 3);
      expect(map.get('c')).toBe(3);
      expect(map.size).toBe(1);
    });

    it('should handle entries method', () => {
      const map = new HashArray2<number>();
      map.set('a', 1);
      map.set('b', 2);
      const entries = map.entries();
      expect(entries).toHaveLength(2);
    });

    it('should handle loadFactor', () => {
      const map = new HashArray2<number>();
      expect(typeof map.loadFactor()).toBe('number');
      map.set('a', 1);
      expect(map.loadFactor()).toBeGreaterThan(0);
    });

    it('should handle keys method', () => {
      const map = new HashArray2<number>();
      map.set('a', 1);
      map.set('b', 2);
      const keys = map.keys();
      expect(keys).toContain('a');
      expect(keys).toContain('b');
    });

    it('should handle values method', () => {
      const map = new HashArray2<number>();
      map.set('a', 1);
      map.set('b', 2);
      const vals = map.values();
      expect(vals).toContain(1);
      expect(vals).toContain(2);
    });

    it('should handle keys method', () => {
      const map = new HashArray2<number>();
      map.set('a', 1);
      map.set('b', 2);
      const keys = map.keys();
      expect(keys).toContain('a');
      expect(keys).toContain('b');
    });

    it('should handle delete', () => {
      const map = new HashArray2<number>();
      map.set('a', 1);
      map.set('b', 2);
      expect(map.delete('a')).toBe(true);
      expect(map.has('a')).toBe(false);
      expect(map.size).toBe(1);
    });

    it('should return keys and values', () => {
      const map = new HashArray2<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      expect(map.keys()).toContain('a');
      expect(map.keys()).toContain('b');
      expect(map.values()).toContain(1);
      expect(map.values()).toContain(2);
    });

    it('should handle entries', () => {
      const map = new HashArray2<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      const entries = map.entries();
      expect(entries.length).toBe(2);
    });

    it('should handle clear', () => {
      const map = new HashArray2<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.clear();
      expect(map.size).toBe(0);
    });

    it('should handle has', () => {
      const map = new HashArray2<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      expect(map.has('a')).toBe(true);
      expect(map.has('z')).toBe(false);
    });
  });

  it('should handle loadFactor', () => {
    const map = new HashArray2<string, number>();
    map.set('a', 1);
    map.set('b', 2);
    expect(map.loadFactor()).toBeGreaterThan(0);
  });
  it('should handle keys and values', () => {
    const map = new HashArray2<string>(10);
    map.set('a', 1);
    map.set('b', 2);
    expect(map.keys()).toContain('a');
    expect(map.keys()).toContain('b');
  });
  it('should handle values', () => {
    const map = new HashArray2<string>(10);
    map.set('a', 1);
    map.set('b', 2);
    const vals = map.values();
    expect(vals).toContain(1);
    expect(vals).toContain(2);
  });
  it('should handle loadFactor', () => {
    const map = new HashArray2<string>(10);
    map.set('a', 1);
    expect(map.loadFactor()).toBeGreaterThan(0);
  });
});
