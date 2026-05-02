import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringPadStartEmptyRule } from '../../../../src/rules/patterns/no-unnecessary-string-pad-start-empty.js'
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

function makeNumericLiteral(value: number): unknown {
  return { type: 'NumericLiteral', value }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-string-pad-start-empty rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringPadStartEmptyRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringPadStartEmptyRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringPadStartEmptyRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringPadStartEmptyRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringPadStartEmptyRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning padStart', () => {
      const desc = noUnnecessaryStringPadStartEmptyRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/padstart/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringPadStartEmptyRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-pad-start-empty.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringPadStartEmptyRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringPadStartEmptyRule).toBeDefined()
      expect(noUnnecessaryStringPadStartEmptyRule.meta).toBeDefined()
      expect(noUnnecessaryStringPadStartEmptyRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (28) =====

  describe('positive cases — reports unnecessary padStart(0)', () => {
    test('reports for str.padStart(0) with Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for "hello".padStart(0) with Literal string object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'padStart', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.prop.padStart(0) with MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }, 'padStart', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for getStr().padStart(0) with CallExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getStr' }, arguments: [] }, 'padStart', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions padStart', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [makeNumericLiteral(0)]))
      expect(reports[0].message).toMatch(/padStart/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [makeNumericLiteral(0)]))
      expect(reports[0].message).toBe(
        'str.padStart(0) does nothing since padding length is 0.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [makeNumericLiteral(0)]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [makeNumericLiteral(0)]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [makeNumericLiteral(0)])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [makeNumericLiteral(0)], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'padStart', [makeNumericLiteral(0)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'padStart', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'padStart', [makeNumericLiteral(0)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'padStart', [makeNumericLiteral(0)]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for padStart(0) with different variable name text', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'text' }, 'padStart', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for padStart(0) with ArrayExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'padStart', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for padStart(0) with ObjectExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'padStart', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for padStart(0) with FunctionExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, 'padStart', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [makeNumericLiteral(0)]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for padStart(0) with BinaryExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Literal', value: 'b' } }, 'padStart', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for padStart(0) with ArrowFunctionExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }, 'padStart', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for padStart(0) with ConditionalExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 'a' }, alternate: { type: 'Literal', value: 'b' } }, 'padStart', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for padStart(0) with NewExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'NewExpression', callee: { type: 'Identifier', name: 'String' }, arguments: [] }, 'padStart', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for padStart(0) with TemplateLiteral object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TemplateLiteral', quasis: [], expressions: [] }, 'padStart', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for padStart(0) with UnaryExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }, 'padStart', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for padStart(0.0) — value 0 as float', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [makeNumericLiteral(0.0)]))
      expect(reports.length).toBe(1)
    })

    test('reports with loc at specific line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [makeNumericLiteral(0)], 7, 3, 7, 22))
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(22)
    })

    test('reports two separate padStart(0) calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'padStart', [makeNumericLiteral(0)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'padStart', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(2)
    })

    test('reports for padStart(0) with AssignmentExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'AssignmentExpression', operator: '=', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 'hi' } }, 'padStart', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for chained member access this.state.text.padStart(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'MemberExpression', object: { type: 'ThisExpression' }, property: { type: 'Identifier', name: 'state' } }, property: { type: 'Identifier', name: 'text' } }, 'padStart', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for str.padStart(1) — non-zero value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [makeNumericLiteral(1)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.padStart(5) — non-zero value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [makeNumericLiteral(5)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.padStart(-1) — negative value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [makeNumericLiteral(-1)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.padStart(0.5) — non-zero float', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [makeNumericLiteral(0.5)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.padStart() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart'))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.padStart(0, "x") — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [makeNumericLiteral(0), { type: 'StringLiteral', value: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.padEnd(0) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padEnd', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.padstart(0) — lowercase method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padstart', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str["padStart"](0) — computed member', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'padStart' },
          computed: true,
        },
        arguments: [makeNumericLiteral(0)],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.startsWith(0) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for padStart(0) — standalone call, not member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'padStart' },
        arguments: [makeNumericLiteral(0)],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeNumericLiteral(0)], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeNumericLiteral(0)], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeNumericLiteral(0)], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'padStart' },
        },
        arguments: [makeNumericLiteral(0)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.indexOf(0) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'indexOf', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.slice(0) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.charAt(0) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is StringLiteral("0") instead of NumericLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [{ type: 'StringLiteral', value: '0' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is an Identifier variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [{ type: 'Identifier', name: 'len' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument type is Literal with value 0 (not NumericLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.padStart(100) — large non-zero value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [makeNumericLiteral(100)]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
        },
        arguments: [makeNumericLiteral(0)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: null,
        },
        arguments: [makeNumericLiteral(0)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.repeat(0) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.substr(0) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'substr', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.substring(0) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'substring', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for three arguments str.padStart(0, "x", "y")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [makeNumericLiteral(0), { type: 'StringLiteral', value: 'x' }, { type: 'StringLiteral', value: 'y' }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringPadStartEmptyRule.create(ctx1)
      const visitor2 = noUnnecessaryStringPadStartEmptyRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [makeNumericLiteral(0)]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [makeNumericLiteral(5)]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [makeNumericLiteral(0)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [makeNumericLiteral(5)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'padStart' },
        },
        arguments: [makeNumericLiteral(0)],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'padStart' },
        },
        arguments: [makeNumericLiteral(0)],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [makeNumericLiteral(5)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [makeNumericLiteral(0)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padEnd', [makeNumericLiteral(0)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [makeNumericLiteral(0)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [makeNumericLiteral(10)]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringPadStartEmptyRule.create(context)
      const visitor2 = noUnnecessaryStringPadStartEmptyRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringPadStartEmptyRule.meta
      const meta2 = noUnnecessaryStringPadStartEmptyRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'padStart' },
        },
        arguments: [makeNumericLiteral(0)],
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
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'padStart' },
        },
        arguments: [makeNumericLiteral(0)],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'padStart' },
        },
        arguments: [makeNumericLiteral(0)],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [makeNumericLiteral(0)])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringPadStartEmptyRule).toBeDefined()
      expect(typeof noUnnecessaryStringPadStartEmptyRule.create).toBe('function')
      expect(typeof noUnnecessaryStringPadStartEmptyRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'padStart' },
        },
        arguments: [makeNumericLiteral(0)],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [makeNumericLiteral(0)], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles non-computed member expression (computed: false)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'padStart' },
          computed: false,
        },
        arguments: [makeNumericLiteral(0)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'padStart' },
          computed: true,
        },
        arguments: [makeNumericLiteral(0)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'padStart', [makeNumericLiteral(0)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'padStart', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
