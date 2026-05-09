import { describe, it, expect, beforeEach } from 'vitest'
import { FenwickTree2D } from '../../src/core/fenwick-tree-2d/fenwick-tree-2d.js'
import { DEFAULT_FENWICK_TREE_2D_OPTIONS } from '../../src/core/fenwick-tree-2d/types.js'
import type { FenwickTree2DOptions } from '../../src/core/fenwick-tree-2d/types.js'

describe('FenwickTree2D', () => {
  let ft: FenwickTree2D

  beforeEach(() => {
    ft = new FenwickTree2D(5, 5)
  })

  describe('constructor', () => {
    it('should create a tree with specified dimensions', () => {
      const t = new FenwickTree2D(3, 4)
      expect(t.getRows()).toBe(3)
      expect(t.getCols()).toBe(4)
    })

    it('should create a 1x1 tree', () => {
      const t = new FenwickTree2D(1, 1)
      expect(t.getRows()).toBe(1)
      expect(t.getCols()).toBe(1)
    })

    it('should create a tree with custom options', () => {
      const t = new FenwickTree2D(0, 0, { defaultValue: 5 })
      expect(t.query(0, 0)).toBe(5)
    })

    it('should use default defaultValue of 0', () => {
      const t = new FenwickTree2D(2, 2)
      expect(t.query(0, 0)).toBe(0)
    })

    it('should handle empty options', () => {
      const t = new FenwickTree2D(2, 2, {})
      expect(t.getRows()).toBe(2)
      expect(t.getCols()).toBe(2)
    })

    it('should handle large dimensions', () => {
      const t = new FenwickTree2D(100, 100)
      expect(t.getRows()).toBe(100)
      expect(t.getCols()).toBe(100)
    })

    it('should handle rectangular trees', () => {
      const t = new FenwickTree2D(3, 10)
      expect(t.getRows()).toBe(3)
      expect(t.getCols()).toBe(10)
    })
  })

  describe('update', () => {
    it('should add a delta at (0, 0)', () => {
      ft.update(0, 0, 10)
      expect(ft.get(0, 0)).toBe(10)
    })

    it('should add a delta at a middle position', () => {
      ft.update(2, 3, 5)
      expect(ft.get(2, 3)).toBe(5)
    })

    it('should handle negative delta', () => {
      ft.update(0, 0, 10)
      ft.update(0, 0, -3)
      expect(ft.get(0, 0)).toBe(7)
    })

    it('should handle zero delta', () => {
      ft.update(0, 0, 0)
      expect(ft.get(0, 0)).toBe(0)
    })

    it('should throw on negative row', () => {
      expect(() => ft.update(-1, 0, 5)).toThrow(RangeError)
    })

    it('should throw on negative col', () => {
      expect(() => ft.update(0, -1, 5)).toThrow(RangeError)
    })

    it('should throw on row out of bounds', () => {
      expect(() => ft.update(5, 0, 5)).toThrow(RangeError)
    })

    it('should throw on col out of bounds', () => {
      expect(() => ft.update(0, 5, 5)).toThrow(RangeError)
    })

    it('should return void', () => {
      expect(ft.update(0, 0, 5)).toBeUndefined()
    })

    it('should handle multiple updates to same cell', () => {
      ft.update(0, 0, 5)
      ft.update(0, 0, 3)
      ft.update(0, 0, 2)
      expect(ft.get(0, 0)).toBe(10)
    })

    it('should handle updates to different cells', () => {
      ft.update(0, 0, 1)
      ft.update(1, 1, 2)
      ft.update(2, 2, 3)
      expect(ft.get(0, 0)).toBe(1)
      expect(ft.get(1, 1)).toBe(2)
      expect(ft.get(2, 2)).toBe(3)
    })
  })

  describe('query', () => {
    beforeEach(() => {
      ft = FenwickTree2D.fromMatrix([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ])
    })

    it('should return value at (0, 0)', () => {
      expect(ft.query(0, 0)).toBe(1)
    })

    it('should return sum from (0,0) to (0,1)', () => {
      expect(ft.query(0, 1)).toBe(3)
    })

    it('should return sum from (0,0) to (1,0)', () => {
      expect(ft.query(1, 0)).toBe(5)
    })

    it('should return sum from (0,0) to (1,1)', () => {
      expect(ft.query(1, 1)).toBe(12)
    })

    it('should return sum from (0,0) to (2,2)', () => {
      expect(ft.query(2, 2)).toBe(45)
    })

    it('should return defaultValue for negative row', () => {
      expect(ft.query(-1, 0)).toBe(0)
    })

    it('should return defaultValue for negative col', () => {
      expect(ft.query(0, -1)).toBe(0)
    })

    it('should clamp to last row', () => {
      expect(ft.query(100, 2)).toBe(45)
    })

    it('should clamp to last col', () => {
      expect(ft.query(2, 100)).toBe(45)
    })

    it('should return defaultValue for empty-like tree', () => {
      const t = new FenwickTree2D(0, 0)
      expect(t.query(0, 0)).toBe(0)
    })
  })

  describe('rangeQuery', () => {
    beforeEach(() => {
      ft = FenwickTree2D.fromMatrix([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ])
    })

    it('should return single cell sum', () => {
      expect(ft.rangeQuery(1, 1, 1, 1)).toBe(5)
    })

    it('should return first row range', () => {
      expect(ft.rangeQuery(0, 0, 0, 2)).toBe(6)
    })

    it('should return first col range', () => {
      expect(ft.rangeQuery(0, 0, 2, 0)).toBe(12)
    })

    it('should return full matrix sum', () => {
      expect(ft.rangeQuery(0, 0, 2, 2)).toBe(45)
    })

    it('should return submatrix sum', () => {
      expect(ft.rangeQuery(1, 1, 2, 2)).toBe(28)
    })

    it('should return correct 2x2 submatrix from top-left', () => {
      expect(ft.rangeQuery(0, 0, 1, 1)).toBe(12)
    })

    it('should return correct 2x2 submatrix from bottom-right', () => {
      expect(ft.rangeQuery(1, 1, 2, 2)).toBe(5 + 6 + 8 + 9)
    })

    it('should return defaultValue for inverted rows', () => {
      expect(ft.rangeQuery(2, 0, 0, 2)).toBe(0)
    })

    it('should return defaultValue for inverted cols', () => {
      expect(ft.rangeQuery(0, 2, 2, 0)).toBe(0)
    })

    it('should return single row range', () => {
      expect(ft.rangeQuery(1, 0, 1, 2)).toBe(15)
    })

    it('should return single col range', () => {
      expect(ft.rangeQuery(0, 1, 2, 1)).toBe(15)
    })

    it('should handle range starting from row 0 col 0', () => {
      expect(ft.rangeQuery(0, 0, 2, 2)).toBe(45)
    })

    it('should handle range starting from row 0 only', () => {
      expect(ft.rangeQuery(0, 1, 2, 2)).toBe(8 + 9 + 5 + 6 + 2 + 3)
    })

    it('should handle range starting from col 0 only', () => {
      expect(ft.rangeQuery(1, 0, 2, 2)).toBe(4 + 5 + 6 + 7 + 8 + 9)
    })
  })

  describe('get', () => {
    beforeEach(() => {
      ft = FenwickTree2D.fromMatrix([
        [10, 20, 30],
        [40, 50, 60],
      ])
    })

    it('should return value at (0, 0)', () => {
      expect(ft.get(0, 0)).toBe(10)
    })

    it('should return value at (0, 1)', () => {
      expect(ft.get(0, 1)).toBe(20)
    })

    it('should return value at (1, 0)', () => {
      expect(ft.get(1, 0)).toBe(40)
    })

    it('should return value at (1, 2)', () => {
      expect(ft.get(1, 2)).toBe(60)
    })

    it('should throw on negative row', () => {
      expect(() => ft.get(-1, 0)).toThrow(RangeError)
    })

    it('should throw on negative col', () => {
      expect(() => ft.get(0, -1)).toThrow(RangeError)
    })

    it('should throw on row out of bounds', () => {
      expect(() => ft.get(2, 0)).toThrow(RangeError)
    })

    it('should throw on col out of bounds', () => {
      expect(() => ft.get(0, 3)).toThrow(RangeError)
    })

    it('should reflect updates', () => {
      ft.update(0, 0, 100)
      expect(ft.get(0, 0)).toBe(110)
    })
  })

  describe('set', () => {
    beforeEach(() => {
      ft = FenwickTree2D.fromMatrix([
        [1, 2, 3],
        [4, 5, 6],
      ])
    })

    it('should set a value at a position', () => {
      ft.set(0, 0, 100)
      expect(ft.get(0, 0)).toBe(100)
    })

    it('should update prefix sums after set', () => {
      ft.set(0, 0, 10)
      expect(ft.query(1, 2)).toBe(10 + 2 + 3 + 4 + 5 + 6)
    })

    it('should throw on negative row', () => {
      expect(() => ft.set(-1, 0, 5)).toThrow(RangeError)
    })

    it('should throw on negative col', () => {
      expect(() => ft.set(0, -1, 5)).toThrow(RangeError)
    })

    it('should throw on row out of bounds', () => {
      expect(() => ft.set(2, 0, 5)).toThrow(RangeError)
    })

    it('should throw on col out of bounds', () => {
      expect(() => ft.set(0, 3, 5)).toThrow(RangeError)
    })

    it('should handle setting same value', () => {
      ft.set(0, 0, 1)
      expect(ft.get(0, 0)).toBe(1)
    })

    it('should return void', () => {
      expect(ft.set(0, 0, 99)).toBeUndefined()
    })

    it('should handle setting negative value', () => {
      ft.set(1, 1, -10)
      expect(ft.get(1, 1)).toBe(-10)
    })

    it('should handle setting zero', () => {
      ft.set(0, 0, 0)
      expect(ft.get(0, 0)).toBe(0)
    })
  })

  describe('getRows', () => {
    it('should return correct row count', () => {
      const t = new FenwickTree2D(3, 5)
      expect(t.getRows()).toBe(3)
    })

    it('should return 0 for empty tree', () => {
      const t = new FenwickTree2D(0, 0)
      expect(t.getRows()).toBe(0)
    })
  })

  describe('getCols', () => {
    it('should return correct col count', () => {
      const t = new FenwickTree2D(3, 5)
      expect(t.getCols()).toBe(5)
    })

    it('should return 0 for empty tree', () => {
      const t = new FenwickTree2D(0, 0)
      expect(t.getCols()).toBe(0)
    })
  })

  describe('toArray', () => {
    it('should return empty array for 0x0 tree', () => {
      const t = new FenwickTree2D(0, 0)
      expect(t.toArray()).toEqual([])
    })

    it('should return original matrix after fromMatrix', () => {
      const data = [
        [1, 2],
        [3, 4],
      ]
      const t = FenwickTree2D.fromMatrix(data)
      expect(t.toArray()).toEqual(data)
    })

    it('should reflect updates', () => {
      const data = [
        [1, 2],
        [3, 4],
      ]
      const t = FenwickTree2D.fromMatrix(data)
      t.update(0, 0, 10)
      expect(t.toArray()).toEqual([
        [11, 2],
        [3, 4],
      ])
    })

    it('should reflect sets', () => {
      const data = [
        [1, 2],
        [3, 4],
      ]
      const t = FenwickTree2D.fromMatrix(data)
      t.set(1, 1, 100)
      expect(t.toArray()).toEqual([
        [1, 2],
        [3, 100],
      ])
    })

    it('should return zeros for fresh tree', () => {
      const t = new FenwickTree2D(2, 3)
      expect(t.toArray()).toEqual([
        [0, 0, 0],
        [0, 0, 0],
      ])
    })

    it('should return 1x1 matrix', () => {
      const t = new FenwickTree2D(1, 1)
      t.update(0, 0, 42)
      expect(t.toArray()).toEqual([[42]])
    })
  })

  describe('fromMatrix', () => {
    it('should create tree from a matrix', () => {
      const t = FenwickTree2D.fromMatrix([
        [1, 2],
        [3, 4],
      ])
      expect(t.getRows()).toBe(2)
      expect(t.getCols()).toBe(2)
    })

    it('should produce correct query results', () => {
      const t = FenwickTree2D.fromMatrix([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ])
      expect(t.query(2, 2)).toBe(45)
    })

    it('should handle 1x1 matrix', () => {
      const t = FenwickTree2D.fromMatrix([[42]])
      expect(t.get(0, 0)).toBe(42)
    })

    it('should handle single row matrix', () => {
      const t = FenwickTree2D.fromMatrix([[1, 2, 3, 4, 5]])
      expect(t.getRows()).toBe(1)
      expect(t.getCols()).toBe(5)
      expect(t.query(0, 4)).toBe(15)
    })

    it('should handle single column matrix', () => {
      const t = FenwickTree2D.fromMatrix([[1], [2], [3]])
      expect(t.getRows()).toBe(3)
      expect(t.getCols()).toBe(1)
      expect(t.query(2, 0)).toBe(6)
    })

    it('should handle matrix of zeros', () => {
      const t = FenwickTree2D.fromMatrix([
        [0, 0],
        [0, 0],
      ])
      expect(t.toArray()).toEqual([
        [0, 0],
        [0, 0],
      ])
    })

    it('should handle matrix with negative values', () => {
      const t = FenwickTree2D.fromMatrix([
        [-1, 2],
        [3, -4],
      ])
      expect(t.query(1, 1)).toBe(0)
    })

    it('should handle empty matrix', () => {
      const t = FenwickTree2D.fromMatrix([])
      expect(t.getRows()).toBe(0)
      expect(t.getCols()).toBe(0)
    })

    it('should handle large matrix', () => {
      const data = Array.from({ length: 50 }, (_, i) =>
        Array.from({ length: 50 }, (_, j) => i * 50 + j + 1)
      )
      const t = FenwickTree2D.fromMatrix(data)
      expect(t.query(49, 49)).toBe((50 * 50 * (50 * 50 + 1)) / 2)
    })
  })

  describe('clone', () => {
    it('should create an independent copy', () => {
      const original = FenwickTree2D.fromMatrix([
        [1, 2],
        [3, 4],
      ])
      const copy = original.clone()
      expect(copy.toArray()).toEqual([
        [1, 2],
        [3, 4],
      ])
    })

    it('should not affect original after modifying clone', () => {
      const original = FenwickTree2D.fromMatrix([
        [1, 2],
        [3, 4],
      ])
      const copy = original.clone()
      copy.set(0, 0, 100)
      expect(original.get(0, 0)).toBe(1)
      expect(copy.get(0, 0)).toBe(100)
    })

    it('should not affect clone after modifying original', () => {
      const original = FenwickTree2D.fromMatrix([
        [1, 2],
        [3, 4],
      ])
      const copy = original.clone()
      original.set(0, 0, 999)
      expect(copy.get(0, 0)).toBe(1)
    })

    it('should preserve dimensions', () => {
      const original = new FenwickTree2D(3, 7)
      const copy = original.clone()
      expect(copy.getRows()).toBe(3)
      expect(copy.getCols()).toBe(7)
    })

    it('should preserve values after multiple updates', () => {
      const original = new FenwickTree2D(2, 2)
      original.update(0, 0, 10)
      original.update(1, 1, 20)
      const copy = original.clone()
      expect(copy.get(0, 0)).toBe(10)
      expect(copy.get(1, 1)).toBe(20)
    })
  })

  describe('reset', () => {
    it('should reset all values to zero', () => {
      const t = FenwickTree2D.fromMatrix([
        [1, 2],
        [3, 4],
      ])
      t.reset()
      expect(t.toArray()).toEqual([
        [0, 0],
        [0, 0],
      ])
    })

    it('should preserve dimensions after reset', () => {
      const t = FenwickTree2D.fromMatrix([
        [1, 2],
        [3, 4],
      ])
      t.reset()
      expect(t.getRows()).toBe(2)
      expect(t.getCols()).toBe(2)
    })

    it('should allow updates after reset', () => {
      const t = FenwickTree2D.fromMatrix([
        [1, 2],
        [3, 4],
      ])
      t.reset()
      t.update(0, 0, 42)
      expect(t.get(0, 0)).toBe(42)
    })

    it('should return void', () => {
      expect(ft.reset()).toBeUndefined()
    })

    it('should handle reset on fresh tree', () => {
      const t = new FenwickTree2D(3, 3)
      t.reset()
      expect(t.toArray()).toEqual([
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ])
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_FENWICK_TREE_2D_OPTIONS', () => {
      expect(DEFAULT_FENWICK_TREE_2D_OPTIONS.defaultValue).toBe(0)
    })

    it('should support FenwickTree2DOptions interface', () => {
      const opts: FenwickTree2DOptions = { defaultValue: 42 }
      expect(opts.defaultValue).toBe(42)
    })
  })

  describe('integration', () => {
    it('should handle typical 2D prefix sum workflow', () => {
      const t = FenwickTree2D.fromMatrix([
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16],
      ])
      expect(t.rangeQuery(1, 1, 2, 2)).toBe(6 + 7 + 10 + 11)
      t.update(1, 1, 100)
      expect(t.rangeQuery(1, 1, 2, 2)).toBe(106 + 7 + 10 + 11)
    })

    it('should handle point updates and range queries', () => {
      const t = new FenwickTree2D(4, 4)
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          t.update(i, j, i * 4 + j + 1)
        }
      }
      expect(t.query(3, 3)).toBe(136)
      expect(t.rangeQuery(1, 1, 2, 2)).toBe(6 + 7 + 10 + 11)
    })

    it('should handle many updates correctly', () => {
      const t = new FenwickTree2D(10, 10)
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          t.update(i, j, 1)
        }
      }
      expect(t.query(9, 9)).toBe(100)
      expect(t.rangeQuery(4, 4, 6, 6)).toBe(9)
    })

    it('should handle set and get round-trip', () => {
      const t = new FenwickTree2D(3, 3)
      t.set(0, 0, 10)
      t.set(1, 1, 20)
      t.set(2, 2, 30)
      expect(t.toArray()).toEqual([
        [10, 0, 0],
        [0, 20, 0],
        [0, 0, 30],
      ])
    })

    it('should handle negative values throughout', () => {
      const t = FenwickTree2D.fromMatrix([
        [-1, -2, -3],
        [-4, -5, -6],
        [-7, -8, -9],
      ])
      expect(t.query(2, 2)).toBe(-45)
      expect(t.rangeQuery(1, 1, 2, 2)).toBe(-5 + -6 + -8 + -9)
    })

    it('should handle clone, modify, and verify independence', () => {
      const t = FenwickTree2D.fromMatrix([
        [1, 2],
        [3, 4],
      ])
      const c = t.clone()
      c.update(0, 0, 100)
      expect(t.query(1, 1)).toBe(10)
      expect(c.query(1, 1)).toBe(110)
    })

    it('should handle reset and rebuild workflow', () => {
      const t = FenwickTree2D.fromMatrix([
        [1, 2],
        [3, 4],
      ])
      expect(t.query(1, 1)).toBe(10)
      t.reset()
      expect(t.query(1, 1)).toBe(0)
      t.update(0, 0, 100)
      expect(t.query(1, 1)).toBe(100)
    })

    it('should handle single element tree operations', () => {
      const t = new FenwickTree2D(1, 1)
      expect(t.get(0, 0)).toBe(0)
      t.update(0, 0, 42)
      expect(t.get(0, 0)).toBe(42)
      expect(t.query(0, 0)).toBe(42)
      expect(t.rangeQuery(0, 0, 0, 0)).toBe(42)
      expect(t.toArray()).toEqual([[42]])
      t.set(0, 0, 100)
      expect(t.get(0, 0)).toBe(100)
    })

    it('should handle rectangular non-square matrices', () => {
      const t = FenwickTree2D.fromMatrix([
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9, 10],
      ])
      expect(t.rangeQuery(0, 1, 0, 3)).toBe(2 + 3 + 4)
      expect(t.rangeQuery(0, 0, 1, 4)).toBe(55)
      expect(t.rangeQuery(1, 2, 1, 4)).toBe(8 + 9 + 10)
    })

    it('should handle sparse matrix pattern', () => {
      const t = new FenwickTree2D(5, 5)
      t.set(0, 0, 1)
      t.set(2, 2, 1)
      t.set(4, 4, 1)
      expect(t.query(4, 4)).toBe(3)
      expect(t.rangeQuery(0, 0, 2, 2)).toBe(2)
      expect(t.rangeQuery(3, 3, 4, 4)).toBe(1)
    })

    it('should handle updates after fromMatrix', () => {
      const t = FenwickTree2D.fromMatrix([
        [1, 2],
        [3, 4],
      ])
      t.update(0, 1, 10)
      expect(t.get(0, 1)).toBe(12)
      expect(t.query(1, 1)).toBe(20)
    })

    it('should handle set after fromMatrix', () => {
      const t = FenwickTree2D.fromMatrix([
        [1, 2],
        [3, 4],
      ])
      t.set(1, 0, 100)
      expect(t.get(1, 0)).toBe(100)
      expect(t.toArray()).toEqual([
        [1, 2],
        [100, 4],
      ])
    })

    it('should handle decimal/floating point values', () => {
      const t = FenwickTree2D.fromMatrix([
        [0.5, 1.5],
        [2.5, 3.5],
      ])
      expect(t.query(1, 1)).toBeCloseTo(8)
      expect(t.get(0, 0)).toBeCloseTo(0.5)
    })

    it('should handle update after reset after fromMatrix', () => {
      const t = FenwickTree2D.fromMatrix([
        [10, 20],
        [30, 40],
      ])
      t.reset()
      t.update(0, 0, 5)
      expect(t.query(0, 0)).toBe(5)
      expect(t.query(1, 1)).toBe(5)
    })

    it('should handle clone of modified tree', () => {
      const t = new FenwickTree2D(3, 3)
      t.update(1, 1, 7)
      t.update(2, 0, 3)
      const c = t.clone()
      expect(c.get(1, 1)).toBe(7)
      expect(c.get(2, 0)).toBe(3)
      expect(c.get(0, 0)).toBe(0)
    })

    it('should verify correctness against brute force', () => {
      const rows = 6
      const cols = 6
      const matrix = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => Math.floor(Math.random() * 100))
      )
      const t = FenwickTree2D.fromMatrix(matrix)
      for (let r1 = 0; r1 < rows; r1++) {
        for (let c1 = 0; c1 < cols; c1++) {
          for (let r2 = r1; r2 < rows; r2++) {
            for (let c2 = c1; c2 < cols; c2++) {
              let expected = 0
              for (let i = r1; i <= r2; i++) {
                for (let j = c1; j <= c2; j++) {
                  expected += matrix[i]![j]!
                }
              }
              expect(t.rangeQuery(r1, c1, r2, c2)).toBe(expected)
            }
          }
        }
      }
    })
  })

  describe('edge cases', () => {
    it('should handle 1xN tree correctly', () => {
      const t = new FenwickTree2D(1, 5)
      t.update(0, 0, 1)
      t.update(0, 1, 2)
      t.update(0, 2, 3)
      t.update(0, 3, 4)
      t.update(0, 4, 5)
      expect(t.rangeQuery(0, 0, 0, 4)).toBe(15)
      expect(t.rangeQuery(0, 2, 0, 4)).toBe(12)
    })

    it('should handle Nx1 tree correctly', () => {
      const t = new FenwickTree2D(5, 1)
      t.update(0, 0, 10)
      t.update(1, 0, 20)
      t.update(2, 0, 30)
      t.update(3, 0, 40)
      t.update(4, 0, 50)
      expect(t.rangeQuery(0, 0, 4, 0)).toBe(150)
      expect(t.rangeQuery(2, 0, 4, 0)).toBe(120)
    })

    it('should handle setting all cells to same value', () => {
      const t = new FenwickTree2D(3, 3)
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          t.set(i, j, 5)
        }
      }
      expect(t.query(2, 2)).toBe(45)
    })

    it('should handle alternating positive negative', () => {
      const t = FenwickTree2D.fromMatrix([
        [1, -1],
        [-1, 1],
      ])
      expect(t.query(1, 1)).toBe(0)
      expect(t.rangeQuery(0, 0, 0, 1)).toBe(0)
    })

    it('should handle large delta values', () => {
      const t = new FenwickTree2D(3, 3)
      t.update(1, 1, Number.MAX_SAFE_INTEGER / 2)
      expect(t.get(1, 1)).toBe(Number.MAX_SAFE_INTEGER / 2)
    })

    it('should handle toArray on 1x1', () => {
      const t = new FenwickTree2D(1, 1)
      expect(t.toArray()).toEqual([[0]])
      t.update(0, 0, 7)
      expect(t.toArray()).toEqual([[7]])
    })

    it('should handle rangeQuery on boundary cells', () => {
      const t = FenwickTree2D.fromMatrix([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ])
      expect(t.rangeQuery(0, 0, 0, 0)).toBe(1)
      expect(t.rangeQuery(2, 2, 2, 2)).toBe(9)
      expect(t.rangeQuery(0, 2, 0, 2)).toBe(3)
      expect(t.rangeQuery(2, 0, 2, 2)).toBe(24)
    })

    it('should handle query at exact boundaries', () => {
      const t = FenwickTree2D.fromMatrix([
        [1, 2],
        [3, 4],
      ])
      expect(t.query(0, 0)).toBe(1)
      expect(t.query(0, 1)).toBe(3)
      expect(t.query(1, 0)).toBe(4)
      expect(t.query(1, 1)).toBe(10)
    })

    it('should handle multiple resets', () => {
      const t = new FenwickTree2D(2, 2)
      t.update(0, 0, 5)
      t.reset()
      t.update(0, 0, 10)
      t.reset()
      t.update(0, 0, 20)
      expect(t.get(0, 0)).toBe(20)
    })

    it('should handle fromMatrix then toArray roundtrip with updates', () => {
      const data = [
        [1, 2],
        [3, 4],
      ]
      const t = FenwickTree2D.fromMatrix(data)
      const arr = t.toArray()
      expect(arr).toEqual(data)
      t.update(0, 0, 100)
      expect(t.toArray()).not.toEqual(data)
      expect(t.toArray()[0]![0]).toBe(101)
    })

    it('should handle get at corner positions', () => {
      const t = FenwickTree2D.fromMatrix([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ])
      expect(t.get(0, 2)).toBe(3)
      expect(t.get(2, 0)).toBe(7)
      expect(t.get(2, 2)).toBe(9)
      expect(t.get(0, 0)).toBe(1)
    })

    it('should handle update at last position', () => {
      const t = new FenwickTree2D(3, 3)
      t.update(2, 2, 42)
      expect(t.get(2, 2)).toBe(42)
    })

    it('should handle get at first row edge case', () => {
      const t = FenwickTree2D.fromMatrix([[5, 10, 15]])
      expect(t.get(0, 0)).toBe(5)
      expect(t.get(0, 1)).toBe(10)
      expect(t.get(0, 2)).toBe(15)
    })

    it('should handle get at first col edge case', () => {
      const t = FenwickTree2D.fromMatrix([[5], [10], [15]])
      expect(t.get(0, 0)).toBe(5)
      expect(t.get(1, 0)).toBe(10)
      expect(t.get(2, 0)).toBe(15)
    })

    it('should handle rangeQuery with both r1 and c1 at 0', () => {
      const t = FenwickTree2D.fromMatrix([
        [1, 2],
        [3, 4],
      ])
      expect(t.rangeQuery(0, 0, 1, 1)).toBe(10)
    })

    it('should handle rangeQuery with r1 at 0 only', () => {
      const t = FenwickTree2D.fromMatrix([
        [1, 2, 3],
        [4, 5, 6],
      ])
      expect(t.rangeQuery(0, 1, 1, 2)).toBe(2 + 3 + 5 + 6)
    })

    it('should handle rangeQuery with c1 at 0 only', () => {
      const t = FenwickTree2D.fromMatrix([
        [1, 2],
        [3, 4],
        [5, 6],
      ])
      expect(t.rangeQuery(1, 0, 2, 1)).toBe(3 + 4 + 5 + 6)
    })

    it('should handle update on 0x0 tree via error', () => {
      const t = new FenwickTree2D(0, 0)
      expect(() => t.update(0, 0, 1)).toThrow(RangeError)
    })

    it('should handle get on 0x0 tree via error', () => {
      const t = new FenwickTree2D(0, 0)
      expect(() => t.get(0, 0)).toThrow(RangeError)
    })

    it('should handle set on 0x0 tree via error', () => {
      const t = new FenwickTree2D(0, 0)
      expect(() => t.set(0, 0, 1)).toThrow(RangeError)
    })

    it('should handle cloning empty tree', () => {
      const t = new FenwickTree2D(0, 0)
      const c = t.clone()
      expect(c.getRows()).toBe(0)
      expect(c.getCols()).toBe(0)
    })

    it('should handle resetting empty tree', () => {
      const t = new FenwickTree2D(0, 0)
      t.reset()
      expect(t.getRows()).toBe(0)
      expect(t.getCols()).toBe(0)
    })
  })
})
