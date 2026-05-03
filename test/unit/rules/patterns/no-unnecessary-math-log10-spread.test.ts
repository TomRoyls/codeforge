import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryMathLog10SpreadRule } from '../../../../src/rules/patterns/no-unnecessary-math-log10-spread.js'
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
  locEndCol = 25,
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

function makeMathId(): unknown {
  return { type: 'Identifier', name: 'Math' }
}

function makeSpreadArg(arg: unknown): unknown {
  return { type: 'SpreadElement', argument: arg }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-math-log10-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryMathLog10SpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryMathLog10SpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryMathLog10SpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryMathLog10SpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryMathLog10SpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning log10', () => {
      const desc = noUnnecessaryMathLog10SpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/log10/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryMathLog10SpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-math-log10-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryMathLog10SpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryMathLog10SpreadRule).toBeDefined()
      expect(noUnnecessaryMathLog10SpreadRule.meta).toBeDefined()
      expect(noUnnecessaryMathLog10SpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports Math.log10 with spread', () => {
    test('reports Math.log10(...items) with identifier spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports Math.log10(...arr) with different identifier name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(1)
    })

    test('reports Math.log10(...[1, 2, 3]) with ArrayExpression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [makeSpreadArg({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] })]))
      expect(reports.length).toBe(1)
    })

    test('reports Math.log10(...(getValue())) with CallExpression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getValue' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports Math.log10(...obj.values) with MemberExpression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'values' } })]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Math.log10 and spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toMatch(/log10/)
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toBe(
        'Math.log10(...items) with spread is unusual. log10() expects a single number.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      const node = makeCallNode(makeMathId(), 'log10', [makeSpreadArg({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports Math.log10(...new Set()) with NewExpression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [makeSpreadArg({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Set' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports Math.log10(...args) with generic name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [makeSpreadArg({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(1)
    })

    test('reports Math.log10(...(a ? b : c)) with ConditionalExpression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [makeSpreadArg({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'a' }, consequent: { type: 'Identifier', name: 'b' }, alternate: { type: 'Identifier', name: 'c' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports Math.log10(...(x)) with SequenceExpression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [makeSpreadArg({ type: 'SequenceExpression', expressions: [{ type: 'Identifier', name: 'x' }] })]))
      expect(reports.length).toBe(1)
    })

    test('reports Math.log10 with SpreadElement containing ArrowFunction', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [makeSpreadArg({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } })]))
      expect(reports.length).toBe(1)
    })

    test('reports Math.log10 with SpreadElement containing BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [makeSpreadArg({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports Math.log10 with SpreadElement containing UnaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [makeSpreadArg({ type: 'UnaryExpression', operator: '-', prefix: true, argument: { type: 'Identifier', name: 'x' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports Math.log10 with SpreadElement containing ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [makeSpreadArg({ type: 'ObjectExpression', properties: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports Math.log10 with SpreadElement containing TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [makeSpreadArg({ type: 'TemplateLiteral', quasis: [], expressions: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports Math.log10 with SpreadElement containing AwaitExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [makeSpreadArg({ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'promise' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports Math.log10 with SpreadElement containing empty ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [makeSpreadArg({ type: 'ArrayExpression', elements: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports Math.log10 with SpreadElement containing YieldExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [makeSpreadArg({ type: 'YieldExpression', argument: { type: 'Identifier', name: 'val' } })]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report Math.log10(items) — no spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [{ type: 'Identifier', name: 'items' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report Math.log10(x, ...items) — 2 args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [{ type: 'Identifier', name: 'x' }, makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report Math.log10() — 0 args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10'))
      expect(reports.length).toBe(0)
    })

    test('does not report Math.log10(...items, ...more) — 2 args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [makeSpreadArg({ type: 'Identifier', name: 'items' }), makeSpreadArg({ type: 'Identifier', name: 'more' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report console.log10(...items) — wrong object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'console' }, 'log10', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report Math.log2(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log2', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report Math.log(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report Math.floor(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'floor', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report myObj.log10(...items) — non-Math object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'myObj' }, 'log10', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is computed Math["log10"](...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 1, 0, 1, 25, true))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeMathId(),
          property: { type: 'Literal', value: 'log10' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is not Identifier (MemberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'Math' } }, 'log10', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'log10' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'log10' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeMathId(),
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeMathId(),
          property: null,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Log10" (different case)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'Log10', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object name is "math" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'math' }, 'log10', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report Math.log10(5) — regular number arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [{ type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report Math.log10(x) — regular identifier arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report Math.log10(x + 1) — BinaryExpression arg not spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [{ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 1 } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report Math.max(...items) — different Math method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'max', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getMath' }, arguments: [] }, 'log10', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'Math' }, 'log10', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryMathLog10SpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryMathLog10SpreadRule.create(ctx2)
      visitor1.CallExpression(makeCallNode(makeMathId(), 'log10', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor2.CallExpression(makeCallNode(makeMathId(), 'log10', [{ type: 'Identifier', name: 'x' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [{ type: 'Identifier', name: 'x' }]))
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeMathId(),
          property: { type: 'Identifier', name: 'log10' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeMathId(),
          property: { type: 'Identifier', name: 'log10' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [{ type: 'Identifier', name: 'x' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'log10', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      visitor.CallExpression(makeCallNode(makeMathId(), 'log2', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryMathLog10SpreadRule.create(context)
      const visitor2 = noUnnecessaryMathLog10SpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryMathLog10SpreadRule.meta
      const meta2 = noUnnecessaryMathLog10SpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeMathId(),
          property: { type: 'Identifier', name: 'log10' },
          computed: false,
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
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeMathId(),
          property: { type: 'Identifier', name: 'log10' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeMathId(),
          property: { type: 'Identifier', name: 'log10' },
          computed: false,
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
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      const node = makeCallNode(makeMathId(), 'log10', [makeSpreadArg({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryMathLog10SpreadRule).toBeDefined()
      expect(typeof noUnnecessaryMathLog10SpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryMathLog10SpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeMathId(),
          property: { type: 'Identifier', name: 'log10' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles non-computed member expression — reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 1, 0, 1, 25, false))
      expect(reports.length).toBe(1)
    })

    test('handles computed member expression — does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 1, 0, 1, 25, true))
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report when argument is null instead of SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [null]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeMathId(),
          property: { type: 'Identifier', name: 'log10' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('handles SpreadElement with null argument property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog10SpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeMathId(), 'log10', [{ type: 'SpreadElement', argument: null }]))
      expect(reports.length).toBe(1)
    })
  })
})
