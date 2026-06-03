import { describe, it, expect } from 'vitest'
import { Fraction } from '../../src/utils/fraction.js'

describe('Fraction', () => {
  it('creates with numerator and denominator', () => {
    const f = new Fraction(3, 4)
    expect(f.num).toBe(3)
    expect(f.den).toBe(4)
  })

  it('defaults denominator to 1', () => {
    const f = new Fraction(5)
    expect(f.num).toBe(5)
    expect(f.den).toBe(1)
  })

  it('throws for zero denominator', () => {
    expect(() => new Fraction(1, 0)).toThrow()
  })

  it('simplifies fractions', () => {
    const f = new Fraction(6, 8).simplify()
    expect(f.num).toBe(3)
    expect(f.den).toBe(4)
  })

  it('normalizes negative denominator', () => {
    const f = new Fraction(3, -4)
    expect(f.num).toBe(-3)
    expect(f.den).toBe(4)
  })

  it('adds fractions', () => {
    const result = new Fraction(1, 2).add(new Fraction(1, 3))
    expect(result.num).toBe(5)
    expect(result.den).toBe(6)
  })

  it('subtracts fractions', () => {
    const result = new Fraction(1, 2).sub(new Fraction(1, 3))
    expect(result.num).toBe(1)
    expect(result.den).toBe(6)
  })

  it('multiplies fractions', () => {
    const result = new Fraction(2, 3).mul(new Fraction(3, 4))
    expect(result.num).toBe(1)
    expect(result.den).toBe(2)
  })

  it('divides fractions', () => {
    const result = new Fraction(1, 2).div(new Fraction(1, 4))
    expect(result.num).toBe(2)
    expect(result.den).toBe(1)
  })

  it('throws on division by zero fraction', () => {
    expect(() => new Fraction(1, 2).div(new Fraction(0, 1))).toThrow()
  })

  it('equals checks equality', () => {
    expect(new Fraction(1, 2).equals(new Fraction(2, 4))).toBe(true)
    expect(new Fraction(1, 2).equals(new Fraction(1, 3))).toBe(false)
  })

  it('lessThan compares', () => {
    expect(new Fraction(1, 3).lessThan(new Fraction(1, 2))).toBe(true)
    expect(new Fraction(1, 2).lessThan(new Fraction(1, 3))).toBe(false)
  })

  it('greaterThan compares', () => {
    expect(new Fraction(1, 2).greaterThan(new Fraction(1, 3))).toBe(true)
  })

  it('toNumber converts to float', () => {
    expect(new Fraction(1, 2).toNumber()).toBe(0.5)
    expect(new Fraction(3, 4).toNumber()).toBeCloseTo(0.75)
  })

  it('toString formats nicely', () => {
    expect(new Fraction(3, 4).toString()).toBe('3/4')
    expect(new Fraction(5, 1).toString()).toBe('5')
  })

  it('abs returns absolute value', () => {
    const f = new Fraction(-3, 4).abs()
    expect(f.num).toBe(3)
    expect(f.den).toBe(4)
  })

  it('negate returns negation', () => {
    const f = new Fraction(3, 4).negate()
    expect(f.num).toBe(-3)
    expect(f.den).toBe(4)
  })

  it('reciprocal swaps num and den', () => {
    const f = new Fraction(3, 4).reciprocal()
    expect(f.num).toBe(4)
    expect(f.den).toBe(3)
  })

  it('reciprocal of zero throws', () => {
    expect(() => new Fraction(0, 1).reciprocal()).toThrow()
  })

  it('isInteger checks', () => {
    expect(new Fraction(4, 2).isInteger()).toBe(true)
    expect(new Fraction(3, 4).isInteger()).toBe(false)
  })

  it('from creates fraction from number', () => {
    const f = Fraction.from(0.5)
    expect(f.num).toBe(1)
    expect(f.den).toBe(2)
  })

  it('from integer creates simple fraction', () => {
    const f = Fraction.from(5)
    expect(f.num).toBe(5)
    expect(f.den).toBe(1)
  })

  it('add two fractions', () => {
    const a = new Fraction(1, 2)
    const b = new Fraction(1, 3)
    const result = a.add(b)
    expect(result.num).toBe(5)
    expect(result.den).toBe(6)
  })
})
