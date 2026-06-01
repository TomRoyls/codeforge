import { describe, expect, it } from 'vitest'
import { MonteCarlo } from '../../src/utils/monte-carlo.js'

describe('MonteCarlo', () => {
  it('integrates x^2 from 0 to 1', () => {
    const result = MonteCarlo.integrate((x) => x * x, 0, 1, 10000)
    expect(result).toBeCloseTo(1 / 3, 2)
  })

  it('integrates constant function', () => {
    const result = MonteCarlo.integrate(() => 5, 0, 2, 5000)
    expect(result).toBeCloseTo(10, 1)
  })

  it('integrates linear function', () => {
    const result = MonteCarlo.integrate((x) => x, 0, 1, 10000)
    expect(result).toBeCloseTo(0.5, 2)
  })

  it('integrates sin(x) from 0 to pi', () => {
    const result = MonteCarlo.integrate(Math.sin, 0, Math.PI, 10000)
    expect(result).toBeCloseTo(2, 1)
  })

  it('estimates pi', () => {
    const pi = MonteCarlo.pi(50000)
    expect(pi).toBeGreaterThan(3.0)
    expect(pi).toBeLessThan(3.4)
  })

  it('integrateWithError returns error estimate', () => {
    const result = MonteCarlo.integrateWithError((x) => x * x, 0, 1, 10000)
    expect(result.samples).toBe(10000)
    expect(result.value).toBeCloseTo(1 / 3, 2)
    expect(result.error).toBeGreaterThanOrEqual(0)
  })

  it('integrate2D computes double integral', () => {
    const result = MonteCarlo.integrate2D(
      (x, y) => x + y,
      0, 1, 0, 1,
      10000
    )
    expect(result).toBeCloseTo(1, 1)
  })

  it('uses custom seed for reproducibility', () => {
    let seed = 42
    const rng = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      return seed / 0x7fffffff
    }
    const r1 = MonteCarlo.integrate(() => 1, 0, 1, 100, { seed: rng })
    seed = 42
    const rng2 = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      return seed / 0x7fffffff
    }
    const r2 = MonteCarlo.integrate(() => 1, 0, 1, 100, { seed: rng2 })
    expect(r1).toBeCloseTo(r2, 10)
  })

  it('handles negative range', () => {
    const result = MonteCarlo.integrate((x) => x, -1, 1, 10000)
    expect(result).toBeCloseTo(0, 1)
  })

  it('integrates exp(x) from 0 to 1', () => {
    const result = MonteCarlo.integrate(Math.exp, 0, 1, 10000)
    expect(result).toBeCloseTo(Math.E - 1, 1)
  })

  it('integrate2D with zero area', () => {
    const result = MonteCarlo.integrate2D(() => 5, 0, 0, 0, 1, 1000)
    expect(result).toBeCloseTo(0, 8)
  })

  it('pi with many samples converges', () => {
    const pi = MonteCarlo.pi(50000)
    expect(Math.abs(pi - Math.PI)).toBeLessThan(0.2)
  })

  it('integrates constant function', () => {
    const result = MonteCarlo.integrate(() => 5, 0, 2, 10000)
    expect(result).toBeCloseTo(10, 1)
  })

  it('integrates linear function', () => {
    const result = MonteCarlo.integrate((x) => 2 * x, 0, 1, 10000)
    expect(result).toBeCloseTo(1, 1)
  })
})
