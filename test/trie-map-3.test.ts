import { describe, it, expect } from 'vitest';
import { TrieMap3 } from '../src/core/trie-map-3/index.js';

describe('TrieMap3', () => {
  describe('constructor', () => {
    it('creates empty trie', () => {
      const trie = new TrieMap3<number>();
      expect(trie.size).toBe(0);
      expect(trie.isEmpty()).toBe(true);
    });
  });

  describe('set/get', () => {
    it('sets and gets single value', () => {
      const trie = new TrieMap3<number>();
      trie.set('hello', 1);
      expect(trie.get('hello')).toBe(1);
    });

    it('updates existing value', () => {
      const trie = new TrieMap3<number>();
      trie.set('hello', 1);
      trie.set('hello', 2);
      expect(trie.get('hello')).toBe(2);
      expect(trie.size).toBe(1);
    });

    it('gets undefined for non-existent key', () => {
      const trie = new TrieMap3<number>();
      expect(trie.get('hello')).toBeUndefined();
    });

    it('handles empty key', () => {
      const trie = new TrieMap3<number>();
      trie.set('', 1);
      expect(trie.get('')).toBe(1);
      expect(trie.size).toBe(1);
    });
  });

  describe('has', () => {
    it('returns true for existing key', () => {
      const trie = new TrieMap3<number>();
      trie.set('hello', 1);
      expect(trie.has('hello')).toBe(true);
    });

    it('returns false for non-existent key', () => {
      const trie = new TrieMap3<number>();
      expect(trie.has('hello')).toBe(false);
    });

    it('returns false for prefix without value', () => {
      const trie = new TrieMap3<number>();
      trie.set('hello', 1);
      expect(trie.has('he')).toBe(false);
    });
  });

  describe('delete', () => {
    it('deletes existing key', () => {
      const trie = new TrieMap3<number>();
      trie.set('hello', 1);
      expect(trie.delete('hello')).toBe(true);
      expect(trie.get('hello')).toBeUndefined();
      expect(trie.size).toBe(0);
    });

    it('returns false for non-existent key', () => {
      const trie = new TrieMap3<number>();
      expect(trie.delete('hello')).toBe(false);
    });

    it('preserves other keys when deleting', () => {
      const trie = new TrieMap3<number>();
      trie.set('hello', 1);
      trie.set('world', 2);
      trie.delete('hello');
      expect(trie.get('world')).toBe(2);
      expect(trie.size).toBe(1);
    });

    it('deletes empty key', () => {
      const trie = new TrieMap3<number>();
      trie.set('', 1);
      expect(trie.delete('')).toBe(true);
      expect(trie.get('')).toBeUndefined();
    });
  });

  describe('size', () => {
    it('tracks number of keys', () => {
      const trie = new TrieMap3<number>();
      expect(trie.size).toBe(0);
      trie.set('a', 1);
      expect(trie.size).toBe(1);
      trie.set('b', 2);
      expect(trie.size).toBe(2);
      trie.set('a', 3);
      expect(trie.size).toBe(2);
    });

    it('decrements on delete', () => {
      const trie = new TrieMap3<number>();
      trie.set('a', 1);
      trie.set('b', 2);
      trie.delete('a');
      expect(trie.size).toBe(1);
    });
  });

  describe('isEmpty', () => {
    it('returns true for empty trie', () => {
      const trie = new TrieMap3<number>();
      expect(trie.isEmpty()).toBe(true);
    });

    it('returns false after adding keys', () => {
      const trie = new TrieMap3<number>();
      trie.set('a', 1);
      expect(trie.isEmpty()).toBe(false);
    });

    it('returns true after clearing', () => {
      const trie = new TrieMap3<number>();
      trie.set('a', 1);
      trie.clear();
      expect(trie.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('removes all keys', () => {
      const trie = new TrieMap3<number>();
      trie.set('hello', 1);
      trie.set('world', 2);
      trie.clear();
      expect(trie.size).toBe(0);
      expect(trie.isEmpty()).toBe(true);
      expect(trie.get('hello')).toBeUndefined();
    });

    it('allows adding after clear', () => {
      const trie = new TrieMap3<number>();
      trie.set('hello', 1);
      trie.clear();
      trie.set('hello', 2);
      expect(trie.get('hello')).toBe(2);
    });
  });

  describe('keysWithPrefix', () => {
    it('returns all keys with prefix', () => {
      const trie = new TrieMap3<number>();
      trie.set('apple', 1);
      trie.set('app', 2);
      trie.set('application', 3);
      trie.set('banana', 4);
      const keys = trie.keysWithPrefix('app');
      expect(keys.sort()).toEqual(['app', 'apple', 'application']);
    });

    it('returns empty array for non-existent prefix', () => {
      const trie = new TrieMap3<number>();
      trie.set('apple', 1);
      const keys = trie.keysWithPrefix('xyz');
      expect(keys).toEqual([]);
    });

    it('includes exact prefix match if key exists', () => {
      const trie = new TrieMap3<number>();
      trie.set('app', 1);
      trie.set('apple', 2);
      const keys = trie.keysWithPrefix('app');
      expect(keys.sort()).toEqual(['app', 'apple']);
    });

    it('handles empty prefix', () => {
      const trie = new TrieMap3<number>();
      trie.set('apple', 1);
      trie.set('banana', 2);
      const keys = trie.keysWithPrefix('');
      expect(keys.sort()).toEqual(['apple', 'banana']);
    });
  });

  describe('valuesWithPrefix', () => {
    it('returns all values with prefix', () => {
      const trie = new TrieMap3<number>();
      trie.set('apple', 1);
      trie.set('app', 2);
      trie.set('application', 3);
      trie.set('banana', 4);
      const values = trie.valuesWithPrefix('app');
      expect(values.sort()).toEqual([1, 2, 3]);
    });

    it('returns empty array for non-existent prefix', () => {
      const trie = new TrieMap3<number>();
      trie.set('apple', 1);
      const values = trie.valuesWithPrefix('xyz');
      expect(values).toEqual([]);
    });

    it('handles empty prefix', () => {
      const trie = new TrieMap3<number>();
      trie.set('apple', 1);
      trie.set('banana', 2);
      const values = trie.valuesWithPrefix('');
      expect(values.sort()).toEqual([1, 2]);
    });
  });

  describe('entriesWithPrefix', () => {
    it('returns all entries with prefix', () => {
      const trie = new TrieMap3<number>();
      trie.set('apple', 1);
      trie.set('app', 2);
      trie.set('application', 3);
      trie.set('banana', 4);
      const entries = trie.entriesWithPrefix('app');
      expect(entries.sort()).toEqual([
        ['app', 2],
        ['apple', 1],
        ['application', 3]
      ]);
    });

    it('returns empty array for non-existent prefix', () => {
      const trie = new TrieMap3<number>();
      trie.set('apple', 1);
      const entries = trie.entriesWithPrefix('xyz');
      expect(entries).toEqual([]);
    });

    it('handles empty prefix', () => {
      const trie = new TrieMap3<number>();
      trie.set('apple', 1);
      trie.set('banana', 2);
      const entries = trie.entriesWithPrefix('');
      expect(entries.sort()).toEqual([
        ['apple', 1],
        ['banana', 2]
      ]);
    });
  });

  describe('startsWith', () => {
    it('returns true for existing prefix', () => {
      const trie = new TrieMap3<number>();
      trie.set('apple', 1);
      trie.set('application', 2);
      expect(trie.startsWith('app')).toBe(true);
    });

    it('returns false for non-existent prefix', () => {
      const trie = new TrieMap3<number>();
      trie.set('apple', 1);
      expect(trie.startsWith('xyz')).toBe(false);
    });

    it('returns true for exact key match', () => {
      const trie = new TrieMap3<number>();
      trie.set('apple', 1);
      expect(trie.startsWith('apple')).toBe(true);
    });

    it('returns false for longer string not in trie', () => {
      const trie = new TrieMap3<number>();
      trie.set('app', 1);
      expect(trie.startsWith('apple')).toBe(false);
    });
  });

  describe('longestPrefixOf', () => {
    it('returns longest prefix that is a key', () => {
      const trie = new TrieMap3<number>();
      trie.set('a', 1);
      trie.set('ab', 2);
      trie.set('abc', 3);
      expect(trie.longestPrefixOf('abcd')).toBe('abc');
    });

    it('returns undefined when no prefix is a key', () => {
      const trie = new TrieMap3<number>();
      trie.set('ab', 1);
      expect(trie.longestPrefixOf('xyz')).toBeUndefined();
    });

    it('handles empty query', () => {
      const trie = new TrieMap3<number>();
      trie.set('', 1);
      expect(trie.longestPrefixOf('')).toBe('');
    });

    it('returns exact match when query is key', () => {
      const trie = new TrieMap3<number>();
      trie.set('hello', 1);
      expect(trie.longestPrefixOf('hello')).toBe('hello');
    });

    it('returns partial prefix when middle prefix is key', () => {
      const trie = new TrieMap3<number>();
      trie.set('a', 1);
      trie.set('abc', 2);
      expect(trie.longestPrefixOf('ab')).toBe('a');
    });
  });

  describe('edge cases', () => {
    it('handles many keys', () => {
      const trie = new TrieMap3<number>();
      for (let i = 0; i < 1000; i++) {
        trie.set(`key${i}`, i);
      }
      expect(trie.size).toBe(1000);
      expect(trie.get('key500')).toBe(500);
      expect(trie.keysWithPrefix('key').length).toBe(1000);
    });

    it('handles Unicode characters', () => {
      const trie = new TrieMap3<number>();
      trie.set('héllo', 1);
      trie.set('你好', 2);
      expect(trie.get('héllo')).toBe(1);
      expect(trie.get('你好')).toBe(2);
    });

    it('handles keys with special characters', () => {
      const trie = new TrieMap3<number>();
      trie.set('test-key', 1);
      trie.set('test.key', 2);
      trie.set('test/key', 3);
      expect(trie.get('test-key')).toBe(1);
      expect(trie.get('test.key')).toBe(2);
      expect(trie.get('test/key')).toBe(3);
    });

    it('works with string values', () => {
      const trie = new TrieMap3<string>();
      trie.set('a', 'value1');
      trie.set('b', 'value2');
      expect(trie.get('a')).toBe('value1');
      expect(trie.get('b')).toBe('value2');
    });

    it('works with object values', () => {
      const trie = new TrieMap3<{ id: number }>();
      const obj1 = { id: 1 };
      const obj2 = { id: 2 };
      trie.set('a', obj1);
      trie.set('b', obj2);
      expect(trie.get('a')).toEqual(obj1);
      expect(trie.get('b')).toEqual(obj2);
    });
  });
});
