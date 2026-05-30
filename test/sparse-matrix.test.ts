import { describe, it, expect } from 'vitest'
import { SparseMatrix } from '../src/utils/sparse-matrix.js'

describe('SparseMatrix', () => {
  describe('constructor', () => {
    it('creates sparse matrix with dimensions', () => {
      const m = new SparseMatrix(3, 4)
      expect(m.rows).toBe(3)
      expect(m.cols).toBe(4)
      expect(m.nnz).toBe(0)
    })

    it('throws for invalid dimensions', () => {
      expect(() => new SparseMatrix(0, 5)).toThrow()
      expect(() => new SparseMatrix(3, 0)).toThrow()
    })
  })

  describe('fromDense', () => {
    it('creates from 2D array', () => {
      const m = SparseMatrix.fromDense([[1, 0], [0, 2]])
      expect(m.get(0, 0)).toBe(1)
      expect(m.get(0, 1)).toBe(0)
      expect(m.get(1, 1)).toBe(2)
      expect(m.nnz).toBe(2)
    })

    it('throws for empty array', () => {
      expect(() => SparseMatrix.fromDense([])).toThrow()
      expect(() => SparseMatrix.fromDense([[]])).toThrow()
    })

    it('throws for ragged array', () => {
      expect(() => SparseMatrix.fromDense([[1], [1, 2]])).toThrow()
    })
  })

  describe('fromEntries', () => {
    it('creates from entries', () => {
      const m = SparseMatrix.fromEntries(3, 3, [[0, 0, 5], [1, 2, 3]])
      expect(m.get(0, 0)).toBe(5)
      expect(m.get(1, 2)).toBe(3)
      expect(m.get(2, 2)).toBe(0)
    })
  })

  describe('set / get', () => {
    it('sets and gets values', () => {
      const m = new SparseMatrix(5, 5)
      m.set(2, 3, 42)
      expect(m.get(2, 3)).toBe(42)
    })

    it('returns 0 for unset cells', () => {
      expect(new SparseMatrix(5, 5).get(0, 0)).toBe(0)
    })

    it('deletes zero values', () => {
      const m = new SparseMatrix(5, 5)
      m.set(2, 3, 10)
      m.set(2, 3, 0)
      expect(m.get(2, 3)).toBe(0)
      expect(m.nnz).toBe(0)
    })

    it('throws for out-of-bounds', () => {
      const m = new SparseMatrix(3, 3)
      expect(() => m.set(-1, 0, 1)).toThrow()
      expect(() => m.set(3, 0, 1)).toThrow()
      expect(() => m.get(-1, 0)).toThrow()
    })
  })

  describe('density', () => {
    it('computes density correctly', () => {
      const m = new SparseMatrix(10, 10)
      expect(m.density).toBe(0)
      m.set(0, 0, 1)
      expect(m.density).toBe(0.01)
    })
  })

  describe('add', () => {
    it('adds two sparse matrices', () => {
      const a = SparseMatrix.fromDense([[1, 0], [0, 2]])
      const b = SparseMatrix.fromDense([[0, 3], [4, 0]])
      const result = a.add(b)
      expect(result.toDense()).toEqual([[1, 3], [4, 2]])
    })

    it('handles cancellation to zero', () => {
      const a = SparseMatrix.fromDense([[5, 0], [0, 0]])
      const b = SparseMatrix.fromDense([[-5, 0], [0, 0]])
      const result = a.add(b)
      expect(result.get(0, 0)).toBe(0)
      expect(result.nnz).toBe(0)
    })

    it('throws for mismatched dimensions', () => {
      const a = new SparseMatrix(2, 3)
      const b = new SparseMatrix(3, 2)
      expect(() => a.add(b)).toThrow()
    })
  })

  describe('multiply', () => {
    it('multiplies two matrices', () => {
      const a = SparseMatrix.fromDense([[1, 2], [3, 4]])
      const b = SparseMatrix.fromDense([[5, 6], [7, 8]])
      const result = a.multiply(b)
      expect(result.toDense()).toEqual([[19, 22], [43, 50]])
    })

    it('throws for incompatible dimensions', () => {
      const a = new SparseMatrix(2, 3)
      const b = new SparseMatrix(2, 3)
      expect(() => a.multiply(b)).toThrow()
    })
  })

  describe('scale', () => {
    it('scales all values', () => {
      const m = SparseMatrix.fromDense([[1, 2], [3, 4]])
      const result = m.scale(2)
      expect(result.toDense()).toEqual([[2, 4], [6, 8]])
    })

    it('returns empty for scale by 0', () => {
      const m = SparseMatrix.fromDense([[1, 2], [3, 4]])
      const result = m.scale(0)
      expect(result.nnz).toBe(0)
    })
  })

  describe('transpose', () => {
    it('transposes matrix', () => {
      const m = SparseMatrix.fromDense([[1, 2, 3], [4, 5, 6]])
      const t = m.transpose()
      expect(t.rows).toBe(3)
      expect(t.cols).toBe(2)
      expect(t.toDense()).toEqual([[1, 4], [2, 5], [3, 6]])
    })
  })

  describe('toDense', () => {
    it('converts to 2D array', () => {
      const m = SparseMatrix.fromEntries(2, 2, [[0, 1, 3], [1, 0, 7]])
      expect(m.toDense()).toEqual([[0, 3], [7, 0]])
    })
  })

  describe('forEachNonZero', () => {
    it('iterates over non-zero entries', () => {
      const m = SparseMatrix.fromEntries(3, 3, [[0, 0, 1], [1, 2, 5]])
      const entries: [number, number, number][] = []
      m.forEachNonZero((r, c, v) => entries.push([r, c, v]))
      expect(entries).toEqual([[0, 0, 1], [1, 2, 5]])
    })
  })
})
