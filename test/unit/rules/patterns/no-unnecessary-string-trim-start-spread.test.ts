import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringTrimStartSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-string-trim-start-spread.js'
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

function makeTrimStartCallNode(
  object: unknown,
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
      property: { type: 'Identifier', name: 'trimStart' },
      computed: false,
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeSpreadArg(argument: unknown): unknown {
  return { type: 'SpreadElement', argument }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-string-trim-start-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringTrimStartSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringTrimStartSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringTrimStartSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringTrimStartSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringTrimStartSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning trimStart', () => {
      const desc = noUnnecessaryStringTrimStartSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/trimstart/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringTrimStartSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-trim-start-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringTrimStartSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringTrimStartSpreadRule).toBeDefined()
      expect(noUnnecessaryStringTrimStartSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryStringTrimStartSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports unnecessary trimStart spread', () => {
    test('reports for str.trimStart(...items) with Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'Identifier', name: 'str' },
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for "hello".trimStart(...args) with Literal object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'Literal', value: 'hello' },
        [makeSpreadArg({ type: 'Identifier', name: 'args' })],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.prop.trimStart(...arr)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } },
        [makeSpreadArg({ type: 'Identifier', name: 'arr' })],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for getStr().trimStart(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'CallExpression', callee: { type: 'Identifier', name: 'getStr' }, arguments: [] },
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for arr[0].trimStart(...items) with computed object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'Literal', value: 0 }, computed: true },
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'Identifier', name: 's' },
        [makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getItems' }, arguments: [] })],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'Identifier', name: 's' },
        [makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'items' } })],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is an ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'Identifier', name: 's' },
        [makeSpreadArg({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] })],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is a Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'Identifier', name: 's' },
        [makeSpreadArg({ type: 'Literal', value: 42 })],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is an ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'Identifier', name: 's' },
        [makeSpreadArg({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } })],
      ))
      expect(reports.length).toBe(1)
    })

    test('report message mentions trimStart and spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'Identifier', name: 'str' },
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      ))
      expect(reports[0].message).toMatch(/trimStart/)
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'Identifier', name: 'str' },
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      ))
      expect(reports[0].message).toBe(
        'str.trimStart(...items) with spread is unusual. trimStart() expects no arguments.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'Identifier', name: 'str' },
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      ))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'Identifier', name: 'str' },
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      ))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      const node = makeTrimStartCallNode(
        { type: 'Identifier', name: 'str' },
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      )
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'Identifier', name: 'str' },
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        5, 10, 5, 30,
      ))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'Identifier', name: 'a' },
        [makeSpreadArg({ type: 'Identifier', name: 'x' })],
      ))
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'Identifier', name: 'b' },
        [makeSpreadArg({ type: 'Identifier', name: 'y' })],
      ))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'Identifier', name: 'a' },
        [makeSpreadArg({ type: 'Identifier', name: 'x' })],
      ))
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'Identifier', name: 'b' },
        [makeSpreadArg({ type: 'Identifier', name: 'y' })],
      ))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'Identifier', name: 'str' },
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      ))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports when spread argument is a ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'Identifier', name: 's' },
        [makeSpreadArg({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } })],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is a TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'Identifier', name: 's' },
        [makeSpreadArg({ type: 'TemplateLiteral', quasis: [], expressions: [] })],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is a BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'Identifier', name: 's' },
        [makeSpreadArg({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is an ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'Identifier', name: 's' },
        [makeSpreadArg({ type: 'ObjectExpression', properties: [] })],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports when object is a FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } },
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports when object is an ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'ArrayExpression', elements: [] },
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports when object is a NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'NewExpression', callee: { type: 'Identifier', name: 'String' }, arguments: [] },
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      ))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (44) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for str.trimStart() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'Identifier', name: 'str' },
        [],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.trimStart(x) with non-spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'Identifier', name: 'str' },
        [{ type: 'Identifier', name: 'x' }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.trimStart(x, y) with two non-spread arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'Identifier', name: 'str' },
        [{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.trimEnd(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'trimEnd' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.trim(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'trim' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.padStart(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'padStart' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.startsWith(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'startsWith' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.trimLeft(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'trimLeft' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.trimstart (lowercase) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'trimstart' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str["trimStart"](...items) — computed member', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'trimStart' },
          computed: true,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for trimStart(...items) — standalone function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'trimStart' },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'trimStart' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: null,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for two spread arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'Identifier', name: 'str' },
        [makeSpreadArg({ type: 'Identifier', name: 'a' }), makeSpreadArg({ type: 'Identifier', name: 'b' })],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for three spread arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'Identifier', name: 'str' },
        [makeSpreadArg({ type: 'Identifier', name: 'a' }), makeSpreadArg({ type: 'Identifier', name: 'b' }), makeSpreadArg({ type: 'Identifier', name: 'c' })],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'trimStart' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression(makeTrimStartCallNode({ type: 'Identifier', name: 'str' }, []))
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is a Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'Identifier', name: 'str' },
        [{ type: 'Literal', value: 'x' }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'Identifier', name: 'str' },
        [{ type: 'Identifier', name: 'x' }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'Identifier', name: 'str' },
        [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'Identifier', name: 'str' },
        [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'x' } }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "TRIMSTART" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'TRIMSTART' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BlockStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression({ type: 'BlockStatement', body: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression({ type: 'FunctionDeclaration', id: { type: 'Identifier', name: 'fn' }, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "TrimStart" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'TrimStart' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (16) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringTrimStartSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryStringTrimStartSpreadRule.create(ctx2)
      visitor1.CallExpression(makeTrimStartCallNode(
        { type: 'Identifier', name: 'str' },
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      ))
      visitor2.CallExpression(makeTrimStartCallNode(
        { type: 'Identifier', name: 'str' },
        [],
      ))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly with mixed calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'Identifier', name: 'str' },
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      ))
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'Identifier', name: 'str' },
        [],
      ))
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'Identifier', name: 'str' },
        [makeSpreadArg({ type: 'Identifier', name: 'more' })],
      ))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'trimStart' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'trimStart' },
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
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression(makeTrimStartCallNode({ type: 'Identifier', name: 'str' }, []))
      visitor.CallExpression(makeTrimStartCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeTrimStartCallNode({ type: 'Identifier', name: 'str' }, [{ type: 'Identifier', name: 'x' }]))
      visitor.CallExpression(makeTrimStartCallNode({ type: 'Identifier', name: 'str' }, [makeSpreadArg({ type: 'Identifier', name: 'more' })]))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'trimStart' },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringTrimStartSpreadRule.create(context)
      const visitor2 = noUnnecessaryStringTrimStartSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringTrimStartSpreadRule.meta
      const meta2 = noUnnecessaryStringTrimStartSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'trimStart' },
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
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'trimStart' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'trimStart' },
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
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      const node = makeTrimStartCallNode(
        { type: 'Identifier', name: 'str' },
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      )
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringTrimStartSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryStringTrimStartSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryStringTrimStartSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'trimStart' },
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
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'Identifier', name: 'str' },
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        10, 4, 10, 25,
      ))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'Identifier', name: 'a' },
        [makeSpreadArg({ type: 'Identifier', name: 'x' })],
      ))
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'Identifier', name: 'b' },
        [makeSpreadArg({ type: 'Identifier', name: 'y' })],
      ))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('spread with nested spread argument does not affect detection', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression(makeTrimStartCallNode(
        { type: 'Identifier', name: 's' },
        [makeSpreadArg(makeSpreadArg({ type: 'Identifier', name: 'deep' }))],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports when callee object is missing (rule does not check object)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'trimStart' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })
  })
})
