import { describe, it, expect } from 'vitest';
import { RabinKarp2 } from '../../src/core/rabin-karp-2/index.js';

// ─── Constructor ───

describe('RabinKarp2 constructor', () => {
  it('creates instance with default parameters', () => {
    const rk = new RabinKarp2();
    expect(rk).toBeInstanceOf(RabinKarp2);
  });

  it('creates instance with custom base and modulus', () => {
    const rk = new RabinKarp2(101, 997);
    expect(rk).toBeInstanceOf(RabinKarp2);
  });
});

// ─── search() ───

describe('RabinKarp2.search', () => {
  it('finds a single occurrence', () => {
    const rk = new RabinKarp2();
    expect(rk.search('hello world', 'world')).toEqual([6]);
  });

  it('finds multiple occurrences', () => {
    const rk = new RabinKarp2();
    expect(rk.search('abcabcabc', 'abc')).toEqual([0, 3, 6]);
  });

  it('finds overlapping occurrences', () => {
    const rk = new RabinKarp2();
    expect(rk.search('aaaaa', 'aa')).toEqual([0, 1, 2, 3]);
  });

  it('returns empty array when pattern not found', () => {
    const rk = new RabinKarp2();
    expect(rk.search('hello world', 'xyz')).toEqual([]);
  });

  it('returns empty array for empty pattern', () => {
    const rk = new RabinKarp2();
    expect(rk.search('hello', '')).toEqual([]);
  });

  it('returns empty array when pattern is longer than text', () => {
    const rk = new RabinKarp2();
    expect(rk.search('hi', 'hello')).toEqual([]);
  });

  it('finds pattern at the beginning', () => {
    const rk = new RabinKarp2();
    expect(rk.search('abcdef', 'abc')).toEqual([0]);
  });

  it('finds pattern at the end', () => {
    const rk = new RabinKarp2();
    expect(rk.search('abcdef', 'def')).toEqual([3]);
  });

  it('finds single character pattern', () => {
    const rk = new RabinKarp2();
    expect(rk.search('abcba', 'b')).toEqual([1, 3]);
  });

  it('finds pattern equal to the entire text', () => {
    const rk = new RabinKarp2();
    expect(rk.search('exact', 'exact')).toEqual([0]);
  });

  it('handles custom base and modulus correctly', () => {
    const rk = new RabinKarp2(101, 997);
    expect(rk.search('the quick brown fox', 'brown')).toEqual([10]);
  });

  it('returns empty array for empty text', () => {
    const rk = new RabinKarp2();
    expect(rk.search('', 'a')).toEqual([]);
  });
});

// ─── findFirst() ───

describe('RabinKarp2.findFirst', () => {
  it('returns index of first occurrence', () => {
    const rk = new RabinKarp2();
    expect(rk.findFirst('abcabc', 'abc')).toBe(0);
  });

  it('returns -1 when pattern not found', () => {
    const rk = new RabinKarp2();
    expect(rk.findFirst('hello', 'xyz')).toBe(-1);
  });

  it('returns -1 for empty pattern', () => {
    const rk = new RabinKarp2();
    expect(rk.findFirst('hello', '')).toBe(-1);
  });

  it('returns -1 when pattern is longer than text', () => {
    const rk = new RabinKarp2();
    expect(rk.findFirst('ab', 'abc')).toBe(-1);
  });

  it('finds pattern at the end of text', () => {
    const rk = new RabinKarp2();
    expect(rk.findFirst('abcdef', 'ef')).toBe(4);
  });
});

// ─── hasPattern() ───

describe('RabinKarp2.hasPattern', () => {
  it('returns true when pattern exists', () => {
    const rk = new RabinKarp2();
    expect(rk.hasPattern('hello world', 'world')).toBe(true);
  });

  it('returns false when pattern does not exist', () => {
    const rk = new RabinKarp2();
    expect(rk.hasPattern('hello world', 'planet')).toBe(false);
  });

  it('returns false for empty pattern', () => {
    const rk = new RabinKarp2();
    expect(rk.hasPattern('hello', '')).toBe(false);
  });
});

// ─── searchMultiple() ───

describe('RabinKarp2.searchMultiple', () => {
  it('searches multiple patterns at once', () => {
    const rk = new RabinKarp2();
    const result = rk.searchMultiple('abc def ghi', ['abc', 'def', 'xyz']);
    expect(result.get('abc')).toEqual([0]);
    expect(result.get('def')).toEqual([4]);
    expect(result.get('xyz')).toEqual([]);
  });

  it('returns empty results for empty patterns array', () => {
    const rk = new RabinKarp2();
    const result = rk.searchMultiple('hello', []);
    expect(result.size).toBe(0);
  });

  it('handles duplicate patterns by overwriting in map', () => {
    const rk = new RabinKarp2();
    const result = rk.searchMultiple('aaa', ['a', 'a']);
    expect(result.get('a')).toEqual([0, 1, 2]);
    expect(result.size).toBe(1);
  });

  it('handles patterns with multiple occurrences each', () => {
    const rk = new RabinKarp2();
    const result = rk.searchMultiple('ababab', ['ab', 'ba']);
    expect(result.get('ab')).toEqual([0, 2, 4]);
    expect(result.get('ba')).toEqual([1, 3]);
  });
});
