import { describe, it, expect } from 'vitest';
import { AhoCorasick2 } from '../../src/core/aho-corasick-2/index.js';

// ─── Constructor ───

describe('AhoCorasick2 constructor', () => {
  it('creates instance with empty patterns', () => {
    const ac = new AhoCorasick2([]);
    expect(ac).toBeInstanceOf(AhoCorasick2);
    expect(ac.patterns()).toEqual([]);
  });

  it('creates instance with single pattern', () => {
    const ac = new AhoCorasick2(['hello']);
    expect(ac.patterns()).toEqual(['hello']);
  });

  it('creates instance with multiple patterns', () => {
    const ac = new AhoCorasick2(['he', 'she', 'his', 'hers']);
    expect(ac.patterns()).toEqual(['he', 'she', 'his', 'hers']);
  });
});

// ─── search() ───

describe('AhoCorasick2.search', () => {
  it('returns empty array when no patterns match', () => {
    const ac = new AhoCorasick2(['xyz']);
    expect(ac.search('hello world')).toEqual([]);
  });

  it('returns empty array for empty text', () => {
    const ac = new AhoCorasick2(['a']);
    expect(ac.search('')).toEqual([]);
  });

  it('finds a single pattern match', () => {
    const ac = new AhoCorasick2(['abc']);
    const results = ac.search('xxxabcxxx');
    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({ pattern: 'abc', startIndex: 3, endIndex: 5 });
  });

  it('finds multiple occurrences of the same pattern', () => {
    const ac = new AhoCorasick2(['ab']);
    const results = ac.search('ababab');
    expect(results).toHaveLength(3);
    expect(results[0]).toEqual({ pattern: 'ab', startIndex: 0, endIndex: 1 });
    expect(results[1]).toEqual({ pattern: 'ab', startIndex: 2, endIndex: 3 });
    expect(results[2]).toEqual({ pattern: 'ab', startIndex: 4, endIndex: 5 });
  });

  it('finds overlapping patterns', () => {
    const ac = new AhoCorasick2(['he', 'she', 'his', 'hers']);
    const results = ac.search('ahishers');
    const patterns = results.map(r => r.pattern);
    expect(patterns).toContain('his');
    expect(patterns).toContain('she');
    expect(patterns).toContain('he');
    expect(patterns).toContain('hers');
  });

  it('finds patterns at the start of text', () => {
    const ac = new AhoCorasick2(['hello']);
    const results = ac.search('hello world');
    expect(results).toHaveLength(1);
    expect(results[0]!.startIndex).toBe(0);
  });

  it('finds patterns at the end of text', () => {
    const ac = new AhoCorasick2(['world']);
    const results = ac.search('hello world');
    expect(results).toHaveLength(1);
    expect(results[0]!.endIndex).toBe(10);
  });

  it('finds single-character patterns', () => {
    const ac = new AhoCorasick2(['a']);
    const results = ac.search('banana');
    expect(results).toHaveLength(3);
  });

  it('handles duplicate patterns in constructor', () => {
    const ac = new AhoCorasick2(['a', 'a']);
    const results = ac.search('a');
    // Duplicated pattern produces duplicated matches
    expect(results.length).toBeGreaterThanOrEqual(1);
  });
});

// ─── hasMatch() ───

describe('AhoCorasick2.hasMatch', () => {
  it('returns false when no match exists', () => {
    const ac = new AhoCorasick2(['xyz']);
    expect(ac.hasMatch('hello')).toBe(false);
  });

  it('returns true when match exists', () => {
    const ac = new AhoCorasick2(['hello']);
    expect(ac.hasMatch('hello world')).toBe(true);
  });

  it('returns false for empty text', () => {
    const ac = new AhoCorasick2(['a']);
    expect(ac.hasMatch('')).toBe(false);
  });

  it('returns true for partial match at end', () => {
    const ac = new AhoCorasick2(['world']);
    expect(ac.hasMatch('hello world')).toBe(true);
  });

  it('returns false with empty patterns', () => {
    const ac = new AhoCorasick2([]);
    expect(ac.hasMatch('anything')).toBe(false);
  });
});

// ─── patterns() ───

describe('AhoCorasick2.patterns', () => {
  it('returns copy of patterns list', () => {
    const ac = new AhoCorasick2(['a', 'b']);
    const pats = ac.patterns();
    expect(pats).toEqual(['a', 'b']);
    pats.push('c');
    expect(ac.patterns()).toEqual(['a', 'b']);
  });
});

// ─── addPattern() ───

describe('AhoCorasick2.addPattern', () => {
  it('adds a new pattern and finds it', () => {
    const ac = new AhoCorasick2(['hello']);
    ac.addPattern('world');
    expect(ac.patterns()).toEqual(['hello', 'world']);
    expect(ac.search('world')).toHaveLength(1);
  });

  it('maintains existing patterns after add', () => {
    const ac = new AhoCorasick2(['he']);
    ac.addPattern('she');
    expect(ac.hasMatch('he')).toBe(true);
    expect(ac.hasMatch('she')).toBe(true);
  });

  it('finds newly added pattern in complex text', () => {
    const ac = new AhoCorasick2(['abc']);
    ac.addPattern('bcd');
    const results = ac.search('abcd');
    const patterns = results.map(r => r.pattern);
    expect(patterns).toContain('abc');
    expect(patterns).toContain('bcd');
  });
});
