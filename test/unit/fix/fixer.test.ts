import { describe, expect, it, vi } from 'vitest'
import type { SourceFile } from 'ts-morph'
import type { RuleViolation } from '../../../src/ast/visitor.js'
import { createFixContext } from '../../../src/fix/context.js'
import { applyFixesToFiles, applyFixesToFile, type RuleWithFix } from '../../../src/fix/fixer.js'
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

describe('Fix Context - expanded', () => {
  it('context has getNodeByRange function', () => {
    const sourceFile = createMockSourceFile('const x = 1;')
    const violation = createMockViolation()
    const context = createFixContext(sourceFile, violation)
    expect(typeof context.getNodeByRange).toBe('function')
  })

  it('context has getNodeByPosition function', () => {
    const sourceFile = createMockSourceFile('const x = 1;')
    const violation = createMockViolation()
    const context = createFixContext(sourceFile, violation)
    expect(typeof context.getNodeByPosition).toBe('function')
  })

  it('context violation matches input violation', () => {
    const sourceFile = createMockSourceFile('let x = 1;')
    const violation = createMockViolation({ ruleId: 'my-rule', message: 'Use const' })
    const context = createFixContext(sourceFile, violation)
    expect(context.violation.ruleId).toBe('my-rule')
    expect(context.violation.message).toBe('Use const')
  })

  it('context sourceFile matches input sourceFile', () => {
    const sourceFile = createMockSourceFile('const y = 2;')
    const violation = createMockViolation()
    const context = createFixContext(sourceFile, violation)
    expect(context.sourceFile).toBe(sourceFile)
    expect(context.sourceFile.getFullText()).toBe('const y = 2;')
  })

  it('getNodeByPosition returns a function', () => {
    const sourceFile = createMockSourceFile('const x = 1;')
    const violation = createMockViolation()
    const context = createFixContext(sourceFile, violation)
    expect(typeof context.getNodeByPosition).toBe('function')
  })

  it('getNodeByRange returns a function', () => {
    const sourceFile = createMockSourceFile('const x = 1;')
    const violation = createMockViolation()
    const context = createFixContext(sourceFile, violation)
    expect(typeof context.getNodeByRange).toBe('function')
  })

  it('context getNodeByRange is callable', () => {
    const sourceFile = createMockSourceFile('const x = 1;')
    const violation = createMockViolation()
    const context = createFixContext(sourceFile, violation)
    expect(typeof context.getNodeByRange).toBe('function')
  })

  it('different violations produce different contexts', () => {
    const sourceFile = createMockSourceFile('const x = 1;')
    const v1 = createMockViolation({ ruleId: 'rule-1' })
    const v2 = createMockViolation({ ruleId: 'rule-2' })
    const ctx1 = createFixContext(sourceFile, v1)
    const ctx2 = createFixContext(sourceFile, v2)
    expect(ctx1.violation.ruleId).toBe('rule-1')
    expect(ctx2.violation.ruleId).toBe('rule-2')
  })

  it('context with multiline source file', () => {
    const sourceFile = createMockSourceFile('line1\nline2\nline3')
    const violation = createMockViolation()
    const context = createFixContext(sourceFile, violation)
    expect(context.sourceFile.getFullText()).toBe('line1\nline2\nline3')
  })

  it('context with empty source file', () => {
    const sourceFile = createMockSourceFile('')
    const violation = createMockViolation()
    const context = createFixContext(sourceFile, violation)
    expect(context.sourceFile.getFullText()).toBe('')
  })
})

describe('applyFixesToFile - report structure', () => {
  it('returns filePath from source file', () => {
    const sf = createMockSourceFile('x')
    const report = applyFixesToFile(sf, [], new Map(), false)
    expect(report.filePath).toBe('/test/file.ts')
  })

  it('returns empty conflicts array when no conflicts', () => {
    const sf = createMockSourceFile('x')
    const report = applyFixesToFile(sf, [], new Map(), false)
    expect(report.conflicts).toEqual([])
  })

  it('returns empty changes array when no changes', () => {
    const sf = createMockSourceFile('x')
    const report = applyFixesToFile(sf, [], new Map(), false)
    expect(report.changes).toEqual([])
  })

  it('fixesApplied is 0 for empty violations', () => {
    const sf = createMockSourceFile('x')
    const report = applyFixesToFile(sf, [], new Map(), false)
    expect(report.fixesApplied).toBe(0)
  })

  it('fixesSkipped is 0 for empty violations', () => {
    const sf = createMockSourceFile('x')
    const report = applyFixesToFile(sf, [], new Map(), false)
    expect(report.fixesSkipped).toBe(0)
  })

  it('report contains all expected keys', () => {
    const sf = createMockSourceFile('x')
    const report = applyFixesToFile(sf, [], new Map(), false)
    expect(report).toHaveProperty('changes')
    expect(report).toHaveProperty('conflicts')
    expect(report).toHaveProperty('filePath')
    expect(report).toHaveProperty('fixesApplied')
    expect(report).toHaveProperty('fixesSkipped')
  })
})

describe('applyFixesToFile - no matching rules', () => {
  it('single violation with no matching rule produces no fixes', () => {
    const sf = createMockSourceFile('const x = 1;')
    const v = createMockViolation({ ruleId: 'missing-rule' })
    const report = applyFixesToFile(sf, [v], new Map(), false)
    expect(report.fixesApplied).toBe(0)
    expect(report.fixesSkipped).toBe(0)
  })

  it('multiple violations with no matching rules produces no fixes', () => {
    const sf = createMockSourceFile('const x = 1;')
    const v1 = createMockViolation({ ruleId: 'rule-x' })
    const v2 = createMockViolation({ ruleId: 'rule-y' })
    const v3 = createMockViolation({ ruleId: 'rule-z' })
    const report = applyFixesToFile(sf, [v1, v2, v3], new Map(), false)
    expect(report.fixesApplied).toBe(0)
    expect(report.fixesSkipped).toBe(0)
    expect(report.changes).toHaveLength(0)
  })

  it('violation with matching rule applies fix while unmatched does not', () => {
    const sf = createMockSourceFile('const x = 1;')
    const v1 = createMockViolation({
      ruleId: 'has-fix',
      range: { start: { column: 0, line: 1 }, end: { column: 5, line: 1 } },
    })
    const v2 = createMockViolation({ ruleId: 'no-fix' })
    const rules = new Map<string, RuleWithFix>([
      [
        'has-fix',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 5, newText: 'let', oldText: 'const' }],
          }),
          id: 'has-fix',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v1, v2], rules, false)
    expect(report.fixesApplied).toBe(1)
  })

  it('all violations from same unmatched rule', () => {
    const sf = createMockSourceFile('aaa bbb ccc')
    const vs = ['v1', 'v2', 'v3'].map((id, i) =>
      createMockViolation({
        ruleId: 'unknown',
        range: { start: { column: i * 4, line: 1 }, end: { column: i * 4 + 3, line: 1 } },
      }),
    )
    const report = applyFixesToFile(sf, vs, new Map(), false)
    expect(report.fixesApplied).toBe(0)
  })
})

describe('applyFixesToFile - conflict detection', () => {
  it('adjacent ranges touching at boundary do not conflict', () => {
    const sf = createMockSourceFile('abcdefghij')
    const v1 = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 1, line: 1 }, end: { column: 6, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'r2',
      range: { start: { column: 6, line: 1 }, end: { column: 11, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 5, newText: 'AAAAA', oldText: 'abcde' }],
          }),
          id: 'r1',
          priority: 1,
        },
      ],
      [
        'r2',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 5, end: 10, newText: 'BBBBB', oldText: 'fghij' }],
          }),
          id: 'r2',
          priority: 2,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v1, v2], rules, false)
    expect(report.conflicts).toHaveLength(0)
    expect(report.fixesApplied).toBe(2)
  })

  it('adjacent ranges in reverse order do not conflict', () => {
    const sf = createMockSourceFile('abcdefghij')
    const v1 = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 6, line: 1 }, end: { column: 11, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'r2',
      range: { start: { column: 1, line: 1 }, end: { column: 6, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 5, end: 10, newText: 'BBBBB', oldText: 'fghij' }],
          }),
          id: 'r1',
          priority: 1,
        },
      ],
      [
        'r2',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 5, newText: 'AAAAA', oldText: 'abcde' }],
          }),
          id: 'r2',
          priority: 2,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v1, v2], rules, false)
    expect(report.conflicts).toHaveLength(0)
    expect(report.fixesApplied).toBe(2)
  })

  it('detects conflict when ranges overlap by one character', () => {
    const sf = createMockSourceFile('abcdef')
    const v1 = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 0, line: 1 }, end: { column: 4, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'r2',
      range: { start: { column: 3, line: 1 }, end: { column: 6, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 4, newText: 'XX', oldText: 'abcd' }],
          }),
          id: 'r1',
          priority: 1,
        },
      ],
      [
        'r2',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 3, end: 6, newText: 'YY', oldText: 'def' }],
          }),
          id: 'r2',
          priority: 2,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v1, v2], rules, false)
    expect(report.conflicts).toHaveLength(1)
  })

  it('no conflict when ranges are exactly adjacent (end == start)', () => {
    const sf = createMockSourceFile('abcde')
    const v1 = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 0, line: 1 }, end: { column: 3, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'r2',
      range: { start: { column: 3, line: 1 }, end: { column: 5, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 3, newText: 'ABC', oldText: 'abc' }],
          }),
          id: 'r1',
          priority: 1,
        },
      ],
      [
        'r2',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 3, end: 5, newText: 'DE', oldText: 'de' }],
          }),
          id: 'r2',
          priority: 2,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v1, v2], rules, false)
    expect(report.conflicts).toHaveLength(0)
    expect(report.fixesApplied).toBe(2)
  })

  it('detects conflict when new range surrounds applied range', () => {
    const sf = createMockSourceFile('abcdefghij')
    const v1 = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 3, line: 1 }, end: { column: 6, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'r2',
      range: { start: { column: 0, line: 1 }, end: { column: 10, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 3, end: 6, newText: 'XXX', oldText: 'def' }],
          }),
          id: 'r1',
          priority: 1,
        },
      ],
      [
        'r2',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 10, newText: 'ALL', oldText: 'abcdefghij' }],
          }),
          id: 'r2',
          priority: 2,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v1, v2], rules, false)
    expect(report.conflicts).toHaveLength(1)
    expect(report.conflicts[0]?.ruleId).toBe('r2')
  })

  it('accumulates multiple conflicts from different rules', () => {
    const sf = createMockSourceFile('aaa bbb ccc ddd')
    const v1 = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 0, line: 1 }, end: { column: 7, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'r2',
      range: { start: { column: 2, line: 1 }, end: { column: 5, line: 1 } },
    })
    const v3 = createMockViolation({
      ruleId: 'r3',
      range: { start: { column: 3, line: 1 }, end: { column: 6, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 7, newText: 'X', oldText: 'aaa bbb' }],
          }),
          id: 'r1',
          priority: 1,
        },
      ],
      [
        'r2',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 2, end: 5, newText: 'Y', oldText: 'a b' }],
          }),
          id: 'r2',
          priority: 2,
        },
      ],
      [
        'r3',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 3, end: 6, newText: 'Z', oldText: ' bb' }],
          }),
          id: 'r3',
          priority: 3,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v1, v2, v3], rules, false)
    expect(report.conflicts).toHaveLength(2)
    expect(report.fixesApplied).toBe(1)
    expect(report.fixesSkipped).toBe(2)
  })

  it('conflict reason is "Overlapping fix range"', () => {
    const sf = createMockSourceFile('abcdef')
    const v1 = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 0, line: 1 }, end: { column: 4, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'r2',
      range: { start: { column: 2, line: 1 }, end: { column: 6, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 4, newText: 'XX', oldText: 'abcd' }],
          }),
          id: 'r1',
          priority: 1,
        },
      ],
      [
        'r2',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 2, end: 6, newText: 'YY', oldText: 'cdef' }],
          }),
          id: 'r2',
          priority: 2,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v1, v2], rules, false)
    expect(report.conflicts[0]?.reason).toBe('Overlapping fix range')
  })

  it('conflict references correct conflicting rule', () => {
    const sf = createMockSourceFile('abcdef')
    const v1 = createMockViolation({
      ruleId: 'alpha',
      range: { start: { column: 0, line: 1 }, end: { column: 4, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'beta',
      range: { start: { column: 2, line: 1 }, end: { column: 6, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'alpha',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 4, newText: 'XX', oldText: 'abcd' }],
          }),
          id: 'alpha',
          priority: 1,
        },
      ],
      [
        'beta',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 2, end: 6, newText: 'YY', oldText: 'cdef' }],
          }),
          id: 'beta',
          priority: 2,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v1, v2], rules, false)
    expect(report.conflicts[0]?.conflictingRule).toBe('alpha')
    expect(report.conflicts[0]?.ruleId).toBe('beta')
  })

  it('conflict from fix result takes precedence over range conflict', () => {
    const sf = createMockSourceFile('abcdef')
    const v1 = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 0, line: 1 }, end: { column: 3, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'r2',
      range: { start: { column: 3, line: 1 }, end: { column: 6, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 3, newText: 'ABC', oldText: 'abc' }],
          }),
          id: 'r1',
          priority: 1,
        },
      ],
      [
        'r2',
        {
          fix: (): FixResult => ({
            applied: false,
            changes: [],
            conflict: { conflictingRule: 'r1', reason: 'Semantic conflict' },
          }),
          id: 'r2',
          priority: 2,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v1, v2], rules, false)
    expect(report.fixesApplied).toBe(1)
    expect(report.fixesSkipped).toBe(1)
    expect(report.conflicts[0]?.reason).toBe('Semantic conflict')
  })

  it('three overlapping ranges only first is applied', () => {
    const sf = createMockSourceFile('aaa bbb ccc')
    const v1 = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 0, line: 1 }, end: { column: 11, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'r2',
      range: { start: { column: 0, line: 1 }, end: { column: 3, line: 1 } },
    })
    const v3 = createMockViolation({
      ruleId: 'r3',
      range: { start: { column: 4, line: 1 }, end: { column: 7, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 11, newText: 'all', oldText: 'aaa bbb ccc' }],
          }),
          id: 'r1',
          priority: 1,
        },
      ],
      [
        'r2',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 3, newText: 'AAA', oldText: 'aaa' }],
          }),
          id: 'r2',
          priority: 2,
        },
      ],
      [
        'r3',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 4, end: 7, newText: 'BBB', oldText: 'bbb' }],
          }),
          id: 'r3',
          priority: 3,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v1, v2, v3], rules, false)
    expect(report.fixesApplied).toBe(1)
    expect(report.fixesSkipped).toBe(2)
    expect(report.conflicts).toHaveLength(2)
  })
})

describe('applyFixesToFile - priority ordering', () => {
  it('lower priority number is processed first', () => {
    const sf = createMockSourceFile('a b')
    const order: string[] = []
    const v1 = createMockViolation({
      ruleId: 'low',
      range: { start: { column: 0, line: 1 }, end: { column: 1, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'high',
      range: { start: { column: 2, line: 1 }, end: { column: 3, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'low',
        {
          fix: (): FixResult => {
            order.push('low')
            return { applied: true, changes: [{ start: 0, end: 1, newText: 'A', oldText: 'a' }] }
          },
          id: 'low',
          priority: 100,
        },
      ],
      [
        'high',
        {
          fix: (): FixResult => {
            order.push('high')
            return { applied: true, changes: [{ start: 2, end: 3, newText: 'B', oldText: 'b' }] }
          },
          id: 'high',
          priority: 1,
        },
      ],
    ])
    applyFixesToFile(sf, [v1, v2], rules, false)
    expect(order).toEqual(['high', 'low'])
  })

  it('priority 0 is processed before priority 1', () => {
    const sf = createMockSourceFile('a b')
    const order: string[] = []
    const v1 = createMockViolation({
      ruleId: 'p0',
      range: { start: { column: 0, line: 1 }, end: { column: 1, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'p1',
      range: { start: { column: 2, line: 1 }, end: { column: 3, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'p0',
        {
          fix: (): FixResult => {
            order.push('p0')
            return { applied: true, changes: [{ start: 0, end: 1, newText: 'A', oldText: 'a' }] }
          },
          id: 'p0',
          priority: 0,
        },
      ],
      [
        'p1',
        {
          fix: (): FixResult => {
            order.push('p1')
            return { applied: true, changes: [{ start: 2, end: 3, newText: 'B', oldText: 'b' }] }
          },
          id: 'p1',
          priority: 1,
        },
      ],
    ])
    applyFixesToFile(sf, [v1, v2], rules, false)
    expect(order).toEqual(['p0', 'p1'])
  })

  it('negative priority is processed first', () => {
    const sf = createMockSourceFile('a b')
    const order: string[] = []
    const v1 = createMockViolation({
      ruleId: 'neg',
      range: { start: { column: 0, line: 1 }, end: { column: 1, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'pos',
      range: { start: { column: 2, line: 1 }, end: { column: 3, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'neg',
        {
          fix: (): FixResult => {
            order.push('neg')
            return { applied: true, changes: [{ start: 0, end: 1, newText: 'A', oldText: 'a' }] }
          },
          id: 'neg',
          priority: -5,
        },
      ],
      [
        'pos',
        {
          fix: (): FixResult => {
            order.push('pos')
            return { applied: true, changes: [{ start: 2, end: 3, newText: 'B', oldText: 'b' }] }
          },
          id: 'pos',
          priority: 5,
        },
      ],
    ])
    applyFixesToFile(sf, [v1, v2], rules, false)
    expect(order).toEqual(['neg', 'pos'])
  })

  it('many priorities sorted correctly', () => {
    const sf = createMockSourceFile('a b c d e')
    const order: string[] = []
    const rules = new Map<string, RuleWithFix>()
    const vs: RuleViolation[] = []
    for (let i = 0; i < 5; i++) {
      const id = `rule-${i}`
      const p = 5 - i
      rules.set(id, {
        fix: (): FixResult => {
          order.push(id)
          return {
            applied: true,
            changes: [{ start: i * 2, end: i * 2 + 1, newText: 'X', oldText: 'x' }],
          }
        },
        id,
        priority: p,
      })
      vs.push(
        createMockViolation({
          ruleId: id,
          range: { start: { column: i * 2, line: 1 }, end: { column: i * 2 + 1, line: 1 } },
        }),
      )
    }
    applyFixesToFile(sf, vs, rules, false)
    expect(order).toEqual(['rule-4', 'rule-3', 'rule-2', 'rule-1', 'rule-0'])
  })

  it('same priority keeps original order', () => {
    const sf = createMockSourceFile('a b c')
    const order: string[] = []
    const vs = ['x', 'y', 'z'].map((id, i) =>
      createMockViolation({
        ruleId: id,
        range: { start: { column: i * 2, line: 1 }, end: { column: i * 2 + 1, line: 1 } },
      }),
    )
    const rules = new Map<string, RuleWithFix>([
      [
        'x',
        {
          fix: (): FixResult => {
            order.push('x')
            return { applied: true, changes: [{ start: 0, end: 1, newText: 'X', oldText: 'a' }] }
          },
          id: 'x',
          priority: 1,
        },
      ],
      [
        'y',
        {
          fix: (): FixResult => {
            order.push('y')
            return { applied: true, changes: [{ start: 2, end: 3, newText: 'Y', oldText: 'b' }] }
          },
          id: 'y',
          priority: 1,
        },
      ],
      [
        'z',
        {
          fix: (): FixResult => {
            order.push('z')
            return { applied: true, changes: [{ start: 4, end: 5, newText: 'Z', oldText: 'c' }] }
          },
          id: 'z',
          priority: 1,
        },
      ],
    ])
    applyFixesToFile(sf, vs, rules, false)
    expect(order).toEqual(['x', 'y', 'z'])
  })

  it('high priority fix blocks overlapping low priority fix', () => {
    const sf = createMockSourceFile('abcdef')
    const vHigh = createMockViolation({
      ruleId: 'high',
      range: { start: { column: 0, line: 1 }, end: { column: 6, line: 1 } },
    })
    const vLow = createMockViolation({
      ruleId: 'low',
      range: { start: { column: 2, line: 1 }, end: { column: 4, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'high',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 6, newText: 'ALL', oldText: 'abcdef' }],
          }),
          id: 'high',
          priority: 1,
        },
      ],
      [
        'low',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 2, end: 4, newText: 'XX', oldText: 'cd' }],
          }),
          id: 'low',
          priority: 10,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [vLow, vHigh], rules, false)
    expect(report.fixesApplied).toBe(1)
    expect(report.conflicts).toHaveLength(1)
    expect(report.conflicts[0]?.ruleId).toBe('low')
  })
})

describe('applyFixesToFile - dry-run mode', () => {
  it('dry-run reports fix but does not call replaceText', () => {
    const sf = createMockSourceFile('const x = 1;')
    const v = createMockViolation({
      range: { start: { column: 0, line: 1 }, end: { column: 5, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 5, newText: 'let', oldText: 'const' }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v], rules, true)
    expect(report.fixesApplied).toBe(1)
    expect(sf.replaceText).not.toHaveBeenCalled()
  })

  it('dry-run=false calls replaceText', () => {
    const sf = createMockSourceFile('const x = 1;')
    const v = createMockViolation({
      range: { start: { column: 0, line: 1 }, end: { column: 5, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 5, newText: 'let', oldText: 'const' }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    applyFixesToFile(sf, [v], rules, false)
    expect(sf.replaceText).toHaveBeenCalled()
  })

  it('dry-run with no changes does not call replaceText', () => {
    const sf = createMockSourceFile('const x = 1;')
    const v = createMockViolation({
      range: { start: { column: 0, line: 1 }, end: { column: 5, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'test-rule',
        { fix: (): FixResult => ({ applied: true, changes: [] }), id: 'test-rule', priority: 1 },
      ],
    ])
    applyFixesToFile(sf, [v], rules, true)
    expect(sf.replaceText).not.toHaveBeenCalled()
  })

  it('dry-run with null fix result does not call replaceText', () => {
    const sf = createMockSourceFile('const x = 1;')
    const v = createMockViolation()
    const rules = new Map<string, RuleWithFix>([
      ['test-rule', { fix: (): FixResult | null => null, id: 'test-rule', priority: 1 }],
    ])
    applyFixesToFile(sf, [v], rules, true)
    expect(sf.replaceText).not.toHaveBeenCalled()
  })

  it('dry-run with multiple fixes reports all', () => {
    const sf = createMockSourceFile('a b c')
    const v1 = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 0, line: 1 }, end: { column: 1, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'r2',
      range: { start: { column: 2, line: 1 }, end: { column: 3, line: 1 } },
    })
    const v3 = createMockViolation({
      ruleId: 'r3',
      range: { start: { column: 4, line: 1 }, end: { column: 5, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 1, newText: 'A', oldText: 'a' }],
          }),
          id: 'r1',
          priority: 1,
        },
      ],
      [
        'r2',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 2, end: 3, newText: 'B', oldText: 'b' }],
          }),
          id: 'r2',
          priority: 1,
        },
      ],
      [
        'r3',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 4, end: 5, newText: 'C', oldText: 'c' }],
          }),
          id: 'r3',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v1, v2, v3], rules, true)
    expect(report.fixesApplied).toBe(3)
    expect(report.changes).toHaveLength(3)
    expect(sf.replaceText).not.toHaveBeenCalled()
  })

  it('default dryRun parameter is false', () => {
    const sf = createMockSourceFile('const x = 1;')
    const v = createMockViolation({
      range: { start: { column: 0, line: 1 }, end: { column: 5, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 5, newText: 'let', oldText: 'const' }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    applyFixesToFile(sf, [v], rules)
    expect(sf.replaceText).toHaveBeenCalled()
  })
})

describe('applyFixesToFile - fix result types', () => {
  it('fix returning applied=true with changes is counted', () => {
    const sf = createMockSourceFile('x')
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 0, line: 1 }, end: { column: 1, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 1, newText: 'y', oldText: 'x' }],
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.fixesApplied).toBe(1)
  })

  it('fix returning applied=false with no conflict is silently skipped', () => {
    const sf = createMockSourceFile('x')
    const v = createMockViolation({
      range: { start: { column: 0, line: 1 }, end: { column: 1, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      ['r', { fix: (): FixResult => ({ applied: false, changes: [] }), id: 'r', priority: 1 }],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.fixesApplied).toBe(0)
    expect(report.fixesSkipped).toBe(0)
  })

  it('fix returning applied=false with conflict increments fixesSkipped', () => {
    const sf = createMockSourceFile('x')
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 0, line: 1 }, end: { column: 1, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: false,
            changes: [],
            conflict: { conflictingRule: 'other', reason: 'test' },
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.fixesSkipped).toBe(1)
  })

  it('fix returning null does not increment counters', () => {
    const sf = createMockSourceFile('x')
    const v = createMockViolation({
      range: { start: { column: 0, line: 1 }, end: { column: 1, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      ['r', { fix: (): FixResult | null => null, id: 'r', priority: 1 }],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.fixesApplied).toBe(0)
    expect(report.fixesSkipped).toBe(0)
    expect(report.changes).toHaveLength(0)
    expect(report.conflicts).toHaveLength(0)
  })

  it('fix returning applied=true with empty changes counts as applied', () => {
    const sf = createMockSourceFile('x')
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 0, line: 1 }, end: { column: 1, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      ['r', { fix: (): FixResult => ({ applied: true, changes: [] }), id: 'r', priority: 1 }],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.fixesApplied).toBe(1)
    expect(report.changes).toHaveLength(0)
  })

  it('fix with multiple changes reports all changes', () => {
    const sf = createMockSourceFile('abc')
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 0, line: 1 }, end: { column: 3, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [
              { start: 0, end: 1, newText: 'X', oldText: 'a' },
              { start: 1, end: 2, newText: 'Y', oldText: 'b' },
              { start: 2, end: 3, newText: 'Z', oldText: 'c' },
            ],
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.fixesApplied).toBe(1)
    expect(report.changes).toHaveLength(3)
  })
})

describe('applyFixesToFile - multiline files', () => {
  it('applies fixes on different lines', () => {
    const sf = createMockSourceFile('line1\nline2\nline3')
    const v1 = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 0, line: 1 }, end: { column: 5, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'r2',
      range: { start: { column: 0, line: 3 }, end: { column: 5, line: 3 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 5, newText: 'LINE1', oldText: 'line1' }],
          }),
          id: 'r1',
          priority: 1,
        },
      ],
      [
        'r2',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 12, end: 17, newText: 'LINE3', oldText: 'line3' }],
          }),
          id: 'r2',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v1, v2], rules, false)
    expect(report.fixesApplied).toBe(2)
  })

  it('detects conflict across multiple lines', () => {
    const sf = createMockSourceFile('abcdef\nghijkl')
    const v1 = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 0, line: 1 }, end: { column: 3, line: 2 } },
    })
    const v2 = createMockViolation({
      ruleId: 'r2',
      range: { start: { column: 3, line: 1 }, end: { column: 3, line: 2 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 9, newText: 'ALL', oldText: 'abcdef\nghi' }],
          }),
          id: 'r1',
          priority: 1,
        },
      ],
      [
        'r2',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 3, end: 9, newText: 'XX', oldText: 'def\nghi' }],
          }),
          id: 'r2',
          priority: 2,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v1, v2], rules, false)
    expect(report.conflicts).toHaveLength(1)
  })

  it('position calculation for line 2 column 1', () => {
    const sf = createMockSourceFile('ab\ncd')
    const v = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 1, line: 2 }, end: { column: 3, line: 2 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 4, end: 5, newText: 'X', oldText: 'd' }],
          }),
          id: 'r1',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.fixesApplied).toBe(1)
  })

  it('handles empty lines in source', () => {
    const sf = createMockSourceFile('a\n\n\nd')
    const v1 = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 0, line: 1 }, end: { column: 1, line: 1 } },
    })
    const v4 = createMockViolation({
      ruleId: 'r4',
      range: { start: { column: 0, line: 4 }, end: { column: 1, line: 4 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 1, newText: 'A', oldText: 'a' }],
          }),
          id: 'r1',
          priority: 1,
        },
      ],
      [
        'r4',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 5, end: 6, newText: 'D', oldText: 'd' }],
          }),
          id: 'r4',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v1, v4], rules, false)
    expect(report.fixesApplied).toBe(2)
  })

  it('handles long lines', () => {
    const longLine = 'x'.repeat(1000)
    const sf = createMockSourceFile(longLine)
    const v = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 0, line: 1 }, end: { column: 10, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 10, newText: 'YYYYYYYYYY', oldText: 'xxxxxxxxxx' }],
          }),
          id: 'r1',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.fixesApplied).toBe(1)
  })

  it('handles single character file', () => {
    const sf = createMockSourceFile('x')
    const v = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 0, line: 1 }, end: { column: 1, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 1, newText: 'y', oldText: 'x' }],
          }),
          id: 'r1',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.fixesApplied).toBe(1)
  })
})

describe('applyFixesToFile - text change application order', () => {
  it('replaceText is called for each change when not dry-run', () => {
    const sf = createMockSourceFile('abcdef')
    const v = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 0, line: 1 }, end: { column: 6, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [
              { start: 0, end: 2, newText: 'AB', oldText: 'ab' },
              { start: 4, end: 6, newText: 'EF', oldText: 'ef' },
            ],
          }),
          id: 'r1',
          priority: 1,
        },
      ],
    ])
    applyFixesToFile(sf, [v], rules, false)
    expect(sf.replaceText).toHaveBeenCalledTimes(2)
  })

  it('changes are applied in reverse order (end to start)', () => {
    const sf = createMockSourceFile('abcdef')
    const v = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 0, line: 1 }, end: { column: 6, line: 1 } },
    })
    const calls: Array<[number, number]> = []
    sf.replaceText = vi.fn((range: [number, number]) => {
      calls.push(range)
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [
              { start: 0, end: 2, newText: 'AB', oldText: 'ab' },
              { start: 2, end: 4, newText: 'CD', oldText: 'cd' },
              { start: 4, end: 6, newText: 'EF', oldText: 'ef' },
            ],
          }),
          id: 'r1',
          priority: 1,
        },
      ],
    ])
    applyFixesToFile(sf, [v], rules, false)
    expect(calls[0]![0]).toBe(4)
    expect(calls[1]![0]).toBe(2)
    expect(calls[2]![0]).toBe(0)
  })

  it('no replaceText call when all fix results return null', () => {
    const sf = createMockSourceFile('abc')
    const v = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 0, line: 1 }, end: { column: 3, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      ['r1', { fix: (): FixResult | null => null, id: 'r1', priority: 1 }],
    ])
    applyFixesToFile(sf, [v], rules, false)
    expect(sf.replaceText).not.toHaveBeenCalled()
  })
})

describe('applyFixesToFile - edge cases', () => {
  it('empty source file with violations', () => {
    const sf = createMockSourceFile('')
    const v = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 0, line: 1 }, end: { column: 0, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 0, newText: 'x', oldText: '' }],
          }),
          id: 'r1',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.fixesApplied).toBe(1)
  })

  it('violation with suggestion field', () => {
    const sf = createMockSourceFile('x')
    const v = createMockViolation({
      suggestion: 'Use y instead',
      range: { start: { column: 0, line: 1 }, end: { column: 1, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 1, newText: 'y', oldText: 'x' }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.fixesApplied).toBe(1)
  })

  it('violation with error severity', () => {
    const sf = createMockSourceFile('x')
    const v = createMockViolation({
      severity: 'error',
      range: { start: { column: 0, line: 1 }, end: { column: 1, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 1, newText: 'y', oldText: 'x' }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.fixesApplied).toBe(1)
  })

  it('violation with info severity', () => {
    const sf = createMockSourceFile('x')
    const v = createMockViolation({
      severity: 'info',
      range: { start: { column: 0, line: 1 }, end: { column: 1, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 1, newText: 'y', oldText: 'x' }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.fixesApplied).toBe(1)
  })

  it('large number of non-conflicting fixes', () => {
    const parts = Array.from({ length: 50 }, (_, i) => `v${i}`)
    const sf = createMockSourceFile(parts.join(' '))
    const vs = parts.map((p, i) =>
      createMockViolation({
        ruleId: `r${i}`,
        range: { start: { column: i * 3, line: 1 }, end: { column: i * 3 + 2, line: 1 } },
      }),
    )
    const rules = new Map<string, RuleWithFix>(
      parts.map((_, i) => [
        `r${i}`,
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: i * 3, end: i * 3 + 2, newText: `V${i}`, oldText: `v${i}` }],
          }),
          id: `r${i}`,
          priority: i + 1,
        },
      ]),
    )
    const report = applyFixesToFile(sf, vs, rules, false)
    expect(report.fixesApplied).toBe(50)
  })

  it('fix function receives correct context', () => {
    const sf = createMockSourceFile('const x = 1;')
    const v = createMockViolation({ ruleId: 'ctx-test' })
    let receivedCtx: { sourceFile: SourceFile; violation: RuleViolation } | null = null
    const rules = new Map<string, RuleWithFix>([
      [
        'ctx-test',
        {
          fix: (ctx): FixResult => {
            receivedCtx = ctx
            return {
              applied: true,
              changes: [{ start: 0, end: 5, newText: 'let', oldText: 'const' }],
            }
          },
          id: 'ctx-test',
          priority: 1,
        },
      ],
    ])
    applyFixesToFile(sf, [v], rules, false)
    expect(receivedCtx).not.toBeNull()
    expect(receivedCtx!.sourceFile).toBe(sf)
    expect(receivedCtx!.violation).toBe(v)
  })

  it('fix function receives getNodeByRange', () => {
    const sf = createMockSourceFile('const x = 1;')
    const v = createMockViolation({ ruleId: 'gbr-test' })
    let getNodeByRangeFn: unknown = null
    const rules = new Map<string, RuleWithFix>([
      [
        'gbr-test',
        {
          fix: (ctx): FixResult => {
            getNodeByRangeFn = ctx.getNodeByRange
            return {
              applied: true,
              changes: [{ start: 0, end: 5, newText: 'let', oldText: 'const' }],
            }
          },
          id: 'gbr-test',
          priority: 1,
        },
      ],
    ])
    applyFixesToFile(sf, [v], rules, false)
    expect(typeof getNodeByRangeFn).toBe('function')
  })

  it('duplicate rule IDs in violations map correctly', () => {
    const sf = createMockSourceFile('aaa')
    const v1 = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 0, line: 1 }, end: { column: 3, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 0, line: 1 }, end: { column: 3, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 3, newText: 'bbb', oldText: 'aaa' }],
          }),
          id: 'r1',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v1, v2], rules, false)
    expect(report.fixesApplied).toBe(1)
    expect(report.fixesSkipped).toBe(1)
  })

  it('fix result with conflict and empty changes', () => {
    const sf = createMockSourceFile('x')
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 0, line: 1 }, end: { column: 1, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: false,
            changes: [],
            conflict: { conflictingRule: 'x', reason: 'blocked' },
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.conflicts).toHaveLength(1)
    expect(report.conflicts[0]?.conflictingRule).toBe('x')
    expect(report.conflicts[0]?.reason).toBe('blocked')
  })
})

describe('applyFixesToFiles - expanded', () => {
  it('handles empty filesWithViolations array', () => {
    const report = applyFixesToFiles([], new Map(), false)
    expect(report.filesProcessed).toBe(0)
    expect(report.totalFixesApplied).toBe(0)
    expect(report.totalFixesSkipped).toBe(0)
    expect(report.fileReports).toHaveLength(0)
  })

  it('handles single file with no violations', () => {
    const sf = createMockSourceFile('x')
    const report = applyFixesToFiles([{ sourceFile: sf, violations: [] }], new Map(), false)
    expect(report.filesProcessed).toBe(1)
    expect(report.totalFixesApplied).toBe(0)
  })

  it('aggregates fixes across three files', () => {
    const sf1 = createMockSourceFile('a')
    const sf2 = createMockSourceFile('b')
    const sf3 = createMockSourceFile('c')
    const v1 = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 0, line: 1 }, end: { column: 1, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 0, line: 1 }, end: { column: 1, line: 1 } },
    })
    const v3 = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 0, line: 1 }, end: { column: 1, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 1, newText: 'X', oldText: 'x' }],
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFiles(
      [
        { sourceFile: sf1, violations: [v1] },
        { sourceFile: sf2, violations: [v2] },
        { sourceFile: sf3, violations: [v3] },
      ],
      rules,
      false,
    )
    expect(report.filesProcessed).toBe(3)
    expect(report.totalFixesApplied).toBe(3)
    expect(report.fileReports).toHaveLength(3)
  })

  it('fileReports preserve file order', () => {
    const sf1 = createMockSourceFile('a')
    const sf2 = createMockSourceFile('b')
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 1, newText: 'X', oldText: 'a' }],
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    const v1 = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 0, line: 1 }, end: { column: 1, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 0, line: 1 }, end: { column: 1, line: 1 } },
    })
    const report = applyFixesToFiles(
      [
        { sourceFile: sf1, violations: [v1] },
        { sourceFile: sf2, violations: [v2] },
      ],
      rules,
      false,
    )
    expect(report.fileReports[0]?.filePath).toBe('/test/file.ts')
    expect(report.fileReports[1]?.filePath).toBe('/test/file.ts')
  })

  it('each file report has independent conflicts', () => {
    const sf1 = createMockSourceFile('abcdef')
    const sf2 = createMockSourceFile('ghijkl')
    const v1 = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 0, line: 1 }, end: { column: 3, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'r2',
      range: { start: { column: 1, line: 1 }, end: { column: 4, line: 1 } },
    })
    const v3 = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 0, line: 1 }, end: { column: 3, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 3, newText: 'ABC', oldText: 'abc' }],
          }),
          id: 'r1',
          priority: 1,
        },
      ],
      [
        'r2',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 1, end: 4, newText: 'HIJ', oldText: 'bcd' }],
          }),
          id: 'r2',
          priority: 2,
        },
      ],
    ])
    const report = applyFixesToFiles(
      [
        { sourceFile: sf1, violations: [v1, v2] },
        { sourceFile: sf2, violations: [v3] },
      ],
      rules,
      false,
    )
    expect(report.fileReports[0]?.conflicts).toHaveLength(1)
    expect(report.fileReports[1]?.conflicts).toHaveLength(0)
  })

  it('dry-run mode prevents replaceText across all files', () => {
    const sf1 = createMockSourceFile('a')
    const sf2 = createMockSourceFile('b')
    const v1 = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 0, line: 1 }, end: { column: 1, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 0, line: 1 }, end: { column: 1, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 1, newText: 'X', oldText: 'a' }],
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    applyFixesToFiles(
      [
        { sourceFile: sf1, violations: [v1] },
        { sourceFile: sf2, violations: [v2] },
      ],
      rules,
      true,
    )
    expect(sf1.replaceText).not.toHaveBeenCalled()
    expect(sf2.replaceText).not.toHaveBeenCalled()
  })

  it('totalFixesSkipped sums correctly across files', () => {
    const sf1 = createMockSourceFile('abc')
    const sf2 = createMockSourceFile('def')
    const v1 = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 0, line: 1 }, end: { column: 1, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 0, line: 1 }, end: { column: 1, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: false,
            changes: [],
            conflict: { conflictingRule: 'x', reason: 'y' },
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFiles(
      [
        { sourceFile: sf1, violations: [v1] },
        { sourceFile: sf2, violations: [v2] },
      ],
      rules,
      false,
    )
    expect(report.totalFixesSkipped).toBe(2)
  })

  it('handles mixed applied and skipped across files', () => {
    const sf1 = createMockSourceFile('abc')
    const sf2 = createMockSourceFile('def')
    const v1 = createMockViolation({
      ruleId: 'apply',
      range: { start: { column: 0, line: 1 }, end: { column: 1, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'skip',
      range: { start: { column: 0, line: 1 }, end: { column: 1, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'apply',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 1, newText: 'X', oldText: 'a' }],
          }),
          id: 'apply',
          priority: 1,
        },
      ],
      [
        'skip',
        {
          fix: (): FixResult => ({
            applied: false,
            changes: [],
            conflict: { conflictingRule: 'z', reason: 'skip' },
          }),
          id: 'skip',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFiles(
      [
        { sourceFile: sf1, violations: [v1] },
        { sourceFile: sf2, violations: [v2] },
      ],
      rules,
      false,
    )
    expect(report.totalFixesApplied).toBe(1)
    expect(report.totalFixesSkipped).toBe(1)
  })
})

describe('applyFixesToFile - fix context interaction', () => {
  it('fix function is called with source file from parameter', () => {
    const sf = createMockSourceFile('hello')
    let calledWith: SourceFile | null = null
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 0, line: 1 }, end: { column: 5, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (ctx): FixResult => {
            calledWith = ctx.sourceFile
            return {
              applied: true,
              changes: [{ start: 0, end: 5, newText: 'HELLO', oldText: 'hello' }],
            }
          },
          id: 'r',
          priority: 1,
        },
      ],
    ])
    applyFixesToFile(sf, [v], rules, false)
    expect(calledWith).toBe(sf)
  })

  it('fix function is called with violation from parameter', () => {
    const sf = createMockSourceFile('x')
    let calledWith: RuleViolation | null = null
    const v = createMockViolation({ ruleId: 'verify-me', message: 'check this' })
    const rules = new Map<string, RuleWithFix>([
      [
        'verify-me',
        {
          fix: (ctx): FixResult => {
            calledWith = ctx.violation
            return { applied: true, changes: [{ start: 0, end: 1, newText: 'y', oldText: 'x' }] }
          },
          id: 'verify-me',
          priority: 1,
        },
      ],
    ])
    applyFixesToFile(sf, [v], rules, false)
    expect(calledWith).toBe(v)
  })

  it('multiple violations call fix function multiple times', () => {
    const sf = createMockSourceFile('a b c')
    let callCount = 0
    const vs = [0, 1, 2].map((i) =>
      createMockViolation({
        ruleId: 'r',
        range: { start: { column: i * 2, line: 1 }, end: { column: i * 2 + 1, line: 1 } },
      }),
    )
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => {
            callCount++
            return { applied: true, changes: [{ start: 0, end: 1, newText: 'X', oldText: 'a' }] }
          },
          id: 'r',
          priority: 1,
        },
      ],
    ])
    applyFixesToFile(sf, vs, rules, false)
    expect(callCount).toBe(3)
  })

  it('fix not called for conflict-skipped violation', () => {
    const sf = createMockSourceFile('abcdef')
    let callCount = 0
    const v1 = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 0, line: 1 }, end: { column: 4, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'r2',
      range: { start: { column: 2, line: 1 }, end: { column: 6, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => {
            callCount++
            return {
              applied: true,
              changes: [{ start: 0, end: 4, newText: 'XXXX', oldText: 'abcd' }],
            }
          },
          id: 'r1',
          priority: 1,
        },
      ],
      [
        'r2',
        {
          fix: (): FixResult => {
            callCount++
            return {
              applied: true,
              changes: [{ start: 2, end: 6, newText: 'YYYY', oldText: 'cdef' }],
            }
          },
          id: 'r2',
          priority: 2,
        },
      ],
    ])
    applyFixesToFile(sf, [v1, v2], rules, false)
    expect(callCount).toBe(1)
  })
})

describe('applyFixesToFile - range position calculation', () => {
  it('column 0 line 1 maps to position 0', () => {
    const sf = createMockSourceFile('abc')
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 1, line: 1 }, end: { column: 4, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 3, newText: 'XXX', oldText: 'abc' }],
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.fixesApplied).toBe(1)
  })

  it('second line starts after first line length + newline', () => {
    const sf = createMockSourceFile('ab\ncd')
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 1, line: 2 }, end: { column: 3, line: 2 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 3, end: 5, newText: 'XX', oldText: 'cd' }],
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.fixesApplied).toBe(1)
  })

  it('third line position calculation', () => {
    const sf = createMockSourceFile('a\nb\nc')
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 1, line: 3 }, end: { column: 2, line: 3 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 4, end: 5, newText: 'X', oldText: 'c' }],
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.fixesApplied).toBe(1)
  })

  it('column offset adds to line start position', () => {
    const sf = createMockSourceFile('hello\nworld')
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 3, line: 2 }, end: { column: 6, line: 2 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 8, end: 11, newText: 'XXX', oldText: 'rld' }],
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.fixesApplied).toBe(1)
  })
})

describe('applyFixesToFile - mixed scenarios', () => {
  it('mix of applied, skipped, and null results', () => {
    const sf = createMockSourceFile('a b c d e')
    const v1 = createMockViolation({
      ruleId: 'applied',
      range: { start: { column: 0, line: 1 }, end: { column: 1, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'null-result',
      range: { start: { column: 2, line: 1 }, end: { column: 3, line: 1 } },
    })
    const v3 = createMockViolation({
      ruleId: 'conflicted',
      range: { start: { column: 4, line: 1 }, end: { column: 5, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'applied',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 1, newText: 'A', oldText: 'a' }],
          }),
          id: 'applied',
          priority: 1,
        },
      ],
      ['null-result', { fix: (): FixResult | null => null, id: 'null-result', priority: 2 }],
      [
        'conflicted',
        {
          fix: (): FixResult => ({
            applied: false,
            changes: [],
            conflict: { conflictingRule: 'x', reason: 'y' },
          }),
          id: 'conflicted',
          priority: 3,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v1, v2, v3], rules, false)
    expect(report.fixesApplied).toBe(1)
    expect(report.fixesSkipped).toBe(1)
    expect(report.conflicts).toHaveLength(1)
  })

  it('all violations have no matching rules', () => {
    const sf = createMockSourceFile('abc')
    const vs = ['x', 'y', 'z'].map((id) => createMockViolation({ ruleId: id }))
    const rules = new Map<string, RuleWithFix>([
      [
        'other',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 1, newText: 'X', oldText: 'a' }],
          }),
          id: 'other',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, vs, rules, false)
    expect(report.fixesApplied).toBe(0)
    expect(report.fixesSkipped).toBe(0)
  })

  it('replaceText called once per change', () => {
    const sf = createMockSourceFile('abcdef')
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 0, line: 1 }, end: { column: 6, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [
              { start: 0, end: 2, newText: 'AB', oldText: 'ab' },
              { start: 2, end: 4, newText: 'CD', oldText: 'cd' },
              { start: 4, end: 6, newText: 'EF', oldText: 'ef' },
            ],
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    applyFixesToFile(sf, [v], rules, false)
    expect(sf.replaceText).toHaveBeenCalledTimes(3)
  })

  it('no replaceText when dry-run with applied fixes', () => {
    const sf = createMockSourceFile('abc')
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 0, line: 1 }, end: { column: 3, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 3, newText: 'XXX', oldText: 'abc' }],
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v], rules, true)
    expect(report.fixesApplied).toBe(1)
    expect(sf.replaceText).not.toHaveBeenCalled()
  })

  it('conflict from fix result and range conflict both tracked', () => {
    const sf = createMockSourceFile('abcdef')
    const v1 = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 0, line: 1 }, end: { column: 3, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'r2',
      range: { start: { column: 1, line: 1 }, end: { column: 4, line: 1 } },
    })
    const v3 = createMockViolation({
      ruleId: 'r3',
      range: { start: { column: 4, line: 1 }, end: { column: 6, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 3, newText: 'ABC', oldText: 'abc' }],
          }),
          id: 'r1',
          priority: 1,
        },
      ],
      [
        'r2',
        {
          fix: (): FixResult => ({
            applied: false,
            changes: [],
            conflict: { conflictingRule: 'r1', reason: 'result conflict' },
          }),
          id: 'r2',
          priority: 2,
        },
      ],
      [
        'r3',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 4, end: 6, newText: 'EF', oldText: 'ef' }],
          }),
          id: 'r3',
          priority: 3,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v1, v2, v3], rules, false)
    expect(report.fixesApplied).toBe(2)
    expect(report.conflicts).toHaveLength(1)
  })

  it('fix returning applied=true with changes and conflict ignores conflict', () => {
    const sf = createMockSourceFile('x')
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 0, line: 1 }, end: { column: 1, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 1, newText: 'y', oldText: 'x' }],
            conflict: { conflictingRule: 'z', reason: 'info' },
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.fixesApplied).toBe(1)
    expect(report.conflicts).toHaveLength(0)
  })
})

describe('applyFixesToFiles - report structure', () => {
  it('returns all expected keys', () => {
    const report = applyFixesToFiles([], new Map(), false)
    expect(report).toHaveProperty('fileReports')
    expect(report).toHaveProperty('filesProcessed')
    expect(report).toHaveProperty('totalFixesApplied')
    expect(report).toHaveProperty('totalFixesSkipped')
  })

  it('filesProcessed matches input array length', () => {
    const sfs = [createMockSourceFile('a'), createMockSourceFile('b'), createMockSourceFile('c')]
    const files = sfs.map((sf) => ({ sourceFile: sf, violations: [] }))
    const report = applyFixesToFiles(files, new Map(), false)
    expect(report.filesProcessed).toBe(3)
  })

  it('totalFixesApplied is 0 when no fixes applied', () => {
    const report = applyFixesToFiles(
      [{ sourceFile: createMockSourceFile('x'), violations: [] }],
      new Map(),
      false,
    )
    expect(report.totalFixesApplied).toBe(0)
  })

  it('totalFixesSkipped is 0 when no fixes skipped', () => {
    const report = applyFixesToFiles(
      [{ sourceFile: createMockSourceFile('x'), violations: [] }],
      new Map(),
      false,
    )
    expect(report.totalFixesSkipped).toBe(0)
  })

  it('default dryRun is false', () => {
    const sf = createMockSourceFile('a')
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 0, line: 1 }, end: { column: 1, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 1, newText: 'b', oldText: 'a' }],
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    applyFixesToFiles([{ sourceFile: sf, violations: [v] }], rules)
    expect(sf.replaceText).toHaveBeenCalled()
  })
})

describe('applyFixesToFile - violation properties', () => {
  it('violations with different filePaths can be processed', () => {
    const sf = createMockSourceFile('ab')
    const v1 = createMockViolation({
      filePath: '/a.ts',
      ruleId: 'test-rule',
      range: { start: { column: 1, line: 1 }, end: { column: 2, line: 1 } },
    })
    const v2 = createMockViolation({
      filePath: '/b.ts',
      ruleId: 'test-rule',
      range: { start: { column: 1, line: 1 }, end: { column: 2, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 1, newText: 'y', oldText: 'x' }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v1, v2], rules, false)
    expect(report.fixesApplied).toBe(1)
    expect(report.fixesSkipped).toBe(1)
  })

  it('violation message does not affect fix application', () => {
    const sf = createMockSourceFile('x')
    const v = createMockViolation({
      message: 'Some very long error message with details',
      range: { start: { column: 0, line: 1 }, end: { column: 1, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 1, newText: 'y', oldText: 'x' }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.fixesApplied).toBe(1)
  })
})

describe('applyFixesToFile - TextChange content', () => {
  it('change with empty newText is valid', () => {
    const sf = createMockSourceFile('abc')
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 0, line: 1 }, end: { column: 3, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 1, end: 3, newText: '', oldText: 'bc' }],
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.changes[0]?.newText).toBe('')
  })

  it('change with longer newText than oldText', () => {
    const sf = createMockSourceFile('ab')
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 0, line: 1 }, end: { column: 2, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 2, newText: 'abcdef', oldText: 'ab' }],
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.changes[0]?.newText).toBe('abcdef')
  })

  it('change start equals end (insertion)', () => {
    const sf = createMockSourceFile('ab')
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 0, line: 1 }, end: { column: 2, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 1, end: 1, newText: 'X', oldText: '' }],
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.changes[0]?.start).toBe(1)
    expect(report.changes[0]?.end).toBe(1)
  })

  it('multiple changes preserve order in report', () => {
    const sf = createMockSourceFile('abcdef')
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 0, line: 1 }, end: { column: 6, line: 1 } },
    })
    const changes = [
      { start: 0, end: 2, newText: 'AB', oldText: 'ab' },
      { start: 2, end: 4, newText: 'CD', oldText: 'cd' },
      { start: 4, end: 6, newText: 'EF', oldText: 'ef' },
    ]
    const rules = new Map<string, RuleWithFix>([
      ['r', { fix: (): FixResult => ({ applied: true, changes }), id: 'r', priority: 1 }],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.changes).toEqual(changes)
  })
})

describe('applyFixesToFile - RuleWithFix interface', () => {
  it('RuleWithFix with id matching ruleId', () => {
    const sf = createMockSourceFile('x')
    const v = createMockViolation({
      ruleId: 'my-rule',
      range: { start: { column: 0, line: 1 }, end: { column: 1, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'my-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 1, newText: 'y', oldText: 'x' }],
          }),
          id: 'my-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.fixesApplied).toBe(1)
  })

  it('RuleWithFix id can differ from map key (uses map key)', () => {
    const sf = createMockSourceFile('x')
    const v = createMockViolation({
      ruleId: 'lookup-key',
      range: { start: { column: 0, line: 1 }, end: { column: 1, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'lookup-key',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 1, newText: 'y', oldText: 'x' }],
          }),
          id: 'different-id',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.fixesApplied).toBe(1)
  })

  it('different RuleWithFix for different rules', () => {
    const sf = createMockSourceFile('a b')
    const v1 = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 0, line: 1 }, end: { column: 1, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'r2',
      range: { start: { column: 2, line: 1 }, end: { column: 3, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 1, newText: 'A', oldText: 'a' }],
          }),
          id: 'r1',
          priority: 1,
        },
      ],
      [
        'r2',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 2, end: 3, newText: 'B', oldText: 'b' }],
          }),
          id: 'r2',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v1, v2], rules, false)
    expect(report.fixesApplied).toBe(2)
  })
})

describe('applyFixesToFile - conflict edge cases', () => {
  it('identical ranges produce conflict', () => {
    const sf = createMockSourceFile('abcdef')
    const v1 = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 0, line: 1 }, end: { column: 6, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'r2',
      range: { start: { column: 0, line: 1 }, end: { column: 6, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 6, newText: 'XXX', oldText: 'abcdef' }],
          }),
          id: 'r1',
          priority: 1,
        },
      ],
      [
        'r2',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 6, newText: 'YYY', oldText: 'abcdef' }],
          }),
          id: 'r2',
          priority: 2,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v1, v2], rules, false)
    expect(report.conflicts).toHaveLength(1)
    expect(report.fixesApplied).toBe(1)
  })

  it('conflict with multiple previously applied ranges', () => {
    const sf = createMockSourceFile('a b c d e')
    const v1 = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 0, line: 1 }, end: { column: 1, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'r2',
      range: { start: { column: 2, line: 1 }, end: { column: 3, line: 1 } },
    })
    const v3 = createMockViolation({
      ruleId: 'r3',
      range: { start: { column: 4, line: 1 }, end: { column: 5, line: 1 } },
    })
    const vBig = createMockViolation({
      ruleId: 'big',
      range: { start: { column: 0, line: 1 }, end: { column: 9, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 1, newText: 'A', oldText: 'a' }],
          }),
          id: 'r1',
          priority: 1,
        },
      ],
      [
        'r2',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 2, end: 3, newText: 'B', oldText: 'b' }],
          }),
          id: 'r2',
          priority: 2,
        },
      ],
      [
        'r3',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 4, end: 5, newText: 'C', oldText: 'c' }],
          }),
          id: 'r3',
          priority: 3,
        },
      ],
      [
        'big',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 9, newText: 'ALL', oldText: 'a b c d e' }],
          }),
          id: 'big',
          priority: 4,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v1, v2, v3, vBig], rules, false)
    expect(report.fixesApplied).toBe(3)
    expect(report.conflicts).toHaveLength(1)
    expect(report.conflicts[0]?.ruleId).toBe('big')
  })

  it('conflictingRule is "unknown" when no specific match found', () => {
    const sf = createMockSourceFile('abc')
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 0, line: 1 }, end: { column: 3, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: false,
            changes: [],
            conflict: { conflictingRule: 'unknown', reason: 'test' },
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.conflicts[0]?.conflictingRule).toBe('unknown')
  })

  it('fix conflict with self-referencing conflicting rule', () => {
    const sf = createMockSourceFile('x')
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 0, line: 1 }, end: { column: 1, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: false,
            changes: [],
            conflict: { conflictingRule: 'r', reason: 'Self conflict' },
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.conflicts[0]?.conflictingRule).toBe('r')
    expect(report.conflicts[0]?.ruleId).toBe('r')
  })
})

describe('applyFixesToFiles - single file scenarios', () => {
  it('single file with single violation', () => {
    const sf = createMockSourceFile('x')
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 0, line: 1 }, end: { column: 1, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 1, newText: 'y', oldText: 'x' }],
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFiles([{ sourceFile: sf, violations: [v] }], rules, false)
    expect(report.filesProcessed).toBe(1)
    expect(report.totalFixesApplied).toBe(1)
    expect(report.fileReports).toHaveLength(1)
  })

  it('single file with multiple conflicts', () => {
    const sf = createMockSourceFile('abcdef')
    const v1 = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 0, line: 1 }, end: { column: 4, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'r2',
      range: { start: { column: 2, line: 1 }, end: { column: 6, line: 1 } },
    })
    const v3 = createMockViolation({
      ruleId: 'r3',
      range: { start: { column: 1, line: 1 }, end: { column: 3, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 4, newText: 'ABCD', oldText: 'abcd' }],
          }),
          id: 'r1',
          priority: 1,
        },
      ],
      [
        'r2',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 2, end: 6, newText: 'EFGH', oldText: 'cdef' }],
          }),
          id: 'r2',
          priority: 2,
        },
      ],
      [
        'r3',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 1, end: 3, newText: 'XY', oldText: 'bc' }],
          }),
          id: 'r3',
          priority: 3,
        },
      ],
    ])
    const report = applyFixesToFiles([{ sourceFile: sf, violations: [v1, v2, v3] }], rules, false)
    expect(report.totalFixesApplied).toBe(1)
    expect(report.totalFixesSkipped).toBe(2)
    expect(report.fileReports[0]?.conflicts).toHaveLength(2)
  })

  it('single file with all null fixes', () => {
    const sf = createMockSourceFile('abc')
    const vs = ['r1', 'r2'].map((id) => createMockViolation({ ruleId: id }))
    const rules = new Map<string, RuleWithFix>([
      ['r1', { fix: (): FixResult | null => null, id: 'r1', priority: 1 }],
      ['r2', { fix: (): FixResult | null => null, id: 'r2', priority: 2 }],
    ])
    const report = applyFixesToFiles([{ sourceFile: sf, violations: vs }], rules, false)
    expect(report.totalFixesApplied).toBe(0)
    expect(report.totalFixesSkipped).toBe(0)
  })
})

describe('applyFixesToFile - additional conflict scenarios', () => {
  it('range starting at exact end of applied range is not a conflict', () => {
    const sf = createMockSourceFile('abcdef')
    const v1 = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 1, line: 1 }, end: { column: 3, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'r2',
      range: { start: { column: 3, line: 1 }, end: { column: 6, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 2, newText: 'ab', oldText: 'ab' }],
          }),
          id: 'r1',
          priority: 1,
        },
      ],
      [
        'r2',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 2, end: 5, newText: 'cde', oldText: 'cde' }],
          }),
          id: 'r2',
          priority: 2,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v1, v2], rules, false)
    expect(report.fixesApplied).toBe(2)
    expect(report.conflicts).toHaveLength(0)
  })

  it('conflict when ranges share only one position', () => {
    const sf = createMockSourceFile('abcdef')
    const v1 = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 1, line: 1 }, end: { column: 4, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'r2',
      range: { start: { column: 3, line: 1 }, end: { column: 6, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 3, newText: 'ABC', oldText: 'abc' }],
          }),
          id: 'r1',
          priority: 1,
        },
      ],
      [
        'r2',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 2, end: 5, newText: 'DEF', oldText: 'cde' }],
          }),
          id: 'r2',
          priority: 2,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v1, v2], rules, false)
    expect(report.fixesApplied).toBe(1)
    expect(report.fixesSkipped).toBe(1)
  })

  it('multiple non-conflicting fixes across many lines', () => {
    const sf = createMockSourceFile('a\nb\nc\nd\ne')
    const vs = ['r1', 'r2', 'r3', 'r4', 'r5'].map((id, i) =>
      createMockViolation({
        ruleId: id,
        range: { start: { column: 1, line: i + 1 }, end: { column: 2, line: i + 1 } },
      }),
    )
    const rules = new Map<string, RuleWithFix>(
      ['r1', 'r2', 'r3', 'r4', 'r5'].map((id, i) => [
        id,
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: i * 2, end: i * 2 + 1, newText: 'X', oldText: 'x' }],
          }),
          id,
          priority: i + 1,
        },
      ]),
    )
    const report = applyFixesToFile(sf, vs, rules, false)
    expect(report.fixesApplied).toBe(5)
    expect(report.conflicts).toHaveLength(0)
  })

  it('conflict with very large range encompassing many smaller ranges', () => {
    const sf = createMockSourceFile('a b c d e f g h')
    const smallVs = ['r1', 'r2', 'r3'].map((id, i) =>
      createMockViolation({
        ruleId: id,
        range: { start: { column: i * 4 + 1, line: 1 }, end: { column: i * 4 + 2, line: 1 } },
      }),
    )
    const bigV = createMockViolation({
      ruleId: 'big',
      range: { start: { column: 1, line: 1 }, end: { column: 16, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 1, newText: 'A', oldText: 'a' }],
          }),
          id: 'r1',
          priority: 1,
        },
      ],
      [
        'r2',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 4, end: 5, newText: 'B', oldText: 'b' }],
          }),
          id: 'r2',
          priority: 1,
        },
      ],
      [
        'r3',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 8, end: 9, newText: 'C', oldText: 'c' }],
          }),
          id: 'r3',
          priority: 1,
        },
      ],
      [
        'big',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 15, newText: 'ALL', oldText: 'a b c d e f g h' }],
          }),
          id: 'big',
          priority: 10,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [...smallVs, bigV], rules, false)
    expect(report.fixesApplied).toBe(3)
    expect(report.fixesSkipped).toBe(1)
  })

  it('fix result conflict does not prevent subsequent non-conflicting fix', () => {
    const sf = createMockSourceFile('abcdef')
    const v1 = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 1, line: 1 }, end: { column: 3, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'r2',
      range: { start: { column: 4, line: 1 }, end: { column: 7, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: false,
            changes: [],
            conflict: { conflictingRule: 'x', reason: 'blocked' },
          }),
          id: 'r1',
          priority: 1,
        },
      ],
      [
        'r2',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 3, end: 6, newText: 'DEF', oldText: 'def' }],
          }),
          id: 'r2',
          priority: 2,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v1, v2], rules, false)
    expect(report.fixesApplied).toBe(1)
    expect(report.fixesSkipped).toBe(1)
    expect(report.conflicts).toHaveLength(1)
  })
})

describe('applyFixesToFile - additional priority scenarios', () => {
  it('priority determines which overlapping fix wins', () => {
    const sf = createMockSourceFile('abcdef')
    const vLow = createMockViolation({
      ruleId: 'low',
      range: { start: { column: 1, line: 1 }, end: { column: 7, line: 1 } },
    })
    const vHigh = createMockViolation({
      ruleId: 'high',
      range: { start: { column: 1, line: 1 }, end: { column: 7, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'low',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 6, newText: 'LOW', oldText: 'abcdef' }],
          }),
          id: 'low',
          priority: 10,
        },
      ],
      [
        'high',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 6, newText: 'HIGH', oldText: 'abcdef' }],
          }),
          id: 'high',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [vLow, vHigh], rules, false)
    expect(report.fixesApplied).toBe(1)
    expect(report.changes[0]?.newText).toBe('HIGH')
  })

  it('many rules with same priority all apply if non-overlapping', () => {
    const sf = createMockSourceFile('a b c d')
    const vs = ['r1', 'r2', 'r3', 'r4'].map((id, i) =>
      createMockViolation({
        ruleId: id,
        range: { start: { column: i * 2 + 1, line: 1 }, end: { column: i * 2 + 2, line: 1 } },
      }),
    )
    const rules = new Map<string, RuleWithFix>(
      vs.map((_, i) => {
        const id = `r${i + 1}`
        return [
          id,
          {
            fix: (): FixResult => ({
              applied: true,
              changes: [{ start: i * 2, end: i * 2 + 1, newText: id, oldText: 'x' }],
            }),
            id,
            priority: 5,
          },
        ]
      }),
    )
    const report = applyFixesToFile(sf, vs, rules, false)
    expect(report.fixesApplied).toBe(4)
  })

  it('priority does not affect non-overlapping fixes', () => {
    const sf = createMockSourceFile('abc def')
    const v1 = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 1, line: 1 }, end: { column: 4, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'r2',
      range: { start: { column: 5, line: 1 }, end: { column: 8, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 3, newText: 'ABC', oldText: 'abc' }],
          }),
          id: 'r1',
          priority: 100,
        },
      ],
      [
        'r2',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 4, end: 7, newText: 'DEF', oldText: 'def' }],
          }),
          id: 'r2',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v1, v2], rules, false)
    expect(report.fixesApplied).toBe(2)
  })

  it('mixed priorities with some overlaps', () => {
    const sf = createMockSourceFile('a b c d e')
    const v1 = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 1, line: 1 }, end: { column: 2, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'r2',
      range: { start: { column: 1, line: 1 }, end: { column: 4, line: 1 } },
    })
    const v3 = createMockViolation({
      ruleId: 'r3',
      range: { start: { column: 5, line: 1 }, end: { column: 6, line: 1 } },
    })
    const v4 = createMockViolation({
      ruleId: 'r4',
      range: { start: { column: 7, line: 1 }, end: { column: 10, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 1, newText: 'A', oldText: 'a' }],
          }),
          id: 'r1',
          priority: 1,
        },
      ],
      [
        'r2',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 3, newText: 'X', oldText: 'a b' }],
          }),
          id: 'r2',
          priority: 5,
        },
      ],
      [
        'r3',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 4, end: 5, newText: 'C', oldText: 'c' }],
          }),
          id: 'r3',
          priority: 2,
        },
      ],
      [
        'r4',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 6, end: 9, newText: 'D', oldText: 'd e' }],
          }),
          id: 'r4',
          priority: 3,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v1, v2, v3, v4], rules, false)
    expect(report.fixesApplied).toBe(3)
    expect(report.fixesSkipped).toBe(1)
  })
})

describe('applyFixesToFile - additional dry-run scenarios', () => {
  it('dry-run with conflicts still reports conflicts', () => {
    const sf = createMockSourceFile('abcdef')
    const v1 = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 1, line: 1 }, end: { column: 4, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'r2',
      range: { start: { column: 3, line: 1 }, end: { column: 7, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 3, newText: 'ABC', oldText: 'abc' }],
          }),
          id: 'r1',
          priority: 1,
        },
      ],
      [
        'r2',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 2, end: 6, newText: 'DE', oldText: 'cdef' }],
          }),
          id: 'r2',
          priority: 2,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v1, v2], rules, true)
    expect(report.fixesApplied).toBe(1)
    expect(report.fixesSkipped).toBe(1)
    expect(report.conflicts).toHaveLength(1)
    expect(sf.replaceText).not.toHaveBeenCalled()
  })

  it('dry-run with only conflicts reports all as skipped', () => {
    const sf = createMockSourceFile('abc')
    const v1 = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 1, line: 1 }, end: { column: 4, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'r2',
      range: { start: { column: 1, line: 1 }, end: { column: 4, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 3, newText: 'X', oldText: 'abc' }],
          }),
          id: 'r1',
          priority: 1,
        },
      ],
      [
        'r2',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 3, newText: 'Y', oldText: 'abc' }],
          }),
          id: 'r2',
          priority: 2,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v1, v2], rules, true)
    expect(report.fixesApplied).toBe(1)
    expect(report.fixesSkipped).toBe(1)
    expect(sf.replaceText).not.toHaveBeenCalled()
  })

  it('dry-run with null fix results reports zero applied', () => {
    const sf = createMockSourceFile('abc')
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 1, line: 1 }, end: { column: 4, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      ['r', { fix: (): FixResult | null => null, id: 'r', priority: 1 }],
    ])
    const report = applyFixesToFile(sf, [v], rules, true)
    expect(report.fixesApplied).toBe(0)
    expect(sf.replaceText).not.toHaveBeenCalled()
  })
})

describe('applyFixesToFile - additional edge cases', () => {
  it('fix function can access violation range', () => {
    const sf = createMockSourceFile('abcdef')
    let receivedRange: unknown = null
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 1, line: 1 }, end: { column: 4, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (ctx): FixResult => {
            receivedRange = ctx.violation.range
            return {
              applied: true,
              changes: [{ start: 0, end: 3, newText: 'ABC', oldText: 'abc' }],
            }
          },
          id: 'r',
          priority: 1,
        },
      ],
    ])
    applyFixesToFile(sf, [v], rules, false)
    expect(receivedRange).toEqual(v.range)
  })

  it('fix function can access violation message', () => {
    const sf = createMockSourceFile('x')
    let receivedMsg: string | null = null
    const v = createMockViolation({
      ruleId: 'r',
      message: 'Custom msg',
      range: { start: { column: 1, line: 1 }, end: { column: 2, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (ctx): FixResult => {
            receivedMsg = ctx.violation.message
            return { applied: true, changes: [{ start: 0, end: 1, newText: 'y', oldText: 'x' }] }
          },
          id: 'r',
          priority: 1,
        },
      ],
    ])
    applyFixesToFile(sf, [v], rules, false)
    expect(receivedMsg).toBe('Custom msg')
  })

  it('fix function can access violation severity', () => {
    const sf = createMockSourceFile('x')
    let receivedSeverity: string | null = null
    const v = createMockViolation({
      ruleId: 'r',
      severity: 'error',
      range: { start: { column: 1, line: 1 }, end: { column: 2, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (ctx): FixResult => {
            receivedSeverity = ctx.violation.severity
            return { applied: true, changes: [{ start: 0, end: 1, newText: 'y', oldText: 'x' }] }
          },
          id: 'r',
          priority: 1,
        },
      ],
    ])
    applyFixesToFile(sf, [v], rules, false)
    expect(receivedSeverity).toBe('error')
  })

  it('fix that changes to empty string', () => {
    const sf = createMockSourceFile('abc')
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 1, line: 1 }, end: { column: 4, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 3, newText: '', oldText: 'abc' }],
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.fixesApplied).toBe(1)
    expect(report.changes[0]?.newText).toBe('')
  })

  it('violation with column beyond line length', () => {
    const sf = createMockSourceFile('ab')
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 1, line: 1 }, end: { column: 10, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 2, newText: 'XX', oldText: 'ab' }],
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.fixesApplied).toBe(1)
  })

  it('violation with line number beyond file length', () => {
    const sf = createMockSourceFile('ab')
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 1, line: 5 }, end: { column: 3, line: 5 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 2, newText: 'XX', oldText: 'ab' }],
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.fixesApplied).toBe(1)
  })

  it('source file with only whitespace', () => {
    const sf = createMockSourceFile('   ')
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 1, line: 1 }, end: { column: 4, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 3, newText: 'x', oldText: '   ' }],
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.fixesApplied).toBe(1)
  })

  it('source file with only newlines', () => {
    const sf = createMockSourceFile('\n\n\n')
    const report = applyFixesToFile(sf, [], new Map(), false)
    expect(report.fixesApplied).toBe(0)
  })

  it('many violations for the same rule with non-overlapping ranges', () => {
    const sf = createMockSourceFile('a b c d e f g h i j')
    const vs = Array.from({ length: 10 }, (_, i) =>
      createMockViolation({
        ruleId: 'r',
        range: { start: { column: i * 2 + 1, line: 1 }, end: { column: i * 2 + 2, line: 1 } },
      }),
    )
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 1, newText: 'X', oldText: 'a' }],
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, vs, rules, false)
    expect(report.fixesApplied).toBe(10)
  })
})

describe('applyFixesToFiles - additional scenarios', () => {
  it('single file with mixed results', () => {
    const sf = createMockSourceFile('abcdef')
    const v1 = createMockViolation({
      ruleId: 'apply',
      range: { start: { column: 1, line: 1 }, end: { column: 3, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'overlap',
      range: { start: { column: 2, line: 1 }, end: { column: 5, line: 1 } },
    })
    const v3 = createMockViolation({
      ruleId: 'null',
      range: { start: { column: 5, line: 1 }, end: { column: 7, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'apply',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 2, newText: 'AB', oldText: 'ab' }],
          }),
          id: 'apply',
          priority: 1,
        },
      ],
      [
        'overlap',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 1, end: 4, newText: 'XXX', oldText: 'bcd' }],
          }),
          id: 'overlap',
          priority: 2,
        },
      ],
      ['null', { fix: (): FixResult | null => null, id: 'null', priority: 3 }],
    ])
    const report = applyFixesToFiles([{ sourceFile: sf, violations: [v1, v2, v3] }], rules, false)
    expect(report.totalFixesApplied).toBe(1)
    expect(report.totalFixesSkipped).toBe(1)
    expect(report.filesProcessed).toBe(1)
  })

  it('file with zero violations contributes to fileReports', () => {
    const sf = createMockSourceFile('abc')
    const report = applyFixesToFiles([{ sourceFile: sf, violations: [] }], new Map(), false)
    expect(report.fileReports).toHaveLength(1)
    expect(report.fileReports[0]?.fixesApplied).toBe(0)
    expect(report.fileReports[0]?.filePath).toBe('/test/file.ts')
  })

  it('files processed in order', () => {
    const sf1 = createMockSourceFile('a')
    const sf2 = createMockSourceFile('b')
    const v1 = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 1, line: 1 }, end: { column: 2, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 1, line: 1 }, end: { column: 2, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 1, newText: 'X', oldText: 'a' }],
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFiles(
      [
        { sourceFile: sf1, violations: [v1] },
        { sourceFile: sf2, violations: [v2] },
      ],
      rules,
      false,
    )
    expect(report.fileReports[0]?.fixesApplied).toBe(1)
    expect(report.fileReports[1]?.fixesApplied).toBe(1)
  })

  it('empty rules map with violations', () => {
    const sf = createMockSourceFile('abc')
    const v = createMockViolation({ ruleId: 'unknown' })
    const report = applyFixesToFiles([{ sourceFile: sf, violations: [v] }], new Map(), false)
    expect(report.totalFixesApplied).toBe(0)
    expect(report.totalFixesSkipped).toBe(0)
  })

  it('multiple files each with conflicts', () => {
    const sf1 = createMockSourceFile('abcdef')
    const sf2 = createMockSourceFile('ghijkl')
    const v1a = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 1, line: 1 }, end: { column: 4, line: 1 } },
    })
    const v1b = createMockViolation({
      ruleId: 'r2',
      range: { start: { column: 2, line: 1 }, end: { column: 5, line: 1 } },
    })
    const v2a = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 1, line: 1 }, end: { column: 4, line: 1 } },
    })
    const v2b = createMockViolation({
      ruleId: 'r2',
      range: { start: { column: 2, line: 1 }, end: { column: 5, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 3, newText: 'ABC', oldText: 'abc' }],
          }),
          id: 'r1',
          priority: 1,
        },
      ],
      [
        'r2',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 1, end: 4, newText: 'XXX', oldText: 'bcd' }],
          }),
          id: 'r2',
          priority: 2,
        },
      ],
    ])
    const report = applyFixesToFiles(
      [
        { sourceFile: sf1, violations: [v1a, v1b] },
        { sourceFile: sf2, violations: [v2a, v2b] },
      ],
      rules,
      false,
    )
    expect(report.totalFixesApplied).toBe(2)
    expect(report.totalFixesSkipped).toBe(2)
    expect(report.fileReports[0]?.conflicts).toHaveLength(1)
    expect(report.fileReports[1]?.conflicts).toHaveLength(1)
  })

  it('dry-run aggregates correctly across many files', () => {
    const sfs = Array.from({ length: 5 }, () => createMockSourceFile('x'))
    const vs = sfs.map(() =>
      createMockViolation({
        ruleId: 'r',
        range: { start: { column: 1, line: 1 }, end: { column: 2, line: 1 } },
      }),
    )
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 1, newText: 'y', oldText: 'x' }],
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFiles(
      sfs.map((sf, i) => ({ sourceFile: sf, violations: [vs[i]!] })),
      rules,
      true,
    )
    expect(report.filesProcessed).toBe(5)
    expect(report.totalFixesApplied).toBe(5)
    expect(report.fileReports).toHaveLength(5)
    for (const sf of sfs) {
      expect(sf.replaceText).not.toHaveBeenCalled()
    }
  })
})

describe('applyFixesToFile - change application details', () => {
  it('changes applied in reverse position order prevents offset shifts', () => {
    const sf = createMockSourceFile('abcdef')
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 1, line: 1 }, end: { column: 7, line: 1 } },
    })
    const calls: Array<[number, number]> = []
    sf.replaceText = vi.fn((range: [number, number]) => {
      calls.push(range)
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [
              { start: 0, end: 2, newText: 'XX', oldText: 'ab' },
              { start: 4, end: 6, newText: 'YY', oldText: 'ef' },
            ],
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    applyFixesToFile(sf, [v], rules, false)
    expect(calls[0]).toEqual([4, 6])
    expect(calls[1]).toEqual([0, 2])
  })

  it('single change triggers one replaceText call', () => {
    const sf = createMockSourceFile('abc')
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 1, line: 1 }, end: { column: 4, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 3, newText: 'XXX', oldText: 'abc' }],
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    applyFixesToFile(sf, [v], rules, false)
    expect(sf.replaceText).toHaveBeenCalledTimes(1)
    expect(sf.replaceText).toHaveBeenCalledWith([0, 3], 'XXX')
  })

  it('no replaceText for empty changes even in non-dry-run', () => {
    const sf = createMockSourceFile('abc')
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 1, line: 1 }, end: { column: 4, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      ['r', { fix: (): FixResult => ({ applied: true, changes: [] }), id: 'r', priority: 1 }],
    ])
    applyFixesToFile(sf, [v], rules, false)
    expect(sf.replaceText).not.toHaveBeenCalled()
  })

  it('changes from multiple fixes accumulate', () => {
    const sf = createMockSourceFile('abc def')
    const v1 = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 1, line: 1 }, end: { column: 4, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'r2',
      range: { start: { column: 5, line: 1 }, end: { column: 8, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 3, newText: 'ABC', oldText: 'abc' }],
          }),
          id: 'r1',
          priority: 1,
        },
      ],
      [
        'r2',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 4, end: 7, newText: 'DEF', oldText: 'def' }],
          }),
          id: 'r2',
          priority: 2,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v1, v2], rules, false)
    expect(report.changes).toHaveLength(2)
    expect(sf.replaceText).toHaveBeenCalledTimes(2)
  })
})

describe('applyFixesToFile - conflict reason details', () => {
  it('range conflict reason describes overlap', () => {
    const sf = createMockSourceFile('abcdef')
    const v1 = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 1, line: 1 }, end: { column: 4, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'r2',
      range: { start: { column: 2, line: 1 }, end: { column: 5, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 3, newText: 'X', oldText: 'abc' }],
          }),
          id: 'r1',
          priority: 1,
        },
      ],
      [
        'r2',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 1, end: 4, newText: 'Y', oldText: 'bcd' }],
          }),
          id: 'r2',
          priority: 2,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v1, v2], rules, false)
    expect(report.conflicts[0]?.reason).toBe('Overlapping fix range')
    expect(report.conflicts[0]?.ruleId).toBe('r2')
    expect(report.conflicts[0]?.conflictingRule).toBe('r1')
  })

  it('fix result conflict preserves custom reason', () => {
    const sf = createMockSourceFile('abc')
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 1, line: 1 }, end: { column: 4, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: false,
            changes: [],
            conflict: { conflictingRule: 'semantic', reason: 'Type mismatch' },
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.conflicts[0]?.reason).toBe('Type mismatch')
    expect(report.conflicts[0]?.conflictingRule).toBe('semantic')
  })

  it('conflict tracks which rule was blocked', () => {
    const sf = createMockSourceFile('abcdef')
    const v1 = createMockViolation({
      ruleId: 'winner',
      range: { start: { column: 1, line: 1 }, end: { column: 7, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'blocked',
      range: { start: { column: 1, line: 1 }, end: { column: 4, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'winner',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 6, newText: 'ALL', oldText: 'abcdef' }],
          }),
          id: 'winner',
          priority: 1,
        },
      ],
      [
        'blocked',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 3, newText: 'X', oldText: 'abc' }],
          }),
          id: 'blocked',
          priority: 2,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v1, v2], rules, false)
    expect(report.conflicts[0]?.ruleId).toBe('blocked')
    expect(report.conflicts[0]?.conflictingRule).toBe('winner')
  })

  it('multiple conflicts track correct rule pairs', () => {
    const sf = createMockSourceFile('abcdefgh')
    const v1 = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 1, line: 1 }, end: { column: 5, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'r2',
      range: { start: { column: 2, line: 1 }, end: { column: 5, line: 1 } },
    })
    const v3 = createMockViolation({
      ruleId: 'r3',
      range: { start: { column: 3, line: 1 }, end: { column: 6, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 4, newText: 'X', oldText: 'abcd' }],
          }),
          id: 'r1',
          priority: 1,
        },
      ],
      [
        'r2',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 1, end: 4, newText: 'Y', oldText: 'bcd' }],
          }),
          id: 'r2',
          priority: 2,
        },
      ],
      [
        'r3',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 2, end: 5, newText: 'Z', oldText: 'cde' }],
          }),
          id: 'r3',
          priority: 3,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v1, v2, v3], rules, false)
    expect(report.conflicts).toHaveLength(2)
    expect(report.conflicts[0]?.ruleId).toBe('r2')
    expect(report.conflicts[1]?.ruleId).toBe('r3')
  })
})

describe('applyFixesToFile - multiline range scenarios', () => {
  it('fix spanning two lines applies correctly', () => {
    const sf = createMockSourceFile('abc\ndef')
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 1, line: 1 }, end: { column: 3, line: 2 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 6, newText: 'ALL', oldText: 'abc\nde' }],
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.fixesApplied).toBe(1)
  })

  it('two fixes on same line but different columns do not conflict', () => {
    const sf = createMockSourceFile('abc  def')
    const v1 = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 1, line: 1 }, end: { column: 4, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'r2',
      range: { start: { column: 6, line: 1 }, end: { column: 9, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 3, newText: 'ABC', oldText: 'abc' }],
          }),
          id: 'r1',
          priority: 1,
        },
      ],
      [
        'r2',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 5, end: 8, newText: 'DEF', oldText: 'def' }],
          }),
          id: 'r2',
          priority: 2,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v1, v2], rules, false)
    expect(report.fixesApplied).toBe(2)
    expect(report.conflicts).toHaveLength(0)
  })

  it('fix on first line and fix on last line', () => {
    const sf = createMockSourceFile('aaa\nbbb\nccc')
    const v1 = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 1, line: 1 }, end: { column: 4, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'r2',
      range: { start: { column: 1, line: 3 }, end: { column: 4, line: 3 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 3, newText: 'AAA', oldText: 'aaa' }],
          }),
          id: 'r1',
          priority: 1,
        },
      ],
      [
        'r2',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 8, end: 11, newText: 'CCC', oldText: 'ccc' }],
          }),
          id: 'r2',
          priority: 2,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v1, v2], rules, false)
    expect(report.fixesApplied).toBe(2)
  })

  it('conflict across lines detected correctly', () => {
    const sf = createMockSourceFile('abcd\nefgh')
    const v1 = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 1, line: 1 }, end: { column: 3, line: 2 } },
    })
    const v2 = createMockViolation({
      ruleId: 'r2',
      range: { start: { column: 3, line: 1 }, end: { column: 5, line: 2 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 6, newText: 'X', oldText: 'abcd\ne' }],
          }),
          id: 'r1',
          priority: 1,
        },
      ],
      [
        'r2',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 2, end: 8, newText: 'Y', oldText: 'cd\nef' }],
          }),
          id: 'r2',
          priority: 2,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v1, v2], rules, false)
    expect(report.fixesApplied).toBe(1)
    expect(report.conflicts).toHaveLength(1)
  })
})

describe('applyFixesToFile - fix function behavior', () => {
  it('fix function is called once per fixable violation', () => {
    const sf = createMockSourceFile('a b c')
    let count = 0
    const vs = [0, 2, 4].map((col) =>
      createMockViolation({
        ruleId: 'r',
        range: { start: { column: col + 1, line: 1 }, end: { column: col + 2, line: 1 } },
      }),
    )
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => {
            count++
            return { applied: true, changes: [{ start: 0, end: 1, newText: 'X', oldText: 'a' }] }
          },
          id: 'r',
          priority: 1,
        },
      ],
    ])
    applyFixesToFile(sf, vs, rules, false)
    expect(count).toBe(3)
  })

  it('fix function not called for range-conflicting violations', () => {
    const sf = createMockSourceFile('abcdef')
    let r2Called = false
    const v1 = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 1, line: 1 }, end: { column: 5, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'r2',
      range: { start: { column: 2, line: 1 }, end: { column: 6, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 4, newText: 'XXXX', oldText: 'abcd' }],
          }),
          id: 'r1',
          priority: 1,
        },
      ],
      [
        'r2',
        {
          fix: (): FixResult => {
            r2Called = true
            return {
              applied: true,
              changes: [{ start: 1, end: 5, newText: 'YYYY', oldText: 'bcde' }],
            }
          },
          id: 'r2',
          priority: 2,
        },
      ],
    ])
    applyFixesToFile(sf, [v1, v2], rules, false)
    expect(r2Called).toBe(false)
  })

  it('fix function receives violation matching the rule', () => {
    const sf = createMockSourceFile('abc')
    let receivedId: string | null = null
    const v = createMockViolation({
      ruleId: 'my-rule',
      range: { start: { column: 1, line: 1 }, end: { column: 4, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'my-rule',
        {
          fix: (ctx): FixResult => {
            receivedId = ctx.violation.ruleId
            return {
              applied: true,
              changes: [{ start: 0, end: 3, newText: 'XXX', oldText: 'abc' }],
            }
          },
          id: 'my-rule',
          priority: 1,
        },
      ],
    ])
    applyFixesToFile(sf, [v], rules, false)
    expect(receivedId).toBe('my-rule')
  })

  it('fix returning applied=false without conflict is not counted', () => {
    const sf = createMockSourceFile('abc')
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 1, line: 1 }, end: { column: 4, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      ['r', { fix: (): FixResult => ({ applied: false, changes: [] }), id: 'r', priority: 1 }],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.fixesApplied).toBe(0)
    expect(report.fixesSkipped).toBe(0)
    expect(report.conflicts).toHaveLength(0)
  })

  it('fix returning applied=true with changes records all changes', () => {
    const sf = createMockSourceFile('abc')
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 1, line: 1 }, end: { column: 4, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [
              { start: 0, end: 1, newText: 'X', oldText: 'a' },
              { start: 1, end: 2, newText: 'Y', oldText: 'b' },
              { start: 2, end: 3, newText: 'Z', oldText: 'c' },
            ],
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.changes).toHaveLength(3)
    expect(report.fixesApplied).toBe(1)
  })
})

describe('applyFixesToFiles - additional edge cases', () => {
  it('many files each with no violations', () => {
    const sfs = Array.from({ length: 10 }, () => createMockSourceFile('x'))
    const report = applyFixesToFiles(
      sfs.map((sf) => ({ sourceFile: sf, violations: [] })),
      new Map(),
      false,
    )
    expect(report.filesProcessed).toBe(10)
    expect(report.totalFixesApplied).toBe(0)
    expect(report.fileReports).toHaveLength(10)
  })

  it('alternating applied and skipped across files', () => {
    const files = Array.from({ length: 4 }, (_, i) => {
      const sf = createMockSourceFile(i % 2 === 0 ? 'abc' : 'def')
      const ruleId = i % 2 === 0 ? 'apply' : 'skip'
      const v = createMockViolation({
        ruleId,
        range: { start: { column: 1, line: 1 }, end: { column: 4, line: 1 } },
      })
      return { sourceFile: sf, violations: [v] }
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'apply',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 3, newText: 'XXX', oldText: 'abc' }],
          }),
          id: 'apply',
          priority: 1,
        },
      ],
      [
        'skip',
        {
          fix: (): FixResult => ({
            applied: false,
            changes: [],
            conflict: { conflictingRule: 'x', reason: 'y' },
          }),
          id: 'skip',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFiles(files, rules, false)
    expect(report.totalFixesApplied).toBe(2)
    expect(report.totalFixesSkipped).toBe(2)
  })

  it('file report filePath matches source file', () => {
    const sf = createMockSourceFile('x')
    const report = applyFixesToFiles([{ sourceFile: sf, violations: [] }], new Map(), false)
    expect(report.fileReports[0]?.filePath).toBe('/test/file.ts')
  })

  it('total counts match sum of file reports', () => {
    const sf1 = createMockSourceFile('a')
    const sf2 = createMockSourceFile('b')
    const sf3 = createMockSourceFile('c')
    const v1 = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 1, line: 1 }, end: { column: 2, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 1, line: 1 }, end: { column: 2, line: 1 } },
    })
    const v3 = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 1, line: 1 }, end: { column: 2, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 1, newText: 'X', oldText: 'x' }],
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFiles(
      [
        { sourceFile: sf1, violations: [v1] },
        { sourceFile: sf2, violations: [v2] },
        { sourceFile: sf3, violations: [v3] },
      ],
      rules,
      false,
    )
    const sumApplied = report.fileReports.reduce((s, r) => s + r.fixesApplied, 0)
    const sumSkipped = report.fileReports.reduce((s, r) => s + r.fixesSkipped, 0)
    expect(sumApplied).toBe(report.totalFixesApplied)
    expect(sumSkipped).toBe(report.totalFixesSkipped)
  })
})

describe('applyFixesToFile - report completeness', () => {
  it('report always includes filePath', () => {
    const sf = createMockSourceFile('')
    const report = applyFixesToFile(sf, [], new Map(), false)
    expect(report.filePath).toBe('/test/file.ts')
  })

  it('report always includes fixesApplied number', () => {
    const sf = createMockSourceFile('x')
    const report = applyFixesToFile(sf, [], new Map(), false)
    expect(typeof report.fixesApplied).toBe('number')
  })

  it('report always includes fixesSkipped number', () => {
    const sf = createMockSourceFile('x')
    const report = applyFixesToFile(sf, [], new Map(), false)
    expect(typeof report.fixesSkipped).toBe('number')
  })

  it('report changes is always an array', () => {
    const sf = createMockSourceFile('x')
    const report = applyFixesToFile(sf, [], new Map(), false)
    expect(Array.isArray(report.changes)).toBe(true)
  })

  it('report conflicts is always an array', () => {
    const sf = createMockSourceFile('x')
    const report = applyFixesToFile(sf, [], new Map(), false)
    expect(Array.isArray(report.conflicts)).toBe(true)
  })

  it('conflict entry has ruleId field', () => {
    const sf = createMockSourceFile('abc')
    const v1 = createMockViolation({
      ruleId: 'r1',
      range: { start: { column: 1, line: 1 }, end: { column: 4, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 'r2',
      range: { start: { column: 2, line: 1 }, end: { column: 4, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 3, newText: 'X', oldText: 'abc' }],
          }),
          id: 'r1',
          priority: 1,
        },
      ],
      [
        'r2',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 1, end: 3, newText: 'Y', oldText: 'bc' }],
          }),
          id: 'r2',
          priority: 2,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v1, v2], rules, false)
    expect(report.conflicts[0]).toHaveProperty('ruleId')
    expect(report.conflicts[0]).toHaveProperty('conflictingRule')
    expect(report.conflicts[0]).toHaveProperty('reason')
  })

  it('TextChange has start, end, oldText, newText', () => {
    const sf = createMockSourceFile('abc')
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 1, line: 1 }, end: { column: 4, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 3, newText: 'XXX', oldText: 'abc' }],
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    const change = report.changes[0]
    expect(change).toHaveProperty('start')
    expect(change).toHaveProperty('end')
    expect(change).toHaveProperty('oldText')
    expect(change).toHaveProperty('newText')
  })
})

describe('applyFixesToFiles - report completeness', () => {
  it('report has fileReports array', () => {
    const report = applyFixesToFiles([], new Map(), false)
    expect(Array.isArray(report.fileReports)).toBe(true)
  })

  it('report has filesProcessed number', () => {
    const report = applyFixesToFiles([], new Map(), false)
    expect(typeof report.filesProcessed).toBe('number')
  })

  it('report has totalFixesApplied number', () => {
    const report = applyFixesToFiles([], new Map(), false)
    expect(typeof report.totalFixesApplied).toBe('number')
  })

  it('report has totalFixesSkipped number', () => {
    const report = applyFixesToFiles([], new Map(), false)
    expect(typeof report.totalFixesSkipped).toBe('number')
  })

  it('each fileReport has expected shape', () => {
    const sf = createMockSourceFile('abc')
    const report = applyFixesToFiles([{ sourceFile: sf, violations: [] }], new Map(), false)
    const fr = report.fileReports[0]
    expect(fr).toHaveProperty('filePath')
    expect(fr).toHaveProperty('fixesApplied')
    expect(fr).toHaveProperty('fixesSkipped')
    expect(fr).toHaveProperty('changes')
    expect(fr).toHaveProperty('conflicts')
  })
})

describe('applyFixesToFile - combined scenarios', () => {
  it('alternating applied and skipped violations', () => {
    const sf = createMockSourceFile('a b c d e')
    const v1 = createMockViolation({
      ruleId: 'a1',
      range: { start: { column: 1, line: 1 }, end: { column: 2, line: 1 } },
    })
    const v2 = createMockViolation({
      ruleId: 's1',
      range: { start: { column: 1, line: 1 }, end: { column: 2, line: 1 } },
    })
    const v3 = createMockViolation({
      ruleId: 'a2',
      range: { start: { column: 3, line: 1 }, end: { column: 4, line: 1 } },
    })
    const v4 = createMockViolation({
      ruleId: 's2',
      range: { start: { column: 5, line: 1 }, end: { column: 6, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'a1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 1, newText: 'A', oldText: 'a' }],
          }),
          id: 'a1',
          priority: 1,
        },
      ],
      [
        's1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 1, newText: 'B', oldText: 'a' }],
          }),
          id: 's1',
          priority: 2,
        },
      ],
      [
        'a2',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 2, end: 3, newText: 'C', oldText: 'b' }],
          }),
          id: 'a2',
          priority: 3,
        },
      ],
      [
        's2',
        {
          fix: (): FixResult => ({
            applied: false,
            changes: [],
            conflict: { conflictingRule: 'x', reason: 'y' },
          }),
          id: 's2',
          priority: 4,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v1, v2, v3, v4], rules, false)
    expect(report.fixesApplied).toBe(2)
    expect(report.fixesSkipped).toBe(2)
  })

  it('all violations resolve to null fix', () => {
    const sf = createMockSourceFile('a b c')
    const vs = ['r1', 'r2', 'r3'].map((id, i) =>
      createMockViolation({
        ruleId: id,
        range: { start: { column: i * 2 + 1, line: 1 }, end: { column: i * 2 + 2, line: 1 } },
      }),
    )
    const rules = new Map<string, RuleWithFix>([
      ['r1', { fix: (): FixResult | null => null, id: 'r1', priority: 1 }],
      ['r2', { fix: (): FixResult | null => null, id: 'r2', priority: 2 }],
      ['r3', { fix: (): FixResult | null => null, id: 'r3', priority: 3 }],
    ])
    const report = applyFixesToFile(sf, vs, rules, false)
    expect(report.fixesApplied).toBe(0)
    expect(report.fixesSkipped).toBe(0)
    expect(report.changes).toHaveLength(0)
    expect(report.conflicts).toHaveLength(0)
  })

  it('fix produces insertion at beginning of file', () => {
    const sf = createMockSourceFile('abc')
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 1, line: 1 }, end: { column: 1, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 0, newText: '/* header */', oldText: '' }],
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.fixesApplied).toBe(1)
    expect(report.changes[0]?.start).toBe(0)
    expect(report.changes[0]?.newText).toBe('/* header */')
  })

  it('fix produces insertion at end of file', () => {
    const sf = createMockSourceFile('abc')
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 1, line: 1 }, end: { column: 4, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 3, end: 3, newText: '\n// EOF', oldText: '' }],
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.fixesApplied).toBe(1)
    expect(report.changes[0]?.newText).toBe('\n// EOF')
  })

  it('fix replaces entire file content', () => {
    const sf = createMockSourceFile('old content')
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 1, line: 1 }, end: { column: 12, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 11, newText: 'new content', oldText: 'old content' }],
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.fixesApplied).toBe(1)
    expect(report.changes[0]?.newText).toBe('new content')
  })

  it('fix with unicode content', () => {
    const sf = createMockSourceFile('const π = 3.14')
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 1, line: 1 }, end: { column: 15, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 14, newText: 'const PI = 3.14', oldText: 'const π = 3.14' }],
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.fixesApplied).toBe(1)
  })

  it('fix producing only whitespace change', () => {
    const sf = createMockSourceFile('a  b')
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 1, line: 1 }, end: { column: 5, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 1, end: 3, newText: ' ', oldText: '  ' }],
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.fixesApplied).toBe(1)
    expect(report.changes[0]?.newText).toBe(' ')
  })

  it('multiple fixes from same rule across file', () => {
    const sf = createMockSourceFile('a b c d')
    const vs = [0, 2, 4, 6].map((col) =>
      createMockViolation({
        ruleId: 'replace',
        range: { start: { column: col + 1, line: 1 }, end: { column: col + 2, line: 1 } },
      }),
    )
    const rules = new Map<string, RuleWithFix>([
      [
        'replace',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 1, newText: 'X', oldText: 'a' }],
          }),
          id: 'replace',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, vs, rules, false)
    expect(report.fixesApplied).toBe(4)
  })

  it('dry-run with null result does not modify file', () => {
    const sf = createMockSourceFile('abc')
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 1, line: 1 }, end: { column: 4, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      ['r', { fix: (): FixResult | null => null, id: 'r', priority: 1 }],
    ])
    applyFixesToFile(sf, [v], rules, true)
    expect(sf.replaceText).not.toHaveBeenCalled()
  })

  it('file with windows-style line endings conceptually works', () => {
    const sf = createMockSourceFile('abc\r\ndef')
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 1, line: 1 }, end: { column: 4, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 3, newText: 'ABC', oldText: 'abc' }],
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.fixesApplied).toBe(1)
  })

  it('fix context getNodeByRange is available in fix function', () => {
    const sf = createMockSourceFile('abc')
    let hasGetNodeByRange = false
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 1, line: 1 }, end: { column: 4, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (ctx): FixResult => {
            hasGetNodeByRange = typeof ctx.getNodeByRange === 'function'
            return {
              applied: true,
              changes: [{ start: 0, end: 3, newText: 'XXX', oldText: 'abc' }],
            }
          },
          id: 'r',
          priority: 1,
        },
      ],
    ])
    applyFixesToFile(sf, [v], rules, false)
    expect(hasGetNodeByRange).toBe(true)
  })

  it('file with tab characters', () => {
    const sf = createMockSourceFile('\tconst x = 1;')
    const v = createMockViolation({
      ruleId: 'r',
      range: { start: { column: 1, line: 1 }, end: { column: 14, line: 1 } },
    })
    const rules = new Map<string, RuleWithFix>([
      [
        'r',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ start: 0, end: 13, newText: '  const x = 1;', oldText: '\tconst x = 1;' }],
          }),
          id: 'r',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sf, [v], rules, false)
    expect(report.fixesApplied).toBe(1)
  })
})
