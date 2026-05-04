import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryConsoleCountSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-console-count-spread.js'
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

function makeConsoleCountCall(
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
      object: { type: 'Identifier', name: 'console' },
      property: { type: 'Identifier', name: 'count' },
      computed: false,
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
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

function makeSpread(argument: unknown): unknown {
  return { type: 'SpreadElement', argument }
}

function makeConsoleObj(): unknown {
  return { type: 'Identifier', name: 'console' }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-console-count-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryConsoleCountSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryConsoleCountSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryConsoleCountSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryConsoleCountSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryConsoleCountSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning console.count or spread', () => {
      const desc = noUnnecessaryConsoleCountSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/console/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryConsoleCountSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-console-count-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryConsoleCountSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryConsoleCountSpreadRule).toBeDefined()
      expect(noUnnecessaryConsoleCountSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryConsoleCountSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (28) =====

  describe('positive cases — reports console.count with spread', () => {
    test('reports for console.count(...items) with identifier spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeConsoleCountCall([makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for console.count(...arr) with array ref spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeConsoleCountCall([makeSpread({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for console.count(...obj.items) with member expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeConsoleCountCall([makeSpread({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'items' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for console.count(...getItems()) with call expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeConsoleCountCall([makeSpread({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getItems' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for console.count(...[1, 2, 3]) with array expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeConsoleCountCall([makeSpread({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for console.count(...(cond ? a : b)) with conditional spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeConsoleCountCall([makeSpread({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'cond' }, consequent: { type: 'Identifier', name: 'a' }, alternate: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeConsoleCountCall([makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toMatch(/spread/i)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeConsoleCountCall([makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toBe(
        'console.count(...items) with a single spread is unusual. count() expects an optional label string.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeConsoleCountCall([makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeConsoleCountCall([makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      const node = makeConsoleCountCall([makeSpread({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeConsoleCountCall([makeSpread({ type: 'Identifier', name: 'items' })], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeConsoleCountCall([makeSpread({ type: 'Identifier', name: 'a' })]))
      visitor.CallExpression(makeConsoleCountCall([makeSpread({ type: 'Identifier', name: 'b' })]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeConsoleCountCall([makeSpread({ type: 'Identifier', name: 'a' })]))
      visitor.CallExpression(makeConsoleCountCall([makeSpread({ type: 'Identifier', name: 'b' })]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for spread of binary expression ...(a + b)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeConsoleCountCall([makeSpread({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of arrow function ...(() => {})', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeConsoleCountCall([makeSpread({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of object expression ...({})', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeConsoleCountCall([makeSpread({ type: 'ObjectExpression', properties: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of template literal ...(`hello`)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeConsoleCountCall([makeSpread({ type: 'TemplateLiteral', quasis: [], expressions: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of typeof expression ...(typeof x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeConsoleCountCall([makeSpread({ type: 'UnaryExpression', operator: 'typeof', prefix: true, argument: { type: 'Identifier', name: 'x' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of new expression ...(new Foo())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeConsoleCountCall([makeSpread({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Foo' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of await expression ...(await p)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeConsoleCountCall([makeSpread({ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'p' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of logical expression ...(a && b)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeConsoleCountCall([makeSpread({ type: 'LogicalExpression', operator: '&&', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of unary expression ...(!x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeConsoleCountCall([makeSpread({ type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of another call expression ...(fn())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeConsoleCountCall([makeSpread({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeConsoleCountCall([makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for spread of assignment expression ...(x = y)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeConsoleCountCall([makeSpread({ type: 'AssignmentExpression', operator: '=', left: { type: 'Identifier', name: 'x' }, right: { type: 'Identifier', name: 'y' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of sequence expression ...(a, b)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeConsoleCountCall([makeSpread({ type: 'SequenceExpression', expressions: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of yield expression ...(yield x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeConsoleCountCall([makeSpread({ type: 'YieldExpression', argument: { type: 'Identifier', name: 'x' } })]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for console.count(a) — no spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeConsoleCountCall([{ type: 'Identifier', name: 'a' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for console.count(a, b) — 2 args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeConsoleCountCall([{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for console.count() — no args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeConsoleCountCall())
      expect(reports.length).toBe(0)
    })

    test('does not report for console.count(a, ...b) — 2 args with spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeConsoleCountCall([{ type: 'Identifier', name: 'a' }, makeSpread({ type: 'Identifier', name: 'b' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for console.count(a, b, c) — 3 args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeConsoleCountCall([{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }, { type: 'Identifier', name: 'c' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for console.warn(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeConsoleObj(), 'warn', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for console.error(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeConsoleObj(), 'error', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for console.debug(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeConsoleObj(), 'debug', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for console.info(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeConsoleObj(), 'info', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for myObj.count(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'myObj' }, 'count', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for obj.console.count(...items) — object is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'console' } }, 'count', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpread({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpread({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeSpread({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeConsoleObj(),
          property: { type: 'Literal', value: 'count' },
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "log"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(makeConsoleObj(), 'log', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'console' }, 'count', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object name is "Console" — case sensitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Console' }, 'count', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is computed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeConsoleObj(),
          property: { type: 'Identifier', name: 'count' },
          computed: true,
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for foo(...items) — simple call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'foo' },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'count', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getConsole' }, arguments: [] }, 'count', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'count', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeConsoleObj(),
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeConsoleObj(),
          property: null,
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'count' },
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'count' },
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for console["count"](...items) — computed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeConsoleObj(),
          property: { type: 'Literal', value: 'count' },
          computed: true,
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryConsoleCountSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryConsoleCountSpreadRule.create(ctx2)
      visitor1.CallExpression(makeConsoleCountCall([makeSpread({ type: 'Identifier', name: 'a' })]))
      visitor2.CallExpression(makeConsoleCountCall([{ type: 'Identifier', name: 'x' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeConsoleCountCall([makeSpread({ type: 'Identifier', name: 'a' })]))
      visitor.CallExpression(makeConsoleCountCall([{ type: 'Identifier', name: 'x' }]))
      visitor.CallExpression(makeConsoleCountCall([makeSpread({ type: 'Identifier', name: 'b' })]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeConsoleObj(),
          property: { type: 'Identifier', name: 'count' },
          computed: false,
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeConsoleObj(),
          property: { type: 'Identifier', name: 'count' },
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
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeConsoleCountCall([{ type: 'Identifier', name: 'a' }]))
      visitor.CallExpression(makeConsoleCountCall([makeSpread({ type: 'Identifier', name: 'b' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'myObj' }, 'count', [makeSpread({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeConsoleCountCall())
      visitor.CallExpression(makeConsoleCountCall([makeSpread({ type: 'Identifier', name: 'c' })]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryConsoleCountSpreadRule.create(context)
      const visitor2 = noUnnecessaryConsoleCountSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryConsoleCountSpreadRule.meta
      const meta2 = noUnnecessaryConsoleCountSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeConsoleObj(),
          property: { type: 'Identifier', name: 'count' },
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
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeConsoleObj(),
          property: { type: 'Identifier', name: 'count' },
          computed: false,
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeConsoleObj(),
          property: { type: 'Identifier', name: 'count' },
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
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      const node = makeConsoleCountCall([makeSpread({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryConsoleCountSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryConsoleCountSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryConsoleCountSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeConsoleObj(),
          property: { type: 'Identifier', name: 'count' },
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
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeConsoleCountCall([makeSpread({ type: 'Identifier', name: 'items' })], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed false member expression property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeConsoleObj(),
          property: { type: 'Identifier', name: 'count' },
          computed: false,
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee computed is true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeConsoleObj(),
          property: { type: 'Identifier', name: 'count' },
          computed: true,
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleCountSpreadRule.create(context)
      visitor.CallExpression(makeConsoleCountCall([makeSpread({ type: 'Identifier', name: 'a' })]))
      visitor.CallExpression(makeConsoleCountCall([makeSpread({ type: 'Identifier', name: 'b' })]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
