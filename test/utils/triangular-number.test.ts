import { describe, expect, it } from 'vitest'
import { TriangularNumber } from '../../src/utils/triangular-number.js'

describe('TriangularNumber', () => {
  it('computes nth triangular number', () => {
    expect(TriangularNumber.nth(1)).toBe(1)
    expect(TriangularNumber.nth(2)).toBe(3)
    expect(TriangularNumber.nth(3)).toBe(6)
    expect(TriangularNumber.nth(10)).toBe(55)
  })

  it('handles n=0', () => {
    expect(TriangularNumber.nth(0)).toBe(0)
  })

  it('handles negative n', () => {
    expect(TriangularNumber.nth(-1)).toBe(0)
  })

  it('isTriangular detects triangular numbers', () => {
    expect(TriangularNumber.isTriangular(1)).toBe(true)
    expect(TriangularNumber.isTriangular(3)).toBe(true)
    expect(TriangularNumber.isTriangular(6)).toBe(true)
    expect(TriangularNumber.isTriangular(10)).toBe(true)
  })

  it('isTriangular rejects non-triangular', () => {
    expect(TriangularNumber.isTriangular(2)).toBe(false)
    expect(TriangularNumber.isTriangular(4)).toBe(false)
    expect(TriangularNumber.isTriangular(5)).toBe(false)
  })

  it('indexOf returns correct index', () => {
    expect(TriangularNumber.indexOf(6)).toBe(3)
    expect(TriangularNumber.indexOf(10)).toBe(4)
    expect(TriangularNumber.indexOf(55)).toBe(10)
  })

  it('indexOf returns -1 for non-triangular', () => {
    expect(TriangularNumber.indexOf(4)).toBe(-1)
  })

  it('generate returns sequence', () => {
    expect(TriangularNumber.generate(5)).toEqual([1, 3, 6, 10, 15])
  })

  it('generate handles 0', () => {
    expect(TriangularNumber.generate(0)).toEqual([])
  })

  it('pentagonal computes pentagonal numbers', () => {
    expect(TriangularNumber.pentagonal(1)).toBe(1)
    expect(TriangularNumber.pentagonal(2)).toBe(5)
    expect(TriangularNumber.pentagonal(3)).toBe(12)
  })

  it('hexagonal computes hexagonal numbers', () => {
    expect(TriangularNumber.hexagonal(1)).toBe(1)
    expect(TriangularNumber.hexagonal(2)).toBe(6)
    expect(TriangularNumber.hexagonal(3)).toBe(15)
  })

  it('tetrahedral computes tetrahedral numbers', () => {
    expect(TriangularNumber.tetrahedral(1)).toBe(1)
    expect(TriangularNumber.tetrahedral(3)).toBe(10)
  })

  it('sumOfFirst equals tetrahedral', () => {
    expect(TriangularNumber.sumOfFirst(5)).toBe(TriangularNumber.tetrahedral(5))
  })

  it('isTriangular rejects negative', () => {
    expect(TriangularNumber.isTriangular(-1)).toBe(false)
  })

  it('nth handles large n', () => {
    expect(TriangularNumber.nth(1000)).toBe(500500)
  })

  it('nth handles n=0', () => {
    expect(TriangularNumber.nth(0)).toBe(0)
  })

  it('isTriangular identifies triangular numbers', () => {
    expect(TriangularNumber.isTriangular(6)).toBe(true)
    expect(TriangularNumber.isTriangular(10)).toBe(true)
    expect(TriangularNumber.isTriangular(7)).toBe(false)
  })

  it('nth triangular number is correct', () => {
    expect(TriangularNumber.nth(1)).toBe(1)
    expect(TriangularNumber.nth(3)).toBe(6)
    expect(TriangularNumber.nth(4)).toBe(10)
  })

  it('nth(0) returns 0', () => {
    expect(TriangularNumber.nth(0)).toBe(0)
  })

  it('nth(1) returns 1', () => {
    expect(TriangularNumber.nth(1)).toBe(1)
  })

  it('nth(3) returns 6', () => {
    expect(TriangularNumber.nth(3)).toBe(6)
  })

  it('nth(1) returns 1', () => {
    expect(TriangularNumber.nth(1)).toBe(1)
  })

  it('nth(0) returns 0', () => {
    expect(TriangularNumber.nth(0)).toBe(0)
  })
})
