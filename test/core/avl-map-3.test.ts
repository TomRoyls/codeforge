import { describe, it, expect } from 'vitest';
import { AVLMap3 } from '../../src/core/avl-map-3/index.js';

// ─── Constructor ───

describe('AVLMap3 constructor', () => {
  it('creates an empty map with default comparator', () => {
    const map = new AVLMap3<number, string>();
    expect(map.size).toBe(0);
    expect(map.isEmpty()).toBe(true);
  });

  it('creates a map with custom comparator', () => {
    const map = new AVLMap3<string, number>((a, b) => a.localeCompare(b));
    expect(map).toBeInstanceOf(AVLMap3);
    expect(map.size).toBe(0);
  });
});

// ─── set() / get() ───

describe('AVLMap3 set and get', () => {
  it('sets and gets a value', () => {
    const map = new AVLMap3<number, string>();
    map.set(1, 'one');
    expect(map.get(1)).toBe('one');
  });

  it('overwrites existing key', () => {
    const map = new AVLMap3<number, string>();
    map.set(1, 'first');
    map.set(1, 'second');
    expect(map.get(1)).toBe('second');
    expect(map.size).toBe(1);
  });

  it('returns undefined for missing key', () => {
    const map = new AVLMap3<number, string>();
    expect(map.get(99)).toBeUndefined();
  });

  it('handles multiple insertions', () => {
    const map = new AVLMap3<number, string>();
    map.set(3, 'three');
    map.set(1, 'one');
    map.set(2, 'two');
    expect(map.get(1)).toBe('one');
    expect(map.get(2)).toBe('two');
    expect(map.get(3)).toBe('three');
    expect(map.size).toBe(3);
  });
});

// ─── has() ───

describe('AVLMap3 has', () => {
  it('returns true for existing key', () => {
    const map = new AVLMap3<number, string>();
    map.set(1, 'one');
    expect(map.has(1)).toBe(true);
  });

  it('returns false for missing key', () => {
    const map = new AVLMap3<number, string>();
    expect(map.has(1)).toBe(false);
  });
});

// ─── delete() ───

describe('AVLMap3 delete', () => {
  it('deletes an existing key', () => {
    const map = new AVLMap3<number, string>();
    map.set(1, 'one');
    expect(map.delete(1)).toBe(true);
    expect(map.has(1)).toBe(false);
    expect(map.size).toBe(0);
  });

  it('returns false for missing key', () => {
    const map = new AVLMap3<number, string>();
    expect(map.delete(99)).toBe(false);
  });

  it('maintains balance after deletions', () => {
    const map = new AVLMap3<number, number>();
    for (let i = 0; i < 10; i++) {
      map.set(i, i);
    }
    for (let i = 0; i < 10; i += 2) {
      map.delete(i);
    }
    expect(map.size).toBe(5);
    const keys = map.keys();
    expect(keys).toEqual([1, 3, 5, 7, 9]);
  });
});

// ─── min() / max() ───

describe('AVLMap3 min and max', () => {
  it('returns undefined for empty map', () => {
    const map = new AVLMap3<number, string>();
    expect(map.min()).toBeUndefined();
    expect(map.max()).toBeUndefined();
  });

  it('returns min key', () => {
    const map = new AVLMap3<number, string>();
    map.set(5, 'five');
    map.set(2, 'two');
    map.set(8, 'eight');
    expect(map.min()).toBe(2);
  });

  it('returns max key', () => {
    const map = new AVLMap3<number, string>();
    map.set(5, 'five');
    map.set(2, 'two');
    map.set(8, 'eight');
    expect(map.max()).toBe(8);
  });

  it('updates min and max after deletion', () => {
    const map = new AVLMap3<number, string>();
    map.set(1, 'one');
    map.set(5, 'five');
    map.set(10, 'ten');
    map.delete(1);
    expect(map.min()).toBe(5);
    map.delete(10);
    expect(map.max()).toBe(5);
  });
});

// ─── size / isEmpty ───

describe('AVLMap3 size and isEmpty', () => {
  it('tracks size correctly', () => {
    const map = new AVLMap3<number, string>();
    expect(map.isEmpty()).toBe(true);
    map.set(1, 'one');
    expect(map.size).toBe(1);
    expect(map.isEmpty()).toBe(false);
  });

  it('updates size on overwrite', () => {
    const map = new AVLMap3<number, string>();
    map.set(1, 'one');
    map.set(1, 'updated');
    expect(map.size).toBe(1);
  });
});

// ─── clear() ───

describe('AVLMap3 clear', () => {
  it('clears all entries', () => {
    const map = new AVLMap3<number, string>();
    map.set(1, 'one');
    map.set(2, 'two');
    map.clear();
    expect(map.size).toBe(0);
    expect(map.isEmpty()).toBe(true);
    expect(map.get(1)).toBeUndefined();
  });
});

// ─── keys() / values() / entries() ───

describe('AVLMap3 iteration methods', () => {
  it('returns keys in sorted order', () => {
    const map = new AVLMap3<number, string>();
    map.set(3, 'three');
    map.set(1, 'one');
    map.set(2, 'two');
    expect(map.keys()).toEqual([1, 2, 3]);
  });

  it('returns values in key order', () => {
    const map = new AVLMap3<number, string>();
    map.set(3, 'three');
    map.set(1, 'one');
    map.set(2, 'two');
    expect(map.values()).toEqual(['one', 'two', 'three']);
  });

  it('returns entries in key order', () => {
    const map = new AVLMap3<number, string>();
    map.set(3, 'three');
    map.set(1, 'one');
    map.set(2, 'two');
    expect(map.entries()).toEqual([[1, 'one'], [2, 'two'], [3, 'three']]);
  });

  it('returns empty arrays for empty map', () => {
    const map = new AVLMap3<number, string>();
    expect(map.keys()).toEqual([]);
    expect(map.values()).toEqual([]);
    expect(map.entries()).toEqual([]);
  });
});

// ─── forEach() ───

describe('AVLMap3 forEach', () => {
  it('iterates in sorted order', () => {
    const map = new AVLMap3<number, string>();
    map.set(3, 'three');
    map.set(1, 'one');
    map.set(2, 'two');
    const result: string[] = [];
    map.forEach((_key, value) => result.push(value));
    expect(result).toEqual(['one', 'two', 'three']);
  });

  it('does not call callback for empty map', () => {
    const map = new AVLMap3<number, string>();
    const result: string[] = [];
    map.forEach((_key, value) => result.push(value));
    expect(result).toEqual([]);
  });
});

// ─── Stress / edge cases ───

describe('AVLMap3 stress and edge cases', () => {
  it('handles sequential insertions maintaining sorted order', () => {
    const map = new AVLMap3<number, number>();
    for (let i = 0; i < 50; i++) {
      map.set(i, i * 10);
    }
    expect(map.size).toBe(50);
    expect(map.keys()).toEqual(Array.from({ length: 50 }, (_, i) => i));
  });

  it('handles reverse sequential insertions', () => {
    const map = new AVLMap3<number, number>();
    for (let i = 49; i >= 0; i--) {
      map.set(i, i * 10);
    }
    expect(map.size).toBe(50);
    expect(map.keys()).toEqual(Array.from({ length: 50 }, (_, i) => i));
  });

  it('handles string keys with custom comparator', () => {
    const map = new AVLMap3<string, number>((a, b) => a.localeCompare(b));
    map.set('banana', 2);
    map.set('apple', 1);
    map.set('cherry', 3);
    expect(map.keys()).toEqual(['apple', 'banana', 'cherry']);
  });
});
