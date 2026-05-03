import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryObjectGetPrototypeOfSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-object-get-prototype-of-spread.js'
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

describe('no-unnecessary-object-get-prototype-of-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryObjectGetPrototypeOfSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryObjectGetPrototypeOfSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryObjectGetPrototypeOfSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryObjectGetPrototypeOfSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryObjectGetPrototypeOfSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning getPrototypeOf', () => {
      const desc = noUnnecessaryObjectGetPrototypeOfSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/getprototypeof/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryObjectGetPrototypeOfSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-object-get-prototype-of-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryObjectGetPrototypeOfSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryObjectGetPrototypeOfSpreadRule).toBeDefined()
      expect(noUnnecessaryObjectGetPrototypeOfSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryObjectGetPrototypeOfSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports Object.getPrototypeOf with spread', () => {
    test('reports Object.getPrototypeOf(...items) with Identifier spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports with ArrayExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'ArrayExpression', elements: [] })],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports with CallExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getItems' }, arguments: [] })],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports with MemberExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'items' } })],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports with ObjectExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'ObjectExpression', properties: [] })],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports with function call spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [{ type: 'Literal', value: 1 }] })],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports with ArrowFunctionExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } })],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports with BinaryExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports with ConditionalExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } })],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports with TemplateLiteral spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'TemplateLiteral', quasis: [], expressions: [] })],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports with NewExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Map' }, arguments: [] })],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports with UnaryExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } })],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports with LogicalExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'LogicalExpression', operator: '&&', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })],
      ))
      expect(reports.length).toBe(1)
    })

    test('report message mentions getPrototypeOf', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      ))
      expect(reports[0].message).toMatch(/getPrototypeOf/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      ))
      expect(reports[0].message).toBe(
        'Object.getPrototypeOf(...items) with spread is unusual. getPrototypeOf() expects a single object.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      ))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      ))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      const node = makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      )
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        5, 10, 5, 30,
      ))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'Identifier', name: 'a' })],
      ))
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'Identifier', name: 'b' })],
      ))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'Identifier', name: 'a' })],
      ))
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'Identifier', name: 'b' })],
      ))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      ))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports with spread of array with elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] })],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports with spread of chained MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'MemberExpression', object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' } }, property: { type: 'Identifier', name: 'c' } })],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports with spread of SequenceExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'SequenceExpression', expressions: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }] })],
      ))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for non-spread Identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [{ type: 'Identifier', name: 'obj' }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-spread Literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [{ type: 'Literal', value: null }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-spread ArrayExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [{ type: 'ArrayExpression', elements: [] }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-spread ObjectExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [{ type: 'ObjectExpression', properties: [] }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-spread CallExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-spread MemberExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong method name "keys"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'keys',
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong method name "values"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'values',
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong method name "entries"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'entries',
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong method name "assign"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'assign',
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong method name "defineProperty"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'defineProperty',
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong object name "MyObject"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'MyObject' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong object name "object" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'object' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong object type MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'MemberExpression', object: { type: 'Identifier', name: 'ns' }, property: { type: 'Identifier', name: 'Object' } },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong arg count — 0 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong arg count — 2 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'Identifier', name: 'a' }), { type: 'Identifier', name: 'b' }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong arg count — 3 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'Identifier', name: 'a' }), makeSpreadArg({ type: 'Identifier', name: 'b' }), makeSpreadArg({ type: 'Identifier', name: 'c' })],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Literal', value: 'getPrototypeOf' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "getprototypeof" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getprototypeof',
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'getPrototypeOf' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'getPrototypeOf' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Literal', value: 'Object' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: null,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for computed member expression (computed: true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getPrototypeOf' },
          computed: true,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression as object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(ctx2)
      visitor1.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      ))
      visitor2.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [{ type: 'Identifier', name: 'obj' }],
      ))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      ))
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [{ type: 'Identifier', name: 'obj' }],
      ))
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'Identifier', name: 'more' })],
      ))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getPrototypeOf' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getPrototypeOf' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      ))
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [{ type: 'Identifier', name: 'obj' }],
      ))
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'MyObject' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      ))
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'keys',
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      ))
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'Identifier', name: 'more' })],
      ))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      const visitor2 = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryObjectGetPrototypeOfSpreadRule.meta
      const meta2 = noUnnecessaryObjectGetPrototypeOfSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getPrototypeOf' },
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
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getPrototypeOf' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getPrototypeOf' },
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
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      const node = makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      )
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryObjectGetPrototypeOfSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryObjectGetPrototypeOfSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryObjectGetPrototypeOfSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getPrototypeOf' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        10, 4, 10, 25,
      ))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed: false explicitly (should report)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getPrototypeOf' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when computed: true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'getPrototypeOf' },
          computed: true,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'Identifier', name: 'a' })],
      ))
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [makeSpreadArg({ type: 'Identifier', name: 'b' })],
      ))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles SpreadElement with null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [{ type: 'SpreadElement', argument: null }],
      ))
      expect(reports.length).toBe(1)
    })

    test('handles SpreadElement with missing argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [{ type: 'SpreadElement' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('handles SpreadElement where argument is another SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectGetPrototypeOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Object' },
        'getPrototypeOf',
        [{ type: 'SpreadElement', argument: { type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } } }],
      ))
      expect(reports.length).toBe(1)
    })
  })
})
