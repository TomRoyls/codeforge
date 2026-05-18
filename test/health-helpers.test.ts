import { describe, it, expect } from 'vitest'
import chalk from 'chalk'

import type { RuleViolation } from '../src/ast/visitor.js'

import {
  analyzeComplexity,
  getRecommendations,
  formatScore,
  displayReport,
  calculateScores,
  getGrade,
  getScoreColor,
} from '../src/commands/health-helpers.js'

import { HEALTH_SCORE_MAX, SCORE_FIELD_WIDTH } from '../src/utils/constants.js'

function makeViolation(overrides: Partial<RuleViolation> = {}): RuleViolation {
  return {
    filePath: 'src/test.ts',
    message: 'test violation',
    range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
    ruleId: 'test-rule',
    severity: 'error',
    ...overrides,
  }
}

// ─── analyzeComplexity ─────────────────────────────────
describe('analyzeComplexity', () => {
  it('returns zeros for empty violations', () => {
    const result = analyzeComplexity([])
    expect(result.avgComplexity).toBe(0)
    expect(result.filesAnalyzed).toBe(0)
    expect(result.highComplexityFiles).toBe(0)
  })

  it('returns zeros when no complexity violations exist', () => {
    const violations = [makeViolation({ ruleId: 'no-console' })]
    const result = analyzeComplexity(violations)
    expect(result.avgComplexity).toBe(0)
    expect(result.filesAnalyzed).toBe(0)
  })

  it('counts complexity violations', () => {
    const violations = [
      makeViolation({ ruleId: 'complexity-max', filePath: 'a.ts' }),
      makeViolation({ ruleId: 'complexity-max', filePath: 'a.ts' }),
    ]
    const result = analyzeComplexity(violations)
    expect(result.filesAnalyzed).toBe(1)
    expect(result.avgComplexity).toBe(2)
  })

  it('computes average across multiple files', () => {
    const violations = [
      makeViolation({ ruleId: 'complexity-max', filePath: 'a.ts' }),
      makeViolation({ ruleId: 'complexity-max', filePath: 'b.ts' }),
      makeViolation({ ruleId: 'complexity-max', filePath: 'b.ts' }),
      makeViolation({ ruleId: 'complexity-max', filePath: 'b.ts' }),
    ]
    const result = analyzeComplexity(violations)
    expect(result.filesAnalyzed).toBe(2)
    expect(result.avgComplexity).toBe(2)
  })

  it('counts high complexity files', () => {
    const violations = [
      makeViolation({ ruleId: 'complexity-max', filePath: 'a.ts', message: 'high complexity' }),
      makeViolation({ ruleId: 'complexity-max', filePath: 'b.ts', message: 'medium complexity' }),
    ]
    const result = analyzeComplexity(violations)
    expect(result.highComplexityFiles).toBe(1)
  })

  it('ignores non-complexity violations', () => {
    const violations = [
      makeViolation({ ruleId: 'no-console' }),
      makeViolation({ ruleId: 'some-other-rule' }),
    ]
    const result = analyzeComplexity(violations)
    expect(result.avgComplexity).toBe(0)
    expect(result.filesAnalyzed).toBe(0)
    expect(result.highComplexityFiles).toBe(0)
  })
})

// ─── getRecommendations ────────────────────────────────
describe('getRecommendations', () => {
  const goodScores = { complexity: 90, documentation: 90, errors: 90, patterns: 90, security: 95, testCoverage: 80 }
  const badScores = { complexity: 50, documentation: 30, errors: 50, patterns: 50, security: 50, testCoverage: 10 }

  it('returns empty array for good scores with tests', () => {
    const recs = getRecommendations(goodScores, { errors: 0, hasTests: true, security: 0 })
    expect(recs).toEqual([])
  })

  it('recommends fixing errors when error score is low', () => {
    const recs = getRecommendations(badScores, { errors: 25, hasTests: true, security: 0 })
    expect(recs.some((r) => r.includes('25 error-level violations'))).toBe(true)
  })

  it('recommends addressing security issues', () => {
    const recs = getRecommendations(
      { ...goodScores, security: 50 },
      { errors: 0, hasTests: true, security: 5 },
    )
    expect(recs.some((r) => r.includes('5 security issues'))).toBe(true)
  })

  it('recommends adding JSDoc when documentation score < 50', () => {
    const recs = getRecommendations(
      { ...goodScores, documentation: 40 },
      { errors: 0, hasTests: true, security: 0 },
    )
    expect(recs.some((r) => r.includes('JSDoc'))).toBe(true)
  })

  it('does not recommend JSDoc when documentation >= 50', () => {
    const recs = getRecommendations(
      { ...goodScores, documentation: 60 },
      { errors: 0, hasTests: true, security: 0 },
    )
    expect(recs.some((r) => r.includes('JSDoc'))).toBe(false)
  })

  it('recommends adding unit tests when hasTests is false', () => {
    const recs = getRecommendations(goodScores, { errors: 0, hasTests: false, security: 0 })
    expect(recs.some((r) => r.includes('unit tests'))).toBe(true)
  })

  it('recommends reducing complexity when score < 70', () => {
    const recs = getRecommendations(
      { ...goodScores, complexity: 60 },
      { errors: 0, hasTests: true, security: 0 },
    )
    expect(recs.some((r) => r.includes('complexity'))).toBe(true)
  })

  it('limits to MAX_RECOMMENDATIONS', () => {
    const recs = getRecommendations(badScores, { errors: 25, hasTests: false, security: 5 })
    expect(recs.length).toBeLessThanOrEqual(5)
  })
})

// ─── formatScore ───────────────────────────────────────
describe('formatScore', () => {
  it('pads score to SCORE_FIELD_WIDTH', () => {
    const result = formatScore(42)
    expect(result).toContain('42')
    expect(result).toContain(String(HEALTH_SCORE_MAX))
  })

  it('includes separator', () => {
    const result = formatScore(100)
    expect(result).toContain('/')
  })

  it('pads single digit score', () => {
    const result = formatScore(5)
    expect(result).toContain('5')
  })
})

// ─── displayReport ─────────────────────────────────────
describe('displayReport', () => {
  const baseReport = {
    details: {
      complexity: { avgComplexity: 0, filesAnalyzed: 5, highComplexityFiles: 0 },
      documentation: { documentedFunctions: 10, totalFunctions: 20 },
      errors: 3,
      patterns: 1,
      security: 0,
      testCoverage: { estimated: 50, hasTests: true },
    },
    overall: 85,
    path: 'src/',
    recommendations: ['Add JSDoc comments to public functions'],
    scores: {
      complexity: 90,
      documentation: 50,
      errors: 94,
      patterns: 99,
      security: 100,
      testCoverage: 50,
    },
  }

  it('includes project health score header', () => {
    const lines = displayReport(baseReport, false)
    expect(lines.some((l) => l.includes('Project Health Score'))).toBe(true)
  })

  it('includes overall score', () => {
    const lines = displayReport(baseReport, false)
    expect(lines.some((l) => l.includes('85'))).toBe(true)
  })

  it('includes grade', () => {
    const lines = displayReport(baseReport, false)
    expect(lines.some((l) => l.includes('(B)'))).toBe(true)
  })

  it('shows category breakdown in verbose mode', () => {
    const lines = displayReport(baseReport, true)
    expect(lines.some((l) => l.includes('Complexity:'))).toBe(true)
    expect(lines.some((l) => l.includes('Documentation:'))).toBe(true)
    expect(lines.some((l) => l.includes('Security:'))).toBe(true)
  })

  it('hides category breakdown in non-verbose mode', () => {
    const lines = displayReport(baseReport, false)
    expect(lines.every((l) => !l.includes('Category Breakdown'))).toBe(true)
  })

  it('shows recommendations when present', () => {
    const lines = displayReport(baseReport, false)
    expect(lines.some((l) => l.includes('Recommendations'))).toBe(true)
    expect(lines.some((l) => l.includes('JSDoc'))).toBe(true)
  })

  it('shows details in verbose mode', () => {
    const lines = displayReport(baseReport, true)
    expect(lines.some((l) => l.includes('Files analyzed: 5'))).toBe(true)
    expect(lines.some((l) => l.includes('Errors: 3'))).toBe(true)
    expect(lines.some((l) => l.includes('Tests present: Yes'))).toBe(true)
  })

  it('shows "Tests present: No" when no tests', () => {
    const noTestsReport = {
      ...baseReport,
      details: { ...baseReport.details, testCoverage: { estimated: 0, hasTests: false } },
    }
    const lines = displayReport(noTestsReport, true)
    expect(lines.some((l) => l.includes('Tests present: No'))).toBe(true)
  })

  it('omits recommendations section when empty', () => {
    const noRecs = { ...baseReport, recommendations: [] }
    const lines = displayReport(noRecs, false)
    expect(lines.every((l) => !l.includes('Recommendations'))).toBe(true)
  })
})

// ─── calculateScores ───────────────────────────────────
describe('calculateScores', () => {
  it('returns perfect scores for no violations', () => {
    const result = calculateScores([], 0, 0, [{ path: 'src/a.ts' }])
    expect(result.overall).toBeGreaterThan(0)
    expect(result.scores.errors).toBe(100)
    expect(result.scores.security).toBe(100)
  })

  it('deducts for error violations', () => {
    const violations = [makeViolation({ severity: 'error' })]
    const result = calculateScores(violations, 10, 5, [{ path: 'src/a.ts' }])
    expect(result.scores.errors).toBeLessThan(100)
  })

  it('detects tests from file paths', () => {
    const result = calculateScores([], 0, 0, [
      { path: 'src/a.ts' },
      { path: 'test/a.test.ts' },
    ])
    expect(result.testCoverage.hasTests).toBe(true)
    expect(result.testCoverage.estimated).toBeGreaterThan(0)
  })

  it('returns hasTests false when no test files', () => {
    const result = calculateScores([], 0, 0, [{ path: 'src/a.ts' }])
    expect(result.testCoverage.hasTests).toBe(false)
    expect(result.testCoverage.estimated).toBe(0)
  })

  it('calculates documentation score from function counts', () => {
    const result = calculateScores([], 20, 10, [{ path: 'src/a.ts' }])
    expect(result.scores.documentation).toBe(50)
  })

  it('defaults documentation to 50 when no functions', () => {
    const result = calculateScores([], 0, 0, [{ path: 'src/a.ts' }])
    expect(result.scores.documentation).toBe(50)
  })

  it('counts error violations', () => {
    const violations = [
      makeViolation({ severity: 'error' }),
      makeViolation({ severity: 'warning' }),
      makeViolation({ severity: 'error' }),
    ]
    const result = calculateScores(violations, 0, 0, [{ path: 'src/a.ts' }])
    expect(result.errorCount).toBe(2)
  })

  it('weighs categories for overall score', () => {
    const result = calculateScores([], 0, 0, [{ path: 'src/a.ts' }])
    expect(result.overall).toBeGreaterThan(0)
    expect(result.overall).toBeLessThanOrEqual(100)
  })

  it('deducts complexity violations by 5 each', () => {
    const violations = [
      makeViolation({ severity: 'error', ruleId: 'complexity-max' }),
      makeViolation({ severity: 'error', ruleId: 'complexity-max' }),
    ]
    const result = calculateScores(violations, 0, 0, [{ path: 'src/a.ts' }])
    expect(result.scores.complexity).toBe(90)
  })
})

// ─── getGrade ──────────────────────────────────────────
describe('getGrade', () => {
  it('returns A for scores >= 90', () => {
    expect(getGrade(90)).toBe('(A)')
    expect(getGrade(100)).toBe('(A)')
  })

  it('returns B for scores >= 80', () => {
    expect(getGrade(80)).toBe('(B)')
    expect(getGrade(89)).toBe('(B)')
  })

  it('returns C for scores >= 70', () => {
    expect(getGrade(70)).toBe('(C)')
    expect(getGrade(79)).toBe('(C)')
  })

  it('returns D for scores >= 60', () => {
    expect(getGrade(60)).toBe('(D)')
    expect(getGrade(69)).toBe('(D)')
  })

  it('returns F for scores < 60', () => {
    expect(getGrade(59)).toBe('(F)')
    expect(getGrade(0)).toBe('(F)')
  })
})

// ─── getScoreColor ─────────────────────────────────────
describe('getScoreColor', () => {
  it('returns green function for scores >= 80', () => {
    expect(getScoreColor(80)).toBe(chalk.green)
    expect(getScoreColor(100)).toBe(chalk.green)
  })

  it('returns yellow function for scores >= 60', () => {
    expect(getScoreColor(60)).toBe(chalk.yellow)
    expect(getScoreColor(79)).toBe(chalk.yellow)
  })

  it('returns red function for scores < 60', () => {
    expect(getScoreColor(59)).toBe(chalk.red)
    expect(getScoreColor(0)).toBe(chalk.red)
  })
})
