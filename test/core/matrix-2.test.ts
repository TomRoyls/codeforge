import { describe, it, expect } from 'vitest'
import { Matrix2 } from '../../src/core/matrix-2/index.js'

describe('Matrix2', () => {
  describe('constructor', () => {
    it('creates matrix with given dimensions filled with 0', () => {
      const m = new Matrix2(2, 3)
      expect(m.rows()).toBe(2)
      expect(m.cols()).toBe(3)
      expect(m.toArray()).toEqual([[0, 0, 0], [0, 0, 0]])
    })

    it('creates matrix with custom fill value', () => {
      const m = new Matrix2(2, 2, 7)
      expect(m.toArray()).toEqual([[7, 7], [7, 7]])
    })

    it('creates 1x1 matrix', () => {
      const m = new Matrix2(1, 1)
      expect(m.rows()).toBe(1)
      expect(m.cols()).toBe(1)
      expect(m.get(0, 0)).toBe(0)
    })

    it('creates 0x0 matrix', () => {
      const m = new Matrix2(0, 0)
      expect(m.rows()).toBe(0)
      expect(m.cols()).toBe(0)
    })

    it('creates non-square matrix', () => {
      const m = new Matrix2(3, 1)
      expect(m.rows()).toBe(3)
      expect(m.cols()).toBe(1)
    })
  })

  // ─── get and set ───

  describe('get and set', () => {
    it('gets default fill value', () => {
      const m = new Matrix2(3, 3)
      expect(m.get(0, 0)).toBe(0)
    })

    it('sets and gets a value', () => {
      const m = new Matrix2(3, 3)
      m.set(1, 2, 42)
      expect(m.get(1, 2)).toBe(42)
    })

    it('does not affect other cells when setting', () => {
      const m = new Matrix2(2, 2)
      m.set(0, 0, 5)
      expect(m.get(0, 1)).toBe(0)
      expect(m.get(1, 0)).toBe(0)
    })

    it('handles negative values', () => {
      const m = new Matrix2(2, 2)
      m.set(0, 0, -10)
      expect(m.get(0, 0)).toBe(-10)
    })
  })

  // ─── add ───

  describe('add', () => {
    it('adds two matrices of same dimensions', () => {
      const a = Matrix2.fromArray([[1, 2], [3, 4]])
      const b = Matrix2.fromArray([[5, 6], [7, 8]])
      const result = a.add(b)
      expect(result.toArray()).toEqual([[6, 8], [10, 12]])
    })

    it('throws when dimensions do not match', () => {
      const a = new Matrix2(2, 3)
      const b = new Matrix2(3, 2)
      expect(() => a.add(b)).toThrow('Matrix dimensions must match for addition')
    })

    it('returns new matrix without modifying original', () => {
      const a = Matrix2.fromArray([[1, 2]])
      const b = Matrix2.fromArray([[3, 4]])
      const result = a.add(b)
      expect(a.toArray()).toEqual([[1, 2]])
      expect(result.toArray()).toEqual([[4, 6]])
    })

    it('handles negative values', () => {
      const a = Matrix2.fromArray([[-1, 2]])
      const b = Matrix2.fromArray([[3, -4]])
      expect(a.add(b).toArray()).toEqual([[2, -2]])
    })
  })

  // ─── multiply ───

  describe('multiply', () => {
    it('multiplies two compatible matrices', () => {
      const a = Matrix2.fromArray([[1, 2], [3, 4]])
      const b = Matrix2.fromArray([[5, 6], [7, 8]])
      const result = a.multiply(b)
      expect(result.toArray()).toEqual([[19, 22], [43, 50]])
    })

    it('throws when inner dimensions do not match', () => {
      const a = new Matrix2(2, 3)
      const b = new Matrix2(2, 2)
      expect(() => a.multiply(b)).toThrow('Matrix dimensions must match for multiplication')
    })

    it('multiplies non-square matrices', () => {
      const a = Matrix2.fromArray([[1, 2, 3]])
      const b = Matrix2.fromArray([[4], [5], [6]])
      const result = a.multiply(b)
      expect(result.toArray()).toEqual([[32]])
      expect(result.rows()).toBe(1)
      expect(result.cols()).toBe(1)
    })

    it('returns new matrix without modifying original', () => {
      const a = Matrix2.fromArray([[1, 0]])
      const b = Matrix2.fromArray([[1], [0]])
      a.multiply(b)
      expect(a.toArray()).toEqual([[1, 0]])
    })

    it('produces zero matrix for zero operands', () => {
      const a = new Matrix2(2, 2)
      const b = Matrix2.fromArray([[1, 2], [3, 4]])
      expect(a.multiply(b).toArray()).toEqual([[0, 0], [0, 0]])
    })
  })

  // ─── scale ───

  describe('scale', () => {
    it('scales all elements by a scalar', () => {
      const m = Matrix2.fromArray([[1, 2], [3, 4]])
      expect(m.scale(2).toArray()).toEqual([[2, 4], [6, 8]])
    })

    it('scales by 0', () => {
      const m = Matrix2.fromArray([[1, 2], [3, 4]])
      expect(m.scale(0).toArray()).toEqual([[0, 0], [0, 0]])
    })

    it('scales by negative', () => {
      const m = Matrix2.fromArray([[1, -2]])
      expect(m.scale(-1).toArray()).toEqual([[-1, 2]])
    })

    it('returns new matrix without modifying original', () => {
      const m = Matrix2.fromArray([[1, 2]])
      m.scale(3)
      expect(m.toArray()).toEqual([[1, 2]])
    })
  })

  // ─── transpose ───

  describe('transpose', () => {
    it('transposes a square matrix', () => {
      const m = Matrix2.fromArray([[1, 2], [3, 4]])
      expect(m.transpose().toArray()).toEqual([[1, 3], [2, 4]])
    })

    it('transposes a non-square matrix', () => {
      const m = Matrix2.fromArray([[1, 2, 3], [4, 5, 6]])
      const t = m.transpose()
      expect(t.rows()).toBe(3)
      expect(t.cols()).toBe(2)
      expect(t.toArray()).toEqual([[1, 4], [2, 5], [3, 6]])
    })

    it('returns new matrix without modifying original', () => {
      const m = Matrix2.fromArray([[1, 2]])
      m.transpose()
      expect(m.toArray()).toEqual([[1, 2]])
    })

    it('transpose of transpose returns original', () => {
      const m = Matrix2.fromArray([[1, 2], [3, 4]])
      expect(m.transpose().transpose().toArray()).toEqual([[1, 2], [3, 4]])
    })
  })

  // ─── toArray ───

  describe('toArray', () => {
    it('returns a copy of the data', () => {
      const m = Matrix2.fromArray([[1, 2]])
      const arr = m.toArray()
      arr[0]![0] = 99
      expect(m.get(0, 0)).toBe(1)
    })
  })

  // ─── clone ───

  describe('clone', () => {
    it('creates an independent copy', () => {
      const m = Matrix2.fromArray([[1, 2], [3, 4]])
      const c = m.clone()
      m.set(0, 0, 99)
      expect(c.get(0, 0)).toBe(1)
    })

    it('preserves dimensions', () => {
      const m = new Matrix2(3, 5)
      const c = m.clone()
      expect(c.rows()).toBe(3)
      expect(c.cols()).toBe(5)
    })
  })

  // ─── fill ───

  describe('fill', () => {
    it('fills all elements with a value', () => {
      const m = new Matrix2(2, 2)
      m.fill(7)
      expect(m.toArray()).toEqual([[7, 7], [7, 7]])
    })

    it('modifies the matrix in place', () => {
      const m = Matrix2.fromArray([[1, 2]])
      m.fill(0)
      expect(m.get(0, 0)).toBe(0)
      expect(m.get(0, 1)).toBe(0)
    })
  })

  // ─── static fromArray ───

  describe('static fromArray', () => {
    it('creates matrix from 2D array', () => {
      const m = Matrix2.fromArray([[1, 2], [3, 4]])
      expect(m.rows()).toBe(2)
      expect(m.cols()).toBe(2)
      expect(m.get(0, 0)).toBe(1)
      expect(m.get(1, 1)).toBe(4)
    })

    it('creates matrix from single row', () => {
      const m = Matrix2.fromArray([[10, 20, 30]])
      expect(m.rows()).toBe(1)
      expect(m.cols()).toBe(3)
    })
  })

  // ─── static identity ───

  describe('static identity', () => {
    it('creates identity matrix of given size', () => {
      const m = Matrix2.identity(3)
      expect(m.toArray()).toEqual([[1, 0, 0], [0, 1, 0], [0, 0, 1]])
    })

    it('creates 1x1 identity', () => {
      const m = Matrix2.identity(1)
      expect(m.toArray()).toEqual([[1]])
    })
  })

  // ─── edge cases ───

  describe('edge cases', () => {
    it('handles fractional values', () => {
      const m = Matrix2.fromArray([[0.5, 1.5]])
      const scaled = m.scale(2)
      expect(scaled.toArray()).toEqual([[1, 3]])
    })

    it('large matrix multiplication', () => {
      const a = Matrix2.identity(5)
      const b = Matrix2.identity(5)
      const result = a.multiply(b)
      expect(result.toArray()).toEqual(Matrix2.identity(5).toArray())
    })
  })
})
