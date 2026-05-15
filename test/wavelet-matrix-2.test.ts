import { describe, it, expect } from 'vitest';
import { WaveletMatrix2 } from '../src/core/wavelet-matrix-2';

describe('WaveletMatrix2', () => {
  it('should create empty matrix', async () => {
    const wm = new WaveletMatrix2([]);
    expect(wm.length).toBe(0);
    expect(wm.isEmpty()).toBe(true);
    expect(wm.toArray()).toEqual([]);
  });

  it('should create matrix with single element', async () => {
    const wm = new WaveletMatrix2([5]);
    expect(wm.length).toBe(1);
    expect(wm.isEmpty()).toBe(false);
    expect(wm.toArray()).toEqual([5]);
  });

  it('should create matrix with multiple elements', async () => {
    const data = [3, 1, 4, 1, 5, 9, 2, 6];
    const wm = new WaveletMatrix2(data);
    expect(wm.length).toBe(8);
    expect(wm.isEmpty()).toBe(false);
    expect(wm.toArray()).toEqual(data);
  });

  it('should access elements correctly', async () => {
    const data = [3, 1, 4, 1, 5, 9, 2, 6];
    const wm = new WaveletMatrix2(data);

    expect(wm.access(0)).toBe(3);
    expect(wm.access(1)).toBe(1);
    expect(wm.access(2)).toBe(4);
    expect(wm.access(3)).toBe(1);
    expect(wm.access(4)).toBe(5);
    expect(wm.access(5)).toBe(9);
    expect(wm.access(6)).toBe(2);
    expect(wm.access(7)).toBe(6);
  });

  it('should throw error for invalid access index', async () => {
    const wm = new WaveletMatrix2([1, 2, 3]);
    expect(() => wm.access(-1)).toThrow('Index out of bounds');
    expect(() => wm.access(3)).toThrow('Index out of bounds');
  });

  it('should rank elements correctly', async () => {
    const data = [3, 1, 4, 1, 5, 9, 2, 6];
    const wm = new WaveletMatrix2(data);

    expect(wm.rank(1, 0)).toBe(0);
    expect(wm.rank(1, 1)).toBe(0);
    expect(wm.rank(1, 2)).toBe(1);
    expect(wm.rank(1, 3)).toBe(1);
    expect(wm.rank(1, 4)).toBe(2);
    expect(wm.rank(1, 8)).toBe(2);

    expect(wm.rank(5, 5)).toBe(1);
    expect(wm.rank(5, 8)).toBe(1);

    expect(wm.rank(9, 5)).toBe(0);
    expect(wm.rank(9, 6)).toBe(1);
    expect(wm.rank(9, 8)).toBe(1);
  });

  it('should handle rank with element not in sequence', async () => {
    const data = [3, 1, 4, 1, 5];
    const wm = new WaveletMatrix2(data);

    expect(wm.rank(7, 5)).toBe(0);
    expect(wm.rank(0, 5)).toBe(0);
  });

  it('should select elements correctly', async () => {
    const data = [3, 1, 4, 1, 5, 9, 2, 6];
    const wm = new WaveletMatrix2(data);

    expect(wm.select(1, 0)).toBe(1);
    expect(wm.select(1, 1)).toBe(3);
    expect(wm.select(1, 2)).toBe(-1);

    expect(wm.select(3, 0)).toBe(0);
    expect(wm.select(3, 1)).toBe(-1);

    expect(wm.select(9, 0)).toBe(5);
    expect(wm.select(9, 1)).toBe(-1);
  });

  it('should return -1 for select with element not in sequence', async () => {
    const data = [3, 1, 4, 1, 5];
    const wm = new WaveletMatrix2(data);

    expect(wm.select(7, 0)).toBe(-1);
    expect(wm.select(0, 0)).toBe(-1);
  });

  it('should return -1 for select with negative k', async () => {
    const data = [3, 1, 4, 1, 5];
    const wm = new WaveletMatrix2(data);

    expect(wm.select(1, -1)).toBe(-1);
  });

  it('should handle quantile correctly', async () => {
    const data = [3, 1, 4, 1, 5, 9, 2, 6];
    const wm = new WaveletMatrix2(data);

    expect(wm.quantile(0, 8, 0)).toBe(1);
    expect(wm.quantile(0, 8, 1)).toBe(1);
    expect(wm.quantile(0, 8, 2)).toBe(2);
    expect(wm.quantile(0, 8, 3)).toBe(3);
    expect(wm.quantile(0, 8, 4)).toBe(4);
    expect(wm.quantile(0, 8, 5)).toBe(5);
    expect(wm.quantile(0, 8, 6)).toBe(6);
    expect(wm.quantile(0, 8, 7)).toBe(9);

    expect(wm.quantile(2, 6, 0)).toBe(1);
    expect(wm.quantile(2, 6, 1)).toBe(4);
    expect(wm.quantile(2, 6, 2)).toBe(5);
    expect(wm.quantile(2, 6, 3)).toBe(9);
  });

  it('should throw error for quantile with invalid range', async () => {
    const wm = new WaveletMatrix2([1, 2, 3, 4, 5]);

    expect(() => wm.quantile(-1, 3, 0)).toThrow('Invalid range');
    expect(() => wm.quantile(0, 6, 0)).toThrow('Invalid range');
    expect(() => wm.quantile(3, 2, 0)).toThrow('Invalid range');
  });

  it('should throw error for quantile with k out of range', async () => {
    const wm = new WaveletMatrix2([1, 2, 3, 4, 5]);

    expect(() => wm.quantile(0, 3, -1)).toThrow('k out of range');
    expect(() => wm.quantile(0, 3, 3)).toThrow('k out of range');
  });

  it('should handle range frequency correctly', async () => {
    const data = [3, 1, 4, 1, 5, 9, 2, 6];
    const wm = new WaveletMatrix2(data);

    expect(wm.rangeFreq(0, 8, 1, 5)).toBe(6);
    expect(wm.rangeFreq(0, 8, 2, 6)).toBe(5);
    expect(wm.rangeFreq(0, 8, 5, 10)).toBe(3);
    expect(wm.rangeFreq(2, 6, 1, 6)).toBe(3);
    expect(wm.rangeFreq(0, 4, 3, 4)).toBe(2);
  });

  it('should handle range frequency with no matches', async () => {
    const data = [3, 1, 4, 1, 5];
    const wm = new WaveletMatrix2(data);

    expect(wm.rangeFreq(0, 5, 10, 20)).toBe(0);
    expect(wm.rangeFreq(0, 5, 6, 7)).toBe(0);
  });

  it('should handle range frequency with inverted range', async () => {
    const data = [3, 1, 4, 1, 5];
    const wm = new WaveletMatrix2(data);

    expect(wm.rangeFreq(0, 5, 5, 1)).toBe(0);
  });

  it('should throw error for range frequency with invalid range', async () => {
    const wm = new WaveletMatrix2([1, 2, 3, 4, 5]);

    expect(() => wm.rangeFreq(-1, 3, 0, 10)).toThrow('Invalid range');
    expect(() => wm.rangeFreq(0, 6, 0, 10)).toThrow('Invalid range');
  });

  it('should handle small sequences', async () => {
    const wm = new WaveletMatrix2([1]);
    expect(wm.access(0)).toBe(1);
    expect(wm.rank(1, 1)).toBe(1);
    expect(wm.select(1, 0)).toBe(0);
    expect(wm.quantile(0, 1, 0)).toBe(1);
    expect(wm.rangeFreq(0, 1, 1, 2)).toBe(1);
  });

  it('should handle various value ranges', async () => {
    const data = [0, 255, 128, 64, 1, 254, 127, 63];
    const wm = new WaveletMatrix2(data);

    expect(wm.length).toBe(8);
    expect(wm.access(0)).toBe(0);
    expect(wm.access(1)).toBe(255);
    expect(wm.access(2)).toBe(128);

    expect(wm.rank(0, 1)).toBe(1);
    expect(wm.rank(255, 2)).toBe(1);

    expect(wm.select(0, 0)).toBe(0);
    expect(wm.select(255, 0)).toBe(1);

    expect(wm.quantile(0, 8, 0)).toBe(0);
    expect(wm.quantile(0, 8, 7)).toBe(255);
  });

  it('should handle duplicate elements', async () => {
    const data = [5, 5, 5, 5];
    const wm = new WaveletMatrix2(data);

    expect(wm.length).toBe(4);
    expect(wm.access(0)).toBe(5);
    expect(wm.access(1)).toBe(5);
    expect(wm.access(2)).toBe(5);
    expect(wm.access(3)).toBe(5);

    expect(wm.rank(5, 0)).toBe(0);
    expect(wm.rank(5, 1)).toBe(1);
    expect(wm.rank(5, 2)).toBe(2);
    expect(wm.rank(5, 3)).toBe(3);
    expect(wm.rank(5, 4)).toBe(4);

    expect(wm.select(5, 0)).toBe(0);
    expect(wm.select(5, 1)).toBe(1);
    expect(wm.select(5, 2)).toBe(2);
    expect(wm.select(5, 3)).toBe(3);
    expect(wm.select(5, 4)).toBe(-1);
  });

  it('should handle sequence with zeros', async () => {
    const data = [0, 1, 0, 2, 0, 3];
    const wm = new WaveletMatrix2(data);

    expect(wm.rank(0, 0)).toBe(0);
    expect(wm.rank(0, 1)).toBe(1);
    expect(wm.rank(0, 2)).toBe(1);
    expect(wm.rank(0, 3)).toBe(2);
    expect(wm.rank(0, 6)).toBe(3);

    expect(wm.select(0, 0)).toBe(0);
    expect(wm.select(0, 1)).toBe(2);
    expect(wm.select(0, 2)).toBe(4);
    expect(wm.select(0, 3)).toBe(-1);
  });

  it('should handle auto-detect bit width', async () => {
    const data = [1, 2, 3, 4];
    const wm = new WaveletMatrix2(data);

    expect(wm.length).toBe(4);
    expect(wm.access(0)).toBe(1);
    expect(wm.access(1)).toBe(2);
    expect(wm.access(2)).toBe(3);
    expect(wm.access(3)).toBe(4);
  });

  it('should use specified bit width', async () => {
    const data = [1, 2, 3, 4];
    const wm = new WaveletMatrix2(data, 8);

    expect(wm.length).toBe(4);
    expect(wm.access(0)).toBe(1);
    expect(wm.access(1)).toBe(2);
    expect(wm.access(2)).toBe(3);
    expect(wm.access(3)).toBe(4);
  });

  it('should return correct length and isEmpty', async () => {
    const wmEmpty = new WaveletMatrix2([]);
    expect(wmEmpty.length).toBe(0);
    expect(wmEmpty.isEmpty()).toBe(true);

    const wmSingle = new WaveletMatrix2([42]);
    expect(wmSingle.length).toBe(1);
    expect(wmSingle.isEmpty()).toBe(false);

    const wmMultiple = new WaveletMatrix2([1, 2, 3, 4, 5]);
    expect(wmMultiple.length).toBe(5);
    expect(wmMultiple.isEmpty()).toBe(false);
  });

  it('should preserve original data order in toArray', async () => {
    const data = [9, 2, 5, 1, 7, 3, 8, 4, 6, 0];
    const wm = new WaveletMatrix2(data);
    expect(wm.toArray()).toEqual(data);
  });

  it('should handle negative rank end index', async () => {
    const wm = new WaveletMatrix2([1, 2, 3]);
    expect(wm.rank(1, 0)).toBe(0);
  });

  it('should handle rank with end equal to length', async () => {
    const data = [1, 2, 3, 4, 5];
    const wm = new WaveletMatrix2(data);
    expect(wm.rank(3, 5)).toBe(1);
  });

  it('should handle select', async () => {
    const data = [3, 1, 4, 1, 5];
    const wm = new WaveletMatrix2(data);
    expect(wm.select(1, 0)).toBe(1);
    expect(wm.select(1, 1)).toBe(3);
  });

  it('should handle quantile', async () => {
    const data = [5, 2, 8, 1, 9];
    const wm = new WaveletMatrix2(data);
    const q = wm.quantile(0, 5, 0);
    expect(q).toBe(1);
  });

  it('should handle rangeFreq', async () => {
    const data = [1, 2, 3, 4, 5];
    const wm = new WaveletMatrix2(data);
    expect(wm.rangeFreq(0, 5, 2, 4)).toBe(3);
  });

  it('should handle access on each index', async () => {
    const data = [10, 20, 30];
    const wm = new WaveletMatrix2(data);
    expect(wm.access(0)).toBe(10);
    expect(wm.access(1)).toBe(20);
    expect(wm.access(2)).toBe(30);
  });

  it('should handle rank', async () => {
    const data = [1, 2, 1, 3, 1];
    const wm = new WaveletMatrix2(data);
    expect(wm.rank(1, 5)).toBe(3);
    expect(wm.rank(2, 5)).toBe(1);
  });

  it('should handle select', async () => {
    const data = [1, 2, 1, 2, 1];
    const wm = new WaveletMatrix2(data);
    expect(wm.select(1, 0)).toBe(0);
    expect(wm.select(1, 1)).toBe(2);
  });

  it('should handle isEmpty', async () => {
    const data = [1, 2, 3];
    const wm = new WaveletMatrix2(data);
    expect(wm.isEmpty()).toBe(false);
    expect(wm.length).toBe(3);
  });

  it('should handle toArray', async () => {
    const data = [3, 1, 4, 1, 5];
    const wm = new WaveletMatrix2(data);
    expect(wm.toArray()).toEqual([3, 1, 4, 1, 5]);
  });

  it('should handle quantile', async () => {
    const data = [5, 3, 1, 4, 2];
    const wm = new WaveletMatrix2(data);
    expect(wm.quantile(0, 5, 0)).toBe(1);
    expect(wm.quantile(0, 5, 4)).toBe(5);
  });

  it('should handle access', async () => {
    const data = [10, 20, 30];
    const wm = new WaveletMatrix2(data);
    expect(wm.access(0)).toBe(10);
    expect(wm.access(1)).toBe(20);
    expect(wm.access(2)).toBe(30);
  });
});
