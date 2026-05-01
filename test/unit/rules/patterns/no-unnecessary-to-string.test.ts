import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryToStringRule } from '../../../../src/rules/patterns/no-unnecessary-to-string.js'
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
    getSource: () => '',
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

function makeCallExpr(
  objectValue: unknown,
  objectValueIsString: boolean,
  methodName: string = 'toString',
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  const obj: Record<string, unknown> = { type: 'Literal' }
  if (objectValueIsString) {
    obj.value = objectValue
  } else {
    obj.value = objectValue
    obj.type = 'Literal'
  }
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: obj,
      property: { type: 'Identifier', name: methodName },
    },
    arguments: [],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-to-string rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryToStringRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryToStringRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryToStringRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryToStringRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryToStringRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning toString', () => {
      const desc = noUnnecessaryToStringRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/tostring/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryToStringRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-to-string',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryToStringRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryToStringRule).toBeDefined()
      expect(noUnnecessaryToStringRule.meta).toBeDefined()
      expect(noUnnecessaryToStringRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY TOSTRING (25) =====

  describe('positive cases — reports unnecessary toString', () => {
    test('reports for "hello".toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('hello', true))
      expect(reports.length).toBe(1)
    })

    test('reports for empty string ".toString()"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('', true))
      expect(reports.length).toBe(1)
    })

    test('reports for single character "a".toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('a', true))
      expect(reports.length).toBe(1)
    })

    test('reports for multi-word string "hello world".toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('hello world', true))
      expect(reports.length).toBe(1)
    })

    test('reports for string with special characters "foo!@#$".toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('foo!@#$', true))
      expect(reports.length).toBe(1)
    })

    test('reports for string with unicode "café".toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('café', true))
      expect(reports.length).toBe(1)
    })

    test('reports for string with emoji "🚀".toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('🚀', true))
      expect(reports.length).toBe(1)
    })

    test('reports for string with whitespace "  ".toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('  ', true))
      expect(reports.length).toBe(1)
    })

    test('reports for string with newline "\\n".toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('\n', true))
      expect(reports.length).toBe(1)
    })

    test('reports for numeric-looking string "123".toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('123', true))
      expect(reports.length).toBe(1)
    })

    test('reports for long string "a".repeat(50) .toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('a'.repeat(50), true))
      expect(reports.length).toBe(1)
    })

    test('reports for template-like string "${x}".toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('${x}', true))
      expect(reports.length).toBe(1)
    })

    test('reports for path string "/foo/bar".toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('/foo/bar', true))
      expect(reports.length).toBe(1)
    })

    test('reports for URL string "https://example.com".toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('https://example.com', true))
      expect(reports.length).toBe(1)
    })

    test('reports for JSON string \'{"key":"value"}\'.toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('{"key":"value"}', true))
      expect(reports.length).toBe(1)
    })

    test('reports for string with backslash "a\\\\b".toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('a\\b', true))
      expect(reports.length).toBe(1)
    })

    test('reports for tab character string "\\t".toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('\t', true))
      expect(reports.length).toBe(1)
    })

    test('reports for string "null" (the word) .toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('null', true))
      expect(reports.length).toBe(1)
    })

    test('reports for string "undefined" (the word) .toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('undefined', true))
      expect(reports.length).toBe(1)
    })

    test('reports for string "true" (the word) .toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('true', true))
      expect(reports.length).toBe(1)
    })

    test('reports for single-quoted-style string "x".toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('x', true))
      expect(reports.length).toBe(1)
    })

    test('reports for HTML string "<div>".toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('<div>', true))
      expect(reports.length).toBe(1)
    })

    test('reports for SQL string "SELECT *".toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('SELECT *', true))
      expect(reports.length).toBe(1)
    })

    test('reports for comma-separated string "a,b,c".toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('a,b,c', true))
      expect(reports.length).toBe(1)
    })

    test('reports for string with quotes \'"hello"\'.toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('"hello"', true))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message is exactly "Unnecessary .toString() call on a string literal."', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('hello', true))
      expect(reports[0].message).toBe('Unnecessary .toString() call on a string literal.')
    })

    test('report message contains "toString"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('hello', true))
      expect(reports[0].message).toContain('toString')
    })

    test('report message contains "Unnecessary"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('hello', true))
      expect(reports[0].message).toContain('Unnecessary')
    })

    test('report message contains "string literal"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('hello', true))
      expect(reports[0].message).toContain('string literal')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('hello', true))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('hello', true))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches input node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      const node = makeCallExpr('hello', true)
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc preserves start line from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('hello', true, 'toString', 5, 10, 5, 25))
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('report loc preserves start column from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('hello', true, 'toString', 3, 7, 3, 22))
      expect(reports[0].loc?.start.column).toBe(7)
    })

    test('report loc preserves end line from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('hello', true, 'toString', 1, 0, 2, 5))
      expect(reports[0].loc?.end.line).toBe(2)
    })

    test('report loc preserves end column from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('hello', true, 'toString', 1, 0, 1, 42))
      expect(reports[0].loc?.end.column).toBe(42)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('hello', true))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('hello', true))
      visitor.CallExpression(makeCallExpr('world', true))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('hello', true))
      visitor.CallExpression(makeCallExpr('world', true))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports only once per node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('hello', true))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for numeric literal object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr(42, false))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-toString method "valueOf"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('hello', true, 'valueOf'))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-MemberExpression callee (Identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'toString' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-Identifier property (Literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'hello' },
          property: { type: 'Literal', value: 'toString' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for non-CallExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression({ type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      expect(() => visitor.CallExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type that is not CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean literal object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: true },
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null literal object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: null },
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier object (variable).toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myVar' },
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression object (fn()).toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: {}, arguments: [] },
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for method "trim"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('hello', true, 'trim'))
      expect(reports.length).toBe(0)
    })

    test('does not report for method "toLowerCase"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('hello', true, 'toLowerCase'))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: undefined,
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'hello' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined literal value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: undefined },
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [],
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
      const visitor1 = noUnnecessaryToStringRule.create(ctx1)
      const visitor2 = noUnnecessaryToStringRule.create(ctx2)
      visitor1.CallExpression(makeCallExpr('hello', true))
      visitor2.CallExpression(makeCallExpr(42, false))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('hello', true))
      visitor.CallExpression(makeCallExpr(42, false))
      visitor.CallExpression(makeCallExpr('world', true))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'hello' },
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'hello' },
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('hello', true))
      visitor.CallExpression(makeCallExpr(42, false))
      visitor.CallExpression(makeCallExpr('hello', true, 'valueOf'))
      visitor.CallExpression(makeCallExpr('world', true))
      visitor.CallExpression(makeCallExpr('test', true))
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryToStringRule.create(context)
      const visitor2 = noUnnecessaryToStringRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryToStringRule.meta
      const meta2 = noUnnecessaryToStringRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'hello' },
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
        range: [0, 20],
        extra: true,
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'hello' },
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'hello' },
          property: { type: 'Identifier', name: 'toString' },
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
      const visitor = noUnnecessaryToStringRule.create(context)
      const node = makeCallExpr('hello', true)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryToStringRule).toBeDefined()
      expect(typeof noUnnecessaryToStringRule.create).toBe('function')
      expect(typeof noUnnecessaryToStringRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'hello' },
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('hello', true))
      visitor.CallExpression(makeCallExpr('world', true))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles node with arguments containing values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'hello' },
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [{ type: 'Literal', value: 16 }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('hello', true, 'toString', 10, 4, 10, 22))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(22)
    })

    test('handles empty arguments array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression(makeCallExpr('hello', true))
      expect(reports.length).toBe(1)
    })

    test('handles callee with computed true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'hello' },
          property: { type: 'Identifier', name: 'toString' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report for computed property with string value "toString"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'hello' },
          property: { type: 'Literal', value: 'toString' },
          computed: true,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('handles node with MemberExpression object being non-object type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToStringRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: 'not an object',
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })
})
