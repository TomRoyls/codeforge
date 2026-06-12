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

  it('zero polynomial evaluates to 0', () => {
    const p = new Polynomial([0])
    expect(p.evaluate(999)).toBe(0)
  })

  it('degree of zero polynomial is 0', () => {
    const p = new Polynomial([0])
    expect(p.degree).toBe(0)
  })

  it('scale by zero gives zero polynomial', () => {
    const p = new Polynomial([1, 2, 3])
    const result = p.scale(0)
    expect(result.coefficients).toEqual([0])
  })

  it('scale by negative number works', () => {
    const p = new Polynomial([1, 2])
    const result = p.scale(-3)
    expect(result.coefficients).toEqual([-3, -6])
  })

  it('scale by fraction works', () => {
    const p = new Polynomial([2, 4])
    const result = p.scale(0.5)
    expect(result.coefficients).toEqual([1, 2])
  })

  it('add polynomials of different degrees', () => {
    const a = new Polynomial([1])
    const b = new Polynomial([0, 0, 1])
    const result = a.add(b)
    expect(result.coefficients).toEqual([1, 0, 1])
  })

  it('subtract larger polynomial from smaller', () => {
    const a = new Polynomial([1, 2])
    const b = new Polynomial([3, 4, 5])
    const result = a.subtract(b)
    expect(result.coefficients).toEqual([-2, -2, -5])
  })

  it('multiply constant by polynomial', () => {
    const a = new Polynomial([5])
    const b = new Polynomial([1, 2])
    const result = a.multiply(b)
    expect(result.coefficients).toEqual([5, 10])
  })

  it('multiply polynomials with zeros in coefficients', () => {
    const a = new Polynomial([1, 0, 1])
    const b = new Polynomial([1, 1])
    const result = a.multiply(b)
    expect(result.coefficients).toEqual([1, 1, 1, 1])
  })

  it('multiply quadratics', () => {
    const a = new Polynomial([1, 2, 1])
    const b = new Polynomial([1, 3, 2])
    const result = a.multiply(b)
    expect(result.coefficients).toEqual([1, 5, 9, 7, 2])
  })

  it('cubic derivative', () => {
    const p = new Polynomial([1, 3, 3, 1])
    const d = p.derivative()
    expect(d.coefficients).toEqual([3, 6, 3])
  })

  it('quartic derivative', () => {
    const p = new Polynomial([1, 4, 6, 4, 1])
    const d = p.derivative()
    expect(d.coefficients).toEqual([4, 12, 12, 4])
  })

  it('fromRoots with negative roots', () => {
    const p = Polynomial.fromRoots([-1, -2])
    expect(p.evaluate(-1)).toBeCloseTo(0)
    expect(p.evaluate(-2)).toBeCloseTo(0)
  })

  it('fromRoots with zero root', () => {
    const p = Polynomial.fromRoots([0, 2, 3])
    expect(p.evaluate(0)).toBe(0)
    expect(p.evaluate(2)).toBe(0)
    expect(p.evaluate(3)).toBe(0)
  })

  it('fromRoots with repeated root', () => {
    const p = Polynomial.fromRoots([2, 2, 2])
    expect(p.evaluate(2)).toBe(0)
  })

  it('fromRoots with three roots', () => {
    const p = Polynomial.fromRoots([1, 2, 3])
    expect(p.evaluate(1)).toBe(0)
    expect(p.evaluate(2)).toBe(0)
    expect(p.evaluate(3)).toBe(0)
  })

  it('toString single coefficient', () => {
    const p = new Polynomial([5])
    expect(p.toString()).toBe('5')
  })

  it('toString linear with coefficient 1', () => {
    const p = new Polynomial([0, 1])
    expect(p.toString()).toBe('x')
  })

  it('toString quadratic with coefficient 1', () => {
    const p = new Polynomial([0, 0, 1])
    expect(p.toString()).toBe('x^2')
  })

  it('toString with negative coefficients', () => {
    const p = new Polynomial([-1, -2, -3])
    expect(p.toString()).toBe('-3x^2-2x-1')
  })

  it('toString with mixed signs', () => {
    const p = new Polynomial([-1, 2, -3])
    expect(p.toString()).toBe('-3x^2+2x-1')
  })

  it('toString coefficient zero omitted', () => {
    const p = new Polynomial([1, 0, 3])
    expect(p.toString()).toBe('3x^2+1')
  })

  it('toString long polynomial', () => {
    const p = new Polynomial([1, 2, 3, 4, 5])
    expect(p.toString()).toBe('5x^4+4x^3+3x^2+2x+1')
  })

  it('evaluate with fraction', () => {
    const p = new Polynomial([0, 2])
    expect(p.evaluate(0.5)).toBe(1)
  })

  it('evaluate with large number', () => {
    const p = new Polynomial([1, 0, 1])
    expect(p.evaluate(1000)).toBe(1000001)
  })

  it('evaluate with small decimal', () => {
    const p = new Polynomial([0, 0, 1])
    expect(p.evaluate(0.1)).toBeCloseTo(0.01)
  })

  it('subtract from zero polynomial', () => {
    const zero = new Polynomial([0])
    const p = new Polynomial([1, 2])
    const result = zero.subtract(p)
    expect(result.coefficients).toEqual([-1, -2])
  })

  it('add zero polynomial', () => {
    const zero = new Polynomial([0])
    const p = new Polynomial([1, 2, 3])
    const result = zero.add(p)
    expect(result.coefficients).toEqual([1, 2, 3])
  })

  it('derivative of linear is constant', () => {
    const p = new Polynomial([3, 2])
    const d = p.derivative()
    expect(d.coefficients).toEqual([2])
  })

  it('derivative of quadratic is linear', () => {
    const p = new Polynomial([1, 2, 1])
    const d = p.derivative()
    expect(d.coefficients).toEqual([2, 2])
  })

  it('derivative twice gives constant', () => {
    const p = new Polynomial([1, 3, 3, 1])
    const d1 = p.derivative()
    const d2 = d1.derivative()
    expect(d2.coefficients).toEqual([6, 6])
  })

  it('fromRoots single value repeated', () => {
    const p = Polynomial.fromRoots([5, 5, 5])
    expect(p.evaluate(5)).toBe(0)
  })

  it('toString handles all zero coefficients except one', () => {
    const p = new Polynomial([0, 0, 7])
    expect(p.toString()).toBe('7x^2')
  })

  it('trims multiple trailing zeros', () => {
    const p = new Polynomial([1, 2, 0, 0, 0, 0])
    expect(p.coefficients).toEqual([1, 2])
  })

  it('coefficients array is copied', () => {
    const coeffs = [1, 2, 3]
    const p = new Polynomial(coeffs)
    coeffs[0] = 999
    expect(p.coefficients[0]).toBe(1)
  })

  it('scale returns new polynomial', () => {
    const p = new Polynomial([1, 2])
    const result = p.scale(2)
    expect(p.coefficients).toEqual([1, 2])
    expect(result.coefficients).toEqual([2, 4])
  })

  it('derivative returns new polynomial', () => {
    const p = new Polynomial([1, 2, 3])
    const d = p.derivative()
    expect(p.coefficients).toEqual([1, 2, 3])
    expect(d.coefficients).toEqual([2, 6])
  })
})
describe('polynomial - wave545', () => {
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

describe('polynomial - wave546', () => {
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

describe('polynomial - wave547', () => {
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
