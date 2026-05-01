import { describe, test, expect, vi } from 'vitest'
import { noLargeJestSnapshotsRule } from '../../../../src/rules/testing/no-large-jest-snapshots.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = 'expect(x).toMatchInlineSnapshot();',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []
  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => { reports.push({ message: descriptor.message, loc: descriptor.loc }) },
    getFilePath: () => filePath,
    getAST: () => null,
    getSource: () => source,
    getTokens: () => [],
    getComments: () => [],
    config: { options: [options] },
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    workspaceRoot: '/src',
  } as unknown as RuleContext
  return { context, reports }
}

function generateMultilineString(lines: number): string {
  if (lines <= 0) return ''
  const parts: string[] = []
  for (let i = 0; i < lines; i++) {
    parts.push(`line ${i + 1}`)
  }
  return parts.join('\n')
}

function createMatchInlineSnapshotCall(
  snapshotContent: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{ type: 'Identifier', name: 'result' }],
      },
      property: { type: 'Identifier', name: 'toMatchInlineSnapshot' },
    },
    arguments: [
      { type: 'Literal', value: snapshotContent },
    ],
    loc: { start: { line, column }, end: { line, column: column + 50 } },
  }
}

function createMatchInlineSnapshotWithPropertyMatchers(
  snapshotContent: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{ type: 'Identifier', name: 'result' }],
      },
      property: { type: 'Identifier', name: 'toMatchInlineSnapshot' },
    },
    arguments: [
      { type: 'ObjectExpression', properties: [] },
      { type: 'Literal', value: snapshotContent },
    ],
    loc: { start: { line, column }, end: { line, column: column + 50 } },
  }
}

function createMatchInlineSnapshotTemplateLiteral(
  snapshotContent: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{ type: 'Identifier', name: 'result' }],
      },
      property: { type: 'Identifier', name: 'toMatchInlineSnapshot' },
    },
    arguments: [
      {
        type: 'TemplateLiteral',
        quasis: [
          { type: 'TemplateElement', value: { cooked: snapshotContent, raw: snapshotContent } },
        ],
        expressions: [],
      },
    ],
    loc: { start: { line, column }, end: { line, column: column + 50 } },
  }
}

function createToMatchSnapshotCall(
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{ type: 'Identifier', name: 'result' }],
      },
      property: { type: 'Identifier', name: 'toMatchSnapshot' },
    },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
}

function createRegularMatcherCall(matcherName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{ type: 'Identifier', name: 'x' }],
      },
      property: { type: 'Identifier', name: matcherName },
    },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

describe('no-large-jest-snapshots rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(noLargeJestSnapshotsRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noLargeJestSnapshotsRule.meta.severity).toBe('warn')
    })

    test('should have correct category', () => {
      expect(noLargeJestSnapshotsRule.meta.docs?.category).toBe('testing')
    })

    test('should have description containing snapshot', () => {
      const desc = noLargeJestSnapshotsRule.meta.docs?.description.toLowerCase() ?? ''
      expect(desc).toContain('snapshot')
    })

    test('should not be recommended', () => {
      expect(noLargeJestSnapshotsRule.meta.docs?.recommended).toBe(false)
    })

    test('should have schema defined', () => {
      expect(noLargeJestSnapshotsRule.meta.schema).toBeDefined()
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(noLargeJestSnapshotsRule.meta.schema)).toBe(true)
    })

    test('should not include fixable field', () => {
      expect(noLargeJestSnapshotsRule.meta.fixable).toBeUndefined()
    })

    test('should have a docs.url property', () => {
      expect(noLargeJestSnapshotsRule.meta.docs?.url).toBeDefined()
    })

    test('should have docs.url containing codeforge', () => {
      expect(noLargeJestSnapshotsRule.meta.docs?.url).toContain('codeforge')
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return a function for CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  describe('large snapshots detected', () => {
    test('should report snapshot with 51 lines (default maxSize 50)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(51)))

      expect(reports.length).toBe(1)
    })

    test('should report snapshot with 100 lines', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(100)))

      expect(reports.length).toBe(1)
    })

    test('should report snapshot with 200 lines', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(200)))

      expect(reports.length).toBe(1)
    })

    test('should report snapshot with 500 lines', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(500)))

      expect(reports.length).toBe(1)
    })

    test('should report snapshot with 75 lines', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(75)))

      expect(reports.length).toBe(1)
    })

    test('should report snapshot with 60 lines', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(60)))

      expect(reports.length).toBe(1)
    })

    test('should report snapshot with 52 lines', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(52)))

      expect(reports.length).toBe(1)
    })

    test('should report multiple large snapshots independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(60), 1, 0))
      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(80), 5, 0))
      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(100), 10, 0))

      expect(reports.length).toBe(3)
    })

    test('should report snapshot with only newlines exceeding threshold', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      const newlineStr = '\n'.repeat(51)
      visitor.CallExpression(createMatchInlineSnapshotCall(newlineStr))

      expect(reports.length).toBe(1)
    })

    test('should report snapshot with mixed content exceeding threshold', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      const content = '<div>\n' + '  <span>text</span>\n'.repeat(50) + '</div>'
      visitor.CallExpression(createMatchInlineSnapshotCall(content))

      expect(reports.length).toBe(1)
    })

    test('should report snapshot at exactly 51 lines with property matchers', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotWithPropertyMatchers(generateMultilineString(51)))

      expect(reports.length).toBe(1)
    })

    test('should report template literal snapshot exceeding threshold', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotTemplateLiteral(generateMultilineString(60)))

      expect(reports.length).toBe(1)
    })

    test('should report snapshot with exactly 1000 lines', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(1000)))

      expect(reports.length).toBe(1)
    })

    test('should report snapshot with just 1 more line than threshold', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(51)))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('51 lines')
    })

    test('should report large snapshot from nested test file', () => {
      const { context, reports } = createMockContext({}, '/src/components/Button.test.ts')
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(80)))

      expect(reports.length).toBe(1)
    })
  })

  describe('small snapshots OK', () => {
    test('should not report snapshot with 50 lines (at threshold)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(50)))

      expect(reports.length).toBe(0)
    })

    test('should not report snapshot with 49 lines', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(49)))

      expect(reports.length).toBe(0)
    })

    test('should not report snapshot with 10 lines', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(10)))

      expect(reports.length).toBe(0)
    })

    test('should not report snapshot with 5 lines', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(5)))

      expect(reports.length).toBe(0)
    })

    test('should not report snapshot with 1 line', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall('single line'))

      expect(reports.length).toBe(0)
    })

    test('should not report empty string snapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(''))

      expect(reports.length).toBe(0)
    })

    test('should not report snapshot with 25 lines', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(25)))

      expect(reports.length).toBe(0)
    })

    test('should not report snapshot with 30 lines', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(30)))

      expect(reports.length).toBe(0)
    })

    test('should not report snapshot with 40 lines', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(40)))

      expect(reports.length).toBe(0)
    })

    test('should not report snapshot with 2 lines', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall('line 1\nline 2'))

      expect(reports.length).toBe(0)
    })

    test('should not report snapshot with 3 lines', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall('a\nb\nc'))

      expect(reports.length).toBe(0)
    })

    test('should not report snapshot with 45 lines', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(45)))

      expect(reports.length).toBe(0)
    })

    test('should not report snapshot with 20 lines', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(20)))

      expect(reports.length).toBe(0)
    })

    test('should not report snapshot with 15 lines', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(15)))

      expect(reports.length).toBe(0)
    })

    test('should not report snapshot at threshold boundary (exactly 50)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      const exactly50 = Array.from({ length: 50 }, (_, i) => `line ${i + 1}`).join('\n')
      visitor.CallExpression(createMatchInlineSnapshotCall(exactly50))

      expect(reports.length).toBe(0)
    })
  })

  describe('custom maxSize', () => {
    test('should report snapshot exceeding custom maxSize of 10', () => {
      const { context, reports } = createMockContext({ maxSize: 10 })
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(11)))

      expect(reports.length).toBe(1)
    })

    test('should not report snapshot within custom maxSize of 10', () => {
      const { context, reports } = createMockContext({ maxSize: 10 })
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(10)))

      expect(reports.length).toBe(0)
    })

    test('should report snapshot exceeding custom maxSize of 20', () => {
      const { context, reports } = createMockContext({ maxSize: 20 })
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(21)))

      expect(reports.length).toBe(1)
    })

    test('should not report snapshot within custom maxSize of 20', () => {
      const { context, reports } = createMockContext({ maxSize: 20 })
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(20)))

      expect(reports.length).toBe(0)
    })

    test('should report snapshot exceeding custom maxSize of 1', () => {
      const { context, reports } = createMockContext({ maxSize: 1 })
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall('line1\nline2'))

      expect(reports.length).toBe(1)
    })

    test('should not report single line with maxSize of 1', () => {
      const { context, reports } = createMockContext({ maxSize: 1 })
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall('single line'))

      expect(reports.length).toBe(0)
    })

    test('should use default maxSize when maxSize is not a number', () => {
      const { context, reports } = createMockContext({ maxSize: 'not-a-number' })
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(51)))

      expect(reports.length).toBe(1)
    })

    test('should use default maxSize when maxSize is undefined', () => {
      const { context, reports } = createMockContext({ maxSize: undefined })
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(51)))

      expect(reports.length).toBe(1)
    })

    test('should handle very large maxSize of 1000', () => {
      const { context, reports } = createMockContext({ maxSize: 1000 })
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(100)))

      expect(reports.length).toBe(0)
    })

    test('should report when maxSize is 0 and snapshot has 1 line', () => {
      const { context, reports } = createMockContext({ maxSize: 0 })
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall('single line'))

      expect(reports.length).toBe(1)
    })
  })

  describe('non-snapshot matchers', () => {
    test('should not report toBe matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createRegularMatcherCall('toBe'))

      expect(reports.length).toBe(0)
    })

    test('should not report toEqual matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createRegularMatcherCall('toEqual'))

      expect(reports.length).toBe(0)
    })

    test('should not report toContain matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createRegularMatcherCall('toContain'))

      expect(reports.length).toBe(0)
    })

    test('should not report toBeTruthy matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createRegularMatcherCall('toBeTruthy'))

      expect(reports.length).toBe(0)
    })

    test('should not report toBeFalsy matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createRegularMatcherCall('toBeFalsy'))

      expect(reports.length).toBe(0)
    })

    test('should not report toBeNull matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createRegularMatcherCall('toBeNull'))

      expect(reports.length).toBe(0)
    })

    test('should not report toBeUndefined matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createRegularMatcherCall('toBeUndefined'))

      expect(reports.length).toBe(0)
    })

    test('should not report toHaveLength matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createRegularMatcherCall('toHaveLength'))

      expect(reports.length).toBe(0)
    })

    test('should not report toThrow matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createRegularMatcherCall('toThrow'))

      expect(reports.length).toBe(0)
    })

    test('should not report resolves matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createRegularMatcherCall('resolves'))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'toMatchInlineSnapshot' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle non-string literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'toMatchInlineSnapshot' },
        },
        arguments: [
          { type: 'Literal', value: 42 },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      const node = { type: 'CallExpression', arguments: [] }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      const node = createMatchInlineSnapshotCall(generateMultilineString(60))
      delete (node as Record<string, unknown>).loc

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle template literal with expressions (not counted)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'toMatchInlineSnapshot' },
        },
        arguments: [
          {
            type: 'TemplateLiteral',
            quasis: [
              { type: 'TemplateElement', value: { cooked: 'first', raw: 'first' } },
              { type: 'TemplateElement', value: { cooked: 'second', raw: 'second' } },
            ],
            expressions: [{ type: 'Identifier', name: 'x' }],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle template literal with empty quasis', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'toMatchInlineSnapshot' },
        },
        arguments: [
          {
            type: 'TemplateLiteral',
            quasis: [],
            expressions: [],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle callee with computed property', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [],
          },
          property: { type: 'Literal', value: 'toMatchInlineSnapshot' },
        },
        arguments: [
          { type: 'Literal', value: generateMultilineString(60) },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('toMatchInlineSnapshot vs toMatchSnapshot', () => {
    test('should check toMatchInlineSnapshot for size', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(60)))

      expect(reports.length).toBe(1)
    })

    test('should NOT check toMatchSnapshot for size', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createToMatchSnapshotCall())

      expect(reports.length).toBe(0)
    })

    test('should not report toMatchSnapshot even with large external snapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createToMatchSnapshotCall())

      expect(reports.length).toBe(0)
    })

    test('should report toMatchInlineSnapshot but not toMatchSnapshot in same pass', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(60)))
      visitor.CallExpression(createToMatchSnapshotCall())

      expect(reports.length).toBe(1)
    })

    test('should correctly identify toMatchInlineSnapshot as the only checked matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      const nearMatch = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'toMatchInlineSnapshotData' },
        },
        arguments: [
          { type: 'Literal', value: generateMultilineString(60) },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(nearMatch)

      expect(reports.length).toBe(0)
    })
  })

  describe('location reporting', () => {
    test('should report correct location for large snapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(60), 7, 4))

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report correct end location', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(60), 3, 8))

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(58)
    })

    test('should report different locations for multiple violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(60), 2, 4))
      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(80), 10, 2))

      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[1].loc?.start.line).toBe(10)
    })

    test('should default to line 1 when node has no loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      const node = createMatchInlineSnapshotCall(generateMultilineString(60))
      delete (node as Record<string, unknown>).loc

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should report location with property matchers present', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotWithPropertyMatchers(generateMultilineString(60), 15, 10))

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(10)
    })
  })

  describe('various file paths', () => {
    test('should work with .test.ts files', () => {
      const { context, reports } = createMockContext({}, '/src/utils/helpers.test.ts')
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(60)))

      expect(reports.length).toBe(1)
    })

    test('should work with .spec.ts files', () => {
      const { context, reports } = createMockContext({}, '/src/components/Button.spec.ts')
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(60)))

      expect(reports.length).toBe(1)
    })

    test('should work with .test.js files', () => {
      const { context, reports } = createMockContext({}, '/src/api/auth.test.js')
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(60)))

      expect(reports.length).toBe(1)
    })

    test('should work with deeply nested test files', () => {
      const { context, reports } = createMockContext({}, '/src/modules/user/services/auth.test.ts')
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(60)))

      expect(reports.length).toBe(1)
    })

    test('should work with test files in root', () => {
      const { context, reports } = createMockContext({}, '/test/integration/api.test.ts')
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(60)))

      expect(reports.length).toBe(1)
    })
  })

  describe('message format', () => {
    test('should include the maxSize in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(60)))

      expect(reports[0].message).toContain('50')
    })

    test('should include actual line count in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(75)))

      expect(reports[0].message).toContain('75 lines')
    })

    test('should include "snapshot" in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(60)))

      expect(reports[0].message).toContain('snapshot')
    })

    test('should include custom maxSize in message', () => {
      const { context, reports } = createMockContext({ maxSize: 10 })
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(15)))

      expect(reports[0].message).toContain('10')
      expect(reports[0].message).toContain('15 lines')
    })

    test('should include "externalize" or "externalizing" suggestion', () => {
      const { context, reports } = createMockContext()
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(60)))

      const msg = reports[0].message.toLowerCase()
      expect(msg).toContain('externaliz')
    })
  })

  describe('rule meta tests', () => {
    test('should have meta as a plain object', () => {
      expect(typeof noLargeJestSnapshotsRule.meta).toBe('object')
      expect(noLargeJestSnapshotsRule.meta).not.toBeNull()
      expect(Array.isArray(noLargeJestSnapshotsRule.meta)).toBe(false)
    })

    test('should have create as a function', () => {
      expect(typeof noLargeJestSnapshotsRule.create).toBe('function')
    })

    test('should have description mentioning large', () => {
      const desc = noLargeJestSnapshotsRule.meta.docs?.description.toLowerCase() ?? ''
      expect(desc).toContain('large')
    })

    test('should have description mentioning inline', () => {
      const desc = noLargeJestSnapshotsRule.meta.docs?.description.toLowerCase() ?? ''
      expect(desc).toContain('inline')
    })

    test('should have maxSize in schema properties', () => {
      const schema = noLargeJestSnapshotsRule.meta.schema
      const firstEntry = schema?.[0] as Record<string, unknown>
      const properties = firstEntry?.properties as Record<string, unknown>
      expect(properties).toHaveProperty('maxSize')
    })
  })

  describe('default export', () => {
    test('default export should be defined', async () => {
      const mod = await import('../../../../src/rules/testing/no-large-jest-snapshots.js')
      expect(mod.default).toBeDefined()
      expect(mod.default).toBe(noLargeJestSnapshotsRule)
    })
  })

  describe('schema structure', () => {
    test('should have schema with object type at index 0', () => {
      const schema = noLargeJestSnapshotsRule.meta.schema
      expect(Array.isArray(schema)).toBe(true)
      expect(schema?.[0]).toHaveProperty('type', 'object')
    })

    test('should have additionalProperties false on schema', () => {
      const schema = noLargeJestSnapshotsRule.meta.schema
      const firstEntry = schema?.[0] as Record<string, unknown>
      expect(firstEntry).toHaveProperty('additionalProperties', false)
    })
  })

  describe('independent visitor instances', () => {
    test('should return independent visitors for different contexts', () => {
      const { context: ctx1, reports: rep1 } = createMockContext({ maxSize: 10 })
      const { context: ctx2, reports: rep2 } = createMockContext({ maxSize: 100 })
      const visitor1 = noLargeJestSnapshotsRule.create(ctx1)
      const visitor2 = noLargeJestSnapshotsRule.create(ctx2)

      visitor1.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(20)))
      visitor2.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(20)))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('should have separate thresholds per visitor', () => {
      const { context: ctx1, reports: rep1 } = createMockContext({ maxSize: 5 })
      const { context: ctx2, reports: rep2 } = createMockContext({ maxSize: 100 })
      const visitor1 = noLargeJestSnapshotsRule.create(ctx1)
      const visitor2 = noLargeJestSnapshotsRule.create(ctx2)

      visitor1.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(10)))
      visitor2.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(10)))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })
  })

  describe('options edge cases', () => {
    test('should handle options with extra fields', () => {
      const { context, reports } = createMockContext({ maxSize: 10, extraField: 'ignored' })
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(15)))

      expect(reports.length).toBe(1)
    })

    test('should handle empty options object', () => {
      const { context, reports } = createMockContext({})
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(60)))

      expect(reports.length).toBe(1)
    })

    test('should handle config with empty options array', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => { reports.push(d) },
        getFilePath: () => '/src/file.test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(60)))

      expect(reports.length).toBe(1)
    })

    test('should handle config without options', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => { reports.push(d) },
        getFilePath: () => '/src/file.test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall(generateMultilineString(60)))

      expect(reports.length).toBe(1)
    })

    test('should handle negative maxSize by using default', () => {
      const { context, reports } = createMockContext({ maxSize: -1 })
      const visitor = noLargeJestSnapshotsRule.create(context)

      visitor.CallExpression(createMatchInlineSnapshotCall('single line'))

      expect(reports.length).toBe(1)
    })
  })
})
