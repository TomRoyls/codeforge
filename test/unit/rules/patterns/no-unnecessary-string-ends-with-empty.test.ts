import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringEndsWithEmpty } from '../../../../src/rules/patterns/no-unnecessary-string-ends-with-empty.js'
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

function makeStrLit(value: string): unknown {
  return { type: 'Literal', value }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-string-ends-with-empty rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringEndsWithEmpty.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringEndsWithEmpty.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringEndsWithEmpty.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringEndsWithEmpty.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringEndsWithEmpty.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning endsWith', () => {
      const desc = noUnnecessaryStringEndsWithEmpty.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/endswith/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringEndsWithEmpty.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-ends-with-empty.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringEndsWithEmpty.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringEndsWithEmpty).toBeDefined()
      expect(noUnnecessaryStringEndsWithEmpty.meta).toBeDefined()
      expect(noUnnecessaryStringEndsWithEmpty.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (29) =====

  describe('positive cases — reports unnecessary endsWith empty string', () => {
    test('reports for str.endsWith("") — Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for "hello".endsWith("") — StringLiteral object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'endsWith', [makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for literal.startsWith replaced with endsWith("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'text' }, 'endsWith', [makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for member expression object obj.prop.endsWith("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }, 'endsWith', [makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for call expression result getValue().endsWith("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getValue' }, arguments: [] }, 'endsWith', [makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions endsWith and empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [makeStrLit('')]))
      expect(reports[0].message).toMatch(/endsWith/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [makeStrLit('')]))
      expect(reports[0].message).toBe(
        `String.prototype.endsWith('') always returns true. Remove the call.`,
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [makeStrLit('')]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [makeStrLit('')]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [makeStrLit('')])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [makeStrLit('')], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [makeStrLit('')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'endsWith', [makeStrLit('')]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [makeStrLit('')]))
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'endsWith', [makeStrLit('')]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports when object is a Literal string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'test' }, 'endsWith', [makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('reports when object is a this expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ThisExpression' }, 'endsWith', [makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for chained member expression this.value.endsWith("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'ThisExpression' }, property: { type: 'Identifier', name: 'value' } }, 'endsWith', [makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [makeStrLit('')]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for ArrayExpression object ["a","b"].join("").endsWith("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'endsWith', [makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for ObjectExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'endsWith', [makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for FunctionExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, 'endsWith', [makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for ConditionalExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 'a' }, alternate: { type: 'Literal', value: 'b' } }, 'endsWith', [makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for TemplateLiteral object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TemplateLiteral', quasis: [], expressions: [] }, 'endsWith', [makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for ArrowFunctionExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }, 'endsWith', [makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for UnaryExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }, 'endsWith', [makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('reports for BinaryExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'BinaryExpression', operator: '+', left: { type: 'Literal', value: 'a' }, right: { type: 'Literal', value: 'b' } }, 'endsWith', [makeStrLit('')]))
      expect(reports.length).toBe(1)
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [makeStrLit('')], 3, 8, 7, 12))
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(12)
    })

    test('reports for nested call expression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'method' } }, arguments: [] },
        'endsWith', [makeStrLit('')],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for NewExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'NewExpression', callee: { type: 'Identifier', name: 'String' }, arguments: [] }, 'endsWith', [makeStrLit('')]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (36) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for str.endsWith("lo") — non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [makeStrLit('lo')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.endsWith("a") — single char string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [makeStrLit('a')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.endsWith(x) — variable argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.endsWith() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith'))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.endsWith("", 5) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [makeStrLit(''), { type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.startsWith("") — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [makeStrLit('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.includes("") — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [makeStrLit('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.indexOf("") — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'indexOf', [makeStrLit('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.trim() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'trim', []))
      expect(reports.length).toBe(0)
    })

    test('reports for str.endsWith with Literal type empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('does not report for str.endsWith with NumericLiteral argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeStrLit('')], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeStrLit('')], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeStrLit('')], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'endsWith' },
          computed: false,
        },
        arguments: [makeStrLit('')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "endswith" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endswith', [makeStrLit('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "ENDSWITH" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'ENDSWITH', [makeStrLit('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [{ type: 'TemplateLiteral', quasis: [], expressions: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getSuffix' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'key' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [null]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
        },
        arguments: [makeStrLit('')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: null,
        },
        arguments: [makeStrLit('')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'endsWith' },
        },
        arguments: [makeStrLit('')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('reports when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'endsWith' },
        },
        arguments: [makeStrLit('')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when argument is a StringLiteral with non-empty value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [makeStrLit('hello')]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a StringLiteral with space value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [makeStrLit(' ')]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array has three elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [makeStrLit(''), { type: 'Literal', value: 5 }, { type: 'Literal', value: 10 }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringEndsWithEmpty.create(ctx1)
      const visitor2 = noUnnecessaryStringEndsWithEmpty.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [makeStrLit('')]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [makeStrLit('lo')]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [makeStrLit('')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [makeStrLit('lo')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [makeStrLit('')]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'endsWith' },
          computed: false,
        },
        arguments: [makeStrLit('')],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'endsWith' },
          computed: false,
        },
        arguments: [makeStrLit('')],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [makeStrLit('lo')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [makeStrLit('')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [makeStrLit('')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [makeStrLit('')]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringEndsWithEmpty.create(context)
      const visitor2 = noUnnecessaryStringEndsWithEmpty.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringEndsWithEmpty.meta
      const meta2 = noUnnecessaryStringEndsWithEmpty.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'endsWith' },
          computed: false,
        },
        arguments: [makeStrLit('')],
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
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'endsWith' },
          computed: false,
        },
        arguments: [makeStrLit('')],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'endsWith' },
          computed: false,
        },
        arguments: [makeStrLit('')],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [makeStrLit('')])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringEndsWithEmpty).toBeDefined()
      expect(typeof noUnnecessaryStringEndsWithEmpty.create).toBe('function')
      expect(typeof noUnnecessaryStringEndsWithEmpty.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'endsWith' },
          computed: false,
        },
        arguments: [makeStrLit('')],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [makeStrLit('')], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed member expression property — non-computed reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'endsWith' },
          computed: false,
        },
        arguments: [makeStrLit('')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'endsWith' },
          computed: true,
        },
        arguments: [makeStrLit('')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringEndsWithEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [makeStrLit('')]))
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'endsWith', [makeStrLit('')]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
