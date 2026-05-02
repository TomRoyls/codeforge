import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringToUpperCaseSameRule } from '../../../../src/rules/patterns/no-unnecessary-string-to-upper-case-same.js'
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
  return { type: 'StringLiteral', value }
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

// ===== META TESTS (8) =====

describe('no-unnecessary-string-to-upper-case-same rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringToUpperCaseSameRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringToUpperCaseSameRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringToUpperCaseSameRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringToUpperCaseSameRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringToUpperCaseSameRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning toUpperCase', () => {
      const desc = noUnnecessaryStringToUpperCaseSameRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/touppercase/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringToUpperCaseSameRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-to-upper-case-same.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringToUpperCaseSameRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringToUpperCaseSameRule).toBeDefined()
      expect(noUnnecessaryStringToUpperCaseSameRule.meta).toBeDefined()
      expect(noUnnecessaryStringToUpperCaseSameRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (29) =====

  describe('positive cases — reports unnecessary toUpperCase', () => {
    test('reports for empty string "".toUpperCase()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(''), 'toUpperCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for single uppercase letter "A".toUpperCase()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('A'), 'toUpperCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for uppercase word "HELLO".toUpperCase()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('HELLO'), 'toUpperCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for uppercase with digits "ABC123".toUpperCase()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('ABC123'), 'toUpperCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for digits only "12345".toUpperCase()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('12345'), 'toUpperCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for special characters "!@#$%".toUpperCase()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('!@#$%'), 'toUpperCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for whitespace only "   ".toUpperCase()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('   '), 'toUpperCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for single space " ".toUpperCase()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral(' '), 'toUpperCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for newlines "\\n\\n".toUpperCase()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('\n\n'), 'toUpperCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for tabs "\\t\\t".toUpperCase()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('\t\t'), 'toUpperCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for mixed uppercase and symbols "A_B_C".toUpperCase()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('A_B_C'), 'toUpperCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for URL-like string "HTTP://EXAMPLE.COM".toUpperCase()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('HTTP://EXAMPLE.COM'), 'toUpperCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for "ABCDEFGHIJKLMNOPQRSTUVWXYZ".toUpperCase()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 'toUpperCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for "FOO BAR BAZ".toUpperCase()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('FOO BAR BAZ'), 'toUpperCase'))
      expect(reports.length).toBe(1)
    })

    test('report message mentions unnecessary toUpperCase', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('HELLO'), 'toUpperCase'))
      expect(reports[0].message).toMatch(/toUpperCase/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('HELLO'), 'toUpperCase'))
      expect(reports[0].message).toBe(
        "'HELLO'.toUpperCase() is unnecessary — the string is already uppercase.",
      )
    })

    test('report message includes the actual string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('WORLD'), 'toUpperCase'))
      expect(reports[0].message).toContain('WORLD')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('A'), 'toUpperCase'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('A'), 'toUpperCase'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      const node = makeCallNode(makeStringLiteral('X'), 'toUpperCase')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('AB'), 'toUpperCase', [], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('A'), 'toUpperCase'))
      visitor.CallExpression(makeCallNode(makeStringLiteral('B'), 'toUpperCase'))
      expect(reports.length).toBe(2)
    })

    test('reports for punctuation-only string "!!!".toUpperCase()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('!!!'), 'toUpperCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for single character punctuation ".".toUpperCase()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('.'), 'toUpperCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for UUID-like string "550E8400-E29B-41D4-A716-446655440000".toUpperCase()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('550E8400-E29B-41D4-A716-446655440000'), 'toUpperCase'))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('Z'), 'toUpperCase'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for "UPPER_CASE_CONST".toUpperCase()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('UPPER_CASE_CONST'), 'toUpperCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for emoji-only string "🎉".toUpperCase()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('🎉'), 'toUpperCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for mixed digits and special chars "123-456-7890".toUpperCase()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('123-456-7890'), 'toUpperCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for underscore-only string "___".toUpperCase()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('___'), 'toUpperCase'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (35) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for lowercase string "hello".toUpperCase()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'toUpperCase'))
      expect(reports.length).toBe(0)
    })

    test('does not report for mixed case "Hello".toUpperCase()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('Hello'), 'toUpperCase'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "Hello World".toUpperCase()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('Hello World'), 'toUpperCase'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "camelCase".toUpperCase()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('camelCase'), 'toUpperCase'))
      expect(reports.length).toBe(0)
    })

    test('does not report for variable.toUpperCase() — Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "HELLO".toLowerCase() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('HELLO'), 'toLowerCase'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "HELLO".trim() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('HELLO'), 'trim'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "HELLO".toUpperCase("en") — has arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('HELLO'), 'toUpperCase', [{ type: 'Literal', value: 'en' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for "HELLO".toUpperCase(locale) — has one argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('HELLO'), 'toUpperCase', [{ type: 'Identifier', name: 'locale' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral('HELLO'),
          property: { type: 'Literal', value: 'toUpperCase' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "toLowerCase"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('HELLO'), 'toLowerCase'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getStr' }, arguments: [] }, 'toUpperCase'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'str' } }, 'toUpperCase'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'toUpperCase' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'toUpperCase' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is Literal (not StringLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'HELLO' }, 'toUpperCase'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'toUpperCase'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, 'toUpperCase'))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral('HELLO'),
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral('HELLO'),
          property: null,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "touppercase" (all lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('HELLO'), 'touppercase'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "ß".toUpperCase() — ß uppercase is SS', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('ß'), 'toUpperCase'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "straße".toUpperCase() — contains lowercase', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('straße'), 'toUpperCase'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "HELLO".toLocaleUpperCase() — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('HELLO'), 'toLocaleUpperCase'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is an ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'toUpperCase'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (19) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringToUpperCaseSameRule.create(ctx1)
      const visitor2 = noUnnecessaryStringToUpperCaseSameRule.create(ctx2)
      visitor1.CallExpression(makeCallNode(makeStringLiteral('HELLO'), 'toUpperCase'))
      visitor2.CallExpression(makeCallNode(makeStringLiteral('hello'), 'toUpperCase'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('HELLO'), 'toUpperCase'))
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'toUpperCase'))
      visitor.CallExpression(makeCallNode(makeStringLiteral('WORLD'), 'toUpperCase'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral('HELLO'),
          property: { type: 'Identifier', name: 'toUpperCase' },
          computed: false,
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral('HELLO'),
          property: { type: 'Identifier', name: 'toUpperCase' },
          computed: false,
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('hello'), 'toUpperCase')) // valid
      visitor.CallExpression(makeCallNode(makeStringLiteral('HELLO'), 'toUpperCase')) // reports
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase')) // valid
      visitor.CallExpression(makeCallNode(makeStringLiteral('WORLD'), 'toUpperCase')) // reports
      visitor.CallExpression(makeCallNode(makeStringLiteral('Hello'), 'toUpperCase')) // valid
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringToUpperCaseSameRule.create(context)
      const visitor2 = noUnnecessaryStringToUpperCaseSameRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringToUpperCaseSameRule.meta
      const meta2 = noUnnecessaryStringToUpperCaseSameRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral('HELLO'),
          property: { type: 'Identifier', name: 'toUpperCase' },
          computed: false,
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
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral('HELLO'),
          property: { type: 'Identifier', name: 'toUpperCase' },
          computed: false,
        },
        arguments: [],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral('HELLO'),
          property: { type: 'Identifier', name: 'toUpperCase' },
          computed: false,
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
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      const node = makeCallNode(makeStringLiteral('HELLO'), 'toUpperCase')
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringToUpperCaseSameRule).toBeDefined()
      expect(typeof noUnnecessaryStringToUpperCaseSameRule.create).toBe('function')
      expect(typeof noUnnecessaryStringToUpperCaseSameRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral('HELLO'),
          property: { type: 'Identifier', name: 'toUpperCase' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('HELLO'), 'toUpperCase', [], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('does not report when callee is computed member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral('HELLO'),
          property: { type: 'Literal', value: 'toUpperCase' },
          computed: true,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports for computed:false member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeStringLiteral('HELLO'),
          property: { type: 'Identifier', name: 'toUpperCase' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression(makeCallNode(makeStringLiteral('HELLO'), 'toUpperCase'))
      visitor.CallExpression(makeCallNode(makeStringLiteral('WORLD'), 'toUpperCase'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('HELLO')
      expect(reports[1].message).toContain('WORLD')
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringToUpperCaseSameRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })
  })
})
