import { describe, expect, it } from 'vitest'
import { ContinuedFraction } from '../../src/utils/continued-fraction.js'

describe('ContinuedFraction', () => {
  it('represents integer as single coefficient', () => {
    expect(ContinuedFraction.fromNumber(5)).toEqual([5])
  })

  it('represents 3/2 as [1, 2]', () => {
    expect(ContinuedFraction.fromNumber(1.5)).toEqual([1, 2])
  })

  it('represents golden ratio start', () => {
    const cf = ContinuedFraction.fromNumber((1 + Math.sqrt(5)) / 2, 5)
    expect(cf.length).toBeGreaterThan(0)
    expect(cf[0]).toBe(1)
  })

  it('toNumber reconstructs value', () => {
    expect(ContinuedFraction.toNumber([1, 2])).toBeCloseTo(1.5)
    expect(ContinuedFraction.toNumber([3])).toBe(3)
  })

  it('roundtrip preserves value', () => {
    const x = 2.718
    const cf = ContinuedFraction.fromNumber(x)
    expect(ContinuedFraction.toNumber(cf)).toBeCloseTo(x, 3)
  })

  it('convergents compute best rational approximations', () => {
    const cf = ContinuedFraction.fromNumber(Math.PI, 5)
    const convs = ContinuedFraction.convergents(cf)
    expect(convs.length).toBeGreaterThan(0)
    const last = convs[convs.length - 1]!
    expect(last.numerator / last.denominator).toBeCloseTo(Math.PI, 2)
  })

  it('convergents for simple fraction', () => {
    const convs = ContinuedFraction.convergents([1, 2])
    expect(convs).toEqual([
      { numerator: 1, denominator: 1 },
      { numerator: 3, denominator: 2 },
    ])
  })

  it('fromRatio computes GCD-based CF', () => {
    expect(ContinuedFraction.fromRatio(7, 5)).toEqual([1, 2, 2])
  })

  it('fromRatio handles integer', () => {
    expect(ContinuedFraction.fromRatio(6, 3)).toEqual([2])
  })

  it('fromRatio handles zero denominator', () => {
    expect(ContinuedFraction.fromRatio(1, 0)).toEqual([])
  })

  it('approximate finds best rational', () => {
    const result = ContinuedFraction.approximate(Math.PI, 100)
    expect(result.numerator / result.denominator).toBeCloseTo(Math.PI, 1)
  })

  it('toNumber handles empty array', () => {
    expect(ContinuedFraction.toNumber([])).toBe(0)
  })

  it('convergents handles empty array', () => {
    expect(ContinuedFraction.convergents([])).toEqual([])
  })

  it('fromNumber 0', () => {
    expect(ContinuedFraction.fromNumber(0)).toEqual([0])
  })

  it('convergents for pi are well-known', () => {
    const cf = ContinuedFraction.fromNumber(Math.PI, 4)
    const convs = ContinuedFraction.convergents(cf)
    expect(convs[0]).toEqual({ numerator: 3, denominator: 1 })
    expect(convs[1]).toEqual({ numerator: 22, denominator: 7 })
  })

  it('fromRatio 22/7', () => {
    const cf = ContinuedFraction.fromRatio(22, 7)
    expect(ContinuedFraction.toNumber(cf)).toBeCloseTo(22 / 7)
  })

  it('fromNumber 1 returns [1]', () => {
    expect(ContinuedFraction.fromNumber(1)).toEqual([1])
  })
})
