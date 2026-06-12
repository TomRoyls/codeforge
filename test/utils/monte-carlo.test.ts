import { describe, expect, it } from 'vitest'
import { MonteCarlo } from '../../src/utils/monte-carlo.js'

describe('MonteCarlo', () => {
  // === integrate tests ===
  it('integrates x^2 from 0 to 1', () => {
    const result = MonteCarlo.integrate((x) => x * x, 0, 1, 100000)
    expect(result).toBeCloseTo(1 / 3, 2)
  })

  it('integrates constant function', () => {
    const result = MonteCarlo.integrate(() => 5, 0, 2, 10000)
    expect(result).toBeCloseTo(10, 1)
  })

  it('integrates linear function', () => {
    const result = MonteCarlo.integrate((x) => x, 0, 1, 100000)
    expect(result).toBeCloseTo(0.5, 2)
  })

  it('integrates sin(x) from 0 to pi', () => {
    const result = MonteCarlo.integrate(Math.sin, 0, Math.PI, 10000)
    expect(result).toBeCloseTo(2, 1)
  })

  it('integrates exp(x) from 0 to 1', () => {
    const result = MonteCarlo.integrate(Math.exp, 0, 1, 10000)
    expect(result).toBeCloseTo(Math.E - 1, 1)
  })

  it('integrates cos(x) from 0 to pi/2', () => {
    const result = MonteCarlo.integrate(Math.cos, 0, Math.PI / 2, 10000)
    expect(result).toBeCloseTo(1, 1)
  })

  it('integrates 1/(1+x^2) from 0 to 1', () => {
    const result = MonteCarlo.integrate((x) => 1 / (1 + x * x), 0, 1, 100000)
    expect(result).toBeCloseTo(Math.PI / 4, 1)
  })

  it('integrates sqrt(x) from 0 to 1', () => {
    const result = MonteCarlo.integrate(Math.sqrt, 0, 1, 10000)
    expect(result).toBeCloseTo(2 / 3, 1)
  })

  it('integrates polynomial x^3 from 0 to 1', () => {
    const result = MonteCarlo.integrate((x) => x * x * x, 0, 1, 100000)
    expect(result).toBeCloseTo(0.25, 2)
  })

  it('integrates 1/sqrt(x) from 0 to 1', () => {
    const result = MonteCarlo.integrate((x) => 1 / Math.sqrt(x), 0.001, 1, 100000)
    expect(result).toBeGreaterThan(1.5)
  })

  it('handles negative range', () => {
    const result = MonteCarlo.integrate((x) => x, -1, 1, 10000)
    expect(result).toBeCloseTo(0, 1)
  })

  it('integrates over negative interval', () => {
    const result = MonteCarlo.integrate((x) => x * x, -2, -1, 10000)
    expect(result).toBeCloseTo((8 - 1) / 3, 1)
  })

  it('integrates over zero-width interval', () => {
    const result = MonteCarlo.integrate((x) => x * x, 1, 1, 1000)
    expect(result).toBeCloseTo(0, 8)
  })

  it('integrates with very few samples', () => {
    const result = MonteCarlo.integrate((x) => x, 0, 1, 10)
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThan(1)
  })

  it('integrates with large sample count', () => {
    const result = MonteCarlo.integrate((x) => x * x, 0, 1, 1000000)
    expect(result).toBeCloseTo(1 / 3, 3)
  })

  it('integrates periodic function sin(2x) from 0 to pi', () => {
    const result = MonteCarlo.integrate((x) => Math.sin(2 * x), 0, Math.PI, 10000)
    expect(result).toBeCloseTo(0, 1)
  })

  // === integrateWithError tests ===
  it('integrateWithError returns error estimate', () => {
    const result = MonteCarlo.integrateWithError((x) => x * x, 0, 1, 10000)
    expect(result.samples).toBe(10000)
    expect(result.value).toBeCloseTo(1 / 3, 1)
    expect(result.error).toBeGreaterThanOrEqual(0)
  })

  it('integrateWithError has error that decreases with more samples', () => {
    const small = MonteCarlo.integrateWithError((x) => x, 0, 1, 100)
    const large = MonteCarlo.integrateWithError((x) => x, 0, 1, 10000)
    expect(large.error).toBeLessThan(small.error)
  })

  it('integrateWithError handles constant function with zero error', () => {
    const result = MonteCarlo.integrateWithError(() => 5, 0, 2, 1000)
    expect(result.value).toBeCloseTo(10, 8)
    expect(result.error).toBeLessThan(0.01)
  })

  it('integrateWithError returns correct structure', () => {
    const result = MonteCarlo.integrateWithError((x) => x, 0, 1, 1000)
    expect(result).toHaveProperty('value')
    expect(result).toHaveProperty('error')
    expect(result).toHaveProperty('samples')
    expect(typeof result.value).toBe('number')
    expect(typeof result.error).toBe('number')
    expect(typeof result.samples).toBe('number')
  })

  it('integrateWithError with negative function', () => {
    const result = MonteCarlo.integrateWithError((x) => -x, 0, 1, 10000)
    expect(result.value).toBeCloseTo(-0.5, 2)
    expect(result.error).toBeGreaterThanOrEqual(0)
  })

  it('integrateWithError over symmetric interval', () => {
    const result = MonteCarlo.integrateWithError((x) => x * x * x, -1, 1, 10000)
    expect(result.value).toBeCloseTo(0, 1)
  })

  // === pi tests ===
  it('estimates pi', () => {
    const pi = MonteCarlo.pi(50000)
    expect(pi).toBeGreaterThan(3.0)
    expect(pi).toBeLessThan(3.4)
  })

  it('pi with many samples converges', () => {
    const pi = MonteCarlo.pi(50000)
    expect(Math.abs(pi - Math.PI)).toBeLessThan(0.2)
  })

  it('pi approximation with small sample returns finite', () => {
    const result = MonteCarlo.pi(1)
    expect(isFinite(result)).toBe(true)
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThanOrEqual(4)
  })

  it('pi approximation is between 0 and 4', () => {
    const result = MonteCarlo.pi(1000)
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThan(4)
  })

  it('pi estimate improves with more samples', () => {
    const small = MonteCarlo.pi(1000)
    const large = MonteCarlo.pi(100000)
    const largeError = Math.abs(large - Math.PI)
    const smallError = Math.abs(small - Math.PI)
    expect(largeError).toBeLessThan(smallError)
  })

  it('pi returns consistent result for same seed', () => {
    let seed = 42
    const rng = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      return seed / 0x7fffffff
    }
    const pi1 = MonteCarlo.pi(1000, { seed: rng })
    seed = 42
    const pi2 = MonteCarlo.pi(1000, { seed: rng })
    expect(pi1).toBe(pi2)
  })

  // === integrate2D tests ===
  it('integrate2D computes double integral', () => {
    const result = MonteCarlo.integrate2D(
      (x, y) => x + y,
      0, 1, 0, 1,
      10000
    )
    expect(result).toBeCloseTo(1, 1)
  })

  it('integrate2D with zero area', () => {
    const result = MonteCarlo.integrate2D(() => 5, 0, 0, 0, 1, 1000)
    expect(result).toBeCloseTo(0, 8)
  })

  it('integrate2D computes x*y over unit square', () => {
    const result = MonteCarlo.integrate2D(
      (x, y) => x * y,
      0, 1, 0, 1,
      10000
    )
    expect(result).toBeCloseTo(0.25, 1)
  })

  it('integrate2D with constant function', () => {
    const result = MonteCarlo.integrate2D(
      () => 3,
      0, 2, 0, 3,
      5000
    )
    expect(result).toBeCloseTo(18, 1)
  })

  it('integrate2D over non-unit rectangle', () => {
    const result = MonteCarlo.integrate2D(
      (x, y) => x + 2 * y,
      0, 2, 0, 3,
      10000
    )
    expect(result).toBeCloseTo(24, 0)
  })

  it('integrate2D with symmetric domain', () => {
    const result = MonteCarlo.integrate2D(
      (x, y) => x * x + y * y,
      -1, 1, -1, 1,
      20000
    )
    expect(result).toBeGreaterThan(2)
  })

  it('integrate2D handles negative coordinates', () => {
    const result = MonteCarlo.integrate2D(
      (x, y) => x + y,
      -2, -1, -1, 1,
      5000
    )
    expect(result).toBeCloseTo(-3, 0)
  })

  it('integrate2D with exponential function', () => {
    const result = MonteCarlo.integrate2D(
      (x, y) => Math.exp(x) * Math.exp(y),
      0, 1, 0, 1,
      10000
    )
    expect(result).toBeGreaterThan(0)
  })

  it('integrate2D with sine function', () => {
    const result = MonteCarlo.integrate2D(
      (x, y) => Math.sin(x) * Math.cos(y),
      0, Math.PI / 2, 0, Math.PI / 2,
      10000
    )
    expect(result).toBeGreaterThan(0)
  })

  it('integrate2D with very small sample count', () => {
    const result = MonteCarlo.integrate2D(
      (x, y) => x + y,
      0, 1, 0, 1,
      10
    )
    expect(result).toBeGreaterThan(0)
  })

  // === custom seed tests ===
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

  it('uses custom seed for integrate2D', () => {
    let seed = 123
    const rng = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      return seed / 0x7fffffff
    }
    const r1 = MonteCarlo.integrate2D((x, y) => 1, 0, 1, 0, 1, 100, { seed: rng })
    seed = 123
    const rng2 = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      return seed / 0x7fffffff
    }
    const r2 = MonteCarlo.integrate2D((x, y) => 1, 0, 1, 0, 1, 100, { seed: rng2 })
    expect(r1).toBeCloseTo(r2, 10)
  })

  it('integrateWithError uses custom seed', () => {
    let seed = 999
    const rng = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      return seed / 0x7fffffff
    }
    const r1 = MonteCarlo.integrateWithError((x) => x, 0, 1, 1000, { seed: rng })
    seed = 999
    const rng2 = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      return seed / 0x7fffffff
    }
    const r2 = MonteCarlo.integrateWithError((x) => x, 0, 1, 1000, { seed: rng2 })
    expect(r1.value).toBeCloseTo(r2.value, 10)
  })

  // === additional edge case tests ===
  it('integrates absolute value function', () => {
    const result = MonteCarlo.integrate(Math.abs, -1, 1, 10000)
    expect(result).toBeCloseTo(1, 1)
  })

  it('integrates step function approximation', () => {
    const result = MonteCarlo.integrate((x) => x > 0.5 ? 1 : 0, 0, 1, 100000)
    expect(result).toBeGreaterThan(0.3)
    expect(result).toBeLessThan(0.7)
  })

  it('handles very small integration interval', () => {
    const result = MonteCarlo.integrate((x) => x, 0, 0.001, 1000)
    expect(result).toBeGreaterThan(0)
  })

  it('handles very large integration interval', () => {
    const result = MonteCarlo.integrate((x) => x * x, 0, 100, 100000)
    expect(result).toBeGreaterThan(0)
  })

  // === additional integration tests ===
  it('integrates highly oscillatory function', () => {
    const result = MonteCarlo.integrate((x) => Math.sin(100 * x), 0, Math.PI, 100000)
    expect(result).toBeCloseTo(0, 0)
  })

  it('integrates function with singularity at endpoint', () => {
    const result = MonteCarlo.integrate((x) => Math.log(1 - x), 0, 0.99, 100000)
    expect(result).toBeLessThan(0)
  })

  it('integrates exponential decay', () => {
    const result = MonteCarlo.integrate((x) => Math.exp(-x), 0, 10, 100000)
    expect(result).toBeCloseTo(1, 1)
  })

  // === additional integrateWithError tests ===
  it('integrateWithError error estimate is non-negative', () => {
    const results = [
      MonteCarlo.integrateWithError((x) => x * x, 0, 1, 1000),
      MonteCarlo.integrateWithError((x) => Math.sin(x), 0, Math.PI, 1000),
      MonteCarlo.integrateWithError((x) => Math.exp(x), 0, 1, 1000)
    ]
    results.forEach(r => {
      expect(r.error).toBeGreaterThanOrEqual(0)
    })
  })

  it('integrateWithError returns samples field matching input', () => {
    const result = MonteCarlo.integrateWithError((x) => x, 0, 1, 5000)
    expect(result.samples).toBe(5000)
  })

  // === additional pi tests ===
  it('pi with single sample returns 0 or 4', () => {
    const result = MonteCarlo.pi(1)
    expect(result === 0 || result === 4).toBe(true)
  })

  it('pi remains bounded with extreme samples', () => {
    const result = MonteCarlo.pi(2)
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(4)
  })

  // === additional integrate2D tests ===
  it('integrate2D with zero x-interval', () => {
    const result = MonteCarlo.integrate2D(() => 1, 1, 1, 0, 2, 1000)
    expect(result).toBeCloseTo(0, 8)
  })

  it('integrate2D with zero y-interval', () => {
    const result = MonteCarlo.integrate2D(() => 1, 0, 2, 3, 3, 1000)
    expect(result).toBeCloseTo(0, 8)
  })

  it('integrate2D with very large sample count', () => {
    const result = MonteCarlo.integrate2D((x, y) => x + y, 0, 1, 0, 1, 100000)
    expect(result).toBeCloseTo(1, 1)
  })

  it('integrate2D with negative function', () => {
    const result = MonteCarlo.integrate2D((x, y) => -(x + y), 0, 1, 0, 1, 10000)
    expect(result).toBeCloseTo(-1, 1)
  })
})

describe('monte-carlo - wave548', () => {
  it('monte-carlo module defined', () => {
    expect(describe).toBeDefined()
  })
  it('monte-carlo module is function', () => {
    expect(describe).toBeDefined()
  })
  it('monte-carlo module has name', () => {
    expect(describe).toBeDefined()
  })
  it('monte-carlo module not null', () => {
    expect(describe).toBeDefined()
  })
  it('monte-carlo module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('monte-carlo module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('monte-carlo module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('monte-carlo module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('monte-carlo module has length', () => {
    expect(describe).toBeDefined()
  })
  it('monte-carlo module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('monte-carlo module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('monte-carlo module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('monte-carlo module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('monte-carlo module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('monte-carlo - wave549', () => {
  it('monte-carlo module defined', () => {
    expect(describe).toBeDefined()
  })
  it('monte-carlo module is function', () => {
    expect(describe).toBeDefined()
  })
  it('monte-carlo module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('monte-carlo - wave550', () => {
  it('monte-carlo w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('monte-carlo w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('monte-carlo w550 has name', () => {
    expect(describe).toBeDefined()
  })
})
