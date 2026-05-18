import { describe, it, expect } from 'vitest'
import {
  calculateBreakdown,
  calculateInterest,
  calculateOverall,
  getHistoryPath,
  computeTrend,
  appendHistoryEntry,
} from '../src/commands/debt-helpers.js'
import type { DebtHistoryEntry, DebtReport } from '../src/commands/debt-helpers.js'

function makeReport(overrides: Partial<DebtReport> = {}): DebtReport {
  return {
    breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
    filesAnalyzed: 10,
    interest: { annual: 0, monthly: 0, weekly: 0 },
    overall: 0,
    path: '.',
    trend: { change: 0, direction: 'stable', previous: null },
    ...overrides,
  }
}

// ─── calculateBreakdown ───────────────────────────────
describe('calculateBreakdown', () => {
  it('returns all zeros for empty violations', () => {
    const result = calculateBreakdown([])
    expect(result).toEqual({
      complexity: 0,
      dependencies: 0,
      documentation: 0,
      patterns: 0,
      security: 0,
    })
  })

  it('counts security violations with weight', () => {
    const violations = [
      { filePath: 'a.ts', message: '', range: { end: 1, start: 0 }, ruleId: 'no-eval', severity: 'error' as const },
      { filePath: 'a.ts', message: '', range: { end: 1, start: 0 }, ruleId: 'no-hardcoded-credentials', severity: 'error' as const },
    ]
    const result = calculateBreakdown(violations)
    expect(result.security).toBe(10)
  })

  it('counts complexity violations with weight', () => {
    const violations = [
      { filePath: 'a.ts', message: '', range: { end: 1, start: 0 }, ruleId: 'max-complexity', severity: 'error' as const },
    ]
    const result = calculateBreakdown(violations)
    expect(result.complexity).toBe(3)
  })

  it('counts unknown-category violations as complexity (default)', () => {
    const violations = [
      { filePath: 'a.ts', message: '', range: { end: 1, start: 0 }, ruleId: 'nonexistent-rule-xyz', severity: 'error' as const },
    ]
    const result = calculateBreakdown(violations)
    expect(result.complexity).toBe(3)
  })

  it('counts documentation-related violations', () => {
    const violations = [
      { filePath: 'a.ts', message: '', range: { end: 1, start: 0 }, ruleId: 'require-documentation', severity: 'warning' as const },
    ]
    const result = calculateBreakdown(violations)
    expect(result.documentation).toBeGreaterThanOrEqual(1)
  })
})

// ─── calculateInterest ────────────────────────────────
describe('calculateInterest', () => {
  it('returns zero interest for 0 debt points', () => {
    const result = calculateInterest(0)
    expect(result.weekly).toBe(0)
    expect(result.monthly).toBe(0)
    expect(result.annual).toBe(0)
  })

  it('calculates interest correctly for positive debt', () => {
    const result = calculateInterest(10)
    expect(result.weekly).toBe(3)
    expect(result.annual).toBeGreaterThan(0)
    expect(result.monthly).toBeGreaterThan(0)
  })

  it('annual interest is greater than monthly', () => {
    const result = calculateInterest(50)
    expect(result.annual).toBeGreaterThan(result.monthly)
  })

  it('monthly interest is greater than weekly', () => {
    const result = calculateInterest(50)
    expect(result.monthly).toBeGreaterThan(result.weekly)
  })
})

// ─── calculateOverall ─────────────────────────────────
describe('calculateOverall', () => {
  it('returns 0 for zero breakdown', () => {
    expect(calculateOverall({ complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 }, 10)).toBe(0)
  })

  it('divides total by file count', () => {
    const breakdown = { complexity: 10, dependencies: 0, documentation: 0, patterns: 0, security: 0 }
    expect(calculateOverall(breakdown, 5)).toBe(2)
  })

  it('uses at least 1 as file count divisor', () => {
    const breakdown = { complexity: 10, dependencies: 0, documentation: 0, patterns: 0, security: 0 }
    expect(calculateOverall(breakdown, 0)).toBe(10)
  })

  it('rounds the result', () => {
    const breakdown = { complexity: 10, dependencies: 0, documentation: 0, patterns: 0, security: 0 }
    expect(calculateOverall(breakdown, 3)).toBe(3)
  })

  it('sums all breakdown categories', () => {
    const breakdown = { complexity: 3, dependencies: 2, documentation: 1, patterns: 1, security: 5 }
    expect(calculateOverall(breakdown, 1)).toBe(12)
  })
})

// ─── getHistoryPath ───────────────────────────────────
describe('getHistoryPath', () => {
  it('joins path with .codeforge directory', () => {
    expect(getHistoryPath('/project')).toBe('/project/.codeforge/debt-history.json')
  })

  it('works with relative paths', () => {
    expect(getHistoryPath('.')).toContain('.codeforge')
    expect(getHistoryPath('.')).toContain('debt-history.json')
  })

  it('works with empty path segment', () => {
    expect(getHistoryPath('')).toBe('.codeforge/debt-history.json')
  })
})

// ─── computeTrend ─────────────────────────────────────
describe('computeTrend', () => {
  it('returns stable with null previous for empty history', () => {
    const result = computeTrend([], 10)
    expect(result.direction).toBe('stable')
    expect(result.previous).toBeNull()
    expect(result.change).toBe(0)
  })

  it('returns decreasing when current is much lower than previous', () => {
    const history: DebtHistoryEntry[] = [
      {
        breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
        filesAnalyzed: 10,
        overall: 20,
        timestamp: '2025-01-01',
      },
    ]
    const result = computeTrend(history, 10)
    expect(result.direction).toBe('decreasing')
    expect(result.change).toBe(-10)
    expect(result.previous).toBe(20)
  })

  it('returns increasing when current is much higher than previous', () => {
    const history: DebtHistoryEntry[] = [
      {
        breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
        filesAnalyzed: 10,
        overall: 10,
        timestamp: '2025-01-01',
      },
    ]
    const result = computeTrend(history, 20)
    expect(result.direction).toBe('increasing')
    expect(result.change).toBe(10)
    expect(result.previous).toBe(10)
  })

  it('returns stable for small change within threshold', () => {
    const history: DebtHistoryEntry[] = [
      {
        breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
        filesAnalyzed: 10,
        overall: 10,
        timestamp: '2025-01-01',
      },
    ]
    const result = computeTrend(history, 11)
    expect(result.direction).toBe('stable')
    expect(result.change).toBe(1)
  })

  it('uses last history entry as previous', () => {
    const history: DebtHistoryEntry[] = [
      {
        breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
        filesAnalyzed: 10,
        overall: 5,
        timestamp: '2025-01-01',
      },
      {
        breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
        filesAnalyzed: 10,
        overall: 15,
        timestamp: '2025-02-01',
      },
    ]
    const result = computeTrend(history, 10)
    expect(result.previous).toBe(15)
  })
})

// ─── appendHistoryEntry ──────────────────────────────
describe('appendHistoryEntry', () => {
  it('appends entry to empty history', () => {
    const report = makeReport({ overall: 10 })
    const result = appendHistoryEntry([], report, '2025-01-01')
    expect(result).toHaveLength(1)
    expect(result[0]!.overall).toBe(10)
    expect(result[0]!.timestamp).toBe('2025-01-01')
  })

  it('appends entry to existing history', () => {
    const existing: DebtHistoryEntry[] = [
      {
        breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
        filesAnalyzed: 5,
        overall: 5,
        timestamp: '2025-01-01',
      },
    ]
    const report = makeReport({ overall: 10 })
    const result = appendHistoryEntry(existing, report, '2025-02-01')
    expect(result).toHaveLength(2)
    expect(result[1]!.overall).toBe(10)
  })

  it('trims history when exceeding max entries', () => {
    const existing: DebtHistoryEntry[] = Array.from({ length: 30 }, (_, i) => ({
      breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
      filesAnalyzed: 5,
      overall: i,
      timestamp: `2025-01-${String(i + 1).padStart(2, '0')}`,
    }))
    const report = makeReport({ overall: 99 })
    const result = appendHistoryEntry(existing, report, '2025-12-31')
    expect(result).toHaveLength(30)
    expect(result.at(-1)!.overall).toBe(99)
  })

  it('preserves breakdown in entry', () => {
    const report = makeReport({
      breakdown: { complexity: 5, dependencies: 3, documentation: 1, patterns: 2, security: 4 },
    })
    const result = appendHistoryEntry([], report, '2025-01-01')
    expect(result[0]!.breakdown).toEqual({
      complexity: 5,
      dependencies: 3,
      documentation: 1,
      patterns: 2,
      security: 4,
    })
  })

  it('does not mutate original array', () => {
    const original: DebtHistoryEntry[] = [
      {
        breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
        filesAnalyzed: 5,
        overall: 5,
        timestamp: '2025-01-01',
      },
    ]
    const report = makeReport({ overall: 10 })
    appendHistoryEntry(original, report, '2025-02-01')
    expect(original).toHaveLength(1)
  })
})
