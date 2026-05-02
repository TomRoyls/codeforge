import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayToReversedSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-array-to-reversed-spread.js'
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

function makeSpread(arg: unknown): unknown {
  return { type: 'SpreadElement', argument: arg }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-to-reversed-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayToReversedSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayToReversedSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayToReversedSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayToReversedSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayToReversedSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning toReversed', () => {
      const desc = noUnnecessaryArrayToReversedSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/toreversed/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayToReversedSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-to-reversed-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayToReversedSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayToReversedSpreadRule).toBeDefined()
      expect(noUnnecessaryArrayToReversedSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryArrayToReversedSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports unnecessary spread', () => {
    test('reports for arr.toReversed(...items) with Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toReversed', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for [].toReversed(...items) with ArrayExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'toReversed', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.arr.toReversed(...items) with MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'arr' } }, 'toReversed', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for getArr().toReversed(...items) with CallExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getArr' }, arguments: [] }, 'toReversed', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for "str".toReversed(...items) with Literal object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'str' }, 'toReversed', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for ({}).toReversed(...items) with ObjectExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'toReversed', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for fn.toReversed(...items) with FunctionExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, 'toReversed', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.toReversed(...[1, 2, 3]) with spread of array literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toReversed', [makeSpread({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.toReversed(...getItems()) with spread of call expr', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toReversed', [makeSpread({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getItems' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.toReversed(...new Set()) with spread of NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toReversed', [makeSpread({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Set' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.toReversed(...arr) with spread of identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toReversed', [makeSpread({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.toReversed(...obj.items) with spread of member expr', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toReversed', [makeSpread({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'items' } })]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions toReversed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toReversed', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toMatch(/toReversed/)
    })

    test('report message mentions spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toReversed', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toReversed', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toBe(
        'arr.toReversed(...items) with spread is unusual. toReversed() expects no arguments.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toReversed', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toReversed', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'toReversed', [makeSpread({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toReversed', [makeSpread({ type: 'Identifier', name: 'items' })], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toReversed', [makeSpread({ type: 'Identifier', name: 'items' })], 3, 2, 7, 15))
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'toReversed', [makeSpread({ type: 'Identifier', name: 'x' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'toReversed', [makeSpread({ type: 'Identifier', name: 'y' })]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'toReversed', [makeSpread({ type: 'Identifier', name: 'x' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'toReversed', [makeSpread({ type: 'Identifier', name: 'y' })]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toReversed', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for arr.toReversed(...items) with ArrowFunctionExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }, 'toReversed', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports with zero line and column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toReversed', [makeSpread({ type: 'Identifier', name: 'items' })], 0, 0, 0, 0))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (44) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for arr.toReversed() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toReversed', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.toReversed(x) with one regular argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toReversed', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.toReversed(...x, ...y) with two spread args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toReversed', [makeSpread({ type: 'Identifier', name: 'x' }), makeSpread({ type: 'Identifier', name: 'y' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.toReversed(...x, y) with mixed args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toReversed', [makeSpread({ type: 'Identifier', name: 'x' }), { type: 'Identifier', name: 'y' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.toReversed(x, y) with two regular args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toReversed', [{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.toReversed(x, y, z) with three args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toReversed', [{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }, { type: 'Identifier', name: 'z' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].toSorted(...x) — wrong method toSorted', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'toSorted', [makeSpread({ type: 'Identifier', name: 'x' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].toSpliced(...x) — wrong method toSpliced', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'toSpliced', [makeSpread({ type: 'Identifier', name: 'x' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].reverse(...x) — wrong method reverse', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'reverse', [makeSpread({ type: 'Identifier', name: 'x' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].map(...x) — wrong method map', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'map', [makeSpread({ type: 'Identifier', name: 'x' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].find(...x) — wrong method find', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'find', [makeSpread({ type: 'Identifier', name: 'x' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].filter(...x) — wrong method filter', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'filter', [makeSpread({ type: 'Identifier', name: 'x' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for computed arr["toReversed"](...x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toReversed' },
          computed: true,
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'x' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is Literal instead of Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'toReversed' },
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'x' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpread({ type: 'Identifier', name: 'x' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpread({ type: 'Identifier', name: 'x' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is Identifier not MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeSpread({ type: 'Identifier', name: 'x' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'x' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: null,
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'x' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for property name "toreversed" lowercase', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toreversed', [makeSpread({ type: 'Identifier', name: 'x' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for property name "ToReversed" PascalCase', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'ToReversed', [makeSpread({ type: 'Identifier', name: 'x' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for property name "TOREVERSED" uppercase', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'TOREVERSED', [makeSpread({ type: 'Identifier', name: 'x' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for single Literal argument (not spread)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toReversed', [{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for single Identifier argument (not spread)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toReversed', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for single CallExpression argument (not spread)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toReversed', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for single MemberExpression argument (not spread)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toReversed', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'key' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for single ArrayExpression argument (not spread)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toReversed', [{ type: 'ArrayExpression', elements: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for single ObjectExpression argument (not spread)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toReversed', [{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for single ArrowFunctionExpression argument (not spread)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toReversed', [{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toReversed' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for toReversed with empty arguments array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toReversed'))
      expect(reports.length).toBe(0)
    })

    test('does not report for computed:true with Identifier property name toReversed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toReversed' },
          computed: true,
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'x' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

  })

  // ===== EDGE CASES (16) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayToReversedSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryArrayToReversedSpreadRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toReversed', [makeSpread({ type: 'Identifier', name: 'x' })]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toReversed', [{ type: 'Identifier', name: 'x' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toReversed', [makeSpread({ type: 'Identifier', name: 'x' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toReversed', []))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toReversed', [{ type: 'Identifier', name: 'x' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toReversed', [makeSpread({ type: 'Identifier', name: 'y' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSorted', [makeSpread({ type: 'Identifier', name: 'x' })]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toReversed' },
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'x' })],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toReversed' },
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'x' })],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayToReversedSpreadRule.create(context)
      const visitor2 = noUnnecessaryArrayToReversedSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayToReversedSpreadRule.meta
      const meta2 = noUnnecessaryArrayToReversedSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toReversed' },
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'x' })],
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
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toReversed' },
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'x' })],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toReversed' },
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'x' })],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'toReversed', [makeSpread({ type: 'Identifier', name: 'x' })])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArrayToReversedSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryArrayToReversedSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryArrayToReversedSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toReversed' },
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'x' })],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toReversed', [makeSpread({ type: 'Identifier', name: 'x' })], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles non-computed member expression property (reports)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toReversed' },
          computed: false,
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'x' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when computed is true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'toReversed' },
          computed: true,
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'x' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'toReversed', [makeSpread({ type: 'Identifier', name: 'x' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'toReversed', [makeSpread({ type: 'Identifier', name: 'y' })]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
