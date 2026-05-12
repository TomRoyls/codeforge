import { describe, it, expect } from 'vitest';
import { KMPSearch } from './src/core/kmp-search/index.js';

describe('KMPSearch - exact matches', () => {
  it('should find single exact match at start', () => {
    const kmp = new KMPSearch('hello');
    expect(kmp.search('hello world')).toEqual([0]);
  });

  it('should find single exact match at end', () => {
    const kmp = new KMPSearch('world');
    expect(kmp.search('hello world')).toEqual([6]);
  });

  it('should find single exact match in middle', () => {
    const kmp = new KMPSearch('lo');
    expect(kmp.search('hello world')).toEqual([3]);
  });

  it('should match entire string', () => {
    const kmp = new KMPSearch('hello');
    expect(kmp.search('hello')).toEqual([0]);
  });

  it('should be case sensitive', () => {
    const kmp = new KMPSearch('Hello');
    expect(kmp.search('hello')).toEqual([]);
  });
});

describe('KMPSearch - multiple matches', () => {
  it('should find two matches', () => {
    const kmp = new KMPSearch('ab');
    expect(kmp.search('ab ab')).toEqual([0, 3]);
  });

  it('should find three matches', () => {
    const kmp = new KMPSearch('ab');
    expect(kmp.search('ab ab ab')).toEqual([0, 3, 6]);
  });

  it('should find multiple separated matches', () => {
    const kmp = new KMPSearch('is');
    expect(kmp.search('this is a test')).toEqual([2, 5]);
  });

  it('should find consecutive matches', () => {
    const kmp = new KMPSearch('aa');
    expect(kmp.search('aaaa')).toEqual([0, 1, 2]);
  });
});

describe('KMPSearch - no match', () => {
  it('should return empty array when no match', () => {
    const kmp = new KMPSearch('xyz');
    expect(kmp.search('hello world')).toEqual([]);
  });

  it('should return empty array for empty text', () => {
    const kmp = new KMPSearch('hello');
    expect(kmp.search('')).toEqual([]);
  });

  it('should return empty array for different characters', () => {
    const kmp = new KMPSearch('abc');
    expect(kmp.search('xyz')).toEqual([]);
  });
});

describe('KMPSearch - overlapping matches', () => {
  it('should find overlapping matches', () => {
    const kmp = new KMPSearch('aba');
    expect(kmp.search('ababa')).toEqual([0, 2]);
  });

  it('should find all overlapping occurrences', () => {
    const kmp = new KMPSearch('aa');
    expect(kmp.search('aaaaa')).toEqual([0, 1, 2, 3]);
  });

  it('should handle pattern with self-overlap', () => {
    const kmp = new KMPSearch('abcab');
    expect(kmp.search('abcabcab')).toEqual([0, 3]);
  });

  it('should find overlapping prefix-suffix matches', () => {
    const kmp = new KMPSearch('abab');
    expect(kmp.search('ababab')).toEqual([0, 2]);
  });
});

describe('KMPSearch - empty pattern', () => {
  it('should return all positions for empty pattern', () => {
    const kmp = new KMPSearch('');
    expect(kmp.search('hello')).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('should return [0] for empty pattern and empty text', () => {
    const kmp = new KMPSearch('');
    expect(kmp.search('')).toEqual([0]);
  });

  it('contains should return true for empty pattern', () => {
    const kmp = new KMPSearch('');
    expect(kmp.contains('hello')).toBe(true);
  });

  it('count should return text length plus one for empty pattern', () => {
    const kmp = new KMPSearch('');
    expect(kmp.count('hello')).toBe(6);
  });

  it('first should return 0 for empty pattern', () => {
    const kmp = new KMPSearch('');
    expect(kmp.first('hello')).toBe(0);
  });
});

describe('KMPSearch - pattern longer than text', () => {
  it('should return empty array when pattern longer than text', () => {
    const kmp = new KMPSearch('hello world');
    expect(kmp.search('hello')).toEqual([]);
  });

  it('should return -1 for first when pattern longer than text', () => {
    const kmp = new KMPSearch('hello world');
    expect(kmp.first('hello')).toBe(-1);
  });

  it('should return 0 for count when pattern longer than text', () => {
    const kmp = new KMPSearch('hello world');
    expect(kmp.count('hello')).toBe(0);
  });

  it('should return false for contains when pattern longer than text', () => {
    const kmp = new KMPSearch('hello world');
    expect(kmp.contains('hello')).toBe(false);
  });
});

describe('KMPSearch - single character', () => {
  it('should find single character matches', () => {
    const kmp = new KMPSearch('a');
    expect(kmp.search('banana')).toEqual([1, 3, 5]);
  });

  it('should find single character at start', () => {
    const kmp = new KMPSearch('a');
    expect(kmp.search('apple')).toEqual([0]);
  });

  it('should find single character at end', () => {
    const kmp = new KMPSearch('e');
    expect(kmp.search('apple')).toEqual([4]);
  });

  it('should return empty array for non-existent single character', () => {
    const kmp = new KMPSearch('z');
    expect(kmp.search('apple')).toEqual([]);
  });
});

describe('KMPSearch - unicode characters', () => {
  it('should handle unicode characters', () => {
    const kmp = new KMPSearch('世界');
    expect(kmp.search('你好世界')).toEqual([2]);
  });

  it('should find multiple unicode matches', () => {
    const kmp = new KMPSearch('世');
    expect(kmp.search('世界世界')).toEqual([0, 2]);
  });

  it('should handle emoji', () => {
    const kmp = new KMPSearch('🎉');
    expect(kmp.search('🎉🎉🎉')).toEqual([0, 2, 4]);
  });

  it('should handle mixed unicode patterns', () => {
    const kmp = new KMPSearch('é');
    expect(kmp.search('café')).toEqual([3]);
  });
});

describe('KMPSearch - contains method', () => {
  it('should return true when pattern exists', () => {
    const kmp = new KMPSearch('hello');
    expect(kmp.contains('hello world')).toBe(true);
  });

  it('should return false when pattern does not exist', () => {
    const kmp = new KMPSearch('xyz');
    expect(kmp.contains('hello world')).toBe(false);
  });

  it('should return true for exact match', () => {
    const kmp = new KMPSearch('hello');
    expect(kmp.contains('hello')).toBe(true);
  });
});

describe('KMPSearch - count method', () => {
  it('should return 1 for single match', () => {
    const kmp = new KMPSearch('hello');
    expect(kmp.count('hello world')).toBe(1);
  });

  it('should return correct count for multiple matches', () => {
    const kmp = new KMPSearch('is');
    expect(kmp.count('this is a test')).toBe(2);
  });

  it('should return 0 for no matches', () => {
    const kmp = new KMPSearch('xyz');
    expect(kmp.count('hello world')).toBe(0);
  });

  it('should count overlapping matches', () => {
    const kmp = new KMPSearch('aa');
    expect(kmp.count('aaaa')).toBe(3);
  });
});

describe('KMPSearch - first method', () => {
  it('should return position of first match', () => {
    const kmp = new KMPSearch('hello');
    expect(kmp.first('hello world')).toBe(0);
  });

  it('should return -1 when no match', () => {
    const kmp = new KMPSearch('xyz');
    expect(kmp.first('hello world')).toBe(-1);
  });

  it('should return first position among multiple', () => {
    const kmp = new KMPSearch('is');
    expect(kmp.first('this is a test')).toBe(2);
  });

  it('should return -1 for empty text', () => {
    const kmp = new KMPSearch('hello');
    expect(kmp.first('')).toBe(-1);
  });
});

describe('KMPSearch - static search method', () => {
  it('should work as static method', () => {
    expect(KMPSearch.search('hello world', 'hello')).toEqual([0]);
  });

  it('should find multiple matches statically', () => {
    expect(KMPSearch.search('ab ab ab', 'ab')).toEqual([0, 3, 6]);
  });

  it('should return empty array for no match statically', () => {
    expect(KMPSearch.search('hello world', 'xyz')).toEqual([]);
  });

  it('should handle overlapping matches statically', () => {
    expect(KMPSearch.search('aaaa', 'aa')).toEqual([0, 1, 2]);
  });
});

describe('KMPSearch - static buildLPS method', () => {
  it('should build correct LPS for pattern with no prefix-suffix', () => {
    expect(KMPSearch.buildLPS('abc')).toEqual([0, 0, 0]);
  });

  it('should build correct LPS for pattern with prefix-suffix', () => {
    expect(KMPSearch.buildLPS('aba')).toEqual([0, 0, 1]);
  });

  it('should build correct LPS for pattern with repeated characters', () => {
    expect(KMPSearch.buildLPS('aaaa')).toEqual([0, 1, 2, 3]);
  });

  it('should build correct LPS for complex pattern', () => {
    expect(KMPSearch.buildLPS('ababc')).toEqual([0, 0, 1, 2, 0]);
  });

  it('should return empty array for empty pattern', () => {
    expect(KMPSearch.buildLPS('')).toEqual([]);
  });

  it('should return [0] for single character pattern', () => {
    expect(KMPSearch.buildLPS('a')).toEqual([0]);
  });
});

describe('KMPSearch - special cases', () => {
  it('should handle pattern with spaces', () => {
    const kmp = new KMPSearch('hello world');
    expect(kmp.search('say hello world now')).toEqual([4]);
  });

  it('should handle pattern at boundary', () => {
    const kmp = new KMPSearch('abc');
    expect(kmp.search('abc')).toEqual([0]);
  });

  it('should handle repeated pattern search', () => {
    const kmp = new KMPSearch('test');
    expect(kmp.search('test test test')).toEqual([0, 5, 10]);
  });

  it('should maintain state across multiple searches', () => {
    const kmp = new KMPSearch('hello');
    expect(kmp.search('hello world')).toEqual([0]);
    expect(kmp.search('say hello')).toEqual([4]);
    expect(kmp.search('no match here')).toEqual([]);
  });
});

describe('KMPSearch - edge cases with repetition', () => {
  it('should handle pattern that is repetition of itself', () => {
    const kmp = new KMPSearch('abab');
    expect(kmp.search('abababab')).toEqual([0, 2, 4]);
  });

  it('should handle text that is repetition of pattern', () => {
    const kmp = new KMPSearch('abc');
    expect(kmp.search('abcabcabc')).toEqual([0, 3, 6]);
  });

  it('should handle partial matches at end', () => {
    const kmp = new KMPSearch('abc');
    expect(kmp.search('ab')).toEqual([]);
  });
});
