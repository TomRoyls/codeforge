import { describe, it, expect } from 'vitest';
import { BoyerMooreHorspool2 } from '../src/core/boyer-moore-horspool-2';

describe('BoyerMooreHorspool2', () => {
  describe('basic search', () => {
    it('should find single match', async () => {
      const searcher = new BoyerMooreHorspool2('hello');
      const result = searcher.search('hello world');
      expect(result).toEqual([0]);
    });

    it('should find match in middle of text', async () => {
      const searcher = new BoyerMooreHorspool2('world');
      const result = searcher.search('hello world hello');
      expect(result).toEqual([6]);
    });

    it('should find match at end of text', async () => {
      const searcher = new BoyerMooreHorspool2('world');
      const result = searcher.search('hello world');
      expect(result).toEqual([6]);
    });
  });

  describe('multiple matches', () => {
    it('should find all occurrences', async () => {
      const searcher = new BoyerMooreHorspool2('ab');
      const result = searcher.search('ababab');
      expect(result).toEqual([0, 2, 4]);
    });

    it('should find all non-overlapping occurrences', async () => {
      const searcher = new BoyerMooreHorspool2('test');
      const result = searcher.search('test test test');
      expect(result).toEqual([0, 5, 10]);
    });

    it('should find overlapping matches', async () => {
      const searcher = new BoyerMooreHorspool2('aba');
      const result = searcher.search('abababa');
      expect(result).toEqual([0, 2, 4]);
    });
  });

  describe('no match', () => {
    it('should return empty array when pattern not found', async () => {
      const searcher = new BoyerMooreHorspool2('xyz');
      const result = searcher.search('hello world');
      expect(result).toEqual([]);
    });

    it('should return empty array when characters are close but not matching', async () => {
      const searcher = new BoyerMooreHorspool2('abc');
      const result = searcher.search('abd');
      expect(result).toEqual([]);
    });
  });

  describe('first match', () => {
    it('should return first occurrence index', async () => {
      const searcher = new BoyerMooreHorspool2('test');
      const result = searcher.findFirst('test test test');
      expect(result).toBe(0);
    });

    it('should return first occurrence index when pattern appears later', async () => {
      const searcher = new BoyerMooreHorspool2('world');
      const result = searcher.findFirst('hello world hello');
      expect(result).toBe(6);
    });

    it('should return -1 when no match found', async () => {
      const searcher = new BoyerMooreHorspool2('xyz');
      const result = searcher.findFirst('hello world');
      expect(result).toBe(-1);
    });
  });

  describe('has match', () => {
    it('should return true when pattern exists', async () => {
      const searcher = new BoyerMooreHorspool2('hello');
      const result = searcher.hasMatch('hello world');
      expect(result).toBe(true);
    });

    it('should return true when pattern exists in middle', async () => {
      const searcher = new BoyerMooreHorspool2('world');
      const result = searcher.hasMatch('hello world hello');
      expect(result).toBe(true);
    });

    it('should return false when pattern does not exist', async () => {
      const searcher = new BoyerMooreHorspool2('xyz');
      const result = searcher.hasMatch('hello world');
      expect(result).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle empty pattern', async () => {
      const searcher = new BoyerMooreHorspool2('');
      expect(searcher.search('hello')).toEqual([]);
      expect(searcher.findFirst('hello')).toBe(-1);
      expect(searcher.hasMatch('hello')).toBe(false);
    });

    it('should handle empty text', async () => {
      const searcher = new BoyerMooreHorspool2('hello');
      expect(searcher.search('')).toEqual([]);
      expect(searcher.findFirst('')).toBe(-1);
      expect(searcher.hasMatch('')).toBe(false);
    });

    it('should handle pattern longer than text', async () => {
      const searcher = new BoyerMooreHorspool2('hello world');
      expect(searcher.search('hello')).toEqual([]);
      expect(searcher.findFirst('hello')).toBe(-1);
      expect(searcher.hasMatch('hello')).toBe(false);
    });

    it('should handle single character pattern', async () => {
      const searcher = new BoyerMooreHorspool2('a');
      expect(searcher.search('abcabc')).toEqual([0, 3]);
      expect(searcher.findFirst('abcabc')).toBe(0);
      expect(searcher.hasMatch('abcabc')).toBe(true);
    });

    it('should handle pattern equal to text', async () => {
      const searcher = new BoyerMooreHorspool2('hello');
      expect(searcher.search('hello')).toEqual([0]);
      expect(searcher.findFirst('hello')).toBe(0);
      expect(searcher.hasMatch('hello')).toBe(true);
    });
  });

  describe('pattern property', () => {
    it('should return the pattern', async () => {
      const searcher = new BoyerMooreHorspool2('test');
      expect(searcher.pattern()).toBe('test');
    });

    it('should return pattern with special characters', async () => {
      const searcher = new BoyerMooreHorspool2('hello!@#');
      expect(searcher.pattern()).toBe('hello!@#');
    });

    it('should return pattern with spaces', async () => {
      const searcher = new BoyerMooreHorspool2('hello world');
      expect(searcher.pattern()).toBe('hello world');
    });
  });

  describe('overlapping patterns', () => {
    it('should find all overlapping matches', async () => {
      const searcher = new BoyerMooreHorspool2('aa');
      const result = searcher.search('aaa');
      expect(result).toEqual([0, 1]);
    });

    it('should handle complex overlapping pattern', async () => {
      const searcher = new BoyerMooreHorspool2('ababa');
      const result = searcher.search('abababa');
      expect(result).toEqual([0, 2]);
    });

    it('should handle pattern with repeated suffix', async () => {
      const searcher = new BoyerMooreHorspool2('abab');
      const result = searcher.search('ababab');
      expect(result).toEqual([0, 2]);
    });
  });

  describe('additional coverage', () => {
    it('should find match with single char text', async () => {
      const searcher = new BoyerMooreHorspool2('a');
      expect(searcher.search('a')).toEqual([0]);
      expect(searcher.search('b')).toEqual([]);
    });

    it('should handle numeric string patterns', async () => {
      const searcher = new BoyerMooreHorspool2('123');
      expect(searcher.search('0123456123')).toEqual([1, 7]);
    });

    it('should handle pattern with special regex characters', async () => {
      const searcher = new BoyerMooreHorspool2('$.+*');
      expect(searcher.search('test$.+*test')).toEqual([4]);
    });

    it('should handle consecutive single char matches', async () => {
      const searcher = new BoyerMooreHorspool2('a');
      expect(searcher.search('aaaa')).toEqual([0, 1, 2, 3]);
    });

    it('should handle two-char pattern in long text', async () => {
      const searcher = new BoyerMooreHorspool2('xy');
      expect(searcher.search('abcxydefxy')).toEqual([3, 8]);
    });

    it('should handle pattern equal to text', async () => {
      const searcher = new BoyerMooreHorspool2('exact');
      expect(searcher.search('exact')).toEqual([0]);
    });

    it('should handle empty pattern', async () => {
      const searcher = new BoyerMooreHorspool2('');
      expect(searcher.search('any')).toEqual([]);
    });

    it('should handle findFirst', async () => {
      const searcher = new BoyerMooreHorspool2('abc');
      expect(searcher.findFirst('xyzabcdef')).toBe(3);
      expect(searcher.findFirst('nothing')).toBe(-1);
    });

    it('should handle pattern method', async () => {
      const searcher = new BoyerMooreHorspool2('abc');
      expect(searcher.pattern()).toBe('abc');
    });

    it('should handle hasMatch', async () => {
      const searcher = new BoyerMooreHorspool2('hello');
      expect(searcher.hasMatch('say hello world')).toBe(true);
      expect(searcher.hasMatch('say goodbye')).toBe(false);
    });

    it('should handle search with multiple matches', async () => {
      const searcher = new BoyerMooreHorspool2('ab');
      const results = searcher.search('ababab');
    expect(results.length).toBe(3);
  });

  it('should handle findFirst on first position', async () => {
    const searcher = new BoyerMooreHorspool2('hello');
    expect(searcher.findFirst('hello world')).toBe(0);
  });

  it('should handle pattern longer than text', async () => {
    const searcher = new BoyerMooreHorspool2('longpattern');
    expect(searcher.findFirst('short')).toBe(-1);
  });

  it('should handle search with multiple matches', async () => {
    const searcher = new BoyerMooreHorspool2('ab');
    const results = searcher.search('ababab');
    expect(results.length).toBe(3);
  });

  it('should handle hasMatch', async () => {
    const searcher = new BoyerMooreHorspool2('hello');
    expect(searcher.hasMatch('say hello world')).toBe(true);
    expect(searcher.hasMatch('no match')).toBe(false);
  });

  it('should handle findFirst', () => {
    const searcher = new BoyerMooreHorspool2('abc');
    expect(searcher.findFirst('xyzabcdef')).toBe(3);
    expect(searcher.findFirst('no match')).toBe(-1);
  });

  it('should handle pattern method', () => {
    const searcher = new BoyerMooreHorspool2('test');
    expect(searcher.pattern()).toBe('test');
  });

  it('should handle hasMatch with no match', () => {
    const searcher = new BoyerMooreHorspool2('xyz');
    expect(searcher.hasMatch('hello world')).toBe(false);
  });

  it('should handle search returning positions', () => {
    const searcher = new BoyerMooreHorspool2('ab');
    const results = searcher.search('ababab');
    expect(results.length).toBe(3);
  });

  it('should handle findFirst', () => {
    const searcher = new BoyerMooreHorspool2('world');
    expect(searcher.findFirst('hello world')).toBe(6);
  });
  it('should handle pattern getter', () => {
    const searcher = new BoyerMooreHorspool2('test');
    expect(searcher.pattern()).toBe('test');
  });
  it('should handle hasMatch', () => {
    const searcher = new BoyerMooreHorspool2('abc');
    expect(searcher.hasMatch('xyzabc')).toBe(true);
    expect(searcher.hasMatch('xyz')).toBe(false);
  });
 });
});
