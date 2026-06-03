import { describe, expect, it } from 'vitest'
import { LazySegmentTree } from '../../src/utils/lazy-segment.js'

describe('LazySegmentTree', () => {
  it('updates and queries range', () => {
    const st = new LazySegmentTree(5)
    st.updateRange(0, 4, 1)
    expect(st.queryRange(0, 4)).toBe(5)
  })

  it('handles single point update', () => {
    const st = new LazySegmentTree(5)
    st.updateRange(2, 2, 10)
    expect(st.queryRange(2, 2)).toBe(10)
  })

  it('handles partial range update', () => {
    const st = new LazySegmentTree(10)
    st.updateRange(2, 5, 3)
    expect(st.queryRange(0, 10)).toBe(12)
    expect(st.queryRange(2, 5)).toBe(12)
    expect(st.queryRange(0, 1)).toBe(0)
  })

  it('handles multiple updates', () => {
    const st = new LazySegmentTree(5)
    st.updateRange(0, 2, 1)
    st.updateRange(2, 4, 2)
    expect(st.queryRange(0, 4)).toBe(9)
  })

  it('handles overlapping updates', () => {
    const st = new LazySegmentTree(5)
    st.updateRange(0, 4, 1)
    st.updateRange(2, 4, 1)
    expect(st.queryRange(2, 4)).toBe(6)
  })

  it('getPoint and setPoint', () => {
    const st = new LazySegmentTree(5)
    st.setPoint(3, 7)
    expect(st.getPoint(3)).toBe(7)
  })

  it('handles empty range query', () => {
    const st = new LazySegmentTree(5)
    expect(st.queryRange(0, 0)).toBe(0)
  })

  it('handles single element', () => {
    const st = new LazySegmentTree(1)
    st.updateRange(0, 0, 5)
    expect(st.queryRange(0, 0)).toBe(5)
  })

  it('out of range query returns 0', () => {
    const st = new LazySegmentTree(5)
    st.updateRange(0, 4, 1)
    expect(st.queryRange(5, 6)).toBe(0)
  })

  it('handles large number of updates', () => {
    const st = new LazySegmentTree(100)
    for (let i = 0; i < 100; i++) st.updateRange(i, i, 1)
    expect(st.queryRange(0, 99)).toBe(100)
  })

  it('handles range update then point queries', () => {
    const st = new LazySegmentTree(5)
    st.updateRange(1, 3, 5)
    expect(st.getPoint(0)).toBe(0)
    expect(st.getPoint(1)).toBe(5)
    expect(st.getPoint(2)).toBe(5)
    expect(st.getPoint(3)).toBe(5)
    expect(st.getPoint(4)).toBe(0)
  })

  it('handles many overlapping updates', () => {
    const st = new LazySegmentTree(10)
    st.updateRange(0, 9, 1)
    st.updateRange(3, 7, 2)
    st.updateRange(5, 5, 3)
    expect(st.getPoint(5)).toBe(6)
    expect(st.queryRange(0, 9)).toBe(23)
  })

  it('handles single element tree', () => {
    const st = new LazySegmentTree(1)
    st.updateRange(0, 0, 7)
    expect(st.getPoint(0)).toBe(7)
    expect(st.queryRange(0, 0)).toBe(7)
  })

  it('handles zero update', () => {
    const st = new LazySegmentTree(5)
    st.updateRange(0, 4, 10)
    st.updateRange(1, 3, 0)
    expect(st.getPoint(0)).toBe(10)
    expect(st.getPoint(2)).toBe(10)
  })

  it('handles full range update then query', () => {
    const st = new LazySegmentTree(4)
    st.updateRange(0, 3, 3)
    expect(st.queryRange(0, 3)).toBe(12)
    expect(st.getPoint(1)).toBe(3)
  })

  it('handles partial range update', () => {
    const st = new LazySegmentTree(5)
    st.updateRange(1, 3, 5)
    expect(st.getPoint(0)).toBe(0)
    expect(st.getPoint(1)).toBe(5)
    expect(st.getPoint(3)).toBe(5)
    expect(st.getPoint(4)).toBe(0)
  })

  it('handles range update full range', () => {
    const st = new LazySegmentTree(5)
    st.updateRange(0, 4, 3)
    expect(st.queryRange(0, 4)).toBe(15)
  })

  it('single element update and query', () => {
    const st = new LazySegmentTree(3)
    st.updateRange(1, 1, 7)
    expect(st.queryRange(1, 1)).toBe(7)
  })

  it('update and query full range sums', () => {
    const st = new LazySegmentTree(3)
    st.updateRange(0, 2, 5)
    expect(st.queryRange(0, 2)).toBe(15)
  })

  it('single element update', () => {
    const st = new LazySegmentTree(3)
    st.updateRange(1, 1, 10)
    expect(st.queryRange(1, 1)).toBe(10)
  })

  it('query on unmodified tree returns 0', () => {
    const st = new LazySegmentTree(5)
    expect(st.queryRange(0, 4)).toBe(0)
  })

  it('update and query reflects change', () => {
    const st = new LazySegmentTree(5)
    st.updateRange(0, 2, 10)
    expect(st.queryRange(0, 2)).toBeGreaterThanOrEqual(10)
  })
})
