import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayWithSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-array-with-spread.js'
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
  computed = false,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object,
      property: { type: 'Identifier', name: methodName },
      computed,
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeSpread(argument: unknown): unknown {
  return { type: 'SpreadElement', argument }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-with-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayWithSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayWithSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayWithSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayWithSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayWithSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning "with"', () => {
      const desc = noUnnecessaryArrayWithSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/with/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayWithSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-with-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayWithSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayWithSpreadRule).toBeDefined()
      expect(noUnnecessaryArrayWithSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryArrayWithSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports arr.with(...items)', () => {
    test('reports for arr.with(...items) — basic spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.with(...args) — identifier spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [makeSpread({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.prop.with(...items) — MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }, 'with', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for getArr().with(...items) — CallExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getArr' }, arguments: [] }, 'with', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for [1, 2].with(...items) — ArrayExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] }, 'with', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for literal.with(...items) — Literal object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 42 }, 'with', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.with(...[1, 2, 3]) — spread of ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [makeSpread({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.with(...fn()) — spread of CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [makeSpread({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.with(...(x ? y : z)) — spread of ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [makeSpread({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Identifier', name: 'y' }, alternate: { type: 'Identifier', name: 'z' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.with(...obj.prop) — spread of MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [makeSpread({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } })]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions "with"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toMatch(/with/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toBe(
        'arr.with(...items) with spread is unusual. with() expects an index and a value.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [makeSpread({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [makeSpread({ type: 'Identifier', name: 'items' })], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [makeSpread({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [makeSpread({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [makeSpread({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'with', [makeSpread({ type: 'Identifier', name: 'vals' })]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for ObjectExpression.with(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'with', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for FunctionExpression.with(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, 'with', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for ArrowFunctionExpression.with(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }, 'with', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.with(...items) with spread of TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [makeSpread({ type: 'TemplateLiteral', quasis: [], expressions: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for deeply nested member object.with(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      const deepObj = { type: 'MemberExpression', object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' } }, property: { type: 'Identifier', name: 'c' } }
      visitor.CallExpression(makeCallNode(deepObj, 'with', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for BinaryExpression object.with(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }, 'with', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (44) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for arr.with(0, x) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [{ type: 'Literal', value: 0 }, { type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.with(0) — single non-spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.with() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with'))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.includes(x) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.indexOf(x) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.find(x) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.map(x) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.filter(x) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr["with"](...items) — computed property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [makeSpread({ type: 'Identifier', name: 'items' })], 1, 0, 1, 20, true))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is computed with Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'with' },
          computed: true,
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpread({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpread({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeSpread({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'with' },
          computed: false,
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "With" (uppercase W)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'With', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "withdraw"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'withdraw', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "without"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'without', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments has 2 elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [makeSpread({ type: 'Identifier', name: 'items' }), { type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments has 3 elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [makeSpread({ type: 'Identifier', name: 'items' }), { type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'with' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [{ type: 'Identifier', name: 'index' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getIndex' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'idx' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [{ type: 'ArrayExpression', elements: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          computed: false,
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: null,
          computed: false,
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.with(index, value) — normal usage with two args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 'newVal' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "with" but arg is ArrowFunction', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "with" but arg is UpdateExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [{ type: 'UpdateExpression', operator: '++', prefix: true, argument: { type: 'Identifier', name: 'x' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (16) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayWithSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryArrayWithSpreadRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [makeSpread({ type: 'Identifier', name: 'items' })]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [{ type: 'Literal', value: 0 }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [makeSpread({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [{ type: 'Literal', value: 0 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [makeSpread({ type: 'Identifier', name: 'vals' })]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'with' },
          computed: false,
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'with' },
          computed: false,
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [{ type: 'Literal', value: 0 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [makeSpread({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [makeSpread({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [makeSpread({ type: 'Identifier', name: 'vals' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayWithSpreadRule.create(context)
      const visitor2 = noUnnecessaryArrayWithSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayWithSpreadRule.meta
      const meta2 = noUnnecessaryArrayWithSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'with' },
          computed: false,
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
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
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'with' },
          computed: false,
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'with' },
          computed: false,
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [makeSpread({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArrayWithSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryArrayWithSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryArrayWithSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'with' },
          computed: false,
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [makeSpread({ type: 'Identifier', name: 'items' })], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'with', [makeSpread({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'with', [makeSpread({ type: 'Identifier', name: 'vals' })]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles non-computed member expression correctly (reports)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayWithSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'with' },
          computed: false,
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })
  })
})
