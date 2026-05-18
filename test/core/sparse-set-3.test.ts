import { describe, it, expect } from 'vitest';
import { SparseSet3 } from '../../src/core/sparse-set-3/index.js';

// ─── Constructor ───

describe('SparseSet3', () => {
  describe('constructor', () => {
    it('creates a set with the given universe size', () => {
      const s = new SparseSet3(10);
      expect(s.size).toBe(0);
      expect(s.isEmpty).toBe(true);
    });

    it('throws for negative universe size', () => {
      expect(() => new SparseSet3(-1)).toThrow('Universe size must be non-negative');
    });

    it('accepts universe size of 0', () => {
      const s = new SparseSet3(0);
      expect(s.size).toBe(0);
    });
  });

  // ─── add ───

  describe('add', () => {
    it('adds a value and returns true', () => {
      const s = new SparseSet3(10);
      expect(s.add(5)).toBe(true);
      expect(s.has(5)).toBe(true);
      expect(s.size).toBe(1);
    });

    it('returns false for duplicate add', () => {
      const s = new SparseSet3(10);
      s.add(3);
      expect(s.add(3)).toBe(false);
      expect(s.size).toBe(1);
    });

    it('throws for negative value', () => {
      const s = new SparseSet3(10);
      expect(() => s.add(-1)).toThrow('Value must be non-negative and less than universe size (10)');
    });

    it('throws for value >= universe size', () => {
      const s = new SparseSet3(5);
      expect(() => s.add(5)).toThrow();
      expect(() => s.add(10)).toThrow();
    });

    it('adds 0 as a valid value', () => {
      const s = new SparseSet3(5);
      expect(s.add(0)).toBe(true);
      expect(s.has(0)).toBe(true);
    });
  });

  // ─── delete ───

  describe('delete', () => {
    it('deletes an existing value and returns true', () => {
      const s = new SparseSet3(10);
      s.add(3);
      expect(s.delete(3)).toBe(true);
      expect(s.has(3)).toBe(false);
      expect(s.size).toBe(0);
    });

    it('returns false for non-existent value', () => {
      const s = new SparseSet3(10);
      expect(s.delete(5)).toBe(false);
    });

    it('returns false for negative value', () => {
      const s = new SparseSet3(10);
      expect(s.delete(-1)).toBe(false);
    });

    it('returns false for value >= universe size', () => {
      const s = new SparseSet3(5);
      expect(s.delete(5)).toBe(false);
    });

    it('handles swap-on-delete correctly', () => {
      const s = new SparseSet3(10);
      s.add(1);
      s.add(2);
      s.add(3);
      s.delete(2);
      expect(s.has(1)).toBe(true);
      expect(s.has(2)).toBe(false);
      expect(s.has(3)).toBe(true);
      expect(s.size).toBe(2);
    });
  });

  // ─── has / contains ───

  describe('has and contains', () => {
    it('returns false for values not in the set', () => {
      const s = new SparseSet3(10);
      expect(s.has(0)).toBe(false);
    });

    it('returns true for values in the set', () => {
      const s = new SparseSet3(10);
      s.add(7);
      expect(s.has(7)).toBe(true);
      expect(s.contains(7)).toBe(true);
    });

    it('returns false for negative values', () => {
      const s = new SparseSet3(10);
      expect(s.has(-1)).toBe(false);
    });

    it('returns false for out-of-range values', () => {
      const s = new SparseSet3(5);
      expect(s.has(5)).toBe(false);
    });
  });

  // ─── clear ───

  describe('clear', () => {
    it('removes all elements', () => {
      const s = new SparseSet3(10);
      s.add(1);
      s.add(2);
      s.add(3);
      s.clear();
      expect(s.size).toBe(0);
      expect(s.isEmpty).toBe(true);
      expect(s.has(1)).toBe(false);
      expect(s.has(2)).toBe(false);
      expect(s.has(3)).toBe(false);
    });

    it('can add after clear', () => {
      const s = new SparseSet3(10);
      s.add(1);
      s.clear();
      expect(s.add(1)).toBe(true);
      expect(s.size).toBe(1);
    });
  });

  // ─── forEach ───

  describe('forEach', () => {
    it('iterates over all elements', () => {
      const s = new SparseSet3(10);
      s.add(3);
      s.add(7);
      s.add(1);
      const collected: number[] = [];
      s.forEach((v) => collected.push(v));
      expect(collected.sort()).toEqual([1, 3, 7]);
    });

    it('does not call callback for empty set', () => {
      const s = new SparseSet3(10);
      let calls = 0;
      s.forEach(() => calls++);
      expect(calls).toBe(0);
    });
  });

  // ─── filter ───

  describe('filter', () => {
    it('filters elements by predicate', () => {
      const s = new SparseSet3(10);
      s.add(1);
      s.add(2);
      s.add(3);
      s.add(4);
      const evens = s.filter((v) => v % 2 === 0);
      expect(evens.toArray().sort()).toEqual([2, 4]);
    });

    it('returns empty set when no elements match', () => {
      const s = new SparseSet3(10);
      s.add(1);
      s.add(3);
      const evens = s.filter((v) => v % 2 === 0);
      expect(evens.size).toBe(0);
    });
  });

  // ─── map ───

  describe('map', () => {
    it('maps values to new array', () => {
      const s = new SparseSet3(10);
      s.add(1);
      s.add(2);
      s.add(3);
      const doubled = s.map((v) => v * 2);
      expect(doubled.sort()).toEqual([2, 4, 6]);
    });

    it('maps to different types', () => {
      const s = new SparseSet3(10);
      s.add(1);
      s.add(2);
      const strings = s.map((v) => `v${v}`);
      expect(strings.sort()).toEqual(['v1', 'v2']);
    });
  });

  // ─── reduce ───

  describe('reduce', () => {
    it('sums all values', () => {
      const s = new SparseSet3(10);
      s.add(1);
      s.add(2);
      s.add(3);
      const sum = s.reduce((acc, v) => acc + v, 0);
      expect(sum).toBe(6);
    });

    it('returns initial value for empty set', () => {
      const s = new SparseSet3(10);
      expect(s.reduce((acc, v) => acc + v, 42)).toBe(42);
    });
  });

  // ─── toArray ───

  describe('toArray', () => {
    it('returns empty array for empty set', () => {
      const s = new SparseSet3(10);
      expect(s.toArray()).toEqual([]);
    });

    it('returns array of elements', () => {
      const s = new SparseSet3(10);
      s.add(5);
      s.add(2);
      expect(s.toArray()).toEqual([5, 2]);
    });
  });

  // ─── bulkInsert ───

  describe('bulkInsert', () => {
    it('inserts multiple valid values', () => {
      const s = new SparseSet3(10);
      s.bulkInsert([1, 2, 3]);
      expect(s.size).toBe(3);
      expect(s.has(1)).toBe(true);
      expect(s.has(2)).toBe(true);
      expect(s.has(3)).toBe(true);
    });

    it('ignores duplicates', () => {
      const s = new SparseSet3(10);
      s.bulkInsert([1, 1, 2]);
      expect(s.size).toBe(2);
    });

    it('skips out-of-range values', () => {
      const s = new SparseSet3(5);
      s.bulkInsert([0, 3, 5, -1]);
      expect(s.size).toBe(2);
      expect(s.has(0)).toBe(true);
      expect(s.has(3)).toBe(true);
    });

    it('handles empty input array', () => {
      const s = new SparseSet3(10);
      s.bulkInsert([]);
      expect(s.size).toBe(0);
    });
  });

  // ─── union ───

  describe('union', () => {
    it('unites two non-overlapping sets', () => {
      const a = new SparseSet3(10);
      a.add(1);
      a.add(2);
      const b = new SparseSet3(10);
      b.add(3);
      b.add(4);
      const u = a.union(b);
      expect(u.size).toBe(4);
      expect(u.has(1)).toBe(true);
      expect(u.has(4)).toBe(true);
    });

    it('deduplicates overlapping elements', () => {
      const a = new SparseSet3(10);
      a.add(1);
      a.add(2);
      const b = new SparseSet3(10);
      b.add(2);
      b.add(3);
      const u = a.union(b);
      expect(u.size).toBe(3);
    });

    it('throws for different universe sizes', () => {
      const a = new SparseSet3(10);
      const b = new SparseSet3(5);
      expect(() => a.union(b)).toThrow('Cannot union sets with different universe sizes');
    });

    it('union with empty set returns copy', () => {
      const a = new SparseSet3(10);
      a.add(1);
      const b = new SparseSet3(10);
      const u = a.union(b);
      expect(u.size).toBe(1);
    });
  });

  // ─── intersection ───

  describe('intersection', () => {
    it('intersects two sets', () => {
      const a = new SparseSet3(10);
      a.add(1);
      a.add(2);
      a.add(3);
      const b = new SparseSet3(10);
      b.add(2);
      b.add(3);
      b.add(4);
      const i = a.intersection(b);
      expect(i.size).toBe(2);
      expect(i.has(2)).toBe(true);
      expect(i.has(3)).toBe(true);
    });

    it('returns empty for disjoint sets', () => {
      const a = new SparseSet3(10);
      a.add(1);
      const b = new SparseSet3(10);
      b.add(2);
      expect(a.intersection(b).size).toBe(0);
    });

    it('throws for different universe sizes', () => {
      const a = new SparseSet3(10);
      const b = new SparseSet3(5);
      expect(() => a.intersection(b)).toThrow('Cannot intersect sets with different universe sizes');
    });
  });

  // ─── difference ───

  describe('difference', () => {
    it('computes set difference', () => {
      const a = new SparseSet3(10);
      a.add(1);
      a.add(2);
      a.add(3);
      const b = new SparseSet3(10);
      b.add(2);
      const d = a.difference(b);
      expect(d.size).toBe(2);
      expect(d.has(1)).toBe(true);
      expect(d.has(3)).toBe(true);
    });

    it('returns full set when other is empty', () => {
      const a = new SparseSet3(10);
      a.add(1);
      a.add(2);
      const b = new SparseSet3(10);
      expect(a.difference(b).size).toBe(2);
    });

    it('throws for different universe sizes', () => {
      const a = new SparseSet3(10);
      const b = new SparseSet3(5);
      expect(() => a.difference(b)).toThrow('Cannot compute difference of sets with different universe sizes');
    });
  });

  // ─── getTimeComplexity ───

  describe('getTimeComplexity', () => {
    it('returns complexity info for all operations', () => {
      const s = new SparseSet3(10);
      const info = s.getTimeComplexity();
      expect(info.length).toBeGreaterThan(0);
      const addInfo = info.find((i) => i.operation === 'add');
      expect(addInfo).toBeDefined();
      expect(addInfo!.complexity).toBe('O(1)');
    });
  });

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('handles single element add/delete cycle', () => {
      const s = new SparseSet3(10);
      s.add(5);
      expect(s.size).toBe(1);
      s.delete(5);
      expect(s.size).toBe(0);
      expect(s.isEmpty).toBe(true);
      expect(s.add(5)).toBe(true);
    });

    it('handles universe size 0', () => {
      const s = new SparseSet3(0);
      expect(s.size).toBe(0);
      expect(s.isEmpty).toBe(true);
      expect(s.toArray()).toEqual([]);
    });

    it('handles adding and removing all values in universe', () => {
      const s = new SparseSet3(5);
      for (let i = 0; i < 5; i++) s.add(i);
      expect(s.size).toBe(5);
      for (let i = 0; i < 5; i++) s.delete(i);
      expect(s.size).toBe(0);
      expect(s.isEmpty).toBe(true);
    });

    it('does not mutate original set in set operations', () => {
      const a = new SparseSet3(10);
      a.add(1);
      a.add(2);
      const b = new SparseSet3(10);
      b.add(2);
      b.add(3);
      a.union(b);
      a.intersection(b);
      a.difference(b);
      expect(a.size).toBe(2);
      expect(a.has(1)).toBe(true);
      expect(a.has(2)).toBe(true);
    });
  });
});
