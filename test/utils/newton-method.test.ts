import { describe, expect, it } from 'vitest'
import { NewtonMethod } from '../../src/utils/newton-method.js'

describe('NewtonMethod', () => {
  it('finds root of x^2 - 4 (sqrt(4))', () => {
    const root = NewtonMethod.findRoot(
      (x) => x * x - 4,
      (x) => 2 * x,
      3
    )
    expect(root).toBeCloseTo(2, 8)
  })

  it('finds root of x - 1 (trivial)', () => {
    const root = NewtonMethod.findRoot(
      (x) => x - 1,
      () => 1,
      0
    )
    expect(root).toBeCloseTo(1, 8)
  })

  it('finds root of sin(x)', () => {
    const root = NewtonMethod.findRoot(
      (x) => Math.sin(x),
      (x) => Math.cos(x),
      3
    )
    expect(root).toBeCloseTo(Math.PI, 6)
  })

  it('converges to negative root with different start', () => {
    const root = NewtonMethod.findRoot(
      (x) => x * x - 4,
      (x) => 2 * x,
      -3
    )
    expect(root).toBeCloseTo(-2, 8)
  })

  it('sqrt computes square root', () => {
    expect(NewtonMethod.sqrt(4)).toBeCloseTo(2, 8)
    expect(NewtonMethod.sqrt(9)).toBeCloseTo(3, 8)
    expect(NewtonMethod.sqrt(2)).toBeCloseTo(Math.sqrt(2), 8)
  })

  it('sqrt returns NaN for negative', () => {
    expect(NewtonMethod.sqrt(-1)).toBeNaN()
  })

  it('sqrt returns 0 for 0', () => {
    expect(NewtonMethod.sqrt(0)).toBe(0)
  })

  it('nthRoot computes cube root', () => {
    expect(NewtonMethod.nthRoot(27, 3)).toBeCloseTo(3, 6)
  })

  it('nthRoot computes 4th root', () => {
    expect(NewtonMethod.nthRoot(16, 4)).toBeCloseTo(2, 6)
  })

  it('findRootWithHistory returns convergence info', () => {
    const result = NewtonMethod.findRootWithHistory(
      (x) => x * x - 4,
      (x) => 2 * x,
      3
    )
    expect(result.converged).toBe(true)
    expect(result.iterations).toBeGreaterThan(0)
    expect(result.history.length).toBeGreaterThan(1)
    expect(result.root).toBeCloseTo(2, 8)
  })

  it('inverse computes f^-1', () => {
    const result = NewtonMethod.inverse(
      (x) => x * x,
      (x) => 2 * x,
      9,
      3
    )
    expect(result).toBeCloseTo(3, 6)
  })

  it('handles tolerance option', () => {
    const result = NewtonMethod.findRootWithHistory(
      (x) => x * x - 4,
      (x) => 2 * x,
      3,
      { tolerance: 1e-5 }
    )
    expect(result.converged).toBe(true)
  })

  it('respects maxIterations', () => {
    const result = NewtonMethod.findRootWithHistory(
      (x) => x * x - 4,
      (x) => 2 * x,
      3,
      { maxIterations: 2 }
    )
    expect(result.iterations).toBeLessThanOrEqual(2)
  })

  it('finds root of cos(x)', () => {
    const root = NewtonMethod.findRoot(
      (x) => Math.cos(x),
      (x) => -Math.sin(x),
      1
    )
    expect(Math.cos(root)).toBeCloseTo(0, 6)
  })

  it('history shows decreasing error', () => {
    const result = NewtonMethod.findRootWithHistory(
      (x) => x * x - 4,
      (x) => 2 * x,
      10
    )
    const errors = result.history.map(x => Math.abs(x - 2))
    for (let i = 1; i < errors.length; i++) {
      expect(errors[i]!).toBeLessThanOrEqual(errors[i - 1]!)
    }
  })

  it('finds root of e^x - 1', () => {
    const root = NewtonMethod.findRoot(
      (x) => Math.exp(x) - 1,
      (x) => Math.exp(x),
      0.5
    )
    expect(root).toBeCloseTo(0, 8)
  })

  it('finds root of x^2 - 4', () => {
    const root = NewtonMethod.findRoot(
      (x) => x * x - 4,
      (x) => 2 * x,
      3
    )
    expect(Math.abs(root - 2)).toBeLessThan(0.001)
  })

  it('finds root of x cubed equals 8', () => {
    const root = NewtonMethod.findRoot(
      (x) => x * x * x - 8,
      (x) => 3 * x * x,
      3
    )
    expect(Math.abs(root - 2)).toBeLessThan(0.001)
  })

  it('finds root of x-5 near 5', () => {
    const root = NewtonMethod.findRoot(
      (x) => x - 5,
      (x) => 1,
      4,
    )
    expect(Math.abs(root - 5)).toBeLessThan(0.001)
  })

  it('finds root of x squared', () => {
    const root = NewtonMethod.findRoot(
      (x) => x * x,
      (x) => 2 * x,
      1,
      2,
    )
    expect(Math.abs(root)).toBeLessThan(0.001)
  })
})
