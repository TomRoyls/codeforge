import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringAtZero } from '../../../../src/rules/patterns/no-unnecessary-string-at-zero.js'
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

function makeNumLiteral(value: number): unknown {
  return { type: 'Literal', value }
}

// ===== TEST COUNT: 95 =====

describe('no-unnecessary-string-at-zero rule', () => {
  // ===== META TESTS (8) =====

  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringAtZero.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringAtZero.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringAtZero.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringAtZero.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringAtZero.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning at(0)', () => {
      const desc = noUnnecessaryStringAtZero.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/at\(0\)/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringAtZero.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-at-zero.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringAtZero.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringAtZero).toBeDefined()
      expect(noUnnecessaryStringAtZero.meta).toBeDefined()
      expect(noUnnecessaryStringAtZero.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (30) =====

  describe('positive cases — reports unnecessary .at(0)', () => {
    test('reports for str.at(0) with Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'at', [makeNumLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for "hello".at(0) with Literal string object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'at', [makeNumLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.at(0) with Identifier named arr', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'at', [makeNumLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for result.at(0) with Identifier named result', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'result' }, 'at', [makeNumLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for getStr().at(0) with CallExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getStr' }, arguments: [] }, 'at', [makeNumLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.prop.at(0) with MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }, 'at', [makeNumLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr[0].at(0) with computed MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'Literal', value: 0 }, computed: true }, 'at', [makeNumLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for template literal .at(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TemplateLiteral', quasis: [], expressions: [] }, 'at', [makeNumLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for ArrayExpression .at(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'at', [makeNumLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for ObjectExpression .at(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'at', [makeNumLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions at(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'at', [makeNumLiteral(0)]))
      expect(reports[0].message).toMatch(/at\(0\)/)
    })

    test('report message mentions charAt or bracket notation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'at', [makeNumLiteral(0)]))
      expect(reports[0].message).toMatch(/charAt|bracket/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'at', [makeNumLiteral(0)]))
      expect(reports[0].message).toBe(
        'String.prototype.at(0) is unnecessary. Use String.prototype.charAt(0) or bracket notation str[0] for clarity.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'at', [makeNumLiteral(0)]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'at', [makeNumLiteral(0)]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'at', [makeNumLiteral(0)])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'at', [makeNumLiteral(0)], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'at', [makeNumLiteral(0)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'at', [makeNumLiteral(0)]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'at', [makeNumLiteral(0)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'at', [makeNumLiteral(0)]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for empty string literal .at(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: '' }, 'at', [makeNumLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for number literal .at(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 42 }, 'at', [makeNumLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for this.at(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ThisExpression' }, 'at', [makeNumLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'at', [makeNumLiteral(0)]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for FunctionExpression object .at(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, 'at', [makeNumLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for ArrowFunctionExpression object .at(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }, 'at', [makeNumLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for chained call fn().at(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      const innerCall = { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }
      visitor.CallExpression(makeCallNode(innerCall, 'at', [makeNumLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for nested member a.b.c.at(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      const nested = { type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' } }
      visitor.CallExpression(makeCallNode(nested, 'at', [makeNumLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('report loc end values are preserved', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'at', [makeNumLiteral(0)], 3, 5, 3, 18))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(18)
    })

    test('reports for UnaryExpression object .at(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }, 'at', [makeNumLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for ConditionalExpression object .at(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 'a' }, alternate: { type: 'Literal', value: 'b' } }, 'at', [makeNumLiteral(0)]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (42) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for str.at(1) — non-zero index', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'at', [makeNumLiteral(1)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.at(-1) — negative index', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'at', [{ type: 'Literal', value: -1 }]))
      expect(reports.length).toBe(0)
    })

    test('reports for str.at(-0) — negative zero equals positive zero with ===', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'at', [{ type: 'Literal', value: -0 }]))
      expect(reports.length).toBe(1)
    })

    test('does not report for str.at(42) — arbitrary positive index', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'at', [makeNumLiteral(42)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.at(-5) — arbitrary negative index', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'at', [{ type: 'Literal', value: -5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.charAt(0) — different method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [makeNumLiteral(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str[0] — bracket notation (computed MemberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      // This is a MemberExpression, not a CallExpression, so no report
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'at' },
          computed: true,
        },
        arguments: [makeNumLiteral(0)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.at() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'at', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.at(0, 1) — too many arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'at', [makeNumLiteral(0), makeNumLiteral(1)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.at(0, 1, 2) — three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'at', [makeNumLiteral(0), makeNumLiteral(1), makeNumLiteral(2)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.slice(0) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [makeNumLiteral(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.indexOf(0) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'indexOf', [makeNumLiteral(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.charAt(0) — charAt method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [makeNumLiteral(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is Identifier instead of NumericLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'at', [{ type: 'Identifier', name: 'zero' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is StringLiteral instead of NumericLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'at', [{ type: 'Literal', value: '0' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is Literal with string "0"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'at', [{ type: 'Literal', value: '0' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property name is "At" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'At', [makeNumLiteral(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property name is "AT" (all caps)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'AT', [makeNumLiteral(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'at' },
        arguments: [makeNumLiteral(0)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'at' },
          computed: false,
        },
        arguments: [makeNumLiteral(0)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type (not CallExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing — handles undefined callee gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      expect(() => visitor.CallExpression({ type: 'CallExpression', arguments: [makeNumLiteral(0)], loc: makeLoc(1, 0, 1, 5) })).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null — handles null callee gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      expect(() => visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeNumLiteral(0)], loc: makeLoc(1, 0, 1, 5) })).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is missing — handles undefined property gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      expect(() => visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'str' } },
        arguments: [makeNumLiteral(0)],
        loc: makeLoc(1, 0, 1, 10),
      })).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is null — handles null property gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      expect(() => visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'str' }, property: null },
        arguments: [makeNumLiteral(0)],
        loc: makeLoc(1, 0, 1, 10),
      })).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when NumericLiteral value is 0.5', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'at', [{ type: 'Literal', value: 0.5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when NumericLiteral value is 100', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'at', [makeNumLiteral(100)]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'at', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getIndex' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'at', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'idx' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "at" but computed is true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'at' },
          computed: true,
        },
        arguments: [makeNumLiteral(0)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (13) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringAtZero.create(ctx1)
      const visitor2 = noUnnecessaryStringAtZero.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'at', [makeNumLiteral(0)]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'at', [makeNumLiteral(1)]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'at', [makeNumLiteral(0)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'at', [makeNumLiteral(1)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'at', [makeNumLiteral(0)]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'at' },
          computed: false,
        },
        arguments: [makeNumLiteral(0)],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'at', [makeNumLiteral(0)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'at', [makeNumLiteral(1)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [makeNumLiteral(0)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'at', [makeNumLiteral(0)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'at', [makeNumLiteral(-1)]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringAtZero.create(context)
      const visitor2 = noUnnecessaryStringAtZero.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringAtZero.meta
      const meta2 = noUnnecessaryStringAtZero.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'at' },
          computed: false,
        },
        arguments: [makeNumLiteral(0)],
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
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'at' },
          computed: false,
        },
        arguments: [makeNumLiteral(0)],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'at' },
          computed: false,
        },
        arguments: [makeNumLiteral(0)],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'at', [makeNumLiteral(0)])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringAtZero).toBeDefined()
      expect(typeof noUnnecessaryStringAtZero.create).toBe('function')
      expect(typeof noUnnecessaryStringAtZero.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'at' },
          computed: false,
        },
        arguments: [makeNumLiteral(0)],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAtZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'at', [makeNumLiteral(0)], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })
  })
})
