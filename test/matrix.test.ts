import { describe, it, expect } from 'vitest'
import { Matrix } from '../src/utils/matrix.js'

describe('Matrix', () => {
  describe('constructor', () => {
    it('creates matrix with default fill value 0', () => {
      const m = new Matrix(2, 3)
      expect(m.rows).toBe(2)
      expect(m.cols).toBe(3)
      expect(m.get(0, 0)).toBe(0)
      expect(m.get(1, 2)).toBe(0)
    })

    it('creates matrix with custom fill value', () => {
      const m = new Matrix(2, 3, 5)
      expect(m.rows).toBe(2)
      expect(m.cols).toBe(3)
      expect(m.get(0, 0)).toBe(5)
      expect(m.get(1, 2)).toBe(5)
    })

    it('throws error for non-positive rows', () => {
      expect(() => new Matrix(0, 3)).toThrow('Matrix dimensions must be positive integers')
      expect(() => new Matrix(-1, 3)).toThrow('Matrix dimensions must be positive integers')
    })

    it('throws error for non-positive columns', () => {
      expect(() => new Matrix(2, 0)).toThrow('Matrix dimensions must be positive integers')
      expect(() => new Matrix(2, -1)).toThrow('Matrix dimensions must be positive integers')
    })
  })

  describe('from2DArray', () => {
    it('creates matrix from 2D array', () => {
      const m = Matrix.from2DArray([
        [1, 2, 3],
        [4, 5, 6]
      ])
      expect(m.rows).toBe(2)
      expect(m.cols).toBe(3)
      expect(m.get(0, 0)).toBe(1)
      expect(m.get(0, 2)).toBe(3)
      expect(m.get(1, 0)).toBe(4)
      expect(m.get(1, 2)).toBe(6)
    })

    it('throws error for empty array', () => {
      expect(() => Matrix.from2DArray([])).toThrow('Cannot create matrix from empty array')
    })

    it('throws error for empty row', () => {
      expect(() => Matrix.from2DArray([[]])).toThrow('Cannot create matrix from empty array')
    })

    it('throws error for jagged arrays', () => {
      expect(() => Matrix.from2DArray([
        [1, 2, 3],
        [4, 5]
      ])).toThrow('All rows must have the same length')
    })
  })

  describe('identity', () => {
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
      expect(m.rows).toBe(1)
      expect(m.cols).toBe(1)
      expect(m.get(0, 0)).toBe(1)
    })
  })

  describe('zeros', () => {
    it('creates matrix filled with zeros', () => {
      const m = Matrix.zeros(2, 3)
      expect(m.rows).toBe(2)
      expect(m.cols).toBe(3)
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 3; j++) {
          expect(m.get(i, j)).toBe(0)
        }
      }
    })
  })

  describe('ones', () => {
    it('creates matrix filled with ones', () => {
      const m = Matrix.ones(2, 3)
      expect(m.rows).toBe(2)
      expect(m.cols).toBe(3)
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 3; j++) {
          expect(m.get(i, j)).toBe(1)
        }
      }
    })
  })

  describe('get and set', () => {
    it('gets and sets values correctly', () => {
      const m = new Matrix(3, 3)
      m.set(1, 2, 42)
      expect(m.get(1, 2)).toBe(42)
    })

    it('throws error for out of bounds row', () => {
      const m = new Matrix(2, 3)
      expect(() => m.get(-1, 1)).toThrow('Index (-1, 1) out of bounds for 2x3 matrix')
      expect(() => m.get(2, 1)).toThrow('Index (2, 1) out of bounds for 2x3 matrix')
    })

    it('throws error for out of bounds column', () => {
      const m = new Matrix(2, 3)
      expect(() => m.get(1, -1)).toThrow('Index (1, -1) out of bounds for 2x3 matrix')
      expect(() => m.get(1, 3)).toThrow('Index (1, 3) out of bounds for 2x3 matrix')
    })

    it('throws error when setting out of bounds', () => {
      const m = new Matrix(2, 3)
      expect(() => m.set(2, 1, 42)).toThrow('Index (2, 1) out of bounds for 2x3 matrix')
    })
  })

  describe('rows and cols', () => {
    it('returns correct dimensions', () => {
      const m = new Matrix(3, 4)
      expect(m.rows).toBe(3)
      expect(m.cols).toBe(4)
    })
  })

  describe('add', () => {
    it('adds two matrices', () => {
      const a = Matrix.from2DArray([[1, 2], [3, 4]])
      const b = Matrix.from2DArray([[5, 6], [7, 8]])
      const result = a.add(b)
      expect(result.get(0, 0)).toBe(6)
      expect(result.get(0, 1)).toBe(8)
      expect(result.get(1, 0)).toBe(10)
      expect(result.get(1, 1)).toBe(12)
    })

    it('throws error for dimension mismatch', () => {
      const a = new Matrix(2, 3)
      const b = new Matrix(3, 2)
      expect(() => a.add(b)).toThrow('Dimension mismatch: 2x3 vs 3x2')
    })
  })

  describe('subtract', () => {
    it('subtracts two matrices', () => {
      const a = Matrix.from2DArray([[5, 6], [7, 8]])
      const b = Matrix.from2DArray([[1, 2], [3, 4]])
      const result = a.subtract(b)
      expect(result.get(0, 0)).toBe(4)
      expect(result.get(0, 1)).toBe(4)
      expect(result.get(1, 0)).toBe(4)
      expect(result.get(1, 1)).toBe(4)
    })

    it('throws error for dimension mismatch', () => {
      const a = new Matrix(2, 3)
      const b = new Matrix(3, 2)
      expect(() => a.subtract(b)).toThrow('Dimension mismatch: 2x3 vs 3x2')
    })
  })

  describe('multiply', () => {
    it('multiplies two compatible matrices', () => {
      const a = Matrix.from2DArray([[1, 2], [3, 4]])
      const b = Matrix.from2DArray([[5, 6], [7, 8]])
      const result = a.multiply(b)
      expect(result.get(0, 0)).toBe(19)
      expect(result.get(0, 1)).toBe(22)
      expect(result.get(1, 0)).toBe(43)
      expect(result.get(1, 1)).toBe(50)
    })

    it('multiplies 2x3 by 3x2 matrices', () => {
      const a = Matrix.from2DArray([[1, 2, 3], [4, 5, 6]])
      const b = Matrix.from2DArray([[7, 8], [9, 10], [11, 12]])
      const result = a.multiply(b)
      expect(result.get(0, 0)).toBe(58)
      expect(result.get(0, 1)).toBe(64)
      expect(result.get(1, 0)).toBe(139)
      expect(result.get(1, 1)).toBe(154)
    })

    it('throws error for incompatible dimensions', () => {
      const a = new Matrix(2, 3)
      const b = new Matrix(2, 3)
      expect(() => a.multiply(b)).toThrow('Cannot multiply 2x3 by 2x3')
    })

    it('identity multiplication preserves matrix', () => {
      const a = Matrix.from2DArray([[1, 2, 3], [4, 5, 6]])
      const identity = Matrix.identity(3)
      const result = a.multiply(identity)
      expect(result.equals(a)).toBe(true)
    })

    it('zero matrix multiplication yields zero matrix', () => {
      const a = Matrix.from2DArray([[1, 2], [3, 4]])
      const zero = Matrix.zeros(2, 2)
      const result = a.multiply(zero)
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          expect(result.get(i, j)).toBe(0)
        }
      }
    })
  })

  describe('scale', () => {
    it('scales matrix by scalar', () => {
      const m = Matrix.from2DArray([[1, 2], [3, 4]])
      const result = m.scale(2)
      expect(result.get(0, 0)).toBe(2)
      expect(result.get(0, 1)).toBe(4)
      expect(result.get(1, 0)).toBe(6)
      expect(result.get(1, 1)).toBe(8)
    })

    it('scales by zero', () => {
      const m = Matrix.from2DArray([[1, 2], [3, 4]])
      const result = m.scale(0)
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          expect(result.get(i, j)).toBe(0)
        }
      }
    })

    it('scales by negative scalar', () => {
      const m = Matrix.from2DArray([[1, 2], [3, 4]])
      const result = m.scale(-1)
      expect(result.get(0, 0)).toBe(-1)
      expect(result.get(1, 1)).toBe(-4)
    })
  })

  describe('transpose', () => {
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

    it('transpose of transpose is original', () => {
      const m = Matrix.from2DArray([[1, 2, 3], [4, 5, 6]])
      expect(m.transpose().transpose().equals(m)).toBe(true)
    })

    it('transpose of square matrix', () => {
      const m = Matrix.from2DArray([[1, 2], [3, 4]])
      const result = m.transpose()
      expect(result.get(0, 0)).toBe(1)
      expect(result.get(0, 1)).toBe(3)
      expect(result.get(1, 0)).toBe(2)
      expect(result.get(1, 1)).toBe(4)
    })
  })

  describe('determinant', () => {
    it('computes determinant of 1x1 matrix', () => {
      const m = Matrix.from2DArray([[5]])
      expect(m.determinant()).toBe(5)
    })

    it('computes determinant of 2x2 matrix', () => {
      const m = Matrix.from2DArray([[1, 2], [3, 4]])
      expect(m.determinant()).toBe(-2)
    })

    it('computes determinant of 3x3 matrix', () => {
      const m = Matrix.from2DArray([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
      expect(m.determinant()).toBe(0)
    })

    it('computes determinant of identity matrix', () => {
      const m = Matrix.identity(4)
      expect(m.determinant()).toBe(1)
    })

    it('throws error for non-square matrix', () => {
      const m = new Matrix(2, 3)
      expect(() => m.determinant()).toThrow('Determinant is only defined for square matrices')
    })
  })

  describe('trace', () => {
    it('computes trace of square matrix', () => {
      const m = Matrix.from2DArray([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
      expect(m.trace()).toBe(15)
    })

    it('computes trace of identity matrix', () => {
      const m = Matrix.identity(4)
      expect(m.trace()).toBe(4)
    })

    it('throws error for non-square matrix', () => {
      const m = new Matrix(2, 3)
      expect(() => m.trace()).toThrow('Trace is only defined for square matrices')
    })
  })

  describe('isSquare', () => {
    it('returns true for square matrix', () => {
      const m = new Matrix(3, 3)
      expect(m.isSquare()).toBe(true)
    })

    it('returns false for non-square matrix', () => {
      const m = new Matrix(2, 3)
      expect(m.isSquare()).toBe(false)
    })

    it('returns true for 1x1 matrix', () => {
      const m = new Matrix(1, 1)
      expect(m.isSquare()).toBe(true)
    })
  })

  describe('equals', () => {
    it('returns true for equal matrices', () => {
      const a = Matrix.from2DArray([[1, 2], [3, 4]])
      const b = Matrix.from2DArray([[1, 2], [3, 4]])
      expect(a.equals(b)).toBe(true)
    })

    it('returns false for different matrices', () => {
      const a = Matrix.from2DArray([[1, 2], [3, 4]])
      const b = Matrix.from2DArray([[1, 2], [3, 5]])
      expect(a.equals(b)).toBe(false)
    })

    it('returns false for different dimensions', () => {
      const a = new Matrix(2, 3)
      const b = new Matrix(3, 2)
      expect(a.equals(b)).toBe(false)
    })

    it('matrix equals itself', () => {
      const m = Matrix.from2DArray([[1, 2], [3, 4]])
      expect(m.equals(m)).toBe(true)
    })
  })

  describe('toArray', () => {
    it('converts matrix to 2D array', () => {
      const m = Matrix.from2DArray([[1, 2, 3], [4, 5, 6]])
      const result = m.toArray()
      expect(result).toEqual([
        [1, 2, 3],
        [4, 5, 6]
      ])
    })

    it('creates new array, not reference', () => {
      const m = Matrix.from2DArray([[1, 2], [3, 4]])
      const arr = m.toArray()
      arr[0][0] = 99
      expect(m.get(0, 0)).toBe(1)
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const m = Matrix.from2DArray([[1, 2], [3, 4]])
      const clone = m.clone()
      expect(m.equals(clone)).toBe(true)
      clone.set(0, 0, 99)
      expect(m.get(0, 0)).toBe(1)
      expect(clone.get(0, 0)).toBe(99)
    })

    it('clone has same dimensions', () => {
      const m = new Matrix(3, 4)
      const clone = m.clone()
      expect(clone.rows).toBe(3)
      expect(clone.cols).toBe(4)
    })
  })

  describe('map', () => {
    it('applies function to all elements', () => {
      const m = Matrix.from2DArray([[1, 2], [3, 4]])
      const result = m.map((val) => val * 2)
      expect(result.get(0, 0)).toBe(2)
      expect(result.get(0, 1)).toBe(4)
      expect(result.get(1, 0)).toBe(6)
      expect(result.get(1, 1)).toBe(8)
    })

    it('provides row and column indices', () => {
      const m = Matrix.from2DArray([[1, 2], [3, 4]])
      const result = m.map((val, row, col) => row + col)
      expect(result.get(0, 0)).toBe(0)
      expect(result.get(0, 1)).toBe(1)
      expect(result.get(1, 0)).toBe(1)
      expect(result.get(1, 1)).toBe(2)
    })

    it('does not modify original matrix', () => {
      const m = Matrix.from2DArray([[1, 2], [3, 4]])
      m.map((val) => val * 2)
      expect(m.get(0, 0)).toBe(1)
    })

    it('can create complex transformations', () => {
      const m = Matrix.from2DArray([[1, 2], [3, 4]])
      const result = m.map((val) => Math.pow(val, 2))
      expect(result.get(0, 0)).toBe(1)
      expect(result.get(1, 1)).toBe(16)
    })
  })

  describe('edge cases', () => {
    it('handles 1x1 matrix operations', () => {
      const a = Matrix.from2DArray([[5]])
      const b = Matrix.from2DArray([[3]])
      expect(a.add(b).get(0, 0)).toBe(8)
      expect(a.subtract(b).get(0, 0)).toBe(2)
      expect(a.multiply(b).get(0, 0)).toBe(15)
      expect(a.scale(2).get(0, 0)).toBe(10)
      expect(a.determinant()).toBe(5)
      expect(a.trace()).toBe(5)
    })

    it('handles large matrices', () => {
      const m = Matrix.ones(100, 100)
      expect(m.rows).toBe(100)
      expect(m.cols).toBe(100)
      expect(m.get(50, 50)).toBe(1)
    })

    it('handles floating point values', () => {
      const m = Matrix.from2DArray([[1.5, 2.5], [3.5, 4.5]])
      expect(m.get(0, 0)).toBe(1.5)
      expect(m.get(1, 1)).toBe(4.5)
    })
  })
})