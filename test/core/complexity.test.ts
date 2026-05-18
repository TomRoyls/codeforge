import { describe, expect, it } from 'vitest'

import {
  calculateComplexitySummary,
  getComplexityCategory,
} from '../../src/core/complexity.js'
import type { FunctionComplexity } from '../../src/core/complexity.js'

// ─── getComplexityCategory ───

describe('getComplexityCategory', () => {
  it('returns "low" for complexity 1', () => {
    expect(getComplexityCategory(1)).toBe('low')
  })

  it('returns "low" for complexity 5', () => {
    expect(getComplexityCategory(5)).toBe('low')
  })

  it('returns "moderate" for complexity 6', () => {
    expect(getComplexityCategory(6)).toBe('moderate')
  })

  it('returns "moderate" for complexity 10', () => {
    expect(getComplexityCategory(10)).toBe('moderate')
  })

  it('returns "high" for complexity 11', () => {
    expect(getComplexityCategory(11)).toBe('high')
  })

  it('returns "high" for complexity 20', () => {
    expect(getComplexityCategory(20)).toBe('high')
  })

  it('returns "extreme" for complexity 21', () => {
    expect(getComplexityCategory(21)).toBe('extreme')
  })

  it('returns "extreme" for complexity 100', () => {
    expect(getComplexityCategory(100)).toBe('extreme')
  })

  it('returns "low" for complexity 0', () => {
    expect(getComplexityCategory(0)).toBe('low')
  })

  it('returns "low" for negative complexity', () => {
    expect(getComplexityCategory(-1)).toBe('low')
  })
})

// ─── calculateComplexitySummary ───

describe('calculateComplexitySummary', () => {
  function makeFunc(overrides: Partial<FunctionComplexity>): FunctionComplexity {
    return {
      category: 'low',
      cognitive: 1,
      cyclomatic: 1,
      filePath: 'test.ts',
      functionName: 'testFn',
      startLine: 1,
      ...overrides,
    }
  }

  it('returns zeros for empty array', () => {
    const summary = calculateComplexitySummary([])
    expect(summary.totalFunctions).toBe(0)
    expect(summary.averageCyclomatic).toBe(0)
    expect(summary.averageCognitive).toBe(0)
    expect(summary.maxCyclomatic).toBe(0)
    expect(summary.maxCognitive).toBe(0)
    expect(summary.categoryBreakdown).toEqual({ extreme: 0, high: 0, low: 0, moderate: 0 })
  })

  it('computes totalFunctions', () => {
    const fns = [makeFunc({}), makeFunc({}), makeFunc({})]
    expect(calculateComplexitySummary(fns).totalFunctions).toBe(3)
  })

  it('computes averageCyclomatic', () => {
    const fns = [
      makeFunc({ cyclomatic: 2 }),
      makeFunc({ cyclomatic: 4 }),
      makeFunc({ cyclomatic: 6 }),
    ]
    expect(calculateComplexitySummary(fns).averageCyclomatic).toBe(4)
  })

  it('computes averageCognitive', () => {
    const fns = [
      makeFunc({ cognitive: 3 }),
      makeFunc({ cognitive: 7 }),
    ]
    expect(calculateComplexitySummary(fns).averageCognitive).toBe(5)
  })

  it('computes maxCyclomatic', () => {
    const fns = [
      makeFunc({ cyclomatic: 3 }),
      makeFunc({ cyclomatic: 15 }),
      makeFunc({ cyclomatic: 7 }),
    ]
    expect(calculateComplexitySummary(fns).maxCyclomatic).toBe(15)
  })

  it('computes maxCognitive', () => {
    const fns = [
      makeFunc({ cognitive: 5 }),
      makeFunc({ cognitive: 25 }),
    ]
    expect(calculateComplexitySummary(fns).maxCognitive).toBe(25)
  })

  it('computes categoryBreakdown', () => {
    const fns = [
      makeFunc({ category: 'low', cyclomatic: 1 }),
      makeFunc({ category: 'low', cyclomatic: 3 }),
      makeFunc({ category: 'moderate', cyclomatic: 8 }),
      makeFunc({ category: 'high', cyclomatic: 15 }),
      makeFunc({ category: 'extreme', cyclomatic: 30 }),
    ]
    const summary = calculateComplexitySummary(fns)
    expect(summary.categoryBreakdown).toEqual({ extreme: 1, high: 1, low: 2, moderate: 1 })
  })

  it('rounds averages to 2 decimal places', () => {
    const fns = [
      makeFunc({ cyclomatic: 1, cognitive: 1 }),
      makeFunc({ cyclomatic: 2, cognitive: 2 }),
      makeFunc({ cyclomatic: 3, cognitive: 3 }),
    ]
    const summary = calculateComplexitySummary(fns)
    expect(summary.averageCyclomatic).toBe(2)
    expect(summary.averageCognitive).toBe(2)
  })

  it('handles single function', () => {
    const summary = calculateComplexitySummary([makeFunc({ cyclomatic: 5, cognitive: 3 })])
    expect(summary.totalFunctions).toBe(1)
    expect(summary.averageCyclomatic).toBe(5)
    expect(summary.averageCognitive).toBe(3)
    expect(summary.maxCyclomatic).toBe(5)
    expect(summary.maxCognitive).toBe(3)
    expect(summary.categoryBreakdown).toEqual({ extreme: 0, high: 0, low: 1, moderate: 0 })
  })

  it('handles all extreme category', () => {
    const fns = [
      makeFunc({ category: 'extreme', cyclomatic: 50 }),
      makeFunc({ category: 'extreme', cyclomatic: 100 }),
    ]
    const summary = calculateComplexitySummary(fns)
    expect(summary.categoryBreakdown.extreme).toBe(2)
    expect(summary.categoryBreakdown.low).toBe(0)
  })

  it('handles mixed complexity values', () => {
    const fns = [
      makeFunc({ cyclomatic: 1, cognitive: 1 }),
      makeFunc({ cyclomatic: 10, cognitive: 10 }),
      makeFunc({ cyclomatic: 20, cognitive: 20 }),
    ]
    const summary = calculateComplexitySummary(fns)
    expect(summary.averageCyclomatic).toBeCloseTo(10.33, 1)
  })
})
