import { describe, it, expect } from 'vitest'
import { BilinearMap2 } from '../../src/core/bilinear-map-2/index.js'

describe('BilinearMap2', () => {
  const flatGrid = [
    [0, 0],
    [0, 0],
  ]

  const ascendingGrid = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ]

  const singleCell = [[42]]

  // ─── Constructor ───

  describe('constructor', () => {
    it('creates map with grid and default cell size', () => {
      const map = new BilinearMap2(flatGrid)
      expect(map.getWidth()).toBe(2)
      expect(map.getHeight()).toBe(2)
    })

    it('creates map with custom cell size', () => {
      const map = new BilinearMap2(flatGrid, 2.5)
      expect(map.getWidth()).toBe(2)
    })

    it('creates map with single cell grid', () => {
      const map = new BilinearMap2(singleCell)
      expect(map.getWidth()).toBe(1)
      expect(map.getHeight()).toBe(1)
    })

    it('creates map with rectangular grid', () => {
      const grid = [[1, 2, 3, 4]]
      const map = new BilinearMap2(grid)
      expect(map.getWidth()).toBe(4)
      expect(map.getHeight()).toBe(1)
    })
  })

  // ─── Get ───

  describe('get', () => {
    it('returns exact value at grid point', () => {
      const map = new BilinearMap2(ascendingGrid)
      expect(map.get(0, 0)).toBe(1)
      expect(map.get(1, 0)).toBe(2)
      expect(map.get(0, 1)).toBe(4)
      expect(map.get(2, 2)).toBe(9)
    })

    it('interpolates between grid points', () => {
      const grid = [
        [0, 10],
        [0, 10],
      ]
      const map = new BilinearMap2(grid)
      const mid = map.get(0.5, 0.5)
      expect(mid).toBeGreaterThanOrEqual(0)
      expect(mid).toBeLessThanOrEqual(10)
    })

    it('interpolates midpoint correctly for uniform corners', () => {
      const grid = [
        [5, 5],
        [5, 5],
      ]
      const map = new BilinearMap2(grid)
      expect(map.get(0.5, 0.5)).toBeCloseTo(5, 5)
    })

    it('clamps x to grid bounds', () => {
      const map = new BilinearMap2(ascendingGrid)
      const clamped = map.get(100, 0)
      expect(clamped).toBeGreaterThanOrEqual(1)
    })

    it('clamps y to grid bounds', () => {
      const map = new BilinearMap2(ascendingGrid)
      const clamped = map.get(0, 100)
      expect(clamped).toBeGreaterThanOrEqual(1)
    })

    it('clamps negative x to zero', () => {
      const map = new BilinearMap2(ascendingGrid)
      const val = map.get(-5, 0)
      expect(val).toBe(1)
    })

    it('clamps negative y to zero', () => {
      const map = new BilinearMap2(ascendingGrid)
      const val = map.get(0, -5)
      expect(val).toBe(1)
    })

    it('returns corner value at origin', () => {
      const map = new BilinearMap2(ascendingGrid)
      expect(map.get(0, 0)).toBe(1)
    })

    it('handles single cell grid', () => {
      const map = new BilinearMap2(singleCell)
      expect(map.get(0, 0)).toBe(42)
    })

    it('works with custom cell size', () => {
      const grid = [
        [0, 100],
        [0, 100],
      ]
      const map = new BilinearMap2(grid, 2.0)
      const mid = map.get(1.0, 1.0)
      expect(mid).toBeGreaterThanOrEqual(0)
      expect(mid).toBeLessThanOrEqual(100)
    })

    it('interpolation on ascending grid at center', () => {
      const map = new BilinearMap2(ascendingGrid)
      const center = map.get(1, 1)
      expect(center).toBeCloseTo(5, 5)
    })
  })

  // ─── SetGridValue ───

  describe('setGridValue', () => {
    it('updates a grid cell', () => {
      const map = new BilinearMap2(flatGrid)
      map.setGridValue(0, 0, 99)
      expect(map.get(0, 0)).toBe(99)
    })

    it('updated value affects interpolation', () => {
      const map = new BilinearMap2(flatGrid)
      map.setGridValue(0, 0, 100)
      const val = map.get(0.25, 0.25)
      expect(val).toBeGreaterThan(0)
    })

    it('can update multiple cells', () => {
      const map = new BilinearMap2(flatGrid)
      map.setGridValue(0, 0, 10)
      map.setGridValue(1, 1, 20)
      expect(map.get(0, 0)).toBe(10)
      expect(map.get(1, 1)).toBe(20)
    })
  })

  // ─── GetWidth ───

  describe('getWidth', () => {
    it('returns correct width for square grid', () => {
      const map = new BilinearMap2(ascendingGrid)
      expect(map.getWidth()).toBe(3)
    })

    it('returns correct width for rectangular grid', () => {
      const grid = [[1, 2], [3, 4], [5, 6]]
      const map = new BilinearMap2(grid)
      expect(map.getWidth()).toBe(2)
    })

    it('returns 1 for single cell', () => {
      const map = new BilinearMap2(singleCell)
      expect(map.getWidth()).toBe(1)
    })
  })

  // ─── GetHeight ───

  describe('getHeight', () => {
    it('returns correct height for square grid', () => {
      const map = new BilinearMap2(ascendingGrid)
      expect(map.getHeight()).toBe(3)
    })

    it('returns correct height for rectangular grid', () => {
      const grid = [[1, 2], [3, 4], [5, 6]]
      const map = new BilinearMap2(grid)
      expect(map.getHeight()).toBe(3)
    })

    it('returns 1 for single row', () => {
      const grid = [[1, 2, 3]]
      const map = new BilinearMap2(grid)
      expect(map.getHeight()).toBe(1)
    })
  })

  // ─── GetRaw ───

  describe('getRaw', () => {
    it('returns value at valid position', () => {
      const map = new BilinearMap2(ascendingGrid)
      expect(map.getRaw(0, 0)).toBe(1)
      expect(map.getRaw(1, 1)).toBe(5)
      expect(map.getRaw(2, 2)).toBe(9)
    })

    it('returns undefined for out of bounds row', () => {
      const map = new BilinearMap2(ascendingGrid)
      expect(map.getRaw(10, 0)).toBeUndefined()
    })

    it('returns undefined for out of bounds col', () => {
      const map = new BilinearMap2(ascendingGrid)
      expect(map.getRaw(0, 10)).toBeUndefined()
    })

    it('returns undefined for negative row', () => {
      const map = new BilinearMap2(ascendingGrid)
      expect(map.getRaw(-1, 0)).toBeUndefined()
    })

    it('returns zero values correctly', () => {
      const grid = [[0, 1], [2, 3]]
      const map = new BilinearMap2(grid)
      expect(map.getRaw(0, 0)).toBe(0)
    })
  })

  // ─── GetGrid ───

  describe('getGrid', () => {
    it('returns a copy of the grid', () => {
      const map = new BilinearMap2(ascendingGrid)
      const grid = map.getGrid()
      grid[0]![0] = 999
      expect(map.getRaw(0, 0)).toBe(1)
    })

    it('returns grid with correct dimensions', () => {
      const map = new BilinearMap2(ascendingGrid)
      const grid = map.getGrid()
      expect(grid.length).toBe(3)
      expect(grid[0]!.length).toBe(3)
    })

    it('returns grid with correct values', () => {
      const map = new BilinearMap2(ascendingGrid)
      const grid = map.getGrid()
      expect(grid).toEqual(ascendingGrid)
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('handles grid with negative values', () => {
      const grid = [[-10, 10], [-20, 20]]
      const map = new BilinearMap2(grid)
      expect(map.get(0, 0)).toBe(-10)
      expect(map.get(1, 1)).toBe(20)
    })

    it('handles grid with floating point values', () => {
      const grid = [[1.5, 2.5], [3.5, 4.5]]
      const map = new BilinearMap2(grid)
      expect(map.get(0, 0)).toBeCloseTo(1.5, 5)
      expect(map.get(1, 1)).toBeCloseTo(4.5, 5)
    })

    it('handles very large cell size', () => {
      const grid = [[0, 100], [0, 100]]
      const map = new BilinearMap2(grid, 1000)
      const val = map.get(500, 500)
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThanOrEqual(100)
    })

    it('handles fractional cell size', () => {
      const grid = [[0, 1], [1, 2]]
      const map = new BilinearMap2(grid, 0.5)
      const val = map.get(0.25, 0.25)
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThanOrEqual(2)
    })

    it('large grid interpolation', () => {
      const grid: number[][] = []
      for (let i = 0; i < 10; i++) {
        const row: number[] = []
        for (let j = 0; j < 10; j++) {
          row.push(i * 10 + j)
        }
        grid.push(row)
      }
      const map = new BilinearMap2(grid)
      expect(map.get(0, 0)).toBe(0)
      expect(map.get(9, 9)).toBe(99)
      const mid = map.get(4.5, 4.5)
      expect(mid).toBeGreaterThanOrEqual(0)
      expect(mid).toBeLessThanOrEqual(99)
    })
  })
})
