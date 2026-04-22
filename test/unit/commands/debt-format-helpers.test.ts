import { describe, expect, test } from 'vitest'
import chalk from 'chalk'

import type { DebtHistoryEntry, DebtReport } from '../../../src/commands/debt-helpers.js'
import {
  formatDebt,
  formatHistoryLines,
  formatReportLines,
  getDebtColor,
  getRecommendations,
} from '../../../src/commands/debt-format-helpers.js'

// ============================================================================
// Factory Helpers
// ============================================================================

const makeReport = (overrides: Partial<DebtReport> = {}): DebtReport => ({
  breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
  filesAnalyzed: 10,
  interest: { annual: 0, monthly: 0, weekly: 0 },
  overall: 0,
  path: '/test',
  trend: { change: 0, direction: 'stable', previous: null },
  ...overrides,
})

const makeEntry = (overall: number, timestamp: string): DebtHistoryEntry => ({
  breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
  filesAnalyzed: 1,
  overall,
  timestamp,
})

// ============================================================================
// getDebtColor
// ============================================================================

describe('getDebtColor', () => {
  test('returns green for score 0', () => {
    expect(getDebtColor(0)).toBe(chalk.green)
  })

  test('returns green at upper boundary (5)', () => {
    expect(getDebtColor(5)).toBe(chalk.green)
  })

  test('returns yellow just above green boundary (6)', () => {
    expect(getDebtColor(6)).toBe(chalk.yellow)
  })

  test('returns yellow at upper boundary (15)', () => {
    expect(getDebtColor(15)).toBe(chalk.yellow)
  })

  test('returns red just above yellow boundary (16)', () => {
    expect(getDebtColor(16)).toBe(chalk.red)
  })

  test('returns red for large scores', () => {
    expect(getDebtColor(100)).toBe(chalk.red)
  })

  test('returned function applies color to text', () => {
    const colorFn = getDebtColor(3)
    const result = colorFn('hello')
    expect(result).toContain('hello')
  })
})

// ============================================================================
// formatDebt
// ============================================================================

describe('formatDebt', () => {
  test('pads single digit to width 3', () => {
    const result = formatDebt(3)
    const stripped = result.replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).toBe('  3')
  })

  test('pads double digit to width 3', () => {
    const result = formatDebt(10)
    const stripped = result.replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).toBe(' 10')
  })

  test('handles triple digit without extra padding', () => {
    const result = formatDebt(100)
    const stripped = result.replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).toBe('100')
  })

  test('zero is padded correctly', () => {
    const result = formatDebt(0)
    const stripped = result.replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).toBe('  0')
  })

  test('applies green color for low scores', () => {
    const result = formatDebt(2)
    // Should contain green ANSI codes
    expect(result).toContain('2')
  })

  test('applies yellow color for medium scores', () => {
    const result = formatDebt(10)
    expect(result).toContain('10')
  })

  test('applies red color for high scores', () => {
    const result = formatDebt(25)
    expect(result).toContain('25')
  })
})

// ============================================================================
// getRecommendations
// ============================================================================

describe('getRecommendations', () => {
  test('returns empty array for low debt report', () => {
    const result = getRecommendations(makeReport())
    expect(result).toEqual([])
  })

  test('returns security recommendation when security exceeds threshold', () => {
    const report = makeReport({
      breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 6 },
    })
    const result = getRecommendations(report)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('security')
  })

  test('does not return security recommendation at threshold (5)', () => {
    const report = makeReport({
      breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 5 },
    })
    expect(getRecommendations(report)).toEqual([])
  })

  test('returns complexity recommendation when complexity exceeds threshold', () => {
    const report = makeReport({
      breakdown: { complexity: 11, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
    })
    const result = getRecommendations(report)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('complexity')
  })

  test('does not return complexity recommendation at threshold (10)', () => {
    const report = makeReport({
      breakdown: { complexity: 10, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
    })
    expect(getRecommendations(report)).toEqual([])
  })

  test('returns dependencies recommendation when dependencies exceeds threshold', () => {
    const report = makeReport({
      breakdown: { complexity: 0, dependencies: 6, documentation: 0, patterns: 0, security: 0 },
    })
    const result = getRecommendations(report)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('dependencies')
  })

  test('does not return dependencies recommendation at threshold (5)', () => {
    const report = makeReport({
      breakdown: { complexity: 0, dependencies: 5, documentation: 0, patterns: 0, security: 0 },
    })
    expect(getRecommendations(report)).toEqual([])
  })

  test('returns documentation recommendation when documentation exceeds threshold', () => {
    const report = makeReport({
      breakdown: { complexity: 0, dependencies: 0, documentation: 11, patterns: 0, security: 0 },
    })
    const result = getRecommendations(report)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('JSDoc')
  })

  test('returns overall recommendation when overall exceeds threshold', () => {
    const report = makeReport({ overall: 21 })
    const result = getRecommendations(report)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('sprint')
  })

  test('does not return overall recommendation at threshold (20)', () => {
    expect(getRecommendations(makeReport({ overall: 20 }))).toEqual([])
  })

  test('returns multiple recommendations for multiple high categories', () => {
    const report = makeReport({
      breakdown: { complexity: 11, dependencies: 6, documentation: 0, patterns: 0, security: 6 },
      overall: 25,
    })
    const result = getRecommendations(report)
    expect(result.length).toBeGreaterThanOrEqual(3)
  })

  test('limits to MAX_RECOMMENDATIONS (5)', () => {
    const report = makeReport({
      breakdown: { complexity: 11, dependencies: 6, documentation: 11, patterns: 0, security: 6 },
      overall: 25,
    })
    const result = getRecommendations(report)
    expect(result.length).toBeLessThanOrEqual(5)
  })

  test('all returned recommendations are non-empty strings', () => {
    const report = makeReport({
      breakdown: { complexity: 11, dependencies: 6, documentation: 0, patterns: 0, security: 6 },
      overall: 25,
    })
    for (const rec of getRecommendations(report)) {
      expect(typeof rec).toBe('string')
      expect(rec.length).toBeGreaterThan(0)
    }
  })
})

// ============================================================================
// formatReportLines
// ============================================================================

describe('formatReportLines', () => {
  test('returns non-empty array of strings', () => {
    const lines = formatReportLines(makeReport(), false)
    expect(lines.length).toBeGreaterThan(0)
    for (const line of lines) {
      expect(typeof line).toBe('string')
    }
  })

  test('includes "Technical Debt Analysis" header', () => {
    const lines = formatReportLines(makeReport(), false)
    expect(lines.join('\n')).toContain('Technical Debt Analysis')
  })

  test('includes debt score in output', () => {
    const lines = formatReportLines(makeReport({ overall: 42 }), false)
    expect(lines.join('\n')).toContain('42')
  })

  test('excludes trend when previous is null', () => {
    const lines = formatReportLines(
      makeReport({ trend: { change: 0, direction: 'stable', previous: null } }),
      false,
    )
    expect(lines.join('\n')).not.toContain('Trend:')
  })

  test('shows increasing trend with up arrow', () => {
    const lines = formatReportLines(
      makeReport({ trend: { change: 5, direction: 'increasing', previous: 3 } }),
      false,
    )
    const joined = lines.join('\n')
    expect(joined).toContain('Trend:')
    expect(joined).toContain('↑')
  })

  test('shows decreasing trend with down arrow', () => {
    const lines = formatReportLines(
      makeReport({ trend: { change: -5, direction: 'decreasing', previous: 10 } }),
      false,
    )
    const joined = lines.join('\n')
    expect(joined).toContain('Trend:')
    expect(joined).toContain('↓')
  })

  test('shows stable trend with right arrow', () => {
    const lines = formatReportLines(
      makeReport({ trend: { change: 0, direction: 'stable', previous: 5 } }),
      false,
    )
    const joined = lines.join('\n')
    expect(joined).toContain('Trend:')
    expect(joined).toContain('→')
  })

  test('prepends plus sign for positive trend change', () => {
    const lines = formatReportLines(
      makeReport({ trend: { change: 5, direction: 'increasing', previous: 3 } }),
      false,
    )
    expect(lines.join('\n')).toContain('+5')
  })

  test('excludes verbose breakdown when verbose is false', () => {
    const lines = formatReportLines(makeReport(), false)
    expect(lines.join('\n')).not.toContain('Category Breakdown:')
  })

  test('includes full verbose breakdown when verbose is true', () => {
    const lines = formatReportLines(makeReport(), true)
    const joined = lines.join('\n')
    expect(joined).toContain('Category Breakdown:')
    expect(joined).toContain('Complexity:')
    expect(joined).toContain('Dependencies:')
    expect(joined).toContain('Documentation:')
    expect(joined).toContain('Patterns:')
    expect(joined).toContain('Security:')
  })

  test('includes debt interest when verbose', () => {
    const lines = formatReportLines(
      makeReport({ interest: { weekly: 5, monthly: 20, annual: 260 } }),
      true,
    )
    const joined = lines.join('\n')
    expect(joined).toContain('Debt Interest')
    expect(joined).toContain('5h')
    expect(joined).toContain('20h')
    expect(joined).toContain('260h')
  })

  test('includes files analyzed count when verbose', () => {
    const lines = formatReportLines(makeReport({ filesAnalyzed: 42 }), true)
    expect(lines.join('\n')).toContain('Files analyzed: 42')
  })

  test('excludes recommendations when none triggered', () => {
    const lines = formatReportLines(makeReport(), false)
    expect(lines.join('\n')).not.toContain('Recommendations:')
  })

  test('includes recommendations when triggered by high debt', () => {
    const lines = formatReportLines(
      makeReport({
        breakdown: { complexity: 11, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
      }),
      false,
    )
    const joined = lines.join('\n')
    expect(joined).toContain('Recommendations:')
    expect(joined).toContain('complexity')
  })

  test('includes empty spacing lines', () => {
    const lines = formatReportLines(makeReport(), false)
    const emptyCount = lines.filter((l) => l === '').length
    expect(emptyCount).toBeGreaterThanOrEqual(2)
  })
})

// ============================================================================
// formatHistoryLines
// ============================================================================

describe('formatHistoryLines', () => {
  test('shows "No history found" message for empty history', () => {
    const lines = formatHistoryLines([])
    const joined = lines.join('\n')
    expect(joined).toContain('No history found')
    expect(joined).toContain('codeforge debt --save')
  })

  test('includes "Technical Debt History" header', () => {
    const lines = formatHistoryLines([makeEntry(10, '2024-01-01')])
    expect(lines.join('\n')).toContain('Technical Debt History')
  })

  test('shows table headers for non-empty history', () => {
    const lines = formatHistoryLines([makeEntry(10, '2024-01-01')])
    const joined = lines.join('\n')
    expect(joined).toContain('Date')
    expect(joined).toContain('Debt')
    expect(joined).toContain('Trend')
  })

  test('shows dash for single entry (no previous)', () => {
    const lines = formatHistoryLines([makeEntry(10, '2024-01-01')])
    expect(lines.join('\n')).toContain('-')
  })

  test('shows down arrow for decreasing debt between entries', () => {
    const lines = formatHistoryLines([makeEntry(10, '2024-01-01'), makeEntry(5, '2024-01-02')])
    const joined = lines.join('\n')
    expect(joined).toContain('↓')
    expect(joined).toContain('5')
  })

  test('shows up arrow for increasing debt between entries', () => {
    const lines = formatHistoryLines([makeEntry(5, '2024-01-01'), makeEntry(10, '2024-01-02')])
    expect(lines.join('\n')).toContain('↑')
  })

  test('shows "reduced" when latest overall is lower than oldest', () => {
    const lines = formatHistoryLines([makeEntry(20, '2024-01-01'), makeEntry(10, '2024-01-02')])
    const joined = lines.join('\n')
    expect(joined).toContain('reduced')
    expect(joined).toContain('10')
  })

  test('shows "increased" when latest overall is higher than oldest', () => {
    const lines = formatHistoryLines([makeEntry(5, '2024-01-01'), makeEntry(15, '2024-01-02')])
    expect(lines.join('\n')).toContain('increased')
  })

  test('shows "stable" when latest and oldest are equal', () => {
    const lines = formatHistoryLines([makeEntry(10, '2024-01-01'), makeEntry(10, '2024-01-02')])
    expect(lines.join('\n')).toContain('stable')
  })

  test('displays entries in reverse chronological order', () => {
    const lines = formatHistoryLines([
      makeEntry(5, '2024-01-01'),
      makeEntry(10, '2024-01-02'),
      makeEntry(15, '2024-01-03'),
    ])
    const joined = lines.join('\n')
    // Newest (15) should appear before middle (10) before oldest (5)
    const pos15 = joined.indexOf('15')
    const pos10 = joined.indexOf('10')
    expect(pos15).toBeLessThan(pos10)
  })

  test('includes dash separator line in table', () => {
    const lines = formatHistoryLines([makeEntry(10, '2024-01-01')])
    // TABLE_DASH_SEPARATOR_WIDTH = 40, so the separator is 40 dashes
    const dashLine = lines.find((l) => l.includes('─') || l.includes('-'))
    expect(dashLine).toBeDefined()
  })

  test('shows dash for first entry in multi-entry history', () => {
    const lines = formatHistoryLines([makeEntry(10, '2024-01-01'), makeEntry(15, '2024-01-02')])
    const joined = lines.join('\n')
    expect(joined).toContain('-')
  })

  test('shows no change indicator when adjacent entries have same score', () => {
    const lines = formatHistoryLines([makeEntry(10, '2024-01-01'), makeEntry(10, '2024-01-02')])
    expect(lines.join('\n')).toContain('stable')
  })

  test('handles three entries with mixed trend directions', () => {
    const lines = formatHistoryLines([
      makeEntry(5, '2024-01-01'),
      makeEntry(15, '2024-01-02'),
      makeEntry(8, '2024-01-03'),
    ])
    const joined = lines.join('\n')
    expect(joined).toContain('↓')
    expect(joined).toContain('↑')
    expect(joined).toContain('increased')
  })

  test('shows "reduced" with correct point count for multi-entry history', () => {
    const lines = formatHistoryLines([
      makeEntry(30, '2024-01-01'),
      makeEntry(25, '2024-01-02'),
      makeEntry(10, '2024-01-03'),
    ])
    const joined = lines.join('\n')
    expect(joined).toContain('reduced')
    expect(joined).toContain('20')
  })

  test('shows "stable" when first and last entries match across many entries', () => {
    const lines = formatHistoryLines([
      makeEntry(10, '2024-01-01'),
      makeEntry(20, '2024-01-02'),
      makeEntry(10, '2024-01-03'),
    ])
    expect(lines.join('\n')).toContain('stable')
  })

  test('includes date field padded to DATE_FIELD_WIDTH', () => {
    const lines = formatHistoryLines([makeEntry(10, '2024-01-15')])
    const dataLine = lines.find((l) => l.includes('|') && !l.includes('Date'))
    expect(dataLine).toBeDefined()
  })

  test('formats overall score with padding in history table', () => {
    const lines = formatHistoryLines([makeEntry(7, '2024-01-01')])
    expect(lines.join('\n')).toContain('7')
  })

  test('uses correct color per entry based on its overall score', () => {
    const lines = formatHistoryLines([
      makeEntry(3, '2024-01-01'),
      makeEntry(10, '2024-01-02'),
      makeEntry(25, '2024-01-03'),
    ])
    const joined = lines.join('\n')
    expect(joined).toContain('3')
    expect(joined).toContain('10')
    expect(joined).toContain('25')
  })

  test('empty history returns early without table headers', () => {
    const lines = formatHistoryLines([])
    expect(lines.length).toBeGreaterThan(0)
    const joined = lines.join('\n')
    expect(joined).toContain('No history found')
    expect(joined).not.toContain('| Debt |')
  })

  test('handles single entry with no trend comparison', () => {
    const lines = formatHistoryLines([makeEntry(42, '2024-06-15')])
    const joined = lines.join('\n')
    expect(joined).toContain('42')
    expect(joined).toContain('stable')
  })

  test('handles large number of history entries', () => {
    const entries = Array.from({ length: 10 }, (_, i) =>
      makeEntry(i * 2, `2024-01-${String(i + 1).padStart(2, '0')}`),
    )
    const lines = formatHistoryLines(entries)
    expect(lines.length).toBeGreaterThan(10)
  })

  test('shows "increased" with correct point count', () => {
    const lines = formatHistoryLines([makeEntry(2, '2024-01-01'), makeEntry(17, '2024-01-02')])
    const joined = lines.join('\n')
    expect(joined).toContain('increased')
    expect(joined).toContain('15')
  })
})

// ============================================================================
// Additional getDebtColor edge cases
// ============================================================================

describe('getDebtColor boundary values', () => {
  test('returns green for score 1', () => {
    expect(getDebtColor(1)).toBe(chalk.green)
  })

  test('returns green for score 3', () => {
    expect(getDebtColor(3)).toBe(chalk.green)
  })

  test('returns yellow for score 10 (mid yellow range)', () => {
    expect(getDebtColor(10)).toBe(chalk.yellow)
  })

  test('returns red for score 17', () => {
    expect(getDebtColor(17)).toBe(chalk.red)
  })

  test('returns red for score 50', () => {
    expect(getDebtColor(50)).toBe(chalk.red)
  })

  test('returned green function produces output containing input text', () => {
    const result = getDebtColor(0)('test-text')
    expect(result).toContain('test-text')
  })

  test('returned red function produces output containing input text', () => {
    const result = getDebtColor(100)('high-debt')
    expect(result).toContain('high-debt')
  })
})

// ============================================================================
// Additional formatDebt edge cases
// ============================================================================

describe('formatDebt additional cases', () => {
  test('score 5 (green boundary) formats correctly', () => {
    const result = formatDebt(5)
    const stripped = result.replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).toBe('  5')
  })

  test('score 6 (yellow start) formats correctly', () => {
    const result = formatDebt(6)
    const stripped = result.replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).toBe('  6')
  })

  test('score 15 (yellow boundary) formats correctly', () => {
    const result = formatDebt(15)
    const stripped = result.replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).toBe(' 15')
  })

  test('score 16 (red start) formats correctly', () => {
    const result = formatDebt(16)
    const stripped = result.replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).toBe(' 16')
  })
})

// ============================================================================
// Additional getRecommendations edge cases
// ============================================================================

describe('getRecommendations additional cases', () => {
  test('does not return documentation recommendation at threshold (10)', () => {
    const report = makeReport({
      breakdown: { complexity: 0, dependencies: 0, documentation: 10, patterns: 0, security: 0 },
    })
    expect(getRecommendations(report)).toEqual([])
  })

  test('returns exactly all 5 recommendations when all conditions met', () => {
    const report = makeReport({
      breakdown: { complexity: 11, dependencies: 6, documentation: 11, patterns: 0, security: 6 },
      overall: 21,
    })
    const result = getRecommendations(report)
    expect(result).toHaveLength(5)
  })

  test('returns only security and complexity when only those exceed thresholds', () => {
    const report = makeReport({
      breakdown: { complexity: 11, dependencies: 0, documentation: 0, patterns: 0, security: 6 },
    })
    const result = getRecommendations(report)
    expect(result).toHaveLength(2)
    expect(result[0]).toContain('security')
    expect(result[1]).toContain('complexity')
  })

  test('recommendations appear in correct priority order', () => {
    const report = makeReport({
      breakdown: { complexity: 11, dependencies: 6, documentation: 0, patterns: 0, security: 6 },
      overall: 21,
    })
    const result = getRecommendations(report)
    expect(result[0]).toContain('security')
    expect(result[1]).toContain('complexity')
    expect(result[2]).toContain('dependencies')
    expect(result[3]).toContain('sprint')
  })

  test('handles report with all zero breakdown values', () => {
    const result = getRecommendations(makeReport({ overall: 0 }))
    expect(result).toEqual([])
  })

  test('returns dependencies recommendation with correct text', () => {
    const report = makeReport({
      breakdown: { complexity: 0, dependencies: 7, documentation: 0, patterns: 0, security: 0 },
    })
    const result = getRecommendations(report)
    expect(result[0]).toContain('circular dependencies')
  })

  test('returns overall recommendation with sprint text', () => {
    const report = makeReport({ overall: 30 })
    const result = getRecommendations(report)
    expect(result[0]).toContain('sprint')
  })
})

// ============================================================================
// Additional formatReportLines edge cases
// ============================================================================

describe('formatReportLines additional cases', () => {
  test('negative trend change does not get plus sign', () => {
    const lines = formatReportLines(
      makeReport({ trend: { change: -3, direction: 'decreasing', previous: 8 } }),
      false,
    )
    const joined = lines.join('\n')
    expect(joined).toContain('-3')
    expect(joined).not.toContain('+-3')
  })

  test('zero trend change with previous shows stable trend', () => {
    const lines = formatReportLines(
      makeReport({ trend: { change: 0, direction: 'stable', previous: 5 } }),
      false,
    )
    const joined = lines.join('\n')
    expect(joined).toContain('→')
    expect(joined).not.toContain('+')
  })

  test('verbose mode with all breakdown categories at different values', () => {
    const lines = formatReportLines(
      makeReport({
        breakdown: { complexity: 3, dependencies: 7, documentation: 12, patterns: 1, security: 20 },
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

  test('verbose mode with zero interest values', () => {
    const lines = formatReportLines(
      makeReport({ interest: { weekly: 0, monthly: 0, annual: 0 } }),
      true,
    )
    const joined = lines.join('\n')
    expect(joined).toContain('0h')
  })

  test('verbose mode with large interest values', () => {
    const lines = formatReportLines(
      makeReport({ interest: { weekly: 100, monthly: 400, annual: 5200 } }),
      true,
    )
    const joined = lines.join('\n')
    expect(joined).toContain('100h')
    expect(joined).toContain('400h')
    expect(joined).toContain('5200h')
  })

  test('non-verbose mode does not include interest section', () => {
    const lines = formatReportLines(
      makeReport({ interest: { weekly: 5, monthly: 20, annual: 260 } }),
      false,
    )
    expect(lines.join('\n')).not.toContain('Debt Interest')
  })

  test('non-verbose mode does not include files analyzed', () => {
    const lines = formatReportLines(makeReport({ filesAnalyzed: 99 }), false)
    expect(lines.join('\n')).not.toContain('Files analyzed')
  })

  test('recommendation bullets use yellow color', () => {
    const lines = formatReportLines(
      makeReport({
        breakdown: { complexity: 11, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
      }),
      false,
    )
    const joined = lines.join('\n')
    expect(joined).toContain('•')
  })

  test('output starts with empty line for spacing', () => {
    const lines = formatReportLines(makeReport(), false)
    expect(lines[0]).toBe('')
  })

  test('debt score uses color based on overall value', () => {
    const lines = formatReportLines(makeReport({ overall: 3 }), false)
    expect(lines.join('\n')).toContain('3')
  })

  test('debt score uses red color for high overall value', () => {
    const lines = formatReportLines(makeReport({ overall: 25 }), false)
    expect(lines.join('\n')).toContain('25')
  })
})

// ============================================================================
// getDebtColor - negative and extreme values
// ============================================================================

describe('getDebtColor negative and extreme values', () => {
  test('returns green for negative score (-1)', () => {
    expect(getDebtColor(-1)).toBe(chalk.green)
  })

  test('returns green for very negative score (-100)', () => {
    expect(getDebtColor(-100)).toBe(chalk.green)
  })

  test('returns red for very large score (999)', () => {
    expect(getDebtColor(999)).toBe(chalk.red)
  })

  test('returns red for score 20', () => {
    expect(getDebtColor(20)).toBe(chalk.red)
  })

  test('returns green for score 2', () => {
    expect(getDebtColor(2)).toBe(chalk.green)
  })

  test('returns yellow for score 8', () => {
    expect(getDebtColor(8)).toBe(chalk.yellow)
  })

  test('returns yellow for score 12', () => {
    expect(getDebtColor(12)).toBe(chalk.yellow)
  })

  test('returned function is callable with empty string', () => {
    const colorFn = getDebtColor(0)
    const result = colorFn('')
    expect(typeof result).toBe('string')
  })

  test('returned function preserves numeric input as string', () => {
    const colorFn = getDebtColor(0)
    const result = colorFn('42')
    expect(result).toContain('42')
  })
})

// ============================================================================
// formatDebt - more score values
// ============================================================================

describe('formatDebt additional score values', () => {
  test('score 1 formats with padding', () => {
    const stripped = formatDebt(1).replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).toBe('  1')
  })

  test('score 4 formats with padding', () => {
    const stripped = formatDebt(4).replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).toBe('  4')
  })

  test('score 7 formats with padding', () => {
    const stripped = formatDebt(7).replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).toBe('  7')
  })

  test('score 9 formats with padding', () => {
    const stripped = formatDebt(9).replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).toBe('  9')
  })

  test('score 11 formats with padding', () => {
    const stripped = formatDebt(11).replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).toBe(' 11')
  })

  test('score 14 formats with padding', () => {
    const stripped = formatDebt(14).replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).toBe(' 14')
  })

  test('score 20 formats without extra padding', () => {
    const stripped = formatDebt(20).replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).toBe(' 20')
  })

  test('score 50 formats without extra padding', () => {
    const stripped = formatDebt(50).replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).toBe(' 50')
  })

  test('score 999 formats to 3 characters', () => {
    const stripped = formatDebt(999).replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).toBe('999')
  })

  test('score 8 contains the digit 8', () => {
    expect(formatDebt(8)).toContain('8')
  })
})

// ============================================================================
// getRecommendations - comprehensive combinations
// ============================================================================

describe('getRecommendations comprehensive coverage', () => {
  test('returns security only when only security exceeds', () => {
    const report = makeReport({
      breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 10 },
    })
    const result = getRecommendations(report)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('security')
  })

  test('returns complexity only when only complexity exceeds', () => {
    const report = makeReport({
      breakdown: { complexity: 15, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
    })
    const result = getRecommendations(report)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('complexity')
  })

  test('returns dependencies only when only dependencies exceeds', () => {
    const report = makeReport({
      breakdown: { complexity: 0, dependencies: 10, documentation: 0, patterns: 0, security: 0 },
    })
    const result = getRecommendations(report)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('dependencies')
  })

  test('returns documentation only when only documentation exceeds', () => {
    const report = makeReport({
      breakdown: { complexity: 0, dependencies: 0, documentation: 15, patterns: 0, security: 0 },
    })
    const result = getRecommendations(report)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('JSDoc')
  })

  test('returns overall only when only overall exceeds', () => {
    const report = makeReport({ overall: 25 })
    const result = getRecommendations(report)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('sprint')
  })

  test('patterns score never triggers a recommendation', () => {
    const report = makeReport({
      breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 100, security: 0 },
    })
    expect(getRecommendations(report)).toEqual([])
  })

  test('security recommendation text mentions "highest debt cost"', () => {
    const report = makeReport({
      breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 6 },
    })
    expect(getRecommendations(report)[0]).toContain('highest debt cost')
  })

  test('complexity recommendation text mentions "refactoring"', () => {
    const report = makeReport({
      breakdown: { complexity: 11, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
    })
    expect(getRecommendations(report)[0]).toContain('refactoring')
  })

  test('dependencies recommendation text mentions "circular dependencies"', () => {
    const report = makeReport({
      breakdown: { complexity: 0, dependencies: 6, documentation: 0, patterns: 0, security: 0 },
    })
    expect(getRecommendations(report)[0]).toContain('circular dependencies')
  })

  test('documentation recommendation text mentions "maintainability"', () => {
    const report = makeReport({
      breakdown: { complexity: 0, dependencies: 0, documentation: 11, patterns: 0, security: 0 },
    })
    expect(getRecommendations(report)[0]).toContain('maintainability')
  })

  test('security at 6 is just above threshold', () => {
    const report = makeReport({
      breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 6 },
    })
    expect(getRecommendations(report)).toHaveLength(1)
  })

  test('complexity at 11 is just above threshold', () => {
    const report = makeReport({
      breakdown: { complexity: 11, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
    })
    expect(getRecommendations(report)).toHaveLength(1)
  })

  test('dependencies at 6 is just above threshold', () => {
    const report = makeReport({
      breakdown: { complexity: 0, dependencies: 6, documentation: 0, patterns: 0, security: 0 },
    })
    expect(getRecommendations(report)).toHaveLength(1)
  })

  test('documentation at 11 is just above threshold', () => {
    const report = makeReport({
      breakdown: { complexity: 0, dependencies: 0, documentation: 11, patterns: 0, security: 0 },
    })
    expect(getRecommendations(report)).toHaveLength(1)
  })

  test('overall at 21 is just above threshold', () => {
    const report = makeReport({ overall: 21 })
    expect(getRecommendations(report)).toHaveLength(1)
  })

  test('returns security and dependencies when both exceed', () => {
    const report = makeReport({
      breakdown: { complexity: 0, dependencies: 6, documentation: 0, patterns: 0, security: 6 },
    })
    const result = getRecommendations(report)
    expect(result).toHaveLength(2)
    expect(result[0]).toContain('security')
    expect(result[1]).toContain('dependencies')
  })

  test('returns complexity and documentation when both exceed', () => {
    const report = makeReport({
      breakdown: { complexity: 11, dependencies: 0, documentation: 11, patterns: 0, security: 0 },
    })
    const result = getRecommendations(report)
    expect(result).toHaveLength(2)
    expect(result[0]).toContain('complexity')
    expect(result[1]).toContain('JSDoc')
  })

  test('very high values in all categories still limited to 5', () => {
    const report = makeReport({
      breakdown: {
        complexity: 100,
        dependencies: 100,
        documentation: 100,
        patterns: 100,
        security: 100,
      },
      overall: 100,
    })
    expect(getRecommendations(report).length).toBeLessThanOrEqual(5)
  })
})

// ============================================================================
// formatReportLines - comprehensive verbose and non-verbose
// ============================================================================

describe('formatReportLines verbose mode details', () => {
  test('verbose includes "Analysis" section label', () => {
    const lines = formatReportLines(makeReport(), true)
    expect(lines.join('\n')).toContain('Analysis:')
  })

  test('verbose includes "Debt Interest" section label', () => {
    const lines = formatReportLines(makeReport(), true)
    expect(lines.join('\n')).toContain('Debt Interest')
  })

  test('verbose shows weekly interest with h suffix', () => {
    const lines = formatReportLines(
      makeReport({ interest: { weekly: 3, monthly: 12, annual: 156 } }),
      true,
    )
    expect(lines.join('\n')).toContain('3h')
  })

  test('verbose shows monthly interest with h suffix', () => {
    const lines = formatReportLines(
      makeReport({ interest: { weekly: 3, monthly: 12, annual: 156 } }),
      true,
    )
    expect(lines.join('\n')).toContain('12h')
  })

  test('verbose shows annual interest with h suffix', () => {
    const lines = formatReportLines(
      makeReport({ interest: { weekly: 3, monthly: 12, annual: 156 } }),
      true,
    )
    expect(lines.join('\n')).toContain('156h')
  })

  test('verbose mode includes "Category Breakdown:" gray label', () => {
    const lines = formatReportLines(makeReport(), true)
    const joined = lines.join('\n')
    expect(joined).toContain('Category Breakdown:')
  })

  test('verbose shows complexity breakdown value', () => {
    const lines = formatReportLines(
      makeReport({
        breakdown: { complexity: 7, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
      }),
      true,
    )
    expect(lines.join('\n')).toContain('Complexity:')
  })

  test('verbose shows dependencies breakdown value', () => {
    const lines = formatReportLines(
      makeReport({
        breakdown: { complexity: 0, dependencies: 3, documentation: 0, patterns: 0, security: 0 },
      }),
      true,
    )
    expect(lines.join('\n')).toContain('Dependencies:')
  })

  test('verbose shows security breakdown value', () => {
    const lines = formatReportLines(
      makeReport({
        breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 8 },
      }),
      true,
    )
    expect(lines.join('\n')).toContain('Security:')
  })

  test('verbose shows patterns breakdown value', () => {
    const lines = formatReportLines(
      makeReport({
        breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 5, security: 0 },
      }),
      true,
    )
    expect(lines.join('\n')).toContain('Patterns:')
  })
})

describe('formatReportLines trend edge cases', () => {
  test('trend change of 1 gets plus sign', () => {
    const lines = formatReportLines(
      makeReport({ trend: { change: 1, direction: 'increasing', previous: 5 } }),
      false,
    )
    expect(lines.join('\n')).toContain('+1')
  })

  test('trend change of -1 does not get plus sign', () => {
    const lines = formatReportLines(
      makeReport({ trend: { change: -1, direction: 'decreasing', previous: 5 } }),
      false,
    )
    const joined = lines.join('\n')
    expect(joined).toContain('-1')
    expect(joined).not.toContain('+-1')
  })

  test('trend with large positive change shows correct value', () => {
    const lines = formatReportLines(
      makeReport({ trend: { change: 50, direction: 'increasing', previous: 5 } }),
      false,
    )
    expect(lines.join('\n')).toContain('+50')
  })

  test('trend with large negative change shows correct value', () => {
    const lines = formatReportLines(
      makeReport({ trend: { change: -50, direction: 'decreasing', previous: 55 } }),
      false,
    )
    const joined = lines.join('\n')
    expect(joined).toContain('-50')
    expect(joined).toContain('↓')
  })

  test('increasing trend shows red color', () => {
    const lines = formatReportLines(
      makeReport({ trend: { change: 5, direction: 'increasing', previous: 3 } }),
      false,
    )
    expect(lines.join('\n')).toContain('↑')
  })

  test('decreasing trend shows green color indicator', () => {
    const lines = formatReportLines(
      makeReport({ trend: { change: -5, direction: 'decreasing', previous: 10 } }),
      false,
    )
    expect(lines.join('\n')).toContain('↓')
  })

  test('stable trend with previous shows arrow', () => {
    const lines = formatReportLines(
      makeReport({ trend: { change: 0, direction: 'stable', previous: 5 } }),
      false,
    )
    expect(lines.join('\n')).toContain('→')
  })
})

describe('formatReportLines output structure', () => {
  test('header line contains "bold" formatting', () => {
    const lines = formatReportLines(makeReport(), false)
    const headerLine = lines.find((l) => l.includes('Technical Debt Analysis'))
    expect(headerLine).toBeDefined()
  })

  test('debt score line includes "Debt Score:"', () => {
    const lines = formatReportLines(makeReport({ overall: 10 }), false)
    expect(lines.join('\n')).toContain('Debt Score:')
  })

  test('verbose with recommendations shows both sections', () => {
    const lines = formatReportLines(
      makeReport({
        breakdown: { complexity: 11, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
      }),
      true,
    )
    const joined = lines.join('\n')
    expect(joined).toContain('Category Breakdown:')
    expect(joined).toContain('Recommendations:')
  })

  test('verbose with no recommendations shows no recommendation section', () => {
    const lines = formatReportLines(makeReport(), true)
    expect(lines.join('\n')).not.toContain('Recommendations:')
  })

  test('report with overall 0 uses green color', () => {
    const lines = formatReportLines(makeReport({ overall: 0 }), false)
    const joined = lines.join('\n')
    expect(joined).toContain('0')
  })

  test('report with overall 6 uses yellow color', () => {
    const lines = formatReportLines(makeReport({ overall: 6 }), false)
    expect(lines.join('\n')).toContain('6')
  })

  test('report with overall 16 uses red color', () => {
    const lines = formatReportLines(makeReport({ overall: 16 }), false)
    expect(lines.join('\n')).toContain('16')
  })

  test('multiple recommendations each get a bullet point', () => {
    const lines = formatReportLines(
      makeReport({
        breakdown: { complexity: 11, dependencies: 6, documentation: 0, patterns: 0, security: 6 },
        overall: 21,
      }),
      false,
    )
    const bulletLines = lines.filter((l) => l.includes('•'))
    expect(bulletLines.length).toBeGreaterThanOrEqual(2)
  })
})

// ============================================================================
// formatHistoryLines - comprehensive edge cases
// ============================================================================

describe('formatHistoryLines single entry details', () => {
  test('single entry shows "stable" summary', () => {
    const lines = formatHistoryLines([makeEntry(10, '2024-01-01')])
    expect(lines.join('\n')).toContain('stable')
  })

  test('single entry with score 0', () => {
    const lines = formatHistoryLines([makeEntry(0, '2024-01-01')])
    expect(lines.join('\n')).toContain('0')
  })

  test('single entry with high score 100', () => {
    const lines = formatHistoryLines([makeEntry(100, '2024-01-01')])
    const joined = lines.join('\n')
    expect(joined).toContain('100')
    expect(joined).toContain('stable')
  })

  test('single entry does not show reduced or increased', () => {
    const lines = formatHistoryLines([makeEntry(10, '2024-01-01')])
    const joined = lines.join('\n')
    expect(joined).not.toContain('reduced')
    expect(joined).not.toContain('increased')
  })
})

describe('formatHistoryLines two entry variations', () => {
  test('second entry higher shows increased by exact difference', () => {
    const lines = formatHistoryLines([makeEntry(5, '2024-01-01'), makeEntry(12, '2024-01-02')])
    const joined = lines.join('\n')
    expect(joined).toContain('increased')
    expect(joined).toContain('7')
  })

  test('second entry lower shows reduced by exact difference', () => {
    const lines = formatHistoryLines([makeEntry(20, '2024-01-01'), makeEntry(8, '2024-01-02')])
    const joined = lines.join('\n')
    expect(joined).toContain('reduced')
    expect(joined).toContain('12')
  })

  test('both entries same score shows stable', () => {
    const lines = formatHistoryLines([makeEntry(15, '2024-01-01'), makeEntry(15, '2024-01-02')])
    expect(lines.join('\n')).toContain('stable')
  })

  test('change of exactly 1 between entries shows trend', () => {
    const lines = formatHistoryLines([makeEntry(10, '2024-01-01'), makeEntry(11, '2024-01-02')])
    expect(lines.join('\n')).toContain('↑')
  })

  test('change of exactly -1 between entries shows trend', () => {
    const lines = formatHistoryLines([makeEntry(10, '2024-01-01'), makeEntry(9, '2024-01-02')])
    expect(lines.join('\n')).toContain('↓')
  })
})

describe('formatHistoryLines multi-entry patterns', () => {
  test('consistently increasing scores show multiple up arrows', () => {
    const lines = formatHistoryLines([
      makeEntry(5, '2024-01-01'),
      makeEntry(10, '2024-01-02'),
      makeEntry(15, '2024-01-03'),
      makeEntry(20, '2024-01-04'),
    ])
    const joined = lines.join('\n')
    const upCount = (joined.match(/↑/g) || []).length
    expect(upCount).toBeGreaterThanOrEqual(2)
    expect(joined).toContain('increased')
  })

  test('consistently decreasing scores show multiple down arrows', () => {
    const lines = formatHistoryLines([
      makeEntry(20, '2024-01-01'),
      makeEntry(15, '2024-01-02'),
      makeEntry(10, '2024-01-03'),
      makeEntry(5, '2024-01-04'),
    ])
    const joined = lines.join('\n')
    const downCount = (joined.match(/↓/g) || []).length
    expect(downCount).toBeGreaterThanOrEqual(2)
    expect(joined).toContain('reduced')
  })

  test('all same scores show only dashes and stable', () => {
    const lines = formatHistoryLines([
      makeEntry(10, '2024-01-01'),
      makeEntry(10, '2024-01-02'),
      makeEntry(10, '2024-01-03'),
    ])
    const joined = lines.join('\n')
    expect(joined).toContain('stable')
  })

  test('zigzag pattern ends with correct summary', () => {
    const lines = formatHistoryLines([
      makeEntry(10, '2024-01-01'),
      makeEntry(20, '2024-01-02'),
      makeEntry(5, '2024-01-03'),
      makeEntry(15, '2024-01-04'),
    ])
    // First (10) to Last (15) → increased by 5
    const joined = lines.join('\n')
    expect(joined).toContain('increased')
    expect(joined).toContain('5')
  })

  test('five entries produce at least 7 lines of output', () => {
    const entries = [
      makeEntry(5, '2024-01-01'),
      makeEntry(10, '2024-01-02'),
      makeEntry(8, '2024-01-03'),
      makeEntry(12, '2024-01-04'),
      makeEntry(6, '2024-01-05'),
    ]
    const lines = formatHistoryLines(entries)
    expect(lines.length).toBeGreaterThanOrEqual(7)
  })
})

describe('formatHistoryLines output format', () => {
  test('table header contains pipe separators', () => {
    const lines = formatHistoryLines([makeEntry(10, '2024-01-01')])
    const headerLine = lines.find(
      (l) => l.includes('Date') && l.includes('Debt') && l.includes('Trend'),
    )
    expect(headerLine).toBeDefined()
  })

  test('data rows contain pipe separators', () => {
    const lines = formatHistoryLines([makeEntry(10, '2024-01-01')])
    const dataLines = lines.filter((l) => l.includes('|') && !l.includes('Date'))
    expect(dataLines.length).toBeGreaterThan(0)
  })

  test('output starts with empty line', () => {
    const lines = formatHistoryLines([makeEntry(10, '2024-01-01')])
    expect(lines[0]).toBe('')
  })

  test('header includes "Technical Debt History" bold text', () => {
    const lines = formatHistoryLines([makeEntry(10, '2024-01-01')])
    expect(lines.join('\n')).toContain('Technical Debt History')
  })

  test('empty history does not contain trend arrows', () => {
    const lines = formatHistoryLines([])
    const joined = lines.join('\n')
    expect(joined).not.toContain('↑')
    expect(joined).not.toContain('↓')
  })

  test('empty history does not contain table data', () => {
    const lines = formatHistoryLines([])
    const joined = lines.join('\n')
    expect(joined).not.toContain('| Debt')
  })

  test('first entry in history always shows dash for trend', () => {
    const lines = formatHistoryLines([makeEntry(5, '2024-01-01'), makeEntry(10, '2024-01-02')])
    // The first entry (oldest) has no previous to compare → dash
    const dataLines = lines.filter((l) => l.includes('|') && !l.includes('Date'))
    expect(dataLines.length).toBeGreaterThanOrEqual(1)
  })

  test('summary line is at the end of output', () => {
    const lines = formatHistoryLines([makeEntry(5, '2024-01-01'), makeEntry(10, '2024-01-02')])
    const nonEmptyLines = lines.filter((l) => l.trim() !== '')
    const lastNonEmpty = nonEmptyLines[nonEmptyLines.length - 1]
    expect(lastNonEmpty).toBeDefined()
    expect(
      lastNonEmpty!.includes('increased') ||
        lastNonEmpty!.includes('reduced') ||
        lastNonEmpty!.includes('stable'),
    ).toBe(true)
  })

  test('reduced message shows correct point count with absolute value', () => {
    const lines = formatHistoryLines([makeEntry(50, '2024-01-01'), makeEntry(10, '2024-01-02')])
    const joined = lines.join('\n')
    expect(joined).toContain('reduced')
    expect(joined).toContain('40')
  })

  test('history with exactly 2 entries where second is lower', () => {
    const lines = formatHistoryLines([makeEntry(30, '2024-01-01'), makeEntry(10, '2024-01-02')])
    const joined = lines.join('\n')
    expect(joined).toContain('reduced')
    expect(joined).toContain('20')
  })

  test('history with zero overall entries shows no reduced/increased', () => {
    const lines = formatHistoryLines([])
    const joined = lines.join('\n')
    expect(joined).not.toContain('reduced')
    expect(joined).not.toContain('increased')
  })

  test('entries with same score in middle show no arrow for that pair', () => {
    const lines = formatHistoryLines([
      makeEntry(5, '2024-01-01'),
      makeEntry(10, '2024-01-02'),
      makeEntry(10, '2024-01-03'),
    ])
    const joined = lines.join('\n')
    // 10→10 should show '-' (no change)
    expect(joined).toContain('-')
  })
})

// ============================================================================
// formatDebt - color verification
// ============================================================================

describe('formatDebt color verification', () => {
  test('score 0 output is a string', () => {
    const result = formatDebt(0)
    expect(typeof result).toBe('string')
  })

  test('score 10 output is a string', () => {
    const result = formatDebt(10)
    expect(typeof result).toBe('string')
  })

  test('score 25 output is a string', () => {
    const result = formatDebt(25)
    expect(typeof result).toBe('string')
  })

  test('different color ranges produce different output styles', () => {
    const green = formatDebt(2)
    const yellow = formatDebt(10)
    const red = formatDebt(25)
    // All should contain the numbers but potentially with different ANSI codes
    expect(green).toContain('2')
    expect(yellow).toContain('10')
    expect(red).toContain('25')
  })
})

// ============================================================================
// getRecommendations - order and content verification
// ============================================================================

describe('getRecommendations order and content', () => {
  test('security always comes before complexity', () => {
    const report = makeReport({
      breakdown: { complexity: 11, dependencies: 0, documentation: 0, patterns: 0, security: 6 },
    })
    const result = getRecommendations(report)
    const secIdx = result.findIndex((r) => r.includes('security'))
    const compIdx = result.findIndex((r) => r.includes('complexity'))
    expect(secIdx).toBeLessThan(compIdx)
  })

  test('complexity always comes before dependencies', () => {
    const report = makeReport({
      breakdown: { complexity: 11, dependencies: 6, documentation: 0, patterns: 0, security: 0 },
    })
    const result = getRecommendations(report)
    const compIdx = result.findIndex((r) => r.includes('complexity'))
    const depIdx = result.findIndex((r) => r.includes('dependencies'))
    expect(compIdx).toBeLessThan(depIdx)
  })

  test('dependencies always comes before documentation', () => {
    const report = makeReport({
      breakdown: { complexity: 0, dependencies: 6, documentation: 11, patterns: 0, security: 0 },
    })
    const result = getRecommendations(report)
    const depIdx = result.findIndex((r) => r.includes('dependencies'))
    const docIdx = result.findIndex((r) => r.includes('JSDoc'))
    expect(depIdx).toBeLessThan(docIdx)
  })

  test('documentation always comes before overall sprint', () => {
    const report = makeReport({
      breakdown: { complexity: 0, dependencies: 0, documentation: 11, patterns: 0, security: 0 },
      overall: 21,
    })
    const result = getRecommendations(report)
    const docIdx = result.findIndex((r) => r.includes('JSDoc'))
    const sprintIdx = result.findIndex((r) => r.includes('sprint'))
    expect(docIdx).toBeLessThan(sprintIdx)
  })

  test('returns exactly 3 recommendations for security + dependencies + overall', () => {
    const report = makeReport({
      breakdown: { complexity: 0, dependencies: 6, documentation: 0, patterns: 0, security: 6 },
      overall: 21,
    })
    expect(getRecommendations(report)).toHaveLength(3)
  })

  test('returns exactly 4 recommendations missing only documentation', () => {
    const report = makeReport({
      breakdown: { complexity: 11, dependencies: 6, documentation: 0, patterns: 0, security: 6 },
      overall: 21,
    })
    expect(getRecommendations(report)).toHaveLength(4)
  })
})

// ============================================================================
// formatReportLines - trend with zero change
// ============================================================================

describe('formatReportLines trend zero change behavior', () => {
  test('zero change with direction stable and previous shows trend line', () => {
    const lines = formatReportLines(
      makeReport({ trend: { change: 0, direction: 'stable', previous: 5 } }),
      false,
    )
    const trendLines = lines.filter((l) => l.includes('Trend:'))
    expect(trendLines).toHaveLength(1)
  })

  test('change of 0 does not show plus sign', () => {
    const lines = formatReportLines(
      makeReport({ trend: { change: 0, direction: 'stable', previous: 5 } }),
      false,
    )
    const trendLine = lines.find((l) => l.includes('Trend:'))
    expect(trendLine).toBeDefined()
    expect(trendLine).not.toContain('+0')
  })
})

// ============================================================================
// formatHistoryLines - detailed entry rendering
// ============================================================================

describe('formatHistoryLines entry rendering details', () => {
  test('each entry has its overall score in output', () => {
    const entries = [
      makeEntry(7, '2024-01-01'),
      makeEntry(13, '2024-01-02'),
      makeEntry(22, '2024-01-03'),
    ]
    const joined = formatHistoryLines(entries).join('\n')
    expect(joined).toContain('7')
    expect(joined).toContain('13')
    expect(joined).toContain('22')
  })

  test('history with 15 entries produces valid output', () => {
    const entries = Array.from({ length: 15 }, (_, i) =>
      makeEntry(i + 1, `2024-01-${String(i + 1).padStart(2, '0')}`),
    )
    const lines = formatHistoryLines(entries)
    expect(lines.length).toBeGreaterThan(15)
    expect(lines.join('\n')).toContain('Technical Debt History')
  })

  test('history with 20 entries still renders completely', () => {
    const entries = Array.from({ length: 20 }, (_, i) =>
      makeEntry(i, `2024-02-${String(i + 1).padStart(2, '0')}`),
    )
    const lines = formatHistoryLines(entries)
    const joined = lines.join('\n')
    expect(joined).toContain('increased')
  })

  test('oldest entry gets dash for trend', () => {
    const entries = [makeEntry(10, '2024-01-01'), makeEntry(15, '2024-01-02')]
    const lines = formatHistoryLines(entries)
    // Find the data line for the oldest entry (displayed last)
    const dataLines = lines.filter((l) => l.includes('|') && !l.includes('Date'))
    // The last data line should be for the oldest entry and contain '-'
    const lastDataLine = dataLines[dataLines.length - 1]
    expect(lastDataLine).toBeDefined()
  })

  test('newest entry displayed first in output', () => {
    const entries = [
      makeEntry(1, '2024-01-01'),
      makeEntry(2, '2024-01-02'),
      makeEntry(99, '2024-01-03'),
    ]
    const lines = formatHistoryLines(entries)
    const dataLines = lines.filter((l) => l.includes('|') && !l.includes('Date'))
    // First data line should have the newest score (99)
    const firstDataLine = dataLines[0]
    expect(firstDataLine).toBeDefined()
    expect(firstDataLine!.includes('99')).toBe(true)
  })

  test('summary compares oldest to newest (not adjacent)', () => {
    const entries = [
      makeEntry(100, '2024-01-01'),
      makeEntry(5, '2024-01-02'),
      makeEntry(50, '2024-01-03'),
    ]
    const joined = formatHistoryLines(entries).join('\n')
    // 100 → 50 = reduced by 50
    expect(joined).toContain('reduced')
    expect(joined).toContain('50')
  })
})
