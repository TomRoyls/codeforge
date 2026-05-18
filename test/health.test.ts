import { describe, it, expect } from 'vitest'
import {
  analyzeComplexity,
  calculateScores,
  displayReport,
  formatScore,
  getGrade,
  getRecommendations,
  getScoreColor,
  type HealthReport,
} from '../src/commands/health-helpers.js'
import type { RuleViolation } from '../src/ast/visitor.js'

function makeViolation(overrides: Partial<RuleViolation> = {}): RuleViolation {
  return {
    filePath: 'src/test.ts',
    message: 'test violation',
    range: {
      end: { column: 10, line: 1 },
      start: { column: 0, line: 1 },
    },
    ruleId: 'no-eval',
    severity: 'error',
    ...overrides,
  } as RuleViolation
}

// ─── analyzeComplexity ───────────────────────────────
describe('analyzeComplexity', () => {
  it('returns zero values for no violations', () => {
    const result = analyzeComplexity([])

    expect(result).toEqual({
      avgComplexity: 0,
      filesAnalyzed: 0,
      highComplexityFiles: 0,
    })
  })

  it('counts complexity violations', () => {
    const violations = [
      makeViolation({ ruleId: 'complexity-high', filePath: 'a.ts' }),
      makeViolation({ ruleId: 'complexity-high', filePath: 'a.ts' }),
      makeViolation({ ruleId: 'complexity-high', filePath: 'b.ts' }),
    ]

    const result = analyzeComplexity(violations)

    expect(result.filesAnalyzed).toBe(2)
    expect(result.avgComplexity).toBe(1.5)
  })

  it('counts high complexity files from message', () => {
    const violations = [
      makeViolation({ ruleId: 'complexity', message: 'function has high complexity', filePath: 'a.ts' }),
      makeViolation({ ruleId: 'complexity', message: 'normal complexity', filePath: 'b.ts' }),
    ]

    const result = analyzeComplexity(violations)

    expect(result.highComplexityFiles).toBe(1)
  })

  it('ignores non-complexity violations', () => {
    const violations = [
      makeViolation({ ruleId: 'no-eval', filePath: 'a.ts' }),
    ]

    const result = analyzeComplexity(violations)

    expect(result.filesAnalyzed).toBe(0)
  })
})

// ─── getGrade ────────────────────────────────────────
describe('getGrade', () => {
  it('returns (A) for score >= 90', () => {
    expect(getGrade(90)).toBe('(A)')
    expect(getGrade(100)).toBe('(A)')
  })

  it('returns (B) for score >= 80', () => {
    expect(getGrade(80)).toBe('(B)')
    expect(getGrade(89)).toBe('(B)')
  })

  it('returns (C) for score >= 70', () => {
    expect(getGrade(70)).toBe('(C)')
    expect(getGrade(79)).toBe('(C)')
  })

  it('returns (D) for score >= 60', () => {
    expect(getGrade(60)).toBe('(D)')
    expect(getGrade(69)).toBe('(D)')
  })

  it('returns (F) for score < 60', () => {
    expect(getGrade(0)).toBe('(F)')
    expect(getGrade(59)).toBe('(F)')
  })
})

// ─── getScoreColor ───────────────────────────────────
describe('getScoreColor', () => {
  it('returns green function for high scores', () => {
    const colorFn = getScoreColor(90)
    expect(typeof colorFn).toBe('function')
    expect(colorFn('test')).toContain('test')
  })

  it('returns yellow function for medium scores', () => {
    const colorFn = getScoreColor(40)
    expect(typeof colorFn).toBe('function')
  })

  it('returns red function for low scores', () => {
    const colorFn = getScoreColor(10)
    expect(typeof colorFn).toBe('function')
  })
})

// ─── formatScore ─────────────────────────────────────
describe('formatScore', () => {
  it('includes score and max value', () => {
    const result = formatScore(85)
    expect(result).toContain('85')
    expect(result).toContain('100')
  })
})

// ─── getRecommendations ──────────────────────────────
describe('getRecommendations', () => {
  it('recommends fixing errors when error score is low', () => {
    const scores = { errors: 50, security: 100, documentation: 80, complexity: 80, patterns: 80, testCoverage: 80 }
    const recs = getRecommendations(scores, { errors: 5, hasTests: true, security: 0 })

    expect(recs.some((r) => r.includes('5 error'))).toBe(true)
  })

  it('recommends addressing security issues', () => {
    const scores = { errors: 100, security: 50, documentation: 80, complexity: 80, patterns: 80, testCoverage: 80 }
    const recs = getRecommendations(scores, { errors: 0, hasTests: true, security: 3 })

    expect(recs.some((r) => r.includes('security'))).toBe(true)
  })

  it('recommends documentation when score is low', () => {
    const scores = { errors: 100, security: 100, documentation: 30, complexity: 80, patterns: 80, testCoverage: 80 }
    const recs = getRecommendations(scores, { errors: 0, hasTests: true, security: 0 })

    expect(recs.some((r) => r.includes('JSDoc'))).toBe(true)
  })

  it('recommends adding tests when none present', () => {
    const scores = { errors: 100, security: 100, documentation: 80, complexity: 80, patterns: 80, testCoverage: 80 }
    const recs = getRecommendations(scores, { errors: 0, hasTests: false, security: 0 })

    expect(recs.some((r) => r.includes('unit tests'))).toBe(true)
  })

  it('recommends reducing complexity when score is low', () => {
    const scores = { errors: 100, security: 100, documentation: 80, complexity: 20, patterns: 80, testCoverage: 80 }
    const recs = getRecommendations(scores, { errors: 0, hasTests: true, security: 0 })

    expect(recs.some((r) => r.includes('complexity'))).toBe(true)
  })

  it('limits recommendations to MAX_RECOMMENDATIONS', () => {
    const scores = { errors: 10, security: 10, documentation: 10, complexity: 10, patterns: 10, testCoverage: 10 }
    const recs = getRecommendations(scores, { errors: 50, hasTests: false, security: 20 })

    expect(recs.length).toBeLessThanOrEqual(5)
  })

  it('returns empty array for perfect scores', () => {
    const scores = { errors: 100, security: 100, documentation: 80, complexity: 80, patterns: 80, testCoverage: 80 }
    const recs = getRecommendations(scores, { errors: 0, hasTests: true, security: 0 })

    expect(recs).toEqual([])
  })
})

// ─── calculateScores ─────────────────────────────────
describe('calculateScores', () => {
  it('calculates perfect scores for no violations', () => {
    const result = calculateScores([], 0, 0, [{ path: 'src/test.ts' }])

    expect(result.errorCount).toBe(0)
    expect(result.securityCount).toBe(0)
    expect(result.overall).toBeGreaterThan(0)
  })

  it('detects test files', () => {
    const result = calculateScores([], 0, 0, [
      { path: 'src/app.ts' },
      { path: 'test/app.test.ts' },
    ])

    expect(result.testCoverage.hasTests).toBe(true)
  })

  it('detects spec files as tests', () => {
    const result = calculateScores([], 0, 0, [
      { path: 'src/app.spec.ts' },
    ])

    expect(result.testCoverage.hasTests).toBe(true)
  })

  it('reports no tests when no test/spec files', () => {
    const result = calculateScores([], 0, 0, [{ path: 'src/app.ts' }])

    expect(result.testCoverage.hasTests).toBe(false)
  })

  it('counts error violations', () => {
    const violations = [
      makeViolation({ severity: 'error' }),
      makeViolation({ severity: 'warning' }),
    ]

    const result = calculateScores(violations, 0, 0, [])

    expect(result.errorCount).toBe(1)
  })

  it('computes documentation score from documented/total ratio', () => {
    const result = calculateScores([], 10, 5, [])

    expect(result.scores.documentation).toBe(50)
  })

  it('defaults documentation to 50 when no functions', () => {
    const result = calculateScores([], 0, 0, [])

    expect(result.scores.documentation).toBe(50)
  })

  it('reduces error score based on violation count', () => {
    const violations = Array.from({ length: 10 }, () => makeViolation({ severity: 'error' }))
    const result = calculateScores(violations, 0, 0, [])

    expect(result.scores.errors).toBeLessThan(100)
  })
})

// ─── displayReport ───────────────────────────────────
describe('displayReport', () => {
  const baseReport: HealthReport = {
    details: {
      complexity: { avgComplexity: 0, filesAnalyzed: 0, highComplexityFiles: 0 },
      documentation: { documentedFunctions: 0, totalFunctions: 0 },
      errors: 0,
      patterns: 0,
      security: 0,
      testCoverage: { estimated: 0, hasTests: false },
    },
    overall: 85,
    path: '/project',
    recommendations: ['Add unit tests'],
    scores: {
      complexity: 90,
      documentation: 80,
      errors: 85,
      patterns: 90,
      security: 95,
      testCoverage: 70,
    },
  }

  it('includes overall score and grade', () => {
    const lines = displayReport(baseReport, false)

    expect(lines.some((l) => l.includes('Project Health Score'))).toBe(true)
    expect(lines.some((l) => l.includes('85'))).toBe(true)
  })

  it('includes category breakdown in verbose mode', () => {
    const lines = displayReport(baseReport, true)

    expect(lines.some((l) => l.includes('Complexity'))).toBe(true)
    expect(lines.some((l) => l.includes('Documentation'))).toBe(true)
    expect(lines.some((l) => l.includes('Security'))).toBe(true)
  })

  it('omits category breakdown in non-verbose mode', () => {
    const lines = displayReport(baseReport, false)

    expect(lines.some((l) => l.includes('Category Breakdown'))).toBe(false)
  })

  it('shows recommendations', () => {
    const lines = displayReport(baseReport, false)

    expect(lines.some((l) => l.includes('Add unit tests'))).toBe(true)
    expect(lines.some((l) => l.includes('Recommendations'))).toBe(true)
  })

  it('omits recommendations section when empty', () => {
    const report = { ...baseReport, recommendations: [] }
    const lines = displayReport(report, false)

    expect(lines.some((l) => l.includes('Recommendations'))).toBe(false)
  })
})
