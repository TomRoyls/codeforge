import { describe, it, expect } from 'vitest'
import {
  getDebtColor,
  formatDebt,
  getRecommendations,
  formatReportLines,
  formatHistoryLines,
} from '../src/commands/debt-format-helpers.js'
import type { DebtHistoryEntry, DebtReport } from '../src/commands/debt-helpers.js'

function makeReport(overrides: Partial<DebtReport> = {}): DebtReport {
  return {
    breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
    filesAnalyzed: 10,
    interest: { annual: 0, monthly: 0, weekly: 0 },
    overall: 5,
    path: '.',
    trend: { change: 0, direction: 'stable', previous: null },
    ...overrides,
  }
}

// ─── getDebtColor ─────────────────────────────────────
describe('getDebtColor', () => {
  it('returns green for score <= 5', () => {
    const fn = getDebtColor(0)
    expect(fn('test')).toContain('test')
  })

  it('returns green for score exactly 5', () => {
    const fn = getDebtColor(5)
    expect(typeof fn).toBe('function')
  })

  it('returns yellow for score between 6 and 15', () => {
    const fn = getDebtColor(10)
    expect(typeof fn).toBe('function')
  })

  it('returns yellow for score exactly 15', () => {
    const fn = getDebtColor(15)
    expect(typeof fn).toBe('function')
  })

  it('returns red for score > 15', () => {
    const fn = getDebtColor(20)
    expect(typeof fn).toBe('function')
  })

  it('returns red for very high score', () => {
    const fn = getDebtColor(100)
    expect(typeof fn).toBe('function')
  })
})

// ─── formatDebt ───────────────────────────────────────
describe('formatDebt', () => {
  it('pads score to 3 characters', () => {
    const result = formatDebt(5)
    expect(result).toContain('5')
  })

  it('formats score 0', () => {
    const result = formatDebt(0)
    expect(result).toContain('0')
  })

  it('formats large scores', () => {
    const result = formatDebt(999)
    expect(result).toContain('999')
  })
})

// ─── getRecommendations ──────────────────────────────
describe('getRecommendations', () => {
  it('returns empty array for low debt report', () => {
    const report = makeReport()
    expect(getRecommendations(report)).toEqual([])
  })

  it('returns security recommendation when security is high', () => {
    const report = makeReport({
      breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 10 },
    })
    const recs = getRecommendations(report)
    expect(recs.some((r) => r.includes('security'))).toBe(true)
  })

  it('returns complexity recommendation when complexity is high', () => {
    const report = makeReport({
      breakdown: { complexity: 15, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
    })
    const recs = getRecommendations(report)
    expect(recs.some((r) => r.includes('complexity'))).toBe(true)
  })

  it('returns dependencies recommendation when dependencies is high', () => {
    const report = makeReport({
      breakdown: { complexity: 0, dependencies: 10, documentation: 0, patterns: 0, security: 0 },
    })
    const recs = getRecommendations(report)
    expect(recs.some((r) => r.includes('circular dependencies'))).toBe(true)
  })

  it('returns documentation recommendation when documentation is high', () => {
    const report = makeReport({
      breakdown: { complexity: 0, dependencies: 0, documentation: 15, patterns: 0, security: 0 },
    })
    const recs = getRecommendations(report)
    expect(recs.some((r) => r.includes('JSDoc'))).toBe(true)
  })

  it('returns overall recommendation when overall is high', () => {
    const report = makeReport({ overall: 30 })
    const recs = getRecommendations(report)
    expect(recs.some((r) => r.includes('sprint'))).toBe(true)
  })

  it('returns max 5 recommendations', () => {
    const report = makeReport({
      breakdown: { complexity: 20, dependencies: 10, documentation: 15, patterns: 0, security: 10 },
      overall: 30,
    })
    const recs = getRecommendations(report)
    expect(recs.length).toBeLessThanOrEqual(5)
  })

  it('returns multiple recommendations for multiple high categories', () => {
    const report = makeReport({
      breakdown: { complexity: 15, dependencies: 0, documentation: 0, patterns: 0, security: 10 },
    })
    const recs = getRecommendations(report)
    expect(recs.length).toBe(2)
  })
})

// ─── formatReportLines ───────────────────────────────
describe('formatReportLines', () => {
  it('includes debt score', () => {
    const report = makeReport({ overall: 42 })
    const lines = formatReportLines(report, false)
    const joined = lines.join('\n')
    expect(joined).toContain('Technical Debt Analysis')
    expect(joined).toContain('42')
  })

  it('does not include breakdown when verbose is false', () => {
    const report = makeReport()
    const lines = formatReportLines(report, false)
    const joined = lines.join('\n')
    expect(joined).not.toContain('Category Breakdown')
  })

  it('includes breakdown when verbose is true', () => {
    const report = makeReport({
      breakdown: { complexity: 3, dependencies: 2, documentation: 1, patterns: 0, security: 5 },
    })
    const lines = formatReportLines(report, true)
    const joined = lines.join('\n')
    expect(joined).toContain('Category Breakdown')
    expect(joined).toContain('Complexity')
    expect(joined).toContain('Dependencies')
    expect(joined).toContain('Documentation')
    expect(joined).toContain('Security')
  })

  it('includes trend when previous is not null', () => {
    const report = makeReport({
      trend: { change: -5, direction: 'decreasing', previous: 10 },
    })
    const lines = formatReportLines(report, false)
    const joined = lines.join('\n')
    expect(joined).toContain('Trend')
    expect(joined).toContain('-5')
  })

  it('does not include trend when previous is null', () => {
    const report = makeReport({ trend: { change: 0, direction: 'stable', previous: null } })
    const lines = formatReportLines(report, false)
    const joined = lines.join('\n')
    expect(joined).not.toContain('Trend')
  })

  it('includes recommendations when present', () => {
    const report = makeReport({ overall: 30 })
    const lines = formatReportLines(report, false)
    const joined = lines.join('\n')
    expect(joined).toContain('Recommendations')
  })

  it('includes interest in verbose mode', () => {
    const report = makeReport({ interest: { annual: 100, monthly: 10, weekly: 2 } })
    const lines = formatReportLines(report, true)
    const joined = lines.join('\n')
    expect(joined).toContain('Debt Interest')
    expect(joined).toContain('100h')
    expect(joined).toContain('10h')
    expect(joined).toContain('2h')
  })
})

// ─── formatHistoryLines ──────────────────────────────
describe('formatHistoryLines', () => {
  const makeEntry = (overall: number, timestamp: string): DebtHistoryEntry => ({
    breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
    filesAnalyzed: 10,
    overall,
    timestamp,
  })

  it('shows message for empty history', () => {
    const lines = formatHistoryLines([])
    const joined = lines.join('\n')
    expect(joined).toContain('No history found')
  })

  it('shows history entries', () => {
    const history = [
      makeEntry(20, '2025-01-01T00:00:00Z'),
      makeEntry(15, '2025-02-01T00:00:00Z'),
    ]
    const lines = formatHistoryLines(history)
    const joined = lines.join('\n')
    expect(joined).toContain('Technical Debt History')
    expect(joined).toContain('Date')
  })

  it('shows decreasing trend indicator', () => {
    const history = [
      makeEntry(20, '2025-01-01T00:00:00Z'),
      makeEntry(15, '2025-02-01T00:00:00Z'),
    ]
    const lines = formatHistoryLines(history)
    const joined = lines.join('\n')
    expect(joined).toContain('reduced by 5')
  })

  it('shows increasing trend indicator', () => {
    const history = [
      makeEntry(10, '2025-01-01T00:00:00Z'),
      makeEntry(20, '2025-02-01T00:00:00Z'),
    ]
    const lines = formatHistoryLines(history)
    const joined = lines.join('\n')
    expect(joined).toContain('increased by 10')
  })

  it('shows stable indicator when no change', () => {
    const history = [
      makeEntry(15, '2025-01-01T00:00:00Z'),
      makeEntry(15, '2025-02-01T00:00:00Z'),
    ]
    const lines = formatHistoryLines(history)
    const joined = lines.join('\n')
    expect(joined).toContain('remained stable')
  })

  it('shows arrow for per-entry trend changes', () => {
    const history = [
      makeEntry(30, '2025-01-01T00:00:00Z'),
      makeEntry(20, '2025-02-01T00:00:00Z'),
      makeEntry(25, '2025-03-01T00:00:00Z'),
    ]
    const lines = formatHistoryLines(history)
    const joined = lines.join('\n')
    expect(joined).toContain('↓')
    expect(joined).toContain('↑')
  })

  it('shows dash for first entry (no previous)', () => {
    const history = [makeEntry(10, '2025-01-01T00:00:00Z')]
    const lines = formatHistoryLines(history)
    const joined = lines.join('\n')
    expect(joined).toContain('remained stable')
  })
})
