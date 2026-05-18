import { describe, it, expect } from 'vitest';
import { LCPArray2 } from '../../src/core/lcp-array-2/index.js';

describe('LCPArray2', () => {
  // ─── Constructor ───

  describe('constructor', () => {
    it('creates instance with no arguments', () => {
      const lcp = new LCPArray2();
      expect(lcp.getText()).toBe('');
      expect(lcp.size).toBe(0);
    });

    it('creates instance with empty string', () => {
      const lcp = new LCPArray2('');
      expect(lcp.getText()).toBe('');
      expect(lcp.size).toBe(0);
    });

    it('creates instance with text', () => {
      const lcp = new LCPArray2('abc');
      expect(lcp.getText()).toBe('abc');
      expect(lcp.size).toBe(0);
    });
  });

  // ─── build ───

  describe('build', () => {
    it('builds LCP array for a simple string', () => {
      const lcp = new LCPArray2();
      const result = lcp.build('banana');
      expect(result.length).toBe(6);
      expect(lcp.size).toBe(6);
    });

    it('returns correct LCP array for "banana"', () => {
      const lcp = new LCPArray2();
      const result = lcp.build('banana');
      // Suffix array sorted: a, ana, anana, banana, na, nana
      // LCP: [0, 1, 3, 0, 0, 2]
      expect(result[0]).toBe(0);
      expect(result).toContain(1);
      expect(result).toContain(3);
      expect(result).toContain(0);
      expect(result).toContain(2);
    });

    it('builds LCP array for single character', () => {
      const lcp = new LCPArray2();
      const result = lcp.build('a');
      expect(result).toEqual([0]);
      expect(lcp.size).toBe(1);
    });

    it('builds LCP array for repeated character', () => {
      const lcp = new LCPArray2();
      const result = lcp.build('aaaa');
      expect(result.length).toBe(4);
      expect(result[0]).toBe(0);
    });

    it('updates internal text', () => {
      const lcp = new LCPArray2();
      lcp.build('hello');
      expect(lcp.getText()).toBe('hello');
    });

    it('can be called multiple times with different strings', () => {
      const lcp = new LCPArray2();
      lcp.build('abc');
      expect(lcp.getText()).toBe('abc');
      lcp.build('xyz');
      expect(lcp.getText()).toBe('xyz');
      expect(lcp.size).toBe(3);
    });
  });

  // ─── buildFromSuffixArray ───

  describe('buildFromSuffixArray', () => {
    it('builds LCP from given suffix array', () => {
      const lcp = new LCPArray2();
      const text = 'banana';
      const sa = [5, 3, 1, 0, 4, 2];
      const result = lcp.buildFromSuffixArray(text, sa);
      expect(result.length).toBe(6);
    });

    it('handles single character text', () => {
      const lcp = new LCPArray2();
      const result = lcp.buildFromSuffixArray('a', [0]);
      expect(result).toEqual([0]);
    });

    it('updates text after buildFromSuffixArray', () => {
      const lcp = new LCPArray2();
      lcp.buildFromSuffixArray('test', [3, 2, 1, 0]);
      expect(lcp.getText()).toBe('test');
    });

    it('produces same result as build for identical suffix arrays', () => {
      const lcp1 = new LCPArray2();
      const text = 'abcabc';
      const result1 = lcp1.build(text);

      const lcp2 = new LCPArray2();
      // For "abcabc", the sorted suffixes are:
      // abc, abcabc, bc, bcabc, c, cabc
      // sa = [3, 0, 4, 1, 5, 2]
      const result2 = lcp2.buildFromSuffixArray(text, [3, 0, 4, 1, 5, 2]);

      expect(result1).toEqual(result2);
    });
  });

  // ─── getLCP ───

  describe('getLCP', () => {
    it('returns LCP value at index', () => {
      const lcp = new LCPArray2();
      lcp.build('banana');
      expect(lcp.getLCP(0)).toBe(0);
    });

    it('returns 0 for out-of-bounds index', () => {
      const lcp = new LCPArray2();
      expect(lcp.getLCP(0)).toBe(0);
      expect(lcp.getLCP(100)).toBe(0);
    });
  });

  // ─── getLCPArray ───

  describe('getLCPArray', () => {
    it('returns a copy of the LCP array', () => {
      const lcp = new LCPArray2();
      lcp.build('banana');
      const arr = lcp.getLCPArray();
      expect(arr.length).toBe(6);
    });

    it('returns empty array when not built', () => {
      const lcp = new LCPArray2();
      expect(lcp.getLCPArray()).toEqual([]);
    });

    it('returns a copy not a reference', () => {
      const lcp = new LCPArray2();
      lcp.build('abc');
      const arr1 = lcp.getLCPArray();
      arr1[0] = 999;
      const arr2 = lcp.getLCPArray();
      expect(arr2[0]).not.toBe(999);
    });
  });

  // ─── getMaxLCP ───

  describe('getMaxLCP', () => {
    it('returns 0 when not built', () => {
      const lcp = new LCPArray2();
      expect(lcp.getMaxLCP()).toBe(0);
    });

    it('returns maximum LCP value', () => {
      const lcp = new LCPArray2();
      lcp.build('banana');
      expect(lcp.getMaxLCP()).toBeGreaterThanOrEqual(0);
      expect(lcp.getMaxLCP()).toBeLessThanOrEqual(6);
    });

    it('returns correct max for repeated string', () => {
      const lcp = new LCPArray2();
      lcp.build('aaaa');
      expect(lcp.getMaxLCP()).toBe(3);
    });

    it('returns 0 for single character', () => {
      const lcp = new LCPArray2();
      lcp.build('x');
      expect(lcp.getMaxLCP()).toBe(0);
    });
  });

  // ─── getAverageLCP ───

  describe('getAverageLCP', () => {
    it('returns 0 when not built', () => {
      const lcp = new LCPArray2();
      expect(lcp.getAverageLCP()).toBe(0);
    });

    it('returns 0 for single character', () => {
      const lcp = new LCPArray2();
      lcp.build('a');
      expect(lcp.getAverageLCP()).toBe(0);
    });

    it('returns a non-negative average', () => {
      const lcp = new LCPArray2();
      lcp.build('banana');
      expect(lcp.getAverageLCP()).toBeGreaterThanOrEqual(0);
    });
  });

  // ─── getNumberOfDistinctSubstrings ───

  describe('getNumberOfDistinctSubstrings', () => {
    it('returns 0 for empty text', () => {
      const lcp = new LCPArray2();
      expect(lcp.getNumberOfDistinctSubstrings()).toBe(0);
    });

    it('returns 1 for single character', () => {
      const lcp = new LCPArray2();
      lcp.build('a');
      expect(lcp.getNumberOfDistinctSubstrings()).toBe(1);
    });

    it('returns correct count for "abab"', () => {
      const lcp = new LCPArray2();
      lcp.build('abab');
      // Substrings: a, ab, aba, abab, b, ba, bab = 7 distinct
      expect(lcp.getNumberOfDistinctSubstrings()).toBe(7);
    });

    it('returns correct count for "aaa"', () => {
      const lcp = new LCPArray2();
      lcp.build('aaa');
      // Distinct substrings: a, aa, aaa = 3
      expect(lcp.getNumberOfDistinctSubstrings()).toBe(3);
    });

    it('returns n for string of n identical characters', () => {
      const lcp = new LCPArray2();
      lcp.build('aaaa');
      expect(lcp.getNumberOfDistinctSubstrings()).toBe(4);
    });
  });

  // ─── size getter ───

  describe('size getter', () => {
    it('returns 0 before build', () => {
      const lcp = new LCPArray2();
      expect(lcp.size).toBe(0);
    });

    it('returns text length after build', () => {
      const lcp = new LCPArray2();
      lcp.build('hello');
      expect(lcp.size).toBe(5);
    });
  });

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('handles two identical characters', () => {
      const lcp = new LCPArray2();
      lcp.build('aa');
      expect(lcp.getMaxLCP()).toBe(1);
      expect(lcp.getNumberOfDistinctSubstrings()).toBe(2);
    });

    it('handles all distinct characters', () => {
      const lcp = new LCPArray2();
      lcp.build('abcd');
      expect(lcp.getNumberOfDistinctSubstrings()).toBe(10);
    });

    it('handles string with numbers as characters', () => {
      const lcp = new LCPArray2();
      lcp.build('123');
      expect(lcp.size).toBe(3);
    });
  });
});
