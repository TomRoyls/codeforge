import { describe, it, expect } from 'vitest'

import Score from '../src/commands/score.js'
import {
  calculateCategoryScore,
  calculateCorrectnessScore,
  calculateFileScore,
  calculateOverallScore,
  countDocumentedFunctions,
} from '../src/commands/score-calculations.js'

// ─── Static metadata ────────────────────────────────────
describe('Score command - static metadata', () => {
  it('has a description', () => {
    expect(Score.description).toBe('Calculate aggregate quality score for the codebase')
  })

  it('has examples array', () => {
    expect(Array.isArray(Score.examples)).toBe(true)
    expect(Score.examples.length).toBeGreaterThanOrEqual(3)
  })

  it('has path arg with default "."', () => {
    expect(Score.args.path).toBeDefined()
    expect(Score.args.path.default).toBe('.')
  })

  it('has json and verbose flags', () => {
    expect(Score.flags.json).toBeDefined()
    expect(Score.flags.verbose).toBeDefined()
    expect(Score.flags.verbose.char).toBe('v')
  })
})

// ─── Class structure ─────────────────────────────────────
describe('Score command - class structure', () => {
  it('exports a default class', () => {
    expect(Score).toBeDefined()
    expect(typeof Score).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Score.prototype.run).toBe('function')
  })
})

// ─── calculateCategoryScore ──────────────────────────────
describe('Score command - calculateCategoryScore', () => {
  it('returns 100 for zero violations', () => {
    const result = calculateCategoryScore(0, 0.3)
    expect(result.score).toBe(100)
    expect(result.violations).toBe(0)
    expect(result.weight).toBe(0.3)
  })

  it('deducts 5 points per violation', () => {
    const result = calculateCategoryScore(4, 0.3)
    expect(result.score).toBe(80)
  })

  it('clamps score to 0 minimum', () => {
    const result = calculateCategoryScore(50, 0.3)
    expect(result.score).toBe(0)
  })
})

// ─── calculateCorrectnessScore ───────────────────────────
describe('Score command - calculateCorrectnessScore', () => {
  it('returns 50 coverage when no functions exist', () => {
    const result = calculateCorrectnessScore(0, 0, 0, 0.25)
    expect(result.score).toBe(50)
  })

  it('calculates documentation coverage', () => {
    const result = calculateCorrectnessScore(0, 10, 8, 0.25)
    expect(result.score).toBe(80)
  })

  it('deducts violations from coverage', () => {
    const result = calculateCorrectnessScore(2, 10, 10, 0.25)
    expect(result.score).toBe(90)
  })

  it('clamps to 0 minimum', () => {
    const result = calculateCorrectnessScore(20, 10, 10, 0.25)
    expect(result.score).toBe(0)
  })
})

// ─── calculateFileScore ──────────────────────────────────
describe('Score command - calculateFileScore', () => {
  it('returns 100 for zero violations', () => {
    expect(calculateFileScore(0)).toBe(100)
  })

  it('deducts 3 points per violation', () => {
    expect(calculateFileScore(5)).toBe(85)
  })

  it('clamps to 0 minimum', () => {
    expect(calculateFileScore(100)).toBe(0)
  })
})

// ─── calculateOverallScore ───────────────────────────────
describe('Score command - calculateOverallScore', () => {
  it('calculates weighted average', () => {
    const result = calculateOverallScore({
      complexity: { score: 100, violations: 0, weight: 0.3 },
      correctness: { score: 100, violations: 0, weight: 0.25 },
      patterns: { score: 100, violations: 0, weight: 0.15 },
      security: { score: 100, violations: 0, weight: 0.3 },
    })
    expect(result).toBe(100)
  })

  it('weights categories correctly', () => {
    const result = calculateOverallScore({
      complexity: { score: 0, violations: 20, weight: 0.3 },
      correctness: { score: 100, violations: 0, weight: 0.25 },
      patterns: { score: 100, violations: 0, weight: 0.15 },
      security: { score: 100, violations: 0, weight: 0.3 },
    })
    expect(result).toBe(70)
  })
})

// ─── countDocumentedFunctions ────────────────────────────
describe('Score command - countDocumentedFunctions', () => {
  it('counts functions with JSDoc', () => {
    const fns = [
      { getJsDocs: () => ['doc'] },
      { getJsDocs: () => [] },
      { getJsDocs: () => ['doc1', 'doc2'] },
    ]
    expect(countDocumentedFunctions(fns)).toBe(2)
  })

  it('returns 0 for empty array', () => {
    expect(countDocumentedFunctions([])).toBe(0)
  })
})
