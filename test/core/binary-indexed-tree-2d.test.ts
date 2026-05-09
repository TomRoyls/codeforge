import { describe, it, expect } from "vitest"
import { BinaryIndexedTree2D } from "../../src/core/binary-indexed-tree-2d/binary-indexed-tree-2d.js"

function bruteForcePrefix(grid: number[][], row: number, col: number): number {
  let sum = 0
  for (let i = 0; i <= row; i++) {
    for (let j = 0; j <= col; j++) {
      sum += grid[i]?.[j] ?? 0
    }
  }
  return sum
}

function bruteForceRange(
  grid: number[][],
  r1: number,
  c1: number,
  r2: number,
  c2: number,
): number {
  let sum = 0
  for (let i = r1; i <= r2; i++) {
    for (let j = c1; j <= c2; j++) {
      sum += grid[i]?.[j] ?? 0
    }
  }
  return sum
}

describe("BinaryIndexedTree2D", () => {
  describe("constructor", () => {
    it("creates a 3x3 grid with default value 0", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      expect(bit.dimensions()).toEqual({ rows: 3, cols: 3 })
    })

    it("creates a 1x1 grid", () => {
      const bit = new BinaryIndexedTree2D({ rows: 1, cols: 1 })
      expect(bit.dimensions()).toEqual({ rows: 1, cols: 1 })
    })

    it("creates a 5x10 grid", () => {
      const bit = new BinaryIndexedTree2D({ rows: 5, cols: 10 })
      expect(bit.dimensions()).toEqual({ rows: 5, cols: 10 })
    })

    it("creates grid with custom default value", () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 3, defaultValue: 5 })
      expect(bit.get(0, 0)).toBe(5)
      expect(bit.get(1, 2)).toBe(5)
    })

    it("creates grid with default value 0 when not specified", () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 2 })
      expect(bit.get(0, 0)).toBe(0)
      expect(bit.get(1, 1)).toBe(0)
    })

    it("creates grid with negative default value", () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 2, defaultValue: -3 })
      expect(bit.get(0, 0)).toBe(-3)
      expect(bit.get(1, 1)).toBe(-3)
    })

    it("creates grid with fractional default value", () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 2, defaultValue: 1.5 })
      expect(bit.get(0, 0)).toBe(1.5)
      expect(bit.get(1, 1)).toBe(1.5)
    })

    it("initializes toArray correctly with default value", () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 3, defaultValue: 7 })
      expect(bit.toArray()).toEqual([
        [7, 7, 7],
        [7, 7, 7],
      ])
    })

    it("initializes toArray correctly with default 0", () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 2 })
      expect(bit.toArray()).toEqual([
        [0, 0],
        [0, 0],
      ])
    })

    it("creates a 10x10 grid", () => {
      const bit = new BinaryIndexedTree2D({ rows: 10, cols: 10 })
      expect(bit.dimensions()).toEqual({ rows: 10, cols: 10 })
    })
  })

  describe("update", () => {
    it("updates a single cell", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.update(0, 0, 5)
      expect(bit.get(0, 0)).toBe(5)
    })

    it("accumulates updates to same cell", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.update(0, 0, 5)
      bit.update(0, 0, 3)
      expect(bit.get(0, 0)).toBe(8)
    })

    it("updates multiple cells", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.update(0, 0, 1)
      bit.update(1, 1, 2)
      bit.update(2, 2, 3)
      expect(bit.get(0, 0)).toBe(1)
      expect(bit.get(1, 1)).toBe(2)
      expect(bit.get(2, 2)).toBe(3)
    })

    it("handles negative delta", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.update(0, 0, 10)
      bit.update(0, 0, -3)
      expect(bit.get(0, 0)).toBe(7)
    })

    it("handles zero delta", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.update(0, 0, 5)
      bit.update(0, 0, 0)
      expect(bit.get(0, 0)).toBe(5)
    })

    it("throws on out-of-bounds row (negative)", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      expect(() => bit.update(-1, 0, 5)).toThrow(RangeError)
    })

    it("throws on out-of-bounds col (negative)", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      expect(() => bit.update(0, -1, 5)).toThrow(RangeError)
    })

    it("throws on out-of-bounds row (too large)", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      expect(() => bit.update(3, 0, 5)).toThrow(RangeError)
    })

    it("throws on out-of-bounds col (too large)", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      expect(() => bit.update(0, 3, 5)).toThrow(RangeError)
    })

    it("updates last cell in grid", () => {
      const bit = new BinaryIndexedTree2D({ rows: 4, cols: 5 })
      bit.update(3, 4, 42)
      expect(bit.get(3, 4)).toBe(42)
    })

    it("handles fractional delta", () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 2 })
      bit.update(0, 0, 1.5)
      bit.update(0, 0, 2.3)
      expect(bit.get(0, 0)).toBeCloseTo(3.8)
    })
  })

  describe("query (prefix sum)", () => {
    it("returns 0 for empty grid cell", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      expect(bit.query(0, 0)).toBe(0)
    })

    it("returns value after single update", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.update(1, 1, 5)
      expect(bit.query(2, 2)).toBe(5)
    })

    it("returns 0 for query before the update point", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.update(2, 2, 5)
      expect(bit.query(1, 1)).toBe(0)
    })

    it("computes prefix sum for multiple updates", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.update(0, 0, 1)
      bit.update(0, 1, 2)
      bit.update(1, 0, 3)
      bit.update(1, 1, 4)
      expect(bit.query(1, 1)).toBe(10)
    })

    it("computes prefix sum including only relevant cells", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.update(0, 0, 1)
      bit.update(0, 2, 2)
      bit.update(2, 0, 3)
      bit.update(2, 2, 4)
      expect(bit.query(0, 0)).toBe(1)
      expect(bit.query(0, 2)).toBe(3)
      expect(bit.query(2, 0)).toBe(4)
      expect(bit.query(2, 2)).toBe(10)
    })

    it("handles query at origin (0,0)", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.update(0, 0, 7)
      expect(bit.query(0, 0)).toBe(7)
    })

    it("throws on out-of-bounds query", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      expect(() => bit.query(-1, 0)).toThrow(RangeError)
    })

    it("throws on out-of-bounds query col", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      expect(() => bit.query(0, 3)).toThrow(RangeError)
    })

    it("prefix sum matches brute force", () => {
      const bit = new BinaryIndexedTree2D({ rows: 4, cols: 4 })
      const grid = Array.from({ length: 4 }, () => Array(4).fill(0))
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          const val = i * 4 + j + 1
          bit.update(i, j, val)
          grid[i]![j] = val
        }
      }
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          expect(bit.query(i, j)).toBe(bruteForcePrefix(grid, i, j))
        }
      }
    })

    it("prefix sum with negative values", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.update(0, 0, 10)
      bit.update(1, 1, -5)
      bit.update(2, 2, -3)
      expect(bit.query(2, 2)).toBe(2)
    })
  })

  describe("rangeQuery", () => {
    it("returns value of single cell range", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.update(1, 1, 5)
      expect(bit.rangeQuery(1, 1, 1, 1)).toBe(5)
    })

    it("returns sum of full grid", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.update(0, 0, 1)
      bit.update(1, 1, 2)
      bit.update(2, 2, 3)
      expect(bit.rangeQuery(0, 0, 2, 2)).toBe(6)
    })

    it("returns sum of top-left quadrant", () => {
      const bit = new BinaryIndexedTree2D({ rows: 4, cols: 4 })
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          bit.update(i, j, 1)
        }
      }
      expect(bit.rangeQuery(0, 0, 1, 1)).toBe(4)
    })

    it("returns sum of bottom-right quadrant", () => {
      const bit = new BinaryIndexedTree2D({ rows: 4, cols: 4 })
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          bit.update(i, j, 1)
        }
      }
      expect(bit.rangeQuery(2, 2, 3, 3)).toBe(4)
    })

    it("returns sum of single row range", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.update(1, 0, 1)
      bit.update(1, 1, 2)
      bit.update(1, 2, 3)
      expect(bit.rangeQuery(1, 0, 1, 2)).toBe(6)
    })

    it("returns sum of single column range", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.update(0, 1, 1)
      bit.update(1, 1, 2)
      bit.update(2, 1, 3)
      expect(bit.rangeQuery(0, 1, 2, 1)).toBe(6)
    })

    it("throws on r1 > r2", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      expect(() => bit.rangeQuery(2, 0, 1, 2)).toThrow(RangeError)
    })

    it("throws on c1 > c2", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      expect(() => bit.rangeQuery(0, 2, 2, 0)).toThrow(RangeError)
    })

    it("throws on out-of-bounds start", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      expect(() => bit.rangeQuery(-1, 0, 2, 2)).toThrow(RangeError)
    })

    it("throws on out-of-bounds end", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      expect(() => bit.rangeQuery(0, 0, 3, 0)).toThrow(RangeError)
    })

    it("range query matches brute force", () => {
      const bit = new BinaryIndexedTree2D({ rows: 5, cols: 5 })
      const grid = Array.from({ length: 5 }, () => Array(5).fill(0))
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          const val = (i + 1) * (j + 1)
          bit.update(i, j, val)
          grid[i]![j] = val
        }
      }
      for (let r1 = 0; r1 < 5; r1++) {
        for (let c1 = 0; c1 < 5; c1++) {
          for (let r2 = r1; r2 < 5; r2++) {
            for (let c2 = c1; c2 < 5; c2++) {
              expect(bit.rangeQuery(r1, c1, r2, c2)).toBe(bruteForceRange(grid, r1, c1, r2, c2))
            }
          }
        }
      }
    })

    it("range query with negative values", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.update(0, 0, 10)
      bit.update(0, 1, -3)
      bit.update(1, 0, -2)
      bit.update(1, 1, 5)
      expect(bit.rangeQuery(0, 0, 1, 1)).toBe(10)
    })

    it("range query with zero-valued cells", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.update(0, 0, 5)
      bit.update(2, 2, 5)
      expect(bit.rangeQuery(0, 0, 2, 2)).toBe(10)
      expect(bit.rangeQuery(0, 0, 1, 1)).toBe(5)
    })
  })

  describe("set", () => {
    it("sets a value at a cell", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.set(1, 1, 10)
      expect(bit.get(1, 1)).toBe(10)
    })

    it("overwrites previous value", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.set(1, 1, 10)
      bit.set(1, 1, 20)
      expect(bit.get(1, 1)).toBe(20)
    })

    it("maintains correct prefix sum after set", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.set(0, 0, 5)
      bit.set(0, 1, 3)
      bit.set(1, 0, 2)
      expect(bit.query(1, 1)).toBe(10)
    })

    it("set to same value is no-op", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.set(0, 0, 5)
      bit.set(0, 0, 5)
      expect(bit.get(0, 0)).toBe(5)
      expect(bit.query(2, 2)).toBe(5)
    })

    it("set to zero", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.set(0, 0, 10)
      bit.set(0, 0, 0)
      expect(bit.get(0, 0)).toBe(0)
      expect(bit.query(2, 2)).toBe(0)
    })

    it("set negative value", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.set(1, 1, -7)
      expect(bit.get(1, 1)).toBe(-7)
    })

    it("throws on out-of-bounds", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      expect(() => bit.set(-1, 0, 5)).toThrow(RangeError)
      expect(() => bit.set(0, 3, 5)).toThrow(RangeError)
    })

    it("set with custom default value", () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 2, defaultValue: 5 })
      bit.set(0, 0, 10)
      expect(bit.get(0, 0)).toBe(10)
      expect(bit.query(1, 1)).toBe(25)
    })
  })

  describe("get", () => {
    it("returns 0 for uninitialized cell", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      expect(bit.get(0, 0)).toBe(0)
    })

    it("returns value after update", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.update(1, 2, 42)
      expect(bit.get(1, 2)).toBe(42)
    })

    it("returns value after set", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.set(2, 1, 99)
      expect(bit.get(2, 1)).toBe(99)
    })

    it("throws on out-of-bounds", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      expect(() => bit.get(-1, 0)).toThrow(RangeError)
      expect(() => bit.get(0, -1)).toThrow(RangeError)
      expect(() => bit.get(3, 0)).toThrow(RangeError)
      expect(() => bit.get(0, 3)).toThrow(RangeError)
    })

    it("returns custom default value", () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 2, defaultValue: 3 })
      expect(bit.get(0, 0)).toBe(3)
      expect(bit.get(1, 1)).toBe(3)
    })
  })

  describe("dimensions", () => {
    it("returns correct dimensions for 3x4 grid", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 4 })
      expect(bit.dimensions()).toEqual({ rows: 3, cols: 4 })
    })

    it("returns correct dimensions for 1x1 grid", () => {
      const bit = new BinaryIndexedTree2D({ rows: 1, cols: 1 })
      expect(bit.dimensions()).toEqual({ rows: 1, cols: 1 })
    })

    it("dimensions unchanged after updates", () => {
      const bit = new BinaryIndexedTree2D({ rows: 5, cols: 5 })
      bit.update(0, 0, 10)
      bit.set(4, 4, 20)
      expect(bit.dimensions()).toEqual({ rows: 5, cols: 5 })
    })
  })

  describe("toArray", () => {
    it("returns zero-filled grid initially", () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 3 })
      expect(bit.toArray()).toEqual([
        [0, 0, 0],
        [0, 0, 0],
      ])
    })

    it("reflects updates", () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 2 })
      bit.update(0, 0, 1)
      bit.update(0, 1, 2)
      bit.update(1, 0, 3)
      bit.update(1, 1, 4)
      expect(bit.toArray()).toEqual([
        [1, 2],
        [3, 4],
      ])
    })

    it("reflects set operations", () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 2 })
      bit.set(0, 0, 10)
      bit.set(1, 1, 20)
      expect(bit.toArray()).toEqual([
        [10, 0],
        [0, 20],
      ])
    })

    it("returns independent copy", () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 2 })
      const arr = bit.toArray()
      arr[0]![0] = 999
      expect(bit.get(0, 0)).toBe(0)
    })

    it("reflects grid after clear", () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 2 })
      bit.set(0, 0, 5)
      bit.set(1, 1, 10)
      bit.clear()
      expect(bit.toArray()).toEqual([
        [0, 0],
        [0, 0],
      ])
    })

    it("works with custom default value", () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 2, defaultValue: 3 })
      expect(bit.toArray()).toEqual([
        [3, 3],
        [3, 3],
      ])
    })
  })

  describe("clear", () => {
    it("clears all values to 0", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.update(0, 0, 10)
      bit.update(1, 1, 20)
      bit.update(2, 2, 30)
      bit.clear()
      expect(bit.get(0, 0)).toBe(0)
      expect(bit.get(1, 1)).toBe(0)
      expect(bit.get(2, 2)).toBe(0)
    })

    it("prefix sum is 0 after clear", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.update(0, 0, 100)
      bit.clear()
      expect(bit.query(2, 2)).toBe(0)
    })

    it("can update after clear", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.update(0, 0, 10)
      bit.clear()
      bit.update(0, 0, 5)
      expect(bit.get(0, 0)).toBe(5)
      expect(bit.query(2, 2)).toBe(5)
    })

    it("can set after clear", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.set(1, 1, 50)
      bit.clear()
      bit.set(1, 1, 25)
      expect(bit.get(1, 1)).toBe(25)
    })

    it("rangeQuery returns 0 after clear", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.update(0, 0, 1)
      bit.update(1, 1, 2)
      bit.clear()
      expect(bit.rangeQuery(0, 0, 2, 2)).toBe(0)
    })

    it("clear with custom default value resets to 0", () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 2, defaultValue: 5 })
      bit.update(0, 0, 3)
      bit.clear()
      expect(bit.get(0, 0)).toBe(0)
      expect(bit.toArray()).toEqual([
        [0, 0],
        [0, 0],
      ])
    })
  })

  describe("1x1 grid (edge case)", () => {
    it("works with single cell", () => {
      const bit = new BinaryIndexedTree2D({ rows: 1, cols: 1 })
      bit.update(0, 0, 42)
      expect(bit.get(0, 0)).toBe(42)
      expect(bit.query(0, 0)).toBe(42)
    })

    it("rangeQuery on single cell", () => {
      const bit = new BinaryIndexedTree2D({ rows: 1, cols: 1 })
      bit.set(0, 0, 7)
      expect(bit.rangeQuery(0, 0, 0, 0)).toBe(7)
    })

    it("clear on single cell", () => {
      const bit = new BinaryIndexedTree2D({ rows: 1, cols: 1 })
      bit.set(0, 0, 10)
      bit.clear()
      expect(bit.get(0, 0)).toBe(0)
    })

    it("toArray on single cell", () => {
      const bit = new BinaryIndexedTree2D({ rows: 1, cols: 1 })
      bit.set(0, 0, 5)
      expect(bit.toArray()).toEqual([[5]])
    })

    it("dimensions on single cell", () => {
      const bit = new BinaryIndexedTree2D({ rows: 1, cols: 1 })
      expect(bit.dimensions()).toEqual({ rows: 1, cols: 1 })
    })

    it("multiple updates on single cell", () => {
      const bit = new BinaryIndexedTree2D({ rows: 1, cols: 1 })
      bit.update(0, 0, 5)
      bit.update(0, 0, 3)
      bit.update(0, 0, -2)
      expect(bit.get(0, 0)).toBe(6)
    })

    it("set overwrites on single cell", () => {
      const bit = new BinaryIndexedTree2D({ rows: 1, cols: 1 })
      bit.update(0, 0, 10)
      bit.set(0, 0, 5)
      expect(bit.get(0, 0)).toBe(5)
      expect(bit.query(0, 0)).toBe(5)
    })
  })

  describe("single row grid", () => {
    it("works as 1D BIT on single row", () => {
      const bit = new BinaryIndexedTree2D({ rows: 1, cols: 5 })
      bit.update(0, 0, 1)
      bit.update(0, 1, 2)
      bit.update(0, 2, 3)
      bit.update(0, 3, 4)
      bit.update(0, 4, 5)
      expect(bit.query(0, 4)).toBe(15)
    })

    it("rangeQuery on single row", () => {
      const bit = new BinaryIndexedTree2D({ rows: 1, cols: 5 })
      for (let j = 0; j < 5; j++) {
        bit.set(0, j, j + 1)
      }
      expect(bit.rangeQuery(0, 1, 0, 3)).toBe(2 + 3 + 4)
    })

    it("toArray on single row", () => {
      const bit = new BinaryIndexedTree2D({ rows: 1, cols: 4 })
      bit.set(0, 0, 10)
      bit.set(0, 3, 40)
      expect(bit.toArray()).toEqual([[10, 0, 0, 40]])
    })

    it("prefix sum on single row after updates", () => {
      const bit = new BinaryIndexedTree2D({ rows: 1, cols: 5 })
      for (let j = 0; j < 5; j++) {
        bit.update(0, j, j + 1)
      }
      expect(bit.query(0, 0)).toBe(1)
      expect(bit.query(0, 2)).toBe(6)
      expect(bit.query(0, 4)).toBe(15)
    })
  })

  describe("single column grid", () => {
    it("works as 1D BIT on single column", () => {
      const bit = new BinaryIndexedTree2D({ rows: 5, cols: 1 })
      bit.update(0, 0, 10)
      bit.update(1, 0, 20)
      bit.update(4, 0, 30)
      expect(bit.query(4, 0)).toBe(60)
    })

    it("rangeQuery on single column", () => {
      const bit = new BinaryIndexedTree2D({ rows: 5, cols: 1 })
      for (let i = 0; i < 5; i++) {
        bit.set(i, 0, (i + 1) * 10)
      }
      expect(bit.rangeQuery(1, 0, 3, 0)).toBe(20 + 30 + 40)
    })

    it("toArray on single column", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 1 })
      bit.set(0, 0, 5)
      bit.set(2, 0, 15)
      expect(bit.toArray()).toEqual([[5], [0], [15]])
    })
  })

  describe("correctness against brute force (4x4)", () => {
    it("all prefix sums match after sequential updates", () => {
      const bit = new BinaryIndexedTree2D({ rows: 4, cols: 4 })
      const grid = Array.from({ length: 4 }, () => Array(4).fill(0))
      const values = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3]
      let idx = 0
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          bit.update(i, j, values[idx]!)
          grid[i]![j] = values[idx]!
          idx++
        }
      }
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          expect(bit.query(i, j)).toBe(bruteForcePrefix(grid, i, j))
        }
      }
    })

    it("all range queries match after sequential updates", () => {
      const bit = new BinaryIndexedTree2D({ rows: 4, cols: 4 })
      const grid = Array.from({ length: 4 }, () => Array(4).fill(0))
      const values = [2, 7, 1, 8, 2, 8, 1, 8, 2, 8, 4, 5, 9, 0, 4, 5]
      let idx = 0
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          bit.update(i, j, values[idx]!)
          grid[i]![j] = values[idx]!
          idx++
        }
      }
      const testCases: [number, number, number, number][] = [
        [0, 0, 3, 3],
        [0, 0, 0, 3],
        [0, 0, 3, 0],
        [1, 1, 2, 2],
        [0, 1, 2, 3],
        [1, 0, 3, 2],
      ]
      for (const [r1, c1, r2, c2] of testCases) {
        expect(bit.rangeQuery(r1, c1, r2, c2)).toBe(bruteForceRange(grid, r1, c1, r2, c2))
      }
    })
  })

  describe("set + update interaction", () => {
    it("set then update accumulates correctly", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.set(0, 0, 10)
      bit.update(0, 0, 5)
      expect(bit.get(0, 0)).toBe(15)
      expect(bit.query(2, 2)).toBe(15)
    })

    it("update then set replaces correctly", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.update(0, 0, 10)
      bit.set(0, 0, 5)
      expect(bit.get(0, 0)).toBe(5)
      expect(bit.query(2, 2)).toBe(5)
    })

    it("mixed operations maintain consistency", () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 2 })
      bit.set(0, 0, 1)
      bit.update(0, 1, 2)
      bit.set(1, 0, 3)
      bit.update(1, 1, 4)
      expect(bit.toArray()).toEqual([
        [1, 2],
        [3, 4],
      ])
      expect(bit.query(1, 1)).toBe(10)
    })
  })

  describe("defaultValue interaction", () => {
    it("prefix sum includes default values", () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 2, defaultValue: 3 })
      expect(bit.query(1, 1)).toBe(12)
    })

    it("update adds on top of default", () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 2, defaultValue: 5 })
      bit.update(0, 0, 3)
      expect(bit.get(0, 0)).toBe(8)
      expect(bit.query(1, 1)).toBe(23)
    })

    it("set replaces default", () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 2, defaultValue: 5 })
      bit.set(0, 0, 1)
      expect(bit.get(0, 0)).toBe(1)
      expect(bit.get(0, 1)).toBe(5)
      expect(bit.query(1, 1)).toBe(16)
    })

    it("rangeQuery with default values", () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3, defaultValue: 2 })
      expect(bit.rangeQuery(0, 0, 2, 2)).toBe(18)
      expect(bit.rangeQuery(0, 0, 1, 1)).toBe(8)
    })

    it("clear resets default-initialized grid to 0", () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 2, defaultValue: 5 })
      bit.clear()
      expect(bit.query(1, 1)).toBe(0)
      expect(bit.get(0, 0)).toBe(0)
    })
  })

  describe("stress test: 100x100 grid", () => {
    it("many random updates produce correct prefix sums", () => {
      const rows = 100
      const cols = 100
      const bit = new BinaryIndexedTree2D({ rows, cols })
      const grid = Array.from({ length: rows }, () => Array(cols).fill(0))

      for (let k = 0; k < 500; k++) {
        const r = Math.floor(k / cols) % rows
        const c = k % cols
        const val = k + 1
        bit.update(r, c, val)
        grid[r]![c]! += val
      }

      expect(bit.query(0, 0)).toBe(grid[0]![0])
      expect(bit.query(rows - 1, cols - 1)).toBe(bruteForcePrefix(grid, rows - 1, cols - 1))
      expect(bit.query(49, 49)).toBe(bruteForcePrefix(grid, 49, 49))
    })

    it("many set operations produce correct values", () => {
      const rows = 100
      const cols = 100
      const bit = new BinaryIndexedTree2D({ rows, cols })
      const grid = Array.from({ length: rows }, () => Array(cols).fill(0))

      for (let k = 0; k < 200; k++) {
        const r = k % rows
        const c = Math.floor(k / rows) % cols
        const val = k * 3 + 7
        bit.set(r, c, val)
        grid[r]![c] = val
      }

      for (let i = 0; i < 10; i++) {
        const r = i * 10
        const c = i * 5
        if (r < rows && c < cols) {
          expect(bit.get(r, c)).toBe(grid[r]![c])
        }
      }
    })

    it("mixed operations on 100x100 grid", () => {
      const rows = 100
      const cols = 100
      const bit = new BinaryIndexedTree2D({ rows, cols })
      const grid = Array.from({ length: rows }, () => Array(cols).fill(0))

      for (let k = 0; k < 300; k++) {
        const r = (k * 7) % rows
        const c = (k * 13) % cols
        if (k % 3 === 0) {
          const val = k * 2
          bit.set(r, c, val)
          grid[r]![c] = val
        } else {
          const delta = k - 150
          bit.update(r, c, delta)
          grid[r]![c]! += delta
        }
      }

      expect(bit.query(99, 99)).toBe(bruteForcePrefix(grid, 99, 99))
      expect(bit.rangeQuery(0, 0, 99, 99)).toBe(bruteForceRange(grid, 0, 0, 99, 99))
      expect(bit.rangeQuery(25, 25, 75, 75)).toBe(bruteForceRange(grid, 25, 25, 75, 75))
    })

    it("clear and rebuild on 100x100 grid", () => {
      const rows = 100
      const cols = 100
      const bit = new BinaryIndexedTree2D({ rows, cols })
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          bit.update(i, j, 1)
        }
      }
      expect(bit.query(99, 99)).toBe(10000)
      bit.clear()
      expect(bit.query(99, 99)).toBe(0)
      bit.update(50, 50, 42)
      expect(bit.query(99, 99)).toBe(42)
      expect(bit.query(49, 49)).toBe(0)
    })

    it("rangeQuery on subsections of 100x100", () => {
      const rows = 100
      const cols = 100
      const bit = new BinaryIndexedTree2D({ rows, cols })
      const grid = Array.from({ length: rows }, () => Array(cols).fill(0))

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const val = i * cols + j + 1
          bit.update(i, j, val)
          grid[i]![j] = val
        }
      }

      expect(bit.rangeQuery(10, 10, 20, 20)).toBe(bruteForceRange(grid, 10, 10, 20, 20))
      expect(bit.rangeQuery(0, 0, 9, 9)).toBe(bruteForceRange(grid, 0, 0, 9, 9))
      expect(bit.rangeQuery(50, 50, 99, 99)).toBe(bruteForceRange(grid, 50, 50, 99, 99))
    })
  })
})
