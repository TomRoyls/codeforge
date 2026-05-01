import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryToLocaleStringRule } from '../../../../src/rules/patterns/no-unnecessary-to-locale-string.js'
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

function makeStringLiteral(value: string): unknown {
  return { type: 'Literal', value }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-to-locale-string rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryToLocaleStringRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryToLocaleStringRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryToLocaleStringRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryToLocaleStringRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryToLocaleStringRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning toLocaleString', () => {
      const desc = noUnnecessaryToLocaleStringRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/tolocalestring/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryToLocaleStringRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-to-locale-string',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryToLocaleStringRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryToLocaleStringRule).toBeDefined()
      expect(noUnnecessaryToLocaleStringRule.meta).toBeDefined()
      expect(noUnnecessaryToLocaleStringRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (30) =====

  describe('positive cases — reports unnecessary toLocaleString', () => {
    test('reports for "hello".toLocaleString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'toLocaleString'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty string literal .toLocaleString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'toLocaleString'))
      expect(reports.length).toBe(1)
    })

    test('reports for single character string .toLocaleString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('a'), 'toLocaleString'))
      expect(reports.length).toBe(1)
    })

    test('reports for long string .toLocaleString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('the quick brown fox jumps over the lazy dog'), 'toLocaleString'))
      expect(reports.length).toBe(1)
    })

    test('reports for string with special characters .toLocaleString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello\nworld\t!'), 'toLocaleString'))
      expect(reports.length).toBe(1)
    })

    test('reports for string with unicode .toLocaleString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('こんにちは'), 'toLocaleString'))
      expect(reports.length).toBe(1)
    })

    test('reports for string with emoji .toLocaleString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('🎉🚀'), 'toLocaleString'))
      expect(reports.length).toBe(1)
    })

    test('reports for string with spaces .toLocaleString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('  spaces  '), 'toLocaleString'))
      expect(reports.length).toBe(1)
    })

    test('reports for URL string .toLocaleString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('https://example.com'), 'toLocaleString'))
      expect(reports.length).toBe(1)
    })

    test('reports for template-like string .toLocaleString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('${variable}'), 'toLocaleString'))
      expect(reports.length).toBe(1)
    })

    test('reports with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('test'), 'toLocaleString'))
      expect(reports.length).toBe(1)
    })

    test('reports with locale argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('test'), 'toLocaleString', [{ type: 'Literal', value: 'en-US' }]))
      expect(reports.length).toBe(1)
    })

    test('reports with options argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('test'), 'toLocaleString', [
        { type: 'Literal', value: 'en-US' },
        { type: 'ObjectExpression', properties: [] },
      ]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions unnecessary toLocaleString', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'toLocaleString'))
      expect(reports[0].message).toMatch(/toLocaleString/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'toLocaleString'))
      expect(reports[0].message).toBe(
        'Unnecessary .toLocaleString() call on a string literal.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'toLocaleString'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'toLocaleString'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      const node = makeCallNode(makeStringLiteral('hello'), 'toLocaleString')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('test'), 'toLocaleString', [], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('a'), 'toLocaleString'))
      visitor.CallExpression(makeCallNode(makeStringLiteral('b'), 'toLocaleString'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('a'), 'toLocaleString'))
      visitor.CallExpression(makeCallNode(makeStringLiteral('b'), 'toLocaleString'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for multi-line string .toLocaleString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('line1\nline2\nline3'), 'toLocaleString'))
      expect(reports.length).toBe(1)
    })

    test('reports for JSON string .toLocaleString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('{"key":"value"}'), 'toLocaleString'))
      expect(reports.length).toBe(1)
    })

    test('reports for path string .toLocaleString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('/usr/local/bin/node'), 'toLocaleString'))
      expect(reports.length).toBe(1)
    })

    test('reports for string with backslashes .toLocaleString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('C:\\Users\\test'), 'toLocaleString'))
      expect(reports.length).toBe(1)
    })

    test('reports for numeric string .toLocaleString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('12345'), 'toLocaleString'))
      expect(reports.length).toBe(1)
    })

    test('reports for whitespace-only string .toLocaleString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('   \t\n  '), 'toLocaleString'))
      expect(reports.length).toBe(1)
    })

    test('reports for HTML string .toLocaleString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('<div class="test">hello</div>'), 'toLocaleString'))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('x'), 'toLocaleString'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for number literal .toLocaleString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 42 }, 'toLocaleString'))
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean literal .toLocaleString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: true }, 'toLocaleString'))
      expect(reports.length).toBe(0)
    })

    test('does not report for null literal .toLocaleString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: null }, 'toLocaleString'))
      expect(reports.length).toBe(0)
    })

    test('does not report for regex literal .toLocaleString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: /test/ }, 'toLocaleString'))
      expect(reports.length).toBe(0)
    })

    test('does not report for identifier.toLocaleString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLocaleString'))
      expect(reports.length).toBe(0)
    })

    test('does not report for variable.toLocaleString() — MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }, 'toLocaleString'))
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression object .toLocaleString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }, 'toLocaleString'))
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrayExpression.toLocaleString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'toLocaleString'))
      expect(reports.length).toBe(0)
    })

    test('does not report for ObjectExpression.toLocaleString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'toLocaleString'))
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression.toLocaleString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, 'toLocaleString'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "hello".toString() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'toString'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "hello".valueOf() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'valueOf'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "hello".trim() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'trim'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "hello".toUpperCase() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'toUpperCase'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "hello".toLowerCase() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'toLowerCase'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "hello".indexOf("x") — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'indexOf'))
      expect(reports.length).toBe(0)
    })

    test('does not report for property name "tolocalestring" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'tolocalestring'))
      expect(reports.length).toBe(0)
    })

    test('does not report for property name "ToLocaleString" (different case)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'ToLocaleString'))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral('test'),
          property: { type: 'Literal', value: 'toLocaleString' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral('test'),
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral('test'),
          property: null,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'toLocaleString' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'toLocaleString' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined literal value .toLocaleString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: undefined }, 'toLocaleString'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal with numeric value .toLocaleString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 3.14 }, 'toLocaleString'))
      expect(reports.length).toBe(0)
    })

    test('does not report for TemplateExpression object .toLocaleString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TemplateLiteral', quasis: [], expressions: [] }, 'toLocaleString'))
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrowFunctionExpression object .toLocaleString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }, 'toLocaleString'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryToLocaleStringRule.create(ctx1)
      const visitor2 = noUnnecessaryToLocaleStringRule.create(ctx2)
      visitor1.CallExpression(makeCallNode(makeStringLiteral('a'), 'toLocaleString'))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLocaleString'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('a'), 'toLocaleString'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLocaleString'))
      visitor.CallExpression(makeCallNode(makeStringLiteral('b'), 'toLocaleString'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral('hello'),
          property: { type: 'Identifier', name: 'toLocaleString' },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral('hello'),
          property: { type: 'Identifier', name: 'toLocaleString' },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('a'), 'toLocaleString'))
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 42 }, 'toLocaleString'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLocaleString'))
      visitor.CallExpression(makeCallNode(makeStringLiteral('b'), 'toLocaleString'))
      visitor.CallExpression(makeCallNode(makeStringLiteral('c'), 'toUpperCase'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryToLocaleStringRule.create(context)
      const visitor2 = noUnnecessaryToLocaleStringRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryToLocaleStringRule.meta
      const meta2 = noUnnecessaryToLocaleStringRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral('test'),
          property: { type: 'Identifier', name: 'toLocaleString' },
        },
        arguments: [],
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
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral('test'),
          property: { type: 'Identifier', name: 'toLocaleString' },
        },
        arguments: [],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral('test'),
          property: { type: 'Identifier', name: 'toLocaleString' },
        },
        arguments: [],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      const node = makeCallNode(makeStringLiteral('x'), 'toLocaleString')
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryToLocaleStringRule).toBeDefined()
      expect(typeof noUnnecessaryToLocaleStringRule.create).toBe('function')
      expect(typeof noUnnecessaryToLocaleStringRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral('test'),
          property: { type: 'Identifier', name: 'toLocaleString' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('test'), 'toLocaleString', [], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToLocaleStringRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('a'), 'toLocaleString'))
      visitor.CallExpression(makeCallNode(makeStringLiteral('b'), 'toLocaleString'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
