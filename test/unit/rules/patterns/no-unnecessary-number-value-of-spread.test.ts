import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryNumberValueOfSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-number-value-of-spread.js'
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

describe('no-unnecessary-number-value-of-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryNumberValueOfSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryNumberValueOfSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryNumberValueOfSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryNumberValueOfSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryNumberValueOfSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning valueOf', () => {
      const desc = noUnnecessaryNumberValueOfSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/valueof/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryNumberValueOfSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-number-value-of-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryNumberValueOfSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryNumberValueOfSpreadRule).toBeDefined()
      expect(noUnnecessaryNumberValueOfSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryNumberValueOfSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (30) =====

  describe('positive cases — reports unnecessary valueOf spread', () => {
    test('reports for num.valueOf(...items) with identifier spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for num.valueOf(...arr) with array identifier spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for literal number (42).valueOf(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 42 }, 'valueOf', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for member expression obj.num.valueOf(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'num' } }, 'valueOf', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for call expression result getValue().valueOf(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getValue' }, arguments: [] }, 'valueOf', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread argument that is a call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getItems' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread argument that is a member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'items' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread argument that is an array expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [makeSpreadArg({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] })]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions valueOf and spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toMatch(/valueOf/)
      expect(reports[0].message).toMatch(/spread/i)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toBe(
        'num.valueOf(...items) with spread is unusual. valueOf() takes no arguments.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [makeSpreadArg({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 0 }, 'valueOf', [makeSpreadArg({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 42 }, 'valueOf', [makeSpreadArg({ type: 'Identifier', name: 'args' })]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for spread argument that is a binary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [makeSpreadArg({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread argument that is a conditional expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [makeSpreadArg({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Identifier', name: 'a' }, alternate: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread argument that is a template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [makeSpreadArg({ type: 'TemplateLiteral', quasis: [], expressions: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread argument that is an arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [makeSpreadArg({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread argument that is a literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [makeSpreadArg({ type: 'Literal', value: 42 })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread argument that is an object expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [makeSpreadArg({ type: 'ObjectExpression', properties: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for (0).valueOf(...args)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 0 }, 'valueOf', [makeSpreadArg({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for chained valueOf with spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'x' }, property: { type: 'Identifier', name: 'toPrecision' } }, arguments: [] }, 'valueOf', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for spread argument that is a unary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [makeSpreadArg({ type: 'UnaryExpression', operator: '-', prefix: true, argument: { type: 'Identifier', name: 'x' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread argument that is a new expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [makeSpreadArg({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Array' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread argument that is a logical expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [makeSpreadArg({ type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread argument that is a function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [makeSpreadArg({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread argument that is an update expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [makeSpreadArg({ type: 'UpdateExpression', operator: '++', prefix: true, argument: { type: 'Identifier', name: 'x' } })]))
      expect(reports.length).toBe(1)
    })

  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for num.valueOf() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.valueOf(x) with non-spread identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.valueOf(42) with literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.valueOf(...items, extra) with two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [makeSpreadArg({ type: 'Identifier', name: 'items' }), { type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.valueOf(a, b) with two non-spread arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toString(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toString', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toFixed(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toFixed', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toPrecision(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toPrecision', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toLocaleString(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toLocaleString', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for num.toExponential(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toExponential', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Literal', value: 'valueOf' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "ValueOf" (uppercase V)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'ValueOf', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "valueof" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueof', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is computed member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Identifier', name: 'valueOf' },
          computed: true,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Identifier', name: 'valueOf' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Identifier', name: 'valueOf' },
        },
        arguments: null,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
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
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
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

    test('does not report when argument is not a SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a SpreadElement but callee property is wrong', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'apply', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is missing (null)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [null]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression and no spread arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'valueOf' },
        },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression and no spread arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'valueOf' },
        },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument type is SpreadElement but arguments has zero items', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf'))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments has three items with spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [makeSpreadArg({ type: 'Identifier', name: 'items' }), { type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryNumberValueOfSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryNumberValueOfSpreadRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [{ type: 'Identifier', name: 'x' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', []))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [makeSpreadArg({ type: 'Identifier', name: 'more' })]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Identifier', name: 'valueOf' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Identifier', name: 'valueOf' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [{ type: 'Identifier', name: 'x' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'toString', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', []))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [makeSpreadArg({ type: 'Identifier', name: 'more' })]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryNumberValueOfSpreadRule.create(context)
      const visitor2 = noUnnecessaryNumberValueOfSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryNumberValueOfSpreadRule.meta
      const meta2 = noUnnecessaryNumberValueOfSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Identifier', name: 'valueOf' },
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
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Identifier', name: 'valueOf' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Identifier', name: 'valueOf' },
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
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [makeSpreadArg({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryNumberValueOfSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryNumberValueOfSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryNumberValueOfSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'num' },
          property: { type: 'Identifier', name: 'valueOf' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberValueOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'num' }, 'valueOf', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 42 }, 'valueOf', [makeSpreadArg({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
