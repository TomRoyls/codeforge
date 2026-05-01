import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryAtobRule } from '../../../../src/rules/patterns/no-unnecessary-atob.js'
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

function makeAtobCall(
  argValue: string,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 5,
): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'atob' },
    arguments: [{ type: 'Literal', value: argValue }],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-atob rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryAtobRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryAtobRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryAtobRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryAtobRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryAtobRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning atob', () => {
      const desc = noUnnecessaryAtobRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toContain('atob')
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryAtobRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-atob',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryAtobRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryAtobRule).toBeDefined()
      expect(noUnnecessaryAtobRule.meta).toBeDefined()
      expect(noUnnecessaryAtobRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY ATOB (25) =====

  describe('positive cases — reports unnecessary atob', () => {
    test('reports for atob("hello")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('hello'))
      expect(reports.length).toBe(1)
    })

    test('reports for atob("world")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('world'))
      expect(reports.length).toBe(1)
    })

    test('reports for atob("test")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('test'))
      expect(reports.length).toBe(1)
    })

    test('reports for atob("foo")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('foo'))
      expect(reports.length).toBe(1)
    })

    test('reports for atob("bar")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('bar'))
      expect(reports.length).toBe(1)
    })

    test('reports for atob("abc")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('abc'))
      expect(reports.length).toBe(1)
    })

    test('reports for atob("xyz")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('xyz'))
      expect(reports.length).toBe(1)
    })

    test('reports for atob("plain text")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('plain text'))
      expect(reports.length).toBe(1)
    })

    test('reports for atob("data")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('data'))
      expect(reports.length).toBe(1)
    })

    test('reports for atob("value")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('value'))
      expect(reports.length).toBe(1)
    })

    test('reports for atob("simple")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('simple'))
      expect(reports.length).toBe(1)
    })

    test('reports for atob("message")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('message'))
      expect(reports.length).toBe(1)
    })

    test('reports for atob("code")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('code'))
      expect(reports.length).toBe(1)
    })

    test('reports for atob("example")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('example'))
      expect(reports.length).toBe(1)
    })

    test('reports for atob("result")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('result'))
      expect(reports.length).toBe(1)
    })

    test('reports for atob("name")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('name'))
      expect(reports.length).toBe(1)
    })

    test('reports for atob("key")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('key'))
      expect(reports.length).toBe(1)
    })

    test('reports for atob("password")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('password'))
      expect(reports.length).toBe(1)
    })

    test('reports for atob("input")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('input'))
      expect(reports.length).toBe(1)
    })

    test('reports for atob("content")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('content'))
      expect(reports.length).toBe(1)
    })

    test('reports for atob with custom loc values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('test', 5, 10, 5, 20))
      expect(reports.length).toBe(1)
    })

    test('reports for node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'atob' },
        arguments: [{ type: 'Literal', value: 'extra' }],
        loc: makeLoc(1, 0, 1, 5),
        range: [0, 5],
        extra: true,
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for single-char string atob("a")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('a'))
      expect(reports.length).toBe(1)
    })

    test('reports for two-char string atob("ab")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('ab'))
      expect(reports.length).toBe(1)
    })

    test('reports for alphanumeric string atob("abc123")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('abc123'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message mentions "Unnecessary"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('hello'))
      expect(reports[0].message).toContain('Unnecessary')
    })

    test('report message mentions "atob"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('hello'))
      expect(reports[0].message).toContain('atob')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('hello'))
      expect(reports[0].message).toBe(
        'Unnecessary atob() call on a plain string that does not appear to be base64-encoded.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('hello'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('hello'))
      expect(reports[0].node).toBeDefined()
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('hello', 5, 10, 5, 20))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report node matches the input node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      const node = makeAtobCall('hello')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('hello'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('hello'))
      visitor.CallExpression(makeAtobCall('world'))
      expect(reports.length).toBe(2)
    })

    test('consistent messages across violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('hello'))
      visitor.CallExpression(makeAtobCall('world'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('single report per atob call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('hello'))
      expect(reports.length).toBe(1)
    })

    test('multiple violations tracked correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('a'))
      visitor.CallExpression(makeAtobCall('b'))
      visitor.CallExpression(makeAtobCall('c'))
      expect(reports.length).toBe(3)
    })

    test('report loc has correct structure', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('hello'))
      expect(reports[0].loc).toHaveProperty('start')
      expect(reports[0].loc).toHaveProperty('end')
      expect(reports[0].loc?.start).toHaveProperty('line')
      expect(reports[0].loc?.start).toHaveProperty('column')
    })

    test('report message mentions "plain string"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('hello'))
      expect(reports[0].message.toLowerCase()).toContain('plain string')
    })

    test('report with specific loc end values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('test', 10, 4, 10, 15))
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(15)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for non-atob callee name "btoa"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'btoa' },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-Identifier callee type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: {}, property: {} },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'atob' },
        arguments: [
          { type: 'Literal', value: 'hello' },
          { type: 'Literal', value: 'world' },
        ],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for zero arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'atob' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'atob' },
        arguments: [{ type: 'Literal', value: true }],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for numeric argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'atob' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier argument (not Literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'atob' },
        arguments: [{ type: 'Identifier', name: 'myVar' }],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for non-atob "decode" callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'decode' },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-atob "parse" callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parse' },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'atob' },
        arguments: [
          { type: 'Literal', value: 'hello' },
          { type: 'Literal', value: 'world' },
          { type: 'Literal', value: 'test' },
        ],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'atob' },
        arguments: [null],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-Latin1 string (causes btoa to throw)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('hello\u0100'))
      expect(reports.length).toBe(0)
    })

    test('does not report for emoji string (causes btoa to throw)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('test\ud83c\udf89'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Unicode string (causes btoa to throw)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('\u65e5\u672c\u8a9e'))
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      expect(() => visitor.CallExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for non-CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression({
        type: 'Identifier',
        name: 'atob',
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for callee being null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type (not CallExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression({
        type: 'Literal',
        value: 'hello',
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for argument with no type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'atob' },
        arguments: [{ value: 'hello' }],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryAtobRule.create(ctx1)
      const visitor2 = noUnnecessaryAtobRule.create(ctx2)
      visitor1.CallExpression(makeAtobCall('hello'))
      visitor2.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'btoa' },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('hello'))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'btoa' },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 5),
      })
      visitor.CallExpression(makeAtobCall('world'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'atob' },
        arguments: [{ type: 'Literal', value: 'hello' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'atob' },
        arguments: [{ type: 'Literal', value: 'hello' }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('hello'))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'btoa' },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 5),
      })
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'atob' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 5),
      })
      visitor.CallExpression(makeAtobCall('world'))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'atob' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryAtobRule.create(context)
      const visitor2 = noUnnecessaryAtobRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryAtobRule.meta
      const meta2 = noUnnecessaryAtobRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'atob' },
        arguments: [{ type: 'Literal', value: 'extra' }],
        loc: makeLoc(1, 0, 1, 5),
        range: [0, 5],
        extra: true,
        flags: 'g',
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'atob' },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'atob' },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      const node = makeAtobCall('hello')
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryAtobRule).toBeDefined()
      expect(typeof noUnnecessaryAtobRule.create).toBe('function')
      expect(typeof noUnnecessaryAtobRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'atob' },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 5),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('hello'))
      visitor.CallExpression(makeAtobCall('world'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression(makeAtobCall('hello', 10, 4, 10, 15))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('arguments as non-array does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'atob' },
        arguments: 'not an array',
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('arguments missing does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'atob' },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('callee with name but no type does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { name: 'atob' },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('argument value is null does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'atob' },
        arguments: [{ type: 'Literal', value: null }],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('argument value is undefined does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAtobRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'atob' },
        arguments: [{ type: 'Literal', value: undefined }],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })
  })
})
