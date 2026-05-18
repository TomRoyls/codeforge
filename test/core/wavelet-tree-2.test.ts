import { describe, it, expect } from 'vitest';
import { WaveletTree } from '../../src/core/wavelet-tree-2/index.js';

// ─── Constructor ───

describe('WaveletTree constructor', () => {
  it('constructs from a simple array', () => {
    const wt = new WaveletTree([1, 3, 5, 2, 4]);
    expect(wt.getSize()).toBe(5);
  });

  it('constructs from a single-element array', () => {
    const wt = new WaveletTree([7]);
    expect(wt.getSize()).toBe(1);
  });

  it('constructs from an array of identical values', () => {
    const wt = new WaveletTree([4, 4, 4]);
    expect(wt.getSize()).toBe(3);
  });

  it('throws on empty array', () => {
    expect(() => new WaveletTree([])).toThrow('Array cannot be empty');
  });

  it('handles negative numbers', () => {
    const wt = new WaveletTree([-2, 0, 3, -5, 1]);
    expect(wt.getSize()).toBe(5);
  });

  it('handles large value range', () => {
    const wt = new WaveletTree([1, 100, 50, 25]);
    expect(wt.getSize()).toBe(4);
  });
});

// ─── getSize ───

describe('WaveletTree getSize', () => {
  it('returns correct size', () => {
    const wt = new WaveletTree([10, 20, 30]);
    expect(wt.getSize()).toBe(3);
  });

  it('returns 1 for single element', () => {
    const wt = new WaveletTree([42]);
    expect(wt.getSize()).toBe(1);
  });
});

// ─── toArray ───

describe('WaveletTree toArray', () => {
  it('reconstructs the original array', () => {
    const data = [5, 3, 8, 1, 9, 2];
    const wt = new WaveletTree(data);
    expect(wt.toArray()).toEqual(data);
  });

  it('handles single element', () => {
    const wt = new WaveletTree([7]);
    expect(wt.toArray()).toEqual([7]);
  });

  it('handles duplicates', () => {
    const data = [3, 1, 3, 1, 3];
    const wt = new WaveletTree(data);
    expect(wt.toArray()).toEqual(data);
  });

  it('handles negative values', () => {
    const data = [-3, 0, 5, -1, 2];
    const wt = new WaveletTree(data);
    expect(wt.toArray()).toEqual(data);
  });
});

// ─── access ───

describe('WaveletTree access', () => {
  it('retrieves each element correctly', () => {
    const data = [3, 1, 4, 1, 5, 9, 2, 6];
    const wt = new WaveletTree(data);
    for (let i = 0; i < data.length; i++) {
      expect(wt.access(i)).toBe(data[i]);
    }
  });

  it('returns single element at index 0', () => {
    const wt = new WaveletTree([99]);
    expect(wt.access(0)).toBe(99);
  });

  it('handles identical elements', () => {
    const wt = new WaveletTree([5, 5, 5]);
    expect(wt.access(0)).toBe(5);
    expect(wt.access(1)).toBe(5);
    expect(wt.access(2)).toBe(5);
  });

  it('handles negative numbers', () => {
    const data = [-5, -3, -1, 0, 2];
    const wt = new WaveletTree(data);
    for (let i = 0; i < data.length; i++) {
      expect(wt.access(i)).toBe(data[i]);
    }
  });
});

// ─── rank ───

describe('WaveletTree rank', () => {
  it('counts occurrences from start', () => {
    const data = [1, 3, 1, 5, 1, 3];
    const wt = new WaveletTree(data);
    expect(wt.rank(1, 6)).toBe(3);
    expect(wt.rank(3, 6)).toBe(2);
    expect(wt.rank(5, 6)).toBe(1);
  });

  it('counts occurrences up to a position', () => {
    const data = [1, 2, 3, 1, 2, 3];
    const wt = new WaveletTree(data);
    expect(wt.rank(1, 3)).toBe(1);
    expect(wt.rank(1, 4)).toBe(2);
  });

  it('returns 0 for value outside tree range', () => {
    const wt = new WaveletTree([1, 2, 3]);
    expect(wt.rank(9, 3)).toBe(0);
  });

  it('returns 0 when position is 0', () => {
    const wt = new WaveletTree([1, 2, 3]);
    expect(wt.rank(1, 0)).toBe(0);
  });

  it('handles single element', () => {
    const wt = new WaveletTree([7]);
    expect(wt.rank(7, 1)).toBe(1);
    expect(wt.rank(7, 0)).toBe(0);
  });

  it('handles duplicate values', () => {
    const wt = new WaveletTree([4, 4, 4, 4]);
    expect(wt.rank(4, 4)).toBe(4);
    expect(wt.rank(4, 2)).toBe(2);
  });

  it('handles negative values', () => {
    const wt = new WaveletTree([-2, 0, 3, -2, 5]);
    expect(wt.rank(-2, 5)).toBe(2);
    expect(wt.rank(-2, 2)).toBe(1);
  });
});

// ─── rangeCount ───

describe('WaveletTree rangeCount', () => {
  it('counts value in sub-range', () => {
    const data = [1, 2, 1, 3, 1, 2];
    const wt = new WaveletTree(data);
    expect(wt.rangeCount(1, 0, 6)).toBe(3);
    expect(wt.rangeCount(1, 2, 5)).toBe(2);
    expect(wt.rangeCount(1, 0, 2)).toBe(1);
  });

  it('returns 0 when value not in range', () => {
    const wt = new WaveletTree([1, 2, 3]);
    expect(wt.rangeCount(9, 0, 3)).toBe(0);
  });

  it('returns 0 for empty range', () => {
    const wt = new WaveletTree([1, 2, 3]);
    expect(wt.rangeCount(1, 2, 2)).toBe(0);
  });

  it('throws when start > end', () => {
    const wt = new WaveletTree([1, 2, 3]);
    expect(() => wt.rangeCount(1, 3, 1)).toThrow('Start must be <= end');
  });

  it('throws on out-of-bounds start', () => {
    const wt = new WaveletTree([1, 2, 3]);
    expect(() => wt.rangeCount(1, -1, 2)).toThrow('Range out of bounds');
  });

  it('throws on out-of-bounds end', () => {
    const wt = new WaveletTree([1, 2, 3]);
    expect(() => wt.rangeCount(1, 0, 10)).toThrow('Range out of bounds');
  });
});

// ─── kthSmallest ───

describe('WaveletTree kthSmallest', () => {
  it('finds the minimum (k=1)', () => {
    const data = [5, 2, 8, 1, 9];
    const wt = new WaveletTree(data);
    expect(wt.kthSmallest(1, 0, 5)).toBe(1);
  });

  it('finds the maximum', () => {
    const data = [5, 2, 8, 1, 9];
    const wt = new WaveletTree(data);
    expect(wt.kthSmallest(5, 0, 5)).toBe(9);
  });

  it('finds the median', () => {
    const data = [5, 2, 8, 1, 9];
    const wt = new WaveletTree(data);
    expect(wt.kthSmallest(3, 0, 5)).toBe(5);
  });

  it('finds kth smallest in a sub-range', () => {
    const data = [10, 3, 7, 1, 5];
    const wt = new WaveletTree(data);
    // range [1, 4) = [3, 7, 1], sorted = [1, 3, 7]
    expect(wt.kthSmallest(1, 1, 4)).toBe(1);
    expect(wt.kthSmallest(2, 1, 4)).toBe(3);
    expect(wt.kthSmallest(3, 1, 4)).toBe(7);
  });

  it('throws on k out of range (k <= 0)', () => {
    const wt = new WaveletTree([1, 2, 3]);
    expect(() => wt.kthSmallest(0, 0, 3)).toThrow('k out of range');
  });

  it('throws on k out of range (k > range length)', () => {
    const wt = new WaveletTree([1, 2, 3]);
    expect(() => wt.kthSmallest(4, 0, 3)).toThrow('k out of range');
  });

  it('throws on range out of bounds', () => {
    const wt = new WaveletTree([1, 2, 3]);
    expect(() => wt.kthSmallest(1, -1, 2)).toThrow('Range out of bounds');
    expect(() => wt.kthSmallest(1, 0, 10)).toThrow('Range out of bounds');
  });

  it('handles duplicates', () => {
    const data = [3, 1, 3, 1, 3];
    const wt = new WaveletTree(data);
    expect(wt.kthSmallest(1, 0, 5)).toBe(1);
    expect(wt.kthSmallest(5, 0, 5)).toBe(3);
  });

  it('handles negative values', () => {
    const data = [-3, 0, -1, 5, 2];
    const wt = new WaveletTree(data);
    expect(wt.kthSmallest(1, 0, 5)).toBe(-3);
    expect(wt.kthSmallest(5, 0, 5)).toBe(5);
  });
});

// ─── getTimeComplexity ───

describe('WaveletTree getTimeComplexity', () => {
  it('returns a non-empty string', () => {
    const wt = new WaveletTree([1, 2, 3]);
    const tc = wt.getTimeComplexity();
    expect(typeof tc).toBe('string');
    expect(tc.length).toBeGreaterThan(0);
  });
});
