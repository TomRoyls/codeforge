import { describe, it, expect } from 'vitest';
import { ExtendibleHashTable } from '../src/core/extendible-hashing/index.js';

describe('ExtendibleHashTable', () => {
  describe('constructor', () => {
    it('should create empty table with default bucket size', () => {
      const table = new ExtendibleHashTable<string, number>();
      expect(table.size).toBe(0);
      expect(table.isEmpty()).toBe(true);
      const stats = table.getStats();
      expect(stats.globalDepth).toBe(0);
      expect(stats.bucketCount).toBe(1);
      expect(stats.totalEntries).toBe(0);
    });

    it('should create empty table with custom bucket size', () => {
      const table = new ExtendibleHashTable<string, number>({ bucketSize: 8 });
      expect(table.size).toBe(0);
      expect(table.isEmpty()).toBe(true);
      const stats = table.getStats();
      expect(stats.bucketCount).toBe(1);
    });

    it('should accept custom hash function', () => {
      const customHash = (key: string) => key.length;
      const table = new ExtendibleHashTable<string, number>({ hashFunction: customHash });
      table.put('a', 1);
      table.put('ab', 2);
      expect(table.get('a')).toBe(1);
      expect(table.get('ab')).toBe(2);
    });
  });

  describe('size', () => {
    it('should return 0 for empty table', () => {
      const table = new ExtendibleHashTable<string, number>();
      expect(table.size).toBe(0);
    });

    it('should increment on put', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      expect(table.size).toBe(1);
      table.put('b', 2);
      expect(table.size).toBe(2);
    });

    it('should not increment on update', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      expect(table.size).toBe(1);
      table.put('a', 10);
      expect(table.size).toBe(1);
    });

    it('should decrement on delete', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      table.put('b', 2);
      table.delete('a');
      expect(table.size).toBe(1);
    });

    it('should reset to 0 on clear', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      table.put('b', 2);
      table.put('c', 3);
      table.clear();
      expect(table.size).toBe(0);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty table', () => {
      const table = new ExtendibleHashTable<string, number>();
      expect(table.isEmpty()).toBe(true);
    });

    it('should return false after put', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      expect(table.isEmpty()).toBe(false);
    });

    it('should return true after delete of only item', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      table.delete('a');
      expect(table.isEmpty()).toBe(true);
    });

    it('should return true after clear', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      table.put('b', 2);
      table.clear();
      expect(table.isEmpty()).toBe(true);
    });
  });

  describe('put', () => {
    it('should add single entry', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      expect(table.get('a')).toBe(1);
      expect(table.size).toBe(1);
    });

    it('should add multiple entries', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      table.put('b', 2);
      table.put('c', 3);
      expect(table.get('a')).toBe(1);
      expect(table.get('b')).toBe(2);
      expect(table.get('c')).toBe(3);
      expect(table.size).toBe(3);
    });

    it('should update existing key', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      table.put('a', 10);
      expect(table.get('a')).toBe(10);
      expect(table.size).toBe(1);
    });

    it('should handle different value types', () => {
      const table = new ExtendibleHashTable<string, unknown>();
      table.put('string', 'value');
      table.put('number', 42);
      table.put('boolean', true);
      table.put('object', { a: 1 });
      table.put('array', [1, 2, 3]);

      expect(table.get('string')).toBe('value');
      expect(table.get('number')).toBe(42);
      expect(table.get('boolean')).toBe(true);
      expect(table.get('object')).toEqual({ a: 1 });
      expect(table.get('array')).toEqual([1, 2, 3]);
    });

    it('should handle many entries beyond initial bucket', () => {
      const table = new ExtendibleHashTable<string, number>();
      for (let i = 0; i < 20; i++) {
        table.put(`key${i}`, i);
      }
      expect(table.size).toBe(20);
      for (let i = 0; i < 20; i++) {
        expect(table.get(`key${i}`)).toBe(i);
      }
    });

    it('should trigger directory growth', () => {
      const table = new ExtendibleHashTable<string, number>({ bucketSize: 2 });
      table.put('a', 1);
      table.put('b', 2);
      table.put('c', 3);
      const stats = table.getStats();
      expect(stats.globalDepth).toBeGreaterThan(0);
    });

    it('should handle number keys', () => {
      const table = new ExtendibleHashTable<number, string>();
      table.put(1, 'one');
      table.put(2, 'two');
      table.put(3, 'three');
      expect(table.get(1)).toBe('one');
      expect(table.get(2)).toBe('two');
      expect(table.get(3)).toBe('three');
    });
  });

  describe('get', () => {
    it('should return value for existing key', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      expect(table.get('a')).toBe(1);
    });

    it('should return undefined for non-existing key', () => {
      const table = new ExtendibleHashTable<string, number>();
      expect(table.get('a')).toBeUndefined();
    });

    it('should return updated value', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      table.put('a', 10);
      expect(table.get('a')).toBe(10);
    });

    it('should return undefined after delete', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      table.delete('a');
      expect(table.get('a')).toBeUndefined();
    });

    it('should return undefined after clear', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      table.clear();
      expect(table.get('a')).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete existing key and return true', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      expect(table.delete('a')).toBe(true);
      expect(table.get('a')).toBeUndefined();
      expect(table.size).toBe(0);
    });

    it('should return false for non-existing key', () => {
      const table = new ExtendibleHashTable<string, number>();
      expect(table.delete('a')).toBe(false);
    });

    it('should delete multiple keys', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      table.put('b', 2);
      table.put('c', 3);
      expect(table.delete('b')).toBe(true);
      expect(table.delete('c')).toBe(true);
      expect(table.size).toBe(1);
      expect(table.get('a')).toBe(1);
    });

    it('should handle delete of non-existing key from populated table', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      table.put('b', 2);
      expect(table.delete('c')).toBe(false);
      expect(table.size).toBe(2);
    });
  });

  describe('has', () => {
    it('should return true for existing key', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      expect(table.has('a')).toBe(true);
    });

    it('should return false for non-existing key', () => {
      const table = new ExtendibleHashTable<string, number>();
      expect(table.has('a')).toBe(false);
    });

    it('should return false after delete', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      table.delete('a');
      expect(table.has('a')).toBe(false);
    });

    it('should return false after clear', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      table.clear();
      expect(table.has('a')).toBe(false);
    });

    it('should return true after update', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      table.put('a', 10);
      expect(table.has('a')).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear empty table', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.clear();
      expect(table.isEmpty()).toBe(true);
      expect(table.size).toBe(0);
      const stats = table.getStats();
      expect(stats.totalEntries).toBe(0);
    });

    it('should clear single entry', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      table.clear();
      expect(table.isEmpty()).toBe(true);
      expect(table.size).toBe(0);
      expect(table.get('a')).toBeUndefined();
    });

    it('should clear multiple entries', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      table.put('b', 2);
      table.put('c', 3);
      table.clear();
      expect(table.isEmpty()).toBe(true);
      expect(table.size).toBe(0);
      expect(table.get('a')).toBeUndefined();
      expect(table.get('b')).toBeUndefined();
      expect(table.get('c')).toBeUndefined();
    });

    it('should reset directory structure', () => {
      const table = new ExtendibleHashTable<string, number>({ bucketSize: 2 });
      table.put('a', 1);
      table.put('b', 2);
      table.put('c', 3);
      const statsBefore = table.getStats();
      expect(statsBefore.globalDepth).toBeGreaterThan(0);

      table.clear();
      const statsAfter = table.getStats();
      expect(statsAfter.globalDepth).toBe(0);
      expect(statsAfter.bucketCount).toBe(1);
      expect(statsAfter.totalEntries).toBe(0);
    });
  });

  describe('entries', () => {
    it('should return empty iterator for empty table', () => {
      const table = new ExtendibleHashTable<string, number>();
      const entries = Array.from(table.entries());
      expect(entries).toEqual([]);
    });

    it('should return iterator with single entry', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      const entries = Array.from(table.entries());
      expect(entries).toContainEqual(['a', 1]);
      expect(entries.length).toBe(1);
    });

    it('should return iterator with multiple entries', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      table.put('b', 2);
      table.put('c', 3);
      const entries = Array.from(table.entries());
      expect(entries).toContainEqual(['a', 1]);
      expect(entries).toContainEqual(['b', 2]);
      expect(entries).toContainEqual(['c', 3]);
      expect(entries.length).toBe(3);
    });

    it('should not include deleted entries', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      table.put('b', 2);
      table.delete('a');
      const entries = Array.from(table.entries());
      expect(entries).toContainEqual(['b', 2]);
      expect(entries.length).toBe(1);
    });

    it('should not duplicate entries from same bucket', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      table.put('b', 2);
      const entries = Array.from(table.entries());
      const entriesMap = new Map(entries);
      expect(entriesMap.size).toBe(2);
      expect(entries.length).toBe(2);
    });

    it('should reflect updated values', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      table.put('a', 10);
      const entries = Array.from(table.entries());
      expect(entries).toContainEqual(['a', 10]);
      expect(entries.length).toBe(1);
    });
  });

  describe('keys', () => {
    it('should return empty iterator for empty table', () => {
      const table = new ExtendibleHashTable<string, number>();
      const keys = Array.from(table.keys());
      expect(keys).toEqual([]);
    });

    it('should return iterator with single key', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      const keys = Array.from(table.keys());
      expect(keys).toContain('a');
      expect(keys.length).toBe(1);
    });

    it('should return iterator with multiple keys', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      table.put('b', 2);
      table.put('c', 3);
      const keys = Array.from(table.keys());
      expect(keys).toContain('a');
      expect(keys).toContain('b');
      expect(keys).toContain('c');
      expect(keys.length).toBe(3);
    });

    it('should not include deleted keys', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      table.put('b', 2);
      table.delete('a');
      const keys = Array.from(table.keys());
      expect(keys).toContain('b');
      expect(keys).not.toContain('a');
      expect(keys.length).toBe(1);
    });

    it('should not duplicate keys from same bucket', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      table.put('b', 2);
      const keys = Array.from(table.keys());
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(2);
      expect(keys.length).toBe(2);
    });
  });

  describe('values', () => {
    it('should return empty iterator for empty table', () => {
      const table = new ExtendibleHashTable<string, number>();
      const values = Array.from(table.values());
      expect(values).toEqual([]);
    });

    it('should return iterator with single value', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      const values = Array.from(table.values());
      expect(values).toContain(1);
      expect(values.length).toBe(1);
    });

    it('should return iterator with multiple values', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      table.put('b', 2);
      table.put('c', 3);
      const values = Array.from(table.values());
      expect(values).toContain(1);
      expect(values).toContain(2);
      expect(values).toContain(3);
      expect(values.length).toBe(3);
    });

    it('should not include deleted values', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      table.put('b', 2);
      table.delete('a');
      const values = Array.from(table.values());
      expect(values).toContain(2);
      expect(values).not.toContain(1);
      expect(values.length).toBe(1);
    });

    it('should reflect updated values', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      table.put('a', 10);
      const values = Array.from(table.values());
      expect(values).toContain(10);
      expect(values).not.toContain(1);
      expect(values.length).toBe(1);
    });
  });

  describe('forEach', () => {
    it('should iterate over empty table', () => {
      const table = new ExtendibleHashTable<string, number>();
      const entries: [string, number][] = [];
      table.forEach((value, key) => {
        entries.push([key, value]);
      });
      expect(entries).toEqual([]);
    });

    it('should iterate over single entry', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      const entries: [string, number][] = [];
      table.forEach((value, key) => {
        entries.push([key, value]);
      });
      expect(entries).toContainEqual(['a', 1]);
      expect(entries.length).toBe(1);
    });

    it('should iterate over multiple entries', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      table.put('b', 2);
      table.put('c', 3);
      const entries: [string, number][] = [];
      table.forEach((value, key) => {
        entries.push([key, value]);
      });
      expect(entries).toContainEqual(['a', 1]);
      expect(entries).toContainEqual(['b', 2]);
      expect(entries).toContainEqual(['c', 3]);
      expect(entries.length).toBe(3);
    });

    it('should pass table as third argument', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      let receivedTable: ExtendibleHashTable<string, number> | null = null;
      table.forEach((value, key, tbl) => {
        receivedTable = tbl;
      });
      expect(receivedTable).toBe(table);
    });

    it('should not iterate over deleted entries', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      table.put('b', 2);
      table.delete('a');
      const entries: [string, number][] = [];
      table.forEach((value, key) => {
        entries.push([key, value]);
      });
      expect(entries).toContainEqual(['b', 2]);
      expect(entries.length).toBe(1);
    });

    it('should not duplicate entries from same bucket', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      table.put('b', 2);
      const entries: [string, number][] = [];
      table.forEach((value, key) => {
        entries.push([key, value]);
      });
      expect(entries.length).toBe(2);
    });
  });

  describe('getStats', () => {
    it('should return correct stats for empty table', () => {
      const table = new ExtendibleHashTable<string, number>();
      const stats = table.getStats();
      expect(stats.globalDepth).toBe(0);
      expect(stats.bucketCount).toBe(1);
      expect(stats.totalEntries).toBe(0);
      expect(stats.directorySize).toBe(1);
    });

    it('should reflect single entry', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      const stats = table.getStats();
      expect(stats.totalEntries).toBe(1);
    });

    it('should reflect multiple entries', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      table.put('b', 2);
      table.put('c', 3);
      const stats = table.getStats();
      expect(stats.totalEntries).toBe(3);
    });

    it('should reflect directory growth', () => {
      const table = new ExtendibleHashTable<string, number>({ bucketSize: 2 });
      table.put('a', 1);
      table.put('b', 2);
      table.put('c', 3);
      const stats = table.getStats();
      expect(stats.globalDepth).toBeGreaterThan(0);
      expect(stats.directorySize).toBe(1 << stats.globalDepth);
    });

    it('should update after delete', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      table.put('b', 2);
      table.delete('a');
      const stats = table.getStats();
      expect(stats.totalEntries).toBe(1);
    });

    it('should reset after clear', () => {
      const table = new ExtendibleHashTable<string, number>({ bucketSize: 2 });
      table.put('a', 1);
      table.put('b', 2);
      table.put('c', 3);
      table.clear();
      const stats = table.getStats();
      expect(stats.globalDepth).toBe(0);
      expect(stats.bucketCount).toBe(1);
      expect(stats.totalEntries).toBe(0);
      expect(stats.directorySize).toBe(1);
    });

    it('should reflect bucket count correctly', () => {
      const table = new ExtendibleHashTable<string, number>({ bucketSize: 2 });
      table.put('a', 1);
      table.put('b', 2);
      table.put('c', 3);
      const stats = table.getStats();
      expect(stats.bucketCount).toBeGreaterThan(1);
      expect(stats.bucketCount).toBeLessThanOrEqual(stats.directorySize);
    });
  });

  describe('edge cases', () => {
    it('should handle empty string key', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('', 42);
      expect(table.get('')).toBe(42);
      expect(table.has('')).toBe(true);
    });

    it('should handle special characters in keys', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('key with spaces', 1);
      table.put('key-with-special!@#$', 2);
      table.put('key/with/slashes', 3);

      expect(table.get('key with spaces')).toBe(1);
      expect(table.get('key-with-special!@#$')).toBe(2);
      expect(table.get('key/with/slashes')).toBe(3);
    });

    it('should handle long keys', () => {
      const table = new ExtendibleHashTable<string, number>();
      const longKey = 'a'.repeat(1000);
      table.put(longKey, 42);
      expect(table.get(longKey)).toBe(42);
      expect(table.size).toBe(1);
    });

    it('should handle null and undefined values', () => {
      const table = new ExtendibleHashTable<string, unknown>();
      table.put('null', null);
      table.put('undefined', undefined);
      table.put('zero', 0);
      table.put('empty', '');

      expect(table.get('null')).toBeNull();
      expect(table.get('undefined')).toBeUndefined();
      expect(table.get('zero')).toBe(0);
      expect(table.get('empty')).toBe('');
      expect(table.has('null')).toBe(true);
      expect(table.has('undefined')).toBe(true);
      expect(table.has('zero')).toBe(true);
      expect(table.has('empty')).toBe(true);
    });

    it('should handle unicode keys', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('hello', 1);
      table.put('世界', 2);
      table.put('🎉', 3);
      table.put('עברית', 4);

      expect(table.get('hello')).toBe(1);
      expect(table.get('世界')).toBe(2);
      expect(table.get('🎉')).toBe(3);
      expect(table.get('עברית')).toBe(4);
    });

    it('should handle many entries', () => {
      const table = new ExtendibleHashTable<string, number>();
      const count = 100;
      for (let i = 0; i < count; i++) {
        table.put(`key${i}`, i);
      }
      expect(table.size).toBe(count);
      for (let i = 0; i < count; i++) {
        expect(table.get(`key${i}`)).toBe(i);
      }
    });

    it('should handle put after delete', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      table.delete('a');
      table.put('a', 10);
      expect(table.get('a')).toBe(10);
      expect(table.size).toBe(1);
    });

    it('should handle delete non-existent from populated table', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      table.put('b', 2);
      expect(table.delete('c')).toBe(false);
      expect(table.size).toBe(2);
    });

    it('should handle repeated updates', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      table.put('a', 2);
      table.put('a', 3);
      expect(table.get('a')).toBe(3);
      expect(table.size).toBe(1);
    });

    it('should handle iterators after updates', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      table.put('b', 2);
      table.put('a', 10);

      const entries = Array.from(table.entries());
      expect(entries).toContainEqual(['a', 10]);
      expect(entries).toContainEqual(['b', 2]);
      expect(entries.length).toBe(2);
    });

    it('should handle iterators after deletes', () => {
      const table = new ExtendibleHashTable<string, number>();
      table.put('a', 1);
      table.put('b', 2);
      table.put('c', 3);
      table.delete('b');

      const entries = Array.from(table.entries());
      expect(entries.length).toBe(2);
      expect(entries).toContainEqual(['a', 1]);
      expect(entries).toContainEqual(['c', 3]);
    });
  });

  describe('integration', () => {
    it('should maintain consistency through complex operations', () => {
      const table = new ExtendibleHashTable<string, number>({ bucketSize: 2 });

      for (let i = 0; i < 10; i++) {
        table.put(`key${i}`, i);
      }

      expect(table.size).toBe(10);

      for (let i = 0; i < 10; i += 2) {
        table.delete(`key${i}`);
      }

      expect(table.size).toBe(5);

      for (let i = 0; i < 10; i++) {
        if (i % 2 === 0) {
          expect(table.has(`key${i}`)).toBe(false);
        } else {
          expect(table.get(`key${i}`)).toBe(i);
        }
      }
    });

    it('should work with forEach to collect all entries', () => {
      const table = new ExtendibleHashTable<string, number>();
      const entries: [string, number][] = [];

      for (let i = 0; i < 5; i++) {
        table.put(`key${i}`, i * 10);
      }

      table.forEach((value, key) => {
        entries.push([key, value]);
      });

      expect(entries.length).toBe(5);
      expect(entries).toContainEqual(['key0', 0]);
      expect(entries).toContainEqual(['key1', 10]);
      expect(entries).toContainEqual(['key2', 20]);
      expect(entries).toContainEqual(['key3', 30]);
      expect(entries).toContainEqual(['key4', 40]);
    });

    it('should handle rapid growth and shrinkage', () => {
      const table = new ExtendibleHashTable<string, number>({ bucketSize: 2 });

      for (let i = 0; i < 50; i++) {
        table.put(`key${i}`, i);
      }

      expect(table.size).toBe(50);

      for (let i = 0; i < 50; i++) {
        table.delete(`key${i}`);
      }

      expect(table.isEmpty()).toBe(true);
      expect(table.size).toBe(0);

      const stats = table.getStats();
      expect(stats.totalEntries).toBe(0);
    });
  });
});