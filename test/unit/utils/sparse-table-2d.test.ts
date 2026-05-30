import { describe, it, expect } from 'vitest'
import { SparseTable2D } from '../../../src/utils/sparse-table-2d.js'

describe('SparseTable2D', () => {
  describe('range minimum', () => {
    it('finds min in sub-rectangle', () => {
      const data = [
        [5, 2, 8],
        [1, 9, 3],
        [4, 6, 7],
      ]
      const st = new SparseTable2D(data, Math.min)
      expect(st.query(0, 0, 2, 2)).toBe(1)
    })

    it('finds min in single row', () => {
      const data = [
        [5, 2, 8, 1, 9],
      ]
      const st = new SparseTable2D(data, Math.min)
      expect(st.query(0, 0, 0, 4)).toBe(1)
    })

    it('finds min in single column', () => {
      const data = [
        [5],
        [1],
        [4],
      ]
      const st = new SparseTable2D(data, Math.min)
      expect(st.query(0, 0, 2, 0)).toBe(1)
    })

    it('finds min in single cell', () => {
      const data = [
        [5, 2],
        [1, 9],
      ]
      const st = new SparseTable2D(data, Math.min)
      expect(st.query(1, 1, 1, 1)).toBe(9)
    })
  })

  describe('range maximum', () => {
    it('finds max in sub-rectangle', () => {
      const data = [
        [3, 1, 4],
        [1, 5, 9],
        [2, 6, 5],
      ]
      const st = new SparseTable2D(data, Math.max)
      expect(st.query(0, 0, 2, 2)).toBe(9)
      expect(st.query(1, 1, 2, 2)).toBe(9)
    })
  })

  describe('edge cases', () => {
    it('handles 1x1 grid', () => {
      const st = new SparseTable2D([[42]], Math.min)
      expect(st.query(0, 0, 0, 0)).toBe(42)
    })

    it('handles 2x2 grid', () => {
      const data = [
        [3, 7],
        [1, 9],
      ]
      const st = new SparseTable2D(data, Math.min)
      expect(st.query(0, 0, 1, 1)).toBe(1)
    })
  })
})
