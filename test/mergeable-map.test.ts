import { describe, it, expect } from 'vitest';
import { MergeableMap } from '../src/core/mergeable-map/index.js';

describe('MergeableMap', () => {
  describe('constructor', () => {
    it('creates empty map', () => {
      const map = new MergeableMap<string, number>();
      expect(map.size).toBe(0);
      expect(map.isEmpty).toBe(true);
    });

    it('creates map from entries', () => {
      const map = new MergeableMap<string, number>([['a', 1], ['b', 2]]);
      expect(map.size).toBe(2);
      expect(map.get('a')).toBe(1);
      expect(map.get('b')).toBe(2);
    });

    it('handles empty entries array', () => {
      const map = new MergeableMap<string, number>([]);
      expect(map.size).toBe(0);
    });

    it('handles number keys', () => {
      const map = new MergeableMap<number, string>([[1, 'one'], [2, 'two']]);
      expect(map.get(1)).toBe('one');
      expect(map.get(2)).toBe('two');
    });
  });

  describe('set', () => {
    it('sets value for key', () => {
      const map = new MergeableMap<string, number>();
      map.set('a', 1);
      expect(map.get('a')).toBe(1);
    });

    it('overwrites existing key', () => {
      const map = new MergeableMap<string, number>();
      map.set('a', 1);
      map.set('a', 2);
      expect(map.get('a')).toBe(2);
      expect(map.size).toBe(1);
    });

    it('adds multiple keys', () => {
      const map = new MergeableMap<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      expect(map.size).toBe(3);
    });

    it('handles number keys', () => {
      const map = new MergeableMap<number, string>();
      map.set(1, 'one');
      expect(map.get(1)).toBe('one');
    });
  });

  describe('get', () => {
    it('returns value for existing key', () => {
      const map = new MergeableMap<string, number>();
      map.set('a', 1);
      expect(map.get('a')).toBe(1);
    });

    it('returns undefined for non-existent key', () => {
      const map = new MergeableMap<string, number>();
      expect(map.get('nonexistent')).toBeUndefined();
    });

    it('returns undefined for empty map', () => {
      const map = new MergeableMap<string, number>();
      expect(map.get('any')).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('deletes existing key and returns true', () => {
      const map = new MergeableMap<string, number>();
      map.set('a', 1);
      expect(map.delete('a')).toBe(true);
      expect(map.get('a')).toBeUndefined();
    });

    it('returns false for non-existent key', () => {
      const map = new MergeableMap<string, number>();
      expect(map.delete('nonexistent')).toBe(false);
    });

    it('deletes multiple keys', () => {
      const map = new MergeableMap<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.delete('a');
      map.delete('b');
      expect(map.size).toBe(0);
    });

    it('updates size after delete', () => {
      const map = new MergeableMap<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.delete('a');
      expect(map.size).toBe(1);
    });
  });

  describe('has', () => {
    it('returns true for existing key', () => {
      const map = new MergeableMap<string, number>();
      map.set('a', 1);
      expect(map.has('a')).toBe(true);
    });

    it('returns false for non-existent key', () => {
      const map = new MergeableMap<string, number>();
      expect(map.has('nonexistent')).toBe(false);
    });

    it('returns false after delete', () => {
      const map = new MergeableMap<string, number>();
      map.set('a', 1);
      map.delete('a');
      expect(map.has('a')).toBe(false);
    });

    it('returns false for empty map', () => {
      const map = new MergeableMap<string, number>();
      expect(map.has('any')).toBe(false);
    });
  });

  describe('size', () => {
    it('returns 0 for empty map', () => {
      const map = new MergeableMap<string, number>();
      expect(map.size).toBe(0);
    });

    it('returns correct size after adds', () => {
      const map = new MergeableMap<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      expect(map.size).toBe(3);
    });

    it('updates size after delete', () => {
      const map = new MergeableMap<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.delete('a');
      expect(map.size).toBe(1);
    });

    it('does not change size on overwrite', () => {
      const map = new MergeableMap<string, number>();
      map.set('a', 1);
      map.set('a', 2);
      expect(map.size).toBe(1);
    });
  });

  describe('isEmpty', () => {
    it('returns true for empty map', () => {
      const map = new MergeableMap<string, number>();
      expect(map.isEmpty).toBe(true);
    });

    it('returns false after adding entries', () => {
      const map = new MergeableMap<string, number>();
      map.set('a', 1);
      expect(map.isEmpty).toBe(false);
    });

    it('returns true after clearing', () => {
      const map = new MergeableMap<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.clear();
      expect(map.isEmpty).toBe(true);
    });

    it('returns true after deleting all entries', () => {
      const map = new MergeableMap<string, number>();
      map.set('a', 1);
      map.delete('a');
      expect(map.isEmpty).toBe(true);
    });
  });

  describe('clear', () => {
    it('clears all entries', () => {
      const map = new MergeableMap<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      map.clear();
      expect(map.size).toBe(0);
      expect(map.isEmpty).toBe(true);
      expect(map.get('a')).toBeUndefined();
    });

    it('clears empty map without error', () => {
      const map = new MergeableMap<string, number>();
      map.clear();
      expect(map.size).toBe(0);
    });

    it('allows operations after clear', () => {
      const map = new MergeableMap<string, number>();
      map.set('a', 1);
      map.clear();
      map.set('b', 2);
      expect(map.get('b')).toBe(2);
    });
  });

  describe('merge', () => {
    it('merges empty maps', () => {
      const map1 = new MergeableMap<string, number>();
      const map2 = new MergeableMap<string, number>();
      const result = map1.merge(map2);
      expect(result).toEqual({ added: 0, updated: 0, removed: 0, unchanged: 0 });
      expect(map1.size).toBe(0);
    });

    it('adds new keys', () => {
      const map1 = new MergeableMap<string, number>();
      const map2 = new MergeableMap<string, number>([['a', 1]]);
      const result = map1.merge(map2);
      expect(result).toEqual({ added: 1, updated: 0, removed: 0, unchanged: 0 });
      expect(map1.get('a')).toBe(1);
    });

    it('updates existing keys', () => {
      const map1 = new MergeableMap<string, number>([['a', 1]]);
      const map2 = new MergeableMap<string, number>([['a', 2]]);
      const result = map1.merge(map2);
      expect(result).toEqual({ added: 0, updated: 1, removed: 0, unchanged: 0 });
      expect(map1.get('a')).toBe(2);
    });

    it('counts unchanged keys', () => {
      const map1 = new MergeableMap<string, number>([['a', 1]]);
      const map2 = new MergeableMap<string, number>([['a', 1]]);
      const result = map1.merge(map2);
      expect(result).toEqual({ added: 0, updated: 0, removed: 0, unchanged: 1 });
      expect(map1.get('a')).toBe(1);
    });

    it('uses conflict resolver', () => {
      const map1 = new MergeableMap<string, number>([['a', 1]]);
      const map2 = new MergeableMap<string, number>([['a', 2]]);
      const result = map1.merge(map2, (key, left, right) => left + right);
      expect(result).toEqual({ added: 0, updated: 1, removed: 0, unchanged: 0 });
      expect(map1.get('a')).toBe(3);
    });

    it('handles mixed add, update, unchanged', () => {
      const map1 = new MergeableMap<string, number>([['a', 1], ['b', 2]]);
      const map2 = new MergeableMap<string, number>([['a', 1], ['b', 20], ['c', 3]]);
      const result = map1.merge(map2);
      expect(result).toEqual({ added: 1, updated: 1, removed: 0, unchanged: 1 });
      expect(map1.get('a')).toBe(1);
      expect(map1.get('b')).toBe(20);
      expect(map1.get('c')).toBe(3);
    });

    it('handles empty conflict resolver', () => {
      const map1 = new MergeableMap<string, number>([['a', 1]]);
      const map2 = new MergeableMap<string, number>([['a', 2]]);
      const result = map1.merge(map2, undefined);
      expect(result).toEqual({ added: 0, updated: 1, removed: 0, unchanged: 0 });
      expect(map1.get('a')).toBe(2);
    });
  });

  describe('keys', () => {
    it('returns iterator for empty map', () => {
      const map = new MergeableMap<string, number>();
      const keys = Array.from(map.keys());
      expect(keys).toEqual([]);
    });

    it('returns all keys', () => {
      const map = new MergeableMap<string, number>([['a', 1], ['b', 2], ['c', 3]]);
      const keys = Array.from(map.keys());
      expect(keys.length).toBe(3);
      expect(keys).toContain('a');
      expect(keys).toContain('b');
      expect(keys).toContain('c');
    });

    it('excludes deleted keys', () => {
      const map = new MergeableMap<string, number>([['a', 1], ['b', 2]]);
      map.delete('a');
      const keys = Array.from(map.keys());
      expect(keys).toEqual(['b']);
    });

    it('handles number keys', () => {
      const map = new MergeableMap<number, string>([[1, 'one'], [2, 'two']]);
      const keys = Array.from(map.keys());
      expect(keys).toContain(1);
      expect(keys).toContain(2);
    });
  });

  describe('values', () => {
    it('returns iterator for empty map', () => {
      const map = new MergeableMap<string, number>();
      const values = Array.from(map.values());
      expect(values).toEqual([]);
    });

    it('returns all values', () => {
      const map = new MergeableMap<string, number>([['a', 1], ['b', 2], ['c', 3]]);
      const values = Array.from(map.values());
      expect(values.length).toBe(3);
      expect(values).toContain(1);
      expect(values).toContain(2);
      expect(values).toContain(3);
    });

    it('returns updated value after overwrite', () => {
      const map = new MergeableMap<string, number>();
      map.set('a', 1);
      map.set('a', 2);
      const values = Array.from(map.values());
      expect(values).toEqual([2]);
    });
  });

  describe('entries', () => {
    it('returns iterator for empty map', () => {
      const map = new MergeableMap<string, number>();
      const entries = Array.from(map.entries());
      expect(entries).toEqual([]);
    });

    it('returns all entries', () => {
      const map = new MergeableMap<string, number>([['a', 1], ['b', 2]]);
      const entries = Array.from(map.entries());
      expect(entries.length).toBe(2);
      expect(entries).toContainEqual(['a', 1]);
      expect(entries).toContainEqual(['b', 2]);
    });

    it('excludes deleted entries', () => {
      const map = new MergeableMap<string, number>([['a', 1], ['b', 2]]);
      map.delete('a');
      const entries = Array.from(map.entries());
      expect(entries).toEqual([['b', 2]]);
    });
  });

  describe('toArray', () => {
    it('returns empty array for empty map', () => {
      const map = new MergeableMap<string, number>();
      expect(map.toArray()).toEqual([]);
    });

    it('returns all entries as array', () => {
      const map = new MergeableMap<string, number>([['a', 1], ['b', 2]]);
      const arr = map.toArray();
      expect(arr.length).toBe(2);
      expect(arr).toContainEqual(['a', 1]);
      expect(arr).toContainEqual(['b', 2]);
    });

    it('excludes deleted entries', () => {
      const map = new MergeableMap<string, number>([['a', 1], ['b', 2]]);
      map.delete('a');
      expect(map.toArray()).toEqual([['b', 2]]);
    });
  });

  describe('forEach', () => {
    it('iterates over all entries', () => {
      const map = new MergeableMap<string, number>([['a', 1], ['b', 2], ['c', 3]]);
      const visited: [number, string][] = [];
      map.forEach((value, key) => {
        visited.push([value, key]);
      });
      expect(visited.length).toBe(3);
      expect(visited).toContainEqual([1, 'a']);
      expect(visited).toContainEqual([2, 'b']);
      expect(visited).toContainEqual([3, 'c']);
    });

    it('passes map to callback', () => {
      const map = new MergeableMap<string, number>([['a', 1]]);
      let receivedMap: MergeableMap<string, number> | undefined;
      map.forEach((value, key, m) => {
        receivedMap = m;
      });
      expect(receivedMap).toBe(map);
    });

    it('does not iterate over empty map', () => {
      const map = new MergeableMap<string, number>();
      let count = 0;
      map.forEach(() => {
        count++;
      });
      expect(count).toBe(0);
    });
  });

  describe('Symbol.iterator', () => {
    it('allows for-of iteration', () => {
      const map = new MergeableMap<string, number>([['a', 1], ['b', 2]]);
      const entries: [string, number][] = [];
      for (const entry of map) {
        entries.push(entry);
      }
      expect(entries.length).toBe(2);
      expect(entries).toContainEqual(['a', 1]);
      expect(entries).toContainEqual(['b', 2]);
    });

    it('allows array destructuring', () => {
      const map = new MergeableMap<string, number>([['a', 1]]);
      const [key, value] = [...map][0];
      expect(key).toBe('a');
      expect(value).toBe(1);
    });

    it('works with spread operator', () => {
      const map = new MergeableMap<string, number>([['a', 1], ['b', 2]]);
      const arr = [...map];
      expect(arr.length).toBe(2);
    });
  });

  describe('clone', () => {
    it('creates independent copy', () => {
      const map1 = new MergeableMap<string, number>([['a', 1], ['b', 2]]);
      const map2 = map1.clone();
      expect(map2).not.toBe(map1);
      expect(map2.get('a')).toBe(1);
      expect(map2.get('b')).toBe(2);
    });

    it('does not affect original after clone modification', () => {
      const map1 = new MergeableMap<string, number>([['a', 1]]);
      const map2 = map1.clone();
      map2.set('b', 2);
      expect(map1.size).toBe(1);
      expect(map2.size).toBe(2);
    });

    it('clones empty map', () => {
      const map1 = new MergeableMap<string, number>();
      const map2 = map1.clone();
      expect(map2.size).toBe(0);
    });
  });

  describe('difference', () => {
    it('returns keys only in this map', () => {
      const map1 = new MergeableMap<string, number>([['a', 1], ['b', 2], ['c', 3]]);
      const map2 = new MergeableMap<string, number>([['b', 20], ['c', 30], ['d', 4]]);
      const diff = map1.difference(map2);
      expect(diff.toArray()).toEqual([['a', 1]]);
    });

    it('returns empty map when identical', () => {
      const map1 = new MergeableMap<string, number>([['a', 1], ['b', 2]]);
      const map2 = new MergeableMap<string, number>([['a', 1], ['b', 2]]);
      const diff = map1.difference(map2);
      expect(diff.isEmpty).toBe(true);
    });

    it('returns all keys when other is empty', () => {
      const map1 = new MergeableMap<string, number>([['a', 1], ['b', 2]]);
      const map2 = new MergeableMap<string, number>();
      const diff = map1.difference(map2);
      expect(diff.toArray()).toEqual([['a', 1], ['b', 2]]);
    });

    it('returns empty map when this is empty', () => {
      const map1 = new MergeableMap<string, number>();
      const map2 = new MergeableMap<string, number>([['a', 1]]);
      const diff = map1.difference(map2);
      expect(diff.isEmpty).toBe(true);
    });

    it('ignores value differences', () => {
      const map1 = new MergeableMap<string, number>([['a', 1]]);
      const map2 = new MergeableMap<string, number>([['a', 99]]);
      const diff = map1.difference(map2);
      expect(diff.isEmpty).toBe(true);
    });
  });

  describe('intersection', () => {
    it('returns common keys', () => {
      const map1 = new MergeableMap<string, number>([['a', 1], ['b', 2], ['c', 3]]);
      const map2 = new MergeableMap<string, number>([['b', 20], ['c', 30], ['d', 4]]);
      const inter = map1.intersection(map2);
      const arr = inter.toArray();
      expect(arr.length).toBe(2);
      expect(arr).toContainEqual(['b', 2]);
      expect(arr).toContainEqual(['c', 3]);
    });

    it('returns empty map when no common keys', () => {
      const map1 = new MergeableMap<string, number>([['a', 1]]);
      const map2 = new MergeableMap<string, number>([['b', 2]]);
      const inter = map1.intersection(map2);
      expect(inter.isEmpty).toBe(true);
    });

    it('returns empty map when either is empty', () => {
      const map1 = new MergeableMap<string, number>([['a', 1]]);
      const map2 = new MergeableMap<string, number>();
      const inter = map1.intersection(map2);
      expect(inter.isEmpty).toBe(true);
    });

    it('uses values from this map', () => {
      const map1 = new MergeableMap<string, number>([['a', 1]]);
      const map2 = new MergeableMap<string, number>([['a', 99]]);
      const inter = map1.intersection(map2);
      expect(inter.get('a')).toBe(1);
    });
  });

  describe('union', () => {
    it('combines both maps', () => {
      const map1 = new MergeableMap<string, number>([['a', 1]]);
      const map2 = new MergeableMap<string, number>([['b', 2]]);
      const union = map1.union(map2);
      expect(union.toArray()).toContainEqual(['a', 1]);
      expect(union.toArray()).toContainEqual(['b', 2]);
    });

    it('prioritizes other map on conflict', () => {
      const map1 = new MergeableMap<string, number>([['a', 1]]);
      const map2 = new MergeableMap<string, number>([['a', 2]]);
      const union = map1.union(map2);
      expect(union.get('a')).toBe(2);
    });

    it('does not modify original maps', () => {
      const map1 = new MergeableMap<string, number>([['a', 1]]);
      const map2 = new MergeableMap<string, number>([['b', 2]]);
      map1.union(map2);
      expect(map1.get('a')).toBe(1);
      expect(map1.has('b')).toBe(false);
      expect(map2.get('b')).toBe(2);
    });

    it('handles empty maps', () => {
      const map1 = new MergeableMap<string, number>([['a', 1]]);
      const map2 = new MergeableMap<string, number>();
      const union = map1.union(map2);
      expect(union.toArray()).toEqual([['a', 1]]);
    });
  });

  describe('detailedDifference', () => {
    it('identifies left only, right only, common, and changed', () => {
      const map1 = new MergeableMap<string, number>([['a', 1], ['b', 2], ['c', 3]]);
      const map2 = new MergeableMap<string, number>([['b', 20], ['c', 3], ['d', 4]]);
      const diff = map1.detailedDifference(map2);
      expect(diff.leftOnly).toEqual([{ key: 'a', value: 1 }]);
      expect(diff.rightOnly).toEqual([{ key: 'd', value: 4 }]);
      expect(diff.common).toEqual([{ key: 'c', value: 3 }]);
      expect(diff.changed).toEqual([{ key: 'b', leftValue: 2, rightValue: 20 }]);
    });

    it('handles all left only', () => {
      const map1 = new MergeableMap<string, number>([['a', 1], ['b', 2]]);
      const map2 = new MergeableMap<string, number>();
      const diff = map1.detailedDifference(map2);
      expect(diff.leftOnly.length).toBe(2);
      expect(diff.rightOnly).toEqual([]);
      expect(diff.common).toEqual([]);
      expect(diff.changed).toEqual([]);
    });

    it('handles all right only', () => {
      const map1 = new MergeableMap<string, number>();
      const map2 = new MergeableMap<string, number>([['a', 1]]);
      const diff = map1.detailedDifference(map2);
      expect(diff.leftOnly).toEqual([]);
      expect(diff.rightOnly.length).toBe(1);
      expect(diff.common).toEqual([]);
      expect(diff.changed).toEqual([]);
    });

    it('handles all common', () => {
      const map1 = new MergeableMap<string, number>([['a', 1]]);
      const map2 = new MergeableMap<string, number>([['a', 1]]);
      const diff = map1.detailedDifference(map2);
      expect(diff.leftOnly).toEqual([]);
      expect(diff.rightOnly).toEqual([]);
      expect(diff.common).toEqual([{ key: 'a', value: 1 }]);
      expect(diff.changed).toEqual([]);
    });

    it('handles all changed', () => {
      const map1 = new MergeableMap<string, number>([['a', 1]]);
      const map2 = new MergeableMap<string, number>([['a', 2]]);
      const diff = map1.detailedDifference(map2);
      expect(diff.leftOnly).toEqual([]);
      expect(diff.rightOnly).toEqual([]);
      expect(diff.common).toEqual([]);
      expect(diff.changed).toEqual([{ key: 'a', leftValue: 1, rightValue: 2 }]);
    });
  });

  describe('equals', () => {
    it('returns true for identical maps', () => {
      const map1 = new MergeableMap<string, number>([['a', 1], ['b', 2]]);
      const map2 = new MergeableMap<string, number>([['a', 1], ['b', 2]]);
      expect(map1.equals(map2)).toBe(true);
    });

    it('returns false for different sizes', () => {
      const map1 = new MergeableMap<string, number>([['a', 1]]);
      const map2 = new MergeableMap<string, number>([['a', 1], ['b', 2]]);
      expect(map1.equals(map2)).toBe(false);
    });

    it('returns false for different values', () => {
      const map1 = new MergeableMap<string, number>([['a', 1]]);
      const map2 = new MergeableMap<string, number>([['a', 2]]);
      expect(map1.equals(map2)).toBe(false);
    });

    it('returns false for different keys', () => {
      const map1 = new MergeableMap<string, number>([['a', 1]]);
      const map2 = new MergeableMap<string, number>([['b', 1]]);
      expect(map1.equals(map2)).toBe(false);
    });

    it('returns true for empty maps', () => {
      const map1 = new MergeableMap<string, number>();
      const map2 = new MergeableMap<string, number>();
      expect(map1.equals(map2)).toBe(true);
    });

    it('returns true for self', () => {
      const map = new MergeableMap<string, number>([['a', 1]]);
      expect(map.equals(map)).toBe(true);
    });
  });

  describe('filter', () => {
    it('filters entries by predicate', () => {
      const map = new MergeableMap<string, number>([['a', 1], ['b', 2], ['c', 3]]);
      const filtered = map.filter((value) => value > 1);
      expect(filtered.toArray()).toEqual([['b', 2], ['c', 3]]);
    });

    it('does not modify original', () => {
      const map = new MergeableMap<string, number>([['a', 1], ['b', 2]]);
      map.filter(() => false);
      expect(map.size).toBe(2);
    });

    it('returns empty map when none match', () => {
      const map = new MergeableMap<string, number>([['a', 1], ['b', 2]]);
      const filtered = map.filter(() => false);
      expect(filtered.isEmpty).toBe(true);
    });

    it('returns all entries when all match', () => {
      const map = new MergeableMap<string, number>([['a', 1], ['b', 2]]);
      const filtered = map.filter(() => true);
      expect(filtered.toArray()).toEqual([['a', 1], ['b', 2]]);
    });

    it('passes key to predicate', () => {
      const map = new MergeableMap<string, number>([['a', 1], ['b', 2]]);
      const filtered = map.filter((value, key) => key === 'a');
      expect(filtered.toArray()).toEqual([['a', 1]]);
    });

    it('filters empty map', () => {
      const map = new MergeableMap<string, number>();
      const filtered = map.filter(() => true);
      expect(filtered.isEmpty).toBe(true);
    });
  });

  describe('mapValues', () => {
    it('maps values to new type', () => {
      const map = new MergeableMap<string, number>([['a', 1], ['b', 2]]);
      const mapped = map.mapValues((value) => value * 2);
      expect(mapped.get('a')).toBe(2);
      expect(mapped.get('b')).toBe(4);
    });

    it('does not modify original', () => {
      const map = new MergeableMap<string, number>([['a', 1]]);
      map.mapValues((value) => value * 2);
      expect(map.get('a')).toBe(1);
    });

    it('preserves keys', () => {
      const map = new MergeableMap<string, number>([['a', 1], ['b', 2]]);
      const mapped = map.mapValues(() => 'x');
      expect(mapped.has('a')).toBe(true);
      expect(mapped.has('b')).toBe(true);
    });

    it('passes key to mapper', () => {
      const map = new MergeableMap<string, number>([['a', 1]]);
      const mapped = map.mapValues((value, key) => key);
      expect(mapped.get('a')).toBe('a');
    });

    it('maps empty map', () => {
      const map = new MergeableMap<string, number>();
      const mapped = map.mapValues((value) => value.toString());
      expect(mapped.isEmpty).toBe(true);
    });
  });

  describe('some', () => {
    it('returns true when any entry matches', () => {
      const map = new MergeableMap<string, number>([['a', 1], ['b', 2], ['c', 3]]);
      expect(map.some((value) => value > 2)).toBe(true);
    });

    it('returns false when no entry matches', () => {
      const map = new MergeableMap<string, number>([['a', 1], ['b', 2]]);
      expect(map.some((value) => value > 10)).toBe(false);
    });

    it('returns true for first match', () => {
      const map = new MergeableMap<string, number>([['a', 1], ['b', 2]]);
      expect(map.some((value) => value > 0)).toBe(true);
    });

    it('passes key to predicate', () => {
      const map = new MergeableMap<string, number>([['a', 1], ['b', 2]]);
      expect(map.some((value, key) => key === 'b')).toBe(true);
    });

    it('returns false for empty map', () => {
      const map = new MergeableMap<string, number>();
      expect(map.some(() => true)).toBe(false);
    });
  });

  describe('every', () => {
    it('returns true when all entries match', () => {
      const map = new MergeableMap<string, number>([['a', 1], ['b', 2], ['c', 3]]);
      expect(map.every((value) => value > 0)).toBe(true);
    });

    it('returns false when any entry does not match', () => {
      const map = new MergeableMap<string, number>([['a', 1], ['b', 2], ['c', 3]]);
      expect(map.every((value) => value > 2)).toBe(false);
    });

    it('passes key to predicate', () => {
      const map = new MergeableMap<string, number>([['a', 1], ['b', 2]]);
      expect(map.every((value, key) => key.length === 1)).toBe(true);
    });

    it('returns true for empty map', () => {
      const map = new MergeableMap<string, number>();
      expect(map.every(() => false)).toBe(true);
    });

    it('returns true for single matching entry', () => {
      const map = new MergeableMap<string, number>([['a', 1]]);
      expect(map.every((value) => value === 1)).toBe(true);
    });
  });

  describe('find', () => {
    it('returns first matching value', () => {
      const map = new MergeableMap<string, number>([['a', 1], ['b', 2], ['c', 3]]);
      const found = map.find((value) => value > 1);
      expect(found).toBe(2);
    });

    it('returns undefined when no match', () => {
      const map = new MergeableMap<string, number>([['a', 1], ['b', 2]]);
      const found = map.find((value) => value > 10);
      expect(found).toBeUndefined();
    });

    it('passes key to predicate', () => {
      const map = new MergeableMap<string, number>([['a', 1], ['b', 2]]);
      const found = map.find((value, key) => key === 'b');
      expect(found).toBe(2);
    });

    it('returns undefined for empty map', () => {
      const map = new MergeableMap<string, number>();
      const found = map.find(() => true);
      expect(found).toBeUndefined();
    });

    it('returns value when predicate matches first', () => {
      const map = new MergeableMap<string, number>([['a', 1]]);
      const found = map.find(() => true);
      expect(found).toBe(1);
    });
  });

  describe('reduce', () => {
    it('reduces values to single value', () => {
      const map = new MergeableMap<string, number>([['a', 1], ['b', 2], ['c', 3]]);
      const sum = map.reduce((acc, value) => acc + value, 0);
      expect(sum).toBe(6);
    });

    it('passes key to reducer', () => {
      const map = new MergeableMap<string, number>([['a', 1], ['b', 2]]);
      const result = map.reduce((acc, value, key) => acc + key, '');
      expect(result).toBe('ab');
    });

    it('handles empty map', () => {
      const map = new MergeableMap<string, number>();
      const result = map.reduce((acc, value) => acc + value, 10);
      expect(result).toBe(10);
    });

    it('handles single entry', () => {
      const map = new MergeableMap<string, number>([['a', 1]]);
      const result = map.reduce((acc, value) => acc + value, 0);
      expect(result).toBe(1);
    });

    it('supports complex accumulator types', () => {
      const map = new MergeableMap<string, number>([['a', 1], ['b', 2]]);
      const result = map.reduce((acc, value, key) => {
        acc.push({ key, value });
        return acc;
      }, [] as Array<{ key: string; value: number }>);
      expect(result.length).toBe(2);
    });
  });

  describe('static fromObject', () => {
    it('creates map from object', () => {
      const map = MergeableMap.fromObject({ a: 1, b: 2 });
      expect(map.get('a')).toBe(1);
      expect(map.get('b')).toBe(2);
    });

    it('creates empty map from empty object', () => {
      const map = MergeableMap.fromObject({});
      expect(map.isEmpty).toBe(true);
    });

    it('handles complex values', () => {
      const obj = { a: { x: 1 }, b: [1, 2, 3] };
      const map = MergeableMap.fromObject(obj);
      expect(map.get('a')).toEqual({ x: 1 });
      expect(map.get('b')).toEqual([1, 2, 3]);
    });

    it('creates independent copy', () => {
      const obj = { a: 1 };
      const map = MergeableMap.fromObject(obj);
      obj.a = 2;
      expect(map.get('a')).toBe(1);
    });
  });

  describe('toObject', () => {
    it('converts map to object', () => {
      const map = new MergeableMap<string, number>([['a', 1], ['b', 2]]);
      const obj = map.toObject();
      expect(obj).toEqual({ a: 1, b: 2 });
    });

    it('returns empty object for empty map', () => {
      const map = new MergeableMap<string, number>();
      const obj = map.toObject();
      expect(obj).toEqual({});
    });

    it('ignores non-string keys', () => {
      const map = new MergeableMap<number, string>([[1, 'one'], [2, 'two']]);
      const obj = map.toObject();
      expect(obj).toEqual({});
    });

    it('handles mixed string and non-string keys', () => {
      const map = new MergeableMap<string | number, string>([['a', 'a'], [1, 'one']]);
      const obj = map.toObject();
      expect(obj).toEqual({ a: 'a' });
    });

    it('handles complex values', () => {
      const map = new MergeableMap<string, { x: number }>([['a', { x: 1 }]]);
      const obj = map.toObject();
      expect(obj).toEqual({ a: { x: 1 } });
    });
  });
});