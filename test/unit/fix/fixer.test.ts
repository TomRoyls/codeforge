import { describe, expect, it, vi } from 'vitest'
import type { SourceFile } from 'ts-morph'
import type { RuleViolation } from '../../../src/ast/visitor.js'
import { createFixContext } from '../../../src/fix/context.js'
import {
  applyFixesToFiles,
  applyFixesToFile,
  createTextChange,
  type RuleWithFix,
} from '../../../src/fix/fixer.js'
import type { FixResult } from '../../../src/fix/types.js'

function createMockSourceFile(text: string): SourceFile {
  const lines = text.split('\n')
  return {
    getFilePath: () => '/test/file.ts',
    getFullText: () => text,
    replaceText: vi.fn(),
    saveSync: vi.fn(),
    getLineAndColumnAtPos: (_pos: number) => ({ column: 1, line: 1 }),
  } as unknown as SourceFile
}

function createMockViolation(overrides: Partial<RuleViolation> = {}): RuleViolation {
  return {
    filePath: '/test/file.ts',
    message: 'Test violation',
    range: {
      end: { column: 10, line: 1 },
      start: { column: 0, line: 1 },
    },
    ruleId: 'test-rule',
    severity: 'warning',
    ...overrides,
  }
}

describe('Fix Context', () => {
  it('creates fix context with source file and violation', () => {
    const sourceFile = createMockSourceFile('const x = 1;')
    const violation = createMockViolation()

    const context = createFixContext(sourceFile, violation)

    expect(context.sourceFile).toBe(sourceFile)
    expect(context.violation).toBe(violation)
    expect(context.getNodeByRange).toBeDefined()
    expect(context.getNodeByPosition).toBeDefined()
  })
})

describe('Text Change', () => {
  it('creates text change with correct positions', () => {
    const sourceFile = createMockSourceFile('const x = 1;')

    const change = createTextChange({
      endColumn: 12,
      endLine: 1,
      newText: 'let x = 1;',
      sourceFile,
      startColumn: 1,
      startLine: 1,
    })

    expect(change.start).toBe(0)
    expect(change.end).toBe(11)
    expect(change.newText).toBe('let x = 1;')
    expect(change.oldText).toBe('const x = 1')
  })

  it('creates text change for multi-line range', () => {
    const sourceFile = createMockSourceFile('const x = 1;\nconst y = 2;\nconst z = 3;')

    const change = createTextChange({
      endColumn: 12,
      endLine: 2,
      newText: 'replaced',
      sourceFile,
      startColumn: 1,
      startLine: 1,
    })

    expect(change.start).toBe(0)
    expect(change.end).toBe(24)
  })
})

describe('Apply Fixes', () => {
  it('returns empty report when no violations', () => {
    const sourceFile = createMockSourceFile('const x = 1;')
    const rules = new Map<string, RuleWithFix>()

    const report = applyFixesToFile(sourceFile, [], rules, false)

    expect(report.fixesApplied).toBe(0)
    expect(report.fixesSkipped).toBe(0)
    expect(report.changes).toHaveLength(0)
  })

  it('applies fix from rule with fix function', () => {
    const sourceFile = createMockSourceFile('const x = 1;')
    const violation = createMockViolation({
      range: {
        end: { column: 5, line: 1 },
        start: { column: 0, line: 1 },
      },
    })

    const rules = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [
              {
                end: 5,
                newText: 'let',
                oldText: 'const',
                start: 0,
              },
            ],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])

    const report = applyFixesToFile(sourceFile, [violation], rules, false)

    expect(report.fixesApplied).toBe(1)
    expect(report.changes).toHaveLength(1)
  })

  it('skips violations for rules without fix function', () => {
    const sourceFile = createMockSourceFile('const x = 1;')
    const violation = createMockViolation()
    const rules = new Map<string, RuleWithFix>()

    const report = applyFixesToFile(sourceFile, [violation], rules, false)

    expect(report.fixesApplied).toBe(0)
    expect(report.fixesSkipped).toBe(0)
  })

  it('detects overlapping fixes as conflicts', () => {
    const sourceFile = createMockSourceFile('const x = 1;')
    const violation1 = createMockViolation({
      range: {
        end: { column: 10, line: 1 },
        start: { column: 0, line: 1 },
      },
      ruleId: 'rule-a',
    })
    const violation2 = createMockViolation({
      range: {
        end: { column: 15, line: 1 },
        start: { column: 5, line: 1 },
      },
      ruleId: 'rule-b',
    })

    const rules = new Map<string, RuleWithFix>([
      [
        'rule-a',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 10, newText: 'a', oldText: 'const x = ', start: 0 }],
          }),
          id: 'rule-a',
          priority: 1,
        },
      ],
      [
        'rule-b',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 15, newText: 'b', oldText: 'x = 1;', start: 5 }],
          }),
          id: 'rule-b',
          priority: 2,
        },
      ],
    ])

    const report = applyFixesToFile(sourceFile, [violation1, violation2], rules, false)

    expect(report.fixesApplied).toBe(1)
    expect(report.fixesSkipped).toBe(1)
    expect(report.conflicts).toHaveLength(1)
    expect(report.conflicts[0]?.ruleId).toBe('rule-b')
  })

  it('sorts fixes by priority', () => {
    const sourceFile = createMockSourceFile('abc def ghi')
    const violation1 = createMockViolation({
      range: { end: { column: 3, line: 1 }, start: { column: 0, line: 1 } },
      ruleId: 'low-priority',
    })
    const violation2 = createMockViolation({
      range: { end: { column: 7, line: 1 }, start: { column: 4, line: 1 } },
      ruleId: 'high-priority',
    })

    const rules = new Map<string, RuleWithFix>([
      [
        'low-priority',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 3, newText: 'XXX', oldText: 'abc', start: 0 }],
          }),
          id: 'low-priority',
          priority: 10,
        },
      ],
      [
        'high-priority',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 7, newText: 'YYY', oldText: 'def', start: 4 }],
          }),
          id: 'high-priority',
          priority: 1,
        },
      ],
    ])

    const report = applyFixesToFile(sourceFile, [violation1, violation2], rules, false)

    expect(report.fixesApplied).toBe(2)
  })

  it('does not apply changes in dry-run mode', () => {
    const sourceFile = createMockSourceFile('const x = 1;')
    const violation = createMockViolation()

    const rules = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 5, newText: 'let', oldText: 'const', start: 0 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])

    const report = applyFixesToFile(sourceFile, [violation], rules, true)

    expect(report.fixesApplied).toBe(1)
    expect(report.changes).toHaveLength(1)
    expect(sourceFile.replaceText).not.toHaveBeenCalled()
  })

  it('handles fixes that overlap at exact same start position', () => {
    const sourceFile = createMockSourceFile('const x = 1; const y = 2;')
    const violation1 = createMockViolation({
      range: { end: { column: 10, line: 1 }, start: { column: 0, line: 1 } },
      ruleId: 'rule-a',
    })
    const violation2 = createMockViolation({
      range: { end: { column: 5, line: 1 }, start: { column: 0, line: 1 } },
      ruleId: 'rule-b',
    })

    const rules = new Map<string, RuleWithFix>([
      [
        'rule-a',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 10, newText: 'let', oldText: 'const x =', start: 0 }],
          }),
          id: 'rule-a',
          priority: 1,
        },
      ],
      [
        'rule-b',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 5, newText: 'var', oldText: 'const', start: 0 }],
          }),
          id: 'rule-b',
          priority: 2,
        },
      ],
    ])

    const report = applyFixesToFile(sourceFile, [violation1, violation2], rules, false)

    expect(report.fixesApplied).toBe(1)
    expect(report.fixesSkipped).toBe(1)
    expect(report.conflicts).toHaveLength(1)
    expect(report.conflicts[0]?.ruleId).toBe('rule-b')
    expect(report.conflicts[0]?.conflictingRule).toBe('rule-a')
  })

  it('handles fixes where one is completely contained within another', () => {
    const sourceFile = createMockSourceFile('const x = 1 + 2 * 3;')
    const violation1 = createMockViolation({
      range: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
      ruleId: 'outer-fix',
    })
    const violation2 = createMockViolation({
      range: { end: { column: 10, line: 1 }, start: { column: 6, line: 1 } },
      ruleId: 'inner-fix',
    })

    const rules = new Map<string, RuleWithFix>([
      [
        'outer-fix',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [
              { end: 20, newText: 'var y = 0;', oldText: 'const x = 1 + 2 * 3;', start: 0 },
            ],
          }),
          id: 'outer-fix',
          priority: 1,
        },
      ],
      [
        'inner-fix',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 10, newText: '5', oldText: '1 + 2', start: 6 }],
          }),
          id: 'inner-fix',
          priority: 2,
        },
      ],
    ])

    const report = applyFixesToFile(sourceFile, [violation1, violation2], rules, false)

    expect(report.fixesApplied).toBe(1)
    expect(report.fixesSkipped).toBe(1)
    expect(report.conflicts).toHaveLength(1)
    expect(report.conflicts[0]?.ruleId).toBe('inner-fix')
    expect(report.conflicts[0]?.conflictingRule).toBe('outer-fix')
  })

  it('applies multiple fixes with no conflicts', () => {
    const sourceFile = createMockSourceFile('const x = 1;\nconst y = 2;\nconst z = 3;')
    const violation1 = createMockViolation({
      range: { end: { column: 10, line: 1 }, start: { column: 0, line: 1 } },
      ruleId: 'rule-a',
    })
    const violation2 = createMockViolation({
      range: { end: { column: 10, line: 2 }, start: { column: 0, line: 2 } },
      ruleId: 'rule-b',
    })
    const violation3 = createMockViolation({
      range: { end: { column: 10, line: 3 }, start: { column: 0, line: 3 } },
      ruleId: 'rule-c',
    })

    const rules = new Map<string, RuleWithFix>([
      [
        'rule-a',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 10, newText: 'let', oldText: 'const', start: 0 }],
          }),
          id: 'rule-a',
          priority: 1,
        },
      ],
      [
        'rule-b',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 25, newText: 'let', oldText: 'const', start: 12 }],
          }),
          id: 'rule-b',
          priority: 2,
        },
      ],
      [
        'rule-c',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 40, newText: 'let', oldText: 'const', start: 24 }],
          }),
          id: 'rule-c',
          priority: 3,
        },
      ],
    ])

    const report = applyFixesToFile(sourceFile, [violation1, violation2, violation3], rules, false)

    expect(report.fixesApplied).toBe(3)
    expect(report.fixesSkipped).toBe(0)
    expect(report.conflicts).toHaveLength(0)
    expect(report.changes).toHaveLength(3)
  })

  it('applies multiple text changes from single fix', () => {
    const sourceFile = createMockSourceFile('const x = 1;\nconst y = 2;')
    const violation = createMockViolation({
      range: { end: { column: 10, line: 2 }, start: { column: 0, line: 1 } },
      ruleId: 'multi-change',
    })

    const rules = new Map<string, RuleWithFix>([
      [
        'multi-change',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [
              { end: 5, newText: 'let', oldText: 'const', start: 0 },
              { end: 17, newText: 'let', oldText: 'const', start: 12 },
            ],
          }),
          id: 'multi-change',
          priority: 1,
        },
      ],
    ])

    const report = applyFixesToFile(sourceFile, [violation], rules, false)

    expect(report.fixesApplied).toBe(1)
    expect(report.changes).toHaveLength(2)
  })

  it('applies changes on same line but different columns', () => {
    const sourceFile = createMockSourceFile('const x = 1; const y = 2;')
    const violation1 = createMockViolation({
      range: { end: { column: 5, line: 1 }, start: { column: 0, line: 1 } },
      ruleId: 'first-half',
    })
    const violation2 = createMockViolation({
      range: { end: { column: 22, line: 1 }, start: { column: 12, line: 1 } },
      ruleId: 'second-half',
    })

    const rules = new Map<string, RuleWithFix>([
      [
        'first-half',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 5, newText: 'let', oldText: 'const', start: 0 }],
          }),
          id: 'first-half',
          priority: 1,
        },
      ],
      [
        'second-half',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 22, newText: 'let', oldText: 'const', start: 12 }],
          }),
          id: 'second-half',
          priority: 2,
        },
      ],
    ])

    const report = applyFixesToFile(sourceFile, [violation1, violation2], rules, false)

    expect(report.fixesApplied).toBe(2)
    expect(report.fixesSkipped).toBe(0)
    expect(report.changes).toHaveLength(2)
  })

  it('handles empty changes array from fix result', () => {
    const sourceFile = createMockSourceFile('const x = 1;')
    const violation = createMockViolation()

    const rules = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])

    const report = applyFixesToFile(sourceFile, [violation], rules, false)

    expect(report.fixesApplied).toBe(1)
    expect(report.changes).toHaveLength(0)
    expect(sourceFile.replaceText).not.toHaveBeenCalled()
  })

  it('runs same priority fixes in file order', () => {
    const sourceFile = createMockSourceFile('a b c d e')
    const violation1 = createMockViolation({
      range: { end: { column: 1, line: 1 }, start: { column: 0, line: 1 } },
      ruleId: 'first',
    })
    const violation2 = createMockViolation({
      range: { end: { column: 3, line: 1 }, start: { column: 2, line: 1 } },
      ruleId: 'second',
    })
    const violation3 = createMockViolation({
      range: { end: { column: 5, line: 1 }, start: { column: 4, line: 1 } },
      ruleId: 'third',
    })

    let firstApplied = false
    let secondApplied = false
    let thirdApplied = false
    const order: string[] = []

    const rules = new Map<string, RuleWithFix>([
      [
        'first',
        {
          fix: (): FixResult => {
            order.push('first')
            firstApplied = true
            return {
              applied: true,
              changes: [{ end: 1, newText: 'A', oldText: 'a', start: 0 }],
            }
          },
          id: 'first',
          priority: 1,
        },
      ],
      [
        'second',
        {
          fix: (): FixResult => {
            order.push('second')
            secondApplied = true
            return {
              applied: true,
              changes: [{ end: 3, newText: 'B', oldText: 'b', start: 2 }],
            }
          },
          id: 'second',
          priority: 1,
        },
      ],
      [
        'third',
        {
          fix: (): FixResult => {
            order.push('third')
            thirdApplied = true
            return {
              applied: true,
              changes: [{ end: 5, newText: 'C', oldText: 'c', start: 4 }],
            }
          },
          id: 'third',
          priority: 1,
        },
      ],
    ])

    const report = applyFixesToFile(sourceFile, [violation1, violation2, violation3], rules, false)

    expect(report.fixesApplied).toBe(3)
    expect(order).toEqual(['first', 'second', 'third'])
    expect(firstApplied).toBe(true)
    expect(secondApplied).toBe(true)
    expect(thirdApplied).toBe(true)
  })

  it('handles fix function returning null', () => {
    const sourceFile = createMockSourceFile('const x = 1;')
    const violation = createMockViolation()

    const rules = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult | null => null,
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])

    const report = applyFixesToFile(sourceFile, [violation], rules, false)

    expect(report.fixesApplied).toBe(0)
    expect(report.fixesSkipped).toBe(0)
    expect(report.changes).toHaveLength(0)
  })

  it('handles fix result with conflict information', () => {
    const sourceFile = createMockSourceFile('const x = 1;')
    const violation = createMockViolation()

    const rules = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: false,
            changes: [],
            conflict: {
              conflictingRule: 'other-rule',
              reason: 'Custom conflict reason',
            },
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])

    const report = applyFixesToFile(sourceFile, [violation], rules, false)

    expect(report.fixesApplied).toBe(0)
    expect(report.fixesSkipped).toBe(1)
    expect(report.conflicts).toHaveLength(1)
    expect(report.conflicts[0]?.ruleId).toBe('test-rule')
    expect(report.conflicts[0]?.conflictingRule).toBe('other-rule')
    expect(report.conflicts[0]?.reason).toBe('Custom conflict reason')
  })

  it('creates text change spanning multiple lines', () => {
    const sourceFile = createMockSourceFile('line 1\nline 2\nline 3\nline 4')

    const change = createTextChange({
      endColumn: 6,
      endLine: 3,
      newText: 'REPLACED',
      sourceFile,
      startColumn: 1,
      startLine: 2,
    })

    expect(change.start).toBeGreaterThan(0)
    expect(change.end).toBeGreaterThan(change.start)
    expect(change.newText).toBe('REPLACED')
    expect(change.oldText).toContain('line 2')
  })
})

describe('Apply Fixes to Files', () => {
  it('applies fixes to multiple files', () => {
    const sourceFile1 = createMockSourceFile('const x = 1;')
    const sourceFile2 = createMockSourceFile('const y = 2;')

    const violation1 = createMockViolation({
      filePath: '/test/file1.ts',
      range: { end: { column: 5, line: 1 }, start: { column: 0, line: 1 } },
      ruleId: 'rule-a',
    })
    const violation2 = createMockViolation({
      filePath: '/test/file2.ts',
      range: { end: { column: 5, line: 1 }, start: { column: 0, line: 1 } },
      ruleId: 'rule-b',
    })

    const rules = new Map<string, RuleWithFix>([
      [
        'rule-a',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 5, newText: 'let', oldText: 'const', start: 0 }],
          }),
          id: 'rule-a',
          priority: 1,
        },
      ],
      [
        'rule-b',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 5, newText: 'var', oldText: 'const', start: 0 }],
          }),
          id: 'rule-b',
          priority: 1,
        },
      ],
    ])

    const filesWithViolations = [
      { sourceFile: sourceFile1, violations: [violation1] },
      { sourceFile: sourceFile2, violations: [violation2] },
    ]

    const report = applyFixesToFiles(filesWithViolations, rules, false)

    expect(report.filesProcessed).toBe(2)
    expect(report.totalFixesApplied).toBe(2)
    expect(report.totalFixesSkipped).toBe(0)
    expect(report.fileReports).toHaveLength(2)
  })

  it('aggregates applied and skipped fixes across files', () => {
    const sourceFile1 = createMockSourceFile('const x = 1; const y = 2;')
    const sourceFile2 = createMockSourceFile('const a = 1; const b = 2;')

    const violation1 = createMockViolation({
      filePath: '/test/file1.ts',
      range: { end: { column: 5, line: 1 }, start: { column: 0, line: 1 } },
      ruleId: 'rule-a',
    })
    const violation2 = createMockViolation({
      filePath: '/test/file1.ts',
      range: { end: { column: 20, line: 1 }, start: { column: 12, line: 1 } },
      ruleId: 'rule-b',
    })
    const violation3 = createMockViolation({
      filePath: '/test/file2.ts',
      range: { end: { column: 5, line: 1 }, start: { column: 0, line: 1 } },
      ruleId: 'rule-c',
    })

    const rules = new Map<string, RuleWithFix>([
      [
        'rule-a',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 5, newText: 'let', oldText: 'const', start: 0 }],
          }),
          id: 'rule-a',
          priority: 1,
        },
      ],
      [
        'rule-b',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 20, newText: 'let', oldText: 'const', start: 12 }],
          }),
          id: 'rule-b',
          priority: 2,
        },
      ],
      [
        'rule-c',
        {
          fix: (): FixResult => ({
            applied: false,
            changes: [],
            conflict: {
              conflictingRule: 'rule-a',
              reason: 'Overlapping fix range',
            },
          }),
          id: 'rule-c',
          priority: 3,
        },
      ],
    ])

    const filesWithViolations = [
      { sourceFile: sourceFile1, violations: [violation1, violation2] },
      { sourceFile: sourceFile2, violations: [violation3] },
    ]

    const report = applyFixesToFiles(filesWithViolations, rules, false)

    expect(report.filesProcessed).toBe(2)
    expect(report.totalFixesApplied).toBe(2)
    expect(report.totalFixesSkipped).toBe(1)
    expect(report.fileReports).toHaveLength(2)
    expect(report.fileReports[0]?.fixesApplied).toBe(2)
    expect(report.fileReports[1]?.fixesApplied).toBe(0)
    expect(report.fileReports[1]?.fixesSkipped).toBe(1)
  })

  it('handles dry-run mode across multiple files', () => {
    const sourceFile1 = createMockSourceFile('const x = 1;')
    const sourceFile2 = createMockSourceFile('const y = 2;')

    const violation1 = createMockViolation({
      filePath: '/test/file1.ts',
      range: { end: { column: 5, line: 1 }, start: { column: 0, line: 1 } },
      ruleId: 'rule-a',
    })
    const violation2 = createMockViolation({
      filePath: '/test/file2.ts',
      range: { end: { column: 5, line: 1 }, start: { column: 0, line: 1 } },
      ruleId: 'rule-b',
    })

    const rules = new Map<string, RuleWithFix>([
      [
        'rule-a',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 5, newText: 'let', oldText: 'const', start: 0 }],
          }),
          id: 'rule-a',
          priority: 1,
        },
      ],
      [
        'rule-b',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 5, newText: 'let', oldText: 'const', start: 0 }],
          }),
          id: 'rule-b',
          priority: 1,
        },
      ],
    ])

    const filesWithViolations = [
      { sourceFile: sourceFile1, violations: [violation1] },
      { sourceFile: sourceFile2, violations: [violation2] },
    ]

    const report = applyFixesToFiles(filesWithViolations, rules, true)

    expect(report.totalFixesApplied).toBe(2)
    expect(sourceFile1.replaceText).not.toHaveBeenCalled()
    expect(sourceFile2.replaceText).not.toHaveBeenCalled()
  })
})
