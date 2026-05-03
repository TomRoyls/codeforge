import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringAtSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-string-at-spread.js'
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

function makeSpreadArg(argument: unknown = { type: 'Identifier', name: 'items' }): unknown {
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

describe('no-unnecessary-string-at-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringAtSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringAtSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringAtSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringAtSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringAtSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning at', () => {
      const desc = noUnnecessaryStringAtSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/\.at\b/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringAtSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-at-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringAtSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringAtSpreadRule).toBeDefined()
      expect(noUnnecessaryStringAtSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryStringAtSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports str.at(...items)', () => {
    test('reports for foo.at(...items) — basic spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'at', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.at(...items) — string callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'at', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.at(...items) — array callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'at', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.prop.at(...items) — MemberExpression callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }, 'at', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for fn().at(...items) — CallExpression callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }, 'at', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for [].at(...items) — ArrayExpression callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'at', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for "str".at(...items) — Literal callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'str' }, 'at', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions spread and at', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'at', [makeSpreadArg()]))
      expect(reports[0].message).toMatch(/spread/)
      expect(reports[0].message).toMatch(/\.at/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'at', [makeSpreadArg()]))
      expect(reports[0].message).toBe(
        'str.at(...items) with spread is unusual. at() expects an index.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'at', [makeSpreadArg()]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'at', [makeSpreadArg()]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'foo' }, 'at', [makeSpreadArg()])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'at', [makeSpreadArg()], false, 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'at', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'at', [makeSpreadArg()]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'at', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'at', [makeSpreadArg()]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports with spread of identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'at', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports with spread of member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'at', [makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'arr' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports with spread of call expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'at', [makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getItems' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports with spread of array expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'at', [makeSpreadArg({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] })]))
      expect(reports.length).toBe(1)
    })

    test('reports with spread of object expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'at', [makeSpreadArg({ type: 'ObjectExpression', properties: [] })]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'at', [makeSpreadArg()]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports with spread of binary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'at', [makeSpreadArg({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports with spread of conditional expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'at', [makeSpreadArg({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } })]))
      expect(reports.length).toBe(1)
    })

    test('reports with spread of arrow function argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'at', [makeSpreadArg({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } })]))
      expect(reports.length).toBe(1)
    })

    test('reports with spread of template literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'at', [makeSpreadArg({ type: 'TemplateLiteral', quasis: [], expressions: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for ObjectExpression callee object — does not check callee.object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'at', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (44) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for foo.at(0) — Literal arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'at', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for foo.at(-1) — negative Literal arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'at', [{ type: 'Literal', value: -1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for foo.at(n) — Identifier arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'at', [{ type: 'Identifier', name: 'n' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for foo.at() — no args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'at'))
      expect(reports.length).toBe(0)
    })

    test('does not report for foo.at(1, 2) — two non-spread args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'at', [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for foo.at(...a, ...b) — two spread args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'at', [makeSpreadArg({ type: 'Identifier', name: 'a' }), makeSpreadArg({ type: 'Identifier', name: 'b' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for foo.includes(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'includes', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for foo.indexOf(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'indexOf', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for foo.map(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'map', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for foo.find(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'find', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for foo.slice(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'slice', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'foo' },
          property: { type: 'Literal', value: 'at' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "cat"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'cat', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for computed member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'at', [makeSpreadArg()], true))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'foo' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'foo' },
          property: null,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for property name "At" — uppercase', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'At', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for property name "AT" — all caps', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'AT', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is Identifier (not SpreadElement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'at', [{ type: 'Identifier', name: 'n' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is Literal (not SpreadElement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'at', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is CallExpression (not SpreadElement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'at', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getIndex' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'at', [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for property name "charAt"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'charAt', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for property name "concat"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'concat', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is MemberExpression (not SpreadElement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'at', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'idx' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for property name "flat"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'flat', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for UpdateExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression({ type: 'UpdateExpression', operator: '++', prefix: true, argument: { type: 'Identifier', name: 'x' }, loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (16) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringAtSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryStringAtSpreadRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'at', [makeSpreadArg()]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'at', [{ type: 'Literal', value: 0 }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'at', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'at', [{ type: 'Literal', value: 0 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'bar' }, 'at', [makeSpreadArg()]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'foo' },
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: [makeSpreadArg()],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'foo' },
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: [makeSpreadArg()],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'at', [{ type: 'Literal', value: 0 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'at', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'includes', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'bar' }, 'at', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'at', [makeSpreadArg(), { type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringAtSpreadRule.create(context)
      const visitor2 = noUnnecessaryStringAtSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringAtSpreadRule.meta
      const meta2 = noUnnecessaryStringAtSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'foo' },
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: [makeSpreadArg()],
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
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'foo' },
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: [makeSpreadArg()],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'foo' },
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'foo' }, 'at', [makeSpreadArg()])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringAtSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryStringAtSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryStringAtSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'foo' },
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'foo' }, 'at', [makeSpreadArg()], false, 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('computed=false member expression reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'foo' },
          property: { type: 'Identifier', name: 'at' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('computed=true member expression does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'foo' },
          property: { type: 'Identifier', name: 'at' },
          computed: true,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })
})
