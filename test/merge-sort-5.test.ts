import { describe, it, expect } from 'vitest';
import { MergeSort5 } from '../src/core/merge-sort-5/index.js';

describe('MergeSort5', () => {
  const ms = new MergeSort5();

  it('sort empty array', () => {
    expect(ms.sort([])).toEqual([]);
  });

  it('sort single element', () => {
    expect(ms.sort([1])).toEqual([1]);
  });

  it('sort already sorted array', () => {
    expect(ms.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
  });

  it('sort reverse sorted array', () => {
    expect(ms.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5]);
  });

  it('sort random array', () => {
    expect(ms.sort([3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5])).toEqual([1, 1, 2, 3, 3, 4, 5, 5, 5, 6, 9]);
  });

  it('sort array with duplicates', () => {
    expect(ms.sort([5, 5, 5, 5, 5])).toEqual([5, 5, 5, 5, 5]);
  });

  it('sort array with negative numbers', () => {
    expect(ms.sort([-3, 5, -1, 0, 2, -4])).toEqual([-4, -3, -1, 0, 2, 5]);
  });

  it('sort array with floating point numbers', () => {
    expect(ms.sort([3.14, 1.5, 2.718, 0.5, 1.0])).toEqual([0.5, 1.0, 1.5, 2.718, 3.14]);
  });

  it('sort large array', () => {
    const arr = Array.from({ length: 10000 }, () => Math.random() * 10000);
    const sorted = ms.sort(arr);
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i]! <= sorted[i + 1]!).toBe(true);
    }
  });

  it('sortInPlace modifies array', () => {
    const arr = [3, 1, 4, 1, 5];
    ms.sortInPlace(arr);
    expect(arr).toEqual([1, 1, 3, 4, 5]);
  });

  it('sortInPlace empty array', () => {
    const arr: number[] = [];
    ms.sortInPlace(arr);
    expect(arr).toEqual([]);
  });

  it('sortInPlace single element', () => {
    const arr = [1];
    ms.sortInPlace(arr);
    expect(arr).toEqual([1]);
  });

  it('sortRange returns sorted subset', () => {
    const arr = [5, 4, 3, 2, 1, 0];
    expect(ms.sortRange(arr, 1, 4)).toEqual([2, 3, 4]);
  });

  it('sortRange empty range', () => {
    const arr = [1, 2, 3];
    expect(ms.sortRange(arr, 2, 2)).toEqual([]);
  });

  it('sortRange full array', () => {
    const arr = [3, 1, 4, 1, 5];
    expect(ms.sortRange(arr, 0, arr.length)).toEqual([1, 1, 3, 4, 5]);
  });

  it('isSorted returns true for sorted array', () => {
    expect(ms.isSorted([1, 2, 3, 4, 5])).toBe(true);
  });

  it('isSorted returns false for unsorted array', () => {
    expect(ms.isSorted([1, 3, 2, 4, 5])).toBe(false);
  });

  it('isSorted returns true for empty array', () => {
    expect(ms.isSorted([])).toBe(true);
  });

  it('isSorted returns true for single element', () => {
    expect(ms.isSorted([1])).toBe(true);
  });

  it('merge two sorted arrays', () => {
    expect(ms.merge([1, 3, 5], [2, 4, 6])).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('merge empty arrays', () => {
    expect(ms.merge([], [])).toEqual([]);
  });

  it('merge with one empty array', () => {
    expect(ms.merge([1, 2, 3], [])).toEqual([1, 2, 3]);
    expect(ms.merge([], [1, 2, 3])).toEqual([1, 2, 3]);
  });

  it('merge arrays with duplicates', () => {
    expect(ms.merge([1, 2, 2], [2, 3, 3])).toEqual([1, 2, 2, 2, 3, 3]);
  });

  it('merge preserves stability', () => {
    const left = [{ val: 1, id: 1 }, { val: 1, id: 2 }];
    const right = [{ val: 1, id: 3 }, { val: 2, id: 4 }];
    const msWithCompare = new MergeSort5((a, b) => a - b);
    const arr: number[] = [1, 1, 1, 2];
    msWithCompare.sort(arr);
    expect(arr).toEqual([1, 1, 1, 2]);
  });

  it('custom comparator descending', () => {
    const descMs = new MergeSort5((a, b) => b - a);
    expect(descMs.sort([1, 2, 3, 4, 5])).toEqual([5, 4, 3, 2, 1]);
  });

  it('custom comparator with sortInPlace', () => {
    const descMs = new MergeSort5((a, b) => b - a);
    const arr = [3, 1, 4, 1, 5];
    descMs.sortInPlace(arr);
    expect(arr).toEqual([5, 4, 3, 1, 1]);
  });

  it('custom comparator with isSorted', () => {
    const descMs = new MergeSort5((a, b) => b - a);
    expect(descMs.isSorted([5, 4, 3, 2, 1])).toBe(true);
    expect(descMs.isSorted([1, 2, 3, 4, 5])).toBe(false);
  });

  it('custom comparator with merge', () => {
    const descMs = new MergeSort5((a, b) => b - a);
    expect(descMs.merge([3, 1], [4, 2])).toEqual([4, 3, 2, 1]);
  });

  it('stable sort preserves order of equal elements', () => {
    const arr = [1, 1, 2, 1, 2];
    const result = ms.sort(arr);
    expect(result).toEqual([1, 1, 1, 2, 2]);
  });

  it('large array sortInPlace', () => {
    const arr = Array.from({ length: 1000 }, () => Math.random() * 1000);
    ms.sortInPlace(arr);
    for (let i = 0; i < arr.length - 1; i++) {
      expect(arr[i]! <= arr[i + 1]!).toBe(true);
    }
  });

  it('empty array sort', () => {
    expect(ms.sort([])).toEqual([]);
  });

  it('single element sort', () => {
    expect(ms.sort([42])).toEqual([42]);
  });

  it('isSorted check', () => {
    expect(ms.isSorted([1, 2, 3])).toBe(true);
    expect(ms.isSorted([3, 1, 2])).toBe(false);
  });

  it('merge two sorted arrays', () => {
    expect(ms.merge([1, 3, 5], [2, 4, 6])).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('handles sortInPlace', () => {
    const arr = [5, 3, 1, 4, 2];
    ms.sortInPlace(arr);
    expect(arr).toEqual([1, 2, 3, 4, 5]);
  });

  it('handles empty array', () => {
    expect(ms.sort([])).toEqual([]);
  });
});
