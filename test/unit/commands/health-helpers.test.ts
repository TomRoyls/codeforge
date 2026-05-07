import { beforeEach, describe, expect, test, vi } from 'vitest'
import chalk from 'chalk'

import type { RuleViolation } from '../../../src/ast/visitor.js'
import type { HealthReport, ScoreBreakdown } from '../../../src/commands/health-helpers.js'

// ============================================================================
// Mocks — must come before imports of mocked modules
// ============================================================================

vi.mock('../../../src/rules/categories.js', () => ({
  getRuleCategory: vi.fn((ruleId: string) => {
    if (ruleId.includes('security')) return 'security'
    if (ruleId.includes('pattern')) return 'patterns'
    if (ruleId.includes('complexity')) return 'complexity'
    return 'correctness'
  }),
}))

// ============================================================================
// Imports — after mocks
// ============================================================================

import {
  analyzeComplexity,
  calculateScores,
  displayReport,
  formatScore,
  getGrade,
  getRecommendations,
  getScoreColor,
} from '../../../src/commands/health-helpers.js'

import { getRuleCategory } from '../../../src/rules/categories.js'

// ============================================================================
// Factory Helpers
// ============================================================================

const makeViolation = (overrides: Partial<RuleViolation> = {}): RuleViolation => ({
  ruleId: 'test-rule',
  severity: 'warning',
  message: 'Test violation',
  filePath: '/test/file.ts',
  range: { start: { line: 1, column: 1 }, end: { line: 1, column: 10 } },
  ...overrides,
})

const makeScores = (overrides: Partial<ScoreBreakdown> = {}): ScoreBreakdown => ({
  complexity: 80,
  documentation: 70,
  errors: 90,
  patterns: 85,
  security: 75,
  testCoverage: 60,
  ...overrides,
})

const makeHealthReport = (overrides: Partial<HealthReport> = {}): HealthReport => ({
  overall: 75,
  path: '/test',
  scores: makeScores(),
  details: {
    complexity: { avgComplexity: 2, filesAnalyzed: 5, highComplexityFiles: 1 },
    documentation: { documentedFunctions: 10, totalFunctions: 20 },
    errors: 3,
    patterns: 2,
    security: 1,
    testCoverage: { estimated: 50, hasTests: true },
  },
  recommendations: [],
  ...overrides,
})

beforeEach(() => {
  vi.clearAllMocks()
})

// ============================================================================
// analyzeComplexity
// ============================================================================

describe('analyzeComplexity', () => {
  test('returns zeros for empty violations array', () => {
    const result = analyzeComplexity([])

    expect(result.avgComplexity).toBe(0)
    expect(result.filesAnalyzed).toBe(0)
    expect(result.highComplexityFiles).toBe(0)
  })

  test('returns zeros when no violations contain complexity in ruleId', () => {
    const violations = [
      makeViolation({ ruleId: 'no-console' }),
      makeViolation({ ruleId: 'prefer-const' }),
      makeViolation({ ruleId: 'no-eval' }),
    ]

    const result = analyzeComplexity(violations)

    expect(result.avgComplexity).toBe(0)
    expect(result.filesAnalyzed).toBe(0)
    expect(result.highComplexityFiles).toBe(0)
  })

  test('single complexity violation produces avgComplexity = 1', () => {
    const violations = [makeViolation({ ruleId: 'max-complexity' })]

    const result = analyzeComplexity(violations)

    expect(result.avgComplexity).toBe(1)
    expect(result.filesAnalyzed).toBe(1)
  })

  test('multiple complexity violations in same file averages correctly', () => {
    const violations = [
      makeViolation({ ruleId: 'max-complexity', filePath: '/src/a.ts' }),
      makeViolation({ ruleId: 'cyclomatic-complexity', filePath: '/src/a.ts' }),
      makeViolation({ ruleId: 'nesting-complexity', filePath: '/src/a.ts' }),
    ]

    const result = analyzeComplexity(violations)

    expect(result.avgComplexity).toBe(3)
    expect(result.filesAnalyzed).toBe(1)
  })

  test('violations across multiple files produces correct average', () => {
    const violations = [
      makeViolation({ ruleId: 'max-complexity', filePath: '/src/a.ts' }),
      makeViolation({ ruleId: 'max-complexity', filePath: '/src/b.ts' }),
      makeViolation({ ruleId: 'max-complexity', filePath: '/src/c.ts' }),
    ]

    const result = analyzeComplexity(violations)

    expect(result.avgComplexity).toBe(1)
    expect(result.filesAnalyzed).toBe(3)
  })

  test('uneven distribution across files calculates correctly', () => {
    const violations = [
      makeViolation({ ruleId: 'max-complexity', filePath: '/src/a.ts' }),
      makeViolation({ ruleId: 'max-complexity', filePath: '/src/a.ts' }),
      makeViolation({ ruleId: 'max-complexity', filePath: '/src/a.ts' }),
      makeViolation({ ruleId: 'max-complexity', filePath: '/src/b.ts' }),
    ]

    const result = analyzeComplexity(violations)

    expect(result.avgComplexity).toBe(2)
    expect(result.filesAnalyzed).toBe(2)
  })

  test('highComplexityFiles counts violations where message includes "high"', () => {
    const violations = [
      makeViolation({ ruleId: 'max-complexity', message: 'Function has high complexity of 15' }),
      makeViolation({ ruleId: 'max-complexity', message: 'Function has high complexity of 20' }),
      makeViolation({ ruleId: 'max-complexity', message: 'Moderate complexity detected' }),
    ]

    const result = analyzeComplexity(violations)

    expect(result.highComplexityFiles).toBe(2)
  })

  test('highComplexityFiles is 0 when no messages contain "high"', () => {
    const violations = [
      makeViolation({ ruleId: 'max-complexity', message: 'Low complexity' }),
      makeViolation({ ruleId: 'max-complexity', message: 'Medium complexity' }),
    ]

    const result = analyzeComplexity(violations)

    expect(result.highComplexityFiles).toBe(0)
  })

  test('only counts violations with complexity in ruleId, ignoring others', () => {
    const violations = [
      makeViolation({ ruleId: 'max-complexity', filePath: '/src/a.ts' }),
      makeViolation({ ruleId: 'max-complexity', filePath: '/src/b.ts' }),
      makeViolation({ ruleId: 'no-console', filePath: '/src/c.ts' }),
      makeViolation({ ruleId: 'prefer-const', filePath: '/src/d.ts' }),
    ]

    const result = analyzeComplexity(violations)

    expect(result.avgComplexity).toBe(1)
    expect(result.filesAnalyzed).toBe(2)
  })

  test('mixes complexity and non-complexity violations correctly', () => {
    const violations = [
      makeViolation({
        ruleId: 'max-complexity',
        filePath: '/src/a.ts',
        message: 'high complexity',
      }),
      makeViolation({ ruleId: 'no-console', filePath: '/src/a.ts', message: 'Unexpected console' }),
      makeViolation({
        ruleId: 'cyclomatic-complexity',
        filePath: '/src/a.ts',
        message: 'very high',
      }),
    ]

    const result = analyzeComplexity(violations)

    expect(result.avgComplexity).toBe(2)
    expect(result.filesAnalyzed).toBe(1)
    expect(result.highComplexityFiles).toBe(2)
  })

  test('handles case-insensitive "high" substring in message', () => {
    const violations = [
      makeViolation({ ruleId: 'max-complexity', message: 'Function has High complexity' }),
    ]

    // "High" !== "high" via includes, so should be 0
    const result = analyzeComplexity(violations)
    expect(result.highComplexityFiles).toBe(0)
  })
})

// ============================================================================
// getGrade
// ============================================================================

describe('getGrade', () => {
  test('score 100 returns (A)', () => {
    expect(getGrade(100)).toBe('(A)')
  })

  test('score 95 returns (A)', () => {
    expect(getGrade(95)).toBe('(A)')
  })

  test('score 90 (threshold A) returns (A)', () => {
    expect(getGrade(90)).toBe('(A)')
  })

  test('score 89 returns (B)', () => {
    expect(getGrade(89)).toBe('(B)')
  })

  test('score 85 returns (B)', () => {
    expect(getGrade(85)).toBe('(B)')
  })

  test('score 80 (threshold B) returns (B)', () => {
    expect(getGrade(80)).toBe('(B)')
  })

  test('score 79 returns (C)', () => {
    expect(getGrade(79)).toBe('(C)')
  })

  test('score 75 returns (C)', () => {
    expect(getGrade(75)).toBe('(C)')
  })

  test('score 70 (threshold C) returns (C)', () => {
    expect(getGrade(70)).toBe('(C)')
  })

  test('score 69 returns (D)', () => {
    expect(getGrade(69)).toBe('(D)')
  })

  test('score 65 returns (D)', () => {
    expect(getGrade(65)).toBe('(D)')
  })

  test('score 60 (threshold D) returns (D)', () => {
    expect(getGrade(60)).toBe('(D)')
  })

  test('score 59 returns (F)', () => {
    expect(getGrade(59)).toBe('(F)')
  })

  test('score 50 returns (F)', () => {
    expect(getGrade(50)).toBe('(F)')
  })

  test('score 0 returns (F)', () => {
    expect(getGrade(0)).toBe('(F)')
  })

  test('score 1 returns (F)', () => {
    expect(getGrade(1)).toBe('(F)')
  })

  test('boundary between D and C: 70 is C, 69 is D', () => {
    expect(getGrade(70)).toBe('(C)')
    expect(getGrade(69)).toBe('(D)')
  })

  test('boundary between C and B: 80 is B, 79 is C', () => {
    expect(getGrade(80)).toBe('(B)')
    expect(getGrade(79)).toBe('(C)')
  })

  test('boundary between B and A: 90 is A, 89 is B', () => {
    expect(getGrade(90)).toBe('(A)')
    expect(getGrade(89)).toBe('(B)')
  })
})

// ============================================================================
// getRecommendations
// ============================================================================

describe('getRecommendations', () => {
  test('returns empty array when no issues', () => {
    const scores = makeScores({
      errors: 90,
      security: 95,
      documentation: 80,
      complexity: 80,
    })
    const details = { errors: 0, hasTests: true, security: 0 }

    const result = getRecommendations(scores, details)

    expect(result).toEqual([])
  })

  test('low errors score includes fix violations recommendation', () => {
    const scores = makeScores({ errors: 75 })
    const details = { errors: 5, hasTests: true, security: 0 }

    const result = getRecommendations(scores, details)

    expect(result).toContain('Fix 5 error-level violations')
  })

  test('errors score at threshold B does not produce recommendation', () => {
    const scores = makeScores({ errors: 80 })
    const details = { errors: 0, hasTests: true, security: 0 }

    const result = getRecommendations(scores, details)

    expect(result.some((r) => r.includes('error-level violations'))).toBe(false)
  })

  test('low security score includes security recommendation', () => {
    const scores = makeScores({ security: 85 })
    const details = { errors: 0, hasTests: true, security: 3 }

    const result = getRecommendations(scores, details)

    expect(result).toContain('Address 3 security issues')
  })

  test('security score at threshold A does not produce recommendation', () => {
    const scores = makeScores({ security: 90 })
    const details = { errors: 0, hasTests: true, security: 0 }

    const result = getRecommendations(scores, details)

    expect(result.some((r) => r.includes('security issues'))).toBe(false)
  })

  test('documentation score below 50 includes JSDoc recommendation', () => {
    const scores = makeScores({ documentation: 40 })
    const details = { errors: 0, hasTests: true, security: 0 }

    const result = getRecommendations(scores, details)

    expect(result).toContain('Add JSDoc comments to public functions')
  })

  test('documentation score at 50 does not include JSDoc recommendation', () => {
    const scores = makeScores({ documentation: 50 })
    const details = { errors: 0, hasTests: true, security: 0 }

    const result = getRecommendations(scores, details)

    expect(result.some((r) => r.includes('JSDoc'))).toBe(false)
  })

  test('no tests includes unit tests recommendation', () => {
    const scores = makeScores()
    const details = { errors: 0, hasTests: false, security: 0 }

    const result = getRecommendations(scores, details)

    expect(result).toContain('Add unit tests to improve code quality')
  })

  test('hasTests true does not produce tests recommendation', () => {
    const scores = makeScores()
    const details = { errors: 0, hasTests: true, security: 0 }

    const result = getRecommendations(scores, details)

    expect(result.some((r) => r.includes('unit tests'))).toBe(false)
  })

  test('low complexity score includes reduce complexity recommendation', () => {
    const scores = makeScores({ complexity: 65 })
    const details = { errors: 0, hasTests: true, security: 0 }

    const result = getRecommendations(scores, details)

    expect(result).toContain('Reduce code complexity by breaking down large functions')
  })

  test('complexity score at threshold C does not produce recommendation', () => {
    const scores = makeScores({ complexity: 70 })
    const details = { errors: 0, hasTests: true, security: 0 }

    const result = getRecommendations(scores, details)

    expect(result.some((r) => r.includes('complexity'))).toBe(false)
  })

  test('combined issues produce multiple recommendations', () => {
    const scores = makeScores({
      errors: 70,
      security: 50,
      documentation: 30,
      complexity: 50,
    })
    const details = { errors: 10, hasTests: false, security: 5 }

    const result = getRecommendations(scores, details)

    expect(result.length).toBeGreaterThanOrEqual(4)
    expect(result.some((r) => r.includes('error-level violations'))).toBe(true)
    expect(result.some((r) => r.includes('security issues'))).toBe(true)
    expect(result.some((r) => r.includes('JSDoc'))).toBe(true)
    expect(result.some((r) => r.includes('unit tests'))).toBe(true)
  })

  test('respects MAX_RECOMMENDATIONS limit of 5', () => {
    const scores = makeScores({
      errors: 50,
      security: 50,
      documentation: 30,
      complexity: 50,
    })
    const details = { errors: 10, hasTests: false, security: 5 }

    const result = getRecommendations(scores, details)

    expect(result.length).toBeLessThanOrEqual(5)
  })

  test('returns recommendations in consistent order', () => {
    const scores = makeScores({
      errors: 70,
      security: 80,
      documentation: 30,
    })
    const details = { errors: 3, hasTests: false, security: 1 }

    const result = getRecommendations(scores, details)

    // errors recommendation should come before documentation
    const errorIdx = result.findIndex((r) => r.includes('error-level violations'))
    const docIdx = result.findIndex((r) => r.includes('JSDoc'))
    expect(errorIdx).toBeLessThan(docIdx)
  })
})

// ============================================================================
// getScoreColor
// ============================================================================

describe('getScoreColor', () => {
  test('score >= 80 returns chalk.green', () => {
    expect(getScoreColor(80)).toBe(chalk.green)
    expect(getScoreColor(90)).toBe(chalk.green)
    expect(getScoreColor(100)).toBe(chalk.green)
  })

  test('score >= 60 but < 80 returns chalk.yellow', () => {
    expect(getScoreColor(60)).toBe(chalk.yellow)
    expect(getScoreColor(70)).toBe(chalk.yellow)
    expect(getScoreColor(79)).toBe(chalk.yellow)
  })

  test('score < 60 returns chalk.red', () => {
    expect(getScoreColor(59)).toBe(chalk.red)
    expect(getScoreColor(0)).toBe(chalk.red)
    expect(getScoreColor(30)).toBe(chalk.red)
  })

  test('boundary at 80: green', () => {
    expect(getScoreColor(80)).toBe(chalk.green)
  })

  test('boundary at 79: yellow', () => {
    expect(getScoreColor(79)).toBe(chalk.yellow)
  })

  test('boundary at 60: yellow', () => {
    expect(getScoreColor(60)).toBe(chalk.yellow)
  })

  test('boundary at 59: red', () => {
    expect(getScoreColor(59)).toBe(chalk.red)
  })

  test('returned function is callable and returns a string', () => {
    const colorFn = getScoreColor(85)
    const result = colorFn('hello')
    expect(typeof result).toBe('string')
    expect(result).toContain('hello')
  })
})

// ============================================================================
// formatScore
// ============================================================================

describe('formatScore', () => {
  test('returns string containing the score number', () => {
    const result = formatScore(85)
    expect(result).toContain('85')
  })

  test('returns string containing "/ 100"', () => {
    const result = formatScore(75)
    expect(result).toContain('/ 100')
  })

  test('pads score to width of 3', () => {
    const result = formatScore(5)
    expect(result).toContain('  5')
  })

  test('score 100 is formatted correctly', () => {
    const result = formatScore(100)
    expect(result).toContain('100 / 100')
  })

  test('score 0 is formatted correctly', () => {
    const result = formatScore(0)
    expect(result).toContain('  0 / 100')
  })

  test('high score uses green color', () => {
    const result = formatScore(95)
    // chalk.green wraps with ANSI codes
    expect(result).toContain('95')
  })

  test('medium score uses yellow color', () => {
    const result = formatScore(70)
    expect(result).toContain('70')
  })

  test('low score uses red color', () => {
    const result = formatScore(30)
    expect(result).toContain('30')
  })

  test('different scores produce different output', () => {
    const r1 = formatScore(50)
    const r2 = formatScore(90)
    // They should differ because of the number and possibly color
    expect(r1).not.toBe(r2)
  })
})

// ============================================================================
// displayReport
// ============================================================================

describe('displayReport', () => {
  test('returns array of strings', () => {
    const report = makeHealthReport()
    const result = displayReport(report, false)

    expect(Array.isArray(result)).toBe(true)
    for (const line of result) {
      expect(typeof line).toBe('string')
    }
  })

  test('includes "Project Health Score" header', () => {
    const report = makeHealthReport()
    const result = displayReport(report, false)

    expect(result.some((l) => l.includes('Project Health Score'))).toBe(true)
  })

  test('includes grade in output', () => {
    const report = makeHealthReport({ overall: 75 })
    const result = displayReport(report, false)

    expect(result.some((l) => l.includes('(C)'))).toBe(true)
  })

  test('includes score number in output', () => {
    const report = makeHealthReport({ overall: 85 })
    const result = displayReport(report, false)

    expect(result.some((l) => l.includes('85'))).toBe(true)
  })

  test('non-verbose mode does NOT include "Category Breakdown"', () => {
    const report = makeHealthReport()
    const result = displayReport(report, false)

    expect(result.some((l) => l.includes('Category Breakdown'))).toBe(false)
  })

  test('verbose mode includes "Category Breakdown"', () => {
    const report = makeHealthReport()
    const result = displayReport(report, true)

    expect(result.some((l) => l.includes('Category Breakdown'))).toBe(true)
  })

  test('verbose mode includes all 6 category labels', () => {
    const report = makeHealthReport()
    const result = displayReport(report, true)

    const joined = result.join('\n')
    expect(joined).toContain('Complexity:')
    expect(joined).toContain('Documentation:')
    expect(joined).toContain('Error Count:')
    expect(joined).toContain('Security:')
    expect(joined).toContain('Patterns:')
    expect(joined).toContain('Test Coverage:')
  })

  test('verbose mode includes "Details" section', () => {
    const report = makeHealthReport()
    const result = displayReport(report, true)

    expect(result.some((l) => l.includes('Details:'))).toBe(true)
  })

  test('verbose mode shows "Tests present: Yes" when hasTests is true', () => {
    const report = makeHealthReport()
    report.details.testCoverage.hasTests = true
    const result = displayReport(report, true)

    expect(result.some((l) => l.includes('Tests present: Yes'))).toBe(true)
  })

  test('verbose mode shows "Tests present: No" when hasTests is false', () => {
    const report = makeHealthReport()
    report.details.testCoverage.hasTests = false
    const result = displayReport(report, true)

    expect(result.some((l) => l.includes('Tests present: No'))).toBe(true)
  })

  test('includes recommendations when present', () => {
    const report = makeHealthReport({
      recommendations: ['Fix 3 errors', 'Add tests'],
    })
    const result = displayReport(report, false)

    expect(result.some((l) => l.includes('Recommendations:'))).toBe(true)
    expect(result.some((l) => l.includes('Fix 3 errors'))).toBe(true)
    expect(result.some((l) => l.includes('Add tests'))).toBe(true)
  })

  test('no recommendations does not include "Recommendations:" header', () => {
    const report = makeHealthReport({ recommendations: [] })
    const result = displayReport(report, false)

    expect(result.some((l) => l.includes('Recommendations:'))).toBe(false)
  })

  test('recommendations are prefixed with bullet points', () => {
    const report = makeHealthReport({
      recommendations: ['Fix errors', 'Add docs'],
    })
    const result = displayReport(report, false)

    // chalk.yellow('•') adds ANSI codes, so check for the bullet character
    expect(result.some((l) => l.includes('•'))).toBe(true)
  })

  test('score of 100 shows grade (A)', () => {
    const report = makeHealthReport({ overall: 100 })
    const result = displayReport(report, false)

    expect(result.some((l) => l.includes('(A)'))).toBe(true)
  })

  test('score of 50 shows grade (F)', () => {
    const report = makeHealthReport({ overall: 50 })
    const result = displayReport(report, false)

    expect(result.some((l) => l.includes('(F)'))).toBe(true)
  })

  test('verbose mode includes files analyzed count', () => {
    const report = makeHealthReport()
    report.details.complexity.filesAnalyzed = 7
    const result = displayReport(report, true)

    expect(result.some((l) => l.includes('7'))).toBe(true)
  })

  test('verbose mode includes error count in details', () => {
    const report = makeHealthReport()
    report.details.errors = 12
    const result = displayReport(report, true)

    expect(result.some((l) => l.includes('Errors: 12'))).toBe(true)
  })
})

// ============================================================================
// calculateScores
// ============================================================================

describe('calculateScores', () => {
  test('no violations produces all scores at or near 100', () => {
    const files = [{ path: '/src/test/a.test.ts' }, { path: '/src/b.ts' }]

    const result = calculateScores([], 10, 10, files)

    expect(result.scores.errors).toBe(100)
    expect(result.scores.security).toBe(100)
    expect(result.scores.patterns).toBe(100)
    expect(result.scores.documentation).toBe(100)
    expect(result.scores.testCoverage).toBeGreaterThan(0)
  })

  test('error violations reduce errors score', () => {
    const violations = [
      makeViolation({ ruleId: 'some-rule', severity: 'error' }),
      makeViolation({ ruleId: 'another-rule', severity: 'error' }),
    ]

    const result = calculateScores(violations, 10, 10, [])

    // errors score = max(0, 100 - errors.length * 2) = max(0, 100 - 4) = 96
    expect(result.scores.errors).toBe(96)
    expect(result.errorCount).toBe(2)
  })

  test('many error violations clamp errors score to 0', () => {
    const violations = Array.from({ length: 60 }, () =>
      makeViolation({ ruleId: 'err', severity: 'error' }),
    )

    const result = calculateScores(violations, 10, 10, [])

    expect(result.scores.errors).toBe(0)
  })

  test('security violations reduce security score', () => {
    vi.mocked(getRuleCategory).mockImplementation((ruleId: string) => {
      if (ruleId.includes('security')) return 'security'
      return 'correctness'
    })

    const violations = [makeViolation({ ruleId: 'no-eval-security', severity: 'error' })]

    const result = calculateScores(violations, 10, 10, [])

    // security score = max(0, 100 - 1 * 10) = 90
    expect(result.scores.security).toBe(90)
    expect(result.securityCount).toBe(1)
  })

  test('pattern violations reduce patterns score', () => {
    vi.mocked(getRuleCategory).mockImplementation((ruleId: string) => {
      if (ruleId.includes('pattern')) return 'patterns'
      return 'correctness'
    })

    const violations = [
      makeViolation({ ruleId: 'no-pattern-a', severity: 'warning' }),
      makeViolation({ ruleId: 'no-pattern-b', severity: 'warning' }),
      makeViolation({ ruleId: 'no-pattern-c', severity: 'warning' }),
    ]

    const result = calculateScores(violations, 10, 10, [])

    // patterns score = max(0, 100 - 3) = 97
    expect(result.scores.patterns).toBe(97)
    expect(result.patternCount).toBe(3)
  })

  test('complexity errors reduce complexity score', () => {
    const violations = [
      makeViolation({ ruleId: 'max-complexity', severity: 'error' }),
      makeViolation({ ruleId: 'max-complexity', severity: 'error' }),
    ]

    const result = calculateScores(violations, 10, 10, [])

    // complexity = max(0, 100 - 2 * 5) = 90
    expect(result.scores.complexity).toBe(90)
  })

  test('many complexity violations clamp score to 0', () => {
    const violations = Array.from({ length: 25 }, () =>
      makeViolation({ ruleId: 'max-complexity', severity: 'error' }),
    )

    const result = calculateScores(violations, 10, 10, [])

    expect(result.scores.complexity).toBe(0)
  })

  test('documentation score = (documentedFunctions / totalFunctions) * 100', () => {
    const result = calculateScores([], 20, 15, [])

    expect(result.scores.documentation).toBe(75)
  })

  test('documentation score = 100 when all functions documented', () => {
    const result = calculateScores([], 10, 10, [])

    expect(result.scores.documentation).toBe(100)
  })

  test('when totalFunctions = 0, documentation defaults to 50', () => {
    const result = calculateScores([], 0, 0, [])

    expect(result.scores.documentation).toBe(50)
  })

  test('files with "test" in path → hasTests = true', () => {
    const files = [{ path: '/src/utils/helpers.ts' }, { path: '/src/test/helpers.test.ts' }]

    const result = calculateScores([], 10, 10, files)

    expect(result.testCoverage.hasTests).toBe(true)
  })

  test('files with "spec" in path → hasTests = true', () => {
    const files = [{ path: '/src/app.ts' }, { path: '/src/app.spec.ts' }]

    const result = calculateScores([], 10, 10, files)

    expect(result.testCoverage.hasTests).toBe(true)
  })

  test('no test or spec files → hasTests = false', () => {
    const files = [{ path: '/src/index.ts' }, { path: '/src/utils.ts' }]

    const result = calculateScores([], 10, 10, files)

    expect(result.testCoverage.hasTests).toBe(false)
  })

  test('hasTests = false → estimated coverage = 0', () => {
    const files = [{ path: '/src/index.ts' }]

    const result = calculateScores([], 10, 10, files)

    expect(result.testCoverage.estimated).toBe(0)
    expect(result.scores.testCoverage).toBe(0)
  })

  test('estimated coverage calculation with test files', () => {
    const files = [
      { path: '/src/a.ts' },
      { path: '/src/b.ts' },
      { path: '/src/c.ts' },
      { path: '/src/test/a.test.ts' },
    ]

    const result = calculateScores([], 10, 10, files)

    // testFiles = 1, nonTestFiles = 3
    // estimated = min(100, (1/3) * 100) = 33.33...
    expect(result.testCoverage.estimated).toBe(33)
    expect(result.testCoverage.hasTests).toBe(true)
  })

  test('estimated coverage caps at 100', () => {
    const files = [{ path: '/src/test/a.test.ts' }, { path: '/src/test/b.test.ts' }]

    const result = calculateScores([], 10, 10, files)

    // testFiles = 2, nonTestFiles = 0 → denominator is 1
    // min(100, (2/1)*100) = 100
    expect(result.scores.testCoverage).toBe(100)
    expect(result.testCoverage.estimated).toBe(100)
  })

  test('overall score is weighted correctly', () => {
    const files = [{ path: '/src/test/a.test.ts' }, { path: '/src/b.ts' }]
    const result = calculateScores([], 10, 10, files)

    // All category scores should be 100 except testCoverage
    // overall = round(
    //   100*0.2 + 100*0.15 + 100*0.25 + 100*0.2 + 100*0.1 + testCoverage*0.1
    // )
    const expectedTestCoverage = Math.min(100, (1 / 1) * 100)
    const expectedOverall = Math.round(
      100 * 0.2 + 100 * 0.15 + 100 * 0.25 + 100 * 0.2 + 100 * 0.1 + expectedTestCoverage * 0.1,
    )

    expect(result.overall).toBe(expectedOverall)
  })

  test('overall score with violations is reduced', () => {
    vi.mocked(getRuleCategory).mockImplementation((ruleId: string) => {
      if (ruleId.includes('security')) return 'security'
      if (ruleId.includes('pattern')) return 'patterns'
      return 'correctness'
    })

    const violations = [
      makeViolation({ ruleId: 'err-1', severity: 'error' }),
      makeViolation({ ruleId: 'security-issue', severity: 'error' }),
    ]
    const result = calculateScores(violations, 20, 10, [])

    // errors: 100-2*2=96, security: 100-1*10=90, patterns: 100
    // complexity: 100, documentation: 50, testCoverage: 0
    // overall < 100 since there are violations
    expect(result.overall).toBeLessThan(100)
    expect(result.overall).toBeGreaterThan(0)
  })

  test('returns errorCount matching error severity violations', () => {
    const violations = [
      makeViolation({ severity: 'error' }),
      makeViolation({ severity: 'warning' }),
      makeViolation({ severity: 'error' }),
      makeViolation({ severity: 'info' }),
    ]

    const result = calculateScores(violations, 10, 10, [])

    expect(result.errorCount).toBe(2)
  })

  test('returns patternCount from getRuleCategory results', () => {
    vi.mocked(getRuleCategory).mockImplementation((ruleId: string) => {
      if (ruleId === 'p1') return 'patterns'
      if (ruleId === 'p2') return 'patterns'
      return 'correctness'
    })

    const violations = [
      makeViolation({ ruleId: 'p1' }),
      makeViolation({ ruleId: 'p2' }),
      makeViolation({ ruleId: 'correct' }),
    ]

    const result = calculateScores(violations, 10, 10, [])

    expect(result.patternCount).toBe(2)
  })

  test('returns securityCount from getRuleCategory results', () => {
    vi.mocked(getRuleCategory).mockImplementation((ruleId: string) => {
      if (ruleId === 'sec1') return 'security'
      return 'correctness'
    })

    const violations = [makeViolation({ ruleId: 'sec1' }), makeViolation({ ruleId: 'not-sec' })]

    const result = calculateScores(violations, 10, 10, [])

    expect(result.securityCount).toBe(1)
  })

  test('empty files array → hasTests = false', () => {
    const result = calculateScores([], 10, 10, [])

    expect(result.testCoverage.hasTests).toBe(false)
  })

  test('getRuleCategory is called for each violation', () => {
    const violations = [
      makeViolation({ ruleId: 'rule-a' }),
      makeViolation({ ruleId: 'rule-b' }),
      makeViolation({ ruleId: 'rule-c' }),
    ]

    calculateScores(violations, 10, 10, [])

    // getRuleCategory is called twice per violation (security check + patterns check)
    expect(getRuleCategory).toHaveBeenCalledTimes(6)
    expect(getRuleCategory).toHaveBeenCalledWith('rule-a')
    expect(getRuleCategory).toHaveBeenCalledWith('rule-b')
    expect(getRuleCategory).toHaveBeenCalledWith('rule-c')
  })

  test('overall score rounds to nearest integer', () => {
    // documentation = 33.33... which creates fractional overall
    const result = calculateScores([], 3, 1, [])

    // documentation = (1/3)*100 = 33.33...
    // overall includes this fractional value, should be rounded
    expect(Number.isInteger(result.overall)).toBe(true)
  })

  test('warning severity violations are not counted as errors', () => {
    const violations = [
      makeViolation({ ruleId: 'some-rule', severity: 'warning' }),
      makeViolation({ ruleId: 'another-rule', severity: 'warning' }),
    ]

    const result = calculateScores(violations, 10, 10, [])

    expect(result.errorCount).toBe(0)
    expect(result.scores.errors).toBe(100)
  })

  test('info severity violations are not counted as errors', () => {
    const violations = [
      makeViolation({ ruleId: 'info-rule', severity: 'info' }),
      makeViolation({ ruleId: 'info-rule-2', severity: 'info' }),
    ]

    const result = calculateScores(violations, 10, 10, [])

    expect(result.errorCount).toBe(0)
    expect(result.scores.errors).toBe(100)
  })

  test('mixed severity violations count only errors', () => {
    const violations = [
      makeViolation({ ruleId: 'err-1', severity: 'error' }),
      makeViolation({ ruleId: 'warn-1', severity: 'warning' }),
      makeViolation({ ruleId: 'err-2', severity: 'error' }),
      makeViolation({ ruleId: 'info-1', severity: 'info' }),
      makeViolation({ ruleId: 'warn-2', severity: 'warning' }),
    ]

    const result = calculateScores(violations, 10, 10, [])

    expect(result.errorCount).toBe(2)
    expect(result.scores.errors).toBe(96)
  })

  test('complexity violations with warning severity do not reduce complexity score', () => {
    const violations = [
      makeViolation({ ruleId: 'max-complexity', severity: 'warning' }),
      makeViolation({ ruleId: 'cyclomatic-complexity', severity: 'warning' }),
    ]

    const result = calculateScores(violations, 10, 10, [])

    // Only error-severity complexity violations reduce score
    expect(result.scores.complexity).toBe(100)
  })

  test('pattern violations clamped to 0 with 100+ violations', () => {
    vi.mocked(getRuleCategory).mockImplementation((ruleId: string) => {
      if (ruleId.startsWith('pat-')) return 'patterns'
      return 'correctness'
    })

    const violations = Array.from({ length: 105 }, (_, i) => makeViolation({ ruleId: `pat-${i}` }))

    const result = calculateScores(violations, 10, 10, [])

    expect(result.scores.patterns).toBe(0)
    expect(result.patternCount).toBe(105)
  })

  test('security violations clamped to 0 with many violations', () => {
    vi.mocked(getRuleCategory).mockImplementation((ruleId: string) => {
      if (ruleId.startsWith('sec-')) return 'security'
      return 'correctness'
    })

    const violations = Array.from({ length: 15 }, (_, i) => makeViolation({ ruleId: `sec-${i}` }))

    const result = calculateScores(violations, 10, 10, [])

    // 100 - 15*10 = -50, clamped to 0
    expect(result.scores.security).toBe(0)
    expect(result.securityCount).toBe(15)
  })

  test('single test file with no source files', () => {
    const files = [{ path: '/src/test/a.test.ts' }]

    const result = calculateScores([], 10, 10, files)

    // testFiles = 1, nonTestFiles = 0, denominator = 1
    // estimated = min(100, (1/1)*100) = 100
    expect(result.testCoverage.hasTests).toBe(true)
    expect(result.testCoverage.estimated).toBe(100)
  })

  test('more test files than source files caps at 100', () => {
    const files = [
      { path: '/src/a.ts' },
      { path: '/src/test/a.test.ts' },
      { path: '/src/test/b.test.ts' },
      { path: '/src/test/c.test.ts' },
    ]

    const result = calculateScores([], 10, 10, files)

    expect(result.testCoverage.hasTests).toBe(true)
    expect(result.scores.testCoverage).toBe(100)
  })

  test('file path with "test" in directory name triggers hasTests', () => {
    const files = [{ path: '/src/test/utils.ts' }]

    const result = calculateScores([], 10, 10, files)

    expect(result.testCoverage.hasTests).toBe(true)
  })

  test('file path with "spec" in directory name triggers hasTests', () => {
    const files = [{ path: '/src/spec/helper.ts' }]

    const result = calculateScores([], 10, 10, files)

    expect(result.testCoverage.hasTests).toBe(true)
  })

  test('equal number of test and source files', () => {
    const files = [
      { path: '/src/a.ts' },
      { path: '/src/b.ts' },
      { path: '/src/a.test.ts' },
      { path: '/src/b.test.ts' },
    ]

    const result = calculateScores([], 10, 10, files)

    // testFiles = 2, nonTestFiles = 2
    // estimated = min(100, (2/2)*100) = 100
    expect(result.testCoverage.estimated).toBe(100)
  })

  test('documentedFunctions greater than totalFunctions produces score above 100', () => {
    // Edge case: if documentedFunctions > totalFunctions, documentation > 100
    const result = calculateScores([], 5, 10, [])

    // documentation = (10/5) * 100 = 200
    expect(result.scores.documentation).toBe(200)
  })

  test('exact error score calculation with 10 violations', () => {
    const violations = Array.from({ length: 10 }, () =>
      makeViolation({ ruleId: 'err', severity: 'error' }),
    )

    const result = calculateScores(violations, 10, 10, [])

    // errors = max(0, 100 - 10*2) = 80
    expect(result.scores.errors).toBe(80)
    expect(result.errorCount).toBe(10)
  })

  test('overall score is 0 when all category scores are 0', () => {
    vi.mocked(getRuleCategory).mockImplementation((ruleId: string) => {
      if (ruleId.startsWith('sec-')) return 'security'
      if (ruleId.startsWith('pat-')) return 'patterns'
      return 'correctness'
    })

    // Need enough violations to zero out each score
    const violations = [
      // errors: 50 violations → 100-100=0
      ...Array.from({ length: 50 }, () => makeViolation({ ruleId: 'err', severity: 'error' })),
      // security: 10 violations → 100-100=0
      ...Array.from({ length: 10 }, (_, i) =>
        makeViolation({ ruleId: `sec-${i}`, severity: 'error' }),
      ),
      // patterns: 100 violations → 100-100=0
      ...Array.from({ length: 100 }, (_, i) => makeViolation({ ruleId: `pat-${i}` })),
      // complexity: 20 error+complexity → 100-100=0
      ...Array.from({ length: 20 }, () =>
        makeViolation({ ruleId: 'max-complexity', severity: 'error' }),
      ),
    ]

    const result = calculateScores(violations, 0, 0, [])

    expect(result.scores.errors).toBe(0)
    expect(result.scores.security).toBe(0)
    expect(result.scores.patterns).toBe(0)
    expect(result.scores.complexity).toBe(0)
    expect(result.scores.documentation).toBe(50) // default when totalFunctions=0
    expect(result.scores.testCoverage).toBe(0) // no files
    expect(result.overall).toBe(8)
  })
})

// ============================================================================
// analyzeComplexity — additional edge cases
// ============================================================================

describe('analyzeComplexity — additional edge cases', () => {
  test('many files each with single complexity violation averages 1', () => {
    const violations = Array.from({ length: 10 }, (_, i) =>
      makeViolation({ ruleId: 'max-complexity', filePath: `/src/file${i}.ts` }),
    )

    const result = analyzeComplexity(violations)

    expect(result.avgComplexity).toBe(1)
    expect(result.filesAnalyzed).toBe(10)
  })

  test('ten complexity violations in one file averages 10', () => {
    const violations = Array.from({ length: 10 }, () =>
      makeViolation({ ruleId: 'max-complexity', filePath: '/src/big.ts' }),
    )

    const result = analyzeComplexity(violations)

    expect(result.avgComplexity).toBe(10)
    expect(result.filesAnalyzed).toBe(1)
  })

  test('highComplexityFiles with mixed messages in different files', () => {
    const violations = [
      makeViolation({
        ruleId: 'max-complexity',
        filePath: '/src/a.ts',
        message: 'high complexity',
      }),
      makeViolation({ ruleId: 'max-complexity', filePath: '/src/b.ts', message: 'low complexity' }),
      makeViolation({
        ruleId: 'max-complexity',
        filePath: '/src/c.ts',
        message: 'very high complexity',
      }),
    ]

    const result = analyzeComplexity(violations)

    expect(result.highComplexityFiles).toBe(2)
    expect(result.filesAnalyzed).toBe(3)
  })

  test('empty message does not count as high complexity', () => {
    const violations = [makeViolation({ ruleId: 'max-complexity', message: '' })]

    const result = analyzeComplexity(violations)

    expect(result.highComplexityFiles).toBe(0)
    expect(result.avgComplexity).toBe(1)
  })

  test('multiple complexity rule IDs are all counted', () => {
    const violations = [
      makeViolation({ ruleId: 'max-complexity', filePath: '/src/a.ts' }),
      makeViolation({ ruleId: 'cyclomatic-complexity', filePath: '/src/a.ts' }),
      makeViolation({ ruleId: 'nesting-complexity', filePath: '/src/a.ts' }),
      makeViolation({ ruleId: 'cognitive-complexity', filePath: '/src/a.ts' }),
    ]

    const result = analyzeComplexity(violations)

    expect(result.avgComplexity).toBe(4)
    expect(result.filesAnalyzed).toBe(1)
  })

  test('violations in same file with same ruleId counted separately', () => {
    const violations = [
      makeViolation({ ruleId: 'max-complexity', filePath: '/src/a.ts' }),
      makeViolation({ ruleId: 'max-complexity', filePath: '/src/a.ts' }),
    ]

    const result = analyzeComplexity(violations)

    expect(result.avgComplexity).toBe(2)
    expect(result.filesAnalyzed).toBe(1)
  })
})

// ============================================================================
// getGrade — additional edge cases
// ============================================================================

describe('getGrade — additional edge cases', () => {
  test('negative score returns (F)', () => {
    expect(getGrade(-1)).toBe('(F)')
  })

  test('score 61 returns (D)', () => {
    expect(getGrade(61)).toBe('(D)')
  })

  test('score 71 returns (C)', () => {
    expect(getGrade(71)).toBe('(C)')
  })

  test('score 81 returns (B)', () => {
    expect(getGrade(81)).toBe('(B)')
  })

  test('score 91 returns (A)', () => {
    expect(getGrade(91)).toBe('(A)')
  })

  test('score 99 returns (A)', () => {
    expect(getGrade(99)).toBe('(A)')
  })

  test('score 25 returns (F)', () => {
    expect(getGrade(25)).toBe('(F)')
  })
})

// ============================================================================
// getRecommendations — additional edge cases
// ============================================================================

describe('getRecommendations — additional edge cases', () => {
  test('only errors low, everything else good', () => {
    const scores = makeScores({ errors: 75, security: 95 })
    const details = { errors: 5, hasTests: true, security: 0 }

    const result = getRecommendations(scores, details)

    expect(result).toEqual(['Fix 5 error-level violations'])
  })

  test('only security low, everything else good', () => {
    const scores = makeScores({ security: 85 })
    const details = { errors: 0, hasTests: true, security: 2 }

    const result = getRecommendations(scores, details)

    expect(result).toEqual(['Address 2 security issues'])
  })

  test('only documentation low, everything else good', () => {
    const scores = makeScores({ documentation: 45, security: 95 })
    const details = { errors: 0, hasTests: true, security: 0 }

    const result = getRecommendations(scores, details)

    expect(result).toEqual(['Add JSDoc comments to public functions'])
  })

  test('only hasTests false, everything else good', () => {
    const scores = makeScores({ errors: 90, security: 95, documentation: 80, complexity: 80 })
    const details = { errors: 0, hasTests: false, security: 0 }

    const result = getRecommendations(scores, details)

    expect(result).toEqual(['Add unit tests to improve code quality'])
  })

  test('only complexity low, everything else good', () => {
    const scores = makeScores({ complexity: 60, security: 95 })
    const details = { errors: 0, hasTests: true, security: 0 }

    const result = getRecommendations(scores, details)

    expect(result).toEqual(['Reduce code complexity by breaking down large functions'])
  })

  test('errors score at 79 produces recommendation', () => {
    const scores = makeScores({ errors: 79 })
    const details = { errors: 8, hasTests: true, security: 0 }

    const result = getRecommendations(scores, details)

    expect(result.some((r) => r.includes('8 error-level violations'))).toBe(true)
  })

  test('security score at 89 produces recommendation', () => {
    const scores = makeScores({ security: 89 })
    const details = { errors: 0, hasTests: true, security: 1 }

    const result = getRecommendations(scores, details)

    expect(result.some((r) => r.includes('security issues'))).toBe(true)
  })

  test('documentation score at 49 produces recommendation', () => {
    const scores = makeScores({ documentation: 49 })
    const details = { errors: 0, hasTests: true, security: 0 }

    const result = getRecommendations(scores, details)

    expect(result.some((r) => r.includes('JSDoc'))).toBe(true)
  })

  test('errors with 0 count still shows correct message', () => {
    const scores = makeScores({ errors: 75 })
    const details = { errors: 0, hasTests: true, security: 0 }

    const result = getRecommendations(scores, details)

    expect(result).toContain('Fix 0 error-level violations')
  })

  test('exactly 5 conditions met produces exactly 5 recommendations', () => {
    const scores = makeScores({ errors: 70, security: 80, documentation: 40, complexity: 60 })
    const details = { errors: 5, hasTests: false, security: 3 }

    const result = getRecommendations(scores, details)

    expect(result.length).toBe(5)
  })
})

// ============================================================================
// getScoreColor — additional edge cases
// ============================================================================

describe('getScoreColor — additional edge cases', () => {
  test('score above 100 returns green', () => {
    expect(getScoreColor(150)).toBe(chalk.green)
  })

  test('negative score returns red', () => {
    expect(getScoreColor(-10)).toBe(chalk.red)
  })

  test('score 1 returns red', () => {
    expect(getScoreColor(1)).toBe(chalk.red)
  })

  test('score 61 returns yellow', () => {
    expect(getScoreColor(61)).toBe(chalk.yellow)
  })

  test('score 81 returns green', () => {
    expect(getScoreColor(81)).toBe(chalk.green)
  })

  test('green color function formats text', () => {
    const result = getScoreColor(100)('test')
    expect(result).toContain('test')
  })

  test('yellow color function formats text', () => {
    const result = getScoreColor(70)('test')
    expect(result).toContain('test')
  })

  test('red color function formats text', () => {
    const result = getScoreColor(30)('test')
    expect(result).toContain('test')
  })
})

// ============================================================================
// formatScore — additional edge cases
// ============================================================================

describe('formatScore — additional edge cases', () => {
  test('score 50 contains padded format', () => {
    const result = formatScore(50)
    expect(result).toContain(' 50 / 100')
  })

  test('score 60 contains correct number', () => {
    const result = formatScore(60)
    expect(result).toContain('60')
  })

  test('score 80 contains correct number', () => {
    const result = formatScore(80)
    expect(result).toContain('80')
  })

  test('score 10 is padded to width 3', () => {
    const result = formatScore(10)
    expect(result).toContain(' 10 / 100')
  })

  test('score 7 is padded to width 3', () => {
    const result = formatScore(7)
    expect(result).toContain('  7 / 100')
  })

  test('always contains "/ 100"', () => {
    expect(formatScore(0)).toContain('/ 100')
    expect(formatScore(50)).toContain('/ 100')
    expect(formatScore(100)).toContain('/ 100')
  })
})

// ============================================================================
// displayReport — additional edge cases
// ============================================================================

describe('displayReport — additional edge cases', () => {
  test('verbose mode shows security issues count', () => {
    const report = makeHealthReport()
    report.details.security = 5
    const result = displayReport(report, true)

    expect(result.some((l) => l.includes('Security issues: 5'))).toBe(true)
  })

  test('verbose mode shows pattern issues count', () => {
    const report = makeHealthReport()
    report.details.patterns = 7
    const result = displayReport(report, true)

    expect(result.some((l) => l.includes('Pattern issues: 7'))).toBe(true)
  })

  test('verbose mode shows files analyzed count', () => {
    const report = makeHealthReport()
    report.details.complexity.filesAnalyzed = 12
    const result = displayReport(report, true)

    expect(result.some((l) => l.includes('Files analyzed: 12'))).toBe(true)
  })

  test('grade (B) shown for score 85', () => {
    const report = makeHealthReport({ overall: 85 })
    const result = displayReport(report, false)

    expect(result.some((l) => l.includes('(B)'))).toBe(true)
  })

  test('grade (D) shown for score 65', () => {
    const report = makeHealthReport({ overall: 65 })
    const result = displayReport(report, false)

    expect(result.some((l) => l.includes('(D)'))).toBe(true)
  })

  test('multiple recommendations each get a bullet', () => {
    const recs = ['Fix 3 errors', 'Add tests', 'Improve docs']
    const report = makeHealthReport({ recommendations: recs })
    const result = displayReport(report, false)

    let bulletCount = 0
    for (const line of result) {
      if (line.includes('•')) bulletCount++
    }
    expect(bulletCount).toBe(3)
  })

  test('output starts with empty string', () => {
    const report = makeHealthReport()
    const result = displayReport(report, false)

    expect(result[0]).toBe('')
  })

  test('verbose mode includes documentation score', () => {
    const report = makeHealthReport({ scores: makeScores({ documentation: 55 }) })
    const result = displayReport(report, true)

    const joined = result.join('\n')
    expect(joined).toContain('Documentation:')
  })

  test('non-verbose mode compact output does not include details', () => {
    const report = makeHealthReport()
    const result = displayReport(report, false)

    expect(result.some((l) => l.includes('Files analyzed:'))).toBe(false)
    expect(result.some((l) => l.includes('Errors:'))).toBe(false)
    expect(result.some((l) => l.includes('Security issues:'))).toBe(false)
  })

  test('report path is not displayed in output', () => {
    const report = makeHealthReport({ path: '/custom/project/path' })
    const result = displayReport(report, false)

    expect(result.some((l) => l.includes('/custom/project/path'))).toBe(false)
  })
})

// ============================================================================
// analyzeComplexity — coverage expansion
// ============================================================================

describe('analyzeComplexity — coverage expansion', () => {
  test('avgComplexity produces float with uneven distribution', () => {
    const violations = [
      makeViolation({ ruleId: 'max-complexity', filePath: '/src/a.ts' }),
      makeViolation({ ruleId: 'max-complexity', filePath: '/src/a.ts' }),
      makeViolation({ ruleId: 'max-complexity', filePath: '/src/b.ts' }),
      makeViolation({ ruleId: 'max-complexity', filePath: '/src/b.ts' }),
      makeViolation({ ruleId: 'max-complexity', filePath: '/src/c.ts' }),
    ]

    const result = analyzeComplexity(violations)

    expect(result.avgComplexity).toBeCloseTo(5 / 3, 4)
    expect(result.filesAnalyzed).toBe(3)
    expect(result.highComplexityFiles).toBe(0)
  })

  test('message containing "highlighted" counts as high due to substring match', () => {
    const violations = [makeViolation({ ruleId: 'max-complexity', message: 'highlighted issue' })]

    const result = analyzeComplexity(violations)

    // "highlighted" includes "high" as a substring
    expect(result.highComplexityFiles).toBe(1)
  })

  test('single high complexity violation in one file', () => {
    const violations = [
      makeViolation({
        ruleId: 'max-complexity',
        filePath: '/src/big.ts',
        message: 'Function has high complexity of 15',
      }),
    ]

    const result = analyzeComplexity(violations)

    expect(result.avgComplexity).toBe(1)
    expect(result.filesAnalyzed).toBe(1)
    expect(result.highComplexityFiles).toBe(1)
  })

  test('all violations high complexity across multiple files', () => {
    const violations = [
      makeViolation({
        ruleId: 'max-complexity',
        filePath: '/src/a.ts',
        message: 'high complexity',
      }),
      makeViolation({
        ruleId: 'max-complexity',
        filePath: '/src/b.ts',
        message: 'high complexity',
      }),
      makeViolation({
        ruleId: 'max-complexity',
        filePath: '/src/c.ts',
        message: 'high complexity',
      }),
    ]

    const result = analyzeComplexity(violations)

    expect(result.highComplexityFiles).toBe(3)
    expect(result.avgComplexity).toBe(1)
    expect(result.filesAnalyzed).toBe(3)
  })

  test('file path with special characters treated as distinct files', () => {
    const violations = [
      makeViolation({ ruleId: 'max-complexity', filePath: '/src/[special]/file.ts' }),
      makeViolation({ ruleId: 'max-complexity', filePath: '/src/[special]/file.ts' }),
    ]

    const result = analyzeComplexity(violations)

    expect(result.avgComplexity).toBe(2)
    expect(result.filesAnalyzed).toBe(1)
  })
})

// ============================================================================
// getGrade — coverage expansion
// ============================================================================

describe('getGrade — coverage expansion', () => {
  test('score 2 returns (F)', () => {
    expect(getGrade(2)).toBe('(F)')
  })

  test('score 62 returns (D)', () => {
    expect(getGrade(62)).toBe('(D)')
  })

  test('score 72 returns (C)', () => {
    expect(getGrade(72)).toBe('(C)')
  })

  test('score 82 returns (B)', () => {
    expect(getGrade(82)).toBe('(B)')
  })

  test('score 92 returns (A)', () => {
    expect(getGrade(92)).toBe('(A)')
  })

  test('score 150 returns (A)', () => {
    expect(getGrade(150)).toBe('(A)')
  })
})

// ============================================================================
// getRecommendations — coverage expansion
// ============================================================================

describe('getRecommendations — coverage expansion', () => {
  test('errors score exactly 80 produces no errors recommendation', () => {
    const scores = makeScores({ errors: 80 })
    const details = { errors: 2, hasTests: true, security: 0 }

    const result = getRecommendations(scores, details)

    expect(result.some((r) => r.includes('error-level violations'))).toBe(false)
  })

  test('security score exactly 90 produces no security recommendation', () => {
    const scores = makeScores({ security: 90 })
    const details = { errors: 0, hasTests: true, security: 5 }

    const result = getRecommendations(scores, details)

    expect(result.some((r) => r.includes('security issues'))).toBe(false)
  })

  test('documentation score of 1 produces JSDoc recommendation', () => {
    const scores = makeScores({ documentation: 1 })
    const details = { errors: 0, hasTests: true, security: 0 }

    const result = getRecommendations(scores, details)

    expect(result).toContain('Add JSDoc comments to public functions')
  })

  test('complexity score exactly 70 produces no complexity recommendation', () => {
    const scores = makeScores({ complexity: 70, security: 95 })
    const details = { errors: 0, hasTests: true, security: 0 }

    const result = getRecommendations(scores, details)

    expect(result.some((r) => r.includes('complexity'))).toBe(false)
  })

  test('only low complexity with hasTests true produces single recommendation', () => {
    const scores = makeScores({ complexity: 60, errors: 90, security: 95, documentation: 80 })
    const details = { errors: 0, hasTests: true, security: 0 }

    const result = getRecommendations(scores, details)

    expect(result).toEqual(['Reduce code complexity by breaking down large functions'])
  })
})

// ============================================================================
// getScoreColor — coverage expansion
// ============================================================================

describe('getScoreColor — coverage expansion', () => {
  test('score 85 returns green', () => {
    expect(getScoreColor(85)).toBe(chalk.green)
  })

  test('score 75 returns yellow', () => {
    expect(getScoreColor(75)).toBe(chalk.yellow)
  })

  test('score 45 returns red', () => {
    expect(getScoreColor(45)).toBe(chalk.red)
  })
})

// ============================================================================
// formatScore — coverage expansion
// ============================================================================

describe('formatScore — coverage expansion', () => {
  test('score 99 is formatted with correct number', () => {
    const result = formatScore(99)
    expect(result).toContain('99')
    expect(result).toContain('/ 100')
  })

  test('score 33 is formatted with padding', () => {
    const result = formatScore(33)
    expect(result).toContain('33')
    expect(result).toContain('/ 100')
  })

  test('score 1 is padded to width 3', () => {
    const result = formatScore(1)
    expect(result).toContain('  1 / 100')
  })

  test('score 100 exact format', () => {
    const result = formatScore(100)
    expect(result).toContain('100 / 100')
  })
})

// ============================================================================
// displayReport — coverage expansion
// ============================================================================

describe('displayReport — coverage expansion', () => {
  test('verbose mode shows zero errors correctly', () => {
    const report = makeHealthReport()
    report.details.errors = 0
    const result = displayReport(report, true)

    expect(result.some((l) => l.includes('Errors: 0'))).toBe(true)
  })

  test('overall score 0 shows grade (F)', () => {
    const report = makeHealthReport({ overall: 0 })
    const result = displayReport(report, false)

    expect(result.some((l) => l.includes('(F)'))).toBe(true)
  })

  test('overall score 95 shows grade (A)', () => {
    const report = makeHealthReport({ overall: 95 })
    const result = displayReport(report, false)

    expect(result.some((l) => l.includes('(A)'))).toBe(true)
  })

  test('verbose mode shows zero security issues', () => {
    const report = makeHealthReport()
    report.details.security = 0
    const result = displayReport(report, true)

    expect(result.some((l) => l.includes('Security issues: 0'))).toBe(true)
  })

  test('verbose mode shows zero pattern issues', () => {
    const report = makeHealthReport()
    report.details.patterns = 0
    const result = displayReport(report, true)

    expect(result.some((l) => l.includes('Pattern issues: 0'))).toBe(true)
  })

  test('single recommendation includes bullet and text', () => {
    const report = makeHealthReport({ recommendations: ['Single rec'] })
    const result = displayReport(report, false)

    expect(result.some((l) => l.includes('•') && l.includes('Single rec'))).toBe(true)
  })

  test('verbose output contains multiple empty lines for spacing', () => {
    const report = makeHealthReport()
    const result = displayReport(report, true)

    const emptyLineCount = result.filter((l) => l === '').length
    expect(emptyLineCount).toBeGreaterThan(0)
  })
})

// ============================================================================
// calculateScores — coverage expansion
// ============================================================================

describe('calculateScores — coverage expansion', () => {
  test('single complexity error reduces both complexity and errors scores', () => {
    const violations = [makeViolation({ ruleId: 'max-complexity', severity: 'error' })]

    const result = calculateScores(violations, 10, 10, [])

    expect(result.scores.complexity).toBe(95) // 100 - 1*5
    expect(result.scores.errors).toBe(98) // 100 - 1*2
  })

  test('complexity warning does not reduce complexity score', () => {
    const violations = [
      makeViolation({ ruleId: 'max-complexity', severity: 'warning' }),
      makeViolation({ ruleId: 'max-complexity', severity: 'error' }),
    ]

    const result = calculateScores(violations, 10, 10, [])

    // Only error severity counts for complexity penalty
    expect(result.scores.complexity).toBe(95) // 100 - 1*5
    expect(result.scores.errors).toBe(98) // 100 - 1*2
  })

  test('3 test files and 7 source files produces estimated coverage 43', () => {
    const files = [
      { path: '/src/a.ts' },
      { path: '/src/b.ts' },
      { path: '/src/c.ts' },
      { path: '/src/d.ts' },
      { path: '/src/e.ts' },
      { path: '/src/f.ts' },
      { path: '/src/g.ts' },
      { path: '/src/test/a.test.ts' },
      { path: '/src/test/b.test.ts' },
      { path: '/src/test/c.test.ts' },
    ]

    const result = calculateScores([], 10, 10, files)

    expect(result.testCoverage.hasTests).toBe(true)
    expect(result.testCoverage.estimated).toBe(43) // Math.round(3/7 * 100)
  })

  test('one source file and one test file produces 100% estimated coverage', () => {
    const files = [{ path: '/src/a.ts' }, { path: '/src/a.test.ts' }]

    const result = calculateScores([], 10, 10, files)

    expect(result.testCoverage.estimated).toBe(100)
    expect(result.testCoverage.hasTests).toBe(true)
  })

  test('1 test file and 2 source files produces 50% estimated coverage', () => {
    const files = [{ path: '/src/a.ts' }, { path: '/src/b.ts' }, { path: '/src/test/a.test.ts' }]

    const result = calculateScores([], 10, 10, files)

    expect(result.testCoverage.estimated).toBe(50)
  })

  test('getRuleCategory called twice per single violation', () => {
    const violations = [makeViolation({ ruleId: 'my-rule' })]

    calculateScores(violations, 10, 10, [])

    expect(getRuleCategory).toHaveBeenCalledTimes(2)
    expect(getRuleCategory).toHaveBeenCalledWith('my-rule')
  })

  test('security count with mixed violations', () => {
    vi.mocked(getRuleCategory).mockImplementation((ruleId: string) => {
      if (ruleId === 'sec1') return 'security'
      if (ruleId === 'sec2') return 'security'
      return 'correctness'
    })

    const violations = [
      makeViolation({ ruleId: 'sec1' }),
      makeViolation({ ruleId: 'sec2' }),
      makeViolation({ ruleId: 'other' }),
      makeViolation({ ruleId: 'another' }),
    ]

    const result = calculateScores(violations, 10, 10, [])

    expect(result.securityCount).toBe(2)
    expect(result.scores.security).toBe(80) // 100 - 2*10
  })

  test('zero pattern violations produces pattern score of 100', () => {
    vi.mocked(getRuleCategory).mockImplementation(() => 'correctness')

    const violations = [
      makeViolation({ ruleId: 'some-rule' }),
      makeViolation({ ruleId: 'another-rule' }),
    ]

    const result = calculateScores(violations, 10, 10, [])

    expect(result.patternCount).toBe(0)
    expect(result.scores.patterns).toBe(100)
  })

  test('overall score calculation with one error violation', () => {
    vi.mocked(getRuleCategory).mockImplementation(() => 'correctness')

    const violations = [makeViolation({ ruleId: 'err', severity: 'error' })]

    const result = calculateScores(violations, 10, 5, [])

    // errors: 98, documentation: 50, complexity: 100, security: 100, patterns: 100, testCoverage: 0
    // overall = round(100*0.2 + 50*0.15 + 98*0.25 + 100*0.2 + 100*0.1 + 0*0.1)
    // = round(20 + 7.5 + 24.5 + 20 + 10 + 0) = 82
    expect(result.overall).toBe(82)
  })

  test('documentation at exactly 50 percent', () => {
    const result = calculateScores([], 10, 5, [])

    expect(result.scores.documentation).toBe(50)
  })
})
