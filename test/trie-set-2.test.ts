import { describe, it, expect, beforeEach } from 'vitest';
import { TrieSet2 } from '../src/core/trie-set-2/index.js';

describe('TrieSet2', () => {
  let trie: TrieSet2;

  beforeEach(() => {
    trie = new TrieSet2();
  });

  describe('empty trie', () => {
    it('should be empty on creation', () => {
      expect(trie.isEmpty()).toBe(true);
    });

    it('should have size 0 on creation', () => {
      expect(trie.size()).toBe(0);
    });

    it('should return false for has on empty trie', () => {
      expect(trie.has('hello')).toBe(false);
    });

    it('should return false for delete on empty trie', () => {
      expect(trie.delete('hello')).toBe(false);
    });

    it('should return false for startsWith on empty trie', () => {
      expect(trie.startsWith('hello')).toBe(false);
    });

    it('should return empty array for wordsWithPrefix', () => {
      expect(trie.wordsWithPrefix('')).toEqual([]);
      expect(trie.wordsWithPrefix('a')).toEqual([]);
    });

    it('should return empty array for toArray', () => {
      expect(trie.toArray()).toEqual([]);
    });
  });

  describe('add and has', () => {
    it('should add single word', () => {
      trie.add('hello');
      expect(trie.has('hello')).toBe(true);
      expect(trie.size()).toBe(1);
    });

    it('should add multiple words', () => {
      trie.add('hello');
      trie.add('world');
      trie.add('test');
      expect(trie.has('hello')).toBe(true);
      expect(trie.has('world')).toBe(true);
      expect(trie.has('test')).toBe(true);
      expect(trie.size()).toBe(3);
    });

    it('should not have word that was not added', () => {
      trie.add('hello');
      expect(trie.has('world')).toBe(false);
    });

    it('should handle duplicate words', () => {
      trie.add('hello');
      trie.add('hello');
      expect(trie.has('hello')).toBe(true);
      expect(trie.size()).toBe(1);
    });

    it('should handle prefix relationships', () => {
      trie.add('he');
      trie.add('hello');
      trie.add('hell');
      expect(trie.has('he')).toBe(true);
      expect(trie.has('hello')).toBe(true);
      expect(trie.has('hell')).toBe(true);
      expect(trie.size()).toBe(3);
    });
  });

  describe('delete', () => {
    it('should delete existing word', () => {
      trie.add('hello');
      expect(trie.delete('hello')).toBe(true);
      expect(trie.has('hello')).toBe(false);
      expect(trie.size()).toBe(0);
    });

    it('should return false when deleting non-existent word', () => {
      trie.add('hello');
      expect(trie.delete('world')).toBe(false);
      expect(trie.size()).toBe(1);
    });

    it('should handle deleting word with prefix that is also a word', () => {
      trie.add('he');
      trie.add('hello');
      trie.delete('hello');
      expect(trie.has('hello')).toBe(false);
      expect(trie.has('he')).toBe(true);
      expect(trie.size()).toBe(1);
    });

    it('should handle deleting prefix word when longer words exist', () => {
      trie.add('he');
      trie.add('hello');
      trie.delete('he');
      expect(trie.has('he')).toBe(false);
      expect(trie.has('hello')).toBe(true);
      expect(trie.size()).toBe(1);
    });

    it('should handle deleting word that creates new leaf', () => {
      trie.add('hello');
      trie.add('hell');
      trie.delete('hello');
      expect(trie.has('hello')).toBe(false);
      expect(trie.has('hell')).toBe(true);
      expect(trie.size()).toBe(1);
    });

    it('should handle duplicate delete', () => {
      trie.add('hello');
      trie.delete('hello');
      expect(trie.delete('hello')).toBe(false);
      expect(trie.size()).toBe(0);
    });
  });

  describe('size', () => {
    it('should track size correctly with adds', () => {
      expect(trie.size()).toBe(0);
      trie.add('a');
      expect(trie.size()).toBe(1);
      trie.add('ab');
      expect(trie.size()).toBe(2);
      trie.add('abc');
      expect(trie.size()).toBe(3);
    });

    it('should track size correctly with deletes', () => {
      trie.add('a');
      trie.add('ab');
      trie.add('abc');
      expect(trie.size()).toBe(3);
      trie.delete('ab');
      expect(trie.size()).toBe(2);
      trie.delete('abc');
      expect(trie.size()).toBe(1);
    });

    it('should not increase size for duplicates', () => {
      trie.add('hello');
      trie.add('hello');
      trie.add('hello');
      expect(trie.size()).toBe(1);
    });
  });

  describe('clear', () => {
    it('should clear empty trie', () => {
      trie.clear();
      expect(trie.isEmpty()).toBe(true);
      expect(trie.size()).toBe(0);
    });

    it('should clear non-empty trie', () => {
      trie.add('hello');
      trie.add('world');
      trie.add('test');
      trie.clear();
      expect(trie.isEmpty()).toBe(true);
      expect(trie.size()).toBe(0);
      expect(trie.has('hello')).toBe(false);
      expect(trie.has('world')).toBe(false);
      expect(trie.has('test')).toBe(false);
    });

    it('should allow adding after clear', () => {
      trie.add('hello');
      trie.clear();
      trie.add('world');
      expect(trie.has('world')).toBe(true);
      expect(trie.size()).toBe(1);
    });
  });

  describe('startsWith', () => {
    beforeEach(() => {
      trie.add('hello');
      trie.add('world');
      trie.add('help');
      trie.add('helium');
    });

    it('should return true for existing prefix', () => {
      expect(trie.startsWith('h')).toBe(true);
      expect(trie.startsWith('he')).toBe(true);
      expect(trie.startsWith('hel')).toBe(true);
      expect(trie.startsWith('hell')).toBe(true);
      expect(trie.startsWith('hello')).toBe(true);
      expect(trie.startsWith('w')).toBe(true);
      expect(trie.startsWith('wo')).toBe(true);
    });

    it('should return false for non-existing prefix', () => {
      expect(trie.startsWith('x')).toBe(false);
      expect(trie.startsWith('hx')).toBe(false);
      expect(trie.startsWith('helloo')).toBe(false);
      expect(trie.startsWith('worlds')).toBe(false);
    });

    it('should handle empty prefix', () => {
      expect(trie.startsWith('')).toBe(true);
    });

    it('should handle single character prefix', () => {
      expect(trie.startsWith('a')).toBe(false);
      expect(trie.startsWith('h')).toBe(true);
      expect(trie.startsWith('w')).toBe(true);
    });
  });

  describe('wordsWithPrefix', () => {
    beforeEach(() => {
      trie.add('hello');
      trie.add('help');
      trie.add('helium');
      trie.add('world');
      trie.add('work');
    });

    it('should return words with empty prefix', () => {
      const words = trie.wordsWithPrefix('');
      expect(words).toHaveLength(5);
      expect(words).toContain('hello');
      expect(words).toContain('help');
      expect(words).toContain('helium');
      expect(words).toContain('world');
      expect(words).toContain('work');
    });

    it('should return words with prefix h', () => {
      const words = trie.wordsWithPrefix('h');
      expect(words).toHaveLength(3);
      expect(words).toContain('hello');
      expect(words).toContain('help');
      expect(words).toContain('helium');
    });

    it('should return words with prefix he', () => {
      const words = trie.wordsWithPrefix('he');
      expect(words).toHaveLength(3);
      expect(words).toContain('hello');
      expect(words).toContain('help');
      expect(words).toContain('helium');
    });

    it('should return words with prefix hel', () => {
      const words = trie.wordsWithPrefix('hel');
      expect(words).toHaveLength(3);
      expect(words).toContain('hello');
      expect(words).toContain('help');
      expect(words).toContain('helium');
    });

    it('should return words with prefix hell', () => {
      const words = trie.wordsWithPrefix('hell');
      expect(words).toHaveLength(1);
      expect(words).toContain('hello');
    });

    it('should return words with prefix hello', () => {
      const words = trie.wordsWithPrefix('hello');
      expect(words).toEqual(['hello']);
    });

    it('should return words with prefix w', () => {
      const words = trie.wordsWithPrefix('w');
      expect(words).toHaveLength(2);
      expect(words).toContain('world');
      expect(words).toContain('work');
    });

    it('should return empty array for non-existing prefix', () => {
      expect(trie.wordsWithPrefix('x')).toEqual([]);
      expect(trie.wordsWithPrefix('helloo')).toEqual([]);
    });

    it('should handle empty trie', () => {
      const emptyTrie = new TrieSet2();
      expect(emptyTrie.wordsWithPrefix('')).toEqual([]);
      expect(emptyTrie.wordsWithPrefix('a')).toEqual([]);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty trie', () => {
      expect(trie.isEmpty()).toBe(true);
    });

    it('should return false after adding words', () => {
      trie.add('hello');
      expect(trie.isEmpty()).toBe(false);
    });

    it('should return true after deleting all words', () => {
      trie.add('hello');
      trie.add('world');
      trie.delete('hello');
      trie.delete('world');
      expect(trie.isEmpty()).toBe(true);
    });

    it('should return true after clear', () => {
      trie.add('hello');
      trie.clear();
      expect(trie.isEmpty()).toBe(true);
    });

    it('should return false when prefix exists but is not a word', () => {
      trie.add('hello');
      expect(trie.isEmpty()).toBe(false);
    });
  });

  describe('toArray', () => {
    beforeEach(() => {
      trie.add('hello');
      trie.add('world');
      trie.add('test');
      trie.add('alpha');
      trie.add('beta');
    });

    it('should return sorted array of all words', () => {
      const arr = trie.toArray();
      expect(arr).toEqual(['alpha', 'beta', 'hello', 'test', 'world']);
    });

    it('should return empty array for empty trie', () => {
      const emptyTrie = new TrieSet2();
      expect(emptyTrie.toArray()).toEqual([]);
    });

    it('should handle single word', () => {
      const singleTrie = new TrieSet2();
      singleTrie.add('hello');
      expect(singleTrie.toArray()).toEqual(['hello']);
    });

    it('should return array with correct length', () => {
      const arr = trie.toArray();
      expect(arr).toHaveLength(5);
    });

    it('should be sorted alphabetically', () => {
      const arr = trie.toArray();
      for (let i = 0; i < arr.length - 1; i++) {
        expect(arr[i]! < arr[i + 1]!).toBe(true);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle empty string', () => {
      trie.add('');
      expect(trie.has('')).toBe(true);
      expect(trie.size()).toBe(1);
      expect(trie.startsWith('')).toBe(true);
      expect(trie.wordsWithPrefix('')).toEqual(['']);
      expect(trie.toArray()).toEqual(['']);
      expect(trie.delete('')).toBe(true);
      expect(trie.has('')).toBe(false);
    });

    it('should handle single character', () => {
      trie.add('a');
      expect(trie.has('a')).toBe(true);
      expect(trie.size()).toBe(1);
      expect(trie.startsWith('a')).toBe(true);
      expect(trie.wordsWithPrefix('a')).toEqual(['a']);
      expect(trie.toArray()).toEqual(['a']);
    });

    it('should handle words with same prefix at end', () => {
      trie.add('cat');
      trie.add('bat');
      trie.add('rat');
      expect(trie.has('cat')).toBe(true);
      expect(trie.has('bat')).toBe(true);
      expect(trie.has('rat')).toBe(true);
      expect(trie.startsWith('at')).toBe(false);
    });
  });

  describe('large dataset', () => {
    it('should handle 1000 words', () => {
      for (let i = 0; i < 1000; i++) {
        trie.add(`word${i}`);
      }
      expect(trie.size()).toBe(1000);

      for (let i = 0; i < 1000; i++) {
        expect(trie.has(`word${i}`)).toBe(true);
      }

      const arr = trie.toArray();
      expect(arr).toHaveLength(1000);
    });

    it('should handle adding and deleting many words', () => {
      for (let i = 0; i < 100; i++) {
        trie.add(`word${i}`);
      }
      expect(trie.size()).toBe(100);

      for (let i = 0; i < 50; i++) {
        trie.delete(`word${i}`);
      }
      expect(trie.size()).toBe(50);
    });

    it('should handle words with common prefixes efficiently', () => {
      trie.add('a');
      trie.add('aa');
      trie.add('aaa');
      trie.add('aaaa');
      trie.add('ab');
      trie.add('aba');
      trie.add('abab');
      expect(trie.size()).toBe(7);
      expect(trie.toArray()).toEqual(['a', 'aa', 'aaa', 'aaaa', 'ab', 'aba', 'abab']);
    });
  });
});
