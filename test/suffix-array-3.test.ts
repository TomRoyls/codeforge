import { describe, it, expect } from 'vitest';
import { SuffixArray3 } from './src/core/suffix-array-3/index.js';

describe('SuffixArray3', () => {
  describe('constructor', () => {
    it('should build from empty string', () => {
      const sa = new SuffixArray3('');
      expect(sa.length).toBe(0);
    });

    it('should build from single character', () => {
      const sa = new SuffixArray3('a');
      expect(sa.length).toBe(1);
    });

    it('should build from multiple characters', () => {
      const sa = new SuffixArray3('banana');
      expect(sa.length).toBe(6);
    });

    it('should build from repeated characters', () => {
      const sa = new SuffixArray3('aaaa');
      expect(sa.length).toBe(4);
    });

    it('should build from string with spaces', () => {
      const sa = new SuffixArray3('hello world');
      expect(sa.length).toBe(11);
    });
  });

  describe('search', () => {
    it('should find pattern at beginning', () => {
      const sa = new SuffixArray3('banana');
      expect(sa.search('b')).toContain(0);
    });

    it('should find pattern at end', () => {
      const sa = new SuffixArray3('banana');
      expect(sa.search('a')).toContain(5);
    });

    it('should find pattern in middle', () => {
      const sa = new SuffixArray3('banana');
      expect(sa.search('n')).toContain(2);
    });

    it('should return all occurrences of pattern', () => {
      const sa = new SuffixArray3('banana');
      const result = sa.search('a');
      expect(result.length).toBe(3);
      expect(result).toContain(1);
      expect(result).toContain(3);
      expect(result).toContain(5);
    });

    it('should return empty array for non-existent pattern', () => {
      const sa = new SuffixArray3('banana');
      expect(sa.search('z')).toEqual([]);
    });

    it('should find whole string', () => {
      const sa = new SuffixArray3('banana');
      expect(sa.search('banana')).toEqual([0]);
    });

    it('should find empty pattern returns all indices', () => {
      const sa = new SuffixArray3('abc');
      expect(sa.search('')).toEqual([0, 1, 2]);
    });

    it('should find single character pattern', () => {
      const sa = new SuffixArray3('hello');
      expect(sa.search('l')).toEqual([2, 3]);
    });

    it('should find pattern longer than 1 character', () => {
      const sa = new SuffixArray3('mississippi');
      expect(sa.search('is')).toContain(1);
    });

    it('should find overlapping patterns', () => {
      const sa = new SuffixArray3('aaaa');
      expect(sa.search('aa')).toEqual([0, 1, 2]);
    });

    it('should find pattern in string with repeated chars', () => {
      const sa = new SuffixArray3('ababab');
      expect(sa.search('ab')).toEqual([0, 2, 4]);
    });

    it('should handle case sensitivity', () => {
      const sa = new SuffixArray3('AbC');
      expect(sa.search('A')).toEqual([0]);
      expect(sa.search('a')).toEqual([]);
    });

    it('should find pattern in string with spaces', () => {
      const sa = new SuffixArray3('hello world');
      expect(sa.search('wo')).toEqual([6]);
    });

    it('should return sorted indices', () => {
      const sa = new SuffixArray3('banana');
      const result = sa.search('a');
      const sorted = [...result].sort((a, b) => a - b);
      expect(result).toEqual(sorted);
    });

    it('should find pattern with special characters', () => {
      const sa = new SuffixArray3('hello!');
      expect(sa.search('!')).toEqual([5]);
    });

    it('should find pattern with numbers', () => {
      const sa = new SuffixArray3('test123');
      expect(sa.search('123')).toEqual([4]);
    });

    it('should handle very long pattern', () => {
      const sa = new SuffixArray3('a'.repeat(100));
      const result = sa.search('a'.repeat(50));
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toBe(0);
    });

    it('should find pattern at multiple positions', () => {
      const sa = new SuffixArray3('testtest');
      expect(sa.search('test')).toEqual([0, 4]);
    });

    it('should find pattern in empty string suffix', () => {
      const sa = new SuffixArray3('abc');
      const result = sa.search('');
      expect(result.length).toBe(3);
    });
  });

  describe('count', () => {
    it('should count occurrences of existing pattern', () => {
      const sa = new SuffixArray3('banana');
      expect(sa.count('a')).toBe(3);
    });

    it('should return 0 for non-existent pattern', () => {
      const sa = new SuffixArray3('banana');
      expect(sa.count('z')).toBe(0);
    });

    it('should count whole string', () => {
      const sa = new SuffixArray3('banana');
      expect(sa.count('banana')).toBe(1);
    });

    it('should count single character', () => {
      const sa = new SuffixArray3('hello');
      expect(sa.count('l')).toBe(2);
    });

    it('should count repeated patterns', () => {
      const sa = new SuffixArray3('ababab');
      expect(sa.count('ab')).toBe(3);
    });

    it('should count empty pattern as all suffixes', () => {
      const sa = new SuffixArray3('abc');
      expect(sa.count('')).toBe(3);
    });

    it('should count 0 in empty string', () => {
      const sa = new SuffixArray3('');
      expect(sa.count('a')).toBe(0);
    });

    it('should count overlapping occurrences', () => {
      const sa = new SuffixArray3('aaaa');
      expect(sa.count('aa')).toBe(3);
    });

    it('should count pattern with spaces', () => {
      const sa = new SuffixArray3('hello world');
      expect(sa.count(' ')).toBe(1);
    });
  });

  describe('has', () => {
    it('should return true for existing pattern', () => {
      const sa = new SuffixArray3('banana');
      expect(sa.has('a')).toBe(true);
    });

    it('should return false for non-existent pattern', () => {
      const sa = new SuffixArray3('banana');
      expect(sa.has('z')).toBe(false);
    });

    it('should return true for whole string', () => {
      const sa = new SuffixArray3('banana');
      expect(sa.has('banana')).toBe(true);
    });

    it('should return true for empty pattern', () => {
      const sa = new SuffixArray3('abc');
      expect(sa.has('')).toBe(true);
    });

    it('should return false for empty string', () => {
      const sa = new SuffixArray3('');
      expect(sa.has('a')).toBe(false);
    });

    it('should return true for pattern at beginning', () => {
      const sa = new SuffixArray3('hello');
      expect(sa.has('he')).toBe(true);
    });

    it('should return true for pattern at end', () => {
      const sa = new SuffixArray3('hello');
      expect(sa.has('lo')).toBe(true);
    });

    it('should be case sensitive', () => {
      const sa = new SuffixArray3('Hello');
      expect(sa.has('h')).toBe(false);
      expect(sa.has('H')).toBe(true);
    });
  });

  describe('length', () => {
    it('should return 0 for empty string', () => {
      const sa = new SuffixArray3('');
      expect(sa.length).toBe(0);
    });

    it('should return 1 for single character', () => {
      const sa = new SuffixArray3('a');
      expect(sa.length).toBe(1);
    });

    it('should return length of string', () => {
      const sa = new SuffixArray3('banana');
      expect(sa.length).toBe(6);
    });

    it('should return length for repeated chars', () => {
      const sa = new SuffixArray3('aaaa');
      expect(sa.length).toBe(4);
    });
  });

  describe('getSuffix', () => {
    it('should get first suffix', () => {
      const sa = new SuffixArray3('banana');
      expect(sa.getSuffix(0)).toBe('a');
    });

    it('should get last suffix', () => {
      const sa = new SuffixArray3('banana');
      expect(sa.getSuffix(5)).toBe('nana');
    });

    it('should get middle suffix', () => {
      const sa = new SuffixArray3('banana');
      expect(sa.getSuffix(3)).toBe('banana');
    });

    it('should throw for negative index', () => {
      const sa = new SuffixArray3('banana');
      expect(() => sa.getSuffix(-1)).toThrow();
    });

    it('should throw for index out of bounds', () => {
      const sa = new SuffixArray3('banana');
      expect(() => sa.getSuffix(10)).toThrow();
    });

    it('should get suffix from sorted array', () => {
      const sa = new SuffixArray3('banana');
      const suffixes = [];
      for (let i = 0; i < sa.length; i++) {
        suffixes.push(sa.getSuffix(i));
      }
      const sorted = [...suffixes].sort();
      expect(suffixes).toEqual(sorted);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty string', () => {
      const sa = new SuffixArray3('');
      expect(sa.toArray()).toEqual([]);
    });

    it('should return all suffixes', () => {
      const sa = new SuffixArray3('abc');
      expect(sa.toArray().length).toBe(3);
    });

    it('should return sorted suffixes', () => {
      const sa = new SuffixArray3('banana');
      const arr = sa.toArray();
      const sorted = [...arr].sort();
      expect(arr).toEqual(sorted);
    });

    it('should return correct suffixes', () => {
      const sa = new SuffixArray3('ab');
      const arr = sa.toArray();
      expect(arr).toContain('ab');
      expect(arr).toContain('b');
      expect(arr.length).toBe(2);
    });

    it('should return all suffixes including empty string', () => {
      const sa = new SuffixArray3('abc');
      const arr = sa.toArray();
      expect(arr).toContain('abc');
      expect(arr).toContain('bc');
      expect(arr).toContain('c');
      expect(arr.length).toBe(3);
    });
  });

  describe('indexOf', () => {
    it('should find index of first suffix', () => {
      const sa = new SuffixArray3('banana');
      expect(sa.indexOf(0)).toBeGreaterThanOrEqual(0);
      expect(sa.indexOf(0)).toBeLessThan(6);
    });

    it('should find index of last suffix', () => {
      const sa = new SuffixArray3('banana');
      expect(sa.indexOf(5)).toBeGreaterThanOrEqual(0);
      expect(sa.indexOf(5)).toBeLessThan(6);
    });

    it('should find index of middle suffix', () => {
      const sa = new SuffixArray3('banana');
      expect(sa.indexOf(3)).toBeGreaterThanOrEqual(0);
      expect(sa.indexOf(3)).toBeLessThan(6);
    });

    it('should throw for negative suffix index', () => {
      const sa = new SuffixArray3('banana');
      expect(() => sa.indexOf(-1)).toThrow();
    });

    it('should throw for suffix index out of bounds', () => {
      const sa = new SuffixArray3('banana');
      expect(() => sa.indexOf(10)).toThrow();
    });

    it('should return unique indices for unique suffixes', () => {
      const sa = new SuffixArray3('abc');
      const indices = new Set();
      for (let i = 0; i < 3; i++) {
        indices.add(sa.indexOf(i));
      }
      expect(indices.size).toBe(3);
    });
  });

  describe('integration tests', () => {
    it('should handle complex string search', () => {
      const sa = new SuffixArray3('mississippi');
      expect(sa.count('i')).toBe(4);
      expect(sa.count('p')).toBe(2);
      expect(sa.count('s')).toBe(4);
    });

    it('should find all patterns in repeated string', () => {
      const sa = new SuffixArray3('abcabcabc');
      expect(sa.count('abc')).toBe(3);
      expect(sa.count('ab')).toBe(3);
      expect(sa.count('bc')).toBe(3);
    });

    it('should handle unicode characters', () => {
      const sa = new SuffixArray3('héllo');
      expect(sa.has('é')).toBe(true);
    });

    it('should verify suffix array consistency', () => {
      const sa = new SuffixArray3('banana');
      for (let i = 0; i < sa.length; i++) {
        const suffix = sa.getSuffix(i);
        const index = sa.indexOf(i);
        expect(sa.getSuffix(index)).toBe(sa.text.slice(i));
      }
    });
  });
});
