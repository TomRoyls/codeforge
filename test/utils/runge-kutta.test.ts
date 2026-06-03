import { describe, expect, it } from 'vitest'
import { RungeKutta } from '../../src/utils/runge-kutta.js'

describe('RungeKutta', () => {
  it('solves dy/dt = y with exact solution e^t', () => {
    const result = RungeKutta.solve((_t, y) => y, 0, 1, 1, 0.1)
    const last = result[result.length - 1]!
    expect(last.y).toBeCloseTo(Math.E, 3)
  })

  it('solves dy/dt = 1 (constant rate)', () => {
    const result = RungeKutta.solve(() => 1, 0, 0, 5, 0.5)
    const last = result[result.length - 1]!
    expect(last.y).toBeCloseTo(5, 5)
  })

  it('solves dy/dt = -y (exponential decay)', () => {
    const result = RungeKutta.solve((_t, y) => -y, 0, 1, 1, 0.01)
    const last = result[result.length - 1]!
    expect(last.y).toBeCloseTo(1 / Math.E, 3)
  })

  it('returns initial point', () => {
    const result = RungeKutta.solve(() => 0, 0, 5, 1, 0.1)
    expect(result[0]).toEqual({ t: 0, y: 5 })
  })

  it('handles zero step size range', () => {
    const result = RungeKutta.solve(() => 1, 0, 0, 0, 0.1)
    expect(result.length).toBe(1)
  })

  it('step computes single RK4 step', () => {
    const y = RungeKutta.step((_t, y) => y, 0, 1, 0.1)
    expect(y).toBeCloseTo(Math.exp(0.1), 5)
  })

  it('solveSystem handles 2D system', () => {
    const result = RungeKutta.solveSystem(
      (_t, y) => [-y[1]!, y[0]!],
      0, [1, 0], Math.PI / 2, 0.01
    )
    const last = result[result.length - 1]!
    expect(last.y[0]).toBeCloseTo(0, 2)
    expect(last.y[1]).toBeCloseTo(1, 2)
  })

  it('solves dy/dt = 2t (y = t^2)', () => {
    const result = RungeKutta.solve((t) => 2 * t, 0, 0, 3, 0.01)
    const last = result[result.length - 1]!
    expect(last.y).toBeCloseTo(9, 3)
  })

  it('produces monotonically increasing t values', () => {
    const result = RungeKutta.solve(() => 1, 0, 0, 5, 0.1)
    for (let i = 1; i < result.length; i++) {
      expect(result[i]!.t).toBeGreaterThan(result[i - 1]!.t)
    }
  })

  it('solveSystem returns initial point', () => {
    const result = RungeKutta.solveSystem(() => [0], 0, [42], 1, 0.1)
    expect(result[0]!.y).toEqual([42])
  })

  it('small step size gives better accuracy', () => {
    const coarse = RungeKutta.solve((_t, y) => y, 0, 1, 1, 0.1)
    const fine = RungeKutta.solve((_t, y) => y, 0, 1, 1, 0.001)
    const exact = Math.E
    expect(Math.abs(fine[fine.length - 1]!.y - exact)).toBeLessThanOrEqual(
      Math.abs(coarse[coarse.length - 1]!.y - exact)
    )
  })

  it('solveSystem with decoupled equations', () => {
    const result = RungeKutta.solveSystem(
      (_t, y) => [1, 2],
      0, [0, 0], 1, 0.01
    )
    const last = result[result.length - 1]!
    expect(last.y[0]).toBeCloseTo(1, 3)
    expect(last.y[1]).toBeCloseTo(2, 3)
  })

  it('handles dy/dt = t^2', () => {
    const result = RungeKutta.solve((t) => t * t, 0, 0, 2, 0.01)
    const last = result[result.length - 1]!
    expect(last.y).toBeCloseTo(8 / 3, 3)
  })

  it('solveSystem handles single equation', () => {
    const result = RungeKutta.solveSystem(
      (_t, _y) => [2],
      0, [0], 1, 0.01
    )
    const last = result[result.length - 1]!
    expect(last.y[0]).toBeCloseTo(2, 3)
  })

  it('solve preserves solution quality for sin(t)', () => {
    const result = RungeKutta.solve(Math.cos, 0, 0, Math.PI, 0.01)
    const last = result[result.length - 1]!
    expect(last.y).toBeCloseTo(0, 2)
  })

  it('solve exponential decay', () => {
    const result = RungeKutta.solve((_t, y) => -y, 0, 1, 1, 0.01)
    const last = result[result.length - 1]!
    expect(last.y).toBeCloseTo(Math.exp(-1), 3)
  })

  it('constant derivative produces linear growth', () => {
    const result = RungeKutta.solve(() => 1, 0, 0, 5, 0.5)
    const last = result[result.length - 1]!
    expect(last.y).toBeCloseTo(5, 3)
  })

  it('zero derivative gives constant', () => {
    const result = RungeKutta.solve(() => 0, 0, 7, 5, 1)
    const last = result[result.length - 1]!
    expect(last.y).toBeCloseTo(7, 3)
  })

  it('solve linear ODE y=x', () => {
    const result = RungeKutta.solve((x: number) => 1, 0, 0, 5, 1)
    const last = result[result.length - 1]!
    expect(last.y).toBeCloseTo(5, 3)
  })

  it('zero derivative constant solution', () => {
    const result = RungeKutta.solve(() => 0, 0, 42, 10, 5)
    const last = result[result.length - 1]!
    expect(last.y).toBeCloseTo(42, 3)
  })

  it('solve constant derivative returns linear', () => {
    const result = RungeKutta.solve(() => 1, 0, 0, 5, 0.5)
    const last = result[result.length - 1]!
    expect(last.y).toBeCloseTo(5, 3)
  })

  it('solve constant zero stays zero', () => {
    const result = RungeKutta.solve(() => 0, 0, 0, 5, 1)
    const last = result[result.length - 1]!
    expect(last.y).toBeCloseTo(0, 3)
  })
})
