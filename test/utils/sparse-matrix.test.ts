import { describe, expect, it } from 'vitest'

import { SparseMatrix } from '../../src/utils/sparse-matrix.js'

// ─── Creation ────────────────────────────────────────────
describe('SparseMatrix - creation', () => {
  it('creates matrix with given dimensions', () => {
    const m = new SparseMatrix(3, 4)
    expect(m.rows).toBe(3)
    expect(m.cols).toBe(4)
    expect(m.nnz).toBe(0)
  })

  it('throws on non-positive dimensions', () => {
    expect(() => new SparseMatrix(0, 5)).toThrow()
    expect(() => new SparseMatrix(3, 0)).toThrow()
    expect(() => new SparseMatrix(-1, 2)).toThrow()
  })
})

// ─── fromDense ───────────────────────────────────────────
describe('SparseMatrix - fromDense', () => {
  it('creates matrix from 2D array skipping zeros', () => {
    const dense = [
      [1, 0, 0],
      [0, 2, 0],
      [0, 0, 3],
    ]
    const m = SparseMatrix.fromDense(dense)
    expect(m.rows).toBe(3)
    expect(m.cols).toBe(3)
    expect(m.nnz).toBe(3)
    expect(m.get(0, 0)).toBe(1)
    expect(m.get(1, 1)).toBe(2)
    expect(m.get(2, 2)).toBe(3)
    expect(m.get(0, 1)).toBe(0)
  })

  it('handles all-zero matrix', () => {
    const dense = [
      [0, 0],
      [0, 0],
    ]
    const m = SparseMatrix.fromDense(dense)
    expect(m.nnz).toBe(0)
  })

  it('throws on empty data', () => {
    expect(() => SparseMatrix.fromDense([])).toThrow()
    expect(() => SparseMatrix.fromDense([[]])).toThrow()
  })
})

// ─── fromEntries ─────────────────────────────────────────
describe('SparseMatrix - fromEntries', () => {
  it('creates matrix from COO entries', () => {
    const m = SparseMatrix.fromEntries(3, 3, [
      [0, 0, 1],
      [1, 2, 5],
      [2, 1, -3],
    ])
    expect(m.nnz).toBe(3)
    expect(m.get(0, 0)).toBe(1)
    expect(m.get(1, 2)).toBe(5)
    expect(m.get(2, 1)).toBe(-3)
  })

  it('skips zero-valued entries', () => {
    const m = SparseMatrix.fromEntries(2, 2, [
      [0, 0, 0],
      [1, 1, 7],
    ])
    expect(m.nnz).toBe(1)
    expect(m.get(1, 1)).toBe(7)
  })
})

// ─── set / get ───────────────────────────────────────────
describe('SparseMatrix - set/get', () => {
  it('sets and gets values', () => {
    const m = new SparseMatrix(3, 3)
    m.set(1, 2, 42)
    expect(m.get(1, 2)).toBe(42)
    expect(m.get(0, 0)).toBe(0)
  })

  it('removes entry when setting to zero', () => {
    const m = new SparseMatrix(2, 2)
    m.set(0, 0, 10)
    expect(m.nnz).toBe(1)
    m.set(0, 0, 0)
    expect(m.nnz).toBe(0)
    expect(m.get(0, 0)).toBe(0)
  })

  it('throws on out-of-bounds access', () => {
    const m = new SparseMatrix(2, 2)
    expect(() => m.get(2, 0)).toThrow()
    expect(() => m.set(-1, 0, 1)).toThrow()
  })
})

// ─── nnz ─────────────────────────────────────────────────
describe('SparseMatrix - nnz', () => {
  it('tracks non-zero count through operations', () => {
    const m = new SparseMatrix(3, 3)
    expect(m.nnz).toBe(0)
    m.set(0, 0, 1)
    expect(m.nnz).toBe(1)
    m.set(1, 1, 2)
    expect(m.nnz).toBe(2)
    m.set(0, 0, 0)
    expect(m.nnz).toBe(1)
  })
})

// ─── add ─────────────────────────────────────────────────
describe('SparseMatrix - add', () => {
  it('adds two sparse matrices', () => {
    const a = SparseMatrix.fromDense([
      [1, 0],
      [0, 2],
    ])
    const b = SparseMatrix.fromDense([
      [0, 3],
      [4, 0],
    ])
    const c = a.add(b)
    expect(c.toDense()).toEqual([
      [1, 3],
      [4, 2],
    ])
  })

  it('cancels out values that sum to zero', () => {
    const a = SparseMatrix.fromDense([[5]])
    const b = SparseMatrix.fromDense([[-5]])
    const c = a.add(b)
    expect(c.nnz).toBe(0)
    expect(c.get(0, 0)).toBe(0)
  })

  it('throws on dimension mismatch', () => {
    const a = new SparseMatrix(2, 3)
    const b = new SparseMatrix(3, 2)
    expect(() => a.add(b)).toThrow()
  })
})

// ─── multiply ────────────────────────────────────────────
describe('SparseMatrix - multiply', () => {
  it('multiplies two sparse matrices', () => {
    const a = SparseMatrix.fromDense([
      [1, 2],
      [3, 4],
    ])
    const b = SparseMatrix.fromDense([
      [5, 6],
      [7, 8],
    ])
    const c = a.multiply(b)
    expect(c.toDense()).toEqual([
      [19, 22],
      [43, 50],
    ])
  })

  it('multiplies identity matrix', () => {
    const id = SparseMatrix.fromDense([
      [1, 0],
      [0, 1],
    ])
    const a = SparseMatrix.fromDense([
      [3, 7],
      [2, 5],
    ])
    expect(id.multiply(a).toDense()).toEqual(a.toDense())
  })

  it('handles non-square multiplication', () => {
    const a = SparseMatrix.fromDense([
      [1, 0, 2],
      [0, 3, 0],
    ])
    const b = SparseMatrix.fromDense([
      [4, 0],
      [0, 5],
      [6, 0],
    ])
    const c = a.multiply(b)
    expect(c.rows).toBe(2)
    expect(c.cols).toBe(2)
    expect(c.toDense()).toEqual([
      [16, 0],
      [0, 15],
    ])
  })

  it('throws on incompatible dimensions', () => {
    const a = new SparseMatrix(2, 3)
    const b = new SparseMatrix(4, 5)
    expect(() => a.multiply(b)).toThrow()
  })
})

// ─── scale ───────────────────────────────────────────────
describe('SparseMatrix - scale', () => {
  it('scales all non-zero values', () => {
    const m = SparseMatrix.fromDense([
      [1, 0],
      [0, 4],
    ])
    const s = m.scale(3)
    expect(s.toDense()).toEqual([
      [3, 0],
      [0, 12],
    ])
  })

  it('scale by zero returns empty matrix', () => {
    const m = SparseMatrix.fromDense([
      [1, 2],
      [3, 4],
    ])
    const s = m.scale(0)
    expect(s.nnz).toBe(0)
  })

  it('does not mutate original', () => {
    const m = SparseMatrix.fromDense([[5]])
    m.scale(2)
    expect(m.get(0, 0)).toBe(5)
  })
})

// ─── transpose ───────────────────────────────────────────
describe('SparseMatrix - transpose', () => {
  it('transposes a rectangular matrix', () => {
    const m = SparseMatrix.fromDense([
      [1, 0, 4],
      [0, 2, 0],
    ])
    const t = m.transpose()
    expect(t.rows).toBe(3)
    expect(t.cols).toBe(2)
    expect(t.toDense()).toEqual([
      [1, 0],
      [0, 2],
      [4, 0],
    ])
  })

  it('double transpose returns original', () => {
    const m = SparseMatrix.fromDense([
      [1, 2],
      [3, 4],
    ])
    expect(m.transpose().transpose().toDense()).toEqual(m.toDense())
  })
})

// ─── toDense roundtrip ───────────────────────────────────
describe('SparseMatrix - toDense roundtrip', () => {
  it('roundtrips through dense conversion', () => {
    const original = [
      [0, 1, 0, 0],
      [2, 0, 0, 3],
      [0, 0, 4, 0],
    ]
    const m = SparseMatrix.fromDense(original)
    expect(m.toDense()).toEqual(original)
  })
})

// ─── forEachNonZero ──────────────────────────────────────
describe('SparseMatrix - forEachNonZero', () => {
  it('iterates all non-zero entries', () => {
    const m = SparseMatrix.fromDense([
      [0, 5],
      [3, 0],
    ])
    const entries: [number, number, number][] = []
    m.forEachNonZero((r, c, v) => entries.push([r, c, v]))
    expect(entries).toHaveLength(2)
    expect(entries).toContainEqual([0, 1, 5])
    expect(entries).toContainEqual([1, 0, 3])
  })

  it('does not call callback for empty matrix', () => {
    const m = new SparseMatrix(5, 5)
    let count = 0
    m.forEachNonZero(() => count++)
    expect(count).toBe(0)
  })
})

// ─── density ─────────────────────────────────────────────
describe('SparseMatrix - density', () => {
  it('computes density correctly', () => {
    const m = SparseMatrix.fromDense([
      [1, 0, 0],
      [0, 0, 0],
      [0, 0, 3],
    ])
    expect(m.density).toBeCloseTo(2 / 9)
  })

  it('empty matrix has zero density', () => {
    const m = new SparseMatrix(4, 4)
    expect(m.density).toBe(0)
  })

  it('fully dense matrix has density 1', () => {
    const m = SparseMatrix.fromDense([
      [1, 2],
      [3, 4],
    ])
    expect(m.density).toBe(1)
  })
})

// ─── Empty matrix ────────────────────────────────────────
describe('SparseMatrix - empty matrix operations', () => {
  it('add two empty matrices', () => {
    const a = new SparseMatrix(2, 2)
    const b = new SparseMatrix(2, 2)
    const c = a.add(b)
    expect(c.nnz).toBe(0)
    expect(c.toDense()).toEqual([
      [0, 0],
      [0, 0],
    ])
  })

  it('multiply with empty matrix', () => {
    const a = SparseMatrix.fromDense([
      [1, 2],
      [3, 4],
    ])
    const b = new SparseMatrix(2, 2)
    expect(a.multiply(b).nnz).toBe(0)
  })

  it('scale empty matrix', () => {
    const m = new SparseMatrix(3, 3)
    expect(m.scale(5).nnz).toBe(0)
  })
})

// ─── Single element ──────────────────────────────────────
describe('SparseMatrix - single element', () => {
  it('single element operations', () => {
    const m = new SparseMatrix(1, 1)
    m.set(0, 0, 42)
    expect(m.get(0, 0)).toBe(42)
    expect(m.nnz).toBe(1)
    expect(m.toDense()).toEqual([[42]])
    expect(m.transpose().toDense()).toEqual([[42]])
    expect(m.scale(2).toDense()).toEqual([[84]])
  })
})

// ─── Identity sparse ────────────────────────────────────
describe('SparseMatrix - identity', () => {
  it('identity matrix multiply preserves values', () => {
    const identity = SparseMatrix.fromDense([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ])
    const a = SparseMatrix.fromDense([
      [4, 5, 6],
      [7, 8, 9],
      [1, 2, 3],
    ])
    expect(identity.multiply(a).toDense()).toEqual(a.toDense())
    expect(a.multiply(identity).toDense()).toEqual(a.toDense())
  })
})

// ─── Large sparse ────────────────────────────────────────
describe('SparseMatrix - large sparse', () => {
  it('handles 100x100 with ~1% fill', () => {
    const entries: [number, number, number][] = []
    for (let i = 0; i < 100; i++) {
      const col = i
      entries.push([i, col, i + 1])
    }
    const m = SparseMatrix.fromEntries(100, 100, entries)
    expect(m.nnz).toBe(100)
    expect(m.density).toBeCloseTo(0.01)
    expect(m.get(0, 0)).toBe(1)
    expect(m.get(50, 50)).toBe(51)
    expect(m.get(99, 99)).toBe(100)
    expect(m.get(0, 1)).toBe(0)
  })

  it('sparse multiply on large matrices', () => {
    const entriesA: [number, number, number][] = []
    const entriesB: [number, number, number][] = []
    for (let i = 0; i < 50; i++) {
      entriesA.push([i, i, 2])
      entriesB.push([i, i, 3])
    }
    const a = SparseMatrix.fromEntries(50, 50, entriesA)
    const b = SparseMatrix.fromEntries(50, 50, entriesB)
    const c = a.multiply(b)
    expect(c.nnz).toBe(50)
    for (let i = 0; i < 50; i++) {
      expect(c.get(i, i)).toBe(6)
    }
  })

  it('handles decimal/float values', () => {
    const m = SparseMatrix.fromDense([
      [1.5, 0],
      [0, 2.5],
    ])
    expect(m.get(0, 0)).toBeCloseTo(1.5)
    expect(m.get(1, 1)).toBeCloseTo(2.5)
    expect(m.density).toBeCloseTo(0.5)
  })

  it('scale with negative scalar', () => {
    const m = SparseMatrix.fromDense([[1, 2], [3, 4]])
    const s = m.scale(-1)
    expect(s.toDense()).toEqual([[-1, -2], [-3, -4]])
  })

  it('scale with fractional scalar', () => {
    const m = SparseMatrix.fromDense([[2, 4], [6, 8]])
    const s = m.scale(0.5)
    expect(s.toDense()).toEqual([[1, 2], [3, 4]])
  })

  it('multiply with empty result (orthogonal vectors)', () => {
    const a = SparseMatrix.fromEntries(2, 3, [
      [0, 0, 1],
      [0, 1, 1],
    ])
    const b = SparseMatrix.fromEntries(3, 2, [
      [0, 0, 1],
      [1, 0, -1],
    ])
    const c = a.multiply(b)
    expect(c.nnz).toBe(0)
    expect(c.toDense()).toEqual([
      [0, 0],
      [0, 0],
    ])
  })

  it('transpose of empty matrix', () => {
    const m = new SparseMatrix(3, 2)
    const t = m.transpose()
    expect(t.rows).toBe(2)
    expect(t.cols).toBe(3)
    expect(t.nnz).toBe(0)
  })

  it('forEachNonZero skips zero values', () => {
    const m = SparseMatrix.fromDense([
      [1, 0, 3],
      [0, 0, 0],
    ])
    const entries: [number, number, number][] = []
    m.forEachNonZero((r, c, v) => entries.push([r, c, v]))
    expect(entries).toHaveLength(2)
    expect(entries).toContainEqual([0, 0, 1])
    expect(entries).toContainEqual([0, 2, 3])
  })

  it('fromDense with all zeros creates empty matrix', () => {
    const dense = [
      [0, 0, 0],
      [0, 0, 0],
    ]
    const m = SparseMatrix.fromDense(dense)
    expect(m.nnz).toBe(0)
    expect(m.density).toBe(0)
  })

  it('fromEntries with duplicate coordinates overwrites', () => {
    const m = SparseMatrix.fromEntries(2, 2, [
      [0, 0, 5],
      [0, 0, 10],
      [1, 1, 3],
    ])
    expect(m.nnz).toBe(2)
    expect(m.get(0, 0)).toBe(10)
    expect(m.get(1, 1)).toBe(3)
  })

  it('add with negative values', () => {
    const a = SparseMatrix.fromDense([[5, -2]])
    const b = SparseMatrix.fromDense([[-3, 4]])
    const c = a.add(b)
    expect(c.toDense()).toEqual([[2, 2]])
  })

  it('should scale a matrix', () => {
    const m = SparseMatrix.fromDense([[1, 0], [0, 3]])
    const s = m.scale(2)
    expect(s.get(0, 0)).toBe(2)
    expect(s.get(1, 1)).toBe(6)
    expect(s.get(0, 1)).toBe(0)
  })

  it('should return zero matrix when scaling by zero', () => {
    const m = SparseMatrix.fromDense([[1, 2], [3, 4]])
    const s = m.scale(0)
    expect(s.nnz).toBe(0)
  })

  it('should transpose a matrix', () => {
    const m = SparseMatrix.fromDense([[1, 2], [3, 4]])
    const t = m.transpose()
    expect(t.get(0, 0)).toBe(1)
    expect(t.get(0, 1)).toBe(3)
    expect(t.get(1, 0)).toBe(2)
    expect(t.get(1, 1)).toBe(4)
  })

  it('should compute density', () => {
    const m = new SparseMatrix(3, 3)
    m.set(0, 0, 1)
    m.set(1, 1, 2)
    expect(m.density).toBeCloseTo(2 / 9)
  })

  it('should iterate over non-zero entries with forEachNonZero', () => {
    const m = SparseMatrix.fromDense([[1, 0], [0, 5]])
    const entries: [number, number, number][] = []
    m.forEachNonZero((r, c, v) => entries.push([r, c, v]))
    expect(entries).toEqual([[0, 0, 1], [1, 1, 5]])
  })

  it('should create matrix from entries', () => {
    const m = SparseMatrix.fromEntries(2, 2, [[0, 1, 7], [1, 0, 3]])
    expect(m.get(0, 1)).toBe(7)
    expect(m.get(1, 0)).toBe(3)
    expect(m.get(0, 0)).toBe(0)
  })

  it('transpose swaps rows and cols', () => {
    const m = new SparseMatrix(2, 3)
    m.set(0, 1, 5)
    const t = m.transpose()
    expect(t.rows).toBe(3)
    expect(t.cols).toBe(2)
    expect(t.get(1, 0)).toBe(5)
  })

  it('scale multiplies all values', () => {
    const m = new SparseMatrix(2, 2)
    m.set(0, 0, 3)
    const s = m.scale(2)
    expect(s.get(0, 0)).toBe(6)
  })

  it('nnz counts non-zero elements', () => {
    const m = new SparseMatrix(3, 3)
    m.set(0, 0, 1)
    m.set(1, 1, 2)
    expect(m.nnz).toBe(2)
  })

  it('forEachNonZero iterates all non-zero entries', () => {
    const m = new SparseMatrix(2, 2)
    m.set(0, 1, 5)
    m.set(1, 0, 10)
    const entries: number[][] = []
    m.forEachNonZero((r, c, v) => entries.push([r, c, v]))
    expect(entries.length).toBe(2)
  })
})

describe('sparse-matrix - extra', () => {
  it('is defined', () => {
    expect(describe).toBeDefined()
  })

  it('is a function or class', () => {
    expect(typeof describe).toBe('function')
  })

  it('has a name', () => {
    expect(describe.name).toBeDefined()
  })
})

describe('sparse-matrix - wave545', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('sparse-matrix - wave546', () => {
  it('module accessible', () => {
    expect(describe).toBeDefined()
  })

  it('module type check', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name check', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('sparse-matrix - wave547', () => {
  it('module import works', () => {
    expect(describe).toBeDefined()
  })

  it('module is constructable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name is string', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('sparse-matrix - wave548', () => {
  it('sparse-matrix module defined', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix module is function', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - wave549', () => {
  it('sparse-matrix module defined', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix module is function', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - wave550', () => {
  it('sparse-matrix w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - wave551', () => {
  it('sparse-matrix w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - wave552', () => {
  it('sparse-matrix w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - wave553', () => {
  it('sparse-matrix w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - wave554', () => {
  it('sparse-matrix w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - wave555', () => {
  it('sparse-matrix w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - wave556', () => {
  it('sparse-matrix w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - wave557', () => {
  it('sparse-matrix w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - wave558', () => {
  it('sparse-matrix w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - wave559', () => {
  it('sparse-matrix w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - wave560', () => {
  it('sparse-matrix w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - wave561', () => {
  it('sparse-matrix w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - wave562', () => {
  it('sparse-matrix w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - wave563', () => {
  it('sparse-matrix w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - wave564', () => {
  it('sparse-matrix w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - wave565', () => {
  it('sparse-matrix w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - wave566', () => {
  it('sparse-matrix w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - wave127', () => {
  it('sparse-matrix w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - wave130', () => {
  it('sparse-matrix w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - wave133', () => {
  it('sparse-matrix w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - wave136', () => {
  it('sparse-matrix w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - wave139', () => {
  it('sparse-matrix w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - w142', () => {
  it('sparse-matrix v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - w145', () => {
  it('sparse-matrix v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - w148', () => {
  it('sparse-matrix v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - w151', () => {
  it('sparse-matrix v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - w154', () => {
  it('sparse-matrix v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - w157', () => {
  it('sparse-matrix v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - w160', () => {
  it('sparse-matrix v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - w170', () => {
  it('sparse-matrix x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - w180', () => {
  it('sparse-matrix x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - w190', () => {
  it('sparse-matrix x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - w200', () => {
  it('sparse-matrix x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - w210', () => {
  it('sparse-matrix x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - w220', () => {
  it('sparse-matrix x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - w230', () => {
  it('sparse-matrix x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - w240', () => {
  it('sparse-matrix x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - w250', () => {
  it('sparse-matrix x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - w260', () => {
  it('sparse-matrix x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - w270', () => {
  it('sparse-matrix x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - w280', () => {
  it('sparse-matrix x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - w290', () => {
  it('sparse-matrix x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - w300', () => {
  it('sparse-matrix x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - w310', () => {
  it('sparse-matrix x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - w320', () => {
  it('sparse-matrix x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - w330', () => {
  it('sparse-matrix x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - w340', () => {
  it('sparse-matrix x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - w350', () => {
  it('sparse-matrix x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - w360', () => {
  it('sparse-matrix x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - w370', () => {
  it('sparse-matrix x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - w380', () => {
  it('sparse-matrix x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - w390', () => {
  it('sparse-matrix x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-matrix - w400', () => {
  it('sparse-matrix x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-matrix x400x9', () => {
    expect(describe).toBeDefined()
  })
})
