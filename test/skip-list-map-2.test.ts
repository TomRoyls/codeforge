import { describe, it, expect } from 'vitest';
import { SkipListMap2 } from '../src/core/skip-list-map-2/index.js';

describe('SkipListMap2', () => {
  describe('empty map', () => {
    it('should have size 0', () => {
      const map = new SkipListMap2<number, string>();
      expect(map.size).toBe(0);
    });

    it('should return undefined for get on empty map', () => {
      const map = new SkipListMap2<number, string>();
      expect(map.get(1)).toBeUndefined();
    });

    it('should return false for has on empty map', () => {
      const map = new SkipListMap2<number, string>();
      expect(map.has(1)).toBe(false);
    });

    it('should return undefined for min on empty map', () => {
      const map = new SkipListMap2<number, string>();
      expect(map.min()).toBeUndefined();
    });

    it('should return undefined for max on empty map', () => {
      const map = new SkipListMap2<number, string>();
      expect(map.max()).toBeUndefined();
    });

    it('should return empty array for range on empty map', () => {
      const map = new SkipListMap2<number, string>();
      expect(map.range(1, 10)).toEqual([]);
    });

    it('should return false for delete on empty map', () => {
      const map = new SkipListMap2<number, string>();
      expect(map.delete(1)).toBe(false);
    });
  });

  describe('set and get', () => {
    it('should set and get values correctly', () => {
      const map = new SkipListMap2<number, string>();
      map.set(1, 'one');
      map.set(2, 'two');
      map.set(3, 'three');
      expect(map.get(1)).toBe('one');
      expect(map.get(2)).toBe('two');
      expect(map.get(3)).toBe('three');
    });

    it('should update size when adding items', () => {
      const map = new SkipListMap2<number, string>();
      expect(map.size).toBe(0);
      map.set(1, 'one');
      expect(map.size).toBe(1);
      map.set(2, 'two');
      expect(map.size).toBe(2);
      map.set(3, 'three');
      expect(map.size).toBe(3);
    });
  });

  describe('overwrite', () => {
    it('should overwrite existing value', () => {
      const map = new SkipListMap2<number, string>();
      map.set(1, 'one');
      expect(map.get(1)).toBe('one');
      map.set(1, 'ONE');
      expect(map.get(1)).toBe('ONE');
      expect(map.size).toBe(1);
    });

    it('should overwrite multiple times', () => {
      const map = new SkipListMap2<number, string>();
      map.set(1, 'one');
      map.set(1, 'ONE');
      map.set(1, 'uno');
      expect(map.get(1)).toBe('uno');
      expect(map.size).toBe(1);
    });
  });

  describe('has', () => {
    it('should return true for existing key', () => {
      const map = new SkipListMap2<number, string>();
      map.set(1, 'one');
      map.set(2, 'two');
      map.set(3, 'three');
      expect(map.has(1)).toBe(true);
      expect(map.has(2)).toBe(true);
      expect(map.has(3)).toBe(true);
    });

    it('should return false for non-existing key', () => {
      const map = new SkipListMap2<number, string>();
      map.set(1, 'one');
      map.set(2, 'two');
      expect(map.has(3)).toBe(false);
      expect(map.has(4)).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete existing key and return true', () => {
      const map = new SkipListMap2<number, string>();
      map.set(1, 'one');
      map.set(2, 'two');
      map.set(3, 'three');
      expect(map.size).toBe(3);
      expect(map.delete(2)).toBe(true);
      expect(map.size).toBe(2);
      expect(map.has(2)).toBe(false);
      expect(map.get(2)).toBeUndefined();
    });

    it('should return false when deleting non-existing key', () => {
      const map = new SkipListMap2<number, string>();
      map.set(1, 'one');
      expect(map.delete(2)).toBe(false);
      expect(map.size).toBe(1);
    });

    it('should delete from beginning', () => {
      const map = new SkipListMap2<number, string>();
      map.set(1, 'one');
      map.set(2, 'two');
      map.set(3, 'three');
      expect(map.delete(1)).toBe(true);
      expect(map.size).toBe(2);
      expect(map.has(1)).toBe(false);
    });

    it('should delete from end', () => {
      const map = new SkipListMap2<number, string>();
      map.set(1, 'one');
      map.set(2, 'two');
      map.set(3, 'three');
      expect(map.delete(3)).toBe(true);
      expect(map.size).toBe(2);
      expect(map.has(3)).toBe(false);
    });
  });

  describe('size', () => {
    it('should track size correctly', () => {
      const map = new SkipListMap2<number, string>();
      expect(map.size).toBe(0);
      map.set(1, 'one');
      expect(map.size).toBe(1);
      map.set(2, 'two');
      expect(map.size).toBe(2);
      map.set(3, 'three');
      expect(map.size).toBe(3);
      map.delete(2);
      expect(map.size).toBe(2);
      map.delete(1);
      expect(map.size).toBe(1);
      map.delete(3);
      expect(map.size).toBe(0);
    });

    it('should not increase size when overwriting', () => {
      const map = new SkipListMap2<number, string>();
      map.set(1, 'one');
      expect(map.size).toBe(1);
      map.set(1, 'ONE');
      expect(map.size).toBe(1);
      map.set(1, 'uno');
      expect(map.size).toBe(1);
    });
  });

  describe('clear', () => {
    it('should clear all items', () => {
      const map = new SkipListMap2<number, string>();
      map.set(1, 'one');
      map.set(2, 'two');
      map.set(3, 'three');
      expect(map.size).toBe(3);
      map.clear();
      expect(map.size).toBe(0);
      expect(map.get(1)).toBeUndefined();
      expect(map.get(2)).toBeUndefined();
      expect(map.get(3)).toBeUndefined();
    });

    it('should clear empty map', () => {
      const map = new SkipListMap2<number, string>();
      expect(map.size).toBe(0);
      map.clear();
      expect(map.size).toBe(0);
    });

    it('should allow adding after clear', () => {
      const map = new SkipListMap2<number, string>();
      map.set(1, 'one');
      map.set(2, 'two');
      map.clear();
      map.set(3, 'three');
      map.set(4, 'four');
      expect(map.size).toBe(2);
      expect(map.get(3)).toBe('three');
      expect(map.get(4)).toBe('four');
    });
  });

  describe('min and max', () => {
    it('should return min key and value', () => {
      const map = new SkipListMap2<number, string>();
      map.set(5, 'five');
      map.set(2, 'two');
      map.set(8, 'eight');
      map.set(1, 'one');
      map.set(10, 'ten');
      const min = map.min();
      expect(min).toEqual({ key: 1, value: 'one' });
    });

    it('should return max key and value', () => {
      const map = new SkipListMap2<number, string>();
      map.set(5, 'five');
      map.set(2, 'two');
      map.set(8, 'eight');
      map.set(1, 'one');
      map.set(10, 'ten');
      const max = map.max();
      expect(max).toEqual({ key: 10, value: 'ten' });
    });

    it('should update min after deletion', () => {
      const map = new SkipListMap2<number, string>();
      map.set(1, 'one');
      map.set(2, 'two');
      map.set(3, 'three');
      expect(map.min()).toEqual({ key: 1, value: 'one' });
      map.delete(1);
      expect(map.min()).toEqual({ key: 2, value: 'two' });
    });

    it('should update max after deletion', () => {
      const map = new SkipListMap2<number, string>();
      map.set(1, 'one');
      map.set(2, 'two');
      map.set(3, 'three');
      expect(map.max()).toEqual({ key: 3, value: 'three' });
      map.delete(3);
      expect(map.max()).toEqual({ key: 2, value: 'two' });
    });

    it('should return single item for min and max when only one element', () => {
      const map = new SkipListMap2<number, string>();
      map.set(5, 'five');
      expect(map.min()).toEqual({ key: 5, value: 'five' });
      expect(map.max()).toEqual({ key: 5, value: 'five' });
    });
  });

  describe('range queries', () => {
    it('should return items in range inclusive', () => {
      const map = new SkipListMap2<number, string>();
      map.set(1, 'one');
      map.set(2, 'two');
      map.set(3, 'three');
      map.set(4, 'four');
      map.set(5, 'five');
      map.set(6, 'six');
      const result = map.range(2, 5);
      expect(result).toEqual([
        { key: 2, value: 'two' },
        { key: 3, value: 'three' },
        { key: 4, value: 'four' },
        { key: 5, value: 'five' }
      ]);
    });

    it('should return empty array when no items in range', () => {
      const map = new SkipListMap2<number, string>();
      map.set(1, 'one');
      map.set(2, 'two');
      map.set(3, 'three');
      const result = map.range(5, 10);
      expect(result).toEqual([]);
    });

    it('should return items when range starts at min', () => {
      const map = new SkipListMap2<number, string>();
      map.set(1, 'one');
      map.set(2, 'two');
      map.set(3, 'three');
      map.set(4, 'four');
      map.set(5, 'five');
      const result = map.range(1, 3);
      expect(result).toEqual([
        { key: 1, value: 'one' },
        { key: 2, value: 'two' },
        { key: 3, value: 'three' }
      ]);
    });

    it('should return items when range ends at max', () => {
      const map = new SkipListMap2<number, string>();
      map.set(1, 'one');
      map.set(2, 'two');
      map.set(3, 'three');
      map.set(4, 'four');
      map.set(5, 'five');
      const result = map.range(3, 5);
      expect(result).toEqual([
        { key: 3, value: 'three' },
        { key: 4, value: 'four' },
        { key: 5, value: 'five' }
      ]);
    });

    it('should return single item range', () => {
      const map = new SkipListMap2<number, string>();
      map.set(1, 'one');
      map.set(2, 'two');
      map.set(3, 'three');
      const result = map.range(2, 2);
      expect(result).toEqual([
        { key: 2, value: 'two' }
      ]);
    });
  });

  describe('custom comparator', () => {
    it('should work with descending numeric comparator', () => {
      const map = new SkipListMap2<number, string>((a, b) => {
        return a > b ? -1 : a < b ? 1 : 0;
      });
      map.set(1, 'one');
      map.set(2, 'two');
      map.set(3, 'three');
      map.set(4, 'four');
      map.set(5, 'five');
      const result = map.range(3, 1);
      expect(result).toEqual([
        { key: 3, value: 'three' },
        { key: 2, value: 'two' },
        { key: 1, value: 'one' }
      ]);
    });

    it('should work with string comparator', () => {
      const map = new SkipListMap2<string, number>((a, b) => {
        return a.localeCompare(b);
      });
      map.set('apple', 1);
      map.set('banana', 2);
      map.set('cherry', 3);
      map.set('date', 4);
      map.set('elderberry', 5);
      const result = map.range('banana', 'date');
      expect(result).toEqual([
        { key: 'banana', value: 2 },
        { key: 'cherry', value: 3 },
        { key: 'date', value: 4 }
      ]);
    });

    it('should work with object comparator', () => {
      interface Item {
        id: number;
        name: string;
      }
      const map = new SkipListMap2<Item, string>((a, b) => {
        return a.id - b.id;
      });
      const item1: Item = { id: 1, name: 'one' };
      const item2: Item = { id: 2, name: 'two' };
      const item3: Item = { id: 3, name: 'three' };
      const item4: Item = { id: 4, name: 'four' };
      const item5: Item = { id: 5, name: 'five' };
      map.set(item3, 'three');
      map.set(item1, 'one');
      map.set(item5, 'five');
      map.set(item2, 'two');
      map.set(item4, 'four');
      expect(map.get(item2)).toBe('two');
      expect(map.get(item4)).toBe('four');
    });
  });

  describe('large dataset', () => {
    it('should handle 1000+ items', () => {
      const map = new SkipListMap2<number, number>();
      const count = 1000;
      for (let i = 0; i < count; i++) {
        map.set(i, i * 10);
      }
      expect(map.size).toBe(count);
      for (let i = 0; i < count; i++) {
        expect(map.get(i)).toBe(i * 10);
      }
    });

    it('should maintain min and max for large dataset', () => {
      const map = new SkipListMap2<number, number>();
      const count = 1000;
      for (let i = 0; i < count; i++) {
        map.set(i, i * 10);
      }
      expect(map.min()).toEqual({ key: 0, value: 0 });
      expect(map.max()).toEqual({ key: 999, value: 9990 });
    });

    it('should handle range queries on large dataset', () => {
      const map = new SkipListMap2<number, number>();
      const count = 1000;
      for (let i = 0; i < count; i++) {
        map.set(i, i * 10);
      }
      const result = map.range(100, 200);
      expect(result.length).toBe(101);
      expect(result[0]).toEqual({ key: 100, value: 1000 });
      expect(result[result.length - 1]).toEqual({ key: 200, value: 2000 });
    });
  });

  describe('deletion of all elements', () => {
    it('should delete all elements one by one', () => {
      const map = new SkipListMap2<number, string>();
      map.set(1, 'one');
      map.set(2, 'two');
      map.set(3, 'three');
      map.set(4, 'four');
      map.set(5, 'five');
      expect(map.size).toBe(5);
      expect(map.delete(1)).toBe(true);
      expect(map.delete(2)).toBe(true);
      expect(map.delete(3)).toBe(true);
      expect(map.delete(4)).toBe(true);
      expect(map.delete(5)).toBe(true);
      expect(map.size).toBe(0);
      expect(map.get(1)).toBeUndefined();
      expect(map.get(2)).toBeUndefined();
      expect(map.get(3)).toBeUndefined();
      expect(map.get(4)).toBeUndefined();
      expect(map.get(5)).toBeUndefined();
    });

    it('should handle operations after deleting all elements', () => {
      const map = new SkipListMap2<number, string>();
      map.set(1, 'one');
      map.set(2, 'two');
      map.set(3, 'three');
      map.delete(1);
      map.delete(2);
      map.delete(3);
      expect(map.size).toBe(0);
      map.set(10, 'ten');
      map.set(20, 'twenty');
      map.set(30, 'thirty');
      expect(map.size).toBe(3);
      expect(map.get(10)).toBe('ten');
      expect(map.get(20)).toBe('twenty');
      expect(map.get(30)).toBe('thirty');
    });

    it('should handle delete', () => {
      const map = new SkipListMap2<number, string>();
      map.set(10, 'ten');
      map.set(20, 'twenty');
      map.set(30, 'thirty');
      expect(map.delete(20)).toBe(true);
      expect(map.get(20)).toBeUndefined();
      expect(map.size).toBe(2);
    });
  });

  it('should handle min and max', () => {
    const map = new SkipListMap2<number, string>();
    map.set(5, 'five');
    map.set(1, 'one');
    map.set(9, 'nine');
    expect(map.min()!.key).toBe(1);
    expect(map.max()!.key).toBe(9);
  });
  it('should handle delete', () => {
    const map = new SkipListMap2<number, string>();
    map.set(1, 'a');
    map.set(2, 'b');
    expect(map.delete(1)).toBe(true);
    expect(map.has(1)).toBe(false);
  });
  it('should handle delete nonexistent key', () => {
    const map = new SkipListMap2<number, string>();
    map.set(1, 'a');
    expect(map.delete(99)).toBe(false);
    expect(map.size).toBe(1);
  });
  it('should handle get nonexistent key', () => {
    const map = new SkipListMap2<number, string>();
    map.set(1, 'a');
    expect(map.get(99)).toBeUndefined();
  });
  it('should handle delete', () => {
    const map = new SkipListMap2<number, string>();
    map.set(1, 'a');
    map.set(2, 'b');
    expect(map.delete(1)).toBe(true);
    expect(map.get(1)).toBeUndefined();
    expect(map.size).toBe(1);
  });
  it('should handle has', () => {
    const map = new SkipListMap2<number, string>();
    map.set(1, 'a');
    map.set(2, 'b');
    expect(map.has(1)).toBe(true);
    expect(map.has(99)).toBe(false);
  });
  it('should handle size on empty map', () => {
    const map = new SkipListMap2<number, string>();
    expect(map.size).toBe(0);
  });
  it('should handle clear then set', () => {
    const map = new SkipListMap2<number, string>();
    map.set(1, 'a');
    map.set(2, 'b');
    map.clear();
    expect(map.size).toBe(0);
    map.set(3, 'c');
    expect(map.get(3)).toBe('c');
    expect(map.size).toBe(1);
  });
});
