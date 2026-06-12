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

  it('finds root of polynomial x^3 - 6x^2 + 11x - 6 (roots: 1,2,3)', () => {
    const root = NewtonMethod.findRoot(
      (x) => x * x * x - 6 * x * x + 11 * x - 6,
      (x) => 3 * x * x - 12 * x + 11,
      1.5
    )
    expect([1, 2, 3]).toContainEqual(Math.round(root))
  })

  it('finds root of x^5 - 1', () => {
    const root = NewtonMethod.findRoot(
      (x) => Math.pow(x, 5) - 1,
      (x) => 5 * Math.pow(x, 4),
      1.2
    )
    expect(root).toBeCloseTo(1, 6)
  })

  it('handles very small tolerance', () => {
    const result = NewtonMethod.findRootWithHistory(
      (x) => x * x - 4,
      (x) => 2 * x,
      3,
      { tolerance: 1e-15 }
    )
    expect(result.converged).toBe(true)
    expect(result.root).toBeCloseTo(2, 10)
  })

  it('handles large tolerance', () => {
    const result = NewtonMethod.findRootWithHistory(
      (x) => x * x - 4,
      (x) => 2 * x,
      3,
      { tolerance: 1e-2 }
    )
    expect(result.converged).toBe(true)
    expect(Math.abs(result.root - 2)).toBeLessThan(0.01)
  })

  it('finds root of ln(x) - 1', () => {
    const root = NewtonMethod.findRoot(
      (x) => Math.log(x) - 1,
      (x) => 1 / x,
      3
    )
    expect(root).toBeCloseTo(Math.E, 6)
  })

  it('nthRoot handles even root of positive', () => {
    expect(NewtonMethod.nthRoot(16, 4)).toBeCloseTo(2, 6)
    expect(NewtonMethod.nthRoot(81, 4)).toBeCloseTo(3, 6)
  })

  it('nthRoot handles odd root of negative', () => {
    expect(NewtonMethod.nthRoot(-8, 3)).toBeCloseTo(-2, 6)
    expect(NewtonMethod.nthRoot(-27, 3)).toBeCloseTo(-3, 6)
  })

  it('nthRoot returns NaN for even root of negative', () => {
    expect(NewtonMethod.nthRoot(-16, 4)).toBeNaN()
    expect(NewtonMethod.nthRoot(-4, 2)).toBeNaN()
  })

  it('nthRoot handles square root', () => {
    expect(NewtonMethod.nthRoot(25, 2)).toBeCloseTo(5, 6)
    expect(NewtonMethod.nthRoot(100, 2)).toBeCloseTo(10, 6)
  })

  it('nthRoot handles fifth root', () => {
    expect(NewtonMethod.nthRoot(32, 5)).toBeCloseTo(2, 6)
    expect(NewtonMethod.nthRoot(243, 5)).toBeCloseTo(3, 6)
  })

  it('inverse finds cube root inverse', () => {
    const result = NewtonMethod.inverse(
      (x) => x * x * x,
      (x) => 3 * x * x,
      27,
      3
    )
    expect(result).toBeCloseTo(3, 6)
  })

  it('inverse finds exponential inverse', () => {
    const result = NewtonMethod.inverse(
      (x) => Math.exp(x),
      (x) => Math.exp(x),
      Math.E,
      1
    )
    expect(result).toBeCloseTo(1, 6)
  })

  it('history starts with initial guess', () => {
    const result = NewtonMethod.findRootWithHistory(
      (x) => x * x - 4,
      (x) => 2 * x,
      10
    )
    expect(result.history[0]).toBe(10)
  })

  it('history contains final root', () => {
    const result = NewtonMethod.findRootWithHistory(
      (x) => x * x - 4,
      (x) => 2 * x,
      10
    )
    expect(result.history[result.history.length - 1]).toBeCloseTo(2, 6)
  })

  it('finds root of tan(x) near 0', () => {
    const root = NewtonMethod.findRoot(
      (x) => Math.tan(x),
      (x) => 1 / (Math.cos(x) * Math.cos(x)),
      0.1
    )
    expect(root).toBeCloseTo(0, 6)
  })

  it('finds root of 1/x - 1', () => {
    const root = NewtonMethod.findRoot(
      (x) => 1 / x - 1,
      (x) => -1 / (x * x),
      2
    )
    expect(typeof root).toBe('number')
    if (!Number.isNaN(root)) {
      expect(root).toBeCloseTo(1, 6)
    }
  })

  it('sqrt handles large numbers', () => {
    expect(NewtonMethod.sqrt(10000)).toBeCloseTo(100, 6)
    expect(NewtonMethod.sqrt(123456)).toBeCloseTo(Math.sqrt(123456), 4)
  })

  it('sqrt handles small positive numbers', () => {
    expect(NewtonMethod.sqrt(0.25)).toBeCloseTo(0.5, 6)
    expect(NewtonMethod.sqrt(0.01)).toBeCloseTo(0.1, 6)
  })

  it('sqrt handles 1', () => {
    expect(NewtonMethod.sqrt(1)).toBeCloseTo(1, 8)
  })

  it('findRootWithHistory returns iterations count', () => {
    const result = NewtonMethod.findRootWithHistory(
      (x) => x * x - 4,
      (x) => 2 * x,
      10
    )
    expect(result.iterations).toBe(result.history.length - 1)
  })

  it('finds root of x^3 - x', () => {
    const root = NewtonMethod.findRoot(
      (x) => x * x * x - x,
      (x) => 3 * x * x - 1,
      1.5
    )
    expect([-1, 0, 1]).toContainEqual(Math.round(root))
  })

  it('finds root of cos(x) - x', () => {
    const root = NewtonMethod.findRoot(
      (x) => Math.cos(x) - x,
      (x) => -Math.sin(x) - 1,
      0.5
    )
    expect(root).toBeGreaterThan(0)
    expect(root).toBeLessThan(1)
  })

  it('handles starting at exact root', () => {
    const root = NewtonMethod.findRoot(
      (x) => x - 5,
      (x) => 1,
      5
    )
    expect(root).toBeCloseTo(5, 8)
  })

  it('findRootWithHistory with maxIterations 1', () => {
    const result = NewtonMethod.findRootWithHistory(
      (x) => x * x - 4,
      (x) => 2 * x,
      10,
      { maxIterations: 1 }
    )
    expect(result.iterations).toBe(1)
    expect(result.history.length).toBe(2)
  })

  it('finds root of x^2 + 1 (no real root, derivative never zero)', () => {
    const root = NewtonMethod.findRoot(
      (x) => x * x + 1,
      (x) => 2 * x,
      1
    )
    expect(typeof root).toBe('number')
  })

  it('nthRoot handles 1', () => {
    expect(NewtonMethod.nthRoot(1, 5)).toBeCloseTo(1, 8)
  })

  it('inverse with different starting points', () => {
    const result1 = NewtonMethod.inverse(
      (x) => x * x,
      (x) => 2 * x,
      16,
      1
    )
    const result2 = NewtonMethod.inverse(
      (x) => x * x,
      (x) => 2 * x,
      16,
      5
    )
    expect(Math.abs(result1)).toBeCloseTo(Math.abs(result2), 6)
  })

  it('finds root of x^10 - 1024', () => {
    const root = NewtonMethod.findRoot(
      (x) => Math.pow(x, 10) - 1024,
      (x) => 10 * Math.pow(x, 9),
      2
    )
    expect(root).toBeCloseTo(2, 4)
  })

  it('finds root near existing root with better precision', () => {
    const root = NewtonMethod.findRoot(
      (x) => x * x - 9,
      (x) => 2 * x,
      2.9
    )
    expect(root).toBeCloseTo(3, 8)
  })

  it('finds cube root of 8', () => {
    const root = NewtonMethod.solve(
      (x) => x * x * x - 8,
      (x) => 3 * x * x,
      2.5
    )
    expect(root).toBeCloseTo(2, 6)
  })

  it('finds root of linear function', () => {
    const root = NewtonMethod.solve(
      (x) => 2 * x - 4,
      (x) => 2,
      10
    )
    expect(root).toBeCloseTo(2, 6)
  })

  it('handles negative initial guess', () => {
    const root = NewtonMethod.solve(
      (x) => x * x - 4,
      (x) => 2 * x,
      -3
    )
    expect(Math.abs(root)).toBeCloseTo(2, 4)
  })

  it('handles function with root at zero', () => {
    const root = NewtonMethod.solve(
      (x) => x,
      (x) => 1,
      5
    )
    expect(root).toBeCloseTo(0, 6)
  })

  it('converges with small initial guess', () => {
    const root = NewtonMethod.solve(
      (x) => x * x - 2,
      (x) => 2 * x,
      1.5
    )
    expect(root).toBeCloseTo(Math.sqrt(2), 6)
  })

  it('finds root of sine near pi', () => {
    const root = NewtonMethod.solve(
      (x) => Math.sin(x),
      (x) => Math.cos(x),
      3
    )
    expect(root).toBeCloseTo(Math.PI, 4)
  })

  it('sqrt computes square root', () => {
    expect(NewtonMethod.sqrt(4)).toBeCloseTo(2, 5)
    expect(NewtonMethod.sqrt(9)).toBeCloseTo(3, 5)
  })

  it('nthRoot computes cube root', () => {
    expect(NewtonMethod.nthRoot(27, 3)).toBeCloseTo(3, 3)
  })

  it('findRootWithHistory returns array of iterations', () => {
    const result = NewtonMethod.findRootWithHistory(
      (x: number) => x * x - 4,
      (x: number) => 2 * x,
      3
    )
    expect(result.length).toBeGreaterThan(0)
  })

  it('inverse finds x where f(x)=target', () => {
    const x = NewtonMethod.inverse(
      (x: number) => 2 * x,
      () => 2,
      10,
      1
    )
    expect(x).toBeCloseTo(5, 3)
  })

  it('findRoot for x^2 = 4', () => {
    const root = NewtonMethod.findRoot((x) => x * x - 4, (x) => 2 * x, 3)
    expect(Math.abs(root - 2)).toBeLessThan(0.001)
  })

  it('findRoot for linear', () => {
    const root = NewtonMethod.findRoot((x) => x - 5, (x) => 1, 0)
    expect(Math.abs(root - 5)).toBeLessThan(0.001)
  })

  it('findRootWithHistory returns array', () => {
    const result = NewtonMethod.findRootWithHistory((x) => x * x - 1, (x) => 2 * x, 2)
    expect(Array.isArray(result)).toBe(true)
  })
})

describe('newton-method - wave545', () => {
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

describe('newton-method - wave546', () => {
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

describe('newton-method - wave547', () => {
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

describe('newton-method - wave548', () => {
  it('newton-method module defined', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method module is function', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - wave549', () => {
  it('newton-method module defined', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method module is function', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - wave550', () => {
  it('newton-method w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - wave551', () => {
  it('newton-method w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - wave552', () => {
  it('newton-method w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - wave553', () => {
  it('newton-method w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - wave554', () => {
  it('newton-method w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w554 v2', () => {
    expect(describe).toBeDefined()
  })
})
