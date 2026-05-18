import { describe, it, expect } from 'vitest'
import { RectangularGrid } from '../src/core/rectangular-grid/index.js'

describe('RectangularGrid', () => {
  // ─── Construction & Get/Set ───
  describe('construction and get set', () => {
    it('creates grid with default undefined', () => {
      const grid = new RectangularGrid<number>(2, 3)
      expect(grid.rows).toBe(2)
      expect(grid.cols).toBe(3)
      expect(grid.cellCount).toBe(6)
    })

    it('creates grid with initial value', () => {
      const grid = new RectangularGrid(2, 2, 0)
      expect(grid.get(0, 0)).toBe(0)
      expect(grid.get(1, 1)).toBe(0)
    })

    it('set and get work correctly', () => {
      const grid = new RectangularGrid<number>(3, 3)
      grid.set(1, 2, 42)
      expect(grid.get(1, 2)).toBe(42)
    })

    it('has checks bounds', () => {
      const grid = new RectangularGrid(2, 2)
      expect(grid.has(0, 0)).toBe(true)
      expect(grid.has(2, 0)).toBe(false)
      expect(grid.has(-1, 0)).toBe(false)
    })
  })

  // ─── Row & Column Operations ───
  describe('row and column operations', () => {
    it('getRow returns row values', () => {
      const grid = new RectangularGrid(2, 3, 0)
      grid.set(0, 1, 5)
      expect(grid.getRow(0)).toEqual([0, 5, 0])
    })

    it('getCol returns column values', () => {
      const grid = new RectangularGrid(2, 3, 0)
      grid.set(0, 1, 5)
      grid.set(1, 1, 7)
      expect(grid.getCol(1)).toEqual([5, 7])
    })

    it('setRow sets entire row', () => {
      const grid = new RectangularGrid<number>(2, 3)
      grid.setRow(0, [1, 2, 3])
      expect(grid.getRow(0)).toEqual([1, 2, 3])
    })

    it('setCol sets entire column', () => {
      const grid = new RectangularGrid<number>(3, 2)
      grid.setCol(0, [10, 20, 30])
      expect(grid.getCol(0)).toEqual([10, 20, 30])
    })
  })

  // ─── Transformations ───
  describe('transformations', () => {
    it('fill sets all cells', () => {
      const grid = new RectangularGrid<number>(2, 2)
      grid.fill(7)
      expect(grid.get(0, 0)).toBe(7)
      expect(grid.get(1, 1)).toBe(7)
    })

    it('subgrid extracts sub-region', () => {
      const grid = new RectangularGrid<number>(3, 3, 0)
      grid.set(0, 0, 1)
      grid.set(1, 1, 5)
      grid.set(2, 2, 9)
      const sub = grid.subgrid(0, 0, 1, 1)
      expect(sub).toEqual([[1, 0], [0, 5]])
    })

    it('flatten returns row-major', () => {
      const grid = new RectangularGrid<number>(2, 2)
      grid.set(0, 0, 1)
      grid.set(0, 1, 2)
      grid.set(1, 0, 3)
      grid.set(1, 1, 4)
      expect(grid.flatten()).toEqual([1, 2, 3, 4])
    })

    it('flattenColMajor returns col-major', () => {
      const grid = new RectangularGrid<number>(2, 2)
      grid.set(0, 0, 1)
      grid.set(0, 1, 2)
      grid.set(1, 0, 3)
      grid.set(1, 1, 4)
      expect(grid.flattenColMajor()).toEqual([1, 3, 2, 4])
    })

    it('transpose swaps rows and cols', () => {
      const grid = new RectangularGrid<number>(2, 3)
      grid.set(0, 0, 1)
      grid.set(1, 2, 7)
      const t = grid.transpose()
      expect(t.rows).toBe(3)
      expect(t.cols).toBe(2)
      expect(t.get(0, 0)).toBe(1)
      expect(t.get(2, 1)).toBe(7)
    })

    it('rotate90 rotates clockwise', () => {
      const grid = new RectangularGrid<number>(2, 3)
      grid.setRow(0, [1, 2, 3])
      grid.setRow(1, [4, 5, 6])
      const r = grid.rotate90()
      expect(r.rows).toBe(3)
      expect(r.cols).toBe(2)
      expect(r.get(0, 0)).toBe(4)
      expect(r.get(0, 1)).toBe(1)
    })

    it('mirrorHorizontal flips columns', () => {
      const grid = new RectangularGrid<number>(1, 3)
      grid.setRow(0, [1, 2, 3])
      const m = grid.mirrorHorizontal()
      expect(m.getRow(0)).toEqual([3, 2, 1])
    })

    it('mirrorVertical flips rows', () => {
      const grid = new RectangularGrid<number>(2, 1)
      grid.set(0, 0, 1)
      grid.set(1, 0, 2)
      const m = grid.mirrorVertical()
      expect(m.get(0, 0)).toBe(2)
      expect(m.get(1, 0)).toBe(1)
    })
  })

  // ─── Search & Iteration ───
  describe('search and iteration', () => {
    it('indexOf finds first occurrence', () => {
      const grid = new RectangularGrid<number>(2, 2)
      grid.set(0, 1, 5)
      expect(grid.indexOf(5)).toEqual([0, 1])
    })

    it('indexOf returns undefined for missing', () => {
      const grid = new RectangularGrid<number>(2, 2, 0)
      expect(grid.indexOf(99)).toBeUndefined()
    })

    it('indicesOf finds all occurrences', () => {
      const grid = new RectangularGrid<number>(2, 2, 5)
      expect(grid.indicesOf(5)).toHaveLength(4)
    })

    it('count counts occurrences', () => {
      const grid = new RectangularGrid<number>(2, 2)
      grid.set(0, 0, 1)
      grid.set(1, 1, 1)
      expect(grid.count(1)).toBe(2)
    })

    it('forEach iterates all cells', () => {
      const grid = new RectangularGrid<number>(2, 2, 0)
      let count = 0
      grid.forEach(() => count++)
      expect(count).toBe(4)
    })

    it('map transforms grid', () => {
      const grid = new RectangularGrid<number>(2, 2, 1)
      const doubled = grid.map((v) => v * 2)
      expect(doubled.get(0, 0)).toBe(2)
    })

    it('clone produces independent copy', () => {
      const grid = new RectangularGrid<number>(2, 2, 5)
      const c = grid.clone()
      grid.set(0, 0, 99)
      expect(c.get(0, 0)).toBe(5)
    })

    it('toArray returns 2D array', () => {
      const grid = new RectangularGrid<number>(2, 2)
      grid.setRow(0, [1, 2])
      grid.setRow(1, [3, 4])
      expect(grid.toArray()).toEqual([[1, 2], [3, 4]])
    })
  })
})
