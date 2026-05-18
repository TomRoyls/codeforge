import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import type { RuleViolation } from '../../src/ast/visitor.js'
import type { FixResult, TextChange } from '../../src/fix/types.js'

import {
  applyFixesToFile,
  applyFixesToFiles,
  type FixFunction,
  type RuleWithFix,
} from '../../src/fix/fixer.js'

// ─── Helpers ───

function createTestSourceFile(code: string, fileName = 'test.ts') {
  const project = new Project({ useInMemoryFileSystem: true })
  return project.createSourceFile(fileName, code)
}

function createViolation(overrides: Partial<RuleViolation> = {}): RuleViolation {
  return {
    ruleId: 'test-rule',
    message: 'test violation',
    severity: 'error',
    filePath: 'test.ts',
    range: {
      start: { line: 1, column: 1 },
      end: { line: 1, column: 12 },
    },
    ...overrides,
  }
}

function createRuleWithFix(
  id: string,
  priority: number,
  fixFn: FixFunction,
): RuleWithFix {
  return { id, priority, fix: fixFn }
}

function successFixResult(changes: TextChange[]): FixResult {
  return { applied: true, changes }
}

function conflictFixResult(conflictingRule: string, reason: string): FixResult {
  return {
    applied: false,
    changes: [],
    conflict: { conflictingRule, reason },
  }
}

function makeTextChange(start: number, end: number, oldText: string, newText: string): TextChange {
  return { start, end, oldText, newText }
}

function makeRulesMap(...rules: RuleWithFix[]): Map<string, RuleWithFix> {
  const map = new Map<string, RuleWithFix>()
  for (const rule of rules) {
    map.set(rule.id, rule)
  }
  return map
}

// ─── applyFixesToFile — Empty / No-Op Cases ───

describe('applyFixesToFile', () => {
  it('returns zeroed report for empty violations', () => {
    const sf = createTestSourceFile('const x = 1;')
    const rules = makeRulesMap()
    const report = applyFixesToFile(sf, [], rules)
    expect(report.fixesApplied).toBe(0)
    expect(report.fixesSkipped).toBe(0)
    expect(report.changes).toHaveLength(0)
    expect(report.conflicts).toHaveLength(0)
  })

  it('returns zeroed report when no rules match violations', () => {
    const sf = createTestSourceFile('const x = 1;')
    const violations = [createViolation({ ruleId: 'no-match' })]
    const rules = makeRulesMap()
    const report = applyFixesToFile(sf, violations, rules)
    expect(report.fixesApplied).toBe(0)
    expect(report.fixesSkipped).toBe(0)
  })

  it('includes the file path in the report', () => {
    const sf = createTestSourceFile('const x = 1;', '/path/to/file.ts')
    const report = applyFixesToFile(sf, [], makeRulesMap())
    expect(report.filePath).toBe('/path/to/file.ts')
  })

  // ─── Single Fix Application (dryRun) ───

  it('applies a single fix from a matching rule', () => {
    const sf = createTestSourceFile('let x = 1;')
    const violation = createViolation({
      ruleId: 'prefer-const',
      range: {
        start: { line: 1, column: 1 },
        end: { line: 1, column: 11 },
      },
    })
    const rule = createRuleWithFix('prefer-const', 1, () =>
      successFixResult([makeTextChange(0, 11, 'let x = 1;', 'const x = 1;')]),
    )
    const report = applyFixesToFile(sf, [violation], makeRulesMap(rule), true)
    expect(report.fixesApplied).toBe(1)
    expect(report.changes).toHaveLength(1)
  })

  it('does not modify file in dryRun mode', () => {
    const originalText = 'let x = 1;'
    const sf = createTestSourceFile(originalText)
    const violation = createViolation({
      ruleId: 'prefer-const',
      range: {
        start: { line: 1, column: 1 },
        end: { line: 1, column: 11 },
      },
    })
    const rule = createRuleWithFix('prefer-const', 1, () =>
      successFixResult([makeTextChange(0, 11, 'let x = 1;', 'const x = 1;')]),
    )
    applyFixesToFile(sf, [violation], makeRulesMap(rule), true)
    expect(sf.getFullText()).toBe(originalText)
  })

  it('modifies file when not in dryRun mode', () => {
    const sf = createTestSourceFile('let x = 1;\n')
    const violation = createViolation({
      ruleId: 'prefer-const',
      range: {
        start: { line: 1, column: 1 },
        end: { line: 1, column: 11 },
      },
    })
    const rule = createRuleWithFix('prefer-const', 1, () =>
      successFixResult([makeTextChange(0, 10, 'let x = 1;', 'const x = 1;')]),
    )
    applyFixesToFile(sf, [violation], makeRulesMap(rule), false)
    expect(sf.getFullText()).toBe('const x = 1;\n')
  })

  it('still returns changes in dryRun mode', () => {
    const sf = createTestSourceFile('let x = 1;')
    const violation = createViolation({
      ruleId: 'prefer-const',
      range: {
        start: { line: 1, column: 1 },
        end: { line: 1, column: 11 },
      },
    })
    const rule = createRuleWithFix('prefer-const', 1, () =>
      successFixResult([makeTextChange(0, 11, 'let x = 1;', 'const x = 1;')]),
    )
    const report = applyFixesToFile(sf, [violation], makeRulesMap(rule), true)
    expect(report.fixesApplied).toBe(1)
    expect(report.changes).toHaveLength(1)
    expect(report.changes[0]!.newText).toBe('const x = 1;')
  })

  // ─── Fix Function Receiving Correct Context ───

  it('passes sourceFile and violation to fix function', () => {
    const sf = createTestSourceFile('let x = 1;')
    const violation = createViolation({ ruleId: 'test-rule' })
    let receivedSourceFile = false
    let receivedViolation = false
    const rule = createRuleWithFix('test-rule', 1, (ctx) => {
      receivedSourceFile = ctx.sourceFile === sf
      receivedViolation = ctx.violation === violation
      return successFixResult([])
    })
    applyFixesToFile(sf, [violation], makeRulesMap(rule), true)
    expect(receivedSourceFile).toBe(true)
    expect(receivedViolation).toBe(true)
  })

  it('passes getNodeByRange to fix function', () => {
    const sf = createTestSourceFile('let x = 1;')
    const violation = createViolation({ ruleId: 'test-rule' })
    let hasGetNodeByRange = false
    const rule = createRuleWithFix('test-rule', 1, (ctx) => {
      hasGetNodeByRange = typeof ctx.getNodeByRange === 'function'
      return successFixResult([])
    })
    applyFixesToFile(sf, [violation], makeRulesMap(rule), true)
    expect(hasGetNodeByRange).toBe(true)
  })

  // ─── Null Fix Result ───

  it('skips violation when fix function returns null', () => {
    const sf = createTestSourceFile('let x = 1;')
    const violation = createViolation({ ruleId: 'test-rule' })
    const rule = createRuleWithFix('test-rule', 1, () => null)
    const report = applyFixesToFile(sf, [violation], makeRulesMap(rule))
    expect(report.fixesApplied).toBe(0)
    expect(report.fixesSkipped).toBe(0)
  })

  it('skips violation when fix returns applied=false without conflict', () => {
    const sf = createTestSourceFile('let x = 1;')
    const violation = createViolation({ ruleId: 'test-rule' })
    const rule = createRuleWithFix('test-rule', 1, () => ({
      applied: false,
      changes: [],
    }))
    const report = applyFixesToFile(sf, [violation], makeRulesMap(rule))
    expect(report.fixesApplied).toBe(0)
  })

  // ─── Conflict Detection via FixResult ───

  it('records conflict when fix returns conflict info', () => {
    const sf = createTestSourceFile('let x = 1;')
    const violation = createViolation({ ruleId: 'test-rule' })
    const rule = createRuleWithFix('test-rule', 1, () =>
      conflictFixResult('other-rule', 'Range already modified'),
    )
    const report = applyFixesToFile(sf, [violation], makeRulesMap(rule))
    expect(report.fixesSkipped).toBe(1)
    expect(report.conflicts).toHaveLength(1)
    expect(report.conflicts[0]!.conflictingRule).toBe('other-rule')
    expect(report.conflicts[0]!.reason).toBe('Range already modified')
    expect(report.conflicts[0]!.ruleId).toBe('test-rule')
  })

  // ─── Priority Ordering ───

  it('processes violations sorted by priority (ascending)', () => {
    const sf = createTestSourceFile('let x = 1; let y = 2;')
    const order: string[] = []
    const ruleA = createRuleWithFix('rule-a', 1, () => {
      order.push('a')
      return successFixResult([])
    })
    const ruleB = createRuleWithFix('rule-b', 2, () => {
      order.push('b')
      return successFixResult([])
    })
    const violations = [
      createViolation({ ruleId: 'rule-b', range: { start: { line: 1, column: 13 }, end: { line: 1, column: 22 } } }),
      createViolation({ ruleId: 'rule-a', range: { start: { line: 1, column: 1 }, end: { line: 1, column: 10 } } }),
    ]
    applyFixesToFile(sf, violations, makeRulesMap(ruleA, ruleB), true)
    expect(order).toEqual(['a', 'b'])
  })

  it('applies higher priority fixes before lower ones', () => {
    const sf = createTestSourceFile('let x = 1;\nlet y = 2;')
    const applied: string[] = []
    const ruleHigh = createRuleWithFix('high-priority', 1, () => {
      applied.push('high')
      return successFixResult([])
    })
    const ruleLow = createRuleWithFix('low-priority', 10, () => {
      applied.push('low')
      return successFixResult([])
    })
    applyFixesToFile(
      sf,
      [
        createViolation({ ruleId: 'low-priority', range: { start: { line: 2, column: 1 }, end: { line: 2, column: 11 } } }),
        createViolation({ ruleId: 'high-priority', range: { start: { line: 1, column: 1 }, end: { line: 1, column: 11 } } }),
      ],
      makeRulesMap(ruleHigh, ruleLow),
      true,
    )
    expect(applied[0]).toBe('high')
    expect(applied[1]).toBe('low')
  })

  // ─── Overlapping Range Detection ───

  it('detects overlapping ranges and skips conflicting fix', () => {
    const sf = createTestSourceFile('let x = 1;')
    const violation1 = createViolation({
      ruleId: 'rule-a',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 11 } },
    })
    const violation2 = createViolation({
      ruleId: 'rule-b',
      range: { start: { line: 1, column: 5 }, end: { line: 1, column: 8 } },
    })
    const ruleA = createRuleWithFix('rule-a', 1, () =>
      successFixResult([makeTextChange(0, 10, 'let x = 1;', 'const x = 1;')]),
    )
    const ruleB = createRuleWithFix('rule-b', 2, () =>
      successFixResult([makeTextChange(4, 7, 'x =', 'y =')]),
    )
    const report = applyFixesToFile(sf, [violation1, violation2], makeRulesMap(ruleA, ruleB), true)
    expect(report.fixesApplied).toBe(1)
    expect(report.fixesSkipped).toBe(1)
    expect(report.conflicts).toHaveLength(1)
    expect(report.conflicts[0]!.reason).toBe('Overlapping fix range')
  })

  it('detects when new range completely encloses an applied range', () => {
    const sf = createTestSourceFile('let x = 1;')
    const inner = createViolation({
      ruleId: 'inner',
      range: { start: { line: 1, column: 5 }, end: { line: 1, column: 7 } },
    })
    const outer = createViolation({
      ruleId: 'outer',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 12 } },
    })
    const innerRule = createRuleWithFix('inner', 1, () =>
      successFixResult([makeTextChange(4, 6, 'x', 'y')]),
    )
    const outerRule = createRuleWithFix('outer', 2, () =>
      successFixResult([makeTextChange(0, 10, 'let x = 1;', 'const y = 2;')]),
    )
    const report = applyFixesToFile(sf, [inner, outer], makeRulesMap(innerRule, outerRule), true)
    expect(report.fixesSkipped).toBe(1)
  })

  it('allows non-overlapping fixes from different rules', () => {
    const sf = createTestSourceFile('let x = 1;\nlet y = 2;')
    const violation1 = createViolation({
      ruleId: 'fix-line1',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 11 } },
    })
    const violation2 = createViolation({
      ruleId: 'fix-line2',
      range: { start: { line: 2, column: 1 }, end: { line: 2, column: 11 } },
    })
    const rule1 = createRuleWithFix('fix-line1', 1, () =>
      successFixResult([makeTextChange(0, 10, 'let x = 1;', 'const x = 1;')]),
    )
    const rule2 = createRuleWithFix('fix-line2', 2, () =>
      successFixResult([makeTextChange(12, 22, 'let y = 2;', 'const y = 2;')]),
    )
    const report = applyFixesToFile(sf, [violation1, violation2], makeRulesMap(rule1, rule2), true)
    expect(report.fixesApplied).toBe(2)
    expect(report.conflicts).toHaveLength(0)
  })

  // ─── Multiple Violations, Single Rule ───

  it('applies multiple fixes from the same rule', () => {
    const sf = createTestSourceFile('let x = 1;\nlet y = 2;')
    const v1 = createViolation({
      ruleId: 'prefer-const',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 11 } },
    })
    const v2 = createViolation({
      ruleId: 'prefer-const',
      range: { start: { line: 2, column: 1 }, end: { line: 2, column: 11 } },
    })
    const rule = createRuleWithFix('prefer-const', 1, () =>
      successFixResult([makeTextChange(0, 10, 'let x = 1;', 'const x = 1;')]),
    )
    const report = applyFixesToFile(sf, [v1, v2], makeRulesMap(rule), true)
    expect(report.fixesApplied).toBe(2)
  })

  // ─── Multiple Text Changes ───

  it('accumulates changes from multiple fix results', () => {
    const sf = createTestSourceFile('let x = 1;\nlet y = 2;')
    const v1 = createViolation({
      ruleId: 'rule-a',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 11 } },
    })
    const v2 = createViolation({
      ruleId: 'rule-b',
      range: { start: { line: 2, column: 1 }, end: { line: 2, column: 11 } },
    })
    const ruleA = createRuleWithFix('rule-a', 1, () =>
      successFixResult([makeTextChange(0, 10, 'let x = 1;', 'const x = 1;')]),
    )
    const ruleB = createRuleWithFix('rule-b', 2, () =>
      successFixResult([makeTextChange(12, 22, 'let y = 2;', 'const y = 2;')]),
    )
    const report = applyFixesToFile(sf, [v1, v2], makeRulesMap(ruleA, ruleB), true)
    expect(report.changes).toHaveLength(2)
  })

  // ─── Fix Returning Multiple Changes ───

  it('handles a fix that returns multiple text changes', () => {
    const sf = createTestSourceFile('let x = 1; let y = 2;')
    const violation = createViolation({
      ruleId: 'multi-fix',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 22 } },
    })
    const rule = createRuleWithFix('multi-fix', 1, () =>
      successFixResult([
        makeTextChange(0, 10, 'let x = 1;', 'const x = 1;'),
        makeTextChange(12, 22, 'let y = 2;', 'const y = 2;'),
      ]),
    )
    const report = applyFixesToFile(sf, [violation], makeRulesMap(rule), true)
    expect(report.fixesApplied).toBe(1)
    expect(report.changes).toHaveLength(2)
  })

  // ─── Text Change Application (non-dryRun) ───

  it('applies changes to source file in non-dryRun mode', () => {
    const sf = createTestSourceFile('let x = 1;\n')
    const violation = createViolation({
      ruleId: 'prefer-const',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 11 } },
    })
    const rule = createRuleWithFix('prefer-const', 1, () =>
      successFixResult([makeTextChange(0, 10, 'let x = 1;', 'const x = 1;')]),
    )
    applyFixesToFile(sf, [violation], makeRulesMap(rule), false)
    expect(sf.getFullText()).toBe('const x = 1;\n')
  })

  it('does not call replaceText when dryRun is true', () => {
    const sf = createTestSourceFile('let x = 1;\n')
    const originalText = sf.getFullText()
    const violation = createViolation({
      ruleId: 'prefer-const',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 11 } },
    })
    const rule = createRuleWithFix('prefer-const', 1, () =>
      successFixResult([makeTextChange(0, 10, 'let x = 1;', 'const x = 1;')]),
    )
    const report = applyFixesToFile(sf, [violation], makeRulesMap(rule), true)
    expect(sf.getFullText()).toBe(originalText)
    expect(report.fixesApplied).toBe(1)
  })

  // ─── Violations Without Matching Rules ───

  it('ignores violations that have no matching rule', () => {
    const sf = createTestSourceFile('let x = 1;')
    const violations = [
      createViolation({ ruleId: 'unknown-rule' }),
      createViolation({ ruleId: 'another-unknown' }),
    ]
    const report = applyFixesToFile(sf, violations, makeRulesMap())
    expect(report.fixesApplied).toBe(0)
    expect(report.fixesSkipped).toBe(0)
  })

  it('only applies fixes for violations with matching rules', () => {
    const sf = createTestSourceFile('let x = 1;')
    const violations = [
      createViolation({ ruleId: 'matched' }),
      createViolation({ ruleId: 'unmatched' }),
    ]
    const rule = createRuleWithFix('matched', 1, () =>
      successFixResult([makeTextChange(0, 10, 'let x = 1;', 'const x = 1;')]),
    )
    const report = applyFixesToFile(sf, violations, makeRulesMap(rule), true)
    expect(report.fixesApplied).toBe(1)
  })

  it('does not apply changes when fix result has applied false', () => {
    const sf = createTestSourceFile('let x = 1;\n')
    const originalText = sf.getFullText()
    const violation = createViolation({ ruleId: 'test-rule' })
    const rule = createRuleWithFix('test-rule', 1, () => ({
      applied: false,
      changes: [makeTextChange(0, 10, 'let x = 1;', 'const x = 1;')],
    }))
    applyFixesToFile(sf, [violation], makeRulesMap(rule), false)
    expect(sf.getFullText()).toBe(originalText)
  })

  it('counts applied=true with empty changes as a fix', () => {
    const sf = createTestSourceFile('let x = 1;')
    const violation = createViolation({ ruleId: 'test-rule' })
    const rule = createRuleWithFix('test-rule', 1, () =>
      successFixResult([]),
    )
    const report = applyFixesToFile(sf, [violation], makeRulesMap(rule))
    expect(report.fixesApplied).toBe(1)
    expect(report.changes).toHaveLength(0)
  })

  it('reports conflictingRule as unknown when no specific overlap found', () => {
    const sf = createTestSourceFile('let x = 1;')
    const v1 = createViolation({
      ruleId: 'rule-a',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 11 } },
    })
    const v2 = createViolation({
      ruleId: 'rule-b',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 11 } },
    })
    const ruleA = createRuleWithFix('rule-a', 1, () =>
      successFixResult([makeTextChange(0, 10, 'let x = 1;', 'const x = 1;')]),
    )
    const ruleB = createRuleWithFix('rule-b', 2, () =>
      successFixResult([makeTextChange(0, 10, 'let x = 1;', 'const x = 1;')]),
    )
    const report = applyFixesToFile(sf, [v1, v2], makeRulesMap(ruleA, ruleB), true)
    expect(report.conflicts).toHaveLength(1)
    expect(report.conflicts[0]!.ruleId).toBe('rule-b')
  })
})

// ─── applyFixesToFiles ───

describe('applyFixesToFiles', () => {
  it('returns zeroed report for empty input', () => {
    const report = applyFixesToFiles([], makeRulesMap())
    expect(report.filesProcessed).toBe(0)
    expect(report.totalFixesApplied).toBe(0)
    expect(report.totalFixesSkipped).toBe(0)
    expect(report.fileReports).toHaveLength(0)
  })

  it('processes a single file', () => {
    const sf = createTestSourceFile('let x = 1;')
    const violation = createViolation({
      ruleId: 'prefer-const',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 11 } },
    })
    const rule = createRuleWithFix('prefer-const', 1, () =>
      successFixResult([makeTextChange(0, 10, 'let x = 1;', 'const x = 1;')]),
    )
    const report = applyFixesToFiles(
      [{ sourceFile: sf, violations: [violation] }],
      makeRulesMap(rule),
      true,
    )
    expect(report.filesProcessed).toBe(1)
    expect(report.totalFixesApplied).toBe(1)
  })

  it('aggregates results from multiple files', () => {
    const sf1 = createTestSourceFile('let x = 1;', 'a.ts')
    const sf2 = createTestSourceFile('let y = 2;', 'b.ts')
    const violation1 = createViolation({
      ruleId: 'prefer-const',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 11 } },
    })
    const violation2 = createViolation({
      ruleId: 'prefer-const',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 11 } },
    })
    const rule = createRuleWithFix('prefer-const', 1, () =>
      successFixResult([makeTextChange(0, 10, 'let x = 1;', 'const x = 1;')]),
    )
    const report = applyFixesToFiles(
      [
        { sourceFile: sf1, violations: [violation1] },
        { sourceFile: sf2, violations: [violation2] },
      ],
      makeRulesMap(rule),
      true,
    )
    expect(report.filesProcessed).toBe(2)
    expect(report.totalFixesApplied).toBe(2)
    expect(report.fileReports).toHaveLength(2)
  })

  it('aggregates fixes applied and skipped across files', () => {
    const sf1 = createTestSourceFile('let x = 1;', 'a.ts')
    const sf2 = createTestSourceFile('let y = 2;', 'b.ts')
    const v1 = createViolation({
      ruleId: 'rule-a',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 6 } },
    })
    const v2 = createViolation({
      ruleId: 'rule-a',
      range: { start: { line: 1, column: 3 }, end: { line: 1, column: 10 } },
    })
    const rule = createRuleWithFix('rule-a', 1, () =>
      successFixResult([makeTextChange(0, 10, 'let x = 1;', 'const x = 1;')]),
    )
    const report = applyFixesToFiles(
      [
        { sourceFile: sf1, violations: [v1] },
        { sourceFile: sf2, violations: [v2] },
      ],
      makeRulesMap(rule),
      true,
    )
    expect(report.totalFixesApplied).toBe(2)
  })

  it('passes dryRun flag to each file', () => {
    const sf = createTestSourceFile('let x = 1;')
    const originalText = sf.getFullText()
    const violation = createViolation({
      ruleId: 'prefer-const',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 11 } },
    })
    const rule = createRuleWithFix('prefer-const', 1, () =>
      successFixResult([makeTextChange(0, 10, 'let x = 1;', 'const x = 1;')]),
    )
    applyFixesToFiles(
      [{ sourceFile: sf, violations: [violation] }],
      makeRulesMap(rule),
      true,
    )
    expect(sf.getFullText()).toBe(originalText)
  })

  it('includes per-file reports with correct file paths', () => {
    const sf1 = createTestSourceFile('let x = 1;', '/a.ts')
    const sf2 = createTestSourceFile('let y = 2;', '/b.ts')
    const rule = createRuleWithFix('prefer-const', 1, () =>
      successFixResult([makeTextChange(0, 10, 'let x = 1;', 'const x = 1;')]),
    )
    const report = applyFixesToFiles(
      [
        { sourceFile: sf1, violations: [createViolation({ ruleId: 'prefer-const' })] },
        { sourceFile: sf2, violations: [createViolation({ ruleId: 'prefer-const' })] },
      ],
      makeRulesMap(rule),
      true,
    )
    expect(report.fileReports[0]!.filePath).toBe('/a.ts')
    expect(report.fileReports[1]!.filePath).toBe('/b.ts')
  })

  it('handles file with empty violations', () => {
    const sf = createTestSourceFile('let x = 1;')
    const report = applyFixesToFiles(
      [{ sourceFile: sf, violations: [] }],
      makeRulesMap(),
    )
    expect(report.filesProcessed).toBe(1)
    expect(report.totalFixesApplied).toBe(0)
    expect(report.fileReports[0]!.fixesApplied).toBe(0)
  })

  it('sums totalFixesApplied across all files', () => {
    const sf1 = createTestSourceFile('let x = 1; let y = 2;')
    const sf2 = createTestSourceFile('let a = 3;')
    const v1 = createViolation({
      ruleId: 'fix',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 11 } },
    })
    const v2 = createViolation({
      ruleId: 'fix',
      range: { start: { line: 1, column: 13 }, end: { line: 1, column: 23 } },
    })
    const v3 = createViolation({
      ruleId: 'fix',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 11 } },
    })
    const rule = createRuleWithFix('fix', 1, () =>
      successFixResult([makeTextChange(0, 10, 'let x = 1;', 'const x = 1;')]),
    )
    const report = applyFixesToFiles(
      [
        { sourceFile: sf1, violations: [v1, v2] },
        { sourceFile: sf2, violations: [v3] },
      ],
      makeRulesMap(rule),
      true,
    )
    expect(report.totalFixesApplied).toBe(3)
  })
})

// ─── FixFunction Type ───

describe('FixFunction type', () => {
  it('can be implemented as a function returning FixResult', () => {
    const fn: FixFunction = (_ctx) => ({
      applied: true,
      changes: [{ start: 0, end: 3, oldText: 'let', newText: 'const' }],
    })
    const result = fn({
      sourceFile: createTestSourceFile('let x = 1;'),
      violation: createViolation(),
      getNodeByRange: () => undefined,
    })
    expect(result).not.toBeNull()
    expect(result!.applied).toBe(true)
  })

  it('can return null to indicate no fix', () => {
    const fn: FixFunction = () => null
    const result = fn({
      sourceFile: createTestSourceFile('let x = 1;'),
      violation: createViolation(),
      getNodeByRange: () => undefined,
    })
    expect(result).toBeNull()
  })
})

// ─── RuleWithFix Interface ───

describe('RuleWithFix', () => {
  it('has required id, priority, and fix properties', () => {
    const rule: RuleWithFix = {
      id: 'my-rule',
      priority: 5,
      fix: () => null,
    }
    expect(rule.id).toBe('my-rule')
    expect(rule.priority).toBe(5)
    expect(typeof rule.fix).toBe('function')
  })
})
