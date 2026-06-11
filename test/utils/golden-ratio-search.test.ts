import { describe, expect, it } from 'vitest'
import { GoldenRatioSearch } from '../../src/utils/golden-ratio-search.js'

describe('GoldenRatioSearch minimize', () => {
  it('finds minimum of simple quadratic', () => {
    const x = GoldenRatioSearch.minimize((t) => (t - 3) * (t - 3), 0, 10)
    expect(x).toBeCloseTo(3, 2)
  })

  it('finds minimum at zero', () => {
    const x = GoldenRatioSearch.minimize((t) => t * t, -5, 5)
    expect(x).toBeCloseTo(0, 2)
  })

  it('finds minimum with offset', () => {
    const x = GoldenRatioSearch.minimize((t) => (t - 100) * (t - 100), 50, 150)
    expect(x).toBeCloseTo(100, 1)
  })

  it('finds minimum in negative range', () => {
    const x = GoldenRatioSearch.minimize((t) => (t + 5) * (t + 5), -10, 0)
    expect(x).toBeCloseTo(-5, 2)
  })

  it('finds minimum at left endpoint', () => {
    const x = GoldenRatioSearch.minimize((t) => t, -5, 5)
    expect(x).toBeCloseTo(-5, 0)
  })

  it('finds minimum at right endpoint', () => {
    const x = GoldenRatioSearch.minimize((t) => -t, -5, 5)
    expect(x).toBeCloseTo(5, 0)
  })

  it('handles flat function', () => {
    const x = GoldenRatioSearch.minimize(() => 42, 0, 10)
    expect(x).toBeGreaterThanOrEqual(0)
    expect(x).toBeLessThanOrEqual(10)
  })

  it('handles narrow range', () => {
    const x = GoldenRatioSearch.minimize((t) => t * t, -0.1, 0.1)
    expect(x).toBeCloseTo(0, 4)
  })

  it('handles large range', () => {
    const x = GoldenRatioSearch.minimize((t) => (t - 1000) * (t - 1000), 0, 2000)
    expect(x).toBeCloseTo(1000, 0)
  })

  it('respects custom tolerance', () => {
    const x = GoldenRatioSearch.minimize((t) => (t - 3) * (t - 3), 0, 10, 0.1)
    expect(Math.abs(x - 3)).toBeLessThan(0.5)
  })

  it('handles very small tolerance', () => {
    const x = GoldenRatioSearch.minimize((t) => (t - 7) * (t - 7), 0, 15, 1e-12)
    expect(x).toBeCloseTo(7, 6)
  })

  it('minimizes quartic function', () => {
    const x = GoldenRatioSearch.minimize((t) => Math.pow(t - 1, 4), -5, 5)
    expect(x).toBeCloseTo(1, 2)
  })

  it('minimizes cosine near pi', () => {
    const x = GoldenRatioSearch.minimize(Math.cos, 0, Math.PI * 2)
    expect(x).toBeCloseTo(Math.PI, 1)
  })

  it('minimizes absolute value', () => {
    const x = GoldenRatioSearch.minimize((t) => Math.abs(t - 7), 0, 20)
    expect(x).toBeCloseTo(7, 1)
  })

  it('minimizes sum of squares', () => {
    const x = GoldenRatioSearch.minimize((t) => t * t + 2 * t + 1, -10, 10)
    expect(x).toBeCloseTo(-1, 2)
  })

  it('minimizes offset gaussian-like function', () => {
    const x = GoldenRatioSearch.minimize((t) => Math.pow(t - 0.5, 2) + 3, -1, 2)
    expect(x).toBeCloseTo(0.5, 2)
  })

  it('finds minimum with specific value', () => {
    const x = GoldenRatioSearch.minimize((t) => Math.pow(t - 4.567, 2), 0, 10)
    expect(x).toBeCloseTo(4.567, 2)
  })

  it('minimizes piecewise-linear V shape', () => {
    const x = GoldenRatioSearch.minimize((t) => Math.abs(t - 3) + Math.abs(t - 5), 0, 10)
    expect(x).toBeGreaterThanOrEqual(2.9)
    expect(x).toBeLessThanOrEqual(5.1)
  })

  it('minimizes cubic-like function', () => {
    const x = GoldenRatioSearch.minimize((t) => Math.pow(t - 5, 2) + 1, 0, 10)
    expect(x).toBeCloseTo(5, 2)
  })

  it('minimizes exponential-like function', () => {
    const x = GoldenRatioSearch.minimize((t) => Math.abs(t - 2) + 1, 0, 5)
    expect(x).toBeCloseTo(2, 1)
  })
})

describe('GoldenRatioSearch maximize', () => {
  it('finds maximum of negative quadratic', () => {
    const x = GoldenRatioSearch.maximize((t) => -(t - 2) * (t - 2), 0, 5)
    expect(x).toBeCloseTo(2, 2)
  })

  it('maximizes sine near pi/2', () => {
    const x = GoldenRatioSearch.maximize(Math.sin, 0, Math.PI)
    expect(x).toBeCloseTo(Math.PI / 2, 2)
  })

  it('maximizes cosine near zero', () => {
    const x = GoldenRatioSearch.maximize(Math.cos, -Math.PI, Math.PI)
    expect(x).toBeCloseTo(0, 1)
  })

  it('maximizes quadratic peak', () => {
    const x = GoldenRatioSearch.maximize((t) => -(t - 4) * (t - 4) + 10, 0, 8)
    expect(x).toBeCloseTo(4, 2)
  })

  it('maximizes with large range', () => {
    const x = GoldenRatioSearch.maximize((t) => -(t - 50) * (t - 50), 0, 100)
    expect(x).toBeCloseTo(50, 1)
  })

  it('maximizes negated parabola', () => {
    const x = GoldenRatioSearch.maximize((t) => -(t - 3) * (t - 3), 0, 10)
    expect(x).toBeCloseTo(3, 1)
  })

  it('maximizes sine in first quadrant', () => {
    const x = GoldenRatioSearch.maximize(Math.sin, 0, Math.PI / 2)
    expect(x).toBeCloseTo(Math.PI / 2, 2)
  })

  it('handles flat function for maximize', () => {
    const x = GoldenRatioSearch.maximize(() => 5, 0, 10)
    expect(x).toBeGreaterThanOrEqual(0)
    expect(x).toBeLessThanOrEqual(10)
  })

  it('maximize with custom tolerance', () => {
    const x = GoldenRatioSearch.maximize((t) => -(t - 5) * (t - 5), 0, 10, 1e-10)
    expect(x).toBeCloseTo(5, 4)
  })

  it('maximizes shifted negative quadratic', () => {
    const x = GoldenRatioSearch.maximize((t) => -(t + 3) * (t + 3), -10, 0)
    expect(x).toBeCloseTo(-3, 1)
  })
})
