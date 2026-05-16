import { describe, it, expect } from 'vitest';
import { BoyerMoore2 } from '../src/core/boyer-moore-2/index.js';

describe('BoyerMoore2', () => {
  describe('pattern()', () => {
    it('returns the pattern string', () => {
      const bm = new BoyerMoore2('hello');
      expect(bm.pattern()).toBe('hello');
    });

    it('returns empty string for empty pattern', () => {
      const bm = new BoyerMoore2('');
      expect(bm.pattern()).toBe('');
    });

    it('returns pattern with special characters', () => {
      const bm = new BoyerMoore2('hello world!');
      expect(bm.pattern()).toBe('hello world!');
    });
  });

  describe('search() - empty text', () => {
    it('returns empty array for empty text', () => {
      const bm = new BoyerMoore2('hello');
      expect(bm.search('')).toEqual([]);
    });

    it('returns empty array for empty pattern', () => {
      const bm = new BoyerMoore2('');
      expect(bm.search('hello')).toEqual([]);
    });
  });

  describe('search() - pattern longer than text', () => {
    it('returns empty array when pattern longer than text', () => {
      const bm = new BoyerMoore2('longer');
      expect(bm.search('short')).toEqual([]);
    });

    it('returns empty array for same length but different strings', () => {
      const bm = new BoyerMoore2('abcde');
      expect(bm.search('fghij')).toEqual([]);
    });
  });

  describe('search() - single match', () => {
    it('finds single match in middle of text', () => {
      const bm = new BoyerMoore2('cat');
      expect(bm.search('the cat sat')).toEqual([4]);
    });

    it('finds single match with longer pattern', () => {
      const bm = new BoyerMoore2('algorithm');
      expect(bm.search('this is an algorithm test')).toEqual([11]);
    });

    it('finds match with repeated characters', () => {
      const bm = new BoyerMoore2('aaa');
      expect(bm.search('baaac')).toEqual([1]);
    });
  });

  describe('search() - multiple matches', () => {
    it('finds multiple matches', () => {
      const bm = new BoyerMoore2('ab');
      expect(bm.search('ab ab ab')).toEqual([0, 3, 6]);
    });

    it('finds matches separated by various distances', () => {
      const bm = new BoyerMoore2('is');
      expect(bm.search('this is a test')).toEqual([2, 5]);
    });

    it('finds multiple occurrences of longer pattern', () => {
      const bm = new BoyerMoore2('test');
      expect(bm.search('test test test')).toEqual([0, 5, 10]);
    });
  });

  describe('search() - no match', () => {
    it('returns empty array when no match', () => {
      const bm = new BoyerMoore2('xyz');
      expect(bm.search('abcdef')).toEqual([]);
    });

    it('returns empty array with different case', () => {
      const bm = new BoyerMoore2('Hello');
      expect(bm.search('hello')).toEqual([]);
    });
  });

  describe('search() - pattern at start/end', () => {
    it('finds match at start', () => {
      const bm = new BoyerMoore2('start');
      expect(bm.search('start here')).toEqual([0]);
    });

    it('finds match at end', () => {
      const bm = new BoyerMoore2('end');
      expect(bm.search('at the end')).toEqual([7]);
    });

    it('finds match at both start and end', () => {
      const bm = new BoyerMoore2('a');
      expect(bm.search('a test a')).toEqual([0, 7]);
    });
  });

  describe('search() - overlapping matches', () => {
    it('finds overlapping matches', () => {
      const bm = new BoyerMoore2('aa');
      expect(bm.search('aaaa')).toEqual([0, 1, 2]);
    });

    it('finds overlapping matches with longer pattern', () => {
      const bm = new BoyerMoore2('aba');
      expect(bm.search('ababa')).toEqual([0, 2]);
    });

    it('finds all occurrences in repeating pattern', () => {
      const bm = new BoyerMoore2('abc');
      expect(bm.search('abcabcabc')).toEqual([0, 3, 6]);
    });
  });

  describe('search() - repeated pattern', () => {
    it('finds repeated pattern', () => {
      const bm = new BoyerMoore2('ab');
      expect(bm.search('ababab')).toEqual([0, 2, 4]);
    });

    it('finds complex repeated pattern', () => {
      const bm = new BoyerMoore2('abc');
      expect(bm.search('abcabcabcabc')).toEqual([0, 3, 6, 9]);
    });
  });

  describe('search() - case sensitivity', () => {
    it('is case sensitive', () => {
      const bm = new BoyerMoore2('Test');
      expect(bm.search('test TEST Test')).toEqual([10]);
    });

    it('distinguishes all uppercase', () => {
      const bm = new BoyerMoore2('ABC');
      expect(bm.search('abc ABC')).toEqual([4]);
    });

    it('distinguishes mixed case', () => {
      const bm = new BoyerMoore2('HeLLo');
      expect(bm.search('hello HeLLo HELLO')).toEqual([6]);
    });
  });

  describe('search() - single character pattern', () => {
    it('finds single character occurrences', () => {
      const bm = new BoyerMoore2('a');
      expect(bm.search('banana')).toEqual([1, 3, 5]);
    });

    it('finds single special character', () => {
      const bm = new BoyerMoore2('!');
      expect(bm.search('hello! world!')).toEqual([5, 12]);
    });

    it('finds space character', () => {
      const bm = new BoyerMoore2(' ');
      expect(bm.search('hello world')).toEqual([5]);
    });

    it('finds digit character', () => {
      const bm = new BoyerMoore2('1');
      expect(bm.search('a1b1c1')).toEqual([1, 3, 5]);
    });
  });

  describe('findFirst()', () => {
    it('returns first match index', () => {
      const bm = new BoyerMoore2('test');
      expect(bm.findFirst('this test is a test')).toBe(5);
    });

    it('returns -1 when no match', () => {
      const bm = new BoyerMoore2('xyz');
      expect(bm.findFirst('abc')).toBe(-1);
    });

    it('returns -1 for empty text', () => {
      const bm = new BoyerMoore2('hello');
      expect(bm.findFirst('')).toBe(-1);
    });

    it('returns first occurrence of multiple matches', () => {
      const bm = new BoyerMoore2('a');
      expect(bm.findFirst('banana')).toBe(1);
    });

    it('returns 0 for match at start', () => {
      const bm = new BoyerMoore2('start');
      expect(bm.findFirst('start')).toBe(0);
    });
  });

  describe('hasMatch()', () => {
    it('returns true when pattern exists', () => {
      const bm = new BoyerMoore2('test');
      expect(bm.hasMatch('this is a test')).toBe(true);
    });

    it('returns false when pattern does not exist', () => {
      const bm = new BoyerMoore2('xyz');
      expect(bm.hasMatch('abc')).toBe(false);
    });

    it('returns false for empty text', () => {
      const bm = new BoyerMoore2('hello');
      expect(bm.hasMatch('')).toBe(false);
    });

    it('returns true for match at start', () => {
      const bm = new BoyerMoore2('hello');
      expect(bm.hasMatch('hello world')).toBe(true);
    });

    it('returns true for match at end', () => {
      const bm = new BoyerMoore2('world');
      expect(bm.hasMatch('hello world')).toBe(true);
    });

    it('returns true for multiple matches', () => {
      const bm = new BoyerMoore2('test');
      expect(bm.hasMatch('test test test')).toBe(true);
    });

    it('returns false for empty pattern', () => {
      const bm = new BoyerMoore2('');
      expect(bm.hasMatch('hello')).toBe(false);
    });

    it('is case sensitive', () => {
      const bm = new BoyerMoore2('Test');
      expect(bm.hasMatch('test')).toBe(false);
    });
  });

  describe('search() - special characters and unicode', () => {
    it('handles special characters', () => {
      const bm = new BoyerMoore2('@#$');
      expect(bm.search('test @#$ test')).toEqual([5]);
    });

    it('handles newlines', () => {
      const bm = new BoyerMoore2('\n');
      expect(bm.search('line1\nline2')).toEqual([5]);
    });
    it('should handle pattern getter', () => {
      const bm = new BoyerMoore2('abc');
      expect(bm.pattern()).toBe('abc');
    });
    it('should handle hasMatch', () => {
      const bm = new BoyerMoore2('abc');
      expect(bm.hasMatch('xyzabcdef')).toBe(true);
      expect(bm.hasMatch('xyz')).toBe(false);
    });
    it('should handle search returning multiple positions', () => {
      const bm = new BoyerMoore2('ab');
      const result = bm.search('ababab');
      expect(result.length).toBeGreaterThanOrEqual(2);
    });
  });
});
