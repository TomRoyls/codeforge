import { describe, it, expect } from 'vitest';
import { FibonacciSearch } from '../../src/core/fibonacci-search-2/index.js';

// ─── Constructor ───

describe('FibonacciSearch constructor', () => {
  it('creates instance with a sorted array', () => {
    const fs = new FibonacciSearch([1, 2, 3, 4, 5]);
    expect(fs).toBeInstanceOf(FibonacciSearch);
  });

  it('creates instance with an empty array', () => {
    const fs = new FibonacciSearch([]);
    expect(fs).toBeInstanceOf(FibonacciSearch);
  });

  it('creates instance with a single-element array', () => {
    const fs = new FibonacciSearch([42]);
    expect(fs).toBeInstanceOf(FibonacciSearch);
  });
});

// ─── search() ───

describe('FibonacciSearch.search', () => {
  it('finds element in the middle', () => {
    const fs = new FibonacciSearch([10, 20, 30, 40, 50]);
    expect(fs.search(30)).toBe(2);
  });

  it('finds the first element', () => {
    const fs = new FibonacciSearch([10, 20, 30, 40, 50]);
    expect(fs.search(10)).toBe(0);
  });

  it('finds the last element', () => {
    const fs = new FibonacciSearch([10, 20, 30, 40, 50]);
    expect(fs.search(50)).toBe(4);
  });

  it('returns -1 for element not found', () => {
    const fs = new FibonacciSearch([10, 20, 30, 40, 50]);
    expect(fs.search(25)).toBe(-1);
  });

  it('returns -1 for empty array', () => {
    const fs = new FibonacciSearch([]);
    expect(fs.search(5)).toBe(-1);
  });

  it('finds element in single-element array', () => {
    const fs = new FibonacciSearch([42]);
    expect(fs.search(42)).toBe(0);
  });

  it('returns -1 in single-element array for missing', () => {
    const fs = new FibonacciSearch([42]);
    expect(fs.search(10)).toBe(-1);
  });

  it('finds element in two-element array (first)', () => {
    const fs = new FibonacciSearch([1, 2]);
    expect(fs.search(1)).toBe(0);
  });

  it('finds element in two-element array (second)', () => {
    const fs = new FibonacciSearch([1, 2]);
    expect(fs.search(2)).toBe(1);
  });

  it('handles negative numbers', () => {
    const fs = new FibonacciSearch([-10, -5, 0, 5, 10]);
    expect(fs.search(-5)).toBe(1);
    expect(fs.search(0)).toBe(2);
    expect(fs.search(-10)).toBe(0);
  });

  it('finds elements in a large sorted array', () => {
    const arr = Array.from({ length: 100 }, (_, i) => i * 2);
    const fs = new FibonacciSearch(arr);
    expect(fs.search(0)).toBe(0);
    expect(fs.search(198)).toBe(99);
    expect(fs.search(100)).toBe(50);
    expect(fs.search(99)).toBe(-1);
  });
});

// ─── indexOf() ───

describe('FibonacciSearch.indexOf', () => {
  it('returns same result as search', () => {
    const fs = new FibonacciSearch([1, 3, 5, 7, 9]);
    expect(fs.indexOf(5)).toBe(2);
    expect(fs.indexOf(8)).toBe(-1);
  });

  it('returns -1 for empty array', () => {
    const fs = new FibonacciSearch([]);
    expect(fs.indexOf(1)).toBe(-1);
  });
});

// ─── contains() ───

describe('FibonacciSearch.contains', () => {
  it('returns true for existing element', () => {
    const fs = new FibonacciSearch([1, 3, 5, 7, 9]);
    expect(fs.contains(5)).toBe(true);
  });

  it('returns false for missing element', () => {
    const fs = new FibonacciSearch([1, 3, 5, 7, 9]);
    expect(fs.contains(4)).toBe(false);
  });

  it('returns false for empty array', () => {
    const fs = new FibonacciSearch([]);
    expect(fs.contains(1)).toBe(false);
  });

  it('returns true for first and last elements', () => {
    const fs = new FibonacciSearch([10, 20, 30]);
    expect(fs.contains(10)).toBe(true);
    expect(fs.contains(30)).toBe(true);
  });
});

// ─── closestTo() ───

describe('FibonacciSearch.closestTo', () => {
  it('returns exact match when found', () => {
    const fs = new FibonacciSearch([10, 20, 30, 40, 50]);
    expect(fs.closestTo(30)).toBe(30);
  });

  it('returns closest lower value when target is between two values', () => {
    const fs = new FibonacciSearch([10, 20, 30]);
    expect(fs.closestTo(24)).toBe(20);
  });

  it('returns closest upper value when target is closer to upper', () => {
    const fs = new FibonacciSearch([10, 20, 30]);
    expect(fs.closestTo(26)).toBe(30);
  });

  it('returns first element when target is less than all', () => {
    const fs = new FibonacciSearch([10, 20, 30]);
    expect(fs.closestTo(1)).toBe(10);
  });

  it('returns last element when target is greater than all', () => {
    const fs = new FibonacciSearch([10, 20, 30]);
    expect(fs.closestTo(100)).toBe(30);
  });

  it('throws on empty array', () => {
    const fs = new FibonacciSearch([]);
    expect(() => fs.closestTo(5)).toThrow('Array is empty');
  });

  it('works with single element', () => {
    const fs = new FibonacciSearch([42]);
    expect(fs.closestTo(40)).toBe(42);
    expect(fs.closestTo(50)).toBe(42);
  });

  it('works with negative numbers', () => {
    const fs = new FibonacciSearch([-20, -10, 0, 10, 20]);
    const result = fs.closestTo(-5);
    expect([-10, 0]).toContain(result);
  });
});

// ─── rangeSearch() ───

describe('FibonacciSearch.rangeSearch', () => {
  it('returns elements within range', () => {
    const fs = new FibonacciSearch([10, 20, 30, 40, 50]);
    expect(fs.rangeSearch(20, 40)).toEqual([20, 30, 40]);
  });

  it('returns single element when range matches one value', () => {
    const fs = new FibonacciSearch([10, 20, 30]);
    expect(fs.rangeSearch(20, 20)).toEqual([20]);
  });

  it('returns empty for range outside array values', () => {
    const fs = new FibonacciSearch([10, 20, 30]);
    expect(fs.rangeSearch(40, 50)).toEqual([]);
  });

  it('returns empty for empty array', () => {
    const fs = new FibonacciSearch([]);
    expect(fs.rangeSearch(1, 10)).toEqual([]);
  });

  it('returns empty when min > max', () => {
    const fs = new FibonacciSearch([10, 20, 30]);
    expect(fs.rangeSearch(30, 10)).toEqual([]);
  });

  it('returns partial range at start', () => {
    const fs = new FibonacciSearch([10, 20, 30, 40, 50]);
    expect(fs.rangeSearch(5, 25)).toEqual([10, 20]);
  });

  it('returns partial range at end', () => {
    const fs = new FibonacciSearch([10, 20, 30, 40, 50]);
    expect(fs.rangeSearch(35, 100)).toEqual([40, 50]);
  });

  it('returns all elements for wide range', () => {
    const fs = new FibonacciSearch([10, 20, 30]);
    expect(fs.rangeSearch(1, 100)).toEqual([10, 20, 30]);
  });
});

// ─── getTimeComplexity() ───

describe('FibonacciSearch.getTimeComplexity', () => {
  it('returns O(log n)', () => {
    const fs = new FibonacciSearch([1, 2, 3]);
    expect(fs.getTimeComplexity()).toBe('O(log n)');
  });
});
