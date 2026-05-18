import { describe, it, expect } from 'vitest';
import { FMIndex2 } from '../../src/core/fm-index-2/index.js';

// ─── Constructor ───

describe('FMIndex2 constructor', () => {
  it('creates instance with a string', () => {
    const fm = new FMIndex2('banana');
    expect(fm).toBeInstanceOf(FMIndex2);
  });

  it('creates instance with empty string', () => {
    const fm = new FMIndex2('');
    expect(fm).toBeInstanceOf(FMIndex2);
  });

  it('creates instance with single character', () => {
    const fm = new FMIndex2('a');
    expect(fm).toBeInstanceOf(FMIndex2);
  });
});

// ─── search() ───

describe('FMIndex2.search', () => {
  it('finds existing pattern', () => {
    const fm = new FMIndex2('banana');
    const result = fm.search('ana');
    expect(result.length).toBe(2);
    expect(result[0]!).toBeLessThanOrEqual(result[1]!);
  });

  it('returns empty array for pattern not found', () => {
    const fm = new FMIndex2('banana');
    expect(fm.search('xyz')).toEqual([]);
  });

  it('finds single character pattern', () => {
    const fm = new FMIndex2('banana');
    const result = fm.search('b');
    expect(result.length).toBe(2);
    expect(result[0]!).toBeLessThanOrEqual(result[1]!);
  });

  it('finds pattern at beginning of text', () => {
    const fm = new FMIndex2('banana');
    const result = fm.search('ban');
    expect(result.length).toBe(2);
    expect(result[0]!).toBeLessThanOrEqual(result[1]!);
  });

  it('finds pattern at end of text', () => {
    const fm = new FMIndex2('banana');
    const result = fm.search('na');
    expect(result.length).toBe(2);
    expect(result[0]!).toBeLessThanOrEqual(result[1]!);
  });

  it('returns full range for empty pattern', () => {
    const fm = new FMIndex2('banana');
    const result = fm.search('');
    expect(result.length).toBe(2);
    expect(result[0]!).toBe(0);
    expect(result[1]!).toBeGreaterThan(0);
  });
});

// ─── count() ───

describe('FMIndex2.count', () => {
  it('counts occurrences of a pattern', () => {
    const fm = new FMIndex2('banana');
    expect(fm.count('ana')).toBe(2);
  });

  it('counts single character occurrences', () => {
    const fm = new FMIndex2('banana');
    expect(fm.count('a')).toBe(3);
    expect(fm.count('b')).toBe(1);
    expect(fm.count('n')).toBe(2);
  });

  it('returns 0 for pattern not found', () => {
    const fm = new FMIndex2('banana');
    expect(fm.count('xyz')).toBe(0);
  });

  it('counts the entire text as a pattern', () => {
    const fm = new FMIndex2('abc');
    expect(fm.count('abc')).toBe(1);
  });

  it('handles overlapping patterns', () => {
    const fm = new FMIndex2('aaaa');
    expect(fm.count('aa')).toBeGreaterThanOrEqual(1);
  });
});

// ─── locate() ───

describe('FMIndex2.locate', () => {
  it('locates positions of a pattern', () => {
    const fm = new FMIndex2('banana');
    const positions = fm.locate('ana');
    expect(positions.length).toBe(2);
    for (const pos of positions) {
      expect(pos).toBeGreaterThanOrEqual(0);
      expect(pos).toBeLessThan(6);
    }
  });

  it('returns empty array for pattern not found', () => {
    const fm = new FMIndex2('banana');
    expect(fm.locate('xyz')).toEqual([]);
  });

  it('locates all positions sorted', () => {
    const fm = new FMIndex2('banana');
    const positions = fm.locate('a');
    expect(positions.length).toBe(3);
    for (let i = 1; i < positions.length; i++) {
      expect(positions[i]!).toBeGreaterThan(positions[i - 1]!);
    }
  });

  it('locates returns correct count of matches', () => {
    const fm = new FMIndex2('banana');
    const positions = fm.locate('ana');
    expect(positions.length).toBe(fm.count('ana'));
  });
});

// ─── has() ───

describe('FMIndex2.has', () => {
  it('returns true for existing pattern', () => {
    const fm = new FMIndex2('banana');
    expect(fm.has('ana')).toBe(true);
    expect(fm.has('ban')).toBe(true);
  });

  it('returns false for pattern not found', () => {
    const fm = new FMIndex2('banana');
    expect(fm.has('xyz')).toBe(false);
  });

  it('returns true for single character', () => {
    const fm = new FMIndex2('abc');
    expect(fm.has('a')).toBe(true);
    expect(fm.has('b')).toBe(true);
    expect(fm.has('c')).toBe(true);
  });

  it('returns false for empty text', () => {
    const fm = new FMIndex2('');
    expect(fm.has('a')).toBe(false);
  });
});

// ─── length ───

describe('FMIndex2.length', () => {
  it('returns the length of original text', () => {
    const fm = new FMIndex2('banana');
    expect(fm.length).toBe(6);
  });

  it('returns 0 for empty string', () => {
    const fm = new FMIndex2('');
    expect(fm.length).toBe(0);
  });

  it('returns 1 for single character', () => {
    const fm = new FMIndex2('a');
    expect(fm.length).toBe(1);
  });
});

// ─── Edge Cases ───

describe('FMIndex2 edge cases', () => {
  it('handles repeated characters', () => {
    const fm = new FMIndex2('aaaa');
    expect(fm.count('a')).toBe(4);
    expect(fm.has('aa')).toBe(true);
  });

  it('handles text with special characters', () => {
    const fm = new FMIndex2('ab cd');
    expect(fm.has(' ')).toBe(true);
    expect(fm.count(' ')).toBe(1);
  });

  it('handles longer text', () => {
    const text = 'the quick brown fox jumps over the lazy dog';
    const fm = new FMIndex2(text);
    expect(fm.count('the')).toBe(2);
    expect(fm.has('fox')).toBe(true);
    expect(fm.has('cat')).toBe(false);
  });
});
