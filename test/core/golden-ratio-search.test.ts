import { describe, it, expect } from 'vitest'
import { GoldenRatioSearch } from '../../src/core/golden-ratio-search/index.js'

// ─── Constructor ───

describe('GoldenRatioSearch - Constructor', () => {
  it('should create instance with a function and default tolerance', () => {
    const gs = new GoldenRatioSearch((x) => x * x)
    expect(gs.getTolerance()).toBe(1e-8)
  })

  it('should create instance with custom tolerance', () => {
    const gs = new GoldenRatioSearch((x) => x * x, 1e-4)
    expect(gs.getTolerance()).toBe(1e-4)
  })

  it('should accept a constant function', () => {
    const gs = new GoldenRatioSearch(() => 5)
    expect(gs).toBeDefined()
  })

  it('should accept a linear function', () => {
    const gs = new GoldenRatioSearch((x) => 2 * x + 3)
    expect(gs).toBeDefined()
  })
})

// ─── findMinimum ───

describe('GoldenRatioSearch - findMinimum', () => {
  it('should find minimum of a simple parabola x^2', () => {
    const gs = new GoldenRatioSearch((x) => x * x)
    const result = gs.findMinimum(-10, 10)
    expect(result.x).toBeCloseTo(0, 4)
    expect(result.value).toBeCloseTo(0, 4)
  })

  it('should find minimum of (x - 3)^2', () => {
    const gs = new GoldenRatioSearch((x) => (x - 3) ** 2)
    const result = gs.findMinimum(0, 10)
    expect(result.x).toBeCloseTo(3, 4)
    expect(result.value).toBeCloseTo(0, 4)
  })

  it('should find minimum within a narrow range', () => {
    const gs = new GoldenRatioSearch((x) => x * x, 1e-6)
    const result = gs.findMinimum(-1, 1)
    expect(result.x).toBeCloseTo(0, 3)
  })

  it('should handle negative range', () => {
    const gs = new GoldenRatioSearch((x) => (x + 5) ** 2)
    const result = gs.findMinimum(-10, 0)
    expect(result.x).toBeCloseTo(-5, 4)
  })

  it('should return midpoint for constant function', () => {
    const gs = new GoldenRatioSearch(() => 42)
    const result = gs.findMinimum(0, 10)
    expect(result.value).toBe(42)
    expect(result.x).toBeGreaterThanOrEqual(0)
    expect(result.x).toBeLessThanOrEqual(10)
  })

  it('should find minimum of cubic derivative', () => {
    const gs = new GoldenRatioSearch((x) => 3 * x * x - 12 * x + 9)
    const result = gs.findMinimum(0, 10)
    expect(result.x).toBeCloseTo(2, 3)
  })
})

// ─── findMaximum ───

describe('GoldenRatioSearch - findMaximum', () => {
  it('should find maximum of inverted parabola -(x^2)', () => {
    const gs = new GoldenRatioSearch((x) => -(x * x))
    const result = gs.findMaximum(-10, 10)
    expect(result.x).toBeCloseTo(0, 4)
    expect(result.value).toBeCloseTo(0, 4)
  })

  it('should find maximum of -((x - 5)^2) + 10', () => {
    const gs = new GoldenRatioSearch((x) => -((x - 5) ** 2) + 10)
    const result = gs.findMaximum(0, 10)
    expect(result.x).toBeCloseTo(5, 4)
    expect(result.value).toBeCloseTo(10, 3)
  })

  it('should handle narrow range for maximum', () => {
    const gs = new GoldenRatioSearch((x) => -(x * x), 1e-6)
    const result = gs.findMaximum(-1, 1)
    expect(result.x).toBeCloseTo(0, 3)
  })

  it('should return correct value for constant function', () => {
    const gs = new GoldenRatioSearch(() => 7)
    const result = gs.findMaximum(0, 5)
    expect(result.value).toBe(7)
  })
})

// ─── getIterations ───

describe('GoldenRatioSearch - getIterations', () => {
  it('should return zero before any search', () => {
    const gs = new GoldenRatioSearch((x) => x * x)
    expect(gs.getIterations()).toBe(0)
  })

  it('should return positive iteration count after findMinimum', () => {
    const gs = new GoldenRatioSearch((x) => x * x)
    gs.findMinimum(-10, 10)
    expect(gs.getIterations()).toBeGreaterThan(0)
  })

  it('should reset iterations on each search call', () => {
    const gs = new GoldenRatioSearch((x) => x * x)
    gs.findMinimum(-10, 10)
    const firstCount = gs.getIterations()
    gs.findMaximum(-10, 10)
    expect(gs.getIterations()).toBeGreaterThan(0)
  })

  it('should use fewer iterations with larger tolerance', () => {
    const gs1 = new GoldenRatioSearch((x) => x * x, 1e-2)
    const gs2 = new GoldenRatioSearch((x) => x * x, 1e-10)
    gs1.findMinimum(-10, 10)
    gs2.findMinimum(-10, 10)
    expect(gs1.getIterations()).toBeLessThan(gs2.getIterations())
  })
})

// ─── Tolerance ───

describe('GoldenRatioSearch - Tolerance', () => {
  it('should get default tolerance', () => {
    const gs = new GoldenRatioSearch((x) => x)
    expect(gs.getTolerance()).toBe(1e-8)
  })

  it('should set and get new tolerance', () => {
    const gs = new GoldenRatioSearch((x) => x)
    gs.setTolerance(1e-3)
    expect(gs.getTolerance()).toBe(1e-3)
  })

  it('should affect search precision after setTolerance', () => {
    const gs = new GoldenRatioSearch((x) => x * x)
    gs.setTolerance(1e-2)
    gs.findMinimum(-10, 10)
    expect(gs.getIterations()).toBeLessThan(100)
  })
})

// ─── getTimeComplexity ───

describe('GoldenRatioSearch - getTimeComplexity', () => {
  it('should return the complexity string', () => {
    const gs = new GoldenRatioSearch((x) => x)
    expect(gs.getTimeComplexity()).toBe('O(log(1/tolerance))')
  })
})
