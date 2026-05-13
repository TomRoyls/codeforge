import { describe, it, expect } from 'vitest';
import { WaveletTree3 } from '../src/core/wavelet-tree-3/index.js';

describe('WaveletTree3', () => {
  describe('constructor', () => {
    it('should create empty tree for empty string', () => {
      const tree = new WaveletTree3('');
      expect(tree.length()).toBe(0);
    });

    it('should create tree for single character', () => {
      const tree = new WaveletTree3('a');
      expect(tree.length()).toBe(1);
    });

    it('should create tree for repeated characters', () => {
      const tree = new WaveletTree3('aaa');
      expect(tree.length()).toBe(3);
    });

    it('should create tree for mixed characters', () => {
      const tree = new WaveletTree3('banana');
      expect(tree.length()).toBe(6);
    });

    it('should create tree for alphabetically ordered characters', () => {
      const tree = new WaveletTree3('abcd');
      expect(tree.length()).toBe(4);
    });

    it('should create tree for reverse alphabetically ordered characters', () => {
      const tree = new WaveletTree3('dcba');
      expect(tree.length()).toBe(4);
    });
  });

  describe('length', () => {
    it('should return 0 for empty string', () => {
      const tree = new WaveletTree3('');
      expect(tree.length()).toBe(0);
    });

    it('should return correct length for non-empty string', () => {
      const tree = new WaveletTree3('hello');
      expect(tree.length()).toBe(5);
    });

    it('should return correct length for long string', () => {
      const tree = new WaveletTree3('ababababab');
      expect(tree.length()).toBe(10);
    });
  });

  describe('access', () => {
    it('should throw error for out of bounds index on empty tree', () => {
      const tree = new WaveletTree3('');
      expect(() => tree.access(0)).toThrow();
    });

    it('should throw error for negative index', () => {
      const tree = new WaveletTree3('abc');
      expect(() => tree.access(-1)).toThrow('Index out of bounds');
    });

    it('should throw error for index greater than length', () => {
      const tree = new WaveletTree3('abc');
      expect(() => tree.access(3)).toThrow('Index out of bounds');
    });

    it('should access single character', () => {
      const tree = new WaveletTree3('a');
      expect(tree.access(0)).toBe('a');
    });

    it('should access repeated characters', () => {
      const tree = new WaveletTree3('aaa');
      expect(tree.access(0)).toBe('a');
      expect(tree.access(1)).toBe('a');
      expect(tree.access(2)).toBe('a');
    });

    it('should access mixed characters', () => {
      const tree = new WaveletTree3('banana');
      expect(tree.access(0)).toBe('b');
      expect(tree.access(1)).toBe('a');
      expect(tree.access(2)).toBe('n');
      expect(tree.access(3)).toBe('a');
      expect(tree.access(4)).toBe('n');
      expect(tree.access(5)).toBe('a');
    });

    it('should access last character', () => {
      const tree = new WaveletTree3('hello');
      expect(tree.access(4)).toBe('o');
    });

    it('should access first character', () => {
      const tree = new WaveletTree3('hello');
      expect(tree.access(0)).toBe('h');
    });
  });

  describe('rank', () => {
    it('should return 0 for empty tree', () => {
      const tree = new WaveletTree3('');
      expect(tree.rank('a', 0)).toBe(0);
    });

    it('should return 0 for non-existent character', () => {
      const tree = new WaveletTree3('abc');
      expect(tree.rank('z', 3)).toBe(0);
    });

    it('should return 0 for position 0', () => {
      const tree = new WaveletTree3('abc');
      expect(tree.rank('a', 0)).toBe(0);
    });

    it('should count single occurrence', () => {
      const tree = new WaveletTree3('abc');
      expect(tree.rank('a', 1)).toBe(1);
    });

    it('should count repeated characters', () => {
      const tree = new WaveletTree3('banana');
      expect(tree.rank('a', 6)).toBe(3);
      expect(tree.rank('n', 6)).toBe(2);
      expect(tree.rank('b', 6)).toBe(1);
    });

    it('should count in prefix', () => {
      const tree = new WaveletTree3('banana');
      expect(tree.rank('a', 3)).toBe(1);
      expect(tree.rank('a', 6)).toBe(3);
    });

    it('should return 0 for position out of bounds', () => {
      const tree = new WaveletTree3('abc');
      expect(tree.rank('a', -1)).toBe(0);
      expect(tree.rank('a', 10)).toBe(0);
    });

    it('should count correctly for all characters in string', () => {
      const tree = new WaveletTree3('abracadabra');
      expect(tree.rank('a', 11)).toBe(5);
      expect(tree.rank('b', 11)).toBe(2);
      expect(tree.rank('r', 11)).toBe(2);
      expect(tree.rank('c', 11)).toBe(1);
      expect(tree.rank('d', 11)).toBe(1);
    });
  });

  describe('select', () => {
    it('should return -1 for empty tree', () => {
      const tree = new WaveletTree3('');
      expect(tree.select('a', 0)).toBe(-1);
    });

    it('should return -1 for non-existent character', () => {
      const tree = new WaveletTree3('abc');
      expect(tree.select('z', 0)).toBe(-1);
    });

    it('should throw error for negative occurrence', () => {
      const tree = new WaveletTree3('abc');
      expect(() => tree.select('a', -1)).toThrow('Occurrence must be non-negative');
    });

    it('should return -1 for occurrence beyond count', () => {
      const tree = new WaveletTree3('abc');
      expect(tree.select('a', 10)).toBe(-1);
    });

    it('should find first occurrence', () => {
      const tree = new WaveletTree3('banana');
      expect(tree.select('a', 0)).toBe(1);
      expect(tree.select('b', 0)).toBe(0);
      expect(tree.select('n', 0)).toBe(2);
    });

    it('should find second occurrence', () => {
      const tree = new WaveletTree3('banana');
      expect(tree.select('a', 1)).toBe(3);
      expect(tree.select('n', 1)).toBe(4);
    });

    it('should find third occurrence', () => {
      const tree = new WaveletTree3('banana');
      expect(tree.select('a', 2)).toBe(5);
    });

    it('should find occurrences in longer string', () => {
      const tree = new WaveletTree3('abracadabra');
      expect(tree.select('a', 0)).toBe(0);
      expect(tree.select('a', 1)).toBe(3);
      expect(tree.select('a', 2)).toBe(5);
      expect(tree.select('a', 3)).toBe(7);
      expect(tree.select('a', 4)).toBe(10);
    });

    it('should find single character', () => {
      const tree = new WaveletTree3('a');
      expect(tree.select('a', 0)).toBe(0);
    });

    it('should find in repeated characters', () => {
      const tree = new WaveletTree3('aaaa');
      expect(tree.select('a', 0)).toBe(0);
      expect(tree.select('a', 1)).toBe(1);
      expect(tree.select('a', 2)).toBe(2);
      expect(tree.select('a', 3)).toBe(3);
    });
  });

  describe('toString', () => {
    it('should return empty string for empty tree', () => {
      const tree = new WaveletTree3('');
      expect(tree.toString()).toBe('');
    });

    it('should return single character', () => {
      const tree = new WaveletTree3('a');
      expect(tree.toString()).toBe('a');
    });

    it('should return original string', () => {
      const tree = new WaveletTree3('banana');
      expect(tree.toString()).toBe('banana');
    });

    it('should return longer string', () => {
      const tree = new WaveletTree3('abracadabra');
      expect(tree.toString()).toBe('abracadabra');
    });

    it('should return string with repeated characters', () => {
      const tree = new WaveletTree3('aaaa');
      expect(tree.toString()).toBe('aaaa');
    });
  });

  describe('integration tests', () => {
    it('should handle complex query sequence', () => {
      const tree = new WaveletTree3('mississippi');
      expect(tree.length()).toBe(11);
      expect(tree.access(0)).toBe('m');
      expect(tree.access(1)).toBe('i');
      expect(tree.access(2)).toBe('s');
      expect(tree.rank('i', 11)).toBe(4);
      expect(tree.rank('s', 11)).toBe(4);
      expect(tree.rank('p', 11)).toBe(2);
      expect(tree.select('i', 0)).toBe(1);
      expect(tree.select('i', 1)).toBe(4);
      expect(tree.select('i', 2)).toBe(7);
      expect(tree.select('i', 3)).toBe(10);
      expect(tree.toString()).toBe('mississippi');
    });

    it('should handle alphabetically sorted string', () => {
      const tree = new WaveletTree3('abcdef');
      expect(tree.length()).toBe(6);
      expect(tree.access(0)).toBe('a');
      expect(tree.access(5)).toBe('f');
      expect(tree.rank('a', 6)).toBe(1);
      expect(tree.rank('f', 6)).toBe(1);
      expect(tree.select('a', 0)).toBe(0);
      expect(tree.select('f', 0)).toBe(5);
      expect(tree.toString()).toBe('abcdef');
    });

    it('should handle reverse sorted string', () => {
      const tree = new WaveletTree3('fedcba');
      expect(tree.length()).toBe(6);
      expect(tree.access(0)).toBe('f');
      expect(tree.access(5)).toBe('a');
      expect(tree.rank('f', 6)).toBe(1);
      expect(tree.rank('a', 6)).toBe(1);
      expect(tree.select('f', 0)).toBe(0);
      expect(tree.select('a', 0)).toBe(5);
      expect(tree.toString()).toBe('fedcba');
    });
  });

  describe('edge cases', () => {
    it('should handle string with only two characters', () => {
      const tree = new WaveletTree3('ab');
      expect(tree.length()).toBe(2);
      expect(tree.access(0)).toBe('a');
      expect(tree.access(1)).toBe('b');
      expect(tree.rank('a', 2)).toBe(1);
      expect(tree.rank('b', 2)).toBe(1);
      expect(tree.select('a', 0)).toBe(0);
      expect(tree.select('b', 0)).toBe(1);
      expect(tree.toString()).toBe('ab');
    });

    it('should handle string with alternating characters', () => {
      const tree = new WaveletTree3('ababab');
      expect(tree.length()).toBe(6);
      expect(tree.access(0)).toBe('a');
      expect(tree.access(1)).toBe('b');
      expect(tree.access(2)).toBe('a');
      expect(tree.rank('a', 6)).toBe(3);
      expect(tree.rank('b', 6)).toBe(3);
      expect(tree.select('a', 0)).toBe(0);
      expect(tree.select('b', 0)).toBe(1);
      expect(tree.toString()).toBe('ababab');
    });

    it('should handle string with all same characters', () => {
      const tree = new WaveletTree3('zzzzzz');
      expect(tree.length()).toBe(6);
      expect(tree.access(0)).toBe('z');
      expect(tree.access(5)).toBe('z');
      expect(tree.rank('z', 6)).toBe(6);
      expect(tree.select('z', 0)).toBe(0);
      expect(tree.select('z', 5)).toBe(5);
      expect(tree.toString()).toBe('zzzzzz');
    });
  });
});
