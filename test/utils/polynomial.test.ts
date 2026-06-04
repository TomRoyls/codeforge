import { describe, expect, it } from 'vitest'
import { Polynomial } from '../../src/utils/polynomial.js'

describe('Polynomial', () => {
  it('creates polynomial from coefficients', () => {
    const p = new Polynomial([1, 2, 3])
    expect(p.coefficients).toEqual([1, 2, 3])
  })

  it('computes degree', () => {
    expect(new Polynomial([1, 2, 3]).degree).toBe(2)
    expect(new Polynomial([5]).degree).toBe(0)
    expect(new Polynomial([0, 0, 3]).degree).toBe(2)
  })

  it('trims trailing zeros', () => {
    const p = new Polynomial([1, 2, 0, 0])
    expect(p.coefficients).toEqual([1, 2])
  })

  it('evaluates polynomial (Horner)', () => {
    const p = new Polynomial([1, 2, 3])
    expect(p.evaluate(0)).toBe(1)
    expect(p.evaluate(1)).toBe(6)
    expect(p.evaluate(2)).toBe(17)
  })

  it('adds polynomials', () => {
    const a = new Polynomial([1, 2, 3])
    const b = new Polynomial([4, 5])
    const result = a.add(b)
    expect(result.coefficients).toEqual([5, 7, 3])
  })

  it('subtracts polynomials', () => {
    const a = new Polynomial([3, 5, 7])
    const b = new Polynomial([1, 2, 3])
    const result = a.subtract(b)
    expect(result.coefficients).toEqual([2, 3, 4])
  })

  it('multiplies polynomials', () => {
    const a = new Polynomial([1, 1])
    const b = new Polynomial([1, 1])
    const result = a.multiply(b)
    expect(result.coefficients).toEqual([1, 2, 1])
  })

  it('scales polynomial', () => {
    const p = new Polynomial([1, 2, 3])
    const result = p.scale(2)
    expect(result.coefficients).toEqual([2, 4, 6])
  })

  it('computes derivative', () => {
    const p = new Polynomial([1, 2, 3])
    const d = p.derivative()
    expect(d.coefficients).toEqual([2, 6])
  })

  it('derivative of constant is zero', () => {
    const p = new Polynomial([5])
    expect(p.derivative().coefficients).toEqual([0])
  })

  it('fromRoots creates correct polynomial', () => {
    const p = Polynomial.fromRoots([2, 3])
    expect(p.evaluate(2)).toBe(0)
    expect(p.evaluate(3)).toBe(0)
  })

  it('fromRoots single root', () => {
    const p = Polynomial.fromRoots([5])
    expect(p.evaluate(5)).toBe(0)
    expect(p.evaluate(0)).toBe(-5)
  })

  it('toString formats polynomial', () => {
    expect(new Polynomial([1, 2, 3]).toString()).toBe('3x^2+2x+1')
  })

  it('toString handles zero polynomial', () => {
    expect(new Polynomial([0]).toString()).toBe('0')
  })

  it('handles zero polynomial operations', () => {
    const zero = new Polynomial([0])
    const p = new Polynomial([1, 2])
    expect(p.add(zero).coefficients).toEqual([1, 2])
  })

  it('multiply by zero gives zero', () => {
    const p = new Polynomial([1, 2, 3])
    const zero = new Polynomial([0])
    expect(p.multiply(zero).coefficients).toEqual([0])
  })

  it('evaluate with negative x', () => {
    const p = new Polynomial([1, 0, 1])
    expect(p.evaluate(-2)).toBe(5)
  })

  it('fromRoots empty returns constant 1', () => {
    const p = Polynomial.fromRoots([])
    expect(p.coefficients).toEqual([1])
  })

  it('evaluate at 0 returns constant term', () => {
    const p = new Polynomial([3, 2, 1])
    expect(p.evaluate(0)).toBe(3)
  })

  it('constant polynomial evaluates to itself', () => {
    const p = new Polynomial([5])
    expect(p.evaluate(100)).toBe(5)
  })

  it('linear polynomial evaluates correctly', () => {
    const p = new Polynomial([3, 2])
    expect(p.evaluate(4)).toBe(11)
  })

  it('constant polynomial evaluates to constant', () => {
    const p = new Polynomial([5])
    expect(p.evaluate(100)).toBe(5)
  })

  it('zero polynomial evaluates to 0', () => {
    const p = new Polynomial([0])
    expect(p.evaluate(999)).toBe(0)
  })

  it('constant polynomial evaluates to constant', () => {
    const p = new Polynomial([5])
    expect(p.evaluate(10)).toBe(5)
  })
})
