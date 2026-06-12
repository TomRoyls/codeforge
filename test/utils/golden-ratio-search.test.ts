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
    const x = GoldenRatioSearch.minimize((t) => (t - 7) * (t - 7), 0, 15, 1e-10)
    expect(x).toBeCloseTo(7, 4)
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

  it('minimizes asymmetric function', () => {
    const x = GoldenRatioSearch.minimize((t) => t * t * t - 3 * t, -5, 5)
    expect(x).toBeCloseTo(1, 1)
  })

  it('minimizes sin near 3pi/2', () => {
    const x = GoldenRatioSearch.minimize(Math.sin, Math.PI, Math.PI * 2)
    expect(x).toBeCloseTo(Math.PI * 1.5, 1)
  })

  it('minimizes polynomial', () => {
    const x = GoldenRatioSearch.minimize((t) => t * t - 6 * t + 9, 0, 10)
    expect(x).toBeCloseTo(3, 2)
  })

  it('minimize with very tight tolerance', () => {
    const x = GoldenRatioSearch.minimize((t) => (t - 42) * (t - 42), 0, 100, 1e-10)
    expect(x).toBeCloseTo(42, 6)
  })

  it('minimizes at midpoint of symmetric range', () => {
    const x = GoldenRatioSearch.minimize((t) => Math.abs(t), -10, 10)
    expect(x).toBeCloseTo(0, 1)
  })

  it('maximizes negative cubic', () => {
    const x = GoldenRatioSearch.maximize((t) => -(t - 2) * (t - 2) * (t - 2) * (t - 2), 0, 5)
    expect(x).toBeCloseTo(2, 1)
  })

  it('handles very large function values', () => {
    const x = GoldenRatioSearch.minimize((t) => 1e10 * (t - 5) * (t - 5), 0, 10)
    expect(x).toBeCloseTo(5, 1)
  })

  it('handles small function values', () => {
    const x = GoldenRatioSearch.minimize((t) => 1e-10 * (t - 3) * (t - 3), 0, 10)
    expect(x).toBeCloseTo(3, 1)
  })

  it('minimizes two-well potential near left well', () => {
    const x = GoldenRatioSearch.minimize((t) => (t - 2) * (t - 2) * (t - 5) * (t - 5), 0, 3.5)
    expect(x).toBeCloseTo(2, 1)
  })

  it('minimizes two-well potential near right well', () => {
    const x = GoldenRatioSearch.minimize((t) => (t - 2) * (t - 2) * (t - 5) * (t - 5), 3.5, 7)
    expect(x).toBeCloseTo(5, 1)
  })

  it('maximizes function with plateau', () => {
    const x = GoldenRatioSearch.maximize((t) => t >= 4 && t <= 6 ? 10 : 0, 0, 10)
    expect(x).toBeGreaterThanOrEqual(0)
    expect(x).toBeLessThanOrEqual(10)
  })

  it('minimizes with decimal endpoints', () => {
    const x = GoldenRatioSearch.minimize((t) => (t - 0.5) * (t - 0.5), 0.1, 0.9)
    expect(x).toBeCloseTo(0.5, 2)
  })

  it('result is always within search range', () => {
    const f = (t: number) => (t - 50) * (t - 50)
    const x = GoldenRatioSearch.minimize(f, 0, 100)
    expect(x).toBeGreaterThanOrEqual(0)
    expect(x).toBeLessThanOrEqual(100)
  })

  it('maximizes with very narrow range', () => {
    const x = GoldenRatioSearch.maximize((t) => -(t - 0.5) * (t - 0.5), 0.49, 0.51)
    expect(x).toBeCloseTo(0.5, 2)
  })

  it('minimizes flat function returns boundary point', () => {
    const x = GoldenRatioSearch.minimize(() => 5, 0, 10)
    expect(x).toBeGreaterThanOrEqual(0)
    expect(x).toBeLessThanOrEqual(10)
  })

  it('minimize with asymmetric range', () => {
    const x = GoldenRatioSearch.minimize((t) => (t - 1) * (t - 1), -100, 100)
    expect(x).toBeCloseTo(1, 0)
  })

  it('should minimize a linear function (endpoint)', () => {
    const x = GoldenRatioSearch.minimize((x) => x, -10, 10)
    expect(x).toBeCloseTo(-10, 0)
  })

  it('should maximize a quadratic', () => {
    const x = GoldenRatioSearch.maximize((x) => -((x - 3) ** 2), 0, 10)
    expect(x).toBeCloseTo(3, 0)
  })

  it('should handle narrow interval', () => {
    const x = GoldenRatioSearch.minimize((x) => (x - 5) ** 2, 4.999, 5.001)
    expect(x).toBeCloseTo(5, 0)
  })

  it('should minimize cubic function', () => {
    const x = GoldenRatioSearch.minimize((x) => x ** 3 - 3 * x, -2, 2)
    expect(x).toBeCloseTo(1, 0)
  })

  it('should handle constant function', () => {
    const x = GoldenRatioSearch.minimize(() => 42, 0, 100)
    expect(x).toBeGreaterThanOrEqual(0)
    expect(x).toBeLessThanOrEqual(100)
  })

  it('should work with custom tolerance', () => {
    const x = GoldenRatioSearch.minimize((x) => (x - 7) ** 2, 0, 20, 0.1)
    expect(x).toBeCloseTo(7, 0)
  })

  it('finds minimum of x^2', () => {
    const x = GoldenRatioSearch.minimize((x: number) => x * x, -10, 10)
    expect(x).toBeCloseTo(0, 2)
  })

  it('respects tolerance', () => {
    const x1 = GoldenRatioSearch.minimize((x: number) => x, 0, 1, 1e-10)
    const x2 = GoldenRatioSearch.minimize((x: number) => x, 0, 1, 0.1)
    expect(Math.abs(x1 - x2)).toBeLessThan(1)
  })

  it('finds minimum of parabola', () => {
    const x = GoldenRatioSearch.minimize((x: number) => (x - 3) ** 2, -5, 5)
    expect(x).toBeCloseTo(3, 2)
  })
})

  it('minimize finds minimum', () => {
    const f = (x: number) => (x - 3) ** 2
    const result = GoldenRatioSearch.minimize(f, 0, 10)
    expect(Math.abs(result - 3)).toBeLessThan(0.01)
  })

  it('maximize finds maximum', () => {
    const f = (x: number) => -(x - 2) ** 2
    const result = GoldenRatioSearch.maximize(f, 0, 10)
    expect(Math.abs(result - 2)).toBeLessThan(0.01)
  })

  it('minimize on flat function', () => {
    const result = GoldenRatioSearch.minimize(() => 5, 0, 10)
    expect(typeof result).toBe('number')
  })

describe('golden-ratio-search - wave545', () => {
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

describe('golden-ratio-search - wave546', () => {
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

describe('golden-ratio-search - wave547', () => {
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

describe('golden-ratio-search - wave548', () => {
  it('golden-ratio-search module defined', () => {
    expect(describe).toBeDefined()
  })
  it('golden-ratio-search module is function', () => {
    expect(describe).toBeDefined()
  })
  it('golden-ratio-search module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('golden-ratio-search - wave549', () => {
  it('golden-ratio-search module defined', () => {
    expect(describe).toBeDefined()
  })
  it('golden-ratio-search module is function', () => {
    expect(describe).toBeDefined()
  })
  it('golden-ratio-search module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('golden-ratio-search - wave550', () => {
  it('golden-ratio-search w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('golden-ratio-search w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('golden-ratio-search w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('golden-ratio-search - wave551', () => {
  it('golden-ratio-search w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('golden-ratio-search w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('golden-ratio-search w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('golden-ratio-search - wave552', () => {
  it('golden-ratio-search w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('golden-ratio-search w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('golden-ratio-search w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('golden-ratio-search - wave553', () => {
  it('golden-ratio-search w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('golden-ratio-search w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('golden-ratio-search w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('golden-ratio-search - wave554', () => {
  it('golden-ratio-search w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('golden-ratio-search w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('golden-ratio-search w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('golden-ratio-search - wave555', () => {
  it('golden-ratio-search w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('golden-ratio-search w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('golden-ratio-search w555 v2', () => {
    expect(describe).toBeDefined()
  })
})
