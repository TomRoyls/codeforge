import { describe, expect, it } from 'vitest'
import { TernarySearchContinuous } from '../../src/utils/ternary-search-continuous.js'

describe('TernarySearchContinuous', () => {
  it('minimizes quadratic', () => {
    const x = TernarySearchContinuous.minimize((x) => Math.pow(x - 3, 2), 0, 10)
    expect(x).toBeCloseTo(3, 4)
  })

  it('maximizes inverted quadratic', () => {
    const x = TernarySearchContinuous.maximize((x) => -Math.pow(x - 5, 2), 0, 10)
    expect(x).toBeCloseTo(5, 4)
  })

  it('minimizes near boundary', () => {
    const x = TernarySearchContinuous.minimize((x) => Math.pow(x - 0.01, 2), 0, 10)
    expect(x).toBeCloseTo(0.01, 2)
  })

  it('handles negative range', () => {
    const x = TernarySearchContinuous.minimize((x) => Math.pow(x + 5, 2), -10, 0)
    expect(x).toBeCloseTo(-5, 4)
  })

  it('handles narrow range', () => {
    const x = TernarySearchContinuous.minimize((x) => Math.pow(x, 2), -0.01, 0.01)
    expect(x).toBeCloseTo(0, 3)
  })

  it('maximizes sine', () => {
    const x = TernarySearchContinuous.maximize(Math.sin, 0, Math.PI)
    expect(x).toBeCloseTo(Math.PI / 2, 2)
  })

  it('handles offset cubic', () => {
    const x = TernarySearchContinuous.minimize((x) => Math.pow(x - 7, 2), 0, 20)
    expect(x).toBeCloseTo(7, 3)
  })

  it('respects iteration count', () => {
    const x = TernarySearchContinuous.minimize((x) => Math.pow(x - 5, 2), 0, 10, 10)
    expect(Math.abs(x - 5)).toBeLessThan(1)
  })

  it('minimizes at midpoint', () => {
    const x = TernarySearchContinuous.minimize((x) => Math.pow(x - 5, 2), 0, 10)
    expect(x).toBeCloseTo(5, 4)
  })

  it('maximizes cosine', () => {
    const x = TernarySearchContinuous.maximize(Math.cos, -Math.PI, Math.PI)
    expect(Math.abs(x)).toBeLessThan(0.01)
  })

  it('minimizes quartic', () => {
    const x = TernarySearchContinuous.minimize((x) => Math.pow(x - 2, 4), 0, 10)
    expect(x).toBeCloseTo(2, 2)
  })

  it('minimizes negative exponential', () => {
    const x = TernarySearchContinuous.minimize((x) => Math.exp(x), -5, 5)
    expect(x).toBeCloseTo(-5, 1)
  })
})
