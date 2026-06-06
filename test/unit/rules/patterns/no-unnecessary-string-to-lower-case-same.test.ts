import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringToLowerCaseSameRule } from '../../../../src/rules/patterns/no-unnecessary-string-to-lower-case-same.js'
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

function makeStringLiteral(value: string): unknown {
  return { type: 'Literal', value }
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

// ===== META TESTS (8) =====

describe('no-unnecessary-string-to-lower-case-same rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringToLowerCaseSameRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringToLowerCaseSameRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringToLowerCaseSameRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringToLowerCaseSameRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringToLowerCaseSameRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning toLowerCase', () => {
      const desc = noUnnecessaryStringToLowerCaseSameRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/tolowercase/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringToLowerCaseSameRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-to-lower-case-same.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringToLowerCaseSameRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringToLowerCaseSameRule).toBeDefined()
      expect(noUnnecessaryStringToLowerCaseSameRule.meta).toBeDefined()
      expect(noUnnecessaryStringToLowerCaseSameRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (30) =====

  describe('positive cases — reports unnecessary toLowerCase', () => {
    test('reports for "hello".toLowerCase()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'toLowerCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for "world".toLowerCase()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('world'), 'toLowerCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for "abc".toLowerCase()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('abc'), 'toLowerCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for "test".toLowerCase()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('test'), 'toLowerCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for "".toLowerCase() — empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'toLowerCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for "abc123".toLowerCase()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('abc123'), 'toLowerCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for "hello world".toLowerCase()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello world'), 'toLowerCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for "a".toLowerCase() — single lowercase char', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('a'), 'toLowerCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for "z".toLowerCase() — single char end of alphabet', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('z'), 'toLowerCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for "foo_bar".toLowerCase()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('foo_bar'), 'toLowerCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for "kebab-case".toLowerCase()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('kebab-case'), 'toLowerCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for "12345".toLowerCase() — digits only', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('12345'), 'toLowerCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for "!@#$%".toLowerCase() — symbols only', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('!@#$%'), 'toLowerCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for "hello_world_123".toLowerCase()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello_world_123'), 'toLowerCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for "  ".toLowerCase() — spaces only', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('  '), 'toLowerCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for "café".toLowerCase() — accented lowercase', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('café'), 'toLowerCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for "naïve".toLowerCase() — accented lowercase', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('naïve'), 'toLowerCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for "αβγ".toLowerCase() — Greek lowercase', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('αβγ'), 'toLowerCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for "привет".toLowerCase() — Cyrillic lowercase', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('привет'), 'toLowerCase'))
      expect(reports.length).toBe(1)
    })

    test('report message mentions unnecessary', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'toLowerCase'))
      expect(reports[0].message).toMatch(/unnecessary/)
    })

    test('report message mentions toLowerCase', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'toLowerCase'))
      expect(reports[0].message).toMatch(/toLowerCase/)
    })

    test('report message contains the string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'toLowerCase'))
      expect(reports[0].message).toContain('hello')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'toLowerCase'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'toLowerCase'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      const node = makeCallNode(makeStringLiteral('hello'), 'toLowerCase')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'toLowerCase', [], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'toLowerCase'))
      visitor.CallExpression(makeCallNode(makeStringLiteral('world'), 'toLowerCase'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'toLowerCase'))
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'toLowerCase'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'toLowerCase'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'toLowerCase'))
      expect(reports[0].message).toBe(
        "'hello'.toLowerCase() is unnecessary — the string is already lowercase.",
      )
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (37) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for "Hello".toLowerCase() — has uppercase H', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('Hello'), 'toLowerCase'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "HELLO".toLowerCase() — all uppercase', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('HELLO'), 'toLowerCase'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "Hello World".toLowerCase() — mixed case', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('Hello World'), 'toLowerCase'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "ABC".toLowerCase() — all uppercase', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('ABC'), 'toLowerCase'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "Abc".toLowerCase() — starts with uppercase', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('Abc'), 'toLowerCase'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "aBc".toLowerCase() — mixed case', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('aBc'), 'toLowerCase'))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.toLowerCase() — Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "hello".toUpperCase() — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'toUpperCase'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "hello".indexOf("x") — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'indexOf'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "hello".charAt(0) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'charAt'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "hello".trim() — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'trim'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "hello".toLowerCase("en") — has argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'toLowerCase', [{ type: 'Literal', value: 'en' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for "hello".toLowerCase(arg) — has argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'toLowerCase', [{ type: 'Identifier', name: 'arg' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral('hello'),
          property: { type: 'Literal', value: 'toLowerCase' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "toUpperCase"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'toUpperCase'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getStr' }, arguments: [] }, 'toLowerCase'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'str' } }, 'toLowerCase'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'toLowerCase' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'toLowerCase' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports when object is Literal string that is already lowercase', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'toLowerCase'))
      expect(reports.length).toBe(1)
    })

    test('does not report when object type is ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'toLowerCase'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, 'toLowerCase'))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral('hello'),
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral('hello'),
          property: null,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "tolowercase" (all lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'tolowercase'))
      expect(reports.length).toBe(0)
    })

  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringToLowerCaseSameRule.create(ctx1)
      const visitor2 = noUnnecessaryStringToLowerCaseSameRule.create(ctx2)
      visitor1.CallExpression(makeCallNode(makeStringLiteral('hello'), 'toLowerCase'))
      visitor2.CallExpression(makeCallNode(makeStringLiteral('Hello'), 'toLowerCase'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'toLowerCase'))
      visitor.CallExpression(makeCallNode(makeStringLiteral('Hello'), 'toLowerCase'))
      visitor.CallExpression(makeCallNode(makeStringLiteral('world'), 'toLowerCase'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral('hello'),
          property: { type: 'Identifier', name: 'toLowerCase' },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral('hello'),
          property: { type: 'Identifier', name: 'toLowerCase' },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('Hello'), 'toLowerCase'))
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'toLowerCase'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase'))
      visitor.CallExpression(makeCallNode(makeStringLiteral('abc'), 'toLowerCase'))
      visitor.CallExpression(makeCallNode(makeStringLiteral('ABC'), 'toLowerCase'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringToLowerCaseSameRule.create(context)
      const visitor2 = noUnnecessaryStringToLowerCaseSameRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringToLowerCaseSameRule.meta
      const meta2 = noUnnecessaryStringToLowerCaseSameRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral('hello'),
          property: { type: 'Identifier', name: 'toLowerCase' },
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
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral('hello'),
          property: { type: 'Identifier', name: 'toLowerCase' },
        },
        arguments: [],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral('hello'),
          property: { type: 'Identifier', name: 'toLowerCase' },
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
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      const node = makeCallNode(makeStringLiteral('hello'), 'toLowerCase')
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringToLowerCaseSameRule).toBeDefined()
      expect(typeof noUnnecessaryStringToLowerCaseSameRule.create).toBe('function')
      expect(typeof noUnnecessaryStringToLowerCaseSameRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral('hello'),
          property: { type: 'Identifier', name: 'toLowerCase' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'toLowerCase', [], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed member expression — computed: false reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral('hello'),
          property: { type: 'Identifier', name: 'toLowerCase' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee computed is true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral('hello'),
          property: { type: 'Identifier', name: 'toLowerCase' },
          computed: true,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToLowerCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'toLowerCase'))
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'toLowerCase'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
