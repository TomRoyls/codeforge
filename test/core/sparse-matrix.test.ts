import { describe, it, expect, beforeEach } from 'vitest'
import { SparseMatrix } from '../../src/core/sparse-matrix/sparse-matrix.js'
import { DEFAULT_SPARSE_MATRIX_OPTIONS } from '../../src/core/sparse-matrix/types.js'
import type { MatrixEntry, MatrixDimensions, SparseMatrixOptions, MatrixStats } from '../../src/core/sparse-matrix/types.js'

describe('SparseMatrix', () => {
  let matrix: SparseMatrix

  beforeEach(() => {
    matrix = new SparseMatrix({ rows: 5, cols: 5 })
  })

  describe('constructor', () => {
    it('should create a matrix with specified dimensions', () => {
      const m = new SparseMatrix({ rows: 3, cols: 4 })
      const dims = m.getDimensions()
      expect(dims.rows).toBe(3)
      expect(dims.cols).toBe(4)
    })

    it('should create a matrix with default options', () => {
      const m = new SparseMatrix()
      expect(m.getDimensions().rows).toBe(DEFAULT_SPARSE_MATRIX_OPTIONS.rows)
      expect(m.getDimensions().cols).toBe(DEFAULT_SPARSE_MATRIX_OPTIONS.cols)
    })

    it('should accept custom defaultValue', () => {
      const m = new SparseMatrix({ rows: 3, cols: 3, defaultValue: -1 })
      expect(m.get(0, 0)).toBe(-1)
    })

    it('should accept partial options with defaults', () => {
      const m = new SparseMatrix({ rows: 10 })
      expect(m.getDimensions().rows).toBe(10)
      expect(m.getDimensions().cols).toBe(DEFAULT_SPARSE_MATRIX_OPTIONS.cols)
    })

    it('should start with zero non-zero entries', () => {
      expect(matrix.getNonZeroCount()).toBe(0)
    })

    it('should use defaultValue 0 by default', () => {
      const m = new SparseMatrix({ rows: 2, cols: 2 })
      expect(m.get(0, 0)).toBe(0)
    })
  })

  describe('set and get', () => {
    it('should set and get a value', () => {
      matrix.set(0, 0, 42)
      expect(matrix.get(0, 0)).toBe(42)
    })

    it('should set multiple values', () => {
      matrix.set(0, 0, 1)
      matrix.set(1, 1, 2)
      matrix.set(2, 2, 3)
      expect(matrix.get(0, 0)).toBe(1)
      expect(matrix.get(1, 1)).toBe(2)
      expect(matrix.get(2, 2)).toBe(3)
    })

    it('should overwrite an existing value', () => {
      matrix.set(0, 0, 10)
      matrix.set(0, 0, 20)
      expect(matrix.get(0, 0)).toBe(20)
    })

    it('should return defaultValue for unset cells', () => {
      expect(matrix.get(3, 3)).toBe(0)
    })

    it('should remove entry when set to defaultValue', () => {
      matrix.set(0, 0, 5)
      expect(matrix.getNonZeroCount()).toBe(1)
      matrix.set(0, 0, 0)
      expect(matrix.getNonZeroCount()).toBe(0)
      expect(matrix.get(0, 0)).toBe(0)
    })

    it('should handle negative values', () => {
      matrix.set(1, 2, -10)
      expect(matrix.get(1, 2)).toBe(-10)
    })

    it('should handle floating point values', () => {
      matrix.set(2, 3, 3.14)
      expect(matrix.get(2, 3)).toBeCloseTo(3.14)
    })

    it('should handle zero values', () => {
      matrix.set(0, 0, 0)
      expect(matrix.get(0, 0)).toBe(0)
      expect(matrix.getNonZeroCount()).toBe(0)
    })

    it('should throw on row out of bounds (negative)', () => {
      expect(() => matrix.set(-1, 0, 1)).toThrow(RangeError)
    })

    it('should throw on col out of bounds (negative)', () => {
      expect(() => matrix.set(0, -1, 1)).toThrow(RangeError)
    })

    it('should throw on row out of bounds (too large)', () => {
      expect(() => matrix.set(5, 0, 1)).toThrow(RangeError)
    })

    it('should throw on col out of bounds (too large)', () => {
      expect(() => matrix.set(0, 5, 1)).toThrow(RangeError)
    })

    it('should get with bounds validation', () => {
      expect(() => matrix.get(-1, 0)).toThrow(RangeError)
      expect(() => matrix.get(0, -1)).toThrow(RangeError)
      expect(() => matrix.get(5, 0)).toThrow(RangeError)
      expect(() => matrix.get(0, 5)).toThrow(RangeError)
    })
  })

  describe('has', () => {
    it('should return true for set entries', () => {
      matrix.set(0, 0, 1)
      expect(matrix.has(0, 0)).toBe(true)
    })

    it('should return false for unset entries', () => {
      expect(matrix.has(0, 0)).toBe(false)
    })

    it('should return false after removing entry', () => {
      matrix.set(0, 0, 5)
      matrix.remove(0, 0)
      expect(matrix.has(0, 0)).toBe(false)
    })

    it('should throw on out of bounds', () => {
      expect(() => matrix.has(-1, 0)).toThrow(RangeError)
      expect(() => matrix.has(0, 5)).toThrow(RangeError)
    })

    it('should return true for entries with negative values', () => {
      matrix.set(2, 2, -5)
      expect(matrix.has(2, 2)).toBe(true)
    })
  })

  describe('remove', () => {
    it('should remove an existing entry', () => {
      matrix.set(0, 0, 5)
      const removed = matrix.remove(0, 0)
      expect(removed).toBe(true)
      expect(matrix.get(0, 0)).toBe(0)
    })

    it('should return false for non-existing entry', () => {
      const removed = matrix.remove(0, 0)
      expect(removed).toBe(false)
    })

    it('should throw on out of bounds', () => {
      expect(() => matrix.remove(-1, 0)).toThrow(RangeError)
      expect(() => matrix.remove(0, 5)).toThrow(RangeError)
    })

    it('should decrease nonZeroCount after removal', () => {
      matrix.set(0, 0, 1)
      matrix.set(1, 1, 2)
      expect(matrix.getNonZeroCount()).toBe(2)
      matrix.remove(0, 0)
      expect(matrix.getNonZeroCount()).toBe(1)
    })

    it('should handle removing same entry twice', () => {
      matrix.set(0, 0, 5)
      expect(matrix.remove(0, 0)).toBe(true)
      expect(matrix.remove(0, 0)).toBe(false)
    })
  })

  describe('getRow', () => {
    it('should return entries for a specific row', () => {
      matrix.set(1, 0, 10)
      matrix.set(1, 2, 20)
      matrix.set(1, 4, 30)
      const row = matrix.getRow(1)
      expect(row).toHaveLength(3)
      expect(row[0]).toEqual({ row: 1, col: 0, value: 10 })
      expect(row[1]).toEqual({ row: 1, col: 2, value: 20 })
      expect(row[2]).toEqual({ row: 1, col: 4, value: 30 })
    })

    it('should return empty array for row with no entries', () => {
      const row = matrix.getRow(0)
      expect(row).toEqual([])
    })

    it('should sort entries by column', () => {
      matrix.set(0, 4, 1)
      matrix.set(0, 1, 2)
      matrix.set(0, 3, 3)
      const row = matrix.getRow(0)
      expect(row.map(e => e.col)).toEqual([1, 3, 4])
    })

    it('should not include entries from other rows', () => {
      matrix.set(0, 0, 1)
      matrix.set(1, 0, 2)
      const row = matrix.getRow(0)
      expect(row).toHaveLength(1)
      expect(row[0].value).toBe(1)
    })

    it('should throw on out of bounds', () => {
      expect(() => matrix.getRow(-1)).toThrow(RangeError)
      expect(() => matrix.getRow(5)).toThrow(RangeError)
    })
  })

  describe('getColumn', () => {
    it('should return entries for a specific column', () => {
      matrix.set(0, 1, 10)
      matrix.set(2, 1, 20)
      matrix.set(4, 1, 30)
      const col = matrix.getColumn(1)
      expect(col).toHaveLength(3)
      expect(col[0]).toEqual({ row: 0, col: 1, value: 10 })
      expect(col[1]).toEqual({ row: 2, col: 1, value: 20 })
      expect(col[2]).toEqual({ row: 4, col: 1, value: 30 })
    })

    it('should return empty array for column with no entries', () => {
      const col = matrix.getColumn(0)
      expect(col).toEqual([])
    })

    it('should sort entries by row', () => {
      matrix.set(4, 0, 1)
      matrix.set(1, 0, 2)
      matrix.set(3, 0, 3)
      const col = matrix.getColumn(0)
      expect(col.map(e => e.row)).toEqual([1, 3, 4])
    })

    it('should not include entries from other columns', () => {
      matrix.set(0, 0, 1)
      matrix.set(0, 1, 2)
      const col = matrix.getColumn(0)
      expect(col).toHaveLength(1)
      expect(col[0].value).toBe(1)
    })

    it('should throw on out of bounds', () => {
      expect(() => matrix.getColumn(-1)).toThrow(RangeError)
      expect(() => matrix.getColumn(5)).toThrow(RangeError)
    })
  })

  describe('getDimensions', () => {
    it('should return correct dimensions', () => {
      const dims = matrix.getDimensions()
      expect(dims).toEqual({ rows: 5, cols: 5 })
    })

    it('should return correct dimensions for non-square matrix', () => {
      const m = new SparseMatrix({ rows: 3, cols: 7 })
      const dims = m.getDimensions()
      expect(dims).toEqual({ rows: 3, cols: 7 })
    })
  })

  describe('getNonZeroCount', () => {
    it('should return 0 for empty matrix', () => {
      expect(matrix.getNonZeroCount()).toBe(0)
    })

    it('should count set entries', () => {
      matrix.set(0, 0, 1)
      matrix.set(1, 1, 2)
      matrix.set(2, 2, 3)
      expect(matrix.getNonZeroCount()).toBe(3)
    })

    it('should not count overwritten-to-default entries', () => {
      matrix.set(0, 0, 5)
      matrix.set(0, 0, 0)
      expect(matrix.getNonZeroCount()).toBe(0)
    })

    it('should count negative values as non-zero', () => {
      matrix.set(0, 0, -1)
      expect(matrix.getNonZeroCount()).toBe(1)
    })
  })

  describe('toArray', () => {
    it('should return a 2D array representation', () => {
      const m = new SparseMatrix({ rows: 2, cols: 2 })
      m.set(0, 0, 1)
      m.set(1, 1, 2)
      const arr = m.toArray()
      expect(arr).toEqual([
        [1, 0],
        [0, 2],
      ])
    })

    it('should return all default values for empty matrix', () => {
      const arr = matrix.toArray()
      expect(arr).toHaveLength(5)
      for (const row of arr) {
        expect(row).toHaveLength(5)
        for (const val of row) {
          expect(val).toBe(0)
        }
      }
    })

    it('should return correct values for 1x1 matrix', () => {
      const m = new SparseMatrix({ rows: 1, cols: 1 })
      m.set(0, 0, 42)
      expect(m.toArray()).toEqual([[42]])
    })

    it('should reflect current state after mutations', () => {
      matrix.set(0, 0, 5)
      matrix.set(0, 0, 10)
      const arr = matrix.toArray()
      expect(arr[0][0]).toBe(10)
    })
  })

  describe('add', () => {
    it('should add two matrices element-wise', () => {
      const a = new SparseMatrix({ rows: 2, cols: 2 })
      a.set(0, 0, 1)
      a.set(1, 1, 2)
      const b = new SparseMatrix({ rows: 2, cols: 2 })
      b.set(0, 0, 3)
      b.set(0, 1, 4)
      const result = a.add(b)
      expect(result.toArray()).toEqual([
        [4, 4],
        [0, 2],
      ])
    })

    it('should throw on dimension mismatch', () => {
      const a = new SparseMatrix({ rows: 2, cols: 2 })
      const b = new SparseMatrix({ rows: 3, cols: 3 })
      expect(() => a.add(b)).toThrow('Matrix dimensions must match for addition')
    })

    it('should not modify original matrices', () => {
      const a = new SparseMatrix({ rows: 2, cols: 2 })
      a.set(0, 0, 1)
      const b = new SparseMatrix({ rows: 2, cols: 2 })
      b.set(0, 0, 2)
      a.add(b)
      expect(a.get(0, 0)).toBe(1)
      expect(b.get(0, 0)).toBe(2)
    })

    it('should handle adding two empty matrices', () => {
      const a = new SparseMatrix({ rows: 2, cols: 2 })
      const b = new SparseMatrix({ rows: 2, cols: 2 })
      const result = a.add(b)
      expect(result.getNonZeroCount()).toBe(0)
    })

    it('should add matrices with negative values', () => {
      const a = new SparseMatrix({ rows: 1, cols: 1 })
      a.set(0, 0, 5)
      const b = new SparseMatrix({ rows: 1, cols: 1 })
      b.set(0, 0, -3)
      const result = a.add(b)
      expect(result.get(0, 0)).toBe(2)
    })

    it('should handle addition resulting in defaultValue', () => {
      const a = new SparseMatrix({ rows: 1, cols: 1 })
      a.set(0, 0, 5)
      const b = new SparseMatrix({ rows: 1, cols: 1 })
      b.set(0, 0, -5)
      const result = a.add(b)
      expect(result.get(0, 0)).toBe(0)
      expect(result.getNonZeroCount()).toBe(0)
    })

    it('should throw on row count mismatch', () => {
      const a = new SparseMatrix({ rows: 2, cols: 3 })
      const b = new SparseMatrix({ rows: 3, cols: 3 })
      expect(() => a.add(b)).toThrow()
    })

    it('should throw on col count mismatch', () => {
      const a = new SparseMatrix({ rows: 2, cols: 3 })
      const b = new SparseMatrix({ rows: 2, cols: 2 })
      expect(() => a.add(b)).toThrow()
    })
  })

  describe('scale', () => {
    it('should scale all values by a factor', () => {
      matrix.set(0, 0, 2)
      matrix.set(1, 1, 4)
      const result = matrix.scale(3)
      expect(result.get(0, 0)).toBe(6)
      expect(result.get(1, 1)).toBe(12)
    })

    it('should not modify the original matrix', () => {
      matrix.set(0, 0, 5)
      matrix.scale(2)
      expect(matrix.get(0, 0)).toBe(5)
    })

    it('should handle scaling by zero', () => {
      matrix.set(0, 0, 5)
      const result = matrix.scale(0)
      expect(result.get(0, 0)).toBe(0)
    })

    it('should handle scaling by negative factor', () => {
      matrix.set(0, 0, 3)
      const result = matrix.scale(-2)
      expect(result.get(0, 0)).toBe(-6)
    })

    it('should handle scaling by fractional factor', () => {
      matrix.set(0, 0, 10)
      const result = matrix.scale(0.5)
      expect(result.get(0, 0)).toBe(5)
    })

    it('should handle scaling empty matrix', () => {
      const result = matrix.scale(5)
      expect(result.getNonZeroCount()).toBe(0)
    })

    it('should handle scaling by 1 (identity)', () => {
      matrix.set(0, 0, 7)
      const result = matrix.scale(1)
      expect(result.get(0, 0)).toBe(7)
    })
  })

  describe('transpose', () => {
    it('should transpose a matrix', () => {
      const m = new SparseMatrix({ rows: 2, cols: 3 })
      m.set(0, 1, 5)
      m.set(1, 2, 10)
      const t = m.transpose()
      expect(t.getDimensions()).toEqual({ rows: 3, cols: 2 })
      expect(t.get(1, 0)).toBe(5)
      expect(t.get(2, 1)).toBe(10)
    })

    it('should not modify the original matrix', () => {
      matrix.set(0, 1, 5)
      matrix.transpose()
      expect(matrix.get(0, 1)).toBe(5)
      expect(matrix.getDimensions()).toEqual({ rows: 5, cols: 5 })
    })

    it('should transpose a square matrix', () => {
      const m = new SparseMatrix({ rows: 3, cols: 3 })
      m.set(0, 2, 1)
      m.set(2, 0, 2)
      const t = m.transpose()
      expect(t.get(2, 0)).toBe(1)
      expect(t.get(0, 2)).toBe(2)
    })

    it('should handle transposing empty matrix', () => {
      const m = new SparseMatrix({ rows: 3, cols: 4 })
      const t = m.transpose()
      expect(t.getDimensions()).toEqual({ rows: 4, cols: 3 })
      expect(t.getNonZeroCount()).toBe(0)
    })

    it('should transpose a 1x1 matrix', () => {
      const m = new SparseMatrix({ rows: 1, cols: 1 })
      m.set(0, 0, 42)
      const t = m.transpose()
      expect(t.get(0, 0)).toBe(42)
    })

    it('should double transpose back to original', () => {
      const m = new SparseMatrix({ rows: 2, cols: 3 })
      m.set(0, 1, 5)
      m.set(1, 0, 10)
      const tt = m.transpose().transpose()
      expect(tt.getDimensions()).toEqual({ rows: 2, cols: 3 })
      expect(tt.get(0, 1)).toBe(5)
      expect(tt.get(1, 0)).toBe(10)
    })
  })

  describe('getStats', () => {
    it('should return correct stats for empty matrix', () => {
      const stats = matrix.getStats()
      expect(stats.rows).toBe(5)
      expect(stats.cols).toBe(5)
      expect(stats.nonZeroCount).toBe(0)
      expect(stats.density).toBe(0)
      expect(stats.fillFactor).toBe(0)
    })

    it('should calculate density correctly', () => {
      matrix.set(0, 0, 1)
      const stats = matrix.getStats()
      expect(stats.density).toBeCloseTo(1 / 25)
    })

    it('should update stats after adding entries', () => {
      matrix.set(0, 0, 1)
      matrix.set(1, 1, 2)
      const stats = matrix.getStats()
      expect(stats.nonZeroCount).toBe(2)
      expect(stats.density).toBeCloseTo(2 / 25)
    })

    it('should update stats after removing entries', () => {
      matrix.set(0, 0, 1)
      matrix.remove(0, 0)
      const stats = matrix.getStats()
      expect(stats.nonZeroCount).toBe(0)
    })

    it('should handle fully populated matrix', () => {
      const m = new SparseMatrix({ rows: 2, cols: 2 })
      m.set(0, 0, 1)
      m.set(0, 1, 2)
      m.set(1, 0, 3)
      m.set(1, 1, 4)
      const stats = m.getStats()
      expect(stats.density).toBe(1)
      expect(stats.fillFactor).toBe(1)
    })

    it('should return density 0 for zero-dimension matrix', () => {
      const m = new SparseMatrix({ rows: 0, cols: 0 })
      expect(m.getStats().density).toBe(0)
    })
  })

  describe('clear', () => {
    it('should remove all entries', () => {
      matrix.set(0, 0, 1)
      matrix.set(1, 1, 2)
      matrix.set(2, 2, 3)
      matrix.clear()
      expect(matrix.getNonZeroCount()).toBe(0)
    })

    it('should preserve dimensions after clear', () => {
      matrix.set(0, 0, 1)
      matrix.clear()
      expect(matrix.getDimensions()).toEqual({ rows: 5, cols: 5 })
    })

    it('should allow adding after clear', () => {
      matrix.set(0, 0, 1)
      matrix.clear()
      matrix.set(1, 1, 5)
      expect(matrix.get(1, 1)).toBe(5)
      expect(matrix.getNonZeroCount()).toBe(1)
    })

    it('should handle clearing empty matrix', () => {
      matrix.clear()
      expect(matrix.getNonZeroCount()).toBe(0)
    })

    it('should return defaultValue after clear', () => {
      matrix.set(0, 0, 42)
      matrix.clear()
      expect(matrix.get(0, 0)).toBe(0)
    })
  })

  describe('forEach', () => {
    it('should iterate over all entries', () => {
      matrix.set(0, 0, 1)
      matrix.set(1, 2, 3)
      matrix.set(3, 4, 5)
      const entries: MatrixEntry[] = []
      matrix.forEach(entry => entries.push(entry))
      expect(entries).toHaveLength(3)
    })

    it('should provide correct entry data', () => {
      matrix.set(2, 3, 42)
      const entries: MatrixEntry[] = []
      matrix.forEach(entry => entries.push(entry))
      expect(entries[0]).toEqual({ row: 2, col: 3, value: 42 })
    })

    it('should not iterate for empty matrix', () => {
      let count = 0
      matrix.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('should iterate after modifications', () => {
      matrix.set(0, 0, 1)
      matrix.set(0, 0, 2)
      const entries: MatrixEntry[] = []
      matrix.forEach(entry => entries.push(entry))
      expect(entries).toHaveLength(1)
      expect(entries[0].value).toBe(2)
    })

    it('should not iterate entries removed during iteration setup', () => {
      matrix.set(0, 0, 1)
      matrix.set(1, 1, 2)
      matrix.remove(0, 0)
      const entries: MatrixEntry[] = []
      matrix.forEach(entry => entries.push(entry))
      expect(entries).toHaveLength(1)
    })
  })

  describe('edge cases', () => {
    it('should handle large sparse matrix', () => {
      const m = new SparseMatrix({ rows: 1000, cols: 1000 })
      m.set(0, 0, 1)
      m.set(999, 999, 2)
      m.set(500, 500, 3)
      expect(m.get(0, 0)).toBe(1)
      expect(m.get(999, 999)).toBe(2)
      expect(m.get(500, 500)).toBe(3)
      expect(m.getNonZeroCount()).toBe(3)
    })

    it('should handle custom defaultValue with set', () => {
      const m = new SparseMatrix({ rows: 2, cols: 2, defaultValue: -1 })
      m.set(0, 0, -1)
      expect(m.get(0, 0)).toBe(-1)
      expect(m.getNonZeroCount()).toBe(0)
    })

    it('should handle very large values', () => {
      matrix.set(0, 0, Number.MAX_SAFE_INTEGER)
      expect(matrix.get(0, 0)).toBe(Number.MAX_SAFE_INTEGER)
    })

    it('should handle very small values', () => {
      matrix.set(0, 0, Number.MIN_SAFE_INTEGER)
      expect(matrix.get(0, 0)).toBe(Number.MIN_SAFE_INTEGER)
    })

    it('should handle non-square matrices throughout', () => {
      const m = new SparseMatrix({ rows: 2, cols: 10 })
      m.set(0, 9, 1)
      m.set(1, 0, 2)
      expect(m.getDimensions()).toEqual({ rows: 2, cols: 10 })
      expect(m.get(0, 9)).toBe(1)
      expect(m.get(1, 0)).toBe(2)
      const arr = m.toArray()
      expect(arr).toHaveLength(2)
      expect(arr[0]).toHaveLength(10)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_SPARSE_MATRIX_OPTIONS', () => {
      expect(DEFAULT_SPARSE_MATRIX_OPTIONS.rows).toBe(0)
      expect(DEFAULT_SPARSE_MATRIX_OPTIONS.cols).toBe(0)
      expect(DEFAULT_SPARSE_MATRIX_OPTIONS.defaultValue).toBe(0)
    })

    it('should support MatrixEntry interface', () => {
      const entry: MatrixEntry = { row: 0, col: 0, value: 1 }
      expect(entry.row).toBe(0)
      expect(entry.col).toBe(0)
      expect(entry.value).toBe(1)
    })

    it('should support MatrixDimensions interface', () => {
      const dims: MatrixDimensions = { rows: 3, cols: 4 }
      expect(dims.rows).toBe(3)
      expect(dims.cols).toBe(4)
    })

    it('should support SparseMatrixOptions interface', () => {
      const opts: SparseMatrixOptions = { rows: 5, cols: 5, defaultValue: 0 }
      expect(opts.rows).toBe(5)
    })

    it('should support MatrixStats interface', () => {
      const stats: MatrixStats = {
        rows: 3,
        cols: 3,
        nonZeroCount: 2,
        density: 0.22,
        fillFactor: 0.22,
      }
      expect(stats.nonZeroCount).toBe(2)
      expect(stats.density).toBeCloseTo(0.22)
    })
  })
})
