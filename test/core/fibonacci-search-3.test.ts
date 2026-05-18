import { describe, it, expect } from 'vitest';
import { FibonacciSearch3 } from '../../src/core/fibonacci-search-3/index.js';

// ─── Constructor ───

describe('FibonacciSearch3 constructor', () => {
  it('creates instance with default comparator', () => {
    const fs = new FibonacciSearch3();
    expect(fs).toBeInstanceOf(FibonacciSearch3);
  });

  it('creates instance with custom comparator', () => {
    const fs = new FibonacciSearch3<string>((a, b) => a.localeCompare(b));
    expect(fs).toBeInstanceOf(FibonacciSearch3);
  });
});

// ─── search() ───

describe('FibonacciSearch3.search', () => {
  it('finds element in the middle', () => {
    const fs = new FibonacciSearch3();
    expect(fs.search([10, 20, 30, 40, 50], 30)).toBe(2);
  });

  it('finds the first element', () => {
    const fs = new FibonacciSearch3();
    expect(fs.search([10, 20, 30, 40, 50], 10)).toBe(0);
  });

  it('finds the last element', () => {
    const fs = new FibonacciSearch3();
    expect(fs.search([10, 20, 30, 40, 50], 50)).toBe(4);
  });

  it('returns -1 for element not found', () => {
    const fs = new FibonacciSearch3();
    expect(fs.search([10, 20, 30, 40, 50], 25)).toBe(-1);
  });

  it('returns -1 for empty array', () => {
    const fs = new FibonacciSearch3();
    expect(fs.search([], 5)).toBe(-1);
  });

  it('finds element in single-element array', () => {
    const fs = new FibonacciSearch3();
    expect(fs.search([42], 42)).toBe(0);
  });

  it('returns -1 in single-element array for missing', () => {
    const fs = new FibonacciSearch3();
    expect(fs.search([42], 10)).toBe(-1);
  });

  it('finds element in two-element array', () => {
    const fs = new FibonacciSearch3();
    expect(fs.search([1, 2], 1)).toBe(0);
    expect(fs.search([1, 2], 2)).toBe(1);
  });

  it('handles negative numbers', () => {
    const fs = new FibonacciSearch3();
    expect(fs.search([-10, -5, 0, 5, 10], -5)).toBe(1);
    expect(fs.search([-10, -5, 0, 5, 10], 0)).toBe(2);
  });

  it('works with custom comparator for strings', () => {
    const fs = new FibonacciSearch3<string>((a, b) => a.localeCompare(b));
    expect(fs.search(['apple', 'banana', 'cherry'], 'banana')).toBe(1);
    expect(fs.search(['apple', 'banana', 'cherry'], 'grape')).toBe(-1);
  });

  it('finds elements in a large sorted array', () => {
    const arr = Array.from({ length: 100 }, (_, i) => i * 2);
    const fs = new FibonacciSearch3();
    expect(fs.search(arr, 0)).toBe(0);
    expect(fs.search(arr, 198)).toBe(99);
    expect(fs.search(arr, 100)).toBe(50);
    expect(fs.search(arr, 99)).toBe(-1);
  });
});

// ─── searchFirst() ───

describe('FibonacciSearch3.searchFirst', () => {
  it('finds first occurrence of duplicates', () => {
    const fs = new FibonacciSearch3();
    expect(fs.searchFirst([1, 2, 2, 2, 3, 4], 2)).toBe(1);
  });

  it('returns -1 for element not found', () => {
    const fs = new FibonacciSearch3();
    expect(fs.searchFirst([1, 2, 3], 5)).toBe(-1);
  });

  it('returns -1 for empty array', () => {
    const fs = new FibonacciSearch3();
    expect(fs.searchFirst([], 1)).toBe(-1);
  });

  it('finds single unique element', () => {
    const fs = new FibonacciSearch3();
    expect(fs.searchFirst([10, 20, 30], 20)).toBe(1);
  });

  it('handles all same elements', () => {
    const fs = new FibonacciSearch3();
    expect(fs.searchFirst([5, 5, 5, 5], 5)).toBe(0);
  });

  it('finds first element when it matches', () => {
    const fs = new FibonacciSearch3();
    expect(fs.searchFirst([1, 2, 3], 1)).toBe(0);
  });

  it('finds last element when it matches', () => {
    const fs = new FibonacciSearch3();
    expect(fs.searchFirst([1, 2, 3], 3)).toBe(2);
  });
});

// ─── searchLast() ───

describe('FibonacciSearch3.searchLast', () => {
  it('finds last occurrence of duplicates', () => {
    const fs = new FibonacciSearch3();
    expect(fs.searchLast([1, 2, 2, 2, 3, 4], 2)).toBe(3);
  });

  it('returns -1 for element not found', () => {
    const fs = new FibonacciSearch3();
    expect(fs.searchLast([1, 2, 3], 5)).toBe(-1);
  });

  it('returns -1 for empty array', () => {
    const fs = new FibonacciSearch3();
    expect(fs.searchLast([], 1)).toBe(-1);
  });

  it('finds single unique element', () => {
    const fs = new FibonacciSearch3();
    expect(fs.searchLast([10, 20, 30], 20)).toBe(1);
  });

  it('handles all same elements', () => {
    const fs = new FibonacciSearch3();
    expect(fs.searchLast([5, 5, 5, 5], 5)).toBe(3);
  });
});

// ─── searchRange() ───

describe('FibonacciSearch3.searchRange', () => {
  it('returns range of duplicate elements', () => {
    const fs = new FibonacciSearch3();
    expect(fs.searchRange([1, 2, 2, 2, 3, 4], 2)).toEqual([1, 3]);
  });

  it('returns [-1, -1] for element not found', () => {
    const fs = new FibonacciSearch3();
    expect(fs.searchRange([1, 2, 3], 5)).toEqual([-1, -1]);
  });

  it('returns [-1, -1] for empty array', () => {
    const fs = new FibonacciSearch3();
    expect(fs.searchRange([], 1)).toEqual([-1, -1]);
  });

  it('returns same index for unique element', () => {
    const fs = new FibonacciSearch3();
    const [first, last] = fs.searchRange([10, 20, 30], 20);
    expect(first).toBe(1);
    expect(last).toBe(1);
  });

  it('returns full range when all elements match', () => {
    const fs = new FibonacciSearch3();
    expect(fs.searchRange([5, 5, 5, 5], 5)).toEqual([0, 3]);
  });

  it('works with custom comparator for strings', () => {
    const fs = new FibonacciSearch3<string>((a, b) => a.localeCompare(b));
    expect(fs.searchRange(['a', 'b', 'b', 'c'], 'b')).toEqual([1, 2]);
  });
});
