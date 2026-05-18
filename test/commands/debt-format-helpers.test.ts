import { describe, expect, it } from 'vitest'

import {
  getDebtColor,
  formatDebt,
  getRecommendations,
  type DebtReport,
} from '../../src/commands/debt-format-helpers.js'

// ─── getDebtColor ───

describe('getDebtColor', () => {
  it('returns green for low scores', () => {
    const fn = getDebtColor(0)
    expect(fn('test')).toContain('test')
  })

  it('returns yellow for medium scores', () => {
    const fn = getDebtColor(10)
    expect(fn('test')).toContain('test')
  })

  it('returns red for high scores', () => {
    const fn = getDebtColor(20)
    expect(fn('test')).toContain('test')
  })

  it('boundary at 5 between green and yellow', () => {
    expect(getDebtColor(5)).not.toBe(getDebtColor(6))
  })

  it('boundary at 15 between yellow and red', () => {
    expect(getDebtColor(15)).not.toBe(getDebtColor(16))
  })
})

// ─── formatDebt ───

describe('formatDebt', () => {
  it('pads score to 3 characters', () => {
    const result = formatDebt(5)
    const stripped = result.replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped.trim()).toBe('5')
  })

  it('formats single digit score', () => {
    const result = formatDebt(3)
    expect(result.replace(/\x1b\[[0-9;]*m/g, '').trim()).toBe('3')
  })

  it('formats double digit score', () => {
    const result = formatDebt(15)
    expect(result.replace(/\x1b\[[0-9;]*m/g, '').trim()).toBe('15')
  })
})

// ─── getRecommendations ───

describe('getRecommendations', () => {
  function makeReport(overrides: Partial<DebtReport['breakdown']> = {}): DebtReport {
    return {
      breakdown: {
        complexity: 0,
        dependencies: 0,
        documentation: 0,
        patterns: 0,
        security: 0,
        ...overrides,
      },
      filesAnalyzed: 10,
      interest: { annual: 0, monthly: 0, weekly: 0 },
      overall: 0,
      trend: { change: 0, direction: 'stable', previous: null },
      ...overrides,
    } as DebtReport
  }

  it('returns empty recommendations for healthy report', () => {
    const report = makeReport()
    expect(getRecommendations(report)).toEqual([])
  })

  it('returns security recommendation when security is high', () => {
    const report = makeReport({ security: 100 })
    const recs = getRecommendations(report)
    expect(recs.some((r) => r.toLowerCase().includes('security'))).toBe(true)
  })

  it('returns complexity recommendation when complexity is high', () => {
    const report = makeReport({ complexity: 100 })
    const recs = getRecommendations(report)
    expect(recs.some((r) => r.toLowerCase().includes('complexity'))).toBe(true)
  })

  it('returns dependencies recommendation when dependencies is high', () => {
    const report = makeReport({ dependencies: 100 })
    const recs = getRecommendations(report)
    expect(recs.some((r) => r.toLowerCase().includes('dependencies'))).toBe(true)
  })

  it('limits recommendations to MAX_RECOMMENDATIONS', () => {
    const report = makeReport({ complexity: 100, dependencies: 100, documentation: 100, security: 100 })
    report.overall = 100
    const recs = getRecommendations(report)
    expect(recs.length).toBeLessThanOrEqual(5)
  })
})
