import { describe, it, expect } from 'vitest'
import { SparseTable2D } from '../../src/utils/sparse-table-2d.js'

describe('SparseTable2D', () => {
  it('constructs with 2D data', () => {
    const data = [[1, 2, 3], [4, 5, 6]]
    const st = new SparseTable2D(data, Math.min)
    expect(st.query(0, 0, 0, 0)).toBe(1)
  })

  it('queries single cell', () => {
    const data = [[1, 2, 3], [4, 5, 6]]
    const st = new SparseTable2D(data, (a, b) => a)
    expect(st.query(1, 2, 1, 2)).toBe(6)
  })

  it('queries range for min', () => {
    const data = [[3, 1, 4], [1, 5, 9]]
    const st = new SparseTable2D(data, Math.min)
    expect(st.query(0, 0, 1, 2)).toBe(1)
  })

  it('queries range for max', () => {
    const data = [[3, 1, 4], [1, 5, 9]]
    const st = new SparseTable2D(data, Math.max)
    expect(st.query(0, 0, 1, 2)).toBe(9)
  })

  it('queries single row range', () => {
    const data = [[3, 1, 4, 1, 5]]
    const st = new SparseTable2D(data, Math.min)
    expect(st.query(0, 0, 0, 4)).toBe(1)
  })

  it('queries single column range', () => {
    const data = [[3], [1], [4], [1]]
    const st = new SparseTable2D(data, Math.min)
    expect(st.query(0, 0, 3, 0)).toBe(1)
  })

  it('queries 2x2 submatrix for min', () => {
    const data = [[7, 2, 3], [5, 1, 8], [9, 4, 6]]
    const st = new SparseTable2D(data, Math.min)
    expect(st.query(0, 0, 1, 1)).toBe(1)
  })

  it('queries 2x2 submatrix for max', () => {
    const data = [[7, 2, 3], [5, 1, 8], [9, 4, 6]]
    const st = new SparseTable2D(data, Math.max)
    expect(st.query(1, 1, 2, 2)).toBe(8)
  })

  it('queries large range', () => {
    const data = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]
    const st = new SparseTable2D(data, Math.min)
    expect(st.query(0, 0, 2, 3)).toBe(1)
  })

  it('queries with multiple min operations', () => {
    const data = [[1, 2], [3, 4]]
    const st = new SparseTable2D(data, Math.min)
    expect(st.query(0, 0, 1, 1)).toBe(1)
    expect(st.query(0, 1, 1, 1)).toBe(2)
    expect(st.query(1, 0, 1, 1)).toBe(3)
  })

  it('handles 3x3 matrix', () => {
    const data = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    const st = new SparseTable2D(data, Math.max)
    expect(st.query(0, 0, 2, 2)).toBe(9)
  })

  it('handles 4x4 matrix', () => {
    const data = [[16, 2, 3, 13], [5, 11, 10, 8], [9, 7, 6, 12], [4, 14, 15, 1]]
    const st = new SparseTable2D(data, Math.min)
    expect(st.query(0, 0, 3, 3)).toBe(1)
  })

  it('queries non-square range in square matrix', () => {
    const data = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]
    const st = new SparseTable2D(data, Math.max)
    expect(st.query(0, 0, 2, 2)).toBe(11)
  })

  it('queries bottom-right corner', () => {
    const data = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    const st = new SparseTable2D(data, Math.max)
    expect(st.query(1, 1, 2, 2)).toBe(9)
  })

  it('queries top-left corner', () => {
    const data = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    const st = new SparseTable2D(data, Math.min)
    expect(st.query(0, 0, 1, 1)).toBe(1)
  })

  it('handles single element matrix', () => {
    const data = [[42]]
    const st = new SparseTable2D(data, (a, b) => a)
    expect(st.query(0, 0, 0, 0)).toBe(42)
  })

  it('handles 1x3 matrix', () => {
    const data = [[1, 2, 3]]
    const st = new SparseTable2D(data, Math.max)
    expect(st.query(0, 0, 0, 2)).toBe(3)
  })

  it('handles 3x1 matrix', () => {
    const data = [[1], [2], [3]]
    const st = new SparseTable2D(data, Math.max)
    expect(st.query(0, 0, 2, 0)).toBe(3)
  })

  it('queries overlapping ranges', () => {
    const data = [[5, 2, 8], [3, 1, 9], [4, 7, 6]]
    const st = new SparseTable2D(data, Math.min)
    expect(st.query(0, 0, 2, 2)).toBe(1)
    expect(st.query(0, 0, 1, 1)).toBe(1)
    expect(st.query(1, 1, 2, 2)).toBe(1)
  })
})