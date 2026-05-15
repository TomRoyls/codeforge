import { describe, it, expect } from 'vitest';
import { RadixTree } from './src/core/radix-tree/index.js';

describe('RadixTree', () => {
  describe('empty tree', () => {
    it('should have size 0', () => {
      const tree = new RadixTree();
      expect(tree.size).toBe(0);
    });

    it('should be empty', () => {
      const tree = new RadixTree();
      expect(tree.isEmpty()).toBe(true);
    });

    it('should return false for search', () => {
      const tree = new RadixTree();
      expect(tree.search('test')).toBe(false);
    });

    it('should return false for hasWord', () => {
      const tree = new RadixTree();
      expect(tree.hasWord('test')).toBe(false);
    });

    it('should return true for startsWith empty prefix', () => {
      const tree = new RadixTree();
      expect(tree.startsWith('')).toBe(true);
    });

    it('should return false for startsWith non-empty prefix', () => {
      const tree = new RadixTree();
      expect(tree.startsWith('a')).toBe(false);
    });

    it('should return empty array for getAllWords', () => {
      const tree = new RadixTree();
      expect(tree.getAllWords()).toEqual([]);
    });

    it('should return empty string for longestCommonPrefix', () => {
      const tree = new RadixTree();
      expect(tree.longestCommonPrefix()).toBe('');
    });

    it('should not throw on clear', () => {
      const tree = new RadixTree();
      tree.clear();
      expect(tree.size).toBe(0);
    });

    it('should not throw on forEach', () => {
      const tree = new RadixTree();
      const words: string[] = [];
      tree.forEach(word => words.push(word));
      expect(words).toEqual([]);
    });
  });

  describe('insert and search', () => {
    it('should insert and find a single word', () => {
      const tree = new RadixTree();
      tree.insert('hello');
      expect(tree.search('hello')).toBe(true);
    });

    it('should not find non-existent word', () => {
      const tree = new RadixTree();
      tree.insert('hello');
      expect(tree.search('world')).toBe(false);
    });

    it('should insert multiple words', () => {
      const tree = new RadixTree();
      tree.insert('hello');
      tree.insert('world');
      tree.insert('test');
      expect(tree.search('hello')).toBe(true);
      expect(tree.search('world')).toBe(true);
      expect(tree.search('test')).toBe(true);
    });

    it('should handle duplicate insertions', () => {
      const tree = new RadixTree();
      tree.insert('hello');
      tree.insert('hello');
      expect(tree.size).toBe(1);
      expect(tree.search('hello')).toBe(true);
    });

    it('should handle words with common prefix', () => {
      const tree = new RadixTree();
      tree.insert('apple');
      tree.insert('app');
      tree.insert('application');
      expect(tree.search('apple')).toBe(true);
      expect(tree.search('app')).toBe(true);
      expect(tree.search('application')).toBe(true);
    });

    it('should handle single character words', () => {
      const tree = new RadixTree();
      tree.insert('a');
      tree.insert('b');
      tree.insert('c');
      expect(tree.search('a')).toBe(true);
      expect(tree.search('b')).toBe(true);
      expect(tree.search('c')).toBe(true);
    });

    it('should handle long words', () => {
      const tree = new RadixTree();
      const longWord = 'a'.repeat(1000);
      tree.insert(longWord);
      expect(tree.search(longWord)).toBe(true);
    });

    it('should handle empty string insertion', () => {
      const tree = new RadixTree();
      tree.insert('');
      expect(tree.search('')).toBe(false);
    });

    it('should handle case sensitivity', () => {
      const tree = new RadixTree();
      tree.insert('Hello');
      expect(tree.search('hello')).toBe(false);
      expect(tree.search('Hello')).toBe(true);
    });

    it('should handle special characters', () => {
      const tree = new RadixTree();
      tree.insert('hello-world');
      tree.insert('test_case');
      tree.insert('user.name');
      expect(tree.search('hello-world')).toBe(true);
      expect(tree.search('test_case')).toBe(true);
      expect(tree.search('user.name')).toBe(true);
    });
  });

  describe('remove', () => {
    it('should remove existing word', () => {
      const tree = new RadixTree();
      tree.insert('hello');
      expect(tree.remove('hello')).toBe(true);
      expect(tree.search('hello')).toBe(false);
      expect(tree.size).toBe(0);
    });

    it('should return false for non-existent word', () => {
      const tree = new RadixTree();
      tree.insert('hello');
      expect(tree.remove('world')).toBe(false);
      expect(tree.size).toBe(1);
    });

    it('should remove word with common prefix', () => {
      const tree = new RadixTree();
      tree.insert('app');
      tree.insert('apple');
      tree.insert('application');
      tree.remove('app');
      expect(tree.search('app')).toBe(false);
      expect(tree.search('apple')).toBe(true);
      expect(tree.search('application')).toBe(true);
    });

    it('should remove longest word first', () => {
      const tree = new RadixTree();
      tree.insert('app');
      tree.insert('apple');
      tree.remove('apple');
      expect(tree.search('apple')).toBe(false);
      expect(tree.search('app')).toBe(true);
    });

    it('should handle removing from empty tree', () => {
      const tree = new RadixTree();
      expect(tree.remove('test')).toBe(false);
    });

    it('should handle removing empty string', () => {
      const tree = new RadixTree();
      tree.insert('hello');
      expect(tree.remove('')).toBe(false);
    });

    it('should maintain size after removal', () => {
      const tree = new RadixTree();
      tree.insert('hello');
      tree.insert('world');
      tree.remove('hello');
      expect(tree.size).toBe(1);
    });

    it('should handle multiple removals', () => {
      const tree = new RadixTree();
      tree.insert('a');
      tree.insert('b');
      tree.insert('c');
      tree.remove('a');
      tree.remove('b');
      tree.remove('c');
      expect(tree.size).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });

    it('should remove word and merge nodes if possible', () => {
      const tree = new RadixTree();
      tree.insert('hello');
      tree.insert('helloworld');
      tree.remove('hello');
      expect(tree.search('hello')).toBe(false);
      expect(tree.search('helloworld')).toBe(true);
    });
  });

  describe('startsWith', () => {
    it('should return true for exact prefix match', () => {
      const tree = new RadixTree();
      tree.insert('hello');
      expect(tree.startsWith('hel')).toBe(true);
    });

    it('should return true for empty prefix', () => {
      const tree = new RadixTree();
      tree.insert('hello');
      expect(tree.startsWith('')).toBe(true);
    });

    it('should return false for non-existent prefix', () => {
      const tree = new RadixTree();
      tree.insert('hello');
      expect(tree.startsWith('world')).toBe(false);
    });

    it('should return true for word prefix', () => {
      const tree = new RadixTree();
      tree.insert('hello');
      expect(tree.startsWith('hello')).toBe(true);
    });

    it('should return false for partial word', () => {
      const tree = new RadixTree();
      tree.insert('hello');
      expect(tree.startsWith('helloo')).toBe(false);
    });

    it('should handle common prefixes', () => {
      const tree = new RadixTree();
      tree.insert('apple');
      tree.insert('appetizer');
      expect(tree.startsWith('app')).toBe(true);
      expect(tree.startsWith('appl')).toBe(true);
      expect(tree.startsWith('appe')).toBe(true);
    });
  });

  describe('getAllWords', () => {
    it('should return all words in tree', () => {
      const tree = new RadixTree();
      tree.insert('hello');
      tree.insert('world');
      tree.insert('test');
      const words = tree.getAllWords();
      expect(words).toContain('hello');
      expect(words).toContain('world');
      expect(words).toContain('test');
      expect(words.length).toBe(3);
    });

    it('should return words with specific prefix', () => {
      const tree = new RadixTree();
      tree.insert('apple');
      tree.insert('appetizer');
      tree.insert('banana');
      tree.insert('application');
      const words = tree.getAllWords('app');
      expect(words).toContain('apple');
      expect(words).toContain('appetizer');
      expect(words).toContain('application');
      expect(words).not.toContain('banana');
    });

    it('should return empty array for non-existent prefix', () => {
      const tree = new RadixTree();
      tree.insert('hello');
      tree.insert('world');
      const words = tree.getAllWords('xyz');
      expect(words).toEqual([]);
    });

    it('should return single word from tree', () => {
      const tree = new RadixTree();
      tree.insert('hello');
      const words = tree.getAllWords();
      expect(words).toEqual(['hello']);
    });

    it('should include prefix word if it exists', () => {
      const tree = new RadixTree();
      tree.insert('app');
      tree.insert('apple');
      tree.insert('application');
      const words = tree.getAllWords('app');
      expect(words).toContain('app');
      expect(words).toContain('apple');
      expect(words).toContain('application');
    });

    it('should handle empty tree', () => {
      const tree = new RadixTree();
      const words = tree.getAllWords();
      expect(words).toEqual([]);
    });

    it('should return all words with empty prefix', () => {
      const tree = new RadixTree();
      tree.insert('a');
      tree.insert('b');
      tree.insert('c');
      const words = tree.getAllWords('');
      expect(words.length).toBe(3);
      expect(words).toContain('a');
      expect(words).toContain('b');
      expect(words).toContain('c');
    });
  });

  describe('size', () => {
    it('should return 0 for empty tree', () => {
      const tree = new RadixTree();
      expect(tree.size).toBe(0);
    });

    it('should increment on insert', () => {
      const tree = new RadixTree();
      tree.insert('hello');
      expect(tree.size).toBe(1);
      tree.insert('world');
      expect(tree.size).toBe(2);
    });

    it('should not increment on duplicate insert', () => {
      const tree = new RadixTree();
      tree.insert('hello');
      tree.insert('hello');
      expect(tree.size).toBe(1);
    });

    it('should decrement on remove', () => {
      const tree = new RadixTree();
      tree.insert('hello');
      tree.insert('world');
      tree.remove('hello');
      expect(tree.size).toBe(1);
    });

    it('should not decrement on failed remove', () => {
      const tree = new RadixTree();
      tree.insert('hello');
      tree.remove('world');
      expect(tree.size).toBe(1);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty tree', () => {
      const tree = new RadixTree();
      expect(tree.isEmpty()).toBe(true);
    });

    it('should return false after insert', () => {
      const tree = new RadixTree();
      tree.insert('hello');
      expect(tree.isEmpty()).toBe(false);
    });

    it('should return true after removing all words', () => {
      const tree = new RadixTree();
      tree.insert('hello');
      tree.remove('hello');
      expect(tree.isEmpty()).toBe(true);
    });

    it('should return false after clear with subsequent insert', () => {
      const tree = new RadixTree();
      tree.insert('hello');
      tree.clear();
      expect(tree.isEmpty()).toBe(true);
      tree.insert('world');
      expect(tree.isEmpty()).toBe(false);
    });
  });

  describe('clear', () => {
    it('should empty the tree', () => {
      const tree = new RadixTree();
      tree.insert('hello');
      tree.insert('world');
      tree.insert('test');
      tree.clear();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty()).toBe(true);
      expect(tree.search('hello')).toBe(false);
      expect(tree.search('world')).toBe(false);
      expect(tree.search('test')).toBe(false);
    });

    it('should handle clearing empty tree', () => {
      const tree = new RadixTree();
      tree.clear();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });

    it('should allow reuse after clear', () => {
      const tree = new RadixTree();
      tree.insert('hello');
      tree.clear();
      tree.insert('world');
      expect(tree.search('world')).toBe(true);
      expect(tree.size).toBe(1);
    });
  });

  describe('forEach', () => {
    it('should iterate over all words', () => {
      const tree = new RadixTree();
      tree.insert('hello');
      tree.insert('world');
      tree.insert('test');
      const words: string[] = [];
      tree.forEach(word => words.push(word));
      expect(words.length).toBe(3);
      expect(words).toContain('hello');
      expect(words).toContain('world');
      expect(words).toContain('test');
    });

    it('should handle empty tree', () => {
      const tree = new RadixTree();
      const words: string[] = [];
      tree.forEach(word => words.push(word));
      expect(words).toEqual([]);
    });

    it('should allow modification of callback', () => {
      const tree = new RadixTree();
      tree.insert('hello');
      tree.insert('world');
      const upperWords: string[] = [];
      tree.forEach(word => upperWords.push(word.toUpperCase()));
      expect(upperWords).toContain('HELLO');
      expect(upperWords).toContain('WORLD');
    });
  });

  describe('longestCommonPrefix', () => {
    it('should return empty string for empty tree', () => {
      const tree = new RadixTree();
      expect(tree.longestCommonPrefix()).toBe('');
    });

    it('should return the word for single word', () => {
      const tree = new RadixTree();
      tree.insert('hello');
      expect(tree.longestCommonPrefix()).toBe('hello');
    });

    it('should find common prefix', () => {
      const tree = new RadixTree();
      tree.insert('hello');
      tree.insert('help');
      tree.insert('helmet');
      expect(tree.longestCommonPrefix()).toBe('hel');
    });

    it('should return empty string when no common prefix', () => {
      const tree = new RadixTree();
      tree.insert('hello');
      tree.insert('world');
      expect(tree.longestCommonPrefix()).toBe('');
    });

    it('should find single character common prefix', () => {
      const tree = new RadixTree();
      tree.insert('apple');
      tree.insert('apricot');
      expect(tree.longestCommonPrefix()).toBe('ap');
    });

    it('should return entire word when all words are same', () => {
      const tree = new RadixTree();
      tree.insert('hello');
      tree.insert('hello');
      expect(tree.longestCommonPrefix()).toBe('hello');
    });

    it('should handle multiple words with varying lengths', () => {
      const tree = new RadixTree();
      tree.insert('a');
      tree.insert('ab');
      tree.insert('abc');
      expect(tree.longestCommonPrefix()).toBe('a');
    });
  });

  describe('hasWord', () => {
    it('should return true for existing word', () => {
      const tree = new RadixTree();
      tree.insert('hello');
      expect(tree.hasWord('hello')).toBe(true);
    });

    it('should return false for non-existent word', () => {
      const tree = new RadixTree();
      tree.insert('hello');
      expect(tree.hasWord('world')).toBe(false);
    });

    it('should return false for prefix only', () => {
      const tree = new RadixTree();
      tree.insert('hello');
      expect(tree.hasWord('hel')).toBe(false);
    });

    it('should work the same as search', () => {
      const tree = new RadixTree();
      tree.insert('test');
      expect(tree.hasWord('test')).toBe(tree.search('test'));
      expect(tree.hasWord('testing')).toBe(tree.search('testing'));
    });
  });

  describe('prefix splitting behavior', () => {
    it('should split edge on partial match', () => {
      const tree = new RadixTree();
      tree.insert('apple');
      tree.insert('application');
      expect(tree.search('apple')).toBe(true);
      expect(tree.search('application')).toBe(true);
    });

    it('should handle word that splits existing edge', () => {
      const tree = new RadixTree();
      tree.insert('application');
      tree.insert('apple');
      tree.insert('app');
      expect(tree.search('app')).toBe(true);
      expect(tree.search('apple')).toBe(true);
      expect(tree.search('application')).toBe(true);
    });

    it('should handle nested prefixes', () => {
      const tree = new RadixTree();
      tree.insert('a');
      tree.insert('ab');
      tree.insert('abc');
      tree.insert('abcd');
      expect(tree.search('a')).toBe(true);
      expect(tree.search('ab')).toBe(true);
      expect(tree.search('abc')).toBe(true);
      expect(tree.search('abcd')).toBe(true);
    });

    it('should handle overlapping words', () => {
      const tree = new RadixTree();
      tree.insert('hello');
      tree.insert('helloworld');
      tree.insert('hell');
      expect(tree.search('hello')).toBe(true);
      expect(tree.search('helloworld')).toBe(true);
      expect(tree.search('hell')).toBe(true);
    });

    it('should handle words that share middle prefix', () => {
      const tree = new RadixTree();
      tree.insert('prefix');
      tree.insert('affix');
      tree.insert('suffix');
      expect(tree.search('prefix')).toBe(true);
      expect(tree.search('affix')).toBe(true);
      expect(tree.search('suffix')).toBe(true);
    });
  });

  describe('long strings', () => {
    it('should handle very long words', () => {
      const tree = new RadixTree();
      const word1 = 'a'.repeat(5000);
      const word2 = 'a'.repeat(4000) + 'b';
      const word3 = 'a'.repeat(3000) + 'bc';
      tree.insert(word1);
      tree.insert(word2);
      tree.insert(word3);
      expect(tree.search(word1)).toBe(true);
      expect(tree.search(word2)).toBe(true);
      expect(tree.search(word3)).toBe(true);
    });

    it('should find common prefix in long strings', () => {
      const tree = new RadixTree();
      const prefix = 'x'.repeat(100);
      tree.insert(prefix + 'aaa');
      tree.insert(prefix + 'bbb');
      tree.insert(prefix + 'ccc');
      expect(tree.longestCommonPrefix()).toBe(prefix);
    });
  });

  describe('edge cases', () => {
    it('should handle inserting word that is prefix of existing word', () => {
      const tree = new RadixTree();
      tree.insert('hello');
      tree.insert('hel');
      expect(tree.search('hello')).toBe(true);
      expect(tree.search('hel')).toBe(true);
    });

    it('should handle removing word that leaves multiple children', () => {
      const tree = new RadixTree();
      tree.insert('app');
      tree.insert('apple');
      tree.insert('application');
      tree.remove('app');
      expect(tree.search('apple')).toBe(true);
      expect(tree.search('application')).toBe(true);
    });

    it('should handle words with numbers', () => {
      const tree = new RadixTree();
      tree.insert('test123');
      tree.insert('test456');
      tree.insert('test789');
      expect(tree.search('test123')).toBe(true);
      expect(tree.search('test456')).toBe(true);
      expect(tree.search('test789')).toBe(true);
    });

    it('should handle unicode characters', () => {
      const tree = new RadixTree();
      tree.insert('café');
      tree.insert('caféine');
      expect(tree.search('café')).toBe(true);
      expect(tree.search('caféine')).toBe(true);
    });
  });
});
