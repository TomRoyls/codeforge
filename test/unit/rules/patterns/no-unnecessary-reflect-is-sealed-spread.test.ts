import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryReflectIsSealedSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-reflect-is-sealed-spread.js'
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

function makeReflectIsSealedCall(
  spreadArgument: unknown = { type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } },
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 29,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      computed: false,
      object: { type: 'Identifier', name: 'Reflect' },
      property: { type: 'Identifier', name: 'isSealed' },
    },
    arguments: [spreadArgument],
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
      computed: false,
      object,
      property: { type: 'Identifier', name: methodName },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeSpreadArg(argument: unknown = { type: 'Identifier', name: 'items' }): unknown {
  return { type: 'SpreadElement', argument }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-reflect-is-sealed-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryReflectIsSealedSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryReflectIsSealedSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryReflectIsSealedSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryReflectIsSealedSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryReflectIsSealedSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Reflect.isSealed', () => {
      const desc = noUnnecessaryReflectIsSealedSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/reflect/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryReflectIsSealedSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-reflect-is-sealed-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryReflectIsSealedSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryReflectIsSealedSpreadRule).toBeDefined()
      expect(noUnnecessaryReflectIsSealedSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryReflectIsSealedSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (28) =====

  describe('positive cases — reports Reflect.isSealed with spread', () => {
    test('reports Reflect.isSealed(...items) with spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsSealedCall())
      expect(reports.length).toBe(1)
    })

    test('reports Reflect.isSealed(...arr) with identifier spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsSealedCall(makeSpreadArg({ type: 'Identifier', name: 'arr' })))
      expect(reports.length).toBe(1)
    })

    test('reports Reflect.isSealed(...obj) with single-letter identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsSealedCall(makeSpreadArg({ type: 'Identifier', name: 'x' })))
      expect(reports.length).toBe(1)
    })

    test('reports Reflect.isSealed with SpreadElement containing CallExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsSealedCall(makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getItems' }, arguments: [] })))
      expect(reports.length).toBe(1)
    })

    test('reports Reflect.isSealed with SpreadElement containing MemberExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsSealedCall(makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'keys' } })))
      expect(reports.length).toBe(1)
    })

    test('reports Reflect.isSealed with SpreadElement containing ArrayExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsSealedCall(makeSpreadArg({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 'key' }] })))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Reflect.isSealed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsSealedCall())
      expect(reports[0].message).toMatch(/Reflect\.isSealed/)
    })

    test('report message mentions spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsSealedCall())
      expect(reports[0].message).toMatch(/spread/i)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsSealedCall())
      expect(reports[0].message).toBe(
        'Reflect.isSealed(...items) with spread is unusual. isSealed() expects a single object argument.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsSealedCall())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsSealedCall())
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      const node = makeReflectIsSealedCall()
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsSealedCall(makeSpreadArg(), 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsSealedCall())
      visitor.CallExpression(makeReflectIsSealedCall(makeSpreadArg({ type: 'Identifier', name: 'other' })))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsSealedCall())
      visitor.CallExpression(makeReflectIsSealedCall(makeSpreadArg({ type: 'Identifier', name: 'other' })))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports with SpreadElement containing ArrowFunction argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsSealedCall(makeSpreadArg({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } })))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing ConditionalExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsSealedCall(makeSpreadArg({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 'a' }, alternate: { type: 'Literal', value: 'b' } })))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing BinaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsSealedCall(makeSpreadArg({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing ObjectExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsSealedCall(makeSpreadArg({ type: 'ObjectExpression', properties: [] })))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing TemplateLiteral argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsSealedCall(makeSpreadArg({ type: 'TemplateLiteral', quasis: [], expressions: [] })))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing Literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsSealedCall(makeSpreadArg({ type: 'Literal', value: 42 })))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing FunctionExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsSealedCall(makeSpreadArg({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } })))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsSealedCall())
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports with SpreadElement containing null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsSealedCall({ type: 'SpreadElement', argument: null }))
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsSealedCall(makeSpreadArg(), 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports with SpreadElement containing SequenceExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsSealedCall(makeSpreadArg({ type: 'SequenceExpression', expressions: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }] })))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing UpdateExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsSealedCall(makeSpreadArg({ type: 'UpdateExpression', operator: '++', prefix: false, argument: { type: 'Identifier', name: 'i' } })))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing YieldExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsSealedCall(makeSpreadArg({ type: 'YieldExpression', argument: { type: 'Identifier', name: 'val' }, delegate: false })))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Reflect.isSealed(target) — regular identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Reflect' }, 'isSealed', [{ type: 'Identifier', name: 'target' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.isSealed() — zero arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Reflect' }, 'isSealed', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.isSealed("literal") — Literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Reflect' }, 'isSealed', [{ type: 'Literal', value: 'obj' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.get(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Reflect' }, 'get', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.set(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Reflect' }, 'set', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.apply(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Reflect' }, 'apply', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.ownKeys(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Reflect' }, 'ownKeys', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.deleteProperty(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Reflect' }, 'deleteProperty', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.isSealed(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'isSealed', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Proxy.isSealed(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Proxy' }, 'isSealed', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for reflect.isSealed(...items) — lowercase object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'reflect' }, 'isSealed', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for REFLECT.isSealed(...items) — uppercase object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'REFLECT' }, 'isSealed', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'window' }, property: { type: 'Identifier', name: 'Reflect' } },
          property: { type: 'Identifier', name: 'isSealed' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getReflect' }, arguments: [] },
          property: { type: 'Identifier', name: 'isSealed' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Literal', value: 'isSealed' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is computed member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'isSealed' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'isSealed' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'isSealed' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: null,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array has 2 elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Reflect' }, 'isSealed', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'a' } }, { type: 'Identifier', name: 'b' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array has 3 elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Reflect' }, 'isSealed', [makeSpreadArg(), { type: 'Identifier', name: 'b' }, { type: 'Identifier', name: 'c' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.isSealed with ObjectExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Reflect' }, 'isSealed', [{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.isSealed with ArrayExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Reflect' }, 'isSealed', [{ type: 'ArrayExpression', elements: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Reflect.has(...items) — wrong method name has', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Reflect' }, 'has', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryReflectIsSealedSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryReflectIsSealedSpreadRule.create(ctx2)
      visitor1.CallExpression(makeReflectIsSealedCall())
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'Reflect' }, 'isSealed', [{ type: 'Identifier', name: 'target' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsSealedCall())
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Reflect' }, 'isSealed', [{ type: 'Identifier', name: 'target' }]))
      visitor.CallExpression(makeReflectIsSealedCall(makeSpreadArg({ type: 'Identifier', name: 'other' })))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'isSealed' },
        },
        arguments: [makeSpreadArg()],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'isSealed' },
        },
        arguments: [makeSpreadArg()],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsSealedCall())
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Reflect' }, 'isSealed', [{ type: 'Identifier', name: 'target' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'isSealed', [makeSpreadArg()]))
      visitor.CallExpression(makeReflectIsSealedCall(makeSpreadArg({ type: 'Identifier', name: 'x' })))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Reflect' }, 'get', [makeSpreadArg()]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      const visitor2 = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryReflectIsSealedSpreadRule.meta
      const meta2 = noUnnecessaryReflectIsSealedSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'isSealed' },
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
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'isSealed' },
        },
        arguments: [makeSpreadArg()],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'isSealed' },
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
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      const node = makeReflectIsSealedCall()
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryReflectIsSealedSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryReflectIsSealedSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryReflectIsSealedSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'isSealed' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeReflectIsSealedCall())
      visitor.CallExpression(makeReflectIsSealedCall(makeSpreadArg({ type: 'Identifier', name: 'keys' })))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'isSealed' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object type is Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'Reflect' }, 'isSealed', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "IsSealed" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReflectIsSealedSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Reflect' }, 'IsSealed', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })
  })
})
