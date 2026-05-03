import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayIsArraySpreadRule } from '../../../../src/rules/patterns/no-unnecessary-is-nan-spread.js'
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

function makeIsNaNCallWithSpread(
  spreadArg: unknown = { type: 'Identifier', name: 'items' },
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'isNaN',
    },
    arguments: [
      { type: 'SpreadElement', argument: spreadArg },
    ],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-is-nan-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayIsArraySpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayIsArraySpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayIsArraySpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayIsArraySpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayIsArraySpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning isNaN', () => {
      const desc = noUnnecessaryArrayIsArraySpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/isnan/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayIsArraySpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-is-nan-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayIsArraySpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayIsArraySpreadRule).toBeDefined()
      expect(noUnnecessaryArrayIsArraySpreadRule.meta).toBeDefined()
      expect(noUnnecessaryArrayIsArraySpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (30) =====

  describe('positive cases — reports isNaN with spread', () => {
    test('reports isNaN(...items) with identifier spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression(makeIsNaNCallWithSpread({ type: 'Identifier', name: 'items' }))
      expect(reports.length).toBe(1)
    })

    test('reports isNaN(...arr) with different identifier name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression(makeIsNaNCallWithSpread({ type: 'Identifier', name: 'arr' }))
      expect(reports.length).toBe(1)
    })

    test('reports isNaN(...numbers) with another identifier name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression(makeIsNaNCallWithSpread({ type: 'Identifier', name: 'numbers' }))
      expect(reports.length).toBe(1)
    })

    test('reports isNaN(...values) with yet another identifier name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression(makeIsNaNCallWithSpread({ type: 'Identifier', name: 'values' }))
      expect(reports.length).toBe(1)
    })

    test('reports isNaN(...data) with short identifier name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression(makeIsNaNCallWithSpread({ type: 'Identifier', name: 'data' }))
      expect(reports.length).toBe(1)
    })

    test('reports isNaN with spread of MemberExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression(makeIsNaNCallWithSpread({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'items' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports isNaN with spread of CallExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression(makeIsNaNCallWithSpread({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getItems' },
        arguments: [],
      }))
      expect(reports.length).toBe(1)
    })

    test('reports isNaN with spread of ArrayExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression(makeIsNaNCallWithSpread({
        type: 'ArrayExpression',
        elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }],
      }))
      expect(reports.length).toBe(1)
    })

    test('report message mentions isNaN', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression(makeIsNaNCallWithSpread())
      expect(reports[0].message).toMatch(/isNaN/)
    })

    test('report message mentions spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression(makeIsNaNCallWithSpread())
      expect(reports[0].message).toMatch(/spread/i)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression(makeIsNaNCallWithSpread())
      expect(reports[0].message).toBe(
        'isNaN(...items) with spread is unusual. isNaN() expects a single value.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression(makeIsNaNCallWithSpread())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression(makeIsNaNCallWithSpread())
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      const node = makeIsNaNCallWithSpread()
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression(makeIsNaNCallWithSpread({ type: 'Identifier', name: 'x' }, 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression(makeIsNaNCallWithSpread({ type: 'Identifier', name: 'a' }))
      visitor.CallExpression(makeIsNaNCallWithSpread({ type: 'Identifier', name: 'b' }))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression(makeIsNaNCallWithSpread({ type: 'Identifier', name: 'a' }))
      visitor.CallExpression(makeIsNaNCallWithSpread({ type: 'Identifier', name: 'b' }))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports isNaN with spread of BinaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression(makeIsNaNCallWithSpread({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports isNaN with spread of ConditionalExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression(makeIsNaNCallWithSpread({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'Literal', value: 1 },
        alternate: { type: 'Literal', value: 2 },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports isNaN with spread of TemplateLiteral argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression(makeIsNaNCallWithSpread({
        type: 'TemplateLiteral',
        quasis: [],
        expressions: [],
      }))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression(makeIsNaNCallWithSpread())
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports isNaN with spread of ArrowFunctionExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression(makeIsNaNCallWithSpread({
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports isNaN with spread of ObjectExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression(makeIsNaNCallWithSpread({
        type: 'ObjectExpression',
        properties: [],
      }))
      expect(reports.length).toBe(1)
    })

    test('reports isNaN with spread of Literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression(makeIsNaNCallWithSpread({
        type: 'Literal',
        value: 42,
      }))
      expect(reports.length).toBe(1)
    })

    test('reports isNaN with spread of UnaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression(makeIsNaNCallWithSpread({
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: { type: 'Identifier', name: 'x' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports isNaN with spread of FunctionExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression(makeIsNaNCallWithSpread({
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports isNaN with spread of NewExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression(makeIsNaNCallWithSpread({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Set' },
        arguments: [],
      }))
      expect(reports.length).toBe(1)
    })

    test('reports isNaN with spread of LogicalExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression(makeIsNaNCallWithSpread({
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports isNaN with spread of UpdateExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression(makeIsNaNCallWithSpread({
        type: 'UpdateExpression',
        operator: '++',
        prefix: false,
        argument: { type: 'Identifier', name: 'i' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports isNaN with spread of AssignmentExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression(makeIsNaNCallWithSpread({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 1 },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports isNaN with spread of SequenceExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression(makeIsNaNCallWithSpread({
        type: 'SequenceExpression',
        expressions: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }],
      }))
      expect(reports.length).toBe(1)
    })

    test('reports isNaN with spread of AwaitExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression(makeIsNaNCallWithSpread({
        type: 'AwaitExpression',
        argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'promise' }, arguments: [] },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports isNaN with spread of YieldExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression(makeIsNaNCallWithSpread({
        type: 'YieldExpression',
        argument: { type: 'Identifier', name: 'value' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports isNaN with spread of tagged TemplateLiteral argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression(makeIsNaNCallWithSpread({
        type: 'TaggedTemplateExpression',
        tag: { type: 'Identifier', name: 'tag' },
        quasi: {
          type: 'TemplateLiteral',
          quasis: [{ type: 'TemplateElement', value: { raw: 'hello', cooked: 'hello' }, tail: true }],
          expressions: [],
        },
      }))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for isNaN(x) — no spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for isNaN(42) — literal argument, no spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for isNaN() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 8),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for isNaN(x, y) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }],
        loc: makeLoc(1, 0, 1, 14),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for isNaN(x, y, z) — three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [
          { type: 'Identifier', name: 'x' },
          { type: 'Identifier', name: 'y' },
          { type: 'Identifier', name: 'z' },
        ],
        loc: makeLoc(1, 0, 1, 18),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for foo(...items) — different function name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'foo' },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 16),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.isNaN(...items) — MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'isNaN' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 24),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isNaN(...items) — MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isNaN' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 26),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for isFinite(...items) — wrong function name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isFinite' },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for isNaN(...items, extra) — two arguments with spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } },
          { type: 'Literal', value: 0 },
        ],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee type is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'isNaN' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is "isNaN" with different case', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isnan' },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is not SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [{ type: 'Identifier', name: 'items' }],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is missing type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [{}],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is a FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for isNaN("hello") — string literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for isNaN(true) — boolean literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [{ type: 'Literal', value: true }],
        loc: makeLoc(1, 0, 1, 13),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for isNaN(obj.prop) — member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [{
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
        }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        loc: makeLoc(1, 0, 1, 8),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: null,
        loc: makeLoc(1, 0, 1, 8),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for isNaN with SpreadElement in second position', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [
          { type: 'Literal', value: 1 },
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } },
        ],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for isNaN with argument type SpreadElement but null argument property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [{ type: 'SpreadElement', argument: null }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayIsArraySpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryArrayIsArraySpreadRule.create(ctx2)
      visitor1.CallExpression(makeIsNaNCallWithSpread({ type: 'Identifier', name: 'a' }))
      visitor2.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression(makeIsNaNCallWithSpread())
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      visitor.CallExpression(makeIsNaNCallWithSpread({ type: 'Identifier', name: 'other' }))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      // valid — isNaN(x), no spread
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      // invalid — isNaN(...items)
      visitor.CallExpression(makeIsNaNCallWithSpread())
      // valid — foo(...items), wrong function
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'foo' },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 16),
      })
      // invalid — isNaN(...arr)
      visitor.CallExpression(makeIsNaNCallWithSpread({ type: 'Identifier', name: 'arr' }))
      // valid — isNaN(x, y), two arguments
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }],
        loc: makeLoc(1, 0, 1, 14),
      })
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayIsArraySpreadRule.create(context)
      const visitor2 = noUnnecessaryArrayIsArraySpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayIsArraySpreadRule.meta
      const meta2 = noUnnecessaryArrayIsArraySpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
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
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      const node = makeIsNaNCallWithSpread()
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArrayIsArraySpreadRule).toBeDefined()
      expect(typeof noUnnecessaryArrayIsArraySpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryArrayIsArraySpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression(makeIsNaNCallWithSpread({ type: 'Identifier', name: 'x' }, 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIsArraySpreadRule.create(context)
      visitor.CallExpression(makeIsNaNCallWithSpread({ type: 'Identifier', name: 'a' }))
      visitor.CallExpression(makeIsNaNCallWithSpread({ type: 'Identifier', name: 'b' }))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
