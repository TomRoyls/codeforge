import { describe, it, expect } from 'vitest';
import { InterpolationSearch } from '../../src/core/interpolation-search/index.js';

// ─── Constructor ───

describe('InterpolationSearch constructor', () => {
  it('creates instance with a sorted array', () => {
    const is = new InterpolationSearch([1, 2, 3, 4, 5]);
    expect(is).toBeInstanceOf(InterpolationSearch);
  });

  it('creates instance with an empty array', () => {
    const is = new InterpolationSearch([]);
    expect(is).toBeInstanceOf(InterpolationSearch);
  });

  it('creates a defensive copy of the array', () => {
    const arr = [1, 2, 3];
    const is = new InterpolationSearch(arr);
    is.insert(4);
    expect(arr).toEqual([1, 2, 3]);
  });
});

// ─── search() ───

describe('InterpolationSearch.search', () => {
  it('finds an element in the middle', () => {
    const is = new InterpolationSearch([10, 20, 30, 40, 50]);
    expect(is.search(30)).toBe(2);
  });

  it('finds the first element', () => {
    const is = new InterpolationSearch([10, 20, 30, 40, 50]);
    expect(is.search(10)).toBe(0);
  });

  it('finds the last element', () => {
    const is = new InterpolationSearch([10, 20, 30, 40, 50]);
    expect(is.search(50)).toBe(4);
  });

  it('returns -1 for element not found', () => {
    const is = new InterpolationSearch([10, 20, 30, 40, 50]);
    expect(is.search(25)).toBe(-1);
  });

  it('returns -1 for empty array', () => {
    const is = new InterpolationSearch([]);
    expect(is.search(5)).toBe(-1);
  });

  it('finds element in single-element array', () => {
    const is = new InterpolationSearch([42]);
    expect(is.search(42)).toBe(0);
  });

  it('returns -1 in single-element array for missing element', () => {
    const is = new InterpolationSearch([42]);
    expect(is.search(10)).toBe(-1);
  });

  it('finds elements in a large uniformly distributed array', () => {
    const arr = Array.from({ length: 100 }, (_, i) => i * 2);
    const is = new InterpolationSearch(arr);
    expect(is.search(100)).toBe(50);
    expect(is.search(0)).toBe(0);
    expect(is.search(198)).toBe(99);
  });

  it('returns -1 for target below range', () => {
    const is = new InterpolationSearch([10, 20, 30]);
    expect(is.search(5)).toBe(-1);
  });

  it('returns -1 for target above range', () => {
    const is = new InterpolationSearch([10, 20, 30]);
    expect(is.search(40)).toBe(-1);
  });
});

// ─── indexOf() ───

describe('InterpolationSearch.indexOf', () => {
  it('returns same result as search', () => {
    const is = new InterpolationSearch([1, 3, 5, 7, 9]);
    expect(is.indexOf(5)).toBe(2);
    expect(is.indexOf(4)).toBe(-1);
  });
});

// ─── contains() ───

describe('InterpolationSearch.contains', () => {
  it('returns true when element exists', () => {
    const is = new InterpolationSearch([1, 3, 5, 7, 9]);
    expect(is.contains(5)).toBe(true);
  });

  it('returns false when element does not exist', () => {
    const is = new InterpolationSearch([1, 3, 5, 7, 9]);
    expect(is.contains(4)).toBe(false);
  });

  it('returns false for empty array', () => {
    const is = new InterpolationSearch([]);
    expect(is.contains(1)).toBe(false);
  });
});

// ─── closestTo() ───

describe('InterpolationSearch.closestTo', () => {
  it('returns exact match when found', () => {
    const is = new InterpolationSearch([10, 20, 30, 40, 50]);
    expect(is.closestTo(30)).toBe(30);
  });

  it('returns closest lower value', () => {
    const is = new InterpolationSearch([10, 20, 30, 40, 50]);
    expect(is.closestTo(25)).toBe(20);
  });

  it('returns lower value when equidistant (midpoint ties)', () => {
    const is = new InterpolationSearch([10, 20]);
    expect(is.closestTo(15)).toBe(10);
  });

  it('throws for empty array', () => {
    const is = new InterpolationSearch([]);
    expect(() => is.closestTo(5)).toThrow('Array is empty');
  });

  it('handles target below all elements', () => {
    const is = new InterpolationSearch([10, 20, 30]);
    expect(is.closestTo(5)).toBe(10);
  });

  it('handles target above all elements', () => {
    const is = new InterpolationSearch([10, 20, 30]);
    expect(is.closestTo(35)).toBe(30);
  });
});

// ─── rangeSearch() ───

describe('InterpolationSearch.rangeSearch', () => {
  it('returns elements within range', () => {
    const is = new InterpolationSearch([1, 3, 5, 7, 9, 11]);
    expect(is.rangeSearch(4, 8)).toEqual([5, 7]);
  });

  it('returns all elements for wide range', () => {
    const is = new InterpolationSearch([1, 2, 3]);
    expect(is.rangeSearch(0, 10)).toEqual([1, 2, 3]);
  });

  it('returns empty array for range with no matches', () => {
    const is = new InterpolationSearch([1, 2, 3]);
    expect(is.rangeSearch(10, 20)).toEqual([]);
  });

  it('returns single element on boundary match', () => {
    const is = new InterpolationSearch([1, 5, 10]);
    expect(is.rangeSearch(5, 5)).toEqual([5]);
  });
});

// ─── insert() ───

describe('InterpolationSearch.insert', () => {
  it('inserts in the middle of a sorted array', () => {
    const is = new InterpolationSearch([1, 3, 5]);
    expect(is.insert(4)).toBe(2);
  });

  it('inserts at the beginning', () => {
    const is = new InterpolationSearch([10, 20, 30]);
    expect(is.insert(5)).toBe(0);
  });

  it('inserts at the end', () => {
    const is = new InterpolationSearch([10, 20, 30]);
    expect(is.insert(40)).toBe(3);
  });

  it('inserts into empty array', () => {
    const is = new InterpolationSearch([]);
    expect(is.insert(42)).toBe(0);
  });
});

// ─── getTimeComplexity() ───

describe('InterpolationSearch.getTimeComplexity', () => {
  it('returns complexity string', () => {
    const is = new InterpolationSearch([1]);
    expect(is.getTimeComplexity()).toBe('Average: O(log(log(n))), Worst: O(n))');
  });
});
