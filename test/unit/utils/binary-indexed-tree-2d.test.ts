import { describe, it, expect } from 'vitest'
import { BinaryIndexedTree2D } from '../../../src/utils/binary-indexed-tree-2d.js'

describe('BinaryIndexedTree2D', () => {
  describe('construction', () => {
    it('creates empty tree', () => {
      const bit = new BinaryIndexedTree2D(3, 4)
      expect(bit.rowCount).toBe(3)
      expect(bit.colCount).toBe(4)
    })

    it('fromGrid builds from 2D array', () => {
      const grid = [[1, 2], [3, 4]]
      const bit = BinaryIndexedTree2D.fromGrid(grid)
      expect(bit.rowCount).toBe(2)
      expect(bit.colCount).toBe(2)
      expect(bit.query(1, 1)).toBe(10)
    })

    it('fromGrid handles empty grid', () => {
      const bit = BinaryIndexedTree2D.fromGrid([])
      expect(bit.rowCount).toBe(0)
      expect(bit.colCount).toBe(0)
    })
  })

  describe('update and query', () => {
    it('updates single cell and queries prefix sum', () => {
      const bit = new BinaryIndexedTree2D(5, 5)
      bit.update(2, 3, 7)
      expect(bit.query(2, 3)).toBe(7)
      expect(bit.query(1, 3)).toBe(0)
      expect(bit.query(2, 2)).toBe(0)
    })

    it('accumulates multiple updates', () => {
      const bit = new BinaryIndexedTree2D(3, 3)
      bit.update(0, 0, 1)
      bit.update(1, 1, 2)
      bit.update(2, 2, 3)
      expect(bit.query(2, 2)).toBe(6)
    })

    it('supports negative deltas', () => {
      const bit = new BinaryIndexedTree2D(3, 3)
      bit.update(1, 1, 10)
      bit.update(1, 1, -3)
      expect(bit.query(2, 2)).toBe(7)
    })
  })

  describe('rangeQuery', () => {
    it('queries full range', () => {
      const grid = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
      const bit = BinaryIndexedTree2D.fromGrid(grid)
      expect(bit.rangeQuery(0, 0, 2, 2)).toBe(45)
    })

    it('queries sub-rectangle', () => {
      const grid = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
      const bit = BinaryIndexedTree2D.fromGrid(grid)
      expect(bit.rangeQuery(1, 1, 2, 2)).toBe(5 + 6 + 8 + 9)
    })

    it('queries single cell', () => {
      const grid = [[1, 2], [3, 4]]
      const bit = BinaryIndexedTree2D.fromGrid(grid)
      expect(bit.rangeQuery(1, 0, 1, 0)).toBe(3)
    })

    it('returns 0 for inverted range', () => {
      const bit = new BinaryIndexedTree2D(3, 3)
      bit.update(1, 1, 5)
      expect(bit.rangeQuery(2, 2, 0, 0)).toBe(0)
    })

    it('queries first row', () => {
      const grid = [[1, 2, 3], [4, 5, 6]]
      const bit = BinaryIndexedTree2D.fromGrid(grid)
      expect(bit.rangeQuery(0, 0, 0, 2)).toBe(6)
    })

    it('queries first column', () => {
      const grid = [[1, 2], [3, 4], [5, 6]]
      const bit = BinaryIndexedTree2D.fromGrid(grid)
      expect(bit.rangeQuery(0, 0, 2, 0)).toBe(9)
    })
  })

  describe('edge cases', () => {
    it('handles out of bounds update gracefully', () => {
      const bit = new BinaryIndexedTree2D(3, 3)
      bit.update(-1, 0, 5)
      bit.update(0, -1, 5)
      bit.update(5, 0, 5)
      bit.update(0, 5, 5)
      expect(bit.query(2, 2)).toBe(0)
    })

    it('handles negative query coordinates', () => {
      const bit = new BinaryIndexedTree2D(3, 3)
      bit.update(1, 1, 10)
      expect(bit.query(-1, -1)).toBe(0)
    })

    it('handles query beyond bounds', () => {
      const grid = [[1, 2], [3, 4]]
      const bit = BinaryIndexedTree2D.fromGrid(grid)
      expect(bit.query(10, 10)).toBe(10)
    })

    it('handles single cell grid', () => {
      const bit = new BinaryIndexedTree2D(1, 1)
      bit.update(0, 0, 42)
      expect(bit.query(0, 0)).toBe(42)
      expect(bit.rangeQuery(0, 0, 0, 0)).toBe(42)
    })

    it('handles large grid efficiently', () => {
      const bit = new BinaryIndexedTree2D(100, 100)
      for (let i = 0; i < 100; i++) {
        bit.update(i, i, 1)
      }
      expect(bit.query(99, 99)).toBe(100)
    })
  })

  describe('prefix sum correctness', () => {
    it('matches brute force for random grid', () => {
      const grid = [
        [3, 1, 4, 1, 5],
        [9, 2, 6, 5, 3],
        [5, 8, 9, 7, 9],
      ]
      const bit = BinaryIndexedTree2D.fromGrid(grid)
      for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[0]!.length; c++) {
          let expected = 0
          for (let i = 0; i <= r; i++) {
            for (let j = 0; j <= c; j++) {
              expected += grid[i]![j]!
            }
          }
          expect(bit.query(r, c)).toBe(expected)
        }
      }
    })

    it('rangeQuery matches brute force', () => {
      const grid = [[1, 2, 3], [4, 5, 6]]
      const bit = BinaryIndexedTree2D.fromGrid(grid)
      expect(bit.rangeQuery(0, 1, 1, 2)).toBe(2 + 3 + 5 + 6)
    })
  })
})
