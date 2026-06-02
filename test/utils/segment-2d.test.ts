import { describe, expect, it } from 'vitest'
import { SegmentTree2D } from '../../src/utils/segment-2d.js'

describe('SegmentTree2D', () => {
  it('updates and queries single cell', () => {
    const st = new SegmentTree2D(3, 3)
    st.update(1, 1, 5)
    expect(st.query(1, 1, 1, 1)).toBe(5)
  })

  it('queries full grid', () => {
    const st = new SegmentTree2D(2, 2)
    st.update(0, 0, 1)
    st.update(0, 1, 2)
    st.update(1, 0, 3)
    st.update(1, 1, 4)
    expect(st.query(0, 0, 1, 1)).toBe(10)
  })

  it('queries partial range', () => {
    const st = new SegmentTree2D(3, 3)
    st.update(0, 0, 1)
    st.update(1, 1, 5)
    st.update(2, 2, 10)
    expect(st.query(0, 0, 1, 1)).toBe(6)
  })

  it('handles single row', () => {
    const st = new SegmentTree2D(1, 5)
    st.update(0, 2, 7)
    expect(st.query(0, 0, 0, 4)).toBe(7)
    expect(st.query(0, 2, 0, 2)).toBe(7)
  })

  it('handles single column', () => {
    const st = new SegmentTree2D(5, 1)
    st.update(3, 0, 9)
    expect(st.query(0, 0, 4, 0)).toBe(9)
  })

  it('overwrites previous value', () => {
    const st = new SegmentTree2D(2, 2)
    st.update(0, 0, 5)
    st.update(0, 0, 10)
    expect(st.query(0, 0, 0, 0)).toBe(10)
  })

  it('handles out of range query', () => {
    const st = new SegmentTree2D(3, 3)
    st.update(1, 1, 5)
    expect(st.query(5, 5, 10, 10)).toBe(0)
  })

  it('handles 1x1 grid', () => {
    const st = new SegmentTree2D(1, 1)
    st.update(0, 0, 42)
    expect(st.query(0, 0, 0, 0)).toBe(42)
  })

  it('multiple updates accumulate', () => {
    const st = new SegmentTree2D(2, 2)
    st.update(0, 0, 1)
    st.update(0, 0, 2)
    st.update(0, 0, 3)
    expect(st.query(0, 0, 0, 0)).toBe(3)
  })

  it('query empty grid returns 0', () => {
    const st = new SegmentTree2D(3, 3)
    expect(st.query(0, 0, 2, 2)).toBe(0)
  })

  it('handles 4x4 grid', () => {
    const st = new SegmentTree2D(4, 4)
    st.update(1, 1, 5)
    st.update(2, 2, 10)
    expect(st.query(0, 0, 3, 3)).toBe(15)
    expect(st.query(1, 1, 2, 2)).toBe(15)
  })

  it('handles non-square grid', () => {
    const st = new SegmentTree2D(2, 4)
    st.update(0, 0, 3)
    st.update(1, 3, 7)
    expect(st.query(0, 0, 1, 3)).toBe(10)
  })

  it('single row query', () => {
    const st = new SegmentTree2D(3, 3)
    st.update(1, 0, 5)
    st.update(1, 2, 3)
    expect(st.query(1, 0, 1, 2)).toBe(8)
  })

  it('handles 2x1 grid', () => {
    const st = new SegmentTree2D(2, 1)
    st.update(0, 0, 3)
    st.update(1, 0, 7)
    expect(st.query(0, 0, 1, 0)).toBe(10)
  })

  it('handles 1x3 grid', () => {
    const st = new SegmentTree2D(1, 3)
    st.update(0, 0, 1)
    st.update(0, 1, 2)
    st.update(0, 2, 3)
    expect(st.query(0, 0, 0, 2)).toBe(6)
  })

  it('query single cell', () => {
    const st = new SegmentTree2D(3, 3)
    st.update(1, 1, 42)
    expect(st.query(1, 1, 1, 1)).toBe(42)
  })

  it('query full range returns sum', () => {
    const st = new SegmentTree2D(2, 2)
    st.update(0, 0, 10)
    st.update(1, 1, 20)
    expect(st.query(0, 0, 1, 1)).toBe(30)
  })

  it('single cell update and query', () => {
    const st = new SegmentTree2D(1, 1)
    st.update(0, 0, 42)
    expect(st.query(0, 0, 0, 0)).toBe(42)
  })

  it('query default is 0', () => {
    const st = new SegmentTree2D(2, 2)
    expect(st.query(0, 0, 1, 1)).toBe(0)
  })

  it('update and query single cell', () => {
    const st = new SegmentTree2D(3, 3)
    st.update(1, 1, 10)
    expect(st.query(1, 1, 1, 1)).toBe(10)
  })
})
