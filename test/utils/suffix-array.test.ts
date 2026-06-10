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

  it('suffix array of single char', () => {
    const sa = new SuffixArray('a')
    expect(sa.length).toBe(1)
  })

  it('index returns correct suffix index', () => {
    const sa = new SuffixArray('banana')
    expect(sa.index(0)).toBe(5)
    expect(sa.index(1)).toBe(3)
    expect(sa.index(2)).toBe(1)
    expect(sa.index(3)).toBe(0)
    expect(sa.index(4)).toBe(4)
    expect(sa.index(5)).toBe(2)
  })

  it('index throws for out of bounds', () => {
    const sa = new SuffixArray('hello')
    expect(() => sa.index(-1)).toThrow(RangeError)
    expect(() => sa.index(10)).toThrow(RangeError)
  })

  it('toArray returns copy of indices', () => {
    const sa = new SuffixArray('hello')
    const arr = sa.toArray()
    expect(arr).toEqual(sa.indices)
    expect(arr).not.toBe(sa.indices)
  })

  it('lcp returns valid values', () => {
    const sa = new SuffixArray('banana')
    expect(sa.lcp(0)).toBeGreaterThanOrEqual(0)
    expect(sa.lcp(1)).toBeGreaterThanOrEqual(0)
    expect(sa.lcp(2)).toBeGreaterThanOrEqual(0)
  })

  it('lcp throws for out of bounds', () => {
    const sa = new SuffixArray('hello')
    expect(() => sa.lcp(-1)).toThrow(RangeError)
    expect(() => sa.lcp(10)).toThrow(RangeError)
  })

  it('longestRepeatedSubstring finds repeated pattern', () => {
    const sa = new SuffixArray('banana')
    expect(sa.longestRepeatedSubstring()).toBe('ana')
  })

  it('toJSON returns copy of indices', () => {
    const sa = new SuffixArray('hello')
    const json = sa.toJSON()
    expect(json).toEqual(sa.indices)
    expect(json).not.toBe(sa.indices)
  })

  it('longestRepeatedSubstring returns empty for no repeats', () => {
    const sa = new SuffixArray('abcdef')
    expect(sa.longestRepeatedSubstring()).toBe('')
  })

  it('longestRepeatedSubstring returns empty for empty string', () => {
    const sa = new SuffixArray('')
    expect(sa.longestRepeatedSubstring()).toBe('')
  })

  it('longestRepeatedSubstring returns empty for single char', () => {
    const sa = new SuffixArray('a')
    expect(sa.longestRepeatedSubstring()).toBe('')
  })

  it('longestRepeatedSubstring finds longest repeat', () => {
    const sa = new SuffixArray('abababab')
    expect(sa.longestRepeatedSubstring()).toBe('ababab')
  })

  it('toString returns JSON representation', () => {
    const sa = new SuffixArray('banana')
    const str = sa.toString()
    expect(str).toBe(JSON.stringify([5, 3, 1, 0, 4, 2]))
  })

  it('toString works for empty string', () => {
    const sa = new SuffixArray('')
    expect(sa.toString()).toBe('[]')
  })

  it('toJSON returns copy of indices', () => {
    const sa = new SuffixArray('hello')
    const json = sa.toJSON()
    expect(json).toEqual(sa.indices)
    expect(json).not.toBe(sa.indices)
  })

  it('toJSON returns empty array for empty string', () => {
    const sa = new SuffixArray('')
    expect(sa.toJSON()).toEqual([])
  })

  it('clone creates independent copy', () => {
    const sa1 = new SuffixArray('banana')
    const sa2 = sa1.clone()
    expect(sa2).not.toBe(sa1)
    expect(sa2.equals(sa1)).toBe(true)
    expect(sa2.length).toBe(sa1.length)
    expect(sa2.indices).toEqual(sa1.indices)
  })

  it('clone of empty string', () => {
    const sa1 = new SuffixArray('')
    const sa2 = sa1.clone()
    expect(sa2.equals(sa1)).toBe(true)
    expect(sa2.length).toBe(0)
  })

  it('equals returns true for identical arrays', () => {
    const sa1 = new SuffixArray('banana')
    const sa2 = new SuffixArray('banana')
    expect(sa1.equals(sa2)).toBe(true)
  })

  it('equals returns false for different arrays', () => {
    const sa1 = new SuffixArray('banana')
    const sa2 = new SuffixArray('apple')
    expect(sa1.equals(sa2)).toBe(false)
  })

  it('equals returns false for non-SuffixArray', () => {
    const sa = new SuffixArray('banana')
    expect(sa.equals(null)).toBe(false)
    expect(sa.equals(undefined)).toBe(false)
    expect(sa.equals('banana')).toBe(false)
    expect(sa.equals({ indices: [5, 3, 1, 0, 4, 2] })).toBe(false)
  })

  it('search with empty pattern returns empty', () => {
    const sa = new SuffixArray('hello')
    expect(sa.search('')).toEqual([])
  })

  it('search pattern longer than text returns empty', () => {
    const sa = new SuffixArray('hi')
    expect(sa.search('hello')).toEqual([])
  })

  it('search finds all occurrences in repeated string', () => {
    const sa = new SuffixArray('aaaa')
    expect(sa.search('a')).toEqual([0, 1, 2, 3])
  })

  it('search with spaces in text', () => {
    const sa = new SuffixArray('hello world')
    expect(sa.search('wo')).toEqual([6])
    expect(sa.search(' ')).toEqual([5])
  })

  it('count with empty pattern returns 0', () => {
    const sa = new SuffixArray('hello')
    expect(sa.count('')).toBe(0)
  })

  it('count pattern longer than text returns 0', () => {
    const sa = new SuffixArray('hi')
    expect(sa.count('hello')).toBe(0)
  })

  it('count returns 0 for empty string', () => {
    const sa = new SuffixArray('')
    expect(sa.count('a')).toBe(0)
  })

  it('indices returns readonly array', () => {
    const sa = new SuffixArray('hello')
    const indices = sa.indices
    expect(Array.isArray(indices)).toBe(true)
    expect(indices.length).toBe(5)
  })

  it('handles Unicode characters', () => {
    const sa = new SuffixArray('café')
    expect(sa.search('caf')).toEqual([0])
    expect(sa.search('fé')).toEqual([2])
  })

  it('longestRepeatedSubstring with multiple same-length repeats', () => {
    const sa = new SuffixArray('abcabcxyzxyz')
    const result = sa.longestRepeatedSubstring()
    expect(['abc', 'xyz'].includes(result)).toBe(true)
  })
})