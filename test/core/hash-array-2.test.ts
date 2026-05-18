import { describe, it, expect } from 'vitest';
import { HashArray2 } from '../../src/core/hash-array-2/index.js';

// ─── Constructor ───

describe('HashArray2 – Constructor', () => {
  it('creates with default capacity 16', () => {
    const ha = new HashArray2<number>();
    expect(ha.capacity).toBe(16);
  });

  it('creates with custom capacity', () => {
    const ha = new HashArray2<number>(32);
    expect(ha.capacity).toBe(32);
  });

  it('starts with size 0', () => {
    const ha = new HashArray2<number>();
    expect(ha.size).toBe(0);
  });

  it('starts with load factor 0', () => {
    const ha = new HashArray2<number>();
    expect(ha.loadFactor()).toBe(0);
  });
});

// ─── set / get ───

describe('HashArray2 – set & get', () => {
  it('stores and retrieves a value', () => {
    const ha = new HashArray2<number>();
    expect(ha.set('key', 42)).toBe(true);
    expect(ha.get('key')).toBe(42);
  });

  it('overwrites existing key', () => {
    const ha = new HashArray2<number>();
    ha.set('key', 1);
    ha.set('key', 2);
    expect(ha.get('key')).toBe(2);
    expect(ha.size).toBe(1);
  });

  it('returns undefined for missing key', () => {
    const ha = new HashArray2<number>();
    expect(ha.get('missing')).toBeUndefined();
  });

  it('stores multiple entries', () => {
    const ha = new HashArray2<number>();
    ha.set('a', 1);
    ha.set('b', 2);
    ha.set('c', 3);
    expect(ha.get('a')).toBe(1);
    expect(ha.get('b')).toBe(2);
    expect(ha.get('c')).toBe(3);
    expect(ha.size).toBe(3);
  });

  it('returns false when table is full and key is new', () => {
    const ha = new HashArray2<number>(2);
    ha.set('a', 1);
    ha.set('b', 2);
    expect(ha.set('c', 3)).toBe(false);
  });
});

// ─── has ───

describe('HashArray2 – has', () => {
  it('returns true for existing key', () => {
    const ha = new HashArray2<number>();
    ha.set('x', 1);
    expect(ha.has('x')).toBe(true);
  });

  it('returns false for missing key', () => {
    const ha = new HashArray2<number>();
    expect(ha.has('x')).toBe(false);
  });

  it('returns false after deletion', () => {
    const ha = new HashArray2<number>();
    ha.set('x', 1);
    ha.delete('x');
    expect(ha.has('x')).toBe(false);
  });
});

// ─── delete ───

describe('HashArray2 – delete', () => {
  it('removes an existing key', () => {
    const ha = new HashArray2<number>();
    ha.set('a', 1);
    expect(ha.delete('a')).toBe(true);
    expect(ha.get('a')).toBeUndefined();
    expect(ha.size).toBe(0);
  });

  it('returns false for missing key', () => {
    const ha = new HashArray2<number>();
    expect(ha.delete('missing')).toBe(false);
  });

  it('does not affect other entries', () => {
    const ha = new HashArray2<number>();
    ha.set('a', 1);
    ha.set('b', 2);
    ha.delete('a');
    expect(ha.get('b')).toBe(2);
    expect(ha.size).toBe(1);
  });

  it('allows re-insertion after delete', () => {
    const ha = new HashArray2<number>();
    ha.set('a', 1);
    ha.delete('a');
    ha.set('a', 99);
    expect(ha.get('a')).toBe(99);
    expect(ha.size).toBe(1);
  });
});

// ─── keys / values / entries ───

describe('HashArray2 – Iteration', () => {
  it('keys() returns all keys', () => {
    const ha = new HashArray2<number>();
    ha.set('x', 1);
    ha.set('y', 2);
    const k = ha.keys();
    expect(k).toContain('x');
    expect(k).toContain('y');
    expect(k.length).toBe(2);
  });

  it('values() returns all values', () => {
    const ha = new HashArray2<number>();
    ha.set('x', 10);
    ha.set('y', 20);
    const v = ha.values();
    expect(v).toContain(10);
    expect(v).toContain(20);
    expect(v.length).toBe(2);
  });

  it('entries() returns [key, value] pairs', () => {
    const ha = new HashArray2<number>();
    ha.set('x', 10);
    ha.set('y', 20);
    const e = ha.entries();
    expect(e.length).toBe(2);
    expect(e).toContainEqual(['x', 10]);
    expect(e).toContainEqual(['y', 20]);
  });

  it('iteration methods return empty arrays for empty table', () => {
    const ha = new HashArray2<number>();
    expect(ha.keys()).toEqual([]);
    expect(ha.values()).toEqual([]);
    expect(ha.entries()).toEqual([]);
  });
});

// ─── loadFactor ───

describe('HashArray2 – loadFactor', () => {
  it('increases as items are added', () => {
    const ha = new HashArray2<number>(4);
    ha.set('a', 1);
    expect(ha.loadFactor()).toBe(0.25);
    ha.set('b', 2);
    expect(ha.loadFactor()).toBe(0.5);
  });
});

// ─── clear ───

describe('HashArray2 – clear', () => {
  it('removes all entries and resets size', () => {
    const ha = new HashArray2<number>();
    ha.set('a', 1);
    ha.set('b', 2);
    ha.clear();
    expect(ha.size).toBe(0);
    expect(ha.get('a')).toBeUndefined();
    expect(ha.loadFactor()).toBe(0);
  });

  it('preserves capacity after clear', () => {
    const ha = new HashArray2<number>(32);
    ha.set('a', 1);
    ha.clear();
    expect(ha.capacity).toBe(32);
  });
});
