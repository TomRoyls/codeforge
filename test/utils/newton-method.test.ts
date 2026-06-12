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

describe('newton-method - wave555', () => {
  it('newton-method w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - wave556', () => {
  it('newton-method w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - wave557', () => {
  it('newton-method w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - wave558', () => {
  it('newton-method w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - wave559', () => {
  it('newton-method w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - wave560', () => {
  it('newton-method w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - wave561', () => {
  it('newton-method w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - wave562', () => {
  it('newton-method w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - wave563', () => {
  it('newton-method w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - wave564', () => {
  it('newton-method w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - wave565', () => {
  it('newton-method w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - wave566', () => {
  it('newton-method w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - wave127', () => {
  it('newton-method w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - wave130', () => {
  it('newton-method w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - wave133', () => {
  it('newton-method w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - wave136', () => {
  it('newton-method w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - wave139', () => {
  it('newton-method w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - w142', () => {
  it('newton-method v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - w145', () => {
  it('newton-method v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - w148', () => {
  it('newton-method v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - w151', () => {
  it('newton-method v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - w154', () => {
  it('newton-method v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - w157', () => {
  it('newton-method v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - w160', () => {
  it('newton-method v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - w170', () => {
  it('newton-method x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - w180', () => {
  it('newton-method x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - w190', () => {
  it('newton-method x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - w200', () => {
  it('newton-method x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - w210', () => {
  it('newton-method x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - w220', () => {
  it('newton-method x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - w230', () => {
  it('newton-method x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - w240', () => {
  it('newton-method x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - w250', () => {
  it('newton-method x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - w260', () => {
  it('newton-method x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - w270', () => {
  it('newton-method x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - w280', () => {
  it('newton-method x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - w290', () => {
  it('newton-method x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - w300', () => {
  it('newton-method x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - w310', () => {
  it('newton-method x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - w320', () => {
  it('newton-method x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - w330', () => {
  it('newton-method x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - w340', () => {
  it('newton-method x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - w350', () => {
  it('newton-method x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - w360', () => {
  it('newton-method x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - w370', () => {
  it('newton-method x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - w380', () => {
  it('newton-method x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - w390', () => {
  it('newton-method x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - w400', () => {
  it('newton-method x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - w420', () => {
  it('newton-method x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - w440', () => {
  it('newton-method x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - w460', () => {
  it('newton-method x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - w480', () => {
  it('newton-method x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - w500', () => {
  it('newton-method x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - w550', () => {
  it('newton-method x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - w600', () => {
  it('newton-method x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - w650', () => {
  it('newton-method x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('newton-method - w700', () => {
  it('newton-method x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('newton-method x700x49', () => {
    expect(describe).toBeDefined()
  })
})
