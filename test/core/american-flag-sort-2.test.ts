import { describe, it, expect } from 'vitest';
import { AmericanFlagSort2 } from '../../src/core/american-flag-sort-2/index.js';

// ─── Constructor ───

describe('AmericanFlagSort2 constructor', () => {
  it('creates instance with default comparator', () => {
    const sorter = new AmericanFlagSort2();
    expect(sorter).toBeInstanceOf(AmericanFlagSort2);
  });

  it('creates instance with custom comparator', () => {
    const sorter = new AmericanFlagSort2((a, b) => b - a);
    expect(sorter).toBeInstanceOf(AmericanFlagSort2);
  });
});

// ─── sort() ───

describe('AmericanFlagSort2 sort', () => {
  it('returns a new sorted array without mutating original', () => {
    const sorter = new AmericanFlagSort2();
    const arr = [3, 1, 2];
    const sorted = sorter.sort(arr);
    expect(sorted).toEqual([1, 2, 3]);
    expect(arr).toEqual([3, 1, 2]);
  });

  it('sorts empty array', () => {
    const sorter = new AmericanFlagSort2();
    expect(sorter.sort([])).toEqual([]);
  });

  it('sorts single element array', () => {
    const sorter = new AmericanFlagSort2();
    expect(sorter.sort([5])).toEqual([5]);
  });

  it('sorts already sorted array', () => {
    const sorter = new AmericanFlagSort2();
    expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
  });

  it('sorts reverse sorted array', () => {
    const sorter = new AmericanFlagSort2();
    expect(sorter.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5]);
  });

  it('sorts array with duplicates', () => {
    const sorter = new AmericanFlagSort2();
    expect(sorter.sort([3, 1, 2, 1, 3])).toEqual([1, 1, 2, 3, 3]);
  });

  it('sorts array with negative integers', () => {
    const sorter = new AmericanFlagSort2();
    expect(sorter.sort([-3, -1, -2, 0, 2])).toEqual([-3, -2, -1, 0, 2]);
  });

  it('sorts array with zeros', () => {
    const sorter = new AmericanFlagSort2();
    expect(sorter.sort([0, 0, 0])).toEqual([0, 0, 0]);
  });

  it('sorts array with repeated digit values', () => {
    const sorter = new AmericanFlagSort2();
    const arr = [255, 128, 1, 64];
    expect(sorter.sort(arr)).toEqual([1, 64, 128, 255]);
  });

  it('sorts with descending custom comparator', () => {
    const sorter = new AmericanFlagSort2((a, b) => b - a);
    expect(sorter.sort([1, 2, 3])).toEqual([3, 2, 1]);
  });

  it('sorts floating point numbers (falls back to insertion sort)', () => {
    const sorter = new AmericanFlagSort2();
    expect(sorter.sort([3.14, 1.5, 2.7])).toEqual([1.5, 2.7, 3.14]);
  });
});

// ─── sortInPlace() ───

describe('AmericanFlagSort2 sortInPlace', () => {
  it('sorts array in place', () => {
    const sorter = new AmericanFlagSort2();
    const arr = [3, 1, 2];
    sorter.sortInPlace(arr);
    expect(arr).toEqual([1, 2, 3]);
  });

  it('handles empty array', () => {
    const sorter = new AmericanFlagSort2();
    const arr: number[] = [];
    sorter.sortInPlace(arr);
    expect(arr).toEqual([]);
  });

  it('handles single element', () => {
    const sorter = new AmericanFlagSort2();
    const arr = [42];
    sorter.sortInPlace(arr);
    expect(arr).toEqual([42]);
  });

  it('sorts negatives in place', () => {
    const sorter = new AmericanFlagSort2();
    const arr = [-5, -1, -3];
    sorter.sortInPlace(arr);
    expect(arr).toEqual([-5, -3, -1]);
  });

  it('sorts with custom comparator in place', () => {
    const sorter = new AmericanFlagSort2((a, b) => b - a);
    const arr = [1, 2, 3];
    sorter.sortInPlace(arr);
    expect(arr).toEqual([3, 2, 1]);
  });

  it('sorts floats in place', () => {
    const sorter = new AmericanFlagSort2();
    const arr = [2.5, 0.1, 3.7];
    sorter.sortInPlace(arr);
    expect(arr).toEqual([0.1, 2.5, 3.7]);
  });
});

// ─── isSorted() ───

describe('AmericanFlagSort2 isSorted', () => {
  it('returns true for sorted array', () => {
    const sorter = new AmericanFlagSort2();
    expect(sorter.isSorted([1, 2, 3, 4])).toBe(true);
  });

  it('returns false for unsorted array', () => {
    const sorter = new AmericanFlagSort2();
    expect(sorter.isSorted([3, 1, 2])).toBe(false);
  });

  it('returns true for empty array', () => {
    const sorter = new AmericanFlagSort2();
    expect(sorter.isSorted([])).toBe(true);
  });

  it('returns true for single element', () => {
    const sorter = new AmericanFlagSort2();
    expect(sorter.isSorted([42])).toBe(true);
  });

  it('returns true for array with duplicates', () => {
    const sorter = new AmericanFlagSort2();
    expect(sorter.isSorted([1, 1, 2, 2])).toBe(true);
  });

  it('works with custom comparator', () => {
    const sorter = new AmericanFlagSort2((a, b) => b - a);
    expect(sorter.isSorted([5, 3, 1])).toBe(true);
    expect(sorter.isSorted([1, 3, 5])).toBe(false);
  });
});
