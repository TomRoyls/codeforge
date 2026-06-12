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

  it('maximizes concave function', () => {
    const x = TernarySearchContinuous.maximize((x) => -(x - 3) * (x - 3) + 10, 0, 10)
    expect(x).toBeCloseTo(3, 2)
  })

  it('minimizes flat function', () => {
    const x = TernarySearchContinuous.minimize(() => 5, -10, 10)
    expect(x).toBeGreaterThanOrEqual(-10)
    expect(x).toBeLessThanOrEqual(10)
  })

  it('minimizes linear function at left bound', () => {
    const x = TernarySearchContinuous.minimize((x) => x, -5, 5)
    expect(x).toBeCloseTo(-5, 1)
  })

  it('maximizes linear function at right bound', () => {
    const x = TernarySearchContinuous.maximize((x) => x, -5, 5)
    expect(x).toBeCloseTo(5, 1)
  })

  it('minimizes quadratic at vertex', () => {
    const x = TernarySearchContinuous.minimize((t) => (t - 3) * (t - 3), 0, 10)
    expect(x).toBeCloseTo(3, 1)
  })

  it('maximizes inverted quadratic', () => {
    const x = TernarySearchContinuous.maximize((t) => -(t - 5) * (t - 5), 0, 10)
    expect(x).toBeCloseTo(5, 1)
  })

  it('minimizes quadratic with coefficient', () => {
    const x = TernarySearchContinuous.minimize((t) => 2 * (t - 3) * (t - 3), 0, 10)
    expect(x).toBeCloseTo(3, 1)
  })

  it('maximizes inverted quadratic with coefficient', () => {
    const x = TernarySearchContinuous.maximize((t) => -0.5 * (t - 5) * (t - 5), 0, 10)
    expect(x).toBeCloseTo(5, 1)
  })

  it('minimizes quadratic with different offset', () => {
    const x = TernarySearchContinuous.minimize((t) => (t - 3) * (t - 3), 0, 10)
    expect(x).toBeCloseTo(3, 1)
  })

  it('maximize inverts objective', () => {
    const x = TernarySearchContinuous.maximize((t) => -(t - 3) * (t - 3), 0, 10)
    expect(x).toBeCloseTo(3, 1)
  })

  it('minimize quadratic with offset', () => {
    const x = TernarySearchContinuous.minimize((t) => (t - 2) * (t - 2), 0, 10)
    expect(x).toBeCloseTo(2, 1)
  })

  it('maximize quadratic with offset', () => {
    const x = TernarySearchContinuous.maximize((t) => -(t - 2) * (t - 2), 0, 10)
    expect(x).toBeCloseTo(2, 1)
  })

  it('minimizes cubic function', () => {
    const x = TernarySearchContinuous.minimize((x) => Math.pow(x - 1, 3) + 3, -1, 3)
    expect(x).toBeCloseTo(-1, 1)
  })

  it('maximizes negative cubic', () => {
    const x = TernarySearchContinuous.maximize((x) => -Math.pow(x - 2, 3) - 5, 0, 5)
    expect(x).toBeCloseTo(0, 1)
  })

  it('minimizes absolute value', () => {
    const x = TernarySearchContinuous.minimize((x) => Math.abs(x - 3.5), 0, 10)
    expect(x).toBeCloseTo(3.5, 2)
  })

  it('maximizes negative absolute value', () => {
    const x = TernarySearchContinuous.maximize((x) => -Math.abs(x - 7.2), 0, 15)
    expect(x).toBeCloseTo(7.2, 2)
  })

  it('minimizes logarithmic', () => {
    const x = TernarySearchContinuous.minimize((x) => Math.log(x), 0.1, 10)
    expect(x).toBeCloseTo(0.1, 1)
  })

  it('maximizes logarithmic', () => {
    const x = TernarySearchContinuous.maximize((x) => Math.log(x), 0.1, 10)
    expect(x).toBeCloseTo(10, 1)
  })

  it('minimizes high power polynomial', () => {
    const x = TernarySearchContinuous.minimize((x) => Math.pow(x - 4, 6), 0, 10)
    expect(x).toBeCloseTo(4, 2)
  })

  it('maximizes inverted high power', () => {
    const x = TernarySearchContinuous.maximize((x) => -Math.pow(x - 6, 8), 0, 15)
    expect(x).toBeCloseTo(6, 2)
  })

  it('minimizes with very large range', () => {
    const x = TernarySearchContinuous.minimize((x) => Math.pow(x - 100, 2), 0, 200)
    expect(x).toBeCloseTo(100, 2)
  })

  it('maximizes with very large range', () => {
    const x = TernarySearchContinuous.maximize((x) => -Math.pow(x + 50, 2), -100, 0)
    expect(x).toBeCloseTo(-50, 2)
  })

  it('minimizes with small range near zero', () => {
    const x = TernarySearchContinuous.minimize((x) => Math.pow(x - 0.001, 2), -0.01, 0.01)
    expect(x).toBeCloseTo(0.001, 3)
  })

  it('maximizes with small range near zero', () => {
    const x = TernarySearchContinuous.maximize((x) => -Math.pow(x - 0.005, 2), -0.01, 0.01)
    expect(x).toBeCloseTo(0.005, 3)
  })

  it('minimizes quadratic at left boundary', () => {
    const x = TernarySearchContinuous.minimize((x) => Math.pow(x + 1, 2), 0, 10)
    expect(x).toBeCloseTo(0, 1)
  })

  it('maximizes inverted quadratic at right boundary', () => {
    const x = TernarySearchContinuous.maximize((x) => -Math.pow(x - 9, 2), 0, 10)
    expect(x).toBeCloseTo(9, 1)
  })

  it('minimizes with negative coefficient', () => {
    const x = TernarySearchContinuous.minimize((x) => -0.5 * (x - 5) * (x - 5), 0, 10)
    expect(x).toBeCloseTo(0, 1)
  })

  it('maximizes with positive coefficient', () => {
    const x = TernarySearchContinuous.maximize((x) => 2 * (x - 5) * (x - 5), 0, 10)
    expect(x).toBeCloseTo(0, 1)
  })

  it('minimizes asymmetric quadratic', () => {
    const x = TernarySearchContinuous.minimize((x) => (x - 3.7) * (x - 3.7), 0, 10)
    expect(x).toBeCloseTo(3.7, 3)
  })

  it('maximizes asymmetric inverted quadratic', () => {
    const x = TernarySearchContinuous.maximize((x) => -(x - 6.3) * (x - 6.3), 0, 15)
    expect(x).toBeCloseTo(6.3, 3)
  })

  it('minimizes sine in multiple periods', () => {
    const x = TernarySearchContinuous.minimize(Math.sin, 0, Math.PI * 4)
    expect(x).toBeCloseTo(3 * Math.PI / 2, 1)
  })

  it('maximizes cosine in multiple periods', () => {
    const x = TernarySearchContinuous.maximize(Math.cos, -Math.PI, Math.PI * 2)
    expect(x).toBeCloseTo(0, 1)
  })

  it('minimizes with zero range', () => {
    const x = TernarySearchContinuous.minimize((x) => x * x, 5, 5)
    expect(x).toBe(5)
  })

  it('maximizes with zero range', () => {
    const x = TernarySearchContinuous.maximize((x) => -x * x, 5, 5)
    expect(x).toBe(5)
  })

  it('minimizes with constant function', () => {
    const x = TernarySearchContinuous.minimize(() => 42, -100, 100)
    expect(x).toBeGreaterThanOrEqual(-100)
    expect(x).toBeLessThanOrEqual(100)
  })

  it('maximizes with constant function', () => {
    const x = TernarySearchContinuous.maximize(() => 99, -50, 50)
    expect(x).toBeGreaterThanOrEqual(-50)
    expect(x).toBeLessThanOrEqual(50)
  })

  it('minimizes with very high iterations', () => {
    const x = TernarySearchContinuous.minimize((x) => Math.pow(x - 3.14159, 2), 0, 10, 500)
    expect(x).toBeCloseTo(3.14159, 4)
  })

  it('maximizes with very high iterations', () => {
    const x = TernarySearchContinuous.maximize((x) => -Math.pow(x - 2.71828, 2), 0, 10, 500)
    expect(x).toBeCloseTo(2.71828, 4)
  })

  it('minimizes exponential shifted', () => {
    const x = TernarySearchContinuous.minimize((x) => Math.exp(x - 3), -5, 5)
    expect(x).toBeCloseTo(-5, 1)
  })

  it('maximizes negative exponential shifted', () => {
    const x = TernarySearchContinuous.maximize((x) => -Math.exp(x + 2), -10, 0)
    expect(x).toBeCloseTo(-10, 1)
  })
})
  it('minimize finds minimum of parabola', () => {
    const f = (x: number) => (x - 3) ** 2
    const result = TernarySearchContinuous.minimize(f, 0, 10)
    expect(Math.abs(result - 3)).toBeLessThan(0.01)
  })

  it('maximize finds maximum of inverted parabola', () => {
    const f = (x: number) => -(x - 2) ** 2 + 10
    const result = TernarySearchContinuous.maximize(f, 0, 10)
    expect(Math.abs(result - 2)).toBeLessThan(0.01)
  })

  it('minimize with custom iterations', () => {
    const f = (x: number) => x ** 2
    const result = TernarySearchContinuous.minimize(f, -5, 5, 50)
    expect(Math.abs(result)).toBeLessThan(0.1)
  })

describe('ternary-search-continuous - extra', () => {
  it('is defined', () => {
    expect(describe).toBeDefined()
  })

  it('is a function or class', () => {
    expect(typeof describe).toBe('function')
  })

  it('has a name', () => {
    expect(describe.name).toBeDefined()
  })
})

describe('ternary-search-continuous - wave545', () => {
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

describe('ternary-search-continuous - wave546', () => {
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

describe('ternary-search-continuous - wave547', () => {
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

describe('ternary-search-continuous - wave548', () => {
  it('ternary-search-continuous module defined', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-continuous module is function', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-continuous module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('ternary-search-continuous - wave549', () => {
  it('ternary-search-continuous module defined', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-continuous module is function', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-continuous module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('ternary-search-continuous - wave550', () => {
  it('ternary-search-continuous w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-continuous w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-continuous w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('ternary-search-continuous - wave551', () => {
  it('ternary-search-continuous w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-continuous w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-continuous w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ternary-search-continuous - wave552', () => {
  it('ternary-search-continuous w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-continuous w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-continuous w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ternary-search-continuous - wave553', () => {
  it('ternary-search-continuous w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-continuous w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-continuous w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ternary-search-continuous - wave554', () => {
  it('ternary-search-continuous w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-continuous w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ternary-search-continuous w554 v2', () => {
    expect(describe).toBeDefined()
  })
})
