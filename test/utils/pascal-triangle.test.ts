import { describe, expect, it } from 'vitest'
import { PascalTriangle } from '../../src/utils/pascal-triangle.js'

describe('PascalTriangle', () => {
  it('generates row 0', () => {
    expect(PascalTriangle.row(0)).toEqual([1])
  })

  it('generates row 1', () => {
    expect(PascalTriangle.row(1)).toEqual([1, 1])
  })

  it('generates row 4', () => {
    expect(PascalTriangle.row(4)).toEqual([1, 4, 6, 4, 1])
  })

  it('generates row 5', () => {
    expect(PascalTriangle.row(5)).toEqual([1, 5, 10, 10, 5, 1])
  })

  it('handles negative row', () => {
    expect(PascalTriangle.row(-1)).toEqual([])
  })

  it('generates multiple rows', () => {
    const rows = PascalTriangle.generate(5)
    expect(rows.length).toBe(5)
    expect(rows[0]).toEqual([1])
    expect(rows[4]).toEqual([1, 4, 6, 4, 1])
  })

  it('generates 0 rows', () => {
    expect(PascalTriangle.generate(0)).toEqual([])
  })

  it('binomial computes C(n,k)', () => {
    expect(PascalTriangle.binomial(5, 2)).toBe(10)
    expect(PascalTriangle.binomial(4, 0)).toBe(1)
    expect(PascalTriangle.binomial(4, 4)).toBe(1)
  })

  it('binomial handles invalid k', () => {
    expect(PascalTriangle.binomial(5, -1)).toBe(0)
    expect(PascalTriangle.binomial(5, 6)).toBe(0)
  })

  it('sumOfRow equals 2^n', () => {
    expect(PascalTriangle.sumOfRow(0)).toBe(1)
    expect(PascalTriangle.sumOfRow(4)).toBe(16)
    expect(PascalTriangle.sumOfRow(10)).toBe(1024)
  })

  it('element returns same as binomial', () => {
    expect(PascalTriangle.element(6, 3)).toBe(PascalTriangle.binomial(6, 3))
  })

  it('row values are symmetric', () => {
    const row = PascalTriangle.row(7)
    for (let i = 0; i < row.length; i++) {
      expect(row[i]).toBe(row[row.length - 1 - i])
    }
  })

  it('diagonalSum for Fibonacci', () => {
    expect(PascalTriangle.diagonalSum(5)).toBe(8)
    expect(PascalTriangle.diagonalSum(4)).toBe(5)
    expect(PascalTriangle.diagonalSum(6)).toBe(13)
  })

  it('row sums verified', () => {
    for (let i = 0; i <= 8; i++) {
      expect(PascalTriangle.row(i).reduce((a, b) => a + b, 0)).toBe(1 << i)
    }
  })

  it('generates large row correctly', () => {
    const row10 = PascalTriangle.row(10)
    expect(row10).toEqual([1, 10, 45, 120, 210, 252, 210, 120, 45, 10, 1])
  })

  it('row 0 is [1]', () => {
    expect(PascalTriangle.row(0)).toEqual([1])
  })

  it('row 4 sum is 16', () => {
    const row = PascalTriangle.row(4)
    expect(row.reduce((a, b) => a + b, 0)).toBe(16)
  })

  it('row 0 is [1]', () => {
    expect(PascalTriangle.row(0)).toEqual([1])
  })
})
