import { describe, it, expect, beforeEach } from 'vitest';
import { BTrie } from '../src/core/btrie/index.js';

describe('BTrie', () => {
  let trie: BTrie<string>;

  beforeEach(() => {
    trie = new BTrie<string>();
  });

  describe('constructor', () => {
    it('should create empty trie', () => {
      const t = new BTrie<string>();
      expect(t.size).toBe(0);
      expect(t.isEmpty()).toBe(true);
    });

    it('should accept custom threshold', () => {
      const t = new BTrie<string>(10);
      expect(t.size).toBe(0);
      expect(t.isEmpty()).toBe(true);
    });

    it('should throw on invalid threshold', () => {
      expect(() => new BTrie<string>(0)).toThrow('Bucket threshold must be at least 1');
      expect(() => new BTrie<string>(-1)).toThrow('Bucket threshold must be at least 1');
      expect(() => new BTrie<string>(0.5)).toThrow('Bucket threshold must be at least 1');
    });

    it('should accept threshold of 1', () => {
      const t = new BTrie<string>(1);
      expect(t.size).toBe(0);
      expect(t.isEmpty()).toBe(true);
    });
  });

  describe('size', () => {
    it('should start at 0', () => {
      expect(trie.size).toBe(0);
    });

    it('should track insertions', () => {
      expect(trie.size).toBe(0);
      trie.insert('a', 'valueA');
      expect(trie.size).toBe(1);
      trie.insert('b', 'valueB');
      expect(trie.size).toBe(2);
      trie.insert('c', 'valueC');
      expect(trie.size).toBe(3);
    });

    it('should not increment on duplicate insert', () => {
      trie.insert('a', 'valueA');
      expect(trie.size).toBe(1);
      trie.insert('a', 'valueA2');
      expect(trie.size).toBe(1);
    });

    it('should track deletions', () => {
      trie.insert('a', 'valueA');
      trie.insert('b', 'valueB');
      trie.insert('c', 'valueC');
      expect(trie.size).toBe(3);
      trie.delete('b');
      expect(trie.size).toBe(2);
      trie.delete('a');
      expect(trie.size).toBe(1);
    });

    it('should be number type', () => {
      expect(typeof trie.size).toBe('number');
    });
  });

  describe('isEmpty', () => {
    it('should be true initially', () => {
      expect(trie.isEmpty()).toBe(true);
    });

    it('should be false after insert', () => {
      trie.insert('test', 'value');
      expect(trie.isEmpty()).toBe(false);
    });

    it('should be true after clearing', () => {
      trie.insert('test', 'value');
      expect(trie.isEmpty()).toBe(false);
      trie.clear();
      expect(trie.isEmpty()).toBe(true);
    });

    it('should be boolean type', () => {
      expect(typeof trie.isEmpty()).toBe('boolean');
    });
  });

  describe('insert', () => {
    it('should add single key', () => {
      trie.insert('hello', 'world');
      expect(trie.size).toBe(1);
      expect(trie.get('hello')).toBe('world');
    });

    it('should add multiple keys', () => {
      trie.insert('a', 'valueA');
      trie.insert('ab', 'valueAB');
      trie.insert('abc', 'valueABC');
      expect(trie.size).toBe(3);
      expect(trie.get('a')).toBe('valueA');
      expect(trie.get('ab')).toBe('valueAB');
      expect(trie.get('abc')).toBe('valueABC');
    });

    it('should update existing key', () => {
      trie.insert('key', 'value1');
      expect(trie.get('key')).toBe('value1');
      trie.insert('key', 'value2');
      expect(trie.get('key')).toBe('value2');
      expect(trie.size).toBe(1);
    });

    it('should handle empty string', () => {
      trie.insert('', 'emptyValue');
      expect(trie.size).toBe(1);
      expect(trie.get('')).toBe('emptyValue');
    });

    it('should handle unicode', () => {
      trie.insert('café', 'coffee');
      expect(trie.size).toBe(1);
      expect(trie.get('café')).toBe('coffee');
    });

    it('should handle special characters', () => {
      trie.insert('key!@#$', 'special');
      expect(trie.size).toBe(1);
      expect(trie.get('key!@#$')).toBe('special');
    });

    it('should handle emoji', () => {
      trie.insert('🚀', 'rocket');
      expect(trie.size).toBe(1);
      expect(trie.get('🚀')).toBe('rocket');
    });

    it('should handle undefined values', () => {
      trie.insert('key', undefined);
      expect(trie.size).toBe(1);
      expect(trie.get('key')).toBe(undefined);
    });

    it('should handle number values', () => {
      const numTrie = new BTrie<number>();
      numTrie.insert('one', 1);
      numTrie.insert('two', 2);
      numTrie.insert('three', 3);
      expect(numTrie.size).toBe(3);
      expect(numTrie.get('one')).toBe(1);
      expect(numTrie.get('two')).toBe(2);
      expect(numTrie.get('three')).toBe(3);
    });

    it('should handle object values', () => {
      const objTrie = new BTrie<{ value: number }>();
      objTrie.insert('a', { value: 1 });
      objTrie.insert('b', { value: 2 });
      expect(objTrie.size).toBe(2);
      expect(objTrie.get('a')).toEqual({ value: 1 });
      expect(objTrie.get('b')).toEqual({ value: 2 });
    });

    it('should handle similar keys', () => {
      trie.insert('abc', 'value1');
      trie.insert('abcd', 'value2');
      trie.insert('abce', 'value3');
      expect(trie.size).toBe(3);
      expect(trie.get('abc')).toBe('value1');
      expect(trie.get('abcd')).toBe('value2');
      expect(trie.get('abce')).toBe('value3');
    });
  });

  describe('delete', () => {
    it('should return false for non-existent key', () => {
      expect(trie.delete('nonexistent')).toBe(false);
      expect(trie.size).toBe(0);
    });

    it('should return true for existing key', () => {
      trie.insert('key', 'value');
      expect(trie.delete('key')).toBe(true);
      expect(trie.size).toBe(0);
    });

    it('should remove key', () => {
      trie.insert('a', 'valueA');
      trie.insert('b', 'valueB');
      trie.insert('c', 'valueC');
      expect(trie.has('b')).toBe(true);
      trie.delete('b');
      expect(trie.has('b')).toBe(false);
      expect(trie.has('a')).toBe(true);
      expect(trie.has('c')).toBe(true);
    });

    it('should handle empty string', () => {
      trie.insert('', 'value');
      expect(trie.delete('')).toBe(true);
      expect(trie.delete('')).toBe(false);
    });

    it('should handle unicode', () => {
      trie.insert('café', 'coffee');
      expect(trie.delete('café')).toBe(true);
      expect(trie.has('café')).toBe(false);
    });

    it('should work with multiple deletes', () => {
      trie.insert('a', 'valueA');
      trie.insert('b', 'valueB');
      trie.insert('c', 'valueC');
      expect(trie.size).toBe(3);
      expect(trie.delete('a')).toBe(true);
      expect(trie.delete('b')).toBe(true);
      expect(trie.delete('c')).toBe(true);
      expect(trie.size).toBe(0);
    });

    it('should not affect other keys', () => {
      trie.insert('abc', 'value1');
      trie.insert('abcd', 'value2');
      trie.insert('abce', 'value3');
      trie.delete('abcd');
      expect(trie.has('abc')).toBe(true);
      expect(trie.has('abcd')).toBe(false);
      expect(trie.has('abce')).toBe(true);
    });
  });

  describe('has', () => {
    it('should return false for non-existent key', () => {
      expect(trie.has('nonexistent')).toBe(false);
    });

    it('should return true for existing key', () => {
      trie.insert('key', 'value');
      expect(trie.has('key')).toBe(true);
    });

    it('should return false after delete', () => {
      trie.insert('key', 'value');
      expect(trie.has('key')).toBe(true);
      trie.delete('key');
      expect(trie.has('key')).toBe(false);
    });

    it('should handle empty string', () => {
      expect(trie.has('')).toBe(false);
      trie.insert('', 'value');
      expect(trie.has('')).toBe(true);
    });

    it('should handle unicode', () => {
      expect(trie.has('café')).toBe(false);
      trie.insert('café', 'coffee');
      expect(trie.has('café')).toBe(true);
    });

    it('should handle similar keys', () => {
      trie.insert('abc', 'value1');
      trie.insert('abcd', 'value2');
      expect(trie.has('abc')).toBe(true);
      expect(trie.has('abcd')).toBe(true);
      expect(trie.has('ab')).toBe(false);
      expect(trie.has('abcde')).toBe(false);
    });

    it('should be boolean type', () => {
      expect(typeof trie.has('test')).toBe('boolean');
    });
  });

  describe('get', () => {
    it('should return undefined for non-existent key', () => {
      expect(trie.get('nonexistent')).toBeUndefined();
    });

    it('should return value for existing key', () => {
      trie.insert('key', 'value');
      expect(trie.get('key')).toBe('value');
    });

    it('should return undefined after delete', () => {
      trie.insert('key', 'value');
      trie.delete('key');
      expect(trie.get('key')).toBeUndefined();
    });

    it('should handle empty string', () => {
      expect(trie.get('')).toBeUndefined();
      trie.insert('', 'value');
      expect(trie.get('')).toBe('value');
    });

    it('should handle undefined values', () => {
      trie.insert('key', undefined);
      expect(trie.get('key')).toBeUndefined();
    });

    it('should handle number values', () => {
      const numTrie = new BTrie<number>();
      numTrie.insert('one', 1);
      numTrie.insert('two', 2);
      expect(numTrie.get('one')).toBe(1);
      expect(numTrie.get('two')).toBe(2);
    });

    it('should handle object values', () => {
      const objTrie = new BTrie<{ value: number }>();
      objTrie.insert('a', { value: 1 });
      expect(objTrie.get('a')).toEqual({ value: 1 });
    });

    it('should return updated value', () => {
      trie.insert('key', 'value1');
      trie.insert('key', 'value2');
      expect(trie.get('key')).toBe('value2');
    });
  });

  describe('clear', () => {
    it('should reset size to 0', () => {
      trie.insert('a', 'valueA');
      trie.insert('b', 'valueB');
      trie.insert('c', 'valueC');
      expect(trie.size).toBe(3);
      trie.clear();
      expect(trie.size).toBe(0);
    });

    it('should reset isEmpty to true', () => {
      trie.insert('test', 'value');
      expect(trie.isEmpty()).toBe(false);
      trie.clear();
      expect(trie.isEmpty()).toBe(true);
    });

    it('should clear all keys', () => {
      trie.insert('a', 'valueA');
      trie.insert('b', 'valueB');
      trie.insert('c', 'valueC');
      trie.clear();
      expect(trie.has('a')).toBe(false);
      expect(trie.has('b')).toBe(false);
      expect(trie.has('c')).toBe(false);
    });

    it('should work on empty trie', () => {
      trie.clear();
      expect(trie.size).toBe(0);
      expect(trie.isEmpty()).toBe(true);
    });

    it('should allow operations after clear', () => {
      trie.insert('a', 'valueA');
      trie.clear();
      trie.insert('b', 'valueB');
      expect(trie.size).toBe(1);
      expect(trie.has('b')).toBe(true);
    });
  });

  describe('keysWithPrefix', () => {
    it('should return empty array for non-existent prefix', () => {
      expect(trie.keysWithPrefix('nonexistent')).toEqual([]);
    });

    it('should return all keys with prefix', () => {
      trie.insert('apple', '1');
      trie.insert('app', '2');
      trie.insert('application', '3');
      trie.insert('banana', '4');
      const keys = trie.keysWithPrefix('app');
      expect(keys).toContain('apple');
      expect(keys).toContain('app');
      expect(keys).toContain('application');
      expect(keys).not.toContain('banana');
    });

    it('should return empty array for empty trie', () => {
      expect(trie.keysWithPrefix('')).toEqual([]);
    });

    it('should return all keys with empty prefix', () => {
      trie.insert('a', '1');
      trie.insert('ab', '2');
      trie.insert('abc', '3');
      const keys = trie.keysWithPrefix('');
      expect(keys).toContain('a');
      expect(keys).toContain('ab');
      expect(keys).toContain('abc');
    });

    it('should return exact match', () => {
      trie.insert('apple', 'value');
      const keys = trie.keysWithPrefix('apple');
      expect(keys).toContain('apple');
    });

    it('should handle unicode', () => {
      trie.insert('café', 'coffee');
      trie.insert('caféau', 'milk');
      const keys = trie.keysWithPrefix('café');
      expect(keys).toContain('café');
      expect(keys).toContain('caféau');
    });

    it('should return array', () => {
      expect(Array.isArray(trie.keysWithPrefix('test'))).toBe(true);
    });
  });

  describe('startsWith', () => {
    it('should return false for non-existent prefix', () => {
      expect(trie.startsWith('nonexistent')).toBe(false);
    });

    it('should return true for existing prefix', () => {
      trie.insert('apple', 'value');
      trie.insert('app', 'value');
      expect(trie.startsWith('app')).toBe(true);
    });

    it('should return true for exact key', () => {
      trie.insert('apple', 'value');
      expect(trie.startsWith('apple')).toBe(true);
    });

    it('should return false for longer string', () => {
      trie.insert('app', 'value');
      expect(trie.startsWith('apple')).toBe(false);
    });

    it('should return false for empty trie', () => {
      expect(trie.startsWith('test')).toBe(false);
    });

    it('should handle empty prefix', () => {
      trie.insert('a', 'value');
      trie.insert('b', 'value');
      expect(trie.startsWith('')).toBe(true);
    });

    it('should return false for empty trie with empty prefix', () => {
      expect(trie.startsWith('')).toBe(false);
    });

    it('should be boolean type', () => {
      expect(typeof trie.startsWith('test')).toBe('boolean');
    });
  });

  describe('search', () => {
    it('should alias to get', () => {
      trie.insert('key', 'value');
      expect(trie.search('key')).toBe(trie.get('key'));
    });

    it('should return undefined for non-existent key', () => {
      expect(trie.search('nonexistent')).toBeUndefined();
    });

    it('should return value for existing key', () => {
      trie.insert('key', 'value');
      expect(trie.search('key')).toBe('value');
    });

    it('should work with multiple keys', () => {
      trie.insert('a', 'valueA');
      trie.insert('b', 'valueB');
      trie.insert('c', 'valueC');
      expect(trie.search('a')).toBe('valueA');
      expect(trie.search('b')).toBe('valueB');
      expect(trie.search('c')).toBe('valueC');
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty trie', () => {
      expect(trie.toArray()).toEqual([]);
    });

    it('should return all entries', () => {
      trie.insert('a', 'valueA');
      trie.insert('b', 'valueB');
      trie.insert('c', 'valueC');
      const entries = trie.toArray();
      expect(entries.length).toBe(3);
      expect(entries.find(e => e.key === 'a')).toBeDefined();
      expect(entries.find(e => e.key === 'b')).toBeDefined();
      expect(entries.find(e => e.key === 'c')).toBeDefined();
    });

    it('should return array of Entry objects', () => {
      trie.insert('key', 'value');
      const entries = trie.toArray();
      expect(entries[0].key).toBe('key');
      expect(entries[0].value).toBe('value');
    });

    it('should handle empty string key', () => {
      trie.insert('', 'value');
      const entries = trie.toArray();
      expect(entries.length).toBe(1);
      expect(entries[0].key).toBe('');
    });

    it('should handle number values', () => {
      const numTrie = new BTrie<number>();
      numTrie.insert('one', 1);
      numTrie.insert('two', 2);
      const entries = numTrie.toArray();
      expect(entries.length).toBe(2);
      expect(entries.find(e => e.key === 'one')).toBeDefined();
      expect(entries.find(e => e.key === 'two')).toBeDefined();
    });

    it('should handle object values', () => {
      const objTrie = new BTrie<{ value: number }>();
      objTrie.insert('a', { value: 1 });
      const entries = objTrie.toArray();
      expect(entries.length).toBe(1);
      expect(entries[0].key).toBe('a');
      expect(entries[0].value).toEqual({ value: 1 });
    });

    it('should not modify internal state', () => {
      trie.insert('key', 'value');
      const entries = trie.toArray();
      entries.push({ key: 'new', value: 'new' });
      expect(trie.size).toBe(1);
    });
  });

  describe('forEach', () => {
    it('should iterate over all entries', () => {
      trie.insert('a', 'valueA');
      trie.insert('b', 'valueB');
      trie.insert('c', 'valueC');
      const keys: string[] = [];
      const values: string[] = [];
      trie.forEach((value, key) => {
        keys.push(key);
        values.push(value);
      });
      expect(keys.length).toBe(3);
      expect(values.length).toBe(3);
      expect(keys).toContain('a');
      expect(keys).toContain('b');
      expect(keys).toContain('c');
    });

    it('should not call for empty trie', () => {
      let count = 0;
      trie.forEach(() => {
        count++;
      });
      expect(count).toBe(0);
    });

    it('should pass trie as third argument', () => {
      trie.insert('key', 'value');
      let passedTrie: BTrie<string> | null = null;
      trie.forEach((value, key, t) => {
        passedTrie = t;
      });
      expect(passedTrie).toBe(trie);
    });

    it('should handle number values', () => {
      const numTrie = new BTrie<number>();
      numTrie.insert('one', 1);
      numTrie.insert('two', 2);
      const values: number[] = [];
      numTrie.forEach((value) => {
        values.push(value);
      });
      expect(values).toContain(1);
      expect(values).toContain(2);
    });

    it('should handle object values', () => {
      const objTrie = new BTrie<{ value: number }>();
      objTrie.insert('a', { value: 1 });
      const values: { value: number }[] = [];
      objTrie.forEach((value) => {
        values.push(value);
      });
      expect(values[0]).toEqual({ value: 1 });
    });
  });

  describe('iterator', () => {
    it('should iterate over all entries', () => {
      trie.insert('a', 'valueA');
      trie.insert('b', 'valueB');
      trie.insert('c', 'valueC');
      const keys: string[] = [];
      for (const entry of trie) {
        keys.push(entry.key);
      }
      expect(keys.length).toBe(3);
      expect(keys).toContain('a');
      expect(keys).toContain('b');
      expect(keys).toContain('c');
    });

    it('should iterate empty trie', () => {
      const keys: string[] = [];
      for (const entry of trie) {
        keys.push(entry.key);
      }
      expect(keys).toEqual([]);
    });

    it('should return Entry objects', () => {
      trie.insert('key', 'value');
      for (const entry of trie) {
        expect(entry.key).toBe('key');
        expect(entry.value).toBe('value');
      }
    });

    it('should work with spread', () => {
      trie.insert('a', 'valueA');
      trie.insert('b', 'valueB');
      const entries = [...trie];
      expect(entries.length).toBe(2);
    });

    it('should work with for...of', () => {
      trie.insert('a', 'valueA');
      trie.insert('b', 'valueB');
      let count = 0;
      for (const entry of trie) {
        expect(entry.key).toBeDefined();
        expect(entry.value).toBeDefined();
        count++;
      }
      expect(count).toBe(2);
    });

    it('should handle number values', () => {
      const numTrie = new BTrie<number>();
      numTrie.insert('one', 1);
      numTrie.insert('two', 2);
      const values: number[] = [];
      for (const entry of numTrie) {
        values.push(entry.value);
      }
      expect(values).toContain(1);
      expect(values).toContain(2);
    });
  });

  describe('longestPrefixOf', () => {
    it('should return empty string for empty trie', () => {
      expect(trie.longestPrefixOf('test')).toBe('');
    });

    it('should return empty string for no match', () => {
      trie.insert('apple', 'value');
      expect(trie.longestPrefixOf('banana')).toBe('');
    });

    it('should return exact match', () => {
      trie.insert('apple', 'value');
      expect(trie.longestPrefixOf('apple')).toBe('apple');
    });

    it.skip('should return partial match', () => {
      trie.insert('app', 'value1');
      trie.insert('apple', 'value2');
      expect(trie.longestPrefixOf('application')).toBe('apple');
    });

    it('should return empty string for empty input', () => {
      trie.insert('key', 'value');
      expect(trie.longestPrefixOf('')).toBe('');
    });

    it('should return longest prefix among multiple matches', () => {
      trie.insert('a', 'valueA');
      trie.insert('ab', 'valueAB');
      trie.insert('abc', 'valueABC');
      expect(trie.longestPrefixOf('abcd')).toBe('abc');
    });

    it('should return string type', () => {
      expect(typeof trie.longestPrefixOf('test')).toBe('string');
    });

    it('should handle unicode', () => {
      trie.insert('café', 'value');
      expect(trie.longestPrefixOf('caféau')).toBe('café');
    });

    it('should handle special characters', () => {
      trie.insert('key!@#$', 'value');
      expect(trie.longestPrefixOf('key!@#$xyz')).toBe('key!@#$');
    });
  });

  describe('countForPrefix', () => {
    it('should return 0 for non-existent prefix', () => {
      expect(trie.countForPrefix('nonexistent')).toBe(0);
    });

    it('should count keys with prefix', () => {
      trie.insert('apple', '1');
      trie.insert('app', '2');
      trie.insert('application', '3');
      trie.insert('banana', '4');
      expect(trie.countForPrefix('app')).toBe(3);
    });

    it('should return 0 for empty trie', () => {
      expect(trie.countForPrefix('test')).toBe(0);
    });

    it('should count all keys with empty prefix', () => {
      trie.insert('a', '1');
      trie.insert('ab', '2');
      trie.insert('abc', '3');
      expect(trie.countForPrefix('')).toBe(3);
    });

    it('should count exact match', () => {
      trie.insert('apple', 'value');
      expect(trie.countForPrefix('apple')).toBe(1);
    });

    it('should return number type', () => {
      expect(typeof trie.countForPrefix('test')).toBe('number');
    });

    it('should handle unicode', () => {
      trie.insert('café', 'coffee');
      trie.insert('caféau', 'milk');
      trie.insert('banana', 'fruit');
      expect(trie.countForPrefix('café')).toBe(2);
    });
  });

  describe('bucket burst', () => {
    it('should handle burst at threshold', () => {
      const burstTrie = new BTrie<string>(5);
      for (let i = 0; i < 6; i++) {
        burstTrie.insert(`key${i}`, `value${i}`);
      }
      expect(burstTrie.size).toBe(6);
      expect(burstTrie.has('key0')).toBe(true);
      expect(burstTrie.has('key5')).toBe(true);
    });

    it('should maintain functionality after burst', () => {
      const burstTrie = new BTrie<string>(5);
      for (let i = 0; i < 10; i++) {
        burstTrie.insert(`key${i}`, `value${i}`);
      }
      expect(burstTrie.size).toBe(10);
      for (let i = 0; i < 10; i++) {
        expect(burstTrie.get(`key${i}`)).toBe(`value${i}`);
      }
    });

    it('should delete after burst', () => {
      const burstTrie = new BTrie<string>(5);
      for (let i = 0; i < 10; i++) {
        burstTrie.insert(`key${i}`, `value${i}`);
      }
      burstTrie.delete('key5');
      expect(burstTrie.has('key5')).toBe(false);
      expect(burstTrie.has('key0')).toBe(true);
      expect(burstTrie.size).toBe(9);
    });

    it('should update after burst', () => {
      const burstTrie = new BTrie<string>(5);
      for (let i = 0; i < 10; i++) {
        burstTrie.insert(`key${i}`, `value${i}`);
      }
      burstTrie.insert('key5', 'newValue');
      expect(burstTrie.get('key5')).toBe('newValue');
      expect(burstTrie.size).toBe(10);
    });
  });

  describe('integration', () => {
    it('should handle insert/delete/insert cycle', () => {
      trie.insert('key', 'value1');
      expect(trie.get('key')).toBe('value1');
      trie.delete('key');
      expect(trie.get('key')).toBeUndefined();
      trie.insert('key', 'value2');
      expect(trie.get('key')).toBe('value2');
    });

    it('should handle clear/insert cycle', () => {
      trie.insert('a', 'valueA');
      trie.insert('b', 'valueB');
      trie.clear();
      trie.insert('c', 'valueC');
      expect(trie.size).toBe(1);
      expect(trie.has('c')).toBe(true);
    });

    it('should maintain consistency across operations', () => {
      const items = [
        { key: 'a', value: 'valueA' },
        { key: 'ab', value: 'valueAB' },
        { key: 'abc', value: 'valueABC' },
        { key: 'b', value: 'valueB' },
        { key: 'bc', value: 'valueBC' }
      ];
      items.forEach(item => trie.insert(item.key, item.value));
      expect(trie.size).toBe(5);
      items.forEach(item => {
        expect(trie.get(item.key)).toBe(item.value);
      });
    });

    it('should handle large number of keys', () => {
      const largeTrie = new BTrie<string>();
      for (let i = 0; i < 1000; i++) {
        largeTrie.insert(`key${i}`, `value${i}`);
      }
      expect(largeTrie.size).toBe(1000);
      for (let i = 0; i < 1000; i++) {
        expect(largeTrie.get(`key${i}`)).toBe(`value${i}`);
      }
    });

    it('should handle mixed value types', () => {
      const mixedTrie = new BTrie<unknown>();
      mixedTrie.insert('string', 'stringValue');
      mixedTrie.insert('number', 42);
      mixedTrie.insert('boolean', true);
      mixedTrie.insert('object', { a: 1 });
      mixedTrie.insert('array', [1, 2, 3]);
      expect(mixedTrie.get('string')).toBe('stringValue');
      expect(mixedTrie.get('number')).toBe(42);
      expect(mixedTrie.get('boolean')).toBe(true);
      expect(mixedTrie.get('object')).toEqual({ a: 1 });
      expect(mixedTrie.get('array')).toEqual([1, 2, 3]);
    });
  });

  describe('edge cases', () => {
    it('should handle whitespace', () => {
      trie.insert('  test  ', 'value');
      expect(trie.has('  test  ')).toBe(true);
      expect(trie.has('test')).toBe(false);
    });

    it('should handle newlines', () => {
      trie.insert('test\nvalue', 'value');
      expect(trie.has('test\nvalue')).toBe(true);
    });

    it('should handle very long keys', () => {
      const longKey = 'a'.repeat(10000);
      trie.insert(longKey, 'value');
      expect(trie.has(longKey)).toBe(true);
      expect(trie.get(longKey)).toBe('value');
    });

    it('should handle keys with null character', () => {
      trie.insert('key\x00', 'value');
      expect(trie.has('key\x00')).toBe(true);
    });

    it('should handle case sensitivity', () => {
      trie.insert('hello', 'value1');
      trie.insert('HELLO', 'value2');
      trie.insert('Hello', 'value3');
      expect(trie.get('hello')).toBe('value1');
      expect(trie.get('HELLO')).toBe('value2');
      expect(trie.get('Hello')).toBe('value3');
    });
  });

  describe('performance', () => {
    it('should handle rapid insertions', () => {
      const perfTrie = new BTrie<string>();
      const start = Date.now();
      for (let i = 0; i < 10000; i++) {
        perfTrie.insert(`key${i}`, `value${i}`);
      }
      const duration = Date.now() - start;
      expect(perfTrie.size).toBe(10000);
      expect(duration).toBeLessThan(5000);
    });

    it('should handle rapid lookups', () => {
      const perfTrie = new BTrie<string>();
      for (let i = 0; i < 10000; i++) {
        perfTrie.insert(`key${i}`, `value${i}`);
      }
      const start = Date.now();
      for (let i = 0; i < 10000; i++) {
        perfTrie.get(`key${i}`);
      }
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000);
    });

    it('should handle rapid deletions', () => {
      const perfTrie = new BTrie<string>();
      for (let i = 0; i < 10000; i++) {
        perfTrie.insert(`key${i}`, `value${i}`);
      }
      const start = Date.now();
      for (let i = 0; i < 10000; i++) {
        perfTrie.delete(`key${i}`);
      }
      const duration = Date.now() - start;
      expect(perfTrie.size).toBe(0);
      expect(duration).toBeLessThan(5000);
    });
  });

  describe('complex scenarios', () => {
    it('should handle nested keys', () => {
      trie.insert('a', 'valueA');
      trie.insert('aa', 'valueAA');
      trie.insert('aaa', 'valueAAA');
      trie.insert('aaaa', 'valueAAAA');
      expect(trie.keysWithPrefix('a')).toContain('a');
      expect(trie.keysWithPrefix('a')).toContain('aa');
      expect(trie.keysWithPrefix('a')).toContain('aaa');
      expect(trie.keysWithPrefix('a')).toContain('aaaa');
    });

    it('should handle overlapping keys', () => {
      trie.insert('abc', 'valueABC');
      trie.insert('abd', 'valueABD');
      trie.insert('ab', 'valueAB');
      trie.insert('a', 'valueA');
      expect(trie.longestPrefixOf('abcd')).toBe('abc');
      expect(trie.longestPrefixOf('abdx')).toBe('abd');
    });

    it('should handle branching keys', () => {
      trie.insert('ab', 'valueAB');
      trie.insert('ac', 'valueAC');
      trie.insert('ad', 'valueAD');
      expect(trie.keysWithPrefix('a')).toContain('ab');
      expect(trie.keysWithPrefix('a')).toContain('ac');
      expect(trie.keysWithPrefix('a')).toContain('ad');
      expect(trie.countForPrefix('a')).toBe(3);
    });
  });
});
