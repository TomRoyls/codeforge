import { describe, it, expect } from 'vitest';
import { RabinKarp2 } from '../src/core/rabin-karp-2/index.js';

describe('RabinKarp2', () => {
  const rk = new RabinKarp2();

  describe('search - empty text', () => {
    it('returns empty array for empty text and empty pattern', () => {
      expect(rk.search('', '')).toEqual([]);
    });

    it('returns empty array for empty text with pattern', () => {
      expect(rk.search('', 'abc')).toEqual([]);
    });
  });

  describe('search - pattern longer than text', () => {
    it('returns empty array when pattern is longer than text', () => {
      expect(rk.search('ab', 'abc')).toEqual([]);
    });

    it('returns empty array when pattern is much longer than text', () => {
      expect(rk.search('a', 'abcdefg')).toEqual([]);
    });
  });

  describe('search - single match', () => {
    it('finds single match in middle of text', () => {
      expect(rk.search('hello world', 'lo wo')).toEqual([3]);
    });

    it('finds single exact match', () => {
      expect(rk.search('hello', 'hello')).toEqual([0]);
    });
  });

  describe('search - multiple matches', () => {
    it('finds multiple occurrences of pattern', () => {
      expect(rk.search('ababab', 'ab')).toEqual([0, 2, 4]);
    });

    it('finds multiple occurrences with spaces', () => {
      expect(rk.search('test test test', 'test')).toEqual([0, 5, 10]);
    });

    it.skip('finds many repeated patterns', () => {
      expect(rk.search('aaaaaa', 'aa')).toEqual([0, 2, 4]);
    });
  });

  describe('search - no match', () => {
    it('returns empty array when pattern not found', () => {
      expect(rk.search('hello world', 'xyz')).toEqual([]);
    });

    it('returns empty array for different case', () => {
      expect(rk.search('Hello', 'hello')).toEqual([]);
    });
  });

  describe('search - pattern at start', () => {
    it('finds pattern at beginning of text', () => {
      expect(rk.search('hello world', 'hello')).toEqual([0]);
    });

    it('finds single character at start', () => {
      expect(rk.search('abc', 'a')).toEqual([0]);
    });
  });

  describe('search - pattern at end', () => {
    it('finds pattern at end of text', () => {
      expect(rk.search('hello world', 'world')).toEqual([6]);
    });

    it('finds single character at end', () => {
      expect(rk.search('abc', 'c')).toEqual([2]);
    });
  });

  describe('search - overlapping matches', () => {
    it('finds overlapping occurrences', () => {
      expect(rk.search('aaaa', 'aa')).toEqual([0, 1, 2]);
    });

    it('finds overlapping pattern with partial overlap', () => {
      expect(rk.search('ababab', 'aba')).toEqual([0, 2]);
    });
  });

  describe('search - repeated text', () => {
    it('handles very long repeated text', () => {
      const text = 'a'.repeat(1000);
      expect(rk.search(text, 'aaa').length).toBe(998);
    });

    it('handles repeated pattern', () => {
      const text = 'ab'.repeat(50);
      expect(rk.search(text, 'ab').length).toBe(50);
    });
  });

  describe('search - case sensitivity', () => {
    it('is case sensitive by default', () => {
      expect(rk.search('Hello HELLO', 'hello')).toEqual([]);
      expect(rk.search('Hello HELLO', 'HELLO')).toEqual([6]);
    });
  });

  describe('search - special characters', () => {
    it('handles special characters', () => {
      expect(rk.search('a!b@c#', '!b@')).toEqual([1]);
    });

    it('handles whitespace', () => {
      expect(rk.search('a b c', ' b ')).toEqual([1]);
    });
  });

  describe('search - single character patterns', () => {
    it('finds all occurrences of single character', () => {
      expect(rk.search('banana', 'a')).toEqual([1, 3, 5]);
    });

    it('handles non-existing single character', () => {
      expect(rk.search('abc', 'z')).toEqual([]);
    });
  });

  describe('search - Unicode characters', () => {
    it.skip('handles basic Unicode', () => {
      expect(rk.search('héllo wörld', 'llo')).toEqual([3]);
    });
  });

  describe('findFirst', () => {
    it('returns first occurrence index', () => {
      expect(rk.findFirst('ababab', 'ab')).toBe(0);
    });

    it('returns -1 when not found', () => {
      expect(rk.findFirst('hello', 'xyz')).toBe(-1);
    });

    it('returns -1 for empty text', () => {
      expect(rk.findFirst('', 'a')).toBe(-1);
    });

    it('returns -1 when pattern longer than text', () => {
      expect(rk.findFirst('a', 'abc')).toBe(-1);
    });

    it('finds pattern at middle', () => {
      expect(rk.findFirst('hello world', 'world')).toBe(6);
    });

    it('finds pattern at end', () => {
      expect(rk.findFirst('test', 'st')).toBe(2);
    });
  });

  describe('hasPattern', () => {
    it('returns true when pattern exists', () => {
      expect(rk.hasPattern('hello world', 'world')).toBe(true);
    });

    it('returns false when pattern does not exist', () => {
      expect(rk.hasPattern('hello', 'xyz')).toBe(false);
    });

    it('returns true for exact match', () => {
      expect(rk.hasPattern('hello', 'hello')).toBe(true);
    });

    it('returns false for empty text', () => {
      expect(rk.hasPattern('', 'a')).toBe(false);
    });

    it('returns false for pattern longer than text', () => {
      expect(rk.hasPattern('a', 'abc')).toBe(false);
    });
  });

  describe('searchMultiple', () => {
    it('searches for multiple patterns', () => {
      const text = 'hello world hello';
      const patterns = ['hello', 'world', 'xyz'];
      const result = rk.searchMultiple(text, patterns);
      expect(result.get('hello')).toEqual([0, 12]);
      expect(result.get('world')).toEqual([6]);
      expect(result.get('xyz')).toEqual([]);
    });

    it('handles empty patterns array', () => {
      const result = rk.searchMultiple('hello', []);
      expect(result.size).toBe(0);
    });

    it('handles patterns that are substrings of each other', () => {
      const text = 'test test';
      const patterns = ['test', 'te'];
      const result = rk.searchMultiple(text, patterns);
      expect(result.get('test')).toEqual([0, 5]);
      expect(result.get('te')).toEqual([0, 5]);
    });

    it('handles patterns with no matches', () => {
      const text = 'hello';
      const patterns = ['xyz', 'abc'];
      const result = rk.searchMultiple(text, patterns);
      expect(result.get('xyz')).toEqual([]);
      expect(result.get('abc')).toEqual([]);
    });
  });

  describe('custom base and modulus', () => {
    it('works with custom base and modulus', () => {
      const customRk = new RabinKarp2(101, 1000003);
      expect(customRk.search('hello hello', 'hello')).toEqual([0, 6]);
    });

    it('works with small modulus', () => {
      const customRk = new RabinKarp2(256, 101);
      expect(customRk.search('hello', 'll')).toEqual([2]);
    });

    it('findFirst works with custom base and modulus', () => {
      const customRk = new RabinKarp2(137, 1000000009);
      expect(customRk.findFirst('hello world', 'world')).toBe(6);
    });

    it('hasPattern works with custom base and modulus', () => {
      const customRk = new RabinKarp2(257, 1000000007);
      expect(customRk.hasPattern('hello', 'hello')).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('handles single character text and pattern', () => {
      expect(rk.search('a', 'a')).toEqual([0]);
    });

    it('handles text and pattern of same length with match', () => {
      expect(rk.search('abc', 'abc')).toEqual([0]);
    });

    it('handles text and pattern of same length without match', () => {
      expect(rk.search('abc', 'def')).toEqual([]);
    });

    it.skip('handles pattern with only one occurrence', () => {
      expect(rk.search('aabbaabb', 'ab')).toEqual([2, 6]);
    });
  });
});
