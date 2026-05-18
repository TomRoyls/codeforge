import { describe, it, expect } from 'vitest';
import { GallopingSearch } from '../../src/core/galloping-search/index.js';

// ─── Constructor ───

describe('GallopingSearch constructor', () => {
  it('creates instance with number array', () => {
    const gs = new GallopingSearch([1, 2, 3, 4, 5]);
    expect(gs).toBeInstanceOf(GallopingSearch);
  });

  it('creates instance with empty array', () => {
    const gs = new GallopingSearch<number>([]);
    expect(gs).toBeInstanceOf(GallopingSearch);
  });

  it('creates instance with custom comparator', () => {
    const gs = new GallopingSearch([{ v: 1 }, { v: 2 }], (a, b) => a.v - b.v);
    expect(gs).toBeInstanceOf(GallopingSearch);
  });

  it('creates a defensive copy of the array', () => {
    const arr = [1, 2, 3];
    const gs = new GallopingSearch(arr);
    gs.insert(4);
    expect(arr).toEqual([1, 2, 3]);
  });
});

// ─── search() ───

describe('GallopingSearch.search', () => {
  it('finds element in the middle', () => {
    const gs = new GallopingSearch([10, 20, 30, 40, 50]);
    expect(gs.search(30)).toBe(2);
  });

  it('finds the first element', () => {
    const gs = new GallopingSearch([10, 20, 30, 40, 50]);
    expect(gs.search(10)).toBe(0);
  });

  it('finds the last element', () => {
    const gs = new GallopingSearch([10, 20, 30, 40, 50]);
    expect(gs.search(50)).toBe(4);
  });

  it('returns -1 for element not found', () => {
    const gs = new GallopingSearch([10, 20, 30, 40, 50]);
    expect(gs.search(25)).toBe(-1);
  });

  it('returns -1 for empty array', () => {
    const gs = new GallopingSearch<number>([]);
    expect(gs.search(5)).toBe(-1);
  });

  it('finds element in single-element array', () => {
    const gs = new GallopingSearch([42]);
    expect(gs.search(42)).toBe(0);
  });

  it('returns -1 for target below range', () => {
    const gs = new GallopingSearch([10, 20, 30]);
    expect(gs.search(5)).toBe(-1);
  });

  it('returns -1 for target above range', () => {
    const gs = new GallopingSearch([10, 20, 30]);
    expect(gs.search(40)).toBe(-1);
  });

  it('finds elements in a large sorted array', () => {
    const arr = Array.from({ length: 100 }, (_, i) => i * 3);
    const gs = new GallopingSearch(arr);
    expect(gs.search(150)).toBe(50);
    expect(gs.search(0)).toBe(0);
    expect(gs.search(297)).toBe(99);
  });

  it('works with custom comparator', () => {
    const gs = new GallopingSearch(
      [{ name: 'a' }, { name: 'b' }, { name: 'c' }],
      (a, b) => a.name.localeCompare(b.name)
    );
    expect(gs.search({ name: 'b' })).toBe(1);
  });
});

// ─── searchRange() ───

describe('GallopingSearch.searchRange', () => {
  it('returns range for duplicate elements', () => {
    const gs = new GallopingSearch([1, 2, 2, 2, 3, 4]);
    expect(gs.searchRange(2)).toEqual([1, 3]);
  });

  it('returns [-1, -1] when not found', () => {
    const gs = new GallopingSearch([1, 2, 3]);
    expect(gs.searchRange(5)).toEqual([-1, -1]);
  });

  it('returns single-element range for unique element', () => {
    const gs = new GallopingSearch([1, 2, 3]);
    expect(gs.searchRange(2)).toEqual([1, 1]);
  });

  it('returns range for all-same array', () => {
    const gs = new GallopingSearch([5, 5, 5, 5]);
    expect(gs.searchRange(5)).toEqual([0, 3]);
  });
});

// ─── insert() ───

describe('GallopingSearch.insert', () => {
  it('inserts in the middle', () => {
    const gs = new GallopingSearch([1, 3, 5]);
    expect(gs.insert(4)).toBe(2);
  });

  it('inserts at the beginning', () => {
    const gs = new GallopingSearch([10, 20, 30]);
    expect(gs.insert(5)).toBe(0);
  });

  it('inserts at the end', () => {
    const gs = new GallopingSearch([10, 20, 30]);
    expect(gs.insert(40)).toBe(3);
  });

  it('inserts into empty array', () => {
    const gs = new GallopingSearch<number>([]);
    expect(gs.insert(42)).toBe(0);
  });
});

// ─── contains() ───

describe('GallopingSearch.contains', () => {
  it('returns true when element exists', () => {
    const gs = new GallopingSearch([1, 3, 5, 7]);
    expect(gs.contains(5)).toBe(true);
  });

  it('returns false when element does not exist', () => {
    const gs = new GallopingSearch([1, 3, 5, 7]);
    expect(gs.contains(4)).toBe(false);
  });

  it('returns false for empty array', () => {
    const gs = new GallopingSearch<number>([]);
    expect(gs.contains(1)).toBe(false);
  });
});

// ─── indexOf() ───

describe('GallopingSearch.indexOf', () => {
  it('returns same result as search', () => {
    const gs = new GallopingSearch([10, 20, 30, 40, 50]);
    expect(gs.indexOf(30)).toBe(2);
    expect(gs.indexOf(25)).toBe(-1);
  });
});

// ─── getTimeComplexity() ───

describe('GallopingSearch.getTimeComplexity', () => {
  it('returns complexity string', () => {
    const gs = new GallopingSearch([1]);
    const tc = gs.getTimeComplexity();
    expect(tc).toContain('O(log n)');
  });
});
