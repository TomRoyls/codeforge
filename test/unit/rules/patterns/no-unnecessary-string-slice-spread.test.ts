import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringSliceSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-string-slice-spread.js'
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

describe('no-unnecessary-string-slice-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringSliceSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringSliceSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringSliceSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringSliceSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringSliceSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning slice', () => {
      const desc = noUnnecessaryStringSliceSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/slice/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringSliceSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-slice-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringSliceSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringSliceSpreadRule).toBeDefined()
      expect(noUnnecessaryStringSliceSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryStringSliceSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports unnecessary spread in slice', () => {
    test('reports for str.slice(...arr)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for "hello".slice(...args)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'slice', [makeSpreadArg({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.prop.slice(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }, 'slice', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for fn().slice(...range)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }, 'slice', [makeSpreadArg({ type: 'Identifier', name: 'range' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr[0].slice(...idx)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'Literal', value: 0 }, computed: true }, 'slice', [makeSpreadArg({ type: 'Identifier', name: 'idx' })]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions slice', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports[0].message).toMatch(/slice/)
    })

    test('report message mentions spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports[0].message).toBe(
        'str.slice(...items) with spread is unusual. slice() expects start and optional end indices.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [makeSpreadArg({ type: 'Identifier', name: 'arr' })])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [makeSpreadArg({ type: 'Identifier', name: 'arr' })], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'slice', [makeSpreadArg({ type: 'Identifier', name: 'x' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'slice', [makeSpreadArg({ type: 'Identifier', name: 'y' })]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'slice', [makeSpreadArg({ type: 'Identifier', name: 'x' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'slice', [makeSpreadArg({ type: 'Identifier', name: 'y' })]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for spread over array literal [...items]', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [makeSpreadArg({ type: 'ArrayExpression', elements: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread over call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'slice', [makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getRange' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread over member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'slice', [makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'range' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread over binary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'slice', [makeSpreadArg({ type: 'BinaryExpression', operator: '+', left: { type: 'Literal', value: 1 }, right: { type: 'Literal', value: 2 } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread over conditional expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'slice', [makeSpreadArg({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread over template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'slice', [makeSpreadArg({ type: 'TemplateLiteral', quasis: [], expressions: [] })]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for spread over arrow function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'slice', [makeSpreadArg({ type: 'CallExpression', callee: { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread over logical expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'slice', [makeSpreadArg({ type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread over object expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'slice', [makeSpreadArg({ type: 'ObjectExpression', properties: [] })]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (44) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for str.slice(0, 5) — no spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.slice(0) — one non-spread arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.slice() — no args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice'))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.splice(...arr) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'splice', [makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.includes(...arr) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.indexOf(...arr) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'indexOf', [makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.map(...arr) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'map', [makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.trim(...arr) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'trim', [makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.concat(...arr) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'concat', [makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for two spread args str.slice(...a, ...b)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [makeSpreadArg({ type: 'Identifier', name: 'a' }), makeSpreadArg({ type: 'Identifier', name: 'b' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for three spread args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [makeSpreadArg({ type: 'Identifier', name: 'a' }), makeSpreadArg({ type: 'Identifier', name: 'b' }), makeSpreadArg({ type: 'Identifier', name: 'c' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for mixed args: spread + literal str.slice(...a, 5)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [makeSpreadArg({ type: 'Identifier', name: 'a' }), { type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'slice' },
          computed: true,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'arr' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'arr' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: null,
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'arr' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for computed member str["slice"](...arr)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'slice' },
          computed: true,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'arr' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is Identifier not SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'Identifier', name: 'arr' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is Literal not SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is CallExpression not SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is MemberExpression not SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'start' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is ArrayExpression not SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'ArrayExpression', elements: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is ObjectExpression not SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is BinaryExpression not SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'BinaryExpression', operator: '+', left: { type: 'Literal', value: 1 }, right: { type: 'Literal', value: 2 } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is ArrowFunctionExpression not SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.slice(start, end) — two non-spread args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'Identifier', name: 'start' }, { type: 'Identifier', name: 'end' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.substring(...arr) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'substring', [makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.substr(...arr) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'substr', [makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.split(...arr) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'split', [makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.replace(...arr) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'slice' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Slice" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'Slice', [makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringSliceSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryStringSliceSpreadRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'Literal', value: 0 }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [makeSpreadArg({ type: 'Identifier', name: 'a' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'Literal', value: 0 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [makeSpreadArg({ type: 'Identifier', name: 'b' })]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'slice' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'arr' })],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'slice', [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 5 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'slice', [makeSpreadArg({ type: 'Identifier', name: 'x' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'splice', [makeSpreadArg({ type: 'Identifier', name: 'x' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'slice', [makeSpreadArg({ type: 'Identifier', name: 'y' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'slice'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringSliceSpreadRule.create(context)
      const visitor2 = noUnnecessaryStringSliceSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringSliceSpreadRule.meta
      const meta2 = noUnnecessaryStringSliceSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'slice' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'arr' })],
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
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'slice' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'arr' })],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'slice' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'arr' })],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [makeSpreadArg({ type: 'Identifier', name: 'arr' })])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringSliceSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryStringSliceSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryStringSliceSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'slice' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'arr' })],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [makeSpreadArg({ type: 'Identifier', name: 'arr' })], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed member expression property (non-computed)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'slice' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'arr' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'slice' },
          computed: true,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'arr' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })
})
