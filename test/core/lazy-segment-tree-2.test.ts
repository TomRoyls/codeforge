import { describe, it, expect } from 'vitest';
import { LazySegmentTree } from '../../src/core/lazy-segment-tree-2/index.js';

describe('LazySegmentTree', () => {
  // ─── Constructor ───

  describe('constructor', () => {
    it('builds tree from an array', () => {
      const st = new LazySegmentTree([1, 2, 3, 4, 5]);
      expect(st.getSize()).toBe(5);
    });

    it('builds tree from single element', () => {
      const st = new LazySegmentTree([42]);
      expect(st.getSize()).toBe(1);
      expect(st.pointQuery(0)).toBe(42);
    });

    it('builds tree from two elements', () => {
      const st = new LazySegmentTree([10, 20]);
      expect(st.rangeQuery(0, 1)).toBe(30);
    });

    it('handles zero values', () => {
      const st = new LazySegmentTree([0, 0, 0]);
      expect(st.rangeQuery(0, 2)).toBe(0);
    });

    it('handles negative values', () => {
      const st = new LazySegmentTree([-1, -2, -3]);
      expect(st.rangeQuery(0, 2)).toBe(-6);
    });

    it('handles mixed positive and negative values', () => {
      const st = new LazySegmentTree([-5, 10, -3, 8]);
      expect(st.rangeQuery(0, 3)).toBe(10);
    });
  });

  // ─── rangeQuery ───

  describe('rangeQuery', () => {
    it('returns sum of entire range', () => {
      const st = new LazySegmentTree([1, 2, 3, 4, 5]);
      expect(st.rangeQuery(0, 4)).toBe(15);
    });

    it('returns sum of partial range', () => {
      const st = new LazySegmentTree([1, 2, 3, 4, 5]);
      expect(st.rangeQuery(1, 3)).toBe(9);
    });

    it('returns single element for point range', () => {
      const st = new LazySegmentTree([1, 2, 3, 4, 5]);
      expect(st.rangeQuery(2, 2)).toBe(3);
    });

    it('returns first element', () => {
      const st = new LazySegmentTree([10, 20, 30]);
      expect(st.rangeQuery(0, 0)).toBe(10);
    });

    it('returns last element', () => {
      const st = new LazySegmentTree([10, 20, 30]);
      expect(st.rangeQuery(2, 2)).toBe(30);
    });

    it('returns 0 for out-of-range query (entirely left)', () => {
      const st = new LazySegmentTree([1, 2, 3]);
      expect(st.rangeQuery(-1, -1)).toBe(0);
    });

    it('returns 0 for out-of-range query (entirely right)', () => {
      const st = new LazySegmentTree([1, 2, 3]);
      expect(st.rangeQuery(5, 6)).toBe(0);
    });
  });

  // ─── pointQuery ───

  describe('pointQuery', () => {
    it('returns value at given index', () => {
      const st = new LazySegmentTree([10, 20, 30, 40]);
      expect(st.pointQuery(0)).toBe(10);
      expect(st.pointQuery(1)).toBe(20);
      expect(st.pointQuery(2)).toBe(30);
      expect(st.pointQuery(3)).toBe(40);
    });
  });

  // ─── rangeUpdate ───

  describe('rangeUpdate', () => {
    it('adds value to entire range', () => {
      const st = new LazySegmentTree([1, 2, 3, 4, 5]);
      st.rangeUpdate(0, 4, 10);
      expect(st.toArray()).toEqual([11, 12, 13, 14, 15]);
    });

    it('adds value to partial range', () => {
      const st = new LazySegmentTree([1, 2, 3, 4, 5]);
      st.rangeUpdate(1, 3, 5);
      expect(st.pointQuery(0)).toBe(1);
      expect(st.pointQuery(1)).toBe(7);
      expect(st.pointQuery(2)).toBe(8);
      expect(st.pointQuery(3)).toBe(9);
      expect(st.pointQuery(4)).toBe(5);
    });

    it('adds value to single element', () => {
      const st = new LazySegmentTree([1, 2, 3]);
      st.rangeUpdate(1, 1, 100);
      expect(st.pointQuery(1)).toBe(102);
    });

    it('handles negative updates', () => {
      const st = new LazySegmentTree([10, 20, 30]);
      st.rangeUpdate(0, 2, -5);
      expect(st.toArray()).toEqual([5, 15, 25]);
    });

    it('supports multiple updates', () => {
      const st = new LazySegmentTree([0, 0, 0, 0]);
      st.rangeUpdate(0, 3, 1);
      st.rangeUpdate(1, 2, 2);
      expect(st.toArray()).toEqual([1, 3, 3, 1]);
    });

    it('affects rangeQuery sum after update', () => {
      const st = new LazySegmentTree([1, 2, 3, 4]);
      st.rangeUpdate(0, 3, 10);
      expect(st.rangeQuery(0, 3)).toBe(50);
    });
  });

  // ─── pointUpdate ───

  describe('pointUpdate', () => {
    it('sets a new value at given index', () => {
      const st = new LazySegmentTree([1, 2, 3, 4, 5]);
      st.pointUpdate(2, 100);
      expect(st.pointQuery(2)).toBe(100);
    });

    it('updates first element', () => {
      const st = new LazySegmentTree([1, 2, 3]);
      st.pointUpdate(0, 99);
      expect(st.pointQuery(0)).toBe(99);
    });

    it('updates last element', () => {
      const st = new LazySegmentTree([1, 2, 3]);
      st.pointUpdate(2, 99);
      expect(st.pointQuery(2)).toBe(99);
    });

    it('preserves other elements', () => {
      const st = new LazySegmentTree([10, 20, 30, 40]);
      st.pointUpdate(1, 200);
      expect(st.pointQuery(0)).toBe(10);
      expect(st.pointQuery(2)).toBe(30);
      expect(st.pointQuery(3)).toBe(40);
    });
  });

  // ─── toArray ───

  describe('toArray', () => {
    it('returns original array', () => {
      const arr = [1, 2, 3, 4, 5];
      const st = new LazySegmentTree(arr);
      expect(st.toArray()).toEqual(arr);
    });

    it('reflects updates', () => {
      const st = new LazySegmentTree([1, 2, 3]);
      st.rangeUpdate(0, 2, 10);
      expect(st.toArray()).toEqual([11, 12, 13]);
    });
  });

  // ─── getSize ───

  describe('getSize', () => {
    it('returns array length', () => {
      expect(new LazySegmentTree([1, 2, 3]).getSize()).toBe(3);
      expect(new LazySegmentTree([1]).getSize()).toBe(1);
    });
  });

  // ─── getTimeComplexity ───

  describe('getTimeComplexity', () => {
    it('returns complexity string', () => {
      const st = new LazySegmentTree([1]);
      const tc = st.getTimeComplexity();
      expect(tc).toContain('O(log n)');
      expect(tc).toContain('Query');
      expect(tc).toContain('Update');
      expect(tc).toContain('Build');
    });
  });

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('handles single element with range update', () => {
      const st = new LazySegmentTree([5]);
      st.rangeUpdate(0, 0, 10);
      expect(st.pointQuery(0)).toBe(15);
    });

    it('handles point update to zero', () => {
      const st = new LazySegmentTree([5, 10, 15]);
      st.pointUpdate(1, 0);
      expect(st.pointQuery(1)).toBe(0);
      expect(st.rangeQuery(0, 2)).toBe(20);
    });

    it('handles large range update on small array', () => {
      const st = new LazySegmentTree([1, 2]);
      st.rangeUpdate(0, 1, 100);
      expect(st.toArray()).toEqual([101, 102]);
    });
  });
});
