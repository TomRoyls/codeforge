import { describe, expect, it } from 'vitest'
import { DisjointSparseTable } from '../../src/utils/disjoint-sparse-table.js'

describe('DisjointSparseTable', () => {
  it('queries sum over range', () => {
    const dst = new DisjointSparseTable([1, 2, 3, 4, 5], (a, b) => a + b)
    expect(dst.query(0, 4)).toBe(15)
    expect(dst.query(1, 3)).toBe(9)
    expect(dst.query(2, 2)).toBe(3)
  })

  it('queries min over range', () => {
    const dst = new DisjointSparseTable([5, 3, 7, 1, 4, 2], (a, b) => Math.min(a, b))
    expect(dst.query(0, 5)).toBe(1)
    expect(dst.query(1, 3)).toBe(1)
    expect(dst.query(0, 1)).toBe(3)
  })

  it('queries max over range', () => {
    const dst = new DisjointSparseTable([5, 3, 7, 1, 4, 2], (a, b) => Math.max(a, b))
    expect(dst.query(0, 5)).toBe(7)
    expect(dst.query(2, 4)).toBe(7)
  })

  it('handles single element', () => {
    const dst = new DisjointSparseTable([42], (a, b) => a + b)
    expect(dst.query(0, 0)).toBe(42)
  })

  it('handles two elements', () => {
    const dst = new DisjointSparseTable([3, 7], (a, b) => a + b)
    expect(dst.query(0, 0)).toBe(3)
    expect(dst.query(1, 1)).toBe(7)
    expect(dst.query(0, 1)).toBe(10)
  })

  it('handles power-of-two length', () => {
    const dst = new DisjointSparseTable([1, 2, 3, 4], (a, b) => a + b)
    expect(dst.query(0, 3)).toBe(10)
    expect(dst.query(1, 2)).toBe(5)
  })

  it('queries GCD over range', () => {
    const dst = new DisjointSparseTable([12, 18, 24, 9], (a, b) => {
      let x = a
      let y = b
      while (y !== 0) { const t = y; y = x % y; x = t }
      return x
    })
    expect(dst.query(0, 3)).toBe(3)
    expect(dst.query(0, 1)).toBe(6)
  })

  it('handles adjacent elements', () => {
    const dst = new DisjointSparseTable([10, 20, 30], (a, b) => a + b)
    expect(dst.query(0, 1)).toBe(30)
    expect(dst.query(1, 2)).toBe(50)
  })

  it('queries full range product', () => {
    const dst = new DisjointSparseTable([1, 2, 3, 4], (a, b) => a * b)
    expect(dst.query(0, 3)).toBe(24)
  })

  it('handles large array min query', () => {
    const data = Array.from({ length: 100 }, (_, i) => 100 - i)
    const dst = new DisjointSparseTable(data, (a, b) => Math.min(a, b))
    expect(dst.query(0, 99)).toBe(1)
    expect(dst.query(50, 99)).toBe(1)
  })

  it('handles bitwise AND queries', () => {
    const dst = new DisjointSparseTable([15, 12, 10, 9], (a, b) => a & b)
    expect(dst.query(0, 3)).toBe(8)
    expect(dst.query(0, 1)).toBe(12)
  })

  it('handles single element gcd', () => {
    const dst = new DisjointSparseTable([12], (a, b) => {
      while (b !== 0) { const t = b; b = a % b; a = t }
      return a
    })
    expect(dst.query(0, 0)).toBe(12)
  })

  it('handles range with XOR', () => {
    const dst = new DisjointSparseTable([1, 2, 3, 4, 5], (a, b) => a ^ b)
    expect(dst.query(0, 4)).toBe(1 ^ 2 ^ 3 ^ 4 ^ 5)
    expect(dst.query(1, 3)).toBe(2 ^ 3 ^ 4)
  })

  it('handles two element max', () => {
    const dst = new DisjointSparseTable([3, 7], (a, b) => Math.max(a, b))
    expect(dst.query(0, 0)).toBe(3)
    expect(dst.query(1, 1)).toBe(7)
    expect(dst.query(0, 1)).toBe(7)
  })

  it('handles three element sum', () => {
    const dst = new DisjointSparseTable([10, 20, 30], (a, b) => a + b)
    expect(dst.query(0, 2)).toBe(60)
    expect(dst.query(0, 0)).toBe(10)
  })

  it('handles single element', () => {
    const dst = new DisjointSparseTable([42], (a, b) => a + b)
    expect(dst.query(0, 0)).toBe(42)
  })

  it('handles four element min', () => {
    const dst = new DisjointSparseTable([5, 3, 7, 1], (a, b) => Math.min(a, b))
    expect(dst.query(0, 3)).toBe(1)
    expect(dst.query(1, 2)).toBe(3)
  })

  it('handles single element', () => {
    const dst = new DisjointSparseTable([42], (a, b) => Math.min(a, b))
    expect(dst.query(0, 0)).toBe(42)
  })

  it('query full range sum', () => {
    const dst = new DisjointSparseTable([1, 2, 3], (a, b) => a + b)
    expect(dst.query(0, 2)).toBe(6)
  })

  it('query single element', () => {
    const dst = new DisjointSparseTable([5, 10, 15], (a, b) => a + b)
    expect(dst.query(1, 1)).toBe(10)
  })

  it('query full range returns sum', () => {
    const dst = new DisjointSparseTable([5, 10, 15], (a, b) => a + b)
    expect(dst.query(0, 2)).toBe(30)
  })

  it('query single element', () => {
    const dst = new DisjointSparseTable([5, 10, 15], (a, b) => a + b)
    expect(dst.query(1, 1)).toBe(10)
  })

  it('query full range returns sum', () => {
    const dst = new DisjointSparseTable([5, 10, 15], (a, b) => a + b)
    expect(dst.query(0, 2)).toBe(30)
  })
})
