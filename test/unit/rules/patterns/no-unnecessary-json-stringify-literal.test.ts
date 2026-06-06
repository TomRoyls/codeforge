import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryJsonStringifyLiteralRule } from '../../../../src/rules/patterns/no-unnecessary-json-stringify-literal.js'
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

function makeJsonStringifyCall(
  firstArg: unknown,
  extraArgs: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 30,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'JSON' },
      property: { type: 'Identifier', name: 'stringify' },
    },
    arguments: [firstArg, ...extraArgs],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-json-stringify-literal rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryJsonStringifyLiteralRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryJsonStringifyLiteralRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryJsonStringifyLiteralRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryJsonStringifyLiteralRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryJsonStringifyLiteralRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning JSON.stringify', () => {
      const desc = noUnnecessaryJsonStringifyLiteralRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/json/)
      expect(desc).toMatch(/stringify/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryJsonStringifyLiteralRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-json-stringify-literal.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryJsonStringifyLiteralRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryJsonStringifyLiteralRule).toBeDefined()
      expect(noUnnecessaryJsonStringifyLiteralRule.meta).toBeDefined()
      expect(noUnnecessaryJsonStringifyLiteralRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (31) =====

  describe('positive cases — reports unnecessary JSON.stringify on string literals', () => {
    test('reports for JSON.stringify("hello") — double-quoted string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: 'hello' }))
      expect(reports.length).toBe(1)
    })

    test('reports for JSON.stringify("world") — different string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: 'world' }))
      expect(reports.length).toBe(1)
    })

    test('reports for JSON.stringify("x") — single character string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: 'x' }))
      expect(reports.length).toBe(1)
    })

    test('reports for JSON.stringify("") — empty string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: '' }))
      expect(reports.length).toBe(1)
    })

    test('reports for Literal type with string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: 'test' }))
      expect(reports.length).toBe(1)
    })

    test('reports for Literal with single-quoted string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: 'single-quoted' }))
      expect(reports.length).toBe(1)
    })

    test('reports for Literal with long string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: 'a very long string that should still be detected' }))
      expect(reports.length).toBe(1)
    })

    test('reports for StringLiteral with unicode string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: 'héllo wörld' }))
      expect(reports.length).toBe(1)
    })

    test('reports for StringLiteral with emoji string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: '🎉party🎉' }))
      expect(reports.length).toBe(1)
    })

    test('reports for StringLiteral with whitespace string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: '   ' }))
      expect(reports.length).toBe(1)
    })

    test('reports for Literal with newline string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: 'line1\nline2' }))
      expect(reports.length).toBe(1)
    })

    test('reports for JSON.stringify("str") with extra arguments (replacer)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall(
        { type: 'Literal', value: 'data' },
        [{ type: 'Identifier', name: 'replacer' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for JSON.stringify("str", null, 2) with all arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall(
        { type: 'Literal', value: 'formatted' },
        [{ type: 'Literal', value: null }, { type: 'Literal', value: 2 }],
      ))
      expect(reports.length).toBe(1)
    })

    test('report message mentions unnecessary JSON.stringify', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: 'test' }))
      expect(reports[0].message).toMatch(/JSON\.stringify/)
    })

    test('report message mentions string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: 'test' }))
      expect(reports[0].message).toMatch(/string literal/i)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: 'test' }))
      expect(reports[0].message).toBe(
        'Unnecessary JSON.stringify on a string literal. Stringify a string always wraps it in quotes. Use the string directly.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: 'test' }))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: 'test' }))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      const node = makeJsonStringifyCall({ type: 'Literal', value: 'test' })
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: 'test' }, [], 5, 10, 5, 40))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: 'a' }))
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: 'b' }))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: 'a' }))
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: 'b' }))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for StringLiteral with tab character string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: '\t' }))
      expect(reports.length).toBe(1)
    })

    test('reports for StringLiteral with path string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: '/api/v1/users' }))
      expect(reports.length).toBe(1)
    })

    test('reports for Literal with JSON-like string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: '{"key": "value"}' }))
      expect(reports.length).toBe(1)
    })

    test('reports for StringLiteral with special chars string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: '<script>alert("xss")</script>' }))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: 'test' }))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for StringLiteral with numeric-looking string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: '42' }))
      expect(reports.length).toBe(1)
    })

    test('reports for Literal with "true" string (not boolean)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: 'true' }))
      expect(reports.length).toBe(1)
    })

    test('reports for Literal with "null" string (not null)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: 'null' }))
      expect(reports.length).toBe(1)
    })

    test('reports for StringLiteral with "undefined" string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: 'undefined' }))
      expect(reports.length).toBe(1)
    })

    test('reports for StringLiteral with multiline template content', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: 'line1\r\nline2\r\nline3' }))
      expect(reports.length).toBe(1)
    })

    test('reports for Literal with escaped characters string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: 'hello\\"world\\"' }))
      expect(reports.length).toBe(1)
    })


  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for JSON.stringify(42) — number literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: 42 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for JSON.stringify(0) — zero', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: 0 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for JSON.stringify(3.14) — float', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: 3.14 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for JSON.stringify(true) — boolean literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: true }))
      expect(reports.length).toBe(0)
    })

    test('does not report for JSON.stringify(false) — boolean literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: false }))
      expect(reports.length).toBe(0)
    })

    test('does not report for JSON.stringify(null) — null literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: null }))
      expect(reports.length).toBe(0)
    })

    test('does not report for JSON.stringify(obj) — identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Identifier', name: 'obj' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for JSON.stringify({key: "value"}) — object literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'ObjectExpression', properties: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for JSON.stringify([1, 2]) — array literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'ArrayExpression', elements: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for JSON.parse("str") — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'JSON' },
          property: { type: 'Identifier', name: 'parse' },
        },
        arguments: [{ type: 'Literal', value: 'str' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for someObj.stringify("x") — not JSON object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'someObj' },
          property: { type: 'Identifier', name: 'stringify' },
        },
        arguments: [{ type: 'Literal', value: 'x' }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for JSON.stringify(fn()) — call expression arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for JSON.stringify(a + b) — binary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for JSON.stringify("str") where object is Math', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'stringify' },
        },
        arguments: [{ type: 'Literal', value: 'str' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [{ type: 'Literal', value: 'x' }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [{ type: 'Literal', value: 'x' }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'stringify' }, arguments: [{ type: 'Literal', value: 'x' }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getJSON' }, arguments: [] },
          property: { type: 'Identifier', name: 'stringify' },
        },
        arguments: [{ type: 'Literal', value: 'x' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object name is not "JSON"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'json2' },
          property: { type: 'Identifier', name: 'stringify' },
        },
        arguments: [{ type: 'Literal', value: 'x' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'JSON' },
          property: { type: 'Literal', value: 'stringify' },
        },
        arguments: [{ type: 'Literal', value: 'x' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is not "stringify"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'JSON' },
          property: { type: 'Identifier', name: 'parse' },
        },
        arguments: [{ type: 'Literal', value: 'x' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when no arguments provided', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'JSON' },
          property: { type: 'Identifier', name: 'stringify' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'JSON' },
          property: { type: 'Identifier', name: 'stringify' },
        },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'JSON' },
          property: { type: 'Identifier', name: 'stringify' },
        },
        arguments: [null],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is a number Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: -1 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for JSON.stringify(NaN)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Identifier', name: 'NaN' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'stringify' },
        },
        arguments: [{ type: 'Literal', value: 'x' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'stringify' },
        },
        arguments: [{ type: 'Literal', value: 'x' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'JSON' },
        },
        arguments: [{ type: 'Literal', value: 'x' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'JSON' },
          property: null,
        },
        arguments: [{ type: 'Literal', value: 'x' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (10) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryJsonStringifyLiteralRule.create(ctx1)
      const visitor2 = noUnnecessaryJsonStringifyLiteralRule.create(ctx2)
      visitor1.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: 'a' }))
      visitor2.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: 42 }))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: 'a' }))
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: 42 }))
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: 'b' }))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'JSON' },
          property: { type: 'Identifier', name: 'stringify' },
        },
        arguments: [{ type: 'Literal', value: 'test' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'JSON' },
          property: { type: 'Identifier', name: 'stringify' },
        },
        arguments: [{ type: 'Literal', value: 'test' }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: 42 }))
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: 'str' }))
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Identifier', name: 'obj' }))
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: 'another' }))
      visitor.CallExpression(makeJsonStringifyCall({ type: 'ObjectExpression', properties: [] }))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryJsonStringifyLiteralRule.create(context)
      const visitor2 = noUnnecessaryJsonStringifyLiteralRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryJsonStringifyLiteralRule.meta
      const meta2 = noUnnecessaryJsonStringifyLiteralRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'JSON' },
          property: { type: 'Identifier', name: 'stringify' },
        },
        arguments: [{ type: 'Literal', value: 'test' }],
        loc: makeLoc(1, 0, 1, 30),
        range: [0, 30],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      const node = makeJsonStringifyCall({ type: 'Literal', value: 'dup' })
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonStringifyLiteralRule.create(context)
      visitor.CallExpression(makeJsonStringifyCall({ type: 'Literal', value: 'test' }, [], 10, 4, 10, 35))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(35)
    })
  })
})
