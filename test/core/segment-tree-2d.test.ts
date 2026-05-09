import { describe, it, expect } from 'vitest'
import { SegmentTree2D } from '../../src/core/segment-tree-2d/segment-tree-2d.js'
import { SUM_2D, MIN_2D, MAX_2D, DEFAULT_SEGMENT_TREE_2D_OPTIONS } from '../../src/core/segment-tree-2d/types.js'
import type { SegmentTree2DOptions } from '../../src/core/segment-tree-2d/types.js'

describe('SegmentTree2D', () => {
  describe('constructor', () => {
    it('should create from a 3x3 matrix', () => {
      const st = new SegmentTree2D([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
      expect(st.getRows()).toBe(3)
      expect(st.getCols()).toBe(3)
    })

    it('should create from a 1x1 matrix', () => {
      const st = new SegmentTree2D([[42]])
      expect(st.getRows()).toBe(1)
      expect(st.getCols()).toBe(1)
    })

    it('should create from an empty matrix', () => {
      const st = new SegmentTree2D([])
      expect(st.getRows()).toBe(0)
      expect(st.getCols()).toBe(0)
    })

    it('should use default options (sum) when none provided', () => {
      const st = new SegmentTree2D([[1, 2], [3, 4]])
      expect(st.query(0, 0, 1, 1)).toBe(10)
    })

    it('should accept custom identity and combine', () => {
      const st = new SegmentTree2D([[1, 2], [3, 4]], {
        identity: 1,
        combine: (a, b) => a * b,
      })
      expect(st.query(0, 0, 1, 1)).toBe(24)
    })

    it('should create from a single-row matrix', () => {
      const st = new SegmentTree2D([[1, 2, 3, 4, 5]])
      expect(st.getRows()).toBe(1)
      expect(st.getCols()).toBe(5)
      expect(st.query(0, 0, 0, 4)).toBe(15)
    })

    it('should create from a single-column matrix', () => {
      const st = new SegmentTree2D([[1], [2], [3], [4]])
      expect(st.getRows()).toBe(4)
      expect(st.getCols()).toBe(1)
      expect(st.query(0, 0, 3, 0)).toBe(10)
    })

    it('should create from a 2x2 matrix', () => {
      const st = new SegmentTree2D([[1, 2], [3, 4]])
      expect(st.query(0, 0, 1, 1)).toBe(10)
    })

    it('should create from a 4x4 power-of-two matrix', () => {
      const data = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16],
      ]
      const st = new SegmentTree2D(data)
      expect(st.query(0, 0, 3, 3)).toBe(136)
    })

    it('should handle negative values', () => {
      const st = new SegmentTree2D([[-1, -2], [-3, -4]])
      expect(st.query(0, 0, 1, 1)).toBe(-10)
    })

    it('should handle floating point values', () => {
      const st = new SegmentTree2D([[1.5, 2.5], [3.0, 4.5]])
      expect(st.query(0, 0, 1, 1)).toBeCloseTo(11.5)
    })

    it('should handle zero values', () => {
      const st = new SegmentTree2D([[0, 0], [0, 0]])
      expect(st.query(0, 0, 1, 1)).toBe(0)
    })
  })

  describe('static factories', () => {
    it('createSum should compute sum queries', () => {
      const st = SegmentTree2D.createSum([[1, 2], [3, 4]])
      expect(st.query(0, 0, 1, 1)).toBe(10)
    })

    it('createSum should work on larger matrix', () => {
      const st = SegmentTree2D.createSum([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
      expect(st.query(0, 0, 2, 2)).toBe(45)
      expect(st.query(0, 0, 0, 2)).toBe(6)
      expect(st.query(1, 1, 2, 2)).toBe(28)
    })

    it('createMin should compute min queries', () => {
      const st = SegmentTree2D.createMin([[5, 3], [8, 1]])
      expect(st.query(0, 0, 1, 1)).toBe(1)
      expect(st.query(0, 0, 0, 1)).toBe(3)
      expect(st.query(1, 0, 1, 1)).toBe(1)
    })

    it('createMin should work on larger matrix', () => {
      const data = [
        [9, 2, 7],
        [4, 1, 8],
        [6, 3, 5],
      ]
      const st = SegmentTree2D.createMin(data)
      expect(st.query(0, 0, 2, 2)).toBe(1)
      expect(st.query(0, 0, 1, 1)).toBe(1)
      expect(st.query(1, 1, 2, 2)).toBe(1)
      expect(st.query(0, 2, 0, 2)).toBe(7)
    })

    it('createMax should compute max queries', () => {
      const st = SegmentTree2D.createMax([[5, 3], [8, 1]])
      expect(st.query(0, 0, 1, 1)).toBe(8)
      expect(st.query(0, 0, 0, 1)).toBe(5)
      expect(st.query(1, 0, 1, 1)).toBe(8)
    })

    it('createMax should work on larger matrix', () => {
      const data = [
        [9, 2, 7],
        [4, 1, 8],
        [6, 3, 5],
      ]
      const st = SegmentTree2D.createMax(data)
      expect(st.query(0, 0, 2, 2)).toBe(9)
      expect(st.query(1, 0, 1, 2)).toBe(8)
      expect(st.query(0, 0, 0, 0)).toBe(9)
      expect(st.query(2, 2, 2, 2)).toBe(5)
    })

    it('createSum on empty matrix returns 0', () => {
      const st = SegmentTree2D.createSum([])
      expect(st.query(0, 0, 0, 0)).toBe(0)
    })

    it('createMin on empty matrix returns Infinity', () => {
      const st = SegmentTree2D.createMin([])
      expect(st.query(0, 0, 0, 0)).toBe(Infinity)
    })

    it('createMax on empty matrix returns -Infinity', () => {
      const st = SegmentTree2D.createMax([])
      expect(st.query(0, 0, 0, 0)).toBe(-Infinity)
    })
  })

  describe('query (sum)', () => {
    const st = SegmentTree2D.createSum([
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12],
      [13, 14, 15, 16],
    ])

    it('should query entire matrix', () => {
      expect(st.query(0, 0, 3, 3)).toBe(136)
    })

    it('should query single cell', () => {
      expect(st.query(0, 0, 0, 0)).toBe(1)
      expect(st.query(2, 3, 2, 3)).toBe(12)
      expect(st.query(3, 3, 3, 3)).toBe(16)
    })

    it('should query single row', () => {
      expect(st.query(0, 0, 0, 3)).toBe(10)
      expect(st.query(2, 0, 2, 3)).toBe(42)
    })

    it('should query single column', () => {
      expect(st.query(0, 0, 3, 0)).toBe(28)
      expect(st.query(0, 3, 3, 3)).toBe(40)
    })

    it('should query top-left submatrix', () => {
      expect(st.query(0, 0, 1, 1)).toBe(14)
    })

    it('should query bottom-right submatrix', () => {
      expect(st.query(2, 2, 3, 3)).toBe(54)
    })

    it('should query middle submatrix', () => {
      expect(st.query(1, 1, 2, 2)).toBe(34)
    })

    it('should query two adjacent rows', () => {
      expect(st.query(0, 0, 1, 3)).toBe(36)
      expect(st.query(2, 0, 3, 3)).toBe(100)
    })

    it('should query two adjacent columns', () => {
      expect(st.query(0, 0, 3, 1)).toBe(60)
      expect(st.query(0, 2, 3, 3)).toBe(76)
    })

    it('should query non-square submatrix', () => {
      expect(st.query(0, 0, 2, 1)).toBe(33)
      expect(st.query(1, 1, 3, 3)).toBe(99)
    })
  })

  describe('query validation', () => {
    const st = SegmentTree2D.createSum([[1, 2], [3, 4]])

    it('should throw for negative r1', () => {
      expect(() => st.query(-1, 0, 1, 1)).toThrow(RangeError)
    })

    it('should throw for r2 >= rows', () => {
      expect(() => st.query(0, 0, 2, 1)).toThrow(RangeError)
    })

    it('should throw for r1 > r2', () => {
      expect(() => st.query(1, 0, 0, 1)).toThrow(RangeError)
    })

    it('should throw for negative c1', () => {
      expect(() => st.query(0, -1, 1, 1)).toThrow(RangeError)
    })

    it('should throw for c2 >= cols', () => {
      expect(() => st.query(0, 0, 1, 2)).toThrow(RangeError)
    })

    it('should throw for c1 > c2', () => {
      expect(() => st.query(0, 1, 1, 0)).toThrow(RangeError)
    })

    it('should throw for all invalid indices', () => {
      expect(() => st.query(-2, -2, 10, 10)).toThrow(RangeError)
    })
  })

  describe('update', () => {
    it('should update a cell and reflect in query (sum)', () => {
      const st = SegmentTree2D.createSum([[1, 2], [3, 4]])
      st.update(0, 0, 10)
      expect(st.get(0, 0)).toBe(10)
      expect(st.query(0, 0, 1, 1)).toBe(19)
    })

    it('should update a cell and reflect in query (min)', () => {
      const st = SegmentTree2D.createMin([[5, 3], [8, 1]])
      st.update(0, 0, -5)
      expect(st.query(0, 0, 1, 1)).toBe(-5)
    })

    it('should update a cell and reflect in query (max)', () => {
      const st = SegmentTree2D.createMax([[5, 3], [8, 1]])
      st.update(1, 1, 100)
      expect(st.query(0, 0, 1, 1)).toBe(100)
    })

    it('should update to zero', () => {
      const st = SegmentTree2D.createSum([[1, 2], [3, 4]])
      st.update(0, 0, 0)
      expect(st.get(0, 0)).toBe(0)
      expect(st.query(0, 0, 1, 1)).toBe(9)
    })

    it('should update to negative value', () => {
      const st = SegmentTree2D.createSum([[1, 2], [3, 4]])
      st.update(1, 1, -10)
      expect(st.get(1, 1)).toBe(-10)
      expect(st.query(0, 0, 1, 1)).toBe(-4)
    })

    it('should update to floating point', () => {
      const st = SegmentTree2D.createSum([[1, 2], [3, 4]])
      st.update(0, 0, 1.5)
      expect(st.get(0, 0)).toBeCloseTo(1.5)
    })

    it('should throw for negative row', () => {
      const st = SegmentTree2D.createSum([[1, 2], [3, 4]])
      expect(() => st.update(-1, 0, 5)).toThrow(RangeError)
    })

    it('should throw for row >= rows', () => {
      const st = SegmentTree2D.createSum([[1, 2], [3, 4]])
      expect(() => st.update(2, 0, 5)).toThrow(RangeError)
    })

    it('should throw for negative col', () => {
      const st = SegmentTree2D.createSum([[1, 2], [3, 4]])
      expect(() => st.update(0, -1, 5)).toThrow(RangeError)
    })

    it('should throw for col >= cols', () => {
      const st = SegmentTree2D.createSum([[1, 2], [3, 4]])
      expect(() => st.update(0, 2, 5)).toThrow(RangeError)
    })

    it('should throw for update on empty tree', () => {
      const st = SegmentTree2D.createSum([])
      expect(() => st.update(0, 0, 5)).toThrow(RangeError)
    })

    it('should handle multiple sequential updates', () => {
      const st = SegmentTree2D.createSum([[1, 2], [3, 4]])
      st.update(0, 0, 10)
      st.update(1, 1, 20)
      st.update(0, 1, 30)
      expect(st.query(0, 0, 1, 1)).toBe(63)
      expect(st.get(0, 0)).toBe(10)
      expect(st.get(0, 1)).toBe(30)
      expect(st.get(1, 0)).toBe(3)
      expect(st.get(1, 1)).toBe(20)
    })

    it('should return void', () => {
      const st = SegmentTree2D.createSum([[1, 2], [3, 4]])
      expect(st.update(0, 0, 10)).toBeUndefined()
    })
  })

  describe('get', () => {
    const st = SegmentTree2D.createSum([[1, 2, 3], [4, 5, 6], [7, 8, 9]])

    it('should get top-left cell', () => {
      expect(st.get(0, 0)).toBe(1)
    })

    it('should get bottom-right cell', () => {
      expect(st.get(2, 2)).toBe(9)
    })

    it('should get middle cell', () => {
      expect(st.get(1, 1)).toBe(5)
    })

    it('should throw for negative row', () => {
      expect(() => st.get(-1, 0)).toThrow(RangeError)
    })

    it('should throw for row >= rows', () => {
      expect(() => st.get(3, 0)).toThrow(RangeError)
    })

    it('should throw for negative col', () => {
      expect(() => st.get(0, -1)).toThrow(RangeError)
    })

    it('should throw for col >= cols', () => {
      expect(() => st.get(0, 3)).toThrow(RangeError)
    })

    it('should reflect updates', () => {
      const s = SegmentTree2D.createSum([[1, 2], [3, 4]])
      s.update(0, 0, 99)
      expect(s.get(0, 0)).toBe(99)
    })

    it('should throw for empty tree', () => {
      const s = SegmentTree2D.createSum([])
      expect(() => s.get(0, 0)).toThrow(RangeError)
    })
  })

  describe('getRows and getCols', () => {
    it('should return 0 rows for empty matrix', () => {
      const st = new SegmentTree2D([])
      expect(st.getRows()).toBe(0)
    })

    it('should return 0 cols for empty matrix', () => {
      const st = new SegmentTree2D([])
      expect(st.getCols()).toBe(0)
    })

    it('should return correct dimensions for 3x4 matrix', () => {
      const st = new SegmentTree2D([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]])
      expect(st.getRows()).toBe(3)
      expect(st.getCols()).toBe(4)
    })

    it('should return correct dimensions for 1x1 matrix', () => {
      const st = new SegmentTree2D([[7]])
      expect(st.getRows()).toBe(1)
      expect(st.getCols()).toBe(1)
    })

    it('should return correct dimensions for 1x5 matrix', () => {
      const st = new SegmentTree2D([[1, 2, 3, 4, 5]])
      expect(st.getRows()).toBe(1)
      expect(st.getCols()).toBe(5)
    })

    it('should return correct dimensions for 5x1 matrix', () => {
      const st = new SegmentTree2D([[1], [2], [3], [4], [5]])
      expect(st.getRows()).toBe(5)
      expect(st.getCols()).toBe(1)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty tree', () => {
      const st = new SegmentTree2D([])
      expect(st.toArray()).toEqual([])
    })

    it('should return copy of data', () => {
      const st = new SegmentTree2D([[1, 2], [3, 4]])
      const arr = st.toArray()
      expect(arr).toEqual([[1, 2], [3, 4]])
      arr[0]![0] = 999
      expect(st.get(0, 0)).toBe(1)
    })

    it('should return deep copy (rows are separate arrays)', () => {
      const st = new SegmentTree2D([[1, 2], [3, 4]])
      const arr = st.toArray()
      arr[0]![0] = 999
      expect(st.get(0, 0)).toBe(1)
    })

    it('should reflect updates', () => {
      const st = new SegmentTree2D([[1, 2], [3, 4]])
      st.update(0, 0, 99)
      expect(st.toArray()).toEqual([[99, 2], [3, 4]])
    })

    it('should return correct shape for 3x3', () => {
      const st = new SegmentTree2D([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
      expect(st.toArray()).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
    })

    it('should return correct shape for single row', () => {
      const st = new SegmentTree2D([[1, 2, 3]])
      expect(st.toArray()).toEqual([[1, 2, 3]])
    })

    it('should return correct shape for single column', () => {
      const st = new SegmentTree2D([[1], [2], [3]])
      expect(st.toArray()).toEqual([[1], [2], [3]])
    })
  })

  describe('clone', () => {
    it('should create independent copy (sum)', () => {
      const st = SegmentTree2D.createSum([[1, 2], [3, 4]])
      const cl = st.clone()
      expect(cl.query(0, 0, 1, 1)).toBe(10)
      st.update(0, 0, 99)
      expect(cl.query(0, 0, 1, 1)).toBe(10)
      expect(st.query(0, 0, 1, 1)).toBe(108)
    })

    it('should create independent copy (min)', () => {
      const st = SegmentTree2D.createMin([[5, 3], [8, 1]])
      const cl = st.clone()
      st.update(0, 0, -100)
      expect(cl.query(0, 0, 1, 1)).toBe(1)
      expect(st.query(0, 0, 1, 1)).toBe(-100)
    })

    it('should create independent copy (max)', () => {
      const st = SegmentTree2D.createMax([[5, 3], [8, 1]])
      const cl = st.clone()
      st.update(0, 0, 100)
      expect(cl.query(0, 0, 1, 1)).toBe(8)
      expect(st.query(0, 0, 1, 1)).toBe(100)
    })

    it('should clone empty tree', () => {
      const st = SegmentTree2D.createSum([])
      const cl = st.clone()
      expect(cl.getRows()).toBe(0)
      expect(cl.getCols()).toBe(0)
    })

    it('should preserve query type through clone', () => {
      const st = SegmentTree2D.createSum([[1, 2], [3, 4]])
      const cl = st.clone()
      cl.update(0, 0, 10)
      expect(cl.query(0, 0, 1, 1)).toBe(19)
    })

    it('should clone with custom combine', () => {
      const st = new SegmentTree2D([[2, 3], [4, 5]], {
        identity: 1,
        combine: (a, b) => a * b,
      })
      const cl = st.clone()
      expect(cl.query(0, 0, 1, 1)).toBe(120)
    })
  })

  describe('sum queries on various sizes', () => {
    it('should handle 1x1 matrix', () => {
      const st = SegmentTree2D.createSum([[42]])
      expect(st.query(0, 0, 0, 0)).toBe(42)
    })

    it('should handle 1x2 matrix', () => {
      const st = SegmentTree2D.createSum([[3, 7]])
      expect(st.query(0, 0, 0, 1)).toBe(10)
      expect(st.query(0, 0, 0, 0)).toBe(3)
      expect(st.query(0, 1, 0, 1)).toBe(7)
    })

    it('should handle 2x1 matrix', () => {
      const st = SegmentTree2D.createSum([[3], [7]])
      expect(st.query(0, 0, 1, 0)).toBe(10)
      expect(st.query(0, 0, 0, 0)).toBe(3)
      expect(st.query(1, 0, 1, 0)).toBe(7)
    })

    it('should handle 3x3 matrix', () => {
      const st = SegmentTree2D.createSum([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
      expect(st.query(0, 0, 2, 2)).toBe(45)
      expect(st.query(0, 0, 0, 2)).toBe(6)
      expect(st.query(2, 0, 2, 2)).toBe(24)
      expect(st.query(0, 0, 2, 0)).toBe(12)
      expect(st.query(0, 2, 2, 2)).toBe(18)
    })

    it('should handle 5x5 matrix', () => {
      const data = Array.from({ length: 5 }, (_, r) =>
        Array.from({ length: 5 }, (_, c) => r * 5 + c + 1),
      )
      const st = SegmentTree2D.createSum(data)
      expect(st.query(0, 0, 4, 4)).toBe(325)
      expect(st.query(0, 0, 2, 2)).toBe(63)
      expect(st.query(2, 2, 4, 4)).toBe(171)
    })

    it('should handle 7x3 non-power-of-two matrix', () => {
      const data = Array.from({ length: 7 }, (_, r) =>
        Array.from({ length: 3 }, (_, c) => r * 3 + c + 1),
      )
      const st = SegmentTree2D.createSum(data)
      expect(st.query(0, 0, 6, 2)).toBe(231)
      expect(st.query(0, 0, 3, 1)).toBe(48)
    })
  })

  describe('min queries', () => {
    it('should find min in entire matrix', () => {
      const st = SegmentTree2D.createMin([[5, 3, 8], [1, 9, 2], [7, 4, 6]])
      expect(st.query(0, 0, 2, 2)).toBe(1)
    })

    it('should find min in submatrix', () => {
      const st = SegmentTree2D.createMin([[5, 3, 8], [1, 9, 2], [7, 4, 6]])
      expect(st.query(0, 0, 1, 1)).toBe(1)
      expect(st.query(0, 1, 1, 2)).toBe(2)
      expect(st.query(2, 0, 2, 2)).toBe(4)
    })

    it('should find min of single cell', () => {
      const st = SegmentTree2D.createMin([[5, 3, 8], [1, 9, 2], [7, 4, 6]])
      expect(st.query(1, 2, 1, 2)).toBe(2)
      expect(st.query(0, 0, 0, 0)).toBe(5)
    })

    it('should update min after lowering a value', () => {
      const st = SegmentTree2D.createMin([[5, 3, 8], [1, 9, 2], [7, 4, 6]])
      st.update(0, 0, -10)
      expect(st.query(0, 0, 2, 2)).toBe(-10)
    })

    it('should update min after raising the minimum', () => {
      const st = SegmentTree2D.createMin([[5, 3, 8], [1, 9, 2], [7, 4, 6]])
      st.update(1, 0, 100)
      expect(st.query(0, 0, 2, 2)).toBe(2)
    })

    it('should handle negative values', () => {
      const st = SegmentTree2D.createMin([[-5, 3], [-8, 1]])
      expect(st.query(0, 0, 1, 1)).toBe(-8)
      expect(st.query(0, 0, 0, 1)).toBe(-5)
    })

    it('should handle identical values', () => {
      const st = SegmentTree2D.createMin([[7, 7], [7, 7]])
      expect(st.query(0, 0, 1, 1)).toBe(7)
    })
  })

  describe('max queries', () => {
    it('should find max in entire matrix', () => {
      const st = SegmentTree2D.createMax([[5, 3, 8], [1, 9, 2], [7, 4, 6]])
      expect(st.query(0, 0, 2, 2)).toBe(9)
    })

    it('should find max in submatrix', () => {
      const st = SegmentTree2D.createMax([[5, 3, 8], [1, 9, 2], [7, 4, 6]])
      expect(st.query(0, 0, 0, 2)).toBe(8)
      expect(st.query(1, 1, 2, 2)).toBe(9)
      expect(st.query(2, 0, 2, 2)).toBe(7)
    })

    it('should find max of single cell', () => {
      const st = SegmentTree2D.createMax([[5, 3, 8], [1, 9, 2], [7, 4, 6]])
      expect(st.query(1, 1, 1, 1)).toBe(9)
      expect(st.query(2, 2, 2, 2)).toBe(6)
    })

    it('should update max after raising a value', () => {
      const st = SegmentTree2D.createMax([[5, 3, 8], [1, 9, 2], [7, 4, 6]])
      st.update(2, 2, 100)
      expect(st.query(0, 0, 2, 2)).toBe(100)
    })

    it('should update max after lowering the maximum', () => {
      const st = SegmentTree2D.createMax([[5, 3, 8], [1, 9, 2], [7, 4, 6]])
      st.update(1, 1, 0)
      expect(st.query(0, 0, 2, 2)).toBe(8)
    })

    it('should handle negative values', () => {
      const st = SegmentTree2D.createMax([[-5, -3], [-8, -1]])
      expect(st.query(0, 0, 1, 1)).toBe(-1)
      expect(st.query(1, 0, 1, 0)).toBe(-8)
    })

    it('should handle identical values', () => {
      const st = SegmentTree2D.createMax([[7, 7], [7, 7]])
      expect(st.query(0, 0, 1, 1)).toBe(7)
    })
  })

  describe('combined operations', () => {
    it('should maintain consistency across multiple updates (sum)', () => {
      const st = SegmentTree2D.createSum([[1, 2], [3, 4]])
      st.update(0, 0, 10)
      st.update(1, 1, 20)
      st.update(0, 1, 30)
      st.update(1, 0, 40)
      expect(st.query(0, 0, 1, 1)).toBe(100)
      expect(st.toArray()).toEqual([[10, 30], [40, 20]])
    })

    it('should maintain consistency across multiple updates (min)', () => {
      const st = SegmentTree2D.createMin([[10, 20], [30, 40]])
      st.update(0, 0, 5)
      st.update(1, 1, 3)
      expect(st.query(0, 0, 1, 1)).toBe(3)
    })

    it('should maintain consistency across multiple updates (max)', () => {
      const st = SegmentTree2D.createMax([[10, 20], [30, 40]])
      st.update(0, 0, 50)
      st.update(1, 1, 60)
      expect(st.query(0, 0, 1, 1)).toBe(60)
    })

    it('should support interleaved updates and queries', () => {
      const st = SegmentTree2D.createSum([[1, 2], [3, 4]])
      expect(st.query(0, 0, 1, 1)).toBe(10)
      st.update(0, 0, 5)
      expect(st.query(0, 0, 1, 1)).toBe(14)
      st.update(1, 1, 10)
      expect(st.query(0, 0, 1, 1)).toBe(20)
      expect(st.get(0, 0)).toBe(5)
      expect(st.get(1, 1)).toBe(10)
    })

    it('should handle build after operations via re-instantiation', () => {
      const st1 = SegmentTree2D.createSum([[1, 2], [3, 4]])
      st1.update(0, 0, 100)
      const st2 = SegmentTree2D.createSum([[10, 20], [30, 40]])
      expect(st2.query(0, 0, 1, 1)).toBe(100)
    })
  })

  describe('edge cases', () => {
    it('should handle matrix of all zeros', () => {
      const st = SegmentTree2D.createSum([[0, 0, 0], [0, 0, 0]])
      expect(st.query(0, 0, 1, 2)).toBe(0)
    })

    it('should handle all identical values', () => {
      const st = SegmentTree2D.createSum([[5, 5, 5], [5, 5, 5]])
      expect(st.query(0, 0, 1, 2)).toBe(30)
    })

    it('should handle very large numbers (sum)', () => {
      const st = SegmentTree2D.createSum([[Number.MAX_SAFE_INTEGER, 0], [0, 0]])
      expect(st.query(0, 0, 0, 0)).toBe(Number.MAX_SAFE_INTEGER)
    })

    it('should handle very small numbers (min)', () => {
      const st = SegmentTree2D.createMin([[Number.MIN_SAFE_INTEGER, 0], [0, 0]])
      expect(st.query(0, 0, 1, 1)).toBe(Number.MIN_SAFE_INTEGER)
    })

    it('should handle very large numbers (max)', () => {
      const st = SegmentTree2D.createMax([[Number.MAX_SAFE_INTEGER, 0], [0, 0]])
      expect(st.query(0, 0, 1, 1)).toBe(Number.MAX_SAFE_INTEGER)
    })

    it('should handle single cell query and update', () => {
      const st = SegmentTree2D.createSum([[1]])
      expect(st.query(0, 0, 0, 0)).toBe(1)
      st.update(0, 0, 42)
      expect(st.query(0, 0, 0, 0)).toBe(42)
    })

    it('should handle negative values in sum queries', () => {
      const st = SegmentTree2D.createSum([[-5, 10], [-3, 8]])
      expect(st.query(0, 0, 1, 1)).toBe(10)
      expect(st.query(0, 0, 0, 1)).toBe(5)
    })

    it('should handle mixed positive and negative in min', () => {
      const st = SegmentTree2D.createMin([[-5, 10], [3, -8]])
      expect(st.query(0, 0, 1, 1)).toBe(-8)
      expect(st.query(0, 0, 0, 1)).toBe(-5)
    })

    it('should handle mixed positive and negative in max', () => {
      const st = SegmentTree2D.createMax([[-5, 10], [3, -8]])
      expect(st.query(0, 0, 1, 1)).toBe(10)
      expect(st.query(1, 0, 1, 1)).toBe(3)
    })
  })

  describe('large matrices', () => {
    it('should handle 20x20 sum matrix', () => {
      const data = Array.from({ length: 20 }, (_, r) =>
        Array.from({ length: 20 }, (_, c) => r * 20 + c + 1),
      )
      const st = SegmentTree2D.createSum(data)
      expect(st.query(0, 0, 19, 19)).toBe(80200)
      expect(st.query(0, 0, 9, 9)).toBe(9550)
    })

    it('should handle updates on large matrix', () => {
      const data = Array.from({ length: 10 }, (_, r) =>
        Array.from({ length: 10 }, (_, c) => r * 10 + c + 1),
      )
      const st = SegmentTree2D.createSum(data)
      st.update(0, 0, 1000)
      expect(st.get(0, 0)).toBe(1000)
      expect(st.query(0, 0, 0, 0)).toBe(1000)
    })

    it('should handle range queries on large matrix', () => {
      const data = Array.from({ length: 10 }, (_, r) =>
        Array.from({ length: 10 }, (_, c) => r * 10 + c + 1),
      )
      const st = SegmentTree2D.createSum(data)
      expect(st.query(2, 2, 4, 4)).toBe(306)
      expect(st.query(5, 5, 7, 7)).toBe(603)
    })

    it('should handle alternating updates and queries', () => {
      const data = Array.from({ length: 10 }, () =>
        Array.from({ length: 10 }, () => 0),
      )
      const st = SegmentTree2D.createSum(data)
      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
          st.update(r, c, r * 10 + c + 1)
        }
      }
      expect(st.query(0, 0, 9, 9)).toBe(5050)
    })

    it('should handle min on large matrix', () => {
      const data = Array.from({ length: 10 }, (_, r) =>
        Array.from({ length: 10 }, (_, c) => r * 10 + c + 1),
      )
      const st = SegmentTree2D.createMin(data)
      expect(st.query(0, 0, 9, 9)).toBe(1)
      expect(st.query(5, 5, 9, 9)).toBe(56)
    })

    it('should handle max on large matrix', () => {
      const data = Array.from({ length: 10 }, (_, r) =>
        Array.from({ length: 10 }, (_, c) => r * 10 + c + 1),
      )
      const st = SegmentTree2D.createMax(data)
      expect(st.query(0, 0, 9, 9)).toBe(100)
      expect(st.query(0, 0, 4, 4)).toBe(45)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_SEGMENT_TREE_2D_OPTIONS', () => {
      expect(DEFAULT_SEGMENT_TREE_2D_OPTIONS.identity).toBe(0)
    })

    it('should support SegmentTree2DOptions interface', () => {
      const opts: SegmentTree2DOptions = { identity: 1, combine: (a, b) => a * b }
      expect(opts.identity).toBe(1)
    })

    it('should export SUM_2D', () => {
      expect(SUM_2D.identity).toBe(0)
      expect(SUM_2D.combine(3, 4)).toBe(7)
    })

    it('should export MIN_2D', () => {
      expect(MIN_2D.identity).toBe(Infinity)
      expect(MIN_2D.combine(3, 4)).toBe(3)
    })

    it('should export MAX_2D', () => {
      expect(MAX_2D.identity).toBe(-Infinity)
      expect(MAX_2D.combine(3, 4)).toBe(4)
    })
  })

  describe('product (custom combine)', () => {
    it('should compute product of entire matrix', () => {
      const st = new SegmentTree2D([[1, 2], [3, 4]], {
        identity: 1,
        combine: (a, b) => a * b,
      })
      expect(st.query(0, 0, 1, 1)).toBe(24)
    })

    it('should compute product of submatrix', () => {
      const st = new SegmentTree2D([[1, 2, 3], [4, 5, 6], [7, 8, 9]], {
        identity: 1,
        combine: (a, b) => a * b,
      })
      expect(st.query(0, 0, 0, 0)).toBe(1)
      expect(st.query(0, 0, 1, 1)).toBe(40)
      expect(st.query(1, 1, 2, 2)).toBe(2160)
    })

    it('should handle update in product tree', () => {
      const st = new SegmentTree2D([[2, 3], [4, 5]], {
        identity: 1,
        combine: (a, b) => a * b,
      })
      st.update(0, 0, 10)
      expect(st.query(0, 0, 1, 1)).toBe(600)
    })

    it('should handle zero in product tree', () => {
      const st = new SegmentTree2D([[2, 3], [4, 5]], {
        identity: 1,
        combine: (a, b) => a * b,
      })
      st.update(0, 0, 0)
      expect(st.query(0, 0, 1, 1)).toBe(0)
      expect(st.query(1, 0, 1, 1)).toBe(20)
    })
  })

  describe('non-power-of-two dimensions', () => {
    it('should handle 3x5 matrix', () => {
      const data = [
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9, 10],
        [11, 12, 13, 14, 15],
      ]
      const st = SegmentTree2D.createSum(data)
      expect(st.query(0, 0, 2, 4)).toBe(120)
      expect(st.query(0, 0, 1, 2)).toBe(27)
    })

    it('should handle 5x3 matrix', () => {
      const data = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        [10, 11, 12],
        [13, 14, 15],
      ]
      const st = SegmentTree2D.createSum(data)
      expect(st.query(0, 0, 4, 2)).toBe(120)
      expect(st.query(2, 1, 3, 2)).toBe(40)
    })

    it('should handle 6x6 matrix', () => {
      const data = Array.from({ length: 6 }, (_, r) =>
        Array.from({ length: 6 }, (_, c) => r * 6 + c + 1),
      )
      const st = SegmentTree2D.createSum(data)
      expect(st.query(0, 0, 5, 5)).toBe(666)
      expect(st.query(1, 1, 4, 4)).toBe(296)
    })

    it('should handle min on non-square matrix', () => {
      const data = [
        [9, 2, 7, 1],
        [4, 8, 3, 6],
        [5, 1, 9, 2],
      ]
      const st = SegmentTree2D.createMin(data)
      expect(st.query(0, 0, 2, 3)).toBe(1)
      expect(st.query(0, 0, 0, 3)).toBe(1)
      expect(st.query(1, 0, 2, 3)).toBe(1)
      expect(st.query(1, 1, 1, 2)).toBe(3)
    })

    it('should handle max on non-square matrix', () => {
      const data = [
        [9, 2, 7, 1],
        [4, 8, 3, 6],
        [5, 1, 9, 2],
      ]
      const st = SegmentTree2D.createMax(data)
      expect(st.query(0, 0, 2, 3)).toBe(9)
      expect(st.query(1, 0, 1, 3)).toBe(8)
      expect(st.query(2, 0, 2, 3)).toBe(9)
    })
  })

  describe('query precision', () => {
    it('should handle sequential submatrix queries', () => {
      const st = SegmentTree2D.createSum([
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16],
      ])
      expect(st.query(0, 0, 1, 1)).toBe(14)
      expect(st.query(0, 2, 1, 3)).toBe(22)
      expect(st.query(2, 0, 3, 1)).toBe(46)
      expect(st.query(2, 2, 3, 3)).toBe(54)
    })

    it('should handle overlapping queries', () => {
      const st = SegmentTree2D.createSum([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
      expect(st.query(0, 0, 2, 2)).toBe(45)
      expect(st.query(0, 0, 1, 1)).toBe(12)
      expect(st.query(1, 1, 2, 2)).toBe(28)
    })

    it('should handle row-spanning queries', () => {
      const st = SegmentTree2D.createSum([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
      expect(st.query(0, 1, 2, 1)).toBe(15)
      expect(st.query(0, 0, 2, 0)).toBe(12)
      expect(st.query(0, 2, 2, 2)).toBe(18)
    })

    it('should handle col-spanning queries', () => {
      const st = SegmentTree2D.createSum([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
      expect(st.query(1, 0, 1, 2)).toBe(15)
      expect(st.query(0, 0, 0, 2)).toBe(6)
      expect(st.query(2, 0, 2, 2)).toBe(24)
    })
  })

  describe('update then query consistency', () => {
    it('should be consistent for sum after updating all cells', () => {
      const data = [[1, 2], [3, 4]]
      const st = SegmentTree2D.createSum(data)
      st.update(0, 0, 10)
      st.update(0, 1, 20)
      st.update(1, 0, 30)
      st.update(1, 1, 40)
      expect(st.query(0, 0, 1, 1)).toBe(100)
      expect(st.query(0, 0, 0, 1)).toBe(30)
      expect(st.query(1, 0, 1, 1)).toBe(70)
    })

    it('should be consistent for min after updating to lower values', () => {
      const st = SegmentTree2D.createMin([[10, 20], [30, 40]])
      st.update(0, 0, 5)
      st.update(1, 1, 3)
      expect(st.query(0, 0, 1, 1)).toBe(3)
      expect(st.query(0, 0, 0, 1)).toBe(5)
      expect(st.query(1, 0, 1, 1)).toBe(3)
    })

    it('should be consistent for max after updating to higher values', () => {
      const st = SegmentTree2D.createMax([[10, 20], [30, 40]])
      st.update(0, 0, 50)
      st.update(1, 1, 60)
      expect(st.query(0, 0, 1, 1)).toBe(60)
      expect(st.query(0, 0, 0, 1)).toBe(50)
      expect(st.query(1, 0, 1, 1)).toBe(60)
    })

    it('should return updated value from get after update', () => {
      const st = SegmentTree2D.createSum([[1, 2], [3, 4]])
      st.update(0, 1, 99)
      expect(st.get(0, 1)).toBe(99)
      expect(st.get(0, 0)).toBe(1)
      expect(st.get(1, 0)).toBe(3)
      expect(st.get(1, 1)).toBe(4)
    })
  })
})
