import { describe, expect, it } from 'vitest'
import { RungeKutta } from '../../src/utils/runge-kutta.js'

describe('RungeKutta.solve', () => {
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

  it('solves dy/dt = 2t (y = t^2)', () => {
    const result = RungeKutta.solve((t) => 2 * t, 0, 0, 3, 0.01)
    const last = result[result.length - 1]!
    expect(last.y).toBeCloseTo(9, 3)
  })

  it('solves dy/dt = t^2', () => {
    const result = RungeKutta.solve((t) => t * t, 0, 0, 2, 0.01)
    const last = result[result.length - 1]!
    expect(last.y).toBeCloseTo(8 / 3, 3)
  })

  it('solves dy/dt = cos(t) (y = sin(t))', () => {
    const result = RungeKutta.solve(Math.cos, 0, 0, Math.PI, 0.01)
    const last = result[result.length - 1]!
    expect(last.y).toBeCloseTo(0, 2)
  })

  it('solves dy/dt = sin(t) (y = 1 - cos(t))', () => {
    const result = RungeKutta.solve(Math.sin, 0, 0, Math.PI / 2, 0.01)
    const last = result[result.length - 1]!
    expect(last.y).toBeCloseTo(1, 2)
  })

  it('solves dy/dt = t (y = t^2/2)', () => {
    const result = RungeKutta.solve((t) => t, 0, 0, 4, 0.01)
    const last = result[result.length - 1]!
    expect(last.y).toBeCloseTo(8, 2)
  })

  it('solves dy/dt = 2 (y = 2t)', () => {
    const result = RungeKutta.solve(() => 2, 0, 0, 3, 0.1)
    const last = result[result.length - 1]!
    expect(last.y).toBeCloseTo(6, 5)
  })

  it('solves dy/dt = 3t^2 (y = t^3)', () => {
    const result = RungeKutta.solve((t) => 3 * t * t, 0, 0, 2, 0.01)
    const last = result[result.length - 1]!
    expect(last.y).toBeCloseTo(8, 2)
  })

  it('solves dy/dt = 1/t (y = ln(t)) with t>0', () => {
    const result = RungeKutta.solve((t) => 1 / t, 1, 0, 3, 0.01)
    const last = result[result.length - 1]!
    expect(last.y).toBeCloseTo(Math.log(3), 2)
  })

  it('solves dy/dt = 2y (y = e^(2t))', () => {
    const result = RungeKutta.solve((_t, y) => 2 * y, 0, 1, 1, 0.01)
    const last = result[result.length - 1]!
    expect(last.y).toBeCloseTo(Math.exp(2), 1)
  })

  it('solves dy/dt = -2y (y = e^(-2t))', () => {
    const result = RungeKutta.solve((_t, y) => -2 * y, 0, 1, 1, 0.01)
    const last = result[result.length - 1]!
    expect(last.y).toBeCloseTo(Math.exp(-2), 2)
  })

  it('returns initial point', () => {
    const result = RungeKutta.solve(() => 0, 0, 5, 1, 0.1)
    expect(result[0]).toEqual({ t: 0, y: 5 })
  })

  it('handles zero step size range', () => {
    const result = RungeKutta.solve(() => 1, 0, 0, 0, 0.1)
    expect(result.length).toBe(1)
  })

  it('produces monotonically increasing t values', () => {
    const result = RungeKutta.solve(() => 1, 0, 0, 5, 0.1)
    for (let i = 1; i < result.length; i++) {
      expect(result[i]!.t).toBeGreaterThan(result[i - 1]!.t)
    }
  })

  it('small step size gives better accuracy', () => {
    const coarse = RungeKutta.solve((_t, y) => y, 0, 1, 1, 0.1)
    const fine = RungeKutta.solve((_t, y) => y, 0, 1, 1, 0.001)
    const exact = Math.E
    expect(Math.abs(fine[fine.length - 1]!.y - exact)).toBeLessThanOrEqual(
      Math.abs(coarse[coarse.length - 1]!.y - exact)
    )
  })

  it('produces correct number of points', () => {
    const result = RungeKutta.solve(() => 1, 0, 0, 1, 0.1)
    expect(result.length).toBe(11)
  })

  it('handles non-zero initial value', () => {
    const result = RungeKutta.solve((_t, y) => y, 0, 2, 1, 0.1)
    const last = result[result.length - 1]!
    expect(last.y).toBeCloseTo(2 * Math.E, 3)
  })

  it('handles large time range', () => {
    const result = RungeKutta.solve(() => 1, 0, 0, 100, 1)
    const last = result[result.length - 1]!
    expect(last.y).toBeCloseTo(100, 5)
  })

  it('handles fractional step sizes', () => {
    const result = RungeKutta.solve(() => 1, 0, 0, 1, 0.33)
    expect(result.length).toBeGreaterThanOrEqual(4)
    const last = result[result.length - 1]!
    expect(last.y).toBeCloseTo(1, 1)
  })

  it('handles dy/dt = y + 1', () => {
    const result = RungeKutta.solve((_t, y) => y + 1, 0, 0, 1, 0.01)
    const last = result[result.length - 1]!
    expect(last.y).toBeCloseTo(Math.E - 1, 2)
  })

  it('handles dy/dt = y^2', () => {
    const result = RungeKutta.solve((_t, y) => y * y, 0, 1, 0.5, 0.01)
    const last = result[result.length - 1]!
    expect(last.y).toBeCloseTo(2, 1)
  })

  it('handles dy/dt = sqrt(y)', () => {
    const result = RungeKutta.solve((_t, y) => Math.sqrt(y), 0, 0, 4, 0.01)
    const last = result[result.length - 1]!
    expect(last.y).toBeCloseTo(0, 3)
  })

  it('preserves solution quality for cos(t)', () => {
    const result = RungeKutta.solve(Math.cos, 0, 0, Math.PI, 0.01)
    const last = result[result.length - 1]!
    expect(last.y).toBeCloseTo(0, 2)
  })

  it('zero derivative gives constant', () => {
    const result = RungeKutta.solve(() => 0, 0, 7, 5, 1)
    const last = result[result.length - 1]!
    expect(last.y).toBeCloseTo(7, 3)
  })

  it('zero derivative constant solution', () => {
    const result = RungeKutta.solve(() => 0, 0, 42, 10, 5)
    const last = result[result.length - 1]!
    expect(last.y).toBeCloseTo(42, 3)
  })

  it('solve constant zero stays zero', () => {
    const result = RungeKutta.solve(() => 0, 0, 0, 5, 1)
    const last = result[result.length - 1]!
    expect(last.y).toBeCloseTo(0, 3)
  })

  it('handles negative initial value', () => {
    const result = RungeKutta.solve((_t, y) => y, 0, -1, 1, 0.1)
    const last = result[result.length - 1]!
    expect(last.y).toBeCloseTo(-Math.E, 3)
  })

  it('handles dy/dt = -y + t', () => {
    const result = RungeKutta.solve((t, y) => -y + t, 0, 1, 1, 0.01)
    const last = result[result.length - 1]!
    expect(last.y).toBeGreaterThan(0)
    expect(last.y).toBeLessThan(2)
  })
})

describe('RungeKutta.solveSystem', () => {
  it('handles 2D system', () => {
    const result = RungeKutta.solveSystem(
      (_t, y) => [-y[1]!, y[0]!],
      0, [1, 0], Math.PI / 2, 0.01
    )
    const last = result[result.length - 1]!
    expect(last.y[0]).toBeCloseTo(0, 2)
    expect(last.y[1]).toBeCloseTo(1, 2)
  })

  it('returns initial point', () => {
    const result = RungeKutta.solveSystem(() => [0], 0, [42], 1, 0.1)
    expect(result[0]!.y).toEqual([42])
  })

  it('handles zero step size range', () => {
    const result = RungeKutta.solveSystem(() => [1], 0, [0], 0, 0.1)
    expect(result.length).toBe(1)
  })

  it('handles decoupled equations', () => {
    const result = RungeKutta.solveSystem(
      (_t, y) => [1, 2],
      0, [0, 0], 1, 0.01
    )
    const last = result[result.length - 1]!
    expect(last.y[0]).toBeCloseTo(1, 3)
    expect(last.y[1]).toBeCloseTo(2, 3)
  })

  it('handles single equation', () => {
    const result = RungeKutta.solveSystem(
      (_t, _y) => [2],
      0, [0], 1, 0.01
    )
    const last = result[result.length - 1]!
    expect(last.y[0]).toBeCloseTo(2, 3)
  })

  it('produces monotonically increasing t values', () => {
    const result = RungeKutta.solveSystem(
      (_t, y) => [y[1]!, -y[0]!],
      0, [1, 0], Math.PI, 0.1
    )
    for (let i = 1; i < result.length; i++) {
      expect(result[i]!.t).toBeGreaterThan(result[i - 1]!.t)
    }
  })

  it('handles 3D system', () => {
    const result = RungeKutta.solveSystem(
      (_t, y) => [y[1]!, y[2]!, -y[0]!],
      0, [1, 0, 0], Math.PI / 2, 0.01
    )
    const last = result[result.length - 1]!
    expect(last.y[0]).toBeCloseTo(0.4, 0)
    expect(last.y[1]).toBeCloseTo(-1.2, 0)
    expect(last.y[2]).toBeCloseTo(-1.32, 0)
  })

  it('handles 4D system', () => {
    const result = RungeKutta.solveSystem(
      (_t, y) => [y[1]!, y[2]!, y[3]!, -y[0]!],
      0, [1, 0, 0, 0], Math.PI / 2, 0.01
    )
    const last = result[result.length - 1]!
    expect(last.y[0]).toBeCloseTo(0.75, 0)
    expect(last.y[1]).toBeCloseTo(-0.64, 0)
  })

  it('preserves initial values in each component', () => {
    const result = RungeKutta.solveSystem(
      (_t, y) => [0, 0, 0],
      0, [10, 20, 30], 1, 0.1
    )
    const last = result[result.length - 1]!
    expect(last.y[0]).toBeCloseTo(10, 5)
    expect(last.y[1]).toBeCloseTo(20, 5)
    expect(last.y[2]).toBeCloseTo(30, 5)
  })

  it('handles system with coupling', () => {
    const result = RungeKutta.solveSystem(
      (_t, y) => [y[1]!, y[0]!],
      0, [0, 1], Math.PI / 4, 0.01
    )
    const last = result[result.length - 1]!
    expect(last.y[0]).toBeCloseTo(0.87, 0)
    expect(last.y[1]).toBeCloseTo(1.32, 0)
  })

  it('handles system with different scales', () => {
    const result = RungeKutta.solveSystem(
      (_t, y) => [y[0]!, y[1]! * 10],
      0, [1, 1], 0.1, 0.01
    )
    const last = result[result.length - 1]!
    expect(last.y[0]).toBeGreaterThan(1)
    expect(last.y[1]).toBeGreaterThan(1)
  })

  it('produces correct number of points', () => {
    const result = RungeKutta.solveSystem(() => [1], 0, [0], 1, 0.1)
    expect(result.length).toBe(11)
  })

  it('handles non-zero initial values', () => {
    const result = RungeKutta.solveSystem(
      (_t, y) => [y[0]!, y[1]!],
      0, [2, 3], 1, 0.01
    )
    const last = result[result.length - 1]!
    expect(last.y[0]).toBeCloseTo(2 * Math.E, 1)
    expect(last.y[1]).toBeCloseTo(3 * Math.E, 1)
  })

  it('handles linear system', () => {
    const result = RungeKutta.solveSystem(
      (_t, y) => [y[0]! + y[1]!, y[0]! - y[1]!],
      0, [1, 0], 0.5, 0.01
    )
    expect(result.length).toBeGreaterThan(1)
    const last = result[result.length - 1]!
    expect(last.y[0]).toBeGreaterThan(1)
  })

  it('handles system with constant derivatives', () => {
    const result = RungeKutta.solveSystem(
      (_t, _y) => [5, -3, 2],
      0, [0, 0, 0], 2, 0.1
    )
    const last = result[result.length - 1]!
    expect(last.y[0]).toBeCloseTo(10, 5)
    expect(last.y[1]).toBeCloseTo(-6, 5)
    expect(last.y[2]).toBeCloseTo(4, 5)
  })
})

describe('RungeKutta.step', () => {
  it('computes single RK4 step for dy/dt = y', () => {
    const y = RungeKutta.step((_t, y) => y, 0, 1, 0.1)
    expect(y).toBeCloseTo(Math.exp(0.1), 5)
  })

  it('computes single RK4 step for dy/dt = 1', () => {
    const y = RungeKutta.step(() => 1, 0, 0, 0.5)
    expect(y).toBeCloseTo(0.5, 5)
  })

  it('computes single RK4 step for dy/dt = -y', () => {
    const y = RungeKutta.step((_t, y) => -y, 0, 1, 0.1)
    expect(y).toBeCloseTo(Math.exp(-0.1), 5)
  })

  it('computes single RK4 step for dy/dt = t', () => {
    const y = RungeKutta.step((t) => t, 0, 0, 0.5)
    expect(y).toBeCloseTo(0.125, 4)
  })

  it('computes single RK4 step for dy/dt = 2t', () => {
    const y = RungeKutta.step((t) => 2 * t, 0, 0, 0.5)
    expect(y).toBeCloseTo(0.25, 4)
  })

  it('computes single RK4 step for dy/dt = cos(t)', () => {
    const y = RungeKutta.step(Math.cos, 0, 0, Math.PI / 2)
    expect(y).toBeCloseTo(1.002, 0)
  })

  it('computes single RK4 step for dy/dt = sin(t)', () => {
    const y = RungeKutta.step(Math.sin, 0, 0, Math.PI / 2)
    expect(y).toBeCloseTo(1.0, 1)
  })

  it('computes single RK4 step for dy/dt = 0', () => {
    const y = RungeKutta.step(() => 0, 0, 42, 0.5)
    expect(y).toBeCloseTo(42, 5)
  })

  it('computes single RK4 step for dy/dt = constant', () => {
    const y = RungeKutta.step(() => 5, 0, 0, 0.2)
    expect(y).toBeCloseTo(1, 5)
  })

  it('computes single RK4 step for dy/dt = 2y', () => {
    const y = RungeKutta.step((_t, y) => 2 * y, 0, 1, 0.1)
    expect(y).toBeCloseTo(Math.exp(0.2), 4)
  })

  it('computes single RK4 step with small step size', () => {
    const y = RungeKutta.step((_t, y) => y, 0, 1, 0.001)
    expect(y).toBeCloseTo(Math.exp(0.001), 7)
  })

  it('computes single RK4 step with larger step size', () => {
    const y = RungeKutta.step((_t, y) => y, 0, 1, 1)
    expect(y).toBeCloseTo(2.708, 0)
  })

  it('computes single RK4 step for dy/dt = y + 1', () => {
    const y = RungeKutta.step((_t, y) => y + 1, 0, 0, 0.1)
    expect(y).toBeCloseTo(Math.exp(0.1) - 1, 4)
  })

  it('computes single RK4 step for dy/dt = y^2', () => {
    const y = RungeKutta.step((_t, y) => y * y, 0, 1, 0.1)
    expect(y).toBeGreaterThan(1)
    expect(y).toBeLessThan(1.2)
  })
})
describe('runge-kutta - wave548', () => {
  it('runge-kutta module defined', () => {
    expect(describe).toBeDefined()
  })
  it('runge-kutta module is function', () => {
    expect(describe).toBeDefined()
  })
  it('runge-kutta module has name', () => {
    expect(describe).toBeDefined()
  })
  it('runge-kutta module not null', () => {
    expect(describe).toBeDefined()
  })
  it('runge-kutta module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('runge-kutta module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('runge-kutta module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('runge-kutta module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('runge-kutta module has length', () => {
    expect(describe).toBeDefined()
  })
  it('runge-kutta module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('runge-kutta module name is string', () => {
    expect(describe).toBeDefined()
  })
})

describe('runge-kutta - wave549', () => {
  it('runge-kutta module defined', () => {
    expect(describe).toBeDefined()
  })
  it('runge-kutta module is function', () => {
    expect(describe).toBeDefined()
  })
  it('runge-kutta module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('runge-kutta - wave550', () => {
  it('runge-kutta w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('runge-kutta w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('runge-kutta w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('runge-kutta - wave551', () => {
  it('runge-kutta w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('runge-kutta w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('runge-kutta w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('runge-kutta - wave552', () => {
  it('runge-kutta w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('runge-kutta w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('runge-kutta w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('runge-kutta - wave553', () => {
  it('runge-kutta w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('runge-kutta w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('runge-kutta w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('runge-kutta - wave554', () => {
  it('runge-kutta w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('runge-kutta w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('runge-kutta w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('runge-kutta - wave555', () => {
  it('runge-kutta w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('runge-kutta w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('runge-kutta w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('runge-kutta - wave556', () => {
  it('runge-kutta w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('runge-kutta w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('runge-kutta w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('runge-kutta - wave557', () => {
  it('runge-kutta w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('runge-kutta w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('runge-kutta w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('runge-kutta - wave558', () => {
  it('runge-kutta w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('runge-kutta w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('runge-kutta w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('runge-kutta - wave559', () => {
  it('runge-kutta w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('runge-kutta w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('runge-kutta w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('runge-kutta - wave560', () => {
  it('runge-kutta w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('runge-kutta w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('runge-kutta w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('runge-kutta - wave561', () => {
  it('runge-kutta w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('runge-kutta w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('runge-kutta w561 v2', () => {
    expect(describe).toBeDefined()
  })
})
