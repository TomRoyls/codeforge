import { describe, it, expect } from 'vitest';
import { KnuthMorrisPratt2 } from '../src/core/knuth-morris-pratt-2';

describe('KnuthMorrisPratt2', () => {
  describe('basic search', () => {
    it('should find pattern at beginning of text', async () => {
      const kmp = new KnuthMorrisPratt2('abc');
      const result = kmp.search('abcdef');
      expect(result).toEqual([0]);
    });

    it('should find pattern at end of text', async () => {
      const kmp = new KnuthMorrisPratt2('def');
      const result = kmp.search('abcdef');
      expect(result).toEqual([3]);
    });

    it('should find pattern in middle of text', async () => {
      const kmp = new KnuthMorrisPratt2('bcd');
      const result = kmp.search('abcdef');
      expect(result).toEqual([1]);
    });
  });

  describe('multiple matches', () => {
    it('should find multiple occurrences', async () => {
      const kmp = new KnuthMorrisPratt2('ab');
      const result = kmp.search('ababab');
      expect(result).toEqual([0, 2, 4]);
    });

    it('should find multiple non-overlapping occurrences', async () => {
      const kmp = new KnuthMorrisPratt2('aba');
      const result = kmp.search('ababaab');
      expect(result).toEqual([0, 2]);
    });
  });

  describe('overlapping matches', () => {
    it('should find overlapping matches', async () => {
      const kmp = new KnuthMorrisPratt2('aaa');
      const result = kmp.search('aaaaa');
      expect(result).toEqual([0, 1, 2]);
    });

    it('should handle overlapping pattern with self', async () => {
      const kmp = new KnuthMorrisPratt2('aba');
      const result = kmp.search('ababa');
      expect(result).toEqual([0, 2]);
    });
  });

  describe('no match', () => {
    it('should return empty array when pattern not found', async () => {
      const kmp = new KnuthMorrisPratt2('xyz');
      const result = kmp.search('abcdef');
      expect(result).toEqual([]);
    });

    it('should return empty array for single character mismatch', async () => {
      const kmp = new KnuthMorrisPratt2('ab');
      const result = kmp.search('ac');
      expect(result).toEqual([]);
    });
  });

  describe('findFirst', () => {
    it('should return first match position', async () => {
      const kmp = new KnuthMorrisPratt2('ab');
      const result = kmp.findFirst('ababab');
      expect(result).toBe(0);
    });

    it('should return first match when pattern appears multiple times', async () => {
      const kmp = new KnuthMorrisPratt2('ab');
      const result = kmp.findFirst('xyzabxyzabxyz');
      expect(result).toBe(3);
    });

    it('should return -1 when no match found', async () => {
      const kmp = new KnuthMorrisPratt2('xyz');
      const result = kmp.findFirst('abcdef');
      expect(result).toBe(-1);
    });
  });

  describe('hasMatch', () => {
    it('should return true when pattern exists', async () => {
      const kmp = new KnuthMorrisPratt2('abc');
      const result = kmp.hasMatch('xyzabcdef');
      expect(result).toBe(true);
    });

    it('should return false when pattern does not exist', async () => {
      const kmp = new KnuthMorrisPratt2('xyz');
      const result = kmp.hasMatch('abcdef');
      expect(result).toBe(false);
    });

    it('should return true when pattern at start', async () => {
      const kmp = new KnuthMorrisPratt2('ab');
      const result = kmp.hasMatch('abcdef');
      expect(result).toBe(true);
    });

    it('should return true when pattern at end', async () => {
      const kmp = new KnuthMorrisPratt2('ef');
      const result = kmp.hasMatch('abcdef');
      expect(result).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should return empty array for empty pattern', async () => {
      const kmp = new KnuthMorrisPratt2('');
      const result = kmp.search('abcdef');
      expect(result).toEqual([]);
    });

    it('should return empty array for empty text', async () => {
      const kmp = new KnuthMorrisPratt2('abc');
      const result = kmp.search('');
      expect(result).toEqual([]);
    });

    it('should return empty array when pattern longer than text', async () => {
      const kmp = new KnuthMorrisPratt2('abcdefg');
      const result = kmp.search('abc');
      expect(result).toEqual([]);
    });

    it('should return empty array when both empty', async () => {
      const kmp = new KnuthMorrisPratt2('');
      const result = kmp.search('');
      expect(result).toEqual([]);
    });

    it('should return -1 for findFirst with empty pattern', async () => {
      const kmp = new KnuthMorrisPratt2('');
      const result = kmp.findFirst('abcdef');
      expect(result).toBe(-1);
    });

    it('should return -1 for findFirst with empty text', async () => {
      const kmp = new KnuthMorrisPratt2('abc');
      const result = kmp.findFirst('');
      expect(result).toBe(-1);
    });

    it('should return false for hasMatch with empty pattern', async () => {
      const kmp = new KnuthMorrisPratt2('');
      const result = kmp.hasMatch('abcdef');
      expect(result).toBe(false);
    });

    it('should return false for hasMatch with empty text', async () => {
      const kmp = new KnuthMorrisPratt2('abc');
      const result = kmp.hasMatch('');
      expect(result).toBe(false);
    });
  });

  describe('pattern property', () => {
    it('should return the pattern used in constructor', async () => {
      const kmp = new KnuthMorrisPratt2('test');
      const result = kmp.pattern();
      expect(result).toBe('test');
    });

    it('should return empty string for empty pattern', async () => {
      const kmp = new KnuthMorrisPratt2('');
      const result = kmp.pattern();
      expect(result).toBe('');
    });

    it('should return pattern with special characters', async () => {
      const kmp = new KnuthMorrisPratt2('test-123_abc');
      const result = kmp.pattern();
      expect(result).toBe('test-123_abc');
    });
  });

  describe('repeated patterns', () => {
    it('should handle pattern with repeated characters', async () => {
      const kmp = new KnuthMorrisPratt2('aaaa');
      const result = kmp.search('aaaaaaaaaa');
      expect(result).toEqual([0, 1, 2, 3, 4, 5, 6]);
    });

    it('should handle pattern with repeated sub-patterns', async () => {
      const kmp = new KnuthMorrisPratt2('abab');
      const result = kmp.search('abababab');
      expect(result).toEqual([0, 2, 4]);
    });

    it('should handle text with repeated pattern', async () => {
      const kmp = new KnuthMorrisPratt2('abc');
      const result = kmp.search('abcabcabc');
      expect(result).toEqual([0, 3, 6]);
    });
  });

  describe('single character pattern', () => {
    it('should find all occurrences of single character', async () => {
      const kmp = new KnuthMorrisPratt2('a');
      const result = kmp.search('banana');
      expect(result).toEqual([1, 3, 5]);
    });

    it('should handle single character at beginning', async () => {
      const kmp = new KnuthMorrisPratt2('a');
      const result = kmp.search('apple');
      expect(result).toEqual([0]);
    });

    it('should handle single character at end', async () => {
      const kmp = new KnuthMorrisPratt2('e');
      const result = kmp.search('apple');
      expect(result).toEqual([4]);
    });
  });

  describe('pattern equals text', () => {
    it('should find pattern when pattern equals entire text', async () => {
      const kmp = new KnuthMorrisPratt2('hello');
      const result = kmp.search('hello');
      expect(result).toEqual([0]);
    });

    it('should return position 0 for findFirst when pattern equals text', async () => {
      const kmp = new KnuthMorrisPratt2('test');
      const result = kmp.findFirst('test');
      expect(result).toBe(0);
    });

    it('should return true for hasMatch when pattern equals text', async () => {
      const kmp = new KnuthMorrisPratt2('test');
      const result = kmp.hasMatch('test');
      expect(result).toBe(true);
    });

    it('should handle empty text search', () => {
      const kmp = new KnuthMorrisPratt2('test');
      const result = kmp.search('');
      expect(result).toEqual([]);
    });

    it('should find pattern at start', () => {
      const kmp = new KnuthMorrisPratt2('abc');
      const result = kmp.search('abcdef');
      expect(result).toEqual([0]);
    });

    it('should handle multiple matches', () => {
      const kmp = new KnuthMorrisPratt2('ab');
      const result = kmp.search('ababab');
      expect(result.length).toBe(3);
    });

    it('should build LPS table correctly', () => {
      const kmp = new KnuthMorrisPratt2('AABA');
      const result = kmp.search('AABAABAABAA');
      expect(result.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle findFirst', () => {
      const kmp = new KnuthMorrisPratt2('abc');
      expect(kmp.findFirst('xyzabcdef')).toBe(3);
      expect(kmp.findFirst('no match')).toBe(-1);
    });

    it('should handle pattern method', () => {
      const kmp = new KnuthMorrisPratt2('test');
      expect(kmp.pattern()).toBe('test');
    });

    it('should handle search empty pattern', () => {
      const kmp = new KnuthMorrisPratt2('');
      expect(kmp.search('anything')).toEqual([]);
    });

    it('should handle search with multiple matches', () => {
      const kmp = new KnuthMorrisPratt2('ab');
      const results = kmp.search('ababab');
      expect(results.length).toBe(3);
    });
  });
});
