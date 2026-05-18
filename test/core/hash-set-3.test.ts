import { describe, it, expect } from 'vitest';
import { HashSet3 } from '../../src/core/hash-set-3/index.js';

describe('HashSet3', () => {
  // ─── Constructor ───

  describe('constructor', () => {
    it('creates empty set with defaults', () => {
      const set = new HashSet3<string>();
      expect(set.size).toBe(0);
      expect(set.isEmpty()).toBe(true);
    });

    it('accepts custom capacity', () => {
      const set = new HashSet3<string>(32);
      expect(set.size).toBe(0);
    });

    it('handles small capacity by rounding to power of 2', () => {
      const set = new HashSet3<string>(3);
      expect(set.size).toBe(0);
    });
  });

  // ─── add ───

  describe('add', () => {
    it('adds a value and returns true', () => {
      const set = new HashSet3<string>();
      expect(set.add('a')).toBe(true);
      expect(set.size).toBe(1);
    });

    it('returns false for duplicate', () => {
      const set = new HashSet3<string>();
      set.add('a');
      expect(set.add('a')).toBe(false);
      expect(set.size).toBe(1);
    });

    it('adds multiple distinct values', () => {
      const set = new HashSet3<string>();
      set.add('a');
      set.add('b');
      set.add('c');
      expect(set.size).toBe(3);
    });
  });

  // ─── has ───

  describe('has', () => {
    it('returns true for existing value', () => {
      const set = new HashSet3<string>();
      set.add('x');
      expect(set.has('x')).toBe(true);
    });

    it('returns false for missing value', () => {
      const set = new HashSet3<string>();
      expect(set.has('x')).toBe(false);
    });

    it('returns false after value removed', () => {
      const set = new HashSet3<string>();
      set.add('x');
      set.delete('x');
      expect(set.has('x')).toBe(false);
    });
  });

  // ─── delete ───

  describe('delete', () => {
    it('deletes existing value and returns true', () => {
      const set = new HashSet3<string>();
      set.add('a');
      expect(set.delete('a')).toBe(true);
      expect(set.size).toBe(0);
    });

    it('returns false for missing value', () => {
      const set = new HashSet3<string>();
      expect(set.delete('missing')).toBe(false);
    });

    it('only deletes the specified value', () => {
      const set = new HashSet3<string>();
      set.add('a');
      set.add('b');
      set.delete('a');
      expect(set.has('a')).toBe(false);
      expect(set.has('b')).toBe(true);
      expect(set.size).toBe(1);
    });
  });

  // ─── size / isEmpty ───

  describe('size / isEmpty', () => {
    it('tracks size', () => {
      const set = new HashSet3<string>();
      expect(set.isEmpty()).toBe(true);
      set.add('a');
      expect(set.size).toBe(1);
      set.add('b');
      expect(set.size).toBe(2);
      set.delete('a');
      expect(set.size).toBe(1);
    });
  });

  // ─── clear ───

  describe('clear', () => {
    it('removes all values', () => {
      const set = new HashSet3<string>();
      set.add('a');
      set.add('b');
      set.clear();
      expect(set.size).toBe(0);
      expect(set.isEmpty()).toBe(true);
    });
  });

  // ─── toArray ───

  describe('toArray', () => {
    it('returns array of all values', () => {
      const set = new HashSet3<string>();
      set.add('a');
      set.add('b');
      const arr = set.toArray();
      expect(arr.sort()).toEqual(['a', 'b']);
    });

    it('returns empty array for empty set', () => {
      const set = new HashSet3<string>();
      expect(set.toArray()).toEqual([]);
    });
  });

  // ─── forEach ───

  describe('forEach', () => {
    it('iterates all values', () => {
      const set = new HashSet3<string>();
      set.add('a');
      set.add('b');
      const collected: string[] = [];
      set.forEach((v) => collected.push(v));
      expect(collected.sort()).toEqual(['a', 'b']);
    });

    it('passes the set as second arg', () => {
      const set = new HashSet3<string>();
      set.add('x');
      let received: HashSet3<string> | null = null;
      set.forEach((_v, s) => { received = s; });
      expect(received).toBe(set);
    });
  });

  // ─── Iterator ───

  describe('Symbol.iterator', () => {
    it('is iterable', () => {
      const set = new HashSet3<string>();
      set.add('a');
      set.add('b');
      const collected = [...set];
      expect(collected.sort()).toEqual(['a', 'b']);
    });
  });

  // ─── union ───

  describe('union', () => {
    it('returns union of two sets', () => {
      const a = new HashSet3<string>();
      a.add('1');
      a.add('2');
      const b = new HashSet3<string>();
      b.add('2');
      b.add('3');
      const u = a.union(b);
      expect(u.toArray().sort()).toEqual(['1', '2', '3']);
    });

    it('returns copy when no overlap', () => {
      const a = new HashSet3<string>();
      a.add('a');
      const b = new HashSet3<string>();
      b.add('b');
      const u = a.union(b);
      expect(u.toArray().sort()).toEqual(['a', 'b']);
    });
  });

  // ─── intersection ───

  describe('intersection', () => {
    it('returns common elements', () => {
      const a = new HashSet3<string>();
      a.add('1');
      a.add('2');
      a.add('3');
      const b = new HashSet3<string>();
      b.add('2');
      b.add('3');
      b.add('4');
      const i = a.intersection(b);
      expect(i.toArray().sort()).toEqual(['2', '3']);
    });

    it('returns empty for no overlap', () => {
      const a = new HashSet3<string>();
      a.add('a');
      const b = new HashSet3<string>();
      b.add('b');
      expect(a.intersection(b).size).toBe(0);
    });
  });

  // ─── difference ───

  describe('difference', () => {
    it('returns elements in a not in b', () => {
      const a = new HashSet3<string>();
      a.add('1');
      a.add('2');
      a.add('3');
      const b = new HashSet3<string>();
      b.add('2');
      b.add('4');
      const d = a.difference(b);
      expect(d.toArray().sort()).toEqual(['1', '3']);
    });
  });

  // ─── isSubsetOf ───

  describe('isSubsetOf', () => {
    it('returns true for subset', () => {
      const a = new HashSet3<string>();
      a.add('1');
      a.add('2');
      const b = new HashSet3<string>();
      b.add('1');
      b.add('2');
      b.add('3');
      expect(a.isSubsetOf(b)).toBe(true);
    });

    it('returns false when not subset', () => {
      const a = new HashSet3<string>();
      a.add('1');
      a.add('4');
      const b = new HashSet3<string>();
      b.add('1');
      b.add('2');
      b.add('3');
      expect(a.isSubsetOf(b)).toBe(false);
    });

    it('returns true for empty set', () => {
      const a = new HashSet3<string>();
      const b = new HashSet3<string>();
      b.add('1');
      expect(a.isSubsetOf(b)).toBe(true);
    });

    it('returns false when a is larger than b', () => {
      const a = new HashSet3<string>();
      a.add('1');
      a.add('2');
      a.add('3');
      const b = new HashSet3<string>();
      b.add('1');
      expect(a.isSubsetOf(b)).toBe(false);
    });
  });

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('handles numeric values', () => {
      const set = new HashSet3<number>();
      set.add(1);
      set.add(2);
      set.add(3);
      expect(set.size).toBe(3);
      expect(set.has(2)).toBe(true);
      expect(set.has(4)).toBe(false);
    });

    it('handles many values', () => {
      const set = new HashSet3<string>(128);
      for (let i = 0; i < 50; i++) {
        set.add(`val_${i}`);
      }
      expect(set.size).toBe(50);
      for (let i = 0; i < 50; i++) {
        expect(set.has(`val_${i}`)).toBe(true);
      }
    });

    it('handles negative numbers', () => {
      const set = new HashSet3<number>();
      set.add(-1);
      set.add(-2);
      expect(set.has(-1)).toBe(true);
      expect(set.has(-2)).toBe(true);
    });

    it('handles empty string', () => {
      const set = new HashSet3<string>();
      set.add('');
      expect(set.has('')).toBe(true);
    });
  });
});
