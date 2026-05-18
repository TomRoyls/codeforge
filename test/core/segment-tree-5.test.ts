import { describe, expect, it } from 'vitest'
import { SegmentTree5 } from '../../src/core/segment-tree-5/index.js'

// ─── Constructor ───

describe('SegmentTree5', () => {
  describe('constructor', () => {
    it('builds a sum segment tree by default', () => {
      const st = new SegmentTree5([1, 2, 3, 4])
      expect(st.query(0, 3)).toBe(10)
    })

    it('builds with a custom operation (max)', () => {
      const st = new SegmentTree5([3, 1, 4, 1, 5], (a, b) => Math.max(a, b))
      expect(st.query(0, 4)).toBe(5)
    })

    it('builds with a custom operation (min)', () => {
      const st = new SegmentTree5([5, 3, 7, 2, 8], (a, b) => Math.min(a, b))
      expect(st.query(0, 4)).toBe(2)
    })

    it('handles a single-element array', () => {
      const st = new SegmentTree5([42])
      expect(st.query(0, 0)).toBe(42)
      expect(st.size()).toBe(1)
    })
  })

  // ─── query ───

  describe('query', () => {
    it('returns the sum of the full range', () => {
      const st = new SegmentTree5([1, 2, 3, 4, 5])
      expect(st.query(0, 4)).toBe(15)
    })

    it('returns the sum of a sub-range', () => {
      const st = new SegmentTree5([1, 2, 3, 4, 5])
      expect(st.query(1, 3)).toBe(9)
    })

    it('returns the element for a single-element query', () => {
      const st = new SegmentTree5([10, 20, 30])
      expect(st.query(1, 1)).toBe(20)
    })

    it('returns correct max for sub-range', () => {
      const st = new SegmentTree5([2, 5, 1, 4, 3], (a, b) => Math.max(a, b))
      expect(st.query(0, 2)).toBe(5)
      expect(st.query(2, 4)).toBe(4)
    })

    it('returns correct min for sub-range', () => {
      const st = new SegmentTree5([8, 3, 7, 1, 9], (a, b) => Math.min(a, b))
      expect(st.query(0, 3)).toBe(1)
    })
  })

  // ─── update ───

  describe('update', () => {
    it('updates a value and reflects in query', () => {
      const st = new SegmentTree5([1, 2, 3, 4])
      st.update(1, 10)
      expect(st.query(0, 3)).toBe(18)
    })

    it('updates do not affect other values', () => {
      const st = new SegmentTree5([1, 2, 3, 4, 5])
      st.update(2, 100)
      expect(st.get(0)).toBe(1)
      expect(st.get(1)).toBe(2)
      expect(st.get(3)).toBe(4)
      expect(st.get(4)).toBe(5)
    })

    it('supports multiple updates', () => {
      const st = new SegmentTree5([1, 1, 1, 1])
      st.update(0, 5)
      st.update(2, 10)
      expect(st.query(0, 3)).toBe(17)
    })

    it('update affects only targeted index via get', () => {
      const st = new SegmentTree5([10, 20, 30])
      st.update(1, 99)
      expect(st.get(1)).toBe(99)
      expect(st.get(0)).toBe(10)
      expect(st.get(2)).toBe(30)
    })
  })

  // ─── get ───

  describe('get', () => {
    it('returns the original value at index', () => {
      const st = new SegmentTree5([5, 10, 15, 20])
      expect(st.get(0)).toBe(5)
      expect(st.get(1)).toBe(10)
      expect(st.get(2)).toBe(15)
      expect(st.get(3)).toBe(20)
    })

    it('returns updated value after update', () => {
      const st = new SegmentTree5([1, 2, 3])
      st.update(0, 100)
      expect(st.get(0)).toBe(100)
    })
  })

  // ─── size ───

  describe('size', () => {
    it('returns the number of elements', () => {
      const st = new SegmentTree5([1, 2, 3])
      expect(st.size()).toBe(3)
    })

    it('returns 0 only if the input was an empty array', () => {
      const st = new SegmentTree5([])
      expect(st.size()).toBe(0)
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('handles negative numbers in sum', () => {
      const st = new SegmentTree5([-1, 2, -3, 4])
      expect(st.query(0, 3)).toBe(2)
    })

    it('handles zeros', () => {
      const st = new SegmentTree5([0, 0, 0])
      expect(st.query(0, 2)).toBe(0)
    })

    it('handles large range query with max operation', () => {
      const data = Array.from({ length: 100 }, (_, i) => i + 1)
      const st = new SegmentTree5(data, (a, b) => Math.max(a, b))
      expect(st.query(0, 99)).toBe(100)
      expect(st.query(50, 99)).toBe(100)
      expect(st.query(0, 49)).toBe(50)
    })

    it('handles update on a product tree', () => {
      const st = new SegmentTree5([2, 3, 4], (a, b) => a * b)
      expect(st.query(0, 2)).toBe(24)
      st.update(1, 5)
      expect(st.query(0, 2)).toBe(40)
    })
  })
})
