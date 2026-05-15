import { describe, it, expect } from 'vitest';
import { TrieMap2 } from '../src/core/trie-map-2/index.js';

describe('TrieMap2', () => {
  describe('set, get, has', () => {
    it('should set and get values', () => {
      const trie = new TrieMap2<number>();
      trie.set('hello', 1);
      trie.set('world', 2);
      expect(trie.get('hello')).toBe(1);
      expect(trie.get('world')).toBe(2);
    });

    it('should return undefined for non-existent keys', () => {
      const trie = new TrieMap2<number>();
      trie.set('hello', 1);
      expect(trie.get('world')).toBeUndefined();
    });

    it('should check if key exists', () => {
      const trie = new TrieMap2<number>();
      trie.set('hello', 1);
      expect(trie.has('hello')).toBe(true);
      expect(trie.has('world')).toBe(false);
    });

    it('should handle empty string key', () => {
      const trie = new TrieMap2<number>();
      trie.set('', 42);
      expect(trie.get('')).toBe(42);
      expect(trie.has('')).toBe(true);
      expect(trie.size).toBe(1);
    });
  });

  describe('delete', () => {
    it('should delete existing key', () => {
      const trie = new TrieMap2<number>();
      trie.set('hello', 1);
      expect(trie.delete('hello')).toBe(true);
      expect(trie.has('hello')).toBe(false);
      expect(trie.get('hello')).toBeUndefined();
      expect(trie.size).toBe(0);
    });

    it('should return false for non-existent key', () => {
      const trie = new TrieMap2<number>();
      expect(trie.delete('hello')).toBe(false);
    });

    it('should not delete prefix of existing key', () => {
      const trie = new TrieMap2<number>();
      trie.set('hello', 1);
      trie.set('hello world', 2);
      trie.delete('hello');
      expect(trie.has('hello')).toBe(false);
      expect(trie.has('hello world')).toBe(true);
      expect(trie.size).toBe(1);
    });

    it('should delete empty string key', () => {
      const trie = new TrieMap2<number>();
      trie.set('', 42);
      trie.set('hello', 1);
      expect(trie.delete('')).toBe(true);
      expect(trie.has('')).toBe(false);
      expect(trie.size).toBe(1);
    });
  });

  describe('hasPrefix', () => {
    it('should check if prefix exists', () => {
      const trie = new TrieMap2<number>();
      trie.set('hello', 1);
      trie.set('help', 2);
      expect(trie.hasPrefix('he')).toBe(true);
      expect(trie.hasPrefix('hel')).toBe(true);
      expect(trie.hasPrefix('hell')).toBe(true);
      expect(trie.hasPrefix('hello')).toBe(true);
      expect(trie.hasPrefix('helloo')).toBe(false);
      expect(trie.hasPrefix('world')).toBe(false);
    });

    it('should return true for empty prefix', () => {
      const trie = new TrieMap2<number>();
      expect(trie.hasPrefix('')).toBe(true);
    });
  });

  describe('keysWithPrefix', () => {
    it('should return keys with prefix', () => {
      const trie = new TrieMap2<number>();
      trie.set('hello', 1);
      trie.set('help', 2);
      trie.set('hell', 3);
      trie.set('world', 4);
      expect(trie.keysWithPrefix('he').sort()).toEqual(['hell', 'hello', 'help'].sort());
    });

    it('should return empty array for non-existent prefix', () => {
      const trie = new TrieMap2<number>();
      trie.set('hello', 1);
      expect(trie.keysWithPrefix('wor')).toEqual([]);
    });

    it('should return all keys for empty prefix', () => {
      const trie = new TrieMap2<number>();
      trie.set('hello', 1);
      trie.set('help', 2);
      trie.set('world', 3);
      expect(trie.keysWithPrefix('').sort()).toEqual(['hello', 'help', 'world'].sort());
    });

    it('should include the prefix key if it exists', () => {
      const trie = new TrieMap2<number>();
      trie.set('he', 1);
      trie.set('hello', 2);
      expect(trie.keysWithPrefix('he').sort()).toEqual(['he', 'hello'].sort());
    });
  });

  describe('startsWith', () => {
    it('should alias keysWithPrefix', () => {
      const trie = new TrieMap2<number>();
      trie.set('hello', 1);
      trie.set('help', 2);
      trie.set('world', 3);
      expect(trie.startsWith('he').sort()).toEqual(['hello', 'help'].sort());
    });
  });

  describe('size', () => {
    it('should return correct size', () => {
      const trie = new TrieMap2<number>();
      expect(trie.size).toBe(0);
      trie.set('hello', 1);
      expect(trie.size).toBe(1);
      trie.set('world', 2);
      expect(trie.size).toBe(2);
      trie.set('hello', 3);
      expect(trie.size).toBe(2);
    });

    it('should update size on delete', () => {
      const trie = new TrieMap2<number>();
      trie.set('hello', 1);
      trie.set('world', 2);
      trie.delete('hello');
      expect(trie.size).toBe(1);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty trie', () => {
      const trie = new TrieMap2<number>();
      expect(trie.isEmpty()).toBe(true);
    });

    it('should return false after adding items', () => {
      const trie = new TrieMap2<number>();
      trie.set('hello', 1);
      expect(trie.isEmpty()).toBe(false);
    });

    it('should return true after clearing', () => {
      const trie = new TrieMap2<number>();
      trie.set('hello', 1);
      trie.set('world', 2);
      trie.clear();
      expect(trie.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear all entries', () => {
      const trie = new TrieMap2<number>();
      trie.set('hello', 1);
      trie.set('world', 2);
      trie.set('test', 3);
      trie.clear();
      expect(trie.size).toBe(0);
      expect(trie.isEmpty()).toBe(true);
      expect(trie.get('hello')).toBeUndefined();
      expect(trie.get('world')).toBeUndefined();
      expect(trie.get('test')).toBeUndefined();
    });

    it('should allow reuse after clear', () => {
      const trie = new TrieMap2<number>();
      trie.set('hello', 1);
      trie.clear();
      trie.set('world', 2);
      expect(trie.size).toBe(1);
      expect(trie.get('world')).toBe(2);
    });
  });

  describe('edge cases', () => {
    it('should handle empty string key', () => {
      const trie = new TrieMap2<number>();
      trie.set('', 42);
      expect(trie.get('')).toBe(42);
      expect(trie.has('')).toBe(true);
    });

    it('should handle prefix search', () => {
      const trie = new TrieMap2<number>();
      trie.set('car', 1);
      trie.set('card', 2);
      trie.set('care', 3);
      trie.set('careful', 4);
      expect(trie.has('car')).toBe(true);
      expect(trie.has('card')).toBe(true);
      expect(trie.has('care')).toBe(true);
      expect(trie.has('careful')).toBe(true);
      expect(trie.has('cat')).toBe(false);
    });

    it('should handle update existing key', () => {
      const trie = new TrieMap2<number>();
      trie.set('key', 1);
      trie.set('key', 2);
      expect(trie.get('key')).toBe(2);
      expect(trie.size).toBe(1);
    });

    it('should handle numeric string keys', () => {
      const trie = new TrieMap2<number>();
      trie.set('123', 1);
      trie.set('124', 2);
      expect(trie.get('123')).toBe(1);
      expect(trie.get('124')).toBe(2);
      expect(trie.get('12')).toBeUndefined();
    });

    it('should handle delete then re-add', () => {
      const trie = new TrieMap2<number>();
      trie.set('abc', 1);
      trie.delete('abc');
      expect(trie.has('abc')).toBe(false);
      trie.set('abc', 2);
      expect(trie.get('abc')).toBe(2);
      expect(trie.size).toBe(1);
    });

    it('should handle keysWithPrefix returning empty for missing prefix', () => {
      const trie = new TrieMap2<number>();
      trie.set('apple', 1);
      expect(trie.keysWithPrefix('ban')).toEqual([]);
    });

    it('should handle clear and re-populate', () => {
      const trie = new TrieMap2<number>();
      trie.set('a', 1);
      trie.set('b', 2);
      trie.clear();
      expect(trie.size).toBe(0);
      trie.set('c', 3);
      expect(trie.get('c')).toBe(3);
      expect(trie.size).toBe(1);
    });

    it('should handle hasPrefix for partial match', () => {
      const trie = new TrieMap2<number>();
      trie.set('hello', 1);
      expect(trie.hasPrefix('hel')).toBe(true);
      expect(trie.hasPrefix('xyz')).toBe(false);
    });

    it('should handle startsWith same as keysWithPrefix', () => {
      const trie = new TrieMap2<number>();
      trie.set('apple', 1);
      trie.set('application', 2);
      expect(trie.startsWith('app')).toEqual(['apple', 'application']);
    });

    it('should handle delete then has', () => {
      const trie = new TrieMap2<number>();
      trie.set('hello', 1);
      expect(trie.delete('hello')).toBe(true);
      expect(trie.has('hello')).toBe(false);
      expect(trie.size).toBe(0);
    });

    it('should handle clear', () => {
      const trie = new TrieMap2<number>();
      trie.set('hello', 1);
      trie.set('world', 2);
      trie.clear();
      expect(trie.size).toBe(0);
      expect(trie.isEmpty()).toBe(true);
    });

    it('should handle keysWithPrefix', () => {
      const trie = new TrieMap2<number>();
      trie.set('apple', 1);
      trie.set('application', 2);
      trie.set('banana', 3);
      const keys = trie.keysWithPrefix('app');
      expect(keys).toContain('apple');
      expect(keys).toContain('application');
      expect(keys).not.toContain('banana');
    });

    it('should handle hasPrefix', () => {
      const trie = new TrieMap2<number>();
      trie.set('apple', 1);
      trie.set('banana', 2);
      expect(trie.hasPrefix('app')).toBe(true);
      expect(trie.hasPrefix('ban')).toBe(true);
      expect(trie.hasPrefix('xyz')).toBe(false);
    });

    it('should handle delete', () => {
      const trie = new TrieMap2<number>();
      trie.set('apple', 1);
      trie.set('banana', 2);
      expect(trie.delete('apple')).toBe(true);
      expect(trie.has('apple')).toBe(false);
      expect(trie.size).toBe(1);
    });

    it('should handle clear', () => {
      const trie = new TrieMap2<number>();
      trie.set('apple', 1);
      trie.set('banana', 2);
      trie.clear();
      expect(trie.size).toBe(0);
      expect(trie.isEmpty()).toBe(true);
    });

    it('should handle keys with prefix', () => {
      const t = new TrieMap2<number>();
      t.set('apple', 1);
      t.set('application', 2);
      t.set('banana', 3);
      const keys = t.keysWithPrefix('app');
      expect(keys.length).toBe(2);
    });

    it('should handle hasPrefix', () => {
      const t = new TrieMap2<number>();
      t.set('apple', 1);
      t.set('application', 2);
      expect(t.hasPrefix('app')).toBe(true);
      expect(t.hasPrefix('zzz')).toBe(false);
    });
  });
});
