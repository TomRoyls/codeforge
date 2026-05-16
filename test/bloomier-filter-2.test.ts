import { describe, it, expect, beforeEach } from 'vitest';
import { BloomierFilter2 } from '../src/core/bloomier-filter-2/index.js';

describe('BloomierFilter2', () => {
  let filter: BloomierFilter2;

  beforeEach(() => {
    filter = new BloomierFilter2(1000);
  });

  describe('set and get', () => {
    it('should set and retrieve a value', () => {
      filter.set('key1', 42);
      expect(filter.get('key1')).toBe(42);
    });

    it('should return undefined for non-existent key', () => {
      expect(filter.get('nonexistent')).toBeUndefined();
    });

    it('should handle multiple keys', () => {
      filter.set('key1', 1);
      filter.set('key2', 2);
      filter.set('key3', 3);
      expect(filter.get('key1')).toBe(1);
      expect(filter.get('key2')).toBe(2);
      expect(filter.get('key3')).toBe(3);
    });

    it('should overwrite existing key value', () => {
      filter.set('key1', 1);
      filter.set('key1', 2);
      expect(filter.get('key1')).toBe(2);
    });

    it('should handle different values for different keys', () => {
      filter.set('alpha', 100);
      filter.set('beta', 200);
      filter.set('gamma', 300);
      expect(filter.get('alpha')).toBe(100);
      expect(filter.get('beta')).toBe(200);
      expect(filter.get('gamma')).toBe(300);
    });
  });

  describe('has', () => {
    it('should return true for set keys', () => {
      filter.set('key1', 42);
      expect(filter.has('key1')).toBe(true);
    });

    it('should return false for non-existent keys', () => {
      expect(filter.has('nonexistent')).toBe(false);
    });

    it('should work with multiple keys', () => {
      filter.set('key1', 1);
      filter.set('key2', 2);
      expect(filter.has('key1')).toBe(true);
      expect(filter.has('key2')).toBe(true);
      expect(filter.has('key3')).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete existing key and return true', () => {
      filter.set('key1', 42);
      expect(filter.delete('key1')).toBe(true);
      expect(filter.has('key1')).toBe(false);
      expect(filter.get('key1')).toBeUndefined();
    });

    it('should return false for non-existent key', () => {
      expect(filter.delete('nonexistent')).toBe(false);
    });

    it('should decrease size after deletion', () => {
      filter.set('key1', 1);
      filter.set('key2', 2);
      filter.set('key3', 3);
      expect(filter.size).toBe(3);
      filter.delete('key2');
      expect(filter.size).toBe(2);
    });

    it('should handle delete of non-existent key without affecting size', () => {
      filter.set('key1', 1);
      const initialSize = filter.size;
      filter.delete('nonexistent');
      expect(filter.size).toBe(initialSize);
    });
  });

  describe('size', () => {
    it('should return 0 for empty filter', () => {
      expect(filter.size).toBe(0);
    });

    it('should count unique keys', () => {
      filter.set('key1', 1);
      filter.set('key2', 2);
      filter.set('key3', 3);
      expect(filter.size).toBe(3);
    });

    it('should not count duplicate sets', () => {
      filter.set('key1', 1);
      filter.set('key1', 2);
      filter.set('key1', 3);
      expect(filter.size).toBe(1);
    });
  });

  describe('loadFactor', () => {
    it('should return 0 for empty filter', () => {
      expect(filter.loadFactor()).toBe(0);
    });

    it('should calculate load factor correctly', () => {
      filter.set('key1', 1);
      filter.set('key2', 2);
      filter.set('key3', 3);
      expect(filter.loadFactor()).toBe(3 / 1000);
    });

    it('should update load factor after deletion', () => {
      filter.set('key1', 1);
      filter.set('key2', 2);
      filter.delete('key1');
      expect(filter.loadFactor()).toBe(1 / 1000);
    });
  });

  describe('clear', () => {
    it('should clear all entries', () => {
      filter.set('key1', 1);
      filter.set('key2', 2);
      filter.set('key3', 3);
      filter.clear();
      expect(filter.size).toBe(0);
      expect(filter.has('key1')).toBe(false);
      expect(filter.has('key2')).toBe(false);
      expect(filter.has('key3')).toBe(false);
    });

    it('should reset load factor to 0', () => {
      filter.set('key1', 1);
      filter.set('key2', 2);
      filter.clear();
      expect(filter.loadFactor()).toBe(0);
    });

    it('should be safe to clear empty filter', () => {
      filter.clear();
      expect(filter.size).toBe(0);
      expect(filter.loadFactor()).toBe(0);
    });
  });

  describe('custom hashFunctions', () => {
    it('should work with custom number of hash functions', () => {
      const customFilter = new BloomierFilter2(1000, 5);
      customFilter.set('key1', 42);
      expect(customFilter.get('key1')).toBe(42);
    });

    it('should work with 1 hash function', () => {
      const singleHashFilter = new BloomierFilter2(1000, 1);
      singleHashFilter.set('key1', 42);
      expect(singleHashFilter.get('key1')).toBe(42);
    });
  });

  describe('edge cases', () => {
    it('should handle empty string keys', () => {
      filter.set('', 42);
      expect(filter.get('')).toBe(42);
    });

    it('should handle special characters in keys', () => {
      filter.set('key!@#$%', 42);
      expect(filter.get('key!@#$%')).toBe(42);
    });

    it('should handle unicode characters in keys', () => {
      filter.set('café', 42);
      filter.set('日本語', 84);
      expect(filter.get('café')).toBe(42);
      expect(filter.get('日本語')).toBe(84);
    });

    it('should handle very long keys', () => {
      const longKey = 'a'.repeat(10000);
      filter.set(longKey, 42);
      expect(filter.get(longKey)).toBe(42);
    });

    it('should handle zero values', () => {
      filter.set('key1', 0);
      expect(filter.get('key1')).toBe(0);
      expect(filter.has('key1')).toBe(true);
    });

    it('should handle negative values', () => {
      filter.set('key1', -42);
      expect(filter.get('key1')).toBe(-42);
    });

    it('should handle large values', () => {
      filter.set('key1', Number.MAX_SAFE_INTEGER);
      filter.set('key2', Number.MIN_SAFE_INTEGER);
      expect(filter.get('key1')).toBe(Number.MAX_SAFE_INTEGER);
      expect(filter.get('key2')).toBe(Number.MIN_SAFE_INTEGER);
    });
  });

  describe('multiple entries', () => {
    it('should handle many entries efficiently', () => {
      for (let i = 0; i < 100; i++) {
        filter.set(`key${i}`, i);
      }
      expect(filter.size).toBe(100);
      expect(filter.get('key50')).toBe(50);
      expect(filter.get('key99')).toBe(99);
    });

    it('should handle batch operations', () => {
      const entries = Array.from({ length: 50 }, (_, i) => [`key${i}`, i] as const);
      entries.forEach(([key, value]) => filter.set(key, value));
      entries.forEach(([key, value]) => {
        expect(filter.get(key)).toBe(value);
      });
    });

    it('should handle loadFactor', () => {
      const filter = new BloomierFilter2(100, 3);
      expect(typeof filter.loadFactor()).toBe('number');
      expect(filter.loadFactor()).toBeGreaterThanOrEqual(0);
    });

    it('should handle delete', () => {
      const filter = new BloomierFilter2(100, 3);
      filter.set('key', 42);
      expect(filter.delete('key')).toBe(true);
      expect(filter.has('key')).toBe(false);
    });

    it('should handle delete non-existent key', () => {
      const filter = new BloomierFilter2(100, 3);
      expect(filter.delete('nonexistent')).toBe(false);
    });

    it('should handle size tracking', () => {
      const filter = new BloomierFilter2(100, 3);
      expect(filter.size).toBe(0);
      filter.set('a', 1);
      filter.set('b', 2);
      expect(filter.size).toBe(2);
    });

    it('should handle get returning value', () => {
      const filter = new BloomierFilter2(100, 3);
      filter.set('key', 42);
      expect(filter.get('key')).toBe(42);
    });

    it('should handle clear', () => {
      const filter = new BloomierFilter2(100, 3);
      filter.set('key', 42);
      filter.clear();
      expect(filter.size).toBe(0);
    });

    it('should handle get after set', () => {
      const filter = new BloomierFilter2<string>(20);
      filter.set('key1', 'value1');
      expect(filter.get('key1')).toBe('value1');
    });

    it('should handle delete', () => {
      const filter = new BloomierFilter2<string>(20);
      filter.set('key1', 'value1');
      expect(filter.delete('key1')).toBe(true);
      expect(filter.get('key1')).toBeUndefined();
    });

    it('should handle loadFactor', () => {
      const filter = new BloomierFilter2<string>(20);
      filter.set('key1', 'value1');
      expect(filter.loadFactor()).toBeGreaterThan(0);
    });
  });

  it('should handle overwrite value', () => {
    const filter = new BloomierFilter2<string>(100, 3);
    filter.set('key', 'value1');
    expect(filter.get('key')).toBe('value1');
    filter.set('key', 'value2');
    expect(filter.get('key')).toBe('value2');
    expect(filter.size).toBe(1);
  });

  it('should handle has after set', () => {
    const filter = new BloomierFilter2<string>(100, 3);
    filter.set('key', 'value');
    expect(filter.has('key')).toBe(true);
    expect(filter.has('nonexistent')).toBe(false);
  });
  it('should handle delete', () => {
    const filter = new BloomierFilter2(100, 3);
    filter.set('a', 1);
    filter.set('b', 2);
    expect(filter.delete('a')).toBe(true);
    expect(filter.has('a')).toBe(false);
  });
  it('should handle loadFactor', () => {
    const filter = new BloomierFilter2(100, 3);
    filter.set('a', 1);
    expect(filter.loadFactor()).toBeGreaterThan(0);
  });
});
