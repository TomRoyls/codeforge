import { describe, expect, it } from 'vitest'
import { SparseTableGCD } from '../../src/utils/sparse-table-gcd.js'

describe('SparseTableGCD', () => {
  it('computes GCD for single range', () => {
    const st = new SparseTableGCD([12, 18, 24])
    expect(st.query(0, 2)).toBe(6)
  })

  it('computes GCD for subrange', () => {
    const st = new SparseTableGCD([12, 18, 24, 9])
    expect(st.query(1, 2)).toBe(6)
    expect(st.query(2, 3)).toBe(3)
  })

  it('handles single element', () => {
    const st = new SparseTableGCD([7])
    expect(st.query(0, 0)).toBe(7)
  })

  it('handles empty array', () => {
    const st = new SparseTableGCD([])
    expect(st.query(0, 0)).toBe(0)
  })

  it('handles coprime elements', () => {
    const st = new SparseTableGCD([7, 13, 19])
    expect(st.query(0, 2)).toBe(1)
  })

  it('handles all same elements', () => {
    const st = new SparseTableGCD([6, 6, 6, 6])
    expect(st.query(0, 3)).toBe(6)
  })

  it('handles two elements', () => {
    const st = new SparseTableGCD([8, 12])
    expect(st.query(0, 1)).toBe(4)
  })

  it('handles large range', () => {
    const arr = [24, 36, 48, 60, 72]
    const st = new SparseTableGCD(arr)
    expect(st.query(0, 4)).toBe(12)
  })

  it('handles invalid range', () => {
    const st = new SparseTableGCD([4, 6])
    expect(st.query(2, 1)).toBe(0)
  })

  it('handles power of two length', () => {
    const st = new SparseTableGCD([8, 4, 12, 16])
    expect(st.query(0, 3)).toBe(4)
  })

  it('handles large array', () => {
    const arr = Array.from({ length: 100 }, (_, i) => (i + 1) * 6)
    const st = new SparseTableGCD(arr)
    expect(st.query(0, 99)).toBe(6)
  })

  it('handles single query element', () => {
    const st = new SparseTableGCD([15, 25, 35])
    expect(st.query(1, 1)).toBe(25)
  })

  it('handles coprime pair', () => {
    const st = new SparseTableGCD([7, 13])
    expect(st.query(0, 1)).toBe(1)
  })

  it('handles all same values', () => {
    const st = new SparseTableGCD([6, 6, 6, 6])
    expect(st.query(0, 3)).toBe(6)
  })

  it('handles two elements', () => {
    const st = new SparseTableGCD([12, 18])
    expect(st.query(0, 1)).toBe(6)
  })

  it('handles single element', () => {
    const st = new SparseTableGCD([7])
    expect(st.query(0, 0)).toBe(7)
  })

  it('handles two elements', () => {
    const st = new SparseTableGCD([12, 8])
    expect(st.query(0, 1)).toBe(4)
    expect(st.query(0, 0)).toBe(12)
  })

  it('single element query returns itself', () => {
    const st = new SparseTableGCD([6])
    expect(st.query(0, 0)).toBe(6)
  })

  it('GCD of coprime numbers is 1', () => {
    const st = new SparseTableGCD([6, 5])
    expect(st.query(0, 1)).toBe(1)
  })

  it('GCD of single element is itself', () => {
    const st = new SparseTableGCD([7])
    expect(st.query(0, 0)).toBe(7)
  })

  it('GCD of 6 and 9 is 3', () => {
    const st = new SparseTableGCD([6, 9])
    expect(st.query(0, 1)).toBe(3)
  })
})
