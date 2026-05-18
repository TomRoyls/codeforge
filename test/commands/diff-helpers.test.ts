import { describe, expect, it } from 'vitest'

import type { RuleViolation } from '../../src/ast/visitor.js'

import {
  createViolationKey,
  compareViolations,
  countByRule,
  countBySeverity,
  buildDiffReport,
  parseGitDiffOutput,
} from '../../src/commands/diff-helpers.js'

// ─── Helpers ───

function makeViolation(overrides: Partial<RuleViolation> = {}): RuleViolation {
  return {
    filePath: overrides.filePath ?? 'src/app.ts',
    message: overrides.message ?? 'Violation',
    range: {
      start: { line: overrides.range?.start?.line ?? 10, column: overrides.range?.start?.column ?? 0 },
      end: { line: overrides.range?.end?.line ?? 10, column: overrides.range?.end?.column ?? 10 },
    },
    ruleId: overrides.ruleId ?? 'no-eval',
    severity: overrides.severity ?? 'error',
  }
}

// ─── createViolationKey ───

describe('createViolationKey', () => {
  it('creates key from file:line:ruleId', () => {
    const v = makeViolation({ filePath: 'src/a.ts', ruleId: 'no-eval', range: { start: { line: 5, column: 0 }, end: { line: 5, column: 10 } } })
    expect(createViolationKey(v)).toBe('src/a.ts:5:no-eval')
  })

  it('differentiates by line number', () => {
    const a = makeViolation({ range: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } } })
    const b = makeViolation({ range: { start: { line: 2, column: 0 }, end: { line: 2, column: 10 } } })
    expect(createViolationKey(a)).not.toBe(createViolationKey(b))
  })
})

// ─── compareViolations ───

describe('compareViolations', () => {
  it('detects added violations', () => {
    const base = [makeViolation({ ruleId: 'a' })]
    const head = [makeViolation({ ruleId: 'a' }), makeViolation({ ruleId: 'b' })]
    const result = compareViolations(base, head)
    expect(result.added).toHaveLength(1)
    expect(result.added[0]!.ruleId).toBe('b')
  })

  it('detects removed violations', () => {
    const base = [makeViolation({ ruleId: 'a' }), makeViolation({ ruleId: 'b' })]
    const head = [makeViolation({ ruleId: 'a' })]
    const result = compareViolations(base, head)
    expect(result.removed).toHaveLength(1)
    expect(result.removed[0]!.ruleId).toBe('b')
  })

  it('returns empty when identical', () => {
    const violations = [makeViolation()]
    const result = compareViolations(violations, violations)
    expect(result.added).toHaveLength(0)
    expect(result.removed).toHaveLength(0)
  })

  it('returns empty for empty arrays', () => {
    const result = compareViolations([], [])
    expect(result.added).toHaveLength(0)
    expect(result.removed).toHaveLength(0)
  })
})

// ─── countByRule ───

describe('countByRule', () => {
  it('counts violations by rule', () => {
    const violations = [
      makeViolation({ ruleId: 'no-eval' }),
      makeViolation({ ruleId: 'no-eval' }),
      makeViolation({ ruleId: 'max-params' }),
    ]
    const counts = countByRule(violations)
    expect(counts['no-eval']).toBe(2)
    expect(counts['max-params']).toBe(1)
  })

  it('returns empty object for no violations', () => {
    expect(countByRule([])).toEqual({})
  })
})

// ─── countBySeverity ───

describe('countBySeverity', () => {
  it('counts by severity level', () => {
    const violations = [
      makeViolation({ severity: 'error' }),
      makeViolation({ severity: 'error' }),
      makeViolation({ severity: 'warning' }),
    ]
    const counts = countBySeverity(violations)
    expect(counts['error']).toBe(2)
    expect(counts['warning']).toBe(1)
  })

  it('returns empty for no violations', () => {
    expect(countBySeverity([])).toEqual({})
  })
})

// ─── buildDiffReport ───

describe('buildDiffReport', () => {
  it('builds report with net change', () => {
    const base = [makeViolation({ ruleId: 'a' })]
    const head = [makeViolation({ ruleId: 'a' }), makeViolation({ ruleId: 'b' }), makeViolation({ ruleId: 'c' })]
    const report = buildDiffReport('HEAD~1', 'HEAD', base, head)
    expect(report.summary.addedCount).toBe(2)
    expect(report.summary.removedCount).toBe(0)
    expect(report.summary.netChange).toBe(2)
    expect(report.summary.totalBase).toBe(1)
    expect(report.summary.totalHead).toBe(3)
  })

  it('calculates negative net change for improvements', () => {
    const base = [makeViolation({ ruleId: 'a' }), makeViolation({ ruleId: 'b' })]
    const head = [makeViolation({ ruleId: 'a' })]
    const report = buildDiffReport('HEAD~1', 'HEAD', base, head)
    expect(report.summary.netChange).toBe(-1)
  })

  it('preserves base and head strings', () => {
    const report = buildDiffReport('main', 'feature', [], [])
    expect(report.base).toBe('main')
    expect(report.head).toBe('feature')
  })
})

// ─── parseGitDiffOutput ───

describe('parseGitDiffOutput', () => {
  it('splits lines and trims', () => {
    const result = parseGitDiffOutput('  a.ts\n  b.ts\n')
    expect(result).toEqual(['a.ts', 'b.ts'])
  })

  it('filters empty lines', () => {
    const result = parseGitDiffOutput('\n\na.ts\n\n')
    expect(result).toEqual(['a.ts'])
  })

  it('returns empty for empty string', () => {
    expect(parseGitDiffOutput('')).toEqual([])
  })
})
