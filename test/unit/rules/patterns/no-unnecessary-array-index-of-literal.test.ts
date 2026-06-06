import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayIndexOfLiteralRule } from '../../../../src/rules/patterns/no-unnecessary-array-index-of-literal.js'
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

function makeStringLiteral(value: string): unknown {
  return { type: 'Literal', value }
}

function makeIdentifier(name: string): unknown {
  return { type: 'Identifier', name }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-index-of-literal rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayIndexOfLiteralRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayIndexOfLiteralRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayIndexOfLiteralRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayIndexOfLiteralRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayIndexOfLiteralRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning indexOf', () => {
      const desc = noUnnecessaryArrayIndexOfLiteralRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/indexof/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayIndexOfLiteralRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-index-of-literal.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayIndexOfLiteralRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayIndexOfLiteralRule).toBeDefined()
      expect(noUnnecessaryArrayIndexOfLiteralRule.meta).toBeDefined()
      expect(noUnnecessaryArrayIndexOfLiteralRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (30) =====

  describe('positive cases — reports indexOf with non-empty string literal', () => {
    test('reports for arr.indexOf("hello") — Identifier receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [makeStringLiteral('hello')]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.indexOf("a") — single char string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [makeStringLiteral('a')]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.indexOf("abc") — multi char string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [makeStringLiteral('abc')]))
      expect(reports.length).toBe(1)
    })

    test('reports for [].indexOf("hello") — ArrayExpression receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'indexOf', [makeStringLiteral('hello')]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.arr.indexOf("test") — MemberExpression receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: makeIdentifier('obj'), property: makeIdentifier('arr') }, 'indexOf', [makeStringLiteral('test')]))
      expect(reports.length).toBe(1)
    })

    test('reports for getArr().indexOf("value") — CallExpression receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: makeIdentifier('getArr'), arguments: [] }, 'indexOf', [makeStringLiteral('value')]))
      expect(reports.length).toBe(1)
    })

    test('reports for "str".indexOf("substr") — Literal string receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'str' }, 'indexOf', [makeStringLiteral('substr')]))
      expect(reports.length).toBe(1)
    })

    test('reports for string with spaces indexOf("hello world")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [makeStringLiteral('hello world')]))
      expect(reports.length).toBe(1)
    })

    test('reports for string with special characters indexOf("a-b_c")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [makeStringLiteral('a-b_c')]))
      expect(reports.length).toBe(1)
    })

    test('reports for string with numbers indexOf("abc123")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [makeStringLiteral('abc123')]))
      expect(reports.length).toBe(1)
    })

    test('reports for long string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [makeStringLiteral('a'.repeat(100))]))
      expect(reports.length).toBe(1)
    })

    test('reports for string with unicode indexOf("\\u0041")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [makeStringLiteral('\u0041')]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions indexOf', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [makeStringLiteral('x')]))
      expect(reports[0].message).toMatch(/indexOf/)
    })

    test('report message mentions includes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [makeStringLiteral('x')]))
      expect(reports[0].message).toMatch(/includes/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [makeStringLiteral('x')]))
      expect(reports[0].message).toBe(
        `arr.indexOf('literal') with a string literal on an array is unreliable. Consider arr.includes('literal') instead.`,
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [makeStringLiteral('x')]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [makeStringLiteral('x')]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      const node = makeCallNode(makeIdentifier('arr'), 'indexOf', [makeStringLiteral('x')])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [makeStringLiteral('x')], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [makeStringLiteral('a')]))
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [makeStringLiteral('b')]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [makeStringLiteral('a')]))
      visitor.CallExpression(makeCallNode(makeIdentifier('list'), 'indexOf', [makeStringLiteral('b')]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for ObjectExpression receiver obj.indexOf("key")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'indexOf', [makeStringLiteral('key')]))
      expect(reports.length).toBe(1)
    })

    test('reports for ThisExpression receiver this.indexOf("item")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ThisExpression' }, 'indexOf', [makeStringLiteral('item')]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [makeStringLiteral('x')]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for string literal with newline escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [makeStringLiteral('line1\nline2')]))
      expect(reports.length).toBe(1)
    })

    test('reports for string literal with tab escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [makeStringLiteral('col1\tcol2')]))
      expect(reports.length).toBe(1)
    })

    test('reports for string literal with dot indexOf("a.b")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [makeStringLiteral('a.b')]))
      expect(reports.length).toBe(1)
    })

    test('reports for string literal with slash indexOf("path/to/file")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [makeStringLiteral('path/to/file')]))
      expect(reports.length).toBe(1)
    })

    test('reports for FunctionExpression receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, 'indexOf', [makeStringLiteral('fn')]))
      expect(reports.length).toBe(1)
    })

    test('reports for ArrowFunctionExpression receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }, 'indexOf', [makeStringLiteral('arrow')]))
      expect(reports.length).toBe(1)
    })

    test('reports for single whitespace string literal indexOf(" ")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [makeStringLiteral(' ')]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (35) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for indexOf with empty string ""', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [makeStringLiteral('')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for indexOf with variable arg arr.indexOf(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [makeIdentifier('x')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for indexOf with numeric literal arg arr.indexOf(5)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [{ type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for indexOf with boolean literal arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [{ type: 'BooleanLiteral', value: true }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for indexOf with null arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [{ type: 'NullLiteral', value: null }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for indexOf with RegExp arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [{ type: 'RegExpLiteral', value: /test/ }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for indexOf with ObjectExpression arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for indexOf with 2 args arr.indexOf("a", 1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [makeStringLiteral('a'), { type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for indexOf with 3 args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [makeStringLiteral('a'), { type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for indexOf with 0 args arr.indexOf()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for includes method arr.includes("hello")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'includes', [makeStringLiteral('hello')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for find method arr.find("hello")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'find', [makeStringLiteral('hello')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for lastIndexOf method arr.lastIndexOf("hello")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'lastIndexOf', [makeStringLiteral('hello')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for map method arr.map("hello")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'map', [makeStringLiteral('hello')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for filter method arr.filter("hello")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'filter', [makeStringLiteral('hello')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeStringLiteral('x')], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeStringLiteral('x')], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: makeIdentifier('fn'), arguments: [makeStringLiteral('x')], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('arr'),
          property: { type: 'Literal', value: 'indexOf' },
          computed: true,
        },
        arguments: [makeStringLiteral('x')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "lastIndexOf"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'lastIndexOf', [makeStringLiteral('x')]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "indexof" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexof', [makeStringLiteral('x')]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('arr'),
        },
        arguments: [makeStringLiteral('x')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('arr'),
          property: null,
        },
        arguments: [makeStringLiteral('x')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is computed member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('arr'),
          property: { type: 'Literal', value: 'indexOf' },
          computed: true,
        },
        arguments: [makeStringLiteral('x')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayIndexOfLiteralRule.create(ctx1)
      const visitor2 = noUnnecessaryArrayIndexOfLiteralRule.create(ctx2)
      visitor1.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [makeStringLiteral('a')]))
      visitor2.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [makeStringLiteral('')]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [makeStringLiteral('a')]))
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [makeStringLiteral('')]))
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [makeStringLiteral('b')]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('arr'),
          property: { type: 'Identifier', name: 'indexOf' },
          computed: false,
        },
        arguments: [makeStringLiteral('x')],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('arr'),
          property: { type: 'Identifier', name: 'indexOf' },
          computed: false,
        },
        arguments: [makeStringLiteral('x')],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [makeStringLiteral('a')]))
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [makeStringLiteral('')]))
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [makeIdentifier('x')]))
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [makeStringLiteral('b')]))
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [{ type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      const visitor2 = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayIndexOfLiteralRule.meta
      const meta2 = noUnnecessaryArrayIndexOfLiteralRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('arr'),
          property: { type: 'Identifier', name: 'indexOf' },
          computed: false,
        },
        arguments: [makeStringLiteral('x')],
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
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('arr'),
          property: { type: 'Identifier', name: 'indexOf' },
          computed: false,
        },
        arguments: [makeStringLiteral('x')],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('arr'),
          property: { type: 'Identifier', name: 'indexOf' },
          computed: false,
        },
        arguments: [makeStringLiteral('x')],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      const node = makeCallNode(makeIdentifier('arr'), 'indexOf', [makeStringLiteral('x')])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('arr'),
          property: { type: 'Identifier', name: 'indexOf' },
          computed: false,
        },
        arguments: [makeStringLiteral('x')],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [makeStringLiteral('x')], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('computed: false does report (regular dot access)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('arr'),
          property: { type: 'Identifier', name: 'indexOf' },
          computed: false,
        },
        arguments: [makeStringLiteral('x')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('computed: true does not report (bracket access)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('arr'),
          property: { type: 'Identifier', name: 'indexOf' },
          computed: true,
        },
        arguments: [makeStringLiteral('x')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [makeStringLiteral('a')]))
      visitor.CallExpression(makeCallNode(makeIdentifier('list'), 'indexOf', [makeStringLiteral('b')]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report for CallExpression arg (function call)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [{ type: 'CallExpression', callee: makeIdentifier('getValue'), arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [{ type: 'MemberExpression', object: makeIdentifier('obj'), property: makeIdentifier('key') }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for TemplateLiteral arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexOfLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdentifier('arr'), 'indexOf', [{ type: 'TemplateLiteral', quasis: [], expressions: [] }]))
      expect(reports.length).toBe(0)
    })
  })
})
