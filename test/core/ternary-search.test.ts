import { describe, it, expect } from 'vitest';
import { TernarySearch } from '../../src/core/ternary-search/index.js';

// ─── Constructor ───

describe('TernarySearch constructor', () => {
  it('creates instance with a sorted array', () => {
    const ts = new TernarySearch([1, 2, 3, 4, 5]);
    expect(ts).toBeInstanceOf(TernarySearch);
  });

  it('creates instance with an empty array', () => {
    const ts = new TernarySearch([]);
    expect(ts).toBeInstanceOf(TernarySearch);
  });

  it('creates a defensive copy of the array', () => {
    const arr = [1, 2, 3];
    const ts = new TernarySearch(arr);
    expect(arr).toEqual([1, 2, 3]);
  });
});

// ─── search() ───

describe('TernarySearch.search', () => {
  it('finds element in the middle', () => {
    const ts = new TernarySearch([10, 20, 30, 40, 50]);
    expect(ts.search(30)).toBe(2);
  });

  it('finds the first element', () => {
    const ts = new TernarySearch([10, 20, 30, 40, 50]);
    expect(ts.search(10)).toBe(0);
  });

  it('finds the last element', () => {
    const ts = new TernarySearch([10, 20, 30, 40, 50]);
    expect(ts.search(50)).toBe(4);
  });

  it('returns -1 for element not found', () => {
    const ts = new TernarySearch([10, 20, 30, 40, 50]);
    expect(ts.search(25)).toBe(-1);
  });

  it('returns -1 for empty array', () => {
    const ts = new TernarySearch([]);
    expect(ts.search(5)).toBe(-1);
  });

  it('finds element in single-element array', () => {
    const ts = new TernarySearch([42]);
    expect(ts.search(42)).toBe(0);
  });

  it('returns -1 in single-element array for missing', () => {
    const ts = new TernarySearch([42]);
    expect(ts.search(10)).toBe(-1);
  });

  it('finds elements in a large array', () => {
    const arr = Array.from({ length: 100 }, (_, i) => i * 2);
    const ts = new TernarySearch(arr);
    expect(ts.search(100)).toBe(50);
    expect(ts.search(0)).toBe(0);
    expect(ts.search(198)).toBe(99);
  });

  it('returns -1 for target below all elements', () => {
    const ts = new TernarySearch([10, 20, 30]);
    expect(ts.search(5)).toBe(-1);
  });

  it('returns -1 for target above all elements', () => {
    const ts = new TernarySearch([10, 20, 30]);
    expect(ts.search(40)).toBe(-1);
  });
});

// ─── indexOf() ───

describe('TernarySearch.indexOf', () => {
  it('returns same result as search', () => {
    const ts = new TernarySearch([1, 3, 5, 7, 9]);
    expect(ts.indexOf(5)).toBe(2);
    expect(ts.indexOf(4)).toBe(-1);
  });
});

// ─── contains() ───

describe('TernarySearch.contains', () => {
  it('returns true when element exists', () => {
    const ts = new TernarySearch([1, 3, 5, 7, 9]);
    expect(ts.contains(5)).toBe(true);
  });

  it('returns false when element does not exist', () => {
    const ts = new TernarySearch([1, 3, 5, 7, 9]);
    expect(ts.contains(4)).toBe(false);
  });

  it('returns false for empty array', () => {
    const ts = new TernarySearch([]);
    expect(ts.contains(1)).toBe(false);
  });
});

// ─── findMin() ───

describe('TernarySearch.findMin', () => {
  it('returns first element of sorted array', () => {
    const ts = new TernarySearch([5, 10, 15, 20]);
    expect(ts.findMin()).toBe(5);
  });

  it('returns the only element for single-element array', () => {
    const ts = new TernarySearch([42]);
    expect(ts.findMin()).toBe(42);
  });

  it('throws for empty array', () => {
    const ts = new TernarySearch([]);
    expect(() => ts.findMin()).toThrow('Array is empty');
  });
});

// ─── findMax() ───

describe('TernarySearch.findMax', () => {
  it('returns last element of sorted array', () => {
    const ts = new TernarySearch([5, 10, 15, 20]);
    expect(ts.findMax()).toBe(20);
  });

  it('returns the only element for single-element array', () => {
    const ts = new TernarySearch([42]);
    expect(ts.findMax()).toBe(42);
  });

  it('throws for empty array', () => {
    const ts = new TernarySearch([]);
    expect(() => ts.findMax()).toThrow('Array is empty');
  });
});

// ─── closestTo() ───

describe('TernarySearch.closestTo', () => {
  it('returns exact match when found', () => {
    const ts = new TernarySearch([10, 20, 30, 40, 50]);
    expect(ts.closestTo(30)).toBe(30);
  });

  it('returns closest element', () => {
    const ts = new TernarySearch([10, 20, 30]);
    expect(ts.closestTo(25)).toBe(20);
  });

  it('throws for empty array', () => {
    const ts = new TernarySearch([]);
    expect(() => ts.closestTo(5)).toThrow('Array is empty');
  });

  it('handles target below all elements', () => {
    const ts = new TernarySearch([10, 20, 30]);
    expect(ts.closestTo(5)).toBe(10);
  });

  it('handles target above all elements', () => {
    const ts = new TernarySearch([10, 20, 30]);
    expect(ts.closestTo(35)).toBe(30);
  });

  it('returns first closest when equidistant', () => {
    const ts = new TernarySearch([10, 20]);
    // |15-10| = 5, |15-20| = 5, both equal, first wins
    expect(ts.closestTo(15)).toBe(10);
  });
});

// ─── rangeSearch() ───

describe('TernarySearch.rangeSearch', () => {
  it('returns elements within range', () => {
    const ts = new TernarySearch([1, 3, 5, 7, 9, 11]);
    expect(ts.rangeSearch(4, 8)).toEqual([5, 7]);
  });

  it('returns all elements for wide range', () => {
    const ts = new TernarySearch([1, 2, 3]);
    expect(ts.rangeSearch(0, 10)).toEqual([1, 2, 3]);
  });

  it('returns empty array for no matches', () => {
    const ts = new TernarySearch([1, 2, 3]);
    expect(ts.rangeSearch(10, 20)).toEqual([]);
  });

  it('returns empty array for empty array', () => {
    const ts = new TernarySearch([]);
    expect(ts.rangeSearch(0, 10)).toEqual([]);
  });
});

// ─── getTimeComplexity() ───

describe('TernarySearch.getTimeComplexity', () => {
  it('returns complexity string', () => {
    const ts = new TernarySearch([1]);
    expect(ts.getTimeComplexity()).toBe('O(log3 n)');
  });
});
