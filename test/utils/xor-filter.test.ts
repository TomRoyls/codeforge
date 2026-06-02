import { describe, it, expect } from 'vitest';
import { XorFilter } from '../../src/utils/xor-filter.js';

// ─── Creation ───

describe('XorFilter', () => {
  it('creates from empty array', () => {
    const f = XorFilter.create([]);
    expect(f.size).toBe(0);
    expect(f.has('anything')).toBe(false);
  });

  it('creates from single item', () => {
    const f = XorFilter.create(['hello']);
    expect(f.size).toBe(1);
    expect(f.has('hello')).toBe(true);
  });

  it('creates from many items', () => {
    const items = Array.from({ length: 100 }, (_, i) => `item-${i}`);
    const f = XorFilter.create(items);
    expect(f.size).toBe(100);
    for (const item of items) {
      expect(f.has(item)).toBe(true);
    }
  });

  // ─── No False Negatives ───

  it('has no false negatives for all inserted items', () => {
    const items = Array.from({ length: 200 }, (_, i) => `key-${i}`);
    const f = XorFilter.create(items);
    for (const item of items) {
      expect(f.has(item)).toBe(true);
    }
  });

  // ─── False Positive Rate ───

  it('has reasonable false positive rate', () => {
    const items = Array.from({ length: 100 }, (_, i) => `member-${i}`);
    const f = XorFilter.create(items);
    let falsePositives = 0;
    const trials = 1000;
    for (let i = 0; i < trials; i++) {
      if (f.has(`nonmember-${i}`)) {
        falsePositives++;
      }
    }
    expect(falsePositives / trials).toBeLessThan(0.05);
  });

  // ─── Properties ───

  it('tracks size', () => {
    const f = XorFilter.create(['a', 'b', 'c']);
    expect(f.size).toBe(3);
  });

  it('tracks capacity', () => {
    const f = XorFilter.create(['a', 'b', 'c']);
    expect(f.capacity).toBeGreaterThan(0);
  });

  it('reports false positive rate', () => {
    const f = XorFilter.create(['a', 'b']);
    expect(f.falsePositiveRate).toBeGreaterThan(0);
    expect(f.falsePositiveRate).toBeLessThan(0.01);
  });

  it('reports serialized size', () => {
    const f = XorFilter.create(['x']);
    expect(f.serializedSize).toBeGreaterThan(0);
  });

  // ─── Edge Cases ───

  it('handles empty string items', () => {
    const f = XorFilter.create(['']);
    expect(f.has('')).toBe(true);
    expect(f.has('a')).toBe(false);
  });

  it('handles unicode strings', () => {
    const f = XorFilter.create(['café', '日本語', '🎉']);
    expect(f.has('café')).toBe(true);
    expect(f.has('日本語')).toBe(true);
    expect(f.has('🎉')).toBe(true);
  });

  it('deduplicates input items', () => {
    const f = XorFilter.create(['a', 'a', 'b']);
    expect(f.size).toBe(2);
    expect(f.has('a')).toBe(true);
    expect(f.has('b')).toBe(true);
  });

  it('is case sensitive', () => {
    const f = XorFilter.create(['Hello']);
    expect(f.has('Hello')).toBe(true);
    expect(f.has('hello')).toBe(false);
  });

  // ─── Re-create ───

  it('re-creating produces working filter', () => {
    const items = ['one', 'two', 'three'];
    const f1 = XorFilter.create(items);
    const f2 = XorFilter.create(items);
    for (const item of items) {
      expect(f2.has(item)).toBe(true);
    }
  });

  it('handles numeric string items', () => {
    const items = ['1', '2', '3', '100', '999'];
    const f = XorFilter.create(items);
    for (const item of items) {
      expect(f.has(item)).toBe(true);
    }
  });

  it('handles single item', () => {
    const f = XorFilter.create(['only']);
    expect(f.has('only')).toBe(true);
    expect(f.size).toBe(1);
  });

  it('has low false positive rate', () => {
    const items = Array.from({ length: 100 }, (_, i) => `item-${i}`);
    const f = XorFilter.create(items);
    let falsePositives = 0;
    for (let i = 0; i < 100; i++) {
      if (f.has(`missing-${i}`)) falsePositives++;
    }
    expect(falsePositives).toBeLessThan(10);
  });

  it('filter with 3 items contains all', () => {
    const f = XorFilter.create(['a', 'b', 'c']);
    expect(f.has('a')).toBe(true);
    expect(f.has('b')).toBe(true);
    expect(f.has('c')).toBe(true);
  });

  it('has returns true for all members via create', () => {
    const f = XorFilter.create(['x', 'y', 'z']);
    expect(f.has('x')).toBe(true);
    expect(f.has('y')).toBe(true);
    expect(f.has('z')).toBe(true);
  });
});
