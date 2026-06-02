import { describe, expect, it } from 'vitest'
import { GoldenRatioSearch } from '../../src/utils/golden-ratio-search.js'

describe('GoldenRatioSearch', () => {
  it('minimizes quadratic', () => {
    const x = GoldenRatioSearch.minimize((x) => Math.pow(x - 3, 2), 0, 10)
    expect(x).toBeCloseTo(3, 4)
  })

  it('minimizes cubic shifted', () => {
    const x = GoldenRatioSearch.minimize((x) => Math.pow(x - 5, 2) + 1, 0, 10)
    expect(x).toBeCloseTo(5, 4)
  })

  it('maximizes negated quadratic', () => {
    const x = GoldenRatioSearch.maximize((x) => -Math.pow(x - 2, 2), -10, 10)
    expect(x).toBeCloseTo(2, 4)
  })

  it('handles narrow range', () => {
    const x = GoldenRatioSearch.minimize((x) => Math.pow(x, 2), -0.1, 0.1)
    expect(x).toBeCloseTo(0, 4)
  })

  it('handles offset minimum', () => {
    const x = GoldenRatioSearch.minimize((x) => Math.pow(x - 100, 2), 50, 150)
    expect(x).toBeCloseTo(100, 2)
  })

  it('minimizes absolute value like function', () => {
    const x = GoldenRatioSearch.minimize((x) => Math.abs(x - 7), 0, 20)
    expect(x).toBeCloseTo(7, 2)
  })

  it('respects custom tolerance', () => {
    const x = GoldenRatioSearch.minimize((x) => Math.pow(x - 3, 2), 0, 10, 0.1)
    expect(Math.abs(x - 3)).toBeLessThan(0.5)
  })

  it('handles negative range', () => {
    const x = GoldenRatioSearch.minimize((x) => Math.pow(x + 5, 2), -10, 0)
    expect(x).toBeCloseTo(-5, 4)
  })

  it('maximizes sine near pi/2', () => {
    const x = GoldenRatioSearch.maximize(Math.sin, 0, Math.PI)
    expect(x).toBeCloseTo(Math.PI / 2, 2)
  })

  it('handles flat function', () => {
    const x = GoldenRatioSearch.minimize(() => 5, 0, 10)
    expect(x).toBeGreaterThanOrEqual(0)
    expect(x).toBeLessThanOrEqual(10)
  })

  it('minimizes exponential-like function', () => {
    const x = GoldenRatioSearch.minimize((x) => Math.abs(x - 2) + 1, 0, 5)
    expect(x).toBeCloseTo(2, 2)
  })

  it('maximizes quadratic peak', () => {
    const x = GoldenRatioSearch.maximize((x) => -Math.pow(x - 4, 2) + 10, 0, 8)
    expect(x).toBeCloseTo(4, 3)
  })

  it('minimizes constant function', () => {
    const x = GoldenRatioSearch.minimize(() => 5, 0, 10)
    expect(x).toBeGreaterThanOrEqual(0)
    expect(x).toBeLessThanOrEqual(10)
  })

  it('minimizes parabola near zero', () => {
    const x = GoldenRatioSearch.minimize((x) => Math.pow(x, 2), -5, 5)
    expect(x).toBeCloseTo(0, 2)
  })

  it('maximizes sine function', () => {
    const x = GoldenRatioSearch.maximize(Math.sin, 0, Math.PI / 2)
    expect(x).toBeCloseTo(Math.PI / 2, 2)
  })

  it('minimizes shifted parabola', () => {
    const x = GoldenRatioSearch.minimize((t) => Math.pow(t - 3, 2), 0, 10)
    expect(x).toBeCloseTo(3, 2)
  })

  it('minimizes with narrow range', () => {
    const x = GoldenRatioSearch.minimize((t) => Math.pow(t, 2), -0.1, 0.1)
    expect(x).toBeCloseTo(0, 2)
  })

  it('maximizes quadratic', () => {
    const x = GoldenRatioSearch.maximize((t) => -(t - 2) * (t - 2), 0, 5)
    expect(x).toBeCloseTo(2, 1)
  })

  it('minimizes quadratic', () => {
    const x = GoldenRatioSearch.minimize((t) => (t - 3) * (t - 3), 0, 5)
    expect(x).toBeCloseTo(3, 1)
  })

  it('maximizes negative quadratic', () => {
    const x = GoldenRatioSearch.maximize((t) => -(t - 2) * (t - 2), 0, 5)
    expect(x).toBeCloseTo(2, 1)
  })
})
