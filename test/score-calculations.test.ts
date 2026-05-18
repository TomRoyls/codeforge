import { describe, it, expect } from 'vitest'

import {
  calculateCategoryScore,
  calculateCorrectnessScore,
  calculateFileScore,
  calculateOverallScore,
  countDocumentedFunctions,
} from '../src/commands/score-calculations.js'

// ─── calculateCategoryScore ────────────────────────────
describe('calculateCategoryScore', () => {
  it('returns perfect score with zero violations', () => {
    const result = calculateCategoryScore(0, 0.25)
    expect(result.score).toBe(100)
    expect(result.violations).toBe(0)
    expect(result.weight).toBe(0.25)
  })

  it('deducts 5 points per violation', () => {
    const result = calculateCategoryScore(3, 0.3)
    expect(result.score).toBe(85)
    expect(result.violations).toBe(3)
    expect(result.weight).toBe(0.3)
  })

  it('clamps score to 0 for many violations', () => {
    const result = calculateCategoryScore(25, 0.2)
    expect(result.score).toBe(0)
  })

  it('clamps score to 0 exactly at 20 violations', () => {
    const result = calculateCategoryScore(20, 0.5)
    expect(result.score).toBe(0)
  })

  it('returns score of 5 for 19 violations', () => {
    const result = calculateCategoryScore(19, 0.1)
    expect(result.score).toBe(5)
  })

  it('returns score of 50 for 10 violations', () => {
    const result = calculateCategoryScore(10, 1)
    expect(result.score).toBe(50)
  })

  it('preserves weight as-is (even zero)', () => {
    const result = calculateCategoryScore(0, 0)
    expect(result.weight).toBe(0)
  })
})

// ─── calculateCorrectnessScore ──────────────────────────
describe('calculateCorrectnessScore', () => {
  it('returns full coverage score with no violations when all functions documented', () => {
    const result = calculateCorrectnessScore(0, 10, 10, 0.25)
    expect(result.score).toBe(100)
    expect(result.violations).toBe(0)
    expect(result.weight).toBe(0.25)
  })

  it('calculates partial coverage with no violations', () => {
    // 5/10 * 100 = 50 coverage, 0 penalty => 50
    const result = calculateCorrectnessScore(0, 10, 5, 0.3)
    expect(result.score).toBe(50)
  })

  it('applies penalty on top of coverage', () => {
    // coverage = 80%, penalty = 4 * 5 = 20, score = 60
    const result = calculateCorrectnessScore(4, 10, 8, 0.2)
    expect(result.score).toBe(60)
  })

  it('defaults to 50 coverage when totalFunctions is 0', () => {
    const result = calculateCorrectnessScore(0, 0, 0, 0.25)
    expect(result.score).toBe(50)
  })

  it('defaults to 50 coverage minus penalty when totalFunctions is 0', () => {
    // coverage = 50, penalty = 6*5 = 30, score = 20
    const result = calculateCorrectnessScore(6, 0, 0, 0.1)
    expect(result.score).toBe(20)
  })

  it('clamps score to 0 when penalty exceeds coverage', () => {
    // coverage = 10, penalty = 100, score = max(0, -90) = 0
    const result = calculateCorrectnessScore(20, 10, 1, 0.4)
    expect(result.score).toBe(0)
  })

  it('handles single function fully documented', () => {
    const result = calculateCorrectnessScore(0, 1, 1, 0.5)
    expect(result.score).toBe(100)
  })
})

// ─── calculateFileScore ────────────────────────────────
describe('calculateFileScore', () => {
  it('returns 100 for zero violations', () => {
    expect(calculateFileScore(0)).toBe(100)
  })

  it('deducts 3 points per violation', () => {
    expect(calculateFileScore(5)).toBe(85)
  })

  it('clamps score to 0 for many violations', () => {
    expect(calculateFileScore(50)).toBe(0)
  })

  it('returns 1 for 33 violations', () => {
    expect(calculateFileScore(33)).toBe(1)
  })

  it('returns 0 at exactly 34 violations', () => {
    // 100 - 34*3 = 100 - 102 = -2 => max(0, -2) = 0
    expect(calculateFileScore(34)).toBe(0)
  })

  it('returns 97 for one violation', () => {
    expect(calculateFileScore(1)).toBe(97)
  })
})

// ─── calculateOverallScore ─────────────────────────────
describe('calculateOverallScore', () => {
  it('calculates weighted sum of all category scores', () => {
    const categories = {
      complexity: { score: 80, violations: 4, weight: 0.25 },
      correctness: { score: 90, violations: 2, weight: 0.25 },
      patterns: { score: 70, violations: 6, weight: 0.25 },
      security: { score: 85, violations: 3, weight: 0.25 },
    }
    // 80*0.25 + 90*0.25 + 85*0.25 + 70*0.25 = 20+22.5+21.25+17.5 = 81.25 => 81
    expect(calculateOverallScore(categories)).toBe(81)
  })

  it('returns 100 for perfect scores', () => {
    const categories = {
      complexity: { score: 100, violations: 0, weight: 0.25 },
      correctness: { score: 100, violations: 0, weight: 0.25 },
      patterns: { score: 100, violations: 0, weight: 0.25 },
      security: { score: 100, violations: 0, weight: 0.25 },
    }
    expect(calculateOverallScore(categories)).toBe(100)
  })

  it('returns 0 for all zero scores', () => {
    const categories = {
      complexity: { score: 0, violations: 20, weight: 0.25 },
      correctness: { score: 0, violations: 20, weight: 0.25 },
      patterns: { score: 0, violations: 20, weight: 0.25 },
      security: { score: 0, violations: 20, weight: 0.25 },
    }
    expect(calculateOverallScore(categories)).toBe(0)
  })

  it('handles unequal weights', () => {
    const categories = {
      complexity: { score: 100, violations: 0, weight: 0.4 },
      correctness: { score: 50, violations: 10, weight: 0.3 },
      patterns: { score: 60, violations: 8, weight: 0.1 },
      security: { score: 80, violations: 4, weight: 0.2 },
    }
    // 100*0.4 + 50*0.3 + 60*0.1 + 80*0.2 = 40+15+6+16 = 77
    expect(calculateOverallScore(categories)).toBe(77)
  })

  it('rounds the result', () => {
    const categories = {
      complexity: { score: 33, violations: 0, weight: 0.3 },
      correctness: { score: 67, violations: 0, weight: 0.3 },
      patterns: { score: 50, violations: 0, weight: 0.2 },
      security: { score: 90, violations: 0, weight: 0.2 },
    }
    // 33*0.3 + 67*0.3 + 50*0.2 + 90*0.2 = 9.9+20.1+10+18 = 58
    expect(calculateOverallScore(categories)).toBe(58)
  })
})

// ─── countDocumentedFunctions ───────────────────────────
describe('countDocumentedFunctions', () => {
  it('returns 0 for empty array', () => {
    expect(countDocumentedFunctions([])).toBe(0)
  })

  it('counts functions with JSDoc comments', () => {
    const fns = [
      { getJsDocs: () => ['doc1'] },
      { getJsDocs: () => ['doc2', 'doc3'] },
    ]
    expect(countDocumentedFunctions(fns)).toBe(2)
  })

  it('excludes functions without JSDoc comments', () => {
    const fns = [
      { getJsDocs: () => ['doc'] },
      { getJsDocs: () => [] },
      { getJsDocs: () => ['another'] },
    ]
    expect(countDocumentedFunctions(fns)).toBe(2)
  })

  it('returns 0 when no functions have JSDoc', () => {
    const fns = [{ getJsDocs: () => [] }, { getJsDocs: () => [] }]
    expect(countDocumentedFunctions(fns)).toBe(0)
  })

  it('returns count equal to array length when all have JSDoc', () => {
    const fns = [
      { getJsDocs: () => [{ text: 'a' }] },
      { getJsDocs: () => [{ text: 'b' }] },
      { getJsDocs: () => [{ text: 'c' }] },
    ]
    expect(countDocumentedFunctions(fns)).toBe(3)
  })

  it('handles single undocumented function', () => {
    const fns = [{ getJsDocs: () => [] }]
    expect(countDocumentedFunctions(fns)).toBe(0)
  })

  it('handles single documented function', () => {
    const fns = [{ getJsDocs: () => ['jsdoc'] }]
    expect(countDocumentedFunctions(fns)).toBe(1)
  })
})
