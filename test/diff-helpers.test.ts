import { describe, it, expect, vi } from 'vitest'
import {
  createViolationKey,
  compareViolations,
  countByRule,
  countBySeverity,
  buildDiffReport,
  parseGitDiffOutput,
  formatSummary,
  displayAddedViolations,
  displayRemovedViolations,
  displayDiffReport,
} from '../src/commands/diff-helpers.js'
import type { RuleViolation } from '../src/ast/visitor.js'

function makeViolation(
  filePath: string,
  line: number,
  ruleId: string,
  severity: 'error' | 'info' | 'warning' = 'error',
): RuleViolation {
  return {
    filePath,
    message: `${ruleId} violation`,
    range: { end: { column: 10, line }, start: { column: 0, line } },
    ruleId,
    severity,
  }
}

// ─── createViolationKey ────────────────────────────────
describe('createViolationKey', () => {
  it('creates key from filePath, line, and ruleId', () => {
    const v = makeViolation('src/foo.ts', 5, 'no-eval')
    expect(createViolationKey(v)).toBe('src/foo.ts:5:no-eval')
  })

  it('differentiates violations on same file but different lines', () => {
    const v1 = makeViolation('src/foo.ts', 5, 'no-eval')
    const v2 = makeViolation('src/foo.ts', 10, 'no-eval')
    expect(createViolationKey(v1)).not.toBe(createViolationKey(v2))
  })

  it('differentiates violations on same line but different rules', () => {
    const v1 = makeViolation('src/foo.ts', 5, 'no-eval')
    const v2 = makeViolation('src/foo.ts', 5, 'no-console')
    expect(createViolationKey(v1)).not.toBe(createViolationKey(v2))
  })
})

// ─── compareViolations ─────────────────────────────────
describe('compareViolations', () => {
  it('finds added violations', () => {
    const base: RuleViolation[] = []
    const head = [makeViolation('a.ts', 1, 'no-eval')]
    const result = compareViolations(base, head)
    expect(result.added).toHaveLength(1)
    expect(result.removed).toHaveLength(0)
  })

  it('finds removed violations', () => {
    const base = [makeViolation('a.ts', 1, 'no-eval')]
    const head: RuleViolation[] = []
    const result = compareViolations(base, head)
    expect(result.removed).toHaveLength(1)
    expect(result.added).toHaveLength(0)
  })

  it('finds no changes when violations match', () => {
    const v = makeViolation('a.ts', 1, 'no-eval')
    const result = compareViolations([v], [v])
    expect(result.added).toHaveLength(0)
    expect(result.removed).toHaveLength(0)
  })

  it('handles mixed additions and removals', () => {
    const base = [makeViolation('a.ts', 1, 'rule-a'), makeViolation('b.ts', 2, 'rule-b')]
    const head = [makeViolation('a.ts', 1, 'rule-a'), makeViolation('c.ts', 3, 'rule-c')]
    const result = compareViolations(base, head)
    expect(result.added).toHaveLength(1)
    expect(result.added[0].ruleId).toBe('rule-c')
    expect(result.removed).toHaveLength(1)
    expect(result.removed[0].ruleId).toBe('rule-b')
  })

  it('handles empty both arrays', () => {
    const result = compareViolations([], [])
    expect(result.added).toHaveLength(0)
    expect(result.removed).toHaveLength(0)
  })

  it('always returns empty improved array', () => {
    const result = compareViolations(
      [makeViolation('a.ts', 1, 'r1')],
      [makeViolation('a.ts', 1, 'r2')],
    )
    expect(result.improved).toHaveLength(0)
  })
})

// ─── countByRule ───────────────────────────────────────
describe('countByRule', () => {
  it('counts violations by ruleId', () => {
    const violations = [
      makeViolation('a.ts', 1, 'no-eval'),
      makeViolation('b.ts', 2, 'no-eval'),
      makeViolation('c.ts', 3, 'no-console'),
    ]
    const counts = countByRule(violations)
    expect(counts['no-eval']).toBe(2)
    expect(counts['no-console']).toBe(1)
  })

  it('returns empty object for empty input', () => {
    expect(countByRule([])).toEqual({})
  })

  it('handles single violation', () => {
    const counts = countByRule([makeViolation('a.ts', 1, 'rule')])
    expect(counts['rule']).toBe(1)
  })
})

// ─── countBySeverity ───────────────────────────────────
describe('countBySeverity', () => {
  it('counts violations by severity', () => {
    const violations = [
      makeViolation('a.ts', 1, 'r1', 'error'),
      makeViolation('b.ts', 2, 'r2', 'error'),
      makeViolation('c.ts', 3, 'r3', 'warning'),
    ]
    const counts = countBySeverity(violations)
    expect(counts['error']).toBe(2)
    expect(counts['warning']).toBe(1)
  })

  it('returns empty object for empty input', () => {
    expect(countBySeverity([])).toEqual({})
  })
})

// ─── buildDiffReport ───────────────────────────────────
describe('buildDiffReport', () => {
  it('builds a complete diff report', () => {
    const base = [makeViolation('a.ts', 1, 'r1')]
    const head = [makeViolation('b.ts', 2, 'r2')]
    const report = buildDiffReport('HEAD~1', 'HEAD', base, head)
    expect(report.base).toBe('HEAD~1')
    expect(report.head).toBe('HEAD')
    expect(report.summary.totalBase).toBe(1)
    expect(report.summary.totalHead).toBe(1)
    expect(report.summary.addedCount).toBe(1)
    expect(report.summary.removedCount).toBe(1)
    expect(report.summary.netChange).toBe(0)
  })

  it('computes positive net change', () => {
    const base: RuleViolation[] = []
    const head = [makeViolation('a.ts', 1, 'r1'), makeViolation('b.ts', 2, 'r2')]
    const report = buildDiffReport('base', 'head', base, head)
    expect(report.summary.netChange).toBe(2)
  })

  it('computes negative net change', () => {
    const base = [makeViolation('a.ts', 1, 'r1'), makeViolation('b.ts', 2, 'r2')]
    const head: RuleViolation[] = []
    const report = buildDiffReport('base', 'head', base, head)
    expect(report.summary.netChange).toBe(-2)
  })

  it('computes zero net change', () => {
    const v = makeViolation('a.ts', 1, 'r1')
    const report = buildDiffReport('base', 'head', [v], [v])
    expect(report.summary.netChange).toBe(0)
  })
})

// ─── parseGitDiffOutput ────────────────────────────────
describe('parseGitDiffOutput', () => {
  it('splits lines and trims whitespace', () => {
    const result = parseGitDiffOutput('  a.ts  \n  b.ts  ')
    expect(result).toEqual(['a.ts', 'b.ts'])
  })

  it('filters empty lines', () => {
    const result = parseGitDiffOutput('a.ts\n\nb.ts\n\n')
    expect(result).toEqual(['a.ts', 'b.ts'])
  })

  it('returns empty array for empty string', () => {
    expect(parseGitDiffOutput('')).toEqual([])
  })

  it('handles single line', () => {
    expect(parseGitDiffOutput('file.ts')).toEqual(['file.ts'])
  })
})

// ─── formatSummary ─────────────────────────────────────
describe('formatSummary', () => {
  it('includes base and head comparison info', () => {
    const report = buildDiffReport('main', 'feature', [], [])
    const output = formatSummary(report)
    expect(output).toContain('main')
    expect(output).toContain('feature')
  })

  it('shows improvement message for negative net change', () => {
    const report = buildDiffReport('base', 'head', [makeViolation('a.ts', 1, 'r')], [])
    const output = formatSummary(report)
    expect(output).toContain('improved')
    expect(output).toContain('violations removed')
  })

  it('shows regression message for positive net change', () => {
    const report = buildDiffReport('base', 'head', [], [makeViolation('a.ts', 1, 'r')])
    const output = formatSummary(report)
    expect(output).toContain('regressed')
    expect(output).toContain('new violations')
  })

  it('shows no-change message for zero net change', () => {
    const report = buildDiffReport('base', 'head', [], [])
    const output = formatSummary(report)
    expect(output).toContain('No net change')
  })

  it('includes violation counts', () => {
    const report = buildDiffReport('b', 'h', [], [])
    const output = formatSummary(report)
    expect(output).toContain('Base violations')
    expect(output).toContain('Head violations')
    expect(output).toContain('Added')
    expect(output).toContain('Removed')
    expect(output).toContain('Net change')
  })
})

// ─── displayAddedViolations ────────────────────────────
describe('displayAddedViolations', () => {
  it('does nothing for empty violations', () => {
    const logFn = vi.fn()
    displayAddedViolations([], logFn)
    expect(logFn).not.toHaveBeenCalled()
  })

  it('displays added violations', () => {
    const logFn = vi.fn()
    const violations = [makeViolation('a.ts', 1, 'no-eval')]
    displayAddedViolations(violations, logFn)
    const calls = logFn.mock.calls.flat().join('\n')
    expect(calls).toContain('a.ts')
    expect(calls).toContain('1')
    expect(calls).toContain('no-eval')
    expect(calls).toContain('Added')
  })

  it('shows truncation message for many violations', () => {
    const logFn = vi.fn()
    const violations = Array.from({ length: 25 }, (_, i) =>
      makeViolation('a.ts', i + 1, `rule-${i}`),
    )
    displayAddedViolations(violations, logFn)
    const calls = logFn.mock.calls.flat().join('\n')
    expect(calls).toContain('and 5 more')
  })
})

// ─── displayRemovedViolations ──────────────────────────
describe('displayRemovedViolations', () => {
  it('does nothing for empty violations', () => {
    const logFn = vi.fn()
    displayRemovedViolations([], logFn)
    expect(logFn).not.toHaveBeenCalled()
  })

  it('displays removed violations', () => {
    const logFn = vi.fn()
    const violations = [makeViolation('a.ts', 1, 'no-eval')]
    displayRemovedViolations(violations, logFn)
    const calls = logFn.mock.calls.flat().join('\n')
    expect(calls).toContain('a.ts')
    expect(calls).toContain('Removed')
  })

  it('shows truncation message for many violations', () => {
    const logFn = vi.fn()
    const violations = Array.from({ length: 25 }, (_, i) =>
      makeViolation('a.ts', i + 1, `rule-${i}`),
    )
    displayRemovedViolations(violations, logFn)
    const calls = logFn.mock.calls.flat().join('\n')
    expect(calls).toContain('and 5 more')
  })
})

// ─── displayDiffReport ─────────────────────────────────
describe('displayDiffReport', () => {
  it('displays summary header', () => {
    const logFn = vi.fn()
    const report = buildDiffReport('base', 'head', [], [])
    displayDiffReport(report, false, logFn)
    const calls = logFn.mock.calls.flat().join('\n')
    expect(calls).toContain('Violation Diff Analysis')
  })

  it('shows comparison info', () => {
    const logFn = vi.fn()
    const report = buildDiffReport('main', 'feature', [], [])
    displayDiffReport(report, false, logFn)
    const calls = logFn.mock.calls.flat().join('\n')
    expect(calls).toContain('main')
    expect(calls).toContain('feature')
  })

  it('shows improvement message for negative net change', () => {
    const logFn = vi.fn()
    const report = buildDiffReport('b', 'h', [makeViolation('a.ts', 1, 'r')], [])
    displayDiffReport(report, false, logFn)
    const calls = logFn.mock.calls.flat().join('\n')
    expect(calls).toContain('improved')
  })

  it('shows added violations in verbose mode', () => {
    const logFn = vi.fn()
    const report = buildDiffReport('b', 'h', [], [makeViolation('a.ts', 1, 'no-eval')])
    displayDiffReport(report, true, logFn)
    const calls = logFn.mock.calls.flat().join('\n')
    expect(calls).toContain('Added Violations')
    expect(calls).toContain('no-eval')
  })

  it('hides added violations in non-verbose mode', () => {
    const logFn = vi.fn()
    const report = buildDiffReport('b', 'h', [], [makeViolation('a.ts', 1, 'no-eval')])
    displayDiffReport(report, false, logFn)
    const calls = logFn.mock.calls.flat().join('\n')
    expect(calls).not.toContain('Added Violations')
  })

  it('shows removed violations in verbose mode', () => {
    const logFn = vi.fn()
    const report = buildDiffReport('b', 'h', [makeViolation('a.ts', 1, 'r')], [])
    displayDiffReport(report, true, logFn)
    const calls = logFn.mock.calls.flat().join('\n')
    expect(calls).toContain('Removed Violations')
  })
})
