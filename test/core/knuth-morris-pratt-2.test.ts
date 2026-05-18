import { describe, it, expect } from 'vitest';
import { KnuthMorrisPratt2 } from '../../src/core/knuth-morris-pratt-2/index.js';

// ─── Constructor ───

describe('KnuthMorrisPratt2 constructor', () => {
  it('creates instance with a valid pattern', () => {
    const kmp = new KnuthMorrisPratt2('abc');
    expect(kmp).toBeInstanceOf(KnuthMorrisPratt2);
  });

  it('creates instance with an empty pattern', () => {
    const kmp = new KnuthMorrisPratt2('');
    expect(kmp).toBeInstanceOf(KnuthMorrisPratt2);
  });

  it('creates instance with single character pattern', () => {
    const kmp = new KnuthMorrisPratt2('a');
    expect(kmp).toBeInstanceOf(KnuthMorrisPratt2);
  });
});

// ─── pattern() ───

describe('KnuthMorrisPratt2.pattern', () => {
  it('returns the stored pattern', () => {
    const kmp = new KnuthMorrisPratt2('hello');
    expect(kmp.pattern()).toBe('hello');
  });

  it('returns empty string for empty pattern', () => {
    const kmp = new KnuthMorrisPratt2('');
    expect(kmp.pattern()).toBe('');
  });
});

// ─── search() ───

describe('KnuthMorrisPratt2.search', () => {
  it('finds a single occurrence', () => {
    const kmp = new KnuthMorrisPratt2('world');
    expect(kmp.search('hello world')).toEqual([6]);
  });

  it('finds multiple occurrences', () => {
    const kmp = new KnuthMorrisPratt2('ab');
    expect(kmp.search('ababab')).toEqual([0, 2, 4]);
  });

  it('finds overlapping occurrences', () => {
    const kmp = new KnuthMorrisPratt2('aa');
    expect(kmp.search('aaaa')).toEqual([0, 1, 2]);
  });

  it('returns empty array when pattern not found', () => {
    const kmp = new KnuthMorrisPratt2('xyz');
    expect(kmp.search('hello world')).toEqual([]);
  });

  it('returns empty array for empty pattern', () => {
    const kmp = new KnuthMorrisPratt2('');
    expect(kmp.search('hello')).toEqual([]);
  });

  it('returns empty array for empty text', () => {
    const kmp = new KnuthMorrisPratt2('abc');
    expect(kmp.search('')).toEqual([]);
  });

  it('returns empty array when pattern is longer than text', () => {
    const kmp = new KnuthMorrisPratt2('abcdef');
    expect(kmp.search('abc')).toEqual([]);
  });

  it('finds pattern at the beginning', () => {
    const kmp = new KnuthMorrisPratt2('abc');
    expect(kmp.search('abcdef')).toEqual([0]);
  });

  it('finds pattern at the end', () => {
    const kmp = new KnuthMorrisPratt2('def');
    expect(kmp.search('abcdef')).toEqual([3]);
  });

  it('finds pattern equal to the entire text', () => {
    const kmp = new KnuthMorrisPratt2('exact');
    expect(kmp.search('exact')).toEqual([0]);
  });

  it('handles repeating pattern with proper LPS', () => {
    const kmp = new KnuthMorrisPratt2('ABABCABAB');
    expect(kmp.search('ABABCABABCABAB')).toEqual([0, 5]);
  });

  it('finds single character matches', () => {
    const kmp = new KnuthMorrisPratt2('a');
    expect(kmp.search('banana')).toEqual([1, 3, 5]);
  });
});

// ─── findFirst() ───

describe('KnuthMorrisPratt2.findFirst', () => {
  it('returns index of first occurrence', () => {
    const kmp = new KnuthMorrisPratt2('abc');
    expect(kmp.findFirst('abcabc')).toBe(0);
  });

  it('returns -1 when pattern not found', () => {
    const kmp = new KnuthMorrisPratt2('xyz');
    expect(kmp.findFirst('hello')).toBe(-1);
  });

  it('returns -1 for empty pattern', () => {
    const kmp = new KnuthMorrisPratt2('');
    expect(kmp.findFirst('hello')).toBe(-1);
  });

  it('returns -1 for empty text', () => {
    const kmp = new KnuthMorrisPratt2('abc');
    expect(kmp.findFirst('')).toBe(-1);
  });

  it('finds first match among multiple', () => {
    const kmp = new KnuthMorrisPratt2('ana');
    expect(kmp.findFirst('banana')).toBe(1);
  });
});

// ─── hasMatch() ───

describe('KnuthMorrisPratt2.hasMatch', () => {
  it('returns true when pattern exists', () => {
    const kmp = new KnuthMorrisPratt2('world');
    expect(kmp.hasMatch('hello world')).toBe(true);
  });

  it('returns false when pattern does not exist', () => {
    const kmp = new KnuthMorrisPratt2('xyz');
    expect(kmp.hasMatch('hello world')).toBe(false);
  });

  it('returns false for empty pattern', () => {
    const kmp = new KnuthMorrisPratt2('');
    expect(kmp.hasMatch('hello')).toBe(false);
  });

  it('returns false for empty text', () => {
    const kmp = new KnuthMorrisPratt2('abc');
    expect(kmp.hasMatch('')).toBe(false);
  });
});
