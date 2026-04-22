import { describe, test, expect } from 'vitest'
import {
  buildDiffReport,
  compareViolations,
  countByRule,
  countBySeverity,
  createViolationKey,
  displayAddedViolations,
  displayDiffReport,
  displayRemovedViolations,
  formatSummary,
  parseGitDiffOutput,
  type DiffReport,
} from '../../../src/commands/diff-helpers.js'
import type { RuleViolation } from '../../../src/ast/visitor.js'

function makeViolation(
  overrides: Partial<RuleViolation> & { filePath: string; ruleId: string },
): RuleViolation {
  return {
    severity: 'warning',
    message: 'test violation',
    range: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 5 },
    },
    ...overrides,
  }
}

function makeReport(overrides: Partial<DiffReport> = {}): DiffReport {
  return {
    added: [],
    base: 'HEAD~1',
    head: 'HEAD',
    improved: [],
    removed: [],
    summary: {
      addedCount: 0,
      improvedCount: 0,
      netChange: 0,
      removedCount: 0,
      totalBase: 10,
      totalHead: 10,
    },
    ...overrides,
  }
}

describe('createViolationKey', () => {
  test('creates key from filePath, line, and ruleId', () => {
    const v = makeViolation({ filePath: 'src/test.ts', ruleId: 'max-complexity' })
    expect(createViolationKey(v)).toBe('src/test.ts:1:max-complexity')
  })

  test('uses start line number', () => {
    const v = makeViolation({
      filePath: 'src/a.ts',
      ruleId: 'no-console',
      range: { start: { line: 42, column: 5 }, end: { line: 42, column: 10 } },
    })
    expect(createViolationKey(v)).toBe('src/a.ts:42:no-console')
  })

  test('different files produce different keys', () => {
    const v1 = makeViolation({ filePath: 'src/a.ts', ruleId: 'max-complexity' })
    const v2 = makeViolation({ filePath: 'src/b.ts', ruleId: 'max-complexity' })
    expect(createViolationKey(v1)).not.toBe(createViolationKey(v2))
  })

  test('different lines produce different keys', () => {
    const v1 = makeViolation({
      filePath: 'src/test.ts',
      ruleId: 'max-complexity',
      range: { start: { line: 10, column: 0 }, end: { line: 10, column: 5 } },
    })
    const v2 = makeViolation({
      filePath: 'src/test.ts',
      ruleId: 'max-complexity',
      range: { start: { line: 20, column: 0 }, end: { line: 20, column: 5 } },
    })
    expect(createViolationKey(v1)).not.toBe(createViolationKey(v2))
  })

  test('different rules produce different keys', () => {
    const v1 = makeViolation({ filePath: 'src/test.ts', ruleId: 'rule-a' })
    const v2 = makeViolation({ filePath: 'src/test.ts', ruleId: 'rule-b' })
    expect(createViolationKey(v1)).not.toBe(createViolationKey(v2))
  })

  test('same file, line, and rule produce same key', () => {
    const v1 = makeViolation({ filePath: 'src/test.ts', ruleId: 'max-complexity' })
    const v2 = makeViolation({ filePath: 'src/test.ts', ruleId: 'max-complexity' })
    expect(createViolationKey(v1)).toBe(createViolationKey(v2))
  })

  test('handles deep nested paths', () => {
    const v = makeViolation({
      filePath: 'packages/core/src/utils/helpers/format.ts',
      ruleId: 'no-console',
    })
    expect(createViolationKey(v)).toBe('packages/core/src/utils/helpers/format.ts:1:no-console')
  })

  test('column number does not affect key', () => {
    const v1 = makeViolation({
      filePath: 'src/a.ts',
      ruleId: 'no-console',
      range: { start: { line: 5, column: 0 }, end: { line: 5, column: 10 } },
    })
    const v2 = makeViolation({
      filePath: 'src/a.ts',
      ruleId: 'no-console',
      range: { start: { line: 5, column: 99 }, end: { line: 5, column: 120 } },
    })
    expect(createViolationKey(v1)).toBe(createViolationKey(v2))
  })

  test('handles file paths with dots and dashes', () => {
    const v = makeViolation({
      filePath: 'src/my-component.test-utils.ts',
      ruleId: 'max-complexity',
    })
    expect(createViolationKey(v)).toBe('src/my-component.test-utils.ts:1:max-complexity')
  })

  test('key format uses exactly two colon separators', () => {
    const v = makeViolation({
      filePath: 'src/a.ts',
      ruleId: 'no-console',
      range: { start: { line: 3, column: 0 }, end: { line: 3, column: 5 } },
    })
    const key = createViolationKey(v)
    const parts = key.split(':')
    expect(parts).toHaveLength(3)
    expect(parts[0]).toBe('src/a.ts')
    expect(parts[1]).toBe('3')
    expect(parts[2]).toBe('no-console')
  })

  test('handles line 0 as start line', () => {
    const v = makeViolation({
      filePath: 'src/a.ts',
      ruleId: 'no-console',
      range: { start: { line: 0, column: 0 }, end: { line: 0, column: 5 } },
    })
    expect(createViolationKey(v)).toBe('src/a.ts:0:no-console')
  })
})

describe('compareViolations', () => {
  test('returns empty arrays when both are empty', () => {
    const result = compareViolations([], [])
    expect(result.added).toEqual([])
    expect(result.removed).toEqual([])
    expect(result.improved).toEqual([])
  })

  test('detects added violations', () => {
    const base: RuleViolation[] = []
    const head = [makeViolation({ filePath: 'src/a.ts', ruleId: 'no-console' })]
    const result = compareViolations(base, head)
    expect(result.added).toHaveLength(1)
    expect(result.added[0].ruleId).toBe('no-console')
  })

  test('detects removed violations', () => {
    const base = [makeViolation({ filePath: 'src/a.ts', ruleId: 'no-console' })]
    const head: RuleViolation[] = []
    const result = compareViolations(base, head)
    expect(result.removed).toHaveLength(1)
    expect(result.removed[0].ruleId).toBe('no-console')
  })

  test('detects both added and removed', () => {
    const base = [makeViolation({ filePath: 'src/a.ts', ruleId: 'no-console' })]
    const head = [makeViolation({ filePath: 'src/b.ts', ruleId: 'max-complexity' })]
    const result = compareViolations(base, head)
    expect(result.added).toHaveLength(1)
    expect(result.removed).toHaveLength(1)
  })

  test('common violations are neither added nor removed', () => {
    const v = makeViolation({ filePath: 'src/a.ts', ruleId: 'no-console' })
    const result = compareViolations([v], [v])
    expect(result.added).toHaveLength(0)
    expect(result.removed).toHaveLength(0)
  })

  test('handles multiple added violations', () => {
    const base: RuleViolation[] = []
    const head = [
      makeViolation({ filePath: 'src/a.ts', ruleId: 'no-console' }),
      makeViolation({ filePath: 'src/b.ts', ruleId: 'max-complexity' }),
      makeViolation({ filePath: 'src/c.ts', ruleId: 'no-eval' }),
    ]
    const result = compareViolations(base, head)
    expect(result.added).toHaveLength(3)
  })

  test('handles multiple removed violations', () => {
    const base = [
      makeViolation({ filePath: 'src/a.ts', ruleId: 'no-console' }),
      makeViolation({ filePath: 'src/b.ts', ruleId: 'max-complexity' }),
    ]
    const head: RuleViolation[] = []
    const result = compareViolations(base, head)
    expect(result.removed).toHaveLength(2)
  })

  test('improved is always empty (no severity change detection)', () => {
    const result = compareViolations([], [makeViolation({ filePath: 'a.ts', ruleId: 'r' })])
    expect(result.improved).toEqual([])
  })

  test('same violation at different lines is treated as different', () => {
    const base = [
      makeViolation({
        filePath: 'src/a.ts',
        ruleId: 'no-console',
        range: { start: { line: 5, column: 0 }, end: { line: 5, column: 5 } },
      }),
    ]
    const head = [
      makeViolation({
        filePath: 'src/a.ts',
        ruleId: 'no-console',
        range: { start: { line: 10, column: 0 }, end: { line: 10, column: 5 } },
      }),
    ]
    const result = compareViolations(base, head)
    expect(result.added).toHaveLength(1)
    expect(result.removed).toHaveLength(1)
  })

  test('handles large violation sets', () => {
    const base = Array.from({ length: 100 }, (_, i) =>
      makeViolation({ filePath: `src/base-${i}.ts`, ruleId: 'rule-a' }),
    )
    const head = Array.from({ length: 80 }, (_, i) =>
      makeViolation({ filePath: `src/head-${i}.ts`, ruleId: 'rule-b' }),
    )
    const result = compareViolations(base, head)
    expect(result.added).toHaveLength(80)
    expect(result.removed).toHaveLength(100)
  })

  test('multiple violations in same file with different rules', () => {
    const base = [
      makeViolation({ filePath: 'src/a.ts', ruleId: 'no-console' }),
      makeViolation({ filePath: 'src/a.ts', ruleId: 'max-complexity' }),
    ]
    const head = [
      makeViolation({ filePath: 'src/a.ts', ruleId: 'no-console' }),
      makeViolation({ filePath: 'src/a.ts', ruleId: 'no-eval' }),
    ]
    const result = compareViolations(base, head)
    expect(result.removed).toHaveLength(1)
    expect(result.removed[0].ruleId).toBe('max-complexity')
    expect(result.added).toHaveLength(1)
    expect(result.added[0].ruleId).toBe('no-eval')
  })

  test('swapping base and head swaps added and removed', () => {
    const base = [makeViolation({ filePath: 'src/only-base.ts', ruleId: 'r1' })]
    const head = [makeViolation({ filePath: 'src/only-head.ts', ruleId: 'r2' })]
    const forward = compareViolations(base, head)
    const reverse = compareViolations(head, base)
    expect(forward.added).toHaveLength(1)
    expect(forward.removed).toHaveLength(1)
    expect(reverse.added).toHaveLength(1)
    expect(reverse.removed).toHaveLength(1)
    expect(forward.added[0].filePath).toBe(reverse.removed[0].filePath)
    expect(forward.removed[0].filePath).toBe(reverse.added[0].filePath)
  })

  test('preserves violation data in added results', () => {
    const v = makeViolation({
      filePath: 'src/a.ts',
      ruleId: 'no-console',
      severity: 'error',
      message: 'Unexpected console statement',
      range: { start: { line: 42, column: 5 }, end: { line: 42, column: 20 } },
    })
    const result = compareViolations([], [v])
    expect(result.added[0]).toEqual(v)
  })

  test('preserves violation data in removed results', () => {
    const v = makeViolation({
      filePath: 'src/old.ts',
      ruleId: 'no-debugger',
      severity: 'warning',
      message: 'Unexpected debugger statement',
      range: { start: { line: 10, column: 0 }, end: { line: 10, column: 10 } },
    })
    const result = compareViolations([v], [])
    expect(result.removed[0]).toEqual(v)
  })

  test('identical results produce no changes', () => {
    const violations = [
      makeViolation({ filePath: 'src/a.ts', ruleId: 'no-console' }),
      makeViolation({ filePath: 'src/b.ts', ruleId: 'max-complexity' }),
    ]
    const result = compareViolations(violations, violations)
    expect(result.added).toHaveLength(0)
    expect(result.removed).toHaveLength(0)
    expect(result.improved).toHaveLength(0)
  })
})

describe('countByRule', () => {
  test('returns empty object for empty array', () => {
    expect(countByRule([])).toEqual({})
  })

  test('counts single violation', () => {
    const violations = [makeViolation({ filePath: 'a.ts', ruleId: 'no-console' })]
    expect(countByRule(violations)).toEqual({ 'no-console': 1 })
  })

  test('counts multiple violations of same rule', () => {
    const violations = [
      makeViolation({ filePath: 'a.ts', ruleId: 'no-console' }),
      makeViolation({ filePath: 'b.ts', ruleId: 'no-console' }),
      makeViolation({ filePath: 'c.ts', ruleId: 'no-console' }),
    ]
    expect(countByRule(violations)).toEqual({ 'no-console': 3 })
  })

  test('counts violations across different rules', () => {
    const violations = [
      makeViolation({ filePath: 'a.ts', ruleId: 'no-console' }),
      makeViolation({ filePath: 'b.ts', ruleId: 'max-complexity' }),
      makeViolation({ filePath: 'c.ts', ruleId: 'no-console' }),
      makeViolation({ filePath: 'd.ts', ruleId: 'max-complexity' }),
      makeViolation({ filePath: 'e.ts', ruleId: 'no-eval' }),
    ]
    const result = countByRule(violations)
    expect(result).toEqual({
      'no-console': 2,
      'max-complexity': 2,
      'no-eval': 1,
    })
  })

  test('handles single rule type', () => {
    const violations = [makeViolation({ filePath: 'a.ts', ruleId: 'no-console' })]
    const result = countByRule(violations)
    expect(Object.keys(result)).toHaveLength(1)
  })

  test('handles rule with special characters in name', () => {
    const violations = [makeViolation({ filePath: 'a.ts', ruleId: 'no-eval-like' })]
    expect(countByRule(violations)).toEqual({ 'no-eval-like': 1 })
  })

  test('preserves ruleId casing', () => {
    const violations = [
      makeViolation({ filePath: 'a.ts', ruleId: 'NoConsole' }),
      makeViolation({ filePath: 'b.ts', ruleId: 'noconsole' }),
    ]
    const result = countByRule(violations)
    expect(result).toEqual({ NoConsole: 1, noconsole: 1 })
  })

  test('handles large number of distinct rules', () => {
    const violations = Array.from({ length: 50 }, (_, i) =>
      makeViolation({ filePath: `src/${i}.ts`, ruleId: `rule-${i}` }),
    )
    const result = countByRule(violations)
    expect(Object.keys(result)).toHaveLength(50)
    expect(result['rule-0']).toBe(1)
    expect(result['rule-49']).toBe(1)
  })
})

describe('countBySeverity', () => {
  test('returns empty object for empty array', () => {
    expect(countBySeverity([])).toEqual({})
  })

  test('counts single violation severity', () => {
    const violations = [makeViolation({ filePath: 'a.ts', ruleId: 'r', severity: 'error' })]
    expect(countBySeverity(violations)).toEqual({ error: 1 })
  })

  test('counts mixed severities', () => {
    const violations = [
      makeViolation({ filePath: 'a.ts', ruleId: 'r1', severity: 'error' }),
      makeViolation({ filePath: 'b.ts', ruleId: 'r2', severity: 'warning' }),
      makeViolation({ filePath: 'c.ts', ruleId: 'r3', severity: 'info' }),
      makeViolation({ filePath: 'd.ts', ruleId: 'r4', severity: 'error' }),
    ]
    expect(countBySeverity(violations)).toEqual({ error: 2, warning: 1, info: 1 })
  })

  test('counts all same severity', () => {
    const violations = [
      makeViolation({ filePath: 'a.ts', ruleId: 'r1', severity: 'warning' }),
      makeViolation({ filePath: 'b.ts', ruleId: 'r2', severity: 'warning' }),
    ]
    expect(countBySeverity(violations)).toEqual({ warning: 2 })
  })

  test('counts only errors', () => {
    const violations = [
      makeViolation({ filePath: 'a.ts', ruleId: 'r1', severity: 'error' }),
      makeViolation({ filePath: 'b.ts', ruleId: 'r2', severity: 'error' }),
      makeViolation({ filePath: 'c.ts', ruleId: 'r3', severity: 'error' }),
    ]
    expect(countBySeverity(violations)).toEqual({ error: 3 })
  })

  test('counts only info severity', () => {
    const violations = [
      makeViolation({ filePath: 'a.ts', ruleId: 'r1', severity: 'info' }),
      makeViolation({ filePath: 'b.ts', ruleId: 'r2', severity: 'info' }),
    ]
    expect(countBySeverity(violations)).toEqual({ info: 2 })
  })

  test('handles unknown severity string', () => {
    const violations = [
      makeViolation({
        filePath: 'a.ts',
        ruleId: 'r1',
        severity: 'custom' as RuleViolation['severity'],
      }),
    ]
    expect(countBySeverity(violations)).toEqual({ custom: 1 })
  })

  test('counts many violations with same severity', () => {
    const violations = Array.from({ length: 10 }, (_, i) =>
      makeViolation({ filePath: `src/${i}.ts`, ruleId: 'r', severity: 'error' }),
    )
    expect(countBySeverity(violations)).toEqual({ error: 10 })
  })
})

describe('buildDiffReport', () => {
  test('builds report with empty violations', () => {
    const report = buildDiffReport('HEAD~1', 'HEAD', [], [])
    expect(report.base).toBe('HEAD~1')
    expect(report.head).toBe('HEAD')
    expect(report.added).toEqual([])
    expect(report.removed).toEqual([])
    expect(report.summary.addedCount).toBe(0)
    expect(report.summary.removedCount).toBe(0)
    expect(report.summary.netChange).toBe(0)
    expect(report.summary.totalBase).toBe(0)
    expect(report.summary.totalHead).toBe(0)
  })

  test('builds report with added violations', () => {
    const head = [makeViolation({ filePath: 'a.ts', ruleId: 'no-console' })]
    const report = buildDiffReport('main', 'feature', [], head)
    expect(report.summary.addedCount).toBe(1)
    expect(report.summary.removedCount).toBe(0)
    expect(report.summary.netChange).toBe(1)
    expect(report.summary.totalBase).toBe(0)
    expect(report.summary.totalHead).toBe(1)
  })

  test('builds report with removed violations', () => {
    const base = [
      makeViolation({ filePath: 'a.ts', ruleId: 'no-console' }),
      makeViolation({ filePath: 'b.ts', ruleId: 'max-complexity' }),
    ]
    const report = buildDiffReport('main', 'feature', base, [])
    expect(report.summary.addedCount).toBe(0)
    expect(report.summary.removedCount).toBe(2)
    expect(report.summary.netChange).toBe(-2)
    expect(report.summary.totalBase).toBe(2)
    expect(report.summary.totalHead).toBe(0)
  })

  test('builds report with mixed changes', () => {
    const base = [
      makeViolation({ filePath: 'a.ts', ruleId: 'no-console' }),
      makeViolation({ filePath: 'b.ts', ruleId: 'max-complexity' }),
    ]
    const head = [
      makeViolation({ filePath: 'c.ts', ruleId: 'no-eval' }),
      makeViolation({ filePath: 'd.ts', ruleId: 'no-any' }),
      makeViolation({ filePath: 'e.ts', ruleId: 'prefer-const' }),
    ]
    const report = buildDiffReport('abc', 'def', base, head)
    expect(report.summary.addedCount).toBe(3)
    expect(report.summary.removedCount).toBe(2)
    expect(report.summary.netChange).toBe(1)
  })

  test('preserves base and head refs', () => {
    const report = buildDiffReport('v1.0.0', 'v2.0.0', [], [])
    expect(report.base).toBe('v1.0.0')
    expect(report.head).toBe('v2.0.0')
  })

  test('netChange is negative when more removed', () => {
    const base = Array.from({ length: 5 }, (_, i) =>
      makeViolation({ filePath: `src/${i}.ts`, ruleId: 'r' }),
    )
    const report = buildDiffReport('a', 'b', base, [])
    expect(report.summary.netChange).toBe(-5)
  })

  test('netChange is positive when more added', () => {
    const head = Array.from({ length: 3 }, (_, i) =>
      makeViolation({ filePath: `src/${i}.ts`, ruleId: 'r' }),
    )
    const report = buildDiffReport('a', 'b', [], head)
    expect(report.summary.netChange).toBe(3)
  })

  test('improvedCount is always 0', () => {
    const report = buildDiffReport('a', 'b', [], [])
    expect(report.summary.improvedCount).toBe(0)
  })

  test('identical violations produce zero net change', () => {
    const shared = [
      makeViolation({ filePath: 'src/a.ts', ruleId: 'no-console' }),
      makeViolation({ filePath: 'src/b.ts', ruleId: 'max-complexity' }),
    ]
    const report = buildDiffReport('base', 'head', shared, shared)
    expect(report.summary.netChange).toBe(0)
    expect(report.summary.addedCount).toBe(0)
    expect(report.summary.removedCount).toBe(0)
    expect(report.summary.totalBase).toBe(2)
    expect(report.summary.totalHead).toBe(2)
  })

  test('uses commit hash refs correctly', () => {
    const report = buildDiffReport('a1b2c3d', 'e4f5g6h', [], [])
    expect(report.base).toBe('a1b2c3d')
    expect(report.head).toBe('e4f5g6h')
  })

  test('totalBase matches base violations count exactly', () => {
    const base = [
      makeViolation({ filePath: 'a.ts', ruleId: 'r1' }),
      makeViolation({ filePath: 'b.ts', ruleId: 'r2' }),
      makeViolation({ filePath: 'c.ts', ruleId: 'r3' }),
    ]
    const report = buildDiffReport('a', 'b', base, [])
    expect(report.summary.totalBase).toBe(3)
    expect(report.summary.totalHead).toBe(0)
  })

  test('totalHead matches head violations count exactly', () => {
    const head = [
      makeViolation({ filePath: 'd.ts', ruleId: 'r4' }),
      makeViolation({ filePath: 'e.ts', ruleId: 'r5' }),
    ]
    const report = buildDiffReport('a', 'b', [], head)
    expect(report.summary.totalBase).toBe(0)
    expect(report.summary.totalHead).toBe(2)
  })

  test('netChange calculation with large mixed changes', () => {
    const base = Array.from({ length: 50 }, (_, i) =>
      makeViolation({ filePath: `base/${i}.ts`, ruleId: 'r' }),
    )
    const head = Array.from({ length: 30 }, (_, i) =>
      makeViolation({ filePath: `head/${i}.ts`, ruleId: 'r' }),
    )
    const report = buildDiffReport('a', 'b', base, head)
    expect(report.summary.addedCount).toBe(30)
    expect(report.summary.removedCount).toBe(50)
    expect(report.summary.netChange).toBe(-20)
  })

  test('report improved array is always empty', () => {
    const report = buildDiffReport(
      'a',
      'b',
      [makeViolation({ filePath: 'a.ts', ruleId: 'r' })],
      [makeViolation({ filePath: 'a.ts', ruleId: 'r' })],
    )
    expect(report.improved).toEqual([])
  })
})

describe('parseGitDiffOutput', () => {
  test('parses empty string', () => {
    expect(parseGitDiffOutput('')).toEqual([])
  })

  test('parses single line', () => {
    expect(parseGitDiffOutput('src/file.ts')).toEqual(['src/file.ts'])
  })

  test('parses multiple lines', () => {
    const output = 'src/a.ts\nsrc/b.ts\nsrc/c.ts'
    expect(parseGitDiffOutput(output)).toEqual(['src/a.ts', 'src/b.ts', 'src/c.ts'])
  })

  test('trims whitespace from lines', () => {
    const output = '  src/a.ts  \n  src/b.ts  '
    expect(parseGitDiffOutput(output)).toEqual(['src/a.ts', 'src/b.ts'])
  })

  test('filters empty lines', () => {
    const output = 'src/a.ts\n\nsrc/b.ts\n\n'
    expect(parseGitDiffOutput(output)).toEqual(['src/a.ts', 'src/b.ts'])
  })

  test('handles lines with only whitespace', () => {
    const output = 'src/a.ts\n   \nsrc/b.ts'
    expect(parseGitDiffOutput(output)).toEqual(['src/a.ts', 'src/b.ts'])
  })

  test('handles single file with newline', () => {
    expect(parseGitDiffOutput('src/file.ts\n')).toEqual(['src/file.ts'])
  })

  test('handles windows-style line endings', () => {
    const output = 'src/a.ts\r\nsrc/b.ts\r\n'
    const result = parseGitDiffOutput(output)
    expect(result).toHaveLength(2)
    expect(result[0]).toBe('src/a.ts')
  })

  test('handles tabs as whitespace', () => {
    const output = '\tsrc/a.ts\t\n\tsrc/b.ts\t'
    expect(parseGitDiffOutput(output)).toEqual(['src/a.ts', 'src/b.ts'])
  })

  test('handles very long file path', () => {
    const longPath = 'src/' + 'very-long-directory-name/'.repeat(20) + 'file.ts'
    expect(parseGitDiffOutput(longPath)).toEqual([longPath])
  })

  test('handles paths with unicode characters', () => {
    const output = 'src/café.ts\nsrc/日本語.ts'
    expect(parseGitDiffOutput(output)).toEqual(['src/café.ts', 'src/日本語.ts'])
  })

  test('handles trailing newlines', () => {
    const output = 'src/a.ts\nsrc/b.ts\n\n\n'
    expect(parseGitDiffOutput(output)).toEqual(['src/a.ts', 'src/b.ts'])
  })

  test('handles leading newlines', () => {
    const output = '\n\nsrc/a.ts\nsrc/b.ts'
    expect(parseGitDiffOutput(output)).toEqual(['src/a.ts', 'src/b.ts'])
  })
})

describe('formatSummary', () => {
  test('includes Violation Diff Analysis header', () => {
    const report = makeReport()
    const output = formatSummary(report)
    expect(output).toContain('Violation Diff Analysis')
  })

  test('includes comparing refs', () => {
    const report = makeReport({ base: 'main', head: 'develop' })
    const output = formatSummary(report)
    expect(output).toContain('main → develop')
  })

  test('includes base and head violation counts', () => {
    const report = makeReport({
      summary: {
        addedCount: 0,
        improvedCount: 0,
        netChange: 0,
        removedCount: 0,
        totalBase: 25,
        totalHead: 25,
      },
    })
    const output = formatSummary(report)
    expect(output).toContain('25')
  })

  test('shows improvement message for negative net change', () => {
    const report = makeReport({
      summary: {
        addedCount: 2,
        improvedCount: 0,
        netChange: -3,
        removedCount: 5,
        totalBase: 15,
        totalHead: 12,
      },
    })
    const output = formatSummary(report)
    expect(output).toContain('Code quality improved')
    expect(output).toContain('3 violations removed')
  })

  test('shows regression message for positive net change', () => {
    const report = makeReport({
      summary: {
        addedCount: 5,
        improvedCount: 0,
        netChange: 3,
        removedCount: 2,
        totalBase: 10,
        totalHead: 13,
      },
    })
    const output = formatSummary(report)
    expect(output).toContain('Code quality regressed')
    expect(output).toContain('3 new violations added')
  })

  test('shows no change message for zero net change', () => {
    const report = makeReport({
      summary: {
        addedCount: 1,
        improvedCount: 0,
        netChange: 0,
        removedCount: 1,
        totalBase: 10,
        totalHead: 10,
      },
    })
    const output = formatSummary(report)
    expect(output).toContain('No net change')
  })

  test('includes Added count', () => {
    const report = makeReport({
      summary: {
        addedCount: 5,
        improvedCount: 0,
        netChange: 5,
        removedCount: 0,
        totalBase: 10,
        totalHead: 15,
      },
    })
    const output = formatSummary(report)
    expect(output).toContain('+5')
  })

  test('includes Removed count', () => {
    const report = makeReport({
      summary: {
        addedCount: 0,
        improvedCount: 0,
        netChange: -3,
        removedCount: 3,
        totalBase: 10,
        totalHead: 7,
      },
    })
    const output = formatSummary(report)
    expect(output).toContain('-3')
  })

  test('returns a string', () => {
    const report = makeReport()
    const output = formatSummary(report)
    expect(typeof output).toBe('string')
  })

  test('contains all summary fields', () => {
    const report = makeReport({
      summary: {
        addedCount: 3,
        improvedCount: 0,
        netChange: -2,
        removedCount: 5,
        totalBase: 20,
        totalHead: 18,
      },
    })
    const output = formatSummary(report)
    expect(output).toContain('Base violations')
    expect(output).toContain('Head violations')
    expect(output).toContain('Added')
    expect(output).toContain('Removed')
    expect(output).toContain('Net change')
    expect(output).toContain('20')
    expect(output).toContain('18')
  })

  test('shows correct number for large improvement', () => {
    const report = makeReport({
      summary: {
        addedCount: 2,
        improvedCount: 0,
        netChange: -100,
        removedCount: 102,
        totalBase: 200,
        totalHead: 100,
      },
    })
    const output = formatSummary(report)
    expect(output).toContain('100 violations removed')
  })
})

describe('displayAddedViolations', () => {
  test('does nothing for empty array', () => {
    const lines: string[] = []
    displayAddedViolations([], (msg) => lines.push(msg ?? ''))
    expect(lines).toEqual([])
  })

  test('displays added violations header', () => {
    const lines: string[] = []
    const violations = [makeViolation({ filePath: 'src/a.ts', ruleId: 'no-console' })]
    displayAddedViolations(violations, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('Added Violations')
  })

  test('displays violation details', () => {
    const lines: string[] = []
    const violations = [
      makeViolation({
        filePath: 'src/test.ts',
        ruleId: 'max-complexity',
        range: { start: { line: 42, column: 0 }, end: { line: 42, column: 5 } },
      }),
    ]
    displayAddedViolations(violations, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('src/test.ts:42')
    expect(output).toContain('max-complexity')
  })

  test('shows truncation message for many violations', () => {
    const lines: string[] = []
    const violations = Array.from({ length: 25 }, (_, i) =>
      makeViolation({ filePath: `src/${i}.ts`, ruleId: 'r' }),
    )
    displayAddedViolations(violations, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('and 5 more')
  })

  test('does not show truncation for 20 or fewer violations', () => {
    const lines: string[] = []
    const violations = Array.from({ length: 20 }, (_, i) =>
      makeViolation({ filePath: `src/${i}.ts`, ruleId: 'r' }),
    )
    displayAddedViolations(violations, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).not.toContain('more')
  })

  test('shows truncation for exactly 21 violations', () => {
    const lines: string[] = []
    const violations = Array.from({ length: 21 }, (_, i) =>
      makeViolation({ filePath: `src/${i}.ts`, ruleId: 'r' }),
    )
    displayAddedViolations(violations, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('and 1 more')
  })

  test('displays ruleId in brackets', () => {
    const lines: string[] = []
    const violations = [makeViolation({ filePath: 'src/a.ts', ruleId: 'no-console' })]
    displayAddedViolations(violations, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('[no-console]')
  })

  test('displays line number in output', () => {
    const lines: string[] = []
    const violations = [
      makeViolation({
        filePath: 'src/a.ts',
        ruleId: 'r',
        range: { start: { line: 99, column: 0 }, end: { line: 99, column: 5 } },
      }),
    ]
    displayAddedViolations(violations, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain(':99')
  })

  test('displays multiple violations', () => {
    const lines: string[] = []
    const violations = [
      makeViolation({ filePath: 'src/a.ts', ruleId: 'no-console' }),
      makeViolation({ filePath: 'src/b.ts', ruleId: 'no-eval' }),
    ]
    displayAddedViolations(violations, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('src/a.ts')
    expect(output).toContain('src/b.ts')
  })
})

describe('displayRemovedViolations', () => {
  test('does nothing for empty array', () => {
    const lines: string[] = []
    displayRemovedViolations([], (msg) => lines.push(msg ?? ''))
    expect(lines).toEqual([])
  })

  test('displays removed violations header', () => {
    const lines: string[] = []
    const violations = [makeViolation({ filePath: 'src/a.ts', ruleId: 'no-console' })]
    displayRemovedViolations(violations, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('Removed Violations')
  })

  test('displays violation details', () => {
    const lines: string[] = []
    const violations = [
      makeViolation({
        filePath: 'src/old.ts',
        ruleId: 'no-debugger',
        range: { start: { line: 15, column: 0 }, end: { line: 15, column: 5 } },
      }),
    ]
    displayRemovedViolations(violations, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('src/old.ts:15')
    expect(output).toContain('no-debugger')
  })

  test('shows truncation message for many violations', () => {
    const lines: string[] = []
    const violations = Array.from({ length: 30 }, (_, i) =>
      makeViolation({ filePath: `src/${i}.ts`, ruleId: 'r' }),
    )
    displayRemovedViolations(violations, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('and 10 more')
  })

  test('does not show truncation for 20 or fewer violations', () => {
    const lines: string[] = []
    const violations = Array.from({ length: 20 }, (_, i) =>
      makeViolation({ filePath: `src/${i}.ts`, ruleId: 'r' }),
    )
    displayRemovedViolations(violations, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).not.toContain('more')
  })

  test('shows truncation for exactly 21 violations', () => {
    const lines: string[] = []
    const violations = Array.from({ length: 21 }, (_, i) =>
      makeViolation({ filePath: `src/${i}.ts`, ruleId: 'r' }),
    )
    displayRemovedViolations(violations, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('and 1 more')
  })

  test('displays ruleId in brackets for removed', () => {
    const lines: string[] = []
    const violations = [makeViolation({ filePath: 'src/a.ts', ruleId: 'no-debugger' })]
    displayRemovedViolations(violations, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('[no-debugger]')
  })

  test('displays multiple removed violations with distinct paths', () => {
    const lines: string[] = []
    const violations = [
      makeViolation({ filePath: 'src/x.ts', ruleId: 'r1' }),
      makeViolation({ filePath: 'src/y.ts', ruleId: 'r2' }),
      makeViolation({ filePath: 'src/z.ts', ruleId: 'r3' }),
    ]
    displayRemovedViolations(violations, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('src/x.ts')
    expect(output).toContain('src/y.ts')
    expect(output).toContain('src/z.ts')
  })
})

describe('displayDiffReport', () => {
  test('displays header', () => {
    const lines: string[] = []
    const report = makeReport()
    displayDiffReport(report, false, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('Violation Diff Analysis')
  })

  test('displays comparing refs', () => {
    const lines: string[] = []
    const report = makeReport({ base: 'develop', head: 'main' })
    displayDiffReport(report, false, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('develop → main')
  })

  test('displays summary section', () => {
    const lines: string[] = []
    const report = makeReport()
    displayDiffReport(report, false, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('Summary')
    expect(output).toContain('Base violations')
    expect(output).toContain('Head violations')
  })

  test('displays added count in summary', () => {
    const lines: string[] = []
    const report = makeReport({
      summary: {
        addedCount: 7,
        improvedCount: 0,
        netChange: 7,
        removedCount: 0,
        totalBase: 10,
        totalHead: 17,
      },
    })
    displayDiffReport(report, false, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('+7')
  })

  test('displays removed count in summary', () => {
    const lines: string[] = []
    const report = makeReport({
      summary: {
        addedCount: 0,
        improvedCount: 0,
        netChange: -4,
        removedCount: 4,
        totalBase: 10,
        totalHead: 6,
      },
    })
    displayDiffReport(report, false, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('-4')
  })

  test('shows improvement message for negative net change', () => {
    const lines: string[] = []
    const report = makeReport({
      summary: {
        addedCount: 1,
        improvedCount: 0,
        netChange: -5,
        removedCount: 6,
        totalBase: 15,
        totalHead: 10,
      },
    })
    displayDiffReport(report, false, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('Code quality improved')
  })

  test('shows regression message for positive net change', () => {
    const lines: string[] = []
    const report = makeReport({
      summary: {
        addedCount: 3,
        improvedCount: 0,
        netChange: 3,
        removedCount: 0,
        totalBase: 10,
        totalHead: 13,
      },
    })
    displayDiffReport(report, false, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('Code quality regressed')
  })

  test('shows no change message for zero net change', () => {
    const lines: string[] = []
    const report = makeReport()
    displayDiffReport(report, false, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('No net change')
  })

  test('hides added violations when not verbose', () => {
    const lines: string[] = []
    const report = makeReport({
      added: [makeViolation({ filePath: 'src/a.ts', ruleId: 'no-console' })],
      summary: {
        addedCount: 1,
        improvedCount: 0,
        netChange: 1,
        removedCount: 0,
        totalBase: 0,
        totalHead: 1,
      },
    })
    displayDiffReport(report, false, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).not.toContain('Added Violations')
  })

  test('shows added violations when verbose', () => {
    const lines: string[] = []
    const report = makeReport({
      added: [makeViolation({ filePath: 'src/a.ts', ruleId: 'no-console' })],
      summary: {
        addedCount: 1,
        improvedCount: 0,
        netChange: 1,
        removedCount: 0,
        totalBase: 0,
        totalHead: 1,
      },
    })
    displayDiffReport(report, true, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('Added Violations')
    expect(output).toContain('src/a.ts')
  })

  test('hides removed violations when not verbose', () => {
    const lines: string[] = []
    const report = makeReport({
      removed: [makeViolation({ filePath: 'src/a.ts', ruleId: 'no-console' })],
      summary: {
        addedCount: 0,
        improvedCount: 0,
        netChange: -1,
        removedCount: 1,
        totalBase: 1,
        totalHead: 0,
      },
    })
    displayDiffReport(report, false, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).not.toContain('Removed Violations')
  })

  test('shows removed violations when verbose', () => {
    const lines: string[] = []
    const report = makeReport({
      removed: [makeViolation({ filePath: 'src/a.ts', ruleId: 'no-console' })],
      summary: {
        addedCount: 0,
        improvedCount: 0,
        netChange: -1,
        removedCount: 1,
        totalBase: 1,
        totalHead: 0,
      },
    })
    displayDiffReport(report, true, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('Removed Violations')
    expect(output).toContain('src/a.ts')
  })

  test('shows both added and removed violations in verbose mode', () => {
    const lines: string[] = []
    const report = makeReport({
      added: [makeViolation({ filePath: 'src/new.ts', ruleId: 'no-console' })],
      removed: [makeViolation({ filePath: 'src/old.ts', ruleId: 'no-debugger' })],
      summary: {
        addedCount: 1,
        improvedCount: 0,
        netChange: 0,
        removedCount: 1,
        totalBase: 10,
        totalHead: 10,
      },
    })
    displayDiffReport(report, true, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('Added Violations')
    expect(output).toContain('Removed Violations')
  })

  test('does not show added section when no added violations but verbose', () => {
    const lines: string[] = []
    const report = makeReport({
      removed: [makeViolation({ filePath: 'src/a.ts', ruleId: 'r' })],
      summary: {
        addedCount: 0,
        improvedCount: 0,
        netChange: -1,
        removedCount: 1,
        totalBase: 1,
        totalHead: 0,
      },
    })
    displayDiffReport(report, true, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).not.toContain('Added Violations')
    expect(output).toContain('Removed Violations')
  })

  test('does not show removed section when no removed violations but verbose', () => {
    const lines: string[] = []
    const report = makeReport({
      added: [makeViolation({ filePath: 'src/a.ts', ruleId: 'r' })],
      summary: {
        addedCount: 1,
        improvedCount: 0,
        netChange: 1,
        removedCount: 0,
        totalBase: 0,
        totalHead: 1,
      },
    })
    displayDiffReport(report, true, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('Added Violations')
    expect(output).not.toContain('Removed Violations')
  })

  test('truncates verbose added violations at limit', () => {
    const lines: string[] = []
    const manyAdded = Array.from({ length: 25 }, (_, i) =>
      makeViolation({ filePath: `src/${i}.ts`, ruleId: 'r' }),
    )
    const report = makeReport({
      added: manyAdded,
      summary: {
        addedCount: 25,
        improvedCount: 0,
        netChange: 25,
        removedCount: 0,
        totalBase: 0,
        totalHead: 25,
      },
    })
    displayDiffReport(report, true, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('and 5 more')
  })

  test('truncates verbose removed violations at limit', () => {
    const lines: string[] = []
    const manyRemoved = Array.from({ length: 25 }, (_, i) =>
      makeViolation({ filePath: `src/${i}.ts`, ruleId: 'r' }),
    )
    const report = makeReport({
      removed: manyRemoved,
      summary: {
        addedCount: 0,
        improvedCount: 0,
        netChange: -25,
        removedCount: 25,
        totalBase: 25,
        totalHead: 0,
      },
    })
    displayDiffReport(report, true, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('and 5 more')
  })

  test('calls logFn multiple times', () => {
    const lines: string[] = []
    const report = makeReport()
    displayDiffReport(report, false, (msg) => lines.push(msg ?? ''))
    expect(lines.length).toBeGreaterThan(5)
  })

  test('uses logFn for all output', () => {
    const lines: string[] = []
    const report = makeReport({
      summary: {
        addedCount: 1,
        improvedCount: 0,
        netChange: 1,
        removedCount: 0,
        totalBase: 5,
        totalHead: 6,
      },
    })
    displayDiffReport(report, false, (msg) => lines.push(msg ?? ''))
    const joined = lines.join('|')
    expect(joined).toContain('Violation Diff Analysis')
    expect(joined).toContain('Summary')
    expect(joined).toContain('Code quality regressed')
  })

  test('verbose mode with no violations still shows summary', () => {
    const lines: string[] = []
    const report = makeReport()
    displayDiffReport(report, true, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('Summary')
    expect(output).not.toContain('Added Violations')
    expect(output).not.toContain('Removed Violations')
  })

  test('non-verbose hides violations even when both exist', () => {
    const lines: string[] = []
    const report = makeReport({
      added: [makeViolation({ filePath: 'src/new.ts', ruleId: 'r1' })],
      removed: [makeViolation({ filePath: 'src/old.ts', ruleId: 'r2' })],
      summary: {
        addedCount: 1,
        improvedCount: 0,
        netChange: 0,
        removedCount: 1,
        totalBase: 5,
        totalHead: 5,
      },
    })
    displayDiffReport(report, false, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).not.toContain('Added Violations')
    expect(output).not.toContain('Removed Violations')
    expect(output).toContain('Summary')
  })

  test('displays correct net change value in summary', () => {
    const lines: string[] = []
    const report = makeReport({
      summary: {
        addedCount: 10,
        improvedCount: 0,
        netChange: 10,
        removedCount: 0,
        totalBase: 0,
        totalHead: 10,
      },
    })
    displayDiffReport(report, false, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('+10')
  })

  test('verbose with exactly 20 added shows no truncation', () => {
    const lines: string[] = []
    const added = Array.from({ length: 20 }, (_, i) =>
      makeViolation({ filePath: `src/${i}.ts`, ruleId: 'r' }),
    )
    const report = makeReport({
      added,
      summary: {
        addedCount: 20,
        improvedCount: 0,
        netChange: 20,
        removedCount: 0,
        totalBase: 0,
        totalHead: 20,
      },
    })
    displayDiffReport(report, true, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).not.toContain('and')
    expect(output).not.toContain('more')
  })

  test('verbose with exactly 20 removed shows no truncation', () => {
    const lines: string[] = []
    const removed = Array.from({ length: 20 }, (_, i) =>
      makeViolation({ filePath: `src/${i}.ts`, ruleId: 'r' }),
    )
    const report = makeReport({
      removed,
      summary: {
        addedCount: 0,
        improvedCount: 0,
        netChange: -20,
        removedCount: 20,
        totalBase: 20,
        totalHead: 0,
      },
    })
    displayDiffReport(report, true, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).not.toContain('and')
    expect(output).not.toContain('more')
  })
})

// ===================== NEW TESTS =====================

describe('createViolationKey - additional', () => {
  test('handles ruleId with dashes and numbers', () => {
    const v = makeViolation({
      filePath: 'src/a.ts',
      ruleId: 'max-params-2',
    })
    expect(createViolationKey(v)).toBe('src/a.ts:1:max-params-2')
  })

  test('handles line number as very large value', () => {
    const v = makeViolation({
      filePath: 'src/big.ts',
      ruleId: 'no-console',
      range: { start: { line: 99999, column: 0 }, end: { line: 99999, column: 5 } },
    })
    expect(createViolationKey(v)).toBe('src/big.ts:99999:no-console')
  })

  test('handles empty string filePath', () => {
    const v = makeViolation({ filePath: '', ruleId: 'no-console' })
    expect(createViolationKey(v)).toBe(':1:no-console')
  })

  test('handles filePath with spaces', () => {
    const v = makeViolation({
      filePath: 'src/my file.ts',
      ruleId: 'no-console',
    })
    expect(createViolationKey(v)).toBe('src/my file.ts:1:no-console')
  })

  test('handles ruleId with slash', () => {
    const v = makeViolation({
      filePath: 'src/a.ts',
      ruleId: 'security/no-eval',
    })
    expect(createViolationKey(v)).toBe('src/a.ts:1:security/no-eval')
  })

  test('end line does not affect key', () => {
    const v1 = makeViolation({
      filePath: 'src/a.ts',
      ruleId: 'r',
      range: { start: { line: 5, column: 0 }, end: { line: 5, column: 5 } },
    })
    const v2 = makeViolation({
      filePath: 'src/a.ts',
      ruleId: 'r',
      range: { start: { line: 5, column: 0 }, end: { line: 10, column: 5 } },
    })
    expect(createViolationKey(v1)).toBe(createViolationKey(v2))
  })
})

describe('compareViolations - additional', () => {
  test('handles duplicate violations in base array', () => {
    const v = makeViolation({ filePath: 'src/a.ts', ruleId: 'no-console' })
    const base = [v, v]
    const head = [v]
    const result = compareViolations(base, head)
    expect(result.added).toHaveLength(0)
    expect(result.removed).toHaveLength(0)
  })

  test('handles duplicate violations in head array', () => {
    const v = makeViolation({ filePath: 'src/a.ts', ruleId: 'no-console' })
    const base = [v]
    const head = [v, v]
    const result = compareViolations(base, head)
    expect(result.added).toHaveLength(0)
    expect(result.removed).toHaveLength(0)
  })

  test('result is independent of violation order in base', () => {
    const v1 = makeViolation({ filePath: 'src/a.ts', ruleId: 'r1' })
    const v2 = makeViolation({ filePath: 'src/b.ts', ruleId: 'r2' })
    const r1 = compareViolations([v1, v2], [v1, v2])
    const r2 = compareViolations([v2, v1], [v1, v2])
    expect(r1.added).toHaveLength(r2.added.length)
    expect(r1.removed).toHaveLength(r2.removed.length)
  })

  test('partial overlap with some common and some unique', () => {
    const shared = makeViolation({ filePath: 'src/shared.ts', ruleId: 'r' })
    const onlyBase = makeViolation({ filePath: 'src/only-base.ts', ruleId: 'r' })
    const onlyHead = makeViolation({ filePath: 'src/only-head.ts', ruleId: 'r' })
    const result = compareViolations([shared, onlyBase], [shared, onlyHead])
    expect(result.added).toHaveLength(1)
    expect(result.removed).toHaveLength(1)
    expect(result.added[0].filePath).toBe('src/only-head.ts')
    expect(result.removed[0].filePath).toBe('src/only-base.ts')
  })

  test('empty base with many head violations', () => {
    const head = Array.from({ length: 50 }, (_, i) =>
      makeViolation({ filePath: `src/${i}.ts`, ruleId: 'r' }),
    )
    const result = compareViolations([], head)
    expect(result.added).toHaveLength(50)
    expect(result.removed).toHaveLength(0)
  })

  test('many base violations with empty head', () => {
    const base = Array.from({ length: 50 }, (_, i) =>
      makeViolation({ filePath: `src/${i}.ts`, ruleId: 'r' }),
    )
    const result = compareViolations(base, [])
    expect(result.added).toHaveLength(0)
    expect(result.removed).toHaveLength(50)
  })

  test('added contains exact violation object from head', () => {
    const v = makeViolation({ filePath: 'src/a.ts', ruleId: 'r' })
    const result = compareViolations([], [v])
    expect(result.added[0]).toBe(v)
  })

  test('removed contains exact violation object from base', () => {
    const v = makeViolation({ filePath: 'src/a.ts', ruleId: 'r' })
    const result = compareViolations([v], [])
    expect(result.removed[0]).toBe(v)
  })
})

describe('countByRule - additional', () => {
  test('handles two distinct rules', () => {
    const violations = [
      makeViolation({ filePath: 'a.ts', ruleId: 'r1' }),
      makeViolation({ filePath: 'b.ts', ruleId: 'r2' }),
    ]
    const result = countByRule(violations)
    expect(result).toEqual({ r1: 1, r2: 1 })
    expect(Object.keys(result)).toHaveLength(2)
  })

  test('handles mixed counts across multiple rules', () => {
    const violations = [
      makeViolation({ filePath: 'a.ts', ruleId: 'no-console' }),
      makeViolation({ filePath: 'b.ts', ruleId: 'no-console' }),
      makeViolation({ filePath: 'c.ts', ruleId: 'no-console' }),
      makeViolation({ filePath: 'd.ts', ruleId: 'max-complexity' }),
      makeViolation({ filePath: 'e.ts', ruleId: 'no-eval' }),
      makeViolation({ filePath: 'f.ts', ruleId: 'no-eval' }),
    ]
    const result = countByRule(violations)
    expect(result).toEqual({ 'no-console': 3, 'max-complexity': 1, 'no-eval': 2 })
  })

  test('returns new object each call', () => {
    const violations = [makeViolation({ filePath: 'a.ts', ruleId: 'r' })]
    const r1 = countByRule(violations)
    const r2 = countByRule(violations)
    expect(r1).not.toBe(r2)
    expect(r1).toEqual(r2)
  })

  test('does not mutate input array', () => {
    const violations = [makeViolation({ filePath: 'a.ts', ruleId: 'r' })]
    const copy = [...violations]
    countByRule(violations)
    expect(violations).toEqual(copy)
  })
})

describe('countBySeverity - additional', () => {
  test('returns new object each call', () => {
    const violations = [makeViolation({ filePath: 'a.ts', ruleId: 'r', severity: 'error' })]
    const r1 = countBySeverity(violations)
    const r2 = countBySeverity(violations)
    expect(r1).not.toBe(r2)
    expect(r1).toEqual(r2)
  })

  test('does not mutate input array', () => {
    const violations = [makeViolation({ filePath: 'a.ts', ruleId: 'r', severity: 'warning' })]
    const copy = [...violations]
    countBySeverity(violations)
    expect(violations).toEqual(copy)
  })

  test('handles three severity types', () => {
    const violations = [
      makeViolation({ filePath: 'a.ts', ruleId: 'r1', severity: 'error' }),
      makeViolation({ filePath: 'b.ts', ruleId: 'r2', severity: 'warning' }),
      makeViolation({ filePath: 'c.ts', ruleId: 'r3', severity: 'info' }),
    ]
    const result = countBySeverity(violations)
    expect(result).toEqual({ error: 1, warning: 1, info: 1 })
    expect(Object.keys(result)).toHaveLength(3)
  })

  test('counts severity correctly across many violations', () => {
    const violations = Array.from({ length: 20 }, (_, i) =>
      makeViolation({
        filePath: `src/${i}.ts`,
        ruleId: 'r',
        severity: i < 5 ? 'error' : i < 12 ? 'warning' : 'info',
      }),
    )
    const result = countBySeverity(violations)
    expect(result).toEqual({ error: 5, warning: 7, info: 8 })
  })

  test('empty string severity is counted as its own key', () => {
    const violations = [
      makeViolation({
        filePath: 'a.ts',
        ruleId: 'r',
        severity: '' as RuleViolation['severity'],
      }),
    ]
    expect(countBySeverity(violations)).toEqual({ '': 1 })
  })
})

describe('buildDiffReport - additional', () => {
  test('netChange zero with equal added and removed', () => {
    const base = [
      makeViolation({ filePath: 'src/a.ts', ruleId: 'no-console' }),
      makeViolation({ filePath: 'src/b.ts', ruleId: 'max-complexity' }),
    ]
    const head = [
      makeViolation({ filePath: 'src/c.ts', ruleId: 'no-eval' }),
      makeViolation({ filePath: 'src/d.ts', ruleId: 'prefer-const' }),
    ]
    const report = buildDiffReport('a', 'b', base, head)
    expect(report.summary.addedCount).toBe(2)
    expect(report.summary.removedCount).toBe(2)
    expect(report.summary.netChange).toBe(0)
  })

  test('totalBase counts all base violations including those also in head', () => {
    const shared = makeViolation({ filePath: 'src/a.ts', ruleId: 'no-console' })
    const onlyBase = makeViolation({ filePath: 'src/b.ts', ruleId: 'max-complexity' })
    const report = buildDiffReport('a', 'b', [shared, onlyBase], [shared])
    expect(report.summary.totalBase).toBe(2)
    expect(report.summary.totalHead).toBe(1)
  })

  test('uses refs exactly as provided', () => {
    const report = buildDiffReport('feature/branch-1', 'feature/branch-2', [], [])
    expect(report.base).toBe('feature/branch-1')
    expect(report.head).toBe('feature/branch-2')
  })

  test('report structure has all required keys', () => {
    const report = buildDiffReport('a', 'b', [], [])
    expect(report).toHaveProperty('added')
    expect(report).toHaveProperty('base')
    expect(report).toHaveProperty('head')
    expect(report).toHaveProperty('improved')
    expect(report).toHaveProperty('removed')
    expect(report).toHaveProperty('summary')
    expect(report.summary).toHaveProperty('addedCount')
    expect(report.summary).toHaveProperty('improvedCount')
    expect(report.summary).toHaveProperty('netChange')
    expect(report.summary).toHaveProperty('removedCount')
    expect(report.summary).toHaveProperty('totalBase')
    expect(report.summary).toHaveProperty('totalHead')
  })

  test('single violation added from large base', () => {
    const base = Array.from({ length: 100 }, (_, i) =>
      makeViolation({ filePath: `src/${i}.ts`, ruleId: 'r' }),
    )
    const head = [...base, makeViolation({ filePath: 'src/new.ts', ruleId: 'new-rule' })]
    const report = buildDiffReport('a', 'b', base, head)
    expect(report.summary.addedCount).toBe(1)
    expect(report.summary.removedCount).toBe(0)
    expect(report.summary.netChange).toBe(1)
    expect(report.summary.totalBase).toBe(100)
    expect(report.summary.totalHead).toBe(101)
  })
})

describe('parseGitDiffOutput - additional', () => {
  test('handles single newline', () => {
    expect(parseGitDiffOutput('\n')).toEqual([])
  })

  test('handles multiple newlines only', () => {
    expect(parseGitDiffOutput('\n\n\n\n')).toEqual([])
  })

  test('handles mix of empty and content lines', () => {
    const output = '\nsrc/a.ts\n\nsrc/b.ts\n\n\nsrc/c.ts\n'
    expect(parseGitDiffOutput(output)).toEqual(['src/a.ts', 'src/b.ts', 'src/c.ts'])
  })

  test('preserves content with internal spaces', () => {
    const output = 'path/with spaces/file.ts'
    expect(parseGitDiffOutput(output)).toEqual(['path/with spaces/file.ts'])
  })

  test('handles file path starting with dot', () => {
    const output = '.hidden/file.ts\n./relative.ts'
    expect(parseGitDiffOutput(output)).toEqual(['.hidden/file.ts', './relative.ts'])
  })

  test('handles output with only whitespace characters', () => {
    expect(parseGitDiffOutput('   \t  \n\t\n   ')).toEqual([])
  })

  test('handles path with hash characters', () => {
    const output = 'src/#comment.ts\nsrc/file#2.ts'
    expect(parseGitDiffOutput(output)).toEqual(['src/#comment.ts', 'src/file#2.ts'])
  })

  test('handles consecutive newlines between paths', () => {
    const output = 'src/a.ts\n\n\n\n\nsrc/b.ts'
    expect(parseGitDiffOutput(output)).toEqual(['src/a.ts', 'src/b.ts'])
  })

  test('handles single character file names', () => {
    const output = 'a\nb\nc'
    expect(parseGitDiffOutput(output)).toEqual(['a', 'b', 'c'])
  })
})

describe('formatSummary - additional', () => {
  test('net change displayed as positive with plus sign', () => {
    const report = makeReport({
      summary: {
        addedCount: 5,
        improvedCount: 0,
        netChange: 5,
        removedCount: 0,
        totalBase: 10,
        totalHead: 15,
      },
    })
    const output = formatSummary(report)
    expect(output).toContain('+5')
  })

  test('net change displayed as negative number', () => {
    const report = makeReport({
      summary: {
        addedCount: 0,
        improvedCount: 0,
        netChange: -7,
        removedCount: 7,
        totalBase: 15,
        totalHead: 8,
      },
    })
    const output = formatSummary(report)
    expect(output).toContain('-7')
  })

  test('net change zero shows plus zero', () => {
    const report = makeReport({
      summary: {
        addedCount: 0,
        improvedCount: 0,
        netChange: 0,
        removedCount: 0,
        totalBase: 10,
        totalHead: 10,
      },
    })
    const output = formatSummary(report)
    expect(output).toContain('+0')
  })

  test('contains newlines separating sections', () => {
    const report = makeReport()
    const output = formatSummary(report)
    expect(output).toContain('\n')
  })

  test('improvement message contains exact count', () => {
    const report = makeReport({
      summary: {
        addedCount: 1,
        improvedCount: 0,
        netChange: -42,
        removedCount: 43,
        totalBase: 100,
        totalHead: 58,
      },
    })
    const output = formatSummary(report)
    expect(output).toContain('42 violations removed')
  })

  test('regression message contains exact count', () => {
    const report = makeReport({
      summary: {
        addedCount: 15,
        improvedCount: 0,
        netChange: 15,
        removedCount: 0,
        totalBase: 5,
        totalHead: 20,
      },
    })
    const output = formatSummary(report)
    expect(output).toContain('15 new violations added')
  })
})

describe('displayAddedViolations - additional', () => {
  test('calls logFn for header, each violation, and trailing blank', () => {
    const lines: string[] = []
    const violations = [
      makeViolation({ filePath: 'src/a.ts', ruleId: 'r1' }),
      makeViolation({ filePath: 'src/b.ts', ruleId: 'r2' }),
    ]
    displayAddedViolations(violations, (msg) => lines.push(msg ?? ''))
    // header + 2 violations + trailing blank = 4
    expect(lines).toHaveLength(4)
  })

  test('truncation message shows correct remainder', () => {
    const lines: string[] = []
    const violations = Array.from({ length: 30 }, (_, i) =>
      makeViolation({ filePath: `src/${i}.ts`, ruleId: 'r' }),
    )
    displayAddedViolations(violations, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('and 10 more')
  })

  test('single violation displays correctly', () => {
    const lines: string[] = []
    const violations = [
      makeViolation({
        filePath: 'src/only.ts',
        ruleId: 'only-rule',
        range: { start: { line: 7, column: 0 }, end: { line: 7, column: 5 } },
      }),
    ]
    displayAddedViolations(violations, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('src/only.ts:7')
    expect(output).toContain('[only-rule]')
  })

  test('displays correct count of violations at boundary 21', () => {
    const lines: string[] = []
    const violations = Array.from({ length: 21 }, (_, i) =>
      makeViolation({ filePath: `src/${i}.ts`, ruleId: `rule-${i}` }),
    )
    displayAddedViolations(violations, (msg) => lines.push(msg ?? ''))
    // header + 20 violations (sliced) + truncation + blank = 23
    expect(lines).toHaveLength(23)
  })
})

describe('displayRemovedViolations - additional', () => {
  test('calls logFn for header, each violation, and trailing blank', () => {
    const lines: string[] = []
    const violations = [
      makeViolation({ filePath: 'src/a.ts', ruleId: 'r1' }),
      makeViolation({ filePath: 'src/b.ts', ruleId: 'r2' }),
    ]
    displayRemovedViolations(violations, (msg) => lines.push(msg ?? ''))
    // header + 2 violations + trailing blank = 4
    expect(lines).toHaveLength(4)
  })

  test('truncation message shows correct remainder for 30 violations', () => {
    const lines: string[] = []
    const violations = Array.from({ length: 30 }, (_, i) =>
      makeViolation({ filePath: `src/${i}.ts`, ruleId: 'r' }),
    )
    displayRemovedViolations(violations, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('and 10 more')
  })

  test('single removed violation displays correctly', () => {
    const lines: string[] = []
    const violations = [
      makeViolation({
        filePath: 'src/gone.ts',
        ruleId: 'gone-rule',
        range: { start: { line: 22, column: 0 }, end: { line: 22, column: 5 } },
      }),
    ]
    displayRemovedViolations(violations, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('src/gone.ts:22')
    expect(output).toContain('[gone-rule]')
  })

  test('displays correct count of violations at boundary 21', () => {
    const lines: string[] = []
    const violations = Array.from({ length: 21 }, (_, i) =>
      makeViolation({ filePath: `src/${i}.ts`, ruleId: `rule-${i}` }),
    )
    displayRemovedViolations(violations, (msg) => lines.push(msg ?? ''))
    // header + 20 violations (sliced) + truncation + blank = 23
    expect(lines).toHaveLength(23)
  })

  test('truncation message for exactly 22 violations', () => {
    const lines: string[] = []
    const violations = Array.from({ length: 22 }, (_, i) =>
      makeViolation({ filePath: `src/${i}.ts`, ruleId: 'r' }),
    )
    displayRemovedViolations(violations, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('and 2 more')
  })
})

describe('displayDiffReport - additional', () => {
  test('net change negative displays negative number in summary', () => {
    const lines: string[] = []
    const report = makeReport({
      summary: {
        addedCount: 1,
        improvedCount: 0,
        netChange: -3,
        removedCount: 4,
        totalBase: 10,
        totalHead: 7,
      },
    })
    displayDiffReport(report, false, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('-3')
  })

  test('verbose mode truncates both added and removed at limit', () => {
    const lines: string[] = []
    const many = Array.from({ length: 30 }, (_, i) =>
      makeViolation({ filePath: `src/${i}.ts`, ruleId: 'r' }),
    )
    const report = makeReport({
      added: many,
      removed: many,
      summary: {
        addedCount: 30,
        improvedCount: 0,
        netChange: 0,
        removedCount: 30,
        totalBase: 30,
        totalHead: 30,
      },
    })
    displayDiffReport(report, true, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    // Both added and removed sections should show truncation
    const moreCount = (output.match(/and \d+ more/g) ?? []).length
    expect(moreCount).toBe(2)
  })

  test('improvement message shows correct count', () => {
    const lines: string[] = []
    const report = makeReport({
      summary: {
        addedCount: 2,
        improvedCount: 0,
        netChange: -8,
        removedCount: 10,
        totalBase: 20,
        totalHead: 12,
      },
    })
    displayDiffReport(report, false, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('8 violations removed')
  })

  test('regression message shows correct count', () => {
    const lines: string[] = []
    const report = makeReport({
      summary: {
        addedCount: 11,
        improvedCount: 0,
        netChange: 11,
        removedCount: 0,
        totalBase: 0,
        totalHead: 11,
      },
    })
    displayDiffReport(report, false, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('11 new violations added')
  })

  test('verbose with added but empty removed shows only added section', () => {
    const lines: string[] = []
    const report = makeReport({
      added: [
        makeViolation({ filePath: 'src/a.ts', ruleId: 'r1' }),
        makeViolation({ filePath: 'src/b.ts', ruleId: 'r2' }),
      ],
      summary: {
        addedCount: 2,
        improvedCount: 0,
        netChange: 2,
        removedCount: 0,
        totalBase: 0,
        totalHead: 2,
      },
    })
    displayDiffReport(report, true, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('Added Violations')
    expect(output).not.toContain('Removed Violations')
  })

  test('verbose with removed but empty added shows only removed section', () => {
    const lines: string[] = []
    const report = makeReport({
      removed: [makeViolation({ filePath: 'src/a.ts', ruleId: 'r1' })],
      summary: {
        addedCount: 0,
        improvedCount: 0,
        netChange: -1,
        removedCount: 1,
        totalBase: 1,
        totalHead: 0,
      },
    })
    displayDiffReport(report, true, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).not.toContain('Added Violations')
    expect(output).toContain('Removed Violations')
  })

  test('displays correct total base and head values', () => {
    const lines: string[] = []
    const report = makeReport({
      summary: {
        addedCount: 3,
        improvedCount: 0,
        netChange: 1,
        removedCount: 2,
        totalBase: 45,
        totalHead: 46,
      },
    })
    displayDiffReport(report, false, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('45')
    expect(output).toContain('46')
  })

  test('always outputs trailing blank line', () => {
    const lines: string[] = []
    const report = makeReport()
    displayDiffReport(report, false, (msg) => lines.push(msg ?? ''))
    expect(lines[lines.length - 1]).toBe('')
  })

  test('verbose added displays violation file path and rule', () => {
    const lines: string[] = []
    const report = makeReport({
      added: [
        makeViolation({
          filePath: 'src/added.ts',
          ruleId: 'added-rule',
          range: { start: { line: 33, column: 0 }, end: { line: 33, column: 5 } },
        }),
      ],
      summary: {
        addedCount: 1,
        improvedCount: 0,
        netChange: 1,
        removedCount: 0,
        totalBase: 0,
        totalHead: 1,
      },
    })
    displayDiffReport(report, true, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('src/added.ts:33')
    expect(output).toContain('[added-rule]')
  })

  test('verbose removed displays violation file path and rule', () => {
    const lines: string[] = []
    const report = makeReport({
      removed: [
        makeViolation({
          filePath: 'src/removed.ts',
          ruleId: 'removed-rule',
          range: { start: { line: 44, column: 0 }, end: { line: 44, column: 5 } },
        }),
      ],
      summary: {
        addedCount: 0,
        improvedCount: 0,
        netChange: -1,
        removedCount: 1,
        totalBase: 1,
        totalHead: 0,
      },
    })
    displayDiffReport(report, true, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('src/removed.ts:44')
    expect(output).toContain('[removed-rule]')
  })

  test('net change plus zero displayed when netChange is zero', () => {
    const lines: string[] = []
    const report = makeReport({
      summary: {
        addedCount: 0,
        improvedCount: 0,
        netChange: 0,
        removedCount: 0,
        totalBase: 5,
        totalHead: 5,
      },
    })
    displayDiffReport(report, false, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('+0')
  })

  test('logFn receives empty string for blank line calls', () => {
    const lines: (string | undefined)[] = []
    const report = makeReport()
    displayDiffReport(report, false, (msg) => {
      lines.push(msg)
    })
    const blankCount = lines.filter((l) => l === undefined || l === '').length
    expect(blankCount).toBeGreaterThan(0)
  })

  test('verbose with 21 added shows truncation in added section', () => {
    const lines: string[] = []
    const added = Array.from({ length: 21 }, (_, i) =>
      makeViolation({ filePath: `src/added-${i}.ts`, ruleId: 'r' }),
    )
    const report = makeReport({
      added,
      summary: {
        addedCount: 21,
        improvedCount: 0,
        netChange: 21,
        removedCount: 0,
        totalBase: 0,
        totalHead: 21,
      },
    })
    displayDiffReport(report, true, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('and 1 more')
  })

  test('verbose with 21 removed shows truncation in removed section', () => {
    const lines: string[] = []
    const removed = Array.from({ length: 21 }, (_, i) =>
      makeViolation({ filePath: `src/removed-${i}.ts`, ruleId: 'r' }),
    )
    const report = makeReport({
      removed,
      summary: {
        addedCount: 0,
        improvedCount: 0,
        netChange: -21,
        removedCount: 21,
        totalBase: 21,
        totalHead: 0,
      },
    })
    displayDiffReport(report, true, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('and 1 more')
  })
})

// ===================== EVEN MORE TESTS =====================

describe('createViolationKey - edge cases', () => {
  test('handles unicode characters in filePath', () => {
    const v = makeViolation({ filePath: 'src/Ñoño.ts', ruleId: 'r' })
    expect(createViolationKey(v)).toBe('src/Ñoño.ts:1:r')
  })

  test('handles one-character file path', () => {
    const v = makeViolation({ filePath: 'a', ruleId: 'r' })
    expect(createViolationKey(v)).toBe('a:1:r')
  })
})

describe('compareViolations - edge cases', () => {
  test('same key with different message is treated as same violation', () => {
    const v1 = makeViolation({ filePath: 'src/a.ts', ruleId: 'r', message: 'message A' })
    const v2 = makeViolation({ filePath: 'src/a.ts', ruleId: 'r', message: 'message B' })
    const result = compareViolations([v1], [v2])
    expect(result.added).toHaveLength(0)
    expect(result.removed).toHaveLength(0)
  })

  test('severity change does not populate improved', () => {
    const v1 = makeViolation({ filePath: 'src/a.ts', ruleId: 'r', severity: 'error' })
    const v2 = makeViolation({ filePath: 'src/a.ts', ruleId: 'r', severity: 'warning' })
    const result = compareViolations([v1], [v2])
    expect(result.improved).toHaveLength(0)
    expect(result.added).toHaveLength(0)
    expect(result.removed).toHaveLength(0)
  })
})

describe('countByRule - edge cases', () => {
  test('handles numeric string as ruleId', () => {
    const violations = [makeViolation({ filePath: 'a.ts', ruleId: '42' })]
    expect(countByRule(violations)).toEqual({ '42': 1 })
  })
})

describe('buildDiffReport - edge cases', () => {
  test('added violations match compareViolations result', () => {
    const base = [makeViolation({ filePath: 'src/a.ts', ruleId: 'r1' })]
    const head = [
      makeViolation({ filePath: 'src/a.ts', ruleId: 'r1' }),
      makeViolation({ filePath: 'src/new.ts', ruleId: 'r2' }),
    ]
    const report = buildDiffReport('base', 'head', base, head)
    expect(report.added).toHaveLength(1)
    expect(report.added[0].filePath).toBe('src/new.ts')
    expect(report.added[0].ruleId).toBe('r2')
  })

  test('removed violations match compareViolations result', () => {
    const base = [
      makeViolation({ filePath: 'src/a.ts', ruleId: 'r1' }),
      makeViolation({ filePath: 'src/old.ts', ruleId: 'r2' }),
    ]
    const head = [makeViolation({ filePath: 'src/a.ts', ruleId: 'r1' })]
    const report = buildDiffReport('base', 'head', base, head)
    expect(report.removed).toHaveLength(1)
    expect(report.removed[0].filePath).toBe('src/old.ts')
    expect(report.removed[0].ruleId).toBe('r2')
  })
})

describe('parseGitDiffOutput - edge cases', () => {
  test('preserves case sensitivity in file paths', () => {
    const output = 'src/File.ts\nsrc/file.ts\nSRC/FILE.TS'
    expect(parseGitDiffOutput(output)).toEqual(['src/File.ts', 'src/file.ts', 'SRC/FILE.TS'])
  })

  test('handles mixed CRLF and LF line endings', () => {
    const output = 'src/a.ts\r\nsrc/b.ts\nsrc/c.ts'
    const result = parseGitDiffOutput(output)
    expect(result).toEqual(['src/a.ts', 'src/b.ts', 'src/c.ts'])
  })
})

describe('formatSummary - edge cases', () => {
  test('output ends with a newline', () => {
    const report = makeReport()
    const output = formatSummary(report)
    expect(output.endsWith('\n')).toBe(true)
  })
})

describe('displayAddedViolations - edge cases', () => {
  test('logFn receives empty string for trailing blank line', () => {
    const calls: string[] = []
    const violations = [makeViolation({ filePath: 'src/a.ts', ruleId: 'r' })]
    displayAddedViolations(violations, (msg) => calls.push(msg ?? ''))
    expect(calls).toContain('')
  })
})

describe('displayRemovedViolations - edge cases', () => {
  test('logFn receives empty string for trailing blank line', () => {
    const calls: string[] = []
    const violations = [makeViolation({ filePath: 'src/a.ts', ruleId: 'r' })]
    displayRemovedViolations(violations, (msg) => calls.push(msg ?? ''))
    expect(calls).toContain('')
  })
})

describe('displayDiffReport - edge cases', () => {
  test('verbose with 19 added violations shows all without truncation', () => {
    const lines: string[] = []
    const added = Array.from({ length: 19 }, (_, i) =>
      makeViolation({ filePath: `src/${i}.ts`, ruleId: 'r' }),
    )
    const report = makeReport({
      added,
      summary: {
        addedCount: 19,
        improvedCount: 0,
        netChange: 19,
        removedCount: 0,
        totalBase: 0,
        totalHead: 19,
      },
    })
    displayDiffReport(report, true, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).not.toContain('and')
    expect(output).not.toContain('more')
    expect(output).toContain('Added Violations')
  })

  test('displays both ref names in comparing line', () => {
    const lines: string[] = []
    const report = makeReport({
      base: 'feature/my-branch',
      head: 'main',
    })
    displayDiffReport(report, false, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('feature/my-branch')
    expect(output).toContain('main')
  })
})
