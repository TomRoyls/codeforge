import { describe, it, expect } from 'vitest'
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
} from '../src/commands/diff-helpers.js'
import type { RuleViolation } from '../src/ast/visitor.js'

function makeViolation(overrides: Partial<RuleViolation> = {}): RuleViolation {
  return {
    filePath: 'src/test.ts',
    message: 'test violation',
    range: {
      end: { column: 10, line: 1 },
      start: { column: 0, line: 1 },
    },
    ruleId: 'no-eval',
    severity: 'error',
    ...overrides,
  } as RuleViolation
}

// ─── createViolationKey ──────────────────────────────
describe('createViolationKey', () => {
  it('creates key from filePath, line, and ruleId', () => {
    const v = makeViolation({ filePath: 'src/a.ts', range: { end: { column: 5, line: 10 }, start: { column: 0, line: 10 } }, ruleId: 'no-eval' })

    expect(createViolationKey(v)).toBe('src/a.ts:10:no-eval')
  })

  it('differentiates by line number', () => {
    const v1 = makeViolation({ range: { end: { column: 5, line: 1 }, start: { column: 0, line: 1 } } })
    const v2 = makeViolation({ range: { end: { column: 5, line: 2 }, start: { column: 0, line: 2 } } })

    expect(createViolationKey(v1)).not.toBe(createViolationKey(v2))
  })
})

// ─── compareViolations ───────────────────────────────
describe('compareViolations', () => {
  it('detects added violations', () => {
    const base = [makeViolation({ filePath: 'a.ts', ruleId: 'rule-a' })]
    const head = [
      makeViolation({ filePath: 'a.ts', ruleId: 'rule-a' }),
      makeViolation({ filePath: 'b.ts', ruleId: 'rule-b' }),
    ]

    const result = compareViolations(base, head)

    expect(result.added).toHaveLength(1)
    expect(result.added[0]!.ruleId).toBe('rule-b')
  })

  it('detects removed violations', () => {
    const base = [
      makeViolation({ filePath: 'a.ts', ruleId: 'rule-a' }),
      makeViolation({ filePath: 'b.ts', ruleId: 'rule-b' }),
    ]
    const head = [makeViolation({ filePath: 'a.ts', ruleId: 'rule-a' })]

    const result = compareViolations(base, head)

    expect(result.removed).toHaveLength(1)
    expect(result.removed[0]!.ruleId).toBe('rule-b')
  })

  it('returns empty arrays when violations are identical', () => {
    const v = makeViolation({ filePath: 'a.ts', ruleId: 'rule-a' })
    const result = compareViolations([v], [v])

    expect(result.added).toHaveLength(0)
    expect(result.removed).toHaveLength(0)
  })

  it('handles both additions and removals', () => {
    const base = [makeViolation({ filePath: 'a.ts', ruleId: 'rule-a' })]
    const head = [makeViolation({ filePath: 'b.ts', ruleId: 'rule-b' })]

    const result = compareViolations(base, head)

    expect(result.added).toHaveLength(1)
    expect(result.removed).toHaveLength(1)
  })

  it('handles empty inputs', () => {
    const result = compareViolations([], [])

    expect(result.added).toHaveLength(0)
    expect(result.removed).toHaveLength(0)
  })
})

// ─── countByRule ─────────────────────────────────────
describe('countByRule', () => {
  it('counts violations by rule ID', () => {
    const violations = [
      makeViolation({ ruleId: 'no-eval' }),
      makeViolation({ ruleId: 'no-eval' }),
      makeViolation({ ruleId: 'prefer-const' }),
    ]

    const counts = countByRule(violations)

    expect(counts).toEqual({ 'no-eval': 2, 'prefer-const': 1 })
  })

  it('returns empty object for no violations', () => {
    expect(countByRule([])).toEqual({})
  })
})

// ─── countBySeverity ─────────────────────────────────
describe('countBySeverity', () => {
  it('counts violations by severity', () => {
    const violations = [
      makeViolation({ severity: 'error' }),
      makeViolation({ severity: 'error' }),
      makeViolation({ severity: 'warning' }),
    ]

    const counts = countBySeverity(violations)

    expect(counts).toEqual({ error: 2, warning: 1 })
  })

  it('returns empty object for no violations', () => {
    expect(countBySeverity([])).toEqual({})
  })
})

// ─── buildDiffReport ─────────────────────────────────
describe('buildDiffReport', () => {
  it('builds a complete diff report', () => {
    const base = [makeViolation({ filePath: 'a.ts', ruleId: 'rule-a' })]
    const head = [
      makeViolation({ filePath: 'a.ts', ruleId: 'rule-a' }),
      makeViolation({ filePath: 'b.ts', ruleId: 'rule-b' }),
    ]

    const report = buildDiffReport('main', 'feature', base, head)

    expect(report.base).toBe('main')
    expect(report.head).toBe('feature')
    expect(report.summary.addedCount).toBe(1)
    expect(report.summary.removedCount).toBe(0)
    expect(report.summary.netChange).toBe(1)
    expect(report.summary.totalBase).toBe(1)
    expect(report.summary.totalHead).toBe(2)
  })

  it('computes negative net change when violations removed', () => {
    const base = [
      makeViolation({ filePath: 'a.ts', ruleId: 'rule-a' }),
      makeViolation({ filePath: 'b.ts', ruleId: 'rule-b' }),
    ]
    const head = [makeViolation({ filePath: 'a.ts', ruleId: 'rule-a' })]

    const report = buildDiffReport('main', 'feature', base, head)

    expect(report.summary.netChange).toBe(-1)
  })

  it('computes zero net change when equal additions and removals', () => {
    const base = [makeViolation({ filePath: 'a.ts', ruleId: 'rule-a' })]
    const head = [makeViolation({ filePath: 'b.ts', ruleId: 'rule-b' })]

    const report = buildDiffReport('main', 'feature', base, head)

    expect(report.summary.netChange).toBe(0)
  })
})

// ─── parseGitDiffOutput ──────────────────────────────
describe('parseGitDiffOutput', () => {
  it('splits lines and trims whitespace', () => {
    const result = parseGitDiffOutput('a.ts\n  b.ts  \n\nc.ts')

    expect(result).toEqual(['a.ts', 'b.ts', 'c.ts'])
  })

  it('filters empty lines', () => {
    const result = parseGitDiffOutput('\n\na.ts\n\n')

    expect(result).toEqual(['a.ts'])
  })

  it('returns empty array for empty input', () => {
    expect(parseGitDiffOutput('')).toEqual([])
  })
})

// ─── formatSummary ───────────────────────────────────
describe('formatSummary', () => {
  it('shows improvement message when net change is negative', () => {
    const report: DiffReport = {
      added: [],
      base: 'main',
      head: 'feature',
      improved: [],
      removed: [makeViolation()],
      summary: {
        addedCount: 0,
        improvedCount: 0,
        netChange: -1,
        removedCount: 1,
        totalBase: 1,
        totalHead: 0,
      },
    }

    const output = formatSummary(report)

    expect(output).toContain('improved')
  })

  it('shows regression warning when net change is positive', () => {
    const report: DiffReport = {
      added: [makeViolation()],
      base: 'main',
      head: 'feature',
      improved: [],
      removed: [],
      summary: {
        addedCount: 1,
        improvedCount: 0,
        netChange: 1,
        removedCount: 0,
        totalBase: 0,
        totalHead: 1,
      },
    }

    const output = formatSummary(report)

    expect(output).toContain('regressed')
  })

  it('shows no change message when net change is zero', () => {
    const report: DiffReport = {
      added: [],
      base: 'main',
      head: 'feature',
      improved: [],
      removed: [],
      summary: {
        addedCount: 0,
        improvedCount: 0,
        netChange: 0,
        removedCount: 0,
        totalBase: 0,
        totalHead: 0,
      },
    }

    const output = formatSummary(report)

    expect(output).toContain('No net change')
  })
})

// ─── displayAddedViolations ──────────────────────────
describe('displayAddedViolations', () => {
  it('does nothing for empty violations', () => {
    const logged: string[] = []
    displayAddedViolations([], (m) => logged.push(m ?? ''))

    expect(logged).toEqual([])
  })

  it('shows added violations with + prefix', () => {
    const logged: string[] = []
    const violations = [makeViolation({ filePath: 'src/a.ts', ruleId: 'no-eval' })]

    displayAddedViolations(violations, (m) => logged.push(m ?? ''))

    expect(logged.some((l) => l.includes('Added Violations'))).toBe(true)
    expect(logged.some((l) => l.includes('src/a.ts'))).toBe(true)
    expect(logged.some((l) => l.includes('no-eval'))).toBe(true)
  })
})

// ─── displayRemovedViolations ────────────────────────
describe('displayRemovedViolations', () => {
  it('does nothing for empty violations', () => {
    const logged: string[] = []
    displayRemovedViolations([], (m) => logged.push(m ?? ''))

    expect(logged).toEqual([])
  })

  it('shows removed violations with - prefix', () => {
    const logged: string[] = []
    const violations = [makeViolation({ filePath: 'src/a.ts', ruleId: 'no-eval' })]

    displayRemovedViolations(violations, (m) => logged.push(m ?? ''))

    expect(logged.some((l) => l.includes('Removed Violations'))).toBe(true)
    expect(logged.some((l) => l.includes('src/a.ts'))).toBe(true)
  })
})

// ─── displayDiffReport ───────────────────────────────
describe('displayDiffReport', () => {
  const baseReport: DiffReport = {
    added: [],
    base: 'main',
    head: 'feature',
    improved: [],
    removed: [],
    summary: {
      addedCount: 0,
      improvedCount: 0,
      netChange: 0,
      removedCount: 0,
      totalBase: 0,
      totalHead: 0,
    },
  }

  it('displays header and summary', () => {
    const logged: string[] = []
    displayDiffReport(baseReport, false, (m) => logged.push(m ?? ''))

    expect(logged.some((l) => l.includes('Violation Diff Analysis'))).toBe(true)
    expect(logged.some((l) => l.includes('main'))).toBe(true)
    expect(logged.some((l) => l.includes('feature'))).toBe(true)
  })

  it('shows added and removed violations in verbose mode', () => {
    const logged: string[] = []
    const report: DiffReport = {
      ...baseReport,
      added: [makeViolation({ filePath: 'a.ts', ruleId: 'rule-a' })],
      removed: [makeViolation({ filePath: 'b.ts', ruleId: 'rule-b' })],
      summary: {
        addedCount: 1,
        improvedCount: 0,
        netChange: 0,
        removedCount: 1,
        totalBase: 1,
        totalHead: 1,
      },
    }

    displayDiffReport(report, true, (m) => logged.push(m ?? ''))

    expect(logged.some((l) => l.includes('Added Violations'))).toBe(true)
    expect(logged.some((l) => l.includes('Removed Violations'))).toBe(true)
  })

  it('hides violation details in non-verbose mode', () => {
    const logged: string[] = []
    const report: DiffReport = {
      ...baseReport,
      added: [makeViolation({ filePath: 'a.ts', ruleId: 'rule-a' })],
      summary: {
        ...baseReport.summary,
        addedCount: 1,
        netChange: 1,
        totalHead: 1,
      },
    }

    displayDiffReport(report, false, (m) => logged.push(m ?? ''))

    expect(logged.some((l) => l.includes('Added Violations'))).toBe(false)
  })

  it('shows improvement message when net change negative', () => {
    const logged: string[] = []
    const report: DiffReport = {
      ...baseReport,
      summary: {
        ...baseReport.summary,
        netChange: -3,
        removedCount: 3,
      },
    }

    displayDiffReport(report, false, (m) => logged.push(m ?? ''))

    expect(logged.some((l) => l.includes('improved'))).toBe(true)
  })
})
