import { describe, it, expect } from 'vitest'
import { SparseTable2D } from '../../src/core/sparse-table-2d/sparse-table-2d.js'
import type { SparseTable2DOptions, SparseTable2DStats } from '../../src/core/sparse-table-2d/types.js'

function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b !== 0) {
    const t = b
    b = a % b
    a = t
  }
  return a
}

function bruteForceMin(matrix: number[][], r1: number, c1: number, r2: number, c2: number): number {
  let result = matrix[r1]![c1]!
  for (let i = r1; i <= r2; i++) {
    for (let j = c1; j <= c2; j++) {
      result = Math.min(result, matrix[i]![j]!)
    }
  }
  return result
}

function bruteForceMax(matrix: number[][], r1: number, c1: number, r2: number, c2: number): number {
  let result = matrix[r1]![c1]!
  for (let i = r1; i <= r2; i++) {
    for (let j = c1; j <= c2; j++) {
      result = Math.max(result, matrix[i]![j]!)
    }
  }
  return result
}

function bruteForceSum(matrix: number[][], r1: number, c1: number, r2: number, c2: number): number {
  let result = 0
  for (let i = r1; i <= r2; i++) {
    for (let j = c1; j <= c2; j++) {
      result += matrix[i]![j]!
    }
  }
  return result
}

function bruteForceGcd(matrix: number[][], r1: number, c1: number, r2: number, c2: number): number {
  let result = matrix[r1]![c1]!
  for (let i = r1; i <= r2; i++) {
    for (let j = c1; j <= c2; j++) {
      result = gcd(result, matrix[i]![j]!)
    }
  }
  return result
}

describe('SparseTable2D', () => {
  describe('construction', () => {
    it('constructs from a 3x3 matrix', () => {
      const st = new SparseTable2D([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
      expect(st.rows).toBe(3)
      expect(st.cols).toBe(3)
    })

    it('constructs from a 1x1 matrix', () => {
      const st = new SparseTable2D([[42]])
      expect(st.rows).toBe(1)
      expect(st.cols).toBe(1)
    })

    it('constructs from an empty matrix', () => {
      const st = new SparseTable2D([])
      expect(st.rows).toBe(0)
      expect(st.cols).toBe(0)
    })

    it('constructs from a single-row matrix', () => {
      const st = new SparseTable2D([[1, 2, 3, 4, 5]])
      expect(st.rows).toBe(1)
      expect(st.cols).toBe(5)
    })

    it('constructs from a single-column matrix', () => {
      const st = new SparseTable2D([[1], [2], [3], [4]])
      expect(st.rows).toBe(4)
      expect(st.cols).toBe(1)
    })

    it('constructs from a 2x2 matrix', () => {
      const st = new SparseTable2D([[1, 2], [3, 4]])
      expect(st.rows).toBe(2)
      expect(st.cols).toBe(2)
    })

    it('constructs from a 4x4 power-of-two matrix', () => {
      const data = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16],
      ]
      const st = new SparseTable2D(data)
      expect(st.rows).toBe(4)
      expect(st.cols).toBe(4)
    })

    it('preserves original matrix (does not mutate input)', () => {
      const original = [[1, 2], [3, 4]]
      const copy = original.map(row => [...row])
      new SparseTable2D(original)
      expect(original).toEqual(copy)
    })

    it('constructs with zero values', () => {
      const st = new SparseTable2D([[0, 0], [0, 0]])
      expect(st.queryMin(0, 0, 1, 1)).toBe(0)
      expect(st.queryMax(0, 0, 1, 1)).toBe(0)
      expect(st.querySum(0, 0, 1, 1)).toBe(0)
    })

    it('constructs with floating point values', () => {
      const st = new SparseTable2D([[1.5, 2.5], [3.0, 4.5]])
      expect(st.querySum(0, 0, 1, 1)).toBeCloseTo(11.5)
    })

    it('constructs from a 5x7 non-square matrix', () => {
      const data = Array.from({ length: 5 }, (_, i) =>
        Array.from({ length: 7 }, (_, j) => i * 7 + j + 1)
      )
      const st = new SparseTable2D(data)
      expect(st.rows).toBe(5)
      expect(st.cols).toBe(7)
    })

    it('constructs from a 7x3 non-square matrix', () => {
      const data = Array.from({ length: 7 }, (_, i) =>
        Array.from({ length: 3 }, (_, j) => i * 3 + j + 1)
      )
      const st = new SparseTable2D(data)
      expect(st.rows).toBe(7)
      expect(st.cols).toBe(3)
    })
  })

  describe('queryMin', () => {
    const matrix = [
      [5, 1, 9, 3],
      [8, 2, 7, 4],
      [6, 0, 1, 5],
      [3, 8, 2, 6],
    ]
    const st = new SparseTable2D(matrix)

    it('finds min of full matrix', () => {
      expect(st.queryMin(0, 0, 3, 3)).toBe(0)
    })

    it('finds min of single cell', () => {
      expect(st.queryMin(0, 0, 0, 0)).toBe(5)
      expect(st.queryMin(1, 1, 1, 1)).toBe(2)
      expect(st.queryMin(2, 2, 2, 2)).toBe(1)
      expect(st.queryMin(3, 3, 3, 3)).toBe(6)
    })

    it('finds min of single row', () => {
      expect(st.queryMin(0, 0, 0, 3)).toBe(1)
      expect(st.queryMin(1, 0, 1, 3)).toBe(2)
      expect(st.queryMin(2, 0, 2, 3)).toBe(0)
    })

    it('finds min of single column', () => {
      expect(st.queryMin(0, 0, 3, 0)).toBe(3)
      expect(st.queryMin(0, 1, 3, 1)).toBe(0)
      expect(st.queryMin(0, 2, 3, 2)).toBe(1)
    })

    it('finds min of sub-rectangle', () => {
      expect(st.queryMin(0, 0, 1, 1)).toBe(1)
      expect(st.queryMin(1, 1, 2, 2)).toBe(0)
      expect(st.queryMin(2, 2, 3, 3)).toBe(1)
    })

    it('finds min of 2x2 blocks', () => {
      expect(st.queryMin(0, 0, 1, 3)).toBe(1)
      expect(st.queryMin(2, 0, 3, 3)).toBe(0)
    })

    it('matches brute force for all sub-rectangles', () => {
      for (let r1 = 0; r1 < matrix.length; r1++) {
        for (let c1 = 0; c1 < matrix[0]!.length; c1++) {
          for (let r2 = r1; r2 < matrix.length; r2++) {
            for (let c2 = c1; c2 < matrix[0]!.length; c2++) {
              expect(st.queryMin(r1, c1, r2, c2)).toBe(bruteForceMin(matrix, r1, c1, r2, c2))
            }
          }
        }
      }
    })
  })

  describe('queryMax', () => {
    const matrix = [
      [5, 1, 9, 3],
      [8, 2, 7, 4],
      [6, 0, 1, 5],
      [3, 8, 2, 6],
    ]
    const st = new SparseTable2D(matrix)

    it('finds max of full matrix', () => {
      expect(st.queryMax(0, 0, 3, 3)).toBe(9)
    })

    it('finds max of single cell', () => {
      expect(st.queryMax(0, 0, 0, 0)).toBe(5)
      expect(st.queryMax(2, 1, 2, 1)).toBe(0)
      expect(st.queryMax(0, 2, 0, 2)).toBe(9)
    })

    it('finds max of single row', () => {
      expect(st.queryMax(0, 0, 0, 3)).toBe(9)
      expect(st.queryMax(1, 0, 1, 3)).toBe(8)
      expect(st.queryMax(3, 0, 3, 3)).toBe(8)
    })

    it('finds max of single column', () => {
      expect(st.queryMax(0, 0, 3, 0)).toBe(8)
      expect(st.queryMax(0, 1, 3, 1)).toBe(8)
    })

    it('finds max of sub-rectangle', () => {
      expect(st.queryMax(0, 0, 1, 1)).toBe(8)
      expect(st.queryMax(1, 1, 2, 2)).toBe(7)
      expect(st.queryMax(2, 2, 3, 3)).toBe(6)
    })

    it('matches brute force for all sub-rectangles', () => {
      for (let r1 = 0; r1 < matrix.length; r1++) {
        for (let c1 = 0; c1 < matrix[0]!.length; c1++) {
          for (let r2 = r1; r2 < matrix.length; r2++) {
            for (let c2 = c1; c2 < matrix[0]!.length; c2++) {
              expect(st.queryMax(r1, c1, r2, c2)).toBe(bruteForceMax(matrix, r1, c1, r2, c2))
            }
          }
        }
      }
    })
  })

  describe('querySum', () => {
    const matrix = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]
    const st = new SparseTable2D(matrix)

    it('computes sum of full matrix', () => {
      expect(st.querySum(0, 0, 2, 2)).toBe(45)
    })

    it('computes sum of single cell', () => {
      expect(st.querySum(0, 0, 0, 0)).toBe(1)
      expect(st.querySum(1, 1, 1, 1)).toBe(5)
      expect(st.querySum(2, 2, 2, 2)).toBe(9)
    })

    it('computes sum of single row', () => {
      expect(st.querySum(0, 0, 0, 2)).toBe(6)
      expect(st.querySum(1, 0, 1, 2)).toBe(15)
      expect(st.querySum(2, 0, 2, 2)).toBe(24)
    })

    it('computes sum of single column', () => {
      expect(st.querySum(0, 0, 2, 0)).toBe(12)
      expect(st.querySum(0, 1, 2, 1)).toBe(15)
      expect(st.querySum(0, 2, 2, 2)).toBe(18)
    })

    it('computes sum of sub-rectangle', () => {
      expect(st.querySum(0, 0, 1, 1)).toBe(12)
      expect(st.querySum(1, 1, 2, 2)).toBe(28)
      expect(st.querySum(0, 1, 1, 2)).toBe(16)
    })

    it('matches brute force for all sub-rectangles', () => {
      for (let r1 = 0; r1 < matrix.length; r1++) {
        for (let c1 = 0; c1 < matrix[0]!.length; c1++) {
          for (let r2 = r1; r2 < matrix.length; r2++) {
            for (let c2 = c1; c2 < matrix[0]!.length; c2++) {
              expect(st.querySum(r1, c1, r2, c2)).toBe(bruteForceSum(matrix, r1, c1, r2, c2))
            }
          }
        }
      }
    })

    it('computes sum with negative values', () => {
      const neg = [[-1, -2], [-3, -4]]
      const negSt = new SparseTable2D(neg)
      expect(negSt.querySum(0, 0, 1, 1)).toBe(-10)
      expect(negSt.querySum(0, 0, 0, 1)).toBe(-3)
    })
  })

  describe('queryGcd', () => {
    const matrix = [
      [12, 6, 8],
      [9, 3, 15],
      [18, 12, 24],
    ]
    const st = new SparseTable2D(matrix)

    it('finds gcd of full matrix', () => {
      expect(st.queryGcd(0, 0, 2, 2)).toBe(1)
    })

    it('finds gcd of single cell', () => {
      expect(st.queryGcd(0, 0, 0, 0)).toBe(12)
      expect(st.queryGcd(1, 1, 1, 1)).toBe(3)
      expect(st.queryGcd(2, 2, 2, 2)).toBe(24)
    })

    it('finds gcd of row', () => {
      expect(st.queryGcd(0, 0, 0, 2)).toBe(2)
      expect(st.queryGcd(1, 0, 1, 2)).toBe(3)
      expect(st.queryGcd(2, 0, 2, 2)).toBe(6)
    })

    it('finds gcd of column', () => {
      expect(st.queryGcd(0, 0, 2, 0)).toBe(3)
      expect(st.queryGcd(0, 1, 2, 1)).toBe(3)
    })

    it('finds gcd of sub-rectangle', () => {
      expect(st.queryGcd(0, 0, 1, 1)).toBe(3)
      expect(st.queryGcd(1, 1, 2, 2)).toBe(3)
    })

    it('finds gcd where all values share common factor', () => {
      const evenMatrix = [
        [4, 8, 12],
        [16, 20, 24],
        [28, 32, 36],
      ]
      const evenSt = new SparseTable2D(evenMatrix)
      expect(evenSt.queryGcd(0, 0, 2, 2)).toBe(4)
    })

    it('matches brute force for all sub-rectangles', () => {
      for (let r1 = 0; r1 < matrix.length; r1++) {
        for (let c1 = 0; c1 < matrix[0]!.length; c1++) {
          for (let r2 = r1; r2 < matrix.length; r2++) {
            for (let c2 = c1; c2 < matrix[0]!.length; c2++) {
              expect(st.queryGcd(r1, c1, r2, c2)).toBe(bruteForceGcd(matrix, r1, c1, r2, c2))
            }
          }
        }
      }
    })
  })

  describe('get', () => {
    const st = new SparseTable2D([[1, 2, 3], [4, 5, 6], [7, 8, 9]])

    it('gets value at valid position', () => {
      expect(st.get(0, 0)).toBe(1)
      expect(st.get(1, 1)).toBe(5)
      expect(st.get(2, 2)).toBe(9)
    })

    it('gets corner values', () => {
      expect(st.get(0, 2)).toBe(3)
      expect(st.get(2, 0)).toBe(7)
    })

    it('throws on negative row', () => {
      expect(() => st.get(-1, 0)).toThrow(RangeError)
    })

    it('throws on row out of bounds', () => {
      expect(() => st.get(3, 0)).toThrow(RangeError)
    })

    it('throws on negative column', () => {
      expect(() => st.get(0, -1)).toThrow(RangeError)
    })

    it('throws on column out of bounds', () => {
      expect(() => st.get(0, 3)).toThrow(RangeError)
    })

    it('throws on empty table', () => {
      const empty = new SparseTable2D([])
      expect(() => empty.get(0, 0)).toThrow(RangeError)
    })
  })

  describe('rows and cols', () => {
    it('returns correct dimensions for 3x3', () => {
      const st = new SparseTable2D([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
      expect(st.rows).toBe(3)
      expect(st.cols).toBe(3)
    })

    it('returns correct dimensions for empty', () => {
      const st = new SparseTable2D([])
      expect(st.rows).toBe(0)
      expect(st.cols).toBe(0)
    })

    it('returns correct dimensions for 1x1', () => {
      const st = new SparseTable2D([[42]])
      expect(st.rows).toBe(1)
      expect(st.cols).toBe(1)
    })

    it('returns correct dimensions for single row', () => {
      const st = new SparseTable2D([[1, 2, 3, 4, 5]])
      expect(st.rows).toBe(1)
      expect(st.cols).toBe(5)
    })

    it('returns correct dimensions for single column', () => {
      const st = new SparseTable2D([[1], [2], [3]])
      expect(st.rows).toBe(3)
      expect(st.cols).toBe(1)
    })
  })

  describe('toArray', () => {
    it('returns copy of matrix', () => {
      const matrix = [[1, 2], [3, 4]]
      const st = new SparseTable2D(matrix)
      expect(st.toArray()).toEqual(matrix)
    })

    it('returns independent copy', () => {
      const st = new SparseTable2D([[1, 2], [3, 4]])
      const arr = st.toArray()
      arr[0]![0] = 999
      expect(st.toArray()[0]![0]).toBe(1)
    })

    it('returns empty array for empty table', () => {
      const st = new SparseTable2D([])
      expect(st.toArray()).toEqual([])
    })

    it('returns deep copy (rows are independent)', () => {
      const st = new SparseTable2D([[1, 2], [3, 4]])
      const arr = st.toArray()
      arr[0]!.push(999)
      expect(st.toArray()[0]!.length).toBe(2)
    })

    it('preserves all values', () => {
      const matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
      const st = new SparseTable2D(matrix)
      const arr = st.toArray()
      expect(arr.length).toBe(3)
      expect(arr[0]).toEqual([1, 2, 3])
      expect(arr[2]).toEqual([7, 8, 9])
    })
  })

  describe('clone', () => {
    it('creates independent clone with same values', () => {
      const st = new SparseTable2D([[1, 2], [3, 4]])
      const cloned = st.clone()
      expect(cloned.toArray()).toEqual(st.toArray())
    })

    it('clone produces same query results for min', () => {
      const st = new SparseTable2D([[5, 1, 9], [8, 2, 7], [6, 0, 1]])
      const cloned = st.clone()
      expect(cloned.queryMin(0, 0, 2, 2)).toBe(st.queryMin(0, 0, 2, 2))
      expect(cloned.queryMin(0, 0, 1, 1)).toBe(st.queryMin(0, 0, 1, 1))
    })

    it('clone produces same query results for max', () => {
      const st = new SparseTable2D([[5, 1, 9], [8, 2, 7], [6, 0, 1]])
      const cloned = st.clone()
      expect(cloned.queryMax(0, 0, 2, 2)).toBe(st.queryMax(0, 0, 2, 2))
    })

    it('clone produces same query results for sum', () => {
      const st = new SparseTable2D([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
      const cloned = st.clone()
      expect(cloned.querySum(0, 0, 2, 2)).toBe(st.querySum(0, 0, 2, 2))
    })

    it('clone produces same query results for gcd', () => {
      const st = new SparseTable2D([[12, 6, 8], [9, 3, 15], [18, 12, 24]])
      const cloned = st.clone()
      expect(cloned.queryGcd(0, 0, 2, 2)).toBe(st.queryGcd(0, 0, 2, 2))
    })

    it('clone has same dimensions', () => {
      const st = new SparseTable2D([[1, 2, 3], [4, 5, 6]])
      const cloned = st.clone()
      expect(cloned.rows).toBe(st.rows)
      expect(cloned.cols).toBe(st.cols)
    })
  })

  describe('from factory', () => {
    it('creates instance from matrix', () => {
      const st = SparseTable2D.from([[1, 2], [3, 4]])
      expect(st.rows).toBe(2)
      expect(st.cols).toBe(2)
    })

    it('creates instance that queries correctly', () => {
      const st = SparseTable2D.from([[5, 3], [8, 1]])
      expect(st.queryMin(0, 0, 1, 1)).toBe(1)
      expect(st.queryMax(0, 0, 1, 1)).toBe(8)
      expect(st.querySum(0, 0, 1, 1)).toBe(17)
    })

    it('creates independent instance', () => {
      const matrix = [[1, 2], [3, 4]]
      const st = SparseTable2D.from(matrix)
      expect(st.toArray()).toEqual(matrix)
    })

    it('creates instance from empty matrix', () => {
      const st = SparseTable2D.from([])
      expect(st.rows).toBe(0)
      expect(st.cols).toBe(0)
    })

    it('creates instance from 1x1 matrix', () => {
      const st = SparseTable2D.from([[99]])
      expect(st.queryMin(0, 0, 0, 0)).toBe(99)
      expect(st.queryMax(0, 0, 0, 0)).toBe(99)
      expect(st.querySum(0, 0, 0, 0)).toBe(99)
    })
  })

  describe('edge cases', () => {
    it('handles 1x1 matrix for all operations', () => {
      const st = new SparseTable2D([[42]])
      expect(st.queryMin(0, 0, 0, 0)).toBe(42)
      expect(st.queryMax(0, 0, 0, 0)).toBe(42)
      expect(st.querySum(0, 0, 0, 0)).toBe(42)
      expect(st.queryGcd(0, 0, 0, 0)).toBe(42)
    })

    it('handles single row matrix', () => {
      const st = new SparseTable2D([[3, 1, 4, 1, 5]])
      expect(st.queryMin(0, 0, 0, 4)).toBe(1)
      expect(st.queryMax(0, 0, 0, 4)).toBe(5)
      expect(st.querySum(0, 0, 0, 4)).toBe(14)
    })

    it('handles single column matrix', () => {
      const st = new SparseTable2D([[3], [1], [4], [1], [5]])
      expect(st.queryMin(0, 0, 4, 0)).toBe(1)
      expect(st.queryMax(0, 0, 4, 0)).toBe(5)
      expect(st.querySum(0, 0, 4, 0)).toBe(14)
    })

    it('handles 2x2 matrix', () => {
      const st = new SparseTable2D([[5, 3], [8, 1]])
      expect(st.queryMin(0, 0, 1, 1)).toBe(1)
      expect(st.queryMax(0, 0, 1, 1)).toBe(8)
      expect(st.querySum(0, 0, 1, 1)).toBe(17)
      expect(st.queryGcd(0, 0, 1, 1)).toBe(1)
    })

    it('handles all same values', () => {
      const st = new SparseTable2D([[7, 7, 7], [7, 7, 7], [7, 7, 7]])
      expect(st.queryMin(0, 0, 2, 2)).toBe(7)
      expect(st.queryMax(0, 0, 2, 2)).toBe(7)
      expect(st.querySum(0, 0, 2, 2)).toBe(63)
      expect(st.queryGcd(0, 0, 2, 2)).toBe(7)
    })

    it('handles negative values with min', () => {
      const st = new SparseTable2D([[-5, 3, -1], [7, -8, 2], [4, -3, 6]])
      expect(st.queryMin(0, 0, 2, 2)).toBe(-8)
      expect(st.queryMin(0, 0, 0, 2)).toBe(-5)
      expect(st.queryMin(1, 0, 2, 2)).toBe(-8)
    })

    it('handles negative values with max', () => {
      const st = new SparseTable2D([[-5, 3, -1], [7, -8, 2], [4, -3, 6]])
      expect(st.queryMax(0, 0, 2, 2)).toBe(7)
      expect(st.queryMax(0, 0, 0, 2)).toBe(3)
    })

    it('handles negative values with sum', () => {
      const st = new SparseTable2D([[-5, 3, -1], [7, -8, 2], [4, -3, 6]])
      expect(st.querySum(0, 0, 2, 2)).toBe(5)
      expect(st.querySum(0, 0, 0, 2)).toBe(-3)
    })

    it('handles negative values with gcd', () => {
      const st = new SparseTable2D([[-12, 6], [9, -3]])
      expect(st.queryGcd(0, 0, 1, 1)).toBe(3)
    })

    it('handles ascending values in rows', () => {
      const st = new SparseTable2D([[1, 2, 3, 4, 5], [6, 7, 8, 9, 10]])
      expect(st.queryMin(0, 0, 1, 4)).toBe(1)
      expect(st.queryMax(0, 0, 1, 4)).toBe(10)
    })

    it('handles descending values in rows', () => {
      const st = new SparseTable2D([[10, 9, 8, 7, 6], [5, 4, 3, 2, 1]])
      expect(st.queryMin(0, 0, 1, 4)).toBe(1)
      expect(st.queryMax(0, 0, 1, 4)).toBe(10)
    })

    it('handles power-of-2 sized matrix (4x4)', () => {
      const matrix = Array.from({ length: 4 }, (_, i) =>
        Array.from({ length: 4 }, (_, j) => i * 4 + j + 1)
      )
      const st = new SparseTable2D(matrix)
      expect(st.queryMin(0, 0, 3, 3)).toBe(1)
      expect(st.queryMax(0, 0, 3, 3)).toBe(16)
      expect(st.querySum(0, 0, 3, 3)).toBe(136)
    })

    it('handles non-power-of-2 sized matrix (3x5)', () => {
      const matrix = [
        [5, 3, 8, 1, 4],
        [7, 2, 9, 6, 0],
        [3, 5, 1, 8, 2],
      ]
      const st = new SparseTable2D(matrix)
      expect(st.queryMin(0, 0, 2, 4)).toBe(0)
      expect(st.queryMax(0, 0, 2, 4)).toBe(9)
    })

    it('handles 1x2 matrix', () => {
      const st = new SparseTable2D([[5, 3]])
      expect(st.queryMin(0, 0, 0, 1)).toBe(3)
      expect(st.queryMax(0, 0, 0, 1)).toBe(5)
      expect(st.querySum(0, 0, 0, 1)).toBe(8)
    })

    it('handles 2x1 matrix', () => {
      const st = new SparseTable2D([[5], [3]])
      expect(st.queryMin(0, 0, 1, 0)).toBe(3)
      expect(st.queryMax(0, 0, 1, 0)).toBe(5)
      expect(st.querySum(0, 0, 1, 0)).toBe(8)
    })
  })

  describe('larger matrices', () => {
    it('100x100 matrix with min queries matches brute force on random samples', () => {
      const matrix = Array.from({ length: 100 }, () =>
        Array.from({ length: 100 }, () => Math.floor(Math.random() * 1000))
      )
      const st = new SparseTable2D(matrix)
      for (let trial = 0; trial < 50; trial++) {
        const r1 = Math.floor(Math.random() * 100)
        const c1 = Math.floor(Math.random() * 100)
        const r2 = r1 + Math.floor(Math.random() * (100 - r1))
        const c2 = c1 + Math.floor(Math.random() * (100 - c1))
        expect(st.queryMin(r1, c1, r2, c2)).toBe(bruteForceMin(matrix, r1, c1, r2, c2))
      }
    })

    it('100x100 matrix with max queries matches brute force on random samples', () => {
      const matrix = Array.from({ length: 100 }, () =>
        Array.from({ length: 100 }, () => Math.floor(Math.random() * 1000))
      )
      const st = new SparseTable2D(matrix)
      for (let trial = 0; trial < 50; trial++) {
        const r1 = Math.floor(Math.random() * 100)
        const c1 = Math.floor(Math.random() * 100)
        const r2 = r1 + Math.floor(Math.random() * (100 - r1))
        const c2 = c1 + Math.floor(Math.random() * (100 - c1))
        expect(st.queryMax(r1, c1, r2, c2)).toBe(bruteForceMax(matrix, r1, c1, r2, c2))
      }
    })

    it('100x100 matrix with sum queries matches brute force on random samples', () => {
      const matrix = Array.from({ length: 100 }, () =>
        Array.from({ length: 100 }, () => Math.floor(Math.random() * 100))
      )
      const st = new SparseTable2D(matrix)
      for (let trial = 0; trial < 50; trial++) {
        const r1 = Math.floor(Math.random() * 100)
        const c1 = Math.floor(Math.random() * 100)
        const r2 = r1 + Math.floor(Math.random() * (100 - r1))
        const c2 = c1 + Math.floor(Math.random() * (100 - c1))
        expect(st.querySum(r1, c1, r2, c2)).toBe(bruteForceSum(matrix, r1, c1, r2, c2))
      }
    })

    it('100x100 matrix with gcd queries matches brute force on random samples', () => {
      const matrix = Array.from({ length: 100 }, () =>
        Array.from({ length: 100 }, () => Math.floor(Math.random() * 100) + 1)
      )
      const st = new SparseTable2D(matrix)
      for (let trial = 0; trial < 50; trial++) {
        const r1 = Math.floor(Math.random() * 100)
        const c1 = Math.floor(Math.random() * 100)
        const r2 = r1 + Math.floor(Math.random() * (100 - r1))
        const c2 = c1 + Math.floor(Math.random() * (100 - c1))
        expect(st.queryGcd(r1, c1, r2, c2)).toBe(bruteForceGcd(matrix, r1, c1, r2, c2))
      }
    })

    it('10x10 matrix exhaustive all-sub-rectangle verification for min', () => {
      const matrix = Array.from({ length: 10 }, (_, i) =>
        Array.from({ length: 10 }, (_, j) => (i * 10 + j + 1) * 3)
      )
      const st = new SparseTable2D(matrix)
      for (let r1 = 0; r1 < 10; r1++) {
        for (let c1 = 0; c1 < 10; c1++) {
          for (let r2 = r1; r2 < 10; r2++) {
            for (let c2 = c1; c2 < 10; c2++) {
              expect(st.queryMin(r1, c1, r2, c2)).toBe(bruteForceMin(matrix, r1, c1, r2, c2))
            }
          }
        }
      }
    })

    it('8x8 matrix exhaustive verification for sum', () => {
      const matrix = Array.from({ length: 8 }, (_, i) =>
        Array.from({ length: 8 }, (_, j) => i * 8 + j + 1)
      )
      const st = new SparseTable2D(matrix)
      for (let r1 = 0; r1 < 8; r1++) {
        for (let c1 = 0; c1 < 8; c1++) {
          for (let r2 = r1; r2 < 8; r2++) {
            for (let c2 = c1; c2 < 8; c2++) {
              expect(st.querySum(r1, c1, r2, c2)).toBe(bruteForceSum(matrix, r1, c1, r2, c2))
            }
          }
        }
      }
    })

    it('7x3 non-square matrix verification', () => {
      const matrix = Array.from({ length: 7 }, (_, i) =>
        Array.from({ length: 3 }, (_, j) => Math.floor(Math.random() * 50) + 1)
      )
      const st = new SparseTable2D(matrix)
      for (let r1 = 0; r1 < 7; r1++) {
        for (let c1 = 0; c1 < 3; c1++) {
          for (let r2 = r1; r2 < 7; r2++) {
            for (let c2 = c1; c2 < 3; c2++) {
              expect(st.queryMin(r1, c1, r2, c2)).toBe(bruteForceMin(matrix, r1, c1, r2, c2))
              expect(st.queryMax(r1, c1, r2, c2)).toBe(bruteForceMax(matrix, r1, c1, r2, c2))
            }
          }
        }
      }
    })

    it('3x7 non-square matrix verification', () => {
      const matrix = Array.from({ length: 3 }, (_, i) =>
        Array.from({ length: 7 }, (_, j) => Math.floor(Math.random() * 50) + 1)
      )
      const st = new SparseTable2D(matrix)
      for (let r1 = 0; r1 < 3; r1++) {
        for (let c1 = 0; c1 < 7; c1++) {
          for (let r2 = r1; r2 < 3; r2++) {
            for (let c2 = c1; c2 < 7; c2++) {
              expect(st.queryMin(r1, c1, r2, c2)).toBe(bruteForceMin(matrix, r1, c1, r2, c2))
              expect(st.queryMax(r1, c1, r2, c2)).toBe(bruteForceMax(matrix, r1, c1, r2, c2))
            }
          }
        }
      }
    })
  })

  describe('stats', () => {
    it('returns correct stats for 3x3 matrix', () => {
      const st = new SparseTable2D([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
      const s = st.stats()
      expect(s.rows).toBe(3)
      expect(s.cols).toBe(3)
      expect(s.totalElements).toBe(9)
    })

    it('returns correct stats for empty matrix', () => {
      const st = new SparseTable2D([])
      const s = st.stats()
      expect(s.rows).toBe(0)
      expect(s.cols).toBe(0)
      expect(s.totalElements).toBe(0)
    })

    it('returns correct stats for 1x1 matrix', () => {
      const st = new SparseTable2D([[42]])
      const s = st.stats()
      expect(s.rows).toBe(1)
      expect(s.cols).toBe(1)
      expect(s.totalElements).toBe(1)
    })

    it('returns correct stats for non-square matrix', () => {
      const st = new SparseTable2D([[1, 2, 3, 4, 5], [6, 7, 8, 9, 10]])
      const s = st.stats()
      expect(s.rows).toBe(2)
      expect(s.cols).toBe(5)
      expect(s.totalElements).toBe(10)
    })

    it('stats returns new object each time', () => {
      const st = new SparseTable2D([[1, 2], [3, 4]])
      const s1 = st.stats()
      const s2 = st.stats()
      expect(s1).toEqual(s2)
      expect(s1).not.toBe(s2)
    })
  })

  describe('error handling', () => {
    it('throws on queryMin with invalid row range', () => {
      const st = new SparseTable2D([[1, 2], [3, 4]])
      expect(() => st.queryMin(1, 0, 0, 0)).toThrow(RangeError)
    })

    it('throws on queryMax with invalid column range', () => {
      const st = new SparseTable2D([[1, 2], [3, 4]])
      expect(() => st.queryMax(0, 1, 0, 0)).toThrow(RangeError)
    })

    it('throws on querySum with negative row', () => {
      const st = new SparseTable2D([[1, 2], [3, 4]])
      expect(() => st.querySum(-1, 0, 0, 0)).toThrow(RangeError)
    })

    it('throws on queryGcd with out-of-bounds column', () => {
      const st = new SparseTable2D([[1, 2], [3, 4]])
      expect(() => st.queryGcd(0, 0, 0, 2)).toThrow(RangeError)
    })

    it('throws on queryMin with out-of-bounds row', () => {
      const st = new SparseTable2D([[1, 2], [3, 4]])
      expect(() => st.queryMin(0, 0, 2, 0)).toThrow(RangeError)
    })

    it('throws on queryMin with negative column', () => {
      const st = new SparseTable2D([[1, 2], [3, 4]])
      expect(() => st.queryMin(0, -1, 0, 0)).toThrow(RangeError)
    })

    it('throws on any query with empty matrix', () => {
      const st = new SparseTable2D([])
      expect(() => st.queryMin(0, 0, 0, 0)).toThrow(RangeError)
      expect(() => st.queryMax(0, 0, 0, 0)).toThrow(RangeError)
      expect(() => st.querySum(0, 0, 0, 0)).toThrow(RangeError)
      expect(() => st.queryGcd(0, 0, 0, 0)).toThrow(RangeError)
    })
  })

  describe('repeated queries consistency', () => {
    it('returns same result when called multiple times for min', () => {
      const st = new SparseTable2D([[5, 1, 9], [8, 2, 7], [6, 0, 1]])
      for (let i = 0; i < 10; i++) {
        expect(st.queryMin(0, 0, 2, 2)).toBe(0)
        expect(st.queryMin(0, 1, 1, 2)).toBe(1)
      }
    })

    it('returns same result when called multiple times for max', () => {
      const st = new SparseTable2D([[5, 1, 9], [8, 2, 7], [6, 0, 1]])
      for (let i = 0; i < 10; i++) {
        expect(st.queryMax(0, 0, 2, 2)).toBe(9)
      }
    })

    it('returns same result when called multiple times for sum', () => {
      const st = new SparseTable2D([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
      for (let i = 0; i < 10; i++) {
        expect(st.querySum(0, 0, 2, 2)).toBe(45)
      }
    })

    it('returns same result when called multiple times for gcd', () => {
      const st = new SparseTable2D([[12, 6, 8], [9, 3, 15], [18, 12, 24]])
      for (let i = 0; i < 10; i++) {
        expect(st.queryGcd(0, 0, 2, 2)).toBe(1)
      }
    })
  })

  describe('type exports', () => {
    it('SparseTable2DStats type is accessible', () => {
      const st = new SparseTable2D([[1, 2], [3, 4]])
      const stats: SparseTable2DStats = st.stats()
      expect(stats.rows).toBe(2)
      expect(stats.cols).toBe(2)
      expect(stats.totalElements).toBe(4)
    })

    it('SparseTable2DOptions type exists', () => {
      const _opts: SparseTable2DOptions = {}
      expect(_opts).toBeDefined()
    })
  })
})
