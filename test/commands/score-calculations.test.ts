import { describe, expect, it } from 'vitest'

import {
  calculateCategoryScore,
  calculateCorrectnessScore,
  calculateFileScore,
  calculateOverallScore,
  countDocumentedFunctions,
} from '../../src/commands/score-calculations.js'

// ─── calculateCategoryScore ───

describe('calculateCategoryScore', () => {
  it('returns 100 for zero violations', () => {
    const result = calculateCategoryScore(0, 0.3)
    expect(result.score).toBe(100)
    expect(result.violations).toBe(0)
    expect(result.weight).toBe(0.3)
  })

  it('deducts 5 per violation', () => {
    const result = calculateCategoryScore(4, 0.3)
    expect(result.score).toBe(80)
  })

  it('clamps to 0 minimum', () => {
    const result = calculateCategoryScore(30, 0.3)
    expect(result.score).toBe(0)
  })
})

// ─── calculateCorrectnessScore ───

describe('calculateCorrectnessScore', () => {
  it('returns coverage minus penalty', () => {
    const result = calculateCorrectnessScore(2, 100, 80, 0.25)
    expect(result.score).toBe(70)
  })

  it('uses 50% coverage when no functions', () => {
    const result = calculateCorrectnessScore(0, 0, 0, 0.25)
    expect(result.score).toBe(50)
  })

  it('clamps to 0', () => {
    const result = calculateCorrectnessScore(30, 10, 5, 0.25)
    expect(result.score).toBe(0)
  })

  it('returns 100 for full documentation with no violations', () => {
    const result = calculateCorrectnessScore(0, 10, 10, 0.25)
    expect(result.score).toBe(100)
  })
})

// ─── calculateFileScore ───

describe('calculateFileScore', () => {
  it('returns 100 for no violations', () => {
    expect(calculateFileScore(0)).toBe(100)
  })

  it('deducts 3 per violation', () => {
    expect(calculateFileScore(5)).toBe(85)
  })

  it('clamps to 0', () => {
    expect(calculateFileScore(50)).toBe(0)
  })
})

// ─── calculateOverallScore ───

describe('calculateOverallScore', () => {
  it('computes weighted sum of category scores', () => {
    const result = calculateOverallScore({
      complexity: { score: 80, violations: 4, weight: 0.3 },
      correctness: { score: 90, violations: 2, weight: 0.25 },
      patterns: { score: 95, violations: 1, weight: 0.15 },
      security: { score: 100, violations: 0, weight: 0.3 },
    })
    expect(result).toBe(Math.round(80 * 0.3 + 90 * 0.25 + 95 * 0.15 + 100 * 0.3))
  })

  it('returns 100 for perfect scores', () => {
    const result = calculateOverallScore({
      complexity: { score: 100, violations: 0, weight: 0.3 },
      correctness: { score: 100, violations: 0, weight: 0.25 },
      patterns: { score: 100, violations: 0, weight: 0.15 },
      security: { score: 100, violations: 0, weight: 0.3 },
    })
    expect(result).toBe(100)
  })
})

// ─── countDocumentedFunctions ───

describe('countDocumentedFunctions', () => {
  it('counts functions with JSDocs', () => {
    const fns = [
      { getJsDocs: () => ['doc1'] },
      { getJsDocs: () => [] },
      { getJsDocs: () => ['doc2', 'doc3'] },
    ]
    expect(countDocumentedFunctions(fns as any)).toBe(2)
  })

  it('returns 0 for empty array', () => {
    expect(countDocumentedFunctions([])).toBe(0)
  })

  it('returns 0 when none documented', () => {
    const fns = [{ getJsDocs: () => [] }, { getJsDocs: () => [] }]
    expect(countDocumentedFunctions(fns as any)).toBe(0)
  })
})
