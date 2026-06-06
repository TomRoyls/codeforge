import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringRepeatEmptyRule } from '../../../../src/rules/patterns/no-unnecessary-string-repeat-empty.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { end: { column: number; line: number }; start: { column: number; line: number } }
  node?: unknown
}

function makeLoc(startLine: number, startCol: number, endLine: number, endCol: number) {
  return {
    start: { line: startLine, column: startCol },
    end: { line: endLine, column: endCol },
  }
}

function createMockContext(): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []
  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        node: descriptor.node,
      })
    },
    getFilePath: () => '/src/file.ts',
    getAST: () => null,
    getSource: () => '[]',
    getTokens: () => [],
    getComments: () => [],
    config: { options: [{}] },
    logger: {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
    workspaceRoot: '/src',
  } as unknown as RuleContext
  return { context, reports }
}

function makeCallNode(
  object: unknown,
  methodName: string,
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object,
      property: { type: 'Identifier', name: methodName },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeEmptyStringLiteral(): unknown {
  return { type: 'Literal', value: '' }
}

function makeStringLiteral(value: string): unknown {
  return { type: 'Literal', value }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-string-repeat-empty rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringRepeatEmptyRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringRepeatEmptyRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringRepeatEmptyRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringRepeatEmptyRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringRepeatEmptyRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning repeat', () => {
      const desc = noUnnecessaryStringRepeatEmptyRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/repeat/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringRepeatEmptyRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-repeat-empty.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringRepeatEmptyRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringRepeatEmptyRule).toBeDefined()
      expect(noUnnecessaryStringRepeatEmptyRule.meta).toBeDefined()
      expect(noUnnecessaryStringRepeatEmptyRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (28) =====

  describe('positive cases — reports unnecessary string repeat empty', () => {
    test('reports for empty string repeat zero: \'\'.repeat(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'repeat', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions unnecessary', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'repeat', [{ type: 'Literal', value: 0 }]))
      expect(reports[0].message).toMatch(/unnecessary/i)
    })

    test('report message mentions repeat', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'repeat', [{ type: 'Literal', value: 0 }]))
      expect(reports[0].message).toMatch(/repeat/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'repeat', [{ type: 'Literal', value: 0 }]))
      expect(reports[0].message).toBe(
        `''.repeat(0) always returns an empty string. This is unnecessary.`,
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'repeat', [{ type: 'Literal', value: 0 }]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'repeat', [{ type: 'Literal', value: 0 }]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      const node = makeCallNode(makeEmptyStringLiteral(), 'repeat', [{ type: 'Literal', value: 0 }])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'repeat', [{ type: 'Literal', value: 0 }], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'repeat', [{ type: 'Literal', value: 0 }]))
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'repeat', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'repeat', [{ type: 'Literal', value: 0 }]))
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'repeat', [{ type: 'Literal', value: 0 }]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'repeat', [{ type: 'Literal', value: 0 }]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports with NumericLiteral argument value 0 as number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'repeat', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports when empty string has extra properties on object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: '', extra: true },
          property: { type: 'Identifier', name: 'repeat' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(1)
    })

    test('reports when NumericLiteral arg has extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'repeat', [{ type: 'Literal', value: 0, raw: '0' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for deeply nested empty string repeat zero', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Identifier', name: 'repeat' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(10, 5, 10, 20),
        _parent: {},
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Identifier', name: 'repeat' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Identifier', name: 'repeat' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports for node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Identifier', name: 'repeat' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('reports for node with range property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Identifier', name: 'repeat' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
      })
      expect(reports.length).toBe(1)
    })

    test('reports for node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Identifier', name: 'repeat' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports when computed is false on MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Identifier', name: 'repeat' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'repeat', [{ type: 'Literal', value: 0 }], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      const node = makeCallNode(makeEmptyStringLiteral(), 'repeat', [{ type: 'Literal', value: 0 }])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'repeat', [{ type: 'Literal', value: 0 }]))
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'repeat', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for empty string with NumericLiteral zero from makeCallNode', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'repeat', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("''.repeat(0)")
    })

    test('reports when argument is numeric zero (not string zero)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'repeat', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Identifier', name: 'repeat' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for non-empty string repeat zero: "hello".repeat(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'repeat', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for single-char string repeat zero: "a".repeat(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('a'), 'repeat', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for space string repeat zero: " ".repeat(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(' '), 'repeat', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for empty string repeat one: \'\'.repeat(1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'repeat', [{ type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for empty string repeat two: \'\'.repeat(2)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'repeat', [{ type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for empty string repeat negative: \'\'.repeat(-1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'repeat', [{ type: 'Literal', value: -1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for empty string repeat decimal: \'\'.repeat(0.5)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'repeat', [{ type: 'Literal', value: 0.5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for variable.repeat(0) — Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for empty string with wrong method: \'\'.padStart(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'padStart', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for empty string with wrong method: \'\'.indexOf(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'indexOf', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for empty string with wrong method: \'\'.toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'toString', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for empty string with method "Repeat" (capital)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'Repeat', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for empty string with method "repeat" lowercase variant', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'repea', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for empty string with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'repeat', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for empty string with two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'repeat', [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for empty string with Identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'repeat', [{ type: 'Identifier', name: 'n' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for empty string with Literal argument (wrong type)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'repeat', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for empty string with CallExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'repeat', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getZero' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [{ type: 'Literal', value: 0 }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [{ type: 'Literal', value: 0 }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [{ type: 'Literal', value: 0 }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Literal', value: 'repeat' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "repeatt" (typo)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'repeatt', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getStr' }, arguments: [] }, 'repeat', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'str' } }, 'repeat', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'repeat' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'repeat' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'repeat', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'repeat', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is computed with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Literal', value: 'repeat' },
          computed: true,
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: null,
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringRepeatEmptyRule.create(ctx1)
      const visitor2 = noUnnecessaryStringRepeatEmptyRule.create(ctx2)
      visitor1.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'repeat', [{ type: 'Literal', value: 0 }]))
      visitor2.CallExpression(makeCallNode(makeStringLiteral('hello'), 'repeat', [{ type: 'Literal', value: 0 }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'repeat', [{ type: 'Literal', value: 0 }]))
      visitor.CallExpression(makeCallNode(makeStringLiteral('x'), 'repeat', [{ type: 'Literal', value: 0 }]))
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'repeat', [{ type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(1)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'repeat', [{ type: 'Literal', value: 0 }]))
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'repeat', [{ type: 'Literal', value: 0 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', [{ type: 'Literal', value: 0 }]))
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'repeat', [{ type: 'Literal', value: 1 }]))
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'repeat', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringRepeatEmptyRule.create(context)
      const visitor2 = noUnnecessaryStringRepeatEmptyRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringRepeatEmptyRule.meta
      const meta2 = noUnnecessaryStringRepeatEmptyRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Identifier', name: 'repeat' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, 'repeat', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is Literal type (not StringLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: '' }, 'repeat', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'repeat', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'zero' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'repeat', [{ type: 'BinaryExpression', operator: '-', left: { type: 'Literal', value: 1 }, right: { type: 'Literal', value: 1 } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is UnaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'repeat', [{ type: 'UnaryExpression', operator: '-', prefix: true, argument: { type: 'Literal', value: 0 } }]))
      expect(reports.length).toBe(0)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringRepeatEmptyRule).toBeDefined()
      expect(typeof noUnnecessaryStringRepeatEmptyRule.create).toBe('function')
      expect(typeof noUnnecessaryStringRepeatEmptyRule.meta).toBe('object')
    })

    test('does not report for empty string with undefined argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'repeat', [{ type: 'Identifier', name: 'undefined' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for empty string with null argument value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringRepeatEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'repeat', [null]))
      expect(reports.length).toBe(0)
    })
  })
})
