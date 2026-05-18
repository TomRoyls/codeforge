import { describe, it, expect } from 'vitest';
import { WaveletTree3 } from '../../src/core/wavelet-tree-3/index.js';

// ─── Constructor ───

describe('WaveletTree3 constructor', () => {
  it('constructs from a simple string', () => {
    const wt = new WaveletTree3('abc');
    expect(wt.length()).toBe(3);
  });

  it('constructs from an empty string', () => {
    const wt = new WaveletTree3('');
    expect(wt.length()).toBe(0);
  });

  it('constructs from a single-character string', () => {
    const wt = new WaveletTree3('x');
    expect(wt.length()).toBe(1);
  });

  it('constructs from string with repeated characters', () => {
    const wt = new WaveletTree3('aaa');
    expect(wt.length()).toBe(3);
  });

  it('constructs from string with diverse alphabet', () => {
    const wt = new WaveletTree3('hello world');
    expect(wt.length()).toBe(11);
  });
});

// ─── length ───

describe('WaveletTree3 length', () => {
  it('returns 0 for empty string', () => {
    const wt = new WaveletTree3('');
    expect(wt.length()).toBe(0);
  });

  it('returns correct length for non-empty string', () => {
    const wt = new WaveletTree3('abcdef');
    expect(wt.length()).toBe(6);
  });

  it('returns 1 for single character', () => {
    const wt = new WaveletTree3('z');
    expect(wt.length()).toBe(1);
  });
});

// ─── toString ───

describe('WaveletTree3 toString', () => {
  it('reconstructs the original string', () => {
    const wt = new WaveletTree3('banana');
    expect(wt.toString()).toBe('banana');
  });

  it('returns empty string for empty input', () => {
    const wt = new WaveletTree3('');
    expect(wt.toString()).toBe('');
  });

  it('handles single character', () => {
    const wt = new WaveletTree3('q');
    expect(wt.toString()).toBe('q');
  });

  it('handles repeated characters', () => {
    const wt = new WaveletTree3('aaaaa');
    expect(wt.toString()).toBe('aaaaa');
  });

  it('handles diverse input', () => {
    const input = 'abcdefghij';
    const wt = new WaveletTree3(input);
    expect(wt.toString()).toBe(input);
  });
});

// ─── access ───

describe('WaveletTree3 access', () => {
  it('retrieves each character correctly', () => {
    const input = 'hello';
    const wt = new WaveletTree3(input);
    for (let i = 0; i < input.length; i++) {
      expect(wt.access(i)).toBe(input[i]);
    }
  });

  it('retrieves single character', () => {
    const wt = new WaveletTree3('x');
    expect(wt.access(0)).toBe('x');
  });

  it('handles repeated characters', () => {
    const wt = new WaveletTree3('aaa');
    expect(wt.access(0)).toBe('a');
    expect(wt.access(1)).toBe('a');
    expect(wt.access(2)).toBe('a');
  });

  it('throws on negative index', () => {
    const wt = new WaveletTree3('abc');
    expect(() => wt.access(-1)).toThrow('Index out of bounds');
  });

  it('throws on index equal to length', () => {
    const wt = new WaveletTree3('abc');
    expect(() => wt.access(3)).toThrow('Index out of bounds');
  });

  it('throws on index beyond length', () => {
    const wt = new WaveletTree3('ab');
    expect(() => wt.access(100)).toThrow('Index out of bounds');
  });

  it('handles string with spaces', () => {
    const wt = new WaveletTree3('a b');
    expect(wt.access(0)).toBe('a');
    expect(wt.access(1)).toBe(' ');
    expect(wt.access(2)).toBe('b');
  });
});

// ─── rank ───

describe('WaveletTree3 rank', () => {
  it('counts occurrences of a character', () => {
    const wt = new WaveletTree3('banana');
    expect(wt.rank('a', 6)).toBe(3);
    expect(wt.rank('n', 6)).toBe(2);
    expect(wt.rank('b', 6)).toBe(1);
  });

  it('counts occurrences up to a position', () => {
    const wt = new WaveletTree3('banana');
    expect(wt.rank('a', 3)).toBe(1); // 'ban' has 1 'a'
    expect(wt.rank('a', 4)).toBe(2); // 'bana' has 2 'a'
  });

  it('returns 0 for character not in alphabet', () => {
    const wt = new WaveletTree3('abc');
    expect(wt.rank('z', 3)).toBe(0);
  });

  it('returns 0 when position is 0', () => {
    const wt = new WaveletTree3('abc');
    expect(wt.rank('a', 0)).toBe(0);
  });

  it('returns 0 for negative position', () => {
    const wt = new WaveletTree3('abc');
    expect(wt.rank('a', -1)).toBe(0);
  });

  it('returns 0 when position exceeds length', () => {
    const wt = new WaveletTree3('abc');
    expect(wt.rank('a', 100)).toBe(0);
  });

  it('handles single character string', () => {
    const wt = new WaveletTree3('a');
    expect(wt.rank('a', 1)).toBe(1);
    expect(wt.rank('a', 0)).toBe(0);
  });

  it('handles empty string', () => {
    const wt = new WaveletTree3('');
    expect(wt.rank('a', 0)).toBe(0);
  });

  it('handles all same characters', () => {
    const wt = new WaveletTree3('xxx');
    expect(wt.rank('x', 3)).toBe(3);
    expect(wt.rank('x', 1)).toBe(1);
  });
});

// ─── select ───

describe('WaveletTree3 select', () => {
  it('finds position of first occurrence', () => {
    const wt = new WaveletTree3('banana');
    expect(wt.select('b', 0)).toBe(0);
    expect(wt.select('a', 0)).toBe(1);
    expect(wt.select('n', 0)).toBe(2);
  });

  it('finds position of subsequent occurrences', () => {
    const wt = new WaveletTree3('banana');
    expect(wt.select('a', 1)).toBe(3);
    expect(wt.select('a', 2)).toBe(5);
    expect(wt.select('n', 1)).toBe(4);
  });

  it('returns -1 for character not in alphabet', () => {
    const wt = new WaveletTree3('abc');
    expect(wt.select('z', 0)).toBe(-1);
  });

  it('returns -1 when occurrence exceeds count', () => {
    const wt = new WaveletTree3('abc');
    expect(wt.select('a', 1)).toBe(-1);
  });

  it('throws on negative occurrence', () => {
    const wt = new WaveletTree3('abc');
    expect(() => wt.select('a', -1)).toThrow('Occurrence must be non-negative');
  });

  it('handles single character', () => {
    const wt = new WaveletTree3('z');
    expect(wt.select('z', 0)).toBe(0);
    expect(wt.select('z', 1)).toBe(-1);
  });

  it('handles all same characters', () => {
    const wt = new WaveletTree3('mmm');
    expect(wt.select('m', 0)).toBe(0);
    expect(wt.select('m', 1)).toBe(1);
    expect(wt.select('m', 2)).toBe(2);
    expect(wt.select('m', 3)).toBe(-1);
  });

  it('returns -1 when occurrence exceeds length', () => {
    const wt = new WaveletTree3('ab');
    expect(wt.select('a', 5)).toBe(-1);
  });
});
