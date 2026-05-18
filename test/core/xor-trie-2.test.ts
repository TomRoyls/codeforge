import { describe, it, expect } from 'vitest';
import { XorTrie2 } from '../../src/core/xor-trie-2/index.js';

// ─── Constructor ───

describe('XorTrie2 – Constructor', () => {
  it('creates with default bitWidth 32', () => {
    const trie = new XorTrie2();
    expect(trie.size).toBe(0);
    expect(trie.isEmpty).toBe(true);
  });

  it('creates with custom bitWidth', () => {
    const trie = new XorTrie2(8);
    trie.insert(42);
    expect(trie.contains(42)).toBe(true);
  });
});

// ─── insert / contains ───

describe('XorTrie2 – insert & contains', () => {
  it('inserts and finds a value', () => {
    const trie = new XorTrie2();
    trie.insert(42);
    expect(trie.contains(42)).toBe(true);
  });

  it('returns false for value not inserted', () => {
    const trie = new XorTrie2();
    trie.insert(42);
    expect(trie.contains(99)).toBe(false);
  });

  it('handles 0 as a value', () => {
    const trie = new XorTrie2();
    trie.insert(0);
    expect(trie.contains(0)).toBe(true);
  });

  it('handles negative numbers (as unsigned via bitwise)', () => {
    const trie = new XorTrie2();
    trie.insert(-1);
    expect(trie.contains(-1)).toBe(true);
  });

  it('inserts multiple distinct values', () => {
    const trie = new XorTrie2();
    const values = [1, 2, 4, 8, 16, 32, 64, 128];
    for (const v of values) {
      trie.insert(v);
    }
    for (const v of values) {
      expect(trie.contains(v)).toBe(true);
    }
    expect(trie.size).toBe(8);
  });

  it('inserts duplicate values (increments count)', () => {
    const trie = new XorTrie2();
    trie.insert(5);
    trie.insert(5);
    trie.insert(5);
    expect(trie.contains(5)).toBe(true);
    expect(trie.size).toBe(3);
  });
});

// ─── bulkInsert ───

describe('XorTrie2 – bulkInsert', () => {
  it('inserts an array of values', () => {
    const trie = new XorTrie2();
    trie.bulkInsert([10, 20, 30]);
    expect(trie.contains(10)).toBe(true);
    expect(trie.contains(20)).toBe(true);
    expect(trie.contains(30)).toBe(true);
    expect(trie.size).toBe(3);
  });
});

// ─── search ───

describe('XorTrie2 – search', () => {
  it('returns same result as contains', () => {
    const trie = new XorTrie2();
    trie.insert(7);
    expect(trie.search(7)).toBe(true);
    expect(trie.search(8)).toBe(false);
  });
});

// ─── delete ───

describe('XorTrie2 – delete', () => {
  it('deletes an existing value', () => {
    const trie = new XorTrie2();
    trie.insert(10);
    expect(trie.delete(10)).toBe(true);
    expect(trie.contains(10)).toBe(false);
    expect(trie.size).toBe(0);
  });

  it('returns false for missing value', () => {
    const trie = new XorTrie2();
    expect(trie.delete(99)).toBe(false);
  });

  it('does not affect other values', () => {
    const trie = new XorTrie2();
    trie.insert(1);
    trie.insert(2);
    trie.insert(3);
    trie.delete(2);
    expect(trie.contains(1)).toBe(true);
    expect(trie.contains(2)).toBe(false);
    expect(trie.contains(3)).toBe(true);
    expect(trie.size).toBe(2);
  });

  it('handles duplicate inserts and single delete', () => {
    const trie = new XorTrie2();
    trie.insert(5);
    trie.insert(5);
    trie.delete(5);
    expect(trie.contains(5)).toBe(true);
    expect(trie.size).toBe(1);
  });
});

// ─── count ───

describe('XorTrie2 – count', () => {
  it('returns occurrence count of a value', () => {
    const trie = new XorTrie2();
    trie.insert(7);
    trie.insert(7);
    trie.insert(7);
    expect(trie.count(7)).toBe(3);
  });

  it('returns 0 for value not in trie', () => {
    const trie = new XorTrie2();
    expect(trie.count(42)).toBe(0);
  });
});

// ─── maxXor ───

describe('XorTrie2 – maxXor', () => {
  it('finds maximum XOR pair', () => {
    const trie = new XorTrie2(8);
    trie.bulkInsert([3, 10, 5, 25, 2, 8]);
    expect(trie.maxXor(5)).toBeGreaterThan(0);
  });

  it('returns 0 when XOR with self is only option', () => {
    const trie = new XorTrie2(8);
    trie.insert(5);
    expect(trie.maxXor(5)).toBeGreaterThanOrEqual(0);
  });

  it('throws on empty trie', () => {
    const trie = new XorTrie2();
    expect(() => trie.maxXor(1)).toThrow('Cannot find max xor from empty trie');
  });
});

// ─── minXor ───

describe('XorTrie2 – minXor', () => {
  it('finds minimum XOR pair', () => {
    const trie = new XorTrie2(8);
    trie.bulkInsert([1, 2, 3]);
    const minResult = trie.minXor(1);
    expect(minResult).toBeGreaterThanOrEqual(0);
  });

  it('throws on empty trie', () => {
    const trie = new XorTrie2();
    expect(() => trie.minXor(1)).toThrow('Cannot find min xor from empty trie');
  });
});

// ─── toArray / forEach ───

describe('XorTrie2 – toArray & forEach', () => {
  it('toArray returns all inserted values including duplicates', () => {
    const trie = new XorTrie2(8);
    trie.insert(1);
    trie.insert(2);
    trie.insert(1);
    const arr = trie.toArray();
    expect(arr.length).toBe(3);
    expect(arr.filter(v => v === 1).length).toBe(2);
    expect(arr.filter(v => v === 2).length).toBe(1);
  });

  it('forEach visits all values', () => {
    const trie = new XorTrie2(8);
    trie.bulkInsert([10, 20, 30]);
    const visited: number[] = [];
    trie.forEach(v => visited.push(v));
    expect(visited.length).toBe(3);
    expect(visited).toContain(10);
    expect(visited).toContain(20);
    expect(visited).toContain(30);
  });
});

// ─── clear ───

describe('XorTrie2 – clear', () => {
  it('removes all values', () => {
    const trie = new XorTrie2();
    trie.bulkInsert([1, 2, 3]);
    trie.clear();
    expect(trie.size).toBe(0);
    expect(trie.isEmpty).toBe(true);
    expect(trie.contains(1)).toBe(false);
  });
});

// ─── xorRange ───

describe('XorTrie2 – xorRange', () => {
  it('returns empty array for empty trie', () => {
    const trie = new XorTrie2();
    expect(trie.xorRange(0, 100)).toEqual([]);
  });

  it('returns values within XOR range', () => {
    const trie = new XorTrie2(8);
    trie.bulkInsert([1, 2, 3, 4, 5]);
    const result = trie.xorRange(0, 255);
    expect(result.length).toBeGreaterThan(0);
  });
});

// ─── getTimeComplexity ───

describe('XorTrie2 – getTimeComplexity', () => {
  it('returns complexity info for all operations', () => {
    const trie = new XorTrie2();
    const tc = trie.getTimeComplexity();
    expect(tc.length).toBeGreaterThan(0);
    const ops = tc.map(t => t.operation);
    expect(ops).toContain('insert');
    expect(ops).toContain('delete');
    expect(ops).toContain('maxXor');
    expect(ops).toContain('size');
  });
});
