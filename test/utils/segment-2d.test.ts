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
})
