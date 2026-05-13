import { describe, it, expect } from 'vitest';
import { LinkedHashMap } from '../src/core/linked-hash-map-4/index.js';

describe('LinkedHashMap', () => {
  describe('empty map', () => {
    it('should start empty', () => {
      const map = new LinkedHashMap<string, number>();
      expect(map.isEmpty).toBe(true);
      expect(map.size).toBe(0);
    });

    it('should return undefined for missing keys', () => {
      const map = new LinkedHashMap<string, number>();
      expect(map.get('missing')).toBe(undefined);
    });

    it('should has return false for missing keys', () => {
      const map = new LinkedHashMap<string, number>();
      expect(map.has('missing')).toBe(false);
    });

    it('should delete return false for missing keys', () => {
      const map = new LinkedHashMap<string, number>();
      expect(map.delete('missing')).toBe(false);
    });

    it('should return empty arrays for keys, values, entries', () => {
      const map = new LinkedHashMap<string, number>();
      expect(map.keys()).toEqual([]);
      expect(map.values()).toEqual([]);
      expect(map.entries()).toEqual([]);
    });

    it('should return undefined for first', () => {
      const map = new LinkedHashMap<string, number>();
      expect(map.first()).toBe(undefined);
    });

    it('should return undefined for last', () => {
      const map = new LinkedHashMap<string, number>();
      expect(map.last()).toBe(undefined);
    });

    it('should return false for deleteFirst', () => {
      const map = new LinkedHashMap<string, number>();
      expect(map.deleteFirst()).toBe(false);
    });

    it('should return false for deleteLast', () => {
      const map = new LinkedHashMap<string, number>();
      expect(map.deleteLast()).toBe(false);
    });
  });

  describe('set and get', () => {
    it('should set and get values', () => {
      const map = new LinkedHashMap<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      expect(map.get('a')).toBe(1);
      expect(map.get('b')).toBe(2);
    });

    it('should update existing keys', () => {
      const map = new LinkedHashMap<string, number>();
      map.set('a', 1);
      map.set('a', 2);
      expect(map.get('a')).toBe(2);
      expect(map.size).toBe(1);
    });

    it('should handle multiple types', () => {
      const map = new LinkedHashMap<any, any>();
      map.set('string', 'value');
      map.set(1, 'number key');
      map.set(true, 'boolean key');
      expect(map.get('string')).toBe('value');
      expect(map.get(1)).toBe('number key');
      expect(map.get(true)).toBe('boolean key');
    });
  });

  describe('insertion order', () => {
    it('should maintain insertion order for keys', () => {
      const map = new LinkedHashMap<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      expect(map.keys()).toEqual(['a', 'b', 'c']);
    });

    it('should maintain insertion order for values', () => {
      const map = new LinkedHashMap<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      expect(map.values()).toEqual([1, 2, 3]);
    });

    it('should maintain insertion order for entries', () => {
      const map = new LinkedHashMap<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      expect(map.entries()).toEqual([['a', 1], ['b', 2], ['c', 3]]);
    });

    it('should maintain order when updating existing key', () => {
      const map = new LinkedHashMap<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      map.set('a', 10);
      expect(map.keys()).toEqual(['a', 'b', 'c']);
      expect(map.values()).toEqual([10, 2, 3]);
    });
  });

  describe('has', () => {
    it('should return true for existing keys', () => {
      const map = new LinkedHashMap<string, number>();
      map.set('a', 1);
      expect(map.has('a')).toBe(true);
    });

    it('should return false for missing keys', () => {
      const map = new LinkedHashMap<string, number>();
      map.set('a', 1);
      expect(map.has('b')).toBe(false);
    });
  });

  describe('delete', () => {
    it('should remove existing keys', () => {
      const map = new LinkedHashMap<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      expect(map.delete('a')).toBe(true);
      expect(map.has('a')).toBe(false);
      expect(map.size).toBe(1);
    });

    it('should return false for missing keys', () => {
      const map = new LinkedHashMap<string, number>();
      expect(map.delete('missing')).toBe(false);
    });

    it('should not affect other keys', () => {
      const map = new LinkedHashMap<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.delete('a');
      expect(map.get('b')).toBe(2);
    });

    it('should maintain order after deletion', () => {
      const map = new LinkedHashMap<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      map.set('d', 4);
      map.delete('b');
      expect(map.keys()).toEqual(['a', 'c', 'd']);
    });
  });

  describe('size', () => {
    it('should track size correctly', () => {
      const map = new LinkedHashMap<string, number>();
      expect(map.size).toBe(0);
      map.set('a', 1);
      expect(map.size).toBe(1);
      map.set('b', 2);
      expect(map.size).toBe(2);
      map.delete('a');
      expect(map.size).toBe(1);
      map.clear();
      expect(map.size).toBe(0);
    });
  });

  describe('isEmpty', () => {
    it('should return true when empty', () => {
      const map = new LinkedHashMap<string, number>();
      expect(map.isEmpty).toBe(true);
    });

    it('should return false when not empty', () => {
      const map = new LinkedHashMap<string, number>();
      map.set('a', 1);
      expect(map.isEmpty).toBe(false);
    });

    it('should return true after clear', () => {
      const map = new LinkedHashMap<string, number>();
      map.set('a', 1);
      map.clear();
      expect(map.isEmpty).toBe(true);
    });
  });

  describe('keys', () => {
    it('should return all keys in order', () => {
      const map = new LinkedHashMap<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      const keys = map.keys();
      expect(keys.length).toBe(3);
      expect(keys).toEqual(['a', 'b', 'c']);
    });

    it('should return empty array when empty', () => {
      const map = new LinkedHashMap<string, number>();
      expect(map.keys()).toEqual([]);
    });
  });

  describe('values', () => {
    it('should return all values in order', () => {
      const map = new LinkedHashMap<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      const values = map.values();
      expect(values.length).toBe(3);
      expect(values).toEqual([1, 2, 3]);
    });

    it('should return empty array when empty', () => {
      const map = new LinkedHashMap<string, number>();
      expect(map.values()).toEqual([]);
    });
  });

  describe('entries', () => {
    it('should return all entries in order', () => {
      const map = new LinkedHashMap<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      const entries = map.entries();
      expect(entries.length).toBe(2);
      expect(entries).toEqual([['a', 1], ['b', 2]]);
    });

    it('should return empty array when empty', () => {
      const map = new LinkedHashMap<string, number>();
      expect(map.entries()).toEqual([]);
    });
  });

  describe('forEach', () => {
    it('should iterate over all entries in order', () => {
      const map = new LinkedHashMap<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);

      const visited: [number, string][] = [];
      map.forEach((value, key) => {
        visited.push([value, key]);
      });

      expect(visited.length).toBe(3);
      expect(visited).toEqual([[1, 'a'], [2, 'b'], [3, 'c']]);
    });

    it('should not iterate when empty', () => {
      const map = new LinkedHashMap<string, number>();
      let called = false;
      map.forEach(() => {
        called = true;
      });
      expect(called).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all entries', () => {
      const map = new LinkedHashMap<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      map.clear();
      expect(map.isEmpty).toBe(true);
      expect(map.size).toBe(0);
      expect(map.get('a')).toBe(undefined);
      expect(map.get('b')).toBe(undefined);
      expect(map.get('c')).toBe(undefined);
    });

    it('should be idempotent', () => {
      const map = new LinkedHashMap<string, number>();
      map.set('a', 1);
      map.clear();
      map.clear();
      expect(map.isEmpty).toBe(true);
    });
  });

  describe('first', () => {
    it('should return first entry', () => {
      const map = new LinkedHashMap<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      expect(map.first()).toEqual(['a', 1]);
    });

    it('should return first entry after deletions', () => {
      const map = new LinkedHashMap<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      map.delete('a');
      expect(map.first()).toEqual(['b', 2]);
    });

    it('should return undefined when empty', () => {
      const map = new LinkedHashMap<string, number>();
      expect(map.first()).toBe(undefined);
    });
  });

  describe('last', () => {
    it('should return last entry', () => {
      const map = new LinkedHashMap<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      expect(map.last()).toEqual(['c', 3]);
    });

    it('should return last entry after deletions', () => {
      const map = new LinkedHashMap<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      map.delete('c');
      expect(map.last()).toEqual(['b', 2]);
    });

    it('should return undefined when empty', () => {
      const map = new LinkedHashMap<string, number>();
      expect(map.last()).toBe(undefined);
    });
  });

  describe('deleteFirst', () => {
    it('should remove and return true for first entry', () => {
      const map = new LinkedHashMap<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      expect(map.deleteFirst()).toBe(true);
      expect(map.has('a')).toBe(false);
      expect(map.keys()).toEqual(['b', 'c']);
    });

    it('should return false when empty', () => {
      const map = new LinkedHashMap<string, number>();
      expect(map.deleteFirst()).toBe(false);
    });

    it('should update head pointer correctly', () => {
      const map = new LinkedHashMap<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      map.deleteFirst();
      expect(map.first()).toEqual(['b', 2]);
    });
  });

  describe('deleteLast', () => {
    it('should remove and return true for last entry', () => {
      const map = new LinkedHashMap<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      expect(map.deleteLast()).toBe(true);
      expect(map.has('c')).toBe(false);
      expect(map.keys()).toEqual(['a', 'b']);
    });

    it('should return false when empty', () => {
      const map = new LinkedHashMap<string, number>();
      expect(map.deleteLast()).toBe(false);
    });

    it('should update tail pointer correctly', () => {
      const map = new LinkedHashMap<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      map.deleteLast();
      expect(map.last()).toEqual(['b', 2]);
    });
  });

  describe('getTimeComplexity', () => {
    it('should return time complexity string', () => {
      const map = new LinkedHashMap<string, number>();
      expect(map.getTimeComplexity()).toBe('O(1) average case, O(n) worst case');
    });
  });

  describe('large datasets', () => {
    it('should handle 1000 entries', () => {
      const map = new LinkedHashMap<number, number>();
      for (let i = 0; i < 1000; i++) {
        map.set(i, i * 2);
      }
      expect(map.size).toBe(1000);
      for (let i = 0; i < 1000; i++) {
        expect(map.get(i)).toBe(i * 2);
      }
    });

    it('should handle 10000 entries', () => {
      const map = new LinkedHashMap<number, number>();
      for (let i = 0; i < 10000; i++) {
        map.set(i, i * 2);
      }
      expect(map.size).toBe(10000);
      for (let i = 0; i < 10000; i++) {
        expect(map.get(i)).toBe(i * 2);
      }
    });

    it('should maintain order with large dataset', () => {
      const map = new LinkedHashMap<number, number>();
      for (let i = 0; i < 100; i++) {
        map.set(i, i);
      }
      const keys = map.keys();
      for (let i = 0; i < 100; i++) {
        expect(keys[i]).toBe(i);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle setting same key multiple times', () => {
      const map = new LinkedHashMap<string, number>();
      map.set('a', 1);
      map.set('a', 2);
      map.set('a', 3);
      expect(map.get('a')).toBe(3);
      expect(map.size).toBe(1);
    });

    it('should handle undefined values', () => {
      const map = new LinkedHashMap<string, number | undefined>();
      map.set('a', undefined);
      expect(map.has('a')).toBe(true);
      expect(map.get('a')).toBe(undefined);
    });

    it('should handle zero values', () => {
      const map = new LinkedHashMap<string, number>();
      map.set('a', 0);
      expect(map.get('a')).toBe(0);
      expect(map.has('a')).toBe(true);
    });

    it('should handle negative numbers', () => {
      const map = new LinkedHashMap<string, number>();
      map.set('a', -1);
      map.set('b', -100);
      expect(map.get('a')).toBe(-1);
      expect(map.get('b')).toBe(-100);
    });

    it('should handle string keys with special characters', () => {
      const map = new LinkedHashMap<string, number>();
      map.set('key with spaces', 1);
      map.set('key-with-dashes', 2);
      map.set('key_with_underscores', 3);
      map.set('key.with.dots', 4);
      expect(map.get('key with spaces')).toBe(1);
      expect(map.get('key-with-dashes')).toBe(2);
      expect(map.get('key_with_underscores')).toBe(3);
      expect(map.get('key.with.dots')).toBe(4);
    });
  });

  describe('single entry operations', () => {
    it('should handle single entry operations', () => {
      const map = new LinkedHashMap<string, number>();
      map.set('a', 1);
      expect(map.size).toBe(1);
      expect(map.keys()).toEqual(['a']);
      expect(map.values()).toEqual([1]);
      expect(map.entries()).toEqual([['a', 1]]);
      expect(map.first()).toEqual(['a', 1]);
      expect(map.last()).toEqual(['a', 1]);
      expect(map.deleteFirst()).toBe(true);
      expect(map.size).toBe(0);
    });
  });

  describe('first and last on single element', () => {
    it('should return same entry for first and last with one element', () => {
      const map = new LinkedHashMap<string, number>();
      map.set('only', 42);
      expect(map.first()).toEqual(['only', 42]);
      expect(map.last()).toEqual(['only', 42]);
    });
  });
});
