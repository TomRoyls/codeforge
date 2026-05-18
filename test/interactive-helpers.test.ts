import { describe, it, expect } from 'vitest'

import type { RuleViolation } from '../src/ast/visitor.js'

import {
  filterBySeverity,
  displayViolation,
  formatSummary,
  formatSeverity,
} from '../src/commands/interactive-helpers.js'
import type { FixResult } from '../src/commands/interactive-helpers.js'

function makeViolation(overrides: Partial<RuleViolation> = {}): RuleViolation {
  return {
    filePath: 'src/test.ts',
    message: 'test violation',
    range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
    ruleId: 'test-rule',
    severity: 'error',
    suggestion: 'fix it',
    ...overrides,
  }
}

// ─── filterBySeverity ──────────────────────────────────
describe('filterBySeverity', () => {
  it('returns all violations when min is info', () => {
    const violations = [
      makeViolation({ severity: 'error' }),
      makeViolation({ severity: 'warning' }),
      makeViolation({ severity: 'info' }),
    ]
    const result = filterBySeverity(violations, 'info')
    expect(result).toHaveLength(3)
  })

  it('filters out info when min is warning', () => {
    const violations = [
      makeViolation({ severity: 'error' }),
      makeViolation({ severity: 'warning' }),
      makeViolation({ severity: 'info' }),
    ]
    const result = filterBySeverity(violations, 'warning')
    expect(result).toHaveLength(2)
    expect(result.every((v) => v.severity !== 'info')).toBe(true)
  })

  it('filters out info and warning when min is error', () => {
    const violations = [
      makeViolation({ severity: 'error' }),
      makeViolation({ severity: 'warning' }),
      makeViolation({ severity: 'info' }),
    ]
    const result = filterBySeverity(violations, 'error')
    expect(result).toHaveLength(1)
    expect(result[0]!.severity).toBe('error')
  })

  it('returns empty for empty input', () => {
    expect(filterBySeverity([], 'error')).toEqual([])
  })
})

// ─── displayViolation ──────────────────────────────────
describe('displayViolation', () => {
  it('shows violation index and total', () => {
    const lines = displayViolation(makeViolation(), 0, 3, false)
    expect(lines.some((l) => l.includes('1/3'))).toBe(true)
  })

  it('shows file path and line number', () => {
    const v = makeViolation({ filePath: 'src/app.ts' })
    const lines = displayViolation(v, 0, 1, false)
    expect(lines.some((l) => l.includes('src/app.ts'))).toBe(true)
  })

  it('shows rule ID', () => {
    const v = makeViolation({ ruleId: 'no-console' })
    const lines = displayViolation(v, 0, 1, false)
    expect(lines.some((l) => l.includes('no-console'))).toBe(true)
  })

  it('shows severity', () => {
    const v = makeViolation({ severity: 'warning' })
    const lines = displayViolation(v, 0, 1, false)
    expect(lines.some((l) => l.includes('warning'))).toBe(true)
  })

  it('shows message', () => {
    const v = makeViolation({ message: 'Unexpected console call' })
    const lines = displayViolation(v, 0, 1, false)
    expect(lines.some((l) => l.includes('Unexpected console call'))).toBe(true)
  })

  it('hides suggestion in non-verbose mode', () => {
    const v = makeViolation({ suggestion: 'Remove console.log' })
    const lines = displayViolation(v, 0, 1, false)
    expect(lines.every((l) => !l.includes('Remove console.log'))).toBe(true)
  })

  it('shows suggestion in verbose mode', () => {
    const v = makeViolation({ suggestion: 'Remove console.log' })
    const lines = displayViolation(v, 0, 1, true)
    expect(lines.some((l) => l.includes('Remove console.log'))).toBe(true)
  })

  it('hides suggestion when none provided even in verbose', () => {
    const v = makeViolation({ suggestion: undefined })
    const lines = displayViolation(v, 0, 1, true)
    expect(lines.every((l) => !l.includes('Suggestion'))).toBe(true)
  })
})

// ─── formatSummary ─────────────────────────────────────
describe('formatSummary', () => {
  it('shows applied count', () => {
    const result: FixResult = { applied: 5, skipped: 2, total: 7 }
    const lines = formatSummary(result)
    expect(lines.some((l) => l.includes('5'))).toBe(true)
  })

  it('shows skipped count', () => {
    const result: FixResult = { applied: 3, skipped: 4, total: 7 }
    const lines = formatSummary(result)
    expect(lines.some((l) => l.includes('4'))).toBe(true)
  })

  it('shows total count', () => {
    const result: FixResult = { applied: 3, skipped: 2, total: 10 }
    const lines = formatSummary(result)
    expect(lines.some((l) => l.includes('10'))).toBe(true)
  })

  it('includes Summary header', () => {
    const lines = formatSummary({ applied: 0, skipped: 0, total: 0 })
    expect(lines.some((l) => l.includes('Summary'))).toBe(true)
  })

  it('handles zero values', () => {
    const lines = formatSummary({ applied: 0, skipped: 0, total: 0 })
    expect(lines.some((l) => l.includes('Applied'))).toBe(true)
    expect(lines.some((l) => l.includes('Skipped'))).toBe(true)
  })
})

// ─── formatSeverity (re-export) ────────────────────────
describe('formatSeverity', () => {
  it('formats error severity', () => {
    const result = formatSeverity('error')
    expect(result).toContain('error')
  })

  it('formats warning severity', () => {
    const result = formatSeverity('warning')
    expect(result).toContain('warning')
  })

  it('formats info severity', () => {
    const result = formatSeverity('info')
    expect(result).toContain('info')
  })
})
