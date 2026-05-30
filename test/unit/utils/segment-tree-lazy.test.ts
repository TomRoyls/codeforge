import { describe, it, expect } from 'vitest'
import { LazySegmentTree } from '../../../src/utils/segment-tree-lazy.js'

describe('LazySegmentTree', () => {
  describe('construction', () => {
    it('creates tree from data', () => {
      const st = new LazySegmentTree([1, 2, 3, 4, 5])
      expect(st.length).toBe(5)
    })

    it('handles empty array', () => {
      const st = new LazySegmentTree([])
      expect(st.length).toBe(0)
    })

    it('handles single element', () => {
      const st = new LazySegmentTree([42])
      expect(st.rangeQuery(0, 0)).toBe(42)
    })
  })

  describe('range queries', () => {
    it('queries full range sum', () => {
      const st = new LazySegmentTree([1, 2, 3, 4, 5])
      expect(st.rangeQuery(0, 4)).toBe(15)
    })

    it('queries partial range', () => {
      const st = new LazySegmentTree([1, 2, 3, 4, 5])
      expect(st.rangeQuery(1, 3)).toBe(9)
    })

    it('queries single element via range', () => {
      const st = new LazySegmentTree([10, 20, 30])
      expect(st.rangeQuery(1, 1)).toBe(20)
    })

    it('queries outside range returns 0', () => {
      const st = new LazySegmentTree([1, 2, 3])
      expect(st.rangeQuery(5, 10)).toBe(0)
    })
  })

  describe('range updates', () => {
    it('updates full range', () => {
      const st = new LazySegmentTree([1, 2, 3, 4, 5])
      st.rangeUpdate(0, 4, 10)
      expect(st.rangeQuery(0, 4)).toBe(65)
    })

    it('updates partial range', () => {
      const st = new LazySegmentTree([1, 2, 3, 4, 5])
      st.rangeUpdate(1, 3, 5)
      expect(st.rangeQuery(1, 3)).toBe(24)
      expect(st.rangeQuery(0, 0)).toBe(1)
      expect(st.rangeQuery(4, 4)).toBe(5)
    })

    it('handles multiple updates', () => {
      const st = new LazySegmentTree([0, 0, 0, 0, 0])
      st.rangeUpdate(0, 2, 1)
      st.rangeUpdate(2, 4, 2)
      expect(st.rangeQuery(0, 0)).toBe(1)
      expect(st.rangeQuery(2, 2)).toBe(3)
      expect(st.rangeQuery(4, 4)).toBe(2)
    })
  })

  describe('point operations', () => {
    it('queries single point', () => {
      const st = new LazySegmentTree([10, 20, 30])
      expect(st.pointQuery(1)).toBe(20)
    })

    it('updates single point', () => {
      const st = new LazySegmentTree([0, 0, 0])
      st.pointUpdate(1, 5)
      expect(st.pointQuery(1)).toBe(5)
    })
  })

  describe('complex scenarios', () => {
    it('handles overlapping updates', () => {
      const st = new LazySegmentTree([0, 0, 0, 0, 0])
      st.rangeUpdate(0, 4, 1)
      st.rangeUpdate(1, 3, 2)
      st.rangeUpdate(2, 2, 3)
      expect(st.pointQuery(0)).toBe(1)
      expect(st.pointQuery(1)).toBe(3)
      expect(st.pointQuery(2)).toBe(6)
      expect(st.pointQuery(3)).toBe(3)
      expect(st.pointQuery(4)).toBe(1)
    })

    it('handles large data', () => {
      const data = Array.from({ length: 1000 }, (_, i) => i)
      const st = new LazySegmentTree(data)
      st.rangeUpdate(100, 200, 1)
      expect(st.rangeQuery(100, 200)).toBe(15150 + 101)
    })
  })
})
