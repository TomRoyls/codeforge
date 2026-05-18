import { describe, it, expect } from 'vitest';
import { LazySegmentTree3 } from '../../src/core/lazy-segment-tree-3/index.js';

describe('LazySegmentTree3', () => {
  // ─── Constructor ───

  describe('constructor', () => {
    it('builds tree from an array', () => {
      const st = new LazySegmentTree3([1, 2, 3, 4, 5]);
      expect(st.size()).toBe(5);
    });

    it('builds tree from single element', () => {
      const st = new LazySegmentTree3([42]);
      expect(st.size()).toBe(1);
      expect(st.get(0)).toBe(42);
    });

    it('builds tree from two elements', () => {
      const st = new LazySegmentTree3([10, 20]);
      expect(st.rangeQuery(0, 1)).toBe(30);
    });

    it('handles zero values', () => {
      const st = new LazySegmentTree3([0, 0, 0]);
      expect(st.rangeQuery(0, 2)).toBe(0);
    });

    it('handles negative values', () => {
      const st = new LazySegmentTree3([-1, -2, -3]);
      expect(st.rangeQuery(0, 2)).toBe(-6);
    });

    it('handles mixed positive and negative values', () => {
      const st = new LazySegmentTree3([-5, 10, -3, 8]);
      expect(st.rangeQuery(0, 3)).toBe(10);
    });
  });

  // ─── rangeQuery ───

  describe('rangeQuery', () => {
    it('returns sum of entire range', () => {
      const st = new LazySegmentTree3([1, 2, 3, 4, 5]);
      expect(st.rangeQuery(0, 4)).toBe(15);
    });

    it('returns sum of partial range', () => {
      const st = new LazySegmentTree3([1, 2, 3, 4, 5]);
      expect(st.rangeQuery(1, 3)).toBe(9);
    });

    it('returns single element for point range', () => {
      const st = new LazySegmentTree3([1, 2, 3, 4, 5]);
      expect(st.rangeQuery(2, 2)).toBe(3);
    });

    it('returns first element', () => {
      const st = new LazySegmentTree3([10, 20, 30]);
      expect(st.rangeQuery(0, 0)).toBe(10);
    });

    it('returns last element', () => {
      const st = new LazySegmentTree3([10, 20, 30]);
      expect(st.rangeQuery(2, 2)).toBe(30);
    });

    it('returns 0 for out-of-range query entirely left', () => {
      const st = new LazySegmentTree3([1, 2, 3]);
      expect(st.rangeQuery(-1, -1)).toBe(0);
    });

    it('returns 0 for out-of-range query entirely right', () => {
      const st = new LazySegmentTree3([1, 2, 3]);
      expect(st.rangeQuery(5, 6)).toBe(0);
    });
  });

  // ─── get ───

  describe('get', () => {
    it('returns value at given index', () => {
      const st = new LazySegmentTree3([10, 20, 30, 40]);
      expect(st.get(0)).toBe(10);
      expect(st.get(1)).toBe(20);
      expect(st.get(2)).toBe(30);
      expect(st.get(3)).toBe(40);
    });
  });

  // ─── rangeUpdate ───

  describe('rangeUpdate', () => {
    it('adds delta to entire range', () => {
      const st = new LazySegmentTree3([1, 2, 3, 4, 5]);
      st.rangeUpdate(0, 4, 10);
      expect(st.get(0)).toBe(11);
      expect(st.get(4)).toBe(15);
    });

    it('adds delta to partial range', () => {
      const st = new LazySegmentTree3([1, 2, 3, 4, 5]);
      st.rangeUpdate(1, 3, 5);
      expect(st.get(0)).toBe(1);
      expect(st.get(1)).toBe(7);
      expect(st.get(2)).toBe(8);
      expect(st.get(3)).toBe(9);
      expect(st.get(4)).toBe(5);
    });

    it('adds delta to single element', () => {
      const st = new LazySegmentTree3([1, 2, 3]);
      st.rangeUpdate(1, 1, 100);
      expect(st.get(1)).toBe(102);
    });

    it('handles negative delta', () => {
      const st = new LazySegmentTree3([10, 20, 30]);
      st.rangeUpdate(0, 2, -5);
      expect(st.get(0)).toBe(5);
      expect(st.get(1)).toBe(15);
      expect(st.get(2)).toBe(25);
    });

    it('supports multiple updates', () => {
      const st = new LazySegmentTree3([0, 0, 0, 0]);
      st.rangeUpdate(0, 3, 1);
      st.rangeUpdate(1, 2, 2);
      expect(st.get(0)).toBe(1);
      expect(st.get(1)).toBe(3);
      expect(st.get(2)).toBe(3);
      expect(st.get(3)).toBe(1);
    });

    it('affects rangeQuery sum after update', () => {
      const st = new LazySegmentTree3([1, 2, 3, 4]);
      st.rangeUpdate(0, 3, 10);
      expect(st.rangeQuery(0, 3)).toBe(50);
    });
  });

  // ─── pointUpdate ───

  describe('pointUpdate', () => {
    it('sets a new value at given index', () => {
      const st = new LazySegmentTree3([1, 2, 3, 4, 5]);
      st.pointUpdate(2, 100);
      expect(st.get(2)).toBe(100);
    });

    it('updates first element', () => {
      const st = new LazySegmentTree3([1, 2, 3]);
      st.pointUpdate(0, 99);
      expect(st.get(0)).toBe(99);
    });

    it('updates last element', () => {
      const st = new LazySegmentTree3([1, 2, 3]);
      st.pointUpdate(2, 99);
      expect(st.get(2)).toBe(99);
    });

    it('preserves other elements', () => {
      const st = new LazySegmentTree3([10, 20, 30, 40]);
      st.pointUpdate(1, 200);
      expect(st.get(0)).toBe(10);
      expect(st.get(2)).toBe(30);
      expect(st.get(3)).toBe(40);
    });
  });

  // ─── size ───

  describe('size', () => {
    it('returns array length', () => {
      expect(new LazySegmentTree3([1, 2, 3]).size()).toBe(3);
      expect(new LazySegmentTree3([1]).size()).toBe(1);
    });
  });

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('handles single element with range update', () => {
      const st = new LazySegmentTree3([5]);
      st.rangeUpdate(0, 0, 10);
      expect(st.get(0)).toBe(15);
    });

    it('handles point update to zero', () => {
      const st = new LazySegmentTree3([5, 10, 15]);
      st.pointUpdate(1, 0);
      expect(st.get(1)).toBe(0);
      expect(st.rangeQuery(0, 2)).toBe(20);
    });

    it('handles large range update on small array', () => {
      const st = new LazySegmentTree3([1, 2]);
      st.rangeUpdate(0, 1, 100);
      expect(st.get(0)).toBe(101);
      expect(st.get(1)).toBe(102);
    });
  });
});
