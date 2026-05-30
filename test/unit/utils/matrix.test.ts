import { describe, expect, it } from 'vitest'
import { Matrix } from '../../../src/utils/matrix.js'

describe('Matrix', () => {
  it('creates a matrix with specified dimensions and fill value', () => {
    const m = new Matrix(2, 3, 5)
    expect(m.rows).toBe(2)
    expect(m.cols).toBe(3)
    expect(m.get(0, 0)).toBe(5)
    expect(m.get(1, 2)).toBe(5)
  })

  it('throws error for zero rows', () => {
    expect(() => new Matrix(0, 3)).toThrow('Matrix dimensions must be positive integers')
  })

  it('throws error for zero columns', () => {
    expect(() => new Matrix(3, 0)).toThrow('Matrix dimensions must be positive integers')
  })

  it('throws error for negative rows', () => {
    expect(() => new Matrix(-1, 3)).toThrow('Matrix dimensions must be positive integers')
  })

  it('creates a matrix from 2D array', () => {
    const m = Matrix.from2DArray([[1, 2], [3, 4]])
    expect(m.rows).toBe(2)
    expect(m.cols).toBe(2)
    expect(m.get(0, 0)).toBe(1)
    expect(m.get(0, 1)).toBe(2)
    expect(m.get(1, 0)).toBe(3)
    expect(m.get(1, 1)).toBe(4)
  })

  it('throws error for empty array', () => {
    expect(() => Matrix.from2DArray([])).toThrow('Cannot create matrix from empty array')
  })

  it('throws error for array with empty row', () => {
    expect(() => Matrix.from2DArray([[]])).toThrow('Cannot create matrix from empty array')
  })

  it('throws error for jagged array', () => {
    expect(() => Matrix.from2DArray([[1, 2], [3]])).toThrow('All rows must have the same length')
  })

  it('creates identity matrix', () => {
    const m = Matrix.identity(3)
    expect(m.rows).toBe(3)
    expect(m.cols).toBe(3)
    expect(m.get(0, 0)).toBe(1)
    expect(m.get(1, 1)).toBe(1)
    expect(m.get(2, 2)).toBe(1)
    expect(m.get(0, 1)).toBe(0)
    expect(m.get(1, 0)).toBe(0)
  })

  it('creates 1x1 identity matrix', () => {
    const m = Matrix.identity(1)
    expect(m.get(0, 0)).toBe(1)
  })

  it('creates zeros matrix', () => {
    const m = Matrix.zeros(2, 3)
    expect(m.get(0, 0)).toBe(0)
    expect(m.get(1, 2)).toBe(0)
  })

  it('creates ones matrix', () => {
    const m = Matrix.ones(2, 3)
    expect(m.get(0, 0)).toBe(1)
    expect(m.get(1, 2)).toBe(1)
  })

  it('gets and sets values', () => {
    const m = new Matrix(3, 3)
    m.set(1, 2, 42)
    expect(m.get(1, 2)).toBe(42)
  })

  it('throws error for get out of bounds', () => {
    const m = new Matrix(2, 3)
    expect(() => m.get(2, 0)).toThrow('Index (2, 0) out of bounds')
  })

  it('throws error for set out of bounds', () => {
    const m = new Matrix(2, 3)
    expect(() => m.set(0, 3, 5)).toThrow('Index (0, 3) out of bounds')
  })

  it('throws error for negative index', () => {
    const m = new Matrix(2, 3)
    expect(() => m.get(-1, 0)).toThrow('Index (-1, 0) out of bounds')
  })

  it('adds two matrices', () => {
    const m1 = Matrix.from2DArray([[1, 2], [3, 4]])
    const m2 = Matrix.from2DArray([[5, 6], [7, 8]])
    const result = m1.add(m2)
    expect(result.get(0, 0)).toBe(6)
    expect(result.get(0, 1)).toBe(8)
    expect(result.get(1, 0)).toBe(10)
    expect(result.get(1, 1)).toBe(12)
  })

  it('throws error when adding matrices of different dimensions', () => {
    const m1 = new Matrix(2, 3)
    const m2 = new Matrix(3, 2)
    expect(() => m1.add(m2)).toThrow('Dimension mismatch')
  })

  it('subtracts two matrices', () => {
    const m1 = Matrix.from2DArray([[5, 6], [7, 8]])
    const m2 = Matrix.from2DArray([[1, 2], [3, 4]])
    const result = m1.subtract(m2)
    expect(result.get(0, 0)).toBe(4)
    expect(result.get(0, 1)).toBe(4)
    expect(result.get(1, 0)).toBe(4)
    expect(result.get(1, 1)).toBe(4)
  })

  it('multiplies two compatible matrices', () => {
    const m1 = Matrix.from2DArray([[1, 2], [3, 4]])
    const m2 = Matrix.from2DArray([[5, 6], [7, 8]])
    const result = m1.multiply(m2)
    expect(result.rows).toBe(2)
    expect(result.cols).toBe(2)
    expect(result.get(0, 0)).toBe(19)
    expect(result.get(0, 1)).toBe(22)
    expect(result.get(1, 0)).toBe(43)
    expect(result.get(1, 1)).toBe(50)
  })

  it('multiplies matrices with different dimensions', () => {
    const m1 = Matrix.from2DArray([[1, 2, 3], [4, 5, 6]])
    const m2 = Matrix.from2DArray([[7, 8], [9, 10], [11, 12]])
    const result = m1.multiply(m2)
    expect(result.rows).toBe(2)
    expect(result.cols).toBe(2)
    expect(result.get(0, 0)).toBe(58)
    expect(result.get(0, 1)).toBe(64)
    expect(result.get(1, 0)).toBe(139)
    expect(result.get(1, 1)).toBe(154)
  })

  it('throws error when multiplying incompatible matrices', () => {
    const m1 = new Matrix(2, 3)
    const m2 = new Matrix(2, 3)
    expect(() => m1.multiply(m2)).toThrow('Cannot multiply 2x3 by 2x3')
  })

  it('scales matrix by scalar', () => {
    const m = Matrix.from2DArray([[1, 2], [3, 4]])
    const result = m.scale(2)
    expect(result.get(0, 0)).toBe(2)
    expect(result.get(0, 1)).toBe(4)
    expect(result.get(1, 0)).toBe(6)
    expect(result.get(1, 1)).toBe(8)
  })

  it('transposes matrix', () => {
    const m = Matrix.from2DArray([[1, 2, 3], [4, 5, 6]])
    const result = m.transpose()
    expect(result.rows).toBe(3)
    expect(result.cols).toBe(2)
    expect(result.get(0, 0)).toBe(1)
    expect(result.get(0, 1)).toBe(4)
    expect(result.get(1, 0)).toBe(2)
    expect(result.get(1, 1)).toBe(5)
    expect(result.get(2, 0)).toBe(3)
    expect(result.get(2, 1)).toBe(6)
  })

  it('calculates determinant of 1x1 matrix', () => {
    const m = Matrix.from2DArray([[5]])
    expect(m.determinant()).toBe(5)
  })

  it('calculates determinant of 2x2 matrix', () => {
    const m = Matrix.from2DArray([[1, 2], [3, 4]])
    expect(m.determinant()).toBe(-2)
  })

  it('calculates determinant of 3x3 matrix', () => {
    const m = Matrix.from2DArray([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
    expect(m.determinant()).toBe(0)
  })

  it('calculates determinant of identity matrix', () => {
    const m = Matrix.identity(3)
    expect(m.determinant()).toBe(1)
  })

  it('throws error for determinant of non-square matrix', () => {
    const m = new Matrix(2, 3)
    expect(() => m.determinant()).toThrow('Determinant is only defined for square matrices')
  })

  it('calculates trace of square matrix', () => {
    const m = Matrix.from2DArray([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
    expect(m.trace()).toBe(15)
  })

  it('throws error for trace of non-square matrix', () => {
    const m = new Matrix(2, 3)
    expect(() => m.trace()).toThrow('Trace is only defined for square matrices')
  })

  it('checks if matrix is square', () => {
    const square = new Matrix(3, 3)
    const rect = new Matrix(2, 3)
    expect(square.isSquare()).toBe(true)
    expect(rect.isSquare()).toBe(false)
  })

  it('checks equality of matrices', () => {
    const m1 = Matrix.from2DArray([[1, 2], [3, 4]])
    const m2 = Matrix.from2DArray([[1, 2], [3, 4]])
    const m3 = Matrix.from2DArray([[1, 2], [3, 5]])
    expect(m1.equals(m2)).toBe(true)
    expect(m1.equals(m3)).toBe(false)
  })

  it('checks equality of different dimensions', () => {
    const m1 = new Matrix(2, 3)
    const m2 = new Matrix(3, 2)
    expect(m1.equals(m2)).toBe(false)
  })

  it('converts matrix to array', () => {
    const m = Matrix.from2DArray([[1, 2], [3, 4]])
    const arr = m.toArray()
    expect(arr).toEqual([[1, 2], [3, 4]])
  })

  it('clones matrix', () => {
    const m = Matrix.from2DArray([[1, 2], [3, 4]])
    const clone = m.clone()
    expect(clone.equals(m)).toBe(true)
    clone.set(0, 0, 99)
    expect(m.get(0, 0)).toBe(1)
  })

  it('maps function over matrix elements', () => {
    const m = Matrix.from2DArray([[1, 2], [3, 4]])
    const result = m.map((val, row, col) => val * 2 + row + col)
    expect(result.get(0, 0)).toBe(2)
    expect(result.get(0, 1)).toBe(5)
    expect(result.get(1, 0)).toBe(7)
    expect(result.get(1, 1)).toBe(10)
  })

  it('handles large matrix operations', () => {
    const m = new Matrix(100, 100, 1)
    const m2 = m.scale(2)
    expect(m2.get(99, 99)).toBe(2)
  })
})