import { describe, it, expect } from 'vitest';
import { WaveletTree } from '../../src/utils/wavelet-tree.js';

describe('WaveletTree', () => {
  it('handles empty data', () => {
    const wt = new WaveletTree([]);
    expect(wt.length).toBe(0);
    expect(wt.alphabet).toEqual([]);
    expect(wt.rank(1, 0)).toBe(0);
    expect(wt.rangeCountAll(0, 0)).toEqual(new Map());
  });

  it('handles single element', () => {
    const wt = new WaveletTree([5]);
    expect(wt.length).toBe(1);
    expect(wt.alphabet).toEqual([5]);
    expect(wt.access(0)).toBe(5);
    expect(wt.rank(5, 1)).toBe(1);
    expect(wt.select(5, 1)).toBe(0);
  });

  it('accesses all elements correctly', () => {
    const data = [3, 1, 4, 1, 5, 9, 2, 6];
    const wt = new WaveletTree(data);
    for (let i = 0; i < data.length; i++) {
      expect(wt.access(i)).toBe(data[i]!);
    }
  });

  it('computes rank queries', () => {
    const wt = new WaveletTree([1, 2, 1, 3, 1, 2, 1]);
    expect(wt.rank(1, 7)).toBe(4);
    expect(wt.rank(2, 7)).toBe(2);
    expect(wt.rank(3, 7)).toBe(1);
    expect(wt.rank(1, 3)).toBe(2);
    expect(wt.rank(2, 5)).toBe(1);
    expect(wt.rank(4, 7)).toBe(0);
  });

  it('computes select queries', () => {
    const wt = new WaveletTree([1, 2, 1, 3, 1, 2, 1]);
    expect(wt.select(1, 1)).toBe(0);
    expect(wt.select(1, 2)).toBe(2);
    expect(wt.select(1, 3)).toBe(4);
    expect(wt.select(1, 4)).toBe(6);
    expect(wt.select(2, 1)).toBe(1);
    expect(wt.select(2, 2)).toBe(5);
    expect(wt.select(3, 1)).toBe(3);
  });

  it('computes range count', () => {
    const wt = new WaveletTree([1, 2, 1, 3, 1, 2, 1]);
    expect(wt.rangeCount(0, 7, 1)).toBe(4);
    expect(wt.rangeCount(2, 5, 1)).toBe(2);
    expect(wt.rangeCount(1, 4, 2)).toBe(1);
    expect(wt.rangeCount(3, 6, 3)).toBe(1);
    expect(wt.rangeCount(0, 3, 3)).toBe(0);
  });

  it('computes range count all', () => {
    const wt = new WaveletTree([1, 2, 1, 3, 1, 2, 1]);
    const result = wt.rangeCountAll(1, 5);
    expect(result.get(1)).toBe(2);
    expect(result.get(2)).toBe(1);
    expect(result.get(3)).toBe(1);
  });

  it('reports length and alphabet', () => {
    const data = [5, 3, 5, 2, 3, 1];
    const wt = new WaveletTree(data);
    expect(wt.length).toBe(6);
    expect(wt.alphabet).toEqual([1, 2, 3, 5]);
  });

  it('handles multiple symbols', () => {
    const data = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    const wt = new WaveletTree(data);
    for (let i = 0; i < data.length; i++) {
      expect(wt.access(i)).toBe(data[i]!);
    }
    for (const sym of data) {
      expect(wt.rank(sym, data.length)).toBe(1);
      expect(wt.select(sym, 1)).toBe(data.indexOf(sym));
    }
  });

  it('handles large data', () => {
    const data: number[] = [];
    for (let i = 0; i < 150; i++) {
      data.push(i % 7);
    }
    const wt = new WaveletTree(data);
    expect(wt.length).toBe(150);
    expect(wt.alphabet).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(wt.rank(0, 150)).toBe(22);
    expect(wt.rank(6, 150)).toBe(21);
    expect(wt.access(74)).toBe(4);
    expect(wt.access(149)).toBe(2);
  });

  it('select returns -1 for non-existent occurrence', () => {
    const wt = new WaveletTree([1, 2, 1, 3]);
    expect(wt.select(1, 5)).toBe(-1);
    expect(wt.select(2, 3)).toBe(-1);
    expect(wt.select(4, 1)).toBe(-1);
    expect(wt.select(3, 2)).toBe(-1);
  });

  it('handles binary alphabet', () => {
    const wt = new WaveletTree([0, 1, 0, 1, 0, 1, 1, 0, 0, 1]);
    expect(wt.alphabet).toEqual([0, 1]);
    expect(wt.length).toBe(10);
    expect(wt.rank(0, 10)).toBe(5);
    expect(wt.rank(1, 10)).toBe(5);
    expect(wt.select(0, 1)).toBe(0);
    expect(wt.select(0, 3)).toBe(4);
    expect(wt.select(1, 2)).toBe(3);
    expect(wt.rangeCount(0, 5, 0)).toBe(3);
    expect(wt.rangeCount(0, 5, 1)).toBe(2);
  });

  it('works with provided alphabet', () => {
    const wt = new WaveletTree([5, 3, 1, 5, 3], [1, 3, 5, 7]);
    expect(wt.alphabet).toEqual([1, 3, 5, 7]);
    expect(wt.access(0)).toBe(5);
    expect(wt.rank(5, 5)).toBe(2);
  });

  it('select returns -1 for empty tree', () => {
    const wt = new WaveletTree([]);
    expect(wt.select(1, 1)).toBe(-1);
  });

  it('rank returns 0 for empty tree', () => {
    const wt = new WaveletTree([]);
    expect(wt.rank(1, 0)).toBe(0);
  });

  it('rangeCount for single element', () => {
    const wt = new WaveletTree([5]);
    expect(wt.rangeCount(0, 1, 5)).toBe(1);
    expect(wt.rangeCount(0, 1, 3)).toBe(0);
  });

  it('access on single element', () => {
    const wt = new WaveletTree([42]);
    expect(wt.access(0)).toBe(42);
  });

  it('rank of absent element is 0', () => {
    const wt = new WaveletTree([1, 2, 3, 1, 2]);
    expect(wt.rank(5, 5)).toBe(0);
  });

  it('access returns element at index', () => {
    const wt = new WaveletTree([1, 2, 3, 1, 2]);
    expect(wt.access(0)).toBe(1);
    expect(wt.access(2)).toBe(3);
  });

  it('rank counts occurrences', () => {
    const wt = new WaveletTree([1, 2, 1, 2, 1]);
    expect(wt.rank(1, 5)).toBe(3);
  });
});
