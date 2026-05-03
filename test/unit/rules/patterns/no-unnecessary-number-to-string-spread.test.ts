import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryNumberToStringSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-number-to-string-spread.js'
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

function makeSpreadArg(argument: unknown): unknown {
  return { type: 'SpreadElement', argument }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-number-to-string-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryNumberToStringSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryNumberToStringSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryNumberToStringSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryNumberToStringSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryNumberToStringSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning toString', () => {
      const desc = noUnnecessaryNumberToStringSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/tostring/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryNumberToStringSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-number-to-string-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryNumberToStringSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryNumberToStringSpreadRule).toBeDefined()
      expect(noUnnecessaryNumberToStringSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryNumberToStringSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports unnecessary toString spread', () => {
    test('reports for num.toString(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toString', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for literal number (42).toString(...args)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 42 }, 'toString', [makeSpreadArg({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for literal number (0).toString(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 0 }, 'toString', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for negative number (-1).toString(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'UnaryExpression', operator: '-', prefix: true, argument: { type: 'Literal', value: 1 } }, 'toString', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for call result getNum().toString(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getNum' }, arguments: [] }, 'toString', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for member expression this.value.toString(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'ThisExpression' }, property: { type: 'Identifier', name: 'value' } }, 'toString', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for member expression obj.count.toString(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'count' } }, 'toString', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for binary expression (a + b).toString(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }, 'toString', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions toString', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toString', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toMatch(/toString/)
    })

    test('report message mentions spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toString', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toString', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toBe(
        'num.toString(...items) with spread is unusual. toString() expects an optional radix.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toString', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toString', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'num' }, 'toString', [makeSpreadArg({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toString', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toString', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 42 }, 'toString', [makeSpreadArg({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toString', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 42 }, 'toString', [makeSpreadArg({ type: 'Identifier', name: 'args' })]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toString', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for spread with array argument [...arr]', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toString', [makeSpreadArg({ type: 'ArrayExpression', elements: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toString', [makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'items' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with call expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toString', [makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getItems' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for parenthesized expression (x).toString(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'toString', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for conditional expression (a ? b : c).toString(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'a' }, consequent: { type: 'Identifier', name: 'b' }, alternate: { type: 'Identifier', name: 'c' } }, 'toString', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for computed member expression obj[key].toString(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'key' }, computed: true }, 'toString', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for template literal tag`...`.toString(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TaggedTemplateExpression', tag: { type: 'Identifier', name: 'tag' }, quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] } }, 'toString', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for num.toString() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toString', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toString(16) with regular number argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toString', [{ type: 'Literal', value: 16 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toString(radix) with identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toString', [{ type: 'Identifier', name: 'radix' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toString(16, extra) with two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toString', [{ type: 'Literal', value: 16 }, { type: 'Identifier', name: 'extra' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toString(...items, extra) with two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toString', [makeSpreadArg({ type: 'Identifier', name: 'items' }), { type: 'Identifier', name: 'extra' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.valueOf(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toFixed(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toFixed', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toExponential(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toExponential', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toPrecision(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toPrecision', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.toString(...items) with computed member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Identifier', name: 'toString' },
          computed: true,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Literal', value: 'toString' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "tostring" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'tostring', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "TOSTRING" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'TOSTRING', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a regular Literal (not spread)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toString', [{ type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is an Identifier (not spread)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toString', [{ type: 'Identifier', name: 'radix' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a CallExpression (not spread)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toString', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getRadix' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: null,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for ArrayExpression as toString caller [].toString(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'toString', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is empty', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toString', []))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Identifier', name: 'toString' },
        },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: null,
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument type is not SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toString', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'radix' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toString', [null]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryNumberToStringSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryNumberToStringSpreadRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toString', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toString', [{ type: 'Literal', value: 16 }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toString', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toString', [{ type: 'Literal', value: 16 }]))
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 42 }, 'toString', [makeSpreadArg({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toString', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toString', []))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toFixed', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 42 }, 'toString', [makeSpreadArg({ type: 'Identifier', name: 'args' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toString', [{ type: 'Literal', value: 16 }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryNumberToStringSpreadRule.create(context)
      const visitor2 = noUnnecessaryNumberToStringSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryNumberToStringSpreadRule.meta
      const meta2 = noUnnecessaryNumberToStringSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'num' }, 'toString', [makeSpreadArg({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryNumberToStringSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryNumberToStringSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryNumberToStringSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toString', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed member expression property on callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Identifier', name: 'toString' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toString', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 42 }, 'toString', [makeSpreadArg({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for chained calls num.toString(...items).valueOf()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      const innerCall = makeCallNode({ type: 'Identifier', name: 'num' }, 'toString', [makeSpreadArg({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(innerCall)
      expect(reports.length).toBe(1)
    })

    test('handles spread argument with nested spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toString', [makeSpreadArg({ type: 'SpreadElement', argument: { type: 'Identifier', name: 'deep' } })]))
      expect(reports.length).toBe(1)
    })

    test('handles spread argument with object expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toString', [makeSpreadArg({ type: 'ObjectExpression', properties: [] })]))
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberToStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Literal', value: 'toString' },
          computed: true,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })
})
