import { describe, it, expect } from 'vitest';
import { CollisionMap2 } from '../src/core/collision-map-2/index.js';

describe('CollisionMap2', () => {
  describe('constructor', () => {
    it('should create map with default 16 buckets', () => {
      const map = new CollisionMap2<string>();
      expect(map.size).toBe(0);
      expect(map.bucketUtilization()).toBe(0);
      expect(map.collisionCount()).toBe(0);
      expect(map.maxChainLength()).toBe(0);
      expect(map.isEmpty()).toBe(true);
    });

    it('should create map with custom bucket count', () => {
      const map = new CollisionMap2<number>(8);
      map.set('key1', 1);
      map.set('key2', 2);
      map.set('key3', 3);
      expect(map.size).toBe(3);
      expect(map.bucketUtilization()).toBeGreaterThan(0);
    });
  });

  describe('set and get', () => {
    it('should set and get values', () => {
      const map = new CollisionMap2<string>();
      map.set('name', 'Alice');
      map.set('age', '30');
      expect(map.get('name')).toBe('Alice');
      expect(map.get('age')).toBe('30');
    });

    it('should update existing key', () => {
      const map = new CollisionMap2<number>();
      map.set('counter', 1);
      map.set('counter', 2);
      map.set('counter', 3);
      expect(map.get('counter')).toBe(3);
      expect(map.size).toBe(1);
    });

    it('should return undefined for non-existent key', () => {
      const map = new CollisionMap2<string>();
      map.set('existing', 'value');
      expect(map.get('nonexistent')).toBeUndefined();
    });

    it('should handle different value types', () => {
      const map = new CollisionMap2<number | string | boolean | null | undefined>();
      map.set('number', 42);
      map.set('string', 'hello');
      map.set('boolean', true);
      map.set('null', null);
      map.set('undefined', undefined);

      expect(map.get('number')).toBe(42);
      expect(map.get('string')).toBe('hello');
      expect(map.get('boolean')).toBe(true);
      expect(map.get('null')).toBe(null);
      expect(map.get('undefined')).toBe(undefined);
    });
  });

  describe('has', () => {
    it('should return true for existing keys', () => {
      const map = new CollisionMap2<number>();
      map.set('a', 1);
      map.set('b', 2);
      expect(map.has('a')).toBe(true);
      expect(map.has('b')).toBe(true);
    });

    it('should return false for non-existent keys', () => {
      const map = new CollisionMap2<string>();
      map.set('exists', 'value');
      expect(map.has('notexists')).toBe(false);
    });

    it('should return false for empty map', () => {
      const map = new CollisionMap2<number>();
      expect(map.has('anything')).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete existing key and return true', () => {
      const map = new CollisionMap2<string>();
      map.set('a', 'value');
      map.set('b', 'value2');
      const result = map.delete('a');
      expect(result).toBe(true);
      expect(map.has('a')).toBe(false);
      expect(map.size).toBe(1);
    });

    it('should return false for non-existent key', () => {
      const map = new CollisionMap2<number>();
      map.set('a', 1);
      const result = map.delete('notexists');
      expect(result).toBe(false);
      expect(map.size).toBe(1);
    });

    it('should delete from middle of chain', () => {
      const map = new CollisionMap2<string>(1);
      map.set('a', 'value1');
      map.set('b', 'value2');
      map.set('c', 'value3');
      map.delete('b');
      expect(map.get('a')).toBe('value1');
      expect(map.get('b')).toBeUndefined();
      expect(map.get('c')).toBe('value3');
    });
  });

  describe('size', () => {
    it('should track size correctly', () => {
      const map = new CollisionMap2<number>();
      expect(map.size).toBe(0);

      map.set('a', 1);
      expect(map.size).toBe(1);

      map.set('b', 2);
      expect(map.size).toBe(2);

      map.set('c', 3);
      expect(map.size).toBe(3);

      map.delete('b');
      expect(map.size).toBe(2);
    });

    it('should count updates as single entry', () => {
      const map = new CollisionMap2<number>();
      map.set('key', 1);
      map.set('key', 2);
      map.set('key', 3);
      expect(map.size).toBe(1);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty map', () => {
      const map = new CollisionMap2<string>();
      expect(map.isEmpty()).toBe(true);
    });

    it('should return false for non-empty map', () => {
      const map = new CollisionMap2<number>();
      map.set('key', 1);
      expect(map.isEmpty()).toBe(false);
    });

    it('should return true after clearing all entries', () => {
      const map = new CollisionMap2<string>();
      map.set('a', 'value');
      map.set('b', 'value2');
      map.clear();
      expect(map.isEmpty()).toBe(true);
    });

    it('should return true after deleting all entries', () => {
      const map = new CollisionMap2<number>();
      map.set('a', 1);
      map.set('b', 2);
      map.delete('a');
      map.delete('b');
      expect(map.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear all entries', () => {
      const map = new CollisionMap2<number>();
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

    it('should reset statistics', () => {
      const map = new CollisionMap2<string>(1);
      map.set('a', 'value1');
      map.set('b', 'value2');
      map.set('c', 'value3');
      map.clear();

      expect(map.collisionCount()).toBe(0);
      expect(map.maxChainLength()).toBe(0);
      expect(map.bucketUtilization()).toBe(0);
    });
  });

  describe('keys', () => {
    it('should return all keys', () => {
      const map = new CollisionMap2<number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);

      const keys = map.keys();
      expect(keys).toContain('a');
      expect(keys).toContain('b');
      expect(keys).toContain('c');
      expect(keys).toHaveLength(3);
    });

    it('should return empty array for empty map', () => {
      const map = new CollisionMap2<string>();
      expect(map.keys()).toEqual([]);
    });
  });

  describe('values', () => {
    it('should return all values', () => {
      const map = new CollisionMap2<number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);

      const values = map.values();
      expect(values).toContain(1);
      expect(values).toContain(2);
      expect(values).toContain(3);
      expect(values).toHaveLength(3);
    });

    it('should return empty array for empty map', () => {
      const map = new CollisionMap2<number>();
      expect(map.values()).toEqual([]);
    });
  });

  describe('entries', () => {
    it('should return all key-value pairs', () => {
      const map = new CollisionMap2<number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);

      const entries = map.entries();
      expect(entries).toContainEqual(['a', 1]);
      expect(entries).toContainEqual(['b', 2]);
      expect(entries).toContainEqual(['c', 3]);
      expect(entries).toHaveLength(3);
    });

    it('should return empty array for empty map', () => {
      const map = new CollisionMap2<number>();
      expect(map.entries()).toEqual([]);
    });
  });

  describe('collisionCount', () => {
    it('should count collisions correctly', () => {
      const map = new CollisionMap2<string>(1);
      map.set('a', 'value1');
      expect(map.collisionCount()).toBe(0);

      map.set('b', 'value2');
      expect(map.collisionCount()).toBe(1);

      map.set('c', 'value3');
      expect(map.collisionCount()).toBe(2);

      map.set('d', 'value4');
      expect(map.collisionCount()).toBe(3);
    });

    it('should not count when updating existing key', () => {
      const map = new CollisionMap2<number>(1);
      map.set('key', 1);
      map.set('key', 2);
      map.set('key', 3);
      expect(map.collisionCount()).toBe(0);
    });

    it('should be zero for empty map', () => {
      const map = new CollisionMap2<string>();
      expect(map.collisionCount()).toBe(0);
    });
  });

  describe('maxChainLength', () => {
    it('should track maximum chain length', () => {
      const map = new CollisionMap2<string>(1);
      map.set('a', 'value1');
      expect(map.maxChainLength()).toBe(1);

      map.set('b', 'value2');
      expect(map.maxChainLength()).toBe(2);

      map.set('c', 'value3');
      expect(map.maxChainLength()).toBe(3);
    });

    it('should update after deletion', () => {
      const map = new CollisionMap2<string>(1);
      map.set('a', 'value1');
      map.set('b', 'value2');
      map.set('c', 'value3');
      map.delete('b');
      expect(map.maxChainLength()).toBe(2);
    });

    it('should be zero for empty map', () => {
      const map = new CollisionMap2<number>();
      expect(map.maxChainLength()).toBe(0);
    });

    it('should be 1 when all keys in different buckets', () => {
      const map = new CollisionMap2<string>(16);
      map.set('a', 'value1');
      map.set('b', 'value2');
      map.set('c', 'value3');
      expect(map.maxChainLength()).toBe(1);
    });
  });

  describe('bucketUtilization', () => {
    it('should calculate utilization correctly', () => {
      const map = new CollisionMap2<string>(4);
      map.set('a', 'value1');
      map.set('b', 'value2');
      const utilization = map.bucketUtilization();
      expect(utilization).toBeGreaterThan(0);
      expect(utilization).toBeLessThanOrEqual(1);
    });

    it('should be 0 for empty map', () => {
      const map = new CollisionMap2<number>();
      expect(map.bucketUtilization()).toBe(0);
    });

    it('should be 1 when all buckets used', () => {
      const map = new CollisionMap2<string>(1);
      map.set('a', 'value1');
      expect(map.bucketUtilization()).toBe(1);
    });
  });

  describe('rehash', () => {
    it('should rehash to larger bucket count', () => {
      const map = new CollisionMap2<string>(2);
      map.set('a', 'value1');
      map.set('b', 'value2');
      map.set('c', 'value3');

      const oldMaxChain = map.maxChainLength();
      map.rehash(8);

      expect(map.size).toBe(3);
      expect(map.get('a')).toBe('value1');
      expect(map.get('b')).toBe('value2');
      expect(map.get('c')).toBe('value3');
      expect(map.maxChainLength()).toBeLessThanOrEqual(oldMaxChain);
    });

    it('should rehash to smaller bucket count', () => {
      const map = new CollisionMap2<string>(16);
      map.set('a', 'value1');
      map.set('b', 'value2');
      map.set('c', 'value3');

      map.rehash(2);

      expect(map.size).toBe(3);
      expect(map.get('a')).toBe('value1');
      expect(map.get('b')).toBe('value2');
      expect(map.get('c')).toBe('value3');
    });

    it('should reset collision statistics', () => {
      const map = new CollisionMap2<string>(1);
      map.set('a', 'value1');
      map.set('b', 'value2');
      map.set('c', 'value3');

      map.rehash(16);

      expect(map.collisionCount()).toBeLessThan(3);
      expect(map.size).toBe(3);
    });

    it('should handle empty map', () => {
      const map = new CollisionMap2<number>();
      map.rehash(32);
      expect(map.size).toBe(0);
      expect(map.isEmpty()).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty map operations', () => {
      const map = new CollisionMap2<string>();
      expect(map.get('key')).toBeUndefined();
      expect(map.has('key')).toBe(false);
      expect(map.delete('key')).toBe(false);
      expect(map.keys()).toEqual([]);
      expect(map.values()).toEqual([]);
      expect(map.entries()).toEqual([]);
    });

    it('should handle many collisions with single bucket', () => {
      const map = new CollisionMap2<number>(1);
      for (let i = 0; i < 100; i++) {
        map.set(`key${i}`, i);
      }

      expect(map.size).toBe(100);
      expect(map.maxChainLength()).toBe(100);
      expect(map.collisionCount()).toBe(99);
      expect(map.bucketUtilization()).toBe(1);

      for (let i = 0; i < 100; i++) {
        expect(map.get(`key${i}`)).toBe(i);
      }
    });

    it('should handle keys with same hash', () => {
      const map = new CollisionMap2<string>(1);
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      map.set('d', 4);

      expect(map.size).toBe(4);
      expect(map.get('a')).toBe(1);
      expect(map.get('b')).toBe(2);
      expect(map.get('c')).toBe(3);
      expect(map.get('d')).toBe(4);
    });

    it('should handle special characters in keys', () => {
      const map = new CollisionMap2<string>();
      map.set('key with spaces', 'value1');
      map.set('key-with-dashes', 'value2');
      map.set('key_with_underscores', 'value3');
      map.set('key.with.dots', 'value4');
      map.set('key@with#special$chars', 'value5');

      expect(map.get('key with spaces')).toBe('value1');
      expect(map.get('key-with-dashes')).toBe('value2');
      expect(map.get('key_with_underscores')).toBe('value3');
      expect(map.get('key.with.dots')).toBe('value4');
      expect(map.get('key@with#special$chars')).toBe('value5');
    });

    it('should handle long keys', () => {
      const map = new CollisionMap2<number>();
      const longKey = 'a'.repeat(1000);
      map.set(longKey, 42);

      expect(map.get(longKey)).toBe(42);
      expect(map.size).toBe(1);
    });

    it('should handle single bucket map', () => {
      const map = new CollisionMap2<string>(1);
      map.set('a', 'value1');
      map.set('b', 'value2');

      expect(map.size).toBe(2);
      expect(map.maxChainLength()).toBe(2);
      expect(map.collisionCount()).toBe(1);
      expect(map.bucketUtilization()).toBe(1);
    });

    it('should maintain consistency after multiple operations', () => {
      const map = new CollisionMap2<number>(4);
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      map.delete('a');
      map.set('d', 4);
      map.set('b', 20);

      expect(map.size).toBe(3);
      expect(map.has('a')).toBe(false);
      expect(map.has('b')).toBe(true);
      expect(map.get('b')).toBe(20);
      expect(map.get('c')).toBe(3);
      expect(map.get('d')).toBe(4);
    });
  });
});
