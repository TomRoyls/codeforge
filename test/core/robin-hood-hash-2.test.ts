import { describe, it, expect } from 'vitest';
import { RobinHoodHash2 } from '../../src/core/robin-hood-hash-2/index.js';

// ─── Constructor ───

describe('RobinHoodHash2 – Constructor', () => {
  it('creates with default capacity (rounded to power of 2)', () => {
    const map = new RobinHoodHash2<string, number>();
    expect(map.capacity()).toBe(16);
  });

  it('rounds initial capacity up to next power of 2', () => {
    const map = new RobinHoodHash2<string, number>(10);
    expect(map.capacity()).toBe(16);
  });

  it('accepts exact power of 2', () => {
    const map = new RobinHoodHash2<string, number>(32);
    expect(map.capacity()).toBe(32);
  });

  it('starts with size 0', () => {
    const map = new RobinHoodHash2<string, number>();
    expect(map.size).toBe(0);
  });
});

// ─── set / get ───

describe('RobinHoodHash2 – set & get', () => {
  it('stores and retrieves a value', () => {
    const map = new RobinHoodHash2<string, number>();
    map.set('key', 42);
    expect(map.get('key')).toBe(42);
  });

  it('overwrites existing key', () => {
    const map = new RobinHoodHash2<string, number>();
    map.set('key', 1);
    map.set('key', 2);
    expect(map.get('key')).toBe(2);
    expect(map.size).toBe(1);
  });

  it('returns undefined for missing key', () => {
    const map = new RobinHoodHash2<string, number>();
    expect(map.get('missing')).toBeUndefined();
  });

  it('stores multiple key-value pairs', () => {
    const map = new RobinHoodHash2<string, number>();
    map.set('a', 1);
    map.set('b', 2);
    map.set('c', 3);
    expect(map.get('a')).toBe(1);
    expect(map.get('b')).toBe(2);
    expect(map.get('c')).toBe(3);
    expect(map.size).toBe(3);
  });

  it('handles number keys', () => {
    const map = new RobinHoodHash2<number, string>();
    map.set(1, 'one');
    map.set(2, 'two');
    expect(map.get(1)).toBe('one');
    expect(map.get(2)).toBe('two');
  });

  it('handles object identity keys', () => {
    const map = new RobinHoodHash2<object, number>();
    const key = { id: 1 };
    map.set(key, 100);
    expect(map.get(key)).toBe(100);
  });
});

// ─── has ───

describe('RobinHoodHash2 – has', () => {
  it('returns true for existing key', () => {
    const map = new RobinHoodHash2<string, number>();
    map.set('x', 1);
    expect(map.has('x')).toBe(true);
  });

  it('returns false for missing key', () => {
    const map = new RobinHoodHash2<string, number>();
    expect(map.has('x')).toBe(false);
  });

  it('returns false after delete', () => {
    const map = new RobinHoodHash2<string, number>();
    map.set('x', 1);
    map.delete('x');
    expect(map.has('x')).toBe(false);
  });
});

// ─── delete ───

describe('RobinHoodHash2 – delete', () => {
  it('removes an existing key', () => {
    const map = new RobinHoodHash2<string, number>();
    map.set('a', 1);
    expect(map.delete('a')).toBe(true);
    expect(map.get('a')).toBeUndefined();
    expect(map.size).toBe(0);
  });

  it('returns false for missing key', () => {
    const map = new RobinHoodHash2<string, number>();
    expect(map.delete('missing')).toBe(false);
  });

  it('does not affect other entries', () => {
    const map = new RobinHoodHash2<string, number>();
    map.set('a', 1);
    map.set('b', 2);
    map.delete('a');
    expect(map.get('b')).toBe(2);
    expect(map.size).toBe(1);
  });
});

// ─── Resize ───

describe('RobinHoodHash2 – Resize', () => {
  it('doubles capacity when load factor is exceeded', () => {
    const map = new RobinHoodHash2<string, number>(4, 0.75);
    expect(map.capacity()).toBe(4);
    map.set('a', 1);
    map.set('b', 2);
    map.set('c', 3);
    map.set('d', 4);
    expect(map.capacity()).toBe(8);
    expect(map.get('a')).toBe(1);
    expect(map.get('b')).toBe(2);
    expect(map.get('c')).toBe(3);
    expect(map.get('d')).toBe(4);
  });

  it('preserves all data after resize', () => {
    const map = new RobinHoodHash2<string, number>(4, 0.75);
    const items = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    items.forEach((k, i) => map.set(k, i));
    items.forEach((k, i) => {
      expect(map.get(k)).toBe(i);
    });
  });
});

// ─── clear ───

describe('RobinHoodHash2 – clear', () => {
  it('removes all entries', () => {
    const map = new RobinHoodHash2<string, number>();
    map.set('a', 1);
    map.set('b', 2);
    map.clear();
    expect(map.size).toBe(0);
    expect(map.get('a')).toBeUndefined();
  });

  it('resets maxProbeLength', () => {
    const map = new RobinHoodHash2<string, number>();
    map.set('a', 1);
    map.clear();
    expect(map.maxProbeLength()).toBe(0);
  });
});

// ─── maxProbeLength ───

describe('RobinHoodHash2 – maxProbeLength', () => {
  it('starts at 0', () => {
    const map = new RobinHoodHash2<string, number>();
    expect(map.maxProbeLength()).toBe(0);
  });

  it('tracks maximum probe distance', () => {
    const map = new RobinHoodHash2<string, number>();
    for (let i = 0; i < 100; i++) {
      map.set(`key-${i}`, i);
    }
    expect(map.maxProbeLength()).toBeGreaterThanOrEqual(0);
  });
});
