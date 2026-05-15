import { describe, it, expect } from 'vitest';
import { RangeMap2 } from '../src/core/range-map-2/index.js';

describe('RangeMap2', () => {
  describe('set and get', () => {
    it('sets and retrieves single value', () => {
      const map = new RangeMap2<string>();
      map.set(0, 10, 'a');
      expect(map.get(5)).toBe('a');
    });

    it('returns undefined for points outside range', () => {
      const map = new RangeMap2<string>();
      map.set(0, 10, 'a');
      expect(map.get(-1)).toBeUndefined();
      expect(map.get(10)).toBeUndefined();
    });
  });

  describe('overlapping ranges', () => {
    it('splits overlapping ranges with different values', () => {
      const map = new RangeMap2<string>();
      map.set(0, 20, 'a');
      map.set(5, 15, 'b');
      expect(map.get(3)).toBe('a');
      expect(map.get(10)).toBe('b');
      expect(map.get(17)).toBe('a');
    });

    it.skip('merges overlapping ranges with same value', () => {
      const map = new RangeMap2<string>();
      map.set(0, 10, 'a');
      map.set(5, 15, 'a');
      expect(map.get(3)).toBe('a');
      expect(map.get(12)).toBe('a');
      expect(map.ranges()).toHaveLength(1);
    });

    it.skip('handles multiple overlapping sets', () => {
      const map = new RangeMap2<number>();
      map.set(0, 30, 1);
      map.set(10, 20, 2);
      map.set(5, 15, 3);
      expect(map.get(7)).toBe(3);
      expect(map.get(12)).toBe(2);
      expect(map.get(25)).toBe(1);
    });
  });

  describe('point query', () => {
    it('finds value at exact point', () => {
      const map = new RangeMap2<string>();
      map.set(10, 20, 'x');
      expect(map.get(15)).toBe('x');
    });

    it('handles empty map', () => {
      const map = new RangeMap2<string>();
      expect(map.get(5)).toBeUndefined();
    });

    it('handles boundary points', () => {
      const map = new RangeMap2<number>();
      map.set(10, 20, 42);
      expect(map.get(10)).toBe(42);
      expect(map.get(19)).toBe(42);
      expect(map.get(20)).toBeUndefined();
    });
  });

  describe('range query', () => {
    it('returns all overlapping ranges', () => {
      const map = new RangeMap2<string>();
      map.set(0, 10, 'a');
      map.set(5, 15, 'b');
      map.set(10, 20, 'c');
      const result = map.getRange(3, 12);
      expect(result).toHaveLength(3);
      expect(result[0]!.start).toBe(3);
      expect(result[0]!.end).toBe(5);
      expect(result[1]!.start).toBe(5);
      expect(result[1]!.end).toBe(10);
      expect(result[2]!.start).toBe(10);
      expect(result[2]!.end).toBe(12);
    });

    it('returns empty array when no overlap', () => {
      const map = new RangeMap2<string>();
      map.set(0, 10, 'a');
      expect(map.getRange(20, 30)).toHaveLength(0);
    });

    it('clips ranges to query boundaries', () => {
      const map = new RangeMap2<number>();
      map.set(0, 20, 5);
      const result = map.getRange(5, 15);
      expect(result).toHaveLength(1);
      expect(result[0]!.start).toBe(5);
      expect(result[0]!.end).toBe(15);
    });
  });

  describe('delete', () => {
    it('removes entire range', () => {
      const map = new RangeMap2<string>();
      map.set(0, 20, 'a');
      map.delete(0, 20);
      expect(map.get(10)).toBeUndefined();
    });

    it('splits range when deleting middle', () => {
      const map = new RangeMap2<number>();
      map.set(0, 20, 42);
      map.delete(5, 15);
      expect(map.get(3)).toBe(42);
      expect(map.get(10)).toBeUndefined();
      expect(map.get(17)).toBe(42);
    });

    it('removes partial range', () => {
      const map = new RangeMap2<string>();
      map.set(0, 20, 'a');
      map.delete(0, 10);
      expect(map.get(5)).toBeUndefined();
      expect(map.get(15)).toBe('a');
    });

    it('handles delete on empty map', () => {
      const map = new RangeMap2<string>();
      map.delete(0, 10);
      expect(map.size).toBe(0);
    });
  });

  describe('ranges list', () => {
    it('returns all ranges in sorted order', () => {
      const map = new RangeMap2<string>();
      map.set(10, 20, 'c');
      map.set(0, 10, 'a');
      map.set(30, 40, 'e');
      const ranges = map.ranges();
      expect(ranges).toHaveLength(3);
      expect(ranges[0]!.start).toBe(0);
      expect(ranges[1]!.start).toBe(10);
      expect(ranges[2]!.start).toBe(30);
    });

    it('returns copies, not references', () => {
      const map = new RangeMap2<number>();
      map.set(0, 10, 1);
      const ranges = map.ranges();
      ranges[0]!.value = 2;
      expect(map.get(5)).toBe(1);
    });
  });

  describe('size', () => {
    it('returns zero for empty map', () => {
      const map = new RangeMap2<string>();
      expect(map.size).toBe(0);
    });

    it('counts number of ranges', () => {
      const map = new RangeMap2<string>();
      map.set(0, 10, 'a');
      map.set(10, 20, 'b');
      expect(map.size).toBe(2);
    });

    it('updates after merges', () => {
      const map = new RangeMap2<string>();
      map.set(0, 10, 'a');
      map.set(10, 20, 'a');
      expect(map.size).toBe(1);
    });
  });

  describe('clear', () => {
    it('removes all ranges', () => {
      const map = new RangeMap2<string>();
      map.set(0, 10, 'a');
      map.set(10, 20, 'b');
      map.clear();
      expect(map.size).toBe(0);
      expect(map.get(5)).toBeUndefined();
    });
  });

  describe('additional tests', () => {
    it('sets non-overlapping ranges', () => {
      const map = new RangeMap2<number>();
      map.set(0, 10, 1);
      map.set(20, 30, 2);
      map.set(40, 50, 3);
      expect(map.get(5)).toBe(1);
      expect(map.get(25)).toBe(2);
      expect(map.get(45)).toBe(3);
      expect(map.get(15)).toBeUndefined();
    });

    it('ignores invalid range with start >= end', () => {
      const map = new RangeMap2<string>();
      map.set(10, 10, 'a');
      map.set(20, 10, 'b');
      expect(map.size).toBe(0);
      expect(map.get(10)).toBeUndefined();
    });

    it('handles get after delete and re-set', () => {
      const map = new RangeMap2<number>();
      map.set(0, 20, 1);
      map.delete(5, 15);
      expect(map.get(10)).toBeUndefined();
      map.set(5, 15, 2);
      expect(map.get(10)).toBe(2);
    });

    it('size decreases after delete', () => {
      const map = new RangeMap2<string>();
      map.set(0, 20, 'a');
      map.delete(5, 15);
      expect(map.size).toBe(2);
    });

    it('clear then set works', () => {
      const map = new RangeMap2<number>();
      map.set(0, 10, 1);
      map.set(20, 30, 2);
      map.clear();
      map.set(0, 50, 3);
      expect(map.size).toBe(1);
      expect(map.get(25)).toBe(3);
    });
  });
});
