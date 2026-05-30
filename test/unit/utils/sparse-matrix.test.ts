import { describe, expect, it } from 'vitest'
import { SparseMatrix } from '../../../src/utils/sparse-matrix.js'

describe('SparseMatrix', () => {
  it('creates empty matrix with dimensions', () => {
    const matrix = new SparseMatrix(3, 4)
    expect(matrix.rows).toBe(3)
    expect(matrix.cols).toBe(4)
    expect(matrix.nnz).toBe(0)
    expect(matrix.density).toBe(0)
  })

  it('throws error for invalid dimensions', () => {
    expect(() => new SparseMatrix(0, 5)).toThrow('Rows and cols must be positive integers')
    expect(() => new SparseMatrix(5, 0)).toThrow('Rows and cols must be positive integers')
    expect(() => new SparseMatrix(-1, 5)).toThrow('Rows and cols must be positive integers')
  })

  it('sets and gets single element', () => {
    const matrix = new SparseMatrix(5, 5)
    matrix.set(2, 3, 42)
    expect(matrix.get(2, 3)).toBe(42)
    expect(matrix.nnz).toBe(1)
  })

  it('returns 0 for unset elements', () => {
    const matrix = new SparseMatrix(5, 5)
    expect(matrix.get(0, 0)).toBe(0)
    expect(matrix.get(4, 4)).toBe(0)
  })

  it('throws error for out of bounds get', () => {
    const matrix = new SparseMatrix(3, 3)
    expect(() => matrix.get(-1, 0)).toThrow('Index out of bounds')
    expect(() => matrix.get(0, -1)).toThrow('Index out of bounds')
    expect(() => matrix.get(3, 0)).toThrow('Index out of bounds')
    expect(() => matrix.get(0, 3)).toThrow('Index out of bounds')
  })

  it('throws error for out of bounds set', () => {
    const matrix = new SparseMatrix(3, 3)
    expect(() => matrix.set(-1, 0, 1)).toThrow('Index out of bounds')
    expect(() => matrix.set(0, -1, 1)).toThrow('Index out of bounds')
    expect(() => matrix.set(3, 0, 1)).toThrow('Index out of bounds')
    expect(() => matrix.set(0, 3, 1)).toThrow('Index out of bounds')
  })

  it('deletes element when setting to 0', () => {
    const matrix = new SparseMatrix(5, 5)
    matrix.set(2, 3, 42)
    expect(matrix.nnz).toBe(1)
    matrix.set(2, 3, 0)
    expect(matrix.nnz).toBe(0)
    expect(matrix.get(2, 3)).toBe(0)
  })

  it('handles negative values', () => {
    const matrix = new SparseMatrix(3, 3)
    matrix.set(0, 0, -5)
    matrix.set(1, 1, -10.5)
    expect(matrix.get(0, 0)).toBe(-5)
    expect(matrix.get(1, 1)).toBe(-10.5)
    expect(matrix.nnz).toBe(2)
  })

  it('calculates density correctly', () => {
    const matrix = new SparseMatrix(2, 2)
    matrix.set(0, 0, 1)
    matrix.set(1, 1, 1)
    expect(matrix.density).toBe(0.5)
  })

  it('creates matrix from dense array', () => {
    const dense = [
      [0, 1, 0],
      [0, 0, 2],
      [3, 0, 0],
    ]
    const matrix = SparseMatrix.fromDense(dense)
    expect(matrix.rows).toBe(3)
    expect(matrix.cols).toBe(3)
    expect(matrix.nnz).toBe(3)
    expect(matrix.get(0, 1)).toBe(1)
    expect(matrix.get(1, 2)).toBe(2)
    expect(matrix.get(2, 0)).toBe(3)
  })

  it('throws error for empty dense array', () => {
    expect(() => SparseMatrix.fromDense([])).toThrow('Data must have at least one row')
  })

  it('throws error for dense array with empty row', () => {
    expect(() => SparseMatrix.fromDense([[]])).toThrow('Data must have at least one column')
  })

  it('throws error for dense array with inconsistent row lengths', () => {
    expect(() => SparseMatrix.fromDense([[1, 2], [3]])).toThrow('All rows must have the same length')
  })

  it('creates matrix from entries', () => {
    const matrix = SparseMatrix.fromEntries(3, 3, [
      [0, 0, 1],
      [1, 2, 5],
      [2, 1, 10],
    ])
    expect(matrix.nnz).toBe(3)
    expect(matrix.get(0, 0)).toBe(1)
    expect(matrix.get(1, 2)).toBe(5)
    expect(matrix.get(2, 1)).toBe(10)
  })

  it('ignores zero values in fromEntries', () => {
    const matrix = SparseMatrix.fromEntries(3, 3, [
      [0, 0, 1],
      [1, 1, 0],
      [2, 2, 5],
    ])
    expect(matrix.nnz).toBe(2)
  })

  it('converts to dense array', () => {
    const matrix = new SparseMatrix(2, 2)
    matrix.set(0, 0, 1)
    matrix.set(1, 1, 2)
    const dense = matrix.toDense()
    expect(dense).toEqual([
      [1, 0],
      [0, 2],
    ])
  })

  it('iterates over non-zero elements', () => {
    const matrix = new SparseMatrix(3, 3)
    matrix.set(0, 1, 1)
    matrix.set(1, 2, 2)
    matrix.set(2, 0, 3)
    const entries: [number, number, number][] = []
    matrix.forEachNonZero((row, col, val) => {
      entries.push([row, col, val])
    })
    expect(entries.length).toBe(3)
    expect(entries).toContainEqual([0, 1, 1])
    expect(entries).toContainEqual([1, 2, 2])
    expect(entries).toContainEqual([2, 0, 3])
  })

  it('transposes matrix', () => {
    const matrix = new SparseMatrix(2, 3)
    matrix.set(0, 1, 5)
    matrix.set(1, 0, 10)
    const transposed = matrix.transpose()
    expect(transposed.rows).toBe(3)
    expect(transposed.cols).toBe(2)
    expect(transposed.get(1, 0)).toBe(5)
    expect(transposed.get(0, 1)).toBe(10)
  })

  it('transposes empty matrix', () => {
    const matrix = new SparseMatrix(2, 3)
    const transposed = matrix.transpose()
    expect(transposed.rows).toBe(3)
    expect(transposed.cols).toBe(2)
    expect(transposed.nnz).toBe(0)
  })

  it('adds two matrices', () => {
    const a = SparseMatrix.fromEntries(2, 2, [[0, 0, 1], [1, 1, 2]])
    const b = SparseMatrix.fromEntries(2, 2, [[0, 0, 3], [0, 1, 4]])
    const result = a.add(b)
    expect(result.get(0, 0)).toBe(4)
    expect(result.get(0, 1)).toBe(4)
    expect(result.get(1, 1)).toBe(2)
    expect(result.nnz).toBe(3)
  })

  it('throws error when adding matrices with different dimensions', () => {
    const a = new SparseMatrix(2, 3)
    const b = new SparseMatrix(3, 2)
    expect(() => a.add(b)).toThrow('Matrix dimensions must match for addition')
  })

  it('cancels out values when adding', () => {
    const a = SparseMatrix.fromEntries(2, 2, [[0, 0, 5]])
    const b = SparseMatrix.fromEntries(2, 2, [[0, 0, -5]])
    const result = a.add(b)
    expect(result.nnz).toBe(0)
    expect(result.get(0, 0)).toBe(0)
  })

  it('multiplies two matrices', () => {
    const a = SparseMatrix.fromEntries(2, 3, [[0, 0, 1], [0, 1, 2]])
    const b = SparseMatrix.fromEntries(3, 2, [[0, 0, 3], [1, 0, 4]])
    const result = a.multiply(b)
    expect(result.rows).toBe(2)
    expect(result.cols).toBe(2)
    expect(result.get(0, 0)).toBe(11)
  })

  it('throws error when multiplying incompatible matrices', () => {
    const a = new SparseMatrix(2, 3)
    const b = new SparseMatrix(2, 3)
    expect(() => a.multiply(b)).toThrow('Matrix dimensions incompatible for multiplication')
  })

  it('multiplies identity matrix', () => {
    const a = SparseMatrix.fromEntries(2, 2, [[0, 0, 5], [1, 1, 7]])
    const identity = SparseMatrix.fromEntries(2, 2, [[0, 0, 1], [1, 1, 1]])
    const result = a.multiply(identity)
    expect(result.get(0, 0)).toBe(5)
    expect(result.get(1, 1)).toBe(7)
  })

  it('scales matrix by scalar', () => {
    const matrix = SparseMatrix.fromEntries(2, 2, [[0, 0, 1], [1, 1, 2]])
    const scaled = matrix.scale(5)
    expect(scaled.get(0, 0)).toBe(5)
    expect(scaled.get(1, 1)).toBe(10)
    expect(scaled.nnz).toBe(2)
  })

  it('scales by zero returns empty matrix', () => {
    const matrix = SparseMatrix.fromEntries(2, 2, [[0, 0, 1], [1, 1, 2]])
    const scaled = matrix.scale(0)
    expect(scaled.nnz).toBe(0)
  })

  it('scales by negative scalar', () => {
    const matrix = SparseMatrix.fromEntries(2, 2, [[0, 0, 2], [1, 1, 3]])
    const scaled = matrix.scale(-2)
    expect(scaled.get(0, 0)).toBe(-4)
    expect(scaled.get(1, 1)).toBe(-6)
  })

  it('handles large sparse matrix', () => {
    const matrix = new SparseMatrix(1000, 1000)
    matrix.set(0, 0, 1)
    matrix.set(500, 500, 2)
    matrix.set(999, 999, 3)
    expect(matrix.nnz).toBe(3)
    expect(matrix.density).toBe(0.000003)
    expect(matrix.get(500, 500)).toBe(2)
  })

  it('handles single element matrix', () => {
    const matrix = new SparseMatrix(1, 1)
    matrix.set(0, 0, 42)
    expect(matrix.rows).toBe(1)
    expect(matrix.cols).toBe(1)
    expect(matrix.get(0, 0)).toBe(42)
    expect(matrix.nnz).toBe(1)
  })

  it('sets and gets floating point values', () => {
    const matrix = new SparseMatrix(3, 3)
    matrix.set(0, 0, 3.14159)
    matrix.set(1, 1, 2.71828)
    expect(matrix.get(0, 0)).toBeCloseTo(3.14159, 5)
    expect(matrix.get(1, 1)).toBeCloseTo(2.71828, 5)
  })
})