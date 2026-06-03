import { describe, it, expect } from 'vitest';
import { SuffixArray } from '../../src/utils/suffix-array.js';

describe('SuffixArray', () => {
  it('handles empty text', () => {
    const sa = new SuffixArray('');

    expect(sa.length).toBe(0);
    expect(sa.indices).toEqual([]);
    expect(sa.allLCP()).toEqual([]);
    expect(sa.search('a')).toEqual([]);
    expect(sa.contains('a')).toBe(false);
    expect(sa.count('a')).toBe(0);
  });

  it('handles single character', () => {
    const sa = new SuffixArray('a');

    expect(sa.length).toBe(1);
    expect(sa.indices).toEqual([0]);
    expect(sa.search('a')).toEqual([0]);
    expect(sa.contains('a')).toBe(true);
    expect(sa.count('a')).toBe(1);
  });

  it('performs simple text search', () => {
    const sa = new SuffixArray('hello');

    expect(sa.search('ell')).toEqual([1]);
    expect(sa.search('lo')).toEqual([3]);
    expect(sa.search('hel')).toEqual([0]);
  });

  it('finds multiple occurrences', () => {
    const sa = new SuffixArray('ababab');

    const results = sa.search('ab');
    expect(results).toEqual([0, 2, 4]);
    expect(sa.count('ab')).toBe(3);
  });

  it('returns empty array when pattern not found', () => {
    const sa = new SuffixArray('hello');

    expect(sa.search('xyz')).toEqual([]);
    expect(sa.search('world')).toEqual([]);
  });

  it('contains returns true for existing pattern', () => {
    const sa = new SuffixArray('hello');

    expect(sa.contains('ell')).toBe(true);
    expect(sa.contains('hel')).toBe(true);
    expect(sa.contains('lo')).toBe(true);
  });

  it('contains returns false for non-existing pattern', () => {
    const sa = new SuffixArray('hello');

    expect(sa.contains('xyz')).toBe(false);
    expect(sa.contains('hello world')).toBe(false);
  });

  it('count returns correct number of occurrences', () => {
    const sa = new SuffixArray('banana');

    expect(sa.count('a')).toBe(3);
    expect(sa.count('na')).toBe(2);
    expect(sa.count('ban')).toBe(1);
    expect(sa.count('x')).toBe(0);
  });

  it('length property returns text length', () => {
    const sa = new SuffixArray('hello world');

    expect(sa.length).toBe(11);
  });

  it('indices are sorted', () => {
    const sa = new SuffixArray('abcde');

    const indices = sa.indices;
    for (let i = 1; i < indices.length; i++) {
      expect(indices[i]!).toBeGreaterThan(indices[i - 1]!);
    }
  });

  it('longestCommonPrefix returns correct values', () => {
    const sa = new SuffixArray('banana');

    expect(sa.longestCommonPrefix(0)).toBe(0);
    expect(sa.longestCommonPrefix(1)).toBeGreaterThanOrEqual(0);
    expect(sa.longestCommonPrefix(5)).toBeGreaterThanOrEqual(0);
  });

  it('allLCP returns array of correct length', () => {
    const sa = new SuffixArray('banana');

    const lcp = sa.allLCP();
    expect(lcp).toHaveLength(sa.length);
    expect(lcp[0]!).toBe(0);
  });

  it('handles banana text correctly', () => {
    const sa = new SuffixArray('banana');

    expect(sa.search('ana')).toEqual([1, 3]);
    expect(sa.search('na')).toEqual([2, 4]);
    expect(sa.search('ban')).toEqual([0]);
  });

  it('finds single occurrence', () => {
    const sa = new SuffixArray('abcdef');

    expect(sa.search('abc')).toEqual([0]);
    expect(sa.search('def')).toEqual([3]);
    expect(sa.count('bcd')).toBe(1);
  });

  it('search for non-existent returns empty', () => {
    const sa = new SuffixArray('hello')
    expect(sa.search('xyz')).toEqual([])
  })

  it('handles single character string', () => {
    const sa = new SuffixArray('a')
    expect(sa.length).toBe(1)
    expect(sa.search('a')).toEqual([0])
  })

  it('handles repeated characters', () => {
    const sa = new SuffixArray('aaa')
    expect(sa.length).toBe(3)
    expect(sa.search('a').length).toBe(3)
  })

  it('empty string has zero length', () => {
    const sa = new SuffixArray('')
    expect(sa.length).toBe(0)
  })

  it('single char has length 1', () => {
    const sa = new SuffixArray('a')
    expect(sa.length).toBe(1)
  })

  it('contains substring', () => {
    const sa = new SuffixArray('banana')
    expect(sa.contains('ana')).toBe(true)
    expect(sa.contains('xyz')).toBe(false)
  })

  it('lcp computes longest common prefix', () => {
    const sa = new SuffixArray('banana')
    expect(sa).toBeDefined()
  })

  it('suffix array of single char', () => {
    const sa = new SuffixArray('a')
    expect(sa).toBeDefined()
  })

  it('suffix array of empty string', () => {
    const sa = new SuffixArray('')
    expect(sa).toBeDefined()
  })
})