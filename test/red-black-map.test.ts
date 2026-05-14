import { describe, it, expect } from 'vitest';
import { RedBlackMap } from '../src/core/red-black-map/index.js';

describe('RedBlackMap', () => {
  describe('constructor', () => {
    it('should create empty map', () => {
      const map = new RedBlackMap();
      expect(map.size).toBe(0);
      expect(map.isEmpty()).toBe(true);
    });

    it('should create map from entries', () => {
      const entries: [number, string][] = [[1, 'a'], [2, 'b'], [3, 'c']];
      const map = new RedBlackMap(entries);
      expect(map.size).toBe(3);
      expect(map.get(1)).toBe('a');
      expect(map.get(2)).toBe('b');
      expect(map.get(3)).toBe('c');
    });

    it('should create empty map from empty entries', () => {
      const map = new RedBlackMap([]);
      expect(map.size).toBe(0);
      expect(map.isEmpty()).toBe(true);
    });

    it('should create map with custom compare', () => {
      const map = new RedBlackMap(undefined, { compare: (a: number, b: number) => b - a });
      map.set(1, 'a');
      map.set(2, 'b');
      expect(map.get(1)).toBe('a');
      expect(map.get(2)).toBe('b');
    });

    it('should use custom compare for ordering', () => {
      const map = new RedBlackMap(undefined, { compare: (a: number, b: number) => b - a });
      map.set(3, 'c');
      map.set(2, 'b');
      map.set(1, 'a');
      const keys = map.keys();
      expect(keys).toEqual([3, 2, 1]);
    });

    it('should create map from Set entries', () => {
      const set = new Set([[1, 'a'], [2, 'b'], [3, 'c']] as [number, string][]);
      const map = new RedBlackMap(set);
      expect(map.size).toBe(3);
      expect(map.get(1)).toBe('a');
      expect(map.get(2)).toBe('b');
      expect(map.get(3)).toBe('c');
    });

    it('should handle duplicate keys in constructor', () => {
      const entries: [number, string][] = [[1, 'a'], [1, 'b'], [2, 'c']];
      const map = new RedBlackMap(entries);
      expect(map.size).toBe(2);
      expect(map.get(1)).toBe('b');
      expect(map.get(2)).toBe('c');
    });

    it('should handle string keys', () => {
      const map = new RedBlackMap([['a', 1], ['b', 2]]);
      expect(map.size).toBe(2);
      expect(map.get('a')).toBe(1);
      expect(map.get('b')).toBe(2);
    });

    it('should handle object keys with custom compare', () => {
      const map = new RedBlackMap(undefined, {
        compare: (a: { id: number }, b: { id: number }) => a.id - b.id,
      });
      map.set({ id: 1 }, 'a');
      map.set({ id: 2 }, 'b');
      expect(map.size).toBe(2);
      expect(map.get({ id: 1 })).toBe('a');
      expect(map.get({ id: 2 })).toBe('b');
    });
  });

  describe('set', () => {
    it('should add key-value pair', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      expect(map.size).toBe(1);
      expect(map.get(1)).toBe('a');
    });

    it('should update existing key', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(1, 'b');
      expect(map.size).toBe(1);
      expect(map.get(1)).toBe('b');
    });

    it('should handle multiple sets', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(2, 'b');
      map.set(3, 'c');
      expect(map.size).toBe(3);
      expect(map.get(1)).toBe('a');
      expect(map.get(2)).toBe('b');
      expect(map.get(3)).toBe('c');
    });

    it('should handle various types', () => {
      const map = new RedBlackMap<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      expect(map.get('a')).toBe(1);
      expect(map.get('b')).toBe(2);
      expect(map.get('c')).toBe(3);
    });

    it('should handle null values', () => {
      const map = new RedBlackMap<number, string | null>();
      map.set(1, null);
      expect(map.get(1)).toBe(null);
      expect(map.size).toBe(1);
    });

    it('should handle undefined values', () => {
      const map = new RedBlackMap<number, string | undefined>();
      map.set(1, undefined);
      expect(map.get(1)).toBe(undefined);
      expect(map.size).toBe(1);
    });

    it('should maintain order after multiple inserts', () => {
      const map = new RedBlackMap<number, string>();
      map.set(5, 'e');
      map.set(3, 'c');
      map.set(1, 'a');
      map.set(4, 'd');
      map.set(2, 'b');
      const keys = map.keys();
      expect(keys).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle reverse order inserts', () => {
      const map = new RedBlackMap<number, string>();
      map.set(5, 'e');
      map.set(4, 'd');
      map.set(3, 'c');
      map.set(2, 'b');
      map.set(1, 'a');
      const keys = map.keys();
      expect(keys).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle large number of inserts', () => {
      const map = new RedBlackMap<number, number>();
      for (let i = 0; i < 1000; i++) {
        map.set(i, i * 2);
      }
      expect(map.size).toBe(1000);
      for (let i = 0; i < 1000; i++) {
        expect(map.get(i)).toBe(i * 2);
      }
    });
  });

  describe('get', () => {
    it('should return value for existing key', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      expect(map.get(1)).toBe('a');
    });

    it('should return undefined for non-existent key', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      expect(map.get(2)).toBe(undefined);
    });

    it('should return undefined for empty map', () => {
      const map = new RedBlackMap<number, string>();
      expect(map.get(1)).toBe(undefined);
    });

    it('should return correct value after update', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(1, 'b');
      expect(map.get(1)).toBe('b');
    });

    it('should handle string keys', () => {
      const map = new RedBlackMap<string, number>();
      map.set('hello', 42);
      expect(map.get('hello')).toBe(42);
      expect(map.get('world')).toBe(undefined);
    });

    it('should find value in large map', () => {
      const map = new RedBlackMap<number, number>();
      for (let i = 0; i < 1000; i++) {
        map.set(i, i * 3);
      }
      expect(map.get(500)).toBe(1500);
      expect(map.get(999)).toBe(2997);
      expect(map.get(1000)).toBe(undefined);
    });
  });

  describe('has', () => {
    it('should return true for existing key', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      expect(map.has(1)).toBe(true);
    });

    it('should return false for non-existent key', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      expect(map.has(2)).toBe(false);
    });

    it('should return false for empty map', () => {
      const map = new RedBlackMap<number, string>();
      expect(map.has(1)).toBe(false);
    });

    it('should return false after deletion', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.delete(1);
      expect(map.has(1)).toBe(false);
    });

    it('should return true after update', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(1, 'b');
      expect(map.has(1)).toBe(true);
    });

    it('should handle string keys', () => {
      const map = new RedBlackMap<string, number>();
      map.set('hello', 42);
      expect(map.has('hello')).toBe(true);
      expect(map.has('world')).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete existing key and return true', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      expect(map.delete(1)).toBe(true);
      expect(map.has(1)).toBe(false);
      expect(map.size).toBe(0);
    });

    it('should return false for non-existent key', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      expect(map.delete(2)).toBe(false);
      expect(map.size).toBe(1);
    });

    it('should return false for empty map', () => {
      const map = new RedBlackMap<number, string>();
      expect(map.delete(1)).toBe(false);
      expect(map.size).toBe(0);
    });

    it('should handle deletion of first key', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(2, 'b');
      map.set(3, 'c');
      map.delete(1);
      expect(map.size).toBe(2);
      expect(map.has(1)).toBe(false);
      expect(map.has(2)).toBe(true);
      expect(map.has(3)).toBe(true);
    });

    it('should handle deletion of last key', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(2, 'b');
      map.set(3, 'c');
      map.delete(3);
      expect(map.size).toBe(2);
      expect(map.has(1)).toBe(true);
      expect(map.has(2)).toBe(true);
      expect(map.has(3)).toBe(false);
    });

    it('should handle deletion of middle key', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(2, 'b');
      map.set(3, 'c');
      map.delete(2);
      expect(map.size).toBe(2);
      expect(map.has(1)).toBe(true);
      expect(map.has(2)).toBe(false);
      expect(map.has(3)).toBe(true);
    });

    it('should handle deletion of root node', () => {
      const map = new RedBlackMap<number, string>();
      map.set(2, 'b');
      map.set(1, 'a');
      map.set(3, 'c');
      map.delete(2);
      expect(map.size).toBe(2);
      expect(map.has(2)).toBe(false);
    });

    it('should handle multiple deletions', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(2, 'b');
      map.set(3, 'c');
      map.set(4, 'd');
      map.set(5, 'e');
      map.delete(2);
      map.delete(4);
      expect(map.size).toBe(3);
      expect(map.keys()).toEqual([1, 3, 5]);
    });

    it('should handle deletion from large map', () => {
      const map = new RedBlackMap<number, number>();
      for (let i = 0; i < 1000; i++) {
        map.set(i, i);
      }
      for (let i = 0; i < 500; i++) {
        map.delete(i * 2);
      }
      expect(map.size).toBe(500);
    });

    it('should handle deletion of all keys', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(2, 'b');
      map.set(3, 'c');
      map.delete(1);
      map.delete(2);
      map.delete(3);
      expect(map.size).toBe(0);
      expect(map.isEmpty()).toBe(true);
    });

    it('should maintain order after deletion', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(2, 'b');
      map.set(3, 'c');
      map.set(4, 'd');
      map.set(5, 'e');
      map.delete(3);
      expect(map.keys()).toEqual([1, 2, 4, 5]);
    });
  });

  describe('min', () => {
    it('should return undefined for empty map', () => {
      const map = new RedBlackMap<number, string>();
      expect(map.min()).toBe(undefined);
    });

    it('should return minimum key-value pair', () => {
      const map = new RedBlackMap<number, string>();
      map.set(3, 'c');
      map.set(1, 'a');
      map.set(2, 'b');
      expect(map.min()).toEqual([1, 'a']);
    });

    it('should return first inserted in sorted order', () => {
      const map = new RedBlackMap<number, string>();
      map.set(5, 'e');
      map.set(3, 'c');
      map.set(1, 'a');
      expect(map.min()).toEqual([1, 'a']);
    });

    it('should work with single element', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      expect(map.min()).toEqual([1, 'a']);
    });

    it('should work with string keys', () => {
      const map = new RedBlackMap<string, number>();
      map.set('c', 3);
      map.set('a', 1);
      map.set('b', 2);
      expect(map.min()).toEqual(['a', 1]);
    });

    it('should find min in large map', () => {
      const map = new RedBlackMap<number, number>();
      for (let i = 100; i < 1000; i++) {
        map.set(i, i);
      }
      expect(map.min()).toEqual([100, 100]);
    });
  });

  describe('max', () => {
    it('should return undefined for empty map', () => {
      const map = new RedBlackMap<number, string>();
      expect(map.max()).toBe(undefined);
    });

    it('should return maximum key-value pair', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(3, 'c');
      map.set(2, 'b');
      expect(map.max()).toEqual([3, 'c']);
    });

    it('should return last in sorted order', () => {
      const map = new RedBlackMap<number, string>();
      map.set(5, 'e');
      map.set(3, 'c');
      map.set(1, 'a');
      expect(map.max()).toEqual([5, 'e']);
    });

    it('should work with single element', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      expect(map.max()).toEqual([1, 'a']);
    });

    it('should work with string keys', () => {
      const map = new RedBlackMap<string, number>();
      map.set('a', 1);
      map.set('c', 3);
      map.set('b', 2);
      expect(map.max()).toEqual(['c', 3]);
    });

    it('should find max in large map', () => {
      const map = new RedBlackMap<number, number>();
      for (let i = 0; i < 900; i++) {
        map.set(i, i);
      }
      expect(map.max()).toEqual([899, 899]);
    });
  });

  describe('lowerBound', () => {
    it('should return undefined for empty map', () => {
      const map = new RedBlackMap<number, string>();
      expect(map.lowerBound(1)).toBe(undefined);
    });

    it('should return first key greater than or equal to target', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(3, 'c');
      map.set(5, 'e');
      expect(map.lowerBound(2)).toEqual([3, 'c']);
    });

    it('should return exact match if key exists', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(3, 'c');
      map.set(5, 'e');
      expect(map.lowerBound(3)).toEqual([3, 'c']);
    });

    it('should return undefined if all keys are less than target', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(2, 'b');
      map.set(3, 'c');
      expect(map.lowerBound(5)).toBe(undefined);
    });

    it('should return first key if target is less than all', () => {
      const map = new RedBlackMap<number, string>();
      map.set(10, 'j');
      map.set(20, 't');
      map.set(30, 'th');
      expect(map.lowerBound(5)).toEqual([10, 'j']);
    });

    it('should work with string keys', () => {
      const map = new RedBlackMap<string, number>();
      map.set('apple', 1);
      map.set('banana', 2);
      map.set('cherry', 3);
      expect(map.lowerBound('apricot')).toEqual(['banana', 2]);
      expect(map.lowerBound('banana')).toEqual(['banana', 2]);
    });
  });

  describe('upperBound', () => {
    it('should return undefined for empty map', () => {
      const map = new RedBlackMap<number, string>();
      expect(map.upperBound(1)).toBe(undefined);
    });

    it('should return first key strictly greater than target', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(3, 'c');
      map.set(5, 'e');
      expect(map.upperBound(3)).toEqual([5, 'e']);
    });

    it('should return next key if key exists', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(3, 'c');
      map.set(5, 'e');
      expect(map.upperBound(3)).toEqual([5, 'e']);
    });

    it('should return undefined if all keys are less than or equal to target', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(2, 'b');
      map.set(3, 'c');
      expect(map.upperBound(5)).toBe(undefined);
    });

    it('should return first key if target is less than all', () => {
      const map = new RedBlackMap<number, string>();
      map.set(10, 'j');
      map.set(20, 't');
      map.set(30, 'th');
      expect(map.upperBound(5)).toEqual([10, 'j']);
    });

    it('should work with string keys', () => {
      const map = new RedBlackMap<string, number>();
      map.set('apple', 1);
      map.set('banana', 2);
      map.set('cherry', 3);
      expect(map.upperBound('banana')).toEqual(['cherry', 3]);
      expect(map.upperBound('apricot')).toEqual(['banana', 2]);
    });
  });

  describe('floor', () => {
    it('should return undefined for empty map', () => {
      const map = new RedBlackMap<number, string>();
      expect(map.floor(1)).toBe(undefined);
    });

    it('should return key less than or equal to target', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(3, 'c');
      map.set(5, 'e');
      expect(map.floor(2)).toEqual([1, 'a']);
    });

    it('should return exact match if key exists', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(3, 'c');
      map.set(5, 'e');
      expect(map.floor(3)).toEqual([3, 'c']);
    });

    it('should return undefined if all keys are greater than target', () => {
      const map = new RedBlackMap<number, string>();
      map.set(10, 'j');
      map.set(20, 't');
      map.set(30, 'th');
      expect(map.floor(5)).toBe(undefined);
    });

    it('should return last key if target is greater than all', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(2, 'b');
      map.set(3, 'c');
      expect(map.floor(5)).toEqual([3, 'c']);
    });

    it('should work with string keys', () => {
      const map = new RedBlackMap<string, number>();
      map.set('apple', 1);
      map.set('banana', 2);
      map.set('cherry', 3);
      expect(map.floor('blueberry')).toEqual(['banana', 2]);
      expect(map.floor('banana')).toEqual(['banana', 2]);
    });
  });

  describe('ceil', () => {
    it('should return undefined for empty map', () => {
      const map = new RedBlackMap<number, string>();
      expect(map.ceil(1)).toBe(undefined);
    });

    it('should return key greater than or equal to target', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(3, 'c');
      map.set(5, 'e');
      expect(map.ceil(2)).toEqual([3, 'c']);
    });

    it('should return exact match if key exists', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(3, 'c');
      map.set(5, 'e');
      expect(map.ceil(3)).toEqual([3, 'c']);
    });

    it('should return undefined if all keys are less than target', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(2, 'b');
      map.set(3, 'c');
      expect(map.ceil(5)).toBe(undefined);
    });

    it('should return first key if target is less than all', () => {
      const map = new RedBlackMap<number, string>();
      map.set(10, 'j');
      map.set(20, 't');
      map.set(30, 'th');
      expect(map.ceil(5)).toEqual([10, 'j']);
    });

    it('should work with string keys', () => {
      const map = new RedBlackMap<string, number>();
      map.set('apple', 1);
      map.set('banana', 2);
      map.set('cherry', 3);
      expect(map.ceil('apricot')).toEqual(['banana', 2]);
      expect(map.ceil('banana')).toEqual(['banana', 2]);
    });
  });

  describe('size getter', () => {
    it('should return 0 for empty map', () => {
      const map = new RedBlackMap<number, string>();
      expect(map.size).toBe(0);
    });

    it('should return count of elements', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(2, 'b');
      map.set(3, 'c');
      expect(map.size).toBe(3);
    });

    it('should update after set', () => {
      const map = new RedBlackMap<number, string>();
      expect(map.size).toBe(0);
      map.set(1, 'a');
      expect(map.size).toBe(1);
      map.set(2, 'b');
      expect(map.size).toBe(2);
    });

    it('should update after delete', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(2, 'b');
      map.set(3, 'c');
      expect(map.size).toBe(3);
      map.delete(2);
      expect(map.size).toBe(2);
      map.delete(1);
      expect(map.size).toBe(1);
    });

    it('should not increment on duplicate set', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(1, 'b');
      expect(map.size).toBe(1);
    });

    it('should handle large map size', () => {
      const map = new RedBlackMap<number, number>();
      for (let i = 0; i < 1000; i++) {
        map.set(i, i);
      }
      expect(map.size).toBe(1000);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty map', () => {
      const map = new RedBlackMap<number, string>();
      expect(map.isEmpty()).toBe(true);
    });

    it('should return false for non-empty map', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      expect(map.isEmpty()).toBe(false);
    });

    it('should return true after clear', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(2, 'b');
      expect(map.isEmpty()).toBe(false);
      map.clear();
      expect(map.isEmpty()).toBe(true);
    });

    it('should return false after add to cleared map', () => {
      const map = new RedBlackMap<number, string>();
      map.clear();
      map.set(1, 'a');
      expect(map.isEmpty()).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear empty map', () => {
      const map = new RedBlackMap<number, string>();
      map.clear();
      expect(map.size).toBe(0);
      expect(map.isEmpty()).toBe(true);
    });

    it('should clear non-empty map', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(2, 'b');
      map.set(3, 'c');
      map.clear();
      expect(map.size).toBe(0);
      expect(map.isEmpty()).toBe(true);
      expect(map.get(1)).toBe(undefined);
      expect(map.get(2)).toBe(undefined);
      expect(map.get(3)).toBe(undefined);
    });

    it('should allow reuse after clear', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(2, 'b');
      map.clear();
      map.set(3, 'c');
      map.set(4, 'd');
      expect(map.size).toBe(2);
      expect(map.get(3)).toBe('c');
      expect(map.get(4)).toBe('d');
    });

    it('should maintain custom compare after clear', () => {
      const map = new RedBlackMap<number, string>(undefined, { compare: (a, b) => b - a });
      map.set(1, 'a');
      map.set(2, 'b');
      map.clear();
      map.set(3, 'c');
      map.set(4, 'd');
      const keys = map.keys();
      expect(keys).toEqual([4, 3]);
    });
  });

  describe('keys', () => {
    it('should return empty array for empty map', () => {
      const map = new RedBlackMap<number, string>();
      expect(map.keys()).toEqual([]);
    });

    it('should return all keys in sorted order', () => {
      const map = new RedBlackMap<number, string>();
      map.set(3, 'c');
      map.set(1, 'a');
      map.set(2, 'b');
      expect(map.keys()).toEqual([1, 2, 3]);
    });

    it('should return new array each call', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      const arr1 = map.keys();
      const arr2 = map.keys();
      expect(arr1).not.toBe(arr2);
      expect(arr1).toEqual(arr2);
    });

    it('should not be affected by array modification', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(2, 'b');
      const arr = map.keys();
      arr.push(3);
      expect(map.keys()).toEqual([1, 2]);
    });

    it('should handle large number of keys', () => {
      const map = new RedBlackMap<number, number>();
      for (let i = 0; i < 100; i++) {
        map.set(i, i);
      }
      const keys = map.keys();
      expect(keys.length).toBe(100);
      expect(keys[0]).toBe(0);
      expect(keys[99]).toBe(99);
    });

    it('should work with string keys', () => {
      const map = new RedBlackMap<string, number>();
      map.set('c', 3);
      map.set('a', 1);
      map.set('b', 2);
      expect(map.keys()).toEqual(['a', 'b', 'c']);
    });
  });

  describe('values', () => {
    it('should return empty array for empty map', () => {
      const map = new RedBlackMap<number, string>();
      expect(map.values()).toEqual([]);
    });

    it('should return all values in key order', () => {
      const map = new RedBlackMap<number, string>();
      map.set(3, 'c');
      map.set(1, 'a');
      map.set(2, 'b');
      expect(map.values()).toEqual(['a', 'b', 'c']);
    });

    it('should return new array each call', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      const arr1 = map.values();
      const arr2 = map.values();
      expect(arr1).not.toBe(arr2);
      expect(arr1).toEqual(arr2);
    });

    it('should not be affected by array modification', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(2, 'b');
      const arr = map.values();
      arr.push('c');
      expect(map.values()).toEqual(['a', 'b']);
    });

    it('should handle large number of values', () => {
      const map = new RedBlackMap<number, number>();
      for (let i = 0; i < 100; i++) {
        map.set(i, i * 2);
      }
      const values = map.values();
      expect(values.length).toBe(100);
      expect(values[0]).toBe(0);
      expect(values[99]).toBe(198);
    });
  });

  describe('entries', () => {
    it('should return empty array for empty map', () => {
      const map = new RedBlackMap<number, string>();
      expect(map.entries()).toEqual([]);
    });

    it('should return all entries in sorted order', () => {
      const map = new RedBlackMap<number, string>();
      map.set(3, 'c');
      map.set(1, 'a');
      map.set(2, 'b');
      expect(map.entries()).toEqual([[1, 'a'], [2, 'b'], [3, 'c']]);
    });

    it('should return new array each call', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      const arr1 = map.entries();
      const arr2 = map.entries();
      expect(arr1).not.toBe(arr2);
      expect(arr1).toEqual(arr2);
    });

    it('should not be affected by array modification', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      const arr = map.entries();
      arr.push([2, 'b']);
      expect(map.entries()).toEqual([[1, 'a']]);
    });

    it('should handle large number of entries', () => {
      const map = new RedBlackMap<number, number>();
      for (let i = 0; i < 100; i++) {
        map.set(i, i * 2);
      }
      const entries = map.entries();
      expect(entries.length).toBe(100);
      expect(entries[0]).toEqual([0, 0]);
      expect(entries[99]).toEqual([99, 198]);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty map', () => {
      const map = new RedBlackMap<number, string>();
      expect(map.toArray()).toEqual([]);
    });

    it('should return all entries in sorted order', () => {
      const map = new RedBlackMap<number, string>();
      map.set(3, 'c');
      map.set(1, 'a');
      map.set(2, 'b');
      expect(map.toArray()).toEqual([[1, 'a'], [2, 'b'], [3, 'c']]);
    });

    it('should return same as entries', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(2, 'b');
      expect(map.toArray()).toEqual(map.entries());
    });

    it('should return new array each call', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      const arr1 = map.toArray();
      const arr2 = map.toArray();
      expect(arr1).not.toBe(arr2);
      expect(arr1).toEqual(arr2);
    });
  });

  describe('forEach', () => {
    it('should not call callback for empty map', () => {
      const map = new RedBlackMap<number, string>();
      let count = 0;
      map.forEach(() => count++);
      expect(count).toBe(0);
    });

    it('should call callback for each entry', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(2, 'b');
      map.set(3, 'c');
      const entries: [number, string][] = [];
      map.forEach((value, key) => entries.push([key, value]));
      expect(entries).toEqual([[1, 'a'], [2, 'b'], [3, 'c']]);
    });

    it('should pass map as third argument', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      let passedMap: RedBlackMap<number, string> | null = null;
      map.forEach((value, key, m) => {
        passedMap = m;
      });
      expect(passedMap).toBe(map);
    });

    it('should iterate in sorted order', () => {
      const map = new RedBlackMap<number, string>();
      map.set(3, 'c');
      map.set(1, 'a');
      map.set(2, 'b');
      const keys: number[] = [];
      map.forEach((value, key) => keys.push(key));
      expect(keys).toEqual([1, 2, 3]);
    });

    it('should handle modifications during iteration', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(2, 'b');
      map.set(3, 'c');
      const keys: number[] = [];
      map.forEach((value, key, m) => {
        keys.push(key);
        m.set(4, 'd');
      });
      expect(keys).toEqual([1, 2, 3]);
      expect(map.size).toBe(4);
    });
  });

  describe('iterator', () => {
    it('should not iterate over empty map', () => {
      const map = new RedBlackMap<number, string>();
      const results: [number, string][] = [];
      for (const entry of map) {
        results.push(entry);
      }
      expect(results).toEqual([]);
    });

    it('should iterate over all entries', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(2, 'b');
      map.set(3, 'c');
      const results: [number, string][] = [];
      for (const entry of map) {
        results.push(entry);
      }
      expect(results).toEqual([[1, 'a'], [2, 'b'], [3, 'c']]);
    });

    it('should support for-of loop', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(2, 'b');
      const results: [number, string][] = [];
      for (const entry of map) {
        results.push(entry);
      }
      expect(results).toEqual([[1, 'a'], [2, 'b']]);
    });

    it('should support spread operator', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(2, 'b');
      expect([...map]).toEqual([[1, 'a'], [2, 'b']]);
    });

    it('should iterate in sorted order', () => {
      const map = new RedBlackMap<number, string>();
      map.set(3, 'c');
      map.set(1, 'a');
      map.set(2, 'b');
      const keys: number[] = [];
      for (const [key] of map) {
        keys.push(key);
      }
      expect(keys).toEqual([1, 2, 3]);
    });

    it('should handle many elements', () => {
      const map = new RedBlackMap<number, number>();
      for (let i = 0; i < 100; i++) {
        map.set(i, i * 2);
      }
      const results: [number, number][] = [];
      for (const entry of map) {
        results.push(entry);
      }
      expect(results.length).toBe(100);
      expect(results[0]).toEqual([0, 0]);
      expect(results[99]).toEqual([99, 198]);
    });
  });

  describe('clone', () => {
    it('should clone empty map', () => {
      const map1 = new RedBlackMap<number, string>();
      const map2 = map1.clone();
      expect(map2.size).toBe(0);
      expect(map2.isEmpty()).toBe(true);
    });

    it('should clone non-empty map', () => {
      const map1 = new RedBlackMap<number, string>();
      map1.set(1, 'a');
      map1.set(2, 'b');
      map1.set(3, 'c');
      const map2 = map1.clone();
      expect(map2.size).toBe(3);
      expect(map2.get(1)).toBe('a');
      expect(map2.get(2)).toBe('b');
      expect(map2.get(3)).toBe('c');
    });

    it('should create independent copy', () => {
      const map1 = new RedBlackMap<number, string>();
      map1.set(1, 'a');
      map1.set(2, 'b');
      const map2 = map1.clone();
      map2.set(3, 'c');
      expect(map1.size).toBe(2);
      expect(map2.size).toBe(3);
      expect(map1.has(3)).toBe(false);
      expect(map2.has(3)).toBe(true);
    });

    it('should not modify original', () => {
      const map1 = new RedBlackMap<number, string>();
      map1.set(1, 'a');
      const map2 = map1.clone();
      map2.delete(1);
      map2.set(1, 'b');
      expect(map1.get(1)).toBe('a');
      expect(map2.get(1)).toBe('b');
    });

    it('should preserve custom compare', () => {
      const map1 = new RedBlackMap<number, string>(undefined, { compare: (a, b) => b - a });
      map1.set(1, 'a');
      map1.set(2, 'b');
      const map2 = map1.clone();
      map2.set(3, 'c');
      const keys1 = map1.keys();
      const keys2 = map2.keys();
      expect(keys1).toEqual([2, 1]);
      expect(keys2).toEqual([3, 2, 1]);
    });

    it('should create new instance', () => {
      const map1 = new RedBlackMap<number, string>();
      map1.set(1, 'a');
      const map2 = map1.clone();
      expect(map2).not.toBe(map1);
    });
  });

  describe('rangeEntries', () => {
    it('should return empty array for empty map', () => {
      const map = new RedBlackMap<number, string>();
      expect(map.rangeEntries(1, 5)).toEqual([]);
    });

    it('should return entries in range', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(2, 'b');
      map.set(3, 'c');
      map.set(4, 'd');
      map.set(5, 'e');
      expect(map.rangeEntries(2, 4)).toEqual([[2, 'b'], [3, 'c'], [4, 'd']]);
    });

    it('should include boundaries', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(2, 'b');
      map.set(3, 'c');
      map.set(4, 'd');
      expect(map.rangeEntries(2, 3)).toEqual([[2, 'b'], [3, 'c']]);
    });

    it('should return empty when no keys in range', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(2, 'b');
      map.set(3, 'c');
      expect(map.rangeEntries(4, 6)).toEqual([]);
    });

    it('should return empty when from > to', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(2, 'b');
      map.set(3, 'c');
      expect(map.rangeEntries(5, 2)).toEqual([]);
    });

    it('should handle keys at boundaries', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(3, 'c');
      map.set(5, 'e');
      expect(map.rangeEntries(1, 5)).toEqual([[1, 'a'], [3, 'c'], [5, 'e']]);
    });

    it('should handle single key in range', () => {
      const map = new RedBlackMap<number, string>();
      map.set(3, 'c');
      expect(map.rangeEntries(2, 4)).toEqual([[3, 'c']]);
    });

    it('should work with string keys', () => {
      const map = new RedBlackMap<string, number>();
      map.set('apple', 1);
      map.set('banana', 2);
      map.set('cherry', 3);
      map.set('date', 4);
      expect(map.rangeEntries('banana', 'cherry')).toEqual([['banana', 2], ['cherry', 3]]);
    });

    it('should handle large range', () => {
      const map = new RedBlackMap<number, number>();
      for (let i = 0; i < 100; i++) {
        map.set(i, i);
      }
      const entries = map.rangeEntries(20, 30);
      expect(entries.length).toBe(11);
      expect(entries[0]).toEqual([20, 20]);
      expect(entries[10]).toEqual([30, 30]);
    });
  });

  describe('fromEntries static', () => {
    it('should create empty map from empty entries', () => {
      const map = RedBlackMap.fromEntries([]);
      expect(map.size).toBe(0);
      expect(map.isEmpty()).toBe(true);
    });

    it('should create map from entries', () => {
      const entries: [number, string][] = [[1, 'a'], [2, 'b'], [3, 'c']];
      const map = RedBlackMap.fromEntries(entries);
      expect(map.size).toBe(3);
      expect(map.get(1)).toBe('a');
      expect(map.get(2)).toBe('b');
      expect(map.get(3)).toBe('c');
    });

    it('should create map from Map entries', () => {
      const map1 = new Map([[1, 'a'], [2, 'b'], [3, 'c']]);
      const map2 = RedBlackMap.fromEntries(map1.entries());
      expect(map2.size).toBe(3);
      expect(map2.get(1)).toBe('a');
      expect(map2.get(2)).toBe('b');
      expect(map2.get(3)).toBe('c');
    });

    it('should handle duplicate keys', () => {
      const entries: [number, string][] = [[1, 'a'], [1, 'b'], [2, 'c']];
      const map = RedBlackMap.fromEntries(entries);
      expect(map.size).toBe(2);
      expect(map.get(1)).toBe('b');
    });

    it('should work with custom compare', () => {
      const entries: [number, string][] = [[1, 'a'], [2, 'b'], [3, 'c']];
      const map = RedBlackMap.fromEntries(entries, { compare: (a, b) => b - a });
      expect(map.size).toBe(3);
      expect(map.keys()).toEqual([3, 2, 1]);
    });

    it('should work with Set', () => {
      const set = new Set([[1, 'a'], [2, 'b']] as [number, string][]);
      const map = RedBlackMap.fromEntries(set);
      expect(map.size).toBe(2);
      expect(map.get(1)).toBe('a');
      expect(map.get(2)).toBe('b');
    });
  });

  describe('fromKeys static', () => {
    it('should create empty map from empty keys', () => {
      const map = RedBlackMap.fromKeys([]);
      expect(map.size).toBe(0);
      expect(map.isEmpty()).toBe(true);
    });

    it('should create map with keys as values', () => {
      const keys = [1, 2, 3];
      const map = RedBlackMap.fromKeys(keys);
      expect(map.size).toBe(3);
      expect(map.get(1)).toBe(1);
      expect(map.get(2)).toBe(2);
      expect(map.get(3)).toBe(3);
    });

    it('should work with Set', () => {
      const set = new Set([1, 2, 3]);
      const map = RedBlackMap.fromKeys(set);
      expect(map.size).toBe(3);
      expect(map.get(1)).toBe(1);
      expect(map.get(2)).toBe(2);
      expect(map.get(3)).toBe(3);
    });

    it('should work with custom compare', () => {
      const keys = [1, 2, 3];
      const map = RedBlackMap.fromKeys(keys, { compare: (a, b) => b - a });
      expect(map.size).toBe(3);
      expect(map.keys()).toEqual([3, 2, 1]);
    });

    it('should handle duplicate keys', () => {
      const keys = [1, 2, 1, 3];
      const map = RedBlackMap.fromKeys(keys);
      expect(map.size).toBe(3);
      expect(map.get(1)).toBe(1);
    });
  });

  describe('complex operations', () => {
    it('should handle mixed operations', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(2, 'b');
      map.set(3, 'c');
      map.delete(2);
      map.set(4, 'd');
      expect(map.size).toBe(3);
      expect(map.get(2)).toBe(undefined);
      expect(map.get(4)).toBe('d');
    });

    it('should maintain invariants after many operations', () => {
      const map = new RedBlackMap<number, number>();
      for (let i = 0; i < 100; i++) {
        map.set(i, i);
      }
      for (let i = 0; i < 50; i++) {
        map.delete(i * 2);
      }
      for (let i = 0; i < 30; i++) {
        map.set(100 + i, 100 + i);
      }
      expect(map.size).toBe(80);
      const keys = map.keys();
      expect(keys[0]).toBe(1);
      expect(keys[keys.length - 1]).toBe(129);
    });

    it('should handle update and delete pattern', () => {
      const map = new RedBlackMap<number, number>();
      for (let i = 0; i < 50; i++) {
        map.set(i, i);
      }
      for (let i = 0; i < 50; i++) {
        map.set(i, i * 2);
        map.delete(i);
        map.set(i, i * 3);
      }
      expect(map.size).toBe(50);
      for (let i = 0; i < 50; i++) {
        expect(map.get(i)).toBe(i * 3);
      }
    });

    it('should handle range queries with modifications', () => {
      const map = new RedBlackMap<number, number>();
      for (let i = 0; i < 100; i++) {
        map.set(i, i);
      }
      expect(map.rangeEntries(10, 20).length).toBe(11);
      map.delete(15);
      expect(map.rangeEntries(10, 20).length).toBe(10);
      map.set(15, 150);
      expect(map.rangeEntries(10, 20).length).toBe(11);
    });
  });

  describe('edge cases', () => {
    it('should handle single element', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      expect(map.size).toBe(1);
      expect(map.get(1)).toBe('a');
      expect(map.min()).toEqual([1, 'a']);
      expect(map.max()).toEqual([1, 'a']);
    });

    it('should handle two elements', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1, 'a');
      map.set(2, 'b');
      expect(map.size).toBe(2);
      expect(map.keys()).toEqual([1, 2]);
    });

    it('should handle insert in ascending order', () => {
      const map = new RedBlackMap<number, number>();
      for (let i = 0; i < 100; i++) {
        map.set(i, i);
      }
      expect(map.size).toBe(100);
      for (let i = 0; i < 100; i++) {
        expect(map.get(i)).toBe(i);
      }
    });

    it('should handle insert in descending order', () => {
      const map = new RedBlackMap<number, number>();
      for (let i = 99; i >= 0; i--) {
        map.set(i, i);
      }
      expect(map.size).toBe(100);
      for (let i = 0; i < 100; i++) {
        expect(map.get(i)).toBe(i);
      }
    });

    it('should handle insert in random order', () => {
      const map = new RedBlackMap<number, number>();
      const order = [50, 25, 75, 12, 37, 62, 18, 31, 68, 43];
      for (const i of order) {
        map.set(i, i * 2);
      }
      expect(map.size).toBe(10);
      for (const i of order) {
        expect(map.get(i)).toBe(i * 2);
      }
    });

    it('should handle same key and value', () => {
      const map = new RedBlackMap<number, number>();
      map.set(1, 1);
      map.set(2, 2);
      map.set(3, 3);
      expect(map.size).toBe(3);
      expect(map.get(1)).toBe(1);
      expect(map.get(2)).toBe(2);
      expect(map.get(3)).toBe(3);
    });

    it('should handle very large keys', () => {
      const map = new RedBlackMap<number, string>();
      map.set(1000000, 'a');
      map.set(2000000, 'b');
      map.set(3000000, 'c');
      expect(map.size).toBe(3);
      expect(map.get(2000000)).toBe('b');
    });

    it('should handle negative keys', () => {
      const map = new RedBlackMap<number, string>();
      map.set(-5, 'a');
      map.set(-3, 'b');
      map.set(-1, 'c');
      expect(map.size).toBe(3);
      expect(map.get(-3)).toBe('b');
      expect(map.keys()).toEqual([-5, -3, -1]);
    });
  });
});
