import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayToJSONSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-array-to-json-spread.js'
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

function makeSpreadArg(argument: unknown): { type: string; argument: unknown } {
  return { type: 'SpreadElement', argument }
}

function makeCallNode(
  object: unknown,
  methodName: string,
  args: unknown[] = [],
  computed = false,
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
      computed,
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-to-json-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayToJSONSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayToJSONSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayToJSONSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayToJSONSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayToJSONSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning toJSON', () => {
      const desc = noUnnecessaryArrayToJSONSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/tojson/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayToJSONSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-to-json-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayToJSONSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayToJSONSpreadRule).toBeDefined()
      expect(noUnnecessaryArrayToJSONSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryArrayToJSONSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports unnecessary toJSON spread', () => {
    test('reports for arr.toJSON(...items) with spread identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'arr' }, 'toJSON', [makeSpreadArg({ type: 'Identifier', name: 'items' })]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for obj.data.toJSON(...args) with nested member callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'data' } },
          'toJSON',
          [makeSpreadArg({ type: 'Identifier', name: 'args' })],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for arr.toJSON(...[]) with spread of empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'Identifier', name: 'arr' },
          'toJSON',
          [makeSpreadArg({ type: 'ArrayExpression', elements: [] })],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for x.toJSON(...arr) with spread identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'x' }, 'toJSON', [makeSpreadArg({ type: 'Identifier', name: 'arr' })]),
      )
      expect(reports.length).toBe(1)
    })

    test('report message mentions toJSON', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'arr' }, 'toJSON', [makeSpreadArg({ type: 'Identifier', name: 'items' })]),
      )
      expect(reports[0].message).toMatch(/toJSON/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'arr' }, 'toJSON', [makeSpreadArg({ type: 'Identifier', name: 'items' })]),
      )
      expect(reports[0].message).toBe(
        'arr.toJSON(...items) with spread is unusual. toJSON() expects no arguments.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'arr' }, 'toJSON', [makeSpreadArg({ type: 'Identifier', name: 'items' })]),
      )
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'arr' }, 'toJSON', [makeSpreadArg({ type: 'Identifier', name: 'items' })]),
      )
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'toJSON', [makeSpreadArg({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'arr' }, 'toJSON', [makeSpreadArg({ type: 'Identifier', name: 'items' })], false, 5, 10, 5, 30),
      )
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'a' }, 'toJSON', [makeSpreadArg({ type: 'Identifier', name: 'x' })]),
      )
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'b' }, 'toJSON', [makeSpreadArg({ type: 'Identifier', name: 'y' })]),
      )
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'a' }, 'toJSON', [makeSpreadArg({ type: 'Identifier', name: 'x' })]),
      )
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'b' }, 'toJSON', [makeSpreadArg({ type: 'Identifier', name: 'y' })]),
      )
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports with SpreadElement argument containing call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'Identifier', name: 'arr' },
          'toJSON',
          [makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getItems' }, arguments: [] })],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement argument containing member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'Identifier', name: 'arr' },
          'toJSON',
          [makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'data' } })],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement argument containing array expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'Identifier', name: 'arr' },
          'toJSON',
          [makeSpreadArg({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] })],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement argument containing object expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'Identifier', name: 'arr' },
          'toJSON',
          [makeSpreadArg({ type: 'ObjectExpression', properties: [] })],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for object being ArrayExpression — rule does not check callee.object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'ArrayExpression', elements: [] },
          'toJSON',
          [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for object being Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'arr' }, 'toJSON', [makeSpreadArg({ type: 'Identifier', name: 'items' })]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for object being Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Literal', value: null }, 'toJSON', [makeSpreadArg({ type: 'Identifier', name: 'items' })]),
      )
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'arr' }, 'toJSON', [makeSpreadArg({ type: 'Identifier', name: 'items' })]),
      )
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for object being MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } },
          'toJSON',
          [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for object being CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'CallExpression', callee: { type: 'Identifier', name: 'getArr' }, arguments: [] },
          'toJSON',
          [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with spread argument containing conditional expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'Identifier', name: 'arr' },
          'toJSON',
          [makeSpreadArg({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } })],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with spread argument containing binary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'Identifier', name: 'arr' },
          'toJSON',
          [makeSpreadArg({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with spread argument containing arrow function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'Identifier', name: 'arr' },
          'toJSON',
          [makeSpreadArg({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } })],
        ),
      )
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (44) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for arr.toJSON() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toJSON', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.toJSON(x) — regular argument, not spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'arr' }, 'toJSON', [{ type: 'Identifier', name: 'x' }]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.toJSON(x, y) — two regular arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'arr' }, 'toJSON', [{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.toJSON(...a, ...b) — two spread arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'Identifier', name: 'arr' },
          'toJSON',
          [makeSpreadArg({ type: 'Identifier', name: 'a' }), makeSpreadArg({ type: 'Identifier', name: 'b' })],
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.toJSON(...a, x) — spread + regular', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'Identifier', name: 'arr' },
          'toJSON',
          [makeSpreadArg({ type: 'Identifier', name: 'a' }), { type: 'Identifier', name: 'x' }],
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.toJSO(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'arr' }, 'toJSO', [makeSpreadArg({ type: 'Identifier', name: 'items' })]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.stringify(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'arr' }, 'stringify', [makeSpreadArg({ type: 'Identifier', name: 'items' })]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.tojson(...items) — lowercase', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'arr' }, 'tojson', [makeSpreadArg({ type: 'Identifier', name: 'items' })]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for computed member arr["toJSON"](...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'arr' }, 'toJSON', [makeSpreadArg({ type: 'Identifier', name: 'items' })], true),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is Identifier (not MemberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'toJSON' },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'toJSON' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "toJSONN"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'arr' }, 'toJSONN', [makeSpreadArg({ type: 'Identifier', name: 'items' })]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: null,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for zero arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toJSON'))
      expect(reports.length).toBe(0)
    })

    test('does not report for three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'Identifier', name: 'arr' },
          'toJSON',
          [makeSpreadArg({ type: 'Identifier', name: 'a' }), { type: 'Identifier', name: 'b' }, { type: 'Identifier', name: 'c' }],
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when single argument is Identifier (not SpreadElement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'arr' }, 'toJSON', [{ type: 'Identifier', name: 'x' }]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when single argument is Literal (not SpreadElement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'arr' }, 'toJSON', [{ type: 'Literal', value: 42 }]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when single argument is CallExpression (not SpreadElement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'Identifier', name: 'arr' },
          'toJSON',
          [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }],
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is empty', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toJSON', []))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toJSON' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toJSON' },
        },
        arguments: null,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when single argument is ObjectExpression (not SpreadElement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'arr' }, 'toJSON', [{ type: 'ObjectExpression', properties: [] }]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when callee type is Super', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Super' },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for UpdateExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression({ type: 'UpdateExpression', operator: '++', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for SwitchStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression({ type: 'SwitchStatement', discriminant: {}, cases: [], loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for WhileStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression({ type: 'WhileStatement', test: {}, body: {}, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ForStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression({ type: 'ForStatement', init: null, test: null, update: null, body: {}, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (16) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayToJSONSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryArrayToJSONSpreadRule.create(ctx2)
      visitor1.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'arr' }, 'toJSON', [makeSpreadArg({ type: 'Identifier', name: 'items' })]),
      )
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toJSON', []))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'arr' }, 'toJSON', [makeSpreadArg({ type: 'Identifier', name: 'items' })]),
      )
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toJSON', []))
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'arr' }, 'toJSON', [makeSpreadArg({ type: 'Identifier', name: 'more' })]),
      )
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toJSON' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toJSON' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toJSON', []))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toJSON', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'stringify', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toJSON', [makeSpreadArg({ type: 'Identifier', name: 'more' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toJSON', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayToJSONSpreadRule.create(context)
      const visitor2 = noUnnecessaryArrayToJSONSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayToJSONSpreadRule.meta
      const meta2 = noUnnecessaryArrayToJSONSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toJSON' },
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
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toJSON' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toJSON' },
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
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'toJSON', [makeSpreadArg({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArrayToJSONSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryArrayToJSONSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryArrayToJSONSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toJSON' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'arr' }, 'toJSON', [makeSpreadArg({ type: 'Identifier', name: 'items' })], false, 10, 4, 10, 25),
      )
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports with non-computed member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toJSON' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToJSONSpreadRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'a' }, 'toJSON', [makeSpreadArg({ type: 'Identifier', name: 'x' })]),
      )
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'b' }, 'toJSON', [makeSpreadArg({ type: 'Identifier', name: 'y' })]),
      )
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
