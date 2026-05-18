import { describe, it, expect } from 'vitest';
import { FibonacciSearch4 } from '../../src/core/fibonacci-search-4/index.js';

// ─── Constructor ───

describe('FibonacciSearch4 constructor', () => {
  it('creates instance with a data array', () => {
    const fs = new FibonacciSearch4([1, 2, 3, 4, 5]);
    expect(fs).toBeInstanceOf(FibonacciSearch4);
  });

  it('creates instance with an empty array', () => {
    const fs = new FibonacciSearch4([]);
    expect(fs).toBeInstanceOf(FibonacciSearch4);
  });

  it('creates instance with a single-element array', () => {
    const fs = new FibonacciSearch4([42]);
    expect(fs).toBeInstanceOf(FibonacciSearch4);
  });
});

// ─── search() ───

describe('FibonacciSearch4.search', () => {
  it('finds element in the middle', () => {
    const fs = new FibonacciSearch4([10, 20, 30, 40, 50]);
    expect(fs.search(30)).toBe(2);
  });

  it('finds the first element', () => {
    const fs = new FibonacciSearch4([10, 20, 30, 40, 50]);
    expect(fs.search(10)).toBe(0);
  });

  it('finds the last element', () => {
    const fs = new FibonacciSearch4([10, 20, 30, 40, 50]);
    expect(fs.search(50)).toBe(4);
  });

  it('returns -1 for element not found', () => {
    const fs = new FibonacciSearch4([10, 20, 30, 40, 50]);
    expect(fs.search(25)).toBe(-1);
  });

  it('returns -1 for empty array', () => {
    const fs = new FibonacciSearch4([]);
    expect(fs.search(5)).toBe(-1);
  });

  it('finds element in single-element array', () => {
    const fs = new FibonacciSearch4([42]);
    expect(fs.search(42)).toBe(0);
  });

  it('returns -1 in single-element array for missing', () => {
    const fs = new FibonacciSearch4([42]);
    expect(fs.search(10)).toBe(-1);
  });

  it('finds elements in a large array', () => {
    const arr = Array.from({ length: 100 }, (_, i) => i * 2);
    const fs = new FibonacciSearch4(arr);
    expect(fs.search(100)).toBe(50);
    expect(fs.search(0)).toBe(0);
    expect(fs.search(198)).toBe(99);
  });
});

// ─── searchFirst() ───

describe('FibonacciSearch4.searchFirst', () => {
  it('finds first occurrence among duplicates', () => {
    const fs = new FibonacciSearch4([1, 2, 2, 2, 3, 4]);
    expect(fs.searchFirst(2)).toBe(1);
  });

  it('returns -1 when not found', () => {
    const fs = new FibonacciSearch4([1, 2, 3]);
    expect(fs.searchFirst(5)).toBe(-1);
  });

  it('returns index for unique element', () => {
    const fs = new FibonacciSearch4([1, 3, 5]);
    expect(fs.searchFirst(3)).toBe(1);
  });

  it('returns -1 for empty array', () => {
    const fs = new FibonacciSearch4([]);
    expect(fs.searchFirst(1)).toBe(-1);
  });
});

// ─── searchLast() ───

describe('FibonacciSearch4.searchLast', () => {
  it('finds last occurrence among duplicates', () => {
    const fs = new FibonacciSearch4([1, 2, 2, 2, 3, 4]);
    expect(fs.searchLast(2)).toBe(3);
  });

  it('returns -1 when not found', () => {
    const fs = new FibonacciSearch4([1, 2, 3]);
    expect(fs.searchLast(5)).toBe(-1);
  });

  it('returns index for unique element', () => {
    const fs = new FibonacciSearch4([1, 3, 5]);
    expect(fs.searchLast(3)).toBe(1);
  });

  it('handles all-same array', () => {
    const fs = new FibonacciSearch4([7, 7, 7, 7]);
    expect(fs.searchLast(7)).toBe(3);
  });
});

// ─── searchRange() ───

describe('FibonacciSearch4.searchRange', () => {
  it('returns range for duplicates', () => {
    const fs = new FibonacciSearch4([1, 2, 2, 2, 3, 4]);
    expect(fs.searchRange(2)).toEqual([1, 3]);
  });

  it('returns [-1, -1] when not found', () => {
    const fs = new FibonacciSearch4([1, 2, 3]);
    expect(fs.searchRange(5)).toEqual([-1, -1]);
  });

  it('returns single-element range for unique element', () => {
    const fs = new FibonacciSearch4([1, 2, 3]);
    expect(fs.searchRange(2)).toEqual([1, 1]);
  });

  it('returns full range for all-same array', () => {
    const fs = new FibonacciSearch4([5, 5, 5, 5]);
    expect(fs.searchRange(5)).toEqual([0, 3]);
  });
});

// ─── contains() ───

describe('FibonacciSearch4.contains', () => {
  it('returns true when element exists', () => {
    const fs = new FibonacciSearch4([1, 3, 5, 7]);
    expect(fs.contains(5)).toBe(true);
  });

  it('returns false when element does not exist', () => {
    const fs = new FibonacciSearch4([1, 3, 5, 7]);
    expect(fs.contains(4)).toBe(false);
  });

  it('returns false for empty array', () => {
    const fs = new FibonacciSearch4([]);
    expect(fs.contains(1)).toBe(false);
  });
});

// ─── count() ───

describe('FibonacciSearch4.count', () => {
  it('counts duplicates', () => {
    const fs = new FibonacciSearch4([1, 2, 2, 2, 3]);
    expect(fs.count(2)).toBe(3);
  });

  it('returns 0 for non-existent element', () => {
    const fs = new FibonacciSearch4([1, 2, 3]);
    expect(fs.count(5)).toBe(0);
  });

  it('returns 1 for unique element', () => {
    const fs = new FibonacciSearch4([1, 2, 3]);
    expect(fs.count(2)).toBe(1);
  });

  it('returns 0 for empty array', () => {
    const fs = new FibonacciSearch4([]);
    expect(fs.count(1)).toBe(0);
  });
});

// ─── length / isEmpty / toArray ───

describe('FibonacciSearch4 properties', () => {
  it('returns correct length', () => {
    const fs = new FibonacciSearch4([1, 2, 3]);
    expect(fs.length).toBe(3);
  });

  it('returns 0 length for empty array', () => {
    const fs = new FibonacciSearch4([]);
    expect(fs.length).toBe(0);
  });

  it('isEmpty returns false for non-empty array', () => {
    const fs = new FibonacciSearch4([1]);
    expect(fs.isEmpty()).toBe(false);
  });

  it('isEmpty returns true for empty array', () => {
    const fs = new FibonacciSearch4([]);
    expect(fs.isEmpty()).toBe(true);
  });

  it('toArray returns a copy of the data', () => {
    const fs = new FibonacciSearch4([1, 2, 3]);
    const arr = fs.toArray();
    expect(arr).toEqual([1, 2, 3]);
    expect(arr).not.toBe(fs.toArray());
  });
});
