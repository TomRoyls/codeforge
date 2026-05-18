import { describe, expect, it } from 'vitest'

import type { RuleViolation } from '../../src/ast/visitor.js'

import {
  analyzeComplexity,
  getRecommendations,
  calculateScores,
} from '../../src/commands/health-helpers.js'

// ─── Helpers ───

function makeViolation(overrides: Partial<RuleViolation> = {}): RuleViolation {
  return {
    filePath: overrides.filePath ?? 'src/app.ts',
    message: overrides.message ?? 'Violation',
    range: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
    ruleId: overrides.ruleId ?? 'some-rule',
    severity: overrides.severity ?? 'error',
  }
}

// ─── analyzeComplexity ───

describe('analyzeComplexity', () => {
  it('returns zeros for empty violations', () => {
    const result = analyzeComplexity([])
    expect(result.avgComplexity).toBe(0)
    expect(result.filesAnalyzed).toBe(0)
    expect(result.highComplexityFiles).toBe(0)
  })

  it('counts complexity violations', () => {
    const violations = [
      makeViolation({ ruleId: 'max-complexity', filePath: 'a.ts' }),
      makeViolation({ ruleId: 'max-complexity', filePath: 'a.ts' }),
      makeViolation({ ruleId: 'max-complexity', filePath: 'b.ts' }),
    ]
    const result = analyzeComplexity(violations)
    expect(result.filesAnalyzed).toBe(2)
    expect(result.avgComplexity).toBe(1.5)
  })

  it('counts high complexity files', () => {
    const violations = [
      makeViolation({ ruleId: 'complexity-check', message: 'high complexity detected' }),
      makeViolation({ ruleId: 'complexity-check', message: 'normal complexity' }),
    ]
    const result = analyzeComplexity(violations)
    expect(result.highComplexityFiles).toBe(1)
  })

  it('ignores non-complexity violations', () => {
    const violations = [
      makeViolation({ ruleId: 'no-eval' }),
      makeViolation({ ruleId: 'max-params' }),
    ]
    const result = analyzeComplexity(violations)
    expect(result.filesAnalyzed).toBe(0)
  })
})

// ─── getRecommendations ───

describe('getRecommendations', () => {
  it('recommends fixing errors when below threshold', () => {
    const recs = getRecommendations(
      { complexity: 100, documentation: 100, errors: 50, patterns: 100, security: 100, testCoverage: 100 },
      { errors: 5, hasTests: true, security: 0 },
    )
    expect(recs.some((r) => r.includes('error-level violations'))).toBe(true)
  })

  it('recommends addressing security issues', () => {
    const recs = getRecommendations(
      { complexity: 100, documentation: 100, errors: 100, patterns: 100, security: 50, testCoverage: 100 },
      { errors: 0, hasTests: true, security: 3 },
    )
    expect(recs.some((r) => r.includes('security'))).toBe(true)
  })

  it('recommends adding JSDoc when documentation low', () => {
    const recs = getRecommendations(
      { complexity: 100, documentation: 30, errors: 100, patterns: 100, security: 100, testCoverage: 100 },
      { errors: 0, hasTests: true, security: 0 },
    )
    expect(recs.some((r) => r.includes('JSDoc'))).toBe(true)
  })

  it('recommends adding tests when none present', () => {
    const recs = getRecommendations(
      { complexity: 100, documentation: 100, errors: 100, patterns: 100, security: 100, testCoverage: 100 },
      { errors: 0, hasTests: false, security: 0 },
    )
    expect(recs.some((r) => r.includes('unit tests'))).toBe(true)
  })

  it('returns empty for perfect scores with tests', () => {
    const recs = getRecommendations(
      { complexity: 100, documentation: 100, errors: 100, patterns: 100, security: 100, testCoverage: 100 },
      { errors: 0, hasTests: true, security: 0 },
    )
    expect(recs).toEqual([])
  })
})

// ─── calculateScores ───

describe('calculateScores', () => {
  it('returns perfect scores for no violations', () => {
    const result = calculateScores([], 10, 10, [{ path: 'src/a.ts' }])
    expect(result.scores.errors).toBe(100)
    expect(result.scores.documentation).toBe(100)
    expect(result.overall).toBeGreaterThan(80)
  })

  it('deducts for error violations', () => {
    const violations = [
      makeViolation({ severity: 'error', ruleId: 'some-rule' }),
      makeViolation({ severity: 'error', ruleId: 'another-rule' }),
    ]
    const result = calculateScores(violations, 10, 10, [{ path: 'src/a.ts' }])
    expect(result.errorCount).toBe(2)
    expect(result.scores.errors).toBe(96)
  })

  it('detects test files', () => {
    const result = calculateScores([], 10, 10, [
      { path: 'src/app.ts' },
      { path: 'test/app.test.ts' },
    ])
    expect(result.testCoverage.hasTests).toBe(true)
  })

  it('detects spec files', () => {
    const result = calculateScores([], 10, 10, [
      { path: 'src/app.ts' },
      { path: 'src/app.spec.ts' },
    ])
    expect(result.testCoverage.hasTests).toBe(true)
  })

  it('no test files returns 0 coverage', () => {
    const result = calculateScores([], 10, 10, [
      { path: 'src/a.ts' },
      { path: 'src/b.ts' },
    ])
    expect(result.testCoverage.hasTests).toBe(false)
    expect(result.testCoverage.estimated).toBe(0)
  })

  it('returns 50% documentation when no functions', () => {
    const result = calculateScores([], 0, 0, [{ path: 'src/a.ts' }])
    expect(result.scores.documentation).toBe(50)
  })
})
