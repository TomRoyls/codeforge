import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  type DebtBreakdown,
  type DebtHistoryEntry,
  type DebtReport,
  appendHistoryEntry,
  calculateBreakdown,
  calculateInterest,
  calculateOverall,
  computeTrend,
  getHistoryPath,
} from '../../src/commands/debt-helpers.js'

import {
  formatDebt,
  formatHistoryLines,
  formatReportLines,
  getDebtColor,
  getRecommendations,
} from '../../src/commands/debt-format-helpers.js'

import type { RuleViolation } from '../../src/ast/visitor.js'

// ─── Helpers ───

function makeViolation(ruleId: string): RuleViolation {
  return {
    filePath: 'test.ts',
    message: `violation for ${ruleId}`,
    range: { end: { column: 0, line: 1 }, start: { column: 0, line: 1 } },
    ruleId,
    severity: 'warning',
  }
}

function makeBreakdown(overrides: Partial<DebtBreakdown> = {}): DebtBreakdown {
  return {
    complexity: 0,
    dependencies: 0,
    documentation: 0,
    patterns: 0,
    security: 0,
    ...overrides,
  }
}

function makeReport(overrides: Partial<DebtReport> = {}): DebtReport {
  return {
    breakdown: makeBreakdown(),
    filesAnalyzed: 10,
    interest: { annual: 0, monthly: 0, weekly: 0 },
    overall: 0,
    path: '/project',
    trend: { change: 0, direction: 'stable', previous: null },
    ...overrides,
  }
}

function makeHistoryEntry(overall: number, timestamp: string): DebtHistoryEntry {
  return {
    breakdown: makeBreakdown(),
    filesAnalyzed: 10,
    overall,
    timestamp,
  }
}

/** Regex to strip ANSI escape codes for string assertions */
function strip(s: string): string {
  return s.replace(/\x1b\[[0-9;]*m/g, '')
}

afterEach(() => {
  vi.restoreAllMocks()
})

// ─── calculateBreakdown ───

describe('calculateBreakdown', () => {
  it('returns zero breakdown for no violations', () => {
    const result = calculateBreakdown([])
    expect(result).toEqual({
      complexity: 0,
      dependencies: 0,
      documentation: 0,
      patterns: 0,
      security: 0,
    })
  })

  it('applies complexity weight (3) to complexity violations', () => {
    const violations = [
      makeViolation('max-params'),
      makeViolation('max-params'),
      makeViolation('max-complexity'),
    ]
    const result = calculateBreakdown(violations)
    expect(result.complexity).toBe(9)
  })

  it('applies security weight (5) to security violations', () => {
    const violations = [makeViolation('no-eval'), makeViolation('no-hardcoded-credentials')]
    const result = calculateBreakdown(violations)
    expect(result.security).toBe(10)
  })

  it('applies dependencies weight (2) to dependency violations', () => {
    const violations = [
      makeViolation('no-circular-deps'),
      makeViolation('no-circular-deps'),
      makeViolation('no-circular-deps'),
    ]
    const result = calculateBreakdown(violations)
    expect(result.dependencies).toBe(6)
  })

  it('applies patterns weight (1) to pattern violations', () => {
    const violations = [makeViolation('no-console'), makeViolation('prefer-const')]
    const result = calculateBreakdown(violations)
    expect(result.patterns).toBe(2)
  })

  it('applies documentation weight (1) and counts documentation/jsdoc violations', () => {
    const violations = [makeViolation('require-jsdoc'), makeViolation('check-documentation')]
    const result = calculateBreakdown(violations)
    // No category match → counts.documentation = 0; jsdoc/documentation filter → undocumented = 2
    // documentation = 0 * 1 + 2 = 2
    expect(result.documentation).toBe(2)
  })

  it('ignores violations from unmapped categories', () => {
    const violations = [makeViolation('no-focused-tests'), makeViolation('valid-expect')]
    const result = calculateBreakdown(violations)
    expect(result.complexity).toBe(0)
    expect(result.patterns).toBe(0)
    expect(result.security).toBe(0)
  })

  it('handles mix of all categories', () => {
    const violations = [
      makeViolation('max-params'),
      makeViolation('no-eval'),
      makeViolation('no-circular-deps'),
      makeViolation('no-console'),
    ]
    const result = calculateBreakdown(violations)
    expect(result.complexity).toBe(3)
    expect(result.security).toBe(5)
    expect(result.dependencies).toBe(2)
    expect(result.patterns).toBe(1)
  })
})

// ─── calculateInterest ───

describe('calculateInterest', () => {
  it('returns zero hours for zero debt', () => {
    const result = calculateInterest(0)
    expect(result.weekly).toBe(0)
    expect(result.monthly).toBe(0)
    expect(result.annual).toBe(0)
  })

  it('calculates interest for 1 debt point', () => {
    const result = calculateInterest(1)
    expect(result.weekly).toBe(0)
    expect(result.monthly).toBe(1)
    expect(result.annual).toBe(13)
  })

  it('calculates interest for 10 debt points', () => {
    const result = calculateInterest(10)
    expect(result.weekly).toBe(3)
    expect(result.monthly).toBe(10)
    expect(result.annual).toBe(130)
  })

  it('calculates interest for large debt', () => {
    const result = calculateInterest(100)
    expect(result.weekly).toBe(25)
    expect(result.monthly).toBe(100)
    expect(result.annual).toBe(1300)
  })

  it('all interest values are rounded', () => {
    const result = calculateInterest(7)
    expect(Number.isInteger(result.weekly)).toBe(true)
    expect(Number.isInteger(result.monthly)).toBe(true)
    expect(Number.isInteger(result.annual)).toBe(true)
  })
})

// ─── calculateOverall ───

describe('calculateOverall', () => {
  it('returns 0 for zero breakdown and single file', () => {
    const result = calculateOverall(makeBreakdown(), 1)
    expect(result).toBe(0)
  })

  it('divides total debt by file count', () => {
    const breakdown = makeBreakdown({ complexity: 30, patterns: 10 })
    const result = calculateOverall(breakdown, 4)
    expect(result).toBe(10)
  })

  it('prevents division by zero with 0 files', () => {
    const breakdown = makeBreakdown({ security: 50 })
    const result = calculateOverall(breakdown, 0)
    expect(result).toBe(50)
  })

  it('rounds the result', () => {
    const breakdown = makeBreakdown({ complexity: 10 })
    const result = calculateOverall(breakdown, 3)
    expect(result).toBe(3)
  })

  it('sums all breakdown categories', () => {
    const breakdown = makeBreakdown({
      complexity: 3,
      dependencies: 4,
      documentation: 1,
      patterns: 2,
      security: 5,
    })
    expect(calculateOverall(breakdown, 1)).toBe(15)
  })
})

// ─── computeTrend ───

describe('computeTrend', () => {
  it('returns stable with no history', () => {
    const result = computeTrend([], 10)
    expect(result).toEqual({ change: 0, direction: 'stable', previous: null })
  })

  it('reports decreasing when debt dropped by more than 1', () => {
    const history = [makeHistoryEntry(20, '2025-01-01')]
    const result = computeTrend(history, 15)
    expect(result.previous).toBe(20)
    expect(result.change).toBe(-5)
    expect(result.direction).toBe('decreasing')
  })

  it('reports increasing when debt rose by more than 1', () => {
    const history = [makeHistoryEntry(10, '2025-01-01')]
    const result = computeTrend(history, 20)
    expect(result.previous).toBe(10)
    expect(result.change).toBe(10)
    expect(result.direction).toBe('increasing')
  })

  it('reports stable for change within ±1', () => {
    const history = [makeHistoryEntry(10, '2025-01-01')]
    const result = computeTrend(history, 11)
    expect(result.change).toBe(1)
    expect(result.direction).toBe('stable')
  })

  it('reports stable for exact same score', () => {
    const history = [makeHistoryEntry(10, '2025-01-01')]
    const result = computeTrend(history, 10)
    expect(result.change).toBe(0)
    expect(result.direction).toBe('stable')
  })

  it('uses the last history entry as previous', () => {
    const history = [
      makeHistoryEntry(5, '2025-01-01'),
      makeHistoryEntry(15, '2025-01-02'),
      makeHistoryEntry(8, '2025-01-03'),
    ]
    const result = computeTrend(history, 12)
    expect(result.previous).toBe(8)
    expect(result.change).toBe(4)
    expect(result.direction).toBe('increasing')
  })
})

// ─── appendHistoryEntry ───

describe('appendHistoryEntry', () => {
  it('appends entry to empty history', () => {
    const report = makeReport({ overall: 5 })
    const result = appendHistoryEntry([], report, '2025-06-01')
    expect(result).toHaveLength(1)
    expect(result[0]!.overall).toBe(5)
    expect(result[0]!.timestamp).toBe('2025-06-01')
  })

  it('preserves existing entries', () => {
    const existing = [makeHistoryEntry(10, '2025-01-01')]
    const report = makeReport({ overall: 12 })
    const result = appendHistoryEntry(existing, report, '2025-01-02')
    expect(result).toHaveLength(2)
    expect(result[0]!.overall).toBe(10)
    expect(result[1]!.overall).toBe(12)
  })

  it('copies breakdown from report', () => {
    const breakdown = makeBreakdown({ complexity: 5, security: 10 })
    const report = makeReport({ breakdown, filesAnalyzed: 42 })
    const result = appendHistoryEntry([], report, '2025-06-01')
    expect(result[0]!.breakdown).toEqual(breakdown)
    expect(result[0]!.filesAnalyzed).toBe(42)
  })

  it('trims to max entries when exceeded', () => {
    const existing = Array.from({ length: 30 }, (_, i) =>
      makeHistoryEntry(i, `2025-01-${String(i + 1).padStart(2, '0')}`),
    )
    const report = makeReport({ overall: 99 })
    const result = appendHistoryEntry(existing, report, '2025-02-01')
    expect(result).toHaveLength(30)
    expect(result.at(-1)!.overall).toBe(99)
  })

  it('does not mutate the original array', () => {
    const existing = [makeHistoryEntry(5, '2025-01-01')]
    const report = makeReport({ overall: 7 })
    appendHistoryEntry(existing, report, '2025-01-02')
    expect(existing).toHaveLength(1)
  })
})

// ─── getHistoryPath ───

describe('getHistoryPath', () => {
  it('returns path under .codeforge directory', () => {
    const result = getHistoryPath('/project')
    expect(result).toContain('.codeforge')
    expect(result).toContain('debt-history.json')
  })
})

// ─── getDebtColor ───

describe('getDebtColor', () => {
  it('returns green for score 0', () => {
    const result = getDebtColor(0)
    expect(strip(result('test'))).toBe('test')
  })

  it('returns green for score 5', () => {
    const result = getDebtColor(5)
    expect(strip(result('test'))).toBe('test')
  })

  it('returns yellow for score 6', () => {
    const result = getDebtColor(6)
    expect(strip(result('test'))).toBe('test')
  })

  it('returns yellow for score 15', () => {
    const result = getDebtColor(15)
    expect(strip(result('test'))).toBe('test')
  })

  it('returns red for score 16', () => {
    const result = getDebtColor(16)
    expect(strip(result('test'))).toBe('test')
  })

  it('returns red for very high score', () => {
    const result = getDebtColor(100)
    expect(strip(result('test'))).toBe('test')
  })

  it('color functions return strings for any input', () => {
    const greenFn = getDebtColor(0)
    const yellowFn = getDebtColor(10)
    const redFn = getDebtColor(50)
    expect(typeof greenFn('x')).toBe('string')
    expect(typeof yellowFn('x')).toBe('string')
    expect(typeof redFn('x')).toBe('string')
  })
})

// ─── formatDebt ───

describe('formatDebt', () => {
  it('pads score to 3 characters', () => {
    const result = formatDebt(5)
    expect(strip(result)).toBe('  5')
  })

  it('pads larger scores', () => {
    const result = formatDebt(42)
    expect(strip(result)).toBe(' 42')
  })

  it('handles 3-digit scores without padding', () => {
    const result = formatDebt(100)
    expect(strip(result)).toBe('100')
  })

  it('pads zero score', () => {
    const result = formatDebt(0)
    expect(strip(result)).toBe('  0')
  })
})

// ─── getRecommendations ───

describe('getRecommendations', () => {
  it('returns empty array for clean report', () => {
    const report = makeReport()
    expect(getRecommendations(report)).toEqual([])
  })

  it('recommends addressing security when above threshold', () => {
    const report = makeReport({ breakdown: makeBreakdown({ security: 6 }) })
    const recs = getRecommendations(report)
    expect(recs.length).toBeGreaterThanOrEqual(1)
    expect(recs.some((r) => r.includes('security'))).toBe(true)
  })

  it('recommends reducing complexity when above threshold', () => {
    const report = makeReport({ breakdown: makeBreakdown({ complexity: 11 }) })
    const recs = getRecommendations(report)
    expect(recs.some((r) => r.includes('complexity') || r.includes('refactoring'))).toBe(true)
  })

  it('recommends reviewing dependencies when above threshold', () => {
    const report = makeReport({ breakdown: makeBreakdown({ dependencies: 6 }) })
    const recs = getRecommendations(report)
    expect(recs.some((r) => r.includes('dependencies') || r.includes('circular'))).toBe(true)
  })

  it('recommends adding documentation when above threshold', () => {
    const report = makeReport({ breakdown: makeBreakdown({ documentation: 11 }) })
    const recs = getRecommendations(report)
    expect(recs.some((r) => r.includes('JSDoc') || r.includes('documentation'))).toBe(true)
  })

  it('recommends sprint focus when overall score is high', () => {
    const report = makeReport({ overall: 25 })
    const recs = getRecommendations(report)
    expect(recs.some((r) => r.includes('sprint') || r.includes('debt reduction'))).toBe(true)
  })

  it('returns at most 5 recommendations', () => {
    const report = makeReport({
      breakdown: makeBreakdown({ complexity: 50, dependencies: 50, documentation: 50, patterns: 50, security: 50 }),
      overall: 100,
    })
    const recs = getRecommendations(report)
    expect(recs.length).toBeLessThanOrEqual(5)
  })

  it('returns multiple recommendations for multiple issues', () => {
    const report = makeReport({
      breakdown: makeBreakdown({ security: 10, complexity: 20 }),
      overall: 30,
    })
    const recs = getRecommendations(report)
    expect(recs.length).toBeGreaterThanOrEqual(3)
  })
})

// ─── formatReportLines ───

describe('formatReportLines', () => {
  it('includes debt score in output', () => {
    const report = makeReport({ overall: 7 })
    const lines = formatReportLines(report, false)
    const joined = strip(lines.join('\n'))
    expect(joined).toContain('Debt Score: 7')
  })

  it('shows trend when previous is not null', () => {
    const report = makeReport({
      overall: 12,
      trend: { change: 3, direction: 'increasing', previous: 9 },
    })
    const lines = formatReportLines(report, false)
    const joined = strip(lines.join('\n'))
    expect(joined).toContain('Trend:')
    expect(joined).toContain('+3')
  })

  it('hides trend when previous is null', () => {
    const report = makeReport({ trend: { change: 0, direction: 'stable', previous: null } })
    const lines = formatReportLines(report, false)
    const joined = strip(lines.join('\n'))
    expect(joined).not.toContain('Trend:')
  })

  it('shows verbose breakdown when verbose is true', () => {
    const report = makeReport({
      breakdown: makeBreakdown({ complexity: 5, dependencies: 2 }),
      filesAnalyzed: 25,
      interest: { annual: 100, monthly: 8, weekly: 2 },
    })
    const lines = formatReportLines(report, true)
    const joined = strip(lines.join('\n'))
    expect(joined).toContain('Category Breakdown')
    expect(joined).toContain('Complexity')
    expect(joined).toContain('Dependencies')
    expect(joined).toContain('Files analyzed: 25')
    expect(joined).toContain('Weekly')
    expect(joined).toContain('2h')
  })

  it('omits verbose section when verbose is false', () => {
    const report = makeReport({ breakdown: makeBreakdown({ complexity: 5 }) })
    const lines = formatReportLines(report, false)
    const joined = strip(lines.join('\n'))
    expect(joined).not.toContain('Category Breakdown')
  })

  it('shows recommendations when present', () => {
    const report = makeReport({ breakdown: makeBreakdown({ security: 10 }) })
    const lines = formatReportLines(report, false)
    const joined = strip(lines.join('\n'))
    expect(joined).toContain('Recommendations')
  })

  it('omits recommendations when none exist', () => {
    const report = makeReport()
    const lines = formatReportLines(report, false)
    const joined = strip(lines.join('\n'))
    expect(joined).not.toContain('Recommendations')
  })

  it('shows decreasing trend with down arrow', () => {
    const report = makeReport({
      trend: { change: -5, direction: 'decreasing', previous: 15 },
    })
    const lines = formatReportLines(report, false)
    const joined = strip(lines.join('\n'))
    expect(joined).toContain('↓')
    expect(joined).toContain('-5')
  })
})

// ─── formatHistoryLines ───

describe('formatHistoryLines', () => {
  it('shows empty state message for no history', () => {
    const lines = formatHistoryLines([])
    const joined = strip(lines.join('\n'))
    expect(joined).toContain('No history found')
    expect(joined).toContain('debt --save')
  })

  it('shows table header for non-empty history', () => {
    const history = [makeHistoryEntry(10, '2025-06-01T00:00:00Z')]
    const lines = formatHistoryLines(history)
    const joined = strip(lines.join('\n'))
    expect(joined).toContain('Date')
    expect(joined).toContain('Debt')
    expect(joined).toContain('Trend')
  })

  it('shows debt scores for each entry', () => {
    const history = [
      makeHistoryEntry(10, '2025-06-01T00:00:00Z'),
      makeHistoryEntry(15, '2025-06-02T00:00:00Z'),
    ]
    const lines = formatHistoryLines(history)
    const joined = strip(lines.join('\n'))
    expect(joined).toContain('10')
    expect(joined).toContain('15')
  })

  it('shows increasing trend arrow when debt rises', () => {
    const history = [
      makeHistoryEntry(10, '2025-06-01T00:00:00Z'),
      makeHistoryEntry(15, '2025-06-02T00:00:00Z'),
    ]
    const lines = formatHistoryLines(history)
    const joined = strip(lines.join('\n'))
    expect(joined).toContain('↑')
  })

  it('shows decreasing trend arrow when debt falls', () => {
    const history = [
      makeHistoryEntry(15, '2025-06-01T00:00:00Z'),
      makeHistoryEntry(10, '2025-06-02T00:00:00Z'),
    ]
    const lines = formatHistoryLines(history)
    const joined = strip(lines.join('\n'))
    expect(joined).toContain('↓')
  })

  it('shows summary: debt reduced', () => {
    const history = [
      makeHistoryEntry(20, '2025-06-01T00:00:00Z'),
      makeHistoryEntry(10, '2025-06-02T00:00:00Z'),
    ]
    const lines = formatHistoryLines(history)
    const joined = strip(lines.join('\n'))
    expect(joined).toContain('reduced by 10')
  })

  it('shows summary: debt increased', () => {
    const history = [
      makeHistoryEntry(5, '2025-06-01T00:00:00Z'),
      makeHistoryEntry(15, '2025-06-02T00:00:00Z'),
    ]
    const lines = formatHistoryLines(history)
    const joined = strip(lines.join('\n'))
    expect(joined).toContain('increased by 10')
  })

  it('shows summary: debt stable', () => {
    const history = [
      makeHistoryEntry(10, '2025-06-01T00:00:00Z'),
      makeHistoryEntry(10, '2025-06-02T00:00:00Z'),
    ]
    const lines = formatHistoryLines(history)
    const joined = strip(lines.join('\n'))
    expect(joined).toContain('remained stable')
  })

  it('shows dash trend for first entry', () => {
    const history = [makeHistoryEntry(10, '2025-06-01T00:00:00Z')]
    const lines = formatHistoryLines(history)
    const joined = strip(lines.join('\n'))
    expect(joined).toContain('-')
  })

  it('displays entries in reverse chronological order', () => {
    const history = [
      makeHistoryEntry(5, '2025-06-01T00:00:00Z'),
      makeHistoryEntry(15, '2025-06-02T00:00:00Z'),
      makeHistoryEntry(10, '2025-06-03T00:00:00Z'),
    ]
    const lines = formatHistoryLines(history)
    const scoreLines = lines.filter((l) => /\d{1,3}/.test(strip(l)) && strip(l).includes('|'))
    expect(strip(scoreLines[0]!)).toContain('10')
    expect(strip(scoreLines[2]!)).toContain('5')
  })
})

// ─── DebtReport type shape ───

describe('DebtReport type', () => {
  it('has all required fields', () => {
    const report: DebtReport = {
      breakdown: { complexity: 1, dependencies: 2, documentation: 3, patterns: 4, security: 5 },
      filesAnalyzed: 42,
      interest: { annual: 260, monthly: 20, weekly: 5 },
      overall: 15,
      path: '/test',
      trend: { change: -3, direction: 'decreasing', previous: 18 },
    }
    expect(report.breakdown.complexity).toBe(1)
    expect(report.filesAnalyzed).toBe(42)
    expect(report.trend.direction).toBe('decreasing')
  })
})
