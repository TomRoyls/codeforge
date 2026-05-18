import { describe, it, expect } from 'vitest';
import { WaveletMatrix2 } from '../../src/core/wavelet-matrix-2/index.js';

// ─── Constructor ───

describe('WaveletMatrix2 constructor', () => {
  it('constructs from a simple array', () => {
    const wm = new WaveletMatrix2([1, 3, 5, 2, 4]);
    expect(wm.length).toBe(5);
  });

  it('constructs from an empty array', () => {
    const wm = new WaveletMatrix2([]);
    expect(wm.length).toBe(0);
    expect(wm.isEmpty()).toBe(true);
  });

  it('constructs from a single-element array', () => {
    const wm = new WaveletMatrix2([7]);
    expect(wm.length).toBe(1);
    expect(wm.isEmpty()).toBe(false);
  });

  it('accepts explicit bitWidth', () => {
    const wm = new WaveletMatrix2([1, 2, 3], 8);
    expect(wm.length).toBe(3);
  });

  it('handles duplicate values', () => {
    const wm = new WaveletMatrix2([3, 3, 3, 3]);
    expect(wm.length).toBe(4);
  });

  it('handles zeros', () => {
    const wm = new WaveletMatrix2([0, 0, 0]);
    expect(wm.length).toBe(3);
  });
});

// ─── isEmpty / length ───

describe('WaveletMatrix2 isEmpty and length', () => {
  it('isEmpty returns true for empty data', () => {
    const wm = new WaveletMatrix2([]);
    expect(wm.isEmpty()).toBe(true);
    expect(wm.length).toBe(0);
  });

  it('isEmpty returns false for non-empty data', () => {
    const wm = new WaveletMatrix2([1]);
    expect(wm.isEmpty()).toBe(false);
    expect(wm.length).toBe(1);
  });

  it('length returns correct size', () => {
    const wm = new WaveletMatrix2([10, 20, 30, 40, 50]);
    expect(wm.length).toBe(5);
  });
});

// ─── toArray ───

describe('WaveletMatrix2 toArray', () => {
  it('returns the original data', () => {
    const data = [5, 3, 8, 1, 9, 2];
    const wm = new WaveletMatrix2(data);
    expect(wm.toArray()).toEqual(data);
  });

  it('returns empty array for empty input', () => {
    const wm = new WaveletMatrix2([]);
    expect(wm.toArray()).toEqual([]);
  });

  it('returns a copy (not the same reference)', () => {
    const data = [1, 2, 3];
    const wm = new WaveletMatrix2(data);
    const arr = wm.toArray();
    expect(arr).toEqual(data);
    arr.push(999);
    expect(wm.toArray()).toEqual([1, 2, 3]);
  });
});

// ─── access ───

describe('WaveletMatrix2 access', () => {
  it('retrieves each element correctly', () => {
    const data = [3, 1, 4, 1, 5, 9, 2, 6];
    const wm = new WaveletMatrix2(data);
    for (let i = 0; i < data.length; i++) {
      expect(wm.access(i)).toBe(data[i]);
    }
  });

  it('works with single element', () => {
    const wm = new WaveletMatrix2([42]);
    expect(wm.access(0)).toBe(42);
  });

  it('works with duplicate values', () => {
    const data = [5, 5, 5];
    const wm = new WaveletMatrix2(data);
    expect(wm.access(0)).toBe(5);
    expect(wm.access(1)).toBe(5);
    expect(wm.access(2)).toBe(5);
  });

  it('throws on negative index', () => {
    const wm = new WaveletMatrix2([1, 2, 3]);
    expect(() => wm.access(-1)).toThrow('Index out of bounds');
  });

  it('throws on index equal to length', () => {
    const wm = new WaveletMatrix2([1, 2, 3]);
    expect(() => wm.access(3)).toThrow('Index out of bounds');
  });

  it('throws on index beyond length', () => {
    const wm = new WaveletMatrix2([1, 2]);
    expect(() => wm.access(100)).toThrow('Index out of bounds');
  });

  it('handles values with larger bit widths', () => {
    const data = [100, 200, 255];
    const wm = new WaveletMatrix2(data);
    expect(wm.toArray()).toEqual(data);
  });
});

// ─── rank ───

describe('WaveletMatrix2 rank', () => {
  it('counts occurrences of a value from start', () => {
    const data = [1, 3, 1, 5, 1, 3];
    const wm = new WaveletMatrix2(data);
    expect(wm.rank(1, 6)).toBe(3);
    expect(wm.rank(3, 6)).toBe(2);
    expect(wm.rank(5, 6)).toBe(1);
  });

  it('counts occurrences up to a position', () => {
    const data = [1, 2, 3, 1, 2, 3];
    const wm = new WaveletMatrix2(data);
    expect(wm.rank(1, 3)).toBe(1);
    expect(wm.rank(1, 4)).toBe(2);
  });

  it('returns 0 for value not in range', () => {
    const wm = new WaveletMatrix2([1, 2, 3]);
    expect(wm.rank(9, 3)).toBe(0);
  });

  it('returns 0 when end is 0', () => {
    const wm = new WaveletMatrix2([1, 2, 3]);
    expect(wm.rank(1, 0)).toBe(0);
  });

  it('throws on negative end', () => {
    const wm = new WaveletMatrix2([1, 2, 3]);
    expect(() => wm.rank(1, -1)).toThrow('End index out of bounds');
  });

  it('throws on end beyond length', () => {
    const wm = new WaveletMatrix2([1, 2, 3]);
    expect(() => wm.rank(1, 10)).toThrow('End index out of bounds');
  });

  it('handles duplicates correctly', () => {
    const wm = new WaveletMatrix2([7, 7, 7, 7]);
    expect(wm.rank(7, 4)).toBe(4);
    expect(wm.rank(7, 2)).toBe(2);
  });
});

// ─── select ───

describe('WaveletMatrix2 select', () => {
  it('finds the position of k-th occurrence', () => {
    const data = [1, 2, 1, 3, 1];
    const wm = new WaveletMatrix2(data);
    expect(wm.select(1, 0)).toBe(0);
    expect(wm.select(1, 1)).toBe(2);
    expect(wm.select(1, 2)).toBe(4);
  });

  it('finds positions for non-duplicate values', () => {
    const data = [5, 3, 8, 1];
    const wm = new WaveletMatrix2(data);
    expect(wm.select(5, 0)).toBe(0);
    expect(wm.select(3, 0)).toBe(1);
    expect(wm.select(8, 0)).toBe(2);
    expect(wm.select(1, 0)).toBe(3);
  });

  it('returns -1 when k exceeds occurrence count', () => {
    const wm = new WaveletMatrix2([1, 2, 3]);
    expect(wm.select(1, 1)).toBe(-1);
  });

  it('returns -1 for value not in data', () => {
    const wm = new WaveletMatrix2([1, 2, 3]);
    expect(wm.select(9, 0)).toBe(-1);
  });

  it('returns -1 for negative k', () => {
    const wm = new WaveletMatrix2([1, 2, 3]);
    expect(wm.select(1, -1)).toBe(-1);
  });
});

// ─── quantile ───

describe('WaveletMatrix2 quantile', () => {
  it('finds the k-th smallest in range (min)', () => {
    const data = [5, 2, 8, 1, 9];
    const wm = new WaveletMatrix2(data);
    expect(wm.quantile(0, 5, 0)).toBe(1);
  });

  it('finds the k-th smallest in range (max)', () => {
    const data = [5, 2, 8, 1, 9];
    const wm = new WaveletMatrix2(data);
    expect(wm.quantile(0, 5, 4)).toBe(9);
  });

  it('finds the median', () => {
    const data = [5, 2, 8, 1, 9];
    const wm = new WaveletMatrix2(data);
    expect(wm.quantile(0, 5, 2)).toBe(5);
  });

  it('works on a sub-range', () => {
    const data = [10, 3, 7, 1, 5];
    const wm = new WaveletMatrix2(data);
    // sub-range [1..4) = [3, 7, 1], sorted = [1, 3, 7]
    expect(wm.quantile(1, 4, 0)).toBe(1);
    expect(wm.quantile(1, 4, 1)).toBe(3);
    expect(wm.quantile(1, 4, 2)).toBe(7);
  });

  it('throws on invalid range (start >= end)', () => {
    const wm = new WaveletMatrix2([1, 2, 3]);
    expect(() => wm.quantile(2, 2, 0)).toThrow('Invalid range');
    expect(() => wm.quantile(3, 1, 0)).toThrow('Invalid range');
  });

  it('throws on k out of range', () => {
    const wm = new WaveletMatrix2([1, 2, 3]);
    expect(() => wm.quantile(0, 3, 3)).toThrow('k out of range');
    expect(() => wm.quantile(0, 3, -1)).toThrow('k out of range');
  });

  it('throws on range out of bounds', () => {
    const wm = new WaveletMatrix2([1, 2, 3]);
    expect(() => wm.quantile(-1, 2, 0)).toThrow('Invalid range');
    expect(() => wm.quantile(0, 10, 0)).toThrow('Invalid range');
  });
});

// ─── rangeFreq ───

describe('WaveletMatrix2 rangeFreq', () => {
  it('counts values in range', () => {
    const data = [1, 5, 3, 8, 2, 7, 4];
    const wm = new WaveletMatrix2(data);
    expect(wm.rangeFreq(0, 7, 1, 4)).toBe(4); // 1, 3, 2, 4
  });

  it('counts single value', () => {
    const data = [1, 2, 3, 4, 5];
    const wm = new WaveletMatrix2(data);
    expect(wm.rangeFreq(0, 5, 3, 3)).toBe(1);
  });

  it('returns 0 when no values in range', () => {
    const data = [1, 2, 3, 4, 5];
    const wm = new WaveletMatrix2(data);
    expect(wm.rangeFreq(0, 5, 10, 20)).toBe(0);
  });

  it('returns 0 when minValue > maxValue', () => {
    const wm = new WaveletMatrix2([1, 2, 3]);
    expect(wm.rangeFreq(0, 3, 5, 2)).toBe(0);
  });

  it('returns 0 for empty range (start === end)', () => {
    const wm = new WaveletMatrix2([1, 2, 3]);
    expect(wm.rangeFreq(1, 1, 1, 3)).toBe(0);
  });

  it('counts all elements when range covers all values', () => {
    const data = [1, 2, 3, 4, 5];
    const wm = new WaveletMatrix2(data);
    expect(wm.rangeFreq(0, 5, 1, 5)).toBe(5);
  });

  it('throws on invalid range (start > end)', () => {
    const wm = new WaveletMatrix2([1, 2, 3]);
    expect(() => wm.rangeFreq(2, 1, 1, 3)).toThrow('Invalid range');
  });

  it('throws on out-of-bounds range', () => {
    const wm = new WaveletMatrix2([1, 2, 3]);
    expect(() => wm.rangeFreq(-1, 2, 1, 3)).toThrow('Invalid range');
    expect(() => wm.rangeFreq(0, 10, 1, 3)).toThrow('Invalid range');
  });
});
