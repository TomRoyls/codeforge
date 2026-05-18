import { describe, it, expect } from 'vitest'
import { SparseTable } from '../../src/core/sparse-table-2/index.js'

// ─── Constructor ───

describe('SparseTable constructor', () => {
  it('should build from a single-element array', () => {
    const st = new SparseTable([42])
    expect(st.getSize()).toBe(1)
  })

  it('should build from a multi-element array', () => {
    const st = new SparseTable([3, 1, 4, 1, 5, 9, 2, 6])
    expect(st.getSize()).toBe(8)
  })

  it('should throw on empty array', () => {
    expect(() => new SparseTable([])).toThrow('Array cannot be empty')
  })

  it('should accept negative numbers', () => {
    const st = new SparseTable([-5, -1, -3, -2])
    expect(st.getSize()).toBe(4)
  })

  it('should accept duplicate values', () => {
    const st = new SparseTable([7, 7, 7, 7])
    expect(st.getSize()).toBe(4)
  })
})

// ─── query / rangeMinQuery ───

describe('SparseTable query / rangeMinQuery', () => {
  const st = new SparseTable([3, 1, 4, 1, 5, 9, 2, 6])

  it('should return the single element for a length-1 range', () => {
    expect(st.query(0, 0)).toBe(3)
    expect(st.query(3, 3)).toBe(1)
    expect(st.query(7, 7)).toBe(6)
  })

  it('should return the minimum over a full range', () => {
    expect(st.query(0, 7)).toBe(1)
  })

  it('should return the minimum over partial ranges', () => {
    expect(st.query(0, 2)).toBe(1)
    expect(st.query(2, 4)).toBe(1)
    expect(st.query(4, 7)).toBe(2)
    expect(st.query(1, 3)).toBe(1)
  })

  it('should handle power-of-two length ranges', () => {
    expect(st.query(0, 3)).toBe(1)
    expect(st.query(4, 7)).toBe(2)
  })

  it('should throw on invalid range (start < 0)', () => {
    expect(() => st.query(-1, 3)).toThrow('Invalid range')
  })

  it('should throw on invalid range (end >= length)', () => {
    expect(() => st.query(0, 8)).toThrow('Invalid range')
  })

  it('should throw on invalid range (start > end)', () => {
    expect(() => st.query(3, 2)).toThrow('Invalid range')
  })
})

// ─── rangeMaxQuery ───

describe('SparseTable rangeMaxQuery', () => {
  const st = new SparseTable([3, 1, 4, 1, 5, 9, 2, 6])

  it('should return the single element for a length-1 range', () => {
    expect(st.rangeMaxQuery(0, 0)).toBe(3)
    expect(st.rangeMaxQuery(5, 5)).toBe(9)
  })

  it('should return the maximum over a full range', () => {
    expect(st.rangeMaxQuery(0, 7)).toBe(9)
  })

  it('should return the maximum over partial ranges', () => {
    expect(st.rangeMaxQuery(0, 2)).toBe(4)
    expect(st.rangeMaxQuery(2, 4)).toBe(5)
    expect(st.rangeMaxQuery(4, 7)).toBe(9)
    expect(st.rangeMaxQuery(0, 3)).toBe(4)
  })

  it('should throw on invalid range', () => {
    expect(() => st.rangeMaxQuery(-1, 3)).toThrow('Invalid range')
    expect(() => st.rangeMaxQuery(0, 8)).toThrow('Invalid range')
    expect(() => st.rangeMaxQuery(5, 2)).toThrow('Invalid range')
  })
})

// ─── Edge cases ───

describe('SparseTable edge cases', () => {
  it('should handle negative numbers in min queries', () => {
    const st = new SparseTable([-5, -1, -3, -2])
    expect(st.query(0, 3)).toBe(-5)
    expect(st.rangeMaxQuery(0, 3)).toBe(-1)
  })

  it('should handle all identical values', () => {
    const st = new SparseTable([7, 7, 7, 7])
    expect(st.query(0, 3)).toBe(7)
    expect(st.rangeMaxQuery(0, 3)).toBe(7)
    expect(st.query(1, 2)).toBe(7)
  })

  it('should handle a single element', () => {
    const st = new SparseTable([42])
    expect(st.query(0, 0)).toBe(42)
    expect(st.rangeMaxQuery(0, 0)).toBe(42)
  })

  it('should handle two elements', () => {
    const st = new SparseTable([10, 20])
    expect(st.query(0, 1)).toBe(10)
    expect(st.rangeMaxQuery(0, 1)).toBe(20)
  })

  it('should handle a large array', () => {
    const arr = Array.from({ length: 100 }, (_, i) => i + 1)
    const st = new SparseTable(arr)
    expect(st.query(0, 99)).toBe(1)
    expect(st.rangeMaxQuery(0, 99)).toBe(100)
    expect(st.query(49, 51)).toBe(50)
    expect(st.rangeMaxQuery(49, 51)).toBe(52)
  })
})

// ─── Accessor methods ───

describe('SparseTable accessor methods', () => {
  const st = new SparseTable([3, 1, 4, 1, 5])

  it('getSize should return array length', () => {
    expect(st.getSize()).toBe(5)
  })

  it('toArray should return the original array', () => {
    expect(st.toArray()).toEqual([3, 1, 4, 1, 5])
  })

  it('getTable should return a 2D array', () => {
    const table = st.getTable()
    expect(Array.isArray(table)).toBe(true)
    expect(table.length).toBeGreaterThan(0)
  })

  it('getTimeComplexity should return the expected string', () => {
    expect(st.getTimeComplexity()).toBe('Preprocess: O(n log n), Query: O(1)')
  })
})
