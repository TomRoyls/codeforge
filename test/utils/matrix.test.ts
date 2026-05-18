import { describe, expect, it } from 'vitest'

import { Matrix } from '../../src/utils/matrix.js'

// ─── Constructor ─────────────────────────────────────────
describe('Matrix - constructor', () => {
  it('creates a zero-filled matrix', () => {
    const m = new Matrix(3, 4)
    expect(m.rows).toBe(3)
    expect(m.cols).toBe(4)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 4; j++) {
        expect(m.get(i, j)).toBe(0)
      }
    }
  })

  it('creates a matrix filled with a given value', () => {
    const m = new Matrix(2, 3, 7)
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 3; j++) {
        expect(m.get(i, j)).toBe(7)
      }
    }
  })
})

// ─── Static factories ────────────────────────────────────
describe('Matrix - static factories', () => {
  it('from2DArray creates matrix from 2D data', () => {
    const m = Matrix.from2DArray([
      [1, 2, 3],
      [4, 5, 6],
    ])
    expect(m.rows).toBe(2)
    expect(m.cols).toBe(3)
    expect(m.get(0, 0)).toBe(1)
    expect(m.get(1, 2)).toBe(6)
  })

  it('identity creates n×n identity matrix', () => {
    const m = Matrix.identity(3)
    expect(m.rows).toBe(3)
    expect(m.cols).toBe(3)
    expect(m.get(0, 0)).toBe(1)
    expect(m.get(1, 1)).toBe(1)
    expect(m.get(2, 2)).toBe(1)
    expect(m.get(0, 1)).toBe(0)
    expect(m.get(1, 0)).toBe(0)
  })

  it('zeros creates zero-filled matrix', () => {
    const m = Matrix.zeros(2, 2)
    expect(m.toArray()).toEqual([
      [0, 0],
      [0, 0],
    ])
  })

  it('ones creates one-filled matrix', () => {
    const m = Matrix.ones(2, 3)
    expect(m.toArray()).toEqual([
      [1, 1, 1],
      [1, 1, 1],
    ])
  })
})

// ─── get / set with bounds checking ──────────────────────
describe('Matrix - get/set', () => {
  it('set updates element and get retrieves it', () => {
    const m = new Matrix(2, 2)
    m.set(0, 0, 42)
    m.set(1, 1, 99)
    expect(m.get(0, 0)).toBe(42)
    expect(m.get(1, 1)).toBe(99)
  })

  it('get throws on out-of-bounds row', () => {
    const m = new Matrix(2, 2)
    expect(() => m.get(2, 0)).toThrow(RangeError)
  })

  it('get throws on negative index', () => {
    const m = new Matrix(2, 2)
    expect(() => m.get(-1, 0)).toThrow(RangeError)
  })

  it('set throws on out-of-bounds col', () => {
    const m = new Matrix(2, 2)
    expect(() => m.set(0, 5, 1)).toThrow(RangeError)
  })
})

// ─── add / subtract ─────────────────────────────────────
describe('Matrix - add', () => {
  it('adds two matrices element-wise', () => {
    const a = Matrix.from2DArray([
      [1, 2],
      [3, 4],
    ])
    const b = Matrix.from2DArray([
      [5, 6],
      [7, 8],
    ])
    const result = a.add(b)
    expect(result.toArray()).toEqual([
      [6, 8],
      [10, 12],
    ])
  })

  it('add throws on dimension mismatch', () => {
    const a = new Matrix(2, 3)
    const b = new Matrix(3, 2)
    expect(() => a.add(b)).toThrow(RangeError)
  })
})

describe('Matrix - subtract', () => {
  it('subtracts two matrices element-wise', () => {
    const a = Matrix.from2DArray([
      [10, 20],
      [30, 40],
    ])
    const b = Matrix.from2DArray([
      [1, 2],
      [3, 4],
    ])
    const result = a.subtract(b)
    expect(result.toArray()).toEqual([
      [9, 18],
      [27, 36],
    ])
  })
})

// ─── multiply / scale ───────────────────────────────────
describe('Matrix - multiply', () => {
  it('multiplies two compatible matrices', () => {
    const a = Matrix.from2DArray([
      [1, 2],
      [3, 4],
    ])
    const b = Matrix.from2DArray([
      [2, 0],
      [1, 3],
    ])
    const result = a.multiply(b)
    expect(result.toArray()).toEqual([
      [4, 6],
      [10, 12],
    ])
  })

  it('multiply throws on incompatible dimensions', () => {
    const a = new Matrix(2, 3)
    const b = new Matrix(2, 3)
    expect(() => a.multiply(b)).toThrow(RangeError)
  })
})

describe('Matrix - scale', () => {
  it('scales matrix by scalar', () => {
    const m = Matrix.from2DArray([
      [1, 2],
      [3, 4],
    ])
    const result = m.scale(3)
    expect(result.toArray()).toEqual([
      [3, 6],
      [9, 12],
    ])
  })
})

// ─── transpose ───────────────────────────────────────────
describe('Matrix - transpose', () => {
  it('transposes a matrix', () => {
    const m = Matrix.from2DArray([
      [1, 2, 3],
      [4, 5, 6],
    ])
    const t = m.transpose()
    expect(t.rows).toBe(3)
    expect(t.cols).toBe(2)
    expect(t.toArray()).toEqual([
      [1, 4],
      [2, 5],
      [3, 6],
    ])
  })

  it('transpose of transpose returns original', () => {
    const m = Matrix.from2DArray([
      [1, 2],
      [3, 4],
    ])
    expect(m.transpose().transpose().equals(m)).toBe(true)
  })
})

// ─── determinant ─────────────────────────────────────────
describe('Matrix - determinant', () => {
  it('computes 2×2 determinant', () => {
    const m = Matrix.from2DArray([
      [1, 2],
      [3, 4],
    ])
    expect(m.determinant()).toBe(-2)
  })

  it('computes 3×3 determinant', () => {
    const m = Matrix.from2DArray([
      [6, 1, 1],
      [4, -2, 5],
      [2, 8, 7],
    ])
    expect(m.determinant()).toBe(-306)
  })

  it('returns 1 for identity matrix', () => {
    expect(Matrix.identity(4).determinant()).toBe(1)
  })

  it('throws for non-square matrix', () => {
    const m = new Matrix(2, 3)
    expect(() => m.determinant()).toThrow(RangeError)
  })
})

// ─── trace ───────────────────────────────────────────────
describe('Matrix - trace', () => {
  it('computes trace of square matrix', () => {
    const m = Matrix.from2DArray([
      [1, 2],
      [3, 4],
    ])
    expect(m.trace()).toBe(5)
  })

  it('trace of identity is n', () => {
    expect(Matrix.identity(5).trace()).toBe(5)
  })
})

// ─── isSquare ────────────────────────────────────────────
describe('Matrix - isSquare', () => {
  it('returns true for square matrix', () => {
    expect(new Matrix(3, 3).isSquare()).toBe(true)
  })

  it('returns false for non-square matrix', () => {
    expect(new Matrix(2, 3).isSquare()).toBe(false)
  })
})

// ─── equals ──────────────────────────────────────────────
describe('Matrix - equals', () => {
  it('returns true for equal matrices', () => {
    const a = Matrix.from2DArray([
      [1, 2],
      [3, 4],
    ])
    const b = Matrix.from2DArray([
      [1, 2],
      [3, 4],
    ])
    expect(a.equals(b)).toBe(true)
  })

  it('returns false for different matrices', () => {
    const a = Matrix.from2DArray([
      [1, 2],
      [3, 4],
    ])
    const b = Matrix.from2DArray([
      [1, 2],
      [3, 5],
    ])
    expect(a.equals(b)).toBe(false)
  })

  it('returns false for different dimensions', () => {
    expect(new Matrix(2, 2).equals(new Matrix(2, 3))).toBe(false)
  })
})

// ─── toArray roundtrip ───────────────────────────────────
describe('Matrix - toArray', () => {
  it('toArray → from2DArray roundtrip', () => {
    const original = [
      [1, 2, 3],
      [4, 5, 6],
    ]
    const m = Matrix.from2DArray(original)
    expect(m.toArray()).toEqual(original)
  })
})

// ─── clone independence ─────────────────────────────────
describe('Matrix - clone', () => {
  it('clone produces equal but independent matrix', () => {
    const m = Matrix.from2DArray([
      [1, 2],
      [3, 4],
    ])
    const c = m.clone()
    expect(c.equals(m)).toBe(true)
    c.set(0, 0, 99)
    expect(m.get(0, 0)).toBe(1)
    expect(c.get(0, 0)).toBe(99)
  })
})

// ─── map ─────────────────────────────────────────────────
describe('Matrix - map', () => {
  it('applies function to each element', () => {
    const m = Matrix.from2DArray([
      [1, 2],
      [3, 4],
    ])
    const result = m.map((val) => val * val)
    expect(result.toArray()).toEqual([
      [1, 4],
      [9, 16],
    ])
  })

  it('map receives correct row and col indices', () => {
    const m = new Matrix(2, 3)
    const result = m.map((_val, row, col) => row * 10 + col)
    expect(result.toArray()).toEqual([
      [0, 1, 2],
      [10, 11, 12],
    ])
  })
})

// ─── large matrix (50×50) ────────────────────────────────
describe('Matrix - large matrix', () => {
  it('handles 50×50 matrix operations', () => {
    const a = new Matrix(50, 50)
    const b = new Matrix(50, 50)
    for (let i = 0; i < 50; i++) {
      a.set(i, i, 2)
      b.set(i, i, 3)
    }
    const sum = a.add(b)
    expect(sum.get(5, 5)).toBe(5)
    expect(sum.get(0, 1)).toBe(0)

    const product = a.multiply(b)
    expect(product.get(10, 10)).toBe(6)
    expect(product.get(0, 1)).toBe(0)
  })
})

// ─── dimension mismatch throws ───────────────────────────
describe('Matrix - dimension mismatch', () => {
  it('subtract throws on mismatched dimensions', () => {
    const a = new Matrix(2, 2)
    const b = new Matrix(3, 3)
    expect(() => a.subtract(b)).toThrow(RangeError)
  })
})
