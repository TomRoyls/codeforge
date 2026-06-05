import { describe, expect, test } from 'vitest'
import chalk from 'chalk'

import {
  appendHistoryEntry,
  calculateBreakdown,
  calculateInterest,
  calculateOverall,
  computeTrend,
  formatDebt,
  formatHistoryLines,
  formatReportLines,
  getDebtColor,
  getHistoryPath,
  getRecommendations,
  setupDebtRuleRegistry,
  WEEKS_PER_YEAR,
  type DebtBreakdown,
  type DebtHistoryEntry,
  type DebtReport,
} from '../../../src/commands/debt-helpers.js'
import { type RuleViolation } from '../../../src/ast/visitor.js'

// ============================================================================
// Constants
// ============================================================================

describe('WEEKS_PER_YEAR', () => {
  test('is 52', () => {
    expect(WEEKS_PER_YEAR).toBe(52)
  })
})

// ============================================================================
// calculateBreakdown
// ============================================================================

describe('calculateBreakdown', () => {
  const makeViolation = (ruleId: string): RuleViolation =>
    ({
      ruleId,
      severity: 'error',
      message: 'test',
      filePath: '/test.ts',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
    }) as RuleViolation

  test('returns zero breakdown for empty violations', () => {
    const result = calculateBreakdown([])
    expect(result.complexity).toBe(0)
    expect(result.dependencies).toBe(0)
    expect(result.documentation).toBe(0)
    expect(result.patterns).toBe(0)
    expect(result.security).toBe(0)
  })

  test('counts complexity violations with weight 3', () => {
    const result = calculateBreakdown([makeViolation('max-complexity')])
    expect(result.complexity).toBe(3)
  })

  test('counts multiple complexity violations', () => {
    const result = calculateBreakdown([
      makeViolation('max-complexity'),
      makeViolation('max-nested-callbacks'),
    ])
    expect(result.complexity).toBe(6)
  })

  test('counts security violations with weight 5', () => {
    const result = calculateBreakdown([makeViolation('no-eval')])
    expect(result.security).toBe(5)
  })

  test('counts dependencies violations with weight 2', () => {
    const result = calculateBreakdown([makeViolation('no-circular-deps')])
    expect(result.dependencies).toBe(2)
  })

  test('counts patterns violations with weight 1', () => {
    const result = calculateBreakdown([makeViolation('no-console')])
    expect(result.patterns).toBe(1)
  })

  test('counts documentation violations with weight 1', () => {
    const result = calculateBreakdown([makeViolation('require-jsdoc')])
    expect(result.documentation).toBe(1)
  })

  test('adds extra count for jsdoc-related rules', () => {
    const result = calculateBreakdown([makeViolation('check-jsdoc')])
    expect(result.documentation).toBe(1)
  })

  test('defaults unknown rules to complexity category', () => {
    const result = calculateBreakdown([makeViolation('totally-unknown-rule')])
    expect(result.complexity).toBe(3)
    expect(result.dependencies).toBe(0)
    expect(result.documentation).toBe(0)
    expect(result.patterns).toBe(0)
    expect(result.security).toBe(0)
  })

  test('handles mixed violations across all categories', () => {
    const result = calculateBreakdown([
      makeViolation('max-complexity'),
      makeViolation('no-circular-deps'),
      makeViolation('no-console'),
      makeViolation('no-eval'),
    ])
    expect(result.complexity).toBe(3)
    expect(result.dependencies).toBe(2)
    expect(result.patterns).toBe(1)
    expect(result.security).toBe(5)
  })
})

// ============================================================================
// calculateInterest
// ============================================================================

describe('calculateInterest', () => {
  test('returns zero interest for zero debt', () => {
    const result = calculateInterest(0)
    expect(result.weekly).toBe(0)
    expect(result.monthly).toBe(0)
    expect(result.annual).toBe(0)
  })

  test('calculates weekly hours correctly (15min per point)', () => {
    const result = calculateInterest(4)
    expect(result.weekly).toBe(1)
  })

  test('calculates monthly as 4x weekly', () => {
    const result = calculateInterest(4)
    expect(result.monthly).toBe(4)
  })

  test('calculates annual as 52x weekly', () => {
    const result = calculateInterest(4)
    expect(result.annual).toBe(52)
  })

  test('handles large debt points', () => {
    const result = calculateInterest(100)
    expect(result.weekly).toBe(25)
    expect(result.monthly).toBe(100)
    expect(result.annual).toBe(1300)
  })

  test('handles single debt point', () => {
    const result = calculateInterest(1)
    expect(result.weekly).toBe(0)
  })

  test('rounds results', () => {
    const result = calculateInterest(1)
    expect(Number.isInteger(result.weekly)).toBe(true)
    expect(Number.isInteger(result.monthly)).toBe(true)
    expect(Number.isInteger(result.annual)).toBe(true)
  })
})

// ============================================================================
// calculateOverall
// ============================================================================

describe('calculateOverall', () => {
  const makeBreakdown = (overrides: Partial<DebtBreakdown> = {}): DebtBreakdown => ({
    complexity: 0,
    dependencies: 0,
    documentation: 0,
    patterns: 0,
    security: 0,
    ...overrides,
  })

  test('returns 0 for zero breakdown with 1 file', () => {
    expect(calculateOverall(makeBreakdown(), 1)).toBe(0)
  })

  test('returns 0 for zero breakdown with 0 files (normalized to 1)', () => {
    expect(calculateOverall(makeBreakdown(), 0)).toBe(0)
  })

  test('calculates total divided by file count', () => {
    const breakdown = makeBreakdown({ complexity: 10, security: 5 })
    expect(calculateOverall(breakdown, 1)).toBe(15)
  })

  test('normalizes by file count', () => {
    const breakdown = makeBreakdown({ complexity: 10 })
    expect(calculateOverall(breakdown, 5)).toBe(2)
  })

  test('rounds result', () => {
    const breakdown = makeBreakdown({ complexity: 10 })
    expect(calculateOverall(breakdown, 3)).toBe(3)
  })

  test('sums all categories', () => {
    const breakdown = makeBreakdown({
      complexity: 3,
      dependencies: 2,
      documentation: 1,
      patterns: 1,
      security: 5,
    })
    expect(calculateOverall(breakdown, 1)).toBe(12)
  })

  test('handles negative files as 1 (max)', () => {
    const breakdown = makeBreakdown({ complexity: 10 })
    expect(calculateOverall(breakdown, -5)).toBe(10)
  })

  test('handles large file count', () => {
    const breakdown = makeBreakdown({ complexity: 300 })
    expect(calculateOverall(breakdown, 100)).toBe(3)
  })
})

// ============================================================================
// getDebtColor
// ============================================================================

describe('getDebtColor', () => {
  test('returns green for score 0', () => {
    const colorFn = getDebtColor(0)
    expect(colorFn).toBe(chalk.green)
  })

  test('returns green for score 5 (boundary)', () => {
    const colorFn = getDebtColor(5)
    expect(colorFn).toBe(chalk.green)
  })

  test('returns yellow for score 6', () => {
    const colorFn = getDebtColor(6)
    expect(colorFn).toBe(chalk.yellow)
  })

  test('returns yellow for score 15 (boundary)', () => {
    const colorFn = getDebtColor(15)
    expect(colorFn).toBe(chalk.yellow)
  })

  test('returns red for score 16', () => {
    const colorFn = getDebtColor(16)
    expect(colorFn).toBe(chalk.red)
  })

  test('returns red for score 100', () => {
    const colorFn = getDebtColor(100)
    expect(colorFn).toBe(chalk.red)
  })

  test('color functions produce colored output', () => {
    const colorFn = getDebtColor(0)
    const result = colorFn('test')
    expect(result).toContain('test')
  })
})

// ============================================================================
// formatDebt
// ============================================================================

describe('formatDebt', () => {
  test('pads single digit to 3 chars', () => {
    const result = formatDebt(3)
    expect(result).toContain('3')
  })

  test('pads double digit', () => {
    const result = formatDebt(10)
    expect(result).toContain('10')
  })

  test('pads triple digit', () => {
    const result = formatDebt(100)
    expect(result).toContain('100')
  })

  test('uses green for low score', () => {
    const result = formatDebt(3)
    expect(result).toContain('3')
  })

  test('uses yellow for medium score', () => {
    const result = formatDebt(10)
    expect(result).toContain('10')
  })

  test('uses red for high score', () => {
    const result = formatDebt(25)
    expect(result).toContain('25')
  })

  test('pads to at least 3 chars', () => {
    const result = formatDebt(5)
    const stripped = result.replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).toBe('  5')
  })
})

// ============================================================================
// getHistoryPath
// ============================================================================

describe('getHistoryPath', () => {
  test('returns path with .codeforge dir', () => {
    const result = getHistoryPath('/project')
    expect(result).toBe('/project/.codeforge/debt-history.json')
  })

  test('handles nested paths', () => {
    const result = getHistoryPath('/my/project')
    expect(result).toBe('/my/project/.codeforge/debt-history.json')
  })

  test('handles root path', () => {
    const result = getHistoryPath('/')
    expect(result).toBe('/.codeforge/debt-history.json')
  })
})

// ============================================================================
// getRecommendations
// ============================================================================

describe('getRecommendations', () => {
  const makeReport = (overrides: Partial<DebtReport> = {}): DebtReport => ({
    breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
    filesAnalyzed: 10,
    interest: { annual: 0, monthly: 0, weekly: 0 },
    overall: 0,
    path: '/test',
    trend: { change: 0, direction: 'stable', previous: null },
    ...overrides,
  })

  test('returns empty array for low debt', () => {
    const result = getRecommendations(makeReport())
    expect(result).toEqual([])
  })

  test('returns security recommendation when security > 5', () => {
    const result = getRecommendations(
      makeReport({
        breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 6 },
      }),
    )
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('security')
  })

  test('returns complexity recommendation when complexity > 10', () => {
    const result = getRecommendations(
      makeReport({
        breakdown: { complexity: 11, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
      }),
    )
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('complexity')
  })

  test('returns dependencies recommendation when dependencies > 5', () => {
    const result = getRecommendations(
      makeReport({
        breakdown: { complexity: 0, dependencies: 6, documentation: 0, patterns: 0, security: 0 },
      }),
    )
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('dependencies')
  })

  test('returns documentation recommendation when documentation > 10', () => {
    const result = getRecommendations(
      makeReport({
        breakdown: { complexity: 0, dependencies: 0, documentation: 11, patterns: 0, security: 0 },
      }),
    )
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('JSDoc')
  })

  test('returns overall recommendation when overall > 20', () => {
    const result = getRecommendations(makeReport({ overall: 21 }))
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('sprint')
  })

  test('returns multiple recommendations for multiple issues', () => {
    const result = getRecommendations(
      makeReport({
        breakdown: { complexity: 11, dependencies: 6, documentation: 0, patterns: 0, security: 6 },
        overall: 25,
      }),
    )
    expect(result.length).toBeGreaterThanOrEqual(3)
  })

  test('limits to 5 recommendations', () => {
    const result = getRecommendations(
      makeReport({
        breakdown: { complexity: 11, dependencies: 6, documentation: 11, patterns: 0, security: 6 },
        overall: 25,
      }),
    )
    expect(result.length).toBeLessThanOrEqual(5)
  })

  test('does not return security recommendation at threshold (5)', () => {
    const result = getRecommendations(
      makeReport({
        breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 5 },
      }),
    )
    expect(result).toEqual([])
  })

  test('does not return complexity recommendation at threshold (10)', () => {
    const result = getRecommendations(
      makeReport({
        breakdown: { complexity: 10, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
      }),
    )
    expect(result).toEqual([])
  })

  test('does not return overall recommendation at threshold (20)', () => {
    const result = getRecommendations(makeReport({ overall: 20 }))
    expect(result).toEqual([])
  })

  test('all recommendations are non-empty strings', () => {
    const result = getRecommendations(
      makeReport({
        breakdown: { complexity: 11, dependencies: 6, documentation: 0, patterns: 0, security: 6 },
        overall: 25,
      }),
    )
    for (const rec of result) {
      expect(typeof rec).toBe('string')
      expect(rec.length).toBeGreaterThan(0)
    }
  })
})

// ============================================================================
// setupDebtRuleRegistry
// ============================================================================

describe('setupDebtRuleRegistry', () => {
  test('returns a RuleRegistry instance', async () => {
    const registry = await setupDebtRuleRegistry()
    expect(registry).toBeDefined()
    expect(typeof registry.runRulesBatched).toBe('function')
  })

  test('loads rules into registry', async () => {
    const registry = await setupDebtRuleRegistry()
    const rules = registry.getEnabledRules()
    expect(rules.length).toBeGreaterThan(0)
  })
})

// ============================================================================
// computeTrend
// ============================================================================

describe('computeTrend', () => {
  test('returns stable with null previous for empty history', () => {
    const result = computeTrend([], 10)
    expect(result).toEqual({ change: 0, direction: 'stable', previous: null })
  })

  test('computes increasing trend when score rises by more than 1', () => {
    const history: DebtHistoryEntry[] = [
      {
        breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
        filesAnalyzed: 1,
        overall: 5,
        timestamp: '2024-01-01',
      },
    ]
    const result = computeTrend(history, 10)
    expect(result).toEqual({ change: 5, direction: 'increasing', previous: 5 })
  })

  test('computes decreasing trend when score drops by more than 1', () => {
    const history: DebtHistoryEntry[] = [
      {
        breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
        filesAnalyzed: 1,
        overall: 10,
        timestamp: '2024-01-01',
      },
    ]
    const result = computeTrend(history, 5)
    expect(result).toEqual({ change: -5, direction: 'decreasing', previous: 10 })
  })

  test('returns stable when change is exactly 1', () => {
    const history: DebtHistoryEntry[] = [
      {
        breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
        filesAnalyzed: 1,
        overall: 10,
        timestamp: '2024-01-01',
      },
    ]
    const result = computeTrend(history, 11)
    expect(result).toEqual({ change: 1, direction: 'stable', previous: 10 })
  })

  test('returns stable when change is exactly -1', () => {
    const history: DebtHistoryEntry[] = [
      {
        breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
        filesAnalyzed: 1,
        overall: 10,
        timestamp: '2024-01-01',
      },
    ]
    const result = computeTrend(history, 9)
    expect(result).toEqual({ change: -1, direction: 'stable', previous: 10 })
  })

  test('returns stable when no change', () => {
    const history: DebtHistoryEntry[] = [
      {
        breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
        filesAnalyzed: 1,
        overall: 10,
        timestamp: '2024-01-01',
      },
    ]
    const result = computeTrend(history, 10)
    expect(result).toEqual({ change: 0, direction: 'stable', previous: 10 })
  })

  test('uses last history entry as previous', () => {
    const history: DebtHistoryEntry[] = [
      {
        breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
        filesAnalyzed: 1,
        overall: 5,
        timestamp: '2024-01-01',
      },
      {
        breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
        filesAnalyzed: 1,
        overall: 8,
        timestamp: '2024-01-02',
      },
      {
        breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
        filesAnalyzed: 1,
        overall: 12,
        timestamp: '2024-01-03',
      },
    ]
    const result = computeTrend(history, 15)
    expect(result.previous).toBe(12)
    expect(result.change).toBe(3)
  })
})

// ============================================================================
// appendHistoryEntry
// ============================================================================

describe('appendHistoryEntry', () => {
  const makeReport = (overrides: Partial<DebtReport> = {}): DebtReport => ({
    breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
    filesAnalyzed: 10,
    interest: { annual: 0, monthly: 0, weekly: 0 },
    overall: 5,
    path: '/test',
    trend: { change: 0, direction: 'stable', previous: null },
    ...overrides,
  })

  test('appends entry to empty history', () => {
    const report = makeReport()
    const result = appendHistoryEntry([], report, '2024-01-01')
    expect(result).toHaveLength(1)
    expect(result[0]!.overall).toBe(5)
    expect(result[0]!.timestamp).toBe('2024-01-01')
  })

  test('preserves breakdown and filesAnalyzed from report', () => {
    const report = makeReport({
      breakdown: { complexity: 3, dependencies: 2, documentation: 1, patterns: 0, security: 5 },
      filesAnalyzed: 42,
    })
    const result = appendHistoryEntry([], report, '2024-01-01')
    expect(result[0]!.breakdown).toEqual({
      complexity: 3,
      dependencies: 2,
      documentation: 1,
      patterns: 0,
      security: 5,
    })
    expect(result[0]!.filesAnalyzed).toBe(42)
  })

  test('appends to existing history', () => {
    const existing: DebtHistoryEntry[] = [
      {
        breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
        filesAnalyzed: 1,
        overall: 3,
        timestamp: '2024-01-01',
      },
    ]
    const report = makeReport({ overall: 5 })
    const result = appendHistoryEntry(existing, report, '2024-01-02')
    expect(result).toHaveLength(2)
    expect(result[0]!.overall).toBe(3)
    expect(result[1]!.overall).toBe(5)
  })

  test('does not mutate original array', () => {
    const original: DebtHistoryEntry[] = [
      {
        breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
        filesAnalyzed: 1,
        overall: 3,
        timestamp: '2024-01-01',
      },
    ]
    const report = makeReport()
    appendHistoryEntry(original, report, '2024-01-02')
    expect(original).toHaveLength(1)
  })

  test('truncates when exceeding MAX_DEBT_HISTORY_ENTRIES', () => {
    const entries: DebtHistoryEntry[] = Array.from({ length: 30 }, (_, i) => ({
      breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
      filesAnalyzed: 1,
      overall: i,
      timestamp: `2024-01-${String(i + 1).padStart(2, '0')}`,
    }))
    const report = makeReport({ overall: 99 })
    const result = appendHistoryEntry(entries, report, '2024-01-31')
    expect(result).toHaveLength(30)
    expect(result[0]!.overall).toBe(1)
    expect(result[result.length - 1]!.overall).toBe(99)
  })

  test('does not truncate when at exactly MAX_DEBT_HISTORY_ENTRIES', () => {
    const entries: DebtHistoryEntry[] = Array.from({ length: 29 }, (_, i) => ({
      breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
      filesAnalyzed: 1,
      overall: i,
      timestamp: `2024-01-${String(i + 1).padStart(2, '0')}`,
    }))
    const report = makeReport({ overall: 99 })
    const result = appendHistoryEntry(entries, report, '2024-01-30')
    expect(result).toHaveLength(30)
    expect(result[0]!.overall).toBe(0)
  })
})

// ============================================================================
// formatReportLines
// ============================================================================

describe('formatReportLines', () => {
  const makeReport = (overrides: Partial<DebtReport> = {}): DebtReport => ({
    breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
    filesAnalyzed: 10,
    interest: { annual: 0, monthly: 0, weekly: 0 },
    overall: 5,
    path: '/test',
    trend: { change: 0, direction: 'stable', previous: null },
    ...overrides,
  })

  test('returns non-empty array', () => {
    const lines = formatReportLines(makeReport(), false)
    expect(lines.length).toBeGreaterThan(0)
  })

  test('includes debt score', () => {
    const lines = formatReportLines(makeReport({ overall: 42 }), false)
    const joined = lines.join('\n')
    expect(joined).toContain('42')
  })

  test('includes "Technical Debt Analysis" header', () => {
    const lines = formatReportLines(makeReport(), false)
    const joined = lines.join('\n')
    expect(joined).toContain('Technical Debt Analysis')
  })

  test('excludes trend line when previous is null', () => {
    const lines = formatReportLines(
      makeReport({ trend: { change: 0, direction: 'stable', previous: null } }),
      false,
    )
    const joined = lines.join('\n')
    expect(joined).not.toContain('Trend:')
  })

  test('includes trend line when previous is present', () => {
    const lines = formatReportLines(
      makeReport({ trend: { change: 3, direction: 'increasing', previous: 5 } }),
      false,
    )
    const joined = lines.join('\n')
    expect(joined).toContain('Trend:')
    expect(joined).toContain('↑')
  })

  test('shows decreasing trend arrow', () => {
    const lines = formatReportLines(
      makeReport({ trend: { change: -5, direction: 'decreasing', previous: 10 } }),
      false,
    )
    const joined = lines.join('\n')
    expect(joined).toContain('↓')
  })

  test('shows stable trend arrow', () => {
    const lines = formatReportLines(
      makeReport({ trend: { change: 0, direction: 'stable', previous: 5 } }),
      false,
    )
    const joined = lines.join('\n')
    expect(joined).toContain('→')
  })

  test('excludes verbose breakdown when verbose is false', () => {
    const lines = formatReportLines(makeReport(), false)
    const joined = lines.join('\n')
    expect(joined).not.toContain('Category Breakdown:')
  })

  test('includes verbose breakdown when verbose is true', () => {
    const lines = formatReportLines(makeReport(), true)
    const joined = lines.join('\n')
    expect(joined).toContain('Category Breakdown:')
    expect(joined).toContain('Complexity:')
    expect(joined).toContain('Dependencies:')
    expect(joined).toContain('Documentation:')
    expect(joined).toContain('Patterns:')
    expect(joined).toContain('Security:')
  })

  test('includes interest when verbose', () => {
    const lines = formatReportLines(
      makeReport({ interest: { weekly: 5, monthly: 20, annual: 260 } }),
      true,
    )
    const joined = lines.join('\n')
    expect(joined).toContain('Weekly:')
    expect(joined).toContain('Monthly:')
    expect(joined).toContain('Annual:')
  })

  test('includes files analyzed when verbose', () => {
    const lines = formatReportLines(makeReport({ filesAnalyzed: 42 }), true)
    const joined = lines.join('\n')
    expect(joined).toContain('42')
  })

  test('excludes recommendations when none', () => {
    const lines = formatReportLines(makeReport(), false)
    const joined = lines.join('\n')
    expect(joined).not.toContain('Recommendations:')
  })

  test('includes recommendations when present', () => {
    const lines = formatReportLines(
      makeReport({
        breakdown: { complexity: 11, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
      }),
      false,
    )
    const joined = lines.join('\n')
    expect(joined).toContain('Recommendations:')
  })

  test('prepends plus sign for positive trend change', () => {
    const lines = formatReportLines(
      makeReport({ trend: { change: 5, direction: 'increasing', previous: 3 } }),
      false,
    )
    const joined = lines.join('\n')
    expect(joined).toContain('+5')
  })
})

// ============================================================================
// formatHistoryLines
// ============================================================================

describe('formatHistoryLines', () => {
  const makeEntry = (overall: number, timestamp: string): DebtHistoryEntry => ({
    breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
    filesAnalyzed: 1,
    overall,
    timestamp,
  })

  test('shows empty message for empty history', () => {
    const lines = formatHistoryLines([])
    const joined = lines.join('\n')
    expect(joined).toContain('No history found')
  })

  test('includes "Technical Debt History" header', () => {
    const lines = formatHistoryLines([makeEntry(10, '2024-01-01')])
    const joined = lines.join('\n')
    expect(joined).toContain('Technical Debt History')
  })

  test('shows table header for non-empty history', () => {
    const lines = formatHistoryLines([makeEntry(10, '2024-01-01')])
    const joined = lines.join('\n')
    expect(joined).toContain('Date')
    expect(joined).toContain('Debt')
    expect(joined).toContain('Trend')
  })

  test('shows dash when single entry has no previous', () => {
    const lines = formatHistoryLines([makeEntry(10, '2024-01-01')])
    const joined = lines.join('\n')
    expect(joined).toContain('| -')
  })

  test('shows down arrow for decreasing debt', () => {
    const lines = formatHistoryLines([makeEntry(10, '2024-01-01'), makeEntry(5, '2024-01-02')])
    const joined = lines.join('\n')
    expect(joined).toContain('↓')
    expect(joined).toContain('5')
  })

  test('shows up arrow for increasing debt', () => {
    const lines = formatHistoryLines([makeEntry(5, '2024-01-01'), makeEntry(10, '2024-01-02')])
    const joined = lines.join('\n')
    expect(joined).toContain('↑')
  })

  test('shows "reduced" summary when latest is lower than oldest', () => {
    const lines = formatHistoryLines([makeEntry(20, '2024-01-01'), makeEntry(10, '2024-01-02')])
    const joined = lines.join('\n')
    expect(joined).toContain('reduced')
    expect(joined).toContain('10')
  })

  test('shows "increased" summary when latest is higher than oldest', () => {
    const lines = formatHistoryLines([makeEntry(5, '2024-01-01'), makeEntry(15, '2024-01-02')])
    const joined = lines.join('\n')
    expect(joined).toContain('increased')
  })

  test('shows "stable" summary when latest equals oldest', () => {
    const lines = formatHistoryLines([makeEntry(10, '2024-01-01'), makeEntry(10, '2024-01-02')])
    const joined = lines.join('\n')
    expect(joined).toContain('stable')
  })

  test('displays entries in reverse chronological order', () => {
    const lines = formatHistoryLines([
      makeEntry(5, '2024-01-01'),
      makeEntry(10, '2024-01-02'),
      makeEntry(15, '2024-01-03'),
    ])
    const joined = lines.join('\n')
    const pos15 = joined.indexOf('|   15 |')
    const pos10 = joined.indexOf('|   10 |')
    const pos5 = joined.indexOf('|    5 |')
    expect(pos15).toBeLessThan(pos10)
    expect(pos10).toBeLessThan(pos5)
  })
})

// ============================================================================
// calculateBreakdown — additional coverage
// ============================================================================

describe('calculateBreakdown — additional', () => {
  const makeViolation = (ruleId: string): RuleViolation =>
    ({
      ruleId,
      severity: 'error',
      message: 'test',
      filePath: '/test.ts',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
    }) as RuleViolation

  test('two no-eval violations accumulate security weight', () => {
    const result = calculateBreakdown([makeViolation('no-eval'), makeViolation('no-eval')])
    expect(result.security).toBe(10)
  })

  test('three no-eval violations give security 15', () => {
    const result = calculateBreakdown([
      makeViolation('no-eval'),
      makeViolation('no-eval'),
      makeViolation('no-eval'),
    ])
    expect(result.security).toBe(15)
  })

  test('no-deprecated-api counts as security weight 5', () => {
    const result = calculateBreakdown([makeViolation('no-deprecated-api')])
    expect(result.security).toBe(5)
  })

  test('no-unsafe-return counts as security weight 5', () => {
    const result = calculateBreakdown([makeViolation('no-unsafe-return')])
    expect(result.security).toBe(5)
  })

  test('no-dynamic-delete counts as security weight 5', () => {
    const result = calculateBreakdown([makeViolation('no-dynamic-delete')])
    expect(result.security).toBe(5)
  })

  test('max-depth counts as complexity weight 3', () => {
    const result = calculateBreakdown([makeViolation('max-depth')])
    expect(result.complexity).toBe(3)
  })

  test('max-params counts as complexity weight 3', () => {
    const result = calculateBreakdown([makeViolation('max-params')])
    expect(result.complexity).toBe(3)
  })

  test('max-lines counts as complexity weight 3', () => {
    const result = calculateBreakdown([makeViolation('max-lines')])
    expect(result.complexity).toBe(3)
  })

  test('max-lines-per-function counts as complexity weight 3', () => {
    const result = calculateBreakdown([makeViolation('max-lines-per-function')])
    expect(result.complexity).toBe(3)
  })

  test('no-unused-exports counts as dependencies weight 2', () => {
    const result = calculateBreakdown([makeViolation('no-unused-exports')])
    expect(result.dependencies).toBe(2)
  })

  test('consistent-imports counts as dependencies weight 2', () => {
    const result = calculateBreakdown([makeViolation('consistent-imports')])
    expect(result.dependencies).toBe(2)
  })

  test('no-barrel-imports counts as dependencies weight 2', () => {
    const result = calculateBreakdown([makeViolation('no-barrel-imports')])
    expect(result.dependencies).toBe(2)
  })

  test('no-explicit-any counts as patterns weight 1', () => {
    const result = calculateBreakdown([makeViolation('no-explicit-any')])
    expect(result.patterns).toBe(1)
  })

  test('prefer-const counts as patterns weight 1', () => {
    const result = calculateBreakdown([makeViolation('prefer-const')])
    expect(result.patterns).toBe(1)
  })

  test('no-duplicate-code counts as patterns weight 1', () => {
    const result = calculateBreakdown([makeViolation('no-duplicate-code')])
    expect(result.patterns).toBe(1)
  })

  test('performance rules (no-await-in-loop) are ignored', () => {
    const result = calculateBreakdown([makeViolation('no-await-in-loop')])
    expect(result.complexity).toBe(0)
    expect(result.dependencies).toBe(0)
    expect(result.documentation).toBe(0)
    expect(result.patterns).toBe(0)
    expect(result.security).toBe(0)
  })

  test('correctness rules (no-empty-catch) are ignored', () => {
    const result = calculateBreakdown([makeViolation('no-empty-catch')])
    expect(result.complexity).toBe(0)
    expect(result.dependencies).toBe(0)
    expect(result.documentation).toBe(0)
    expect(result.patterns).toBe(0)
    expect(result.security).toBe(0)
  })

  test('testing rules (no-skipped-tests) are ignored', () => {
    const result = calculateBreakdown([makeViolation('no-skipped-tests')])
    expect(result.complexity).toBe(0)
    expect(result.dependencies).toBe(0)
    expect(result.documentation).toBe(0)
    expect(result.patterns).toBe(0)
    expect(result.security).toBe(0)
  })

  test('ruleId containing "documentation" adds to undocumented count', () => {
    const result = calculateBreakdown([makeViolation('require-documentation')])
    expect(result.documentation).toBe(1)
  })

  test('ruleId containing both "documentation" and "jsdoc" counted once', () => {
    const result = calculateBreakdown([makeViolation('check-documentation-jsdoc')])
    expect(result.documentation).toBe(1)
  })

  test('multiple jsdoc-containing rules accumulate documentation', () => {
    const result = calculateBreakdown([
      makeViolation('require-jsdoc'),
      makeViolation('check-jsdoc'),
    ])
    expect(result.documentation).toBe(2)
  })

  test('jsdoc rule also adds to complexity via default category', () => {
    const result = calculateBreakdown([makeViolation('require-jsdoc')])
    expect(result.complexity).toBe(3)
    expect(result.documentation).toBe(1)
  })

  test('large batch of mixed violations', () => {
    const violations = [
      makeViolation('max-complexity'),
      makeViolation('max-complexity'),
      makeViolation('no-eval'),
      makeViolation('no-circular-deps'),
      makeViolation('no-console'),
      makeViolation('no-console'),
      makeViolation('no-console'),
      makeViolation('require-jsdoc'),
    ]
    const result = calculateBreakdown(violations)
    expect(result.complexity).toBe(9)
    expect(result.security).toBe(5)
    expect(result.dependencies).toBe(2)
    expect(result.patterns).toBe(3)
    expect(result.documentation).toBe(1)
  })

  test('only complexity violations produces zeros elsewhere', () => {
    const result = calculateBreakdown([
      makeViolation('max-complexity'),
      makeViolation('max-depth'),
      makeViolation('max-params'),
    ])
    expect(result.complexity).toBe(9)
    expect(result.security).toBe(0)
    expect(result.dependencies).toBe(0)
    expect(result.documentation).toBe(0)
    expect(result.patterns).toBe(0)
  })

  test('only security violations produces zeros elsewhere', () => {
    const result = calculateBreakdown([makeViolation('no-eval'), makeViolation('no-unsafe-return')])
    expect(result.complexity).toBe(0)
    expect(result.security).toBe(10)
    expect(result.dependencies).toBe(0)
    expect(result.documentation).toBe(0)
    expect(result.patterns).toBe(0)
  })
})

// ============================================================================
// calculateInterest — additional coverage
// ============================================================================

describe('calculateInterest — additional', () => {
  test('2 debt points produces correct values', () => {
    const result = calculateInterest(2)
    expect(result.weekly).toBe(1)
    expect(result.monthly).toBe(2)
    expect(result.annual).toBe(26)
  })

  test('3 debt points produces correct values', () => {
    const result = calculateInterest(3)
    expect(result.weekly).toBe(1)
    expect(result.monthly).toBe(3)
    expect(result.annual).toBe(39)
  })

  test('8 debt points produces correct values', () => {
    const result = calculateInterest(8)
    expect(result.weekly).toBe(2)
    expect(result.monthly).toBe(8)
    expect(result.annual).toBe(104)
  })

  test('20 debt points produces correct values', () => {
    const result = calculateInterest(20)
    expect(result.weekly).toBe(5)
    expect(result.monthly).toBe(20)
    expect(result.annual).toBe(260)
  })

  test('50 debt points produces correct values', () => {
    const result = calculateInterest(50)
    expect(result.weekly).toBe(13)
    expect(result.monthly).toBe(50)
    expect(result.annual).toBe(650)
  })

  test('very large debt points', () => {
    const result = calculateInterest(1000)
    expect(result.weekly).toBe(250)
    expect(result.monthly).toBe(1000)
    expect(result.annual).toBe(13000)
  })

  test('5 debt points produces correct values', () => {
    const result = calculateInterest(5)
    expect(result.weekly).toBe(1)
    expect(result.monthly).toBe(5)
    expect(result.annual).toBe(65)
  })

  test('10 debt points produces correct values', () => {
    const result = calculateInterest(10)
    expect(result.weekly).toBe(3)
    expect(result.monthly).toBe(10)
    expect(result.annual).toBe(130)
  })

  test('annual equals 52 times weeklyHours before rounding', () => {
    const result = calculateInterest(7)
    expect(result.annual).toBe(91)
  })
})

// ============================================================================
// calculateOverall — additional coverage
// ============================================================================

describe('calculateOverall — additional', () => {
  const makeBreakdown = (overrides: Partial<DebtBreakdown> = {}): DebtBreakdown => ({
    complexity: 0,
    dependencies: 0,
    documentation: 0,
    patterns: 0,
    security: 0,
    ...overrides,
  })

  test('only security category contributes', () => {
    const breakdown = makeBreakdown({ security: 25 })
    expect(calculateOverall(breakdown, 1)).toBe(25)
  })

  test('only dependencies category contributes', () => {
    const breakdown = makeBreakdown({ dependencies: 14 })
    expect(calculateOverall(breakdown, 1)).toBe(14)
  })

  test('only documentation category contributes', () => {
    const breakdown = makeBreakdown({ documentation: 7 })
    expect(calculateOverall(breakdown, 1)).toBe(7)
  })

  test('only patterns category contributes', () => {
    const breakdown = makeBreakdown({ patterns: 3 })
    expect(calculateOverall(breakdown, 1)).toBe(3)
  })

  test('two categories combined', () => {
    const breakdown = makeBreakdown({ security: 10, complexity: 6 })
    expect(calculateOverall(breakdown, 1)).toBe(16)
  })

  test('fractional division rounds down correctly', () => {
    const breakdown = makeBreakdown({ complexity: 10 })
    expect(calculateOverall(breakdown, 3)).toBe(3)
  })

  test('fractional division rounds up correctly', () => {
    const breakdown = makeBreakdown({ complexity: 20 })
    expect(calculateOverall(breakdown, 3)).toBe(7)
  })

  test('very large breakdown values', () => {
    const breakdown = makeBreakdown({ complexity: 1000, security: 2000 })
    expect(calculateOverall(breakdown, 1)).toBe(3000)
  })

  test('file count of 2 divides correctly', () => {
    const breakdown = makeBreakdown({ complexity: 10 })
    expect(calculateOverall(breakdown, 2)).toBe(5)
  })

  test('all zeros remains zero with any file count', () => {
    const breakdown = makeBreakdown()
    expect(calculateOverall(breakdown, 100)).toBe(0)
  })

  test('identity: breakdown total equals result with 1 file', () => {
    const breakdown = makeBreakdown({
      complexity: 5,
      dependencies: 4,
      documentation: 3,
      patterns: 2,
      security: 1,
    })
    expect(calculateOverall(breakdown, 1)).toBe(15)
  })
})

// ============================================================================
// getDebtColor — additional coverage
// ============================================================================

describe('getDebtColor — additional', () => {
  test('score 1 returns green', () => {
    expect(getDebtColor(1)).toBe(chalk.green)
  })

  test('score 2 returns green', () => {
    expect(getDebtColor(2)).toBe(chalk.green)
  })

  test('score 3 returns green', () => {
    expect(getDebtColor(3)).toBe(chalk.green)
  })

  test('score 4 returns green', () => {
    expect(getDebtColor(4)).toBe(chalk.green)
  })

  test('score 7 returns yellow', () => {
    expect(getDebtColor(7)).toBe(chalk.yellow)
  })

  test('score 10 returns yellow', () => {
    expect(getDebtColor(10)).toBe(chalk.yellow)
  })

  test('score 14 returns yellow', () => {
    expect(getDebtColor(14)).toBe(chalk.yellow)
  })

  test('score 20 returns red', () => {
    expect(getDebtColor(20)).toBe(chalk.red)
  })

  test('score 50 returns red', () => {
    expect(getDebtColor(50)).toBe(chalk.red)
  })

  test('green color function produces output containing text', () => {
    expect(getDebtColor(2)('hello')).toContain('hello')
  })

  test('yellow color function produces output containing text', () => {
    expect(getDebtColor(8)('world')).toContain('world')
  })

  test('red color function produces output containing text', () => {
    expect(getDebtColor(20)('test')).toContain('test')
  })
})

// ============================================================================
// formatDebt — additional coverage
// ============================================================================

describe('formatDebt — additional', () => {
  test('score 0 is green and padded', () => {
    const result = formatDebt(0)
    expect(result).toContain('0')
  })

  test('score 1 is green', () => {
    const result = formatDebt(1)
    const stripped = result.replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).toBe('  1')
  })

  test('score 6 is yellow', () => {
    const result = formatDebt(6)
    const stripped = result.replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).toBe('  6')
  })

  test('score 16 is red', () => {
    const result = formatDebt(16)
    const stripped = result.replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).toBe(' 16')
  })

  test('score 999 is red and 3 chars', () => {
    const result = formatDebt(999)
    const stripped = result.replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).toBe('999')
  })

  test('score 5 at green/yellow boundary is green', () => {
    const result = formatDebt(5)
    expect(result).toContain('5')
  })

  test('score 15 at yellow/red boundary is yellow', () => {
    const result = formatDebt(15)
    expect(result).toContain('15')
  })

  test('score 0 exact stripped output', () => {
    const result = formatDebt(0)
    const stripped = result.replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).toBe('  0')
  })
})

// ============================================================================
// getHistoryPath — additional coverage
// ============================================================================

describe('getHistoryPath — additional', () => {
  test('handles relative path', () => {
    const result = getHistoryPath('myproject')
    expect(result).toBe('myproject/.codeforge/debt-history.json')
  })

  test('handles dot path', () => {
    const result = getHistoryPath('.')
    expect(result).toBe('.codeforge/debt-history.json')
  })

  test('handles deeply nested path', () => {
    const result = getHistoryPath('/a/b/c/d')
    expect(result).toBe('/a/b/c/d/.codeforge/debt-history.json')
  })

  test('produces consistent results', () => {
    const result1 = getHistoryPath('/project')
    const result2 = getHistoryPath('/project')
    expect(result1).toBe(result2)
  })

  test('path ends with expected filename', () => {
    const result = getHistoryPath('/test')
    expect(result.endsWith('debt-history.json')).toBe(true)
  })
})

// ============================================================================
// getRecommendations — additional coverage
// ============================================================================

describe('getRecommendations — additional', () => {
  const makeReport = (overrides: Partial<DebtReport> = {}): DebtReport => ({
    breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
    filesAnalyzed: 10,
    interest: { annual: 0, monthly: 0, weekly: 0 },
    overall: 0,
    path: '/test',
    trend: { change: 0, direction: 'stable', previous: null },
    ...overrides,
  })

  test('security at 10 triggers recommendation', () => {
    const result = getRecommendations(
      makeReport({
        breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 10 },
      }),
    )
    expect(result.length).toBeGreaterThanOrEqual(1)
    expect(result[0]).toContain('security')
  })

  test('complexity at 20 triggers recommendation', () => {
    const result = getRecommendations(
      makeReport({
        breakdown: {
          complexity: 20,
          dependencies: 0,
          documentation: 0,
          patterns: 0,
          security: 0,
        },
      }),
    )
    expect(result.length).toBeGreaterThanOrEqual(1)
    expect(result[0]).toContain('complexity')
  })

  test('dependencies at exactly 6 triggers', () => {
    const result = getRecommendations(
      makeReport({
        breakdown: { complexity: 0, dependencies: 6, documentation: 0, patterns: 0, security: 0 },
      }),
    )
    expect(result).toHaveLength(1)
  })

  test('documentation at exactly 11 triggers', () => {
    const result = getRecommendations(
      makeReport({
        breakdown: {
          complexity: 0,
          dependencies: 0,
          documentation: 11,
          patterns: 0,
          security: 0,
        },
      }),
    )
    expect(result).toHaveLength(1)
  })

  test('all five conditions trigger simultaneously', () => {
    const result = getRecommendations(
      makeReport({
        breakdown: {
          complexity: 11,
          dependencies: 6,
          documentation: 11,
          patterns: 0,
          security: 6,
        },
        overall: 25,
      }),
    )
    expect(result.length).toBe(5)
  })

  test('high patterns alone produces no recommendation', () => {
    const result = getRecommendations(
      makeReport({
        breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 50, security: 0 },
      }),
    )
    expect(result).toEqual([])
  })

  test('dependencies at threshold 5 produces no recommendation', () => {
    const result = getRecommendations(
      makeReport({
        breakdown: { complexity: 0, dependencies: 5, documentation: 0, patterns: 0, security: 0 },
      }),
    )
    expect(result).toEqual([])
  })

  test('documentation at threshold 10 produces no recommendation', () => {
    const result = getRecommendations(
      makeReport({
        breakdown: {
          complexity: 0,
          dependencies: 0,
          documentation: 10,
          patterns: 0,
          security: 0,
        },
      }),
    )
    expect(result).toEqual([])
  })

  test('security recommendation mentions "security"', () => {
    const result = getRecommendations(
      makeReport({
        breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 6 },
      }),
    )
    expect(result[0]).toContain('security')
  })

  test('complexity recommendation mentions "complexity"', () => {
    const result = getRecommendations(
      makeReport({
        breakdown: { complexity: 11, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
      }),
    )
    expect(result[0]).toContain('complexity')
  })

  test('dependencies recommendation mentions "dependencies"', () => {
    const result = getRecommendations(
      makeReport({
        breakdown: { complexity: 0, dependencies: 6, documentation: 0, patterns: 0, security: 0 },
      }),
    )
    expect(result[0]).toContain('dependencies')
  })

  test('overall recommendation mentions "sprint"', () => {
    const result = getRecommendations(makeReport({ overall: 21 }))
    expect(result[0]).toContain('sprint')
  })

  test('documentation recommendation mentions "JSDoc"', () => {
    const result = getRecommendations(
      makeReport({
        breakdown: {
          complexity: 0,
          dependencies: 0,
          documentation: 11,
          patterns: 0,
          security: 0,
        },
      }),
    )
    expect(result[0]).toContain('JSDoc')
  })
})

// ============================================================================
// computeTrend — additional coverage
// ============================================================================

describe('computeTrend — additional', () => {
  const makeEntry = (overall: number): DebtHistoryEntry => ({
    breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
    filesAnalyzed: 1,
    overall,
    timestamp: '2024-01-01',
  })

  test('large increase from 0 to 50', () => {
    const result = computeTrend([makeEntry(0)], 50)
    expect(result).toEqual({ change: 50, direction: 'increasing', previous: 0 })
  })

  test('large decrease from 100 to 50', () => {
    const result = computeTrend([makeEntry(100)], 50)
    expect(result).toEqual({ change: -50, direction: 'decreasing', previous: 100 })
  })

  test('change of exactly 2 is increasing', () => {
    const result = computeTrend([makeEntry(10)], 12)
    expect(result).toEqual({ change: 2, direction: 'increasing', previous: 10 })
  })

  test('change of exactly -2 is decreasing', () => {
    const result = computeTrend([makeEntry(10)], 8)
    expect(result).toEqual({ change: -2, direction: 'decreasing', previous: 10 })
  })

  test('five entries uses last one as previous', () => {
    const history: DebtHistoryEntry[] = [
      makeEntry(1),
      { ...makeEntry(0), timestamp: '2024-01-02', overall: 2 },
      { ...makeEntry(0), timestamp: '2024-01-03', overall: 3 },
      { ...makeEntry(0), timestamp: '2024-01-04', overall: 4 },
      { ...makeEntry(0), timestamp: '2024-01-05', overall: 5 },
    ]
    const result = computeTrend(history, 10)
    expect(result.previous).toBe(5)
    expect(result.change).toBe(5)
  })

  test('from 0 to 0 is stable', () => {
    const result = computeTrend([makeEntry(0)], 0)
    expect(result).toEqual({ change: 0, direction: 'stable', previous: 0 })
  })

  test('from 1 to 2 is stable (change of 1)', () => {
    const result = computeTrend([makeEntry(1)], 2)
    expect(result.direction).toBe('stable')
  })

  test('from 2 to 1 is stable (change of -1)', () => {
    const result = computeTrend([makeEntry(2)], 1)
    expect(result.direction).toBe('stable')
  })

  test('empty history with positive current score', () => {
    const result = computeTrend([], 100)
    expect(result).toEqual({ change: 0, direction: 'stable', previous: null })
  })

  test('empty history with zero current score', () => {
    const result = computeTrend([], 0)
    expect(result).toEqual({ change: 0, direction: 'stable', previous: null })
  })

  test('two entries uses last one', () => {
    const history: DebtHistoryEntry[] = [
      makeEntry(5),
      { ...makeEntry(0), timestamp: '2024-01-02', overall: 15 },
    ]
    const result = computeTrend(history, 20)
    expect(result.previous).toBe(15)
    expect(result.change).toBe(5)
  })

  test('increasing from 5 to 8', () => {
    const result = computeTrend([makeEntry(5)], 8)
    expect(result).toEqual({ change: 3, direction: 'increasing', previous: 5 })
  })

  test('decreasing from 8 to 5', () => {
    const result = computeTrend([makeEntry(8)], 5)
    expect(result).toEqual({ change: -3, direction: 'decreasing', previous: 8 })
  })
})

// ============================================================================
// appendHistoryEntry — additional coverage
// ============================================================================

describe('appendHistoryEntry — additional', () => {
  const makeReport = (overrides: Partial<DebtReport> = {}): DebtReport => ({
    breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
    filesAnalyzed: 10,
    interest: { annual: 0, monthly: 0, weekly: 0 },
    overall: 5,
    path: '/test',
    trend: { change: 0, direction: 'stable', previous: null },
    ...overrides,
  })

  test('preserves breakdown fields with non-zero values', () => {
    const report = makeReport({
      breakdown: { complexity: 7, dependencies: 4, documentation: 2, patterns: 1, security: 3 },
    })
    const result = appendHistoryEntry([], report, '2024-01-01')
    expect(result[0]!.breakdown).toEqual({
      complexity: 7,
      dependencies: 4,
      documentation: 2,
      patterns: 1,
      security: 3,
    })
  })

  test('two sequential appends produce correct order', () => {
    const report1 = makeReport({ overall: 3 })
    const report2 = makeReport({ overall: 7 })
    const step1 = appendHistoryEntry([], report1, '2024-01-01')
    const step2 = appendHistoryEntry(step1, report2, '2024-01-02')
    expect(step2).toHaveLength(2)
    expect(step2[0]!.overall).toBe(3)
    expect(step2[1]!.overall).toBe(7)
  })

  test('timestamp string preserved exactly', () => {
    const report = makeReport()
    const result = appendHistoryEntry([], report, '2024-06-15')
    expect(result[0]!.timestamp).toBe('2024-06-15')
  })

  test('files analyzed value preserved', () => {
    const report = makeReport({ filesAnalyzed: 99 })
    const result = appendHistoryEntry([], report, '2024-01-01')
    expect(result[0]!.filesAnalyzed).toBe(99)
  })

  test('overall value of 0 preserved', () => {
    const report = makeReport({ overall: 0 })
    const result = appendHistoryEntry([], report, '2024-01-01')
    expect(result[0]!.overall).toBe(0)
  })

  test('appending to exactly 30 entries triggers truncation', () => {
    const entries: DebtHistoryEntry[] = Array.from({ length: 30 }, (_, i) => ({
      breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
      filesAnalyzed: 1,
      overall: i,
      timestamp: `2024-01-${String(i + 1).padStart(2, '0')}`,
    }))
    const report = makeReport({ overall: 99 })
    const result = appendHistoryEntry(entries, report, '2024-01-31')
    expect(result).toHaveLength(30)
    expect(result[0]!.overall).toBe(1)
    expect(result[result.length - 1]!.overall).toBe(99)
  })

  test('original array not mutated on truncation path', () => {
    const entries: DebtHistoryEntry[] = Array.from({ length: 30 }, (_, i) => ({
      breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
      filesAnalyzed: 1,
      overall: i,
      timestamp: `2024-01-${String(i + 1).padStart(2, '0')}`,
    }))
    const originalLength = entries.length
    appendHistoryEntry(entries, makeReport(), '2024-01-31')
    expect(entries).toHaveLength(originalLength)
  })

  test('appending to 28 entries gives 29 (no truncation)', () => {
    const entries: DebtHistoryEntry[] = Array.from({ length: 28 }, (_, i) => ({
      breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
      filesAnalyzed: 1,
      overall: i,
      timestamp: `2024-01-${String(i + 1).padStart(2, '0')}`,
    }))
    const report = makeReport({ overall: 50 })
    const result = appendHistoryEntry(entries, report, '2024-01-29')
    expect(result).toHaveLength(29)
    expect(result[0]!.overall).toBe(0)
    expect(result[result.length - 1]!.overall).toBe(50)
  })

  test('different overall values in history are preserved', () => {
    const existing: DebtHistoryEntry[] = [
      {
        breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
        filesAnalyzed: 1,
        overall: 10,
        timestamp: '2024-01-01',
      },
      {
        breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
        filesAnalyzed: 1,
        overall: 20,
        timestamp: '2024-01-02',
      },
    ]
    const report = makeReport({ overall: 30 })
    const result = appendHistoryEntry(existing, report, '2024-01-03')
    expect(result.map((e) => e.overall)).toEqual([10, 20, 30])
  })
})

// ============================================================================
// formatReportLines — additional coverage
// ============================================================================

describe('formatReportLines — additional', () => {
  const makeReport = (overrides: Partial<DebtReport> = {}): DebtReport => ({
    breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
    filesAnalyzed: 10,
    interest: { annual: 0, monthly: 0, weekly: 0 },
    overall: 5,
    path: '/test',
    trend: { change: 0, direction: 'stable', previous: null },
    ...overrides,
  })

  test('all lines are strings', () => {
    const lines = formatReportLines(makeReport(), false)
    for (const line of lines) {
      expect(typeof line).toBe('string')
    }
  })

  test('first line is empty string', () => {
    const lines = formatReportLines(makeReport(), false)
    expect(lines[0]).toBe('')
  })

  test('contains "Debt Score:" text', () => {
    const lines = formatReportLines(makeReport({ overall: 42 }), false)
    const joined = lines.join('\n')
    expect(joined).toContain('Debt Score:')
  })

  test('verbose shows all five categories', () => {
    const lines = formatReportLines(
      makeReport({
        breakdown: { complexity: 3, dependencies: 2, documentation: 1, patterns: 4, security: 5 },
      }),
      true,
    )
    const joined = lines.join('\n')
    expect(joined).toContain('Complexity:')
    expect(joined).toContain('Dependencies:')
    expect(joined).toContain('Documentation:')
    expect(joined).toContain('Patterns:')
    expect(joined).toContain('Security:')
  })

  test('verbose shows interest hours', () => {
    const lines = formatReportLines(
      makeReport({ interest: { weekly: 3, monthly: 12, annual: 156 } }),
      true,
    )
    const joined = lines.join('\n')
    expect(joined).toContain('3h')
    expect(joined).toContain('12h')
    expect(joined).toContain('156h')
  })

  test('non-verbose does not show interest', () => {
    const lines = formatReportLines(
      makeReport({ interest: { weekly: 5, monthly: 20, annual: 260 } }),
      false,
    )
    const joined = lines.join('\n')
    expect(joined).not.toContain('Weekly:')
    expect(joined).not.toContain('Monthly:')
    expect(joined).not.toContain('Annual:')
  })

  test('verbose shows "Debt Interest" section', () => {
    const lines = formatReportLines(makeReport(), true)
    const joined = lines.join('\n')
    expect(joined).toContain('Debt Interest')
  })

  test('verbose shows "Analysis" section', () => {
    const lines = formatReportLines(makeReport(), true)
    const joined = lines.join('\n')
    expect(joined).toContain('Analysis')
  })

  test('verbose shows files analyzed count', () => {
    const lines = formatReportLines(makeReport({ filesAnalyzed: 42 }), true)
    const joined = lines.join('\n')
    expect(joined).toContain('42')
  })

  test('report with zero overall displays correctly', () => {
    const lines = formatReportLines(makeReport({ overall: 0 }), false)
    const joined = lines.join('\n')
    expect(joined).toContain('0')
  })

  test('trend with change of +10 shows +10', () => {
    const lines = formatReportLines(
      makeReport({ trend: { change: 10, direction: 'increasing', previous: 5 } }),
      false,
    )
    const joined = lines.join('\n')
    expect(joined).toContain('+10')
  })

  test('trend with negative change shows minus sign', () => {
    const lines = formatReportLines(
      makeReport({ trend: { change: -7, direction: 'decreasing', previous: 12 } }),
      false,
    )
    const joined = lines.join('\n')
    expect(joined).toContain('-7')
  })

  test('multiple recommendations show bullet points', () => {
    const lines = formatReportLines(
      makeReport({
        breakdown: { complexity: 11, dependencies: 6, documentation: 0, patterns: 0, security: 6 },
      }),
      false,
    )
    const joined = lines.join('\n')
    expect(joined).toContain('•')
  })

  test('empty report produces valid output', () => {
    const lines = formatReportLines(makeReport({ overall: 0, filesAnalyzed: 0 }), false)
    expect(lines.length).toBeGreaterThan(0)
  })

  test('very high overall score', () => {
    const lines = formatReportLines(makeReport({ overall: 500 }), false)
    const joined = lines.join('\n')
    expect(joined).toContain('500')
  })
})

// ============================================================================
// formatHistoryLines — additional coverage
// ============================================================================

describe('formatHistoryLines — additional', () => {
  const makeEntry = (overall: number, timestamp: string): DebtHistoryEntry => ({
    breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
    filesAnalyzed: 1,
    overall,
    timestamp,
  })

  test('empty history returns specific message', () => {
    const lines = formatHistoryLines([])
    const joined = lines.join('\n')
    expect(joined).toContain('No history found')
    expect(joined).toContain('codeforge debt --save')
  })

  test('single entry shows dash for trend column', () => {
    const lines = formatHistoryLines([makeEntry(10, '2024-01-01')])
    const joined = lines.join('\n')
    expect(joined).toContain('| -')
  })

  test('two entries with increase shows up arrow and change', () => {
    const lines = formatHistoryLines([makeEntry(5, '2024-01-01'), makeEntry(10, '2024-01-02')])
    const joined = lines.join('\n')
    expect(joined).toContain('↑')
    expect(joined).toContain('5')
  })

  test('two entries with decrease shows down arrow and change', () => {
    const lines = formatHistoryLines([makeEntry(10, '2024-01-01'), makeEntry(3, '2024-01-02')])
    const joined = lines.join('\n')
    expect(joined).toContain('↓')
    expect(joined).toContain('7')
  })

  test('two entries with same score shows no arrow', () => {
    const lines = formatHistoryLines([makeEntry(10, '2024-01-01'), makeEntry(10, '2024-01-02')])
    const joined = lines.join('\n')
    expect(joined).toContain('stable')
  })

  test('summary "reduced" includes amount', () => {
    const lines = formatHistoryLines([makeEntry(20, '2024-01-01'), makeEntry(10, '2024-01-02')])
    const joined = lines.join('\n')
    expect(joined).toContain('10')
    expect(joined).toContain('reduced')
  })

  test('summary "increased" includes amount', () => {
    const lines = formatHistoryLines([makeEntry(5, '2024-01-01'), makeEntry(15, '2024-01-02')])
    const joined = lines.join('\n')
    expect(joined).toContain('10')
    expect(joined).toContain('increased')
  })

  test('summary "stable" when no change', () => {
    const lines = formatHistoryLines([makeEntry(10, '2024-01-01'), makeEntry(10, '2024-01-02')])
    const joined = lines.join('\n')
    expect(joined).toContain('stable')
  })

  test('date appears in formatted output', () => {
    const lines = formatHistoryLines([makeEntry(10, '2024-06-15')])
    const joined = lines.join('\n')
    expect(joined).toContain('10')
  })

  test('many entries (5+) display correctly', () => {
    const entries = Array.from({ length: 6 }, (_, i) =>
      makeEntry(i * 5 + 5, `2024-01-${String(i + 1).padStart(2, '0')}`),
    )
    const lines = formatHistoryLines(entries)
    const joined = lines.join('\n')
    expect(joined).toContain('Technical Debt History')
    expect(joined).toContain('30')
    expect(joined).toContain('5')
  })

  test('table has Date, Debt, and Trend columns', () => {
    const lines = formatHistoryLines([makeEntry(10, '2024-01-01')])
    const joined = lines.join('\n')
    expect(joined).toContain('Date')
    expect(joined).toContain('Debt')
    expect(joined).toContain('Trend')
  })

  test('summary uses first and last entries', () => {
    const lines = formatHistoryLines([
      makeEntry(100, '2024-01-01'),
      makeEntry(50, '2024-01-02'),
      makeEntry(20, '2024-01-03'),
    ])
    const joined = lines.join('\n')
    expect(joined).toContain('80')
    expect(joined).toContain('reduced')
  })

  test('entries with all same scores show stable summary', () => {
    const lines = formatHistoryLines([
      makeEntry(5, '2024-01-01'),
      makeEntry(5, '2024-01-02'),
      makeEntry(5, '2024-01-03'),
    ])
    const joined = lines.join('\n')
    expect(joined).toContain('stable')
  })

  test('header is always "Technical Debt History"', () => {
    const lines = formatHistoryLines([])
    expect(lines).toContain('  Technical Debt History')
  })
})
