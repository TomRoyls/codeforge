import { describe, expect, it, vi } from 'vitest'
import type { SourceFile } from 'ts-morph'
import type { RuleViolation } from '../../../src/ast/visitor.js'
import { createFixContext } from '../../../src/fix/context.js'
import { applyFixesToFile, createTextChange, type RuleWithFix } from '../../../src/fix/fixer.js'
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
})
