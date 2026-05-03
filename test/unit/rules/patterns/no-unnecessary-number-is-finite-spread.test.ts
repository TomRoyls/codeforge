import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryNumberIsFiniteSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-number-is-finite-spread.js'
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

function makeSpreadElement(argument: unknown): unknown {
  return { type: 'SpreadElement', argument }
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
      computed: false,
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeNumberIsFiniteCall(
  arg: unknown,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return makeCallNode(
    { type: 'Identifier', name: 'Number' },
    'isFinite',
    [arg],
    locStartLine,
    locStartCol,
    locEndLine,
    locEndCol,
  )
}

// ===== META TESTS (8) =====

describe('no-unnecessary-number-is-finite-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryNumberIsFiniteSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryNumberIsFiniteSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryNumberIsFiniteSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryNumberIsFiniteSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryNumberIsFiniteSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning isFinite', () => {
      const desc = noUnnecessaryNumberIsFiniteSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/isfinite/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryNumberIsFiniteSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-number-is-finite-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryNumberIsFiniteSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryNumberIsFiniteSpreadRule).toBeDefined()
      expect(noUnnecessaryNumberIsFiniteSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryNumberIsFiniteSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (28) =====

  describe('positive cases — reports unnecessary Number.isFinite spread', () => {
    test('reports for Number.isFinite(...items) with SpreadElement arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsFiniteCall(makeSpreadElement({ type: 'Identifier', name: 'items' })))
      expect(reports.length).toBe(1)
    })

    test('reports for Number.isFinite(...arr) with identifier spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsFiniteCall(makeSpreadElement({ type: 'Identifier', name: 'arr' })))
      expect(reports.length).toBe(1)
    })

    test('report message mentions isFinite', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsFiniteCall(makeSpreadElement({ type: 'Identifier', name: 'items' })))
      expect(reports[0].message).toMatch(/isFinite/)
    })

    test('report message mentions spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsFiniteCall(makeSpreadElement({ type: 'Identifier', name: 'items' })))
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsFiniteCall(makeSpreadElement({ type: 'Identifier', name: 'items' })))
      expect(reports[0].message).toBe(
        'Number.isFinite(...items) with spread is unusual. isFinite() expects a single value.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsFiniteCall(makeSpreadElement({ type: 'Identifier', name: 'items' })))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsFiniteCall(makeSpreadElement({ type: 'Identifier', name: 'items' })))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      const node = makeNumberIsFiniteCall(makeSpreadElement({ type: 'Identifier', name: 'items' }))
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsFiniteCall(makeSpreadElement({ type: 'Identifier', name: 'items' }), 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsFiniteCall(makeSpreadElement({ type: 'Identifier', name: 'a' })))
      visitor.CallExpression(makeNumberIsFiniteCall(makeSpreadElement({ type: 'Identifier', name: 'b' })))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsFiniteCall(makeSpreadElement({ type: 'Identifier', name: 'a' })))
      visitor.CallExpression(makeNumberIsFiniteCall(makeSpreadElement({ type: 'Identifier', name: 'b' })))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports when spread over MemberExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsFiniteCall(makeSpreadElement({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'arr' } })))
      expect(reports.length).toBe(1)
    })

    test('reports when spread over CallExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsFiniteCall(makeSpreadElement({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getItems' }, arguments: [] })))
      expect(reports.length).toBe(1)
    })

    test('reports when spread over ArrayExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsFiniteCall(makeSpreadElement({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] })))
      expect(reports.length).toBe(1)
    })

    test('reports when spread over ObjectExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsFiniteCall(makeSpreadElement({ type: 'ObjectExpression', properties: [] })))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with Literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsFiniteCall(makeSpreadElement({ type: 'Literal', value: 42 })))
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is a BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsFiniteCall(makeSpreadElement({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })))
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is a ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsFiniteCall(makeSpreadElement({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } })))
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is an ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsFiniteCall(makeSpreadElement({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } })))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsFiniteCall(makeSpreadElement({ type: 'Identifier', name: 'items' })))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for spread over NewExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsFiniteCall(makeSpreadElement({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Set' }, arguments: [] })))
      expect(reports.length).toBe(1)
    })

    test('reports for spread over TemplateLiteral argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsFiniteCall(makeSpreadElement({ type: 'TemplateLiteral', quasis: [], expressions: [] })))
      expect(reports.length).toBe(1)
    })

    test('reports for spread over UnaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsFiniteCall(makeSpreadElement({ type: 'UnaryExpression', operator: '-', prefix: true, argument: { type: 'Literal', value: 1 } })))
      expect(reports.length).toBe(1)
    })

    test('reports for spread over FunctionExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsFiniteCall(makeSpreadElement({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } })))
      expect(reports.length).toBe(1)
    })

    test('reports for spread over UpdateExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsFiniteCall(makeSpreadElement({ type: 'UpdateExpression', operator: '++', prefix: false, argument: { type: 'Identifier', name: 'x' } })))
      expect(reports.length).toBe(1)
    })

    test('reports for spread over LogicalExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsFiniteCall(makeSpreadElement({ type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })))
      expect(reports.length).toBe(1)
    })

    test('reports for spread over SequenceExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsFiniteCall(makeSpreadElement({ type: 'SequenceExpression', expressions: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }] })))
      expect(reports.length).toBe(1)
    })

    test('reports with correct end location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsFiniteCall(makeSpreadElement({ type: 'Identifier', name: 'items' }), 3, 5, 3, 28))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(28)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Number.isFinite(x) — no spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsFiniteCall({ type: 'Identifier', name: 'x' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isFinite(1, 2) — two args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Number' }, 'isFinite', [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isFinite() — no args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Number' }, 'isFinite', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isFinite(x, ...y) — two args with spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Number' }, 'isFinite', [{ type: 'Identifier', name: 'x' }, makeSpreadElement({ type: 'Identifier', name: 'y' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.isFinite(...items) — wrong object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'isFinite', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isNaN(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Number' }, 'isNaN', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.parseInt(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Number' }, 'parseInt', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.parseFloat(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Number' }, 'parseFloat', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for foo.isFinite(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'isFinite', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for isFinite(...items) — not a MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isFinite' },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Literal', value: 'isFinite' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'isFinite', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object name is not "Number"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'MyNumber' }, 'isFinite', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is not "isFinite"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Number' }, 'isSafeInteger', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is computed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isFinite' },
          computed: true,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'isFinite' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'isFinite' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: null,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for "number" (lowercase) as object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'number' }, 'isFinite', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for "IsFinite" (wrong case) as property name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Number' }, 'IsFinite', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for "isfinite" (all lowercase) as property name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Number' }, 'isfinite', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a regular Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsFiniteCall({ type: 'Identifier', name: 'x' }))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsFiniteCall({ type: 'Literal', value: 42 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isInteger(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Number' }, 'isInteger', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryNumberIsFiniteSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryNumberIsFiniteSpreadRule.create(ctx2)
      visitor1.CallExpression(makeNumberIsFiniteCall(makeSpreadElement({ type: 'Identifier', name: 'items' })))
      visitor2.CallExpression(makeNumberIsFiniteCall({ type: 'Identifier', name: 'x' }))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsFiniteCall(makeSpreadElement({ type: 'Identifier', name: 'a' })))
      visitor.CallExpression(makeNumberIsFiniteCall({ type: 'Identifier', name: 'x' }))
      visitor.CallExpression(makeNumberIsFiniteCall(makeSpreadElement({ type: 'Identifier', name: 'b' })))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isFinite' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isFinite' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsFiniteCall({ type: 'Identifier', name: 'x' }))
      visitor.CallExpression(makeNumberIsFiniteCall(makeSpreadElement({ type: 'Identifier', name: 'items' })))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'isFinite', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeNumberIsFiniteCall(makeSpreadElement({ type: 'Identifier', name: 'more' })))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Number' }, 'isFinite', [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      const visitor2 = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryNumberIsFiniteSpreadRule.meta
      const meta2 = noUnnecessaryNumberIsFiniteSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isFinite' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
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
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isFinite' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isFinite' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      const node = makeNumberIsFiniteCall(makeSpreadElement({ type: 'Identifier', name: 'items' }))
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryNumberIsFiniteSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryNumberIsFiniteSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryNumberIsFiniteSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isFinite' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsFiniteCall(makeSpreadElement({ type: 'Identifier', name: 'items' }), 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles non-computed member expression property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isFinite' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Literal', value: 'isFinite' },
          computed: true,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsFiniteSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsFiniteCall(makeSpreadElement({ type: 'Identifier', name: 'a' })))
      visitor.CallExpression(makeNumberIsFiniteCall(makeSpreadElement({ type: 'Identifier', name: 'b' })))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
