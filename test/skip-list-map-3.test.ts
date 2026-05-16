import { describe, it, expect } from 'vitest';
import { SkipListMap3 } from '../src/core/skip-list-map-3/index.js';

describe('SkipListMap3', () => {
  describe('constructor', () => {
    it('should create with default maxLevel', () => {
      const map = new SkipListMap3<string>();
      expect(map.size).toBe(0);
      expect(map.isEmpty()).toBe(true);
    });

    it('should create with custom maxLevel', () => {
      const map = new SkipListMap3<number>(8);
      expect(map.size).toBe(0);
      expect(map.isEmpty()).toBe(true);
    });
  });

  describe('set and get', () => {
    it('should set and get values', () => {
      const map = new SkipListMap3<string>();
      map.set(1, 'one');
      map.set(2, 'two');
      map.set(3, 'three');

      expect(map.get(1)).toBe('one');
      expect(map.get(2)).toBe('two');
      expect(map.get(3)).toBe('three');
    });

    it('should return undefined for non-existent keys', () => {
      const map = new SkipListMap3<number>();
      map.set(1, 100);

      expect(map.get(2)).toBeUndefined();
      expect(map.get(999)).toBeUndefined();
    });

    it('should overwrite existing keys', () => {
      const map = new SkipListMap3<number>();
      map.set(1, 100);
      map.set(1, 200);

      expect(map.get(1)).toBe(200);
      expect(map.size).toBe(1);
    });
  });

  describe('has', () => {
    it('should return true for existing keys', () => {
      const map = new SkipListMap3<string>();
      map.set(1, 'one');
      map.set(5, 'five');

      expect(map.has(1)).toBe(true);
      expect(map.has(5)).toBe(true);
    });

    it('should return false for non-existent keys', () => {
      const map = new SkipListMap3<string>();
      map.set(1, 'one');

      expect(map.has(2)).toBe(false);
      expect(map.has(999)).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete existing keys', () => {
      const map = new SkipListMap3<string>();
      map.set(1, 'one');
      map.set(2, 'two');
      map.set(3, 'three');

      expect(map.delete(2)).toBe(true);
      expect(map.has(2)).toBe(false);
      expect(map.size).toBe(2);
    });

    it('should return false for non-existent keys', () => {
      const map = new SkipListMap3<string>();
      map.set(1, 'one');

      expect(map.delete(2)).toBe(false);
      expect(map.size).toBe(1);
    });

    it('should handle multiple deletions', () => {
      const map = new SkipListMap3<number>();
      map.set(1, 100);
      map.set(2, 200);
      map.set(3, 300);

      map.delete(1);
      map.delete(2);
      map.delete(3);

      expect(map.size).toBe(0);
      expect(map.isEmpty()).toBe(true);
    });
  });

  describe('size', () => {
    it('should return correct size', () => {
      const map = new SkipListMap3<number>();
      expect(map.size).toBe(0);

      map.set(1, 100);
      expect(map.size).toBe(1);

      map.set(2, 200);
      expect(map.size).toBe(2);

      map.set(3, 300);
      expect(map.size).toBe(3);
    });

    it('should not increase size on overwrite', () => {
      const map = new SkipListMap3<number>();
      map.set(1, 100);
      map.set(1, 200);
      map.set(1, 300);

      expect(map.size).toBe(1);
    });

    it('should decrease size on delete', () => {
      const map = new SkipListMap3<number>();
      map.set(1, 100);
      map.set(2, 200);
      map.set(3, 300);

      map.delete(2);
      expect(map.size).toBe(2);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty map', () => {
      const map = new SkipListMap3<number>();
      expect(map.isEmpty()).toBe(true);
    });

    it('should return false for non-empty map', () => {
      const map = new SkipListMap3<number>();
      map.set(1, 100);

      expect(map.isEmpty()).toBe(false);
    });

    it('should return true after clearing', () => {
      const map = new SkipListMap3<number>();
      map.set(1, 100);
      map.set(2, 200);

      map.clear();
      expect(map.isEmpty()).toBe(true);
    });

    it('should return true after deleting all', () => {
      const map = new SkipListMap3<number>();
      map.set(1, 100);
      map.set(2, 200);

      map.delete(1);
      map.delete(2);
      expect(map.isEmpty()).toBe(true);
    });
  });

  describe('min', () => {
    it('should return undefined for empty map', () => {
      const map = new SkipListMap3<number>();
      expect(map.min()).toBeUndefined();
    });

    it('should return minimum value', () => {
      const map = new SkipListMap3<number>();
      map.set(5, 500);
      map.set(2, 200);
      map.set(8, 800);
      map.set(1, 100);

      expect(map.min()).toBe(100);
    });

    it('should work with single element', () => {
      const map = new SkipListMap3<string>();
      map.set(1, 'one');

      expect(map.min()).toBe('one');
    });
  });

  describe('max', () => {
    it('should return undefined for empty map', () => {
      const map = new SkipListMap3<number>();
      expect(map.max()).toBeUndefined();
    });

    it('should return maximum value', () => {
      const map = new SkipListMap3<number>();
      map.set(5, 500);
      map.set(2, 200);
      map.set(8, 800);
      map.set(1, 100);

      expect(map.max()).toBe(800);
    });

    it('should work with single element', () => {
      const map = new SkipListMap3<string>();
      map.set(1, 'one');

      expect(map.max()).toBe('one');
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty map', () => {
      const map = new SkipListMap3<number>();
      expect(map.toArray()).toEqual([]);
    });

    it('should return sorted array of key-value pairs', () => {
      const map = new SkipListMap3<number>();
      map.set(3, 300);
      map.set(1, 100);
      map.set(4, 400);
      map.set(2, 200);

      const result = map.toArray();
      expect(result).toEqual([
        [1, 100],
        [2, 200],
        [3, 300],
        [4, 400]
      ]);
    });

    it('should work with string values', () => {
      const map = new SkipListMap3<string>();
      map.set(2, 'two');
      map.set(1, 'one');

      const result = map.toArray();
      expect(result).toEqual([
        [1, 'one'],
        [2, 'two']
      ]);
    });
  });

  describe('clear', () => {
    it('should clear all entries', () => {
      const map = new SkipListMap3<number>();
      map.set(1, 100);
      map.set(2, 200);
      map.set(3, 300);

      map.clear();

      expect(map.size).toBe(0);
      expect(map.isEmpty()).toBe(true);
      expect(map.get(1)).toBeUndefined();
      expect(map.get(2)).toBeUndefined();
      expect(map.get(3)).toBeUndefined();
    });

    it('should allow reuse after clear', () => {
      const map = new SkipListMap3<number>();
      map.set(1, 100);
      map.clear();

      map.set(2, 200);
      map.set(3, 300);

      expect(map.size).toBe(2);
      expect(map.get(2)).toBe(200);
      expect(map.get(3)).toBe(300);
    });
  });

  describe('forEach', () => {
    it('should iterate over all entries in order', () => {
      const map = new SkipListMap3<number>();
      map.set(3, 300);
      map.set(1, 100);
      map.set(2, 200);

      const entries: [number, number][] = [];
      map.forEach((value, key) => {
        entries.push([key, value]);
      });

      expect(entries).toEqual([
        [1, 100],
        [2, 200],
        [3, 300]
      ]);
    });

    it('should not call callback for empty map', () => {
      const map = new SkipListMap3<number>();
      let called = false;

      map.forEach(() => {
        called = true;
      });

      expect(called).toBe(false);
    });

    it('should pass correct value and key', () => {
      const map = new SkipListMap3<string>();
      map.set(1, 'one');
      map.set(2, 'two');

      const results: { key: number; value: string }[] = [];
      map.forEach((value, key) => {
        results.push({ key, value });
      });

      expect(results).toEqual([
        { key: 1, value: 'one' },
        { key: 2, value: 'two' }
      ]);
    });
  });

  describe('range', () => {
    it('should return empty array for empty map', () => {
      const map = new SkipListMap3<number>();
      expect(map.range(1, 10)).toEqual([]);
    });

    it('should return entries in range', () => {
      const map = new SkipListMap3<number>();
      map.set(1, 100);
      map.set(2, 200);
      map.set(3, 300);
      map.set(4, 400);
      map.set(5, 500);

      const result = map.range(2, 4);
      expect(result).toEqual([
        [2, 200],
        [3, 300],
        [4, 400]
      ]);
    });

    it('should include boundaries', () => {
      const map = new SkipListMap3<number>();
      map.set(1, 100);
      map.set(2, 200);
      map.set(3, 300);

      const result = map.range(1, 3);
      expect(result).toEqual([
        [1, 100],
        [2, 200],
        [3, 300]
      ]);
    });

    it('should return empty array when no entries in range', () => {
      const map = new SkipListMap3<number>();
      map.set(1, 100);
      map.set(2, 200);

      const result = map.range(10, 20);
      expect(result).toEqual([]);
    });

    it('should work with string values', () => {
      const map = new SkipListMap3<string>();
      map.set(1, 'one');
      map.set(2, 'two');
      map.set(3, 'three');
      map.set(4, 'four');
      map.set(5, 'five');

      const result = map.range(2, 4);
      expect(result).toEqual([
        [2, 'two'],
        [3, 'three'],
        [4, 'four']
      ]);
    });
  });

  describe('many operations', () => {
    it('should handle many insertions', () => {
      const map = new SkipListMap3<number>();
      const count = 1000;

      for (let i = 0; i < count; i++) {
        map.set(i, i * 10);
      }

      expect(map.size).toBe(count);
      for (let i = 0; i < count; i++) {
        expect(map.get(i)).toBe(i * 10);
      }
    });

    it('should handle many random operations', () => {
      const map = new SkipListMap3<number>();
      const operations = 1000;

      for (let i = 0; i < operations; i++) {
        const key = Math.floor(Math.random() * 100);
        const value = Math.floor(Math.random() * 1000);
        map.set(key, value);
      }

      expect(map.size).toBeGreaterThan(0);
      expect(map.size).toBeLessThanOrEqual(100);
    });

    it('should maintain sorted order after many insertions', () => {
      const map = new SkipListMap3<number>();
      const keys = [5, 2, 8, 1, 9, 3, 7, 4, 6];

      keys.forEach(key => map.set(key, key * 10));

      const arr = map.toArray();
      const sortedKeys = arr.map(([k]) => k);
      expect(sortedKeys).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
  });

  describe('edge cases', () => {
    it('should handle empty list operations', () => {
      const map = new SkipListMap3<string>();

      expect(map.isEmpty()).toBe(true);
      expect(map.size).toBe(0);
      expect(map.get(1)).toBeUndefined();
      expect(map.has(1)).toBe(false);
      expect(map.delete(1)).toBe(false);
      expect(map.min()).toBeUndefined();
      expect(map.max()).toBeUndefined();
      expect(map.toArray()).toEqual([]);
      expect(map.range(1, 10)).toEqual([]);

      let called = false;
      map.forEach(() => {
        called = true;
      });
      expect(called).toBe(false);
    });

    it('should handle single element', () => {
      const map = new SkipListMap3<number>();
      map.set(1, 100);

      expect(map.isEmpty()).toBe(false);
      expect(map.size).toBe(1);
      expect(map.get(1)).toBe(100);
      expect(map.has(1)).toBe(true);
      expect(map.min()).toBe(100);
      expect(map.max()).toBe(100);
      expect(map.toArray()).toEqual([[1, 100]]);
      expect(map.range(1, 1)).toEqual([[1, 100]]);

      let called = false;
      map.forEach((value) => {
        called = true;
        expect(value).toBe(100);
      });
      expect(called).toBe(true);

      expect(map.delete(1)).toBe(true);
      expect(map.isEmpty()).toBe(true);
    });

    it('should handle negative keys', () => {
      const map = new SkipListMap3<number>();
      map.set(-5, -50);
      map.set(-1, -10);
      map.set(0, 0);
      map.set(5, 50);

      expect(map.get(-5)).toBe(-50);
      expect(map.get(-1)).toBe(-10);
      expect(map.get(0)).toBe(0);
      expect(map.get(5)).toBe(50);
    });

    it('should handle zero key', () => {
      const map = new SkipListMap3<number>();
      map.set(0, 100);

      expect(map.get(0)).toBe(100);
      expect(map.has(0)).toBe(true);
      expect(map.min()).toBe(100);
    });

    it('should handle very large keys', () => {
      const map = new SkipListMap3<number>();
      map.set(1000000, 1);
      map.set(999999999, 2);

      expect(map.get(1000000)).toBe(1);
      expect(map.get(999999999)).toBe(2);
    });

    it('should handle has on nonexistent key', () => {
      const map = new SkipListMap3<number>();
      map.set(1, 'a');
      expect(map.has(1)).toBe(true);
      expect(map.has(99)).toBe(false);
    });
    it('should handle delete', () => {
      const map = new SkipListMap3<number, string>();
      map.set(1, 'a');
      map.set(2, 'b');
      expect(map.delete(1)).toBe(true);
      expect(map.has(1)).toBe(false);
    });
    it('should handle size after operations', () => {
      const map = new SkipListMap3<number, string>();
      map.set(1, 'a');
      map.set(2, 'b');
      map.set(3, 'c');
      map.delete(2);
      expect(map.size).toBe(2);
    });
  });
  it('should handle delete nonexistent key', () => {
    const map = new SkipListMap3<number>();
    expect(map.delete(99)).toBe(false);
  });
  it('should handle forEach after clear and re-add', () => {
    const map = new SkipListMap3<number>();
    map.set(1, 10);
    map.set(2, 20);
    map.clear();
    map.set(3, 30);
    const entries: [number, number][] = [];
    map.forEach((value, key) => entries.push([key, value]));
    expect(entries).toEqual([[3, 30]]);
  });
});
