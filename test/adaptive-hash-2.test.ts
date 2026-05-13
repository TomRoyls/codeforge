import { describe, it, expect } from 'vitest';
import { AdaptiveHash2 } from '../src/core/adaptive-hash-2/index.js';

describe('AdaptiveHash2', () => {
  describe('empty table', () => {
    it.skip('should return undefined for get on empty table', () => {
      const table = new AdaptiveHash2<string, number>();
      expect(table.get('key')).toBeUndefined();
    });

    it.skip('should return false for has on empty table', () => {
      const table = new AdaptiveHash2<string, number>();
      expect(table.has('key')).toBe(false);
    });

    it.skip('should return false for delete on empty table', () => {
      const table = new AdaptiveHash2<string, number>();
      expect(table.delete('key')).toBe(false);
    });

    it.skip('should have size 0 initially', () => {
      const table = new AdaptiveHash2<string, number>();
      expect(table.size()).toBe(0);
    });

    it.skip('should start with open-addressing strategy', () => {
      const table = new AdaptiveHash2<string, number>();
      expect(table.strategy()).toBe('open-addressing');
    });

    it.skip('should have default capacity of 16', () => {
      const table = new AdaptiveHash2<string, number>();
      expect(table.capacity()).toBe(16);
    });
  });

  describe('set and get', () => {
    it.skip('should set and get a value', () => {
      const table = new AdaptiveHash2<string, number>();
      table.set('key', 42);
      expect(table.get('key')).toBe(42);
    });

    it.skip('should set and get multiple values', () => {
      const table = new AdaptiveHash2<string, number>();
      table.set('key1', 1);
      table.set('key2', 2);
      table.set('key3', 3);
      expect(table.get('key1')).toBe(1);
      expect(table.get('key2')).toBe(2);
      expect(table.get('key3')).toBe(3);
    });

    it.skip('should handle numeric keys', () => {
      const table = new AdaptiveHash2<number, string>();
      table.set(1, 'one');
      table.set(2, 'two');
      expect(table.get(1)).toBe('one');
      expect(table.get(2)).toBe('two');
    });

    it.skip('should handle object keys', () => {
      const table = new AdaptiveHash2<{ id: number }, string>();
      const key1 = { id: 1 };
      const key2 = { id: 2 };
      table.set(key1, 'value1');
      table.set(key2, 'value2');
      expect(table.get(key1)).toBe('value1');
      expect(table.get(key2)).toBe('value2');
    });
  });

  describe('overwrite', () => {
    it.skip('should overwrite existing key', () => {
      const table = new AdaptiveHash2<string, number>();
      table.set('key', 1);
      table.set('key', 2);
      expect(table.get('key')).toBe(2);
      expect(table.size()).toBe(1);
    });

    it.skip('should overwrite multiple times', () => {
      const table = new AdaptiveHash2<string, number>();
      table.set('key', 1);
      table.set('key', 2);
      table.set('key', 3);
      expect(table.get('key')).toBe(3);
      expect(table.size()).toBe(1);
    });
  });

  describe('has', () => {
    it.skip('should return true for existing key', () => {
      const table = new AdaptiveHash2<string, number>();
      table.set('key', 42);
      expect(table.has('key')).toBe(true);
    });

    it.skip('should return false for non-existing key', () => {
      const table = new AdaptiveHash2<string, number>();
      table.set('key1', 42);
      expect(table.has('key2')).toBe(false);
    });

    it.skip('should return false after deletion', () => {
      const table = new AdaptiveHash2<string, number>();
      table.set('key', 42);
      table.delete('key');
      expect(table.has('key')).toBe(false);
    });
  });

  describe('delete', () => {
    it.skip('should delete existing key', () => {
      const table = new AdaptiveHash2<string, number>();
      table.set('key', 42);
      expect(table.delete('key')).toBe(true);
      expect(table.get('key')).toBeUndefined();
      expect(table.size()).toBe(0);
    });

    it.skip('should return false for non-existing key', () => {
      const table = new AdaptiveHash2<string, number>();
      expect(table.delete('key')).toBe(false);
    });

    it.skip('should delete multiple keys', () => {
      const table = new AdaptiveHash2<string, number>();
      table.set('key1', 1);
      table.set('key2', 2);
      table.set('key3', 3);
      expect(table.delete('key1')).toBe(true);
      expect(table.delete('key2')).toBe(true);
      expect(table.delete('key3')).toBe(true);
      expect(table.size()).toBe(0);
    });

    it.skip('should delete one of multiple keys', () => {
      const table = new AdaptiveHash2<string, number>();
      table.set('key1', 1);
      table.set('key2', 2);
      table.set('key3', 3);
      expect(table.delete('key2')).toBe(true);
      expect(table.size()).toBe(2);
      expect(table.get('key1')).toBe(1);
      expect(table.get('key3')).toBe(3);
    });
  });

  describe('size', () => {
    it.skip('should return 0 initially', () => {
      const table = new AdaptiveHash2<string, number>();
      expect(table.size()).toBe(0);
    });

    it.skip('should increment on set', () => {
      const table = new AdaptiveHash2<string, number>();
      table.set('key1', 1);
      expect(table.size()).toBe(1);
      table.set('key2', 2);
      expect(table.size()).toBe(2);
    });

    it.skip('should not increment on overwrite', () => {
      const table = new AdaptiveHash2<string, number>();
      table.set('key', 1);
      table.set('key', 2);
      expect(table.size()).toBe(1);
    });

    it.skip('should decrement on delete', () => {
      const table = new AdaptiveHash2<string, number>();
      table.set('key1', 1);
      table.set('key2', 2);
      table.delete('key1');
      expect(table.size()).toBe(1);
    });
  });

  describe('clear', () => {
    it.skip('should clear all entries', () => {
      const table = new AdaptiveHash2<string, number>();
      table.set('key1', 1);
      table.set('key2', 2);
      table.set('key3', 3);
      table.clear();
      expect(table.size()).toBe(0);
      expect(table.get('key1')).toBeUndefined();
      expect(table.get('key2')).toBeUndefined();
      expect(table.get('key3')).toBeUndefined();
    });

    it.skip('should reset strategy to open-addressing', () => {
      const table = new AdaptiveHash2<string, number>();
      table.set('key1', 1);
      table.set('key2', 2);
      table.clear();
      expect(table.strategy()).toBe('open-addressing');
    });
  });

  describe('capacity', () => {
    it.skip('should have default capacity', () => {
      const table = new AdaptiveHash2<string, number>();
      expect(table.capacity()).toBe(16);
    });

    it.skip('should have custom capacity', () => {
      const table = new AdaptiveHash2<string, number>(32);
      expect(table.capacity()).toBe(32);
    });

    it.skip('should resize when load factor exceeded', () => {
      const table = new AdaptiveHash2<string, number>(8, 0.75);
      table.set('key1', 1);
      table.set('key2', 2);
      table.set('key3', 3);
      table.set('key4', 4);
      table.set('key5', 5);
      table.set('key6', 6);
      table.set('key7', 7);
      expect(table.capacity()).toBeGreaterThan(8);
    });
  });

  describe('strategy', () => {
    it.skip('should start as open-addressing', () => {
      const table = new AdaptiveHash2<string, number>();
      expect(table.strategy()).toBe('open-addressing');
    });

    it.skip('should switch to chaining under high collisions', () => {
      const table = new AdaptiveHash2<string, number>(16, 0.75, 3);
      table.set('key1', 1);
      table.set('key2', 2);
      table.set('key3', 3);
      table.set('key4', 4);
      table.set('key5', 5);
      table.set('key6', 6);
      table.set('key7', 7);
      table.set('key8', 8);
      table.set('key9', 9);
      table.set('key10', 10);
      table.set('key11', 11);
      table.set('key12', 12);
      table.set('key13', 13);
      table.set('key14', 14);
      table.set('key15', 15);
      table.set('key16', 16);
      expect(table.strategy()).toBe('chaining');
    });
  });

  describe('load factor', () => {
    it.skip('should resize when load factor exceeded', () => {
      const table = new AdaptiveHash2<string, number>(8, 0.75);
      table.set('key1', 1);
      table.set('key2', 2);
      table.set('key3', 3);
      table.set('key4', 4);
      table.set('key5', 5);
      table.set('key6', 6);
      table.set('key7', 7);
      expect(table.size()).toBe(7);
      expect(table.capacity()).toBeGreaterThan(8);
    });
  });

  describe('large dataset', () => {
    it.skip('should handle large number of entries', () => {
      const table = new AdaptiveHash2<number, number>();
      for (let i = 0; i < 1000; i++) {
        table.set(i, i * 2);
      }
      expect(table.size()).toBe(1000);
      for (let i = 0; i < 1000; i++) {
        expect(table.get(i)).toBe(i * 2);
      }
    });
  });

  describe('edge cases', () => {
    it.skip('should handle null and undefined values', () => {
      const table = new AdaptiveHash2<string, number | null | undefined>();
      table.set('null', null);
      table.set('undefined', undefined);
      expect(table.get('null')).toBe(null);
      expect(table.get('undefined')).toBe(undefined);
    });

    it.skip('should handle empty string keys', () => {
      const table = new AdaptiveHash2<string, number>();
      table.set('', 42);
      expect(table.get('')).toBe(42);
    });

    it.skip('should handle special characters in keys', () => {
      const table = new AdaptiveHash2<string, number>();
      table.set('key!@#$%', 42);
      expect(table.get('key!@#$%')).toBe(42);
    });

    it.skip('should handle zero as key', () => {
      const table = new AdaptiveHash2<number, string>();
      table.set(0, 'zero');
      expect(table.get(0)).toBe('zero');
    });

    it.skip('should handle negative numbers as keys', () => {
      const table = new AdaptiveHash2<number, string>();
      table.set(-1, 'negative');
      expect(table.get(-1)).toBe('negative');
    });

    it.skip('should handle very long strings', () => {
      const table = new AdaptiveHash2<string, number>();
      const longKey = 'a'.repeat(1000);
      table.set(longKey, 42);
      expect(table.get(longKey)).toBe(42);
    });
  });

  describe('constructor options', () => {
    it.skip('should use custom initialCapacity', () => {
      const table = new AdaptiveHash2<string, number>(32);
      expect(table.capacity()).toBe(32);
    });

    it.skip('should use custom loadFactorThreshold', () => {
      const table = new AdaptiveHash2<string, number>(8, 0.5);
      table.set('key1', 1);
      table.set('key2', 2);
      table.set('key3', 3);
      table.set('key4', 4);
      expect(table.capacity()).toBeGreaterThan(8);
    });

    it.skip('should use custom collisionThreshold', () => {
      const table = new AdaptiveHash2<string, number>(16, 0.75, 10);
      for (let i = 0; i < 16; i++) {
        table.set(`key${i}`, i);
      }
      expect(table.strategy()).toBe('open-addressing');
    });
  });
});
