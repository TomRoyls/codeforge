import { describe, expect, it } from 'vitest'

import type { RuleViolation } from '../../src/ast/visitor.js'

import {
  calculateInterest,
  calculateOverall,
  getHistoryPath,
  computeTrend,
  appendHistoryEntry,
  WEEKS_PER_YEAR,
} from '../../src/commands/debt-helpers.js'

import type { DebtBreakdown, DebtHistoryEntry, DebtReport } from '../../src/commands/debt-helpers.js'

// ─── Constants ───

describe('WEEKS_PER_YEAR', () => {
  it('is 52', () => {
    expect(WEEKS_PER_YEAR).toBe(52)
  })
})

// ─── calculateInterest ───

describe('calculateInterest', () => {
  it('returns zero interest for zero points', () => {
    const result = calculateInterest(0)
    expect(result.weekly).toBe(0)
    expect(result.monthly).toBe(0)
    expect(result.annual).toBe(0)
  })

  it('calculates proportional interest', () => {
    const result = calculateInterest(10)
    expect(result.weekly).toBeGreaterThan(0)
    expect(result.monthly).toBeGreaterThan(result.weekly)
    expect(result.annual).toBeGreaterThan(result.monthly)
  })

  it('annual is larger than monthly which is larger than weekly', () => {
    const result = calculateInterest(10)
    expect(result.annual).toBeGreaterThan(result.monthly)
    expect(result.monthly).toBeGreaterThan(result.weekly)
  })
})

// ─── calculateOverall ───

describe('calculateOverall', () => {
  it('sums breakdown and normalizes by file count', () => {
    const breakdown: DebtBreakdown = {
      complexity: 10,
      dependencies: 5,
      documentation: 3,
      patterns: 2,
      security: 0,
    }
    expect(calculateOverall(breakdown, 2)).toBe(10)
  })

  it('uses minimum of 1 for files count', () => {
    const breakdown: DebtBreakdown = {
      complexity: 10,
      dependencies: 5,
      documentation: 3,
      patterns: 2,
      security: 0,
    }
    expect(calculateOverall(breakdown, 0)).toBe(20)
  })

  it('returns 0 for empty breakdown', () => {
    const breakdown: DebtBreakdown = {
      complexity: 0,
      dependencies: 0,
      documentation: 0,
      patterns: 0,
      security: 0,
    }
    expect(calculateOverall(breakdown, 5)).toBe(0)
  })
})

// ─── getHistoryPath ───

describe('getHistoryPath', () => {
  it('returns path under .codeforge directory', () => {
    expect(getHistoryPath('/project')).toBe('/project/.codeforge/debt-history.json')
  })

  it('handles relative paths', () => {
    expect(getHistoryPath('.')).toContain('.codeforge')
  })
})

// ─── computeTrend ───

describe('computeTrend', () => {
  it('returns stable for empty history', () => {
    const trend = computeTrend([], 50)
    expect(trend.direction).toBe('stable')
    expect(trend.change).toBe(0)
    expect(trend.previous).toBeNull()
  })

  it('detects increasing debt', () => {
    const history: DebtHistoryEntry[] = [
      { breakdown: {} as DebtBreakdown, filesAnalyzed: 10, overall: 30, timestamp: '2024-01-01' },
    ]
    const trend = computeTrend(history, 50)
    expect(trend.direction).toBe('increasing')
    expect(trend.change).toBe(20)
    expect(trend.previous).toBe(30)
  })

  it('detects decreasing debt', () => {
    const history: DebtHistoryEntry[] = [
      { breakdown: {} as DebtBreakdown, filesAnalyzed: 10, overall: 50, timestamp: '2024-01-01' },
    ]
    const trend = computeTrend(history, 30)
    expect(trend.direction).toBe('decreasing')
    expect(trend.change).toBe(-20)
  })

  it('detects stable debt within threshold', () => {
    const history: DebtHistoryEntry[] = [
      { breakdown: {} as DebtBreakdown, filesAnalyzed: 10, overall: 50, timestamp: '2024-01-01' },
    ]
    const trend = computeTrend(history, 51)
    expect(trend.direction).toBe('stable')
    expect(trend.change).toBe(1)
  })

  it('uses last history entry', () => {
    const history: DebtHistoryEntry[] = [
      { breakdown: {} as DebtBreakdown, filesAnalyzed: 10, overall: 30, timestamp: '2024-01-01' },
      { breakdown: {} as DebtBreakdown, filesAnalyzed: 10, overall: 40, timestamp: '2024-01-02' },
    ]
    const trend = computeTrend(history, 50)
    expect(trend.previous).toBe(40)
    expect(trend.change).toBe(10)
  })
})

// ─── appendHistoryEntry ───

describe('appendHistoryEntry', () => {
  it('appends new entry', () => {
    const report: DebtReport = {
      breakdown: {} as DebtBreakdown,
      filesAnalyzed: 10,
      interest: { annual: 0, monthly: 0, weekly: 0 },
      overall: 50,
      path: '.',
      trend: { change: 0, direction: 'stable', previous: null },
    }
    const result = appendHistoryEntry([], report, '2024-01-01')
    expect(result).toHaveLength(1)
    expect(result[0]!.timestamp).toBe('2024-01-01')
    expect(result[0]!.overall).toBe(50)
  })

  it('preserves existing entries', () => {
    const existing: DebtHistoryEntry[] = [
      { breakdown: {} as DebtBreakdown, filesAnalyzed: 10, overall: 30, timestamp: '2024-01-01' },
    ]
    const report: DebtReport = {
      breakdown: {} as DebtBreakdown,
      filesAnalyzed: 10,
      interest: { annual: 0, monthly: 0, weekly: 0 },
      overall: 50,
      path: '.',
      trend: { change: 0, direction: 'stable', previous: null },
    }
    const result = appendHistoryEntry(existing, report, '2024-01-02')
    expect(result).toHaveLength(2)
  })

  it('does not mutate original array', () => {
    const existing: DebtHistoryEntry[] = []
    const report: DebtReport = {
      breakdown: {} as DebtBreakdown,
      filesAnalyzed: 10,
      interest: { annual: 0, monthly: 0, weekly: 0 },
      overall: 50,
      path: '.',
      trend: { change: 0, direction: 'stable', previous: null },
    }
    appendHistoryEntry(existing, report, '2024-01-01')
    expect(existing).toHaveLength(0)
  })
})
