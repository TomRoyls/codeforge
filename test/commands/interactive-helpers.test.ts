import { describe, expect, it } from 'vitest'

import type { RuleViolation } from '../../src/ast/visitor.js'

import { filterBySeverity, formatSummary, type FixResult } from '../../src/commands/interactive-helpers.js'

// ─── filterBySeverity ───

describe('filterBySeverity', () => {
  function makeViolation(severity: 'error' | 'info' | 'warning'): RuleViolation {
    return {
      filePath: 'test.ts',
      message: 'msg',
      range: { end: { column: 1, line: 1 }, start: { column: 0, line: 1 } },
      ruleId: 'test',
      severity,
    }
  }

  it('filters by error level', () => {
    const violations = [
      makeViolation('error'),
      makeViolation('warning'),
      makeViolation('info'),
    ]
    const result = filterBySeverity(violations, 'error')
    expect(result).toHaveLength(1)
    expect(result[0].severity).toBe('error')
  })

  it('filters by warning level', () => {
    const violations = [
      makeViolation('error'),
      makeViolation('warning'),
      makeViolation('info'),
    ]
    const result = filterBySeverity(violations, 'warning')
    expect(result).toHaveLength(2)
  })

  it('returns all for info level', () => {
    const violations = [
      makeViolation('error'),
      makeViolation('warning'),
      makeViolation('info'),
    ]
    expect(filterBySeverity(violations, 'info')).toHaveLength(3)
  })

  it('returns empty for empty input', () => {
    expect(filterBySeverity([], 'error')).toEqual([])
  })
})

// ─── formatSummary ───

describe('formatSummary', () => {
  it('displays applied, skipped, and total counts', () => {
    const result: FixResult = { applied: 5, skipped: 2, total: 7 }
    const lines = formatSummary(result)
    const text = lines.join(' ')
    expect(text).toContain('5')
    expect(text).toContain('2')
    expect(text).toContain('7')
  })

  it('includes summary header', () => {
    const lines = formatSummary({ applied: 0, skipped: 0, total: 0 })
    const text = lines.join(' ')
    expect(text).toContain('Summary')
  })

  it('handles zero values', () => {
    const lines = formatSummary({ applied: 0, skipped: 0, total: 0 })
    expect(lines.length).toBeGreaterThan(0)
  })
})
