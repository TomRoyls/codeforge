import { describe, expect, it } from 'vitest'
import { ModuloCombinatorics } from '../../src/utils/modulo-combinatorics.js'

describe('ModuloCombinatorics', () => {
  it('computes factorial', () => {
    const mc = new ModuloCombinatorics(10)
    expect(mc.factorial(0)).toBe(1)
    expect(mc.factorial(5)).toBe(120)
  })

  it('computes nCr', () => {
    const mc = new ModuloCombinatorics(10)
    expect(mc.nCr(5, 2)).toBe(10)
    expect(mc.nCr(5, 0)).toBe(1)
    expect(mc.nCr(5, 5)).toBe(1)
  })

  it('nCr returns 0 for invalid r', () => {
    const mc = new ModuloCombinatorics(10)
    expect(mc.nCr(3, -1)).toBe(0)
    expect(mc.nCr(3, 5)).toBe(0)
  })

  it('computes nPr', () => {
    const mc = new ModuloCombinatorics(10)
    expect(mc.nPr(5, 2)).toBe(20)
    expect(mc.nPr(5, 0)).toBe(1)
  })

  it('computes nHr (stars and bars)', () => {
    const mc = new ModuloCombinatorics(20)
    expect(mc.nHr(3, 2)).toBe(mc.nCr(4, 2))
  })

  it('handles large nCr modulo', () => {
    const mc = new ModuloCombinatorics(100)
    expect(mc.nCr(100, 50)).toBeGreaterThan(0)
    expect(mc.nCr(100, 50)).toBeLessThan(1_000_000_007)
  })

  it('nCr symmetry', () => {
    const mc = new ModuloCombinatorics(20)
    expect(mc.nCr(10, 3)).toBe(mc.nCr(10, 7))
  })

  it('computes factorial of 10', () => {
    const mc = new ModuloCombinatorics(10)
    expect(mc.factorial(10)).toBe(3628800)
  })

  it('nPr of 4P3 is 24', () => {
    const mc = new ModuloCombinatorics(10)
    expect(mc.nPr(4, 3)).toBe(24)
  })

  it('handles custom modulus', () => {
    const mc = new ModuloCombinatorics(10, 997)
    expect(mc.nCr(5, 2)).toBe(10 % 997)
  })

  it('nCr(0,0) is 1', () => {
    const mc = new ModuloCombinatorics(5)
    expect(mc.nCr(0, 0)).toBe(1)
  })

  it('nPr(0,0) is 1', () => {
    const mc = new ModuloCombinatorics(5)
    expect(mc.nPr(0, 0)).toBe(1)
  })

  it('nCr k>n returns 0', () => {
    const mc = new ModuloCombinatorics(5)
    expect(mc.nCr(2, 5)).toBe(0)
  })

  it('nPr k>n returns 0', () => {
    const mc = new ModuloCombinatorics(5)
    expect(mc.nPr(2, 5)).toBe(0)
  })

  it('nCr(5,0) is 1', () => {
    const mc = new ModuloCombinatorics(5)
    expect(mc.nCr(5, 0)).toBe(1)
  })

  it('nCr(5,2) is 10', () => {
    const mc = new ModuloCombinatorics(1000003)
    expect(mc.nCr(5, 2)).toBe(10)
  })

  it('nCr(10,0) is 1', () => {
    const mc = new ModuloCombinatorics(1000003)
    expect(mc.nCr(10, 0)).toBe(1)
  })

  it('nCr(5,5) is 1', () => {
    const mc = new ModuloCombinatorics(1000003)
    expect(mc.nCr(5, 5)).toBe(1)
  })

  it('nCr(5,0) is 1', () => {
    const mc = new ModuloCombinatorics(1000003)
    expect(mc.nCr(5, 0)).toBe(1)
  })

  it('nCr(5,5) is 1', () => {
    const mc = new ModuloCombinatorics(1000003)
    expect(mc.nCr(5, 5)).toBe(1)
  })

  it('nCr(5,0) is 1', () => {
    const mc = new ModuloCombinatorics(1000003)
    expect(mc.nCr(5, 0)).toBe(1)
  })
})
