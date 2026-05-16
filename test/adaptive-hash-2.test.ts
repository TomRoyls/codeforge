import { describe, it, expect } from 'vitest';
import { AdaptiveHash2 } from '../src/core/adaptive-hash-2/index.js';

describe('AdaptiveHash2', () => {
  describe('empty table', () => {
    it('should return undefined for get on empty table', () => {
      const table = new AdaptiveHash2<string, number>();
      expect(table.get('key')).toBeUndefined();
    });

    it('should return false for has on empty table', () => {
      const table = new AdaptiveHash2<string, number>();
      expect(table.has('key')).toBe(false);
    });

    it('should return false for delete on empty table', () => {
      const table = new AdaptiveHash2<string, number>();
      expect(table.delete('key')).toBe(false);
    });

    it('should have size 0 initially', () => {
      const table = new AdaptiveHash2<string, number>();
      expect(table.size()).toBe(0);
    });

    it('should start with open-addressing strategy', () => {
      const table = new AdaptiveHash2<string, number>();
      expect(table.strategy()).toBe('open-addressing');
    });

    it('should have default capacity of 16', () => {
      const table = new AdaptiveHash2<string, number>();
      expect(table.capacity()).toBe(16);
    });
  });

  describe('set and get', () => {
    it('should set and get a value', () => {
      const table = new AdaptiveHash2<string, number>();
      table.set('key', 42);
      expect(table.get('key')).toBe(42);
    });

    it('should set and get multiple values', () => {
      const table = new AdaptiveHash2<string, number>();
      table.set('key1', 1);
      table.set('key2', 2);
      table.set('key3', 3);
      expect(table.get('key1')).toBe(1);
      expect(table.get('key2')).toBe(2);
      expect(table.get('key3')).toBe(3);
    });

    it('should handle numeric keys', () => {
      const table = new AdaptiveHash2<number, string>();
      table.set(1, 'one');
      table.set(2, 'two');
      expect(table.get(1)).toBe('one');
      expect(table.get(2)).toBe('two');
    });

    it('should handle object keys', () => {
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
    it('should overwrite existing key', () => {
      const table = new AdaptiveHash2<string, number>();
      table.set('key', 1);
      table.set('key', 2);
      expect(table.get('key')).toBe(2);
      expect(table.size()).toBe(1);
    });

    it('should overwrite multiple times', () => {
      const table = new AdaptiveHash2<string, number>();
      table.set('key', 1);
      table.set('key', 2);
      table.set('key', 3);
      expect(table.get('key')).toBe(3);
      expect(table.size()).toBe(1);
    });
  });

  describe('has', () => {
    it('should return true for existing key', () => {
      const table = new AdaptiveHash2<string, number>();
      table.set('key', 42);
      expect(table.has('key')).toBe(true);
    });

    it('should return false for non-existing key', () => {
      const table = new AdaptiveHash2<string, number>();
      table.set('key1', 42);
      expect(table.has('key2')).toBe(false);
    });

    it('should return false after deletion', () => {
      const table = new AdaptiveHash2<string, number>();
      table.set('key', 42);
      table.delete('key');
      expect(table.has('key')).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete existing key', () => {
      const table = new AdaptiveHash2<string, number>();
      table.set('key', 42);
      expect(table.delete('key')).toBe(true);
      expect(table.get('key')).toBeUndefined();
      expect(table.size()).toBe(0);
    });

    it('should return false for non-existing key', () => {
      const table = new AdaptiveHash2<string, number>();
      expect(table.delete('key')).toBe(false);
    });

    it('should delete multiple keys', () => {
      const table = new AdaptiveHash2<string, number>();
      table.set('key1', 1);
      table.set('key2', 2);
      table.set('key3', 3);
      expect(table.delete('key1')).toBe(true);
      expect(table.delete('key2')).toBe(true);
      expect(table.delete('key3')).toBe(true);
      expect(table.size()).toBe(0);
    });

    it('should delete one of multiple keys', () => {
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
    it('should return 0 initially', () => {
      const table = new AdaptiveHash2<string, number>();
      expect(table.size()).toBe(0);
    });

    it('should increment on set', () => {
      const table = new AdaptiveHash2<string, number>();
      table.set('key1', 1);
      expect(table.size()).toBe(1);
      table.set('key2', 2);
      expect(table.size()).toBe(2);
    });

    it('should not increment on overwrite', () => {
      const table = new AdaptiveHash2<string, number>();
      table.set('key', 1);
      table.set('key', 2);
      expect(table.size()).toBe(1);
    });

    it('should decrement on delete', () => {
      const table = new AdaptiveHash2<string, number>();
      table.set('key1', 1);
      table.set('key2', 2);
      table.delete('key1');
      expect(table.size()).toBe(1);
    });
  });

  describe('clear', () => {
    it('should clear all entries', () => {
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

    it('should reset strategy to open-addressing', () => {
      const table = new AdaptiveHash2<string, number>();
      table.set('key1', 1);
      table.set('key2', 2);
      table.clear();
      expect(table.strategy()).toBe('open-addressing');
    });
  });

  describe('capacity', () => {
    it('should have default capacity', () => {
      const table = new AdaptiveHash2<string, number>();
      expect(table.capacity()).toBe(16);
    });

    it('should have custom capacity', () => {
      const table = new AdaptiveHash2<string, number>(32);
      expect(table.capacity()).toBe(32);
    });

    it('should resize when load factor exceeded', () => {
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
    it('should start as open-addressing', () => {
      const table = new AdaptiveHash2<string, number>();
      expect(table.strategy()).toBe('open-addressing');
    });

    it('should switch to chaining under high collisions', () => {
      const table = new AdaptiveHash2<string, number>(4, 1.0, 3);
      const keys = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
      for (const k of keys) {
        table.set(k, k.length);
      }
      expect(table.strategy()).toBe('chaining');
    });
  });

  describe('load factor', () => {
    it('should resize when load factor exceeded', () => {
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
    it('should handle large number of entries', () => {
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
    it('should handle null and undefined values', () => {
      const table = new AdaptiveHash2<string, number | null | undefined>();
      table.set('null', null);
      table.set('undefined', undefined);
      expect(table.get('null')).toBe(null);
      expect(table.get('undefined')).toBe(undefined);
    });

    it('should handle empty string keys', () => {
      const table = new AdaptiveHash2<string, number>();
      table.set('', 42);
      expect(table.get('')).toBe(42);
    });

    it('should handle special characters in keys', () => {
      const table = new AdaptiveHash2<string, number>();
      table.set('key!@#$%', 42);
      expect(table.get('key!@#$%')).toBe(42);
    });

    it('should handle zero as key', () => {
      const table = new AdaptiveHash2<number, string>();
      table.set(0, 'zero');
      expect(table.get(0)).toBe('zero');
    });

    it('should handle negative numbers as keys', () => {
      const table = new AdaptiveHash2<number, string>();
      table.set(-1, 'negative');
      expect(table.get(-1)).toBe('negative');
    });

    it('should handle very long strings', () => {
      const table = new AdaptiveHash2<string, number>();
      const longKey = 'a'.repeat(1000);
      table.set(longKey, 42);
      expect(table.get(longKey)).toBe(42);
    });
  });

  describe('constructor options', () => {
    it('should use custom initialCapacity', () => {
      const table = new AdaptiveHash2<string, number>(32);
      expect(table.capacity()).toBe(32);
    });

    it('should use custom loadFactorThreshold', () => {
      const table = new AdaptiveHash2<string, number>(8, 0.5);
      table.set('key1', 1);
      table.set('key2', 2);
      table.set('key3', 3);
      table.set('key4', 4);
      table.set('key5', 5);
      expect(table.capacity()).toBeGreaterThan(8);
    });

    it('should use custom collisionThreshold', () => {
      const table = new AdaptiveHash2<string, number>(16, 0.75, 10);
      for (let i = 0; i < 16; i++) {
        table.set(`key${i}`, i);
      }
      expect(table.strategy()).toBe('open-addressing');
    });
  });

  describe('size tracking', () => {
    it('should track size after mixed operations', () => {
      const table = new AdaptiveHash2<string, number>();
      table.set('a', 1);
      table.set('b', 2);
      table.set('c', 3);
      expect(table.size()).toBe(3);
      table.delete('b');
      expect(table.size()).toBe(2);
      table.set('a', 10);
      expect(table.size()).toBe(2);
    });
  });

  it('should handle clear', () => {
    const table = new AdaptiveHash2<string, number>();
    table.set('a', 1);
    table.set('b', 2);
    table.clear();
    expect(table.size()).toBe(0);
    expect(table.get('a')).toBeUndefined();
  });
  it('should handle resize on many inserts', () => {
    const table = new AdaptiveHash2<string, number>();
    for (let i = 0; i < 50; i++) {
      table.set('key' + i, i);
    }
    expect(table.size()).toBe(50);
  });
});
